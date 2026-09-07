import "server-only";

import { z } from "zod";

import { AI_CALL_TIMEOUT_MS, DEFAULT_RUN_BUDGETS } from "@/lib/ai/config";
import type { AgentMessage, GenerateStepResult, JsonSchema, Usage } from "@/lib/ai/types";
import type { ToolDefinition, ToolContext, RunBudgets, RunDeps, RunResult, RecordedToolCall } from "@/lib/agent/types";

export const MAX_OUTPUT_RETRIES = 1;

type RunOptions<O> = {
  system: string;
  initialMessages: AgentMessage[];
  tools: readonly ToolDefinition<unknown, unknown>[];
  outputSchema: z.ZodType<O>;
  toolContext: Omit<ToolContext, "remainingBudget">;
  budgets?: RunBudgets;
  readOnly?: boolean;
};

function addUsage(current: Usage, next: Usage): Usage {
  return {
    inputTokens: current.inputTokens === null || next.inputTokens === null ? null : current.inputTokens + next.inputTokens,
    outputTokens: current.outputTokens === null || next.outputTokens === null ? null : current.outputTokens + next.outputTokens,
    totalTokens: current.totalTokens === null || next.totalTokens === null ? null : current.totalTokens + next.totalTokens,
  };
}

function zeroUsage(): Usage {
  return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
}

function issuePaths(issues: Array<{ path: PropertyKey[] }>): Array<{ path: string[] }> {
  return issues.map((issue) => ({ path: issue.path.map(String) }));
}

function assertReadOnlyToolSet(tools: readonly ToolDefinition<unknown, unknown>[]): void {
  const writeTools = tools.filter((tool) => tool.kind !== "read").map((tool) => tool.name);
  if (writeTools.length > 0) throw new Error(`tool set must contain only read tools: ${writeTools.join(", ")}`);
}

function remainingBudget(budgets: RunBudgets, elapsed: number, toolCalls: number, numericTokens: number): RunBudgets {
  return {
    wallTimeMs: Math.max(0, budgets.wallTimeMs - elapsed),
    maxToolCalls: Math.max(0, budgets.maxToolCalls - toolCalls),
    maxTokens: Math.max(0, budgets.maxTokens - numericTokens),
  };
}

export async function run<O>(
  options: RunOptions<O>,
  deps: RunDeps,
): Promise<RunResult<O>> {
  const budgets = options.budgets ?? DEFAULT_RUN_BUDGETS;
  if (options.readOnly !== false) assertReadOnlyToolSet(options.tools);

  const startedAt = deps.now();
  const messages = [...options.initialMessages];
  const recordedToolCalls: RecordedToolCall[] = [];
  let reportedUsage = zeroUsage();
  let numericTokens = 0;
  let outputRetries = 0;

  deps.logger.info("agent.run.start", { runId: options.toolContext.runId, traceId: options.toolContext.traceId, toolCount: options.tools.length });

  const finish = (result: RunResult<O>): RunResult<O> => {
    deps.logger.info("agent.run.end", {
      runId: options.toolContext.runId,
      traceId: options.toolContext.traceId,
      toolCallCount: recordedToolCalls.length,
      status: result.status,
      durationMs: deps.now() - startedAt,
    });
    return result;
  };

  const failure = (reason: "budget_exhausted" | "model_output_invalid" | "tool_output_invalid", budget?: "wall_time" | "tool_calls" | "tokens", issues?: Array<{ path: string[] }>): RunResult<O> =>
    finish({
      status: "failed",
      failure: { reason, ...(budget === undefined ? {} : { budget }), ...(issues === undefined ? {} : { issues }) },
      usage: reportedUsage,
      toolCalls: recordedToolCalls,
    });

  const budgetFailure = (): RunResult<O> | null => {
    const elapsed = deps.now() - startedAt;
    if (elapsed >= budgets.wallTimeMs) return failure("budget_exhausted", "wall_time");
    if (recordedToolCalls.length >= budgets.maxToolCalls) return failure("budget_exhausted", "tool_calls");
    if (numericTokens >= budgets.maxTokens) return failure("budget_exhausted", "tokens");
    return null;
  };

  const toolByName = new Map(options.tools.map((tool) => [tool.name, tool]));

  while (true) {
    const exhausted = budgetFailure();
    if (exhausted !== null) return exhausted;

    const elapsed = deps.now() - startedAt;
    const timeoutMs = Math.min(AI_CALL_TIMEOUT_MS, Math.max(1, budgets.wallTimeMs - elapsed));
    const request = {
      system: options.system,
      messages,
      tools: options.tools.map((tool) => tool.descriptor()),
      outputJsonSchema: z.toJSONSchema(options.outputSchema, { io: "input" }) as JsonSchema,
    };
    const step = await deps.ai.generateStep(request, { timeoutMs });
    reportedUsage = addUsage(reportedUsage, step.usage);
    numericTokens += step.usage.totalTokens ?? 0;
    deps.logger.info("agent.run.step", { runId: options.toolContext.runId, traceId: options.toolContext.traceId, kind: step.kind, toolCallCount: step.kind === "tool_calls" ? step.calls.length : 0, totalTokens: step.usage.totalTokens });

    if (step.kind === "final") {
      const parsed = options.outputSchema.safeParse(step.output);
      if (parsed.success) return finish({ status: "output", output: parsed.data, usage: reportedUsage, toolCalls: recordedToolCalls });

      const paths = issuePaths(parsed.error.issues);
      if (outputRetries < MAX_OUTPUT_RETRIES) {
        outputRetries += 1;
        messages.push({ role: "user", content: `The structured output was invalid. Correct these issue paths and return a valid structured output: ${JSON.stringify(paths)}` });
        continue;
      }
      return failure("model_output_invalid", undefined, paths);
    }

    const assistantToolCalls = step.calls.map((call) => ({ toolCallId: call.toolCallId, name: call.name, input: call.input }));
    messages.push({ role: "assistant", toolCalls: assistantToolCalls });
    const results: Array<{ toolCallId: string; name: string; output: unknown }> = [];

    for (const call of step.calls) {
      const beforeTool = budgetFailure();
      if (beforeTool !== null) return beforeTool;
      recordedToolCalls.push({ toolCallId: call.toolCallId, name: call.name, ok: false });
      const tool = toolByName.get(call.name);
      const ctx: ToolContext = {
        ...options.toolContext,
        remainingBudget: remainingBudget(budgets, deps.now() - startedAt, recordedToolCalls.length, numericTokens),
      };
      const toolStartedAt = deps.now();
      const result = tool === undefined
        ? { ok: false as const, error: { code: "unknown_tool" as const, name: call.name } }
        : await tool.invoke(call.input, ctx);
      const durationMs = deps.now() - toolStartedAt;
      if (result.ok) {
        recordedToolCalls[recordedToolCalls.length - 1] = { ...recordedToolCalls[recordedToolCalls.length - 1], ok: true };
        deps.logger.info("agent.run.tool", { runId: options.toolContext.runId, traceId: options.toolContext.traceId, toolCallId: call.toolCallId, name: call.name, ok: true, durationMs });
        results.push({ toolCallId: call.toolCallId, name: call.name, output: result.value });
        continue;
      }
      deps.logger.info("agent.run.tool", { runId: options.toolContext.runId, traceId: options.toolContext.traceId, toolCallId: call.toolCallId, name: call.name, ok: false, durationMs });
      if (result.error.code === "invalid_tool_output") return failure("tool_output_invalid");
      results.push({ toolCallId: call.toolCallId, name: call.name, output: { error: result.error } });
    }

    messages.push({ role: "tool", results });
  }
}
