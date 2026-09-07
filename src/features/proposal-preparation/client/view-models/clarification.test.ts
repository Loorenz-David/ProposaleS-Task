import { describe, expect, it } from "vitest";

import { fixtureClarificationAnswered, fixtureClarificationBatch, fixtureClarificationSingle } from "../fixtures/clarification.fixture";
import { fixtureSessionRuntimeRecord } from "../fixtures/session-runtime.fixture";
import { fixtureWorkflowState } from "../fixtures/workflow-state.fixture";
import { toClarificationAnswersInput, toClarificationPanelViewModel } from "./clarification";
import { readFileSync } from "node:fs";
import path from "node:path";

function recordWith(clarification: typeof fixtureClarificationBatch, panel: "open" | "dismissed" = "open") {
  // Questions travel on the result; answers travel on the state. The panel reads both.
  return fixtureSessionRuntimeRecord({
    latestResult: { status: "clarification", questions: clarification.questions },
    workflow: fixtureWorkflowState({ clarification }),
    clarificationPanel: panel,
  });
}

describe("clarification view model", () => {
  it("returns null outside clarification", () => {
    expect(toClarificationPanelViewModel(fixtureSessionRuntimeRecord())).toBeNull();
  });

  it("derives single and batch modes from open questions", () => {
    expect(toClarificationPanelViewModel(recordWith(fixtureClarificationSingle))).toMatchObject({ mode: "single", openCount: 1, isOpen: true });
    expect(toClarificationPanelViewModel(recordWith(fixtureClarificationBatch))).toMatchObject({ mode: "batch", openCount: 3 });
  });

  it("preserves received order and answer state", () => {
    const viewModel = toClarificationPanelViewModel(recordWith(fixtureClarificationAnswered, "dismissed"));
    expect(viewModel?.questions.map((question) => question.state)).toEqual(["answered", "skipped", "open"]);
    expect(viewModel?.isOpen).toBe(false);
  });

  it("R4.1–R4.8: maps only explicit answers and skips in received-question order", () => {
    const drafts = [
      { questionId: "q3", state: "answered" as const, text: "  1,25 / 2026-01-02 <literal>" },
      { questionId: "q1", state: "untouched" as const, text: "" },
      { questionId: "q2", state: "skipped" as const, text: "" },
      { questionId: "foreign", state: "skipped" as const, text: "" },
      { questionId: "empty", state: "answered" as const, text: "" },
    ];
    expect(toClarificationAnswersInput(drafts, ["q2", "q3", "q1", "empty", "never"])).toEqual({
      answers: [
        { questionId: "q2", answer: { kind: "skip" } },
        { questionId: "q3", answer: { kind: "answer", text: "  1,25 / 2026-01-02 <literal>" } },
      ],
    });
  });

  it("R4.9: has no client-side value transformation in the submission mapper", () => {
    const source = readFileSync(path.join(__dirname, "clarification.ts"), "utf8");
    expect(source).not.toMatch(/trim\(|toLocale|parseFloat|Number\(|Date\(/);
  });
});
