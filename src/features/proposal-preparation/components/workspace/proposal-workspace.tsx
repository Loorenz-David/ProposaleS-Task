"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { AgentSurface } from "./agent-surface";
import { MainApplicationSurface } from "./main-application-surface";
import { WorkspaceDivider } from "./workspace-divider";
import { useDividerWidth } from "../../hooks/use-divider-width";

export function ProposalWorkspace() {
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
  }, []);

  return (
    <div
      ref={rootRef}
      className={`flex h-dvh w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)] ${
        isResizing ? "select-none" : ""
      }`}
      data-workspace-root
    >
      <div className="flex min-w-0 shrink-0" style={{ width }}>
        <AgentSurface />
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
      <MainApplicationSurface state="idle" />
      <span aria-live="polite" className="sr-only" data-divider-announcement>
        {announcementKey > 0
          ? `Agent panel reset to default width${"\u200b".repeat(announcementKey)}`
          : null}
      </span>
    </div>
  );
}
