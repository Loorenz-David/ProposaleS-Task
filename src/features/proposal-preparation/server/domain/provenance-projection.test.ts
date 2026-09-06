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
    const expectedPaths = [
      "agentRationale",
      "assumptions.0.note",
      "blocks.0.alternatives.0.reason",
      "blocks.0.contentId",
      "blocks.0.description",
      "blocks.0.optional",
      "blocks.0.quantity",
      "blocks.0.reviewerComment",
      "blocks.0.title",
      "commercialAssumptions.0.statedValue",
      "commercialAssumptions.1.statedValue",
      "commercialAssumptions.2.statedValue",
      "commercialNotes.0.amount",
      "commercialNotes.0.currency",
      "commercialNotes.0.taxBasis",
      "commercialNotes.0.text",
      "descriptionNarrative",
      "emptyDraftConfirmation",
      "language",
      "recipient.value.companyName",
      "recipient.value.email",
      "recipient.value.firstName",
      "recipient.value.lastName",
      "recipient.value.phone",
      "title",
      "warnings.0.text",
    ];
    const paths = entries.map((entry: AnyRecord) => entry.path.join("."));
    expect(paths).toHaveLength(expectedPaths.length);
    expect(paths).toEqual(expectedPaths);
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
    const expectedPaths = [
      "agentRationale",
      "assumptions.0.note",
      "blocks.0.alternatives.0.reason",
      "blocks.0.contentId",
      "blocks.0.description",
      "blocks.0.optional",
      "blocks.0.quantity",
      "blocks.0.reviewerComment",
      "blocks.0.title",
      "blocks.1.alternatives.0.reason",
      "blocks.1.contentId",
      "blocks.1.description",
      "blocks.1.optional",
      "blocks.1.quantity",
      "blocks.1.reviewerComment",
      "blocks.1.title",
      "blocks.2.alternatives.0.reason",
      "blocks.2.contentId",
      "blocks.2.description",
      "blocks.2.optional",
      "blocks.2.quantity",
      "blocks.2.reviewerComment",
      "blocks.2.title",
      "blocks.3.alternatives.0.reason",
      "blocks.3.contentId",
      "blocks.3.description",
      "blocks.3.optional",
      "blocks.3.quantity",
      "blocks.3.reviewerComment",
      "blocks.3.title",
      "blocks.4.alternatives.0.reason",
      "blocks.4.contentId",
      "blocks.4.description",
      "blocks.4.optional",
      "blocks.4.quantity",
      "blocks.4.reviewerComment",
      "blocks.4.title",
      "blocks.5.alternatives.0.reason",
      "blocks.5.contentId",
      "blocks.5.description",
      "blocks.5.optional",
      "blocks.5.quantity",
      "blocks.5.reviewerComment",
      "blocks.5.title",
      "blocks.6.alternatives.0.reason",
      "blocks.6.contentId",
      "blocks.6.description",
      "blocks.6.optional",
      "blocks.6.quantity",
      "blocks.6.reviewerComment",
      "blocks.6.title",
      "blocks.7.alternatives.0.reason",
      "blocks.7.contentId",
      "blocks.7.description",
      "blocks.7.optional",
      "blocks.7.quantity",
      "blocks.7.reviewerComment",
      "blocks.7.title",
      "blocks.8.alternatives.0.reason",
      "blocks.8.contentId",
      "blocks.8.description",
      "blocks.8.optional",
      "blocks.8.quantity",
      "blocks.8.reviewerComment",
      "blocks.8.title",
      "blocks.9.alternatives.0.reason",
      "blocks.9.contentId",
      "blocks.9.description",
      "blocks.9.optional",
      "blocks.9.quantity",
      "blocks.9.reviewerComment",
      "blocks.9.title",
      "blocks.10.alternatives.0.reason",
      "blocks.10.contentId",
      "blocks.10.description",
      "blocks.10.optional",
      "blocks.10.quantity",
      "blocks.10.reviewerComment",
      "blocks.10.title",
      "commercialAssumptions.0.statedValue",
      "commercialAssumptions.1.statedValue",
      "commercialAssumptions.2.statedValue",
      "commercialNotes.0.amount",
      "commercialNotes.0.currency",
      "commercialNotes.0.taxBasis",
      "commercialNotes.0.text",
      "descriptionNarrative",
      "emptyDraftConfirmation",
      "language",
      "recipient.value.companyName",
      "recipient.value.email",
      "recipient.value.firstName",
      "recipient.value.lastName",
      "recipient.value.phone",
      "title",
      "warnings.0.text",
    ];
    const paths = projection.projectProvenance(value as never).map((entry: AnyRecord) => entry.path.join("."));
    expect(paths).toHaveLength(expectedPaths.length);
    expect(paths).toEqual(expectedPaths);
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
