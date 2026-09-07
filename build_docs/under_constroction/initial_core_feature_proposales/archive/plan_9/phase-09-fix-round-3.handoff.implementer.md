---
plan: plans/phase-09-agent-runtime.md
role: implement
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 9 fix round 3 handoff

Implemented the two requested test-only repairs. The failure-path `agent.run.tool` record is now asserted by value, and C5(c) uses `MAX_OUTPUT_RETRIES + 1`. No production change remains.

## ⚠ OWNER DECISIONS REQUIRED (0)

None.

## Gate and closing stamp

- Phase plan header: `CHANGES_REQUESTED`; master tracker row 9: `CHANGES_REQUESTED`.
- Counter line verified: **7 criteria / 38 rows / 39 named mutations**; C7(f) contains “Both branches are asserted”.
- Intention gate: `RATIFIED`. Predecessor gate: phase 8 `APPROVED`.
- Pre-edit baseline: clean tree on `main`; `npm test` → **31 files / 421 tests passed**, failing IDs **none (0)**.
- Closing L4 stamp on the completed implementation: `npm test` → **31 files / 421 tests passed**; `npm run typecheck` → exit 0; `npm run lint` → exit 0.
- Closing tree identity: base `HEAD eb8f9a2d45af330e42c3ea4800ad24d0c2b30668` plus only the declared test and handoff changes; `run.ts` remains at the required digest below.

## Changes

1. C7(f) uses the `unknown_tool` dispatch miss as its failure driver. The emitted record printed from the run was:

   `{ runId: "run-1", traceId: "trace-1", toolCallId: "tc-failure", name: "missing_tool", ok: false, durationMs: 0 }`

   The test asserts that complete object with `toEqual`, including both the false outcome and the zero duration.
2. C5(c) now asserts `dependencies.ai.calls` has length `MAX_OUTPUT_RETRIES + 1`, rather than hardcoding `2`.

## Coverage map (all 38 criterion rows)

Each row below names the test that discharges it and whether the assertion has the row’s required shape.

- C1(a) invalid arguments / no execution and array-index path coercion → `define-tool.test.ts` “C1(a) rejects invalid arguments without executing the tool” plus “C1(a) coerces an array-index issue path to strings”; exact error, spy behavior, and `items/0/answer` path: **yes**.
- C1(b) invalid tool output → `define-tool.test.ts` “C1(b) validates tool output”; exact error code: **yes**.
- C1(c) descriptor fields → `define-tool.test.ts` “C1(c) exposes only the provider-neutral descriptor fields”; exact keys: **yes**.
- C1(d) real descriptor schemas/bound → `define-tool.test.ts` “C1(d) emits real input JSON schemas with the shared query bound”; both descriptors and exact bound: **yes**.
- C2(a) exact read-only tool set → `tools.test.ts` “C2(a) is exactly the read-only preparation tool set”; exact names/kinds and no throw: **yes**.
- C2(b) write-tool rejection → `tools.test.ts` “C2(b) rejects a write tool by name”; named throw: **yes**.
- C2(c) run rejects non-read set before model → `run.test.ts` “C2(c) refuses a non-read tool set before the model call”; zero model calls: **yes**.
- C2(d) boundary scan and derived perimeter → `tools.test.ts` “C2(d) scans the complete agent perimeter with one shared predicate”; derived set and forbidden forms: **yes**.
- C2(e) scanner instrument proof → `tools.test.ts` “C2(e) proves the shared scanner sees every forbidden form”; all forms and control: **yes**.
- C3(a) tool-call budget → `run.test.ts` “C3(a) enforces the tool-call budget and C3(d) discards the draft”; failure, budget, three exact calls: **yes**.
- C3(b) wall-time budget → `run.test.ts` “C3(b) checks wall time at the exact boundary”; boundary failure and one call: **yes**.
- C3(c) token budget → `run.test.ts` “C3(c) checks the token budget before the next model call”; failure and no second call: **yes**.
- C3(d) draft discarded → `run.test.ts` “C3(a) enforces the tool-call budget and C3(d) discards the draft”; no output key: **yes**.
- C3(e) dispatch budget pre-check → `run.test.ts` “C3(e) checks the tool-call budget before each dispatch”; one execution and tool-call failure: **yes**.
- C3(f) per-call timeout ceiling → `run.test.ts` “C3(f) binds the per-call timeout to the remaining wall time when that is the smaller term”; exact SDK-constant and `500` remaining-time cases: **yes**.
- C3(i) positive timeout floor → `run.test.ts` “C3(i) keeps a positive timeout when the clock moves after the budget check”; exact `1`: **yes**.
- C3(g) wall-time precedence → `run.test.ts` “C3(g) reports wall time first when two budgets are exhausted”; exact budget: **yes**.
- C3(h) live remaining budget → `run.test.ts` “C3(h) gives tools a fresh remaining budget”; second value is lower and below initial: **yes**.
- C4(a) usage on output → `run.test.ts` “C4(a) accumulates usage on a successful output”; exact sum: **yes**.
- C4(b) usage on failure → `run.test.ts` “C4(b) accumulates usage on failure”; exact sum: **yes**.
- C4(c) null usage propagation → `run.test.ts` “C4(c) propagates an unreported usage field as null”; null and summed fields: **yes**.
- C4(d) separate numeric token counter → `run.test.ts` “C4(d) keeps a separate numeric token budget counter”; failure budget and null reported usage: **yes**.
- C5(a) bounded retry / serialized paths → `run.test.ts` “C5(a) retries invalid structured output once with issue paths”; two exact serialized path lists: **yes**.
- C5(d) model text absent → `run.test.ts` “C5(d) does not send or report model text”; sentinel absence: **yes**.
- C5(b) invalid output failure path → `run.test.ts` “C5(b) fails after the bounded invalid-output retries with string paths”; exact nested path: **yes**.
- C5(c) retry bound → `run.test.ts` “C5(c) stops at one retry and does not exhaust the scripted client”; `MAX_OUTPUT_RETRIES + 1` and remaining script: **yes**.
- C6(a) search query/language forwarding → `tools.test.ts` “C6(a) forwards the query and language to ranking”; three concrete tuples: **yes**.
- C6(b) shared content-detail predicate → `tools.test.ts` “C6(b) gets known, unknown, missing-title, and blank-title content”; four exact outcomes: **yes**.
- C6(c) output shape → `tools.test.ts` “C6(c) validates the output shape and strips vendor-only fields”; exact candidate keys: **yes**.
- C6(d) language required for both tools → `tools.test.ts` “C6(d) requires a resolved language before executing”; both errors and no catalog access: **yes**.
- C6(e) shared query bound → `tools.test.ts` “C6(e) shares the human query bound”; exact boundary acceptance/rejection for both schemas: **yes**.
- C7(a) correlated labeled tool results → `run.test.ts` “C7(a) appends correlated tool results as labeled messages”; exact assistant/tool messages: **yes**.
- C7(b) bad tool call continues → `run.test.ts` “C7(b) returns a bad tool call to the model and continues”; exact structured issues: **yes**.
- C7(c) invalid tool output ends run → `run.test.ts` “C7(c) ends on invalid tool output”; exact failure and call count: **yes**.
- C7(d) operational ids/counts/no content → `run.test.ts` “C7(d) logs operational ids and counts without model text”; ids, non-zero count, step count, sentinel: **yes**.
- C7(e) caller request reaches model → `run.test.ts` “C7(e) sends the run’s system prompt, initial messages, tool descriptors and output schema to the model”; four deep/value assertions: **yes**.
- C7(f) success and failure tool records/duration → `run.test.ts` “C7(f) logs each tool name and injected duration”; success full `toEqual`, failure full `toEqual`, end duration: **yes**.
- C7(g) unknown tool truthful continuation → `run.test.ts` “C7(g) reports a missing tool truthfully and continues”; exact result and continuation: **yes**.

Reverse trace: every test in the phase test files is represented above. This round added no orphan test and no candidate criterion.

## Mutation ledger

The round declares exactly **2** mutations; executed, red, and restored counts are each **2**.

| Mutation | Site and probe | Command / observed red | Restoration |
|---|---|---|---|
| MUT-09-38 | `src/lib/agent/run.ts:149`, failure-branch `agent.run.tool` call site; delete that call | `npx vitest run src/lib/agent/run.test.ts -t 'C7\\(f\\)'`; C7(f) failed because the expected failure record was `undefined` | Reinserted the call; `run.ts` digest restored to `f8fc4de0b36c2de823c901dc114c59b1f2960bbf8ec604835b99c5042d1607df` |
| MUT-09-39 | `src/lib/agent/run.ts:149`, failure-branch `ok: false`; change to `ok: true` | `npx vitest run src/lib/agent/run.test.ts -t 'C7\\(f\\)'`; C7(f) failed with received `ok: true` versus expected `ok: false` | Changed it back; same restoration digest `f8fc4de0b36c2de823c901dc114c59b1f2960bbf8ec604835b99c5042d1607df` |

Declared **2** / executed **2** / red **2** / restored **2**.

## Perimeter and closeout

- Shipped write perimeter: `src/lib/agent/run.test.ts` and this handoff.
- Probe-only file touched, applied and reverted: `src/lib/agent/run.ts`; it is not part of the shipped diff and ends at the required digest.
- No other files were touched. No production `.ts` file was edited as a shipped change.
- No plan defect found. The plan’s C7(f) failure-branch gap and N3 hardcoded count were exactly the scoped defects.
- Documentation impact review: no current-state feature or integration documentation became false; this required handoff is the only documentation artifact added.

Checkpoint commit is required by the prompt and is labelled `CHECKPOINT (not approved): phase 09 fix round 3`.
