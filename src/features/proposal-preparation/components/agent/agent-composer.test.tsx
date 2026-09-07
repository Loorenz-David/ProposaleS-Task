import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgentComposer } from "./agent-composer";

describe("AgentComposer", () => {
  it("disables empty and submitting sends", () => {
    const { rerender } = render(
      <AgentComposer hint="Hint" isSubmitting={false} onChange={vi.fn()} onSubmit={vi.fn()} value="" />,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    rerender(
      <AgentComposer hint="Hint" isSubmitting onChange={vi.fn()} onSubmit={vi.fn()} value="Ready" />,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("sends on Enter, keeps Shift+Enter, and blurs on Escape", () => {
    const onSubmit = vi.fn();
    render(
      <AgentComposer hint="Enter to send" isSubmitting={false} onChange={vi.fn()} onSubmit={onSubmit} value="Line one\nLine two" />,
    );
    const textarea = screen.getByRole("textbox", { name: "Message Proposal Copilot" });
    textarea.focus();
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledOnce();
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(textarea).not.toHaveFocus();
  });
});
