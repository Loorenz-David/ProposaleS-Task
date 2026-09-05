import type { z } from "zod";

import { propositionSchema } from "../schemas/proposition";

export type Proposition = z.infer<typeof propositionSchema>;

export type ConsequentialLeafDescriptor = {
  path: string[];
  seed: unknown;
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
  { path: ["recipient", "value", "firstName"], seed: "Ada", value: "Ada", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "lastName"], seed: "Lovelace", value: "Lovelace", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "email"], seed: "ada@example.com", value: "ada@example.com", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "phone"], seed: "+46123456789", value: "+46123456789", wrapper: "sourcedOrAbsent" },
  { path: ["recipient", "value", "companyName"], seed: "Analytical Engines", value: "Analytical Engines", wrapper: "sourcedOrAbsent" },
  { path: ["blocks", "0", "contentId"], seed: "188485", value: "188485", wrapper: "bare" },
  { path: ["blocks", "0", "quantity"], seed: 2, value: 2, wrapper: "sourcedOrAbsent" },
  { path: ["blocks", "0", "optional"], seed: false, value: false, wrapper: "sourcedOrAbsent" },
  { path: ["commercialNotes", "0", "amount"], seed: { amountMinor: 1200000, currency: "EUR" }, value: { amountMinor: 1200000, currency: "EUR" }, wrapper: "sourcedOrAbsent" },
  { path: ["commercialNotes", "0", "currency"], seed: "EUR", value: "EUR", wrapper: "sourcedOrAbsent" },
  { path: ["commercialNotes", "0", "taxBasis"], seed: "including_tax", value: "including_tax", wrapper: "bare" },
  { path: ["commercialAssumptions", "0", "statedValue"], seed: "2026-12-31", value: "2026-12-31", wrapper: "bare", kind: "deadline" },
  { path: ["commercialAssumptions", "1", "statedValue"], seed: "12 months", value: "12 months", wrapper: "bare", kind: "term" },
  { path: ["commercialAssumptions", "2", "statedValue"], seed: "Onboarding and support", value: "Onboarding and support", wrapper: "bare", kind: "scope_commitment" },
  { path: ["emptyDraftConfirmation"], seed: true, value: true, wrapper: "sourcedOrAbsent" },
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
  if (descriptor.path[0] === "commercialAssumptions") {
    setAtPath(proposition, descriptor.path, { value: descriptor.value, source: "inferred" });
  } else setAtPath(proposition, descriptor.path, leaf);
  return proposition as Proposition;
}
