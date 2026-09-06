---
plan: phase-08-ai-provider-boundary.md
role: fix
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 8 fix round 2 handoff

## Gate and context

Start gate passed: phase plan and master row 8 were CHANGES_REQUESTED; the phase table declared
7 criteria / 51 rows / 22 distinct mutations including C4(r), C4(s), C4(t), C7(a); the
ratified intention ends at round 18 with the §17A.13 precedence paragraph; master §9.1 has
rules 17 and 18; git log -1 was 3467b9d (review-fold dispatch); phase 7 was APPROVED; and
src/lib/ai contained twelve files. Architecture context re-emitted:
02-runtime-boundaries.md, 06-data-contracts-and-validation.md, 07-integrations.md,
08-agent-architecture.md, 10-security-and-trust-boundaries.md, 11-testing-principles.md,
12-anti-patterns.md, 13-decision-checklist.md, and 14-documentation-principles.md.
src/lib/ai/README.md was read as current integration context.

## Pre-edit baseline

Before editing, npx vitest run --project node src/lib/ai/ reported 4 files / 45 tests passed,
0 failed. No failing row IDs existed because the fix-round rows were not yet present and the
existing suite was green. This is the honest baseline; no red baseline was fabricated.

## Repair

errors.ts now recognizes TypeValidationError and SDK-built status-less APICallError network
failures; accepts decode causes on absent/2xx APICallError values; and orders fromSdkError as
decode -> abort/timeout -> HTTP status -> content filter -> no output -> network -> generic.
The decode branch is limited to absent/2xx status, so non-2xx status classification wins.
invalid_response deliberately omits status: a 2xx is not evidence of a usable response after
decode failure, and the row does not require retaining it.

registry.test.ts now has one module-scope productionModules() instrument asserting the seven
production modules and one module-scope hasForbiddenGatewayForm() symbol shared by C2(b),
C2(c), and C2(d). C7(a) asserts the config contracts. client.test.ts adds the client-path
content-filter guard C4(t) and covers both user and assistant text. errors.test.ts uses the
SDK-built network/decode shapes, adds C4(r), C4(s), the timeout-name impostor, exact reason-set
equality, and folds the generic-message assertion into C4(m).

## Coverage map (one line per acceptance row)

Every assertion below matches the row's specified shape, not a weaker proxy.

- C1(a) -> registry C1(a), anthropic object model; exact.
- C1(b) -> registry C1(b), openai object model; exact.
- C1(c) -> client C1(c)/C1(e), string call consumes ts-expect-error; exact.
- C1(e) -> client C1(c)/C1(e), identical request with instance typechecks; exact.
- C1(d) -> client C1(d), real registry sends object with configured model id; exact.
- C2(a) -> registry C2(a), global undefined before/after create and call; exact.
- C2(b) -> registry C2(b), shared scanner over asserted seven-module listing; exact.
- C2(c) -> registry C2(c), same scanner flags static/type-only/dynamic/global forms; exact.
- C2(d) -> registry C2(d), shared listing has server-only first on every module; exact.
- C3(a) -> registry C3(a)/C4(l), construction throw maps not_configured with cause; exact.
- C3(c) -> registry C3(c), invocation throw maps not_configured; exact.
- C3(b) -> registry C3(b), configured provider set equals factory set and every name resolves; exact.
- C4(a) -> errors it.each C4(a), 401 unauthenticated/nonretryable; exact.
- C4(b) -> errors it.each C4(b), 429 rate-limited/retryable; exact.
- C4(c) -> errors it.each C4(c), 503 server-error/retryable; exact.
- C4(d) -> errors it.each C4(d), 403 rejected/nonretryable; exact.
- C4(e) -> errors it.each C4(e), 408 rejected/nonretryable; exact.
- C4(f) -> errors C4(f), AbortError timeout/retryable; exact.
- C4(g) -> errors C4(g), TimeoutError timeout/retryable; exact.
- C4(h) -> errors C4(h), SDK statusless network wrapper and bare TypeError transport/retryable; exact.
- C4(i) -> errors C4(i), 2xx APICallError plus JSONParseError invalid_response; exact.
- C4(r) -> errors C4(r), 2xx APICallError plus TypeValidationError invalid_response; exact.
- C4(s) -> errors C4(s), 403 plus decode cause remains status-rejected; exact.
- C4(t) -> client C4(t), injected filtered NoObjectGeneratedError rejects through catch; exact.
- C4(j) -> client C4(j)/C6(j), resolved filter outranks tool calls; exact.
- C4(k) -> errors C4(k), thrown filtered NoObjectGeneratedError maps filtered; exact.
- C4(l) -> registry C3(a)/C4(l), construction failure reason; exact.
- C4(m) -> errors C4(m), object/message/impostor remain generic without reason; exact.
- C4(n) -> errors C4(n), exact nine-member registry and safe details; exact.
- C4(o) -> errors C4(o), provider sentinel only in cause; exact.
- C4(p) -> errors C4(p), exact constructor type rejects message/issues; exact.
- C4(q) -> client C4(q), production catch maps APICallError; exact.
- C5(a) -> client C5(a), configured identity; exact.
- C5(b) -> client C5(b)/C5(f), complete usage maps three counters; exact.
- C5(f) -> client C5(b)/C5(f), usage keys exact; exact.
- C5(c) -> client C5(c), all absent counters null; exact.
- C5(g) -> client C5(g), zero survives and absence is null; exact.
- C5(d) -> client C5(d), equivalent injected result/surface across providers; exact.
- C5(e) -> scripted both C5(e) tests, ordered/exhaustion/immutability/failing fake; exact.
- C6(a) -> client C6(a), tool calls before throwing output getter; exact.
- C6(b) -> client C6(b), final output unchanged; exact.
- C6(c) -> client C6(c), invalid text is a candidate; exact.
- C6(d) -> client C6(d), schema/description preserved and execute absent; exact.
- C6(e) -> client C6(e), caller timeout/signal identity and abort mapping; exact.
- C6(f) -> client C6(f), maxRetries is zero; exact.
- C6(g) -> client C6(g), user and assistant text unchanged; exact.
- C6(h) -> client C6(h), assistant tool-call correlation; exact.
- C6(i) -> client C6(i), tool-result array and call id; exact.
- C6(j) -> client C4(j)/C6(j), filter outranks tool calls; exact.
- C6(k) -> client C6(k), no-output finish is not final success; exact.
- C7(a) -> registry C7(a), positive-integer budgets and timeout <= wall time; exact.

Reverse trace: all 16 errors tests, all 10 registry tests, all client test labels, and both
scripted tests are represented above. No orphan test remains.

## Mutation ledger

All 22 distinct IDs ran one at a time, each red, each reverted. The 25 criterion-site
occurrences reconcile as C1=1, C2=4, C3=1, C4=7, C5=3, C6=5, C7=1. Shared IDs:
MUT-08-1 serves C1(c)/C1(d), and MUT-08-17 serves C4(i)/C4(r)/C4(s).

| Mutation | Command/site | Observed red |
|---|---|---|
| MUT-08-1 | npm run typecheck; client.ts callModel widened to LanguageModel | TS2578 at client.test.ts:78 and TS2322 at client.ts:132; C1(c)/C1(d) |
| MUT-08-2 | vitest registry C2(a); resolveModel assigned typed fake SDK global | C2(a), expected undefined and received {} |
| MUT-08-3 | vitest errors C4(o); fixed AI message replaced by cause message | C4(o), provider sentinel appeared in mapped.message |
| MUT-08-4a | vitest client C5(c); inputTokens ?? 0 | input absence became 0 |
| MUT-08-4b | vitest client C5(c); outputTokens ?? 0 | output absence became 0 |
| MUT-08-4c | vitest client C5(c); totalTokens ?? 0 | total absence became 0 |
| MUT-08-5 | vitest registry C2(b); provider-global read added to types.ts | scanner identified types.ts |
| MUT-08-6 | vitest registry C3(b); openai factory deleted | configured openai missing from factory set |
| MUT-08-7 | npm run typecheck; constructor message/issues accepted and forwarded | exact constructor assertion failed and both ts-expect-error directives were unused |
| MUT-08-8 | vitest client C4(q); raw SDK error rethrown | APICallError received, not AiProviderError |
| MUT-08-9 | vitest client C6(d); execute added to tool conversion | converted tool had execute |
| MUT-08-10 | vitest client C6(d); schema replaced with {} | supplied schema not preserved |
| MUT-08-11 | vitest client C6(e); AI_CALL_TIMEOUT_MS used at call site | spy received 45000 instead of 1234 |
| MUT-08-12 | vitest client C6(f); maxRetries omitted | request observed undefined instead of 0 |
| MUT-08-13 | vitest registry C2(d); server-only import deleted from types.ts | first line was the AI type import |
| MUT-08-14 | vitest client C6(c); NoObjectGeneratedError routed through mapper | candidate rejected as integration error |
| MUT-08-15 | vitest registry C2(c); shared scanner narrowed to global name | first synthetic gateway import not flagged |
| MUT-08-16 | vitest errors C4(h); statusless APICallError disjunct removed | SDK network wrapper became generic/nonretryable |
| MUT-08-17 | vitest errors C4(i)/C4(r)/C4(s); decode moved after status | C4(i)/C4(r) failed as request_rejected/status 200; C4(s) stayed the status control |
| MUT-08-18 | vitest client C4(t); client filtered-output branch deleted | promise resolved to final candidate |
| MUT-08-19 | vitest errors C4(m); instanceof Error removed from isNamedError | impostor became timeout/retryable |
| MUT-08-20 | vitest registry C7(a); timeout raised to 60001 | timeout exceeded wall time 60000 |

MUT-08-3 has a stale site description: after D11 narrowed the constructor, fromSdkError
cannot legally pass a caller message. The feasible equivalent at the AiProviderError fixed
message super-call reddened the same C4(o) assertion and was reverted. No other plan or saved
prescription defect was found.

## Verification and closeout

The one closing L4 stamp:
npm test -> 28 files / 383 tests passed.
npm run typecheck -> clean.
npm run lint -> clean.

No build, network, provider call, .env read, or npm install was run in this fix round.
The pre-existing build failure remains outside this perimeter.

Documentation impact review under 14 §8: only error classification and test guards changed;
src/lib/ai/README.md remains accurate, so no README changed.

### Full write perimeter

Fix-owned changes:
1. src/lib/ai/errors.ts
2. src/lib/ai/registry.test.ts
3. src/lib/ai/errors.test.ts
4. src/lib/ai/client.test.ts
5. plans/phase-08-ai-provider-boundary.md (state and Review log)
6. master-plan.md (row 8 state)
7. this handoff

Mutation-only files applied and reverted byte-for-byte:
src/lib/ai/client.ts, src/lib/ai/registry.ts, src/lib/ai/errors.ts, src/lib/ai/client.test.ts,
src/lib/ai/types.ts, src/lib/ai/config.ts, src/lib/ai/registry.test.ts, and
src/lib/ai/errors.test.ts.

tsconfig.tsbuildinfo was transiently rewritten by typecheck and restored before closeout;
no probe file was created; no production client.ts, registry.ts, types.ts, or config.ts
change remains.

Current source restoration digests:
- src/lib/ai/errors.ts: a1c241b6cbbae3e612dc80d969f98f2669031eb13b7aa2f0ed3d8bb56345b4e4
- src/lib/ai/client.ts: 4e3d9071bf96cc7eed907a7317e551694040c084307e21056e6bdf11e1bc2826
- src/lib/ai/registry.ts: bd352dfe769120b6a3b3fa518c50fd7d88d974bdee96520e9f714eb472f4412e
- src/lib/ai/types.ts: 03cbb98f1e7f74ef4ddff727dcda2b7ec06024264a5cbcb0152bb75729a227e9
- src/lib/ai/config.ts: dc74e48b35e3be3638493cfcdff8e8023f68900914fd0804222e6f6a5f6f99ce

No owner decision card is open.

