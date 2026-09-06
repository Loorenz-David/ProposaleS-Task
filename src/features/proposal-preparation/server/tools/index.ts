import "server-only";

import type { ToolDefinition } from "@/lib/agent/types";
import { getContentTool } from "./get-content.tool";
import { searchContentTool } from "./search-content.tool";

export const PREPARATION_TOOLS = [searchContentTool, getContentTool] as const;

export function assertReadOnlyToolSet(tools: readonly Pick<ToolDefinition<unknown, unknown>, "name" | "kind">[]): void {
  const writeTools = tools.filter((tool) => tool.kind !== "read").map((tool) => tool.name);
  if (writeTools.length > 0) throw new Error(`tool set must contain only read tools: ${writeTools.join(", ")}`);
}
