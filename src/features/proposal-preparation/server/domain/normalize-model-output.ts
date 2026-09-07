import "server-only";

import type { RunIssue } from "@/lib/agent/types";

import { agentOutputSchemaFor, type AgentMode, type AgentOutput } from "../../schemas/agent-output";
import type {
  ConsequentialEvidence,
  ContentSelectionEvidence,
  ModelOutput,
  ModelProposition,
  PresentationalEvidence,
} from "../../schemas/model-output";
import { MAX_QUOTE_CHARS, type Ref } from "../../schemas/shared";
import {
  hasRetrievedIdentity,
  resolveAnswerAlias,
  resolveBriefQuote,
  resolveContentIdentity,
  resolveInstructionQuote,
  type EvidenceRecord,
} from "./evidence-record";

/**
 * Turns what the model wrote into the domain's own proposition shape.
 *
 * The division of labour is the point of this module. The model supplied a value and named the
 * evidence for it; this code decides what that evidence *means* — which `source` the leaf carries,
 * which `ref` identifies it, whether the value is known at all — by resolving the selector against
 * state the application already holds. It resolves, copies, verifies and rejects. It never infers:
 * there is no path here from a bare value to a provenance, so "the model returned 24" cannot
 * become "the human said 24" unless the human demonstrably did.
 *
 * Everything it produces is then validated by the unchanged contracts — `agentOutputSchemaFor`
 * here as a post-condition, then `validateAgentOutput` and `assembleProposition` in the service —
 * so this module is a translator inside the trust boundary, never a replacement for it.
 */

type Sourced = { source: string; ref?: Ref };
type AnyRecord = Record<string, unknown>;

/** Placeholder provenance for a leaf whose evidence did not resolve; no schema admits it. */
const UNRESOLVED = { source: "unresolved" } as const;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Structural equality, so a money leaf does not compare unequal over key order alone. */
function sameValue(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((entry, index) => sameValue(entry, right[index]));
  }
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length
      && leftKeys.every((key, index) => key === rightKeys[index])
      && leftKeys.every((key) => sameValue(left[key], right[key]));
  }
  return false;
}

function valueAtPath(value: unknown, path: readonly string[]): unknown {
  let cursor = value;
  for (const segment of path) {
    if (Array.isArray(cursor)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= cursor.length) return undefined;
      cursor = cursor[index];
      continue;
    }
    if (!isRecord(cursor) || !(segment in cursor)) return undefined;
    cursor = cursor[segment];
  }
  return cursor;
}

function withRef(source: string, ref?: Ref): Sourced {
  return ref === undefined ? { source } : { source, ref };
}

export type NormalizeResult =
  | { ok: true; output: AgentOutput }
  | { ok: false; issues: RunIssue[] };

export function normalizeModelOutput(
  output: ModelOutput,
  evidenceRecord: EvidenceRecord,
  ctx: { mode: AgentMode; allowClarification: boolean },
): NormalizeResult {
  const issues: RunIssue[] = [];
  const seen = new Set<string>();
  const addIssue = (path: string[], message: string): null => {
    const key = JSON.stringify([path, message]);
    if (!seen.has(key)) {
      seen.add(key);
      issues.push({ path, message });
    }
    return null;
  };

  /**
   * Copies the leaf the proposition under revision already carries at this path, once the model's
   * value is shown to be the same one. The copy keeps the original `source` and `ref`, so a value
   * the human supplied three turns ago stays human-sourced with its original question id rather
   * than being re-attributed to this turn.
   */
  const copyCurrent = (
    dtoPath: string[],
    domainPath: string[],
    value: unknown,
    kind: "consequential" | "presentational",
  ): Sourced | null => {
    const current = evidenceRecord.currentProposition;
    if (current === undefined) {
      return addIssue(dtoPath, "evidence cites the current proposition, but this turn is not revising one");
    }
    const leaf = valueAtPath(current, domainPath);
    if (!isRecord(leaf)) {
      return addIssue(dtoPath, "evidence cites the current proposition, which carries no value at this path");
    }
    if (leaf.known === false) {
      return addIssue(dtoPath, "evidence cites the current proposition, where this value is deliberately absent");
    }
    if (typeof leaf.source !== "string") {
      return addIssue(dtoPath, "evidence cites the current proposition, which carries no provenance at this path");
    }
    if (!sameValue(leaf.value, value)) {
      return addIssue(dtoPath, "evidence cites the current proposition, but the value differs from the one it holds; cite the evidence for the new value instead");
    }
    if (kind === "consequential" && leaf.source === "inferred") {
      return addIssue(dtoPath, "evidence cites an inferred value, which cannot support a consequential field");
    }
    return withRef(leaf.source, leaf.ref as Ref | undefined);
  };

  const resolveConsequential = (
    evidence: ConsequentialEvidence,
    value: unknown,
    dtoPath: string[],
    domainPath: string[],
  ): Sourced | null => {
    if (evidence.kind === "brief") {
      const resolved = resolveBriefQuote(evidenceRecord, evidence.quote, MAX_QUOTE_CHARS);
      return resolved.ok ? withRef(resolved.source, resolved.ref) : addIssue(dtoPath, resolved.message);
    }
    if (evidence.kind === "answer") {
      const resolved = resolveAnswerAlias(evidenceRecord, evidence.ref);
      return resolved.ok ? withRef("human", { questionId: resolved.questionId }) : addIssue(dtoPath, resolved.message);
    }
    if (evidence.kind === "instruction") {
      const resolved = resolveInstructionQuote(evidenceRecord, evidence.quote, MAX_QUOTE_CHARS);
      return resolved.ok ? withRef(resolved.source, resolved.ref) : addIssue(dtoPath, resolved.message);
    }
    return copyCurrent(dtoPath, domainPath, value, "consequential");
  };

  const resolvePresentational = (
    evidence: PresentationalEvidence,
    value: unknown,
    dtoPath: string[],
    domainPath: string[],
  ): Sourced | null => {
    if (evidence.kind === "inferred") return { source: "inferred" };
    if (evidence.kind === "content") {
      const resolved = resolveContentIdentity(evidenceRecord, evidence.variationId);
      return resolved.ok ? withRef(resolved.source, resolved.ref) : addIssue(dtoPath, resolved.message);
    }
    if (evidence.kind === "current") return copyCurrent(dtoPath, domainPath, value, "presentational");
    return resolveConsequential(evidence, value, dtoPath, domainPath);
  };

  type Leaf<E> = { value: unknown; evidence: E } | null;

  /** A leaf that may be deliberately absent becomes the domain's `known` discriminator. */
  const absentable = <E>(
    leaf: Leaf<E>,
    dtoPath: string[],
    domainPath: string[],
    resolve: (evidence: E, value: unknown, dtoPath: string[], domainPath: string[]) => Sourced | null,
  ): unknown => {
    if (leaf === null) return { known: false };
    const sourced = resolve(leaf.evidence, leaf.value, dtoPath, domainPath);
    // Unresolved is not the same fact as absent, and must never be recorded as one: a value the
    // model stated but could not support is an error to report, not a field the human left blank.
    return { known: true, value: leaf.value, ...(sourced ?? UNRESOLVED) };
  };

  /**
   * A leaf the domain always requires. When resolution fails the leaf still has to be *some*
   * object for the walk to finish collecting the rest of the issues, so it is filled with a source
   * no schema admits. Nothing downstream ever sees it — the issue list short-circuits before the
   * post-condition — and if that guard were ever removed the parse would reject this loudly rather
   * than accept a fabricated `inferred`, which is the failure mode worth being noisy about.
   */
  const required = <E>(
    leaf: { value: unknown; evidence: E },
    dtoPath: string[],
    domainPath: string[],
    resolve: (evidence: E, value: unknown, dtoPath: string[], domainPath: string[]) => Sourced | null,
  ): unknown => {
    const sourced = resolve(leaf.evidence, leaf.value, dtoPath, domainPath);
    return { value: leaf.value, ...(sourced ?? UNRESOLVED) };
  };

  if (output.kind === "clarification") {
    return { ok: true, output: output as AgentOutput };
  }

  const proposition = output as ModelProposition;

  /**
   * A block's content id. Whatever named it, the identity itself must be one this run actually
   * read: a model may not introduce a catalog item it was never shown, and a human who names one
   * does not make it exist either.
   */
  function resolveSelection(evidence: ContentSelectionEvidence, variationId: string, index: number): Sourced | null {
    const dtoPath = ["blocks", String(index), "variationId"];
    if (!hasRetrievedIdentity(evidenceRecord, variationId)) {
      return addIssue(dtoPath, `content ${variationId} was not returned by any tool in this run; search for it or use one that was`);
    }
    if (evidence.kind === "catalog") {
      return { source: "proposales_content", ref: { variationId } };
    }
    if (evidence.kind === "current") {
      const current = evidenceRecord.currentProposition;
      const block = current?.blocks[index];
      if (block === undefined) {
        return addIssue(dtoPath, "evidence cites the current proposition, which has no block at this position");
      }
      if (block.contentId.value !== variationId) {
        return addIssue(dtoPath, "evidence cites the current proposition, whose block at this position holds different content; cite the evidence for this selection instead");
      }
      return withRef(block.contentId.source, block.contentId.ref as Ref | undefined);
    }
    if (evidence.kind === "answer") {
      const resolved = resolveAnswerAlias(evidenceRecord, evidence.ref);
      return resolved.ok
        ? { source: "human", ref: { questionId: resolved.questionId } }
        : addIssue(dtoPath, resolved.message);
    }
    const resolved = resolveInstructionQuote(evidenceRecord, evidence.quote, MAX_QUOTE_CHARS);
    return resolved.ok
      ? { source: "human", ref: resolved.ref }
      : addIssue(dtoPath, resolved.message);
  }

  const blocks = proposition.blocks.map((block, index) => {
    const dtoPath = ["blocks", String(index)];
    const domainPath = ["blocks", String(index)];

    const selection = resolveSelection(block.selectedBy, block.variationId, index);
    const alternatives = block.alternatives.map((alternative, alternativeIndex) => ({
      variationId: alternative.variationId,
      reason: required(
        alternative.reason,
        [...dtoPath, "alternatives", String(alternativeIndex), "reason"],
        [...domainPath, "alternatives", String(alternativeIndex), "reason"],
        resolvePresentational,
      ),
    }));

    return {
      contentId: { value: block.variationId, ...(selection ?? UNRESOLVED) },
      quantity: absentable(block.quantity, [...dtoPath, "quantity"], [...domainPath, "quantity"], resolveConsequential),
      optional: absentable(block.optional, [...dtoPath, "optional"], [...domainPath, "optional"], resolveConsequential),
      reviewerComment: absentable(block.reviewerComment, [...dtoPath, "reviewerComment"], [...domainPath, "reviewerComment"], resolvePresentational),
      alternatives,
    };
  });

  const recipient = proposition.recipient === null
    ? { known: false }
    : {
        known: true,
        value: Object.fromEntries((["firstName", "lastName", "email", "phone", "companyName"] as const).map((field) => [
          field,
          absentable(
            proposition.recipient![field],
            ["recipient", field],
            ["recipient", "value", field],
            resolveConsequential,
          ),
        ])),
      };

  const commercialNotes = proposition.commercialNotes.map((note, index) => {
    const dtoPath = ["commercialNotes", String(index)];
    return {
      text: required(note.text, [...dtoPath, "text"], [...dtoPath, "text"], resolvePresentational),
      amount: absentable(note.amount, [...dtoPath, "amount"], [...dtoPath, "amount"], resolveConsequential),
      currency: absentable(note.currency, [...dtoPath, "currency"], [...dtoPath, "currency"], resolveConsequential),
      taxBasis: required(note.taxBasis, [...dtoPath, "taxBasis"], [...dtoPath, "taxBasis"], resolveConsequential),
    };
  });

  const commercialAssumptions = proposition.commercialAssumptions.map((assumption, index) => {
    const path = ["commercialAssumptions", String(index), "statedValue"];
    return assumption.kind === "other"
      ? { kind: assumption.kind, statedValue: required(assumption.statedValue, path, path, resolvePresentational) }
      : { kind: assumption.kind, statedValue: required(assumption.statedValue, path, path, resolveConsequential) };
  });

  const assumptions = proposition.assumptions.map((assumption, index) => ({
    path: assumption.path,
    note: required(assumption.note, ["assumptions", String(index), "note"], ["assumptions", String(index), "note"], resolvePresentational),
  }));

  const warnings = proposition.warnings.map((warning, index) => ({
    kind: warning.kind,
    text: required(warning.text, ["warnings", String(index), "text"], ["warnings", String(index), "text"], resolvePresentational),
    ...(warning.path === null ? {} : { path: warning.path }),
    ...(warning.reason === null ? {} : { reason: warning.reason }),
  }));

  const candidate = {
    kind: "proposition" as const,
    language: absentable(proposition.language, ["language"], ["language"], resolvePresentational),
    title: absentable(proposition.title, ["title"], ["title"], resolvePresentational),
    descriptionNarrative: absentable(proposition.descriptionNarrative, ["descriptionNarrative"], ["descriptionNarrative"], resolvePresentational),
    agentRationale: absentable(proposition.agentRationale, ["agentRationale"], ["agentRationale"], resolvePresentational),
    recipient,
    blocks,
    commercialNotes,
    commercialAssumptions,
    assumptions,
    warnings,
    requestedOverrides: proposition.requestedOverrides,
  };

  if (issues.length > 0) return { ok: false, issues };

  // The post-condition. Every leaf above was built to the domain's own shape, so a failure here is
  // this module disagreeing with the contract it targets rather than the model misbehaving; it is
  // reported as an issue rather than thrown so a turn degrades into a correction, and the
  // colocated tests assert it never fires for a well-formed model output.
  const parsed = agentOutputSchemaFor({ mode: ctx.mode, allowClarification: ctx.allowClarification }).safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.map(String),
        message: issue.message,
      })),
    };
  }
  return { ok: true, output: parsed.data };
}
