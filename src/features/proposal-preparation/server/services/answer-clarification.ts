import "server-only";

import { z } from "zod";

import { ValidationError } from "@/lib/errors/app-error";
import { zodIssues } from "@/lib/errors/zod-issues";

import { clarificationAnswersInputSchema } from "../../schemas/clarification";
import type { TurnResult } from "../../schemas/turn-result";
import { parseProposalWorkflowState } from "../../schemas/workflow-state";
import type { PreparationAnswer } from "../agent/build-messages";
import { applyAnswers } from "../domain/information-registry";
import { parseConversationInput } from "./edit-proposition";
import { completePreparationTurn, type PrepareDeps } from "./prepare-from-brief";
import { defaultDeps } from "./default-deps";

const answerClarificationInputSchema = z.strictObject({
  state: z.unknown(),
  answers: clarificationAnswersInputSchema.shape.answers,
  conversation: z.unknown().optional(),
});

export async function answerClarification(input: unknown, deps: PrepareDeps = defaultDeps): Promise<TurnResult> {
  const parsed = answerClarificationInputSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError({ issues: zodIssues(parsed.error) });

  const state = parseProposalWorkflowState(parsed.data.state, deps.editorOrigin);
  const conversation = parseConversationInput(parsed.data.conversation);
  if (state.clarification === undefined) {
    throw new ValidationError({
      reason: "domain_rule",
      issues: [{ path: ["state", "clarification"], message: "there is no clarification round to answer" }],
    });
  }

  const items = applyAnswers(state.items, state.clarification.questions, { answers: parsed.data.answers });
  const answers: PreparationAnswer[] = parsed.data.answers.map((answer) => {
    const question = state.clarification!.questions.find((candidate) => candidate.questionId === answer.questionId)!;
    return { ...answer, itemKey: question.itemKey };
  });
  const nextState = {
    ...state,
    items,
    clarification: { ...state.clarification, answers: parsed.data.answers },
  };
  const [catalog, company] = await Promise.all([deps.proposales.listContent(), deps.proposales.getCompany()]);
  return completePreparationTurn({
    state: nextState,
    conversation,
    catalog,
    company,
    answers,
    allowClarification: false,
  }, deps);
}
