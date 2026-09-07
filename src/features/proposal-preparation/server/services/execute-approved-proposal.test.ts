import { describe, expect, it } from "vitest";

import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";
import { toAppliedPricing } from "@/lib/proposales/applied-pricing.mapper";
import { ProposalesError } from "@/lib/proposales/errors";
import { PROPOSALES_READ_TOTAL_MS } from "@/lib/proposales/http";
import { toCreateProposalRequest, toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { validEnvelope } from "../../fixtures/envelopes";
import { LIBRARY_PRICING_STATEMENT_ID } from "../../schemas/approval";
import { appliedPricingSchema } from "../../schemas/draft-result";
import { toCreateDraftInput } from "../domain/to-create-draft-input";

type AnyRecord = Record<string, any>;

const EDITOR_ORIGIN = "https://proposales.test";
const CREATED_UUID = "123e4567-e89b-42d3-a456-4266141740aa";
const NOW = Date.parse("2026-09-07T10:00:00.000Z");

const consistentFixture = (await import("@/lib/proposales/fixtures/proposal-readback.consistent.json")).default;
const inconsistentFixture = (await import("@/lib/proposales/fixtures/proposal-readback.inconsistent.json")).default;

function readbackFrom(fixture: unknown) {
  return toProposalReadback(proposalReadbackSchema.parse(fixture).data);
}

async function modules() {
  return { service: await import("./execute-approved-proposal") };
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

function harness(options: AnyRecord = {}) {
  const lines: string[] = [];
  const clock = options.clock ?? (() => NOW);
  const proposales = createFakeProposalesClient({
    editorOrigin: EDITOR_ORIGIN,
    newUuid: () => CREATED_UUID,
    proposalReadback: readbackFrom(consistentFixture),
    // The create metadata timestamp comes from the client's own clock, so the fake gets the same
    // injected one; otherwise every request differs and determinism is unassertable.
    now: clock,
    ...options,
  });

  // The fake records a create only after it succeeds, and never records a read, so attempts are
  // counted here rather than inferred from `calls`.
  const attempts = { create: 0, read: [] as string[] };
  const create = proposales.createProposalDraft.bind(proposales);
  const read = proposales.getProposal.bind(proposales);
  proposales.createProposalDraft = async (input) => {
    attempts.create += 1;
    return create(input);
  };
  proposales.getProposal = async (uuid) => {
    attempts.read.push(uuid);
    return read(uuid);
  };

  return {
    proposales,
    attempts,
    lines,
    deps: {
      proposales,
      // Separable from the fake's clock: the read-back's elapsed measurement is the service's,
      // while the create metadata timestamp is the client's.
      now: options.depsNow ?? clock,
      logger: createLogger({ sink: (line) => lines.push(line) }),
      editorOrigin: EDITOR_ORIGIN,
    },
  };
}

function recoveredSummary(generationId: string, extra: AnyRecord = {}) {
  return {
    proposalUuid: "123e4567-e89b-42d3-a456-4266141740bb",
    url: `${EDITOR_ORIGIN}/p/123e4567-e89b-42d3-a456-4266141740bb`,
    generationId,
    ...extra,
  };
}

async function refusal(run: () => Promise<unknown>): Promise<AnyRecord> {
  try {
    await run();
  } catch (error) {
    return error as AnyRecord;
  }
  throw new Error("expected execution to refuse");
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

describe("execute approved proposal", () => {
  it("X1 refuses anything that is not a parsed approved proposal", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness();

    // A consequential mutation reached through any path other than approval is refused.
    const error = await refusal(() => service.executeApprovedProposal(approvedFrom().proposition, deps));
    expect(error.code).toBe("approval_required");
    expect(proposales.writes).toBe(0);
    proposales.assertNoWrites();

    const stripped = approvedFrom();
    delete stripped.pricingAcknowledgment;
    expect((await refusal(() => service.executeApprovedProposal(stripped, deps))).code).toBe("approval_required");
    expect(proposales.writes).toBe(0);
  });

  it("X2(a) creates exactly one draft when nothing carries the generation id", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness();

    const { result, draftReference } = await service.executeApprovedProposal(approvedFrom(), deps);

    expect(result.status).toBe("created");
    expect(result.draft.newlyCreated).toBe(true);
    expect(proposales.writes).toBe(1);
    expect(result.draft.proposalUuid).toBe(CREATED_UUID);
    expect(draftReference).toEqual({ proposalUuid: CREATED_UUID, editorUrl: `${EDITOR_ORIGIN}/proposals/${CREATED_UUID}` });
  });

  it("X2(b) returns the existing draft and creates nothing when one match is found", async () => {
    const { service } = await modules();
    const approved = approvedFrom();
    const match = recoveredSummary(approved.generationId, { status: "draft", seriesUuid: "series-1" });
    const { proposales, deps } = harness({
      proposals: [match],
      proposalReadbacks: { [match.proposalUuid]: readbackFrom(consistentFixture) },
    });

    const { result, draftReference } = await service.executeApprovedProposal(approved, deps);

    expect(result.status).toBe("recovered");
    expect(result.draft.newlyCreated).toBe(false);
    expect(proposales.writes).toBe(0);
    expect(draftReference).toEqual({ proposalUuid: match.proposalUuid, editorUrl: match.url });
    // Only if cheap: the read-back that already happens carries these through.
    expect(result.draft.status).toBe("draft");
    expect(result.draft.seriesUuid).toBe("series-1");
  });

  it("X2(c) refuses to pick one when two proposals carry the generation id", async () => {
    const { service } = await modules();
    const approved = approvedFrom();
    const first = recoveredSummary(approved.generationId);
    const second = { ...first, proposalUuid: "123e4567-e89b-42d3-a456-4266141740cc" };
    const { proposales, deps } = harness({ proposals: [first, second] });

    const error = await refusal(() => service.executeApprovedProposal(approved, deps));
    expect(error.code).toBe("conflict");
    expect(error.details.reason).toBe("multiple_recovery_matches");
    expect(error.details.proposalUuids).toEqual([first.proposalUuid, second.proposalUuid]);
    expect(proposales.writes).toBe(0);
  });

  it("X4(a) never creates when the recovery search itself fails", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness();
    proposales.failNext("findProposalsByGenerationId", ProposalesError.fromUpstream({ status: 503, operation: "findProposalsByGenerationId", kind: "http" }));

    // Execution does not proceed blindly: the failure surfaces and the human retries.
    const error = await refusal(() => service.executeApprovedProposal(approvedFrom(), deps));
    expect(error.code).toBe("integration_error");
    expect(proposales.writes).toBe(0);
  });

  it("X4(b) never retries the create", async () => {
    const { service } = await modules();
    const { proposales, attempts, deps } = harness();
    proposales.failNext("createProposalDraft", ProposalesError.fromUpstream({ status: 503, operation: "createProposalDraft", kind: "http" }));

    const error = await refusal(() => service.executeApprovedProposal(approvedFrom(), deps));
    expect(error.code).toBe("integration_error");
    // One attempt, from one call site with no surrounding loop: a non-idempotent write is never
    // auto-retried, or the failure a human sees could already be a second draft.
    expect(attempts.create).toBe(1);
  });

  it("X5 sends exactly the mapped approved payload, carrying no price field", async () => {
    const { service } = await modules();
    const approved = approvedFrom();
    const { proposales, deps } = harness();

    await service.executeApprovedProposal(approved, deps);

    const create = proposales.calls.find((call) => call.op === "createProposalDraft") as AnyRecord;
    expect(create.input).toEqual(toCreateDraftInput(approved as never));
    expect(create.request).toEqual(toCreateProposalRequest(
      toCreateDraftInput(approved as never),
      { companyId: proposales.company.companyId, now: () => NOW },
    ));

    const keys = keysDeep(create.request);
    for (const forbidden of ["unit_value", "package_split", "currency", "tax_options", "price", "value_with", "value_without", "discount"]) {
      expect({ forbidden, hit: keys.some((key) => key.includes(forbidden)) }).toEqual({ forbidden, hit: false });
    }
    // The scan can see one when it is there.
    expect(keysDeep({ blocks: [{ unit_value_with_tax: 1 }] }).some((key) => key.includes("unit_value"))).toBe(true);
    // The three metadata keys are what recovery searches on, so they must be present.
    expect(Object.keys(create.request.data).sort()).toEqual([
      "proposal_copilot_created_at",
      "proposal_copilot_generation_id",
      "proposal_copilot_source",
    ]);
  });

  it("X5(b) is deterministic for the same approved payload and clock", async () => {
    const { service } = await modules();
    const approved = approvedFrom();

    const first = harness();
    await service.executeApprovedProposal(structuredClone(approved), first.deps);
    const second = harness();
    await service.executeApprovedProposal(structuredClone(approved), second.deps);

    const requestOf = (fake: AnyRecord) => JSON.stringify((fake.calls.find((call: AnyRecord) => call.op === "createProposalDraft") as AnyRecord).request);
    expect(requestOf(first.proposales)).toBe(requestOf(second.proposales));
  });

  it("X6 reads the draft back once and reports the pricing Proposales applied", async () => {
    const { service } = await modules();
    const { proposales, attempts, deps } = harness();

    const { result } = await service.executeApprovedProposal(approvedFrom(), deps);

    expect(attempts.read).toEqual([CREATED_UUID]);
    expect(result.draft.appliedPricing).toEqual(
      appliedPricingSchema.parse(toAppliedPricing(proposales.storedReadbacks.get(CREATED_UUID) as never)),
    );
    expect(result.draft.appliedPricing.available).toBe(true);
  });

  it("X6(b) reports an inconsistent draft verbatim rather than reconciling it", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness({ proposalReadback: readbackFrom(inconsistentFixture) });

    const { result } = await service.executeApprovedProposal(approvedFrom(), deps);
    const stored = proposales.storedReadbacks.get(CREATED_UUID) as AnyRecord;

    // Detecting the inconsistency would be arithmetic; the reviewer sees the numbers instead.
    expect(result.draft.appliedPricing).toEqual(appliedPricingSchema.parse(toAppliedPricing(stored as never)));
    const pricing = result.draft.appliedPricing as AnyRecord;
    expect(pricing.totalWithTax.amountMinor).toBe(stored.totalWithTax);
    expect(pricing.totalWithoutTax.amountMinor).toBe(stored.totalWithoutTax);
  });

  it("X7 never downgrades a created draft when the read-back fails", async () => {
    const { service } = await modules();
    const cases = [
      { name: "upstream 503", error: () => ProposalesError.fromUpstream({ status: 503, operation: "getProposal", kind: "http" }), reason: "read_failed_upstream", status: 503 },
      { name: "not found", error: () => ProposalesError.fromUpstream({ status: 404, operation: "getProposal", kind: "http" }), reason: "read_failed_upstream", status: 404 },
      { name: "timeout", error: () => ProposalesError.fromUpstream({ operation: "getProposal", kind: "timeout" }), reason: "read_failed_timeout", status: undefined },
      { name: "schema mismatch", error: () => ProposalesError.schemaMismatch("getProposal", proposalReadbackSchema.safeParse({}).error!), reason: "read_failed_schema_mismatch", status: undefined },
    ];

    for (const testCase of cases) {
      const { proposales, deps } = harness();
      proposales.failNext("getProposal", testCase.error());

      const { result } = await service.executeApprovedProposal(approvedFrom(), deps);

      expect({ name: testCase.name, status: result.status }).toEqual({ name: testCase.name, status: "created" });
      expect({ name: testCase.name, pricing: result.draft.appliedPricing }).toEqual({
        name: testCase.name,
        pricing: { available: false, reason: testCase.reason, ...(testCase.status === undefined ? {} : { status: testCase.status }) },
      });
      // The draft exists and its editor URL is valid, so no error is returned and no second create.
      expect({ name: testCase.name, writes: proposales.writes }).toEqual({ name: testCase.name, writes: 1 });
      expect(result.draft.editorUrl).toContain(CREATED_UUID);
      expect(keysDeep(result.draft.appliedPricing).some((key) => /amountMinor|total|unitValue/.test(key))).toBe(false);
    }
  });

  it("X7(b) names the read budget when a retryable read has spent it", async () => {
    const { service } = await modules();
    let reading = 0;
    // The elapsed cap is the outer bound, so it decides before the last attempt's own reason: the
    // second reading, taken after the failure, is past the total read budget.
    const depsNow = () => (reading++ === 0 ? NOW : NOW + PROPOSALES_READ_TOTAL_MS + 1);
    const { proposales, deps } = harness({ depsNow });
    proposales.failNext("getProposal", ProposalesError.fromUpstream({ status: 503, operation: "getProposal", kind: "http" }));

    const { result } = await service.executeApprovedProposal(approvedFrom(), deps);
    expect(result.draft.appliedPricing).toEqual({ available: false, reason: "read_budget_exhausted" });
    expect(result.status).toBe("created");
  });

  it("X8 returns a plain-JSON result and logs ids only", async () => {
    const { service } = await modules();
    const { lines, deps } = harness();

    const { result } = await service.executeApprovedProposal(approvedFrom(), deps);

    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    const line = lines.find((entry) => entry.includes("execution.created"));
    expect(line).toBeDefined();
    const record = JSON.parse(line as string);
    expect(record.proposalUuid).toBe(CREATED_UUID);
    expect(line).not.toContain("ada@example.com");
    expect(line).not.toContain("Analytical Engines");
  });

  it("X9 notices an inline recipient and an unexpected editor origin", async () => {
    const { service } = await modules();

    const withRecipient = harness();
    const created = await service.executeApprovedProposal(approvedFrom(), withRecipient.deps);
    expect(created.result.draft.notices).toEqual([{ kind: "inline_recipient_may_duplicate_contact" }]);

    const withoutRecipient = harness();
    const unset = await service.executeApprovedProposal(approvedFrom((proposition) => {
      proposition.recipient = { known: false };
    }), withoutRecipient.deps);
    expect(unset.result.draft.notices).toEqual([]);

    // An upstream URL is checked against the expected origin before it is handed to a human.
    const foreign = harness({ editorOrigin: "https://other.test" });
    const elsewhere = await service.executeApprovedProposal(approvedFrom((proposition) => {
      proposition.recipient = { known: false };
    }), foreign.deps);
    expect(elsewhere.result.status).toBe("created");
    expect(elsewhere.result.draft.notices).toEqual([{ kind: "editor_url_origin_unexpected" }]);
  });

  it("X10 has no AI client in its dependencies at all", async () => {
    const { service } = await modules();
    const { deps } = harness();
    // Zero model calls is a property of the signature, not only of the body: there is nothing to
    // call. `deps` is exactly these four keys.
    expect(Object.keys(deps).sort()).toEqual(["editorOrigin", "logger", "now", "proposales"]);
    expect(await service.executeApprovedProposal(approvedFrom(), deps)).toBeDefined();
  });
});
