import "server-only";

import type { AiClient, GenerateStepInput, GenerateStepResult } from "@/lib/ai/types";

class ScriptExhaustedError extends Error {
  readonly reason = "script_exhausted" as const;

  constructor() {
    super("scripted AI client exhausted its steps");
    this.name = "ScriptExhaustedError";
  }
}

export function createScriptedAiClient(steps: readonly GenerateStepResult[]): AiClient & {
  calls: GenerateStepInput[];
  stepOptions: Array<{ timeoutMs: number }>;
} {
  const calls: GenerateStepInput[] = [];
  const stepOptions: Array<{ timeoutMs: number }> = [];
  let index = 0;

  return {
    provider: "scripted",
    model: "scripted",
    calls,
    stepOptions,
    async generateStep(input, options) {
      calls.push(input);
      stepOptions.push(options);
      const step = steps[index];
      index += 1;
      if (step === undefined) throw new ScriptExhaustedError();
      return step;
    },
  };
}

export function createFailingAiClient(): AiClient {
  return {
    provider: "scripted",
    model: "scripted",
    async generateStep() {
      throw new Error("model must not be called");
    },
  };
}
