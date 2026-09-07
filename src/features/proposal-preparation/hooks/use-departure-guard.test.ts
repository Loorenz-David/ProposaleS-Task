import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createWorkspaceSessionState, useWorkspaceSessionStore } from "./use-workspace-session-store";
import { useDepartureGuard } from "./use-departure-guard";

beforeEach(() => {
  useWorkspaceSessionStore.setState(createWorkspaceSessionState());
});

describe("useDepartureGuard", () => {
  it("R6.10: protects only while any open non-terminal session is creating", () => {
    const { unmount } = renderHook(() => useDepartureGuard());
    const first = useWorkspaceSessionStore.getState().activeSessionId;
    if (!first) throw new Error("session missing");
    const second = useWorkspaceSessionStore.getState().createSession();
    useWorkspaceSessionStore.getState().activateSession(first);

    const noCreation = new Event("beforeunload", { cancelable: true });
    act(() => window.dispatchEvent(noCreation));
    expect(noCreation.defaultPrevented).toBe(false);

    useWorkspaceSessionStore.setState({
      sessions: {
        ...useWorkspaceSessionStore.getState().sessions,
        [second]: {
          ...useWorkspaceSessionStore.getState().sessions[second],
          inFlightTurn: { turnId: "approval", kind: "approval" },
        },
      },
    });
    const backgroundCreation = new Event("beforeunload", { cancelable: true });
    act(() => window.dispatchEvent(backgroundCreation));
    expect(backgroundCreation.defaultPrevented).toBe(true);

    useWorkspaceSessionStore.setState({
      sessions: {
        ...useWorkspaceSessionStore.getState().sessions,
        [second]: {
          ...useWorkspaceSessionStore.getState().sessions[second],
          workflow: { draftReference: { proposalUuid: "p", editorUrl: "https://example.invalid" } },
        },
      },
    });
    const terminal = new Event("beforeunload", { cancelable: true });
    act(() => window.dispatchEvent(terminal));
    expect(terminal.defaultPrevented).toBe(false);
    unmount();
  });
});
