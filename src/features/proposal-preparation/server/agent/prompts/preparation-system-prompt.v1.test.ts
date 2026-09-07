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
});
