import { z } from "zod";
import { describe, expect, it } from "vitest";

import { agentClarificationOutput, agentPropositionOutput } from "../fixtures/scripts";

type AnyRecord = Record<string, any>;

async function modules() {
  return {
    agentOutput: await import("./agent-output"),
    proposition: await import("./proposition"),
    clarification: await import("./clarification"),
  };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

function firstIssue(result: AnyRecord): AnyRecord {
  if (result.success) throw new Error("expected parse failure");
  return result.error.issues[0];
}

const PREPARE = { mode: "prepare" as const, allowClarification: true };
const REVISE = { mode: "revise" as const, allowClarification: false };

describe("agent output schema", () => {
  it("S2(a) accepts a conforming proposition output in both modes", async () => {
    const { agentOutput } = await modules();
    expect(agentOutput.agentOutputSchemaFor(PREPARE).safeParse(agentPropositionOutput()).success).toBe(true);
    expect(agentOutput.agentOutputSchemaFor(REVISE).safeParse(agentPropositionOutput()).success).toBe(true);
  });

  it("S2(b) refuses every field the application owns", async () => {
    const { agentOutput } = await modules();
    const schema = agentOutput.agentOutputSchemaFor(PREPARE);

    // The application supplies these; a model that writes one is claiming authority it lacks.
    for (const key of ["version", "preparedAt", "generationId", "unresolvedItems", "emptyDraftConfirmation"]) {
      const output = agentPropositionOutput({ [key]: 1 });
      const issue = firstIssue(schema.safeParse(output));
      expect({ key, code: issue.code, keys: issue.keys }).toEqual({ key, code: "unrecognized_keys", keys: [key] });
    }
  });

  it("S2(c) refuses catalog-verbatim text and ranking on a block", async () => {
    const { agentOutput } = await modules();
    const schema = agentOutput.agentOutputSchemaFor(PREPARE);

    // title/description are copied from the catalog by the application (§17A.4 catalog_verbatim);
    // matchStrength and score gate auto-selection, so a model-set value would make the signal
    // unfalsifiable (§17A.8).
    for (const [key, value] of [["title", { value: "x", source: "proposales_content" }], ["pricing", "library"], ["productId", "500101"]] as const) {
      const output = clone(agentPropositionOutput());
      output.blocks[0][key] = value;
      expect(firstIssue(schema.safeParse(output)).code).toBe("unrecognized_keys");
    }

    const strength = clone(agentPropositionOutput());
    strength.blocks[0].alternatives[0].matchStrength = "strong";
    expect(firstIssue(schema.safeParse(strength)).code).toBe("unrecognized_keys");

    const score = clone(agentPropositionOutput());
    score.blocks[0].alternatives[0].score = 1000;
    expect(firstIssue(schema.safeParse(score)).code).toBe("unrecognized_keys");
  });

  it("S2(d) refuses a content reference with no variation id", async () => {
    const { agentOutput } = await modules();
    const output = clone(agentPropositionOutput());
    delete output.blocks[0].contentId.ref;
    const issue = firstIssue(agentOutput.agentOutputSchemaFor(PREPARE).safeParse(output));
    expect(issue.path.map(String)).toEqual(["blocks", "0", "contentId", "ref"]);
  });

  it("S2(e) refuses an inferred consequential leaf", async () => {
    const { agentOutput } = await modules();
    const output = clone(agentPropositionOutput());
    output.blocks[0].quantity = { known: true, value: 2, source: "inferred" };
    expect(agentOutput.agentOutputSchemaFor(PREPARE).safeParse(output).success).toBe(false);

    const recipient = clone(agentPropositionOutput());
    recipient.recipient.value.email = { known: true, value: "a@b.example", source: "inferred" };
    expect(agentOutput.agentOutputSchemaFor(PREPARE).safeParse(recipient).success).toBe(false);
  });

  it("S2(f) refuses the warning kinds the application owns and accepts the rest", async () => {
    const { agentOutput, proposition } = await modules();
    const schema = agentOutput.agentOutputSchemaFor(PREPARE);

    for (const kind of agentOutput.APPLICATION_OWNED_WARNING_KINDS) {
      const output = clone(agentPropositionOutput());
      output.warnings = [{ kind, text: { value: "x", source: "inferred" } }];
      expect({ kind, ok: schema.safeParse(output).success }).toEqual({ kind, ok: false });
    }

    for (const kind of agentOutput.AGENT_WARNING_KINDS) {
      const output = clone(agentPropositionOutput());
      output.warnings = [{ kind, text: { value: "x", source: "inferred" } }];
      expect({ kind, ok: schema.safeParse(output).success }).toEqual({ kind, ok: true });
    }

    // The two sets partition the proposition's own enum, so adding a kind without deciding who
    // owns it fails here rather than silently becoming the model's.
    const all = proposition.warningSchema.shape.kind.options;
    expect([...agentOutput.AGENT_WARNING_KINDS, ...agentOutput.APPLICATION_OWNED_WARNING_KINDS].sort()).toEqual([...all].sort());
    expect(agentOutput.AGENT_WARNING_KINDS.filter((kind) => (agentOutput.APPLICATION_OWNED_WARNING_KINDS as readonly string[]).includes(kind))).toEqual([]);
    expect(agentOutput.AGENT_WARNING_KINDS.length).toBeGreaterThan(0);
  });

  it("S2(g) admits a clarification only when the turn allows one", async () => {
    const { agentOutput } = await modules();
    expect(agentOutput.agentOutputSchemaFor(PREPARE).safeParse(agentClarificationOutput()).success).toBe(true);
    expect(agentOutput.agentOutputSchemaFor({ mode: "prepare", allowClarification: false })
      .safeParse(agentClarificationOutput()).success).toBe(false);
    expect(agentOutput.agentOutputSchemaFor(REVISE).safeParse(agentClarificationOutput()).success).toBe(false);
  });

  it("S2(h) bounds the clarification question list and its text", async () => {
    const { agentOutput, clarification } = await modules();
    const schema = agentOutput.agentOutputSchemaFor(PREPARE);
    const question = { itemKey: "recipient_identity", text: "Who receives this?" };

    const atCap = { kind: "clarification", questions: Array.from({ length: clarification.MAX_CLARIFICATION_QUESTIONS }, () => question) };
    expect(schema.safeParse(atCap).success).toBe(true);

    const overCap = { kind: "clarification", questions: Array.from({ length: clarification.MAX_CLARIFICATION_QUESTIONS + 1 }, () => question) };
    expect(firstIssue(schema.safeParse(overCap)).code).toBe("too_big");

    expect(schema.safeParse({ kind: "clarification", questions: [] }).success).toBe(false);
    expect(schema.safeParse({ kind: "clarification", questions: [{ itemKey: "not_an_item", text: "x" }] }).success).toBe(false);
  });

  it("S2(i) allows requested overrides only on a revision", async () => {
    const { agentOutput } = await modules();
    const override = { requestedOverrides: [{ path: ["title"], reason: "The human asked for a new title." }] };

    expect(agentOutput.agentOutputSchemaFor(REVISE).safeParse(agentPropositionOutput(override)).success).toBe(true);

    const issue = firstIssue(agentOutput.agentOutputSchemaFor(PREPARE).safeParse(agentPropositionOutput(override)));
    expect({ code: issue.code, path: issue.path.map(String) }).toEqual({ code: "too_big", path: ["requestedOverrides"] });
  });

  it("Z1 converts to a JSON Schema the provider can be given, in every mode", async () => {
    const { agentOutput } = await modules();
    for (const mode of ["prepare", "revise"] as const) {
      for (const allowClarification of [true, false]) {
        const json = z.toJSONSchema(agentOutput.agentOutputSchemaFor({ mode, allowClarification }), { io: "input" });
        expect(typeof json).toBe("object");
        expect(JSON.stringify(json)).toContain("contentId");
      }
    }
    expect(typeof z.toJSONSchema(agentOutput.languageDerivationOutputSchema, { io: "input" })).toBe("object");
  });

  it("Z1(b) derives a language or reports that it could not", async () => {
    const { agentOutput } = await modules();
    expect(agentOutput.languageDerivationOutputSchema.parse({ language: "en" })).toEqual({ language: "en" });
    expect(agentOutput.languageDerivationOutputSchema.parse({ language: null })).toEqual({ language: null });
    expect(agentOutput.languageDerivationOutputSchema.safeParse({ language: "eng" }).success).toBe(false);
    expect(agentOutput.languageDerivationOutputSchema.safeParse({}).success).toBe(false);
  });
});
