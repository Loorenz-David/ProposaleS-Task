"use client";

import { useState } from "react";

import type { BlockViewModel } from "../../client/view-models/review";
import type { BlockImagesState } from "../../hooks/use-block-images";
import { ConfirmDialog } from "../workspace/confirm-dialog";
import { BlockReplacementSurface } from "./block-replacement-surface";
import { ReviewBlockRow } from "./review-block-row";

export type ReviewBlocksCardProps = {
  blocks: BlockViewModel[];
  images?: BlockImagesState;
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

const PENDING: { status: "pending" } = { status: "pending" };

export function ReviewBlocksCard({ blocks, images = {}, openedBlock, editingPath, canEdit, isSubmitting, onStartEdit, onCommit, onCancel, onOpenBlock, onCloseBlock, onReplaceBlock, onRemoveBlock }: ReviewBlocksCardProps) {
  /**
   * Removing a line item changes what the client is offered, so it is confirmed before it is
   * done (05 §7) and the dialog names the item and the quantity being taken out. Local to this
   * card: no other surface asks the question, and the answer outlives nothing.
   */
  const [pendingRemoval, setPendingRemoval] = useState<BlockViewModel | null>(null);
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
            <tbody>{blocks.map((block) => <ReviewBlockRow block={block} canEdit={canEdit} editingPath={editingPath} image={images[block.contentId] ?? PENDING} key={block.contentId} onCancel={onCancel} onCommit={onCommit} onOpenBlock={onOpenBlock} onRequestRemove={setPendingRemoval} onStartEdit={onStartEdit} />)}</tbody>
          </table>
        </div>
      ) : <p className="mt-4 text-13 italic text-[var(--color-fg-muted)]">No line items have been selected.</p>}
      {openedBlock ? <BlockReplacementSurface alternatives={openedBlock.alternatives} isSubmitting={isSubmitting} onClose={onCloseBlock} onSelect={(variationId) => onReplaceBlock({ blockIndex: openedBlock.index, variationId })} /> : null}
      <ConfirmDialog
        confirmLabel="Remove line item"
        description={pendingRemoval
          ? `${pendingRemoval.title} — quantity ${pendingRemoval.quantity.display} — will be taken out of the proposal. The agent does not put it back on its own.`
          : ""}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (pendingRemoval) onRemoveBlock({ blockIndex: pendingRemoval.index });
          setPendingRemoval(null);
        }}
        open={pendingRemoval !== null}
        title={pendingRemoval ? `Remove ${pendingRemoval.title}?` : "Remove line item?"}
      />
    </section>
  );
}
