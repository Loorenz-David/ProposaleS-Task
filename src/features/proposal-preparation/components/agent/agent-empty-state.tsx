export type AgentEmptyStateProps = { onStarterSelect: (text: string) => void };

const STARTERS = [
  "Draft from a messy client brief",
  "Turn meeting notes into a proposal",
  "Help me shape a commercial offer",
];

export function AgentEmptyState({ onStarterSelect }: AgentEmptyStateProps) {
  return (
    <div className="my-auto py-8">
      <p className="text-15 font-semibold leading-relaxed text-[var(--color-fg)]">
        Paste notes and I will draft a proposal — or just tell me what to do in here.
      </p>
      <p className="mt-3 text-13-5 leading-loose text-[var(--color-fg-muted)]">
        Use a brief, an email, or rough meeting notes. Nothing reaches Proposales until you approve
        the draft.
      </p>
      <div aria-label="Brief starters" className="mt-[14px] flex flex-col items-start gap-[7px]" role="group">
        {STARTERS.map((starter) => (
          <button
            key={starter}
            type="button"
            onClick={() => onStarterSelect(starter)}
            className="max-w-full break-words rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-control)] px-[13px] py-[9px] text-left text-12-5 font-semibold text-[var(--color-fg-control)] hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}
