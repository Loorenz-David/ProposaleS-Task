import "server-only";

import type { ContentCandidate } from "../../schemas/content-candidate";
import type { Proposition } from "../../schemas/proposition";

export type RetrievedCandidate = {
  variationId: string;
  productId: string;
  title: string;
  matchStrength?: ContentCandidate["matchStrength"];
  score?: number;
};

export type RetrievalRecord = {
  candidates: ReadonlyMap<string, RetrievedCandidate>;
};

export function emptyRetrievalRecord(): RetrievalRecord {
  return { candidates: new Map() };
}

export function seedRetrievalRecord(proposition: Proposition): RetrievalRecord {
  const candidates = new Map<string, RetrievedCandidate>();
  for (const block of proposition.blocks) {
    candidates.set(block.contentId.value, {
      variationId: block.contentId.value,
      productId: block.productId,
      title: block.title.value,
    });
    for (const alternative of block.alternatives) {
      candidates.set(alternative.variationId, {
        variationId: alternative.variationId,
        productId: alternative.productId,
        title: alternative.title,
        matchStrength: alternative.matchStrength,
        score: alternative.score,
      });
    }
  }
  return { candidates };
}

export function extendRetrievalRecord(record: RetrievalRecord, candidates: ReadonlyArray<ContentCandidate>): RetrievalRecord {
  const next = new Map(record.candidates);
  for (const candidate of candidates) {
    next.set(candidate.variationId, {
      variationId: candidate.variationId,
      productId: candidate.productId,
      title: candidate.title,
      matchStrength: candidate.matchStrength,
      score: candidate.score,
    });
  }
  return { candidates: next };
}

export function hasRetrieved(record: RetrievalRecord, variationId: string): boolean {
  return record.candidates.has(variationId);
}
