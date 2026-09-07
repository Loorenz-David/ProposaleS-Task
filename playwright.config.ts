import { defineConfig, devices } from "@playwright/test";

/** Options this repository adds to Playwright's own. Read by the live spec through its project. */
export type CopilotTestOptions = { editorOrigin?: string };

/**
 * Two ways to run: offline and live.
 *
 * Offline is what CI runs. It injects the same placeholder environment the Vitest suites use, so
 * `next dev` starts and the page renders with no secrets present, and it collects only the specs
 * that never need a backend result.
 *
 * Live is the owner's, opted into with `LIVE_SMOKE=1`. Nothing is injected then, so `next dev`
 * reads `.env` and the run reaches the real Proposales and AI provider — and creates a real draft.
 */
const isLive = process.env.LIVE_SMOKE === "1";

/** The placeholders from `test/setup/node.ts`, restated here because that module is a Vitest setup
 * file: importing it would install the offline fetch guard into this process. Mutations are
 * disabled, so an offline run cannot create anything even if a spec tried. */
const OFFLINE_ENV = {
  PROPOSALES_API_KEY: "test-placeholder-not-a-key",
  PROPOSALES_COMPANY_ID: "1",
  PROPOSALES_EDITOR_ORIGIN: "https://proposales.test",
  AI_PROVIDER: "anthropic",
  AI_MODEL: "test-placeholder-model",
  ANTHROPIC_API_KEY: "test-placeholder-not-a-key",
  OPENAI_API_KEY: "test-placeholder-not-a-key",
  COPILOT_LIVE_MUTATIONS: "disabled",
};

export default defineConfig<CopilotTestOptions>({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    ...(isLive ? {} : { env: OFFLINE_ENV }),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /\.live\.spec\.ts$/,
    },
    ...(isLive
      ? [{
          name: "chromium-live",
          use: {
            ...devices["Desktop Chrome"],
            // Passed as a project option so the spec never reads the environment itself.
            editorOrigin: process.env.PROPOSALES_EDITOR_ORIGIN,
          },
          testMatch: /\.live\.spec\.ts$/,
          // A real turn is an agent run plus catalog reads; approval adds a create and a read-back.
          timeout: 300_000,
        }]
      : []),
  ],
});
