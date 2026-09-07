import { describe, expect, it } from "vitest";

import { temporaryFixtureSessionRuntimeRecord } from "../fixtures/session-runtime.temporary-fixture";
import { deriveTabStatus, toTabViewModel } from "./session-tab";

function statusFor(overrides: Parameters<typeof temporaryFixtureSessionRuntimeRecord>[0]) {
  return toTabViewModel(temporaryFixtureSessionRuntimeRecord(overrides));
}

describe("tab status precedence", () => {
  it("C1(a): in-flight record is working", () => {
    expect(statusFor({ isTurnInFlight: true })).toMatchObject({ status: "working", statusText: "Working" });
  });

  it("C1(b): draft reference record is created", () => {
    expect(statusFor({ hasDraftReference: true })).toMatchObject({ status: "created", statusText: "Created" });
  });

  it("C1(c): clarification result record needs you", () => {
    expect(statusFor({ latestDomainResultKind: "clarification" })).toMatchObject({
      status: "questions",
      statusText: "Needs you",
    });
  });

  it("C1(d): proposition record is ready", () => {
    expect(statusFor({ hasCurrentProposition: true })).toMatchObject({ status: "ready", statusText: "Ready" });
  });

  it("C1(e): started record with no higher-precedence condition is open", () => {
    expect(statusFor({ hasStartedTurn: true })).toMatchObject({ status: "idle", statusText: "Open" });
  });

  it("C1(f): never-started record is empty", () => {
    expect(statusFor({})).toMatchObject({ status: "empty", statusText: "Empty" });
  });
});

describe("tab status overlaps", () => {
  it("C2(a): in-flight beats draft reference", () => {
    expect(statusFor({ isTurnInFlight: true, hasDraftReference: true }).status).toBe("working");
  });

  it("C2(b): in-flight beats clarification", () => {
    expect(statusFor({ isTurnInFlight: true, latestDomainResultKind: "clarification" }).status).toBe("working");
  });

  it("C2(c): draft reference beats current proposition", () => {
    expect(statusFor({ hasDraftReference: true, hasCurrentProposition: true }).status).toBe("created");
  });

  it("C2(d): draft reference beats clarification", () => {
    expect(statusFor({ hasDraftReference: true, latestDomainResultKind: "clarification" }).status).toBe("created");
  });

  it("C2(e): clarification beats current proposition", () => {
    expect(statusFor({ latestDomainResultKind: "clarification", hasCurrentProposition: true }).status).toBe("questions");
  });

  it("C2(f): failed result with proposition is ready", () => {
    expect(statusFor({ latestDomainResultKind: "failed", hasCurrentProposition: true }).status).toBe("ready");
  });

  it("C2(g): failed result without proposition is open, not a seventh status", () => {
    expect(statusFor({ latestDomainResultKind: "failed", hasStartedTurn: true }).status).toBe("idle");
  });
});

describe("tab view model", () => {
  it("C3(a): exposes status text and a status-specific dot treatment", () => {
    const viewModel = statusFor({ hasCurrentProposition: true });
    expect(viewModel).toMatchObject({ title: "New proposal session", statusText: "Ready" });
  });

  it("C6(b): derives the status through the exported pure function", () => {
    const record = temporaryFixtureSessionRuntimeRecord({ hasStartedTurn: true });
    expect(deriveTabStatus(record)).toBe("idle");
    expect(toTabViewModel(record).status).toBe("idle");
  });
});
