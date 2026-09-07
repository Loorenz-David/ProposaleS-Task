import { deriveTimeline, type Scene } from "./composition";

/**
 * The demo's outline: nine named slices of the timeline, in order.
 *
 * This list is the animation's structure. Every cue the scene is choreographed against is
 * derived from it, so renaming or reordering a slice here retimes the whole piece rather than
 * leaving a component keyed to a moment that no longer exists.
 *
 * `dur` is playback length; `nat` is the length the slice was authored at, present only where
 * the two differ. Brief, Proposition, Review and Approve are authored longer than they play:
 * their choreography is dense and their holds are what gets shortened.
 */
export const DEMO_SCENES: readonly Scene[] = [
  {
    name: "Establish",
    dur: 2.2,
    desc: "A wide, still view of the Proposal Copilot workspace: agent column on the left, empty review pane on the right.",
  },
  {
    name: "Brief",
    dur: 2,
    nat: 3,
    desc: "The client brief appears in the composer, is held long enough to read, then submitted.",
  },
  {
    name: "Reasoning",
    dur: 2.2,
    desc: "The agent shows its working state while it reads the brief and matches content.",
  },
  {
    name: "Clarify",
    dur: 7,
    desc: "The camera moves in on the clarification panel; two consequential questions are answered and sent.",
  },
  {
    name: "Proposition",
    dur: 2,
    nat: 9,
    desc: "The structured proposal appears in the review pane, fields and line items staggering in.",
  },
  {
    name: "Review",
    dur: 2.7,
    nat: 7,
    desc: "The camera moves to the fields card; an assumed transfer count is corrected by hand and the draft resolves.",
  },
  {
    name: "Approve",
    dur: 2.5,
    nat: 5,
    desc: "The camera pulls back, the create action turns available, and the human approves it.",
  },
  {
    name: "Create",
    dur: 7,
    desc: "The creating state runs briefly, then the created state reveals the draft and the pricing Proposales applied.",
  },
  {
    name: "Resolve",
    dur: 3,
    desc: "The camera pulls back to the completed workspace and holds the end frame.",
  },
];

/** Derived once: the scene list is static, so its cue table is too. */
export const DEMO_TIMELINE = deriveTimeline(DEMO_SCENES);
