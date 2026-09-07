import "server-only";

import type { AiProvider, JsonSchema } from "@/lib/ai/types";

/**
 * OpenAI's Responses API accepts a dialect of JSON Schema, not all of it, and rejects the whole
 * request with `400 invalid_json_schema` rather than ignoring what it does not support. It reports
 * one restriction per request, so the three below were found one live run at a time against
 * `gpt-5.6-luna`:
 *
 * 1. `propertyNames` is not permitted. It appears wherever a recursive record is described — for
 *    the agent output, in a bare warning value. Dropping it loses nothing: JSON object keys are
 *    strings by definition, so `propertyNames: { type: "string" }` constrains nothing.
 * 2. The root must be `type: "object"`.
 * 3. The root must not carry `oneOf`, `anyOf`, `allOf`, `enum`, `const` or `not`. Together with 2
 *    this means **a top-level union cannot be expressed at all**, which the agent output is: the
 *    model answers with either a proposition or a clarification. Nested unions are fine — the
 *    schema is full of them and none was ever rejected — so the fix is to move the union one level
 *    down, under a single wrapper property, and unwrap the model's answer on the way back.
 *
 * The wrapper is invisible outside this boundary. `run()` still receives the union member it
 * expects and still parses it with the Zod output schema, which is what makes the output
 * authoritative; the wrapper only changes the envelope the vendor requires.
 *
 * Adapting here rather than reshaping the schemas is deliberate. The alternative is collapsing the
 * agent output union into one object with everything optional — a schema that could no longer say
 * "a clarification has questions and nothing else" — to suit one vendor's dialect.
 */

/** The single property the root union is nested under when a wrap is required. */
export const OPENAI_OUTPUT_WRAPPER_KEY = "result";

const TOP_LEVEL_COMBINATORS = ["oneOf", "anyOf", "allOf", "enum", "const", "not"] as const;

/** `true` when the node is a plain JSON object node we can walk into. */
function isNode(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Recursively drops every `propertyNames` keyword. Returns a new tree; the input is untouched. */
function withoutPropertyNames(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutPropertyNames);
  if (!isNode(value)) return value;

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (key === "propertyNames") continue;
    result[key] = withoutPropertyNames(nested);
  }
  return result;
}

/** `true` when the root is already the plain object schema OpenAI insists on. */
function isAcceptableRoot(schema: Record<string, unknown>): boolean {
  if (schema.type !== "object") return false;
  return !TOP_LEVEL_COMBINATORS.some((keyword) => schema[keyword] !== undefined);
}

/**
 * Nests everything but the document-level keywords under one property. `$defs` and `$schema` stay
 * at the root on purpose: internal `$ref`s point at `#/$defs/...`, and moving the definitions with
 * the rest of the schema would leave every one of them dangling.
 */
function wrapRoot(schema: Record<string, unknown>): Record<string, unknown> {
  const documentKeywords: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "$defs" || key === "$schema" || key === "definitions") documentKeywords[key] = value;
    else inner[key] = value;
  }

  return {
    ...documentKeywords,
    type: "object",
    properties: { [OPENAI_OUTPUT_WRAPPER_KEY]: inner },
    required: [OPENAI_OUTPUT_WRAPPER_KEY],
    additionalProperties: false,
  };
}

export type OutputAdapter = {
  /** The schema to send to the provider. */
  schema: JsonSchema;
  /** Whether the root had to be nested, and therefore whether the answer needs unwrapping. */
  wrapped: boolean;
  /** Returns the value the caller's own schema expects, given whatever the provider produced. */
  unwrap: (output: unknown) => unknown;
};

const identity: OutputAdapter["unwrap"] = (output) => output;

/** Adapts an output schema, and the answer to it, to what OpenAI accepts. */
export function toOpenAiOutputAdapter(schema: JsonSchema): OutputAdapter {
  const cleaned = withoutPropertyNames(schema) as Record<string, unknown>;

  if (isAcceptableRoot(cleaned)) {
    return { schema: cleaned as JsonSchema, wrapped: false, unwrap: identity };
  }

  return {
    schema: wrapRoot(cleaned) as JsonSchema,
    wrapped: true,
    unwrap: (output) => {
      // A step that produced no parseable object hands back the raw text instead; there is nothing
      // to unwrap, and `run()` will fail it against the real schema and retry.
      if (!isNode(output)) return output;
      if (!(OPENAI_OUTPUT_WRAPPER_KEY in output)) return output;
      return output[OPENAI_OUTPUT_WRAPPER_KEY];
    },
  };
}

/**
 * The adapter to use for a provider. Anthropic receives the schema unchanged and its answer
 * untouched; only OpenAI's dialect needs absorbing.
 */
export function outputAdapterFor(provider: AiProvider, schema: JsonSchema): OutputAdapter {
  if (provider !== "openai") return { schema, wrapped: false, unwrap: identity };
  return toOpenAiOutputAdapter(schema);
}
