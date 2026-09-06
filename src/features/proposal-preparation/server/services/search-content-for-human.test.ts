import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { createFakeProposalesClient } from "@/lib/proposales";

import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { MAX_SEARCH_QUERY_CHARS, contentCandidateSchema } from "../../schemas/content-candidate";

async function modules() {
  return {
    service: await import("./search-content-for-human"),
    rank: await import("../domain/rank-candidates"),
  };
}

function fakeDeps() {
  const proposales = createFakeProposalesClient({ catalog: FIXTURE_CATALOG });
  return { proposales };
}

describe("searchContentForHuman", () => {
  it("C7(a) reads the catalog exactly once", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    await service.searchContentForHuman({ query: "service", language: "en" }, deps);
    expect(deps.proposales.calls).toEqual([{ op: "listContent" }]);
  });

  it("C7(b) returns the expected order", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    const { candidates } = await service.searchContentForHuman({ query: "service", language: "en" }, deps);
    expect(candidates.map((candidate) => candidate.variationId)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
  });

  it("C7(c) performs no post-processing beyond rankCandidates", async () => {
    const { service, rank } = await modules();
    const deps = fakeDeps();
    const { candidates } = await service.searchContentForHuman({ query: "service", language: "en" }, deps);
    expect(candidates).toEqual(rank.rankCandidates("service", FIXTURE_CATALOG, "en"));
  });

  it("C7(d) the service imports no model dependency in any form", () => {
    const source = readFileSync(fileURLToPath(new URL("./search-content-for-human.ts", import.meta.url)), "utf8");
    expect(source).toContain("export async function searchContentForHuman(");
    // Static, `import type`, and dynamic import() all name the specifier, so one match over the
    // unstripped source covers every form. Replaces a type-level not.toHaveProperty("ai") assertion
    // that an optional `ai?: unknown` dependency passed (review round 1, S1; master §9.1 rule 16).
    expect(source).not.toMatch(/["']@\/lib\/(ai|agent)["']/);
  });

  it("C7(e) every returned candidate validates", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    const { candidates } = await service.searchContentForHuman({ query: "service", language: "en" }, deps);
    for (const candidate of candidates) {
      expect(contentCandidateSchema.safeParse(candidate).success).toBe(true);
    }
  });

  it("C7(f) an empty query is rejected", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    await expect(service.searchContentForHuman({ query: "", language: "en" }, deps)).rejects.toMatchObject({
      code: "validation_error",
      details: { issues: [{ path: ["query"] }] },
    });
  });

  it("C7(g) a missing language is rejected", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    await expect(service.searchContentForHuman({ query: "conference" }, deps)).rejects.toMatchObject({
      code: "validation_error",
      details: { issues: [{ path: ["language"] }] },
    });
  });

  it("C7(h) an over-cap query is rejected", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    await expect(
      service.searchContentForHuman({ query: "x".repeat(MAX_SEARCH_QUERY_CHARS + 1), language: "en" }, deps),
    ).rejects.toMatchObject({
      code: "validation_error",
      details: { issues: [{ path: ["query"] }] },
    });
  });

  it("C7(i) a query exactly at the cap is accepted", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    const result = await service.searchContentForHuman(
      { query: "x".repeat(MAX_SEARCH_QUERY_CHARS), language: "en" },
      deps,
    );
    expect(result).toEqual({ candidates: [] });
  });

  it("C7(j) an unknown key is rejected", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    await expect(
      service.searchContentForHuman({ query: "conference", language: "en", extra: 1 }, deps),
    ).rejects.toMatchObject({
      code: "validation_error",
      details: { issues: [{ path: ["extra"] }] },
    });
  });

  it("C7(k) non-object input is rejected", async () => {
    const { service } = await modules();
    const deps = fakeDeps();
    await expect(service.searchContentForHuman("conference", deps)).rejects.toMatchObject({
      code: "validation_error",
      details: { issues: [{ path: [] }] },
    });
  });
});
