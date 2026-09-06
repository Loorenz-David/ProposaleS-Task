import { describe, expect, it } from "vitest";

async function modules() {
  return { strength: await import("./strength") };
}

describe("strength scale and thresholds", () => {
  it("C2(a) T_STRONG scores strong", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.T_STRONG)).toBe("strong");
  });

  it("C2(b) T_STRONG minus one scores possible", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.T_STRONG - 1)).toBe("possible");
  });

  it("C2(c) T_POSSIBLE scores possible", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.T_POSSIBLE)).toBe("possible");
  });

  it("C2(d) T_POSSIBLE minus one scores weak", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.T_POSSIBLE - 1)).toBe("weak");
  });

  it("C2(e) T_FLOOR scores weak", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.T_FLOOR)).toBe("weak");
  });

  it("C2(f) T_FLOOR minus one is excluded", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.T_FLOOR - 1)).toBeNull();
  });

  it("C2(g) SCORE_MAX scores strong", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(strength.SCORE_MAX)).toBe("strong");
  });

  it("C2(h) zero is excluded", async () => {
    const { strength } = await modules();
    expect(strength.strengthForScore(0)).toBeNull();
  });

  it("C2(i) the thresholds are ordered integers within the scale", async () => {
    const { strength } = await modules();
    for (const value of [strength.T_FLOOR, strength.T_POSSIBLE, strength.T_STRONG, strength.SCORE_MAX]) {
      expect(Number.isInteger(value)).toBe(true);
    }
    expect(0 < strength.T_FLOOR).toBe(true);
    expect(strength.T_FLOOR < strength.T_POSSIBLE).toBe(true);
    expect(strength.T_POSSIBLE < strength.T_STRONG).toBe(true);
    expect(strength.T_STRONG <= strength.SCORE_MAX).toBe(true);
  });

  it("C2(j) a non-integer score throws", async () => {
    const { strength } = await modules();
    expect(() => strength.strengthForScore(500.5)).toThrow();
  });

  it("C2(k) a score below the range throws", async () => {
    const { strength } = await modules();
    expect(() => strength.strengthForScore(-1)).toThrow();
  });

  it("C2(l) a score above the range throws", async () => {
    const { strength } = await modules();
    expect(() => strength.strengthForScore(strength.SCORE_MAX + 1)).toThrow();
  });
});
