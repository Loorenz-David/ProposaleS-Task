import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT } from "../../client/view-models/created";
import { ApprovalAction } from "./approval-action";

describe("ApprovalAction", () => {
  it("is described by pricing, unresolved information, and the nothing-sent boundary", () => {
    render(<ApprovalAction acknowledgment={TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT} isPending={false} onApprove={vi.fn()} unresolvedSummary="2 open, 1 deferred" />);
    const button = screen.getByRole("button", { name: "Approve and create draft" });
    expect(button).toHaveAccessibleDescription(/Prices come from the content library/);
    expect(button).toHaveAccessibleDescription(/2 open, 1 deferred/);
    expect(button).toHaveAccessibleDescription(/Nothing has been sent/);
  });
});
