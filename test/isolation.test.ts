import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { scanIsolation, type IsolationRule } from "./isolation-scan";

function planted(path: string, source: string, expectedRule: IsolationRule) {
  const root = mkdtempSync(join(tmpdir(), "proposales-isolation-"));
  try {
    const absolute = join(root, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, source);
    expect(scanIsolation(root)).toEqual([{ rule: expectedRule, path }]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("repository isolation", () => {
  it("I1 keeps the actual source tree inside all three boundaries", () => {
    expect(scanIsolation(process.cwd())).toEqual([]);
  });

  it("I1 catches a vendor AI SDK import outside lib/ai", () => {
    planted("src/features/probe/server/agent.ts", 'import "server-only";\nimport { generateText } from "ai";\n', "vendor-ai-boundary");
  });

  it("I1 catches fetch outside the two integration boundaries", () => {
    planted("src/features/probe/server/request.ts", 'import "server-only";\nexport const request = () => fetch("/unsafe");\n', "fetch-boundary");
  });

  it("I1 catches a server module without server-only as its first statement", () => {
    planted("src/features/probe/server/service.ts", "export const unsafe = true;\n", "server-only-first");
  });

  it('I1 catches a "use server" file that omits the server-only import', () => {
    planted(
      "src/features/probe/server/actions.ts",
      '"use server";\n\nexport async function act() {}\n',
      "server-only-first",
    );
  });

  it('I1 admits "use server" before the server-only import', () => {
    const root = mkdtempSync(join(tmpdir(), "proposales-isolation-"));
    try {
      const path = "src/features/probe/server/actions.ts";
      const absolute = join(root, path);
      mkdirSync(dirname(absolute), { recursive: true });
      writeFileSync(absolute, '"use server";\n\nimport "server-only";\n\nexport async function act() {}\n');
      expect(scanIsolation(root)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
