import { act, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { temporaryFixtureSessionRuntimeRecord } from "../../client/fixtures/session-runtime.temporary-fixture";
import { useWorkspaceSessionStore } from "../../hooks/use-workspace-session-store";
import { AgentStatusLine } from "./agent-status-line";
import { AgentSurface } from "../workspace/agent-surface";
import { ProposalWorkspace } from "../workspace/proposal-workspace";

beforeEach(() => {
  useWorkspaceSessionStore.setState({
    activeSessionId: null,
    sessionIds: [],
    sessions: {},
  });
  useWorkspaceSessionStore.setState(() => {
    const record = temporaryFixtureSessionRuntimeRecord();
    return { activeSessionId: record.id, sessionIds: [record.id], sessions: { [record.id]: record } };
  });
});

function activeRecord() {
  const id = useWorkspaceSessionStore.getState().activeSessionId;
  if (!id) throw new Error("active session missing");
  return useWorkspaceSessionStore.getState().sessions[id];
}

describe("AgentStatusLine", () => {
  it("C3(a): the tab accessible name carries the title and status text", () => {
    render(<AgentSurface />);
    expect(screen.getByRole("tab")).toHaveAccessibleName("New proposal session — Empty");
  });

  it("C3(c), C6(b): the tab dot and status line change from the same runtime source", () => {
    render(<AgentSurface />);
    const tab = screen.getByRole("tab");
    const statusLine = screen.getByTestId("agent-status-line");
    const dot = screen.getByTestId("session-status-dot");
    expect(statusLine).toHaveTextContent("Empty");
    expect(dot).toHaveAttribute("data-status", "empty");

    act(() => {
      const record = activeRecord();
      useWorkspaceSessionStore.setState({
        sessions: { ...useWorkspaceSessionStore.getState().sessions, [record.id]: { ...record, hasStartedTurn: true } },
      });
    });

    expect(tab).toHaveAccessibleName("New proposal session — Open");
    expect(statusLine).toHaveTextContent("Open");
    expect(dot).toHaveAttribute("data-status", "idle");
  });

  it("C3(e): does not use thread content, string tests, or elapsed time as a status source", () => {
    const source = [
      readFileSync(path.join(__dirname, "agent-status-line.tsx"), "utf8"),
      readFileSync(path.join(__dirname, "../../client/view-models/session-tab.ts"), "utf8"),
    ].join("\n");
    expect(source.length).toBeGreaterThan(0);
    expect(source).not.toMatch(/thread content|Date\.now\(|setTimeout\(|status\.includes\(/);
  });

  it("C7(a): changing status never replaces the shell landmarks", () => {
    render(<ProposalWorkspace />);
    const complementary = screen.getByRole("complementary");
    const main = screen.getByRole("main");
    const record = activeRecord();
    const statuses = [
      { isTurnInFlight: true },
      { hasDraftReference: true },
      { latestDomainResultKind: "clarification" as const },
      { hasCurrentProposition: true },
      { hasStartedTurn: true },
      {},
    ];

    for (const changes of statuses) {
      act(() => {
        useWorkspaceSessionStore.setState({
          sessions: { ...useWorkspaceSessionStore.getState().sessions, [record.id]: { ...record, ...changes } },
        });
      });
      expect(screen.getAllByRole("complementary")).toHaveLength(1);
      expect(screen.getAllByRole("main")).toHaveLength(1);
      expect(screen.getByRole("complementary")).toBe(complementary);
      expect(screen.getByRole("main")).toBe(main);
    }
  });
});
