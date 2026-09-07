import { describe, expect, it, vi } from "vitest";

import { createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";

import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { conversationWith, fullConversation } from "../../fixtures/conversations";
import { finalStep, getContentStep, modelBlock, modelPropositionOutput, searchStep, selectPrevious, selectSecondAlternative } from "../../fixtures/scripts";
import { propositionWithAlternatives } from "../../fixtures/propositions";
import { validState } from "../../fixtures/states";
import { MAX_CONVERSATION_TURNS } from "../../schemas/conversation";
import { renderAssistantTurn } from "../domain/conversation";
import type { ReviseDeps } from "./revise-proposition";
import { reviseProposition } from "./revise-proposition";

type AnyRecord = Record<string, any>;
const EDITOR_ORIGIN = "https://proposales.test";
const HUMAN_TURN_ID = "00000000-0000-4000-8000-000000000701";
const ASSISTANT_TURN_ID = "00000000-0000-4000-8000-000000000702";

function harness(steps: Parameters<typeof createScriptedAiClient>[0]) {
  const ai = createScriptedAiClient(steps);
  const proposales = createFakeProposalesClient({ catalog: FIXTURE_CATALOG });
  let turn = 0;
  const deps: ReviseDeps = {
    ai,
    proposales,
    now: () => Date.parse("2026-09-07T12:00:00.000Z"),
    newGenerationId: () => "00000000-0000-4000-8000-000000000700",
    newQuestionId: () => "00000000-0000-4000-8000-000000000703",
    newTurnId: () => [HUMAN_TURN_ID, ASSISTANT_TURN_ID][turn++] ?? `00000000-0000-4000-8000-${String(704 + turn).padStart(12, "0")}`,
    newRunId: () => "run-revise",
    logger: createLogger({ sink: vi.fn() }),
    editorOrigin: EDITOR_ORIGIN,
  };
  return { ai, proposales, deps };
}

function revisionState() {
  const proposition = propositionWithAlternatives();
  return validState({ preparedProposition: proposition, currentProposition: proposition });
}

function contentOutput(variationId: string) {
  return modelPropositionOutput({ blocks: [modelBlock({ variationId, alternatives: [] })] });
}

describe("reviseProposition", () => {
  it("R1 resolves the second presented alternative without a tool call", async () => {
    const test = harness(selectSecondAlternative());
    const proposition = propositionWithAlternatives();
    const history = { turns: [{
      role: "assistant" as const,
      turnId: "00000000-0000-4000-8000-000000000699",
      at: "2026-09-07T11:00:00.000Z",
      kind: "proposition" as const,
      propositionVersion: 3,
      text: renderAssistantTurn({ status: "proposition" }, proposition),
    }], omittedTurns: 0 };
    const result = await reviseProposition({ state: revisionState(), conversation: history, instruction: "use the second one" }, test.deps);
    expect(result.result.status).toBe("proposition");
    expect(result.state.currentProposition?.blocks[0].contentId).toMatchObject({ value: "3", source: "proposales_content" });
    expect(result.state.currentProposition?.blocks[0].title.value).toBe(FIXTURE_CATALOG.find((item) => item.variationId === "3")?.title.en);
    expect(result.state.currentProposition?.version).toBe(4);
    expect(test.proposales.calls.map((call) => call.op).sort()).toEqual(["getCompany", "listContent"]);
    expect(result.conversation.turns.slice(-2)).toEqual([
      expect.objectContaining({ role: "human", turnId: HUMAN_TURN_ID, text: "use the second one" }),
      expect.objectContaining({ role: "assistant", kind: "proposition", propositionVersion: 4 }),
    ]);
    expect(test.proposales.writes).toBe(0);
  });

  it("R2 rejects an invented consequential recipient value before merging", async () => {
    // A recipient email the model made up cannot be smuggled in behind an override. Under this
    // contract it cannot even be stated: a consequential leaf admits only evidence the human
    // supplied, so "I inferred it" is not a value the schema can carry, and a model that tries
    // spends its corrections and fails the turn rather than reaching the merge.
    const invented = {
      firstName: null,
      lastName: null,
      email: { value: "invented@example.test", evidence: { kind: "inferred" } },
      phone: null,
      companyName: null,
    };
    const output = modelPropositionOutput({
      recipient: invented,
      requestedOverrides: [{ path: ["recipient", "value", "email"], reason: "change" }],
    });
    const test = harness(Array.from({ length: 3 }, () => finalStep(output)));
    const result = await reviseProposition({ state: revisionState(), instruction: "change the email" }, test.deps);
    expect(result.result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid", code: "validation_error" } });
    expect(result.state.currentProposition).toEqual(revisionState().currentProposition);
  });

  it("R3 refuses an unseen identity and accepts it after get_content", async () => {
    // As on a first turn, the identity is checked where a correction can still fix it, so the run
    // re-asks before the turn fails.
    const rejected = harness(Array.from({ length: 3 }, () => finalStep(contentOutput("7"))));
    const failure = await reviseProposition({ state: revisionState(), instruction: "use item seven" }, rejected.deps);
    expect(failure.result).toMatchObject({
      status: "failed",
      failure: { reason: "model_output_invalid", code: "validation_error" },
    });
    expect((failure.result as AnyRecord).failure.issues).toEqual([{
      path: ["blocks", "0", "variationId"],
      message: "content 7 was not returned by any tool in this run; search for it or use one that was",
    }]);

    const accepted = harness([getContentStep("7"), finalStep(contentOutput("7"))]);
    const result = await reviseProposition({ state: revisionState(), instruction: "use item seven" }, accepted.deps);
    expect(result.result.status).toBe("proposition");
    expect(result.state.currentProposition?.blocks[0].contentId.value).toBe("7");
  });

  it("R7 falls back to the carried language when the proposition states none", async () => {
    // A proposition whose language leaf is absent used to cost a derivation call on every later
    // revision. The code derived earlier in this workflow answers it, re-checked against this
    // catalog first, so the turn goes straight to the main run.
    const proposition = propositionWithAlternatives();
    const withoutLanguage = { ...proposition, language: { known: false as const } };
    const state = validState({
      preparedProposition: withoutLanguage,
      currentProposition: withoutLanguage,
      derivedLanguage: "en",
    });
    const test = harness(selectSecondAlternative());
    const result = await reviseProposition({ state, instruction: "use the second option" }, test.deps);

    expect(result.result.status).toBe("proposition");
    expect(test.ai.calls[0].tools).toHaveLength(2);
    expect(test.ai.calls[0].messages.some((message) => "content" in message && message.content.includes("proposal language: en"))).toBe(true);

    // A carried code the catalog does not offer is not usable, so that turn derives instead.
    const stale = harness([finalStep({ language: "en" }), ...selectSecondAlternative()]);
    const staleResult = await reviseProposition(
      { state: validState({ preparedProposition: withoutLanguage, currentProposition: withoutLanguage, derivedLanguage: "de" }), instruction: "use the second option" },
      stale.deps,
    );
    expect(staleResult.result.status).toBe("proposition");
    expect(stale.ai.calls[0].tools).toHaveLength(0);
  });

  it("R5 enforces the conversation window and records failed turns without changing state", async () => {
    const successful = harness(selectSecondAlternative());
    const windowed = await reviseProposition({ state: revisionState(), conversation: fullConversation(), instruction: "use the second one" }, successful.deps);
    expect(windowed.conversation.turns).toHaveLength(MAX_CONVERSATION_TURNS);
    expect(windowed.conversation.omittedTurns).toBe(2);
    expect(windowed.conversation.turns.slice(-2).map((turn) => turn.role)).toEqual(["human", "assistant"]);

    const invalidOutput = { kind: "proposition", secretNarrative: "do not return" };
    const failed = harness([finalStep(invalidOutput), finalStep(invalidOutput), finalStep(invalidOutput)]);
    const state = revisionState();
    const failure = await reviseProposition({ state, instruction: "make a change" }, failed.deps);
    expect(failure.result).toMatchObject({ status: "failed", failure: { reason: "model_output_invalid" } });
    expect(failure.state).toEqual(state);
    expect(failure.conversation.turns.map((turn) => [turn.role, "kind" in turn ? turn.kind : undefined])).toEqual([
      ["human", undefined], ["assistant", "failed"],
    ]);
    expect(JSON.stringify(failure.result)).not.toContain("do not return");
  });

  it("R6 preserves history order and keeps the new instruction out of history", async () => {
    const first = harness(selectSecondAlternative());
    const start = conversationWith(1);
    const versionTwo = await reviseProposition({ state: revisionState(), conversation: start, instruction: "use the second one" }, first.deps);

    const second = harness(selectPrevious());
    const result = await reviseProposition({ state: versionTwo.state, conversation: versionTwo.conversation, instruction: "actually go back to the previous one" }, second.deps);
    expect(result.state.currentProposition?.blocks[0].contentId.value).toBe("1");
    const messages = second.ai.calls[0].messages.filter((message): message is { role: "user"; content: string } => "content" in message);
    const history = messages.find((message) => message.content.includes("<<<conversation_history"))?.content ?? "";
    expect(history.indexOf("Human turn 1")).toBeLessThan(history.indexOf("use the second one"));
    expect(history.indexOf("use the second one")).toBeLessThan(history.indexOf("Proposed version 4"));
    expect(history).not.toContain("actually go back to the previous one");
    expect(messages.at(-1)?.content).toContain("<<<current_instruction");
    expect(messages.at(-1)?.content).toContain("actually go back to the previous one");
  });
});
