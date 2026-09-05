---
plan: 2
role: fix
round: 2
state: IMPLEMENTED
verdict: IMPLEMENTED
date: 2026-09-05
actor: Codex
---

# Phase 02 fix-round-2 implementer handoff

## Result

Implemented the two review fixes and the one folded note inside the exact final code/test
perimeter:

- `src/lib/logger.ts`: the redaction accumulator is `Object.create(null)`, so an own
  `"__proto__"` key remains an own serialized key and its nested values are still redacted.
- `src/lib/logger.test.ts`: the capturing helper returns `writes`; C3(p) covers hostile own
  keys and C3(q) asserts exactly one newline-terminated write for the cyclic fixture.
- `src/lib/values/values.test.ts`: C4(e) parses both schema-produced variants, serializes
  and parses JSON, then re-parses both values through the same `knownOrAbsentSchema`.

No owner decision card is required. Archgraph is absent and was skipped silently.

## Gate and baseline

All gates passed: the intention header is `RATIFIED`; master-plan tracker row 1 is
`APPROVED`; tracker row 2 was `IMPLEMENTING`; the logger still had a `{}` accumulator with
`result[key] = ...`; C4(e) still used a hand-built literal; and the phase manifest was 7
criteria, 52 rows, and 19 named mutations including C3(p), C3(q), MUT-02-17, MUT-02-18,
and MUT-02-19.

The handed-over pre-edit tree was HEAD `a14c20187cd338fe5ab66af9ac32aea5c449b7ba` with
dirty diff digest `2e6121ecf9c1aff630a90e874a125bbb089e31bf0a12954884e9c6e654be882f`.
The targeted baseline was `npx vitest run src/lib/logger.test.ts src/lib/values/values.test.ts`:
2 files, 27 tests, 0 failures. The baseline had no failing IDs.

## Verification

Inner-loop and closing evidence:

- Targeted post-fix run: `npx vitest run src/lib/logger.test.ts src/lib/values/values.test.ts`
  — 2 files, 29 tests, 0 failures.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- The one authorized L4 run was `npm test` on the handed-over implementation tree — 6 test
  files, 67 tests, 0 failures. Failure-ID delta: baseline ∅ → final ∅.
- L4 tree identity: HEAD `a14c20187cd338fe5ab66af9ac32aea5c449b7ba`, dirty diff digest
  `83afd452c717f44f1267be64b7d98948af531271239b3538ecb6ea0bf9b3a21e`.

The phase test inventory contains 46 executable cases across the four phase test files; the
67-test L4 run includes those cases plus the repository's other tests. No second full-suite
run was performed.

## Coverage map — every criterion row

Each row maps to an executable test and states whether the assertion shape is exact.

| Row | Test ID | Assertion shape |
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
| C1(k) | `error-dto.test.ts :: C1(k) derives the DTO enum from ERROR_CODES` | Every source code is accepted by the DTO schema. |
| C1(l) | `app-error.test.ts :: C1(l) keeps the local reason registries closed` | Exact closed unions and constructor reason types; measured by typecheck. |
| C2(a) | `error-dto.test.ts :: C2(a) maps an AppError and remains schema-valid` | Exact DTO object and schema parse. |
| C2(b) | `error-dto.test.ts :: C2(b) never serializes cause` | No DTO cause and no cause sentinel in JSON. |
| C2(c) | `error-dto.test.ts :: C2(c) uses a fixed generic message for unknown errors` | Fixed generic message; original text absent. |
| C2(d) | `error-dto.test.ts :: C2(d) maps a Zod error to string paths` | Exact `a/b` string path shape. |
| C2(e) | `error-dto.test.ts :: C2(e) stringifies array-index Zod paths` | Exact `items/0/b` path; every segment is a string. |
| C3(a) | `logger.test.ts :: C3(a-g) redacts every denylisted key` | `authorization` redacted; sentinel absent. |
| C3(b) | same test | `apiKey` redacted; sentinel absent. |
| C3(c) | same test | `api_key` redacted; sentinel absent. |
| C3(d) | same test | `token` redacted; sentinel absent. |
| C3(e) | same test | `password` redacted; sentinel absent. |
| C3(f) | same test | `secret` redacted; sentinel absent. |
| C3(g) | same test | `email` redacted; sentinel absent. |
| C3(h) | `logger.test.ts :: C3(h) redacts nested objects` | Nested authorization redacted; sentinel absent. |
| C3(i) | `logger.test.ts :: C3(i) redacts nested arrays` | Array retained; nested token redacted. |
| C3(j) | `logger.test.ts :: C3(j) matches denylisted keys case-insensitively` | Mixed-case keys redacted; sentinels absent. |
| C3(k) | `logger.test.ts :: C3(k) preserves null` | Parsed value is exactly `null`. |
| C3(l) | `logger.test.ts :: C3(l) fails closed for opaque values` | Opaque value is `[unserializable]`; sentinel absent. |
| C3(m) | `logger.test.ts :: C3(m) fails closed for cyclic values` | Cycle becomes `[unserializable]`; caller cycle remains intact. |
| C3(n) | `logger.test.ts :: C3(n) owns fixed frame fields` | Logger-owned level, event, and time win. |
| C3(o) | `logger.test.ts :: C3(o) writes one newline-terminated JSON line per default-sink call` | Exactly two parseable newline-terminated writes. |
| C3(p) | `logger.test.ts :: C3(p) preserves hostile own keys` | Own `__proto__` survives; nested authorization redacted; sibling retained. |
| C3(q) | `logger.test.ts :: C3(q) writes one line for a cyclic value` | Exactly one write, ending in `\n`. |
| C4(a) | `values.test.ts :: C4(a) represents absence explicitly` | Exact `{ known: false }`. |
| C4(b) | `values.test.ts :: C4(b) requires the field containing the absence shape` | Missing field fails at `q`. |
| C4(c) | `values.test.ts :: C4(c) requires a value for known true` | Missing value fails at `value`. |
| C4(d) | `values.test.ts :: C4(d) rejects extra keys on absent` | Strict absent variant rejects extra key. |
| C4(e) | `values.test.ts :: C4(e) round-trips through JSON` | Both schema-produced variants re-parse to exact expected shapes. |
| C5(a) | `values.test.ts :: C5(a) parses integer minor units` | Integer-minor-unit money parses. |
| C5(b) | `values.test.ts :: C5(b) rejects non-integer minor units` | Fraction fails at `amountMinor`; no rounding. |
| C5(c) | `values.test.ts :: C5(c) does not coerce string amounts` | String amount rejected. |
| C5(d) | `values.test.ts :: C5(d) enforces uppercase three-letter currency codes` | Lowercase/four-letter fail; uppercase parses. |
| C6(a) | `values.test.ts :: C6(a) accepts the exact ISO timestamp form` | Exact millisecond UTC form parses. |
| C6(b) | `values.test.ts :: C6(b) requires milliseconds` | No-millisecond form fails. |
| C6(c) | `values.test.ts :: C6(c) requires UTC Z rather than an offset` | Offset form fails. |
| C6(d) | `values.test.ts :: C6(d) formats and validates epoch` | Epoch-0 formatter output parses. |
| C6(e) | `values.test.ts :: C6(e) accepts a lowercase UUID v4` | Lowercase v4 and exported pattern pass. |
| C6(f) | `values.test.ts :: C6(f) rejects uppercase UUIDs` | Uppercase UUID fails. |
| C6(g) | `values.test.ts :: C6(g) enforces the v4 version nibble` | Version-1 fixture fails. |
| C7(a) | `values.test.ts :: C7(a) accepts string array-index path segments` | Exact string path array parses. |
| C7(b) | `values.test.ts :: C7(b) rejects empty path segments` | Empty segment fails at numeric index `[1]`. |

## Reverse test map

Every final phase test maps back to a criterion row; there are no orphan tests or candidate
criteria. The parameterized C1 test contributes nine executable cases.

| Test case | Criterion rows |
|---|---|
| `app-error.test.ts` parameterized taxonomy | C1(a–i) |
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
| `logger.test.ts` cyclic totality | C3(m) |
| `logger.test.ts` hostile own key | C3(p) |
| `logger.test.ts` cyclic framing | C3(q) |
| `logger.test.ts` fixed frame | C3(n) |
| `logger.test.ts` default sink framing | C3(o) |
| `values.test.ts` KnownOrAbsent | C4(a–e) |
| `values.test.ts` Money | C5(a–d) |
| `values.test.ts` timestamp and UUID | C6(a–g) |
| `values.test.ts` Path | C7(a–b) |

## Mutation ledger

Declared arithmetic: C1 = 0; C2 = MUT-02-1 + MUT-02-6 + MUT-02-9 = 3; C3 =
MUT-02-2 + MUT-02-7 + MUT-02-8 + MUT-02-10 + MUT-02-11 + MUT-02-12 + MUT-02-13 +
MUT-02-14 + MUT-02-15 + MUT-02-17 + MUT-02-19 = 11; C4 = MUT-02-3 + MUT-02-18 = 2;
C5 = MUT-02-4 = 1; C6 = MUT-02-5 = 1; C7 = MUT-02-16 = 1. Declared = 19;
executed/evidenced = 19, composed of 16 checkpoint-cited unchanged mutations plus 3
newly executed mutations. The first 16 were not rerun.

MUT-02-1 through MUT-02-16 are cited from the prior implementer handoff
`handoffs/implementer/phase-02-round-1.implementer.md`, which records their L1 commands,
observed red IDs, reversions, and checkpoint tree `b0cd457fb3b2df02907657a9c4714e2ac382f420`.
They were not rerun in this fix cycle.

The following three mutations were applied at the named site, run at L1, observed red, and
reverted. The common pre-probe tree identity was HEAD
`a14c20187cd338fe5ab66af9ac32aea5c449b7ba` plus dirty diff digest
`e47d11cc2ad7d1b63a5ea329ca1692985c2e279007267850d01ba0a9c9318873`; the final implementation
files were checksum-verified after every reversion.

| Mutation | Site and hypothesis | Scope / command | Observed failing ID and assertion | Reversion evidence |
|---|---|---|---|---|
| MUT-02-17 | `src/lib/logger.ts` · `redact` accumulator: restore `{}` plus `result[key] = ...`; C3(p) should redden because `__proto__` is no longer an own key. | L1 `npx vitest run src/lib/logger.test.ts` | 1 failed / 10 passed; `C3(p) preserves hostile own keys`, `hasOwnProperty("__proto__")` was false. Failure delta ∅ → `{C3(p)}`. | `logger.ts` restored; final SHA-256 `97ca431a81e2d91860bfd90f4aa41fb675b8f7a15bf66fd179375a382c2c98d4`. |
| MUT-02-18 | `src/lib/values/absence.ts` · make the absent variant `z.strictObject({ known: z.literal(false) }).optional()`; C4(e) must redden. | L1 `npx vitest run src/lib/values/values.test.ts` | 5 failed / 13 passed; the optional discriminated-union option caused C4(e) to fail during schema parsing (and also exposed C4(a–d)). Failure delta ∅ → `{C4(a), C4(b), C4(c), C4(d), C4(e)}`; C4(e) is the named mutation target. | `absence.ts` restored and checksum-verified SHA-256 `22beb81ee9cc67b1689dabba86c5eb304f8b8726001b381532d7a631c04ffd0e`. |
| MUT-02-19 | `src/lib/logger.ts` · `write`: invoke `sink` twice for one call; C3(q) must redden. | L1 `npx vitest run src/lib/logger.test.ts` | 2 failed / 9 passed; `C3(q) writes one line for a cyclic value` saw 2 writes, and C3(o) also saw 4 writes instead of 2. Failure delta ∅ → `{C3(q), C3(o)}`. | `logger.ts` restored; final SHA-256 `97ca431a81e2d91860bfd90f4aa41fb675b8f7a15bf66fd179375a382c2c98d4`. |

Final changed-file hashes were:

```text
97ca431a81e2d91860bfd90f4aa41fb675b8f7a15bf66fd179375a382c2c98d4  src/lib/logger.ts
48bd7a67952cf8f6c13501a39b1cd442dbb079053f3173136acaf706f67f78d5  src/lib/logger.test.ts
5f3af6b7e95b9978ed76821db148156d2118edafbd876675667f582619a02069  src/lib/values/values.test.ts
22beb81ee9cc67b1689dabba86c5eb304f8b8726001b381532d7a631c04ffd0e  src/lib/values/absence.ts
```

## Documentation impact review

After verification: this fix changes tests and an internal logger implementation while making
the already documented M20/C4 behavior true. No root README, feature README, architecture
contract, intention, or plan semantics became false, incomplete, or misleading. The phase
plan Review log and tracker row were updated as required by the pipeline; no other durable
documentation was changed.

## Full write perimeter

### Final implementation writes

- `src/lib/logger.ts`
- `src/lib/logger.test.ts`
- `src/lib/values/values.test.ts`
- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` — tracker row 2 only
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-02-errors-logger-values.md` — one append-only Review log entry
- `build_docs/under_constroction/initial_core_feature_proposales/handoffs/implementer/phase-02-round-2.implementer.md` — this handoff

### Mutation-probe files touched and reverted, separate from final writes

- `src/lib/logger.ts` — MUT-02-17 and MUT-02-19; restored and checksum-verified
- `src/lib/values/absence.ts` — MUT-02-18; restored and checksum-verified

The worktree also contains pre-existing owner/coordinator changes, including
`tsconfig.tsbuildinfo`; they were recorded, not modified, staged, committed, or included.

## Checkpoint

Checkpoint commit: `2fc6a30917f1e9a924f22f3ab81505078568cb01` — `CHECKPOINT (not approved): phase 02 fix round 2 — logger and values review fixes`.
The commit contains only the three final code/test files. Coordinator documents, reviewer
handoffs, frontend changes, and `tsconfig.tsbuildinfo` are not included.
