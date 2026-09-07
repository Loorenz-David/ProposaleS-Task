import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { fixtureErrorDto } from "../../client/fixtures/failures.fixture";
import { toCallFailureViewModel } from "../../client/view-models/failure";
import type { CallFailure } from "../../types/session";
import { TurnFailureNotice } from "./turn-failure-notice";

const codes = [
  "validation_error",
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "approval_required",
  "integration_error",
  "rate_limited",
  "internal_error",
  "unknown_error",
] as const;

function failureFor(code: (typeof codes)[number], retryable?: boolean): CallFailure {
  return {
    site: { kind: "agent" },
    error: fixtureErrorDto(code, {
      details: retryable === undefined ? undefined : { retryable },
    }),
    retry: { kind: "brief", text: "Messy brief" },
  };
}

describe("TurnFailureNotice", () => {
  it.each(codes)("renders the %s fixture message and DTO-controlled retry", (code) => {
    const onDismiss = vi.fn();
    const failure = failureFor(code, code === "integration_error");
    const viewModel = toCallFailureViewModel(failure);
    render(
      <TurnFailureNotice
        onDismiss={onDismiss}
        onRetry={vi.fn()}
        viewModel={viewModel}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(failure.error.message);
    expect(screen.queryByRole("button", { name: "Try again" }) !== null).toBe(
      code === "integration_error",
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("omits retry for the non-retryable integration fixture", () => {
    render(
      <TurnFailureNotice
        onDismiss={vi.fn()}
        onRetry={vi.fn()}
        viewModel={toCallFailureViewModel(failureFor("integration_error", false))}
      />,
    );
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
