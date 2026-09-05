---
plan: 4
role: review
round: 2
verdict: APPROVED
date: 2026-09-05
actor: Claude
---

# Phase 4 delta re-review handoff — round 2

Delta re-review of fix round 2 (checkpoint `d937fe8`) against the round-1 independent
review's B1–B3, S1–S8 and N1–N3. Every repaired defect was adversarially re-probed, most
with a mutant shape or site the implementation ledger did not use. **Verdict: `APPROVED`.**
No blocking and no should-fix findings. Two new notes, both carried forward.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner. No semantic conflict, contract conflict, or intention amendment
arose in this round.

## Gate check

| Gate | Result |
|---|---|
| Intention header `RATIFIED` | yes (`planing/proposal-preparation-backend-intention.md`, §23 round 12) |
| Tracker rows 1–3 `APPROVED` | yes |
| Row 4 `REVIEWING`, note begins `Fix round 2 checkpoint` | yes |
| Phase-4 Review log carries independent review round 1 (`CHANGES_REQUESTED`) and implementation round 2 (`IMPLEMENTED`) | yes |
| Plan declares 8 criteria / 80 rows / 35 named mutations | yes, and re-derived independently (below) |
| `d937fe8` and `23a096e` exist; `handoffs/implementer/phase-04-round-2.implementer.md` present | yes |

Counts re-derived from the acceptance table, not read from the sentence: 76 table lines,
expanding to **80 rows** (`C2(a–d)` contributes 4, `C2(g–h)` contributes 2), and **35**
distinct `MUT-04-*` identifiers (`MUT-04-1` … `MUT-04-35`, no gaps, no duplicates).

## Verified perimeter

| Range | Files | Verdict |
|---|---|---|
| `00fe990..d937fe8` | 17 | exactly the allowed set |
| `d937fe8..23a096e` | 1 | round-2 handoff checkpoint-SHA line only |
| `23a096e..f342549` | 2 | tracker row 4 + the re-review prompt (coordinator dispatch) |

The 17 are: `src/lib/proposales/{schemas.ts, mappers.ts, mappers.test.ts, index.ts,
client.test.ts, fake.ts, fake.test.ts, applied-pricing.mapper.ts,
applied-pricing.mapper.test.ts, README.md}`, `fixtures/{proposal-search.json,
proposal-readback.consistent.json, proposal-readback.inconsistent.json}`, the deletion of
`test/helpers/proposales-arithmetic-scan.test.ts`, master-plan tracker row 4, the Phase-4
Review log, and the round-2 implementer handoff. Nothing outside changed.

`client.ts` and `test/helpers/proposales-arithmetic-scan.ts` are byte-identical to
`00fe990`, which confirms the handoff's "mutation-only files, no retained probe changes"
claim rather than merely accepting it.

**Prompt-perimeter lesson (recorded, not a finding).** The fix prompt's file enumeration
omitted `index.ts` and `applied-pricing.mapper.ts`, both of which the phase plan has always
named and both of which the B1 repair necessarily touches. The prompt also states the plan
wins on conflict, so the coordinator's contradiction was self-resolving. Both files changed
by exactly one line each, confined to the vendor `mode` repair:
`index.ts:59` `taxOptions: { taxMode?… }` → `{ mode?… }`, and
`applied-pricing.mapper.ts:34` `readback.taxOptions.taxMode` → `.mode`. Permitted.
Lesson for the coordinator: a fix prompt's file list is derived from the plan's, never
re-typed narrower.

No frontend worktree or frontend-owned file is in scope, and none was touched.

## Findings

**Blocking: none. Should-fix: none.**

### Notes

- **N5 — `fixtures/proposal-readback.consistent.json` is no longer internally consistent.**
  The S6 repair gave the block four distinct unit values (10100 / 10200 / 10300 / 10400)
  but left `value_without_tax` and `value_with_tax` at `10000` with `quantity: 1`. Evidence
  §8.3 records that each stored price component is multiplied by quantity into the proposal
  totals, so the fixture now encodes a read-back the vendor was never observed to return,
  and the fixture's name no longer describes its content. **No guard is weakened:** M13 and
  intention §17A.12 pin MUT-04-7 to the *inconsistent* fixture, and C6(a) asserts only
  verbatim mapping. Suggested correction: `value_without_tax: 10100`,
  `value_with_tax: 10200` — restores the name, restores the C6(a)/C6(b) contrast, and makes
  MUT-04-7 redden only the row it names instead of both.
  Authority: `11-testing-principles.md` §3 (recorded real response), evidence §8.3.
- **N6 — MUT-04-3 and MUT-04-34 each cover more criterion rows than one mutation can
  demonstrate.** `mappers.test.ts › P4-C2(a-h)` asserts inside two `for` loops, so the first
  failing `expect` aborts the test. MUT-04-3 declares all six block keys optional at once
  and can only ever be observed on the first block key; MUT-04-34 likewise only on root
  `currency`. Charter rule 12 (enumerate the mutations, one per sub-check). The rows
  themselves are sound — this review's eight per-key probes discharge C2(a–h) individually
  and are recorded in the Review log — but the plan's ledger should name one mutation per
  row. Lesson for the planner, binding on plans authored after this phase.

## Probe declaration

Eighteen mutation probes, each applied at a named site, run at L1, observed red (or, for
RP3, run as a standalone parse to read the issue set), and reverted from a pre-probe copy.
Files touched by probes:

`src/lib/proposales/schemas.ts`, `mappers.ts`, `client.ts`, `fake.ts`,
`applied-pricing.mapper.ts`, `fixtures/proposal-readback.consistent.json`, plus one
temporary file `src/lib/proposales/zz-reviewer-probe.test.ts` created and deleted for RP3.

| Probe | Site | Reddened |
|---|---|---|
| RP1a | `schemas.ts` `taxOptionsSchema.mode` → `tax_mode` | `P4-C7(e-g)` |
| RP1b | `mappers.ts` `wire.tax_options.mode` → `.tax_mode` | `P4-C7(e-g)` |
| RP1c | consistent fixture key `mode` → `tax_mode` | `P4-C7(e-g)` |
| RP1d | `applied-pricing.mapper.ts` `taxOptions.mode` → `.taxMode` | `P4-C7(e-g)` |
| RP2 | `client.ts:69` drop `parseCreateProposalRequest` from the POST path | `P4-C3(j)`, with the bare fetch spy reached |
| RP3 | standalone parse of the C3(i) and C3(j) fixtures and of the absent-shape request | one issue each; absent request parses |
| RP-B3 ×8 | one prohibited key declared optional at a time — six on `createProposalBlockSchema`, two on `createProposalRequestSchema` | `P4-C2(a-h)`, each on its own labelled sub-assertion |
| RP-S1 | `fake.ts` records `{ ...request, company_id: 999 }` | `P4-C3(h)` |
| RP-S2 | `fake.ts` seeded `storedReadbacks` emptied | `P4-C3(l)` |
| RP-S3 | `mappers.ts` absent `tax_options` → `{ mode: "none" }` | `P4-C7(e-g)` |
| RP-S4 | `applied-pricing.mapper.ts` drop `blockCurrency !== undefined &&` | `P4-C7(c-d)` |
| RP-S5 | `client.ts` re-verification made case-insensitive | `P4-C5(a-f)` |
| RP-S6a | `applied-pricing.mapper.ts` swap two Money sources | `P4-C6(a)` |
| RP-S6b | `toProposalReadback` swap the two with-discount wire fields | `P4-C6(a)` |
| RP-S6c | `toProposalReadback` swap the two without-discount wire fields (new) | `P4-C6(a)` |
| RP-S6d | `toProposalReadback` map `tax_included` onto `taxLabelKey` (new snake/camel mutant) | `P4-C7(e-g)` |
| RP-N3 | `blockField` emits `currency: "EUR"` | `P4-C2(i)` |

**Restoration.** Every one of the 23 files under
`src/lib/proposales/**` and `test/helpers/**` was verified byte-identical to the pre-review
baseline by `shasum -a 256 -c` after the last probe; `git status --porcelain` shows only
the two pre-existing untracked reviewer handoffs; the temporary probe test file was
deleted. `tsconfig.tsbuildinfo` was rewritten by `npm run typecheck` and restored to its
pre-run bytes (SHA-256 `3adf45b9…` before and after). No database or external state exists
in this phase.

## Evidence and tree identity

- Tree: `f342549`, `git status --porcelain` = the two pre-existing untracked reviewer
  handoffs only.
- One authorized L4 stamp, on the tree handed over: `npm test` → **12 files / 163 tests
  green** (1.09 s). Budget was exactly 1 and exactly 1 was spent.
- `npm run typecheck` clean; `npm run lint` clean; `git diff --check` clean.
- `npx vitest list` → 12 collected files, no `test/helpers/proposales-arithmetic-scan.test.ts`.
- All probe runs were L1: `npx vitest run --project node <file> -t "<plain title fragment>"`.

**Measurement hazard re-observed.** The first probe run used `-t 'P4-C7(e-g)'`; the
parentheses are regex syntax, the selector matched nothing, and vitest reported
`1 skipped (1) / 29 skipped` with **exit 0** — a false green of exactly the shape the
round-2 implementer recorded for MUT-04-7. Re-run with a parenthesis-free fragment before
any conclusion was drawn. Worth a standing rule: `-t` selectors never contain a criterion
label with parentheses.

## Write perimeter of this session

- `build_docs/.../master-plan.md` — tracker row 4 only, `REVIEWING` → `APPROVED`.
- `build_docs/.../plans/phase-04-proposales-proposals.md` — one appended Review log entry.
- `build_docs/.../handoffs/reviewer/phase-04-round-2.reviewer.md` — this file (new).
- No production code, test, fixture, prompt, or prior handoff was modified. No architecture
  graph is present.

## Carry-forward dispositions

| Note | Origin | Destination | Status |
|---|---|---|---|
| N4 — `tsconfig.tsbuildinfo` is tracked and rewritten by every `npm run typecheck`, making the "asserted-clean porcelain" tree identity fragile | review round 1 | phase 15, with master follow-up 8 | open; re-confirmed this round (restored to pre-run bytes) |
| N5 — `proposal-readback.consistent.json` no longer internally consistent | this round | phase 14 (execution read-back fixtures), or a coordinator fold into this plan's fixture note | open |
| N6 — one named mutation covering six/two rows cannot demonstrate them all | this round | implementation-planner; binds plans authored after phase 4 | open |
| Prompt-perimeter lesson — a fix prompt's file list must be derived from the plan's | this round | pipeline-coordinator | open |

## Lessons for the plans

1. **The `-t` selector hazard is now a two-round pattern** (MUT-04-7 in the fix round, RP1a
   in this one). A vitest `-t` argument is a regex; a criterion label like `P4-C7(e-g)`
   matches nothing and the run exits 0 with everything skipped. Both the executor and
   reviewer doctrines should require a plain-prose title fragment for mutation selectors,
   and require the probe's own output to show `1 failed`, never just a non-zero exit.
2. **Enumerate mutations one per row** where a criterion's test asserts inside a loop
   (N6). The plan's "declare all four unit-value keys, `package_split`, and `currency`
   optional → C2(a–f) red" reads as six rows covered and demonstrates one.
3. **A repair that changes fixture data can invalidate the fixture's premise** (N5).
   "Make the four unit values distinct" was correct and was applied; nothing asked whether
   the totals still described the same vendor state. A fixture whose name asserts a
   property should carry that property as an explicit plan row.
4. **A fix prompt's file enumeration is derived, never re-typed** — this round's prompt
   omitted two files the plan requires the repair to touch.
