import { describe, expect, it } from "vitest";

import { fixtureErrorDto, fixtureRunFailure } from "../fixtures/failures.fixture";
import { toCallFailureViewModel, toCreationFailureViewModel, toRunFailureTurn } from "./failure";
import type { CallFailure } from "../../types/session";

function failure(code: Parameters<typeof fixtureErrorDto>[0], overrides: Parameters<typeof fixtureErrorDto>[1] = {}): CallFailure {
  return { site: { kind: "agent" }, error: fixtureErrorDto(code, overrides), retry: { kind: "brief", text: "retry" } };
}

describe("failure adapters", () => {
  it("maps every known treatment key and unknown codes", () => {
    const codes = ["validation_error", "unauthenticated", "forbidden", "not_found", "conflict", "approval_required", "integration_error", "rate_limited", "internal_error"] as const;
    expect(codes.map((code) => toCallFailureViewModel(failure(code)).key)).toEqual(codes);
    expect(toCallFailureViewModel(failure("unknown_error")).key).toBe("unknown");
  });

  it("uses generic copy only for an unknown code without a message", () => {
    expect(toCallFailureViewModel(failure("unknown_error", { message: "Returned verbatim" })).message).toBe("Returned verbatim");
    expect(toCallFailureViewModel(failure("unknown_error", { message: "" })).message).toBe("An unexpected error occurred.");
    expect(toCallFailureViewModel(failure("internal_error", { message: "" })).message).toBe("");
  });

  it("honors retryability except validation and exposes conflict identity", () => {
    expect(toCallFailureViewModel(failure("integration_error", { details: { retryable: true } })).canRetry).toBe(true);
    expect(toCallFailureViewModel(failure("integration_error", { details: { retryable: false } })).canRetry).toBe(false);
    expect(toCallFailureViewModel(failure("validation_error", { details: { retryable: true } })).canRetry).toBe(false);
    expect(toCreationFailureViewModel(failure("conflict")).existingDraft).not.toBeNull();
  });

  it("R6.7: offers retry exactly when the DTO flag is true, except validation", () => {
    const codes = [
      "validation_error", "unauthenticated", "forbidden", "not_found", "conflict",
      "approval_required", "integration_error", "rate_limited", "internal_error", "unknown_error",
    ] as const;
    for (const code of codes) {
      expect(toCallFailureViewModel(failure(code, { details: { retryable: true } })).canRetry).toBe(code !== "validation_error");
      expect(toCallFailureViewModel(failure(code, { details: { retryable: false } })).canRetry).toBe(false);
      expect(toCallFailureViewModel(failure(code, { details: {} })).canRetry).toBe(false);
    }
  });

  it("maps all production run-failure reasons", () => {
    expect(["budget_exhausted", "model_output_invalid", "tool_output_invalid"].map((reason) => toRunFailureTurn(fixtureRunFailure(reason as Parameters<typeof fixtureRunFailure>[0])).headline)).toHaveLength(3);
  });
});
