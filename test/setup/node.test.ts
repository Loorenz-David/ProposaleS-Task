import { describe, expect, it } from "vitest";

import { OfflineGuardError } from "./node";

describe("node test setup", () => {
  it("C4(a): loads server-only environment code in the node project", async () => {
    const { serverEnv } = await import("@/lib/env/server");

    expect(["anthropic", "openai"]).toContain(serverEnv.AI_PROVIDER);
  });

  it("C4(b): installs suite placeholders instead of reading .env", () => {
    expect(process.env.PROPOSALES_API_KEY).toBe("test-placeholder-not-a-key");
  });

  it("C4(c): blocks network access in the default suite", async () => {
    await expect(fetch("https://api.proposales.com/v3/content")).rejects.toBeInstanceOf(
      OfflineGuardError,
    );
  });
});
