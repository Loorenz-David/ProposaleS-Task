import "server-only";

import type { LanguageModel } from "ai";

export type AiProvider = "anthropic" | "openai";

export type LanguageModelInstance = Exclude<LanguageModel, string>;

export type Usage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

/**
 * Diagnostic counters the provider may report alongside `Usage`. They are deliberately not part of
 * `Usage`: that shape crosses to the browser inside `RunReport`, whose schema is strict and whose
 * three fields are a stated contract. These are operational only — the run loop logs them so a
 * payload measurement can tell a cached input from an uncached one, and a long call from a
 * reasoning-heavy one. A figure the provider did not report stays `null`, never 0.
 */
export type UsageDetail = {
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
};

export type JsonSchema = Record<string, unknown>;

export type ToolDescriptor = {
  name: string;
  description: string;
  inputJsonSchema: JsonSchema;
};

export type AgentMessage =
  | { role: "user" | "assistant"; content: string }
  | {
      role: "assistant";
      toolCalls: Array<{ toolCallId: string; name: string; input: unknown }>;
    }
  | {
      role: "tool";
      results: Array<{ toolCallId: string; name: string; output: unknown }>;
    };

export type GenerateStepInput = {
  system: string;
  messages: AgentMessage[];
  tools: ToolDescriptor[];
  outputJsonSchema?: JsonSchema;
};

export type GenerateStepResult = (
  | {
      kind: "tool_calls";
      calls: Array<{ toolCallId: string; name: string; input: unknown }>;
    }
  | {
      kind: "final";
      output: unknown;
    }
  | {
      kind: "invalid_output";
      reason: "provider_parse_failure";
    }
) & {
  usage: Usage;
  usageDetail?: UsageDetail;
};

export type AiClient = {
  provider: AiProvider | "scripted";
  model: string;
  generateStep(input: GenerateStepInput, options: { timeoutMs: number }): Promise<GenerateStepResult>;
};
