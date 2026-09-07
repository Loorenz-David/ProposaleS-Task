import "server-only";

import { ValidationError } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";
import type { ProposalesClient } from "@/lib/proposales";

import { blockImagesInputSchema, type BlockImages } from "../../schemas/block-images";
import { defaultDeps } from "./default-deps";

/**
 * Reads the first image of each requested content variation. The vendor only returns images for a
 * single-variation query, so this is one call per variation — which is exactly why it is not on
 * the generation path: the proposition renders first and these arrive afterwards.
 *
 * A variation with no image is simply absent from the result. That is a fact about the catalog,
 * not a failure, and the surface renders the item without one.
 */
export async function getBlockImages(
  input: unknown,
  deps: { proposales: ProposalesClient } = defaultDeps,
): Promise<BlockImages> {
  const parsed = blockImagesInputSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError({ issues: zodIssues(parsed.error) });

  const requested = [...new Set(parsed.data.variationIds)];
  const items = await Promise.all(requested.map((variationId) => deps.proposales.getContent(variationId)));
  return {
    images: items.flatMap((item) => {
      const url = item?.images?.[0];
      return item === null || url === undefined ? [] : [{ variationId: item.variationId, url }];
    }),
  };
}
