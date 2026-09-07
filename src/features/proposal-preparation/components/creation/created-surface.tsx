"use client";

import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

import type { CreatedViewModel } from "../../client/view-models/created";
import { useBlockImages } from "../../hooks/use-block-images";
import { ReviewBlocksCard } from "../review/review-blocks-card";
import { ReviewFieldsCard } from "../review/review-fields-card";
import { ReviewNotesCard } from "../review/review-notes-card";
import { AppliedPricing } from "./applied-pricing";

export type CreatedSurfaceProps = { viewModel: CreatedViewModel; onDraftAnother: () => void };

const ignore = () => {};

export function CreatedSurface({ viewModel, onDraftAnother }: CreatedSurfaceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const blockImages = useBlockImages(viewModel.reviewed.blocks.map((block) => block.contentId));
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 lg:px-8">
      <section aria-label={`${viewModel.headline}, Draft`} className="rounded-4xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-[var(--color-positive-medallion-border)] bg-[var(--color-positive-wash-medallion)] text-[var(--color-positive-bright)]"><Check size={24} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 ref={headingRef} tabIndex={-1} className="break-words text-2xl font-semibold text-[var(--color-fg)]">{viewModel.headline}</h1>
              <span className="rounded-pill bg-[var(--color-bg-control-strong)] px-2 py-1 font-mono text-9-5 uppercase tracking-label text-[var(--color-fg-secondary)]">Draft</span>
            </div>
            <p className="mt-3 text-13 text-[var(--color-fg-secondary)]"><span className="font-semibold">Proposal ID</span> <code className="select-all break-all">{viewModel.identifier}</code></p>
          </div>
        </div>
        <AppliedPricing pricing={viewModel.pricing} />
        {viewModel.notices.length > 0 ? <ul className="mt-4 list-disc pl-5 text-12 leading-relaxed text-[var(--color-attention)]">{viewModel.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={viewModel.editorUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Proposales (opens in a new tab)" className="rounded-xl bg-[var(--color-fg)] px-5 py-3 text-sm font-bold text-[var(--color-bg)] hover:bg-[var(--color-fg-body)]">Open in Proposales</a>
          <button type="button" onClick={onDraftAnother} className="rounded-xl border border-[var(--color-border-control-raised)] px-5 py-3 text-sm font-semibold text-[var(--color-fg-secondary)]">Draft another</button>
        </div>
      </section>
      <section aria-labelledby="reviewed-proposition-heading" className="mt-8 space-y-5">
        <div><p className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">Read-only reference</p><h2 id="reviewed-proposition-heading" className="mt-2 text-xl font-semibold">Reviewed proposition</h2></div>
        <ReviewFieldsCard canEdit={false} editingPath={null} fields={viewModel.reviewed.fields} onAskAgent={ignore} onCancel={ignore} onCommit={ignore} onStartEdit={ignore} />
        <ReviewBlocksCard blocks={viewModel.reviewed.blocks} images={blockImages} canEdit={false} editingPath={null} isSubmitting={false} onCancel={ignore} onCloseBlock={ignore} onCommit={ignore} onOpenBlock={ignore} onRemoveBlock={ignore} onReplaceBlock={ignore} onStartEdit={ignore} openedBlock={null} />
        <ReviewNotesCard notes={viewModel.reviewed.notes} />
      </section>
    </div>
  );
}
