import { z } from "zod";

import { pathSchema } from "@/lib/values/path";
import { isoTimestampSchema } from "@/lib/values/timestamp";
import { uuidV4Schema } from "@/lib/values/uuid";

import { propositionSchema } from "./proposition";
import { proposalWorkflowStateSchemaFor } from "./workflow-state";

/**
 * The id of the exact wording the human acknowledged. Changing the wording changes the id, so an
 * envelope carrying the old id fails loudly instead of silently meaning something else (§17A.10).
 */
export const LIBRARY_PRICING_STATEMENT_ID = "library-pricing-v1";

export const LIBRARY_PRICING_STATEMENT_TEXT =
  "This draft is created in Proposales at the content library's pricing. Proposal Copilot sets no " +
  "price, total, discount, or tax value. Approving authorizes creating the draft; the final " +
  "monetary review happens in the Proposales editor before the proposal is sent.";

export const TERMINAL_CONFLICT_MESSAGE =
  "A draft already exists for this workflow; later changes were not applied and belong in the Proposales editor.";

/**
 * A required literal, not a boolean: absent and `false` become the same parse failure at the same
 * path, so a caller cannot send `false` and an implementer cannot read it as "not yet" (§17A.10).
 */
export const pricingAcknowledgmentSchema = z.strictObject({
  acknowledged: z.literal(true),
  statement: z.literal(LIBRARY_PRICING_STATEMENT_ID),
});
export type PricingAcknowledgment = z.infer<typeof pricingAcknowledgmentSchema>;

/**
 * Strict, so a `conversation` key is an unknown key: the conversation is never an input to
 * approval (§17A.17 item 7).
 */
export function approvalEnvelopeSchemaFor(editorOrigin: string) {
  return z.strictObject({
    state: proposalWorkflowStateSchemaFor(editorOrigin),
    proposition: propositionSchema,
    pricingAcknowledgment: pricingAcknowledgmentSchema,
  });
}
export type ApprovalEnvelope = z.infer<ReturnType<typeof approvalEnvelopeSchemaFor>>;

export const approvalDiffSchema = z.array(z.strictObject({
  path: pathSchema,
  before: z.unknown(),
  after: z.unknown(),
}));
export type ApprovalDiff = z.infer<typeof approvalDiffSchema>;

/**
 * Produced only by `validateApproval`; `executeApprovedProposal` re-parses it, so a consequential
 * mutation reached by any other path is refused (10 §5).
 */
export const approvedProposalSchema = z.strictObject({
  generationId: uuidV4Schema,
  proposition: propositionSchema,
  pricingAcknowledgment: pricingAcknowledgmentSchema,
  approvedAt: isoTimestampSchema,
  diff: approvalDiffSchema,
});
export type ApprovedProposal = z.infer<typeof approvedProposalSchema>;
