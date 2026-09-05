---
plan: 4
role: review
round: 1
verdict: CHANGES_REQUESTED
date: 2026-09-05
actor: Claude (Opus 5)
---

# Phase 4 independent review handoff — round 1

Full first-review checklist against the phase-4 plan, the intention and its measurement
ledger, the evidence doc, the vendored OpenAPI snapshot, and the routed architecture
contracts. Verdict: **`CHANGES_REQUESTED`** — 3 blocking, 8 should-fix, 4 notes.

The implementation is structurally sound and contract-faithful in its shape: the adapter
stays in `src/lib/proposales/`, omission is done by spreads, no arithmetic reaches the
pricing mapper, and the recovery request is exactly the one the plan specifies. What
fails is **guard strength**: five criterion rows are discharged by tests that cannot
redden on the defect they name, one row is discharged nowhere while the coverage map
claims it, and one wire key was implemented from the plan's prose instead of the vendor
contract — with a fixture built to match the code, so the test agrees with the bug.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner. Every finding has a determined correction from an existing
authority; the two routing choices (how to fix S7, and folding B1/B3's plan sentences
back) are coordinator work.

## Owner layer

See the reviewer session's final message; not duplicated here.

## Gate check

| Check | Result |
|---|---|
| Intention status | `RATIFIED` (2026-09-05, §23 round 12) |
| Tracker rows 1–3 | `APPROVED` |
| Tracker row 4 at entry | `REVIEWING` |
| Plan declares 8 criteria / 75 rows / 33 named mutations | Declared at plan line 118; **re-derived independently from the acceptance table: 9+9+9+4+6+9+6+23 = 75 rows, C1–C8 = 8 criteria, MUT-04-1…33 = 33 mutations.** Correct. |
| Implementation handoff at `handoffs/implementer/phase-04-round-1.implementer.md` | present |
| Phase-4 adapter code / tests / fixtures named in the plan | all 17 paths exist |
| `git status --porcelain` at entry | `?? build_docs/…/handoffs/reviewer/phase-04-projection-round-0.reviewer.md` only |

The untracked projection handoff was preserved untouched. No frontend worktree boundary
was crossed; `src/features/**`, `src/app/**`, `src/components/**` and `src/styles/**` were
neither read as authority nor modified.

## Observed perimeter

| Commit | Files | Verdict |
|---|---|---|
| `a5771d6` (checkpoint) | 20 — the 17 declared implementation paths + master-plan tracker row 4 + this plan's Review log + the implementer handoff | matches the handoff's declaration exactly; nothing outside it |
| `a8f6237` | implementer handoff only (checkpoint-SHA provenance) | declared in the handoff; docs-only |
| `057b460` | master-plan tracker row 4 + the reviewer prompt | coordinator dispatch, outside the implementation cycle |

No changed file falls outside the handoff's declared 17 implementation paths plus the
normal tracker/plan/handoff artifacts.

## Findings

### Blocking

**B1 — read-back `tax_options` is mapped from a key the vendor does not send.**
`schemas.ts:90` declares `tax_mode`; `mappers.ts:109` reads `wire.tax_options.tax_mode`.
The vendor `TaxOptions` component is `{ mode, tax_included, tax_label_key }` with
`additionalProperties: false`, and evidence §8.1's recorded control read-back is
`tax_options: { mode: "standard", tax_included: false }` (evidence §4 states the same
shape for create). `AppliedPricing.taxOptions.mode` is therefore permanently absent in
production. `fixtures/proposal-readback.consistent.json` was hand-written with
`tax_mode`, so C7(f) passes against a fixture that contradicts the recorded response and
can never fail on this defect.
*Authority:* `07-integrations.md` §3 (schemas, mappers and fixtures are derived from the
vendored snapshot), §10.3; `11-testing-principles.md` §3 (external response schemas are
tested against a recorded real response); evidence §4, §8.1.
*Correction:* use `mode` in `taxOptionsSchema` and `toProposalReadback`; rebuild the
fixture from evidence §8.1.
*Plan fold-back:* task 3 and row C7(f) both say `tax_mode` and are the origin of the
error — amend the plan, not only the code.

**B2 — the live outbound-parse guard has no call-site test.**
Reviewer probe RP1: replacing `client.ts:69` with
`const request = toCreateProposalRequest(input, { companyId, now });` — i.e. deleting the
`parseCreateProposalRequest` call — leaves all 67 phase tests and the full 161-test suite
green. C3(i)'s second clause ("the HTTP post is not reached when the client calls the
parser") is unasserted; `client.test.ts:31` exercises only the exported helper, which is
exactly what MUT-04-10's *definition*-side mutation reddens.
*Authority:* charter rule 11 (a named mutation names definition **vs** call site, because
the function-side mutation can bite while the call-site one sails through) and rule 15
(a guard ships with proof that it can fail). Plan task 5 and the projection fold made
parsing live on the production POST path specifically to close this.
*Secondary:* the C3(i) fixture is invalid for two independent reasons (unrecognized
`data.forbidden` **and** three missing required metadata keys) — charter rule 2's
companion; the row cannot isolate its own predicate.
*Correction:* a row that drives `createProposalDraft` with a mapped-but-invalid request
and asserts the injected `fetch` was never called, plus a call-site named mutation.

**B3 — the price-unrepresentability enumeration never injects at the block location, and
proposal `currency` is not tested at all.**
`mappers.test.ts:94-110` injects the four `unit_value_*` keys and `tax_options` at the
**proposal root** and injects `currency` only **on a block**. Verified consequences:
- RP4 — declaring all four `unit_value_*` on `createProposalBlockSchema`: 93/93 green.
- RP3 — declaring `currency` on `createProposalRequestSchema`: 93/93 green.

Per `openapi.json` `ProposalBlockInput`, the four unit values, `package_split` and block
`currency` exist **only** on the block — the location intention §17A.5 (line 646) and
criterion 16 name — so rows C2(a–d) as executed prove nothing about the surface they
guard. C2(g) (proposal `currency`) has no test at all, yet the implementer's coverage map
claims it is discharged by `mappers.test.ts › C2(a-i)`.
*Authority:* intention §17A.5 / criterion 16, M9; charter rule 2 (enumerate, never
sample) and rule 15.
*Correction:* one injection per declared location — four unit values + `package_split` +
`currency` on a block, `currency` + `tax_options` at the proposal root — and a
block-schema named mutation covering the unit values (MUT-04-3 currently proves only
block `currency`).

### Should-fix

**S1 — the fake's recorded `request` is never compared with the real mapper output.**
C3(h) requires `request` to deep-equal `toCreateProposalRequest(input, ctx)`;
`fake.test.ts:28` asserts `toMatchObject({ op, input })` and never reads `request`.
RP5: recording `{ ...request, company_id: 999, language: "zz" }` in `fake.ts` leaves
93/93 green. The wire equivalence phases 11–14 will lean on is unguarded.

**S2 — a pre-seeded recovered proposal yields no read-back.**
`fake.ts` populates `storedReadbacks` only inside `createProposalDraft`; the `proposals`
option seeds `stored` alone. Master plan §6.6 states "`proposals` seeds recovery
rows/read-backs" and plan task 6 requires the fake's surface to be *exactly* that row.
Phase 14's recovered branch (search hit → `getProposal` → Applied Pricing) therefore
cannot be exercised against the fake: `getProposal` throws
`No fake read-back for <uuid>`.

**S3 — C7(d) is uncovered.** No assertion anywhere reads `taxOptions` on a read-back
without `tax_options`. RP6: returning `{ taxMode: "none" }` for the absent case in
`toProposalReadback` leaves 93/93 green. The `inconsistent` fixture does omit
`tax_options`, but every test on that path asserts something else.

**S4 — C7(c)'s second case is uncovered.** The row enumerates "block `EUR` / block
without currency"; only the equal-currency case exists. RP7: removing
`block.blockCurrency !== undefined &&` from the warning filter leaves 93/93 green, so a
spurious `block_currency_differs` on every currency-less block would ship.

**S5 — C5(c) is uncovered on the client.** `fixtures/proposal-search.json` carries no
case-different row; `fake.test.ts:37`'s uppercase check exercises the fake, not the
client's in-client re-verification. RP8: making the client filter case-insensitive leaves
93/93 green. This is the recovery/idempotency mechanism (M14, §17A.11).

**S6 — both read-back fixtures make the four `unit_value_*` fields indistinguishable.**
Every unit value in `proposal-readback.consistent.json` and `.inconsistent.json` is
`10000`. RP2 (swap two mappings in `applied-pricing.mapper.ts`) and RP2b (swap two in
`toProposalReadback`) each leave the suite green: a snake→camel crossing defect at either
mapping boundary is invisible. C6(a)'s fixture does not make its own predicate the only
reason the outcome holds (charter rule 2's companion).
*Correction:* four distinct values per block.

**S7 — `test/helpers/proposales-arithmetic-scan.test.ts` is collected by no Vitest
project.** `npx vitest list` does not name it; `vitest.config.mts` claims only
`src/lib/**`, `src/features/**`, `test/setup/node.test.ts`, `src/app/**`,
`src/components/**`. This is master plan §10.3's recorded N2 hazard materializing, and
phase 15's candidate criterion ("every test file is claimed by exactly one project") will
fail on it. The handoff itself says the file "adds no new objective" and repeats the
collected C8(b1–b20, c, d) rows, so by charter rule 16 it is orphan surface whose only
passing evidence came from a temporary config that no longer exists.
*Routing decision for the coordinator:* delete the file, or add `test/helpers/**/*.test.ts`
to the node project's include. Either closes it; the plan's task 4 and Files section
should record which.

**S8 — orphan and colliding test IDs.** Three tests this phase added carry IDs belonging
elsewhere:
- `client.test.ts › C3(h) creates once, parses the response, and returns its HTTPS URL` —
  C3(h) is the fake row; the create-response/HTTPS mapping has no criterion. A useful
  test, but an undeclared candidate criterion (charter trace chain, link 3).
- `fake.test.ts › C5(a-d) recovers only stored rows with exact metadata` — plan C5(a–f)
  are client rows, already mapped to `client.test.ts`.
- `fake.test.ts › C6(e) can queue a read failure` — plan C6(e) is the client's
  missing-money row.

Within single files, phase-4 IDs now collide with phase-3 IDs (two `C3(h)`, two `C6(e)`,
`C4(a)`–`C4(d)` twice, `C5(a-…)` twice), which makes `-t` mutation targeting and the
coverage map ambiguous.

### Notes

- **N1** — C1(a)'s "request parses `createProposalRequestSchema`" is asserted on the
  known-quantity request, not the absent one. The absent shape is covered incidentally by
  C1(i) and C3(g).
- **N2** — §17A.11 requires the integration README to state the reserved prefix. The
  README lists the three keys but never states that `proposal_copilot_` is reserved and
  that the application interprets no key it did not write.
- **N3** — C2(i)'s bound is `toCreateProposalRequest.toString()`, which excludes
  `blockField` and `recipientField`; a price key emitted from a helper would not be seen.
  Conforms to the plan's wording; the inferred strict return type is the current backstop.
  Worth widening the plan's bound.
- **N4** — `tsconfig.tsbuildinfo` is tracked and is rewritten by `npm run typecheck`, so
  every evidence run dirties the tree and the asserted-clean `git status --porcelain`
  identity is fragile for every future stamp. Pre-existing, not this phase's. Route to
  phase 15.

## Verified correct

Settled ground, so the re-review can skip it:

- The 17-path perimeter and the 8 / 75 / 33 declaration, both re-derived.
- Runtime placement: `import "server-only"` first in every adapter module; the integration
  stays in `src/lib/proposales/`; no feature root, UI, transport, persistence, price-write
  or phase-14 decision code was added (contracts 02 §3/§5, 03 §1/§3–4, master plan §9.2).
- Omission by spreads in `toCreateProposalRequest` — no `??`, `||`, default parameters or
  `undefined`-valued keys; C1(a–i) hold, and MUT-04-1/2/12's sites were confirmed by
  inspection after revert.
- Metadata: exactly the three binding keys, all string values, the fixed source marker,
  the verbatim generation id, the epoch-0 ISO timestamp, `company_id`/`language`
  (C3(a–g), §17A.11, §17A.16).
- `blockField`'s `Number(contentId)` conversion — commented, and correctly outside the
  pricing mapper (plan Notes).
- The recovery request: path, the exact three-key query set, `PROPOSAL_SEARCH_LIMIT` equal
  to the OpenAPI `limit.maximum` (25) located by `name === "limit"` rather than index, and
  all three forbidden parameters absent (C4(a–d)).
- In-client re-verification: kept row, dropped mismatching row, dropped missing-key row;
  absent status omitted and unrecognised status → `"unknown"` on both search and read-back
  (C5(a,b,d,e,f), C6(h,i)); contract 06 §6's enum rule is honoured, no silent default.
- Read-back money strictness: a missing money field throws `schema_mismatch` and never
  yields `0` (C6(e)); totals reported verbatim on the inconsistent fixture (C6(b));
  fractional `quantity` and `vat` carried verbatim (C6(c,d)); absent
  `optional`/`package_split` preserved as absence, never `false`/`[]` (C6(f,g)).
- Currency handling: every `Money` built from the **proposal** currency, block currency
  never used to construct a `Money`, drift reported by string inequality only, and both
  currencies uppercase-normalised through `currencyCodeSchema` (C7(a,b,e), §17A.12).
- Applied Pricing is arithmetic-free on the production source, and all 20 scanner kinds
  plus both exclusion rows run in the **default** project via
  `applied-pricing.mapper.test.ts` — the mirrored coverage is genuinely collected
  (C8(a–d)). The scanner is imported only by its own test and the pricing test.
- Fixtures carry no real identifiers beyond the two the evidence doc publishes
  (`188558`/`188485`).
- The integration README covers the three operations, the exact metadata keys, the
  recovery request, the read-back and its no-arithmetic rule, the error table and the
  per-operation retry policy (contract 14 §9), subject to N2.
- The implementer's declared divergence on read-back `quantity` (`z.number()` per §17A.12
  over the plan task's shorter "required integers" phrasing) is correct and was correctly
  declared — charter rule 14 satisfied.

## Mutation-probe declaration

Every probe was applied on the working tree, run at L1/L2, and reverted. Files touched:

| Probe | File | Change | Observed |
|---|---|---|---|
| RP1 | `src/lib/proposales/client.ts` | drop the `parseCreateProposalRequest` call in `createProposalDraft` (call site) | 4 files / 67 tests **green** — finding B2 |
| RP2 | `src/lib/proposales/applied-pricing.mapper.ts` | swap `unitValueWithDiscountWithoutTax` / `…WithTax` | 2 files / 53 tests **green** — finding S6 |
| RP2b | `src/lib/proposales/mappers.ts` | swap the same pair in `toProposalReadback` | 6 files / 93 tests **green** — finding S6 |
| RP3 | `src/lib/proposales/schemas.ts` | add `currency: z.string().optional()` to `createProposalRequestSchema` | 6 files / 93 tests **green** — finding B3 |
| RP3-control | `src/lib/proposales/schemas.ts` | same plus `tax_options` at the root | **red** (C2 reddens on `tax_options`) — confirms the C2 test can bite at the proposal root |
| RP4 | `src/lib/proposales/schemas.ts` | add the four `unit_value_*` to `createProposalBlockSchema` | 6 files / 93 tests **green** — finding B3 |
| RP5 | `src/lib/proposales/fake.ts` | record `{ ...request, company_id: 999, language: "zz" }` | 6 files / 93 tests **green** — finding S1 |
| RP6 | `src/lib/proposales/mappers.ts` | absent `tax_options` → `{ taxMode: "none" }` | 6 files / 93 tests **green** — finding S3 |
| RP7 | `src/lib/proposales/applied-pricing.mapper.ts` | drop `blockCurrency !== undefined` from the warning filter | 6 files / 93 tests **green** — finding S4 |
| RP8 | `src/lib/proposales/client.ts` | case-insensitive recovery filter | 6 files / 93 tests **green** — finding S5 |

All five touched files (`client.ts`, `schemas.ts`, `mappers.ts`, `applied-pricing.mapper.ts`,
`fake.ts`) were restored from pre-probe copies and verified byte-identical: `git diff` is
empty and `git status --porcelain` shows only the pre-existing untracked projection
handoff. No database or external state exists; nothing else was mutated.
`tsconfig.tsbuildinfo` is regenerated by `npm run typecheck` / `npm test` and was restored
with `git checkout` after each run — a tool artifact, not a probe (see N4).

## Evidence and tree identity

- Tree reviewed: `057b4605623b40141ede7e0c1271f79c9c7b95cc`, `git status --porcelain`
  clean apart from the pre-existing untracked projection handoff.
- **L4 budget: exactly one, spent.** `npm test` → **12 test files passed, 161 tests
  passed** (1.07 s), taken on the tree handed over. The stamp was required rather than
  cited: the implementer's stamp was taken at dirty-tree pre-checkpoint state
  (`c82a5d5` + working tree), and the review tree differs from it by the checkpoint plus
  two docs commits, so no recorded stamp carried this tree's identity — which is exactly
  the gap the prompt's closing-L4 probe named.
- L1/L2 variation for the probes above: `npx vitest run src/lib/proposales` and per-file
  runs, ten distinct mutant shapes at nine distinct sites.
- `npm run typecheck` → green. `npm run lint` → green. `git diff --check` → green.
- `npx vitest list` → 128 lines; `test/helpers/**` absent (evidence for S7).
- Absence claims made at L4 by construction: none needed — every "no test bites" claim
  above was measured with the full 161-test suite or the six-file adapter tree that
  contains every test naming these symbols.

## Lessons for the plans

1. **A criterion row that names two locations needs two injections.** C2's fixture column
   said "a valid request object plus one of …" and annotated only `package_split` with
   "(on a block)". One implementer reading put five of eight keys at the proposal root.
   Rows should name the location per key (block vs proposal), not per parenthetical.
2. **A row whose second clause is about a call site needs its own mutation.** C3(i)
   bundled "the parser rejects" and "the POST is not reached" into one row with one
   definition-side mutation. Charter rule 11 already says a mutation names
   definition-vs-call-site; the planner should split such rows so the ledger cannot be
   satisfied by the weaker half.
3. **Wire key names in plan prose are a hazard.** Plan task 3 spelled the vendor key
   `tax_mode`; the implementer, the schema, the mapper and the fixture all followed the
   plan rather than the snapshot, and the test agreed with the bug. Plans should cite the
   OpenAPI component (`TaxOptions`) and let the implementer read the names, or the plan
   lint should resolve every wire name it prints against `openapi.json`.
4. **Fixture values must be mutually distinguishable when a row asserts a field-by-field
   mapping.** Four fields all set to `10000` make a permutation untestable. A plan row
   that says "each of the four … equals the fixture integers" should require distinct
   values, and the coordinator's plan lint can check it.
5. **A test file's collection is part of its definition.** The plan named
   `test/helpers/proposales-arithmetic-scan.test.ts` without checking `vitest.config.mts`;
   master plan §10.3 already warns about exactly this and requires an `npx vitest list`
   confirmation. That confirmation belongs in the plan's Files section, or the helper
   location belongs inside a claimed glob.
6. **Criterion IDs are file-scoped in practice, not phase-scoped.** Phase 4's C4/C5/C6
   rows landed in files already carrying phase-3 C4/C5/C6 tests. Test titles should carry
   the phase (`P4-C6(e)`), or the plan should assign fresh letters per file.

## Carry-forward dispositions

Not applicable — the verdict is `CHANGES_REQUESTED`, so every finding returns to the
implementer in this phase. N4 (`tsconfig.tsbuildinfo` tracked) is the only item routed
onward: **phase 15**, closeout hygiene.

## Next

Coordinator compiles a fix prompt for round 2 covering B1–B3 and S1–S8, with the plan
amendments for B1 (task 3, C7(f)), B3 (C2 fixture column), S6 (fixture distinctness) and
S7 (helper-test location) folded into the plan *before* the fix session starts, so the
implementer is not asked to satisfy a row that is itself wrong.
