import { describe, expect, it } from "vitest";

import { fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { fixtureSessionRuntimeRecord } from "../fixtures/session-runtime.fixture";
import { toThreadViewModel, toWorkingLabel } from "./thread";

describe("thread view model", () => {
  it("maps human and completed agent turns without interpreting text", () => {
    const viewModel = toThreadViewModel(
      fixtureSessionRuntimeRecord({
        thread: [
          { entryId: "human", kind: "human", text: "messy\nbrief", scope: null },
          {
            entryId: "agent",
            kind: "result",
            result: { status: "proposition", proposition: fixturePropositionV1 },
            scope: null,
          },
        ],
      }),
    );
    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.turns[0]).toMatchObject({ owner: "human", text: "messy\nbrief" });
    expect(viewModel.turns[1]).toMatchObject({ owner: "agent", pills: expect.any(Array) });
  });

  it("derives the five honest activity labels", () => {
    expect([
      toWorkingLabel({ turnId: "1", kind: "brief" }),
      toWorkingLabel({ turnId: "2", kind: "answers" }),
      toWorkingLabel({ turnId: "3", kind: "edit", path: ["title"] }),
      toWorkingLabel({ turnId: "4", kind: "revision" }),
      toWorkingLabel({ turnId: "5", kind: "approval" }),
    ]).toEqual([
      "Drafting proposal",
      "Reading your answers",
      "Saving your edit",
      "Revising draft",
      "Creating in Proposales",
    ]);
  });
});
