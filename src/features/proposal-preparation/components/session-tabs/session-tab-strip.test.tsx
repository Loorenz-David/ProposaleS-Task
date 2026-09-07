import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { ProposalWorkspace } from "../workspace/proposal-workspace";
import {
  createWorkspaceSessionState,
  useWorkspaceSessionStore,
} from "../../hooks/use-workspace-session-store";
import { reorderTabInteraction, SessionTabStrip } from "./session-tab-strip";

beforeEach(() => {
  useWorkspaceSessionStore.setState(createWorkspaceSessionState());
});

function addSessions(count: number) {
  for (let index = 0; index < count; index += 1) useWorkspaceSessionStore.getState().createSession();
}

function tabs() {
  return screen.getAllByRole("tab");
}

describe("SessionTabStrip", () => {
  it("C2(c)-ii, C2(c)-iii: same-index interaction does not announce or focus", () => {
    let announcements = 0;
    let focusChanges = 0;
    reorderTabInteraction({
      fromIndex: 1,
      toIndex: 1,
      sessionCount: 3,
      announce: true,
      onMove: () => undefined,
      onFocus: () => {
        focusChanges += 1;
      },
      onAnnounce: () => {
        announcements += 1;
      },
    });
    expect(announcements).toBe(0);
    expect(focusChanges).toBe(0);
  });

  it("C2(c)-ii, C2(c)-iii: same-index reorder is silent and keeps focus", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const first = tabs()[0];
    const firstClose = screen.getAllByRole("button", { name: "Close session New proposal session" })[0];
    firstClose.focus();
    const live = screen.getByText("", { selector: "[data-session-reorder-announcement]" });
    const before = live.childNodes.length;
    fireEvent.keyDown(first, { key: "ArrowLeft", ctrlKey: true, shiftKey: true });
    expect(document.activeElement).toBe(firstClose);
    expect(live.childNodes.length).toBe(before);
  });

  it("C2(e,f,g): keyboard reorder moves the focused tab and announces its position", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const second = tabs()[1];
    second.focus();
    fireEvent.keyDown(second, { key: "ArrowLeft", ctrlKey: true, shiftKey: true });
    expect(document.activeElement).toBe(tabs()[0]);
    expect(screen.getByText("Moved to position 1 of 3", { selector: "[data-session-reorder-announcement]" })).toBeInTheDocument();
  });

  it("C3(a,f): closing a focused background tab focuses the tab at its old index", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const firstClose = screen.getAllByRole("button", { name: "Close session New proposal session" })[0];
    firstClose.focus();
    fireEvent.click(firstClose);
    expect(document.activeElement).toBe(tabs()[0]);
    expect(document.activeElement?.tagName).not.toBe("BODY");
  });

  it("C3(b,c,f): active middle and last closes choose and focus the stated neighbour", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const allTabs = tabs();
    fireEvent.focus(allTabs[1]);
    fireEvent.click(screen.getAllByRole("button", { name: "Close session New proposal session" })[1]);
    expect(tabs()).toHaveLength(2);
    expect(document.activeElement).toBe(tabs()[1]);
    fireEvent.click(screen.getAllByRole("button", { name: "Close session New proposal session" })[1]);
    expect(tabs()).toHaveLength(1);
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it("C3(d,e,f): closing the only tab atomically creates and focuses a replacement", () => {
    render(<SessionTabStrip />);
    const before = tabs()[0];
    fireEvent.click(screen.getByRole("button", { name: "Close session New proposal session" }));
    expect(tabs()).toHaveLength(1);
    expect(tabs()[0]).not.toBe(before);
    expect(document.activeElement).toBe(tabs()[0]);
    expect(screen.queryAllByRole("tab").length).toBeGreaterThan(0);
  });

  it("C3(h): active closing uses the same-index replacement, not the first tab", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    fireEvent.focus(tabs()[1]);
    fireEvent.click(screen.getAllByRole("button", { name: "Close session New proposal session" })[1]);
    expect(useWorkspaceSessionStore.getState().activeSessionId).toBe(useWorkspaceSessionStore.getState().sessionIds[1]);
  });

  it("C5(a,b): exposes a named horizontal tablist and one roving selected tab", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const list = screen.getByRole("tablist", { name: "Agent sessions" });
    expect(list).toHaveAttribute("aria-orientation", "horizontal");
    expect(tabs().filter((tab) => tab.getAttribute("aria-selected") === "true")).toHaveLength(1);
    expect(tabs().filter((tab) => tab.getAttribute("tabindex") === "0")).toHaveLength(1);
    expect(tabs().filter((tab) => tab.getAttribute("tabindex") === "-1")).toHaveLength(2);
  });

  it("C5(c): implements the complete horizontal key map and activation follows focus", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const [first, second, third] = tabs();
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(second);
    expect(second).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(second, { key: "ArrowDown" });
    expect(document.activeElement).toBe(second);
    third.focus();
    fireEvent.keyDown(third, { key: "End" });
    expect(document.activeElement).toBe(third);
    fireEvent.keyDown(third, { key: "PageUp" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "PageDown" });
    expect(document.activeElement).toBe(third);
    const source = readFileSync(path.join(__dirname, "session-tab-strip.tsx"), "utf8");
    expect(source).toContain("loop={false}");
  });

  it("C5(d): every tab has a keyboard-reachable sibling close control", () => {
    addSessions(2);
    render(<SessionTabStrip />);
    const list = screen.getByRole("tablist");
    for (const tab of tabs()) {
      const wrapper = tab.parentElement;
      expect(wrapper).not.toBeNull();
      const close = within(wrapper as HTMLElement).getByRole("button", { name: "Close session New proposal session" });
      expect(tab.parentElement).toBe(close.parentElement);
      close.focus();
      expect(document.activeElement).toBe(close);
    }
    expect(list.querySelectorAll(":scope > button")).toHaveLength(0);
  });

  it("C6(a,b): landmark count and identity remain stable after every operation", () => {
    render(<ProposalWorkspace />);
    const complementary = screen.getByRole("complementary");
    const main = screen.getByRole("main");
    const assertLandmarks = () => {
      expect(screen.getAllByRole("complementary")).toHaveLength(1);
      expect(screen.getAllByRole("main")).toHaveLength(1);
      expect(screen.getByRole("complementary")).toBe(complementary);
      expect(screen.getByRole("main")).toBe(main);
    };
    assertLandmarks();
    fireEvent.click(screen.getByRole("button", { name: "New session" }));
    assertLandmarks();
    fireEvent.focus(tabs()[0]);
    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    assertLandmarks();
    fireEvent.keyDown(tabs()[1], { key: "Control", ctrlKey: true, shiftKey: true });
    fireEvent.click(screen.getAllByRole("button", { name: "Close session New proposal session" })[0]);
    assertLandmarks();
  });

  it("C7(d,e): creates from a named keyboard-reachable sibling outside the tablist", () => {
    render(<SessionTabStrip />);
    const add = screen.getByRole("button", { name: "New session" });
    add.focus();
    expect(document.activeElement).toBe(add);
    expect(screen.getByRole("tablist")).not.toContainElement(add);
    expect(add.parentElement).toBe(screen.getByRole("tablist").parentElement);
  });
});
