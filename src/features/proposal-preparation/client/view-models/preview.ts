import type { Proposition } from "../../schemas/proposition";
import { readLeaf } from "./leaf";

export type PreviewViewModel = {
  title: string | null;
  narrative: string | null;
  items: Array<{ title: string; description: string | null }>;
  pricingStatement: string;
  disclosure: string;
  isEmpty: boolean;
};

export function toPreviewViewModel(proposition: Proposition): PreviewViewModel {
  const titleLeaf = readLeaf<string>(proposition.title);
  const narrativeLeaf = readLeaf<string>(proposition.descriptionNarrative);
  const title = titleLeaf.known ? titleLeaf.value : null;
  const narrative = narrativeLeaf.known ? narrativeLeaf.value : null;
  const items = proposition.blocks.map((block) => {
    const description = readLeaf<string>(block.description);
    return {
      title: block.title.value,
      description: description.known ? description.value : null,
    };
  });
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
