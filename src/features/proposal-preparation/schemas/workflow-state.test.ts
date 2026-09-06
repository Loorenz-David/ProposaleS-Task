import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;
const TEST_EDITOR_ORIGIN = "https://proposales.test";
const proposalUuid = "123e4567-e89b-42d3-a456-426614174000";

async function modules() {
  return {
    workflow: await import("./workflow-state"),
    clarification: await import("./clarification"),
    fixtures: await import("../fixtures/states"),
    propositions: await import("../fixtures/propositions"),
  };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

function issuePaths(error: AnyRecord): string[][] {
  return (error.details?.issues ?? []).map((issue: AnyRecord) => issue.path.map(String));
}

function capture(action: () => void): AnyRecord {
  try {
    action();
  } catch (error) {
    return error as AnyRecord;
  }
  throw new Error("expected ValidationError");
}

function draftReference(editorUrl = `${TEST_EDITOR_ORIGIN}/p/${proposalUuid}`) {
  return { proposalUuid, editorUrl };
}

describe("proposal workflow state", () => {
  it("C5(a) parses the minimal valid state", async () => {
    const { workflow, fixtures } = await modules();
    expect(workflow.parseProposalWorkflowState(fixtures.validState(), TEST_EDITOR_ORIGIN)).toEqual(fixtures.validState());
  });

  it("C5(b) rejects an unknown top-level key", async () => {
    const { workflow, fixtures } = await modules();
    const result = capture(() => workflow.parseProposalWorkflowState({ ...fixtures.validState(), foo: 1 }, TEST_EDITOR_ORIGIN));
    expect(result?.constructor.name).toBe("ValidationError");
    expect(issuePaths(result as AnyRecord)).toContainEqual(["foo"]);
  });

  it("C5(c) rejects a misspelled draft reference instead of stripping it", async () => {
    const { workflow, fixtures } = await modules();
    const state = { ...fixtures.validState(), draftRefrence: draftReference() };
    const error = capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN));
    expect(issuePaths(error)).toContainEqual(["draftRefrence"]);
  });

  it("C5(d) rejects a nested unknown key", async () => {
    const { workflow, fixtures } = await modules();
    const state = clone(fixtures.validState());
    state.brief.extra = 1;
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)))).toContainEqual(["brief", "extra"]);
  });

  it("C5(e) preserves a state through a JSON round trip", async () => {
    const { workflow, fixtures, propositions } = await modules();
    const preparedProposition = propositions.validProposition();
    preparedProposition.recipient = { known: false };
    preparedProposition.blocks[0].quantity = { known: false };
    preparedProposition.title = { known: false };
    const currentProposition = propositions.validProposition({ version: 2 });
    currentProposition.recipient = { known: false };
    currentProposition.blocks[0].optional = { known: false };
    currentProposition.agentRationale = { known: false };
    const state = fixtures.validState({ preparedProposition, currentProposition });
    expect(workflow.parseProposalWorkflowState(JSON.parse(JSON.stringify(state)), TEST_EDITOR_ORIGIN)).toEqual(state);
  });

  it("C5(f) rejects an over-cap brief at brief.text", async () => {
    const { workflow, fixtures } = await modules();
    const { MAX_BRIEF_CHARS } = await import("./shared");
    const state = clone(fixtures.validState());
    state.brief.text = "x".repeat(MAX_BRIEF_CHARS + 1);
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)))).toContainEqual(["brief", "text"]);
  });

  it("C5(g) requires every item key", async () => {
    const { workflow, fixtures } = await modules();
    const state = clone(fixtures.validState());
    delete state.items.language;
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)))).toContainEqual(["items", "language"]);
  });

  it("C5(h) rejects an unknown item key", async () => {
    const { workflow, fixtures } = await modules();
    const state = clone(fixtures.validState());
    state.items.extra = { resolution: "supplied" };
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)))).toContainEqual(["items", "extra"]);
  });

  it("C5(i) parses and preserves a clarification round", async () => {
    const { workflow, fixtures } = await modules();
    const state = fixtures.validState({ clarification: { questions: [{ questionId: proposalUuid, itemKey: "language", text: "Which language?" }], answers: [{ questionId: proposalUuid, answer: { kind: "answer", text: "English" } }] } });
    expect(workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN).clarification).toEqual(state.clarification);
  });

  it("C6(a) accepts a valid HTTPS draft reference at the configured origin", async () => {
    const { workflow, fixtures } = await modules();
    expect(workflow.parseProposalWorkflowState(fixtures.validState({ draftReference: draftReference() }), TEST_EDITOR_ORIGIN).draftReference).toEqual(draftReference());
  });

  it.each([
    ["C6(b)", "http://proposales.test/p/x", ["draftReference", "editorUrl"]],
    ["C6(c)", "https://evil.test/p/x", ["draftReference", "editorUrl"]],
    ["C6(d)", "https://proposales.test:8443/p/x", ["draftReference", "editorUrl"]],
  ])("%s rejects an invalid editor origin or scheme", async (_id, editorUrl, expectedPath) => {
    const { workflow, fixtures } = await modules();
    const state = fixtures.validState({ draftReference: draftReference(editorUrl) });
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)))).toContainEqual(expectedPath);
  });

  it("C6(e) rejects an uppercase UUID", async () => {
    const { workflow, fixtures } = await modules();
    const state = fixtures.validState({ draftReference: { proposalUuid: proposalUuid.toUpperCase(), editorUrl: `${TEST_EDITOR_ORIGIN}/p/${proposalUuid}` } });
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)))).toContainEqual(["draftReference", "proposalUuid"]);
  });

  it("C6(f) turns a malformed editor URL into a schema validation error", async () => {
    const { workflow, fixtures } = await modules();
    expect(issuePaths(capture(() => workflow.parseProposalWorkflowState(fixtures.validState({ draftReference: draftReference("not-a-url") }), TEST_EDITOR_ORIGIN)))).toContainEqual(["draftReference", "editorUrl"]);
  });

  it("C7(a) accepts a state within the byte bound", async () => {
    const { workflow, fixtures } = await modules();
    expect(workflow.parseProposalWorkflowState(fixtures.validState(), TEST_EDITOR_ORIGIN).generationId).toBe(fixtures.validState().generationId);
  });

  it("C7(b) reports oversize before strict-key issues", async () => {
    const { workflow, fixtures } = await modules();
    const { MAX_WORKFLOW_STATE_BYTES } = workflow;
    const error = capture(() => workflow.parseProposalWorkflowState({ ...fixtures.validState(), pad: "x".repeat(MAX_WORKFLOW_STATE_BYTES) }, TEST_EDITOR_ORIGIN));
    expect(error.details).toMatchObject({ reason: "workflow_state_too_large" });
    expect(issuePaths(error)).not.toContainEqual(["pad"]);
  });

  it("C7(c) keeps the maximal conforming state below the bound and parseable", async () => {
    const { workflow, fixtures } = await modules();
    const state = fixtures.maximalConformingState();
    const serialized = JSON.stringify(state);
    expect(new TextEncoder().encode(serialized).length).toBeLessThan(workflow.MAX_WORKFLOW_STATE_BYTES);
    expect(workflow.parseProposalWorkflowState(state, TEST_EDITOR_ORIGIN)).toBeDefined();
  });

  it("C7(d) rejects a non-serializable raw state with the safe domain issue", async () => {
    const { workflow } = await modules();
    const error = capture(() => workflow.parseProposalWorkflowState(undefined, TEST_EDITOR_ORIGIN));
    expect(error.details).toEqual({ reason: "domain_rule", issues: [{ path: [], message: "workflow state must be JSON-serializable" }] });
  });
});
