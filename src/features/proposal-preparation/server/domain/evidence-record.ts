import "server-only";

import type { ClarificationQuestion } from "../../schemas/clarification";
import type { Proposition } from "../../schemas/proposition";
import type { Ref } from "../../schemas/shared";
import { hasRetrieved, type RetrievalRecord } from "./retrieval-record";

/**
 * The authoritative state a model's evidence selector may point at, and the only thing that can
 * turn one into provenance.
 *
 * Everything here is built from state the application already holds and trusts: the brief it was
 * given, the questions it asked and the answers it received this turn, the instruction the human
 * just typed, the proposition under revision, and the catalog identities the read tools actually
 * returned. A selector resolves only if it names one of those. There is no nearest match and no
 * fallback: an alias that is unknown, a quote that is not in the text, an identity that was never
 * retrieved, and a question the human skipped all fail, and failing sends the model a correction
 * naming what it may cite instead.
 *
 * The record is request-local. Aliases never persist, never reach the browser, and never appear
 * in a stored proposition — what survives resolution is the domain's own `source` and `ref`.
 */
export type EvidenceRecord = {
  brief: string;
  /** `Q1`-style alias to the question it names, in the order the questions were asked. */
  answers: ReadonlyMap<string, AnswerEntry>;
  instruction?: { turnId: string; text: string };
  currentProposition?: Proposition;
  /** Read at resolution time: an identity retrieved on a later step still resolves. */
  retrieval: () => RetrievalRecord;
};

export type AnswerEntry = {
  alias: string;
  questionId: string;
  itemKey: string;
  /**
   * What this turn actually carries for the question. Only `answered` is citable, but the other
   * two are recorded rather than left out so that citing them fails with the reason: a question the
   * human deliberately skipped states no value, and one this turn carries no answer for is a
   * different fact again. Both are distinct from an alias that names nothing at all.
   */
  state: "answered" | "skipped" | "unanswered";
};

export type EvidenceResolution =
  | { ok: true; source: "brief" | "human" | "proposales_content" | "inferred"; ref?: Ref }
  | { ok: false; message: string };

export type EvidenceRecordInput = {
  brief: string;
  questions?: ReadonlyArray<ClarificationQuestion>;
  answers?: ReadonlyArray<{ questionId: string; answer: { kind: "answer"; text: string } | { kind: "skip" } }>;
  instruction?: { turnId: string; text: string };
  currentProposition?: Proposition;
  retrieval: () => RetrievalRecord;
};

export function buildEvidenceRecord(input: EvidenceRecordInput): EvidenceRecord {
  const byQuestion = new Map((input.answers ?? []).map((entry) => [entry.questionId, entry.answer.kind]));
  const answers = new Map<string, AnswerEntry>();
  (input.questions ?? []).forEach((question, index) => {
    const alias = `Q${index + 1}`;
    const supplied = byQuestion.get(question.questionId);
    answers.set(alias, {
      alias,
      questionId: question.questionId,
      itemKey: question.itemKey,
      state: supplied === "answer" ? "answered" : supplied === "skip" ? "skipped" : "unanswered",
    });
  });

  return {
    brief: input.brief,
    answers,
    ...(input.instruction === undefined ? {} : { instruction: input.instruction }),
    ...(input.currentProposition === undefined ? {} : { currentProposition: input.currentProposition }),
    retrieval: input.retrieval,
  };
}

/** The alias the model must use to cite a question, or `undefined` if it is not in this round. */
export function aliasFor(evidence: EvidenceRecord, questionId: string): string | undefined {
  for (const entry of evidence.answers.values()) {
    if (entry.questionId === questionId) return entry.alias;
  }
  return undefined;
}

/** The aliases a correction message may offer, so the model is told what it *can* cite. */
export function citableAliases(evidence: EvidenceRecord): string[] {
  return [...evidence.answers.values()].filter((entry) => entry.state === "answered").map((entry) => entry.alias);
}

function collapse(text: string): string {
  return text.normalize("NFC").replace(/\s+/gu, " ").trim().toLowerCase();
}

/**
 * Finds the model's quote in the text it claims to be quoting, and returns the text's own wording
 * for it.
 *
 * An exact hit is the common case and is returned unchanged. Otherwise the search is repeated over
 * a whitespace-collapsed, case-folded copy that maps every normalized position back to the
 * original, so a model that re-wrapped a line or changed a capital still resolves — and what gets
 * stored as the ref is the source's substring, never the model's paraphrase of it. That matters
 * beyond tidiness: `validateAgentOutput` re-checks an instruction quote with a plain `includes`,
 * so a stored quote that is not literally present would fail validation later.
 */
export function locateQuote(text: string, quote: string, maxChars: number): { ok: true; quote: string } | { ok: false; message: string } {
  if (text.includes(quote)) return { ok: true, quote };

  const normalizedQuote = collapse(quote);
  if (normalizedQuote.length === 0) return { ok: false, message: "the quote is empty" };

  const normalized: string[] = [];
  const originalIndex: number[] = [];
  let pendingSpace = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index].normalize("NFC");
    if (/\s/u.test(character)) {
      pendingSpace = normalized.length > 0;
      continue;
    }
    if (pendingSpace) {
      normalized.push(" ");
      originalIndex.push(index);
      pendingSpace = false;
    }
    normalized.push(character.toLowerCase());
    originalIndex.push(index);
  }

  const found = normalized.join("").indexOf(normalizedQuote);
  if (found === -1) return { ok: false, message: "the quote does not appear in the text it cites" };

  const start = originalIndex[found];
  const lastNormalized = found + normalizedQuote.length - 1;
  const end = originalIndex[lastNormalized] + 1;
  const located = text.slice(start, end);
  if (located.trim().length === 0) return { ok: false, message: "the quote does not appear in the text it cites" };
  if (located.length > maxChars) {
    return { ok: false, message: `the quote is longer than ${maxChars} characters in the text it cites; quote a shorter passage` };
  }
  return { ok: true, quote: located };
}

export function hasRetrievedIdentity(evidence: EvidenceRecord, variationId: string): boolean {
  return hasRetrieved(evidence.retrieval(), variationId);
}

/** Resolves an answer alias to the question it names, or explains why it cannot. */
export function resolveAnswerAlias(evidence: EvidenceRecord, alias: string): { ok: true; questionId: string } | { ok: false; message: string } {
  const entry = evidence.answers.get(alias);
  if (entry === undefined) {
    const citable = citableAliases(evidence);
    return {
      ok: false,
      message: citable.length === 0
        ? `evidence ${alias} names no answered question: this turn has no clarification answers to cite`
        : `evidence ${alias} names no answered question: this turn answered ${citable.join(", ")}`,
    };
  }
  if (entry.state === "skipped") {
    return { ok: false, message: `evidence ${alias} names a question the human skipped, so it states no value` };
  }
  if (entry.state === "unanswered") {
    return { ok: false, message: `evidence ${alias} names a question this turn carries no answer for` };
  }
  return { ok: true, questionId: entry.questionId };
}

export function resolveInstructionQuote(evidence: EvidenceRecord, quote: string, maxChars: number): EvidenceResolution {
  if (evidence.instruction === undefined) {
    return { ok: false, message: "evidence cites the current instruction, but this turn has none" };
  }
  const located = locateQuote(evidence.instruction.text, quote, maxChars);
  if (!located.ok) return { ok: false, message: `evidence cites the current instruction, but ${located.message}` };
  return { ok: true, source: "human", ref: { turnId: evidence.instruction.turnId, quote: located.quote } };
}

export function resolveBriefQuote(evidence: EvidenceRecord, quote: string, maxChars: number): EvidenceResolution {
  const located = locateQuote(evidence.brief, quote, maxChars);
  if (!located.ok) return { ok: false, message: `evidence cites the brief, but ${located.message}` };
  return { ok: true, source: "brief", ref: { quote: located.quote } };
}

/** Resolves a `{ kind: "content" }` selector: the identity must have been read this run. */
export function resolveContentIdentity(evidence: EvidenceRecord, variationId: string): EvidenceResolution {
  if (!hasRetrievedIdentity(evidence, variationId)) {
    return { ok: false, message: `evidence cites catalog content ${variationId}, which no tool returned in this run` };
  }
  return { ok: true, source: "proposales_content", ref: { variationId } };
}
