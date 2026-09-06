import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("proposal shared schemas", () => {
  it("C1(a) parses a sourced presentational leaf", async () => {
    const { presentationalSchema } = await import("./shared");
    expect(presentationalSchema(z.string()).parse({ value: "x", source: "brief", ref: { quote: "source" } })).toEqual({
      value: "x",
      source: "brief",
      ref: { quote: "source" },
    });
  });

  it("C1(b) requires an explicit absent value", async () => {
    const { consequentialSchema, sourcedOrAbsent } = await import("./shared");
    const schema = z.strictObject({ q: sourcedOrAbsent(consequentialSchema(z.string(), ["brief", "human"])) });
    const missing = schema.safeParse({});
    expect(missing.success).toBe(false);
    if (!missing.success) expect(missing.error.issues[0].path).toEqual(["q"]);
    expect(schema.parse({ q: { known: true, value: "x", source: "brief" } })).toEqual({
      q: { known: true, value: "x", source: "brief" },
    });
    expect(schema.parse({ q: { known: false } })).toEqual({ q: { known: false } });
    expect(() => sourcedOrAbsent(z.string() as never)).toThrow(TypeError);
  });

  it("C1(c) requires a content reference", async () => {
    const { consequentialSchema } = await import("./shared");
    const result = consequentialSchema(z.string(), ["proposales_content"]).safeParse({ value: "x", source: "proposales_content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["ref"]);
  });

  it("C1(d) rejects an over-cap quote", async () => {
    const { MAX_QUOTE_CHARS, presentationalSchema } = await import("./shared");
    const result = presentationalSchema(z.string()).safeParse({
      value: "x",
      source: "brief",
      ref: { quote: "x".repeat(MAX_QUOTE_CHARS + 1) },
    });
    expect(result.success).toBe(false);
  });

  it("C1(e) validates current human turn references", async () => {
    const { consequentialSchema } = await import("./shared");
    const schema = consequentialSchema(z.number(), ["brief", "human"]);
    expect(schema.parse({ value: 3, source: "human", ref: { turnId: "123e4567-e89b-42d3-a456-426614174000", quote: "quantity 3" } })).toMatchObject({
      value: 3,
      source: "human",
    });
    const uppercase = schema.safeParse({ value: 3, source: "human", ref: { turnId: "123E4567-E89B-42D3-A456-426614174000", quote: "quantity 3" } });
    expect(uppercase.success).toBe(false);
    if (!uppercase.success) expect(uppercase.error.issues.some((issue) => issue.path.join(".") === "ref.turnId")).toBe(true);
    const missingQuote = schema.safeParse({ value: 3, source: "human", ref: { turnId: "123e4567-e89b-42d3-a456-426614174000" } });
    expect(missingQuote.success).toBe(false);
    if (!missingQuote.success) expect(missingQuote.error.issues.some((issue) => issue.path.join(".") === "ref.quote")).toBe(true);
  });

  it.each([
    ["C7(a)", 0, false],
    ["C7(b)", -1, false],
    ["C7(c)", Number.NaN, false],
    ["C7(d)", Number.POSITIVE_INFINITY, false],
    ["C7(e)", 1, true],
    ["C7(f)", 1.5, true],
  ])("%s applies the positive finite quantity rule", async (_id, value, valid) => {
    const { positiveFiniteNumberSchema } = await import("./shared");
    expect(positiveFiniteNumberSchema.safeParse(value).success).toBe(valid);
  });
});
