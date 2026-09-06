---
plan: 8
phase: AI provider boundary (`@/lib/ai`)
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
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

1. `npm install @ai-sdk/anthropic @ai-sdk/openai`; record the resolved versions in the Review log and master plan §10.1 (via the coordinator).
2. `types.ts`: `AiProvider`, `LanguageModelInstance = Exclude<LanguageModel, string>`, `AiClient`, `GenerateStepInput`, `GenerateStepResult`, `Usage`, `ToolDescriptor = { name, description, inputJsonSchema }`, `AgentMessage` (role `user` | `assistant` | `tool`, content as labeled data).
3. `config.ts`: `DEFAULT_RUN_BUDGETS`, `AI_CALL_TIMEOUT_MS`.
4. `registry.ts`: `resolveModel({ provider, model, apiKey }, factories = DEFAULT_FACTORIES): LanguageModelInstance` — `DEFAULT_FACTORIES: Record<AiProvider, (apiKey) => (modelId) => LanguageModelInstance>` built from `createAnthropic({ apiKey })` and `createOpenAI({ apiKey })`; exhaustive over the enum (a `satisfies Record<AiProvider, …>`); a factory throw → `AiProviderError` reason `not_configured`. Never touches `globalThis.AI_SDK_DEFAULT_PROVIDER`.
5. `errors.ts`: `AiProviderError extends IntegrationError` (`system: "ai_provider"`); `fromSdkError(err, operation)` mapping `APICallError.statusCode` 401 → `unauthenticated_upstream`, 429 → `rate_limited_upstream`, 5xx → `server_error`, abort/timeout → `timeout`, network → `transport`, a finish reason `content-filter` → `content_filtered`; **message is always the fixed generic string**; the SDK error goes to `cause`.
6. `client.ts`: `createAiClient(env = serverEnv, deps = { generateText, resolveModel })`: resolves the model once; `generateStep(input, { timeoutMs })` calls `deps.generateText({ model: <instance>, system, messages, tools: <converted via ai.tool({ inputSchema: jsonSchema(...) }) with no execute>, output: input.outputJsonSchema ? Output.object({ schema: jsonSchema(...) }) : undefined, abortSignal: AbortSignal.timeout(timeoutMs) })` with the internal function typed `(model: LanguageModelInstance, …)`; maps the SDK result to `GenerateStepResult` (tool calls → `tool_calls`; otherwise `final` with `result.output` or `result.text`); `usage` from `result.usage` with `?? null` **only** in the usage mapping (documented exception to rule 2, which governs the omission and money paths).
7. `scripted.ts`: `createScriptedAiClient(steps)` and `createFailingAiClient()`; `provider: "scripted"`, `model: "scripted"`.
8. `index.ts`: `import "server-only"`; exports; lazy `getAiClient()`.
9. `README.md`: how the app uses the provider layer; the string-model-id hazard (link evidence §9.1); configuration ownership; error translation; that no message crosses.
10. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | anthropic model instance | `resolveModel({ provider: "anthropic", model: "m", apiKey: "k" })` | returns an object (`typeof !== "string"`) with `modelId === "m"` and `provider` containing `anthropic` | — | M16 |
| C1(b) | openai model instance | same for `openai` | `modelId === "m"`, `provider` containing `openai` | — | M16 |
| C1(c) | string is unrepresentable at the call site | a `// @ts-expect-error` line in `client.test.ts` calling the internal `callModel("claude-3", …)` | `npm run typecheck` passes (the directive is consumed) | MUT-08-1 `client.ts` · internal signature · widen to `LanguageModel` and pass `env.AI_MODEL` → typecheck fails on the unused directive **and** C1(d) red | M16, §17A.15 |
| C1(d) | the SDK receives an instance | spy `generateText` | `typeof spy.calls[0].model === "object"`; `spy.calls[0].model.modelId === env.AI_MODEL` | (MUT-08-1) | M16 |
| C2(a) | global provider untouched | after `createAiClient` and one `generateStep` | `globalThis.AI_SDK_DEFAULT_PROVIDER === undefined` | MUT-08-2 `registry.ts` · `resolveModel` · assign `globalThis.AI_SDK_DEFAULT_PROVIDER = gateway` → C2(a) red | M16, §17A.15 |
| C2(b) | no gateway in source | read every production `src/lib/ai/*.ts`, excluding `*.test.ts` (the guard's own assertions necessarily name the forbidden forms) | none contains `AI_SDK_DEFAULT_PROVIDER`, `@ai-sdk/gateway`, or `gateway(` | — | M16 |
| C3(a) | `not_configured` | a factory that throws | `AiProviderError` reason `not_configured`, generic message, `cause` set | — | M16, §17A.13 |
| C3(b) | registry total | iterate the `AiProvider` enum | a factory exists for each member (2) | — | §17A.15 |
| C4(a–g) | error translation, one row per reason | SDK errors: (a) status 401, (b) abort/timeout, (c) status 429, (d) status 503, (e) `TypeError` network, (f) finish reason `content-filter`, (g) factory throw | exact `(reason, retryable)` by row: (a) `(unauthenticated_upstream, false)`, (b) `(timeout, true)`, (c) `(rate_limited_upstream, true)`, (d) `(server_error, true)`, (e) `(transport, true)`, (f) `(content_filtered, false)`, (g) `(not_configured, false)`; every row `system === "ai_provider"` | — | §17A.13, M6, crit 9 |
| C4(h) | provider message never crosses | SDK error message `PROVIDER-MSG-SENTINEL` | absent from `err.message` and `JSON.stringify(toErrorDto(err))`; present in `String(err.cause)` | MUT-08-3 `errors.ts` · `fromSdkError` · `message: err.message` → C4(h) red | §17A.13, M6 |
| C5(a) | report identity | env `AI_PROVIDER=openai`, `AI_MODEL=x` | `client.provider === "openai"`, `client.model === "x"` | — | M15, crit 14 |
| C5(b) | usage mapped | spy returns `usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }` | `result.usage` deep-equals it | — | M15 |
| C5(c) | unreported is null | spy returns `usage: {}` | every usage field `=== null`, none `0` | MUT-08-4 `client.ts` · usage mapping · `?? 0` → C5(c) red | M15, §17A.14 |
| C5(d) | switching config touches nothing else | two clients from two envs | only `provider`/`model` differ; both expose the same `generateStep` shape | — | crit 14 |
| C5(e) | scripted fake | `createScriptedAiClient([s1, s2])` | returns `s1`, then `s2`, records both inputs in `calls`; third call throws an error whose `reason === "script_exhausted"`; `createFailingAiClient().generateStep(...)` rejects with message `"model must not be called"` | — | M7 |
| C6(a) | tool calls mapped | spy returns `toolCalls: [{ toolCallId, toolName, input }]` | `kind === "tool_calls"`, `calls[0]` deep-equals `{ toolCallId, name, input }` | — | §17A.14 |
| C6(b) | final output mapped | spy returns `output: { a: 1 }` | `kind === "final"`, `output` deep-equals `{ a: 1 }` (unparsed) | — | §17A.13 |
| C6(c) | tools converted | input tools `[{ name: "search_content", description, inputJsonSchema }]` | spy sees `tools.search_content` with the description and an `inputSchema`; no `execute` | — | §17A.15 (provider-neutral descriptor) |
| C6(d) | timeout ceiling passed | `timeoutMs: 1234` | spy sees an `AbortSignal` (`instanceof AbortSignal`) | — | §17A.14 |
| C6(e) | data passed unchanged | `system`, `messages` | spy sees them identical | — | 08 §7 |

Criteria: 6 (C1–C6), 26 rows (a table line is one row; a lettered span counts its letters). Named mutations: 4.

## Notes

- `LanguageModel` in `ai@7.0.92` is `GlobalProviderModelId | LanguageModelV4 | LanguageModelV3 | LanguageModelV2`; `Exclude<…, string>` is the instance union. If a newer `ai` release changes this alias, update master plan §6.4 and this phase's C1(c).
- The vendor factories are the only place a vendor SDK is imported; phase 15 C2 scans for this.
- Projection gate: mandatory (rank 4).

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
