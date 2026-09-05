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
          include: [
            "src/lib/**/*.test.ts",
            "src/features/**/*.test.ts",
            "test/setup/node.test.ts",
          ],
          exclude: [...configDefaults.exclude, "e2e/**", "**/*.live.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/app/**/*.test.tsx", "src/components/**/*.test.ts", "src/components/**/*.test.tsx"],
          exclude: [...configDefaults.exclude, "e2e/**", "**/*.live.test.ts"],
        },
      },
    ],
  },
});
