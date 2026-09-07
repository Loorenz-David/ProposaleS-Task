"use client";

import { useCallback } from "react";

import { temporaryFixtureTurnAdapter } from "../client/fixtures/turns.temporary-fixture";
import type { CallFailure, InFlightTurn, WorkspaceSessionId } from "../types/session";
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

function failureMatchesInput(
  failure: CallFailure,
  input: TemporaryTurnInput,
) {
  if (input.kind === "approval") return failure.site.kind === "creation";
  if (input.kind === "revision") {
    return input.scope
      ? failure.site.kind === "ask" && failure.site.fieldLabel === input.scope
      : failure.site.kind === "agent";
  }
  if (input.kind === "edit") {
    const operation = input.operation;
    if (operation.op === "replace_block") {
      return failure.site.kind === "replacement" && failure.site.blockIndex === operation.index;
    }
    if (operation.op === "set_leaf") {
      return failure.site.kind === "edit" && failure.site.path.length === operation.path.length &&
        failure.site.path.every((part, index) => part === operation.path[index]);
    }
  }
  return failure.site.kind === "agent";
}

export function useTurnDispatch(): {
  dispatch: (sessionId: WorkspaceSessionId, input: TemporaryTurnInput) => Promise<void>;
} {
  const dispatch = useCallback(async (sessionId: WorkspaceSessionId, input: TemporaryTurnInput) => {
    const originSessionId = sessionId;
    const turnId = globalThis.crypto.randomUUID();
    const record = useWorkspaceSessionStore.getState().sessions[originSessionId];
    if (!record || record.inFlightTurn !== null) return;
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
    if (record.callFailure && failureMatchesInput(record.callFailure, input)) {
      useWorkspaceSessionStore.getState().dismissCallFailure(originSessionId);
    }
    if (input.kind === "brief" || input.kind === "revision") {
      useWorkspaceSessionStore.getState().clearComposerDraft(originSessionId);
    }

    const outcome = await temporaryFixtureTurnAdapter.run(input, position);
    if (outcome.ok) {
      useWorkspaceSessionStore.getState().applyTurnResult(originSessionId, turnId, outcome, input);
    } else {
      useWorkspaceSessionStore.getState().applyTurnFailure(originSessionId, turnId, {
        site:
          input.kind === "approval"
            ? { kind: "creation" }
            : input.kind === "edit" && input.operation.op === "replace_block"
              ? { kind: "replacement", blockIndex: input.operation.index }
              : input.kind === "edit" && input.operation.op === "set_leaf"
                ? { kind: "edit", path: input.operation.path }
                : input.kind === "revision" && input.scope
                  ? { kind: "ask", fieldLabel: input.scope }
                  : { kind: "agent" },
        error: outcome.error,
        retry: input,
      });
    }
  }, []);

  return { dispatch };
}
