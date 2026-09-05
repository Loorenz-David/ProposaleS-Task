# Proposales integration

This adapter uses `GET /v3/content` for the content catalogue and variation reads,
`GET /v3/companies` to resolve the configured company's currency and tax mode, and the
proposal operations `createProposalDraft`, `findProposalsByGenerationId`, and
`getProposal`.
The vendor reference is the repository's [vendored OpenAPI snapshot](../../../api-documentation/proposales/openapi.json);
vendor documentation is not paraphrased here.

Authentication is owned by the server-only adapter. `PROPOSALES_API_KEY` and
`PROPOSALES_COMPANY_ID` are read from `src/lib/env/server.ts`; the base URL remains the
evidence-backed constant in `http.ts`. The browser never receives either configuration value.

## API quirks and mapping

- Content and company endpoints are versioned independently by their `/v3` paths.
- `company_id` is added by the endpoint-owning content client. The companies endpoint
  deliberately has no query parameter; the transport is endpoint-agnostic.
- Vendor `created_at` values are interpreted as Unix milliseconds and are bounded against
  the application's four-digit UTC ISO timestamp shape before mapping.
- The adapter keeps only the fields it consumes. Unknown response keys are stripped, and a
  missing content description maps to `{}`.
- Error responses use the vendor's `{ error: { message, issues? } }` shape. Public errors
  keep bounded messages and issue paths; raw body, headers, and URL are retained only in the
  error cause for server-side diagnosis.
- Vendor response keys may be added without a version bump, so response schemas remain
  deliberately closed to the fields this application consumes.
- Proposal creation sends exactly the metadata keys `proposal_copilot_source`,
  `proposal_copilot_generation_id`, and `proposal_copilot_created_at`; all values are
  strings. Price fields, proposal/block currency, package splits, and tax options are not
  representable in the create request.
- Recovery searches `GET /v3/proposal-search` with the configured `company_id`, the
  `filter[proposal_copilot_generation_id]` metadata filter, and the documented maximum
  limit. Every returned row is re-verified with exact metadata equality before mapping.
- `getProposal` reads the stored totals, four unit values, quantity, optional flag,
  package split, currency, and tax options. Applied Pricing wraps the integer cents in
  `Money` using the proposal currency and performs no arithmetic; an informational block
  currency mismatch becomes a warning.

## Error translation

| Upstream outcome | `details.reason` | Retryable |
|---|---|---:|
| transport failure | `transport` | yes |
| timeout | `timeout` | yes |
| 400 or other 4xx | `bad_request` | no |
| 401 / 403 / 404 / 409 | corresponding `*_upstream` reason | no |
| 429 | `rate_limited_upstream` | yes |
| 5xx | `server_error` | yes |
| unreadable successful body | `invalid_body` | no |
| response schema failure | `schema_mismatch` | no |

HTTP status is classified before an error body is interpreted, so an unreadable 503 remains
retryable `server_error`; `invalid_body` is only a successful 2xx outcome.

## Retry policy

Only idempotent reads retry. Reads use at most three attempts, linear backoff, and an overall
eight-second deadline; each attempt is bounded by the configured ten-second timeout or the
remaining read deadline, whichever is shorter. POST is single-attempt and is never retried
automatically.
