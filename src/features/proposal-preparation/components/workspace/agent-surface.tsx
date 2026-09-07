"use client";

import { toCallFailureViewModel } from "../../client/view-models/failure";
import type { PillIntent } from "../../client/view-models/pill";
import { toThreadViewModel, toWorkingLabel } from "../../client/view-models/thread";
import { AgentComposer } from "../agent/agent-composer";
import { AgentEmptyState } from "../agent/agent-empty-state";
import { AgentHeader } from "../agent/agent-header";
import { AgentThread } from "../agent/agent-thread";
import { SessionTabStrip } from "../session-tabs/session-tab-strip";
import { AgentStatusLine } from "../agent/agent-status-line";
import { TurnFailureNotice } from "../agent/turn-failure-notice";
import { useTurnDispatch } from "../../hooks/use-turn-dispatch";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";

export function AgentSurface() {
  const activeSessionId = useWorkspaceSessionStore((state) => state.activeSessionId);
  const record = useWorkspaceSessionStore((state) =>
    state.activeSessionId ? state.sessions[state.activeSessionId] : null,
  );
  const sessionCount = useWorkspaceSessionStore((state) => state.sessionIds.length);
  const setComposerDraft = useWorkspaceSessionStore((state) => state.setComposerDraft);
  const dismissCallFailure = useWorkspaceSessionStore((state) => state.dismissCallFailure);
  const reopenClarificationPanel = useWorkspaceSessionStore(
    (state) => state.reopenClarificationPanel,
  );
  const setWorkSurface = useWorkspaceSessionStore((state) => state.setWorkSurface);
  const { dispatch } = useTurnDispatch();

  const submitBrief = () => {
    if (!activeSessionId || !record?.composerDraft.trim() || record.inFlightTurn) return;
    void dispatch(
      activeSessionId,
      record.workflow?.currentProposition
        ? { kind: "revision", instruction: record.composerDraft, scope: null }
        : { kind: "brief", text: record.composerDraft },
    );
  };

  const onPillIntent = (intent: PillIntent) => {
    if (!activeSessionId) return;
    if (intent.kind === "reopen-questions") reopenClarificationPanel(activeSessionId);
    if (intent.kind === "focus-review") setWorkSurface(activeSessionId, "fields");
  };

  if (!record || !activeSessionId) return null;
  const thread = toThreadViewModel(record);
  const failure = record.callFailure?.site.kind === "agent"
    ? toCallFailureViewModel(record.callFailure)
    : null;

  return (
    <aside
      aria-label="Proposal agent"
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-bg-agent-pane)]"
    >
      <AgentHeader sessionCount={sessionCount} />
      <SessionTabStrip />
      <AgentStatusLine />
      {thread.isEmpty && !record.inFlightTurn ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-[18px]">
          <AgentEmptyState onStarterSelect={(text) => setComposerDraft(activeSessionId, text)} />
        </div>
      ) : (
        <AgentThread
          key={activeSessionId}
          isWorking={record.inFlightTurn !== null}
          onPillIntent={onPillIntent}
          suppressFollow={record.clarificationPanel === "open"}
          viewModel={thread}
          workingLabel={record.inFlightTurn ? toWorkingLabel(record.inFlightTurn) : ""}
        />
      )}
      {failure ? (
        <TurnFailureNotice
          onDismiss={() => dismissCallFailure(activeSessionId)}
          onRetry={() => void dispatch(activeSessionId, record.callFailure!.retry)}
          viewModel={failure}
        />
      ) : null}
      <AgentComposer
        hint={record.workflow?.currentProposition ? "Ask for a revision, or edit a field in the review." : "Enter to send · Shift+Enter for a new line"}
        isSubmitting={record.inFlightTurn !== null}
        onChange={(text) => setComposerDraft(activeSessionId, text)}
        onSubmit={submitBrief}
        value={record.composerDraft}
      />
    </aside>
  );
}
