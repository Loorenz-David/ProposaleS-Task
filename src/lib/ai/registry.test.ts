import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createAiClient } from "@/lib/ai/client";
import { AiProviderError, GENERIC_AI_ERROR_MESSAGE } from "@/lib/ai/errors";
import { DEFAULT_FACTORIES, resolveModel, type ModelFactory } from "@/lib/ai/registry";
import type { LanguageModelInstance } from "@/lib/ai/types";
import { parseServerEnv, serverEnvSchema } from "@/lib/env/server";

const fakeModel = {} as LanguageModelInstance;

function factoryMap(overrides: Partial<Record<"anthropic" | "openai", ModelFactory>> = {}) {
  return {
    anthropic: overrides.anthropic ?? (() => () => fakeModel),
    openai: overrides.openai ?? (() => () => fakeModel),
  } satisfies Record<"anthropic" | "openai", ModelFactory>;
}

function envFor(provider: "anthropic" | "openai") {
  return parseServerEnv({
    PROPOSALES_API_KEY: "test-placeholder-not-a-key",
    PROPOSALES_COMPANY_ID: "1",
    PROPOSALES_EDITOR_ORIGIN: "https://proposales.test",
    AI_PROVIDER: provider,
    AI_MODEL: "test-model",
    ANTHROPIC_API_KEY: provider === "anthropic" ? "anthropic-key" : undefined,
    OPENAI_API_KEY: provider === "openai" ? "openai-key" : undefined,
  });
}

describe("AI provider registry", () => {
  it("C1(a): resolves an Anthropic model instance, never a string", () => {
    const model = resolveModel({ provider: "anthropic", model: "m", apiKey: "k" });

    expect(typeof model).not.toBe("string");
    expect(model.modelId).toBe("m");
    expect(model.provider).toContain("anthropic");
  });

  it("C1(b): resolves an OpenAI model instance, never a string", () => {
    const model = resolveModel({ provider: "openai", model: "m", apiKey: "k" });

    expect(typeof model).not.toBe("string");
    expect(model.modelId).toBe("m");
    expect(model.provider).toContain("openai");
  });

  it("C2(a): never assigns the SDK global provider", async () => {
    const previous = globalThis.AI_SDK_DEFAULT_PROVIDER;
    try {
      delete globalThis.AI_SDK_DEFAULT_PROVIDER;
      const client = createAiClient(envFor("anthropic"), {
        resolveModel,
        generateText: async (request) => ({
          finishReason: "stop" as const,
          toolCalls: [],
          usage: {
            inputTokens: 1,
            inputTokenDetails: { noCacheTokens: 1, cacheReadTokens: undefined, cacheWriteTokens: undefined },
            outputTokens: 1,
            outputTokenDetails: { textTokens: 1, reasoningTokens: undefined },
            totalTokens: 2,
          },
          output: request.system,
        }),
      });

      expect(globalThis.AI_SDK_DEFAULT_PROVIDER).toBeUndefined();
      await client.generateStep({ system: "system", messages: [], tools: [] }, { timeoutMs: 100 });
      expect(globalThis.AI_SDK_DEFAULT_PROVIDER).toBeUndefined();
    } finally {
      if (previous === undefined) delete globalThis.AI_SDK_DEFAULT_PROVIDER;
      else globalThis.AI_SDK_DEFAULT_PROVIDER = previous;
    }
  });

  it("C2(b): finds no gateway or global-provider form in production modules", () => {
    const directory = join(process.cwd(), "src/lib/ai");
    const files = readdirSync(directory).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
    const forbidden = (source: string) =>
      /AI_SDK_DEFAULT_PROVIDER|@ai-sdk\/gateway|\bgateway\s*\(/.test(source);

    for (const file of files) {
      expect(forbidden(readFileSync(join(directory, file), "utf8")), file).toBe(false);
    }
  });

  it("C2(c): its scanner recognizes static, type-only, dynamic, and global forms", () => {
    const forbidden = (source: string) =>
      /AI_SDK_DEFAULT_PROVIDER|@ai-sdk\/gateway|\bgateway\s*\(/.test(source);
    const samples = [
      'import gateway from "@ai-sdk/gateway";',
      'import type { Gateway } from "@ai-sdk/gateway";',
      'await import("@ai-sdk/gateway");',
      "globalThis.AI_SDK_DEFAULT_PROVIDER",
    ];

    for (const sample of samples) expect(forbidden(sample)).toBe(true);
    expect(forbidden("const model = provider(modelId);")).toBe(false);
  });

  it("C2(d): every production module is server-only, including types.ts", () => {
    const directory = join(process.cwd(), "src/lib/ai");
    const files = readdirSync(directory).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));

    for (const file of files) {
      expect(readFileSync(join(directory, file), "utf8").split("\n")[0], file).toBe('import "server-only";');
    }
  });

  it("C3(a) and C4(l): translates a vendor factory-construction throw", () => {
    const cause = new Error("construction failed");
    const factories = factoryMap({ anthropic: () => { throw cause; } });

    expect(() => resolveModel({ provider: "anthropic", model: "m", apiKey: "k" }, factories)).toThrow(AiProviderError);
    try {
      resolveModel({ provider: "anthropic", model: "m", apiKey: "k" }, factories);
    } catch (error) {
      expect(error).toBeInstanceOf(AiProviderError);
      const mapped = error as AiProviderError;
      expect(mapped.message).toBe(GENERIC_AI_ERROR_MESSAGE);
      expect(mapped.details).toEqual({
        system: "ai_provider",
        retryable: false,
        reason: "not_configured",
        operation: "resolveModel",
      });
      expect(mapped.cause).toBe(cause);
    }
  });

  it("C3(c): translates a vendor model-invocation throw", () => {
    const cause = new Error("invocation failed");
    const factories = factoryMap({ anthropic: () => () => { throw cause; } });

    expect(() => resolveModel({ provider: "anthropic", model: "m", apiKey: "k" }, factories)).toThrow(AiProviderError);
    try {
      resolveModel({ provider: "anthropic", model: "m", apiKey: "k" }, factories);
    } catch (error) {
      expect((error as AiProviderError).details).toMatchObject({ reason: "not_configured", operation: "resolveModel" });
      expect((error as AiProviderError).cause).toBe(cause);
    }
  });

  it("C3(b): registry keys are exactly the configured environment providers", () => {
    const providers = serverEnvSchema.shape.AI_PROVIDER.options;
    expect(new Set(Object.keys(DEFAULT_FACTORIES))).toEqual(new Set(providers));

    for (const provider of providers) {
      const model = resolveModel({ provider, model: "m", apiKey: "k" });
      expect(typeof model).toBe("object");
    }
  });
});
