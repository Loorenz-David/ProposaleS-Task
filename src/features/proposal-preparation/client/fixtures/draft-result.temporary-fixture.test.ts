import { describe, expect, it } from "vitest";

import { temporaryFixtureDraftResultCreated, temporaryFixtureDraftResultInconsistentTotals, temporaryFixtureDraftResultPricingUnavailable, temporaryFixtureDraftResultRecovered, temporaryFixtureDraftResultWithNotice } from "./draft-result.temporary-fixture";

describe("temporary draft-result fixtures", () => {
  it("carries created, recovered, inconsistent, unavailable, and notice shapes", () => {
    expect(temporaryFixtureDraftResultCreated.newlyCreated).toBe(true);
    expect(temporaryFixtureDraftResultRecovered.newlyCreated).toBe(false);
    expect(temporaryFixtureDraftResultInconsistentTotals.appliedPricing).toMatchObject({ available: true, totalWithoutTax: { amountMinor: 999999 } });
    expect(temporaryFixtureDraftResultPricingUnavailable("read_failed_timeout").appliedPricing).toEqual({ available: false, reason: "read_failed_timeout" });
    expect(temporaryFixtureDraftResultWithNotice.notices).toEqual([{ kind: "inline_recipient_may_duplicate_contact" }]);
    expect(temporaryFixtureDraftResultCreated.editorUrl).toContain("app.proposales.example/proposals/");
  });
});
