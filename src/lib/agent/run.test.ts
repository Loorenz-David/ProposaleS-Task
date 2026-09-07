import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AI_CALL_TIMEOUT_MS } from "@/lib/ai/config";
import { createScriptedAiClient } from "@/lib/ai/scripted";
import type { GenerateStepResult } from "@/lib/ai/types";
import { defineTool } from "@/lib/agent/define-tool";
import { MAX_OUTPUT_RETRIES, run } from "@/lib/agent/run";
import type { AgentMessage, RunBudgets, RunDeps, ToolContext } from "@/lib/agent/types";

const outputSchema = z.strictObject({ answer: z.string() });
const output = { answer: "done" };
const baseBudgets: RunBudgets = { wallTimeMs: 1000, maxToolCalls: 5, maxTokens: 100 };
const baseContext: Omit<ToolContext, "remainingBudget"> = {
  runId: "run-1", traceId: "trace-1", companyId: 1, catalog: [], language: "en",
};

function usage(inputTokens: number | null = 1, outputTokens: number | null = 1, totalTokens: number | null = 2) {
  return { inputTokens, outputTokens, totalTokens };
}
function final(value: unknown, stepUsage = usage()): GenerateStepResult { return { kind: "final", output: value, usage: stepUsage }; }
function calls(...toolCalls: Array<{ toolCallId: string; name: string; input: unknown }>): GenerateStepResult { return { kind: "tool_calls", calls: toolCalls, usage: usage() }; }
function callsWithUsage(stepUsage: ReturnType<typeof usage>, ...toolCalls: Array<{ toolCallId: string; name: string; input: unknown }>): GenerateStepResult { return { kind: "tool_calls", calls: toolCalls, usage: stepUsage }; }
function logger() { return { info: vi.fn(), warn: vi.fn(), error: vi.fn() }; }
function deps(steps: readonly GenerateStepResult[], now: () => number = () => 0): RunDeps & { ai: ReturnType<typeof createScriptedAiClient> } {
  const ai = createScriptedAiClient(steps);
  return { ai, now, logger: logger() };
}
function executeRun(steps: readonly GenerateStepResult[], options: Partial<Parameters<typeof run>[0]> = {}, now: () => number = () => 0) {
  const dependencies = deps(steps, now);
  return run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext, budgets: baseBudgets, ...options }, dependencies).then((result) => ({ result, dependencies }));
}

describe("agent run", () => {
  it("C2(c) refuses a non-read tool set before the model call", async () => {
    const mutate = defineTool({ name: "write", description: "write", kind: "mutate", input: z.strictObject({}), output: z.strictObject({}), execute: async () => ({}) });
    const dependencies = deps([final(output)]);
    await expect(run({ system: "system", initialMessages: [], tools: [mutate], outputSchema, toolContext: baseContext }, dependencies)).rejects.toThrow("write");
    expect(dependencies.ai.calls).toHaveLength(0);
  });

  it("C3(a) enforces the tool-call budget and C3(d) discards the draft", async () => {
    const tool = defineTool({ name: "one", description: "one", kind: "read", input: z.strictObject({}), output: z.strictObject({ ok: z.boolean() }), execute: async () => ({ ok: true }) });
    const dependencies = deps([calls({ toolCallId: "1", name: "one", input: {} }), calls({ toolCallId: "2", name: "one", input: {} }), calls({ toolCallId: "3", name: "one", input: {} }), final(output)]);
    const result = await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext, budgets: { ...baseBudgets, maxToolCalls: 3 } }, dependencies);
    expect(result).toMatchObject({ status: "failed", failure: { reason: "budget_exhausted", budget: "tool_calls" } });
    expect(result).not.toHaveProperty("output");
    expect(dependencies.ai.calls).toHaveLength(3);
    expect(result.toolCalls).toEqual([
      { toolCallId: "1", name: "one", ok: true },
      { toolCallId: "2", name: "one", ok: true },
      { toolCallId: "3", name: "one", ok: true },
    ]);
  });

  it("C3(b) checks wall time at the exact boundary", async () => {
    let index = 0;
    const result = await executeRun([calls({ toolCallId: "clock", name: "missing", input: {} }), final(output)], { budgets: { ...baseBudgets, wallTimeMs: 10 } }, () => [0, 0, 0][index++] ?? 0);
    index = 0;
    const resultAtBoundary = await executeRun([calls({ toolCallId: "clock", name: "missing", input: {} }), final(output)], { budgets: { ...baseBudgets, wallTimeMs: 10 } }, () => [0, 0, 10][index++] ?? 10);
    expect(result.result.status).toBe("output");
    expect(resultAtBoundary.result).toMatchObject({ status: "failed", failure: { budget: "wall_time" } });
    expect(resultAtBoundary.dependencies.ai.calls).toHaveLength(1);
  });

  it("C3(c) checks the token budget before the next model call", async () => {
    const result = await executeRun([calls({ toolCallId: "1", name: "missing", input: {} }), final(output)], { budgets: { ...baseBudgets, maxTokens: 1 } });
    expect(result.result).toMatchObject({ status: "failed", failure: { reason: "budget_exhausted", budget: "tokens" } });
    expect(result.dependencies.ai.calls).toHaveLength(1);
  });

  it("C3(e) checks the tool-call budget before each dispatch", async () => {
    const execute = vi.fn(async () => ({ ok: true }));
    const tool = defineTool({ name: "one", description: "one", kind: "read", input: z.strictObject({}), output: z.strictObject({ ok: z.boolean() }), execute });
    const dependencies = deps([calls({ toolCallId: "1", name: "one", input: {} }, { toolCallId: "2", name: "one", input: {} })]);
    const result = await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext, budgets: { ...baseBudgets, maxToolCalls: 1 } }, dependencies);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ status: "failed", failure: { budget: "tool_calls" } });
  });

  it("C3(f) binds the per-call timeout to the remaining wall time when that is the smaller term", async () => {
    let index = 0;
    const dependencies = deps([final(output)], () => [0, 0, 500][index++] ?? 500);
    await run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext, budgets: { ...baseBudgets, wallTimeMs: AI_CALL_TIMEOUT_MS + 60_000 } }, dependencies);
    expect(dependencies.ai.stepOptions[0].timeoutMs).toBe(AI_CALL_TIMEOUT_MS);

    index = 0;
    const bound = deps([final(output)], () => [0, 0, 500][index++] ?? 500);
    await run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext, budgets: { ...baseBudgets, wallTimeMs: 1000 } }, bound);
    expect(bound.ai.stepOptions[0].timeoutMs).toBe(500);
  });

  it("C3(i) keeps a positive timeout when the clock moves after the budget check", async () => {
    let index = 0;
    const dependencies = deps([final(output)], () => [0, 0, 100][index++] ?? 100);
    await run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext, budgets: { ...baseBudgets, wallTimeMs: 100 } }, dependencies);
    expect(dependencies.ai.stepOptions[0].timeoutMs).toBe(1);
  });

  it("C3(g) reports wall time first when two budgets are exhausted", async () => {
    let index = 0;
    const result = await executeRun([final({ wrong: true }, usage(1, 100, 101))], { budgets: { wallTimeMs: 10, maxToolCalls: 5, maxTokens: 100 } }, () => [0, 0, 10][index++] ?? 10);
    expect(result.result).toMatchObject({ status: "failed", failure: { budget: "wall_time" } });
  });

  it("C3(h) gives tools a fresh remaining budget", async () => {
    const seen: number[] = [];
    const tool = defineTool({ name: "budget", description: "budget", kind: "read", input: z.strictObject({}), output: z.strictObject({ value: z.boolean() }), execute: async (_input, ctx) => { seen.push(ctx.remainingBudget.maxToolCalls); return { value: true }; } });
    const dependencies = deps([calls({ toolCallId: "1", name: "budget", input: {} }), calls({ toolCallId: "2", name: "budget", input: {} }), final(output)]);
    await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext, budgets: { ...baseBudgets, maxToolCalls: 5 } }, dependencies);
    expect(seen[1]).toBeLessThan(seen[0]);
    expect(seen.every((value) => value < 5)).toBe(true);
  });

  it("C4(a) accumulates usage on a successful output", async () => {
    const tool = defineTool({ name: "one", description: "one", kind: "read", input: z.strictObject({}), output: z.strictObject({ ok: z.boolean() }), execute: async () => ({ ok: true }) });
    const dependencies = deps([callsWithUsage(usage(10, 5, 15), { toolCallId: "1", name: "one", input: {} }), final(output, usage(20, 10, 30))]);
    const result = await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext }, dependencies);
    expect(result).toEqual(expect.objectContaining({ usage: { inputTokens: 30, outputTokens: 15, totalTokens: 45 } }));
  });

  it("C4(b) accumulates usage on failure", async () => {
    const { result } = await executeRun([calls({ toolCallId: "1", name: "missing", input: {} }), calls({ toolCallId: "2", name: "missing", input: {} })], { budgets: { ...baseBudgets, maxToolCalls: 2 } });
    expect(result).toMatchObject({ status: "failed", usage: { inputTokens: 2, outputTokens: 2, totalTokens: 4 } });
  });

  it("C4(c) propagates an unreported usage field as null", async () => {
    const { result } = await executeRun([calls({ toolCallId: "1", name: "missing", input: {} }), final(output, usage(null, 10, 30))]);
    expect(result).toMatchObject({ usage: { inputTokens: null, outputTokens: 11, totalTokens: 32 } });
  });

  it("C4(d) keeps a separate numeric token budget counter", async () => {
    const unreportedCall: GenerateStepResult = { kind: "tool_calls", calls: [{ toolCallId: "1", name: "missing", input: {} }], usage: usage(null, null, null) };
    const reportedCall: GenerateStepResult = { kind: "tool_calls", calls: [{ toolCallId: "2", name: "missing", input: {} }], usage: usage(1, 1, 6) };
    const result = await executeRun([unreportedCall, reportedCall], { budgets: { ...baseBudgets, maxTokens: 5 } });
    expect(result.result).toMatchObject({ status: "failed", failure: { budget: "tokens" }, usage: { totalTokens: null } });
  });

  it("C5(a) retries invalid structured output once with issue paths", async () => {
    const { result, dependencies } = await executeRun([final("{\"answer\":\"partial"), final(output)]);
    expect(result).toMatchObject({ status: "output", output });
    expect(dependencies.ai.calls).toHaveLength(2);
    expect((dependencies.ai.calls[1].messages.at(-1) as { content: string }).content).toContain(JSON.stringify([{ path: [] }]));

    const nestedSchema = z.strictObject({ items: z.array(z.strictObject({ answer: z.string() })) });
    const nestedDependencies = deps([final({ items: [{ answer: 5 }] }), final({ items: [{ answer: "done" }] })]);
    const nestedResult = await run({ system: "system", initialMessages: [], tools: [], outputSchema: nestedSchema, toolContext: baseContext, budgets: baseBudgets }, nestedDependencies);
    expect(nestedResult).toMatchObject({ status: "output" });
    expect(nestedDependencies.ai.calls).toHaveLength(2);
    expect((nestedDependencies.ai.calls[1].messages.at(-1) as { content: string }).content).toContain(JSON.stringify([{ path: ["items", "0", "answer"] }]));
  });

  it("C5(b) fails after the bounded invalid-output retries with string paths", async () => {
    const nestedSchema = z.strictObject({ items: z.array(z.strictObject({ answer: z.string() })) });
    const invalidObject = { items: [{ answer: 5 }] };
    const dependencies = deps([final(invalidObject), final(invalidObject)]);
    const result = await run({ system: "system", initialMessages: [], tools: [], outputSchema: nestedSchema, toolContext: baseContext, budgets: baseBudgets }, dependencies);
    expect(result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid", issues: expect.any(Array) } });
    if (result.status === "failed") {
      expect(result.failure.issues?.[0]?.path).toEqual(["items", "0", "answer"]);
      expect(result.failure.issues?.length).toBeGreaterThan(0);
    }
  });

  it("C5(c) stops at one retry and does not exhaust the scripted client", async () => {
    const { result, dependencies } = await executeRun([final({ answer: 1 }), final({ answer: 2 }), final({ answer: 3 }), final(output)]);
    expect(result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid" } });
    expect(dependencies.ai.calls).toHaveLength(MAX_OUTPUT_RETRIES + 1);
  });

  it("C5(d) does not send or report model text", async () => {
    const sentinel = "MODEL-TEXT-SENTINEL";
    const { result, dependencies } = await executeRun([final(sentinel), final({ answer: 1 })]);
    expect((dependencies.ai.calls[1].messages.at(-1) as { content: string }).content).not.toContain(sentinel);
    expect(JSON.stringify(result)).not.toContain(sentinel);
  });

  it("C7(a) appends correlated tool results as labeled messages", async () => {
    const tool = defineTool({ name: "echo", description: "echo", kind: "read", input: z.strictObject({}), output: z.strictObject({ answer: z.string() }), execute: async () => ({ answer: "tool-value" }) });
    const dependencies = deps([calls({ toolCallId: "tc-1", name: "echo", input: {} }), final(output)]);
    await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext }, dependencies);
    const messages = dependencies.ai.calls[1].messages;
    expect(messages.at(-2)).toEqual({ role: "assistant", toolCalls: [{ toolCallId: "tc-1", name: "echo", input: {} }] });
    expect(messages.at(-1)).toEqual({ role: "tool", results: [{ toolCallId: "tc-1", name: "echo", output: { answer: "tool-value" } }] });
  });

  it("C7(b) returns a bad tool call to the model and continues", async () => {
    const { searchContentTool } = await import("@/features/proposal-preparation/server/tools/search-content.tool");
    const dependencies = deps([calls({ toolCallId: "tc-1", name: "search_content", input: { query: 5 } }), final(output)]);
    const result = await run({ system: "system", initialMessages: [], tools: [searchContentTool], outputSchema, toolContext: baseContext }, dependencies);
    expect(result.status).toBe("output");
    expect(dependencies.ai.calls).toHaveLength(2);
    expect(dependencies.ai.calls[1].messages.at(-1)).toMatchObject({ role: "tool", results: [{ toolCallId: "tc-1", output: { error: { code: "invalid_arguments", issues: [{ path: ["query"], message: "Invalid input: expected string, received number" }] } } }] });
  });

  it("C7(c) ends on invalid tool output", async () => {
    const tool = defineTool({ name: "bad", description: "bad", kind: "read", input: z.strictObject({}), output: z.strictObject({ answer: z.string() }), execute: async () => ({ wrong: true }) as unknown as { answer: string } });
    const dependencies = deps([calls({ toolCallId: "tc-1", name: "bad", input: {} }), final(output)]);
    const result = await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext }, dependencies);
    expect(result).toMatchObject({ status: "failed", failure: { reason: "tool_output_invalid" } });
    expect(dependencies.ai.calls).toHaveLength(1);
  });

  it("C7(e) sends the run's system prompt, initial messages, tool descriptors and output schema to the model", async () => {
    const tool = defineTool({ name: "echo", description: "echo", kind: "read", input: z.strictObject({}), output: z.strictObject({ answer: z.string() }), execute: async () => ({ answer: "tool-value" }) });
    const seed: AgentMessage[] = [{ role: "user", content: "SEED-MESSAGE" }];
    const dependencies = deps([final(output)]);
    await run({ system: "SYSTEM-PROMPT-SENTINEL", initialMessages: seed, tools: [tool], outputSchema, toolContext: baseContext, budgets: baseBudgets }, dependencies);
    const request = dependencies.ai.calls[0];
    expect(request.system).toBe("SYSTEM-PROMPT-SENTINEL");
    expect(request.messages).toEqual(seed);
    expect(request.tools).toEqual([tool.descriptor()]);
    expect(request.outputJsonSchema).toEqual(z.toJSONSchema(outputSchema, { io: "input" }));
  });

  it("C7(d) logs operational ids and counts without model text", async () => {
    const log = logger();
    const dependencies = deps([final("MODEL-TEXT-SENTINEL"), final(output)]);
    dependencies.logger = log;
    const result = await run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext }, dependencies);
    expect(result.status).toBe("output");
    const records = [...log.info.mock.calls, ...log.warn.mock.calls, ...log.error.mock.calls];
    const start = records.find(([event]) => event === "agent.run.start");
    const end = records.find(([event]) => event === "agent.run.end");
    expect(start?.[1]).toMatchObject({ runId: "run-1", traceId: "trace-1" });
    expect(end?.[1]).toMatchObject({ runId: "run-1", traceId: "trace-1", toolCallCount: 0 });
    expect(records.filter(([event]) => event === "agent.run.step")).toHaveLength(2);
    expect(JSON.stringify(records)).not.toContain("MODEL-TEXT-SENTINEL");

    const withTool = logger();
    const tool = defineTool({ name: "echo", description: "echo", kind: "read", input: z.strictObject({}), output: z.strictObject({ answer: z.string() }), execute: async () => ({ answer: "tool-value" }) });
    const toolDeps = deps([calls({ toolCallId: "tc-1", name: "echo", input: {} }), final(output)]);
    toolDeps.logger = withTool;
    await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext }, toolDeps);
    expect(withTool.info.mock.calls.find(([event]) => event === "agent.run.end")?.[1]).toMatchObject({ toolCallCount: 1 });
  });

  it("C7(f) logs each tool name and injected duration", async () => {
    let clock = 0;
    const tool = defineTool({ name: "echo", description: "echo", kind: "read", input: z.strictObject({}), output: z.strictObject({ answer: z.string() }), execute: async () => { clock = 25; return { answer: "tool-value" }; } });
    const log = logger();
    const dependencies = deps([calls({ toolCallId: "tc-1", name: "echo", input: {} }), final(output)], () => clock);
    dependencies.logger = log;
    await run({ system: "system", initialMessages: [], tools: [tool], outputSchema, toolContext: baseContext }, dependencies);
    const records = log.info.mock.calls;
    expect(records.find(([event]) => event === "agent.run.tool")?.[1]).toEqual({ runId: "run-1", traceId: "trace-1", toolCallId: "tc-1", name: "echo", ok: true, durationMs: 25 });
    expect(records.find(([event]) => event === "agent.run.end")?.[1]).toMatchObject({ durationMs: 25 });

    const failureLog = logger();
    const failureDeps = deps([calls({ toolCallId: "tc-failure", name: "missing_tool", input: {} }), final(output)]);
    failureDeps.logger = failureLog;
    await run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext }, failureDeps);
    expect(failureLog.info.mock.calls.find(([event]) => event === "agent.run.tool")?.[1]).toEqual({
      runId: "run-1",
      traceId: "trace-1",
      toolCallId: "tc-failure",
      name: "missing_tool",
      ok: false,
      durationMs: 0,
    });
  });

  it("C7(g) reports a missing tool truthfully and continues", async () => {
    const dependencies = deps([calls({ toolCallId: "tc-1", name: "search_proposals", input: {} }), final(output)]);
    const result = await run({ system: "system", initialMessages: [], tools: [], outputSchema, toolContext: baseContext }, dependencies);
    expect(result).toMatchObject({ status: "output" });
    expect(dependencies.ai.calls).toHaveLength(2);
    expect(dependencies.ai.calls[1].messages.at(-1)).toEqual({ role: "tool", results: [{ toolCallId: "tc-1", name: "search_proposals", output: { error: { code: "unknown_tool", name: "search_proposals" } } }] });
  });
});
