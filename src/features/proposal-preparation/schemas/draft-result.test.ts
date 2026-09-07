import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    draftResult: await import("./draft-result"),
  };
}

const MONEY_KEY_PATTERN = /amountMinor|total|unitValue|packageSplit|currency|vat/i;

function moneyBearingKeys(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) moneyBearingKeys(entry, found);
    return found;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as AnyRecord)) {
      if (MONEY_KEY_PATTERN.test(key)) found.push(key);
      moneyBearingKeys(nested, found);
    }
  }
  return found;
}

function availablePricing(): AnyRecord {
  return {
    available: true,
    totalWithoutTax: { amountMinor: 10000, currency: "EUR" },
    totalWithTax: { amountMinor: 12500, currency: "EUR" },
    currency: "EUR",
    taxOptions: { mode: "standard", taxIncluded: false },
    blocks: [{
      contentId: "1",
      quantity: 1.5,
      optional: false,
      unitValueWithDiscountWithoutTax: { amountMinor: 10000, currency: "EUR" },
      unitValueWithDiscountWithTax: { amountMinor: 12500, currency: "EUR" },
      unitValueWithoutDiscountWithoutTax: { amountMinor: 10000, currency: "EUR" },
      unitValueWithoutDiscountWithTax: { amountMinor: 12500, currency: "EUR" },
      packageSplit: [{ type: "vat", vat: 0.25, valueWithTax: { amountMinor: 2500, currency: "EUR" } }],
    }],
    warnings: [],
  };
}

function draftResult(appliedPricing: AnyRecord): AnyRecord {
  return {
    proposalUuid: "123e4567-e89b-42d3-a456-426614174000",
    editorUrl: "https://proposales.test/p/123e4567-e89b-42d3-a456-426614174000",
    newlyCreated: true,
    appliedPricing,
    notices: [],
  };
}

describe("draft result schemas", () => {
  it("S3(a) accepts a mapper-shaped available pricing, fractional quantity included", async () => {
    const { draftResult: schemas } = await modules();
    const parsed = schemas.appliedPricingSchema.parse(availablePricing());
    expect(parsed).toEqual(availablePricing());
    // The vendor types quantity as a number; coercing it to an integer would change the offer.
    expect(schemas.appliedPricingSchema.safeParse({ ...availablePricing(), blocks: [{ ...availablePricing().blocks[0], quantity: 0.25 }] }).success).toBe(true);
  });

  it("S3(b) the unavailable arm carries no money and cannot be given any", async () => {
    const { draftResult: schemas } = await modules();
    const unavailable = { available: false, reason: "read_failed_upstream", status: 503 };
    const parsed = schemas.appliedPricingSchema.parse(unavailable);

    // Not "the totals happen to be absent": the arm declares no money field, so unavailable can
    // never be rendered as 0 (§17A.12). The scan is what makes that falsifiable.
    expect(moneyBearingKeys(parsed)).toEqual([]);
    // The instrument can see a money key when one is present.
    expect(moneyBearingKeys(schemas.appliedPricingSchema.parse(availablePricing()))).not.toEqual([]);

    expect(schemas.appliedPricingSchema.safeParse({ ...unavailable, totalWithTax: { amountMinor: 0, currency: "EUR" } }).success).toBe(false);
    expect(schemas.appliedPricingSchema.safeParse({ available: false, reason: "something_went_wrong" }).success).toBe(false);
    expect(schemas.appliedPricingSchema.safeParse({ available: false }).success).toBe(false);
  });

  it("S3(c) every unavailable reason the execution path can produce is a member", async () => {
    const { draftResult: schemas } = await modules();
    expect([...schemas.appliedPricingUnavailableReasonSchema.options].sort()).toEqual([
      "read_budget_exhausted",
      "read_failed_schema_mismatch",
      "read_failed_timeout",
      "read_failed_upstream",
    ]);
  });

  it("S3(d) a draft result carries its identity and stays plain JSON", async () => {
    const { draftResult: schemas } = await modules();
    const result = draftResult(availablePricing());
    const parsed = schemas.draftResultSchema.parse(result);
    expect(JSON.parse(JSON.stringify(parsed))).toEqual(result);
    expect(schemas.draftResultSchema.safeParse({ ...result, proposalUuid: "not-a-uuid" }).success).toBe(false);
    expect(schemas.draftResultSchema.safeParse({ ...result, unexpected: 1 }).success).toBe(false);
  });

  it("S3(e) accepts an editor URL from an unexpected origin, which is reported as a notice", async () => {
    const { draftResult: schemas } = await modules();
    // The origin check produces a notice beside a successful create; rejecting it here would turn
    // a misconfigured origin into a lost draft (§17A.3, 10 §10).
    const foreign = draftResult(availablePricing());
    foreign.editorUrl = "https://other.test/p/123e4567-e89b-42d3-a456-426614174000";
    foreign.notices = [{ kind: "editor_url_origin_unexpected" }];
    expect(schemas.draftResultSchema.safeParse(foreign).success).toBe(true);
    expect(schemas.draftResultSchema.safeParse({ ...foreign, notices: [{ kind: "invented_notice" }] }).success).toBe(false);
  });
});
