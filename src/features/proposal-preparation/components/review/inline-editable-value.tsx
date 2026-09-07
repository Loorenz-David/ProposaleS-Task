"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { EditableLeafViewModel } from "../../client/view-models/review";

/**
 * One box, worn by both states, so a value that can be edited looks like the control it becomes
 * and the layout does not shift when it turns into one. A value that cannot be edited drops the
 * box rather than offering a field that refuses input.
 */
const FIELD = "w-full min-w-0 break-words rounded-lg border bg-[var(--color-bg-control)] px-2.5 py-1.5 text-13 leading-normal";

export type InlineEditableValueProps = {
  leaf: EditableLeafViewModel;
  isEditing: boolean;
  canEdit: boolean;
  onStartEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
};

export function InlineEditableValue({ leaf, isEditing, canEdit, onStartEdit, onCommit, onCancel }: InlineEditableValueProps) {
  const [draft, setDraft] = useState(leaf.isAbsent ? "" : leaf.display);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (wasEditing.current) {
      triggerRef.current?.focus();
    }
    wasEditing.current = isEditing;
  }, [isEditing, leaf.display, leaf.isAbsent]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommit(draft);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="min-w-0">
      {isEditing ? (
        <input
          ref={inputRef}
          aria-label={`Edit ${leaf.label}`}
          className={`${FIELD} border-[var(--color-border-focus)] text-[var(--color-fg)]`}
          onBlur={() => onCommit(draft)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          value={draft}
        />
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Edit ${leaf.label}, currently ${leaf.display}`}
          disabled={!canEdit || leaf.editStatus.status === "saving"}
          onClick={() => {
            setDraft(leaf.isAbsent ? "" : leaf.display);
            onStartEdit();
          }}
          className={`${FIELD} border-[var(--color-border-control)] text-left hover:border-[var(--color-border-control-raised)] disabled:border-transparent disabled:bg-transparent disabled:px-0 ${leaf.isAbsent ? "italic text-[var(--color-fg-muted)]" : "text-[var(--color-fg-body)]"}`}
        >
          {leaf.display}
        </button>
      )}
      {leaf.editStatus.status === "saving" ? (
        <span className="mt-2 flex items-center gap-1 text-11 text-[var(--color-fg-muted)]">
          <LoaderCircle aria-hidden="true" className="animate-spin-fast motion-reduce:animate-none" size={12} /> Saving
        </span>
      ) : null}
      {leaf.editStatus.status === "failed" ? <p className="mt-2 text-12 text-[var(--color-attention)]">{leaf.editStatus.message}</p> : null}
      {leaf.validationMessage ? <p className="mt-2 text-12 text-[var(--color-attention)]">{leaf.validationMessage}</p> : null}
    </div>
  );
}
