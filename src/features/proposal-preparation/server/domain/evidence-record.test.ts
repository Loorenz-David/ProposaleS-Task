import { describe, expect, it } from "vitest";

import { MAX_QUOTE_CHARS } from "../../schemas/shared";
import {
  buildEvidenceRecord,
  citableAliases,
  hasRetrievedIdentity,
  locateQuote,
  resolveAnswerAlias,
  resolveBriefQuote,
  resolveContentIdentity,
  resolveInstructionQuote,
  type EvidenceRecordInput,
} from "./evidence-record";
import { emptyRetrievalRecord, extendRetrievalRecord, type RetrievalRecord } from "./retrieval-record";

const BRIEF = "We need a proposal for Northwind AB covering consulting.\nSend it to Anna Berg.";
const TURN_ID = "00000000-0000-4000-8000-000000000001";
const QUESTION_ONE = "00000000-0000-4000-8000-000000000101";
const QUESTION_TWO = "00000000-0000-4000-8000-000000000102";

function questions() {
  return [
    { questionId: QUESTION_ONE, itemKey: "quantities" as const, text: "How many?" },
    { questionId: QUESTION_TWO, itemKey: "recipient_identity" as const, text: "Who receives it?" },
  ];
}

function evidenceRecord(overrides: Partial<EvidenceRecordInput> = {}) {
  return buildEvidenceRecord({
    brief: BRIEF,
    retrieval: () => emptyRetrievalRecord(),
    ...overrides,
  });
}

describe("evidence registry", () => {
  it("V1(a) numbers aliases by the order the questions were asked", () => {
    const built = evidenceRecord({
      questions: questions(),
      answers: [{ questionId: QUESTION_TWO, answer: { kind: "answer", text: "Anna Berg" } }],
    });
    expect(built.answers.get("Q1")?.questionId).toBe(QUESTION_ONE);
    expect(built.answers.get("Q2")?.questionId).toBe(QUESTION_TWO);
    // The alias is a property of the round, not of which questions happened to be answered.
    expect(citableAliases(built)).toEqual(["Q2"]);
  });

  it("V1(b) resolves an answered alias to its question id", () => {
    const built = evidenceRecord({
      questions: questions(),
      answers: [{ questionId: QUESTION_ONE, answer: { kind: "answer", text: "Two of each" } }],
    });
    expect(resolveAnswerAlias(built, "Q1")).toEqual({ ok: true, questionId: QUESTION_ONE });
  });

  it("V1(c) refuses an unknown alias and names what may be cited instead", () => {
    const built = evidenceRecord({
      questions: questions(),
      answers: [{ questionId: QUESTION_ONE, answer: { kind: "answer", text: "Two of each" } }],
    });
    const unknown = resolveAnswerAlias(built, "Q7");
    expect(unknown.ok).toBe(false);
    expect(unknown.ok === false && unknown.message).toContain("Q1");

    // There is no nearest match: an alias one away from a real one is still unknown.
    expect(resolveAnswerAlias(built, "Q3").ok).toBe(false);
    const none = resolveAnswerAlias(evidenceRecord(), "Q1");
    expect(none.ok === false && none.message).toContain("no clarification answers");
  });

  it("V1(e) distinguishes a question this turn simply did not answer", () => {
    // Not the same fact as a skip, and not the same as an unknown alias: the question was asked,
    // the human said nothing about it this turn, so it supports no value and the message says so.
    const built = evidenceRecord({ questions: questions(), answers: [] });
    const unanswered = resolveAnswerAlias(built, "Q1");
    expect(unanswered.ok).toBe(false);
    expect(unanswered.ok === false && unanswered.message).toContain("carries no answer for");
  });

  it("V1(d) refuses a skipped question, distinguishing it from an unknown one", () => {
    // A skip is the human declining to state a value. Citing it as human provenance would attribute
    // a value to someone who deliberately supplied none.
    const built = evidenceRecord({
      questions: questions(),
      answers: [{ questionId: QUESTION_ONE, answer: { kind: "skip" } }],
    });
    const skipped = resolveAnswerAlias(built, "Q1");
    expect(skipped.ok).toBe(false);
    expect(skipped.ok === false && skipped.message).toContain("skipped");
  });

  it("V2(a) resolves an exact brief quote and stores it unchanged", () => {
    expect(resolveBriefQuote(evidenceRecord(), "Northwind AB", MAX_QUOTE_CHARS)).toEqual({
      ok: true,
      source: "brief",
      ref: { quote: "Northwind AB" },
    });
  });

  it("V2(b) resolves a requoted passage to the brief's own wording", () => {
    // A model that re-wrapped a line or changed a capital still resolves, but what is stored is
    // the brief's substring: `validateAgentOutput` re-checks an instruction quote with `includes`,
    // so storing the model's paraphrase would fail validation later.
    const located = resolveBriefQuote(evidenceRecord(), "send it to anna berg", MAX_QUOTE_CHARS);
    expect(located).toEqual({ ok: true, source: "brief", ref: { quote: "Send it to Anna Berg" } });
    expect(BRIEF).toContain(located.ok ? located.ref!.quote! : "");
  });

  it("V2(c) refuses a quote the brief does not contain", () => {
    const invented = resolveBriefQuote(evidenceRecord(), "budget of 40 000 EUR", MAX_QUOTE_CHARS);
    expect(invented.ok).toBe(false);
    expect(invented.ok === false && invented.message).toContain("does not appear");
  });

  it("V2(d) spans a line break, because the collapse is over whitespace", () => {
    expect(locateQuote(BRIEF, "consulting. Send it", MAX_QUOTE_CHARS)).toEqual({
      ok: true,
      quote: "consulting.\nSend it",
    });
  });

  it("V2(e) refuses a located span longer than the ref may carry", () => {
    const text = `start${" ".repeat(40)}end`;
    expect(locateQuote(text, "start end", 20)).toEqual({
      ok: false,
      message: "the quote is longer than 20 characters in the text it cites; quote a shorter passage",
    });
  });

  it("V3(a) resolves an instruction quote to the turn that carried it", () => {
    const built = evidenceRecord({ instruction: { turnId: TURN_ID, text: "Make the workshop optional please" } });
    expect(resolveInstructionQuote(built, "workshop optional", MAX_QUOTE_CHARS)).toEqual({
      ok: true,
      source: "human",
      ref: { turnId: TURN_ID, quote: "workshop optional" },
    });
  });

  it("V3(b) refuses instruction evidence on a turn that has no instruction", () => {
    const absent = resolveInstructionQuote(evidenceRecord(), "anything", MAX_QUOTE_CHARS);
    expect(absent.ok).toBe(false);
    expect(absent.ok === false && absent.message).toContain("this turn has none");

    const built = evidenceRecord({ instruction: { turnId: TURN_ID, text: "Make it optional" } });
    expect(resolveInstructionQuote(built, "make it cheaper", MAX_QUOTE_CHARS).ok).toBe(false);
  });

  it("V4 resolves a catalog identity only after a tool has returned it", () => {
    let record: RetrievalRecord = emptyRetrievalRecord();
    const built = evidenceRecord({ retrieval: () => record });

    expect(resolveContentIdentity(built, "1").ok).toBe(false);
    expect(hasRetrievedIdentity(built, "1")).toBe(false);

    // Read at resolution time, so an identity a later tool step returned still resolves.
    record = extendRetrievalRecord(record, [{ variationId: "1", productId: "500101", title: "Consulting" }]);
    expect(resolveContentIdentity(built, "1")).toEqual({
      ok: true,
      source: "proposales_content",
      ref: { variationId: "1" },
    });
    expect(resolveContentIdentity(built, "2").ok).toBe(false);
  });
});
