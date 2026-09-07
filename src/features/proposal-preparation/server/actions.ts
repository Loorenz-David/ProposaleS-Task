"use server";

import "server-only";

import { AppError, AuthorizationError } from "@/lib/errors/app-error";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { serverEnv } from "@/lib/env/server";
import { createLogger } from "@/lib/logger";

import type { ApprovalResult, TurnResult } from "../schemas/turn-result";
import {
  answerClarification,
  approveProposition,
  editProposition,
  prepareFromBrief,
  reviseProposition,
} from "./index";

/**
 * The browser → server seam. Every export here is a public network endpoint (02 §4, 10 §3), so
 * each one takes `unknown`, hands it straight to one service — which parses it strictly itself —
 * and returns a discriminated result. No schema of its own: a second parse here would be a second
 * place the contract lives (04 §3).
 */

/**
 * Codes and reasons only, once per failure, never the input, the message, or a cause (10 §7).
 * A field the error does not carry is omitted rather than logged as `undefined`, which the
 * logger's redactor would otherwise render as `[unserializable]` and make look like a defect.
 */
function logFailure(action: string, error: unknown) {
  const source = error instanceof AppError ? error : undefined;
  const details = source?.details ?? {};
  createLogger().error("action.failed", {
    action,
    ...(source === undefined ? {} : { code: source.code }),
    ...(["reason", "system", "status"] as const).reduce<Record<string, unknown>>((fields, key) => {
      if (details[key] !== undefined) fields[key] = details[key];
      return fields;
    }, {}),
  });
}

export async function prepareTurnAction(input: unknown): Promise<ActionResult<TurnResult>> {
  return toActionResult(() => prepareFromBrief(input), (error) => logFailure("prepareTurn", error));
}

export async function answerClarificationAction(input: unknown): Promise<ActionResult<TurnResult>> {
  return toActionResult(() => answerClarification(input), (error) => logFailure("answerClarification", error));
}

export async function editPropositionAction(input: unknown): Promise<ActionResult<TurnResult>> {
  return toActionResult(() => editProposition(input), (error) => logFailure("editProposition", error));
}

export async function revisePropositionAction(input: unknown): Promise<ActionResult<TurnResult>> {
  return toActionResult(() => reviseProposition(input), (error) => logFailure("reviseProposition", error));
}

/**
 * The only action that mutates an external system, so the only one the deployment's exposure
 * switch gates. This is an operational decision about this deployment, not application
 * authorization: browser input is untrusted and every contract is enforced in both settings.
 */
export async function approveProposalAction(input: unknown): Promise<ActionResult<ApprovalResult>> {
  return toActionResult(async () => {
    if (serverEnv.COPILOT_LIVE_MUTATIONS !== "enabled") {
      throw new AuthorizationError({ message: "Draft creation is disabled on this deployment." });
    }
    return approveProposition({ envelope: input });
  }, (error) => logFailure("approveProposal", error));
}
