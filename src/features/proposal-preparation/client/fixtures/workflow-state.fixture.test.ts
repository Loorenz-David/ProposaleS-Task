import { describe, expect, it } from "vitest";

import { parseProposalWorkflowState } from "../../schemas/workflow-state";
import {
  FIXTURE_EDITOR_ORIGIN,
  fixtureTerminalWorkflowState,
  fixtureWorkflowState,
} from "./workflow-state.fixture";

describe("workflow state fixtures", () => {
  it("both fixtures are values the real parser accepts under the suite's editor origin", () => {
    for (const state of [fixtureWorkflowState(), fixtureTerminalWorkflowState()]) {
      expect(() => parseProposalWorkflowState(state, FIXTURE_EDITOR_ORIGIN)).not.toThrow();
    }
  });

  it("the terminal fixture is the only one carrying a draft reference", () => {
    expect(fixtureWorkflowState().draftReference).toBeUndefined();
    expect(fixtureTerminalWorkflowState().draftReference).toBeDefined();
  });

  it("F15: a draft reference on a foreign origin is rejected", () => {
    expect(() =>
      parseProposalWorkflowState(
        fixtureTerminalWorkflowState(),
        "https://another.example",
      ),
    ).toThrow();
  });

  it("F15: a state without its generation id is rejected", () => {
    const { generationId: _generationId, ...withoutGenerationId } = fixtureWorkflowState();
    expect(() => parseProposalWorkflowState(withoutGenerationId, FIXTURE_EDITOR_ORIGIN)).toThrow();
  });
});
