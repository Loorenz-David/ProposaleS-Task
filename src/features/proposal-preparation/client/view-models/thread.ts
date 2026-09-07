import type { InFlightTurn, SessionRuntimeRecord } from "../../types/session";
import { toRunFailureTurn } from "./failure";
import { toPillViewModels, type PillViewModel } from "./pill";

export type ThreadTurnViewModel =
  | { entryId: string; owner: "human"; text: string; scope: string | null }
  | { entryId: string; owner: "agent"; scope: string | null; prose: string; pills: PillViewModel[] }
  | {
      entryId: string;
      owner: "agent";
      scope: string | null;
      failure: { headline: string; detail: string | null; issuePaths: string[] };
    };
export type ThreadViewModel = { turns: ThreadTurnViewModel[]; isEmpty: boolean };

const RESULT_PROSE = {
  clarification: "I need a few details before I can prepare the proposition.",
  proposition: "I prepared a proposition for your review.",
  created: "Your draft is ready in Proposales.",
  recovered: "I found the draft that was already created in Proposales.",
} as const;

export function toThreadViewModel(record: SessionRuntimeRecord): ThreadViewModel {
  const turns = record.thread.map((entry): ThreadTurnViewModel => {
    if (entry.kind === "human") {
      return { entryId: entry.entryId, owner: "human", text: entry.text, scope: entry.scope };
    }
    if (entry.result.status === "failed") {
      return {
        entryId: entry.entryId,
        owner: "agent",
        scope: entry.scope,
        failure: toRunFailureTurn(entry.result.failure),
      };
    }
    return {
      entryId: entry.entryId,
      owner: "agent",
      scope: entry.scope,
      prose: RESULT_PROSE[entry.result.status],
      pills: toPillViewModels(entry.result, entry.entryId, record.workflow?.clarification?.answers ?? []),
    };
  });
  return { turns, isEmpty: turns.length === 0 };
}

export function toWorkingLabel(turn: InFlightTurn): string {
  if (turn.kind === "brief") return "Drafting proposal";
  if (turn.kind === "answers") return "Reading your answers";
  if (turn.kind === "edit") return "Saving your edit";
  if (turn.kind === "revision") return "Revising draft";
  return "Creating in Proposales";
}
