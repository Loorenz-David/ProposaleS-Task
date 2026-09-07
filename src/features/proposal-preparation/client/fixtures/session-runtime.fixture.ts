import type { SessionRuntimeRecord, WorkspaceSessionId } from "../../types/session";

export function fixtureSessionRuntimeRecord(
  overrides: Partial<SessionRuntimeRecord> = {},
): SessionRuntimeRecord {
  const id = "fixture-session" as WorkspaceSessionId;
  return {
    id,
    title: "New proposal session",
    thread: [],
    latestResult: null,
    workflow: null,
    conversation: null,
    inFlightTurn: null,
    hasStartedTurn: false,
    unread: 0,
    composerDraft: "",
    retained: { workSurface: "fields", openedBlockContentId: null },
    clarificationPanel: "dismissed",
    callFailure: null,
    ...overrides,
  };
}
