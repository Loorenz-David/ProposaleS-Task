import { describe, expect, it, vi } from "vitest";

import { ConflictError, ValidationError } from "@/lib/errors/app-error";
import { toActionResult } from "@/lib/errors/action-result";

describe("toActionResult", () => {
  it("A1(a): carries a successful value through unchanged", async () => {
    const data = { status: "proposition" as const, version: 2 };

    await expect(toActionResult(async () => data)).resolves.toEqual({ ok: true, data });
  });

  it("A1(b): converts a thrown AppError into its DTO and keeps details", async () => {
    const result = await toActionResult(async () => {
      throw new ConflictError({
        reason: "draft_already_exists",
        details: { proposalUuid: "u", editorUrl: "https://proposales.test/p/u" },
      });
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "conflict",
        message: "The requested operation conflicts with the current state",
        details: {
          proposalUuid: "u",
          editorUrl: "https://proposales.test/p/u",
          reason: "draft_already_exists",
        },
      },
    });
  });

  it("A1(c): reduces an unknown error to the generic internal DTO without its message", async () => {
    const result = await toActionResult(async () => {
      throw new Error("boom: postgres://user:secret@host");
    });

    expect(result).toEqual({
      ok: false,
      error: { code: "internal_error", message: "An unexpected error occurred." },
    });
    expect(JSON.stringify(result)).not.toContain("boom");
  });

  it("A1(d): never serializes the cause of an AppError", async () => {
    const result = await toActionResult(async () => {
      throw new ValidationError({
        reason: "domain_rule",
        issues: [{ path: ["title"], message: "is required" }],
        cause: new Error("upstream detail that must not cross"),
      });
    });

    expect(JSON.stringify(result)).not.toContain("upstream detail");
    expect(result).toMatchObject({
      ok: false,
      error: { code: "validation_error", details: { reason: "domain_rule" } },
    });
  });

  it("A1(e): calls onError once with the original error, before returning", async () => {
    const onError = vi.fn();
    const thrown = new ValidationError({ issues: [{ path: ["brief"], message: "is required" }] });

    const result = await toActionResult(async () => {
      throw thrown;
    }, onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(thrown);
    expect(result.ok).toBe(false);
  });

  it("A1(f): does not call onError on success", async () => {
    const onError = vi.fn();

    await toActionResult(async () => 1, onError);

    expect(onError).not.toHaveBeenCalled();
  });
});
