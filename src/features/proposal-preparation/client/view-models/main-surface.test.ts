import { describe, expect, it } from "vitest";

import { temporaryFixtureDraftResultCreated } from "../fixtures/draft-result.temporary-fixture";
import { temporaryFixtureErrorDto } from "../fixtures/failures.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../fixtures/proposition.temporary-fixture";
import { temporaryFixtureSessionRuntimeRecord } from "../fixtures/session-runtime.temporary-fixture";
import { toMainSurfaceViewModel } from "./main-surface";

describe("main surface derivation", () => {
  it("uses the specified first-match precedence", () => {
    const created = temporaryFixtureSessionRuntimeRecord({
      latestResult: { status: "created", draftResult: temporaryFixtureDraftResultCreated },
      workflow: { currentProposition: temporaryFixturePropositionV1, draftReference: { proposalUuid: temporaryFixtureDraftResultCreated.proposalUuid, editorUrl: temporaryFixtureDraftResultCreated.editorUrl } },
    });
    expect(toMainSurfaceViewModel({ ...created, inFlightTurn: { turnId: "approval", kind: "approval" } }).kind).toBe("creating");
    expect(toMainSurfaceViewModel(created).kind).toBe("created");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({ workflow: { currentProposition: temporaryFixturePropositionV1 } })).kind).toBe("review");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord()).kind).toBe("idle");
  });

  it("selects retained review state and creation failure without deriving new data", () => {
    const record = temporaryFixtureSessionRuntimeRecord({
      workflow: { currentProposition: temporaryFixturePropositionV1 },
      retained: { workSurface: "preview", openedBlockContentId: temporaryFixturePropositionV1.blocks[0]!.contentId.value },
      callFailure: { site: { kind: "creation" }, error: temporaryFixtureErrorDto("integration_error"), retry: { kind: "approval", workflow: { currentProposition: temporaryFixturePropositionV1 }, proposition: temporaryFixturePropositionV1, acknowledgment: { statementId: "id", wording: "wording" } } },
    });
    expect(toMainSurfaceViewModel(record)).toMatchObject({ kind: "review", workSurface: "preview", openedBlock: { index: 0 }, creationFailure: { key: "integration_error" } });
  });
});
