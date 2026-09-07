declare const workspaceSessionIdBrand: unique symbol;

import type { ErrorDto } from "@/lib/errors/error-dto";

import type {
  TemporaryDomainResult,
  TemporaryTurnInput,
  TemporaryWorkflowState,
} from "./temporary-turn";

export type WorkspaceSessionId = string & {
  readonly [workspaceSessionIdBrand]: "WorkspaceSessionId";
};

export type TabStatus = "working" | "created" | "questions" | "ready" | "idle" | "empty";

export type WorkSurface = "fields" | "preview";
export type RetainedContext = {
  workSurface: WorkSurface;
  openedBlockContentId: string | null;
};

export type InFlightTurn =
  | { turnId: string; kind: "brief" | "answers" | "revision" | "approval" }
  | { turnId: string; kind: "edit"; path: string[] };

export type ThreadEntry =
  | { entryId: string; kind: "human"; text: string; scope: string | null }
  | { entryId: string; kind: "result"; result: TemporaryDomainResult; scope: string | null };

export type CallFailure = {
  site:
    | { kind: "agent" }
    | { kind: "creation" }
    | { kind: "edit"; path: string[] }
    | { kind: "replacement"; blockIndex: number }
    | { kind: "ask"; fieldLabel: string };
  error: ErrorDto;
  retry: TemporaryTurnInput;
};

export type SessionRuntimeRecord = {
  id: WorkspaceSessionId;
  title: string;
  thread: ThreadEntry[];
  latestResult: TemporaryDomainResult | null;
  workflow: TemporaryWorkflowState | null;
  inFlightTurn: InFlightTurn | null;
  hasStartedTurn: boolean;
  unread: number;
  composerDraft: string;
  retained: RetainedContext;
  clarificationPanel: "open" | "dismissed";
  callFailure: CallFailure | null;
};
