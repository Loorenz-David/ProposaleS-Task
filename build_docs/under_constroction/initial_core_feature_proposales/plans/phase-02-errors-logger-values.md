---
plan: 2
phase: Errors, logger, shared value shapes
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 2 — Errors, logger, shared value shapes

## Goal

Create the cross-cutting modules every later phase imports: the `AppError` taxonomy and its runtime-neutral `ErrorDto`, the redacting structured logger, and the five value shapes under `src/lib/values/` (Path, KnownOrAbsent, Money, ISO timestamp, UUID v4).

**Not in this phase:** `http.ts` error mapping for Proposales (phase 3); AI provider errors (phase 8); any feature schema.

## Read first

1. Master plan §5 (R6, R9, R12), §6.1, §6.3, §6.4 (the five `lib/values` rows), §9 rules 1, 4.
2. Intention §17A.1 (all four shapes), §17A.2 (Generation ID form), §17A.10 (logging paragraph), §17A.13 (taxonomy map; "what may never cross"), §17A.16 (time).
3. Contracts: `04-server-architecture.md` §6, §10; `06-data-contracts-and-validation.md` §6 (Money, dates, identifiers), §8; `10-security-and-trust-boundaries.md` §7; `03-feature-architecture.md` §3; `12-anti-patterns.md` "Server", "Data and validation".

## Dependencies (gate)

Phase 1 `APPROVED`.

## Files expected to change

`src/lib/errors/app-error.ts`, `src/lib/errors/app-error.test.ts`, `src/lib/errors/error-dto.ts`, `src/lib/errors/error-dto.test.ts`, `src/lib/logger.ts`, `src/lib/logger.test.ts`, `src/lib/values/path.ts`, `src/lib/values/absence.ts`, `src/lib/values/money.ts`, `src/lib/values/timestamp.ts`, `src/lib/values/uuid.ts`, `src/lib/values/values.test.ts` — 12 new files.

## Implementation tasks (ordered)

1. `app-error.ts`: abstract `AppError` (04 §6 shape: `code`, `httpStatus`, `details?`, `cause?`) and the nine subclasses with the codes and statuses of master plan §6.3. `IntegrationError` constructor takes `{ system, status?, retryable, reason?, operation?, message?, cause? }` and places `system`, `status`, `retryable`, `reason`, `operation` in `details`. `ValidationError` takes `{ message?, reason?, issues?: Array<{ path: string[]; message: string }>, ...details }`. No `server-only` here: `error-dto.ts` is runtime-neutral and `app-error.ts` has no runtime dependency; keep both importable from both runtimes (03 §3).
2. `error-dto.ts`: `errorDtoSchema = z.object({ code: z.enum([...9 codes]), message: z.string(), details: z.record(z.string(), z.unknown()).optional() })`; `toErrorDto(error: unknown): ErrorDto` — `AppError` → its fields; `ZodError` → `validation_error` with `details.issues = [{ path: string[], message }]`; anything else → `internal_error` with a fixed generic message. `cause` is never read into the DTO.
3. `logger.ts`: `import "server-only"`; `createLogger(sink: (line: string) => void = console-free default writing to `process.stdout`)`; methods `info/warn/error(event: string, fields?: Record<string, unknown>)`; each call writes exactly one JSON line `{ level, event, time, ...redacted(fields) }`; `redact` replaces the value of any key (case-insensitive, at any depth) in `["authorization", "apikey", "api_key", "token", "password", "secret", "email"]` with `"[redacted]"`; `time` comes from an injected `now` (default `() => new Date()`), formatted with `formatIsoTimestamp`. Export `REDACTED_KEYS`.
4. `values/path.ts`: `pathSchema = z.array(z.string().min(1))`; `formatPath(path)` joins with `.` **for messages only** (never parsed back).
5. `values/absence.ts`: `knownOrAbsentSchema(inner)` → `z.discriminatedUnion("known", [z.strictObject({ known: z.literal(true), value: inner }), z.strictObject({ known: z.literal(false) })])`; type helper `KnownOrAbsent<T>`.
6. `values/money.ts`: `currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/)`; `moneySchema = z.strictObject({ amountMinor: z.number().int(), currency: currencyCodeSchema })`.
7. `values/timestamp.ts`: `isoTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)`; `formatIsoTimestamp(d: Date)` = `d.toISOString()` (already this exact form in V8; the test pins it).
8. `values/uuid.ts`: `UUID_V4_PATTERN` (master plan §6.4), `uuidV4Schema`.
9. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a–i) | taxonomy | one row per class: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `ApprovalRequiredError`, `IntegrationError`, `RateLimitedError`, `InternalError` | `code` and `httpStatus` equal the 04 §6 table (`validation_error`/400, `unauthenticated`/401, `forbidden`/403, `not_found`/404, `conflict`/409, `approval_required`/409, `integration_error`/502, `rate_limited`/429, `internal_error`/500); `instanceof AppError` | — | §17A.13 |
| C2(a) | DTO of an `AppError` | `new ConflictError({ message: "x", details: { proposalUuid: "u" } })` | `toErrorDto` → `{ code: "conflict", message: "x", details: { proposalUuid: "u" } }`; `errorDtoSchema.parse` accepts it | — | §17A.13 |
| C2(b) | `cause` never serialized | same, with `cause: new Error("CAUSE-SENTINEL")` | `JSON.stringify(toErrorDto(err))` does not contain `CAUSE-SENTINEL`; the DTO has no `cause` key | MUT-02-1 `error-dto.ts` · `toErrorDto` · copy `cause` into `details` → C2(b) red | §17A.13 (what may never cross) |
| C2(c) | unknown error | `new Error("INTERNAL-SENTINEL")` | `code === "internal_error"`; message is the fixed generic string; `INTERNAL-SENTINEL` absent from the DTO JSON | — | §17A.13 |
| C2(d) | Zod error | `z.object({ a: z.object({ b: z.number() }) }).safeParse({ a: { b: "x" } }).error` | `code === "validation_error"`; `details.issues` equals `[{ path: ["a","b"], message: <string> }]` (path as `string[]`, never dotted) | — | §17A.1 (Path), 06 §8 |
| C3(a–f) | redaction, one row per key | `logger.info("e", { authorization: "S1", apiKey: "S2", token: "S3", password: "S4", secret: "S5", email: "S6" })` with a capturing sink | the emitted line contains `[redacted]` six times and none of `S1`…`S6` | MUT-02-2 `logger.ts` · `REDACTED_KEYS` · remove `"email"` → C3(f) red | §17A.10 (logs carry paths and counts, never values), 10 §7 |
| C3(g) | nested and case-insensitive | `{ upstream: { Authorization: "S7" } }` | `S7` absent, `[redacted]` present | — | §17A.10 |
| C3(h) | one JSON line per call, with `event` and `time` | `now` injected to epoch 0 | `JSON.parse(line)` succeeds; `event === "e"`; `time === "1970-01-01T00:00:00.000Z"`; sink called exactly once | — | §17A.16 (injected clock) |
| C4(a) | absent is a value | `knownOrAbsentSchema(z.number()).parse({ known: false })` | returns `{ known: false }` | — | M9, §17A.1 |
| C4(b) | missing key is not absence | `z.strictObject({ q: knownOrAbsentSchema(z.number()) }).safeParse({})` | fails; issue path `["q"]` | MUT-02-3 `absence.ts` · schema · make the field optional via `.optional()` on the union → C4(b) red (the wrapping object test must use the exported helper `requiredKnownOrAbsent`, i.e. the schema as exported) | M9 |
| C4(c) | known without value | `{ known: true }` | fails at `["value"]` | — | M9 |
| C4(d) | extra key on absent variant | `{ known: false, value: 1 }` | fails (strict) | — | M9 |
| C4(e) | JSON round trip | `JSON.parse(JSON.stringify({ known: false }))` re-parsed | deep-equals `{ known: false }` | — | M9 |
| C5(a) | integer cents | `{ amountMinor: 1200000, currency: "EUR" }` | parses | — | §17A.1 |
| C5(b) | non-integer | `{ amountMinor: 10.5, currency: "EUR" }` | fails at `["amountMinor"]` (not rounded) | MUT-02-4 `money.ts` · schema · drop `.int()` → C5(b) red | §17A.1, M13 |
| C5(c) | string amount | `{ amountMinor: "100", currency: "EUR" }` | fails (no coercion) | — | §17A.1 |
| C5(d) | currency case | `"eur"` fails; `"EUR"` parses; `"EURO"` fails | as stated | — | §17A.1 |
| C6(a) | timestamp form | `"2026-09-05T10:14:19.123Z"` | parses | — | §17A.16 |
| C6(b) | no milliseconds | `"2026-09-05T10:14:19Z"` | fails | — | §17A.16 |
| C6(c) | offset instead of `Z` | `"2026-09-05T12:14:19.123+02:00"` | fails | — | §17A.16 |
| C6(d) | formatter | `formatIsoTimestamp(new Date(0))` | `"1970-01-01T00:00:00.000Z"` and it parses with `isoTimestampSchema` | — | §17A.16 |
| C6(e) | uuid v4 lowercase | `"123e4567-e89b-42d3-a456-426614174000"` | parses | — | M8, §17A.2 |
| C6(f) | uppercase | same in uppercase | fails | — | M8 |
| C6(g) | wrong version nibble | `"123e4567-e89b-12d3-a456-426614174000"` (version 1) | fails | MUT-02-5 `uuid.ts` · pattern · replace `4[0-9a-f]{3}` with `[0-9a-f]{4}` → C6(g) red | M8 |

Criteria: 6 (C1–C6), 37 rows (a table line is one row; a lettered span counts its letters). Named mutations: 5.

## Notes

- Rule 13: C1 asserts the contract table, which *is* the contract (04 §6 fixes codes and statuses); no other literal is asserted.
- `email` is in the denylist unconditionally in v1; the "unless explicitly allowed" clause of 10 §7 has no caller yet — do not add an allow mechanism (rule 4).
- Projection gate: mandatory (absence and money shapes are rank-1 and rank-3 silent-failure mechanisms).

## Review log

*(append-only)*
