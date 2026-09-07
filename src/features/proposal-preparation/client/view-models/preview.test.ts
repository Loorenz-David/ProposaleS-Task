import { describe, expect, it } from "vitest";

import { fixturePropositionEmpty, fixturePropositionLongText, fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { readLeaf } from "./leaf";
import { toPreviewViewModel } from "./preview";

const leafString = (leaf: unknown) => {
  const read = readLeaf<string | number | boolean>(leaf);
  if (!read.known) return "";
  return typeof read.value === "boolean" ? (read.value ? "Yes" : "No") : String(read.value);
};

function renderedStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(renderedStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(renderedStrings);
  return [];
}

describe("preview view model", () => {
  it("is a closed client-facing set without configuration, notes, flags, or amounts", () => {
    const strings = renderedStrings(toPreviewViewModel(fixturePropositionV1));
    const excluded = [
      ...fixturePropositionV1.blocks.flatMap((block) => [
        leafString(block.quantity),
        leafString(block.optional),
        leafString(block.reviewerComment),
      ]),
      ...fixturePropositionV1.commercialNotes.flatMap((note) => {
        const amount = readLeaf<{ amountMinor: number }>(note.amount);
        return [note.text.value, amount.known ? String(amount.value.amountMinor) : ""];
      }),
      ...fixturePropositionV1.assumptions.map((assumption) => assumption.note.value),
      ...fixturePropositionV1.warnings.map((warning) => warning.text.value),
    ].filter(Boolean);
    expect(excluded.every((value) => !strings.includes(value))).toBe(true);
  });

  it("renders an honest empty document", () => {
    expect(toPreviewViewModel(fixturePropositionEmpty)).toMatchObject({
      title: null,
      narrative: null,
      items: [],
      isEmpty: true,
    });
  });

  it("preserves long titles and all returned item descriptions", () => {
    const preview = toPreviewViewModel(fixturePropositionLongText);
    const title = readLeaf<string>(fixturePropositionLongText.title);
    expect(preview.title).toBe(title.known ? title.value : null);
    expect(preview.items).toHaveLength(6);
  });
});
