"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { AgentSurface } from "./agent-surface";
import { MainApplicationSurface } from "./main-application-surface";
import { WorkspaceDivider } from "./workspace-divider";
import { useDividerWidth } from "../../hooks/use-divider-width";

const subscribeToHydration = () => () => {};

export function ProposalWorkspace() {
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [announcementKey, setAnnouncementKey] = useState(0);
  const { width, effectiveMax, setWidth, reset } = useDividerWidth(containerWidth);

  const announceReset = () => {
    flushSync(() => setAnnouncementKey((key) => key + 1));
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [isHydrated]);

  return (
    <div
      ref={rootRef}
      className={`flex h-dvh w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)] ${
        isResizing ? "select-none" : ""
      }`}
      data-workspace-root
    >
      <div className="flex min-w-0 shrink-0" style={{ width }}>
        {isHydrated ? (
          <AgentSurface />
        ) : (
          <aside
            aria-label="Proposal agent"
            className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-bg-agent-pane)]"
          />
        )}
      </div>
      <WorkspaceDivider
        effectiveMax={effectiveMax}
        onAnnouncement={announceReset}
        onReset={() => reset()}
        onResizeEnd={() => setIsResizing(false)}
        onResizeStart={() => setIsResizing(true)}
        onWidthChange={setWidth}
        isResizing={isResizing}
        width={width}
      />
      <MainApplicationSurface />
      <span aria-live="polite" className="sr-only" data-divider-announcement>
        {announcementKey > 0
          ? `Agent panel reset to default width${"\u200b".repeat(announcementKey)}`
          : null}
      </span>
    </div>
  );
}
