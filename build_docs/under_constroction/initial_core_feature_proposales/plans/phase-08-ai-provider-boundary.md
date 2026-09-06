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
| C2(b) | no gateway in source | read every production `src/lib/ai/*.ts`, excluding `*.test.ts` (the guard's own assertions necessarily name the forbidden forms) | none contains `AI_SDK_DEFAULT_PROVIDER`, `@ai-sdk/gateway`, or `gateway(` | MUT-08-5 `types.ts` · module top level · add `void globalThis.AI_SDK_DEFAULT_PROVIDER;` → C2(b) red | M16 |
| C2(c) | the scanner can actually see each forbidden form (instrument proof) | run the scanner's predicate over four synthetic source strings: a static `import … from "@ai-sdk/gateway"`, an `import type … from "@ai-sdk/gateway"`, a dynamic `await import("@ai-sdk/gateway")`, and a bare `globalThis.AI_SDK_DEFAULT_PROVIDER` read | each of the four is flagged; a control string naming none of them is not | — | rule 16, M16 |
| C2(d) | every module is server-only | read every production `src/lib/ai/*.ts` | each contains `import "server-only"` — `types.ts` included | MUT-08-13 `types.ts` · remove the import → C2(d) red | 02 §3, master §6.1 |
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
| C4(h) | network failure | a `TypeError` raised by the SDK invocation itself | `(transport, true)` | — | §17A.13, M6 |
| C4(i) | protocol decode failure | an SDK response-decoding error (`InvalidResponseDataError`, or an `APICallError` with **no** status carrying a JSON decode `cause`) | `(invalid_response, false)` | — | §17A.13 round 17 |
| C4(j) | content filter, resolved | a resolved result whose finish reason is `content-filter` | `(content_filtered, false)` | — | §17A.13, M6 |
| C4(k) | content filter, thrown | `NoObjectGeneratedError` whose `finishReason` is `content-filter` | `(content_filtered, false)` — outranks the invalid-output path of C6(c) | — | §17A.13, D05 |
| C4(l) | factory throw | the C3(a) fixture, observed as a reason row | `(not_configured, false)` | — | §17A.13, M6 |
| C4(m) | an unrecognizable value is not relabelled | reject with `{ nope: true }` (not an `Error`) and, separately, a plain `Error` whose message contains the word `timeout` | neither becomes `timeout` or `transport`; the generic DTO is produced with the original value at `cause`. Retryability is never read from message text | — | §17A.13 round 17, 04 §6 |
| C4(n) | every row is the AI system | all rows above | `details.system === "ai_provider"`, `details.operation` present, and the message is `GENERIC_AI_ERROR_MESSAGE` | — | §17A.13 |
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
| C6(g) | system and text messages pass unchanged | `system` plus `{ role: "user", content: "…" }` | the spy sees the `system` string identically and one user message with identical text | — | 08 §7 |
| C6(h) | assistant tool-call message mapped | `{ role: "assistant", toolCalls: [{ toolCallId, name, input }] }` | the spy sees the SDK's assistant tool-call shape with `toolCallId` and `toolName` preserved | — | 08 §7, D03 |
| C6(i) | tool-result message mapped | `{ role: "tool", results: [{ toolCallId, name, output }] }` | the spy sees a `role: "tool"` message whose `content` is an **array** of tool-result parts (the SDK's `ToolContent`, verified) carrying the same `toolCallId` — never a text string | — | 08 §7, D03 |
| C6(j) | content filter outranks tool calls | a result carrying **both** `toolCalls` and finish reason `content-filter` | `AiProviderError` `content_filtered`; the tool-call branch is not taken. Fixes the branch order in one observation | — | D05, §17A.13 |
| C6(k) | a finished-without-output step is not a silent final | a result with finish reason `length`, no tool calls, and an `output` getter that throws | `AiProviderError` (not a `{ kind: "final" }` with an invented value); the getter throw is not swallowed into a success | — | D05, §17A.13 |

Criteria: 6 (C1–C6). Rows: **47** — `C1 5 + C2 4 + C3 3 + C4 17 + C5 7 + C6 11`. Named mutations:
**16 distinct** ids in 17 occurrences (MUT-08-1 serves C1(c) and C1(d)) — MUT-08-1, -2, -3, -4a,
-4b, -4c, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14. Every number on this line is printed output
from the counter run over this table, not a typed summand.

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
