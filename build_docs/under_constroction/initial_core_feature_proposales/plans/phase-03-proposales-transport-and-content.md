---
plan: 3
phase: Proposales adapter — transport, error translation, content read
state: PROMPT_READY
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 3 — Proposales adapter: transport, error translation, content read

## Goal

Create `src/lib/proposales/` with the transport (`http.ts`: base URL, bearer auth, timeout, bounded retry on idempotent reads only), the total error translation and status-before-body precedence of §17A.13, the content read operations (`listContent`, `getContent`) and the company read (`getCompany`, owner card 1 → A) with wire schemas and the bounded epoch→ISO mapper, the recording fake's read half, and the integration README.

**Not in this phase:** proposal create, recovery search, get-proposal read-back, Applied Pricing (phase 4). No feature code.

## Read first

1. Master plan §5 (R10), §6.1, §6.3 (`ProposalesFailureReason`), §6.4 (`ContentItem`, `ProposalesClient` — declare all six, implement exactly the three reads now), §6.5 (`PROPOSALES_*`, upstream-error constants), §6.6 (`createFakeProposalesClient`), §9 rules 3, 5, §10.4.
2. Intention §17A.13 (Proposales table, what may cross), §17A.8 (retrieval paragraph), §17A.16 (time), §12.1, §10.1.
3. Evidence doc §1, §2, §3, §6 (timestamps), §7.
4. `api-documentation/proposales/openapi.json`: `GET /v3/content` parameters and `ContentItem`; `GET /v3/companies` and `Company` (`currency`, `tax_mode`); the error schema. Evidence §8.1 (the endpoint returned `currency` and `tax_mode` at runtime).
5. Contracts: `07-integrations.md` §1–§6, §10; `06-data-contracts-and-validation.md` §2, §3, §5, §6, §7; `04-server-architecture.md` §6; `10-security-and-trust-boundaries.md` §2, §4, §7, §8; `11-testing-principles.md` §2–§3 (integration client row); `14-documentation-principles.md` §9.

## Dependencies (gate)

Phase 2 `APPROVED`.

## Files expected to change

`src/lib/errors/app-error.ts`, `src/lib/errors/app-error.test.ts`, `src/lib/proposales/index.ts`, `http.ts`, `http.test.ts`, `errors.ts`, `errors.test.ts`, `schemas.ts`, `mappers.ts`, `mappers.test.ts`, `client.ts`, `client.test.ts`, `fake.ts`, `fake.test.ts`, `fixtures/content-list.json`, `fixtures/companies.json`, `fixtures/error-400-issues.json`, `README.md` — 18 files (16 new; the two shared-error files are amended).

## Implementation tasks (ordered)

1. `app-error.ts` / `app-error.test.ts`: extend `IntegrationErrorOptions` with `issues?: ErrorIssue[]` and preserve it as `details.issues`; prove the constructor shape. `errors.ts` (also `import "server-only"`): `ProposalesError extends IntegrationError` with `details.system = "proposales"`. `fromUpstream({ status?, bodyText?, parsedBody?, operation, kind: "http" | "transport" | "timeout" | "invalid_body" })` owns all transport/HTTP/body outcomes; `schemaMismatch(operation, zodError)` owns response-schema failures; `notFound(operation)` owns the configured-company-absent case. For HTTP outcomes, classify non-2xx status **before** body parsing (§17A.13): 429/5xx retain their retryable reason even with an unreadable body; `invalid_body` is only a 2xx unreadable body. Forward `error.message` only when it is a string within `MAX_UPSTREAM_MESSAGE_CHARS`, otherwise `GENERIC_UPSTREAM_ERROR_MESSAGE`. Map at most `MAX_UPSTREAM_ISSUES` issues in source order, `path.map(String)`, replacing an over-cap issue message with the generic message. Raw body, headers, and URL live only in `cause`, whose exact shape is `new Error(bodyText ?? GENERIC_UPSTREAM_ERROR_MESSAGE, { cause: { status, headers, url } })`; criteria inspect `cause.message`, never `String(cause)`.
2. `http.ts` (`import "server-only"`): `createProposalesHttp({ fetch = globalThis.fetch, apiKey, baseUrl = PROPOSALES_BASE_URL, timeoutMs = PROPOSALES_TIMEOUT_MS, now = performance.now, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) })`; it is endpoint-agnostic and passes caller-provided `query` through verbatim. Build query strings with `URLSearchParams`. `get(path, query, { operation, idempotent: true })` alone retries retryable failures up to `PROPOSALES_READ_MAX_ATTEMPTS`, with backoff `PROPOSALES_READ_BACKOFF_MS × attempt` and an overall `PROPOSALES_READ_TOTAL_MS` deadline: each attempt's abort delay is `min(timeoutMs, remaining deadline)` and no retry starts after it. On attempts/deadline exhaustion, rethrow the last upstream `ProposalesError`. `post(path, body, { operation })` never enters that loop. Every request uses an `AbortController`, `Authorization: Bearer <apiKey>`, `Accept: application/json`, and JSON body encoding. Test `controller.signal.aborted` first after a fetch rejection (timeout); an un-aborted rejection is `transport`.
3. `schemas.ts` (`import "server-only"`): `contentItemResponseSchema` keeps only `product_id`, `variation_id`, `title`, optional `description`, bounded `created_at`, and optional `images`; `contentListResponseSchema`, `errorBodySchema`, and `variationIdSchema` (`^[0-9]+(,[0-9]+)*$`). `created_at` is an integer whose `Date` ISO output is accepted by `isoTimestampSchema`; the response schema thereby rejects out-of-range vendor epochs before a mapper executes. Strip-by-default; no `.passthrough()`. `companyListResponseSchema` keeps `{ id: int, currency: uppercase-then-validated currencyCodeSchema, tax_mode: z.enum(["standard", "simplified", "tax-free", "none"]) }`; any malformed currency or unknown enum is a response `schema_mismatch`.
4. `mappers.ts` (`import "server-only"`): `toContentItem(wire)` converts ids to strings and the already-bounded millisecond `created_at` to ISO with the evidence §6 assumption comment; write `description: wire.description === undefined ? {} : wire.description` with a comment. `toCompanyInfo(wire)` maps the already-normalized currency to `{ companyId, currency, taxMode }`.
5. `client.ts` (`import "server-only"`): declare all six `ProposalesClient` methods but return `Pick<ProposalesClient, "getCompany" | "listContent" | "getContent">` and implement exactly those three. The client, not transport, injects `company_id`: `listContent` queries exactly `{ company_id }`; `getContent` first parses `variationId` with `variationIdSchema`, throwing `ValidationError` on failure before a request, then queries `{ company_id, variation_id }`; `getCompany` queries exactly `{}` and selects the configured id. Each response `safeParse` failure throws `ProposalesError.schemaMismatch`; absent configured company throws `ProposalesError.notFound`, with no status. All three are idempotent reads.
6. `fake.ts` (`import "server-only"`): phase 3 creates only `catalog`, optional `company`, `calls`, `writes = 0`, `assertNoWrites()`, and the three read methods. It records `{ op }` for no-argument methods and `{ op, input }` only for `getContent`; it creates no `proposals`, `editorOrigin`, `failNext`, or `stored` scaffolding (phase 4 owns that write half). `company` defaults to `{ companyId, currency: "EUR", taxMode: "standard" }`; `getCompany()` returns it and records `{ op: "getCompany" }`.
7. `index.ts` (`import "server-only"`): exports the interface type, the factories, and domain types. `getProposalesClient(deps = {})` lazily constructs the default with `serverEnv`, while allowing tests to override only `fetch`, `now`, and `sleep`; it is the sole default-configuration seam.
8. `README.md`: endpoints used (so far), configuration ownership, quirks (per-endpoint versions, `company_id` placement, ms timestamps, error body, keys added without version bump), error translation table, retry policy, the reserved metadata prefix `proposal_copilot_` (§17A.11; phase 4 fills the keys). Link the vendored reference; do not paraphrase it.
9. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

All rows use an injected `fetch` double and injected `now`/`sleep`; the offline guard never fires.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | fetch rejects | `fetch` throws `TypeError("ECONNREFUSED")` | `ProposalesError`: `details.reason === "transport"`, `retryable === true`, `status` undefined, `system === "proposales"`, `operation === "listContent"` | — | §17A.13, M6 (crit 9) |
| C1(b) | timeout | `fetch` never resolves; `timeoutMs = 50` | rejects with `reason === "timeout"`, `retryable === true`; the `AbortSignal` handed to `fetch` is aborted | — | §17A.13 |
| C1(c) | 400 with issues | fixture `error-400-issues.json` contains `MAX_UPSTREAM_ISSUES + 1` ordered issues, including `path: ["items", 0, "quantity"]` and one over-cap message | `reason === "bad_request"`, `retryable === false`, `status === 400`; `details.issues` is exactly the first `MAX_UPSTREAM_ISSUES` fixture issues in source order with every path segment stringified and the over-cap message replaced by `GENERIC_UPSTREAM_ERROR_MESSAGE` | MUT-03-7 `errors.ts` · `fromUpstream` · remove `path.map(String)` → C1(c) red | §17A.13 |
| C1(d) | 401 | body `{ error: { message: "Unauthorized" } }` | `unauthenticated_upstream`, false, 401 | — | §17A.13 |
| C1(e) | 403 | | `forbidden_upstream`, false | — | §17A.13 |
| C1(f) | 404 | | `not_found_upstream`, false | — | §17A.13 |
| C1(g) | 409 | | `conflict_upstream`, false | — | §17A.13 |
| C1(h) | 429 | | `rate_limited_upstream`, true | — | §17A.13 |
| C1(i) | 503 | | `server_error`, true | — | §17A.13 |
| C1(j) | 418 (other 4xx) | | `bad_request`, false | — | §17A.13 |
| C1(k) | non-JSON body | 200 with `<html>` | `invalid_body`, false | — | §17A.13 |
| C1(l) | JSON failing schema | 200 with `{ "unexpected": 1 }` for `listContent` | `schema_mismatch`, false, `operation === "listContent"`, `details.issues` paths present, body text absent from `JSON.stringify(toErrorDto(err))` | — | §17A.13 |
| C1(m) | retryable status with unreadable body | 503 with `<html>` | `server_error`, `retryable === true`, `status === 503`; the read makes the configured retry attempts | MUT-03-8 `errors.ts` · `fromUpstream` · classify an unreadable body before its non-2xx status → C1(m) red | §17A.13 |
| C1(n) | integration-error issue support | `new IntegrationError({ system: "proposales", retryable: false, issues: [{ path: ["data", "0"], message: "bad" }] })` | `details.issues` exactly equals the supplied typed issue array | — | §17A.13, 04 §6 |
| C2(a) | documented message crosses | 404 body `{ error: { message: "Company not found" } }` | `err.message === "Company not found"` | — | §17A.13 |
| C2(b) | over-cap message does not | message of `MAX_UPSTREAM_MESSAGE_CHARS + 1` chars | `err.message === GENERIC_UPSTREAM_ERROR_MESSAGE`; `err.cause` is an `Error` whose `.message` equals the original over-cap body | MUT-03-6 `errors.ts` · `fromUpstream` · drop the length check → C2(b) red | §17A.13 |
| C2(c) | non-string message | `{ error: { message: 123 } }` | generic message | — | §17A.13 |
| C2(d) | raw body never crosses | 502 body `"RAW-BODY-SENTINEL"` | `RAW-BODY-SENTINEL` absent from `err.message`, `JSON.stringify(err.details)`, and `JSON.stringify(toErrorDto(err))`; `err.cause` is an `Error` whose `.message` is exactly `RAW-BODY-SENTINEL` | MUT-03-1 `errors.ts` · `fromUpstream` · set `details.body = bodyText` → C2(d) red | §17A.13, M6 |
| C2(e) | URL never crosses | any failure | the request URL (contains `api.proposales.com`) absent from message and details | — | §17A.13, 10 §2 |
| C3(a) | read retried on retryable | `listContent`, fetch returns 503, 503, 200 | resolves; `fetch` called 3 times; `sleep` called with increasing delays | — | §17A.12 (read-back bounds), 07 §5 |
| C3(b) | read not retried on non-retryable | 401 | `fetch` called once | — | §17A.13 |
| C3(c) | attempts bounded | always 503 | rejects after exactly `PROPOSALES_READ_MAX_ATTEMPTS` calls with `server_error`, `retryable === true`, `status === 503` | — | §17A.12 |
| C3(d) | total elapsed cap | `now` advances past `PROPOSALES_READ_TOTAL_MS` after the first 503 | rejects after exactly 1 call with that last `server_error`, `retryable === true`, `status === 503`; no second attempt starts | — | §17A.12 |
| C3(e) | write never retried | `http.post("/v3/proposals", {}, …)` with 503 | rejects with `server_error`, `retryable === true`, `status === 503`; `fetch` called exactly once | MUT-03-2 `http.ts` · `post` · route through the retrying path → C3(e) red | §17A.11 (create never auto-retried), M5 |
| C3(f) | total deadline clamps an in-flight read | `fetch` never resolves; `timeoutMs = PROPOSALES_TIMEOUT_MS`; advance fake time to `PROPOSALES_READ_TOTAL_MS` | rejects `timeout` and the signal is aborted at the total deadline, before the longer per-attempt timeout | — | §17A.12, 07 §5 |
| C4(a) | listContent request shape | spy on `fetch` | URL path `/v3/content`; query keys exactly `["company_id"]` with the configured value; method `GET` | MUT-03-3 `client.ts` · `listContent` · add `include_archived=true` → C4(a) red | §17A.8 (company_id only; no filters) |
| C4(b) | auth header | | `Authorization` header present and starts with `Bearer `; the test asserts presence only | — | 10 §2 |
| C4(c) | getContent request shape | `getContent("188485")` | query keys exactly `["company_id","variation_id"]`, `variation_id === "188485"` | — | §17A.8 |
| C4(d) | getContent miss | empty list response | resolves `null` | — | §17A.8 |
| C4(e) | fake records reads | `createFakeProposalesClient({ catalog })` | `listContent()` returns the catalog; `calls` equals `[{ op: "listContent" }]`; `writes === 0`; `assertNoWrites()` does not throw | — | M3 (recording fake) |
| C4(f) | default factory wiring | `getProposalesClient({ fetch, now, sleep })` | its first list read sends `serverEnv.PROPOSALES_COMPANY_ID` as `company_id` and an `Authorization` header beginning `Bearer `; no real fetch is reached | — | 02 §3, 11 §3 |
| C4(g) | every adapter module is server-only | read the seven phase-3 `src/lib/proposales/*.ts` production files | each has `import "server-only";` as its first line | — | 02 §3 |
| C4(h) | variation id rejects untrusted shape | `getContent("188485/../../bad")` with a fetch spy | rejects `ValidationError`; fetch is called exactly zero times | — | 10 §8, 06 §2 |
| C5(a) | parse + map | `fixtures/content-list.json` (2 items, one with images) | `ContentItem[]` with `variationId`/`productId` strings, `title`/`description` records, `images` present only where given | — | §17A.8, §17A.16 |
| C5(b) | unknown keys stripped | fixture item carries `integration_metadata` and `future_key` | neither key present on the domain object | — | 06 §3 |
| C5(c) | epoch → ISO (ms assumed) | `created_at: 1757059200000` | `createdAt === "2025-09-05T08:00:00.000Z"`; test name states "assumes milliseconds" | MUT-03-5 `mappers.ts` · `toContentItem` · multiply `created_at` by 1000 → C5(c) red | §17A.16 |
| C5(d) | missing description | the second fixture item omits `description` | `description` deep-equals `{}` | — | §17A.8, 06 §6 |
| C5(e) | out-of-range epoch | a response item whose integer `created_at` is outside the four-digit ISO Date range | the whole `listContent` read rejects `ProposalesError` `schema_mismatch`, `retryable === false`, `operation === "listContent"`, with an issue path ending `created_at`; no partial catalogue returns | MUT-03-9 `schemas.ts` · `contentItemResponseSchema` · remove the Date/ISO range refinement → C5(e) red | §17A.16, §17A.13 |
| C6(a) | getCompany request shape | spy on `fetch` | path `/v3/companies`; method `GET`; query keys exactly `[]`; auth header present | — | §12.1 (card 1 → A), 07 §1 |
| C6(b) | selects the configured company | `fixtures/companies.json` has exactly two companies; configured id is the second, with `currency: "eur"`, `tax_mode: "standard"` | resolves exactly `{ companyId, currency: "EUR", taxMode: "standard" }` | MUT-03-4 `client.ts` · `getCompany` · take `data[0]` → C6(b) red | §12.1, 06 §6 (enum/id handling) |
| C6(c) | configured company absent | reuse `fixtures/companies.json` with a configured id absent from both entries | `ProposalesError` `not_found_upstream`, `retryable === false`, `operation === "getCompany"`, `status` undefined | — | §17A.13 |
| C6(d) | fake | `createFakeProposalesClient({ company })` | `getCompany()` returns `company`; `calls` gains `{ op: "getCompany" }`; `writes === 0` | — | rule 5 |
| C6(e) | malformed company currency | a company response has a three-character currency that fails the uppercase currency schema | `getCompany` rejects `ProposalesError` `schema_mismatch`, `retryable === false`, `operation === "getCompany"`; no bare `ZodError` escapes | — | §17A.13, 06 §6 |
| C6(f) | unknown company tax mode | a company response has `tax_mode: "future-mode"` | `getCompany` rejects `ProposalesError` `schema_mismatch`, `retryable === false`, `operation === "getCompany"` | — | 06 §6 |

Criteria: 6 (C1–C6), 44 rows (`C1` 14 + `C2` 5 + `C3` 6 + `C4` 8 + `C5` 5 + `C6` 6; a table line is one row). Named mutations: 9 (`C1` 2 + `C2` 2 + `C3` 1 + `C4` 1 + `C5` 2 + `C6` 1).

## Notes

- `company_id` belongs to the endpoint-owning client: phase 3's content reads add it to their GET query and `getCompany` deliberately adds none. Phase 4's create client adds it to the POST body (evidence §4 `CreateProposalRequest.company_id`). The transport never knows an endpoint's company-id placement.
- The 12-condition table of §17A.13 collapses to 11 reasons because "any other 4xx" shares `bad_request`; C1 exercises both sources of `bad_request` and has one extra 503-with-HTML row proving the owner-ratified status-before-body precedence. That row adds no new reason.
- `fixtures/content-list.json` has exactly two items: the first has images, `integration_metadata`, `future_key`, and `created_at: 1757059200000`; the second omits `description`. `fixtures/companies.json` has exactly the two companies pinned in C6(b), and C6(c) changes only the configured id.
- `created_at` range validation belongs to the Proposales wire schema. Do not modify `src/lib/values/timestamp.ts`; its ISO-form contract remains phase 2's approved boundary.
- Do not implement pagination (none exists, evidence §1).
- Projection gate: mandatory (error precedence and taxonomy, rank 10).

## Review log

*(append-only)*

- **Projection round 0 consumed (2026-09-05, coordinator):** `AMENDMENTS_REQUIRED` ledger routed. Owner ratified card 1 → A in intention §17A.13 / §21.4 (status before unreadable response body) and card 2 → A in §17A.16 / §21.4 (out-of-range content epoch fails the full read as `schema_mismatch`). Plan folds D1–D21: shared `IntegrationError` issue support; explicit error constructors and cause shape; client-owned company injection; six-method/three-read interface; complete fixture perimeter; total-read deadline and exact retry outcomes; optional description, closed tax enum, bounded/mapped issue paths, schema-stage currency validation, factory seam, fake surface, all-module `server-only`, abort discriminator, registered defaults/generic message, and variation-id validation. Projection's five delegations remain explicit in its handoff.
