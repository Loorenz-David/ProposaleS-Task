import type { CallFailureViewModel } from "../../client/view-models/failure";

export type TurnFailureNoticeProps = {
  viewModel: CallFailureViewModel;
  onRetry: () => void;
  onDismiss: () => void;
};

export function TurnFailureNotice({ viewModel, onRetry, onDismiss }: TurnFailureNoticeProps) {
  return (
    <div role="alert" className="mx-[18px] rounded-xl border border-[var(--color-attention)]/50 bg-[var(--color-attention-wash)] p-3 text-13 text-[var(--color-fg-body)]">
      <p className="font-semibold">{viewModel.message}</p>
      {viewModel.detail ? <p className="mt-1 text-[var(--color-fg-secondary)]">{viewModel.detail}</p> : null}
      <div className="mt-3 flex gap-2">
        {viewModel.canRetry ? (
          <button className="rounded-md border border-[var(--color-border-elevated)] px-3 py-1.5 font-semibold" onClick={onRetry} type="button">
            Try again
          </button>
        ) : null}
        <button className="rounded-md px-3 py-1.5 text-[var(--color-fg-secondary)]" onClick={onDismiss} type="button">
          Dismiss
        </button>
      </div>
    </div>
  );
}
