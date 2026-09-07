import { SessionTabStrip } from "../session-tabs/session-tab-strip";
import { AgentStatusLine } from "../agent/agent-status-line";

export function AgentSurface() {
  return (
    <aside
      aria-label="Proposal agent"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--color-bg-agent-pane)]"
    >
      <SessionTabStrip />
      <AgentStatusLine />
      <div className="min-w-0 px-6 pb-7 pt-7">
        <span
          aria-label="Proposal agent workspace"
          data-elided
          className="block truncate text-[var(--color-fg)]"
        >
          Proposal agent workspace
        </span>
        <p className="mt-3 text-[var(--color-fg-secondary)]">Ready when you are.</p>
      </div>
    </aside>
  );
}
