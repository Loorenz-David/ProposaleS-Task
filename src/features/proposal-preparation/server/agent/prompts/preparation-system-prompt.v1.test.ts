import { describe, expect, it } from "vitest";

import { preparationSystemPromptV1 } from "./preparation-system-prompt.v1";

describe("preparationSystemPromptV1", () => {
  it("P12 carries the agent rules without any user-provided data block", () => {
    const prompt = preparationSystemPromptV1({ mode: "revise", language: "en", catalogLanguages: ["en", "sv"], clarificationAllowed: false });
    expect(prompt).toContain("Consequential fields");
    expect(prompt).toContain("Never invent");
    expect(prompt).toContain("conversation_history");
    expect(prompt).toContain("current_instruction");
    expect(prompt).toContain("requestedOverrides");
    expect(prompt).toContain("<<<name (untrusted data)");
  });

  it("P12(b) states the absence shape, in both modes and whether or not asking is allowed", () => {
    // Five live failures on `recipient.value.phone`, `blocks[].optional` and
    // `blocks[].reviewerComment` were all one mistake: emitting null or omitting the key instead of
    // `{known: false}`. Every scripted fixture produces the right shape by construction, so no
    // offline row can notice the rule is missing from the prompt — this one asserts it is present.
    for (const mode of ["prepare", "revise"] as const) {
      for (const clarificationAllowed of [true, false]) {
        const prompt = preparationSystemPromptV1({ mode, language: "en", catalogLanguages: ["en"], clarificationAllowed });
        const where = { mode, clarificationAllowed };
        expect({ ...where, says: prompt.includes('{"known": false}') }).toEqual({ ...where, says: true });
        expect({ ...where, says: prompt.includes("never null") }).toEqual({ ...where, says: true });
        expect({ ...where, says: prompt.includes("never omit the field") }).toEqual({ ...where, says: true });
        // The leaves the live run actually got wrong are named, not just the rule in the abstract.
        for (const leaf of ["recipient", "quantity", "optional", "reviewerComment"]) {
          expect({ ...where, leaf, named: prompt.includes(leaf) }).toEqual({ ...where, leaf, named: true });
        }
      }
    }
  });
});
