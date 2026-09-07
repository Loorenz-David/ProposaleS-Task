import { ArrowUp } from "lucide-react";
import { forwardRef, useLayoutEffect, useRef, type KeyboardEvent } from "react";

/** How far the composer grows before the text starts scrolling inside it instead. */
export const COMPOSER_MAX_ROWS = 6;

/**
 * The height a textarea should take for the content it already holds, capped at
 * {@link COMPOSER_MAX_ROWS}. Pure so the cap is provable without a layout engine: `scrollHeight`
 * is always 0 in jsdom, which would make a rendered assertion prove nothing.
 */
export function composerHeightPx(input: {
  scrollHeight: number;
  lineHeight: number;
  verticalPadding: number;
}): number {
  if (!Number.isFinite(input.lineHeight)) return input.scrollHeight;
  return Math.min(input.scrollHeight, input.lineHeight * COMPOSER_MAX_ROWS + input.verticalPadding);
}

export type AgentComposerProps = {
  value: string;
  isSubmitting: boolean;
  hint: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
};

export const AgentComposer = forwardRef<HTMLTextAreaElement, AgentComposerProps>(function AgentComposer(
  { value, isSubmitting, hint, onChange, onSubmit },
  ref,
) {
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
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
  /**
   * A textarea cannot size itself to its content, and the height is only measurable after the
   * value renders — so the height is a runtime measurement, not a class (15 §3). The floor stays
   * in Tailwind as `min-h`; this owns the ceiling.
   */
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = "auto";
    const styles = getComputedStyle(field);
    field.style.height = `${composerHeightPx({
      scrollHeight: field.scrollHeight,
      lineHeight: Number.parseFloat(styles.lineHeight),
      verticalPadding: Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom),
    })}px`;
  }, [value]);
  const attachField = (field: HTMLTextAreaElement | null) => {
    fieldRef.current = field;
    if (typeof ref === "function") ref(field);
    else if (ref) ref.current = field;
  };

  return (
    <div className="shrink-0 px-[18px] pb-[18px] pt-[14px]">
      <div className="flex items-end gap-[10px] rounded-3xl border border-[var(--color-border-control)] bg-[var(--color-bg-card)] px-3 py-[10px] focus-within:border-[var(--color-border-focus)]">
        <label className="sr-only" htmlFor="agent-composer">
          Message Proposal Copilot
        </label>
        <textarea
          ref={attachField}
          id="agent-composer"
          aria-describedby="agent-composer-hint"
          className="min-h-[38px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-sm leading-normal text-[var(--color-fg)] placeholder:text-[var(--color-fg-quiet)]"
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
});
