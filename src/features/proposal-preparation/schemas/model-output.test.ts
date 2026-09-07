import { describe, expect, it } from "vitest";
import { z } from "zod";

import { strictBlockers, toOpenAiOutputAdapter } from "@/lib/ai/openai-schema";

import { languageDerivationOutputSchema } from "./agent-output";
import { modelClarificationSchema, modelOutputSchemaFor, modelPropositionSchema } from "./model-output";
import { modelPropositionOutput } from "../fixtures/scripts";

type AnyRecord = Record<string, any>;

/**
 * The size the payload work exists to move. 48,800 characters was the measured `allowClarification`
 * schema before this contract existed; the ceiling below is the measured size of this one plus
 * headroom, and it is asserted rather than described so that a change which quietly reintroduces
 * per-leaf provenance fails here instead of on the next provider bill.
 */
const MAX_MODEL_SCHEMA_CHARS = 12_000;
const PREVIOUS_SCHEMA_CHARS = 48_800;

function jsonSchemaFor(options: { mode: "prepare" | "revise"; allowClarification: boolean }) {
  return z.toJSONSchema(modelOutputSchemaFor(options), { io: "input" }) as AnyRecord;
}

function issuePaths(result: z.ZodSafeParseResult<unknown>): string[][] {
  return result.success ? [] : result.error.issues.map((issue) => issue.path.map(String));
}

describe("model output contract", () => {
  it("M1(a) parses a complete proposition and rejects an unknown key", () => {
    const schema = modelOutputSchemaFor({ mode: "prepare", allowClarification: false });
    expect(schema.safeParse(modelPropositionOutput()).success).toBe(true);
    expect(issuePaths(schema.safeParse({ ...modelPropositionOutput(), extra: 1 }))).toContainEqual([]);
  });

  it("M1(b) treats a missing key as an error rather than an absent value", () => {
    // The distinction the whole contract rests on: `null` is the human left it blank, an omitted
    // key is the model dropped it. Collapsing the two is how an unknown quantity becomes a fact.
    const withNulls = { ...modelPropositionOutput(), title: null, recipient: null };
    expect(modelPropositionSchema.safeParse(withNulls).success).toBe(true);

    const dropped = { ...modelPropositionOutput() } as AnyRecord;
    delete dropped.title;
    expect(issuePaths(modelPropositionSchema.safeParse(dropped))).toEqual([["title"]]);

    for (const key of ["warnings", "requestedOverrides", "commercialNotes", "blocks"]) {
      const missingArray = { ...modelPropositionOutput() } as AnyRecord;
      delete missingArray[key];
      expect(issuePaths(modelPropositionSchema.safeParse(missingArray))).toEqual([[key]]);
    }
  });

  it("M1(c) makes an inferred consequential value unrepresentable", () => {
    // The live evaluation asserts no consequential leaf is `inferred`. Here that is not a rule the
    // model could break and be caught at: quantity's evidence union has no `inferred` member, and
    // no `content` member either, so neither is expressible in the first place.
    const output = modelPropositionOutput() as AnyRecord;
    const blocks = structuredClone(output.blocks) as AnyRecord[];
    for (const evidence of [{ kind: "inferred" }, { kind: "content", variationId: "1" }]) {
      blocks[0].quantity = { value: 2, evidence };
      expect(modelPropositionSchema.safeParse({ ...output, blocks }).success).toBe(false);
    }
    blocks[0].quantity = { value: 2, evidence: { kind: "answer", ref: "Q1" } };
    expect(modelPropositionSchema.safeParse({ ...output, blocks }).success).toBe(true);
    // Presentational wording may be the model's own, and says so explicitly.
    expect(modelPropositionSchema.safeParse({ ...output, blocks, title: { value: "A title", evidence: { kind: "inferred" } } }).success).toBe(true);
  });

  it("M1(d) accepts only well-formed answer aliases", () => {
    const output = modelPropositionOutput() as AnyRecord;
    const withAlias = (ref: unknown) => {
      const blocks = structuredClone(output.blocks) as AnyRecord[];
      blocks[0].quantity = { value: 2, evidence: { kind: "answer", ref } };
      return modelPropositionSchema.safeParse({ ...output, blocks }).success;
    };
    for (const valid of ["Q1", "Q2", "Q10"]) expect(withAlias(valid)).toBe(true);
    for (const invalid of ["Q0", "q1", "Q01", "Q", "1", "", "Q1 ", 1]) expect(withAlias(invalid)).toBe(false);
  });

  it("M1(e) keeps a second clarification unrepresentable and bounds the questions", () => {
    expect(modelOutputSchemaFor({ mode: "prepare", allowClarification: true }).safeParse({ kind: "clarification", questions: [{ itemKey: "quantities", text: "How many?" }] }).success).toBe(true);
    expect(modelOutputSchemaFor({ mode: "prepare", allowClarification: false }).safeParse({ kind: "clarification", questions: [{ itemKey: "quantities", text: "How many?" }] }).success).toBe(false);
    expect(modelClarificationSchema.safeParse({ kind: "clarification", questions: [] }).success).toBe(false);
    expect(modelClarificationSchema.safeParse({ kind: "clarification", questions: Array.from({ length: 6 }, () => ({ itemKey: "quantities", text: "How many?" })) }).success).toBe(false);
  });

  it("M1(f) permits an override only when revising", () => {
    const override = { requestedOverrides: [{ path: ["recipient", "value", "email"], reason: "the human asked for it" }] };
    expect(modelOutputSchemaFor({ mode: "prepare", allowClarification: false }).safeParse({ ...modelPropositionOutput(), ...override }).success).toBe(false);
    expect(modelOutputSchemaFor({ mode: "revise", allowClarification: false }).safeParse({ ...modelPropositionOutput(), ...override }).success).toBe(true);
  });

  it("M2(a) serializes far smaller than the contract it replaces, in both modes", () => {
    const open = JSON.stringify(jsonSchemaFor({ mode: "prepare", allowClarification: true })).length;
    const commit = JSON.stringify(jsonSchemaFor({ mode: "prepare", allowClarification: false })).length;

    expect(open).toBeLessThanOrEqual(MAX_MODEL_SCHEMA_CHARS);
    expect(commit).toBeLessThanOrEqual(MAX_MODEL_SCHEMA_CHARS);
    expect(open).toBeLessThan(PREVIOUS_SCHEMA_CHARS / 4);
  });

  it("M2(b) states each evidence union once and refers to it", () => {
    // The three unions are what repeats: inlining them at every leaf is most of what made the old
    // schema large. Naming them also gives the system prompt something to refer to.
    const schema = jsonSchemaFor({ mode: "prepare", allowClarification: true });
    expect(Object.keys(schema.$defs ?? {}).sort()).toEqual([
      "ConsequentialEvidence",
      "ContentSelectionEvidence",
      "PresentationalEvidence",
    ]);
    expect(JSON.stringify(schema).match(/"\$ref"/g)?.length ?? 0).toBeGreaterThan(10);
  });

  it("M3 is shaped for constrained decoding, whether or not it is switched on", () => {
    // Strict mode is enabled separately and verified live. What this pins is that the contract was
    // designed to be eligible: every key required, absence expressed as null, no open records.
    for (const mode of ["prepare", "revise"] as const) {
      for (const allowClarification of [true, false]) {
        const adapted = toOpenAiOutputAdapter(jsonSchemaFor({ mode, allowClarification }));
        expect(strictBlockers(adapted.schema)).toEqual([]);
      }
    }
    expect(strictBlockers(toOpenAiOutputAdapter(z.toJSONSchema(languageDerivationOutputSchema, { io: "input" }) as AnyRecord).schema)).toEqual([]);
  });
});
