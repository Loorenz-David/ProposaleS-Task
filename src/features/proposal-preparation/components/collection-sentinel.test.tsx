import { describe, expect, it } from "vitest";

/**
 * Permanent standing guard (phase 01, master plan §10.3 partition rule; C4(b)).
 *
 * This file is not a component test: it contains no component, and it asserts only the
 * environment it was collected into. `src/features/**\/*.test.tsx` must be claimed by the DOM
 * (`jsdom`) project — a `.tsx` test renders. If a future change to `vitest.config.mts` ever
 * drops this location from the DOM project's include globs, this test either stops running
 * (the C4(a) collection-partition check catches that) or runs under `node`, where `window` and
 * `document` do not exist, and reddens here.
 */
describe("collection sentinel — src/features/proposal-preparation/components", () => {
  it("C4(b): is collected into a DOM environment", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});
