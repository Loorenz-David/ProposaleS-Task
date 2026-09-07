import { describe, expect, it, vi } from "vitest";

import { createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";

import { BRIEFS } from "../../fixtures/briefs";
import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { agentClarificationOutput, finalStep, languageStep, modelPropositionOutput, proposeWithHumanEmail, proposeWithoutRecipient, searchStep } from "../../fixtures/scripts";
import { prepareFromBrief, type PrepareDeps } from "./prepare-from-brief";
import { answerClarification } from "./answer-clarification";

type AnyRecord = Record<string, any>;
const EDITOR_ORIGIN = "https://proposales.test";
const NOW = Date.parse("2026-09-07T10:00:00.000Z");
const QUESTION_ID = "00000000-0000-4000-8000-000000000300";
let turnIndex = 0;

function deps(steps: Parameters<typeof createScriptedAiClient>[0], proposales = createFakeProposalesClient({ catalog: FIXTURE_CATALOG })) {
  const ai = createScriptedAiClient(steps);
  const value: PrepareDeps = {
    ai,
    proposales,
    now: () => NOW,
    newGenerationId: () => "00000000-0000-4000-8000-000000000100",
    newQuestionId: () => QUESTION_ID,
    newTurnId: () => `00000000-0000-4000-8000-${String(200 + turnIndex++).padStart(12, "0")}`,
    newRunId: () => "run-1",
    logger: createLogger({ sink: vi.fn() }),
    editorOrigin: EDITOR_ORIGIN,
  };
  return { ai, proposales, value };
}

async function clarification(proposales = createFakeProposalesClient({ catalog: FIXTURE_CATALOG })) {
  turnIndex = 0;
  const first = deps([languageStep("en"), finalStep(agentClarificationOutput())], proposales);
  const result = await prepareFromBrief({ brief: BRIEFS.noRecipient }, first.value);
  return { result, proposales };
}

describe("answerClarification", () => {
  it("P4 records a skip as deferred and appends no human answer turn", async () => {
    const first = await clarification();
    const next = deps(proposeWithoutRecipient({ deriveLanguage: false }), first.proposales);
    const result = await answerClarification({
      state: first.result.state,
      conversation: first.result.conversation,
      answers: [{ questionId: QUESTION_ID, answer: { kind: "skip" } }],
    }, next.value);
    expect(result.result.status).toBe("proposition");
    expect(result.state.currentProposition?.recipient).toEqual({ known: false });
    expect(result.state.items.recipient_identity).toEqual({ resolution: "deferred_by_user" });
    expect(result.state.currentProposition?.unresolvedItems).toContainEqual({ itemKey: "recipient_identity", resolution: "deferred_by_user" });
    expect(result.conversation.turns.map((turn) => turn.role)).toEqual(["assistant", "assistant"]);
    expect(first.proposales.writes).toBe(0);
    expect(() => first.proposales.assertNoWrites()).not.toThrow();
  });

  it("P4 accepts an answered question as the provenance for a human email", async () => {
    const first = await clarification();
    // The model cites the alias for the question it was asked; the application is what knows which
    // question id that is, and puts it in the ref.
    const next = deps(proposeWithHumanEmail("Q1", { deriveLanguage: false }), first.proposales);
    const answerText = "Anna, anna@example.se";
    const result = await answerClarification({
      state: first.result.state,
      conversation: first.result.conversation,
      answers: [{ questionId: QUESTION_ID, answer: { kind: "answer", text: answerText } }],
    }, next.value);
    expect(result.state.currentProposition?.recipient).toMatchObject({
      known: true,
      value: { email: { known: true, value: "anna@example.se", source: "human", ref: { questionId: QUESTION_ID } } },
    });
    expect(result.state.items.recipient_identity).toEqual({ resolution: "supplied" });
    const initialMessages = next.ai.calls[0].messages.filter((message): message is { role: "user"; content: string } => "content" in message);
    expect(initialMessages.find((message) => message.content.includes("<<<clarification_answers"))?.content).toContain(answerText);
    expect(initialMessages.find((message) => message.content.includes("<<<conversation_history"))?.content).not.toContain(answerText);
  });

  it("P8(b) answers the round without deriving the language a second time", async () => {
    const first = await clarification();
    // The first turn derived it, so it is workflow state now and the answer turn starts from it.
    expect(first.result.state.derivedLanguage).toBe("en");

    const next = deps(proposeWithoutRecipient({ deriveLanguage: false }), first.proposales);
    const result = await answerClarification({
      state: first.result.state,
      conversation: first.result.conversation,
      answers: [{ questionId: QUESTION_ID, answer: { kind: "skip" } }],
    }, next.value);

    expect(result.result.status).toBe("proposition");
    // A derivation call is the one that carries no tools. Every call this turn made has both.
    expect(next.ai.calls.map((call) => call.tools.length)).not.toContain(0);
    expect(next.ai.calls[0].messages.some((message) => "content" in message && message.content.includes("proposal language: en"))).toBe(true);
  });

  it("P8(c) derives again when the human answers the language question", async () => {
    const first = await clarification();
    const state = { ...first.result.state, clarification: { questions: [{ questionId: QUESTION_ID, itemKey: "language" as const, text: "Which language?" }], answers: [] } };
    const next = deps(proposeWithoutRecipient({ deriveLanguage: true }), first.proposales);
    const result = await answerClarification({
      state,
      conversation: first.result.conversation,
      answers: [{ questionId: QUESTION_ID, answer: { kind: "answer", text: "Swedish, please." } }],
    }, next.value);

    expect(result.result.status).toBe("proposition");
    // The human answered about language, so the carried code does not decide it: the turn derives.
    expect(next.ai.calls[0].tools).toHaveLength(0);
  });

  it("P8(d) ignores a carried language the catalog no longer offers", async () => {
    const first = await clarification();
    const state = { ...first.result.state, derivedLanguage: "de" as const };
    const next = deps(proposeWithoutRecipient({ deriveLanguage: true }), first.proposales);
    const result = await answerClarification({
      state,
      conversation: first.result.conversation,
      answers: [{ questionId: QUESTION_ID, answer: { kind: "skip" } }],
    }, next.value);

    expect(result.result.status).toBe("proposition");
    expect(next.ai.calls[0].tools).toHaveLength(0);
  });

  it("P7 cannot represent a second clarification and reports later missing title as unresolved", async () => {
    const first = await clarification();
    const invalid = deps([
      languageStep("en"),
      finalStep(agentClarificationOutput()),
      finalStep(agentClarificationOutput()),
      finalStep(agentClarificationOutput()),
    ], first.proposales);
    const failure = await answerClarification({ state: first.result.state, answers: [], conversation: first.result.conversation }, invalid.value);
    expect(failure.result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid", code: "validation_error" } });

    const output = modelPropositionOutput({ title: null });
    const later = deps([languageStep("en"), searchStep("consulting training workshop"), finalStep(output)], first.proposales);
    const proposition = await answerClarification({ state: first.result.state, answers: [], conversation: first.result.conversation }, later.value);
    expect(proposition.result.status).toBe("proposition");
    expect(proposition.state.currentProposition?.unresolvedItems).toContainEqual({ itemKey: "title", resolution: "unresolved" });
  });

  it("P6 refuses a human value the human never gave, and cannot be given a question id to forge", async () => {
    const first = await clarification();
    const recipientCiting = (ref: string) => ({
      firstName: null,
      lastName: null,
      email: { value: "bad@example.se", evidence: { kind: "answer", ref } },
      phone: null,
      companyName: null,
    });

    // This turn answers nothing, so no alias is citable and the value has no human behind it.
    const unanswered = deps([
      languageStep("en"),
      searchStep("consulting training workshop"),
      ...Array.from({ length: 3 }, () => finalStep(modelPropositionOutput({ recipient: recipientCiting("Q1") }))),
    ], first.proposales);
    const result = await answerClarification({ state: first.result.state, answers: [], conversation: first.result.conversation }, unanswered.value);
    expect(result.result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid", code: "validation_error" } });
    expect((result.result as AnyRecord).failure.issues).toEqual([{
      path: ["recipient", "email"],
      message: "evidence Q1 names a question this turn carries no answer for",
    }]);

    // And the older failure mode is gone rather than merely caught: a question id is not something
    // this contract can express, so a model cannot name one that was never asked.
    const forged = deps([
      languageStep("en"),
      searchStep("consulting training workshop"),
      ...Array.from({ length: 3 }, () => finalStep(modelPropositionOutput({ recipient: recipientCiting("00000000-0000-4000-8000-000000000999") }))),
    ], first.proposales);
    const forgedResult = await answerClarification({ state: first.result.state, answers: [], conversation: first.result.conversation }, forged.value);
    expect(forgedResult.result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid" } });
    expect(JSON.stringify(forgedResult.result)).toContain("recipient");
  });
});
