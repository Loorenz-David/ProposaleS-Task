import "server-only";

import type { ProposalWorkflowState } from "../../schemas/workflow-state";

export function nextVersion(state: ProposalWorkflowState): number {
  return state.currentProposition ? state.currentProposition.version + 1 : 1;
}
