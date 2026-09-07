import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

import { IntroProvider } from "./intro-context";
import type { IntroSlideBody, IntroSlide as IntroSlideModel } from "./intro-content";
import { IntroSlide } from "./intro-slide";
import { ProposalCopilotIntro } from "./proposal-copilot-intro";
import { ProposalWorkspace } from "../workspace/proposal-workspace";

/**
 * jsdom 30 implements neither `showModal()` nor `close()` on HTMLDialogElement, so the
 * behaviours this suite asserts on top of them are modelled here — the same shim
 * `confirm-dialog.test.tsx` already installs for the workspace's other native dialog.
 *
 * Recorded limit: this models the platform contract (opener recorded, first focusable
 * focused, opener refocused on close, `close` event fired). The real focus trap, the inert
 * background and Escape's delivery are the browser's, and are not re-proved here.
 */
const openers = new WeakMap<HTMLDialogElement, HTMLElement>();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    openers.set(this, document.activeElement as HTMLElement);
    this.setAttribute("open", "");
    this.querySelector<HTMLButtonElement>("button")?.focus();
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    openers.get(this)?.focus();
    this.dispatchEvent(new Event("close"));
  };
});

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

/** The six steps, in the order the product story requires them. */
const SLIDE_HEADINGS = [
  "From messy brief to proposal draft.",
  "The agent prepares. You decide.",
  "Try a deliberately incomplete brief.",
  "Watch the boundaries, not just the AI.",
  "One workspace. Multiple proposal sessions.",
  "Ready to try it?",
];

/** The exact brief slide 3 must present, written out independently of the source constant. */
const DEMO_BRIEF_LITERAL =
  "We’re organizing a two-day strategy offsite in Stockholm for 24 people in October. " +
  "Everyone needs somewhere to stay, we need a room to work from during the day, lunch both " +
  "days and probably airport transfers. A few people may stay an extra night.";

function renderIntro() {
  const view = render(
    <IntroProvider>
      <ProposalCopilotIntro />
    </IntroProvider>,
  );
  const dialog = view.container.querySelector<HTMLDialogElement>("[data-intro-dialog]")!;
  return { ...view, dialog };
}

const next = () => screen.getByRole("button", { name: "Next" });
const back = () => screen.getByRole("button", { name: "Back" });

describe("ProposalCopilotIntro", () => {
  it("opens on initial mount, on the first slide, with the primary action focused", () => {
    const { dialog } = renderIntro();
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("heading", { name: "From messy brief to proposal draft." })).toBeInTheDocument();
    expect(next()).toHaveFocus();
  });

  it("advances with Next and returns with Back", () => {
    renderIntro();
    fireEvent.click(next());
    expect(screen.getByRole("heading", { name: "The agent prepares. You decide." })).toBeInTheDocument();
    fireEvent.click(back());
    expect(screen.getByRole("heading", { name: "From messy brief to proposal draft." })).toBeInTheDocument();
  });

  it("traverses all six steps in order, forwards and back", () => {
    renderIntro();
    for (const heading of SLIDE_HEADINGS.slice(1)) {
      fireEvent.click(next());
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    for (const heading of [...SLIDE_HEADINGS].reverse().slice(1)) {
      fireEvent.click(back());
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: SLIDE_HEADINGS[0] })).toBeInTheDocument();
  });

  it("offers six progress controls, one per step", () => {
    renderIntro();
    SLIDE_HEADINGS.forEach((heading, index) => {
      expect(
        screen.getByRole("button", { name: `Slide ${index + 1} of 6: ${heading}` }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /^Slide 7 of/ })).not.toBeInTheDocument();
  });

  it("holds both boundaries: Back is unavailable first, and the last step starts instead of advancing", async () => {
    const { dialog } = renderIntro();
    expect(back()).toBeDisabled();

    // The primary control stays "Next" for every step but the last.
    for (let step = 0; step < SLIDE_HEADINGS.length - 1; step += 1) {
      expect(screen.queryByRole("button", { name: "Start exploring" })).not.toBeInTheDocument();
      fireEvent.click(next());
    }

    expect(screen.getByRole("heading", { name: "Ready to try it?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(back()).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Start exploring" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  });

  it("places the session step immediately before the final step", () => {
    renderIntro();
    const sessionIndex = SLIDE_HEADINGS.indexOf("One workspace. Multiple proposal sessions.");
    expect(sessionIndex).toBe(SLIDE_HEADINGS.length - 2);

    for (let step = 0; step < sessionIndex; step += 1) fireEvent.click(next());
    expect(screen.getByRole("heading", { name: SLIDE_HEADINGS[sessionIndex] })).toBeInTheDocument();
    fireEvent.click(next());
    expect(screen.getByRole("heading", { name: "Ready to try it?" })).toBeInTheDocument();
  });

  it("jumps directly to a slide from the progress control", () => {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 4 of 6:/ }));
    expect(screen.getByRole("heading", { name: "Watch the boundaries, not just the AI." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Slide 4 of 6:/ })).toHaveAttribute("aria-current", "step");
  });

  it("closes on Skip intro", async () => {
    const { dialog } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  });

  it("closes on Escape", async () => {
    const { dialog } = renderIntro();
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  });

  it("renders the demo brief exactly", () => {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 6:/ }));
    expect(screen.getByText(DEMO_BRIEF_LITERAL)).toBeInTheDocument();
  });

  it("shows the demo animation above the demo brief, named and running", () => {
    stubReducedMotion(false);
    stubAnimationFrame();
    const { dialog } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 6:/ }));

    // One picture to assistive technology, not a second announced copy of the application.
    const scene = dialog.querySelector<HTMLElement>("[role=img]")!;
    expect(scene.getAttribute("aria-label")).toBeTruthy();
    expect(within(scene).queryByText("Proposal Copilot")).toBeInTheDocument();

    // Started on arrival, and the control says so.
    expect(
      screen.getByRole("button", { name: `Pause: ${scene.getAttribute("aria-label")}` }),
    ).toBeInTheDocument();

    // Above the brief, not below it: the animation shows what the brief is for.
    expect(scene.compareDocumentPosition(screen.getByText(DEMO_BRIEF_LITERAL))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("never runs the demo animation when the reviewer asked for reduced motion", () => {
    stubReducedMotion(true);
    const raf = stubAnimationFrame();
    const { dialog } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 6:/ }));

    // A requestAnimationFrame loop is neither a transition nor an animation, so `globals.css`
    // cannot reach it — the component has to honour the preference itself.
    expect(raf).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^Play: / })).toBeInTheDocument();

    // And it rests on the finished proposal rather than the empty workspace frame zero shows,
    // so the still a paused reviewer is left with is the one that says what the tool produces.
    // The applied total only exists in the created state, well past every reveal it staggers.
    expect(within(dialog).getByText("187,960 SEK")).toBeInTheDocument();
  });

  it("copies the demo brief and confirms it", async () => {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 6:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

    expect(writeText).toHaveBeenCalledWith(DEMO_BRIEF_LITERAL);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("reports a failed copy without disrupting the tour", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { dialog } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 6:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

    expect(await screen.findByText(/Copy failed/)).toBeInTheDocument();
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByText(DEMO_BRIEF_LITERAL)).toBeInTheDocument();
  });

  it("announces the current slide politely and labels progress accessibly", () => {
    const { dialog } = renderIntro();
    const live = dialog.querySelector('[aria-live="polite"].sr-only');
    expect(live).toHaveTextContent("Slide 1 of 6: From messy brief to proposal draft.");
    fireEvent.click(next());
    expect(live).toHaveTextContent("Slide 2 of 6: The agent prepares. You decide.");
  });

  it("names itself as a dialog, and renames itself as the reviewer advances", () => {
    const { dialog } = renderIntro();
    expect(dialog).toHaveAccessibleName("From messy brief to proposal draft.");
    expect(dialog).toHaveAccessibleDescription(/agentic interaction layer over the Proposales API/);
    fireEvent.click(next());
    expect(dialog).toHaveAccessibleName("The agent prepares. You decide.");
  });

  it("reconstructs no button semantics with ARIA", () => {
    const { dialog } = renderIntro();
    expect(dialog.querySelectorAll('[role="button"]')).toHaveLength(0);
    expect(within(dialog).getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("keeps every slide's content and controls present under reduced motion", () => {
    // Two kinds of motion live here. The slide transition is CSS, which globals.css already
    // collapses under `prefers-reduced-motion`; slide 3's ambient clip is not, so
    // `intro-media.tsx` reads the preference itself. This test owns the first: stubbing the
    // query proves content and controls are identical, and the class assertion proves the
    // collapsed transition cannot strand a slide invisible — the suppressed state exists only
    // behind `starting:`. The clip's own behaviour is proved in "slide media" below.
    const realMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    onTestFinished(() => {
      window.matchMedia = realMatchMedia;
    });

    const { dialog } = renderIntro();
    for (let step = 0; step < SLIDE_HEADINGS.length; step += 1) {
      const wrapper = dialog.querySelector<HTMLElement>(".transition")!;
      for (const className of wrapper.className.split(/\s+/)) {
        if (/^(opacity-0|invisible|hidden|translate-y-)/.test(className)) {
          throw new Error(`slide suppressed outside @starting-style: ${className}`);
        }
      }
      expect(within(dialog).getAllByRole("heading").length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: "Skip intro" })).toBeVisible();
      if (step < SLIDE_HEADINGS.length - 1) fireEvent.click(next());
    }
    expect(screen.getByRole("button", { name: "Start exploring" })).toBeVisible();
  });
});

describe("ProposalCopilotIntro session step", () => {
  function goToSessionStep() {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 5 of 6:/ }));
  }

  it("illustrates the strip without building a second tab system", () => {
    goToSessionStep();
    const figure = screen.getByRole("figure");

    // Readable, not operable: nothing in the illustration is a control or a tab.
    expect(within(figure).queryAllByRole("button")).toHaveLength(0);
    expect(within(figure).queryAllByRole("tab")).toHaveLength(0);
    expect(within(figure).queryAllByRole("tablist")).toHaveLength(0);
    expect(figure.querySelectorAll("[data-session-tab-wrapper], [data-new-session]")).toHaveLength(0);
  });

  it("carries each session's state as text, never as the dot colour alone", () => {
    goToSessionStep();
    const figure = screen.getByRole("figure");
    for (const statusText of ["Ready", "Needs you", "Working"]) {
      expect(within(figure).getByText(statusText)).toBeInTheDocument();
    }
    expect(figure).toHaveTextContent(/selected/);
  });

  it("explains separate context, switching and starting another session", () => {
    goToSessionStep();
    for (const callout of ["Separate context", "Switch tasks", "Start another"]) {
      expect(screen.getByText(callout)).toBeInTheDocument();
    }
  });

  it("claims only page-lifetime sessions, never persistence", () => {
    goToSessionStep();
    const dialog = document.querySelector("[data-intro-dialog]")!;
    expect(dialog).toHaveTextContent(/page lifetime/i);
    expect(dialog).toHaveTextContent(/refreshing the page clears the workspace/i);
    expect(dialog.textContent).not.toMatch(/saved|stored|persist|history|sync|across devices/i);
  });
});

/**
 * A body for slides under test that are not about their body. Deliberately the plainest
 * variant: it renders no controls and no media, so it cannot be mistaken for what a media or
 * region assertion is actually looking at.
 */
const PROBE_BODY: IntroSlideBody = { kind: "checklist", items: ["One"], note: "Probe note" };

/** A slide carrying an ambient clip — the shape slide 3 uses, without depending on its copy. */
function ambientSlide(): IntroSlideModel {
  return {
    id: "probe",
    heading: "Probe",
    description: "Probe description",
    media: { kind: "video", src: "/probe.mp4", title: "A looping clip", loop: true },
    body: PROBE_BODY,
  };
}

/**
 * Spies on the playback methods jsdom does not implement, restoring them after the test —
 * this project does not enable `restoreMocks`, so a spy left standing would reach the next one.
 */
function spyOnPlayback() {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockReturnValue(undefined as never);
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  onTestFinished(() => {
    play.mockRestore();
    pause.mockRestore();
  });
  return { play, pause };
}

/**
 * Holds the animation frame loop still for one test. The demo animation drives itself from
 * `requestAnimationFrame`, which jsdom does implement — left real, a frame can land outside
 * `act` after the assertions have run.
 */
function stubAnimationFrame() {
  const request = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(0);
  const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  onTestFinished(() => {
    request.mockRestore();
    cancel.mockRestore();
  });
  return request;
}

/** Pins the motion preference for one test and restores the real query afterwards. */
function stubReducedMotion(matches: boolean) {
  const real = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? matches : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  onTestFinished(() => {
    window.matchMedia = real;
  });
}

describe("ProposalCopilotIntro slide regions", () => {
  it("renders an image slide's media region with its alt text", () => {
    const slide = {
      id: "probe",
      heading: "Probe",
      description: "Probe description",
      media: { kind: "image", src: "/probe.png", alt: "A labelled probe", width: 640, height: 360 },
      body: PROBE_BODY,
    } satisfies IntroSlideModel;
    render(<IntroSlide descriptionId="d" headingId="h" slide={slide} />);
    expect(screen.getByRole("img", { name: "A labelled probe" })).toBeInTheDocument();
  });

  it("renders a video slide's media region with an accessible name, controls and no autoplay", () => {
    const slide = {
      id: "probe",
      heading: "Probe",
      description: "Probe description",
      media: { kind: "video", src: "/probe.mp4", title: "A labelled clip" },
      body: PROBE_BODY,
    } satisfies IntroSlideModel;
    const { container } = render(<IntroSlide descriptionId="d" headingId="h" slide={slide} />);
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("aria-label", "A labelled clip");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("preload", "none");
  });

  it("carries each diagram's information in its alt text, not just a name for the picture", () => {
    renderIntro();

    // Slide 1's four stages.
    const flow = screen.getByRole("img");
    for (const stage of ["Brief", "Agent", "Review", "Proposales"]) {
      expect(flow).toHaveAccessibleName(new RegExp(stage));
    }

    fireEvent.click(screen.getByRole("button", { name: /^Slide 2 of 6:/ }));
    // Slide 2's six steps, each with the detail the removed text composition used to carry.
    const workflow = screen.getByRole("img");
    for (const step of ["Describe", "Reason", "Clarify", "Review", "Approve", "Create draft"]) {
      expect(workflow).toHaveAccessibleName(new RegExp(step));
    }
    expect(workflow).toHaveAccessibleName(/incomplete or messy/);
    expect(workflow).toHaveAccessibleName(/nothing is created until you explicitly approve/i);
  });

  it("renders a diagram bare, with no frame of its own", () => {
    const slide = {
      id: "probe",
      heading: "Probe",
      description: "d",
      body: {
        kind: "diagram",
        src: "/probe.png",
        alt: "A described diagram",
        width: 800,
        height: 400,
        fit: "full",
      },
      } satisfies IntroSlideModel;
    const { container } = render(<IntroSlide descriptionId="d" headingId="h" slide={slide} />);

    // The artwork is transparent and draws its own cards; a border would box an edgeless picture.
    expect(container.querySelector(".border")).toBeNull();
    expect(screen.getByRole("img", { name: "A described diagram" })).toBeInTheDocument();
  });

  it("holds a compact diagram back from the full column so it cannot swallow the dialog", () => {
    const base = {
      id: "probe",
      heading: "Probe",
      description: "d",
      body: { kind: "diagram", src: "/p.png", alt: "A", width: 1271, height: 1238, fit: "compact" },
    } satisfies IntroSlideModel;
    const { container: compact } = render(
      <IntroSlide descriptionId="d" headingId="h" slide={base} />,
    );
    expect(compact.querySelector("img")!.className).toContain("max-w-[560px]");

    const { container: full } = render(
      <IntroSlide
        descriptionId="d"
        headingId="h"
        slide={{ ...base, body: { ...base.body, fit: "full" } }}
      />,
    );
    expect(full.querySelector("img")!.className).not.toContain("max-w-");
  });

  it("renders a looping clip as a chrome-free, muted, embedded frame", () => {
    spyOnPlayback();
    const { container } = render(
      <IntroSlide descriptionId="d" headingId="h" slide={ambientSlide()} />,
    );
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("aria-label", "A looping clip");
    expect(video).toHaveAttribute("loop");
    // The point of the ambient posture: no timeline, no volume, no menu.
    expect(video).not.toHaveAttribute("controls");
    // Muted is what the reviewer asked for, and what makes autoplay permitted.
    expect(video.muted).toBe(true);
    // Playback is started from the effect, never declared — so reduced motion can pre-empt it.
    expect(video).not.toHaveAttribute("autoplay");
  });

  it("gives a looping clip a real button for the pause the missing controls would have offered", () => {
    stubReducedMotion(false);
    const { play, pause } = spyOnPlayback();
    const { container } = render(
      <IntroSlide descriptionId="d" headingId="h" slide={ambientSlide()} />,
    );
    const video = container.querySelector("video")!;

    // The element drives the label, so it tells the truth even when autoplay is refused.
    fireEvent.play(video);
    const control = screen.getByRole("button", { name: "Pause: A looping clip" });
    // Covering the frame is what makes tapping the picture work; being a button is what makes
    // tabbing to it work. One control, both gestures.
    expect(control.className).toContain("absolute inset-0");

    Object.defineProperty(video, "paused", { configurable: true, value: false });
    fireEvent.click(control);
    expect(pause).toHaveBeenCalled();

    fireEvent.pause(video);
    play.mockClear();
    Object.defineProperty(video, "paused", { configurable: true, value: true });
    fireEvent.click(screen.getByRole("button", { name: "Play: A looping clip" }));
    expect(play).toHaveBeenCalled();
  });

  it("starts a looping clip when motion is not restricted", () => {
    stubReducedMotion(false);
    const { play, pause } = spyOnPlayback();

    render(<IntroSlide descriptionId="d" headingId="h" slide={ambientSlide()} />);

    expect(play).toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });

  it("never starts a looping clip when the reviewer asked for reduced motion", () => {
    stubReducedMotion(true);
    const { play, pause } = spyOnPlayback();

    render(<IntroSlide descriptionId="d" headingId="h" slide={ambientSlide()} />);

    expect(play).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalled();
  });

  it("leaves a non-looping clip to the platform's own player, playing nothing on its own", () => {
    stubReducedMotion(false);
    const { play } = spyOnPlayback();
    const slide = {
      ...ambientSlide(),
      media: { kind: "video", src: "/probe.mp4", title: "Opt in" },
    } satisfies IntroSlideModel;

    const { container } = render(<IntroSlide descriptionId="d" headingId="h" slide={slide} />);
    const video = container.querySelector("video")!;

    expect(play).not.toHaveBeenCalled();
    expect(video).not.toHaveAttribute("loop");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("preload", "none");
    // No supplied control, because the platform is already providing one.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("omits the media region when a slide declares none", () => {
    const { container } = render(
      <IntroSlide
        descriptionId="d"
        headingId="h"
        slide={{ id: "probe", heading: "Probe", description: "d", body: PROBE_BODY }}
      />,
    );
    expect(container.querySelector("img, video")).toBeNull();
  });

  it("shows a slide's own action only on that slide", () => {
    renderIntro();
    expect(screen.queryByRole("button", { name: "Copy demo prompt" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 6 of 6:/ }));
    expect(screen.getByRole("button", { name: "Copy demo prompt" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 5 of 6:/ }));
    expect(screen.queryByRole("button", { name: "Copy demo prompt" })).not.toBeInTheDocument();
  });

  it("offers the source repository from step 1 only, safely and as a secondary control", () => {
    renderIntro();
    const link = screen.getByRole("link", { name: "View source on GitHub (opens in a new tab)" });
    expect(link).toHaveAttribute("href", "https://github.com/Loorenz-David/ProposaleS-Task");
    expect(link).toHaveAttribute("target", "_blank");
    // noopener and noreferrer both required: the new tab must not reach back through
    // window.opener, and the destination must not receive the referrer.
    expect(link.getAttribute("rel")?.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));

    // Secondary: it sits in the slide's content, not in the footer beside the primary action.
    const footer = document.querySelector<HTMLElement>("[data-intro-dialog] footer")!;
    expect(footer).not.toContainElement(link);
    expect(within(footer).getByRole("button", { name: "Next" })).toBeInTheDocument();

    // And it appears on step 1 alone.
    for (let step = 1; step < SLIDE_HEADINGS.length; step += 1) {
      fireEvent.click(next());
      expect(screen.queryByRole("link", { name: /View source on GitHub/ })).not.toBeInTheDocument();
    }
  });

  it("states the approval boundary on the workflow step", () => {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 2 of 6:/ }));
    expect(screen.getByText(/Human approval authorizes creation/)).toBeInTheDocument();
  });
});

describe("ProposalCopilotIntro replay", () => {
  it("reopens from the agent header trigger and restores focus to it on close", async () => {
    render(
      <IntroProvider>
        <ProposalWorkspace />
        <ProposalCopilotIntro />
      </IntroProvider>,
    );
    const dialog = document.querySelector<HTMLDialogElement>("[data-intro-dialog]")!;

    // Leave the tour part-way through, so a reopen that resumed would be visible.
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "Try a deliberately incomplete brief." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));

    const replay = screen.getByRole("button", { name: "Demo guide" });
    replay.focus();
    fireEvent.click(replay);

    expect(dialog).toHaveAttribute("open");
    // Replay restarts at slide 1 rather than resuming where the reviewer left off.
    expect(screen.getByRole("heading", { name: "From messy brief to proposal draft." })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(replay).toHaveFocus();
  });

  it("leaves the workspace behind it untouched once closed", async () => {
    render(
      <IntroProvider>
        <ProposalWorkspace />
        <ProposalCopilotIntro />
      </IntroProvider>,
    );
    const dialog = document.querySelector<HTMLDialogElement>("[data-intro-dialog]")!;

    expect(document.querySelector("[data-workspace-root]")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));

    const main = screen.getByRole("main", { name: "Proposal preparation" });
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("data-surface-state", "idle");
    expect(screen.getByRole("button", { name: "Demo guide" })).toBeInTheDocument();
  });
});

describe("ProposalCopilotIntro coupling perimeter", () => {
  it("renders nothing when the workspace is composed without the onboarding provider", () => {
    // The existing workspace suites mount the shell bare. The onboarding is additive: it must
    // never become a hard dependency of the agent header that renders its trigger.
    const { container } = render(<ProposalWorkspace />);
    expect(container.querySelector("[data-intro-dialog]")).toBeNull();
    expect(screen.queryByRole("button", { name: "Demo guide" })).toBeNull();
    expect(screen.getByRole("main", { name: "Proposal preparation" })).toBeInTheDocument();
  });
});

describe("ProposalCopilotIntro persistence perimeter", () => {
  const ONBOARDING_DIR = __dirname;

  function onboardingSources(): { file: string; source: string }[] {
    return readdirSync(ONBOARDING_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
      .map((entry) => ({
        file: entry.name,
        source: readFileSync(path.join(ONBOARDING_DIR, entry.name), "utf8"),
      }));
  }

  it("introduces no client-side persistence (contract 05 §5.2)", () => {
    const offenders = onboardingSources().filter(({ source }) =>
      /localStorage|sessionStorage|indexedDB|document\.cookie/.test(source),
    );
    expect(offenders.map(({ file }) => file)).toEqual([]);
  });

  it("does not reach into the workspace session store", () => {
    const offenders = onboardingSources().filter(({ source }) =>
      /use-workspace-session-store|useWorkspaceSessionStore|useTurnDispatch/.test(source),
    );
    expect(offenders.map(({ file }) => file)).toEqual([]);
  });

  it("puts no click handler on a non-button element (contract 05 §7)", () => {
    const offenders: string[] = [];
    for (const { file, source } of onboardingSources()) {
      for (const match of source.matchAll(/<(\w+)[^>]*?\sonClick=/g)) {
        if (match[1] !== "button") offenders.push(`${file}: <${match[1]}>`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("scans a non-empty set of onboarding sources", () => {
    expect(onboardingSources().length).toBeGreaterThanOrEqual(6);
  });
});
