"use client";

import { useEffect, useRef } from "react";

import type { ReviewSurfaceViewModel } from "../../client/view-models/review";
import type { WorkSurface } from "../../types/session";
import { ReadinessLine } from "./readiness-line";
import { WorkSurfaceToggle } from "./work-surface-toggle";

export type ReviewHeaderProps = {
  viewModel: ReviewSurfaceViewModel;
  workSurface: WorkSurface;
  onWorkSurfaceChange: (value: WorkSurface) => void;
};

export function ReviewHeader({ viewModel, workSurface, onWorkSurfaceChange }: ReviewHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.dataset.pillIntent === "focus-review") {
      headingRef.current?.focus();
    }
  });
  return (
    <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--color-border-divider)] px-6 py-6 lg:px-9">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-10 uppercase tracking-label text-[var(--color-accent-ink-on-dark)]">Proposition · v{viewModel.version}</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 break-words text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          {viewModel.title}
        </h1>
        {viewModel.clientLabel ? <p className="mt-2 text-13 text-[var(--color-fg-secondary)]">Prepared for {viewModel.clientLabel}</p> : null}
        <div className="mt-3"><ReadinessLine viewModel={viewModel.readiness} /></div>
      </div>
      <WorkSurfaceToggle onChange={onWorkSurfaceChange} value={workSurface} />
    </header>
  );
}
