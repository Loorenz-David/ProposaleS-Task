import { describe, expect, it } from "vitest";

async function modules() {
  return {
    schema: await import("./content-candidate"),
    strength: await import("../server/domain/strength"),
  };
}

function validCandidate() {
  return {
    variationId: "188485",
    productId: "12345",
    title: "Premium support",
    description: "Priority help",
    truncated: false,
    score: 900,
    matchStrength: "strong" as const,
    reason: "support",
  };
}

describe("contentCandidateSchema", () => {
  it("C8(a) a valid candidate parses", async () => {
    const { schema } = await modules();
    expect(schema.contentCandidateSchema.safeParse(validCandidate()).success).toBe(true);
  });

  it("C8(b) an empty variationId is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), variationId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["variationId"]);
    }
  });

  it("C8(c) an empty productId is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), productId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["productId"]);
    }
  });

  it("C8(d) a whitespace-only title is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), title: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["title"]);
    }
  });

  it("C8(e) a non-string description is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), description: 42 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["description"]);
    }
  });

  it("C8(f) a non-boolean truncated is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), truncated: "true" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["truncated"]);
    }
  });

  it("C8(g) a non-integer score is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), score: 500.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["score"]);
    }
  });

  it("C8(h) a score above the scale is invalid", async () => {
    const { schema, strength } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), score: strength.SCORE_MAX + 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["score"]);
    }
  });

  it("C8(i) a score at the scale ceiling is valid", async () => {
    const { schema, strength } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), score: strength.SCORE_MAX });
    expect(result.success).toBe(true);
  });

  it("C8(j) an invalid matchStrength is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), matchStrength: "excellent" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["matchStrength"]);
    }
  });

  it("C8(k) a whitespace-only reason is invalid", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), reason: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(["reason"]);
    }
  });

  it("C8(l) an unknown key is rejected", async () => {
    const { schema } = await modules();
    const result = schema.contentCandidateSchema.safeParse({ ...validCandidate(), extra: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      const [issue] = result.error.issues;
      expect(issue.code).toBe("unrecognized_keys");
      // z.strictObject reports an unrecognized key at the object's own (empty) path
      // with the offending key names listed separately, rather than at a per-key path.
      expect(issue.path).toEqual([]);
      expect(issue.code === "unrecognized_keys" ? issue.keys : []).toEqual(["extra"]);
    }
  });
});
