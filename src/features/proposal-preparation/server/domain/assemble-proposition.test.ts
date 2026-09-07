import { describe, expect, it } from "vitest";

import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { agentOutputSchemaFor } from "../../schemas/agent-output";
import { initialItems } from "./information-registry";
import { rankCandidates } from "./rank-candidates";
import { emptyRetrievalRecord, extendRetrievalRecord, seedRetrievalRecord } from "./retrieval-record";
import { propositionWithAlternatives } from "../../fixtures/propositions";
import { agentPropositionOutput } from "../../fixtures/scripts";
import { assembleProposition } from "./assemble-proposition";

function parsedOutput(overrides: Record<string, unknown> = {}) {
  const parsed = agentOutputSchemaFor({ mode: "prepare", allowClarification: false }).parse(agentPropositionOutput(overrides));
  if (parsed.kind !== "proposition") throw new Error("fixture must be a proposition");
  return parsed;
}

const base = {
  generationId: "123e4567-e89b-42d3-a456-426614174000",
  version: 1,
  preparedAt: "2026-09-07T10:00:00.000Z",
  catalog: FIXTURE_CATALOG,
  language: "en",
  items: initialItems(),
  companyCurrency: "EUR",
};

describe("assembleProposition", () => {
  it("P11 copies catalog text and enriches alternatives from the retrieval record", () => {
    const retrieval = extendRetrievalRecord(emptyRetrievalRecord(), rankCandidates("consulting training workshop", FIXTURE_CATALOG, "en"));
    const proposition = assembleProposition(parsedOutput(), { ...base, retrieval });
    expect(proposition.blocks[0].title).toEqual({ value: FIXTURE_CATALOG[0].title.en, source: "proposales_content", ref: { variationId: "1" } });
    expect(proposition.blocks[0].alternatives[0]).toMatchObject({ variationId: "2", productId: "500102", matchStrength: "possible", score: 667 });
  });

  it("P11 warns for a known non-strong selection but not an identity-only carried block", () => {
    const ranked = rankCandidates("consulting service track", FIXTURE_CATALOG, "en");
    const possible = ranked.find((candidate) => candidate.matchStrength === "possible")!;
    const raw = agentPropositionOutput({ blocks: [{ ...(agentPropositionOutput().blocks as any[])[0], contentId: { value: possible.variationId, source: "proposales_content", ref: { variationId: possible.variationId } }, alternatives: [] }] });
    const output = agentOutputSchemaFor({ mode: "prepare", allowClarification: false }).parse(raw);
    if (output.kind !== "proposition") throw new Error("fixture must be proposition");
    const warned = assembleProposition(output, { ...base, retrieval: extendRetrievalRecord(emptyRetrievalRecord(), ranked) });
    expect(warned.warnings.find((warning) => warning.kind === "non_strong_selection")?.text.value).toContain("possible");

    const carried = propositionWithAlternatives();
    const carriedOutput = parsedOutput({ blocks: [{ ...(agentPropositionOutput().blocks as any[])[0], alternatives: [] }] });
    const quiet = assembleProposition(carriedOutput, { ...base, retrieval: seedRetrievalRecord(carried) });
    expect(quiet.warnings.some((warning) => warning.kind === "non_strong_selection")).toBe(false);
  });

  it("P9 preserves the note and emits a currency mismatch naming both codes", () => {
    const note = {
      text: { value: "around 120 000 SEK", source: "brief" },
      amount: { known: false },
      currency: { known: true, value: "SEK", source: "brief" },
      taxBasis: { value: "including_tax", source: "brief" },
    };
    const retrieval = extendRetrievalRecord(emptyRetrievalRecord(), rankCandidates("consulting training workshop", FIXTURE_CATALOG, "en"));
    const proposition = assembleProposition(parsedOutput({ commercialNotes: [note] }), { ...base, retrieval });
    expect(proposition.commercialNotes[0]).toEqual(note);
    expect(proposition.warnings.find((warning) => warning.kind === "currency_mismatch")).toMatchObject({ path: ["commercialNotes", "0", "currency"] });
    expect(proposition.warnings.find((warning) => warning.kind === "currency_mismatch")?.text.value).toContain("SEK");
    expect(proposition.warnings.find((warning) => warning.kind === "currency_mismatch")?.text.value).toContain("EUR");
  });
});
