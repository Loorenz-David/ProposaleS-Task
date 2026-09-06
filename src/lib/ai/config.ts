import "server-only";

export const DEFAULT_RUN_BUDGETS = {
  wallTimeMs: 60_000,
  maxToolCalls: 12,
  maxTokens: 60_000,
} as const;

export const AI_CALL_TIMEOUT_MS = 45_000;
