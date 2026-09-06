import "server-only";

export type {
  AiClient,
  AiProvider,
  AgentMessage,
  GenerateStepInput,
  GenerateStepResult,
  JsonSchema,
  LanguageModelInstance,
  ToolDescriptor,
  Usage,
} from "@/lib/ai/types";
export { AI_CALL_TIMEOUT_MS, DEFAULT_RUN_BUDGETS } from "@/lib/ai/config";
export { AiProviderError, AI_PROVIDER_FAILURE_REASONS, GENERIC_AI_ERROR_MESSAGE } from "@/lib/ai/errors";
export { createAiClient } from "@/lib/ai/client";
export { createFailingAiClient, createScriptedAiClient } from "@/lib/ai/scripted";
import { createAiClient } from "@/lib/ai/client";

export function getAiClient() {
  return createAiClient();
}
