/**
 * Copy and structure for the Proposal Copilot reviewer intro.
 *
 * This is data, not a tour engine: `ProposalCopilotIntro` walks this array and knows nothing
 * about any individual slide, so changing copy, reordering slides, or adding a slide with a
 * new body shape never touches navigation logic.
 *
 * Deliberately NOT modelled here: an optional `image`/`video` field. No slide uses one, and
 * contract 13 §1 (question 8) and 12 "Structure and abstraction" prohibit an abstraction whose
 * only justification is anticipated reuse. Adding media later is a new `IntroSlideBody`
 * variant plus one arm in `intro-slide.tsx` — the property the data-driven shape exists to
 * protect — not a rewrite.
 */

/** The demo brief a reviewer is invited to paste. Intentionally incomplete. */
export const DEMO_BRIEF =
  "We’re organizing a two-day strategy offsite in Stockholm for 24 people in October. " +
  "Everyone needs somewhere to stay, we need a room to work from during the day, lunch both " +
  "days and probably airport transfers. A few people may stay an extra night.";

export type IntroSlideBody =
  | { kind: "flow"; stages: string[] }
  | { kind: "steps"; steps: { ordinal: string; title: string; detail: string }[] }
  | { kind: "demo-prompt" }
  | { kind: "proof-points"; points: { label: string; detail: string }[] }
  | { kind: "checklist"; items: string[]; note: string };

export type IntroSlide = {
  id: string;
  eyebrow?: string;
  heading: string;
  description: string;
  supporting?: string;
  body: IntroSlideBody;
};

export const INTRO_SLIDES: readonly IntroSlide[] = [
  {
    id: "welcome",
    eyebrow: "Proposal Copilot",
    heading: "From messy brief to proposal draft.",
    description:
      "Proposal Copilot is an agentic interaction layer over the Proposales API. Give it incomplete commercial intent and it helps turn that intent into a structured proposal ready for human review.",
    supporting:
      "This demo uses a fictional hotel chain, Nordhaven Hotels, backed by real Content Library items in Proposales.",
    body: { kind: "flow", stages: ["Brief", "Agent", "Review", "Proposales"] },
  },
  {
    id: "how-it-works",
    heading: "The agent prepares. You decide.",
    description:
      "The agent does the assembling. Every consequential decision stays with you, and nothing reaches Proposales until you approve it.",
    body: {
      kind: "steps",
      steps: [
        {
          ordinal: "01",
          title: "Describe the opportunity",
          detail: "Write naturally. The brief can be incomplete or messy.",
        },
        {
          ordinal: "02",
          title: "Let the agent reason",
          detail:
            "It searches the available Proposales content and identifies what is missing.",
        },
        {
          ordinal: "03",
          title: "Clarify when needed",
          detail:
            "Consequential unknowns become questions instead of silent assumptions.",
        },
        {
          ordinal: "04",
          title: "Review and approve",
          detail:
            "Edit the proposition or ask for a revision before approving anything.",
        },
        {
          ordinal: "05",
          title: "Create the draft",
          detail:
            "Only after approval does Proposal Copilot create the Proposales draft.",
        },
      ],
    },
  },
  {
    id: "what-to-test",
    heading: "Try a deliberately incomplete brief.",
    description:
      "Paste this into the composer on the left. It is missing several facts a real proposal would need.",
    supporting:
      "A useful agent should recognise the hotel context and find relevant Nordhaven content — and it should also recognise the ambiguity rather than inventing the missing commercial facts.",
    body: { kind: "demo-prompt" },
  },
  {
    id: "what-to-look-for",
    heading: "Watch the boundaries, not just the AI.",
    description:
      "The interesting part of this demo is not simply whether a language model can write proposal text.",
    body: {
      kind: "proof-points",
      points: [
        {
          label: "Clarification",
          detail: "The agent should ask when consequential information is missing.",
        },
        {
          label: "Real content",
          detail:
            "Selected services come from the configured Proposales Content Library.",
        },
        {
          label: "Human approval",
          detail:
            "The proposition can be reviewed and corrected before any draft is created.",
        },
        {
          label: "Applied pricing",
          detail:
            "Proposal Copilot does not invent library prices. Proposales applies its configured pricing, and the result is read back after creation.",
        },
        {
          label: "Draft, not send",
          detail: "The final action creates a draft. Sending stays in Proposales.",
        },
      ],
    },
  },
  {
    id: "start",
    heading: "Ready to try it?",
    description: "The whole loop takes about a minute.",
    body: {
      kind: "checklist",
      items: [
        "Paste the demo brief.",
        "Answer any clarification the agent asks for.",
        "Review the proposition, or ask for a revision.",
        "Approve it.",
        "Open the resulting draft in Proposales.",
      ],
      note:
        "This is an intentionally scoped take-home MVP. Workspace state is page-lifetime only, so refreshing the page starts a fresh session.",
    },
  },
];
