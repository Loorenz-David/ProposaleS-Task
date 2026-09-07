"use client";

import { useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import {
  AGENT_PANE_DEFAULT_PX,
  AGENT_PANE_MIN_PX,
  DIVIDER_KEYBOARD_LARGE_STEP_PX,
  DIVIDER_KEYBOARD_STEP_PX,
} from "./constants";

type WorkspaceDividerProps = {
  width: number;
  effectiveMax: number;
  onWidthChange: (requested: number) => void;
  onReset: () => void;
  onAnnouncement: () => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  isResizing: boolean;
};

export function WorkspaceDivider({
  width,
  effectiveMax,
  onWidthChange,
  onReset,
  onAnnouncement,
  onResizeStart,
  onResizeEnd,
  isResizing,
}: WorkspaceDividerProps) {
  const dragStart = useRef<{ pointerId: number; clientX: number; width: number } | null>(null);

  const reset = () => {
    onReset();
    onAnnouncement();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? DIVIDER_KEYBOARD_LARGE_STEP_PX : DIVIDER_KEYBOARD_STEP_PX;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onWidthChange(width - step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onWidthChange(width + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      onWidthChange(AGENT_PANE_MIN_PX);
    } else if (event.key === "End") {
      event.preventDefault();
      onWidthChange(effectiveMax);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      reset();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStart.current = { pointerId: event.pointerId, clientX: event.clientX, width };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onResizeStart();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId) return;
    onWidthChange(dragStart.current.width + event.clientX - dragStart.current.clientX);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId) return;
    dragStart.current = null;
    onResizeEnd();
  };

  return (
    <div
      aria-label="Resize agent panel"
      aria-orientation="vertical"
      aria-valuemax={effectiveMax}
      aria-valuemin={AGENT_PANE_MIN_PX}
      aria-valuenow={width}
      className="relative z-10 w-3 shrink-0 cursor-col-resize touch-none"
      data-workspace-divider
      onDoubleClick={reset}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      role="separator"
      tabIndex={0}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 border-x border-[var(--color-border-hairline)] bg-[var(--color-bg-agent-pane)] data-[resizing=true]:border-[var(--color-accent)] data-[resizing=true]:bg-[var(--color-bg-resize-active)]"
        data-resizing={isResizing}
      />
    </div>
  );
}
