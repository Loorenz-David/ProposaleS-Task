import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GENERIC_UPSTREAM_ERROR_MESSAGE,
  MAX_UPSTREAM_MESSAGE_CHARS,
  ProposalesError,
} from "@/lib/proposales/errors";
import {
  PROPOSALES_READ_MAX_ATTEMPTS,
  PROPOSALES_READ_TOTAL_MS,
  PROPOSALES_TIMEOUT_MS,
  createProposalesHttp,
} from "@/lib/proposales/http";
import { toErrorDto } from "@/lib/errors/error-dto";

function response(status: number, body: unknown, contentType = "application/json"): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}

async function rejected(promise: Promise<unknown>): Promise<ProposalesError> {
  try {
    await promise;
  } catch (error) {
    return error as ProposalesError;
  }
  throw new Error("promise unexpectedly resolved");
}

afterEach(() => vi.useRealTimers());

describe("Proposales HTTP transport", () => {
  it("C1(a) translates a fetch rejection to transport", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("ECONNREFUSED"));
    const error = await rejected(
      createProposalesHttp({ fetch: fetcher, apiKey: "key", sleep: async () => {} }).get(
        "/v3/content",
        {},
        { operation: "listContent", idempotent: true },
      ),
    );

    expect(error.details).toMatchObject({
      reason: "transport",
      retryable: true,
      system: "proposales",
      operation: "listContent",
    });
    expect(error.details).not.toHaveProperty("status");
  });

  it("C1(b) translates an aborted fetch to timeout", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => {
      signal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    });
    const pending = rejected(createProposalesHttp({
      fetch: fetcher,
      apiKey: "key",
      timeoutMs: 50,
      now: vi.fn().mockReturnValueOnce(0).mockReturnValue(PROPOSALES_READ_TOTAL_MS + 1),
    }).get(
      "/v3/content",
      {},
      { operation: "listContent", idempotent: true },
    ));

    await vi.advanceTimersByTimeAsync(50);
    const error = await pending;
    expect(error.details).toMatchObject({ reason: "timeout", retryable: true });
    expect(signal?.aborted).toBe(true);
  });

  it.each([
    ["C1(d)", 401, "unauthenticated_upstream", false],
    ["C1(e)", 403, "forbidden_upstream", false],
    ["C1(f)", 404, "not_found_upstream", false],
    ["C1(g)", 409, "conflict_upstream", false],
    ["C1(h)", 429, "rate_limited_upstream", true],
    ["C1(i)", 503, "server_error", true],
    ["C1(j)", 418, "bad_request", false],
  ])("%s classifies HTTP status before returning", async (_id, status, reason, retryable) => {
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(status, { error: { message: "status" } })),
        apiKey: "key",
        sleep: async () => {},
      }).post("/v3/proposals", {}, { operation: "createProposalDraft" }),
    );

    expect(error.details).toMatchObject({ reason, retryable, status });
  });

  it("C1(k) classifies an unreadable successful body as invalid_body", async () => {
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(200, "<html>", "text/html")),
        apiKey: "key",
      }).get("/v3/content", {}, { operation: "listContent", idempotent: true }),
    );

    expect(error.details).toMatchObject({ reason: "invalid_body", retryable: false });
  });

  it("C1(m) keeps a retryable status when its body is unreadable", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(503, "<html>", "text/html"));
    const error = await rejected(
      createProposalesHttp({ fetch: fetcher, apiKey: "key", sleep: async () => {} }).get(
        "/v3/content",
        {},
        { operation: "listContent", idempotent: true },
      ),
    );

    expect(error.details).toMatchObject({ reason: "server_error", retryable: true, status: 503 });
    expect(fetcher).toHaveBeenCalledTimes(PROPOSALES_READ_MAX_ATTEMPTS);
  });

  it("C2(a) forwards a bounded documented upstream message", async () => {
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(404, { error: { message: "Company not found" } })),
        apiKey: "key",
      }).post("/v3/proposals", {}, { operation: "getCompany" }),
    );

    expect(error.message).toBe("Company not found");
  });

  it("C2(b) keeps an over-cap message only in cause.message", async () => {
    const overCap = "x".repeat(MAX_UPSTREAM_MESSAGE_CHARS + 1);
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(404, { error: { message: overCap } })),
        apiKey: "key",
      }).post("/v3/proposals", {}, { operation: "getCompany" }),
    );

    expect(error.message).toBe(GENERIC_UPSTREAM_ERROR_MESSAGE);
    expect(error.cause).toBeInstanceOf(Error);
    expect((error.cause as Error).message).toBe(JSON.stringify({ error: { message: overCap } }));
  });

  it("C2(c) uses the generic message for a non-string upstream message", async () => {
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(401, { error: { message: 123 } })),
        apiKey: "key",
      }).post("/v3/proposals", {}, { operation: "getCompany" }),
    );

    expect(error.message).toBe(GENERIC_UPSTREAM_ERROR_MESSAGE);
  });

  it("C2(d) keeps raw body out of public error fields", async () => {
    const rawBody = "RAW-BODY-SENTINEL";
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(502, rawBody, "text/plain")),
        apiKey: "key",
      }).post("/v3/proposals", {}, { operation: "createProposalDraft" }),
    );
    const dto = toErrorDto(error);

    expect(error.message).not.toContain(rawBody);
    expect(JSON.stringify(error.details)).not.toContain(rawBody);
    expect(JSON.stringify(dto)).not.toContain(rawBody);
    expect((error.cause as Error).message).toBe(rawBody);
  });

  it("C2(e) keeps the request URL out of public error fields", async () => {
    const error = await rejected(
      createProposalesHttp({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response(502, "nope", "text/plain")),
        apiKey: "key",
      }).post("/v3/proposals", {}, { operation: "createProposalDraft" }),
    );

    expect(error.message).not.toContain("api.proposales.com");
    expect(JSON.stringify(error.details)).not.toContain("api.proposales.com");
  });

  it("C3(a) retries an idempotent read with increasing backoff", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(503, { error: { message: "busy" } }))
      .mockResolvedValueOnce(response(503, { error: { message: "busy" } }))
      .mockResolvedValueOnce(response(200, { data: [] }));
    const sleep = vi.fn<(ms: number) => Promise<void>>().mockResolvedValue(undefined);

    await expect(
      createProposalesHttp({ fetch: fetcher, apiKey: "key", sleep }).get(
        "/v3/content",
        {},
        { operation: "listContent", idempotent: true },
      ),
    ).resolves.toEqual({ data: [] });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([300, 600]);
  });

  it("C3(b) does not retry a non-retryable read", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(401, { error: { message: "no" } }));

    await expect(
      createProposalesHttp({ fetch: fetcher, apiKey: "key" }).get(
        "/v3/content",
        {},
        { operation: "listContent", idempotent: true },
      ),
    ).rejects.toMatchObject({ details: expect.objectContaining({ reason: "unauthenticated_upstream" }) });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("C3(c) bounds retry attempts", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(503, { error: { message: "busy" } }));

    await expect(
      createProposalesHttp({ fetch: fetcher, apiKey: "key", sleep: async () => {} }).get(
        "/v3/content",
        {},
        { operation: "listContent", idempotent: true },
      ),
    ).rejects.toMatchObject({ details: expect.objectContaining({ reason: "server_error", status: 503 }) });
    expect(fetcher).toHaveBeenCalledTimes(PROPOSALES_READ_MAX_ATTEMPTS);
  });

  it("C3(d) stops when the total read deadline has elapsed", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(503, { error: { message: "busy" } }));
    const now = vi.fn().mockReturnValueOnce(0).mockReturnValue( PROPOSALES_READ_TOTAL_MS + 1);

    await expect(
      createProposalesHttp({ fetch: fetcher, apiKey: "key", now, sleep: async () => {} }).get(
        "/v3/content",
        {},
        { operation: "listContent", idempotent: true },
      ),
    ).rejects.toMatchObject({ details: expect.objectContaining({ reason: "server_error", status: 503 }) });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("C3(e) never retries a POST", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(503, { error: { message: "busy" } }));

    await expect(
      createProposalesHttp({ fetch: fetcher, apiKey: "key" }).post(
        "/v3/proposals",
        {},
        { operation: "createProposalDraft" },
      ),
    ).rejects.toMatchObject({ details: expect.objectContaining({ reason: "server_error", retryable: true, status: 503 }) });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("C3(f) clamps an in-flight read to the total deadline", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => {
      signal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    });
    const pending = rejected(createProposalesHttp({
      fetch: fetcher,
      apiKey: "key",
      timeoutMs: PROPOSALES_TIMEOUT_MS,
    }).get("/v3/content", {}, { operation: "listContent", idempotent: true }));

    await vi.advanceTimersByTimeAsync(PROPOSALES_READ_TOTAL_MS);
    const error = await pending;
    expect(error.details).toMatchObject({ reason: "timeout", retryable: true });
    expect(signal?.aborted).toBe(true);
    expect(PROPOSALES_READ_TOTAL_MS).toBeLessThan(PROPOSALES_TIMEOUT_MS);
  });
});
