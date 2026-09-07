import { describe, expect, it } from "vitest";

import { temporaryFixtureClarificationAnswered, temporaryFixtureClarificationBatch } from "../fixtures/clarification.temporary-fixture";
import { temporaryFixtureDraftResultCreated } from "../fixtures/draft-result.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../fixtures/proposition.temporary-fixture";
import { toPillViewModels } from "./pill";

describe("pill view models", () => {
  it("maps proposition attachments in order with stable entry ids", () => {
    const pills = toPillViewModels({ status: "proposition", proposition: temporaryFixturePropositionV1 }, "entry-7");
    expect(pills.map((pill) => [pill.id, pill.kind])).toEqual([
      ["entry-7:thought", "thought"],
      ["entry-7:action", "action"],
    ]);
    expect(JSON.stringify(pills)).not.toContain("diff");
  });

  it("maps open, answered, and skipped questions", () => {
    const open = toPillViewModels({ status: "clarification", clarification: temporaryFixtureClarificationBatch }, "entry")[0];
    const mixed = toPillViewModels({ status: "clarification", clarification: temporaryFixtureClarificationAnswered }, "entry")[0];
    expect(open).toMatchObject({ kind: "ask", defaultExpanded: true });
    expect(mixed).toMatchObject({ kind: "ask", payload: { questions: expect.arrayContaining([
      expect.objectContaining({ state: "answered" }),
      expect.objectContaining({ state: "skipped" }),
      expect.objectContaining({ state: "open" }),
    ]) } });
  });

  it("preserves the returned editor URL on created results", () => {
    const [link] = toPillViewModels({ status: "created", draftResult: temporaryFixtureDraftResultCreated }, "entry");
    expect(link).toMatchObject({ kind: "link", href: temporaryFixtureDraftResultCreated.editorUrl });
  });
});
