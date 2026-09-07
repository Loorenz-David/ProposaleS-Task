import type { TemporaryProposition } from "../../types/temporary-turn";

export type PreviewViewModel = {
  title: string | null;
  narrative: string | null;
  items: Array<{ title: string; description: string | null }>;
  pricingStatement: string;
  disclosure: string;
  isEmpty: boolean;
};

export function toPreviewViewModel(proposition: TemporaryProposition): PreviewViewModel {
  const title = proposition.title.known ? proposition.title.value : null;
  const narrative = proposition.descriptionNarrative.known
    ? proposition.descriptionNarrative.value
    : null;
  const items = proposition.blocks.map((block) => ({
    title: block.title,
    description: block.description.known ? block.description.value : null,
  }));
  return {
    title,
    narrative,
    items,
    pricingStatement: "Pricing is applied by Proposales from your content library.",
    disclosure:
      "Approximate preview. Final layout, imagery and branding come from your Proposales template.",
    isEmpty: title === null && narrative === null && items.length === 0,
  };
}
