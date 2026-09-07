import type { Ref } from "react";

import type { QuestionViewModel } from "../../client/view-models/clarification";
import type { ClarificationDraft } from "./clarification-panel";

export type ClarificationQuestionProps = {
  question: QuestionViewModel;
  draft: ClarificationDraft;
  disabled: boolean;
  errorMessage: string | null;
  inputRef?: Ref<HTMLTextAreaElement>;
  onChange: (text: string) => void;
  onSkip: () => void;
};

export function ClarificationQuestion({ question, draft, disabled, errorMessage, inputRef, onChange, onSkip }: ClarificationQuestionProps) {
  const itemId = `question-${question.questionId}-item`;
  const errorId = `question-${question.questionId}-error`;
  return (
    <div>
      <p id={itemId} className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
        {question.itemLabel}
      </p>
      <label className="mt-2 block text-sm font-semibold leading-relaxed text-[var(--color-fg)]" htmlFor={`question-${question.questionId}`}>
        {question.text}
      </label>
      {question.state === "open" ? (
        <>
          <textarea
            ref={inputRef}
            id={`question-${question.questionId}`}
            aria-describedby={`${itemId}${errorMessage ? ` ${errorId}` : ""}`}
            aria-invalid={errorMessage ? true : undefined}
            className="mt-3 min-h-24 w-full resize-y rounded-xl border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-3 text-sm leading-relaxed text-[var(--color-fg)] focus:border-[var(--color-border-focus)]"
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            value={draft.text}
          />
          {errorMessage ? <p id={errorId} className="mt-2 text-12 text-[var(--color-attention)]">{errorMessage}</p> : null}
          <button
            type="button"
            className="mt-2 text-12 font-semibold text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]"
            onClick={onSkip}
          >
            Skip — leave this for the client
          </button>
        </>
      ) : (
        <p className="mt-3 rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-control)] p-3 text-13 text-[var(--color-fg-secondary)]">
          {question.state === "answered" ? "Answered earlier" : "Skipped — left for the client"}
        </p>
      )}
    </div>
  );
}
