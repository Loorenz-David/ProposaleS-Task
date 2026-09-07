import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { THREAD_FOLLOW_BOTTOM_THRESHOLD_PX } from "../components/agent/agent-thread-constants";
import { useThreadFollowState } from "./use-thread-follow-state";

function setScrollMetrics(element: HTMLDivElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: scrollHeight },
    clientHeight: { configurable: true, value: clientHeight },
  });
}

describe("useThreadFollowState", () => {
  it("covers the seven threshold and follow transitions", () => {
    const { result, rerender } = renderHook(
      ({ contentKey, suppress }) => useThreadFollowState(contentKey, suppress),
      { initialProps: { contentKey: "one", suppress: false } },
    );
    const container = document.createElement("div");
    setScrollMetrics(container, 500, 100);
    act(() => {
      result.current.containerRef.current = container;
      result.current.jumpToLatest();
    });
    expect(result.current.isFollowing).toBe(true);
    expect(container.scrollTop).toBe(500);

    act(() => {
      container.scrollTop = 400 - THREAD_FOLLOW_BOTTOM_THRESHOLD_PX;
      result.current.onScroll();
    });
    expect(result.current.isFollowing).toBe(true);

    act(() => {
      container.scrollTop = 400 - THREAD_FOLLOW_BOTTOM_THRESHOLD_PX - 1;
      result.current.onScroll();
    });
    expect(result.current.isFollowing).toBe(false);

    act(() => rerender({ contentKey: "two", suppress: false }));
    expect(container.scrollTop).toBe(319);
    expect(result.current.isFollowing).toBe(false);

    act(() => result.current.jumpToLatest());
    expect(result.current.isFollowing).toBe(true);
    expect(container.scrollTop).toBe(500);

    act(() => {
      container.scrollTop = 300;
      rerender({ contentKey: "three", suppress: true });
    });
    expect(container.scrollTop).toBe(300);

    act(() => rerender({ contentKey: "four", suppress: false }));
    expect(container.scrollTop).toBe(500);
  });
});
