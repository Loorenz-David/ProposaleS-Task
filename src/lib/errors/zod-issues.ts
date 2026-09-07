import type { z } from "zod";

import type { ErrorIssue } from "@/lib/errors/app-error";

/**
 * Maps Zod issues to the flat `ErrorIssue` shape used by `ValidationError`.
 *
 * A `z.strictObject` reports every unrecognized key as ONE `unrecognized_keys` issue at the
 * object's own path, with the offending names in a separate `keys` array. Callers that want a
 * path per key must flatten it, which is what this does.
 */
export function zodIssues(error: z.ZodError): ErrorIssue[] {
  return error.issues.flatMap((issue) => {
    if (issue.code === "unrecognized_keys") {
      return issue.keys.map((key) => ({
        path: [...issue.path.map(String), key],
        message: issue.message,
      }));
    }
    return [{ path: issue.path.map(String), message: issue.message }];
  });
}

/** Prefixes every issue path, so a nested parse reports where the nested value sat. */
export function prefixIssues(issues: ErrorIssue[], prefix: string[]): ErrorIssue[] {
  return issues.map((issue) => ({ path: [...prefix, ...issue.path], message: issue.message }));
}
