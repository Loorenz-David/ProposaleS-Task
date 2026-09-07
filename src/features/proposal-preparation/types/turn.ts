import type { ErrorDto } from "@/lib/errors/error-dto";

import type { ClarificationAnswer } from "../schemas/clarification";
import type { ConversationContext } from "../schemas/conversation";
import type { DomainResult } from "../schemas/turn-result";
import type { ProposalWorkflowState } from "../schemas/workflow-state";

/**
 * What the human asked for, in the interface's own vocabulary. This is UI-only (05 §8): the wire
 * envelopes belong to the services and are composed from it by `client/turn-transport.ts`. An
 * intent carries no state and no acknowledgment, so a component cannot assemble a payload.
 */
export type ClientEditOperation =
  | { op: "set_leaf"; path: string[]; value: unknown }
  | { op: "remove_block"; index: number }
  /**
   * A client intent with no backend counterpart: the transport sends `remove_block` followed by
   * `add_block` in one `edits` array. Kept as one intent because it is one thing the human did,
   * and because a half-applied replacement is not a state the review surface can render.
   */
  | { op: "replace_block"; index: number; variationId: string };

export type TurnInput =
  | { kind: "brief"; text: string }
  | { kind: "answers"; answers: ClarificationAnswer[] }
  | { kind: "edit"; operation: ClientEditOperation }
  | { kind: "revision"; instruction: string; scope: string | null }
  /** Intent only. The envelope is composed from the record's held state by the transport. */
  | { kind: "approval" };

/**
 * What the transport returns. `conversation` is absent — not null — on a turn that has none:
 * approval produces no conversational turn, so it returns no conversation to carry (§17A.17
 * item 7), and the store must preserve what it holds rather than clear it.
 */
export type TurnOutcome =
  | {
      ok: true;
      result: DomainResult;
      state: ProposalWorkflowState;
      conversation?: ConversationContext;
    }
  | { ok: false; error: ErrorDto };
