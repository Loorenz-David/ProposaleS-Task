import type { TemporaryClarification } from "../../types/temporary-turn";

export const temporaryFixtureClarificationSingle: TemporaryClarification = {
  questions: [
    { questionId: "question-deadline", itemKey: "deadline", text: "What deadline should the proposal state?" },
  ],
  answers: [],
};

export const temporaryFixtureClarificationBatch: TemporaryClarification = {
  questions: [
    { questionId: "question-quantity", itemKey: "chair quantity", text: "How many dining chairs should be included?" },
    { questionId: "question-upholstery", itemKey: "upholstery", text: "Should beige upholstery be included in the scope?" },
    { questionId: "question-deadline", itemKey: "deadline", text: "What deadline should the proposal state?" },
  ],
  answers: [],
};

export const temporaryFixtureClarificationAnswered: TemporaryClarification = {
  ...temporaryFixtureClarificationBatch,
  answers: [
    { questionId: "question-quantity", answer: { kind: "answer", text: "Six chairs" } },
    { questionId: "question-upholstery", answer: { kind: "skip" } },
  ],
};
