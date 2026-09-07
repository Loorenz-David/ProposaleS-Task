import { describe, expect, it, vi } from "vitest";

import { createFailingAiClient, createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";
import { toCreateProposalRequest, toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { BRIEFS } from "./fixtures/briefs";
import { FIXTURE_CATALOG } from "./fixtures/catalog";
import { clarifyRecipient, proposeStrong, selectSecondAlternative } from "./fixtures/scripts";
import { LIBRARY_PRICING_STATEMENT_ID } from "./schemas/approval";
import { toCreateDraftInput } from "./server/domain/to-create-draft-input";
import { validateApproval } from "./server/domain/validate-approval";
import {
  answerClarification,
  approveProposition,
  editProposition,
  prepareFromBrief,
  reviseProposition,
  searchContentForHuman,
} from "./server";

const EDITOR_ORIGIN = "https://proposales.test";
const CREATED_UUID = "123e4567-e89b-42d3-a456-4266141740cc";
const NOW = Date.parse("2026-09-07T13:00:00.000Z");
const readbackFixture = (await import("@/lib/proposales/fixtures/proposal-readback.consistent.json")).default;

function ids(prefix: number) {
  let index = 0;
  return () => `00000000-0000-4000-8000-${String(prefix + index++).padStart(12, "0")}`;
}

function modelDeps(ai: ReturnType<typeof createScriptedAiClient>, proposales: ReturnType<typeof createFakeProposalesClient>, nextId: () => string) {
  return {
    ai,
    proposales,
    now: () => NOW,
    newGenerationId: () => "00000000-0000-4000-8000-000000000801",
    newQuestionId: nextId,
    newTurnId: nextId,
    newRunId: nextId,
    logger: createLogger({ sink: vi.fn() }),
    editorOrigin: EDITOR_ORIGIN,
  };
}

describe("Proposal Copilot backend workflow", () => {
  it("W1 prepares, clarifies, edits, revises, approves, and creates exactly once", async () => {
    const proposales = createFakeProposalesClient({
      catalog: FIXTURE_CATALOG,
      editorOrigin: EDITOR_ORIGIN,
      newUuid: () => CREATED_UUID,
      now: () => NOW,
      proposalReadback: toProposalReadback(proposalReadbackSchema.parse(readbackFixture).data),
    });
    const nextId = ids(810);

    const prepareAi = createScriptedAiClient(clarifyRecipient());
    const prepared = await prepareFromBrief(
      { brief: BRIEFS.noRecipient },
      modelDeps(prepareAi, proposales, nextId),
    );
    expect(prepared.result.status).toBe("clarification");
    expect(prepared.run).toBeDefined();

    const questionId = prepared.state.clarification?.questions[0].questionId;
    if (questionId === undefined) throw new Error("workflow fixture expected one clarification");
    const answerAi = createScriptedAiClient(proposeStrong());
    const answered = await answerClarification({
      state: prepared.state,
      conversation: prepared.conversation,
      answers: [{ questionId, answer: { kind: "skip" } }],
    }, modelDeps(answerAi, proposales, nextId));
    expect(answered.result.status).toBe("proposition");
    expect(answered.run).toBeDefined();

    const search = await searchContentForHuman({ query: "training service overview", language: "en" }, { proposales });
    const candidate = search.candidates.find((entry) => entry.variationId === "3");
    if (candidate === undefined) throw new Error("workflow fixture expected content 3 in human search");
    const edited = await editProposition({
      state: answered.state,
      conversation: answered.conversation,
      edits: [{
        op: "add_block",
        candidate: {
          variationId: candidate.variationId,
          productId: candidate.productId,
          title: candidate.title,
          description: candidate.description,
        },
      }],
    }, { now: () => NOW, editorOrigin: EDITOR_ORIGIN });
    expect(edited.result.status).toBe("proposition");

    const reviseAi = createScriptedAiClient(selectSecondAlternative());
    const revised = await reviseProposition({
      state: edited.state,
      conversation: edited.conversation,
      instruction: "use the second one",
    }, modelDeps(reviseAi, proposales, nextId));
    expect(revised.result.status).toBe("proposition");
    expect(revised.run).toBeDefined();
    expect(revised.state.currentProposition?.blocks[0].contentId.value).toBe("3");

    const envelope = {
      state: revised.state,
      proposition: revised.state.currentProposition,
      pricingAcknowledgment: { acknowledged: true as const, statement: LIBRARY_PRICING_STATEMENT_ID },
    };
    const approvalLogger = createLogger({ sink: vi.fn() });
    const { approved } = validateApproval(envelope, { editorOrigin: EDITOR_ORIGIN, now: () => NOW, logger: approvalLogger });
    const expectedRequest = toCreateProposalRequest(toCreateDraftInput(approved), { companyId: proposales.company.companyId, now: () => NOW });
    const approval = await approveProposition({ envelope }, {
      proposales,
      ai: createFailingAiClient(),
      now: () => NOW,
      logger: approvalLogger,
      editorOrigin: EDITOR_ORIGIN,
    });

    expect(approval.result.status).toBe("created");
    expect(proposales.writes).toBe(1);
    const create = proposales.calls.find((call) => call.op === "createProposalDraft");
    expect(create).toMatchObject({ request: expectedRequest });
    expect(create && "request" in create && Array.isArray(create.request.blocks)
      ? create.request.blocks.some((block) => block.content_id === 3)
      : false).toBe(true);
    expect(approval.result.draft.appliedPricing).toMatchObject({ available: true });
  });

  it("W2 refuses re-approval from terminal state before another search or write", async () => {
    const proposales = createFakeProposalesClient({
      catalog: FIXTURE_CATALOG,
      editorOrigin: EDITOR_ORIGIN,
      newUuid: () => CREATED_UUID,
      now: () => NOW,
      proposalReadback: toProposalReadback(proposalReadbackSchema.parse(readbackFixture).data),
    });
    const envelope = (await import("./fixtures/envelopes")).validEnvelope();
    const deps = { proposales, ai: createFailingAiClient(), now: () => NOW, logger: createLogger({ sink: vi.fn() }), editorOrigin: EDITOR_ORIGIN };
    const first = await approveProposition({ envelope }, deps);
    const terminalEnvelope = { ...envelope, state: first.state };
    const callsBefore = proposales.calls.length;

    await expect(approveProposition({ envelope: terminalEnvelope }, deps)).rejects.toMatchObject({
      code: "conflict",
      details: { reason: "draft_already_exists" },
    });
    expect(proposales.writes).toBe(1);
    expect(proposales.calls).toHaveLength(callsBefore);
  });
});
