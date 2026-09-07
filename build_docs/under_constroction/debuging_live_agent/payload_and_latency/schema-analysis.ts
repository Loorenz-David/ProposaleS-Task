import { performance } from "node:perf_hooks";

import { z } from "zod";

import { agentPropositionOutput } from "../../../../src/features/proposal-preparation/fixtures/scripts";
import {
  agentOutputSchemaFor,
  languageDerivationOutputSchema,
} from "../../../../src/features/proposal-preparation/schemas/agent-output";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function serializedChars(value: unknown): number {
  return JSON.stringify(value).length;
}

function serializedBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

// Mirrors src/lib/ai/openai-schema.ts so this standalone script does not import its server-only
// guard. Keep this diagnostic in sync if the production adapter changes.
function openAiAdaptedSchema(schema: JsonObject): { schema: JsonObject; wrapped: boolean } {
  const clean = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(clean);
    if (!isObject(value)) return value;
    return Object.fromEntries(
      Object.entries(value).filter(([key]) => key !== "propertyNames").map(([key, nested]) => [key, clean(nested)]),
    );
  };
  const cleaned = clean(schema) as JsonObject;
  const rootKeywords = ["oneOf", "anyOf", "allOf", "enum", "const", "not"];
  if (cleaned.type === "object" && !rootKeywords.some((key) => cleaned[key] !== undefined)) {
    return { schema: cleaned, wrapped: false };
  }

  const documentKeywords: JsonObject = {};
  const inner: JsonObject = {};
  for (const [key, value] of Object.entries(cleaned)) {
    if (key === "$defs" || key === "$schema" || key === "definitions") documentKeywords[key] = value;
    else inner[key] = value;
  }
  return {
    schema: {
      ...documentKeywords,
      type: "object",
      properties: { result: inner },
      required: ["result"],
      additionalProperties: false,
    },
    wrapped: true,
  };
}

function keywordCount(root: unknown, keyword: string): number {
  let count = 0;
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!isObject(value)) return;
    if (keyword in value) count += 1;
    Object.values(value).forEach(visit);
  };
  visit(root);
  return count;
}

function optionalObjectFields(root: unknown): Array<{ path: string; missing: string[] }> {
  const violations: Array<{ path: string; missing: string[] }> = [];
  const visit = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!isObject(value)) return;

    if (value.type === "object" && isObject(value.properties)) {
      const required = new Set(Array.isArray(value.required) ? value.required : []);
      const missing = Object.keys(value.properties).filter((key) => !required.has(key));
      if (missing.length > 0) violations.push({ path, missing });
    }

    for (const [key, nested] of Object.entries(value)) visit(nested, `${path}.${key}`);
  };
  visit(root, "$root");
  return violations;
}

function schemaShapeCounts(root: unknown) {
  const declaredNames: Record<string, number> = {};
  let objectSchemas = 0;
  let propertyDeclarations = 0;
  let requiredEntries = 0;
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!isObject(value)) return;
    if (value.type === "object") objectSchemas += 1;
    if (isObject(value.properties)) {
      for (const name of Object.keys(value.properties)) {
        declaredNames[name] = (declaredNames[name] ?? 0) + 1;
        propertyDeclarations += 1;
      }
    }
    if (Array.isArray(value.required)) requiredEntries += value.required.length;
    Object.values(value).forEach(visit);
  };
  visit(root);
  return {
    objectSchemas,
    propertyDeclarations,
    requiredEntries,
    selectedRepeatedPropertyDeclarations: Object.fromEntries(
      ["known", "value", "source", "ref", "variationId", "questionId", "editTurn", "turnId", "quote"]
        .map((name) => [name, declaredNames[name] ?? 0]),
    ),
  };
}

function topLevelBranchSizes(schema: unknown): Record<string, number> {
  if (!isObject(schema) || !Array.isArray(schema.oneOf) || !isObject(schema.oneOf[0])) return {};
  const proposition = schema.oneOf[0];
  if (!isObject(proposition.properties)) return {};
  return Object.fromEntries(
    Object.entries(proposition.properties).map(([key, value]) => [key, serializedChars(value)]),
  );
}

function benchmark(label: string, iterations: number, action: () => void): { label: string; iterations: number; meanMs: number } {
  for (let index = 0; index < 20; index += 1) action();
  const start = performance.now();
  for (let index = 0; index < iterations; index += 1) action();
  return { label, iterations, meanMs: (performance.now() - start) / iterations };
}

function describe(allowClarification: boolean, reused: "inline" | "ref") {
  const zodSchema = agentOutputSchemaFor({ mode: "prepare", allowClarification });
  const jsonSchema = z.toJSONSchema(zodSchema, { io: "input", reused });
  const adapter = openAiAdaptedSchema(jsonSchema);
  const branches = isObject(jsonSchema) && Array.isArray(jsonSchema.oneOf) ? jsonSchema.oneOf : [];
  const optional = optionalObjectFields(adapter.schema);

  return {
    allowClarification,
    reused,
    rawChars: serializedChars(jsonSchema),
    rawBytes: serializedBytes(jsonSchema),
    openAiAdaptedChars: serializedChars(adapter.schema),
    openAiAdaptedBytes: serializedBytes(adapter.schema),
    wrappedForOpenAi: adapter.wrapped,
    rootBranches: branches.length,
    branchChars: branches.map(serializedChars),
    definitions: isObject(jsonSchema) && isObject(jsonSchema.$defs) ? Object.keys(jsonSchema.$defs).length : 0,
    refs: keywordCount(jsonSchema, "$ref"),
    propertyNames: keywordCount(jsonSchema, "propertyNames"),
    oneOfNodes: keywordCount(jsonSchema, "oneOf"),
    anyOfNodes: keywordCount(jsonSchema, "anyOf"),
    shapeCounts: schemaShapeCounts(jsonSchema),
    openAiStrictOptionalObjectCount: optional.length,
    openAiStrictOptionalFieldCount: optional.reduce((sum, item) => sum + item.missing.length, 0),
    openAiStrictOptionalExamples: optional.slice(0, 12),
    topLevelPropositionPropertyChars: topLevelBranchSizes(jsonSchema),
  };
}

const prepareTrue = agentOutputSchemaFor({ mode: "prepare", allowClarification: true });
const prepareFalse = agentOutputSchemaFor({ mode: "prepare", allowClarification: false });
const validProposition = agentPropositionOutput();

const summary = {
  generatedAt: new Date().toISOString(),
  note: "Character counts use compact JSON.stringify output. Timing is a local diagnostic, not a provider benchmark.",
  schemas: {
    prepareAllowClarification: describe(true, "inline"),
    prepareNoClarification: describe(false, "inline"),
    experimentalSharedDefinitionsAllowClarification: describe(true, "ref"),
    experimentalSharedDefinitionsNoClarification: describe(false, "ref"),
    languageDerivation: {
      rawChars: serializedChars(z.toJSONSchema(languageDerivationOutputSchema, { io: "input" })),
      rawBytes: serializedBytes(z.toJSONSchema(languageDerivationOutputSchema, { io: "input" })),
    },
  },
  localTiming: {
    serializeAllowClarification: benchmark("z.toJSONSchema allowClarification=true", 250, () => {
      z.toJSONSchema(prepareTrue, { io: "input" });
    }),
    serializeNoClarification: benchmark("z.toJSONSchema allowClarification=false", 250, () => {
      z.toJSONSchema(prepareFalse, { io: "input" });
    }),
    validateValidProposition: benchmark("safeParse valid agent proposition", 2_000, () => {
      prepareFalse.safeParse(validProposition);
    }),
  },
};

console.log(JSON.stringify(summary, null, 2));
