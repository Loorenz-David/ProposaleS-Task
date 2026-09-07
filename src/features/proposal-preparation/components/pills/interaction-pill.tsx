"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { PillIntent, PillViewModel } from "../../client/view-models/pill";
import { AskPayload } from "./ask-payload";
import { ThoughtPayload } from "./thought-payload";

export type { PillIntent } from "../../client/view-models/pill";
export type ExtractablePill<Kind extends PillViewModel["kind"]> = Extract<
  PillViewModel,
  { kind: Kind }
>;
export type InteractionPillProps = {
  viewModel: PillViewModel;
  onIntent: (intent: PillIntent) => void;
};

const GLYPH = { thought: "✳", ask: "?", link: "↗", action: "▸" } as const;

function PillLabel({ viewModel }: { viewModel: PillViewModel }) {
  return (
    <>
      <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-bg-control-strong)] text-12 text-[var(--color-accent-ink-on-dark)]">
        {GLYPH[viewModel.kind]}
      </span>
      <span data-elided className="min-w-0 flex-1 truncate text-left">{viewModel.label}</span>
      {viewModel.meta ? <span className="shrink-0 font-mono text-10 text-[var(--color-fg-quiet)]">{viewModel.meta}</span> : null}
    </>
  );
}

export function InteractionPill({ viewModel, onIntent }: InteractionPillProps) {
  const disclosure = viewModel.kind === "thought" || viewModel.kind === "ask";
  const [expanded, setExpanded] = useState(disclosure ? viewModel.defaultExpanded : false);
  const payloadId = `${viewModel.id}:payload`;
  const shell = "w-full overflow-hidden rounded-lg border border-[var(--color-border-control)] bg-[var(--color-bg-control)]";
  const row = "flex min-h-[34px] w-full items-center gap-2 px-[5px] pr-3 text-12-5 font-semibold text-[var(--color-fg-control)] hover:bg-[var(--color-bg-control-hover)]";

  if (viewModel.kind === "link") {
    return (
      <div className={shell}>
        <a className={row} href={viewModel.href} target="_blank" rel="noopener noreferrer" aria-label={viewModel.accessibleName}>
          <PillLabel viewModel={viewModel} />
        </a>
      </div>
    );
  }
  if (viewModel.kind === "action") {
    return (
      <div className={shell}>
        <button className={row} type="button" aria-label={viewModel.accessibleName} onClick={() => onIntent(viewModel.intent)}>
          <PillLabel viewModel={viewModel} />
          <ChevronRight aria-hidden="true" className="shrink-0 text-[var(--color-fg-quiet)]" size={15} />
        </button>
      </div>
    );
  }
  return (
    <div className={shell}>
      <button
        className={row}
        type="button"
        aria-controls={payloadId}
        aria-expanded={expanded}
        aria-label={viewModel.accessibleName}
        onClick={() => setExpanded((value) => !value)}
      >
        <PillLabel viewModel={viewModel} />
        <ChevronDown aria-hidden="true" className={`shrink-0 text-[var(--color-fg-quiet)] ${expanded ? "rotate-180" : ""}`} size={15} />
      </button>
      {expanded && viewModel.kind === "thought" ? <ThoughtPayload id={payloadId} payload={viewModel.payload} /> : null}
      {expanded && viewModel.kind === "ask" ? <AskPayload id={payloadId} onIntent={onIntent} payload={viewModel.payload} /> : null}
    </div>
  );
}
