import type { FieldViewModel } from "../../client/view-models/review";
import { ProvenanceFlag } from "./provenance-flag";

export type ReviewFieldRowProps = { field: FieldViewModel };

export function ReviewFieldRow({ field }: ReviewFieldRowProps) {
  return (
    <div className="grid grid-cols-[minmax(96px,116px)_minmax(0,1fr)] gap-4 border-t border-[var(--color-border-hairline)] py-4 first:border-t-0">
      <dt className="break-words text-12 font-semibold text-[var(--color-fg-muted)]">{field.leaf.label}</dt>
      <dd className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`break-words text-sm ${field.leaf.isAbsent ? "italic text-[var(--color-fg-muted)]" : "text-[var(--color-fg-body)]"}`}>
            {field.leaf.display}
          </span>
          <ProvenanceFlag provenance={field.leaf.provenance} />
        </div>
        {field.leaf.validationMessage ? <p className="mt-2 text-12 text-[var(--color-attention)]">{field.leaf.validationMessage}</p> : null}
      </dd>
    </div>
  );
}
