import { describe, expect, it } from "vitest";

import { createFailingAiClient, createScriptedAiClient } from "@/lib/ai/scripted";
import type { GenerateStepInput, GenerateStepResult } from "@/lib/ai/types";

const input: GenerateStepInput = { system: "system", messages: [], tools: [] };
const step = (output: unknown): GenerateStepResult => ({
  kind: "final",
  output,
  usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
});

describe("scripted AI clients", () => {
  it("C5(e): returns scripted steps, records exhaustion, and never mutates steps", async () => {
    const first = step({ value: 1 });
    const second = step({ value: 2 });
    const original = structuredClone([first, second]);
    const client = createScriptedAiClient([first, second]);

    await expect(client.generateStep(input, { timeoutMs: 1 })).resolves.toBe(first);
    await expect(client.generateStep(input, { timeoutMs: 1 })).resolves.toBe(second);
    await expect(client.generateStep(input, { timeoutMs: 1 })).rejects.toMatchObject({ reason: "script_exhausted" });
    expect(client.calls).toHaveLength(3);
    expect(client.stepOptions).toEqual([{ timeoutMs: 1 }, { timeoutMs: 1 }, { timeoutMs: 1 }]);
    expect([first, second]).toEqual(original);
  });

  it("C5(e): failing fake proves the model must not be called", async () => {
    const client = createFailingAiClient();

    await expect(client.generateStep(input, { timeoutMs: 1 })).rejects.toThrow("model must not be called");
  });
});
