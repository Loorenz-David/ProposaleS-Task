import { describe, expect, it } from "vitest";

import { fixtureDraftResultCreated } from "../fixtures/draft-result.fixture";
import { fixtureErrorDto, fixtureFailedResult } from "../fixtures/failures.fixture";
import { fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { fixtureSessionRuntimeRecord } from "../fixtures/session-runtime.fixture";
import { fixtureTerminalWorkflowState, fixtureWorkflowState } from "../fixtures/workflow-state.fixture";
import { toMainSurfaceViewModel } from "./main-surface";

describe("main surface derivation", () => {
  it("uses the specified first-match precedence", () => {
    const created = fixtureSessionRuntimeRecord({
      latestResult: { status: "created", draft: fixtureDraftResultCreated },
      workflow: fixtureTerminalWorkflowState(),
    });
    expect(toMainSurfaceViewModel({ ...created, inFlightTurn: { turnId: "approval", kind: "approval" } }).kind).toBe("creating");
    expect(toMainSurfaceViewModel(created).kind).toBe("created");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({ workflow: fixtureWorkflowState() })).kind).toBe("review");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord()).kind).toBe("idle");
  });

  it("R8.1/R8.2: resolves the four states and all specified overlaps first-match", () => {
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({
      inFlightTurn: { turnId: "reapproval", kind: "approval" },
      workflow: fixtureTerminalWorkflowState(),
      latestResult: { status: "created", draft: fixtureDraftResultCreated },
    })).kind).toBe("creating");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({ inFlightTurn: { turnId: "a", kind: "approval" } })).kind).toBe("creating");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({
      workflow: fixtureTerminalWorkflowState(),
      latestResult: { status: "created", draft: fixtureDraftResultCreated },
    })).kind).toBe("created");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({ workflow: fixtureWorkflowState(), latestResult: { status: "clarification", questions: [] } })).kind).toBe("review");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({ workflow: fixtureWorkflowState(), latestResult: fixtureFailedResult("tool_output_invalid") })).kind).toBe("review");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({ latestResult: { status: "clarification", questions: [] } })).kind).toBe("idle");
    expect(toMainSurfaceViewModel(fixtureSessionRuntimeRecord({ inFlightTurn: { turnId: "brief", kind: "brief" }, workflow: fixtureWorkflowState() })).kind).toBe("review");
  });

  it("selects retained review state and creation failure without deriving new data", () => {
    const record = fixtureSessionRuntimeRecord({
      workflow: fixtureWorkflowState(),
      retained: { workSurface: "preview", openedBlockContentId: fixturePropositionV1.blocks[0]!.contentId.value },
      callFailure: { site: { kind: "creation" }, error: fixtureErrorDto("integration_error"), retry: { kind: "approval" } },
    });
    expect(toMainSurfaceViewModel(record)).toMatchObject({ kind: "review", workSurface: "preview", openedBlock: { index: 0 }, creationFailure: { key: "integration_error" } });
  });

  it("R5.4/R5.5: routes edit validation DTO paths to leaves and the surface", () => {
    const record = fixtureSessionRuntimeRecord({
      workflow: fixtureWorkflowState(),
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
    const blockId = fixturePropositionV1.blocks[0]!.contentId.value;
    const retained = { workSurface: "preview" as const, openedBlockContentId: blockId };
    const review = fixtureSessionRuntimeRecord({
      retained,
      workflow: fixtureWorkflowState(),
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
      workflow: fixtureWorkflowState({ currentProposition: { ...fixturePropositionV1, blocks: fixturePropositionV1.blocks.slice(1) } }),
    };
    const defaulted = toMainSurfaceViewModel(later);
    expect(defaulted.kind).toBe("review");
    if (defaulted.kind === "review") expect(defaulted.openedBlock).toBeNull();
    expect(later.retained).toBe(retained);
  });
});
