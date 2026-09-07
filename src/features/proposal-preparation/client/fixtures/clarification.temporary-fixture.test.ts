import { describe, expect, it } from "vitest";

import { temporaryFixtureClarificationAnswered, temporaryFixtureClarificationBatch, temporaryFixtureClarificationSingle } from "./clarification.temporary-fixture";

describe("temporary clarification fixtures", () => {
  it("contains single and batch question sets without answers", () => {
    expect(temporaryFixtureClarificationSingle).toMatchObject({ questions: [expect.any(Object)], answers: [] });
    expect(temporaryFixtureClarificationBatch.questions).toHaveLength(3);
    expect(temporaryFixtureClarificationBatch.answers).toEqual([]);
  });

  it("contains answered, skipped, and open questions", () => {
    expect(temporaryFixtureClarificationAnswered.answers.map((entry) => entry.answer.kind)).toEqual(["answer", "skip"]);
    expect(temporaryFixtureClarificationAnswered.questions).toHaveLength(3);
  });
});
