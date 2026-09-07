import { describe, expect, it } from "vitest";

import { agentPropositionOutput } from "../../fixtures/scripts";
import { propositionWithAlternatives } from "../../fixtures/propositions";
import { agentOutputSchemaFor } from "../../schemas/agent-output";
import { seedRetrievalRecord } from "./retrieval-record";
import { validateAgentOutput } from "./validate-agent-output";

type AnyRecord = Record<string, any>;

function output(): AnyRecord {
  return structuredClone(agentPropositionOutput()) as AnyRecord;
}

describe("validateAgentOutput", () => {
  it("P6 rejects unresolved human question and turn references with paths only", () => {
    const raw = output();
    raw.title = { known: true, value: "Human title", source: "human", ref: { questionId: "unknown" } };
    const result = validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: true }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
    });
    expect(result).toEqual({ ok: false, issues: [{ path: ["title"] }] });
    expect(JSON.stringify(result)).not.toContain("Human title");

    raw.title = { known: true, value: "Human title", source: "human", ref: { turnId: "00000000-0000-4000-8000-000000000001", quote: "Human" } };
    expect(validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: true }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
    })).toEqual({ ok: false, issues: [{ path: ["title"] }] });
  });

  it("R4 accepts only a verbatim quote from the current instruction turn", () => {
    const raw = output();
    raw.blocks[0].quantity = {
      known: true,
      value: 3,
      source: "human",
      ref: { turnId: "00000000-0000-4000-8000-000000000001", quote: "quantity 3" },
    };
    const ctx = {
      schema: agentOutputSchemaFor({ mode: "revise", allowClarification: false }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
      currentTurn: { turnId: "00000000-0000-4000-8000-000000000001", text: "keep that one but make the quantity 3" },
    };
    expect(validateAgentOutput(raw, ctx).ok).toBe(true);

    raw.blocks[0].quantity.ref.quote = "quantity 5";
    expect(validateAgentOutput(raw, ctx)).toEqual({ ok: false, issues: [{ path: ["blocks", "0", "quantity"] }] });
    raw.blocks[0].quantity.ref = { turnId: "00000000-0000-4000-8000-000000000002", quote: "quantity 3" };
    expect(validateAgentOutput(raw, ctx)).toEqual({ ok: false, issues: [{ path: ["blocks", "0", "quantity"] }] });
  });

  it("P5 rejects content identities outside the seeded or read retrieval record", () => {
    const raw = output();
    raw.blocks[0].contentId = { value: "7", source: "proposales_content", ref: { variationId: "7" } };
    expect(validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: false }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
    })).toEqual({ ok: false, issues: [{ path: ["blocks", "0", "contentId"] }] });
  });
});
