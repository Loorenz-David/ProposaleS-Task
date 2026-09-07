import { z } from "zod";

import { pathSchema } from "@/lib/values/path";

import { clarificationQuestionSchema } from "./clarification";
import { conversationContextSchema } from "./conversation";
import { draftResultSchema } from "./draft-result";
import { propositionSchema } from "./proposition";
import { proposalWorkflowStateSchemaFor } from "./workflow-state";

/**
 * Mirrors `RunFailureReason` in `@/lib/agent/types`. It is re-declared rather than imported
 * because this folder stays runtime-neutral and that module is server-only; the two are pinned
 * equal by a type assertion in `server/domain/result-contracts.test.ts`.
 */
export const RUN_FAILURE_REASONS = [
  "budget_exhausted",
  "model_output_invalid",
  "tool_output_invalid",
  "script_exhausted",
] as const;
export const runFailureReasonSchema = z.enum(RUN_FAILURE_REASONS);

export const RUN_BUDGETS = ["wall_time", "tool_calls", "tokens"] as const;
export const runBudgetSchema = z.enum(RUN_BUDGETS);

/** Reported on every result, including failures, or the comparison it exists for is defeated. */
export const runReportSchema = z.strictObject({
  provider: z.enum(["anthropic", "openai", "scripted"]),
  model: z.string().min(1),
  usage: z.strictObject({
    // A figure the provider did not report is null, never 0 (§17A.14).
    inputTokens: z.number().int().nullable(),
    outputTokens: z.number().int().nullable(),
    totalTokens: z.number().int().nullable(),
  }),
});
export type RunReport = z.infer<typeof runReportSchema>;

/**
 * The five domain result states (§17A.13). `failed` carries `code` so a future transport maps it
 * without re-deciding; compact validation issues cross, never the model's text.
 */
export const domainResultSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("clarification"),
    questions: z.array(clarificationQuestionSchema),
    budgetExhausted: z.strictObject({ budget: runBudgetSchema }).optional(),
  }),
  z.strictObject({
    status: z.literal("proposition"),
    proposition: propositionSchema,
  }),
  z.strictObject({
    status: z.literal("failed"),
    failure: z.strictObject({
      reason: runFailureReasonSchema,
      code: z.enum(["validation_error", "internal_error"]),
      budget: runBudgetSchema.optional(),
      issues: z.array(z.strictObject({ path: pathSchema, message: z.string().trim().min(1).max(1000) })).optional(),
    }),
  }),
  z.strictObject({ status: z.literal("created"), draft: draftResultSchema }),
  z.strictObject({ status: z.literal("recovered"), draft: draftResultSchema }),
]);
export type DomainResult = z.infer<typeof domainResultSchema>;

/** The statuses an application-rendered assistant turn can carry (the other two never do). */
export type RenderableStatus = "clarification" | "proposition" | "failed";

/**
 * What a preparation, clarification, edit or revision turn returns. The state is authority; the
 * conversation is linguistic continuity. Neither schema admits the other (§17A.17 item 1).
 */
export function turnResultSchemaFor(editorOrigin: string) {
  return z.strictObject({
    state: proposalWorkflowStateSchemaFor(editorOrigin),
    conversation: conversationContextSchema,
    result: domainResultSchema,
    run: runReportSchema.optional(),
  });
}
export type TurnResult = z.infer<ReturnType<typeof turnResultSchemaFor>>;

/**
 * What approval returns. It carries no conversation: approval and execution have no conversation
 * parameter and produce no conversational turn (§17A.17 item 7).
 */
export function approvalResultSchemaFor(editorOrigin: string) {
  return z.strictObject({
    state: proposalWorkflowStateSchemaFor(editorOrigin),
    result: z.discriminatedUnion("status", [
      z.strictObject({ status: z.literal("created"), draft: draftResultSchema }),
      z.strictObject({ status: z.literal("recovered"), draft: draftResultSchema }),
    ]),
  });
}
export type ApprovalResult = z.infer<ReturnType<typeof approvalResultSchemaFor>>;
