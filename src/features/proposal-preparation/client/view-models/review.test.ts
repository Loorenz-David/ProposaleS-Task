import { describe, expect, it } from "vitest";

import { fixturePropositionEmpty, fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { fixtureSessionRuntimeRecord } from "../fixtures/session-runtime.fixture";
import { fixtureWorkflowState } from "../fixtures/workflow-state.fixture";
import { toProvenanceViewModel, toReviewSurfaceViewModel } from "./review";

function review(proposition = fixturePropositionV1) {
  return toReviewSurfaceViewModel(
    fixtureSessionRuntimeRecord({ workflow: fixtureWorkflowState({ currentProposition: proposition }) }),
  );
}

describe("review view model", () => {
  it("maps every carried editable leaf and no fixed extra field", () => {
    const viewModel = review();
    expect(viewModel.fields.map((field) => field.leaf.path.join("."))).toEqual([
      "title", "language", "descriptionNarrative", "recipient.value.firstName",
      "recipient.value.lastName", "recipient.value.email", "recipient.value.phone",
      "recipient.value.companyName",
    ]);
    expect(viewModel.blocks.flatMap((block) => [block.quantity.path.join("."), block.optional.path.join("."), block.reviewerComment.path.join(".")])).toHaveLength(fixturePropositionV1.blocks.length * 3);
    expect(viewModel.blocks[0]?.alternatives.map((alternative) => alternative.variationId)).toEqual(
      fixturePropositionV1.blocks[0]?.alternatives.map((alternative) => alternative.variationId),
    );
  });

  it("represents every provenance class with explicit text", () => {
    expect(toProvenanceViewModel({ known: false })).toEqual({ class: "absent", text: "Not set" });
    expect(toProvenanceViewModel({ known: true, value: "x", source: "human" })).toEqual({ class: "human", text: "Set by you" });
    expect(toProvenanceViewModel({ known: true, value: "x", source: "inferred" })).toEqual({ class: "inferred", text: "Assumed by the agent" });
    expect(toProvenanceViewModel({ known: true, value: "x", source: "brief" })).toEqual({ class: "sourced", text: null });
  });

  it("uses honest absence language and resolution-only readiness counts", () => {
    const empty = review(fixturePropositionEmpty);
    expect(empty.fields.every((field) => !["0", "1", "false", "", "-"].includes(field.leaf.display))).toBe(true);
    expect(empty.readiness).toMatchObject({ unresolved: 1, deferred: 0, summary: "1 open · 0 deferred · nothing sent yet" });
    expect(review().readiness).toMatchObject({ unresolved: 1, deferred: 1 });
  });

  it("routes unmatched validation issues to the surface", () => {
    const record = fixtureSessionRuntimeRecord({ workflow: fixtureWorkflowState() });
    const viewModel = toReviewSurfaceViewModel(record, [
      { path: ["title"], message: "Title issue" },
      { path: ["not-rendered"], message: "Surface issue" },
    ]);
    expect(viewModel.fields[0]?.leaf.validationMessage).toBe("Title issue");
    expect(viewModel.surfaceErrors).toEqual(["Surface issue"]);
  });

  it("R5.5: matches validation paths element-wise, including keys containing dots", () => {
    const record = fixtureSessionRuntimeRecord({ workflow: fixtureWorkflowState() });
    const viewModel = toReviewSurfaceViewModel(record, [
      { path: ["recipient.value.firstName"], message: "Dotted key issue" },
      { path: ["recipient", "value", "firstName"], message: "First name issue" },
      { path: ["recipient"], message: "Prefix issue" },
      { path: ["not-rendered", "leaf"], message: "Surface issue" },
    ]);
    expect(viewModel.fields.find((field) => field.leaf.path.join(".") === "recipient.value.firstName")?.leaf.validationMessage).toBe("First name issue");
    expect(viewModel.surfaceErrors).toEqual(["Dotted key issue", "Prefix issue", "Surface issue"]);
  });

  it("R5.6: preserves alternatives exactly as returned", () => {
    // Capped at MAX_ALTERNATIVES_PER_BLOCK by the schema, so the duplicate replaces an entry
    // rather than extending past the cap; order and repetition are still what is under test.
    const alternatives = [
      fixturePropositionV1.blocks[0]!.alternatives[1]!,
      fixturePropositionV1.blocks[0]!.alternatives[0]!,
      fixturePropositionV1.blocks[0]!.alternatives[0]!,
    ];
    const proposition = {
      ...fixturePropositionV1,
      blocks: [{ ...fixturePropositionV1.blocks[0]!, alternatives }],
    };
    const viewModel = review(proposition);
    expect(viewModel.blocks[0]?.alternatives.map((alternative) => alternative.variationId)).toEqual(
      alternatives.map((alternative) => alternative.variationId),
    );
  });
});
