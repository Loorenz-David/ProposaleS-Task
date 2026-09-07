"use client";

import { create } from "zustand";

import type {
  CallFailure,
  InFlightTurn,
  SessionRuntimeRecord,
  WorkspaceSessionId,
  WorkSurface,
} from "../types/session";
import type { TemporaryTurnInput, TemporaryTurnOutcome } from "../types/temporary-turn";

export type WorkspaceSessionState = {
  activeSessionId: WorkspaceSessionId | null;
  sessionIds: WorkspaceSessionId[];
  sessions: Record<WorkspaceSessionId, SessionRuntimeRecord>;
  activateSession: (sessionId: WorkspaceSessionId) => void;
  createSession: () => WorkspaceSessionId;
  moveSession: (fromIndex: number, toIndex: number) => void;
  closeSession: (sessionId: WorkspaceSessionId) => void;
  setComposerDraft: (sessionId: WorkspaceSessionId, text: string) => void;
  clearComposerDraft: (sessionId: WorkspaceSessionId) => void;
  startTurn: (
    sessionId: WorkspaceSessionId,
    turn: InFlightTurn,
    humanEntry?: { text: string; scope: string | null },
  ) => void;
  applyTurnResult: (
    originSessionId: WorkspaceSessionId,
    turnId: string,
    outcome: TemporaryTurnOutcome,
    retryInput: TemporaryTurnInput,
  ) => void;
  applyTurnFailure: (
    originSessionId: WorkspaceSessionId,
    turnId: string,
    failure: CallFailure,
  ) => void;
  setWorkSurface: (sessionId: WorkspaceSessionId, workSurface: WorkSurface) => void;
  setOpenedBlock: (sessionId: WorkspaceSessionId, contentId: string | null) => void;
  dismissClarificationPanel: (sessionId: WorkspaceSessionId) => void;
  reopenClarificationPanel: (sessionId: WorkspaceSessionId) => void;
  dismissCallFailure: (sessionId: WorkspaceSessionId) => void;
};

function createSessionId(): WorkspaceSessionId {
  return `session-${globalThis.crypto.randomUUID()}` as WorkspaceSessionId;
}

function createSessionRecord(): SessionRuntimeRecord {
  const id = createSessionId();
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
  };
}

function siteForInput(input: TemporaryTurnInput) {
  if (input.kind === "approval") return { kind: "creation" as const };
  if (input.kind === "revision") {
    return input.scope
      ? { kind: "ask" as const, fieldLabel: input.scope }
      : { kind: "agent" as const };
  }
  if (input.kind === "edit") {
    if (input.operation.op === "replace_block") {
      return { kind: "replacement" as const, blockIndex: input.operation.index };
    }
    if (input.operation.op === "set_leaf") {
      return { kind: "edit" as const, path: input.operation.path };
    }
    if (input.operation.op === "remove_block") {
      return { kind: "edit" as const, path: ["blocks", String(input.operation.index)] };
    }
  }
  return { kind: "agent" as const };
}

function updateRecord(
  state: WorkspaceSessionState,
  sessionId: WorkspaceSessionId,
  update: (record: SessionRuntimeRecord) => SessionRuntimeRecord,
) {
  const record = state.sessions[sessionId];
  if (!record) return state;
  return {
    sessions: {
      ...state.sessions,
      [sessionId]: update(record),
    },
  };
}

function appliesToTurn(record: SessionRuntimeRecord, turnId: string) {
  return record.inFlightTurn?.turnId === turnId;
}

function createInitialSession(): Pick<WorkspaceSessionState, "activeSessionId" | "sessionIds" | "sessions"> {
  const record = createSessionRecord();
  return {
    activeSessionId: record.id,
    sessionIds: [record.id],
    sessions: { [record.id]: record },
  };
}

const initialSessionState = createInitialSession();

export function createWorkspaceSessionState(): Pick<
  WorkspaceSessionState,
  "activeSessionId" | "sessionIds" | "sessions"
> {
  return createInitialSession();
}

export const useWorkspaceSessionStore = create<WorkspaceSessionState>((set, get) => ({
  ...initialSessionState,
  activateSession: (sessionId) => {
    if (!get().sessions[sessionId]) return;
    set((state) => {
      const record = state.sessions[sessionId];
      if (state.activeSessionId === sessionId && record.unread === 0) {
        return { activeSessionId: sessionId };
      }
      return {
        activeSessionId: sessionId,
        sessions: {
          ...state.sessions,
          [sessionId]: { ...record, unread: 0 },
        },
      };
    });
  },
  createSession: () => {
    const record = createSessionRecord();
    set((state) => ({
      activeSessionId: record.id,
      sessionIds: [...state.sessionIds, record.id],
      sessions: { ...state.sessions, [record.id]: record },
    }));
    return record.id;
  },
  moveSession: (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= get().sessionIds.length ||
      toIndex >= get().sessionIds.length
    ) {
      return;
    }

    set((state) => {
      const sessionIds = [...state.sessionIds];
      const [moved] = sessionIds.splice(fromIndex, 1);
      if (!moved) return state;
      sessionIds.splice(toIndex, 0, moved);
      return { sessionIds };
    });
  },
  closeSession: (sessionId) => {
    set((state) => {
      const index = state.sessionIds.indexOf(sessionId);
      if (index === -1) return state;

      if (state.sessionIds.length === 1) {
        const replacement = createSessionRecord();
        return {
          activeSessionId: replacement.id,
          sessionIds: [replacement.id],
          sessions: { [replacement.id]: replacement },
        };
      }

      const sessionIds = state.sessionIds.filter((id) => id !== sessionId);
      const sessions = { ...state.sessions };
      delete sessions[sessionId];
      const activeSessionId =
        state.activeSessionId === sessionId
          ? (sessionIds[Math.min(index, sessionIds.length - 1)] ?? state.activeSessionId)
          : state.activeSessionId;

      return { activeSessionId, sessionIds, sessions };
    });
  },
  setComposerDraft: (sessionId, text) => {
    set((state) => updateRecord(state, sessionId, (record) => ({ ...record, composerDraft: text })));
  },
  clearComposerDraft: (sessionId) => {
    set((state) => updateRecord(state, sessionId, (record) => ({ ...record, composerDraft: "" })));
  },
  startTurn: (sessionId, turn, humanEntry) => {
    set((state) =>
      updateRecord(state, sessionId, (record) => {
        if (record.inFlightTurn !== null) return record;
        const nextSiteKind = turn.kind === "approval" ? "creation" : turn.kind === "edit" ? "edit" : "agent";
        return {
          ...record,
          inFlightTurn: turn,
          hasStartedTurn: true,
          thread: humanEntry
            ? [
                ...record.thread,
                {
                  entryId: globalThis.crypto.randomUUID(),
                  kind: "human" as const,
                  text: humanEntry.text,
                  scope: humanEntry.scope,
                },
              ]
            : record.thread,
          callFailure:
            record.callFailure?.site.kind === nextSiteKind ? null : record.callFailure,
        };
      }),
    );
  },
  applyTurnResult: (originSessionId, turnId, outcome, retryInput) => {
    set((state) =>
      updateRecord(state, originSessionId, (record) => {
        if (!appliesToTurn(record, turnId)) return record;
        if (!outcome.ok) {
          return {
            ...record,
            inFlightTurn: null,
            callFailure: {
              site: siteForInput(retryInput),
              error: outcome.error,
              retry: retryInput,
            },
          };
        }

        const latestHumanEntry = [...record.thread]
          .reverse()
          .find((entry) => entry.kind === "human");
        return {
          ...record,
          inFlightTurn: null,
          thread: [
            ...record.thread,
            {
              entryId: globalThis.crypto.randomUUID(),
              kind: "result",
              result: outcome.result,
              scope: latestHumanEntry?.scope ?? null,
            },
          ],
          latestResult: outcome.result,
          workflow: outcome.workflow,
          clarificationPanel: outcome.result.status === "clarification" ? "open" : "dismissed",
          callFailure: null,
          unread: record.unread + (state.activeSessionId === originSessionId ? 0 : 1),
        };
      }),
    );
  },
  applyTurnFailure: (originSessionId, turnId, failure) => {
    set((state) =>
      updateRecord(state, originSessionId, (record) => {
        if (!appliesToTurn(record, turnId)) return record;
        return { ...record, inFlightTurn: null, callFailure: failure };
      }),
    );
  },
  setWorkSurface: (sessionId, workSurface) => {
    if (workSurface !== "fields" && workSurface !== "preview") return;
    set((state) =>
      updateRecord(state, sessionId, (record) => ({
        ...record,
        retained: { ...record.retained, workSurface },
      })),
    );
  },
  setOpenedBlock: (sessionId, contentId) => {
    set((state) =>
      updateRecord(state, sessionId, (record) => ({
        ...record,
        retained: { ...record.retained, openedBlockContentId: contentId },
      })),
    );
  },
  dismissClarificationPanel: (sessionId) => {
    set((state) =>
      updateRecord(state, sessionId, (record) => ({ ...record, clarificationPanel: "dismissed" })),
    );
  },
  reopenClarificationPanel: (sessionId) => {
    set((state) =>
      updateRecord(state, sessionId, (record) => ({ ...record, clarificationPanel: "open" })),
    );
  },
  dismissCallFailure: (sessionId) => {
    set((state) => updateRecord(state, sessionId, (record) => ({ ...record, callFailure: null })));
  },
}));

export type { SessionRuntimeRecord, WorkspaceSessionId };
