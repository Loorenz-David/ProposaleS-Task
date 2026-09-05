import { z } from "zod";

import { AppError, ERROR_CODES } from "@/lib/errors/app-error";

const errorCodeSchema = z.enum(ERROR_CODES);

export const errorDtoSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorDto = z.infer<typeof errorDtoSchema>;

const genericInternalMessage = "An unexpected error occurred.";

export function toErrorDto(error: unknown): ErrorDto {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    };
  }

  if (error instanceof z.ZodError) {
    return {
      code: "validation_error",
      message: "Validation failed",
      details: {
        issues: error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
        })),
      },
    };
  }

  return { code: "internal_error", message: genericInternalMessage };
}
