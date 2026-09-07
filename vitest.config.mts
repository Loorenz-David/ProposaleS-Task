import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
          },
        },
        test: {
          name: "node",
          environment: "node",
          setupFiles: ["./test/setup/node.ts"],
          // Partition rule (master plan §10.3): every *.test.ts(x) under src/ or test/ is
          // claimed by exactly one project. The two axes are extension (.tsx renders, so
          // DOM) and one named directory (feature hooks/, which needs a DOM even though it
          // renders no markup). Everything else falls here by construction.
          include: ["src/**/*.test.ts", "test/**/*.test.ts"],
          exclude: [
            ...configDefaults.exclude,
            "e2e/**",
            "**/*.live.test.ts",
            "src/features/**/hooks/**/*.test.ts",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.tsx", "test/**/*.test.tsx", "src/features/**/hooks/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "e2e/**", "**/*.live.test.ts"],
        },
      },
    ],
  },
});
