import type { PropositionSource, Ref } from "../../schemas/shared";

/**
 * Reading a proposition leaf in the presentation layer.
 *
 * `schemas/shared.ts` builds absence-capable leaves through `sourcedOrAbsent()`, which ends in a
 * cast to `z.ZodTypeAny`. That erases the leaf's type, so on `Proposition` every leaf that may be
 * absent — `title`, `block.quantity`, `recipient.value.email`, … — infers as `unknown` even though
 * the runtime value is a closed union. Leaves that are always present keep their types.
 *
 * These two readers are the one place the presentation layer recovers the shape. They are not a
 * second schema: the value has already been parsed by `propositionSchema` on the server, and the
 * source and ref types below are imported from the schema module rather than restated, so a change
 * there is a compile error here. Nothing in this file validates; `readLeaf` only distinguishes the
 * two arms the schema admits and refuses anything else as a programming error (06 §3).
 */
export type SourcedLeaf<T> = { value: T; source: PropositionSource; ref?: Ref };
export type MaybeLeaf<T> = ({ known: true } & SourcedLeaf<T>) | { known: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Narrows an absence-capable leaf. The caller states the value type it expects; the schema already
 * guaranteed it, so this is a reading step, not a check.
 */
export function readLeaf<T>(leaf: unknown): MaybeLeaf<T> {
  if (!isRecord(leaf) || typeof leaf.known !== "boolean") {
    throw new TypeError("proposition leaf is neither present nor absent");
  }
  if (!leaf.known) return { known: false };
  return {
    known: true,
    value: leaf.value as T,
    source: leaf.source as PropositionSource,
    ...(leaf.ref === undefined ? {} : { ref: leaf.ref as Ref }),
  };
}

/**
 * Presents an always-present leaf (`block.title`, `commercialNote.text`, `warning.text`, …) in the
 * same shape, so one rendering path serves both kinds. Absence is impossible here by schema, and
 * saying so is what lets the caller stay uniform without inventing a `known: false` that could not
 * occur.
 */
export function sourcedToLeaf<T>(leaf: SourcedLeaf<T>): { known: true } & SourcedLeaf<T> {
  return { known: true, ...leaf };
}
