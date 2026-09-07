"use client";

import { BookOpen } from "lucide-react";

import { useIntroControls } from "./intro-context";

/**
 * Replays the reviewer intro. Lives in the agent header beside the session count — the one
 * persistent chrome the workspace already has — so no navigation surface is introduced.
 *
 * Focus returns here on close without any code of ours: `showModal()` records the invoker and
 * the platform restores focus to it when the dialog closes.
 */
export function IntroReplayButton() {
  const controls = useIntroControls();
  // No provider above us: the workspace is being composed without the onboarding. Render
  // nothing rather than imposing the feature on every consumer of the agent header.
  if (!controls) return null;
  return (
    <button
      type="button"
      onClick={controls.open}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)] hover:bg-[var(--color-bg-control)] hover:text-[var(--color-fg-control)]"
    >
      <BookOpen aria-hidden="true" size={13} />
      Demo guide
    </button>
  );
}
