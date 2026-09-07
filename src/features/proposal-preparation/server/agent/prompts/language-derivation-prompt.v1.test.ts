import { describe, expect, it } from "vitest";

import { languageDerivationPromptV1 } from "./language-derivation-prompt.v1";

describe("languageDerivationPromptV1", () => {
  it("P8 limits derivation to language selection from labeled data", () => {
    expect(languageDerivationPromptV1).toContain("catalog languages");
    expect(languageDerivationPromptV1).toContain("language: null");
    expect(languageDerivationPromptV1).toContain("Do not translate");
    expect(languageDerivationPromptV1).not.toContain("EUR");
  });
});
