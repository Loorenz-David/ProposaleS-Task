"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { EditableLeafViewModel } from "../../client/view-models/review";

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
          className="-my-2 min-w-0 w-full rounded-md border border-[var(--color-border-focus)] bg-[var(--color-bg-control)] px-2 py-2 text-sm text-[var(--color-fg)]"
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
          className={`max-w-full break-words text-left text-sm underline decoration-dashed underline-offset-4 disabled:no-underline ${leaf.isAbsent ? "italic text-[var(--color-fg-muted)]" : "text-[var(--color-fg-body)]"}`}
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
