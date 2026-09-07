import "server-only";

import { ValidationError } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";
import type { ProposalesClient } from "@/lib/proposales";
import { getProposalesClient } from "@/lib/proposales";

import { searchContentInputSchema, type ContentCandidate } from "../../schemas/content-candidate";
import { rankCandidates } from "../domain/rank-candidates";

const defaultDeps = {
  get proposales(): ProposalesClient {
    return getProposalesClient();
  },
};

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
