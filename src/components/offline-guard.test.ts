import { describe, expect, it } from "vitest";

import { OfflineGuardError } from "../../test/setup/node";

describe("jsdom test setup", () => {
  it("C4(e): blocks network access in the jsdom project", async () => {
    await expect(fetch("https://api.proposales.com/v3/content")).rejects.toBeInstanceOf(
      OfflineGuardError,
    );
  });
});
