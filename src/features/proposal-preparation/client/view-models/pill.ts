import type { TemporaryDomainResult } from "../../types/temporary-turn";
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

export function toPillViewModels(result: TemporaryDomainResult, entryId: string): PillViewModel[] {
  if (result.status === "proposition") {
    const rationale = result.proposition.agentRationale.known
      ? result.proposition.agentRationale.value
      : null;
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
          assumptions: result.proposition.assumptions.map((assumption) => ({ ...assumption })),
          warnings: result.proposition.warnings.map((warning) => ({
            kind: warning.kind,
            text: warning.text,
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
    const answerById = new Map(
      result.clarification.answers.map((answer) => [answer.questionId, answer.answer]),
    );
    const questions = result.clarification.questions.map((question) => {
      const answer = answerById.get(question.questionId);
      return {
        questionId: question.questionId,
        text: question.text,
        state: !answer ? ("open" as const) : answer.kind === "skip" ? ("skipped" as const) : ("answered" as const),
        answerText: answer?.kind === "answer" ? answer.text : null,
      };
    });
    const openCount = questions.filter((question) => question.state === "open").length;
    return [
      {
        id: `${entryId}:ask`,
        kind: "ask",
        label: "Questions to resolve",
        meta: `${openCount} open`,
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
        href: result.draftResult.editorUrl,
      },
    ];
  }

  return [];
}
