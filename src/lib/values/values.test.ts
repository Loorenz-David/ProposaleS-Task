import { describe, expect, it } from "vitest";
import { z } from "zod";

import { knownOrAbsentSchema } from "@/lib/values/absence";
import { currencyCodeSchema, moneySchema } from "@/lib/values/money";
import { pathSchema } from "@/lib/values/path";
import { formatIsoTimestamp, isoTimestampSchema } from "@/lib/values/timestamp";
import { UUID_V4_PATTERN, uuidV4Schema } from "@/lib/values/uuid";

describe("shared value shapes", () => {
  it("C4(a) represents absence explicitly", () => expect(knownOrAbsentSchema(z.number()).parse({ known: false })).toEqual({ known: false }));
  it("C4(b) requires the field containing the absence shape", () => {
    const result = z.strictObject({ q: knownOrAbsentSchema(z.number()) }).safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["q"]);
  });
  it("C4(c) requires a value for known true", () => {
    const result = knownOrAbsentSchema(z.number()).safeParse({ known: true });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["value"]);
  });
  it("C4(d) rejects extra keys on absent", () => expect(knownOrAbsentSchema(z.number()).safeParse({ known: false, value: 1 }).success).toBe(false));
  it("C4(e) round-trips through JSON", () => {
    const schema = knownOrAbsentSchema(z.number());
    expect(schema.parse(JSON.parse(JSON.stringify(schema.parse({ known: false }))))).toEqual({ known: false });
    expect(schema.parse(JSON.parse(JSON.stringify(schema.parse({ known: true, value: 1 }))))).toEqual({ known: true, value: 1 });
  });

  it("C5(a) parses integer minor units", () => expect(moneySchema.parse({ amountMinor: 1200000, currency: "EUR" })).toEqual({ amountMinor: 1200000, currency: "EUR" }));
  it("C5(b) rejects non-integer minor units", () => {
    const result = moneySchema.safeParse({ amountMinor: 10.5, currency: "EUR" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["amountMinor"]);
  });
  it("C5(c) does not coerce string amounts", () => expect(moneySchema.safeParse({ amountMinor: "100", currency: "EUR" }).success).toBe(false));
  it("C5(d) enforces uppercase three-letter currency codes", () => {
    expect(currencyCodeSchema.safeParse("eur").success).toBe(false);
    expect(currencyCodeSchema.parse("EUR")).toBe("EUR");
    expect(currencyCodeSchema.safeParse("EURO").success).toBe(false);
  });

  it("C6(a) accepts the exact ISO timestamp form", () => expect(isoTimestampSchema.parse("2026-09-05T10:14:19.123Z")).toBe("2026-09-05T10:14:19.123Z"));
  it("C6(b) requires milliseconds", () => expect(isoTimestampSchema.safeParse("2026-09-05T10:14:19Z").success).toBe(false));
  it("C6(c) requires UTC Z rather than an offset", () => expect(isoTimestampSchema.safeParse("2026-09-05T12:14:19.123+02:00").success).toBe(false));
  it("C6(d) formats and validates epoch", () => {
    const value = formatIsoTimestamp(new Date(0));
    expect(value).toBe("1970-01-01T00:00:00.000Z");
    expect(isoTimestampSchema.parse(value)).toBe(value);
  });
  it("C6(e) accepts a lowercase UUID v4", () => {
    const value = "123e4567-e89b-42d3-a456-426614174000";
    expect(UUID_V4_PATTERN.test(value)).toBe(true);
    expect(uuidV4Schema.parse(value)).toBe(value);
  });
  it("C6(f) rejects uppercase UUIDs", () => expect(uuidV4Schema.safeParse("123E4567-E89B-42D3-A456-426614174000").success).toBe(false));
  it("C6(g) enforces the v4 version nibble", () => expect(uuidV4Schema.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toBe(false));

  it("C7(a) accepts string array-index path segments", () => expect(pathSchema.parse(["items", "0", "b"])).toEqual(["items", "0", "b"]));
  it("C7(b) rejects empty path segments", () => {
    const result = pathSchema.safeParse(["items", ""]);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual([1]);
  });

});
