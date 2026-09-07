import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import { fixtureErrorDto } from "../client/fixtures/failures.fixture";
import { setTurnTransportForTests } from "../client/turn-transport";
import { fixtureClarificationOutcome } from "../client/fixtures/turn-outcome.fixture";
import { fixturePropositionV1 } from "../client/fixtures/proposition.fixture";
import { createWorkspaceSessionState, useWorkspaceSessionStore } from "./use-workspace-session-store";
import { useTurnDispatch } from "./use-turn-dispatch";
import type { WorkspaceSessionId } from "../types/session";

const SOURCE = readFileSync(path.join(__dirname, "use-turn-dispatch.ts"), "utf8");

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function activeId() {
  const id = useWorkspaceSessionStore.getState().activeSessionId;
  if (!id) throw new Error("active session missing");
  return id;
}

function briefOutcome() {
  return fixtureClarificationOutcome();
}

beforeEach(() => {
  useWorkspaceSessionStore.setState(createWorkspaceSessionState());
});

afterEach(() => {
  setTurnTransportForTests(null);
});

describe("useTurnDispatch", () => {
  it("R1.1/R1.2: keeps the captured origin and increments only its background unread", async () => {
    const first = activeId();
    const wait = deferred<ReturnType<typeof briefOutcome>>();
    setTurnTransportForTests({ run: async () => wait.promise });
    const { result } = renderHook(() => useTurnDispatch());
    const secondSnapshot = useWorkspaceSessionStore.getState().createSession();
    const secondBefore = structuredClone(useWorkspaceSessionStore.getState().sessions[secondSnapshot]);

    let dispatchPromise!: Promise<void>;
    act(() => {
      dispatchPromise = result.current.dispatch(first, { kind: "brief", text: "brief" });
    });
    expect(useWorkspaceSessionStore.getState().sessions[first]?.inFlightTurn).not.toBeNull();
    wait.resolve(briefOutcome());
    await dispatchPromise;

    const state = useWorkspaceSessionStore.getState();
    expect(state.sessions[first]?.latestResult?.status).toBe("clarification");
    expect(state.sessions[first]?.unread).toBe(1);
    expect(state.sessions[secondSnapshot]).toEqual(secondBefore);
    expect(state.activeSessionId).toBe(secondSnapshot);
  });

  it("R1.3: never reads activeSessionId in the dispatch module", () => {
    expect(SOURCE.length).toBeGreaterThan(0);
    expect(SOURCE).not.toContain("activeSessionId");
  });

  it("R1.4/R1.6: discards a superseded id and an empty slot", () => {
    const id = activeId();
    const before = structuredClone(useWorkspaceSessionStore.getState().sessions[id]);
    const outcome = briefOutcome();
    useWorkspaceSessionStore.getState().applyTurnResult(id, "stale", outcome, { kind: "brief", text: "x" });
    expect(useWorkspaceSessionStore.getState().sessions[id]).toEqual(before);
  });

  it("R1.5: discards an origin that was closed before resolution", async () => {
    const origin = activeId();
    const wait = deferred<ReturnType<typeof briefOutcome>>();
    setTurnTransportForTests({ run: async () => wait.promise });
    const { result } = renderHook(() => useTurnDispatch());
    let dispatchPromise!: Promise<void>;
    act(() => {
      dispatchPromise = result.current.dispatch(origin, { kind: "brief", text: "x" });
    });
    const neighbour = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.getState().closeSession(origin);
    const replacement = useWorkspaceSessionStore.getState().createSession();
    wait.resolve(briefOutcome());
    await dispatchPromise;
    expect(useWorkspaceSessionStore.getState().sessions[neighbour]?.latestResult).toBeNull();
    expect(useWorkspaceSessionStore.getState().sessions[replacement]?.latestResult).toBeNull();
    expect(useWorkspaceSessionStore.getState().sessionIds).not.toContain(origin);
  });

  it("R1.7: submits only one approval while the origin is pending", async () => {
    const id = activeId();
    const wait = deferred<ReturnType<typeof briefOutcome>>();
    setTurnTransportForTests({ run: async () => wait.promise });
    const { result } = renderHook(() => useTurnDispatch());
    const input = {
      kind: "approval" as const,
      workflow: { currentProposition: fixturePropositionV1 },
      proposition: fixturePropositionV1,
      acknowledgment: { statementId: "id", wording: "wording" },
    };
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.dispatch(id, input);
      second = result.current.dispatch(id, input);
    });
    expect(useWorkspaceSessionStore.getState().sessions[id]?.inFlightTurn?.kind).toBe("approval");
    const currentTurnId = useWorkspaceSessionStore.getState().sessions[id]?.inFlightTurn?.turnId;
    wait.resolve(briefOutcome());
    await Promise.all([first, second]);
    expect(currentTurnId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("R1.8: attributes a failure to the origin without unread", async () => {
    const id = activeId();
    setTurnTransportForTests({
      run: async () => ({ ok: false as const, error: fixtureErrorDto("integration_error") }),
    });
    const { result } = renderHook(() => useTurnDispatch());
    await act(() => result.current.dispatch(id, { kind: "brief", text: "x" }));
    const record = useWorkspaceSessionStore.getState().sessions[id];
    expect(record?.inFlightTurn).toBeNull();
    expect(record?.callFailure?.error.code).toBe("integration_error");
    expect(record?.unread).toBe(0);
  });

  it("R1.9: uses UUID turn ids and keeps the store counter guard intact", () => {
    const id = activeId();
    setTurnTransportForTests({ run: async () => new Promise(() => {}) });
    const { result } = renderHook(() => useTurnDispatch());
    act(() => {
      void result.current.dispatch(id, { kind: "brief", text: "x" });
    });
    expect(useWorkspaceSessionStore.getState().sessions[id]?.inFlightTurn?.turnId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    const storeSource = readFileSync(path.join(__dirname, "use-workspace-session-store.ts"), "utf8");
    expect(storeSource).not.toMatch(/let\s+(?:sessionSeq|counter)/);
  });

  it("R2.1: keeps composer drafts with their own session", () => {
    const first = activeId();
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.getState().setComposerDraft(first, "A draft");
    useWorkspaceSessionStore.getState().setComposerDraft(second, "B draft");
    useWorkspaceSessionStore.getState().activateSession(first);
    expect(useWorkspaceSessionStore.getState().sessions[first]?.composerDraft).toBe("A draft");
    useWorkspaceSessionStore.getState().activateSession(second);
    expect(useWorkspaceSessionStore.getState().sessions[second]?.composerDraft).toBe("B draft");
    useWorkspaceSessionStore.getState().activateSession(first);
    expect(useWorkspaceSessionStore.getState().sessions[first]?.composerDraft).toBe("A draft");
  });

  it("R2.2/R2.3: clears only the sending draft and leaves another session's pending control independent", async () => {
    const first = activeId();
    const second = useWorkspaceSessionStore.getState().createSession();
    const wait = deferred<ReturnType<typeof briefOutcome>>();
    setTurnTransportForTests({ run: async () => wait.promise });
    useWorkspaceSessionStore.getState().setComposerDraft(first, "A draft");
    useWorkspaceSessionStore.getState().setComposerDraft(second, "B draft");
    const { result } = renderHook(() => useTurnDispatch());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.dispatch(first, { kind: "brief", text: "A draft" });
    });
    expect(useWorkspaceSessionStore.getState().sessions[first]?.composerDraft).toBe("");
    expect(useWorkspaceSessionStore.getState().sessions[second]?.composerDraft).toBe("B draft");
    expect(useWorkspaceSessionStore.getState().sessions[second]?.inFlightTurn).toBeNull();
    wait.resolve(briefOutcome());
    await pending;
  });

  it("R2.4/R2.5: keeps a draft through clarification dismissal and does not trim it", () => {
    const id = activeId();
    const store = useWorkspaceSessionStore.getState();
    store.setComposerDraft(id, "  ");
    useWorkspaceSessionStore.setState({
      sessions: {
        ...useWorkspaceSessionStore.getState().sessions,
        [id]: {
          ...useWorkspaceSessionStore.getState().sessions[id],
          latestResult: { status: "clarification", clarification: { questions: [], answers: [] } },
          clarificationPanel: "open",
        },
      },
    });
    store.dismissClarificationPanel(id);
    expect(useWorkspaceSessionStore.getState().sessions[id]?.composerDraft).toBe("  ");
    const source = readFileSync(path.join(__dirname, "../components/workspace/agent-surface.tsx"), "utf8");
    expect(source).not.toContain("composerDraft.trim()");
  });

  it("R5.1/R5.3: dispatches one edit with its array path and marks only that leaf saving", () => {
    const id = activeId();
    const wait = deferred<ReturnType<typeof briefOutcome>>();
    let received: unknown;
    setTurnTransportForTests({
      run: async (input) => {
        received = input;
        return wait.promise;
      },
    });
    const { result } = renderHook(() => useTurnDispatch());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.dispatch(id, {
        kind: "edit",
        operation: { op: "set_leaf", path: ["blocks", "0", "quantity"], value: "2" },
      });
    });
    expect(received).toEqual({
      kind: "edit",
      operation: { op: "set_leaf", path: ["blocks", "0", "quantity"], value: "2" },
    });
    expect(useWorkspaceSessionStore.getState().sessions[id]?.inFlightTurn).toEqual({
      turnId: expect.any(String),
      kind: "edit",
      path: ["blocks", "0", "quantity"],
    });
    wait.resolve(briefOutcome());
    return pending;
  });

  it("R5.7: ask-agent uses the field label in the revision and preserves its scope", async () => {
    const id = activeId();
    const wait = deferred<ReturnType<typeof briefOutcome>>();
    setTurnTransportForTests({ run: async () => wait.promise });
    const { result } = renderHook(() => useTurnDispatch());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.dispatch(id, {
        kind: "revision",
        instruction: "About Title: Make it clearer",
        scope: "Title",
      });
    });
    expect(useWorkspaceSessionStore.getState().sessions[id]?.thread[0]).toMatchObject({
      kind: "human",
      text: "About Title: Make it clearer",
      scope: "Title",
    });
    wait.resolve(briefOutcome());
    await pending;
    expect(useWorkspaceSessionStore.getState().sessions[id]?.thread[1]).toMatchObject({
      kind: "result",
      scope: "Title",
    });
  });
});
