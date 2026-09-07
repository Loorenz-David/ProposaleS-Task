import type { TurnOutcome } from "../../types/turn";
import { fixtureClarificationBatch } from "./clarification.fixture";
import { fixtureDraftResultCreated } from "./draft-result.fixture";
import { fixturePropositionV1 } from "./proposition.fixture";
import { fixtureTerminalWorkflowState, fixtureWorkflowState } from "./workflow-state.fixture";

/**
 * Outcomes in the shape the transport returns. These replace the fixture-era turn adapter, which
 * both produced outcomes and stood in for the network; only the first role was ever needed by the
 * store and hook tests, and the second is now the transport's own test seam. Test-only.
 */
const emptyConversation = { turns: [], omittedTurns: 0 };

export function fixtureClarificationOutcome(): TurnOutcome {
  return {
    ok: true,
    result: { status: "clarification", questions: fixtureClarificationBatch.questions },
    state: fixtureWorkflowState({
      clarification: fixtureClarificationBatch,
      currentProposition: undefined,
      preparedProposition: undefined,
    }),
    conversation: emptyConversation,
  };
}

export function fixturePropositionOutcome(): TurnOutcome {
  return {
    ok: true,
    result: { status: "proposition", proposition: fixturePropositionV1 },
    state: fixtureWorkflowState(),
    conversation: emptyConversation,
  };
}

/** Approval returns no conversation, so this outcome carries none — that absence is the point. */
export function fixtureCreatedOutcome(): TurnOutcome {
  return {
    ok: true,
    result: { status: "created", draft: fixtureDraftResultCreated },
    state: fixtureTerminalWorkflowState(),
  };
}
