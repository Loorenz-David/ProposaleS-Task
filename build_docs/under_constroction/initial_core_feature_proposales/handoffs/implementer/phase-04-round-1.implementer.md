---
plan: 4
role: implement
state: IMPLEMENTED
date: 2026-09-05
actor: Codex
---

# Phase 4 implementation handoff — round 1

Implemented the Proposales proposal adapter phase: strict create requests with closed
metadata and no price representation, recovery search and exact row verification,
read-back validation/mapping, arithmetic-free Applied Pricing, the complete fake, scrubbed
fixtures, scanner helper, and integration README updates.

## ⚠ OWNER DECISIONS REQUIRED (0)

None. The projection cards were already resolved by the coordinator; no new decision was
needed.

## Gate and baseline

- Intention: `RATIFIED`.
- Master tracker rows 1–3: `APPROVED`.
- Master tracker row 4 at entry: `PROMPT_READY`; at close: `IMPLEMENTED`.
- Phase manifest: 8 criteria, 75 rows, 33 named mutations.
- Phase-3 adapter files existed; frontend files and `tsconfig.tsbuildinfo` were excluded.
- Entry `git status --porcelain` contained only the pre-existing untracked projection
  handoff.
- Pre-edit targeted baseline, after phase tests were authored and before production edits:
  `npx vitest run src/lib/proposales/mappers.test.ts src/lib/proposales/client.test.ts
  src/lib/proposales/fake.test.ts src/lib/proposales/applied-pricing.mapper.test.ts
  test/helpers/proposales-arithmetic-scan.test.ts` → 4 files, 14 failing tests, 24
  passing tests. The default project did not collect `test/helpers/**`; the helper file
  therefore did not appear in that baseline.

## Coverage map — every criterion row

`shape` means the assertion checks the exact row contract, not merely a weaker outcome.
Grouped tests are named by their actual collected test title; the 20 scanner rows are
also present in the dedicated helper test, which is run with a temporary helper-only L1
configuration because the repository's default Vitest include does not claim `test/helpers`.

| Row | Test id | Shape |
|---|---|---|
| C1(a) | `mappers.test.ts › C1(a-d)` | exact quantity key absence |
| C1(b) | `mappers.test.ts › C1(a-d)` | exact known quantity |
| C1(c) | `mappers.test.ts › C1(a-d)` | exact optional absence through parsed request |
| C1(d) | `mappers.test.ts › C1(a-d)` | exact known optional |
| C1(e) | `mappers.test.ts › C1(e-h)` | recipient key absent |
| C1(f) | `mappers.test.ts › C1(e-h)` | recipient deep equality |
| C1(g) | `mappers.test.ts › C1(e-h)` | empty recipient key absent |
| C1(h) | `mappers.test.ts › C1(e-h)` | title/description keys absent |
| C1(i) | `mappers.test.ts › C1(i)` | recursive `Object.entries` walk rejects undefined |
| C2(a) | `mappers.test.ts › C2(a-i)` | exact unrecognized key `unit_value_with_discount_without_tax` |
| C2(b) | `mappers.test.ts › C2(a-i)` | exact unrecognized key `unit_value_with_discount_with_tax` |
| C2(c) | `mappers.test.ts › C2(a-i)` | exact unrecognized key `unit_value_without_discount_without_tax` |
| C2(d) | `mappers.test.ts › C2(a-i)` | exact unrecognized key `unit_value_without_discount_with_tax` |
| C2(e) | `mappers.test.ts › C2(a-i)` | exact unrecognized key `package_split` |
| C2(f) | `mappers.test.ts › C2(a-i)` | exact unrecognized key block `currency` |
| C2(g) | `mappers.test.ts › C2(a-i)` | exact unrecognized key proposal `currency` |
| C2(h) | `mappers.test.ts › C2(a-i)` | exact unrecognized key `tax_options` |
| C2(i) | `mappers.test.ts › C2(a-i)` | outbound function source contains none of seven keys |
| C3(a) | `mappers.test.ts › C3(a-g)` | metadata key set exact and length 3 |
| C3(b) | `mappers.test.ts › C3(a-g)` | every metadata value is string |
| C3(c) | `mappers.test.ts › C3(a-g)` | fixed source marker exact |
| C3(d) | `mappers.test.ts › C3(a-g)` | generation id verbatim |
| C3(e) | `mappers.test.ts › C3(a-g)` | epoch-0 ISO timestamp exact |
| C3(f) | `mappers.test.ts › C3(a-g)` | company and language exact |
| C3(g) | `mappers.test.ts › C3(a-g)` | block wire object exact |
| C3(h) | `fake.test.ts › C3(h)` | fake call records exact op/input/request, increments writes, stores readback, write guard throws |
| C3(i) | `client.test.ts › C3(i)` | invalid outbound request throws `ValidationError` before POST path |
| C4(a) | `client.test.ts › C4(a-d)` | exact search path |
| C4(b) | `client.test.ts › C4(a-d)` | exact query key set |
| C4(c) | `client.test.ts › C4(a-d)` | OpenAPI locator uses `name === "limit"`; maximum equals query |
| C4(d) | `client.test.ts › C4(a-d)` | forbidden query keys absent |
| C5(a) | `client.test.ts › C5(a-f)` | verified row included |
| C5(b) | `client.test.ts › C5(a-f)` | mismatching row excluded |
| C5(c) | `client.test.ts › C5(a-f)` | case-different id excluded by exact equality |
| C5(d) | `client.test.ts › C5(a-f)` | missing metadata excluded |
| C5(e) | `client.test.ts › C5(a-f)` | null status omitted |
| C5(f) | `client.test.ts › C5(a-f)` | unknown non-null status maps to `unknown` |
| C6(a) | `applied-pricing.mapper.test.ts › C6(a)` | all totals/unit values equal fixture integers |
| C6(b) | `applied-pricing.mapper.test.ts › C6(b)` | both inconsistent totals reported verbatim |
| C6(c) | `applied-pricing.mapper.test.ts › C6(c-d)` | fractional quantity carried exactly |
| C6(d) | `applied-pricing.mapper.test.ts › C6(c-d)` | VAT carried exactly |
| C6(e) | `client.test.ts › C6(e)` | missing money field rejects schema; no zero default |
| C6(f) | `applied-pricing.mapper.test.ts › C6(f-g)` | absent optional omitted |
| C6(g) | `applied-pricing.mapper.test.ts › C6(f-g)` | absent package split omitted |
| C6(h) | `client.test.ts › C6(h-i)` | null read-back status omitted |
| C6(i) | `client.test.ts › C6(h-i)` | unknown read-back status maps to `unknown` |
| C7(a) | `applied-pricing.mapper.test.ts › C7(a-b)` | every Money uses proposal currency |
| C7(b) | `applied-pricing.mapper.test.ts › C7(a-b)` | block currency retained and warning exact |
| C7(c) | `applied-pricing.mapper.test.ts › C7(c)` | equal block currency produces no warning |
| C7(d) | `applied-pricing.mapper.test.ts › C7(d-f)` | absent tax options become explicit `{}` |
| C7(e) | `applied-pricing.mapper.test.ts › C7(d-f)` | proposal/block currencies normalise uppercase |
| C7(f) | `applied-pricing.mapper.test.ts › C7(d-f)` | tax option names map snake_case to camelCase |
| C8(a) | `applied-pricing.mapper.test.ts › C8(a)` | production mapper scanner result is `[]` |
| C8(b1) | `applied-pricing.mapper.test.ts › C8(b) detects add` | one `add` record |
| C8(b2) | `applied-pricing.mapper.test.ts › C8(b) detects subtract` | one `subtract` record |
| C8(b3) | `applied-pricing.mapper.test.ts › C8(b) detects multiply` | one `multiply` record |
| C8(b4) | `applied-pricing.mapper.test.ts › C8(b) detects divide` | one `divide` record |
| C8(b5) | `applied-pricing.mapper.test.ts › C8(b) detects remainder` | one `remainder` record |
| C8(b6) | `applied-pricing.mapper.test.ts › C8(b) detects add_assign` | one `add_assign` record |
| C8(b7) | `applied-pricing.mapper.test.ts › C8(b) detects subtract_assign` | one `subtract_assign` record |
| C8(b8) | `applied-pricing.mapper.test.ts › C8(b) detects multiply_assign` | one `multiply_assign` record |
| C8(b9) | `applied-pricing.mapper.test.ts › C8(b) detects divide_assign` | one `divide_assign` record |
| C8(b10) | `applied-pricing.mapper.test.ts › C8(b) detects remainder_assign` | one `remainder_assign` record |
| C8(b11) | `applied-pricing.mapper.test.ts › C8(b) detects less_than` | one `less_than` record |
| C8(b12) | `applied-pricing.mapper.test.ts › C8(b) detects less_than_or_equal` | one `less_than_or_equal` record |
| C8(b13) | `applied-pricing.mapper.test.ts › C8(b) detects greater_than` | one `greater_than` record |
| C8(b14) | `applied-pricing.mapper.test.ts › C8(b) detects greater_than_or_equal` | one `greater_than_or_equal` record |
| C8(b15) | `applied-pricing.mapper.test.ts › C8(b) detects negate` | one `negate` record |
| C8(b16) | `applied-pricing.mapper.test.ts › C8(b) detects math` | one `math` record |
| C8(b17) | `applied-pricing.mapper.test.ts › C8(b) detects to_fixed` | one `to_fixed` record |
| C8(b18) | `applied-pricing.mapper.test.ts › C8(b) detects number` | one `number` record |
| C8(b19) | `applied-pricing.mapper.test.ts › C8(b) detects parse_float` | one `parse_float` record |
| C8(b20) | `applied-pricing.mapper.test.ts › C8(b) detects parse_int` | one `parse_int` record |
| C8(c) | `applied-pricing.mapper.test.ts › C8(c-d)` | literal concatenation produces `[]` |
| C8(d) | `applied-pricing.mapper.test.ts › C8(c-d)` | string/template text with no AST operator produces `[]` |

All 67 collected phase tests map to rows above; the dedicated helper file adds no new
objective and repeats C8(b1–b20, c, d) for its own direct helper surface. It passed 22/22
under the temporary helper-only L1 config.

## Named mutation ledger — 33/33 executed and reverted

Every entry below was applied on the working tree, run at L1 with the named target, observed
red, and reverted. The mutation probe files are separate from the fix perimeter:
`src/lib/proposales/mappers.ts`, `src/lib/proposales/schemas.ts`,
`src/lib/proposales/client.ts`, `src/lib/proposales/applied-pricing.mapper.ts`, and
`test/helpers/proposales-arithmetic-scan.ts`.

| ID | Site | Command / observed red assertion |
|---|---|---|
| MUT-04-1 | `mappers.ts` definition `quantityField` | `npx vitest run src/lib/proposales/mappers.test.ts -t C1`; C1(a-d) saw the absent quantity key present (`true`, expected `false`). |
| MUT-04-2 | `mappers.ts` definition `recipientField` | `npx vitest run src/lib/proposales/mappers.test.ts -t C1`; C1(e-h) saw empty `recipient` present. |
| MUT-04-3 | `schemas.ts` definition create block schema | `npx vitest run src/lib/proposales/mappers.test.ts -t C2`; C2(f) no longer found `currency` in `unrecognized_keys.keys`. |
| MUT-04-4 | `mappers.ts` definition metadata assembly | `npx vitest run src/lib/proposales/mappers.test.ts -t C3`; C3(a) saw four metadata keys instead of three. |
| MUT-04-5 | `client.ts` search query call site | `npx vitest run src/lib/proposales/client.test.ts -t C4`; C4(b) observed query keys missing `limit`. |
| MUT-04-6 | `client.ts` search verification call site | `npx vitest run src/lib/proposales/client.test.ts -t C5`; C5(a-f) observed 3 results instead of 1. |
| MUT-04-7 | `applied-pricing.mapper.ts` definition total mapping | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'reports inconsistent'`; C6(b) observed `20000` instead of stored `12345`. |
| MUT-04-8 | `schemas.ts` read-back definition `value_with_tax` | `npx vitest run src/lib/proposales/client.test.ts -t 'missing a required'`; C6(e) resolved with `totalWithTax: 0` instead of rejecting. |
| MUT-04-9 | `applied-pricing.mapper.ts` definition | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t arithmetic-free`; C8(a) observed one `add` record. |
| MUT-04-10 | `client.ts` definition `parseCreateProposalRequest` | `npx vitest run src/lib/proposales/client.test.ts -t 'parses create'`; C3(i) observed no `ValidationError`. |
| MUT-04-11 | `mappers.ts` `toCreateProposalRequest` call-site source | `npx vitest run src/lib/proposales/mappers.test.ts -t C2`; C2(i) found `currency` in the bounded source. |
| MUT-04-12 | `mappers.ts` definition `quantityField` | `npx vitest run src/lib/proposales/mappers.test.ts -t 'no undefined'`; C1(i) observed `quantity: undefined`. |
| MUT-04-13 | scanner binary `+` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects add'`; C8(b1) observed `[]` instead of `add`. |
| MUT-04-14 | scanner binary `-` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects subtract'`; C8(b2) observed `[]` instead of `subtract`. |
| MUT-04-15 | scanner binary `*` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects multiply'`; C8(b3) observed `[]` instead of `multiply`. |
| MUT-04-16 | scanner binary `/` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects divide'`; C8(b4) observed `[]` instead of `divide`. |
| MUT-04-17 | scanner binary `%` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects remainder'`; C8(b5) observed `[]` instead of `remainder`. |
| MUT-04-18 | scanner `+=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects add_assign'`; C8(b6) observed `[]` instead of `add_assign`. |
| MUT-04-19 | scanner `-=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects subtract_assign'`; C8(b7) observed `[]` instead of `subtract_assign`. |
| MUT-04-20 | scanner `*=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects multiply_assign'`; C8(b8) observed `[]` instead of `multiply_assign`. |
| MUT-04-21 | scanner `/=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects divide_assign'`; C8(b9) observed `[]` instead of `divide_assign`. |
| MUT-04-22 | scanner `%=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects remainder_assign'`; C8(b10) observed `[]` instead of `remainder_assign`. |
| MUT-04-23 | scanner `<` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects less_than'`; C8(b11) observed `[]` instead of `less_than`. |
| MUT-04-24 | scanner `<=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects less_than_or_equal'`; C8(b12) observed `[]` instead of `less_than_or_equal`. |
| MUT-04-25 | scanner `>` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects greater_than'`; C8(b13) observed `[]` instead of `greater_than`. |
| MUT-04-26 | scanner `>=` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects greater_than_or_equal'`; C8(b14) observed `[]` instead of `greater_than_or_equal`. |
| MUT-04-27 | scanner prefix-negative branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects negate'`; C8(b15) observed `[]` instead of `negate`. |
| MUT-04-28 | scanner `Math.*` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects math'`; C8(b16) observed `[]` instead of `math`. |
| MUT-04-29 | scanner `toFixed` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects to_fixed'`; C8(b17) observed `[]` instead of `to_fixed`. |
| MUT-04-30 | scanner `Number` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects number'`; C8(b18) observed `[]` instead of `number`. |
| MUT-04-31 | scanner `parseFloat` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects parse_float'`; C8(b19) observed `[]` instead of `parse_float`. |
| MUT-04-32 | scanner `parseInt` branch | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects parse_int'`; C8(b20) observed `[]` instead of `parse_int`. |
| MUT-04-33 | scanner literal-concatenation exclusion | `npx vitest run src/lib/proposales/applied-pricing.mapper.test.ts -t 'literal concatenation'`; C8(c-d) observed one `add` record for `"a" + "b"`. |

## Verification and tree identity

- Targeted phase: `npx vitest run src/lib/proposales/mappers.test.ts src/lib/proposales/client.test.ts src/lib/proposales/fake.test.ts src/lib/proposales/applied-pricing.mapper.test.ts` → 4 files / 67 tests green.
- Dedicated helper: `npx vitest run --config /private/tmp/phase4-vitest.config.mts test/helpers/proposales-arithmetic-scan.test.ts` → 1 file / 22 tests green. The temporary config was deleted and is not in the repository.
- `npm run typecheck` → green; generated `tsconfig.tsbuildinfo` was restored and is not in the write perimeter.
- `npm run lint` → green.
- `git diff --check` → green.
- Closing L4 stamp: `npm test` → 12 test files passed, 161 tests passed (19:16:26 start; 1.20s duration). This was the only `npm test` run authorized for this cycle and it passed before checkpoint staging.
- Pre-checkpoint HEAD: `c82a5d530de778f14a3a36293edab0b53faba29c`; final dirty-tree SHA/digest is captured at checkpoint staging, and the checkpoint SHA is recorded in the final provenance update.

## Write perimeter

### Fix and intended implementation files

1. `src/lib/proposales/schemas.ts`
2. `src/lib/proposales/mappers.ts`
3. `src/lib/proposales/mappers.test.ts`
4. `src/lib/proposales/client.ts`
5. `src/lib/proposales/client.test.ts`
6. `src/lib/proposales/fake.ts`
7. `src/lib/proposales/fake.test.ts`
8. `src/lib/proposales/index.ts`
9. `src/lib/proposales/README.md`
10. `src/lib/proposales/applied-pricing.mapper.ts`
11. `src/lib/proposales/applied-pricing.mapper.test.ts`
12. `src/lib/proposales/fixtures/proposal-create-response.json`
13. `src/lib/proposales/fixtures/proposal-search.json`
14. `src/lib/proposales/fixtures/proposal-readback.consistent.json`
15. `src/lib/proposales/fixtures/proposal-readback.inconsistent.json`
16. `test/helpers/proposales-arithmetic-scan.ts`
17. `test/helpers/proposales-arithmetic-scan.test.ts`

### Normal closing artifacts

- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` — only
  tracker row 4 was changed to `IMPLEMENTED`.
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-04-proposales-proposals.md` — append-only implementation Review-log entry.
- This handoff file.

### Probe-only files, applied and reverted

`src/lib/proposales/mappers.ts`, `src/lib/proposales/schemas.ts`,
`src/lib/proposales/client.ts`, `src/lib/proposales/applied-pricing.mapper.ts`, and
`test/helpers/proposales-arithmetic-scan.ts`. No probe mutation remains.

### Pre-existing tree state excluded from this cycle

`build_docs/under_constroction/initial_core_feature_proposales/handoffs/reviewer/phase-04-projection-round-0.reviewer.md` was already untracked at session entry and is not authored or claimed by this handoff. `src/styles/globals.css` and frontend-related files are unchanged and excluded. No architecture graph exists.

## Checkpoint

Checkpoint subject: `CHECKPOINT (not approved): phase 04 Proposales proposals`.

Checkpoint SHA: `a5771d6` (`CHECKPOINT (not approved): phase 04 Proposales proposals`).

The SHA line was filled in as a docs-only provenance update after the checkpoint; no
production source, tests, fixtures, plan criteria, tracker row, or implementation behavior
changed after the closing `npm test` stamp.
