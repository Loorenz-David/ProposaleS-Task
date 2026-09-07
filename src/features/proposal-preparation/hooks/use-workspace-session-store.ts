"use client";

import { create } from "zustand";

import type { SessionRuntimeRecord, WorkspaceSessionId } from "../types/session";


export type WorkspaceSessionState = {
  activeSessionId: WorkspaceSessionId | null;
  sessionIds: WorkspaceSessionId[];
  sessions: Record<WorkspaceSessionId, SessionRuntimeRecord>;
  activateSession: (sessionId: WorkspaceSessionId) => void;
  createSession: () => WorkspaceSessionId;
  moveSession: (fromIndex: number, toIndex: number) => void;
  closeSession: (sessionId: WorkspaceSessionId) => void;
};

function createSessionId(): WorkspaceSessionId {
  return `session-${globalThis.crypto.randomUUID()}` as WorkspaceSessionId;
}

function createSessionRecord(): SessionRuntimeRecord {
  const id = createSessionId();
  return { id, title: "New proposal session" };
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
    set({ activeSessionId: sessionId });
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
}));

export type { SessionRuntimeRecord, WorkspaceSessionId };
