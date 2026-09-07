import { describe, expect, it } from "vitest";

import { validProposition } from "../../fixtures/propositions";
import type { Proposition } from "../../schemas/proposition";
import { toModelPropositionView } from "./model-view";

describe("model proposition view", () => {
  it("MV1 shows what is set and where it came from", () => {
    const view = toModelPropositionView(validProposition() as Proposition);
    expect(view.title).toEqual({ value: "Proposal for premium support", source: "inferred" });
    expect(view.recipient?.email).toEqual({ value: "ada@example.com", source: "brief" });
    expect(view.blocks[0]).toMatchObject({ position: 0, variationId: "188485", selectedBy: "proposales_content" });
    expect(view.blocks[0].quantity).toEqual({ value: 2, source: "brief" });
  });

  it("MV2 renders an absent value as null rather than as a wrapper the reply must copy", () => {
    const proposition = validProposition() as Proposition;
    const view = toModelPropositionView({ ...proposition, title: { known: false } });
    expect(view.title).toBeNull();
  });

  it("MV3 omits everything the application owns and the model may not restate", () => {
    // The old revision prompt sent the stored proposition verbatim: ids, timestamps, catalog
    // wording and every ref. None of it is the model's to author, and a ref it read there is not
    // evidence — the evidence is the stored proposition itself, cited as `current`.
    const proposition = validProposition() as Proposition;
    const serialized = JSON.stringify(toModelPropositionView(proposition));
    for (const owned of [proposition.generationId, proposition.preparedAt, "preparedAt", "generationId", "version", "productId", "pricing", "ref", "editTurn", "matchStrength"]) {
      expect(serialized).not.toContain(owned);
    }
    // Materially smaller, not incidentally smaller: this block is resent on every call of every
    // revision turn, and it was the largest thing in the request after the schema itself.
    expect(serialized.length).toBeLessThan(JSON.stringify(proposition).length * 0.6);
  });
});
