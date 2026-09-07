import "server-only";

import type { AiClient } from "@/lib/ai/types";
import type { Logger } from "@/lib/logger";
import type { ProposalesClient } from "@/lib/proposales";

import type { ApprovalResult } from "../../schemas/turn-result";
import { validateApproval } from "../domain/validate-approval";
import { defaultDeps } from "./default-deps";
import { executeApprovedProposal } from "./execute-approved-proposal";

export type ApproveDeps = {
  proposales: ProposalesClient;
  /**
   * Present so a test can inject a client that fails on invocation and prove it is never reached.
   * It is deliberately not threaded into execution: after approval no model call may alter the
   * approved payload (04 §9, 08 §6).
   */
  ai: AiClient;
  now: () => number;
  logger: Logger;
  editorOrigin: string;
};

/**
 * The approval turn: validate in the binding order, then execute deterministically from the exact
 * payload that validated. The result carries no conversation — approval and execution have no
 * conversation parameter and produce no conversational turn (§17A.17 item 7).
 */
export async function approveProposition(
  input: { envelope: unknown },
  deps: ApproveDeps = defaultDeps,
): Promise<ApprovalResult> {
  const { approved, state } = validateApproval(input.envelope, {
    editorOrigin: deps.editorOrigin,
    now: deps.now,
    logger: deps.logger,
  });

  const { result, draftReference } = await executeApprovedProposal(approved, {
    proposales: deps.proposales,
    now: deps.now,
    logger: deps.logger,
    editorOrigin: deps.editorOrigin,
  });

  // The Draft Reference becomes present at exactly one place, and once present it is copied
  // forward unchanged; nothing else about the state changes here (§17A.2).
  return { state: { ...state, draftReference }, result };
}
