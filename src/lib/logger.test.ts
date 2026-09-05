import { describe, expect, it, vi } from "vitest";

import { createLogger } from "@/lib/logger";

function capturingLogger(now = () => new Date(0)) {
  const writes: string[] = [];
  const logger = createLogger({ sink: (line) => writes.push(line), now });
  return { logger, writes };
}

function recordFor(fields: Record<string, unknown>) {
  const { logger, writes } = capturingLogger();
  logger.info("e", fields);
  return { record: JSON.parse(writes[0]) as Record<string, unknown>, line: writes[0], fields };
}

describe("structured logger", () => {
  it("C3(a-g) redacts every denylisted key", () => {
    const { record, line } = recordFor({ authorization: "S1", apiKey: "S2", api_key: "S3", token: "S4", password: "S5", secret: "S6", email: "S7" });
    for (const key of ["authorization", "apiKey", "api_key", "token", "password", "secret", "email"]) expect(record[key]).toBe("[redacted]");
    for (const sentinel of ["S1", "S2", "S3", "S4", "S5", "S6", "S7"]) expect(line).not.toContain(sentinel);
  });

  it("C3(h) redacts nested objects", () => {
    const { record, line } = recordFor({ upstream: { authorization: "S8" } });
    expect((record.upstream as Record<string, unknown>).authorization).toBe("[redacted]");
    expect(line).not.toContain("S8");
  });

  it("C3(i) redacts nested arrays", () => {
    const { record, line } = recordFor({ upstream: [{ token: "S9" }] });
    expect(Array.isArray(record.upstream)).toBe(true);
    expect((record.upstream as Array<Record<string, unknown>>)[0].token).toBe("[redacted]");
    expect(line).not.toContain("S9");
  });

  it("C3(j) matches denylisted keys case-insensitively", () => {
    const { record, line } = recordFor({ Authorization: "S10", APIKEY: "S11" });
    expect(record.Authorization).toBe("[redacted]");
    expect(record.APIKEY).toBe("[redacted]");
    expect(line).not.toContain("S10");
    expect(line).not.toContain("S11");
  });

  it("C3(k) preserves null", () => {
    const { record } = recordFor({ value: null });
    expect(record.value).toBeNull();
  });

  it("C3(l) fails closed for opaque values", () => {
    const { record, line } = recordFor({ cause: new Error("OPAQUE-SENTINEL") });
    expect(record.cause).toBe("[unserializable]");
    expect(line).not.toContain("OPAQUE-SENTINEL");
  });

  it("C3(m) fails closed for cyclic values", () => {
    const fields: { cycle: unknown } = { cycle: null };
    fields.cycle = fields;
    const { record, line } = recordFor(fields);
    expect(record.cycle).toBe("[unserializable]");
    expect(line.split("\n")).toHaveLength(2);
    expect(fields.cycle).toBe(fields);
  });

  it("C3(n) owns fixed frame fields", () => {
    const { record } = recordFor({ level: "fake", event: "fake", time: "fake" });
    expect(record.level).toBe("info");
    expect(record.event).toBe("e");
    expect(record.time).toBe("1970-01-01T00:00:00.000Z");
  });

  it("C3(o) writes one newline-terminated JSON line per default-sink call", () => {
    const writes: string[] = [];
    const originalWrite = process.stdout.write;
    const spy = vi.spyOn(process.stdout, "write").mockImplementation(((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write);
    try {
      const logger = createLogger({ now: () => new Date(0) });
      logger.info("one");
      logger.info("two");
      expect(writes).toHaveLength(2);
      expect(writes.every((write) => write.endsWith("\n"))).toBe(true);
      expect(writes.map((write) => JSON.parse(write.trim()).event)).toEqual(["one", "two"]);
    } finally {
      spy.mockRestore();
      process.stdout.write = originalWrite;
    }
  });

});
