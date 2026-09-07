import { describe, expect, it, vi } from "vitest";

import { temporaryFixturePropositionV1 } from "./proposition.temporary-fixture";
import { TEMPORARY_FIXTURE_TURN_LATENCY_MS, temporaryFixtureTurnAdapter } from "./turns.temporary-fixture";

const immediate = vi.fn(async () => {});

describe("temporary turn adapter", () => {
  it("waits through the one named latency and scripts by input kind only", async () => {
    expect((await temporaryFixtureTurnAdapter.run({ kind: "brief", text: "anything" }, 99, immediate)).ok).toBe(true);
    expect(immediate).toHaveBeenCalledWith(TEMPORARY_FIXTURE_TURN_LATENCY_MS);
    const answers = await temporaryFixtureTurnAdapter.run({ kind: "answers", answers: [] }, 1, immediate);
    const edit = await temporaryFixtureTurnAdapter.run({ kind: "edit", operation: { op: "set_leaf", path: ["title"], value: "x" } }, 2, immediate);
    const revision = await temporaryFixtureTurnAdapter.run({ kind: "revision", instruction: "anything", scope: null }, 3, immediate);
    const approval = await temporaryFixtureTurnAdapter.run({ kind: "approval", workflow: { currentProposition: temporaryFixturePropositionV1 }, proposition: temporaryFixturePropositionV1, acknowledgment: { statementId: "id", wording: "wording" } }, 4, immediate);
    expect(answers.ok && answers.result.status).toBe("proposition");
    expect(edit.ok && edit.result.status).toBe("proposition");
    expect(revision.ok && revision.result.status).toBe("proposition");
    expect(approval.ok && approval.result.status).toBe("created");
  });
});
