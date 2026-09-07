import { Replace, Trash2 } from "lucide-react";

import type { BlockViewModel } from "../../client/view-models/review";
import type { BlockImageState } from "../../hooks/use-block-images";
import { BlockThumbnail } from "./block-thumbnail";
import { InlineEditableValue } from "./inline-editable-value";
import { ProvenanceFlag } from "./provenance-flag";

export type ReviewBlockRowProps = {
  block: BlockViewModel;
  image: BlockImageState;
  editingPath: string[] | null;
  canEdit: boolean;
  onStartEdit: (path: string[]) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onOpenBlock: (contentId: string) => void;
  onRequestRemove: (block: BlockViewModel) => void;
};

function samePath(left: string[] | null, right: string[]) {
  return left?.length === right.length && left.every((part, index) => part === right[index]);
}

export function ReviewBlockRow({ block, image, editingPath, canEdit, onStartEdit, onCommit, onCancel, onOpenBlock, onRequestRemove }: ReviewBlockRowProps) {
  const field = (
    label: string,
    leaf: BlockViewModel["quantity"],
  ) => (
    <>
      <span className="pt-2 text-11 text-[var(--color-fg-muted)]">{label}</span>
      <InlineEditableValue
        canEdit={canEdit}
        isEditing={samePath(editingPath, leaf.path)}
        leaf={leaf}
        onCancel={onCancel}
        onCommit={onCommit}
        onStartEdit={() => onStartEdit(leaf.path)}
      />
    </>
  );

  return (
    <tr className="border-t border-[var(--color-border-hairline)] align-top">
      <th scope="row" className="w-[30%] px-3 py-4 text-left font-normal">
        <div className="flex gap-3">
          <BlockThumbnail image={image} />
          <div className="min-w-0">
            <span className="block break-words text-13 font-semibold text-[var(--color-fg)]">{block.title}</span>
            {block.replacedByHuman ? <span className="mt-2 block"><ProvenanceFlag provenance={{ class: "human", text: "Set by you" }} /></span> : null}
          </div>
        </div>
      </th>
      <td className="break-words px-3 py-4 text-12 leading-relaxed text-[var(--color-fg-secondary)]">
        {block.description ?? <span className="italic text-[var(--color-fg-muted)]">Not set</span>}
        <span className="mt-2 block text-11 text-[var(--color-fg-quiet)]">{block.pricingStatement}</span>
      </td>
      <td className="w-[28%] px-3 py-4 text-12 text-[var(--color-fg-body)]">
        {/* The row's actions, where a card's actions live: top right, above what they act on. */}
        {canEdit ? (
          <div className="mb-3 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onOpenBlock(block.contentId)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-control)] px-2.5 py-1.5 text-11 font-semibold text-[var(--color-fg-body)] hover:border-[var(--color-border-control-raised)]"
            >
              <Replace aria-hidden="true" size={13} /> Replace
            </button>
            <button
              type="button"
              aria-label={`Remove ${block.title}`}
              title={`Remove ${block.title}`}
              onClick={() => onRequestRemove(block)}
              className="grid size-[30px] place-items-center rounded-lg text-[var(--color-fg-muted)] hover:bg-[var(--color-attention-wash)] hover:text-[var(--color-attention)]"
            >
              <Trash2 aria-hidden="true" size={14} />
            </button>
          </div>
        ) : null}
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2">
          {field("Qty", block.quantity)}
          {field("Optional", block.optional)}
          {field("Comment", block.reviewerComment)}
        </div>
        <span className="mt-3 block font-mono text-10 text-[var(--color-fg-quiet)]">{block.alternatives.length} alternatives</span>
      </td>
    </tr>
  );
}
