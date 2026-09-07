import type { ThreadTurnViewModel } from "../../client/view-models/thread";
import type { PillIntent } from "../../client/view-models/pill";

export type AgentThreadTurnProps = {
  turn: ThreadTurnViewModel;
  onPillIntent: (intent: PillIntent) => void;
};

export function AgentThreadTurn({ turn, onPillIntent }: AgentThreadTurnProps) {
  if (turn.owner === "human") {
    return (
      <article aria-label={turn.scope ? `You said, regarding ${turn.scope}` : "You said"} className="flex justify-end">
        <span className="sr-only">You said</span>
        <p className="max-w-[88%] whitespace-pre-wrap text-pretty rounded-3xl border border-[var(--color-border-control-raised)] bg-[var(--color-bg-control-strong)] px-[14px] py-[11px] text-sm leading-relaxed text-[var(--color-fg-bubble)]">
          {turn.text}
        </p>
      </article>
    );
  }

  const label = turn.scope ? `Agent said, regarding ${turn.scope}` : "Agent said";
  if ("failure" in turn) {
    return (
      <article aria-label={label}>
        <span className="sr-only">Agent said</span>
        {turn.scope ? <span className="mb-2 inline-flex rounded-xs border border-[var(--color-border-control)] bg-[var(--color-bg-control)] px-[9px] py-1 text-11 font-semibold text-[var(--color-fg-muted)]">re: {turn.scope}</span> : null}
        <p className="text-sm font-semibold leading-loose text-[var(--color-attention)]">{turn.failure.headline}</p>
        {turn.failure.detail ? <p className="mt-1 text-13 text-[var(--color-fg-secondary)]">{turn.failure.detail}</p> : null}
        {turn.failure.issuePaths.length > 0 ? <p className="mt-1 text-12 text-[var(--color-fg-muted)]">Check: {turn.failure.issuePaths.join(", ")}</p> : null}
      </article>
    );
  }

  return (
    <article aria-label={label}>
      <span className="sr-only">Agent said</span>
      {turn.scope ? <span className="mb-2 inline-flex rounded-xs border border-[var(--color-border-control)] bg-[var(--color-bg-control)] px-[9px] py-1 text-11 font-semibold text-[var(--color-fg-muted)]">re: {turn.scope}</span> : null}
      <p className="text-pretty text-sm leading-loose text-[var(--color-fg-body)]">{turn.prose}</p>
      {turn.pills.length > 0 ? (
        <div className="mt-[10px] flex flex-col gap-1.5">
          {turn.pills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                if (pill.kind === "action") onPillIntent(pill.intent);
              }}
              className="min-h-[34px] truncate rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-control)] px-3 text-left text-12-5 font-semibold text-[var(--color-fg-control)]"
            >
              {pill.label}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
