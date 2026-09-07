"use client";

import type { MainSurfaceState } from "../../types/presentation";
import { toMainSurfaceViewModel } from "../../client/view-models/main-surface";
import { toPreviewViewModel } from "../../client/view-models/preview";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";
import { useTurnDispatch } from "../../hooks/use-turn-dispatch";
import { ProposalPreparationIdleSurface } from "../idle/proposal-preparation-idle-surface";
import { ProposalReviewSurface } from "../review/proposal-review-surface";

export function MainApplicationSurface({ state }: { state?: MainSurfaceState }) {
  const record = useWorkspaceSessionStore((store) =>
    store.activeSessionId ? store.sessions[store.activeSessionId] : null,
  );
  const activeSessionId = useWorkspaceSessionStore((store) => store.activeSessionId);
  const setWorkSurface = useWorkspaceSessionStore((store) => store.setWorkSurface);
  const setOpenedBlock = useWorkspaceSessionStore((store) => store.setOpenedBlock);
  const dismissCallFailure = useWorkspaceSessionStore((store) => store.dismissCallFailure);
  const { dispatch } = useTurnDispatch();
  const derived = record ? toMainSurfaceViewModel(record) : { kind: "idle" as const };
  const surface = state === "idle" ? { kind: "idle" as const } : derived;

  return (
    <main
      id="main-content"
      aria-label="Proposal preparation"
      tabIndex={-1}
      data-surface-state={surface.kind}
      className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[var(--color-bg)]"
    >
      {surface.kind === "idle" ? <ProposalPreparationIdleSurface /> : null}
      {surface.kind === "review" && activeSessionId && record ? (
        <ProposalReviewSurface
          clientPreview={toPreviewViewModel(record.workflow!.currentProposition!)}
          isTerminal={false}
          onApprove={() => void dispatch(activeSessionId, {
            kind: "approval",
            workflow: record.workflow ?? {},
            proposition: record.workflow!.currentProposition!,
            acknowledgment: surface.review.acknowledgment,
          })}
          onAskAgent={(ask) => void dispatch(activeSessionId, { kind: "revision", instruction: ask.text, scope: ask.fieldLabel })}
          onBackToReview={() => dismissCallFailure(activeSessionId)}
          onCancelEdit={() => undefined}
          onCloseBlock={() => setOpenedBlock(activeSessionId, null)}
          onCommitEdit={(edit) => void dispatch(activeSessionId, { kind: "edit", operation: { op: "set_leaf", path: edit.path, value: edit.value } })}
          onDiscard={() => undefined}
          onOpenBlock={(contentId) => setOpenedBlock(activeSessionId, contentId)}
          onRemoveBlock={({ blockIndex }) => void dispatch(activeSessionId, { kind: "edit", operation: { op: "remove_block", index: blockIndex } })}
          onReplaceBlock={({ blockIndex, variationId }) => void dispatch(activeSessionId, { kind: "edit", operation: { op: "replace_block", index: blockIndex, variationId } })}
          onRetryCreation={() => {
            if (record.callFailure) void dispatch(activeSessionId, record.callFailure.retry);
          }}
          onWorkSurfaceChange={(workSurface) => setWorkSurface(activeSessionId, workSurface)}
          viewModel={surface.review}
          workSurface={surface.workSurface}
        />
      ) : null}
      {surface.kind !== "idle" && surface.kind !== "review" ? (
        <div className="grid min-h-full place-items-center p-8 text-[var(--color-fg-secondary)]">
          {surface.kind === "creating"
              ? surface.label
              : "Draft created"}
        </div>
      ) : null}
    </main>
  );
}
