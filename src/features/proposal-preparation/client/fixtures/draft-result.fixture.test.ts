import { describe, expect, it } from "vitest";

import { draftResultSchema } from "../../schemas/draft-result";
import {
  fixtureDraftResultBlockCurrencyWarning,
  fixtureDraftResultCreated,
  fixtureDraftResultInconsistentTotals,
  fixtureDraftResultPricingUnavailable,
  fixtureDraftResultRecovered,
  fixtureDraftResultWithNotice,
  fixtureDraftResultWithOriginNotice,
} from "./draft-result.fixture";

describe("draft result fixtures", () => {
  it("every fixture is a value the real schema accepts", () => {
    for (const draft of [
      fixtureDraftResultCreated,
      fixtureDraftResultRecovered,
      fixtureDraftResultInconsistentTotals,
      fixtureDraftResultWithNotice,
      fixtureDraftResultWithOriginNotice,
      fixtureDraftResultBlockCurrencyWarning,
      fixtureDraftResultPricingUnavailable("read_failed_timeout"),
    ]) {
      expect(draftResultSchema.safeParse(draft).success).toBe(true);
    }
  });

  it("F15: an unavailable pricing arm carrying money is rejected", () => {
    const withMoney = {
      ...fixtureDraftResultCreated,
      appliedPricing: {
        available: false,
        reason: "read_failed_timeout",
        totalWithTax: { amountMinor: 0, currency: "SEK" },
      },
    };
    expect(draftResultSchema.safeParse(withMoney).success).toBe(false);
  });

  it("F15: a draft without its proposal uuid is rejected", () => {
    const { proposalUuid: _proposalUuid, ...withoutUuid } = fixtureDraftResultCreated;
    expect(draftResultSchema.safeParse(withoutUuid).success).toBe(false);
  });
});
