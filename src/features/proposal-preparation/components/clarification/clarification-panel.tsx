"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { ClarificationPanelViewModel, ClarificationDraft } from "../../client/view-models/clarification";
import { ClarificationQuestion } from "./clarification-question";
import { ClarificationStepProgress } from "./clarification-step-progress";

export type { ClarificationDraft };
export type ClarificationPanelProps = {
  viewModel: ClarificationPanelViewModel;
  submitState: { status: "idle" } | { status: "submitting" } | { status: "failed"; message: string };
  onSubmit: (drafts: ClarificationDraft[]) => void;
  onDismiss: () => void;
};

function initialDrafts(viewModel: ClarificationPanelViewModel): ClarificationDraft[] {
  return viewModel.questions.map((question) => ({
    questionId: question.questionId,
    state: question.state === "open" ? "untouched" : question.state,
    text: "",
  }));
}

export function ClarificationPanel({ viewModel, submitState, onSubmit, onDismiss }: ClarificationPanelProps) {
  const [drafts, setDrafts] = useState(() => initialDrafts(viewModel));
  const firstOpen = Math.max(0, viewModel.questions.findIndex((question) => question.state === "open"));
  const [currentIndex, setCurrentIndex] = useState(firstOpen);
  const currentInputRef = useRef<HTMLTextAreaElement>(null);
  const isSubmitting = submitState.status === "submitting";
  const completedCount = drafts.filter((draft) => draft.state !== "untouched").length;

  useEffect(() => {
    if (viewModel.isOpen) currentInputRef.current?.focus();
  }, [currentIndex, viewModel.isOpen]);

  const updateDraft = (questionId: string, update: Partial<ClarificationDraft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.questionId === questionId ? { ...draft, ...update } : draft)),
    );
  };
  const submit = () => {
    if (completedCount === 0 || isSubmitting) return;
    onSubmit(drafts);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  };
  const question = viewModel.questions[currentIndex];
  const draft = question ? drafts.find((item) => item.questionId === question.questionId) : null;

  return (
    <section
      aria-label="Agent questions"
      className="mx-[18px] mb-[18px] max-h-[62vh] overflow-hidden rounded-4xl border border-[var(--color-border-elevated)] bg-[var(--color-bg-card)] shadow-panel"
      hidden={!viewModel.isOpen}
      onKeyDown={onKeyDown}
      role="region"
    >
      <div className="max-h-[calc(62vh-76px)] overflow-y-auto p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-10 uppercase tracking-label text-[var(--color-accent-ink-on-dark)]">A few details</p>
            <p className="mt-1 text-13 text-[var(--color-fg-secondary)]">{viewModel.openCount} open</p>
          </div>
          <button type="button" className="rounded-md px-2 py-1 text-12 text-[var(--color-fg-secondary)]" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
        {viewModel.mode === "batch" ? (
          <div className="mt-4">
            <ClarificationStepProgress currentIndex={currentIndex} onSelect={setCurrentIndex} questions={viewModel.questions} />
            <p aria-live="polite" className="sr-only">Question {currentIndex + 1} of {viewModel.questions.length}</p>
          </div>
        ) : null}
        {question && draft ? (
          <div className="mt-4">
            <ClarificationQuestion
              disabled={isSubmitting}
              draft={draft}
              errorMessage={submitState.status === "failed" ? submitState.message : null}
              inputRef={question.state === "open" ? currentInputRef : undefined}
              onChange={(text) => updateDraft(question.questionId, { text, state: text.trim() ? "answered" : "untouched" })}
              onSkip={() => updateDraft(question.questionId, { text: "", state: "skipped" })}
              question={question}
            />
          </div>
        ) : null}
      </div>
      <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border-hairline)] bg-[var(--color-bg-card)] p-3">
        {viewModel.mode === "batch" ? (
          <>
            <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} className="rounded-md px-3 py-2 text-12 font-semibold disabled:opacity-40">Back</button>
            <button type="button" disabled={currentIndex === viewModel.questions.length - 1} onClick={() => setCurrentIndex((index) => index + 1)} className="rounded-md px-3 py-2 text-12 font-semibold disabled:opacity-40">Next</button>
            <button
              type="button"
              onClick={() => setDrafts((current) => current.map((item) => item.state === "untouched" ? { ...item, state: "skipped", text: "" } : item))}
              className="rounded-md px-3 py-2 text-12 font-semibold text-[var(--color-fg-secondary)]"
            >
              Skip all
            </button>
          </>
        ) : null}
        <button
          type="button"
          disabled={completedCount === 0 || isSubmitting}
          onClick={submit}
          className="ml-auto rounded-lg bg-[var(--color-accent)] px-4 py-2 text-12 font-semibold text-[var(--color-bg)] disabled:opacity-50"
        >
          {viewModel.mode === "single" ? "Send answer" : `Send ${completedCount} answers`}
        </button>
      </footer>
    </section>
  );
}
