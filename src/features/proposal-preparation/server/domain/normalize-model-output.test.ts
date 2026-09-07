import { describe, expect, it } from "vitest";

import { agentOutputSchemaFor } from "../../schemas/agent-output";
import { modelOutputSchemaFor, type ModelOutput } from "../../schemas/model-output";
import type { Proposition } from "../../schemas/proposition";
import { BRIEFS } from "../../fixtures/briefs";
import { briefRecipient, modelPropositionOutput } from "../../fixtures/scripts";
import { propositionWithAlternatives, validProposition } from "../../fixtures/propositions";
import { buildEvidenceRecord, type EvidenceRecordInput } from "./evidence-record";
import { normalizeModelOutput } from "./normalize-model-output";
import { extendRetrievalRecord, emptyRetrievalRecord, seedRetrievalRecord } from "./retrieval-record";
import { validateAgentOutput } from "./validate-agent-output";

type AnyRecord = Record<string, any>;

const BRIEF = BRIEFS.englishSimple;
const TURN_ID = "00000000-0000-4000-8000-000000000001";
const QUESTION_ID = "00000000-0000-4000-8000-000000000101";
const SKIPPED_ID = "00000000-0000-4000-8000-000000000102";

const RETRIEVED = [
  { variationId: "1", productId: "500101", title: "Consulting Training Service Bundle" },
  { variationId: "2", productId: "500102", title: "Consulting Workshop Service Track" },
];

function evidenceRecord(overrides: Partial<EvidenceRecordInput> = {}) {
  return buildEvidenceRecord({
    brief: BRIEF,
    retrieval: () => extendRetrievalRecord(emptyRetrievalRecord(), RETRIEVED),
    questions: [
      { questionId: QUESTION_ID, itemKey: "quantities", text: "How many?" },
      { questionId: SKIPPED_ID, itemKey: "recipient_identity", text: "Who receives it?" },
    ],
    answers: [
      { questionId: QUESTION_ID, answer: { kind: "answer", text: "Two of each." } },
      { questionId: SKIPPED_ID, answer: { kind: "skip" } },
    ],
    ...overrides,
  });
}

/** Parses through the real contract first: the adapter only ever sees schema-valid output. */
function parsed(output: unknown, mode: "prepare" | "revise" = "prepare"): ModelOutput {
  const result = modelOutputSchemaFor({ mode, allowClarification: false }).safeParse(output);
  if (!result.success) throw new Error(`fixture is not valid model output: ${JSON.stringify(result.error.issues)}`);
  return result.data;
}

function normalize(output: unknown, options: { mode?: "prepare" | "revise"; evidence?: ReturnType<typeof evidenceRecord> } = {}) {
  const mode = options.mode ?? "prepare";
  return normalizeModelOutput(parsed(output, mode), options.evidence ?? evidenceRecord(), { mode, allowClarification: false });
}

function proposition(result: ReturnType<typeof normalize>): AnyRecord {
  if (!result.ok) throw new Error(`expected a normalized proposition, got issues: ${JSON.stringify(result.issues)}`);
  return result.output as AnyRecord;
}

function messagesFor(result: ReturnType<typeof normalize>): string {
  return result.ok ? "" : result.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
}

function withBlock(overrides: AnyRecord, output: AnyRecord = modelPropositionOutput()) {
  const blocks = structuredClone(output.blocks) as AnyRecord[];
  blocks[0] = { ...blocks[0], ...overrides };
  return { ...output, blocks };
}

/** The fixture plus a recipient quoted from the brief this file resolves against. */
function withBriefRecipient(overrides: AnyRecord = {}) {
  return { ...modelPropositionOutput({ recipient: briefRecipient() }), ...overrides };
}

describe("model output normalization", () => {
  it("N1(a) builds the domain leaf for every kind of evidence", () => {
    const output = proposition(normalize(withBlock({
      quantity: { value: 2, evidence: { kind: "answer", ref: "Q1" } },
      optional: { value: true, evidence: { kind: "brief", quote: "training workshop" } },
      reviewerComment: { value: "The catalog wording covers this.", evidence: { kind: "content", variationId: "2" } },
    }, withBriefRecipient())));

    expect(output.blocks[0].quantity).toEqual({ known: true, value: 2, source: "human", ref: { questionId: QUESTION_ID } });
    expect(output.blocks[0].optional).toEqual({ known: true, value: true, source: "brief", ref: { quote: "training workshop" } });
    expect(output.blocks[0].reviewerComment).toEqual({ known: true, value: "The catalog wording covers this.", source: "proposales_content", ref: { variationId: "2" } });
    expect(output.blocks[0].contentId).toEqual({ value: "1", source: "proposales_content", ref: { variationId: "1" } });
    expect(output.title).toEqual({ known: true, value: "Consulting and training proposal", source: "inferred" });
    expect(output.recipient.value.email).toEqual({
      known: true,
      value: "anna.berg@northwind.example",
      source: "brief",
      ref: { quote: "anna.berg@northwind.example" },
    });
  });

  it("N1(b) turns a null leaf into deliberate absence, and only a null leaf", () => {
    const output = proposition(normalize(withBlock({ quantity: null, optional: null, reviewerComment: null }, withBriefRecipient())));
    expect(output.blocks[0].quantity).toEqual({ known: false });
    expect(output.blocks[0].optional).toEqual({ known: false });
    // One absent detail on an otherwise known recipient, and the whole recipient absent, are
    // different facts and stay different.
    expect(output.recipient.value.phone).toEqual({ known: false });

    const withoutRecipient = proposition(normalize({ ...modelPropositionOutput(), recipient: null }));
    expect(withoutRecipient.recipient).toEqual({ known: false });
  });

  it("N1(c) produces output the unchanged domain validation accepts", () => {
    // The property this whole boundary exists for. `validateAgentOutput` is the check the model's
    // own output used to have to pass — every content ref against the retrieval record, every
    // human ref against an answered question — and it is applied here unchanged, to what the
    // adapter built. Nothing about it was relaxed to accommodate the new contract.
    const output = proposition(normalize(withBlock({
      quantity: { value: 2, evidence: { kind: "answer", ref: "Q1" } },
      optional: { value: true, evidence: { kind: "brief", quote: "training workshop" } },
    })));

    const validated = validateAgentOutput(output, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: false }),
      retrieval: extendRetrievalRecord(emptyRetrievalRecord(), RETRIEVED),
      answeredQuestionIds: [QUESTION_ID],
    });
    expect(validated).toEqual({ ok: true, output });

    // And it still rejects: the same call with the question unanswered fails on the human ref,
    // which is what proves the check is live rather than vacuous here.
    const withoutAnswer = validateAgentOutput(output, {
      schema: agentOutputSchemaFor({ mode: "prepare", allowClarification: false }),
      retrieval: extendRetrievalRecord(emptyRetrievalRecord(), RETRIEVED),
      answeredQuestionIds: [],
    });
    expect(withoutAnswer.ok).toBe(false);
  });

  it("N2(a) refuses an unknown answer alias rather than resolving the nearest one", () => {
    const result = normalize(withBlock({ quantity: { value: 2, evidence: { kind: "answer", ref: "Q9" } } }));
    expect(result.ok).toBe(false);
    expect(messagesFor(result)).toContain("Q9 names no answered question");
    expect(result.ok === false && result.issues[0].path).toEqual(["blocks", "0", "quantity"]);
  });

  it("N2(b) refuses a skipped question as human provenance", () => {
    const result = normalize(withBlock({ quantity: { value: 2, evidence: { kind: "answer", ref: "Q2" } } }));
    expect(messagesFor(result)).toContain("skipped");
  });

  it("N2(c) refuses a quote the brief does not contain", () => {
    const result = normalize(withBlock({ quantity: { value: 40000, evidence: { kind: "brief", quote: "budget of 40 000 EUR" } } }));
    expect(messagesFor(result)).toContain("does not appear");
  });

  it("N2(d) refuses a content identity no tool returned", () => {
    const unread = normalize(withBlock({ variationId: "999" }));
    expect(messagesFor(unread)).toContain("content 999 was not returned by any tool");

    const unreadReason = normalize(withBlock({
      reviewerComment: { value: "As described.", evidence: { kind: "content", variationId: "999" } },
    }));
    expect(messagesFor(unreadReason)).toContain("999");
  });

  it("N2(e) reports every unresolved selector at once, not just the first", () => {
    const result = normalize(withBlock({
      quantity: { value: 2, evidence: { kind: "answer", ref: "Q9" } },
      optional: { value: true, evidence: { kind: "brief", quote: "not in the brief at all" } },
    }));
    expect(result.ok === false && result.issues.map((issue) => issue.path.join("."))).toEqual([
      "blocks.0.quantity",
      "blocks.0.optional",
    ]);
  });

  it("N3(a) copies the current proposition's own provenance when a value is unchanged", () => {
    const current = validProposition() as Proposition;
    const built = evidenceRecord({
      currentProposition: current,
      retrieval: () => seedRetrievalRecord(current),
      questions: [],
      answers: [],
    });
    const output = proposition(normalize(
      {
        ...modelPropositionOutput(),
        blocks: [{
          variationId: current.blocks[0].contentId.value,
          selectedBy: { kind: "current" },
          quantity: { value: 2, evidence: { kind: "current" } },
          optional: null,
          reviewerComment: null,
          alternatives: [],
        }],
        recipient: {
          firstName: null,
          lastName: null,
          email: null,
          // A human value from an earlier turn keeps its original ref rather than being
          // re-attributed to this one.
          phone: { value: "+46123456789", evidence: { kind: "current" } },
          companyName: null,
        },
      },
      { mode: "revise", evidence: built },
    ));

    expect(output.blocks[0].quantity).toEqual({ known: true, value: 2, source: "brief" });
    expect(output.recipient.value.phone).toEqual({ known: true, value: "+46123456789", source: "human", ref: { editTurn: 1 } });
  });

  it("N3(b) refuses to call a changed value unchanged", () => {
    const current = validProposition() as Proposition;
    const built = evidenceRecord({ currentProposition: current, retrieval: () => seedRetrievalRecord(current), questions: [], answers: [] });
    const result = normalize(
      {
        ...modelPropositionOutput(),
        blocks: [{
          variationId: current.blocks[0].contentId.value,
          selectedBy: { kind: "current" },
          // The current proposition says 2. Citing it for 5 would launder a new number into the
          // human's provenance, which is the single most dangerous thing this module could do.
          quantity: { value: 5, evidence: { kind: "current" } },
          optional: null,
          reviewerComment: null,
          alternatives: [],
        }],
      },
      { mode: "revise", evidence: built },
    );
    expect(messagesFor(result)).toContain("the value differs from the one it holds");
  });

  it("N3(c) refuses current evidence when there is no proposition, or none at that path", () => {
    const noRevision = normalize(withBlock({ quantity: { value: 2, evidence: { kind: "current" } } }));
    expect(messagesFor(noRevision)).toContain("not revising one");

    const current = validProposition() as Proposition;
    const absent = { ...current, blocks: [{ ...current.blocks[0], quantity: { known: false as const } }] };
    const built = evidenceRecord({ currentProposition: absent as Proposition, retrieval: () => seedRetrievalRecord(absent as Proposition), questions: [], answers: [] });
    const result = normalize(
      {
        ...modelPropositionOutput(),
        blocks: [{
          variationId: current.blocks[0].contentId.value,
          selectedBy: { kind: "current" },
          quantity: { value: 2, evidence: { kind: "current" } },
          optional: null,
          reviewerComment: null,
          alternatives: [],
        }],
      },
      { mode: "revise", evidence: built },
    );
    expect(messagesFor(result)).toContain("deliberately absent");
  });

  it("N3(d) refuses current evidence for a block that moved", () => {
    // Resolution is path-aligned, and so is the domain validation that follows it. A block whose
    // position now holds different content cannot borrow that position's provenance.
    const current = propositionWithAlternatives() as Proposition;
    const built = evidenceRecord({ currentProposition: current, retrieval: () => seedRetrievalRecord(current), questions: [], answers: [] });
    const otherId = current.blocks[0].alternatives[0].variationId;
    const result = normalize(
      {
        ...modelPropositionOutput(),
        blocks: [{ variationId: otherId, selectedBy: { kind: "current" }, quantity: null, optional: null, reviewerComment: null, alternatives: [] }],
      },
      { mode: "revise", evidence: built },
    );
    expect(messagesFor(result)).toContain("holds different content");
  });

  it("N4(a) records a human-named block as human-sourced, still against what was retrieved", () => {
    const output = proposition(normalize(withBlock({ selectedBy: { kind: "answer", ref: "Q1" } })));
    expect(output.blocks[0].contentId).toEqual({ value: "1", source: "human", ref: { questionId: QUESTION_ID } });

    const invented = normalize(withBlock({ variationId: "999", selectedBy: { kind: "answer", ref: "Q1" } }));
    expect(messagesFor(invented)).toContain("was not returned by any tool");
  });

  it("N4(b) carries an instruction quote into the turn ref the domain checks", () => {
    const built = evidenceRecord({ instruction: { turnId: TURN_ID, text: "Add the workshop as optional" } });
    const output = proposition(normalize(
      withBlock({ optional: { value: true, evidence: { kind: "instruction", quote: "workshop as optional" } } }),
      { evidence: built },
    ));
    expect(output.blocks[0].optional).toEqual({
      known: true,
      value: true,
      source: "human",
      ref: { turnId: TURN_ID, quote: "workshop as optional" },
    });
  });

  it("N5 passes a clarification through untouched", () => {
    const clarification = { kind: "clarification", questions: [{ itemKey: "quantities", text: "How many seats?" }] };
    const result = normalizeModelOutput(
      modelOutputSchemaFor({ mode: "prepare", allowClarification: true }).parse(clarification) as ModelOutput,
      evidenceRecord(),
      { mode: "prepare", allowClarification: true },
    );
    expect(result.ok && result.output).toEqual(clarification);
  });
});
