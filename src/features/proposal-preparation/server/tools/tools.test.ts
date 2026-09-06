import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { hasForbiddenForm, AGENT_SCAN_FILES, FORBIDDEN_FORMS, readAgentScanFile } from "../../../../../test/helpers/agent-boundary-scan";
import { defineTool } from "@/lib/agent/define-tool";
import { FIXTURE_CATALOG } from "../../fixtures/catalog";
import { MAX_SEARCH_QUERY_CHARS, searchContentInputSchema } from "../../schemas/content-candidate";
import { getContentTool } from "./get-content.tool";
import { PREPARATION_TOOLS, assertReadOnlyToolSet } from "./index";
import { searchContentTool } from "./search-content.tool";

describe("preparation tools", () => {
  it("C2(a) is exactly the read-only preparation tool set", () => {
    expect(PREPARATION_TOOLS.map((tool) => tool.name)).toEqual(["search_content", "get_content"]);
    expect(PREPARATION_TOOLS.every((tool) => tool.kind === "read")).toBe(true);
    expect(() => assertReadOnlyToolSet(PREPARATION_TOOLS)).not.toThrow();
  });

  it("C2(b) rejects a write tool by name", () => {
    const mutateTool = defineTool({
      name: "create_proposal",
      description: "write",
      kind: "mutate",
      input: z.strictObject({}),
      output: z.strictObject({ ok: z.boolean() }),
      execute: async () => ({ ok: true }),
    });
    expect(() => assertReadOnlyToolSet([...PREPARATION_TOOLS, mutateTool])).toThrow("create_proposal");
  });

  it("C2(d) scans the complete agent perimeter with one shared predicate", () => {
    expect(AGENT_SCAN_FILES).toEqual([
      "src/lib/agent/types.ts",
      "src/lib/agent/define-tool.ts",
      "src/lib/agent/run.ts",
      "src/features/proposal-preparation/server/tools/search-content.tool.ts",
      "src/features/proposal-preparation/server/tools/get-content.tool.ts",
    ]);
    for (const file of AGENT_SCAN_FILES) expect(hasForbiddenForm(readAgentScanFile(file)), file).toBe(false);
  });

  it("C2(e) proves the shared scanner sees every forbidden form", () => {
    expect(FORBIDDEN_FORMS.map(({ name }) => name)).toEqual([
      "fetch", "node import", "Proposales value import", "env value import", "process", "Date",
      "Math.random", "dynamic import", "vendor AI import", "numeric query bound",
    ]);
    for (const { example } of FORBIDDEN_FORMS) expect(hasForbiddenForm(example), example).toBe(true);
    expect(hasForbiddenForm("const safe = 1;\nimport type { ContentItem } from \"@/lib/proposales\";")).toBe(false);
  });

  it("C6(a) searches the context catalog and returns concrete ranking values", async () => {
    const result = await searchContentTool.invoke({ query: "consulting service track" }, {
      runId: "run-1", traceId: "trace-1", companyId: 1,
      remainingBudget: { wallTimeMs: 1000, maxToolCalls: 1, maxTokens: 100 },
      catalog: FIXTURE_CATALOG, language: "en",
    });
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ candidates: expect.arrayContaining([
        expect.objectContaining({ variationId: "2", score: 1000, matchStrength: "strong" }),
      ]) }),
    });
  });

  it("C6(b) gets known, unknown, and unlocalized content", async () => {
    const ctx = {
      runId: "run-1", traceId: "trace-1", companyId: 1,
      remainingBudget: { wallTimeMs: 1000, maxToolCalls: 1, maxTokens: 100 },
      catalog: FIXTURE_CATALOG, language: "en",
    } as const;
    await expect(getContentTool.invoke({ variationId: "1" }, ctx)).resolves.toMatchObject({ ok: true, value: { item: { variationId: "1", productId: "500101", title: "Consulting Training Service Bundle", truncated: false } } });
    await expect(getContentTool.invoke({ variationId: "999" }, ctx)).resolves.toEqual({ ok: true, value: { item: null } });
    await expect(getContentTool.invoke({ variationId: "7" }, { ...ctx, language: "sv" })).resolves.toEqual({ ok: true, value: { item: null } });
  });

  it("C6(c) validates the output shape and strips vendor-only fields", async () => {
    const result = await searchContentTool.invoke({ query: "consulting service track" }, {
      runId: "run-1", traceId: "trace-1", companyId: 1,
      remainingBudget: { wallTimeMs: 1000, maxToolCalls: 1, maxTokens: 100 },
      catalog: FIXTURE_CATALOG, language: "en",
    });
    expect(result).toMatchObject({ ok: true, value: { candidates: expect.any(Array) } });
    if (result.ok) {
      expect(Object.keys(result.value.candidates[0] ?? {}).sort()).toEqual([
        "description", "matchStrength", "productId", "reason", "score", "title", "truncated", "variationId",
      ]);
      expect(result.value.candidates[0]).not.toHaveProperty("createdAt");
      expect(result.value.candidates[0]).not.toHaveProperty("images");
    }
  });

  it("C6(e) shares the human query bound", async () => {
    const exact = "x".repeat(MAX_SEARCH_QUERY_CHARS);
    expect(searchContentInputSchema.safeParse({ query: exact, language: "en" }).success).toBe(true);
    expect(searchContentInputSchema.safeParse({ query: `${exact}x`, language: "en" }).success).toBe(false);
    await expect(searchContentTool.invoke({ query: exact }, {
      runId: "run-1", traceId: "trace-1", companyId: 1,
      remainingBudget: { wallTimeMs: 1000, maxToolCalls: 1, maxTokens: 100 }, catalog: [], language: "en",
    })).resolves.toMatchObject({ ok: true });
    await expect(searchContentTool.invoke({ query: `${exact}x` }, {
      runId: "run-1", traceId: "trace-1", companyId: 1,
      remainingBudget: { wallTimeMs: 1000, maxToolCalls: 1, maxTokens: 100 }, catalog: [], language: "en",
    })).resolves.toMatchObject({ ok: false, error: { code: "invalid_arguments" } });
  });

  it("C6(d) requires a resolved language before executing", async () => {
    const catalogGetter = vi.fn(() => { throw new Error("execute must not read the catalog"); });
    const ctx = {
      runId: "run-1", traceId: "trace-1", companyId: 1,
      remainingBudget: { wallTimeMs: 1000, maxToolCalls: 1, maxTokens: 100 }, language: null,
    } as { runId: string; traceId: string; companyId: number; remainingBudget: { wallTimeMs: number; maxToolCalls: number; maxTokens: number }; catalog: typeof FIXTURE_CATALOG; language: null };
    Object.defineProperty(ctx, "catalog", { get: catalogGetter });
    const result = await searchContentTool.invoke({ query: "service" }, ctx);
    expect(result).toEqual({ ok: false, error: { code: "language_unresolved" } });
    expect(catalogGetter).not.toHaveBeenCalled();
  });
});
