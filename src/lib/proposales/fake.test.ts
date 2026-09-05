import { describe, expect, it } from "vitest";

import { createFakeProposalesClient } from "@/lib/proposales/fake";
import type { CompanyInfo, ContentItem, CreateProposalDraftInput } from "@/lib/proposales/index";

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
  it("C3(h) records the mapped create request and stores the injected read-back", async () => {
    const proposalReadback = { available: true } as never;
    const input: CreateProposalDraftInput = {
      language: "en",
      recipient: { known: false },
      blocks: [{ contentId: "188485", quantity: { known: false }, optional: { known: false } }],
      generationId: "generation-1",
    };
    const fake = createFakeProposalesClient({ companyId: 42, now: () => 0, newUuid: () => "11111111-1111-4111-8111-111111111111", proposalReadback });
    await fake.createProposalDraft(input);
    expect(fake.calls.at(-1)).toMatchObject({ op: "createProposalDraft", input });
    expect(fake.writes).toBe(1);
    expect(fake.storedReadbacks.get("11111111-1111-4111-8111-111111111111")).toBe(proposalReadback);
    expect(() => fake.assertNoWrites()).toThrow();
  });

  it("C5(a-d) recovers only stored rows with exact metadata", async () => {
    const fake = createFakeProposalesClient({ proposals: [{ proposalUuid: "22222222-2222-4222-8222-222222222222", generationId: "generation-1", url: "https://proposales.test/draft" }] as never });
    await expect(fake.findProposalsByGenerationId("generation-1")).resolves.toHaveLength(1);
    await expect(fake.findProposalsByGenerationId("GENERATION-1")).resolves.toHaveLength(0);
  });

  it("C6(e) can queue a read failure", async () => {
    const error = new Error("read failed");
    const fake = createFakeProposalesClient();
    fake.failNext("getProposal", error);
    await expect(fake.getProposal("missing")).rejects.toBe(error);
  });
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
