import {
  clarificationSchema,
  type Clarification,
  type ClarificationQuestion,
} from "../../schemas/clarification";
import { domainResultSchema, type DomainResult } from "../../schemas/turn-result";

/**
 * Clarification fixtures in the real shape. Question ids are uuid v4 and item keys come from
 * `INFORMATION_ITEM_KEYS`; the fixture era used readable slugs for both, which the schema refuses.
 * The question wording is unchanged, so the assertions written against it still hold. Test-only.
 */
const QUANTITY_QUESTION = "00000000-0000-4000-8000-000000000001";
const UPHOLSTERY_QUESTION = "00000000-0000-4000-8000-000000000002";
const DEADLINE_QUESTION = "00000000-0000-4000-8000-000000000003";

const deadline: ClarificationQuestion = {
  questionId: DEADLINE_QUESTION,
  itemKey: "deadline_and_terms_notes",
  text: "What deadline should the proposal state?",
};

const batchQuestions: ClarificationQuestion[] = [
  {
    questionId: QUANTITY_QUESTION,
    itemKey: "quantities",
    text: "How many dining chairs should be included?",
  },
  {
    questionId: UPHOLSTERY_QUESTION,
    itemKey: "block_selection",
    text: "Should beige upholstery be included in the scope?",
  },
  deadline,
];

export const fixtureClarificationSingle: Clarification = clarificationSchema.parse({
  questions: [deadline],
  answers: [],
});

export const fixtureClarificationBatch: Clarification = clarificationSchema.parse({
  questions: batchQuestions,
  answers: [],
});

export const fixtureClarificationAnswered: Clarification = clarificationSchema.parse({
  questions: batchQuestions,
  answers: [
    { questionId: QUANTITY_QUESTION, answer: { kind: "answer", text: "Six chairs" } },
    { questionId: UPHOLSTERY_QUESTION, answer: { kind: "skip" } },
  ],
});

/**
 * The result member carries only the questions: answers live on the workflow state, not on the
 * result the turn returned (§1.2). The two are read together by the thread and panel adapters.
 */
export const fixtureClarificationResult: DomainResult = domainResultSchema.parse({
  status: "clarification",
  questions: batchQuestions,
});

export const fixtureClarificationResultBudgetExhausted: DomainResult = domainResultSchema.parse({
  status: "clarification",
  questions: [deadline],
  budgetExhausted: { budget: "tool_calls" },
});
