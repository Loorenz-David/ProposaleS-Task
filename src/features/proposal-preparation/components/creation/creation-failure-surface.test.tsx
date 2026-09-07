import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CreationFailureViewModel } from "../../client/view-models/failure";
import { CreationFailureSurface } from "./creation-failure-surface";

function viewModel(canRetry: boolean): CreationFailureViewModel {
  return { key: "integration_error", headline: "Could not create the draft", message: "Proposales could not be reached.", canRetry, detail: null, nothingSentStatement: "Nothing was sent, and your reviewed proposition is still here.", existingDraft: null };
}

describe("CreationFailureSurface", () => {
  it("focuses its alert heading and puts Back to review first", () => {
    render(<CreationFailureSurface onBackToReview={vi.fn()} onRetry={vi.fn()} viewModel={viewModel(true)} />);
    const alert = screen.getByRole("alert");
    expect(within(alert).getByRole("heading")).toHaveFocus();
    expect(within(alert).getAllByRole("button").map((button) => button.textContent)).toEqual(["Back to review", "Try again"]);
    expect(alert).toHaveTextContent("Nothing was sent");
  });

  it("omits retry when the DTO does not permit it", () => {
    render(<CreationFailureSurface onBackToReview={vi.fn()} onRetry={vi.fn()} viewModel={viewModel(false)} />);
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
