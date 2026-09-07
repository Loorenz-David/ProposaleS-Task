import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { fixtureDraftResultCreated } from "../../client/fixtures/draft-result.fixture";
import { fixturePropositionV1 } from "../../client/fixtures/proposition.fixture";
import { fixtureSessionRuntimeRecord } from "../../client/fixtures/session-runtime.fixture";
import { fixtureTerminalWorkflowState } from "../../client/fixtures/workflow-state.fixture";
import { toCreatedViewModel } from "../../client/view-models/created";
import { CreatedSurface } from "./created-surface";

const viewModel = toCreatedViewModel(fixtureSessionRuntimeRecord({
  latestResult: { status: "created", draft: fixtureDraftResultCreated },
  workflow: fixtureTerminalWorkflowState({ currentProposition: fixturePropositionV1 }),
}));

describe("CreatedSurface", () => {
  it("focuses the headline and preserves exact safe editor-link attributes", () => {
    render(<CreatedSurface onDraftAnother={vi.fn()} viewModel={viewModel} />);
    expect(screen.getByRole("heading", { name: "Draft created in Proposales", level: 1 })).toHaveFocus();
    const link = screen.getByRole("link", { name: "Open in Proposales (opens in a new tab)" });
    expect(link).toHaveAttribute("href", fixtureDraftResultCreated.editorUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText(fixtureDraftResultCreated.proposalUuid)).toHaveClass("select-all");
  });
});
