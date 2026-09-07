"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react";

export type CreatingSurfaceProps = { label: string };

export function CreatingSurface({ label }: CreatingSurfaceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <section className="grid min-h-full place-items-center px-6 py-12" role="status">
      <div className="max-w-[460px] text-center">
        <LoaderCircle aria-hidden="true" className="mx-auto animate-spin-fast text-[var(--color-accent-ink-on-dark)] motion-reduce:animate-none" size={34} />
        <h1 ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold text-[var(--color-fg)]">{label}</h1>
        <p className="mt-3 text-13 leading-relaxed text-[var(--color-fg-secondary)]">Your reviewed proposition remains here while Proposales creates the draft.</p>
      </div>
    </section>
  );
}
