import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The guards that keep the fixture era retired and the browser graph clean. Each one is a function
 * over source text, so each is proven twice: against the real tree, and against a planted source
 * that must trip it. A guard nothing can fail is decoration.
 */
const FEATURE_ROOT = resolve(__dirname);
const REPO_ROOT = resolve(__dirname, "../../..");

type SourceFile = { path: string; source: string };

/**
 * Test data is not production, even though it carries no `.test.` in its name: `fixtures/` modules
 * exist only for tests and import each other freely. What matters is that nothing shipping reaches
 * them, which is T-RET-2's subject.
 */
function isProduction(path: string) {
  if (/\/fixtures\//.test(path)) return false;
  return !/\.test\.tsx?$/.test(path) && !/\.live\.(test|spec)\.tsx?$/.test(path);
}

function collect(directory: string): SourceFile[] {
  const files: SourceFile[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collect(absolute));
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      files.push({
        path: relative(REPO_ROOT, absolute).split(sep).join("/"),
        source: readFileSync(absolute, "utf8"),
      });
    }
  }
  return files;
}

const featureFiles = collect(FEATURE_ROOT);
const productionFiles = featureFiles.filter((file) => isProduction(file.path));
const browserFiles = productionFiles.filter((file) =>
  /\/(components|hooks|client)\//.test(file.path),
);

/** Runs a guard over real files plus one planted file that must be the only thing it reports. */
function guard(
  files: SourceFile[],
  offends: (file: SourceFile) => boolean,
  planted: SourceFile,
) {
  expect(files.filter(offends).map((file) => file.path)).toEqual([]);
  expect(offends(planted), "the planted source must trip this guard").toBe(true);
}

const TEMPORARY_MARKERS = /Temporary[A-Z]|temporary-fixture|temporaryFixture|TEMPORARY_FIXTURE/;

const PERSISTENCE_APIS =
  /\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bIDBFactory\b|document\.cookie/;

const PRIVILEGED_IMPORTS =
  /from\s+["'](@\/lib\/(proposales|ai|agent)(\/[^"']*)?|@\/lib\/env\/server)["']/;

/** Any `server/` path except the actions module, which is the one client-reachable server file. */
const SERVER_IMPORT = /from\s+["'][^"']*\/server\/(?!actions["'])[^"']*["']/;

const FIXTURE_IMPORT = /from\s+["'][^"']*\/fixtures\/[^"']*["']/;

/** A shape a schema already owns must not be re-declared beside the UI (05 §8, 06 §1). */
const HAND_DECLARED_DOMAIN_TYPE =
  /\b(?:type|interface)\s+(Proposition|DomainResult|ProposalWorkflowState|ConversationContext|DraftResult)\b\s*[=<{]/;

describe("fixture-era retirement", () => {
  it("T-RET-1: no production file carries a fixture-era marker", () => {
    guard(
      productionFiles,
      (file) => TEMPORARY_MARKERS.test(file.source),
      { path: "planted.ts", source: "import { temporaryFixtureTurnAdapter } from './turns.temporary-fixture';" },
    );
  });

  it("T-RET-1b: the two retired modules do not exist", () => {
    const paths = featureFiles.map((file) => file.path);
    expect(paths).not.toContain("src/features/proposal-preparation/types/temporary-turn.ts");
    expect(paths).not.toContain(
      "src/features/proposal-preparation/client/fixtures/turns.temporary-fixture.ts",
    );
  });

  it("T-RET-2: no browser file imports a fixture or hand-declares a schema-owned shape", () => {
    guard(
      browserFiles,
      (file) => FIXTURE_IMPORT.test(file.source),
      { path: "planted.ts", source: "import { fixturePropositionV1 } from '../fixtures/proposition.fixture';" },
    );
    guard(
      browserFiles,
      (file) => HAND_DECLARED_DOMAIN_TYPE.test(file.source),
      { path: "planted.ts", source: "type Proposition = { version: number };" },
    );
  });

  it("T-RET-3: nothing under the feature reaches a persistence API", () => {
    guard(
      productionFiles,
      (file) => PERSISTENCE_APIS.test(file.source),
      { path: "planted.ts", source: "const saved = localStorage.getItem('workspace');" },
    );
  });

  it("T-RET-4: no browser file imports a privileged module or a server path but the actions", () => {
    guard(
      browserFiles,
      (file) => PRIVILEGED_IMPORTS.test(file.source),
      { path: "planted.ts", source: "import { getProposalesClient } from '@/lib/proposales';" },
    );
    guard(
      browserFiles,
      (file) => SERVER_IMPORT.test(file.source),
      { path: "planted.ts", source: "import { prepareFromBrief } from '../server/services/prepare-from-brief';" },
    );
  });

  it("T-RET-4b: only the client transports import the actions, and no component or hook does", () => {
    const importsActions = (file: SourceFile) => /from\s+["'][^"']*\/server\/actions["']/.test(file.source);

    // The seam is a whitelist, so a new one is added deliberately rather than by drifting into it.
    expect(browserFiles.filter(importsActions).map((file) => file.path).sort()).toEqual([
      "src/features/proposal-preparation/client/block-images-transport.ts",
      "src/features/proposal-preparation/client/turn-transport.ts",
    ]);
    // The guarantee behind the whitelist: what renders and what orchestrates never call an action.
    guard(
      browserFiles.filter((file) => /\/(components|hooks)\//.test(file.path)),
      importsActions,
      { path: "planted.tsx", source: "import { prepareTurnAction } from '../server/actions';" },
    );
  });

  it("the guards were run against a tree that actually contains browser files", () => {
    // A guard over an empty list passes for the wrong reason.
    expect(browserFiles.length).toBeGreaterThan(20);
    expect(productionFiles.length).toBeGreaterThan(browserFiles.length);
  });
});
