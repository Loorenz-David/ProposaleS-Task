import { describe, expect, it } from "vitest";

import { preparationSystemPromptV2 } from "./preparation-system-prompt.v2";

const every = (over: (input: { mode: "prepare" | "revise"; clarificationAllowed: boolean }) => void) => {
  for (const mode of ["prepare", "revise"] as const) {
    for (const clarificationAllowed of [true, false]) over({ mode, clarificationAllowed });
  }
};

function prompt(overrides: { mode?: "prepare" | "revise"; clarificationAllowed?: boolean } = {}) {
  return preparationSystemPromptV2({
    mode: overrides.mode ?? "prepare",
    language: "en",
    catalogLanguages: ["en", "sv"],
    clarificationAllowed: overrides.clarificationAllowed ?? false,
  });
}

describe("preparationSystemPromptV2", () => {
  it("V2(a) carries the commercial and injection rules without any user-provided data block", () => {
    const text = prompt({ mode: "revise" });
    expect(text).toContain("Consequential fields");
    expect(text).toContain("Never invent");
    expect(text).toContain("conversation_history");
    expect(text).toContain("current_instruction");
    expect(text).toContain("requestedOverrides");
    expect(text).toContain("<<<name (untrusted data)");
    expect(text).toContain("read-only");
  });

  it("V2(b) states every evidence kind and what it may support, in both modes", () => {
    // Offline fixtures produce resolvable evidence by construction, so no scripted row can notice
    // the rules are missing from the prompt. This is the row that asserts they are stated.
    every(({ mode, clarificationAllowed }) => {
      const text = prompt({ mode, clarificationAllowed });
      const where = { mode, clarificationAllowed };
      for (const kind of ["brief", "answer", "instruction", "current", "content", "inferred"]) {
        expect({ ...where, kind, stated: text.includes(`"kind":"${kind}"`) }).toEqual({ ...where, kind, stated: true });
      }
      expect({ ...where, says: text.includes("must appear in the brief") }).toEqual({ ...where, says: true });
      expect({ ...where, says: text.includes("a skipped question states nothing") }).toEqual({ ...where, says: true });
      expect({ ...where, says: text.includes("never be inferred") }).toEqual({ ...where, says: true });
    });
  });

  it("V2(c) states that absence is null, and names the leaves a live run got wrong before", () => {
    // The failure this replaces: five live runs emitted null or omitted the key where the old
    // contract wanted `{known: false}`. Here null *is* the answer, and saying so is what stops the
    // model inventing a filler value instead.
    every(({ mode, clarificationAllowed }) => {
      const text = prompt({ mode, clarificationAllowed });
      const where = { mode, clarificationAllowed };
      expect({ ...where, says: text.includes("no supported value is null") }).toEqual({ ...where, says: true });
      expect({ ...where, says: text.includes("Never omit a key") }).toEqual({ ...where, says: true });
      for (const leaf of ["recipient", "quantity", "optional", "reviewerComment"]) {
        expect({ ...where, leaf, named: text.includes(leaf) }).toEqual({ ...where, leaf, named: true });
      }
    });
  });

  it("V2(d) teaches no provenance authoring at all", () => {
    // The point of the contract: the model states evidence, the application states provenance. A
    // prompt that told the model about `known`, `source` or `ref` would be teaching it to write a
    // shape this contract does not accept.
    every(({ mode, clarificationAllowed }) => {
      const text = prompt({ mode, clarificationAllowed });
      // `"ref"` is not in this list on purpose: an answer selector legitimately has one. What may
      // not appear is the domain's own provenance vocabulary — the wrapper, the source field, and
      // the source values themselves.
      for (const authored of ['"known"', '"source"', "discriminator", "proposales_content", "provenance ref"]) {
        expect({ mode, clarificationAllowed, authored, absent: !text.includes(authored) }).toEqual({ mode, clarificationAllowed, authored, absent: true });
      }
    });
  });

  it("V2(e) says how the run is configured, and what a revision may replace", () => {
    expect(prompt({ clarificationAllowed: true })).toContain("Clarification allowed: true");
    expect(prompt({ clarificationAllowed: false })).toContain("Clarification allowed: false");
    expect(prompt({ mode: "prepare" })).toContain("requestedOverrides must be an empty array");
    expect(prompt({ mode: "revise" })).toContain("requestedOverrides");
    expect(prompt({ mode: "revise" })).toContain('{"kind":"current"}');
  });
});
