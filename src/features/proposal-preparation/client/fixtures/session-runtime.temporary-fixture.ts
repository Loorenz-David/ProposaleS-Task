import type { SessionRuntimeRecord, WorkspaceSessionId } from "../../types/session";

export function temporaryFixtureSessionRuntimeRecord(
  overrides: Partial<SessionRuntimeRecord> = {},
): SessionRuntimeRecord {
  const id = "temporary-session" as WorkspaceSessionId;
  return {
    id,
    title: "New proposal session",
    thread: [],
    latestResult: null,
    workflow: null,
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
