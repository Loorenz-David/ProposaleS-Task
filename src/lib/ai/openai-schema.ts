import "server-only";

import type { AiProvider, JsonSchema } from "@/lib/ai/types";

/**
 * OpenAI's Responses API accepts a dialect of JSON Schema, not all of it, and rejects the whole
 * request with `400 invalid_json_schema` rather than ignoring what it does not support. Two
 * restrictions were observed against `gpt-5.6-luna` with the agent output schema:
 *
 * 1. `propertyNames` is not permitted. It appears wherever a recursive record is described — for
 *    the agent output, in a bare warning value. Dropping it loses nothing: JSON object keys are
 *    strings by definition, so `propertyNames: { type: "string" }` constrains nothing.
 * 2. The root schema must declare `type: "object"`. A discriminated union serializes to a bare
 *    `oneOf` with no root `type`, which is valid JSON Schema and is what OpenAI calls
 *    `type: "None"`.
 *
 * Adapting here rather than reshaping the schemas is deliberate. The alternative is rewriting
 * `refSchema`, `sourcedOrAbsent` and `warningSchema` — shapes the proposition schema, the naming
 * registry and the whole suite are built on — to make the internal contract worse for one vendor's
 * dialect. This module is the provider boundary; absorbing a vendor's shape is its job.
 *
 * Nothing here relaxes a boundary the application relies on. The schema tells the model what to
 * produce; what makes output authoritative is the Zod parse in `run()` and `validateAgentOutput`.
 */

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

/** The branches of a union node, or an empty list when the node is not a union. */
function branches(schema: Record<string, unknown>): unknown[] {
  for (const keyword of ["oneOf", "anyOf", "allOf"]) {
    const value = schema[keyword];
    if (Array.isArray(value)) return value;
  }
  return [];
}

/**
 * Adapts an output schema to what OpenAI accepts. The root gains `type: "object"` only when every
 * branch of the union is itself an object, so a union that is genuinely not an object is left
 * alone to fail loudly rather than being mislabelled.
 */
export function toOpenAiOutputSchema(schema: JsonSchema): JsonSchema {
  const adapted = withoutPropertyNames(schema) as Record<string, unknown>;

  if (adapted.type === undefined) {
    const members = branches(adapted);
    const everyBranchIsAnObject = members.length > 0
      && members.every((member) => isNode(member) && member.type === "object");
    if (everyBranchIsAnObject) adapted.type = "object";
  }

  return adapted as JsonSchema;
}

/**
 * The output schema to send for a provider. Anthropic receives the schema unchanged; only OpenAI's
 * dialect needs absorbing, and keeping that decision here rather than inline in the client keeps it
 * testable.
 */
export function outputSchemaForProvider(provider: AiProvider, schema: JsonSchema): JsonSchema {
  return provider === "openai" ? toOpenAiOutputSchema(schema) : schema;
}
