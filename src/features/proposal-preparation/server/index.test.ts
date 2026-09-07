import { describe, expect, it } from "vitest";

describe("proposal-preparation server surface", () => {
  it("exports the eight backend services", async () => {
    const surface = await import("./index");
    expect(Object.keys(surface).sort()).toEqual([
      "answerClarification",
      "approveProposition",
      "editProposition",
      "executeApprovedProposal",
      "getBlockImages",
      "prepareFromBrief",
      "reviseProposition",
      "searchContentForHuman",
    ]);
  });
});
