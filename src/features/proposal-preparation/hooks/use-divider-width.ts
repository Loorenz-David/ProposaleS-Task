"use client";

import { useCallback, useState } from "react";

import {
  AGENT_PANE_DEFAULT_PX,
  AGENT_PANE_MAX_PX,
  AGENT_PANE_MIN_PX,
  MAIN_PANE_MIN_PX,
} from "../components/workspace/constants";

export function getEffectiveDividerMax(containerWidth: number): number {
  return Math.max(AGENT_PANE_MIN_PX, Math.min(AGENT_PANE_MAX_PX, containerWidth - MAIN_PANE_MIN_PX));
}

export function clampDividerWidth(requested: number, containerWidth: number): number {
  const effectiveMax = getEffectiveDividerMax(containerWidth);
  return Math.round(Math.min(effectiveMax, Math.max(AGENT_PANE_MIN_PX, requested)));
}

export function useDividerWidth(containerWidth: number) {
  const [requestedWidth, setRequestedWidth] = useState(AGENT_PANE_DEFAULT_PX);
  const effectiveContainerWidth =
    containerWidth > 0 ? containerWidth : AGENT_PANE_MAX_PX + MAIN_PANE_MIN_PX;
  const effectiveMax = getEffectiveDividerMax(effectiveContainerWidth);
  const width = clampDividerWidth(requestedWidth, effectiveContainerWidth);

  const setWidth = useCallback(
    (requested: number) => setRequestedWidth(requested),
    [],
  );

  const reset = useCallback(() => setRequestedWidth(AGENT_PANE_DEFAULT_PX), []);

  return { width, effectiveMax, setWidth, reset };
}
