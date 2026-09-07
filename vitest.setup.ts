import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { installOfflineFetchGuard } from "./test/setup/node";

installOfflineFetchGuard();

/**
 * jsdom implements no `matchMedia`, so any component that reads a media preference throws
 * rather than falling back. The gap is the environment's, not the component's — production code
 * does not guard a platform API every browser has — so it is filled here, at the default a
 * browser reports when nothing is configured: no reduced-motion preference.
 *
 * Tests that care about the preference replace this for their own duration
 * (`proposal-copilot-intro.test.tsx`); this only stops the absence from being an error.
 */
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/**
 * jsdom has no media pipeline: `play`, `pause` and `load` exist only to log "Not implemented".
 * They are neutered here so a component that legitimately controls playback does not fill the
 * suite's output with noise. Tests that assert on playback spy on these.
 */
for (const method of ["play", "pause", "load"] as const) {
  Object.defineProperty(HTMLMediaElement.prototype, method, {
    configurable: true,
    writable: true,
    value: () => {},
  });
}

// Vitest globals are off, so React Testing Library does not unmount between tests on its own.
afterEach(() => {
  cleanup();
});
