import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    projection: await import("./provenance-projection"),
    fixtures: await import("../../fixtures/propositions"),
  };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

describe("provenance projection", () => {
  it("C8(a) projects exactly every sourced leaf and only decimal array segments", async () => {
    const { projection, fixtures } = await modules();
    const entries = projection.projectProvenance(fixtures.validProposition() as never);
    expect(new Set(entries.map((entry: AnyRecord) => entry.path.join(".")))).toEqual(new Set([
      ["language"],
      ["title"],
      ["descriptionNarrative"],
      ["recipient", "value", "firstName"],
      ["recipient", "value", "lastName"],
      ["recipient", "value", "email"],
      ["recipient", "value", "phone"],
      ["recipient", "value", "companyName"],
      ["blocks", "0", "contentId"],
      ["blocks", "0", "title"],
      ["blocks", "0", "description"],
      ["blocks", "0", "quantity"],
      ["blocks", "0", "optional"],
      ["blocks", "0", "reviewerComment"],
      ["blocks", "0", "alternatives", "0", "reason"],
      ["emptyDraftConfirmation"],
      ["commercialNotes", "0", "text"],
      ["commercialNotes", "0", "amount"],
      ["commercialNotes", "0", "currency"],
      ["commercialNotes", "0", "taxBasis"],
      ["commercialAssumptions", "0", "statedValue"],
      ["commercialAssumptions", "1", "statedValue"],
      ["commercialAssumptions", "2", "statedValue"],
      ["assumptions", "0", "note"],
      ["warnings", "0", "text"],
      ["agentRationale"],
    ].map((path) => path.join("."))));
    for (const entry of entries) for (const segment of entry.path) {
      if (/^\d+$/.test(segment)) expect(String(Number(segment))).toBe(segment);
    }
  });

  it("C8(b) sorts decimal array indexes numerically", async () => {
    const { projection, fixtures } = await modules();
    const value = clone(fixtures.validProposition());
    value.blocks = Array.from({ length: 11 }, (_, index) => {
      const block = clone(fixtures.validProposition().blocks[0]);
      block.contentId = { value: String(188485 + index), source: "proposales_content", ref: { variationId: String(188485 + index) } };
      return block;
    });
    const paths = projection.projectProvenance(value as never).map((entry: AnyRecord) => entry.path.join("."));
    expect(paths.indexOf("blocks.2.contentId")).toBeLessThan(paths.indexOf("blocks.10.contentId"));
  });

  it("C8(c) omits an absent leaf", async () => {
    const { projection, fixtures } = await modules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].quantity = { known: false };
    expect(projection.projectProvenance(value as never).some((entry: AnyRecord) => entry.path.join(".") === "blocks.0.quantity")).toBe(false);
  });

  it("C8(d) keeps the derived projection out of the proposition input", async () => {
    const { fixtures } = await modules();
    const value = clone(fixtures.validProposition());
    value.provenance = [];
    const { propositionSchema } = await import("../../schemas/proposition");
    expect(propositionSchema.safeParse(value).success).toBe(false);
  });
});
