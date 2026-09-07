import type { AppliedPricingReport, DraftNoticeKind } from "../../schemas/draft-result";
import type { SessionRuntimeRecord } from "../../types/session";
import { toMoneyDisplay } from "./money";
import { toReviewSurfaceViewModel, type ReviewSurfaceViewModel } from "./review";

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
  Extract<AppliedPricingReport, { available: false }>["reason"],
  string
> = {
  read_failed_upstream: "Pricing could not be read from Proposales.",
  read_failed_timeout: "Pricing did not become available in time.",
  read_failed_schema_mismatch: "Pricing was returned in an unexpected format.",
  read_budget_exhausted: "Pricing could not be read within this run.",
};

const NOTICE_TEXT: Record<DraftNoticeKind, string> = {
  inline_recipient_may_duplicate_contact:
    "The inline recipient may duplicate an existing Proposales contact.",
  editor_url_origin_unexpected:
    "Proposales returned an editor link on an unexpected origin. Open it only if you recognise it.",
};

function toAppliedPricingViewModel(pricing: AppliedPricingReport): AppliedPricingViewModel {
  // The unavailable arm carries no money field, so there is nothing here that could render as a
  // zero amount; `status` is deliberately not shown (§12A.9).
  if (!pricing.available) return { available: false, reasonText: PRICING_REASON_TEXT[pricing.reason] };
  return {
    available: true,
    totalWithoutTax: toMoneyDisplay(pricing.totalWithoutTax),
    totalWithTax: toMoneyDisplay(pricing.totalWithTax),
    currency: pricing.currency,
    blocks: pricing.blocks.map((block) => ({
      contentId: block.contentId,
      quantity: String(block.quantity),
      // The vendor omits the flag rather than sending `false`, so absence means not optional.
      optional: block.optional === true,
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
    identifier: result.draft.proposalUuid,
    editorUrl: result.draft.editorUrl,
    pricing: toAppliedPricingViewModel(result.draft.appliedPricing),
    notices: result.draft.notices.map((notice) => NOTICE_TEXT[notice.kind]),
    reviewed: toReviewSurfaceViewModel(record),
  };
}
