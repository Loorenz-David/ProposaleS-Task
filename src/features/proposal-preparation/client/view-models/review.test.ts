import { describe, expect, it } from "vitest";

import { temporaryFixturePropositionEmpty, temporaryFixturePropositionV1 } from "../fixtures/proposition.temporary-fixture";
import { temporaryFixtureSessionRuntimeRecord } from "../fixtures/session-runtime.temporary-fixture";
import { toProvenanceViewModel, toReviewSurfaceViewModel } from "./review";

function review(proposition = temporaryFixturePropositionV1) {
  return toReviewSurfaceViewModel(
    temporaryFixtureSessionRuntimeRecord({ workflow: { currentProposition: proposition } }),
  );
}

describe("review view model", () => {
  it("maps every carried editable leaf and no fixed extra field", () => {
    const viewModel = review();
    expect(viewModel.fields.map((field) => field.leaf.path.join("."))).toEqual([
      "title", "language", "descriptionNarrative", "recipient.firstName", "recipient.lastName",
      "recipient.email", "recipient.phone", "recipient.companyName",
    ]);
    expect(viewModel.blocks.flatMap((block) => [block.quantity.path.join("."), block.optional.path.join("."), block.reviewerComment.path.join(".")])).toHaveLength(temporaryFixturePropositionV1.blocks.length * 3);
    expect(viewModel.blocks[0]?.alternatives.map((alternative) => alternative.variationId)).toEqual(
      temporaryFixturePropositionV1.blocks[0]?.alternatives.map((alternative) => alternative.variationId),
    );
  });

  it("represents every provenance class with explicit text", () => {
    expect(toProvenanceViewModel({ known: false })).toEqual({ class: "absent", text: "Not set" });
    expect(toProvenanceViewModel({ known: true, value: "x", source: "human" })).toEqual({ class: "human", text: "Set by you" });
    expect(toProvenanceViewModel({ known: true, value: "x", source: "inferred" })).toEqual({ class: "inferred", text: "Assumed by the agent" });
    expect(toProvenanceViewModel({ known: true, value: "x", source: "brief" })).toEqual({ class: "sourced", text: null });
  });

  it("uses honest absence language and resolution-only readiness counts", () => {
    const empty = review(temporaryFixturePropositionEmpty);
    expect(empty.fields.every((field) => !["0", "1", "false", "", "-"].includes(field.leaf.display))).toBe(true);
    expect(empty.readiness).toMatchObject({ unresolved: 1, deferred: 0, summary: "1 open · 0 deferred · nothing sent yet" });
    expect(review().readiness).toMatchObject({ unresolved: 1, deferred: 1 });
  });

  it("routes unmatched validation issues to the surface", () => {
    const record = temporaryFixtureSessionRuntimeRecord({ workflow: { currentProposition: temporaryFixturePropositionV1 } });
    const viewModel = toReviewSurfaceViewModel(record, [
      { path: ["title"], message: "Title issue" },
      { path: ["not-rendered"], message: "Surface issue" },
    ]);
    expect(viewModel.fields[0]?.leaf.validationMessage).toBe("Title issue");
    expect(viewModel.surfaceErrors).toEqual(["Surface issue"]);
  });
});
