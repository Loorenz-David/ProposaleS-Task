---
plan: plans/phase-09-agent-runtime.md
role: projection
round: 0
verdict: AMENDMENTS_REQUIRED
state: OWNER_DECISIONS_PENDING
date: 2026-09-07
actor: Claude (plan-projection doctrine, rank-12 projection)
---

# Phase 9 projection round 0 — the agent runtime

## Opening (for the owner)

I did the implementer's first hour on paper for the engine of this application — the loop that
talks to the model, counts what it spends, and gives the model its two ways of looking things up.
The plan is sound in shape but it is not yet buildable without guessing: the loop has no way to
hand the two lookup tools the catalog they are supposed to read, the "get one content item" tool
has no stated output, and the rule for stopping when the token budget runs out is undefined for
the case where the provider reports no token count at all. I also found that the table's 22 checks
leave the loop's most important behaviour untested — nothing at all checks that what a tool
returns is actually sent back to the model, so a loop that silently threw every tool result away
would pass every check as written. None of this is a defect in code; there is no code yet. It is
exactly what this session exists to catch, at the price of a paragraph instead of a fix round.

**One thing needs you personally** — the truncated-answer question phase 8 handed forward. It is
below, restated with the branches. Nothing else needs you.

**What happens next:** the coordinator folds the 26 routed decisions below, amends the plan and the
shared registry, and only then compiles the implementer prompt. The technical detail is everything
after this section.

---

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — When the model's answer is cut off, who owns it?

**Question.** Keep today's handling of a cut-off answer, add a tenth provider-failure label for
it, or move it to the run loop? (Pick 1, 2, or 3.)

**Story.** The assistant is drafting a proposition for a long brief and the model hits its own
token ceiling mid-sentence. Today, when any text arrived before the cut, the provider layer hands
that half-finished text to the run loop, which treats it as an unusable answer: it asks once more,
and if the second answer is also cut off the turn ends as failed. Nothing half-made is ever shown
to you. Only in the rare case where *nothing at all* arrived does the provider layer instead
report "the provider's reply could not be read" — which is not what happened; the reply was fine,
it was simply empty.

**Branches.**
1. **Keep today's behaviour.** No change anywhere. The common cut-off case is already handled by
   the run loop; only the rare empty case keeps a slightly wrong label, and it is safe either way.
2. **Add a tenth provider-failure label.** Reopens the label list you ratified two sessions ago,
   for the rare empty case only.
3. **Move the empty case to the run loop too.** Most consistent, but reopens phase 8, which is
   approved and closed, for a case that is already safe.

**Recommendation.** **Branch 1.** The thing you were protecting against — a cut-off answer
reaching you as if it were a real answer — is already prevented today, by the run loop, for the
case that actually happens. The remaining imprecision costs a label on a rare path.

**On silence.** The gate holds: the implementer prompt is not compiled until you answer.

**Trace.** Master §12 (staged card), intention §17A.13 AI table, master §6.3
`AiProviderFailureReason`, phase-9 C5, `MAX_OUTPUT_RETRIES`.

> **Evidence the two earlier sessions did not have, recorded for the coordinator, not for the
> card.** Both the phase-8 review and the phase-8 coordinator discussed truncation as the
> *no-text* case only (phase-8 `C6(k)`: "a step that finishes with `length`, no tool calls, and a
> throwing output getter"). Read from the library, `finishReason: "length"` splits in two at
> `ai/dist/index.js:6281`:
> - **text present** (the dominant shape) → `Output.object.parseCompleteOutput` cannot parse the
>   truncated JSON and throws `NoObjectGeneratedError` carrying `text`, `usage`, `finishReason`
>   (`:3732`–`:3742`; constructor `:242`). `client.ts:161`–`:166` catches it and **returns
>   `{ kind: "final", output: error.text, usage }`** — a normal final step whose `output` is a raw
>   **string**. It never becomes an `AiProviderError` at all. Branch 3 is therefore already the
>   shipped behaviour for this shape.
> - **no text** (`text.length === 0`) → `generateText` resolves with no output, the `output` getter
>   throws `NoOutputGeneratedError` (`:6417`) inside `mapResult`, and `fromSdkError`
>   (`errors.ts:103`) labels it `invalid_response`. This is the only shape the card is about.
>
> The owner's recorded leaning (branch 2) and the review's recommendation (branch 3) point at
> opposite treatments of a case that turns out to be the *rare* half of the condition, while the
> common half already behaves as branch 3. That is why branch 1 is recommended: it is not a
> compromise, it is the observation that the disputed behaviour mostly does not exist.

---

## 1. Gate check — what I observed

| # | Required | Observed | ✓ |
|---|---|---|---|
| 1 | Intention line 5 `RATIFIED`; §23 ends at round 18 | Line 5: `` `RATIFIED` (2026-09-05, by the owner, David, …) ``. Last changelog heading is **Round 18** at `planing/proposal-preparation-backend-intention.md:1239`; file ends at line 1242 with no round 19 | ✓ |
| 2 | Master §4 rows 1–8 `APPROVED`, row 9 `NOT_STARTED` | Rows 1–8 all `APPROVED` (`master-plan.md:128`–`:135`); row 9 `NOT_STARTED` (`:136`) | ✓ |
| 3 | `src/lib/agent/` and `src/features/proposal-preparation/server/tools/` do not exist | `ls`: "No such file or directory" for both | ✓ |
| 4 | `src/lib/ai/` has twelve files; `index.ts` exports `createAiClient`, `createScriptedAiClient`, `createFailingAiClient` | `ls src/lib/ai \| wc -l` = **12**. `index.ts:16` exports `createAiClient`; `:17` exports `createFailingAiClient, createScriptedAiClient` | ✓ |
| 5 | Plan header `state: NOT_STARTED`; table is **6 criteria / 22 rows / 4 mutations**, re-derived | Header line 4 `state: NOT_STARTED`. Counts re-derived by command below | ✓ |

**Counts re-derived, with summands.** `grep -c '^| C[0-9]'` → **22 rows**. Per criterion,
`grep -o '^| C[0-9]\+' | sort | uniq -c` → `C1 3 + C2 3 + C3 6 + C4 3 + C5 3 + C6 4 = 22`.
Distinct criteria: **6**. Lettered-span check (`^| C[0-9]([a-z]–[a-z])`) returns nothing, so no row
expands. Distinct mutation ids: `MUT-09-1, MUT-09-2, MUT-09-3, MUT-09-4` = **4**.
Header line 69 declares 6 / 22 / 4 and reconciles. Master §4 row 9's summands (`22` rows, `4`
mutations, `6` criteria) match. Phase sizing: 6 criteria ≤ the charter's 8. **Gate passes; I began.**

## 2. Reality checks

- **All nine declared paths are new and correctly marked new.** Neither parent directory exists.
- **Read-first list resolves and says what the plan claims.** Master §6.3 carries
  `RunFailureReason` with the four members (`master-plan.md:272`); §6.4 carries `ToolKind`,
  `ToolDefinition`, `ToolContext`, `RunBudgets`, `RunResult`, `RunDeps` (`:354`–`:359`); §6.5
  carries `MAX_OUTPUT_RETRIES` and `DEFAULT_RUN_BUDGETS` (`:388`, `:391`); §6.6 carries `run` and
  the two tools (`:428`, `:429`, `:436`). Intention §17A.14, §17A.13, §17A.8, §4, §6 invariants 4,
  5 and 14 all resolve. Contracts `08` §1–§3/§5/§9/§10, `07` §7, `10` §3/§6/§8/§9 and `11` §4 all
  exist and support what the plan cites them for.
- **Prior-phase outputs verified in code, not assumed.** `MAX_SEARCH_QUERY_CHARS = 200` is exported
  from the **runtime-neutral** `schemas/content-candidate.ts:19` (importable by a tool);
  `positiveInt64StringSchema` at `schemas/shared.ts:112`; `contentCandidateSchema` at
  `content-candidate.ts:5`; `rankCandidates(query, catalog, language)` at
  `server/domain/rank-candidates.ts:60`; `FIXTURE_CATALOG` has **14** items against
  `MAX_CANDIDATES = 10`.
- **Two symbols the plan relies on do not exist anywhere.** `RecordedToolCall` (D20) and a
  registered home for `server/tools/index.ts` (D21).
- **`npm run build` yields no signal on `main`** (`src/styles/globals.css:1` imports the
  deliberately deleted `tokens.css`; phase-8 N6). Unchanged by this phase; noted so no session
  reads a red build as this phase's.

## 3. Applicable contracts

`08-agent-architecture.md` (§1–§3, §5, §8, §9, §10) · `07-integrations.md` (§5, §7, §8) ·
`10-security-and-trust-boundaries.md` (§3, §6, §7, §8, §9) · `11-testing-principles.md` (§4, §5) ·
`02-runtime-boundaries.md` (`server-only` on every new module) ·
`03-feature-architecture.md` (`src/lib/agent/` feature-agnostic vs the feature's `server/tools/`;
dependency direction forbids `src/lib/` importing `src/features/`) ·
`06-data-contracts-and-validation.md` (§2–§3, the tool boundary parses) ·
`04-server-architecture.md` (§6, error taxonomy) · `12-anti-patterns.md`, `13-decision-checklist.md`,
`14-documentation-principles.md` §8 at closeout.

The plan's own list omits `02`, `03`, `06`, `04` and `08` §8; `08` §8 and `11` §4 are the authority
for D08's second target (no vendor SDK reachable from `src/lib/agent/`), which no row covers.

## 4. Decision ledger

**Classes.** **P** coordinator amends this phase plan · **M** coordinator amends the master
registry · **I** owner decision, folded intention-first · **F** explicit implementer delegation.

**Totals: 26 rows — P 16 · M 7 · I 1 · F 2.** Listed rows: D01–D26. The class letters below
enumerate to P = {D03, D04, D05, D08, D09, D10, D12, D13, D14, D15, D16, D17, D18, D19, D24, D26}
(16), M = {D02, D06, D07, D20, D21, D22, D23} (7), I = {D01} (1), F = {D11, D25} (2);
16 + 7 + 1 + 2 = **26**, matching the 26 rows listed.

| # | Decision point | Class | Routing |
|---|---|---|---|
| D01 | Truncated-generation semantics (staged card, master §12) | **I** | Owner card 1 above. Recommendation branch 1; the library evidence in the card's note is the new material. |
| D02 | **`run` has no way to reach the tools' `ToolContext`.** §6.6's `run` takes `{ system, initialMessages, tools, outputSchema, budgets }` and `deps: RunDeps = { ai, now, logger }`; `ToolContext` (§6.4) needs `runId, traceId, companyId, remainingBudget, catalog, language`. Nothing supplies them, so the loop cannot invoke a tool at all — yet phase 11 task 8 already assumes it passes "a `ToolContext` carrying the catalog and language". | **M** | Amend §6.6's `run` signature to take `toolContext: Omit<ToolContext, "remainingBudget">` in its input object; `run` computes `remainingBudget` fresh before each `invoke`. Plan task 2 follows, plus one row asserting the `ctx` an `execute` receives carries the **remaining** budget, not the initial one (a stale budget in `ctx` is invisible and is what `ctx.remainingBudget` exists to prevent). |
| D03 | **The token budget's number is undefined when the provider reports none.** `Usage`'s three counters are independently `number \| null` (verified: `ai/dist/index.d.ts:320`–`:362`, mapped `?? null` at `client.ts:55`–`:61`), and C4(c) makes the accumulator null-propagating. If the budget is compared against that accumulator, **one unreported step silently disables the token budget for the rest of the run**, with every row green. §17A.14 is readable both ways. | **P** | State it: the reported `usage` stays null-propagating for §17A.14's cost reporting; the budget is compared against a **separate counter that treats an unreported `totalTokens` as 0**. One row: step 1 `totalTokens: null`, step 2 over `maxTokens` → `failed`/`tokens` **and** `usage.totalTokens === null`. Mutation: compare the budget against the reported accumulator → row red. *If the coordinator reads §17A.14's "absent is not zero" as binding on the budget too, this becomes an **I** row rather than a P row — do not choose silently.* |
| D04 | **What the loop does with a failed `invoke` is undetermined and the two codes differ.** Task 2 never mentions it; the Notes say `tool_output_invalid` ends the run failed; no row covers either. | **P** | `invalid_arguments` → appended as the tool result and the loop continues (`08` §3 MUST: "returned to the model as a structured tool error"); `invalid_tool_output` → run ends `failed`, `reason: "tool_output_invalid"` (Notes, §6.3). Two rows, one mutation (swap the two dispositions → the ending row red). Closes the prompt's observation that `tool_output_invalid` appears at the tool but nowhere at the run level. |
| D05 | `defineTool.invoke` has no stated behaviour when `execute` **throws** — reachable today: `strengthForScore` throws `RangeError` (`strength.ts:12`) and task 3 writes `ctx.language ?? throw`. | **P** | `invoke` does not catch: a throw from `execute` is a programming error (`04` §6) and propagates. State it in task 1; no row (recording an intentional absence, §9.0). Consequence: C6(d) cannot be implemented as a throw — see D06. |
| D06 | **`language_unresolved` has no representable shape.** `invoke`'s only error shapes are `{ code: "invalid_arguments", issues }` (from the *input* parse) and `{ code: "invalid_tool_output" }`; `ctx.language` is not input, so no mechanism in task 1 can produce C6(d)'s "`execute` body not reached". The code is in no master registry. | **M** | Give `defineTool` an optional `requires(ctx)` predicate returning `null \| { code }`, checked after the input parse and before `execute`; register the third result arm and the code in §6.3/§6.4. Smallest change that makes C6(d) mean what it says and that phases 11–12 can reuse. |
| D07 | **`get_content`'s output schema does not exist.** "candidate-shaped item" is an adjective for a mechanism (charter rule 5). `ContentCandidate` demands `score`/`matchStrength`/`reason`, meaningless for a direct fetch; `ContentItem` carries `createdAt` and `images` (`lib/proposales/index.ts:8`–`:15`), which §9.1 rule 3, `10` §6 and C6(c) forbid reaching the model. C6(b) and C6(c) are not decidable. | **M** | Define and register `contentDetailSchema = z.strictObject({ variationId, productId, title, description, truncated })` in `schemas/content-candidate.ts`, localized by `ctx.language` and truncated at `MAX_CANDIDATE_DESCRIPTION_CHARS`. `null` when the id is absent **or** the item has no `title[ctx.language]` — the same predicate `rankCandidates` applies at `rank-candidates.ts:64`–`:65`, so `get_content` can never surface an item `search_content` is forbidden to return. `ctx.language === null` takes D06's `requires` path. |
| D08 | **The inherited purity guard has no target, no form list and no row.** The Notes carry the obligation; the 22 rows contain no purity row at all; the plan never says which files are scanned or what is forbidden. The guard it inherits from (`rank-candidates.test.ts:63`–`:83`) is eight inline regex literals inside one `it()` with no proof row — the exact shape §9.1 rule 17 was written against. | **P** | One module-scope symbol in `test/helpers/` (precedent: `test/helpers/proposales-arithmetic-scan.ts`, imported at `applied-pricing.mapper.test.ts:6`) exporting **both** the predicate and the forbidden-form listing. Two rows: one applies it to the two tool files and to `src/lib/agent/*.ts`; one proves it fires for **all four forms** (static import, `import type`, dynamic `import(`, global access) plus D09's literal form. Both rows name the symbol — *"flagged by the same `hasForbiddenForm` the production scan applies"* (§9.1 rule 17). A third assertion pins the scanned-file listing and the form listing as non-empty and equal to the expected sets (phase-8 S3: both listings passed vacuously on a shrunken list). Forbidden set, derived from `07` §7, `08` §8, `11` §4 and §9.1 rule 3: `fetch(`, `node:`, a **value** import of `@/lib/proposales`, `@/lib/env`, `process`, `Date`, `Math.random`, dynamic `import(`, and any `@ai-sdk/` or bare `"ai"` import inside `src/lib/agent/`. **Do not touch phase 7** — it is approved; extracting across the two phases would put a phase-7 test file inside this perimeter. |
| D09 | **Obligation 1 (`MAX_SEARCH_QUERY_CHARS`): no runtime assertion can distinguish the constant from a literal `200`,** because both are 200. A value-equality row is green either way, which is why the owner's decision needs an identity instrument. | **P** | Two instruments, doing different jobs, and the plan must say so. **(a)** D08's shared scan additionally flags a numeric literal in the tool's query `.max(` — proven by planting `.max(200)` and observing red. This is the identity guard the owner's decision asks for. **(b)** A behavioural cross-path row computing both bounds from the imported constant: a string of exactly `MAX_SEARCH_QUERY_CHARS` accepted and `+1` rejected by **`searchContentInputSchema` and by `searchContentTool`'s input**, so the two search paths cannot drift. Row text states which one carries which claim; (b) alone would satisfy the plan's words and prove nothing about identity. |
| D10 | **C5's fixtures are shapes `createAiClient` does not produce (§9.1 rule 18).** With `outputJsonSchema` passed, `Output.object.parseCompleteOutput` validates the model's text against the JSON Schema **before** `generateText` resolves; a failure throws `NoObjectGeneratedError` (`ai/dist/index.js:3732`–`:3757`), and `client.ts:161`–`:166` converts it to `{ kind: "final", output: error.text, usage }` — **`output` is a raw string**. A malformed *object* is producible only through the refinement gap (`z.toJSONSchema` drops `.refine()` checks), which makes D11 load-bearing. | **P** | At least one C5 row's fixture is `{ kind: "final", output: "<partial JSON text>" }`, with the fixture cell citing `client.ts:165` as the construction site. Keep one object-shaped row and cite the refinement gap as *its* production cause, so both real paths are covered rather than one imagined one. |
| D11 | **The Zod → JSON Schema conversion is unnamed.** `descriptor().inputJsonSchema` and `GenerateStepInput.outputJsonSchema` are both `Record<string, unknown>` and nothing says how a Zod schema becomes one. If `run` omits `outputJsonSchema`, `generateText` falls back to the `text()` spec (`ai/dist/index.js:6282`) and **every** final output arrives as a string, making C5 trivially true. `get_content`'s input carries a `.refine()` (`shared.ts:114`), and `zod@4.5.4`'s generator has an `unrepresentable` policy that throws for unrepresentable types (`zod/v4/core/json-schema-processors.js:233`–`:241`). | **F** | Name `z.toJSONSchema(schema, { io: "input" })` in tasks 1 and 2 and require `run` to pass `outputJsonSchema` always. Delegate by name: the implementer verifies the call does not throw on **both** real tool schemas and on a representative output schema, and reports the option set it needed. One row: `descriptor()` for both shipped tools produces a JSON Schema without throwing and carries the query bound as `maxLength` — which is where D09(b)'s tool half lands. |
| D12 | **C5(a) and C5(c) are the same test at `MAX_OUTPUT_RETRIES = 1`,** and C5(b)'s "both `final` outputs invalid" hardcodes the constant (charter rule 13). | **P** | C5(b)'s fixture becomes `MAX_OUTPUT_RETRIES + 1` invalid finals. C5(c) becomes a distinct claim — *the loop stops at the bound even when more steps are available*: script `MAX_OUTPUT_RETRIES + 3` invalid finals, assert `ai.calls.length === MAX_OUTPUT_RETRIES + 1` and that no `script_exhausted` occurred (unconsumed steps remain). Give C5(c) its own mutation (widen the retry comparison by one → C5(c) red); it currently has none. |
| D13 | **C5(a)'s expected outcome is two claims in one cell** — "contains the issue paths **and not** the raw model text" (the prompt's own observation). Sequential assertions short-circuit (§9.1 rule 12). | **P** | Split into two rows, one per claim, and record which mutation bites on which. The sentinel-absence half is the security-relevant one (`10` §6, §17A.13's "paths only, never the model's text"). |
| D14 | **C6(a)'s instrument is `assert f(x) == f(x)`, and its fake has no reachable call site.** The expected outcome recomputes `rankCandidates(...)`, so any mutation of the ranking moves both sides — §9.1 rule 15 names this exact walk-guard shape. And `ToolContext` (§6.4) carries **no** Proposales client, so "`fake.calls` unchanged" has *zero* production causes: the tool structurally cannot reach a client. | **P** | Assert at least one concrete candidate tuple (`variationId`, `score`, `matchStrength`), as phase 7's own repair did (`rank-candidates.test.ts:29`–`:36`). Replace the fake-in-scope clause with D08's source guard, which is the instrument that can actually fail. M3's guard at this phase is C2 + D08, not a fake nothing can call. |
| D15 | **No C3 row asserts `failure.reason`, and nothing checks two budgets exhausting on one step** (the prompt's observation). Every C3 row asserts only `failure.budget`, so a result carrying `reason: "model_output_invalid", budget: "tokens"` passes all six. | **P** | Add `reason === "budget_exhausted"` to C3(a–c)'s expected outcomes (no new row — reduce the ask, don't add one). Add **one** row for the simultaneous case naming the precedence; recommend wall time, since it is checked first and is the platform limit (`08` §9, `02` §9). |
| D16 | **The loop's message-append behaviour has no row, and it is the single highest-value gap in the table** (the prompt's observation, confirmed). `AgentMessage`'s three closed forms exist so an assistant's tool calls and the tool results correlate by `toolCallId` (§6.4, verified against `@ai-sdk/provider-utils` `dist/index.d.ts:1610`). **A loop that discarded every tool result entirely passes all 22 rows as written.** | **P** | One row: after a tool-call step, `ai.calls[1].messages` ends with the assistant `toolCalls` form followed by the `tool` `results` form, correlated by the **same** `toolCallId`, carrying the tool's output as the result value. Mutation: drop the tool-result append → row red. Also asserts §9.1 rule 3 and `10` §6 — the results reach the model as **labeled data**, never concatenated into instructions. |
| D17 | **C6(c)'s key-exactness has no mutation** (the prompt's observation) and is true by construction: `contentCandidateSchema` is a `z.strictObject` and `rankCandidates` builds the object literally, so no realistic production edit can add `createdAt`. | **P** | Keep the row — it is the `10` §6 leak guard — and give it the mutation *add `createdAt: item.createdAt` to `rank-candidates.ts`'s returned object* → C6(c) red. That mutation also proves the tool's **output** parse is wired: a pass-through that skipped `safeParse` would leave the row green. |
| D18 | **Logging has no row** (planner lint: every task produces at least one row — the lint phase 8 earned). Task 2 names four events; `08` §10 requires ids, counts and outcomes; `10` §7 and §9.1 rule 3 forbid model text. | **P** | One row, MVP-sized: a run with an injected logger emits `agent.run.start` and `agent.run.end` carrying `runId` and the tool-call count, and **no** emitted record contains the model-output sentinel. Mutation: log the model text → row red. Reduce the ask (one row, not four); do not drop the guard (§9.0). |
| D19 | **`RunResult` has no `clarification` arm although §17A.13 says "the run result carries `{ status: "failed" \| "clarification" … }`".** Not a defect — phase 11 task 9 owns the mapping (`failed` on budget → `clarification` when an `ask_if_underivable` item is still unresolved) and the loop is deliberately generic (§6.9). But a phase-9 reviewer reading §17A.13 will find it as a conflict. | **P** | One sentence in the plan's Notes recording that the two-arm union is deliberate and naming phase 11 task 9 as the home of the mapping. Costs a line; saves a review round. |
| D20 | **`RecordedToolCall` is named in master §6.4's `RunResult` and defined nowhere** — charter manifest property 2, the very defect that section records as earned. | **M** | Register the shape in §6.4. Recommend `{ toolCallId: string, name: string, ok: boolean }` — ids and outcome only: `08` §10 keeps arguments out of the operational record, and `RunResult.toolCalls` is what the service reports upward. |
| D21 | **Five phase-9 names are unregistered**, against master §6's own rule that a name not listed is added there before use: `defineTool`'s signature and its result union; `assertReadOnlyToolSet`; `PREPARATION_TOOLS`; `server/tools/index.ts` (absent from the §6.1 module map, which lists only the two `.tool.ts` files); and `readOnly` on `run` (§6.6 omits it while phase 11 C8(d) already depends on `readOnly: false`). | **M** | Add all five to §6.1/§6.6. |
| D22 | **The tool-error codes are in no §6.3 registry**: `invalid_arguments`, `invalid_tool_output`, `language_unresolved`. Phases 11 and 12 will read this union. | **M** | Register a closed `ToolErrorCode` union in §6.3 beside the other reason registries, with its defining module `src/lib/agent/types.ts` / phase 9. |
| D23 | **`createScriptedAiClient` does not record the `options` argument, so C3(f) cannot be written from the fake the plan mandates.** `scripted.ts:24` is `async generateStep(input)` — the second parameter is dropped, and `calls` is typed `GenerateStepInput[]` (`:14`–`:31`). C3(f) asserts "`generateStep` called with `timeoutMs <= 500`". | **M** | Extend the fake with a parallel `stepOptions: Array<{ timeoutMs: number }>` — **additive**, so phase 8's and phases 11–12's existing `calls` assertions are untouched — and amend §6.6's `createScriptedAiClient` row. **The file perimeter becomes 10 paths, not 9**: `src/lib/ai/scripted.ts` (and its colocated test) joins the list. A hand-rolled local double in `run.test.ts` is the alternative and is worse: it is a second seam nothing else uses. |
| D24 | The wall-time comparison and the `timeoutMs` floor are undetermined. `timeoutMs = min(AI_CALL_TIMEOUT_MS, remaining)` feeds `AbortSignal.timeout` at `client.ts:154`; whether the pre-call check is `elapsed >= wallTimeMs` or `>` decides whether `remaining` can reach `0`. | **P** | State `elapsed >= wallTimeMs → failed`, so `remaining ≥ 1` at every call site and the ceiling is never non-positive. One extra assertion inside C3(b); no new row. |
| D25 | Free choices, to be delegated **in writing** rather than taken silently: the loop's internal control-flow shape; whether `invoke` is `async`; the retry `user` message's wording beyond D13's two claims; and the Zod-issue flattening idiom. | **F** | Delegate all four by name in the implementer prompt. On the last: four sites already spell it `issue.path.map(String)` (`services/search-content-for-human.ts:28`, `schemas/workflow-state.ts:62`, `lib/proposales/client.ts:25`, `lib/errors/error-dto.ts:32`); the implementer **reuses that spelling and does not refactor the four** (follow-up 7 owns the consolidation). |
| D26 | **C5's `M6` trace resolves to an entry that says something else.** M6 guards "every Proposales or **provider** failure surfaces as a taxonomy error with no raw upstream body". §17A.13 states the opposite for this row: model output failing **our** schema "is not an integration failure at all". C5(b)'s real claim — the model's text never reaches the result — is §17A.13's "paths only" plus M15's "never a partial proposition". | **P** | Re-trace C5 to §17A.13 + M15. **Reverse-trace consequence, checked:** §7.2's M6 row loses `9.C5`, but M6 keeps `3.C1, 3.C2, 8.C4, 14.C1, 14.C2, 14.C6, 14.C7, 14.C8, 15.C4`, so **no ledger entry becomes unserved**. Regenerate §7.2 after the fold. |

## 5. Row-by-row decidability pass (all 22 rows)

Two questions per row: *could I write the concrete assertion today from the artifacts alone?* and
*is its fixture a shape the system can actually produce?* (§9.1 rule 18).

| Row | Decidable? | Fixture producible? | Note |
|---|---|---|---|
| C1(a) | **Yes** | **Yes** — a model can emit `{ query: 5 }`; a `z.string()` parse gives `path: ["query"]` | `issues`' shape unregistered (D22) |
| C1(b) | **Yes** | Yes — the shape is ours; the test-only tool has a caller, so charter rule 4 is satisfied | Proves `invoke` only; nothing proves the loop reacts (D04) |
| C1(c) | **Yes** | Yes | Says nothing about `inputJsonSchema`'s content — `{}` passes (D11) |
| C2(a) | **Yes** | Yes | Passes vacuously on an empty `PREPARATION_TOOLS` (phase-8 S3); add "contains exactly the two named tools" |
| C2(b) | **Yes** | Yes | Sound rule-15 proof for C2(a); the strongest row in the table as written |
| C2(c) | **Yes** | Yes | MUT-09-1 names file and site correctly |
| C3(a) | **After D02** | Yes — `kind: "tool_calls"` is what `mapResult` returns (`client.ts:117`–`:126`) | Cannot dispatch without a tool context; no `reason` assertion (D15) |
| C3(b) | **After D24** | Yes — `now` is injected through `RunDeps` | |
| C3(c) | **After D03** | Yes | The compared number is undefined; this is the row D03 is about |
| C3(d) | **Yes** | **"any of the above" is not a fixture** — it must name one | Trivial P fix |
| C3(e) | **After D02** | Yes — `calls` is an array (`client.ts:119`) | MUT-09-2 well-formed |
| C3(f) | **No** | **No** — the mandated fake discards `options` (`scripted.ts:24`) | D23 |
| C4(a) | **Yes**, once the fixture names the two step kinds | Yes | The first step must be `tool_calls` or the loop ends |
| C4(b) | **Yes** | Yes | |
| C4(c) | **Yes** | **Yes — verified.** The three counters are independently `number \| undefined` (`ai/dist/index.d.ts:320`–`:362`), mapped `?? null` at `client.ts:55`–`:61` | Rule-18 clean, as the prompt anticipated. MUT-09-3 well-formed |
| C5(a) | **After D13** | **No** — the production shape is a raw string, not a malformed object (D10) | Two claims in one cell |
| C5(b) | **Yes** | **No** — same as C5(a); and "both" hardcodes the constant (D12) | Strong row otherwise: `issue.path` is `PropertyKey[]` in Zod 4 (`zod/v4/core/errors.d.cts:9`), so "`path` are `string[]`" is a real guard. MUT-09-4 well-formed |
| C5(c) | **Degenerate** — identical to C5(a) at `MAX_OUTPUT_RETRIES = 1` | n/a | No mutation (D12) |
| C6(a) | Yes, but **the guard cannot fail**: `f(x) == f(x)`, and the fake has zero production causes | Yes | D14 |
| C6(b) | **No** — no output schema exists | n/a | D07 |
| C6(c) | **Yes** | Yes | True by construction; no mutation (D17) |
| C6(d) | **No** — no mechanism produces the outcome | n/a | D06 |

**Tally:** 11 decidable as written (four of them with a stated weakness), 6 decidable only after a
named amendment, 4 not decidable, 1 decidable-but-unfalsifiable. **Three rows' fixtures are shapes
the system does not produce** (C5(a), C5(b), and C3(f)'s recording seam) — the phase-8 defect
family, caught here at the price of a paragraph.

## 6. Trace verification, both directions

**Forward** (each row's trace cell resolves and says what the row asserts):

- C1(a) → §17A.8 "the model assists by producing the query strings — which are tool *inputs*"
  (`:702`) and `08` §3's structured-tool-error MUST (`:65`). ✓
- C1(b) → §17A.8 "the tool's output schema is the only place they exist" (`:702`). ✓
- C1(c) → `08` §3. **Weak.** §3 governs `ctx` and output shaping; the "no `execute` in the
  descriptor" claim is carried by master §6.4's `ToolDescriptor` row and `08` §8. Re-trace to those.
- C2(a–c) → M3 ✓ ("the run's tool set is read-only **by construction**") and §22 criterion 3 ✓
  (§7.3 maps criterion 3 → 9.C2).
- C3(a–f) → M15 ✓, §17A.14 ✓.
- C4(a–c) → M15 ✓, §22 criterion 14 ✓ (§7.3 maps criterion 14 → 8.C5, 9.C4).
- C5(a–c) → §17A.13 ✓; **M6 ✗ — D26.**
- C6(a–d) → §17A.8 ✓, `08` §3 ✓, `10` §6 ✓ (`:60`).

C1 and C6 trace to mechanism contracts rather than ledger IDs, which the charter's link 2 permits
explicitly ("the ledger ID **or** mechanism contract").

**Reverse** (every entry this phase claims to serve is served by at least one row): §7.2 assigns
phase 9 **M3** → 9.C2 ✓, **M15** → 9.C3 and 9.C4 ✓, **M6** → 9.C5 ✗ (D26; M6 keeps nine other
servers, so nothing becomes unserved). §7.3 assigns criteria 3 and 14 ✓. **No ledger entry claimed
by this phase goes unserved after the fold**; §7.2's M6 row is regenerated.

## 7. Coverage adequacy — the plain answer the prompt asked for

**22 rows and 4 mutations are not proportionate to what this phase guards**, and the shortfall is
concentrated rather than diffuse. Six of the 22 rows are C3's budgets, which is the *best*-covered
surface. What is uncovered is the loop itself and the two inherited obligations:

- **the message loop** — a `run` that discarded every tool result would pass all 22 rows (D16);
- **tool failure at the run level** — no row, and the two codes have opposite dispositions (D04);
- **both inherited obligations** — the purity guard and the shared query bound have **zero** rows
  between them, though the Notes carry both as obligations (D08, D09);
- **the JSON-Schema conversion**, without which C5 is trivially true (D11);
- **`get_content`'s output** (D07) and **logging** (D18).

I am routing **13 new rows and 9 new mutations**, which puts the table near **35 / 13** — the
coordinator derives the exact figures by command after the fold; I am not typing a total into a
plan (this project's own repeated lesson). That is deliberately far short of phase 8's 51 / 22:
§9.0 is binding, this is an MVP the owner is presenting, and I trimmed by **reducing asks, never
by dropping guards** — D15, D17, D24 and D26 add assertions to rows that already exist rather than
rows of their own, D18 is one row where four events could have bought four, and D12 rewrites C5(c)
instead of adding to it.

**Exclusions, recorded where the excluded work lives.** (i) The phase-7 purity guard's own rule-17
defect (`rank-candidates.test.ts:63`–`:83`: eight inline regex literals, no proof row) is **not**
repaired here — phase 7 is approved and its test file is outside this perimeter; recorded as a
**phase-15 candidate**, with the note that phase 9's shared symbol is the natural thing to adopt
there. (ii) `08` §2's `approval.ts` is not built: v1 instantiates no `prepare` or `mutate` tool
(§6.4 `ToolKind`), and building it would be infrastructure introduced because a contract mentions
it (guide §1). Recorded in the plan Notes. (iii) A row for `RunFailureReason`'s `script_exhausted`
is excluded — it is a fake-only test aid (§6.3) and D05 makes it propagate rather than be caught;
recorded in the Notes so no reviewer reads its absence as an omission.

## 8. Skeleton — non-authoritative, and discarded

I derived the loop, `defineTool` and both tools on paper to find the above. **The sketch is not
attached and must not reach the implementer**: doing so would make this session a second planner
and reintroduce exactly the coupling the fresh-session rule prevents. Everything it produced that
matters is a ledger row above.

## 9. Evidence and write perimeter

**Evidence budget: zero, honoured.** No test at any scope, no L4 stamp, no named mutation, no
`npm install`, no provider call, no network, no `npm run build`. Every claim above comes from
reading files: repository artifacts, and installed library source at `node_modules/ai/dist/`
(`index.js`, `index.d.ts`), `node_modules/@ai-sdk/provider-utils/`, and `node_modules/zod/v4/`.
No authorization line was needed because no run was made.

**Write perimeter — one file:**
`handoffs/reviewer/phase-09-projection-round-0.handoff.reviewer.md` (this document). No code, no
test, no plan, no fixture, no `package.json`, no lockfile, no tool-recorded state (no archgraph in
this repository, master §8). `master-plan.md` §4 row 9 was **not** written: the row accurately
describes a dispatched mandatory projection and its two inherited obligations, and the
`NOT_STARTED → PROJECTED` transition is the coordinator's act on consumption (phase-8 precedent).
Flagged here so the coordinator decides rather than inheriting a silent choice.

## 10. Verdict

**`AMENDMENTS_REQUIRED`.** 26 ledger rows; one needs the owner. The implementation gate stays
closed until the ledger is fully routed and card 1 is answered.
