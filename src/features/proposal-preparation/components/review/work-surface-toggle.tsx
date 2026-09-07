"use client";

import { useState } from "react";

import type { WorkSurface } from "../../types/session";

export type WorkSurfaceToggleProps = { value: WorkSurface; onChange: (value: WorkSurface) => void };

export function WorkSurfaceToggle({ value, onChange }: WorkSurfaceToggleProps) {
  const [announcement, setAnnouncement] = useState("");
  const choose = (next: WorkSurface) => {
    onChange(next);
    setAnnouncement(next === "fields" ? "Showing fields" : "Showing client preview");
  };
  return (
    <>
      <fieldset className="inline-flex rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-card)] p-1">
        <legend className="sr-only">Proposal view</legend>
        {(["fields", "preview"] as const).map((option) => (
          <label key={option} className={`cursor-pointer rounded-md px-3 py-1.5 text-12 font-semibold ${value === option ? "bg-[var(--color-bg-control-strong)] text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}>
            <input className="sr-only" type="radio" name="proposal-view" value={option} checked={value === option} onChange={() => choose(option)} />
            {option === "fields" ? "Fields" : "Client Preview"}
          </label>
        ))}
      </fieldset>
      <span aria-live="polite" className="sr-only">{announcement}</span>
    </>
  );
}
