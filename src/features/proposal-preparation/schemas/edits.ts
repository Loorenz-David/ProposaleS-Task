import { z } from "zod";

import { pathSchema } from "@/lib/values/path";

import { MAX_NARRATIVE_CHARS, MAX_TITLE_CHARS, boundedText, positiveFiniteNumberSchema, positiveInt64StringSchema } from "./shared";

/**
 * The identity a human hands to `add_block`, from a `searchContentForHuman` result or from a
 * retained alternative on the current proposition. It is deliberately smaller than
 * `ContentCandidate`: a retained alternative carries no description, score, or reason, and the
 * only fields the new block needs are the identity and the catalog-verbatim text.
 */
export const addBlockCandidateSchema = z.strictObject({
  variationId: positiveInt64StringSchema,
  productId: z.string().min(1),
  title: boundedText(MAX_TITLE_CHARS),
  description: boundedText(MAX_NARRATIVE_CHARS).optional(),
});
export type AddBlockCandidate = z.infer<typeof addBlockCandidateSchema>;

/** Closed set of human edit operations (§17A.9). Every one produces `human`-sourced leaves. */
export const editOperationSchema = z.discriminatedUnion("op", [
  z.strictObject({ op: z.literal("set_leaf"), path: pathSchema, value: z.unknown() }),
  z.strictObject({ op: z.literal("remove_block"), index: z.number().int().nonnegative() }),
  z.strictObject({
    op: z.literal("add_block"),
    candidate: addBlockCandidateSchema,
    quantity: positiveFiniteNumberSchema.optional(),
    optional: z.boolean().optional(),
  }),
  z.strictObject({ op: z.literal("unset_recipient") }),
  z.strictObject({ op: z.literal("confirm_empty_draft") }),
]);
export type EditOperation = z.infer<typeof editOperationSchema>;

/**
 * The turn envelope. `state` and `conversation` stay `unknown` here so the service parses each
 * through its own parser — the state through `parseProposalWorkflowState`, which owns the byte
 * bound and its dedicated reason code. Strict, so a stray `version` key fails at parse.
 */
export const editPropositionInputSchema = z.strictObject({
  state: z.unknown(),
  edits: z.array(editOperationSchema).min(1),
  conversation: z.unknown().optional(),
});
export type EditPropositionInput = z.infer<typeof editPropositionInputSchema>;
