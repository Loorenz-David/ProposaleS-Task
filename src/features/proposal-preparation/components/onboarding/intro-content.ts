/**
 * Copy and structure for the Proposal Copilot reviewer intro.
 *
 * This is data, not a tour engine: `ProposalCopilotIntro` walks this array and knows nothing
 * about any individual slide, so changing copy, reordering slides, adding media, or adding a
 * slide with a new body shape never touches navigation logic.
 *
 * The six slides tell one deliberate story — what it is, how it works, what to type, what to
 * watch, how work is organised, and how to start — so slides differ in internal composition
 * on purpose. Each `IntroSlideBody` variant is its own editorial layout, not a shared card
 * template with different text poured into it. Slides 1 and 2 carry rendered diagrams; the
 * compositions they used to draw from their own copy are gone, so their `alt` text is now the
 * only place that copy exists.
 */

/** The demo brief a reviewer is invited to paste. Intentionally incomplete. */
export const DEMO_BRIEF =
  "We’re organizing a two-day strategy offsite in Stockholm for 24 people in October. " +
  "Everyone needs somewhere to stay, we need a room to work from during the day, lunch both " +
  "days and probably airport transfers. A few people may stay an extra night.";

/**
 * The base every hosted intro asset is built from. One origin, named once. Like the diagrams
 * it serves, it is authored here and never derived from input, so the user-supplied-URL rules
 * in contract 10 §9 do not come into play. `next.config.ts` allowlists this origin for
 * `next/image`.
 */
const MEDIA_ORIGIN = "https://test-bootstrap-local.s3.eu-north-1.amazonaws.com/proposales_media";

/**
 * The two rendered diagrams. They replace the compositions slides 1 and 2 used to draw from
 * their own copy, so the information they carry now lives in the artwork — which is exactly why
 * each one's `alt` restates it in full rather than naming the picture. A reviewer using a screen
 * reader, or a browser that failed to load the image, gets the same six steps.
 */
export const FLOW_DIAGRAM = {
  src: `${MEDIA_ORIGIN}/step_1.png`,
  width: 1893,
  height: 831,
  alt:
    "Four stages in sequence. Brief: you describe the request. Agent: the Copilot interprets " +
    "and structures it. Review: you review and approve. Proposales: a structured proposal " +
    "draft is created.",
} as const;

export const WORKFLOW_DIAGRAM = {
  src: `${MEDIA_ORIGIN}/step_2.png`,
  width: 1271,
  height: 1238,
  alt:
    "A loop of six steps. 01 Describe: write naturally, the brief can be incomplete or messy. " +
    "02 Reason: the agent searches the available Proposales content. 03 Clarify: consequential " +
    "unknowns become questions, not assumptions. 04 Review: inspect the proposition, edit it, " +
    "or ask for a revision. 05 Approve: nothing is created until you explicitly approve. " +
    "06 Create draft: the approved payload is executed as a Proposales draft.",
} as const;

/**
 * Optional media for a slide. Rendered by `intro-media.tsx` between the description and the
 * body, so a slide can gain a still, a clip or the product-demo animation without changing its
 * body variant.
 *
 * `loop` selects the video posture `intro-media.tsx` documents: absent, the clip waits to be
 * played; true, it is an ambient muted demonstration that repeats and honours reduced motion.
 *
 * `animation` has no `src`: the demonstration it names is drawn by
 * `demo-animation/demo-scene.tsx` rather than fetched, so the only thing a slide chooses about
 * it is the accessible name it is given. There is exactly one such piece, which is why the
 * variant names no artwork.
 */
export type IntroMedia =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  | { kind: "video"; src: string; title: string; poster?: string; loop?: boolean }
  | { kind: "animation"; title: string };

/**
 * A slide-specific secondary action, rendered in the footer beside the primary control.
 * A closed union rather than a callback: the intro owns the small set of things a slide may
 * offer, and adding one is a deliberate edit here.
 */
export type IntroSlideAction = { kind: "copy-demo-prompt"; label: string };

/**
 * A slide-scoped link out of the application, rendered at the foot of the slide's own content
 * rather than beside the primary navigation — it is an aside for a curious reviewer, not a
 * step in the tour. Only slide 1 carries one.
 */
export type IntroSlideLink = { href: string; label: string };

/** The status vocabulary the real session tab strip derives (`client/view-models/session-tab.ts`). */
export type IntroTabStatus = "working" | "questions" | "ready";

/**
 * A rendered diagram standing in for a slide's composition.
 *
 * `fit` is the one thing the artwork cannot decide for itself: a wide strip wants the full
 * column, while a near-square loop at full width would push everything under it off the
 * dialog's scroll. It selects a width treatment, not a class name — layout stays in the
 * component ([15-ui-styling-and-component-system.md] §2), and this file stays data.
 */
export type IntroDiagram = {
  kind: "diagram";
  src: string;
  alt: string;
  width: number;
  height: number;
  fit: "full" | "compact";
  boundary?: { label: string; detail: string };
};

export type IntroSlideBody =
  | IntroDiagram
  | { kind: "demo-prompt" }
  | { kind: "proof-points"; points: { label: string; detail: string }[] }
  | {
      kind: "session-tabs";
      tabs: { title: string; status: IntroTabStatus; statusText: string; isActive: boolean }[];
      newSessionLabel: string;
      caption: string;
      callouts: { title: string; detail: string }[];
    }
  | { kind: "checklist"; items: string[]; note: string };

export type IntroSlide = {
  id: string;
  eyebrow?: string;
  heading: string;
  description: string;
  media?: IntroMedia;
  body: IntroSlideBody;
  supporting?: string;
  link?: IntroSlideLink;
  action?: IntroSlideAction;
};

export const INTRO_SLIDES: readonly IntroSlide[] = [
  {
    id: "welcome",
    eyebrow: "Proposal Copilot",
    heading: "From messy brief to proposal draft.",
    description:
      "Proposal Copilot is an agentic interaction layer over the Proposales API. Give it incomplete commercial intent and it helps turn that intent into a structured proposal ready for human review.",
    body: { kind: "diagram", ...FLOW_DIAGRAM, fit: "full" },
    supporting:
      "This demo uses a fictional hotel chain, Nordhaven Hotels, backed by real Content Library items in Proposales.",
    link: {
      href: "https://github.com/Loorenz-David/ProposaleS-Task",
      label: "View source on GitHub",
    },
  },
  {
    id: "how-it-works",
    heading: "The agent prepares. You decide.",
    description:
      "The agent does the assembling. Every consequential decision stays with you, and nothing reaches Proposales until you approve it.",
    body: {
      kind: "diagram",
      ...WORKFLOW_DIAGRAM,
      fit: "compact",
      // Kept as text on purpose: the artwork draws the six steps but makes no claim about who
      // authorizes creation, and that claim is the point of the slide.
      boundary: {
        label: "The boundary",
        detail: "The agent prepares the action. Human approval authorizes creation.",
      },
    },
  },
  {
    id: "try-it",
    heading: "Try a deliberately incomplete brief.",
    description:
      "Paste this into the composer on the left. It is missing several facts a real proposal would need.",
    media: {
      kind: "animation",
      title:
        "Animation: the whole loop, from pasting this brief to the created Proposales draft — " +
        "the agent asks about the rooms and the extra night, the proposition is reviewed and an " +
        "assumed transfer count corrected, and the draft is created only after approval.",
    },
    body: { kind: "demo-prompt" },
    supporting:
      "The ambiguity is intentional. A useful agent should recognise the hotel context and find relevant Nordhaven content — and it should also ask about the missing commercial facts rather than inventing them.",
  },
  {
    id: "what-to-watch",
    heading: "Watch the boundaries, not just the AI.",
    description:
      "The interesting part of this demo is not simply whether a language model can write proposal text.",
    body: {
      kind: "proof-points",
      points: [
        { label: "Clarification", detail: "Important unknowns become questions rather than silent assumptions." },
        { label: "Real content", detail: "Services come from the configured Proposales Content Library." },
        { label: "Human approval", detail: "The proposition can be reviewed and corrected before creation." },
        { label: "Applied pricing", detail: "Proposales remains authoritative for configured library pricing." },
        { label: "Draft, not send", detail: "Proposal Copilot creates a draft. Sending stays in Proposales." },
      ],
    },
  },
  {
    id: "sessions",
    heading: "One workspace. Multiple proposal sessions.",
    description:
      "Proposal Copilot is not one global chat. Each tab is a separate piece of proposal work with its own brief, questions and proposition, so different commercial contexts stay apart.",
    body: {
      kind: "session-tabs",
      // Titles are what the application actually renders today: every session is created as
      // "New proposal session" and nothing renames it. What distinguishes tabs on screen is
      // the status dot, so that is what this illustration distinguishes them by.
      tabs: [
        { title: "New proposal session", status: "ready", statusText: "Ready", isActive: true },
        { title: "New proposal session", status: "questions", statusText: "Needs you", isActive: false },
        { title: "New proposal session", status: "working", statusText: "Working", isActive: false },
      ],
      newSessionLabel: "New session",
      caption: "Each tab carries its own workflow context. The dot is its state.",
      callouts: [
        { title: "Separate context", detail: "A brief, its questions and its proposition belong to one session." },
        { title: "Switch tasks", detail: "Move between sessions without restarting a conversation." },
        { title: "Start another", detail: "Open a new session for an unrelated proposal." },
      ],
    },
    supporting:
      "Sessions last for the current page lifetime. A session keeps running its turn while you work in another tab and flags the result when it lands, but refreshing the page clears the workspace and starts fresh.",
  },
  {
    id: "start",
    heading: "Ready to try it?",
    description: "The whole loop takes about a minute.",
    body: {
      kind: "checklist",
      items: [
        "Paste the brief.",
        "Answer the clarification.",
        "Review the proposition.",
        "Approve it.",
        "Create the draft.",
        "Open it in Proposales.",
      ],
      note:
        "This is an intentionally scoped take-home MVP. Workspace state is page-lifetime only, so refreshing the page starts a fresh workspace.",
    },
    action: { kind: "copy-demo-prompt", label: "Copy demo prompt" },
  },
];
