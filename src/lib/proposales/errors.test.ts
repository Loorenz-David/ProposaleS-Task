import { describe, expect, it } from "vitest";

import {
  GENERIC_UPSTREAM_ERROR_MESSAGE,
  MAX_UPSTREAM_ISSUES,
  fromUpstream,
} from "@/lib/proposales/errors";

describe("Proposales error translation", () => {
  it("C1(c) maps the ordered upstream issue prefix", async () => {
    const fixture = (await import("./fixtures/error-400-issues.json")).default;
    const error = fromUpstream({
      status: 400,
      bodyText: JSON.stringify(fixture),
      parsedBody: fixture,
      operation: "listContent",
      kind: "http",
    });
    const expected = fixture.error.issues.slice(0, MAX_UPSTREAM_ISSUES).map((issue, index) => ({
      path: issue.path.map(String),
      message: index === MAX_UPSTREAM_ISSUES - 1 ? GENERIC_UPSTREAM_ERROR_MESSAGE : issue.message,
    }));

    expect(error.details).toMatchObject({ reason: "bad_request", retryable: false, status: 400 });
    expect(error.details?.issues).toEqual(expected);
  });
});
