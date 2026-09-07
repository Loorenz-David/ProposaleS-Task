import type { AlternativeViewModel } from "../../client/view-models/review";

export type BlockReplacementSurfaceProps = {
  alternatives: AlternativeViewModel[];
  isSubmitting: boolean;
  onSelect: (variationId: string) => void;
  onClose: () => void;
};

export function BlockReplacementSurface({ alternatives, isSubmitting, onSelect, onClose }: BlockReplacementSurfaceProps) {
  return (
    <section aria-label="Replace line item" className="mt-4 rounded-xl border border-[var(--color-border-elevated)] bg-[var(--color-bg-control)] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-14 font-semibold">Choose an alternative</h3>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-12 text-[var(--color-fg-secondary)]">Close</button>
      </div>
      {alternatives.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {alternatives.map((alternative) => (
            <li key={alternative.variationId}>
              <button type="button" disabled={isSubmitting} onClick={() => onSelect(alternative.variationId)} className="w-full rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-card)] p-3 text-left disabled:opacity-50">
                <span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-13 text-[var(--color-fg)]">{alternative.title}</strong><span className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-muted)]">{alternative.matchStrength}</span></span>
                <span className="mt-1 block text-12 leading-relaxed text-[var(--color-fg-secondary)]">{alternative.reason}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="mt-3 text-13 italic text-[var(--color-fg-muted)]">No alternatives were returned for this item.</p>}
    </section>
  );
}
