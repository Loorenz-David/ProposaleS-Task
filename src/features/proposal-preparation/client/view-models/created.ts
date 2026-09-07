import type { SessionRuntimeRecord } from "../../types/session";
import type { TemporaryAppliedPricing } from "../../types/temporary-turn";
import { toMoneyDisplay } from "./money";
import { toReviewSurfaceViewModel, type ReviewSurfaceViewModel } from "./review";

export const TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT = {
  statementId: "temporary-library-pricing",
  wording: "Prices come from the content library and are applied by Proposales.",
} as const;

export type AppliedPricingViewModel =
  | {
      available: true;
      totalWithoutTax: string;
      totalWithTax: string;
      currency: string;
      blocks: Array<{
        contentId: string;
        quantity: string;
        optional: boolean;
        unitWithoutTax: string;
        unitWithTax: string;
      }>;
      warnings: string[];
    }
  | { available: false; reasonText: string };

export type CreatedViewModel = {
  headline: string;
  isRecovered: boolean;
  identifier: string;
  editorUrl: string;
  pricing: AppliedPricingViewModel;
  notices: string[];
  reviewed: ReviewSurfaceViewModel;
};

const PRICING_REASON_TEXT: Record<
  Extract<TemporaryAppliedPricing, { available: false }>["reason"],
  string
> = {
  read_failed_upstream: "Pricing could not be read from Proposales.",
  read_failed_timeout: "Pricing did not become available in time.",
  read_failed_schema_mismatch: "Pricing was returned in an unexpected format.",
  read_budget_exhausted: "Pricing could not be read within this run.",
};

function toAppliedPricingViewModel(pricing: TemporaryAppliedPricing): AppliedPricingViewModel {
  if (!pricing.available) return { available: false, reasonText: PRICING_REASON_TEXT[pricing.reason] };
  return {
    available: true,
    totalWithoutTax: toMoneyDisplay(pricing.totalWithoutTax),
    totalWithTax: toMoneyDisplay(pricing.totalWithTax),
    currency: pricing.currency,
    blocks: pricing.blocks.map((block) => ({
      contentId: block.contentId,
      quantity: String(block.quantity),
      optional: block.optional,
      unitWithoutTax: toMoneyDisplay(block.unitValueWithDiscountWithoutTax),
      unitWithTax: toMoneyDisplay(block.unitValueWithDiscountWithTax),
    })),
    warnings: pricing.warnings.map(
      (warning) => `Pricing for ${warning.contentId} uses a different currency.`,
    ),
  };
}

export function toCreatedViewModel(record: SessionRuntimeRecord): CreatedViewModel {
  const result = record.latestResult;
  if (!result || (result.status !== "created" && result.status !== "recovered")) {
    throw new Error("Created presentation requires a created or recovered result.");
  }
  return {
    headline:
      result.status === "recovered"
        ? "Draft recovered in Proposales"
        : "Draft created in Proposales",
    isRecovered: result.status === "recovered",
    identifier: result.draftResult.proposalUuid,
    editorUrl: result.draftResult.editorUrl,
    pricing: toAppliedPricingViewModel(result.draftResult.appliedPricing),
    notices: result.draftResult.notices.map(
      () => "The inline recipient may duplicate an existing Proposales contact.",
    ),
    reviewed: toReviewSurfaceViewModel(record),
  };
}
