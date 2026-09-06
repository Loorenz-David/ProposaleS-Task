import { describe, expect, it } from "vitest";

const question = (text = "Which language?") => ({ questionId: "123e4567-e89b-42d3-a456-426614174000", itemKey: "language", text });
const answer = (value: unknown) => ({ answers: [{ questionId: "123e4567-e89b-42d3-a456-426614174000", answer: value }] });

describe("clarification schemas", () => {
  it("C4(a) accepts exactly the question cap", async () => {
    const { clarificationSchema, MAX_CLARIFICATION_QUESTIONS } = await import("./clarification");
    expect(clarificationSchema.safeParse({ questions: Array.from({ length: MAX_CLARIFICATION_QUESTIONS }, (_, index) => ({ ...question(), questionId: `123e4567-e89b-42d3-a456-42661417400${index}` })), answers: [] }).success).toBe(true);
  });

  it("C4(b) rejects one question over the cap at questions", async () => {
    const { clarificationSchema, MAX_CLARIFICATION_QUESTIONS } = await import("./clarification");
    const result = clarificationSchema.safeParse({ questions: Array.from({ length: MAX_CLARIFICATION_QUESTIONS + 1 }, () => question()), answers: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join(".") === "questions")).toBe(true);
  });

  it("C4(c) rejects an over-cap question text", async () => {
    const { clarificationQuestionSchema } = await import("./clarification");
    const { MAX_QUESTION_CHARS } = await import("./shared");
    expect(clarificationQuestionSchema.safeParse(question("x".repeat(MAX_QUESTION_CHARS + 1))).success).toBe(false);
  });

  it("C4(d) rejects an over-cap answer text", async () => {
    const { clarificationAnswersInputSchema } = await import("./clarification");
    const { MAX_ANSWER_CHARS } = await import("./shared");
    expect(clarificationAnswersInputSchema.safeParse(answer({ kind: "answer", text: "x".repeat(MAX_ANSWER_CHARS + 1) })).success).toBe(false);
  });

  it("C4(e) rejects text on the strict skip arm at answer.text", async () => {
    const { clarificationAnswersInputSchema } = await import("./clarification");
    const result = clarificationAnswersInputSchema.safeParse(answer({ kind: "skip", text: "x" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join(".") === "answers.0.answer.text")).toBe(true);
  });
});
