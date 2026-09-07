import "server-only";

import type { LanguageModel } from "ai";

export type AiProvider = "anthropic" | "openai";

export type LanguageModelInstance = Exclude<LanguageModel, string>;

export type Usage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
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

export type GenerateStepResult =
  | {
      kind: "tool_calls";
      calls: Array<{ toolCallId: string; name: string; input: unknown }>;
      usage: Usage;
    }
  | {
      kind: "final";
      output: unknown;
      usage: Usage;
    }
  | {
      kind: "invalid_output";
      reason: "provider_parse_failure";
      usage: Usage;
    };

export type AiClient = {
  provider: AiProvider | "scripted";
  model: string;
  generateStep(input: GenerateStepInput, options: { timeoutMs: number }): Promise<GenerateStepResult>;
};
