"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import {
  useWorkspaceSessionStore,
  type WorkspaceSessionId,
} from "../../hooks/use-workspace-session-store";
import { ACTIVE_TAB_REVEAL_MARGIN_PX } from "./session-tabs-constants";
import { revealActiveTabScrollLeft } from "./reveal-active-tab";

type FocusRequest = { kind: "active" } | { kind: "index"; index: number } | { kind: "id"; id: WorkspaceSessionId };

export type ReorderInteraction = {
  fromIndex: number;
  toIndex: number;
  sessionCount: number;
  announce: boolean;
  onMove: () => void;
  onFocus: () => void;
  onAnnounce: (position: number, total: number) => void;
};

export function reorderTabInteraction({
  fromIndex,
  toIndex,
  sessionCount,
  announce,
  onMove,
  onFocus,
  onAnnounce,
}: ReorderInteraction) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= sessionCount) return;
  onMove();
  onFocus();
  if (announce) onAnnounce(toIndex + 1, sessionCount);
}

function tabPanelId(sessionId: WorkspaceSessionId) {
  return `session-tab-panel-${sessionId}`;
}

export function SessionTabStrip() {
  const activeSessionId = useWorkspaceSessionStore((state) => state.activeSessionId);
  const sessionIds = useWorkspaceSessionStore((state) => state.sessionIds);
  const sessions = useWorkspaceSessionStore((state) => state.sessions);
  const activateSession = useWorkspaceSessionStore((state) => state.activateSession);
  const createSession = useWorkspaceSessionStore((state) => state.createSession);
  const moveSession = useWorkspaceSessionStore((state) => state.moveSession);
  const closeSession = useWorkspaceSessionStore((state) => state.closeSession);

  const scrollRegionRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<WorkspaceSessionId, HTMLButtonElement>());
  const draggedIdRef = useRef<WorkspaceSessionId | null>(null);
  const focusRequestRef = useRef<FocusRequest | null>(null);
  const repairingFocusRef = useRef(false);
  const [announcement, setAnnouncement] = useState("");

  const focusTab = useCallback((sessionId: WorkspaceSessionId | undefined) => {
    if (sessionId) tabRefs.current.get(sessionId)?.focus();
  }, []);

  const requestFocusAfterCommit = useCallback((request: FocusRequest) => {
    focusRequestRef.current = request;
  }, []);

  useLayoutEffect(() => {
    const request = focusRequestRef.current;
    if (!request) return;
    focusRequestRef.current = null;
    repairingFocusRef.current = true;
    if (request.kind === "active") {
      if (activeSessionId) focusTab(activeSessionId);
    } else if (request.kind === "id") {
      focusTab(request.id);
    } else {
      focusTab(sessionIds[Math.min(request.index, sessionIds.length - 1)]);
    }
    repairingFocusRef.current = false;
  }, [activeSessionId, focusTab, sessionIds]);

  const revealActiveTab = useCallback(() => {
    const region = scrollRegionRef.current;
    if (!activeSessionId) return;
    const tab = tabRefs.current.get(activeSessionId);
    if (!region || !tab) return;
    const nextScrollLeft = revealActiveTabScrollLeft({
      tabOffsetLeft: tab.offsetLeft,
      tabWidth: tab.offsetWidth,
      scrollLeft: region.scrollLeft,
      clientWidth: region.clientWidth,
      margin: ACTIVE_TAB_REVEAL_MARGIN_PX,
    });
    if (nextScrollLeft !== region.scrollLeft) region.scrollLeft = nextScrollLeft;
  }, [activeSessionId]);

  useLayoutEffect(() => {
    revealActiveTab();
    const region = scrollRegionRef.current;
    if (!region || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(revealActiveTab);
    observer.observe(region);
    return () => observer.disconnect();
  }, [revealActiveTab, sessionIds]);

  const handleMove = useCallback(
    (fromIndex: number, toIndex: number, announce = true) => {
      const movedId = sessionIds[fromIndex];
      if (!movedId) return;
      reorderTabInteraction({
        fromIndex,
        toIndex,
        sessionCount: sessionIds.length,
        announce,
        onMove: () => moveSession(fromIndex, toIndex),
        onFocus: () => requestFocusAfterCommit({ kind: "id", id: movedId }),
        onAnnounce: (position, total) => setAnnouncement(`Moved to position ${position} of ${total}`),
      });
    },
    [moveSession, requestFocusAfterCommit, sessionIds],
  );

  const closeSessionAtGate = useCallback(
    (sessionId: WorkspaceSessionId) => {
      const index = sessionIds.indexOf(sessionId);
      if (index === -1) return;
      const tab = tabRefs.current.get(sessionId);
      const focusWasInsideRemovedTab = Boolean(tab?.parentElement?.contains(document.activeElement));
      if (sessionId === activeSessionId) {
        requestFocusAfterCommit({ kind: "active" });
      } else if (focusWasInsideRemovedTab) {
        requestFocusAfterCommit({ kind: "index", index });
      }
      closeSession(sessionId);
    },
    [activeSessionId, closeSession, requestFocusAfterCommit, sessionIds],
  );

  const handleCreate = () => {
    const sessionId = createSession();
    requestFocusAfterCommit({ kind: "id", id: sessionId });
  };

  return (
    <Tabs.Root
      value={activeSessionId ?? ""}
      onValueChange={(value) => activateSession(value as WorkspaceSessionId)}
      activationMode="manual"
      className="min-w-0"
    >
      {/* Design 04 §2: strip container — padding 0 8px 0 12px, align-items flex-end, gap 2px,
          background #08090a (the one surface that recedes below the pane it belongs to),
          border-bottom 1px #1c1d20. */}
      <div className="flex min-w-0 items-end gap-0.5 border-b border-[var(--color-border-hairline)] bg-[var(--color-bg-tab-strip)] px-2 pb-0 pl-3">
        <Tabs.List
          ref={scrollRegionRef}
          aria-label="Agent sessions"
          aria-orientation="horizontal"
          tabIndex={-1}
          loop={false}
          className="flex min-w-0 flex-1 items-end gap-px overflow-x-auto"
          data-session-tab-scroll-region
        >
            {sessionIds.map((sessionId, index) => {
              const session = sessions[sessionId];
              if (!session) return null;
              return (
                <div
                  key={sessionId}
                  className="flex h-[30px] min-w-[112px] max-w-[200px] flex-[1_1_132px] items-center gap-[7px] rounded-t-lg pr-1 pl-[9px] hover:bg-[var(--color-bg-card)] has-[[data-state=active]]:bg-[var(--color-bg-control-strong)] has-[[data-state=active]]:shadow-active-tab has-[[data-state=active]]:hover:bg-[var(--color-bg-agent-pane)]"
                  draggable
                  data-session-tab-wrapper
                  data-session-id={sessionId}
                  onDragStart={(event) => {
                    draggedIdRef.current = sessionId;
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", sessionId);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    const draggedId = draggedIdRef.current;
                    const fromIndex = draggedId ? sessionIds.indexOf(draggedId) : -1;
                    if (fromIndex !== -1 && fromIndex !== index) handleMove(fromIndex, index, false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    draggedIdRef.current = null;
                  }}
                  onDragEnd={() => {
                    draggedIdRef.current = null;
                  }}
                >
                  <Tabs.Trigger
                    ref={(node) => {
                      if (node) tabRefs.current.set(sessionId, node);
                      else tabRefs.current.delete(sessionId);
                    }}
                    value={sessionId}
                    aria-controls={tabPanelId(sessionId)}
                    tabIndex={sessionId === activeSessionId ? 0 : -1}
                    className="flex h-full min-w-0 flex-1 items-center gap-[7px] rounded-t-lg py-0 text-left text-12 font-semibold text-[var(--color-fg-muted)] focus-visible:z-10 focus-visible:-outline-offset-2 data-[state=active]:text-[var(--color-fg)]"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      activateSession(sessionId);
                      focusTab(sessionId);
                    }}
                    onFocus={() => {
                      if (!repairingFocusRef.current) activateSession(sessionId);
                    }}
                    onKeyDown={(event) => {
                      const isReorder = (event.metaKey || event.ctrlKey) && event.shiftKey;
                      if (isReorder && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
                        event.preventDefault();
                        event.stopPropagation();
                        const targetIndex = index + (event.key === "ArrowLeft" ? -1 : 1);
                        handleMove(index, targetIndex);
                        return;
                      }
                      if (["ArrowLeft", "ArrowRight", "Home", "PageUp", "End", "PageDown"].includes(event.key)) {
                        const targetIndex =
                          event.key === "ArrowLeft"
                            ? Math.max(0, index - 1)
                            : event.key === "ArrowRight"
                              ? Math.min(sessionIds.length - 1, index + 1)
                              : event.key === "Home" || event.key === "PageUp"
                                ? 0
                                : sessionIds.length - 1;
                        event.preventDefault();
                        event.stopPropagation();
                        if (targetIndex !== index) {
                          const targetId = sessionIds[targetIndex];
                          activateSession(targetId);
                          focusTab(targetId);
                        }
                        return;
                      }
                      if (event.key === "Delete" || event.key === "Backspace") {
                        event.preventDefault();
                        event.stopPropagation();
                        closeSessionAtGate(sessionId);
                      }
                    }}
                  >
                    {/* Design 04 §3.1: 7px circle, flex 0 0 7px. Its per-status colour is
                        design 04 §3.3 and belongs to the phase that derives status. */}
                    <span aria-hidden="true" className="h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--color-fg-muted)]" />
                    <span data-elided data-horizontal-scroll aria-label={session.title} className="min-w-0 flex-1 truncate">
                      {session.title}
                    </span>
                  </Tabs.Trigger>
                  <button
                    type="button"
                    aria-label={`Close session ${session.title}`}
                    data-session-close
                    className="inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-10 text-[var(--color-fg-quiet)] focus-visible:-outline-offset-2 hover:bg-[var(--color-border-control-raised)] hover:text-[var(--color-fg)]"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      closeSessionAtGate(sessionId);
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
        </Tabs.List>
        <button
          type="button"
          aria-label="New session"
          title="New parallel session"
          data-new-session
          className="mb-0.5 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-lg leading-none text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-control-hover)] hover:text-[var(--color-fg)]"
          onClick={handleCreate}
        >
          +
        </button>
      </div>
      {sessionIds.map((sessionId) => (
        <Tabs.Content
          key={sessionId}
          forceMount
          value={sessionId}
          id={tabPanelId(sessionId)}
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
        />
      ))}
      <span aria-live="polite" className="sr-only" data-session-reorder-announcement>
        {announcement}
      </span>
    </Tabs.Root>
  );
}
