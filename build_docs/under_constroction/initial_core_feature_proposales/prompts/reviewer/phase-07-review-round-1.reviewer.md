---
plan: 7
role: reviewer
round: 1
date: 2026-09-06
---

# Phase 7 — Content ranking domain and human search (first review, round 1)

## Role and doctrine

You are the **independent reviewer** of one implemented phase. You did not write this code and
you did not author the plan; both are under review. Your session is stateless and
self-contained by reference.

- If you are a Claude session: invoke the `plan-reviewer` skill.
- Otherwise: read `/Users/davidloorenz/agent-skills/plan-reviewer.md` and
  `/Users/davidloorenz/agent-skills/pipeline-charter.md` **first**, by absolute path, and follow
  them as this session's doctrine.

Then follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`) — for review it runs in reverse: diff →
concerns touched → `architectural_contracts/01-implementation-contract-guide.md` → the
applicable contracts → judge the diff against them. A review judges contract preservation, not
only whether the code works.

**Workspace:** `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`.
Implementation folder: `build_docs/under_constroction/initial_core_feature_proposales/`.

**This is a first review, not a delta re-review.** Full checklist against the plan's criteria
and the semantic authorities.

## Gate check — verify before anything else; stop and report if any item fails

| # | Requirement | Where |
|---|---|---|
| 1 | Intention status header reads `RATIFIED` | `planing/proposal-preparation-backend-intention.md`, the `Status` row |
| 2 | Tracker rows 1–6 all read `APPROVED`; row 7 reads `REVIEWING` | `master-plan.md` §4 |
| 3 | The phase plan's acceptance table yields **8 criteria, 56 rows, 14 named mutations** — re-derive by counting | `plans/phase-07-ranking-and-human-search.md` |
| 4 | `src/features/proposal-preparation/server/services/search-content-for-human.ts` exists and its first statement is `import "server-only";` | working tree |
| 5 | `MAX_SEARCH_QUERY_CHARS` is exported from `schemas/content-candidate.ts` | working tree |
| 6 | The checkpoint `f2399ac` touches exactly 11 files — 9 code, 2 documents | `git show --stat f2399ac` |

## Read order

1. `plans/phase-07-ranking-and-human-search.md` **in full**, including its Review log — which
   carries the projection fold, the implementer's round-1 entry, and the coordinator's fold.
   Two criterion rows (C5(b), C8(l)) were **corrected after implementation**; the table is
   current and the corrections are marked and reasoned.
2. `handoffs/implementer/phase-07-round-1.implementer.md` — the implementer's own account.
   Treat it as a claim to check, not as evidence.
3. `master-plan.md` §§6.4, 6.5, 6.6, 6.7, 9.0 (the owner's scope brief), 9.1 (rules 4, 6, 9,
   13, and the new rule 15), 10.5.
4. Intention §17A.8 (all), §17A.16, §10.2, §5.1.
5. The contracts the guide routes you to.

## What the round owes

Nine code paths, all inside `src/features/proposal-preparation/`:
`server/domain/strength.ts` + test · `server/domain/rank-candidates.ts` + test ·
`server/services/search-content-for-human.ts` + test · `fixtures/catalog.ts` ·
`schemas/content-candidate.ts` (edited) + a new test.

## Named probes — extracted from reconciling the handoff against the tree

These are **not** findings. They are the places where the handoff's own account, or the shape
of the code, leaves a judgment open. Each is a probe you run; report what you observe, whether
or not it turns into a finding.

1. **C5(a) may be the defect C5(b) already was.** The implementer's mutation run caught that
   C5(b) had two independent sufficient causes — the title-language filter *and* the score
   floor both produce "not a candidate" — and re-sited its query. **C5(a) has the identical
   shape and carries no named mutation, so nothing forced the same check.** Plant the
   presence-only filter (the MUT-07-10 mutant) and, separately, remove the language filter
   entirely; observe whether C5(a) reddens. If it cannot redden, it is a row that cannot fail
   (charter rule 15) — and the plan authored it, not the implementer. This is the single
   highest-value probe in this round.

2. **`reason` is computed from the raw description, not the returned one.** `rankCandidates`
   tokenizes `rawDescription` for `reason` but returns a truncated `description`. A candidate
   can therefore cite a matched token the human cannot see in the text shown. The score is also
   computed on the full text, so this may be exactly right — the plan did not determine it.
   Decide and record which, because phase 11 shows `reason` to a human.

3. **The `variationId` tie-break's numeric path is wider than C6(e) tests.**
   `compareVariationIds` compares `Number(a) - Number(b)` whenever both parse finite. `"1"`,
   `"01"`, `"1.0"` and `"1e0"` all map to `1`, so the comparator returns `0` and the sort falls
   back to arrival order — the vendor list-order leak §17A.8 exists to prevent, in the very
   function written to prevent it. C6(e) covers only the non-numeric case. Establish
   reachability first (`src/lib/proposales/mappers.ts` maps `variation_id` through
   `String(...)` over a `z.number().int()`, and `contentCandidateSchema.variationId` is only
   `z.string().min(1)`), then judge: an accepted MVP limit with a recorded reason, or one more
   row.

4. **`strengthForScore` throws a bare `RangeError`.** Master §6.3 and contract `04` §6 define
   the error taxonomy for this repository. The throw is unreachable from `rankCandidates` (the
   formula cannot leave `[0, SCORE_MAX]`), so it reads as a programmer-error guard rather than
   a domain error — judge whether that is the right instrument here, and whether a raw
   `RangeError` escaping a `server/` module is acceptable.

5. **Vary the C1(c) source guard beyond the mutation it shipped with.** The test strips lines
   beginning `import type ` and then matches forbidden specifiers. MUT-07-2 used a plain value
   import. Try shapes it did not: a **mixed inline-type import**
   (`import { type ContentItem, getProposalesClient } from "@/lib/proposales"`), a **dynamic**
   `await import("node:fs")`, and a `new Date()` written as `globalThis.Date`. Report which the
   guard still catches. Variation is where this family of defect is actually found.

6. **Reconcile the fixture roster against every property task 3 requires**, item by item, in
   the file: the over-cap description whose character at index `MAX_CANDIDATE_DESCRIPTION_CHARS − 1`
   is non-whitespace; the exactly-at-cap item; the item with no `en` description key; the
   whitespace-only `sv` title carrying a whitespace-only `"no"` key that appears non-empty
   nowhere else; the `"9"`/`"10"` identical-text pair; the token in every `en` title and the
   token in exactly two. A property the plan requires and the fixture lacks makes its row
   vacuous rather than red.

7. **Confirm one test per row, not one test covering several.** The four new files carry 56
   `it` cases against 56 declared rows — the coordinator verified the counts match, which is
   not the same as verifying each row has its own falsifiable assertion. Check the rows whose
   plan text bundles two observables (C4(a), C4(c), C4(d), C5(a), C6(e), C7(i)).

8. **`tokenize` uses a module-level `/g` regex.** `String.prototype.match` with `/g` does not
   read `lastIndex`, so it is currently stateless — confirm it, and confirm nothing else in the
   file uses `.test()` or `.exec()` on that same object, where the statefulness would bite.

9. **`scoreItem` and `tokenize` are exported.** Both are registered public names in master
   §6.6, so they are not scaffolding — but check whether any test exercises them directly or
   only through `rankCandidates`, and whether the worked score table in the plan's Notes is
   actually reproduced by the code for at least one row you compute by hand.

## Evidence budget

**Your L4 budget is one, and it is conditional. Verify the tree before you spend it.**

The implementer's closing stamp was taken on HEAD `a9bfabe` plus the nine-path dirty diff,
which is now committed unchanged as `f2399ac`: `npm test` → 24 files / 334 tests green,
`npm run typecheck` and `npm run lint` clean.

- **Confirm** — do not assume — that `src/` at your HEAD is byte-identical to that stamp's
  tree. Everything the coordinator changed since is under `build_docs/`.
- **If it is identical:** cite that stamp and **do not re-run it**. A redundant identical
  full-suite run, with no variation and no pre-run authorization line, is a finding against
  this session, the same severity as an unrun probe.
- **If it differs, or if you leave any change under `src/`:** take exactly one L4 stamp on the
  tree you hand over, with its tree identity. That stamp is mandatory, not optional — citing an
  earlier stamp whose tree you then changed is the mirror-image violation.

Everything else — every probe above, every planted defect, every mutation you re-run — is L1
or L2 (`npx vitest run <path> [-t "<name>"]`, `npx vitest run --project node
src/features/proposal-preparation`). Any additional L4 needs an authorization line written
**before** the run: "narrower evidence insufficient because …".

Re-running the implementer's 14 named mutations wholesale is **not** required and is not what
finds defects here. Spend the effort on variation: different sites, different mutant shapes,
the probes above.

## Closing protocol

1. Findings routed by severity — blocking / should-fix / note — each naming the correction in
   the form the fix round must implement. A finding about a **criterion** rather than the code
   says so explicitly; two rows were already corrected that way this round, and the plan is as
   much under review as the implementation.
2. Restore anything you planted. Declare every probe file and confirm the tree is byte-identical
   afterwards.
3. Update **tracker row 7 only** (`master-plan.md` §4) to `CHANGES_REQUESTED` or `APPROVED`.
4. Append your entry to the phase plan's Review log.
5. Write your handoff to `handoffs/reviewer/phase-07-review-round-1.reviewer.md` with the
   charter's frontmatter (`plan`, `role`, `round`, `date`, `verdict`, `actor`) and a full write
   perimeter — documents, code, tool-recorded state. `.archgraph/` is not present here; skip it
   silently.
6. Close with the owner layer: **What I did → What I found and what it means for you → What
   happens next → What needs you** (decision cards verbatim, or one line: "nothing needs you").

## Scope note

The owner's scope brief (`master-plan.md` §9.0) binds this review: this is an MVP that must be
senior-quality, not a fully hardened production service. Trim by **reducing an ask, never by
dropping a guard** — a guard that cannot fail is not a cheaper guard. Record every exclusion
where the excluded work lives, with its reason.
