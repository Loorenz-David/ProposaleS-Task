import "server-only";

import { z } from "zod";

import { IntegrationError, type ErrorIssue } from "@/lib/errors/app-error";

export const PROPOSALES_FAILURE_REASONS = [
  "transport",
  "timeout",
  "bad_request",
  "unauthenticated_upstream",
  "forbidden_upstream",
  "not_found_upstream",
  "conflict_upstream",
  "rate_limited_upstream",
  "server_error",
  "invalid_body",
  "schema_mismatch",
] as const;

export type ProposalesFailureReason = (typeof PROPOSALES_FAILURE_REASONS)[number];

export const MAX_UPSTREAM_MESSAGE_CHARS = 500;
export const MAX_UPSTREAM_ISSUES = 25;
export const GENERIC_UPSTREAM_ERROR_MESSAGE = "The Proposales request could not be completed.";

export class ProposalesError extends IntegrationError {
  constructor(options: Omit<ConstructorParameters<typeof IntegrationError>[0], "system">) {
    super({ ...options, system: "proposales" });
  }

  static fromUpstream(input: FromUpstreamInput): ProposalesError {
    return fromUpstream(input);
  }

  static schemaMismatch(operation: string, error: z.ZodError): ProposalesError {
    return schemaMismatch(operation, error);
  }

  static notFound(operation: string): ProposalesError {
    return notFound(operation);
  }
}

type FromUpstreamInput = {
  status?: number;
  bodyText?: string;
  parsedBody?: unknown;
  headers?: Record<string, string>;
  url?: string;
  operation: string;
  kind: "http" | "transport" | "timeout" | "invalid_body";
};

const errorIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number().int()])),
  message: z.string(),
});

function statusReason(status: number): { reason: ProposalesFailureReason; retryable: boolean } {
  if (status === 401) return { reason: "unauthenticated_upstream", retryable: false };
  if (status === 403) return { reason: "forbidden_upstream", retryable: false };
  if (status === 404) return { reason: "not_found_upstream", retryable: false };
  if (status === 409) return { reason: "conflict_upstream", retryable: false };
  if (status === 429) return { reason: "rate_limited_upstream", retryable: true };
  if (status >= 500) return { reason: "server_error", retryable: true };
  return { reason: "bad_request", retryable: false };
}

function boundedMessage(value: unknown): string {
  return typeof value === "string" && value.length <= MAX_UPSTREAM_MESSAGE_CHARS
    ? value
    : GENERIC_UPSTREAM_ERROR_MESSAGE;
}

function mapIssues(value: unknown): ErrorIssue[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const issues = value
    .map((issue) => errorIssueSchema.safeParse(issue))
    .filter((result): result is { success: true; data: z.infer<typeof errorIssueSchema> } => result.success)
    .slice(0, MAX_UPSTREAM_ISSUES)
    .map(({ data }) => ({
      path: data.path.map(String),
      message: boundedMessage(data.message),
    }));

  return issues.length === 0 ? undefined : issues;
}

function causeFor(input: FromUpstreamInput): Error {
  return new Error(input.bodyText ?? GENERIC_UPSTREAM_ERROR_MESSAGE, {
    cause: {
      status: input.status,
      headers: input.headers,
      url: input.url,
    },
  });
}

export function fromUpstream(input: FromUpstreamInput): ProposalesError {
  const classification =
    input.kind === "http" && input.status !== undefined
      ? statusReason(input.status)
      : input.kind === "transport"
        ? { reason: "transport" as const, retryable: true }
        : input.kind === "timeout"
          ? { reason: "timeout" as const, retryable: true }
          : { reason: "invalid_body" as const, retryable: false };
  const parsedError =
    input.parsedBody && typeof input.parsedBody === "object" && "error" in input.parsedBody
      ? input.parsedBody.error
      : undefined;
  const parsedMessage = parsedError && typeof parsedError === "object" && "message" in parsedError
    ? parsedError.message
    : undefined;
  const parsedIssues = parsedError && typeof parsedError === "object" && "issues" in parsedError
    ? parsedError.issues
    : undefined;

  return new ProposalesError({
    status: input.status,
    retryable: classification.retryable,
    reason: classification.reason,
    operation: input.operation,
    message: boundedMessage(parsedMessage),
    issues: mapIssues(parsedIssues),
    cause: causeFor(input),
  });
}

export function schemaMismatch(operation: string, error: z.ZodError): ProposalesError {
  return new ProposalesError({
    retryable: false,
    reason: "schema_mismatch",
    operation,
    message: GENERIC_UPSTREAM_ERROR_MESSAGE,
    issues: error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message })),
    cause: error,
  });
}

export function notFound(operation: string): ProposalesError {
  return new ProposalesError({
    retryable: false,
    reason: "not_found_upstream",
    operation,
    message: GENERIC_UPSTREAM_ERROR_MESSAGE,
  });
}
