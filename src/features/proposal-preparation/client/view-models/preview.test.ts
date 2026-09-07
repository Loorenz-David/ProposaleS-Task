import { describe, expect, it } from "vitest";

import { temporaryFixturePropositionEmpty, temporaryFixturePropositionLongText, temporaryFixturePropositionV1 } from "../fixtures/proposition.temporary-fixture";
import { toPreviewViewModel } from "./preview";

function renderedStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(renderedStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(renderedStrings);
  return [];
}

describe("preview view model", () => {
  it("is a closed client-facing set without configuration, notes, flags, or amounts", () => {
    const strings = renderedStrings(toPreviewViewModel(temporaryFixturePropositionV1));
    const excluded = [
      ...temporaryFixturePropositionV1.blocks.flatMap((block) => [
        block.quantity.known ? String(block.quantity.value) : "",
        block.optional.known ? (block.optional.value ? "Yes" : "No") : "",
        block.reviewerComment.known ? block.reviewerComment.value : "",
      ]),
      ...temporaryFixturePropositionV1.commercialNotes.flatMap((note) => [
        note.text,
        note.amount.known ? String(note.amount.value.amountMinor) : "",
      ]),
      ...temporaryFixturePropositionV1.assumptions.map((assumption) => assumption.note),
      ...temporaryFixturePropositionV1.warnings.map((warning) => warning.text),
    ].filter(Boolean);
    expect(excluded.every((value) => !strings.includes(value))).toBe(true);
  });

  it("renders an honest empty document", () => {
    expect(toPreviewViewModel(temporaryFixturePropositionEmpty)).toMatchObject({
      title: null,
      narrative: null,
      items: [],
      isEmpty: true,
    });
  });

  it("preserves long titles and all returned item descriptions", () => {
    const preview = toPreviewViewModel(temporaryFixturePropositionLongText);
    expect(preview.title).toBe(temporaryFixturePropositionLongText.title.known ? temporaryFixturePropositionLongText.title.value : null);
    expect(preview.items).toHaveLength(6);
  });
});
