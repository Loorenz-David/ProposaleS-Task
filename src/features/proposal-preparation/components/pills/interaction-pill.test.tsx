import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PillViewModel } from "../../client/view-models/pill";
import { InteractionPill } from "./interaction-pill";

const thought: PillViewModel = {
  id: "entry:thought",
  kind: "thought",
  label: "How this was prepared",
  meta: "1 assumption",
  accessibleName: "How this proposition was prepared",
  defaultExpanded: false,
  payload: { rationale: "Matched to catalog content.", assumptions: [{ path: ["title"], note: "Title inferred." }], warnings: [] },
};

describe("InteractionPill", () => {
  it("expands a disclosure with an owned payload", () => {
    render(<InteractionPill onIntent={vi.fn()} viewModel={thought} />);
    const button = screen.getByRole("button", { name: thought.accessibleName });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Matched to catalog content.").parentElement).toHaveAttribute("id", button.getAttribute("aria-controls"));
  });

  it("preserves safe new-tab link attributes", () => {
    render(<InteractionPill onIntent={vi.fn()} viewModel={{ id: "e:link", kind: "link", label: "Open", meta: null, accessibleName: "Open (opens in a new tab)", href: "https://example.invalid/exact" }} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://example.invalid/exact");
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("emits an action intent", () => {
    const onIntent = vi.fn();
    render(<InteractionPill onIntent={onIntent} viewModel={{ id: "e:action", kind: "action", label: "Review", meta: null, accessibleName: "Review the proposition", intent: { kind: "focus-review" } }} />);
    fireEvent.click(screen.getByRole("button", { name: "Review the proposition" }));
    expect(onIntent).toHaveBeenCalledWith({ kind: "focus-review" });
  });
});
