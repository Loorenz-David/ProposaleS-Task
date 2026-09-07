import { z } from "zod";

export const pathSchema = z.array(z.string().min(1));
export type Path = z.infer<typeof pathSchema>;

/**
 * Orders two path segments. Decimal index segments compare numerically, so `blocks.10` follows
 * `blocks.9` rather than preceding it.
 */
export function compareSegments(left: string, right: string): number {
  const leftIndex = /^\d+$/.test(left);
  const rightIndex = /^\d+$/.test(right);
  if (leftIndex && rightIndex) return Number(left) - Number(right);
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * A total order over paths: segment-wise, then by length. Shared by the provenance projection and
 * the approval diff so "sorted by path" means one thing in this repository.
 */
export function comparePaths(left: readonly string[], right: readonly string[]): number {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const comparison = compareSegments(left[index], right[index]);
    if (comparison !== 0) return comparison;
  }
  return left.length - right.length;
}
