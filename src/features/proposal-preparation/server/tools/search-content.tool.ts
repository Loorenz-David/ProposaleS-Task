import "server-only";

import { z } from "zod";

import { defineTool } from "@/lib/agent/define-tool";
import { MAX_SEARCH_QUERY_CHARS, contentCandidateSchema } from "../../schemas/content-candidate";
import { rankCandidates } from "../domain/rank-candidates";

const searchContentToolInputSchema = z.strictObject({
  query: z.string().trim().min(1).max(MAX_SEARCH_QUERY_CHARS),
});

export const searchContentTool = defineTool({
  name: "search_content",
  description: "Search the current company's Proposales content catalog by a short query. Read-only; it never creates or changes content.",
  kind: "read",
  input: searchContentToolInputSchema,
  output: z.strictObject({ candidates: z.array(contentCandidateSchema) }),
  requires: (ctx) => ctx.language === null ? { code: "language_unresolved" } : null,
  execute: async (input, ctx) => ({ candidates: rankCandidates(input.query, ctx.catalog, ctx.language!) }),
});
