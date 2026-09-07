import type { ReactNode } from "react";

import {
  animate,
  clamp,
  EASE,
  interpolate,
  playbackSeconds,
  toPlayback,
  type Curve,
} from "./composition";
import { DEMO_TIMELINE } from "./demo-scenes";

/**
 * The product demo, drawn as one frame of a 1280x720 scene at authored time `T`.
 *
 * This is a **rendered illustration of the workspace, not the workspace**. Every value it
 * shows is an authored literal and every motion is a pure function of `T`: no production
 * state, no timers, no arithmetic on prices, nothing that could disagree with the real
 * application by computing something. It replaced a screen recording and it is read the same
 * way — a picture of the product, whose frames happen to be laid out rather than decoded.
 *
 * ## Why this file styles inline
 *
 * Contract 15 §3 reserves the `style` prop for values that cannot be known at build time, and
 * §1 makes Tailwind the styling mechanism for production UI. The interior of this file is the
 * one recorded exemption from §3 (`architectural_contracts/README.md`, "Resolved decisions",
 * *Rendered animation interiors*), for two reasons:
 *
 * - The scene is authored in one fixed 1280x720 coordinate space that the frame scales as a
 *   unit ([intro-demo-animation.tsx]). Its `px` are positions inside a picture, not layout
 *   measurements of the application, so Tailwind's spacing scale does not describe them and
 *   expressing each one as an arbitrary value (`left-[427px]`) would trip §2's own warning
 *   about raw values while making the composition harder to read, not easier.
 * - Most of what is set here genuinely is per-frame: opacity, transform, and the colours that
 *   swing with the demo's state all fall out of `T`.
 *
 * What the deviation does **not** cover is visual values. Every colour, font family, shadow
 * and keyframe below resolves to a `theme.css` token, so the palette is still defined once
 * and a correction there reaches this scene ([15-ui-styling-and-component-system.md] §2). The
 * production chrome around the scene — the frame, its border, its play control — is ordinary
 * Tailwind.
 *
 * The one thing carried over unchanged from the source is the *design*: layout, hierarchy,
 * copy and choreography are the prototype's to decide ([16-design-prototype-porting.md] §1).
 */

const TL = DEMO_TIMELINE;
const CUES = TL.cues;

/** A duration authored in playback seconds, read in the authored seconds of one scene. */
const pd = (scene: string, seconds: number) => playbackSeconds(TL, scene, seconds);
/** Authored seconds on the playback clock, for motion that must last a real fixed time. */
const tp = (authored: number) => toPlayback(TL, authored);

/*
 * The scene's palette, every entry a `theme.css` token. The names are the scene's own
 * shorthand — this table is the only place they are bound to a token, and nothing below
 * writes a colour literal.
 *
 * Two of design 01 §5's ratified corrections land here, because the source animation was
 * authored against the uncorrected ramp: its two darkest inks (#6b6d73, #5b5d63) both resolve
 * to the corrected `--color-fg-quiet`, and the value it used as a decorative glyph (#3a3c41)
 * is deliberately not exposed by the theme as a readable ink at all, so it resolves to the
 * border-ramp entry that holds that value. The scene loses one step of ink hierarchy exactly
 * where the application already lost it.
 */
const C = {
  app: "var(--color-bg)",
  agent: "var(--color-bg-agent-pane)",
  tabs: "var(--color-bg-tab-strip)",
  card: "var(--color-bg-card)",
  ctrl: "var(--color-bg-control)",
  strong: "var(--color-bg-control-strong)",

  hair: "var(--color-border-hairline)",
  div: "var(--color-border-divider)",
  bc: "var(--color-border-card)",
  bctrl: "var(--color-border-control)",
  braise: "var(--color-border-control-raised)",
  belev: "var(--color-border-elevated)",

  t1: "var(--color-fg)",
  bubble: "var(--color-fg-bubble)",
  body: "var(--color-fg-body)",
  control: "var(--color-fg-control)",
  sec2: "var(--color-fg-secondary-strong)",
  sec: "var(--color-fg-secondary)",
  muted: "var(--color-fg-muted)",
  mutedPanel: "var(--color-fg-muted-panel)",
  quietest: "var(--color-fg-quietest)",
  quiet: "var(--color-fg-quiet)",
  /* Decorative glyphs only (design 01 §5 correction 2 keeps this value out of the ink ramp). */
  glyph: "var(--color-border-elevated)",

  acc: "var(--color-accent)",
  accInk: "var(--color-accent-ink-on-dark)",
  accWash: "var(--color-accent-wash)",
  accHover: "var(--color-accent-hover-button)",
  pos: "var(--color-positive)",
  posBright: "var(--color-positive-bright)",
  posBadge: "var(--color-positive-wash-badge)",
  posMedallion: "var(--color-positive-wash-medallion)",
  posEdge: "var(--color-positive-medallion-border)",
  att: "var(--color-attention)",
  attWash: "var(--color-attention-wash)",
  diffOld: "var(--color-diff-old-value)",
} as const;

const F = "var(--font-sans)";
const MO = "var(--font-mono)";
/*
 * Ink on a filled accent control. The source animation used plain white; the application's own
 * filled accent controls all use `--color-bg`, so the illustration follows the product rather
 * than the prototype on a point the product has already decided.
 */
const ON_ACCENT = C.app;

/**
 * The scene's two motion helpers. Nothing below reaches for an easing curve directly, so the
 * piece has one vocabulary of movement rather than a curve chosen per element.
 */
const MOTION = {
  enter: (start: number, dur = 0.55) =>
    animate({ from: 0, to: 1, start, end: start + dur, ease: EASE.easeOutCubic }),
  pop: (start: number, dur = 0.2) =>
    animate({ from: 0, to: 1, start, end: start + dur, ease: EASE.easeOutQuad }),
};

/**
 * The stage the frame scales as a unit. The workspace itself is drawn at 1280x720 and sits
 * inside it at 1.4x, which is what leaves the composition room to breathe at the wide camera
 * mark without the interface rendering at illegible type sizes.
 */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;
const SCENE_WIDTH = 1280;
const SCENE_HEIGHT = 720;
const PANE = 392;
const HANDLE = 6;

/* ── camera ──────────────────────────────────────────────────────────────── */

/** Camera marks as `[x, y, zoom]` in scene coordinates. */
type Mark = readonly [number, number, number];

const WIDE: Mark = [640, 360, 1];
const CLARIFY: Mark = [427, 480, 1.5];
const REVIEW: Mark = [853, 270, 1.5];
const APPROVE: Mark = [840, 240, 1.5];
const PRICING: Mark = [890, 500, 1.8];

/**
 * Camera keys live on the playback clock, so every move is a real 1.1s however the scene it
 * sits in was retimed. A shortened scene loses hold, never the move.
 */
function cameraKeys(): readonly (readonly [number, Mark])[] {
  const Q = CUES.Clarify;
  const V = CUES.Review;
  const AP = CUES.Approve;
  const CR = CUES.Create;
  const RS = CUES.Resolve;
  return [
    [0, WIDE],
    [tp(Q + 0.5), WIDE],
    [tp(Q + 0.5) + 1.1, CLARIFY],
    [tp(Q + 5.9), CLARIFY],
    [tp(Q + 5.9) + 1.1, WIDE],
    [tp(V + 0.05), WIDE],
    [tp(V + 0.05) + 1.1, REVIEW],
    [tp(AP + 0.4), REVIEW],
    [tp(AP + 0.4) + 0.9, APPROVE],
    [tp(AP + 4.8), APPROVE],
    [tp(CR + 0.2) + 1.1, WIDE],
    [tp(CR + 3.9), WIDE],
    [tp(CR + 3.9) + 1.1, PRICING],
    [tp(CR + 6.6), PRICING],
    [tp(RS + 0.2) + 1.1, WIDE],
    [tp(RS + 3.0), WIDE],
  ];
}

const CAMERA_KEYS = cameraKeys();
const CAMERA_TIMES = CAMERA_KEYS.map((k) => k[0]);
const CAMERA_X = interpolate(
  CAMERA_TIMES,
  CAMERA_KEYS.map((k) => k[1][0]),
  EASE.easeInOutCubic,
);
const CAMERA_Y = interpolate(
  CAMERA_TIMES,
  CAMERA_KEYS.map((k) => k[1][1]),
  EASE.easeInOutCubic,
);
const CAMERA_Z = interpolate(
  CAMERA_TIMES,
  CAMERA_KEYS.map((k) => k[1][2]),
  EASE.easeInOutCubic,
);

/** The camera as a transform: the point it is looking at, held inside the scene's bounds. */
function cameraTransform(T: number): string {
  const t = tp(T);
  const z = CAMERA_Z(t);
  const halfW = SCENE_WIDTH / (2 * z);
  const halfH = SCENE_HEIGHT / (2 * z);
  const x = clamp(CAMERA_X(t), halfW, SCENE_WIDTH - halfW);
  const y = clamp(CAMERA_Y(t), halfH, SCENE_HEIGHT - halfH);
  return `translate(${640 - x * z}px,${360 - y * z}px) scale(${z})`;
}

/* ── annotations ─────────────────────────────────────────────────────────── */

type AnnotationItem = { at: number; until: number; text: string; align?: "left" | "right" };

const ANNOTATION_FADE = 0.2;

/**
 * One annotation element, at most one visible at a time, placed clear of the control the beat
 * is about. These are the animation's captions — the only text in the piece that speaks about
 * the product rather than being part of it.
 */
function Annotation({ T, items }: { T: number; items: readonly AnnotationItem[] }) {
  let active: AnnotationItem | null = null;
  let end = Infinity;
  for (const item of items) {
    if (T < item.at) break;
    active = item;
    end = item.until;
  }
  if (!active || T >= end) return null;

  const opacity = clamp(
    Math.min((T - active.at) / ANNOTATION_FADE, (end - T) / ANNOTATION_FADE),
    0,
    1,
  );
  const justify =
    active.align === "right" ? "flex-end" : active.align === "left" ? "flex-start" : "center";

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 0,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: justify,
        opacity,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: `color-mix(in srgb, ${C.card} 96%, transparent)`,
          border: `1px solid ${C.braise}`,
          borderRadius: 99,
          padding: "9px 20px",
          font: `600 23px ${F}`,
          color: C.control,
        }}
      >
        {active.text}
      </span>
    </div>
  );
}

/* ── small presentation primitives ───────────────────────────────────────── */

function Dot({ color, size = 7, pulse = false }: { color: string; size?: number; pulse?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flex: `0 0 ${size}px`,
        animation: pulse ? "var(--animate-pulse-dot-slow)" : "none",
      }}
    />
  );
}

function Flag({ text, tone }: { text: string; tone: string }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 600, color: tone, flex: "0 0 auto" }}>{text}</span>
  );
}

/* ── agent surface ───────────────────────────────────────────────────────── */

function AgentHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 14px 10px 18px",
        flex: "0 0 auto",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: C.strong,
          border: `1px solid ${C.bctrl}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.accInk,
          fontSize: 13,
          flex: "0 0 26px",
        }}
      >
        ✦
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Proposal Copilot</div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontFamily: MO,
          fontSize: 10,
          color: C.quiet,
          letterSpacing: ".05em",
          textTransform: "uppercase",
        }}
      >
        2 sessions
      </div>
    </div>
  );
}

function Tab({
  title,
  active = false,
  dotColor,
  pulse = false,
}: {
  title: string;
  active?: boolean;
  dotColor: string;
  pulse?: boolean;
}) {
  return (
    <div
      style={{
        flex: "1 1 132px",
        minWidth: 112,
        maxWidth: 200,
        height: 30,
        boxSizing: "border-box",
        borderRadius: "9px 9px 0 0",
        padding: "0 4px 0 9px",
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: active ? C.strong : "transparent",
        boxShadow: active ? "var(--shadow-active-tab)" : "none",
      }}
    >
      <Dot color={dotColor} pulse={pulse} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 12,
          fontWeight: 600,
          color: active ? C.t1 : C.muted,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </div>
      {active ? (
        <div
          style={{
            width: 17,
            height: 17,
            borderRadius: "50%",
            color: C.quiet,
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 17px",
          }}
        >
          ✕
        </div>
      ) : null}
    </div>
  );
}

function TabStrip({ s }: { s: DemoFrame }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        padding: "0 8px 0 12px",
        background: C.tabs,
        borderBottom: `1px solid ${C.hair}`,
        flex: "0 0 auto",
      }}
    >
      <div
        style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-end", gap: 1 }}
      >
        <Tab title="Nordhaven offsite" active dotColor={s.tabDot} pulse={s.tabPulse} />
        <Tab title="Vinterbro Q4" dotColor={C.quiet} />
      </div>
      <div
        style={{
          width: 26,
          height: 26,
          flex: "0 0 26px",
          marginBottom: 2,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.muted,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
    </div>
  );
}

function StatusLine({ s }: { s: DemoFrame }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 18px 12px",
        borderBottom: `1px solid ${C.hair}`,
        flex: "0 0 auto",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 12.5,
          fontWeight: 600,
          color: C.sec,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {s.note}
      </div>
      <div
        style={{
          fontFamily: MO,
          fontSize: 10,
          color: C.quiet,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          flex: "0 0 auto",
        }}
      >
        {s.phase}
      </div>
    </div>
  );
}

const PILL_KINDS = {
  ask: { glyph: "?", background: C.attWash, ink: C.att },
  diff: { glyph: "±", background: C.posBadge, ink: C.pos },
  link: { glyph: "↗", background: C.strong, ink: C.sec },
} as const;

function Pill({
  kind,
  label,
  meta,
  affordance,
  children,
  o,
  y,
}: {
  kind: keyof typeof PILL_KINDS;
  label: string;
  meta?: string;
  affordance: string;
  children?: ReactNode;
  o: number;
  y: number;
}) {
  const K = PILL_KINDS[kind];
  return (
    <div style={{ opacity: o, transform: `translateY(${y}px)` }}>
      <div
        style={{
          width: "100%",
          height: 34,
          boxSizing: "border-box",
          background: C.card,
          border: `1px solid ${C.bctrl}`,
          borderRadius: 99,
          padding: "0 12px 0 5px",
          display: "flex",
          alignItems: "center",
          gap: 9,
          overflow: "hidden",
          color: C.control,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            flex: "0 0 24px",
            borderRadius: "50%",
            background: K.background,
            color: K.ink,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {K.glyph}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        {meta ? (
          <div
            style={{
              flex: "0 0 auto",
              fontFamily: MO,
              fontSize: 10,
              color: C.quiet,
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </div>
        ) : null}
        <div style={{ flex: "0 0 auto", fontSize: 9, color: C.quiet }}>{affordance}</div>
      </div>
      {children ? (
        <div
          style={{
            margin: "8px 0 2px 17px",
            paddingLeft: 14,
            borderLeft: `1px solid ${C.bctrl}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function DiffRow({ field, from, to }: { field: string; from: string; to: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "baseline",
        fontSize: 12.5,
      }}
    >
      <span style={{ color: C.quietest }}>{field}</span>
      <span style={{ color: C.diffOld, textDecoration: "line-through" }}>{from}</span>
      <span style={{ color: C.quiet }}>→</span>
      <span style={{ color: C.pos, fontWeight: 600 }}>{to}</span>
    </div>
  );
}

/** The brief the demo pastes. The same literal slide 3 invites the reviewer to copy. */
const BRIEF =
  "We’re organizing a two-day strategy offsite in Stockholm for 24 people in October. " +
  "Everyone needs somewhere to stay, we need a room to work from during the day, lunch both " +
  "days and probably airport transfers. A few people may stay an extra night.";

function Thread({ s }: { s: DemoFrame }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        padding: "4px 18px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        justifyContent: s.threadEmpty ? "flex-start" : "flex-end",
      }}
    >
      {s.threadEmpty ? (
        <div style={{ paddingTop: 14, opacity: s.emptyO }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.t1,
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            Paste the client’s brief and I’ll turn it into a proposal.
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.6,
              textWrap: "pretty",
            }}
          >
            Notes, an email, a call summary — anything. Nothing reaches Proposales until you
            approve the draft.
          </div>
        </div>
      ) : null}

      {s.userMsg > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            opacity: s.userMsg,
            transform: `translateY(${(1 - s.userMsg) * 8}px)`,
          }}
        >
          <div
            style={{
              maxWidth: "88%",
              background: C.strong,
              border: `1px solid ${C.braise}`,
              color: C.bubble,
              fontSize: 14,
              lineHeight: 1.55,
              padding: "11px 14px",
              borderRadius: 12,
              whiteSpace: "pre-wrap",
              textWrap: "pretty",
            }}
          >
            {BRIEF}
          </div>
        </div>
      ) : null}

      {s.asst1 > 0 ? (
        <div style={{ opacity: s.asst1, transform: `translateY(${(1 - s.asst1) * 8}px)` }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: C.body, textWrap: "pretty" }}>
            Two days in Stockholm for 24 people in October. I’ve matched accommodation, a day
            meeting room, lunch both days and airport transfers from your Nordhaven content
            library.
          </div>
          {s.askPill > 0 ? (
            <div
              style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}
            >
              <Pill
                kind="ask"
                label="2 questions"
                meta={s.askMeta}
                affordance="▾"
                o={s.askPill}
                y={(1 - s.askPill) * 6}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {s.asst2 > 0 ? (
        <div style={{ opacity: s.asst2, transform: `translateY(${(1 - s.asst2) * 8}px)` }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: C.body, textWrap: "pretty" }}>
            Locked in — 24 rooms for both nights, and 4 held for the 16th.
          </div>
          <div style={{ marginTop: 10 }}>
            <Pill kind="diff" label="2 fields changed" affordance="▾" o={1} y={0}>
              <DiffRow field="Rooms" from="not set" to="24 rooms, both nights" />
              <DiffRow field="Extra night" from="not set" to="4 rooms, 16 Oct" />
            </Pill>
          </div>
        </div>
      ) : null}

      {s.asst3 > 0 ? (
        <div style={{ opacity: s.asst3, transform: `translateY(${(1 - s.asst3) * 8}px)` }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: C.body, textWrap: "pretty" }}>
            Draft created in Proposales. Nothing has been sent.
          </div>
          <div style={{ marginTop: 10 }}>
            <Pill kind="link" label="prop_4c81f6a" meta="Proposales" affordance="↗" o={1} y={0} />
          </div>
        </div>
      ) : null}

      {s.thinking > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: s.thinking }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 0.15, 0.3].map((delay) => (
              <div
                key={delay}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.muted,
                  animation: "var(--animate-pulse-dot)",
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </div>
          <div style={{ marginLeft: 4, fontSize: 13, color: C.muted }}>{s.thinkLabel}</div>
        </div>
      ) : null}
    </div>
  );
}

/* ── clarification panel ─────────────────────────────────────────────────── */

const QUESTIONS = [
  {
    eyebrow: "ROOMS",
    q: "Everyone needs somewhere to stay — should I book 24 rooms for both nights?",
    note: "You mentioned a few people may stay an extra night. I’ll handle that separately.",
    options: ["24 rooms, one per person", "12 twin-share rooms"],
    other: "Another combination…",
    skip: "Ask the client",
  },
  {
    eyebrow: "EXTRA NIGHT",
    q: "How many rooms should I hold for the extra night?",
    note: "The 16th is a Friday. Rates are the same as the offsite nights.",
    options: ["4 rooms", "6 rooms"],
    other: "Another number…",
    skip: "Ask the client",
  },
] as const;

function Option({
  label,
  selected,
  hovered,
}: {
  label: string;
  selected: boolean;
  hovered: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        fontSize: 13,
        fontWeight: 600,
        padding: "11px 13px",
        borderRadius: 9,
        background: selected ? C.accWash : C.ctrl,
        border: `1px solid ${selected || hovered ? C.acc : C.braise}`,
        color: selected || hovered ? C.t1 : C.control,
      }}
    >
      <span
        style={{
          fontFamily: MO,
          fontSize: 10,
          flex: "0 0 auto",
          color: selected ? C.accInk : C.quiet,
        }}
      >
        {selected ? "●" : "○"}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
    </div>
  );
}

function ClarificationPanel({ s }: { s: DemoFrame }) {
  const q = QUESTIONS[s.step];
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.belev}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "var(--shadow-panel)",
        display: "flex",
        flexDirection: "column",
        opacity: s.panel,
        transform: `translateY(${(1 - s.panel) * 14}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "10px 13px",
          borderBottom: `1px solid ${C.div}`,
          flex: "0 0 auto",
        }}
      >
        <Dot color={C.accInk} size={6} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: C.mutedPanel,
          }}
        >
          {q.eyebrow}
        </div>
        <div style={{ fontFamily: MO, fontSize: 10, color: C.quiet }}>{s.step + 1} of 2</div>
        <div style={{ fontSize: 14, color: C.quiet, padding: "2px 0 2px 4px" }}>✕</div>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "10px 14px 0 14px", flex: "0 0 auto" }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: s.filled[i] ? C.pos : i === s.step ? C.acc : C.braise,
            }}
          />
        ))}
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 10, padding: "13px 14px" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 14,
              fontWeight: 600,
              color: C.bubble,
              lineHeight: 1.45,
              textWrap: "pretty",
            }}
          >
            {q.q}
          </div>
          {s.filled[s.step] ? (
            <div style={{ fontSize: 12, fontWeight: 700, color: C.pos, flex: "0 0 auto" }}>✓</div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {q.options.map((option, i) => (
            <Option
              key={option}
              label={option}
              selected={s.filled[s.step] && i === 0}
              hovered={s.optHover && i === 0}
            />
          ))}
          <div
            style={{
              background: "transparent",
              border: `1px dashed ${C.braise}`,
              color: C.mutedPanel,
              fontSize: 13,
              fontWeight: 600,
              padding: "11px 13px",
              borderRadius: 9,
              textAlign: "left",
            }}
          >
            {q.other}
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: C.quiet, lineHeight: 1.5 }}>{q.note}</div>
        <div
          style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 600, color: C.quietest }}
        >
          {q.skip}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          borderTop: `1px solid ${C.div}`,
          flex: "0 0 auto",
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.quietest }}>Skip all</div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 30,
            height: 32,
            border: `1px solid ${C.braise}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: s.step > 0 ? C.control : C.quiet,
          }}
        >
          ←
        </div>
        <div
          style={{
            width: 30,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${s.nextHover ? C.belev : C.braise}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: s.step < 1 ? C.control : C.quiet,
            transform: `scale(${s.nextPress})`,
          }}
        >
          →
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 15px",
            borderRadius: 9,
            background: s.sendReady ? C.acc : C.strong,
            color: s.sendReady ? ON_ACCENT : C.quiet,
            opacity: s.sendHover ? 0.9 : 1,
            transform: `scale(${s.sendPress})`,
          }}
        >
          {s.sendLabel}
        </div>
      </div>
    </div>
  );
}

function Composer({ s }: { s: DemoFrame }) {
  return (
    <div style={{ opacity: s.composer }}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${s.briefIn > 0.5 ? C.acc : C.bctrl}`,
          borderRadius: 12,
          padding: "10px 12px",
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 38,
            padding: "4px 0",
            fontSize: 14,
            lineHeight: 1.5,
            color: s.briefIn > 0 ? C.t1 : C.quiet,
            opacity: s.briefIn > 0 ? s.briefIn : 1,
            transform: `translateY(${(1 - Math.max(s.briefIn, 0.001)) * 4}px)`,
          }}
        >
          {s.briefIn > 0 ? BRIEF : "Paste the brief, or ask for a change…"}
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            flex: "0 0 34px",
            borderRadius: 9,
            background: s.sendBtnHover ? C.accHover : C.acc,
            color: ON_ACCENT,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${s.sendBtnPress})`,
          }}
        >
          ↑
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.quiet, lineHeight: 1.5 }}>
        Enter to send · Shift + Enter for a new line
      </div>
    </div>
  );
}

function AgentPane({ s }: { s: DemoFrame }) {
  return (
    <div
      style={{
        flex: `0 0 ${PANE}px`,
        width: PANE,
        background: C.agent,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <AgentHeader />
      <TabStrip s={s} />
      <StatusLine s={s} />
      <Thread s={s} />
      <div style={{ padding: "14px 18px 18px", flex: "0 0 auto" }}>
        {s.panel > 0 ? <ClarificationPanel s={s} /> : <Composer s={s} />}
      </div>
    </div>
  );
}

/* ── review surface ──────────────────────────────────────────────────────── */

const FIELDS: readonly {
  label: string;
  value: string | null;
  flag?: readonly [string, string];
}[] = [
  { label: "Title", value: "Two-day strategy offsite — Stockholm" },
  { label: "Client", value: "Nordhaven Hotels" },
  { label: "Dates", value: "14–16 October 2026" },
  { label: "Rooms", value: "24 rooms, both nights", flag: ["From your answer", C.pos] },
  { label: "Extra night", value: "4 rooms, 16 October", flag: ["From your answer", C.pos] },
  { label: "Transfers", value: null },
];

const ITEMS: readonly {
  name: string;
  detail: string;
  price: string;
  qty: string | null;
}[] = [
  {
    name: "Classic King Room",
    detail: "Nordhaven Stockholm City · two nights",
    price: "2,450 SEK",
    qty: "24 rooms × 2 nights",
  },
  {
    name: "Conference Room — Skärgård",
    detail: "Full day, 08:00–17:00",
    price: "12,800 SEK",
    qty: "2 days",
  },
  {
    name: "Conference Lunch Buffet",
    detail: "Served in the Skärgård foyer",
    price: "395 SEK",
    qty: "24 guests × 2 days",
  },
  {
    name: "Private Airport Transfer",
    detail: "Arlanda ⇄ Nordhaven Stockholm City",
    price: "645 SEK",
    qty: null,
  },
];

const APPLIED: readonly (readonly [string, string, string])[] = [
  ["Classic King Room", "48 room nights", "117,600 SEK"],
  ["Conference Room — Skärgård", "2 days", "25,600 SEK"],
  ["Conference Lunch Buffet", "48 covers", "18,960 SEK"],
  ["Private Airport Transfer", "40 transfers", "25,800 SEK"],
];

function FieldRow({ f, s, i }: { f: (typeof FIELDS)[number]; s: DemoFrame; i: number }) {
  const isTransfers = f.label === "Transfers";
  const o = s.fieldO[i];
  const value = isTransfers
    ? s.transfersEdited
      ? "Both directions, 20 people"
      : "Both directions, 24 people"
    : f.value;
  const flag: readonly [string, string] | undefined = isTransfers
    ? s.transfersEdited
      ? ["Edited by you", C.pos]
      : ["Assumed", C.att]
    : f.flag;

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "baseline",
        padding: "13px 16px",
        borderBottom: `1px solid ${C.div}`,
        opacity: o,
        transform: `translateY(${(1 - o) * 6}px)`,
      }}
    >
      <div style={{ flex: "0 0 116px", fontSize: 12.5, color: C.quietest, paddingTop: 1 }}>
        {f.label}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "baseline",
          gap: 9,
          flexWrap: "wrap",
        }}
      >
        {isTransfers && s.editOpen > 0 ? (
          <div
            style={{
              flex: "1 1 100%",
              background: C.app,
              border: `1px solid ${C.acc}`,
              borderRadius: 7,
              padding: "6px 9px",
              margin: "-7px -10px",
              color: C.t1,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {value}
            <span style={{ opacity: 0.6 }}>|</span>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.5,
                textWrap: "pretty",
                color: isTransfers && !s.transfersEdited ? C.att : C.t1,
                borderRadius: 5,
                margin: "-2px -5px",
                padding: "2px 5px",
                background: isTransfers && s.valueHover ? C.hair : "transparent",
              }}
            >
              {value}
            </div>
            {flag ? <Flag text={flag[0]} tone={flag[1]} /> : null}
          </>
        )}
      </div>
      <div style={{ flex: "0 0 auto", fontSize: 13, color: C.glyph, padding: 2 }}>✦</div>
    </div>
  );
}

function ReviewSurface({ s }: { s: DemoFrame }) {
  const headO = s.headO;
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "22px 28px 18px",
          opacity: headO,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 9,
            minWidth: 0,
            flex: "1 1 auto",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: C.t1,
              whiteSpace: "nowrap",
              flex: "0 0 auto",
            }}
          >
            Stockholm offsite
          </div>
          <div style={{ fontSize: 17, color: C.quiet, flex: "0 0 auto" }}>·</div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: C.muted,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Nordhaven Hotels
          </div>
        </div>
        <div style={{ flex: "0 0 8px" }} />
        <div
          style={{
            display: "flex",
            gap: 3,
            padding: 3,
            background: C.card,
            border: `1px solid ${C.bctrl}`,
            borderRadius: 9,
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "7px 11px",
              borderRadius: 7,
              background: C.strong,
              color: C.t1,
            }}
          >
            Fields
          </div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "7px 11px",
              borderRadius: 7,
              color: C.muted,
            }}
          >
            Preview
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 14px",
            borderRadius: 9,
            border: `1px solid ${C.bctrl}`,
            color: C.sec,
            flex: "0 0 auto",
            whiteSpace: "nowrap",
          }}
        >
          Discard
        </div>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            padding: "11px 16px",
            borderRadius: 10,
            flex: "0 0 auto",
            minWidth: 186,
            textAlign: "center",
            whiteSpace: "nowrap",
            background: s.ready ? C.acc : C.strong,
            color: s.ready ? ON_ACCENT : C.sec2,
            transform: `scale(${s.ctaPress * s.ctaEmph})`,
            boxShadow:
              s.ctaRing > 0
                ? `0 0 0 ${3 * s.ctaRing}px color-mix(in srgb, ${C.acc} ${28 * s.ctaRing}%, transparent)`
                : "none",
            opacity: s.ctaHover ? 0.9 : 1,
          }}
        >
          {s.ready ? "Create in Proposales" : "Push anyway"}
        </div>
      </div>

      <div
        style={{
          padding: "0 28px 40px",
          maxWidth: 840,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 13, color: C.quietest, opacity: headO }}>{s.readiness}</div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.bc}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {FIELDS.map((f, i) => (
            <FieldRow key={f.label} f={f} s={s} i={i} />
          ))}
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.bc}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 16px",
              borderBottom: `1px solid ${C.div}`,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.t1 }}>Line items</div>
            <div style={{ fontSize: 11.5, color: C.quiet }}>4 from your content library</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 13, color: C.glyph }}>✦</div>
          </div>
          {ITEMS.map((it, i) => {
            const o = s.itemO[i];
            const isTransfer = it.qty === null;
            return (
              <div
                key={it.name}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "13px 16px",
                  borderBottom: `1px solid ${C.div}`,
                  opacity: o,
                  transform: `translateY(${(1 - o) * 6}px)`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 9,
                      flexWrap: "wrap",
                      marginBottom: 3,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{it.name}</div>
                    {isTransfer && s.transfersEdited ? (
                      <Flag text="Updated" tone={C.pos} />
                    ) : null}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.quietest, lineHeight: 1.45 }}>
                    {it.detail}
                  </div>
                </div>
                <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{it.price}</div>
                  <div style={{ fontSize: 11.5, color: C.quietest, marginTop: 3 }}>
                    {isTransfer
                      ? s.transfersEdited
                        ? "20 people × 2"
                        : "24 people × 2"
                      : it.qty}
                  </div>
                </div>
              </div>
            );
          })}
          <div
            style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "15px 16px" }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.muted }}>Total</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 13, color: C.quietest }}>Applied by Proposales on create</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── creating / created ──────────────────────────────────────────────────── */

function CreatingState({ o }: { o: number }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        textAlign: "center",
        opacity: o,
      }}
    >
      <div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            margin: "0 auto 18px",
            border: `2px solid ${C.bctrl}`,
            borderTopColor: C.acc,
            animation: "var(--animate-spin-fast)",
          }}
        />
        <div style={{ fontSize: 15.5, fontWeight: 700, color: C.t1 }}>Creating in Proposales</div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: C.muted }}>
          This usually takes a few seconds.
        </div>
      </div>
    </div>
  );
}

function CreatedState({ s }: { s: DemoFrame }) {
  const T = s.T;
  const e = (delay: number) => MOTION.enter(s.createdAt + delay, 0.55)(T);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        padding: "40px 28px",
        opacity: s.created,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            margin: "0 auto 18px",
            background: C.posMedallion,
            border: `1px solid ${C.posEdge}`,
            color: C.posBright,
            fontSize: 19,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: e(0),
            transform: `scale(${0.9 + 0.1 * e(0)})`,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: C.t1,
            marginBottom: 9,
            textWrap: "pretty",
            opacity: e(0.08),
            transform: `translateY(${(1 - e(0.08)) * 8}px)`,
          }}
        >
          Draft created in Proposales
        </div>
        <div
          style={{
            fontSize: 14.5,
            color: C.muted,
            lineHeight: 1.55,
            marginBottom: 24,
            textWrap: "pretty",
            opacity: e(0.16),
          }}
        >
          It is a draft, not sent. Add imagery and attachments in the portal, then send when you
          are ready.
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.bc}`,
            borderRadius: 14,
            padding: 17,
            textAlign: "left",
            marginBottom: 14,
            opacity: e(0.24),
            transform: `translateY(${(1 - e(0.24)) * 8}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                flex: "0 0 52px",
                borderRadius: 10,
                background:
                  "linear-gradient(160deg, var(--color-paper-hero-start), var(--color-paper-hero-end))",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: C.t1,
                  marginBottom: 4,
                  textWrap: "pretty",
                }}
              >
                Two-day strategy offsite — Stockholm
              </div>
              <div style={{ fontFamily: MO, fontSize: 12, color: C.muted }}>prop_4c81f6a</div>
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: "6px 11px",
                borderRadius: 99,
                background: C.bctrl,
                color: C.sec2,
                flex: "0 0 auto",
              }}
            >
              Draft
            </div>
          </div>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.bc}`,
            borderRadius: 14,
            overflow: "hidden",
            textAlign: "left",
            marginBottom: 18,
            opacity: e(0.8),
            transform: `translateY(${(1 - e(0.8)) * 10}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderBottom: `1px solid ${C.div}`,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.t1 }}>Applied pricing</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 11.5, fontWeight: 600, color: C.mutedPanel }}>
              Returned by Proposales
            </div>
          </div>
          {APPLIED.map((row, i) => (
            <div
              key={row[0]}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                padding: "10px 16px",
                borderBottom: `1px solid ${C.div}`,
                opacity: MOTION.enter(s.createdAt + 0.9 + 0.1 * i, 0.45)(T),
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.control,
                }}
              >
                {row[0]}
              </div>
              <div style={{ fontSize: 11.5, color: C.quietest, flex: "0 0 auto" }}>{row[1]}</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.t1,
                  flex: "0 0 auto",
                  minWidth: 92,
                  textAlign: "right",
                }}
              >
                {row[2]}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              padding: "14px 16px",
              opacity: MOTION.enter(s.createdAt + 1.35, 0.45)(T),
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.muted }}>Total</div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: C.t1,
              }}
            >
              187,960 SEK
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            opacity: e(0.34),
          }}
        >
          <div
            style={{
              background: C.t1,
              color: C.app,
              fontSize: 13.5,
              fontWeight: 700,
              padding: "11px 17px",
              borderRadius: 10,
            }}
          >
            Open in Proposales ↗
          </div>
          <div
            style={{
              border: `1px solid ${C.bctrl}`,
              color: C.sec2,
              fontSize: 13.5,
              fontWeight: 600,
              padding: "11px 17px",
              borderRadius: 10,
            }}
          >
            Draft another
          </div>
        </div>
      </div>
    </div>
  );
}

function MainPane({ s }: { s: DemoFrame }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {s.mainView === "empty" ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            textAlign: "center",
            opacity: s.emptyMainO,
          }}
        >
          <div style={{ maxWidth: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.muted }}>No draft yet</div>
            <div
              style={{
                marginTop: 7,
                fontSize: 13.5,
                color: C.quiet,
                lineHeight: 1.6,
                textWrap: "pretty",
              }}
            >
              The proposal appears here as the Copilot works, for you to review before anything
              is created.
            </div>
          </div>
        </div>
      ) : null}
      {s.mainView === "review" ? <ReviewSurface s={s} /> : null}
      {s.mainView === "creating" ? <CreatingState o={s.creating} /> : null}
      {s.mainView === "created" ? <CreatedState s={s} /> : null}
    </div>
  );
}

/* ── the demo's state as a pure function of authored time ────────────────── */

type DemoFrame = ReturnType<typeof buildFrame>;

/**
 * Every visible value at authored time `T`, in one pass.
 *
 * This is the animation's whole "state": derived, never stored, so seeking to a time and
 * playing up to it produce the identical frame. Nothing here is application state and nothing
 * here is computed from a price or a date — the numbers are the authored ones.
 */
function buildFrame(T: number) {
  const B = CUES.Brief;
  const R = CUES.Reasoning;
  const Q = CUES.Clarify;
  const P = CUES.Proposition;
  const V = CUES.Review;
  const AP = CUES.Approve;
  const CR = CUES.Create;

  const A = (from: number, to: number, start: number, end: number, ease?: Curve) =>
    animate({ from, to, start, end, ease: ease ?? EASE.easeInOutCubic })(T);
  const on = (t: number) => T >= t;

  const briefIn = MOTION.enter(0.95, 0.6)(T);
  const submitted = on(B + pd("Brief", 1.55));
  const step = on(Q + 3.45) ? 1 : 0;
  const filled = [on(Q + 2.6), on(Q + 4.6)];
  const sent = on(Q + 5.75);
  const transfersEdited = on(V + pd("Review", 1.85));
  const editOpen = on(V + pd("Review", 1.35)) && !on(V + pd("Review", 1.85)) ? 1 : 0;
  const creatingOn = on(CR) && !on(CR + 2.6);
  const createdOn = on(CR + 2.6);
  const ready = transfersEdited && on(AP + pd("Approve", 0.2));

  let mainView: "empty" | "review" | "creating" | "created" = "empty";
  if (createdOn) mainView = "created";
  else if (creatingOn) mainView = "creating";
  else if (on(P)) mainView = "review";

  let phase = "idle";
  let note = "New session";
  let tabDot: string = C.glyph;
  let tabPulse = false;
  if (createdOn) {
    phase = "created";
    note = "Draft created in Proposales";
    tabDot = C.pos;
  } else if (creatingOn) {
    phase = "working";
    note = "Creating the draft";
    tabDot = C.accInk;
    tabPulse = true;
  } else if (on(V + pd("Review", 2.1))) {
    phase = "ready to push";
    note = "Draft ready to review";
    tabDot = C.pos;
  } else if (on(P)) {
    phase = "1 open";
    note = "Draft ready to review";
    tabDot = C.att;
  } else if (sent) {
    phase = "working";
    note = "Applying your answers";
    tabDot = C.accInk;
    tabPulse = true;
  } else if (on(Q)) {
    phase = "2 open";
    note = "Needs two answers";
    tabDot = C.att;
  } else if (on(R)) {
    phase = "working";
    note = T < R + 0.9 ? "Reading the brief" : "Matching your content library";
    tabDot = C.accInk;
    tabPulse = true;
  } else if (submitted) {
    phase = "working";
    note = "Reading the brief";
    tabDot = C.accInk;
    tabPulse = true;
  }

  return {
    T,
    threadEmpty: !submitted,
    emptyO: MOTION.enter(0.3, 0.6)(T),
    emptyMainO: MOTION.enter(0.5, 0.6)(T) * (1 - MOTION.enter(Q + 0.6, 0.6)(T)),
    userMsg: submitted ? MOTION.enter(B + pd("Brief", 1.55), pd("Brief", 0.35))(T) : 0,
    asst1: MOTION.enter(R + 1.55, 0.5)(T),
    asst2: sent ? MOTION.enter(Q + 6.3, 0.5)(T) : 0,
    asst3: createdOn ? MOTION.enter(CR + 2.9, 0.5)(T) : 0,
    askPill: on(Q + 0.1) ? MOTION.enter(Q + 0.1, 0.45)(T) : 0,
    askMeta: sent ? "2 answered" : "2 open",
    thinking: (on(R + 0.1) && !on(R + 1.5)) || (sent && !on(Q + 6.2)) ? 1 : 0,
    thinkLabel: sent
      ? "Applying your answers"
      : T < R + 0.9
        ? "Reading the brief"
        : "Matching your content library",

    note,
    phase,
    tabDot,
    tabPulse,

    composer: on(Q + 0.45) && !on(Q + 6.1) ? 0 : 1,
    briefIn: submitted ? 0 : briefIn,
    sendBtnHover: T >= B + pd("Brief", 1.2) && T < B + pd("Brief", 1.55),
    sendBtnPress:
      A(1, 0.94, B + pd("Brief", 1.35), B + pd("Brief", 1.43)) *
      A(1, 1 / 0.94, B + pd("Brief", 1.43), B + pd("Brief", 1.51)),

    panel:
      on(Q + 0.45) && !on(Q + 6.1)
        ? MOTION.enter(Q + 0.45, 0.6)(T) * (1 - MOTION.pop(Q + 5.9, 0.2)(T))
        : 0,
    step,
    filled,
    optHover: (T >= Q + 2.2 && T < Q + 2.6) || (T >= Q + 4.2 && T < Q + 4.6),
    nextHover: T >= Q + 3.1 && T < Q + 3.45,
    nextPress: A(1, 0.92, Q + 3.28, Q + 3.38) * A(1, 1 / 0.92, Q + 3.38, Q + 3.48),
    sendReady: filled[0] || filled[1],
    sendLabel: filled[0] && filled[1] ? "Send 2 answers" : "Send answer",
    sendHover: T >= Q + 5.3 && T < Q + 5.75,
    sendPress: A(1, 0.94, Q + 5.6, Q + 5.7) * A(1, 1 / 0.94, Q + 5.7, Q + 5.8),

    mainView,
    headO: MOTION.enter(P + pd("Proposition", 0.02), pd("Proposition", 0.3))(T),
    fieldO: [0, 1, 2, 3, 4, 5].map((i) =>
      MOTION.enter(P + pd("Proposition", 0.05 + 0.09 * i), pd("Proposition", 0.3))(T),
    ),
    itemO: [0, 1, 2, 3].map((i) =>
      MOTION.enter(P + pd("Proposition", 0.62 + 0.16 * i), pd("Proposition", 0.3))(T),
    ),
    readiness: on(V + pd("Review", 2.1))
      ? "All questions resolved · nothing sent yet"
      : "1 open question · nothing sent yet",
    valueHover: T >= V + pd("Review", 1.05) && T < V + pd("Review", 1.35),
    editOpen,
    transfersEdited,

    ready,
    ctaHover: T >= AP + pd("Approve", 1.4) && T < AP + pd("Approve", 1.85),
    ctaEmph:
      1 +
      0.02 *
        (MOTION.pop(AP + pd("Approve", 0.5), pd("Approve", 0.25))(T) -
          MOTION.pop(AP + pd("Approve", 0.95), pd("Approve", 0.3))(T)),
    ctaRing:
      MOTION.pop(AP + pd("Approve", 0.45), pd("Approve", 0.25))(T) -
      MOTION.pop(AP + pd("Approve", 1.0), pd("Approve", 0.35))(T),
    ctaPress:
      A(1, 0.97, AP + pd("Approve", 1.6), AP + pd("Approve", 1.7)) *
      A(1, 1 / 0.97, AP + pd("Approve", 1.7), AP + pd("Approve", 1.8)),

    creating: MOTION.enter(CR + 0.1, 0.4)(T) * (1 - MOTION.pop(CR + 2.4, 0.2)(T)),
    created: MOTION.enter(CR + 2.6, 0.4)(T),
    createdAt: CR + 2.7,
  };
}

/** The annotations, in order. Authored against the same cues as everything else. */
const ANNOTATIONS: readonly AnnotationItem[] = [
  {
    at: 1.5,
    until: CUES.Brief + pd("Brief", 1.5),
    text: "Start with an incomplete brief",
  },
  {
    at: CUES.Clarify + 1.4,
    until: CUES.Clarify + 5.4,
    text: "Important unknowns become questions",
  },
  {
    at: CUES.Proposition + pd("Proposition", 0.35),
    until: CUES.Proposition + pd("Proposition", 1.85),
    text: "Real Proposales content",
  },
  {
    at: CUES.Review + pd("Review", 0.9),
    until: CUES.Review + pd("Review", 2.5),
    text: "Review what it assumed",
  },
  {
    at: CUES.Approve + pd("Approve", 0.35),
    until: CUES.Approve + pd("Approve", 2.2),
    text: "Nothing is created until you approve",
  },
  {
    at: CUES.Create + 4.6,
    until: CUES.Resolve + 0.4,
    text: "Pricing applied by Proposales",
  },
];

/**
 * One frame of the demo at authored time `T`, drawn into the 1920x1080 box the frame scales.
 *
 * The last half-second fades the workspace out so the loop's final frame matches its first —
 * a looping piece shows them back to back, and a hard jump would read as a glitch rather than
 * a repeat.
 */
export function DemoScene({ T }: { T: number }) {
  const s = buildFrame(T);
  const seam = 1 - MOTION.enter(TL.authoredTotal - 0.5, 0.5)(T);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: C.app }}>
      <div style={{ position: "absolute", inset: 0, opacity: seam }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            transform: "translate(64px, 8px) scale(1.4)",
            transformOrigin: "0 0",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: cameraTransform(T),
              transformOrigin: "0 0",
            }}
          >
            <div
              style={{
                display: "flex",
                width: SCENE_WIDTH,
                height: SCENE_HEIGHT,
                background: C.app,
                color: C.t1,
                fontFamily: F,
                overflow: "hidden",
              }}
            >
              <AgentPane s={s} />
              <div
                style={{
                  flex: `0 0 ${HANDLE}px`,
                  background: C.agent,
                  borderLeft: `1px solid ${C.hair}`,
                  borderRight: `1px solid ${C.hair}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 2, height: 26, borderRadius: 2, background: C.bctrl }} />
              </div>
              <MainPane s={s} />
            </div>
          </div>
        </div>
      </div>

      <Annotation T={T} items={ANNOTATIONS} />
    </div>
  );
}
