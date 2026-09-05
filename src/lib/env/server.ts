import "server-only";

import { z } from "zod";

const editorOriginSchema = z.url().refine(
  (value) => {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.origin === value;
  },
  { message: "must be an exact HTTPS origin without a path, query, or fragment" },
);

export const serverEnvSchema = z
  .object({
    PROPOSALES_API_KEY: z.string().min(1),
    PROPOSALES_COMPANY_ID: z.coerce.number().int().positive(),
    PROPOSALES_EDITOR_ORIGIN: editorOriginSchema,
    AI_PROVIDER: z.enum(["anthropic", "openai"]),
    AI_MODEL: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
  })
  .superRefine((env, context) => {
    if (env.AI_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) {
      context.addIssue({
        code: "custom",
        path: ["ANTHROPIC_API_KEY"],
        message: "is required when AI_PROVIDER is anthropic",
      });
    }

    if (env.AI_PROVIDER === "openai" && !env.OPENAI_API_KEY) {
      context.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message: "is required when AI_PROVIDER is openai",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  raw: NodeJS.ProcessEnv | Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(raw);

  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => String(issue.path[0] ?? "unknown")))];
    throw new Error(`Invalid server environment: ${names.join(", ")}`);
  }

  return result.data;
}

export const serverEnv = parseServerEnv(process.env);
