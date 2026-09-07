import "server-only";

import { z } from "zod";

import type { RunFailureReason, RunIssue } from "@/lib/agent/types";
import { ValidationError } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";
import { formatIsoTimestamp } from "@/lib/values/timestamp";

import { agentOutputSchemaFor } from "../../schemas/agent-output";
import { propositionSchema, type Proposition } from "../../schemas/proposition";
import { MAX_INSTRUCTION_CHARS, boundedText } from "../../schemas/shared";
import type { DomainResult, RenderableStatus, RunReport, TurnResult } from "../../schemas/turn-result";
import { parseProposalWorkflowState, type ProposalWorkflowState } from "../../schemas/workflow-state";
import { runPreparationAgent } from "../agent/preparation.agent";
import { assembleProposition } from "../domain/assemble-proposition";
import { nextVersion } from "../domain/bump-version";
import { appendTurns, assistantTurn, humanTurn, renderAssistantTurn } from "../domain/conversation";
import { deriveItemResolutions } from "../domain/information-registry";
import { mergeRevision } from "../domain/merge-revision";
import { catalogLanguages } from "../domain/rank-candidates";
import { resolveLanguage } from "../domain/resolve-language";
import { validateAgentOutput } from "../domain/validate-agent-output";
import { defaultDeps } from "./default-deps";
import { parseConversationInput, type EditDeps } from "./edit-proposition";
import type { PrepareDeps } from "./prepare-from-brief";

const revisePropositionInputSchema = z.strictObject({
  state: z.unknown(),
  instruction: boundedText(MAX_INSTRUCTION_CHARS),
  conversation: z.unknown().optional(),
});

export type ReviseDeps = PrepareDeps & EditDeps;

function knownString(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  if (!("known" in value) || value.known !== true || !("value" in value) || typeof value.value !== "string") return null;
  return value.value;
}

function failureResult(failure: { reason: RunFailureReason; budget?: "wall_time" | "tool_calls" | "tokens"; issues?: RunIssue[] }): Extract<DomainResult, { status: "failed" }> {
  return {
    status: "failed",
    failure: {
      reason: failure.reason,
      code: failure.reason === "model_output_invalid" ? "validation_error" : "internal_error",
      ...(failure.budget === undefined ? {} : { budget: failure.budget }),
      ...(failure.issues === undefined ? {} : { issues: failure.issues }),
    },
  };
}

function withTurns(input: {
  state: ProposalWorkflowState;
  conversation: ReturnType<typeof parseConversationInput>;
  instruction: string;
  instructionTurnId: string;
  at: string;
  result: Extract<DomainResult, { status: RenderableStatus }>;
  run: RunReport;
  proposition?: Proposition;
}, deps: Pick<ReviseDeps, "newTurnId">): TurnResult {
  const human = humanTurn({ turnId: input.instructionTurnId, at: input.at, text: input.instruction });
  const assistant = assistantTurn({
    turnId: deps.newTurnId(),
    at: input.at,
    kind: input.result.status,
    text: renderAssistantTurn(input.result, input.proposition),
    ...(input.result.status === "proposition" ? { propositionVersion: input.result.proposition.version } : {}),
  });
  return {
    state: input.state,
    conversation: appendTurns(input.conversation, [human, assistant]),
    result: input.result,
    run: input.run,
  };
}

export async function reviseProposition(input: unknown, deps: ReviseDeps = defaultDeps): Promise<TurnResult> {
  const parsed = revisePropositionInputSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError({ issues: zodIssues(parsed.error) });

  const state = parseProposalWorkflowState(parsed.data.state, deps.editorOrigin);
  const conversation = parseConversationInput(parsed.data.conversation);
  if (state.currentProposition === undefined) {
    throw new ValidationError({
      reason: "domain_rule",
      issues: [{ path: ["state", "currentProposition"], message: "there is no proposition to revise yet" }],
    });
  }

  const instructionTurnId = deps.newTurnId();
  const at = formatIsoTimestamp(new Date(deps.now()));
  const [catalog, company] = await Promise.all([deps.proposales.listContent(), deps.proposales.getCompany()]);
  const languages = catalogLanguages(catalog);
  // A revision starts from the proposition's own language; a proposition whose language leaf is
  // absent falls back to the code derived earlier in this workflow, re-checked against this
  // catalog, rather than spending another inference to derive the same answer again.
  const carried = state.derivedLanguage;
  const startingLanguage = knownString(state.currentProposition.language)
    ?? (carried !== undefined && languages.includes(carried) ? carried : null);
  const agent = await runPreparationAgent({
    mode: "revise",
    brief: state.brief.text,
    state,
    conversation,
    instruction: { turnId: instructionTurnId, text: parsed.data.instruction },
    catalog,
    companyId: company.companyId,
    language: startingLanguage,
    allowClarification: false,
    budgets: deps.budgets,
    ...(deps.outputContract === undefined ? {} : { outputContract: deps.outputContract }),
  }, deps);
  const report: RunReport = { provider: deps.ai.provider, model: deps.ai.model, usage: agent.usage };
  const learned = agent.language !== null && languages.includes(agent.language)
    ? { derivedLanguage: agent.language }
    : {};

  if (agent.run.status === "failed") {
    return withTurns({
      state,
      conversation,
      instruction: parsed.data.instruction,
      instructionTurnId,
      at,
      result: failureResult(agent.run.failure),
      run: report,
    }, deps);
  }

  const validated = validateAgentOutput(agent.run.output, {
    schema: agentOutputSchemaFor({ mode: "revise", allowClarification: false }),
    retrieval: agent.retrieval,
    answeredQuestionIds: [],
    currentProposition: state.currentProposition,
    currentTurn: { turnId: instructionTurnId, text: parsed.data.instruction },
  });
  if (!validated.ok || validated.output.kind !== "proposition") {
    const issues = validated.ok
      ? [{ path: ["kind"], message: "Expected a proposition." }]
      : validated.issues;
    return withTurns({
      state,
      conversation,
      instruction: parsed.data.instruction,
      instructionTurnId,
      at,
      result: failureResult({ reason: "model_output_invalid", issues }),
      run: report,
    }, deps);
  }

  const candidateLanguage = knownString(validated.output.language) ?? agent.language;
  const language = resolveLanguage(candidateLanguage, languages);
  const assembled = assembleProposition(validated.output, {
    generationId: state.generationId,
    version: nextVersion(state),
    preparedAt: at,
    retrieval: agent.retrieval,
    catalog,
    language: language.kind === "resolved" ? language.language : null,
    items: state.items,
    companyCurrency: company.currency,
  });
  const { merged: initiallyMerged } = mergeRevision(state.currentProposition, assembled, validated.output.requestedOverrides);
  const items = deriveItemResolutions(state.items, initiallyMerged);
  const merged = propositionSchema.parse({
    ...initiallyMerged,
    unresolvedItems: [
      ...Object.entries(items)
        .filter(([, item]) => item.resolution !== "supplied")
        .map(([itemKey, item]) => ({ itemKey, resolution: item.resolution })),
      ...initiallyMerged.unresolvedItems.filter((item) => item.itemKey === "sold_scope"),
    ].filter((item, index, all) => all.findIndex((candidate) => candidate.itemKey === item.itemKey) === index),
  });
  const nextState = { ...state, ...learned, items, preparedProposition: merged, currentProposition: merged };
  const result: Extract<DomainResult, { status: "proposition" }> = { status: "proposition", proposition: merged };
  return withTurns({
    state: nextState,
    conversation,
    instruction: parsed.data.instruction,
    instructionTurnId,
    at,
    result,
    run: report,
    proposition: merged,
  }, deps);
}
