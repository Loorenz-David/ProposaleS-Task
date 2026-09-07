import "server-only";

import { comparePaths } from "@/lib/values/path";

import type { ApprovalDiff } from "../../schemas/approval";
import type { Proposition } from "../../schemas/proposition";

/**
 * Always different between two propositions and never a decision, so including them would drown
 * the record (§17A.10). Excluded at the top level only.
 */
const EXCLUDED_KEYS = ["version", "preparedAt"];

type AnyRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Recursive key sort, so two structurally equal values serialize identically (§17A.10). */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isPlainObject(value)) {
    const sorted: AnyRecord = {};
    for (const key of Object.keys(value).sort()) sorted[key] = canonicalize(value[key]);
    return sorted;
  }
  return value;
}

function equal(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

/**
 * Where the walk stops and an entry names the whole value. A sourced leaf is terminal because who
 * stands behind a value is the thing approval is about, so `source` and `ref` are compared as part
 * of it rather than as separate entries. An absent leaf is terminal because it has no interior —
 * which is what makes a `known` toggle one difference in both directions.
 *
 * `recipient` is deliberately not terminal: it carries no source of its own, so the walk descends
 * and reports the five identity leaves separately (§17A.4, granularity is the leaf).
 */
function isTerminal(value: unknown): boolean {
  if (!isPlainObject(value)) return !Array.isArray(value);
  return Object.prototype.hasOwnProperty.call(value, "source") || value.known === false;
}

function walk(path: string[], before: unknown, after: unknown, entries: ApprovalDiff): void {
  if (equal(before, after)) return;

  if (isTerminal(before) || isTerminal(after)) {
    entries.push({ path, before, after });
    return;
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    // Positional: `blocks` is ordered and its order reaches the vendor, so a reorder is a
    // difference at each moved index, never a set difference (§17A.10).
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index += 1) {
      walk([...path, String(index)], before[index], after[index], entries);
    }
    return;
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      walk([...path, key], before[key], after[key], entries);
    }
    return;
  }

  entries.push({ path, before, after });
}

/**
 * The prepared → approved record §11.3 requires. It is a log and review record, not a tamper
 * control: the caller supplies both sides, and nothing downstream may treat a small diff as
 * evidence of anything.
 */
export function computeApprovalDiff(prepared: Proposition, current: Proposition): ApprovalDiff {
  const entries: ApprovalDiff = [];
  const before = prepared as unknown as AnyRecord;
  const after = current as unknown as AnyRecord;

  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (EXCLUDED_KEYS.includes(key)) continue;
    walk([key], before[key], after[key], entries);
  }

  return entries.sort((left, right) => comparePaths(left.path, right.path));
}
