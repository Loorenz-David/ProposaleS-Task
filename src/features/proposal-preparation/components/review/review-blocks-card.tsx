import type { BlockViewModel } from "../../client/view-models/review";
import { BlockReplacementSurface } from "./block-replacement-surface";
import { ReviewBlockRow } from "./review-block-row";

export type ReviewBlocksCardProps = {
  blocks: BlockViewModel[];
  openedBlock: BlockViewModel | null;
  editingPath: string[] | null;
  canEdit: boolean;
  isSubmitting: boolean;
  onStartEdit: (path: string[]) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onOpenBlock: (contentId: string) => void;
  onCloseBlock: () => void;
  onReplaceBlock: (replacement: { blockIndex: number; variationId: string }) => void;
  onRemoveBlock: (removal: { blockIndex: number }) => void;
};

export function ReviewBlocksCard({ blocks, openedBlock, editingPath, canEdit, isSubmitting, onStartEdit, onCommit, onCancel, onOpenBlock, onCloseBlock, onReplaceBlock, onRemoveBlock }: ReviewBlocksCardProps) {
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
            <tbody>{blocks.map((block) => <ReviewBlockRow block={block} canEdit={canEdit} editingPath={editingPath} key={block.contentId} onCancel={onCancel} onCommit={onCommit} onOpenBlock={onOpenBlock} onRemoveBlock={onRemoveBlock} onStartEdit={onStartEdit} />)}</tbody>
          </table>
        </div>
      ) : <p className="mt-4 text-13 italic text-[var(--color-fg-muted)]">No line items have been selected.</p>}
      {openedBlock ? <BlockReplacementSurface alternatives={openedBlock.alternatives} isSubmitting={isSubmitting} onClose={onCloseBlock} onSelect={(variationId) => onReplaceBlock({ blockIndex: openedBlock.index, variationId })} /> : null}
    </section>
  );
}
