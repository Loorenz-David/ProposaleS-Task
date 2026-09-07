import type {
  TemporaryTurnInput,
  TemporaryTurnOutcome,
  TemporaryWorkflowState,
} from "../../types/temporary-turn";
import { temporaryFixtureClarificationBatch } from "./clarification.temporary-fixture";
import { temporaryFixtureDraftResultCreated } from "./draft-result.temporary-fixture";
import {
  temporaryFixturePropositionV1,
  temporaryFixturePropositionV2,
  temporaryFixturePropositionV3,
} from "./proposition.temporary-fixture";

export const TEMPORARY_FIXTURE_TURN_LATENCY_MS = 700;

type Wait = (milliseconds: number) => Promise<void>;
type TemporaryTurnAdapter = {
  run: (
    input: TemporaryTurnInput,
    position: number,
    wait?: Wait,
  ) => Promise<TemporaryTurnOutcome>;
};

const defaultWait: Wait =
  (milliseconds) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));

async function runScriptedTurn(
  input: TemporaryTurnInput,
  position: number,
  wait: Wait = defaultWait,
): Promise<TemporaryTurnOutcome> {
  await wait(TEMPORARY_FIXTURE_TURN_LATENCY_MS);

  if (input.kind === "brief") {
    return {
      ok: true,
      result: { status: "clarification", clarification: temporaryFixtureClarificationBatch },
      workflow: { clarification: temporaryFixtureClarificationBatch },
    };
  }

  if (input.kind === "answers") {
    void position;
    const proposition = temporaryFixturePropositionV1;
    return {
      ok: true,
      result: { status: "proposition", proposition },
      workflow: { currentProposition: proposition },
    };
  }

  if (input.kind === "edit") {
    return {
      ok: true,
      result: { status: "proposition", proposition: temporaryFixturePropositionV2 },
      workflow: { currentProposition: temporaryFixturePropositionV2 },
    };
  }

  if (input.kind === "revision") {
    return {
      ok: true,
      result: { status: "proposition", proposition: temporaryFixturePropositionV3 },
      workflow: { currentProposition: temporaryFixturePropositionV3 },
    };
  }

  const workflow: TemporaryWorkflowState = {
    currentProposition: input.proposition,
    draftReference: {
      proposalUuid: temporaryFixtureDraftResultCreated.proposalUuid,
      editorUrl: temporaryFixtureDraftResultCreated.editorUrl,
    },
  };
  return {
    ok: true,
    result: { status: "created", draftResult: temporaryFixtureDraftResultCreated },
    workflow,
  };
}

let testAdapter: TemporaryTurnAdapter | null = null;

export const temporaryFixtureTurnAdapter: TemporaryTurnAdapter = {
  run(input, position, wait) {
    return testAdapter
      ? testAdapter.run(input, position, wait)
      : runScriptedTurn(input, position, wait);
  },
};

export function setTemporaryTurnAdapterForTests(adapter: TemporaryTurnAdapter | null) {
  testAdapter = adapter;
}
