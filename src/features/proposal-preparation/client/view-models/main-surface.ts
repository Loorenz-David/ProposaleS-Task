import type { SessionRuntimeRecord, WorkSurface } from "../../types/session";
import { toCreatedViewModel, type CreatedViewModel } from "./created";
import {
  toCreationFailureViewModel,
  type CreationFailureViewModel,
} from "./failure";
import {
  toReviewSurfaceViewModel,
  type BlockViewModel,
  type ReviewSurfaceViewModel,
} from "./review";

export type MainSurfaceViewModel =
  | { kind: "idle" }
  | {
      kind: "review";
      review: ReviewSurfaceViewModel;
      workSurface: WorkSurface;
      openedBlock: BlockViewModel | null;
      creationFailure: CreationFailureViewModel | null;
    }
  | { kind: "creating"; label: string }
  | { kind: "created"; created: CreatedViewModel };

function validationIssues(record: SessionRuntimeRecord) {
  if (record.callFailure?.site.kind !== "edit" || record.callFailure.error.code !== "validation_error") {
    return [];
  }
  const issues = record.callFailure.error.details?.issues;
  if (!Array.isArray(issues)) return [];
  return issues.flatMap((issue) => {
    if (!issue || typeof issue !== "object") return [];
    const path = "path" in issue ? issue.path : null;
    const message = "message" in issue ? issue.message : null;
    return Array.isArray(path) && path.every((part) => typeof part === "string") && typeof message === "string"
      ? [{ path, message }]
      : [];
  });
}

export function toMainSurfaceViewModel(record: SessionRuntimeRecord): MainSurfaceViewModel {
  if (record.inFlightTurn?.kind === "approval") {
    return { kind: "creating", label: "Creating draft in Proposales" };
  }
  if (record.workflow?.draftReference) {
    return { kind: "created", created: toCreatedViewModel(record) };
  }
  if (record.workflow?.currentProposition) {
    const review = toReviewSurfaceViewModel(record, validationIssues(record));
    return {
      kind: "review",
      review,
      workSurface: record.retained.workSurface,
      openedBlock:
        review.blocks.find(
          (block) => block.contentId === record.retained.openedBlockContentId,
        ) ?? null,
      creationFailure:
        record.callFailure?.site.kind === "creation"
          ? toCreationFailureViewModel(record.callFailure)
          : null,
    };
  }
  return { kind: "idle" };
}
