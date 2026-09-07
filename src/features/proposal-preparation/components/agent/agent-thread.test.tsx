import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgentThread } from "./agent-thread";

describe("AgentThread", () => {
  it("is a labelled live log and preserves pasted line breaks", () => {
    render(
      <AgentThread
        isWorking={false}
        onPillIntent={vi.fn()}
        suppressFollow={false}
        viewModel={{
          isEmpty: false,
          turns: [{ entryId: "human-1", owner: "human", text: "one\ntwo", scope: null }],
        }}
        workingLabel=""
      />,
    );
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(screen.getByLabelText("You said")).toHaveTextContent("one two");
    expect(screen.getByLabelText("You said").querySelector("p")).toHaveClass("whitespace-pre-wrap");
  });

  it("shows one honest working status", () => {
    render(
      <AgentThread
        isWorking
        onPillIntent={vi.fn()}
        suppressFollow={false}
        viewModel={{ isEmpty: true, turns: [] }}
        workingLabel="Drafting proposal"
      />,
    );
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Drafting proposal");
  });
});
