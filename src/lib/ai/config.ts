import "server-only";

export const DEFAULT_RUN_BUDGETS = {
  // The measured language/tool steps plus an initial proposition and up to two corrective
  // attempts must fit while the run remains below the page's 300-second action duration.
  wallTimeMs: 240_000,
  maxToolCalls: 12,
  maxTokens: 60_000,
} as const;

// A live proposition has exceeded 45 seconds; 120 seconds gives one complex generation a bounded
// ceiling while the run budget still permits a corrective attempt.
export const AI_CALL_TIMEOUT_MS = 120_000;
