import type { SessionRuntimeRecord } from "../../types/session";
import type { TemporaryClarification } from "../../types/temporary-turn";

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
  isOpen: boolean;
};

export function toClarificationAnswersInput(
  drafts: ClarificationDraft[],
  receivedQuestionIds: string[],
): { answers: TemporaryClarification["answers"] } {
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
  const answers = new Map(
    record.latestResult.clarification.answers.map((entry) => [entry.questionId, entry.answer]),
  );
  const questions = record.latestResult.clarification.questions.map((question) => {
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
    isOpen: record.clarificationPanel === "open",
  };
}
