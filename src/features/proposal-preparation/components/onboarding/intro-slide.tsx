"use client";

import { ChevronRight } from "lucide-react";

import type { IntroSlide as IntroSlideModel, IntroSlideBody } from "./intro-content";
import { IntroDemoPrompt } from "./intro-demo-prompt";

export type IntroSlideProps = {
  slide: IntroSlideModel;
  headingId: string;
  descriptionId: string;
};

/**
 * One slide. Every visual here is composed from the application's own UI language — surfaces,
 * borders, ink and the mono label treatment already used across the workspace — so the intro
 * reads as part of Proposal Copilot rather than a landing page bolted onto it.
 */
export function IntroSlide({ slide, headingId, descriptionId }: IntroSlideProps) {
  return (
    <div>
      {slide.eyebrow ? (
        <p className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
          {slide.eyebrow}
        </p>
      ) : null}
      <h2 id={headingId} className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
        {slide.heading}
      </h2>
      <p id={descriptionId} className="mt-3 max-w-prose text-14 leading-relaxed text-[var(--color-fg-secondary)]">
        {slide.description}
      </p>
      <IntroSlideBodyView body={slide.body} />
      {slide.supporting ? (
        <p className="mt-5 max-w-prose text-13 leading-relaxed text-[var(--color-fg-muted)]">
          {slide.supporting}
        </p>
      ) : null}
    </div>
  );
}

function IntroSlideBodyView({ body }: { body: IntroSlideBody }) {
  if (body.kind === "flow") {
    return (
      <ol className="mt-6 flex flex-wrap items-center gap-2">
        {body.stages.map((stage, index) => (
          <li key={stage} className="flex items-center gap-2">
            {index > 0 ? (
              <ChevronRight
                aria-hidden="true"
                className="text-[var(--color-fg-quietest)]"
                size={15}
              />
            ) : null}
            <span className="rounded-xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] px-3 py-2 text-12-5 font-semibold text-[var(--color-fg-control)]">
              {stage}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  if (body.kind === "steps") {
    return (
      <ol className="mt-6 space-y-3">
        {body.steps.map((step) => (
          <li key={step.ordinal} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-px font-mono text-11 font-medium tabular-nums text-[var(--color-fg-quiet)]"
            >
              {step.ordinal}
            </span>
            <div className="min-w-0">
              <p className="text-13-5 font-semibold text-[var(--color-fg)]">{step.title}</p>
              <p className="mt-1 text-13 leading-relaxed text-[var(--color-fg-muted)]">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (body.kind === "demo-prompt") return <IntroDemoPrompt />;

  if (body.kind === "proof-points") {
    return (
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {body.points.map((point) => (
          <li
            key={point.label}
            className="rounded-2xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-4"
          >
            <p className="font-mono text-10 uppercase tracking-label text-[var(--color-accent-ink-on-dark)]">
              {point.label}
            </p>
            <p className="mt-2 text-13 leading-relaxed text-[var(--color-fg-secondary)]">
              {point.detail}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <ol className="mt-6 space-y-2">
        {body.items.map((item, index) => (
          <li key={item} className="flex gap-3 text-13-5 text-[var(--color-fg-body)]">
            <span
              aria-hidden="true"
              className="font-mono text-11 tabular-nums text-[var(--color-fg-quiet)]"
            >
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-xl border border-[var(--color-border-dashed)] border-dashed p-4 text-12-5 leading-relaxed text-[var(--color-fg-muted)]">
        {body.note}
      </p>
    </>
  );
}
