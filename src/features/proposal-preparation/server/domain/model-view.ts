import "server-only";

import type { Proposition } from "../../schemas/proposition";

/**
 * The proposition under revision, rendered in the vocabulary the model answers in.
 *
 * A revision turn used to receive the stored proposition verbatim — every `known` wrapper, every
 * `ref`, generation ids, timestamps, catalog metadata — while being asked to reply in a contract
 * that has none of those. That mismatch is both wasteful and misleading: the largest single thing
 * in the request modelled a shape the reply must not copy.
 *
 * This view shows what the model can act on: which values are set, where each came from, and the
 * identity of each block. It deliberately omits `generationId`, `version`, `preparedAt`, catalog
 * titles and descriptions, ranking figures and every `ref` — the application owns all of those and
 * re-derives them, and none is something the model may restate as evidence. A value shown here as
 * set is one the model can keep by citing `{ kind: "current" }`, which resolves against the stored
 * proposition rather than against this rendering.
 */

type LeafView = { value: unknown; source: string } | null;

function leaf(value: unknown): LeafView {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (record.known === false) return null;
  if (typeof record.source !== "string") return null;
  return { value: record.value, source: record.source };
}

export type ModelPropositionView = {
  language: LeafView;
  title: LeafView;
  descriptionNarrative: LeafView;
  agentRationale: LeafView;
  recipient: Record<string, LeafView> | null;
  blocks: Array<{
    position: number;
    variationId: string;
    selectedBy: string;
    quantity: LeafView;
    optional: LeafView;
    reviewerComment: LeafView;
    alternatives: string[];
  }>;
  commercialNotes: Array<{ text: LeafView; amount: LeafView; currency: LeafView; taxBasis: LeafView }>;
  commercialAssumptions: Array<{ kind: string; statedValue: LeafView }>;
  assumptions: Array<{ path: string[]; note: LeafView }>;
  warnings: string[];
  unresolvedItems: string[];
};

export function toModelPropositionView(proposition: Proposition): ModelPropositionView {
  return {
    language: leaf(proposition.language),
    title: leaf(proposition.title),
    descriptionNarrative: leaf(proposition.descriptionNarrative),
    agentRationale: leaf(proposition.agentRationale),
    recipient: proposition.recipient.known
      ? Object.fromEntries(
          (["firstName", "lastName", "email", "phone", "companyName"] as const)
            .map((field) => [field, leaf(proposition.recipient.known ? proposition.recipient.value[field] : undefined)]),
        )
      : null,
    blocks: proposition.blocks.map((block, position) => ({
      position,
      variationId: block.contentId.value,
      selectedBy: block.contentId.source,
      quantity: leaf(block.quantity),
      optional: leaf(block.optional),
      reviewerComment: leaf(block.reviewerComment),
      alternatives: block.alternatives.map((alternative) => alternative.variationId),
    })),
    commercialNotes: proposition.commercialNotes.map((note) => ({
      text: leaf(note.text),
      amount: leaf(note.amount),
      currency: leaf(note.currency),
      taxBasis: leaf(note.taxBasis),
    })),
    commercialAssumptions: proposition.commercialAssumptions.map((assumption) => ({
      kind: assumption.kind,
      statedValue: leaf(assumption.statedValue),
    })),
    assumptions: proposition.assumptions.map((assumption) => ({
      path: assumption.path,
      note: leaf(assumption.note),
    })),
    warnings: proposition.warnings.map((warning) => warning.kind),
    unresolvedItems: proposition.unresolvedItems.map((item) => item.itemKey),
  };
}
