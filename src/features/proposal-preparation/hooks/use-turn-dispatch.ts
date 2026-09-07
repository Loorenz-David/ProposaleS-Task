"use client";

import { useCallback } from "react";

import { temporaryFixtureTurnAdapter } from "../client/fixtures/turns.temporary-fixture";
import type { InFlightTurn, WorkspaceSessionId } from "../types/session";
import type { TemporaryTurnInput } from "../types/temporary-turn";
import { useWorkspaceSessionStore } from "./use-workspace-session-store";

function toInFlightTurn(input: TemporaryTurnInput, turnId: string): InFlightTurn {
  if (input.kind === "edit") {
    return {
      turnId,
      kind: "edit",
      path: input.operation.op === "set_leaf" ? input.operation.path : [],
    };
  }
  return { turnId, kind: input.kind };
}

export function useTurnDispatch(): {
  dispatch: (sessionId: WorkspaceSessionId, input: TemporaryTurnInput) => Promise<void>;
} {
  const dispatch = useCallback(async (sessionId: WorkspaceSessionId, input: TemporaryTurnInput) => {
    const originSessionId = sessionId;
    const turnId = globalThis.crypto.randomUUID();
    const record = useWorkspaceSessionStore.getState().sessions[originSessionId];
    if (!record) return;
    const position = record.thread.length;
    const humanEntry =
      input.kind === "brief"
        ? { text: input.text, scope: null }
        : input.kind === "revision"
          ? { text: input.instruction, scope: input.scope }
          : undefined;

    useWorkspaceSessionStore
      .getState()
      .startTurn(originSessionId, toInFlightTurn(input, turnId), humanEntry);
    if (input.kind === "brief" || input.kind === "revision") {
      useWorkspaceSessionStore.getState().clearComposerDraft(originSessionId);
    }

    const outcome = await temporaryFixtureTurnAdapter.run(input, position);
    useWorkspaceSessionStore
      .getState()
      .applyTurnResult(originSessionId, turnId, outcome, input);
  }, []);

  return { dispatch };
}
