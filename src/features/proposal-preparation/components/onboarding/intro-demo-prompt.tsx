"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DEMO_BRIEF } from "./intro-content";

type CopyState = "idle" | "copied" | "failed";

/**
 * Copies the demo brief to the clipboard and reports the outcome politely.
 *
 * Failure is non-disruptive by design: nothing is thrown, nothing is blocked, and the brief
 * is always present as selectable text on slide 3, so a reviewer whose browser withholds
 * clipboard permission simply selects it by hand.
 */
export function IntroCopyPromptButton({ label }: { label: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const onCopy = async () => {
    let next: CopyState;
    try {
      await navigator.clipboard.writeText(DEMO_BRIEF);
      next = "copied";
    } catch {
      next = "failed";
    }
    setCopyState(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2400);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void onCopy()}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-control-raised)] bg-[var(--color-bg-control)] px-4 py-2 text-12-5 font-semibold text-[var(--color-fg-control)] hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
      >
        {copyState === "copied" ? (
          <Check aria-hidden="true" size={15} />
        ) : (
          <Copy aria-hidden="true" size={15} />
        )}
        {label}
      </button>
      {/* Announced politely; the state is carried by the words, never by colour alone. */}
      <span
        aria-live="polite"
        className={
          copyState === "failed"
            ? "text-12 text-[var(--color-attention)]"
            : "text-12 text-[var(--color-positive)]"
        }
      >
        {copyState === "copied" ? "Copied" : null}
        {copyState === "failed" ? "Copy failed — select the brief and copy it manually." : null}
      </span>
    </div>
  );
}

/** Slide 3's prompt card: the brief itself, plus the copy affordance. */
export function IntroDemoPrompt() {
  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-4">
        <p className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
          Demo brief
        </p>
        <p className="mt-3 select-all font-mono text-12-5 leading-loose text-[var(--color-fg-body)]">
          {DEMO_BRIEF}
        </p>
      </div>
      <div className="mt-3">
        <IntroCopyPromptButton label="Copy prompt" />
      </div>
    </div>
  );
}
