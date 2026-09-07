import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { temporaryFixtureSessionRuntimeRecord } from "../client/fixtures/session-runtime.temporary-fixture";
import { temporaryFixturePropositionV1 } from "../client/fixtures/proposition.temporary-fixture";
import { useStatusAnnouncement } from "./use-status-announcement";

describe("useStatusAnnouncement", () => {
  beforeEach(() => vi.useFakeTimers());

  it("R7.7: debounces working to ready into one ready announcement", () => {
    const record = temporaryFixtureSessionRuntimeRecord();
    const { result, rerender } = renderHook(
      ({ current }) => useStatusAnnouncement([current], current.id),
      { initialProps: { current: record } },
    );
    rerender({ current: { ...record, workflow: { currentProposition: temporaryFixturePropositionV1 }, inFlightTurn: { turnId: "t", kind: "brief" } } });
    rerender({ current: { ...record, workflow: { currentProposition: temporaryFixturePropositionV1 }, hasStartedTurn: true } });
    act(() => vi.advanceTimersByTime(800));
    expect(result.current).toContain("ready");
    expect(result.current).not.toContain("working");
  });

  it("R7.8: refusal is carried without replacing the reorder channel", () => {
    const record = temporaryFixtureSessionRuntimeRecord();
    const { result } = renderHook(() => useStatusAnnouncement([record], record.id, "Cannot close"));
    expect(result.current).toBe("Cannot close");
  });
});
