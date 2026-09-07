import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createFailingAiClient, createScriptedAiClient } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";
import { toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { BRIEFS } from "./fixtures/briefs";
import { FIXTURE_CATALOG } from "./fixtures/catalog";
import { agentPropositionOutput, clarifyRecipient, finalStep, proposeStrong } from "./fixtures/scripts";

/**
 * The offline vertical slice: a real brief typed into the real components reaches the real
 * services through the real Server Action functions, with only the services' collaborators
 * replaced. Nothing here fakes the transport, the store, the view models or the components — the
 * seam under test is the whole of it.
 *
 * `defaultDeps` is the injection point because the actions call the services with their defaults;
 * a deps parameter on an action would be a test affordance on a public endpoint (10 §3).
 */
const EDITOR_ORIGIN = "https://proposales.test";
const CREATED_UUID = "123e4567-e89b-42d3-a456-4266141740cc";
const GENERATION_ID = "00000000-0000-4000-8000-000000000801";
const NOW = Date.parse("2026-09-07T13:00:00.000Z");

const readbackFixture = (await import("@/lib/proposales/fixtures/proposal-readback.consistent.json")).default;
const readback = toProposalReadback(proposalReadbackSchema.parse(readbackFixture).data);

type Fake = ReturnType<typeof createFakeProposalesClient>;
type Ai = ReturnType<typeof createScriptedAiClient> | ReturnType<typeof createFailingAiClient>;

/** Mutated between turns so each turn gets the script it is meant to receive. */
const holder: { proposales: Fake; ai: Ai; ids: () => string } = {
  proposales: null as unknown as Fake,
  ai: null as unknown as Ai,
  ids: () => "",
};

vi.mock("@/features/proposal-preparation/server/services/default-deps", () => ({
  defaultDeps: {
    get proposales() {
      return holder.proposales;
    },
    get ai() {
      return holder.ai;
    },
    get editorOrigin() {
      return EDITOR_ORIGIN;
    },
    get logger() {
      return createLogger({ sink: () => undefined });
    },
    now: () => NOW,
    newGenerationId: () => GENERATION_ID,
    newQuestionId: () => holder.ids(),
    newTurnId: () => holder.ids(),
    newRunId: () => holder.ids(),
  },
}));

vi.mock("@/lib/env/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env/server")>();
  return { ...actual, serverEnv: { ...actual.serverEnv, COPILOT_LIVE_MUTATIONS: "enabled" } };
});

const { ProposalWorkspace } = await import("./components/workspace/proposal-workspace");
const { useWorkspaceSessionStore, createWorkspaceSessionState } = await import("./hooks/use-workspace-session-store");
const actions = await import("./server/actions");

/**
 * A revision that switches block 0 to the alternative the proposition actually offers. The shared
 * `selectSecondAlternative()` names content "3", which only exists after a `add_block` turn; here
 * the model may only choose from what it retrieved, and the backend refuses anything else.
 */
function selectOfferedAlternative() {
  const output = agentPropositionOutput();
  const blocks = structuredClone(output.blocks) as Array<Record<string, unknown>>;
  blocks[0] = {
    ...blocks[0],
    contentId: { value: "2", source: "proposales_content", ref: { variationId: "2" } },
    alternatives: [],
  };
  return [finalStep({ ...output, blocks })];
}

function sequentialIds(prefix = 810) {
  let index = 0;
  return () => `00000000-0000-4000-8000-${String(prefix + index++).padStart(12, "0")}`;
}

function newFake(options: Parameters<typeof createFakeProposalesClient>[0] = {}) {
  return createFakeProposalesClient({
    catalog: FIXTURE_CATALOG,
    editorOrigin: EDITOR_ORIGIN,
    newUuid: () => CREATED_UUID,
    now: () => NOW,
    proposalReadback: readback,
    ...options,
  });
}

function activeRecord() {
  const state = useWorkspaceSessionStore.getState();
  const id = state.activeSessionId;
  if (!id) throw new Error("no active session");
  return state.sessions[id];
}

const composer = () => screen.getByRole("textbox", { name: "Message Proposal Copilot" });

beforeAll(() => {
  // The ask-agent popover positions itself with a Radix hook that needs one; jsdom has none.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  useWorkspaceSessionStore.setState(createWorkspaceSessionState());
  holder.proposales = newFake();
  holder.ai = createScriptedAiClient(clarifyRecipient());
  holder.ids = sequentialIds();
  vi.restoreAllMocks();
});

/** Types into a field and commits with Enter, the way the composer and the inline editor work. */
function typeAndEnter(field: HTMLElement, text: string) {
  fireEvent.change(field, { target: { value: text } });
  fireEvent.keyDown(field, { key: "Enter" });
}

function submit(text: string) {
  typeAndEnter(composer(), text);
}

describe("proposal preparation, end to end offline", () => {
  it("T-INT-1..5, T-DISP-3: brief, clarification, proposition, edit and revision through the real seam", async () => {
    const prepareSpy = vi.spyOn(actions, "prepareTurnAction");
    const editSpy = vi.spyOn(actions, "editPropositionAction");
    const approveSpy = vi.spyOn(actions, "approveProposalAction");
    render(<ProposalWorkspace />);

    // T-INT-1 — a brief reaches prepareFromBrief and comes back as a clarification round.
    submit(BRIEFS.noRecipient);
    await screen.findByRole("region", { name: "Agent questions" });
    // The question reaches both the panel and the thread pill, which is the designed behaviour.
    expect(screen.getAllByText(/Who should receive this proposal/).length).toBeGreaterThan(0);
    const afterBrief = activeRecord();
    expect(afterBrief.workflow?.generationId).toBe(GENERATION_ID);
    expect(afterBrief.workflow?.clarification?.questions).toHaveLength(1);
    expect(afterBrief.conversation?.turns.length).toBeGreaterThan(0);

    // T-DISP-3 — the payload identifies the generation, never the browser session.
    const sentBrief = JSON.stringify(prepareSpy.mock.calls[0][0]);
    expect(sentBrief).not.toContain(afterBrief.id);
    expect(sentBrief).not.toContain("session-");

    // T-INT-2 — answering produces a proposition, rendered by the unchanged review components.
    holder.ai = createScriptedAiClient(proposeStrong());
    const answer = screen.getByRole("textbox", { name: /Who should receive this proposal/ });
    fireEvent.change(answer, { target: { value: "Anna Berg, anna.berg@northwind.example" } });
    fireEvent.click(screen.getByRole("button", { name: /^Send/ }));
    await screen.findByRole("heading", { name: "Consulting and training proposal", level: 1 });
    const afterProposition = activeRecord();
    expect(afterProposition.latestResult?.status).toBe("proposition");
    expect(afterProposition.workflow?.currentProposition?.version).toBe(1);
    const conversationAfterProposition = afterProposition.conversation?.turns.length ?? 0;

    // T-INT-3 — a human edit reaches editProposition, with no model in the path, and the server's
    // value is what renders.
    holder.ai = createFailingAiClient();
    fireEvent.click(screen.getByRole("button", { name: /Edit Title, currently/ }));
    typeAndEnter(screen.getByRole("textbox", { name: "Edit Title" }), "Integration title");
    await screen.findByRole("heading", { name: "Integration title", level: 1 });
    const afterEdit = activeRecord();
    expect(afterEdit.workflow?.currentProposition?.version).toBe(2);
    // T-INT-5 — an edit echoes the conversation back unchanged: a manual edit is not something
    // the human said, so it adds no turn.
    expect(afterEdit.conversation?.turns.length).toBe(conversationAfterProposition);
    expect(editSpy.mock.calls[0][0]).toMatchObject({ conversation: expect.any(Object) });
    expect(
      screen.getAllByText("Set by you").length,
      "the edited leaf is flagged as human-set",
    ).toBeGreaterThan(0);

    // T-INT-4 — a scoped question reaches reviseProposition and re-renders the proposition.
    holder.ai = createScriptedAiClient(selectOfferedAlternative());
    const reviseSpy = vi.spyOn(actions, "revisePropositionAction");
    fireEvent.click(screen.getByRole("button", { name: "Ask the agent about Title" }));
    // The popover mounts asynchronously, so the field has to be awaited before it can be typed in.
    typeAndEnter(await screen.findByRole("textbox", { name: "Ask the agent about Title" }), "use the second one");
    await waitFor(() => expect(reviseSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(activeRecord().workflow?.currentProposition?.version).toBe(3));
    const afterRevision = activeRecord();
    expect(afterRevision.workflow?.currentProposition?.blocks[0].contentId.value).toBe("2");
    // The human's edit survives the revision: a later model turn does not silently undo it.
    expect(afterRevision.workflow?.currentProposition?.title).toMatchObject({
      value: "Integration title",
      source: "human",
    });
    expect(afterRevision.conversation?.turns.length).toBeGreaterThan(conversationAfterProposition);
    expect(afterRevision.thread.at(-1)).toMatchObject({ kind: "result", scope: "Title" });

    // The state the browser holds is the state the server returned, never one the browser built.
    expect(afterRevision.workflow).toEqual(activeRecord().workflow);
    expect(approveSpy).not.toHaveBeenCalled();
    // Session mechanics are untouched by the real backend: one active session, nothing unread.
    expect(afterRevision.unread).toBe(0);
  });

  it("T-INT-3b: a mistyped quantity is refused by the server and reported at its own leaf", async () => {
    holder.ai = createScriptedAiClient(proposeStrong());
    render(<ProposalWorkspace />);

    submit(BRIEFS.englishSimple);
    await screen.findByRole("heading", { name: "Consulting and training proposal", level: 1 });
    const before = activeRecord().workflow?.currentProposition;

    holder.ai = createFailingAiClient();
    fireEvent.click(screen.getAllByRole("button", { name: /quantity, currently/ })[0]);
    typeAndEnter(screen.getAllByRole("textbox", { name: /quantity/ })[0], "abc");

    await waitFor(() => expect(activeRecord().callFailure).not.toBeNull());
    const failure = activeRecord().callFailure;
    expect(failure?.site).toMatchObject({ kind: "edit" });
    expect(failure?.error.code).toBe("validation_error");
    // The proposition is untouched: a refused edit changes nothing.
    expect(activeRecord().workflow?.currentProposition).toEqual(before);
  });

  it("T-INT-5b: a brief typed after a proposition is a revision, and a first brief mints one id", async () => {
    const prepareSpy = vi.spyOn(actions, "prepareTurnAction");
    const reviseSpy = vi.spyOn(actions, "revisePropositionAction");
    holder.ai = createScriptedAiClient(proposeStrong());
    render(<ProposalWorkspace />);

    submit(BRIEFS.englishSimple);
    await screen.findByRole("heading", { name: "Consulting and training proposal", level: 1 });
    // A first brief carries no state, so the service is what mints the generation id.
    expect(prepareSpy.mock.calls[0][0]).toEqual({ brief: BRIEFS.englishSimple });

    holder.ai = createScriptedAiClient(selectOfferedAlternative());
    submit("use the second one");
    await waitFor(() => expect(reviseSpy).toHaveBeenCalledTimes(1));
    expect(prepareSpy).toHaveBeenCalledTimes(1);
    expect(reviseSpy.mock.calls[0][0]).toMatchObject({
      instruction: "use the second one",
      state: expect.objectContaining({ generationId: GENERATION_ID }),
    });
  });
});
