---
plan: 6
role: projection
round: 0
verdict: AMENDMENTS_REQUIRED
date: 2026-09-06
actor: Claude
---

# Phase 6 projection — round 0

## Opening

Phase 6 is not ready to be handed to an implementer. The plan is well built where it is
specific — the clarification rules, the strictness rules and the error-precedence rule are all
sharp enough to write tests from today — but it contains one arithmetic impossibility and one
unowned trust decision, and neither can be settled by the implementer without inventing
product policy. The impossibility is that the phase must build a "largest legitimate workflow"
fixture and prove it fits under the size ceiling; the ceiling is set to roughly a quarter of what
the other limits permit, so that proof cannot be written at all. The unowned decision is whether
the rule table that decides "is this proposal allowed to be approved" is read from the
application or from the data the browser sends back. Two things need the owner personally; the
remaining twenty are plan wording or explicit delegations the coordinator can route.

## ⚠ OWNER DECISIONS REQUIRED (2)

### Card 1 — the workflow size ceiling contradicts the content limits

**Question.** Raise the workflow-state size ceiling to fit a full-sized proposal, lower the
content limits, or drop the promise that ordinary work never hits the ceiling?

**Story.** A hotel sends a brief for a thirty-item conference package. The agent fills each item
with the catalogue's own descriptions, the reviewer adds comments, and the previous version is
kept beside the current one so the approval can show what changed. The page posts that back and
gets "workflow state too large". Nothing unusual has happened and nothing is wrong with the
proposal — the ceiling was simply set to a quarter of what the item and text limits allow. The
human cannot continue and there is no way to make the proposal smaller except deleting real work.

**Branches.**
- **A — raise the ceiling to about 1 MB:** every legitimate proposal fits; request bodies grow, still far inside platform limits.
- **B — lower the limits (thirty items → about eleven, or shorter descriptions):** states stay small; a genuinely large proposal becomes unrepresentable.
- **C — change nothing and drop the promise:** a real proposal can hit the ceiling, and the human meets it with no way forward.

**Recommendation.** A — the ceiling exists to stop runaway payloads, not to cap legitimate
proposals, and 1 MB is still comfortably inside the platform's request limits.

**On silence.** The gate holds; phase 6 is not dispatched, because the criterion that proves the
ceiling is generous cannot be written against the current numbers.

*Trace: intention §17A.3; master plan §6.5 `MAX_WORKFLOW_STATE_BYTES`; phase 6 C7(c), task 7.*

### Card 2 — who owns the rule table that gates approval

**Question.** Should approvability be decided from the application's own rule table, or from the
copy of that table inside the state the browser sends back?

**Story.** The page posts back a workflow state in which the language item is marked "not needed
to create" — a stale copy, a hand-edited payload, or a bug in the page. Approval goes through
with no language, and the request reaches Proposales missing the one field the product decided
can never be missing. Nothing logs a warning: the server did exactly what the state told it,
because the state is where the rule lives.

**Branches.**
- **A — the rule table stays in the application:** the state carries only what each item's answer was; a tampered rule changes nothing.
- **B — keep deciding from the state's copy:** consistent with "the human is the authority", but the product's own rules become editable by whatever posts to the server.

**Recommendation.** A — what was answered is the human's data and belongs in the state; the two
policies are the application's rule and are not the caller's to send.

**On silence.** The gate holds; phase 6 is not dispatched, because the approvability fixtures
depend on which copy is authoritative.

*Trace: intention §17A.3, §17A.6; master plan §6.4 `informationItemStateSchema`; phase 6 C2, task 3.*

## Gate check

| Condition | Result |
|---|---|
| Intention header `RATIFIED` | pass |
| Tracker row 5 `APPROVED`, row 6 `PROJECTED` | pass |
| Phase 6 plan present, declares 8 criteria / 45 rows / 5 mutations | pass — re-derived independently: 8; 45 (11+7+5+4+6+5+3+4); 5 (`MUT-06-1…5`) |
| Phase 5 artifacts archived under `archive/plan_5/`; no live phase-5 handoff | pass — 8 rows archived, `handoffs/implementer/` and `handoffs/reviewer/` empty |
| `git status --porcelain` | empty at session entry |

## Decision ledger

| # | Decision point | Class | Routing |
|---|---|---|---|
| D1 | Task 5 prescribes `Buffer.byteLength(...)` inside `schemas/workflow-state.ts`. `Buffer` is a Node global; `03-feature-architecture.md` §2 requires `schemas/` to hold nothing "not importable from both runtimes", and `02-runtime-boundaries.md` §9 warns Node APIs break under Edge. The workflow state is a caller-held object round-tripped through the browser (master §6.9), so this module will be imported client-side. | plan gap | amend task 5 to `new TextEncoder().encode(serialized).length` |
| D2 | `JSON.stringify(raw)` returns `undefined` for `undefined`, a function or a symbol, and throws on a cycle or a `BigInt`. `Buffer.byteLength(undefined)` throws `TypeError`. The entry accepts `unknown` (`06` §3), so `parseProposalWorkflowState(undefined, origin)` crashes instead of returning a `ValidationError`. | plan gap | amend task 5 (guard the serialize step) and add a C7 row for a non-serializable input |
| D3 | Task 5's parenthetical — "the caller may also pass the original string length via an option" — names no option, and the signature in the same sentence is two-argument. C7(b)/(c) do not say which measurement is authoritative. | plan gap | amend task 5: name the option and its precedence, or delete the clause |
| D4 | The `editorUrl` refinement is written as `new URL(u).protocol === "https:" && new URL(u).origin === editorOrigin`. `new URL` throws on a non-URL string, and a thrown refinement escapes the parse. No C6 row feeds a malformed URL — C6(b)/(c)/(d) are all well-formed. The safe pattern already exists at `src/lib/env/server.ts:5` (`z.url().refine(...)`). | plan gap | amend task 5 to `z.url().refine(...)`; add a C6 row for `editorUrl: "not-a-url"` |
| D5 | C7(c) requires `maximalConformingState()` to serialize under `MAX_WORKFLOW_STATE_BYTES`. Counting **only** mandatory capped text and **zero** JSON syntax: per block `6000 + 200 + 500 + 3×1000 = 9700`; × `MAX_BLOCKS` 30 = `291,000`; plus proposition-level capped text `11,400` → `302,400` per proposition; × 2 propositions `604,800`; plus brief `8,000` and a capped clarification round `11,500` → **floor 624,300 bytes against a 262,144-byte bound (2.38×)**. A *single* maximal proposition (302,400) already exceeds the bound; at most ~11 of the 30 permitted blocks fit. §17A.3's "the caps are set so that a conforming workflow cannot reach the state bound by ordinary use" and §6.5's "> a state containing MAX_BRIEF_CHARS + MAX_BLOCKS blocks with MAX_ALTERNATIVES_PER_BLOCK alternatives" are both false as shipped. | **intention gap** | **owner card 1** |
| D6 | `maximalConformingState()` needs a maximal proposition, but master §6.7 assigns `maximalConformingProposition()` to **phase 10**. Phase 6 must either build it inline or pull the fixture forward. | plan gap | amend §6.7 or task 7 to name where the maximal proposition comes from |
| D7 | Task 7 says "every text at cap", but an alternative's `title` is `z.string().trim().min(1)` — uncapped (`schemas/proposition.ts:43`). "At cap" is undefined for it. | plan gap | amend task 7 to state the value for uncapped strings |
| D8 | Task 3's predicate reads `createPolicy` from the `items` record, which `proposalWorkflowStateSchema` carries inside the caller-held state (master §6.4, `informationItemStateSchema`). §17A.6 calls the two policies "binding" — a fixed table — yet approvability is decided from the caller's copy of it. §17A.6's predicate does not say which copy is authoritative. | **intention gap** | **owner card 2** |
| D9 | C3(e) expects only "`ValidationError`" for a duplicate `questionId` — no reason, no path. `ValidationReason` (master §6.3, `src/lib/errors/app-error.ts:15`) has no duplicate-id member, so the implementer must silently pick `domain_rule`, reuse `unknown_question_id`, or omit the reason. Charter rule 2: each row asserts one exact expected outcome. | plan gap | amend C3(e) to name the reason and the issue path |
| D10 | Precedence is undefined when one answer is both a duplicate and unknown, and when several answers are each unknown (first issue only, or all?). C3(a) pins `["answers","0","questionId"]`, which is fixture-lucky under either rule. This is M8's named defect family ("error-precedence drift making a criterion pass by fixture luck") applied to `applyAnswers`. | plan gap | amend task 2 with the check order; add a row for a two-bad-answer input |
| D11 | §17A.6 states `deferred_by_user` is "reachable only from `ask_if_underivable`". Nothing in task 2, task 3 or any row enforces or observes it. `applyAnswers` takes `questions` as data, so a question generated for a `do_not_ask` item (a phase-11 bug) would silently record a human deferral that never happened — exactly M18's defect family. | plan gap (unserved invariant) | amend task 2 to reject or ignore a skip on a `do_not_ask` item; add a C3 row |
| D12 | `applyAnswers(items, questions, answers)` parameter types are unstated. Whether `answers` is `ClarificationAnswer[]` or the parsed `clarificationAnswersInputSchema` object decides whether the C3(a) path `["answers","0","questionId"]` is natural or hand-constructed. | free choice | delegate explicitly, with the resulting path form recorded |
| D13 | Master §6.4 defines `clarificationSchema` as `{ questions: array }`, but `proposalWorkflowStateSchema`'s `clarification?` is `{ questions, answers: array }`. The two contradict, and no row exercises the `answers` half of the state's clarification object. | plan gap (internal contradiction) | amend §6.4 / task 4; add a C5 row if `validState()` carries a round |
| D14 | Task 1 requires `informationItemsRecordSchema` to be "strict with all 10 keys required". No row tests a **missing** item key or an **unknown** item key inside `items`; C5(b)/(d) cover the top level and `brief` only. Charter manifest property 1: a requirement with no row. | plan gap (criteria) | add two C5 rows |
| D15 | The function is `nextVersion` in task 6 and C8(b)/(c)/(d), and `bumpVersion` in master §6.6 ("computes `version` from the inbound state (`bumpVersion`)"). Charter manifest property 2 — every symbol a plan names must resolve. | plan gap (naming) | amend one of the two |
| D16 | C8(d) discharges "the caller cannot supply the version" with `expectTypeOf` and an expected outcome of "compiles". `vitest.config.mts` declares no `typecheck` project and `npm test` is `vitest run`, under which `expectTypeOf` is a runtime no-op that cannot fail. As written this row ships a guard that always passes. Charter rule 15 and rule 1. | plan gap (guard cannot fail) | amend C8(d): assert arity/shape at runtime, or add a `typecheck` project and say so |
| D17 | C2(d) ("`block_selection: supplied`, rest supplied → approvable") has the same predicate and the same outcome as C2(a) ("all supplied → approvable"); its own note defers the derivation rule to phase 11. The row's fixture is satisfied for a reason other than the row's own predicate — charter rule 2's companion. | plan gap (row decidability) | amend C2(d) to the case that distinguishes it, or fold it into C2(a) and re-derive the count |
| D18 | `validState()`'s contents are undetermined — clarification round? draft reference? one proposition or two? C5(a), C6(a), C7(a) and C8(a) all read it, and C8(b) needs a state **without** propositions. | free choice, load-bearing | delegate with a stated minimum composition |
| D19 | The test editor origin `https://proposales.test` appears only inside C6(a)'s fixture cell; C6(b)/(c)/(d) assume it without naming it. | free choice | delegate: name the fixture constant once |
| D20 | The plan does not say that `server/domain/information-registry.ts`, `approvability.ts` and `bump-version.ts` open with `import "server-only"`. `02-runtime-boundaries.md` §3 requires it of every `features/<feature>/server/**` module, so it is determined — recorded only so the implementer does not read the plan's silence as permission. | determined by contract | no routing; note in the implementer prompt |
| D21 | The answer union's strictness is unstated: does `{ kind: "skip", text: "x" }` fail? | free choice | delegate |
| D22 | Whether `applyAnswers` copies or mutates `items` is unstated; §6.6's `→ items'` implies pure, and no row observes it. | free choice | delegate |

## Reality checks

**Passed.**
- All twelve paths in "Files expected to change" are new: none of `information-items.ts`, `clarification.ts`, `workflow-state.ts`, `information-registry.ts`, `approvability.ts`, `bump-version.ts` or `fixtures/states.ts` exists under `src/features/proposal-preparation/`. The count is twelve, as stated.
- Every import the tasks imply already exists: `boundedText`, `MAX_BRIEF_CHARS`, `MAX_QUESTION_CHARS`, `MAX_ANSWER_CHARS` (`schemas/shared.ts`); `propositionSchema`, `MAX_BLOCKS`, `MAX_ALTERNATIVES_PER_BLOCK` (`schemas/proposition.ts`); `validProposition` (`fixtures/propositions.ts`); `uuidV4Schema`, `isoTimestampSchema`, `knownOrAbsentSchema`, `pathSchema` (`src/lib/values/*`); `ValidationError`, `ValidationReason`, `ErrorIssue` (`src/lib/errors/app-error.ts`, which carries no `server-only` and is therefore importable from a runtime-neutral schema module).
- `PROPOSALES_EDITOR_ORIGIN` already exists (`src/lib/env/server.ts:17`) and its schema already normalises the value to an exact origin (`parsed.origin === value`), so plain string equality in the state refinement is sound. `env/server.ts` is `server-only`, which is exactly why the `proposalWorkflowStateSchemaFor(editorOrigin)` factory is the right shape and why `schemas/workflow-state.ts` must not import `serverEnv`. No thirteenth file is needed for configuration.
- The two new constants (`MAX_CLARIFICATION_QUESTIONS` in `schemas/clarification.ts`, `MAX_WORKFLOW_STATE_BYTES` in `schemas/workflow-state.ts`) are declared in master §6.5 with owning modules inside this phase's perimeter.
- `vitest.config.mts`'s node project includes `src/features/**/*.test.ts`, so all five new test files are collected.
- Nothing in the phase implies UI state, persistence, transport, or an external call. The caller-held state stays transient and — once D1 is amended — runtime-neutral, with server-only confined to the three `server/domain/` modules.

**Failed or ambiguous.** D1–D7 and D13–D15 above. Additionally: the test files
`information-registry.test.ts`, `approvability.test.ts` and `bump-version.test.ts` are listed
without their `server/domain/` prefix. Adjacency and the phase-5 precedent make the intent
clear, so this is recorded, not routed.

## Criteria decidability

Rows I could write today, from the artifacts alone, with one exact outcome each: C1(a–k),
C2(a),(b),(c),(e),(f),(g), C3(a),(b),(c),(d), C4(a–d), C5(a),(b),(c),(d),(e),(f),
C6(a),(b),(c),(d),(e), C7(a),(b), C8(a),(b),(c). That is 39 of 45.

Rows I could not: **C7(c)** (D5 — unsatisfiable arithmetic), **C3(e)** (D9 — outcome not
singular), **C8(d)** (D16 — no runtime assertion), **C2(d)** (D17 — not distinguishable from
C2(a)), and **C5(a)/C6(a)** only conditionally, since both depend on `validState()`'s
undetermined composition (D18).

The five named mutations are each sited at a definition and each names one target row —
`MUT-06-1` (approvability predicate → C2(c)), `MUT-06-2` (`applyAnswers` missing entry → C3(d)),
`MUT-06-3` (`z.object` for the state → C5(c)), `MUT-06-4` (drop origin equality → C6(c)),
`MUT-06-5` (move the size check after `safeParse` → C7(b)). All five are well formed and would
bite. Coverage gap: no mutation guards the strict `items` record (D14) or the `deferred_by_user`
reachability rule (D11), both of which the amendments above would add rows for.

## Trace verification

**Forward.** Every row's trace cell resolves and says what the row claims: C1 → §17A.6's binding
policy table; C2 → M2 and §17A.6's iff-predicate; C3 → M18, whose text is the exact
unanswered-versus-skipped rule the rows assert; C4 → §17A.7's bounded count and §17A.16's caps;
C5 → M17 and M9 (C5(e)'s JSON round trip is a direct instance of M9's "survives a JSON round-trip
unchanged"); C6 → M17, §17A.3 and `10-security-and-trust-boundaries.md` §10; C7 → M17; C8 → M8
and §17A.2.

**Reverse.** Master §7.2 claims phase 6 serves M2 (6.C2), M8 (6.C6, 6.C8), M9 (6.C5), M17
(6.C5, 6.C6, 6.C7) and M18 (6.C3); §7.3 claims §22 criterion 15 (6.C2). Each claimed pairing is
served by at least one row. One weak link, recorded not routed: §7.2 credits 6.C6 with M8, but
C6(e) checks the *draft reference* uuid's form, whereas M8 is about the *Generation ID* — the
generation-id half is C8(a), which §7.2 also credits. No row is untraced, and no entry phase 6
claims is unserved.

## Evidence

L4 budget honoured: **zero runs**. No test suite, project or file was executed. Work was
read-only inspection of the artifacts and the tree, plus one arithmetic command (`node -e`)
computing the D5 size floor from the constants — narrowly justified because C7(c)'s decidability
cannot be settled by reading. No file was created, edited or deleted outside this handoff; the
plan, the intention, the master plan and all source are untouched.

## Verdict

**AMENDMENTS_REQUIRED.** Twenty-two ledger rows: two owner cards (D5, D8); fourteen plan
amendments (D1, D2, D3, D4, D6, D7, D9, D10, D11, D13, D14, D15, D16, D17); five explicit
delegations (D12, D18, D19, D21, D22); and one row (D20) recorded without routing because the
contract already determines it. The implementer prompt should not be compiled until every
ledger row is routed.
