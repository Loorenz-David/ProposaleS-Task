declare const workspaceSessionIdBrand: unique symbol;

export type WorkspaceSessionId = string & {
  readonly [workspaceSessionIdBrand]: "WorkspaceSessionId";
};

export type TabStatus = "working" | "created" | "questions" | "ready" | "idle" | "empty";

// Temporary presentation-era stand-in. The backend-owned result kind is imported here
// once its schema exists; this marked union must not become that domain contract.
export type TemporarySessionResultKind =
  | "clarification"
  | "proposition"
  | "failed"
  | "created"
  | "recovered";

export type SessionRuntimeRecord = {
  id: WorkspaceSessionId;
  title: string;
  isTurnInFlight: boolean;
  hasDraftReference: boolean;
  latestDomainResultKind: TemporarySessionResultKind | null;
  hasCurrentProposition: boolean;
  hasStartedTurn: boolean;
};
