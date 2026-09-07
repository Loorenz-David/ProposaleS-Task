import type { BlockViewModel } from "../../client/view-models/review";
import { ReviewBlockRow } from "./review-block-row";

export type ReviewBlocksCardProps = { blocks: BlockViewModel[] };

export function ReviewBlocksCard({ blocks }: ReviewBlocksCardProps) {
  return (
    <section aria-labelledby="review-blocks-heading" className="rounded-4xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-5">
      <h2 id="review-blocks-heading" className="text-15 font-semibold text-[var(--color-fg)]">Line items</h2>
      {blocks.length > 0 ? (
        <div className="mt-4 min-w-0 overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-left font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
                <th className="px-3 pb-3">Item</th><th className="px-3 pb-3">Description</th><th className="px-3 pb-3">Configuration</th>
              </tr>
            </thead>
            <tbody>{blocks.map((block) => <ReviewBlockRow block={block} key={block.contentId} />)}</tbody>
          </table>
        </div>
      ) : <p className="mt-4 text-13 italic text-[var(--color-fg-muted)]">No line items have been selected.</p>}
    </section>
  );
}
