import { describe, expect, it } from "vitest";

import { temporaryFixtureErrorDto, temporaryFixtureRunFailure } from "./failures.temporary-fixture";

describe("temporary failure fixtures", () => {
  it("covers every presentation treatment including retry and unknown", () => {
    const codes = ["validation_error", "unauthenticated", "forbidden", "not_found", "conflict", "approval_required", "integration_error", "rate_limited", "internal_error", "unknown_error"] as const;
    expect(codes.map((code) => temporaryFixtureErrorDto(code).code)).toEqual(codes);
    expect(temporaryFixtureErrorDto("integration_error").details).toMatchObject({ retryable: true });
    expect(temporaryFixtureErrorDto("validation_error").details?.issues).toHaveLength(2);
  });

  it("covers the three production run-failure reasons", () => {
    expect(["budget_exhausted", "model_output_invalid", "tool_output_invalid"].map((reason) => temporaryFixtureRunFailure(reason as Parameters<typeof temporaryFixtureRunFailure>[0]).reason)).toEqual(["budget_exhausted", "model_output_invalid", "tool_output_invalid"]);
  });
});
