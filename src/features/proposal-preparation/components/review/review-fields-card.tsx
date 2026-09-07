import type { FieldViewModel } from "../../client/view-models/review";
import { ReviewFieldRow } from "./review-field-row";

export type ReviewFieldsCardProps = { fields: FieldViewModel[] };

export function ReviewFieldsCard({ fields }: ReviewFieldsCardProps) {
  return (
    <section aria-labelledby="review-fields-heading" className="rounded-4xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-5">
      <h2 id="review-fields-heading" className="text-15 font-semibold text-[var(--color-fg)]">Proposal fields</h2>
      <dl className="mt-4">{fields.map((field) => <ReviewFieldRow field={field} key={field.leaf.path.join(".")} />)}</dl>
    </section>
  );
}
