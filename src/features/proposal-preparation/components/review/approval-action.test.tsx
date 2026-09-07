import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PRICING_ACKNOWLEDGMENT } from "../../client/view-models/review";
import { ApprovalAction } from "./approval-action";

describe("ApprovalAction", () => {
  it("is described by pricing, unresolved information, and the nothing-sent boundary", () => {
    render(<ApprovalAction acknowledgment={PRICING_ACKNOWLEDGMENT} isPending={false} onApprove={vi.fn()} unresolvedSummary="2 open, 1 deferred" />);
    const button = screen.getByRole("button", { name: "Approve and create draft" });
    // The wording is now the acknowledgment the approval envelope actually names, imported from
    // `schemas/approval.ts`, so the text on screen and the id in the payload cannot drift apart.
    expect(button).toHaveAccessibleDescription(/at the content library's pricing/);
    expect(button).toHaveAccessibleDescription(/2 open, 1 deferred/);
    expect(button).toHaveAccessibleDescription(/Nothing has been sent/);
  });
});
