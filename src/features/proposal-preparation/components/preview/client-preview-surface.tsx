import type { PreviewViewModel } from "../../client/view-models/preview";

export type ClientPreviewSurfaceProps = { viewModel: PreviewViewModel };

export function ClientPreviewSurface({ viewModel }: ClientPreviewSurfaceProps) {
  return (
    <section
      aria-label="Client preview (approximate)"
      className="rounded-4xl bg-[var(--color-paper)] text-[var(--color-paper-ink)] shadow-panel [&_:focus-visible]:outline-[var(--color-paper-ink)]"
    >
      <p className="border-b border-[var(--color-paper-rule-strong)] px-5 py-3 text-11 leading-normal text-[var(--color-paper-ink-meta)]">
        {viewModel.disclosure}
      </p>
      <div className="min-h-[170px] bg-[linear-gradient(160deg,var(--color-paper-hero-start),var(--color-paper-hero-end))] px-6 py-10 text-[var(--color-fg)] sm:px-10">
        <span className="inline-flex rounded-pill bg-[var(--color-accent)] px-3 py-1 font-mono text-10 uppercase tracking-label text-[var(--color-bg)]">
          Approximate
        </span>
        <h2 className="mt-5 max-w-[600px] break-words text-4xl font-semibold tracking-tight">
          {viewModel.title ?? "Your proposal will appear here"}
        </h2>
      </div>
      <div className="mx-auto max-w-[600px] px-6 py-10 sm:px-8">
        {viewModel.isEmpty ? (
          <p className="text-sm leading-loose text-[var(--color-paper-ink-body)]">
            The proposition does not yet contain client-facing content. Add a title, introduction,
            or line item before creating the draft.
          </p>
        ) : (
          <>
            {viewModel.narrative ? <p className="text-base leading-loose text-[var(--color-paper-ink-body)]">{viewModel.narrative}</p> : null}
            {viewModel.items.length > 0 ? (
              <ul className="mt-10 divide-y divide-[var(--color-paper-rule)] border-y border-[var(--color-paper-rule-strong)]">
                {viewModel.items.map((item, index) => (
                  <li className="py-6" key={`${item.title}:${index}`}>
                    <h3 className="break-words text-xl font-semibold text-[var(--color-paper-ink)]">{item.title}</h3>
                    {item.description ? <p className="mt-2 text-sm leading-relaxed text-[var(--color-paper-ink-meta)]">{item.description}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-8 border-t border-[var(--color-paper-rule-strong)] pt-5 text-12 text-[var(--color-paper-ink-meta)]">
              {viewModel.pricingStatement}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
