import { describe, expect, it } from "vitest";

import { fixturePropositionV1 } from "../fixtures/proposition.fixture";
import { readLeaf, sourcedToLeaf } from "./leaf";

describe("proposition leaf readers", () => {
  it("narrows a present leaf to its value, source and ref", () => {
    expect(readLeaf<string>(fixturePropositionV1.title)).toMatchObject({
      known: true,
      value: "Walnut dining set for Studio North",
      source: "inferred",
    });
  });

  it("narrows an absent leaf without inventing a value", () => {
    expect(readLeaf<number>(fixturePropositionV1.blocks[1].quantity)).toEqual({ known: false });
  });

  it("omits ref rather than setting it to undefined, so the shape stays JSON-clean", () => {
    const leaf = readLeaf<string>(fixturePropositionV1.title);
    expect(Object.keys(leaf)).not.toContain("ref");
  });

  it("refuses a value that is neither present nor absent, rather than reading it as absent", () => {
    expect(() => readLeaf<string>({ value: "x", source: "brief" })).toThrow(TypeError);
    expect(() => readLeaf<string>(undefined)).toThrow(TypeError);
    expect(() => readLeaf<string>("a string")).toThrow(TypeError);
  });

  it("presents an always-present leaf in the same shape without claiming it could be absent", () => {
    expect(sourcedToLeaf(fixturePropositionV1.blocks[0].title)).toMatchObject({
      known: true,
      value: "Walnut dining table restoration",
      source: "proposales_content",
    });
  });
});
