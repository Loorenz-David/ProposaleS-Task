---
plan: 4
phase: Proposales adapter — create, recovery search, read-back, Applied Pricing
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 4 — Proposales adapter: create, recovery search, read-back, Applied Pricing

## Goal

Complete the Proposales client: `createProposalDraft` (strict outbound request schema in which price fields are unrepresentable; omission by spread helpers; the three binding metadata keys), `findProposalsByGenerationId` (the fully determined recovery search with in-client row re-verification), `getProposal` and the arithmetic-free Applied Pricing mapper, and the fake's write half.

**Not in this phase:** any feature schema or service; the decision 0/1/≥2 → create/recovered/conflict (phase 14); the feature-side `toCreateDraftInput` (phase 14).

## Read first

1. Master plan §5 (R5, R6, R10), §6.4 (`CreateProposalDraftInput`, `CreatedDraft`, `RecoveredProposalSummary`, `ProposalReadback`, `appliedPricingSchema`), §6.5 (`PROPOSAL_METADATA_KEYS`, `PROPOSAL_COPILOT_SOURCE_MARKER`, `PROPOSAL_SEARCH_LIMIT`), §6.7, §9 rules 1, 2, 5.
2. Intention §17A.5 (all), §17A.11 (all), §17A.12 (all), §17A.13 (404 on read-back), §12.1, §13, §14, invariant 17, §3.1.
3. Evidence doc §4, §5, §6, §8 (especially §8.1 control read-back and §8.3 for fixture shapes), §7 rows 1 and 3.
4. `openapi.json`: `CreateProposalRequest`, `ProposalBlockInput`, `ProposalMutationResponse`, `GET /v3/proposal-search` parameters (note `limit` `default 1, maximum 25`), `ProposalSearchResult`, `GET /v3/proposals/{uuid}` response, `PackageSplit`.
5. Contracts: `07-integrations.md` §3, §4, §5, §6; `06-data-contracts-and-validation.md` §3, §6, §7; `04-server-architecture.md` §8; `10-security-and-trust-boundaries.md` §10; `12-anti-patterns.md` "Data and validation", "Integrations".
6. Phase 3 Review log (hazards).

## Dependencies (gate)

Phase 3 `APPROVED`.

## Files expected to change

Existing: `src/lib/proposales/schemas.ts`, `mappers.ts`, `mappers.test.ts`, `client.ts`, `client.test.ts`, `fake.ts`, `fake.test.ts`, `index.ts`, `README.md`. New: `src/lib/proposales/applied-pricing.mapper.ts`, `applied-pricing.mapper.test.ts`, `fixtures/proposal-create-response.json`, `fixtures/proposal-search.json`, `fixtures/proposal-readback.consistent.json`, `fixtures/proposal-readback.inconsistent.json`, `test/helpers/proposales-arithmetic-scan.ts`, `test/helpers/proposales-arithmetic-scan.test.ts` — 17 code/test/fixture paths. Normal closing artifacts: master-plan tracker row 4 and this plan's append-only Review log.

## Implementation tasks (ordered)

1. `schemas.ts`: `createProposalRequestSchema` is **`z.strictObject`** with exactly the original task's request keys, including a strict `data` object keyed only by `PROPOSAL_METADATA_KEYS`' values. Never declare the prohibited price fields. `proposalMutationResponseSchema` wraps `{ proposal: { uuid, url } }`; `proposalSearchResponseSchema` wraps `{ data: rows }`, with `series_uuid?` deliberately looser than the vendor's required declaration. For read-back, normalise proposal/block currency with the phase-3 uppercase transform then `currencyCodeSchema`; money totals and all four block unit values, `content_id`, and `quantity` are required integers; `optional`, `package_split`, `tax_options`, `series_uuid`, and `status` are nullable/optional as the vendor allows. Map absent/null status to absence and an unrecognised non-null status to `"unknown"`; `optional`/`package_split` are omitted, never defaulted. `package_split[].type` is `z.string()`; price split amounts remain optional integers.
2. `mappers.ts`: `toCreateProposalRequest(input, ctx: { companyId: number; now: () => number })` is assembled **only from spreads of per-field helpers** returning `{}` or `{ key: value }`; no `??`, `||`, default parameters, or `undefined`-valued keys. It uses `formatIsoTimestamp(new Date(ctx.now()))` and the fixed metadata property names `source`, `generationId`, `createdAt`. `toCreatedDraft`, `toRecoveredSummary`, and `toProposalReadback` own all wire→lib mapping, including `String(wire.content_id)`, snake→camel conversion, and status absence/unknown conversion.
3. `applied-pricing.mapper.ts`: `toAppliedPricing(readback): AppliedPricing` returns the lib-owned `available: true` arm in master plan §6.4. It wraps integer money using the proposal currency, maps `tax_options.{tax_mode,tax_included,tax_label_key}` to `taxOptions.{mode,taxIncluded,taxLabelKey}`, and maps absent `tax_options` to `{}` through an explicit conditional at this display-only boundary. It preserves absent `optional`/`package_split`, carries `quantity`, `vat`, and `blockCurrency` verbatim, and adds the stated warning only by string inequality. The file contains no arithmetic operator, `Math.*`, `toFixed`, `Number(`, `parseFloat`, `parseInt`, numeric comparison, or numeric default.
4. `test/helpers/proposales-arithmetic-scan.ts` is a test-only TypeScript-AST scanner, imported only by its test and the pricing-mapper test. `findArithmetic(sourceText)` returns `{ line, kind }` records with the closed kinds `add`, `subtract`, `multiply`, `divide`, `remainder`, `add_assign`, `subtract_assign`, `multiply_assign`, `divide_assign`, `remainder_assign`, `less_than`, `less_than_or_equal`, `greater_than`, `greater_than_or_equal`, `negate`, `math`, `to_fixed`, `number`, `parse_float`, `parse_int`. It ignores a binary `+` whose operands are both string literals; ordinary string/template text without an AST operator is also ignored.
5. `client.ts`: widen all Phase-3 client/factory return types to the full `ProposalesClient` interface. `createProposalDraft` maps then calls exported `parseCreateProposalRequest(request: unknown)` on the production path before its single `POST /v3/proposals`; that parser uses `createProposalRequestSchema` and raises a local `ValidationError` on failure. Parse the mutation response and return its https URL. Search and read-back use the exact original paths/query/strict generation re-verification; C4(c)'s test locates the OpenAPI parameter by `name === "limit"`, never index.
6. `fake.ts`: widen the fake to the full interface. Its options and exposed test surface are exactly master plan §6.6's `createFakeProposalesClient` row. A create call is exactly `{ op: "createProposalDraft", input, request }`, with `request` produced by the real mapper using the injected fake `companyId`/`now`; it increments `writes`, stores the injected `proposalReadback` under the injected UUID, and never computes a total. Recovery filters the stored generation metadata; `failNext(op, error)` queues one failure for that op; `getProposal` returns the stored read-back or throws the queued/configured error.
7. `README.md`: add the three operations, the exact metadata keys, the recovery-search request, the read-back and its "no arithmetic" rule, the retry policy per operation.
8. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | absent quantity omitted | block `quantity: { known: false }` | `"quantity" in request.blocks[0] === false`; request parses `createProposalRequestSchema` | MUT-04-1 `mappers.ts` · `quantityField` · `f.known ? { quantity: f.value } : { quantity: 1 }` → C1(a) red | M9, §17A.5, crit 22 |
| C1(b) | known quantity | `{ known: true, value: 2 }` | `quantity === 2` | — | M9 |
| C1(c) | absent optional omitted | `{ known: false }` | key absent | — | M9, crit 22 |
| C1(d) | known optional | `{ known: true, value: true }` | `optional === true` | — | M9 |
| C1(e) | recipient absent | `recipient: { known: false }` | `"recipient" in request === false` | — | M9, §17A.5 |
| C1(f) | recipient with one leaf | known, `{ email: "a@b.se" }` | `recipient` deep-equals `{ email: "a@b.se" }` | — | §17A.5 |
| C1(g) | recipient known but empty | known, `{}` | `"recipient" in request === false` (never `{}`) | MUT-04-2 `mappers.ts` · `recipientField` · emit `{ recipient: {} }` when all leaves absent → C1(g) red | §17A.5 |
| C1(h) | absent title/description | both undefined in input | `title_md`, `description_md` keys absent | — | M9 |
| C1(i) | no `undefined` values anywhere | any of the above | an `Object.entries` deep-walk finds no `undefined` value | MUT-04-12 `mappers.ts` · `quantityField` · return `{ quantity: undefined }` for absent quantity → C1(i) red | §17A.5 |
| C2(a–h) | price fields unrepresentable, one row per key | a valid request object plus one of `unit_value_with_discount_without_tax`, `unit_value_with_discount_with_tax`, `unit_value_without_discount_without_tax`, `unit_value_without_discount_with_tax`, `package_split` (on a block), block `currency`, proposal `currency`, `tax_options` | `safeParse` fails with an `unrecognized_keys` issue whose `keys` contains the injected key | MUT-04-3 `schemas.ts` · block schema · declare `currency: z.string().optional()` → C2(f) red | M9, §17A.5, crit 16 |
| C2(i) | outbound mapper source never names price fields | source text bounded to `toCreateProposalRequest` | contains none of the seven distinct prohibited wire keys | MUT-04-11 `mappers.ts` · `toCreateProposalRequest` · append `{ currency: "EUR" }` → C2(i) red | M9, crit 16 |
| C3(a) | metadata keys exact | any input | `Object.keys(request.data)` deep-equals `[proposal_copilot_source, proposal_copilot_generation_id, proposal_copilot_created_at]` (order irrelevant, set equal, length 3) | MUT-04-4 `mappers.ts` · data assembly · add `proposal_copilot_model: "x"` → C3(a) red | §17A.11, M14 |
| C3(b) | values are strings | | every `typeof === "string"` | — | §17A.11 |
| C3(c) | source marker | | `=== "proposal-copilot"` | — | §17A.11 |
| C3(d) | generation id verbatim | | equals `input.generationId` | — | M8, §17A.11 |
| C3(e) | created_at from clock | `now` → epoch 0 | `=== "1970-01-01T00:00:00.000Z"` | — | §17A.16 |
| C3(f) | company and language | | `company_id === ctx.companyId`; `language === input.language` | — | §17A.11 |
| C3(g) | block wire shape | block content `"188485"` | `blocks[0]` deep-equals `{ content_id: 188485, type: "product-block" }` (+ quantity/optional only when known) | — | §17A.5, evidence §3 |
| C3(h) | fake records the wire request | `fake.createProposalDraft(input)` with the same injected `companyId`/`now` as `ctx` | last call's `op` and `input` equal the operation/input; its `request` deep-equals `toCreateProposalRequest(input, ctx)`; `fake.writes === 1`; `assertNoWrites()` throws | — | M3, M5 |
| C3(i) | outbound parser is live | `parseCreateProposalRequest` with a request containing a prohibited key | throws `ValidationError`; the HTTP post is not reached when the client calls the parser | MUT-04-10 `client.ts` · `parseCreateProposalRequest` · return the request without schema parse → C3(i) red | M9, crit 16 |
| C4(a) | search path | spy | `GET /v3/proposal-search` | — | M14 |
| C4(b) | query keys exact | | keys set-equal to `["company_id", "filter[proposal_copilot_generation_id]", "limit"]` | MUT-04-5 `client.ts` · search query · remove `limit` → C4(b) red | M14, §17A.11 |
| C4(c) | limit is the documented maximum | read `openapi.json` `limit.maximum` at test time | `PROPOSAL_SEARCH_LIMIT === maximum` and the query carries it | — | M14 |
| C4(d) | forbidden params absent | | none of `recipient_email`, `exclude_revision_drafts`, `include_archived` | — | §17A.11 |
| C5(a) | verified row kept | fixture row with `data.proposal_copilot_generation_id === id` | included | — | M14 |
| C5(b) | mismatching row dropped | row with another id | excluded | MUT-04-6 `client.ts` · verification filter · delete it → C5(b) red | M14 |
| C5(c) | case differs | same id uppercase | excluded (exact equality) | — | M14 |
| C5(d) | key missing | row with `data: {}` | excluded | — | M14 |
| C5(e) | absent status stays absent | search row `status: null` | summary has no `status` key | — | M14 |
| C5(f) | unrecognised status is visible | search row `status: "vendor_future_status"` | `status === "unknown"` | — | M14 |
| C6(a) | consistent read-back verbatim | `proposal-readback.consistent.json` | `totalWithoutTax.amountMinor`, `totalWithTax.amountMinor`, each block's four unit values equal the fixture integers | — | M13, crit 18 |
| C6(b) | inconsistent read-back verbatim | `proposal-readback.inconsistent.json`, where **both** totals differ from the corresponding `Σ unit × quantity` | both totals are reported exactly as stored | MUT-04-7 `applied-pricing.mapper.ts` · `totalWithoutTax` mapping · replace it with `Σ(unit_value_with_discount_without_tax × quantity)` → C6(b) red | M13, §17A.12 |
| C6(c) | fractional quantity | `quantity: 1.5` | carried as `1.5` | — | §17A.12 |
| C6(d) | vat carried | `vat: 0.25` | `packageSplit[0].vat === 0.25` | — | §17A.12 |
| C6(e) | missing money field | fixture without `value_with_tax` | `getProposal` throws `schema_mismatch`; never `0` | MUT-04-8 `schemas.ts` · readback · `.default(0)` on `value_with_tax` → C6(e) red | M13 |
| C6(f) | optional flag absent | read-back block without `optional` | mapped block has no `optional` key | — | M13 |
| C6(g) | package split absent | read-back block without `package_split` | mapped block has no `packageSplit` key | — | M13 |
| C6(h) | absent status stays absent on read-back | proposal `status: null` | `ProposalReadback` has no `status` key | — | M13 |
| C6(i) | unrecognised read-back status is visible | proposal `status: "vendor_future_status"` | `ProposalReadback.status === "unknown"` | — | M13 |
| C7(a) | currency from the proposal | proposal `EUR`, block `currency: "SEK"` | every `Money.currency === "EUR"` | — | M13, §17A.12 |
| C7(b) | block currency warning | same | `warnings` contains `{ kind: "block_currency_differs", contentId }`; `blockCurrency === "SEK"` | — | §17A.12 |
| C7(c) | equal or absent | block `EUR` / block without currency | no warning | — | §17A.12 |
| C7(d) | absent tax options is explicit | read-back without `tax_options` | `taxOptions` deep-equals `{}` | — | M13 |
| C7(e) | currency normalised | read-back proposal `currency: "eur"` and block `currency: "sek"` | Money currency is `EUR`; `blockCurrency === "SEK"` | — | M13 |
| C7(f) | tax options are renamed | read-back `tax_options: { tax_mode: "standard", tax_included: false, tax_label_key: "vat" }` | `taxOptions` deep-equals `{ mode: "standard", taxIncluded: false, taxLabelKey: "vat" }` | — | M13 |
| C8(a) | mapper is arithmetic-free | `findArithmetic(read applied-pricing.mapper.ts)` | `[]` | MUT-04-9 `applied-pricing.mapper.ts` · add `const t = a + b` → C8(a) red | M13, invariant 17 |
| C8(b1) | scanner detects addition | `a + b` | one `add` record | MUT-04-13 `test/helpers/proposales-arithmetic-scan.ts` · addition detection · disable it → C8(b1) red | M13 |
| C8(b2) | scanner detects subtraction | `a - b` | one `subtract` record | MUT-04-14 `test/helpers/proposales-arithmetic-scan.ts` · subtraction detection · disable it → C8(b2) red | M13 |
| C8(b3) | scanner detects multiplication | `a * b` | one `multiply` record | MUT-04-15 `test/helpers/proposales-arithmetic-scan.ts` · multiplication detection · disable it → C8(b3) red | M13 |
| C8(b4) | scanner detects division | `a / b` | one `divide` record | MUT-04-16 `test/helpers/proposales-arithmetic-scan.ts` · division detection · disable it → C8(b4) red | M13 |
| C8(b5) | scanner detects remainder | `a % b` | one `remainder` record | MUT-04-17 `test/helpers/proposales-arithmetic-scan.ts` · remainder detection · disable it → C8(b5) red | M13 |
| C8(b6) | scanner detects addition assignment | `a += b` | one `add_assign` record | MUT-04-18 `test/helpers/proposales-arithmetic-scan.ts` · addition-assignment detection · disable it → C8(b6) red | M13 |
| C8(b7) | scanner detects subtraction assignment | `a -= b` | one `subtract_assign` record | MUT-04-19 `test/helpers/proposales-arithmetic-scan.ts` · subtraction-assignment detection · disable it → C8(b7) red | M13 |
| C8(b8) | scanner detects multiplication assignment | `a *= b` | one `multiply_assign` record | MUT-04-20 `test/helpers/proposales-arithmetic-scan.ts` · multiplication-assignment detection · disable it → C8(b8) red | M13 |
| C8(b9) | scanner detects division assignment | `a /= b` | one `divide_assign` record | MUT-04-21 `test/helpers/proposales-arithmetic-scan.ts` · division-assignment detection · disable it → C8(b9) red | M13 |
| C8(b10) | scanner detects remainder assignment | `a %= b` | one `remainder_assign` record | MUT-04-22 `test/helpers/proposales-arithmetic-scan.ts` · remainder-assignment detection · disable it → C8(b10) red | M13 |
| C8(b11) | scanner detects less-than | `a < b` | one `less_than` record | MUT-04-23 `test/helpers/proposales-arithmetic-scan.ts` · less-than detection · disable it → C8(b11) red | M13 |
| C8(b12) | scanner detects less-than-or-equal | `a <= b` | one `less_than_or_equal` record | MUT-04-24 `test/helpers/proposales-arithmetic-scan.ts` · less-than-or-equal detection · disable it → C8(b12) red | M13 |
| C8(b13) | scanner detects greater-than | `a > b` | one `greater_than` record | MUT-04-25 `test/helpers/proposales-arithmetic-scan.ts` · greater-than detection · disable it → C8(b13) red | M13 |
| C8(b14) | scanner detects greater-than-or-equal | `a >= b` | one `greater_than_or_equal` record | MUT-04-26 `test/helpers/proposales-arithmetic-scan.ts` · greater-than-or-equal detection · disable it → C8(b14) red | M13 |
| C8(b15) | scanner detects prefix negative | `-x` | one `negate` record | MUT-04-27 `test/helpers/proposales-arithmetic-scan.ts` · prefix-negative detection · disable it → C8(b15) red | M13 |
| C8(b16) | scanner detects Math call | `Math.round(x)` | one `math` record | MUT-04-28 `test/helpers/proposales-arithmetic-scan.ts` · Math-call detection · disable it → C8(b16) red | M13 |
| C8(b17) | scanner detects toFixed | `x.toFixed(2)` | one `to_fixed` record | MUT-04-29 `test/helpers/proposales-arithmetic-scan.ts` · toFixed detection · disable it → C8(b17) red | M13 |
| C8(b18) | scanner detects Number | `Number(x)` | one `number` record | MUT-04-30 `test/helpers/proposales-arithmetic-scan.ts` · Number detection · disable it → C8(b18) red | M13 |
| C8(b19) | scanner detects parseFloat | `parseFloat(x)` | one `parse_float` record | MUT-04-31 `test/helpers/proposales-arithmetic-scan.ts` · parseFloat detection · disable it → C8(b19) red | M13 |
| C8(b20) | scanner detects parseInt | `parseInt(x)` | one `parse_int` record | MUT-04-32 `test/helpers/proposales-arithmetic-scan.ts` · parseInt detection · disable it → C8(b20) red | M13 |
| C8(c) | scanner ignores literal concatenation | `"a" + "b"` | `[]` | MUT-04-33 `test/helpers/proposales-arithmetic-scan.ts` · literal-concatenation exclusion · report it as `add` → C8(c) red | M13 |
| C8(d) | scanner ignores text that has no AST operator | `"a + b"`, `` `${a}-${b}` `` | `[]` | — | M13 |

Criteria: 8 (C1–C8), 75 rows (a table line is one row; a lettered span counts its letters). Named mutations: 33.

## Notes

- The url returned by create is documented as "the URL to view the proposal"; the origin check is a feature concern (R11, phase 14). The client only requires an absolute `https:` URL.
- `content_id` is an int64 on the wire; `Number(variationId)` inside the mapper is a **conversion**, not arithmetic, and lives in `mappers.ts` (not in the pricing mapper). Add a comment.
- Fixture shapes come from evidence §8.1/§8.3; scrub any real identifiers except the two the evidence doc already publishes (`188558`/`188485`).
- Projection gate: mandatory (ranks 1, 3, 8, 13).

## Review log

*(append-only)*

**Projection fold — round 0 (2026-09-05, coordinator).** Consumed
`handoffs/reviewer/phase-04-projection-round-0.reviewer.md`
(`AMENDMENTS_REQUIRED`). Owner cards resolved explicitly: **Card 1 → A** — null/absent
vendor status is omitted while an unrecognised non-null value becomes `"unknown"`; **Card
2 → A** — all money/identity fields remain strict, while omitted display-only `optional`
and `package_split` remain absent (never defaulted). These are plan/skeleton refinements,
not an intention semantic change; intention status remains `RATIFIED`.

All ledger rows are routed. The master registry now owns the lib `AppliedPricing` available
arm, the matching feature-schema optionality, metadata property names, fake surface, and
test-helper location (D1, D7, D10, D14). This plan now makes outbound schema parsing live
on the production POST path; fixes mapper clock/types, snake→camel ownership, strict
currency normalisation, tax-options mapping, status rules, read-back optionality, fake
wire equivalence, and search fixture location (D2–D9, D11–D17). The AST scanner has a
closed kind vocabulary plus separately mutable detection/exclusion rows. Criteria were
re-derived at **8 / 75 / 33**; master-plan totals were re-derived with the same delta.
Projection findings F1–F12 and RC1–RC10 are resolved by those amendments; no owner
decision or delegated freedom remains open.

**Implementation — round 1 (2026-09-05, Codex).** Implemented the complete Proposales
proposal adapter surface in the declared 17-path perimeter: strict create request and
metadata mapping, production-path outbound parsing, HTTPS create response mapping,
generation-id recovery search with exact row re-verification, read-back schemas and
mapping, arithmetic-free Applied Pricing, the AST helper, scrubbed fixtures, and the
full fake surface. The integration README now describes the three operations, metadata,
read-back mapping, and retry policy.

The implementation re-emits the selected contracts from the master plan: runtime
boundaries, feature placement, server errors/idempotency, data contracts, integrations,
security, testing, anti-patterns, and documentation. No additional contract was needed.
The lib remains server-only and no feature, transport, persistence, price write, or
Phase-14 recovery/create decision was added. The read-back quantity schema follows the
ratified §17A.12 vendor `number` contract, including fractional quantities, despite the
shorter task sentence saying "required integers". The default Vitest project does not
collect `test/helpers/**`; the scanner cases are mirrored in the collected pricing test,
and the dedicated helper test was run with a temporary L1 config without changing the
out-of-scope Vitest configuration.

Pre-edit baseline was captured after the phase tests were authored and before production
implementation: the targeted phase command reported 4 files, 14 failing tests, and 24
passing tests; the helper test was not collected by the default project. Closing targeted
evidence is 4 files / 67 tests green, plus 1 helper file / 22 tests green under the
temporary helper-only config. All 33 named mutations were applied at their declared
sites, observed red on the named assertion, and reverted. Documentation impact review
found the integration README incomplete after the new operations, so it was updated;
no other durable documentation became false or incomplete. No architecture graph is
present.
