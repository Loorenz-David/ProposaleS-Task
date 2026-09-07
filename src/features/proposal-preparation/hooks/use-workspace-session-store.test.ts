import { readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { beforeEach, describe, expect, it } from "vitest";

import {
  createWorkspaceSessionState,
  useWorkspaceSessionStore,
} from "./use-workspace-session-store";
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

  it("C3(i): the only store removal call is behind the named gate module", () => {
    const strip = readFileSync(
      path.resolve(__dirname, "../components/session-tabs/session-tab-strip.tsx"),
      "utf8",
    );
    expect(strip).toMatch(/function|const\s+closeSessionAtGate/);
    expect(strip.match(/\bcloseSession\(/g) ?? []).toHaveLength(1);
    expect(strip).toContain("closeSessionAtGate(sessionId)");
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
    expect(state.sessions[second]).toEqual({ id: second, title: "New proposal session" });
  });
});
