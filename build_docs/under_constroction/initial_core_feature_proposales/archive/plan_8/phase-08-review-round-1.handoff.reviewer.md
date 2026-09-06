---
plan: plans/phase-08-ai-provider-boundary.md
role: review
round: 1
verdict: CHANGES_REQUESTED
state: CHANGES_REQUESTED
date: 2026-09-06
actor: Claude reviewer (plan-reviewer doctrine)
---

# Phase 8 review round 1 — the AI provider boundary

**Verdict: `CHANGES_REQUESTED`.** 3 blocking, 5 should-fix, 7 notes, 1 owner card.

**Filename divergence, declared (charter rule 14 spirit).** The prompt names
`handoffs/reviewer/phase-08-review-round-1.reviewer.md`. This file is
`phase-08-review-round-1.handoff.reviewer.md`, matching the only other row in this table
(`phase-08-projection-round-0.handoff.reviewer.md`, which the Astra coordinator renamed to that
form "to satisfy archive naming"). Content is unchanged by the choice; one convention beats two.

## Gate (checked by content, all four true)

- Phase header `state: REVIEWING`; master tracker row 8 `REVIEWING`.
- `src/lib/ai/` contains **twelve** files (`ls -1 | wc -l` = 12).
- `package.json` carries `@ai-sdk/anthropic ^4.0.49` and `@ai-sdk/openai ^4.0.60`.
- Intention §17A.13's AI table has **nine** reasons.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — where does a truncated generation belong?

**Question.** When the model runs out of room mid-answer and produces nothing usable, should
that be reported as a *provider* failure (as it is today), or handed to the run loop as an
unusable answer it may retry once?

**Story.** You paste a long brief with fourteen rooms and a page of terms. The model starts
assembling the proposition, hits its per-answer token ceiling, and stops mid-structure. Today
the run ends immediately with "the AI provider request could not be completed" — the same
sentence you would see if Anthropic had been down. Nothing is retried, and the log tells you the
provider's reply was undecodable, which is not what happened: the reply arrived perfectly, it was
just cut off. Next week, when you are demoing and a long brief truncates, you will go looking for
a provider outage that does not exist.

**Branches.**
- *Keep it as a provider failure* — ships today, nothing unsafe, but the diagnosis is misleading
  and a truncated answer is never retried.
- *Add a tenth provider-failure label for it* — honest diagnosis, but it puts a model outcome
  inside a list the intention defines as integration failures, and it re-opens the list the owner
  closed at round 17.
- *Treat it as an unusable answer owned by the run loop (phase 9)* — matches the intention's own
  boundary between "the provider could not encode a reply" and "the model produced text we cannot
  use", and lets the one bounded retry apply; costs a small shape change to what a model call
  returns, decided in phase 9.

**Recommendation.** Branch 3, staged: keep today's behaviour as the phase-8 stopgap (it is
nonretryable and safe either way) and forward the shape question to phase 9's projection, because
phase 9 is where the retry and the "unusable model output" path actually live and where the change
would be consumed.

**On silence.** The gate holds: phase 8 does not close on this question. The fix round proceeds on
the blocking findings; C6(k) keeps its current mapping and the plan Notes record the open semantic.

**Trace.** Intention §17A.13 (AI table, three boundaries); master §6.3 `AiProviderFailureReason`,
`RunFailureReason`; master §6.4 `GenerateStepResult`; plan rows C6(c), C6(k); phase 9
`MAX_OUTPUT_RETRIES`.

---

## Blocking findings

### B1 — `C2(b)`'s scanner is proven by a copy of itself (coordinator P3, reproduced; repair verified)

**Where.** `src/lib/ai/registry.test.ts:82-83` and `:91-92`; plan row `C2(c)`.

**What is wrong.** `C2(b)` (the guard: no gateway form in production source) and `C2(c)` (the
instrument proof: the scanner sees all four forbidden forms) each declare their **own** regex
literal. `C2(c)` therefore proves a different object than the one `C2(b)` runs. This is §9.1
rule 16's exact failure mode — and rule 16 was written *before* this phase.

**Observation that proves it.** Weakening only `C2(b)`'s literal to `/AI_SDK_DEFAULT_PROVIDER/`
— so it detects neither `@ai-sdk/gateway` in any form nor a `gateway(` call — left
`registry.test.ts` at **9/9 green, `C2(c)` included** (L1, `npx vitest run --project node
src/lib/ai/registry.test.ts`). Tree restored, SHA-256
`27a25c657304efcdcecb4d25ec3c59076880c805edfce4f623c5aaac74720eca`.

**The plan row is where the defect starts.** `C2(c)` asks for "the scanner's **predicate**" without
requiring it to be the *same object* `C2(b)` runs. A row that says "run a predicate with the same
shape" is satisfiable by a copy, and a copy is a second sufficient cause by construction.

**Prescription (run, green, then reverted).** One module-scope instrument, shared by both rows,
plus a non-vacuity assertion that folds in **S3**:

```ts
const AI_DIRECTORY = join(process.cwd(), "src/lib/ai");
const PRODUCTION_MODULES = ["client.ts", "config.ts", "errors.ts", "index.ts", "registry.ts", "scripted.ts", "types.ts"];

function productionModules(): string[] {
  const files = readdirSync(AI_DIRECTORY).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
  expect(files.sort()).toEqual(PRODUCTION_MODULES);   // the scan is never vacuous
  return files;
}

function hasForbiddenGatewayForm(source: string): boolean {
  return /AI_SDK_DEFAULT_PROVIDER|@ai-sdk\/gateway|\bgateway\s*\(/.test(source);
}
```

`C2(b)`, `C2(c)` and `C2(d)` all call these. **Verified both directions:** with the shared
instrument intact, `registry.test.ts` is 9/9 green; weakening the single
`hasForbiddenGatewayForm` to `/AI_SDK_DEFAULT_PROVIDER/` now **reddens `C2(c)`** (1 failed / 8
passed). The hole cannot reopen while the guard and its proof are the same object.

**What the acceptance row must require.** `C2(c)` is rewritten to name the shared symbol:
*"the four synthetic forms are flagged by **the same `hasForbiddenGatewayForm` function `C2(b)`
applies to production source** — not a predicate of the same shape"*, with a named mutation
(`MUT-08-15`, `registry.test.ts` · `hasForbiddenGatewayForm` definition · narrow the alternation
to `AI_SDK_DEFAULT_PROVIDER` → `C2(c)` red). A guard and its proof that can be edited apart are
two guards, and only one of them is watched.

### B2 — a real network failure is not classified `transport`, and is reported nonretryable

**Where.** `src/lib/ai/errors.ts:64-106` (`fromSdkError`); plan row `C4(h)`.

**Violated authority.** Intention §17A.13, AI table row *"network failure at the SDK invocation
(DNS / connect / socket) → `transport` / retryable `true`"*; contract `07-integrations.md` §4
("429 and 5xx set `retryable = true`" — and, symmetrically, a genuinely retryable failure must not
be advertised as final); §17A.13's third boundary, which reserves the unlabelled generic error for
*unrecognizable* thrown values.

**What is wrong.** `@ai-sdk/provider-utils`' `handleFetchError` converts a fetch-level failure into
an **`APICallError` with no `statusCode`** and `isRetryable: true`
(`node_modules/@ai-sdk/provider-utils/dist/index.js:472-513`, called from `postToApi` at `:3512`
and `:3628`, which both vendor providers use). `fromSdkError` never matches it: the status branch
needs a `statusCode`, `isProviderDecodeError` needs a `JSONParseError` cause, the name checks need
`AbortError`/`TimeoutError`, and `error instanceof TypeError` is false for an `APICallError`. It
falls through to the generic `IntegrationError` with **no `reason`** and **`retryable: false`**.

`C4(h)`'s fixture — a bare `TypeError("fetch failed")` — is a shape the boundary does not
produce: a real undici `fetch failed` always carries a cause, and `handleFetchError` wraps it. The
row passes against a synthetic error while production takes a different path.

**Observation that proves it.** End-to-end through the **real** `@ai-sdk/anthropic` provider, the
real `ai@7.0.92` `generateText`, and the real `createAiClient`, with only the injected `fetch`
throwing an undici-shaped `TypeError('fetch failed')` whose cause carries `code: "ECONNREFUSED"`
(no network):

```
E1 thrown class: IntegrationError
E1 details: {"system":"ai_provider","retryable":false,"operation":"generateStep"}
```

Control on the same harness: a real 401 → `AiProviderError` `unauthenticated_upstream`, correct.

### B3 — a provider reply that cannot be decoded is classified `request_rejected`, not `invalid_response`

**Where.** `src/lib/ai/errors.ts:54-72`; plan row `C4(i)`.

**Violated authority.** Intention §17A.13, AI table row *"the provider's reply cannot be decoded as
its own protocol (unreadable or shape-invalid response) → `invalid_response`"*, and its second
stated boundary; master §6.3, which defines `request_rejected` as covering **"any non-`429` 4xx"** —
so a `status: 200` carrying that label contradicts the registry's own definition.

**What is wrong.** `createJsonResponseHandler` raises an **`APICallError` with the 2xx status**
(`statusCode: response.status`, `message: "Invalid JSON response"`) and the decode failure as
`cause` (`@ai-sdk/provider-utils/dist/index.js:3999-4015`). `fromSdkError`'s first branch fires on
any `statusCode !== undefined`, so `statusReason(200)` falls through to the `request_rejected`
default. `isProviderDecodeError`'s third disjunct requires `statusCode === undefined`, which this
path never produces; `InvalidResponseDataError` is raised only on the streaming/batch paths, not
by `generateText`'s `doGenerate`. **`invalid_response` — the member the owner added at round 17 for
exactly this condition — is unreachable on the real path**, and `C4(i)`'s fixture (an `APICallError`
with *no* status carrying a JSON decode cause) is a shape the SDK does not build.

**Observation that proves it.** Same end-to-end harness, injected `fetch` returning a 200 HTML body:

```
E2 thrown class: AiProviderError
E2 details: {"system":"ai_provider","status":200,"retryable":false,"reason":"request_rejected","operation":"generateStep"}
```

A 200 whose JSON parses but fails the provider's own response schema behaves identically
(`cause` is a `TypeValidationError`, mapped to `request_rejected`, status 200).

### Prescription for B2 + B3 — one repair, written and run before being written down

Applied to `errors.ts`, run, typechecked, then reverted byte-identically:

```ts
import { …, TypeValidationError } from "ai";

function isDecodeCause(cause: unknown): boolean {
  return JSONParseError.isInstance(cause) || TypeValidationError.isInstance(cause);
}

function isProviderDecodeError(error: unknown): boolean {
  return (
    InvalidResponseDataError.isInstance(error) ||
    JSONParseError.isInstance(error) ||
    TypeValidationError.isInstance(error) ||
    // the vendor providers surface an undecodable *successful* reply as an
    // APICallError carrying the 2xx status, with the decode failure as `cause`
    (APICallError.isInstance(error) &&
      (error.statusCode === undefined || (error.statusCode >= 200 && error.statusCode <= 299)) &&
      isDecodeCause(error.cause))
  );
}

function isSdkNetworkError(error: unknown): boolean {
  // handleFetchError converts a fetch-level failure into an APICallError with no
  // HTTP status; a bare TypeError only escapes when it carries no cause.
  return error instanceof TypeError || (APICallError.isInstance(error) && error.statusCode === undefined);
}
```

and `fromSdkError` reordered to: **decode → abort/timeout → status → network → NoObjectGenerated
content-filter → NoOutputGenerated → generic**. The decode check must precede the status branch,
because the real shape carries a 2xx status; restricting it to 2xx/absent preserves §17A.13's
transport-precedence principle (a non-2xx is still classified by status, whatever its body).

**Both directions measured.** With the repair: `E1 → transport/true`, `E2 → invalid_response/false`,
`E3` control unchanged, **all 55 tests in `src/lib/ai/` green** (45 phase tests + 10 probe tests),
`npx tsc --noEmit` clean. Without it: E1 and E2 as recorded above. The repair is saved at
`/private/tmp/claude-501/-Users-davidloorenz-Desktop-Developer-Proposales/34e2314a-27c9-434d-b384-68e4bfa40e81/scratchpad/errors.prescription.ts`
for the fix session; it is **not** applied to the tree.

**Rows the fix round must add or rewrite** (the current ones are satisfiable by shapes the boundary
cannot produce):
- `C4(h)` → fixture is what `handleFetchError` builds: an `APICallError` with **no status** and a
  cause carrying a retryable network code. Named mutation: drop the no-status disjunct from
  `isSdkNetworkError` → `C4(h)` red.
- `C4(i)` → fixture is what `createJsonResponseHandler` builds: an `APICallError` with a **2xx
  status** and a `JSONParseError` cause; a second row for the `TypeValidationError` cause. Named
  mutation: move the decode check back after the status branch → both red.
- A third row keeping the boundary honest in the other direction: a **4xx** `APICallError` whose
  cause is a `JSONParseError` still maps by status (`request_rejected`), not `invalid_response` —
  otherwise the repair would silently relabel rejected requests.

## Should-fix findings

### S1 — the client's content-filter branch is unguarded; deleting it leaves the suite green

**Where.** `src/lib/ai/client.ts:161-166`; plan row `C4(k)`.

`C4(k)`'s stated outcome is `content_filtered` **"outranks the invalid-output path of C6(c)"** —
a precedence that lives in `client.ts`'s catch, not in `errors.ts`. The test that claims the row
(`errors.test.ts:73`) exercises `fromSdkError` directly. Nothing drives a content-filtered
`NoObjectGeneratedError` through `generateStep`.

**Observation.** Deleting the inner `if (error.finishReason === "content-filter")` from
`generateStep`'s catch left **all 55 tests in `src/lib/ai/` green**. A filtered generation would
then become `{ kind: "final", output: <the blocked text> }` — a candidate phase 9 would retry under
`MAX_OUTPUT_RETRIES`, buying further provider calls for a request the provider has already refused,
instead of the nonretryable `content_filtered` §17A.13 requires. Restored, `client.ts` SHA-256
`4e3d9071bf96cc7eed907a7317e551694040c084307e21056e6bdf11e1bc2826`.

**Prescription.** Split `C4(k)` into `C4(k)` (the `fromSdkError` mapping, as today) and a new
client-path row: `generateStep` with an injected `generateText` rejecting with
`NoObjectGeneratedError({ finishReason: "content-filter", text: "blocked", usage })` **rejects**
with `AiProviderError` `content_filtered`, and does not resolve to a final candidate. Named
mutation: delete the inner branch → the new row red. This is `C4(q)`'s own clause — *"a correct
`fromSdkError` with no call site cannot satisfy this row"* — which the plan wrote for one row and
not for its neighbour.

### S2 — `isNamedError`'s `instanceof Error` narrowing is unguarded

**Where.** `src/lib/ai/errors.ts:43-45`; plan row `C4(m)`.

The coordinator verified that `instanceof Error` *admits* the production signal (`DOMException`
extends `Error` in Node 22). Nothing verifies it *rejects* an impostor.

**Observation.** Replacing the body with `return (error as { name?: string })?.name === name;`
left **all 55 tests in `src/lib/ai/` green**. `C4(m)`'s fixtures are `{ nope: true }` (no `name`)
and a plain `Error` whose *message* says "timeout" — neither is a non-`Error` value carrying a
recognized `name`, which is precisely the relabelling §17A.13's third boundary forbids.

**Prescription.** Add a `C4(m)` case: `fromSdkError({ name: "TimeoutError" }, op)` produces the
generic `IntegrationError` with **no `reason`** and `retryable: false`. Named mutation: drop the
`instanceof Error` conjunct → that case red. (Run against the current tree: the new case fails
under the mutation and passes without it.)

### S3 — `C2(b)` and `C2(d)` each rebuild the module listing, and neither asserts it is non-empty

`registry.test.ts:80-81` and `:105-106` duplicate the `readdirSync` + filter. Both are loops over
that list; an empty or shrunken list passes both vacuously and nothing observes it. Folded into
**B1**'s prescription (`productionModules()` with `expect(files.sort()).toEqual(PRODUCTION_MODULES)`),
verified green.

### S4 — no acceptance row covers `config.ts`

Task 3 creates `DEFAULT_RUN_BUDGETS` and `AI_CALL_TIMEOUT_MS`. Master §6.5 states their contracts —
each budget a **positive int**, and `AI_CALL_TIMEOUT_MS` **≤ `wallTimeMs`** — and charter rule 13
requires criteria to assert the contract, never the literal. **No row in the 47 asserts either.**
Both hold today (45 000 ≤ 60 000); nothing keeps them holding. Phase 9 computes
`min(AI_CALL_TIMEOUT_MS, remaining wall time)` against these constants, so the invariant is
load-bearing one phase away.

**Prescription.** One new row `C7(a)`: each `DEFAULT_RUN_BUDGETS` value is a positive integer and
`AI_CALL_TIMEOUT_MS <= DEFAULT_RUN_BUDGETS.wallTimeMs`. Named mutation: set `AI_CALL_TIMEOUT_MS`
above `wallTimeMs` → red. Trace: master §6.5, §17A.14.

### S5 — one orphan test

`errors.test.ts:124`, *"keeps the fixed message on a generic mapped integration error"*, traces to
no criterion row and is not declared as a candidate criterion (charter rule 16 / trace chain link
3–4). It is a real assertion — the generic path keeps `GENERIC_AI_ERROR_MESSAGE` — and belongs
inside `C4(m)`, whose row already owns the generic path. Fold it in or declare it as a candidate
criterion; do not ship it untraced. (All other tests in the four files carry row ids; verified by
`grep -n "^\s*it(" … | grep -v "C[0-9]"`, which returns only this line and the `it.each` header
whose row ids are in its case labels.)

## Notes (routed)

| # | Note | Destination |
|---|---|---|
| N1 | `statusReason` sends **3xx** and any status **> 599** to `request_rejected`. Acceptable MVP narrowing — neither is reachable through `fetch` (redirects are followed; HTTP statuses are bounded) and both are correctly nonretryable. The `<= 599` upper bound on the 5xx branch is untested; removing it changes nothing observable today. **No row required**, recorded so it is not re-derived | phase 8 Notes (record and close) |
| N2 | `AgentMessage` form 1 is `role: "user" \| "assistant"` with string content; `toSdkMessages:69` returns it by identity. Type-safe for both roles (`UserModelMessage`/`AssistantModelMessage` both accept `content: string`), but `C6(g)` proves only `user` — rule 2 sampling on a two-member enumeration | phase 8 fix round: add the assistant-text case to `C6(g)` (one line) |
| N3 | `C5(d)`'s three assertions are true by construction: both clients come from one factory, so `Object.keys`, `generateStep.length` and the deep-equal results cannot differ unless the provider leaks into the result. The row is not vacuous *in intent* but no plausible mutation reddens it; `C5(a)` carries the identity claim | phase 8 Notes; reduce the ask rather than delete (§9.0 "trim by reducing an ask") |
| N4 | D22's negative barrel surface (`callModel` and vendor internals not exported from `index.ts`) has **no row**. Verified correct by reading `index.ts`; unguarded. Phase 15 C2 already scans for vendor imports | phase 15 candidate criterion |
| N5 | `createAiClient:136-139`'s `!apiKey` guard is unreachable with a parsed env — `serverEnvSchema`'s refinement guarantees the key for the selected provider. Correct as defence in depth, untested, no row | phase 8 Notes (record and close) |
| N6 | `npm run build` fails on `main` for a pre-existing reason outside this phase (`src/styles/globals.css:1` imports the `tokens.css` the frontend work deleted at `f957f66`). Confirmed not phase 8's and correctly not repaired here. §9.1 rule 10 ("a phase must not break `npm run build`") is currently unobservable on this branch | already carried; keep on the frontend/merge track, not phase 8 |
| N7 | `C4(n)` loops over `AI_PROVIDER_FAILURE_REASONS` and would pass vacuously on an empty registry; nothing asserts the registry is exactly master §6.3's nine members | phase 8 fix round: one `expect(AI_PROVIDER_FAILURE_REASONS).toHaveLength(9)` inside `C4(n)`, or its set equality against master §6.3 |

## What I verified correct (settled ground — do not re-verify on the fix round)

- **Perimeter exact.** `git diff --name-status be0a672 6441770` is the twelve `src/lib/ai/` files,
  `package.json`, `package-lock.json`, the root `README.md` one-liner, the plan, the master plan,
  the handoff, `tsconfig.tsbuildinfo` — nothing else. `.env.example` untouched.
- **`C1(c)`'s `@ts-expect-error` is consumed by the model type and nothing else.** Replacing
  `callModel("claude-3", request)` with `callModel(model, request)` produced exactly
  `client.test.ts(78,7): error TS2578` — the directive is live, and since `C1(e)` calls the same
  function with the same second argument and the same arity, only the first parameter's type can
  consume it. The positive control genuinely closes the arity/argument-count hole.
- **`C4(p)`'s two directives are consumed by the excess properties they name.** Removing `message`
  and `issues` from the two constructor calls produced `errors.test.ts(115,5)` and
  `(117,5): error TS2578`. The row's real instrument is
  `expectTypeOf<typeof AiProviderError>().constructorParameters.toEqualTypeOf<[…]>()`, which is
  exact rather than an absence assertion — no `expectTypeOf(...).not.toHaveProperty` row exists in
  this phase, so §9.1 rule 16's first hazard does not apply here.
- **`toMatchObject({ constructor: AiProviderError })` genuinely discriminates the subclass** —
  an `IntegrationError` fails that assertion. `C4(q)` and `C6(k)`'s class claims are real.
- **`fromSdkError`'s `NoObjectGeneratedError` content-filter branch bites.** Deleting it reddens
  exactly `C4(k)` (1 failed / 54 passed).
- **`maxRetries: 0` genuinely defeats `RetryError` wrapping** — `retryWithExponentialBackoff`
  throws the original error when `maxRetries === 0` (`@ai-sdk/provider-utils/dist/index.js:3807`),
  so the classes `fromSdkError` reads arrive unwrapped. D06 stands as folded.
- **Both vendor providers reach `fromSdkError` through `postJsonToApi` +
  `createJsonResponseHandler`** — verified in `@ai-sdk/anthropic/dist/index.js:4391` and
  `@ai-sdk/openai/dist/index.js:1211`, which is what makes B2 and B3 production facts rather than
  hypotheses.
- **Contract preservation.** `02` §3: all seven production modules carry `import "server-only"` as
  line 1, `types.ts` included. `08` §3: `toSdkTools` builds `tool({ description, inputSchema })`
  with no `execute`, proven by MUT-08-9. `04` §6: the unrecognizable-value path keeps the generic
  DTO with the original `cause`, and `cause` is never serialized. `10` §2: no credential leaves
  `src/lib/ai/`; `resolveModel` is not exported from the barrel; `C4(o)` proves the provider
  sentinel is absent from both `message` and `toErrorDto(...)` and present in `cause`. `10` §11:
  versions pinned through the lockfile, no hand-edit.
- **`C6(a)`'s getter-order instrument is real** — `getterInvoked` observes the getter, not the
  result shape.
- **Usage mapping** — `C5(b)/(f)/(c)/(g)` cover complete, key-exact, all-absent and mixed
  (`0` survives, `undefined` becomes `null`); MUT-08-4a/b/c each bit one field.
- **Scripted fakes** — `C5(e)` covers ordered steps, three recorded calls including the exhausting
  one, `script_exhausted` not imported backwards from phase 9, unmutated step data, and the
  failing fake's message.

## Evidence

L4 stamp taken **once**, on the review tree, at close.

| # | Hypothesis | Scope | Command | Tree | Result |
|---|---|---|---|---|---|
| E-1 | B1 reproduction | L1 | `npx vitest run --project node src/lib/ai/registry.test.ts` (C2(b) regex weakened) | `8fe3482` + probe | **9/9 green** — the defect |
| E-2 | B1 repair, forward | L1 | same, shared instrument applied | `8fe3482` + probe | 9/9 green |
| E-3 | B1 repair, reverse | L1 | same, shared instrument weakened | `8fe3482` + probe | **`C2(c)` red** (1 failed / 8) |
| E-4 | B2/B3 production shapes | L1 | probe file driving the real `postJsonToApi` + real `@ai-sdk/anthropic` + real `generateText` with an injected `fetch` | `8fe3482` + probe | E1 generic/`retryable false`; E2 `request_rejected` status 200; E3 401 control correct |
| E-5 | B2/B3 repair | L2 | `npx vitest run --project node src/lib/ai/` + `npx tsc --noEmit` with the prescription applied | `8fe3482` + probe | **55/55 green**, typecheck clean; E1 → `transport/true`, E2 → `invalid_response/false` |
| E-6 | S1 | L2 | `npx vitest run --project node src/lib/ai/` with `client.ts`'s inner content-filter branch deleted | `8fe3482` + probe | **55/55 green** — the defect |
| E-7 | S2 | L2 | same, `isNamedError`'s `instanceof Error` dropped | `8fe3482` + probe | **55/55 green** — the defect |
| E-8 | C4(k) instrument | L2 | same, `errors.ts` content-filter branch deleted | `8fe3482` + probe | `C4(k)` red — instrument sound |
| E-9 | C1(c) directive | L1 (typecheck) | `npx tsc --noEmit`, string argument replaced by the instance | `8fe3482` | `client.test.ts(78,7) TS2578` |
| E-10 | C4(p) directives | L1 (typecheck) | `npx tsc --noEmit`, `message`/`issues` removed | `8fe3482` | `errors.test.ts(115,5)` and `(117,5) TS2578` |
| E-11 | closing stamp | **L4** | `npm test` · `npm run typecheck` · `npm run lint` | `8fe3482`, `git status --porcelain` empty | **28 files / 380 tests green**, typecheck clean, lint clean |

Consumed by citation, not re-run (tree identity matches the coordinator's stamp): the 380-test
baseline, the perimeter diff, the 47-row/test-name mapping, the `ai@7.0.92` version facts, the
`DOMException`/`AbortSignal.timeout` verification, and coordinator probes P1/P2. No network, no
provider call, no `.env` read, no `npm install`.

## Mutation-probe declaration

Every probe applied and reverted; every file byte-identical to its pre-probe state, matching the
implementer's declared digests:

| File | SHA-256 after restore | Matches implementer's declared digest |
|---|---|---|
| `src/lib/ai/client.ts` | `4e3d9071bf96cc7eed907a7317e551694040c084307e21056e6bdf11e1bc2826` | yes |
| `src/lib/ai/errors.ts` | `2e9258dd0e4052fa604487ce95997002a2705c8500554d29284cbcbb425bc8c2` | yes |
| `src/lib/ai/registry.ts` | `bd352dfe769120b6a3b3fa518c50fd7d88d974bdee96520e9f714eb472f4412e` | yes (untouched) |
| `src/lib/ai/types.ts` | `03cbb98f1e7f74ef4ddff727dcda2b7ec06024264a5cbcb0152bb75729a227e9` | yes (untouched) |
| `src/lib/ai/registry.test.ts` | `27a25c657304efcdcecb4d25ec3c59076880c805edfce4f623c5aaac74720eca` | n/a (test file) |
| `src/lib/ai/client.test.ts` | `1dad1e96dc30515f057e6c6fd2117802417befc136415d3388ad7ede4c95f801` | n/a |
| `src/lib/ai/errors.test.ts` | `3457ca55d28f94a765d14fe8da5558e306059674f83c86e049b4678b3a429751` | n/a |

One **temporary file** was created and deleted: `src/lib/ai/zz-review-probe.test.ts` (the E-4/E-5
harness). It is gone. `tsconfig.tsbuildinfo` was rewritten by the typecheck probes and restored via
`git checkout`. Final `git status --porcelain` at `8fe3482` is **empty**. No database or external
state exists in this phase; none was touched.

## Lessons for the plans

1. **"The scanner's predicate" is not a reference to an object.** Any row that proves an instrument
   must name the **symbol** the guarded row applies, not describe a predicate of the same shape.
   Rule 16 already forbids the defect; the rule's *wording* is what let it through. Candidate
   amendment to §9.1 rule 16: *"a row proving an instrument names the shared symbol; a proof that
   constructs its own copy proves the copy."*
2. **A fixture must be a shape the boundary can actually produce.** `C4(h)` and `C4(i)` were both
   written from the intention's prose ("a `TypeError` raised by the SDK invocation itself") rather
   than from the SDK's error-construction path. This is a new member of the second-sufficient-cause
   family: not two causes for one outcome, but *zero* production causes for the tested one.
   Candidate §9.1 rule: *"where a row names an upstream failure, the fixture is the object the
   upstream library builds — located in its source — not a plausible stand-in."* This applies
   directly to phase 9's tool-failure rows and to phases 11–14's Proposales error rows.
3. **A row whose outcome names two modules needs a test in both.** `C4(k)`'s "outranks the
   invalid-output path of `C6(c)`" is a claim about `client.ts`; its test is in `errors.test.ts`.
   `C4(q)` got this right in the same table ("a correct `fromSdkError` with no call site cannot
   satisfy this row") — the clause should be a standing planner check, not a per-row remark.
4. **Tasks without rows are unguarded surface.** `config.ts` (S4) and the barrel's negative surface
   (N4) are both created by named tasks with no criterion. The manifest checks that every row
   traces to a measurement; nothing checks that every *task* produces a row. Worth a planner lint.

## Carry-forward dispositions

| Item | Destination | State |
|---|---|---|
| Owner card 1 (C6(k) semantics) | owner, then phase 9 projection | open — gate holds |
| N1 `statusReason` 3xx / >599 | phase 8 Notes | record and close |
| N2 assistant-text message case | phase 8 fix round | fix |
| N3 `C5(d)` weak row | phase 8 Notes | record; reduce ask |
| N4 barrel negative surface | phase 15 candidate criterion | route |
| N5 unreachable `!apiKey` guard | phase 8 Notes | record and close |
| N6 `npm run build` on `main` | frontend/merge track | already carried |
| N7 registry length assertion | phase 8 fix round | fix |
| Lessons 1–4 | master §9.1 / planner | coordinator fold |
