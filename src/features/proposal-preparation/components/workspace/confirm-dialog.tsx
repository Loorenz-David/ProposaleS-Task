"use client";

import { useEffect, useId, useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={dialogRef}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(480px,calc(100vw-32px))] rounded-4xl border border-[var(--color-border-elevated)] bg-[var(--color-bg-card)] p-0 text-[var(--color-fg)] shadow-popover backdrop:bg-[var(--color-bg)]/80"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-xl font-semibold">{title}</h2>
        <p id={descriptionId} className="mt-3 text-13 leading-relaxed text-[var(--color-fg-secondary)]">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl border border-[var(--color-border-control-raised)] px-4 py-2 text-13 font-semibold">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-13 font-bold text-[var(--color-bg)]">{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
