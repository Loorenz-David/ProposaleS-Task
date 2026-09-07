import { describe, expect, it } from "vitest";

import { temporaryFixturePropositionEmpty, temporaryFixturePropositionLongText, temporaryFixturePropositionV1, temporaryFixturePropositionV2, temporaryFixturePropositionV3 } from "./proposition.temporary-fixture";

describe("temporary proposition fixtures", () => {
  it("carries the planned V1 presentation cases", () => {
    expect(temporaryFixturePropositionV1.blocks).toHaveLength(4);
    expect(temporaryFixturePropositionV1.blocks[0]?.alternatives).toHaveLength(3);
    expect(temporaryFixturePropositionV1.blocks[2]?.alternatives).toHaveLength(0);
    expect(temporaryFixturePropositionV1.blocks[3]?.contentId.source).toBe("human");
    expect(temporaryFixturePropositionV1.commercialNotes[0]?.amount).toMatchObject({ known: true, value: { amountMinor: 1200000, currency: "SEK" } });
    expect(temporaryFixturePropositionV1.unresolvedItems.map((item) => item.resolution)).toEqual(["unresolved", "deferred_by_user"]);
  });

  it("carries edit, revision, long-text, and empty shapes", () => {
    expect(temporaryFixturePropositionV2).toMatchObject({ version: 2, title: { known: true, source: "human" } });
    expect(temporaryFixturePropositionV3).toMatchObject({ version: 3, descriptionNarrative: { known: true, source: "human" } });
    expect(temporaryFixturePropositionLongText.blocks).toHaveLength(6);
    expect(temporaryFixturePropositionLongText.descriptionNarrative.known && temporaryFixturePropositionLongText.descriptionNarrative.value.length).toBeGreaterThanOrEqual(600);
    expect(temporaryFixturePropositionEmpty).toMatchObject({ title: { known: false }, recipient: { known: false }, blocks: [] });
  });
});
