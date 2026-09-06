import { z } from "zod";

export const matchStrengthSchema = z.enum(["weak", "possible", "strong"]);

export const contentCandidateSchema = z.strictObject({
  variationId: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim(),
  truncated: z.boolean(),
  score: z.number().int().min(0).max(1000),
  matchStrength: matchStrengthSchema,
  reason: z.string().trim().min(1),
});

export type MatchStrength = z.infer<typeof matchStrengthSchema>;
export type ContentCandidate = z.infer<typeof contentCandidateSchema>;

export const MAX_SEARCH_QUERY_CHARS = 200;
export const searchContentInputSchema = z.strictObject({
  query: z.string().trim().min(1).max(MAX_SEARCH_QUERY_CHARS),
  language: z.string().trim().min(1),
});
export type SearchContentInput = z.infer<typeof searchContentInputSchema>;
