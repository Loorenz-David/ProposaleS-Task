import { describe, expect, it } from "vitest";

import { MAX_TITLE_CHARS } from "../../schemas/shared";
import { validProposition } from "../../fixtures/propositions";

type AnyRecord = Record<string, any>;

const EDIT_TURN = 2;
const CANDIDATE = { variationId: "3", productId: "500103", title: "Training Service Overview" };

async function modules() {
  return { edits: await import("./apply-edits") };
}

async function run(operations: AnyRecord[], proposition = validProposition()): Promise<AnyRecord> {
  const { edits } = await modules();
  return edits.applyEdits(proposition, operations as never, EDIT_TURN) as AnyRecord;
}

async function refusal(operations: AnyRecord[], proposition = validProposition()): Promise<AnyRecord> {
  try {
    await run(operations, proposition);
  } catch (error) {
    return error as AnyRecord;
  }
  throw new Error("expected applyEdits to refuse");
}

describe("apply edits", () => {
  it("E2(a) records a set value as the human's, with the edit turn", async () => {
    const edited = await run([{ op: "set_leaf", path: ["title"], value: "A human title" }]);
    expect(edited.title).toEqual({ known: true, value: "A human title", source: "human", ref: { editTurn: EDIT_TURN } });
  });

  it("E2(b) writes a leaf that is always present without a known flag", async () => {
    // `taxBasis` is a bare sourced leaf; `title` carries `known`. Reading the current shape is
    // what keeps the two from falling out of step with the schema.
    const edited = await run([{ op: "set_leaf", path: ["commercialNotes", "0", "taxBasis"], value: "excluding_tax" }]);
    expect(edited.commercialNotes[0].taxBasis).toEqual({ value: "excluding_tax", source: "human", ref: { editTurn: EDIT_TURN } });
  });

  it("E2(c) refuses a domain rule violation instead of correcting it", async () => {
    const error = await refusal([{ op: "set_leaf", path: ["blocks", "0", "quantity"], value: 0 }]);
    expect(error.code).toBe("validation_error");
    expect(error.details.reason).toBe("domain_rule");
    expect(error.details.issues[0].path.slice(0, 3)).toEqual(["blocks", "0", "quantity"]);

    for (const quantity of [-1, Number.NaN]) {
      const refused = await refusal([{ op: "set_leaf", path: ["blocks", "0", "quantity"], value: quantity }]);
      expect({ quantity: String(quantity), reason: refused.details.reason }).toEqual({ quantity: String(quantity), reason: "domain_rule" });
    }
  });

  it("E2(d) refuses a value the leaf's own schema rejects", async () => {
    const error = await refusal([{ op: "set_leaf", path: ["title"], value: "x".repeat(MAX_TITLE_CHARS + 1) }]);
    expect(error.details.reason).toBe("domain_rule");
    expect(error.details.issues[0].path[0]).toBe("title");

    const email = await refusal([{ op: "set_leaf", path: ["recipient", "value", "email"], value: "not-an-email" }]);
    expect(email.details.issues[0].path.slice(0, 3)).toEqual(["recipient", "value", "email"]);
  });

  it("E2(e) refuses a path that names no field", async () => {
    const error = await refusal([{ op: "set_leaf", path: ["nope"], value: 1 }]);
    expect(error.details.reason).toBe("domain_rule");
    expect(error.details.issues[0].path).toEqual(["nope"]);

    const nested = await refusal([{ op: "set_leaf", path: ["blocks", "0", "unitValue"], value: 10000 }]);
    expect(nested.details.issues[0].path).toEqual(["blocks", "0", "unitValue"]);
  });

  it("E2(f) refuses a human value on a catalog-verbatim leaf", async () => {
    // A block's reviewer-facing title is copied from the catalog, never authored, so a human
    // rewriting it is refused by the leaf's own source union rather than by a special case here.
    const error = await refusal([{ op: "set_leaf", path: ["blocks", "0", "title"], value: "My own title" }]);
    expect(error.details.reason).toBe("domain_rule");
    expect(error.details.issues[0].path.slice(0, 3)).toEqual(["blocks", "0", "title"]);
  });

  it("E3(a) adds a block from a candidate the human chose", async () => {
    const edited = await run([{ op: "add_block", candidate: CANDIDATE }]);
    const added = edited.blocks[1];

    expect(added.contentId).toEqual({
      value: "3",
      source: "human",
      ref: { variationId: "3", editTurn: EDIT_TURN },
    });
    // The text still comes from the catalog even though the choice was the human's.
    expect(added.title).toEqual({ value: CANDIDATE.title, source: "proposales_content", ref: { variationId: "3" } });
    expect(added.description).toEqual({ known: false });
    expect(added.quantity).toEqual({ known: false });
    expect(added.optional).toEqual({ known: false });
    expect(added.pricing).toBe("library");
    expect(added.alternatives).toEqual([]);
  });

  it("E3(b) carries a stated quantity and optional flag as the human's", async () => {
    const edited = await run([{ op: "add_block", candidate: { ...CANDIDATE, description: "A structured workshop." }, quantity: 3, optional: true }]);
    const added = edited.blocks[1];
    expect(added.quantity).toEqual({ known: true, value: 3, source: "human", ref: { editTurn: EDIT_TURN } });
    expect(added.optional).toEqual({ known: true, value: true, source: "human", ref: { editTurn: EDIT_TURN } });
    expect(added.description).toEqual({ known: true, value: "A structured workshop.", source: "proposales_content", ref: { variationId: "3" } });
  });

  it("E3(c) removes a block, and replacement is removal plus addition", async () => {
    const removed = await run([{ op: "remove_block", index: 0 }]);
    expect(removed.blocks).toEqual([]);

    const replaced = await run([{ op: "remove_block", index: 0 }, { op: "add_block", candidate: CANDIDATE }]);
    expect(replaced.blocks).toHaveLength(1);
    expect(replaced.blocks[0].contentId.value).toBe("3");
    expect(replaced.blocks[0].contentId.source).toBe("human");
  });

  it("E3(d) refuses a removal that names no block", async () => {
    const error = await refusal([{ op: "remove_block", index: 5 }]);
    expect(error.details.reason).toBe("domain_rule");
  });

  it("E4(a) unsets the recipient as a deliberate absence", async () => {
    const edited = await run([{ op: "unset_recipient" }]);
    expect(edited.recipient).toEqual({ known: false });
  });

  it("E4(b) materializes an unset recipient when a leaf of it is set", async () => {
    const cleared = await run([{ op: "unset_recipient" }]);
    const restored = await run([{ op: "set_leaf", path: ["recipient", "value", "email"], value: "anna@example.se" }], cleared as never);

    expect(restored.recipient.known).toBe(true);
    expect(restored.recipient.value.email).toEqual({ known: true, value: "anna@example.se", source: "human", ref: { editTurn: EDIT_TURN } });
    expect(restored.recipient.value.phone).toEqual({ known: false });
  });

  it("E4(c) confirms an empty draft only when the draft is empty", async () => {
    const emptied = await run([{ op: "remove_block", index: 0 }, { op: "confirm_empty_draft" }]);
    expect(emptied.emptyDraftConfirmation).toEqual({ known: true, value: true, source: "human", ref: { editTurn: EDIT_TURN } });

    // Confirming an empty draft that has blocks states something untrue about the offer.
    const error = await refusal([{ op: "confirm_empty_draft" }]);
    expect(error.details.reason).toBe("domain_rule");
  });

  it("E4(d) never mutates the proposition it was given", async () => {
    const current = validProposition();
    const before = structuredClone(current);
    await run([{ op: "set_leaf", path: ["title"], value: "Changed" }, { op: "unset_recipient" }], current);
    expect(current).toEqual(before);
  });

  it("E4(e) applies several operations in order", async () => {
    const edited = await run([
      { op: "set_leaf", path: ["title"], value: "First" },
      { op: "set_leaf", path: ["title"], value: "Second" },
    ]);
    expect(edited.title.value).toBe("Second");
  });
});
