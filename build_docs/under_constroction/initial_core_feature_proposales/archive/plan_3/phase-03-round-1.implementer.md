---
plan: 3
role: implement
state: IMPLEMENTED
verdict: IMPLEMENTED
date: 2026-09-05
actor: Codex
---

# Phase 3 implementation handoff — round 1

## 1. Opening state

Task 0 coverage map was authored before production edits. The baseline was captured after
the five new phase test files and three fixtures existed, before production implementation.

## 2. Coverage map (44 criterion rows)

| Row | Test id | Assertion strength |
|---|---|---|
| C1(a) | `http.test.ts / C1(a) transport rejection` | exact reason, retryable flag, absent status, system, operation |
| C1(b) | `http.test.ts / C1(b) timeout` | exact timeout reason/retryability and aborted signal |
| C1(c) | `errors.test.ts / C1(c) bounded ordered upstream issues` | exact capped prefix, stringified paths, generic replacement, status taxonomy |
| C1(d) | `http.test.ts / C1(d) 401` | exact unauthenticated reason, false retryability, status |
| C1(e) | `http.test.ts / C1(e) 403` | exact forbidden reason and false retryability |
| C1(f) | `http.test.ts / C1(f) 404` | exact not-found-upstream reason and false retryability |
| C1(g) | `http.test.ts / C1(g) 409` | exact conflict-upstream reason and false retryability |
| C1(h) | `http.test.ts / C1(h) 429` | exact rate-limited-upstream reason and retryability |
| C1(i) | `http.test.ts / C1(i) 503` | exact server-error reason and retryability |
| C1(j) | `http.test.ts / C1(j) other 4xx` | exact bad-request reason and false retryability |
| C1(k) | `http.test.ts / C1(k) unreadable 2xx body` | exact invalid-body reason and false retryability |
| C1(l) | `client.test.ts / C1(l) response schema mismatch` | exact schema-mismatch reason/operation, issue paths, DTO redaction |
| C1(m) | `http.test.ts / C1(m) status precedes unreadable body` | exact retryable 503 result and configured retry count |
| C1(n) | `app-error.test.ts / C1(n) typed integration issues` | exact supplied typed issue array preserved in details |
| C2(a) | `http.test.ts / C2(a) documented message` | exact bounded upstream message crosses |
| C2(b) | `http.test.ts / C2(b) over-cap message` | generic public message plus exact raw body only in cause.message |
| C2(c) | `http.test.ts / C2(c) non-string message` | generic public message |
| C2(d) | `http.test.ts / C2(d) raw body redaction` | sentinel absent from message/details/DTO and exact cause.message |
| C2(e) | `http.test.ts / C2(e) URL redaction` | upstream URL absent from public error and details |
| C3(a) | `http.test.ts / C3(a) bounded read retry` | successful third attempt, exactly 3 fetches, increasing sleeps |
| C3(b) | `http.test.ts / C3(b) non-retryable read` | exactly one fetch |
| C3(c) | `http.test.ts / C3(c) attempt bound` | exactly `PROPOSALES_READ_MAX_ATTEMPTS` calls and last error |
| C3(d) | `http.test.ts / C3(d) total elapsed cap` | exactly one call after deadline and last retryable error |
| C3(e) | `http.test.ts / C3(e) post is not retried` | exactly one POST and server-error result |
| C3(f) | `http.test.ts / C3(f) in-flight total deadline` | timeout reason and abort at total deadline before per-attempt timeout |
| C4(a) | `client.test.ts / C4(a) list request shape` | exact path, sole query key/value, GET |
| C4(b) | `client.test.ts / C4(b) auth header` | Authorization present and Bearer-prefixed |
| C4(c) | `client.test.ts / C4(c) get request shape` | exact two query keys and variation value |
| C4(d) | `client.test.ts / C4(d) content miss` | exact `null` result |
| C4(e) | `fake.test.ts / C4(e) fake list recording` | catalog return, exact call record, zero writes, no-write guard |
| C4(f) | `client.test.ts / C4(f) default factory wiring` | configured company id and Bearer header through injected fetch |
| C4(g) | `client.test.ts / C4(g) server-only adapter files` | all seven production adapter files begin with the directive |
| C4(h) | `client.test.ts / C4(h) variation id boundary` | ValidationError and exactly zero fetch calls |
| C5(a) | `mappers.test.ts / C5(a) parse and map` | exact mapped ids, localized records, and conditional images |
| C5(b) | `mappers.test.ts / C5(b) strip unknown keys` | both unknown fixture keys absent from domain output |
| C5(c) | `mappers.test.ts / C5(c) millisecond epoch` | exact ISO output under explicit millisecond assumption |
| C5(d) | `mappers.test.ts / C5(d) missing description` | exact empty description record |
| C5(e) | `client.test.ts / C5(e) bounded epoch response` | whole read schema-mismatch, non-retryable, operation/path, no partial result |
| C6(a) | `client.test.ts / C6(a) company request shape` | exact path, no query keys, GET, auth |
| C6(b) | `client.test.ts / C6(b) configured company selection` | exact second-company mapping and currency normalization |
| C6(c) | `client.test.ts / C6(c) configured company absent` | exact not-found-upstream, non-retryable, operation, absent status |
| C6(d) | `fake.test.ts / C6(d) fake company recording` | exact company return, call record, zero writes |
| C6(e) | `client.test.ts / C6(e) malformed currency` | Proposales schema-mismatch, non-retryable, operation, no bare ZodError |
| C6(f) | `client.test.ts / C6(f) unknown tax mode` | Proposales schema-mismatch, non-retryable, operation |

No phase test is intentionally outside this map. Existing phase-2 assertions retained in
`app-error.test.ts` are inherited tests and are not phase-3-authored coverage.

## 3. Red baseline

Command: \`npx vitest run src/lib/errors/app-error.test.ts src/lib/proposales/http.test.ts src/lib/proposales/errors.test.ts src/lib/proposales/mappers.test.ts src/lib/proposales/client.test.ts src/lib/proposales/fake.test.ts\`.

Tree: \`c588a0c\` plus the pre-production test/fixture/handoff edits (dirty tree; no production
phase implementation existed). Result: 6 failed test files, 1 failed test and 11 passed
tests. The five new Proposales suites failed during import because their production modules
did not exist; \`C1(n) preserves typed integration issues\` failed because the shared error
constructor did not yet preserve \`issues\`. This is the recorded red baseline, not a
reconstruction.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner.

## 4. Result and evidence

Implemented the Proposales server-only adapter's transport, error translation, response
schemas, mappers, three read methods, default factory, recording fake, fixtures, shared
integration issue support, and integration README. The final targeted phase run passed 55
tests in 6 files. The initial checkpoint was 1d33f64; the transport-ordering correction
is in follow-up checkpoint 5227b3ff144c27d0db2b0ab89d839a99516330e7.

The final authorized closing L4 stamp ran on checkpoint 5227b3ff144c27d0db2b0ab89d839a99516330e7:

- npm test: 11 test files, 111 tests passed.
- npm run typecheck: passed.
- npm run lint: passed.
- L4 identity: checkpoint SHA 5227b3ff144c27d0db2b0ab89d839a99516330e7 plus tracked
  dirty-diff digest 10fee888340d4b28fcc1f27fe9d59c4976cdf7323d4144ff04f3f4f6a85a5d2d
  for the separately generated tsconfig.tsbuildinfo. The phase handoff was intentionally
  written after the checkpoint so this report can cite the exact checkpoint tree.

Final failure-ID delta against the recorded baseline: five missing-module collection
failures plus one shared-error assertion failure → zero failures. The phase targeted
run's final delta was 55 passed / 0 failed.

## 5. Mutation ledger

Declared arithmetic: C1 = 2; C2 = 2; C3 = 1; C4 = 1; C5 = 2; C6 = 1; total declared
9. Executed = 9. Each named mutation was applied at its specified site, run at L1,
observed red, and reverted. Tree identity below is the pre-checkpoint HEAD
6722d19c0c96970d31237a0556fe63d612039a2c plus the full-tree digest computed from tracked
and untracked files with the command git ls-files -co --exclude-standard | sort | xargs
shasum -a 256 | shasum -a 256.

| Mutation | Site and hypothesis | Command | Mutation tree digest | Observed red |
|---|---|---|---|---|
| MUT-03-1 | errors.ts fromUpstream return path; add details.body = bodyText and raw body crosses. | npx vitest run src/lib/proposales/http.test.ts | fa81c841f8abf7771802bbbe15f0dc3f63e1786c26a3f93ab3ff709601a07e2a | C2(d) raw sentinel appeared in error.details. |
| MUT-03-2 | http.ts post call site; route POST through retrying GET path. | npx vitest run src/lib/proposales/http.test.ts | 01423316ed006c6f2c268b15e848c6a75b28caa7715a3f79980bfdf3e585492d | C3(e) observed 3 fetches instead of exactly 1; collateral C2(d) cause assertion also reddened. |
| MUT-03-3 | client.ts listContent call site; add include_archived=true. | npx vitest run src/lib/proposales/client.test.ts | 4b0d366d0a13c8dd71de8652423b590a2d88232616f80e66382bf268b2fa375c | C4(a) observed an extra query key. |
| MUT-03-4 | client.ts getCompany selection call site; select data[0]. | npx vitest run src/lib/proposales/client.test.ts | 7172e2f7bed9c1dd7b11dc2725f5b02df75e042707abed5bb9bdccbfd8c53735 | C6(b) mapped the first company; C6(c) unexpectedly resolved. |
| MUT-03-5 | mappers.ts toContentItem definition; multiply epoch by 1000. | npx vitest run src/lib/proposales/mappers.test.ts | 448f679aeee560931867e366a9b7215a97f4110868b6496035e037ee6f88cdc4 | C5(c) observed year +057648 instead of 2025. |
| MUT-03-6 | errors.ts boundedMessage definition; remove the length cap. | npx vitest run src/lib/proposales/http.test.ts | e654cd61c85bea4fe260ec008355f30ceab14fb3120021b7a6bf98e8f1c3d258 | C2(b) forwarded the over-cap message; C1(c) left the over-cap issue message unredacted. |
| MUT-03-7 | errors.ts mapIssues definition; remove path.map(String). | npx vitest run src/lib/proposales/http.test.ts src/lib/proposales/errors.test.ts | 3a1fb4df40d4b62afe92551482c6d0d613f26923ebb03dfd81ed6dabeff1bee | Retained errors.test.ts C1(c) observed numeric path segments; the pre-dedup HTTP duplicate also reddened and was removed afterward. |
| MUT-03-8 | errors.ts fromUpstream classification definition; classify unreadable body before non-2xx status. | npx vitest run src/lib/proposales/http.test.ts | 0e1bba1d1337f87c8e12f0e5131c63f5b09e606cb756e45f530adbdbd439bc4e | C1(m) observed invalid_body/non-retryable for 503; C3(c) also reddened. |
| MUT-03-9 | schemas.ts contentItemResponseSchema field definition; remove Date/ISO range refinement. | npx vitest run src/lib/proposales/client.test.ts | bb91af840abb0841a86d4ab81a6ea1d6980cef22f79d100a53f311c077109b38 | C5(e) escaped as RangeError: Invalid time value instead of schema mismatch. |

The first MUT-03-1 attempt added an unsupported constructor option and stayed green because
IntegrationError discards unknown options. It was not counted as executed evidence; the
+
### Revalidation after transport-ordering correction

Because http.ts changed after the initial checkpoint, all 9 named mutations were re-run
against the corrected tree. Each again reddened and was reverted. Base tree was checkpoint
1d33f640f329cde8843bf3dd4fbd777c0909937b; digests include tracked and untracked files.

| Mutation | Final-tree mutation digest | Observed red |
|---|---|---|
| MUT-03-1 | e1881a397165e20a75926a5bce97daa35bb00b34fc662bc5768fa507b627540a | C2(d) raw sentinel appeared in error.details. |
| MUT-03-2 | b0301c8112039f70b6f044dbe448852641e1591b7ac4af7c25bb9526986e0247 | C3(e) observed 3 POST fetches; collateral C2(d) also reddened. |
| MUT-03-3 | e28bdc7377ec038599f09ef166ef3aa50d45b14fdb6cf2141219e1bc878fc589 | C4(a) observed an extra query key. |
| MUT-03-4 | 64dee868190483cb2b5effe77d4923203a18795cf31663e06aa5685cf2719896 | C6(b) selected the first company; C6(c) unexpectedly resolved. |
| MUT-03-5 | 16828f01e9d3b9c802174805ab0db7cf578702a6d2a6e575bb1a9b2cb4f30951 | C5(c) observed the wrong ISO year. |
| MUT-03-6 | 35d457119bccd95b1e7fdc5976b8cce553668647973e585e6f4ad0b412e9dc9e | C2(b) forwarded the over-cap message. |
| MUT-03-7 | 95c570cb9ed03558c07613eede8a6d1ebf7f2d6fed14f863dbc824f9f9aed3a2 | C1(c) observed numeric path segments. |
| MUT-03-8 | 3fe6e1e04ca8efa147f9c370709e275a0d7427811adf5398c321386ceaed6207 | C1(m) observed invalid_body/non-retryable for 503; C3(c) also reddened. |
| MUT-03-9 | 9a43ffd3cab1b79cf0094ffa53a552f4ed1f730e77cd595a3a379d61b2daae17 | C5(e) escaped as RangeError instead of schema mismatch. |

## 6. Guard-failure probes

These are separate from the nine named mutations. Both were applied and reverted:

| Guard | Probe tree digest | Command | Observed red |
|---|---|---|---|
| C4(g) server-only absence guard: remove the first-line directive from fake.ts. | cba804c35e0df2a447f5c2cba87c35ba6abe7ee758c6a276812cc194cf1fcaa3 | npx vitest run src/lib/proposales/client.test.ts | C4(g) received import { serverEnv }... instead of the directive. |
| C4(h) validation guard: bypass the variation-id failure branch. | f954c046b432bad7ff4f2de4c9a21897287edf7f5096d46e1ded0a7065c290da | npx vitest run src/lib/proposales/client.test.ts | C4(h) resolved null and would have reached fetch instead of rejecting with zero calls. |

## 7. Judgment calls and contract resolution

The applicable architecture contracts were 02-runtime-boundaries.md, 03-feature-architecture.md,
04-server-architecture.md, 06-data-contracts-and-validation.md, 07-integrations.md,
10-security-and-trust-boundaries.md, 11-testing-principles.md, 12-anti-patterns.md,
13-decision-checklist.md, and 14-documentation-principles.md. No contract was added or
amended; no architecture graph is present.

The error-body parser uses the planned response shape defensively and never throws when
the body is malformed. getContent returns the first item defensively if a vendor response
contains more than one item. The fake defaults its company id from serverEnv. The default
factory permits only fetch, now, and sleep overrides, with API key and company id remaining
server configuration. The six-method interface is declared while only the three phase-3
reads are returned. No pagination, proposal writes, persistence, UI, new dependency, or
other later-phase scaffolding was introduced.

## 8. Full write perimeter

### Own changes in checkpoint 1d33f64

- src/lib/errors/app-error.ts
- src/lib/errors/app-error.test.ts
- src/lib/proposales/index.ts
- src/lib/proposales/http.ts
- src/lib/proposales/http.test.ts
- src/lib/proposales/errors.ts
- src/lib/proposales/errors.test.ts
- src/lib/proposales/schemas.ts
- src/lib/proposales/mappers.ts
- src/lib/proposales/mappers.test.ts
- src/lib/proposales/client.ts
- src/lib/proposales/client.test.ts
- src/lib/proposales/fake.ts
- src/lib/proposales/fake.test.ts
- src/lib/proposales/fixtures/content-list.json
- src/lib/proposales/fixtures/companies.json
- src/lib/proposales/fixtures/error-400-issues.json
- src/lib/proposales/README.md
- build_docs/under_constroction/initial_core_feature_proposales/master-plan.md (tracker row 3 only)
- build_docs/under_constroction/initial_core_feature_proposales/plans/phase-03-proposales-transport-and-content.md (append-only Review log)

### Follow-up checkpoint 5227b3ff144c27d0db2b0ab89d839a99516330e7

- src/lib/proposales/http.ts (non-2xx branch moved before body parsing)
- build_docs/under_constroction/initial_core_feature_proposales/plans/phase-03-proposales-transport-and-content.md (append-only Review log)

### Mutation-probe files touched and reverted

- src/lib/proposales/errors.ts
- src/lib/proposales/http.ts
- src/lib/proposales/client.ts
- src/lib/proposales/mappers.ts
- src/lib/proposales/schemas.ts
- src/lib/proposales/fake.ts

No mutation probe touched a test file. tsconfig.tsbuildinfo was regenerated by the
required typecheck, could not be restored because the sandbox denied .git/index.lock
creation, and remains unstaged outside the checkpoint. The final handoff is intentionally
not included in the checkpoint so the checkpoint tree and L4 evidence remain exact.
