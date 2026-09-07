import "server-only";

import { ValidationError } from "@/lib/errors/app-error";
import { prefixIssues, zodIssues } from "@/lib/errors/zod-issues";
import { formatIsoTimestamp } from "@/lib/values/timestamp";

import { conversationContextSchema, type ConversationContext } from "../../schemas/conversation";
import { editPropositionInputSchema } from "../../schemas/edits";
import { parseProposalWorkflowState } from "../../schemas/workflow-state";
import type { TurnResult } from "../../schemas/turn-result";
import { applyEdits } from "../domain/apply-edits";
import { nextVersion } from "../domain/bump-version";
import { emptyConversation } from "../domain/conversation";
import { deriveItemResolutions } from "../domain/information-registry";
import { defaultDeps } from "./default-deps";

export type EditDeps = {
  now: () => number;
  editorOrigin: string;
};

/**
 * Absent means empty rather than invalid: a first turn has no history. A malformed context is a
 * validation error with its own prefix, so the caller sees which of the two objects it sent is
 * wrong (§17A.17).
 */
export function parseConversationInput(raw: unknown): ConversationContext {
  if (raw === undefined) return emptyConversation();
  const parsed = conversationContextSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError({ issues: prefixIssues(zodIssues(parsed.error), ["conversation"]) });
  }
  return parsed.data;
}

/**
 * A deterministic human edit turn: no model, no Proposales, no clock but the injected one.
 *
 * The conversation is parsed and returned unchanged. A manual edit is not something the human
 * said, so it is not a turn; the model sees its effect through `current_proposition` on the next
 * run (§17A.17 item 2).
 */
export async function editProposition(input: unknown, deps: EditDeps = defaultDeps): Promise<TurnResult> {
  const parsed = editPropositionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError({ issues: zodIssues(parsed.error) });
  }

  const state = parseProposalWorkflowState(parsed.data.state, deps.editorOrigin);
  const conversation = parseConversationInput(parsed.data.conversation);

  if (state.currentProposition === undefined) {
    throw new ValidationError({
      reason: "domain_rule",
      issues: [{ path: ["state", "currentProposition"], message: "there is no proposition to edit yet" }],
    });
  }

  const version = nextVersion(state);
  const edited = {
    ...applyEdits(state.currentProposition, parsed.data.edits, version),
    version,
    preparedAt: formatIsoTimestamp(new Date(deps.now())),
  };

  return {
    // `preparedProposition` is untouched: it is the last version the server emitted, and the
    // approval diff is computed against it (§17A.3, §17A.10).
    state: { ...state, currentProposition: edited, items: deriveItemResolutions(state.items, edited) },
    conversation,
    result: { status: "proposition", proposition: edited },
  };
}
