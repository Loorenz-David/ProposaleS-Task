declare const workspaceSessionIdBrand: unique symbol;

import type { ErrorDto } from "@/lib/errors/error-dto";

import type { ConversationContext } from "../schemas/conversation";
import type { DomainResult } from "../schemas/turn-result";
import type { ProposalWorkflowState } from "../schemas/workflow-state";
import type { TurnInput } from "./turn";

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
  | { entryId: string; kind: "result"; result: DomainResult; scope: string | null };

export type CallFailure = {
  site:
    | { kind: "agent" }
    | { kind: "creation" }
    | { kind: "edit"; path: string[] }
    | { kind: "replacement"; blockIndex: number }
    | { kind: "ask"; fieldLabel: string };
  error: ErrorDto;
  retry: TurnInput;
};

export type SessionRuntimeRecord = {
  id: WorkspaceSessionId;
  title: string;
  thread: ThreadEntry[];
  latestResult: DomainResult | null;
  workflow: ProposalWorkflowState | null;
  /**
   * Linguistic continuity, so "the second one" resolves on the next turn. Never authority: the
   * state is (05 §5). Held beside the state because approval returns no conversation and the
   * record must keep the one it has.
   */
  conversation: ConversationContext | null;
  inFlightTurn: InFlightTurn | null;
  hasStartedTurn: boolean;
  unread: number;
  composerDraft: string;
  retained: RetainedContext;
  clarificationPanel: "open" | "dismissed";
  callFailure: CallFailure | null;
};
