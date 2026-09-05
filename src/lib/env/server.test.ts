import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import eslintConfig from "../../../eslint.config.mjs";
import { parseServerEnv, serverEnvSchema } from "@/lib/env/server";

const PROPOSALES_API_KEY_SENTINEL = "SENTINEL-KEY-9f3";

function validEnv(): Record<string, string> {
  return {
    PROPOSALES_API_KEY: PROPOSALES_API_KEY_SENTINEL,
    PROPOSALES_COMPANY_ID: "12",
    PROPOSALES_EDITOR_ORIGIN: "https://proposales.test",
    AI_PROVIDER: "anthropic",
    AI_MODEL: "test-placeholder-model",
    ANTHROPIC_API_KEY: "test-placeholder-not-a-key",
  };
}

function lintSource(source: string, filePath: string) {
  const linter = new Linter({ configType: "flat" });
  return linter.verify(source, eslintConfig, { filename: filePath });
}

function envExampleEntries() {
  const envExamplePath = fileURLToPath(new URL("../../../.env.example", import.meta.url));
  return readFileSync(envExamplePath, "utf8")
    .split("\n")
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const separator = line.indexOf("=");
      return { name: line.slice(0, separator), value: line.slice(separator + 1) };
    });
}

function envExampleNames() {
  return envExampleEntries().map(({ name }) => name);
}

describe("server environment schema", () => {
  it("C1(a): requires AI_PROVIDER and does not leak supplied secret values", () => {
    const env = validEnv();
    delete env.AI_PROVIDER;

    expect(() => parseServerEnv(env)).toThrowError(/AI_PROVIDER/);
    expect(() => parseServerEnv(env)).toThrowError(
      new RegExp(`^(?!.*${PROPOSALES_API_KEY_SENTINEL}).*$`),
    );
  });

  it("C1(b): rejects an unsupported AI provider", () => {
    expect(() => parseServerEnv({ ...validEnv(), AI_PROVIDER: "gateway" })).toThrowError(
      /AI_PROVIDER/,
    );
  });

  it("C1(c): requires only the selected vendor key", () => {
    const env = validEnv();
    delete env.ANTHROPIC_API_KEY;
    env.OPENAI_API_KEY = "present-but-not-selected";

    expect(() => parseServerEnv(env)).toThrowError(/ANTHROPIC_API_KEY/);
    expect(() => parseServerEnv(env)).toThrowError(
      new RegExp(`^(?!.*OPENAI_API_KEY).*$`),
    );
  });

  it("C1(d): accepts openai when its key is present", () => {
    const env = validEnv();
    env.AI_PROVIDER = "openai";
    env.OPENAI_API_KEY = "test-placeholder-not-a-key";
    delete env.ANTHROPIC_API_KEY;

    expect(parseServerEnv(env).AI_PROVIDER).toBe("openai");
  });

  it("C1(e): requires PROPOSALES_API_KEY", () => {
    const env = validEnv();
    delete env.PROPOSALES_API_KEY;

    expect(() => parseServerEnv(env)).toThrowError(/PROPOSALES_API_KEY/);
  });

  it("C1(f): requires AI_MODEL", () => {
    const env = validEnv();
    delete env.AI_MODEL;

    expect(() => parseServerEnv(env)).toThrowError(/AI_MODEL/);
  });

  it("C1(g): requires a positive integer company id and coerces valid strings", () => {
    expect(() => parseServerEnv({ ...validEnv(), PROPOSALES_COMPANY_ID: "0" })).toThrowError(
      /PROPOSALES_COMPANY_ID/,
    );
    expect(() => parseServerEnv({ ...validEnv(), PROPOSALES_COMPANY_ID: "abc" })).toThrowError(
      /PROPOSALES_COMPANY_ID/,
    );
    expect(parseServerEnv(validEnv()).PROPOSALES_COMPANY_ID).toBe(12);
  });

  it("C2(a): accepts an exact HTTPS editor origin", () => {
    expect(parseServerEnv(validEnv()).PROPOSALES_EDITOR_ORIGIN).toBe("https://proposales.test");
  });

  it("C2(b): rejects an editor origin with a path", () => {
    expect(() =>
      parseServerEnv({ ...validEnv(), PROPOSALES_EDITOR_ORIGIN: "https://proposales.test/editor" }),
    ).toThrowError(/PROPOSALES_EDITOR_ORIGIN/);
  });

  it("C2(c): rejects an HTTP editor origin", () => {
    expect(() =>
      parseServerEnv({ ...validEnv(), PROPOSALES_EDITOR_ORIGIN: "http://proposales.test" }),
    ).toThrowError(/PROPOSALES_EDITOR_ORIGIN/);
  });

  it("C2(d): rejects an editor origin with a trailing slash", () => {
    expect(() =>
      parseServerEnv({ ...validEnv(), PROPOSALES_EDITOR_ORIGIN: "https://proposales.test/" }),
    ).toThrowError(/PROPOSALES_EDITOR_ORIGIN/);
  });
});

describe("boundary lint rules", () => {
  it("C3(a): rejects process.env outside the environment module", () => {
    const reports = lintSource(
      "const k = process.env.X;",
      "src/features/x/server/a.ts",
    );

    expect(reports).toHaveLength(1);
    expect(reports[0]?.ruleId).toBe("no-restricted-properties");
  });

  it("C3(b): permits process.env in src/lib/env", () => {
    expect(lintSource("const k = process.env.X;", "src/lib/env/server.ts")).toHaveLength(0);
  });

  it("C3(c): rejects process.env in every application path family", () => {
    const filePaths = [
      "src/app/page.tsx",
      "src/components/x.tsx",
      "src/features/f/server/a.ts",
      "src/features/f/components/b.tsx",
      "src/lib/other/c.ts",
    ];

    for (const filePath of filePaths) {
      const reports = lintSource("const k = process.env.X;", filePath);

      expect(reports, filePath).toHaveLength(1);
      expect(reports[0]?.ruleId, filePath).toBe("no-restricted-properties");
    }
  });

  it("C3(d): enforces each import family and permits server actions", () => {
    const cases = [
      {
        source: 'import env from "@/lib/env/server";',
        filePath: "src/features/f/components/a.tsx",
        expectedReports: 1,
      },
      {
        source: 'import React from "react";',
        filePath: "src/features/f/schemas/s.ts",
        expectedReports: 1,
      },
      {
        source: 'import feature from "@/features/f/a";',
        filePath: "src/lib/x.ts",
        expectedReports: 1,
      },
      {
        source: 'import action from "@/features/f/server/actions";',
        filePath: "src/features/f/components/a.tsx",
        expectedReports: 0,
      },
    ];

    for (const { source, filePath, expectedReports } of cases) {
      const reports = lintSource(source, filePath);

      expect(reports, `${filePath}: ${source}`).toHaveLength(expectedReports);
      if (expectedReports === 1) {
        expect(reports[0]?.ruleId, filePath).toBe("no-restricted-imports");
      }
    }
  });
});

describe("environment inventory", () => {
  it("C5(a): keeps .env.example names equal to the schema keys", () => {
    expect(new Set(envExampleNames())).toEqual(new Set(Object.keys(serverEnvSchema.shape)));
  });

  it("C5(b): keeps every .env.example value empty", () => {
    const entries = envExampleEntries();

    expect(entries).toHaveLength(7);
    for (const { value } of entries) {
      expect(value).toBe("");
    }
  });
});
