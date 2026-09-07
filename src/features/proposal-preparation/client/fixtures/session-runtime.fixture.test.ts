import { describe, expect, it } from "vitest";

import { fixtureSessionRuntimeRecord } from "./session-runtime.fixture";

describe("session runtime fixture", () => {
  it("produces an empty record, conversation included", () => {
    expect(fixtureSessionRuntimeRecord()).toMatchObject({
      thread: [],
      latestResult: null,
      workflow: null,
      conversation: null,
      inFlightTurn: null,
      hasStartedTurn: false,
      callFailure: null,
    });
  });

  it("applies overrides without dropping the untouched fields", () => {
    const record = fixtureSessionRuntimeRecord({ hasStartedTurn: true, unread: 2 });
    expect(record).toMatchObject({ hasStartedTurn: true, unread: 2, conversation: null });
  });
});
