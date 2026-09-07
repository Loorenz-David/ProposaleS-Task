import "server-only";

import { run } from "@/lib/agent/run";
import type { RunBudgets, RunResult, ToolDefinition } from "@/lib/agent/types";
import { DEFAULT_RUN_BUDGETS, type AiClient, type Usage } from "@/lib/ai";
import type { Logger } from "@/lib/logger";
import type { ContentItem } from "@/lib/proposales";

import {
  agentOutputSchemaFor,
  languageDerivationOutputSchema,
  type AgentMode,
  type AgentOutput,
} from "../../schemas/agent-output";
import { modelOutputSchemaFor, type ModelOutput } from "../../schemas/model-output";
import type { ConversationContext } from "../../schemas/conversation";
import type { ProposalWorkflowState } from "../../schemas/workflow-state";
import { aliasFor, buildEvidenceRecord } from "../domain/evidence-record";
import { toModelPropositionView } from "../domain/model-view";
import { normalizeModelOutput } from "../domain/normalize-model-output";
import { catalogLanguages } from "../domain/rank-candidates";
import {
  emptyRetrievalRecord,
  extendRetrievalRecord,
  seedRetrievalRecord,
  type RetrievalRecord,
} from "../domain/retrieval-record";
import { resolveLanguage } from "../domain/resolve-language";
import { getContentTool } from "../tools/get-content.tool";
import { searchContentTool } from "../tools/search-content.tool";
import { buildPreparationMessages, type PreparationAnswer, type RenderedAnswer } from "./build-messages";
import { languageDerivationPromptV1 } from "./prompts/language-derivation-prompt.v1";
import { preparationSystemPromptV1 } from "./prompts/preparation-system-prompt.v1";
import { preparationSystemPromptV2 } from "./prompts/preparation-system-prompt.v2";

function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens === null || b.inputTokens === null ? null : a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens === null || b.outputTokens === null ? null : a.outputTokens + b.outputTokens,
    totalTokens: a.totalTokens === null || b.totalTokens === null ? null : a.totalTokens + b.totalTokens,
  };
}

function recordTool<O>(tool: ToolDefinition<unknown, O>, onValue: (value: O) => void): ToolDefinition<unknown, unknown> {
  return {
    name: tool.name,
    description: tool.description,
    kind: tool.kind,
    descriptor: tool.descriptor,
    invoke: async (rawInput, ctx) => {
      const result = await tool.invoke(rawInput, ctx);
      if (result.ok) onValue(result.value);
      return result;
    },
  };
}

function recordingTools(update: (record: RetrievalRecord) => void, read: () => RetrievalRecord): ToolDefinition<unknown, unknown>[] {
  return [
    recordTool(searchContentTool, (value) => update(extendRetrievalRecord(read(), value.candidates))),
    recordTool(getContentTool, (value) => {
      if (value.item !== null) update(extendRetrievalRecord(read(), [value.item]));
    }),
  ];
}

/**
 * Which contract the model answers in.
 *
 * `compact` is the one in use: the model states values and the evidence for them, and
 * `normalizeModelOutput` builds the domain proposition from that. `rich` is the previous contract,
 * in which the model serialized the domain proposition itself, kept for one migration step so the
 * change can be reverted at this seam without reverting the code around it. Both produce the same
 * `AgentOutput` and both are validated identically downstream.
 */
export type OutputContract = "compact" | "rich";

export type PreparationAgentInput = {
  mode: AgentMode;
  brief: string;
  state?: ProposalWorkflowState;
  conversation: ConversationContext;
  instruction?: { turnId: string; text: string };
  answers?: PreparationAnswer[];
  catalog: ContentItem[];
  companyId: number;
  language: string | null;
  allowClarification: boolean;
  budgets?: RunBudgets;
  outputContract?: OutputContract;
};

export type PreparationAgentDeps = {
  ai: AiClient;
  now: () => number;
  logger: Logger;
  newRunId: () => string;
};

export async function runPreparationAgent(
  input: PreparationAgentInput,
  deps: PreparationAgentDeps,
): Promise<{ run: RunResult<AgentOutput>; retrieval: RetrievalRecord; language: string | null; usage: Usage }> {
  const startedAt = deps.now();
  const budgets = input.budgets ?? DEFAULT_RUN_BUDGETS;
  const languages = catalogLanguages(input.catalog);
  const runId = deps.newRunId();
  const contract: OutputContract = input.outputContract ?? "compact";
  const toolContext = { runId, traceId: runId, companyId: input.companyId, catalog: input.catalog };
  let language = input.language;
  let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  let retrieval = input.state?.currentProposition
    ? seedRetrievalRecord(input.state.currentProposition)
    : emptyRetrievalRecord();

  // Built before the first call and read during it: `retrieval` is the live record the tools
  // extend, so an identity a later step returns resolves for output produced after it.
  const evidence = buildEvidenceRecord({
    brief: input.brief,
    ...(input.state?.clarification?.questions === undefined ? {} : { questions: input.state.clarification.questions }),
    ...(input.answers === undefined ? {} : { answers: input.answers }),
    ...(input.instruction === undefined ? {} : { instruction: input.instruction }),
    ...(input.state?.currentProposition === undefined ? {} : { currentProposition: input.state.currentProposition }),
    retrieval: () => retrieval,
  });

  // Under the compact contract the model reads the same vocabulary it answers in: answers are
  // named by the alias it must cite, and the proposition under revision is shown as the view
  // rather than as the stored object, whose wrappers and refs it must not copy.
  const answers: ReadonlyArray<RenderedAnswer> | undefined = input.answers === undefined
    ? undefined
    : input.answers.map((answer) => (contract === "rich"
      ? answer
      : { ...answer, ...(aliasFor(evidence, answer.questionId) === undefined ? {} : { label: aliasFor(evidence, answer.questionId)! }) }));
  const currentProposition = input.state?.currentProposition === undefined
    ? undefined
    : contract === "rich" ? input.state.currentProposition : toModelPropositionView(input.state.currentProposition);

  const messageInput = {
    brief: input.brief,
    catalogLanguages: languages,
    language,
    ...(answers === undefined ? {} : { answers }),
    ...(currentProposition === undefined ? {} : { currentProposition }),
    conversation: input.conversation,
    ...(input.instruction === undefined ? {} : { instruction: input.instruction }),
  };

  if (language === null) {
    const derivation = await run({
      system: languageDerivationPromptV1,
      initialMessages: buildPreparationMessages(messageInput),
      tools: [],
      outputSchema: languageDerivationOutputSchema,
      toolContext: { ...toolContext, language: null },
      budgets,
      label: "language_derivation",
    }, deps);
    usage = derivation.usage;
    if (derivation.status === "failed") return { run: derivation, retrieval: input.state?.currentProposition ? seedRetrievalRecord(input.state.currentProposition) : emptyRetrievalRecord(), language: null, usage };
    const resolution = resolveLanguage(derivation.output.language, languages);
    language = resolution.kind === "resolved" ? resolution.language : null;
  }

  const tools = recordingTools((next) => { retrieval = next; }, () => retrieval);
  const mainMessages = buildPreparationMessages({ ...messageInput, language });
  const mainBudgets: RunBudgets = {
    ...budgets,
    wallTimeMs: Math.max(0, budgets.wallTimeMs - (deps.now() - startedAt)),
    maxTokens: Math.max(0, budgets.maxTokens - (usage.totalTokens ?? 0)),
  };
  const promptInput = { mode: input.mode, language, catalogLanguages: languages, clarificationAllowed: input.allowClarification };
  const shared = {
    initialMessages: mainMessages,
    tools,
    toolContext: { ...toolContext, language },
    budgets: mainBudgets,
    label: "preparation",
  };
  const main = contract === "compact"
    ? await run<ModelOutput, AgentOutput>({
      ...shared,
      system: preparationSystemPromptV2(promptInput),
      outputSchema: modelOutputSchemaFor({ mode: input.mode, allowClarification: input.allowClarification }),
      // Inside the loop rather than after it: evidence that does not resolve is something the
      // model can be told about and correct, on the same bounded budget as a schema failure.
      refineOutput: (output) => {
        const normalized = normalizeModelOutput(output, evidence, { mode: input.mode, allowClarification: input.allowClarification });
        return normalized.ok ? { ok: true, value: normalized.output } : { ok: false, issues: normalized.issues };
      },
    }, deps)
    : await run<AgentOutput>({
      ...shared,
      system: preparationSystemPromptV1(promptInput),
      outputSchema: agentOutputSchemaFor({ mode: input.mode, allowClarification: input.allowClarification }),
    }, deps);
  const combinedUsage = addUsage(usage, main.usage);
  return { run: { ...main, usage: combinedUsage }, retrieval, language, usage: combinedUsage };
}
