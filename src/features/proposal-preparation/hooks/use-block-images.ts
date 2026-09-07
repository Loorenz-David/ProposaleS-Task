"use client";

import { useEffect, useRef, useState } from "react";

import { blockImagesTransport } from "../client/block-images-transport";

/**
 * What is known about one line item's image. "none" is an answer, not a failure: most catalog
 * content has no image, and the surface renders those items without one rather than waiting.
 */
export type BlockImageState =
  | { status: "pending" }
  | { status: "none" }
  | { status: "ready"; url: string };

export type BlockImagesState = Record<string, BlockImageState>;

/**
 * Fetches the images of the line items already on screen, once per variation id. Presentational
 * only: nothing here reaches the workflow state, the approval envelope, or any decision, which is
 * what makes it safe to run after the proposition renders instead of delaying it (05 §5).
 *
 * A request that fails leaves its items at "none". The human loses a thumbnail beside content
 * they can already read the title and description of, so there is nothing to report and nothing
 * to retry.
 */
export function useBlockImages(variationIds: string[]): BlockImagesState {
  const [images, setImages] = useState<BlockImagesState>({});
  const requested = useRef<Set<string>>(new Set());
  // The ids are the dependency: a re-render with the same line items must not refetch, and an
  // edit that changes them must.
  const key = variationIds.join(",");

  useEffect(() => {
    const missing = key.split(",").filter((id) => id !== "" && !requested.current.has(id));
    if (missing.length === 0) return;
    for (const id of missing) requested.current.add(id);
    setImages((current) => ({
      ...current,
      ...Object.fromEntries(missing.map((id) => [id, { status: "pending" as const }])),
    }));

    /**
     * The result is not abandoned on cleanup. Development runs under StrictMode, which invokes
     * this effect twice: the second run finds every id already requested and starts nothing, so
     * abandoning the first run's response leaves every item pending forever. Applying it late is
     * safe instead — each entry is keyed by its variation id, and a set update on an unmounted
     * component is a no-op.
     */
    void (async () => {
      const fetched = await blockImagesTransport.load(missing);
      const found = new Map(fetched.map((image) => [image.variationId, image.url]));
      setImages((current) => ({
        ...current,
        ...Object.fromEntries(missing.map((id) => {
          const url = found.get(id);
          return [id, url === undefined ? { status: "none" as const } : { status: "ready" as const, url }];
        })),
      }));
    })();
  }, [key]);

  return images;
}
