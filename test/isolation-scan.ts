import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export type IsolationRule = "vendor-ai-boundary" | "fetch-boundary" | "server-only-first";
export type IsolationViolation = { rule: IsolationRule; path: string };

const VENDOR_AI_IMPORT = /(?:\bfrom\s+|\bimport\s*(?:\(\s*)?)["'](?:ai|@ai-sdk\/[^"']+)["']/;
const FETCH_CALL = /\bfetch\s*\(/;
const PROLOGUE = String.raw`(?:\uFEFF|\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*`;
/**
 * `import "server-only";` must be the first *import*, but Next requires `"use server";` to be the
 * first *statement* of an actions file, so one directive may precede it. Nothing else may: a
 * server module that opens with `"use server";` and no `server-only` import is still a violation.
 */
const SERVER_ONLY_FIRST = new RegExp(
  `^${PROLOGUE}(?:["']use server["'];${PROLOGUE})?import\\s+["']server-only["'];`,
);

function sourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) files.push(path);
  }
  return files;
}

function normalized(root: string, path: string): string {
  return relative(root, path).split(sep).join("/");
}

function isProduction(path: string): boolean {
  return !path.endsWith(".test.ts") && !path.endsWith(".live.test.ts");
}

function requiresServerOnly(path: string): boolean {
  return ["src/lib/env/", "src/lib/proposales/", "src/lib/ai/", "src/lib/agent/"].some((prefix) => path.startsWith(prefix))
    || /^src\/features\/[^/]+\/server\//.test(path);
}

export function scanIsolation(root: string): IsolationViolation[] {
  const src = resolve(root, "src");
  const violations: IsolationViolation[] = [];
  for (const absolutePath of sourceFiles(src)) {
    const path = normalized(root, absolutePath);
    if (!isProduction(path)) continue;
    const source = readFileSync(absolutePath, "utf8");

    if (!path.startsWith("src/lib/ai/") && VENDOR_AI_IMPORT.test(source)) {
      violations.push({ rule: "vendor-ai-boundary", path });
    }
    if (path !== "src/lib/proposales/http.ts" && !path.startsWith("src/lib/ai/") && FETCH_CALL.test(source)) {
      violations.push({ rule: "fetch-boundary", path });
    }
    if (requiresServerOnly(path) && !SERVER_ONLY_FIRST.test(source)) {
      violations.push({ rule: "server-only-first", path });
    }
  }
  return violations.sort((left, right) => left.rule.localeCompare(right.rule) || left.path.localeCompare(right.path));
}
