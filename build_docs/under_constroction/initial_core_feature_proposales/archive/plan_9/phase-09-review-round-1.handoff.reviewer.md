---
plan: 9
role: review
state: CHANGES_REQUESTED
date: 2026-09-07
actor: plan-reviewer round 1 (Claude)
---

# Phase 9 review round 1 — the agent runtime

**Verdict: CHANGES_REQUESTED.** The runtime is structurally sound and its hardest seam — tool
results reaching the model, correlated, as labeled data — is genuinely guarded. What fails is
observability against contract `08` §10, and the one thing `search_content` exists to do: no row
proves it forwards the model's query or the resolved language to the ranker. Twelve of seventeen
new variation probes came back green. F1, F2, F3, F6 and half of F4 are **repaired test-side**
(zero production bytes changed); F5 is deferred as instructed and independently confirmed forced.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — What should happen when the model calls a tool that does not exist?

**Question.** When the model names a tool the run was never given, should the loop answer it as
`invalid_arguments`, add a fourth `ToolErrorCode` member, or end the run?

**Story.** The assistant is drafting a proposal for a Stockholm client and asks for
`search_proposals` — a tool that exists in a later phase but not in this run. Today the loop tells
it "your arguments were invalid," so the model dutifully rewrites its arguments and asks again, and
again, burning a tool call each time until the twelve-call budget runs out and the customer sees a
run that failed for no visible reason. The log records three tool calls and no tool name, so
nobody can tell afterwards which tool it kept reaching for.

**Branches.**
- *Keep `invalid_arguments`* — no code change, but a closed registry now means two different things and the model gets a misleading correction.
- *Add `unknown_tool` to `ToolErrorCode`* — the model is told the truth and can pick a real tool; touches a closed 3-member registry that phases 11 and 12 read.
- *End the run `failed`* — loud and cheap, but one model slip kills a whole turn.

**Recommendation.** Add `unknown_tool`, because the model can only recover from a mistake it is told the truth about, and the budget is what pays for the lie.

**On silence.** The gate holds; the fix round leaves the behaviour exactly as shipped and the registry stays at three members.

**Trace.** master §6.3 `ToolErrorCode`; `run.ts:138`–`:139`; plan tasks 2–3 (undeclared); finding S8.

## Gate and closing stamp

Gate checked by content, all five true: phase header `state: IMPLEMENTED`; master tracker row 9
`IMPLEMENTED`; `src/lib/agent/` holds `types.ts`, `define-tool.ts`, `run.ts` and their two test
files; `test/helpers/agent-boundary-scan.ts` exists and exports `hasForbiddenForm`;
`server/tools/` holds `index.ts` plus the two `.tool.ts` files; `"node_modules/ai"` in
`package-lock.json` is `7.0.92`.

Entering tree `57a35dc`, `git status --porcelain` empty. `git diff --stat 9712b2d 57a35dc` is
documents only, so the coordinator's stamp is tree-valid for code; it was cited, not re-run.

Closing L4 stamp, taken once on the tree actually handed over: `npm test` → **31 files / 418 tests**
green (416 + the two tests this round adds); `npm run typecheck` exit `0`; `npm run lint` exit `0`.

## Evidence scope

`grep` over `src` and `test` returns exactly nine files referencing `lib/agent`, `server/tools` or
`agent-boundary-scan`, and all of them are phase-9 files: the import radius is **closed**. L2 over
the three phase test files is therefore sufficient for "no test observes this" about phase-9
production code, and every probe ran at that scope. Control probe V18 (tool-call budget `>=` → `>`)
reddened two rows, proving the harness detects failure.

## Counts, every one derived by command

- Table: `7` criteria / `34` rows (`C1 4 · C2 5 · C3 8 · C4 4 · C5 4 · C6 5 · C7 4`) / `13` distinct
  `MUT-09-*`. Independently reproduces the coordinator's figure.
- Tests before this round: `5 + 9 + 21 = 35` `it()` blocks in three files (33 passing cases at L2).
- Distinct row ids named by tests: `35` — the 34 table rows plus `C7(e)`. **Zero orphan tests.**
- After this round's repairs: `35` tests, `35` passing at L2, `11` new named mutations.

## F1–F6 disposition

| F | Disposition | Evidence |
|---|---|---|
| F1 · C3(f) cannot fail | **repaired** | two binding cases; `MUT-09-14/15/16` each redden it |
| F2 · `outputJsonSchema` has no row | **repaired** | new row C7(e); `MUT-09-17` reddens it |
| F3 · `issue.path.map(String)` cannot fail | **repaired** in both homes | array-bearing fixtures; `MUT-09-21` (run), `MUT-09-22` (define-tool) |
| F4 · `agent.run.step` has no row | **repaired in part, disputed in part** | `MUT-09-23` covers the built event; the missing `agent.run.tool` is escalated as **B1** |
| F5 · two copies of `assertReadOnlyToolSet` | **deferred, agreed** | contract `03` §4 read independently: "`src/lib/` never imports from `features/`". Forced. Phase-15 candidate 6 stands |
| F6 · system prompt never asserted | **repaired** | folded into C7(e); `MUT-09-18` reddens it |

**F4's dispute.** The prompt asked whether the plan's narrative or the table is wrong. Neither
answer is complete: contract `08` §10 requires log events carrying "`runId`, `traceId`, **tool
names**, **durations**, token counts, and outcomes", and `10` §7 names `durationMs` in its event
shape. No emitted event carries a tool name or a duration. The narrative was right, the table is
wrong, **and production is incomplete** — which is why this is B1 rather than a table edit.

New row text and the exact mutation set are in the plan's Review log entry for this round. Proposed
table after the fold: **7 / 35 / 24**. Not applied here — the Review log is append-only and the
coordinator folds.

## Findings

### Blocking

**B1 · No log event carries a tool name or a duration.** `agent.run.start` carries
`{ runId, traceId, toolCount }`, `agent.run.step` `{ runId, traceId, kind, toolCallCount,
totalTokens }`, `agent.run.end` `{ runId, traceId, toolCallCount, status }`. Contract `08` §10 —
"Logs are the MVP's traceability mechanism" — requires tool names and durations; `10` §7 requires
`durationMs`. `agent.run.tool`, named in plan task 2, was never built and the table never asked for
it. *Authority:* `08` §10, `10` §7. *Correction:* emit `agent.run.tool` per invocation with
`{ runId, traceId, toolCallId, name, ok, durationMs }` (name and ids only — `08` §10 forbids
arguments), add `durationMs` to `agent.run.end`, and add the row that would redden if either were
deleted. The C7(d) sentinel assertion already guards against content leaking in.

**B2 · `search_content` never proves it forwards the query or the language to the ranker.**
V11 (`rankCandidates("consulting service track", …)`, ignoring `input.query`) and V12
(`rankCandidates(input.query, ctx.catalog, "en")`, ignoring `ctx.language`) both leave the phase
suite green. *Concrete production value that still satisfies the rows:* any constant query string
that happens to match C6(a)'s fixture, and the literal `"en"`. C6(a) asserts one concrete tuple over
one fixture whose query and language are the very constants a broken tool would hardcode. This is
the D16/C7(a) family one level down — the loop's tool-result plumbing was guarded after projection
found it blind; the tool's own input plumbing was not. *Correction:* C6(a) gains a second query over
the same catalog whose top candidate differs, and a Swedish-language case (`FIXTURE_CATALOG` item 7
has an `en`-only title, so `language` genuinely discriminates — V13 already proves the mechanism
works for `get_content`). Named mutations: hardcode the query; hardcode the language.

### Should-fix

**S1 · C3(a)'s `toolCalls.length === 3` is not implemented, and `RecordedToolCall.ok` is asserted
nowhere.** The row demands `toolCalls.length === 3`; `run.test.ts:42` asserts
`toolCalls: expect.any(Array)`, which an empty array satisfies. V1 (report the constant `0` as
`toolCallCount`) and V10 (never flip `ok` to `true`) are both green. *Value that still satisfies the
row:* `toolCalls: []`. Implementer defect — the row is correct as written. (V1's half is repaired by
`MUT-09-24`; the `toolCalls` array itself is not.)

**S2 · C5(a)'s issue-path assertion is satisfied by the template's own prose.** `run.test.ts:121`
asserts the retry message `.toContain("path")`; the static template reads "Correct these issue
**path**s and return…". V3 (`${JSON.stringify(paths)}` → `${""}`) is green. *Value that still
satisfies the row:* a retry message with zero issue paths in it. Assert the serialized paths, e.g.
`toContain(JSON.stringify([{ path: ["answer"] }]))`. Implementer defect; the row says "contains the
issue paths".

**S3 · The `issues` never reach the model, untested.** V7 (send `{ error: { code } }` only) is
green. Contract `08` §3 spells the structured tool error as
`{ error: { code: "invalid_arguments", issues } }` — the `issues` are part of the contract, and they
are what lets the model correct itself instead of guessing. C7(b) asserts only the code.
*Correction:* extend C7(b) to assert the `issues` array reaches the `tool` result message; mutation
= strip `issues`.

**S4 · A new file under `src/lib/agent/` is silently unscanned.** `AGENT_SCAN_FILES` is a
hand-maintained five-entry list and C2(d)'s test compares it to the same list written out again, so
the "shrunken listing must not pass vacuously" guard catches shrinkage but never absence. V15 — a
new `src/lib/agent/leak.ts` whose body is `fetch("https://example.com/x")` — passes the whole suite.
C2(d)'s row says "`src/lib/agent/*.ts`", a glob; the instrument is an enumeration. *Correction:*
derive the scanned set by reading the directory (excluding `*.test.ts`) and assert it is a superset
of the expected list; plant a temporary file as the rule-15 proof.

**S5 · The in-loop tool-call budget is checked twice, so no single-site mutation reddens it.**
`run.ts:129`–`:130` calls `budgetFailure()` (which checks `recordedToolCalls.length >=
budgets.maxToolCalls` at `:87`) and `run.ts:131` repeats that exact comparison. V4 and V5 delete one
site each; both green. `run.ts:131` is unreachable as a return. Charter rule 11 — `MUT-09-2`'s
"check the budget after `invoke`" is ambiguous between two guards, and the ledger cannot say which
one it moved. *Correction:* delete `run.ts:131` and re-run `MUT-09-2` against the single site.

**S6 · `get_content`'s `execute` carries business rules that already live in the domain.**
`get-content.tool.ts:21`–`:31` re-implements the localization predicate from
`rank-candidates.ts:64`–`:65` and the truncation rule from `:82`–`:84`. Contract `08` §3: "`execute`
calls a service or an integration client. It contains no business rules." The two search paths can
now drift — the same defect class the owner's one-bound decision exists to prevent, one level down
from the query bound C2(d)/C6(e) guard. *Correction:* a `toContentDetail(item, language)` in
`server/domain/`, called by the tool and sharing the predicate with `rankCandidates`.

**S7 · `get_content`'s language precondition has no row.** V8 (delete its `requires`) is green:
`get_content` would silently return `{ item: null }` for every id instead of `language_unresolved`.
C6(d) exercises `search_content` only, and plan task 3 never specified `requires` for `get_content`
— the implementer added it unprompted. **Assessed on its merits: it is right**, and it is what makes
the `ctx.language!` non-null assertion at `:21` and `:23` safe. It needs a row, not a removal.
*Correction:* C6(d) gains a `get_content` case.

**S8 · The unknown-tool disposition is undeclared and drives eight rows.** `run.ts:138`–`:139`
synthesizes `{ code: "invalid_arguments", issues: [{ path: ["name"], message: "Unknown tool" }] }`
when `toolByName` misses. No plan task and no criterion row describes this. Master §6.3 defines
`invalid_arguments` as "the tool's **input** failed its schema" — a closed 3-member registry reused
for a condition that is not an input failure. It is also the loop driver for C3(a), C3(b), C3(c),
C3(d), C4(a), C4(b), C4(c) and C4(d): eight rows in which `execute` is never reached, so those
budget and usage rows measure the fallback path, not tool dispatch. **The budgets themselves are
sound** — control V18 (`>=` → `>`) reddens C3(a) and C3(e) — but the rows prove less than they
appear to. See owner card 1. *Correction:* declare the disposition, then re-point at least C3(a) and
C4(a) at a real tool.

**S9 · D24's stated reason is false, and the floor that actually saves it has no row.** C3(b)'s cell
asserts "the comparison is `elapsed >= wallTimeMs`, so `remaining >= 1` at every surviving call site
and the per-call ceiling is never non-positive". `budgetFailure()` reads `deps.now()` at `run.ts:85`
and the timeout computation reads it again at `:98`; under a real clock time passes between them, so
`budgets.wallTimeMs - elapsed` can be `<= 0` after a passing check. C3(b)'s own boundary fixture
already produces `remaining === 0` there. Production is correct because `:99` carries an undeclared
`Math.max(1, …)` floor, which the plan says is unnecessary; V6 (remove it) is green. *Correction:*
record the floor in plan task 2, delete D24's reasoning from C3(b), and give the floor a row driven
by a clock that advances between the two reads.

### Notes

- **N1 ·** `get_content`'s blank-title branch (`title.trim().length === 0`) is never exercised —
  `FIXTURE_CATALOG` has no blank title, and V9 (delete the clause) is green. C6(b) names three cases
  but the predicate has three sub-branches; charter rule 12 wants one mutation per sub-check.
- **N2 ·** C6(a)'s `expect.arrayContaining` does not constrain the candidate set: V17 (return only
  the top candidate) is green. The test matches the row; naming it because the row's "concrete
  candidate tuple" reads stronger than it is.
- **N3 ·** C5(c) hardcodes `2` and `4` where the row says `MAX_OUTPUT_RETRIES + 1` and `+ 3`, and the
  row's own trace cell cites charter rule 13.
- **N4 ·** `readOnly: false` — the escape hatch past `assertReadOnlyToolSet` — has no row. Low, since
  no caller sets it yet; it should get one before phase 11 instantiates a tool set.
- **N5 ·** C4(a)'s row says `usage` "deep-equals"; the test uses `toMatchObject`, and its fixture is
  `1/1/2 + 20/10/30` rather than the row's `10/5/15 + 20/10/30`.

## Fixtures judged under rule 18

No fixture in this phase is unrealistic. The two the coordinator verified forward through the real
provider (C5(a)'s raw partial string, C5(b)'s schema-valid-but-Zod-invalid object) are grounded, and
my C5(b) repair strengthens the second: the path `["items", 0, "answer"]` — a **number** at index 1
— is exactly what `Output.object` produces for a nested schema, which is the runtime shape
`issue.path.map(String)` exists for. `node_modules/zod/v4/core/errors.d.cts:9` types `$ZodIssueBase.path` as
`PropertyKey[]` and array indices arrive as numbers; the old flat fixtures could never show it.

The one fixture that models something outside this repository and is **not** grounded is the
`stepOptions` recording seam, but it records our own call, not the dependency's behaviour, so rule
18 does not bind it.

## Carry-forward dispositions

| Item | Destination |
|---|---|
| B1, B2, S1–S9, N1, N3 | phase-9 fix round 1 |
| N2, N5 | phase-9 fix round 1, low priority |
| N4 (`readOnly: false` row) | phase 11, when a tool set is first instantiated |
| F5 lift-to-`lib/agent` | phase 15 candidate 6 (unchanged) |
| Phase-7 purity guard, barrel negative surface | phase 15 candidates 4, 5 (untouched) |

## Lessons for the plans

1. **"The request the model receives" is a surface, not four incidental fields.** `system`,
   `initialMessages`, `tools` and `outputJsonSchema` each had zero rows, and all four are deletable.
   A loop that offers the model no tools, no history and no schema passed the entire table. Every
   future phase that builds a request to an external system should carry one row asserting the
   request equals what the caller supplied — the mirror of C7(a) for the outbound direction.
2. **A row that asserts a range instead of a relationship is the range's own proof.** C3(f) is F1;
   my first repair of it reproduced the sibling defect (two sufficient causes, both terms equal) and
   was caught only because a mutation stayed green. Rule 2's companion and rule 15 need to be
   applied to *repairs*, not only to original authorship.
3. **A `.toContain()` against a message that also contains static prose asserts the prose.** S2. Any
   row phrased "the message contains X" should assert the serialized X, not a substring of it.
4. **An enumerated perimeter is not a perimeter.** S4: C2(d) says "`src/lib/agent/*.ts`" and the
   instrument is a five-item list, so the guard protects today's files and no future one. When a row
   names a glob, the instrument reads the directory.
5. **Contract clauses that name log *fields* need a row per field.** B1: `08` §10 lists six things a
   run must log and the table asked for two. The plan's narrative had it right and the table, which
   is binding, silently narrowed it.
6. **A duplicated guard defeats its own named mutation.** S5: rule 11 already says a mutation names
   file *and* site; it should also say that a guard appearing twice is a finding, because "delete the
   guard" then has two answers and the ledger records neither.

## Mutation-probe declaration

Seventeen exploratory probes (V1–V18, V18 the control) plus eleven repair-proving mutations
(`MUT-09-14` … `MUT-09-24`) were applied one at a time and reverted. One temporary file,
`src/lib/agent/leak.ts` (V15), was created and deleted; `ls src/lib/agent` confirms it is gone.
No database or external state was touched; no network, provider call, `.env` read, `npm install`
or `npm run build`.

All seven production digests recomputed after the round and byte-identical to entry:

```
69b8e6071a694c6f0db502c3faf5c3627081b39843400bd3b92e9202ba3ce452  src/lib/agent/run.ts
b994cf228dfd0fda3485afcdf1fde50d611c1c42379f69a45ab0e757d85731c9  src/lib/agent/define-tool.ts
e9bc212c48b57b6a3be22da34c89c09c0c161bb7795240b34975e7deb49efa7a  src/features/proposal-preparation/server/tools/get-content.tool.ts
56864b3fe918d0d1132647ac471a9789786591e617eabed883a870a3ec38b994  src/features/proposal-preparation/server/tools/search-content.tool.ts
4a714ee3184806137bb465566892f2ae85e8c2b789f379536a80a7903747e00a  src/features/proposal-preparation/server/tools/index.ts
9984871828e35d5e87c39e5c4db5e4b8795591edba93a23c6faa03bd872a73bc  test/helpers/agent-boundary-scan.ts
a086a84652c55c7347820a68a9cd9e7450912bf24b01cf433319e20bb45a745b  src/features/proposal-preparation/server/domain/rank-candidates.ts
```

## Write perimeter

Exactly four paths, and **no production file among them**:

1. `src/lib/agent/define-tool.test.ts` — C1(a) second case (F3).
2. `src/lib/agent/run.test.ts` — C3(f) rewritten (F1), C5(b) rewritten (F3), C7(e) added (F2, F6),
   C7(d) extended (F4 half).
3. `plans/phase-09-agent-runtime.md` — Review log append only; the acceptance table is untouched.
4. `handoffs/reviewer/phase-09-review-round-1.handoff.reviewer.md` — this file.

`tsconfig.tsbuildinfo` is rewritten by `npm run typecheck` and is not part of the intended
perimeter — the same attribution the implementer round recorded.

Phase state and the master tracker row 9 are unchanged, per the prompt.
