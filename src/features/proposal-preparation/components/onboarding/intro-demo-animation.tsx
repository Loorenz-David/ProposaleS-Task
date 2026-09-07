"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { toAuthored, toPlayback } from "./demo-animation/composition";
import { DemoScene, STAGE_HEIGHT, STAGE_WIDTH } from "./demo-animation/demo-scene";
import { DEMO_TIMELINE } from "./demo-animation/demo-scenes";

/**
 * Where the animation rests when it is not running: one second into Resolve, where the camera
 * has pulled back to the finished workspace and before the half-second seam fades it out.
 */
const STILL_TIME = toPlayback(DEMO_TIMELINE, DEMO_TIMELINE.cues.Resolve + 1);

/**
 * The frame around the product-demo animation: everything that makes a picture into a piece
 * of the intro, and nothing about what the picture shows.
 *
 * It carries the same posture as the looping clip it replaced ([intro-media.tsx]) — chrome-free,
 * started on arrival, repeating, with its own pause affordance — because a reviewer should not
 * have to notice that one slide's demonstration is drawn rather than recorded. Three things
 * follow from it being drawn:
 *
 * - **Reduced motion is honoured here.** `globals.css` collapses transitions and animations,
 *   but a requestAnimationFrame loop is neither, so CSS cannot reach it. Playback starts from
 *   the effect rather than on mount, so a reviewer who asked for less motion never sees a frame
 *   of it start and then stop — they get the still below instead.
 * - **The still is the end of the loop, not the beginning.** Frame zero is an empty workspace,
 *   which tells a paused reviewer nothing; the Resolve hold is the completed proposal, which is
 *   the whole point of the slide.
 * - **The scene is one image to assistive technology.** It is a picture of the interface built
 *   from elements, so `role="img"` stops its interior being announced as a second, fictional
 *   copy of the application. Its accessible name and the control's are the only text here.
 */
export function IntroDemoAnimation({ title }: { title: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [playbackTime, setPlaybackTime] = useState(STILL_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  /* 0 until the frame has been measured: the stage has a fixed pixel size and the frame is
     fluid, so the one thing that cannot be known at render time is how much to scale it by. */
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (motionQuery.matches) {
        setIsPlaying(false);
        setPlaybackTime(STILL_TIME);
      } else {
        setPlaybackTime(0);
        setIsPlaying(true);
      }
    };

    sync();
    motionQuery.addEventListener("change", sync);
    return () => motionQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - previous) / 1000;
      previous = now;
      setPlaybackTime((time) => (time + elapsed) % DEMO_TIMELINE.playbackTotal);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const measure = () => setScale(element.clientWidth / STAGE_WIDTH);
    measure();

    // Absent in the test environment, where there is no layout to observe and the single
    // measurement above is all there is to take.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl border border-[var(--color-border-card)] bg-[var(--color-bg)]">
      <div ref={frameRef} aria-label={title} className="relative aspect-video w-full" role="img">
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <DemoScene T={toAuthored(DEMO_TIMELINE, playbackTime)} />
        </div>
      </div>
      <button
        type="button"
        aria-label={isPlaying ? `Pause: ${title}` : `Play: ${title}`}
        onClick={() => setIsPlaying((playing) => !playing)}
        className="absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-focus)]"
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
