import "server-only";

import { z } from "zod";

import { currencyCodeSchema } from "@/lib/values/money";
import { isoTimestampSchema } from "@/lib/values/timestamp";
import { PROPOSAL_METADATA_KEYS } from "@/lib/proposales/mappers";

const localizedTextSchema = z.record(z.string(), z.string());
const boundedCreatedAtSchema = z.number().int().refine(
  (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    try {
      return isoTimestampSchema.safeParse(date.toISOString()).success;
    } catch {
      return false;
    }
  },
  { message: "must produce a four-digit UTC ISO timestamp when interpreted as milliseconds" },
);

export const contentItemResponseSchema = z.object({
  product_id: z.number().int(),
  variation_id: z.number().int(),
  title: localizedTextSchema,
  description: localizedTextSchema.optional(),
  created_at: boundedCreatedAtSchema,
  images: z.array(z.string()).optional(),
});

export const contentListResponseSchema = z.object({
  data: z.array(contentItemResponseSchema),
});

export const variationIdSchema = z.string().regex(/^[0-9]+$/);

export const companyListResponseSchema = z.object({
  data: z.array(z.object({
    id: z.number().int(),
    currency: z.string().transform((value) => value.toUpperCase()).pipe(currencyCodeSchema),
    tax_mode: z.enum(["standard", "simplified", "tax-free", "none"]),
  })),
});

const recipientInputSchema = z.strictObject({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
});

const createProposalBlockSchema = z.strictObject({
  content_id: z.number().int(),
  type: z.literal("product-block"),
  quantity: z.number().optional(),
  optional: z.boolean().optional(),
});

const metadataSchema = z.strictObject({
  [PROPOSAL_METADATA_KEYS.source]: z.string(),
  [PROPOSAL_METADATA_KEYS.generationId]: z.string(),
  [PROPOSAL_METADATA_KEYS.createdAt]: z.string(),
});

export const createProposalRequestSchema = z.strictObject({
  company_id: z.number().int().positive(),
  language: z.string().min(1),
  title_md: z.string().optional(),
  description_md: z.string().optional(),
  recipient: recipientInputSchema.optional(),
  data: metadataSchema,
  blocks: z.array(createProposalBlockSchema).optional(),
});

export const proposalMutationResponseSchema = z.object({
  proposal: z.object({ uuid: z.string(), url: z.url().refine((value) => new URL(value).protocol === "https:") }),
});

const statusSchema = z.string().nullable().optional();
const currencySchema = z.string().transform((value) => value.toUpperCase()).pipe(currencyCodeSchema);
const packageSplitSchema = z.object({
  type: z.string(),
  vat: z.number().optional().nullable(),
  value_without_tax: z.number().int().optional().nullable(),
  value_with_tax: z.number().int().optional().nullable(),
});
const taxOptionsSchema = z.object({
  tax_mode: z.string().optional().nullable(),
  tax_included: z.boolean().optional().nullable(),
  tax_label_key: z.string().optional().nullable(),
});
const proposalReadbackBlockSchema = z.object({
  content_id: z.number().int(),
  quantity: z.number(),
  optional: z.boolean().optional().nullable(),
  currency: currencySchema.optional().nullable(),
  unit_value_with_discount_without_tax: z.number().int(),
  unit_value_with_discount_with_tax: z.number().int(),
  unit_value_without_discount_without_tax: z.number().int(),
  unit_value_without_discount_with_tax: z.number().int(),
  package_split: z.array(packageSplitSchema).optional().nullable(),
});

const proposalReadbackDataSchema = z.object({
  uuid: z.string(),
  series_uuid: z.string().optional().nullable(),
  status: statusSchema,
  currency: currencySchema,
  value_without_tax: z.number().int(),
  value_with_tax: z.number().int(),
  tax_options: taxOptionsSchema.optional().nullable(),
  blocks: z.array(proposalReadbackBlockSchema),
});

export const proposalSearchResponseSchema = z.object({
  data: z.array(z.object({
    uuid: z.string(),
    series_uuid: z.string().optional().nullable(),
    status: statusSchema,
    data: z.record(z.string(), z.unknown()),
    url: z.url(),
  })),
});

export const proposalReadbackSchema = z.object({ data: proposalReadbackDataSchema });

export type ContentItemResponse = z.infer<typeof contentItemResponseSchema>;
export type CompanyListResponse = z.infer<typeof companyListResponseSchema>;
export type CreateProposalRequest = z.infer<typeof createProposalRequestSchema>;
export type ProposalMutationResponse = z.infer<typeof proposalMutationResponseSchema>;
export type ProposalSearchResponse = z.infer<typeof proposalSearchResponseSchema>;
export type ProposalReadbackResponse = z.infer<typeof proposalReadbackSchema>;
