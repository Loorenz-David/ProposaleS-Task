import { describe, expect, it } from "vitest";

import { DERIVATION_REGISTER } from "./derivation-register";

describe("derivation register", () => {
  it("C6(a): enumerates every current and future derived presentation row once", () => {
    expect(DERIVATION_REGISTER).toEqual([
      { derivedValue: "tab status and phase label", source: "the session runtime record", assertingPhase: "04" },
      { derivedValue: "attention", source: "the session's unread counter and active session id", assertingPhase: "05" },
      { derivedValue: "readiness count and per-resolution breakdown", source: "proposition.unresolvedItems", assertingPhase: "09" },
      { derivedValue: "a rendered money string", source: "the Money value it formats", assertingPhase: "10" },
      { derivedValue: "a leaf's provenance class and flag text", source: "that leaf alone", assertingPhase: "09" },
      { derivedValue: "a pill's kind, label, and meta", source: "the result part it presents", assertingPhase: "07" },
      { derivedValue: "the session count in the header", source: "the length of the tab list", assertingPhase: "06" },
      { derivedValue: "whether the composer's send is enabled", source: "the composer's own draft text and the session's in-flight state", assertingPhase: "06" },
      { derivedValue: "whether the clarification panel's send is enabled", source: "the panel's own per-question drafts", assertingPhase: "08" },
    ]);
  });
});
