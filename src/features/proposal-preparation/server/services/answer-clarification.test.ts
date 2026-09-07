import { describe, expect, it, vi } from "vitest";

import { createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";

import { BRIEFS } from "../../fixtures/briefs";
import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { agentClarificationOutput, agentPropositionOutput, finalStep, languageStep, proposeWithHumanEmail, proposeWithoutRecipient, searchStep } from "../../fixtures/scripts";
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
    const next = deps(proposeWithoutRecipient(), first.proposales);
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
    const next = deps(proposeWithHumanEmail(QUESTION_ID), first.proposales);
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

    const output = agentPropositionOutput({ title: { known: false } });
    const later = deps([languageStep("en"), searchStep("consulting training workshop"), finalStep(output)], first.proposales);
    const proposition = await answerClarification({ state: first.result.state, answers: [], conversation: first.result.conversation }, later.value);
    expect(proposition.result.status).toBe("proposition");
    expect(proposition.state.currentProposition?.unresolvedItems).toContainEqual({ itemKey: "title", resolution: "unresolved" });
  });

  it("P6 refuses a human leaf whose question id was not answered", async () => {
    const first = await clarification();
    const output = agentPropositionOutput();
    const recipient = structuredClone(output.recipient) as AnyRecord;
    recipient.value.email = { known: true, value: "bad@example.se", source: "human", ref: { questionId: "00000000-0000-4000-8000-000000000999" } };
    const next = deps([languageStep("en"), searchStep("consulting training workshop"), finalStep({ ...output, recipient })], first.proposales);
    const result = await answerClarification({ state: first.result.state, answers: [], conversation: first.result.conversation }, next.value);
    expect(result.result).toEqual({
      status: "failed",
      failure: {
        reason: "model_output_invalid",
        code: "validation_error",
        issues: [{
          path: ["recipient", "value", "email"],
          message: "Human provenance does not reference an answered question, a preserved human value, or the current instruction.",
        }],
      },
    });
  });
});
