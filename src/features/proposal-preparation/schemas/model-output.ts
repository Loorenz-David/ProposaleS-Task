import { z } from "zod";

import { currencyCodeSchema, moneySchema } from "@/lib/values/money";
import { pathSchema } from "@/lib/values/path";

import { AGENT_WARNING_KINDS, type AgentMode } from "./agent-output";
import { MAX_CLARIFICATION_QUESTIONS } from "./clarification";
import { informationItemKeySchema } from "./information-items";
import {
  MAX_ALTERNATIVES_PER_BLOCK,
  MAX_BLOCKS,
  languageCodeSchema,
} from "./proposition";
import {
  MAX_ALTERNATIVE_REASON_CHARS,
  MAX_ASSUMPTION_CHARS,
  MAX_COMMENT_CHARS,
  MAX_NARRATIVE_CHARS,
  MAX_NOTE_TEXT_CHARS,
  MAX_QUESTION_CHARS,
  MAX_QUOTE_CHARS,
  MAX_RATIONALE_CHARS,
  MAX_TITLE_CHARS,
  MAX_WARNING_CHARS,
  boundedText,
  positiveFiniteNumberSchema,
  positiveInt64StringSchema,
} from "./shared";

/**
 * What the model is asked to serialize, as distinct from what the domain stores.
 *
 * The domain proposition states each leaf's provenance inside the leaf: a `known` discriminator, a
 * `source`, and a `ref` naming the question, turn, edit or catalog variation the value came from.
 * That is the right shape to hold, review and approve, but it is repetitive to *write*: expressed
 * as a JSON Schema for the provider it inlines the same union at roughly seventy leaves and comes
 * to about 48 KB, resent on every call of every turn. It also asks the model to author bookkeeping
 * it cannot actually know — a question's UUID, a turn id — and the observed failures were exactly
 * that: dropped `known` discriminators, dropped refs, omitted required arrays.
 *
 * So this contract asks for the two things only the model can supply — the value, and which piece
 * of evidence supports it — and nothing else. `server/domain/normalize-model-output.ts` resolves
 * each selector against authoritative state and builds the domain leaf, which is then validated by
 * the unchanged `agentOutputSchemaFor`, `validateAgentOutput` and `assembleProposition`. The domain
 * contract is not weakened anywhere: every distinction it draws is still drawn, and drawn from
 * evidence rather than from the model's word for it.
 *
 * Three rules make the shape mechanical rather than a matter of the model's memory:
 *
 * 1. Every key is required. Absence is `null`, never an omitted key, so a dropped field is a
 *    validation error rather than a silently unknown value.
 * 2. A leaf is `{ value, evidence }`. Evidence is a selector — an answer alias, a quote, "this is
 *    unchanged", "this is the catalog's", "this is my own wording" — never a constructed ref.
 * 3. Which selectors are admissible is a property of the leaf's own type. A consequential leaf
 *    cannot cite the catalog or its own inference, so an inferred quantity is unrepresentable here
 *    exactly as it is unrepresentable in the domain.
 */

/** Names one of this turn's answered clarification questions: `Q1` is the first question asked. */
export const ANSWER_ALIAS_PATTERN = /^Q[1-9]\d*$/;
const answerAliasSchema = z.string().regex(ANSWER_ALIAS_PATTERN);

const briefEvidence = z.strictObject({
  kind: z.literal("brief"),
  quote: boundedText(MAX_QUOTE_CHARS),
});
const answerEvidence = z.strictObject({
  kind: z.literal("answer"),
  ref: answerAliasSchema,
});
const instructionEvidence = z.strictObject({
  kind: z.literal("instruction"),
  quote: boundedText(MAX_QUOTE_CHARS),
});
const currentEvidence = z.strictObject({ kind: z.literal("current") });
const catalogEvidence = z.strictObject({ kind: z.literal("catalog") });
const inferredEvidence = z.strictObject({ kind: z.literal("inferred") });
const contentEvidence = z.strictObject({
  kind: z.literal("content"),
  variationId: positiveInt64StringSchema,
});

/**
 * Where a consequential value came from. The four admissible origins are the human's own words —
 * the brief, an answer, the current instruction — or the value already carried by the proposition
 * under revision. There is deliberately no "I inferred it" member: that is what makes an invented
 * quantity, price or recipient unrepresentable rather than merely rejected.
 */
export const consequentialEvidenceSchema = z.discriminatedUnion("kind", [
  briefEvidence,
  answerEvidence,
  instructionEvidence,
  currentEvidence,
]).meta({ id: "ConsequentialEvidence" });

/** Where a presentational value came from. Wording may also be the catalog's or the model's own. */
export const presentationalEvidenceSchema = z.discriminatedUnion("kind", [
  briefEvidence,
  answerEvidence,
  instructionEvidence,
  currentEvidence,
  contentEvidence,
  inferredEvidence,
]).meta({ id: "PresentationalEvidence" });

/**
 * Why a block holds this catalog item. `catalog` is the ordinary case: the model chose it from
 * what a read tool returned this run. The human members cover a human who named the item, which
 * the domain records as a `human`-sourced content id.
 */
export const contentSelectionEvidenceSchema = z.discriminatedUnion("kind", [
  catalogEvidence,
  answerEvidence,
  instructionEvidence,
  currentEvidence,
]).meta({ id: "ContentSelectionEvidence" });

export type ConsequentialEvidence = z.infer<typeof consequentialEvidenceSchema>;
export type PresentationalEvidence = z.infer<typeof presentationalEvidenceSchema>;
export type ContentSelectionEvidence = z.infer<typeof contentSelectionEvidenceSchema>;
export type ModelEvidence = ConsequentialEvidence | PresentationalEvidence | ContentSelectionEvidence;

const consequentialLeaf = <T extends z.ZodType>(value: T) =>
  z.strictObject({ value, evidence: consequentialEvidenceSchema });
const presentationalLeaf = <T extends z.ZodType>(value: T) =>
  z.strictObject({ value, evidence: presentationalEvidenceSchema });

export const modelBlockSchema = z.strictObject({
  /** Must be an identity a read tool returned this run, or one the current proposition carries. */
  variationId: positiveInt64StringSchema,
  selectedBy: contentSelectionEvidenceSchema,
  quantity: consequentialLeaf(positiveFiniteNumberSchema).nullable(),
  optional: consequentialLeaf(z.boolean()).nullable(),
  reviewerComment: presentationalLeaf(boundedText(MAX_COMMENT_CHARS)).nullable(),
  alternatives: z.array(z.strictObject({
    variationId: positiveInt64StringSchema,
    reason: presentationalLeaf(boundedText(MAX_ALTERNATIVE_REASON_CHARS)),
  })).max(MAX_ALTERNATIVES_PER_BLOCK),
});

export const modelPropositionSchema = z.strictObject({
  kind: z.literal("proposition"),
  language: presentationalLeaf(languageCodeSchema).nullable(),
  title: presentationalLeaf(boundedText(MAX_TITLE_CHARS)).nullable(),
  descriptionNarrative: presentationalLeaf(boundedText(MAX_NARRATIVE_CHARS)).nullable(),
  agentRationale: presentationalLeaf(boundedText(MAX_RATIONALE_CHARS)).nullable(),
  recipient: z.strictObject({
    firstName: consequentialLeaf(boundedText(MAX_TITLE_CHARS)).nullable(),
    lastName: consequentialLeaf(boundedText(MAX_TITLE_CHARS)).nullable(),
    email: consequentialLeaf(z.email()).nullable(),
    phone: consequentialLeaf(boundedText(MAX_TITLE_CHARS)).nullable(),
    companyName: consequentialLeaf(boundedText(MAX_TITLE_CHARS)).nullable(),
  }).nullable(),
  blocks: z.array(modelBlockSchema).max(MAX_BLOCKS),
  commercialNotes: z.array(z.strictObject({
    text: presentationalLeaf(boundedText(MAX_NOTE_TEXT_CHARS)),
    amount: consequentialLeaf(moneySchema).nullable(),
    currency: consequentialLeaf(currencyCodeSchema).nullable(),
    taxBasis: consequentialLeaf(z.enum(["including_tax", "excluding_tax", "unstated"])),
  })),
  commercialAssumptions: z.array(z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("deadline"), statedValue: consequentialLeaf(boundedText(MAX_ASSUMPTION_CHARS)) }),
    z.strictObject({ kind: z.literal("term"), statedValue: consequentialLeaf(boundedText(MAX_ASSUMPTION_CHARS)) }),
    z.strictObject({ kind: z.literal("scope_commitment"), statedValue: consequentialLeaf(boundedText(MAX_ASSUMPTION_CHARS)) }),
    z.strictObject({ kind: z.literal("other"), statedValue: presentationalLeaf(boundedText(MAX_ASSUMPTION_CHARS)) }),
  ])),
  assumptions: z.array(z.strictObject({
    path: pathSchema,
    note: presentationalLeaf(boundedText(MAX_ASSUMPTION_CHARS)),
  })),
  /**
   * `before` and `after` are absent by design. Every warning that carries them is raised by the
   * application — a kept or overridden human value, a currency mismatch — from state it holds and
   * the model does not. The domain warning keeps both fields; this contract simply never authors
   * them, which also keeps the model's shape free of the recursive record they require.
   */
  warnings: z.array(z.strictObject({
    kind: z.enum(AGENT_WARNING_KINDS),
    text: presentationalLeaf(boundedText(MAX_WARNING_CHARS)),
    path: pathSchema.nullable(),
    reason: boundedText(MAX_RATIONALE_CHARS).nullable(),
  })),
  requestedOverrides: z.array(z.strictObject({
    path: pathSchema,
    reason: boundedText(MAX_RATIONALE_CHARS),
  })),
});

export const modelClarificationSchema = z.strictObject({
  kind: z.literal("clarification"),
  questions: z.array(z.strictObject({
    itemKey: informationItemKeySchema,
    text: boundedText(MAX_QUESTION_CHARS),
  })).min(1).max(MAX_CLARIFICATION_QUESTIONS),
});

/**
 * The model's structured output for one run, in the same two modes the domain contract has.
 * `allowClarification` is false on any turn whose clarification round has already happened, so a
 * second clarification stays unrepresentable rather than merely discouraged.
 */
export function modelOutputSchemaFor({ mode, allowClarification }: { mode: AgentMode; allowClarification: boolean }) {
  const proposition = mode === "prepare"
    ? modelPropositionSchema.extend({ requestedOverrides: modelPropositionSchema.shape.requestedOverrides.max(0) })
    : modelPropositionSchema;

  return allowClarification
    ? z.discriminatedUnion("kind", [proposition, modelClarificationSchema])
    : z.discriminatedUnion("kind", [proposition]);
}

export type ModelOutput = z.infer<ReturnType<typeof modelOutputSchemaFor>>;
export type ModelProposition = z.infer<typeof modelPropositionSchema>;
export type ModelClarification = z.infer<typeof modelClarificationSchema>;
export type ModelBlock = z.infer<typeof modelBlockSchema>;
export type ModelConsequentialLeaf<T> = { value: T; evidence: ConsequentialEvidence };
export type ModelPresentationalLeaf<T> = { value: T; evidence: PresentationalEvidence };
