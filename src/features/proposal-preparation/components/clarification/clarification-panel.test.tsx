import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ClarificationPanelViewModel } from "../../client/view-models/clarification";
import { ClarificationPanel } from "./clarification-panel";

const batch: ClarificationPanelViewModel = {
  mode: "batch",
  openCount: 3,
  isOpen: true,
  questions: [
    { questionId: "q1", text: "How many chairs?", itemLabel: "Chair Quantity", state: "open" },
    { questionId: "q2", text: "Which finish?", itemLabel: "Finish", state: "open" },
    { questionId: "q3", text: "When is delivery?", itemLabel: "Delivery", state: "open" },
  ],
};

describe("ClarificationPanel", () => {
  it("focuses the first open question and supports bounded batch navigation", () => {
    render(<ClarificationPanel onDismiss={vi.fn()} onSubmit={vi.fn()} submitState={{ status: "idle" }} viewModel={batch} />);
    expect(screen.getByRole("region", { name: "Agent questions" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "How many chairs?" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("textbox", { name: "Which finish?" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Back" })).toBeEnabled();
  });

  it("advances until the last question, where the primary action sends instead", () => {
    const onSubmit = vi.fn();
    render(<ClarificationPanel onDismiss={vi.fn()} onSubmit={onSubmit} submitState={{ status: "idle" }} viewModel={batch} />);
    expect(screen.queryByRole("button", { name: /^Send/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("textbox", { name: "When is delivery?" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send 0 answers" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "When is delivery?" }), { target: { value: "March" } });
    fireEvent.click(screen.getByRole("button", { name: "Send 1 answers" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("offers a single open question its send action with no navigation", () => {
    render(
      <ClarificationPanel
        onDismiss={vi.fn()}
        onSubmit={vi.fn()}
        submitState={{ status: "idle" }}
        viewModel={{ ...batch, mode: "single", openCount: 1, questions: [batch.questions[0]] }}
      />,
    );
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send answer" })).toBeInTheDocument();
  });

  it("emits answered and skipped drafts with Ctrl+Enter", () => {
    const onSubmit = vi.fn();
    render(<ClarificationPanel onDismiss={vi.fn()} onSubmit={onSubmit} submitState={{ status: "idle" }} viewModel={batch} />);
    fireEvent.change(screen.getByRole("textbox", { name: "How many chairs?" }), { target: { value: "Six" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip — leave this for the client" }));
    fireEvent.keyDown(screen.getByRole("region", { name: "Agent questions" }), { key: "Enter", ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ questionId: "q1", state: "answered", text: "Six" }),
      expect.objectContaining({ questionId: "q2", state: "skipped" }),
    ]));
  });

  it("dismisses on Escape and keeps skip available while submitting", () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<ClarificationPanel onDismiss={onDismiss} onSubmit={vi.fn()} submitState={{ status: "failed", message: "Please review this answer." }} viewModel={batch} />);
    expect(screen.getByRole("textbox", { name: "How many chairs?" })).toHaveAttribute("aria-invalid", "true");
    rerender(<ClarificationPanel onDismiss={onDismiss} onSubmit={vi.fn()} submitState={{ status: "submitting" }} viewModel={batch} />);
    expect(screen.getByRole("button", { name: "Skip — leave this for the client" })).toBeEnabled();
    fireEvent.keyDown(screen.getByRole("region", { name: "Agent questions" }), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("R4.6: skip all preserves an explicitly answered draft", () => {
    const onSubmit = vi.fn();
    render(<ClarificationPanel onDismiss={vi.fn()} onSubmit={onSubmit} submitState={{ status: "idle" }} viewModel={batch} />);
    fireEvent.change(screen.getByRole("textbox", { name: "How many chairs?" }), { target: { value: "Six" } });
    fireEvent.click(screen.getByRole("button", { name: "Skip all" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Send 3 answers" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ questionId: "q1", state: "answered", text: "Six" }),
      expect.objectContaining({ questionId: "q2", state: "skipped" }),
      expect.objectContaining({ questionId: "q3", state: "skipped" }),
    ]));
  });
});
