"use client";

import type { MainSurfaceState } from "../../types/presentation";
import { toMainSurfaceViewModel } from "../../client/view-models/main-surface";
import { toPreviewViewModel } from "../../client/view-models/preview";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";
import { useTurnDispatch } from "../../hooks/use-turn-dispatch";
import type { CloseGuardController } from "../../hooks/use-close-guard";
import { CreatedSurface } from "../creation/created-surface";
import { CreatingSurface } from "../creation/creating-surface";
import { CreationFailureSurface } from "../creation/creation-failure-surface";
import { ProposalPreparationIdleSurface } from "../idle/proposal-preparation-idle-surface";
import { ProposalReviewSurface } from "../review/proposal-review-surface";

export function MainApplicationSurface({ state, closeGuard }: { state?: MainSurfaceState; closeGuard?: CloseGuardController }) {
  const record = useWorkspaceSessionStore((store) =>
    store.activeSessionId ? store.sessions[store.activeSessionId] : null,
  );
  const activeSessionId = useWorkspaceSessionStore((store) => store.activeSessionId);
  const setWorkSurface = useWorkspaceSessionStore((store) => store.setWorkSurface);
  const setOpenedBlock = useWorkspaceSessionStore((store) => store.setOpenedBlock);
  const dismissCallFailure = useWorkspaceSessionStore((store) => store.dismissCallFailure);
  const createSession = useWorkspaceSessionStore((store) => store.createSession);
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
      {surface.kind === "review" && activeSessionId && record && surface.creationFailure ? (
        <CreationFailureSurface
          onBackToReview={() => dismissCallFailure(activeSessionId)}
          onRetry={() => void dispatch(activeSessionId, record.callFailure!.retry)}
          viewModel={surface.creationFailure}
        />
      ) : null}
      {surface.kind === "review" && activeSessionId && record && !surface.creationFailure ? (
        <ProposalReviewSurface
          clientPreview={toPreviewViewModel(record.workflow!.currentProposition!)}
          isEditSubmitting={record.inFlightTurn?.kind === "edit"}
          isSubmitting={record.inFlightTurn !== null}
          openedBlock={surface.openedBlock}
          isTerminal={false}
          onApprove={() => void dispatch(activeSessionId, {
            kind: "approval",
            workflow: record.workflow ?? {},
            proposition: record.workflow!.currentProposition!,
            acknowledgment: surface.review.acknowledgment,
          })}
          onAskAgent={(ask) => void dispatch(activeSessionId, { kind: "revision", instruction: `About ${ask.fieldLabel}: ${ask.text}`, scope: ask.fieldLabel })}
          onBackToReview={() => dismissCallFailure(activeSessionId)}
          onCancelEdit={() => undefined}
          onCloseBlock={() => setOpenedBlock(activeSessionId, null)}
          onCommitEdit={(edit) => {
            if (record.workflow?.draftReference) return;
            void dispatch(activeSessionId, { kind: "edit", operation: { op: "set_leaf", path: edit.path, value: edit.value } });
          }}
          onDiscard={() => {
            if (closeGuard && activeSessionId) closeGuard.requestClose(activeSessionId);
          }}
          onOpenBlock={(contentId) => setOpenedBlock(activeSessionId, contentId)}
          onRemoveBlock={({ blockIndex }) => {
            if (record.workflow?.draftReference) return;
            void dispatch(activeSessionId, { kind: "edit", operation: { op: "remove_block", index: blockIndex } });
          }}
          onReplaceBlock={({ blockIndex, variationId }) => {
            if (record.workflow?.draftReference) return;
            void dispatch(activeSessionId, { kind: "edit", operation: { op: "replace_block", index: blockIndex, variationId } });
          }}
          onRetryCreation={() => {
            if (record.callFailure) void dispatch(activeSessionId, record.callFailure.retry);
          }}
          onWorkSurfaceChange={(workSurface) => setWorkSurface(activeSessionId, workSurface)}
          viewModel={surface.review}
          workSurface={surface.workSurface}
        />
      ) : null}
      {surface.kind === "creating" ? <CreatingSurface label={surface.label} /> : null}
      {surface.kind === "created" ? <CreatedSurface onDraftAnother={createSession} viewModel={surface.created} /> : null}
    </main>
  );
}
