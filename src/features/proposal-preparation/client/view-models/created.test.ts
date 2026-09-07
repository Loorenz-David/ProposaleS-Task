import { describe, expect, it } from "vitest";

import { temporaryFixtureDraftResultCreated, temporaryFixtureDraftResultInconsistentTotals, temporaryFixtureDraftResultPricingUnavailable, temporaryFixtureDraftResultRecovered } from "../fixtures/draft-result.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../fixtures/proposition.temporary-fixture";
import { temporaryFixtureSessionRuntimeRecord } from "../fixtures/session-runtime.temporary-fixture";
import { toCreatedViewModel } from "./created";
import { toMoneyDisplay } from "./money";

function createdRecord(draftResult = temporaryFixtureDraftResultCreated, status: "created" | "recovered" = "created") {
  return temporaryFixtureSessionRuntimeRecord({
    latestResult: { status, draftResult },
    workflow: {
      currentProposition: temporaryFixturePropositionV1,
      draftReference: { proposalUuid: draftResult.proposalUuid, editorUrl: draftResult.editorUrl },
    },
  });
}

describe("created view model", () => {
  it("preserves created and recovered identity and URL", () => {
    expect(toCreatedViewModel(createdRecord())).toMatchObject({ headline: "Draft created in Proposales", isRecovered: false, identifier: temporaryFixtureDraftResultCreated.proposalUuid, editorUrl: temporaryFixtureDraftResultCreated.editorUrl });
    expect(toCreatedViewModel(createdRecord(temporaryFixtureDraftResultRecovered, "recovered"))).toMatchObject({ headline: "Draft recovered in Proposales", isRecovered: true });
  });

  it("displays inconsistent returned totals without recomputing", () => {
    const pricing = toCreatedViewModel(createdRecord(temporaryFixtureDraftResultInconsistentTotals)).pricing;
    expect(pricing).toMatchObject({
      available: true,
      totalWithoutTax: toMoneyDisplay({ amountMinor: 999999, currency: "SEK" }),
      totalWithTax: toMoneyDisplay({ amountMinor: 1111111, currency: "SEK" }),
    });
    expect(pricing).not.toMatchObject({ totalWithoutTax: toMoneyDisplay({ amountMinor: 1480000, currency: "SEK" }) });
  });

  it("renders unavailable pricing as a reason without a synthetic zero", () => {
    const pricing = toCreatedViewModel(createdRecord(temporaryFixtureDraftResultPricingUnavailable("read_failed_timeout"))).pricing;
    expect(pricing).toEqual({ available: false, reasonText: "Pricing did not become available in time." });
    expect(JSON.stringify(pricing)).not.toMatch(/\b0\b/);
  });
});
