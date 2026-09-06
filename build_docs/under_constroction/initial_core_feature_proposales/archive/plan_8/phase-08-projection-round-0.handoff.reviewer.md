---
plan: 8
role: projection
round: 0
date: 2026-09-06
verdict: AMENDMENTS_REQUIRED
state: OWNER_DECISIONS_PENDING
actor: Codex Astra projection sub-context
---

# Phase 8 projection

The provider boundary is ready for a focused plan amendment, but not implementation. Several tests currently allow the behavior they are meant to forbid, and the message and structured-output interfaces need concrete definitions before the next phase can use them. One decision needs the owner: how to describe provider failures that the approved list does not cover. The model-name spelling can wait until a live experiment; it does not prevent this phase's offline work.

## ⚠ OWNER DECISIONS REQUIRED (1)

**Question:** Approve adding `request_rejected` and `invalid_response` to the AI failure reasons?

**Story:** A configured model can reject a request, or the provider can return an unreadable response. Today neither case has an accurate label in the approved list. Calling them a connection failure would suggest retrying a request that may never succeed.

**Branches:**

- **Add the two reasons:** rejected requests and malformed provider responses fail with safe messages and are not automatically retried.
- **Keep seven reasons:** assign these cases to existing labels before implementation; their meaning must be broadened explicitly.

**Recommendation:** Add the two reasons, preserving accurate reporting without adding recovery machinery.

**On silence:** The implementation gate holds.

**Trace:** Intention §17A.13; master §6.3; phase 8 task 5 and C4; D01 below.

## Gate and evidence

Astra window 01: coordinated, projected, implemented and reviewed by Codex Astra sub-contexts. This is the workflow label; this handoff completes projection only.

Resumed tree: `e3492c0b4a9eee182148d21aca72cce77281c548`; initial `git status --short` empty. The two intervening commits record the credit interruption/restoration; phase 8 tasks and acceptance rows remain unchanged. All seven prompt gates pass:

| Gate | Independently observed |
|---|---|
| Intention ratified | Intention line 5 is `RATIFIED`. |
| Predecessors | Master §4 rows 1–7 all `APPROVED`. |
| Outstanding phase | Master §4 row 8 `NOT_STARTED`; phase header agrees at entry. |
| Manifest | Acceptance-table regex expands C4(a–g): C1 4 + C2 2 + C3 2 + C4 8 + C5 5 + C6 5 = **26 rows / 6 criteria**. Distinct identifiers are MUT-08-1, -2, -3, -4 = **4 mutations**. |
| No implementation | `src/lib/ai/` absent. |
| No vendor dependencies | Neither candidate vendor occurs in package.json dependencies. |
| Correct instance alias | Intention §17A.15 line 923 names `Exclude<LanguageModel, string>`; installed alias at `node_modules/ai/dist/index.d.ts:112` includes strings. |

Evidence is filesystem/artifact inspection only. **Zero tests, zero L4, zero mutations, zero installs, zero provider calls.** The Node command counted text and file existence; it did not execute application code. No claim below is an observed mutation red: those are future implementation obligations.

## Applicable architecture contracts

Applied Architecture Context policy and guide before design reasoning. Concerns: new server-only integration, credentials/config, provider-neutral messages and results, errors, dependencies, boundary tests, durable integration documentation. Applicable: `02-runtime-boundaries.md` §§3,5,8–9; `03-feature-architecture.md` §§3–4; `04-server-architecture.md` §6; `06-data-contracts-and-validation.md` §§5,7; `07-integrations.md` §§4–5,8,10; `08-agent-architecture.md` §§7–10; `10-security-and-trust-boundaries.md` §§1–2,6–7,11; `11-testing-principles.md` §§2–5; `12-anti-patterns.md` runtime/server/data/integrations/agents/documentation/structure; `13-decision-checklist.md` §§1,3–5,7; `14-documentation-principles.md` §§8–9. Master R4 specializes operations to `generateStep`. No UI, persistence, transport, or auth capability is introduced. Feature README is absent; integration README is this phase's durable documentation. No Next.js code is written.

## Decision ledger

P = coordinator amends phase plan; M = coordinator amends master registry/topology; I = owner decision then intention-first fold; F = explicit implementer delegation. These are proposals, not an alternate implementation authority. Every non-free gap must be routed before prompt compilation.

| ID | Decision point and evidence | Class | Proposed routing |
|---|---|---|---|
| D01 | Error mapping is not total. Task 5 / C4 (`plans/phase-08-ai-provider-boundary.md:39`, `:58`) cover 401/429/503 but no other 4xx, statusless protocol errors, or ordinary thrown values. Seven named reasons in intention `:891` provide no faithful rejected-request/protocol-error label. Contract 07 §4 requires other 4xx to be nonretryable. | I | Owner card above. Add a total table in §17A.13 first, then master §6.3 and phase C4. Suggested added members: `request_rejected` false for other 4xx, `invalid_response` false for provider-protocol decoding/shape errors. Arbitrary programming errors remain governed by 04 §6, not mislabeled transport. |
| D02 | `callModel` is named only by C1(c), not defined/exported by task 6 (`:40`, `:52`). A missing symbol, wrong auxiliary argument, or inaccessible closure can consume `@ts-expect-error` even if strings are accepted. | P | Specify the production function name, module-local export available to colocated tests (not public barrel), full arguments and return type. Type-only negative call inside an uninvoked function; adjacent positive instance call with identical valid remaining arguments. Production `generateStep` must invoke that exact seam. Widen-only must produce TS2578 at the negative call; pass-string runtime mutation separately reddens C1(d). Record both observations for MUT-08-1. |
| D03 | Task 2's `AgentMessage` has roles and “labeled data” but no content union, call/result correlation fields, or JSON type owner (`:36`). SDK tool messages require an array, not text (`provider-utils/dist/index.d.ts:1610`). C6(e)'s blanket identity conflicts with a real mapper. | M | Register exact provider-neutral text, assistant-tool-call and tool-result shapes, including IDs, names, input/output unknown values and ordered content. Own `JsonSchema`, `ToolDescriptor`, `Usage` explicitly in master §6.4. Amend task 6/C6(e) to preserve text/system values while asserting exact mapped SDK messages for all three message forms. Do not alias the SDK's whole message union outside the adapter. Forward contract to phase 9 before its projection. |
| D04 | `Output.object` parses before `generateText` returns (`ai/dist/index.js:3732`, `:6279`); malformed JSON throws `NoObjectGeneratedError`. The plan's `result.output or result.text` does not handle this; generic provider-error wrapping would bypass the mandated bounded model-output retry in intention `:893` / phase 9 task 2. | P | Define the non-content-filter `NoObjectGeneratedError` path as a final invalid output candidate with its reported usage, for downstream schema validation/retry; specify its exact candidate representation. A minimal candidate is the exception's text as `unknown`, with downstream safeParse remaining authority. Do not forward SDK exceptions/types or raw text into an ErrorDto. Cover this through rejected generateText, not a handcrafted successful result. |
| D05 | `result.output` is a getter that throws when absent (`ai/dist/index.js:6417`; d.ts `:4576`). Empty non-stop replies and tool steps do not always produce output. Content filtering may arrive as a resolved finish reason or a `NoObjectGeneratedError` carrying it. | P | Specify branch order: classify content filtering first, tool calls next, schema/text final mapping after that; never eagerly read output on tool steps. Cover resolved content-filter and thrown content-filter separately with the same safe AiProviderError result, preserving cause. Define empty/no-output and `length`/`error`/`other` finish cases without silently treating them as a valid final. Reuse the invalid-output path where schema validation owns the outcome. |
| D06 | SDK retry default is two (`ai/dist/index.d.ts:4790`, js `:2829`); task 6 omits maxRetries. Retry exhaustion produces `RetryError.lastError` (`d.ts:7201`), not necessarily APICallError. This creates hidden provider calls and an uncovered classification wrapper. | P | Explicitly set `maxRetries: 0` for the single-step primitive, consistent with this MVP's no-added-retry scope and per-call accounting. Assert the option. If coordinator deliberately retains retries, specify bounded policy, unwrap lastError, and account for the extra requests; do not leave SDK defaults as a silent choice. |
| D07 | C6(d) (`:68`) accepts any AbortSignal, including one that never aborts or one created with an unrelated duration. Named AI_CALL_TIMEOUT_MS has no role in phase-8 task 6, while phase 9 computes the min. | P | State the caller passes an already-bounded ceiling; adapter forwards that exact timeout. Spy on `AbortSignal.timeout` to assert 1234 and returned signal identity, then exercise an injected abort rejection mapping. Plant a different duration so the timeout row can fail. No redundant adapter min required; registry `AI_CALL_TIMEOUT_MS <= wallTimeMs` remains the phase-9 caller contract. |
| D08 | Global test C2(a) assumes undefined without arranging it; MUT-08-2 names an undeclared `gateway` variable (`:54`). Source guard C2(b) has no independent planted-defect row (`:55`). | P | Isolate and restore the global around the test. Define a typed local fake provider for the global-assignment mutation so it reaches the assertion without undeclared-symbol/module failures. Independently plant static, type-only and dynamic gateway import forms for C2(b), plus the named global access; use source-before-import tests where necessary. Enumerate supported forms, avoid claiming computed obfuscations are covered. |
| D09 | C3(b) says iterate an enum, but master `AiProvider` is a type union, erased at runtime; factory registry visibility is unstated (`:57`). | M | Derive runtime provider names from `serverEnvSchema.shape.AI_PROVIDER.options` (or explicitly register an equivalent canonical tuple), infer union from it. Keep `satisfies Record` on DEFAULT_FACTORIES and exercise each configured name through resolveModel. Do not use a duplicate handwritten two-item loop as proof of totality. |
| D10 | C4 fixtures are unit mappings only; task 6 does not explicitly say where SDK throws are caught. A correct fromSdkError with no production call site satisfies the table. | P | Require `generateStep`'s catch path to use the mapper; drive representative APICallError and abort failures through injected generateText. Preserve status, operation `generateStep`, retryability, original cause, closed details keys, and the fixed generic message. Registry construction errors have their own operation and never pass through a second classifier. |
| D11 | `AiProviderError extends IntegrationError` alone inherits an open `reason?: string`, arbitrary message and issue-message forwarding (`src/lib/errors/app-error.ts:128`, `:140`). C4(h) protects only one string/surface/path. | P | Narrow constructor inputs to the registered reason union and safe fields; force fixed generic message in the subclass (no caller override, no upstream issues/messages in details). Assert exact details/DTO and cause identity through registry and call paths. Preserve MUT-08-3's feasible site after choosing constructor shape; moving message ownership must move the mutation too. |
| D12 | Usage rule is already tightly scoped (`:40`), but `{}` is not a complete LanguageModelUsage; it also contains nested token-detail fields (`ai/dist/index.d.ts:320`). Whole-object mapping would leak SDK fields. C5(c)'s all-absent fixture does not check preserving reported zero. | P | Keep exactly three mapped fields with per-field `?? null`; use complete SDK-shaped fixtures with undefined counters and extra detail fields. Add mixed present/absent and reported-zero assertions within C5(b–c). For MUT-08-4 change one field at a time or make independent assertions visible in the ledger; a first failing key cannot certify three guards. No new general fallback permission. |
| D13 | C5(d) (`:63`) “only provider/model differ” cannot mean object deep equality because generateStep closures differ; same function shape alone proves no output-contract property. | P | Define comparison: same method keys/call signature, equivalent injected step response produces exactly the same GenerateStepResult in both clients, only reported client identity changes. Do not require identical closures or real model agreement. |
| D14 | C6(c) (`:67`) observes inputSchema existence but not the supplied schema and declares no execute without a mutation. | P | Assert mapped schema content and description, preserving tool name; independently plant an execute property and schema replacement. Bind tests to the descriptor conversion on the SDK call path. |
| D15 | C6(a) traces to §17A.14, which specifies budgets/usage, not tool field renaming; C6(c) traces to §17A.15 “provider-neutral descriptor”, absent there. C6(e)'s contract citation is relevant but is not a measurement-ledger/mechanism trace. | P | Correct C6(a,c,e) traces to M7 plus intention §12.2 and contract 08 §8 (and §7 for text preservation); retain §17A.14 for usage assertions only. Add M7 explicitly to C5(d)'s criterion-14 trace. Refresh master §7.2 if coverage changes. |
| D16 | Factories' resolved versions unknown until installation; unqualified install may affect transitive dependencies; master §10.1 contains historical baseline rows. Task 1 ownership is “via coordinator” (`:35`). | M | Implementer records actual ai/vendor/provider package versions and relevant lockfile delta in its handoff/Review log; coordinator updates §10.1 before review. Keep ai@7.0.92 unless deliberately routed otherwise; if it moves, recheck the relied-on alias, output getter/parser and retry behavior before implementing against old evidence. No speculative version claims now. |
| D17 | Full lockfile is explicitly one of 14 paths (`:32`). | F | Delegate normal npm-generated lockfile and node_modules changes to implementer; they belong inside this phase, no separate lockfile phase/approval. Review package scope and unexpected unrelated upgrades. Do not hand-edit the lockfile. |
| D18 | Master §11 follow-up 6 says model spelling becomes load-bearing at phase 8, but all rows use `m`, `x`, an explicit env fixture or injected SDK spy. | M | Correct follow-up timing to first live model call (planned phase 15). Keep unresolved actual literal; no .env read, key provisioning, model choice, or owner card for this phase. Configuration passthrough requires a nonempty string, not vendor-valid availability. |
| D19 | Factory default differs from the phase-7 service getter precedent. serverEnv eagerly parses when its module loads (`src/lib/env/server.ts:56`); even phase-7 service's static dependency chain already reaches that module through Proposales client. | M | Record precise invariant: no provider/client construction at import; env validation at import remains deliberate §6.2. `createAiClient(env = serverEnv, completeDeps = defaults)` is appropriate to a factory and not a service defaultDeps violation. Correct any claim that the service getter makes env module validation lazy; do not expand this phase into an env-loading refactor. Tests always pass explicit parsed fixture env. |
| D20 | Task 8 calls for server-only only at index (`:42`), while 02 §3 applies to authority leaves too. | P | State server-only on client, registry, errors, config, scripted and index authority modules; handle pure type-only module consistently with runtime-neutral type imports. No client reachability via a deep import. Existing lint/build rules supply broader enforcement; do not add an unrelated new boundary suite. |
| D21 | `script_exhausted` is a future phase-9 RunFailureReason, not an AI provider reason; C5(e) wants `.reason` directly (`:64`). | F | Delegate a small local Error subclass or Error with readonly reason `script_exhausted`; do not import phase-9 code backward or put it into AiProviderFailureReason. State calls includes attempted calls (including exhaustion), and the fake never mutates scripted step data. Keep failing fake's exact message. |
| D22 | Fixed generic AI message text, helper naming, internal spy result type and public exports are not all listed. | F | Delegate a single fixed safe message literal and private helper names. Declare an explicit narrow injectable SDK result seam matching every accessed field; fixtures conform to it without unsafe casts. Public barrel exposes domain types/factories/config/errors needed by phase 9, not callModel or vendor factory internals. |
| D23 | New integration invalidates root README's “no model provider configured yet” wording noted by evidence §9, while only integration README is in perimeter. | P | Require post-implementation documentation impact review. If root wording is still false, amend its one-line integration description/link and add README.md to the approved implementation perimeter. Preserve evidence §9 as dated evidence rather than pretending it describes the new tree. |
| D24 | New master §3A requires both state mirrors, but projection prompt explicitly allows row 8 only and forbids phase-plan writes. | M | Coordinator synchronizes phase header to PROJECTED while consuming this handoff, before any dispatch. Projection follows its narrower explicit perimeter and records the temporary mismatch; no silent plan edit. |

## Error cases and precedence that the amendment must close

This is a classification partition, not an invented ordering of seven unrelated labels. Enumerate adjacent numeric branches and disjoint throwable shapes; do not create arbitrary pairwise combinations of mutually exclusive HTTP statuses.

| Input class / boundary | Determined now | Missing determination |
|---|---|---|
| Factory constructor vs model factory invocation throws | not_configured, false | Both sites must be included in registry catch; operation literal. |
| APICallError 400 / 401 / 402 | 401 unauthenticated_upstream, false | Adjacent non-401 4xx: owner card. |
| 403 / 404 / 408 / 422 | Other 4xx nonretryable by 07 §4 | Reason owner card; HTTP 408 is a received reply, distinguish from a local AbortError. |
| 428 / 429 / 430 | 429 rate_limited_upstream, true | Neighbors use owner-resolved rejected-request row. |
| 499 / 500 / 599 | 500–599 server_error, true | 499 rejected; do not classify arbitrary >=500 values as known HTTP 5xx. |
| DOMException AbortError / TimeoutError | timeout, true | Explicit class/name recognition for both, independently asserted. |
| Network TypeError vs APICallError without status | transport, true for actual network failure | Do not use every TypeError as evidence of a network failure; scope classification to the SDK invocation, preserve programming-error handling. |
| InvalidResponseDataError / response JSON decoding error | No suitable reason | Owner card's invalid_response; distinguish from model-generated invalid JSON. |
| NoObjectGeneratedError + content-filter | content_filtered, false | Must outrank generic structured-output-invalid path. |
| Resolved result + content-filter | content_filtered, false | Must be observed before reading throwing output getter or returning text. |
| NoObjectGeneratedError + malformed generated text | model_output_invalid after bounded retry, not integration_error | Phase-8 representation into phase-9 validator: D04. |
| RetryError wrapping 429/503/abort | Underlying semantics must survive | D06 preferably eliminates automatic wrapper production with maxRetries 0. |
| Unknown Error / non-Error rejection | Generic DTO, original cause retained at appropriate boundary | Explicitly identify programmer-error propagation versus recognizable SDK/provider error. Never infer retryability from an upstream message substring. |

## Row-by-row decidability

“Yes” means a concrete assertion can be written from current authority; it does not claim the guard is sufficient or proven. “Partial” means the literal assertion is writable but misses its named behavior. “Blocked” means the fixture/seam/outcome needs an amendment. Each letter of C4 is separate here.

| Row | Status | Assertion available today / missing |
|---|---|---|
| C1(a) | Yes, install-dependent | Actual factory result object, modelId m, provider includes anthropic; no network. Resolved vendor version still unverified. |
| C1(b) | Yes, install-dependent | Same for openai. Include object assertion symmetrically. |
| C1(c) | Blocked | Internal accessible production seam and fully valid remaining arguments absent: D02. |
| C1(d) | Yes | Spy receives object with configured modelId; instantiate via the real registry so a disconnected helper cannot certify production. |
| C2(a) | Partial | Undefined observable clear; test isolation and executable mutation fixture need D08. |
| C2(b) | Partial | Literal source scan clear; no proof each forbidden form is observable: D08. |
| C3(a) | Yes | Throwing injected factory yields generic not_configured with exact original cause. Construction and model invocation sites need coverage. |
| C3(b) | Blocked | Type alias cannot be iterated; canonical runtime list/seam needs D09. |
| C4(a) | Yes | APICallError 401 -> unauthenticated_upstream / false. |
| C4(b) | Partial | Timeout / true clear; abort and timeout are distinct fixtures, not one slash-named case. |
| C4(c) | Yes | APICallError 429 -> rate_limited_upstream / true. |
| C4(d) | Yes | APICallError 503 -> server_error / true. |
| C4(e) | Partial | Network TypeError -> transport / true; statusless SDK wrapper and programmer TypeError not distinguished. |
| C4(f) | Blocked | Finish reason is usually a result, not the unspecified err argument. D05 defines production paths. |
| C4(g) | Yes | Factory throw -> not_configured / false through registry; do not incorrectly pass an unmarked arbitrary Error to fromSdkError and expect factory semantics. |
| C4(h) | Partial | Sentinel absence/cause presence exact; production catch/constructor/details paths need D10–D11. |
| C5(a) | Yes | Explicit parsed openai/x configuration -> exact client identity. |
| C5(b) | Yes | Exact three-counter object 10/5/15. Complete SDK spy fixture and extra-field nonleakage D12. |
| C5(c) | Yes | Three nulls; add mixed and zero cases, independent mutation evidence per field D12. |
| C5(d) | Blocked | “Same shape / nothing else” has no defined comparison target until D13. |
| C5(e) | Yes | s1/s2, two recorded inputs, exhaustion reason, exact failing-fake message. Third attempted call recording is delegated explicitly D21. |
| C6(a) | Yes | Exact call rename preserves toolCallId/input; D05 requires throwing-output-getter fixture to ensure tool-first mapping. Trace repaired D15. |
| C6(b) | Partial | Plain successful object identity clear; actual SDK parse rejection/getter paths absent D04–D05. |
| C6(c) | Partial | Description, schema existence and execute absence exact; supplied schema content and planted execute defect missing D14. |
| C6(d) | Partial | instanceof assertion writable but cannot establish timeout ceiling D07. |
| C6(e) | Blocked | System/text identity clear; full message identity cannot determine role/tool conversion D03. |

## Reality and trace checks

The plan's 14 implementation paths rederive as two existing manifests plus twelve absent/new integration files: index.ts, types.ts, config.ts, registry.ts, registry.test.ts, client.ts, client.test.ts, errors.ts, errors.test.ts, scripted.ts, scripted.test.ts, README.md. `.env.example` is explicitly unchanged and excluded from that count. The lockfile belongs in the count and phase perimeter: security contract 10 §11 requires version pinning through it. Installed node_modules changes are the normal install side effect, not an additional source file or independent phase.

Existing symbols verified: ServerEnv/parseServerEnv/serverEnv in `src/lib/env/server.ts`; IntegrationError in `src/lib/errors/app-error.ts`; toErrorDto in `src/lib/errors/error-dto.ts`; the phase-7 defaultDeps getter in `src/features/proposal-preparation/server/services/search-content-for-human.ts`. `ai` exports APICallError at d.ts line 2 and tool/jsonSchema at line 7; generateText at 4820, Output.object at 3799, NoObjectGeneratedError at 6875, LanguageModel at 112. Candidate provider constructors cannot be verified locally before installation; the implementer must verify their resolved interfaces. No missing existing code path is silently treated as a future output.

All Read-first section references resolve. Intention M6/M7/M15/M16 live at lines 467/468/485/486; §17A.13–15 at 847/897/917. Evidence §9 is historical and its env/README observations are no longer all current; §9.1's installed string-to-gateway mechanism remains the phase's relevant evidence. Master §10.1 includes historic lint/topology baseline descriptions; current files establish actual topology, without turning this projection into a topology rewrite.

Forward trace: C1/C2/C3 -> M16 and §17A.15; C4 -> M6/§17A.13; C5(a–c) -> M15/§17A.14 plus criterion 14/M7; C5(e) -> M7. C5(d) resolves indirectly through criterion 14 -> M7. C6(b) is supported by §17A.13's downstream validation ownership. **Three C6 trace cells resolve by name but do not directly support their asserted wire mechanics** (D15), so the trace check is not clean merely because references exist.

Reverse trace: the phase claims M6, M7, M15, M16 in master §7.2 and each has serving rows above. No claimed ledger entry is wholly orphaned. This phase supplies the primitive, not every end-to-end promise of M7/M15; phase 9 owns run budgets, accumulated failure usage and output retries. D04 prevents that later responsibility becoming unreachable. No tests exist in this phase yet, so test-to-row and actual mutation-to-test trace cannot be checked; neither is claimed.

The first-hour derivation reached every task: dependency installation; all type shapes; config constants; registry branch; error conversion; SDK request/result mapping; fake sequence; public getter/export; README; evidence protocol. The sketch is discarded; ledger amendments are the sole proposed output.

## Full write perimeter and closeout

Actual session writes only:

1. `build_docs/under_constroction/initial_core_feature_proposales/handoffs/reviewer/phase-08-projection-round-0.reviewer.md` (this new handoff).
2. `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` (tracker row 8 only -> PROJECTED, dated/attributed with window workflow label).

No code, package manifests, lockfile, environment files, phase plan, intention, source evidence, or tool-recorded architecture state changed. No checkpoint created by projection. The phase header temporarily remains NOT_STARTED under the prompt's express no-plan-write instruction; coordinator must synchronize it per master §3A as D24, alongside recording the projection Review-log entry. This state is not implementation permission: the owner card and routed amendments remain prerequisites.

Documentation impact: this is a paper review and changes no implemented behavior; no durable README edit is justified yet. D23 directs the actual implementation closeout. Coordinator next folds P/M/F rows, presents owner card verbatim, applies the owner's answer to the intention first, rederives manifest/trace/mutation counts, then compiles a fresh implementer prompt only after the ledger is routed.
