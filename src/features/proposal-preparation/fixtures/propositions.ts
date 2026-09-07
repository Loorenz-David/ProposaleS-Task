import type { z } from "zod";

import { propositionSchema } from "../schemas/proposition";
import { FIXTURE_CATALOG } from "./catalog";
import {
  MAX_ALTERNATIVE_REASON_CHARS,
  MAX_ASSUMPTION_CHARS,
  MAX_COMMENT_CHARS,
  MAX_NARRATIVE_CHARS,
  MAX_NOTE_TEXT_CHARS,
  MAX_RATIONALE_CHARS,
  MAX_TITLE_CHARS,
  MAX_WARNING_CHARS,
} from "../schemas/shared";
import { MAX_ALTERNATIVES_PER_BLOCK, MAX_BLOCKS } from "../schemas/proposition";

export type Proposition = z.infer<typeof propositionSchema>;

export type ConsequentialLeafDescriptor = {
  path: string[];
  value: unknown;
  wrapper: "sourcedOrAbsent" | "bare";
  kind?: "deadline" | "term" | "scope_commitment";
};

const generationId = "123e4567-e89b-42d3-a456-426614174000";
const contentRef = { variationId: "188485" };
const brief = <T>(value: T) => ({ value, source: "brief" as const });
const inferred = <T>(value: T) => ({ value, source: "inferred" as const });
const absent = () => ({ known: false as const });
const known = <T>(value: T, source: "brief" | "human" | "inferred", ref?: Record<string, unknown>) => ({ known: true as const, value, source, ...(ref ? { ref } : {}) });

export const CONSEQUENTIAL_LEAF_DESCRIPTORS: ConsequentialLeafDescriptor[] = [
  { path: ["recipient", "value", "firstName"], value: "Ada", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "lastName"], value: "Lovelace", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "email"], value: "ada@example.com", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "phone"], value: "+46123456789", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "companyName"], value: "Analytical Engines", wrapper: "sourcedOrAbsent" },
  { path: ["blocks", "0", "contentId"], value: "188485", wrapper: "bare" },
  { path: ["blocks", "0", "quantity"], value: 2, wrapper: "sourcedOrAbsent" },
  { path: ["blocks", "0", "optional"], value: false, wrapper: "sourcedOrAbsent" },
  { path: ["commercialNotes", "0", "amount"], value: { amountMinor: 1200000, currency: "EUR" }, wrapper: "sourcedOrAbsent" },
  { path: ["commercialNotes", "0", "currency"], value: "EUR", wrapper: "sourcedOrAbsent" },
  { path: ["commercialNotes", "0", "taxBasis"], value: "including_tax", wrapper: "bare" },
  { path: ["commercialAssumptions", "0", "statedValue"], value: "2026-12-31", wrapper: "bare", kind: "deadline" },
  { path: ["commercialAssumptions", "1", "statedValue"], value: "12 months", wrapper: "bare", kind: "term" },
  { path: ["commercialAssumptions", "2", "statedValue"], value: "Onboarding and support", wrapper: "bare", kind: "scope_commitment" },
  { path: ["emptyDraftConfirmation"], value: true, wrapper: "sourcedOrAbsent" },
];

function baseProposition(): Proposition {
  return {
    generationId,
    version: 1,
    preparedAt: "2026-09-05T10:14:19.123Z",
    language: known("en", "brief"),
    title: known("Proposal for premium support", "inferred"),
    descriptionNarrative: known("A concise support proposal.", "inferred"),
    recipient: {
      known: true,
      value: {
        firstName: known("Ada", "brief"),
        lastName: known("Lovelace", "brief"),
        email: known("ada@example.com", "brief"),
        phone: known("+46123456789", "human", { editTurn: 1 }),
        companyName: known("Analytical Engines", "brief"),
      },
    },
    blocks: [{
      contentId: { value: "188485", source: "proposales_content", ref: contentRef },
      productId: "12345",
      title: { value: "Premium support", source: "proposales_content", ref: contentRef },
      description: { known: true, value: "Priority help", source: "proposales_content", ref: contentRef },
      quantity: known(2, "brief"),
      optional: known(false, "brief"),
      reviewerComment: known("Recommended for launch.", "inferred"),
      pricing: "library",
      alternatives: [{
        variationId: "188486",
        productId: "12345",
        title: "Standard support",
        matchStrength: "possible",
        score: 400,
        reason: inferred("A lower-scope alternative."),
      }],
    }],
    emptyDraftConfirmation: known(true, "human", { editTurn: 1 }),
    commercialNotes: [{
      text: { value: "The brief mentions around 12k.", source: "brief", ref: { quote: "around 12k" } },
      amount: known({ amountMinor: 1200000, currency: "EUR" }, "brief"),
      currency: known("EUR", "brief"),
      taxBasis: brief("including_tax"),
    }],
    commercialAssumptions: [
      { kind: "deadline", statedValue: brief("2026-12-31") },
      { kind: "term", statedValue: brief("12 months") },
      { kind: "scope_commitment", statedValue: brief("Onboarding and support") },
    ],
    unresolvedItems: [],
    assumptions: [{ path: ["blocks", "0", "reviewerComment"], note: inferred("The recommendation is phrased for review.") }],
    warnings: [{
      kind: "currency_mismatch",
      text: inferred("The stated currency should be checked in the editor."),
      path: ["commercialNotes", "0", "currency"],
      before: "SEK",
      after: "EUR",
      reason: "The brief and company currency differ.",
    }],
    agentRationale: known("Selected the closest library item.", "inferred"),
  };
}

export function validProposition(overrides: Partial<Proposition> = {}): Proposition {
  return { ...baseProposition(), ...overrides };
}

function setAtPath(target: AnyRecord, path: string[], value: unknown) {
  let cursor = target;
  for (const segment of path.slice(0, -1)) cursor = cursor[segment];
  cursor[path.at(-1)!] = value;
}

type AnyRecord = Record<string, any>;

export function leafInferred(descriptor: ConsequentialLeafDescriptor): Proposition {
  const proposition = structuredClone(validProposition()) as AnyRecord;
  const leaf = descriptor.wrapper === "sourcedOrAbsent"
    ? { known: true, value: descriptor.value, source: "inferred" }
    : { value: descriptor.value, source: "inferred" };
  setAtPath(proposition, descriptor.path, leaf);
  return proposition as Proposition;
}

const catalogItem = (variationId: string) => {
  const item = FIXTURE_CATALOG.find((candidate) => candidate.variationId === variationId);
  if (!item) throw new Error(`missing fixture catalog item ${variationId}`);
  return item;
};

const catalogTitle = (variationId: string) => catalogItem(variationId).title.en!;
const catalogRef = (variationId: string) => ({ variationId });

function fixtureBlock(variationId: string, alternatives: Proposition["blocks"][number]["alternatives"]): Proposition["blocks"][number] {
  const item = catalogItem(variationId);
  return {
    contentId: { value: variationId, source: "proposales_content", ref: catalogRef(variationId) },
    productId: item.productId,
    title: { value: catalogTitle(variationId), source: "proposales_content", ref: catalogRef(variationId) },
    description: { known: false },
    quantity: { known: false },
    optional: { known: false },
    reviewerComment: { known: false },
    pricing: "library",
    alternatives,
  };
}

export function propositionWithAlternatives(): Proposition {
  const proposition = validProposition({ version: 3 });
  proposition.blocks = [
    fixtureBlock("1", [
      { variationId: "2", productId: "500102", title: catalogTitle("2"), matchStrength: "possible", score: 400, reason: inferred("closest") },
      { variationId: "3", productId: "500103", title: catalogTitle("3"), matchStrength: "weak", score: 200, reason: inferred("fallback") },
    ]),
    fixtureBlock("5", []),
  ];
  proposition.warnings = [
    { kind: "weak_match", text: inferred("A weak match needs review.") },
    { kind: "non_strong_selection", text: inferred("A selected item is not strong.") },
  ];
  proposition.unresolvedItems = [
    { itemKey: "quantities", resolution: "unresolved" },
    { itemKey: "deadline_and_terms_notes", resolution: "deferred_by_user" },
  ];
  proposition.assumptions = [{ path: ["blocks", "0"], note: inferred("A review assumption.") }];
  proposition.agentRationale = { known: true, value: "Reused the closest catalog match.", source: "inferred" };
  return proposition;
}

export function maximalConformingProposition(): Proposition {
  const proposition = propositionWithAlternatives() as AnyRecord;
  proposition.title = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "inferred" };
  proposition.descriptionNarrative = { known: true, value: "x".repeat(MAX_NARRATIVE_CHARS), source: "inferred" };
  proposition.recipient.value.firstName = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
  proposition.recipient.value.lastName = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
  proposition.recipient.value.phone = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
  proposition.recipient.value.companyName = { known: true, value: "x".repeat(MAX_TITLE_CHARS), source: "brief" };
  proposition.blocks = Array.from({ length: MAX_BLOCKS }, (_, blockIndex) => {
    const variationId = String((blockIndex % 14) + 1);
    const block = fixtureBlock(variationId, Array.from({ length: MAX_ALTERNATIVES_PER_BLOCK }, (_, alternativeIndex) => {
      const altId = String(((alternativeIndex + 1) % 14) + 1);
      return {
        variationId: altId,
        productId: catalogItem(altId).productId,
        title: "x".repeat(MAX_TITLE_CHARS),
        matchStrength: "possible" as const,
        score: 400,
        reason: inferred("x".repeat(MAX_ALTERNATIVE_REASON_CHARS)),
      };
    }));
    block.title = { value: "x".repeat(MAX_TITLE_CHARS), source: "proposales_content", ref: catalogRef(variationId) };
    block.description = { known: true, value: "x".repeat(MAX_NARRATIVE_CHARS), source: "proposales_content", ref: catalogRef(variationId) };
    block.reviewerComment = { known: true, value: "x".repeat(MAX_COMMENT_CHARS), source: "inferred" };
    return block;
  });
  proposition.commercialNotes[0].text = { value: "x".repeat(MAX_NOTE_TEXT_CHARS), source: "brief", ref: { quote: "x".repeat(300) } };
  proposition.commercialAssumptions = proposition.commercialAssumptions.map((assumption: AnyRecord) => ({ ...assumption, statedValue: { value: "x".repeat(MAX_ASSUMPTION_CHARS), source: "brief" } }));
  proposition.assumptions = [{ path: ["blocks", "0"], note: inferred("x".repeat(MAX_ASSUMPTION_CHARS)) }];
  proposition.warnings = [{ kind: "weak_match", text: inferred("x".repeat(MAX_WARNING_CHARS)), reason: "x".repeat(MAX_RATIONALE_CHARS) }];
  proposition.unresolvedItems = [{ itemKey: "quantities", resolution: "unresolved" }];
  proposition.agentRationale = { known: true, value: "x".repeat(MAX_RATIONALE_CHARS), source: "inferred" };
  return proposition as Proposition;
}
