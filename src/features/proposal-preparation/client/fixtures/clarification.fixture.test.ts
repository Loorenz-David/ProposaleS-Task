import { describe, expect, it } from "vitest";

import { clarificationSchema } from "../../schemas/clarification";
import { INFORMATION_ITEM_KEYS } from "../../schemas/information-items";
import { domainResultSchema } from "../../schemas/turn-result";
import {
  fixtureClarificationAnswered,
  fixtureClarificationBatch,
  fixtureClarificationResult,
  fixtureClarificationResultBudgetExhausted,
  fixtureClarificationSingle,
} from "./clarification.fixture";

describe("clarification fixtures", () => {
  it("every fixture is a value the real schema accepts", () => {
    for (const clarification of [
      fixtureClarificationSingle,
      fixtureClarificationBatch,
      fixtureClarificationAnswered,
    ]) {
      expect(clarificationSchema.safeParse(clarification).success).toBe(true);
    }
    for (const result of [fixtureClarificationResult, fixtureClarificationResultBudgetExhausted]) {
      expect(domainResultSchema.safeParse(result).success).toBe(true);
    }
  });

  it("item keys come from the closed set the backend owns", () => {
    for (const question of fixtureClarificationBatch.questions) {
      expect(INFORMATION_ITEM_KEYS).toContain(question.itemKey);
    }
  });

  it("F15: a readable slug for an item key is rejected", () => {
    const slugKey = {
      ...fixtureClarificationBatch,
      questions: [{ ...fixtureClarificationBatch.questions[0], itemKey: "chair quantity" }],
    };
    expect(clarificationSchema.safeParse(slugKey).success).toBe(false);
  });
});
