import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AGENT_PANE_DEFAULT_PX,
  AGENT_PANE_MAX_PX,
  AGENT_PANE_MIN_PX,
  MAIN_PANE_MIN_PX,
} from "../components/workspace/constants";
import { clampDividerWidth, getEffectiveDividerMax, useDividerWidth } from "./use-divider-width";

describe("C3: divider clamp contract", () => {
  it("C3(a): requested width below the agent minimum resolves to the agent minimum", () => {
    expect(clampDividerWidth(AGENT_PANE_MIN_PX - 1, 1440)).toBe(AGENT_PANE_MIN_PX);
  });

  it("C3(b): requested width above the effective maximum resolves to the effective maximum", () => {
    expect(clampDividerWidth(AGENT_PANE_MAX_PX + 100, 1440)).toBe(
      getEffectiveDividerMax(1440),
    );
  });

  it("C3(c): when minima conflict, the agent minimum wins", () => {
    const containerWidth = MAIN_PANE_MIN_PX + AGENT_PANE_MIN_PX - 1;
    expect(getEffectiveDividerMax(containerWidth)).toBe(AGENT_PANE_MIN_PX);
    expect(clampDividerWidth(0, containerWidth)).toBe(AGENT_PANE_MIN_PX);
  });

  it("C3(d): a smaller container re-clamps an already requested width", () => {
    const { result, rerender } = renderHook(({ width }) => useDividerWidth(width), {
      initialProps: { width: 1440 },
    });
    act(() => result.current.setWidth(AGENT_PANE_MAX_PX));
    expect(result.current.width).toBe(AGENT_PANE_MAX_PX);
    rerender({ width: 780 });
    expect(result.current.width).toBe(getEffectiveDividerMax(780));
  });

  it("C3(e): the contract is expressed through named constants", () => {
    expect(AGENT_PANE_MIN_PX).toBeLessThanOrEqual(AGENT_PANE_DEFAULT_PX);
    expect(AGENT_PANE_DEFAULT_PX).toBeLessThanOrEqual(AGENT_PANE_MAX_PX);
    expect(MAIN_PANE_MIN_PX).toBeGreaterThan(0);
  });
});
