import type { BlockViewModel } from "../../client/view-models/review";
import { InlineEditableValue } from "./inline-editable-value";
import { ProvenanceFlag } from "./provenance-flag";

export type ReviewBlockRowProps = {
  block: BlockViewModel;
  editingPath: string[] | null;
  canEdit: boolean;
  onStartEdit: (path: string[]) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onOpenBlock: (contentId: string) => void;
  onRemoveBlock: (removal: { blockIndex: number }) => void;
};

function samePath(left: string[] | null, right: string[]) {
  return left?.length === right.length && left.every((part, index) => part === right[index]);
}

export function ReviewBlockRow({ block, editingPath, canEdit, onStartEdit, onCommit, onCancel, onOpenBlock, onRemoveBlock }: ReviewBlockRowProps) {
  return (
    <tr className="border-t border-[var(--color-border-hairline)] align-top">
      <th scope="row" className="w-[34%] break-words px-3 py-4 text-left text-13 font-semibold text-[var(--color-fg)]">
        {block.title}
        {block.replacedByHuman ? <span className="mt-2 block"><ProvenanceFlag provenance={{ class: "human", text: "Set by you" }} /></span> : null}
      </th>
      <td className="break-words px-3 py-4 text-12 leading-relaxed text-[var(--color-fg-secondary)]">
        {block.description ?? <span className="italic text-[var(--color-fg-muted)]">Not set</span>}
        <span className="mt-2 block text-11 text-[var(--color-fg-quiet)]">{block.pricingStatement}</span>
      </td>
      <td className="w-[24%] px-3 py-4 text-12 text-[var(--color-fg-body)]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2">
          <span className="text-[var(--color-fg-muted)]">Qty</span><InlineEditableValue canEdit={canEdit} isEditing={samePath(editingPath, block.quantity.path)} leaf={block.quantity} onCancel={onCancel} onCommit={onCommit} onStartEdit={() => onStartEdit(block.quantity.path)} />
          <span className="text-[var(--color-fg-muted)]">Optional</span><InlineEditableValue canEdit={canEdit} isEditing={samePath(editingPath, block.optional.path)} leaf={block.optional} onCancel={onCancel} onCommit={onCommit} onStartEdit={() => onStartEdit(block.optional.path)} />
          <span className="text-[var(--color-fg-muted)]">Comment</span><InlineEditableValue canEdit={canEdit} isEditing={samePath(editingPath, block.reviewerComment.path)} leaf={block.reviewerComment} onCancel={onCancel} onCommit={onCommit} onStartEdit={() => onStartEdit(block.reviewerComment.path)} />
        </div>
        <span className="mt-2 block font-mono text-10 text-[var(--color-fg-quiet)]">{block.alternatives.length} alternatives</span>
        {canEdit ? <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onOpenBlock(block.contentId)} className="rounded-md border border-[var(--color-border-control)] px-2 py-1 text-11 font-semibold">Replace</button><button type="button" onClick={() => onRemoveBlock({ blockIndex: block.index })} className="rounded-md px-2 py-1 text-11 text-[var(--color-fg-muted)]">Remove</button></div> : null}
      </td>
    </tr>
  );
}
