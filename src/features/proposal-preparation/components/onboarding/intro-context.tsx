"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Open/closed state for the reviewer intro.
 *
 * This is UI state in the third sense of contract 05 §5 — owned entirely by the client,
 * authoritative for nothing — and it is deliberately NOT in the workspace Zustand store:
 * it is not feature workflow state, it coordinates two unrelated presentation surfaces (the
 * overlay at the app root and the replay button in the agent header), and contract 05 §5.1
 * routes exactly that shape to "a small React context near the root, not a store".
 *
 * Nothing here is persisted. Per contract 05 §5.2 the session lives for the page lifetime,
 * so a refresh intentionally shows the intro again.
 */

type IntroControls = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const IntroContext = createContext<IntroControls | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  // Open on the first render of the page lifetime: the reviewer arrives with no context.
  const [isOpen, setIsOpen] = useState(true);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo<IntroControls>(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

/**
 * Null when no provider is above the caller, deliberately.
 *
 * The onboarding is additive to the workspace, and the workspace does not know it exists: the
 * agent header renders the replay trigger, but every surface that composes the header — in the
 * app and in the existing suites, which mount the workspace bare — must keep working with no
 * provider at all. A throwing hook would make an optional presentation feature a hard
 * dependency of the shell, which is the coupling this feature is specifically shaped to avoid.
 */
export function useIntroControls(): IntroControls | null {
  return useContext(IntroContext);
}
