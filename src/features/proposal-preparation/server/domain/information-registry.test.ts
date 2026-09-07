import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    fixtures: await import("../../fixtures/propositions"),
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

  it("C3(f) reports the first invalid entry by index", async () => {
    const { registry, clarification } = await modules();
    try {
      registry.applyAnswers(registry.initialItems(), [{ questionId, itemKey: "language", text: "Which language?" }], clarification.clarificationAnswersInputSchema.parse({ answers: [
        { questionId: otherQuestionId, answer: { kind: "skip" } },
        { questionId, answer: { kind: "answer", text: "Anna" } },
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

describe("derived item resolutions", () => {
  it("A7(a) reads each item off the proposition the human is looking at", async () => {
    const { registry, fixtures } = await modules();
    const derived = registry.deriveItemResolutions(registry.initialItems(), fixtures.validProposition());

    expect(derived).toEqual({
      language: { resolution: "supplied" },
      title: { resolution: "supplied" },
      block_selection: { resolution: "supplied" },
      sold_scope: { resolution: "supplied" },
      recipient_identity: { resolution: "supplied" },
      quantities: { resolution: "supplied" },
      recipient_contact_detail: { resolution: "supplied" },
      description_narrative: { resolution: "supplied" },
      block_comments: { resolution: "supplied" },
      deadline_and_terms_notes: { resolution: "supplied" },
    });
  });

  it("A7(b) never reads a value out of an absent leaf", async () => {
    const { registry, fixtures } = await modules();
    const proposition = structuredClone(fixtures.validProposition()) as Record<string, any>;
    proposition.language = { known: false };
    proposition.title = { known: false };
    proposition.descriptionNarrative = { known: false };
    proposition.blocks[0].quantity = { known: false };
    proposition.blocks[0].reviewerComment = { known: false };

    const derived = registry.deriveItemResolutions(registry.initialItems(), proposition as never);
    expect(derived.language).toEqual({ resolution: "unresolved" });
    expect(derived.title).toEqual({ resolution: "unresolved" });
    expect(derived.description_narrative).toEqual({ resolution: "unresolved" });
    expect(derived.quantities).toEqual({ resolution: "unresolved" });
    expect(derived.block_comments).toEqual({ resolution: "unresolved" });
  });

  it("A7(c) is authoritative, so a hand-edited record cannot claim an item is supplied", async () => {
    const { registry, fixtures } = await modules();
    const proposition = structuredClone(fixtures.validProposition()) as Record<string, any>;
    proposition.language = { known: false };

    const claimed = registry.initialItems();
    for (const item of Object.values(claimed)) item.resolution = "supplied";

    // The join with the fixed registry is what stops a stale or hand-edited payload relaxing a
    // required-to-create rule, so the derivation must demote as well as promote.
    expect(registry.deriveItemResolutions(claimed, proposition as never).language).toEqual({ resolution: "unresolved" });
  });

  it("A7(d) keeps a deferral rather than reverting it to unresolved", async () => {
    const { registry, fixtures } = await modules();
    const proposition = structuredClone(fixtures.validProposition()) as Record<string, any>;
    proposition.recipient = { known: false };

    const items = registry.initialItems();
    items.recipient_identity.resolution = "deferred_by_user";

    // A skip is a recorded human decision, not an absence.
    expect(registry.deriveItemResolutions(items, proposition as never).recipient_identity)
      .toEqual({ resolution: "deferred_by_user" });

    // A value appearing later supersedes the deferral.
    expect(registry.deriveItemResolutions(items, fixtures.validProposition()).recipient_identity)
      .toEqual({ resolution: "supplied" });
  });

  it("A7(e) satisfies block selection by either disjunct and never vacuously", async () => {
    const { registry, fixtures } = await modules();
    const empty = structuredClone(fixtures.validProposition()) as Record<string, any>;
    empty.blocks = [];
    empty.emptyDraftConfirmation = { known: false };

    const derived = registry.deriveItemResolutions(registry.initialItems(), empty as never);
    expect(derived.block_selection).toEqual({ resolution: "unresolved" });
    expect(derived.sold_scope).toEqual({ resolution: "unresolved" });
    // "Every block has a quantity" over zero blocks would claim quantities were settled.
    expect(derived.quantities).toEqual({ resolution: "unresolved" });

    const confirmed = structuredClone(empty);
    confirmed.emptyDraftConfirmation = { known: true, value: true, source: "human", ref: { editTurn: 1 } };
    expect(registry.deriveItemResolutions(registry.initialItems(), confirmed as never).block_selection)
      .toEqual({ resolution: "supplied" });
  });
});
