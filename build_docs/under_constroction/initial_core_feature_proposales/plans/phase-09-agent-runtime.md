---
plan: 9
phase: Agent runtime — tool definition, run loop, budgets, read tools
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 9 — Agent runtime: tool definition, run loop, budgets, read tools

## Goal

Create `src/lib/agent/` (`defineTool`, the bounded tool-calling loop over `AiClient` with the three budgets checked between calls, structured-output validation with one bounded retry, usage accumulation with the null rule) and the feature's two `read` tools (`search_content`, `get_content`) plus the read-only tool-set assertion.

**Not in this phase:** conversation context, retrieval record, message assembly (phase 10 — the runtime stays generic: it receives `initialMessages` and knows nothing about turns, sessions, or propositions); prompts, the preparation agent, services (phase 11).

## Read first

1. Master plan §6.3 (`RunFailureReason`), §6.4 (`ToolKind`, `ToolDefinition`, `ToolContext`, `RunBudgets`, `RunResult`, `RunDeps`), §6.5 (`MAX_OUTPUT_RETRIES`, `DEFAULT_RUN_BUDGETS`), §6.6 (`run`, the two tools).
2. Intention §17A.14 (all), §17A.13 (model output invalid; budget exhaustion is a domain result), §17A.8 (tool inputs are query strings; output schema owns strength; bounds), §4, §6 invariants 4, 5, 14.
3. Contracts: `08-agent-architecture.md` §1–§3, §5, §9, §10; `07-integrations.md` §7; `10-security-and-trust-boundaries.md` §3, §6, §8, §9; `11-testing-principles.md` §4 (deterministic tests).
4. Phases 7 and 8 Review logs.

## Dependencies (gate)

Phase 8 `APPROVED`.

## Files expected to change

`src/lib/agent/types.ts`, `define-tool.ts`, `define-tool.test.ts`, `run.ts`, `run.test.ts` · `src/features/proposal-preparation/server/tools/search-content.tool.ts`, `get-content.tool.ts`, `tools.test.ts`, `server/tools/index.ts` (`PREPARATION_TOOLS`, `assertReadOnlyToolSet`) — 9 new files.

## Implementation tasks (ordered)

1. `define-tool.ts`: `defineTool({ name, description, kind, input, output, execute })` returning `{ …, descriptor(): ToolDescriptor, invoke(rawInput, ctx) }` where `invoke` `safeParse`s the input (failure → `{ ok: false, error: { code: "invalid_arguments", issues } }` without calling `execute`), calls `execute`, `safeParse`s the output (failure → `{ ok: false, error: { code: "invalid_tool_output" } }`).
2. `run.ts`: `run({ system, initialMessages, tools, outputSchema, budgets = DEFAULT_RUN_BUDGETS, readOnly = true }, deps)`; when `readOnly`, `assertReadOnlyToolSet(tools)` first; loop: check wall time and tokens **before** each `generateStep` (`timeoutMs = min(AI_CALL_TIMEOUT_MS, remaining wall time)`), accumulate usage (null-propagating), on `tool_calls` check `maxToolCalls` **before each** `invoke` (increment before `execute`), append tool results as labeled data, continue; on `final` → `outputSchema.safeParse`; failure → append the issue paths as a labeled `user` message and retry up to `MAX_OUTPUT_RETRIES`; then `failed` reason `model_output_invalid` with paths only. Budget exhaustion → `failed` with `budget`; **no `output` key** on failed results. Log events `agent.run.start/step/tool/end` with ids and counts only.
3. `tools/search-content.tool.ts`: kind `read`; input `{ query: z.string().trim().min(1).max(MAX_SEARCH_QUERY_CHARS) }` — **the constant imported from `schemas/content-candidate.ts`, never a literal `200`** (master §6.5; amended 2026-09-06 by the phase-7 projection fold, owner card 1); output `{ candidates: z.array(contentCandidateSchema) }`; `execute` = `rankCandidates(input.query, ctx.catalog, ctx.language ?? throw)` — when `ctx.language` is null the tool returns an `invalid_arguments`-class error `language_unresolved` so the model asks or derives first. `tools/get-content.tool.ts`: input `{ variationId: positiveInt64StringSchema }` imported from phase 5; output `{ item: candidate-shaped item | null }` from `ctx.catalog`.
4. `tools/index.ts`: `PREPARATION_TOOLS = [searchContentTool, getContentTool] as const`; `assertReadOnlyToolSet(tools)` throws `Error("tool set must contain only read tools: <names>")` on any non-`read` kind.
5. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

Scripted steps come from `createScriptedAiClient`; clocks are injected.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | invalid arguments never execute | `invoke({ query: 5 }, ctx)` on `search_content` with a spy `execute` | `{ ok: false, error: { code: "invalid_arguments", issues } }`; spy not called | — | §17A.8 (tool inputs), 08 §3 |
| C1(b) | invalid tool output | a test tool whose `execute` returns `{ wrong: 1 }` | `{ ok: false, error: { code: "invalid_tool_output" } }` | — | §17A.8 (output schema is the only place strength exists) |
| C1(c) | descriptor carries no execute | `tool.descriptor()` | keys `["name","description","inputJsonSchema"]` | — | 08 §3 |
| C2(a) | tool set is read-only | `PREPARATION_TOOLS` | every `kind === "read"`; `assertReadOnlyToolSet` does not throw | — | M3, crit 3 |
| C2(b) | the assertion can see a write tool | `[...PREPARATION_TOOLS, defineTool({ kind: "mutate", … })]` | `assertReadOnlyToolSet` throws naming the tool | — | M3 (rule 15 proof) |
| C2(c) | the loop refuses a non-read set | `run({ tools: <set with a mutate tool>, readOnly: true })` | rejects before any model call (`ai.calls.length === 0`) | MUT-09-1 `run.ts` · delete the `assertReadOnlyToolSet` call → C2(c) red | M3 |
| C3(a) | tool-call budget | script: every step returns one tool call; `maxToolCalls: 3` | `failed`, `failure.budget === "tool_calls"`, `toolCalls.length === 3`, `ai.calls.length === 3` | — | M15, §17A.14 |
| C3(b) | wall-time budget | `now` advances by `wallTimeMs` after the first step | `failed`, `budget === "wall_time"`, `ai.calls.length === 1` | — | M15 |
| C3(c) | token budget | step usage `totalTokens` greater than `maxTokens` | `failed`, `budget === "tokens"`, no second model call | — | M15 |
| C3(d) | draft discarded | any of the above | `"output" in result === false` | — | M15, §17A.14 |
| C3(e) | check before dispatch | `maxToolCalls: 1`, a step with two tool calls | `execute` invoked exactly once; `failed` `tool_calls` | MUT-09-2 `run.ts` · tool dispatch · check the budget after `invoke` → C3(e) red | §17A.14 |
| C3(f) | per-call timeout ceiling | `wallTimeMs` remaining 500 ms | `generateStep` called with `timeoutMs <= 500` | — | §17A.14 |
| C4(a) | usage on output | two steps with usage 10/5/15 and 20/10/30 | `usage` deep-equals `{ 30, 15, 45 }` | — | M15, crit 14 |
| C4(b) | usage on failure | budget failure after two steps | usage summed over both | — | M15 |
| C4(c) | null propagates | second step `inputTokens: null` | `usage.inputTokens === null`; the other fields summed | MUT-09-3 `run.ts` · accumulator · treat null as 0 → C4(c) red | §17A.14 (absent is not zero) |
| C5(a) | one bounded retry | first `final` fails the schema; second passes | `status === "output"`; `ai.calls.length === 2`; the second call's last message contains the issue paths and not the raw model text | — | §17A.13 |
| C5(b) | still invalid → failed | both `final` outputs invalid, model text `MODEL-TEXT-SENTINEL` | `failed`, `reason === "model_output_invalid"`, `issues[i].path` are `string[]`; `MODEL-TEXT-SENTINEL` absent from `JSON.stringify(result)` | MUT-09-4 `run.ts` · failure assembly · include the raw output → C5(b) red | §17A.13, M6 |
| C5(c) | retries bounded | `MAX_OUTPUT_RETRIES` invalid outputs | `ai.calls.length === MAX_OUTPUT_RETRIES + 1` | — | §17A.13 |
| C6(a) | search tool uses the ctx catalog | ctx with `FIXTURE_CATALOG`, fake proposales client in scope | output deep-equals `rankCandidates(query, ctx.catalog, ctx.language)`; `fake.calls` unchanged | — | §17A.8 |
| C6(b) | get tool | known / unknown `variationId` | item / `null` | — | §17A.8 |
| C6(c) | output shape | | candidate objects have exactly the `contentCandidateSchema` keys (no `createdAt`, no `images`) | — | 08 §3, 10 §6 |
| C6(d) | language required | `ctx.language = null` | `search_content` returns error `language_unresolved`; `execute` body not reached | — | §17A.8 (language) |

Criteria: 6 (C1–C6), 22 rows (a table line is one row; a lettered span counts its letters). Named mutations: 4.

## Notes

- The loop is ours (not the SDK's `stopWhen`): budgets must be checked between calls and tool execution counted per `execute` invocation.
- `tool_output_invalid` ends the run `failed` with that reason (added to `RunFailureReason` in master plan §6.3).
- Projection gate: mandatory (rank 12).
- **Inherited from the phase-7 projection fold (2026-09-06, owner card 1).** The human search box and this tool share one query bound, `MAX_SEARCH_QUERY_CHARS` (master §6.5), owned by `schemas/content-candidate.ts` and created in phase 7. This phase's projection must add a criterion row asserting that the tool's input bound **is that constant** — a second literal `200` here would let the two search paths drift apart silently, which is exactly the defect the owner's decision exists to prevent.

## Review log

*(append-only)*
