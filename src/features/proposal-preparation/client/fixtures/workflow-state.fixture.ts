import {
  parseProposalWorkflowState,
  type ProposalWorkflowState,
} from "../../schemas/workflow-state";
import { validState } from "../../fixtures/states";
import { fixturePropositionV1 } from "./proposition.fixture";

/**
 * A workflow state in the real shape, built on the backend's own `validState()` so the two sides
 * of the seam agree on what a state is. Parsed through `parseProposalWorkflowState`, which is the
 * function the services use, so the byte bound and the editor-origin rule apply here too.
 *
 * The origin matches `test/setup/node.ts`'s placeholder, which is what the offline suites run
 * under. Test-only.
 */
export const FIXTURE_EDITOR_ORIGIN = "https://proposales.test";

export function fixtureWorkflowState(
  overrides: Record<string, unknown> = {},
): ProposalWorkflowState {
  return parseProposalWorkflowState(
    {
      ...validState(),
      generationId: fixturePropositionV1.generationId,
      preparedProposition: fixturePropositionV1,
      currentProposition: fixturePropositionV1,
      ...overrides,
    },
    FIXTURE_EDITOR_ORIGIN,
  );
}

export function fixtureTerminalWorkflowState(
  overrides: Record<string, unknown> = {},
): ProposalWorkflowState {
  return fixtureWorkflowState({
    draftReference: {
      proposalUuid: "11111111-1111-4111-8111-111111111111",
      editorUrl: `${FIXTURE_EDITOR_ORIGIN}/proposals/11111111-1111-4111-8111-111111111111/edit`,
    },
    ...overrides,
  });
}
