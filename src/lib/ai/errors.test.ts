import { describe, expect, expectTypeOf, it } from "vitest";
import {
  APICallError,
  InvalidResponseDataError,
  JSONParseError,
  NoObjectGeneratedError,
  TypeValidationError,
} from "ai";

import {
  AI_PROVIDER_FAILURE_REASONS,
  AiProviderError,
  GENERIC_AI_ERROR_MESSAGE,
  fromSdkError,
} from "@/lib/ai/errors";
import { toErrorDto } from "@/lib/errors/error-dto";

const operation = "generateStep";

function apiError(statusCode?: number, cause?: unknown) {
  return new APICallError({
    message: "PROVIDER-MSG-SENTINEL",
    url: "https://provider.test/generate",
    requestBodyValues: { secret: "not-for-dto" },
    ...(statusCode === undefined ? {} : { statusCode }),
    cause,
  });
}

function usage() {
  return {
    inputTokens: 10,
    inputTokenDetails: { noCacheTokens: 10, cacheReadTokens: 0, cacheWriteTokens: 0 },
    outputTokens: 5,
    outputTokenDetails: { textTokens: 5, reasoningTokens: 0 },
    totalTokens: 15,
  };
}

describe("AI provider errors", () => {
  it.each([
    ["C4(a): 401", apiError(401), "unauthenticated_upstream", false],
    ["C4(b): 429", apiError(429), "rate_limited_upstream", true],
    ["C4(c): 503", apiError(503), "server_error", true],
    ["C4(d): 403", apiError(403), "request_rejected", false],
    ["C4(e): 408 is rejected", apiError(408), "request_rejected", false],
  ] as const)("maps %s", (_label, error, reason, retryable) => {
    const mapped = fromSdkError(error, operation);
    expect(mapped).toBeInstanceOf(AiProviderError);
    expect(mapped.details).toMatchObject({ reason, retryable, operation, system: "ai_provider" });
    expect(mapped.message).toBe(GENERIC_AI_ERROR_MESSAGE);
  });

  it("C4(f): maps a local AbortError to a retryable timeout", () => {
    const error = new DOMException("aborted", "AbortError");
    expect(fromSdkError(error, operation).details).toMatchObject({ reason: "timeout", retryable: true });
  });

  it("C4(g): maps an AbortSignal.timeout TimeoutError separately", () => {
    const error = new DOMException("timed out", "TimeoutError");
    expect(fromSdkError(error, operation).details).toMatchObject({ reason: "timeout", retryable: true });
  });

  it("C4(h): maps SDK network failures to retryable transport", () => {
    const networkCause = Object.assign(new TypeError("connect failed"), { code: "ECONNREFUSED" });
    expect(fromSdkError(apiError(undefined, networkCause), operation).details).toMatchObject({ reason: "transport", retryable: true });
    expect(fromSdkError(new TypeError("fetch failed"), operation).details).toMatchObject({ reason: "transport", retryable: true });
  });

  it("C4(i): maps provider protocol decode failures to nonretryable invalid_response", () => {
    expect(fromSdkError(new InvalidResponseDataError({ data: "bad" }), operation).details).toMatchObject({ reason: "invalid_response", retryable: false });
    const parseError = new JSONParseError({ text: "bad", cause: new Error("decode") });
    expect(fromSdkError(apiError(200, parseError), operation).details).toEqual({ system: "ai_provider", retryable: false, operation, reason: "invalid_response" });
  });

  it("C4(r): maps a 2xx provider schema failure to invalid_response", () => {
    const validationError = new TypeValidationError({ value: { bad: true }, cause: new Error("schema mismatch") });
    expect(fromSdkError(apiError(200, validationError), operation).details).toEqual({ system: "ai_provider", retryable: false, operation, reason: "invalid_response" });
  });

  it("C4(s): a decode failure on a non-2xx reply stays classified by status", () => {
    const parseError = new JSONParseError({ text: "bad", cause: new Error("decode") });
    expect(fromSdkError(apiError(403, parseError), operation).details).toMatchObject({ reason: "request_rejected", retryable: false, status: 403 });
  });

  it("C4(k): content-filtered invalid output outranks candidate mapping", () => {
    const error = new NoObjectGeneratedError({
      text: "blocked",
      response: { id: "response", timestamp: new Date(0), modelId: "model" },
      usage: usage(),
      finishReason: "content-filter",
    });
    expect(fromSdkError(error, operation).details).toMatchObject({ reason: "content_filtered", retryable: false });
  });

  it("C4(m): unknown values stay generic and do not infer a retry reason", () => {
    const value = { nope: true };
    const mappedValue = fromSdkError(value, operation);
    const mappedMessage = fromSdkError(new Error("timeout in an unrelated message"), operation);
    const impostor = { name: "TimeoutError" };
    const mappedImpostor = fromSdkError(impostor, operation);

    expect(mappedValue.details).toEqual({ system: "ai_provider", retryable: false, operation });
    expect(mappedValue.cause).toBe(value);
    expect(mappedMessage.details).toEqual({ system: "ai_provider", retryable: false, operation });
    expect(mappedMessage.details).not.toHaveProperty("reason");
    expect(mappedImpostor.details).toEqual({ system: "ai_provider", retryable: false, operation });
    expect(mappedImpostor.details).not.toHaveProperty("reason");
    expect(mappedImpostor.cause).toBe(impostor);
    expect(mappedMessage.message).toBe(GENERIC_AI_ERROR_MESSAGE);
  });

  it("C4(n): every registered provider reason carries the safe AI taxonomy details", () => {
    expect([...AI_PROVIDER_FAILURE_REASONS].sort()).toEqual([
      "content_filtered",
      "invalid_response",
      "not_configured",
      "rate_limited_upstream",
      "request_rejected",
      "server_error",
      "timeout",
      "transport",
      "unauthenticated_upstream",
    ]);
    for (const reason of AI_PROVIDER_FAILURE_REASONS) {
      const mapped = new AiProviderError({ reason, operation, retryable: false });
      expect(mapped.details).toMatchObject({ system: "ai_provider", operation, retryable: false, reason });
      expect(mapped.message).toBe(GENERIC_AI_ERROR_MESSAGE);
    }
  });

  it("C4(o): provider text stays in cause and out of the DTO", () => {
    const mapped = fromSdkError(apiError(401), operation);
    const dto = toErrorDto(mapped);

    expect(mapped.message).not.toContain("PROVIDER-MSG-SENTINEL");
    expect(JSON.stringify(dto)).not.toContain("PROVIDER-MSG-SENTINEL");
    expect(String(mapped.cause)).toContain("PROVIDER-MSG-SENTINEL");
  });

  it("C4(p): closes the subclass constructor against message and issues", () => {
    expectTypeOf<typeof AiProviderError>().constructorParameters.toEqualTypeOf<[
      { reason: (typeof AI_PROVIDER_FAILURE_REASONS)[number]; operation: string; status?: number; retryable: boolean; cause?: unknown }
    ]>();
    // @ts-expect-error caller messages are deliberately not accepted
    new AiProviderError({ reason: "timeout", operation, retryable: true, message: "provider" });
    // @ts-expect-error caller issues are deliberately not accepted
    new AiProviderError({ reason: "timeout", operation, retryable: true, issues: [] });

    const details = new AiProviderError({ reason: "timeout", operation, retryable: true, status: 408 }).details;
    expect(Object.keys(details ?? {}).sort()).toEqual(["operation", "reason", "retryable", "status", "system"]);
  });

});
