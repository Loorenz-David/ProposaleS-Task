import { z } from "zod";

import { currencyCodeSchema, moneySchema } from "@/lib/values/money";
import { uuidV4Schema } from "@/lib/values/uuid";

/**
 * Why the read-back could not be reported. Closed (§17A.12): a free-text reason is where a raw
 * vendor body gets forwarded.
 */
export const appliedPricingUnavailableReasonSchema = z.enum([
  "read_failed_upstream",
  "read_failed_timeout",
  "read_failed_schema_mismatch",
  "read_budget_exhausted",
]);
export type AppliedPricingUnavailableReason = z.infer<typeof appliedPricingUnavailableReasonSchema>;

const packageSplitSchema = z.strictObject({
  type: z.string().min(1),
  vat: z.number().optional(),
  valueWithoutTax: moneySchema.optional(),
  valueWithTax: moneySchema.optional(),
});

const appliedPricingBlockSchema = z.strictObject({
  contentId: z.string().min(1),
  // A vendor quantity is a `number`, not necessarily an integer (§17A.12).
  quantity: z.number(),
  optional: z.boolean().optional(),
  // Informational and carried verbatim; never used to construct a Money (§17A.12).
  blockCurrency: z.string().min(1).optional(),
  unitValueWithDiscountWithoutTax: moneySchema,
  unitValueWithDiscountWithTax: moneySchema,
  unitValueWithoutDiscountWithoutTax: moneySchema,
  unitValueWithoutDiscountWithTax: moneySchema,
  packageSplit: z.array(packageSplitSchema).optional(),
});

/**
 * The available arm mirrors the lib-owned `AppliedPricing` that `toAppliedPricing` produces; the
 * execution service re-parses the mapper's output through this schema at the feature boundary, so
 * a divergence fails loudly instead of silently. The unavailable arm declares NO money field, so
 * "unavailable" can never be rendered as `0`.
 */
export const appliedPricingSchema = z.discriminatedUnion("available", [
  z.strictObject({
    available: z.literal(true),
    totalWithoutTax: moneySchema,
    totalWithTax: moneySchema,
    currency: currencyCodeSchema,
    taxOptions: z.strictObject({
      mode: z.string().min(1).optional(),
      taxIncluded: z.boolean().optional(),
      taxLabelKey: z.string().min(1).optional(),
    }),
    blocks: z.array(appliedPricingBlockSchema),
    warnings: z.array(z.strictObject({
      kind: z.literal("block_currency_differs"),
      contentId: z.string().min(1),
    })),
  }),
  z.strictObject({
    available: z.literal(false),
    reason: appliedPricingUnavailableReasonSchema,
    status: z.number().int().optional(),
  }),
]);
export type AppliedPricingReport = z.infer<typeof appliedPricingSchema>;

export const draftNoticeKindSchema = z.enum([
  "inline_recipient_may_duplicate_contact",
  "editor_url_origin_unexpected",
]);
export type DraftNoticeKind = z.infer<typeof draftNoticeKindSchema>;

/**
 * What execution returns to the caller. `editorUrl` is only checked as an absolute URL here: an
 * unexpected origin is reported as a notice beside a still-successful create (§17A.3, 10 §10), so
 * this schema must not reject it.
 */
export const draftResultSchema = z.strictObject({
  proposalUuid: uuidV4Schema,
  editorUrl: z.url(),
  newlyCreated: z.boolean(),
  seriesUuid: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  appliedPricing: appliedPricingSchema,
  notices: z.array(z.strictObject({ kind: draftNoticeKindSchema })),
});
export type DraftResult = z.infer<typeof draftResultSchema>;
