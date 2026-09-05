import { describe, expect, expectTypeOf, it } from "vitest";

import {
  AppError,
  ApprovalRequiredError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  ERROR_CODES,
  IntegrationError,
  InternalError,
  NotFoundError,
  RateLimitedError,
  ValidationError,
  type ConflictReason,
  type ErrorCode,
  type ValidationReason,
} from "@/lib/errors/app-error";

describe("AppError taxonomy", () => {
  it.each([
    ["ValidationError", () => new ValidationError(), "validation_error", 400],
    ["AuthenticationError", () => new AuthenticationError(), "unauthenticated", 401],
    ["AuthorizationError", () => new AuthorizationError(), "forbidden", 403],
    ["NotFoundError", () => new NotFoundError(), "not_found", 404],
    ["ConflictError", () => new ConflictError(), "conflict", 409],
    ["ApprovalRequiredError", () => new ApprovalRequiredError(), "approval_required", 409],
    ["IntegrationError", () => new IntegrationError({ system: "test", retryable: false }), "integration_error", 502],
    ["RateLimitedError", () => new RateLimitedError(), "rate_limited", 429],
    ["InternalError", () => new InternalError(), "internal_error", 500],
  ])("C1(%s) exposes its contract", (_name, create, code, httpStatus) => {
    const error = create();
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(code);
    expect(error.httpStatus).toBe(httpStatus);
  });

  it("C1(j) has one ordered error-code source", () => {
    expect(ERROR_CODES).toEqual([
      "validation_error",
      "unauthenticated",
      "forbidden",
      "not_found",
      "conflict",
      "approval_required",
      "integration_error",
      "rate_limited",
      "internal_error",
    ]);
  });

  it("C1(l) keeps the local reason registries closed", () => {
    expectTypeOf<ValidationReason>().toEqualTypeOf<
      | "model_output_invalid"
      | "workflow_state_too_large"
      | "unknown_question_id"
      | "pricing_acknowledgment_missing"
      | "required_to_create_unresolved"
      | "consequential_provenance_invalid"
      | "domain_rule"
    >();
    expectTypeOf<ConflictReason>().toEqualTypeOf<"draft_already_exists" | "multiple_recovery_matches">();
    expectTypeOf<ErrorCode>().toEqualTypeOf<(typeof ERROR_CODES)[number]>();
    expectTypeOf<NonNullable<ConstructorParameters<typeof ValidationError>[0]>>().toMatchTypeOf<{
      reason?: ValidationReason;
    }>();
    expectTypeOf<NonNullable<ConstructorParameters<typeof ConflictError>[0]>>().toMatchTypeOf<{
      reason?: ConflictReason;
    }>();
  });
});
