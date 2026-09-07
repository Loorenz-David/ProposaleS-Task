import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { temporaryFixtureDraftResultCreated } from "../../client/fixtures/draft-result.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../../client/fixtures/proposition.temporary-fixture";
import {
  setTemporaryTurnAdapterForTests,
} from "../../client/fixtures/turns.temporary-fixture";
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
        workflow: { currentProposition: temporaryFixturePropositionV1 },
      },
    },
  });
});

afterEach(() => setTemporaryTurnAdapterForTests(null));

describe("MainApplicationSurface machinery", () => {
  it("R6.1/R6.2/R6.4: submits the held proposition and imported acknowledgment without optimistic terminality", () => {
    const source = readFileSync(path.join(__dirname, "main-application-surface.tsx"), "utf8");
    expect(source).toContain("proposition: record.workflow!.currentProposition!");
    expect(source).not.toContain("proposition: surface.review");
    let received: unknown;
    setTemporaryTurnAdapterForTests({
      run: async (input) => {
        received = input;
        return new Promise(() => {});
      },
    });
    render(<MainApplicationSurface />);
    fireEvent.click(screen.getByRole("button", { name: "Approve and create draft" }));
    const id = useWorkspaceSessionStore.getState().activeSessionId;
    if (!id) throw new Error("session missing");
    const record = useWorkspaceSessionStore.getState().sessions[id];
    expect(received).toEqual({
      kind: "approval",
      workflow: record.workflow,
      proposition: record.workflow?.currentProposition,
      acknowledgment: {
        statementId: "temporary-library-pricing",
        wording: "Prices come from the content library and are applied by Proposales.",
      },
    });
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
      retry: {
        kind: "approval",
        workflow: { currentProposition: temporaryFixturePropositionV1 },
        proposition: temporaryFixturePropositionV1,
        acknowledgment: { statementId: "temporary-library-pricing", wording: "wording" },
      },
    });
    const failed = useWorkspaceSessionStore.getState().sessions[id];
    expect(failed.workflow?.currentProposition).toEqual(before);
    expect(failed.callFailure?.error.message).toBe("Creation failed");
    expect(failed.inFlightTurn).toBeNull();

    useWorkspaceSessionStore.getState().startTurn(id, { turnId: "run", kind: "brief" });
    useWorkspaceSessionStore.getState().applyTurnResult(id, "run", {
      ok: true,
      result: { status: "failed", failure: { reason: "budget_exhausted", budget: "wall_time" } },
      workflow: { currentProposition: before },
    }, { kind: "brief", text: "retry" });
    const runFailed = useWorkspaceSessionStore.getState().sessions[id];
    expect(runFailed.callFailure).toBeNull();
    expect(runFailed.thread.at(-1)).toMatchObject({ kind: "result", result: { status: "failed" } });
  });
});
