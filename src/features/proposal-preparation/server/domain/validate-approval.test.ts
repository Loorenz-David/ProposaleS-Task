import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { createLogger } from "@/lib/logger";

import { editedEnvelope, validEnvelope } from "../../fixtures/envelopes";
import { LIBRARY_PRICING_STATEMENT_ID } from "../../schemas/approval";

type AnyRecord = Record<string, any>;

const EDITOR_ORIGIN = "https://proposales.test";
const DRAFT_REFERENCE = {
  proposalUuid: "123e4567-e89b-42d3-a456-426614174009",
  editorUrl: "https://proposales.test/p/123e4567-e89b-42d3-a456-426614174009",
};

async function modules() {
  return { approval: await import("./validate-approval") };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

function capturingLogger() {
  const lines: string[] = [];
  return { logger: createLogger({ sink: (line) => lines.push(line) }), lines };
}

function ctx(now = () => Date.parse("2026-09-07T10:00:00.000Z")) {
  return { editorOrigin: EDITOR_ORIGIN, now, logger: capturingLogger().logger };
}

function failure(run: () => unknown): AnyRecord {
  try {
    run();
  } catch (error) {
    return error as AnyRecord;
  }
  throw new Error("expected validateApproval to refuse");
}

/** An inferred consequential leaf: the exact thing the provenance rule exists to refuse. */
function inferredQuantity(envelope: AnyRecord): AnyRecord {
  envelope.proposition.blocks[0].quantity = { known: true, value: 2, source: "inferred" };
  return envelope;
}

describe("approval validation", () => {
  it("A1(a) parses the state before it looks at terminality", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    envelope.state.draftReference = DRAFT_REFERENCE;
    envelope.state.stray = 1;

    // Both checks would fire; check 1 owns the outcome, so a malformed terminal state is a
    // validation error and not a conflict.
    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.code).toBe("validation_error");
    expect(error.details.issues[0].path).toEqual(["state", "stray"]);
  });

  it("A1(b) refuses a terminal workflow before it parses the envelope", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    envelope.state.draftReference = DRAFT_REFERENCE;
    delete envelope.pricingAcknowledgment;

    // A draft already exists and the envelope is also malformed; terminality wins, so criterion 21
    // does not pass or fail on fixture luck.
    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.code).toBe("conflict");
    expect(error.details.reason).toBe("draft_already_exists");
  });

  it("A1(c) refuses the missing acknowledgment before it judges provenance", async () => {
    const { approval } = await modules();
    const envelope = inferredQuantity(clone(validEnvelope()));
    delete envelope.pricingAcknowledgment;

    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.details.reason).toBe("pricing_acknowledgment_missing");
    expect(error.details.issues[0].path).toEqual(["pricingAcknowledgment"]);
  });

  it("A1(d) judges provenance before completeness", async () => {
    const { approval } = await modules();
    const envelope = inferredQuantity(clone(validEnvelope()));
    // Also incomplete: the language required to create is absent.
    envelope.proposition.language = { known: false };

    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.code).toBe("validation_error");
    expect(error.details.reason).toBe("consequential_provenance_invalid");
    expect(error.details.issues[0].path.slice(0, 4)).toEqual(["proposition", "blocks", "0", "quantity"]);
  });

  it("A2 names the existing draft in the conflict, so the human can go to the editor", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    envelope.state.draftReference = DRAFT_REFERENCE;

    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect({ code: error.code, reason: error.details.reason, uuid: error.details.proposalUuid, url: error.details.editorUrl })
      .toEqual({
        code: "conflict",
        reason: "draft_already_exists",
        uuid: DRAFT_REFERENCE.proposalUuid,
        url: DRAFT_REFERENCE.editorUrl,
      });
    expect(error.message).toContain("Proposales editor");
  });

  it("A3(a) refuses an absent, false, or stale acknowledgment the same way", async () => {
    const { approval } = await modules();
    for (const acknowledgment of [
      undefined,
      { acknowledged: false, statement: LIBRARY_PRICING_STATEMENT_ID },
      { acknowledged: true, statement: "library-pricing-v0" },
    ]) {
      const envelope = clone(validEnvelope());
      if (acknowledgment === undefined) delete envelope.pricingAcknowledgment;
      else envelope.pricingAcknowledgment = acknowledgment;

      const error = failure(() => approval.validateApproval(envelope, ctx()));
      expect({ acknowledgment, reason: error.details.reason }).toEqual({ acknowledgment, reason: "pricing_acknowledgment_missing" });
      expect(error.details.issues[0].path[0]).toBe("pricingAcknowledgment");
    }
  });

  it("A3(b) names the unresolved required-to-create items", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    envelope.proposition.language = { known: false };

    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.details.reason).toBe("required_to_create_unresolved");
    expect(error.details.itemKeys).toEqual(["language"]);
  });

  it("A3(c) refuses an empty draft unless a human confirmed it", async () => {
    const { approval } = await modules();
    const empty = clone(validEnvelope());
    empty.proposition.blocks = [];
    empty.proposition.emptyDraftConfirmation = { known: false };

    const error = failure(() => approval.validateApproval(empty, ctx()));
    expect(error.details.itemKeys).toEqual(["block_selection"]);

    // The confirmation is a human act the agent cannot perform, and it is what makes the empty
    // draft approvable.
    const confirmed = clone(empty);
    confirmed.proposition.emptyDraftConfirmation = { known: true, value: true, source: "human", ref: { editTurn: 1 } };
    expect(approval.validateApproval(confirmed, ctx()).approved.proposition.blocks).toEqual([]);
  });

  it("A3(d) accepts a deferred item that is not required to create", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    envelope.state.items.recipient_identity = { resolution: "deferred_by_user" };
    envelope.proposition.recipient = { known: false };

    // Deferral has no effect on approvability except through the create policy.
    expect(approval.validateApproval(envelope, ctx()).approved.proposition.recipient).toEqual({ known: false });
  });

  it("A4(a) produces an approved proposal stamped from the injected clock", async () => {
    const { approval } = await modules();
    const envelope = validEnvelope();
    const { approved } = approval.validateApproval(envelope, ctx());

    expect(approved.approvedAt).toBe("2026-09-07T10:00:00.000Z");
    expect(approved.generationId).toBe(envelope.state.generationId);
    expect(approved.pricingAcknowledgment).toEqual(envelope.pricingAcknowledgment);
    expect(approved.diff).toEqual([]);
    const { approvedProposalSchema } = await import("../../schemas/approval");
    expect(approvedProposalSchema.parse(approved)).toEqual(approved);
  });

  it("A4(b) approves the corrected payload and records what the human changed", async () => {
    const { approval } = await modules();
    const envelope = editedEnvelope((proposition) => {
      const edited = proposition as AnyRecord;
      edited.title = { known: true, value: "The human's title", source: "human", ref: { editTurn: 2 } };
      return edited as never;
    });

    const { approved } = approval.validateApproval(envelope, ctx());
    // The approved proposition is the one submitted, not the one the agent last emitted.
    expect((approved.proposition.title as AnyRecord).value).toBe("The human's title");
    expect(approved.diff.map((entry) => entry.path)).toEqual([["title"]]);
  });

  it("A6(a) takes no conversation and refuses one smuggled in", async () => {
    const { approval } = await modules();
    const envelope = validEnvelope({ conversation: { turns: [], omittedTurns: 0 } });

    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.code).toBe("validation_error");
    expect(error.details.issues.map((issue: AnyRecord) => issue.path)).toContainEqual(["conversation"]);
  });

  it("A6(b) reaches no conversation, and validation reaches no Proposales client", async () => {
    const conversation = [
      { name: "conversation schema", pattern: /schemas\/conversation/ },
      { name: "conversation domain", pattern: /domain\/conversation/ },
    ];
    const proposales = { name: "proposales client", pattern: /from "@\/lib\/proposales/ };
    const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

    // Neither approval module may consult the transcript to rediscover a commercial fact.
    for (const relative of ["./validate-approval.ts", "../services/approve-proposition.ts"]) {
      const source = read(relative);
      expect({ relative, hits: conversation.filter((entry) => entry.pattern.test(source)).map((entry) => entry.name) })
        .toEqual({ relative, hits: [] });
    }

    // Terminality is a property of the state, so validation reaches Proposales at all. The
    // approval service does, because it goes on to execute.
    expect(proposales.pattern.test(read("./validate-approval.ts"))).toBe(false);

    // Each pattern is shown able to find its target, so the absences above are evidence rather
    // than a description of the regexes.
    const planted = 'import { x } from "@/lib/proposales";\nimport { y } from "../../schemas/conversation";\nimport { z } from "../domain/conversation";';
    expect([proposales, ...conversation].filter((entry) => entry.pattern.test(planted)).map((entry) => entry.name))
      .toEqual(["proposales client", "conversation schema", "conversation domain"]);
  });

  it("A8 logs the diff paths and count, never the values", async () => {
    const { approval } = await modules();
    const capture = capturingLogger();
    const envelope = editedEnvelope((proposition) => {
      const edited = proposition as AnyRecord;
      edited.title = { known: true, value: "DIFF-VALUE-SENTINEL", source: "human", ref: { editTurn: 2 } };
      return edited as never;
    });

    approval.validateApproval(envelope, {
      editorOrigin: EDITOR_ORIGIN,
      now: () => Date.parse("2026-09-07T10:00:00.000Z"),
      logger: capture.logger,
    });

    const line = capture.lines.find((entry) => entry.includes("approval.validated"));
    expect(line).toBeDefined();
    const record = JSON.parse(line as string);
    expect(record.diffCount).toBe(1);
    expect(record.diffPaths).toEqual([["title"]]);
    // The diff can carry a recipient email and free text; recording it for the reviewer must not
    // become logging it.
    expect(line).not.toContain("DIFF-VALUE-SENTINEL");
  });

  it("A9 refuses an approval whose state has no prepared side to diff against", async () => {
    const { approval } = await modules();
    const envelope = clone(validEnvelope());
    delete envelope.state.preparedProposition;

    const error = failure(() => approval.validateApproval(envelope, ctx()));
    expect(error.details.reason).toBe("domain_rule");
    expect(error.details.issues[0].path).toEqual(["state", "preparedProposition"]);
  });
});
