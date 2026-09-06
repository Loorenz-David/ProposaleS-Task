---
plan: 5
role: fix
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 5 implementation handoff — fix round 2

Resolved the three should-fix findings S1–S3 and notes N2–N5 from the independent round-1
review. The fix is limited to the C6/C8/C1 test instruments, the source-union construction
guard, and the two requested fixture cleanups. No owner decision is required.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner.

## Gate and context

- Intention header: `RATIFIED`.
- Master-plan row 4: `APPROVED`; row 5 at entry: `IMPLEMENTING`, fix round 2 dispatched.
- Round-1 reviewer handoff: `CHANGES_REQUESTED`, exactly 0 blocking and 3 should-fix findings.
- Phase plan contains the round-1 implementation and reviewer entries; the round-1 correction was
  not already present at entry.
- Entry `git status --porcelain`: empty. `tsconfig.tsbuildinfo`, frontend files, and unrelated
  work were preserved.
- Applicable contracts: `02-runtime-boundaries.md` §3, `03-feature-architecture.md` §§1–4,
  `06-data-contracts-and-validation.md` §§1–4 and 6–7, `08-agent-architecture.md` §§4 and 6–7,
  `11-testing-principles.md` §§2–3 and 5, `12-anti-patterns.md` Data/validation and Structure,
  `13-decision-checklist.md`, and `14-documentation-principles.md` §8.

## What changed

- `shared.ts`: removed the silent `knownOrAbsent` fallback from `sourcedOrAbsent`; the helper's
  parameter now requires the source-union construction type and construction is checked against a
  private `WeakSet`, producing a `TypeError` for a non-source union. No `as any` fallback can emit
  a source-less `{ known: true, value }` shape.
- `shared.test.ts`: C1(b) now builds a real consequential source union, asserts the sourced-known
  arm and explicit absent arm, and probes non-source construction failure.
- `proposition.test.ts`: C6(d) mutates only `.text.value` and checks `too_big` at the exact
  `commercialNotes.0.text.value` path; all eight trim checks now mutate and inspect their own
  field.
- `provenance-projection.test.ts`: C8(a) asserts the complete ordered 26-path output and exact
  cardinality; C8(b) asserts the complete ordered 96-path output for the 11-block fixture and
  exact cardinality.
- `propositions.ts`: removed unused `ConsequentialLeafDescriptor.seed` and the redundant
  commercial-assumption branch in `leafInferred`.

## Row-by-row coverage map

Each criterion row appears once. “Exact” means the assertion has the row's required shape; no row
is discharged by a weaker assertion.

| Row | Test id | Assertion shape |
|---|---|---|
| C1(a) | `shared.test.ts` C1(a) | Exact sourced presentational parse, including ref. |
| C1(b) | `shared.test.ts` C1(b) | Exact sourced-known arm, explicit absent arm, missing-field path, and construction failure for non-union. |
| C1(c) | `shared.test.ts` C1(c) | Exact missing `ref` path for content source. |
| C1(d) | `shared.test.ts` C1(d) | Exact quote cap rejection. |
| C1(e) | `shared.test.ts` C1(e) | Exact human turn parse, uppercase UUID rejection path, and turnId-without-quote rejection path. |
| C2(a) | `proposition.test.ts` C2(a) | Exact normalized `source` path for recipient firstName inferred mutant. |
| C2(b) | `proposition.test.ts` C2(b) | Exact normalized `source` path for recipient lastName inferred mutant. |
| C2(c) | `proposition.test.ts` C2(c) | Exact normalized `source` path for recipient email inferred mutant. |
| C2(d) | `proposition.test.ts` C2(d) | Exact normalized `source` path for recipient phone inferred mutant. |
| C2(e) | `proposition.test.ts` C2(e) | Exact normalized `source` path for recipient companyName inferred mutant. |
| C2(f) | `proposition.test.ts` C2(f) | Exact normalized `source` path for contentId inferred mutant. |
| C2(g) | `proposition.test.ts` C2(g) | Exact normalized `source` path for quantity inferred mutant. |
| C2(h) | `proposition.test.ts` C2(h) | Exact normalized `source` path for optional inferred mutant. |
| C2(i) | `proposition.test.ts` C2(i) | Exact normalized `source` path for note amount inferred mutant. |
| C2(j) | `proposition.test.ts` C2(j) | Exact normalized `source` path for note currency inferred mutant. |
| C2(k) | `proposition.test.ts` C2(k) | Exact normalized `source` path for taxBasis inferred mutant. |
| C2(l) | `proposition.test.ts` C2(l) | Exact normalized `source` path for deadline inferred mutant. |
| C2(m) | `proposition.test.ts` C2(m) | Exact normalized `source` path for term inferred mutant. |
| C2(n) | `proposition.test.ts` C2(n) | Exact normalized `source` path for scope_commitment inferred mutant. |
| C2(o) | `proposition.test.ts` C2(o) | Exact normalized `source` path for emptyDraftConfirmation inferred mutant. |
| C3(a) | `proposition.test.ts` C3(a) | Exact rejection of brief-sourced contentId. |
| C3(b) | `proposition.test.ts` C3(b) | Exact rejection of content-sourced quantity. |
| C3(c) | `proposition.test.ts` C3(c) | Exact rejection of content-sourced optional. |
| C3(d) | `proposition.test.ts` C3(d) | Exact rejection of non-human empty-draft confirmation. |
| C3(e) | `proposition.test.ts` C3(e) | Exact acceptance and human source assertion. |
| C3(f) | `proposition.test.ts` C3(f) | Exact rejection of human-authored catalog title. |
| C3(g) | `proposition.test.ts` C3(g) | Exact rejection of content-sourced commercial amount. |
| C3(h) | `proposition.test.ts` C3(h) | Exact acceptance of inferred `other` assumption. |
| C3(i) | `proposition.test.ts` C3(i) | Exact four-value positive-int64 acceptance/rejection matrix. |
| C4(a) | `proposition.test.ts` C4(a) | Exact inferred language acceptance. |
| C4(b) | `proposition.test.ts` C4(b) | Exact inferred title acceptance. |
| C4(c) | `proposition.test.ts` C4(c) | Exact inferred narrative acceptance. |
| C4(d) | `proposition.test.ts` C4(d) | Exact inferred reviewer comment acceptance. |
| C4(e) | `proposition.test.ts` C4(e) | Exact inferred alternative reason acceptance. |
| C4(f) | `proposition.test.ts` C4(f) | Exact inferred rationale acceptance. |
| C4(g) | `proposition.test.ts` C4(g) | Exact inferred assumption note acceptance. |
| C5(a) | `proposition.test.ts` C5(a) | Exact strict rejection of block price field. |
| C5(b) | `proposition.test.ts` C5(b) | Exact strict rejection of proposal total. |
| C5(c) | `proposition.test.ts` C5(c) | Exact strict rejection of block currency. |
| C5(d) | `proposition.test.ts` C5(d) | Exact integer-money, decimal-money, and explicit-absent matrix. |
| C5(e) | `proposition.test.ts` C5(e) | Exact explicit taxBasis presence requirement. |
| C5(f) | `proposition.test.ts` C5(f) | Exact uppercase currency acceptance, lowercase rejection, and absent acceptance. |
| C5(g) | `proposition.test.ts` C5(g) | Exact library literal, custom rejection, and missing rejection. |
| C6(a) | `proposition.test.ts` C6(a) | Exact title cap rejection and title trim output. |
| C6(b) | `proposition.test.ts` C6(b) | Exact narrative cap rejection and narrative trim output. |
| C6(c) | `proposition.test.ts` C6(c) | Exact reviewer-comment cap rejection and reviewer-comment trim output. |
| C6(d) | `proposition.test.ts` C6(d) | Exact wrapper-preserving cap mutation, `too_big` code, exact `.text.value` path, and note trim output. |
| C6(e) | `proposition.test.ts` C6(e) | Exact rationale cap rejection and rationale trim output. |
| C6(f) | `proposition.test.ts` C6(f) | Exact warning-text cap rejection and warning-text trim output. |
| C6(g) | `proposition.test.ts` C6(g) | Exact assumption-note cap rejection and assumption-note trim output. |
| C6(h) | `proposition.test.ts` C6(h) | Exact alternative-reason cap rejection and alternative-reason trim output. |
| C7(a) | `shared.test.ts` C7(a) | Exact zero rejection. |
| C7(b) | `shared.test.ts` C7(b) | Exact negative rejection. |
| C7(c) | `shared.test.ts` C7(c) | Exact NaN rejection. |
| C7(d) | `shared.test.ts` C7(d) | Exact Infinity rejection. |
| C7(e) | `shared.test.ts` C7(e) | Exact positive integer acceptance. |
| C7(f) | `shared.test.ts` C7(f) | Exact positive fractional acceptance. |
| C8(a) | `provenance-projection.test.ts` C8(a) | Exact ordered 26-path sequence, cardinality equality, and canonical decimal-index assertion. |
| C8(b) | `provenance-projection.test.ts` C8(b) | Exact ordered 96-path sequence for 11 blocks, including numeric `0…10` order, and cardinality equality. |
| C8(c) | `provenance-projection.test.ts` C8(c) | Exact absence of the absent quantity entry. |
| C8(d) | `provenance-projection.test.ts` C8(d) | Exact strict rejection of input provenance. |

Coverage arithmetic: C1 5 + C2 15 + C3 9 + C4 7 + C5 7 + C6 8 + C7 6 + C8 4 = 61 rows;
61 phase-authored tests across 3 files, with no orphan test.

## Named mutation ledger

All 21 named mutations were applied at the plan's definition/call site, run at L1, observed red,
and reverted. The C2 family runs its 15 parameterized cases together; each row below names the
case that failed. “1 failed / 14 passed” means the other C2 cases remained green.

| Mutation | Site | Command scope | Observed failure |
|---|---|---|---|
| MUT-05-1a | `schemas/proposition.ts` recipient `firstName` consequential call | `proposition.test.ts -t C2` | C2(a), expected `safeParse().success` false but got true; 1 failed / 14 passed. |
| MUT-05-1b | `schemas/proposition.ts` recipient `lastName` consequential call | `proposition.test.ts -t C2` | C2(b), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1c | `schemas/proposition.ts` recipient `email` consequential call | `proposition.test.ts -t C2` | C2(c), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1d | `schemas/proposition.ts` recipient `phone` consequential call | `proposition.test.ts -t C2` | C2(d), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1e | `schemas/proposition.ts` recipient `companyName` consequential call | `proposition.test.ts -t C2` | C2(e), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1f | `schemas/proposition.ts` block `contentId` consequential call | `proposition.test.ts -t C2` | C2(f), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1g | `schemas/proposition.ts` block `quantity` consequential call | `proposition.test.ts -t C2` | C2(g), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1h | `schemas/proposition.ts` block `optional` consequential call | `proposition.test.ts -t C2` | C2(h), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1i | `schemas/proposition.ts` commercial note `amount` consequential call | `proposition.test.ts -t C2` | C2(i), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1j | `schemas/proposition.ts` commercial note `currency` consequential call | `proposition.test.ts -t C2` | C2(j), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1k | `schemas/proposition.ts` commercial note `taxBasis` consequential call | `proposition.test.ts -t C2` | C2(k), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1l | `schemas/proposition.ts` `deadline.statedValue` consequential call | `proposition.test.ts -t C2` | C2(l), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1m | `schemas/proposition.ts` `term.statedValue` consequential call | `proposition.test.ts -t C2` | C2(m), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1n | `schemas/proposition.ts` `scope_commitment.statedValue` consequential call | `proposition.test.ts -t C2` | C2(n), expected false but got true; 1 failed / 14 passed. |
| MUT-05-1o | `schemas/proposition.ts` `emptyDraftConfirmation` consequential call | `proposition.test.ts -t C2` | C2(o), expected false but got true; 1 failed / 14 passed. |
| MUT-05-2 | `schemas/proposition.ts` `emptyDraftConfirmation` call site | `proposition.test.ts -t C3` | C3(d), expected false but got true; 1 failed / 8 passed. |
| MUT-05-3 | `schemas/proposition.ts` block `title` catalog-verbatim call | `proposition.test.ts -t C3` | C3(f), expected false but got true; 1 failed / 8 passed. |
| MUT-05-4 | `schemas/proposition.ts` `blockSchema` definition (`strictObject` → `object`) | `proposition.test.ts -t C5` | C5(a) and coupled C5(c) became permissive; 2 failed / 5 passed. |
| MUT-05-5 | `schemas/proposition.ts` commercial note `taxBasis` definition (`default`) | `proposition.test.ts -t C5` | C5(e), missing taxBasis expected false but got true; 1 failed / 6 passed. |
| MUT-05-6 | `server/domain/provenance-projection.ts` alternative traversal call site | `provenance-projection.test.ts -t C8` | C8(a) cardinality 25 vs expected 26 and C8(b) cardinality 85 vs expected 96. |
| MUT-05-7 | `server/domain/provenance-projection.ts` final sort call site | `provenance-projection.test.ts -t C8` | C8(a) sequence mismatch and C8(b) sequence mismatch; 2 failed / 2 passed. |

Arithmetic: C1 0 + C2 15 + C3 2 + C4 0 + C5 2 + C6 0 + C7 0 + C8 2 = 21; executed 21 /
declared 21.

## Correction-specific probes

These three probes are additional guard-failure evidence, not additions to the named mutation
count. Each was applied and reverted.

| Probe | Site and hypothesis | Command | Observed red |
|---|---|---|---|
| CP1 | `schemas/proposition.ts` commercial note text cap removed; C6(d) must fail on its own cap assertion. | `proposition.test.ts -t C6` | C6(d) failed: expected false but got true; 1 failed / 7 passed. |
| CP2 | `server/domain/provenance-projection.ts` final sort removed; ordered projection must fail. | `provenance-projection.test.ts -t C8` | C8(a) and C8(b) failed on full sequence; 2 failed / 2 passed. |
| CP3 | `schemas/shared.ts` sourced-union construction collapsed to nested known-or-absent shape; C1(b) sourced-known arm must fail. | `shared.test.ts -t C1` | C1(b) failed with Zod invalid object shape; 1 failed / 4 passed. |

Probe-only files touched and reverted, separately from fix files: `schemas/proposition.ts`,
`server/domain/provenance-projection.ts`, and `schemas/shared.ts`. No temporary probe file was
created. SHA-256 after restoration for those files: `shared.ts`
`bf32ecb0c4533d94099dd633c79023d020b57653ca926725ebddd8ee6c98c686`, `proposition.ts`
`6b17c59b1aa84e6121fcebcee568f5c8bfd2f82422810a82ce5bf7fe09052506`, and
`provenance-projection.ts`
`ad89ee732618bb9624b549b605758de127a71044e13d4bb7312e4eb476571e0e`.

## Evidence and tree identity

- Pre-edit baseline: 3 phase files / 61 tests passed, 0 failed at `a6bc6ac`; the fix cycle had
  no red baseline because the phase was already green and the findings concerned weak
  instrumentation and cleanup.
- Targeted post-fix run: 3 files / 61 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `git diff --check`: passed.
- One closing L4 stamp only: `npm test` → 15 files / 224 tests passed, failure-ID delta ∅→∅.
- Closing stamp tree identity: checkpoint `HEAD a6bc6ac4f4dd9f404e98f779a55faad0cf2fb09f`,
  clean `tsconfig.tsbuildinfo`, and dirty diff digest
  `40258d34f25fafafea2b17b0d15f0987b9e312a0bff7ce3d39bd915264c661d7` before coordination
  artifacts were appended. The coordination-only append changed the final working-tree digest;
  no executable source changed after the stamp.
- `tsconfig.tsbuildinfo` was restored byte-identically after typecheck. No architecture graph is
  present.

## Full write perimeter

Fix's own source/test/fixture changes:

- `src/features/proposal-preparation/schemas/shared.ts`
- `src/features/proposal-preparation/schemas/shared.test.ts`
- `src/features/proposal-preparation/schemas/proposition.test.ts`
- `src/features/proposal-preparation/server/domain/provenance-projection.test.ts`
- `src/features/proposal-preparation/fixtures/propositions.ts`

Normal coordination artifacts written:

- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` — tracker row 5 only
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-05-proposition-and-provenance.md` — one append-only Review-log entry
- this handoff

Probe-only files are listed separately above and were byte-restored. No frontend files,
`tsconfig.tsbuildinfo`, prior prompts/handoffs, intention, future-phase plans, integration files,
database state, or archgraph state changed.

## Documentation impact review

After verification, checked the root README, feature documentation, integration documentation,
architecture links, and plan-vs-current-state boundaries. The fix changes internal schema/test
instrumentation and fixture scaffolding only; no authoritative current-state document became
false, incomplete, or misleading. No README change was made.

## Deviations and coordinator notes

- Two initial mutation-batch runs selected zero tests because the literal parentheses in the
  parameterized test names were over-escaped. They were not counted as evidence; all affected
  mutations were rerun with criterion-family selectors and red results recorded above.
- One intermediate probe reversal patch had a typo and was immediately corrected; final SHA-256
  restoration and the targeted suite confirm no probe residue.
- N1 remains outside this phase as directed; no `positiveInt64StringSchema`, mapper, approval, or
  execution logic changed. N6 remains deferred to phase 7 C7(d).
