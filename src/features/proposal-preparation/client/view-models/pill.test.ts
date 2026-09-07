import { describe, expect, it } from "vitest";

import { fixtureClarificationAnswered, fixtureClarificationBatch } from "../fixtures/clarification.fixture";
import { fixtureDraftResultCreated } from "../fixtures/draft-result.fixture";
import { fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { toPillViewModels } from "./pill";

describe("pill view models", () => {
  it("maps proposition attachments in order with stable entry ids", () => {
    const pills = toPillViewModels({ status: "proposition", proposition: fixturePropositionV1 }, "entry-7");
    expect(pills.map((pill) => [pill.id, pill.kind])).toEqual([
      ["entry-7:thought", "thought"],
      ["entry-7:action", "action"],
    ]);
    expect(JSON.stringify(pills)).not.toContain("diff");
  });

  it("maps open, answered, and skipped questions", () => {
    const open = toPillViewModels({ status: "clarification", questions: fixtureClarificationBatch.questions }, "entry")[0];
    const mixed = toPillViewModels(
      { status: "clarification", questions: fixtureClarificationAnswered.questions },
      "entry",
      fixtureClarificationAnswered.answers,
    )[0];
    expect(open).toMatchObject({ kind: "ask", defaultExpanded: true });
    expect(mixed).toMatchObject({ kind: "ask", payload: { questions: expect.arrayContaining([
      expect.objectContaining({ state: "answered" }),
      expect.objectContaining({ state: "skipped" }),
      expect.objectContaining({ state: "open" }),
    ]) } });
  });

  it("preserves the returned editor URL on created results", () => {
    const [link] = toPillViewModels({ status: "created", draft: fixtureDraftResultCreated }, "entry");
    expect(link).toMatchObject({ kind: "link", href: fixtureDraftResultCreated.editorUrl });
  });
});
