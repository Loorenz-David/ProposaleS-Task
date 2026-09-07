import type { SessionRuntimeRecord, TabStatus } from "../../types/session";

const STATUS_TEXT: Record<TabStatus, string> = {
  working: "Working",
  created: "Created",
  questions: "Needs you",
  ready: "Ready",
  idle: "Open",
  empty: "Empty",
};

const STATUS_DOT_CLASS_NAME: Record<TabStatus, string> = {
  working: "bg-[var(--color-accent-ink-on-dark)] animate-pulse-dot-slow motion-reduce:animate-none",
  questions: "bg-[var(--color-attention)]",
  ready: "bg-[var(--color-positive)]",
  created: "bg-[var(--color-positive)]",
  empty: "bg-[var(--color-border-elevated)]",
  idle: "bg-[var(--color-fg-quiet)]",
};

export type TabViewModel = {
  title: string;
  status: TabStatus;
  statusText: string;
  dotClassName: string;
  unreadText: string | null;
};

export function deriveTabStatus(record: SessionRuntimeRecord): TabStatus {
  if (record.inFlightTurn !== null) return "working";
  if (record.workflow?.draftReference) return "created";
  if (record.latestResult?.status === "clarification") return "questions";
  if (record.workflow?.currentProposition) return "ready";
  if (record.hasStartedTurn) return "idle";
  return "empty";
}

export function toTabViewModel(record: SessionRuntimeRecord, isActive = false): TabViewModel {
  const status = deriveTabStatus(record);
  return {
    title: record.title,
    status,
    statusText: STATUS_TEXT[status],
    dotClassName: STATUS_DOT_CLASS_NAME[status],
    unreadText: record.unread > 0 && !isActive ? `${record.unread} unread` : null,
  };
}
