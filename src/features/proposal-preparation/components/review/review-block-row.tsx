import type { BlockViewModel } from "../../client/view-models/review";
import { ProvenanceFlag } from "./provenance-flag";

export type ReviewBlockRowProps = { block: BlockViewModel };

export function ReviewBlockRow({ block }: ReviewBlockRowProps) {
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
        <span className="block">Qty: {block.quantity.display}</span>
        <span className="mt-1 block">Optional: {block.optional.display}</span>
        <span className="mt-1 block break-words">Comment: {block.reviewerComment.display}</span>
        <span className="mt-2 block font-mono text-10 text-[var(--color-fg-quiet)]">{block.alternatives.length} alternatives</span>
      </td>
    </tr>
  );
}
