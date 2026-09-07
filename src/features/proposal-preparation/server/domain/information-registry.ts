import "server-only";

import type { z } from "zod";

import { ValidationError } from "@/lib/errors/app-error";

import type { ClarificationAnswersInput, ClarificationQuestion } from "../../schemas/clarification";
import type { Proposition } from "../../schemas/proposition";
import {
  INFORMATION_ITEM_KEYS,
  informationItemAskPolicySchema,
  informationItemCreatePolicySchema,
} from "../../schemas/information-items";
import type { InformationItemKey, InformationItems } from "../../schemas/information-items";

type InformationItemPolicy = {
  askPolicy: z.infer<typeof informationItemAskPolicySchema>;
  createPolicy: z.infer<typeof informationItemCreatePolicySchema>;
};

export const INFORMATION_REGISTRY: Record<InformationItemKey, InformationItemPolicy> = {
  language: { askPolicy: "ask_if_underivable", createPolicy: "required_to_create" },
  title: { askPolicy: "do_not_ask", createPolicy: "required_to_create" },
  block_selection: { askPolicy: "do_not_ask", createPolicy: "required_to_create" },
  sold_scope: { askPolicy: "ask_if_underivable", createPolicy: "not_required" },
  recipient_identity: { askPolicy: "ask_if_underivable", createPolicy: "not_required" },
  quantities: { askPolicy: "ask_if_underivable", createPolicy: "not_required" },
  recipient_contact_detail: { askPolicy: "do_not_ask", createPolicy: "not_required" },
  description_narrative: { askPolicy: "do_not_ask", createPolicy: "not_required" },
  block_comments: { askPolicy: "do_not_ask", createPolicy: "not_required" },
  deadline_and_terms_notes: { askPolicy: "do_not_ask", createPolicy: "not_required" },
};

export function initialItems(): InformationItems {
  return {
    language: { resolution: "unresolved" },
    title: { resolution: "unresolved" },
    block_selection: { resolution: "unresolved" },
    sold_scope: { resolution: "unresolved" },
    recipient_identity: { resolution: "unresolved" },
    quantities: { resolution: "unresolved" },
    recipient_contact_detail: { resolution: "unresolved" },
    description_narrative: { resolution: "unresolved" },
    block_comments: { resolution: "unresolved" },
    deadline_and_terms_notes: { resolution: "unresolved" },
  };
}

function domainIssue(path: string[], message: string): never {
  throw new ValidationError({ reason: "domain_rule", issues: [{ path, message }] });
}

export function applyAnswers(
  items: InformationItems,
  questions: readonly ClarificationQuestion[],
  input: ClarificationAnswersInput,
): InformationItems {
  const result = Object.fromEntries(
    Object.entries(items).map(([key, value]) => [key, { ...value }]),
  ) as InformationItems;
  const seen = new Set<string>();

  input.answers.forEach((entry, index) => {
    const question = questions.find((candidate) => candidate.questionId === entry.questionId);
    if (!question) {
      throw new ValidationError({
        reason: "unknown_question_id",
        issues: [{ path: ["answers", String(index), "questionId"], message: "unknown question id" }],
      });
    }
    if (seen.has(entry.questionId)) {
      domainIssue(["answers", String(index), "questionId"], "question id was answered more than once");
    }
    seen.add(entry.questionId);

    if (entry.answer.kind === "skip") {
      if (INFORMATION_REGISTRY[question.itemKey].askPolicy === "do_not_ask") {
        domainIssue(["answers", String(index), "answer"], "a do-not-ask item cannot be skipped");
      }
      result[question.itemKey].resolution = "deferred_by_user";
    } else {
      result[question.itemKey].resolution = "supplied";
    }
  });

  return result;
}

type MaybeKnown = { known?: unknown };

/** A sourced leaf carries a value only in its `known: true` variant (§17A.1). */
function isKnown(leaf: unknown): boolean {
  return typeof leaf === "object" && leaf !== null && (leaf as MaybeKnown).known === true;
}

/**
 * Reads each information item's resolution off the proposition the human is actually looking at,
 * so approvability reflects the submitted version rather than the last agent turn: a human edit
 * that supplies a title counts (§17A.6).
 *
 * The derivation is authoritative for `supplied`: an item whose value is not in the proposition is
 * not supplied, whatever the inbound record claimed. Without that, a caller could approve an
 * incomplete proposition by hand-editing its own items record, which is the relaxation §17A.6
 * exists to prevent.
 *
 * Two rules keep it honest in the other direction. An item is `supplied` only when a leaf is
 * genuinely known, never from a `{ known: false }`. And `deferred_by_user` is a recorded human
 * decision, so an item that is not supplied keeps a deferral rather than reverting to `unresolved`.
 */
export function deriveItemResolutions(items: InformationItems, proposition: Proposition): InformationItems {
  const blocks = proposition.blocks;
  const recipient = proposition.recipient;
  const recipientLeaves = recipient.known ? recipient.value : undefined;

  const supplied: Record<InformationItemKey, boolean> = {
    language: isKnown(proposition.language),
    title: isKnown(proposition.title),
    block_selection: blocks.length >= 1 || isKnown(proposition.emptyDraftConfirmation),
    sold_scope: blocks.length >= 1,
    recipient_identity: recipientLeaves !== undefined
      && (isKnown(recipientLeaves.email) || isKnown(recipientLeaves.firstName) || isKnown(recipientLeaves.companyName)),
    // Vacuously true over zero blocks would claim quantities were settled on an empty draft.
    quantities: blocks.length >= 1 && blocks.every((block) => isKnown(block.quantity)),
    recipient_contact_detail: recipientLeaves !== undefined
      && (isKnown(recipientLeaves.phone) || isKnown(recipientLeaves.companyName)),
    description_narrative: isKnown(proposition.descriptionNarrative),
    block_comments: blocks.some((block) => isKnown(block.reviewerComment)),
    deadline_and_terms_notes: proposition.commercialAssumptions.some(
      (assumption) => assumption.kind === "deadline" || assumption.kind === "term",
    ),
  };

  const result = {} as InformationItems;
  for (const key of INFORMATION_ITEM_KEYS) {
    if (supplied[key]) result[key] = { resolution: "supplied" };
    else result[key] = { resolution: items[key].resolution === "deferred_by_user" ? "deferred_by_user" : "unresolved" };
  }
  return result;
}
