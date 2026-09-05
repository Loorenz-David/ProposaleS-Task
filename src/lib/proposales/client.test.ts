import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { ValidationError } from "@/lib/errors/app-error";
import { toErrorDto } from "@/lib/errors/error-dto";
import { serverEnv } from "@/lib/env/server";
import { createProposalesClient, getProposalesClient } from "@/lib/proposales/client";
import { createProposalesHttp } from "@/lib/proposales/http";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function clientFor(fetcher: typeof fetch, companyId = 42) {
  const http = createProposalesHttp({ fetch: fetcher, apiKey: "test-key", sleep: async () => {} });
  return createProposalesClient({ http, companyId });
}

describe("Proposales client", () => {
  it("C1(l) translates a response schema mismatch and redacts the body", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ unexpected: 1 }));
    const client = clientFor(fetcher);

    await expect(client.listContent()).rejects.toMatchObject({
      details: expect.objectContaining({
        reason: "schema_mismatch",
        operation: "listContent",
        issues: expect.arrayContaining([expect.objectContaining({ path: expect.any(Array) })]),
      }),
    });
    try {
      await client.listContent();
    } catch (error) {
      const dto = toErrorDto(error);
      expect(JSON.stringify(dto)).not.toContain("unexpected");
      return;
    }
    throw new Error("listContent unexpectedly resolved");
  });

  it("C4(a) sends only the endpoint-owned company_id for listContent", async () => {
    let requestUrl = "";
    let requestMethod = "";
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      requestUrl = String(input);
      requestMethod = init?.method ?? "";
      return response({ data: [] });
    });

    await clientFor(fetcher).listContent();
    const url = new URL(requestUrl);

    expect(url.pathname).toBe("/v3/content");
    expect([...url.searchParams.keys()]).toEqual(["company_id"]);
    expect(url.searchParams.get("company_id")).toBe("42");
    expect(requestMethod).toBe("GET");
  });

  it("C4(b) sends a Bearer authorization header", async () => {
    let headers: HeadersInit | undefined;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
      headers = init?.headers;
      return response({ data: [] });
    });

    await clientFor(fetcher).listContent();
    const authorization = new Headers(headers).get("authorization");

    expect(authorization).toEqual(expect.stringMatching(/^Bearer /));
  });

  it("C4(c) sends the exact getContent query", async () => {
    let requestUrl = "";
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      requestUrl = String(input);
      return response({ data: [] });
    });

    await clientFor(fetcher).getContent("188485");
    const url = new URL(requestUrl);

    expect(url.pathname).toBe("/v3/content");
    expect([...url.searchParams.keys()]).toEqual(["company_id", "variation_id"]);
    expect(url.searchParams.get("variation_id")).toBe("188485");
  });

  it("C4(d) returns null when getContent has no match", async () => {
    const result = await clientFor(vi.fn<typeof fetch>().mockResolvedValue(response({ data: [] }))).getContent("188485");

    expect(result).toBeNull();
  });

  it("C4(f) wires the default factory through injected fetch dependencies", async () => {
    let requestUrl = "";
    let authorization = "";
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      requestUrl = String(input);
      authorization = new Headers(init?.headers).get("authorization") ?? "";
      return response({ data: [] });
    });

    await getProposalesClient({ fetch: fetcher, now: () => 0, sleep: async () => {} }).listContent();
    const url = new URL(requestUrl);

    expect(url.searchParams.get("company_id")).toBe(serverEnv.PROPOSALES_COMPANY_ID.toString());
    expect(authorization).toMatch(/^Bearer /);
  });

  it("C4(g) puts server-only first in every phase-3 adapter module", () => {
    const files = ["index.ts", "client.ts", "http.ts", "schemas.ts", "mappers.ts", "errors.ts", "fake.ts"];

    for (const file of files) {
      const firstLine = readFileSync(new URL(`./${file}`, import.meta.url), "utf8").split("\n")[0];
      expect(firstLine, file).toBe('import "server-only";');
    }
  });

  it("C4(h) rejects an unsafe variation id before fetching", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [] }));

    await expect(clientFor(fetcher).getContent("188485/../../bad")).rejects.toBeInstanceOf(ValidationError);
    expect(fetcher).toHaveBeenCalledTimes(0);
  });

  it("C4(i) re-verifies the requested variation id before mapping", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({
      data: [
        { product_id: 1, variation_id: 111, title: { en: "Wrong" }, created_at: 1757059200000 },
        { product_id: 2, variation_id: 222, title: { en: "Requested" }, created_at: 1757059200000 },
      ],
    }));

    await expect(clientFor(fetcher).getContent("222")).resolves.toMatchObject({
      variationId: "222",
      productId: "2",
      title: { en: "Requested" },
    });
  });

  it("C4(j) returns null when the upstream filter does not match", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({
      data: [{ product_id: 1, variation_id: 111, title: { en: "Other" }, created_at: 1757059200000 }],
    }));

    await expect(clientFor(fetcher).getContent("222")).resolves.toBeNull();
  });

  it("C4(k) rejects comma-separated variation ids before fetching", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [] }));

    await expect(clientFor(fetcher).getContent("111,222")).rejects.toBeInstanceOf(ValidationError);
    expect(fetcher).toHaveBeenCalledTimes(0);
  });

  it("C5(e) rejects the whole read for an out-of-range epoch", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        data: [
          {
            product_id: 1,
            variation_id: 2,
            title: { en: "Bad" },
            created_at: 8640000000000001,
          },
        ],
      }),
    );

    await expect(clientFor(fetcher).listContent()).rejects.toMatchObject({
      details: expect.objectContaining({
        reason: "schema_mismatch",
        retryable: false,
        operation: "listContent",
        issues: expect.arrayContaining([expect.objectContaining({ path: expect.arrayContaining(["created_at"]) })]),
      }),
    });
  });

  it("C5(f) rejects an extended ISO year before mapping", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        data: [
          {
            product_id: 1,
            variation_id: 2,
            title: { en: "Extended" },
            created_at: 253402300800000,
          },
        ],
      }),
    );

    await expect(clientFor(fetcher).listContent()).rejects.toMatchObject({
      details: expect.objectContaining({
        reason: "schema_mismatch",
        retryable: false,
        operation: "listContent",
        issues: expect.arrayContaining([expect.objectContaining({ path: expect.arrayContaining(["created_at"]) })]),
      }),
    });
  });

  it("C6(a) requests companies without query parameters", async () => {
    let requestUrl = "";
    let method = "";
    let authorization = "";
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      requestUrl = String(input);
      method = init?.method ?? "";
      authorization = new Headers(init?.headers).get("authorization") ?? "";
      return response({ data: [] });
    });

    await expect(clientFor(fetcher).getCompany()).rejects.toBeDefined();
    const url = new URL(requestUrl);
    expect(url.pathname).toBe("/v3/companies");
    expect([...url.searchParams.keys()]).toEqual([]);
    expect(method).toBe("GET");
    expect(authorization).toMatch(/^Bearer /);
  });

  it("C6(b) selects and maps the configured company", async () => {
    const fixture = (await import("./fixtures/companies.json")).default;
    const company = await clientFor(vi.fn<typeof fetch>().mockResolvedValue(response(fixture))).getCompany();

    expect(company).toEqual({ companyId: 42, currency: "EUR", taxMode: "standard" });
  });

  it("C6(c) translates an absent configured company to not_found_upstream", async () => {
    const fixture = (await import("./fixtures/companies.json")).default;
    const error = await (async () => {
      try {
        await createProposalesClient({
          http: createProposalesHttp({
            fetch: vi.fn<typeof fetch>().mockResolvedValue(response(fixture)),
            apiKey: "test-key",
            sleep: async () => {},
          }),
          companyId: 999,
        }).getCompany();
      } catch (value) {
        return value as { details: Record<string, unknown> };
      }
      throw new Error("getCompany unexpectedly resolved");
    })();

    expect(error.details).toMatchObject({
      reason: "not_found_upstream",
      retryable: false,
      operation: "getCompany",
    });
    expect(error.details).not.toHaveProperty("status");
  });

  it("C6(e) translates malformed company currency without leaking ZodError", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [{ id: 42, currency: "EU1", tax_mode: "standard" }] }));
    const error = await (async () => {
      try {
        await clientFor(fetcher).getCompany();
      } catch (value) {
        return value;
      }
      throw new Error("getCompany unexpectedly resolved");
    })();

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty("issues");
    expect(error).toMatchObject({
      details: expect.objectContaining({ reason: "schema_mismatch", retryable: false, operation: "getCompany" }),
    });
  });

  it("C6(f) translates an unknown company tax mode", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [{ id: 42, currency: "EUR", tax_mode: "future-mode" }] }));

    await expect(clientFor(fetcher).getCompany()).rejects.toMatchObject({
      details: expect.objectContaining({ reason: "schema_mismatch", retryable: false, operation: "getCompany" }),
    });
  });
});
