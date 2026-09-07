import "server-only";

import type { AiClient, Usage } from "@/lib/ai/types";
import type { ContentItem } from "@/lib/proposales";
import type { Logger } from "@/lib/logger";

export type ToolKind = "read" | "prepare" | "mutate";
export type ToolErrorCode = "invalid_arguments" | "invalid_tool_output" | "language_unresolved" | "unknown_tool";
export type RunFailureReason = "budget_exhausted" | "model_output_invalid" | "tool_output_invalid" | "script_exhausted";

export type ToolIssue = { path: string[]; message: string };
export type RunIssue = { path: string[]; message: string };

export type ToolContext = {
  runId: string;
  traceId: string;
  companyId: number;
  remainingBudget: RunBudgets;
  catalog: ContentItem[];
  language: string | null;
};

export type ToolInvokeResult<O> =
  | { ok: true; value: O }
  | { ok: false; error: { code: "invalid_arguments"; issues: ToolIssue[] } }
  | { ok: false; error: { code: "invalid_tool_output" } }
  | { ok: false; error: { code: "language_unresolved" } }
  | { ok: false; error: { code: "unknown_tool"; name: string } };

export type ToolDescriptor = {
  name: string;
  description: string;
  inputJsonSchema: Record<string, unknown>;
};

export type ToolDefinition<I, O> = {
  name: string;
  description: string;
  kind: ToolKind;
  descriptor: () => ToolDescriptor;
  invoke: (rawInput: unknown, ctx: ToolContext) => Promise<ToolInvokeResult<O>>;
};

export type RunBudgets = { wallTimeMs: number; maxToolCalls: number; maxTokens: number };
export type RecordedToolCall = { toolCallId: string; name: string; ok: boolean };

export type RunResult<O> =
  | { status: "output"; output: O; usage: Usage; toolCalls: RecordedToolCall[] }
  | {
      status: "failed";
      failure: { reason: RunFailureReason; budget?: "wall_time" | "tool_calls" | "tokens"; issues?: RunIssue[] };
      usage: Usage;
      toolCalls: RecordedToolCall[];
    };

export type RunDeps = { ai: AiClient; now: () => number; logger: Logger };

export type { AgentMessage } from "@/lib/ai/types";
