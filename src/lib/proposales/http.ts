import "server-only";

import { fromUpstream, ProposalesError } from "@/lib/proposales/errors";

export const PROPOSALES_BASE_URL = "https://api.proposales.com";
export const PROPOSALES_TIMEOUT_MS = 10_000;
export const PROPOSALES_READ_MAX_ATTEMPTS = 3;
export const PROPOSALES_READ_BACKOFF_MS = 300;
export const PROPOSALES_READ_TOTAL_MS = 8_000;

type QueryValue = string | number | boolean;
type Query = Record<string, QueryValue | undefined>;
type FetchLike = typeof fetch;

export type ProposalesHttp = {
  get(path: string, query: Query, options: { operation: string; idempotent: true }): Promise<unknown>;
  post(path: string, body: unknown, options: { operation: string }): Promise<unknown>;
};

type HttpDependencies = {
  fetch?: FetchLike;
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

function makeUrl(baseUrl: string, path: string, query: Query): string {
  const url = new URL(path, baseUrl);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  url.search = params.toString();
  return url.toString();
}

async function readResponseBody(response: Response): Promise<{ bodyText?: string; parsedBody?: unknown }> {
  let bodyText: string;
  try {
    bodyText = await response.text();
  } catch {
    return {};
  }

  if (bodyText.trim() === "") return { bodyText };
  try {
    return { bodyText, parsedBody: JSON.parse(bodyText) };
  } catch {
    return { bodyText };
  }
}

function headersRecord(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}

export function createProposalesHttp({
  fetch: fetcher = globalThis.fetch,
  apiKey,
  baseUrl = PROPOSALES_BASE_URL,
  timeoutMs = PROPOSALES_TIMEOUT_MS,
  now = () => performance.now(),
  sleep = (ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
}: HttpDependencies): ProposalesHttp {
  async function requestOnce(
    method: "GET" | "POST",
    path: string,
    query: Query,
    body: unknown,
    operation: string,
    attemptTimeoutMs: number,
  ): Promise<unknown> {
    const url = makeUrl(baseUrl, path, query);
    const controller = new AbortController();
    let timedOut = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(fromUpstream({ operation, kind: "timeout", url }));
      }, attemptTimeoutMs);
    });

    try {
      const response = await Promise.race([
        fetcher(url, {
          method,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
          },
          ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
          signal: controller.signal,
        }),
        timeoutPromise,
      ]);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);

      if (!response.ok) {
        const responseBody = await readResponseBody(response);
        throw fromUpstream({
          status: response.status,
          ...responseBody,
          headers: headersRecord(response.headers),
          url,
          operation,
          kind: "http",
        });
      }
      const responseBody = await readResponseBody(response);
      if (responseBody.parsedBody === undefined) {
        throw fromUpstream({
          status: response.status,
          ...responseBody,
          headers: headersRecord(response.headers),
          url,
          operation,
          kind: "invalid_body",
        });
      }
      return responseBody.parsedBody;
    } catch (error) {
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
      if (error instanceof ProposalesError) throw error;
      if (timedOut || controller.signal.aborted) {
        throw fromUpstream({ operation, kind: "timeout", url });
      }
      throw fromUpstream({ operation, kind: "transport", url });
    }
  }

  async function get(path: string, query: Query, options: { operation: string; idempotent: true }): Promise<unknown> {
    const startedAt = now();
    const deadline = startedAt + PROPOSALES_READ_TOTAL_MS;
    let lastError: ProposalesError | undefined;

    for (let attempt = 1; attempt <= PROPOSALES_READ_MAX_ATTEMPTS; attempt += 1) {
      const remaining = deadline - (attempt === 1 ? startedAt : now());
      if (remaining <= 0) break;

      try {
        return await requestOnce("GET", path, query, undefined, options.operation, Math.min(timeoutMs, remaining));
      } catch (error) {
        if (!(error instanceof ProposalesError)) throw error;
        lastError = error;
        if (error.details?.retryable !== true || attempt === PROPOSALES_READ_MAX_ATTEMPTS) break;

        const afterAttempt = deadline - now();
        if (afterAttempt <= 0) break;
        const delay = Math.min(PROPOSALES_READ_BACKOFF_MS * attempt, afterAttempt);
        await sleep(delay);
        if (deadline - now() <= 0) break;
      }
    }

    if (lastError !== undefined) throw lastError;
    throw fromUpstream({ operation: options.operation, kind: "timeout" });
  }

  async function post(path: string, body: unknown, options: { operation: string }): Promise<unknown> {
    return requestOnce("POST", path, {}, body, options.operation, timeoutMs);
  }

  return { get, post };
}
