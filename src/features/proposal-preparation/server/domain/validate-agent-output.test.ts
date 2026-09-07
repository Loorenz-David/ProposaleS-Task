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

  it("P5(b) checks the id that reaches Proposales, not only the id the model cited", () => {
    // A leaf whose `ref` names something real and whose `value` does not is the shape that gets a
    // model-invented id past a provenance-only check: `value` is what becomes `content_id` on the
    // create request. The seeded record holds "1", "2", "3" and "5"; "7" is in neither.
    const raw = output();
    raw.blocks[0].contentId = { value: "7", source: "proposales_content", ref: { variationId: "1" } };

    expect(validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: false }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
    })).toEqual({ ok: false, issues: [{ path: ["blocks", "0", "contentId"] }] });
  });

  it("P5(c) checks the cited reference, not only the id that reaches Proposales", () => {
    // The mirror image: a real id attributed to a reference this run never saw. Provenance is a
    // consequential claim in its own right, so it is checked even when the value is retrievable.
    const raw = output();
    raw.blocks[0].contentId = { value: "1", source: "proposales_content", ref: { variationId: "7" } };

    expect(validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: false }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
    })).toEqual({ ok: false, issues: [{ path: ["blocks", "0", "contentId"] }] });
  });

  it("P5(d) accepts a block only when both the value and the reference were retrieved", () => {
    // The presence half of P5(b) and P5(c): the same walker that rejects the two divergent shapes
    // accepts the agreeing one, so neither rejection is an artefact of a schema failure.
    const raw = output();
    raw.blocks[0].contentId = { value: "1", source: "proposales_content", ref: { variationId: "1" } };

    expect(validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: false }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
    }).ok).toBe(true);
  });

  it("P5(e) rejects a human-chosen block whose content id was never retrieved", () => {
    // `add_block` lets a human pick a block, so `contentId` may be `human`. That routes around the
    // `proposales_content` branch entirely, and the id still becomes a real `content_id`.
    const current = propositionWithAlternatives();
    const raw = output();
    raw.blocks[0].contentId = { value: "7", source: "human", ref: { variationId: "7", editTurn: 2 } };
    (current as AnyRecord).blocks[0].contentId = { value: "7", source: "human", ref: { variationId: "7", editTurn: 2 } };

    expect(validateAgentOutput(raw, {
      schema: agentOutputSchemaFor({ mode: "revise", allowClarification: false }),
      retrieval: seedRetrievalRecord(propositionWithAlternatives()),
      answeredQuestionIds: [],
      currentProposition: current,
    })).toEqual({ ok: false, issues: [{ path: ["blocks", "0", "contentId"] }] });
  });
});
