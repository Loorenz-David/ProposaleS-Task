import { describe, expect, it } from "vitest";

import { validEnvelope } from "../../fixtures/envelopes";
import { LIBRARY_PRICING_STATEMENT_ID } from "../../schemas/approval";

type AnyRecord = Record<string, any>;

async function modules() {
  return { mapper: await import("./to-create-draft-input") };
}

function approvedFrom(edit: (proposition: AnyRecord) => void = () => {}): AnyRecord {
  const envelope = structuredClone(validEnvelope()) as AnyRecord;
  edit(envelope.proposition);
  return {
    generationId: envelope.state.generationId,
    proposition: envelope.proposition,
    pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
    approvedAt: "2026-09-07T10:00:00.000Z",
    diff: [],
  };
}

function keysDeep(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) keysDeep(entry, found);
    return found;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as AnyRecord)) {
      found.push(key);
      keysDeep(nested, found);
    }
  }
  return found;
}

describe("approved proposal to create input", () => {
  it("X5(a) carries the approved identity, text and blocks", async () => {
    const { mapper } = await modules();
    const approved = approvedFrom();
    const input = mapper.toCreateDraftInput(approved as never);

    expect(input.language).toBe("en");
    expect(input.titleMd).toBe(approved.proposition.title.value);
    expect(input.generationId).toBe(approved.generationId);
    expect(input.blocks).toEqual([{
      contentId: approved.proposition.blocks[0].contentId.value,
      quantity: { known: true, value: 2 },
      optional: { known: true, value: false },
    }]);
  });

  it("X5(b) omits an absent quantity or optional flag rather than defaulting it", async () => {
    const { mapper } = await modules();
    const input = mapper.toCreateDraftInput(approvedFrom((proposition) => {
      proposition.blocks[0].quantity = { known: false };
      proposition.blocks[0].optional = { known: false };
    }) as never);

    // "Absent" and "Proposales applies 1" are different facts. A default here would turn the
    // second into the first before the request is even built.
    expect(input.blocks[0].quantity).toEqual({ known: false });
    expect(input.blocks[0].optional).toEqual({ known: false });
    expect(JSON.stringify(input.blocks[0])).not.toContain("value");
  });

  it("X5(c) omits an absent narrative", async () => {
    const { mapper } = await modules();
    const withNarrative = mapper.toCreateDraftInput(approvedFrom() as never);
    expect(withNarrative.descriptionMd).toBe("A concise support proposal.");

    const without = mapper.toCreateDraftInput(approvedFrom((proposition) => {
      proposition.descriptionNarrative = { known: false };
    }) as never);
    expect("descriptionMd" in without).toBe(false);
  });

  it("X5(d) carries only the recipient leaves that are known", async () => {
    const { mapper } = await modules();
    const input = mapper.toCreateDraftInput(approvedFrom((proposition) => {
      proposition.recipient.value.phone = { known: false };
      proposition.recipient.value.lastName = { known: false };
    }) as never);

    expect(input.recipient).toEqual({
      known: true,
      value: { firstName: "Ada", email: "ada@example.com", companyName: "Analytical Engines" },
    });
  });

  it("X5(e) treats an unset recipient, and one whose every leaf is absent, as absent", async () => {
    const { mapper } = await modules();
    const unset = mapper.toCreateDraftInput(approvedFrom((proposition) => {
      proposition.recipient = { known: false };
    }) as never);
    expect(unset.recipient).toEqual({ known: false });

    // Never `recipient: {}`: an empty object asserts an empty contact, and a strict vendor schema
    // may reject it.
    const emptied = mapper.toCreateDraftInput(approvedFrom((proposition) => {
      for (const key of ["firstName", "lastName", "email", "phone", "companyName"]) {
        proposition.recipient.value[key] = { known: false };
      }
    }) as never);
    expect(emptied.recipient).toEqual({ known: false });
  });

  it("X5(f) carries no price-bearing field out of the proposition", async () => {
    const { mapper } = await modules();
    // The proposition states a price expectation as a commercial note; the create input has no
    // field it could travel in.
    const approved = approvedFrom();
    expect(approved.proposition.commercialNotes[0].amount.known).toBe(true);

    const keys = keysDeep(mapper.toCreateDraftInput(approved as never));
    for (const forbidden of ["amount", "amountMinor", "currency", "unitValue", "packageSplit", "taxOptions", "taxBasis", "price", "total"]) {
      expect({ forbidden, hit: keys.some((key) => key.toLowerCase().includes(forbidden.toLowerCase())) })
        .toEqual({ forbidden, hit: false });
    }
    // The scan can see a key when one is present.
    expect(keysDeep({ blocks: [{ unitValueWithTax: 1 }] }).some((key) => key.includes("unitValue"))).toBe(true);
  });

  it("X5(g) is deterministic", async () => {
    const { mapper } = await modules();
    const approved = approvedFrom();
    expect(JSON.stringify(mapper.toCreateDraftInput(approved as never)))
      .toBe(JSON.stringify(mapper.toCreateDraftInput(structuredClone(approved) as never)));
  });
});
