import { describe, expect, it } from "vitest";

import { temporaryFixtureSessionRuntimeRecord } from "./session-runtime.temporary-fixture";
import { toTabViewModel } from "../view-models/session-tab";

describe("temporary session runtime fixture", () => {
  it("C1(f): constructs the empty era-1 record used by the status table", () => {
    const record = temporaryFixtureSessionRuntimeRecord();
    expect(record).toMatchObject({
      title: "New proposal session",
      thread: [],
      latestResult: null,
      workflow: null,
      inFlightTurn: null,
      hasStartedTurn: false,
      unread: 0,
      composerDraft: "",
      retained: { workSurface: "fields", openedBlockContentId: null },
      clarificationPanel: "dismissed",
      callFailure: null,
    });
    expect(toTabViewModel(record).status).toBe("empty");
  });
});
