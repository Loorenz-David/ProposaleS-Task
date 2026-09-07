"use client";

import { useEffect } from "react";

import { useWorkspaceSessionStore } from "./use-workspace-session-store";

export function useDepartureGuard() {
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const state = useWorkspaceSessionStore.getState();
      const creating = state.sessionIds.some((sessionId) => {
        const record = state.sessions[sessionId];
        return record?.inFlightTurn?.kind === "approval" && record.workflow?.draftReference == null;
      });
      if (!creating) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
}
