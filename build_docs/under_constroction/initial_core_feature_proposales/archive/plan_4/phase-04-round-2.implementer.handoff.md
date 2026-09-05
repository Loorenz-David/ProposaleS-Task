---
plan: 4
role: fix
state: IMPLEMENTED
date: 2026-09-05
actor: Codex
---

# Phase 4 fix implementation handoff — round 2

Resolved the independent review's B1–B3 and S1–S8 findings. The Proposales adapter now
uses the vendor `TaxOptions.mode` wire key, has location-precise price-field guards,
tests the live create-parser call site, records fake requests byte-for-byte equivalent
to the real mapper, seeds recovered read-backs by UUID, directly guards absent tax and
currency cases, exercises case-sensitive recovery in the client, removes the
uncollected duplicate helper test, and uses Phase-4-prefixed test identifiers where
the tests own Phase-4 criteria.

## ⚠ OWNER DECISIONS REQUIRED (0)

None. No semantic conflict, owner card, or upstream amendment arose.

## Gate, baseline, and closing evidence

- Intention header: `RATIFIED`.
- Master tracker rows 1–3: `APPROVED`; row 4 was `IMPLEMENTING` with the required
  `Fix round 2 dispatched` note at entry and is now `IMPLEMENTED`.
- Phase-4 Review log contained the coordinator round-1 fold and its declaration of
  8 criteria / 80 rows / 35 named mutations.
- Pre-edit targeted baseline, before this round's source edits: 6 files / 93 tests
  green from `npx vitest run --project node src/lib/proposales`.
- New/strengthened tests plus fixes: 6 files / 95 tests green.
- Required non-L4 checks: `npm run typecheck`, `npm run lint`, and `git diff --check`
  passed.
- Closing L4, exactly one authorized run: `npm test` → 12 files / 163 tests green.
- `tsconfig.tsbuildinfo` was rewritten by typecheck and restored to its pre-run bytes.
- `npx vitest list` shows no `test/helpers/proposales-arithmetic-scan.test.ts`; the
  collected `applied-pricing.mapper.test.ts` is the sole scanner evidence home.
- No architecture graph is present.

## Coverage map — every criterion row

Each row below maps to a collected test and states whether the assertion has the exact
shape required by the plan. Parameterized scanner rows use the concrete instantiated
test title shown in the map.

| Row | Test id | Shape |
|---|---|---|
| C1(a) | `mappers.test.ts › P4-C1(a-d)` | absent quantity key is absent and the absent request parses |
| C1(b) | `mappers.test.ts › P4-C1(a-d)` | known quantity equals 2 |
| C1(c) | `mappers.test.ts › P4-C1(a-d)` | absent optional key is absent |
| C1(d) | `mappers.test.ts › P4-C1(a-d)` | known optional equals true |
| C1(e) | `mappers.test.ts › P4-C1(e-h)` | absent recipient key is absent |
| C1(f) | `mappers.test.ts › P4-C1(e-h)` | recipient deep-equals the one-leaf input |
| C1(g) | `mappers.test.ts › P4-C1(e-h)` | known-empty recipient key is absent |
| C1(h) | `mappers.test.ts › P4-C1(e-h)` | absent title/description keys are absent |
| C1(i) | `mappers.test.ts › P4-C1(i)` | recursive walk finds no undefined value |
| C2(a) | `mappers.test.ts › P4-C2(a-h)` | block injection of documented unit field is unrecognized |
| C2(b) | `mappers.test.ts › P4-C2(a-h)` | block injection of documented unit field is unrecognized |
| C2(c) | `mappers.test.ts › P4-C2(a-h)` | block injection of documented unit field is unrecognized |
| C2(d) | `mappers.test.ts › P4-C2(a-h)` | block injection of documented unit field is unrecognized |
| C2(e) | `mappers.test.ts › P4-C2(a-h)` | block `package_split` injection is unrecognized |
| C2(f) | `mappers.test.ts › P4-C2(a-h)` | block `currency` injection is unrecognized |
| C2(g) | `mappers.test.ts › P4-C2(a-h)` | proposal-root `currency` injection is unrecognized |
| C2(h) | `mappers.test.ts › P4-C2(a-h)` | proposal-root `tax_options` injection is unrecognized |
| C2(i) | `mappers.test.ts › P4-C2(i)` | bounded helper source names none of seven prohibited keys |
| C3(a) | `mappers.test.ts › P4-C3(a-g)` | metadata key set is exactly three keys |
| C3(b) | `mappers.test.ts › P4-C3(a-g)` | all metadata values are strings |
| C3(c) | `mappers.test.ts › P4-C3(a-g)` | source marker is exact |
| C3(d) | `mappers.test.ts › P4-C3(a-g)` | generation id is verbatim |
| C3(e) | `mappers.test.ts › P4-C3(a-g)` | epoch-zero timestamp is exact |
| C3(f) | `mappers.test.ts › P4-C3(a-g)` | company and language are exact |
| C3(g) | `mappers.test.ts › P4-C3(a-g)` | block wire shape is exact |
| C3(h) | `fake.test.ts › P4-C3(h)` | exact op/input/request, write count, seeded read-back, and guard |
| C3(i) | `client.test.ts › P4-C3(i)` | invalid parsed request throws `ValidationError` |
| C3(j) | `client.test.ts › P4-C3(j)` | mapped invalid request throws before fetch; fetch count is zero |
| C3(k) | `client.test.ts › P4-C3(k)` | create response maps once and returns HTTPS URL |
| C3(l) | `fake.test.ts › P4-C3(l)` | seeded recovery row returns its seeded read-back |
| C3(m) | `fake.test.ts › P4-C3(m)` | queued get failure is the exact error |
| C4(a) | `client.test.ts › P4-C4(a-d)` | recovery path is `/v3/proposal-search` |
| C4(b) | `client.test.ts › P4-C4(a-d)` | query key set is exact |
| C4(c) | `client.test.ts › P4-C4(a-d)` | OpenAPI `limit` is located by name and maximum is sent |
| C4(d) | `client.test.ts › P4-C4(a-d)` | forbidden query keys are absent |
| C5(a) | `client.test.ts › P4-C5(a-f)` | exact generation row is included |
| C5(b) | `client.test.ts › P4-C5(a-f)` | mismatching generation row is excluded |
| C5(c) | `client.test.ts › P4-C5(a-f)` | uppercased generation row is excluded by client |
| C5(d) | `client.test.ts › P4-C5(a-f)` | missing metadata row is excluded |
| C5(e) | `client.test.ts › P4-C5(a-f)` | null status is omitted |
| C5(f) | `client.test.ts › P4-C5(a-f)` | unknown status maps to `unknown` |
| C6(a) | `applied-pricing.mapper.test.ts › P4-C6(a)` | totals and all four distinct unit values map verbatim |
| C6(b) | `applied-pricing.mapper.test.ts › P4-C6(b)` | both stored inconsistent totals map verbatim |
| C6(c) | `applied-pricing.mapper.test.ts › P4-C6(c-d)` | fractional quantity is carried exactly |
| C6(d) | `applied-pricing.mapper.test.ts › P4-C6(c-d)` | VAT is carried exactly |
| C6(e) | `client.test.ts › P4-C6(e)` | missing money field rejects with schema mismatch |
| C6(f) | `applied-pricing.mapper.test.ts › P4-C6(f-g)` | absent optional is absent |
| C6(g) | `applied-pricing.mapper.test.ts › P4-C6(f-g)` | absent package split is absent |
| C6(h) | `client.test.ts › P4-C6(h-i)` | null read-back status is omitted |
| C6(i) | `client.test.ts › P4-C6(h-i)` | unknown read-back status maps to `unknown` |
| C7(a) | `applied-pricing.mapper.test.ts › P4-C7(a-b)` | every Money uses proposal currency |
| C7(b) | `applied-pricing.mapper.test.ts › P4-C7(a-b)` | block currency is retained and warning is exact |
| C7(c) | `applied-pricing.mapper.test.ts › P4-C7(c-d)` | equal block currency produces no warning |
| C7(d) | `applied-pricing.mapper.test.ts › P4-C7(c-d)` | absent block currency produces no warning |
| C7(e) | `applied-pricing.mapper.test.ts › P4-C7(e-g)` | absent tax options map to `{}` |
| C7(f) | `applied-pricing.mapper.test.ts › P4-C7(e-g)` | proposal/block currencies normalize uppercase |
| C7(g) | `applied-pricing.mapper.test.ts › P4-C7(e-g)` | vendor tax options map `mode` and camel-case fields |
| C8(a) | `applied-pricing.mapper.test.ts › P4-C8(a)` | production mapper scanner result is empty |
| C8(b1) | `applied-pricing.mapper.test.ts › P4-C8(b) detects add` | scanner returns one `add` record |
| C8(b2) | `applied-pricing.mapper.test.ts › P4-C8(b) detects subtract` | scanner returns one `subtract` record |
| C8(b3) | `applied-pricing.mapper.test.ts › P4-C8(b) detects multiply` | scanner returns one `multiply` record |
| C8(b4) | `applied-pricing.mapper.test.ts › P4-C8(b) detects divide` | scanner returns one `divide` record |
| C8(b5) | `applied-pricing.mapper.test.ts › P4-C8(b) detects remainder` | scanner returns one `remainder` record |
| C8(b6) | `applied-pricing.mapper.test.ts › P4-C8(b) detects add_assign` | scanner returns one `add_assign` record |
| C8(b7) | `applied-pricing.mapper.test.ts › P4-C8(b) detects subtract_assign` | scanner returns one `subtract_assign` record |
| C8(b8) | `applied-pricing.mapper.test.ts › P4-C8(b) detects multiply_assign` | scanner returns one `multiply_assign` record |
| C8(b9) | `applied-pricing.mapper.test.ts › P4-C8(b) detects divide_assign` | scanner returns one `divide_assign` record |
| C8(b10) | `applied-pricing.mapper.test.ts › P4-C8(b) detects remainder_assign` | scanner returns one `remainder_assign` record |
| C8(b11) | `applied-pricing.mapper.test.ts › P4-C8(b) detects less_than` | scanner returns one `less_than` record |
| C8(b12) | `applied-pricing.mapper.test.ts › P4-C8(b) detects less_than_or_equal` | scanner returns one `less_than_or_equal` record |
| C8(b13) | `applied-pricing.mapper.test.ts › P4-C8(b) detects greater_than` | scanner returns one `greater_than` record |
| C8(b14) | `applied-pricing.mapper.test.ts › P4-C8(b) detects greater_than_or_equal` | scanner returns one `greater_than_or_equal` record |
| C8(b15) | `applied-pricing.mapper.test.ts › P4-C8(b) detects negate` | scanner returns one `negate` record |
| C8(b16) | `applied-pricing.mapper.test.ts › P4-C8(b) detects math` | scanner returns one `math` record |
| C8(b17) | `applied-pricing.mapper.test.ts › P4-C8(b) detects to_fixed` | scanner returns one `to_fixed` record |
| C8(b18) | `applied-pricing.mapper.test.ts › P4-C8(b) detects number` | scanner returns one `number` record |
| C8(b19) | `applied-pricing.mapper.test.ts › P4-C8(b) detects parse_float` | scanner returns one `parse_float` record |
| C8(b20) | `applied-pricing.mapper.test.ts › P4-C8(b) detects parse_int` | scanner returns one `parse_int` record |
| C8(c) | `applied-pricing.mapper.test.ts › P4-C8(c-d)` | literal concatenation produces no record |
| C8(d) | `applied-pricing.mapper.test.ts › P4-C8(c-d)` | string/template text without an AST operator produces no record |

Count: 8 criteria / 80 rows. Every Phase-4 test in the four phase test files is mapped
above; the retained unprefixed tests in these files are inherited phase-3 rows, not
Phase-4 aliases.

## Named mutation ledger — 35/35 executed and reverted

Each probe was applied at the named site, run at L1/L2, observed red, and reverted. The
probe-only files are listed separately below. The observed result is the actual failing
assertion, not the expected result.

| ID | Site | Command | Observed red |
|---|---|---|---|
| MUT-04-1 | `mappers.ts` definition `quantityField` | `npx vitest run --project node src/lib/proposales/mappers.test.ts -t 'P4-C1'` | absent quantity was present instead of absent |
| MUT-04-2 | `mappers.ts` definition `recipientField` | same P4-C1 command | empty recipient was present instead of absent |
| MUT-04-3 | `schemas.ts` definition create block schema | `npx vitest run --project node src/lib/proposales/mappers.test.ts -t 'P4-C2'` | a prohibited block key no longer produced the required unrecognized-key assertion |
| MUT-04-4 | `mappers.ts` definition metadata assembly | `npx vitest run --project node src/lib/proposales/mappers.test.ts -t 'P4-C3'` | metadata key set had four keys instead of three |
| MUT-04-5 | `client.ts` search query call site | `npx vitest run --project node src/lib/proposales/client.test.ts -t 'P4-C4'` | query key set lacked `limit` |
| MUT-04-6 | `client.ts` search verification call site | `npx vitest run --project node src/lib/proposales/client.test.ts -t 'P4-C5'` | mismatching rows were returned; expected length one failed |
| MUT-04-7 | `applied-pricing.mapper.ts` definition total mapping | `npx vitest run --project node src/lib/proposales/applied-pricing.mapper.test.ts -t 'reports inconsistent'` | stored total `12345` was replaced by computed `20200` |
| MUT-04-8 | `schemas.ts` definition read-back `value_with_tax` | `npx vitest run --project node src/lib/proposales/client.test.ts -t 'missing a required money'` | missing money resolved with default zero instead of rejecting |
| MUT-04-9 | `applied-pricing.mapper.ts` definition | `npx vitest run --project node src/lib/proposales/applied-pricing.mapper.test.ts -t 'mapper arithmetic-free'` | scanner returned an `add` record |
| MUT-04-10 | `client.ts` definition `parseCreateProposalRequest` | `npx vitest run --project node src/lib/proposales/client.test.ts -t 'parses invalid create'` | invalid request did not throw `ValidationError` |
| MUT-04-11 | `mappers.ts` `toCreateProposalRequest` assembly site | `npx vitest run --project node src/lib/proposales/mappers.test.ts -t 'names no prohibited'` | bounded mapper source contained `currency` |
| MUT-04-12 | `mappers.ts` definition `quantityField` | `npx vitest run --project node src/lib/proposales/mappers.test.ts -t 'no undefined'` | recursive walk found `quantity: undefined` |
| MUT-04-13 | scanner binary `+` detection | `npx vitest run --project node src/lib/proposales/applied-pricing.mapper.test.ts -t 'detects add'` | expected `add`, observed no record |
| MUT-04-14 | scanner binary `-` detection | same with `detects subtract` | expected `subtract`, observed no record |
| MUT-04-15 | scanner binary `*` detection | same with `detects multiply` | expected `multiply`, observed no record |
| MUT-04-16 | scanner binary `/` detection | same with `detects divide` | expected `divide`, observed no record |
| MUT-04-17 | scanner binary `%` detection | same with `detects remainder` | expected `remainder`, observed no record |
| MUT-04-18 | scanner `+=` detection | same with `detects add_assign` | expected `add_assign`, observed no record |
| MUT-04-19 | scanner `-=` detection | same with `detects subtract_assign` | expected `subtract_assign`, observed no record |
| MUT-04-20 | scanner `*=` detection | same with `detects multiply_assign` | expected `multiply_assign`, observed no record |
| MUT-04-21 | scanner `/=` detection | same with `detects divide_assign` | expected `divide_assign`, observed no record |
| MUT-04-22 | scanner `%=` detection | same with `detects remainder_assign` | expected `remainder_assign`, observed no record |
| MUT-04-23 | scanner `<` detection | same with `detects less_than` | expected `less_than`, observed no record |
| MUT-04-24 | scanner `<=` detection | same with `detects less_than_or_equal` | expected `less_than_or_equal`, observed no record |
| MUT-04-25 | scanner `>` detection | same with `detects greater_than` | expected `greater_than`, observed no record |
| MUT-04-26 | scanner `>=` detection | same with `detects greater_than_or_equal` | expected `greater_than_or_equal`, observed no record |
| MUT-04-27 | scanner prefix-negative detection | same with `detects negate` | expected `negate`, observed no record |
| MUT-04-28 | scanner `Math.*` detection | same with `detects math` | expected `math`, observed no record |
| MUT-04-29 | scanner `toFixed` detection | same with `detects to_fixed` | expected `to_fixed`, observed no record |
| MUT-04-30 | scanner `Number` detection | same with `detects number` | expected `number`, observed no record |
| MUT-04-31 | scanner `parseFloat` detection | same with `detects parse_float` | expected `parse_float`, observed no record |
| MUT-04-32 | scanner `parseInt` detection | same with `detects parse_int` | expected `parse_int`, observed no record |
| MUT-04-33 | scanner literal-concatenation exclusion | `npx vitest run --project node src/lib/proposales/applied-pricing.mapper.test.ts -t 'literal concatenation'` | literal `"a" + "b"` produced an `add` record |
| MUT-04-34 | `schemas.ts` definition create proposal schema | `npx vitest run --project node src/lib/proposales/mappers.test.ts -t 'prohibited price key'` | proposal-root `currency`/`tax_options` injection parsed instead of being unrecognized |
| MUT-04-35 | `client.ts` `createProposalDraft` call site | `npx vitest run --project node src/lib/proposales/client.test.ts -t 'mapped invalid request'` | invalid request did not throw `ValidationError` and reached injected fetch |

Mutation arithmetic: MUT-04-1–12 = 12; MUT-04-13–33 = 21; MUT-04-34–35 = 2;
total = 35. The initial M04-7 selector was corrected after it produced a skipped-test
false green; the rerun used `reports inconsistent` and reddened the named assertion.

## Write perimeter

### Full allowed cycle perimeter

- `src/lib/proposales/{schemas.ts,mappers.ts,mappers.test.ts,client.ts,client.test.ts,fake.ts,fake.test.ts,applied-pricing.mapper.ts,applied-pricing.mapper.test.ts,README.md}`
- `src/lib/proposales/fixtures/{proposal-search.json,proposal-readback.consistent.json,proposal-readback.inconsistent.json}`
- `src/lib/proposales/fixtures/proposal-create-response.json` (allowed, unchanged)
- `test/helpers/proposales-arithmetic-scan.ts` (allowed, unchanged)
- delete only `test/helpers/proposales-arithmetic-scan.test.ts`
- normal closeout artifacts: master-plan tracker row 4, the Phase-4 Review log, and this handoff

### Files changed by the fix

`schemas.ts`, `mappers.ts`, `mappers.test.ts`, `index.ts`, `client.test.ts`, `fake.ts`,
`fake.test.ts`, `applied-pricing.mapper.ts`, `applied-pricing.mapper.test.ts`, `README.md`,
`proposal-search.json`, `proposal-readback.consistent.json`,
`proposal-readback.inconsistent.json`, and deletion of
`test/helpers/proposales-arithmetic-scan.test.ts`, plus the tracker, Review log, and this
handoff. `client.ts` and `test/helpers/proposales-arithmetic-scan.ts` were mutation-only
files and have no retained probe changes.

### Probe-only files, applied and reverted

- `src/lib/proposales/mappers.ts`
- `src/lib/proposales/schemas.ts`
- `src/lib/proposales/client.ts`
- `src/lib/proposales/applied-pricing.mapper.ts`
- `test/helpers/proposales-arithmetic-scan.ts`

No probe mutation remains. The pre-existing untracked reviewer handoffs
`handoffs/reviewer/phase-04-projection-round-0.reviewer.md` and
`handoffs/reviewer/phase-04-round-1.reviewer.md` were preserved untouched and are not
claimed by this cycle.

## Documentation impact review

After verification, contract 14 §8 was applied. The integration README was incomplete
because it listed the three metadata keys without stating that `proposal_copilot_` is
reserved and that the application interprets no key it did not write; that authoritative
README was patched. No root README, feature README, vendor snapshot, intention, or other
durable document became false or incomplete. No architecture graph delta was needed.

## Checkpoint

Checkpoint subject: `CHECKPOINT (not approved): phase 04 Proposales proposals fix round 2`

Checkpoint SHA: `d937fe8` (`CHECKPOINT (not approved): phase 04 Proposales proposals fix round 2`).
