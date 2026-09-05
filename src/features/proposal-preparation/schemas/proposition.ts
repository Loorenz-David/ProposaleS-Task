import { z } from "zod";

import { knownOrAbsentSchema } from "@/lib/values/absence";
import { currencyCodeSchema, moneySchema } from "@/lib/values/money";
import { pathSchema } from "@/lib/values/path";
import { isoTimestampSchema } from "@/lib/values/timestamp";
import { uuidV4Schema } from "@/lib/values/uuid";

import {
  MAX_ALTERNATIVE_REASON_CHARS,
  MAX_ASSUMPTION_CHARS,
  MAX_COMMENT_CHARS,
  MAX_NARRATIVE_CHARS,
  MAX_NOTE_TEXT_CHARS,
  MAX_RATIONALE_CHARS,
  MAX_TITLE_CHARS,
  MAX_WARNING_CHARS,
  boundedText,
  catalogVerbatimSchema,
  consequentialSchema,
  positiveFiniteNumberSchema,
  positiveInt64StringSchema,
  presentationalSchema,
  sourcedOrAbsent,
} from "./shared";

export const MAX_BLOCKS = 30;
export const MAX_ALTERNATIVES_PER_BLOCK = 3;

const sourceBounded = <T>(schema: z.ZodType<T>) => presentationalSchema(schema);

export const recipientLeavesSchema = z.strictObject({
  firstName: sourcedOrAbsent(consequentialSchema(boundedText(MAX_TITLE_CHARS), ["brief", "human"])),
  lastName: sourcedOrAbsent(consequentialSchema(boundedText(MAX_TITLE_CHARS), ["brief", "human"])),
  email: sourcedOrAbsent(consequentialSchema(z.email(), ["brief", "human"])),
  phone: sourcedOrAbsent(consequentialSchema(boundedText(MAX_TITLE_CHARS), ["brief", "human"])),
  companyName: sourcedOrAbsent(consequentialSchema(boundedText(MAX_TITLE_CHARS), ["brief", "human"])),
});

const alternativeSchema = z.strictObject({
  variationId: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().trim().min(1),
  matchStrength: z.enum(["weak", "possible", "strong"]),
  score: z.number().int().min(0).max(1000),
  reason: sourceBounded(boundedText(MAX_ALTERNATIVE_REASON_CHARS)),
});

export const blockSchema = z.strictObject({
  contentId: consequentialSchema(positiveInt64StringSchema, ["proposales_content", "human"]),
  productId: z.string().min(1),
  title: catalogVerbatimSchema(boundedText(MAX_TITLE_CHARS)),
  description: sourcedOrAbsent(catalogVerbatimSchema(boundedText(MAX_NARRATIVE_CHARS))),
  quantity: sourcedOrAbsent(consequentialSchema(positiveFiniteNumberSchema, ["brief", "human"])),
  optional: sourcedOrAbsent(consequentialSchema(z.boolean(), ["brief", "human"])),
  reviewerComment: sourcedOrAbsent(sourceBounded(boundedText(MAX_COMMENT_CHARS))),
  pricing: z.literal("library"),
  alternatives: z.array(alternativeSchema).max(MAX_ALTERNATIVES_PER_BLOCK),
});

export const commercialNoteSchema = z.strictObject({
  text: sourceBounded(boundedText(MAX_NOTE_TEXT_CHARS)),
  amount: sourcedOrAbsent(consequentialSchema(moneySchema, ["brief", "human"])),
  currency: sourcedOrAbsent(consequentialSchema(currencyCodeSchema, ["brief", "human"])),
  taxBasis: consequentialSchema(z.enum(["including_tax", "excluding_tax", "unstated"]), ["brief", "human"]),
});

export const commercialAssumptionSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("deadline"),
    statedValue: consequentialSchema(boundedText(MAX_ASSUMPTION_CHARS), ["brief", "human"]),
  }),
  z.strictObject({
    kind: z.literal("term"),
    statedValue: consequentialSchema(boundedText(MAX_ASSUMPTION_CHARS), ["brief", "human"]),
  }),
  z.strictObject({
    kind: z.literal("scope_commitment"),
    statedValue: consequentialSchema(boundedText(MAX_ASSUMPTION_CHARS), ["brief", "human"]),
  }),
  z.strictObject({ kind: z.literal("other"), statedValue: sourceBounded(boundedText(MAX_ASSUMPTION_CHARS)) }),
]);

const bareWarningValue: z.ZodTypeAny = z.lazy(() => z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(bareWarningValue),
  z.record(z.string(), bareWarningValue).superRefine((value, ctx) => {
    if (Object.prototype.hasOwnProperty.call(value, "source")) {
      ctx.addIssue({ code: "custom", path: ["source"], message: "warning values are bare" });
    }
  }),
]));

export const warningSchema = z.strictObject({
  kind: z.enum([
    "weak_match",
    "non_strong_selection",
    "no_acceptable_match",
    "conflicting_brief_statements",
    "uncovered_scope",
    "currency_mismatch",
    "human_value_kept",
    "human_value_overridden",
    "catalog_language_missing",
    "other",
  ]),
  text: sourceBounded(boundedText(MAX_WARNING_CHARS)),
  path: pathSchema.optional(),
  before: bareWarningValue.optional(),
  after: bareWarningValue.optional(),
  reason: boundedText(MAX_RATIONALE_CHARS).optional(),
});

const languageCodeSchema = z.string().regex(/^[a-z]{2}$/);
const unresolvedItemSchema = z.strictObject({
  itemKey: z.string().min(1),
  resolution: z.enum(["unresolved", "deferred_by_user"]),
});
const assumptionNoteSchema = z.strictObject({
  path: pathSchema,
  note: sourceBounded(boundedText(MAX_ASSUMPTION_CHARS)),
});

export const propositionSchema = z.strictObject({
  generationId: uuidV4Schema,
  version: z.number().int().min(1),
  preparedAt: isoTimestampSchema,
  language: sourcedOrAbsent(sourceBounded(languageCodeSchema)),
  title: sourcedOrAbsent(sourceBounded(boundedText(MAX_TITLE_CHARS))),
  descriptionNarrative: sourcedOrAbsent(sourceBounded(boundedText(MAX_NARRATIVE_CHARS))),
  recipient: knownOrAbsentSchema(recipientLeavesSchema),
  blocks: z.array(blockSchema).max(MAX_BLOCKS),
  emptyDraftConfirmation: sourcedOrAbsent(consequentialSchema(z.literal(true), ["human"])),
  commercialNotes: z.array(commercialNoteSchema),
  commercialAssumptions: z.array(commercialAssumptionSchema),
  unresolvedItems: z.array(unresolvedItemSchema),
  assumptions: z.array(assumptionNoteSchema),
  warnings: z.array(warningSchema),
  agentRationale: sourcedOrAbsent(sourceBounded(boundedText(MAX_RATIONALE_CHARS))),
});

export type RecipientLeaves = z.infer<typeof recipientLeavesSchema>;
export type Block = z.infer<typeof blockSchema>;
export type CommercialNote = z.infer<typeof commercialNoteSchema>;
export type CommercialAssumption = z.infer<typeof commercialAssumptionSchema>;
export type Warning = z.infer<typeof warningSchema>;
export type Proposition = z.infer<typeof propositionSchema>;
