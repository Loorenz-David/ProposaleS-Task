import { describe, expect, it } from "vitest";

import { fixtureDraftResultBlockCurrencyWarning, fixtureDraftResultCreated, fixtureDraftResultInconsistentTotals, fixtureDraftResultPricingUnavailable, fixtureDraftResultRecovered, fixtureDraftResultWithNotice, fixtureDraftResultWithOriginNotice } from "../fixtures/draft-result.fixture";
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

  it("names each unavailable reason distinctly, and never as an amount", () => {
    const reasons = [
      ["read_failed_upstream", "Pricing could not be read from Proposales."],
      ["read_failed_timeout", "Pricing did not become available in time."],
      ["read_failed_schema_mismatch", "Pricing was returned in an unexpected format."],
      ["read_budget_exhausted", "Pricing could not be read within this run."],
    ] as const;
    for (const [reason, reasonText] of reasons) {
      expect(toCreatedViewModel(createdRecord(fixtureDraftResultPricingUnavailable(reason))).pricing)
        .toEqual({ available: false, reasonText });
    }
  });

  it("renders each notice kind as its own sentence", () => {
    expect(toCreatedViewModel(createdRecord(fixtureDraftResultWithNotice)).notices).toEqual([
      "The inline recipient may duplicate an existing Proposales contact.",
    ]);
    // A link on an unexpected origin is still rendered, with the fact stated beside it (10 §10).
    const originNotice = toCreatedViewModel(createdRecord(fixtureDraftResultWithOriginNotice));
    expect(originNotice.notices).toEqual([
      "Proposales returned an editor link on an unexpected origin. Open it only if you recognise it.",
    ]);
    expect(originNotice.editorUrl).toBe(fixtureDraftResultWithOriginNotice.editorUrl);
  });

  it("reports a block currency warning without inventing a converted amount", () => {
    const pricing = toCreatedViewModel(createdRecord(fixtureDraftResultBlockCurrencyWarning)).pricing;
    expect(pricing).toMatchObject({
      available: true,
      warnings: ["Pricing for 188490 uses a different currency."],
    });
  });

  it("treats an omitted optional flag as not optional, which is how the vendor reports it", () => {
    const pricing = toCreatedViewModel(createdRecord()).pricing;
    if (!pricing.available) throw new Error("expected available pricing");
    expect(pricing.blocks.every((block) => block.optional === false)).toBe(true);
  });
});
