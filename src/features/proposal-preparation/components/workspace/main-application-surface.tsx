import type { MainSurfaceState } from "../../types/presentation";
import { ProposalPreparationIdleSurface } from "../idle/proposal-preparation-idle-surface";

export function MainApplicationSurface({ state }: { state: MainSurfaceState }) {
  return (
    <main
      id="main-content"
      aria-labelledby="proposal-preparation-title"
      tabIndex={-1}
      data-surface-state={state}
      className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[var(--color-bg)]"
    >
      <ProposalPreparationIdleSurface />
    </main>
  );
}
