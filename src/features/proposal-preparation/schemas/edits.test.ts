import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    edits: await import("./edits"),
  };
}

function firstIssue(result: AnyRecord): AnyRecord {
  if (result.success) throw new Error("expected parse failure");
  return result.error.issues[0];
}

const CANDIDATE = { variationId: "1", productId: "500101", title: "Consulting Training Service Bundle" };

describe("edit schemas", () => {
  it("S4(a) accepts each of the five operations and nothing else", async () => {
    const { edits } = await modules();
    const accepted = [
      { op: "set_leaf", path: ["title"], value: "New title" },
      { op: "remove_block", index: 0 },
      { op: "add_block", candidate: CANDIDATE, quantity: 2, optional: false },
      { op: "unset_recipient" },
      { op: "confirm_empty_draft" },
    ];
    for (const operation of accepted) {
      expect({ op: operation.op, ok: edits.editOperationSchema.safeParse(operation).success }).toEqual({ op: operation.op, ok: true });
    }
    expect(edits.editOperationSchema.safeParse({ op: "set_price", path: ["blocks", "0"], value: 1 }).success).toBe(false);
  });

  it("S4(b) rejects an operation carrying an extra key", async () => {
    const { edits } = await modules();
    // A closed operation set is what keeps an edit from becoming an arbitrary state write.
    const issue = firstIssue(edits.editOperationSchema.safeParse({ op: "remove_block", index: 0, source: "human" }));
    expect({ code: issue.code, keys: issue.keys }).toEqual({ code: "unrecognized_keys", keys: ["source"] });
  });

  it("S4(c) bounds the add_block candidate to an identity and its catalog text", async () => {
    const { edits } = await modules();
    expect(edits.addBlockCandidateSchema.safeParse(CANDIDATE).success).toBe(true);
    expect(edits.addBlockCandidateSchema.safeParse({ ...CANDIDATE, description: "Includes a guided workshop." }).success).toBe(true);
    // No price, score, or strength can enter through a human's replacement.
    expect(edits.addBlockCandidateSchema.safeParse({ ...CANDIDATE, matchStrength: "strong" }).success).toBe(false);
    expect(edits.addBlockCandidateSchema.safeParse({ ...CANDIDATE, unitValue: 10000 }).success).toBe(false);
    expect(edits.addBlockCandidateSchema.safeParse({ ...CANDIDATE, variationId: "0" }).success).toBe(false);
    expect(edits.addBlockCandidateSchema.safeParse({ ...CANDIDATE, variationId: "1.0" }).success).toBe(false);
  });

  it("S4(d) refuses a non-positive or non-finite added quantity", async () => {
    const { edits } = await modules();
    for (const quantity of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const parsed = edits.editOperationSchema.safeParse({ op: "add_block", candidate: CANDIDATE, quantity });
      expect({ quantity: String(quantity), ok: parsed.success }).toEqual({ quantity: String(quantity), ok: false });
    }
  });

  it("S4(e) the turn input is strict and needs at least one edit", async () => {
    const { edits } = await modules();
    const valid = { state: {}, edits: [{ op: "unset_recipient" }] };
    expect(edits.editPropositionInputSchema.safeParse(valid).success).toBe(true);
    expect(edits.editPropositionInputSchema.safeParse({ ...valid, conversation: { turns: [], omittedTurns: 0 } }).success).toBe(true);

    // A caller-supplied version is never trusted for the increment (§17A.2), so it is not merely
    // ignored: it fails at parse.
    const issue = firstIssue(edits.editPropositionInputSchema.safeParse({ ...valid, version: 4 }));
    expect({ code: issue.code, keys: issue.keys }).toEqual({ code: "unrecognized_keys", keys: ["version"] });

    expect(edits.editPropositionInputSchema.safeParse({ state: {}, edits: [] }).success).toBe(false);
  });
});
