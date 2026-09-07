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
import type { ConversationContext } from "../../schemas/conversation";
import type { ProposalWorkflowState } from "../../schemas/workflow-state";
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
import { buildPreparationMessages, type PreparationAnswer } from "./build-messages";
import { languageDerivationPromptV1 } from "./prompts/language-derivation-prompt.v1";
import { preparationSystemPromptV1 } from "./prompts/preparation-system-prompt.v1";

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
  const toolContext = { runId, traceId: runId, companyId: input.companyId, catalog: input.catalog };
  let language = input.language;
  let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  const messageInput = {
    brief: input.brief,
    catalogLanguages: languages,
    language,
    ...(input.answers === undefined ? {} : { answers: input.answers }),
    ...(input.state?.currentProposition === undefined ? {} : { currentProposition: input.state.currentProposition }),
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
    }, deps);
    usage = derivation.usage;
    if (derivation.status === "failed") return { run: derivation, retrieval: input.state?.currentProposition ? seedRetrievalRecord(input.state.currentProposition) : emptyRetrievalRecord(), language: null, usage };
    const resolution = resolveLanguage(derivation.output.language, languages);
    language = resolution.kind === "resolved" ? resolution.language : null;
  }

  let retrieval = input.state?.currentProposition
    ? seedRetrievalRecord(input.state.currentProposition)
    : emptyRetrievalRecord();
  const tools = recordingTools((next) => { retrieval = next; }, () => retrieval);
  const mainMessages = buildPreparationMessages({ ...messageInput, language });
  const mainBudgets: RunBudgets = {
    ...budgets,
    wallTimeMs: Math.max(0, budgets.wallTimeMs - (deps.now() - startedAt)),
    maxTokens: Math.max(0, budgets.maxTokens - (usage.totalTokens ?? 0)),
  };
  const main = await run({
    system: preparationSystemPromptV1({ mode: input.mode, language, catalogLanguages: languages, clarificationAllowed: input.allowClarification }),
    initialMessages: mainMessages,
    tools,
    outputSchema: agentOutputSchemaFor({ mode: input.mode, allowClarification: input.allowClarification }),
    toolContext: { ...toolContext, language },
    budgets: mainBudgets,
  }, deps);
  const combinedUsage = addUsage(usage, main.usage);
  return { run: { ...main, usage: combinedUsage }, retrieval, language, usage: combinedUsage };
}
