import { describe, expect, it } from "vitest";

import { ERROR_CODES } from "@/lib/errors/app-error";
import { errorDtoSchema } from "@/lib/errors/error-dto";

import { domainResultSchema } from "../../schemas/turn-result";
import { fixtureErrorDto, fixtureFailedResult, fixtureRunFailure } from "./failures.fixture";

describe("failure fixtures", () => {
  it("every taxonomy code produces a DTO the real schema accepts", () => {
    for (const code of ERROR_CODES) {
      expect(errorDtoSchema.safeParse(fixtureErrorDto(code)).success).toBe(true);
    }
  });

  it("the deliberately unknown code is outside the taxonomy, which is what it exists to prove", () => {
    expect(errorDtoSchema.safeParse(fixtureErrorDto("unknown_error")).success).toBe(false);
  });

  it("every run failure reason produces a result the real schema accepts", () => {
    for (const reason of ["budget_exhausted", "model_output_invalid", "tool_output_invalid", "script_exhausted"] as const) {
      expect(domainResultSchema.safeParse(fixtureFailedResult(reason)).success).toBe(true);
      expect(fixtureRunFailure(reason).code).toBeDefined();
    }
  });

  it("F15: a failure without its code is rejected", () => {
    const { code: _code, ...withoutCode } = fixtureRunFailure("budget_exhausted");
    expect(domainResultSchema.safeParse({ status: "failed", failure: withoutCode }).success).toBe(false);
  });

  it("issues are absent rather than empty when the run reported no paths", () => {
    expect(fixtureRunFailure("tool_output_invalid")).not.toHaveProperty("issues");
  });
});
