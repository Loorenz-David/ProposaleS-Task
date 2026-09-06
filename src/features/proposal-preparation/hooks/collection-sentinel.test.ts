import { describe, expect, it } from "vitest";

/**
 * Permanent standing guard (phase 01, master plan §10.3 partition rule; C4(c)).
 *
 * This file is not a hook test: it contains no hook, and it asserts only the environment it
 * was collected into. `src/features/**\/hooks/**\/*.test.ts` must be claimed by the DOM
 * (`jsdom`) project even though it is a `.ts` file — a hook test needs a DOM even when it
 * renders no markup. If a future change to `vitest.config.mts` ever drops this location from
 * the DOM project's include globs, this file falls to the `node` project by the partition
 * rule's default and reddens here, where `window` and `document` do not exist.
 */
describe("collection sentinel — src/features/proposal-preparation/hooks", () => {
  it("C4(c): is collected into a DOM environment", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});
