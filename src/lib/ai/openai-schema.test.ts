import { describe, expect, it } from "vitest";

import { OPENAI_OUTPUT_WRAPPER_KEY, outputAdapterFor, toOpenAiOutputAdapter } from "@/lib/ai/openai-schema";

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

/** The rules OpenAI enforced, as observed in its three 400 responses. */
function openAiRootViolations(schema: AnyRecord): string[] {
  const violations: string[] = [];
  if (schema.type !== "object") violations.push(`root type is ${JSON.stringify(schema.type)}, not "object"`);
  for (const keyword of ["oneOf", "anyOf", "allOf", "enum", "const", "not"]) {
    if (schema[keyword] !== undefined) violations.push(`root carries ${keyword}`);
  }
  for (const path of pathsWithKeyword(schema, "propertyNames")) violations.push(`propertyNames at ${path}`);
  return violations;
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

    const adapted = toOpenAiOutputAdapter(schema).schema as AnyRecord;

    expect(pathsWithKeyword(adapted, "propertyNames")).toEqual([]);
    // Everything else survives: the record still says what its values are.
    expect(adapted.properties.direct.additionalProperties).toEqual({ type: "string" });
    expect(adapted.$defs.recursive.anyOf[2].additionalProperties).toEqual({ $ref: "#/$defs/recursive" });
  });

  it("C7(b) leaves an already-acceptable root alone and does not wrap it", () => {
    // The language-derivation schema is shaped like this, and it is the one output schema that
    // succeeded against OpenAI on every live run.
    const schema = { type: "object", properties: { language: { type: "string" } }, required: ["language"] };
    const adapter = toOpenAiOutputAdapter(schema);

    expect(adapter.wrapped).toBe(false);
    expect(adapter.schema).toEqual(schema);
    expect(adapter.unwrap({ language: "en" })).toEqual({ language: "en" });
  });

  it("C7(c) nests a top-level union under one property, keeping $defs resolvable", () => {
    const schema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      oneOf: [{ type: "object", properties: { kind: { const: "a" } } }, { $ref: "#/$defs/b" }],
      $defs: { b: { type: "object", properties: { kind: { const: "b" } } } },
    };

    const adapter = toOpenAiOutputAdapter(schema);
    const adapted = adapter.schema as AnyRecord;

    expect(adapter.wrapped).toBe(true);
    expect(openAiRootViolations(adapted)).toEqual([]);
    expect(adapted.required).toEqual([OPENAI_OUTPUT_WRAPPER_KEY]);
    // The union moved down intact.
    expect(adapted.properties[OPENAI_OUTPUT_WRAPPER_KEY].oneOf).toHaveLength(2);
    // `$defs` stayed at the document root, so `#/$defs/b` still resolves. Moving it under the
    // wrapper would leave every internal reference dangling.
    expect(adapted.$defs.b).toEqual(schema.$defs.b);
    expect(adapted.$schema).toBe(schema.$schema);
    expect(adapted.properties[OPENAI_OUTPUT_WRAPPER_KEY].$defs).toBeUndefined();
  });

  it("C7(d) unwraps the wrapper the model answered with, and passes anything else through", () => {
    const adapter = toOpenAiOutputAdapter({ oneOf: [{ type: "object" }] });

    expect(adapter.unwrap({ [OPENAI_OUTPUT_WRAPPER_KEY]: { kind: "proposition" } })).toEqual({ kind: "proposition" });
    // A step that produced no parseable object hands back raw text; `run()` fails it against the
    // real schema and retries, which is the existing path.
    expect(adapter.unwrap("not json at all")).toBe("not json at all");
    // An object without the wrapper is returned as-is rather than becoming undefined.
    expect(adapter.unwrap({ kind: "clarification" })).toEqual({ kind: "clarification" });
    expect(adapter.unwrap(null)).toBe(null);
  });

  it("C7(e) does not mutate the schema it was given", () => {
    const schema = { oneOf: [{ type: "object", propertyNames: { type: "string" } }] };
    const before = structuredClone(schema);

    toOpenAiOutputAdapter(schema);

    expect(schema).toEqual(before);
  });

  it("C7(f) leaves the whole adaptation off for Anthropic", () => {
    const schema = { oneOf: [{ type: "object", propertyNames: { type: "string" } }] };
    const adapter = outputAdapterFor("anthropic", schema);

    // The same object, not a cleaned copy: Anthropic accepted this schema all along.
    expect(adapter.schema).toBe(schema);
    expect(adapter.wrapped).toBe(false);
    expect(adapter.unwrap({ kind: "proposition" })).toEqual({ kind: "proposition" });
  });

  it("C7(g) makes the real agent output schema satisfy every rule OpenAI enforced", async () => {
    // The three 400 invalid_json_schema responses this module exists for came from this schema, so
    // it is the one worth asserting on rather than a hand-built stand-in.
    const { z } = await import("zod");
    const { agentOutputSchemaFor } = await import("@/features/proposal-preparation/schemas/agent-output");

    for (const mode of ["prepare", "revise"] as const) {
      const schema = agentOutputSchemaFor({ mode, allowClarification: true });
      const raw = z.toJSONSchema(schema, { io: "input" }) as AnyRecord;

      // Every defect is present before adaptation; without this the assertion after it proves nothing.
      expect({ mode, violations: openAiRootViolations(raw).length > 0 }).toEqual({ mode, violations: true });

      const adapter = outputAdapterFor("openai", raw);
      expect({ mode, violations: openAiRootViolations(adapter.schema as AnyRecord) }).toEqual({ mode, violations: [] });
      expect({ mode, wrapped: adapter.wrapped }).toEqual({ mode, wrapped: true });

      // The round trip returns something the caller's own schema accepts: what run() parses is the
      // union member, never the vendor's envelope.
      const clarification = { kind: "clarification", questions: [{ itemKey: "recipient_identity", text: "Who receives this?" }] };
      const unwrapped = adapter.unwrap({ [OPENAI_OUTPUT_WRAPPER_KEY]: clarification });
      expect({ mode, parsed: schema.safeParse(unwrapped).success }).toEqual({ mode, parsed: true });
    }
  });
});
