"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { THREAD_FOLLOW_BOTTOM_THRESHOLD_PX } from "../components/agent/agent-thread-constants";

export function useThreadFollowState(contentKey: string, suppressFollow: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programmaticScroll = useRef(false);
  const [isFollowing, setIsFollowing] = useState(true);

  const pinToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    programmaticScroll.current = true;
    container.scrollTop = container.scrollHeight;
    programmaticScroll.current = false;
    setIsFollowing(true);
  }, []);

  const onScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || programmaticScroll.current) return;
    const distance = container.scrollHeight - container.clientHeight - container.scrollTop;
    setIsFollowing(distance <= THREAD_FOLLOW_BOTTOM_THRESHOLD_PX);
  }, []);

  useLayoutEffect(() => {
    if (isFollowing && !suppressFollow) pinToBottom();
  }, [contentKey, isFollowing, pinToBottom, suppressFollow]);

  return { containerRef, isFollowing, onScroll, jumpToLatest: pinToBottom };
}
