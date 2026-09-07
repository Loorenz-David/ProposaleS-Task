/**
 * The timing kernel the product-demo animation is drawn from.
 *
 * The animation is one element tree rendered as a pure function of a single authored-time
 * axis. Nothing mounts or unmounts at a scene boundary; a shape that crosses one is just
 * motion whose start and end straddle a cue. That is why this file holds no components and
 * no React: it turns a scene list into a cue table and turns wall-clock playback seconds into
 * authored seconds, and everything visible is computed from that number alone.
 *
 * Two clocks, because scenes are authored at one length and played at another:
 *
 * - **playback seconds** — what the reviewer experiences. The sum of every scene's `dur`.
 * - **authored seconds** (`T`) — what choreography is written against. The sum of every
 *   scene's `nat`. A scene played shorter than it was authored replays the same authored
 *   slice faster, so a retimed scene shortens its hold rather than losing its end.
 *
 * Choreography keys to `T`. Anything that must last a real fixed duration regardless of
 * retiming — a camera move — converts through {@link toPlayback} and {@link playbackSeconds}.
 *
 * Only the four easing curves the scene actually uses are carried. This is a kernel for one
 * animation, not a general animation library ([16-design-prototype-porting.md] §5).
 */

/** An easing curve: `t` in 0..1 in, eased `t` out. */
export type Curve = (t: number) => number;

export const EASE = {
  linear: (t: number) => t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeOutCubic: (t: number) => (t - 1) ** 3 + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
} as const satisfies Record<string, Curve>;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Maps `t` across a rising list of input keyframes onto matching output values, easing each
 * segment. Outside the first and last keyframe it holds the end value rather than
 * extrapolating, so a camera never drifts past its last mark.
 */
export function interpolate(
  input: readonly number[],
  output: readonly number[],
  ease: Curve = EASE.linear,
): (t: number) => number {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        return output[i] + (output[i + 1] - output[i]) * ease(local);
      }
    }
    return output[output.length - 1];
  };
}

/** A single-segment tween: `from` before `start`, `to` after `end`, eased between. */
export function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = EASE.easeInOutCubic,
}: {
  from?: number;
  to?: number;
  start?: number;
  end?: number;
  ease?: Curve;
}): (t: number) => number {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    return from + (to - from) * ease((t - start) / (end - start));
  };
}

/**
 * One named slice of the timeline. `dur` is how long it plays; `nat` is the length it was
 * authored at, and defaults to `dur` when the two agree.
 */
export type Scene = {
  name: string;
  dur: number;
  nat?: number;
  /** What happens in this slice. Editorial, not read by the renderer. */
  desc: string;
};

type Section = {
  name: string;
  /** Where the slice starts on the playback clock. */
  playStart: number;
  /** How long the slice plays. */
  dur: number;
  /** Where the slice starts on the authored clock. */
  authStart: number;
  /** How long the slice was authored at. */
  nat: number;
};

export type Timeline = {
  sections: readonly Section[];
  /** Authored start of each scene, by name. The one source of every cue in the piece. */
  cues: Readonly<Record<string, number>>;
  playbackTotal: number;
  authoredTotal: number;
};

/**
 * Derives the cue table from the scene list, so the piece's structure has exactly one source
 * and its choreography cannot drift from the scene names it is keyed to. A duplicate name
 * binds to its first occurrence.
 */
export function deriveTimeline(scenes: readonly Scene[]): Timeline {
  const sections: Section[] = [];
  const cues: Record<string, number> = {};
  let playStart = 0;
  let authStart = 0;

  for (const scene of scenes) {
    const nat = scene.nat ?? scene.dur;
    sections.push({ name: scene.name, playStart, dur: scene.dur, authStart, nat });
    if (!Object.prototype.hasOwnProperty.call(cues, scene.name)) cues[scene.name] = authStart;
    playStart += scene.dur;
    authStart += nat;
  }

  return { sections, cues, playbackTotal: playStart, authoredTotal: authStart };
}

/** Playback seconds → authored seconds. The clock every frame is rendered from. */
export function toAuthored(timeline: Timeline, playbackTime: number): number {
  const { sections } = timeline;
  if (sections.length === 0) return 0;

  const section =
    sections.find((s) => playbackTime < s.playStart + s.dur) ?? sections[sections.length - 1];
  const local = clamp(playbackTime - section.playStart, 0, section.dur);
  const authored =
    section.authStart + (section.dur > 0 ? local * (section.nat / section.dur) : 0);
  return Math.min(authored, timeline.authoredTotal);
}

/** Authored seconds → playback seconds. The inverse of {@link toAuthored}. */
export function toPlayback(timeline: Timeline, authoredTime: number): number {
  const { sections } = timeline;
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (authoredTime >= s.authStart) {
      const rate = s.nat > 0 ? s.dur / s.nat : 1;
      return s.playStart + Math.min(authoredTime - s.authStart, s.nat) * rate;
    }
  }
  return authoredTime;
}

/**
 * A duration written in playback seconds, expressed in the authored seconds of one scene.
 *
 * Reveal staggers inside a retimed scene are authored as real durations — "0.3s per field" —
 * and have to survive the scene being played shorter or longer than it was authored.
 */
export function playbackSeconds(timeline: Timeline, sceneName: string, seconds: number): number {
  const section = timeline.sections.find((s) => s.name === sceneName);
  const rate = section && section.nat > 0 ? section.dur / section.nat : 1;
  return rate === 0 ? seconds : seconds / rate;
}
