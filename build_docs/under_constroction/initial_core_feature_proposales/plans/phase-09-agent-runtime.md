---
plan: 9
phase: Agent runtime — tool definition, run loop, budgets, read tools
state: IMPLEMENTED
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

## Acceptance criteria

Scripted steps come from `createScriptedAiClient`; clocks are injected. **Every fixture below is a
shape the system actually produces** — §9.1 rule 18, and the reason three of the original rows were
rewritten: their fixtures were shapes `createAiClient` cannot emit.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | invalid arguments never execute | `invoke({ query: 5 }, ctx)` on `search_content` with a spy `execute` | `{ ok: false, error: { code: "invalid_arguments", issues } }` with `issues[i].path` as `string[]`; the spy is not called | — | §17A.8, 08 §3, master §6.3 `ToolErrorCode` |
| C1(b) | invalid tool output | a test tool whose `execute` returns `{ wrong: 1 }` | `{ ok: false, error: { code: "invalid_tool_output" } }` | — | §17A.8 (the output schema is the only place strength exists) |
| C1(c) | descriptor carries no execute | `tool.descriptor()` on both shipped tools | keys exactly `["name","description","inputJsonSchema"]` | — | master §6.4 `ToolDescriptor`, 08 §8 |
| C1(d) | the descriptor's schema is real, and carries the bound | `descriptor()` on **both** shipped tools | neither call throws, and `search_content`'s `inputJsonSchema.properties.query.maxLength === MAX_SEARCH_QUERY_CHARS`. `z.toJSONSchema(schema, { io: "input" })` was run by the coordinator against both real tool schemas before this row was written: it does not throw, and it **silently drops `.refine()`** — `positiveInt64StringSchema` emits its `pattern` but not its int64 ceiling, which is the production cause C5's object-shaped row cites | — | D11, master §6.4, charter rule 13 |
| C2(a) | tool set is read-only | `PREPARATION_TOOLS` | it contains **exactly** `search_content` and `get_content` (so the row cannot pass over an empty set), every `kind === "read"`, and `assertReadOnlyToolSet` does not throw | — | M3, crit 3 |
| C2(b) | the assertion can see a write tool | `[...PREPARATION_TOOLS, defineTool({ kind: "mutate", … })]` | `assertReadOnlyToolSet` throws naming the tool | — | M3 (rule 15 proof) |
| C2(c) | the loop refuses a non-read set | `run({ tools: <set with a mutate tool>, readOnly: true })` | rejects before any model call (`ai.calls.length === 0`) | MUT-09-1 `run.ts` · delete the `assertReadOnlyToolSet` call → C2(c) red | M3 |
| C2(d) | the agent boundary stays pure | `hasForbiddenForm` and `AGENT_SCAN_FILES` — **one** module-scope pair in `test/helpers/` (precedent: `test/helpers/proposales-arithmetic-scan.ts`), applied to `src/lib/agent/*.ts` and the two `.tool.ts` files | no scanned file matches any forbidden form, and the scanned-file listing equals the expected set (a shrunken listing must not pass vacuously). Forbidden: `fetch(`, `node:`, a **value** import of `@/lib/proposales` or `@/lib/env`, `process`, `Date`, `Math.random`, dynamic `import(`, any `@ai-sdk/` or bare `"ai"` import inside `src/lib/agent/`, and a **numeric literal** in the query `.max(` | MUT-09-6 `search-content.tool.ts` · input schema · replace `MAX_SEARCH_QUERY_CHARS` with the literal `200` → C2(d) red. This is the identity guard the phase-7 owner card asks for: both values are 200, so no runtime assertion can tell them apart | 07 §7, 08 §8, 11 §4, §9.1 rule 3, phase-7 owner card |
| C2(e) | that scanner can see every form (instrument proof) | apply **the same `hasForbiddenForm` symbol C2(d) applies** — not a predicate of the same shape — to one synthetic string per forbidden form, plus a control naming none | every form is flagged; the control is not; and the form listing equals the expected set | MUT-09-5 `test/helpers/…` · the `hasForbiddenForm` **definition** · drop all but one alternative → C2(e) red | §9.1 rules 16 and 17 |
| C3(a) | tool-call budget | script: every step returns one tool call; `maxToolCalls: 3` | `failed`, `failure.reason === "budget_exhausted"`, `failure.budget === "tool_calls"`, `toolCalls.length === 3`, `ai.calls.length === 3` | — | M15, §17A.14 |
| C3(b) | wall-time budget | `now` advances to exactly `wallTimeMs` after the first step | `failed`, `reason === "budget_exhausted"`, `budget === "wall_time"`, `ai.calls.length === 1` — the comparison is `elapsed >= wallTimeMs`, so `remaining >= 1` at every surviving call site and the per-call ceiling is never non-positive | — | M15, D24 |
| C3(c) | token budget | step usage `totalTokens` greater than `maxTokens` | `failed`, `reason === "budget_exhausted"`, `budget === "tokens"`, no second model call | — | M15 |
| C3(d) | draft discarded | the C3(a) fixture, named explicitly | `"output" in result === false` | — | M15, §17A.14 |
| C3(e) | check before dispatch | `maxToolCalls: 1`, a step with two tool calls | `execute` invoked exactly once; `failed` `tool_calls` | MUT-09-2 `run.ts` · tool dispatch · check the budget after `invoke` → C3(e) red | §17A.14 |
| C3(f) | per-call timeout ceiling | `wallTimeMs` remaining 500 ms; read `ai.stepOptions` (the recording seam D23 adds to the fake) | `stepOptions[n].timeoutMs <= 500` and `>= 1` | — | §17A.14, D23 |
| C3(g) | two budgets exhausted on one step | a step that exceeds `maxTokens` **and** advances `now` past `wallTimeMs` | `budget === "wall_time"` — wall time is checked first because it is the platform limit | — | 08 §9, 02 §9, D15 |
| C3(h) | a tool reads the live budget | a two-step script; the tool's `execute` records `ctx.remainingBudget` | the recorded `maxToolCalls` on the second call is **less** than on the first; neither equals the initial budget after a call has been spent | MUT-09-13 `run.ts` · context assembly · pass the initial budgets into `ctx` → C3(h) red. A stale budget in `ctx` is invisible, which is what `remainingBudget` exists to prevent | master §6.4 `ToolContext`, D02 |
| C4(a) | usage on output | a `tool_calls` step with usage 10/5/15 then a `final` step with 20/10/30 | `usage` deep-equals `{ 30, 15, 45 }` | — | M15, crit 14 |
| C4(b) | usage on failure | budget failure after two steps | usage summed over both | — | M15 |
| C4(c) | null propagates in the report | second step `inputTokens: null` — the shape `client.ts:55`–`:61` produces from an unreported counter | `usage.inputTokens === null`; the other fields summed | MUT-09-3 `run.ts` · accumulator · treat null as 0 → C4(c) red | §17A.14 (absent is not zero) |
| C4(d) | an unreported count does not disable the budget | step 1 `totalTokens: null`, step 2 exceeding `maxTokens` | `failed`, `budget === "tokens"`, **and** `usage.totalTokens === null`. The reported accumulator stays null-propagating for §17A.14; the **budget** is compared against a separate counter that treats an unreported figure as `0`. One unreported step must not silently switch the token budget off for the rest of the run | MUT-09-7 `run.ts` · budget check · compare against the reported accumulator → C4(d) red | §17A.14, D03 |
| C5(a) | one bounded retry, and the paths are sent | first `final` invalid, second valid. **Fixture is `{ kind: "final", output: "<partial JSON text>" }`** — a raw string, which is what `client.ts:165` returns when `Output.object` cannot parse a truncated generation | `status === "output"`; `ai.calls.length === 2`; the second call's last message contains the issue paths | — | §17A.13, M15 |
| C5(d) | the model's text never travels | the same fixture, model text `MODEL-TEXT-SENTINEL` | `MODEL-TEXT-SENTINEL` is absent from the retry message and from `JSON.stringify(result)` | MUT-09-4 `run.ts` · failure assembly · include the raw output → C5(d) red | §17A.13 ("paths only"), M15, 10 §6 |
| C5(b) | still invalid → failed | `MAX_OUTPUT_RETRIES + 1` invalid finals, one of them an **object** that satisfies the JSON Schema but fails the Zod parse — producible because `z.toJSONSchema` drops `.refine()` (verified, C1(d)) | `failed`, `reason === "model_output_invalid"`, `issues[i].path` are `string[]` (Zod 4 types `path` as `PropertyKey[]`, so this is a real guard) | — | §17A.13, M15 |
| C5(c) | the retry bound stops the loop early | script `MAX_OUTPUT_RETRIES + 3` invalid finals | `ai.calls.length === MAX_OUTPUT_RETRIES + 1`, and **no `script_exhausted`** — unconsumed steps remain, so the loop stopped at its own bound rather than running out of script | MUT-09-12 `run.ts` · retry comparison · widen by one → C5(c) red | §17A.13, charter rule 13 |
| C6(a) | search tool uses the ctx catalog | `ctx` with `FIXTURE_CATALOG` and a known query | at least one **concrete** candidate tuple asserted by value — `variationId`, `score`, `matchStrength` — not a recomputation of `rankCandidates(...)`, which moves with any mutation of the ranking and can therefore never fail | — | §17A.8, §9.1 rule 15 |
| C6(b) | get tool | known / unknown `variationId`; and a known id whose item has no `title[ctx.language]` | the `ContentDetail` object / `null` / `null` — the same title predicate `rankCandidates` applies, so `get_content` cannot surface what `search_content` may not return | — | §17A.8, master §6.4 `contentDetailSchema`, D07 |
| C6(c) | output shape | the C6(a) fixture | candidate objects have exactly the `contentCandidateSchema` keys — no `createdAt`, no `images` | MUT-09-10 `rank-candidates.ts` · the returned object · add `createdAt: item.createdAt` → C6(c) red. *Mutation-only on a phase-7 approved file; it is applied and reverted, never shipped.* This also proves the tool's **output** parse is wired: a pass-through skipping `safeParse` would leave the row green | 08 §3, 10 §6, D17 |
| C6(d) | language required | `ctx.language = null` with a spy `execute` | `invoke` returns `{ ok: false, error: { code: "language_unresolved" } }` via the `requires(ctx)` predicate; the spy is not called | — | §17A.8, master §6.4 `requires`, D06 |
| C6(e) | one bound, both search paths | a string of exactly `MAX_SEARCH_QUERY_CHARS` characters and one of `+1` | both `searchContentInputSchema` and `searchContentTool`'s input accept the first and reject the second, computed from the imported constant. This is the **behavioural** half of the owner's one-bound decision; C2(d)'s literal scan is the identity half, and neither alone carries both claims | — | §17A.16, master §6.5, phase-7 owner card |
| C7(a) | tool results reach the model, correlated | a `tool_calls` step then a `final` step | `ai.calls[1].messages` ends with the assistant `toolCalls` form followed by the `tool` `results` form, sharing the **same** `toolCallId`, carrying the tool's output as the result value — as **labeled data**, never concatenated into the system prompt or an instruction | MUT-09-9 `run.ts` · message assembly · drop the tool-result append → C7(a) red. **Without this row a loop that discarded every tool result passes the entire table** | master §6.4 `AgentMessage`, 08 §7, §9.1 rule 3, 10 §6 |
| C7(b) | a bad tool call is answered, not fatal | a step calling `search_content` with `{ query: 5 }` | the run continues; the `invalid_arguments` error is appended as that tool call's result and the next `generateStep` happens | — | 08 §3 ("returned to the model as a structured tool error"), D04 |
| C7(c) | a bad tool **output** ends the run | a test tool whose `execute` returns a value failing its output schema | `failed`, `reason === "tool_output_invalid"`; no further model call | MUT-09-8 `run.ts` · tool-failure dispatch · swap the two dispositions → C7(c) red | master §6.3 `RunFailureReason`, D04 |
| C7(d) | the operational record carries ids, not content | a run with an injected logger, model text `MODEL-TEXT-SENTINEL` | `agent.run.start` and `agent.run.end` are emitted carrying `runId` and the tool-call count, and **no** emitted record contains the sentinel | MUT-09-11 `run.ts` · logging · include the model text → C7(d) red | 08 §10, 10 §7, §9.1 rule 3, D18 |

Criteria: **7** (C1–C7). Rows: **34** — `C1 4 + C2 5 + C3 8 + C4 4 + C5 4 + C6 5 + C7 4`. Named
mutations: **13 distinct** — MUT-09-1 … MUT-09-13. Every number on this line is printed output from
the counter run over this table, not a typed summand.

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
