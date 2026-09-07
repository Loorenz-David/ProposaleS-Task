import type { SessionRuntimeRecord, WorkspaceSessionId } from "../../types/session";

export function temporaryFixtureSessionRuntimeRecord(
  overrides: Partial<SessionRuntimeRecord> = {},
): SessionRuntimeRecord {
  const id = "temporary-session" as WorkspaceSessionId;
  return {
    id,
    title: "New proposal session",
    isTurnInFlight: false,
    hasDraftReference: false,
    latestDomainResultKind: null,
    hasCurrentProposition: false,
    hasStartedTurn: false,
    ...overrides,
  };
}
