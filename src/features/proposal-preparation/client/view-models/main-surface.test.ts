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

  it("R8.1/R8.2: resolves the four states and all specified overlaps first-match", () => {
    const proposition = { currentProposition: temporaryFixturePropositionV1 };
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({
      inFlightTurn: { turnId: "reapproval", kind: "approval" },
      workflow: { currentProposition: temporaryFixturePropositionV1, draftReference: { proposalUuid: "p", editorUrl: "https://example.invalid" } },
      latestResult: { status: "created", draftResult: temporaryFixtureDraftResultCreated },
    })).kind).toBe("creating");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({ inFlightTurn: { turnId: "a", kind: "approval" } })).kind).toBe("creating");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({
      workflow: { currentProposition: temporaryFixturePropositionV1, draftReference: { proposalUuid: "p", editorUrl: "https://example.invalid" } },
      latestResult: { status: "created", draftResult: temporaryFixtureDraftResultCreated },
    })).kind).toBe("created");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({ workflow: proposition, latestResult: { status: "clarification", clarification: { questions: [], answers: [] } } })).kind).toBe("review");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({ workflow: proposition, latestResult: { status: "failed", failure: { reason: "tool_output_invalid" } } })).kind).toBe("review");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({ latestResult: { status: "clarification", clarification: { questions: [], answers: [] } } })).kind).toBe("idle");
    expect(toMainSurfaceViewModel(temporaryFixtureSessionRuntimeRecord({ inFlightTurn: { turnId: "brief", kind: "brief" }, workflow: proposition })).kind).toBe("review");
  });

  it("selects retained review state and creation failure without deriving new data", () => {
    const record = temporaryFixtureSessionRuntimeRecord({
      workflow: { currentProposition: temporaryFixturePropositionV1 },
      retained: { workSurface: "preview", openedBlockContentId: temporaryFixturePropositionV1.blocks[0]!.contentId.value },
      callFailure: { site: { kind: "creation" }, error: temporaryFixtureErrorDto("integration_error"), retry: { kind: "approval", workflow: { currentProposition: temporaryFixturePropositionV1 }, proposition: temporaryFixturePropositionV1, acknowledgment: { statementId: "id", wording: "wording" } } },
    });
    expect(toMainSurfaceViewModel(record)).toMatchObject({ kind: "review", workSurface: "preview", openedBlock: { index: 0 }, creationFailure: { key: "integration_error" } });
  });

  it("R5.4/R5.5: routes edit validation DTO paths to leaves and the surface", () => {
    const record = temporaryFixtureSessionRuntimeRecord({
      workflow: { currentProposition: temporaryFixturePropositionV1 },
      callFailure: {
        site: { kind: "edit", path: ["title"] },
        error: {
          code: "validation_error",
          message: "Review the highlighted information before trying again.",
          details: {
            issues: [
              { path: ["title"], message: "Title is invalid." },
              { path: ["unknown", "leaf"], message: "Unknown leaf is invalid." },
            ],
          },
        },
        retry: { kind: "edit", operation: { op: "set_leaf", path: ["title"], value: "x" } },
      },
    });
    const surface = toMainSurfaceViewModel(record);
    expect(surface.kind).toBe("review");
    if (surface.kind !== "review") return;
    expect(surface.review.fields[0]?.leaf.validationMessage).toBe("Title is invalid.");
    expect(surface.review.surfaceErrors).toEqual(["Unknown leaf is invalid."]);
    expect(surface.review.fields[0]?.leaf.display).not.toBe("x");
  });

  it("R8.3/R8.6: resolves retained references at render and never renders stale category-C values", () => {
    const blockId = temporaryFixturePropositionV1.blocks[0]!.contentId.value;
    const retained = { workSurface: "preview" as const, openedBlockContentId: blockId };
    const review = temporaryFixtureSessionRuntimeRecord({
      retained,
      workflow: { currentProposition: temporaryFixturePropositionV1 },
    });
    const first = toMainSurfaceViewModel(review);
    expect(first.kind).toBe("review");
    if (first.kind === "review") expect(first.openedBlock?.contentId).toBe(blockId);

    const noWorkflow = { ...review, workflow: null };
    const idle = toMainSurfaceViewModel(noWorkflow);
    expect(idle.kind).toBe("idle");
    expect(noWorkflow.retained).toBe(retained);

    const later = {
      ...review,
      workflow: { currentProposition: { ...temporaryFixturePropositionV1, blocks: temporaryFixturePropositionV1.blocks.slice(1) } },
    };
    const defaulted = toMainSurfaceViewModel(later);
    expect(defaulted.kind).toBe("review");
    if (defaulted.kind === "review") expect(defaulted.openedBlock).toBeNull();
    expect(later.retained).toBe(retained);
  });
});
