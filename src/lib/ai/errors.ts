import "server-only";

import {
  APICallError,
  InvalidResponseDataError,
  JSONParseError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  TypeValidationError,
} from "ai";

import { IntegrationError } from "@/lib/errors/app-error";

export const AI_PROVIDER_FAILURE_REASONS = [
  "unauthenticated_upstream",
  "timeout",
  "rate_limited_upstream",
  "server_error",
  "transport",
  "content_filtered",
  "not_configured",
  "request_rejected",
  "invalid_response",
] as const;

export type AiProviderFailureReason = (typeof AI_PROVIDER_FAILURE_REASONS)[number];

export const GENERIC_AI_ERROR_MESSAGE = "The AI provider request could not be completed.";

type AiProviderErrorOptions = {
  reason: AiProviderFailureReason;
  operation: string;
  status?: number;
  retryable: boolean;
  cause?: unknown;
};

export class AiProviderError extends IntegrationError {
  constructor(options: AiProviderErrorOptions) {
    super({ ...options, system: "ai_provider", message: GENERIC_AI_ERROR_MESSAGE });
  }
}

function isNamedError(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

function statusReason(status: number): Pick<AiProviderErrorOptions, "reason" | "retryable"> {
  if (status === 401) return { reason: "unauthenticated_upstream", retryable: false };
  if (status === 429) return { reason: "rate_limited_upstream", retryable: true };
  if (status >= 500 && status <= 599) return { reason: "server_error", retryable: true };
  return { reason: "request_rejected", retryable: false };
}

function isProviderDecodeError(error: unknown): boolean {
  return (
    InvalidResponseDataError.isInstance(error) ||
    JSONParseError.isInstance(error) ||
    TypeValidationError.isInstance(error) ||
    // The vendor providers surface an undecodable successful reply as an
    // APICallError carrying its 2xx status and the decode failure as `cause`.
    // A non-2xx reply remains classified by status instead.
    (APICallError.isInstance(error) &&
      (error.statusCode === undefined || (error.statusCode >= 200 && error.statusCode <= 299)) &&
      (JSONParseError.isInstance(error.cause) || TypeValidationError.isInstance(error.cause)))
  );
}

function isSdkNetworkError(error: unknown): boolean {
  // The SDK wraps fetch-level failures in a status-less APICallError. A bare
  // TypeError is the other invocation-level shape that can escape directly.
  return error instanceof TypeError || (APICallError.isInstance(error) && error.statusCode === undefined);
}

export function fromSdkError(error: unknown, operation: string): IntegrationError {
  if (isProviderDecodeError(error)) {
    return new AiProviderError({ reason: "invalid_response", operation, retryable: false, cause: error });
  }

  if (isNamedError(error, "AbortError") || isNamedError(error, "TimeoutError")) {
    return new AiProviderError({ reason: "timeout", operation, retryable: true, cause: error });
  }

  if (APICallError.isInstance(error) && error.statusCode !== undefined) {
    return new AiProviderError({
      ...statusReason(error.statusCode),
      operation,
      status: error.statusCode,
      cause: error,
    });
  }


  if (NoObjectGeneratedError.isInstance(error) && error.finishReason === "content-filter") {
    return new AiProviderError({
      reason: "content_filtered",
      operation,
      retryable: false,
      cause: error,
    });
  }

  if (NoOutputGeneratedError.isInstance(error)) {
    return new AiProviderError({ reason: "invalid_response", operation, retryable: false, cause: error });
  }

  if (isSdkNetworkError(error)) {
    return new AiProviderError({ reason: "transport", operation, retryable: true, cause: error });
  }

  return new IntegrationError({
    system: "ai_provider",
    operation,
    retryable: false,
    message: GENERIC_AI_ERROR_MESSAGE,
    cause: error,
  });
}
