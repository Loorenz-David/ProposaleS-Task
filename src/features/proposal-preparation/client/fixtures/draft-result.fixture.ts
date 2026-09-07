import {
  draftResultSchema,
  type AppliedPricingUnavailableReason,
  type DraftResult,
} from "../../schemas/draft-result";

/**
 * Draft-result fixtures parsed by the real schema. `appliedPricing` gains the `taxOptions` object
 * and the two undiscounted unit values the vendor read-back always carries; the unavailable arm
 * still declares no money field, which is what stops "unavailable" ever rendering as a zero.
 * Test-only.
 */
const PROPOSAL_UUID = "11111111-1111-4111-8111-111111111111";
const EDITOR_URL = `https://app.proposales.example/proposals/${PROPOSAL_UUID}/edit`;
const sek = (amountMinor: number) => ({ amountMinor, currency: "SEK" });

const availablePricing = {
  available: true,
  totalWithoutTax: sek(1480000),
  totalWithTax: sek(1850000),
  currency: "SEK",
  taxOptions: { mode: "standard", taxIncluded: false },
  blocks: [
    {
      contentId: "188485",
      quantity: 1,
      optional: false,
      unitValueWithDiscountWithoutTax: sek(720000),
      unitValueWithDiscountWithTax: sek(900000),
      unitValueWithoutDiscountWithoutTax: sek(720000),
      unitValueWithoutDiscountWithTax: sek(900000),
    },
    {
      contentId: "188490",
      quantity: 6,
      optional: false,
      unitValueWithDiscountWithoutTax: sek(126667),
      unitValueWithDiscountWithTax: sek(158334),
      unitValueWithoutDiscountWithoutTax: sek(126667),
      unitValueWithoutDiscountWithTax: sek(158334),
    },
  ],
  warnings: [],
};

const createdLiteral = {
  proposalUuid: PROPOSAL_UUID,
  editorUrl: EDITOR_URL,
  newlyCreated: true,
  appliedPricing: availablePricing,
  notices: [],
};

export const fixtureDraftResultCreated: DraftResult = draftResultSchema.parse(createdLiteral);

export const fixtureDraftResultRecovered: DraftResult = draftResultSchema.parse({
  ...createdLiteral,
  newlyCreated: false,
});

export const fixtureDraftResultInconsistentTotals: DraftResult = draftResultSchema.parse({
  ...createdLiteral,
  appliedPricing: {
    ...availablePricing,
    totalWithoutTax: sek(999999),
    totalWithTax: sek(1111111),
  },
});

export function fixtureDraftResultPricingUnavailable(
  reason: AppliedPricingUnavailableReason,
): DraftResult {
  return draftResultSchema.parse({
    ...createdLiteral,
    appliedPricing: { available: false, reason },
  });
}

export const fixtureDraftResultWithNotice: DraftResult = draftResultSchema.parse({
  ...createdLiteral,
  notices: [{ kind: "inline_recipient_may_duplicate_contact" }],
});

export const fixtureDraftResultWithOriginNotice: DraftResult = draftResultSchema.parse({
  ...createdLiteral,
  editorUrl: "https://elsewhere.example/proposals/x/edit",
  notices: [{ kind: "editor_url_origin_unexpected" }],
});

export const fixtureDraftResultBlockCurrencyWarning: DraftResult = draftResultSchema.parse({
  ...createdLiteral,
  appliedPricing: {
    ...availablePricing,
    warnings: [{ kind: "block_currency_differs", contentId: "188490" }],
  },
});
