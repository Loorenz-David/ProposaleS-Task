import type { FieldViewModel } from "../../client/view-models/review";
import { AskAgentPopover } from "./ask-agent-popover";
import { InlineEditableValue } from "./inline-editable-value";
import { ProvenanceFlag } from "./provenance-flag";

export type ReviewFieldRowProps = {
  field: FieldViewModel;
  isEditing: boolean;
  canEdit: boolean;
  onStartEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onAskAgent: (ask: { fieldLabel: string; text: string }) => void;
};

export function ReviewFieldRow({ field, isEditing, canEdit, onStartEdit, onCommit, onCancel, onAskAgent }: ReviewFieldRowProps) {
  return (
    <div className="grid grid-cols-[minmax(96px,116px)_minmax(0,1fr)] gap-4 border-t border-[var(--color-border-hairline)] py-4 first:border-t-0">
      <dt className="break-words text-12 font-semibold text-[var(--color-fg-muted)]">{field.leaf.label}</dt>
      <dd className="min-w-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <InlineEditableValue canEdit={canEdit} isEditing={isEditing} leaf={field.leaf} onCancel={onCancel} onCommit={onCommit} onStartEdit={onStartEdit} />
          </div>
          <ProvenanceFlag provenance={field.leaf.provenance} />
          {field.canAsk && canEdit ? <AskAgentPopover fieldLabel={field.leaf.label} onSubmit={(text) => onAskAgent({ fieldLabel: field.leaf.label, text })} state={{ status: "idle" }} /> : null}
        </div>
      </dd>
    </div>
  );
}
