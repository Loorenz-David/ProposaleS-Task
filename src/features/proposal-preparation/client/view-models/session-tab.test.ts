import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import { temporaryFixtureSessionRuntimeRecord } from "../fixtures/session-runtime.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../fixtures/proposition.temporary-fixture";
import { deriveTabStatus, toTabViewModel } from "./session-tab";

function statusFor(overrides: Parameters<typeof temporaryFixtureSessionRuntimeRecord>[0]) {
  return toTabViewModel(temporaryFixtureSessionRuntimeRecord(overrides));
}

describe("tab status precedence", () => {
  it("C1(a): in-flight record is working", () => {
    expect(statusFor({ inFlightTurn: { turnId: "turn", kind: "brief" } })).toMatchObject({ status: "working", statusText: "Working" });
  });

  it("C1(b): draft reference record is created", () => {
    expect(statusFor({ workflow: { draftReference: { proposalUuid: "proposal", editorUrl: "https://example.invalid" } } })).toMatchObject({ status: "created", statusText: "Created" });
  });

  it("C1(c): clarification result record needs you", () => {
    expect(statusFor({ latestResult: { status: "clarification", clarification: { questions: [], answers: [] } } })).toMatchObject({
      status: "questions",
      statusText: "Needs you",
    });
  });

  it("C1(d): proposition record is ready", () => {
    expect(statusFor({ workflow: { currentProposition: temporaryFixturePropositionV1 } })).toMatchObject({ status: "ready", statusText: "Ready" });
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
    expect(statusFor({ inFlightTurn: { turnId: "turn", kind: "brief" }, workflow: { draftReference: { proposalUuid: "proposal", editorUrl: "https://example.invalid" } } }).status).toBe("working");
  });

  it("C2(b): in-flight beats clarification", () => {
    expect(statusFor({ inFlightTurn: { turnId: "turn", kind: "brief" }, latestResult: { status: "clarification", clarification: { questions: [], answers: [] } } }).status).toBe("working");
  });

  it("C2(c): draft reference beats current proposition", () => {
    expect(statusFor({ workflow: { draftReference: { proposalUuid: "proposal", editorUrl: "https://example.invalid" }, currentProposition: temporaryFixturePropositionV1 } }).status).toBe("created");
  });

  it("C2(d): draft reference beats clarification", () => {
    expect(statusFor({ workflow: { draftReference: { proposalUuid: "proposal", editorUrl: "https://example.invalid" } }, latestResult: { status: "clarification", clarification: { questions: [], answers: [] } } }).status).toBe("created");
  });

  it("C2(e): clarification beats current proposition", () => {
    expect(statusFor({ latestResult: { status: "clarification", clarification: { questions: [], answers: [] } }, workflow: { currentProposition: temporaryFixturePropositionV1 } }).status).toBe("questions");
  });

  it("C2(f): failed result with proposition is ready", () => {
    expect(statusFor({ latestResult: { status: "failed", failure: { reason: "tool_output_invalid" } }, workflow: { currentProposition: temporaryFixturePropositionV1 } }).status).toBe("ready");
  });

  it("C2(g): failed result without proposition is open, not a seventh status", () => {
    expect(statusFor({ latestResult: { status: "failed", failure: { reason: "tool_output_invalid" } }, hasStartedTurn: true }).status).toBe("idle");
  });
});

describe("tab view model", () => {
  it("C3(a): exposes status text and a status-specific dot treatment", () => {
    const viewModel = statusFor({ workflow: { currentProposition: temporaryFixturePropositionV1 } });
    expect(viewModel).toMatchObject({ title: "New proposal session", statusText: "Ready" });
  });

  it("C6(b): derives the status through the exported pure function", () => {
    const record = temporaryFixtureSessionRuntimeRecord({ hasStartedTurn: true });
    expect(deriveTabStatus(record)).toBe("idle");
    expect(toTabViewModel(record).status).toBe("idle");
  });

  it("adds unread text only for an inactive tab", () => {
    const record = temporaryFixtureSessionRuntimeRecord({ unread: 3 });
    expect(toTabViewModel(record).unreadText).toBe("3 unread");
    expect(toTabViewModel(record, true).unreadText).toBeNull();
    const storeSource = readFileSync(path.join(__dirname, "../../hooks/use-workspace-session-store.ts"), "utf8");
    const stripSource = readFileSync(path.join(__dirname, "../../components/session-tabs/session-tab-strip.tsx"), "utf8");
    expect(storeSource).not.toContain("attention:");
    expect(stripSource).not.toContain(".attention");
  });
});
