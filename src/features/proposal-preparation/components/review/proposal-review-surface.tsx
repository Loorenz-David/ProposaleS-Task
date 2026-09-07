import type { ReviewSurfaceViewModel } from "../../client/view-models/review";
import type { PreviewViewModel } from "../../client/view-models/preview";
import type { WorkSurface } from "../../types/session";
import { ClientPreviewSurface } from "../preview/client-preview-surface";
import { ApprovalAction } from "./approval-action";
import { ReviewBlocksCard } from "./review-blocks-card";
import { ReviewFieldsCard } from "./review-fields-card";
import { ReviewHeader } from "./review-header";
import { ReviewNotesCard } from "./review-notes-card";

export type ProposalReviewSurfaceProps = {
  viewModel: ReviewSurfaceViewModel;
  clientPreview?: PreviewViewModel;
  workSurface: WorkSurface;
  isTerminal: boolean;
  onWorkSurfaceChange: (workSurface: WorkSurface) => void;
  onDiscard: () => void;
  onApprove: () => void;
  onCommitEdit: (edit: { path: string[]; value: string | number | boolean }) => void;
  onCancelEdit: () => void;
  onReplaceBlock: (replacement: { blockIndex: number; variationId: string }) => void;
  onRemoveBlock: (removal: { blockIndex: number }) => void;
  onOpenBlock: (contentId: string) => void;
  onCloseBlock: () => void;
  onAskAgent: (ask: { fieldLabel: string; text: string }) => void;
  onRetryCreation: () => void;
  onBackToReview: () => void;
};

export function ProposalReviewSurface({ viewModel, clientPreview, workSurface, isTerminal, onWorkSurfaceChange, onDiscard, onApprove }: ProposalReviewSurfaceProps) {
  const unresolvedSummary = viewModel.readiness.unresolved || viewModel.readiness.deferred
    ? `${viewModel.readiness.unresolved} open, ${viewModel.readiness.deferred} deferred`
    : null;
  return (
    <div className="min-h-full">
      <ReviewHeader onWorkSurfaceChange={onWorkSurfaceChange} viewModel={viewModel} workSurface={workSurface} />
      <div className="mx-auto max-w-[1040px] space-y-5 px-5 py-6 lg:px-8">
        {workSurface === "fields" ? (
          <>
            {viewModel.surfaceErrors.length > 0 ? <div role="alert" className="rounded-xl border border-[var(--color-attention)]/50 bg-[var(--color-attention-wash)] p-4 text-13 text-[var(--color-fg-body)]">{viewModel.surfaceErrors.join(" ")}</div> : null}
            <ReviewFieldsCard fields={viewModel.fields} />
            <ReviewBlocksCard blocks={viewModel.blocks} />
            <ReviewNotesCard notes={viewModel.notes} />
          </>
        ) : clientPreview ? <ClientPreviewSurface viewModel={clientPreview} /> : null}
        {!isTerminal ? (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(240px,360px)] sm:items-start">
            <button type="button" onClick={onDiscard} className="rounded-xl border border-[var(--color-border-control-raised)] px-5 py-3 text-sm font-semibold text-[var(--color-fg-secondary)]">Discard proposition</button>
            <ApprovalAction acknowledgment={viewModel.acknowledgment} isPending={false} onApprove={onApprove} unresolvedSummary={unresolvedSummary} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
