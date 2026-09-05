import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { toContentItem, toCreateProposalRequest, PROPOSAL_COPILOT_SOURCE_MARKER, PROPOSAL_METADATA_KEYS } from "@/lib/proposales/mappers";
import { contentListResponseSchema, createProposalRequestSchema } from "@/lib/proposales/schemas";
import type { CreateProposalDraftInput } from "@/lib/proposales";

const context = { companyId: 42, now: () => 0 };
const baseInput: CreateProposalDraftInput = {
  language: "en",
  recipient: { known: false },
  blocks: [{ contentId: "188485", quantity: { known: false }, optional: { known: false } }],
  generationId: "generation-1",
};

describe("Proposales response mappers", () => {
  it("C5(a) parses and maps the content fixture", async () => {
    const fixture = (await import("./fixtures/content-list.json")).default;
    const parsed = contentListResponseSchema.parse(fixture);
    const items = parsed.data.map(toContentItem);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      variationId: "188485",
      productId: "12345",
      title: { en: "Premium support", sv: "Premiumsupport" },
      description: { en: "Priority help", sv: "Prioriterad hjälp" },
      images: ["https://cdn.proposales.test/premium.png"],
    });
    expect(items[1].images).toBeUndefined();
  });

  it("C5(b) strips unknown wire keys before mapping", async () => {
    const fixture = (await import("./fixtures/content-list.json")).default;
    const item = toContentItem(contentListResponseSchema.parse(fixture).data[0]);

    expect(item).not.toHaveProperty("integration_metadata");
    expect(item).not.toHaveProperty("future_key");
  });

  it("C5(c) maps the epoch as milliseconds", async () => {
    const fixture = (await import("./fixtures/content-list.json")).default;
    const item = toContentItem(contentListResponseSchema.parse(fixture).data[0]);

    expect(item.createdAt).toBe("2025-09-05T08:00:00.000Z");
  });

  it("C5(d) maps an omitted description to an empty record", async () => {
    const fixture = (await import("./fixtures/content-list.json")).default;
    const item = toContentItem(contentListResponseSchema.parse(fixture).data[1]);

    expect(item.description).toEqual({});
  });

  it("P4-C1(a-d) omits absent fields and preserves known values", () => {
    const absentRequest = toCreateProposalRequest(baseInput, context);
    expect("quantity" in absentRequest.blocks![0]).toBe(false);
    expect(createProposalRequestSchema.parse(absentRequest)).toEqual(absentRequest);
    const request = toCreateProposalRequest({
      ...baseInput,
      blocks: [{ contentId: "188485", quantity: { known: true, value: 2 }, optional: { known: true, value: true } }],
    }, context);
    expect("quantity" in request.blocks![0]).toBe(true);
    expect(request.blocks![0].quantity).toBe(2);
    expect(request.blocks![0].optional).toBe(true);
    expect(createProposalRequestSchema.parse(request)).toEqual(request);
  });

  it("P4-C1(e-h) omits an absent or empty recipient and optional text", () => {
    const absent = toCreateProposalRequest(baseInput, context);
    expect("recipient" in absent).toBe(false);
    expect("title_md" in absent).toBe(false);
    expect("description_md" in absent).toBe(false);
    const withRecipient = toCreateProposalRequest({
      ...baseInput,
      recipient: { known: true, value: { email: "a@b.se" } },
    }, context);
    expect(withRecipient.recipient).toEqual({ email: "a@b.se" });
    const empty = toCreateProposalRequest({ ...baseInput, recipient: { known: true, value: {} } }, context);
    expect("recipient" in empty).toBe(false);
  });

  it("P4-C1(i) emits no undefined values", () => {
    const values: unknown[] = [toCreateProposalRequest(baseInput, context)];
    while (values.length > 0) {
      const value = values.pop();
      if (value && typeof value === "object") {
        for (const [key, nested] of Object.entries(value)) {
          expect(nested, key).not.toBeUndefined();
          values.push(nested);
        }
      }
    }
  });

  it("P4-C2(a-h) rejects every prohibited price key at its declared location", () => {
    const blockKeys = [
      "unit_value_with_discount_without_tax", "unit_value_with_discount_with_tax",
      "unit_value_without_discount_without_tax", "unit_value_without_discount_with_tax",
      "package_split", "currency",
    ];
    for (const key of blockKeys) {
      const mappedRequest = toCreateProposalRequest(baseInput, context);
      const request = {
        ...mappedRequest,
        blocks: [{ ...(mappedRequest.blocks?.[0] as Record<string, unknown>), [key]: key === "package_split" ? [] : "EUR" }],
      };
      const result = createProposalRequestSchema.safeParse(request);
      expect(result.success, key).toBe(false);
      if (!result.success) expect(result.error.issues.some((issue) => issue.code === "unrecognized_keys" && issue.keys.includes(key))).toBe(true);
    }
    for (const key of ["currency", "tax_options"]) {
      const request = { ...toCreateProposalRequest(baseInput, context), [key]: key === "tax_options" ? {} : "EUR" };
      const result = createProposalRequestSchema.safeParse(request);
      expect(result.success, key).toBe(false);
      if (!result.success) expect(result.error.issues.some((issue) => issue.code === "unrecognized_keys" && issue.keys.includes(key))).toBe(true);
    }
  });

  it("P4-C2(i) names no prohibited price field in the mapper helpers", () => {
    const fullSource = readFileSync(new URL("./mappers.ts", import.meta.url), "utf8");
    const source = fullSource.slice(fullSource.indexOf("function quantityField"), fullSource.indexOf("export function toContentItem"));
    expect(source).toContain("toCreateProposalRequest");
    expect(source).toContain("blockField");
    expect(source).toContain("recipientField");
    for (const key of [
      "unit_value_with_discount_without_tax", "unit_value_with_discount_with_tax",
      "unit_value_without_discount_without_tax", "unit_value_without_discount_with_tax",
      "package_split", "currency", "tax_options",
    ]) expect(source).not.toContain(key);
  });

  it("P4-C3(a-g) writes the exact metadata and create wire shape", () => {
    const request = toCreateProposalRequest({ ...baseInput, titleMd: "Title", descriptionMd: "Description" }, context);
    expect(Object.keys(request.data ?? {}).sort()).toEqual(Object.values(PROPOSAL_METADATA_KEYS).sort());
    expect(Object.values(request.data ?? {}).every((value) => typeof value === "string")).toBe(true);
    expect(request.data?.[PROPOSAL_METADATA_KEYS.source]).toBe(PROPOSAL_COPILOT_SOURCE_MARKER);
    expect(request.data?.[PROPOSAL_METADATA_KEYS.generationId]).toBe("generation-1");
    expect(request.data?.[PROPOSAL_METADATA_KEYS.createdAt]).toBe("1970-01-01T00:00:00.000Z");
    expect(request.company_id).toBe(42);
    expect(request.language).toBe("en");
    expect(request.blocks?.[0]).toEqual({ content_id: 188485, type: "product-block" });
    expect(request.title_md).toBe("Title");
    expect(request.description_md).toBe("Description");
  });
});
