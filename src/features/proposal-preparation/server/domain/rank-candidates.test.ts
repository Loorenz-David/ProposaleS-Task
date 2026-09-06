import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { ContentItem } from "@/lib/proposales";

import { EXACT_CAP_DESCRIPTION_EN, FIXTURE_CATALOG } from "../../fixtures/catalog";

async function modules() {
  return { rank: await import("./rank-candidates") };
}

const QUERY_3 = "consulting training workshop";
const QUERY_SERVICE = "service";
const QUERY_PREMIUM = "premium";

describe("rankCandidates", () => {
  it("C1(a) is deterministic for the same inputs", async () => {
    const { rank } = await modules();
    const first = rank.rankCandidates(QUERY_3, FIXTURE_CATALOG, "en");
    const second = rank.rankCandidates(QUERY_3, FIXTURE_CATALOG, "en");
    expect(second).toEqual(first);
  });

  it("C1(b) is independent of catalog order", async () => {
    const { rank } = await modules();
    const original = rank.rankCandidates(QUERY_SERVICE, FIXTURE_CATALOG, "en");

    const reversed = [...FIXTURE_CATALOG].reverse();
    expect(rank.rankCandidates(QUERY_SERVICE, reversed, "en")).toEqual(original);

    const interleaved = [
      FIXTURE_CATALOG[6], FIXTURE_CATALOG[0], FIXTURE_CATALOG[13], FIXTURE_CATALOG[1],
      FIXTURE_CATALOG[12], FIXTURE_CATALOG[2], FIXTURE_CATALOG[11], FIXTURE_CATALOG[3],
      FIXTURE_CATALOG[10], FIXTURE_CATALOG[4], FIXTURE_CATALOG[9], FIXTURE_CATALOG[5],
      FIXTURE_CATALOG[8], FIXTURE_CATALOG[7],
    ];
    expect(rank.rankCandidates(QUERY_SERVICE, interleaved, "en")).toEqual(original);
  });

  it("C1(c) is pure, with only its two permitted exceptions, and has arity 3", async () => {
    const { rank } = await modules();
    const source = readFileSync(fileURLToPath(new URL("./rank-candidates.ts", import.meta.url)), "utf8");

    expect(source).toContain('import "server-only";');
    expect(source).toContain('import type { ContentItem } from "@/lib/proposales";');

    const stripped = source
      .split("\n")
      .filter((line) => !line.trim().startsWith("import type "))
      .join("\n");

    expect(stripped).not.toMatch(/from\s+["']@\/lib\/(proposales|ai|agent)["']/);
    expect(stripped).not.toMatch(/from\s+["']node:/);
    expect(stripped).not.toMatch(/\bfetch\s*\(/);
    expect(stripped).not.toMatch(/\bDate\s*[.(]/);
    expect(stripped).not.toMatch(/Math\.random/);
    expect(stripped).not.toMatch(/\bprocess\b/);

    expect(rank.rankCandidates.length).toBe(3);
  });

  it("C1(d) never mutates the input catalog", async () => {
    const { rank } = await modules();
    const clone = structuredClone(FIXTURE_CATALOG);
    rank.rankCandidates(QUERY_SERVICE, FIXTURE_CATALOG, "en");
    expect(FIXTURE_CATALOG).toEqual(clone);
  });

  it("C1(e) an empty query token set yields no candidates", async () => {
    const { rank } = await modules();
    expect(rank.rankCandidates("a", FIXTURE_CATALOG, "en")).toEqual([]);
  });

  it("C3(a) the fixture catalog is larger than the candidate cap", async () => {
    const { rank } = await modules();
    expect(FIXTURE_CATALOG.length).toBeGreaterThan(rank.MAX_CANDIDATES);
  });

  it("C3(b) the candidate cap is applied", async () => {
    const { rank } = await modules();
    expect(FIXTURE_CATALOG.length).toBeGreaterThan(rank.MAX_CANDIDATES);
    const candidates = rank.rankCandidates(QUERY_SERVICE, FIXTURE_CATALOG, "en");
    expect(candidates).toHaveLength(rank.MAX_CANDIDATES);
  });

  it("C3(c) below-floor items are excluded, not padded to the cap", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates(QUERY_PREMIUM, FIXTURE_CATALOG, "en");
    expect(candidates).toHaveLength(2);
  });

  it("C4(a) an over-cap description is truncated at the cap", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates("rollout", FIXTURE_CATALOG, "en");
    expect(candidates).toHaveLength(1);
    expect(candidates[0].description).toHaveLength(rank.MAX_CANDIDATE_DESCRIPTION_CHARS);
    expect(candidates[0].truncated).toBe(true);
  });

  it("C4(b) a short description is returned verbatim", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates("starter", FIXTURE_CATALOG, "en");
    expect(candidates).toHaveLength(1);
    expect(candidates[0].description).toBe("A brief onboarding call to align on scope.");
    expect(candidates[0].truncated).toBe(false);
  });

  it("C4(c) a description exactly at the cap is not truncated", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates("balanced", FIXTURE_CATALOG, "en");
    expect(candidates).toHaveLength(1);
    expect(candidates[0].description).toHaveLength(rank.MAX_CANDIDATE_DESCRIPTION_CHARS);
    expect(candidates[0].description).toBe(EXACT_CAP_DESCRIPTION_EN);
    expect(candidates[0].truncated).toBe(false);
  });

  it("C4(d) an item with no en description is still a candidate", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates("fundamentals", FIXTURE_CATALOG, "en");
    expect(candidates).toHaveLength(1);
    expect(candidates[0].description).toBe("");
    expect(candidates[0].truncated).toBe(false);
  });

  it("C5(a) an item missing the target language's title is excluded", async () => {
    const { rank } = await modules();
    expect(rank.rankCandidates("suite", FIXTURE_CATALOG, "en")).toHaveLength(1);
    expect(rank.rankCandidates("suite", FIXTURE_CATALOG, "sv")).toHaveLength(0);
  });

  it("C5(b) an item whose target-language title is whitespace-only is excluded", async () => {
    const { rank } = await modules();
    expect(rank.rankCandidates("regional", FIXTURE_CATALOG, "en")).toHaveLength(1);
    // Queried on a term from the item's own sv description, not an unrelated word: a query
    // that could not match sv content at all would stay excluded even under a weakened,
    // presence-only title filter (the item would simply fail the score floor instead),
    // which would make this row pass regardless of whether the title check does its job.
    expect(rank.rankCandidates("marknader", FIXTURE_CATALOG, "sv")).toHaveLength(0);
  });

  it("C5(c) matching runs in the proposal language", async () => {
    const { rank } = await modules();
    const svCandidates = rank.rankCandidates("fjällvandring", FIXTURE_CATALOG, "sv");
    expect(svCandidates.map((c) => c.variationId)).toEqual(["11"]);
    expect(rank.rankCandidates("fjällvandring", FIXTURE_CATALOG, "en")).toEqual([]);
  });

  it("C5(d) catalogLanguages reports only languages the catalog can serve", async () => {
    const { rank } = await modules();
    expect(rank.catalogLanguages(FIXTURE_CATALOG)).toEqual(["en", "sv"]);
  });

  it("C6(a) a strong match precedes a possible match", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates(QUERY_3, FIXTURE_CATALOG, "en");
    const index = (id: string) => candidates.findIndex((c) => c.variationId === id);
    expect(index("1")).toBeGreaterThanOrEqual(0);
    expect(index("2")).toBeGreaterThanOrEqual(0);
    expect(index("1")).toBeLessThan(index("2"));
  });

  it("C6(b) a possible match precedes a weak match", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates(QUERY_3, FIXTURE_CATALOG, "en");
    const index = (id: string) => candidates.findIndex((c) => c.variationId === id);
    expect(index("3")).toBeGreaterThanOrEqual(0);
    expect(index("4")).toBeGreaterThanOrEqual(0);
    expect(index("3")).toBeLessThan(index("4"));
  });

  it("C6(c) equal strength orders by higher score first", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates(QUERY_3, FIXTURE_CATALOG, "en");
    const index = (id: string) => candidates.findIndex((c) => c.variationId === id);
    expect(index("2")).toBeGreaterThanOrEqual(0);
    expect(index("3")).toBeGreaterThanOrEqual(0);
    expect(index("2")).toBeLessThan(index("3"));
  });

  it("C6(d) equal score orders by ascending variationId, not lexically", async () => {
    const { rank } = await modules();
    const candidates = rank.rankCandidates(QUERY_SERVICE, FIXTURE_CATALOG, "en");
    const index = (id: string) => candidates.findIndex((c) => c.variationId === id);
    expect(index("9")).toBeGreaterThanOrEqual(0);
    expect(index("10")).toBeGreaterThanOrEqual(0);
    expect(index("9")).toBeLessThan(index("10"));
  });

  it("C6(e) non-numeric ids do not fall back to arrival order", async () => {
    const { rank } = await modules();
    const item = (variationId: string): ContentItem => ({
      variationId,
      productId: `p-${variationId}`,
      createdAt: "2026-01-01T00:00:00.000Z",
      title: { en: "Identical Offer" },
      description: {},
    });
    const forward = rank.rankCandidates("identical", [item("b"), item("a")], "en");
    const backward = rank.rankCandidates("identical", [item("a"), item("b")], "en");
    expect(forward.map((c) => c.variationId)).toEqual(["a", "b"]);
    expect(backward.map((c) => c.variationId)).toEqual(["a", "b"]);
  });
});
