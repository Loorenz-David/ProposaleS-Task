import type { ThreadViewModel } from "../../client/view-models/thread";
import type { PillIntent } from "../../client/view-models/pill";
import { useThreadFollowState } from "../../hooks/use-thread-follow-state";
import { AgentThreadTurn } from "./agent-thread-turn";
import { WorkingIndicator } from "./working-indicator";

export type AgentThreadProps = {
  viewModel: ThreadViewModel;
  isWorking: boolean;
  workingLabel: string;
  suppressFollow: boolean;
  onPillIntent: (intent: PillIntent) => void;
};

export function AgentThread({ viewModel, isWorking, workingLabel, suppressFollow, onPillIntent }: AgentThreadProps) {
  const contentKey = `${viewModel.turns.at(-1)?.entryId ?? "empty"}:${isWorking}`;
  const { containerRef, isFollowing, onScroll, jumpToLatest } = useThreadFollowState(
    contentKey,
    suppressFollow,
  );
  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        aria-busy={isWorking || undefined}
        aria-live="polite"
        aria-relevant="additions"
        className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-[18px] pb-[18px] pt-1"
        onScroll={onScroll}
        role="log"
      >
        {viewModel.turns.map((turn) => (
          <AgentThreadTurn key={turn.entryId} onPillIntent={onPillIntent} turn={turn} />
        ))}
        {isWorking ? <WorkingIndicator label={workingLabel} /> : null}
      </div>
      {!isFollowing ? (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill border border-[var(--color-border-elevated)] bg-[var(--color-bg-control-strong)] px-3 py-2 text-12 font-semibold text-[var(--color-fg)] shadow-popover"
        >
          Jump to latest
        </button>
      ) : null}
    </div>
  );
}
