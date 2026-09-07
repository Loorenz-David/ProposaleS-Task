import { describe, expect, it } from "vitest";

import { outputSchemaForProvider, toOpenAiOutputSchema } from "@/lib/ai/openai-schema";

type AnyRecord = Record<string, any>;

/** Every path at which the keyword appears, so an absence claim can be checked against a presence one. */
function pathsWithKeyword(node: unknown, keyword: string, path = "", found: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((entry, index) => pathsWithKeyword(entry, keyword, `${path}/${index}`, found));
    return found;
  }
  if (node === null || typeof node !== "object") return found;
  for (const [key, nested] of Object.entries(node as AnyRecord)) {
    if (key === keyword) found.push(`${path}/${key}`);
    pathsWithKeyword(nested, keyword, `${path}/${key}`, found);
  }
  return found;
}

describe("OpenAI output schema adaptation", () => {
  it("C7(a) drops propertyNames at every depth, including inside $defs", () => {
    const schema = {
      type: "object",
      properties: { direct: { type: "object", propertyNames: { type: "string" }, additionalProperties: { type: "string" } } },
      $defs: {
        recursive: {
          anyOf: [
            { type: "string" },
            { type: "array", items: { $ref: "#/$defs/recursive" } },
            { type: "object", propertyNames: { type: "string" }, additionalProperties: { $ref: "#/$defs/recursive" } },
          ],
        },
      },
    };

    // The input really does carry the keyword in two places, so the absence below is a removal.
    expect(pathsWithKeyword(schema, "propertyNames")).toHaveLength(2);

    const adapted = toOpenAiOutputSchema(schema) as AnyRecord;

    expect(pathsWithKeyword(adapted, "propertyNames")).toEqual([]);
    // Everything else survives: the record still says what its values are.
    expect(adapted.properties.direct.additionalProperties).toEqual({ type: "string" });
    expect(adapted.$defs.recursive.anyOf[2].additionalProperties).toEqual({ $ref: "#/$defs/recursive" });
    expect(adapted.$defs.recursive.anyOf[1]).toEqual({ type: "array", items: { $ref: "#/$defs/recursive" } });
  });

  it("C7(b) does not mutate the schema it was given", () => {
    const schema = { oneOf: [{ type: "object", propertyNames: { type: "string" } }] };
    const before = structuredClone(schema);

    toOpenAiOutputSchema(schema);

    expect(schema).toEqual(before);
  });

  it("C7(c) declares a root type when every branch of the union is an object", () => {
    const adapted = toOpenAiOutputSchema({
      oneOf: [{ type: "object", properties: {} }, { type: "object", properties: {} }],
    }) as AnyRecord;

    expect(adapted.type).toBe("object");
    expect(adapted.oneOf).toHaveLength(2);
  });

  it("C7(d) leaves a root alone when it already has a type or is not all objects", () => {
    // Already typed: nothing to decide.
    expect((toOpenAiOutputSchema({ type: "object", properties: {} }) as AnyRecord).type).toBe("object");

    // A union with a non-object branch is not an object, and mislabelling it would send the model
    // a schema that contradicts itself. It stays untyped and fails loudly at the provider instead.
    expect((toOpenAiOutputSchema({ oneOf: [{ type: "object" }, { type: "string" }] }) as AnyRecord).type).toBeUndefined();

    // Not a union at all.
    expect((toOpenAiOutputSchema({ $ref: "#/$defs/x" }) as AnyRecord).type).toBeUndefined();
  });

  it("C7(e) makes the real agent output schema satisfy both rules OpenAI enforced", async () => {
    // The two 400 invalid_json_schema responses this module exists for came from this schema, so
    // it is the one worth asserting on rather than a hand-built stand-in.
    const { z } = await import("zod");
    const { agentOutputSchemaFor } = await import("@/features/proposal-preparation/schemas/agent-output");

    for (const mode of ["prepare", "revise"] as const) {
      const raw = z.toJSONSchema(agentOutputSchemaFor({ mode, allowClarification: true }), { io: "input" }) as AnyRecord;

      // Both defects are present before adaptation; without this the assertions below prove nothing.
      expect({ mode, hits: pathsWithKeyword(raw, "propertyNames").length > 0 }).toEqual({ mode, hits: true });
      expect({ mode, rootType: raw.type }).toEqual({ mode, rootType: undefined });

      const adapted = toOpenAiOutputSchema(raw) as AnyRecord;

      expect({ mode, hits: pathsWithKeyword(adapted, "propertyNames") }).toEqual({ mode, hits: [] });
      expect({ mode, rootType: adapted.type }).toEqual({ mode, rootType: "object" });
      // The union itself is untouched: the model still chooses a proposition or a clarification.
      expect(adapted.oneOf).toHaveLength(2);
    }
  });

  it("C7(f) adapts for OpenAI and leaves Anthropic's schema identical", () => {
    const schema = { oneOf: [{ type: "object", propertyNames: { type: "string" } }, { type: "object" }] };

    // Anthropic gets the object it was given, not a copy with keywords removed.
    expect(outputSchemaForProvider("anthropic", schema)).toBe(schema);

    const openai = outputSchemaForProvider("openai", schema) as AnyRecord;
    expect(openai).not.toBe(schema);
    expect(openai.type).toBe("object");
    expect(pathsWithKeyword(openai, "propertyNames")).toEqual([]);
  });
});
