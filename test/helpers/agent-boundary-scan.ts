import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const AGENT_SCAN_FILES = [
  "src/lib/agent/types.ts",
  "src/lib/agent/define-tool.ts",
  "src/lib/agent/run.ts",
  "src/features/proposal-preparation/server/tools/search-content.tool.ts",
  "src/features/proposal-preparation/server/tools/get-content.tool.ts",
] as const;

export const FORBIDDEN_FORMS = [
  { name: "fetch", pattern: /\bfetch\s*\(/, example: "fetch(\"/x\")" },
  { name: "node import", pattern: /["']node:/, example: "import \"node:fs\"" },
  { name: "Proposales value import", pattern: /^\s*import\s+(?!type\b)[^;\n]*["']@\/lib\/proposales["']/m, example: "import { x } from \"@/lib/proposales\"" },
  { name: "env value import", pattern: /^\s*import\s+(?!type\b)[^;\n]*["']@\/lib\/env(?:\/[^"']*)?["']/m, example: "import { x } from \"@/lib/env/server\"" },
  { name: "process", pattern: /\bprocess\b/, example: "process" },
  { name: "Date", pattern: /\bDate\s*[.(]/, example: "Date.now()" },
  { name: "Math.random", pattern: /\bMath\.random\s*\(/, example: "Math.random()" },
  { name: "dynamic import", pattern: /\bimport\s*\(/, example: "import(\"x\")" },
  { name: "vendor AI import", pattern: /(?:from\s+|import\s*)["'](?:@ai-sdk\/|ai["'])/, example: "import { x } from \"ai\"" },
  { name: "numeric query bound", pattern: /\bquery\b[^;\n]{0,80}\.max\(\s*\d/, example: "query.max(200)" },
] as const;

export function hasForbiddenForm(source: string): boolean {
  return FORBIDDEN_FORMS.some(({ pattern }) => pattern.test(source));
}

export function readAgentScanFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}
