import "server-only";

import { propositionSchema, type Proposition, type Warning } from "../../schemas/proposition";

export type RevisionOverride = { path: string[]; reason: string };

const WHOLESALE_FIELDS = new Set([
  "generationId",
  "version",
  "preparedAt",
  "warnings",
  "assumptions",
  "unresolvedItems",
  "agentRationale",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSourced(value: unknown): value is Record<string, unknown> & { source: string } {
  return isRecord(value) && typeof value.source === "string";
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function pathKey(path: readonly string[]): string {
  return JSON.stringify(path);
}

function hasHumanLeaf(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasHumanLeaf);
  if (!isRecord(value)) return false;
  if (isSourced(value)) return value.source === "human";
  return Object.values(value).some(hasHumanLeaf);
}

function warningValue(value: unknown): unknown {
  if (isSourced(value)) return value.value;
  if (isRecord(value) && value.known === false) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) return value;
  return undefined;
}

function warning(kind: "human_value_kept" | "human_value_overridden", path: string[], reason?: string, before?: unknown, after?: unknown): Warning {
  return {
    kind,
    text: {
      value: kind === "human_value_kept"
        ? `Kept the human value at ${path.join(".")}.`
        : `Replaced the human value at ${path.join(".")} by explicit request.`,
      source: "inferred",
    },
    path,
    ...(before === undefined ? {} : { before }),
    ...(after === undefined ? {} : { after }),
    ...(reason === undefined ? {} : { reason }),
  };
}

export function mergeRevision(
  current: Proposition,
  proposed: Proposition,
  overrides: ReadonlyArray<RevisionOverride>,
): { merged: Proposition; warnings: Warning[] } {
  const overrideByPath = new Map(overrides.map((entry) => [pathKey(entry.path), entry]));
  const matchedOverrides = new Set<string>();
  const warnings: Warning[] = [];

  const mergeValue = (before: unknown, after: unknown, path: string[]): unknown => {
    if (isSourced(before) && before.source === "human") {
      const key = pathKey(path);
      const requested = overrideByPath.get(key);
      if (requested !== undefined) matchedOverrides.add(key);

      const proposedValue = isSourced(after) ? after.value : after;
      if (sameValue(before.value, proposedValue)) return structuredClone(before);
      if (requested !== undefined) {
        warnings.push(warning(
          "human_value_overridden",
          path,
          requested.reason,
          warningValue(before),
          warningValue(after),
        ));
        return structuredClone(after);
      }
      warnings.push(warning("human_value_kept", path));
      return structuredClone(before);
    }

    if (Array.isArray(before) && Array.isArray(after)) {
      const merged: unknown[] = [];
      const length = Math.max(before.length, after.length);
      for (let index = 0; index < length; index += 1) {
        const itemPath = [...path, String(index)];
        if (index >= before.length) {
          merged.push(structuredClone(after[index]));
          continue;
        }
        if (index >= after.length) {
          const overrideNamesDroppedItem = overrides.some((entry) => entry.path.length >= itemPath.length
            && itemPath.every((segment, pathIndex) => entry.path[pathIndex] === segment));
          if (hasHumanLeaf(before[index]) && !overrideNamesDroppedItem) {
            merged.push(structuredClone(before[index]));
            warnings.push(warning("human_value_kept", itemPath));
          }
          continue;
        }
        merged.push(mergeValue(before[index], after[index], itemPath));
      }
      return merged;
    }

    if (isRecord(before) && isRecord(after) && !isSourced(after)) {
      const merged: Record<string, unknown> = {};
      for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
        if (!(key in after)) continue;
        merged[key] = key in before
          ? mergeValue(before[key], after[key], [...path, key])
          : structuredClone(after[key]);
      }
      return merged;
    }

    return structuredClone(after);
  };

  const currentRecord = structuredClone(current);
  const proposedRecord = structuredClone(proposed);
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(proposedRecord)) {
    result[key] = WHOLESALE_FIELDS.has(key)
      ? proposedRecord[key as keyof Proposition]
      : mergeValue(currentRecord[key as keyof Proposition], proposedRecord[key as keyof Proposition], [key]);
  }

  for (const entry of overrides) {
    if (matchedOverrides.has(pathKey(entry.path))) continue;
    warnings.push({
      kind: "other",
      text: { value: `Ignored an override because ${entry.path.join(".")} does not name a human value.`, source: "inferred" },
      path: entry.path,
      reason: entry.reason,
    });
  }

  const merged = propositionSchema.parse({
    ...result,
    warnings: [...proposed.warnings, ...warnings],
  });
  return { merged, warnings };
}
