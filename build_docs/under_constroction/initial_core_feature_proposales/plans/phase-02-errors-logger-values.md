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

1. Master plan §5 (R6, R9, R12, R16), §6.1, §6.3, §6.4 (the five `lib/values` rows), §9 rules 1, 4.
2. Intention §17A.1 (all four shapes), §17A.2 (Generation ID form), §17A.13 (taxonomy map; "what may never cross"), §17A.16 (time), §17A.18 and M20 (logging and redaction).
3. Contracts: `04-server-architecture.md` §6, §10; `06-data-contracts-and-validation.md` §6 (Money, dates, identifiers), §8; `10-security-and-trust-boundaries.md` §7; `03-feature-architecture.md` §3; `12-anti-patterns.md` "Server", "Data and validation".

## Dependencies (gate)

Phase 1 `APPROVED`.

## Files expected to change

`src/lib/errors/app-error.ts`, `src/lib/errors/app-error.test.ts`, `src/lib/errors/error-dto.ts`, `src/lib/errors/error-dto.test.ts`, `src/lib/logger.ts`, `src/lib/logger.test.ts`, `src/lib/values/path.ts`, `src/lib/values/absence.ts`, `src/lib/values/money.ts`, `src/lib/values/timestamp.ts`, `src/lib/values/uuid.ts`, `src/lib/values/values.test.ts` — 12 new files.

## Implementation tasks (ordered)

1. `app-error.ts`: abstract `AppError` (04 §6 shape: `code`, `httpStatus`, `details?`, `cause?`) and the nine subclasses with the codes and statuses of master plan §6.3. Define and export the single `ERROR_CODES` tuple and derive `ErrorCode` from it; define the closed `ValidationReason` and `ConflictReason` unions from master plan §6.3 and type their constructors against them. `IntegrationError` constructor takes `{ system, status?, retryable, reason?, operation?, message?, cause? }` and places `system`, `status`, `retryable`, `reason`, `operation` in `details`. `ValidationError` takes `{ message?, reason?, issues?: Array<{ path: string[]; message: string }>, ...details }`. No `server-only` here: `error-dto.ts` is runtime-neutral and `app-error.ts` has no runtime dependency; keep both importable from both runtimes (03 §3).
2. `error-dto.ts`: derive `errorDtoSchema`'s `z.enum` from `ERROR_CODES`; `toErrorDto(error: unknown)` returns `ErrorDto` — `AppError` → its fields; `ZodError` → `validation_error` with `details.issues = [{ path: issue.path.map(String), message }]`; anything else → `internal_error` with a fixed generic message. `cause` is never read into the DTO.
3. `logger.ts`: `import "server-only"`; implement `createLogger({ sink = process.stdout.write.bind(process.stdout), now = () => new Date() } = {})` with `info/warn/error(event, fields?)`. Follow intention §17A.18 exactly: `sink` receives `JSON.stringify(record) + "\n"`; the fixed frame is written after sanitized caller fields; `redact` is total over the listed values, does not mutate caller input, and replaces unsupported/cyclic values with `"[unserializable]"`. Export `REDACTED_KEYS`.
4. `values/path.ts`: `pathSchema = z.array(z.string().min(1))`; export `Path` inferred from it. Do not create `formatPath`: it has no consumer in this feature.
5. `values/absence.ts`: `knownOrAbsentSchema(inner)` → `z.discriminatedUnion("known", [z.strictObject({ known: z.literal(true), value: inner }), z.strictObject({ known: z.literal(false) })])`; type helper `KnownOrAbsent<T>`.
6. `values/money.ts`: `currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/)`; `moneySchema = z.strictObject({ amountMinor: z.number().int(), currency: currencyCodeSchema })`.
7. `values/timestamp.ts`: `isoTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)`; `formatIsoTimestamp(d: Date)` = `d.toISOString()` for valid four-digit-year dates (ECMA-262 `Date.prototype.toISOString`, not a V8 implementation detail); the test pins the contract seam.
8. `values/uuid.ts`: `UUID_V4_PATTERN` (master plan §6.4), `uuidV4Schema`.
9. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a–i) | taxonomy | one row per class: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `ApprovalRequiredError`, `IntegrationError`, `RateLimitedError`, `InternalError` | `code` and `httpStatus` equal the 04 §6 table (`validation_error`/400, `unauthenticated`/401, `forbidden`/403, `not_found`/404, `conflict`/409, `approval_required`/409, `integration_error`/502, `rate_limited`/429, `internal_error`/500); `instanceof AppError` | — | §17A.13 |
| C1(j) | one error-code source | imported `ERROR_CODES` | `ERROR_CODES` equals the nine codes in the 04 §6 table in that order | — | §17A.13 |
| C1(k) | DTO enum follows the source | each member of `ERROR_CODES` as an `ErrorDto.code` | `errorDtoSchema.parse` accepts every member | — | §17A.13 |
| C1(l) | closed local reason types | `expectTypeOf` checks on `ValidationError` and `ConflictError` constructor input | `ValidationReason` and `ConflictReason` are exactly the closed unions in master plan §6.3; `"workflow_state_to_large"` and `"draft_exists"` are rejected at type-check time | — | §17A.13 |
| C2(a) | DTO of an `AppError` | `new ConflictError({ message: "x", details: { proposalUuid: "u" } })` | `toErrorDto` → `{ code: "conflict", message: "x", details: { proposalUuid: "u" } }`; `errorDtoSchema.parse` accepts it | — | §17A.13 |
| C2(b) | `cause` never serialized | same, with `cause: new Error("CAUSE-SENTINEL")` | `JSON.stringify(toErrorDto(err))` does not contain `CAUSE-SENTINEL`; the DTO has no `cause` key | MUT-02-1 `error-dto.ts` · `toErrorDto` · copy `cause` into `details` → C2(b) red | §17A.13 (what may never cross) |
| C2(c) | unknown error | `new Error("INTERNAL-SENTINEL")` | `code === "internal_error"`; message is the fixed generic string; `INTERNAL-SENTINEL` absent from the DTO JSON | MUT-02-6 `error-dto.ts` · the unknown-error branch · return the original `error.message` instead of the fixed generic string → C2(c) red | §17A.13 |
| C2(d) | Zod error | `z.object({ a: z.object({ b: z.number() }) }).safeParse({ a: { b: "x" } }).error` | `code === "validation_error"`; `details.issues` equals `[{ path: ["a","b"], message: <string> }]` (path as `string[]`, never dotted) | — | §17A.1 (Path), 06 §8 |
| C2(e) | array-index Zod path | `z.object({ items: z.array(z.object({ b: z.number() })) }).safeParse({ items: [{ b: "x" }] }).error` | `details.issues` equals `[{ path: ["items", "0", "b"], message: <string> }]`; every path segment is a string | MUT-02-9 `error-dto.ts` · Zod issue mapping · use `issue.path` without `.map(String)` → C2(e) red | §17A.1 (Path), 06 §8 |
| C3(a–g) | redaction, one row per key | `logger.info("e", { authorization: "S1", apiKey: "S2", api_key: "S3", token: "S4", password: "S5", secret: "S6", email: "S7" })` with a capturing sink | the emitted record has `[redacted]` at each of the seven named keys and contains none of `S1`…`S7` | MUT-02-2 `logger.ts` · `REDACTED_KEYS` · remove `"api_key"` → C3(c) red | M20, §17A.18 |
| C3(h) | nested-object redaction | `{ upstream: { authorization: "S8" } }` | `upstream.authorization === "[redacted]"`; serialized output contains no `S8` | MUT-02-7 `logger.ts` · `redact` · stop recursing into plain objects → C3(h) red | M20, §17A.18 |
| C3(i) | nested-array redaction | `{ upstream: [{ token: "S9" }] }` | `upstream` remains an array and `upstream[0].token === "[redacted]"`; serialized output contains no `S9` | MUT-02-10 `logger.ts` · `redact` · return arrays unchanged → C3(i) red | M20, §17A.18 |
| C3(j) | case-insensitive key match | `{ Authorization: "S10", APIKEY: "S11" }` | both values are `[redacted]`; serialized output contains neither sentinel | MUT-02-8 `logger.ts` · `redact` · compare keys case-sensitively → C3(j) red | M20, §17A.18 |
| C3(k) | null pass-through | `{ value: null }` | emitted record has `value === null`; logger does not throw | MUT-02-11 `logger.ts` · `redact` · replace `null` with `"[unserializable]"` → C3(k) red | M20, §17A.18 |
| C3(l) | opaque value fail-closed | `{ cause: new Error("OPAQUE-SENTINEL") }` | emitted record has `cause === "[unserializable]"`; serialized output contains no `OPAQUE-SENTINEL` | MUT-02-12 `logger.ts` · `redact` · stringify non-plain values → C3(l) red | M20, §17A.18 |
| C3(m) | cyclic value totality | `const fields = { cycle: null as unknown }; fields.cycle = fields` | one line is emitted; parsed `cycle === "[unserializable]"` | MUT-02-13 `logger.ts` · `redact` · preserve a repeated object instead of replacing it → C3(m) red | M20, §17A.18 |
| C3(n) | frame ownership | fields `{ level: "fake", event: "fake", time: "fake" }`, injected epoch-0 clock | emitted record has the logger's supplied `level`, input event, and `"1970-01-01T00:00:00.000Z"` time | MUT-02-14 `logger.ts` · record assembly · spread sanitized fields after the fixed frame → C3(n) red | M20, §17A.18 |
| C3(o) | one JSON line per default-sink call | capture `process.stdout.write`; create the logger with default options; call `info` twice | exactly two writes, each ending `"\n"`; trimming each write yields independently parseable JSON | MUT-02-15 `logger.ts` · sink call · omit the trailing newline → C3(o) red | M20, §17A.18 |
| C4(a) | absent is a value | `knownOrAbsentSchema(z.number()).parse({ known: false })` | returns `{ known: false }` | — | M9, §17A.1 |
| C4(b) | missing key is not absence | `z.strictObject({ q: knownOrAbsentSchema(z.number()) }).safeParse({})` | fails; issue path `["q"]` | MUT-02-3 `absence.ts` · schema · make the field optional via `.optional()` on the union → C4(b) red | M9 |
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
| C7(a) | Path accepts array indices | `pathSchema.parse(["items", "0", "b"])` | returns `["items", "0", "b"]` | — | §17A.1 |
| C7(b) | Path rejects an empty segment | `pathSchema.safeParse(["items", ""])` | fails at `["1"]` | MUT-02-16 `path.ts` · schema · drop `.min(1)` → C7(b) red | §17A.1 |

Criteria: 7 (C1–C7), 50 rows (a table line is one row; a lettered span counts its letters). Named mutations: 16.

**Amended by the coordinator at dispatch lint (2026-09-05), before any session ran.** Three gaps, all of the family phase 1's review was about — a guard with no proof it can fail:
- **C2(c) was an absence row with no mutation** (charter rule 15 covers absence rows explicitly: measuring an absence proves the absence, not that the instrument could observe the presence). `MUT-02-6` added. This row is what stops an internal error's text reaching a caller.
- **C3(g) asserted two independent behaviours in one row** — recursion into nested objects *and* case-insensitive key matching — so one mutation could redden it while the other behaviour stayed untested (charter rule 2: enumerate, never sample). Split into C3(g) nested and **C3(i)** case-insensitive, each with its own mutation (`MUT-02-7`, `MUT-02-8`). Both guard the same thing: a secret reaching a log line.

**Projection fold (2026-09-05, after owner ratification of M20).** D1 removes the void `requiredKnownOrAbsent` reference; D2 adds the array-index path conversion and its mutation; D3, D4, D7, D8, and D12 are resolved by the ratified §17A.18 logger contract and C3(a–o); D5 gives `ErrorCode` and its DTO enum one source; D6 places every closed reason union in its owning phase and builds the two error-layer unions here; D10 removes dead `formatPath` and gives `Path` its own criteria; D11 corrects master-plan §6.4's non-nestable `sourcedOrAbsent` construction; D14 corrects the timestamp authority. D9 and D15 are deferred to phase 15's isolation scan; D13 is master-plan R16. The projection's explicit delegation list remains binding for the implementer.

Counts re-derived from the current table, not carried forward: C1 12 · C2 5 · C3 15 · C4 5 · C5 4 · C6 7 · C7 2 = 50. Named mutations: MUT-02-1…16 = 16.

## Notes

- Rule 13: C1 asserts the contract table, which *is* the contract (04 §6 fixes codes and statuses); no other literal is asserted.
- The ratified §17A.18 denylist is closed in v1; `api_key` is its deliberate widening of 10 §7 and `email` has no allow mechanism. Do not add a call-site exception.
- Projection gate: **mandatory** (master plan §3; absence and money shapes are rank-1 and rank-3 silent-failure mechanisms). Not waivable by the coordinator without amending §3 and recording the reason.
- **Perimeter-vs-guard check run at dispatch lint (clear):** phase 1's `no-restricted-properties` rule targets `object: "process", property: "env"` specifically, so task 3's `process.stdout` default sink does **not** trip it. Phase 1's C3(c)/C3(d) lint synthetic paths passed to `Linter.verify`, not real files, so nothing this phase creates collides with them. Phase 2's tests land under `src/lib/**`, which the node project claims — confirm with `npx vitest list` (master plan §10.3 hazard).

## Review log

*(append-only)*

- **2026-09-05 — projection round 0 (plan-projection, reviewer tables). Verdict `AMENDMENTS_REQUIRED`.** Gate: all four checks passed. Manifest lint re-derived independently rather than carried from the dispatch lint — every count in this plan is correct (38 rows, 8 mutations, 12 files, 6 criteria); both prior coordinator checks (the `process.env` rule vs. `process.stdout`; the node project's include globs) re-verified and clear. 15-row decision ledger, all routed, in `handoffs/reviewer/phase-02-projection-round-0.reviewer.md`. HIGH: D1 `requiredKnownOrAbsent` in C4(b)'s mutation cell resolves to nothing and the mutation works without it; D2 Zod 4 issue paths carry numeric array indices, so `details.issues` needs a stated conversion and C2(d)'s object-only fixture cannot see the defect; D3 `redact` is undetermined on `null` (crashes), arrays, non-plain and cyclic values; D4 `api_key` is in `REDACTED_KEYS` with no fixture key, so deleting it leaves every criterion green. MED: D5 `ErrorCode`, D6 the six `reason` registries, D7 the log-line terminator, D8 C3's trace to §17A.10 (which governs the approval-diff event, not the logger), D9 no guard anywhere for contract 04 §10's `console` prohibition, D10 `formatPath` dead, D11 §6.4's `sourcedOrAbsent` construction unrealizable on this phase's shape. LOW: D12–D15. Clean and stated as such: the `KnownOrAbsent` rows are fully determinate against Zod 4.5.4, and the money surface offers no place for arithmetic to appear. One owner card: the intention carries no logging or redaction contract at all. Explicit delegation list of 8 items compiled for the implementer prompt. No code written, no test run (L4 = 0).

- **2026-09-05 — coordinator projection fold.** Owner card 1 was answered **A** and the owner explicitly ratified the resulting M20 / §17A.18 logging contract. D1–D15 are folded to their designated homes: this plan, the master plan's registry/follow-up/resolution tables, and phase 15's isolation scan. The dispatch lint re-derived the current manifest as 7 criteria, 50 rows, 16 mutations; its content gate passed before `prompts/implementer/phase-02-round-1.implementer.md` was authored. The projection's eight-item delegation list is copied verbatim into that prompt. The phase remains unimplemented.

- **2026-09-05 — implementer round 1 (Codex).** Implemented the nine-class `AppError` taxonomy and single `ERROR_CODES` source, runtime-neutral `ErrorDto` conversion, server-only redacting logger, and the five shared value modules. The contract resolution was re-emitted unchanged: runtime boundaries, feature architecture, server architecture, data contracts and validation, security and trust boundaries, testing principles, anti-patterns, decision checklist, and documentation principles apply; no additional contract was needed. The logger follows §17A.18 with recursive array/object handling, fail-closed opaque/cyclic values, immutable caller input, fixed frame ownership, and newline-terminated sink writes. Delegated choices: recursive redaction walk; generic message `An unexpected error occurred.`; ergonomic options constructors for unspecified classes; `ErrorCode` derives from `ERROR_CODES` and the DTO enum derives from that tuple; table-oriented value tests; a capturing sink of `(line: string) => unknown`; no extra timestamp range/NaN guard; and `REDACTED_KEYS` as a readonly tuple. Targeted phase tests: 44 passed; typecheck passed; lint passed with one pre-existing warning in unrelated `postcss.config.mjs`. The mandatory final full-suite stamp and checkpoint identity are in the implementer handoff. Documentation-impact review after verification: no current-state documentation became false or incomplete, so no README or contract update was warranted. No owner decision cards are required.
