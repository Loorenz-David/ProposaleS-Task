import { describe, expect, it } from "vitest";

import { animate, deriveTimeline, EASE, interpolate, playbackSeconds, toAuthored, toPlayback } from "./composition";
import { DEMO_SCENES, DEMO_TIMELINE } from "./demo-scenes";

/**
 * The timing kernel is where the animation can actually be wrong in a way no screenshot would
 * show: a cue off by a scene, a retimed scene that speeds its choreography up instead of
 * shortening its hold, a still frame that lands inside the loop's fade. Everything above it is
 * a pure render of the number it produces, so this is the lowest layer that can prove any of
 * it ([11-testing-principles.md] §2).
 */

const scenes = [
  { name: "One", dur: 2, desc: "" },
  { name: "Two", dur: 1, nat: 4, desc: "" },
  { name: "Three", dur: 3, desc: "" },
];

describe("deriveTimeline", () => {
  it("gives each scene its authored start, and totals both clocks separately", () => {
    const timeline = deriveTimeline(scenes);

    expect(timeline.cues).toEqual({ One: 0, Two: 2, Three: 6 });
    expect(timeline.playbackTotal).toBe(6);
    expect(timeline.authoredTotal).toBe(9);
  });

  it("binds a repeated scene name to its first occurrence", () => {
    const timeline = deriveTimeline([
      { name: "Beat", dur: 1, desc: "" },
      { name: "Other", dur: 1, desc: "" },
      { name: "Beat", dur: 1, desc: "" },
    ]);

    expect(timeline.cues.Beat).toBe(0);
  });
});

describe("toAuthored", () => {
  const timeline = deriveTimeline(scenes);

  it("runs one authored second per playback second where a scene was not retimed", () => {
    expect(toAuthored(timeline, 0)).toBe(0);
    expect(toAuthored(timeline, 1)).toBe(1);
  });

  it("replays a shortened scene's whole authored slice, rather than cutting it off", () => {
    // "Two" plays for 1s but was authored over 4s: its start and its end both have to land.
    expect(toAuthored(timeline, 2)).toBe(2);
    expect(toAuthored(timeline, 2.5)).toBe(4);
    expect(toAuthored(timeline, 3)).toBe(6);
  });

  it("never runs past the authored end", () => {
    expect(toAuthored(timeline, timeline.playbackTotal)).toBe(timeline.authoredTotal);
    expect(toAuthored(timeline, 99)).toBe(timeline.authoredTotal);
  });
});

describe("toPlayback", () => {
  const timeline = deriveTimeline(scenes);

  it("inverts toAuthored", () => {
    for (const t of [0, 1, 2, 4, 6, 7.5, 9]) {
      expect(toPlayback(timeline, toAuthored(timeline, toPlayback(timeline, t)))).toBeCloseTo(
        toPlayback(timeline, t),
        10,
      );
    }
  });

  it("puts a camera move authored inside a shortened scene at a real playback second", () => {
    // The move is what must stay 1.1s long however "Two" was retimed; the hold around it gives.
    expect(toPlayback(timeline, timeline.cues.Two)).toBe(2);
    expect(toPlayback(timeline, timeline.cues.Three)).toBe(3);
  });
});

describe("playbackSeconds", () => {
  const timeline = deriveTimeline(scenes);

  it("expresses a real duration in the authored seconds of the scene it runs in", () => {
    // "Two" plays at a quarter speed of its authored length, so 0.3 real seconds of stagger
    // is 1.2 authored seconds of it.
    expect(playbackSeconds(timeline, "Two", 0.3)).toBeCloseTo(1.2, 10);
    expect(playbackSeconds(timeline, "One", 0.3)).toBeCloseTo(0.3, 10);
  });

  it("leaves a duration alone when the scene is unknown", () => {
    expect(playbackSeconds(timeline, "Missing", 0.3)).toBe(0.3);
  });
});

describe("animate and interpolate", () => {
  it("holds a tween's ends rather than extrapolating past them", () => {
    const fade = animate({ from: 0, to: 1, start: 1, end: 2, ease: EASE.linear });

    expect(fade(0)).toBe(0);
    expect(fade(1.5)).toBeCloseTo(0.5, 10);
    expect(fade(9)).toBe(1);
  });

  it("holds a keyframed value outside its first and last mark", () => {
    const camera = interpolate([0, 1, 2], [10, 20, 30], EASE.linear);

    expect(camera(-5)).toBe(10);
    expect(camera(0.5)).toBeCloseTo(15, 10);
    expect(camera(5)).toBe(30);
  });
});

describe("the demo's own timeline", () => {
  it("derives the cues the scene is choreographed against", () => {
    // Every cue the piece keys to comes from DEMO_SCENES, so a rename there would silently
    // move choreography rather than break it. These are the moments the demo is built on.
    expect(DEMO_TIMELINE.cues).toEqual({
      Establish: 0,
      Brief: 2.2,
      Reasoning: 5.2,
      Clarify: 7.4,
      Proposition: 14.4,
      Review: 23.4,
      Approve: 30.4,
      Create: 35.4,
      Resolve: 42.4,
    });
    expect(DEMO_TIMELINE.playbackTotal).toBeCloseTo(30.6, 10);
    expect(DEMO_TIMELINE.authoredTotal).toBeCloseTo(45.4, 10);
  });

  it("leaves the resting still clear of the loop's closing fade", () => {
    // `intro-demo-animation.tsx` rests on Resolve + 1. The piece fades the workspace out over
    // the last half second so the loop's final frame matches its first — a still taken inside
    // that fade would be a dimmed, half-empty picture.
    const still = DEMO_TIMELINE.cues.Resolve + 1;
    expect(still).toBeLessThan(DEMO_TIMELINE.authoredTotal - 0.5);
  });

  it("gives every scene a description, since the reader of this list is a person", () => {
    for (const scene of DEMO_SCENES) {
      expect(scene.desc).not.toBe("");
    }
  });
});
