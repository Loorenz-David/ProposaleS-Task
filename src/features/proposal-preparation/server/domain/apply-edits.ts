import "server-only";

import { ValidationError, type ErrorIssue } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";

import type { AddBlockCandidate, EditOperation } from "../../schemas/edits";
import { propositionSchema, type Proposition } from "../../schemas/proposition";

type AnyRecord = Record<string, any>;

const RECIPIENT_LEAF_KEYS = ["firstName", "lastName", "email", "phone", "companyName"] as const;

function domainRule(path: string[], message: string): never {
  throw new ValidationError({ reason: "domain_rule", issues: [{ path, message }] });
}

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * An absent recipient has no interior, so a human setting one of its leaves is also asserting the
 * recipient exists. Materializing it here keeps `set_leaf` a single operation rather than making
 * the caller send two.
 */
function materializeRecipient(proposition: AnyRecord, path: ReadonlyArray<string>): void {
  if (path[0] !== "recipient" || path[1] !== "value" || proposition.recipient.known === true) return;
  proposition.recipient = {
    known: true,
    value: Object.fromEntries(RECIPIENT_LEAF_KEYS.map((key) => [key, { known: false }])),
  };
}

function resolveParent(proposition: AnyRecord, path: ReadonlyArray<string>): AnyRecord {
  let cursor: unknown = proposition;
  for (const segment of path.slice(0, -1)) {
    if (!isRecord(cursor) && !Array.isArray(cursor)) domainRule([...path], "no such field");
    cursor = (cursor as AnyRecord)[segment];
  }
  if (!isRecord(cursor) && !Array.isArray(cursor)) domainRule([...path], "no such field");
  return cursor as AnyRecord;
}

/**
 * Writes a human value in the shape the leaf already has. A leaf that can be absent carries
 * `known`; a leaf that is always present does not. Reading the current shape rather than keeping a
 * list of which is which means the two cannot fall out of step with the schema.
 */
function humanLeaf(current: unknown, value: unknown, editTurn: number): AnyRecord {
  const sourced = { value, source: "human", ref: { editTurn } };
  return isRecord(current) && Object.prototype.hasOwnProperty.call(current, "known")
    ? { known: true, ...sourced }
    : sourced;
}

function blockFromCandidate(candidate: AddBlockCandidate, quantity: number | undefined, optional: boolean | undefined, editTurn: number): AnyRecord {
  const catalogRef = { variationId: candidate.variationId };
  return {
    // The human chose the identity, so the choice is theirs; the id itself still names a content
    // item a read tool returned (§17A.4).
    contentId: { value: candidate.variationId, source: "human", ref: { variationId: candidate.variationId, editTurn } },
    productId: candidate.productId,
    title: { value: candidate.title, source: "proposales_content", ref: catalogRef },
    description: candidate.description === undefined
      ? { known: false }
      : { known: true, value: candidate.description, source: "proposales_content", ref: catalogRef },
    quantity: quantity === undefined ? { known: false } : { known: true, value: quantity, source: "human", ref: { editTurn } },
    optional: optional === undefined ? { known: false } : { known: true, value: optional, source: "human", ref: { editTurn } },
    reviewerComment: { known: false },
    pricing: "library",
    alternatives: [],
  };
}

/**
 * Applies the closed set of human edits. Every write produces a `human`-sourced leaf, and the
 * result is re-parsed by `propositionSchema`, so a domain rule violation — a non-positive
 * quantity, an over-cap title, a human value on a catalog-verbatim leaf — is refused with its path
 * rather than silently corrected (§17A.9, §11.2).
 *
 * Pure: the input proposition is never mutated.
 */
export function applyEdits(current: Proposition, edits: ReadonlyArray<EditOperation>, editTurn: number): Proposition {
  const draft = structuredClone(current) as AnyRecord;

  edits.forEach((edit, index) => {
    switch (edit.op) {
      case "set_leaf": {
        if (edit.path.length === 0) domainRule(["edits", String(index), "path"], "path must name a field");
        materializeRecipient(draft, edit.path);
        const parent = resolveParent(draft, edit.path);
        const key = edit.path[edit.path.length - 1];
        if (!Object.prototype.hasOwnProperty.call(parent, key)) domainRule([...edit.path], "no such field");
        parent[key] = humanLeaf(parent[key], edit.value, editTurn);
        break;
      }
      case "remove_block": {
        if (edit.index >= draft.blocks.length) domainRule(["edits", String(index), "index"], "no block at that index");
        draft.blocks.splice(edit.index, 1);
        break;
      }
      case "add_block": {
        draft.blocks.push(blockFromCandidate(edit.candidate, edit.quantity, edit.optional, editTurn));
        break;
      }
      case "unset_recipient": {
        draft.recipient = { known: false };
        break;
      }
      case "confirm_empty_draft": {
        // The confirmation is what makes an empty draft approvable; confirming one that has blocks
        // states something untrue about the offer (§17A.6).
        if (draft.blocks.length > 0) domainRule(["edits", String(index)], "the proposition has blocks, so it is not an empty draft");
        draft.emptyDraftConfirmation = { known: true, value: true, source: "human", ref: { editTurn } };
        break;
      }
    }
  });

  const parsed = propositionSchema.safeParse(draft);
  if (!parsed.success) {
    const issues: ErrorIssue[] = zodIssues(parsed.error);
    throw new ValidationError({ reason: "domain_rule", issues });
  }
  return parsed.data;
}
