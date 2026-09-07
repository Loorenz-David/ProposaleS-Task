import { describe, expect, it, vi, beforeEach } from "vitest";

import { createFailingAiClient, createScriptedAiClient } from "@/lib/ai";
import { ConflictError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger";
import { createFakeProposalesClient } from "@/lib/proposales";
import { toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { BRIEFS } from "../fixtures/briefs";
import { FIXTURE_CATALOG } from "../fixtures/catalog";
import { validEnvelope } from "../fixtures/envelopes";
import { proposeStrong } from "../fixtures/scripts";
import { approveProposition, prepareFromBrief } from "./index";

/**
 * The exposure switch is read at call time from this holder, so one test file can construct both
 * the enabled and the disabled deployment explicitly rather than reading the ambient environment
 * (contract 11 §5: tests never read `.env`).
 */
const env = { COPILOT_LIVE_MUTATIONS: "enabled" as "enabled" | "disabled" };

vi.mock("@/lib/env/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env/server")>();
  return { ...actual, serverEnv: { ...actual.serverEnv, get COPILOT_LIVE_MUTATIONS() { return env.COPILOT_LIVE_MUTATIONS; } } };
});

/**
 * The service module is spied, not replaced: rows that assert transport behaviour override an
 * implementation, and rows that assert the boundary adds no parse of its own let the real service
 * (and therefore the real strict schema) run through the same spy.
 */
vi.mock("./index", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./index")>();
  return {
    ...actual,
    prepareFromBrief: vi.fn(actual.prepareFromBrief),
    answerClarification: vi.fn(actual.answerClarification),
    editProposition: vi.fn(actual.editProposition),
    reviseProposition: vi.fn(actual.reviseProposition),
    approveProposition: vi.fn(actual.approveProposition),
  };
});

const services = await import("./index");
const actions = await import("./actions");

const EDITOR_ORIGIN = "https://proposales.test";
const NOW = Date.parse("2026-09-07T13:00:00.000Z");
const CREATED_UUID = "123e4567-e89b-42d3-a456-4266141740cc";
const readbackFixture = (await import("@/lib/proposales/fixtures/proposal-readback.consistent.json")).default;

function ids(prefix: number) {
  let index = 0;
  return () => `00000000-0000-4000-8000-${String(prefix + index++).padStart(12, "0")}`;
}

function fakeProposales() {
  return createFakeProposalesClient({
    catalog: FIXTURE_CATALOG,
    editorOrigin: EDITOR_ORIGIN,
    newUuid: () => CREATED_UUID,
    now: () => NOW,
    proposalReadback: toProposalReadback(proposalReadbackSchema.parse(readbackFixture).data),
  });
}

function walk(value: unknown, visit: (node: unknown, inArray: boolean) => void, inArray = false) {
  visit(value, inArray);
  if (Array.isArray(value)) {
    for (const entry of value) walk(entry, visit, true);
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const entry of Object.values(value)) walk(entry, visit, false);
  }
}

beforeEach(() => {
  env.COPILOT_LIVE_MUTATIONS = "enabled";
  vi.clearAllMocks();
});

describe("proposal preparation server actions", () => {
  it("T-BOUND-1: rejects malformed input with the service's own issue paths", async () => {
    const wrongType = await actions.prepareTurnAction({ brief: 42 });
    expect(wrongType).toMatchObject({ ok: false, error: { code: "validation_error" } });
    expect(wrongType.ok).toBe(false);
    if (wrongType.ok) throw new Error("unreachable");
    expect(wrongType.error.details?.issues).toEqual([
      expect.objectContaining({ path: ["brief"] }),
    ]);

    const empty = await actions.prepareTurnAction({});
    expect(empty).toMatchObject({ ok: false, error: { code: "validation_error" } });

    const notAnObject = await actions.prepareTurnAction("just a string");
    expect(notAnObject).toMatchObject({ ok: false, error: { code: "validation_error" } });
  });

  it("T-BOUND-1b: rejects an unknown key, so the strict schema is the one under test", async () => {
    const result = await actions.prepareTurnAction({ brief: BRIEFS.noRecipient, version: 3 });

    expect(result).toMatchObject({ ok: false, error: { code: "validation_error" } });
  });

  it("T-BOUND-2: returns an expected failure as data and reduces an unknown error", async () => {
    vi.mocked(services.editProposition).mockRejectedValueOnce(
      new ConflictError({
        reason: "draft_already_exists",
        details: { proposalUuid: CREATED_UUID, editorUrl: `${EDITOR_ORIGIN}/p/${CREATED_UUID}` },
      }),
    );
    const conflict = await actions.editPropositionAction({});
    expect(conflict).toEqual({
      ok: false,
      error: {
        code: "conflict",
        message: "The requested operation conflicts with the current state",
        details: {
          proposalUuid: CREATED_UUID,
          editorUrl: `${EDITOR_ORIGIN}/p/${CREATED_UUID}`,
          reason: "draft_already_exists",
        },
      },
    });

    vi.mocked(services.reviseProposition).mockRejectedValueOnce(new Error("boom"));
    const unknownError = await actions.revisePropositionAction({});
    expect(unknownError).toEqual({
      ok: false,
      error: { code: "internal_error", message: "An unexpected error occurred." },
    });
    expect(JSON.stringify(unknownError)).not.toContain("boom");
  });

  it("T-BOUND-3: each action calls exactly one service exactly once with the raw input", async () => {
    const input = { anything: "at all" };
    const cases = [
      [actions.prepareTurnAction, services.prepareFromBrief],
      [actions.answerClarificationAction, services.answerClarification],
      [actions.editPropositionAction, services.editProposition],
      [actions.revisePropositionAction, services.reviseProposition],
    ] as const;

    for (const [action, service] of cases) {
      vi.mocked(service).mockResolvedValueOnce({} as never);
      await action(input);
      expect(service).toHaveBeenCalledTimes(1);
      expect(vi.mocked(service).mock.calls[0][0]).toBe(input);
    }

    vi.mocked(services.approveProposition).mockResolvedValueOnce({} as never);
    await actions.approveProposalAction(input);
    expect(services.approveProposition).toHaveBeenCalledTimes(1);
    expect(vi.mocked(services.approveProposition).mock.calls[0][0]).toEqual({ envelope: input });

    for (const [, service] of cases) {
      expect(service).toHaveBeenCalledTimes(1);
    }
  });

  it("T-BOUND-4: the exposure switch gates approval before the service is reached", async () => {
    env.COPILOT_LIVE_MUTATIONS = "disabled";
    const refused = await actions.approveProposalAction(validEnvelope());

    expect(refused).toEqual({
      ok: false,
      error: { code: "forbidden", message: "Draft creation is disabled on this deployment." },
    });
    expect(services.approveProposition).not.toHaveBeenCalled();

    env.COPILOT_LIVE_MUTATIONS = "enabled";
    vi.mocked(services.approveProposition).mockResolvedValueOnce({} as never);
    await actions.approveProposalAction(validEnvelope());
    expect(services.approveProposition).toHaveBeenCalledTimes(1);
  });

  it("T-BOUND-4b: gates approval only, never preparation or revision", async () => {
    env.COPILOT_LIVE_MUTATIONS = "disabled";
    vi.mocked(services.prepareFromBrief).mockResolvedValueOnce({} as never);
    vi.mocked(services.reviseProposition).mockResolvedValueOnce({} as never);

    await actions.prepareTurnAction({});
    await actions.revisePropositionAction({});

    expect(services.prepareFromBrief).toHaveBeenCalledTimes(1);
    expect(services.reviseProposition).toHaveBeenCalledTimes(1);
  });

  it("T-BOUND-5: every service result survives a JSON round trip unchanged", async () => {
    const proposales = fakeProposales();
    const nextId = ids(910);
    const turn = await prepareFromBrief({ brief: BRIEFS.englishSimple }, {
      ai: createScriptedAiClient(proposeStrong()),
      proposales,
      now: () => NOW,
      newGenerationId: () => "00000000-0000-4000-8000-000000000901",
      newQuestionId: nextId,
      newTurnId: nextId,
      newRunId: nextId,
      logger: createLogger({ sink: vi.fn() }),
      editorOrigin: EDITOR_ORIGIN,
    });
    const approval = await approveProposition({ envelope: validEnvelope() }, {
      proposales: fakeProposales(),
      ai: createFailingAiClient(),
      now: () => NOW,
      logger: createLogger({ sink: vi.fn() }),
      editorOrigin: EDITOR_ORIGIN,
    });

    for (const result of [turn, approval]) {
      expect(JSON.parse(JSON.stringify(result))).toEqual(result);
      walk(result, (node, inArray) => {
        expect(node).not.toBeInstanceOf(Date);
        expect(typeof node).not.toBe("function");
        if (inArray) expect(node).not.toBeUndefined();
      });
    }
  });
});
