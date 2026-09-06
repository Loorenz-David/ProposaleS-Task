import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { defineTool } from "@/lib/agent/define-tool";
import type { ToolContext } from "@/lib/agent/types";

const context: ToolContext = {
  runId: "run-1",
  traceId: "trace-1",
  companyId: 1,
  remainingBudget: { wallTimeMs: 1000, maxToolCalls: 2, maxTokens: 100 },
  catalog: [],
  language: "en",
};

describe("defineTool", () => {
  it("C1(a) rejects invalid arguments without executing the tool", async () => {
    const execute = vi.fn(async () => ({ ok: true }));
    const tool = defineTool({
      name: "search_content",
      description: "search",
      kind: "read",
      input: z.strictObject({ query: z.string() }),
      output: z.strictObject({ ok: z.boolean() }),
      execute,
    });

    const result = await tool.invoke({ query: 5 }, context);

    expect(result.ok).toBe(false);
    if (!result.ok && result.error.code === "invalid_arguments") {
      expect(result.error.code).toBe("invalid_arguments");
      expect(result.error.issues[0]?.path).toEqual(["query"]);
      expect(result.error.issues[0]?.path.every((part) => typeof part === "string")).toBe(true);
    }
    expect(execute).not.toHaveBeenCalled();
  });

  it("C1(b) validates tool output", async () => {
    const tool = defineTool({
      name: "bad_output",
      description: "bad output",
      kind: "read",
      input: z.strictObject({}),
      output: z.strictObject({ value: z.string() }),
      execute: async () => ({ wrong: 1 }) as unknown as { value: string },
    });

    await expect(tool.invoke({}, context)).resolves.toEqual({ ok: false, error: { code: "invalid_tool_output" } });
  });

  it("C1(c) exposes only the provider-neutral descriptor fields", async () => {
    const { getContentTool, searchContentTool } = await shippedTools();
    expect(Object.keys(searchContentTool.descriptor())).toEqual(["name", "description", "inputJsonSchema"]);
    expect(Object.keys(getContentTool.descriptor())).toEqual(["name", "description", "inputJsonSchema"]);
  });

  it("C1(d) emits real input JSON schemas with the shared query bound", async () => {
    const { getContentTool, searchContentTool } = await shippedTools();
    const { MAX_SEARCH_QUERY_CHARS } = await import("@/features/proposal-preparation/schemas/content-candidate");
    expect(() => searchContentTool.descriptor()).not.toThrow();
    expect(() => getContentTool.descriptor()).not.toThrow();
    const schema = searchContentTool.descriptor().inputJsonSchema as {
      properties: { query: { maxLength?: number } };
    };
    expect(schema.properties.query.maxLength).toBe(MAX_SEARCH_QUERY_CHARS);
  });
});

async function shippedTools() {
  const [{ getContentTool }, { searchContentTool }] = await Promise.all([
    import("@/features/proposal-preparation/server/tools/get-content.tool"),
    import("@/features/proposal-preparation/server/tools/search-content.tool"),
  ]);
  return { getContentTool, searchContentTool };
}
