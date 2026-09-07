import { ImageOff } from "lucide-react";

import type { BlockImageState } from "../../hooks/use-block-images";

export type BlockThumbnailProps = { image: BlockImageState };

/**
 * The catalog image for one line item, so the human recognises the service rather than reading
 * the title to identify it.
 *
 * A plain `img`, not `next/image`: the images are served from whichever asset host the tenant's
 * Proposales account uses, and `next/image` refuses a host it was not configured with. Naming
 * them in `next.config.ts` would either be wrong for another tenant or turn the deployment into a
 * general-purpose image proxy, which that file's own comment rules out. Decorative by intent —
 * the item's title and description sit beside it — so it carries an empty alt rather than
 * repeating them to a screen reader.
 */
export function BlockThumbnail({ image }: BlockThumbnailProps) {
  const frame = "size-14 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border-hairline)] bg-[var(--color-bg-control)]";
  if (image.status === "ready") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- see the note above: the asset host is tenant-owned and unknown at build time.
      <img
        alt=""
        className={`${frame} object-cover`}
        decoding="async"
        loading="lazy"
        referrerPolicy="no-referrer"
        src={image.url}
      />
    );
  }
  return (
    <div aria-hidden="true" className={`${frame} grid place-items-center`}>
      {image.status === "pending" ? null : <ImageOff className="text-[var(--color-fg-quiet)]" size={16} />}
    </div>
  );
}
