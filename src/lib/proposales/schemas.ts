import "server-only";

import { z } from "zod";

import { currencyCodeSchema } from "@/lib/values/money";
import { isoTimestampSchema } from "@/lib/values/timestamp";

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

export const errorBodySchema = z.object({
  error: z.object({
    message: z.unknown(),
    issues: z.array(z.object({
      code: z.string().optional(),
      path: z.array(z.union([z.string(), z.number().int()])),
      message: z.string(),
    })).optional(),
  }),
});

export const variationIdSchema = z.string().regex(/^[0-9]+(,[0-9]+)*$/);

export const companyListResponseSchema = z.object({
  data: z.array(z.object({
    id: z.number().int(),
    currency: z.string().transform((value) => value.toUpperCase()).pipe(currencyCodeSchema),
    tax_mode: z.enum(["standard", "simplified", "tax-free", "none"]),
  })),
});

export type ContentItemResponse = z.infer<typeof contentItemResponseSchema>;
export type CompanyListResponse = z.infer<typeof companyListResponseSchema>;
