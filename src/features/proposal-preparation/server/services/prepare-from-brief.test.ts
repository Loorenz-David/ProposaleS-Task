import { describe, expect, it, vi } from "vitest";

import { createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";

import { BRIEFS } from "../../fixtures/briefs";
import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { conversationWith } from "../../fixtures/conversations";
import { agentClarificationOutput, agentPropositionOutput, finalStep, getContentStep, keepCallingTools, languageStep, proposeStrong, proposeWithSekNote, searchStep } from "../../fixtures/scripts";
import { validProposition } from "../../fixtures/propositions";
import { validState } from "../../fixtures/states";
import { renderAssistantTurn } from "../domain/conversation";
import { prepareFromBrief } from "./prepare-from-brief";

type AnyRecord = Record<string, any>;
const EDITOR_ORIGIN = "https://proposales.test";
const NOW = Date.parse("2026-09-07T10:00:00.000Z");
const GENERATION_ID = "00000000-0000-4000-8000-000000000100";
const TURN_ID = "00000000-0000-4000-8000-000000000200";

function harness(steps: Parameters<typeof createScriptedAiClient>[0], state?: { currency?: "EUR" | "SEK"; budgets?: { wallTimeMs: number; maxToolCalls: number; maxTokens: number } }) {
  const ai = createScriptedAiClient(steps);
  const proposales = createFakeProposalesClient({
    catalog: FIXTURE_CATALOG,
    company: { companyId: 1, currency: state?.currency ?? "EUR", taxMode: "standard" },
  });
  const questionIds = Array.from({ length: 8 }, (_, index) => `00000000-0000-4000-8000-${String(300 + index).padStart(12, "0")}`);
  let questionIndex = 0;
  return {
    ai,
    proposales,
    newGenerationId: vi.fn(() => GENERATION_ID),
    deps: {
      ai,
      proposales,
      now: () => NOW,
      newGenerationId: vi.fn(() => GENERATION_ID),
      newQuestionId: () => questionIds[questionIndex++],
      newTurnId: () => TURN_ID,
      newRunId: () => "run-1",
      logger: createLogger({ sink: vi.fn() }),
      editorOrigin: EDITOR_ORIGIN,
      budgets: state?.budgets,
    },
  };
}

function unknownContentOutput(id: string) {
  const output = agentPropositionOutput();
  return {
    ...output,
    blocks: [{ ...(output.blocks as AnyRecord[])[0], contentId: { value: id, source: "proposales_content", ref: { variationId: id } }, alternatives: [] }],
  };
}

describe("prepareFromBrief", () => {
  it("P1 creates a generation id only without inbound state and rejects isFirst", async () => {
    const first = harness(proposeStrong());
    first.deps.newGenerationId = first.newGenerationId;
    const result = await prepareFromBrief({ brief: BRIEFS.englishSimple }, first.deps);
    expect(first.newGenerationId).toHaveBeenCalledTimes(1);
    expect(result.state.generationId).toBe(GENERATION_ID);
    expect(result.state.currentProposition?.generationId).toBe(GENERATION_ID);

    const next = harness([searchStep("consulting training workshop"), finalStep(agentPropositionOutput())]);
    const reused = await prepareFromBrief({ brief: BRIEFS.englishSimple, state: result.state }, next.deps);
    expect(next.deps.newGenerationId).not.toHaveBeenCalled();
    expect(reused.state.generationId).toBe(GENERATION_ID);

    await expect(prepareFromBrief({ brief: BRIEFS.englishSimple, isFirst: true }, harness([]).deps)).rejects.toMatchObject({ code: "validation_error" });
  });

  it("P2 parses conversation before any model call and appends exactly one rendered assistant turn", async () => {
    const invalid = harness(proposeStrong());
    await expect(prepareFromBrief({ brief: BRIEFS.englishSimple, conversation: { ...conversationWith(2), foo: 1 } }, invalid.deps)).rejects.toMatchObject({
      details: { issues: expect.arrayContaining([{ path: ["conversation", "foo"], message: expect.any(String) }]) },
    });
    expect(invalid.ai.calls).toHaveLength(0);

    const valid = harness(proposeStrong());
    const result = await prepareFromBrief({ brief: BRIEFS.englishSimple }, valid.deps);
    expect(result.conversation.turns).toHaveLength(1);
    expect(result.conversation.turns[0]).toEqual({
      role: "assistant",
      turnId: TURN_ID,
      at: "2026-09-07T10:00:00.000Z",
      kind: "proposition",
      propositionVersion: 1,
      text: renderAssistantTurn(result.result as any, result.state.currentProposition),
    });
  });

  it("P3 returns and records a model clarification with server question ids", async () => {
    const test = harness([languageStep("en"), finalStep(agentClarificationOutput())]);
    const result = await prepareFromBrief({ brief: BRIEFS.noRecipient }, test.deps);
    expect(result.result).toMatchObject({ status: "clarification", questions: [{ itemKey: "recipient_identity", questionId: "00000000-0000-4000-8000-000000000300" }] });
    expect(result.state.clarification?.questions).toEqual((result.result as AnyRecord).questions);
    expect(result.state.currentProposition).toBeUndefined();
    expect(result.run?.usage).toEqual({ inputTokens: 20, outputTokens: 10, totalTokens: 30 });
    expect(result.conversation.turns[0]).toMatchObject({ kind: "clarification" });
  });

  it("P5 rejects an unread content identity and accepts it after get_content records it", async () => {
    const rejected = harness([languageStep("en"), finalStep(unknownContentOutput("7"))]);
    const failure = await prepareFromBrief({ brief: BRIEFS.englishSimple }, rejected.deps);
    expect(failure.result).toEqual({ status: "failed", failure: { reason: "model_output_invalid", code: "validation_error", issues: [{ path: ["blocks", "0", "contentId"] }] } });

    const accepted = harness([languageStep("en"), getContentStep("7"), finalStep(unknownContentOutput("7"))]);
    const result = await prepareFromBrief({ brief: BRIEFS.englishSimple }, accepted.deps);
    expect(result.result.status).toBe("proposition");
    expect(result.state.currentProposition?.blocks[0].contentId.value).toBe("7");
  });

  it("F1 returns only validation issue paths after the bounded schema retry fails", async () => {
    const test = harness([
      languageStep("en"),
      finalStep({ kind: "proposition", modelNarrative: "must not cross" }),
      finalStep({ kind: "proposition", modelNarrative: "still must not cross" }),
    ]);
    const result = await prepareFromBrief({ brief: BRIEFS.englishSimple }, test.deps);
    expect(result.result).toMatchObject({
      status: "failed",
      failure: { reason: "model_output_invalid", code: "validation_error", issues: expect.any(Array) },
    });
    expect(JSON.stringify(result.result)).not.toContain("must not cross");
    expect(test.ai.calls).toHaveLength(3);
  });

  it("P8 derives a supported language and asks when the derived code is unavailable", async () => {
    const en = harness(proposeStrong());
    const result = await prepareFromBrief({ brief: BRIEFS.englishSimple }, en.deps);
    expect(result.state.currentProposition?.language).toMatchObject({ known: true, value: "en" });
    expect(en.ai.calls[1].messages.some((message) => "content" in message && message.content.includes("catalog languages: en, sv") && message.content.includes("proposal language: en"))).toBe(true);

    const de = harness([languageStep("de"), finalStep(agentClarificationOutput("recipient_identity"))]);
    const clarification = await prepareFromBrief({ brief: BRIEFS.englishSimple }, de.deps);
    expect(clarification.result).toMatchObject({ status: "clarification" });
    expect((clarification.result as AnyRecord).questions).toEqual(expect.arrayContaining([expect.objectContaining({ itemKey: "language" })]));

    const carried = validProposition({ language: { known: false } });
    const afterRound = validState({ clarification: { questions: [], answers: [] }, preparedProposition: carried, currentProposition: carried });
    const output = unknownContentOutput("188485") as AnyRecord;
    output.language = { known: true, value: "de", source: "brief" };
    const later = harness([languageStep("de"), finalStep(output)]);
    const unresolved = await prepareFromBrief({ brief: BRIEFS.englishSimple, state: afterRound }, later.deps);
    expect(unresolved.state.currentProposition?.language).toEqual({ known: false });
    expect(unresolved.state.currentProposition?.warnings.some((warning) => warning.kind === "catalog_language_missing")).toBe(true);
    expect(unresolved.state.items.language).toEqual({ resolution: "unresolved" });
  });

  it("P9 reads the company once, keeps currency out of the prompt, and compares in application code", async () => {
    const mismatch = harness(proposeWithSekNote(), { currency: "EUR" });
    const result = await prepareFromBrief({ brief: BRIEFS.sekExpectation }, mismatch.deps);
    expect(mismatch.proposales.calls.filter((call) => call.op === "getCompany")).toHaveLength(1);
    expect(mismatch.ai.calls.every((call) => !JSON.stringify(call).includes('"EUR"'))).toBe(true);
    const warning = result.state.currentProposition?.warnings.find((entry) => entry.kind === "currency_mismatch");
    expect(warning).toMatchObject({ path: ["commercialNotes", "0", "currency"] });
    expect(warning?.text.value).toContain("SEK");
    expect(warning?.text.value).toContain("EUR");

    const same = harness(proposeWithSekNote(), { currency: "SEK" });
    const matching = await prepareFromBrief({ brief: BRIEFS.sekExpectation }, same.deps);
    expect(matching.state.currentProposition?.warnings.some((entry) => entry.kind === "currency_mismatch")).toBe(false);
  });

  it("P10 maps tool-call exhaustion to clarification only while ask items remain open", async () => {
    const budgets = { wallTimeMs: 1000, maxToolCalls: 2, maxTokens: 1000 };
    const open = harness([languageStep("en"), ...keepCallingTools(2)], { budgets });
    const clarification = await prepareFromBrief({ brief: BRIEFS.vagueScope }, open.deps);
    expect(clarification.result).toMatchObject({ status: "clarification", budgetExhausted: { budget: "tool_calls" } });
    const keys = (clarification.result as AnyRecord).questions.map((question: AnyRecord) => question.itemKey);
    expect(keys).toEqual(["language", "sold_scope", "recipient_identity", "quantities"]);

    const closedState = validState({ clarification: { questions: [], answers: [] } });
    const closed = harness([languageStep("en"), ...keepCallingTools(2)], { budgets });
    const failure = await prepareFromBrief({ brief: BRIEFS.vagueScope, state: closedState }, closed.deps);
    expect(failure.result).toEqual({ status: "failed", failure: { reason: "budget_exhausted", code: "internal_error", budget: "tool_calls" } });
    expect(failure.run?.usage).toEqual({ inputTokens: 30, outputTokens: 15, totalTokens: 45 });
  });

  it("P12 never writes to Proposales during preparation", async () => {
    const test = harness(proposeStrong());
    await prepareFromBrief({ brief: BRIEFS.englishSimple }, test.deps);
    expect(test.proposales.writes).toBe(0);
    expect(() => test.proposales.assertNoWrites()).not.toThrow();
  });
});
