import { describe, expect, it } from "vitest";

import { resolveLanguage } from "./resolve-language";

describe("resolveLanguage", () => {
  it("P8 resolves only a candidate present in the catalog language set", () => {
    expect(resolveLanguage("en", ["en", "sv"])).toEqual({ kind: "resolved", language: "en" });
    expect(resolveLanguage("de", ["en", "sv"])).toEqual({ kind: "ask" });
    expect(resolveLanguage(null, ["en", "sv"])).toEqual({ kind: "ask" });
  });
});
