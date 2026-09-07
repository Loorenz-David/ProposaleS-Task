import { describe, expect, it } from "vitest";

import { createFailingAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";
import { toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { validEnvelope } from "../../fixtures/envelopes";
import { approvalResultSchemaFor } from "../../schemas/turn-result";

type AnyRecord = Record<string, any>;

const EDITOR_ORIGIN = "https://proposales.test";
const CREATED_UUID = "123e4567-e89b-42d3-a456-4266141740aa";
const NOW = Date.parse("2026-09-07T10:00:00.000Z");

const consistentFixture = (await import("@/lib/proposales/fixtures/proposal-readback.consistent.json")).default;

async function modules() {
  return { service: await import("./approve-proposition") };
}

function harness(options: AnyRecord = {}) {
  const lines: string[] = [];
  const proposales = createFakeProposalesClient({
    editorOrigin: EDITOR_ORIGIN,
    newUuid: () => CREATED_UUID,
    proposalReadback: toProposalReadback(proposalReadbackSchema.parse(consistentFixture).data),
    now: () => NOW,
    ...options,
  });
  return {
    proposales,
    lines,
    deps: {
      proposales,
      // A client that throws on any call. If execution ever reached a model, this would fail the
      // test rather than quietly changing the approved payload.
      ai: createFailingAiClient(),
      now: () => NOW,
      logger: createLogger({ sink: (line) => lines.push(line) }),
      editorOrigin: EDITOR_ORIGIN,
    },
  };
}

async function refusal(run: () => Promise<unknown>): Promise<AnyRecord> {
  try {
    await run();
  } catch (error) {
    return error as AnyRecord;
  }
  throw new Error("expected approval to refuse");
}

describe("approve proposition", () => {
  it("X3 validates and executes without ever calling the model", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness();

    const result = await service.approveProposition({ envelope: validEnvelope() }, deps);

    expect(result.result.status).toBe("created");
    expect(proposales.writes).toBe(1);
    expect(result.result.draft.appliedPricing.available).toBe(true);
  });

  it("X8(a) writes the draft reference into the returned state and changes nothing else", async () => {
    const { service } = await modules();
    const { deps } = harness();
    const envelope = validEnvelope();

    const result = await service.approveProposition({ envelope }, deps);

    expect(result.state.draftReference).toEqual({
      proposalUuid: CREATED_UUID,
      editorUrl: `${EDITOR_ORIGIN}/proposals/${CREATED_UUID}`,
    });

    const { draftReference, ...rest } = result.state as AnyRecord;
    const { conversation, ...inboundState } = envelope.state as AnyRecord;
    expect(rest).toEqual(inboundState);
  });

  it("X8(b) returns a plain-JSON result that parses as an approval result", async () => {
    const { service } = await modules();
    const { deps } = harness();

    const result = await service.approveProposition({ envelope: validEnvelope() }, deps);

    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(approvalResultSchemaFor(EDITOR_ORIGIN).parse(result)).toEqual(result);
    // The approval turn produces no conversational turn at all.
    expect("conversation" in result).toBe(false);
  });

  it("X8(c) refuses a second approval of a workflow that already has a draft", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness();

    const first = await service.approveProposition({ envelope: validEnvelope() }, deps);
    const envelope = validEnvelope();
    envelope.state = first.state;

    const error = await refusal(() => service.approveProposition({ envelope }, deps));

    expect(error.code).toBe("conflict");
    expect(error.details.reason).toBe("draft_already_exists");
    expect(error.details.proposalUuid).toBe(CREATED_UUID);
    // No create, no recovery search, no patch: once the human has the editor URL, Proposales is
    // the editing environment.
    expect(proposales.writes).toBe(1);
    expect(proposales.calls.filter((call) => call.op === "createProposalDraft")).toHaveLength(1);
  });

  it("X8(d) refuses before it touches Proposales when validation fails", async () => {
    const { service } = await modules();
    const { proposales, deps } = harness();
    const envelope = structuredClone(validEnvelope()) as AnyRecord;
    delete envelope.pricingAcknowledgment;

    const error = await refusal(() => service.approveProposition({ envelope }, deps));

    expect(error.details.reason).toBe("pricing_acknowledgment_missing");
    expect(proposales.calls).toEqual([]);
    expect(proposales.writes).toBe(0);
  });

  it("X8(e) recovers rather than creating a second draft for the same generation id", async () => {
    const { service } = await modules();
    const envelope = validEnvelope();
    const match = {
      proposalUuid: "123e4567-e89b-42d3-a456-4266141740bb",
      url: `${EDITOR_ORIGIN}/p/123e4567-e89b-42d3-a456-4266141740bb`,
      generationId: envelope.state.generationId,
    };
    const { proposales, deps } = harness({
      proposals: [match],
      proposalReadbacks: { [match.proposalUuid]: toProposalReadback(proposalReadbackSchema.parse(consistentFixture).data) },
    });

    const result = await service.approveProposition({ envelope }, deps);

    expect(result.result.status).toBe("recovered");
    expect(result.result.draft.newlyCreated).toBe(false);
    expect(proposales.writes).toBe(0);
    expect(result.state.draftReference?.proposalUuid).toBe(match.proposalUuid);
  });
});
