import { z } from "zod";

import { uuidV4Schema } from "@/lib/values/uuid";

import { informationItemKeySchema } from "./information-items";
import { MAX_ANSWER_CHARS, MAX_QUESTION_CHARS, boundedText } from "./shared";

export const MAX_CLARIFICATION_QUESTIONS = 5;

export const clarificationQuestionSchema = z.strictObject({
  questionId: uuidV4Schema,
  itemKey: informationItemKeySchema,
  text: boundedText(MAX_QUESTION_CHARS),
});
export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;

const answerValueSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("answer"), text: boundedText(MAX_ANSWER_CHARS) }),
  z.strictObject({ kind: z.literal("skip"), text: z.never().optional() }),
]);

export const clarificationAnswerSchema = z.strictObject({
  questionId: uuidV4Schema,
  answer: answerValueSchema,
});
export type ClarificationAnswer = z.infer<typeof clarificationAnswerSchema>;

export const clarificationSchema = z.strictObject({
  questions: z.array(clarificationQuestionSchema).max(MAX_CLARIFICATION_QUESTIONS),
  answers: z.array(clarificationAnswerSchema),
});
export type Clarification = z.infer<typeof clarificationSchema>;

export const clarificationAnswersInputSchema = z.strictObject({
  answers: z.array(clarificationAnswerSchema),
});
export type ClarificationAnswersInput = z.infer<typeof clarificationAnswersInputSchema>;
