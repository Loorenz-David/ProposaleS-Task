import { beforeEach, describe, expect, it, vi } from "vitest";

import { LIBRARY_PRICING_STATEMENT_ID } from "../schemas/approval";
import type { TurnInput } from "../types/turn";
import { fixtureClarificationAnswered } from "./fixtures/clarification.fixture";
import { fixtureDraftResultCreated } from "./fixtures/draft-result.fixture";
import { fixturePropositionV1 } from "./fixtures/proposition.fixture";
import { fixtureWorkflowState } from "./fixtures/workflow-state.fixture";

/**
 * The actions are mocked so the rows assert what the transport composes and which single action it
 * calls. What each action then does with that payload is `server/actions.test.ts`'s subject.
 */
vi.mock("../server/actions", () => ({
  prepareTurnAction: vi.fn(),
  answerClarificationAction: vi.fn(),
  editPropositionAction: vi.fn(),
  revisePropositionAction: vi.fn(),
  approveProposalAction: vi.fn(),
}));

const actions = await import("../server/actions");
const { turnTransport } = await import("./turn-transport");

const CONVERSATION = {
  turns: [{
    role: "human" as const,
    turnId: "00000000-0000-4000-8000-0000000000aa",
    at: "2026-09-07T13:00:00.000Z",
    text: "Use the second one",
  }],
  omittedTurns: 0,
};

const turnReply = {
  ok: true as const,
  data: {
    state: fixtureWorkflowState(),
    conversation: CONVERSATION,
    result: { status: "proposition" as const, proposition: fixturePropositionV1 },
  },
};

function held(overrides: { workflow?: unknown; conversation?: unknown } = {}) {
  return {
    workflow: fixtureWorkflowState(),
    conversation: CONVERSATION,
    ...overrides,
  } as Parameters<typeof turnTransport.run>[1];
}

function payloadOf(action: { mock: { calls: unknown[][] } }) {
  return action.mock.calls[0][0];
}

beforeEach(() => {
  vi.clearAllMocks();
  // A turn reply for every action; the approval rows replace it with an ApprovalResult, whose
  // narrower result union this default does not satisfy.
  for (const action of Object.values(actions)) {
    vi.mocked(action).mockResolvedValue(turnReply as never);
  }
});

describe("turn transport payload composition", () => {
  it("T-TRANSPORT-1: a first brief carries no state, so the service mints the generation id", async () => {
    await turnTransport.run({ kind: "brief", text: "Restore the walnut set." }, held({ workflow: null, conversation: null }));

    expect(payloadOf(vi.mocked(actions.prepareTurnAction))).toEqual({ brief: "Restore the walnut set." });
  });

  it("T-TRANSPORT-2: a brief after a failed first turn carries the returned state and reuses its id", async () => {
    const workflow = fixtureWorkflowState();
    await turnTransport.run({ kind: "brief", text: "Try again." }, held({ workflow }));

    expect(payloadOf(vi.mocked(actions.prepareTurnAction))).toEqual({
      brief: "Try again.",
      state: workflow,
      conversation: CONVERSATION,
    });
  });

  it("T-TRANSPORT-3: answers and revisions carry the held state and conversation", async () => {
    await turnTransport.run({ kind: "answers", answers: fixtureClarificationAnswered.answers }, held());
    expect(payloadOf(vi.mocked(actions.answerClarificationAction))).toEqual({
      state: fixtureWorkflowState(),
      answers: fixtureClarificationAnswered.answers,
      conversation: CONVERSATION,
    });

    await turnTransport.run({ kind: "revision", instruction: "Warmer intro", scope: null }, held());
    expect(payloadOf(vi.mocked(actions.revisePropositionAction))).toEqual({
      state: fixtureWorkflowState(),
      instruction: "Warmer intro",
      conversation: CONVERSATION,
    });
  });

  it("T-TRANSPORT-4: an edit sends one operation, and its conversation is echoed back unchanged", async () => {
    await turnTransport.run(
      { kind: "edit", operation: { op: "set_leaf", path: ["title"], value: "New title" } },
      held(),
    );

    expect(payloadOf(vi.mocked(actions.editPropositionAction))).toEqual({
      state: fixtureWorkflowState(),
      edits: [{ op: "set_leaf", path: ["title"], value: "New title" }],
      conversation: CONVERSATION,
    });
  });

  it("T-TRANSPORT-5: replace_block becomes remove_block plus add_block in one edits array", async () => {
    const alternative = fixturePropositionV1.blocks[0].alternatives[1];
    await turnTransport.run(
      { kind: "edit", operation: { op: "replace_block", index: 0, variationId: alternative.variationId } },
      held(),
    );

    const payload = payloadOf(vi.mocked(actions.editPropositionAction)) as { edits: unknown[] };
    expect(payload.edits).toEqual([
      { op: "remove_block", index: 0 },
      {
        op: "add_block",
        // No description: a retained alternative carries none, and inventing one would attribute
        // catalog wording the alternative never supplied.
        candidate: {
          variationId: alternative.variationId,
          productId: alternative.productId,
          title: alternative.title,
        },
      },
    ]);
    expect(actions.editPropositionAction).toHaveBeenCalledTimes(1);
  });

  it("T-TRANSPORT-6: an alternative that is no longer offered fails without calling the server", async () => {
    const outcome = await turnTransport.run(
      { kind: "edit", operation: { op: "replace_block", index: 0, variationId: "999999" } },
      held(),
    );

    expect(outcome).toMatchObject({
      ok: false,
      error: { code: "validation_error", details: { issues: [{ path: ["blocks", "0"] }] } },
    });
    expect(actions.editPropositionAction).not.toHaveBeenCalled();
  });

  it("T-INT-5: the approval envelope carries the acknowledgment and no conversation key", async () => {
    const workflow = fixtureWorkflowState();
    vi.mocked(actions.approveProposalAction).mockResolvedValue({
      ok: true,
      data: { state: workflow, result: { status: "created", draft: fixtureDraftResultCreated } },
    } as never);

    await turnTransport.run({ kind: "approval" }, held({ workflow }));

    const payload = payloadOf(vi.mocked(actions.approveProposalAction)) as Record<string, unknown>;
    expect(payload).toEqual({
      state: workflow,
      proposition: workflow.currentProposition,
      pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
    });
    expect(Object.keys(payload)).not.toContain("conversation");
  });

  it("T-INT-5b: every conversational turn sends the conversation and approval sends none", async () => {
    const conversational: TurnInput[] = [
      { kind: "brief", text: "x" },
      { kind: "answers", answers: [] },
      { kind: "revision", instruction: "x", scope: null },
      { kind: "edit", operation: { op: "remove_block", index: 0 } },
    ];
    const called = [
      actions.prepareTurnAction,
      actions.answerClarificationAction,
      actions.revisePropositionAction,
      actions.editPropositionAction,
    ];

    for (const [index, input] of conversational.entries()) {
      await turnTransport.run(input, held());
      expect(payloadOf(vi.mocked(called[index])), input.kind).toMatchObject({ conversation: CONVERSATION });
    }
  });

  it("T-DISP-3: no payload carries a session id, and the state's generation id is the server's", async () => {
    const workflow = fixtureWorkflowState();
    await turnTransport.run({ kind: "revision", instruction: "x", scope: null }, held({ workflow }));

    const payload = payloadOf(vi.mocked(actions.revisePropositionAction)) as { state: { generationId: string } };
    expect(JSON.stringify(payload)).not.toContain("session-");
    expect(payload.state.generationId).toBe(workflow.generationId);
  });

  it("T-TRANSPORT-7: a retry recomposes a payload that deep-equals the first attempt", async () => {
    const input: TurnInput = { kind: "revision", instruction: "Warmer intro", scope: null };
    // A failed turn changes neither the state nor the conversation, so the record the retry is
    // composed from is the one the first attempt was composed from.
    await turnTransport.run(input, held());
    await turnTransport.run(input, held());

    const [first, second] = vi.mocked(actions.revisePropositionAction).mock.calls;
    expect(second[0]).toEqual(first[0]);
  });

  it("T-TRANSPORT-8: maps a success into result plus state, dropping the diagnostic run report", async () => {
    vi.mocked(actions.prepareTurnAction).mockResolvedValue({
      ok: true,
      data: {
        ...turnReply.data,
        run: { provider: "scripted", model: "m", usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 } },
      },
    } as never);

    const outcome = await turnTransport.run({ kind: "brief", text: "x" }, held({ workflow: null, conversation: null }));

    expect(outcome).toEqual({
      ok: true,
      result: turnReply.data.result,
      state: turnReply.data.state,
      conversation: CONVERSATION,
    });
    expect(JSON.stringify(outcome)).not.toContain("scripted");
  });

  it("T-TRANSPORT-9: passes a failure DTO through untouched", async () => {
    const error = { code: "integration_error" as const, message: "Proposales could not be reached.", details: { retryable: true } };
    vi.mocked(actions.revisePropositionAction).mockResolvedValue({ ok: false, error });

    await expect(turnTransport.run({ kind: "revision", instruction: "x", scope: null }, held()))
      .resolves.toEqual({ ok: false, error });
  });
});
