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
      className="flex items-center justify-between border-b border-[var(--color-border-hairline)] px-[18px] pb-3 pt-2"
    >
      <span data-agent-status-text className="text-12-5 font-semibold text-[var(--color-fg-secondary)]">
        {statusText}
      </span>
      <span data-agent-phase-label className="font-mono text-10 uppercase text-[var(--color-fg-quiet)]">
        {statusText}
      </span>
    </div>
  );
}
