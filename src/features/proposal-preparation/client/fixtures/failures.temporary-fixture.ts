import type { ErrorCode } from "@/lib/errors/app-error";
import type { ErrorDto } from "@/lib/errors/error-dto";

import type { TemporaryRunFailure } from "../../types/temporary-turn";

export function temporaryFixtureErrorDto(
  code: ErrorCode | "unknown_error",
  overrides: Partial<ErrorDto> & { message?: string } = {},
): ErrorDto {
  const messages: Record<string, string> = {
    validation_error: "Review the highlighted information before trying again.",
    unauthenticated: "Sign in again before continuing.",
    forbidden: "You do not have access to create this draft.",
    not_found: "The requested proposal information could not be found.",
    conflict: "A draft already exists for this generation.",
    approval_required: "Review and approve the proposition before creating a draft.",
    integration_error: "Proposales could not be reached.",
    rate_limited: "Too many requests reached Proposales at once.",
    internal_error: "The draft could not be prepared because of an internal error.",
    unknown_error: "An unexpected response was received.",
  };
  const details: Record<string, unknown> =
    code === "validation_error"
      ? {
          issues: [
            { path: ["title"], message: "Title needs attention." },
            { path: ["unknown", "leaf"], message: "Another value needs attention." },
          ],
        }
      : code === "conflict"
        ? {
            proposalUuid: "11111111-1111-4111-8111-111111111111",
            editorUrl: "https://app.proposales.example/proposals/11111111-1111-4111-8111-111111111111/edit",
          }
        : code === "integration_error"
          ? { retryable: true }
          : {};

  return {
    code: code as ErrorDto["code"],
    message: messages[code],
    details,
    ...overrides,
  };
}

export function temporaryFixtureRunFailure(
  reason: TemporaryRunFailure["reason"],
): TemporaryRunFailure {
  if (reason === "budget_exhausted") return { reason, budget: "wall_time" };
  if (reason === "model_output_invalid") return { reason, issues: [{ path: ["title"] }] };
  return { reason };
}
