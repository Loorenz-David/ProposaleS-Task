import { z } from "zod";

export const isoTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export function formatIsoTimestamp(date: Date): string {
  return date.toISOString();
}
