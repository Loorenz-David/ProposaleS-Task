import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "node_modules/**",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx,mts,mjs}"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read environment variables through @/lib/env/server.",
        },
      ],
    },
  },
  {
    files: ["test/setup/node.ts", "test/setup/node.test.ts", "playwright.config.ts"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  {
    files: ["src/lib/env/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  {
    files: [
      "src/**/components/**/*.{js,jsx,ts,tsx}",
      "src/**/hooks/**/*.{js,jsx,ts,tsx}",
      "src/**/client/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex: "^(?!.*(?:^|/)server/actions(?:\\.ts)?$).*\\/server\\/.*$",
                message: "Client code cannot import server authority modules.",
              },
            {
              group: ["@/lib/proposales", "@/lib/ai", "@/lib/agent", "@/lib/env/server"],
              message: "Client code cannot import server-only modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/schemas/**/*.{js,jsx,ts,tsx}", "src/**/types/**/*.{js,jsx,ts,tsx}"],
    rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              { group: ["react", "next/*", "@/lib/env/*"], message: "Shared contracts must stay runtime-neutral." },
              { group: ["**/server-only"], message: "Shared contracts cannot depend on server-only." },
            ],
          },
      ],
    },
  },
  {
    files: ["src/lib/**/*.{js,jsx,ts,tsx}"],
    rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              { group: ["@/features/**", "@/app/**"], message: "src/lib cannot import upward into app or features." },
            ],
          },
      ],
    },
  },
]);
