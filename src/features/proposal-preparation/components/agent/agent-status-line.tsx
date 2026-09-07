"use client";

import { toTabViewModel } from "../../client/view-models/session-tab";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";

export function AgentStatusLine() {
  const activeSessionId = useWorkspaceSessionStore((state) => state.activeSessionId);
  const session = useWorkspaceSessionStore((state) =>
    activeSessionId ? state.sessions[activeSessionId] : undefined,
  );

  if (!session) return null;

  const { statusText } = toTabViewModel(session);

  return (
    <div
      data-testid="agent-status-line"
      className="flex items-center justify-end border-b border-[var(--color-border-hairline)] px-[18px] pb-3 pt-2"
    >
      {/* Design 03 §3.2 puts the session note on the left of this line and the phase label
          on the right. Owner decision 19 removes the note from V1, so the line carries the
          phase label alone — the derivation register's own row (§12A.7). Rendering the
          status text here as well would print the same word twice. */}
      <span data-agent-phase-label className="font-mono text-10 uppercase text-[var(--color-fg-quiet)]">
        {statusText}
      </span>
    </div>
  );
}
