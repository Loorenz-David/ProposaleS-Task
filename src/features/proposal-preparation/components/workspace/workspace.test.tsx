import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { getRoles } from "@testing-library/dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MainApplicationSurface } from "./main-application-surface";
import { ProposalWorkspace } from "./proposal-workspace";
import { ProposalPreparationIdleSurface } from "../idle/proposal-preparation-idle-surface";

const REPO_ROOT = path.resolve(__dirname, "../../../../../");
const SOURCE_ROOTS = [path.join(REPO_ROOT, "src/app"), path.join(REPO_ROOT, "src/features")];

type SourceFile = { file: string; source: string };

function sourceFiles(root: string): SourceFile[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [{ file: fullPath, source: readFileSync(fullPath, "utf8") }]
      : [];
  });
}

function exportedNames(source: string): string[] {
  const names = new Set<string>();
  for (const match of source.matchAll(/\bexport\s+(?:declare\s+)?(?:type|interface|enum|const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }
  for (const match of source.matchAll(/\bexport\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const entry of match[1].split(",")) {
      const name = entry.trim().split(/\s+as\s+/)[0];
      if (name) names.add(name);
    }
  }
  if (/\bexport\s+\*\s+from\b/.test(source)) names.add("*");
  if (/\bexport\s+default\b/.test(source)) names.add("default");
  return [...names].sort();
}

const FORBIDDEN_SURFACE_NOUNS = [
  "Dashboard",
  "Analytics",
  "Statistics",
  "ProductLibrary",
  "Customers",
  "Settings",
  "ProposalList",
  "SessionHistory",
  "Archive",
];

describe("C1: persistent shell landmarks", () => {
  it("C1(a): renders exactly one named complementary region", () => {
    render(<ProposalWorkspace />);
    const regions = screen.getAllByRole("complementary");
    expect(regions).toHaveLength(1);
    expect(regions[0]).toHaveAccessibleName("Proposal agent");
  });

  it("C1(b): renders exactly one main", () => {
    render(<ProposalWorkspace />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("C1(c): keeps the page server-side and the workspace client-side", () => {
    const page = readFileSync(path.join(REPO_ROOT, "src/app/page.tsx"), "utf8");
    const workspace = readFileSync(path.join(__dirname, "proposal-workspace.tsx"), "utf8");
    expect(page).not.toMatch(/^\s*["']use client["']/m);
    expect(workspace).toMatch(/^\s*["']use client["']/m);
  });

  it("C1(f): preserves landmark node identity across a divider resize", () => {
    render(<ProposalWorkspace />);
    const complementary = screen.getByRole("complementary");
    const main = screen.getByRole("main");
    const divider = screen.getByRole("separator");
    const before = divider.getAttribute("aria-valuenow");
    fireEvent.keyDown(divider, { key: "ArrowRight" });
    expect(divider.getAttribute("aria-valuenow")).not.toBe(before);
    expect(screen.getByRole("complementary")).toBe(complementary);
    expect(screen.getByRole("main")).toBe(main);
  });
});

describe("C5: source-level containment perimeter", () => {
  it("C5(a): keeps only the root route files and no navigation mechanism", () => {
    const appFiles = readdirSync(path.join(REPO_ROOT, "src/app"), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();
    expect(appFiles).toEqual(["layout.tsx", "page.tsx"]);
    const source = sourceFiles(path.join(REPO_ROOT, "src/app"))
      .map(({ source: contents }) => contents)
      .join("\n");
    expect(source).toContain("ProposalWorkspace");
    expect(source).not.toMatch(/next\/(?:navigation|link)|useRouter|usePathname|useSearchParams/);
    expect(source).not.toMatch(/history\.(?:pushState|replaceState)|(?:window\.)?location(?:\.(?:hash|href))?\s*=/);
  });

  it("C5(b): has no surface registry or extension mechanism", () => {
    const source = sourceFiles(path.join(REPO_ROOT, "src/features"))
      .map(({ source: contents }) => contents)
      .join("\n");
    expect(source).toContain("ProposalWorkspace");
    expect(source).not.toMatch(/Registry|SurfaceMap|surfaceFactory|createSurface|resolveSurface|SurfaceProvider|plugin|extension/);
  });

  it("C5(c): presentation exports only the one application state discriminant", () => {
    const presentation = readFileSync(
      path.join(REPO_ROOT, "src/features/proposal-preparation/types/presentation.ts"),
      "utf8",
    );
    expect(exportedNames(presentation)).toEqual(["MainSurfaceState"]);
    const declaration = presentation.match(/\bexport\s+type\s+MainSurfaceState\s*=\s*([\s\S]+?);/);
    expect(declaration).not.toBeNull();
    const members = [...(declaration?.[1] ?? "").matchAll(/"([^"\\]+)"/g)].map((match) => match[1]);
    expect(new Set(members)).toEqual(new Set(["creating", "created", "review", "idle"]));
  });

  it("C5(d): has exactly one lexical main renderer and no forbidden surface nouns", () => {
    const files = SOURCE_ROOTS.flatMap((root) => sourceFiles(root));
    const matches = files.flatMap(({ file, source }) =>
      [...source.matchAll(/<main\b/g)].map(() => file),
    );
    expect(matches).toEqual([
      path.join(REPO_ROOT, "src/features/proposal-preparation/components/workspace/main-application-surface.tsx"),
    ]);
    const forbiddenFileNames = files.filter(({ file }) =>
      FORBIDDEN_SURFACE_NOUNS.some((noun) => path.basename(file).includes(noun)),
    );
    expect(forbiddenFileNames).toEqual([]);
    const forbiddenExports = files.flatMap(({ file, source }) =>
      [...source.matchAll(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var)\s+([A-Z][A-Za-z0-9_$]*)/g)]
        .filter((match) => FORBIDDEN_SURFACE_NOUNS.includes(match[1]))
        .map(() => file),
    );
    expect(forbiddenExports).toEqual([]);
  });
});

describe("C6: idle Main Application Surface", () => {
  it("C6(a): is an honest empty state with only heading and supporting text", () => {
    render(<ProposalPreparationIdleSurface />);
    const idle = screen.getByTestId("proposal-preparation-idle");
    const roles = Object.keys(getRoles(idle)).filter((role) => !["generic", "paragraph"].includes(role));
    expect(roles).toEqual(["heading"]);
    expect(within(idle).getAllByRole("heading")).toHaveLength(1);
  });

  it("C6(b): renders inside the single main without replacing it", () => {
    render(<MainApplicationSurface state="idle" />);
    const main = screen.getByRole("main");
    expect(within(main).getByTestId("proposal-preparation-idle")).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("C6(c): has no navigation affordance or navigation source", () => {
    render(<ProposalPreparationIdleSurface />);
    const idle = screen.getByTestId("proposal-preparation-idle");
    expect(within(idle).queryByRole("link")).toBeNull();
    expect(within(idle).queryByText(/https?:\/\//)).toBeNull();
    const source = readFileSync(
      path.join(REPO_ROOT, "src/features/proposal-preparation/components/idle/proposal-preparation-idle-surface.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/next\/link|useRouter|history\.(?:pushState|replaceState)|window\.location/);
  });

  it("C6(d): moves no focus on first render", () => {
    render(<ProposalPreparationIdleSurface />);
    expect(
      screen.getByTestId("proposal-preparation-idle").contains(document.activeElement),
    ).toBe(false);
  });

  it("C6(e): carries no announcement of its own", () => {
    render(<ProposalPreparationIdleSurface />);
    const idle = screen.getByTestId("proposal-preparation-idle");
    expect(
      idle.matches("[aria-live], [role=\"status\"], [role=\"alert\"]") ||
        idle.querySelector("[aria-live], [role=\"status\"], [role=\"alert\"]"),
    ).toBeFalsy();
  });
});
