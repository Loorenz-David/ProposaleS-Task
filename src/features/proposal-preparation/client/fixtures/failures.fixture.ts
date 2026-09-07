import type { ErrorCode } from "@/lib/errors/app-error";
import { errorDtoSchema, type ErrorDto } from "@/lib/errors/error-dto";

import { domainResultSchema, type DomainResult } from "../../schemas/turn-result";

/**
 * Failure fixtures. The DTO factory validates its output with the real `errorDtoSchema`, so a code
 * outside the taxonomy cannot be fabricated here; the deliberately unknown code is therefore built
 * without it, which is the point of that row. Test-only.
 */
const PROPOSAL_UUID = "11111111-1111-4111-8111-111111111111";

const MESSAGES: Record<string, string> = {
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

function detailsFor(code: string): Record<string, unknown> {
  if (code === "validation_error") {
    return {
      issues: [
        { path: ["title"], message: "Title needs attention." },
        { path: ["unknown", "leaf"], message: "Another value needs attention." },
      ],
    };
  }
  if (code === "conflict") {
    return {
      proposalUuid: PROPOSAL_UUID,
      editorUrl: `https://app.proposales.example/proposals/${PROPOSAL_UUID}/edit`,
    };
  }
  if (code === "integration_error") return { system: "proposales", retryable: true, status: 503 };
  return {};
}

export function fixtureErrorDto(
  code: ErrorCode | "unknown_error",
  overrides: Partial<ErrorDto> & { message?: string } = {},
): ErrorDto {
  const dto = {
    code,
    message: MESSAGES[code],
    details: detailsFor(code),
    ...overrides,
  };
  // The unknown code exists to prove the client's fallback treatment; it is not in the taxonomy,
  // so it cannot be parsed by the schema that owns the taxonomy.
  return code === "unknown_error" ? (dto as ErrorDto) : errorDtoSchema.parse(dto);
}

/**
 * A run failure in the real shape: `code` is always present, and `issues` is optional — absent
 * means no paths were reported, which is a fact rather than an empty default.
 */
export function fixtureRunFailure(
  reason: "budget_exhausted" | "model_output_invalid" | "tool_output_invalid" | "script_exhausted",
): Extract<DomainResult, { status: "failed" }>["failure"] {
  return fixtureFailedResult(reason).failure;
}

export function fixtureFailedResult(
  reason: "budget_exhausted" | "model_output_invalid" | "tool_output_invalid" | "script_exhausted",
): Extract<DomainResult, { status: "failed" }> {
  const failure =
    reason === "budget_exhausted"
      ? { reason, code: "internal_error", budget: "wall_time" }
      : reason === "model_output_invalid"
        ? { reason, code: "validation_error", issues: [{ path: ["title"], message: "Title needs attention." }] }
        : { reason, code: "internal_error" };
  const parsed = domainResultSchema.parse({ status: "failed", failure });
  if (parsed.status !== "failed") throw new Error("fixture built a non-failed result");
  return parsed;
}
