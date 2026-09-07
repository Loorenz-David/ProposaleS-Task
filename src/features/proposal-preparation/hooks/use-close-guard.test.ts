import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import { fixturePropositionV1 } from "../client/fixtures/proposition.fixture";
import { fixtureTerminalWorkflowState, fixtureWorkflowState } from "../client/fixtures/workflow-state.fixture";
import { createWorkspaceSessionState, useWorkspaceSessionStore } from "./use-workspace-session-store";
import { useCloseGuard } from "./use-close-guard";
import type { SessionRuntimeRecord, WorkspaceSessionId } from "../types/session";

beforeEach(() => {
  useWorkspaceSessionStore.setState(createWorkspaceSessionState());
});

function id() {
  const sessionId = useWorkspaceSessionStore.getState().activeSessionId;
  if (!sessionId) throw new Error("session missing");
  return sessionId;
}

function record(sessionId: WorkspaceSessionId): SessionRuntimeRecord {
  return useWorkspaceSessionStore.getState().sessions[sessionId];
}

function update(sessionId: WorkspaceSessionId, changes: Partial<SessionRuntimeRecord>) {
  useWorkspaceSessionStore.setState({
    sessions: {
      ...useWorkspaceSessionStore.getState().sessions,
      [sessionId]: { ...record(sessionId), ...changes },
    },
  });
}

describe("useCloseGuard", () => {
  it.each([
    ["started turn", { hasStartedTurn: true }],
    ["thread", { thread: [{ entryId: "entry", kind: "human" as const, text: "x", scope: null }] }],
    ["proposition", { workflow: fixtureWorkflowState() }],
    ["clarification", { workflow: fixtureWorkflowState({ clarification: { questions: [], answers: [] } }) }],
    ["draft reference", { workflow: fixtureTerminalWorkflowState() }],
    ["in-flight turn", { inFlightTurn: { turnId: "t", kind: "brief" as const } }],
  ])("R3.1–R3.6: confirms for %s", (_label, changes) => {
    const sessionId = id();
    update(sessionId, changes);
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(sessionId));
    expect(result.current.dialog.open).toBe(true);
    expect(useWorkspaceSessionStore.getState().sessions[sessionId]).toBeDefined();
  });

  it("R3.7: closes an empty session immediately", () => {
    const sessionId = id();
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(sessionId));
    expect(result.current.dialog.open).toBe(false);
    expect(useWorkspaceSessionStore.getState().sessionIds).toHaveLength(1);
    expect(useWorkspaceSessionStore.getState().sessionIds[0]).not.toBe(sessionId);
  });

  it("R3.8: protects a pasted whitespace-only draft even while status is empty", () => {
    const sessionId = id();
    update(sessionId, { composerDraft: "  " });
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(sessionId));
    expect(result.current.dialog.open).toBe(true);
  });

  it("R3.9: has no status dependency in either direction", () => {
    const source = readFileSync(path.join(__dirname, "use-close-guard.ts"), "utf8");
    const tabSource = readFileSync(path.join(__dirname, "../client/view-models/session-tab.ts"), "utf8");
    expect(source).not.toMatch(/deriveTabStatus|TabStatus/);
    expect(tabSource).not.toContain("useCloseGuard");
  });

  it("R3.10: confirms for the requested background session", () => {
    const target = useWorkspaceSessionStore.getState().createSession();
    const active = useWorkspaceSessionStore.getState().sessionIds[0];
    if (active) useWorkspaceSessionStore.getState().activateSession(active);
    update(target, { composerDraft: "background" });
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(target));
    expect(result.current.dialog.title).toContain("New proposal session");
    expect(useWorkspaceSessionStore.getState().activeSessionId).not.toBe(target);
  });

  it("R3.11: cancel leaves the last meaningful session byte-identical", () => {
    const sessionId = id();
    update(sessionId, { composerDraft: "keep me" });
    const before = {
      sessionIds: [...useWorkspaceSessionStore.getState().sessionIds],
      activeSessionId: useWorkspaceSessionStore.getState().activeSessionId,
      record: { ...useWorkspaceSessionStore.getState().sessions[sessionId] },
    };
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(sessionId));
    act(() => result.current.dialog.onCancel());
    const after = useWorkspaceSessionStore.getState();
    expect(after.sessionIds).toEqual(before.sessionIds);
    expect(after.activeSessionId).toBe(before.activeSessionId);
    expect(after.sessions[sessionId]).toEqual(before.record);
  });

  it("R3.12: refuses approval creation without dialog or removal", () => {
    const sessionId = id();
    update(sessionId, { inFlightTurn: { turnId: "approval", kind: "approval" } });
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(sessionId));
    expect(result.current.dialog.open).toBe(false);
    expect(result.current.refusal?.message).toBe("This session cannot be closed while its draft is being created.");
    expect(useWorkspaceSessionStore.getState().sessionIds).toContain(sessionId);
    act(() => {
      useWorkspaceSessionStore.setState({
        sessions: { ...useWorkspaceSessionStore.getState().sessions, [sessionId]: { ...record(sessionId), inFlightTurn: null } },
      });
    });
    expect(result.current.refusal).toBeNull();
  });

  it("R3.13: names the session title in the confirmation", () => {
    const sessionId = id();
    update(sessionId, { title: "Named session", composerDraft: "x" });
    const { result } = renderHook(() => useCloseGuard());
    act(() => result.current.requestClose(sessionId));
    expect(result.current.dialog.title).toContain("Named session");
    expect(result.current.dialog.description).toContain("Named session");
  });

  it("R3.14: evaluates the target at intent time", () => {
    const sessionId = id();
    const { result } = renderHook(() => useCloseGuard());
    update(sessionId, { composerDraft: "" });
    act(() => result.current.requestClose(sessionId));
    update(sessionId, { composerDraft: "changed after render" });
    act(() => result.current.requestClose(sessionId));
    expect(result.current.dialog.open).toBe(true);
  });

  it("R3.15: records the amended single close path", () => {
    const strip = readFileSync(path.join(__dirname, "../components/session-tabs/session-tab-strip.tsx"), "utf8");
    const guard = readFileSync(path.join(__dirname, "use-close-guard.ts"), "utf8");
    expect(strip.match(/\bcloseSession\(/g) ?? []).toHaveLength(0);
    expect(guard.match(/\bcloseSession\(/g) ?? []).toHaveLength(1);
  });
});
