import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MainApplicationSurface } from "./main-application-surface";
import { ProposalWorkspace } from "./proposal-workspace";
import { ProposalPreparationIdleSurface } from "../idle/proposal-preparation-idle-surface";

const REPO_ROOT = path.resolve(__dirname, "../../../../../");
const FEATURES_ROOT = path.join(REPO_ROOT, "src/features");

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [fullPath]
      : [];
  });
}

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
    fireEvent.keyDown(divider, { key: "ArrowRight" });
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
    const source = sourceFiles(path.join(REPO_ROOT, "src/app")).join("\n");
    expect(source).not.toMatch(/next\/(?:navigation|link)|useRouter|usePathname|useSearchParams/);
    expect(source).not.toMatch(/history\.(?:pushState|replaceState)|(?:window\.)?location(?:\.hash)?\s*=/);
  });

  it("C5(b): has no surface registry or extension mechanism", () => {
    const source = sourceFiles(FEATURES_ROOT).join("\n");
    expect(source).not.toMatch(/Registry|SurfaceMap|surfaceFactory|createSurface|resolveSurface|SurfaceProvider|plugin|extension/);
  });

  it("C5(c): presentation exports only the one application state discriminant", () => {
    const presentation = readFileSync(
      path.join(REPO_ROOT, "src/features/proposal-preparation/types/presentation.ts"),
      "utf8",
    );
    expect(presentation).toMatch(/export type MainSurfaceState\s*=\s*[\s\S]*?;/);
    expect(presentation).not.toMatch(/export type (?!MainSurfaceState\b)[A-Z]\w*/);
    expect(presentation).toMatch(/"creating"\s*\|\s*"created"\s*\|\s*"review"\s*\|\s*"idle"/);
  });

  it("C5(d): has exactly one lexical main renderer", () => {
    const matches = sourceFiles(path.join(REPO_ROOT, "src")).flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [...source.matchAll(/<main\b/g)].map(() => file);
    });
    expect(matches).toEqual([path.join(REPO_ROOT, "src/features/proposal-preparation/components/workspace/main-application-surface.tsx")]);
  });
});

describe("C6: idle Main Application Surface", () => {
  it("C6(a): is an honest empty state with only heading and supporting text", () => {
    render(<ProposalPreparationIdleSurface />);
    const idle = screen.getByTestId("proposal-preparation-idle");
    expect(within(idle).getAllByRole("heading")).toHaveLength(1);
    expect(within(idle).queryByRole("list")).toBeNull();
    expect(within(idle).queryByRole("navigation")).toBeNull();
    expect(within(idle).queryByRole("link")).toBeNull();
    expect(within(idle).queryByRole("status")).toBeNull();
    expect(within(idle).queryByRole("alert")).toBeNull();
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
    expect(within(idle).queryAllByLabelText(/.*/)).toBeDefined();
    expect(
      idle.matches("[aria-live], [role=\"status\"], [role=\"alert\"]") ||
        idle.querySelector("[aria-live], [role=\"status\"], [role=\"alert\"]"),
    ).toBeFalsy();
  });
});
