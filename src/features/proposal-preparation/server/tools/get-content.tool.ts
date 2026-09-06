import "server-only";

import { z } from "zod";

import { defineTool } from "@/lib/agent/define-tool";
import { positiveInt64StringSchema } from "../../schemas/shared";
import { contentDetailSchema } from "../../schemas/content-candidate";
import { MAX_CANDIDATE_DESCRIPTION_CHARS } from "../domain/rank-candidates";

const getContentToolInputSchema = z.strictObject({ variationId: positiveInt64StringSchema });

export const getContentTool = defineTool({
  name: "get_content",
  description: "Fetch one localized Proposales content item from the current catalog by variation id. Read-only; returns null when unavailable in the requested language.",
  kind: "read",
  input: getContentToolInputSchema,
  output: z.strictObject({ item: contentDetailSchema.nullable() }),
  requires: (ctx) => ctx.language === null ? { code: "language_unresolved" } : null,
  execute: async (input, ctx) => {
    const item = ctx.catalog.find((candidate) => candidate.variationId === input.variationId);
    const title = item?.title[ctx.language!];
    if (item === undefined || title === undefined || title.trim().length === 0) return { item: null };
    const rawDescription = item.description[ctx.language!] ?? "";
    const truncated = rawDescription.length > MAX_CANDIDATE_DESCRIPTION_CHARS;
    return {
      item: {
        variationId: item.variationId,
        productId: item.productId,
        title,
        description: truncated ? rawDescription.slice(0, MAX_CANDIDATE_DESCRIPTION_CHARS) : rawDescription,
        truncated,
      },
    };
  },
});
