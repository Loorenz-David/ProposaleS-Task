---
plan: 7
role: implementer
round: 2
date: 2026-09-06
---

# Phase 7 — fix round 2 (findings from review round 1)

## Role and doctrine

You are the **implementing agent** for a fix cycle. Round 1 was implemented and independently
reviewed; the verdict was `CHANGES_REQUESTED`. Your job is to resolve the findings below and
**nothing else**.

- If you are a Claude session: invoke the `implementation-executor` skill.
- Otherwise: read `/Users/davidloorenz/agent-skills/implementation-executor.md` and
  `/Users/davidloorenz/agent-skills/pipeline-charter.md` **first**, by absolute path, and follow
  them as this session's doctrine.

Then follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`).

**Workspace:** `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`.
Implementation folder: `build_docs/under_constroction/initial_core_feature_proposales/`.

**`plans/phase-07-ranking-and-human-search.md` is your task list. It has been amended since round
1 — C1(c), C5(a), C6(a), C6(b), C6(c), C7(d) are rewritten and C6(f) is new. Where this prompt
differs from the plan file, the plan file wins.**

## This is the last cycle before the approval gate

**No independent re-review follows this round** (owner direction, 2026-09-06). The coordinator
validates your work against your own evidence and then the phase closes. That raises the bar on
this handoff rather than lowering it: every claim you make is the last claim anyone checks. State
what you observed, not what you expect.

## Gate check — verify before anything else; stop and report if any item fails

| # | Requirement | Where |
|---|---|---|
| 1 | Intention status header reads `RATIFIED` | `planing/proposal-preparation-backend-intention.md`, the `Status` row |
| 2 | Tracker row 7 reads `CHANGES_REQUESTED` | `master-plan.md` §4 |
| 3 | The phase plan's acceptance table yields **8 criteria, 57 rows, 19 named mutations** — re-derive by counting | `plans/phase-07-ranking-and-human-search.md` |
| 4 | The plan's C6 table contains a row `C6(f)` | same file |
| 5 | `rank-candidates.test.ts` does **not** yet contain the string `consulting service track` | working tree |
| 6 | `search-content-for-human.test.ts` still contains `expectTypeOf` | working tree |

Items 5 and 6 prove the work is outstanding.

## Read order

1. `plans/phase-07-ranking-and-human-search.md` — the amended criteria table, the Notes, and the
   Review log's last three entries (implementer round 1, coordinator fold, review round 1,
   coordinator fold of the review).
2. `handoffs/reviewer/phase-07-review-round-1.reviewer.md` — the review in full.
3. `master-plan.md` §9.1, in particular the new rules **15** and **16**, which this round's
   findings earned.

## Findings to resolve

Five findings. **Each correction below is quoted from the review verbatim, except where this
prompt says otherwise and explains why.** Resolve them; do not relitigate them, and add nothing
beyond them.

### B1 (blocking) — the sort order has no falsifiable test

Verbatim from the review:

> Deleting *both* the strength and score terms from the comparator, reducing it to `variationId
> ascending`, leaves 171/171 green at L2. C6(a), C6(b) and C6(c) pass because the fixture's
> `QUERY_3` ranking (`1/778 · 2/667 · 3/444 · 4/333 · 5/222`) places descending relevance in
> exactly ascending `variationId` order — two independent sufficient causes for every asserted
> precedence. […] *Finding against the criteria and the fixture, not the code — the comparator is
> correct.*

**The correction differs from the review's, and here is why.** The review proposed re-siting
C6(a)–(c) onto `rankCandidates("standard facilitation consulting", FIXTURE_CATALOG, "en")`. The
coordinator ran it: it returns `9/444/possible · 10/444/possible · 1/333/weak · 2/333/weak`,
exactly as the review states — but its top band is `possible`, so **C6(a) has no `strong` item**,
and both bands hold equal scores, so **C6(c) has no two distinct scores inside one band**. Two of
the three rows would have been unwritable. The replacements below were found by enumerating
85,320 two- and three-token queries over the fixture's own `en` tokens and keeping those whose
returned id order is *not* ascending; both are verified against the shipped code.

Use the queries the amended plan now names:

- **C6(a)** — `"consulting service track"` → `["2",1000,"strong"]` precedes `["1",667,"possible"]`.
- **C6(b)** — `"consulting service bundle"` → `["5",444,"possible"]` precedes `["3",333,"weak"]`.
- **C6(c)** — the same `"consulting service bundle"` ranking → `["8",667,"possible"]` precedes
  `["5",444,"possible"]`.

In every pair the **higher** id comes first, so ascending `variationId` cannot produce the
asserted order. Assert `(variationId, score, matchStrength)` tuples, not ordinal position alone.

Add **MUT-07-15**: `rank-candidates.ts` · comparator, definition · delete the score term
(`if (a.score !== b.score) return b.score - a.score;`) → C6(a) red.

The review's second half is **already decided and is not yours to reopen** — see the plan's Notes:
the strength term is provably redundant (`strengthForScore` is monotone in `score`) and **stays**,
because §17A.8 states the sort key that way, with C6(f) as its guard.

### B2 (blocking) — no row observes `score` or `matchStrength` on any returned candidate

Verbatim from the review:

> Changing the title weight from 3 to 2, or the normalisation denominator from `3 * |Q|` to
> `4 * |Q|`, leaves 171/171 green. The plan's worked table *is* reproduced by the code (verified:
> 778 / 667 / 444 / 333 / 222 / 111) but is asserted nowhere; C6(a)–(c) name their items by score
> and then identify them by `variationId` without ever checking it. §17A.8 makes `matchStrength`
> the gate for auto-selection ("Auto-selection as the recommended default requires `strong`") and
> for the `no_acceptable_match` / `weak_match` / `non_strong_selection` warning kinds (master
> §6.3) — all consumed by phase 11.
>
> Correction: assert the full `(variationId, score, matchStrength)` tuple sequence on B1's query,
> and add **MUT-07-16** — `rank-candidates.ts` · `scoreItem`, definition · title weight 3 → 2 → red.

This is the new **C6(f)**, whose ten expected tuples the plan writes out literally. Note what the
coordinator observed while verifying it: under MUT-07-16 the **order is unchanged**
(`2·1·5·3·4·6·7·8·9·10` either way) and only the tuples move — which is exactly why an
ordinal-only assertion could not catch this and why the row must assert tuples.

### B3 (blocking) — the missing-key half of the language filter is unguarded; C5(a) cannot fail

Verbatim from the review:

> Deleting `title === undefined ||` while keeping the whitespace check leaves 171/171 green.
> Deleting the *entire* filter reddens only C5(b). C5(a) exists to prove §17A.8's "A content item
> without `title[language]` is **excluded from candidates**" (criterion 13) and observes nothing:
> its `sv` query `"suite"` is an en-only term the score floor excludes under every mutant. This is
> the identical shape the coordinator repaired in C5(b) and explicitly routed to this review, and
> it is real. *Finding against the criterion — the plan authored it.*
>
> Correction, verified in both directions: change C5(a)'s `sv` query to `"ledningsnivå"`, a term
> from item 7's own `sv` description.

Take that query. **MUT-07-17's wording must not be taken literally, and the plan now writes it out
in full.** The coordinator verified both readings: deleting the `title === undefined ||` clause
outright leaves `title.trim()` on `undefined`, which throws
`TypeError: Cannot read properties of undefined (reading 'trim')` and reddens C5(a), C5(b) **and**
C5(c) — a crash, not the defect under test, and a ledger row recorded from that red would certify
a guard that does not exist. The mutant the review actually ran is the non-throwing one, verified
to leave the file's 21 tests green:

```
MUT-07-17  rank-candidates.ts · rankCandidates, definition
  replace  if (title === undefined || title.trim().length === 0) continue;
  with     if (title !== undefined && title.trim().length === 0) continue;
  → C5(a) red
```

C5(a) also gains a control, asserted **first**: `rankCandidates("suite", FIXTURE_CATALOG, "en")`
returns exactly one candidate, `variationId "7"` — so the row proves the item is matchable before
it proves the item is excluded.

### S1 (should-fix) — C7(d)'s instrument never fires

Verbatim from the review:

> Adding `ai?: unknown` to the `deps` parameter type passes both `npm run typecheck` and the suite.
> Adding a required `ai: unknown` fails at ten *call-site* lines (24, 31, 40, 52, 61, 70, 80, 92,
> 101, 111) and never at line 46, the `expectTypeOf` itself. The optional shape is the realistic
> one for an added model dependency, and it is invisible. […]
>
> Correction: replace with a source-text guard mirroring C1(c) — `search-content-for-human.ts`
> carries no import from `@/lib/ai` or `@/lib/agent` — and name the mutation that adds one.

Add **MUT-07-18**. `@/lib/ai` does not exist until phase 8, so apply the probe as a source-text
edit and expect the row red on the text, not on module resolution.

### S2 (should-fix) — C1(c)'s purity guard is blind to dynamic `import()`

Verbatim from the review:

> Variations run against the shipped guard: mixed inline-type import
> (`import { type ContentItem, getProposalesClient } from "@/lib/proposales"`) → caught;
> `new globalThis.Date()` → caught; `await import("node:fs")` → **not caught**;
> `await import("@/lib/proposales")` → **not caught**; computed `globalThis["Da"+"te"]` → not
> caught (contrived, accepted). MUT-07-2 exercised only the static form. Dynamic import is how I/O
> actually enters a module, and it is this repository's own test idiom.
>
> Correction: add `expect(stripped).not.toMatch(/\bimport\s*\(/)` to C1(c) and name it as a mutation.

Add **MUT-07-19**: same file and site as MUT-07-2 · add `await import("node:fs")` inside
`rankCandidates` → C1(c) red.

## The four notes — already decided, no work owed

N1 (`reason` over the full description), N2 (`compareVariationIds` numeric ties), N3
(`RangeError`) and N4 are **decided in the plan's Notes and routed forward** to phases 11 and 12.
No code change follows from any of them. Do not implement them, and do not re-derive the
arguments — read them so you do not "fix" one by accident.

## Allowed file perimeter

The re-review — here, the coordinator's validation — will verify this exactly.

- `src/features/proposal-preparation/server/domain/rank-candidates.test.ts` (C1(c), C5(a), C6)
- `src/features/proposal-preparation/server/services/search-content-for-human.test.ts` (C7(d))
- `plans/phase-07-ranking-and-human-search.md` (Review log append only)
- `master-plan.md` (tracker row 7 only)

**No production file changes.** Every finding is against a criterion or a test, never against the
code — the review says so explicitly for B1 and B3, and B2, S1, S2 are all test-side. If you
believe a production file must change, **stop and report**; do not change it.

Nothing in `fixtures/catalog.ts` changes either: the review confirmed, and the coordinator
re-verified, that discriminating queries already exist in the shipped catalog.

**Name any test or helper this round supersedes for deletion.** The old `QUERY_3`-based C6
assertions and the `expectTypeOf` block in C7(d) are replaced, not added to — superseded
scaffolding left behind becomes a green light wired to nothing.

## Evidence budget

**This session's L4 budget is exactly one run** — the closing stamp, mandatory, taken on the tree
you hand over.

- The five new mutations (MUT-07-15 … MUT-07-19) run at **L1**, each against the named test it
  must redden.
- **Re-run the fourteen existing mutations only where this round's edits could have moved them.**
  MUT-07-2 and MUT-07-10 sit on rows you are editing; run those two. The other twelve were
  verified in round 1 on production code this round does not touch — re-running them wholesale is
  not required and buys nothing.
- Cycle-internal checks at **L1/L2** (`npx vitest run --project node
  src/features/proposal-preparation`).
- Closing stamp: `npm test` plus `npm run typecheck` and `npm run lint`, with tree identity.

Any additional L4 needs an authorization line written **before** the run: "narrower evidence
insufficient because …". If you invalidate your own stamp by changing anything after taking it,
re-take it — the re-take is not over budget.

## Closing protocol

1. Run the five new mutations plus the two named re-runs; observe the expected red; revert;
   confirm the tree is clean.
2. Take the closing stamp on the tree you hand over, with hypothesis, scope, exact command, tree
   identity, result, and the failure-ID delta. The suite should be **57 tests** in this phase's
   four files (was 56; C6(f) is the addition) — derive the number, do not assume it.
3. Update **tracker row 7 only** to `IMPLEMENTED`, one-line note.
4. Append to the phase plan's Review log: what you changed per finding, the five mutations, and
   **any correction quoted in this prompt that you did not implement, with the reason, in its own
   section** (charter rule 14 — divergence is often right, but an undeclared divergence costs the
   next reader a finding on a non-defect).
5. Checkpoint commit, subject prefixed `CHECKPOINT (not approved):`, staging only this cycle's
   declared files. Standing-authorized; do not stop to ask.
6. Handoff to `handoffs/implementer/phase-07-fix-round-2.implementer.md` with the charter's
   frontmatter and a full write perimeter — documents, code, tool-recorded state. `.archgraph/`
   is not present; skip it silently.
7. Close with the owner layer: **What I did → What I found and what it means for you → What
   happens next → What needs you**.

## What to report back

- The gate check, item by item.
- Per finding: what changed, and the row that now fails when the defect is planted.
- The mutation table: five new rows plus the two re-runs, each naming file,
  definition-or-call-site, the change, and the test that went red.
- The closing stamp with its tree identity.
- Anything you did not implement, and why.
