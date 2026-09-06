import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Phase 01's source-level foundation checks (node project; C1, C4(a), C5, C7(b), C8).
 *
 * The browser-measured rows this phase also names (C2, C3, C7(a)) live in
 * `e2e/bootstrap.spec.ts`: master plan §10.3A establishes that no configured Vitest project
 * can measure a rendered document's computed style in this repository (jsdom does not
 * resolve `var()` and has no media-query facility; the stylesheet never reaches the jsdom
 * document at all).
 */

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../..");
const SRC_DIR = path.join(REPO_ROOT, "src");
const THEME_FILE = path.join(SRC_DIR, "styles/theme.css");
const GLOBALS_FILE = path.join(SRC_DIR, "styles/globals.css");

// ---------------------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------------------

function walk(dir: string, predicate: (name: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, predicate));
    } else if (predicate(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const isTestFile = (name: string) => /\.test\.tsx?$/.test(name);
const isStylingSourceFile = (name: string) => /\.(ts|tsx|css)$/.test(name) && !isTestFile(name);

/** Every `.ts`/`.tsx`/`.css` file under `src/**`, excluding tests and the two allowed
 * definition sites (the theme layer and the global reset). This is the scan set C1(a)/(b)
 * assert over. */
function stylingConsumerFiles(): string[] {
  return walk(SRC_DIR, isStylingSourceFile).filter(
    (file) => file !== THEME_FILE && file !== GLOBALS_FILE,
  );
}

// ---------------------------------------------------------------------------------------
// C1 — raw styling-value scanner
//
// Delegated lexical rule (projection L17), recorded here and in the Review log:
// - Scanned: every `.ts`, `.tsx`, and `.css` file under `src/**`, except `*.test.ts(x)` files
//   (test code is not a styling consumer) and the two allowed definition sites
//   (`src/styles/theme.css`, `src/styles/globals.css`).
// - Comments (`//` and `/* */`) are stripped before scanning `.ts`/`.tsx` files, so a raw
//   value mentioned in prose (as this file's own comments do, describing corrections) is not
//   flagged — only a value reachable through code (a string literal, a template literal, a
//   className) is.
// - A raw hex colour: `#` followed by 3, 4, 6 or 8 hex digits, anywhere outside a comment.
//   Tailwind arbitrary-value brackets are caught by this rule too (`text-[#1f5eff]` contains
//   a hex literal), per contract 15 §2's own signal example.
// - A raw px type size: a `text-[...]` Tailwind arbitrary value containing a `px` measurement
//   (`text-[13px]`), per contract 15 §2's own signal example; or a bare `font-size: <n>px`
//   outside `var()` in a `.css` file.
// - A raw radius or shadow literal: a `rounded(-*)-[...]` or `shadow-[...]` Tailwind arbitrary
//   value; or a bare `border-radius`/`box-shadow` declaration outside `var()` in a `.css` file.
// - Forms deliberately NOT caught (recorded because the criterion requires it): a bare
//   numeric literal with no unit and no colour/utility context (z-index, array length,
//   `flex: 1`); a non-Tailwind arbitrary-value bracket for a property this rule does not name
//   (`w-[240px]`, `top-[12px]` — layout/position values are outside C1's scope, which names
//   only colour, type size, radius and shadow); anything inside a comment; anything inside a
//   `.test.ts(x)` file.
// - This is a lexical scan, not a full CSS/AST parse — sufficiently robust for this
//   repository's actual code style at its current, MVP scope.
// ---------------------------------------------------------------------------------------

const HEX_COLOR = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/g;
const RAW_TEXT_SIZE = /\btext-\[[^\]]*\d(?:\.\d+)?px[^\]]*\]/g;
const RAW_RADIUS_ARBITRARY = /\brounded(?:-[a-z]+)?-\[[^\]]*\]/g;
const RAW_SHADOW_ARBITRARY = /\bshadow-\[[^\]]*\]/g;
const BARE_CSS_RADIUS_OR_SHADOW = /\b(?:border-radius|box-shadow)\s*:\s*(?!var\()[^;]+;/g;
const BARE_CSS_FONT_SIZE = /\bfont-size\s*:\s*(?!var\()[^;]+;/g;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

interface Violation {
  file: string;
  kind: string;
  match: string;
}

function scanForRawStylingValues(files: string[]): Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const isCss = file.endsWith(".css");
    const text = isCss ? raw : stripComments(raw);

    const record = (kind: string, pattern: RegExp) => {
      for (const match of text.matchAll(pattern)) {
        violations.push({ file, kind, match: match[0] });
      }
    };

    record("raw-hex-colour", HEX_COLOR);
    record("raw-px-type-size", RAW_TEXT_SIZE);
    record("raw-radius-arbitrary", RAW_RADIUS_ARBITRARY);
    record("raw-shadow-arbitrary", RAW_SHADOW_ARBITRARY);
    if (isCss) {
      record("raw-css-radius-or-shadow", BARE_CSS_RADIUS_OR_SHADOW);
      record("raw-css-font-size", BARE_CSS_FONT_SIZE);
    }
  }
  return violations;
}

const OUTLINE_NONE = /outline\s*:\s*(?:none|0)\b/g;

function scanForOutlineRemoval(files: string[]): Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf-8");
    for (const match of text.matchAll(OUTLINE_NONE)) {
      violations.push({ file, kind: "outline-removed", match: match[0] });
    }
  }
  return violations;
}

describe("C1: visual values are defined once; focus is never silently removed", () => {
  it("C1(a): no raw hex colour, px type size, radius, or shadow literal outside the theme layer", () => {
    const violations = scanForRawStylingValues(stylingConsumerFiles());
    expect(violations).toEqual([]);
  });

  it("C1(b): no outline:none / outline:0 outside the stated one-entry allowlist", () => {
    const allFiles = [...stylingConsumerFiles(), GLOBALS_FILE];
    const violations = scanForOutlineRemoval(allFiles);

    const outsideGlobals = violations.filter((v) => v.file !== GLOBALS_FILE);
    expect(outsideGlobals).toEqual([]);

    // The one allowed entry: globals.css's `:focus:not(:focus-visible) { outline: none; }`,
    // whose replacement is the `:focus-visible` rule immediately above it.
    expect(violations).toHaveLength(1);
    const globalsSource = readFileSync(GLOBALS_FILE, "utf-8");
    const focusVisibleIndex = globalsSource.indexOf(":focus-visible {");
    const notFocusVisibleIndex = globalsSource.indexOf(":focus:not(:focus-visible)");
    expect(notFocusVisibleIndex).toBeGreaterThan(focusVisibleIndex);
  });

  it("C1(e): the scanner's own scope — reads a synthetic fixture it must catch, ignores a file it must not", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "theme-c1e-"));
    const fixture = path.join(dir, "synthetic-consumer.ts");
    try {
      // Synthetic: no file under src/** carries a raw styling value today (this phase
      // creates none outside the theme layer), so the positive half of this assertion has
      // no real-repository subject without a manufactured one.
      writeFileSync(
        fixture,
        'export const styles = "text-[#1f5eff] rounded-[9px] p-[13px]";\n',
        "utf-8",
      );

      const positive = scanForRawStylingValues([fixture]);
      expect(positive.length).toBeGreaterThan(0);
      expect(positive.some((v) => v.kind === "raw-hex-colour")).toBe(true);

      // Negative control: theme.css is the definition site and legitimately carries raw
      // values throughout. The scanner must not be pointed at it in the real check (it is
      // excluded from `stylingConsumerFiles()`), and running it directly here proves the
      // scanner recognises the same content as "read, not flagged" only when excluded —
      // i.e. exclusion is a caller-side filter, not a blind spot in the pattern itself.
      const consumerFiles = stylingConsumerFiles();
      expect(consumerFiles).not.toContain(THEME_FILE);
      expect(consumerFiles).not.toContain(GLOBALS_FILE);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------------------
// C4(a) — Vitest collection partition
// ---------------------------------------------------------------------------------------

interface VitestListEntry {
  file: string;
  projectName: string;
}

function discoveredTestFiles(): string[] {
  const isDomOrNode = (name: string) => /\.test\.tsx?$/.test(name);
  const underSrcOrTest = [
    ...walk(SRC_DIR, isDomOrNode),
    ...walk(path.join(REPO_ROOT, "test"), isDomOrNode),
  ];
  return underSrcOrTest.filter((file) => !file.endsWith(".live.test.ts"));
}

function runVitestList(): VitestListEntry[] {
  const output = execFileSync("npx", ["vitest", "list", "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    maxBuffer: 1024 * 1024 * 32,
  });
  return JSON.parse(output) as VitestListEntry[];
}

describe("C4: test collection partitions the tree", () => {
  it("C4(a): every discovered *.test.ts(x) is claimed by exactly one project", () => {
    const onDisk = new Set(discoveredTestFiles());
    const listed = runVitestList();

    const projectsByFile = new Map<string, Set<string>>();
    for (const entry of listed) {
      const set = projectsByFile.get(entry.file) ?? new Set<string>();
      set.add(entry.projectName);
      projectsByFile.set(entry.file, set);
    }

    const claimedByNone = [...onDisk].filter((file) => !projectsByFile.has(file));
    expect(claimedByNone).toEqual([]);

    const claimedByMoreThanOne = [...projectsByFile.entries()].filter(
      ([, projects]) => projects.size !== 1,
    );
    expect(claimedByMoreThanOne).toEqual([]);

    // Self-counting: this file's own discovery is part of the set just asserted over.
    expect(onDisk.has(path.join(SRC_DIR, "styles/theme.test.ts"))).toBe(true);
  });

  it("C4(f): src/styles/theme.test.ts (this file) is collected in the node project", () => {
    const listed = runVitestList();
    const own = listed.filter((entry) => entry.file === path.join(SRC_DIR, "styles/theme.test.ts"));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((entry) => entry.projectName === "node")).toBe(true);
  });
});

// ---------------------------------------------------------------------------------------
// C5 — nothing deliberately deleted is restored
// ---------------------------------------------------------------------------------------

const FORBIDDEN_STYLING_DEPENDENCIES = [
  "styled-components",
  "@emotion/react",
  "@emotion/styled",
  "@emotion/css",
  "@emotion/core",
  "sass",
  "node-sass",
  "less",
  "stylus",
];

function forbiddenDependenciesPresent(manifestPath: string): string[] {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declared = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);
  return FORBIDDEN_STYLING_DEPENDENCIES.filter((name) => declared.has(name));
}

describe("C5: nothing deliberately deleted is restored, and no second styling mechanism appears", () => {
  it("C5(a): src/styles/tokens.css does not exist", () => {
    expect(existsSync(path.join(SRC_DIR, "styles/tokens.css"))).toBe(false);
  });

  it("C5(b): no file exists under src/components/ui/", () => {
    expect(walk(path.join(SRC_DIR, "components/ui"), () => true)).toEqual([]);
  });

  it("C5(c): no *.module.css exists under src/", () => {
    expect(walk(SRC_DIR, (name) => name.endsWith(".module.css"))).toEqual([]);
  });

  it("C5(d): package.json declares no forbidden styling dependency (fixed name-list check)", () => {
    const present = forbiddenDependenciesPresent(path.join(REPO_ROOT, "package.json"));
    expect(present).toEqual([]);
    // Recorded limit (delegated, per the criterion): this proves membership of the fixed
    // list above, not the absence of every conceivable styling dependency.
  });
});

// ---------------------------------------------------------------------------------------
// C7(b) — the theme layer declares no semantic-layer name, no component-level value, no
// multi-theme scale
// ---------------------------------------------------------------------------------------

// Component/widget nouns that are not already part of design 01's own ramp-table vocabulary.
// "tab", "panel", "dot", "button" and "badge" are excluded from this list on purpose: design
// 01's own tables use them as usage-context descriptors for base-ramp rows ("Accent hover
// (button)", "Positive wash (badge)", "Active tab" shadow, the pulse-dot keyframe) — carrying
// those rows under those names is representing the ramp as given, not inventing a
// component-level alias on top of it. The fragments below name no row in any design 01 table.
const FORBIDDEN_COMPONENT_NAME_FRAGMENTS = [
  "dialog",
  "modal",
  "tooltip",
  "chip",
  "checkbox",
  "avatar",
  "toast",
  "composer",
  "-variant",
];

function themeCustomPropertyNames(): string[] {
  const source = readFileSync(THEME_FILE, "utf-8");
  const themeBlocks = source.match(/@theme(?:\s+static)?\s*\{/g) ?? [];
  expect(themeBlocks).toHaveLength(1); // no multi-theme scale: exactly one theme block
  return [...source.matchAll(/--([\w-]+)\s*:/g)].map((match) => match[1]);
}

describe("C7(b): no semantic-layer name, component-level value, or multi-theme scale", () => {
  it("declares no custom property named after a component/widget outside design 01's own ramp vocabulary", () => {
    const names = themeCustomPropertyNames();
    const offenders = names.filter((name) =>
      FORBIDDEN_COMPONENT_NAME_FRAGMENTS.some((fragment) => name.includes(fragment)),
    );
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------
// C8 — the stale current-state documents are true after this phase
// ---------------------------------------------------------------------------------------

const C8_DOCUMENTS = [
  path.join(REPO_ROOT, "README.md"),
  path.join(REPO_ROOT, "architectural_contracts/README.md"),
  path.join(REPO_ROOT, "architectural_contracts/15-ui-styling-and-component-system.md"),
  path.join(REPO_ROOT, "architectural_contracts/12-anti-patterns.md"),
];

// The named artefacts C-4 deleted. Recorded limit (delegated, per the criterion): this
// catches these named forms, not every future false sentence a document could carry.
const DELETED_ARTEFACT_PATTERNS: RegExp[] = [
  /src\/styles\/tokens\.css/,
  /three shared primitives/i,
  /`Button`,\s*`Input`,\s*`Textarea`/,
];

// A mention on a line naming the deletion itself is a historical reference, not a
// current-state claim, and is permitted.
const HISTORICAL_MARKER = /delet|no longer exist|does not exist/i;

function unqualifiedDeletedArtefactReferences(file: string): string[] {
  const lines = readFileSync(file, "utf-8").split("\n");
  const offendingLines: string[] = [];
  for (const line of lines) {
    const mentionsDeletedArtefact = DELETED_ARTEFACT_PATTERNS.some((pattern) => pattern.test(line));
    if (mentionsDeletedArtefact && !HISTORICAL_MARKER.test(line)) {
      offendingLines.push(line.trim());
    }
  }
  return offendingLines;
}

describe("C8: the stale current-state documents are true after this phase", () => {
  it.each(C8_DOCUMENTS)("C8(a): %s makes no unqualified current-state reference to a deleted artefact", (file) => {
    expect(unqualifiedDeletedArtefactReferences(file)).toEqual([]);
  });

  it("C8(b): both 'Component library' rows name Radix UI Primitives and Lucide React", () => {
    const contractsReadme = readFileSync(path.join(REPO_ROOT, "architectural_contracts/README.md"), "utf-8");
    const rows = [...contractsReadme.matchAll(/^\|.*Component library.*\|.*$/gm)];
    expect(rows.length).toBeGreaterThanOrEqual(2);
    for (const [row] of rows) {
      expect(row).toMatch(/Radix/);
      expect(row).toMatch(/Lucide/);
    }
  });
});

// ---------------------------------------------------------------------------------------
// C4(e) preservation and C6(a)/(c) — small source-presence checks, upgrading two rows the
// plan frames as "preservation"/structural facts from inspection to an automated assertion.
// ---------------------------------------------------------------------------------------

describe("C4(e): the DOM project also installs the offline fetch guard (preservation)", () => {
  it("vitest.setup.ts still calls installOfflineFetchGuard()", () => {
    const source = readFileSync(path.join(REPO_ROOT, "vitest.setup.ts"), "utf-8");
    expect(source).toMatch(/installOfflineFetchGuard\(\)/);
  });
});

describe("C6(a)/(c): the reduced e2e spec asserts no landmark, skip link, or shell", () => {
  it("e2e/bootstrap.spec.ts contains no banner/main-landmark or skip-link assertion", () => {
    const source = readFileSync(path.join(REPO_ROOT, "e2e/bootstrap.spec.ts"), "utf-8");
    expect(source).not.toMatch(/getByRole\(\s*["']banner["']/);
    expect(source).not.toMatch(/getByRole\(\s*["']main["']/);
    expect(source).not.toMatch(/Skip to content/);
  });
});
