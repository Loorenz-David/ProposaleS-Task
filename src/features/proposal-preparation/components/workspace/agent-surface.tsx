"use client";

import type { FormEvent } from "react";

import { SessionTabStrip } from "../session-tabs/session-tab-strip";
import { AgentStatusLine } from "../agent/agent-status-line";
import { useTurnDispatch } from "../../hooks/use-turn-dispatch";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";

export function AgentSurface() {
  const activeSessionId = useWorkspaceSessionStore((state) => state.activeSessionId);
  const record = useWorkspaceSessionStore((state) =>
    state.activeSessionId ? state.sessions[state.activeSessionId] : null,
  );
  const setComposerDraft = useWorkspaceSessionStore((state) => state.setComposerDraft);
  const { dispatch } = useTurnDispatch();

  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSessionId || !record?.composerDraft.trim() || record.inFlightTurn) return;
    void dispatch(activeSessionId, { kind: "brief", text: record.composerDraft });
  };

  return (
    <aside
      aria-label="Proposal agent"
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-bg-agent-pane)]"
    >
      <SessionTabStrip />
      <AgentStatusLine />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-7 pt-7">
        <span
          aria-label="Proposal agent workspace"
          data-elided
          className="block truncate text-[var(--color-fg)]"
        >
          Proposal agent workspace
        </span>
        <p className="mt-3 text-[var(--color-fg-secondary)]">Ready when you are.</p>
        <form className="mt-auto pt-6" onSubmit={submitBrief}>
          <label className="sr-only" htmlFor="temporary-brief">
            Describe the proposal
          </label>
          <textarea
            id="temporary-brief"
            value={record?.composerDraft ?? ""}
            onChange={(event) => {
              if (activeSessionId) setComposerDraft(activeSessionId, event.target.value);
            }}
            className="min-h-24 w-full resize-none rounded-xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-3 text-sm text-[var(--color-fg)]"
            placeholder="Describe the proposal…"
          />
          <button
            type="submit"
            disabled={!record?.composerDraft.trim() || record.inFlightTurn !== null}
            className="mt-3 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </aside>
  );
}
