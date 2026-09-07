import { describe, expect, it } from "vitest";

import { validProposition } from "../../fixtures/propositions";
import { mergeRevision } from "./merge-revision";

const humanTitle = { known: true as const, value: "Human title", source: "human" as const, ref: { editTurn: 2 } };

describe("mergeRevision", () => {
  it("R2 keeps a changed human leaf and emits no warning when its value is repeated", () => {
    const current = validProposition({ title: humanTitle });
    const changed = validProposition({ title: { known: true, value: "Model title", source: "inferred" } });
    const kept = mergeRevision(current, changed, []);
    expect(kept.merged.title).toEqual(humanTitle);
    expect(kept.warnings).toEqual([expect.objectContaining({ kind: "human_value_kept", path: ["title"] })]);

    const repeated = mergeRevision(current, validProposition({ title: { known: true, value: "Human title", source: "inferred" } }), []);
    expect(repeated.merged.title).toEqual(humanTitle);
    expect(repeated.warnings).toEqual([]);
  });

  it("R2 applies an explicit override with bare before and after values", () => {
    const current = validProposition({ title: humanTitle });
    const proposedTitle = { known: true as const, value: "Revised title", source: "inferred" as const };
    const result = mergeRevision(current, validProposition({ title: proposedTitle }), [{ path: ["title"], reason: "Requested in this revision" }]);
    expect(result.merged.title).toEqual(proposedTitle);
    expect(result.warnings).toEqual([expect.objectContaining({
      kind: "human_value_overridden",
      path: ["title"],
      before: "Human title",
      after: "Revised title",
      reason: "Requested in this revision",
    })]);
  });

  it("R2 takes non-human changes silently and reports an override naming no human leaf", () => {
    const current = validProposition();
    const proposed = validProposition({ title: { known: true, value: "Revised title", source: "inferred" } });
    const silent = mergeRevision(current, proposed, []);
    expect(silent.merged.title).toEqual(proposed.title);
    expect(silent.warnings).toEqual([]);

    const ignored = mergeRevision(current, proposed, [{ path: ["title"], reason: "Not a human leaf" }]);
    expect(ignored.warnings).toEqual([expect.objectContaining({ kind: "other", path: ["title"], reason: "Not a human leaf" })]);
  });

  it("R2 preserves a dropped array element that contains a human leaf", () => {
    const current = validProposition();
    current.blocks[0].quantity = { known: true, value: 2, source: "human", ref: { editTurn: 2 } };
    const proposed = validProposition({ blocks: [] });
    const result = mergeRevision(current, proposed, []);
    expect(result.merged.blocks).toHaveLength(1);
    expect(result.warnings).toEqual([expect.objectContaining({ kind: "human_value_kept", path: ["blocks", "0"] })]);
  });
});
