"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { WorkspaceSessionId } from "./use-workspace-session-store";
import { useWorkspaceSessionStore } from "./use-workspace-session-store";

type FocusAfterClose = () => void;

type DialogState = {
  sessionId: WorkspaceSessionId;
  title: string;
  afterClose?: FocusAfterClose;
};

export type CloseGuardController = {
  requestClose: (sessionId: WorkspaceSessionId, afterClose?: FocusAfterClose) => void;
  dialog: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
  refusal: { sessionId: WorkspaceSessionId; message: string } | null;
};

const REFUSAL_MESSAGE = "This session cannot be closed while its draft is being created.";

function closeSessionAtGuard(sessionId: WorkspaceSessionId, afterClose?: FocusAfterClose) {
  useWorkspaceSessionStore.getState().closeSession(sessionId);
  afterClose?.();
}

export function useCloseGuard(): CloseGuardController {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [refusal, setRefusal] = useState<CloseGuardController["refusal"]>(null);

  useEffect(() => {
    if (!refusal) return;
    const clear = () => setRefusal(null);
    document.addEventListener("pointerdown", clear);
    document.addEventListener("keydown", clear);
    return () => {
      document.removeEventListener("pointerdown", clear);
      document.removeEventListener("keydown", clear);
    };
  }, [refusal]);

  useEffect(() => {
    if (!refusal) return;
    return useWorkspaceSessionStore.subscribe((state) => {
      const record = state.sessions[refusal.sessionId];
      if (!record || record.inFlightTurn?.kind !== "approval") setRefusal(null);
    });
  }, [refusal]);

  const requestClose = useCallback((sessionId: WorkspaceSessionId, afterClose?: FocusAfterClose) => {
    const record = useWorkspaceSessionStore.getState().sessions[sessionId];
    setDialogState(null);
    setRefusal(null);
    if (!record) return;
    if (record.inFlightTurn?.kind === "approval") {
      setRefusal({ sessionId, message: REFUSAL_MESSAGE });
      return;
    }
    const meaningful =
      record.hasStartedTurn ||
      record.inFlightTurn !== null ||
      record.thread.length > 0 ||
      record.workflow?.currentProposition != null ||
      record.workflow?.clarification != null ||
      record.workflow?.draftReference != null ||
      record.composerDraft.length > 0;
    if (!meaningful) {
      closeSessionAtGuard(sessionId, afterClose);
      return;
    }
    setDialogState({ sessionId, title: record.title, afterClose });
  }, []);

  const cancel = useCallback(() => setDialogState(null), []);
  const confirm = useCallback(() => {
    if (!dialogState) return;
    const { sessionId, afterClose } = dialogState;
    setDialogState(null);
    closeSessionAtGuard(sessionId, afterClose);
  }, [dialogState]);

  return useMemo(
    () => ({
      requestClose,
      dialog: {
        open: dialogState !== null,
        title: dialogState ? `Close ${dialogState.title}?` : "Close session?",
        description: dialogState
          ? `Closing ${dialogState.title} will discard this session's in-memory work.`
          : "",
        confirmLabel: "Close session",
        onConfirm: confirm,
        onCancel: cancel,
      },
      refusal,
    }),
    [cancel, confirm, dialogState, refusal, requestClose],
  );
}
