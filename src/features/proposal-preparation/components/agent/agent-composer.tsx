import { ArrowUp } from "lucide-react";
import type { KeyboardEvent } from "react";

export type AgentComposerProps = {
  value: string;
  isSubmitting: boolean;
  hint: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
};

export function AgentComposer({ value, isSubmitting, hint, onChange, onSubmit }: AgentComposerProps) {
  const submit = () => {
    if (!value.trim() || isSubmitting) return;
    onSubmit();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
    if (event.key === "Escape") event.currentTarget.blur();
  };

  return (
    <div className="shrink-0 px-[18px] pb-[18px] pt-[14px]">
      <div className="flex items-end gap-[10px] rounded-3xl border border-[var(--color-border-control)] bg-[var(--color-bg-card)] px-3 py-[10px] focus-within:border-[var(--color-border-focus)]">
        <label className="sr-only" htmlFor="agent-composer">
          Message Proposal Copilot
        </label>
        <textarea
          id="agent-composer"
          aria-describedby="agent-composer-hint"
          className="max-h-[150px] min-h-[38px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-sm leading-normal text-[var(--color-fg)] placeholder:text-[var(--color-fg-quiet)]"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Paste a brief or describe the proposal…"
          rows={1}
          value={value}
        />
        <button
          aria-label="Send message"
          className="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover-button)] disabled:opacity-50"
          disabled={!value.trim() || isSubmitting}
          onClick={submit}
          type="button"
        >
          <ArrowUp aria-hidden="true" size={17} strokeWidth={2.5} />
        </button>
      </div>
      <p id="agent-composer-hint" className="mt-2 text-11 leading-normal text-[var(--color-fg-quiet)]">
        {hint}
      </p>
    </div>
  );
}
