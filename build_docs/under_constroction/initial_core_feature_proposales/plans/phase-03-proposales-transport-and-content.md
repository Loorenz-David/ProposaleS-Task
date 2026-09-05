---
plan: 3
phase: Proposales adapter — transport, error translation, content read
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 3 — Proposales adapter: transport, error translation, content read

## Goal

Create `src/lib/proposales/` with the transport (`http.ts`: base URL, bearer auth, `company_id`, timeout, bounded retry on idempotent reads only), the total error translation of §17A.13, the content read operations (`listContent`, `getContent`) and the company read (`getCompany`, owner card 1 → A) with wire schemas and the epoch→ISO mapper, the recording fake's read half, and the integration README.

**Not in this phase:** proposal create, recovery search, get-proposal read-back, Applied Pricing (phase 4). No feature code.

## Read first

1. Master plan §5 (R10), §6.1, §6.3 (`ProposalesFailureReason`), §6.4 (`ContentItem`, `ProposalesClient` — implement only the three read methods now; declare the interface with all six so phase 4 fills it), §6.5 (`PROPOSALES_*`, `MAX_UPSTREAM_MESSAGE_CHARS`), §6.6 (`createFakeProposalesClient`), §9 rules 3, 5, §10.4.
2. Intention §17A.13 (Proposales table, what may cross), §17A.8 (retrieval paragraph), §17A.16 (time), §12.1, §10.1.
3. Evidence doc §1, §2, §3, §6 (timestamps), §7.
4. `api-documentation/proposales/openapi.json`: `GET /v3/content` parameters and `ContentItem`; `GET /v3/companies` and `Company` (`currency`, `tax_mode`); the error schema. Evidence §8.1 (the endpoint returned `currency` and `tax_mode` at runtime).
5. Contracts: `07-integrations.md` §1–§6, §10; `06-data-contracts-and-validation.md` §2, §3, §5, §6, §7; `04-server-architecture.md` §6; `10-security-and-trust-boundaries.md` §2, §4, §7, §8; `11-testing-principles.md` §2–§3 (integration client row); `14-documentation-principles.md` §9.

## Dependencies (gate)

Phase 2 `APPROVED`.

## Files expected to change

`src/lib/proposales/index.ts`, `http.ts`, `http.test.ts`, `errors.ts`, `errors.test.ts`, `schemas.ts`, `mappers.ts`, `mappers.test.ts`, `client.ts`, `client.test.ts`, `fake.ts`, `fake.test.ts`, `fixtures/content-list.json`, `fixtures/error-400-issues.json`, `README.md` — 15 new files.

## Implementation tasks (ordered)

1. `errors.ts`: `ProposalesError extends IntegrationError` with `details.system = "proposales"`; `fromUpstream({ status?, bodyText?, parsedBody?, operation, kind: "http" | "transport" | "timeout" | "invalid_body" | "schema_mismatch" })` implementing the 11-reason table of §17A.13 exactly, `retryable` per table; the message is `error.message` from the body **only** when the body parsed as `{ error: { message: string } }` and `message.length ≤ MAX_UPSTREAM_MESSAGE_CHARS`, else the fixed generic message; `error.issues` mapped to `details.issues: Array<{ path: string[], message: string }>` under the same cap; raw body, headers, URL go only to `cause`.
2. `http.ts`: `import "server-only"`; `createProposalesHttp({ fetch = globalThis.fetch, apiKey, companyId, baseUrl = PROPOSALES_BASE_URL, timeoutMs = PROPOSALES_TIMEOUT_MS, now, sleep })`; `get(path, query, { operation, idempotent: true })` retries on `retryable` up to `PROPOSALES_READ_MAX_ATTEMPTS` with backoff `PROPOSALES_READ_BACKOFF_MS × attempt`, capped by `PROPOSALES_READ_TOTAL_MS` measured with `now()`; `post(path, body, { operation })` never retries. Every request: `AbortController` timeout, `Authorization: Bearer <apiKey>`, `Accept: application/json`, JSON body encoding, `company_id` added to the query for GET and to the body for POST (per endpoint; evidence §1). Non-2xx → `ProposalesError`; body not JSON → `invalid_body`; abort → `timeout`; `fetch` rejection → `transport`.
3. `schemas.ts`: `contentItemResponseSchema` (only the keys used: `product_id`, `variation_id`, `title`, `description`, `created_at`, `images?`), `contentListResponseSchema`, `errorBodySchema`. Strip-by-default; no `.passthrough()`. `companyListResponseSchema = { data: array of { id: int, currency: string(3), tax_mode: string } }` (only the keys used; strip the rest).
4. `mappers.ts`: `toContentItem(wire)`: ids to strings, `created_at` int64 **milliseconds** → ISO string (comment states the assumption; evidence §6), `description ?? {}` is **not** written — use an explicit `description: wire.description === undefined ? {} : wire.description` with a comment (rule 2's `??` ban applies to the omission path only, but keep this path explicit too). `toCompanyInfo(wire)`: `{ companyId: number, currency: <uppercased 3 letters, parsed by currencyCodeSchema>, taxMode: string }`.
5. `client.ts`: `createProposalesClient(deps)` returning the `ProposalesClient` interface; `listContent()` → `GET /v3/content` with query exactly `{ company_id }`; `getContent(variationId)` → same path with `variation_id`; both `safeParse` the response and throw `schema_mismatch` naming the operation and issue paths on failure. Phase 4 methods are declared on the interface but not implemented (a `createProposalesClient` that omits them fails to compile — implement them in phase 4; in this phase export the interface with the five methods and implement a `Pick` of the two; the factory returns `Pick<ProposalesClient, "listContent" | "getContent">` until phase 4). `getCompany()` → `GET /v3/companies` with **no** query keys (the endpoint lists the user's companies), then selects the entry whose `id === companyId` (the configured one); none → `ProposalesError` reason `not_found_upstream`, `retryable: false`, `operation: "getCompany"`, no `status`. One read; retried like any read.
6. `fake.ts`: `createFakeProposalesClient({ catalog = [] })` with `calls`, `listContent`/`getContent` from `catalog`; `writes = 0`; `assertNoWrites()`. Phase 4 adds the write half. `company = { companyId, currency: "EUR", taxMode: "standard" }` option; `getCompany()` returns it and records `{ op: "getCompany" }`.
7. `index.ts`: `import "server-only"`; exports the interface type, `createProposalesClient`, `createFakeProposalesClient`, domain types. Default instance `proposalesClient` built from `serverEnv` lazily (a function `getProposalesClient()`), so importing the module in tests does not require the env module beyond the placeholders.
8. `README.md`: endpoints used (so far), configuration ownership, quirks (per-endpoint versions, `company_id` placement, ms timestamps, error body, keys added without version bump), error translation table, retry policy, the reserved metadata prefix `proposal_copilot_` (§17A.11; phase 4 fills the keys). Link the vendored reference; do not paraphrase it.
9. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

All rows use an injected `fetch` double and injected `now`/`sleep`; the offline guard never fires.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | fetch rejects | `fetch` throws `TypeError("ECONNREFUSED")` | `ProposalesError`: `details.reason === "transport"`, `retryable === true`, `status` undefined, `system === "proposales"`, `operation === "listContent"` | — | §17A.13, M6 (crit 9) |
| C1(b) | timeout | `fetch` never resolves; `timeoutMs = 50` | rejects with `reason === "timeout"`, `retryable === true`; the `AbortSignal` handed to `fetch` is aborted | — | §17A.13 |
| C1(c) | 400 with issues | fixture `error-400-issues.json` | `reason === "bad_request"`, `retryable === false`, `status === 400`, `details.issues` equals the mapped `[{ path: string[], message }]` | — | §17A.13 |
| C1(d) | 401 | body `{ error: { message: "Unauthorized" } }` | `unauthenticated_upstream`, false, 401 | — | §17A.13 |
| C1(e) | 403 | | `forbidden_upstream`, false | — | §17A.13 |
| C1(f) | 404 | | `not_found_upstream`, false | — | §17A.13 |
| C1(g) | 409 | | `conflict_upstream`, false | — | §17A.13 |
| C1(h) | 429 | | `rate_limited_upstream`, true | — | §17A.13 |
| C1(i) | 503 | | `server_error`, true | — | §17A.13 |
| C1(j) | 418 (other 4xx) | | `bad_request`, false | — | §17A.13 |
| C1(k) | non-JSON body | 200 with `<html>` | `invalid_body`, false | — | §17A.13 |
| C1(l) | JSON failing schema | 200 with `{ "unexpected": 1 }` for `listContent` | `schema_mismatch`, false, `operation === "listContent"`, `details.issues` paths present, body text absent from `JSON.stringify(toErrorDto(err))` | — | §17A.13 |
| C2(a) | documented message crosses | 404 body `{ error: { message: "Company not found" } }` | `err.message === "Company not found"` | — | §17A.13 |
| C2(b) | over-cap message does not | message of `MAX_UPSTREAM_MESSAGE_CHARS + 1` chars | `err.message` is the generic message; original present in `err.cause` | — | §17A.13 |
| C2(c) | non-string message | `{ error: { message: 123 } }` | generic message | — | §17A.13 |
| C2(d) | raw body never crosses | 502 body `"RAW-BODY-SENTINEL"` | `RAW-BODY-SENTINEL` absent from `err.message`, `JSON.stringify(err.details)`, and `JSON.stringify(toErrorDto(err))`; present in `String(err.cause)` | MUT-03-1 `errors.ts` · `fromUpstream` · set `details.body = bodyText` → C2(d) red | §17A.13, M6 |
| C2(e) | URL never crosses | any failure | the request URL (contains `api.proposales.com`) absent from message and details | — | §17A.13, 10 §2 |
| C3(a) | read retried on retryable | `listContent`, fetch returns 503, 503, 200 | resolves; `fetch` called 3 times; `sleep` called with increasing delays | — | §17A.12 (read-back bounds), 07 §5 |
| C3(b) | read not retried on non-retryable | 401 | `fetch` called once | — | §17A.13 |
| C3(c) | attempts bounded | always 503 | rejects after exactly `PROPOSALES_READ_MAX_ATTEMPTS` calls | — | §17A.12 |
| C3(d) | total elapsed cap | `now` advances past `PROPOSALES_READ_TOTAL_MS` after the first failure | rejects after 1 call (no second attempt) | — | §17A.12 |
| C3(e) | write never retried | `http.post("/v3/proposals", {}, …)` with 503 | rejects; `fetch` called once | MUT-03-2 `http.ts` · `post` · route through the retrying path → C3(e) red | §17A.11 (create never auto-retried), M5 |
| C4(a) | listContent request shape | spy on `fetch` | URL path `/v3/content`; query keys exactly `["company_id"]` with the configured value; method `GET` | MUT-03-3 `client.ts` · `listContent` · add `include_archived=true` → C4(a) red | §17A.8 (company_id only; no filters) |
| C4(b) | auth header | | `Authorization` header present and starts with `Bearer `; the test asserts presence only | — | 10 §2 |
| C4(c) | getContent request shape | `getContent("188485")` | query keys exactly `["company_id","variation_id"]`, `variation_id === "188485"` | — | §17A.8 |
| C4(d) | getContent miss | empty list response | resolves `null` | — | §17A.8 |
| C4(e) | fake records reads | `createFakeProposalesClient({ catalog })` | `listContent()` returns the catalog; `calls` equals `[{ op: "listContent" }]`; `writes === 0`; `assertNoWrites()` does not throw | — | M3 (recording fake) |
| C5(a) | parse + map | `fixtures/content-list.json` (2 items, one with images) | `ContentItem[]` with `variationId`/`productId` strings, `title`/`description` records, `images` present only where given | — | §17A.8, §17A.16 |
| C5(b) | unknown keys stripped | fixture item carries `integration_metadata` and `future_key` | neither key present on the domain object | — | 06 §3 |
| C5(c) | epoch → ISO (ms assumed) | `created_at: 1757059200000` | `createdAt === "2025-09-05T08:00:00.000Z"`; test name states "assumes milliseconds" | — | §17A.16 |
| C5(d) | missing description | item without `description` | `description` deep-equals `{}` | — | §17A.8 |
| C6(a) | getCompany request shape | spy on `fetch` | path `/v3/companies`; method `GET`; query keys exactly `[]`; auth header present | — | §12.1 (card 1 → A), 07 §1 |
| C6(b) | selects the configured company | `fixtures/companies.json` (two companies; the configured id is the second, `currency: "eur"`, `tax_mode: "standard"`) | resolves `{ companyId, currency: "EUR", taxMode: "standard" }`; no other key | MUT-03-4 `client.ts` · `getCompany` · take `data[0]` → C6(b) red | §12.1, 06 §6 (enum/id handling) |
| C6(c) | configured company absent | fixture without the configured id | `ProposalesError` `not_found_upstream`, `retryable === false`, `operation === "getCompany"`, `status` undefined | — | §17A.13 |
| C6(d) | fake | `createFakeProposalesClient({ company })` | `getCompany()` returns `company`; `calls` gains `{ op: "getCompany" }`; `writes === 0` | — | rule 5 |

Criteria: 6 (C1–C6), 35 rows (a table line is one row; a lettered span counts its letters). Named mutations: 4.

## Notes

- `company_id` for POST goes in the body (evidence §4 `CreateProposalRequest.company_id`), for GET in the query — the transport takes a per-call placement flag; phase 4 uses the body placement.
- The 12-row table of §17A.13 collapses to 11 reasons because "any other 4xx" shares `bad_request`; C1 has 12 rows so both sources of `bad_request` are exercised.
- Do not implement pagination (none exists, evidence §1).
- Projection gate: mandatory (error precedence and taxonomy, rank 10).

## Review log

*(append-only)*
