import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AskAgentPopover } from "./ask-agent-popover";

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("AskAgentPopover", () => {
  it("focuses inside, submits, closes, and returns focus", async () => {
    const onSubmit = vi.fn();
    render(<AskAgentPopover fieldLabel="Title" onSubmit={onSubmit} state={{ status: "idle" }} />);
    const trigger = screen.getByRole("button", { name: "Ask the agent about Title" });
    fireEvent.click(trigger);
    const input = await screen.findByRole("textbox", { name: "Ask the agent about Title" });
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.change(input, { target: { value: "Make it more direct" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("Make it more direct");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes on Escape and exposes a failed message", async () => {
    render(<AskAgentPopover fieldLabel="Title" onSubmit={vi.fn()} state={{ status: "failed", message: "Could not ask" }} />);
    const trigger = screen.getByRole("button", { name: "Ask the agent about Title" });
    fireEvent.click(trigger);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not ask");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
