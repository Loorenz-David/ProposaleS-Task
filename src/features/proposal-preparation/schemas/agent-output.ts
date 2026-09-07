import { z } from "zod";

import { pathSchema } from "@/lib/values/path";

import { MAX_CLARIFICATION_QUESTIONS } from "./clarification";
import { informationItemKeySchema } from "./information-items";
import {
  MAX_ALTERNATIVES_PER_BLOCK,
  MAX_BLOCKS,
  blockSchema,
  languageCodeSchema,
  propositionSchema,
  warningSchema,
} from "./proposition";
import { MAX_QUESTION_CHARS, MAX_RATIONALE_CHARS, boundedText } from "./shared";

/**
 * Warning kinds the application owns and the model may therefore not emit: it does not know the
 * company currency, and it does not decide what a human set. Every other kind is the model's to
 * report. The two sets are asserted to partition `warningSchema`'s enum in the colocated test, so
 * adding a kind to the proposition without deciding its owner fails.
 */
export const APPLICATION_OWNED_WARNING_KINDS = [
  "currency_mismatch",
  "human_value_kept",
  "human_value_overridden",
] as const;
type ApplicationOwnedWarningKind = (typeof APPLICATION_OWNED_WARNING_KINDS)[number];
type WarningKind = z.infer<typeof warningSchema>["kind"];

export const AGENT_WARNING_KINDS = warningSchema.shape.kind.options.filter(
  (kind): kind is Exclude<WarningKind, ApplicationOwnedWarningKind> =>
    !(APPLICATION_OWNED_WARNING_KINDS as readonly string[]).includes(kind),
);

/** The same warning object as the proposition's, narrowed to the kinds the model may author. */
const agentWarningSchema = warningSchema.extend({ kind: z.enum(AGENT_WARNING_KINDS) });

/**
 * A block as the model writes it. Built by picking the leaves off `blockSchema`, so the
 * provenance unions — including `contentId`'s required `ref.variationId` on the
 * `proposales_content` member — are the same objects the proposition validates against and cannot
 * drift. The application supplies everything omitted here: `productId`, catalog-verbatim `title`
 * and `description`, `pricing`, and each alternative's `matchStrength`, `score` and `productId`.
 */
const agentBlockSchema = blockSchema
  .pick({ contentId: true, quantity: true, optional: true, reviewerComment: true })
  .extend({
    alternatives: z.array(
      blockSchema.shape.alternatives.element.pick({ variationId: true, reason: true }),
    ).max(MAX_ALTERNATIVES_PER_BLOCK),
  });

const agentPropositionSchema = propositionSchema
  .pick({
    language: true,
    title: true,
    descriptionNarrative: true,
    recipient: true,
    commercialNotes: true,
    commercialAssumptions: true,
    assumptions: true,
    agentRationale: true,
  })
  .extend({
    kind: z.literal("proposition"),
    blocks: z.array(agentBlockSchema).max(MAX_BLOCKS),
    warnings: z.array(agentWarningSchema),
    // A path absent from this list is structurally un-overwritable, whatever the body says
    // (§17A.9). Empty in prepare mode, where there is no human value to override.
    requestedOverrides: z.array(z.strictObject({
      path: pathSchema,
      reason: boundedText(MAX_RATIONALE_CHARS),
    })),
  });

const agentClarificationSchema = z.strictObject({
  kind: z.literal("clarification"),
  // The server assigns each question's id and records the item; the model names the topic and
  // writes the text. Truncating an over-cap list would lose a question the agent judged
  // necessary, so the cap fails the parse instead (§17A.7).
  questions: z.array(z.strictObject({
    itemKey: informationItemKeySchema,
    text: boundedText(MAX_QUESTION_CHARS),
  })).min(1).max(MAX_CLARIFICATION_QUESTIONS),
});

export type AgentMode = "prepare" | "revise";

/**
 * The model's structured output for one run. `allowClarification` is false on any turn that has
 * already had its clarification round, so a second clarification is not merely discouraged by the
 * prompt — it is not a representable output (§17A.7).
 */
export function agentOutputSchemaFor({ mode, allowClarification }: { mode: AgentMode; allowClarification: boolean }) {
  const proposition = mode === "prepare"
    ? agentPropositionSchema.extend({ requestedOverrides: agentPropositionSchema.shape.requestedOverrides.max(0) })
    : agentPropositionSchema;

  return allowClarification
    ? z.discriminatedUnion("kind", [proposition, agentClarificationSchema])
    : z.discriminatedUnion("kind", [proposition]);
}

export type AgentOutput = z.infer<ReturnType<typeof agentOutputSchemaFor>>;
export type AgentProposition = z.infer<typeof agentPropositionSchema>;
export type AgentClarification = z.infer<typeof agentClarificationSchema>;

/**
 * The output of the derivation step that runs before the main run when the proposal language is
 * still unknown. `null` means the model could not derive one from the brief, which becomes a
 * clarification naming `language` (§8.1: derive first, ask only when derivation is ambiguous).
 */
export const languageDerivationOutputSchema = z.strictObject({
  language: languageCodeSchema.nullable(),
});
export type LanguageDerivationOutput = z.infer<typeof languageDerivationOutputSchema>;
