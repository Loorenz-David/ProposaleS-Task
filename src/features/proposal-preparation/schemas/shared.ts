import { z } from "zod";

import { knownOrAbsentSchema } from "@/lib/values/absence";
import { currencyCodeSchema, moneySchema } from "@/lib/values/money";
import { uuidV4Schema } from "@/lib/values/uuid";

export const MAX_BRIEF_CHARS = 8000;
export const MAX_TITLE_CHARS = 200;
export const MAX_NARRATIVE_CHARS = 6000;
export const MAX_COMMENT_CHARS = 500;
export const MAX_ALTERNATIVE_REASON_CHARS = 1000;
export const MAX_NOTE_TEXT_CHARS = 500;
export const MAX_QUESTION_CHARS = 300;
export const MAX_ANSWER_CHARS = 2000;
export const MAX_RATIONALE_CHARS = 1000;
export const MAX_WARNING_CHARS = 500;
export const MAX_ASSUMPTION_CHARS = 300;
export const MAX_QUOTE_CHARS = 300;
export const MAX_INSTRUCTION_CHARS = 2000;

export const propositionSourceSchema = z.enum(["brief", "proposales_content", "human", "inferred"]);
export type PropositionSource = z.infer<typeof propositionSourceSchema>;

export const boundedText = (max: number) => z.string().trim().min(1).max(max);

export const refSchema = z.strictObject({
  variationId: z.string().min(1).optional(),
  questionId: z.string().min(1).optional(),
  editTurn: z.number().int().nonnegative().optional(),
  turnId: uuidV4Schema.optional(),
  quote: boundedText(MAX_QUOTE_CHARS).optional(),
});
export type Ref = z.infer<typeof refSchema>;

type ConsequentialSource = Exclude<PropositionSource, "inferred">;
type Sourced<T, S extends PropositionSource = PropositionSource> = {
  value: T;
  source: S;
  ref?: Ref;
};

function sourcedSchema<T, const S extends readonly PropositionSource[]>(inner: z.ZodType<T>, sources: S) {
  const options = sources.map((source) => {
    const ref = source === "proposales_content"
      ? refSchema.extend({ variationId: z.string().min(1) })
      : refSchema;
    const base = z.strictObject({
      value: inner,
      source: z.literal(source),
      ref: source === "proposales_content" ? ref : ref.optional(),
    });

    if (source !== "human") return base;
    return base.superRefine((value, ctx) => {
      if (value.ref?.turnId && !value.ref.quote) {
        ctx.addIssue({
          code: "custom",
          path: ["ref", "quote"],
          message: "quote is required when turnId is present",
        });
      }
    });
  });

  return z.discriminatedUnion("source", options as any) as z.ZodType<Sourced<T, S[number]>>;
}

export function consequentialSchema<T, const S extends readonly ConsequentialSource[]>(
  inner: z.ZodType<T>,
  sources: S,
) {
  return sourcedSchema(inner, sources);
}

export function catalogVerbatimSchema<T>(inner: z.ZodType<T>) {
  return sourcedSchema(inner, ["proposales_content"] as const);
}

export function presentationalSchema<T>(inner: z.ZodType<T>) {
  return sourcedSchema(inner, ["brief", "proposales_content", "human", "inferred"] as const);
}

export function sourcedOrAbsent<T>(leafSchema: z.ZodType<T>) {
  const options = (leafSchema as any).options;
  if (!options) return knownOrAbsentSchema(leafSchema) as z.ZodTypeAny;
  const knownOptions = options.map((option: z.ZodObject<any>) =>
    option.extend({ known: z.literal(true) }),
  );
  const knownSchema = z.discriminatedUnion("source", knownOptions as any);
  return z.discriminatedUnion("known", [
    knownSchema,
    z.strictObject({ known: z.literal(false) }),
  ] as any) as z.ZodTypeAny;
}

export const positiveFiniteNumberSchema = z.number().positive();

const MAX_INT64 = "9223372036854775807";
export const positiveInt64StringSchema = z.string()
  .regex(/^[1-9]\d*$/)
  .refine((value) => value.length < MAX_INT64.length || (value.length === MAX_INT64.length && value <= MAX_INT64), {
    message: "must be a positive canonical int64 decimal string",
  });

export { currencyCodeSchema, moneySchema };
