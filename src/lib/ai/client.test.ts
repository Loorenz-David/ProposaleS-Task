import {
  APICallError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  type LanguageModelUsage,
} from "ai";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { callModel, createAiClient, type GenerateTextDependency } from "@/lib/ai/client";
import { AiProviderError } from "@/lib/ai/errors";
import { resolveModel } from "@/lib/ai/registry";
import type { AiClientDeps } from "@/lib/ai/client";
import { parseServerEnv } from "@/lib/env/server";
import type { GenerateStepInput, LanguageModelInstance } from "@/lib/ai/types";

type SdkResult = Awaited<ReturnType<GenerateTextDependency>>;
type SdkRequest = Parameters<GenerateTextDependency>[0];

const fakeModel = {} as LanguageModelInstance;

function usage(overrides: Partial<Pick<LanguageModelUsage, "inputTokens" | "outputTokens" | "totalTokens">> = {}): LanguageModelUsage {
  return {
    inputTokens: 10,
    inputTokenDetails: { noCacheTokens: 10, cacheReadTokens: 0, cacheWriteTokens: 0 },
    outputTokens: 5,
    outputTokenDetails: { textTokens: 5, reasoningTokens: 0 },
    totalTokens: 15,
    ...overrides,
  };
}

function result(overrides: Partial<SdkResult> = {}): SdkResult {
  return {
    finishReason: "stop",
    toolCalls: [],
    usage: usage(),
    output: { ok: true },
    ...overrides,
  };
}

function envFor(provider: "anthropic" | "openai", model = "configured-model") {
  return parseServerEnv({
    PROPOSALES_API_KEY: "test-placeholder-not-a-key",
    PROPOSALES_COMPANY_ID: "1",
    PROPOSALES_EDITOR_ORIGIN: "https://proposales.test",
    AI_PROVIDER: provider,
    AI_MODEL: model,
    ANTHROPIC_API_KEY: provider === "anthropic" ? "anthropic-key" : undefined,
    OPENAI_API_KEY: provider === "openai" ? "openai-key" : undefined,
    // Unrelated to the AI client; present because the schema requires every deployment to state it.
    COPILOT_LIVE_MUTATIONS: "disabled",
  });
}

function makeClient(response: SdkResult | (() => Promise<SdkResult>), provider: "anthropic" | "openai" = "anthropic") {
  const calls: SdkRequest[] = [];
  const generateText: GenerateTextDependency = async (request) => {
    calls.push(request);
    return typeof response === "function" ? response() : response;
  };
  const deps: AiClientDeps = {
    generateText,
    resolveModel: () => fakeModel,
  };
  return { client: createAiClient(envFor(provider), deps), calls };
}

const basicInput: GenerateStepInput = { system: "system", messages: [], tools: [] };

describe("AI client", () => {
  it("C1(c) and C1(e): accepts only a model instance at the internal seam", () => {
    const request = {
      system: "system",
      messages: [],
      tools: {},
      abortSignal: AbortSignal.timeout(1),
    };
    function compileTimeProbe(model: LanguageModelInstance) {
      // @ts-expect-error string model ids must not cross the internal seam
      void callModel("claude-3", request);
      void callModel(model, request);
    }

    expectTypeOf(compileTimeProbe).toBeFunction();
  });

  it("C1(d): passes the real registry's model instance to the SDK", async () => {
    const calls: SdkRequest[] = [];
    const generateText: GenerateTextDependency = async (request) => {
      calls.push(request);
      return result();
    };
    const client = createAiClient(envFor("anthropic", "registry-model"), { generateText, resolveModel });

    await client.generateStep(basicInput, { timeoutMs: 100 });
    expect(typeof calls[0]?.model).toBe("object");
    expect(calls[0]?.model.modelId).toBe("registry-model");
  });

  it("C4(q): generateStep maps SDK failures through the production catch path", async () => {
    const sdkError = new APICallError({
      message: "provider details",
      url: "https://provider.test",
      requestBodyValues: {},
      statusCode: 401,
    });
    const { client } = makeClient(async () => { throw sdkError; });

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).rejects.toMatchObject({
      constructor: AiProviderError,
      details: { reason: "unauthenticated_upstream", operation: "generateStep" },
    });
  });

  it("C4(t): generateStep rejects a content-filtered invalid output", async () => {
    const filtered = new NoObjectGeneratedError({
      text: "blocked",
      response: { id: "response", timestamp: new Date(0), modelId: "model" },
      usage: usage(),
      finishReason: "content-filter",
    });
    const { client } = makeClient(async () => { throw filtered; });

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).rejects.toMatchObject({
      constructor: AiProviderError,
      details: { reason: "content_filtered", retryable: false, operation: "generateStep" },
    });
  });

  it("C4(j), C6(j): content filtering outranks tool calls", async () => {
    const { client } = makeClient(result({
      finishReason: "content-filter",
      toolCalls: [{ toolCallId: "call-1", toolName: "search_content", input: {} }],
    }));

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).rejects.toMatchObject({
      details: { reason: "content_filtered", retryable: false },
    });
  });

  it("C5(a): reports the configured provider and model identity", () => {
    const { client } = makeClient(result(), "openai");

    expect(client.provider).toBe("openai");
    expect(client.model).toBe("configured-model");
  });

  it("C5(b), C5(f): maps exactly the three usage counters", async () => {
    const { client } = makeClient(result({ usage: usage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }) }));

    const mapped = await client.generateStep(basicInput, { timeoutMs: 100 });
    expect(mapped.usage).toEqual({ inputTokens: 10, outputTokens: 5, totalTokens: 15 });
    expect(Object.keys(mapped.usage).sort()).toEqual(["inputTokens", "outputTokens", "totalTokens"]);
  });

  it("C5(c): maps each unreported usage counter to null", async () => {
    const { client } = makeClient(result({ usage: usage({ inputTokens: undefined, outputTokens: undefined, totalTokens: undefined }) }));

    const mapped = await client.generateStep(basicInput, { timeoutMs: 100 });
    expect(mapped.usage).toEqual({ inputTokens: null, outputTokens: null, totalTokens: null });
  });

  it("C5(g): preserves reported zero while mapping only absence to null", async () => {
    const { client } = makeClient(result({ usage: usage({ inputTokens: 0, outputTokens: undefined, totalTokens: 7 }) }));

    const mapped = await client.generateStep(basicInput, { timeoutMs: 100 });
    expect(mapped.usage).toEqual({ inputTokens: 0, outputTokens: null, totalTokens: 7 });
  });

  it("C5(d): switching configuration changes only identity, not client surface or result", async () => {
    const response = result({ output: { stable: true } });
    const first = makeClient(response, "anthropic").client;
    const second = makeClient(response, "openai").client;

    expect(Object.keys(first)).toEqual(Object.keys(second));
    expect(first.generateStep.length).toBe(second.generateStep.length);
    const [firstResult, secondResult] = await Promise.all([
      first.generateStep(basicInput, { timeoutMs: 100 }),
      second.generateStep(basicInput, { timeoutMs: 100 }),
    ]);
    expect(firstResult).toEqual(secondResult);
  });

  it("C6(a): maps tool calls before touching a throwing output getter", async () => {
    let getterInvoked = false;
    const response: SdkResult = {
      finishReason: "tool-calls",
      toolCalls: [{ toolCallId: "call-1", toolName: "search_content", input: { query: "x" } }],
      usage: usage(),
      get output() {
        getterInvoked = true;
        throw new NoOutputGeneratedError();
      },
    };
    const { client } = makeClient(response);

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).resolves.toEqual({
      kind: "tool_calls",
      calls: [{ toolCallId: "call-1", name: "search_content", input: { query: "x" } }],
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    });
    expect(getterInvoked).toBe(false);
  });

  it("C6(b): returns the SDK final output unchanged", async () => {
    const output = { a: 1 };
    const { client } = makeClient(result({ output }));

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).resolves.toMatchObject({ kind: "final", output });
  });

  it("C6(c): turns invalid generated output into a final candidate", async () => {
    const invalid = new NoObjectGeneratedError({ text: "{not json", response: { id: "response", timestamp: new Date(0), modelId: "model" }, usage: usage(), finishReason: "stop" });
    const { client } = makeClient(async () => { throw invalid; });

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).resolves.toEqual({
      kind: "final",
      output: "{not json",
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    });
  });

  it("C6(d): converts tools with their schema and no execute function", async () => {
    const schema = { type: "object", properties: { query: { type: "string" } } };
    const { client, calls } = makeClient(result());

    await client.generateStep({
      ...basicInput,
      tools: [{ name: "search_content", description: "Search content", inputJsonSchema: schema }],
    }, { timeoutMs: 100 });

    const converted = calls[0]?.tools?.search_content;
    expect(converted?.description).toBe("Search content");
    expect((converted?.inputSchema as { jsonSchema?: unknown }).jsonSchema).toEqual(schema);
    expect(converted).not.toHaveProperty("execute");
  });

  it("C6(e): forwards the caller timeout exactly and maps an abort", async () => {
    const signal = AbortSignal.timeout(1234);
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(signal);
    try {
      const { client, calls } = makeClient(result());
      await client.generateStep(basicInput, { timeoutMs: 1234 });
      expect(timeoutSpy).toHaveBeenCalledWith(1234);
      expect(calls[0]?.abortSignal).toBe(signal);
    } finally {
      timeoutSpy.mockRestore();
    }

    const { client } = makeClient(async () => { throw new DOMException("aborted", "AbortError"); });
    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).rejects.toMatchObject({
      details: { reason: "timeout", retryable: true },
    });
  });

  it("C6(f): explicitly disables SDK retries", async () => {
    const { client, calls } = makeClient(result());

    await client.generateStep(basicInput, { timeoutMs: 100 });
    expect(calls[0]?.maxRetries).toBe(0);
  });

  it("C6(l): asks OpenAI not to constrain decoding to the JSON schema", async () => {
    // A live run against gpt-5.6-luna returned 400 invalid_json_schema: strict mode forbids
    // `propertyNames` and requires every key to appear in `required`, and the proposition's
    // provenance shapes are neither. The Zod parse in `run()` is what makes output authoritative,
    // so the schema stays a decoding hint here rather than a decoding constraint.
    const { client, calls } = makeClient(result(), "openai");

    await client.generateStep({ ...basicInput, outputJsonSchema: { type: "object" } }, { timeoutMs: 100 });

    expect(calls[0]?.providerOptions).toEqual({ openai: { strictJsonSchema: false } });
    // The schema itself still goes to the model.
    expect(calls[0]?.output).toBeDefined();
  });

  it("C6(n): unwraps the envelope OpenAI's dialect forced onto the schema", async () => {
    // OpenAI cannot express a top-level union, so the agent output schema is nested one level
    // down. The wrapper is the vendor's, not the caller's: what comes back out is the union member
    // `run()` will parse.
    const { client, calls } = makeClient(result({ output: { result: { kind: "proposition" } } }), "openai");

    const step = await client.generateStep(
      { ...basicInput, outputJsonSchema: { oneOf: [{ type: "object" }, { type: "object" }] } },
      { timeoutMs: 100 },
    );

    expect(step).toEqual({ kind: "final", output: { kind: "proposition" }, usage: expect.anything() });
    expect(calls[0]?.output).toBeDefined();
  });

  it("C6(o): leaves Anthropic's output exactly as the SDK produced it", async () => {
    // The same SDK answer, the other provider: nothing is unwrapped, so a real `result` key in a
    // model's own output could never be silently stripped.
    const { client } = makeClient(result({ output: { result: { kind: "proposition" } } }), "anthropic");

    const step = await client.generateStep(
      { ...basicInput, outputJsonSchema: { oneOf: [{ type: "object" }, { type: "object" }] } },
      { timeoutMs: 100 },
    );

    expect(step.kind === "final" && step.output).toEqual({ result: { kind: "proposition" } });
  });

  it("C6(m): sends no provider options on a step that has no output schema", async () => {
    const { client, calls } = makeClient(result(), "openai");

    await client.generateStep(basicInput, { timeoutMs: 100 });

    expect(calls[0]?.providerOptions).toBeUndefined();
    expect(calls[0]?.output).toBeUndefined();
  });

  it("C6(g): passes system and text messages unchanged", async () => {
    const { client, calls } = makeClient(result());

    await client.generateStep({
      ...basicInput,
      system: "SYSTEM",
      messages: [
        { role: "user", content: "hello" },
        { role: "assistant", content: "world" },
      ],
    }, { timeoutMs: 100 });
    expect(calls[0]?.system).toBe("SYSTEM");
    expect(calls[0]?.messages).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: "world" },
    ]);
  });

  it("C6(h): maps assistant tool-call messages with correlation fields", async () => {
    const { client, calls } = makeClient(result());

    await client.generateStep({ ...basicInput, messages: [{ role: "assistant", toolCalls: [{ toolCallId: "call-1", name: "search_content", input: { query: "x" } }] }] }, { timeoutMs: 100 });
    expect(calls[0]?.messages).toEqual([{ role: "assistant", content: [{ type: "tool-call", toolCallId: "call-1", toolName: "search_content", input: { query: "x" } }] }]);
  });

  it("C6(i): maps tool results to array ToolContent with the same toolCallId", async () => {
    const { client, calls } = makeClient(result());

    await client.generateStep({ ...basicInput, messages: [{ role: "tool", results: [{ toolCallId: "call-1", name: "search_content", output: { items: [] } }] }] }, { timeoutMs: 100 });
    expect(calls[0]?.messages).toEqual([{ role: "tool", content: [{ type: "tool-result", toolCallId: "call-1", toolName: "search_content", output: { type: "json", value: { items: [] } } }] }]);
    expect(Array.isArray((calls[0]?.messages[0] as { content: unknown[] }).content)).toBe(true);
  });

  it("C6(k): a finished step without output is an AI provider error, not a silent final", async () => {
    const response: SdkResult = {
      finishReason: "length",
      toolCalls: [],
      usage: usage(),
      get output() {
        throw new NoOutputGeneratedError();
      },
    };
    const { client } = makeClient(response);

    await expect(client.generateStep(basicInput, { timeoutMs: 100 })).rejects.toMatchObject({
      constructor: AiProviderError,
      details: { reason: "invalid_response" },
    });
  });

});
