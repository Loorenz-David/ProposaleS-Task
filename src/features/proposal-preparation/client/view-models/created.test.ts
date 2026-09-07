import { describe, expect, it } from "vitest";

import { fixtureDraftResultCreated, fixtureDraftResultInconsistentTotals, fixtureDraftResultPricingUnavailable, fixtureDraftResultRecovered } from "../fixtures/draft-result.fixture";
import { fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { fixtureSessionRuntimeRecord } from "../fixtures/session-runtime.fixture";
import { fixtureTerminalWorkflowState } from "../fixtures/workflow-state.fixture";
import { toCreatedViewModel } from "./created";
import { toMoneyDisplay } from "./money";

function createdRecord(draft = fixtureDraftResultCreated, status: "created" | "recovered" = "created") {
  // The identity on screen comes from the result's draft; the state's draft reference only makes
  // the session terminal, and its editor URL must match the deployment origin the state was
  // parsed under.
  return fixtureSessionRuntimeRecord({
    latestResult: { status, draft },
    workflow: fixtureTerminalWorkflowState({ currentProposition: fixturePropositionV1 }),
  });
}

describe("created view model", () => {
  it("preserves created and recovered identity and URL", () => {
    expect(toCreatedViewModel(createdRecord())).toMatchObject({ headline: "Draft created in Proposales", isRecovered: false, identifier: fixtureDraftResultCreated.proposalUuid, editorUrl: fixtureDraftResultCreated.editorUrl });
    expect(toCreatedViewModel(createdRecord(fixtureDraftResultRecovered, "recovered"))).toMatchObject({ headline: "Draft recovered in Proposales", isRecovered: true });
  });

  it("displays inconsistent returned totals without recomputing", () => {
    const pricing = toCreatedViewModel(createdRecord(fixtureDraftResultInconsistentTotals)).pricing;
    expect(pricing).toMatchObject({
      available: true,
      totalWithoutTax: toMoneyDisplay({ amountMinor: 999999, currency: "SEK" }),
      totalWithTax: toMoneyDisplay({ amountMinor: 1111111, currency: "SEK" }),
    });
    expect(pricing).not.toMatchObject({ totalWithoutTax: toMoneyDisplay({ amountMinor: 1480000, currency: "SEK" }) });
  });

  it("renders unavailable pricing as a reason without a synthetic zero", () => {
    const pricing = toCreatedViewModel(createdRecord(fixtureDraftResultPricingUnavailable("read_failed_timeout"))).pricing;
    expect(pricing).toEqual({ available: false, reasonText: "Pricing did not become available in time." });
    expect(JSON.stringify(pricing)).not.toMatch(/\b0\b/);
  });
});
