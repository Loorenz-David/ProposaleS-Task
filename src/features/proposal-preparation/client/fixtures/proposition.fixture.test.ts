import { describe, expect, it } from "vitest";

import { propositionSchema } from "../../schemas/proposition";
import {
  fixturePropositionEmpty,
  fixturePropositionLongText,
  fixturePropositionV1,
  fixturePropositionV2,
  fixturePropositionV3,
} from "./proposition.fixture";

describe("proposition fixtures", () => {
  it("every fixture is a value the real schema accepts", () => {
    for (const proposition of [
      fixturePropositionV1,
      fixturePropositionV2,
      fixturePropositionV3,
      fixturePropositionLongText,
      fixturePropositionEmpty,
    ]) {
      expect(propositionSchema.safeParse(proposition).success).toBe(true);
    }
  });

  it("F15: a literal missing a required field is rejected, so the parse is load-bearing", () => {
    const { generationId: _generationId, ...withoutGenerationId } = fixturePropositionV1;
    expect(propositionSchema.safeParse(withoutGenerationId).success).toBe(false);

    // The rule the fixture era violated: a consequential leaf may not be sourced to the model.
    const inferredQuantity = {
      ...fixturePropositionV1,
      blocks: [
        { ...fixturePropositionV1.blocks[0], quantity: { known: true, value: 3, source: "inferred" } },
        ...fixturePropositionV1.blocks.slice(1),
      ],
    };
    expect(propositionSchema.safeParse(inferredQuantity).success).toBe(false);
  });

  it("versions differ only where the fixture era's edit and revision changed them", () => {
    expect(fixturePropositionV2.version).toBe(2);
    expect(fixturePropositionV3.version).toBe(3);
    expect(fixturePropositionV2.blocks).toEqual(fixturePropositionV1.blocks);
  });
});
