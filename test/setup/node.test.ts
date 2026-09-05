import { describe, expect, it } from "vitest";

import { serverEnvSchema } from "@/lib/env/server";
import { OfflineGuardError } from "./node";

const PLACEHOLDERS = {
  PROPOSALES_API_KEY: "test-placeholder-not-a-key",
  PROPOSALES_COMPANY_ID: "1",
  PROPOSALES_EDITOR_ORIGIN: "https://proposales.test",
  AI_PROVIDER: "anthropic",
  AI_MODEL: "test-placeholder-model",
  ANTHROPIC_API_KEY: "test-placeholder-not-a-key",
  OPENAI_API_KEY: "test-placeholder-not-a-key",
} as const;

describe("node test setup", () => {
  it("C4(a): loads server-only environment code in the node project", async () => {
    const { serverEnv } = await import("@/lib/env/server");

    expect(["anthropic", "openai"]).toContain(serverEnv.AI_PROVIDER);
  });

  it("C4(b): installs suite placeholders instead of reading .env", () => {
    expect(process.env.PROPOSALES_API_KEY).toBe("test-placeholder-not-a-key");
  });

  it("C4(d): installs the declared placeholder for every schema name", () => {
    const schemaNames = Object.keys(serverEnvSchema.shape) as Array<keyof typeof PLACEHOLDERS>;

    expect(schemaNames).toHaveLength(7);
    expect(new Set(schemaNames)).toEqual(new Set(Object.keys(PLACEHOLDERS)));

    for (const name of schemaNames) {
      expect(process.env[name]).toBe(PLACEHOLDERS[name]);
    }
  });

  it("C4(c): blocks network access in the default suite", async () => {
    await expect(fetch("https://api.proposales.com/v3/content")).rejects.toBeInstanceOf(
      OfflineGuardError,
    );
  });
});
