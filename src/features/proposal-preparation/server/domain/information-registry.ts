import "server-only";

import { ValidationError } from "@/lib/errors/app-error";

import type { ClarificationAnswersInput, ClarificationQuestion } from "../../schemas/clarification";
import type { InformationItemKey, InformationItems } from "../../schemas/information-items";

export const INFORMATION_REGISTRY: Record<InformationItemKey, { askPolicy: "ask_if_underivable" | "do_not_ask"; createPolicy: "required_to_create" | "not_required" }> = {
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
