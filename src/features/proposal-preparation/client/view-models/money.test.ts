import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { toMoneyDisplay } from "./money";

describe("money display boundary", () => {
  it("uses currency exponents for two-digit and zero-digit currencies", () => {
    expect(toMoneyDisplay({ amountMinor: 12345, currency: "EUR" }, "en-US")).toBe("€123.45");
    expect(toMoneyDisplay({ amountMinor: 12345, currency: "JPY" }, "en-US")).toBe("¥12,345");
  });

  it("contains no second arithmetic or parsing path", () => {
    const source = readFileSync(path.join(__dirname, "money.ts"), "utf8");
    const withoutScalingLine = source.replace(/const majorAmount = money\.amountMinor \/ 10 \*\* exponent;/, "");
    expect(withoutScalingLine).not.toMatch(/toFixed|parseFloat|\bNumber\(|amountMinor\s*[*+]/);
    expect(source.match(/amountMinor \/ 10 \*\* exponent/g)).toHaveLength(1);
  });
});
