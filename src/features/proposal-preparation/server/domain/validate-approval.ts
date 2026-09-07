import "server-only";

import { z } from "zod";

import { ConflictError, ValidationError, type ErrorIssue } from "@/lib/errors/app-error";
import { prefixIssues, zodIssues } from "@/lib/errors/zod-issues";
import type { Logger } from "@/lib/logger";
import { formatIsoTimestamp } from "@/lib/values/timestamp";

import {
  TERMINAL_CONFLICT_MESSAGE,
  approvalEnvelopeSchemaFor,
  type ApprovedProposal,
} from "../../schemas/approval";
import { parseProposalWorkflowState, type ProposalWorkflowState } from "../../schemas/workflow-state";
import { computeApprovalDiff } from "./approval-diff";
import { evaluateApprovability } from "./approvability";
import { deriveItemResolutions } from "./information-registry";

/**
 * Reads no further than the one key check 1 needs. Loose rather than strict because the envelope's
 * own strictness is check 3's job, and running it here would reorder the two.
 */
const stateCarrierSchema = z.looseObject({ state: z.unknown() });

type ValidateApprovalContext = {
  editorOrigin: string;
  now: () => number;
  logger: Logger;
};

function valueAtPath(root: unknown, path: ReadonlyArray<string>): unknown {
  let cursor: unknown = root;
  for (const segment of path) {
    if (typeof cursor !== "object" || cursor === null) return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

/**
 * Names the reason from the payload rather than from a list of consequential paths, which §17A.4
 * warns must otherwise be kept in sync with the schema: the leaf that failed either claims
 * `inferred` provenance somewhere along its path or it does not.
 */
function claimsInferred(root: unknown, path: ReadonlyArray<string>): boolean {
  let cursor: unknown = root;
  for (const segment of path) {
    if (typeof cursor !== "object" || cursor === null) return false;
    if ((cursor as { source?: unknown }).source === "inferred") return true;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return typeof cursor === "object" && cursor !== null && (cursor as { source?: unknown }).source === "inferred";
}

function propositionFailureReason(raw: unknown, issues: ErrorIssue[]): "consequential_provenance_invalid" | "domain_rule" {
  return issues.some((issue) => claimsInferred(raw, issue.path.slice(1)))
    ? "consequential_provenance_invalid"
    : "domain_rule";
}

/**
 * Checks 1–5 of §17A.13, in the order the contract binds. The order is the contract, not an
 * implementation detail: with any other one, an approval that is both terminal and malformed
 * returns a different code and criterion 21 passes or fails on fixture luck.
 *
 * Calls no Proposales operation and reads no conversation. Terminality is a property of the state,
 * never a live lookup (§17A.2).
 */
export function validateApproval(
  raw: unknown,
  ctx: ValidateApprovalContext,
): { approved: ApprovedProposal; state: ProposalWorkflowState } {
  // 1 — the workflow state, whole and strict, before anything else.
  const carrier = stateCarrierSchema.safeParse(raw);
  if (!carrier.success) {
    throw new ValidationError({ issues: prefixIssues(zodIssues(carrier.error), []) });
  }

  let state: ProposalWorkflowState;
  try {
    state = parseProposalWorkflowState(carrier.data.state, ctx.editorOrigin);
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    const issues = (error.details?.issues ?? []) as ErrorIssue[];
    throw new ValidationError({
      ...(error.details?.reason === undefined ? {} : { reason: error.details.reason as never }),
      issues: prefixIssues(issues, ["state"]),
    });
  }

  // 2 — a draft already exists: no create, no search, no patch, no model call.
  if (state.draftReference !== undefined) {
    throw new ConflictError({
      reason: "draft_already_exists",
      message: TERMINAL_CONFLICT_MESSAGE,
      details: {
        proposalUuid: state.draftReference.proposalUuid,
        editorUrl: state.draftReference.editorUrl,
      },
    });
  }

  // 3 and 4 — the envelope, whose schema embeds the proposition and its provenance unions.
  const envelope = approvalEnvelopeSchemaFor(ctx.editorOrigin).safeParse(raw);
  if (!envelope.success) {
    const issues = zodIssues(envelope.error);
    const acknowledgment = issues.filter((issue) => issue.path[0] === "pricingAcknowledgment");
    if (acknowledgment.length > 0) {
      throw new ValidationError({ reason: "pricing_acknowledgment_missing", issues: acknowledgment });
    }
    const proposition = issues.filter((issue) => issue.path[0] === "proposition");
    if (proposition.length > 0) {
      const rawProposition = valueAtPath(raw, ["proposition"]);
      throw new ValidationError({
        reason: propositionFailureReason(rawProposition, proposition),
        issues: proposition,
      });
    }
    throw new ValidationError({ issues });
  }

  // 5 — required-to-create completeness, read off the proposition actually submitted.
  const items = deriveItemResolutions(state.items, envelope.data.proposition);
  const approvability = evaluateApprovability(items);
  if (!approvability.approvable) {
    throw new ValidationError({
      reason: "required_to_create_unresolved",
      itemKeys: approvability.itemKeys,
      issues: approvability.itemKeys.map((itemKey) => ({
        path: ["state", "items", itemKey],
        message: "required to create and not supplied",
      })),
    });
  }

  // The diff needs both sides, and every approval follows a proposition turn that set them, so a
  // state without a prepared side cannot have come from this workflow (§17A.10).
  if (state.preparedProposition === undefined) {
    throw new ValidationError({
      reason: "domain_rule",
      issues: [{ path: ["state", "preparedProposition"], message: "approval requires the prepared proposition it is diffed against" }],
    });
  }

  const diff = computeApprovalDiff(state.preparedProposition, envelope.data.proposition);
  const approved: ApprovedProposal = {
    generationId: state.generationId,
    proposition: envelope.data.proposition,
    pricingAcknowledgment: envelope.data.pricingAcknowledgment,
    approvedAt: formatIsoTimestamp(new Date(ctx.now())),
    diff,
  };

  // The diff can carry a recipient email and free text, so the event carries the paths and the
  // count and never the values (§17A.10, 10 §7).
  ctx.logger.info("approval.validated", {
    generationId: approved.generationId,
    diffPaths: diff.map((entry) => entry.path),
    diffCount: diff.length,
  });

  return { approved, state };
}
