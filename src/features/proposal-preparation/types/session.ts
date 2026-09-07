declare const workspaceSessionIdBrand: unique symbol;

export type WorkspaceSessionId = string & {
  readonly [workspaceSessionIdBrand]: "WorkspaceSessionId";
};

export type SessionRuntimeRecord = {
  id: WorkspaceSessionId;
  title: string;
};
