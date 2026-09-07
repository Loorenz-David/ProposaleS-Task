export type AgentHeaderProps = { sessionCount: number };

export function AgentHeader({ sessionCount }: AgentHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-[18px] pb-[10px] pt-4">
      <span
        aria-hidden="true"
        className="grid size-[26px] place-items-center rounded-sm bg-[var(--color-accent-wash)] text-[var(--color-accent-ink-on-dark)]"
      >
        ✦
      </span>
      <span className="text-sm font-bold text-[var(--color-fg)]">Proposal Copilot</span>
      <span className="ml-auto font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">
        {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
      </span>
    </header>
  );
}
