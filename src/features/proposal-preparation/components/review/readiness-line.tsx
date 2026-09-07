import type { ReadinessViewModel } from "../../client/view-models/review";

export type ReadinessLineProps = { viewModel: ReadinessViewModel };

export function ReadinessLine({ viewModel }: ReadinessLineProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-12 text-[var(--color-fg-secondary)]">
      <span aria-hidden="true" className="size-2 rounded-full bg-[var(--color-attention)]" />
      <span>{viewModel.summary}</span>
      <span className="sr-only">{viewModel.nothingSentStatement}</span>
    </div>
  );
}
