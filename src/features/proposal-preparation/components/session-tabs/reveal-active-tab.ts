import { ACTIVE_TAB_REVEAL_MARGIN_PX } from "./session-tabs-constants";

export type RevealGeometry = {
  tabOffsetLeft: number;
  tabWidth: number;
  scrollLeft: number;
  clientWidth: number;
  margin: number;
};

export function revealActiveTabScrollLeft({
  tabOffsetLeft,
  tabWidth,
  scrollLeft,
  clientWidth,
  margin,
}: RevealGeometry): number {
  const visibleLeft = scrollLeft + margin;
  const visibleRight = scrollLeft + clientWidth - margin;
  const tabRight = tabOffsetLeft + tabWidth;

  if (tabOffsetLeft < visibleLeft) return Math.max(0, tabOffsetLeft - margin);
  if (tabRight > visibleRight) return Math.max(0, tabRight - clientWidth + margin);
  return scrollLeft;
}
