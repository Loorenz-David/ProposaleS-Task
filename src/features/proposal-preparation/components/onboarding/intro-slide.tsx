"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";

import type { IntroSlide as IntroSlideModel, IntroSlideBody } from "./intro-content";
import { IntroDemoPrompt } from "./intro-demo-prompt";
import { IntroMediaRegion } from "./intro-media";
import { IntroSessionTabs } from "./intro-session-tabs";

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
      {slide.media ? <IntroMediaRegion media={slide.media} /> : null}
      <IntroSlideBodyView body={slide.body} />
      {slide.supporting ? (
        <p className="mt-5 max-w-prose text-13 leading-relaxed text-[var(--color-fg-muted)]">
          {slide.supporting}
        </p>
      ) : null}
      {slide.link ? (
        // Secondary by construction: an outlined control in the content area, well below the
        // filled primary in the footer. The icon carries "this leaves the app" visually; the
        // accessible name carries it for assistive technology, matching how
        // `created-surface.tsx` already names its Proposales link.
        <a
          aria-label={`${slide.link.label} (opens in a new tab)`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-control-raised)] bg-[var(--color-bg-control)] px-4 py-2 text-12-5 font-semibold text-[var(--color-fg-control)] no-underline hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
          href={slide.link.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" size={15} />
          {slide.link.label}
        </a>
      ) : null}
    </div>
  );
}

function IntroSlideBodyView({ body }: { body: IntroSlideBody }) {
  if (body.kind === "diagram") {
    return (
      <>
        {/* No frame and no plate: the artwork is transparent and already draws its own cards,
            so a border here would box a picture that has no edges of its own. */}
        <Image
          alt={body.alt}
          className={
            body.fit === "compact"
              ? "mx-auto mt-6 h-auto w-full max-w-[560px]"
              : "mt-6 h-auto w-full"
          }
          height={body.height}
          src={body.src}
          width={body.width}
        />
        {body.boundary ? (
          <p className="mt-5 rounded-xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-4 text-13 leading-relaxed text-[var(--color-fg-secondary)]">
            <span className="mr-2 font-mono text-10 uppercase tracking-label text-[var(--color-accent-ink-on-dark)]">
              {body.boundary.label}
            </span>
            {body.boundary.detail}
          </p>
        ) : null}
      </>
    );
  }

  if (body.kind === "demo-prompt") return <IntroDemoPrompt />;

  if (body.kind === "session-tabs") {
    return (
      <>
        <IntroSessionTabs
          caption={body.caption}
          newSessionLabel={body.newSessionLabel}
          tabs={body.tabs}
        />
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {body.callouts.map((callout) => (
            <li
              key={callout.title}
              className="rounded-xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-3"
            >
              <p className="text-12-5 font-semibold text-[var(--color-fg)]">{callout.title}</p>
              <p className="mt-1 text-12 leading-relaxed text-[var(--color-fg-muted)]">
                {callout.detail}
              </p>
            </li>
          ))}
        </ul>
      </>
    );
  }

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
