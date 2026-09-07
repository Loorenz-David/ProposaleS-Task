import type { AppliedPricingViewModel } from "../../client/view-models/created";

export type AppliedPricingProps = { pricing: AppliedPricingViewModel };

export function AppliedPricing({ pricing }: AppliedPricingProps) {
  if (!pricing.available) {
    return (
      <section aria-labelledby="applied-pricing-heading" className="mt-5 rounded-xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-4">
        <h2 id="applied-pricing-heading" className="text-14 font-semibold">Applied pricing unavailable</h2>
        <p className="mt-2 text-13 text-[var(--color-fg-secondary)]">{pricing.reasonText}</p>
      </section>
    );
  }
  return (
    <section aria-labelledby="applied-pricing-heading" className="mt-5 rounded-xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="applied-pricing-heading" className="text-14 font-semibold">Applied pricing</h2>
        <span className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-muted)]">{pricing.currency}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><span className="block text-11 text-[var(--color-fg-muted)]">Total excluding tax</span><strong className="mt-1 block font-mono text-15">{pricing.totalWithoutTax}</strong></div>
        <div><span className="block text-11 text-[var(--color-fg-muted)]">Total including tax</span><strong className="mt-1 block font-mono text-15">{pricing.totalWithTax}</strong></div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full table-fixed text-left text-12">
          <thead className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]"><tr><th className="pb-2">Content</th><th className="pb-2">Qty</th><th className="pb-2">Unit ex. tax</th><th className="pb-2">Unit inc. tax</th></tr></thead>
          <tbody>{pricing.blocks.map((block) => <tr key={block.contentId} className="border-t border-[var(--color-border-hairline)]"><th className="break-words py-3 pr-2 font-medium">{block.contentId}{block.optional ? <span className="mt-1 block font-mono text-9-5 uppercase text-[var(--color-fg-muted)]">Optional</span> : null}</th><td className="py-3 pr-2">{block.quantity}</td><td className="break-words py-3 pr-2 font-mono">{block.unitWithoutTax}</td><td className="break-words py-3 font-mono">{block.unitWithTax}</td></tr>)}</tbody>
        </table>
      </div>
      {pricing.warnings.length > 0 ? <ul className="mt-3 list-disc pl-4 text-12 text-[var(--color-attention)]">{pricing.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
    </section>
  );
}
