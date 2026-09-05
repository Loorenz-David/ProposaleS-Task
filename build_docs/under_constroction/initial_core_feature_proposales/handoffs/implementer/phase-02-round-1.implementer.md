---
plan: 2
role: implement
round: 1
state: IMPLEMENTED
verdict: IMPLEMENTED
date: 2026-09-05
actor: Codex
---

# Phase 02 implementer handoff

## Result

Implemented the 12 planned phase files:

- `src/lib/errors/app-error.ts` and `error-dto.ts`: runtime-neutral `AppError` taxonomy, nine subclasses, closed local reason unions, one `ERROR_CODES` source, and safe DTO conversion for application, Zod, and unknown errors.
- `src/lib/logger.ts`: server-only structured logger with exact denylist redaction, recursive arrays/objects, fail-closed unsupported and cyclic values, fixed metadata ownership, immutable caller input, and newline-terminated sink records.
- `src/lib/values/{path,absence,money,timestamp,uuid}.ts`: the five shared value shapes.
- `src/lib/errors/{app-error,error-dto}.test.ts`, `src/lib/logger.test.ts`, and `src/lib/values/values.test.ts`: 44 executable cases covering all 50 criterion rows.

The checkpoint commit is `b0cd457fb3b2df02907657a9c4714e2ac382f420` with subject `CHECKPOINT (not approved): phase 02 errors logger values`. Only the phase implementation/tests plus the phase plan and tracker row were staged; unrelated pre-existing worktree changes were not included.

## Gate and baseline

All gates passed: intention `RATIFIED`; tracker row 1 `APPROVED`; tracker row 2 was `PROMPT_READY`; `src/lib/errors/` was absent; and the plan manifest was 7 criteria, 50 rows, 16 named mutations.

Pre-edit baseline was captured after creating the four phase test files and before creating production modules: 4 collection failures, 0 tests, with missing-module failures in `app-error.test.ts`, `error-dto.test.ts`, `logger.test.ts`, and `values.test.ts`. No baseline test IDs existed because collection stopped before test execution. Final L4 failure-ID delta: those 4 collection failures → 0 failures; the full suite passed 65 tests in 6 files.

## Evidence

The one authoritative L4 stamp ran on checkpoint `b0cd457fb3b2df02907657a9c4714e2ac382f420`:

- `npm test`: 6 test files, 65 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with one warning in pre-existing unrelated `postcss.config.mjs` (`import/no-anonymous-default-export`); 0 errors.
- L4 tree identity: checkpoint SHA above, tracked dirty-diff digest `fb69baf77ebcc4bb344ad70bdd4e8e55fd3afbe9a856f33a2be920522490cc13`, empty index digest `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. The worktree was intentionally dirty from unrelated owner/coordinator changes; no phase file was dirty after the checkpoint.

Inner-loop phase evidence: targeted phase run `npx vitest run src/lib/errors/app-error.test.ts src/lib/errors/error-dto.test.ts src/lib/logger.test.ts src/lib/values/values.test.ts` passed 44 tests in 4 files.

## Coverage map — every criterion row

Each row maps to an executable test and states whether the assertion has the exact required shape.

| Criterion row | Test ID | Assertion shape |
|---|---|---|
| C1(a) | `app-error.test.ts :: C1(ValidationError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(b) | `app-error.test.ts :: C1(AuthenticationError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(c) | `app-error.test.ts :: C1(AuthorizationError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(d) | `app-error.test.ts :: C1(NotFoundError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(e) | `app-error.test.ts :: C1(ConflictError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(f) | `app-error.test.ts :: C1(ApprovalRequiredError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(g) | `app-error.test.ts :: C1(IntegrationError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(h) | `app-error.test.ts :: C1(RateLimitedError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(i) | `app-error.test.ts :: C1(InternalError) exposes its contract` | Exact code/status and `instanceof AppError`. |
| C1(j) | `app-error.test.ts :: C1(j) has one ordered error-code source` | Exact nine-code order. |
| C1(k) | `error-dto.test.ts :: C1(k) derives the DTO enum from ERROR_CODES` | Each source member is accepted by `errorDtoSchema`. |
| C1(l) | `app-error.test.ts :: C1(l) keeps the local reason registries closed` | Exact closed unions and constructor reason types. |
| C2(a) | `error-dto.test.ts :: C2(a) maps an AppError and remains schema-valid` | Exact DTO object and schema parse. |
| C2(b) | `error-dto.test.ts :: C2(b) never serializes cause` | No top-level or nested DTO `cause`; sentinel absent from JSON. |
| C2(c) | `error-dto.test.ts :: C2(c) uses a fixed generic message for unknown errors` | Fixed message and absent original text. |
| C2(d) | `error-dto.test.ts :: C2(d) maps a Zod error to string paths` | Exact validation code and `[{ path: ["a","b"], message }]`. |
| C2(e) | `error-dto.test.ts :: C2(e) stringifies array-index Zod paths` | Exact `items/0/b` string path and all segments strings. |
| C3(a) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `authorization` is `[redacted]`, sentinel absent. |
| C3(b) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `apiKey` is `[redacted]`, sentinel absent. |
| C3(c) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `api_key` is `[redacted]`, sentinel absent. |
| C3(d) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `token` is `[redacted]`, sentinel absent. |
| C3(e) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `password` is `[redacted]`, sentinel absent. |
| C3(f) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `secret` is `[redacted]`, sentinel absent. |
| C3(g) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `email` is `[redacted]`, sentinel absent. |
| C3(h) | `logger.test.ts :: C3(h) redacts nested objects` | Nested object key redacted and sentinel absent. |
| C3(i) | `logger.test.ts :: C3(i) redacts nested arrays` | Array shape retained; nested key redacted and sentinel absent. |
| C3(j) | `logger.test.ts :: C3(j) matches denylisted keys case-insensitively` | Both mixed-case keys redacted and sentinels absent. |
| C3(k) | `logger.test.ts :: C3(k) preserves null` | Parsed emitted value is exactly `null`. |
| C3(l) | `logger.test.ts :: C3(l) fails closed for opaque values` | Opaque value is exactly `[unserializable]`; sentinel absent. |
| C3(m) | `logger.test.ts :: C3(m) fails closed for cyclic values` | One parseable line, cycle field `[unserializable]`, caller cycle preserved. |
| C3(n) | `logger.test.ts :: C3(n) owns fixed frame fields` | Logger-owned `level`, event, and epoch-0 ISO time win. |
| C3(o) | `logger.test.ts :: C3(o) writes one newline-terminated JSON line per default-sink call` | Exactly two newline-terminated independently parseable writes. |
| C4(a) | `values.test.ts :: C4(a) represents absence explicitly` | Exact `{ known: false }`. |
| C4(b) | `values.test.ts :: C4(b) requires the field containing the absence shape` | Parse fails at exact `q` path. |
| C4(c) | `values.test.ts :: C4(c) requires a value for known true` | Parse fails at exact `value` path. |
| C4(d) | `values.test.ts :: C4(d) rejects extra keys on absent` | Strict absent variant rejects extra key. |
| C4(e) | `values.test.ts :: C4(e) round-trips through JSON` | Exact JSON round-trip shape. |
| C5(a) | `values.test.ts :: C5(a) parses integer minor units` | Exact integer-minor-unit object parses. |
| C5(b) | `values.test.ts :: C5(b) rejects non-integer minor units` | Fails at exact `amountMinor` path; no rounding. |
| C5(c) | `values.test.ts :: C5(c) does not coerce string amounts` | String amount rejected. |
| C5(d) | `values.test.ts :: C5(d) enforces uppercase three-letter currency codes` | Lowercase and four-letter fail; uppercase parses. |
| C6(a) | `values.test.ts :: C6(a) accepts the exact ISO timestamp form` | Exact millisecond UTC form parses. |
| C6(b) | `values.test.ts :: C6(b) requires milliseconds` | No-millisecond form fails. |
| C6(c) | `values.test.ts :: C6(c) requires UTC Z rather than an offset` | Offset form fails. |
| C6(d) | `values.test.ts :: C6(d) formats and validates epoch` | Exact epoch-0 string and schema parse. |
| C6(e) | `values.test.ts :: C6(e) accepts a lowercase UUID v4` | Exact lowercase v4 value and exported pattern pass. |
| C6(f) | `values.test.ts :: C6(f) rejects uppercase UUIDs` | Uppercase UUID fails. |
| C6(g) | `values.test.ts :: C6(g) enforces the v4 version nibble` | Version-1 fixture fails. |
| C7(a) | `values.test.ts :: C7(a) accepts string array-index path segments` | Exact string path array parses. |
| C7(b) | `values.test.ts :: C7(b) rejects empty path segments` | Empty segment fails at exact index path `[1]`. |

## Reverse test map

Every test in the phase test files maps back to a criterion row; there are no orphan tests or candidate criteria.

| Test file cases | Criterion rows |
|---|---|
| `app-error.test.ts` parameterized taxonomy cases | C1(a–i) |
| `app-error.test.ts` ordered source | C1(j) |
| `app-error.test.ts` closed reason registries | C1(l) |
| `error-dto.test.ts` DTO enum | C1(k) |
| `error-dto.test.ts` AppError DTO | C2(a) |
| `error-dto.test.ts` cause exclusion | C2(b) |
| `error-dto.test.ts` unknown error | C2(c) |
| `error-dto.test.ts` Zod object path | C2(d) |
| `error-dto.test.ts` Zod array path | C2(e) |
| `logger.test.ts` denylist | C3(a–g) |
| `logger.test.ts` nested object | C3(h) |
| `logger.test.ts` nested array | C3(i) |
| `logger.test.ts` case-insensitive keys | C3(j) |
| `logger.test.ts` null | C3(k) |
| `logger.test.ts` opaque value | C3(l) |
| `logger.test.ts` cyclic value, one-line totality, and caller immutability | C3(m) |
| `logger.test.ts` fixed frame | C3(n) |
| `logger.test.ts` default sink newline | C3(o) |
| `values.test.ts` KnownOrAbsent cases | C4(a–e) |
| `values.test.ts` Money cases | C5(a–d) |
| `values.test.ts` timestamp and UUID cases | C6(a–g) |
| `values.test.ts` Path cases | C7(a–b) |

## Complete mutation ledger

Declared arithmetic: C2 = MUT-02-1 + MUT-02-6 + MUT-02-9 = 3; C3 = MUT-02-2 + MUT-02-7 + MUT-02-8 + MUT-02-10 + MUT-02-11 + MUT-02-12 + MUT-02-13 + MUT-02-14 + MUT-02-15 = 9; C4 = MUT-02-3 = 1; C5 = MUT-02-4 = 1; C6 = MUT-02-5 = 1; C7 = MUT-02-16 = 1; C1 = 0. Declared = 16; executed = 16.

All rows below were applied at the named site on the checkpoint tree, tested at L1 with the exact command shown, observed red, and reverted. Temporary probe tree identity is checkpoint SHA plus the recorded dirty-diff digest.

| Mutation | Site and hypothesis | Scope / command | Temporary diff digest | Observed failing ID and assertion |
|---|---|---|---|---|
| MUT-02-1 | `src/lib/errors/error-dto.ts`, `toErrorDto` AppError branch; copying `cause` into details leaks it. | L1 `npx vitest run src/lib/errors/error-dto.test.ts -t "never serializes cause"` | `15c038ec1db4e0b756265e2f392f1122cb53e8c57056b6e5091d563e4b592265` | `C2(b) never serializes cause`; nested DTO `cause` unexpectedly present. |
| MUT-02-2 | `src/lib/logger.ts`, `REDACTED_KEYS`; removing `api_key` leaks that spelling. | L1 `npx vitest run src/lib/logger.test.ts -t "redacts every denylisted key"` | `a382fcb6263f6f54f839624b397ab534bc477f65e654cf8cbd5943eb93c48011` | `C3(a-g) redacts every denylisted key`; `api_key` received `S3`. |
| MUT-02-3 | `src/lib/values/absence.ts`, `knownOrAbsentSchema`; optionalizing the union accepts a missing field. | L1 `npx vitest run src/lib/values/values.test.ts -t "requires the field containing"` | `75c9416c11559838094fc6af4c18c650899372e9be9a74c41aaac6460d273122` | `C4(b) requires the field containing the absence shape`; parse unexpectedly succeeded. |
| MUT-02-4 | `src/lib/values/money.ts`, `moneySchema`; dropping `.int()` accepts fractional minor units. | L1 `npx vitest run src/lib/values/values.test.ts -t "rejects non-integer minor units"` | `1e5bfb023ce6fc50b4da82cbf4386ccc3c387ca7c8233cfd09521446b8cff1a9` | `C5(b) rejects non-integer minor units`; parse unexpectedly succeeded. |
| MUT-02-5 | `src/lib/values/uuid.ts`, `UUID_V4_PATTERN`; accepting any version nibble admits version 1. | L1 `npx vitest run src/lib/values/values.test.ts -t "enforces the v4 version"` | `f73658d66276b787cf2f348cfc4924471ea70c11b5a78ede9590594f9c35af1a` | `C6(g) enforces the v4 version nibble`; version-1 fixture unexpectedly parsed. |
| MUT-02-6 | `src/lib/errors/error-dto.ts`, unknown-error branch; returning `error.message` leaks internal text. | L1 `npx vitest run src/lib/errors/error-dto.test.ts -t "fixed generic message"` | `f1ff023b4fba793f6490738ed9f8462099f007c41b3081f9374c476a3b291ecf` | `C2(c) uses a fixed generic message for unknown errors`; received `INTERNAL-SENTINEL`. |
| MUT-02-7 | `src/lib/logger.ts`, `redact`; stopping plain-object recursion leaks nested secrets. | L1 `npx vitest run src/lib/logger.test.ts -t "redacts nested objects"` | `50d93027ae745aeeb5950298a07b58b8e38cf5f560ddaa7836086ef3548208c7` | `C3(h) redacts nested objects`; nested authorization received `S8`. |
| MUT-02-8 | `src/lib/logger.ts`, `redact`; case-sensitive key comparison leaks mixed-case secrets. | L1 `npx vitest run src/lib/logger.test.ts -t "matches denylisted keys case-insensitively"` | `5e5e5764d2257dbc1574780c363c044d3e7d0e0b0c794fa7894adaf6b90e09e8` | `C3(j) matches denylisted keys case-insensitively`; `Authorization` received `S10`. |
| MUT-02-9 | `src/lib/errors/error-dto.ts`, Zod issue mapping; omitting `.map(String)` preserves numeric array indexes. | L1 `npx vitest run src/lib/errors/error-dto.test.ts -t "stringifies array-index"` | `7061e9b0053dd82fb9c452b5f1c55cfec9b63b6ae9a0901fc45dae61356c346f` | `C2(e) stringifies array-index Zod paths`; received numeric `0`. |
| MUT-02-10 | `src/lib/logger.ts`, `redact`; returning arrays unchanged leaks nested array secrets. | L1 `npx vitest run src/lib/logger.test.ts -t "redacts nested arrays"` | `9f68372609d7ecd91e6957f96e9631f4cb5c7291d36816e15861e0d0f71e8053` | `C3(i) redacts nested arrays`; array token received `S9`. |
| MUT-02-11 | `src/lib/logger.ts`, `redact`; converting `null` to `[unserializable]` changes a JSON value. | L1 `npx vitest run src/lib/logger.test.ts -t "preserves null"` | `343a6b041b3053de86be025cb2894bb4afdcd1f75ac741595204787dc670b732` | `C3(k) preserves null`; received `[unserializable]`. |
| MUT-02-12 | `src/lib/logger.ts`, `redact`; stringifying non-plain values fails closed incorrectly. | L1 `npx vitest run src/lib/logger.test.ts -t "fails closed for opaque"` | `eb26c521093976fc5197a022bd94a1c22694a7d66b497c7e370dbb2a20654bb2` | `C3(l) fails closed for opaque values`; received `{}` instead of `[unserializable]`. |
| MUT-02-13 | `src/lib/logger.ts`, cycle guard; preserving an ancestor object makes serialization throw. | L1 `npx vitest run src/lib/logger.test.ts -t "fails closed for cyclic"` | `d2d2db801ec4bb63764ca64804169ef29baceaccd3bc3fb99645b358333de1b7` | `C3(m) fails closed for cyclic values`; `TypeError: Converting circular structure to JSON`. |
| MUT-02-14 | `src/lib/logger.ts`, record assembly; spreading caller fields after the frame lets them overwrite metadata. | L1 `npx vitest run src/lib/logger.test.ts -t "owns fixed frame"` | `a0adee38fa7af58460576215472f84b51a5d6af7266e7dd6706df41ddcaa7e4b` | `C3(n) owns fixed frame fields`; level received `fake`. |
| MUT-02-15 | `src/lib/logger.ts`, sink call; omitting `\n` breaks one-line sink framing. | L1 `npx vitest run src/lib/logger.test.ts -t "one newline-terminated"` | `e567e86e731c57f2e50cad1e33da742d4cc3ce8ebe0ea871fa0465fa1ce5d623` | `C3(o) writes one newline-terminated JSON line per default-sink call`; newline assertion was false. |
| MUT-02-16 | `src/lib/values/path.ts`, `pathSchema`; dropping `.min(1)` accepts an empty segment. | L1 `npx vitest run src/lib/values/values.test.ts -t "rejects empty path"` | `d867ccf3781acd25297caba7f9cfb645c1a87289b4ee4e706ad6bc41eb104d99` | `C7(b) rejects empty path segments`; parse unexpectedly succeeded. |

## Decisions and contract notes

The architecture-context resolution was: `03-feature-architecture.md`, `04-server-architecture.md`, `06-data-contracts-and-validation.md`, `10-security-and-trust-boundaries.md`, `11-testing-principles.md`, `12-anti-patterns.md`, `13-decision-checklist.md`, and `14-documentation-principles.md`; runtime-boundaries was also reviewed through the master-plan selection. No contract was added or amended. The phase introduces no Next.js API.

The eight delegated decisions were resolved as follows: recursive redaction walk; fixed unknown-error text `An unexpected error occurred.`; options constructors for unspecified classes; `ErrorCode` derives from `ERROR_CODES` and the DTO enum derives from the tuple; table-driven tests inside `values.test.ts`; capturing sink type `(line: string) => unknown`; no timestamp range/NaN guard; and `REDACTED_KEYS` is a readonly tuple.

No owner decision cards are needed. No architecture graph is present, so no graph delta was made. Documentation-impact review found no current-state document made false, incomplete, or misleading; no README or contract was changed for this phase.

## Full write perimeter

### Own changes in the checkpoint

- `src/lib/errors/app-error.ts`
- `src/lib/errors/app-error.test.ts`
- `src/lib/errors/error-dto.ts`
- `src/lib/errors/error-dto.test.ts`
- `src/lib/logger.ts`
- `src/lib/logger.test.ts`
- `src/lib/values/path.ts`
- `src/lib/values/absence.ts`
- `src/lib/values/money.ts`
- `src/lib/values/timestamp.ts`
- `src/lib/values/uuid.ts`
- `src/lib/values/values.test.ts`
- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` (tracker row 2 only)
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-02-errors-logger-values.md` (append-only Review log)

### Mutation-probe files touched and reverted, separate from own changes

- `src/lib/errors/error-dto.ts`
- `src/lib/logger.ts`
- `src/lib/values/absence.ts`
- `src/lib/values/money.ts`
- `src/lib/values/uuid.ts`
- `src/lib/values/path.ts`

No mutation probe touched a test file. The final handoff file is this report; it was intentionally not absorbed into the checkpoint commit so the L4 identity above remains the exact tree tested.
