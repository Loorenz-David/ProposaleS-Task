---
plan: 7
role: fix
round: 2
date: 2026-09-06
state: IMPLEMENTED
actor: Claude Fable 5.1
---

# Phase 7 — Content ranking domain and human search (implementer, fix round 2)

## Summary

Resolved review round 1's five findings (B1, B2, B3, S1, S2) **test-side only**, against the
amended `plans/phase-07-ranking-and-human-search.md`. Two test files changed; **no production file
and no fixture changed**. All 19 named mutations are accounted for: five new ones run at L1, MUT-07-2
and MUT-07-10 re-run because their rows were edited, twelve cited from round 1 on production code this
round did not touch. Four additional self-chosen probes are declared. Closing L4 stamp: `npm test`
24 files / 335 tests green (+1 = C6(f)), `npm run typecheck` exit 0, `npm run lint` exit 0.
Checkpoints: `0d474cb` (the fix), `5949615` (Review log summand correction — see "Provenance note").

**Two observed-red deltas the coordinator's validation must read from this handoff, not from the
plan cells:** MUT-07-15 reddens C6(c), not C6(a); MUT-07-17's red is a `TypeError`, with a two-site
probe confirming the row's own assertion bites. Details under "Divergences".

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs you. Every finding had a determinate test-side correction; no semantics, exclusion,
or scope is in question.

## Gate check (all 6 items pass)

| # | Requirement | Result |
|---|---|---|
| 1 | Intention status `RATIFIED` | Confirmed — `Status` row of `planing/proposal-preparation-backend-intention.md` |
| 2 | Tracker row 7 `CHANGES_REQUESTED` | Confirmed — `master-plan.md` §4 line 66 at entry |
| 3 | 8 criteria / 57 rows / 19 named mutations, re-derived | By command over the criteria table: 57 rows matching `^\| C\d+\([a-z0-9]+\) `, 8 distinct criterion prefixes, 19 distinct `MUT-07-n` ids (1…19) |
| 4 | C6 table contains `C6(f)` | Confirmed — plan line 150 |
| 5 | `rank-candidates.test.ts` lacks `consulting service track` | Confirmed — grep count 0 at entry |
| 6 | `search-content-for-human.test.ts` still contains `expectTypeOf` | Confirmed — 2 occurrences at entry (import + assertion) |

Provenance at gate: HEAD `b841457`, `git status --porcelain` empty.

## Architecture context

Classified before editing: the round touches test files and pipeline documents only — no runtime
boundary, schema, persistence, integration, or agent concern. Applicable contract:
`11-testing-principles.md` §§2–3, 5 (domain and service layers, no real systems, tests construct
their own inputs). Closeout question: no durable documentation became false (no behavior changed).

## Task 0 — coverage map for the rows this round edits

| Row | Test id | Assertion shape vs the row |
|---|---|---|
| C1(c) (i) no value import from `@/lib/*` or `node:*` | C1(c) | exact — regexes over the `import type`-stripped source; the two permitted exceptions asserted present |
| C1(c) (ii) no `fetch`/`Date`/`Math.random`/`process`, **and no dynamic `import(`** | C1(c) | exact — `not.toMatch(/\bimport\s*\(/)` added |
| C1(c) (iii) arity 3 | C1(c) | exact — now the last assertion, after the source checks |
| C5(a) control: `"suite"`/en → exactly `["7"]` | C5(a) | exact — `map(variationId)` deep-equals `["7"]`, asserted first |
| C5(a) `"ledningsnivå"`/sv → `[]` | C5(a) | exact — `toEqual([])` |
| C6(a) `["2",1000,"strong"]` precedes `["1",667,"possible"]` on `"consulting service track"` | C6(a) | exact — tuples asserted present, then order |
| C6(b) `["5",444,"possible"]` precedes `["3",333,"weak"]` on `"consulting service bundle"` | C6(b) | exact |
| C6(c) `["8",667,"possible"]` precedes `["5",444,"possible"]`, same query | C6(c) | exact |
| C6(f) full ten-tuple sequence, literal | C6(f) | exact — `toEqual` on the whole sequence |
| C7(d) no import of `@/lib/ai` or `@/lib/agent` in any form | C7(d) | exact — one specifier regex over the unstripped source covers static, `import type`, dynamic; plus an anchor `toContain` proving the right file was read |

All other rows of the phase are untouched (tests and production identical to `f2399ac`/`e621226`).
**Reverse map:** the two edited files carry 22 + 11 = 33 `it` cases whose ids are exactly
C1(a–e) C3(a–c) C4(a–d) C5(a–d) C6(a–f) C7(a–k) — no duplicate, no orphan. The phase's four test
files carry 12 (`strength`) + 12 (`content-candidate`) + 22 + 11 = **57** cases = 57 rows.
Candidate criterion: none.

## Per finding — what changed

- **B1 → C6(a)–(c).** Re-sited onto `QUERY_TRACK = "consulting service track"` (C6(a)) and
  `QUERY_BUNDLE = "consulting service bundle"` (C6(b), C6(c)). Two test-local helpers: `tuples()`
  projects candidates to `[variationId, score, matchStrength]`; `expectPrecedes(seq, first, second)`
  asserts `toContainEqual` for both tuples, then `indexOf(first) < indexOf(second)`. Under a planted
  defect the failure message therefore shows the actual tuple sequence. The `QUERY_3`-based
  assertions and their three `index` closures are deleted; `QUERY_3` stays for C1(a), its live caller.
- **B2 → C6(f).** New test, the ten tuples written literally, `toEqual` on the full sequence.
- **B3 → C5(a).** Control first (`"suite"`/en → `["7"]`), then `"ledningsnivå"`/sv → `[]`.
- **S1 → C7(d).** `expectTypeOf` import and block removed. Reads `search-content-for-human.ts`,
  asserts `toContain("export async function searchContentForHuman(")` (anchor), then
  `not.toMatch(/["']@\/lib\/(ai|agent)["']/)`. The test is synchronous and does not import the
  module, so the row can only go red on the text.
- **S2 → C1(c).** `not.toMatch(/\bimport\s*\(/)` added on the stripped source. The source
  assertions now precede `await modules()`; the arity check is last.

## Mutation ledger

Scope L1 throughout: `npx vitest run --project node <named test file> --reporter=verbose`. Tree for
every row: HEAD `b841457` + the two-file dirty diff, `git diff | shasum -a 256` =
`3d2818c3e4f2bcd6f08261c250c28764d367f3b461b17c482d559b27abab48aa` (identical content now committed
as `0d474cb`). Each mutation: applied by scripted edit, landing confirmed by `git diff` on the
production file, run, reverted with `git checkout --`, `git diff --quiet` confirmed clean.

| # | File · site | Change | Hypothesis | Observed |
|---|---|---|---|---|
| MUT-07-15 | `rank-candidates.ts` · comparator, definition | delete `if (a.score !== b.score) return b.score - a.score;` | plan: C6(a) red | **C6(c) red** (`expected 3 to be less than 2`); C6(a), C6(b), C6(f) green; 1 failed / 21 passed |
| MUT-07-16 | `rank-candidates.ts` · `scoreItem`, definition | `weightSum += 3` → `+= 2` | C6(f) red, order unchanged | **C6(f) red** — actual starts `["2",667,"possible"]`, id order unchanged; C6(a), C6(b), C6(c) also red (`toContainEqual`); 4 failed / 18 passed |
| MUT-07-17 | `rank-candidates.ts` · `rankCandidates`, definition | `if (title !== undefined && title.trim().length === 0) continue;` | C5(a) red | **C5(a) red** — `TypeError: Cannot read properties of undefined (reading 'normalize')` thrown inside the row's `sv` call; C5(b), C5(c) green; 1 / 21 |
| MUT-07-18 | `search-content-for-human.ts` · module header | add `import { createAiClient } from "@/lib/ai";` | C7(d) red on text, not on resolution | **C7(d) red** on `not to match /["']@\/lib\/(ai\|agent)["']/`; 1 / 10 — module still loads (esbuild elides an unused TS import), so no other row moved |
| MUT-07-19 | `rank-candidates.ts` · `rankCandidates`, definition | `await import("node:fs");` as first statement | C1(c) red | **C1(c) red on `not.toMatch(/\bimport\s*\(/)`**; the literal form is also an esbuild `Transform failed` (await in a sync function), so all 22 cases failed — C1(c) on its text assertion, the rest on module load |
| MUT-07-2 (re-run) | `rank-candidates.ts` · header + body | `import { getProposalesClient } from "@/lib/proposales";` + `void getProposalesClient;` | C1(c) red | C1(c) red on the static-import regex; 1 / 21 |
| MUT-07-10 (re-run) | `rank-candidates.ts` · `rankCandidates`, definition | `if (title === undefined) continue;` | C5(b) red, C5(a) green | C5(b) red (`variationId '8'` returned); C5(a) green; 1 / 21 |
| P1 self-chosen (= review probe 8) | comparator | delete both strength and score terms | C6(a)–(c), C6(f) red | C6(a) `1 < 0`, C6(b) `4 < 2`, C6(c) `7 < 4`, C6(f) deep-equal — 4 / 18. **B1 closed** on the mutant it was raised on |
| P2 self-chosen | comparator | delete the strength term only | all green (Notes: redundant) | 22 / 22 green |
| P3 self-chosen, two-site | MUT-07-17 + projection `item.title[language] ?? ""` | admit the missing-title item, let projection tolerate it | C5(a) red on `toEqual([])` | `expected [ { variationId: '7', … } ] to deeply equal []`; 1 / 21 |
| P4 self-chosen | `rankCandidates`, definition | `void import("node:fs");` (parses) | C1(c) red only | C1(c) red on the dynamic-import regex; 1 / 21, module loads |

**Executed = declared = 19.** Summands derived from the criteria table (unique ids per criterion's
rows): C1 5 · C2 3 · C3 1 · C4 1 · C5 3 · C6 3 · C7 2 · C8 1. Of the 19: 5 new (run), 2 re-run
(rows edited), 12 cited from round 1 — their tests are byte-identical to the round-1 checkpoint and
`rank-candidates.ts` / `strength.ts` / `content-candidate.ts` are unchanged since `f2399ac`.

## Divergences (charter rule 14) — every mutation was run as named; the observed red differs

1. **MUT-07-15 → C6(c), not C6(a).** C6(a) compares a `strong` and a `possible` item. With the
   strength term intact that pair is ordered before the score term is consulted, so deleting the
   score term cannot reorder it: no strong-vs-possible row can discriminate the score term (the
   mirror of the Notes' redundancy argument). Only a same-band pair does — C6(c) — and the review's
   original cell ("→ C6(c) red") was right. C6(a)'s own falsifiability is P1 (`expected 1 to be
   less than 0`). **For the fold:** record MUT-07-15 → C6(c) in the C6(a) cell (or move it to
   C6(c)), and name P1 (comparator reduced to `variationId ascending`) as the mutation for
   C6(a) and C6(b).
2. **MUT-07-17's red is a `TypeError`.** Under the plan's mutant item 7 clears the floor in `sv`,
   enters `scored`, and projection's `tokenize(item.title[language]!)` throws before the function
   returns, so `toEqual([])` is unreachable. This is not the crash-shape the cell warns about: the
   throw is *caused by* the admitted item (the defect under test), only C5(a) reddens, and P3 proves
   the assertion bites once projection tolerates the missing title (`variationId "7"` returned).
   Nothing implemented differently; recorded so the ledger's `TypeError` is not read as certifying a
   guard that does not exist.
3. **MUT-07-19's literal form does not parse.** `await` inside the synchronous `rankCandidates` is
   an esbuild transform error. With C1(c)'s original assertion order (`await modules()` first) the
   row would have reddened at module load — a crash, not the guard. I reordered C1(c) so the source
   assertions run first; the literal mutant now reddens on the dynamic-import assertion, and P4
   (`void import("node:fs")`, which parses and loads) reddens only C1(c). **For the fold:** name the
   parsing form in the cell, or keep the literal with this note.

## Judgment calls

- C1(c) assertion order (source checks before `await modules()`): reason above. The row's content is
  unchanged; only the order and the added dynamic-import check.
- C7(d) `toContain` anchor: an absence check over a file read is satisfied by an empty or wrong file;
  the anchor makes "the right file was read" observable (rule 15 shape). Cheap, one line.
- `QUERY_3` retained (C1(a) uses it). `CandidateTuple`, `tuples`, `expectPrecedes` are test-local
  with callers in the same file (rule 4).
- The prompt's C1(c)/C7(d) forms did not require touching `fixtures/catalog.ts`; it is unchanged.

## Evidence — closing stamp

Hypothesis: the tree handed over is green repository-wide. Scope L4, exactly one run.
- `npm test` → **24 files / 335 tests passed** (round-1 stamp 24 / 334; +1 = C6(f)). Failure-ID
  delta against that baseline: ∅ new failures, ∅ removed.
- `npm run typecheck` → exit 0, no diagnostics. `npm run lint` → exit 0, no diagnostics.
- Tree at stamp: HEAD `b841457`, `git status --porcelain` = exactly the two test files,
  `git diff | shasum -a 256` = `3d2818c3e4f2bcd6f08261c250c28764d367f3b461b17c482d559b27abab48aa`.
  `tsconfig.tsbuildinfo` was modified by `tsc` and restored with `git checkout --` (master §11
  follow-up 8). The same content was then committed as `0d474cb` with the two documents; the
  follow-up `5949615` touched only the plan's Review log. No code changed after the stamp.
- Inner loop: L1 on the two edited files (33 / 33 green) before the mutation runs; every mutation
  and probe at L1 as tabled. No unauthorized L4.

## Provenance note

The Review log entry as first committed (`0d474cb`) carried a **typed** per-criterion summand line that
did not add to 19. I caught it against the derived counts in the same session and corrected it in
`5949615` rather than amending, so the record shows what happened. Charter manifest property 3 —
counts are derived, never typed — is the rule this violated; the correction cites it.

## Full write perimeter (cycle-scoped)

**Code (2):**
- `src/features/proposal-preparation/server/domain/rank-candidates.test.ts`
- `src/features/proposal-preparation/server/services/search-content-for-human.test.ts`

**Documents (2 + this handoff):**
- `plans/phase-07-ranking-and-human-search.md` — Review log append only (two commits).
- `master-plan.md` — tracker row 7 only (`CHANGES_REQUESTED` → `IMPLEMENTED`, note appended).
- `handoffs/implementer/phase-07-fix-round-2.implementer.md` (this file, new, uncommitted for the fold).

**Mutation-probe files (applied and reverted, byte-identical afterwards by `git diff --quiet`):**
- `src/features/proposal-preparation/server/domain/rank-candidates.ts` — MUT-07-15, -16, -17, -19,
  -2, -10, P1, P2, P3, P4.
- `src/features/proposal-preparation/server/services/search-content-for-human.ts` — MUT-07-18.
- `tsconfig.tsbuildinfo` — touched by `tsc`, restored.
- No throwaway test files were created.

**Tool-recorded state:** none. `.archgraph/` is not present; skipped silently. No database or
external system touched.

## For the coordinator to fold

1. C6(a) cell: MUT-07-15's observed red is C6(c); name P1 for C6(a)/C6(b) (divergence 1).
2. C5(a) cell: add the note that the mutant's red is a `TypeError` from projection and that the
   two-site variant P3 fails on the assertion itself (divergence 2).
3. C1(c) cell: MUT-07-19's literal `await import` is a transform error; the parsing form is
   `void import("node:fs")` (divergence 3).
4. Lesson for §9.1 rule 15's planner corollary: a strong-vs-possible pair cannot discriminate the
   score term for the same reason a same-band pair cannot discriminate the strength term — the
   named mutation for an ordering row must be one the row's own pair can observe.
