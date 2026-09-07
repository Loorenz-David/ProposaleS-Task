import { describe, expect, it } from "vitest";

import { temporaryFixtureClarificationAnswered, temporaryFixtureClarificationBatch, temporaryFixtureClarificationSingle } from "../fixtures/clarification.temporary-fixture";
import { temporaryFixtureSessionRuntimeRecord } from "../fixtures/session-runtime.temporary-fixture";
import { toClarificationPanelViewModel } from "./clarification";

function recordWith(clarification: typeof temporaryFixtureClarificationBatch, panel: "open" | "dismissed" = "open") {
  return temporaryFixtureSessionRuntimeRecord({
    latestResult: { status: "clarification", clarification },
    clarificationPanel: panel,
  });
}

describe("clarification view model", () => {
  it("returns null outside clarification", () => {
    expect(toClarificationPanelViewModel(temporaryFixtureSessionRuntimeRecord())).toBeNull();
  });

  it("derives single and batch modes from open questions", () => {
    expect(toClarificationPanelViewModel(recordWith(temporaryFixtureClarificationSingle))).toMatchObject({ mode: "single", openCount: 1, isOpen: true });
    expect(toClarificationPanelViewModel(recordWith(temporaryFixtureClarificationBatch))).toMatchObject({ mode: "batch", openCount: 3 });
  });

  it("preserves received order and answer state", () => {
    const viewModel = toClarificationPanelViewModel(recordWith(temporaryFixtureClarificationAnswered, "dismissed"));
    expect(viewModel?.questions.map((question) => question.state)).toEqual(["answered", "skipped", "open"]);
    expect(viewModel?.isOpen).toBe(false);
  });
});
