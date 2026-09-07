import "server-only";

import type { ContentItem } from "@/lib/proposales";

import type { ContentCandidate, ContentDetail, MatchStrength } from "../../schemas/content-candidate";
import { SCORE_MAX, strengthForScore } from "./strength";

// Score is a match-strength ratio over an integer 0-1000 scale, not a money value:
// invariant 17's "no arithmetic on money" rule does not govern this file.

export const MAX_CANDIDATES = 10;
export const MAX_CANDIDATE_DESCRIPTION_CHARS = 280;

const TOKEN_PATTERN = /[\p{L}\p{N}]+/gu;
const MIN_TOKEN_LENGTH = 2;

export function tokenize(text: string): string[] {
  const normalized = text.normalize("NFC").toLowerCase();
  const matches = normalized.match(TOKEN_PATTERN) ?? [];
  return matches.filter((token) => token.length >= MIN_TOKEN_LENGTH);
}

export function scoreItem(query: string, item: ContentItem, language: string): number {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;

  const titleTokens = new Set(tokenize(item.title[language] ?? ""));
  const descriptionTokens = new Set(tokenize(item.description[language] ?? ""));

  let weightSum = 0;
  for (const token of queryTokens) {
    if (titleTokens.has(token)) weightSum += 3;
    else if (descriptionTokens.has(token)) weightSum += 1;
  }

  return Math.round((SCORE_MAX * weightSum) / (3 * queryTokens.size));
}

export function catalogLanguages(catalog: ContentItem[]): string[] {
  const languages = new Set<string>();
  for (const item of catalog) {
    for (const [language, value] of Object.entries(item.title)) {
      if (value.trim().length > 0) languages.add(language);
    }
  }
  return [...languages].sort();
}

function compareVariationIds(a: string, b: string): number {
  const numericA = Number(a);
  const numericB = Number(b);
  if (Number.isFinite(numericA) && Number.isFinite(numericB)) return numericA - numericB;
  return a < b ? -1 : a > b ? 1 : 0;
}

const STRENGTH_RANK: Record<MatchStrength, number> = { weak: 0, possible: 1, strong: 2 };

type ScoredEntry = { item: ContentItem; detail: ContentDetail; score: number; strength: MatchStrength };

export function toContentDetail(item: ContentItem | undefined, language: string): ContentDetail | null {
  if (item === undefined) return null;
  const title = item.title[language];
  if (title === undefined || title.trim().length === 0) return null;
  const rawDescription = item.description[language] ?? "";
  const truncated = rawDescription.length > MAX_CANDIDATE_DESCRIPTION_CHARS;
  return {
    variationId: item.variationId,
    productId: item.productId,
    title,
    description: truncated ? rawDescription.slice(0, MAX_CANDIDATE_DESCRIPTION_CHARS) : rawDescription,
    truncated,
  };
}

export function rankCandidates(query: string, catalog: ContentItem[], language: string): ContentCandidate[] {
  const scored: ScoredEntry[] = [];

  for (const item of catalog) {
    const detail = toContentDetail(item, language);
    if (detail === null) continue;
    const score = scoreItem(query, item, language);
    const strength = strengthForScore(score);
    if (strength === null) continue;
    scored.push({ item, detail, score, strength });
  }

  scored.sort((a, b) => {
    if (a.strength !== b.strength) return STRENGTH_RANK[b.strength] - STRENGTH_RANK[a.strength];
    if (a.score !== b.score) return b.score - a.score;
    return compareVariationIds(a.item.variationId, b.item.variationId);
  });

  const queryTokensInOrder = [...new Set(tokenize(query))];

  return scored.slice(0, MAX_CANDIDATES).map(({ item, detail, score, strength }) => {
    const titleTokens = new Set(tokenize(detail.title));
    const descriptionTokens = new Set(tokenize(item.description[language] ?? ""));
    const reason = queryTokensInOrder
      .filter((token) => titleTokens.has(token) || descriptionTokens.has(token))
      .join(", ");

    return {
      ...detail,
      score,
      matchStrength: strength,
      reason,
    };
  });
}
