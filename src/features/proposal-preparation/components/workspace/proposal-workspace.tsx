"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { AgentSurface } from "./agent-surface";
import { MainApplicationSurface } from "./main-application-surface";
import { WorkspaceDivider } from "./workspace-divider";
import { ConfirmDialog } from "./confirm-dialog";
import { useDividerWidth } from "../../hooks/use-divider-width";
import { useCloseGuard } from "../../hooks/use-close-guard";
import { useDepartureGuard } from "../../hooks/use-departure-guard";

const subscribeToHydration = () => () => {};

export function ProposalWorkspace() {
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [announcementKey, setAnnouncementKey] = useState(0);
  const { width, effectiveMax, setWidth, reset } = useDividerWidth(containerWidth);
  const closeGuard = useCloseGuard();
  useDepartureGuard();

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
      {/* Rendered before the agent surface so its layout effect (native dialog.close(),
          which restores focus to whatever invoked showModal()) runs and settles before
          the tab strip's own post-close layout effect claims focus for the neighbouring
          tab. Both are useLayoutEffect; React fires sibling layout effects in document
          order, so this ordering — not DOM/visual position, which the dialog's top-layer
          rendering makes irrelevant — is what makes the strip's explicit focus win. */}
      <ConfirmDialog {...closeGuard.dialog} />
      <div className="flex min-w-0 shrink-0" style={{ width }}>
        {isHydrated ? (
          <AgentSurface closeGuard={closeGuard} />
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
      <MainApplicationSurface closeGuard={closeGuard} />
      <span aria-live="polite" className="sr-only" data-divider-announcement>
        {announcementKey > 0
          ? `Agent panel reset to default width${"\u200b".repeat(announcementKey)}`
          : null}
      </span>
    </div>
  );
}
