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

`src/lib/proposales/schemas.ts`, `mappers.ts`, `mappers.test.ts`, `applied-pricing.mapper.ts`, `applied-pricing.mapper.test.ts`, `client.ts`, `client.test.ts`, `fake.ts`, `fake.test.ts`, `index.ts`, `README.md`, `fixtures/proposal-create-response.json`, `fixtures/proposal-search.json`, `fixtures/proposal-readback.consistent.json`, `fixtures/proposal-readback.inconsistent.json`, `src/lib/proposales/arithmetic-scan.ts` (test helper: a TypeScript-AST scanner) + `arithmetic-scan.test.ts` — 17 paths.

## Implementation tasks (ordered)

1. `schemas.ts`: `createProposalRequestSchema` — **`z.strictObject`** with exactly `company_id`, `language`, `title_md?`, `description_md?`, `recipient?` (strict: `first_name?`, `last_name?`, `email?`, `phone?`, `company_name?`), `data` (strict: the three keys, all `z.string()`), `blocks` (array of strict `{ content_id: int, type: z.literal("product-block"), quantity?: number, optional?: boolean }`). **Do not declare** `unit_value_*`, `package_split`, `currency`, `tax_options`, `attachments`, `tracking`, `invoicing*`, `background_*`. `proposalMutationResponseSchema`, `proposalSearchResponseSchema` (rows: `uuid`, `series_uuid?`, `status`, `url`, `data: z.record(z.string(), z.unknown())`), `proposalReadbackResponseSchema` (§17A.12 "In": `value_without_tax`, `value_with_tax` as `z.number().int()`, `currency`, `tax_options?`, `series_uuid?`, `status`, `blocks[]` with `content_id`, `quantity: z.number()`, `optional`, `currency?`, the four `unit_value_*` as `z.number().int()`, `package_split[]` with `type`, `vat?: z.number()`, `value_without_tax?: int`, `value_with_tax?: int`). `status` parsed as the documented enum with unknown → `"unknown"` (display-only, 06 §6).
2. `mappers.ts`: `toCreateProposalRequest(input: CreateProposalDraftInput, ctx: { companyId, now })` assembled **only from spreads of per-field helpers** (`quantityField(f)`, `optionalField(f)`, `recipientField(r)`, `titleField`, `descriptionField`), each returning `{}` or `{ key: value }`; no `??`, `||`, default parameters, or `undefined`-valued keys; `data` = exactly the three keys with `formatIsoTimestamp(ctx.now())`. `toCreatedDraft`, `toRecoveredSummary`, `toProposalReadback` (epoch fields, if any are consumed, converted here).
3. `applied-pricing.mapper.ts`: `toAppliedPricing(readback: ProposalReadback): AppliedPricing` — renames, wraps integers into `Money` with **the proposal's** `currency`, carries `quantity`, `vat`, `blockCurrency` verbatim, adds `warnings: [{ kind: "block_currency_differs", contentId }]` by string inequality. The file contains no arithmetic operator, `Math.*`, `toFixed`, `Number(`, `parseFloat`, numeric comparison, or numeric default.
4. `arithmetic-scan.ts` (test helper, not shipped code — lives beside the mapper, imported only by tests): `findArithmetic(sourceText): Array<{ line, kind }>` using `typescript`'s `createSourceFile` and a walk over `BinaryExpression` (`+ - * / %` and their compound assignments, `< <= > >=`), `PrefixUnaryExpression` with `-`, and `CallExpression`/`PropertyAccess` to `Math.*`, `toFixed`, `Number`, `parseFloat`, `parseInt`. Template literals and string concatenation of two string literals are excluded by checking operand kinds.
5. `client.ts`: `createProposalDraft(input)` → one `POST /v3/proposals` via `http.post` (never retried; `company_id` in body), parse `ProposalMutationResponse`, return `{ proposalUuid, url }` (url parsed as absolute `https:` URL; origin is **not** checked here — R11 puts that in the feature). `findProposalsByGenerationId(id)` → `GET /v3/proposal-search` with query exactly `company_id`, `filter[proposal_copilot_generation_id]`, `limit = PROPOSAL_SEARCH_LIMIT`; parse; **keep only rows where `row.data[PROPOSAL_METADATA_KEYS.generationId] === id`** (strict string equality); return summaries. `getProposal(uuid)` → `GET /v3/proposals/{encodeURIComponent(uuid)}` (idempotent read; retry policy of phase 3), parse, map.
6. `fake.ts`: `createProposalDraft(input)` — records `{ op, input }` and **the wire request the real mapper would produce** (the fake calls `toCreateProposalRequest` so consumers can compare bytes), increments `writes`, stores a draft `{ uuid: deps.newUuid(), url: \`${editorOrigin}/p/${uuid}\`, request, readback }` where `readback` is the readback fixture supplied by the test (`storedReadbacks` map) — the fake never computes totals (rule 5); `findProposalsByGenerationId` filters `stored` by the data key; `getProposal` returns the stored readback or throws the configured error; `failNext(op, error)` queues one failure per op. `assertNoWrites()` throws when `writes > 0`.
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
| C1(i) | no `undefined` values anywhere | any of the above | `JSON.stringify(request)` and `Object.entries` deep-walk show no `undefined` value | — | §17A.5 |
| C2(a–h) | price fields unrepresentable, one row per key | a valid request object plus one of `unit_value_with_discount_without_tax`, `unit_value_with_discount_with_tax`, `unit_value_without_discount_without_tax`, `unit_value_without_discount_with_tax`, `package_split` (on a block), block `currency`, proposal `currency`, `tax_options` | `createProposalRequestSchema.safeParse` fails; issue path names the key | MUT-04-3 `schemas.ts` · block schema · declare `currency: z.string().optional()` → C2(f) red | M9, M1, §17A.5, crit 16 |
| C2(i) | mapper source never names them | read `mappers.ts` text | contains none of the eight key names | — | crit 16 |
| C3(a) | metadata keys exact | any input | `Object.keys(request.data)` deep-equals `[proposal_copilot_source, proposal_copilot_generation_id, proposal_copilot_created_at]` (order irrelevant, set equal, length 3) | MUT-04-4 `mappers.ts` · data assembly · add `proposal_copilot_model: "x"` → C3(a) red | §17A.11, M14 |
| C3(b) | values are strings | | every `typeof === "string"` | — | §17A.11 |
| C3(c) | source marker | | `=== "proposal-copilot"` | — | §17A.11 |
| C3(d) | generation id verbatim | | equals `input.generationId` | — | M8, §17A.11 |
| C3(e) | created_at from clock | `now` → epoch 0 | `=== "1970-01-01T00:00:00.000Z"` | — | §17A.16 |
| C3(f) | company and language | | `company_id === ctx.companyId`; `language === input.language` | — | §17A.11 |
| C3(g) | block wire shape | block content `"188485"` | `blocks[0]` deep-equals `{ content_id: 188485, type: "product-block" }` (+ quantity/optional only when known) | — | §17A.5, evidence §3 |
| C3(h) | fake records the wire request | `fake.createProposalDraft(input)` | `fake.calls` last entry `{ op: "createProposalDraft", request }` with `request` deep-equal to `toCreateProposalRequest(input, ctx)`; `fake.writes === 1`; `assertNoWrites()` throws | — | M3, M5 |
| C4(a) | search path | spy | `GET /v3/proposal-search` | — | M14 |
| C4(b) | query keys exact | | keys set-equal to `["company_id", "filter[proposal_copilot_generation_id]", "limit"]` | MUT-04-5 `client.ts` · search query · remove `limit` → C4(b) red | M14, §17A.11 |
| C4(c) | limit is the documented maximum | read `openapi.json` `limit.maximum` at test time | `PROPOSAL_SEARCH_LIMIT === maximum` and the query carries it | — | M14 |
| C4(d) | forbidden params absent | | none of `recipient_email`, `exclude_revision_drafts`, `include_archived` | — | §17A.11 |
| C5(a) | verified row kept | fixture row with `data.proposal_copilot_generation_id === id` | included | — | M14 |
| C5(b) | mismatching row dropped | row with another id | excluded | MUT-04-6 `client.ts` · verification filter · delete it → C5(b) red | M14 |
| C5(c) | case differs | same id uppercase | excluded (exact equality) | — | M14 |
| C5(d) | key missing | row with `data: {}` | excluded | — | M14 |
| C5(e) | summary shape | | `{ proposalUuid, seriesUuid?, status, url, generationId }` | — | M14 |
| C6(a) | consistent read-back verbatim | `proposal-readback.consistent.json` | `totalWithoutTax.amountMinor`, `totalWithTax.amountMinor`, each block's four unit values equal the fixture integers | — | M13, crit 18 |
| C6(b) | inconsistent read-back verbatim | `proposal-readback.inconsistent.json` (totals ≠ Σ unit × quantity) | reported exactly as stored | MUT-04-7 `applied-pricing.mapper.ts` · total mapping · replace with the sum of block `unit_value_with_discount_without_tax × quantity` → C6(b) red | M13, §17A.12 |
| C6(c) | fractional quantity | `quantity: 1.5` | carried as `1.5` | — | §17A.12 |
| C6(d) | vat carried | `vat: 0.25` | `packageSplit[0].vat === 0.25` | — | §17A.12 |
| C6(e) | missing money field | fixture without `value_with_tax` | `getProposal` throws `schema_mismatch`; never `0` | MUT-04-8 `schemas.ts` · readback · `.default(0)` on `value_with_tax` → C6(e) red | M13 |
| C7(a) | currency from the proposal | proposal `EUR`, block `currency: "SEK"` | every `Money.currency === "EUR"` | — | M13, §17A.12 |
| C7(b) | block currency warning | same | `warnings` contains `{ kind: "block_currency_differs", contentId }`; `blockCurrency === "SEK"` | — | §17A.12 |
| C7(c) | equal or absent | block `EUR` / block without currency | no warning | — | §17A.12 |
| C8(a) | mapper is arithmetic-free | `findArithmetic(read applied-pricing.mapper.ts)` | `[]` | MUT-04-9 `applied-pricing.mapper.ts` · add `const t = a + b` → C8(a) red | M13, invariant 17 |
| C8(b) | the scanner can see arithmetic | planted strings: `a + b`, `a - b`, `a * q`, `x / 100`, `Math.round(x)`, `x.toFixed(2)`, `a < b`, `-x` | each reported with its kind (8 rows) | — | M13 (charter rule 15) |
| C8(c) | the scanner ignores strings | `"a + b"`, `` `${a}-${b}` `` | not reported | — | M13 |

Criteria: 8 (C1–C8), 46 rows (a table line is one row; a lettered span counts its letters). Named mutations: 9.

## Notes

- The url returned by create is documented as "the URL to view the proposal"; the origin check is a feature concern (R11, phase 14). The client only requires an absolute `https:` URL.
- `content_id` is an int64 on the wire; `Number(variationId)` inside the mapper is a **conversion**, not arithmetic, and lives in `mappers.ts` (not in the pricing mapper). Add a comment.
- Fixture shapes come from evidence §8.1/§8.3; scrub any real identifiers except the two the evidence doc already publishes (`188558`/`188485`).
- Projection gate: mandatory (ranks 1, 3, 8, 13).

## Review log

*(append-only)*
