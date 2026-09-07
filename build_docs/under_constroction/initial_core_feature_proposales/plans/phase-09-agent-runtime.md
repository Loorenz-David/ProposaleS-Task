---
plan: 9
phase: Agent runtime — tool definition, run loop, budgets, read tools
state: CHANGES_REQUESTED
date: 2026-09-07
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

`src/lib/agent/types.ts`, `define-tool.ts`, `define-tool.test.ts`, `run.ts`, `run.test.ts` · `src/features/proposal-preparation/server/tools/search-content.tool.ts`, `get-content.tool.ts`, `tools.test.ts`, `server/tools/index.ts` (`PREPARATION_TOOLS`, `assertReadOnlyToolSet`) — 9 new files · `test/helpers/agent-boundary-scan.ts` (the shared purity instrument, C2(d–e)) · **`src/lib/ai/scripted.ts` and `src/lib/ai/scripted.test.ts` (existing, additive)** — the fake drops `generateStep`'s options argument, so C3(f) cannot be written against the fake this plan mandates until it records them (D23). Also `src/features/proposal-preparation/schemas/content-candidate.ts` (existing, additive: `contentDetailSchema`, D07). **13 implementation paths, not 9.**

## Implementation tasks (ordered)

1. `define-tool.ts`: `defineTool({ name, description, kind, input, output, requires?, execute })` returning `{ …, descriptor(): ToolDescriptor, invoke(rawInput, ctx) }`. `invoke` `safeParse`s the input (failure → `{ ok: false, error: { code: "invalid_arguments", issues } }` without calling `execute`), then runs `requires?(ctx)` (a non-null return → `{ ok: false, error: { code } }`, still without calling `execute`), then calls `execute`, then `safeParse`s the output (failure → `{ ok: false, error: { code: "invalid_tool_output" } }`). **`invoke` does not catch a throw from `execute`** — a thrown value is a programming error and propagates (contract `04` §6, D05); this is deliberate and no row asserts it. `descriptor().inputJsonSchema` is `z.toJSONSchema(input, { io: "input" })`; `requires` exists because `ctx.language` is **not** input and no other mechanism could refuse a call on a context precondition (D06).
2. `run.ts`: `run({ system, initialMessages, tools, outputSchema, toolContext, budgets = DEFAULT_RUN_BUDGETS, readOnly = true }, deps)` — `toolContext: Omit<ToolContext, "remainingBudget">`, without which the loop cannot invoke a tool at all (D02); `run` computes `remainingBudget` **fresh before each `invoke`**. It always passes `outputJsonSchema` to `generateStep`, or `generateText` falls back to its text spec and every final arrives as a string, making C5 trivially true (D11). when `readOnly`, `assertReadOnlyToolSet(tools)` first; loop: check wall time and tokens **before** each `generateStep` (`timeoutMs = min(AI_CALL_TIMEOUT_MS, remaining wall time)`), accumulate usage (null-propagating), on `tool_calls` check `maxToolCalls` **before each** `invoke` (increment before `execute`), append the assistant `toolCalls` message and then the `tool` `results` message correlated by `toolCallId` as labeled data (master §6.4's three closed `AgentMessage` forms), continue. A failed `invoke` splits by code (D04): `invalid_arguments` and any `requires` code are **appended as that tool call's result and the loop continues** (contract `08` §3 requires a structured tool error to be returned to the model); `invalid_tool_output` **ends the run** `failed` with `reason: "tool_output_invalid"`. The wall-time comparison is `elapsed >= wallTimeMs`, so `timeoutMs = min(AI_CALL_TIMEOUT_MS, remaining)` is never non-positive (D24). The **token budget** is compared against a counter that treats an unreported `totalTokens` as `0`, while the reported `usage` stays null-propagating for §17A.14 — one unreported step must not switch the budget off (D03); on `final` → `outputSchema.safeParse`; failure → append the issue paths as a labeled `user` message and retry up to `MAX_OUTPUT_RETRIES`; then `failed` reason `model_output_invalid` with paths only. Budget exhaustion → `failed` with `budget`; **no `output` key** on failed results. Log events `agent.run.start/step/tool/end` with ids and counts only.
3. `tools/search-content.tool.ts`: kind `read`; input `{ query: z.string().trim().min(1).max(MAX_SEARCH_QUERY_CHARS) }` — **the constant imported from `schemas/content-candidate.ts`, never a literal `200`** (master §6.5; amended 2026-09-06 by the phase-7 projection fold, owner card 1); output `{ candidates: z.array(contentCandidateSchema) }`; `execute` = `rankCandidates(input.query, ctx.catalog, ctx.language ?? throw)` — when `ctx.language` is null the tool returns an `invalid_arguments`-class error `language_unresolved` so the model asks or derives first. `tools/get-content.tool.ts`: input `{ variationId: positiveInt64StringSchema }` imported from phase 5; output `{ item: candidate-shaped item | null }` from `ctx.catalog`.
4. `tools/index.ts`: `PREPARATION_TOOLS = [searchContentTool, getContentTool] as const`; `assertReadOnlyToolSet(tools)` throws `Error("tool set must contain only read tools: <names>")` on any non-`read` kind.
5. Named mutations, revert, stamp, checkpoint commit.

### Fix round 1 tasks (added by the coordinator's fold of review round 1, 2026-09-07)

Round 1's production code is otherwise sound and stays byte-identical outside these six edits. Every
one of them was named by an authority — a contract clause, a closed registry, or the owner — not by
taste.

6. **`run.ts` observability (B1, C7(f)).** Emit `agent.run.tool` per invocation with
   `{ runId, traceId, toolCallId, name, ok, durationMs }` and add `durationMs` to `agent.run.end`.
   Durations come from `deps.now()` — the injected clock, never `Date`, which the C2(d) scan
   forbids inside the agent boundary. Ids, names and outcomes only: `08` §10 forbids arguments and
   `10` §7 forbids model text, and C7(d)'s sentinel assertion already stands over every record.
7. **`run.ts` unknown-tool disposition (owner card 1, S8, C7(g)).** On a `toolByName` miss, append
   `{ error: { code: "unknown_tool", name: <the requested name> } }` and continue. Add
   `unknown_tool` to `ToolErrorCode` in `types.ts` — **4 members, still closed** — and a fourth
   failure arm to `ToolInvokeResult`, annotated as produced by `run`'s dispatch miss and **never by
   `invoke`**. Master §6.3 and §6.4 are already amended; do not re-derive them.
8. **`run.ts` duplicate budget check (S5).** Delete `run.ts:131`. `budgetFailure()` at `:129`
   already performs that exact comparison at `:87`, so `:131` is unreachable as a return and
   MUT-09-2 is ambiguous between two sites — deleting either one alone left the suite green.
   Re-run MUT-09-2 against the single remaining site.
9. **`run.ts` timeout floor (S9, C3(i)).** Keep `Math.max(1, …)`; it is load-bearing and this task
   only records it. Task 2's D24 sentence is corrected in C3(b) and C3(i) — do not "simplify" the
   floor away on the strength of the old reasoning.
10. **`server/domain/` shared content detail (S6, C6(b)).** Extract `toContentDetail(item, language)`
    into `server/domain/`, sharing the title predicate and the truncation bound with
    `rankCandidates`. `get-content.tool.ts`'s `execute` then calls it and holds no business rule,
    per `08` §3. This widens the perimeter by one existing file (`server/domain/rank-candidates.ts`
    or a sibling) — **the only production file outside round 1's perimeter that this round may
    touch**, and only to export what both callers now share.
11. **Test-side repairs with no production change:** C1(a) second case, C2(d) directory-derived
    scan plus its planted-file proof, C3(a) recorded-call assertions, C5(a) serialized paths,
    C6(a) three cases, C6(d) `get_content` case, C7(b) `issues`, C7(d) counts, plus N2 (C6(a)'s
    `arrayContaining` does not constrain the set), N3 (C5(c) hardcodes `2` and `4` where the row
    says `MAX_OUTPUT_RETRIES + 1` and `+ 3`) and N5 (C4(a)'s fixture is `1/1/2 + 20/10/30` where
    the row says `10/5/15 + 20/10/30`; align the test to the row, not the row to the test).

**Not in this round.** `readOnly: false` has no row (N4) and gets one in phase 11, when a tool set
is first instantiated with it. `assertReadOnlyToolSet`'s two forced copies stay as they are —
phase-15 candidate 6. The phase-7 purity guard and the `@/lib/ai` barrel's negative surface stay
untouched — phase-15 candidates 4 and 5.

## Acceptance criteria

Scripted steps come from `createScriptedAiClient`; clocks are injected. **Every fixture below is a
shape the system actually produces** — §9.1 rule 18, and the reason three of the original rows were
rewritten: their fixtures were shapes `createAiClient` cannot emit.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | invalid arguments never execute, and the path is coerced | **two cases.** (i) `invoke({ query: 5 }, ctx)` on `search_content` with a spy `execute`. (ii) a tool whose input is `z.strictObject({ items: z.array(z.strictObject({ answer: z.string() })) })`, invoked with `{ items: [{ answer: 5 }] }` | (i) `{ ok: false, error: { code: "invalid_arguments", issues } }`; the spy is not called. (ii) `issues[0].path` **deep-equals `["items", "0", "answer"]`** — a `string` `"0"` where Zod produced the `number` `0`. Case (i) alone cannot fail: its path is `["query"]`, already `string[]`, so the coercion under test never does work (coordinator probe, review F3) | MUT-09-22 `define-tool.ts` · `issuesFrom` · `issue.path.map(String)` → `issue.path as string[]` → C1(a) red | §17A.8, 08 §3, master §6.3 `ToolErrorCode`, §9.1 rule 18 |
| C1(b) | invalid tool output | a test tool whose `execute` returns `{ wrong: 1 }` | `{ ok: false, error: { code: "invalid_tool_output" } }` | — | §17A.8 (the output schema is the only place strength exists) |
| C1(c) | descriptor carries no execute | `tool.descriptor()` on both shipped tools | keys exactly `["name","description","inputJsonSchema"]` | — | master §6.4 `ToolDescriptor`, 08 §8 |
| C1(d) | the descriptor's schema is real, and carries the bound | `descriptor()` on **both** shipped tools | neither call throws, and `search_content`'s `inputJsonSchema.properties.query.maxLength === MAX_SEARCH_QUERY_CHARS`. `z.toJSONSchema(schema, { io: "input" })` was run by the coordinator against both real tool schemas before this row was written: it does not throw, and it **silently drops `.refine()`** — `positiveInt64StringSchema` emits its `pattern` but not its int64 ceiling, which is the production cause C5's object-shaped row cites | — | D11, master §6.4, charter rule 13 |
| C2(a) | tool set is read-only | `PREPARATION_TOOLS` | it contains **exactly** `search_content` and `get_content` (so the row cannot pass over an empty set), every `kind === "read"`, and `assertReadOnlyToolSet` does not throw | — | M3, crit 3 |
| C2(b) | the assertion can see a write tool | `[...PREPARATION_TOOLS, defineTool({ kind: "mutate", … })]` | `assertReadOnlyToolSet` throws naming the tool | — | M3 (rule 15 proof) |
| C2(c) | the loop refuses a non-read set | `run({ tools: <set with a mutate tool>, readOnly: true })` | rejects before any model call (`ai.calls.length === 0`) | MUT-09-1 `run.ts` · delete the `assertReadOnlyToolSet` call → C2(c) red | M3 |
| C2(d) | the agent boundary stays pure | `hasForbiddenForm` and `AGENT_SCAN_FILES` — **one** module-scope pair in `test/helpers/` (precedent: `test/helpers/proposales-arithmetic-scan.ts`), applied to `src/lib/agent/*.ts` and the two `.tool.ts` files | no scanned file matches any forbidden form, and the scanned set is **derived by reading `src/lib/agent/` and the tools directory** (excluding `*.test.ts`) and asserted to be a superset of the expected listing — not compared against the same hand-written list twice. An enumerated perimeter is not a perimeter: with `AGENT_SCAN_FILES` hand-maintained, a new `src/lib/agent/leak.ts` whose body is `fetch("https://example.com/x")` passed the entire suite (review S4). The row says `src/lib/agent/*.ts`, a glob; the instrument must read the glob. Forbidden: `fetch(`, `node:`, a **value** import of `@/lib/proposales` or `@/lib/env`, `process`, `Date`, `Math.random`, dynamic `import(`, any `@ai-sdk/` or bare `"ai"` import inside `src/lib/agent/`, and a **numeric literal** in the query `.max(` | MUT-09-6 `search-content.tool.ts` · input schema · replace `MAX_SEARCH_QUERY_CHARS` with the literal `200` → C2(d) red. This is the identity guard the phase-7 owner card asks for: both values are 200, so no runtime assertion can tell them apart · MUT-09-30 `agent-boundary-scan.ts` · the set derivation · plant a temporary `src/lib/agent/leak.ts` containing `fetch(` → C2(d) red (rule 15 proof; the file is created and deleted inside the round) | 07 §7, 08 §8, 11 §4, §9.1 rule 3, phase-7 owner card |
| C2(e) | that scanner can see every form (instrument proof) | apply **the same `hasForbiddenForm` symbol C2(d) applies** — not a predicate of the same shape — to one synthetic string per forbidden form, plus a control naming none | every form is flagged; the control is not; and the form listing equals the expected set | MUT-09-5 `test/helpers/…` · the `hasForbiddenForm` **definition** · drop all but one alternative → C2(e) red | §9.1 rules 16 and 17 |
| C3(a) | tool-call budget | script: every step returns one tool call; `maxToolCalls: 3` | `failed`, `failure.reason === "budget_exhausted"`, `failure.budget === "tool_calls"`, `ai.calls.length === 3`, and **`toolCalls` deep-equals a three-element list whose `toolCallId`, `name` and `ok` are each asserted by value**. The row already demanded `toolCalls.length === 3`; the test asserted `expect.any(Array)`, which `[]` satisfies, and nothing anywhere asserted `RecordedToolCall.ok` (review S1). The script drives a **real** tool so `ok` flips to `true`, not the unknown-tool fallback (S8) | MUT-09-27 `run.ts` · call recording · never flip `ok` to `true` → C3(a) red | M15, §17A.14 |
| C3(b) | wall-time budget | `now` advances to exactly `wallTimeMs` after the first step | `failed`, `reason === "budget_exhausted"`, `budget === "wall_time"`, `ai.calls.length === 1`. **D24's original reasoning is struck** — it claimed this comparison alone keeps the per-call ceiling positive, which is false across two `deps.now()` reads; C3(i) owns that claim and the floor that actually delivers it | — | M15, D24 (corrected by C3(i)) |
| C3(c) | token budget | step usage `totalTokens` greater than `maxTokens` | `failed`, `reason === "budget_exhausted"`, `budget === "tokens"`, no second model call | — | M15 |
| C3(d) | draft discarded | the C3(a) fixture, named explicitly | `"output" in result === false` | — | M15, §17A.14 |
| C3(e) | check before dispatch | `maxToolCalls: 1`, a step with two tool calls | `execute` invoked exactly once; `failed` `tool_calls` | MUT-09-2 `run.ts` · tool dispatch · check the budget after `invoke` → C3(e) red | §17A.14 |
| C3(f) | per-call timeout ceiling — **each term binds in turn** | **two cases**, both reading `ai.stepOptions` (the recording seam D23 adds to the fake) with the clock at 500 ms. (i) `wallTimeMs = AI_CALL_TIMEOUT_MS + 60_000`, so the SDK ceiling is the smaller term. (ii) `wallTimeMs = 1000`, so the remaining wall time is | (i) `timeoutMs === AI_CALL_TIMEOUT_MS`. (ii) `timeoutMs === 500`. Both **exact**, never a range: the previous row asked for `<= 500 && >= 1`, which the constant `1` satisfies, so it proved no relationship to the clock at all and never reached the `AI_CALL_TIMEOUT_MS` half of the `min` (coordinator probe, review F1) | MUT-09-14 `run.ts` · timeout computation · `timeoutMs` → the constant `1` → C3(f) red · MUT-09-15 · drop the `AI_CALL_TIMEOUT_MS` term → C3(f) red · MUT-09-16 · drop the remaining-wall-time term → C3(f) red | §17A.14, D23, §9.1 rule 15 |
| C3(i) | the timeout floor survives a clock that moves | a clock that advances **between** `budgetFailure()`'s read and the timeout computation, leaving `budgets.wallTimeMs - elapsed <= 0` after a passing budget check | `timeoutMs === 1`, never `0` or negative. **D24's stated reason is false and is struck from C3(b):** `elapsed >= wallTimeMs` at `run.ts:85` does not make `remaining >= 1` at `:98`, because `deps.now()` is read twice and a real clock moves between them — C3(b)'s own boundary fixture already produces `remaining === 0` there. Production is correct only because `:99` carries an undeclared `Math.max(1, …)` floor, which task 2 must now record (review S9) | MUT-09-34 `run.ts` · timeout computation · remove the `Math.max(1, …)` floor → C3(i) red | §17A.14, D24 (corrected) |
| C3(g) | two budgets exhausted on one step | a step that exceeds `maxTokens` **and** advances `now` past `wallTimeMs` | `budget === "wall_time"` — wall time is checked first because it is the platform limit | — | 08 §9, 02 §9, D15 |
| C3(h) | a tool reads the live budget | a two-step script; the tool's `execute` records `ctx.remainingBudget` | the recorded `maxToolCalls` on the second call is **less** than on the first; neither equals the initial budget after a call has been spent | MUT-09-13 `run.ts` · context assembly · pass the initial budgets into `ctx` → C3(h) red. A stale budget in `ctx` is invisible, which is what `remainingBudget` exists to prevent | master §6.4 `ToolContext`, D02 |
| C4(a) | usage on output | a `tool_calls` step with usage 10/5/15 then a `final` step with 20/10/30 | `usage` deep-equals `{ 30, 15, 45 }` | — | M15, crit 14 |
| C4(b) | usage on failure | budget failure after two steps | usage summed over both | — | M15 |
| C4(c) | null propagates in the report | second step `inputTokens: null` — the shape `client.ts:55`–`:61` produces from an unreported counter | `usage.inputTokens === null`; the other fields summed | MUT-09-3 `run.ts` · accumulator · treat null as 0 → C4(c) red | §17A.14 (absent is not zero) |
| C4(d) | an unreported count does not disable the budget | step 1 `totalTokens: null`, step 2 exceeding `maxTokens` | `failed`, `budget === "tokens"`, **and** `usage.totalTokens === null`. The reported accumulator stays null-propagating for §17A.14; the **budget** is compared against a separate counter that treats an unreported figure as `0`. One unreported step must not silently switch the token budget off for the rest of the run | MUT-09-7 `run.ts` · budget check · compare against the reported accumulator → C4(d) red | §17A.14, D03 |
| C5(a) | one bounded retry, and the paths are sent | first `final` invalid, second valid. **Fixture is `{ kind: "final", output: "<partial JSON text>" }`** — a raw string, which is what `client.ts:165` returns when `Output.object` cannot parse a truncated generation | **two cases.** (i) the truncated raw string against the flat output schema. (ii) `{ items: [{ answer: 5 }] }` against `z.strictObject({ items: z.array(z.strictObject({ answer: z.string() })) })` — an object shape the provider really returns, since `Output.object` does not validate against a raw `jsonSchema()` (master §6.6) | both: `status === "output"`; `ai.calls.length === 2`; and the second call's last message **contains the exact serialized path list**, never `toContain("path")` — the static template reads "Correct these issue **path**s and return…", so a substring assertion on `"path"` asserts the template's own prose and stays green when every path is replaced by the empty string (review S2). Case (i)'s value is **`[{"path":[]}]`** and case (ii)'s is **`[{"path":["items","0","answer"]}]`** — both printed by running `outputSchema.safeParse(...)` against the fixture, not reasoned from the schema. **A truncated string fails at the schema root, so its path is empty**; case (i) alone would assert only that an empty list travels, which is why case (ii) carries the content claim | MUT-09-28 `run.ts` · retry message · `${JSON.stringify(paths)}` → `${""}` → C5(a) red | §17A.13, M15 |
| C5(d) | the model's text never travels | the same fixture, model text `MODEL-TEXT-SENTINEL` | `MODEL-TEXT-SENTINEL` is absent from the retry message and from `JSON.stringify(result)` | MUT-09-4 `run.ts` · failure assembly · include the raw output → C5(d) red | §17A.13 ("paths only"), M15, 10 §6 |
| C5(b) | still invalid → failed, with a coerced nested path | `MAX_OUTPUT_RETRIES + 1` invalid finals against an **array-bearing** output schema `z.strictObject({ items: z.array(z.strictObject({ answer: z.string() })) })`, each `{ items: [{ answer: 5 }] }`. **Grounded (rule 18):** driven forward through the real `@ai-sdk/anthropic` provider with only `fetch` injected, `Output.object({ schema: jsonSchema(<raw JSON Schema>) })` **does not validate against that schema at all** — the object returns as `result.output` with no throw. The plan previously argued from the narrower `.refine()`-dropping cause; the true cause is broader (master §6.6) | `failed`, `reason === "model_output_invalid"`, and `issues[0].path` **deep-equals `["items", "0", "answer"]`**. The previous flat fixture's path was `["answer"]` — already `string[]` — so the row could not fail; its cell reasoned from Zod's *type* (`PropertyKey[]`) to a conclusion the *runtime value* did not support (coordinator probe, review F3) | MUT-09-21 `run.ts` · `issuePaths` · `issue.path.map(String)` → `issue.path as string[]` → C5(b) red | §17A.13, M15, §9.1 rule 18 |
| C5(c) | the retry bound stops the loop early | script `MAX_OUTPUT_RETRIES + 3` invalid finals | `ai.calls.length === MAX_OUTPUT_RETRIES + 1`, and **no `script_exhausted`** — unconsumed steps remain, so the loop stopped at its own bound rather than running out of script | MUT-09-12 `run.ts` · retry comparison · widen by one → C5(c) red | §17A.13, charter rule 13 |
| C6(a) | the search tool forwards the **model's** query and the **resolved** language to the ranker | **three cases** over `FIXTURE_CATALOG`: (i) a known query; (ii) a *second, different* query whose top candidate differs from (i)'s; (iii) `ctx.language: "sv"`, which discriminates because `FIXTURE_CATALOG` item 7 carries an `en`-only title | each case asserts a **concrete** candidate tuple by value — `variationId`, `score`, `matchStrength` — never a recomputation of `rankCandidates(...)`, which moves with any mutation of the ranking. Two queries are required because one fixture cannot distinguish "forwards `input.query`" from "hardcodes the string that fixture happens to use": with a single case, `rankCandidates("consulting service track", …)` and `rankCandidates(input.query, ctx.catalog, "en")` **both leave the full suite green** (review B2). This is C7(a)'s claim one level down — the loop's inbound plumbing was guarded after projection found it blind; the tool's own was not | MUT-09-25 `search-content.tool.ts` · `execute` · hardcode the query → C6(a) red · MUT-09-26 · hardcode `"en"` as the language → C6(a) red | §17A.8, §9.1 rule 15, review B2 |
| C6(b) | get tool, over a predicate **shared with the domain** | **four cases**: known `variationId`; unknown id; a known id whose item has no `title[ctx.language]`; and a known id whose title is present but **blank after trim** | the `ContentDetail` object / `null` / `null` / `null`. The title predicate and the truncation rule are **the same objects** `rankCandidates` uses, reached through a `toContentDetail(item, language)` in `server/domain/` — not re-implemented in the tool. `get-content.tool.ts:21`–`:31` re-implemented both, which contract `08` §3 forbids ("`execute` calls a service or an integration client. It contains no business rules") and which lets the two search paths drift — the defect the owner's one-bound decision exists to prevent, one level down (review S6). The blank-title clause had no case and was deletable with the suite green (review N1); charter rule 12 wants one mutation per sub-check. **Review N1's stated reason — "`FIXTURE_CATALOG` has no blank title" — is false and was corrected by reading the fixture: item `8` carries blank `sv` and `no` titles, and item `7` carries no `sv` title at all**, so absent-title and blank-title are two distinct fixture-backed sub-branches and no new fixture is needed | MUT-09-35 `domain` · the title predicate · drop the `trim().length === 0` clause → C6(b) red · MUT-09-36 `domain` · the truncation bound · change it → C6(b) **and** C6(c) red, which is the §9.1 rule-17 proof that both paths name the same object | §17A.8, master §6.4 `contentDetailSchema`, D07, 08 §3 |
| C6(c) | output shape | the C6(a) fixture | candidate objects have exactly the `contentCandidateSchema` keys — no `createdAt`, no `images` | MUT-09-10 `rank-candidates.ts` · the returned object · add `createdAt: item.createdAt` → C6(c) red. *Mutation-only on a phase-7 approved file; it is applied and reverted, never shipped.* This also proves the tool's **output** parse is wired: a pass-through skipping `safeParse` would leave the row green | 08 §3, 10 §6, D17 |
| C6(d) | language required, on **both** tools | `ctx.language = null` against `search_content` **and** `get_content`, each with a throwing `catalog` getter proving `execute` was never reached | both return `{ ok: false, error: { code: "language_unresolved" } }` via `requires(ctx)`; the getter is not called. `get_content`'s `requires` was added by the implementer unprompted — task 3 never specified it — and had no row: deleting it left the suite green while the tool silently returned `{ item: null }` for every id (review S7). Assessed on its merits it is **right**, and it is what makes the `ctx.language!` non-null assertions at `:21` and `:23` safe, so it needs a row, not a removal | MUT-09-37 `get-content.tool.ts` · `requires` · delete it → C6(d) red | §17A.8, master §6.4 `requires`, D06 |
| C6(e) | one bound, both search paths | a string of exactly `MAX_SEARCH_QUERY_CHARS` characters and one of `+1` | both `searchContentInputSchema` and `searchContentTool`'s input accept the first and reject the second, computed from the imported constant. This is the **behavioural** half of the owner's one-bound decision; C2(d)'s literal scan is the identity half, and neither alone carries both claims | — | §17A.16, master §6.5, phase-7 owner card |
| C7(a) | tool results reach the model, correlated | a `tool_calls` step then a `final` step | `ai.calls[1].messages` ends with the assistant `toolCalls` form followed by the `tool` `results` form, sharing the **same** `toolCallId`, carrying the tool's output as the result value — as **labeled data**, never concatenated into the system prompt or an instruction | MUT-09-9 `run.ts` · message assembly · drop the tool-result append → C7(a) red. **Without this row a loop that discarded every tool result passes the entire table** | master §6.4 `AgentMessage`, 08 §7, §9.1 rule 3, 10 §6 |
| C7(b) | a bad tool call is answered, not fatal | a step calling `search_content` with `{ query: 5 }` | the run continues; the next `generateStep` happens; and that tool call's result message carries **`{ error: { code: "invalid_arguments", issues } }` with the `issues` array asserted by value**. Contract `08` §3 spells the structured tool error with its `issues`, and they are what lets the model correct itself instead of guessing; the row asserted only the code, and sending `{ error: { code } }` alone left the suite green (review S3) | MUT-09-29 `run.ts` · tool-failure result · strip `issues` from the appended result → C7(b) red | 08 §3 ("returned to the model as a structured tool error"), D04 |
| C7(c) | a bad tool **output** ends the run | a test tool whose `execute` returns a value failing its output schema | `failed`, `reason === "tool_output_invalid"`; no further model call | MUT-09-8 `run.ts` · tool-failure dispatch · swap the two dispositions → C7(c) red | master §6.3 `RunFailureReason`, D04 |
| C7(d) | the operational record carries ids, not content | a run with an injected logger and model text `MODEL-TEXT-SENTINEL`; **plus** a second run over a real tool | `agent.run.start` and `agent.run.end` are emitted carrying `runId` and `traceId`; `agent.run.step` is emitted **once per provider call** (asserted by count, not by presence — the whole call was deletable with the suite green, coordinator probe / review F4); `agent.run.end` carries `toolCallCount === 1` on the tool run, so the count is proved by a **non-zero** value; and **no** emitted record contains the sentinel | MUT-09-11 `run.ts` · logging · include the model text → C7(d) red · MUT-09-23 · delete the `agent.run.step` call → C7(d) red · MUT-09-24 · report `toolCallCount` as the constant `0` → C7(d) red | 08 §10, 10 §7, §9.1 rule 3, D18 |
| C7(e) | **the request the model receives is the request the caller supplied** | a run with `system: "SYSTEM-PROMPT-SENTINEL"`, one seeded `initialMessages` entry, one tool, and the phase's output schema; read `ai.calls[0]` | `request.system`, `request.messages`, `request.tools` and `request.outputJsonSchema` each **deep-equal** what the caller passed (`tools` equals `[tool.descriptor()]`, `outputJsonSchema` equals `z.toJSONSchema(outputSchema, { io: "input" })`). All four fields had zero rows and **all four were individually deletable with the full suite green** — a loop offering the model no system prompt, no history, no tools and no schema passed the entire original table. `outputJsonSchema` is the load-bearing one: without it `generateText` falls back to its text spec, every `final` arrives as a string, and C5 becomes trivially true (D11, named in task 2 and never asserted) | MUT-09-17 `run.ts` · request assembly · delete `outputJsonSchema` → C7(e) red · MUT-09-18 · `system: options.system` → `system: ""` → C7(e) red · MUT-09-19 · `tools` → `[]` → C7(e) red · MUT-09-20 · drop `initialMessages` from the seeded message list → C7(e) red | D11, 08 §7, review F2 and F6 |
| C7(f) | the run logs a tool name and a duration | a run with an injected logger over one real tool invocation | an `agent.run.tool` event is emitted **per invocation** carrying `{ runId, traceId, toolCallId, name, ok, durationMs }`, and `agent.run.end` carries `durationMs`. Contract `08` §10 requires every run to log "`runId`, `traceId`, **tool names**, **durations**, token counts, and outcomes" and `10` §7 names `durationMs` in the event shape; **no emitted event carried either** (review B1). `agent.run.tool` was named in task 2 and never built, and the table never asked for it — the narrative was right and the binding artifact silently narrowed it. Ids and names only: `08` §10 forbids arguments, and C7(d)'s sentinel assertion already guards content. Durations come from `deps.now()`, the injected clock — never `Date`. **Both branches are asserted, not only the success one.** Fix round 2 shipped a full `toEqual` over the success record and nothing at all over the failure record, so deleting the failure-branch event, or reporting its `ok` as `true`, left all 421 tests green (coordinator probes P-G and P-E). That branch is the one that matters most: an `unknown_tool` result takes it, and owner card 1's whole motivation was that a model repeatedly reaching for an absent tool left no trace of which tool it was. A row that discharges `08` §10's "outcomes" clause on the success path only does not discharge it | MUT-09-31 `run.ts` · logging · delete the `agent.run.tool` event on the **success** path → C7(f) red · MUT-09-32 · drop `durationMs` from `agent.run.end` → C7(f) red · MUT-09-38 · delete the event on the **failure** path → C7(f) red · MUT-09-39 · the failure path's `ok: false` → `ok: true` → C7(f) red | 08 §10, 10 §7, review B1 |
| C7(g) | a tool the run was never given is answered **truthfully** | a step naming `search_proposals`, a tool absent from the run's set | the loop appends `{ error: { code: "unknown_tool", name: "search_proposals" } }` as that call's result and continues; the run does **not** end, and the code is **not** `invalid_arguments`. **Owner card 1, answered 2026-09-07: add `unknown_tool`.** The shipped loop synthesized `invalid_arguments` for a dispatch miss, so a closed 3-member registry meant two different things and the model was told to rewrite arguments that were never the problem — it would keep asking for the same missing tool until the budget paid for the lie. `ToolErrorCode` goes to **4 members, still closed** (master §6.3); `ToolInvokeResult` gains a fourth failure arm produced **only by `run`'s dispatch miss**, never by `invoke` (master §6.4). The disposition was undeclared in every task and criterion and drove eight rows (review S8); C3(a) and C4(a) are re-pointed at a **real** tool so those budget and usage rows measure tool dispatch rather than this fallback | MUT-09-33 `run.ts` · dispatch miss · return `invalid_arguments` instead of `unknown_tool` → C7(g) red | master §6.3, §6.4, 08 §3, owner card 1, review S8 |

Criteria: **7** (C1–C7). Rows: **38** — `C1 4 + C2 5 + C3 9 + C4 4 + C5 4 + C6 5 + C7 7`. Named
mutations: **39 distinct** — MUT-09-1 … MUT-09-39, contiguous. Every number on this line is printed
output from the counter run over this table, not a typed summand.

Review round 1 grew the table from 7 / 34 / 13. Eleven of the new mutations
(MUT-09-14 … MUT-09-24) are already discharged: the review applied those repairs test-side inside
its own round and the tree carries them. MUT-09-25 … MUT-09-37 were discharged by fix round 2;
MUT-09-38 and MUT-09-39 belong to fix round 3. **The additions are concentrated where a row asserted a range, a substring, a
presence, or a type instead of a value** — C3(f) was satisfied by the constant `1`, C5(a) by the
retry template's own prose, C1(a)/C5(b) by a fixture whose path was already `string[]`, C3(a) by an
empty array, and the entire outbound request surface (`system`, `initialMessages`, `tools`,
`outputJsonSchema`) by nothing at all.

Projection round 0 grew the table from 6 / 22 / 4. The additions are concentrated where the
projection found the table blind: the message loop (C7(a) — a run discarding every tool result
passed all 22 original rows), tool failure at the run level (C7(b–c)), and the two inherited
obligations, which had **zero** rows between them (C2(d–e), C6(e)). D15, D17, D24 and D26 added
assertions to rows that already existed rather than rows of their own.

## Notes

- The loop is ours (not the SDK's `stopWhen`): budgets must be checked between calls and tool execution counted per `execute` invocation.
- `tool_output_invalid` ends the run `failed` with that reason (added to `RunFailureReason` in master plan §6.3).
- Projection gate: mandatory (rank 12). **Round 0 consumed 2026-09-07**; 26 ledger rows routed, owner card answered branch 1. See the Review log.
- **`RunResult` has two arms, deliberately.** §17A.13 says the run result carries `{ status: "failed" | "clarification" }`; that describes the **turn** result. The loop is generic by design (§6.9) and **phase 11 task 9** owns the mapping from a budget-exhausted run to a `clarification` turn when an `ask_if_underivable` item is still unresolved. Recorded so a reviewer reading §17A.13 does not raise it as a conflict (D19).
- **Three exclusions, recorded here so no session re-derives them or "fixes" them.** (i) The phase-7 purity guard (`rank-candidates.test.ts:63`–`:83`) is eight inline regex literals in one `it()` with no proof row — the §9.1 rule 17 defect — and is **not** repaired here: phase 7 is approved and its test file is outside this perimeter. Routed as a **phase-15 candidate**, where this phase's shared `hasForbiddenForm` is the natural thing to adopt. (ii) Contract `08` §2's `approval.ts` is not built: v1 instantiates no `prepare` or `mutate` tool, and building it would be infrastructure introduced because a contract mentions it (guide §1). (iii) `RunFailureReason`'s `script_exhausted` gets no row — it is a fake-only test aid (§6.3), and D05 makes a thrown value propagate rather than be caught, so there is nothing for the loop to assert.
- **Two instruments, two jobs, on the owner's one-bound decision.** C2(d)'s source scan is the **identity** guard (both values are `200`, so no runtime assertion can distinguish the constant from a literal); C6(e) is the **behavioural** guard (the two search paths accept and reject the same strings). Neither alone carries both claims, which is why the plan names which is which (D09).
- **Inherited from the phase-7 review (2026-09-06, S2 / master §9.1 rule 16).** This phase's tool boundary wants the same purity guard `rank-candidates.ts` carries, and it inherits the **complete form list**: static import, `import type`, dynamic `import(`, and global access are four shapes, and a mutation exercising one certifies only that one. Phase 7's guard shipped blind to `await import("node:fs")`.
- **Inherited from the phase-7 projection fold (2026-09-06, owner card 1).** The human search box and this tool share one query bound, `MAX_SEARCH_QUERY_CHARS` (master §6.5), owned by `schemas/content-candidate.ts` and created in phase 7. This phase's projection must add a criterion row asserting that the tool's input bound **is that constant** — a second literal `200` here would let the two search paths drift apart silently, which is exactly the defect the owner's decision exists to prevent.

## Review log

*(append-only)*

### Coordinator fold of projection round 0 — 2026-09-07

Consumes `handoffs/reviewer/phase-09-projection-round-0.handoff.reviewer.md`
(`AMENDMENTS_REQUIRED`, 26 ledger rows: P 16 · M 7 · I 1 · F 2, and the class enumeration
reconciles against the rows listed). Every load-bearing claim was re-run before it was folded.

**Owner card 1 → branch 1, keep today's behaviour.** The projection found what two earlier sessions
had missed: `finishReason: "length"` splits in two, and **the common half is not a provider failure
at all**. Verified independently by driving the real provider with a truncated JSON body — the SDK
throws `NoObjectGeneratedError` with `text: '{"kind":"proposi'` and `finishReason: "length"`, and
phase 8's `client.ts:161`–`:166` returns `{ kind: "final", output: <that raw string> }`, which the
run loop validates and retries. Only the rare *no-text* case reaches `invalid_response`. The
behaviour the phase-8 review recommended is therefore already shipped for the case that happens, so
the answer costs nothing: no intention change, no §6.3 change, and approved phase 8 stays closed.
Master §12's card is closed with the reasoning.

**What running the claims changed.** D11 warned that `z.toJSONSchema` might **throw** on the real
tool schemas because `positiveInt64StringSchema` carries a `.refine()`. Run against both:
`get_content` → `{"type":"string","pattern":"^[1-9]\\d*$"}`, `search_content` →
`{"type":"string","minLength":1,"maxLength":200}`. It does **not** throw. What it does instead is
**silently drop the `.refine()`** — the int64 ceiling never reaches the model — which is not a
problem (the runtime parse is the authority) but *is* the concrete production cause D10 needed for
an object-shaped invalid output, and it is now cited in C1(d) and C5(b) rather than hypothesized.
The delegation to the implementer is correspondingly narrower.

**Verified before folding, not assumed:** `RecordedToolCall` appears only inside §6.4's `RunResult`
row and is defined nowhere (D20); `assertReadOnlyToolSet`, `PREPARATION_TOOLS`,
`server/tools/index.ts` and `readOnly` have **zero** occurrences in the master plan (D21);
`ContentItem` carries `createdAt` and optional `images` while `contentCandidateSchema` demands
`score`, `matchStrength` and `reason`, so `get_content` genuinely had no representable output
(D07); `scripted.ts:24` is `async generateStep(input)` with the options argument dropped, so C3(f)
was unwritable against the fake its own plan mandates (D23).

**The finding that matters most is D16.** A `run` that discarded every tool result — the single
most important thing this loop does — passed **all 22** original rows. That is the phase-8 disease
one level up: not a guard with a second cause, but a behaviour with no guard at all. It is now
C7(a), with a mutation that drops the append.

**Routing.** I → D01 (answered above). M → D02, D06, D07, D20, D21, D22, D23, folded into master
§6.1, §6.3 (new closed `ToolErrorCode`), §6.4 (`ToolInvokeResult`, `RecordedToolCall`,
`contentDetailSchema`, `requires`, the two-arm `RunResult` note) and §6.6 (`run`'s `toolContext`,
`defineTool`, `assertReadOnlyToolSet`, `PREPARATION_TOOLS`, the fake's `stepOptions`). P → the
sixteen plan rows, folded into tasks 1–2 and the table. F → D11 and D25, delegated by name in the
implementer prompt.

**Counts, derived by command:** 6 / 22 / 4 → **7 / 34 / 13**. Project **106 / 624 / 191**. The
projection estimated "near 35 / 13" and explicitly declined to type a total into a plan; the
figures above are the counter's output. The growth is concentrated exactly where it found the table
blind — the message loop, tool failure at the run level, and the two inherited obligations, which
had **zero** rows between them despite the Notes carrying both as obligations.

**Perimeter grew from 9 paths to 13**, and three of the four additions are existing files: the
shared purity instrument is new, while `scripted.ts` (+ its test) and `content-candidate.ts` take
additive changes. That is declared here rather than discovered by the implementer.

**§7.2 re-traced (D26).** C5's `M6` trace was wrong — M6 guards *provider* failures surfacing as
taxonomy errors, while §17A.13 says model output failing our schema is expressly **not** an
integration failure. C5 now traces to §17A.13 + M15. M6 keeps nine other servers and M15 gains
`9.C5`, so no ledger entry is left unserved; §7.2 is regenerated.

Phase state → `PROMPT_READY`. Implementer prompt:
`prompts/implementer/phase-09-round-1.implementer.md`.

### Implementer round 1 — 2026-09-07 (Codex)

State **IMPLEMENTED**. Built the provider-neutral tool definition/runtime boundary, bounded
run loop, read-only preparation tools, shared content detail schema, scanner proof, and scripted
timeout recording seam. The loop uses a `while` control flow; `invoke` is `async` and awaits the
possibly asynchronous `execute`. Retry wording is: `The structured output was invalid. Correct
these issue paths and return a valid structured output: <JSON issue paths>`. Zod issue paths are
flattened with `issue.path.map(String)`, matching the existing repository spelling. `run` passes
`outputJsonSchema` on every model call using `z.toJSONSchema(outputSchema, { io: "input" })`; tool
descriptors use the same `{ io: "input" }` option. No plan defect or semantic conflict was found.

The phase tests cover all 34 rows; focused phase evidence is 4 files / 35 tests green. All 13
named mutations were run one at a time, each reddened its named row, and every probe was reverted;
the complete evidence record is in the implementer handoff.

Documentation impact review under contract 14 §8 found no current-state README made false: the
feature README does not yet exist, and the implementation plan/master registry remain the
authoritative project documents. The generated `tsconfig.tsbuildinfo` rewrite from typecheck is
attributed in the handoff and is not part of the intended production perimeter.

### Coordinator validation of round 1 — 2026-09-07

State stays **IMPLEMENTED**; the phase is **not** approved. Every claim below was produced by a
command in this session, not read from the handoff.

**Confirmed.** Closing L4 re-run independently: `npm test` → **31 files / 416 tests** green,
`npm run typecheck` exit 0, `npm run lint` exit 0. Write perimeter exact: `git diff --stat
49108b6 9712b2d` is 16 files — the 13 declared implementation paths plus this plan, the master
tracker row, and the handoff; nothing else. All four restoration digests recomputed and matched
(`run.ts`, `agent-boundary-scan.ts`, `search-content.tool.ts`, and the phase-7
`domain/rank-candidates.ts` MUT-09-10 touched). Table counts derived by command: 7 criteria /
34 rows / 13 mutations. `hasForbiddenForm` is imported once and shared by C2(d) and C2(e)
(rule 17 satisfied). `script_exhausted` in `RunFailureReason` and the unbuilt `approval.ts` are
the recorded exclusions, not omissions.

**Rule 18 — one fixture re-grounded, and the plan's stated reason was wrong.** C5(b)'s cell
claimed a schema-valid-but-Zod-invalid object is "producible because `z.toJSONSchema` drops
`.refine()`". Driven forward through the real `@ai-sdk/anthropic` provider with only `fetch`
injected, the truth is broader and simpler: **`Output.object({ schema: jsonSchema(<raw JSON
Schema>) })` does not validate against that schema at all.** A reply whose JSON is
`{"items":[{"answer":5}]}` returns from `generateText` as `result.output` with no throw, against a
schema requiring `answer: string`. The fixture is therefore realistic — more realistic than the
plan argued — and no refinement is needed to reach it. A truncated reply was confirmed separately
to throw `NoObjectGeneratedError` with `.text` carrying the raw partial string, grounding C5(a).
Recorded in master §6.6.

**Six coordinator probes, all forward mutations of production against the full suite.** Five came
back green — meaning the named behaviour can be deleted with all 416 tests passing.

| Probe | Edit | Suite | Finding |
|---|---|---|---|
| P1 | `run.ts` `issue.path.map(String)` → `issue.path as string[]` | green | C5(b) cannot fail |
| P1b | `define-tool.ts` `issue.path.map(String)` → `issue.path as string[]` | green | C1(a) cannot fail |
| P4 | delete `outputJsonSchema` from the `generateStep` request | green | no row covers it (D11) |
| P5 | `timeoutMs` → constant `1` | green | C3(f) cannot fail |
| P6 | drop the `AI_CALL_TIMEOUT_MS` cap from the `min` | green | half of C3(f) untested |
| P8 | delete the `agent.run.step` log call | green | no row covers it |
| P7 | drop `traceId` from `agent.run.start` (control) | **red** | C7(d) has teeth |

**These are plan-authorship defects, not implementer defects (§9.1 rule 18's ladder).** Each
implementation matches its row exactly as written; the rows are what cannot fail.

- **F1 · C3(f)** asks for `stepOptions[n].timeoutMs <= 500 && >= 1`. Any constant in that range
  satisfies it, so the row proves no relationship between the timeout and the remaining wall time,
  and never exercises the `AI_CALL_TIMEOUT_MS` half of the `min`.
- **F2 · `outputJsonSchema` has no row.** Plan step 2 names it as load-bearing — "or `generateText`
  falls back to its text spec and every final arrives as a string, making C5 trivially true"
  (D11) — and the acceptance table never asserts it. The scripted fake already records it on
  `ai.calls[n]`, so the row is one line.
- **F3 · C1(a) and C5(b)** both require `path` to be `string[]` over flat fixtures whose paths are
  already `["query"]` / `["answer"]`. C5(b)'s cell reasons from Zod's *type* (`PropertyKey[]`) to
  conclude "this is a real guard"; the *runtime value* is all strings, so it is not. The real
  production shape verified above yields `["items", 0, "answer"]` — a number at index 1 — which is
  what the coercion exists for.
- **F4 · `agent.run.step` has no row.** Plan step 2 names four events (`start/step/tool/end`); the
  acceptance table (C7(d)) requires two; three were built and `agent.run.tool` was never built.
  The table is binding, so the implementation is compliant — the plan's narrative is not.
- **F5 · `assertReadOnlyToolSet` exists twice**, byte-identical, in `run.ts` (private) and
  `tools/index.ts` (exported). Master §6.6 places one symbol in `tools/index.ts` and has `run`
  gate on it, which `run.ts` cannot do: `src/lib` may not import from a feature (contract 03), the
  same rule that forced the handoff's five test imports to become dynamic. The duplication is
  forced and both copies are covered (C2(a)/C2(b) the exported one, C2(c) via MUT-09-1 the private
  one) — but the master registry now describes a single symbol that is two, and the handoff
  reported "no plan defect."
- **F6 (low) · the system prompt is never asserted to reach the model.** Replacing
  `system: options.system` with `system: ""` leaves the suite green.

**Process deviation, self-reported and accepted.** No pre-production full-suite baseline was
captured; the honest captured baseline was the targeted phase command at 3 failed suites / 0
tests. The perimeter and digest checks above substitute for it, and the phase-8 comparator
(28 files / 383 tests) plus this phase's 31 / 416 reconcile: +3 files, +33 tests.

Phase state stays `IMPLEMENTED`. Review round 1 prompt:
`prompts/reviewer/phase-09-review-round-1.prompt.reviewer.md`.

### Reviewer round 1 — 2026-09-07

Verdict **CHANGES_REQUESTED**. Gate passed on all five content checks. Tree entering the round:
`57a35dc`, `git status --porcelain` empty; `git diff --stat 9712b2d 57a35dc` touches documents only,
so the coordinator's stamp is tree-valid for code and was cited, not re-run, until the closing stamp.

**Counts re-derived by command, not quoted.** Table: `7` criteria / `34` rows
(`C1 4 · C2 5 · C3 8 · C4 4 · C5 4 · C6 5 · C7 4`) / `13` distinct `MUT-09-*`. Tests: `5 + 9 + 21 = 35`
`it()` blocks across the three phase files. Distinct row ids named by tests: `35` — the 34 table rows
plus `C7(e)`, declared below as a candidate criterion. **Zero orphan tests.**

**Evidence scope.** `grep` over `src` and `test` shows the only importers of `src/lib/agent/*`,
`server/tools/*` and `agent-boundary-scan` are the three phase test files: the import radius is
closed, so L2 over those three files is sufficient for a "no test observes this" claim about phase-9
production code. Every probe below ran at that scope; one control (`>=` → `>` on the tool-call
budget) reddened, proving the harness detects failure.

**Seventeen new variation probes; twelve came back green.** Green = the named behaviour can be
deleted with the phase suite passing. None repeats a ledger mutation.

| Probe | Edit | Result | Finding |
|---|---|---|---|
| V1 | `agent.run.end` `toolCallCount` → literal `0` | green | S1 |
| V2 | `tools:` in the request → `[]` | green | repaired, C7(e) |
| V3 | retry message `${JSON.stringify(paths)}` → `${""}` | green | S2 |
| V4 | delete `run.ts:131` tool-call check | green | S5 |
| V5 | delete `run.ts:129`–`:130` `beforeTool` check | green | S5 |
| V6 | drop the `Math.max(1, …)` timeout floor | green | S9 |
| V7 | tool error to the model → `{ code }` only, no `issues` | green | S3 |
| V8 | delete `get_content`'s `requires` | green | S7 |
| V9 | delete `get_content`'s blank-title branch | green | N1 |
| V10 | `RecordedToolCall.ok` never set to `true` | green | S1 |
| V11 | `search_content` ignores `input.query` | green | **B2** |
| V12 | `search_content` hardcodes the language | green | **B2** |
| V13 | `get_content` hardcodes the language | **red** | verified covered |
| V14 | `get_content` ignores `input.variationId` | **red** | verified covered |
| V15 | new `src/lib/agent/leak.ts` calling `fetch` | green | S4 |
| V16 | `initialMessages` never reach the model | green | repaired, C7(e) |
| V17 | `search_content` returns only the top candidate | green | N2 |
| V18 | control: tool-call budget `>=` → `>` | **red** | harness proven |

**F1–F6 disposition.** F1, F2, F3, F4 (partly), F6 repaired **test-side only** — zero production
bytes changed, digests below. F5 **deferred, and independently confirmed**: contract `03` §4 states
"`src/lib/` never imports from `features/`", so the two copies are forced; phase-15 candidate 6
stands. F4 is **disputed in part**: see B1 — the plan's narrative was right and the table is wrong,
because contract `08` §10 and `10` §7 both require tool names and durations in the operational
record and no emitted event carries either. `agent.run.step` (which exists) is now covered; the
missing `agent.run.tool` and `durationMs` are production work routed to the fix round.

**Row text for the coordinator to fold** (the Review log is append-only; the table is not mutated
here). Eleven new named mutations, `MUT-09-14` … `MUT-09-24`, each run and each reddening only its
own row.

- **C1(a)**, add a second case: *an array-bearing input schema, `invoke({ items: [{ answer: 5 }] })`* →
  `issues[0].path` deep-equals `["items","0","answer"]` — index 1 is a **number** at runtime, which is
  what the coercion exists for. Mutation `MUT-09-22` `define-tool.ts` · `issuesFrom` ·
  `issue.path.map(String)` → `issue.path as string[]` → C1(a) red.
- **C3(f)**, replacing the range assertion with two binding cases: *(A) `wallTimeMs = AI_CALL_TIMEOUT_MS
  + 60_000`, elapsed 0* → `stepOptions[0].timeoutMs === AI_CALL_TIMEOUT_MS`; *(B) `wallTimeMs = 1000`,
  elapsed 500* → `=== 500`. Both compared to the imported constant, never a literal (rule 13).
  Mutations `MUT-09-14` (`timeoutMs` → `1`) reddens B, `MUT-09-15` (drop the `AI_CALL_TIMEOUT_MS` cap)
  reddens A, `MUT-09-16` (drop the remaining-wall-time term) reddens B. *The first draft of case A used
  `AI_CALL_TIMEOUT_MS + 500` with elapsed 500, making both terms exactly equal — two sufficient causes,
  rule 2's companion, caught by `MUT-09-15` staying green. Recorded because a reviewer authored it.*
- **C5(b)**: *`outputSchema = { items: [{ answer: string }] }`, both invalid finals `{ items: [{ answer: 5 }] }`* →
  `failure.issues[0].path` deep-equals `["items","0","answer"]`. Mutation `MUT-09-21` `run.ts` ·
  `issuePaths` · `issue.path as string[]` → C5(b) red. Delete the row's "Zod 4 types `path` as
  `PropertyKey[]`, so this is a real guard" clause: the type was never the reason.
- **C7(d)**, two additions: `agent.run.step` is emitted once per model call (`MUT-09-23` · delete the
  call → red), and on a run with one tool call `agent.run.end` carries `toolCallCount === 1`
  (`MUT-09-24` · report the constant `0` → red).
- **C7(e)** (new row, candidate criterion): *the model request carries what the run was given.* On
  `ai.calls[0]`: `system` equals the run's system prompt, `messages` deep-equals `initialMessages`,
  `tools` deep-equals the tool set's descriptors, `outputJsonSchema` deep-equals
  `z.toJSONSchema(outputSchema, { io: "input" })`. Mutations `MUT-09-17` (drop `outputJsonSchema` — F2),
  `MUT-09-18` (`system` → `""` — F6), `MUT-09-19` (`tools` → `[]` — V2), `MUT-09-20` (drop
  `initialMessages` — V16); each reddens C7(e). Trace: D11, `08` §7, `08` §8, master §6.6.
  This row also discharges V2 and V16, which were new findings of the same family.

Proposed table after the fold: **7 / 35 / 24**. Not applied here — the coordinator folds.

**Findings.** Blocking B1 (no log event carries a tool name or a duration — `08` §10, `10` §7),
B2 (`search_content` never proves it forwards the model's query or the resolved language to the
ranker — V11, V12). Should-fix S1–S9, notes N1–N5, one owner decision card on the undeclared
unknown-tool disposition reusing the closed `ToolErrorCode.invalid_arguments`. Full text:
`handoffs/reviewer/phase-09-review-round-1.handoff.reviewer.md`.

**Verified correct, so the next round can skip it.** C2(e) is genuinely per-form — no forbidden-form
example is matched by another form's pattern, so deleting any single alternative reddens it.
C7(a) bites on dropping either message append. `get_content`'s id and language plumbing is covered.
The tool-call budget catches an off-by-one. C3(g)'s wall-time-before-tokens precedence is real.
`hasForbiddenForm` is one shared symbol across C2(d) and C2(e).

Write perimeter: `src/lib/agent/define-tool.test.ts`, `src/lib/agent/run.test.ts`, this Review log
entry, and the handoff. **Zero production files changed** — all seven production digests recomputed
and matched after every probe.

### Coordinator fold of review round 1 — 2026-09-07

State → **CHANGES_REQUESTED**. Every figure below was produced by a command in this session.

**Verified against the tree, not read from the handoff.** Closing L4 re-run: `npm test` → **31
files / 418 tests** green, typecheck and lint exit 0. All **seven** production digests recomputed
and byte-identical to the handoff's list, and `git diff 9712b2d -- src/ test/ ':!*.test.ts'` is
empty — the review changed no production byte. Write perimeter exactly the four declared paths;
`src/lib/agent/leak.ts` (probe V15) is gone. Table counts derived by the counter: 7 / 38 / 37,
MUT-09-1 … MUT-09-37 contiguous.

**The seven repairs were re-proved by mutation, not accepted.** Each of the coordinator's original
green probes now reddens exactly one test: `timeoutMs` → the constant `1`; dropping the
`AI_CALL_TIMEOUT_MS` term; deleting `outputJsonSchema`; neutering `issue.path.map(String)` in
`run.ts` **and** in `define-tool.ts`; `system` → `""`; deleting the `agent.run.step` call. F1, F2,
F3, F6 and F4's built half are genuinely closed.

**Five of the review's own findings were re-run independently and all five reproduce:** hardcoding
the query in `search_content` (B2), hardcoding its language (B2), deleting the duplicate budget
check at `run.ts:131` (S5), removing the `Math.max(1, …)` timeout floor (S9), and planting
`src/lib/agent/leak.ts` with a bare `fetch(` (S4) each leave all 418 tests green.

**B1 is a contract violation and the citation is exact.** `08` §10 reads "Every run emits
structured log events with `runId`, `traceId`, tool names, durations, token counts, and outcomes",
and `10` §7 names `durationMs` in the event shape. No emitted event carries a tool name or a
duration. Escalated to task 6 and C7(f).

**F5 stands deferred**, independently confirmed forced by contract `03`: `src/lib` never imports
from `features/`. Phase-15 candidate 6 unchanged.

**Owner card 1 answered: add `unknown_tool`** (the recommendation). Recorded in master §12, §6.3
(`ToolErrorCode` → 4 members, still closed) and §6.4 (`ToolInvokeResult`'s fourth failure arm,
produced only by `run`'s dispatch miss). The intention is untouched: it says nothing about tool
error codes, so this decision costs no ratification round. Task 7 and C7(g) carry it, and C3(a) and
C4(a) are re-pointed at a real tool so the eight rows that were silently measuring the fallback
path measure tool dispatch instead.

**The review's six lessons are folded as master §9.1 rules 19–21**; lessons 2 and 3 are
clarifications of existing rules 15 and 2 and are recorded there rather than as new rules.

**One judgment recorded against the review.** Its lesson 1 — that the request to an external
system is a surface needing one row, not four incidental fields — is the most valuable thing this
round produced, and it generalizes past this phase. It is rule 19. That the entire outbound request
was deletable is the same class as the projection's finding that a `run` discarding every tool
result passed all 22 original rows: **both directions of the model boundary were blind, and each
was found only when someone asked what a do-nothing implementation would still pass.**

Fix round 1 prompt: `prompts/implementer/phase-09-fix-round-2.implementer.md`.

### Coordinator correction — 2026-09-07 (fix round 2 blocked and re-dispatched)

The implementer stopped before editing anything and reported a plan contradiction. **It was right
and the plan was wrong**, and the defect is mine: folding review round 1, I wrote C5(a)'s expected
value as `[{ path: ["answer"] }]` by reasoning from the schema instead of running the fixture. A
truncated raw string fails `z.strictObject({ answer: z.string() })` at the **root**, so the real
serialized value is `[{"path":[]}]`. Verified by printing it, twice, before this correction.

This is precisely what §9.1 rule 18 exists to prevent, committed at a fold three commits after I
added rule 19 — and it is the second time in this project that a typed value has cost a session
(the recurring failure recorded in phase 8's log). The fixture was never the problem: C5(a)'s
truncated string is grounded by owner card 1 and stays.

**C5(a) now carries two cases** — the truncated string with its true empty root path, and a nested
object failure whose serialized path is `[{"path":["items","0","answer"]}]` — so the row's "the
paths are sent" claim is carried by a case with actual content instead of an empty list. Both
values are printed output.

**Two further checks were run against `FIXTURE_CATALOG` before re-dispatch, so this does not
happen twice.** Item `7` has an `en`-only title, which makes C6(a)'s Swedish case and C6(d)
genuinely discriminating; item `8` carries **blank** `sv` and `no` titles, so C6(b)'s
present-but-blank sub-branch is fixture-backed and needs no new fixture. **Review N1's stated
reason — "`FIXTURE_CATALOG` has no blank title" — is false**, and C6(b)'s cell now records the
correction. No other cell in the fold names a literal value that the implementer must reproduce.

The stop was correct behaviour under rule 18's ladder: an obvious contradiction, reported without
investigation and without adjusting the assertion until it passed. Nothing else in the round
changes; the ledger is still MUT-09-25 … MUT-09-37 and the table is still 7 / 38 / 37.

### Coordinator fold of fix round 2 — 2026-09-07

State stays **CHANGES_REQUESTED**; fix round 3 is dispatched, scoped to one test addition.

**Verified against the tree, not read from the handoff.** Closing L4 re-run: `npm test` → **31
files / 421 tests** green, typecheck and lint exit 0. Write perimeter exact: `git diff --stat
17e076d HEAD` is 8 files — the 7 declared paths plus the handoff. All five restoration digests
recomputed and matched. All six production tasks are present and correct: `agent.run.tool` with
`durationMs` from the injected clock; `durationMs` on `agent.run.end`; `unknown_tool` carrying
`call.name`, with `ToolErrorCode` at four members and `ToolInvokeResult` at four arms; the
duplicate budget check at the old `run.ts:131` deleted; the `Math.max(1, …)` floor retained; and
`toContentDetail` extracted to `server/domain/` with `get-content.tool.ts`'s `execute` reduced to
a single call holding no business rule. Table counts by the counter: 7 / 38 / 39.

**Ten independent coordinator probes, all variations the ledger did not run. Eight reddened.**

| Probe | Edit | Suite |
|---|---|---|
| P-A | plant `src/lib/agent/probe_a.ts` containing `Date.now()` | **red** |
| P-B | plant `server/tools/probe_b.ts` containing `process.env` | **red** |
| P-C | `unknown_tool`'s `name: call.name` → a constant | **red** |
| P-D | `agent.run.tool`'s `durationMs` → the constant `0` | **red** |
| P-F | `agent.run.end`'s `durationMs` → the constant `0` | **red** |
| P-H | `agent.run.tool`'s `toolCallId` → a constant | **red** |
| P-I | `toContentDetail`'s `truncated` flag → always `false` | **red** (2 tests) |
| P-J | `get_content` ignores its `variationId` argument | **red** |
| **P-E** | the **failure** branch's `ok: false` → `ok: true` | **green** |
| **P-G** | delete the **failure** branch's `agent.run.tool` event entirely | **green** |

P-A and P-B are the point of S4's repair and they pass on a form and a directory the fix round did
not plant: the scan is now genuinely derived, not enumerated.

**A correction against my own probe, recorded because a probe that does not apply is not
evidence.** P-I first came back green and I nearly reported the truncation flag as unguarded. BSD
`sed` does not support `\s`, so the substitution silently matched nothing. Re-run through Python
with the applied-line count printed, it reddens two tests. Every probe in the table above was
confirmed applied before its result was read.

**One real gap, and it is in a row I authored (C7(f)).** The shipped test asserts a full `toEqual`
over the **success** record and nothing whatever over the **failure** record. Contract `08` §10
requires outcomes; an `unknown_tool` result takes the failure branch; and owner card 1's whole
motivation was that a model repeatedly reaching for an absent tool left no trace of which tool it
was. So the branch that motivated the blocking finding is the one branch with no guard. Production
is **correct** — the code logs `ok: false` — but nothing would notice if it stopped. C7(f) is
amended and MUT-09-38 and MUT-09-39 are added.

**Owner decision, 2026-09-07:** a minimal fix round 3 rather than approving with the gap routed to
phase 15. One test addition, no production change.

**Also carried:** N3 was not done — C5(c) still hardcodes `2` where the row says
`MAX_OUTPUT_RETRIES + 1`. Folded into the same round.

Fix round 3 prompt: `prompts/implementer/phase-09-fix-round-3.implementer.md`.
