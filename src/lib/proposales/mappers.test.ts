import { describe, expect, it } from "vitest";

import { toContentItem } from "@/lib/proposales/mappers";
import { contentListResponseSchema } from "@/lib/proposales/schemas";

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
});
