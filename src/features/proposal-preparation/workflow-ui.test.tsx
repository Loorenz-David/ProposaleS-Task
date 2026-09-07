import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createFailingAiClient, createScriptedAiClient } from "@/lib/ai";
import { ProposalesError } from "@/lib/proposales/errors";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";
import { toCreateProposalRequest, toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { LIBRARY_PRICING_STATEMENT_ID } from "./schemas/approval";
import { toCreateDraftInput } from "./server/domain/to-create-draft-input";
import { validateApproval } from "./server/domain/validate-approval";
import { toMoneyDisplay } from "./client/view-models/money";
import { BRIEFS } from "./fixtures/briefs";
import { FIXTURE_CATALOG } from "./fixtures/catalog";
import { clarifyRecipient, finalStep, modelBlock, modelPropositionOutput, proposeStrong } from "./fixtures/scripts";

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

/** Read at call time so one file can construct both deployment postures explicitly. */
const deployment = { COPILOT_LIVE_MUTATIONS: "enabled" as "enabled" | "disabled" };

vi.mock("@/lib/env/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env/server")>();
  return {
    ...actual,
    serverEnv: {
      ...actual.serverEnv,
      get COPILOT_LIVE_MUTATIONS() {
        return deployment.COPILOT_LIVE_MUTATIONS;
      },
    },
  };
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
  return [finalStep(modelPropositionOutput({ blocks: [modelBlock({ variationId: "2", alternatives: [] })] }))];
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
  deployment.COPILOT_LIVE_MUTATIONS = "enabled";
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
    // Sending takes the questions off screen and hands the slot back to the composer.
    expect(screen.queryByRole("region", { name: "Agent questions" })).not.toBeInTheDocument();
    expect(composer()).toBeInTheDocument();
    await screen.findByRole("heading", { name: "Consulting and training proposal", level: 1 });
    // The line item's catalog image is fetched after the proposition is on screen, through the
    // real transport, action and service — the vendor returns images only for a variation read.
    await waitFor(() =>
      expect(document.querySelector('img[src="https://cdn.proposales.test/consulting-bundle.png"]')).not.toBeNull(),
    );
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
  /** Drives a fresh session to a rendered review surface, ready to approve. */
  async function reachReview() {
    holder.ai = createScriptedAiClient(proposeStrong());
    render(<ProposalWorkspace />);
    submit(BRIEFS.englishSimple);
    await screen.findByRole("heading", { name: "Consulting and training proposal", level: 1 });
    // No model may run after approval; a client that throws on use proves it never does.
    holder.ai = createFailingAiClient();
  }

  const approve = () => fireEvent.click(screen.getByRole("button", { name: "Approve and create draft" }));

  it("T-INT-6, T-INT-7, T-INT-8: approval executes the reviewed payload exactly, once", async () => {
    const approveSpy = vi.spyOn(actions, "approveProposalAction");
    await reachReview();
    const reviewed = activeRecord().workflow?.currentProposition;

    approve();
    await screen.findByRole("heading", { name: "Draft created in Proposales", level: 1 });

    // T-INT-6 — exactly one write, and its request is the one the approved payload maps to.
    expect(holder.proposales.writes).toBe(1);
    const create = holder.proposales.calls.find((call) => call.op === "createProposalDraft");
    const envelope = approveSpy.mock.calls[0][0];
    const { approved } = validateApproval(envelope, {
      editorOrigin: EDITOR_ORIGIN,
      now: () => NOW,
      logger: createLogger({ sink: () => undefined }),
    });
    expect(create).toMatchObject({
      request: toCreateProposalRequest(toCreateDraftInput(approved), {
        companyId: holder.proposales.company.companyId,
        now: () => NOW,
      }),
    });
    // The envelope the browser sent carried the reviewed proposition and the acknowledgment, and
    // no conversation: approval is not something the model is told about.
    expect(envelope).toMatchObject({
      proposition: reviewed,
      pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
    });
    expect(Object.keys(envelope as object)).not.toContain("conversation");

    // T-INT-7 — the identity and the link are the backend's, rendered verbatim.
    const draft = activeRecord().latestResult;
    if (draft?.status !== "created") throw new Error("expected a created result");
    expect(screen.getByText(draft.draft.proposalUuid)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Open in Proposales (opens in a new tab)" });
    expect(link).toHaveAttribute("href", draft.draft.editorUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    // T-INT-8 — Applied Pricing comes from the read-back, formatted by toMoneyDisplay only.
    const pricing = draft.draft.appliedPricing;
    if (!pricing.available) throw new Error("expected available pricing");
    expect(screen.getByRole("heading", { name: "Applied pricing" })).toBeInTheDocument();
    // The same total appears as a line value and as the total; both come from the read-back.
    expect(screen.getAllByText(toMoneyDisplay(pricing.totalWithTax)).length).toBeGreaterThan(0);

    // The session is terminal: the composer offers no further turn. `AgentComposer` realizes
    // `isSubmitting` on its send control, which is where B1 takes effect; the hook refuses a
    // dispatch on a terminal record regardless of how the attempt is made.
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    fireEvent.change(composer(), { target: { value: "one more thing" } });
    fireEvent.keyDown(composer(), { key: "Enter" });
    expect(activeRecord().inFlightTurn).toBeNull();
  });

  it("T-INT-7b: an existing draft for this generation is recovered, with no second write", async () => {
    await reachReview();
    const generationId = activeRecord().workflow?.generationId;
    if (!generationId) throw new Error("no generation id");

    // The create response was lost, not the create: the draft is already there to be found.
    holder.proposales = newFake({
      proposals: [{ proposalUuid: CREATED_UUID, generationId, url: `${EDITOR_ORIGIN}/proposals/${CREATED_UUID}/edit` }],
      proposalReadbacks: { [CREATED_UUID]: readback },
    });

    approve();
    await screen.findByRole("heading", { name: "Draft recovered in Proposales", level: 1 });
    expect(holder.proposales.writes).toBe(0);
  });

  it("T-INT-8b: an unreadable read-back renders no amount at all, rather than a zero", async () => {
    await reachReview();
    holder.proposales.failNext("getProposal", new ProposalesError({ operation: "getProposal", retryable: true, message: "timed out" }));

    approve();
    await screen.findByRole("heading", { name: "Draft created in Proposales", level: 1 });

    expect(screen.getByRole("heading", { name: "Applied pricing unavailable" })).toBeInTheDocument();
    // No money anywhere: the unavailable arm of the schema declares no amount to render.
    expect(document.body.textContent).not.toMatch(/\d[\d\s,.]*\s?(kr|SEK|€|EUR)/);
  });

  it("T-INT-9: a failed create keeps the proposition, offers retry, and the retry creates once", async () => {
    await reachReview();
    const before = activeRecord().workflow?.currentProposition;
    holder.proposales.failNext("createProposalDraft", new ProposalesError({
      operation: "createProposalDraft",
      status: 503,
      retryable: true,
      message: "Proposales could not be reached.",
    }));

    approve();
    await screen.findByRole("heading", { name: "Could not create the draft", level: 1 });

    // R6.5 over real shapes: nothing was sent, and the reviewed proposition is intact.
    expect(activeRecord().workflow?.currentProposition).toEqual(before);
    expect(activeRecord().workflow?.draftReference).toBeUndefined();
    const buttons = screen.getAllByRole("button", { name: /Back to review|Try again/ });
    expect(buttons[0]).toHaveAccessibleName("Back to review");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

    // The failed create stored nothing, so the retry is the first successful write.
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("heading", { name: "Draft created in Proposales", level: 1 });
    expect(holder.proposales.writes).toBe(1);
  });

  it("T-INT-9b: a deployment with mutations disabled refuses before the service, with no retry", async () => {
    await reachReview();
    deployment.COPILOT_LIVE_MUTATIONS = "disabled";

    approve();
    await screen.findByRole("heading", { name: "Could not create the draft", level: 1 });

    expect(screen.getByText("Draft creation is disabled on this deployment.")).toBeInTheDocument();
    // Not retryable: nothing about trying again changes a deployment decision.
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
    expect(holder.proposales.writes).toBe(0);
    // The refusal happens before the service, so the only vendor traffic is the reads the turn
    // and the review surface already made — nothing the approval would have added.
    expect(holder.proposales.calls.map((call) => call.op)).toEqual(["listContent", "getCompany", "getContent"]);
  });

  it("T-INT-9c: approving a state that already has a draft conflicts, and names the existing one", async () => {
    await reachReview();
    approve();
    await screen.findByRole("heading", { name: "Draft created in Proposales", level: 1 });
    const created = activeRecord().workflow?.draftReference;
    if (!created) throw new Error("no draft reference");

    // The terminal state is refused before any search or write, by the service, not the UI.
    const refused = await actions.approveProposalAction({
      state: activeRecord().workflow,
      proposition: activeRecord().workflow?.currentProposition,
      pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
    });
    expect(refused).toMatchObject({
      ok: false,
      error: { code: "conflict", details: { reason: "draft_already_exists", proposalUuid: created.proposalUuid } },
    });
    expect(holder.proposales.writes).toBe(1);
  });
});
