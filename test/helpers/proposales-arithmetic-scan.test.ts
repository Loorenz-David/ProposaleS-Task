import { describe, expect, it } from "vitest";

import { findArithmetic } from "./proposales-arithmetic-scan";

const cases = [
  ["add", "a + b"], ["subtract", "a - b"], ["multiply", "a * b"], ["divide", "a / b"],
  ["remainder", "a % b"], ["add_assign", "a += b"], ["subtract_assign", "a -= b"],
  ["multiply_assign", "a *= b"], ["divide_assign", "a /= b"], ["remainder_assign", "a %= b"],
  ["less_than", "a < b"], ["less_than_or_equal", "a <= b"], ["greater_than", "a > b"],
  ["greater_than_or_equal", "a >= b"], ["negate", "-x"], ["math", "Math.round(x)"],
  ["to_fixed", "x.toFixed(2)"], ["number", "Number(x)"], ["parse_float", "parseFloat(x)"],
  ["parse_int", "parseInt(x)"],
] as const;

describe("findArithmetic", () => {
  it.each(cases)("C8(b) detects %s", (kind, source) => {
    expect(findArithmetic(source).map((record) => record.kind)).toEqual([kind]);
  });

  it("C8(c) ignores literal concatenation", () => {
    expect(findArithmetic('const value = "a" + "b"')).toEqual([]);
  });

  it("C8(d) ignores text without an AST operator", () => {
    expect(findArithmetic('const one = "a + b"; const two = `${a}-${b}`')).toEqual([]);
  });
});
