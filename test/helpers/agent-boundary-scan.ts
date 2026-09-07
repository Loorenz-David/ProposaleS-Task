import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function sourceFiles(relativeDirectory: string): string[] {
  const absoluteDirectory = resolve(process.cwd(), relativeDirectory);
  return readdirSync(absoluteDirectory)
    .filter((fileName) => fileName.endsWith(".ts") && !fileName.endsWith(".test.ts"))
    .map((fileName) => `${relativeDirectory}/${fileName}`)
    .sort();
}

export function getAgentScanFiles(): string[] {
  return [
    ...sourceFiles("src/lib/agent"),
    ...sourceFiles("src/features/proposal-preparation/server/tools"),
  ];
}

export const AGENT_SCAN_FILES = getAgentScanFiles();

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
