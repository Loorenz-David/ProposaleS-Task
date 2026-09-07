import { describe, expect, it } from "vitest";

import { validEnvelope } from "../fixtures/envelopes";

type AnyRecord = Record<string, any>;

const EDITOR_ORIGIN = "https://proposales.test";

async function modules() {
  return {
    approval: await import("./approval"),
  };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

function firstIssue(result: AnyRecord): AnyRecord {
  if (result.success) throw new Error("expected parse failure");
  return result.error.issues[0];
}

describe("approval schemas", () => {
  it("S1(a) accepts the valid envelope", async () => {
    const { approval } = await modules();
    const parsed = approval.approvalEnvelopeSchemaFor(EDITOR_ORIGIN).safeParse(validEnvelope());
    expect(parsed.success).toBe(true);
  });

  it("S1(b) refuses an absent, false, or wrongly-identified pricing acknowledgment", async () => {
    const { approval } = await modules();
    const schema = approval.approvalEnvelopeSchemaFor(EDITOR_ORIGIN);

    const absent = clone(validEnvelope());
    delete absent.pricingAcknowledgment;
    expect(firstIssue(schema.safeParse(absent)).path).toEqual(["pricingAcknowledgment"]);

    // z.literal(true) rather than z.boolean() is what makes absent and false the same refusal.
    const declined = validEnvelope({ pricingAcknowledgment: { acknowledged: false, statement: approval.LIBRARY_PRICING_STATEMENT_ID } });
    expect(firstIssue(schema.safeParse(declined)).path).toEqual(["pricingAcknowledgment", "acknowledged"]);

    const stale = validEnvelope({ pricingAcknowledgment: { acknowledged: true, statement: "library-pricing-v0" } });
    expect(firstIssue(schema.safeParse(stale)).path).toEqual(["pricingAcknowledgment", "statement"]);
  });

  it("S1(c) refuses a conversation smuggled into the envelope", async () => {
    const { approval } = await modules();
    const withConversation = validEnvelope({ conversation: { turns: [], omittedTurns: 0 } });
    const issue = firstIssue(approval.approvalEnvelopeSchemaFor(EDITOR_ORIGIN).safeParse(withConversation));
    expect({ code: issue.code, path: issue.path, keys: issue.keys }).toEqual({
      code: "unrecognized_keys",
      path: [],
      keys: ["conversation"],
    });
  });

  it("S1(d) refuses an envelope whose state carries an unknown key", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    envelope.state.draftRefernce = { proposalUuid: "x" };
    const issue = firstIssue(approval.approvalEnvelopeSchemaFor(EDITOR_ORIGIN).safeParse(envelope));
    expect({ code: issue.code, path: issue.path }).toEqual({ code: "unrecognized_keys", path: ["state"] });
  });

  it("S1(e) states the acknowledged wording beside its id, so changing one changes the other", async () => {
    const { approval } = await modules();
    expect(approval.LIBRARY_PRICING_STATEMENT_ID).toMatch(/^library-pricing-v\d+$/);
    expect(approval.LIBRARY_PRICING_STATEMENT_TEXT.length).toBeGreaterThan(0);
    expect(approval.LIBRARY_PRICING_STATEMENT_TEXT).toContain("library");
    // The statement is what the human acknowledged: it must say the application sets no prices.
    expect(approval.LIBRARY_PRICING_STATEMENT_TEXT.toLowerCase()).toContain("no price");
  });

  it("S1(f) an approved proposal round trips as plain JSON", async () => {
    const { approval } = await modules();
    const envelope = validEnvelope();
    const approved = {
      generationId: envelope.state.generationId,
      proposition: envelope.proposition,
      pricingAcknowledgment: envelope.pricingAcknowledgment,
      approvedAt: "2026-09-07T10:00:00.000Z",
      diff: [{ path: ["title"], before: null, after: "New" }],
    };
    const parsed = approval.approvedProposalSchema.parse(approved);
    expect(JSON.parse(JSON.stringify(parsed))).toEqual(approved);
  });
});
