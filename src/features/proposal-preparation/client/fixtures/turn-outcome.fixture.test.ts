import { describe, expect, it } from "vitest";

import { domainResultSchema } from "../../schemas/turn-result";
import {
  fixtureClarificationOutcome,
  fixtureCreatedOutcome,
  fixturePropositionOutcome,
} from "./turn-outcome.fixture";

describe("turn outcome fixtures", () => {
  it("each outcome carries a result the real schema accepts and a state", () => {
    for (const outcome of [
      fixtureClarificationOutcome(),
      fixturePropositionOutcome(),
      fixtureCreatedOutcome(),
    ]) {
      if (!outcome.ok) throw new Error("fixture outcomes are successful by construction");
      expect(domainResultSchema.safeParse(outcome.result).success).toBe(true);
      expect(outcome.state).toBeDefined();
    }
  });

  it("only the created outcome omits a conversation, because approval returns none", () => {
    expect(fixtureClarificationOutcome()).toHaveProperty("conversation");
    expect(fixturePropositionOutcome()).toHaveProperty("conversation");
    expect(fixtureCreatedOutcome()).not.toHaveProperty("conversation");
  });
});
