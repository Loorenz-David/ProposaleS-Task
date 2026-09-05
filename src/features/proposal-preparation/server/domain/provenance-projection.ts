import "server-only";

import type { PropositionSource } from "../../schemas/shared";
import type { Proposition as PropositionValue } from "../../schemas/proposition";

export type ProvenanceProjectionEntry = {
  path: string[];
  source: PropositionSource;
  ref?: Record<string, unknown>;
};

function add(entries: ProvenanceProjectionEntry[], path: string[], leaf: any) {
  if (leaf?.known === false || typeof leaf?.source !== "string") return;
  entries.push({ path, source: leaf.source, ...(leaf.ref ? { ref: leaf.ref } : {}) });
}

function compareSegments(left: string, right: string): number {
  const leftIndex = /^\d+$/.test(left);
  const rightIndex = /^\d+$/.test(right);
  if (leftIndex && rightIndex) return Number(left) - Number(right);
  return left < right ? -1 : left > right ? 1 : 0;
}

function comparePaths(left: string[], right: string[]): number {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const comparison = compareSegments(left[index], right[index]);
    if (comparison !== 0) return comparison;
  }
  return left.length - right.length;
}

export function projectProvenance(proposition: PropositionValue): ProvenanceProjectionEntry[] {
  const entries: ProvenanceProjectionEntry[] = [];
  add(entries, ["language"], proposition.language);
  add(entries, ["title"], proposition.title);
  add(entries, ["descriptionNarrative"], proposition.descriptionNarrative);

  if (proposition.recipient.known) {
    for (const key of ["firstName", "lastName", "email", "phone", "companyName"] as const) {
      add(entries, ["recipient", "value", key], proposition.recipient.value[key]);
    }
  }

  proposition.blocks.forEach((block, blockIndex) => {
    const prefix = ["blocks", String(blockIndex)];
    add(entries, [...prefix, "contentId"], block.contentId);
    add(entries, [...prefix, "title"], block.title);
    add(entries, [...prefix, "description"], block.description);
    add(entries, [...prefix, "quantity"], block.quantity);
    add(entries, [...prefix, "optional"], block.optional);
    add(entries, [...prefix, "reviewerComment"], block.reviewerComment);
    block.alternatives.forEach((alternative, alternativeIndex) => {
      add(entries, [...prefix, "alternatives", String(alternativeIndex), "reason"], alternative.reason);
    });
  });

  add(entries, ["emptyDraftConfirmation"], proposition.emptyDraftConfirmation);
  proposition.commercialNotes.forEach((note, noteIndex) => {
    const prefix = ["commercialNotes", String(noteIndex)];
    add(entries, [...prefix, "text"], note.text);
    add(entries, [...prefix, "amount"], note.amount);
    add(entries, [...prefix, "currency"], note.currency);
    add(entries, [...prefix, "taxBasis"], note.taxBasis);
  });
  proposition.commercialAssumptions.forEach((assumption, assumptionIndex) => {
    add(entries, ["commercialAssumptions", String(assumptionIndex), "statedValue"], assumption.statedValue);
  });
  proposition.assumptions.forEach((assumption, assumptionIndex) => {
    add(entries, ["assumptions", String(assumptionIndex), "note"], assumption.note);
  });
  proposition.warnings.forEach((warning, warningIndex) => {
    add(entries, ["warnings", String(warningIndex), "text"], warning.text);
  });
  add(entries, ["agentRationale"], proposition.agentRationale);

  return entries.sort((left, right) => comparePaths(left.path, right.path));
}
