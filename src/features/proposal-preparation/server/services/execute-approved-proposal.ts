import "server-only";

import { ApprovalRequiredError, ConflictError } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";
import type { Logger } from "@/lib/logger";
import type { ProposalReadback, ProposalesClient, RecoveredProposalSummary } from "@/lib/proposales";
import { toAppliedPricing } from "@/lib/proposales/applied-pricing.mapper";
import { ProposalesError } from "@/lib/proposales/errors";
import { PROPOSALES_READ_TOTAL_MS } from "@/lib/proposales/http";

import { approvedProposalSchema, type ApprovedProposal } from "../../schemas/approval";
import {
  appliedPricingSchema,
  draftResultSchema,
  type AppliedPricingReport,
  type DraftNoticeKind,
  type DraftResult,
} from "../../schemas/draft-result";
import type { DraftReference } from "../../schemas/workflow-state";
import { toCreateDraftInput } from "../domain/to-create-draft-input";
import { defaultDeps } from "./default-deps";

export type ExecuteDeps = {
  proposales: ProposalesClient;
  now: () => number;
  logger: Logger;
  editorOrigin: string;
};

type ReadBack = { pricing: AppliedPricingReport; seriesUuid?: string; status?: string };

/**
 * Classifies a failed read-back. The overall elapsed cap is checked first because it is the outer
 * bound: a retryable failure that has already spent the read budget is exhaustion, whatever the
 * last attempt happened to fail with (§17A.12).
 */
function unavailable(error: ProposalesError, elapsedMs: number): AppliedPricingReport {
  const reason = error.details?.reason;
  const status = error.details?.status;
  const retryable = error.details?.retryable === true;

  if (retryable && elapsedMs >= PROPOSALES_READ_TOTAL_MS) {
    return { available: false, reason: "read_budget_exhausted" };
  }
  if (reason === "timeout") return { available: false, reason: "read_failed_timeout" };
  if (reason === "schema_mismatch") return { available: false, reason: "read_failed_schema_mismatch" };
  // A 404 after a successful create is not a `not_found` error: the draft exists and its editor
  // URL is valid (§17A.12).
  return {
    available: false,
    reason: "read_failed_upstream",
    ...(typeof status === "number" ? { status } : {}),
  };
}

/**
 * Check 8. It never fails the turn: a create that succeeded is never downgraded to an error by a
 * read that did not (§17A.12, criterion 19).
 */
async function readAppliedPricing(deps: ExecuteDeps, proposalUuid: string): Promise<ReadBack> {
  const startedAt = deps.now();
  let readback: ProposalReadback;
  try {
    readback = await deps.proposales.getProposal(proposalUuid);
  } catch (error) {
    if (!(error instanceof ProposalesError)) throw error;
    return { pricing: unavailable(error, deps.now() - startedAt) };
  }

  const parsed = appliedPricingSchema.safeParse(toAppliedPricing(readback));
  if (!parsed.success) {
    // Our own mapper failing our own schema is a defect, not a vendor failure. It is reported and
    // logged rather than thrown, because losing a created draft is the worse outcome.
    deps.logger.error("execution.applied_pricing_unmappable", {
      proposalUuid,
      issues: zodIssues(parsed.error).map((issue) => issue.path),
    });
    return { pricing: { available: false, reason: "read_failed_schema_mismatch" } };
  }

  return {
    pricing: parsed.data,
    ...(readback.seriesUuid === undefined ? {} : { seriesUuid: readback.seriesUuid }),
    ...(readback.status === undefined ? {} : { status: readback.status }),
  };
}

function noticesFor(deps: ExecuteDeps, editorUrl: string, carriedRecipient: boolean): Array<{ kind: DraftNoticeKind }> {
  const notices: Array<{ kind: DraftNoticeKind }> = [];
  if (carriedRecipient) notices.push({ kind: "inline_recipient_may_duplicate_contact" });
  let origin: string | undefined;
  try {
    origin = new URL(editorUrl).origin;
  } catch {
    origin = undefined;
  }
  // An upstream URL is checked against the expected origin before it is handed to a human as a
  // link (10 §10); an unexpected one is reported, never silently trusted or silently dropped.
  if (origin !== deps.editorOrigin) notices.push({ kind: "editor_url_origin_unexpected" });
  return notices;
}

/**
 * Checks 6, 7 and 8 of §17A.13, after the entry guard 10 §5 requires.
 *
 * No model is reachable from here: `deps` carries no AI client, so "execution makes zero model
 * calls" is a property of the signature and not only of the body (04 §9).
 */
export async function executeApprovedProposal(
  raw: unknown,
  deps: ExecuteDeps = defaultDeps,
): Promise<{ result: { status: "created" | "recovered"; draft: DraftResult }; draftReference: DraftReference }> {
  const parsed = approvedProposalSchema.safeParse(raw);
  if (!parsed.success) {
    // A consequential mutation reached by any path other than approval is refused (10 §5).
    throw new ApprovalRequiredError({
      details: { issues: zodIssues(parsed.error) },
    });
  }
  const approved: ApprovedProposal = parsed.data;

  // 6 — recovery search. A failure here surfaces; execution never proceeds blindly (§13).
  const matches = await deps.proposales.findProposalsByGenerationId(approved.generationId);
  if (matches.length >= 2) {
    throw new ConflictError({
      reason: "multiple_recovery_matches",
      details: { proposalUuids: matches.map((match) => match.proposalUuid) },
    });
  }

  const recovered: RecoveredProposalSummary | undefined = matches[0];
  let proposalUuid: string;
  let editorUrl: string;
  let carriedRecipient = false;

  if (recovered === undefined) {
    // 7 — exactly one create, from one call site, never auto-retried (§17A.11).
    const input = toCreateDraftInput(approved);
    carriedRecipient = input.recipient.known;
    const created = await deps.proposales.createProposalDraft(input);
    proposalUuid = created.proposalUuid;
    editorUrl = created.url;
  } else {
    proposalUuid = recovered.proposalUuid;
    editorUrl = recovered.url;
  }

  const readBack = await readAppliedPricing(deps, proposalUuid);
  const status = recovered === undefined ? readBack.status : recovered.status;
  const seriesUuid = recovered === undefined ? readBack.seriesUuid : recovered.seriesUuid;

  const draft: DraftResult = draftResultSchema.parse({
    proposalUuid,
    editorUrl,
    newlyCreated: recovered === undefined,
    ...(seriesUuid === undefined ? {} : { seriesUuid }),
    ...(status === undefined ? {} : { status }),
    appliedPricing: readBack.pricing,
    notices: noticesFor(deps, editorUrl, carriedRecipient),
  });

  deps.logger.info(recovered === undefined ? "execution.created" : "execution.recovered", {
    generationId: approved.generationId,
    proposalUuid,
    appliedPricingAvailable: draft.appliedPricing.available,
  });

  return {
    result: { status: recovered === undefined ? "created" : "recovered", draft },
    draftReference: { proposalUuid, editorUrl },
  };
}
