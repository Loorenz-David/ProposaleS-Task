import type { SessionRuntimeRecord } from "../../types/session";
import type { ClarificationAnswer } from "../../schemas/clarification";

export type ClarificationDraft = {
  questionId: string;
  state: "answered" | "skipped" | "untouched";
  text: string;
};

export type QuestionViewModel = {
  questionId: string;
  text: string;
  itemLabel: string;
  state: "open" | "answered" | "skipped";
};
export type ClarificationPanelViewModel = {
  mode: "single" | "batch";
  questions: QuestionViewModel[];
  openCount: number;
  /** Whether the questions are on screen: unanswered, not dismissed, and not being sent. */
  isOpen: boolean;
};

export function toClarificationAnswersInput(
  drafts: ClarificationDraft[],
  receivedQuestionIds: string[],
): { answers: ClarificationAnswer[] } {
  const draftById = new Map(drafts.map((draft) => [draft.questionId, draft]));
  return {
    answers: receivedQuestionIds.flatMap((questionId) => {
      const draft = draftById.get(questionId);
      if (!draft) return [];
      if (draft.state === "untouched" || (draft.state === "answered" && draft.text === "")) {
        return [];
      }
      return [{
        questionId,
        answer: draft.state === "skipped"
          ? ({ kind: "skip" } as const)
          : ({ kind: "answer", text: draft.text } as const),
      }];
    }),
  };
}

function itemLabel(itemKey: string) {
  return itemKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function toClarificationPanelViewModel(
  record: SessionRuntimeRecord,
): ClarificationPanelViewModel | null {
  if (record.latestResult?.status !== "clarification") return null;
  // Questions come from the result the turn returned; answers come from the state, which is where
  // the round is recorded. An absent round means no answers — a fact, not a default.
  const answers = new Map(
    (record.workflow?.clarification?.answers ?? []).map((entry) => [entry.questionId, entry.answer]),
  );
  const questions = record.latestResult.questions.map((question) => {
    const answer = answers.get(question.questionId);
    return {
      questionId: question.questionId,
      text: question.text,
      itemLabel: itemLabel(question.itemKey),
      state: !answer ? ("open" as const) : answer.kind === "skip" ? ("skipped" as const) : ("answered" as const),
    };
  });
  const openCount = questions.filter((question) => question.state === "open").length;
  return {
    mode: openCount <= 1 ? "single" : "batch",
    questions,
    openCount,
    // Sending the answers takes the questions off screen: the turn is now the agent's, and the
    // panel comes back only if it fails, which is the state that still needs the human.
    isOpen: record.clarificationPanel === "open" && record.inFlightTurn?.kind !== "answers",
  };
}
