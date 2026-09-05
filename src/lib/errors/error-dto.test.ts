import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ConflictError } from "@/lib/errors/app-error";
import { errorDtoSchema, toErrorDto } from "@/lib/errors/error-dto";

describe("error DTO", () => {
  it("C1(k) derives the DTO enum from ERROR_CODES", async () => {
    const { ERROR_CODES } = await import("@/lib/errors/app-error");
    for (const code of ERROR_CODES) {
      expect(errorDtoSchema.parse({ code, message: "safe" }).code).toBe(code);
    }
  });

  it("C2(a) maps an AppError and remains schema-valid", () => {
    const dto = toErrorDto(new ConflictError({ message: "x", details: { proposalUuid: "u" } }));
    expect(dto).toEqual({ code: "conflict", message: "x", details: { proposalUuid: "u" } });
    expect(errorDtoSchema.parse(dto)).toEqual(dto);
  });

  it("C2(b) never serializes cause", () => {
    const dto = toErrorDto(
      new ConflictError({ message: "x", details: { proposalUuid: "u" }, cause: new Error("CAUSE-SENTINEL") }),
    );
    expect(dto).not.toHaveProperty("cause");
    expect(dto.details).not.toHaveProperty("cause");
    expect(JSON.stringify(dto)).not.toContain("CAUSE-SENTINEL");
  });

  it("C2(c) uses a fixed generic message for unknown errors", () => {
    const dto = toErrorDto(new Error("INTERNAL-SENTINEL"));
    expect(dto.code).toBe("internal_error");
    expect(dto.message).toBe("An unexpected error occurred.");
    expect(JSON.stringify(dto)).not.toContain("INTERNAL-SENTINEL");
  });

  it("C2(d) maps a Zod error to string paths", () => {
    const result = z.object({ a: z.object({ b: z.number() }) }).safeParse({ a: { b: "x" } });
    if (result.success) throw new Error("fixture unexpectedly parsed");
    const dto = toErrorDto(result.error);
    expect(dto.code).toBe("validation_error");
    expect(dto.details).toEqual({ issues: [{ path: ["a", "b"], message: expect.any(String) }] });
  });

  it("C2(e) stringifies array-index Zod paths", () => {
    const result = z.object({ items: z.array(z.object({ b: z.number() })) }).safeParse({ items: [{ b: "x" }] });
    if (result.success) throw new Error("fixture unexpectedly parsed");
    const dto = toErrorDto(result.error);
    expect(dto.details).toEqual({ issues: [{ path: ["items", "0", "b"], message: expect.any(String) }] });
    expect((dto.details as { issues: Array<{ path: string[] }> }).issues[0].path.every((segment) => typeof segment === "string")).toBe(true);
  });
});
