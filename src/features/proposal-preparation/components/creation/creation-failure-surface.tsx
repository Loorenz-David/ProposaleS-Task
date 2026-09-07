"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

import type { CreationFailureViewModel } from "../../client/view-models/failure";

export type CreationFailureSurfaceProps = {
  viewModel: CreationFailureViewModel;
  onBackToReview: () => void;
  onRetry: () => void;
};

export function CreationFailureSurface({ viewModel, onBackToReview, onRetry }: CreationFailureSurfaceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <section role="alert" className="grid min-h-full place-items-center px-5 py-10">
      <div className="w-full max-w-[620px] rounded-4xl border border-[var(--color-attention)]/50 bg-[var(--color-bg-card)] p-6 sm:p-8">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-[var(--color-attention)]/50 bg-[var(--color-attention-wash)] text-[var(--color-attention)]"><TriangleAlert size={23} /></span>
        <h1 ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold">{viewModel.headline}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-body)]">{viewModel.message}</p>
        {viewModel.detail ? <p className="mt-2 text-13 text-[var(--color-fg-secondary)]">{viewModel.detail}</p> : null}
        <p className="mt-4 text-13 font-semibold text-[var(--color-fg-secondary)]">{viewModel.nothingSentStatement}</p>
        {viewModel.existingDraft ? <a href={viewModel.existingDraft.editorUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block break-all text-13">Open existing draft {viewModel.existingDraft.identifier} (opens in a new tab)</a> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onBackToReview} className="rounded-xl border border-[var(--color-border-control-raised)] px-5 py-3 text-sm font-semibold">Back to review</button>
          {viewModel.canRetry ? <button type="button" onClick={onRetry} className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-[var(--color-bg)]">Try again</button> : null}
        </div>
      </div>
    </section>
  );
}
