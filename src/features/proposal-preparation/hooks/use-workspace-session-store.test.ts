import { readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { beforeEach, describe, expect, it } from "vitest";

import {
  createWorkspaceSessionState,
  useWorkspaceSessionStore,
} from "./use-workspace-session-store";
import { fixtureErrorDto } from "../client/fixtures/failures.fixture";
import { fixtureClarificationOutcome } from "../client/fixtures/turn-outcome.fixture";
import type { WorkspaceSessionId } from "../types/session";

const SOURCE = readFileSync(path.join(__dirname, "use-workspace-session-store.ts"), "utf8");

beforeEach(() => {
  useWorkspaceSessionStore.setState(createWorkspaceSessionState());
});

describe("session identity", () => {
  it("C1(a): creates stable ids across create, move and close", () => {
    const store = useWorkspaceSessionStore.getState();
    const first = store.activeSessionId as NonNullable<typeof store.activeSessionId>;
    const second = store.createSession();
    const third = store.createSession();
    store.moveSession(2, 0);
    expect(useWorkspaceSessionStore.getState().sessions[first]).toBeDefined();
    expect(new Set(useWorkspaceSessionStore.getState().sessionIds).size).toBe(3);
    useWorkspaceSessionStore.getState().closeSession(second);
    expect(useWorkspaceSessionStore.getState().sessions[first]?.id).toBe(first);
    expect(useWorkspaceSessionStore.getState().sessions[third]?.id).toBe(third);
  });

  it("C1(b): construction site has one permitted generator and no positional source", () => {
    const file = ts.createSourceFile("use-workspace-session-store.ts", SOURCE, ts.ScriptTarget.Latest, true);
    const record = file.statements.find(
      (statement): statement is ts.FunctionDeclaration =>
        ts.isFunctionDeclaration(statement) && statement.name?.text === "createSessionRecord",
    );
    expect(record).toBeDefined();
    const calls: string[] = [];
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) calls.push(node.getText(file));
      node.forEachChild(visit);
    }
    record?.forEachChild(visit);
    expect(calls).toEqual(["createSessionId()"]);
    expect(SOURCE).not.toMatch(/let\s+(?:sessionSeq|counter)|sessionIds\[[^\]]+\]\s*as/);
    expect(SOURCE).toContain("const id = createSessionId();");
  });
});

describe("session ordering", () => {
  it("C2(a,b,d,h): moves one item, preserves active identity and handles stale drag indexes", () => {
    const store = useWorkspaceSessionStore.getState();
    const first = store.activeSessionId as NonNullable<typeof store.activeSessionId>;
    const second = store.createSession();
    const third = store.createSession();
    store.moveSession(0, 2);
    expect(useWorkspaceSessionStore.getState().sessionIds).toEqual([second, third, first]);
    expect(useWorkspaceSessionStore.getState().activeSessionId).toBe(third);
    useWorkspaceSessionStore.getState().closeSession(second);
    useWorkspaceSessionStore.getState().moveSession(0, 1);
    expect(useWorkspaceSessionStore.getState().sessionIds).toEqual([first, third]);
    useWorkspaceSessionStore.getState().moveSession(-1, 10);
    expect(useWorkspaceSessionStore.getState().sessionIds).toEqual([first, third]);
  });

  it("C2(c)-i: same-index move preserves the list reference", () => {
    const before = useWorkspaceSessionStore.getState().sessionIds;
    useWorkspaceSessionStore.getState().moveSession(0, 0);
    expect(useWorkspaceSessionStore.getState().sessionIds).toBe(before);
  });

  it("C2(e): pointer and keyboard adapters use the same move function contract", () => {
    const store = useWorkspaceSessionStore.getState();
    store.createSession();
    store.createSession();
    const move = useWorkspaceSessionStore.getState().moveSession;
    const snapshot = useWorkspaceSessionStore.getState();
    move(0, 2);
    const pointerResult = useWorkspaceSessionStore.getState().sessionIds;
    useWorkspaceSessionStore.setState({
      activeSessionId: snapshot.activeSessionId,
      sessionIds: [...snapshot.sessionIds],
      sessions: { ...snapshot.sessions },
    });
    move(0, 2);
    const keyboardResult = useWorkspaceSessionStore.getState().sessionIds;
    expect(pointerResult).toEqual(keyboardResult);
  });
});

describe("session close", () => {
  it("C3(e): never publishes an empty transition", () => {
    const transitions: string[][] = [];
    const unsubscribe = useWorkspaceSessionStore.subscribe((state) => transitions.push(state.sessionIds));
    useWorkspaceSessionStore.getState().closeSession(useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId);
    unsubscribe();
    expect(transitions.every((ids) => ids.length > 0)).toBe(true);
  });

  it("C3(g): never reuses a closed id", () => {
    const first = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.getState().closeSession(first);
    const third = useWorkspaceSessionStore.getState().createSession();
    expect(new Set([first, second, third]).size).toBe(3);
  });

  it("C3(i): the only store removal call is behind the named guard module", () => {
    const strip = readFileSync(
      path.resolve(__dirname, "../components/session-tabs/session-tab-strip.tsx"),
      "utf8",
    );
    expect(strip).toMatch(/function|const\s+closeSessionAtGate/);
    expect(strip.match(/\bcloseSession\(/g) ?? []).toHaveLength(0);
    expect(strip).toContain("closeSessionAtGate(sessionId)");
    const guard = readFileSync(path.resolve(__dirname, "use-close-guard.ts"), "utf8");
    expect(guard.match(/\bcloseSession\(/g) ?? []).toHaveLength(1);
  });
});

describe("new session", () => {
  it("C7(a,b,c): appends, activates and isolates an empty runtime record", () => {
    const first = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const second = useWorkspaceSessionStore.getState().createSession();
    const state = useWorkspaceSessionStore.getState();
    expect(state.sessionIds).toEqual([first, second]);
    expect(state.activeSessionId).toBe(second);
    expect(state.sessions[second]).not.toBe(state.sessions[first]);
    expect(state.sessions[second]).toEqual({
      id: second,
      title: "New proposal session",
      thread: [],
      latestResult: null,
      workflow: null,
      conversation: null,
      inFlightTurn: null,
      hasStartedTurn: false,
      unread: 0,
      composerDraft: "",
      retained: { workSurface: "fields", openedBlockContentId: null },
      clarificationPanel: "dismissed",
      callFailure: null,
    });
  });
});

describe("turn result ownership", () => {
  it("applies a matching turn to its origin session even after another session activates", async () => {
    const originSessionId = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const turn = { turnId: "turn-origin", kind: "brief" as const };
    const input = { kind: "brief" as const, text: "Messy brief" };
    useWorkspaceSessionStore.getState().startTurn(originSessionId, turn, {
      text: input.text,
      scope: null,
    });
    useWorkspaceSessionStore.getState().createSession();

    const outcome = fixtureClarificationOutcome();
    useWorkspaceSessionStore.getState().applyTurnResult(originSessionId, turn.turnId, outcome, input);

    const state = useWorkspaceSessionStore.getState();
    expect(state.sessions[originSessionId]?.latestResult).toEqual(outcome.ok ? outcome.result : null);
    expect(state.sessions[state.activeSessionId as WorkspaceSessionId]?.latestResult).toBeNull();
  });

  it("ignores a stale turn id without disturbing the current in-flight turn", async () => {
    const sessionId = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const input = { kind: "brief" as const, text: "Messy brief" };
    useWorkspaceSessionStore.getState().startTurn(sessionId, {
      turnId: "turn-current",
      kind: "brief",
    });
    const outcome = fixtureClarificationOutcome();
    useWorkspaceSessionStore.getState().applyTurnResult(sessionId, "turn-stale", outcome, input);

    expect(useWorkspaceSessionStore.getState().sessions[sessionId]?.inFlightTurn?.turnId).toBe(
      "turn-current",
    );
    expect(useWorkspaceSessionStore.getState().sessions[sessionId]?.latestResult).toBeNull();
  });

  it("retains the exact retry input and maps the failure site without commercial reasoning", () => {
    const sessionId = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const input = { kind: "revision" as const, instruction: "Make this clearer", scope: "Title" };
    useWorkspaceSessionStore.getState().startTurn(sessionId, {
      turnId: "turn-failed",
      kind: "revision",
    });
    useWorkspaceSessionStore.getState().applyTurnResult(
      sessionId,
      "turn-failed",
      { ok: false, error: fixtureErrorDto("integration_error") },
      input,
    );

    expect(useWorkspaceSessionStore.getState().sessions[sessionId]?.callFailure).toEqual({
      site: { kind: "ask", fieldLabel: "Title" },
      error: fixtureErrorDto("integration_error"),
      retry: input,
    });
  });
});

describe("unread ownership", () => {
  it("R7.1/R7.3: active application and dispatch do not increment unread", () => {
    const sessionId = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    useWorkspaceSessionStore.getState().startTurn(sessionId, { turnId: "active", kind: "brief" });
    expect(useWorkspaceSessionStore.getState().sessions[sessionId]?.unread).toBe(0);
    useWorkspaceSessionStore.getState().applyTurnResult(sessionId, "active", fixtureClarificationOutcome(), { kind: "brief", text: "x" });
    expect(useWorkspaceSessionStore.getState().sessions[sessionId]?.unread).toBe(0);
  });

  it("R7.2: activation clears unread to exactly zero", () => {
    const first = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.setState({
      sessions: {
        ...useWorkspaceSessionStore.getState().sessions,
        [first]: { ...useWorkspaceSessionStore.getState().sessions[first], unread: 4 },
      },
    });
    useWorkspaceSessionStore.getState().activateSession(first);
    expect(useWorkspaceSessionStore.getState().sessions[first]?.unread).toBe(0);
    expect(useWorkspaceSessionStore.getState().sessions[second]?.unread).toBe(0);
  });

  it("R7.4/R7.5: reorder leaves unread unchanged and no increment action exists", () => {
    const first = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.setState({
      sessions: {
        ...useWorkspaceSessionStore.getState().sessions,
        [first]: { ...useWorkspaceSessionStore.getState().sessions[first], unread: 2 },
        [second]: { ...useWorkspaceSessionStore.getState().sessions[second], unread: 3 },
      },
    });
    useWorkspaceSessionStore.getState().moveSession(0, 1);
    expect(useWorkspaceSessionStore.getState().sessions[first]?.unread).toBe(2);
    expect(useWorkspaceSessionStore.getState().sessions[second]?.unread).toBe(3);
    expect(SOURCE.length).toBeGreaterThan(0);
    expect(SOURCE).not.toContain("incrementUnread");
    expect(SOURCE).not.toContain("attention:");
  });
});

describe("retained context", () => {
  it("R8.4/R8.7: keeps each session's deliberate context across activation", () => {
    const first = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.getState().setWorkSurface(first, "preview");
    useWorkspaceSessionStore.getState().setOpenedBlock(first, "block-a");
    useWorkspaceSessionStore.getState().setWorkSurface(second, "fields");
    useWorkspaceSessionStore.getState().activateSession(first);
    useWorkspaceSessionStore.getState().activateSession(second);
    useWorkspaceSessionStore.getState().activateSession(first);
    expect(useWorkspaceSessionStore.getState().sessions[first]?.retained).toEqual({ workSurface: "preview", openedBlockContentId: "block-a" });
    expect(useWorkspaceSessionStore.getState().sessions[second]?.retained).toEqual({ workSurface: "fields", openedBlockContentId: null });
  });

  it("R8.5: result and failure application preserve retained object identity", () => {
    const first = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.getState().setWorkSurface(first, "preview");
    useWorkspaceSessionStore.getState().setWorkSurface(second, "preview");
    const firstRetained = useWorkspaceSessionStore.getState().sessions[first]!.retained;
    const secondRetained = useWorkspaceSessionStore.getState().sessions[second]!.retained;
    useWorkspaceSessionStore.getState().startTurn(first, { turnId: "first", kind: "brief" });
    useWorkspaceSessionStore.getState().applyTurnResult(first, "first", fixtureClarificationOutcome(), { kind: "brief", text: "x" });
    useWorkspaceSessionStore.getState().startTurn(second, { turnId: "second", kind: "brief" });
    useWorkspaceSessionStore.getState().applyTurnFailure(second, "second", {
      site: { kind: "agent" },
      error: fixtureErrorDto("integration_error"),
      retry: { kind: "brief", text: "x" },
    });
    expect(useWorkspaceSessionStore.getState().sessions[first]?.retained).toBe(firstRetained);
    expect(useWorkspaceSessionStore.getState().sessions[second]?.retained).toBe(secondRetained);
  });

  it("R8.1: ignores a work-surface value outside the closed runtime domain", () => {
    const id = useWorkspaceSessionStore.getState().activeSessionId as WorkspaceSessionId;
    const before = useWorkspaceSessionStore.getState().sessions[id]?.retained;
    useWorkspaceSessionStore.getState().setWorkSurface(id, "invalid" as never);
    expect(useWorkspaceSessionStore.getState().sessions[id]?.retained).toBe(before);
  });
});
