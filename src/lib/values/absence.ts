import { z } from "zod";

export function knownOrAbsentSchema<T extends z.ZodType>(inner: T) {
  return z.discriminatedUnion("known", [
    z.strictObject({ known: z.literal(true), value: inner }),
    z.strictObject({ known: z.literal(false) }),
  ]);
}

export type KnownOrAbsent<T> = { known: true; value: T } | { known: false };
