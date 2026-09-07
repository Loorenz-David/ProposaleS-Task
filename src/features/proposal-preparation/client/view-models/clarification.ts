import type { SessionRuntimeRecord } from "../../types/session";

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
