import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { toAppliedPricing } from "@/lib/proposales/applied-pricing.mapper";
import { toProposalReadback } from "@/lib/proposales/mappers";
import { findArithmetic } from "../../../test/helpers/proposales-arithmetic-scan";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

const consistent = (await import("./fixtures/proposal-readback.consistent.json")).default;
const inconsistent = (await import("./fixtures/proposal-readback.inconsistent.json")).default;

describe("Applied Pricing mapper", () => {
  const scannerCases = [
    ["add", "a + b"], ["subtract", "a - b"], ["multiply", "a * b"], ["divide", "a / b"],
    ["remainder", "a % b"], ["add_assign", "a += b"], ["subtract_assign", "a -= b"],
    ["multiply_assign", "a *= b"], ["divide_assign", "a /= b"], ["remainder_assign", "a %= b"],
    ["less_than", "a < b"], ["less_than_or_equal", "a <= b"], ["greater_than", "a > b"],
    ["greater_than_or_equal", "a >= b"], ["negate", "-x"], ["math", "Math.round(x)"],
    ["to_fixed", "x.toFixed(2)"], ["number", "Number(x)"], ["parse_float", "parseFloat(x)"],
    ["parse_int", "parseInt(x)"],
  ] as const;

  it.each(scannerCases)("C8(b) detects %s", (kind, source) => {
    expect(findArithmetic(source).map((record) => record.kind)).toEqual([kind]);
  });

  it("C8(c-d) ignores literal concatenation and text without an AST operator", () => {
    expect(findArithmetic('const one = "a" + "b"; const two = "a + b"; const three = `${a}-${b}`')).toEqual([]);
  });

  it("C6(a) maps consistent read-back values verbatim", () => {
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(consistent).data));
    expect(result.totalWithoutTax.amountMinor).toBe(10000);
    expect(result.totalWithTax.amountMinor).toBe(10000);
    expect(result.blocks[0]).toMatchObject({
      unitValueWithDiscountWithoutTax: { amountMinor: 10000, currency: "EUR" },
      unitValueWithDiscountWithTax: { amountMinor: 10000, currency: "EUR" },
      unitValueWithoutDiscountWithoutTax: { amountMinor: 10000, currency: "EUR" },
      unitValueWithoutDiscountWithTax: { amountMinor: 10000, currency: "EUR" },
    });
  });

  it("C6(b) reports inconsistent totals verbatim", () => {
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(inconsistent).data));
    expect(result.totalWithoutTax.amountMinor).toBe(12345);
    expect(result.totalWithTax.amountMinor).toBe(23456);
  });

  it("C6(c-d) carries fractional quantity and vat", () => {
    const raw = structuredClone(inconsistent) as typeof inconsistent;
    raw.data.blocks[0].quantity = 1.5;
    raw.data.blocks[0].package_split![0].vat = 0.25;
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(raw).data));
    expect(result.blocks[0].quantity).toBe(1.5);
    expect(result.blocks[0].packageSplit?.[0].vat).toBe(0.25);
  });

  it("C6(f-g) preserves absent display-only fields", () => {
    const raw = structuredClone(inconsistent) as { data: { blocks: Array<Record<string, unknown>> } };
    delete raw.data.blocks[0].optional;
    delete raw.data.blocks[0].package_split;
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(raw).data));
    expect(result.blocks[0]).not.toHaveProperty("optional");
    expect(result.blocks[0]).not.toHaveProperty("packageSplit");
  });

  it("C7(a-b) uses proposal currency and warns on block currency drift", () => {
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(inconsistent).data));
    expect(result.totalWithoutTax.currency).toBe("EUR");
    expect(result.blocks[0].blockCurrency).toBe("SEK");
    expect(result.warnings).toContainEqual({ kind: "block_currency_differs", contentId: "188485" });
  });

  it("C7(c) does not warn for equal or absent block currency", () => {
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(consistent).data));
    expect(result.warnings).toEqual([]);
  });

  it("C7(d-f) maps tax options and normalises currencies", () => {
    const raw = structuredClone(consistent) as typeof consistent;
    raw.data.currency = "eur";
    raw.data.blocks[0].currency = "sek";
    const result = toAppliedPricing(toProposalReadback(proposalReadbackSchema.parse(raw).data));
    expect(result.taxOptions).toEqual({ mode: "standard", taxIncluded: false, taxLabelKey: "vat" });
    expect(result.totalWithoutTax.currency).toBe("EUR");
    expect(result.blocks[0].blockCurrency).toBe("SEK");
  });

  it("C8(a) keeps the mapper arithmetic-free", () => {
    const source = readFileSync(new URL("./applied-pricing.mapper.ts", import.meta.url), "utf8");
    expect(findArithmetic(source)).toEqual([]);
  });
});
