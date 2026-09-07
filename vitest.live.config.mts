import { fileURLToPath } from "node:url";

import { loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

/**
 * The opt-in live configuration. It is separate from `vitest.config.mts` for two reasons: the
 * default suite installs an offline fetch guard in its setup file, and the default suite excludes
 * `*.live.test.ts` from both projects. Nothing here is reachable from `npm test`.
 *
 * Real credentials come from `.env` / `.env.local`, which the default suite never reads: the
 * environment there is the placeholder set written by `test/setup/node.ts`. `loadEnv` with an
 * empty prefix returns every variable rather than only the `VITE_`-prefixed ones. Variables
 * already present in the shell win, so `LIVE_SMOKE=1` and a one-off override both work.
 */
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    name: "live",
    environment: "node",
    env: loadEnv(mode, process.cwd(), ""),
    include: ["src/**/*.live.test.ts"],
    exclude: [...configDefaults.exclude, "e2e/**"],
    // One live file at a time: both suites spend real money, and the smoke creates a real draft.
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
}));
