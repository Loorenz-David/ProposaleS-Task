import "server-only";

import { z } from "zod";

import { ValidationError } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";
import type { Logger } from "@/lib/logger";
import type { ProposalesClient, CompanyInfo, ContentItem } from "@/lib/proposales";
import type { AiClient } from "@/lib/ai";
import type { RunBudgets, RunFailureReason, RunIssue } from "@/lib/agent/types";
import { formatIsoTimestamp } from "@/lib/values/timestamp";

import { agentOutputSchemaFor, type AgentClarification } from "../../schemas/agent-output";
import { MAX_CLARIFICATION_QUESTIONS, type ClarificationQuestion } from "../../schemas/clarification";
import type { ConversationContext } from "../../schemas/conversation";
import { INFORMATION_ITEM_KEYS, type InformationItemKey } from "../../schemas/information-items";
import { propositionSchema, type Proposition } from "../../schemas/proposition";
import { MAX_BRIEF_CHARS, boundedText } from "../../schemas/shared";
import type { DomainResult, RenderableStatus, RunReport, TurnResult } from "../../schemas/turn-result";
import { parseProposalWorkflowState, type ProposalWorkflowState } from "../../schemas/workflow-state";
import { runPreparationAgent } from "../agent/preparation.agent";
import type { PreparationAnswer } from "../agent/build-messages";
import { assembleProposition } from "../domain/assemble-proposition";
import { nextVersion } from "../domain/bump-version";
import { appendTurns, assistantTurn, renderAssistantTurn } from "../domain/conversation";
import { deriveItemResolutions, INFORMATION_REGISTRY, initialItems } from "../domain/information-registry";
import { resolveLanguage } from "../domain/resolve-language";
import { validateAgentOutput } from "../domain/validate-agent-output";
import { catalogLanguages } from "../domain/rank-candidates";
import { parseConversationInput } from "./edit-proposition";
import { defaultDeps } from "./default-deps";

const prepareFromBriefInputSchema = z.strictObject({
  brief: boundedText(MAX_BRIEF_CHARS),
  state: z.unknown().optional(),
  conversation: z.unknown().optional(),
});

const QUESTION_TEXT: Record<InformationItemKey, string> = {
  language: "Which catalog language should this proposal use?",
  title: "What title should the proposal use?",
  block_selection: "Which content should the proposal include?",
  sold_scope: "What products or services should the proposal cover?",
  recipient_identity: "Who should receive this proposal?",
  quantities: "Which quantities should the proposal use?",
  recipient_contact_detail: "Which recipient contact details should be included?",
  description_narrative: "What description should the proposal use?",
  block_comments: "Which reviewer comments should the blocks include?",
  deadline_and_terms_notes: "Which deadline or terms notes should be included?",
};

export type PrepareDeps = {
  proposales: ProposalesClient;
  ai: AiClient;
  now: () => number;
  newGenerationId: () => string;
  newQuestionId: () => string;
  newTurnId: () => string;
  newRunId: () => string;
  logger: Logger;
  editorOrigin: string;
  budgets?: RunBudgets;
};

type CompleteInput = {
  state: ProposalWorkflowState;
  conversation: ConversationContext;
  catalog: ContentItem[];
  company: CompanyInfo;
  answers?: PreparationAnswer[];
  allowClarification: boolean;
};

function knownString(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  if (!("known" in value) || value.known !== true || !("value" in value) || typeof value.value !== "string") return null;
  return value.value;
}

function questionsFor(
  values: ReadonlyArray<{ itemKey: InformationItemKey; text: string }>,
  deps: Pick<PrepareDeps, "newQuestionId">,
): ClarificationQuestion[] {
  return values.slice(0, MAX_CLARIFICATION_QUESTIONS).map((question) => ({ ...question, questionId: deps.newQuestionId() }));
}

function openAskQuestions(state: ProposalWorkflowState) {
  return INFORMATION_ITEM_KEYS
    .filter((key) => INFORMATION_REGISTRY[key].askPolicy === "ask_if_underivable" && state.items[key].resolution === "unresolved")
    .map((itemKey) => ({ itemKey, text: QUESTION_TEXT[itemKey] }));
}

function modelQuestions(output: AgentClarification) {
  return output.questions.map((question) => ({ itemKey: question.itemKey, text: question.text }));
}

function mergeLanguageQuestion(values: ReadonlyArray<{ itemKey: InformationItemKey; text: string }>) {
  return [
    { itemKey: "language" as const, text: QUESTION_TEXT.language },
    ...values.filter((question) => question.itemKey !== "language"),
  ].slice(0, MAX_CLARIFICATION_QUESTIONS);
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

function appendAssistant(
  state: ProposalWorkflowState,
  conversation: ConversationContext,
  result: Extract<DomainResult, { status: RenderableStatus }>,
  run: RunReport,
  deps: Pick<PrepareDeps, "newTurnId" | "now">,
  proposition?: Proposition,
): TurnResult {
  const at = formatIsoTimestamp(new Date(deps.now()));
  const turn = assistantTurn({
    turnId: deps.newTurnId(),
    at,
    kind: result.status,
    text: renderAssistantTurn(result, proposition),
    ...(result.status === "proposition" ? { propositionVersion: result.proposition.version } : {}),
  });
  return { state, conversation: appendTurns(conversation, [turn]), result, run };
}

export async function completePreparationTurn(input: CompleteInput, deps: PrepareDeps): Promise<TurnResult> {
  const startingLanguage = knownString(input.state.currentProposition?.language);
  const agent = await runPreparationAgent({
    mode: "prepare",
    brief: input.state.brief.text,
    state: input.state,
    conversation: input.conversation,
    answers: input.answers,
    catalog: input.catalog,
    companyId: input.company.companyId,
    language: startingLanguage,
    allowClarification: input.allowClarification,
    budgets: deps.budgets,
  }, deps);
  const report: RunReport = { provider: deps.ai.provider, model: deps.ai.model, usage: agent.usage };

  if (agent.run.status === "failed") {
    if (agent.run.failure.reason === "budget_exhausted") {
      const open = openAskQuestions(input.state);
      if (open.length > 0) {
        const questions = questionsFor(open, deps);
        const result: DomainResult = { status: "clarification", questions, budgetExhausted: { budget: agent.run.failure.budget! } };
        return appendAssistant({ ...input.state, clarification: { questions, answers: [] } }, input.conversation, result, report, deps);
      }
    }
    return appendAssistant(input.state, input.conversation, failureResult(agent.run.failure), report, deps);
  }

  const validated = validateAgentOutput(agent.run.output, {
    schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: input.allowClarification }),
    retrieval: agent.retrieval,
    answeredQuestionIds: (input.answers ?? []).filter((answer) => answer.answer.kind === "answer").map((answer) => answer.questionId),
    currentProposition: input.state.currentProposition,
  });
  if (!validated.ok) {
    return appendAssistant(input.state, input.conversation, failureResult({ reason: "model_output_invalid", issues: validated.issues }), report, deps);
  }

  const outputLanguage = validated.output.kind === "proposition" ? knownString(validated.output.language) : null;
  const language = resolveLanguage(outputLanguage ?? agent.language, catalogLanguages(input.catalog));

  if (validated.output.kind === "clarification" || (language.kind === "ask" && input.allowClarification)) {
    const requested = validated.output.kind === "clarification" ? modelQuestions(validated.output) : [];
    const merged = language.kind === "ask" ? mergeLanguageQuestion(requested) : requested;
    const questions = questionsFor(merged, deps);
    const result: DomainResult = { status: "clarification", questions };
    return appendAssistant({ ...input.state, clarification: { questions, answers: [] } }, input.conversation, result, report, deps);
  }

  if (validated.output.kind !== "proposition") {
    return appendAssistant(input.state, input.conversation, failureResult({
      reason: "model_output_invalid",
      issues: [{ path: ["kind"], message: "Expected a proposition." }],
    }), report, deps);
  }

  const assembled = assembleProposition(validated.output, {
    generationId: input.state.generationId,
    version: nextVersion(input.state),
    preparedAt: formatIsoTimestamp(new Date(deps.now())),
    retrieval: agent.retrieval,
    catalog: input.catalog,
    language: language.kind === "resolved" ? language.language : null,
    items: input.state.items,
    companyCurrency: input.company.currency,
  });
  const items = deriveItemResolutions(input.state.items, assembled);
  const proposition = propositionSchema.parse({
    ...assembled,
    unresolvedItems: [
      ...Object.entries(items).filter(([, item]) => item.resolution !== "supplied").map(([itemKey, item]) => ({ itemKey, resolution: item.resolution })),
      ...assembled.unresolvedItems.filter((item) => item.itemKey === "sold_scope"),
    ].filter((item, index, all) => all.findIndex((candidate) => candidate.itemKey === item.itemKey) === index),
  });
  const state = { ...input.state, items, preparedProposition: proposition, currentProposition: proposition };
  const result: DomainResult = { status: "proposition", proposition };
  return appendAssistant(state, input.conversation, result, report, deps, proposition);
}

export async function prepareFromBrief(input: unknown, deps: PrepareDeps = defaultDeps): Promise<TurnResult> {
  const parsed = prepareFromBriefInputSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError({ issues: zodIssues(parsed.error) });

  const inbound = parsed.data.state === undefined
    ? undefined
    : parseProposalWorkflowState(parsed.data.state, deps.editorOrigin);
  const conversation = parseConversationInput(parsed.data.conversation);
  const receivedAt = formatIsoTimestamp(new Date(deps.now()));
  const state: ProposalWorkflowState = inbound === undefined
    ? { generationId: deps.newGenerationId(), brief: { text: parsed.data.brief, receivedAt }, items: initialItems() }
    : { ...inbound, brief: { text: parsed.data.brief, receivedAt } };

  const [catalog, company] = await Promise.all([deps.proposales.listContent(), deps.proposales.getCompany()]);
  return completePreparationTurn({
    state,
    conversation,
    catalog,
    company,
    allowClarification: state.clarification === undefined,
  }, deps);
}
