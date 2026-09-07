# Integration sprint — real backend behind the fixture-era frontend

| | |
|---|---|
| **State** | `PLANNED` — not started; no integration code exists on this branch yet |
| **Branch** | `proposal-copilot-integration` (the structural merge is done; `main` is correct and pushed; do not plan or perform another merge) |
| **Predecessor** | Pass B, `plans/sprint-pass-b-machinery.md`, `MACHINERY_COMPLETE` at `2353530` / `2175944`; backend submission sprint closed at `d61108f` |
| **Supersedes as executable process** | `plans/phase-16-transport-boundary.md` and `plans/phase-17-seam-replacement-and-closeout.md`. Both stay as historical source material and are not edited. Their gates ("backend phases 11–14 `APPROVED`") are historical: those phases shipped under the collapsed `SUBMISSION_SPRINT` (backend master plan §13) and are present in this tree |
| **Source material** | frontend intention §2.3, §2.4, §4, §7–§11, §12A.1, §12A.2, §12A.8, §12A.9, §12A.13–§12A.16, §12A.20, §13 C-5, §14, decision 4 · Pass B plan §5, §6 WP1/WP4–WP6, "Open items handed to the integration sprint" · phase 16 tasks 1–6, C1–C5 · phase 17 tasks 2–4, 6, C1–C4 · backend intention §15, §16, §17A.2, §17A.3, §17A.10–§17A.13, §17A.17 · backend master plan §6.6, §6.9, §9.2, §13 · backend phase plans 11–15 · contracts 02, 04, 05, 06, 08 §6/§9, 10, 11, 12, 14 §6/§8, 16 §2/§6 |
| **Baseline stamp (planner, 2026-09-07, tree `f60b9c2`)** | `npm test` → 107 files, 837 tests green. `node -v` → 22.22.3. `next` 16.3.4, `zod` 4.5.4, `zustand` 5.0.15, `ai` 7.0.92 |
| **Success criterion** | A real brief typed in the browser reaches `prepareFromBrief` through a validated Server Action; clarification, proposition, human edit, revision, explicit approval, deterministic draft creation, read-back, the created presentation and "Open in Proposales" all work through the existing presentation architecture; the fixture-era turn adapter is off the production path; the exit gate in §14 holds |

This plan is the whole specification for one implementation session. It cites the actual tree. Where this plan and the tree disagree, the tree wins for *names*; this plan wins for *what must be true*; the ratified intentions and the contracts win over both.

---

## 1. Current-state evidence (verified in the tree, not from documentation)

### 1.1 The backend service surface

`src/features/proposal-preparation/server/index.ts` (`import "server-only"` first) exports exactly:

| Export | Signature as implemented | Notes |
|---|---|---|
| `prepareFromBrief(input: unknown, deps = defaultDeps): Promise<TurnResult>` | input `{ brief, state?, conversation? }` (strict) | Mints the generation id only when `state` is absent; two Proposales reads; runs the agent; returns `clarification`, `proposition` or `failed`; appends one assistant turn to the conversation |
| `answerClarification(input: unknown, deps = defaultDeps): Promise<TurnResult>` | `{ state, answers, conversation? }` | Throws `ValidationError` `domain_rule` at `["state","clarification"]` when no round exists; `allowClarification: false`, so it returns `proposition` or `failed` only |
| `editProposition(input: unknown, deps: EditDeps = defaultDeps): Promise<TurnResult>` | `{ state, edits: EditOperation[] (min 1), conversation? }` (`editPropositionInputSchema`, strict) | No model, no Proposales; conversation echoed unchanged; `preparedProposition` untouched |
| `reviseProposition(input: unknown, deps: ReviseDeps = defaultDeps): Promise<TurnResult>` | `{ state, instruction (≤ 2000 chars), conversation? }` | Appends the human turn and the assistant turn; returns `proposition` or `failed` |
| `approveProposition(input: { envelope: unknown }, deps: ApproveDeps = defaultDeps): Promise<ApprovalResult>` | envelope `{ state, proposition, pricingAcknowledgment }` (strict; a `conversation` key is a validation error) | `validateApproval` (checks 1–5 in binding order) then `executeApprovedProposal` (recovery search → one create → read-back); **throws** `AppError` for every expected failure; returns `{ state: { ...state, draftReference }, result: { status: "created" \| "recovered", draft } }` |
| `executeApprovedProposal` | `(raw: unknown, deps)` | Not called by the UI; reached only through `approveProposition` |
| `searchContentForHuman` | `(input: unknown, deps)` | Not exposed in V1 (owner decision 3, no search UI) |
| Types | `ApprovedProposal`, `ConversationContext`, `DraftResult`, `ApprovalResult`, `DomainResult`, `TurnResult`, `ProposalWorkflowState` | Re-exported from the barrel; the schemas behind them live in `schemas/`, which is runtime-neutral and lint-guarded against React/Next/env/`server-only` |

Every service accepts `unknown` and parses strictly itself; every expected failure is a thrown `AppError` subclass (`src/lib/errors/app-error.ts`: `ValidationError` with `details.reason` and `details.issues[] = { path: string[], message }`, `ConflictError` with `details.reason` ∈ `draft_already_exists | multiple_recovery_matches` and, for the first, `details.proposalUuid` / `details.editorUrl`, `ApprovalRequiredError`, `IntegrationError` with `details.system/status/retryable/reason`). `ProposalesError` and `AiProviderError` both extend `IntegrationError`. `src/lib/errors/error-dto.ts` (runtime-neutral) already provides `toErrorDto(unknown): ErrorDto` — `AppError` → its `{ code, message, details? }`; `ZodError` → `validation_error` with issue paths; anything else → `{ code: "internal_error", message: "An unexpected error occurred." }`. `details` never carries `cause`.

`server/services/default-deps.ts` builds every collaborator lazily through getters (`proposales`, `ai`, `editorOrigin`, `logger`) plus `now` and four id generators. Importing a service constructs no client, but it does import `@/lib/env/server`, which parses `process.env` at module load and throws with the *names* of missing variables.

### 1.2 The real schemas and what crosses the wire

| Schema (all in `src/features/proposal-preparation/schemas/`) | Shape facts that matter for the frontend |
|---|---|
| `turn-result.ts` `domainResultSchema` | Five members: `{ status: "clarification", questions: ClarificationQuestion[], budgetExhausted?: { budget } }` · `{ status: "proposition", proposition }` · `{ status: "failed", failure: { reason, code: "validation_error" \| "internal_error", budget?, issues?: { path }[] } }` · `{ status: "created", draft: DraftResult }` · `{ status: "recovered", draft: DraftResult }`. **Note:** the clarification member carries `questions`, not a `{ questions, answers }` record, and created/recovered carry `draft`, not `draftResult`. `failure.issues` is optional. `reason` includes the test-only `script_exhausted` |
| `turnResultSchemaFor(origin)` | `{ state, conversation, result, run? }`; `run` is `{ provider, model, usage: { inputTokens \| null, … } }` |
| `approvalResultSchemaFor(origin)` | `{ state, result: created \| recovered }`; **no conversation** |
| `workflow-state.ts` `proposalWorkflowStateSchemaFor(origin)` | strict: `generationId` (uuid v4), `brief { text, receivedAt }`, `items` (10 keys × `{ resolution }`), `clarification? { questions, answers }`, `preparedProposition?`, `currentProposition?`, `draftReference? { proposalUuid, editorUrl }` (`editorUrl` origin must equal `PROPOSALES_EDITOR_ORIGIN`). `parseProposalWorkflowState` enforces JSON-serializability and `MAX_WORKFLOW_STATE_BYTES = 1 MiB` |
| `conversation.ts` `conversationContextSchema` | strict: `{ turns: ConversationTurn[] (≤ 12), omittedTurns }`; human turns `{ role, turnId, at, text }`, assistant turns add `kind`, `propositionVersion?`. Plain JSON, ISO timestamps |
| `proposition.ts` `propositionSchema` | strict. Leaves are `{ known: true, value, source, ref? } \| { known: false }` where absence is allowed, and `{ value, source, ref? }` where it is not (`block.title`, `block.contentId`, `commercialNotes[].text`, `commercialNotes[].taxBasis`, `commercialAssumptions[].statedValue`, `assumptions[].note`, `warnings[].text`, `alternatives[].reason`). `recipient` is `{ known: true, value: { firstName, lastName, email, phone, companyName } } \| { known: false }` (**one extra `value` level** versus the temporary type). Blocks carry `productId`, `pricing: "library"`, `alternatives[] { variationId, productId, title (bare string), matchStrength, score, reason (sourced) }`. Top level adds `generationId`, `preparedAt`, `emptyDraftConfirmation`; `warnings[]` add `before/after/reason` |
| `clarification.ts` | `questionId` uuid v4; `itemKey` ∈ the ten `INFORMATION_ITEM_KEYS`; answer `{ kind: "answer", text (trimmed, 1–2000) } \| { kind: "skip" }` — identical to what `toClarificationAnswersInput` already produces |
| `edits.ts` `editOperationSchema` | `set_leaf { path: string[], value: unknown }` · `remove_block { index }` · `add_block { candidate: { variationId, productId, title, description? }, quantity?, optional? }` · `unset_recipient` · `confirm_empty_draft`. **There is no `replace_block`**: replacement is `remove_block` + `add_block` in one `edits` array (backend phase 12 C2(c); `add_block` appends at the end) |
| `approval.ts` | `pricingAcknowledgment: { acknowledged: true (literal), statement: LIBRARY_PRICING_STATEMENT_ID }`; the constants `LIBRARY_PRICING_STATEMENT_ID = "library-pricing-v1"` and `LIBRARY_PRICING_STATEMENT_TEXT` are exported from this shared module; `TERMINAL_CONFLICT_MESSAGE` too |
| `draft-result.ts` | `draftResultSchema { proposalUuid, editorUrl (any absolute URL), newlyCreated, seriesUuid?, status?, appliedPricing, notices[] { kind } }`; `appliedPricingSchema` available arm `{ totalWithoutTax, totalWithTax, currency, taxOptions, blocks[] { contentId, quantity: number, optional?, blockCurrency?, four unit values, packageSplit? }, warnings[] { kind: "block_currency_differs", contentId } }`; unavailable arm `{ available: false, reason ∈ 4 closed values, status? }` with **no money field**. Notice kinds: `inline_recipient_may_duplicate_contact`, `editor_url_origin_unexpected` |

`server/domain/apply-edits.ts` resolves `set_leaf` paths against the *current shape*: recipient leaves are addressed as `["recipient","value","email"]`, and setting one on an absent recipient **materializes** the recipient (so the "Recipient: Not set" row can be made editable at a leaf path, but a `set_leaf` at `["recipient"]` alone is `domain_rule: no such field`). `set_leaf.value` is re-parsed with the leaf's own schema, so a quantity must arrive as a JSON number and an optional flag as a JSON boolean.

Serialization: every service output is built from strict Zod schemas with no `Date`, `Map`, class instance or function; timestamps are ISO strings; optional keys are omitted, never set to `undefined`; `run.usage` may carry `null`. `ProposalWorkflowState` and `ConversationContext` are already plain JSON (backend intention §17A.3, §17A.17). No DTO conversion is required for results; only thrown errors need `toErrorDto`.

### 1.3 The frontend's temporary seam

```
components/workspace/agent-surface.tsx            dispatch({kind:"brief"|"answers"})
components/workspace/main-application-surface.tsx dispatch({kind:"edit"|"revision"|"approval"}) — approval carries workflow, proposition, TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT
        ↓
hooks/use-turn-dispatch.ts        captures originSessionId + turnId before any await; startTurn; awaits
        ↓                          temporaryFixtureTurnAdapter.run(input, position); applyTurnResult / applyTurnFailure
client/fixtures/turns.temporary-fixture.ts   scripted outcomes by input kind; 700 ms latency; setTemporaryTurnAdapterForTests seam
        ↓
types/temporary-turn.ts           TemporaryTurnInput, TemporaryTurnOutcome { ok, result, workflow } | { ok:false, error: ErrorDto },
                                  TemporaryDomainResult, TemporaryProposition, TemporaryWorkflowState, TemporaryEditOperation (with replace_block)
        ↓
hooks/use-workspace-session-store.ts   SessionRuntimeRecord { thread, latestResult, workflow, inFlightTurn, hasStartedTurn, unread,
                                       composerDraft, retained, clarificationPanel, callFailure }  — no conversation field
        ↓
client/view-models/{thread,pill,clarification,review,preview,created,failure,main-surface,session-tab}.ts
        ↓
components/**                     consume view models only; no component imports a Temporary* type or a fixture (Pass B audit #2)
```

Facts the plan depends on: `useTurnDispatch` never reads `activeSessionId` (guarded by `use-turn-dispatch.test.ts` R1.3); `applyTurnResult` is total over the four resolution cases and increments unread only for a non-active origin; `CallFailure.retry` re-issues the same input; `useCloseGuard`, `useDepartureGuard`, `deriveTabStatus` and `toMainSurfaceViewModel` read only `workflow?.draftReference`, `workflow?.currentProposition`, `latestResult?.status` and `inFlightTurn` — all of which keep their names and meaning under the real `ProposalWorkflowState`. The retained context is exactly `{ workSurface, openedBlockContentId }` and keys on `block.contentId.value`, a domain identity that survives unchanged.

Temporary-era files (grep `Temporary|temporary` over `src/`, production files only): `types/temporary-turn.ts`, `client/fixtures/{clarification,draft-result,failures,proposition,session-runtime,turns}.temporary-fixture.ts`, `client/view-models/{pill,clarification,review,preview,created,failure}.ts` (type imports), `hooks/use-turn-dispatch.ts`, `hooks/use-workspace-session-store.ts`, `types/session.ts`, and `TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT` in `client/view-models/created.ts` consumed by `components/workspace/main-application-surface.tsx`. Tests that import temporary fixtures: `main-application-surface.test.tsx`, `created-surface.test.tsx`, `agent-status-line.test.tsx`, `turn-failure-notice.test.tsx`, `use-close-guard.test.ts`, `use-status-announcement.test.ts`, `use-turn-dispatch.test.ts`, `use-workspace-session-store.test.ts`, and every `client/view-models/*.test.ts`.

### 1.4 Runtime, tooling and topology

- `src/app/page.tsx` is a Server Component rendering `<ProposalWorkspace />`; `src/app/layout.tsx` loads fonts. `workspace.test.tsx` C5(a) pins `src/app` to exactly `layout.tsx` and `page.tsx`, and C5(c) pins `types/presentation.ts` to export only `MainSurfaceState`.
- No `"use server"` file exists anywhere. `next.config.ts` sets only `devIndicators: false`. Next 16.3.4 exposes `serverActions.bodySizeLimit` (config schema line 246) and per-segment `maxDuration`.
- `eslint.config.mjs` already carves out the boundary this plan builds: client folders (`components/`, `hooks/`, `client/`) may import `**/server/actions` and nothing else under `server/`; `@/lib/{proposales,ai,agent}` and `@/lib/env/server` are forbidden there; `process.env` is forbidden outside `src/lib/env/`, `test/setup/node.ts`, `playwright.config.ts` and `*.live.test.ts`.
- `test/isolation-scan.ts` requires every production `.ts` under `src/features/*/server/` to begin with `import "server-only";` — its regex admits comments and whitespace before the import but **not a `"use server";` directive**, which Next requires to be the first statement of an actions file. This is the one guard the boundary must be reconciled with (§7 WP2).
- Vitest: the `node` project aliases `server-only` to `test/stubs/server-only.ts`; the **`jsdom` project does not**, so a jsdom test that imports the actions module will hit the real `server-only` package unless the alias is added there too (§7 WP4). Both projects import `test/setup/node.ts`, whose module body seeds placeholder env values and installs the offline fetch guard. `test/setup/node.test.ts` C4(d) asserts the env schema has exactly seven names and a placeholder for each.
- Playwright starts `npm run dev` with no explicit env and reuses a running server outside CI; CI (`.github/workflows/ci.yml`) runs typecheck, lint, `npm test`, `npm run test:e2e`, `npm run build` with **no secrets**. Today `e2e/proposal-flow.spec.ts` drives the scripted adapter and asserts fixture content ("Walnut dining set for Studio North"); `e2e/workspace.spec.ts` and `e2e/session-tabs.spec.ts` do not submit turns.
- Live suites: `vitest.live.config.mts` collects only `**/*.live.test.ts`, reads `.env`, runs one file at a time; both suites gate on `LIVE_SMOKE=1` and both pass as of 2026-09-07 (backend master plan §13.3c). The live smoke confirmed `PROPOSALES_EDITOR_ORIGIN = https://secure.proposales.com`, a live catalog of 3 English items, company currency EUR, and that the configured provider is OpenAI with constrained decoding deliberately off.
- Agent budget: `DEFAULT_RUN_BUDGETS.wallTimeMs = 60 000`, `AI_CALL_TIMEOUT_MS = 45 000`; Proposales reads time out at 10 s each with an 8 s total read-back cap. A worst-case AI turn is therefore ≈ 60 s + two catalog reads; an approval ≈ 10 s search + 10 s create + 8 s read-back.
- Vercel (checked 2026-09-07): under Fluid compute, Hobby functions default to and are capped at 300 s; Vercel Authentication (Standard Protection) is available on Hobby and protects deployment and preview URLs but **not the production domain** ([docs](https://vercel.com/docs/deployment-protection), [changelog](https://vercel.com/changelog/higher-defaults-and-limits-for-vercel-functions-running-fluid-compute)).

---

## 2. Source-of-truth precedence

1. Architecture contracts (`architectural_contracts/`), routed through `01-implementation-contract-guide.md`.
2. The ratified backend intention §17A and the merged backend implementation, for commercial, workflow, approval, execution and error truth. **The code wins over the phase-11–15 plans where they differ** (they differ in the `DomainResult` payload names — §1.2 — and in `add_block`'s candidate shape).
3. The ratified frontend intention, for presentation truth, session semantics and the boundary's required properties; owner decision 4 for exposure.
4. This plan, for the concrete boundary, adapter and file decisions.
5. Phase 16, phase 17 and the Pass B plan: source material only.

Contract routing for this sprint (guide §4): `02-runtime-boundaries.md` §2–§6, §8, §9 · `04-server-architecture.md` §3, §4, §6–§9 · `05-client-architecture.md` §3, §5, §6, §8 · `06-data-contracts-and-validation.md` §2, §3, §8 · `08-agent-architecture.md` §6, §9 · `10-security-and-trust-boundaries.md` §1–§5, §7, §10 · `11-testing-principles.md` §2, §3, §5 · `12-anti-patterns.md` runtime boundary, components and client, server, data · `14-documentation-principles.md` §6, §8 · `16-design-prototype-porting.md` §2 step 6, §6. Not routed: `09-database-and-persistence.md` (nothing durable is introduced), `15`, `07` beyond §6 (no adapter changes).

---

## 3. Integration architecture

### 3.1 Current topology

`components → useTurnDispatch → temporaryFixtureTurnAdapter → TemporaryTurnOutcome → store → view models → components`. Nothing leaves the browser.

### 3.2 Target topology (the real version, by file)

```
components/workspace/agent-surface.tsx, main-application-surface.tsx   dispatch(sessionId, TurnInput)   ← UI intents only
        ↓
hooks/use-turn-dispatch.ts        captures originSessionId, turnId, and the record's held state + conversation BEFORE any await;
                                  refuses a dispatch on a terminal record; startTurn; awaits turnTransport.run(input, held)
        ↓
client/turn-transport.ts          production turn adapter: composes the service envelope per intent (replace_block → remove+add,
                                  approval → { state, proposition, pricingAcknowledgment }), calls ONE Server Action,
                                  maps ActionResult → TurnOutcome; exposes setTurnTransportForTests (the retained test seam)
        ↓  (Next.js Server Action RPC; plain JSON both ways)
server/actions.ts ("use server")  five thin actions: (input: unknown) → ActionResult<TurnResult | ApprovalResult>;
                                  no parse of its own beyond what the service does; catches AppError → { ok:false, error: toErrorDto };
                                  logs once; enforces the live-mutation exposure flag on the approval action only
        ↓
server/index.ts                   prepareFromBrief · answerClarification · editProposition · reviseProposition · approveProposition
        ↓
agent + Proposales integration    unchanged
        ↓
TurnResult / ApprovalResult       unchanged backend contract
        ↓
client/turn-transport.ts          TurnOutcome = { ok:true, result: DomainResult, state: ProposalWorkflowState, conversation?: ConversationContext }
                                            | { ok:false, error: ErrorDto }
        ↓
hooks/use-workspace-session-store.ts  SessionRuntimeRecord.workflow: ProposalWorkflowState | null; NEW conversation: ConversationContext | null;
                                      ThreadEntry.result: DomainResult; CallFailure.retry: TurnInput
        ↓
client/view-models/*              production adapters over the real schema types (the rebinding, §5–§6)
        ↓
components/**                     unchanged except the three A/B corrections listed in §6.3
```

### 3.3 Authority boundaries, restated as checks the implementer runs

| # | Boundary | Where it is enforced | Proven by |
|---|---|---|---|
| 1–2 | Browser state is not workflow authority; services are | The action passes the browser's `state` as `unknown`; every service re-parses strictly | T-BOUND-1, T-INT-4 |
| 3–4 | Browser input untrusted; parsed before service use | Each service's own strict `safeParse` is the first thing that touches the input (backend design); the action adds no trusted typing | T-BOUND-1, T-BOUND-2 |
| 5 | No copied schemas in frontend code | Frontend imports types from `schemas/` by inference; the only value imports are `LIBRARY_PRICING_STATEMENT_ID/TEXT` | grep guard T-RET-2 |
| 6–8 | Conversation is linguistic only; state is truth; conversation never reaches approval | Transport sends `conversation` only on brief/answers/edit/revision; the approval envelope is strict and would reject it | T-INT-5 |
| 9–11 | Approval acts on the reviewed proposition; execution deterministic; no AI after approval | `approveProposition` as implemented (validateApproval → executeApprovedProposal, no `ai` in `ExecuteDeps`) | T-INT-6, T-INT-7 (fake create request equals the mapped approved payload) |
| 12–14 | No browser money; Applied Pricing from read-back; no price writes | `toMoneyDisplay` remains the only money operation; the created view model reads `draft.appliedPricing` verbatim | existing `money.test.ts` guard; T-INT-8 |
| 15–16 | No persistence; reload loses the workspace | unchanged store; grep guard in Pass B audit #7 re-run | T-RET-3 |
| 17–18 | Session id ≠ generation id; no client identity in payloads | Transport payloads are composed from the record's `workflow` only; the session id never enters | T-DISP-3 |
| 19–20 | Secrets and integrations never browser-reachable | eslint zones + `server-only` + `test/isolation.test.ts` + Pass B audit #6 grep, re-run over the new modules | T-RET-4, build |

---

## 4. Explicit contract mapping table

For every operation: frontend intent → browser payload (what the transport sends) → Server Action → service → result → store effect → rendered surface.

| Op | Frontend intent (`TurnInput`) | Payload composed by `client/turn-transport.ts` | Action → service | Backend result | Store effect (`applyTurnResult`) | Rendered surface |
|---|---|---|---|---|---|---|
| **Prepare** (first message, or a message while no `currentProposition` exists) | `{ kind: "brief", text }` | `{ brief: text, ...(workflow ? { state: workflow, conversation } : {}) }` — a retry after a `failed` first turn carries the returned state, so the generation id is reused | `prepareTurnAction` → `prepareFromBrief` | `TurnResult` with `clarification` / `proposition` / `failed` | `workflow = state`, `conversation = conversation`, `latestResult = result`, thread gets a result entry, `clarificationPanel = "open"` iff clarification, unread rule unchanged | Thread turn (ask pill / thought + review pill / failure turn); review surface if proposition; panel if clarification |
| **Clarification answer** | `{ kind: "answers", answers }` (from `toClarificationAnswersInput`, unchanged) | `{ state: workflow, answers, conversation }` | `answerClarificationAction` → `answerClarification` | `proposition` / `failed` (never a second clarification) | as above; panel dismissed on proposition | Review surface; failure turn keeps the previous surface |
| **Message after a proposition** | `{ kind: "revision", instruction: text, scope: null }` (agent-surface composer, §6.3 B1) | `{ state, instruction, conversation }` | `revisePropositionAction` → `reviseProposition` | `proposition` / `failed` | as above | Review surface re-renders new version; thread carries human + result turn |
| **Ask the agent about a field** | `{ kind: "revision", instruction: \`About ${label}: ${text}\`, scope: label }` (unchanged) | same as above | same | same | same; scope copied to the result entry (unchanged) | Reply turn with scope badge |
| **Inline edit** | `{ kind: "edit", operation: { op: "set_leaf", path, value } }` where `value` is typed for the leaf kind (§6.3 A2) | `{ state, edits: [operation], conversation }` | `editPropositionAction` → `editProposition` | `proposition` (conversation echoed) or `validation_error` with paths | as above; a `validation_error` with `site.kind === "edit"` renders at the path (unchanged machinery) | Leaf shows the server's new value; validation message at the leaf |
| **Remove line item** | `{ kind: "edit", operation: { op: "remove_block", index } }` | `{ state, edits: [{ op: "remove_block", index }], conversation }` | same | `proposition` | same | Block gone |
| **Replace line item** | `{ kind: "edit", operation: { op: "replace_block", index, variationId } }` (client intent, unchanged) | `{ state, edits: [{ op: "remove_block", index }, { op: "add_block", candidate: { variationId, productId, title } }], conversation }` — the candidate is read from `workflow.currentProposition.blocks[index].alternatives` at dispatch; no `description` (alternatives carry none) | same | `proposition` — the replacement block is appended at the **end** with `contentId.source = "human"` and `description: { known: false }` | same | Block list; replaced block last, flagged "Set by you" |
| **Approve** | `{ kind: "approval" }` (intent only, §6.3 A1) | `{ state: workflow, proposition: workflow.currentProposition, pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID } }` — **no `conversation` key** | `approveProposalAction` → (exposure flag check) → `approveProposition({ envelope })` | `ApprovalResult` `created` / `recovered`; or `ErrorDto` `validation_error` (reasons `pricing_acknowledgment_missing`, `consequential_provenance_invalid`, `required_to_create_unresolved`, `domain_rule`), `conflict` (`draft_already_exists` with existing draft identity; `multiple_recovery_matches`), `integration_error` (search or create failed), `forbidden` (mutations disabled on this deployment) | success: `workflow = state` (now with `draftReference`), `conversation` unchanged, `latestResult = result`; failure: `callFailure.site = creation`, proposition intact | Creating → Created (headline distinguishes recovered) with Applied Pricing, notices, "Open in Proposales"; or creation failure surface with "Back to review" first, "Try again" iff `retryable` |
| **Retry** (any kind) | `callFailure.retry` (the intent, re-dispatched) | Recomposed from the record's current `workflow`/`conversation`, which a failed turn never changed, so the payload deep-equals the original | same action | same | same | same |

Created vs recovered: already distinct on the frontend (`status`, `isRecovered`); a recovered draft after a lost create response is exactly the designed retry path (backend §13), and the fake proves it (T-INT-7b).

Applied Pricing unavailable: maps 1:1 onto the existing `AppliedPricingViewModel.available: false` with the four closed reasons; `status` is not rendered.

Editor URL: rendered verbatim by the existing `CreatedSurface` anchor with `target="_blank" rel="noopener noreferrer"`; the state schema already validated its origin, and a mismatch arrives as the `editor_url_origin_unexpected` notice (rendered as text by the created adapter).

---

## 5. Type migration table

| Temporary module / symbol | Current role | Production replacement | Action | Owning schema |
|---|---|---|---|---|
| `types/temporary-turn.ts` (whole file) | hand-written domain shapes | `DomainResult`, `Proposition`, `ProposalWorkflowState`, `ConversationContext`, `DraftResult`, `AppliedPricingReport`, `ClarificationQuestion`, `ClarificationAnswer`, `EditOperation` imported **as types** from `schemas/*` | **delete** | `schemas/turn-result.ts`, `proposition.ts`, `workflow-state.ts`, `conversation.ts`, `draft-result.ts`, `clarification.ts`, `edits.ts` |
| `TemporaryTurnInput` | UI intents + approval payload | `TurnInput` in new `types/turn.ts`: `brief`, `answers`, `edit` (client ops `set_leaf`/`remove_block`/`replace_block`), `revision`, `approval` (intent only) | rename + reshape | UI-only type (contract 05 §8 allows); the wire envelopes are the services' |
| `TemporaryTurnOutcome` | adapter result | `TurnOutcome` in `types/turn.ts`: `{ ok: true; result: DomainResult; state: ProposalWorkflowState; conversation?: ConversationContext } \| { ok: false; error: ErrorDto }` | rename + reshape | composed of schema types |
| `TemporaryEditOperation.replace_block` | UI replacement intent | kept as a **client intent**; mapped to `remove_block` + `add_block` in the transport | retain in `TurnInput` | `schemas/edits.ts` for the wire |
| `TemporaryWorkflowState` | partial state stand-in | `ProposalWorkflowState` | delete | `schemas/workflow-state.ts` |
| `SessionRuntimeRecord.workflow` | temporary state | `ProposalWorkflowState \| null` | type change | — |
| (none) | — | `SessionRuntimeRecord.conversation: ConversationContext \| null` | **add** | `schemas/conversation.ts` |
| `ThreadEntry.result` | temporary result | `DomainResult` | type change | `schemas/turn-result.ts` |
| `CallFailure.retry` | temporary input | `TurnInput` | type change | — |
| `client/fixtures/turns.temporary-fixture.ts`, `TEMPORARY_FIXTURE_TURN_LATENCY_MS`, `setTemporaryTurnAdapterForTests` | scripted runtime adapter | `client/turn-transport.ts` (`turnTransport`, `setTurnTransportForTests`) | **delete**; seam moves | — |
| `client/fixtures/proposition.temporary-fixture.ts` → `proposition.fixture.ts` | literals for view models | `fixturePropositionV1/V2/V3/LongText/Empty = propositionSchema.parse(literal)` in the real shape (Studio North content kept so string assertions survive; ids become uuid v4 / positive int64 strings; `productId`, `pricing`, sourced titles, `generationId`, `preparedAt` added) | rename + rewrite as parse results; **test-only** | `schemas/proposition.ts` |
| `clarification.temporary-fixture.ts` → `clarification.fixture.ts` | question/answer literals | `fixtureClarificationSingle/Batch/Answered` as `clarificationSchema.parse(...)`; `itemKey` from `INFORMATION_ITEM_KEYS`, uuid question ids; plus `fixtureClarificationResult` (`DomainResult` member with `questions`) | rename + rewrite; test-only | `schemas/clarification.ts`, `turn-result.ts` |
| `draft-result.temporary-fixture.ts` → `draft-result.fixture.ts` | draft/pricing literals | `draftResultSchema.parse(...)` variants (created, recovered, inconsistent totals, unavailable(reason), with notice, with origin notice) | rename + rewrite; test-only | `schemas/draft-result.ts` |
| `failures.temporary-fixture.ts` → `failures.fixture.ts` | `ErrorDto` factory + run failures | `fixtureErrorDto(code, overrides)` validated with `errorDtoSchema.parse`; `fixtureRunFailure(reason)` in the real `failure` shape (with `code`) | rename + rewrite; test-only | `src/lib/errors/error-dto.ts`, `schemas/turn-result.ts` |
| `session-runtime.temporary-fixture.ts` → `session-runtime.fixture.ts` | record factory | same factory with `conversation: null` added | rename; test-only | — |
| (new) `client/fixtures/workflow-state.fixture.ts` | — | `fixtureWorkflowState(overrides)` = `parseProposalWorkflowState(literal, "https://proposales.test")`, built from `validState()` in `fixtures/states.ts` plus the frontend propositions | **add**; test-only | `schemas/workflow-state.ts` |
| `TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT` (`client/view-models/created.ts`) | fake acknowledgment pair | `{ statementId: LIBRARY_PRICING_STATEMENT_ID, wording: LIBRARY_PRICING_STATEMENT_TEXT }` exposed by `review.ts` as `PRICING_ACKNOWLEDGMENT` | delete; replace | `schemas/approval.ts` |
| backend `fixtures/{briefs,catalog,scripts,propositions,states,envelopes,conversations}.ts` | backend test data | reused as-is by the offline integration test | retain | — |

Deliberately not rendered in V1 (recorded so the omission is a decision, not a gap — intention §12A.9): `TurnResult.run` (diagnostic; dropped by the transport, never stored), `proposition.generationId/preparedAt/emptyDraftConfirmation`, `block.productId`, `alternatives[].score/productId`, `warnings[].before/after/reason`, `draft.seriesUuid/status`, `appliedPricing.taxOptions/blockCurrency/unitValueWithoutDiscount*/packageSplit`, `appliedPricing.unavailable.status`, `failure.code`. `clarification.budgetExhausted` **is** rendered: the ask pill's meta appends "· the agent reached its {budget} limit".

---

## 6. Presentation impact classification

### 6.1 The rule

The seam is replaced through `types/`, `client/`, `hooks/` and `server/actions.ts`. Components change only where the real backend exposes a fact the fixture era could not know, and each change is classified. The backend contract is not bent.

### 6.2 Components expected to remain byte-identical

Everything under `components/agent/`, `components/clarification/`, `components/creation/`, `components/idle/`, `components/pills/`, `components/preview/`, `components/review/`, `components/session-tabs/`, and `components/workspace/{proposal-workspace,confirm-dialog,workspace-divider,constants}.tsx`. Their prop types are view-model types, and every view-model type keeps its name and field set (`EditableLeafViewModel`, `BlockViewModel`, `AlternativeViewModel`, `PillViewModel`, `CreatedViewModel`, `AppliedPricingViewModel`, `CallFailureViewModel`, …). Assert this with `git diff --stat <checkpoint> -- src/features/proposal-preparation/components/` at WP6.

### 6.3 Predicted component changes (three files, all small)

| ID | File | Change | Class | Why the fixture era could not know it |
|---|---|---|---|---|
| **A1** | `components/workspace/main-application-surface.tsx` | `onApprove` dispatches `{ kind: "approval" }` only; drop the `TEMPORARY_FIXTURE_PRICING_ACKNOWLEDGMENT` import | A — transport correction | The real envelope is composed from the held `ProposalWorkflowState` and the shared acknowledgment constants, which belong to the transport, not to a component |
| **A2** | `components/workspace/main-application-surface.tsx` | `onCommitEdit` passes the leaf **kind** with the value: `{ path, value: toLeafValue(kind, text) }` where `toLeafValue` (in `client/view-models/review.ts`) returns a JSON number for `kind: "number"` when the trimmed text matches `/^-?\d+(\.\d+)?$/`, a boolean for `kind: "boolean"` when the text is `yes/no/true/false` case-insensitively, and the raw string otherwise (the server then reports the type error at the path). The kind is looked up from `surface.review` by element-wise path equality. `useInlineEdit` and `InlineEditableValue` are untouched | A — transport correction (JSON typing of the wire value; not locale conversion, not reformatting) | The fixture ignored the value; `apply-edits.ts` re-parses it with the leaf's schema |
| **B1** | `components/workspace/agent-surface.tsx` | `submitBrief` dispatches `{ kind: "revision", instruction: text, scope: null }` when `record.workflow?.currentProposition` exists, else `{ kind: "brief", text }`; the composer is disabled (`isSubmitting`) when `record.workflow?.draftReference` exists | B — presentation contract correction | The hint already says "Ask for a revision"; the fixture answered every composer message with a clarification. A terminal session offers no turn (intention §12A.15; feature README "Proposales is the editing environment from that point") |

Anything beyond these three is a stop condition: record it in the sprint log with its classification before touching the file, and route a C-class change to the owner.

---

## 7. Work packages

Commit a checkpoint after each package: `CHECKPOINT (not approved): integration sprint WP<n> <slug>`. Run `npm test` before every checkpoint; the full stamp (§14) at WP7. Do not push.

### WP1 — Confirm the inventory (read-only, ≤ 30 minutes)

**Goal.** Verify §1, §4 and §5 against the tree at session start; adopt the tree's names where they differ; record differences in the sprint log (§15). No code.

**Steps.** (1) `git status --porcelain` empty, branch `proposal-copilot-integration`, `npm test` green. (2) Open `server/index.ts`, the five services, `schemas/{turn-result,workflow-state,conversation,proposition,clarification,edits,approval,draft-result}.ts`, `types/{session,temporary-turn}.ts`, `hooks/use-turn-dispatch.ts`, `hooks/use-workspace-session-store.ts`, `client/fixtures/turns.temporary-fixture.ts`, the two workspace components, `eslint.config.mjs`, `test/isolation-scan.ts`, `vitest.config.mts`, `playwright.config.ts`. (3) Confirm each row of §5 resolves. (4) Confirm `apply-edits.ts` still materializes the recipient and appends `add_block`.

**Stop conditions.** A service signature or result member differs from §1.1–§1.2 → adopt the tree, log it, and re-derive the affected §4 row before continuing. A `"use server"` file already exists → stop and report.

### WP2 — Thin validated server boundary

**Goal.** The real browser → server seam: `unknown → one service → discriminated result`, no business rule, no integration import, expected failures as data, the exposure rule, and a serialization proof.

**Files expected to change**
```
src/lib/errors/action-result.ts                                  new — runtime-neutral: ActionResult<T>, toActionResult()
src/lib/errors/action-result.test.ts                             new (node)
src/features/proposal-preparation/server/actions.ts              new — "use server"; then import "server-only"
src/features/proposal-preparation/server/actions.test.ts         new (node)
src/lib/env/server.ts                                            edited — COPILOT_LIVE_MUTATIONS
src/lib/env/server.test.ts                                       edited — the new variable's rows
.env.example                                                     edited — the new variable, one comment
test/setup/node.ts, test/setup/node.test.ts                      edited — placeholder for the new variable; C4(d) count 7 → 8
test/isolation-scan.ts, test/isolation.test.ts                   edited — allow a leading "use server"; directive; planted-defect row
next.config.ts                                                   edited — serverActions.bodySizeLimit: "2mb"
```
**Forbidden.** Any file under `server/services/`, `server/domain/`, `server/agent/`, `server/tools/`, `schemas/`, `src/lib/proposales/`, `src/lib/ai/`, `src/lib/agent/`.

**Ordered steps.**
1. `src/lib/errors/action-result.ts`: `export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ErrorDto }` and `export async function toActionResult<T>(run: () => Promise<T>, onError?: (error: unknown) => void): Promise<ActionResult<T>>` — catches everything, calls `onError`, returns `{ ok: false, error: toErrorDto(error) }`. No `server-only` (it is imported by the client for the type only, and it is runtime-neutral).
2. `server/actions.ts`, first statement `"use server";`, second `import "server-only";`. Exactly five exports, all `async (input: unknown)`: `prepareTurnAction`, `answerClarificationAction`, `editPropositionAction`, `revisePropositionAction`, `approveProposalAction`. Each body is `toActionResult(() => service(input), (error) => log(error))` with the service imported from `./index`. `approveProposalAction` first checks `serverEnv.COPILOT_LIVE_MUTATIONS === "enabled"`; otherwise it returns `{ ok: false, error: { code: "forbidden", message: "Draft creation is disabled on this deployment." } }` **without** calling the service — via `new AuthorizationError({ message })` through `toErrorDto`, so the code stays in the taxonomy. The approval action passes `{ envelope: input }`. No other logic; the file stays under 60 lines. Logging: one `createLogger().error("action.failed", { action, code, reason: details?.reason, system: details?.system, status: details?.status })` per failure; **never** the message of a `cause`, never the input.
3. `src/lib/env/server.ts`: add `COPILOT_LIVE_MUTATIONS: z.enum(["enabled", "disabled"])` (required, no default — a deployment decides explicitly; see §9). Update `.env.example`, placeholders (`disabled` in `test/setup/node.ts` is fine for the default suite; the boundary test constructs the enabled configuration explicitly), and `node.test.ts` C4(d)'s count.
4. `test/isolation-scan.ts`: extend `SERVER_ONLY_FIRST` to accept an optional `"use server";` / `'use server';` directive (with the same comment/whitespace prologue) before `import "server-only";`. Add a planted row: a file starting with `"use server";` but lacking the import is still a violation; one starting with `"use server";\nimport "server-only";` is not.
5. `next.config.ts`: `serverActions: { bodySizeLimit: "2mb" }`. Reason recorded in the file's comment: the state is bounded at 1 MiB by `MAX_WORKFLOW_STATE_BYTES`, and the approval envelope carries the proposition a second time plus the conversation window, so a compliant envelope can exceed the framework's 1 MB default.
6. Boundary tests (`server/actions.test.ts`, node project, `vi.mock("./index")` per contract 11 §2 "mocked service module" for rows a–c; the real service for row d):
   - **T-BOUND-1** malformed input (`{ brief: 42 }`, `{}`, a string) → `{ ok: false, error: { code: "validation_error", details: { issues: [{ path: [...] }] } } }`, service parse being the source (use the real `prepareFromBrief` with a fake deps object for this row so the strict schema is the one under test — no network is reached because parsing fails first).
   - **T-BOUND-2** a service throwing `ConflictError({ reason: "draft_already_exists", details })` → `{ ok: false, error: { code: "conflict", details } }`; a service throwing `new Error("boom")` → `{ ok: false, error: { code: "internal_error", message: "An unexpected error occurred." } }` with `details` absent and `"boom"` nowhere in the result.
   - **T-BOUND-3** each action calls exactly one service exactly once with the raw input (approval: `{ envelope: input }`).
   - **T-BOUND-4** exposure: with `COPILOT_LIVE_MUTATIONS=disabled` constructed explicitly (mock the env module), `approveProposalAction` returns `forbidden` and the service is not called; with `enabled` the service is called. *Planted defect:* remove the check → the disabled row reddens.
   - **T-BOUND-5** serialization: for a `TurnResult` and an `ApprovalResult` produced by the real services over the fakes (reuse `workflow.test.ts`'s deps recipe), `JSON.parse(JSON.stringify(result))` deep-equals `result`, and a recursive walk finds no `undefined` inside any array, no `Date`, no function.
   - `isolation.test.ts` I1 stays green with the new file and the new planted rows.

**Verification.** `npm test`, `npm run typecheck`, `npm run lint`. **Stop conditions.** The action needs a second schema to type its input → it does not; use the service. A service must change to fit the action → stop; the boundary bends, not the service.

### WP3 — Type and seam rebinding (compile-green as one unit)

**Goal.** Replace every temporary type with the real schema type; add the production transport; add `conversation` to the record; rebind the view models and their fixtures. Runtime behaviour of the store and the hook is preserved.

**Files expected to change**
```
types/turn.ts                                    new — TurnInput, TurnOutcome
types/temporary-turn.ts                          deleted (WP6 confirms nothing imports it; delete here if the build allows)
types/session.ts                                 edited — real types; conversation field
client/turn-transport.ts                         new — production adapter + setTurnTransportForTests
client/turn-transport.test.ts                    new (node) — payload composition rows
client/fixtures/*.fixture.ts                     renamed + rewritten as parse results (§5); + workflow-state.fixture.ts
client/fixtures/*.fixture.test.ts                one construction test per module
client/view-models/{pill,thread,clarification,review,preview,created,failure}.ts  edited — real inputs
client/view-models/*.test.ts                     edited — fixtures rebound; assertions unchanged where possible
hooks/use-workspace-session-store.ts             edited — conversation carried; TurnOutcome shape
hooks/use-turn-dispatch.ts                       edited — held state captured; transport call; terminal guard
hooks/use-turn-dispatch.test.ts, hooks/use-workspace-session-store.test.ts  edited — shapes; seam renamed
components/**/*.test.tsx, hooks/*.test.ts        edited only for fixture imports/shapes
```
**Forbidden.** Any component file other than §6.3's three (touched in WP4/WP5, not here); `schemas/`; `server/` other than `actions.ts`.

**Ordered steps.**
1. `types/turn.ts` per §5. `types/session.ts`: `workflow: ProposalWorkflowState | null`, `conversation: ConversationContext | null`, `ThreadEntry.result: DomainResult`, `CallFailure.retry: TurnInput`. Keep `InFlightTurn`, `RetainedContext`, `TabStatus`, `WorkSurface` untouched.
2. `client/turn-transport.ts`: `type Held = { workflow: ProposalWorkflowState | null; conversation: ConversationContext | null }`; `turnTransport.run(input: TurnInput, held: Held): Promise<TurnOutcome>` composes the envelope per §4, calls the matching action from `../server/actions`, maps `{ ok: true, data }` → `{ ok: true, result: data.result, state: data.state, ...("conversation" in data ? { conversation: data.conversation } : {}) }` and `{ ok: false, error }` through unchanged. `replace_block` resolution: read `held.workflow.currentProposition.blocks[index].alternatives.find(a => a.variationId === variationId)`; if absent, return `{ ok: false, error: { code: "validation_error", message: "That alternative is no longer offered.", details: { issues: [{ path: ["blocks", String(index)], message: … }] } } }` without calling the server. `setTurnTransportForTests(transport | null)` keeps the existing injection pattern. The module imports nothing from `server/` except `./server/actions` and nothing from `@/lib/*` except types.
3. Store: `applyTurnResult` sets `workflow = outcome.state` and `conversation = outcome.conversation === undefined ? record.conversation : outcome.conversation`; everything else unchanged. `createSessionRecord` adds `conversation: null`. Keep `const id = createSessionId();` (guarded) and no `incrementUnread`/`attention:` strings (guarded).
4. Hook: before any `await`, capture `originSessionId`, `turnId`, and `held = { workflow: record.workflow, conversation: record.conversation }`; refuse (`return`) when `record.workflow?.draftReference` exists **or** a turn is in flight (existing rule); the human-entry, composer-clear and failure-site logic stay as they are; call `turnTransport.run(input, held)`. The module must still contain no `activeSessionId` (R1.3).
5. View models, adapter by adapter (each touching one file and its fixture): `pill.ts` (`result.questions`; answered record from `workflow?.clarification` passed by `thread.ts`; `draft.editorUrl`; `budgetExhausted` meta), `thread.ts` (signature gains the record's `workflow`; `toRunFailureTurn` unchanged call), `clarification.ts` (`latestResult.questions`; answers from `record.workflow?.clarification?.answers ?? []` — an absent round means no answers, which is a fact, not a default), `review.ts` (real leaves; `recipient.value.*` and paths `["recipient","value",key]`; the absent-recipient row becomes five "Not set" recipient rows at their leaf paths — this is what `materializeRecipient` supports, and it removes a dead affordance; `block.title.value`; `alternative.reason.value`; always-sourced leaves through a `sourcedToLeaf(leaf)` helper that yields `{ known: true, ... }`; `PRICING_ACKNOWLEDGMENT` from the schema constants; `toLeafValue` for A2), `preview.ts` (`block.title.value`), `created.ts` (`result.draft`; `optional === true`; notice kinds → text; drop the temporary constant), `failure.ts` (`failure.issues ?? []` is the one permitted `??`, because absence means "no paths were reported"; a `script_exhausted` row rendered like `tool_output_invalid`).
6. Fixtures per §5, each exported as the schema's parse result, each with a construction test asserting `schema.safeParse(literal).success === true` and one row that a literal missing a required field fails (the F15 named mutation, run once per module and kept as a test, not a manual probe).
7. Rebind every test that imported a temporary fixture; keep assertions; delete only assertions that asserted the temporary shape itself (e.g. `draftResult` key names).

**Verification.** `npm run typecheck` green; `npm test` green; the three presentation-test facts: no `components/**/*.tsx` production file changed in this WP (`git diff --stat -- components/ | grep -v test` empty).

**Stop conditions.** A view-model type needs a new field for a component to render → stop; check whether the component already renders it under another name; if it truly needs a new prop, that is a B/C change and is logged before WP4.

### WP4 — Conversational turns wired and proven offline

**Goal.** Brief → real preparation → clarification or proposition → answers → proposition → human edit → agent revision, through the real action functions and real services with controlled dependencies, rendered by the real components.

**Files expected to change**
```
components/workspace/agent-surface.tsx                 B1
components/workspace/main-application-surface.tsx      A1, A2
components/workspace/main-application-surface.test.tsx edited — approval intent guard; acknowledgment pair
vitest.config.mts                                      edited — server-only alias added to the jsdom project
src/features/proposal-preparation/workflow-ui.test.tsx new (jsdom) — the offline vertical slice, part 1
```
**Forbidden.** Every other component; `server/` except `actions.ts`.

**Ordered steps.**
1. Apply A1, A2, B1 exactly as §6.3 states.
2. `vitest.config.mts`: add the `server-only` alias to the jsdom project's `resolve.alias` (mirror the node project). `test/setup/node.ts` already seeds env for jsdom through `vitest.setup.ts`.
3. `workflow-ui.test.tsx`: `vi.mock("@/features/proposal-preparation/server/services/default-deps", () => ({ defaultDeps: holder }))` where `holder` is a getter-based object the test mutates per turn (`proposales` = `createFakeProposalesClient({ catalog: FIXTURE_CATALOG, editorOrigin: "https://proposales.test", newUuid, now, proposalReadback })`, `ai` = a `createScriptedAiClient(steps)` swapped per turn, `editorOrigin: "https://proposales.test"`, deterministic ids and clock, a captured logger). Render `<ProposalWorkspace />`, then drive it as a user with Testing Library, exactly as the E2E did on the fixture: type `BRIEFS.noRecipient`, Enter → script `clarifyRecipient()` → the "Agent questions" region appears with the recipient question; answer "Anna Berg, anna.berg@northwind.example", send → script `proposeStrong()` → the review heading appears; edit Title to "Integration title", Enter → **no AI script consumed**, heading shows "Integration title" and the leaf is flagged "Set by you"; ask the agent about Title with "use the second one" → script `selectSecondAlternative()` → the reply turn carries the scope badge and the proposition re-renders. Assert after each turn: the record's `workflow` deep-equals the `state` the service returned (the transport captured it, spy on the action or on the fake's call sequence), `workflow.generationId` is the value minted by the injected `newGenerationId` and never the session id, the conversation length grows only on brief/answers/revision (edit leaves it unchanged), and the unread/attention machinery is untouched (session stays active).
   - **T-INT-1** clarification round-trip · **T-INT-2** proposition round-trip · **T-INT-3** explicit edit round-trip with a `validation_error` sub-row (quantity "abc" → message at the quantity leaf, proposition unchanged) · **T-INT-4** revision round-trip · **T-INT-5** conversation carried only on conversational turns (spy on the composed payloads: `edit` sends `conversation` for echo; approval sends none) · **T-DISP-3** generation id identity and "no session id in any payload" (`JSON.stringify(payload)` does not contain the session id; `payload.state.generationId === serverReturned.generationId` by string equality).

**Verification.** `npm test`; `npm run lint` (the jsdom test must not trip the client-zone import rules — it lives at the feature root, outside `components/hooks/client`).

**Stop conditions.** A component must change beyond A1/A2/B1 for a turn to render → stop and classify. The scripted client's step order does not match the agent's real call order → read `preparation.agent.ts` and `workflow.test.ts`; the scripts there are the source of truth for step shapes.

### WP5 — Approval and execution

**Goal.** Reviewed proposition → explicit approval → deterministic execution → created/recovered → read-back → created UI → editor URL, plus every approval failure the backend can return.

**Files expected to change**
```
src/features/proposal-preparation/workflow-ui.test.tsx   extended — part 2
client/view-models/created.test.ts, failure.test.ts       rows for notices, recovered, unavailable, conflict
```
**Forbidden.** Any component; any `server/` file except `actions.ts`.

**Ordered steps.** Continue the WP4 flow: click "Approve and create draft" → creating heading focused → created heading focused → assertions:
- **T-INT-6** the fake's single `createProposalDraft` call has `request` deep-equal to `toCreateProposalRequest(toCreateDraftInput(approved), { companyId, now })` where `approved` is obtained by calling `validateApproval` on the exact envelope the transport sent (spy), and `writes === 1`; no `generateStep` was invoked after approval (the `ai` getter returns `createFailingAiClient()` for this turn).
- **T-INT-7** `created` renders the headline "Draft created in Proposales", the proposal uuid, and the link whose `href` is character-identical to `result.draft.editorUrl`; **T-INT-7b** with the fake seeded (`proposals: [summary]`, `proposalReadbacks`) a fresh approval renders "Draft recovered in Proposales" with `writes === 0`.
- **T-INT-8** Applied Pricing renders the fake read-back's totals through `toMoneyDisplay` only, and with `failNext("getProposal", timeoutError)` the created surface shows "Applied pricing unavailable" with the timeout text and no amount anywhere in the DOM.
- **T-INT-9** failures as data: `failNext("createProposalDraft", 503 ProposalesError)` → creation failure surface with the DTO message, "Back to review" first in tab order, "Try again" present (retryable) → retry → the fake now has one stored proposal? No: the failed create stored nothing, so retry creates (`writes === 1`) — assert the retry payload deep-equals the first; `COPILOT_LIVE_MUTATIONS=disabled` → `forbidden` message, no "Try again"; a stale envelope with a `draftReference` → `conflict` with the existing draft link.
- Store-level: after any failure `workflow.currentProposition` deep-equals the pre-approval value (existing R6.5 logic, now over real shapes).

**Verification.** `npm test`. **Stop conditions.** Rendering recovered/created/unavailable needs a component change → stop; the adapters own these distinctions.

### WP6 — Fixture-era retirement and end-to-end rebinding

**Goal.** No fixture adapter on the production path; no temporary marker anywhere; Playwright split into offline (CI) and live (opt-in) flows.

**Files expected to change**
```
types/temporary-turn.ts, client/fixtures/turns.temporary-fixture.ts   deleted (if not already)
src/features/proposal-preparation/retirement.test.ts                  new (node) — grep guards
e2e/proposal-flow.spec.ts                                              rewritten — offline rows only
e2e/proposal-flow.live.spec.ts                                         new — the critical flow against the real backend
playwright.config.ts                                                   edited — placeholder env for offline runs; live project
README.md (Testing strategy bullets only; the rest in WP7)
```
**Ordered steps.**
1. Delete the two files; `grep -rn "Temporary\|temporary-fixture\|temporaryFixture\|TEMPORARY_FIXTURE" src` returns nothing outside comments that explain history (prefer none).
2. `retirement.test.ts` (**T-RET-1..4**): (1) no production file under `src/` contains the temporary markers; (2) no production file under `components/`, `hooks/` or `client/` imports from `client/fixtures/` or hand-declares a type named `Proposition`, `DomainResult`, `ProposalWorkflowState`, `ConversationContext` (regex over `type X =`/`interface X`); (3) no persistence API string anywhere under the feature (Pass B audit #7, kept as a test); (4) no production file under `components/`, `hooks/` or `client/` imports `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, `@/lib/env/server`, or any `server/` path other than `server/actions`. Each guard has a planted in-memory source proving it fires.
3. `playwright.config.ts`: `webServer.env` = the placeholder set from `test/setup/node.ts` (including `COPILOT_LIVE_MUTATIONS=disabled`) **unless** `LIVE_SMOKE === "1"`, in which case nothing is injected and `next dev` reads `.env`. Projects: `chromium` with `testIgnore: /\.live\.spec\.ts$/`, and `chromium-live` with `testMatch: /\.live\.spec\.ts$/` included only when `LIVE_SMOKE === "1"`. Verify that `/` renders under placeholders and that nothing reaches the network until a turn is submitted (the offline fetch guard does not exist in `next dev`; verify by the absence of any request in the dev log).
4. `e2e/proposal-flow.spec.ts` (offline, CI): keep every row that does not need a backend result — new-session and close-guard rows on composer text, reload loses the workspace — and add **T-E2E-1**: paste a brief of `MAX_BRIEF_CHARS + 1` characters, send, and assert the turn-failure notice renders the validation message and the tab returns to `Open`; this row proves the real Server Action transport, the `ErrorDto` crossing and the failure rendering with zero external calls. Rows that needed a proposition (retained context, creating refusal, narrow-width review containment, reduced-motion review loop) move to the live spec.
5. `e2e/proposal-flow.live.spec.ts` (**T-E2E-2**): brief `BRIEFS.englishSimple`-like text with no real personal data; if the "Agent questions" region appears, answer every open question with a generic sentence and send; wait for the review heading; edit Title to `[DISPOSABLE COPILOT E2E] <iso timestamp>` (so the draft is findable for deletion); ask the agent one revision; approve; assert the created heading, that the link `href` starts with `PROPOSALES_EDITOR_ORIGIN` (read in the config, passed via `test.use` options — the spec itself reads no env), and print the proposal uuid. Requires `COPILOT_LIVE_MUTATIONS=enabled` in `.env`. Mark `test.slow()`; timeouts ≥ 180 s.

**Verification.** `npm run test:e2e` green offline; `LIVE_SMOKE=1 npm run test:e2e` green for the owner (creates one real draft, reported for deletion). **Stop conditions.** An offline E2E row needs a backend result → it is a live row; do not add a fake composition root to the product (§13 alternative A, rejected).

### WP7 — Critical flow proof, deployment readiness, documentation

**Goal.** The full stamp, the live proof recorded by the owner, the tree ready for Vercel, documentation true.

**Files expected to change**
```
src/app/page.tsx                                        edited — export const maxDuration = 120 (+ one comment)
src/features/proposal-preparation/README.md             rewritten to the integrated state (current-state document)
README.md                                               Status, Intended workflow, Current scope, Environment table, Quality, Testing strategy, Deployment
src/lib/proposales/README.md, src/lib/ai/README.md      only if a claim went false (expected: none)
build_docs/under_constroction/frontend_core/plans/sprint-integration-backend-frontend.md   sprint log §15
build_docs/under_constroction/frontend_core/master-plan.md   tracker rows 16/17 → SUPERSEDED, pointer to this plan
```
**Ordered steps.**
1. `src/app/page.tsx`: `export const maxDuration = 120;` — Server Actions invoked from this page inherit it. Under Fluid compute on Hobby the cap is 300 s, so 120 is accepted; if the Vercel build rejects the value the project is not on Fluid compute and the owner must enable it (§9). `workspace.test.tsx` C5(a) still passes (no navigation string).
2. Stamp, in order: `npm run typecheck` · `npm run lint` · `npm test` · `npm run test:e2e` · `npm run build`. Restore `next-env.d.ts`/`tsconfig.tsbuildinfo` if regenerated (Pass B rule).
3. Owner-run live proof (not the implementer's to run unless authorized): `LIVE_SMOKE=1 npm run test:live` (unchanged suites) and `LIVE_SMOKE=1 npm run test:e2e`. Record date, tree SHA and the created uuid in §15.
4. Documentation impact review (contract 14 §8.4): feature README sections — purpose, status `implemented (integrated; no persistence)`, flow with the browser included, responsibilities (the frontend owns presentation and page-lifetime session mechanics; the server owns everything consequential), important states, invariants (the four from 14 §6.2 plus session/generation id separation, no browser money, terminal sessions), client/server behaviour (Server Actions in `server/actions.ts`, `ActionResult`, the exposure flag), data contracts → `schemas/`, failure behaviour (two channels), security (untrusted browser input; deployment posture; `COPILOT_LIVE_MUTATIONS`), testing (offline slice, boundary tests, opt-in live), limitations (replacement appends at the end; no progress reporting; reload loses work; recipient rows; OpenAI retries). Root README: status paragraph, current scope "Not yet built" → removed, environment table gains the flag, Quality/Testing strategy describe the offline/live split, Deployment describes the posture and `maxDuration`. Remove every "planned" wording about the seam.
5. Sprint log (§15) filled; tracker pointer in the frontend master plan.

**Verification.** All five stamp commands green; `git status --porcelain` empty after the closing commit; every internal link in both READMEs resolves.

---

## 8. Test matrix

| Layer | Runner / project | Tests (ids from §7) | Proves (prompt's required rows) |
|---|---|---|---|
| Unit — adapters and fixtures | Vitest node | `client/view-models/*.test.ts` rebound; `client/fixtures/*.fixture.test.ts` construction rows; `turn-transport.test.ts` payload composition (brief without/with state, answers, edit, replace → remove+add, revision, approval envelope without conversation, retry equality, missing alternative) | 4, 5, 12, 13 (adapter half) |
| Unit — runtime-neutral | Vitest node | `action-result.test.ts`; `error-dto` unchanged | 2 |
| Store / hook | Vitest jsdom | existing `use-workspace-session-store.test.ts`, `use-turn-dispatch.test.ts` (R1.1–R1.9, R5.x, R6.x) over real shapes; new rows: terminal record refuses dispatch; `conversation` carried and preserved on approval; held state captured before await | 3, 14, 15 |
| Server boundary | Vitest node | `server/actions.test.ts` T-BOUND-1..5; `isolation.test.ts` I1 + the `"use server"` rows; `env/server.test.ts` flag rows | 1, 2, 17 (server-only), 18 (serialization) |
| Offline integration | Vitest jsdom | `workflow-ui.test.tsx` T-INT-1..9, T-DISP-3 | 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 |
| Retirement / graph guards | Vitest node | `retirement.test.ts` T-RET-1..4; Pass B audit greps made permanent | 16, 17 |
| E2E offline (CI) | Playwright `chromium` | `workspace.spec.ts`, `session-tabs.spec.ts` unchanged; `proposal-flow.spec.ts` offline rows + T-E2E-1 | real transport; boundary rejection over HTTP |
| Live AI | Vitest live (`LIVE_SMOKE=1`) | `preparation.live.test.ts` unchanged | — |
| Live Proposales | Vitest live | `smoke.live.test.ts` unchanged | — |
| Live critical flow | Playwright `chromium-live` (`LIVE_SMOKE=1`) | `proposal-flow.live.spec.ts` T-E2E-2 | the vertical slice for real; final human demo rehearsal |
| Production build | `npm run build` | — | 18 |

Mutation/planted-defect rows retained (each proves a guard that is otherwise decoration): T-BOUND-4 (exposure check removed), the isolation `"use server"` row, the fixture construction rows (required field removed), T-RET-1..4 planted sources, R1.3 (activeSessionId absent from the hook). Nothing else.

---

## 9. Deployment and security implications

- **Server Actions are public endpoints** (contract 10 §3). Every one parses through the service's strict schema, returns data for expected failures, and exposes no integration. `approveProposalAction` is the only live mutation.
- **Exposure rule (owner decision 4) — mechanism.** `COPILOT_LIVE_MUTATIONS=enabled|disabled`, server-only, required, read only in `server/actions.ts`. `disabled` returns `forbidden` before the service is called; the review surface renders the DTO message with "Back to review". This is an operational switch, not application authorization: browser input is untrusted in both settings and every contract is enforced regardless. It does not gate preparation or revision (they spend AI budget and read the catalog but mutate nothing).
- **Posture (owner's call at deploy time, §13 card 1).** On Hobby, Vercel Authentication protects preview/deployment URLs, not the production domain. Two compliant configurations exist: a protected preview URL with mutations `enabled`, or a public production URL with mutations `disabled`.
- **Function duration.** `maxDuration = 120` on the page; requires Fluid compute (default for projects created after 2025-04-23). Worst-case AI turn ≈ 60 s agent budget + reads; approval ≈ 30 s. No streaming, no progress: the creating/working presentations show one honest label (intention §12A.15).
- **Body size.** `serverActions.bodySizeLimit: "2mb"`; the state's own 1 MiB bound still fails loudly with `workflow_state_too_large`.
- **Environment on Vercel.** The seven existing variables plus `COPILOT_LIVE_MUTATIONS`; `PROPOSALES_EDITOR_ORIGIN=https://secure.proposales.com` (verified live). Missing variables fail at first action with names only.
- **Client bundle.** Importing `LIBRARY_PRICING_STATEMENT_ID/TEXT` from `schemas/approval.ts` pulls zod into the client graph. Accepted for the MVP; the alternative (moving two constants) would edit a backend schema file. Confirm with `npm run build`'s route size output; if it exceeds taste, note in §15, do not restructure.
- **Logging.** Once per failed action, codes and reasons only (contract 10 §7). No `console.log`.
- **Nothing persists**; module-level state in `server/` is untouched; the fake Proposales client is never on a deployed path.

---

## 10. Documentation impact

Triggers (14 §8.1): new capability (the seam), changed user flow, new environment variable, changed test commands, deployment change, changed HITL behaviour surface, new limitation. Authoritative owners to patch: `src/features/proposal-preparation/README.md` (rewrite as current state; no chronology), root `README.md` (Status, Intended workflow, Current scope, Environment, Quality, Testing strategy, Deployment), `.env.example`. Not patched: architecture contracts (no rule changed), the Proposales/AI integration READMEs (no adapter change), `api-documentation/`. Historical artifacts (phase 16/17 plans, Pass B plan) are not edited; the frontend master plan gets a tracker pointer only.

---

## 11. Explicit non-goals

Authentication, user accounts, database or any persistence, proposal history, dashboards, analytics, CRM, email or file ingestion, sending proposals, acceptance handling, attachments, template or content management, discounts, generic agent chat, streaming, WebSockets, queues, a generic API layer or client-side data library, repository-wide refactors, design-system work, a human-search UI (`searchContentForHuman` stays unexposed), typed clarification questions, a `diff` pill, progress steps, rendering Markdown, a fake/demo composition root in the product, changing any backend schema or service.

---

## 12. Known risks

| Risk | Mitigation in this plan |
|---|---|
| The `"use server"` file trips `isolation.test.ts` | WP2 step 4 extends the regex with a planted row |
| jsdom cannot import `server-only` | WP4 step 2 aliases it in the jsdom project |
| A real turn takes 15–60 s with one static label | Accepted by intention (no progress representation); `maxDuration` set; documented |
| OpenAI turn shape is non-deterministic (asks or commits) | The live E2E accepts either path; the offline slice scripts both |
| Approval envelope size exceeds the framework default | `bodySizeLimit: "2mb"` |
| Replacement appends the block at the end | Backend semantics; documented as a limitation; no reorder is attempted client-side |
| `set_leaf` type mismatch on number/boolean leaves | A2 types the value; the server's message renders at the leaf otherwise |
| CI has no secrets | Offline Playwright never needs a backend result; placeholders injected by the config |
| Vercel project not on Fluid compute → `maxDuration = 120` rejected | Owner enables Fluid or lowers to 60 and accepts budget-bound failures as `failed` turns |
| zod enters the client bundle | Accepted; measured at build |
| The public demo could create real drafts | `COPILOT_LIVE_MUTATIONS` required; posture card |
| Existing offline E2E coverage of the review surface (narrow width, retained context) becomes live-only | Store/hook tests keep the logic covered; recorded as a coverage change in §15 |

---

## 13. Owner decision cards

### Card 1 — Deployment posture for the demo (decide before deploying; does not block implementation)

Decision 4 requires a live-credential deployment to be protected at the platform level, and Vercel Hobby cannot protect the production domain. Choose one:

- **A. Protected preview + mutations enabled.** Share a preview/deployment URL protected by Vercel Authentication; set `COPILOT_LIVE_MUTATIONS=enabled`. Full flow demonstrable, but every viewer needs Vercel access (Hobby allows one external user).
- **B. Public production + mutations disabled (recommended default).** Production URL public; `COPILOT_LIVE_MUTATIONS=disabled`; the reviewer sees preparation, clarification, review, edit and revision; approval returns "Draft creation is disabled on this deployment." The owner demonstrates creation live from a local run or a protected preview. AI and catalog-read spend on the public URL is an accepted exposure under this option.
- **C. Upgrade to Pro** and protect production; mutations enabled.

The implementation is identical under all three; only environment values differ. If unanswered, the implementer sets nothing on Vercel and documents B as the default posture.

### Resolved without a card (recorded so they are not re-derived)

- **Offline E2E strategy.** Rejected: a dev-only fake composition root selected by an env switch (product-side test scaffolding, the owner's decision-21 precedent, module-level state in serverless code). Adopted: the offline vertical slice in Vitest jsdom through the real actions and services with mocked default deps; one offline Playwright row over the real transport (validation rejection); the full critical flow as an opt-in live Playwright spec, matching the existing live-suite architecture.
- **Composer meaning after a proposition** → revision (B1), grounded in the existing hint text and §12A.15.
- **Approval intent shape** → intent-only; the transport composes the envelope (A1).
- **`replace_block`** → client intent mapped to the backend's two-op edit.
- **Exposure mechanism** → one required server-only variable, gating approval only.

---

## 14. Exit gate

The sprint is complete when every row holds on one tree, stamped in §15 with the SHA:

1. `client/fixtures/turns.temporary-fixture.ts` and `types/temporary-turn.ts` do not exist; no production path imports a fixture (T-RET-1, T-RET-2).
2. A brief entered in the browser reaches `prepareFromBrief` through `prepareTurnAction` (T-INT-1/2; T-E2E-1 proves the transport; T-E2E-2 proves it live).
3. Clarification round-trips (T-INT-1).
4. A real proposition renders through the unchanged presentation components (T-INT-2; component diff empty except A1/A2/B1).
5. Human correction reaches `editProposition` and renders the server's value (T-INT-3).
6. Approval is explicit: one intent, one dispatch, submit-once (existing R1.7/R6.3 over real shapes; T-INT-6).
7. Execution creates or recovers exactly one draft per backend semantics (T-INT-6, T-INT-7b).
8. Created renders the backend-returned uuid and editor URL verbatim (T-INT-7).
9. Applied Pricing renders from read-back only, unavailable carries no amount (T-INT-8).
10. Session isolation holds (R1.1, R2.x unchanged).
11. Stale turns cannot mutate the wrong session (R1.4–R1.6 unchanged).
12. No privileged module in the client graph (T-RET-4, `isolation.test.ts`, `npm run build`).
13. No persistence introduced (T-RET-3).
14. `npm test` green.
15. `npm run test:e2e` green offline; T-E2E-2 green for the owner under `LIVE_SMOKE=1` (date and uuid recorded).
16. `npm run typecheck` green.
17. `npm run lint` green.
18. `npm run build` green.
19. `*.live.test.ts` and `*.live.spec.ts` are collected only by the live config / live project.
20. Feature README and root README describe verified behaviour; no "planned seam" wording remains; links resolve.

---

## 15. Sprint log

*(append-only; the implementer fills this in — gate check, tree-vs-plan differences adopted, per-WP checkpoint SHAs, component changes with classification, tests amended and why, dependencies added (expected: none), live-run records, stamp)*

### 15.1 Gate check (WP1, 2026-09-07)

| Gate | Result |
|---|---|
| Branch | `proposal-copilot-integration` ✓ |
| `git status --porcelain` | **not empty**: one untracked file, `build_docs/under_constroction/frontend_core/prompts/implementer/sprint-integration-backend-frontend.md` — the implementer prompt for this session. No source file, no tracked modification. Proceeded and recorded rather than stopping: the gate's subject is the source tree. |
| `npm test` | green — 107 files, 837 tests, at `1160eb8` |
| `server/actions.ts` | does not exist ✓ |
| §1 inventory | resolves; differences below |

### 15.2 Tree-vs-plan differences adopted (WP1)

**D1 — absence-capable leaves infer as `unknown`, not as a union (material; affects §5 and WP3).**
`schemas/shared.ts` `sourcedOrAbsent()` ends in `as z.ZodTypeAny`, which erases the leaf's type. So on `Proposition`, every leaf that may be absent — `title`, `language`, `descriptionNarrative`, `agentRationale`, `emptyDraftConfirmation`, `block.{description,quantity,optional,reviewerComment}`, `recipient.value.*`, `commercialNote.{amount,currency}` — infers as `unknown`. Leaves that are always present keep their types (`block.title` is `Sourced<string,"proposales_content">`, likewise `block.contentId`, `alternative.reason`, `commercialNote.{text,taxBasis}`, `commercialAssumption.statedValue`, `warning.text`, `assumption.note`).

The plan's WP3 step 5 anticipated only the always-present case (`sourcedToLeaf`). Adopted: `client/view-models/leaf.ts` adds `readLeaf(value: unknown)`, which narrows to `{ known: true; value; source; ref? } | { known: false }` and throws on any other shape — the value was already validated by the server's own schema, so a third shape is a programming error (contract 06 §3). The leaf types are composed from `PropositionSource` and `Ref`, both exported by `schemas/shared.ts`, so no schema shape is hand-copied (05 §8). Schemas are not edited.

**D2 — `commercialNoteSchema` carries a `currency` leaf** that §1.2 does not list. Not rendered in V1; the note's `amount` is a `Money`, which carries its own currency. Added to §5's "deliberately not rendered" set.

**D3 — everything else in §1.1 and §1.2 resolves as written.** Verified directly: the five service signatures and their strict input schemas; `approveProposition(input: { envelope: unknown })`; `domainResultSchema`'s five members with `questions` and `draft` (not `clarification`/`draftResult`); `approvalResultSchemaFor` with no conversation; `editOperationSchema` with no `replace_block`; `apply-edits.ts` materializing the recipient at `["recipient","value",key]` and appending `add_block`; `LIBRARY_PRICING_STATEMENT_ID`/`_TEXT` exported from `schemas/approval.ts`; `test/isolation-scan.ts` `SERVER_ONLY_FIRST` admitting no directive; the jsdom vitest project carrying no `server-only` alias; `serverEnvSchema` at seven names; `next.config.ts` at `devIndicators` only.

### 15.3 WP2 — thin validated server boundary

`src/lib/errors/action-result.ts` (+test) · `server/actions.ts` (+test) · `src/lib/env/server.ts` (+test) · `.env.example` · `test/setup/node.ts` (+test) · `test/isolation-scan.ts` · `test/isolation.test.ts` · `next.config.ts`. `npm test` 852 green (837 + 15), typecheck and lint green.

Adopted while implementing:

- **T-BOUND-1 needs no injected deps.** The plan's parenthetical ("use the real `prepareFromBrief` with a fake deps object") assumes the action can be given deps; it cannot, and giving it that seam would put a test affordance on a public endpoint. The row's intent is met exactly as written otherwise: the action is called with malformed input, the real service's strict schema is the one that rejects it, and no client is constructed because `default-deps` builds every collaborator through a getter and parsing fails first. Added **T-BOUND-1b** (an unknown key is rejected) so "strict" is proven, not assumed.
- **One spy layer instead of two mock strategies.** `vi.mock("./index")` spreads `importOriginal()` and wraps each service in `vi.fn(actual.…)`. Rows that assert transport behaviour override an implementation; rows that assert the boundary adds no parse of its own let the real service run through the same spy. This is the plan's "mocked service module for rows a–c, the real service for row d" in one file, which is what the plan asked for.
- **T-BOUND-5 calls the services directly**, not through the actions, because the serialization property is about the service results and the fakes must be injected. `A1(a)` already proves the action returns `data` unchanged.
- **`logFailure` omits absent fields** rather than passing `undefined`. The first run showed `"reason":"[unserializable]"` in the log: the logger's redactor renders `undefined` that way, which reads as a defect. Fields are now built only when the `AppError` carries them.

Tests amended (two files, same reason): `src/lib/ai/client.test.ts` and `src/lib/ai/registry.test.ts` construct a complete server environment explicitly and so had to gain `COPILOT_LIVE_MUTATIONS: "disabled"`. Contract 11 §5 requires tests to construct configuration explicitly, so the fix belongs in them, not in a default on the schema. No assertion changed.

Planted-defect rows verified by running them: removing the exposure check reddens T-BOUND-4 (confirmed, then restored); `test/isolation.test.ts` gains a row where `"use server";` without the `server-only` import is still a violation, and one where the directive before the import is admitted.
