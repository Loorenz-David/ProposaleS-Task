"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";

import { INTRO_SLIDES } from "./intro-content";
import { useIntroControls } from "./intro-context";
import { IntroCopyPromptButton } from "./intro-demo-prompt";
import { IntroProgress } from "./intro-progress";
import { IntroSlide } from "./intro-slide";

/**
 * The reviewer intro overlay.
 *
 * Dialog mechanics are the platform's, not ours: a native `<dialog>` opened with
 * `showModal()` owns the focus trap, the inert background, top-layer stacking, Escape, and
 * focus restoration to whatever invoked it. Contract 15 §5 names `dialog` among the elements
 * "whose semantics the platform already provides", and `confirm-dialog.tsx` already
 * establishes this pattern in the workspace — so no dialog dependency is added.
 *
 * Navigation state is local (contract 05 §5, §5.1): the index no component else needs lives
 * in `useState` here, and only open/closed — which the agent header's replay button also
 * needs — is lifted into `intro-context.tsx`.
 */
const noop = () => {};

export function ProposalCopilotIntro() {
  const controls = useIntroControls();
  const isOpen = controls?.isOpen ?? false;
  const close = controls?.close ?? noop;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const headingId = useId();
  const descriptionId = useId();

  const slide = INTRO_SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === INTRO_SLIDES.length - 1;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      setIndex(0);
      dialog.showModal();
      // Deterministic entry point. Without this the platform focuses the first focusable
      // element, which is "Skip intro" — the one action a reviewer should not land on.
      primaryRef.current?.focus();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  if (!controls) return null;

  return (
    <dialog
      ref={dialogRef}
      data-intro-dialog
      aria-describedby={descriptionId}
      aria-labelledby={headingId}
      onCancel={(event) => {
        // Escape. Prevented so the close runs through React state and the two stay in sync.
        event.preventDefault();
        close();
      }}
      onClose={close}
      /* Backdrop clicks are deliberately inert — the platform default is kept. A five-slide
         sequence should not evaporate on a stray click when Escape, "Skip intro" and "Start
         exploring" are all present and obvious. */
      className="m-auto w-[min(880px,calc(100vw-24px))] rounded-4xl border border-[var(--color-border-elevated)] bg-[var(--color-bg-card)] p-0 text-[var(--color-fg)] shadow-popover backdrop:bg-[var(--color-bg)]/80"
    >
      <div className="flex max-h-[calc(100dvh-3rem)] flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--color-border-divider)] px-5 py-4 sm:px-7">
          <span
            aria-hidden="true"
            className="grid size-[26px] place-items-center rounded-sm bg-[var(--color-accent-wash)] text-[var(--color-accent-ink-on-dark)]"
          >
            ✦
          </span>
          <span className="ml-auto whitespace-nowrap font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
            Step {index + 1} of {INTRO_SLIDES.length}
          </span>
          <button
            type="button"
            onClick={close}
            className="whitespace-nowrap rounded-lg px-3 py-1 text-12-5 font-semibold text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Skip intro
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {/* Keyed so each slide enters fresh. The transition runs from @starting-style, so
              the settled state is the default one: with reduced motion (globals.css collapses
              every duration), or in a browser without @starting-style, the slide is simply
              already there. Nothing is ever left hidden by a transition that did not run. */}
          <div
            key={slide.id}
            className="transition duration-200 ease-out starting:translate-y-2 starting:opacity-0"
          >
            <IntroSlide descriptionId={descriptionId} headingId={headingId} slide={slide} />
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-4 border-t border-[var(--color-border-divider)] px-5 py-4 sm:px-7">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-control-raised)] px-4 py-2 text-12-5 font-semibold text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] disabled:opacity-40 disabled:hover:text-[var(--color-fg-secondary)]"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Back
          </button>
          <div className="order-last w-full sm:order-none sm:mx-auto sm:w-auto">
            <IntroProgress currentIndex={index} onSelect={setIndex} slides={INTRO_SLIDES} />
          </div>
          {slide.action ? <IntroCopyPromptButton label={slide.action.label} /> : null}
          <button
            ref={primaryRef}
            type="button"
            onClick={() =>
              isLast ? close() : setIndex((current) => Math.min(INTRO_SLIDES.length - 1, current + 1))
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2 text-12-5 font-bold text-[var(--color-bg)] hover:bg-[var(--color-accent-hover-button)]"
          >
            {isLast ? "Start exploring" : "Next"}
            {isLast ? null : <ArrowRight aria-hidden="true" size={15} />}
          </button>
        </footer>
      </div>

      {/* Focus stays on the primary action so Enter walks the tour; the change of slide is
          announced instead of stealing focus. */}
      <span aria-live="polite" className="sr-only">
        {`Slide ${index + 1} of ${INTRO_SLIDES.length}: ${slide.heading}`}
      </span>
    </dialog>
  );
}
