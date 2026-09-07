import type { ExtractablePill } from "./interaction-pill";

export type ThoughtPayloadProps = {
  payload: ExtractablePill<"thought">["payload"];
  id: string;
};

export function ThoughtPayload({ payload, id }: ThoughtPayloadProps) {
  return (
    <div id={id} className="border-t border-[var(--color-border-hairline)] px-3 pb-3 pt-3 text-12 leading-relaxed text-[var(--color-fg-secondary)]">
      {payload.rationale ? <p className="text-[var(--color-fg-body)]">{payload.rationale}</p> : null}
      {payload.assumptions.length > 0 ? (
        <div className="mt-3">
          <p className="font-mono text-10 uppercase tracking-label text-[var(--color-fg-quiet)]">Assumptions</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {payload.assumptions.map((assumption) => (
              <li key={`${assumption.path.join(".")}:${assumption.note}`}>{assumption.note}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {payload.warnings.length > 0 ? (
        <div className="mt-3">
          <p className="font-mono text-10 uppercase tracking-label text-[var(--color-attention)]">Check before approval</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {payload.warnings.map((warning) => (
              <li key={`${warning.kind}:${warning.text}`}>{warning.text}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
