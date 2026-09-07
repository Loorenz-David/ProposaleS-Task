import type { ExtractablePill, PillIntent } from "./interaction-pill";

export type AskPayloadProps = {
  payload: ExtractablePill<"ask">["payload"];
  id: string;
  onIntent: (intent: PillIntent) => void;
};

export function AskPayload({ payload, id, onIntent }: AskPayloadProps) {
  return (
    <div id={id} className="border-t border-[var(--color-border-hairline)] px-3 pb-3 pt-3">
      <ul className="space-y-2">
        {payload.questions.map((question) => (
          <li key={question.questionId} className="flex gap-2 text-12 leading-relaxed text-[var(--color-fg-secondary)]">
            <span aria-hidden="true" className={question.state === "open" ? "text-[var(--color-attention)]" : "text-[var(--color-positive)]"}>
              {question.state === "open" ? "○" : question.state === "answered" ? "✓" : "—"}
            </span>
            <span>
              {question.text}
              <span className="ml-2 font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
                {question.state}
              </span>
              {question.answerText ? <span className="mt-1 block text-[var(--color-fg-body)]">{question.answerText}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 rounded-md border border-[var(--color-border-control-raised)] px-3 py-2 text-12 font-semibold text-[var(--color-fg-control)]"
        onClick={() => onIntent({ kind: "reopen-questions" })}
      >
        Answer this
      </button>
    </div>
  );
}
