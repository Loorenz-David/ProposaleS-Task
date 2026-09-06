import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

import { AiProviderError } from "@/lib/ai/errors";
import type { AiProvider, LanguageModelInstance } from "@/lib/ai/types";

export type ModelFactory = (apiKey: string) => (model: string) => LanguageModelInstance;

export const DEFAULT_FACTORIES = {
  anthropic: (apiKey: string) => createAnthropic({ apiKey }),
  openai: (apiKey: string) => createOpenAI({ apiKey }),
} satisfies Record<AiProvider, ModelFactory>;

export function resolveModel(
  input: { provider: AiProvider; model: string; apiKey: string },
  factories: Record<AiProvider, ModelFactory> = DEFAULT_FACTORIES,
): LanguageModelInstance {
  try {
    const providerFactory = factories[input.provider](input.apiKey);
    return providerFactory(input.model);
  } catch (cause) {
    throw new AiProviderError({
      reason: "not_configured",
      operation: "resolveModel",
      retryable: false,
      cause,
    });
  }
}
