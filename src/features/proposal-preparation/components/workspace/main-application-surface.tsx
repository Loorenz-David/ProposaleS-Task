"use client";

import type { MainSurfaceState } from "../../types/presentation";
import { toMainSurfaceViewModel } from "../../client/view-models/main-surface";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";
import { ProposalPreparationIdleSurface } from "../idle/proposal-preparation-idle-surface";

export function MainApplicationSurface({ state }: { state?: MainSurfaceState }) {
  const record = useWorkspaceSessionStore((store) =>
    store.activeSessionId ? store.sessions[store.activeSessionId] : null,
  );
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
      {surface.kind !== "idle" ? (
        <div className="grid min-h-full place-items-center p-8 text-[var(--color-fg-secondary)]">
          {surface.kind === "review"
            ? "Proposal ready for review"
            : surface.kind === "creating"
              ? surface.label
              : "Draft created"}
        </div>
      ) : null}
    </main>
  );
}
