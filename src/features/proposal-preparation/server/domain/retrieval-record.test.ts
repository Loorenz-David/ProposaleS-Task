import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    domain: await import("./retrieval-record"),
    fixtures: await import("../../fixtures/propositions"),
  };
}

describe("retrieval record", () => {
  it("C5(a) seeds every block and alternative with exact candidates", async () => {
    const { domain, fixtures } = await modules();
    const record = domain.seedRetrievalRecord(fixtures.propositionWithAlternatives());
    expect(record.candidates.size).toBe(4);
    expect(record.candidates.get("1")).toEqual({ variationId: "1", productId: "500101", title: "Consulting Training Service Bundle" });
    expect(record.candidates.get("5")).toEqual({ variationId: "5", productId: "500105", title: "Service Analytics Dashboard" });
    expect(record.candidates.get("2")).toEqual({ variationId: "2", productId: "500102", title: "Consulting Workshop Service Track", matchStrength: "possible", score: 400 });
    expect(record.candidates.get("3")).toEqual({ variationId: "3", productId: "500103", title: "Training Service Overview", matchStrength: "weak", score: 200 });
  });

  it("C5(b) extends and overwrites without mutating the input map", async () => {
    const { domain, fixtures } = await modules();
    const input = domain.seedRetrievalRecord(fixtures.propositionWithAlternatives());
    const before = structuredClone(input);
    const result = domain.extendRetrievalRecord(input, [
      { variationId: "5", productId: "changed", title: "Changed", description: "", truncated: false, matchStrength: "strong", score: 900, reason: "changed" },
      { variationId: "6", productId: "500106", title: "Service Deployment Toolkit", description: "", truncated: false, matchStrength: "possible", score: 400, reason: "new" },
    ]);
    expect(result.candidates.get("5")).toEqual({ variationId: "5", productId: "changed", title: "Changed", matchStrength: "strong", score: 900 });
    expect(result.candidates.get("6")).toEqual({ variationId: "6", productId: "500106", title: "Service Deployment Toolkit", matchStrength: "possible", score: 400 });
    expect(result.candidates.size).toBe(5);
    expect(input).toEqual(before);
    expect(result.candidates).not.toBe(input.candidates);
  });

  it("C5(c) starts empty and does not report an unseeded identity", async () => {
    const { domain } = await modules();
    const record = domain.emptyRetrievalRecord();
    expect(domain.hasRetrieved(record, "1")).toBe(false);
    expect(record.candidates.size).toBe(0);
  });

  it("C5(d) gives both human and Proposales blocks identity only", async () => {
    const { domain, fixtures } = await modules();
    const proposition = fixtures.propositionWithAlternatives();
    proposition.blocks[0].contentId = { value: "1", source: "human" };
    const record = domain.seedRetrievalRecord(proposition);
    expect(record.candidates.get("1")).toEqual({ variationId: "1", productId: "500101", title: "Consulting Training Service Bundle" });
    expect(record.candidates.get("5")).toEqual({ variationId: "5", productId: "500105", title: "Service Analytics Dashboard" });
    expect(record.candidates.get("1")).not.toHaveProperty("matchStrength");
    expect(record.candidates.get("1")).not.toHaveProperty("score");
    expect(record.candidates.get("5")).not.toHaveProperty("matchStrength");
    expect(record.candidates.get("5")).not.toHaveProperty("score");
  });
});
