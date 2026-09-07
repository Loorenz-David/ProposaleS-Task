import type { ClarificationAnswer } from "../../schemas/clarification";
import type { DomainResult } from "../../schemas/turn-result";
import { readLeaf } from "./leaf";
export type PillIntent = { kind: "reopen-questions" } | { kind: "focus-review" };

export type PillKind = "thought" | "ask" | "link" | "action";
export type PillViewModel =
  | {
      id: string;
      kind: "thought";
      label: string;
      meta: string | null;
      accessibleName: string;
      defaultExpanded: false;
      payload: {
        rationale: string | null;
        assumptions: Array<{ path: string[]; note: string }>;
        warnings: Array<{ kind: string; text: string }>;
      };
    }
  | {
      id: string;
      kind: "ask";
      label: string;
      meta: string | null;
      accessibleName: string;
      defaultExpanded: boolean;
      payload: {
        questions: Array<{
          questionId: string;
          text: string;
          state: "open" | "answered" | "skipped";
          answerText: string | null;
        }>;
      };
    }
  | {
      id: string;
      kind: "link";
      label: string;
      meta: string | null;
      accessibleName: string;
      href: string;
    }
  | {
      id: string;
      kind: "action";
      label: string;
      meta: string | null;
      accessibleName: string;
      intent: PillIntent;
    };

/**
 * `answers` is passed in rather than read off the result: the clarification result member carries
 * only the questions, and the answers live on the workflow state (§1.2). An empty list therefore
 * means "no answers yet", which is exactly what an unanswered round is.
 */
export function toPillViewModels(
  result: DomainResult,
  entryId: string,
  answers: ClarificationAnswer[] = [],
): PillViewModel[] {
  if (result.status === "proposition") {
    const rationaleLeaf = readLeaf<string>(result.proposition.agentRationale);
    const rationale = rationaleLeaf.known ? rationaleLeaf.value : null;
    return [
      {
        id: `${entryId}:thought`,
        kind: "thought",
        label: "How this was prepared",
        meta: `${result.proposition.assumptions.length} assumptions`,
        accessibleName: "How this proposition was prepared",
        defaultExpanded: false,
        payload: {
          rationale,
          assumptions: result.proposition.assumptions.map((assumption) => ({
            path: assumption.path,
            note: assumption.note.value,
          })),
          warnings: result.proposition.warnings.map((warning) => ({
            kind: warning.kind,
            text: warning.text.value,
          })),
        },
      },
      {
        id: `${entryId}:action`,
        kind: "action",
        label: "Review the proposition",
        meta: null,
        accessibleName: "Review the proposition",
        intent: { kind: "focus-review" },
      },
    ];
  }

  if (result.status === "clarification") {
    const answerById = new Map(answers.map((answer) => [answer.questionId, answer.answer]));
    const questions = result.questions.map((question) => {
      const answer = answerById.get(question.questionId);
      return {
        questionId: question.questionId,
        text: question.text,
        state: !answer ? ("open" as const) : answer.kind === "skip" ? ("skipped" as const) : ("answered" as const),
        answerText: answer?.kind === "answer" ? answer.text : null,
      };
    });
    const openCount = questions.filter((question) => question.state === "open").length;
    // The budget note is appended rather than replacing the count: the questions still stand, and
    // why the agent stopped asking is a separate fact the reader needs (§12A.9).
    const meta = result.budgetExhausted
      ? `${openCount} open · the agent reached its ${result.budgetExhausted.budget} limit`
      : `${openCount} open`;
    return [
      {
        id: `${entryId}:ask`,
        kind: "ask",
        label: "Questions to resolve",
        meta,
        accessibleName: `${openCount} open questions`,
        defaultExpanded: openCount > 0,
        payload: { questions },
      },
      {
        id: `${entryId}:action`,
        kind: "action",
        label: "Answer the questions",
        meta: null,
        accessibleName: "Answer the questions",
        intent: { kind: "reopen-questions" },
      },
    ];
  }

  if (result.status === "created" || result.status === "recovered") {
    return [
      {
        id: `${entryId}:link`,
        kind: "link",
        label: "Open in Proposales",
        meta: result.status === "recovered" ? "Recovered draft" : "Draft created",
        accessibleName: "Open the draft in Proposales (opens in a new tab)",
        href: result.draft.editorUrl,
      },
    ];
  }

  return [];
}
