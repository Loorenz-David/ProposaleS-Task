import type { z } from "zod";

import { MAX_CLARIFICATION_QUESTIONS } from "../schemas/clarification";
import {
  MAX_ANSWER_CHARS,
  MAX_ALTERNATIVE_REASON_CHARS,
  MAX_ASSUMPTION_CHARS,
  MAX_BRIEF_CHARS,
  MAX_COMMENT_CHARS,
  MAX_NARRATIVE_CHARS,
  MAX_NOTE_TEXT_CHARS,
  MAX_QUESTION_CHARS,
  MAX_RATIONALE_CHARS,
  MAX_TITLE_CHARS,
  MAX_WARNING_CHARS,
} from "../schemas/shared";
import { propositionSchema } from "../schemas/proposition";
import { validProposition } from "./propositions";

export type Proposition = z.infer<typeof propositionSchema>;
type AnyRecord = Record<string, any>;

const generationId = "123e4567-e89b-42d3-a456-426614174000";
const draftUuid = "123e4567-e89b-42d3-a456-426614174001";

const itemKeys = [
  "language",
  "title",
  "block_selection",
  "sold_scope",
  "recipient_identity",
  "quantities",
  "recipient_contact_detail",
  "description_narrative",
  "block_comments",
  "deadline_and_terms_notes",
] as const;

export function validState(overrides: Record<string, unknown> = {}): AnyRecord {
  return {
    generationId,
    brief: { text: "Prepare a support proposal.", receivedAt: "2026-09-05T10:14:19.123Z" },
    items: Object.fromEntries(itemKeys.map((key) => [key, { resolution: "supplied" }])) as Record<string, { resolution: "supplied" }>,
    ...overrides,
  };
}

export function maximalConformingState() {
  const maximalize = (value: Proposition): Proposition => {
    const proposition = structuredClone(value) as any;
    proposition.title = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "inferred" };
    proposition.descriptionNarrative = { known: true, value: "x".repeat(MAX_NARRATIVE_CHARS), source: "inferred" };
    proposition.recipient.value.firstName = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
    proposition.recipient.value.lastName = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
    proposition.recipient.value.phone = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
    proposition.recipient.value.companyName = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
    proposition.blocks[0].title = { value: "x".repeat(MAX_TITLE_CHARS), source: "proposales_content", ref: { variationId: "188485" } };
    proposition.blocks[0].description = { known: true, value: "x".repeat(MAX_NARRATIVE_CHARS), source: "proposales_content", ref: { variationId: "188485" } };
    proposition.blocks[0].reviewerComment = { known: true, value: "x".repeat(MAX_COMMENT_CHARS), source: "inferred" };
    proposition.blocks[0].alternatives[0].title = "alternative";
    proposition.blocks[0].alternatives[0].reason = { value: "x".repeat(MAX_ALTERNATIVE_REASON_CHARS), source: "inferred" };
    proposition.commercialNotes[0].text = { value: "x".repeat(MAX_NOTE_TEXT_CHARS), source: "brief", ref: { quote: "x".repeat(300) } };
    proposition.commercialAssumptions = proposition.commercialAssumptions.map((assumption: any) => ({ ...assumption, statedValue: { value: "x".repeat(MAX_ASSUMPTION_CHARS), source: "brief" } }));
    proposition.assumptions[0].note = { value: "x".repeat(MAX_ASSUMPTION_CHARS), source: "inferred" };
    proposition.warnings[0].text = { value: "x".repeat(MAX_WARNING_CHARS), source: "inferred" };
    proposition.warnings[0].reason = "x".repeat(MAX_RATIONALE_CHARS);
    proposition.agentRationale = { known: true, value: "x".repeat(MAX_RATIONALE_CHARS), source: "inferred" };
    return proposition;
  };

  const preparedProposition = maximalize(validProposition());
  const currentProposition = maximalize(validProposition({ version: 2 }));
  return validState({
    brief: { text: "x".repeat(MAX_BRIEF_CHARS), receivedAt: "2026-09-05T10:14:19.123Z" },
    clarification: {
      questions: Array.from({ length: MAX_CLARIFICATION_QUESTIONS }, (_, index) => ({ questionId: `123e4567-e89b-42d3-a456-42661417400${index}`, itemKey: "language", text: "x".repeat(MAX_QUESTION_CHARS) })),
      answers: Array.from({ length: MAX_CLARIFICATION_QUESTIONS }, (_, index) => ({ questionId: `123e4567-e89b-42d3-a456-42661417400${index}`, answer: { kind: "answer", text: "x".repeat(MAX_ANSWER_CHARS) } })),
    },
    preparedProposition,
    currentProposition,
    draftReference: { proposalUuid: draftUuid, editorUrl: "https://proposales.test/p/123e4567-e89b-42d3-a456-426614174001" },
  });
}
