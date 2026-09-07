import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { temporaryFixtureDraftResultCreated } from "../../client/fixtures/draft-result.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../../client/fixtures/proposition.temporary-fixture";
import { temporaryFixtureSessionRuntimeRecord } from "../../client/fixtures/session-runtime.temporary-fixture";
import { toCreatedViewModel } from "../../client/view-models/created";
import { CreatedSurface } from "./created-surface";

const viewModel = toCreatedViewModel(temporaryFixtureSessionRuntimeRecord({
  latestResult: { status: "created", draftResult: temporaryFixtureDraftResultCreated },
  workflow: { currentProposition: temporaryFixturePropositionV1, draftReference: { proposalUuid: temporaryFixtureDraftResultCreated.proposalUuid, editorUrl: temporaryFixtureDraftResultCreated.editorUrl } },
}));

describe("CreatedSurface", () => {
  it("focuses the headline and preserves exact safe editor-link attributes", () => {
    render(<CreatedSurface onDraftAnother={vi.fn()} viewModel={viewModel} />);
    expect(screen.getByRole("heading", { name: "Draft created in Proposales", level: 1 })).toHaveFocus();
    const link = screen.getByRole("link", { name: "Open in Proposales (opens in a new tab)" });
    expect(link).toHaveAttribute("href", temporaryFixtureDraftResultCreated.editorUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText(temporaryFixtureDraftResultCreated.proposalUuid)).toHaveClass("select-all");
  });
});
