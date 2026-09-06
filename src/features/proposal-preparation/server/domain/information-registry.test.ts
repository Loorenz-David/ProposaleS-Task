import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    registry: await import("./information-registry"),
    schemas: await import("../../schemas/information-items"),
    clarification: await import("../../schemas/clarification"),
  };
}

const questionId = "123e4567-e89b-42d3-a456-426614174000";
const otherQuestionId = "123e4567-e89b-42d3-a456-426614174001";

function answers(value: AnyRecord): AnyRecord {
  return { answers: [value] };
}

describe("information item registry", () => {
  it.each([
    ["C1(a)", "language", "ask_if_underivable", "required_to_create"],
    ["C1(b)", "title", "do_not_ask", "required_to_create"],
    ["C1(c)", "block_selection", "do_not_ask", "required_to_create"],
    ["C1(d)", "sold_scope", "ask_if_underivable", "not_required"],
    ["C1(e)", "recipient_identity", "ask_if_underivable", "not_required"],
    ["C1(f)", "quantities", "ask_if_underivable", "not_required"],
    ["C1(g)", "recipient_contact_detail", "do_not_ask", "not_required"],
    ["C1(h)", "description_narrative", "do_not_ask", "not_required"],
    ["C1(i)", "block_comments", "do_not_ask", "not_required"],
    ["C1(j)", "deadline_and_terms_notes", "do_not_ask", "not_required"],
  ])("%s records the application policy for %s", async (_id, key, askPolicy, createPolicy) => {
    const { registry } = await modules();
    expect(registry.INFORMATION_REGISTRY[key as keyof typeof registry.INFORMATION_REGISTRY]).toEqual({ askPolicy, createPolicy });
  });

  it("C1(k) is total over the ten item keys", async () => {
    const { registry, schemas } = await modules();
    expect(Object.keys(registry.INFORMATION_REGISTRY).sort()).toEqual([...schemas.INFORMATION_ITEM_KEYS].sort());
  });

  it("C3(a) rejects an unknown question id before applying it", async () => {
    const { registry, clarification } = await modules();
    try {
      registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse(answers({ questionId: otherQuestionId, answer: { kind: "answer", text: "Anna" } })));
      throw new Error("expected ValidationError");
    } catch (error: any) {
      expect(error.constructor.name).toBe("ValidationError");
      expect(error.details).toMatchObject({ reason: "unknown_question_id", issues: [{ path: ["answers", "0", "questionId"] }] });
    }
  });

  it("C3(b) records an explicit skip as deferred", async () => {
    const { registry, clarification } = await modules();
    const result = registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse(answers({ questionId, answer: { kind: "skip" } })));
    expect(result.language).toEqual({ resolution: "deferred_by_user" });
  });

  it("C3(c) records an answer as supplied", async () => {
    const { registry, clarification } = await modules();
    const result = registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse(answers({ questionId, answer: { kind: "answer", text: "Anna" } })));
    expect(result.language).toEqual({ resolution: "supplied" });
  });

  it("C3(d) leaves an item unresolved when it has no answer entry", async () => {
    const { registry, clarification } = await modules();
    const result = registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse({ answers: [] }));
    expect(result.language).toEqual({ resolution: "unresolved" });
  });

  it("C3(e) rejects a duplicate known question id at its second entry", async () => {
    const { registry, clarification } = await modules();
    try {
      registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse({ answers: [
        { questionId, answer: { kind: "answer", text: "Anna" } },
        { questionId, answer: { kind: "answer", text: "Anna" } },
      ] }));
      throw new Error("expected ValidationError");
    } catch (error: any) {
      expect(error.details).toMatchObject({ reason: "domain_rule", issues: [{ path: ["answers", "1", "questionId"] }] });
    }
  });

  it("C3(f) reports unknown before duplicate when both entries use an unknown id", async () => {
    const { registry, clarification } = await modules();
    try {
      registry.applyAnswers(registry.initialItems(), [], clarification.clarificationAnswersInputSchema.parse({ answers: [
        { questionId: otherQuestionId, answer: { kind: "skip" } },
        { questionId: otherQuestionId, answer: { kind: "skip" } },
      ] }));
      throw new Error("expected ValidationError");
    } catch (error: any) {
      expect(error.details).toMatchObject({ reason: "unknown_question_id", issues: [{ path: ["answers", "0", "questionId"] }] });
    }
  });

  it("C3(g) refuses a skip for a do-not-ask item", async () => {
    const { registry, clarification } = await modules();
    try {
      registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "title", text: "Title?" }], clarification.clarificationAnswersInputSchema.parse(answers({ questionId, answer: { kind: "skip" } })));
      throw new Error("expected ValidationError");
    } catch (error: any) {
      expect(error.details).toMatchObject({ reason: "domain_rule", issues: [{ path: ["answers", "0", "answer"] }] });
    }
  });

  it("C3(h) applies answers purely and changes only the addressed resolution", async () => {
    const { registry, clarification } = await modules();
    const original = registry.initialItems();
    const before = structuredClone(original);
    const result = registry.applyAnswers(original, [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse(answers({ questionId, answer: { kind: "answer", text: "Anna" } })));
    expect(result.language).toEqual({ resolution: "supplied" });
    expect(result.title).toEqual(before.title);
    expect(original).toEqual(before);
  });
});
