---
plan: 7
role: reviewer
round: 1
date: 2026-09-06
verdict: CHANGES_REQUESTED
actor: Claude Opus 5
---

# Phase 7 — Content ranking domain and human search (independent review, round 1)

## Summary

First review, full checklist. All six gate items pass; counts re-derived by command (8 criteria,
56 rows, 14 named mutations); the trace chain is bijective in both directions (56 `it` cases
against the 56 declared row ids — no duplicate, no uncovered row, no orphan test); the perimeter
is exactly the 11 declared files.

**The code is correct. Three of its guards are not.** Every blocking finding below is the same
family — §9.1 rule 15, a guard that cannot fail — and each is proven by a planted mutant that
left the whole feature suite green (171/171). Two of the three sit on the phase's central
mechanism: the ranking order itself has no falsifiable test, and neither `score` nor
`matchStrength` is observed by any row. The third is the shape the coordinator's fold explicitly
left to this session, and it is present as suspected.

Verified corrections exist for all five blocking and should-fix findings, and none needs a fixture
change: a discriminating query already exists in the shipped catalog.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs you. Every finding has a determinate correction inside the phase's existing scope;
no exclusion, no scope trim, and no ratified semantics are in question.

## Verdict

`CHANGES_REQUESTED`. Tracker row 7 updated. Three blocking, two should-fix, four notes.

## Findings

### Blocking

**B1 — the sort order has no falsifiable test.**
Deleting *both* the strength and score terms from the comparator, reducing it to `variationId
ascending`, leaves 171/171 green at L2. C6(a), C6(b) and C6(c) pass because the fixture's
`QUERY_3` ranking (`1/778 · 2/667 · 3/444 · 4/333 · 5/222`) places descending relevance in exactly
ascending `variationId` order — two independent sufficient causes for every asserted precedence.
Authority: intention §17A.8 ("Ordering is total, ties decidable… Sort key: `(strength descending,
score descending, variationId ascending)`"); master §9.1 rule 2 companion and rule 15.
*Finding against the criteria and the fixture, not the code — the comparator is correct.*

Correction, verified on the shipped fixture with no fixture change:
`rankCandidates("standard facilitation consulting", FIXTURE_CATALOG, "en")` returns
`9/444/possible · 10/444/possible · 1/333/weak · 2/333/weak` under correct code and
`1 · 2 · 9 · 10` under the reduced comparator. Re-site C6(a)–(c) onto it and add
**MUT-07-15** — `rank-candidates.ts` · comparator, definition · delete the score term → C6(c) red.

Additionally: **the strength term is provably redundant and no ordering row can discriminate it.**
`strengthForScore` is monotone in `score`, so `(strength desc, score desc)` ≡ `(score desc)` for
every input. Either delete it with the reason recorded, or keep it and record that B2's assertion
of the strength labels is its guard — it must not ship as an unmarked clause no mutation can
redden.

**B2 — no row observes `score` or `matchStrength` on any returned candidate.**
Changing the title weight from 3 to 2, or the normalisation denominator from `3 * |Q|` to
`4 * |Q|`, leaves 171/171 green. The plan's worked table *is* reproduced by the code (verified:
778 / 667 / 444 / 333 / 222 / 111) but is asserted nowhere; C6(a)–(c) name their items by score
and then identify them by `variationId` without ever checking it. §17A.8 makes `matchStrength` the
gate for auto-selection ("Auto-selection as the recommended default requires `strong`") and for
the `no_acceptable_match` / `weak_match` / `non_strong_selection` warning kinds (master §6.3) —
all consumed by phase 11.

Correction: assert the full `(variationId, score, matchStrength)` tuple sequence on B1's query,
and add **MUT-07-16** — `rank-candidates.ts` · `scoreItem`, definition · title weight 3 → 2 → red.

**B3 — the missing-key half of the language filter is unguarded; C5(a) cannot fail.**
Deleting `title === undefined ||` while keeping the whitespace check leaves 171/171 green.
Deleting the *entire* filter reddens only C5(b). C5(a) exists to prove §17A.8's "A content item
without `title[language]` is **excluded from candidates**" (criterion 13) and observes nothing:
its `sv` query `"suite"` is an en-only term the score floor excludes under every mutant. This is
the identical shape the coordinator repaired in C5(b) and explicitly routed to this review, and it
is real. *Finding against the criterion — the plan authored it.*

Correction, verified in both directions: change C5(a)'s `sv` query to `"ledningsnivå"`, a term
from item 7's own `sv` description. The row stays green on correct code and reddens under the
mutant. Add **MUT-07-17** — `rank-candidates.ts` · `rankCandidates`, definition · drop
`title === undefined ||` → C5(a) red.

### Should-fix

**S1 — C7(d)'s instrument never fires.**
Adding `ai?: unknown` to the `deps` parameter type passes both `npm run typecheck` and the suite.
Adding a required `ai: unknown` fails at ten *call-site* lines (24, 31, 40, 52, 61, 70, 80, 92,
101, 111) and never at line 46, the `expectTypeOf` itself. The optional shape is the realistic one
for an added model dependency, and it is invisible. Authority: intention §5.1 (content search on
human request — "May call the model: **no**"), §10.2; master §9.1 rule 11 ("a safety test that
survives the defect it exists to prevent is decoration"). This refines rather than contradicts the
projection's note that `expectTypeOf` is typecheck-enforced: that holds for the
`src/lib/errors/app-error.test.ts:60–74` shapes, not for `.not.toHaveProperty` on an optional key.

Correction: replace with a source-text guard mirroring C1(c) — `search-content-for-human.ts`
carries no import from `@/lib/ai` or `@/lib/agent` — and name the mutation that adds one.

**S2 — C1(c)'s purity guard is blind to dynamic `import()`.**
Variations run against the shipped guard: mixed inline-type import
(`import { type ContentItem, getProposalesClient } from "@/lib/proposales"`) → caught;
`new globalThis.Date()` → caught; `await import("node:fs")` → **not caught**;
`await import("@/lib/proposales")` → **not caught**; computed `globalThis["Da"+"te"]` → not caught
(contrived, accepted). MUT-07-2 exercised only the static form. Dynamic import is how I/O actually
enters a module, and it is this repository's own test idiom.

Correction: add `expect(stripped).not.toMatch(/\bimport\s*\(/)` to C1(c) and name it as a mutation.

### Notes

**N1 — `reason` is computed over the full description while `description` is truncated.**
Verified reachable: a candidate returns `reason: "venue, sauna"`, `score: 667`,
`matchStrength: "possible"` with a 280-character description containing no "sauna". The shipped
fixture does not exhibit it (no token lives only past the cap), so nothing observes it. Defensible
— the score is computed over the same full text and `truncated: true` is §17A.8's disclosure — but
the plan did not decide it and phase 11 shows `reason` to a human. Record the decision in the plan;
carry to phase 11.

**N2 — `compareVariationIds`'s numeric path is wider than C6(e) tests.**
`"1"`, `"01"`, `"1.0"` and `"1e0"` all compare equal and the sort falls back to arrival order
(verified: `["01","1"]` forward, `["1","01"]` backward) — the §17A.8 vendor-list-order leak inside
the function written to prevent it. **Unreachable on the shipped path:** `src/lib/proposales/mappers.ts:65`
emits `String(wire.variation_id)` over a `z.number().int()`, which is canonical decimal. But
`contentCandidateSchema.variationId` is only `z.string().min(1)`, so nothing structural holds the
invariant. Accepted MVP limit; record the reachability argument so phase 12 need not rediscover it.

**N3 — `strengthForScore` throws a bare `RangeError`, not an `AppError`.**
Unreachable from `rankCandidates`: the numerator is at most `3 × |Q|` by construction, so the score
is always an integer in `[0, SCORE_MAX]` (MUT-07-4 is the only path that reaches the throw).
Contract `04` §6 — "Unknown errors are wrapped as `InternalError` at the transport layer only.
Services let them propagate" — sanctions a programmer-error guard propagating. C2(j)–(l) assert
`.toThrow()` with no class, so either choice passes. No change required; record the choice.

**N4 — `tokenize` and `scoreItem` are exported per master §6.6 but exercised only through
`rankCandidates`.** Not dead scaffolding (production caller, registered public names), but the
absence of any direct test is the surface B2 travels on; a direct `scoreItem` table would discharge
B2 as well.

## Verified correct — settled ground the fix round need not revisit

- All six gate items, each checked against the tree rather than the handoff.
- Counts re-derived by command: 8 criteria, 56 rows, 14 mutations; per-criterion
  `5+12+3+4+4+5+11+12 = 56`.
- Trace chain bijective in both directions: 56 `it` cases ↔ 56 row ids, no duplicate, no uncovered
  row, no orphan test.
- The fixture roster against every property task 3 requires, checked numerically in the file:
  over-cap description 301 chars with a non-whitespace `"c"` at index 279; exact-cap exactly 280;
  item 4 carries no `en` description; item 8 carries whitespace-only `sv` **and** `no`; the
  `"9"`/`"10"` identical-text pair; `"service"` in all fourteen `en` titles; `"premium"` in exactly
  two and in no `en` description.
- The plan's worked score table reproduced exactly by the code: 778 / 667 / 444 / 333 / 222 / 111.
- `TOKEN_PATTERN`'s `/g` statelessness: `.match()` is its only use; no `.test()` or `.exec()`
  anywhere in the file.
- C5(b)'s correction is sound and was necessary: MUT-07-10 reddens the re-sited row, and the
  original `"regional"` query does not.
- MUT-07-1 genuinely reddens C1(b); C6(d) genuinely discriminates numeric from lexical order;
  C6(e) genuinely discriminates via MUT-07-12.
- `toMatchObject` on arrays enforces length, so C7(f)–(k)'s "exactly one issue" is really asserted.
- Every C8 row is preceded by `expect(result.success).toBe(false)`, so no `if (!result.success)`
  block is vacuous.
- C1(b) copies before reversing (`[...FIXTURE_CATALOG].reverse()`), as the plan explicitly required.
- The service shape matches master §6.6 exactly: `unknown` input, getter-based `defaultDeps`, one
  `listContent()`, `ValidationError` with mapped issue paths.
- D15, D22, D24 and D28 are all declared in the handoff and all implemented as declared.
- C8(l)'s correction is right against raw Zod 4 `strictObject`.
- Perimeter: exactly the 11 declared files (9 code, 2 documents) at `f2399ac`; no undeclared write.

## Evidence

**L4 budget: zero spent, correctly.** `git diff f2399ac HEAD -- src/` is empty and
`git status --porcelain` was empty at entry, so `src/` at my HEAD `e621226` is byte-identical to
the implementer's stamp tree. That stamp — `npm test` 24 files / 334 tests green, `npm run
typecheck` and `npm run lint` clean — is cited under the charter's reuse rule and was not re-run.
I left no change under `src/`, so no closing stamp is owed.

All twelve probes ran at L1 (`npx vitest run --project node <file>`) or L2
(`npx vitest run --project node src/features/proposal-preparation`), plus two `npx tsc --noEmit`
runs for S1. Import radius confirmed before choosing L2: nothing outside
`src/features/proposal-preparation` imports `rank-candidates` or `domain/strength`.

| # | Probe | Scope | Result |
|---|---|---|---|
| 1 | fixture roster, worked table, tokenize statelessness, id equivalence | L1 (throwaway) | all reported above |
| 2 | presence-only filter (MUT-07-10 re-run at a new site) | L1 | C5(b) red, C5(a) green |
| 3 | language filter deleted entirely | L1 | C5(b) red, **C5(a) green** → B3 |
| 4 | missing-key half only deleted | L2 | **171/171 green** → B3 |
| 5 | C5(a) re-sited to `"ledningsnivå"` + probes 3 and 4 | L1 | red both ways → B3 correction verified |
| 6 | strength term deleted from the comparator | L2 | 171/171 green → B1 |
| 7 | score term deleted from the comparator | L2 | 171/171 green → B1 |
| 8 | both terms deleted (`variationId asc` only) | L2 | **171/171 green** → B1 |
| 9 | title weight 3 → 2; denominator `3` → `4` | L2 | 171/171 green both → B2 |
| 10 | C1(c) guard, five variant shapes | L1 | 2 caught, 3 not → S2 |
| 11 | `deps.ai` planted required and optional | `tsc --noEmit` | line 46 never fires → S1 |
| 12 | `reason` vs truncated description, synthetic item | L1 (throwaway) | reachable → N1 |

## Mutation-probe declaration

Every probe was applied and reverted with `git checkout --`. Restored and verified:

- `src/features/proposal-preparation/server/domain/rank-candidates.ts` (probes 2–9)
- `src/features/proposal-preparation/server/domain/rank-candidates.test.ts` (probe 5)
- `src/features/proposal-preparation/server/services/search-content-for-human.ts` (probe 11)
- `src/features/proposal-preparation/fixtures/catalog.ts`, `schemas/content-candidate.ts` — read
  only, never modified
- `tsconfig.tsbuildinfo` — touched by the two `tsc` runs, restored with `git checkout --`
- Three throwaway probe test files created under `src/features/proposal-preparation/`
  (`__probe.test.ts`, `__probe2.test.ts`, `__probe3.test.ts`), all deleted; `git status
  --porcelain --untracked-files=all` shows none remaining

SHA-256 digests of all five production files verified byte-identical to their pre-probe values
(`shasum -a 256 -c`, five OK). `git status --porcelain` empty at close. No database or external
state was touched; `.archgraph/` is not present in this repository and was skipped silently.

## Lessons for the plans

1. **A precedence row must name a fixture where its own key is the only cause of the order.**
   §9.1 rule 2's companion is written for filters ("two independent sufficient causes"); B1 is the
   same defect in an *ordering* row, where the second cause is the tie-break agreeing with the
   primary key. The rule should say so explicitly, because every later phase with a ranked or
   ordered criterion (11, 12, 13) inherits the shape. Suggested wording for §9.1 rule 2: *a row
   asserting an order names a fixture where the lower-precedence keys disagree with the higher one.*
2. **A row that names a value must assert that value.** C6(a)–(c) identify their items by score
   ("the `778` item") and assert only ordinal position, so the binding between "the 778 item" and
   `variationId "1"` is claimed in prose and checked nowhere. Where a plan's Notes carry a worked
   table, at least one row must reproduce it as an assertion, or the table is documentation that
   the suite does not defend.
3. **A comparator key that is a monotone function of another key can never be discriminated by an
   ordering row.** Worth a planner check: when a sort key is derived from a key later in the same
   tuple, either drop it or state which row guards it by asserting the derived label directly.
4. **`expectTypeOf(...).not.toHaveProperty(k)` does not fail typecheck when the property exists.**
   The projection recorded `expectTypeOf` as typecheck-enforced, which is true for the assertion
   shapes in `app-error.test.ts` but not for this one. Phases 8–15 should prefer a source-text or
   structural guard for "this boundary carries no X", and any `expectTypeOf` row should ship with a
   named mutation like every other guard.
5. **A source-text purity guard enumerates the *forms*, not just the specifiers.** Static import,
   dynamic `import()`, and global access are three shapes; MUT-07-2 covered one. Phase 9's tool
   boundary will want the same guard and should inherit the complete form list.

## Carry-forward dispositions

Not applicable — the verdict is `CHANGES_REQUESTED`, so every finding returns to the fix round.
N1 additionally routes to **phase 11** (which renders `reason` to a human) once the decision is
recorded here; N2 routes to **phase 12** (cross-turn `variationId` references) as a recorded
accepted limit.

## Full write perimeter

**Documents (2):**
- `master-plan.md` — tracker row 7 only (`REVIEWING` → `CHANGES_REQUESTED`).
- `plans/phase-07-ranking-and-human-search.md` — Review log append only.

**This handoff:** `handoffs/reviewer/phase-07-review-round-1.reviewer.md` (new).

**Code:** none. `src/` is byte-identical to `f2399ac`, verified by digest and by
`git diff f2399ac HEAD -- src/`.

**Tool-recorded state:** none. `.archgraph/` is not present; skipped silently.
