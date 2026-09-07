import { propositionSchema, type Proposition } from "../../schemas/proposition";

/**
 * Presentation fixtures, parsed by the real schema so a shape the backend would never produce
 * cannot reach a view-model test. Test-only: nothing under `components/`, `hooks/` or the
 * production path imports this module (guarded by T-RET-2).
 *
 * The Studio North content is kept from the fixture era so the string assertions that were written
 * against it still mean the same thing. What changed is everything the real schema requires and
 * the temporary type could not express: uuid v4 generation ids, positive int64 content ids,
 * `productId`, `pricing`, sourced titles and reasons, and `preparedAt`.
 */
const GENERATION_ID = "123e4567-e89b-42d3-a456-426614174000";
const PREPARED_AT = "2026-09-07T13:00:00.000Z";

const ref = (variationId: string) => ({ variationId });
const catalog = <T>(value: T, variationId: string) =>
  ({ value, source: "proposales_content" as const, ref: ref(variationId) });
const known = <T>(value: T, source: "brief" | "human" | "inferred" | "proposales_content") =>
  ({ known: true as const, value, source });
const absent = { known: false } as const;

function parse(literal: unknown): Proposition {
  return propositionSchema.parse(literal);
}

const v1Literal = {
  generationId: GENERATION_ID,
  version: 1,
  preparedAt: PREPARED_AT,
  language: known("en", "brief"),
  title: known("Walnut dining set for Studio North", "inferred"),
  descriptionNarrative: known(
    "A considered restoration proposal for the walnut dining set, with the finish and upholstery prepared for the November opening.",
    "inferred",
  ),
  recipient: {
    known: true,
    value: {
      firstName: known("Mara", "brief"),
      lastName: absent,
      email: known("mara@example.invalid", "brief"),
      phone: absent,
      companyName: known("Studio North", "brief"),
    },
  },
  blocks: [
    {
      contentId: { value: "188485", source: "proposales_content", ref: ref("188485") },
      productId: "12345",
      title: catalog("Walnut dining table restoration", "188485"),
      description: {
        known: true,
        ...catalog("Surface preparation, finish repair and a protective final coat.", "188485"),
      },
      quantity: known(1, "brief"),
      optional: known(false, "brief"),
      reviewerComment: known("Confirm the final sheen before work begins.", "inferred"),
      pricing: "library",
      alternatives: [
        {
          variationId: "188486",
          productId: "12345",
          title: "Light restoration",
          matchStrength: "possible",
          score: 400,
          reason: { value: "Keeps the existing finish.", source: "inferred" },
        },
        {
          variationId: "188487",
          productId: "12345",
          title: "Full restoration",
          matchStrength: "strong",
          score: 900,
          reason: { value: "Matches the requested finish repair.", source: "inferred" },
        },
        {
          variationId: "188488",
          productId: "12345",
          title: "Care treatment",
          matchStrength: "weak",
          score: 150,
          reason: { value: "Useful if structural work is not needed.", source: "inferred" },
        },
      ],
    },
    {
      contentId: { value: "188490", source: "proposales_content", ref: ref("188490") },
      productId: "12346",
      title: catalog("Dining chair restoration", "188490"),
      description: { known: true, ...catalog("Joinery check, cleaning and finish renewal.", "188490") },
      quantity: absent,
      optional: known(false, "brief"),
      reviewerComment: absent,
      pricing: "library",
      alternatives: [
        {
          variationId: "188491",
          productId: "12346",
          title: "Chair care treatment",
          matchStrength: "possible",
          score: 350,
          reason: { value: "A lighter treatment for sound chairs.", source: "inferred" },
        },
      ],
    },
    {
      contentId: { value: "188495", source: "proposales_content", ref: ref("188495") },
      productId: "12347",
      title: catalog("Beige upholstery", "188495"),
      description: {
        known: true,
        ...catalog("Hard-wearing neutral upholstery for the dining chairs.", "188495"),
      },
      quantity: known(6, "brief"),
      optional: known(true, "brief"),
      reviewerComment: known("Fabric choice remains subject to client confirmation.", "inferred"),
      pricing: "library",
      alternatives: [],
    },
    {
      // Set by a human replacement, which is why its source differs from the three above.
      contentId: { value: "188499", source: "human", ref: { variationId: "188499", editTurn: 1 } },
      productId: "12348",
      title: catalog("Protected delivery", "188499"),
      description: { known: true, ...catalog("Blanket-wrapped delivery to the client site.", "188499") },
      quantity: known(1, "human"),
      optional: known(false, "human"),
      reviewerComment: absent,
      pricing: "library",
      alternatives: [
        {
          variationId: "188500",
          productId: "12348",
          title: "Client collection",
          matchStrength: "possible",
          score: 300,
          reason: { value: "Removes the delivery step.", source: "inferred" },
        },
      ],
    },
  ],
  emptyDraftConfirmation: absent,
  commercialNotes: [
    {
      text: { value: "The brief mentions a working budget for the restoration.", source: "brief" },
      amount: known({ amountMinor: 1200000, currency: "SEK" }, "brief"),
      currency: known("SEK", "brief"),
      taxBasis: { value: "unstated", source: "brief" },
    },
    {
      text: { value: "Delivery cost was not specified.", source: "brief" },
      amount: absent,
      currency: absent,
      taxBasis: { value: "unstated", source: "brief" },
    },
  ],
  commercialAssumptions: [
    { kind: "deadline", statedValue: { value: "Before the November opening", source: "brief" } },
  ],
  unresolvedItems: [
    { itemKey: "quantities", resolution: "unresolved" },
    { itemKey: "deadline_and_terms_notes", resolution: "deferred_by_user" },
  ],
  assumptions: [
    {
      path: ["blocks", "2", "quantity"],
      note: { value: "Six chairs are assumed from the brief context.", source: "inferred" },
    },
    {
      path: ["descriptionNarrative"],
      note: { value: "The opening date is treated as the desired deadline.", source: "inferred" },
    },
  ],
  warnings: [
    {
      kind: "non_strong_selection",
      text: { value: "The dining chair quantity is not confirmed.", source: "inferred" },
      path: ["blocks", "1", "quantity"],
    },
    {
      kind: "other",
      text: { value: "The upholstery colour still needs client confirmation.", source: "inferred" },
      path: ["blocks", "2"],
    },
  ],
  agentRationale: known(
    "I matched the stated restoration scope to the closest catalog content and kept uncertain details visible for review.",
    "inferred",
  ),
};

export const fixturePropositionV1: Proposition = parse(v1Literal);

export const fixturePropositionV2: Proposition = parse({
  ...v1Literal,
  version: 2,
  title: known("Studio North walnut dining collection", "human"),
});

export const fixturePropositionV3: Proposition = parse({
  ...v1Literal,
  version: 3,
  title: known("Studio North walnut dining collection", "human"),
  descriptionNarrative: known(
    "We will restore the walnut dining collection with a calm, durable finish ready for Studio North's November opening.",
    "human",
  ),
});

const longText =
  "This deliberately long description demonstrates how detailed catalog wording wraps throughout the review and approximate client document without clipping or widening the workspace beyond its pane.";

export const fixturePropositionLongText: Proposition = parse({
  ...v1Literal,
  title: known(
    "A complete and carefully coordinated restoration programme for the Studio North walnut dining room collection before the seasonal opening",
    "inferred",
  ),
  recipient: {
    known: true,
    value: {
      firstName: known("Alexandra", "brief"),
      lastName: known("Halden", "brief"),
      email: absent,
      phone: absent,
      companyName: known("Halden & Vik Studio North Collection House", "brief"),
    },
  },
  descriptionNarrative: known(longText.repeat(4).slice(0, 6000), "inferred"),
  blocks: Array.from({ length: 6 }, (_, index) => {
    const source = v1Literal.blocks[index % v1Literal.blocks.length];
    const variationId = String(190000 + index);
    return {
      ...source,
      contentId: { value: variationId, source: "proposales_content", ref: ref(variationId) },
      title: catalog(`Restoration item ${index + 1} with an intentionally long catalog title`, variationId),
      description: { known: true, ...catalog(longText.repeat(4).slice(0, 6000), variationId) },
      alternatives: [],
    };
  }),
});

export const fixturePropositionEmpty: Proposition = parse({
  generationId: GENERATION_ID,
  version: 1,
  preparedAt: PREPARED_AT,
  language: absent,
  title: absent,
  descriptionNarrative: absent,
  recipient: { known: false },
  blocks: [],
  emptyDraftConfirmation: absent,
  commercialNotes: [],
  commercialAssumptions: [],
  unresolvedItems: [{ itemKey: "block_selection", resolution: "unresolved" }],
  assumptions: [],
  warnings: [],
  agentRationale: absent,
});
