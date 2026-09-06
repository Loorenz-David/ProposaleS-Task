import "server-only";

import type { z } from "zod";

import { ValidationError } from "@/lib/errors/app-error";
import type { ProposalesClient } from "@/lib/proposales";
import { getProposalesClient } from "@/lib/proposales";

import { searchContentInputSchema, type ContentCandidate } from "../../schemas/content-candidate";
import { rankCandidates } from "../domain/rank-candidates";

const defaultDeps = {
  get proposales(): ProposalesClient {
    return getProposalesClient();
  },
};

// Duplicated from schemas/workflow-state.ts's zodIssues (D15): two call sites is not yet
// a pattern (contract 03 §3), so this stays a private copy rather than a shared export.
function zodIssues(error: z.ZodError) {
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

export async function searchContentForHuman(
  input: unknown,
  deps: { proposales: ProposalesClient } = defaultDeps,
): Promise<{ candidates: ContentCandidate[] }> {
  const parsed = searchContentInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError({ issues: zodIssues(parsed.error) });
  }

  const catalog = await deps.proposales.listContent();
  return { candidates: rankCandidates(parsed.data.query, catalog, parsed.data.language) };
}
