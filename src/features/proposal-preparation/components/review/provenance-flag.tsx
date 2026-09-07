import type { ProvenanceViewModel } from "../../client/view-models/review";

export type ProvenanceFlagProps = { provenance: ProvenanceViewModel };

export function ProvenanceFlag({ provenance }: ProvenanceFlagProps) {
  if (provenance.class === "sourced") return null;
  const treatment =
    provenance.class === "human"
      ? "border-[var(--color-positive-medallion-border)] bg-[var(--color-positive-wash-badge)] text-[var(--color-positive)]"
      : provenance.class === "inferred"
        ? "border-[var(--color-attention)]/50 bg-[var(--color-attention-wash)] text-[var(--color-attention)]"
        : "border-[var(--color-border-control)] bg-[var(--color-bg-control)] text-[var(--color-fg-muted)]";
  return (
    <span className={`inline-flex rounded-pill border px-2 py-1 font-mono text-9-5 uppercase tracking-label ${treatment}`}>
      {provenance.text}
    </span>
  );
}
