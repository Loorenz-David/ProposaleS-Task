import { describe, expect, it } from "vitest";

import { MAX_INSTRUCTION_CHARS } from "./shared";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    conversation: await import("./conversation"),
    fixtures: await import("../fixtures/conversations"),
    states: await import("../fixtures/states"),
    workflow: await import("./workflow-state"),
  };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

function firstIssue(result: AnyRecord): AnyRecord {
  if (result.success) throw new Error("expected parse failure");
  return result.error.issues[0];
}

describe("conversation schema", () => {
  it("C1(a) parses a valid context and survives a JSON round trip", async () => {
    const { conversation, fixtures } = await modules();
    const context = fixtures.conversationWith(4);
    expect(conversation.conversationContextSchema.parse(JSON.parse(JSON.stringify(context)))).toEqual(context);
  });

  it("C1(b) rejects unknown keys with the printed raw paths", async () => {
    const { conversation, fixtures } = await modules();
    const context = fixtures.conversationWith(1);
    const contextIssue = firstIssue(conversation.conversationContextSchema.safeParse({ ...context, foo: 1 }));
    expect({ code: contextIssue.code, path: contextIssue.path, keys: contextIssue.keys }).toEqual({ code: "unrecognized_keys", path: [], keys: ["foo"] });

    const turn = clone(context.turns[0]);
    turn.foo = 1;
    const turnIssue = firstIssue(conversation.conversationContextSchema.safeParse({ ...context, turns: [turn] }));
    expect({ code: turnIssue.code, path: turnIssue.path, keys: turnIssue.keys }).toEqual({ code: "unrecognized_keys", path: ["turns", 0], keys: ["foo"] });
  });

  it("C1(c) enforces the turn cap", async () => {
    const { conversation, fixtures } = await modules();
    const over = fixtures.conversationWith(conversation.MAX_CONVERSATION_TURNS + 1);
    const issue = firstIssue(conversation.conversationContextSchema.safeParse(over));
    expect({ code: issue.code, path: issue.path }).toEqual({ code: "too_big", path: ["turns"] });
    expect(conversation.conversationContextSchema.safeParse(fixtures.conversationWith(conversation.MAX_CONVERSATION_TURNS)).success).toBe(true);
  });

  it("C1(d) enforces the text cap after trimming", async () => {
    const { conversation, fixtures } = await modules();
    const over = fixtures.conversationWith(1);
    over.turns[0].text = "x".repeat(conversation.MAX_TURN_TEXT_CHARS + 1);
    const issue = firstIssue(conversation.conversationContextSchema.safeParse(over));
    expect({ code: issue.code, path: issue.path }).toEqual({ code: "too_big", path: ["turns", 0, "text"] });

    const padded = fixtures.conversationWith(1);
    padded.turns[0].text = `  x  `;
    expect(conversation.conversationContextSchema.parse(padded).turns[0].text).toBe("x");

  });

  it("C1(e) rejects uppercase UUIDs and timestamps without milliseconds", async () => {
    const { conversation, fixtures } = await modules();
    const uppercase = fixtures.conversationWith(1);
    uppercase.turns[0].turnId = "123e4567-e89b-42d3-a456-426614174001".toUpperCase();
    const uppercaseIssue = firstIssue(conversation.conversationContextSchema.safeParse(uppercase));
    expect({ code: uppercaseIssue.code, path: uppercaseIssue.path }).toEqual({ code: "invalid_format", path: ["turns", 0, "turnId"] });

    const noMilliseconds = fixtures.conversationWith(1);
    noMilliseconds.turns[0].at = "2026-01-01T00:00:00Z";
    const timestampIssue = firstIssue(conversation.conversationContextSchema.safeParse(noMilliseconds));
    expect({ code: timestampIssue.code, path: timestampIssue.path }).toEqual({ code: "invalid_format", path: ["turns", 0, "at"] });
  });

  it("C1(f) binds propositionVersion to assistant proposition turns", async () => {
    const { conversation, fixtures } = await modules();
    const assistant = {
      role: "assistant" as const,
      turnId: "00000000-0000-4000-8000-000000000001",
      at: "2026-01-01T00:00:00.000Z",
      kind: "proposition" as const,
      text: "Assistant turn",
      propositionVersion: undefined,
    };
    const proposition = { turns: [assistant], omittedTurns: 0 };
    const missing = firstIssue(conversation.conversationContextSchema.safeParse(proposition));
    expect({ code: missing.code, path: missing.path }).toEqual({ code: "custom", path: ["turns", 0, "propositionVersion"] });

    const clarification = { turns: [{ ...assistant, kind: "clarification" as const, propositionVersion: 1 }], omittedTurns: 0 };
    const forbidden = firstIssue(conversation.conversationContextSchema.safeParse(clarification));
    expect({ code: forbidden.code, path: forbidden.path }).toEqual({ code: "custom", path: ["turns", 0, "propositionVersion"] });

    const human = fixtures.conversationWith(1);
    (human.turns[0] as AnyRecord).propositionVersion = 1;
    const humanIssue = firstIssue(conversation.conversationContextSchema.safeParse(human));
    expect({ code: humanIssue.code, path: humanIssue.path, keys: humanIssue.keys }).toEqual({ code: "unrecognized_keys", path: ["turns", 0], keys: ["propositionVersion"] });
  });

  it("C1(g) exports the two related constants", async () => {
    const { conversation } = await modules();
    expect(Number.isInteger(conversation.MAX_CONVERSATION_TURNS)).toBe(true);
    expect(conversation.MAX_CONVERSATION_TURNS % 2).toBe(0);
    expect(conversation.MAX_CONVERSATION_TURNS).toBeGreaterThanOrEqual(4);
    expect(Number.isInteger(conversation.MAX_TURN_TEXT_CHARS)).toBe(true);
    expect(conversation.MAX_TURN_TEXT_CHARS).toBeGreaterThanOrEqual(MAX_INSTRUCTION_CHARS);
  });

  it("C1(h) bounds omittedTurns as a non-negative integer", async () => {
    const { conversation } = await modules();
    expect(conversation.conversationContextSchema.safeParse({ turns: [], omittedTurns: -1 }).success).toBe(false);
    expect(conversation.conversationContextSchema.safeParse({ turns: [], omittedTurns: 1.5 }).success).toBe(false);
    expect(conversation.conversationContextSchema.safeParse({ turns: [], omittedTurns: 0 }).success).toBe(true);
  });

  it("C1(i) accepts text exactly at MAX_TURN_TEXT_CHARS", async () => {
    const { conversation, fixtures } = await modules();
    const exact = fixtures.conversationWith(1);
    exact.turns[0].text = "x".repeat(conversation.MAX_TURN_TEXT_CHARS);
    expect(conversation.conversationContextSchema.safeParse(exact).success).toBe(true);
  });

  it("C6(a) keeps conversation outside strict workflow state", async () => {
    const { states, workflow } = await modules();
    try {
      workflow.parseProposalWorkflowState({ ...states.validState(), conversation: { turns: [], omittedTurns: 0 } }, "https://proposales.test");
      throw new Error("expected workflow validation failure");
    } catch (error) {
      expect((error as AnyRecord).details?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["conversation"] })]));
    }
  });

  it("C6(b) keeps state outside strict conversation context", async () => {
    const { conversation, states } = await modules();
    const result = conversation.conversationContextSchema.safeParse({ turns: [], omittedTurns: 0, state: states.validState() });
    expect(result.success).toBe(false);
    if (result.success) return;
    const issue = result.error.issues[0] as AnyRecord;
    expect({ code: issue.code, path: issue.path, keys: issue.keys }).toEqual({ code: "unrecognized_keys", path: [], keys: ["state"] });
  });

});
