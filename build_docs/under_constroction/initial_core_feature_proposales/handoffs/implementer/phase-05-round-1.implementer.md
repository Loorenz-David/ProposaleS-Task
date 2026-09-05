---
plan: 5
role: implement
round: 1
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 5 implementation handoff

Implemented the proposition schema, structural provenance policy, reusable proposition
fixtures, and display-only provenance projection. The implementation is confined to the eight
new phase files under `src/features/proposal-preparation/`; no frontend, integration, UI, agent
runtime, workflow state, persistence, or pricing-write code changed.

## ⚠ OWNER DECISIONS REQUIRED (0)

None. The phase plan and ratified intention determine the implementation.

## Full write perimeter

Intended implementation files:

- `src/features/proposal-preparation/schemas/shared.ts`
- `src/features/proposal-preparation/schemas/shared.test.ts`
- `src/features/proposal-preparation/schemas/content-candidate.ts`
- `src/features/proposal-preparation/schemas/proposition.ts`
- `src/features/proposal-preparation/schemas/proposition.test.ts`
- `src/features/proposal-preparation/server/domain/provenance-projection.ts`
- `src/features/proposal-preparation/server/domain/provenance-projection.test.ts`
- `src/features/proposal-preparation/fixtures/propositions.ts`

Coordination/documentation files:

- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` — tracker row 5 only
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-05-proposition-and-provenance.md` — append-only Review log
- this handoff file

`tsconfig.tsbuildinfo` was rewritten by the required typecheck and restored to its pre-session
bytes; it is not part of the phase perimeter. No architecture graph exists. No frontend files,
temporary frontend VM shapes, or unrelated user changes were touched.

## Architecture-context resolution

Applied contracts: `02-runtime-boundaries.md`, `03-feature-architecture.md`,
`04-server-architecture.md`, `06-data-contracts-and-validation.md`, `07-integrations.md`,
`08-agent-architecture.md`, `09-database-and-persistence.md` (confirms no persistence),
`10-security-and-trust-boundaries.md`, `11-testing-principles.md`, `12-anti-patterns.md`,
`13-decision-checklist.md`, and `14-documentation-principles.md`. No additional contract was
needed. Schemas remain runtime-neutral; only the provenance projector is `server-only`.

## Coverage map — all 61 criterion rows

Each row maps to the exact test assertion that discharges it. “Exact” means the assertion checks
the shape or outcome named by the plan, not merely a weaker neighboring behavior.

| Row | Test and assertion | Strength |
|---|---|---|
| C1(a) | `shared.test.ts` C1(a): sourced presentational leaf parses with value/source/ref | Exact |
| C1(b) | `shared.test.ts` C1(b): missing `q` fails at `q`; explicit `{ known:false }` parses | Exact |
| C1(c) | `shared.test.ts` C1(c): content source without ref fails at `ref` | Exact |
| C1(d) | `shared.test.ts` C1(d): quote at cap+1 fails | Exact |
| C1(e) | `shared.test.ts` C1(e): valid UUID-v4 turn ref parses; uppercase turn id and missing quote fail at named paths | Exact |
| C2(a) | `proposition.test.ts` C2(a): inferred firstName fails at `recipient.value.firstName.source` | Exact |
| C2(b) | `proposition.test.ts` C2(b): inferred lastName fails at `recipient.value.lastName.source` | Exact |
| C2(c) | `proposition.test.ts` C2(c): inferred email fails at `recipient.value.email.source` | Exact |
| C2(d) | `proposition.test.ts` C2(d): inferred phone fails at `recipient.value.phone.source` | Exact |
| C2(e) | `proposition.test.ts` C2(e): inferred companyName fails at `recipient.value.companyName.source` | Exact |
| C2(f) | `proposition.test.ts` C2(f): inferred contentId fails at `blocks.0.contentId.source` | Exact |
| C2(g) | `proposition.test.ts` C2(g): inferred quantity fails at `blocks.0.quantity.source` | Exact |
| C2(h) | `proposition.test.ts` C2(h): inferred optional fails at `blocks.0.optional.source` | Exact |
| C2(i) | `proposition.test.ts` C2(i): inferred note amount fails at `commercialNotes.0.amount.source` | Exact |
| C2(j) | `proposition.test.ts` C2(j): inferred note currency fails at `commercialNotes.0.currency.source` | Exact |
| C2(k) | `proposition.test.ts` C2(k): inferred tax basis fails at `commercialNotes.0.taxBasis.source` | Exact |
| C2(l) | `proposition.test.ts` C2(l): inferred deadline fails at `commercialAssumptions.0.statedValue.source` | Exact |
| C2(m) | `proposition.test.ts` C2(m): inferred term fails at `commercialAssumptions.1.statedValue.source` | Exact |
| C2(n) | `proposition.test.ts` C2(n): inferred scope commitment fails at `commercialAssumptions.2.statedValue.source` | Exact |
| C2(o) | `proposition.test.ts` C2(o): inferred empty-draft confirmation fails at `emptyDraftConfirmation.source` | Exact |
| C3(a) | `proposition.test.ts` C3(a): brief source on contentId fails | Exact |
| C3(b) | `proposition.test.ts` C3(b): content source on quantity fails | Exact |
| C3(c) | `proposition.test.ts` C3(c): content source on optional fails | Exact |
| C3(d) | `proposition.test.ts` C3(d): brief source on empty-draft confirmation fails | Exact |
| C3(e) | `proposition.test.ts` C3(e): human empty-draft confirmation parses | Exact |
| C3(f) | `proposition.test.ts` C3(f): human catalog title fails | Exact |
| C3(g) | `proposition.test.ts` C3(g): content source on note amount fails | Exact |
| C3(h) | `proposition.test.ts` C3(h): inferred `other` assumption parses | Exact |
| C3(i) | `proposition.test.ts` C3(i): max positive int64 parses; zero, leading zero, and overflow fail | Exact |
| C4(a) | `proposition.test.ts` C4(a): inferred language parses | Exact |
| C4(b) | `proposition.test.ts` C4(b): inferred title parses | Exact |
| C4(c) | `proposition.test.ts` C4(c): inferred narrative parses | Exact |
| C4(d) | `proposition.test.ts` C4(d): inferred reviewer comment parses | Exact |
| C4(e) | `proposition.test.ts` C4(e): inferred alternative reason parses | Exact |
| C4(f) | `proposition.test.ts` C4(f): inferred agent rationale parses | Exact |
| C4(g) | `proposition.test.ts` C4(g): inferred assumption note parses | Exact |
| C5(a) | `proposition.test.ts` C5(a): extra block price key fails strict block parse | Exact |
| C5(b) | `proposition.test.ts` C5(b): proposal total fails strict proposition parse | Exact |
| C5(c) | `proposition.test.ts` C5(c): block currency fails strict block parse | Exact |
| C5(d) | `proposition.test.ts` C5(d): integer money parses, decimal money fails, explicit amount absence parses | Exact |
| C5(e) | `proposition.test.ts` C5(e): explicit tax basis parses and missing key fails | Exact |
| C5(f) | `proposition.test.ts` C5(f): uppercase currency parses, lowercase fails, explicit absence parses | Exact |
| C5(g) | `proposition.test.ts` C5(g): library literal parses; custom and missing pricing fail | Exact |
| C6(a) | `proposition.test.ts` C6(a): title cap+1 fails; trim behavior is asserted | Exact |
| C6(b) | `proposition.test.ts` C6(b): narrative cap+1 fails; trim behavior is asserted | Exact |
| C6(c) | `proposition.test.ts` C6(c): reviewer-comment cap+1 fails; trim behavior is asserted | Exact |
| C6(d) | `proposition.test.ts` C6(d): commercial-note text cap+1 fails; trim behavior is asserted | Exact |
| C6(e) | `proposition.test.ts` C6(e): rationale cap+1 fails; trim behavior is asserted | Exact |
| C6(f) | `proposition.test.ts` C6(f): warning text cap+1 fails; trim behavior is asserted | Exact |
| C6(g) | `proposition.test.ts` C6(g): assumption note cap+1 fails; trim behavior is asserted | Exact |
| C6(h) | `proposition.test.ts` C6(h): alternative reason cap+1 fails; trim behavior is asserted | Exact |
| C7(a) | `shared.test.ts` C7(a): zero quantity fails | Exact |
| C7(b) | `shared.test.ts` C7(b): negative quantity fails | Exact |
| C7(c) | `shared.test.ts` C7(c): NaN fails | Exact |
| C7(d) | `shared.test.ts` C7(d): Infinity fails | Exact |
| C7(e) | `shared.test.ts` C7(e): one parses | Exact |
| C7(f) | `shared.test.ts` C7(f): fractional positive quantity parses | Exact |
| C8(a) | `provenance-projection.test.ts` C8(a): exact projected path set and decimal index form | Exact |
| C8(b) | `provenance-projection.test.ts` C8(b): block index 2 precedes block index 10 | Exact |
| C8(c) | `provenance-projection.test.ts` C8(c): absent quantity has no projection entry | Exact |
| C8(d) | `provenance-projection.test.ts` C8(d): strict proposition rejects an input provenance key | Exact |

Reverse trace: the only phase test cases are the 61 rows above; no orphan phase test was added.
`content-candidate.ts` is intentionally untested here per the plan Notes and phase 7 C7(d).

## Baseline and final evidence

- Gate: intention `RATIFIED`; tracker rows 1–4 `APPROVED`; row 5 `PROMPT_READY` before this session; 8 criteria / 61 rows / 21 mutations; all five required shared value files present.
- Pre-edit baseline: after tests were authored and before production edits, `npx vitest run --project node src/features/proposal-preparation/schemas/shared.test.ts src/features/proposal-preparation/schemas/proposition.test.ts src/features/proposal-preparation/server/domain/provenance-projection.test.ts` → 3 files / 61 tests failed, all due to absent production modules.
- Targeted implementation check: same command after implementation → 3 files / 61 tests passed.
- Required checks: `npm run typecheck` passed; `npm run lint` passed; `git diff --check` passed.
- Closing L4 stamp (exactly one): `npm test` → 15 files / 224 tests passed at `HEAD ba1aeea` before checkpoint; the tree contained only the declared phase files plus the generated cache, which was then restored.

## Mutation ledger — 21 of 21 executed

All mutation commands were L1 targeted Vitest runs. Every mutation was applied at the named
definition/call site, the target red was observed, and the file was reverted immediately. The
two initially mis-sited assumption probes are recorded rather than silently discarded.

| Mutation | Site | Target command | Observed red |
|---|---|---|---|
| MUT-05-1a | `proposition.ts` recipientLeavesSchema.firstName construction | `npx vitest run --project node src/features/proposal-preparation/schemas/proposition.test.ts -t 'C2\(a\)'` | C2(a), `expect(result.success).toBe(false)` observed `true` |
| MUT-05-1b | `proposition.ts` recipientLeavesSchema.lastName construction | same with `C2\(b\)` | C2(b), rejection assertion observed `true` |
| MUT-05-1c | `proposition.ts` recipientLeavesSchema.email construction | same with `C2\(c\)` | C2(c), rejection assertion observed `true` |
| MUT-05-1d | `proposition.ts` recipientLeavesSchema.phone construction | same with `C2\(d\)` | C2(d), rejection assertion observed `true` |
| MUT-05-1e | `proposition.ts` recipientLeavesSchema.companyName construction | same with `C2\(e\)` | C2(e), rejection assertion observed `true` |
| MUT-05-1f | `proposition.ts` blockSchema.contentId construction | same with `C2\(f\)` | C2(f), rejection assertion observed `true` |
| MUT-05-1g | `proposition.ts` blockSchema.quantity construction | same with `C2\(g\)` | C2(g), rejection assertion observed `true` |
| MUT-05-1h | `proposition.ts` blockSchema.optional construction | same with `C2\(h\)` | C2(h), rejection assertion observed `true` |
| MUT-05-1i | `proposition.ts` commercialNoteSchema.amount construction | same with `C2\(i\)` | C2(i), rejection assertion observed `true` |
| MUT-05-1j | `proposition.ts` commercialNoteSchema.currency construction | same with `C2\(j\)` | C2(j), rejection assertion observed `true` |
| MUT-05-1k | `proposition.ts` commercialNoteSchema.taxBasis construction | same with `C2\(k\)` | C2(k), rejection assertion observed `true` |
| MUT-05-1l | `proposition.ts` commercialAssumptionSchema deadline member construction | same with `C2\(l\)` | C2(l), rejection assertion observed `true` |
| MUT-05-1m | `proposition.ts` commercialAssumptionSchema term member construction | same with `C2\(m\)` | Initially mis-sited at deadline and stayed green; re-sited at term and C2(m) rejection assertion observed `true` |
| MUT-05-1n | `proposition.ts` commercialAssumptionSchema scope_commitment member construction | same with `C2\(n\)` | Initially mis-sited at deadline and stayed green; re-sited at scope_commitment and C2(n) rejection assertion observed `true` |
| MUT-05-1o | `proposition.ts` propositionSchema.emptyDraftConfirmation construction | same with `C2\(o\)` | C2(o), rejection assertion observed `true` |
| MUT-05-2 | `proposition.ts` emptyDraftConfirmation source policy | `npx vitest run --project node src/features/proposal-preparation/schemas/proposition.test.ts -t 'C3\(d\)'` | C3(d), non-human confirmation rejection assertion observed `true` |
| MUT-05-3 | `shared.ts` catalogVerbatimSchema source-policy builder | same with `C3\(f\)` | C3(f), human catalog-title rejection assertion observed `true` |
| MUT-05-4 | `proposition.ts` blockSchema strictObject construction | `npx vitest run --project node src/features/proposal-preparation/schemas/proposition.test.ts -t 'C5\(a\)'` | C5(a), extra block price key rejection assertion observed `true` |
| MUT-05-5 | `proposition.ts` commercialNoteSchema.taxBasis field | same with `C5\(e\)` | C5(e), missing tax-basis rejection assertion observed `true` |
| MUT-05-6 | `provenance-projection.ts` alternative traversal | `npx vitest run --project node src/features/proposal-preparation/server/domain/provenance-projection.test.ts -t 'C8\(a\)'` | C8(a), exact path-set assertion observed missing alternative reason |
| MUT-05-7 | `provenance-projection.ts` path comparator | same with `C8\(b\)` | C8(b), numeric ordering assertion observed false |

Mutation probe files, listed separately from the intended implementation perimeter:

- `src/features/proposal-preparation/schemas/proposition.ts` — applied/reverted MUT-05-1a…1o, 2, 4, 5
- `src/features/proposal-preparation/schemas/shared.ts` — applied/reverted MUT-05-3
- `src/features/proposal-preparation/server/domain/provenance-projection.ts` — applied/reverted MUT-05-6, 7

No temporary probe file was created. Post-probe targeted tests were 3 files / 61 passed, and all
probe files were restored before the closing checks.

## Checkpoint

Checkpoint subject: `CHECKPOINT (not approved): phase 05 proposition and provenance`

Checkpoint SHA: `32435e5` (`CHECKPOINT (not approved): phase 05 proposition and provenance`).

## Documentation impact

No feature README or integration README became false or incomplete: this phase adds schemas and
pure domain projection only, and the durable feature behavior is already owned by the intention
and phase plan. The plan Review log and master tracker were updated as required.

## Coordinator fold notes

- The `contentCandidateSchema` contract is intentionally carried without direct phase-5 behavior tests; phase 7 C7(d) owns the first behavioral proof.
- The two initially mis-sited assumption mutations were false-green measurements, not retained evidence; only the correctly sited term and scope-member runs discharge MUT-05-1m/n.
- No owner decision or upstream amendment is required.
