export type ApprovalActionProps = {
  acknowledgment: { statementId: string; wording: string };
  unresolvedSummary: string | null;
  isPending: boolean;
  onApprove: () => void;
};

export function ApprovalAction({ acknowledgment, unresolvedSummary, isPending, onApprove }: ApprovalActionProps) {
  const descriptionId = `approval-${acknowledgment.statementId}`;
  return (
    <div className="rounded-4xl border border-[var(--color-border-elevated)] bg-[var(--color-bg-control)] p-5">
      <p id={descriptionId} className="text-12 leading-relaxed text-[var(--color-fg-secondary)]">
        {acknowledgment.wording} {unresolvedSummary ? `${unresolvedSummary}.` : "No unresolved information remains."} Nothing has been sent. Approval creates a draft in Proposales.
      </p>
      <button type="button" aria-describedby={descriptionId} disabled={isPending} onClick={onApprove} className="mt-4 w-full rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-[var(--color-bg)] hover:bg-[var(--color-accent-hover-button)] disabled:opacity-50">
        Approve and create draft
      </button>
    </div>
  );
}
