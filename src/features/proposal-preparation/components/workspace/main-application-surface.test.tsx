import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { fixtureDraftResultCreated } from "../../client/fixtures/draft-result.fixture";
import { fixtureFailedResult } from "../../client/fixtures/failures.fixture";
import { setTurnTransportForTests } from "../../client/turn-transport";
import { fixtureWorkflowState } from "../../client/fixtures/workflow-state.fixture";
import { createWorkspaceSessionState, useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";
import { MainApplicationSurface } from "./main-application-surface";

beforeEach(() => {
  const state = createWorkspaceSessionState();
  const sessionId = state.activeSessionId;
  if (!sessionId) throw new Error("session missing");
  useWorkspaceSessionStore.setState({
    ...state,
    sessions: {
      ...state.sessions,
      [sessionId]: {
        ...state.sessions[sessionId],
        workflow: fixtureWorkflowState(),
      },
    },
  });
});

afterEach(() => setTurnTransportForTests(null));

describe("MainApplicationSurface machinery", () => {
  it("R6.1/R6.2/R6.4: dispatches approval as an intent, with the held state and no optimistic terminality", () => {
    // The component states that the human approved; it does not assemble the envelope. The
    // envelope's contents — the held state, that same state's proposition, and the shared
    // acknowledgment — are asserted where they are now composed, in turn-transport.test.ts.
    const source = readFileSync(path.join(__dirname, "main-application-surface.tsx"), "utf8");
    expect(source).not.toContain("pricingAcknowledgment");
    expect(source).not.toContain("proposition: surface.review");
    let received: unknown;
    let heldAtDispatch: unknown;
    setTurnTransportForTests({
      run: async (input, held) => {
        received = input;
        heldAtDispatch = held;
        return new Promise(() => {});
      },
    });
    render(<MainApplicationSurface />);
    fireEvent.click(screen.getByRole("button", { name: "Approve and create draft" }));
    const id = useWorkspaceSessionStore.getState().activeSessionId;
    if (!id) throw new Error("session missing");
    const record = useWorkspaceSessionStore.getState().sessions[id];
    expect(received).toEqual({ kind: "approval" });
    expect(heldAtDispatch).toEqual({ workflow: record.workflow, conversation: record.conversation });
    expect(record.workflow?.draftReference).toBeUndefined();
    expect(record.inFlightTurn?.kind).toBe("approval");
  });

  it("R6.5/R6.6/R6.8/R6.9: preserves the proposition across call failures and keeps failed results in the thread channel", () => {
    const id = useWorkspaceSessionStore.getState().activeSessionId;
    if (!id) throw new Error("session missing");
    const before = useWorkspaceSessionStore.getState().sessions[id].workflow?.currentProposition;
    useWorkspaceSessionStore.getState().startTurn(id, { turnId: "creation", kind: "approval" });
    useWorkspaceSessionStore.getState().applyTurnFailure(id, "creation", {
      site: { kind: "creation" },
      error: { code: "integration_error", message: "Creation failed", details: { retryable: true } },
      retry: { kind: "approval" },
    });
    const failed = useWorkspaceSessionStore.getState().sessions[id];
    expect(failed.workflow?.currentProposition).toEqual(before);
    expect(failed.callFailure?.error.message).toBe("Creation failed");
    expect(failed.inFlightTurn).toBeNull();

    useWorkspaceSessionStore.getState().startTurn(id, { turnId: "run", kind: "brief" });
    useWorkspaceSessionStore.getState().applyTurnResult(id, "run", {
      ok: true,
      result: fixtureFailedResult("budget_exhausted"),
      state: fixtureWorkflowState({ currentProposition: before }),
    }, { kind: "brief", text: "retry" });
    const runFailed = useWorkspaceSessionStore.getState().sessions[id];
    expect(runFailed.callFailure).toBeNull();
    expect(runFailed.thread.at(-1)).toMatchObject({ kind: "result", result: { status: "failed" } });
  });
});
