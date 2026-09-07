import type { TemporaryAppliedPricing, TemporaryDraftResult } from "../../types/temporary-turn";

const availablePricing: TemporaryAppliedPricing = {
  available: true,
  totalWithoutTax: { amountMinor: 1480000, currency: "SEK" },
  totalWithTax: { amountMinor: 1850000, currency: "SEK" },
  currency: "SEK",
  blocks: [
    {
      contentId: "content-walnut-table",
      quantity: 1,
      optional: false,
      unitValueWithDiscountWithoutTax: { amountMinor: 720000, currency: "SEK" },
      unitValueWithDiscountWithTax: { amountMinor: 900000, currency: "SEK" },
    },
    {
      contentId: "content-dining-chair",
      quantity: 6,
      optional: false,
      unitValueWithDiscountWithoutTax: { amountMinor: 126667, currency: "SEK" },
      unitValueWithDiscountWithTax: { amountMinor: 158334, currency: "SEK" },
    },
  ],
  warnings: [],
};

export const temporaryFixtureDraftResultCreated: TemporaryDraftResult = {
  proposalUuid: "11111111-1111-4111-8111-111111111111",
  editorUrl: "https://app.proposales.example/proposals/11111111-1111-4111-8111-111111111111/edit",
  newlyCreated: true,
  appliedPricing: availablePricing,
  notices: [],
};

export const temporaryFixtureDraftResultRecovered: TemporaryDraftResult = {
  ...temporaryFixtureDraftResultCreated,
  newlyCreated: false,
};

export const temporaryFixtureDraftResultInconsistentTotals: TemporaryDraftResult = {
  ...temporaryFixtureDraftResultCreated,
  appliedPricing: {
    ...availablePricing,
    totalWithoutTax: { amountMinor: 999999, currency: "SEK" },
    totalWithTax: { amountMinor: 1111111, currency: "SEK" },
  },
};

export function temporaryFixtureDraftResultPricingUnavailable(
  reason: Extract<TemporaryAppliedPricing, { available: false }>["reason"],
): TemporaryDraftResult {
  return {
    ...temporaryFixtureDraftResultCreated,
    appliedPricing: { available: false, reason },
  };
}

export const temporaryFixtureDraftResultWithNotice: TemporaryDraftResult = {
  ...temporaryFixtureDraftResultCreated,
  notices: [{ kind: "inline_recipient_may_duplicate_contact" }],
};
