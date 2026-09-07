import type { FieldViewModel } from "../../client/view-models/review";
import { ReviewFieldRow } from "./review-field-row";

export type ReviewFieldsCardProps = {
  fields: FieldViewModel[];
  editingPath: string[] | null;
  canEdit: boolean;
  onStartEdit: (path: string[]) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onAskAgent: (ask: { fieldLabel: string; text: string }) => void;
};

function samePath(left: string[] | null, right: string[]) {
  return left?.length === right.length && left.every((part, index) => part === right[index]);
}

export function ReviewFieldsCard({ fields, editingPath, canEdit, onStartEdit, onCommit, onCancel, onAskAgent }: ReviewFieldsCardProps) {
  return (
    <section aria-labelledby="review-fields-heading" className="rounded-4xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-5">
      <h2 id="review-fields-heading" className="text-15 font-semibold text-[var(--color-fg)]">Proposal fields</h2>
      <dl className="mt-4">{fields.map((field) => <ReviewFieldRow canEdit={canEdit} field={field} isEditing={samePath(editingPath, field.leaf.path)} key={field.leaf.path.join(".")} onAskAgent={onAskAgent} onCancel={onCancel} onCommit={onCommit} onStartEdit={() => onStartEdit(field.leaf.path)} />)}</dl>
    </section>
  );
}
