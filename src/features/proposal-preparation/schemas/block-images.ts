import { z } from "zod";

import { MAX_BLOCKS } from "./proposition";
import { positiveInt64StringSchema } from "./shared";

/**
 * The images the review surface shows beside each line item. They are presentational: nothing is
 * approved, sent, or decided from them, so they travel outside the workflow state and are fetched
 * after a proposition is already on screen rather than on the generation path.
 */
export const blockImagesInputSchema = z.strictObject({
  variationIds: z.array(positiveInt64StringSchema).min(1).max(MAX_BLOCKS),
});
export type BlockImagesInput = z.infer<typeof blockImagesInputSchema>;

export type BlockImage = { variationId: string; url: string };
export type BlockImages = { images: BlockImage[] };
