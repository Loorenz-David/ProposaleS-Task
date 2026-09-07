import type { ConversationContext } from "../schemas/conversation";
import type { ProposalWorkflowState } from "../schemas/workflow-state";
import { LIBRARY_PRICING_STATEMENT_ID } from "../schemas/approval";
import {
  answerClarificationAction,
  approveProposalAction,
  editPropositionAction,
  prepareTurnAction,
  revisePropositionAction,
} from "../server/actions";
import type { ClientEditOperation, TurnInput, TurnOutcome } from "../types/turn";

/**
 * What the record held when the turn was dispatched. Captured by the hook before any `await`, so a
 * turn is composed from the state that was on screen when the human acted, not from whatever the
 * record holds when the promise resolves.
 */
export type Held = {
  workflow: ProposalWorkflowState | null;
  conversation: ConversationContext | null;
};

export type TurnTransport = {
  run: (input: TurnInput, held: Held) => Promise<TurnOutcome>;
};

/** The conversation is sent only where it means something. Approval takes none (§17A.17 item 7). */
function conversational(held: Held) {
  return held.conversation === null ? {} : { conversation: held.conversation };
}

function missingAlternative(index: number): TurnOutcome {
  return {
    ok: false,
    error: {
      code: "validation_error",
      message: "That alternative is no longer offered.",
      details: {
        issues: [{
          path: ["blocks", String(index)],
          message: "the selected alternative is not on this block",
        }],
      },
    },
  };
}

/**
 * Composes the service envelope for one intent, calls one Server Action, and maps the result back.
 * This is the only module that knows both vocabularies. It adds no rule of its own: a failure it
 * returns without calling the server is a failure the server would also have produced.
 */
async function runTurn(input: TurnInput, held: Held): Promise<TurnOutcome> {
  switch (input.kind) {
    case "brief": {
      // A retry after a failed first turn carries the returned state, so the generation id minted
      // by that turn is reused rather than a second one being minted for the same work.
      const envelope = held.workflow === null
        ? { brief: input.text }
        : { brief: input.text, state: held.workflow, ...conversational(held) };
      return toOutcome(await prepareTurnAction(envelope));
    }
    case "answers":
      return toOutcome(await answerClarificationAction({
        state: held.workflow,
        answers: input.answers,
        ...conversational(held),
      }));
    case "revision":
      return toOutcome(await revisePropositionAction({
        state: held.workflow,
        instruction: input.instruction,
        ...conversational(held),
      }));
    case "edit": {
      const edits = toEdits(input.operation, held);
      if (!Array.isArray(edits)) return edits;
      return toOutcome(await editPropositionAction({
        state: held.workflow,
        edits,
        ...conversational(held),
      }));
    }
    case "approval":
      return toOutcome(await approveProposalAction({
        state: held.workflow,
        proposition: held.workflow?.currentProposition,
        pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
      }));
  }
}

/**
 * Resolves a client intent into backend edit operations. `replace_block` becomes two: the backend
 * has no replacement op, and `add_block` appends, so the replaced block arrives last.
 */
function toEdits(operation: ClientEditOperation, held: Held): unknown[] | TurnOutcome {
  if (operation.op !== "replace_block") return [operation];

  const block = held.workflow?.currentProposition?.blocks[operation.index];
  const alternative = block?.alternatives.find((entry) => entry.variationId === operation.variationId);
  if (block === undefined || alternative === undefined) return missingAlternative(operation.index);

  return [
    { op: "remove_block", index: operation.index },
    {
      op: "add_block",
      // A retained alternative carries no description, so none is sent; the new block's own
      // description stays absent rather than being invented from the block it replaced.
      candidate: {
        variationId: alternative.variationId,
        productId: alternative.productId,
        title: alternative.title,
      },
    },
  ];
}

function toOutcome(
  result: Awaited<ReturnType<typeof prepareTurnAction>> | Awaited<ReturnType<typeof approveProposalAction>>,
): TurnOutcome {
  if (!result.ok) return { ok: false, error: result.error };
  const { data } = result;
  return {
    ok: true,
    result: data.result,
    state: data.state,
    // `run` is diagnostic and deliberately dropped here rather than stored (§12A.9).
    ...("conversation" in data ? { conversation: data.conversation } : {}),
  };
}

let testTransport: TurnTransport | null = null;

export const turnTransport: TurnTransport = {
  run(input, held) {
    return testTransport ? testTransport.run(input, held) : runTurn(input, held);
  },
};

export function setTurnTransportForTests(transport: TurnTransport | null) {
  testTransport = transport;
}
