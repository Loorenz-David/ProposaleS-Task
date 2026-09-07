"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { IntroMedia } from "./intro-content";
import { IntroDemoAnimation } from "./intro-demo-animation";

/**
 * The optional media region of a slide, between the description and the body.
 *
 * A slide gains a still, a clip or the product-demo animation through its `media` field alone;
 * neither layout nor navigation changes. Two video postures, chosen by `loop`:
 *
 * - Default (`loop` absent) — a clip the reviewer opts into. Native `controls`, no autoplay,
 *   and `preload="none"` so it costs nothing until asked for.
 * - Ambient (`loop: true`) — a short screen recording demonstrating the step it sits above. It
 *   plays muted on arrival and repeats, and it is chrome-free on purpose: no timeline, no
 *   volume, no menu. It reads as an embedded illustration, not a media player.
 *
 * The `animation` kind is the ambient posture again, drawn rather than decoded
 * ([intro-demo-animation.tsx]). It is deliberately the same shape on screen: a reviewer should
 * read it as the demonstration for its step, not as a different kind of object.
 */
export function IntroMediaRegion({ media }: { media: IntroMedia }) {
  if (media.kind === "animation") {
    return <IntroDemoAnimation title={media.title} />;
  }

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

  return media.loop ? <AmbientVideo media={media} /> : <OptInVideo media={media} />;
}

type VideoMedia = Extract<IntroMedia, { kind: "video" }>;

/** The opt-in posture: the platform's own player, costing nothing until it is used. */
function OptInVideo({ media }: { media: VideoMedia }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border-card)]">
      <video
        aria-label={media.title}
        className="block h-auto w-full"
        controls
        poster={media.poster}
        preload="none"
        src={media.src}
      />
    </div>
  );
}

/**
 * The ambient posture: chrome-free, muted, looping, and started on arrival.
 *
 * Removing `controls` removes the platform's pause affordance, so this supplies its own rather
 * than leaving motion the reviewer cannot stop. It is a real `<button>` covering the frame, not
 * a click handler on the video: contract 05 §7 requires every interactive element to be a
 * native control and every flow to be keyboard-operable, so tapping the picture and tabbing to
 * it are the same control. Its accessible name carries the state, never the icon alone.
 *
 * Playback state follows the element rather than our intent — a browser may refuse autoplay,
 * and the label has to tell the truth when it does.
 *
 * Reduced motion is honoured here and only here: `globals.css` collapses transitions and
 * animations, but a looping video is neither, so CSS cannot reach it. Playback is started from
 * the effect rather than declared with `autoPlay`, so a reviewer who asked for less motion
 * never sees a frame of it start and then stop.
 */
function AmbientVideo({ media }: { media: VideoMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (motionQuery.matches) video.pause();
      else attemptPlay(video);
    };

    sync();
    motionQuery.addEventListener("change", sync);
    return () => motionQuery.removeEventListener("change", sync);
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) attemptPlay(video);
    else video.pause();
  };

  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl border border-[var(--color-border-card)]">
      <video
        ref={videoRef}
        aria-label={media.title}
        className="block h-auto w-full"
        /* Trims what the browser's own context menu offers on a chrome-free frame. It cannot
           remove every entry — Chrome still offers "Show controls" there — but it takes away
           the ones that treat an illustration as a downloadable media file. */
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        loop
        muted
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        playsInline
        poster={media.poster}
        preload="metadata"
        src={media.src}
      />
      <button
        type="button"
        aria-label={isPlaying ? `Pause: ${media.title}` : `Play: ${media.title}`}
        onClick={toggle}
        className="absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        {/* Shown only while paused. A chrome-free frame that has stopped otherwise looks
            broken, and this is the affordance that says it can be resumed. */}
        {isPlaying ? null : (
          <span className="grid size-12 place-items-center rounded-full bg-[var(--color-bg)]/70 text-[var(--color-fg)]">
            <Play aria-hidden="true" size={20} />
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * Autoplay can be refused — a browser policy, a per-site preference, a battery-saving mode. The
 * rejection is not an error worth surfacing: the frame's own control is right there, and the
 * label already reads "Play".
 */
function attemptPlay(video: HTMLVideoElement) {
  const started = video.play();
  if (started && typeof started.catch === "function") started.catch(() => {});
}
