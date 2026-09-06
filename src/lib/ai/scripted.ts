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
} {
  const calls: GenerateStepInput[] = [];
  let index = 0;

  return {
    provider: "scripted",
    model: "scripted",
    calls,
    async generateStep(input) {
      calls.push(input);
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
