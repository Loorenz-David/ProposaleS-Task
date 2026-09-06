import "server-only";

import type { MatchStrength } from "../../schemas/content-candidate";

export const SCORE_MAX = 1000;
export const T_STRONG = 700;
export const T_POSSIBLE = 400;
export const T_FLOOR = 150;

export function strengthForScore(score: number): MatchStrength | null {
  if (!Number.isInteger(score) || score < 0 || score > SCORE_MAX) {
    throw new RangeError(`score must be an integer in [0, ${SCORE_MAX}]`);
  }
  if (score >= T_STRONG) return "strong";
  if (score >= T_POSSIBLE) return "possible";
  if (score >= T_FLOOR) return "weak";
  return null;
}
