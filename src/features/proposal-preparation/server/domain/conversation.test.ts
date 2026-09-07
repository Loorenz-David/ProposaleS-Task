import { describe, expect, expectTypeOf, it } from "vitest";

import type { ConversationTurn } from "../../schemas/conversation";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    domain: await import("./conversation"),
    schema: await import("../../schemas/conversation"),
    fixtures: await import("../../fixtures/conversations"),
    propositions: await import("../../fixtures/propositions"),
  };
}

describe("conversation domain", () => {
  it("C2(a) appends within the cap in order", async () => {
    const { domain, schema, fixtures } = await modules();
    const context = fixtures.conversationWith(schema.MAX_CONVERSATION_TURNS - 2);
    const added = fixtures.conversationWith(2).turns;
    const result = domain.appendTurns(context, added);
    expect(result.turns).toHaveLength(schema.MAX_CONVERSATION_TURNS);
    expect(result.omittedTurns).toBe(0);
    expect(result.turns).toEqual([...context.turns, ...added]);
  });

  it("C2(b) drops the oldest turns and keeps the exact newest sequence", async () => {
    const { domain, schema, fixtures } = await modules();
    const context = fixtures.fullConversation();
    const added = fixtures.conversationWith(2).turns.map((turn, index) => ({ ...turn, turnId: `00000000-0000-4000-8000-${String(100 + index + 1).padStart(12, "0")}` }));
    const result = domain.appendTurns(context, added);
    expect(result.turns.map((turn: AnyRecord) => turn.turnId)).toEqual([
      ...context.turns.slice(2).map((turn: AnyRecord) => turn.turnId),
      ...added.map((turn: AnyRecord) => turn.turnId),
    ]);
    expect(result.turns).toHaveLength(schema.MAX_CONVERSATION_TURNS);
    expect(result.omittedTurns).toBe(2);
  });

  it("C2(c) is pure and returns equivalent independent results", async () => {
    const { domain, fixtures } = await modules();
    const input = fixtures.conversationWith(3);
    const before = structuredClone(input);
    const added = fixtures.conversationWith(1).turns;
    const first = domain.appendTurns(input, added);
    const second = domain.appendTurns(input, added);
    expect(input).toEqual(before);
    expect(first).not.toBe(input);
    expect(first.turns).not.toBe(input.turns);
    expect(first).toEqual(second);
  });

  it("C2(d) makes absence an empty parsed context", async () => {
    const { domain, schema } = await modules();
    const empty = domain.emptyConversation();
    const secondEmpty = domain.emptyConversation();
    expect(empty).toEqual({ turns: [], omittedTurns: 0 });
    expect(schema.conversationContextSchema.parse(empty)).toEqual(empty);
    expect(secondEmpty).not.toBe(empty);
    expect(secondEmpty.turns).not.toBe(empty.turns);
  });

  it("C2(e) accumulates omitted turns across appends", async () => {
    const { domain, fixtures, schema } = await modules();
    const first = domain.appendTurns(fixtures.fullConversation(), fixtures.conversationWith(2).turns);
    const second = domain.appendTurns(first, fixtures.conversationWith(3).turns);
    expect(second.omittedTurns).toBe(5);
    expect(second.turns).toHaveLength(schema.MAX_CONVERSATION_TURNS);
  });

  it("C2(f) constructs each intended turn role and schema variant", async () => {
    const { domain, schema } = await modules();
    const human = domain.humanTurn({ turnId: "00000000-0000-4000-8000-000000000001", at: "2026-01-01T00:00:00.000Z", text: "Human" });
    const assistant = domain.assistantTurn({ turnId: "00000000-0000-4000-8000-000000000002", at: "2026-01-01T00:00:01.000Z", kind: "clarification", text: "Assistant" });
    expect(human.role).toBe("human");
    expect(assistant.role).toBe("assistant");
    expect(schema.conversationTurnSchema.parse(human)).toEqual(human);
    expect(schema.conversationTurnSchema.parse(assistant)).toEqual(assistant);
  });

  it("C3(a) renders a proposition with exact ids, titles, strengths, and sorted lists", async () => {
    const { domain, propositions } = await modules();
    expect(domain.renderAssistantTurn({ status: "proposition" }, propositions.propositionWithAlternatives())).toBe([
      "Proposed version 3.",
      "Block 1: Consulting Training Service Bundle (content 1)",
      "  alternative 1: Consulting Workshop Service Track (content 2, possible)",
      "  alternative 2: Training Service Overview (content 3, weak)",
      "Block 2: Service Analytics Dashboard (content 5)",
      "Warnings: non_strong_selection, weak_match",
      "Unresolved: deadline_and_terms_notes, quantities",
      "Reused the closest catalog match.",
    ].join("\n"));
  });

  it("C3(b) renders clarification ids and topics without question text", async () => {
    const { domain } = await modules();
    const result = domain.renderAssistantTurn({
      status: "clarification",
      questions: [
        { questionId: "q1", itemKey: "language", text: "Q-TEXT-1" },
        { questionId: "q2", itemKey: "quantities", text: "Q-TEXT-2" },
      ],
    } as unknown as import("./conversation").RenderableResult);
    expect(result).toBe("Asked 2 question(s):\n  [q1] language\n  [q2] quantities");
    expect(result).not.toContain("Q-TEXT-1");
    expect(result).not.toContain("Q-TEXT-2");
    expect(domain.renderAssistantTurn({ status: "clarification", questions: [{ questionId: "q3", itemKey: "language" }] })).toBe("Asked 1 question(s):\n  [q3] language");
  });

  it("C3(c) renders a failed preparation exactly", async () => {
    const { domain } = await modules();
    expect(domain.renderAssistantTurn({ status: "failed", failure: { reason: "budget_exhausted" } })).toBe("Preparation failed: budget_exhausted");
  });

  it("C3(d) cuts an oversized render inside the text budget", async () => {
    const { domain, schema, propositions } = await modules();
    const fixture = propositions.maximalConformingProposition();
    const rendered = domain.renderAssistantTurn({ status: "proposition" }, fixture);
    const uncut = [
      `Proposed version ${fixture.version}.`,
      ...fixture.blocks.flatMap((block, blockIndex) => [
        `Block ${blockIndex + 1}: ${block.title.value} (content ${block.contentId.value})`,
        ...block.alternatives.map((alternative, alternativeIndex) => `  alternative ${alternativeIndex + 1}: ${alternative.title} (content ${alternative.variationId}, ${alternative.matchStrength})`),
      ]),
      `Warnings: ${fixture.warnings.map((warning) => warning.kind).sort().join(", ")}`,
      `Unresolved: ${fixture.unresolvedItems.map((item) => item.itemKey).sort().join(", ")}`,
      (fixture.agentRationale as { value: string }).value,
    ].join("\n");
    expect(uncut.length).toBeGreaterThan(schema.MAX_TURN_TEXT_CHARS);
    expect(rendered.length).toBeLessThanOrEqual(schema.MAX_TURN_TEXT_CHARS);
    const lines = rendered.split("\n");
    const renderedBlockLines = lines.filter((line) => line.startsWith("Block "));
    const omitted = fixture.blocks.length - renderedBlockLines.length;
    expect(lines.at(-1)).toBe(`… ${omitted} more blocks not summarised.`);
    expect(lines.slice(1, -1).every((line) => line.startsWith("Block ") || line.startsWith("  alternative "))).toBe(true);
    expect(rendered).not.toContain(" […]");
    expect(rendered).toBe(domain.renderAssistantTurn({ status: "proposition" }, fixture));
  });

  it("C3(e) renders bounded presence while excluding warning and URL free text", async () => {
    const { domain, propositions } = await modules();
    const proposition = propositions.propositionWithAlternatives();
    proposition.warnings[0].text = { value: "See https://evil.test/LEAK for details.", source: "inferred" };
    proposition.assumptions[0].note = { value: "See https://evil.test/LEAK for details.", source: "inferred" };
    const rendered = domain.renderAssistantTurn({ status: "proposition" }, proposition);
    expect(rendered).not.toContain("LEAK");
    expect(rendered).not.toContain("https://");
    expect(rendered).toContain("Warnings: non_strong_selection, weak_match");
    expect(rendered).toContain("content 1");
  });

  it("C3(f) keeps renderable statuses exactly aligned with assistant turn kinds", () => {
    type AssistantKind = Extract<ConversationTurn, { role: "assistant" }>["kind"];
    expectTypeOf<import("./conversation").RenderableResult["status"]>().toEqualTypeOf<AssistantKind>();
  });

  it("C3(g) keeps the maximal render parseable at the turn-text cap", async () => {
    const { domain, schema, propositions } = await modules();
    const text = domain.renderAssistantTurn({ status: "proposition" }, propositions.maximalConformingProposition());
    expect(text.length).toBe(schema.MAX_TURN_TEXT_CHARS);
    const turn = domain.assistantTurn({ turnId: "00000000-0000-4000-8000-000000000001", at: "2026-01-01T00:00:00.000Z", kind: "proposition", propositionVersion: 1, text });
    expect(schema.conversationTurnSchema.safeParse(turn).success).toBe(true);
  });

  it("C3(h) omits empty warning, unresolved, and unknown-rationale lines", async () => {
    const { domain, propositions } = await modules();
    const proposition = propositions.propositionWithAlternatives();
    proposition.warnings = [];
    proposition.unresolvedItems = [];
    proposition.agentRationale = { known: false };
    expect(domain.renderAssistantTurn({ status: "proposition" }, proposition)).toBe([
      "Proposed version 3.",
      "Block 1: Consulting Training Service Bundle (content 1)",
      "  alternative 1: Consulting Workshop Service Track (content 2, possible)",
      "  alternative 2: Training Service Overview (content 3, weak)",
      "Block 2: Service Analytics Dashboard (content 5)",
    ].join("\n"));
  });
});
