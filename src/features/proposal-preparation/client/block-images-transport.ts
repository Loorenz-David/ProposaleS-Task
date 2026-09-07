import { blockImagesAction } from "../server/actions";
import type { BlockImage } from "../schemas/block-images";

/**
 * The browser seam for line-item images, beside `turn-transport.ts` and for the same reason: a
 * component or a hook never reaches a Server Action itself. This one carries no vocabulary of its
 * own — images are presentational and decide nothing — so a failure returns no images rather than
 * an error the surface would have nothing to do with.
 */
export type BlockImagesTransport = {
  load: (variationIds: string[]) => Promise<BlockImage[]>;
};

async function loadBlockImages(variationIds: string[]): Promise<BlockImage[]> {
  const result = await blockImagesAction({ variationIds });
  return result.ok ? result.data.images : [];
}

let testTransport: BlockImagesTransport | null = null;

export const blockImagesTransport: BlockImagesTransport = {
  load(variationIds) {
    return testTransport ? testTransport.load(variationIds) : loadBlockImages(variationIds);
  },
};

export function setBlockImagesTransportForTests(transport: BlockImagesTransport | null) {
  testTransport = transport;
}
