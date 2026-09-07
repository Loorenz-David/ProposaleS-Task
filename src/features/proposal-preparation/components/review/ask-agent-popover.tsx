"use client";

import * as Popover from "@radix-ui/react-popover";
import { useRef, useState, type KeyboardEvent } from "react";

export type AskAgentPopoverProps = {
  fieldLabel: string;
  state: { status: "idle" } | { status: "submitting" } | { status: "failed"; message: string };
  onSubmit: (text: string) => void;
};

export function AskAgentPopover({ fieldLabel, state, onSubmit }: AskAgentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = () => {
    if (!text.trim() || state.status === "submitting") return;
    onSubmit(text);
    setOpen(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };
  return (
    <Popover.Root modal open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" aria-label={`Ask the agent about ${fieldLabel}`} className="grid size-8 shrink-0 place-items-center rounded-md text-[var(--color-fg-quietest)] hover:bg-[var(--color-bg-control-hover)] hover:text-[var(--color-fg)]">
          <span aria-hidden="true">✦</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          collisionPadding={12}
          sideOffset={6}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className="z-50 w-[min(340px,calc(100vw-24px))] rounded-4xl border border-[var(--color-border-elevated)] bg-[var(--color-bg-card)] p-4 text-[var(--color-fg)] shadow-popover"
        >
          <label htmlFor={`ask-${fieldLabel}`} className="text-13 font-semibold">Ask the agent about {fieldLabel}</label>
          <input
            ref={inputRef}
            id={`ask-${fieldLabel}`}
            className="mt-3 w-full rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-control)] px-3 py-2 text-13"
            disabled={state.status === "submitting"}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            value={text}
          />
          {state.status === "failed" ? <p role="alert" className="mt-2 text-12 text-[var(--color-attention)]">{state.message}</p> : null}
          <div className="mt-4 flex justify-end gap-2">
            <Popover.Close asChild><button type="button" className="rounded-md px-3 py-2 text-12 text-[var(--color-fg-secondary)]">Cancel</button></Popover.Close>
            <button type="button" disabled={!text.trim() || state.status === "submitting"} onClick={submit} className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-12 font-semibold text-[var(--color-bg)] disabled:opacity-50">
              {state.status === "submitting" ? "Asking…" : "Ask Agent"}
            </button>
          </div>
          <Popover.Arrow className="fill-[var(--color-border-elevated)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
