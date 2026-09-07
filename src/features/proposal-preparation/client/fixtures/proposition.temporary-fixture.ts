import type { TemporaryProposition } from "../../types/temporary-turn";

const absent = { known: false } as const;

export const temporaryFixturePropositionV1: TemporaryProposition = {
  version: 1,
  language: { known: true, value: "English", source: "brief" },
  title: { known: true, value: "Walnut dining set for Studio North", source: "inferred" },
  descriptionNarrative: {
    known: true,
    value:
      "A considered restoration proposal for the walnut dining set, with the finish and upholstery prepared for the November opening.",
    source: "inferred",
  },
  recipient: {
    known: true,
    firstName: { known: true, value: "Mara", source: "brief" },
    lastName: absent,
    email: { known: true, value: "mara@example.invalid", source: "brief" },
    phone: absent,
    companyName: { known: true, value: "Studio North", source: "brief" },
  },
  blocks: [
    {
      contentId: { value: "content-walnut-table", source: "proposales_content" },
      title: "Walnut dining table restoration",
      description: {
        known: true,
        value: "Surface preparation, finish repair and a protective final coat.",
        source: "proposales_content",
      },
      quantity: { known: true, value: 1, source: "brief" },
      optional: { known: true, value: false, source: "brief" },
      reviewerComment: { known: true, value: "Confirm the final sheen before work begins.", source: "inferred" },
      alternatives: [
        { variationId: "variation-table-light", title: "Light restoration", matchStrength: "possible", reason: "Keeps the existing finish." },
        { variationId: "variation-table-full", title: "Full restoration", matchStrength: "strong", reason: "Matches the requested finish repair." },
        { variationId: "variation-table-care", title: "Care treatment", matchStrength: "weak", reason: "Useful if structural work is not needed." },
      ],
    },
    {
      contentId: { value: "content-dining-chair", source: "proposales_content" },
      title: "Dining chair restoration",
      description: { known: true, value: "Joinery check, cleaning and finish renewal.", source: "proposales_content" },
      quantity: absent,
      optional: { known: true, value: false, source: "inferred" },
      reviewerComment: absent,
      alternatives: [
        { variationId: "variation-chair-care", title: "Chair care treatment", matchStrength: "possible", reason: "A lighter treatment for sound chairs." },
      ],
    },
    {
      contentId: { value: "content-upholstery", source: "proposales_content" },
      title: "Beige upholstery",
      description: { known: true, value: "Hard-wearing neutral upholstery for the dining chairs.", source: "proposales_content" },
      quantity: { known: true, value: 6, source: "inferred" },
      optional: { known: true, value: true, source: "inferred" },
      reviewerComment: { known: true, value: "Fabric choice remains subject to client confirmation.", source: "inferred" },
      alternatives: [],
    },
    {
      contentId: { value: "content-delivery", source: "human" },
      title: "Protected delivery",
      description: { known: true, value: "Blanket-wrapped delivery to the client site.", source: "human" },
      quantity: { known: true, value: 1, source: "human" },
      optional: { known: true, value: false, source: "human" },
      reviewerComment: absent,
      alternatives: [
        { variationId: "variation-collection", title: "Client collection", matchStrength: "possible", reason: "Removes the delivery step." },
      ],
    },
  ],
  commercialNotes: [
    {
      text: "The brief mentions a working budget for the restoration.",
      amount: { known: true, value: { amountMinor: 1200000, currency: "SEK" }, source: "brief" },
      taxBasis: { known: true, value: "unstated", source: "brief" },
    },
    { text: "Delivery cost was not specified.", amount: absent, taxBasis: absent },
  ],
  commercialAssumptions: [
    { kind: "deadline", statedValue: { known: true, value: "Before the November opening", source: "brief" } },
  ],
  unresolvedItems: [
    { itemKey: "chair-quantity", resolution: "unresolved" },
    { itemKey: "delivery-access", resolution: "deferred_by_user" },
  ],
  assumptions: [
    { path: ["blocks", "2", "quantity"], note: "Six chairs are assumed from the brief context." },
    { path: ["descriptionNarrative"], note: "The opening date is treated as the desired deadline." },
  ],
  warnings: [
    { kind: "missing_quantity", text: "The dining chair quantity is not confirmed.", path: ["blocks", "1", "quantity"] },
    { kind: "client_confirmation", text: "The upholstery colour still needs client confirmation.", path: ["blocks", "2"] },
  ],
  agentRationale: {
    known: true,
    value: "I matched the stated restoration scope to the closest catalog content and kept uncertain details visible for review.",
    source: "inferred",
  },
};

export const temporaryFixturePropositionV2: TemporaryProposition = {
  ...temporaryFixturePropositionV1,
  version: 2,
  title: { known: true, value: "Studio North walnut dining collection", source: "human" },
};

export const temporaryFixturePropositionV3: TemporaryProposition = {
  ...temporaryFixturePropositionV2,
  version: 3,
  descriptionNarrative: {
    known: true,
    value: "We will restore the walnut dining collection with a calm, durable finish ready for Studio North's November opening.",
    source: "human",
  },
};

const longText =
  "This deliberately long description demonstrates how detailed catalog wording wraps throughout the review and approximate client document without clipping or widening the workspace beyond its pane.";

export const temporaryFixturePropositionLongText: TemporaryProposition = {
  ...temporaryFixturePropositionV1,
  title: {
    known: true,
    value: "A complete and carefully coordinated restoration programme for the Studio North walnut dining room collection before the seasonal opening",
    source: "inferred",
  },
  recipient: {
    known: true,
    firstName: { known: true, value: "Alexandra", source: "brief" },
    lastName: { known: true, value: "Halden", source: "brief" },
    email: absent,
    phone: absent,
    companyName: { known: true, value: "Halden & Vik Studio North Collection House", source: "brief" },
  },
  descriptionNarrative: { known: true, value: longText.repeat(4), source: "inferred" },
  blocks: Array.from({ length: 6 }, (_, index) => ({
    ...temporaryFixturePropositionV1.blocks[index % temporaryFixturePropositionV1.blocks.length],
    contentId: { value: `content-long-${index + 1}`, source: "proposales_content" as const },
    title: `Restoration item ${index + 1} with an intentionally long catalog title`,
    description: { known: true as const, value: longText.repeat(4), source: "proposales_content" as const },
  })),
};

export const temporaryFixturePropositionEmpty: TemporaryProposition = {
  version: 1,
  language: absent,
  title: absent,
  descriptionNarrative: absent,
  recipient: { known: false },
  blocks: [],
  commercialNotes: [],
  commercialAssumptions: [],
  unresolvedItems: [{ itemKey: "block-selection", resolution: "unresolved" }],
  assumptions: [],
  warnings: [],
  agentRationale: absent,
};
