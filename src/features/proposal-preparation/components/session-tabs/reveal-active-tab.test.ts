import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import ts from "typescript";

import { revealActiveTabScrollLeft } from "./reveal-active-tab";
import { ACTIVE_TAB_REVEAL_MARGIN_PX } from "./session-tabs-constants";

describe("revealActiveTabScrollLeft", () => {
  it.each([
    ["switch", { tabOffsetLeft: 100, tabWidth: 80, scrollLeft: 0, clientWidth: 300 }],
    ["reorder", { tabOffsetLeft: 20, tabWidth: 80, scrollLeft: 50, clientWidth: 300 }],
    ["close", { tabOffsetLeft: 280, tabWidth: 80, scrollLeft: 0, clientWidth: 300 }],
    ["creation", { tabOffsetLeft: 580, tabWidth: 80, scrollLeft: 250, clientWidth: 300 }],
    ["resize", { tabOffsetLeft: 250, tabWidth: 80, scrollLeft: 100, clientWidth: 180 }],
  ])("C4(a): %s keeps both margins clear", (_operation, geometry) => {
    const next = revealActiveTabScrollLeft({ ...geometry, margin: ACTIVE_TAB_REVEAL_MARGIN_PX });
    expect(geometry.tabOffsetLeft).toBeGreaterThanOrEqual(next + ACTIVE_TAB_REVEAL_MARGIN_PX);
    expect(geometry.tabOffsetLeft + geometry.tabWidth).toBeLessThanOrEqual(
      next + geometry.clientWidth - ACTIVE_TAB_REVEAL_MARGIN_PX,
    );
  });
});

describe("session-tab source boundaries", () => {
  const sourceFiles = [
    readFileSync(path.join(__dirname, "session-tab-strip.tsx"), "utf8"),
    readFileSync(path.join(__dirname, "reveal-active-tab.ts"), "utf8"),
  ];

  function memberAccesses() {
    const accesses: Array<{ object: string; property: string }> = [];
    for (const source of sourceFiles) {
      const file = ts.createSourceFile("session-tabs.tsx", source, ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        if (ts.isPropertyAccessExpression(node)) {
          accesses.push({ object: node.expression.getText(file), property: node.name.text });
        }
        node.forEachChild(visit);
      }
      visit(file);
    }
    expect(sourceFiles.length).toBeGreaterThan(0);
    return accesses;
  }

  it("C4(c), C4(f)-i: uses an allowlist of tab operations with a real subject", () => {
    const allowedCalls = new Set([
      "preventDefault",
      "stopPropagation",
      "setData",
      "focus",
      "observe",
      "disconnect",
      "contains",
      "indexOf",
      "map",
      "min",
      "max",
      "get",
      "set",
      "delete",
      "includes",
    ]);
    const accesses = memberAccesses();
    const calls = accesses.filter(({ property }) => sourceFiles.some((source) => source.includes(`.${property}(`)));
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every(({ property }) => allowedCalls.has(property))).toBe(true);
  });

  it("C4(d), C4(f)-ii: allows only activeElement as a document member", () => {
    const accesses = memberAccesses().filter(({ object }) => object === "document");
    expect(accesses.length).toBeGreaterThan(0);
    expect(accesses.every(({ property }) => property === "activeElement")).toBe(true);
  });

  it("C4(e), C4(f)-iii: has no window-member access during render", () => {
    const accesses = memberAccesses().filter(({ object }) => object === "window");
    expect(accesses).toEqual([]);
  });
});
