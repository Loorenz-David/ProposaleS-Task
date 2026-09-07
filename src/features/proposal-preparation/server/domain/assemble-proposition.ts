import "server-only";

import type { ContentItem } from "@/lib/proposales";

import type { AgentProposition } from "../../schemas/agent-output";
import type { InformationItems } from "../../schemas/information-items";
import { MAX_ALTERNATIVES_PER_BLOCK, propositionSchema, type Proposition, type Warning } from "../../schemas/proposition";
import type { RetrievalRecord } from "./retrieval-record";

const inferredText = (value: string) => ({ value, source: "inferred" as const });

function knownString(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  if (!("known" in value) || value.known !== true || !("value" in value) || typeof value.value !== "string") return null;
  return value.value;
}

function unresolvedItems(items: InformationItems) {
  return Object.entries(items).flatMap(([itemKey, item]) => item.resolution === "supplied"
    ? []
    : [{ itemKey, resolution: item.resolution }]);
}

export function assembleProposition(
  output: AgentProposition,
  ctx: {
    generationId: string;
    version: number;
    preparedAt: string;
    retrieval: RetrievalRecord;
    catalog: ContentItem[];
    language: string | null;
    items: InformationItems;
    companyCurrency: string;
  },
): Proposition {
  const warnings: Warning[] = [...output.warnings];
  const unresolved = unresolvedItems(ctx.items);

  const blocks = output.blocks.map((block, blockIndex) => {
    const selected = ctx.retrieval.candidates.get(block.contentId.value);
    if (selected === undefined) throw new Error(`validated retrieval record is missing block ${blockIndex}`);
    const item = ctx.catalog.find((candidate) => candidate.variationId === selected.variationId);
    const ref = { variationId: selected.variationId };

    if (selected.matchStrength !== undefined && selected.matchStrength !== "strong") {
      warnings.push({
        kind: "non_strong_selection",
        text: inferredText(`Selected content ${selected.variationId} has ${selected.matchStrength} match strength.`),
        path: ["blocks", String(blockIndex), "contentId"],
      });
    }

    const alternatives = block.alternatives.slice(0, MAX_ALTERNATIVES_PER_BLOCK).flatMap((alternative) => {
      const retrieved = ctx.retrieval.candidates.get(alternative.variationId);
      if (retrieved === undefined || retrieved.matchStrength === undefined || retrieved.score === undefined) {
        warnings.push({
          kind: "other",
          text: inferredText(`Alternative content ${alternative.variationId} was omitted because ranking evidence was unavailable.`),
          path: ["blocks", String(blockIndex), "alternatives"],
        });
        return [];
      }
      return [{
        variationId: retrieved.variationId,
        productId: retrieved.productId,
        title: retrieved.title,
        matchStrength: retrieved.matchStrength,
        score: retrieved.score,
        reason: alternative.reason,
      }];
    });

    const description = ctx.language === null ? undefined : item?.description[ctx.language];
    return {
      contentId: block.contentId,
      productId: selected.productId,
      title: { value: selected.title, source: "proposales_content" as const, ref },
      description: description === undefined || description.trim().length === 0
        ? { known: false as const }
        : { known: true as const, value: description, source: "proposales_content" as const, ref },
      quantity: block.quantity,
      optional: block.optional,
      reviewerComment: block.reviewerComment,
      pricing: "library" as const,
      alternatives,
    };
  });

  if (output.warnings.some((warning) => warning.kind === "uncovered_scope")) {
    warnings.push({ kind: "no_acceptable_match", text: inferredText("Part of the requested scope has no acceptable catalog match.") });
    if (!unresolved.some((item) => item.itemKey === "sold_scope")) {
      unresolved.push({ itemKey: "sold_scope", resolution: "unresolved" });
    }
  }

  output.commercialNotes.forEach((note, index) => {
    const currency = knownString(note.currency);
    if (currency !== null && currency !== ctx.companyCurrency) {
      warnings.push({
        kind: "currency_mismatch",
        text: inferredText(`The brief states ${currency}, while the company currency is ${ctx.companyCurrency}.`),
        path: ["commercialNotes", String(index), "currency"],
      });
    }
  });

  const language = ctx.language === null ? { known: false as const } : output.language;
  if (ctx.language === null) {
    warnings.push({ kind: "catalog_language_missing", text: inferredText("The proposed language is not available in the content catalog."), path: ["language"] });
  }

  return propositionSchema.parse({
    generationId: ctx.generationId,
    version: ctx.version,
    preparedAt: ctx.preparedAt,
    language,
    title: output.title,
    descriptionNarrative: output.descriptionNarrative,
    recipient: output.recipient,
    blocks,
    emptyDraftConfirmation: { known: false },
    commercialNotes: output.commercialNotes,
    commercialAssumptions: output.commercialAssumptions,
    unresolvedItems: unresolved,
    assumptions: output.assumptions,
    warnings,
    agentRationale: output.agentRationale,
  });
}
