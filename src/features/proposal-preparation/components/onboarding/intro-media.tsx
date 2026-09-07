"use client";

import Image from "next/image";

import type { IntroMedia } from "./intro-content";

/**
 * The optional media region of a slide, between the description and the body.
 *
 * No slide carries media today — the intro explains itself through the application's own UI
 * language — but the region is real so a still or a clip can be dropped into a slide's
 * `media` field without touching layout or navigation.
 *
 * Video rules follow contract 05 §7: controls, never autoplay, and no sound that starts on
 * its own. `preload="none"` keeps a decorative clip from costing a reviewer anything until
 * they ask for it, which is also what a reduced-motion preference deserves by default.
 */
export function IntroMediaRegion({ media }: { media: IntroMedia }) {
  if (media.kind === "image") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border-card)]">
        <Image
          alt={media.alt}
          className="h-auto w-full"
          height={media.height}
          src={media.src}
          width={media.width}
        />
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border-card)]">
      <video
        aria-label={media.title}
        className="h-auto w-full"
        controls
        poster={media.poster}
        preload="none"
        src={media.src}
      />
    </div>
  );
}
