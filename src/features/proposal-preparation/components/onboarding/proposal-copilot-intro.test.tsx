import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { IntroProvider } from "./intro-context";
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

  it("holds both boundaries: Back is unavailable first, and the last slide starts instead of advancing", async () => {
    const { dialog } = renderIntro();
    expect(back()).toBeDisabled();

    fireEvent.click(next());
    fireEvent.click(next());
    fireEvent.click(next());
    fireEvent.click(next());

    expect(screen.getByRole("heading", { name: "Ready to try it?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start exploring" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  });

  it("jumps directly to a slide from the progress control", () => {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 4 of 5:/ }));
    expect(screen.getByRole("heading", { name: "Watch the boundaries, not just the AI." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Slide 4 of 5:/ })).toHaveAttribute("aria-current", "step");
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
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 5:/ }));
    expect(screen.getByText(DEMO_BRIEF_LITERAL)).toBeInTheDocument();
  });

  it("copies the demo brief and confirms it", async () => {
    renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 5:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

    expect(writeText).toHaveBeenCalledWith(DEMO_BRIEF_LITERAL);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("reports a failed copy without disrupting the tour", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { dialog } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /^Slide 3 of 5:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

    expect(await screen.findByText(/Copy failed/)).toBeInTheDocument();
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByText(DEMO_BRIEF_LITERAL)).toBeInTheDocument();
  });

  it("announces the current slide politely and labels progress accessibly", () => {
    const { dialog } = renderIntro();
    const live = dialog.querySelector('[aria-live="polite"].sr-only');
    expect(live).toHaveTextContent("Slide 1 of 5: From messy brief to proposal draft.");
    fireEvent.click(next());
    expect(live).toHaveTextContent("Slide 2 of 5: The agent prepares. You decide.");
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
    // The component reads no motion preference: the only motion is a CSS transition that
    // globals.css already collapses under `prefers-reduced-motion`. Stubbing the query proves
    // behaviour is identical, and the class assertion proves the collapsed transition cannot
    // strand a slide invisible — the suppressed state exists only behind `starting:`.
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

    const { dialog } = renderIntro();
    for (let step = 0; step < 5; step += 1) {
      const wrapper = dialog.querySelector<HTMLElement>(".transition")!;
      for (const className of wrapper.className.split(/\s+/)) {
        if (/^(opacity-0|invisible|hidden|translate-y-)/.test(className)) {
          throw new Error(`slide suppressed outside @starting-style: ${className}`);
        }
      }
      expect(within(dialog).getAllByRole("heading").length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: "Skip intro" })).toBeVisible();
      if (step < 4) fireEvent.click(next());
    }
    expect(screen.getByRole("button", { name: "Start exploring" })).toBeVisible();
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
