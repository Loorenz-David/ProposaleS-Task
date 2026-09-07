import type { QuestionViewModel } from "../../client/view-models/clarification";

export type ClarificationStepProgressProps = {
  questions: QuestionViewModel[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function ClarificationStepProgress({ questions, currentIndex, onSelect }: ClarificationStepProgressProps) {
  return (
    <div aria-label="Question progress" className="flex items-center gap-1" role="group">
      {questions.map((question, index) => (
        <button
          key={question.questionId}
          type="button"
          aria-label={`Question ${index + 1} of ${questions.length}, ${question.state}`}
          aria-current={index === currentIndex ? "step" : undefined}
          className="grid h-6 min-w-6 flex-1 place-items-center"
          onClick={() => onSelect(index)}
        >
          <span
            aria-hidden="true"
            className={`h-1 w-full rounded-pill ${
              index === currentIndex
                ? "bg-[var(--color-accent)]"
                : question.state === "open"
                  ? "bg-[var(--color-border-control-raised)]"
                  : "bg-[var(--color-positive)]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
