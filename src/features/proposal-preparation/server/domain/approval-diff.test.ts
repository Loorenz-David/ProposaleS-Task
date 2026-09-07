import { describe, expect, it } from "vitest";

import { validProposition } from "../../fixtures/propositions";

type AnyRecord = Record<string, any>;

async function modules() {
  return { diff: await import("./approval-diff") };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

describe("approval diff", () => {
  it("A5(a) reports nothing when the approved proposition is the prepared one", async () => {
    const { diff } = await modules();
    expect(diff.computeApprovalDiff(validProposition(), validProposition())).toEqual([]);
  });

  it("A5(b) reports a changed leaf whole, so the reviewer sees who stood behind each side", async () => {
    const { diff } = await modules();
    const prepared = validProposition();
    const current = clone(prepared);
    current.title = { known: true, value: "A human title", source: "human", ref: { editTurn: 2 } };

    expect(diff.computeApprovalDiff(prepared, current as never)).toEqual([
      { path: ["title"], before: prepared.title, after: current.title },
    ]);
  });

  it("A5(c) counts re-sourcing the same value as a difference", async () => {
    const { diff } = await modules();
    const prepared = validProposition();
    const current = clone(prepared);
    // Same text, different author. Who stands behind a value is the thing approval is about.
    current.title = { ...clone(prepared.title), source: "human" };

    const entries = diff.computeApprovalDiff(prepared, current as never);
    expect(entries.map((entry) => entry.path)).toEqual([["title"]]);
    expect((entries[0].after as AnyRecord).value).toEqual((entries[0].before as AnyRecord).value);
  });

  it("A5(d) counts a known toggle in both directions", async () => {
    const { diff } = await modules();
    const prepared = validProposition();

    const cleared = clone(prepared);
    cleared.blocks[0].quantity = { known: false };
    expect(diff.computeApprovalDiff(prepared, cleared as never)).toEqual([
      { path: ["blocks", "0", "quantity"], before: prepared.blocks[0].quantity, after: { known: false } },
    ]);

    expect(diff.computeApprovalDiff(cleared as never, prepared)).toEqual([
      { path: ["blocks", "0", "quantity"], before: { known: false }, after: prepared.blocks[0].quantity },
    ]);
  });

  it("A5(e) descends into the recipient rather than collapsing it to one entry", async () => {
    const { diff } = await modules();
    const prepared = validProposition();
    const current = clone(prepared);
    current.recipient.value.email = { known: true, value: "new@example.com", source: "human", ref: { editTurn: 2 } };

    // Granularity is the leaf: a recipient whose email came from a human and whose phone came
    // from the brief must not collapse to one source.
    expect(diff.computeApprovalDiff(prepared, current as never).map((entry) => entry.path))
      .toEqual([["recipient", "value", "email"]]);
  });

  it("A5(f) treats block order positionally, never as a set", async () => {
    const { diff } = await modules();
    const prepared = clone(validProposition());
    prepared.blocks = [prepared.blocks[0], { ...clone(prepared.blocks[0]), productId: "99999" }];
    const swapped = clone(prepared);
    swapped.blocks = [prepared.blocks[1], prepared.blocks[0]];

    const paths = diff.computeApprovalDiff(prepared as never, swapped as never).map((entry) => entry.path);
    // The order reaches the vendor, so a reorder is a difference at each moved index.
    expect(paths).toEqual([["blocks", "0", "productId"], ["blocks", "1", "productId"]]);
    expect(paths.some((path) => path.length === 1 && path[0] === "blocks")).toBe(false);
  });

  it("A5(g) reports a removed block at its position", async () => {
    const { diff } = await modules();
    const prepared = validProposition();
    const shorter = clone(prepared);
    shorter.blocks = [];

    const entries = diff.computeApprovalDiff(prepared, shorter as never);
    expect(entries.map((entry) => entry.path)).toEqual([["blocks", "0"]]);
    expect(entries[0].after).toBeUndefined();
  });

  it("A5(h) excludes the two fields that always differ", async () => {
    const { diff } = await modules();
    const prepared = validProposition();
    const current = clone(prepared);
    current.version = prepared.version + 5;
    current.preparedAt = "2027-01-01T00:00:00.000Z";

    expect(diff.computeApprovalDiff(prepared, current as never)).toEqual([]);
  });

  it("A5(i) is blind to key order and sorts its output by path", async () => {
    const { diff } = await modules();
    const prepared = validProposition();

    const reordered: AnyRecord = {};
    for (const key of Object.keys(prepared).reverse()) reordered[key] = (prepared as AnyRecord)[key];
    expect(Object.keys(reordered)).not.toEqual(Object.keys(prepared));
    expect(diff.computeApprovalDiff(prepared, reordered as never)).toEqual([]);

    const current = clone(prepared);
    current.title = { known: true, value: "Z", source: "human", ref: { editTurn: 2 } };
    current.descriptionNarrative = { known: true, value: "A", source: "human", ref: { editTurn: 2 } };
    current.blocks[0].quantity = { known: false };

    expect(diff.computeApprovalDiff(prepared, current as never).map((entry) => entry.path))
      .toEqual([["blocks", "0", "quantity"], ["descriptionNarrative"], ["title"]]);
  });
});
