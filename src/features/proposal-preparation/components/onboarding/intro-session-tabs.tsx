import type { IntroTabStatus } from "./intro-content";

/**
 * A still illustration of the application's own session tab strip.
 *
 * Deliberately not a working tab system: no state, no roles, nothing focusable. It borrows
 * the real strip's surfaces, radii and status-dot vocabulary (`session-tab-strip.tsx`,
 * `client/view-models/session-tab.ts`) so a reviewer recognises the real thing the moment the
 * intro closes — but a reviewer reads it, they do not operate it.
 *
 * Each tab's state reaches assistive technology as text, never as the dot's colour alone.
 */

const STATUS_DOT_CLASS_NAME: Record<IntroTabStatus, string> = {
  working: "bg-[var(--color-accent-ink-on-dark)] animate-pulse-dot-slow motion-reduce:animate-none",
  questions: "bg-[var(--color-attention)]",
  ready: "bg-[var(--color-positive)]",
};

export type IntroSessionTabsProps = {
  tabs: { title: string; status: IntroTabStatus; statusText: string; isActive: boolean }[];
  newSessionLabel: string;
  caption: string;
};

export function IntroSessionTabs({ tabs, newSessionLabel, caption }: IntroSessionTabsProps) {
  return (
    <figure className="mt-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border-card)]">
        {/* Floored at the real strip's own 132px basis and allowed to scroll, exactly as
            `session-tab-strip.tsx` does. Squeezing three tabs into a narrow viewport truncated
            every title to a single character, which taught a reviewer nothing. */}
        <ul className="flex items-end gap-px overflow-x-auto border-b border-[var(--color-border-hairline)] bg-[var(--color-bg-tab-strip)] px-2 pl-3">
          {tabs.map((tab, index) => (
            <li
              key={index}
              className={`flex h-[30px] min-w-[132px] flex-[1_1_132px] items-center gap-[7px] rounded-t-lg pr-1 pl-[9px] text-12 font-semibold ${
                tab.isActive
                  ? "bg-[var(--color-bg-control-strong)] text-[var(--color-fg)] shadow-active-tab"
                  : "text-[var(--color-fg-muted)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-[7px] w-[7px] shrink-0 rounded-full ${STATUS_DOT_CLASS_NAME[tab.status]}`}
              />
              <span className="min-w-0 flex-1 truncate">{tab.title}</span>
              <span className="font-mono text-9-5 uppercase tracking-label text-[var(--color-fg-quiet)]">
                {tab.statusText}
              </span>
            </li>
          ))}
          <li
            aria-hidden="true"
            className="mb-0.5 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-lg leading-none text-[var(--color-fg-muted)]"
          >
            +
          </li>
        </ul>
        <div className="grid h-[74px] place-items-center bg-[var(--color-bg)] text-12-5 text-[var(--color-fg-quiet)]">
          Current proposal workspace
        </div>
      </div>
      <figcaption className="sr-only">
        {`A session strip with ${tabs.length} sessions — ${tabs
          .map((tab) => `${tab.title}, ${tab.statusText}${tab.isActive ? ", selected" : ""}`)
          .join("; ")} — and a ${newSessionLabel} control, above the current proposal workspace.`}
      </figcaption>
      <p aria-hidden="true" className="mt-3 text-12 text-[var(--color-fg-quiet)]">
        {caption}
      </p>
    </figure>
  );
}
