import { describe, expect, it } from "vitest";

describe("proposal-preparation server surface", () => {
  it("exports the seven backend services", async () => {
    const surface = await import("./index");
    expect(Object.keys(surface).sort()).toEqual([
      "answerClarification",
      "approveProposition",
      "editProposition",
      "executeApprovedProposal",
      "prepareFromBrief",
      "reviseProposition",
      "searchContentForHuman",
    ]);
  });
});
