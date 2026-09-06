---
plan: plans/phase-08-ai-provider-boundary.md
role: implement
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 8 round 1 implementer handoff

## Opening gate and baseline

All seven prompt gates passed before implementation. Intention line 5 is `RATIFIED`; §17A.13
contains nine AI-provider reasons including `request_rejected` and `invalid_response`, and §23
ends at round 17; master tracker rows 1–7 are `APPROVED` and row 8 is `PROMPT_READY`; the phase
plan is `PROMPT_READY` with 47 rows and 16 distinct mutations; `src/lib/ai/` was absent; `ai` was
present while both vendor packages were absent; and master §9.0.2 is present.

Pre-edit tree identity: `be0a67200ea39a1a93b94403d16fe67638e3192c`, clean porcelain, empty diff
digest `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

Pre-edit baseline: `npm test` — 24 files / 335 tests green; `npm run typecheck` — green;
`npm run lint` — green. This is the required pre-production-edit baseline, not the closing stamp.

## Coverage map (one line per acceptance row)

The executable cases are the named tests in the four colocated test files; the assertion shapes
below match the plan rows, not merely their broad topic.

- C1(a) → `registry.test.ts` anthropic instance test → exact object/modelId/provider assertion.
- C1(b) → `registry.test.ts` openai instance test → exact object/modelId/provider assertion.
- C1(c) → `client.test.ts` compile-time string seam test → `@ts-expect-error` is consumed.
- C1(e) → `client.test.ts` compile-time positive-control test → instance call typechecks without directive.
- C1(d) → `client.test.ts` real-registry model-spy test → spy observes object model and configured modelId.
- C2(a) → `registry.test.ts` global preservation test → global remains undefined and is restored.
- C2(b) → `registry.test.ts` production-source scanner test → all forbidden forms absent.
- C2(c) → `registry.test.ts` scanner instrument test → four synthetic forms flagged and control allowed.
- C2(d) → `registry.test.ts` server-only perimeter test → every production module has the first-line import.
- C3(a) → `registry.test.ts` constructor-throw test → mapped `not_configured`, fixed message, identity cause.
- C3(c) → `registry.test.ts` invocation-throw test → same mapped result from invocation site.
- C3(b) → `registry.test.ts` configured-provider registry test → env schema options and each key resolve.
- C4(a) → `errors.test.ts` status 401 test → `unauthenticated_upstream`, false.
- C4(b) → `errors.test.ts` status 429 test → `rate_limited_upstream`, true.
- C4(c) → `errors.test.ts` status 503 test → `server_error`, true.
- C4(d) → `errors.test.ts` status 403 test → `request_rejected`, false.
- C4(e) → `errors.test.ts` status 408 test → `request_rejected`, false, not timeout.
- C4(f) → `errors.test.ts` AbortError test → timeout, true.
- C4(g) → `errors.test.ts` TimeoutError test → timeout, true.
- C4(h) → `errors.test.ts` SDK TypeError test → transport, true.
- C4(i) → `errors.test.ts` provider decode-error tests → invalid_response, false.
- C4(j) → `client.test.ts` resolved content-filter test → content_filtered, false.
- C4(k) → `errors.test.ts` NoObjectGeneratedError content-filter test → content_filtered, false.
- C4(l) → `registry.test.ts` factory throw observed as reason → not_configured, false.
- C4(m) → `errors.test.ts` unrecognizable-value and message-only tests → generic cause preserved, no inferred retry reason.
- C4(n) → `errors.test.ts` taxonomy-wide details test → AI system, operation, generic message on every row.
- C4(o) → `errors.test.ts` provider-message containment test → absent from message/DTO, present in cause.
- C4(p) → `errors.test.ts` closed-constructor test → type-level rejection of message/issues and exact details keys.
- C4(q) → `client.test.ts` production catch-path test → mapped error from generateStep, not raw SDK error.
- C5(a) → `client.test.ts` identity test → provider/model report exact configured values.
- C5(b) → `client.test.ts` complete-usage test → exactly three mapped counters.
- C5(f) → `client.test.ts` usage-key test → exact key set with no nested SDK details.
- C5(c) → `client.test.ts` absent-usage test → all three counters null.
- C5(g) → `client.test.ts` mixed-usage test → reported zero/7 preserved and undefined becomes null.
- C5(d) → `client.test.ts` config-switch test → same surface/arity/results; only identity differs.
- C5(e) → `scripted.test.ts` scripted/failing fake test → steps, calls, exhaustion and failing fake behavior.
- C6(a) → `client.test.ts` tool-call getter-order test → tool calls map and output getter is untouched.
- C6(b) → `client.test.ts` final-output test → final output is returned unchanged.
- C6(c) → `client.test.ts` NoObjectGeneratedError candidate test → final candidate with mapped usage, no provider error.
- C6(d) → `client.test.ts` tool-conversion test → description/schema preserved and no execute property.
- C6(e) → `client.test.ts` timeout-forwarding test → exact caller timeout/signal plus abort mapping.
- C6(f) → `client.test.ts` retry-option test → SDK call contains `maxRetries: 0`.
- C6(g) → `client.test.ts` system/text mapping test → unchanged system and user text.
- C6(h) → `client.test.ts` assistant-call mapping test → toolCallId/toolName preserved.
- C6(i) → `client.test.ts` tool-result mapping test → array content and correlated toolCallId.
- C6(j) → `client.test.ts` content-filter precedence test → filter error before tool-call branch.
- C6(k) → `client.test.ts` missing-output test → provider error, never invented final output.

Named mutation ledger and closing evidence are pending implementation. The full mutation set is
the 16 distinct ids in the phase table; each will be applied at its named site, run at the row's
smallest sufficient scope, observed red, reverted, and recorded here before closeout.

## Implementation status

Vendor installation has completed normally. Resolved versions and the lockfile delta will be
recorded after implementation. Production files and tests are the next step.

## Mutation ledger

Each probe was applied alone at the named site, run at L1 except where typecheck was the
instrument, observed red, then reverted. The final SHA-256 values of the four mutated production
files equal their pre-probe values: `client.ts`
`4e3d9071bf96cc7eed907a7317e551694040c084307e21056e6bdf11e1bc2826`, `errors.ts`
`2e9258dd0e4052fa604487ce95997002a2705c8500554d29284cbcbb425bc8c2`, `registry.ts`
`bd352dfe769120b6a3b3fa518c50fd7d88d974bdee96520e9f714eb472f4412e`, and `types.ts`
`03cbb98f1e7f74ef4ddff727dcda2b7ec06024264a5cbcb0152bb75729a227e9`.

| Mutation | Exact command | Observed red | Restored |
|---|---|---|---|
| MUT-08-1 | `npm run typecheck` after widening `client.ts:callModel` first parameter to `LanguageModel` | `client.test.ts:78` TS2578 unused `@ts-expect-error`; `client.ts:132` TS2322; C1(c)/C1(d) | yes, client hash restored |
| MUT-08-2 | `npx vitest run --project node src/lib/ai/registry.test.ts -t 'never assigns'` after assigning a typed local fake to `globalThis.AI_SDK_DEFAULT_PROVIDER` in `registry.ts:resolveModel` | C2(a), expected global `undefined`, received `{}` | yes, registry hash restored |
| MUT-08-3 | `npx vitest run --project node src/lib/ai/errors.test.ts -t 'provider text stays'` after passing `error.message` from `fromSdkError` | C4(o), provider sentinel appeared in `mapped.message` | yes, errors hash restored |
| MUT-08-4a | `npx vitest run --project node src/lib/ai/client.test.ts -t 'each unreported'` after `inputTokens ?? 0` | C5(c), input absence became `0` | yes, client hash restored |
| MUT-08-4b | same command after `outputTokens ?? 0` | C5(c), output absence became `0` | yes, client hash restored |
| MUT-08-4c | same command after `totalTokens ?? 0` | C5(c), total absence became `0` | yes, client hash restored |
| MUT-08-5 | `npx vitest run --project node src/lib/ai/registry.test.ts -t 'finds no gateway'` after adding a global-provider read to `types.ts` | C2(b), source scanner identified `types.ts` | yes, types hash restored |
| MUT-08-6 | `npx vitest run --project node src/lib/ai/registry.test.ts -t 'registry keys'` after deleting the `openai` factory | C3(b), configured provider set contained `openai` while factory set did not | yes, registry hash restored |
| MUT-08-7 | `npm run typecheck` after allowing/forwarding constructor `message` | C4(p), exact constructor-parameter assertion and unused `@ts-expect-error` | yes, errors hash restored |
| MUT-08-8 | `npx vitest run --project node src/lib/ai/client.test.ts -t 'production catch path'` after rethrowing the raw SDK error | C4(q), received `APICallError` instead of mapped `AiProviderError` | yes, client hash restored |
| MUT-08-9 | `npx vitest run --project node src/lib/ai/client.test.ts -t 'converts tools'` after adding `execute` | C6(d), converted tool had an `execute` property | yes, client hash restored |
| MUT-08-10 | same command after passing `{}` instead of the descriptor schema | C6(d), supplied schema was not preserved | yes, client hash restored |
| MUT-08-11 | `npx vitest run --project node src/lib/ai/client.test.ts -t 'forwards the caller timeout'` after using `AI_CALL_TIMEOUT_MS` | C6(e), signal timeout called with 45000 instead of 1234 | yes, client hash restored |
| MUT-08-12 | `npx vitest run --project node src/lib/ai/client.test.ts -t 'disables SDK retries'` after dropping `maxRetries` | C6(f), SDK request observed `undefined` instead of `0` | yes, client hash restored |
| MUT-08-13 | `npx vitest run --project node src/lib/ai/registry.test.ts -t 'every production module'` after removing `server-only` from `types.ts` | C2(d), first line was the AI type import | yes, types hash restored |
| MUT-08-14 | `npx vitest run --project node src/lib/ai/client.test.ts -t 'invalid generated output'` after routing `NoObjectGeneratedError` through `fromSdkError` | C6(c), invalid candidate rejected as an integration error | yes, client hash restored |

Mutation arithmetic: declared 16 distinct ids; executed 16; red 16; restored 16.

## Dependency, build, and write perimeter

Resolved package versions: `ai` 7.0.92; `@ai-sdk/anthropic` 4.0.49; `@ai-sdk/openai` 4.0.60;
`@ai-sdk/provider-utils` 5.0.36. `npm install @ai-sdk/anthropic @ai-sdk/openai` added two root
dependency entries and two lockfile package records (34 lockfile lines plus 2 package manifest
lines); no lockfile hand-edit was used.

The authorized `npm run build` was run once and failed before resolving application code because
the pre-existing `src/app/globals.css` import cannot resolve `src/styles/tokens.css`; that file is
absent from the repository. No phase-8 file caused this failure, and the phase did not widen its
perimeter to repair the unrelated scaffold issue.

The full write perimeter is: `package.json`, `package-lock.json`, `README.md`, the twelve files
under `src/lib/ai/`, `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md`
(phase-8 tracker and §10.1), this phase plan (header and Review log), this handoff, and the tracked
`tsconfig.tsbuildinfo` rewrite produced by typecheck. `.env.example` was not changed. Mutation
probes touched only `src/lib/ai/client.ts`, `errors.ts`, `registry.ts`, and `types.ts`, and all
probe edits were reverted; those files are listed separately from the intended fix perimeter above.

## Closing evidence

The authoritative closing L4 stamp on the pre-checkpoint implementation tree is green:
`npm test` — 28 files / 380 tests; `npm run typecheck` — green; `npm run lint` — green. The
pre-edit comparator was 24 files / 335 tests, so the delta is +4 files / +45 tests and zero new
failures. The authorized build result remains the recorded pre-existing missing
`src/styles/tokens.css` resolution failure.

At stamp time, `HEAD` was `be0a67200ea39a1a93b94403d16fe67638e3192c`; the tracked diff digest was
captured by the coordinator before checkpointing. The checkpoint commit contains the exact
perimeter declared above and is the tree identity for downstream review.

No owner decision cards are required. No plan defect or semantic conflict was found.
