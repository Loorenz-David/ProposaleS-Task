import type { NotesViewModel } from "../../client/view-models/review";
import { ProvenanceFlag } from "./provenance-flag";

export type ReviewNotesCardProps = { notes: NotesViewModel };

export function ReviewNotesCard({ notes }: ReviewNotesCardProps) {
  return (
    <section aria-labelledby="review-notes-heading" className="rounded-4xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-5">
      <h2 id="review-notes-heading" className="text-15 font-semibold text-[var(--color-fg)]">Review notes</h2>
      <dl className="mt-4 space-y-5 text-13">
        {notes.commercialNotes.map((note, index) => (
          <div key={`${note.text}:${index}`}><dt className="font-semibold text-[var(--color-fg-muted)]">Commercial note</dt><dd className="mt-1 text-[var(--color-fg-body)]">{note.text}{note.amountDisplay ? <span className="mt-1 block font-mono">{note.amountDisplay} · {note.taxBasis}</span> : null}<span className="mt-2 block"><ProvenanceFlag provenance={note.amountProvenance} /></span></dd></div>
        ))}
        {notes.commercialAssumptions.map((assumption) => (
          <div key={`${assumption.kind}:${assumption.statedValue}`}><dt className="font-semibold capitalize text-[var(--color-fg-muted)]">{assumption.kind.replaceAll("_", " ")}</dt><dd className="mt-1 text-[var(--color-fg-body)]">{assumption.statedValue} <ProvenanceFlag provenance={assumption.provenance} /></dd></div>
        ))}
        {notes.assumptions.map((assumption) => <div key={`${assumption.pathLabel}:${assumption.note}`}><dt className="font-semibold text-[var(--color-fg-muted)]">Assumption · {assumption.pathLabel}</dt><dd className="mt-1 text-[var(--color-fg-body)]">{assumption.note}</dd></div>)}
        {notes.warnings.map((warning) => <div key={`${warning.kind}:${warning.text}`}><dt className="font-semibold text-[var(--color-attention)]">Needs attention</dt><dd className="mt-1 text-[var(--color-fg-body)]">{warning.text}</dd></div>)}
        {notes.unresolvedItems.map((item) => <div key={item.itemLabel}><dt className="break-words font-semibold text-[var(--color-fg-muted)]">{item.itemLabel}</dt><dd className="mt-1 text-[var(--color-fg-body)]">{item.resolutionText}</dd></div>)}
      </dl>
    </section>
  );
}
