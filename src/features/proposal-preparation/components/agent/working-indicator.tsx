export type WorkingIndicatorProps = { label: string };

export function WorkingIndicator({ label }: WorkingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 py-1 text-13 text-[var(--color-fg-muted)]" role="status">
      <span aria-hidden="true" className="flex gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 animate-pulse-dot rounded-full bg-[var(--color-fg-muted)] motion-reduce:animate-none"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </span>
      <span>{label}</span>
    </div>
  );
}
