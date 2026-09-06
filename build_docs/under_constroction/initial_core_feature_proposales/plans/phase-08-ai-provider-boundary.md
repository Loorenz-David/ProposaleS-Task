---
plan: 8
phase: AI provider boundary (`@/lib/ai`)
state: IMPLEMENTED
date: 2026-09-06
author: implementation-planner round 1; amended by the coordinator at the projection round-0 fold
---

# Phase 8 — AI provider boundary (`@/lib/ai`)

## Goal

Create `src/lib/ai/`: install the two candidate vendor packages, the provider registry that turns `(AI_PROVIDER, AI_MODEL, key)` into a **model instance**, the `AiClient` with one `generateStep` operation whose internal signature cannot accept a string model id, provider error translation with no upstream message crossing, per-call usage reporting with `null` for unreported figures, and the scripted and failing fakes.

**Not in this phase:** the run loop and budgets (phase 9); any prompt.

## Read first

1. Master plan §5 (R4), §6.2 (`AI_*`), §6.3 (`AiProviderFailureReason`), §6.4 (`LanguageModelInstance`, `AiClient`, `GenerateStepInput/Result`), §6.5 (`DEFAULT_RUN_BUDGETS`, `AI_CALL_TIMEOUT_MS`), §6.6 (`createAiClient`, `createScriptedAiClient`, `createFailingAiClient`), §10.1 (vendor versions), §11 follow-up 4.
2. Intention §17A.15 (all), §17A.13 (AI provider failures), §17A.14 (usage `null` rule), §12.2.
3. Evidence doc §9, §9.1.
4. Installed package: `node_modules/ai/dist/index.d.ts` — `LanguageModel` (line ~112: includes `GlobalProviderModelId`), `generateText`, `Output.object`, `tool`, `jsonSchema`, `APICallError`, `NoObjectGeneratedError`.
5. Contracts: `07-integrations.md` §4, §5, §8, §10; `08-agent-architecture.md` §8; `10-security-and-trust-boundaries.md` §2, §11; `06-data-contracts-and-validation.md` §5.

## Dependencies (gate)

Phase 7 `APPROVED`.

## Files expected to change

`package.json`, `package-lock.json` (existing; add `@ai-sdk/anthropic`, `@ai-sdk/openai`) · `src/lib/ai/index.ts`, `types.ts`, `config.ts`, `registry.ts`, `registry.test.ts`, `client.ts`, `client.test.ts`, `errors.ts`, `errors.test.ts`, `scripted.ts`, `scripted.test.ts`, `README.md` (all twelve new, under `src/lib/ai/`) · `.env.example` unchanged (phase 1 listed the variables) — 14 implementation paths. Pipeline writes additionally include this plan's state and Review log, master-plan tracker/state and §10.1 resolved vendor versions, and the session handoff; each is declared in the session perimeter.

## Implementation tasks (ordered)

Task shapes below fold projection round 0's decision ledger (D01–D24). Where a task names a
concrete shape the projection proposed, it was verified against the installed SDK or Zod before
being written here; the verifications are recorded in the Review log.

1. `npm install @ai-sdk/anthropic @ai-sdk/openai`. Record the **actual resolved versions** of `ai`,
   both vendor packages and any provider-utils change, plus the lockfile delta, in the handoff and
   Review log; the coordinator folds them into master §10.1 before review (D16). The lockfile is in
   this phase's perimeter — security contract `10` §11 pins versions through it (D17). Do not
   hand-edit it. Keep `ai@7.0.92`; if the install moves it, re-verify the `LanguageModel` alias, the
   `output` getter and the retry default **before** implementing against the evidence below.
2. `types.ts`: `AiProvider`, `LanguageModelInstance = Exclude<LanguageModel, string>`, `AiClient`,
   `GenerateStepInput`, `GenerateStepResult`, `Usage`, `JsonSchema`, `ToolDescriptor`, and
   `AgentMessage` **in the three closed forms master §6.4 now registers** (text · assistant tool
   calls · tool results, correlated by `toolCallId`). The SDK's message union is never aliased or
   re-exported here (D03). Carries `import "server-only"` like every other module in this directory
   (D20; master §6.1 admits no type-only exemption).
3. `config.ts`: `DEFAULT_RUN_BUDGETS`, `AI_CALL_TIMEOUT_MS`.
4. `registry.ts`: `resolveModel({ provider, model, apiKey }, factories = DEFAULT_FACTORIES)`.
   `DEFAULT_FACTORIES` is `satisfies Record<AiProvider, …>` built from `createAnthropic({ apiKey })`
   and `createOpenAI({ apiKey })`. **Both throw sites are inside the catch** — constructing the
   vendor factory and invoking it for a model id — and both become `AiProviderError` reason
   `not_configured` with `operation: "resolveModel"` (D10). Never touches
   `globalThis.AI_SDK_DEFAULT_PROVIDER`.
5. `errors.ts`: `GENERIC_AI_ERROR_MESSAGE`; `AiProviderError extends IntegrationError` with a
   **narrowed** constructor — `{ reason: AiProviderFailureReason, operation: string, status?: number,
   retryable: boolean, cause?: unknown }` and nothing else. It supplies `system: "ai_provider"` and
   `GENERIC_AI_ERROR_MESSAGE` itself; no caller may pass a message and no `issues` array is
   accepted (`IntegrationError` inherits an open `reason?: string`, a caller `message` and an
   `issues` passthrough — verified at `src/lib/errors/app-error.ts:125`–`:150` — and this subclass
   closes all three; D11). `fromSdkError(err, operation)` implements the **total** §17A.13 table:
   401 → `unauthenticated_upstream`, 429 → `rate_limited_upstream`, 5xx → `server_error`, any other
   4xx → `request_rejected`, a provider-protocol decode failure → `invalid_response`, a local
   abort/timeout → `timeout`, a network failure at the SDK invocation → `transport`, a reported
   content filter → `content_filtered`; the factory path supplies `not_configured`. An HTTP `408`
   is a **received reply** and therefore `request_rejected`, never `timeout`. An unrecognizable
   thrown value keeps the generic DTO with its original `cause` and is a programming error under
   contract `04` §6 — retryability is never inferred from a message substring (D01).
6. `client.ts`: `createAiClient(env = serverEnv, deps = { generateText, resolveModel })` — a
   factory, not a service; nothing is constructed at import (D19). It resolves the model once and
   exposes `generateStep(input, { timeoutMs })`.
   - A **module-local `callModel(model: LanguageModelInstance, request)`** is the one place
     `deps.generateText` is invoked, exported for the colocated test only and not from the barrel
     (D02). `generateStep` must call this exact function.
   - The SDK call sets **`maxRetries: 0`** explicitly. The SDK default is 2 (verified,
     `ai/dist/index.d.ts:4790`); leaving it would make hidden provider calls and would deliver
     failures wrapped in `RetryError.lastError` rather than the classes `fromSdkError` reads (D06).
     Bounded retry is phase 9's, on model **output**, not on transport.
   - `abortSignal: AbortSignal.timeout(timeoutMs)` forwards the caller's ceiling exactly; the
     adapter applies no second minimum (D07).
   - **Result branch order, and it is binding** (D05): (1) a reported content filter →
     `AiProviderError` `content_filtered`; (2) `toolCalls` present → `{ kind: "tool_calls" }`;
     (3) only then the final mapping. `result.output` is a **getter that throws
     `NoOutputGeneratedError`** when absent (verified, `ai/dist/index.js:6417`), so it is never read
     eagerly and never on a tool step. A `length` / `error` / `other` finish with no output is a
     failure, not a silent `final`.
   - **Invalid generated output is not an integration failure** (D04). `Output.object` parses and
     validates *before* `generateText` resolves and throws `NoObjectGeneratedError` carrying `text`,
     `usage` and `finishReason` (verified, `ai/dist/index.js:3733`, class at `dist/index.d.ts:6875`).
     When its `finishReason` is `content-filter` it classifies as `content_filtered` (branch 1);
     otherwise it becomes `{ kind: "final", output: err.text, usage: <from err.usage> }` — an
     invalid **candidate** that phase 9's validator owns and may retry under `MAX_OUTPUT_RETRIES`.
     Wrapping it as a provider error would make intention §17A.13's bounded model-output retry
     unreachable. No SDK exception, SDK type or raw generated text ever reaches an `ErrorDto`.
   - Messages and tools convert per master §6.4: the three `AgentMessage` forms map to the SDK's
     text, assistant tool-call and array-content tool messages (D03); each `ToolDescriptor` becomes
     `tool({ description, inputSchema: jsonSchema(inputJsonSchema) })` with **no `execute`** (D14).
   - `usage` maps **exactly three named fields** with `?? null` each. `LanguageModelUsage` also
     carries nested `inputTokenDetails` / `outputTokenDetails` (verified, `dist/index.d.ts:318`), so
     `{}` is not a complete fixture and whole-object mapping would leak SDK fields. A reported `0`
     stays `0` (D12). This `?? null` remains the documented exception to rule 2.
7. `scripted.ts`: `createScriptedAiClient(steps)` and `createFailingAiClient()`;
   `provider: "scripted"`, `model: "scripted"`. `calls` records **every attempted** call including
   the one that exhausts the script, and the fake never mutates the scripted step data. The
   exhaustion error is a small local `Error` subclass carrying `readonly reason = "script_exhausted"`
   — phase 9's `RunFailureReason` is **not** imported backwards and `script_exhausted` is **not** an
   `AiProviderFailureReason` (D21).
8. `index.ts`: `import "server-only"`; lazy `getAiClient()`. The barrel exports the domain types,
   `createAiClient`, the fakes, the config constants and the error class — **not** `callModel` and
   not any vendor factory internal (D22).
9. `README.md` under `src/lib/ai/`: how the app uses the provider layer; the string-model-id hazard
   (link evidence §9.1); configuration ownership; error translation; that no message crosses. Then
   the documentation-impact review of contract `14` §8: the root README says no model provider is
   configured yet, which this phase falsifies. If that wording is still present, amend the one line
   and add `README.md` to the perimeter (D23). Evidence §9 is preserved as dated evidence and is
   not rewritten to describe the new tree.
10. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | anthropic model instance | `resolveModel({ provider: "anthropic", model: "m", apiKey: "k" })` | returns an object (`typeof !== "string"`) with `modelId === "m"` and `provider` containing `anthropic` | — | M16 |
| C1(b) | openai model instance | same for `openai` | an object with `modelId === "m"`, `provider` containing `openai` | — | M16 |
| C1(c) | a string is unrepresentable at the seam | a `// @ts-expect-error` line in `client.test.ts` calling `callModel("claude-3", <valid request>)` inside a function that is never invoked | `npm run typecheck` passes — the directive is consumed | MUT-08-1 `client.ts` · `callModel` **definition site** · widen the first parameter to `LanguageModel` → the directive is unused, typecheck fails with TS2578, **and** C1(d) reddens | M16, §17A.15 |
| C1(e) | the negative row is not vacuous (positive control) | the same uninvoked function calls `callModel(<a real instance>, <the identical remaining request>)` with **no** directive | typecheck passes; the only difference between the two calls is the first argument, so nothing but the model type can be consuming the directive in C1(c) | — | §17A.15, rule 16 |
| C1(d) | the SDK receives an instance | build the client through the real `registry.ts` (not a hand-made helper) with a spy `generateText` | `typeof spy.calls[0].model === "object"`; `spy.calls[0].model.modelId === env.AI_MODEL` | (MUT-08-1) | M16 |
| C2(a) | global provider untouched | save `globalThis.AI_SDK_DEFAULT_PROVIDER`, run `createAiClient` and one `generateStep`, restore in `finally` | the global is `undefined` throughout and is restored after | MUT-08-2 `registry.ts` · `resolveModel` · assign the global from a **typed local fake provider** defined in the mutation itself (never an undeclared `gateway` identifier, which would fail on the symbol rather than the assertion) → C2(a) red | M16, §17A.15 |
| C2(b) | no gateway in source | `productionModules()` — **one** module-scope helper, shared by C2(b), C2(c) and C2(d), which lists `src/lib/ai/*.ts` excluding `*.test.ts` **and asserts the listing equals the seven named modules**, so no row above it can pass over an empty list (S3). Each file's text is tested by `hasForbiddenGatewayForm`, likewise **one** module-scope symbol | no production module is flagged | MUT-08-5 `types.ts` · module top level · add `void globalThis.AI_SDK_DEFAULT_PROVIDER;` → C2(b) red | M16, rule 17 |
| C2(c) | the scanner can actually see each forbidden form (instrument proof) | apply **the same `hasForbiddenGatewayForm` symbol C2(b) applies to production source** — not a predicate of the same shape — to four synthetic strings: a static `import … from "@ai-sdk/gateway"`, an `import type … from "@ai-sdk/gateway"`, a dynamic `await import("@ai-sdk/gateway")`, and a bare `globalThis.AI_SDK_DEFAULT_PROVIDER` read | each of the four is flagged; a control string naming none of them is not | MUT-08-15 `registry.test.ts` · the `hasForbiddenGatewayForm` **definition** · narrow the alternation to `AI_SDK_DEFAULT_PROVIDER` → C2(c) red. Before the repair this same weakening left the file 9/9 green, because C2(c) proved a copy | rule 16, **rule 17**, M16 |
| C2(d) | every module is server-only | `productionModules()` — the same shared listing C2(b) uses | each file's **first line** is `import "server-only";` — `types.ts` included | MUT-08-13 `types.ts` · remove the import → C2(d) red | 02 §3, master §6.1, rule 17 |
| C3(a) | `not_configured` — construction site | a `factories` entry whose **factory constructor** throws | `AiProviderError`, reason `not_configured`, `retryable false`, `GENERIC_AI_ERROR_MESSAGE`, `operation "resolveModel"`, `cause` is the thrown error by identity | — | M16, §17A.13 |
| C3(c) | `not_configured` — invocation site | a factory that constructs fine and throws when **invoked with the model id** | the same outcome as C3(a); the two sites are separate fixtures because one catch can cover only one of them | — | §17A.13, D10 |
| C3(b) | registry total over the configured providers | `serverEnvSchema.shape.AI_PROVIDER.options` (verified in `zod@4.5.4`: `.superRefine()` returns a `ZodObject`, so `.shape` survives and `.options` is `["anthropic","openai"]`) | `Object.keys(DEFAULT_FACTORIES)` deep-equals that tuple as a set, and **each name in it** resolves through `resolveModel` to an object. Not a handwritten two-item loop: `AiProvider` is a type union and is erased at runtime | MUT-08-6 `registry.ts` · `DEFAULT_FACTORIES` · delete the `openai` entry → C3(b) red | §17A.15 |
| C4(a) | 401 | `APICallError` status 401 | `(unauthenticated_upstream, false)` | — | §17A.13, M6, crit 9 |
| C4(b) | 429 | `APICallError` status 429 | `(rate_limited_upstream, true)` | — | §17A.13, M6 |
| C4(c) | 5xx | `APICallError` status 503 | `(server_error, true)` | — | §17A.13, M6 |
| C4(d) | any other 4xx | `APICallError` status 403 | `(request_rejected, false)` | — | §17A.13 round 17, 07 §4 |
| C4(e) | 408 is a reply, not a local timeout | `APICallError` status 408 | `(request_rejected, false)` — **not** `timeout`; the provider answered | — | §17A.13 round 17 |
| C4(f) | local abort | `DOMException` name `AbortError` | `(timeout, true)` | — | §17A.13, M6 |
| C4(g) | local timeout | `DOMException` name `TimeoutError` (what `AbortSignal.timeout` raises) | `(timeout, true)` — a separate fixture from C4(f); the two are recognized by class **and** name | — | §17A.13, M6 |
| C4(h) | network failure, in the shape the SDK actually builds | an `APICallError` with **no `statusCode`** and a cause carrying a network code — what `handleFetchError` constructs from a `fetch` rejection (`@ai-sdk/provider-utils/dist/index.js:472`–`:513`, reached from `postToApi`, used by both vendor providers). A bare `TypeError` is kept as a second fixture, since one escapes only when it carries no cause | `(transport, true)` for both | MUT-08-16 `errors.ts` · `isSdkNetworkError` · drop the status-less `APICallError` disjunct → C4(h) red | §17A.13 precedence 3, M6, **rule 18** |
| C4(i) | undecodable reply, in the shape the SDK actually builds | an `APICallError` carrying the **2xx** status of the reply and a `JSONParseError` cause — what `createJsonResponseHandler` constructs when a successful reply will not parse (`@ai-sdk/provider-utils/dist/index.js:3999`–`:4015`). `InvalidResponseDataError` is kept as a second fixture | `(invalid_response, false)` | MUT-08-17 `errors.ts` · `fromSdkError` · move the decode check back **after** the status branch → C4(i) and C4(r) red | §17A.13 precedence 1, **rule 18** |
| C4(r) | a 2xx that parses but fails the provider's own schema | an `APICallError` with a 2xx status and a `TypeValidationError` cause | `(invalid_response, false)` — the same class of failure as C4(i); JSON that parses is not JSON we can use | (MUT-08-17) | §17A.13 precedence 1 |
| C4(s) | a decode failure never overrides a status | an `APICallError` with status **403** whose cause is a `JSONParseError` | `(request_rejected, false)` — classified by status, not by its unreadable body. Without this row the C4(i) repair could silently relabel every rejected request whose error body is malformed | (MUT-08-17, in the other direction) | §17A.13 precedence 2 |
| C4(t) | the client's content-filter branch, not just the mapper's | drive `generateStep` with an injected `generateText` rejecting `NoObjectGeneratedError({ finishReason: "content-filter", text: "blocked", usage })` | `generateStep` **rejects** with `AiProviderError` `content_filtered`; it does not resolve to a `{ kind: "final" }` candidate. C4(k) proves the mapper; this proves the call site, and the precedence C4(k) *names* lives here | MUT-08-18 `client.ts` · `generateStep` catch · delete the inner `finishReason === "content-filter"` branch → C4(t) red. Before this row that deletion left the whole `src/lib/ai` suite green, turning a refused generation into a candidate phase 9 would pay to retry | §17A.13, D05, rule 17's sibling |
| C4(j) | content filter, resolved | a resolved result whose finish reason is `content-filter` | `(content_filtered, false)` | — | §17A.13, M6 |
| C4(k) | content filter, thrown | `NoObjectGeneratedError` whose `finishReason` is `content-filter` | `(content_filtered, false)` — outranks the invalid-output path of C6(c) | — | §17A.13, D05 |
| C4(l) | factory throw | the C3(a) fixture, observed as a reason row | `(not_configured, false)` | — | §17A.13, M6 |
| C4(m) | an unrecognizable value is not relabelled | three fixtures: `{ nope: true }` (not an `Error`); a plain `Error` whose **message** contains `timeout`; and **an impostor** — a non-`Error` object carrying `{ name: "TimeoutError" }` | none becomes `timeout` or `transport`; each produces the generic `IntegrationError` with **no `reason`**, `retryable: false`, `GENERIC_AI_ERROR_MESSAGE`, and the original value at `cause`. Retryability and reason are never read from a message or from a `name` on a value that is not an `Error` | MUT-08-19 `errors.ts` · `isNamedError` · drop the `instanceof Error` conjunct → C4(m) red on the impostor fixture. Without that fixture the narrowing was unguarded in both directions | §17A.13 boundary 3, 04 §6 |
| C4(n) | every row is the AI system, and the registry is the ratified one | iterate `AI_PROVIDER_FAILURE_REASONS` | the exported registry is **exactly** master §6.3's nine members (set equality, so the loop cannot pass over a shortened list), and each yields `details.system === "ai_provider"`, `details.operation` present, and `GENERIC_AI_ERROR_MESSAGE` | — | §17A.13, master §6.3, rule 17 |
| C4(o) | provider message never crosses | SDK error message `PROVIDER-MSG-SENTINEL` | absent from `err.message` and from `JSON.stringify(toErrorDto(err))`; present in `String(err.cause)` | MUT-08-3 `errors.ts` · `fromSdkError` · pass `message: err.message` → C4(o) red | §17A.13, M6 |
| C4(p) | the constructor is closed | attempt to construct `AiProviderError` with a caller `message` and an `issues` array | both are type errors (`expectTypeOf`), and the constructed error's `details` keys are exactly `{ system, retryable, reason, operation }` plus `status` when present — no `issues` key | MUT-08-7 `errors.ts` · `AiProviderError` constructor · accept and forward a caller `message` → C4(p) red | D11, 04 §6 |
| C4(q) | the production catch path uses the mapper | drive an `APICallError` 401 and an abort rejection through `generateStep` with an injected failing `generateText` | `generateStep` rejects with the mapped `AiProviderError` (`operation "generateStep"`), not the raw SDK error. A correct `fromSdkError` with no call site cannot satisfy this row | MUT-08-8 `client.ts` · `generateStep` catch · rethrow the raw error → C4(q) red | D10, §17A.13 |
| C5(a) | report identity | env `AI_PROVIDER=openai`, `AI_MODEL=x`, parsed explicitly | `client.provider === "openai"`, `client.model === "x"` | — | M15, crit 14 |
| C5(b) | usage mapped | spy returns a **complete** `LanguageModelUsage`: `inputTokens: 10, outputTokens: 5, totalTokens: 15` plus populated `inputTokenDetails` / `outputTokenDetails` | `result.usage` deep-equals `{ inputTokens: 10, outputTokens: 5, totalTokens: 15 }` | — | M15 |
| C5(f) | no SDK field leaks | the same fixture | `Object.keys(result.usage)` is exactly those three names; no detail object appears | — | M15, D12 |
| C5(c) | unreported is null | spy returns a complete usage object whose three counters are `undefined` | every usage field `=== null`, none `0` | MUT-08-4a `client.ts` · usage mapping · `inputTokens: … ?? 0`; MUT-08-4b same for `outputTokens`; MUT-08-4c same for `totalTokens` — applied **one at a time**, each reddening C5(c). One mutation on one field cannot certify three guards | M15, §17A.14 |
| C5(g) | mixed, and a reported zero survives | spy returns `inputTokens: 0`, `outputTokens: undefined`, `totalTokens: 7` | `{ inputTokens: 0, outputTokens: null, totalTokens: 7 }` — `0` is a report, `null` is an absence | — | §17A.14, D12 |
| C5(d) | switching config changes only the reported identity | two clients from two parsed envs, each given the **same** injected step response | `Object.keys(client)` and the `generateStep` arity are identical; both `generateStep` calls return deep-equal `GenerateStepResult`s; only `provider` and `model` differ. Not object deep-equality of the clients — their closures necessarily differ — and no real model agreement is required | — | crit 14, M7 |
| C5(e) | scripted fake | `createScriptedAiClient([s1, s2])` | returns `s1`, then `s2`, records **both** inputs in `calls`; the third call throws an error whose `reason === "script_exhausted"` and is also recorded in `calls`; the scripted step data is unmutated; `createFailingAiClient().generateStep(...)` rejects with message `"model must not be called"` | — | M7 |
| C6(a) | tool calls mapped, and read before output | spy returns `toolCalls: [{ toolCallId, toolName, input }]` on a result whose `output` getter **throws** `NoOutputGeneratedError` (the real shape when a step finishes with tool calls) | `kind === "tool_calls"`, `calls[0]` deep-equals `{ toolCallId, name, input }`; the getter is never invoked | — | M7, §12.2, 08 §8 |
| C6(b) | final output mapped | spy returns `output: { a: 1 }` | `kind === "final"`, `output` deep-equals `{ a: 1 }` (unparsed by us) | — | §17A.13, 08 §7 |
| C6(c) | invalid generated output becomes a candidate, not an error | `generateText` **rejects** with `NoObjectGeneratedError({ text: "{not json", usage: <complete>, finishReason: "stop" })` | resolves to `{ kind: "final", output: "{not json", usage: <mapped three fields> }`; no `AiProviderError` is thrown, so phase 9's bounded output retry stays reachable | MUT-08-14 `client.ts` · the `NoObjectGeneratedError` branch · rethrow it through `fromSdkError` → C6(c) red | D04, §17A.13, M7 |
| C6(d) | tools converted | input tools `[{ name: "search_content", description, inputJsonSchema }]` | the spy sees `tools.search_content` whose description equals the input's and whose `inputSchema` carries **the supplied schema document**; no `execute` property | MUT-08-9 `client.ts` · tool conversion · add an `execute` → C6(d) red; MUT-08-10 `client.ts` · tool conversion · pass a different schema document → C6(d) red | §12.2, 08 §3 |
| C6(e) | timeout ceiling forwarded | `timeoutMs: 1234`, with `AbortSignal.timeout` spied | the spy was called with exactly `1234`, and the `abortSignal` the SDK received is the **same object** it returned; separately, an injected abort rejection maps to `timeout` | MUT-08-11 `client.ts` · `generateStep` · pass `AI_CALL_TIMEOUT_MS` instead of the caller's `timeoutMs` → C6(e) red | §17A.14, D07 |
| C6(f) | retries are off | any successful call | the spy's options contain `maxRetries: 0`. The SDK default is 2, so omitting the option is a silent choice of hidden extra provider calls | MUT-08-12 `client.ts` · `callModel` · drop the option → C6(f) red | 07 §4, D06 |
| C6(g) | system and text messages pass unchanged | `system` plus **both** text forms: `{ role: "user", content: "…" }` and `{ role: "assistant", content: "…" }` — the identity return covers a two-member enumeration and one member is not a sample of it | the spy sees the `system` string identically and both messages with identical roles and text | — | 08 §7 |
| C6(h) | assistant tool-call message mapped | `{ role: "assistant", toolCalls: [{ toolCallId, name, input }] }` | the spy sees the SDK's assistant tool-call shape with `toolCallId` and `toolName` preserved | — | 08 §7, D03 |
| C6(i) | tool-result message mapped | `{ role: "tool", results: [{ toolCallId, name, output }] }` | the spy sees a `role: "tool"` message whose `content` is an **array** of tool-result parts (the SDK's `ToolContent`, verified) carrying the same `toolCallId` — never a text string | — | 08 §7, D03 |
| C6(j) | content filter outranks tool calls | a result carrying **both** `toolCalls` and finish reason `content-filter` | `AiProviderError` `content_filtered`; the tool-call branch is not taken. Fixes the branch order in one observation | — | D05, §17A.13 |
| C6(k) | a finished-without-output step is not a silent final | a result with finish reason `length`, no tool calls, and an `output` getter that throws | `AiProviderError` (not a `{ kind: "final" }` with an invented value); the getter throw is not swallowed into a success | — | D05, §17A.13 |
| C7(a) | the run constants keep their contracts | `DEFAULT_RUN_BUDGETS` and `AI_CALL_TIMEOUT_MS` | every budget value is a positive integer, and `AI_CALL_TIMEOUT_MS <= DEFAULT_RUN_BUDGETS.wallTimeMs`. Asserted as the contract, never as the literal (charter rule 13). `config.ts` was created by task 3 and guarded by nothing; phase 9 computes `min(AI_CALL_TIMEOUT_MS, remaining wall time)` against these values one phase from now | MUT-08-20 `config.ts` · `AI_CALL_TIMEOUT_MS` · raise it above `wallTimeMs` → C7(a) red | master §6.5, §17A.14 |

Criteria: **7** (C1–C7). Rows: **51** — `C1 5 + C2 4 + C3 3 + C4 20 + C5 7 + C6 11 + C7 1`. Named
mutations: **22 distinct** ids in 25 occurrences (MUT-08-1 serves C1(c) and C1(d); MUT-08-17 serves
C4(i), C4(r) and C4(s), the last in the opposite direction) — MUT-08-1, -2, -3, -4a, -4b, -4c, -5,
-6, -7, -8, -9, -10, -11, -12, -13, -14, -15, -16, -17, -18, -19, -20. Every number on this line is
printed output from the counter run over this table, not a typed summand.

Round-1 review grew the table from 6 / 47 / 16. C7 is new (`config.ts` had no row at all); C4 gained
four rows and C2's three rows were rewritten onto one shared instrument.

## Notes

- **Where the row growth came from.** Projection round 0 found that 8 of the original 26 rows were
  writable but could not observe the behavior they named, and 4 were blocked outright for want of a
  seam. The additions are guards and their instruments, not new capability: the phase's *tasks* grew
  only by the two owner-ratified failure reasons and the concrete shapes the SDK forced.
- `LanguageModel` in `ai@7.0.92` is `GlobalProviderModelId | LanguageModelV4 | LanguageModelV3 | LanguageModelV2`; `Exclude<…, string>` is the instance union. If a newer `ai` release changes this alias, update master plan §6.4 and this phase's C1(c).
- **Two SDK error classes, and they are not interchangeable.** `NoObjectGeneratedError`
  (`dist/index.d.ts:6875`) carries `text`, `usage` and `finishReason` — it is what `Output.object`
  throws when the generated text will not parse or validate, and it is rich enough to become the
  C6(c) candidate. `NoOutputGeneratedError` (`:6908`) carries **only** `message` and `cause` — it is
  what the `result.output` getter throws — so a content filter can never be recovered from it. The
  projection referred to the getter throw as the object error; the classification therefore reads
  the **resolved result's finish reason** and `NoObjectGeneratedError.finishReason`, never the
  getter throw.
- The vendor factories are the only place a vendor SDK is imported; phase 15 C2 scans for this.
- Phase 9 consumes `AgentMessage`, `ToolDescriptor` and `GenerateStepResult` as this phase defines
  them, and must not re-derive them (master §6.4). D03 is forwarded to phase 9's projection.
- **Recorded and closed by review round 1, so no later session re-derives them.** (N1) `statusReason`
  sends a **3xx** and any status **above 599** to `request_rejected`. Neither is reachable through
  `fetch` — redirects are followed and HTTP statuses are bounded — and both are correctly
  nonretryable, so no row is written; the `<= 599` upper bound on the 5xx branch is therefore
  untestable and is kept for readability, not for behavior. (N3) `C5(d)`'s three assertions are true
  by construction, since both clients come from one factory: no plausible mutation reddens it, and
  `C5(a)` carries the identity claim it is really making. Kept as a reduced ask under §9.0 rather
  than deleted. (N5) `createAiClient`'s `!apiKey` guard is unreachable with a parsed env — the env
  schema's refinement already guarantees the key for the selected provider — and is kept as defence
  in depth, unguarded and deliberately so.
- **Truncated generations (owner card 1, answered 2026-09-06).** A step that finishes with `length`
  and no usable output is reported today as a provider failure. The owner confirmed the staged
  recommendation: **phase 8 keeps this behavior** — it is nonretryable and safe — and the question of
  where a truncated generation *belongs* goes to **phase 9's projection**, where the run loop and
  `MAX_OUTPUT_RETRIES` actually live and where any change would be consumed. The owner also recorded
  a leaning toward a different branch for phase 9 than the review recommended; that is captured in
  the master plan's open-items section and is **not** settled here, because nothing in phase 8 turns
  on it. See master §12.
- Projection gate: mandatory (rank 4). Round 0 consumed; see the Review log.

## Review log

*(append-only)*

### Coordinator opening and pre-flight — 2026-09-06

Astra window 01: coordinated, projected, implemented and reviewed by Codex Astra sub-contexts.
Only coordinator pre-flight has run; phase state remains `NOT_STARTED`.

The owner resolved the starting-gate blocker with seven header-only edits and a revised window
prompt. `git status --porcelain` at resume contained exactly those eight supplied documentation
paths (plans 01–07 and the Astra window prompt); all are attributed to that resolution. No code,
dependency, config or `tsconfig.tsbuildinfo` delta was present. Each predecessor Review log and
tracker agree on approval. The prior blocker handoff/card is consumed per master §3A.

Routing: 02 §§3,5,8–9; 03 §§3–4; 04 §6; 06 §§5,7; 07 §§4–5,8,10;
08 §§7–10; 10 §§1–2,6–7,11; 11 §§2–5; 12 runtime/server/data/integrations/agents/
documentation/structure; 13 §§1,3–5,7; 14 §§3–4,8–9. No UI or persistence work; R4
specializes the provider interface to `generateStep`. Feature README is absent, with feature
closeout still phase 15. No contract conflict identified in this pre-flight.

Node filesystem/regex checks re-derived **6 criteria / 26 rows / 4 mutations**; rows by criterion
`C1 4 + C2 2 + C3 2 + C4 8 + C5 5 + C6 5 = 26`; mutations
`C1 1 + C2 1 + C3 0 + C4 1 + C5 1 + C6 0 = 4`. Master summands match.
Read-first paths, installed SDK symbols (`LanguageModel`, `generateText`, `Output`, `tool`,
`jsonSchema`, `APICallError`, `NoObjectGeneratedError`), M6/M7/M15/M16 and §17A.13–15 traces
resolve. New phase symbols/files are explicitly future outputs. Source scans found no prior
occurrence-count guard targeting this new module perimeter; existing environment/lint tripwires
remain applicable. There is no deletion task. Master phase-08 references and predecessor
approval log were read, including rules 15–16 and the type-only/dynamic-import instrument hazards.

Lint folds before projection: C2(b) explicitly scans production files so its own test text cannot
violate its claim; C4(a–g) assigns one exact reason/retryable pair per fixture; the twelve new
module paths and pipeline version-write perimeter are explicit. No criterion/mutation count
changed. The future timeout observable, message shape, internal signature test seam and unlisted
SDK failure shapes remain for the fresh projection's derivation; this lint is not semantic proof.
No test run or L4 spent. Projection remains mandatory; the existing prompt content is unchanged,
with only the prescribed `.prompt.` filename correction before launch.

### Projection dispatch interrupted by external usage limit — 2026-09-06

Astra window 01: coordinated, projected, implemented and reviewed by Codex Astra sub-contexts.
Workflow label only: projection round 0 was launched as a fresh `gpt-6-astra` sub-context from
`prompts/reviewer/phase-08-projection-round-0.prompt.reviewer.md` alone, but terminated at the
platform usage limit before depositing a handoff. No projection verdict exists and no ledger
is consumed. Phase remains `NOT_STARTED`; implementation is not dispatched.

At HEAD `d9cd8da5dfff23bec6cf9f25687f00370f7f8fd0`, post-failure porcelain status was empty;
there were no partial agent writes. The only report in the handoff tables was the historical
opening blocker, already resolved under master §3A. Zero tests, L4 stamps, mutation probes,
package installs or model-provider calls ran. Coordinator report:
`handoffs/coordinator/astra-window-01-round-2.handoff.coordinator.md`.

An independent coordinator count command over all fifteen acceptance tables (expanding lettered
row spans and retaining letter suffixes in mutation IDs) reconfirmed master §4:
criteria `5+7+6+8+8+8+8+6+6+6+8+8+7+8+5 = 104`;
rows `22+52+51+80+61+54+57+26+22+25+28+33+26+32+18 = 587`;
mutations `11+19+16+35+21+5+21+4+4+5+7+4+4+4+4 = 164`.
The first diagnostic regex omitted mutation letter suffixes and was corrected before relying
on its output; no artifact count changed.

### Coordinator consumption of projection round 0 — 2026-09-06

Astra window 01: coordinated, projected, implemented and reviewed by Codex Astra sub-contexts.
Projection completed after credits were restored; no subsequent limit warning was returned.
Verdict `AMENDMENTS_REQUIRED`, handoff `state: OWNER_DECISIONS_PENDING`. **Implementation gate
remains closed**: `PROJECTED` records the completed projection, not a fully routed ledger.
The master tracker is the state authority; its phase header mirror is synchronized here (D24).

Handoff: `handoffs/reviewer/phase-08-projection-round-0.handoff.reviewer.md`, renamed from the
prompt-prescribed `.reviewer.md` to satisfy archive naming, without changing its content.
SHA-256 `ce7faca6acd7ee630ce2dea405747b4237282d8e0135742083aec512ec16fd14`.
Actual projection perimeter: that handoff plus master row 8 only, verified against the diff.
Node command independently counted 24 ledger entries and 26 decidability rows; 14 plan gaps,
6 master-plan entries, 3 free choices, 1 intention gap. Zero tests/L4/install/mutations claimed,
consistent with the role's zero-run budget and unchanged source/manifests.

**D01 owner card remains pending.** Independent inspection confirms contract 07 §4 requires
non-429 4xx failures to be nonretryable, while intention §17A.13/master §6.3 give no faithful
reason for ordinary rejected requests or malformed provider-protocol replies. The proposed
`request_rejected` and `invalid_response` reasons would both be nonretryable. This is an
intention/closed-registry amendment, not an implementer fallback choice. No reason was added.

**Disposition now:** D24 completed here; D18 completed in master follow-up 6 (actual model id
needed only at live exercise); D16–D17 use the window's existing permission for normal package
installation and recording actual resolved versions in both this log and master §10.1, with no
installation yet. Remaining D02–D15 and D19–D23 are proposed amendments/delegations preserved
in the handoff and awaiting the coordinated fold after D01 is answered. D03's shared-message
shape must be fixed in its authoritative home before phase-9 work; D20 does not permit omitting
`server-only` from `types.ts`, because master §6.1 and the window explicitly cover every module.
D19's eager env-parse observation is accurate against `env/server.ts`; any wording correction
must preserve intentional module-load validation and avoid a predecessor refactor.

**Counts unchanged:** 6 / 26 / 4, project 104 / 587 / 164. Proposed extra proof cases/mutations
are not yet criteria and are not counted as executed. No implementation prompt was compiled.
Checkpoint/resume instruction for any successor coordinator:
`prompts/coordinator/astra-window-01-resume.prompt.coordinator.md`. The owner's usage-continuity
instruction is durable in master §3A. Account balance is unavailable through current tools;
Browser discovery returned no connected browser, so the usage dashboard could not be read.

### Coordinator fold of projection round 0 — 2026-09-06 (Claude coordinator)

Consumes `handoffs/reviewer/phase-08-projection-round-0.handoff.reviewer.md`
(SHA-256 `ce7faca6acd7ee630ce2dea405747b4237282d8e0135742083aec512ec16fd14`, unchanged).
The predecessor Astra coordinator entry above recorded a partial disposition (D18, D24, and
the D16–D17 authority) before its session ended; this entry completes the routing of **all
24 rows** and opens the implementation gate. Nothing above is rewritten.

**Owner card 1 → add the two reasons** (the recommended branch). Folded authority-first:
intention §17A.13's AI paragraph becomes a **total table** with nine reasons and three stated
boundaries, recorded as §23 round 17, status stays `RATIFIED` (no capability, endpoint,
persistence, transport, or external call changed); then master §6.3's registry; then C4, which
now writes one row per member. The gap the owner closed was real and asymmetric: contract `07`
§4 requires every non-`429` 4xx to be nonretryable, and the only unused reason broad enough to
absorb them — `transport` — is the one that advertises a retry.

**Every load-bearing claim was re-run before it was folded.** The doctrine that earned this in
phase 7 is that a finding can be right and its prescription wrong. Verified directly:
`LanguageModelUsage` carries nested `inputTokenDetails`/`outputTokenDetails` beside the three
counters (`ai/dist/index.d.ts:318`) — D12 stands; `maxRetries` defaults to **2** (`:4790`) —
D06 stands; `Output.object.parseCompleteOutput` throws `NoObjectGeneratedError` with `text`,
`usage` and `finishReason` before `generateText` resolves (`dist/index.js:3733`) — D04 stands
and is implementable exactly as proposed; the SDK tool message's `content` is an **array**
`ToolContent` (`@ai-sdk/provider-utils/dist/index.d.ts:1610`) — D03 stands; `IntegrationError`
does inherit an open `reason?`, a caller `message` and an `issues` passthrough
(`src/lib/errors/app-error.ts:125`–`:150`) — D11 stands.

**One correction to the projection, and it changes a fixture.** D05 attributes the
`result.output` getter throw to `NoObjectGeneratedError`. It is `NoOutputGeneratedError`
(`dist/index.js:6417`; class at `dist/index.d.ts:6908`), and unlike its neighbour it carries
**only** `message` and `cause` — no `finishReason`, no `usage`. A content filter therefore can
never be recovered from that throw, so the classification reads the resolved result's finish
reason and `NoObjectGeneratedError.finishReason`, and never the getter throw. C4(k), C6(a),
C6(c) and C6(k) are written to that distinction; the Notes record it.

**D09 verified rather than assumed.** The proposal reads
`serverEnvSchema.shape.AI_PROVIDER.options`, but `serverEnvSchema` ends in `.superRefine()`.
In Zod 3 that would have wrapped the object in `ZodEffects` and destroyed `.shape`. Run against
the installed `zod@4.5.4`: the constructor is still `ZodObject`, `.shape` survives, and
`.options` is `["anthropic", "openai"]`. D09 is adopted.

**Routing of all 24 rows.** I → D01 (above). M → D03 (master §6.4 now registers `AgentMessage`
in three closed forms, `ToolDescriptor`, `Usage`, `JsonSchema`), D09 and D19 (§6.6 `resolveModel`
and `createAiClient`, the latter recording that this is a **factory** and that the phase-7 getter
precedent must not be copied), D16 (§10.1 folded from the implementer's reported versions before
review), D18 and D24 (already disposed above). P → D02, D04, D05, D06, D07, D08, D10, D11, D12,
D13, D14, D15, D20, D23, folded into the tasks and the table. F → D17, D21, D22 and the D16
reporting duty, delegated by name in the implementer prompt.

**Two proposals were narrowed, with the reason.** D20 asks for `server-only` on every module and
the projection floated a type-only exemption for `types.ts`; master §6.1 admits none, so C2(d)
covers every production module and MUT-08-13 proves the row can fail. D19's observation about the
phase-7 getter is recorded as a note about *what that getter actually defers* (client construction,
not env validation) and explicitly does **not** authorize a predecessor refactor.

**Counts, derived not typed.** The counter run over this table prints
`C1 5 + C2 4 + C3 3 + C4 17 + C5 7 + C6 11 = 47` rows, 6 criteria, and 16 distinct mutation ids in
17 occurrences. My first draft of the summary line said 46 rows and 15 mutations; both were typed
and both were wrong, caught by running the counter — the same failure this project has recorded at
every level. Project totals re-derived across all fifteen tables: **104 / 608 / 176**
(rows `22+52+51+80+61+54+57+47+22+25+28+33+26+32+18`; mutations
`11+19+16+35+21+5+21+16+4+5+7+4+4+4+4`).

**Evidence spent in this fold: none.** No test, no L4 stamp, no mutation, no install, no provider
call. The projection's own zero-run budget was honoured — its handoff claims no run, `src/lib/ai/`
is still absent, and neither vendor package appears in `package.json`.

### Implementer round 1 — 2026-09-06 (Codex)

Implemented the complete `src/lib/ai/` boundary: provider-neutral types and closed message forms,
named run constants, Anthropic/OpenAI instance registry, fixed-message `AiProviderError` with the
total nine-reason translation, `createAiClient`/`callModel`, SDK message/tool/output conversion,
per-call timeout and `maxRetries: 0`, three-field usage mapping with `null` for absent figures, and
the scripted/failing fakes. The barrel exports only the public domain surface; vendor factory
internals and `callModel` remain unexported from the barrel. Added `src/lib/ai/README.md`.

The normal install resolved `ai` 7.0.92, `@ai-sdk/anthropic` 4.0.49, `@ai-sdk/openai` 4.0.60,
and `@ai-sdk/provider-utils` 5.0.36. `package.json` gained the two vendor dependencies; the
lockfile gained the two package records and root dependency entries, with no manual edits. The
root README's stale “no model provider configured yet” line was updated after verification.

Coverage map and pre-edit baseline are in the implementer handoff. The phase test files add 45
tests, and their 47 acceptance rows are mapped there. Named mutation execution was complete:
MUT-08-1, -2, -3, -4a, -4b, -4c, -5, -6, -7, -8, -9, -10, -11, -12, -13, and -14 each reddened
the specified row and was restored byte-identically. The only implementation judgment beyond the
plan was to let an unrecognizable thrown value become a generic `IntegrationError` with
`system: "ai_provider"`, no fabricated reason, and the original cause; this preserves the
intention's programming-error boundary while all recognizable provider failures use
`AiProviderError`.

Applicable contracts used: 02 §§3,8; 06 §5; 07 §§4,5,8,10; 08 §§3,7,8; 10 §§2,11; 11 §§1–5;
12 runtime/integration/agent/dependency/testing sections; 13 §§1–3; and 14 §§8–9. No persistence,
client, UI, or feature README was implicated. Documentation impact review found the root README
and the new integration README were the authoritative updates required.

### Coordinator consumption of implementer round 1 — 2026-09-06

Consumes `handoffs/implementer/phase-08-round-1.implementer.md` at checkpoint `6441770`.
Validated against the repository, not the report.

**Perimeter exact.** `git diff --name-status be0a672 HEAD` is the twelve `src/lib/ai/` files,
`package.json`, `package-lock.json`, the root `README.md` one-liner, this plan, the master plan,
the handoff, and `tsconfig.tsbuildinfo` — nothing else, and `.env.example` is untouched. The
handoff declares the same set and attributes the tsbuildinfo rewrite rather than absorbing it.

**Closing stamp re-run by the coordinator on the checkpoint tree:** `npm test` **28 files /
380 tests** green (baseline 24 / 335, so +4 files / +45 tests), `npm run typecheck` green,
`npm run lint` green. All **47** acceptance row identifiers appear in executing test names across
the four colocated files; no row is claimed by a comment alone.

**Three independent coordinator probes, chosen as variation the implementer's sixteen did not run.**
Two bit as intended and one exposed a defect:

- **P1** — move the content-filter branch *after* the tool-call branch in `client.ts:mapResult`.
  Exactly one test failed, `C4(j), C6(j)`, the precedence row. `client.ts` restored, SHA-256
  `4e3d9071bf96cc7eed907a7317e551694040c084307e21056e6bdf11e1bc2826`, matching the implementer's
  reported pre-probe digest.
- **P2** — change the other-4xx fallback in `errors.ts:statusReason` from
  `request_rejected`/`false` to `transport`/`true`. Exactly `C4(d)` and `C4(e)` failed — the two
  rows the owner's round-17 ratification created. `errors.ts` restored, SHA-256
  `2e9258dd0e4052fa604487ce95997002a2705c8500554d29284cbcbb425bc8c2`, matching.
- **P3 — a finding.** `C2(b)` and `C2(c)` each declare their **own copy** of the forbidden-form
  regex. Weakening only `C2(b)`'s copy to `/AI_SDK_DEFAULT_PROVIDER/`, so it no longer detects
  `@ai-sdk/gateway` in any form or a `gateway(` call, left the whole file **9/9 green** — including
  `C2(c)`, the row whose entire purpose is to prove that instrument fires for all four forms.
  `C2(c)` proves a copy of the guard, not the guard. Restored.

**P3 is this plan's defect before it is the implementation's.** The C2(c) row as written says "run
the scanner's predicate over four synthetic source strings" without requiring it to be *the same
predicate object* C2(b) uses. Rule 16 exists to stop exactly this and the row still shipped with the
hole. Routed to the reviewer as a named probe rather than repaired here, on the phase-7 precedent:
the coordinator does not quietly fix what the review exists to judge.

**One open semantic question, not a defect.** `C6(k)` — a step that finishes with `length`, no tool
calls, and a throwing output getter — is mapped to `invalid_response`. That member means "the
provider's reply cannot be decoded as its own protocol" (§17A.13). A length-truncated generation is
a reply that decoded perfectly and simply carries nothing usable. The nine-member table has no
member for it, which is a gap in the total table folded at round 17, not an implementer error; the
implementer picked the least-wrong member of a closed set. It is nonretryable either way, so nothing
unsafe ships. Routed to the reviewer to determine whether this belongs in `AiProviderFailureReason`
at all or is phase 9's `model_output_invalid` territory.

**Verified against the tree, not the report:** `DOMException` does extend `Error` in Node 22 and
`AbortSignal.timeout`'s real rejection reason is a `DOMException` named `TimeoutError`, so
`errors.ts:isNamedError`'s `instanceof Error` test genuinely catches the production signal — the
C4(f)/C4(g) fixtures use real `DOMException`s. `ai` stayed at **7.0.92**, so every SDK fact this
plan cites still holds; `@ai-sdk/openai` resolved **4.0.60**, one patch above the 4.0.59 master
§10.1 recorded from `npm view`, and §10.1 is folded.

**Two handoff blemishes, neither substantive.** Its "Implementation status" and the line closing the
coverage map still say the mutation ledger and versions are *pending* — stale working text left
above the sections that actually deliver both. And the build failure is cited as
`src/app/globals.css`; the real file is `src/styles/globals.css:1`, whose `@import "./tokens.css"`
cannot resolve because `src/styles/tokens.css` was deliberately deleted at `f957f66` by the frontend
work. `src/styles/` is untouched by this phase, so the diagnosis "pre-existing, not ours, not
repaired here" is correct and correctly handled. **`npm run build` therefore yields no signal on
`main` today**; the extra stamp this phase's prompt authorized was written on the assumption that it
would, and that assumption was wrong.

Phase state → `REVIEWING`. Review prompt: `prompts/reviewer/phase-08-review-round-1.reviewer.md`.

### Reviewer round 1 — 2026-09-06 (Claude, plan-reviewer doctrine)

Verdict **`CHANGES_REQUESTED`**. Handoff:
`handoffs/reviewer/phase-08-review-round-1.handoff.reviewer.md` (named `.handoff.reviewer.md`
rather than the prompt's `.reviewer.md`, to match this table's existing row and archive naming;
declared there). Gate passed on all four content checks. One closing L4 stamp on tree `8fe3482`
with empty porcelain: `npm test` **28 files / 380 tests** green, typecheck and lint clean.

**B1 — `C2(b)`'s scanner is proven by a copy of itself.** Coordinator P3 reproduced: weakening
only `C2(b)`'s own regex literal (`registry.test.ts:82`) to `/AI_SDK_DEFAULT_PROVIDER/` leaves the
file 9/9 green, `C2(c)` included. Repair verified in both directions: one module-scope
`hasForbiddenGatewayForm` plus a `productionModules()` helper asserting the scanned set equals the
seven production modules — with the shared instrument, 9/9 green; weakening it reddens `C2(c)`
(1 failed / 8). `C2(c)` must name the shared **symbol**, not "a predicate", and gains
`MUT-08-15` (narrow the alternation → `C2(c)` red).

**B2 — a real network failure is not `transport` and is reported nonretryable.**
`@ai-sdk/provider-utils`' `handleFetchError` (`dist/index.js:472-513`, called from `postToApi`
`:3512`/`:3628`, used by both vendor providers) turns a fetch-level failure into an `APICallError`
with **no `statusCode`**. `fromSdkError` matches no branch and returns the generic
`IntegrationError` with no `reason` and `retryable: false`. Intention §17A.13 requires `transport`
/ `true`; contract `07` §4 forbids advertising a retryable failure as final. `C4(h)`'s bare
`TypeError` fixture is not a shape the boundary produces. Proven end-to-end through the real
`@ai-sdk/anthropic` provider + real `generateText` + real `createAiClient` with only `fetch`
injected (no network): `IntegrationError`,
`{"system":"ai_provider","retryable":false,"operation":"generateStep"}`.

**B3 — an undecodable provider reply is `request_rejected`, not `invalid_response`.**
`createJsonResponseHandler` (`@ai-sdk/provider-utils/dist/index.js:3999-4015`) raises an
`APICallError` carrying the **2xx** status with the decode failure as `cause`. `fromSdkError`'s
status branch fires first and `statusReason(200)` falls through to `request_rejected` — which
master §6.3 defines as "any non-`429` 4xx". `isProviderDecodeError`'s third disjunct requires
`statusCode === undefined`, unreachable here; `InvalidResponseDataError` is streaming/batch only.
**`invalid_response`, the member the owner added at round 17, is unreachable on the real path**,
and `C4(i)`'s fixture is a shape the SDK does not build. Same harness:
`{"system":"ai_provider","status":200,"retryable":false,"reason":"request_rejected",…}`; a 2xx that
parses but fails the provider's schema behaves identically (`TypeValidationError` cause).

**B2 + B3 repair, written and run before being recorded** (applied, 55/55 green in
`src/lib/ai/`, `tsc --noEmit` clean, then reverted byte-identically): add `TypeValidationError` to
`isProviderDecodeError`, accept a decode `cause` on a **2xx or absent** status, add
`isSdkNetworkError` (`TypeError` ∪ `APICallError` with no status) → `transport`/`true`, and reorder
`fromSdkError` to decode → abort/timeout → status → network → content-filter → `NoOutputGenerated`
→ generic. The decode check must precede the status branch; restricting it to 2xx/absent preserves
§17A.13's transport precedence. Rows: rewrite `C4(h)` and `C4(i)` to the real shapes, add a
`TypeValidationError` row, and add a **4xx-with-decode-cause** row proving the repair does not
relabel rejected requests.

**S1 — the client's content-filter branch is unguarded.** Deleting the inner
`if (error.finishReason === "content-filter")` from `generateStep`'s catch (`client.ts:162`) leaves
all 55 tests in `src/lib/ai/` green. `C4(k)`'s row claims precedence over `C6(c)` — a `client.ts`
claim tested only in `errors.test.ts`. Split `C4(k)`: keep the `fromSdkError` row, add a
client-path row driving a content-filtered `NoObjectGeneratedError` through `generateStep`, with
the deletion as its named mutation. `C4(q)`'s own clause applies verbatim.

**S2 — `isNamedError`'s `instanceof Error` narrowing is unguarded.** Replacing it with a bare
`name` read leaves all 55 green. `C4(m)` needs a non-`Error` value carrying a recognized name
(`{ name: "TimeoutError" }` → generic DTO, no `reason`), with dropping the conjunct as its mutation.

**S3 — `C2(b)` and `C2(d)` each rebuild the module listing and neither asserts it is non-empty;**
both pass vacuously on a shrunken list. Folded into B1's `productionModules()`.

**S4 — no row covers `config.ts`.** Master §6.5 states the contracts (`DEFAULT_RUN_BUDGETS` each a
positive int; `AI_CALL_TIMEOUT_MS ≤ wallTimeMs`) and charter rule 13 requires asserting the
contract. Add `C7(a)` with the over-`wallTimeMs` mutation.

**S5 — one orphan test.** `errors.test.ts:124` traces to no row; fold into `C4(m)` or declare a
candidate criterion.

**Notes, routed.** N1 `statusReason` sends 3xx and >599 to `request_rejected` — acceptable MVP
narrowing, unreachable through `fetch`, record and close. N2 only the `user` half of
`AgentMessage` form 1 is proven (`C6(g)`); assistant text passes by identity and is type-safe —
add the case. N3 `C5(d)`'s assertions are true by construction; reduce the ask, do not delete.
N4 the barrel's negative surface (D22) has no row → phase 15 candidate. N5 `createAiClient`'s
`!apiKey` guard is unreachable with a parsed env; record and close. N6 `npm run build` on `main`
is broken pre-existing (`src/styles/globals.css:1` → deleted `tokens.css` at `f957f66`); not this
phase's, correctly unrepaired, §9.1 rule 10 unobservable on this branch. N7 `C4(n)` would pass
vacuously on an empty registry; assert nine members.

**Owner card 1** (in the handoff, verbatim relay required): `C6(k)` maps a `length`-truncated step
with no output to `invalid_response`. §17A.13's own boundary puts "text the model generated that we
cannot use" outside integration failures, and the reply decoded perfectly. Recommendation: keep
today's mapping as the phase-8 stopgap and route the shape question to phase 9's projection, where
`model_output_invalid` and `MAX_OUTPUT_RETRIES` live; a tenth registry member is the branch to
avoid. Gate holds on silence.

**Verified correct, settled — do not re-verify on the fix round.** Perimeter exact and
`.env.example` untouched. `C1(c)`'s directive is consumed by the model type alone (TS2578 at
`client.test.ts(78,7)` when the string is replaced by the instance) and `C1(e)` genuinely closes
the arity hole. `C4(p)`'s two directives are consumed by the `message` / `issues` excess properties
(TS2578 at `errors.test.ts(115,5)` and `(117,5)`); its real instrument is an exact
`constructorParameters` equality, so §9.1 rule 16's `expectTypeOf`-absence hazard does not apply
here. `toMatchObject({ constructor })` genuinely discriminates the subclass. `fromSdkError`'s
content-filter branch bites (`C4(k)` red alone). `maxRetries: 0` throws the original error rather
than a `RetryError` (`provider-utils:3807`). Contracts preserved: `02` §3 (seven modules,
`server-only` first line), `08` §3 (no `execute`), `04` §6 (generic DTO, `cause` unserialized),
`10` §2 and §11. `C6(a)`'s getter instrument, the four usage rows, and the scripted fakes all hold.

**Mutation-probe declaration.** All probe edits reverted; `client.ts`, `errors.ts`, `registry.ts`,
`types.ts` and the three test files are byte-identical to their pre-probe digests (production
digests match the implementer's declared values). One temporary file,
`src/lib/ai/zz-review-probe.test.ts`, created and deleted. `tsconfig.tsbuildinfo` restored. Final
`git status --porcelain` at `8fe3482` empty.

Phase state → `CHANGES_REQUESTED`.

### Coordinator fold of review round 1 — 2026-09-06

Consumes `handoffs/reviewer/phase-08-review-round-1.handoff.reviewer.md`
(`CHANGES_REQUESTED`; 3 blocking, 5 should-fix, 7 notes, 1 owner card). **Every blocking finding
was re-derived on an independent harness before being folded**, because a finding can be right and
its prescription wrong — this project has had four such rounds.

**B2 and B3 reproduced independently and exactly.** I wrote my own probe driving the **real**
`@ai-sdk/anthropic` provider and the **real** `generateText`, injecting only `fetch`, no network:

```
E1 (fetch rejects, ECONNREFUSED)  raw APICallError, no status →
     IntegrationError, no reason, retryable:false        (should be transport/true)
E2 (200 with an HTML body)        raw APICallError, status 200, cause JSONParseError →
     AiProviderError request_rejected, status:200        (should be invalid_response/false)
E3 (401 control)                  → unauthenticated_upstream/false, correct
```

Confirmed at the vendor source, not inferred: `handleFetchError` builds an `APICallError` with
**no `statusCode`** and `isRetryable: true` from a `fetch` rejection
(`@ai-sdk/provider-utils/dist/index.js:472`–`:513`), and `createJsonResponseHandler` throws an
`APICallError` carrying `statusCode: response.status` — the **2xx** — with the decode failure as
`cause` (`:3999`–`:4015`). Both vendor providers reach both paths through `postJsonToApi`. So
`C4(h)` and `C4(i)` were written from the intention's prose and tested shapes the SDK never builds:
**the network path had no classification at all and `invalid_response`, the member the owner
ratified at round 17 for exactly this condition, was unreachable on the real path.** Every test was
green throughout.

**The prescription was applied and measured, then reverted.** With the reviewer's `errors.ts` in
place: E1 → `transport`/`true`, E2 → `invalid_response`/`false`, E3 unchanged, all 48 tests green
(45 phase + my 3 probes), `tsc --noEmit` clean. It works as written and the fix round may take it.
One observation the fix round decides: under the repair E2's `details` no longer carries
`status: 200`. Dropping it is defensible — a status on an `invalid_response` reads oddly — but
keeping it aids diagnosis. Either is acceptable; the row does not turn on it.

**S1 reproduced.** Deleting the inner content-filter branch from `generateStep`'s catch left the
whole `src/lib/ai` suite green. A refused generation would have become `{ kind: "final", output:
<the blocked text> }` — a candidate phase 9 pays to retry, for a request the provider has already
refused. `C4(k)`'s stated outcome named a precedence living in `client.ts` and was tested only
against `errors.ts`; new row `C4(t)` puts the test where the behavior is.

**B1** is the coordinator's own P3, reproduced by the review with the repair verified in both
directions. **S3** folds into it: one `productionModules()` helper that asserts its own listing.
**S2**, **S4** and **S5** are accepted as written. All three files I probed were restored
byte-identically (`client.ts` `4e3d90…`, `errors.ts` `2e9258…`), matching the implementer's and the
reviewer's declared digests, and my probe file was deleted.

**Table: 6 / 47 / 16 → 7 / 51 / 22**, derived by command. `C7` is new — `config.ts` was created by
task 3 and guarded by nothing, while phase 9 computes `min(AI_CALL_TIMEOUT_MS, remaining wall time)`
against those constants one phase from now. Project totals **105 / 612 / 182**.

**Folded above this phase.** Intention §17A.13 gains a **precedence** paragraph (§23 round 18,
editorial, gate stays closed): round 17 made the AI map total but not *decidable*, and B2/B3 are
what that omission cost. It applies the transport-precedence principle the Proposales table has
carried since round 12 — a non-2xx is classified by status whatever its body, a 2xx that will not
decode is `invalid_response`, a failure with no status never reached the provider. Master §9.1 gains
**rule 17** (a row proving an instrument names the shared symbol; a proof that builds its own copy
proves the copy) and **rule 18** (a fixture for an upstream failure is the object the upstream
library builds, located in its source — the row that passes with *zero* production causes is the
worst guard this project has produced), plus two planner lints: every task produces at least one
row, and a row whose outcome names two modules needs a test in each.

**Owner card 1 answered:** the staged recommendation is confirmed — phase 8 keeps today's behavior
and the semantics go to phase 9's projection. The owner's stated leaning names a branch the review
did not recommend; it is recorded verbatim in master §12 and re-put at phase 9 rather than
interpreted here. Nothing in phase 8 turns on it.

Phase state → `CHANGES_REQUESTED`, fix round 2 dispatched at
`prompts/implementer/phase-08-fix-round-2.implementer.md`. Under master §9.0.2 **no independent
re-review follows**; the coordinator validates against the five preconditions and closes.

### Implementer fix round 2 — 2026-09-06 (Codex)

State **IMPLEMENTED**. The saved prescription was applied: `errors.ts` recognizes the SDK's
status-less network `APICallError` as `transport`, recognizes decode causes on absent/2xx
`APICallError` values including `TypeValidationError`, and orders decode → abort/timeout → status
→ content-filter → no-output → network → generic. Decode is limited to absent/2xx status so a
non-2xx reply with an unreadable body remains status-classified. Judgment: `invalid_response`
does not retain the 2xx status because that status is not evidence of a usable response once
decoding failed, and the acceptance row does not require it.

The test repair extracts and shares `productionModules()` and `hasForbiddenGatewayForm()` for
C2(b–d), adds SDK-shaped C4(h/i/r/s) fixtures, adds C4(t), the C4(m) non-Error name impostor,
C4(n)'s exact nine-member set assertion, the assistant-text case in C6(g), and C7(a). The
orphan generic-message assertion is folded into C4(m). The full coverage map and 22-mutation
ledger are in the implementer handoff.

All 22 distinct named mutations were applied individually, observed red, and reverted; the
25 criterion-site occurrences reconcile as C1=1, C2=4, C3=1, C4=7, C5=3, C6=5, C7=1.
The closing L4 stamp is green: `npm test` 28 files / 383 tests, `npm run typecheck`, and
`npm run lint`. No build, network, provider call, `.env` read, or install was run. The tracked
`tsconfig.tsbuildinfo` rewrite from typecheck was restored. Documentation impact was reviewed
under contract 14 §8; `src/lib/ai/README.md` remains accurate, so no README changed.

Mutation-site note: MUT-08-3's wording says `fromSdkError` passes a message, but D11's narrowed
constructor has no caller message field. The equivalent fixed-message super-call mutation
reddened C4(o); it was reverted. No other plan or saved prescription defect was found.
