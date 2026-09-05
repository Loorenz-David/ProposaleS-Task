import { describe, expect, it } from "vitest";

import { createFakeProposalesClient } from "@/lib/proposales/fake";
import type { CompanyInfo, ContentItem } from "@/lib/proposales/index";

const catalog: ContentItem[] = [
  {
    variationId: "188485",
    productId: "12345",
    title: { en: "Premium support" },
    description: { en: "Priority help" },
    createdAt: "2025-09-05T08:00:00.000Z",
    images: ["https://cdn.proposales.test/premium.png"],
  },
];

describe("Proposales fake client", () => {
  it("C4(e) records the list read and exposes no write surface", async () => {
    const fake = createFakeProposalesClient({ catalog });

    await expect(fake.listContent()).resolves.toBe(catalog);
    expect(fake.calls).toEqual([{ op: "listContent" }]);
    expect(fake.writes).toBe(0);
    expect(() => fake.assertNoWrites()).not.toThrow();
  });

  it("C6(d) records and returns the configured company", async () => {
    const company: CompanyInfo = { companyId: 42, currency: "EUR", taxMode: "standard" };
    const fake = createFakeProposalesClient({ company });

    await expect(fake.getCompany()).resolves.toBe(company);
    expect(fake.calls).toEqual([{ op: "getCompany" }]);
    expect(fake.writes).toBe(0);
  });
});
