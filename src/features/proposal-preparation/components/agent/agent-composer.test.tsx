import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgentComposer, COMPOSER_MAX_ROWS, composerHeightPx } from "./agent-composer";

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

  it("grows with the content and stops at six rows", () => {
    const rows = (count: number) =>
      composerHeightPx({ scrollHeight: count * 21 + 8, lineHeight: 21, verticalPadding: 8 });
    expect(COMPOSER_MAX_ROWS).toBe(6);
    expect(rows(1)).toBe(29);
    expect(rows(3)).toBe(71);
    expect(rows(6)).toBe(134);
    // Past the cap the height holds and the field scrolls instead.
    expect(rows(7)).toBe(134);
    expect(rows(40)).toBe(134);
  });

  it("falls back to the content height when the line height is not measurable", () => {
    expect(composerHeightPx({ scrollHeight: 96, lineHeight: Number.NaN, verticalPadding: 8 })).toBe(96);
  });
});
