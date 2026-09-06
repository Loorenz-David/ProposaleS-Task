import "server-only";

import { z } from "zod";

import type { JsonSchema } from "@/lib/ai/types";
import type { ToolContext, ToolDefinition, ToolIssue } from "@/lib/agent/types";

type ToolSpec<I, O> = {
  name: string;
  description: string;
  kind: ToolDefinition<I, O>["kind"];
  input: z.ZodType<I>;
  output: z.ZodType<O>;
  requires?: (ctx: ToolContext) => null | { code: "language_unresolved" };
  execute: (input: I, ctx: ToolContext) => O | Promise<O>;
};

function issuesFrom(error: z.ZodError): ToolIssue[] {
  return error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message }));
}

export function defineTool<I, O>(spec: ToolSpec<I, O>): ToolDefinition<I, O> {
  return {
    name: spec.name,
    description: spec.description,
    kind: spec.kind,
    descriptor: () => ({
      name: spec.name,
      description: spec.description,
      inputJsonSchema: z.toJSONSchema(spec.input, { io: "input" }) as JsonSchema,
    }),
    async invoke(rawInput, ctx) {
      const parsedInput = spec.input.safeParse(rawInput);
      if (!parsedInput.success) return { ok: false, error: { code: "invalid_arguments", issues: issuesFrom(parsedInput.error) } };

      const requirement = spec.requires?.(ctx);
      if (requirement !== null && requirement !== undefined) return { ok: false, error: requirement };

      const value = await spec.execute(parsedInput.data, ctx);
      const parsedOutput = spec.output.safeParse(value);
      if (!parsedOutput.success) return { ok: false, error: { code: "invalid_tool_output" } };
      return { ok: true, value: parsedOutput.data };
    },
  };
}
