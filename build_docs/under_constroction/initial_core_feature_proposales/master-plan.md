# Master plan — Proposal Preparation Backend

| | |
|---|---|
| **Project** | `initial_core_feature_proposales` |
| **Feature** | Proposal Preparation Backend (product: Proposal Copilot) |
| **Owner** | David (repository owner) |
| **Intention** | [planing/proposal-preparation-backend-intention.md](planing/proposal-preparation-backend-intention.md) — `RATIFIED` 2026-09-05; ledger M1–M20 ratified (§17, §17.1); mechanism contracts §17A |
| **Evidence** | [planing/proposales-source-evidence.md](planing/proposales-source-evidence.md) |
| **Written** | 2026-09-05, implementation-planner round 1; **amended 2026-09-05, round 2** (multi-turn conversational continuity: new phase 10, phases 10–14 renumbered 11–15, `ProposalWorkflowState` naming, R13–R15, §6.9, rules 11–12, card 2, FB-2) |
| **Phases** | 15: phases 1–4 `APPROVED`, phase 5 `REVIEWING`, phases 6–15 `NOT_STARTED` (§4) |
| **Absorbs** | the project `README.md` index — its folder-table mapping and follow-up register now live in §11 of this file; `README.md` is left as a one-screen pointer (see §11) |

This is the shared skeleton every session reads: names, contracts, environment, standing rules, the tracker. It states shared truths once. It never restates product semantics — the intention owns those — and never restates a phase's tasks or criteria — the phase plan owns those.

---

## 1. Goal

Build the backend described by the intention: a server-only workflow that turns a free-form brief into a reviewable, editable, approvable **proposal proposition** assembled from the existing Proposales content library, and — on explicit human approval carrying the library-pricing acknowledgment — deterministically creates one Proposales draft, reads back the Applied Pricing, and returns the editor URL. No UI, no database, no price writes, no send. Across turns the human can refer back to what was said ("use the second one") because the caller carries a bounded conversation context beside the workflow state; the state stays the only authority (§6.9). Fifteen phases, each closing green on its own, each ≤ 8 criteria, every criterion row tracing to one of M1–M20 or a §17A contract.

Semantics: intention §1–§16, §18. Mechanisms: intention §17A. Facts: evidence doc. This file decides *how the build is organized*, nothing about *what* the product does.

## 2. Sources of truth and the fold-back rule

| Content | Artifact | Path |
|---|---|---|
| Product semantics, invariants, domain concepts, scope ladder | intention | `planing/proposal-preparation-backend-intention.md` |
| Mechanism contracts (shapes, orders, tables, named mutations) | intention §17A | same file |
| Measurement ledger M1–M20 (the trace targets) | intention §17, §17.1 | same file |
| Behavioral acceptance criteria 1–23 (product-level; distributed in §7.3) | intention §22 | same file |
| External facts: Proposales public API, AI SDK behavior | evidence doc | `planing/proposales-source-evidence.md` |
| Engineering contracts (how code is written) | `architectural_contracts/` | routed by `01-implementation-contract-guide.md` |
| Shared skeleton: naming registry, contract resolution, environment, standing rules, tracker | **this file** | `master-plan.md` |
| Phase-local goal, files, tasks, criteria, Review log | phase plan | `plans/phase-NN-*.md` |
| Session framing | prompt | `prompts/<role>/` (just-in-time, never reused stale) |
| Session reports | handoff | `handoffs/<role>/` |

**Fold-back rule.** A semantic gap or change amends the **intention** (through the coordinator; a material change re-opens the intention gate). A skeleton change (a name, a constant, an environment fact, a contract resolution) amends **this file**. A phase-local lesson amends **that phase plan** and, where the lesson is general, this file's §9. No downstream artifact is ever patched into divergence from its upstream; if a phase plan disagrees with the intention, the phase plan is wrong.

**Citation rule.** Plans cite the intention by section (`§17A.5`), ledger entries by ID (`M9`), contracts by number and section (`07 §5`), and this file by section (`master plan §6.3`). Wire names, metadata keys, and environment variable names are binding as written in §17A; every other identifier in §17A is a shape, and **this file's §6 fixes the concrete names** — parallel sessions use these names and no others.

## 3. Roles and session workflow

Roles, prompts, handoffs, the phase state machine, review protocol, and evidence scopes are the pipeline charter's (`/Users/davidloorenz/agent-skills/pipeline-charter.md`); this section instantiates them.

- **Coordinator** compiles one prompt per session into `prompts/<role>/`, consumes handoffs from `handoffs/<role>/`, updates the tracker (§4), folds lessons upstream, archives rows to `archive/plan_<n>/` at each approval gate, and lints every plan before dispatch (references resolve, counts derived, rows addressable, trace cells resolve, ≤ 8 criteria or a recorded reason).
- **Projection** (reviewer role, round 0) runs before the implementer prompt for every phase that touches a silent-failure mechanism (charter rule 6). By that rule projection is **mandatory** for phases 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 and waivable with a recorded line for phases 1 and 15. The gate self-retires after two consecutive empty ledgers.
- **Implementer** follows `implementation-executor` doctrine: gate check, read-first list, implement to the contracts, run every named mutation, one closing L4 stamp, checkpoint commit `CHECKPOINT (not approved): phase NN …` under the standing owner authorization, handoff with full write perimeter.
- **Reviewer** follows `plan-reviewer` doctrine: first review full checklist; re-reviews delta-scoped with a verified perimeter (`git diff` against the fix prompt's allowed files).
- **State machine per phase:** `NOT_STARTED → PROJECTED → PROMPT_READY → IMPLEMENTING → IMPLEMENTED → REVIEWING → CHANGES_REQUESTED (→ IMPLEMENTING) → APPROVED`. A phase starts implementation only when the previous phase is `APPROVED`. The coordinator recommends compaction at each `APPROVED`; the owner decides.
- **Commits.** Every implementation and fix cycle is checkpoint-committed the moment it reaches `IMPLEMENTED`; the phase is committed again at `APPROVED`. Checkpoints are never squashed.

## 4. Progress tracker

One row per phase. Agents update only their own row; findings go to the phase plan's Review log.

| # | Phase | Plan file | State | Date | Actor | Note |
|---|---|---|---|---|---|---|
| 1 | Repository topology and environment | `plans/phase-01-topology-and-env.md` | `APPROVED` | 2026-09-05 | coordinator | 5 criteria; 22 rows; 11 mutations; 8 files / 29 tests green at `3c136e7`. Round 1 `CHANGES_REQUESTED` (5 findings), fix round 2 resolved the 6 scoped items; F2, F4's comment half and N2 excluded by owner MVP scoping and recorded. **Approved on a coordinator re-review, not an independent session** — caveat in the phase Review log |
| 2 | Errors, logger, shared value shapes | `plans/phase-02-errors-logger-values.md` | `APPROVED` | 2026-09-05 | coordinator | Owner-authorized coordinator re-review approved checkpoint `2fc6a309`: exact three-file fix perimeter and hashes verified; 19-mutation ledger and closing evidence reconciled. Caveat: no separate independent re-review after fix round 2. |
| 3 | Proposales adapter: transport, error translation, content read | `plans/phase-03-proposales-transport-and-content.md` | `APPROVED` | 2026-09-05 | coordinator | Owner-directed coordinator closeout of checkpoint `5fd0e61`: exact three-file perimeter and round-3 handoff/mutation evidence validated; no further independent review by owner decision. Caveat: round 3 itself was not independently re-reviewed. |
| 4 | Proposales adapter: create, recovery search, read-back, Applied Pricing | `plans/phase-04-proposales-proposals.md` | `APPROVED` | 2026-09-05 | Claude | Independent delta re-review of `d937fe8` at tree `f342549`: 17-file perimeter verified, B1–B3 and S1–S8 all confirmed repaired by 18 reverted probes, N1–N3 closed; no blocking or should-fix. Notes N5 (consistent fixture no longer internally consistent) and N6 (MUT-04-3/34 cover more rows than one mutation demonstrates) carried forward; N4 stays with phase 15. L4 `npm test` 12 files / 163 tests green. |
| 5 | Proposition schema and structural provenance | `plans/phase-05-proposition-and-provenance.md` | `REVIEWING` | 2026-09-06 | Codex | First independent review queued against checkpoint `32435e5`; 8 criteria / 61 rows / 21 mutations. |
| 6 | Information items, clarification, workflow state, identity | `plans/phase-06-items-clarification-state.md` | `NOT_STARTED` | 2026-09-05 | planner | 8 criteria |
| 7 | Content ranking domain and human search | `plans/phase-07-ranking-and-human-search.md` | `NOT_STARTED` | 2026-09-05 | planner | 7 criteria |
| 8 | AI provider boundary (`@/lib/ai`) | `plans/phase-08-ai-provider-boundary.md` | `NOT_STARTED` | 2026-09-05 | planner | 6 criteria |
| 9 | Agent runtime: tool definition, run loop, budgets, read tools | `plans/phase-09-agent-runtime.md` | `NOT_STARTED` | 2026-09-05 | planner | 6 criteria |
| 10 | Conversation context, retrieval record, agent message assembly | `plans/phase-10-conversation-context.md` | `NOT_STARTED` | 2026-09-05 | planner | 6 criteria; **new (round 2)**; gate: FB-2 folded |
| 11 | Prepare from brief and clarification turns | `plans/phase-11-prepare-and-clarify.md` | `NOT_STARTED` | 2026-09-05 | planner | 8 criteria |
| 12 | Manual edits, human search, agent revision, cross-turn references | `plans/phase-12-edit-and-revise.md` | `NOT_STARTED` | 2026-09-05 | planner | 8 criteria |
| 13 | Approval validation, envelope, diff, terminality | `plans/phase-13-approval-validation.md` | `NOT_STARTED` | 2026-09-05 | planner | 7 criteria |
| 14 | Execution: recovery, create, read-back, result | `plans/phase-14-execution.md` | `NOT_STARTED` | 2026-09-05 | planner | 8 criteria |
| 15 | Whole-workflow proof, isolation scans, opt-in live suites, documentation closeout | `plans/phase-15-closeout.md` | `NOT_STARTED` | 2026-09-05 | planner | 5 criteria |

Criteria total: 103; rows: 542; named mutations: 139 — derived from the phase acceptance tables on 2026-09-05 after the Phase-5 projection fold: 5 + 7 + 6 + 8 + 8 + 8 + 7 + 6 + 6 + 6 + 8 + 8 + 7 + 8 + 5 criteria; 22 + 52 + 44 + 80 + 61 + 45 + 28 + 26 + 22 + 25 + 28 + 33 + 26 + 32 + 18 rows; 11 + 19 + 9 + 35 + 21 + 5 + 3 + 4 + 4 + 5 + 7 + 4 + 4 + 4 + 4 mutations. A criterion is a distinct `C<n>` in a phase table; each table line is one row unless its ID explicitly spans letters. Re-derive after any plan amendment; never edit these numbers by hand.

**Coordinator note (projection fold, 2026-09-05):** the prior summary `102 / 477 / 71` was not reproducible from the phase tables even before that fold: the fifteen declared phase headers summed to `102 / 483 / 79`. At the projection fold, the re-derivation reported the actual table rows and named mutation identifiers after phase 2 grew by 12 rows and 8 mutations, phase 15 grew by 2 rows and 2 mutations, and phase 2 gained one criterion. The summary above is the current re-derivation after the Phase-4 review fold. Historical handoffs remain records of the counts their sessions saw and are not rewritten.

**Coordinator note (dispatch lint, 2026-09-05):** the round-2 handoff §2 states 101 criteria / 467 rows / 69 mutations and attributes them to this section. That is the **pre-fold** count: the handoff body was written before the owner answered cards 1 and 2, and its §7 addendum added phase 3 C6, phase 5 C1(e) and the phase 12 rows without re-deriving §2. **The numbers in this table are the current ones**; the handoff §2 line is stale and is not corrected there, because a handoff is a record of what a session saw. Re-derive before any count-bearing gate.

## 5. Contract resolution

Selection protocol run against `architectural_contracts/01-implementation-contract-guide.md` §4–§5, §9, §10 scenario A. Task class: a new server-only agent feature with a Proposales mutation behind human approval, no UI, no persistence. Implementing sessions re-emit this list before coding and add anything a phase's concern touches that this list missed, saying so in the Review log.

| Contract | Status | Why |
|---|---|---|
| `02-runtime-boundaries.md` | **selected** | every module is server-only; env access; serverless turn model (§9) |
| `03-feature-architecture.md` | **selected** | feature folder, `src/lib/` placement, dependency direction, lint table (§4) |
| `04-server-architecture.md` | **selected** | services with DI-by-parameter (§4), domain rules (§5), error taxonomy (§6), idempotency (§8), deterministic mutation (§9) |
| `06-data-contracts-and-validation.md` | **selected** | every boundary parses; strict vs strip; money, ids, enums, timestamps (§6); wire vs domain (§7); validation errors as data (§8) |
| `07-integrations.md` | **selected** | Proposales client layout (§1), retries/timeouts (§5), configuration ownership and the fake (§6), the AI provider as an integration (§8), README (§10) |
| `08-agent-architecture.md` | **selected** | tool contract and kinds (§3), consequential fields (§4), clarification (§5), HITL lifecycle (§6), prompts (§7), provider independence (§8), budgets (§9), observability (§10) |
| `09-database-and-persistence.md` | **selected, confirms absence** | §1 no application database; §13 model never reaches storage. No persistence is introduced; the contract constrains nothing further |
| `10-security-and-trust-boundaries.md` | **selected** | trust table, secrets, input validation (§4), approval boundary (§5), injection (§6), logging (§7), tool inputs (§8), least capability (§9), upstream-URL origin validation (§10), dependencies (§11) |
| `11-testing-principles.md` | **selected** | layers (§2–§3), agent tests and evals (§4), rules (§5) |
| `12-anti-patterns.md` | **selected** | sections: runtime boundary, server, data and validation, integrations, agents, structure |
| `13-decision-checklist.md` | **selected** | §1, §3, §4, §5 (cited by section: question numbers moved when the frontend questions were added, and the contract now requires section citations) |
| `14-documentation-principles.md` | **selected** | closeout question (§8); feature README (§6); integration READMEs (§9); root README environment table (§10.5) |
| `05-client-architecture.md` | **excluded** | no UI, no component, no hook, no Server Action is built |

**Added beyond intention §2.2:** none. The re-derived list equals §2.2.

**Local resolutions** (where a contract's default shape is specialized or a MUST is satisfied by a stated construction; each is a decision this file owns):

| # | Contract point | Resolution |
|---|---|---|
| R1 | 08 §6 `PreparedAction.provenance` as a side-map `Record<fieldPath, …>` | Specialized by intention §17A.4: provenance is structural (inside each leaf). The flat `Record`-shaped projection exists for display only (`projectProvenance`). Inventory report §6.2 records this as a specialization the contract invites, not a conflict. |
| R2 | 08 §2 lists `src/lib/agent/approval.ts` (generic `PreparedAction` / `ApprovedAction` / `ExecutionResult`) | **Not created in v1.** The feature's `schemas/approval.ts` and `schemas/draft-result.ts` are the specialization; a feature-agnostic envelope helper is extracted when a second feature needs one (03 §3: "move it when the second consumer appears"). |
| R3 | 04 §2–§3 transport (Route Handler / Server Action) | **No transport in v1.** Intention §16.2: services with plain arguments are the primary interface; an HTTP surface would expose the execution path unprotected in a deployment with no authentication. Manual exercise happens through the opt-in live suites (phase 15). Adding a transport is a later, separate change. |
| R4 | 07 §8 names `generate`, `generateStructured`, `stream` on the AI boundary | The v1 interface exposes one operation, `generateStep` (§6.4), because the run loop needs one step primitive (tool calls or a final structured output) and no streaming exists without a UI. No dead methods (charter rule 4). |
| R5 | 06 §3 `.strict()` SHOULD be used on inbound mutation payloads | Used on the workflow state, the approval envelope, the edits input, and the clarification answers (§17A.3). **Also used on the outbound create-request schema** (§17A.5): strictness on our own outbound wire schema is what makes the price keys unrepresentable rather than merely unwritten. Stated reason for the extension: the guard must fail at parse, not at review. |
| R6 | 06 §6 Money row's parenthetical example (package-split values as decimals) | Does not fire in v1: every money field on the read-back is integer cents (evidence §6, §8.1, §8.3); `package_split[].vat` is a rate and is never converted (§17A.12). Follow-up 3 (§11) patches the contract example in its own change. |
| R7 | 02 §7 lint boundary rule "MUST be added when the app is scaffolded" | The scaffold omitted it (`eslint.config.mjs` carries only `eslint-config-next`). Phase 1 adds the `no-restricted-imports` and `process.env` rules from 03 §4's table, because phase 1 creates the first server-only modules those rules protect. Existing code is not refactored. **Tested, not merely added (review round 1, F1): a lint rule with no automated regression row is added once, not kept — phase 1 C3(c)/C3(d) are that guard. Every later phase tempted to widen the `process.env` exception list must redden C3(c) to do it.** |
| R8 | 02 §3 `server-only` on every authority module | The package is not installed (verified 2026-09-05). Phase 1 installs it and aliases it to a stub for the Vitest node project (§10.4). |
| R9 | 04 §6 taxonomy vs intention §15.2 row 2 (model output invalid → `validation_error` **and** the run ends `failed`) | The run loop returns a `failed` run result with `failure.reason = "model_output_invalid"` and issue paths; the turn service returns the domain result `failed` (never throws). The `validation_error` code is carried as `failure.code` so a future transport maps it to 400 without re-deciding. Budget exhaustion is the same shape with `failure.reason = "budget_exhausted"` (§17A.13, §17A.14). |
| R10 | 03 §4 `src/lib/` never imports from `features/` | The Proposales client's create operation therefore accepts a **lib-owned** input type (`CreateProposalDraftInput`, §6.4) and knows nothing about propositions. The feature maps `ApprovedProposal → CreateProposalDraftInput` in `server/domain/to-create-draft-input.ts`; the lib mapper maps input → wire. Two seams, each with its own omission mutation (§6.5 and §17A.5). |
| R11 | 10 §10 upstream URL validated against the expected origin | The editor origin is **deployment configuration** `PROPOSALES_EDITOR_ORIGIN` (§6.2), not a code constant: the origin is not established in the evidence doc (§20-class fact), and a configured value keeps an unverified vendor constant out of code. Phase 15's live smoke records the observed origin in the evidence doc (capture task). |
| R12 | 03 §3 "a module goes to `src/lib/` only when at least two features need it or it wraps an external system" | `src/lib/values/` (Path, KnownOrAbsent, Money, ISO timestamp, UUID) has two consumers from day one: the Proposales adapter and the feature. It is not a utilities pile: five files, one shape each. |
| R13 | 08 §9 (turns return a serializable state), 09 §1 (transient work lives in browser/application state), 12 anti-patterns ("storing every LLM conversation … by default" prohibited), 06 §7 (our representation, never the provider's message shape) | **Multi-turn conversational continuity is a second caller-held object, `ConversationContext`**, owned by the feature (`schemas/conversation.ts`), held by the caller for the page's lifetime, round-tripped like the state, parsed strictly and bounded on every turn, never persisted, never logged in body. It carries human instructions and application-rendered assistant summaries — no tool-call history, no raw model messages. The AI SDK's message types never leave `src/lib/ai`; every run's messages are rebuilt from the context by `buildPreparationMessages`, so the provider is never the session layer. Phase 9's runtime is unchanged: it receives `initialMessages` and knows nothing about turns. Details §6.9; owner decision recorded in §12 (FB-2). |
| R14 | §17A.4 (`proposales_content` = "taken from a content item returned by a read tool") and §17A.8 (retrieval per run) applied to revision | The run's **retrieval record is seeded from the current proposition** (every block's `contentId` and every alternative) and extended by this run's tool results. Without the seed a revision that keeps the current blocks would have to re-search each of them before the validator accepted its own output. The seed is the same rule with an honest starting set: everything in it was returned by a read tool in this workflow. A reference to anything else still requires a `get_content`/`search_content` read in this run (phase 12 C7(c)). |
| R15 | naming: §17A.3 "the caller-held workflow state" (a shape; names are this file's) | The type and schema are named **`ProposalWorkflowState` / `proposalWorkflowStateSchema`** (`parseProposalWorkflowState`), not `WorkflowState`. Reason, not aesthetics: from round 2 the caller holds two typed objects side by side, and the forward principle (§6.9) adds more; an unqualified `WorkflowState` would be the one name that cannot say which workflow. The file stays `schemas/workflow-state.ts` (already inside the feature folder), and `MAX_WORKFLOW_STATE_BYTES` / `workflow_state_too_large` stay (a reason code is wire-stable). |
| R16 | 06 §6 identifier branding | v1 UUID schemas and domain types remain unbranded strings. Reason: this MVP has one UUID kind in its first two phases, while the concrete proposal, generation, and turn identifiers are not yet separate domains; introducing brands now would add casts at seams without preventing a demonstrated mix-up. A second concurrent UUID kind triggers a recorded reconsideration before its schema is added. |

**Conflicts found:** none between contracts, or between the intention and a contract MUST. One contract inaccuracy (R6) is already on the follow-up register. **Round 2:** no contract contradicts a caller-held conversation context (08 §9, 09 §1, 05 §74 and the 12 anti-pattern row all describe exactly this: transient, minimized, never stored by default). The intention is **silent** on natural-language continuity — a gap, not a contradiction — routed as FB-2 (§12). One latent gap in the ratified provenance rule was exposed by the same work and is owner card 2 (§12).

## 6. Shared skeleton and naming registry

Every identifier below is fixed. A session that needs a name not listed here adds it **to this section** (via the coordinator) before using it, so parallel sessions cannot diverge. Naming rules: 13 §8 (kebab-case files, camelCase functions, `…Schema` / inferred type pairs, `Input`/`Dto`/`Request`/`Response` suffixes, snake_case tool names, SCREAMING_SNAKE env). Booleans are prefixed `is`/`has`/`can` except where §17A fixes a wire or shape name (`known`, `available`, `acknowledged`, `truncated`, `newlyCreated`, `optional`, `quantity_editable` are §17A/vendor names and stay).

### 6.1 Module map (files that exist when phase 15 is approved)

```
src/lib/env/server.ts                       import "server-only"; serverEnv (§6.2)
src/lib/errors/app-error.ts                 AppError + the nine subclasses of 04 §6; ErrorCode
src/lib/errors/error-dto.ts                 errorDtoSchema / ErrorDto; toErrorDto(error)
src/lib/logger.ts                           createLogger(options), the structured redacting logger factory; no singleton until a real consumer needs one
src/lib/values/path.ts                      pathSchema / Path = string[]
src/lib/values/absence.ts                   knownOrAbsentSchema(inner) / KnownOrAbsent<T>
src/lib/values/money.ts                     moneySchema / Money; currencyCodeSchema
src/lib/values/timestamp.ts                 isoTimestampSchema; formatIsoTimestamp(date)
src/lib/values/uuid.ts                      uuidV4Schema; UUID_V4_PATTERN
src/lib/proposales/{index,client,http,schemas,mappers,applied-pricing.mapper,errors,fake}.ts, fixtures/*.json, README.md
src/lib/ai/{index,client,registry,config,errors,scripted,types}.ts, README.md
src/lib/agent/{define-tool,run,types}.ts
src/features/proposal-preparation/
  schemas/{shared,information-items,clarification,content-candidate,proposition,agent-output,edits,workflow-state,conversation,approval,draft-result,turn-result}.ts
  server/domain/{information-registry,approvability,resolve-language,strength,rank-candidates,validate-agent-output,assemble-proposition,merge-revision,apply-edits,approval-diff,provenance-projection,validate-approval,to-create-draft-input,bump-version,conversation,retrieval-record}.ts
  server/tools/{search-content.tool,get-content.tool}.ts
  server/agent/preparation.agent.ts
  server/agent/build-messages.ts              labeledBlock, buildPreparationMessages — the only message assembler (phase 10)
  server/agent/prompts/{preparation-system-prompt.v1,revision-system-prompt.v1}.ts
  server/services/{prepare-from-brief,answer-clarification,revise-proposition,edit-proposition,search-content-for-human,approve-proposition,execute-approved-proposal}.ts
  server/index.ts
  fixtures/{catalog,briefs,scripts,conversations,propositions}.ts
  README.md
test/stubs/server-only.ts                   empty module aliased for the Vitest node project
test/setup/node.ts                          placeholder env + offline fetch guard (§10.4)
test/helpers/proposales-arithmetic-scan.ts  TypeScript-AST test helper for phase-4 no-arithmetic proof
vitest.config.mts                           two projects (§10.3)
vitest.live.config.mts                      opt-in live suites (phase 15)
e2e/                                        unchanged
```

Every file under `src/lib/env`, `src/lib/proposales`, `src/lib/ai`, `src/lib/agent`, and `src/features/proposal-preparation/server` begins with `import "server-only";`. Files under `schemas/`, `src/lib/values/`, `src/lib/errors/error-dto.ts` are runtime-neutral. Tests sit beside their source as `<name>.test.ts`; live suites as `<name>.live.test.ts`.

### 6.2 Environment (binding names, §17A.15; contract 02 §8)

| Variable | Kind | Schema | Notes |
|---|---|---|---|
| `PROPOSALES_API_KEY` | server-only secret | `z.string().min(1)` | existing |
| `PROPOSALES_COMPANY_ID` | server-only configuration | `z.coerce.number().int().positive()` | existing; coercion allowed at the env boundary (06 §3) |
| `PROPOSALES_EDITOR_ORIGIN` | server-only configuration | `https:` URL whose `origin` equals the whole value (no path, query, fragment) | new (R11); the origin Draft Reference `editorUrl` must match (§17A.3) |
| `AI_PROVIDER` | server-only configuration | `z.enum(["anthropic", "openai"])` | new; `gateway` is not a member (§17A.15) |
| `AI_MODEL` | server-only configuration | `z.string().min(1)` | new; a vendor model id, resolved only through `src/lib/ai/registry.ts` |
| `ANTHROPIC_API_KEY` | server-only secret | `z.string().min(1).optional()` | new; **required** when `AI_PROVIDER = anthropic` (schema refinement, issue path `["ANTHROPIC_API_KEY"]`) |
| `OPENAI_API_KEY` | server-only secret | `z.string().min(1).optional()` | new; required when `AI_PROVIDER = openai` |

**No defaults, no fallbacks** on any variable. The schema is parsed once at module load in `src/lib/env/server.ts`; failure throws an `Error` whose message lists the **names** of the failing variables, never values. `.env.example` lists all seven with empty values and one comment each; the root README environment table (14 §10.5) is patched in phase 1. The Proposales base URL `https://api.proposales.com` is a constant in `src/lib/proposales/http.ts` (evidence §1), not configuration.

**Test placeholders** (`test/setup/node.ts`, applied unconditionally before any `@/lib/env/server` import) — **all seven schema names, none omitted**: `PROPOSALES_API_KEY=test-placeholder-not-a-key`, `PROPOSALES_COMPANY_ID=1`, `PROPOSALES_EDITOR_ORIGIN=https://proposales.test`, `AI_PROVIDER=anthropic`, `AI_MODEL=test-placeholder-model`, `ANTHROPIC_API_KEY=test-placeholder-not-a-key`, `OPENAI_API_KEY=test-placeholder-not-a-key`. **Corrected in review round 1 (F3): this list named six, and the omitted `OPENAI_API_KEY` left a real vendor credential reachable inside the suite from any shell or CI job that exports it. The list is binding — every key of `serverEnvSchema.shape` appears here, and phase 1 C4(d) asserts it.** Tests asserting env behavior construct their own `process.env` snapshot and call `parseServerEnv(raw)` directly; they never rely on the module-level singleton.

### 6.3 Error codes, reasons, and result states

**Taxonomy** (04 §6, unchanged): `validation_error` 400 · `unauthenticated` 401 · `forbidden` 403 · `not_found` 404 · `conflict` 409 · `approval_required` 409 · `integration_error` 502 · `rate_limited` 429 · `internal_error` 500. Classes `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `ApprovalRequiredError`, `IntegrationError`, `RateLimitedError`, `InternalError`; `ProposalesError extends IntegrationError`; `AiProviderError extends IntegrationError`. `ErrorDto = { code, message, details? }`; `cause` is never serialized.

**`details.reason` registries** (closed string unions; §17A.13):

| Registry | Members | Defining module / phase |
|---|---|---|
| `ProposalesFailureReason` | `transport`, `timeout`, `bad_request`, `unauthenticated_upstream`, `forbidden_upstream`, `not_found_upstream`, `conflict_upstream`, `rate_limited_upstream`, `server_error`, `invalid_body`, `schema_mismatch` (11 members; `details.system = "proposales"`, `details.status` when an HTTP status exists, `details.retryable` per the §17A.13 table, `details.operation` = the client method name) | `src/lib/proposales/errors.ts` / phase 3 |
| `AiProviderFailureReason` | `unauthenticated_upstream`, `timeout`, `rate_limited_upstream`, `server_error`, `transport`, `content_filtered`, `not_configured` (7 members; `details.system = "ai_provider"`, message always generic) | `src/lib/ai/errors.ts` / phase 8 |
| `ValidationReason` (optional `details.reason` on `ValidationError`) | `model_output_invalid`, `workflow_state_too_large`, `unknown_question_id`, `pricing_acknowledgment_missing`, `required_to_create_unresolved`, `consequential_provenance_invalid`, `domain_rule` | `src/lib/errors/app-error.ts` / phase 2 |
| `ConflictReason` | `draft_already_exists` (terminal state), `multiple_recovery_matches` | `src/lib/errors/app-error.ts` / phase 2 |
| `AppliedPricingUnavailableReason` | `read_failed_upstream`, `read_failed_timeout`, `read_failed_schema_mismatch`, `read_budget_exhausted` | `src/features/proposal-preparation/schemas/draft-result.ts` / phase 14 |
| `RunFailureReason` | `budget_exhausted` (with `budget: "wall_time" \| "tool_calls" \| "tokens"`), `model_output_invalid` (with `issues: Array<{ path: Path }>`), `tool_output_invalid` (a tool's `execute` returned a value failing its own `output` schema; 08 §3), `script_exhausted` (fake only, test aid) | `src/lib/agent/types.ts` / phase 9 |

**Domain result states** (`TurnResult.result.status`): `clarification`, `proposition`, `failed`, `created`, `recovered` — five (§17A.13). `failed` carries `failure: { reason: RunFailureReason, code: "validation_error" | "internal_error", … }` (R9).

**Warning kinds** (`proposition.warnings[i].kind`, closed): `weak_match`, `non_strong_selection`, `no_acceptable_match`, `conflicting_brief_statements`, `uncovered_scope`, `currency_mismatch`, `human_value_kept`, `human_value_overridden`, `catalog_language_missing`, `other`.

### 6.4 Schemas, types, and their fields

Type names are the inferred pair of each schema (`xSchema` / `X`). Sources: `PropositionSource = "brief" | "proposales_content" | "human" | "inferred"`. Three source policies (§17A.4) are realized by three schema builders in `schemas/shared.ts`:

| Builder | Union members on `source` | `ref` |
|---|---|---|
| `consequentialSchema(inner, sources)` | a subset of `brief \| proposales_content \| human` given per leaf (never `inferred`; the builder's type forbids it) | `refSchema` |
| `catalogVerbatimSchema(inner)` | `proposales_content` only | `ref.variationId` required |
| `presentationalSchema(inner)` | `brief \| proposales_content \| human \| inferred` | `refSchema` |

`refSchema = { variationId?: string, questionId?: string, editTurn?: number, turnId?: uuidV4, quote?: string(max MAX_QUOTE_CHARS) }` remains unrefined so its content member may extend it. The `human` source member refines `turnId ⇒ quote` at `ref.quote`; the `proposales_content` member is `refSchema.extend({ variationId: z.string() })`. `sourcedOrAbsent(leafSchema)` is a discriminated union whose known arm is made by extending each member of the leaf's `source` union with `known: z.literal(true)`, plus `{ known: false }`; it is not made by spreading a schema. It shares `knownOrAbsentSchema`'s required discriminator convention but does **not** wrap it: `knownOrAbsentSchema(leafSchema)` would introduce an unwanted nested `value`. The `known` key is required in both variants.

`propositionSourceSchema`, `boundedText`, `positiveFiniteNumberSchema`, and `positiveInt64StringSchema` are exported by `schemas/shared.ts`. `warningSchema` is exported by `schemas/proposition.ts`; `matchStrengthSchema` by `schemas/content-candidate.ts`. `bareWarningValue` is a private implementation detail of `warningSchema`, not a public contract.

| Schema (file) | Shape (fields that matter; every free-text field trimmed and capped by §6.5) |
|---|---|
| `pathSchema` (`lib/values/path.ts`) | `string[]`, each segment non-empty; array indices as decimal strings |
| `knownOrAbsentSchema(inner)` (`lib/values/absence.ts`) | `{ known: true, value: T } \| { known: false }` |
| `moneySchema` (`lib/values/money.ts`) | `{ amountMinor: int, currency: /^[A-Z]{3}$/ }` |
| `positiveInt64StringSchema` (`schemas/shared.ts`) | canonical decimal string from `1` through `9223372036854775807`; no sign, decimal point, whitespace, or leading zero |
| `isoTimestampSchema` | string matching `YYYY-MM-DDTHH:mm:ss.sssZ` exactly (UTC, millisecond precision) |
| `uuidV4Schema` | `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/` |
| `informationItemKeySchema` (`information-items.ts`) | enum: `language`, `title`, `block_selection`, `sold_scope`, `recipient_identity`, `quantities`, `recipient_contact_detail`, `description_narrative`, `block_comments`, `deadline_and_terms_notes` (10 members, §17A.6) |
| `informationItemStateSchema` | `{ askPolicy: "ask_if_underivable" \| "do_not_ask", createPolicy: "required_to_create" \| "not_required", resolution: "supplied" \| "unresolved" \| "deferred_by_user" }` |
| `clarificationQuestionSchema` (`clarification.ts`) | `{ questionId: uuidV4, itemKey, text }`; `clarificationSchema = { questions: array max MAX_CLARIFICATION_QUESTIONS }` |
| `clarificationAnswerSchema` | `{ questionId, answer: { kind: "answer", text } \| { kind: "skip" } }`; `clarificationAnswersInputSchema = { answers: array }.strict()` |
| `contentCandidateSchema` (`content-candidate.ts`) | `{ variationId: string, productId: string, title: string, description: string, truncated: boolean, score: int 0–1000, matchStrength: "weak" \| "possible" \| "strong", reason: string }` |
| `matchStrengthSchema` (`content-candidate.ts`) | `z.enum(["weak", "possible", "strong"])` |
| `recipientLeavesSchema` (`proposition.ts`) | `firstName`, `lastName`, `email`, `phone`, `companyName`: each `sourcedOrAbsent(consequential(string, [brief, human]))`; `email` value additionally `z.email()` |
| `blockSchema` | `{ contentId: consequential(positiveInt64String, [proposales_content, human]) with ref.variationId required, productId: string, title: catalogVerbatim(string), description: sourcedOrAbsent(catalogVerbatim(string)), quantity: sourcedOrAbsent(consequential(positiveFiniteNumber, [brief, human])), optional: sourcedOrAbsent(consequential(boolean, [brief, human])), reviewerComment: sourcedOrAbsent(presentational(string)), pricing: z.literal("library"), alternatives: array(max MAX_ALTERNATIVES_PER_BLOCK) of { variationId, productId, title, matchStrength, score, reason: presentational(string) } }` — **no price, total, currency, or tax field; the object is strict** (criterion 20) |
| `commercialNoteSchema` | `{ text: presentational(string), amount: sourcedOrAbsent(consequential(money, [brief, human])), currency: sourcedOrAbsent(consequential(currencyCode, [brief, human])), taxBasis: consequential("including_tax" \| "excluding_tax" \| "unstated", [brief, human]) }` |
| `commercialAssumptionSchema` | discriminated on `kind`: `deadline` / `term` / `scope_commitment` → `statedValue: consequential(string, [brief, human])`; `other` → `statedValue: presentational(string)` |
| `warningSchema` (`proposition.ts`) | strict `{ kind, text: presentational(boundedText(MAX_WARNING_CHARS)), path?: pathSchema, before?: bareWarningValue, after?: bareWarningValue, reason?: boundedText(MAX_RATIONALE_CHARS) }`; a bare warning value has no own `source` key, so a sourced leaf object is prohibited |
| `propositionSchema` | `{ generationId: uuidV4, version: int ≥ 1, preparedAt: isoTimestamp, language: sourcedOrAbsent(presentational(languageCode)), title: sourcedOrAbsent(presentational(string)), descriptionNarrative: sourcedOrAbsent(presentational(string)), recipient: knownOrAbsent(recipientLeaves), blocks: array(max MAX_BLOCKS), emptyDraftConfirmation: sourcedOrAbsent(consequential(z.literal(true), [human])), commercialNotes: array, commercialAssumptions: array, unresolvedItems: array of { itemKey, resolution: "unresolved" \| "deferred_by_user" }, assumptions: array of { path, note: presentational(string) }, warnings: array of warningSchema, agentRationale: sourcedOrAbsent(presentational(string)) }.strict()`. `languageCode = /^[a-z]{2}$/` (evidence §4) |
| `agentOutputSchema` (`agent-output.ts`) | the model's structured output, strict: `{ kind: "clarification", questions: array of { itemKey, text } } \| { kind: "proposition", language, title, descriptionNarrative, recipient, blocks: array of { contentId (ref.variationId required), quantity, optional, reviewerComment, alternatives: array of { variationId, reason } }, emptyDraftConfirmation?: never, commercialNotes, commercialAssumptions, assumptions, warnings (kinds other than `human_value_*` and `currency_mismatch`, which the application owns), agentRationale, requestedOverrides: array of { path, reason } (revision only; empty on prepare) }`. **Has no `matchStrength`, `score`, `title`/`description` on blocks, `version`, `preparedAt`, `pricing`, `unresolvedItems`**: the application supplies those (`assembleProposition`). `human`-sourced leaves in model output must carry `ref.questionId` of an answered question (`validateAgentOutput`) |
| `editOperationSchema` (`edits.ts`) | discriminated `op`: `set_leaf { path, value }` (value re-parsed by the leaf's schema, source forced to `human`, `ref.editTurn`) · `remove_block { index }` · `add_block { variationId, quantity?: number, optional?: boolean }` (candidate must come from a `searchContentForHuman` result carried in the input as `candidate: ContentCandidate`) · `unset_recipient {}` · `confirm_empty_draft {}`; `editPropositionInputSchema = { state, edits: array min 1 }.strict()` |
| `draftReferenceSchema` (`workflow-state.ts`) | `{ proposalUuid: uuidV4, editorUrl: https URL with origin === serverEnv.PROPOSALES_EDITOR_ORIGIN }` — the origin is injected as a parameter of the schema factory `proposalWorkflowStateSchemaFor(editorOrigin)` so the schema file stays runtime-neutral |
| `proposalWorkflowStateSchema` | `{ generationId: uuidV4, brief: { text, receivedAt: isoTimestamp }, items: Record<ItemKey, InformationItemState> (all 10 keys required), clarification?: { questions, answers: array }, preparedProposition?: Proposition, currentProposition?: Proposition, draftReference?: DraftReference }.strict()`; byte size ≤ `MAX_WORKFLOW_STATE_BYTES` checked before parse (`validation_error`, reason `workflow_state_too_large`) |
| `pricingAcknowledgmentSchema` (`approval.ts`) | `{ acknowledged: z.literal(true), statement: z.literal(LIBRARY_PRICING_STATEMENT_ID) }` |
| `conversationTurnSchema` (`conversation.ts`) | discriminated on `role`: `{ role: "human", turnId: uuidV4, at: isoTimestamp, text: string ≤ MAX_TURN_TEXT_CHARS }` \| `{ role: "assistant", turnId, at, kind: "clarification" \| "proposition" \| "failed", text, propositionVersion?: int ≥ 1 }` — `propositionVersion` required iff `kind = "proposition"`; both variants strict. Human turns are the free-text instructions the human sent; assistant turns are **application-rendered** summaries (`renderAssistantTurn`), never model-authored text |
| `conversationContextSchema` | `{ turns: array max MAX_CONVERSATION_TURNS, omittedTurns: int ≥ 0 }.strict()`; absent on input means `emptyConversation()`. Runtime-neutral; caller-held; never inside `ProposalWorkflowState` (§6.9) |
| `approvalEnvelopeSchema` | `{ state: ProposalWorkflowState, proposition: Proposition, pricingAcknowledgment }.strict()` — a `conversation` key is an unknown key (phase 13 C7(c)) |
| `approvedProposalSchema` | `{ generationId, proposition, pricingAcknowledgment, approvedAt: isoTimestamp, diff: ApprovalDiff }` — produced only by `validateApproval`; `executeApprovedProposal` re-parses it |
| `approvalDiffSchema` | `Array<{ path: Path, before: unknown, after: unknown }>` sorted by path |
| `appliedPricingSchema` (`draft-result.ts`) | `{ available: true, totalWithoutTax: Money, totalWithTax: Money, currency: currencyCode, taxOptions: { mode?: string, taxIncluded?: boolean, taxLabelKey?: string }, blocks: Array<{ contentId: string, quantity: number, optional?: boolean, blockCurrency?: string, unitValueWithDiscountWithoutTax: Money, unitValueWithDiscountWithTax: Money, unitValueWithoutDiscountWithoutTax: Money, unitValueWithoutDiscountWithTax: Money, packageSplit?: Array<{ type: string, vat?: number, valueWithoutTax?: Money, valueWithTax?: Money }> }>, warnings: Array<{ kind: "block_currency_differs", contentId }> } \| { available: false, reason: AppliedPricingUnavailableReason, status?: int }` — its available arm mirrors the lib-owned `AppliedPricing` below; omitted `optional`/`packageSplit` mean Proposales did not report those display-only fields, never `false`/`[]` |
| `draftResultSchema` | `{ proposalUuid, editorUrl, newlyCreated: boolean, seriesUuid?: string, status?: string \| "unknown", appliedPricing, notices: Array<{ kind: "inline_recipient_may_duplicate_contact" }> }` |
| `runReportSchema` (`turn-result.ts`) | `{ provider: "anthropic" \| "openai" \| "scripted", model: string, usage: { inputTokens: int \| null, outputTokens: int \| null, totalTokens: int \| null } }` |
| `turnResultSchema` | `{ state: ProposalWorkflowState, conversation: ConversationContext, result: DomainResult, run?: RunReport }` where `DomainResult` is the five-state union of §6.3. `conversation` is present on every turn service's result (prepare, answer, revise append the assistant turn; edit echoes the inbound); approval/execution results carry the state only (their input has no conversation) |

**Lib-owned Proposales domain types** (`src/lib/proposales/index.ts`; never `*Request`/`*Response` outside the module):

| Type | Shape |
|---|---|
| `ContentItem` | `{ variationId: string, productId: string, title: Record<lang, string>, description: Record<lang, string>, createdAt: isoTimestamp, images?: string[] }` |
| `CreateProposalDraftInput` | `{ language, titleMd?: string, descriptionMd?: string, recipient: KnownOrAbsent<{ firstName?, lastName?, email?, phone?, companyName? }>, blocks: Array<{ contentId: string, quantity: KnownOrAbsent<number>, optional: KnownOrAbsent<boolean> }>, generationId: string }` — the client attaches `company_id` and the three metadata keys itself |
| `CreatedDraft` | `{ proposalUuid, url: string }` (url validated as absolute https; origin check is the feature's) |
| `RecoveredProposalSummary` | `{ proposalUuid, seriesUuid?, status?: string, url, generationId }` — an absent/null vendor status is omitted; an unrecognised non-null vendor status maps to the display-only literal `"unknown"` |
| `ProposalReadback` | the parsed, mapped `GET /v3/proposals/{uuid}` subset the Applied Pricing mapper consumes (§17A.12 "In"), plus `seriesUuid?`, `status?`; same absent-versus-unknown status rule as `RecoveredProposalSummary` |
| `AppliedPricing` | the lib-owned, `available: true` arm mirrored by `appliedPricingSchema`: `{ available: true, totalWithoutTax: Money, totalWithTax: Money, currency: currencyCode, taxOptions: { mode?, taxIncluded?, taxLabelKey? }, blocks: Array<{ contentId: string, quantity: number, optional?: boolean, blockCurrency?: string, unitValueWithDiscountWithoutTax: Money, unitValueWithDiscountWithTax: Money, unitValueWithoutDiscountWithoutTax: Money, unitValueWithoutDiscountWithTax: Money, packageSplit?: Array<{ type: string, vat?, valueWithoutTax?: Money, valueWithTax?: Money }> }>, warnings: Array<{ kind: "block_currency_differs", contentId: string }> }` — all money is strict; omitted optional flag or package split remains absent |
| `CompanyInfo` | `{ companyId: number, currency: currencyCode, taxMode: string }` — from `GET /v3/companies`, the entry whose id is the configured company (card 1 → A; phase 3) |
| `ProposalesClient` (interface) | `getCompany(): Promise<CompanyInfo>` · `listContent(): Promise<ContentItem[]>` · `getContent(variationId): Promise<ContentItem \| null>` · `createProposalDraft(input): Promise<CreatedDraft>` · `findProposalsByGenerationId(generationId): Promise<RecoveredProposalSummary[]>` · `getProposal(uuid): Promise<ProposalReadback>` |

**AI and agent types** (`src/lib/ai/types.ts`, `src/lib/agent/types.ts`):

| Type | Shape |
|---|---|
| `AiProvider` | `"anthropic" \| "openai"` (mirrors the env enum) |
| `LanguageModelInstance` | `Exclude<import("ai").LanguageModel, string>` — the SDK's `LanguageModel` type **includes** the string id (`GlobalProviderModelId`, verified in `ai@7.0.92`); this alias is what every internal signature accepts (§17A.15's "the SDK's language-model type", corrected) |
| `AiClient` | `{ provider: AiProvider \| "scripted", model: string, generateStep(input: GenerateStepInput, options: { timeoutMs: number }): Promise<GenerateStepResult> }` |
| `GenerateStepInput` | `{ system: string, messages: AgentMessage[], tools: ToolDescriptor[], outputJsonSchema?: JsonSchema }` |
| `GenerateStepResult` | `{ kind: "tool_calls", calls: Array<{ toolCallId, name, input: unknown }>, usage } \| { kind: "final", output: unknown, usage }`; `usage: { inputTokens: int \| null, outputTokens: int \| null, totalTokens: int \| null }` |
| `ToolKind` | `"read" \| "prepare" \| "mutate"` (only `read` is instantiated in v1) |
| `ToolDefinition<I, O>` | from `defineTool({ name, description, kind, input: ZodSchema, output: ZodSchema, execute(input, ctx) })` |
| `ToolContext` | `{ runId: string, traceId: string, companyId: number, remainingBudget: RunBudgets, catalog: ContentItem[], language: string \| null }` |
| `RunBudgets` | `{ wallTimeMs: int, maxToolCalls: int, maxTokens: int }` |
| `RunResult<O>` | `{ status: "output", output: O, usage, toolCalls: RecordedToolCall[] } \| { status: "failed", failure: { reason: RunFailureReason, budget?, issues? }, usage, toolCalls }` |
| `RunDeps` | `{ ai: AiClient, now: () => number (monotonic ms), logger }` |
| `RetrievalRecord` (`server/domain/retrieval-record.ts`) | `{ candidates: ReadonlyMap<variationId, { variationId, productId, title, matchStrength, score }> }` — the identities the model may reference in this run: `seedRetrievalRecord(currentProposition)` ∪ every tool result (R14). Not a schema (server-internal, never serialized) |

### 6.5 Named constants (one module each; criteria assert the contract, never the literal — charter rule 13)

| Constant | Module | Initial value | Contract asserted |
|---|---|---|---|
| `MAX_BRIEF_CHARS` | `schemas/shared.ts` | 8000 | positive int; brief over it fails parse |
| `MAX_TITLE_CHARS`, `MAX_NARRATIVE_CHARS`, `MAX_COMMENT_CHARS`, `MAX_ALTERNATIVE_REASON_CHARS`, `MAX_NOTE_TEXT_CHARS`, `MAX_QUESTION_CHARS`, `MAX_ANSWER_CHARS`, `MAX_RATIONALE_CHARS`, `MAX_WARNING_CHARS`, `MAX_ASSUMPTION_CHARS`, `MAX_QUOTE_CHARS`, `MAX_INSTRUCTION_CHARS` | `schemas/shared.ts` | 200 / 6000 / 500 / 1000 / 500 / 300 / 2000 / 1000 / 500 / 300 / 300 / 2000 | each positive int; the field trims and rejects above cap (§17A.16) |
| `MAX_BLOCKS` | `schemas/proposition.ts` | 30 | positive int |
| `MAX_CLARIFICATION_QUESTIONS` | `schemas/clarification.ts` | 5 | positive int (§17A.7) |
| `MAX_CONVERSATION_TURNS` | `schemas/conversation.ts` | 12 | positive even int ≥ 4; the window keeps the newest turns; `appendTurns` drops the oldest beyond it and counts them in `omittedTurns` |
| `MAX_TURN_TEXT_CHARS` | `schemas/conversation.ts` | 3000 | positive int ≥ `MAX_INSTRUCTION_CHARS` (a human turn is an instruction verbatim); `renderAssistantTurn` cuts to it with a marker |
| `MAX_WORKFLOW_STATE_BYTES` | `schemas/workflow-state.ts` | 262144 | positive int; > a state containing MAX_BRIEF_CHARS + MAX_BLOCKS blocks with MAX_ALTERNATIVES_PER_BLOCK alternatives (§17A.3) |
| `MAX_CANDIDATES` | `server/domain/rank-candidates.ts` | 10 | positive int; fixture catalog length > it (§17A.8) |
| `MAX_ALTERNATIVES_PER_BLOCK` | `schemas/proposition.ts` | 3 | positive int |
| `MAX_CANDIDATE_DESCRIPTION_CHARS` | `server/domain/rank-candidates.ts` | 280 | positive int; truncation sets `truncated: true` |
| `SCORE_MAX` | `server/domain/strength.ts` | 1000 | scores are ints in `[0, SCORE_MAX]` |
| `T_STRONG`, `T_POSSIBLE`, `T_FLOOR` | `server/domain/strength.ts` | 700 / 400 / 150 | `0 < T_FLOOR < T_POSSIBLE < T_STRONG ≤ SCORE_MAX`; half-open intervals (§17A.8) |
| `LIBRARY_PRICING_STATEMENT_ID` | `schemas/approval.ts` | `"library-pricing-v1"` | the literal the envelope must carry (§17A.10) |
| `LIBRARY_PRICING_STATEMENT_TEXT` | `schemas/approval.ts` | the human-readable wording | changing the wording changes the id |
| `PROPOSAL_METADATA_KEYS` | `lib/proposales/mappers.ts` | `{ source: "proposal_copilot_source", generationId: "proposal_copilot_generation_id", createdAt: "proposal_copilot_created_at" }` | **binding wire names and property names** (§17A.11) |
| `PROPOSAL_COPILOT_SOURCE_MARKER` | `lib/proposales/mappers.ts` | `"proposal-copilot"` | binding |
| `PROPOSAL_SEARCH_LIMIT` | `lib/proposales/client.ts` | 25 | equals the documented maximum (evidence §5) |
| `PROPOSALES_BASE_URL` | `lib/proposales/http.ts` | `https://api.proposales.com` | evidence §1 |
| `PROPOSALES_TIMEOUT_MS` | `lib/proposales/http.ts` | 10000 | positive int |
| `PROPOSALES_READ_MAX_ATTEMPTS`, `PROPOSALES_READ_BACKOFF_MS`, `PROPOSALES_READ_TOTAL_MS` | `lib/proposales/http.ts` | 3 / 300 / 8000 | attempts ≥ 1; an overall read deadline: every attempt's abort timeout is `min(PROPOSALES_TIMEOUT_MS, remaining total)` and no retry starts after the deadline (§17A.12 read-back bounds) |
| `MAX_UPSTREAM_MESSAGE_CHARS`, `MAX_UPSTREAM_ISSUES`, `GENERIC_UPSTREAM_ERROR_MESSAGE` | `lib/proposales/errors.ts` | 500 / 25 / `"The Proposales request could not be completed."` | a forwarded upstream message or issue message is used only when ≤ the message cap; at most `MAX_UPSTREAM_ISSUES` issues cross; every other upstream text uses the exported generic message (§17A.13) |
| `DEFAULT_RUN_BUDGETS` | `lib/ai/config.ts` | `{ wallTimeMs: 60000, maxToolCalls: 12, maxTokens: 60000 }` | each positive int (§17A.14) |
| `AI_CALL_TIMEOUT_MS` | `lib/ai/config.ts` | 45000 | ≤ `wallTimeMs`; passed per call |
| `MAX_OUTPUT_RETRIES` | `lib/agent/run.ts` | 1 | int ≥ 0; bounded model retry on invalid structured output |

### 6.6 Services, domain functions, tools (signatures)

All services: `(input, deps = defaultDeps): Promise<TurnResult | …>`; `deps` by parameter with defaults (04 §4). Every service that emits a proposition computes `version` from the inbound state (`bumpVersion`) and `preparedAt` from `deps.now()`.

| Function | File | Signature |
|---|---|---|
| `prepareFromBrief` | `services/prepare-from-brief.ts` | `({ brief: string, state?: unknown, conversation?: unknown }, deps: { proposales, ai, now, newGenerationId, newQuestionId, newTurnId, logger }) → TurnResult` (`clarification` / `proposition` / `failed`); appends one assistant turn |
| `answerClarification` | `services/answer-clarification.ts` | `({ state: unknown, answers: unknown, conversation?: unknown }, deps) → TurnResult` (`proposition` / `failed`; never `clarification`); appends one assistant turn; answers are never a human turn (§8.2) |
| `reviseProposition` | `services/revise-proposition.ts` | `({ state: unknown, instruction: string, conversation?: unknown }, deps) → TurnResult`; `instruction` is **the latest human turn** — passed separately, rendered as the final `current_instruction` block, appended to the returned conversation together with the assistant turn |
| `editProposition` | `services/edit-proposition.ts` | `({ state: unknown, edits: unknown, conversation?: unknown }, deps: { now }) → TurnResult` (`proposition`; no model, no Proposales; conversation echoed unchanged) |
| `searchContentForHuman` | `services/search-content-for-human.ts` | `({ query: string, language: string }, deps: { proposales }) → { candidates: ContentCandidate[] }` (no model, no state) |
| `approveProposition` | `services/approve-proposition.ts` | `({ envelope: unknown }, deps: { proposales, ai: AiClient (must never be called), now, logger }) → TurnResult` (`created` / `recovered`; throws `AppError`) — calls `validateApproval` then `executeApprovedProposal` |
| `executeApprovedProposal` | `services/execute-approved-proposal.ts` | `(approved: unknown, deps) → { result: DomainResult(created \| recovered), draftReference }`; refuses anything that fails `approvedProposalSchema` with `ApprovalRequiredError` |
| `validateApproval` | `domain/validate-approval.ts` | `(envelope: unknown, ctx: { editorOrigin, now }) → { approved: ApprovedProposal } \| throws` — checks 1–5 of §17A.13 in order |
| `computeApprovalDiff` | `domain/approval-diff.ts` | `(prepared: Proposition, current: Proposition) → ApprovalDiff` |
| `rankCandidates` | `domain/rank-candidates.ts` | `(query: string, catalog: ContentItem[], language: string) → ContentCandidate[]` — pure |
| `scoreItem` / `strengthForScore` | `domain/strength.ts` | `(query, item, language) → int` / `(score: int) → MatchStrength \| null` |
| `resolveLanguage` | `domain/resolve-language.ts` | `(candidate: string \| null, catalogLanguages: string[]) → { kind: "resolved", language } \| { kind: "ask" }` |
| `evaluateApprovability` | `domain/approvability.ts` | `(items) → { approvable: true } \| { approvable: false, itemKeys }` |
| `applyAnswers` | `domain/information-registry.ts` | `(items, questions, answers) → items'` |
| `INFORMATION_REGISTRY` | `domain/information-registry.ts` | the 10-row policy table (§17A.6) |
| `validateAgentOutput` | `domain/validate-agent-output.ts` | `(raw: unknown, ctx: { retrieval: RetrievalRecord, answeredQuestionIds, currentTurn?: { turnId, text } }) → AgentOutput \| { invalid: issues }` — `human` refs resolve to an answered question (prepare), an existing human leaf, or the current turn by `turnId` + verbatim `quote` (revise) |
| `assembleProposition` | `domain/assemble-proposition.ts` | `(output, ctx: { generationId, version, preparedAt, retrieval, items, companyCurrency }) → Proposition` — adds the application-owned warnings (`non_strong_selection`, `no_acceptable_match`, `currency_mismatch`) |
| `mergeRevision` | `domain/merge-revision.ts` | `(current: Proposition, proposed: Proposition, overrides) → { merged, warnings }` — pure, per leaf |
| `applyEdits` | `domain/apply-edits.ts` | `(current, edits, editTurn) → Proposition \| throws ValidationError` |
| `projectProvenance` | `domain/provenance-projection.ts` | `(p: Proposition) → Array<{ path, source, ref? }>` sorted segment-wise by path, decimal index segments numerically; it projects only declared sourced leaves (including `warnings[].text`) and never descends into `warnings[].before` / `.after` |
| `toCreateDraftInput` | `domain/to-create-draft-input.ts` | `(approved: ApprovedProposal) → CreateProposalDraftInput` |
| `runPreparationAgent` | `agent/preparation.agent.ts` | `({ mode: "prepare" \| "revise", brief, state, conversation: ConversationContext, instruction?, catalog, language, answeredQuestions }, deps) → { run: RunResult<AgentOutput>, retrieval: RetrievalRecord }` — messages from `buildPreparationMessages`; retrieval seeded from `state.currentProposition` (R14) |
| `emptyConversation` / `appendTurns` / `humanTurn` / `assistantTurn` | `domain/conversation.ts` | `() → ConversationContext` · `(ctx, turns: ConversationTurn[]) → ConversationContext` (pure; FIFO window, `omittedTurns` counted) · constructors |
| `renderAssistantTurn` | `domain/conversation.ts` | `(result: DomainResult, proposition?: Proposition) → string` — deterministic; ids, catalog-verbatim titles, enum kinds, the rationale; never warning/assumption free text; cut to `MAX_TURN_TEXT_CHARS` |
| `emptyRetrievalRecord` / `seedRetrievalRecord` / `extendRetrievalRecord` / `hasRetrieved` | `domain/retrieval-record.ts` | pure (R14) |
| `labeledBlock` / `buildPreparationMessages` | `agent/build-messages.ts` | `(name, text) → string` · `({ brief, catalogLanguages, language, answers?, currentProposition?, conversation, instruction? }) → AgentMessage[]` — fixed block order `brief · catalog_languages · clarification_answers · current_proposition · conversation_history · current_instruction` (present only when given; the instruction always last; nothing goes to `system`) |
| `searchContentTool` | `tools/search-content.tool.ts` | name `search_content`, kind `read`, input `{ query: string(1..200) }`, output `{ candidates }` |
| `getContentTool` | `tools/get-content.tool.ts` | name `get_content`, kind `read`, input `{ variationId: string }`, output `{ item \| null }` |
| `createFakeProposalesClient` | `lib/proposales/fake.ts` | `({ catalog?, company?, proposals?, proposalReadbacks?, proposalReadback?, editorOrigin?, now?, newUuid? }) → FakeProposalesClient`; `now: () => number` and `newUuid: () => string` are injectable, `proposalReadback` supplies a newly-created draft's read-back, `proposals` seeds recovery rows, and `proposalReadbacks` seeds their read-backs by proposal UUID. It exposes `calls` (a create call is exactly `{ op: "createProposalDraft", input, request }`), `writes`, `stored`, `storedReadbacks: Map<uuid, ProposalReadback>`, `failNext(op, error)`, and `assertNoWrites()`. `input` is omitted for no-argument reads. |
| `createScriptedAiClient` | `lib/ai/scripted.ts` | `(steps: GenerateStepResult[]) → AiClient & { calls: GenerateStepInput[] }`; throws `script_exhausted` past the end |
| `createFailingAiClient` | `lib/ai/scripted.ts` | `() → AiClient` whose `generateStep` throws `new Error("model must not be called")` |
| `createAiClient` | `lib/ai/client.ts` | `(env = serverEnv) → AiClient` via `registry.ts` |
| `run` | `lib/agent/run.ts` | `({ system, initialMessages, tools, outputSchema, budgets }, deps: RunDeps) → RunResult` |

### 6.7 Fixtures and doubles

| Fixture | Location | Rule |
|---|---|---|
| `FIXTURE_CATALOG` | `features/proposal-preparation/fixtures/catalog.ts` | `length > MAX_CANDIDATES`, asserted inside every test that uses it for a bound (§17A.8); items localized in `en` and `sv`; at least one item lacking `sv`; deterministic ids |
| Proposales wire fixtures | `src/lib/proposales/fixtures/*.json` | shaped from `api-documentation/proposales/openapi.json` and evidence §8 read-backs; scrubbed; one `proposal-readback.inconsistent.json` whose totals ≠ Σ units×quantity (§17A.12) |
| Scripted model steps | `features/proposal-preparation/fixtures/scripts.ts` | named step sequences per scenario (`clarifyRecipient`, `proposeStrong`, `keepCallingTools`, …) |
| Briefs | `features/proposal-preparation/fixtures/briefs.ts` | named briefs per scenario; none contains real personal data |
| Conversations | `features/proposal-preparation/fixtures/conversations.ts` | `conversationWith(n)`, `fullConversation()` (exactly `MAX_CONVERSATION_TURNS`); deterministic ids and timestamps |
| Propositions | `features/proposal-preparation/fixtures/propositions.ts` | phase 5: `validProposition(overrides?)`, `leafInferred(descriptor)`, `CONSEQUENTIAL_LEAF_DESCRIPTORS`; phase 10: `propositionWithAlternatives()` (block `A` with alternatives `[B, C]`, block `D`; ids from `FIXTURE_CATALOG`), `maximalConformingProposition()` |

### 6.8 Naming rules the repository implies

- Every `Sourced` leaf field is a noun (`quantity`), never `quantitySource`; the source lives inside the leaf.
- Predicates: `is…` / `has…` / `can…`; state-machine members are snake_case string literals.
- Constants SCREAMING_SNAKE, one per line, exported from the module that owns the rule.
- Test names state the contract, not the literal: `"strength is strong at exactly T_STRONG"`, never `"700 is strong"`.
- Named mutations are recorded in the Review log as `MUT-<phase>-<n>: <file> · <definition|call site> · <change> → <test id> red`.

### 6.9 The two caller-held objects, and the forward principle

```
Browser page lifetime (caller; nothing survives a reload — by design; contract 05 §5.2 makes the future UI say so)
│
├── ProposalWorkflowState        authoritative: generation id, brief, items, clarification round,
│                                prepared/current proposition (with structural provenance), draft reference
│
└── ConversationContext          linguistic: prior human instructions + application-rendered assistant
                                 summaries; bounded window; context for "this / that / the second one"
```

Per turn: `ConversationContext + ProposalWorkflowState + latest human input → service → buildPreparationMessages → run() (phase 9) → structured output → validateAgentOutput (against the retrieval record) → domain → new ProposalWorkflowState`, and the service appends this turn's human and assistant turns to the context it returns.

Rules that keep the split honest:

- **The conversation is context, never authority.** Once a reference is resolved and validated, the fact lives in the state with provenance (`blocks[0].contentId = C, source proposales_content`). No later step — merge, edit, approval, execution — reads the transcript to rediscover it. Approval and execution have no conversation parameter at all (phase 13 C7(c)).
- **Prior conversation is never a provenance source.** The admissible sources are unchanged (§17A.4). A reference resolves to an id in the retrieval record (R14). A *value* stated in the **current** instruction may become a `human` leaf only with `ref: { turnId, quote }`, checked by the validator against that turn and visible to the reviewer (card 2 → A, 2026-09-05); history can never do this.
- **The latest human turn travels separately** (`instruction`), never inside the inbound context; the service appends it after the run. This is what makes "what the human just asked" distinguishable from "what was said before" in every prompt.
- **Assistant turns are rendered by the application**, from validated results, so the transcript can only name ids that were actually presented.
- **Bounded, strict, ephemeral.** Turn cap and text cap at the schema; oldest turns dropped and counted; no storage, no log bodies (08 §10), no signature (§17A.3's reasoning applies).
- **Phase 9 stays generic.** `run()` receives `initialMessages`; turns, sessions, and propositions are the caller's concern.

**Forward principle (not built now).** A later page may hold several typed domain states side by side — this feature's `ProposalWorkflowState`, and one day an `EmailResearchState`, `WebResearchState`, `CustomerContextState` — each owned by its own feature schema, each producing validated structured findings that another capability consumes as labeled input. They stay separate typed objects; nothing is folded into a global untyped state, and no generic conversation service, session store, or persistence layer is introduced for them. This paragraph exists so that no session "helpfully" generalizes the two objects above into that.

## 7. Sequencing, gates, and coverage

### 7.1 Order and true dependencies

Linear dispatch order 1 → 15 (charter: a phase starts only on the previous `APPROVED`). True dependency edges, so the coordinator can judge a reorder request:

```
1 ─▶ 2 ─▶ 3 ─▶ 4 ─┐
     2 ─▶ 5 ─▶ 6 ─┼─▶ 7 ─▶ 9 ─▶ 10 ─▶ 11 ─▶ 12 ─▶ 13 ─▶ 14 ─▶ 15
     1 ─▶ 8 ──────┘         (8 is needed by 9; 10 is pure and needs only 5, 6, 8's types)
```

Phase 4 (Proposales proposal operations) is needed only from phase 13 onward; phase 8 (AI boundary) only from phase 9. The linear order front-loads the two integration adapters so that every feature phase runs against complete fakes.

### 7.2 Ledger coverage — which phase serves each entry

Every M1–M20 is served by at least one criterion row (derived from the phase trace cells; zero gaps). Regenerate this table after any plan amendment.

| Ledger | Served by (phase.criterion) — derived from the trace cells |
|---|---|
| M1 | 5.C2, 5.C5, 11.C7, 11.C8, 13.C4 |
| M2 | 6.C2, 11.C2, 11.C3, 11.C5, 13.C4 |
| M3 | 3.C4, 4.C3, 9.C2, 11.C8, 12.C8 |
| M4 | 7.C7, 12.C1, 12.C2, 12.C3, 13.C7, 14.C3 |
| M5 | 3.C3, 4.C3, 13.C7, 14.C3, 14.C4 |
| M6 | 3.C1, 3.C2, 8.C4, 9.C5, 14.C1, 14.C2, 14.C6, 14.C7, 14.C8, 15.C4 |
| M7 | 1.C4, 8.C5, 15.C1, 15.C2, 15.C3, 15.C5 |
| M8 | 2.C6, 4.C3, 6.C6, 6.C8, 11.C1, 13.C1, 13.C2, 14.C1, 14.C5, 15.C1 |
| M9 | 2.C4, 4.C1, 4.C2, 5.C1, 6.C5, 14.C3 |
| M10 | 5.C2, 5.C3, 5.C4, 11.C8, 12.C5, 12.C7 |
| M11 | 12.C1, 12.C3, 12.C4, 12.C5 |
| M12 | 7.C1, 7.C2, 7.C3, 7.C6 |
| M13 | 2.C5, 4.C6, 4.C7, 4.C8, 14.C6, 14.C7, 14.C8 |
| M14 | 4.C3, 4.C4, 4.C5, 14.C1, 14.C2 |
| M15 | 8.C5, 9.C3, 9.C4, 11.C2, 11.C6, 12.C7, 12.C8 |
| M16 | 1.C1, 8.C1, 8.C2, 8.C3, 15.C2 |
| M17 | 1.C2, 6.C5, 6.C6, 6.C7 |
| M18 | 6.C3, 11.C3 |
| M19 | 10.C3, 10.C5, 12.C7, 15.C1 |
| M20 | 2.C3 |

### 7.3 Intention §22 criteria — where each is sharpened into rows

| §22 | Owning phase rows — derived from the trace cells | Note |
|---|---|---|
| 1 | 11.C2, 11.C3 |  |
| 2 | 5.C2 |  |
| 3 | 9.C2, 11.C8 |  |
| 4 | 7.C7, 12.C2, 14.C3 |  |
| 5 | 12.C3 |  |
| 6 | 13.C4, 13.C7 |  |
| 7 | 14.C3 |  |
| 8 | 14.C2 |  |
| 9 | 3.C1, 8.C4 |  |
| 10 | 15.C1 |  |
| 11 | 14.C8 |  |
| 12 | 1.C4, 15.C2, 15.C3, 15.C4, 15.C5 | 1.C4 offline, 15.C3–C4 opt-in live, 15.C5 exclusion |
| 13 | 7.C5, 11.C5, 15.C3 | 15.C3 is the model half (opt-in) |
| 14 | 8.C5, 9.C4 |  |
| 15 | 6.C2, 12.C2, 13.C4 |  |
| 16 | 4.C2 |  |
| 17 | 13.C3 |  |
| 18 | 4.C6, 14.C6 |  |
| 19 | 14.C7 |  |
| 20 | 5.C5 |  |
| 21 | 13.C1, 13.C2, 15.C1 |  |
| 22 | 4.C1, 5.C2, 14.C3 |  |
| 23 | 5.C5, 11.C5, 11.C7, 15.C3 | 5.C5(c) no block currency and 5.C5(f) note-currency form · 11.C5(c) language structural half · 11.C7 currency warning (card 1 → A) · 15.C3 eval half |

### 7.4 Things no criterion is written for (by contract)

- §15.2 "second execution detected within one turn" — no reachable path in v1 (§17A.13, §23 round 6 ii).
- §8.3 `derived` provenance — absent from the v1 schema (§17A.4, §23 round 6 iii).
- Documented third-party behavior (Zod stripping, `fetch` semantics, the AI SDK's own retry) — the seam is tested, never the dependency.

## 8. Tool protocols

- **Archgraph:** not present in this repository. Skipped silently by every session.
- **Per-session start:** gate check (intention status, tracker row state, previous phase `APPROVED`), read-first list, `git status --porcelain` recorded.
- **Per-session end:** named mutations run and recorded; one closing L4 stamp (`npm test`) on the handed-over tree with `git rev-parse HEAD` + `git status --porcelain` (or `git diff | shasum` when dirty); typecheck and lint green; checkpoint commit; handoff with the full write perimeter (documents, code, `package.json`/lockfile, config files).

## 9. Standing rules

The charter's 17 quality rules apply verbatim. Project-specific rules, each earned from this project's artifacts.

### 9.0 The owner's scope brief (standing, stated 2026-09-05; binds every review and every fix round)

**Verbatim, because paraphrase is how a scope brief drifts:**

> "my objective here is to present this application as an mvp ( it will probably won't
> event be used at all on production, so it won't be persistent over time ) it needs to
> be senior build but not as a full scale app."

**How to apply it.** This calibrates the *quantity* of hardening, never the *correctness*
of what ships, and it has a sharp edge that is easy to get wrong in both directions:

- **Still in scope, always.** Anything that is wrong rather than merely unguarded. Any
  path by which a real credential or a vendor error body escapes — the owner works with
  live Proposales and AI keys during development, so those are present-tense risks, not
  future ones. Anything a reader evaluating the build would see first: the root README,
  the shape of the tests, whether a guard can actually fail. **If the objective is to
  *present* this application, build quality is the deliverable.**
- **Trim here.** Exhaustive enumeration where a representative subset carries the same
  proof; regression guards whose only beneficiary is a maintainer this codebase will
  never have; criteria for surfaces this project does not build. Trim by **reducing an
  ask, not by dropping a guard** — a guard that cannot fail is not a cheaper guard, it
  is a decoration with a correct name.
- **Out of scope.** Production hardening the intention already defers (§18): auth,
  persistence, monitoring, rate limiting, retry policy beyond §17A.11's bounded read.
- **Record every exclusion where the excluded work lives**, with the reason, so a later
  session neither re-derives the argument nor quietly "fixes" it. Precedent: phase 1's
  F2 exclusion is recorded in the phase plan Notes *and* in phase 15's candidate list.

Applied at the phase-1 gate: of five review findings, three were implemented in full,
one reduced, one excluded — see `plans/phase-01-topology-and-env.md`.

### 9.0.1 Session capability (standing, owner-agreed 2026-09-05)

**A reviewer session runs on a model at least as capable as the session that implemented
the phase.** A weaker reviewer produces the ceremony of a gate without the gate — an
approval is expensive to be wrong about, because it opens the next phase and lets a
defect cross the boundary that gating exists to contain. Current split: **Codex
implements, Claude reviews** — different model families fail differently, which is worth
as much as raw capability. Review is the judgment work: whether a guard could fail,
whether a fixture has a second sufficient cause, whether a gap is real or belongs to a
later phase.

### 9.1 Project-specific rules

Each earned from this project's artifacts:

1. **Absence is a value.** `{ known: false }` is written by hand in every fixture that means "no sourced value"; a fixture with a missing key is a *different* fixture (the one that must fail). Never write `quantity: undefined` (§17A.1, §17A.5).
2. **No `??`, `||`, or default parameters on the omission path** (`toCreateDraftInput`, `toCreateProposalRequest`, the metadata assembly) and **no arithmetic operator, `Math.*`, `toFixed`, or numeric comparison** in `applied-pricing.mapper.ts`. Both are source-scanned with a planted-defect row (phases 4, 14).
3. **The model never sees an epoch integer, a secret, an env value, a URL, or a raw Proposales object.** Tool outputs are the shaped candidate DTO only. Every prompt receives labeled data blocks.
4. **Every timestamp comes from `deps.now()`**; every id from `deps.newGenerationId()` / `deps.newQuestionId()` / `deps.newTurnId()`. An inline `Date.now()` or `crypto.randomUUID()` in a service or domain file is a finding.
5. **Fakes record; they do not decide.** The fake Proposales client stores what it was sent and returns it verbatim on read-back; it never computes totals. Scripted model steps are data.
6. **A fixture that exercises a bound is larger than the bound**, and the test asserts that relation before asserting the bound (§17A.8).
7. **`human` in model output is a claim that must resolve** to an answered question id (prepare), to an existing human leaf (revise), or to the **current** instruction turn by `ref.turnId` plus a `quote` found verbatim in that turn's text (revise; card 2 → A); otherwise `model_output_invalid`. Prior turns never resolve.
8. **Tests construct configuration explicitly** (`parseServerEnv(rawObject)`) and never read `.env` (11 §5). The suite-wide placeholders exist so `server-only` modules can load, not so tests can rely on their values.
9. **Named mutations are applied on the tree and reverted**; the handoff lists every probe file. A mutation "verified by inspection" is unrun (charter manifest property 4).
10. **The closing L4 stamp is `npm test` with the tree identity**, plus `npm run typecheck` and `npm run lint`. CI additionally runs `npm run test:e2e` and `npm run build`; a phase must not break either (the e2e spec is untouched by this feature but still runs).
11. **Prior conversation is context, never a source; the conversation is never an input to approval or execution, never stored.** A `proposales_content` ref must be in the run's retrieval record (seed ∪ reads); a `human` ref must resolve per rule 7 (the current instruction turn only, by quote). The latest human turn is passed separately from history and is never in the inbound context (§6.9).
12. **Two caller-held objects, never merged.** `ProposalWorkflowState` (authority) and `ConversationContext` (context) are siblings on `TurnResult`; neither schema admits the other (phase 10 C6). A future capability adds its own typed state (§6.9 forward principle); nobody adds a global one.
13. **Checkpoint provenance is per cycle.** Before an implementer checkpoint, stage only that cycle's declared code/tests and any tracker/review-log edits it actually made; coordinator folds already present in the worktree are committed separately or named in the checkpoint handoff's full observed perimeter. A checkpoint never claims a narrower diff than it contains.
14. **A named mutation proves one named row.** When a criterion enumerates rows through a loop, its ledger supplies one mutation per row (or a mutation whose failing assertion is independently observed for each row); a single all-keys mutation that aborts at the first assertion does not prove the remaining rows.

### 9.2 Parallel frontend/backend coordination (owner direction, 2026-09-05)

The Proposal Copilot is one eventual vertical capability, developed temporarily in two
worktrees from the common checkpoint `d528ed9`: backend/domain work continues on `main`
at `/Users/davidloorenz/Desktop/Developer/Proposales`; the production frontend port
continues on `proposal-copilot-frontend` at
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`. Periodic merges of `main`
into the frontend branch replace temporary frontend seams with landed contracts; the
frontend branch ultimately merges back into `main`. These are development streams, not
separate applications or architectures.

- **Canonical feature ownership:** `src/features/proposal-preparation/` is the sole
  feature root for this capability. Later backend/domain work that is genuinely
  proposal-specific may add real files there. Do not introduce competing roots such as
  `src/features/proposals/`, `src/features/copilot/`, or `src/features/proposal-agent/`
  unless an explicit later architectural decision replaces this one.
- **No speculative topology:** the frontend stream creates folders under that feature
  only when real frontend-owned files require them; the same no-empty-folder rule binds
  all backend/domain phases (03 §1).
- **Current integration ownership stays put:** starting frontend work does not alter
  backend phase plans. In particular, Phase 4 remains `src/lib/proposales/`; reusable
  external-system and runtime infrastructure remains outside the feature where planned,
  including `src/lib/proposales/`, `src/lib/ai/`, and `src/lib/agent/` (03 §3).
- **Temporary frontend shapes are not backend contracts:** presentation View Models,
  fixtures, adapters, and page-lifetime UI runtime state exist to enable the parallel
  production port. They do not define commercial or workflow semantics; frontend code
  adapts as authoritative backend/domain contracts land.
- **Truth boundary is unchanged:** `ProposalWorkflowState` is the authoritative
  structured workflow/proposal truth; `ConversationContext` is linguistic continuity;
  frontend runtime state is presentation/page-lifetime interaction mechanics. Temporary
  VMs are a presentation boundary, never business truth.
- **Coordination threshold:** do not rewrite existing backend phase plans merely because
  this frontend stream exists. Surface an owner decision only if a later backend phase
  would conflict with this canonical ownership, the established runtime/server boundary,
  or an already implemented frontend/backend integration seam.

## 10. Environment topology (verified 2026-09-05; if reality disagrees, update this section)

### 10.1 Runtime and tools

| Item | Value |
|---|---|
| Node / npm | v22.22.3 / 10.9.8 (CI: Node 22) |
| Package manager | npm; one `package-lock.json` |
| Framework | Next.js 16.3.x App Router, React 19.2.x, TypeScript 6.0.x `strict` |
| Validation | Zod 4.5.4 (Zod 4 API: `z.strictObject`, `z.email()`, `z.url()`, `z.literal`, `z.discriminatedUnion`, `.brand()`) |
| AI SDK | `ai` 7.0.92 installed; transitive `@ai-sdk/gateway`, `@ai-sdk/provider`, `@ai-sdk/provider-utils`. **No vendor package installed.** `npm view` on 2026-09-05: `@ai-sdk/anthropic` 4.0.49, `@ai-sdk/openai` 4.0.59 (peer `zod ^3.25.76 \|\| ^4.1.8`). Phase 8 installs both and records the resolved versions in its Review log |
| `server-only` | **installed outside the pipeline 2026-09-05** (`^0.0.1`, uncommitted at the time of writing; F9 in the round-1 handoff). Phase 1 verifies and records the resolved version rather than installing (R8) |
| Test runner | Vitest 5.0.0, `environment: jsdom`, setup `vitest.setup.ts` (jest-dom + RTL cleanup), excludes `e2e/**` |
| E2E | Playwright 1.62.x, Chromium, `e2e/bootstrap.spec.ts` (2 tests), starts `npm run dev` itself |
| Lint | ESLint 9 with `eslint-config-next/core-web-vitals` only; **no boundary rules yet** (R7) |
| CI | `.github/workflows/ci.yml`: `npm ci` → playwright install → typecheck → lint → `npm test` → `npm run test:e2e` → `npm run build` on every push/PR |
| Repo state at planning | HEAD `c588a0c`; dirty tree = documentation only (intention, evidence, this project folder); no `src/lib/`, no `src/features/` |

### 10.2 Baseline (L4, tree `c588a0c` + docs-only dirty tree)

`npm test` → 5 files, 7 tests, all passing (914 ms). `npm run typecheck` → clean. `npm run lint` → clean. No pre-existing failures, no skips.

### 10.3 Vitest layout after phase 1

`vitest.config.mts` declares two projects (Vitest `test.projects`):

| Project | Include | Environment | Setup |
|---|---|---|---|
| `node` | `src/lib/**/*.test.ts`, `src/features/**/*.test.ts`, `test/setup/node.test.ts` | `node` | `test/setup/node.ts` |
| `jsdom` | `src/app/**/*.test.tsx`, `src/components/**/*.test.ts`, `src/components/**/*.test.tsx` | `jsdom` | `vitest.setup.ts` (existing) |

Both exclude `e2e/**` and `**/*.live.test.ts`. `resolve.alias` maps `@` → `src` (existing) and, in the node project, `server-only` → `test/stubs/server-only.ts` (an empty module; the real package throws on import outside a React server context). If Vitest 5 rejects inline `projects`, phase 1 falls back to `vitest.workspace.mts` and records it here. (Updated 2026-09-05 to the shape phase 1 actually shipped: inline `projects` works; the node project also claims `test/setup/node.test.ts`, and jsdom claims `src/components/**/*.test.ts` so the pre-existing component test is not dropped.)

**Known hazard — the include globs do not partition the tree** (review round 1, N2, demonstrated): a `*.test.ts(x)` outside all of them is claimed by **no** project and is silently not collected — `vitest list` reports as if the file did not exist, and the suite stays green. Every file phases 2–14 create lands inside the claimed globs, so the live risk is a stray helper test outside them. Phase 15 carries the candidate criterion asserting that every test file is claimed by exactly one project. **Until then, any session adding a test outside `src/lib/**`, `src/features/**`, `src/app/**`, `src/components/**` or `test/setup/` must confirm its file appears in `npx vitest list`.**

### 10.4 `test/setup/node.ts` (phase 1)

1. Assigns **all seven** placeholder values of §6.2 to `process.env` unconditionally (corrected from six; review round 1, F3).
2. Replaces `globalThis.fetch` with a function that throws `OfflineGuardError("network access is not allowed in the default suite")`. Adapter tests pass their own `fetch` through `deps`; nothing in the default suite may reach the real one.
3. Nothing else: no mocks of modules, no timers.

**`vitest.setup.ts` (jsdom project) installs the same `fetch` guard** (review round 1, N3). The guard's home is shared so both projects import one definition rather than two copies. Reason: §10.6 rule 1 is written absolutely, and a rule written absolutely but enforced in one project is the shape that fails silently later. Phase 1 C4(e) asserts it in the jsdom project.

### 10.5 Commands and evidence scopes

| Scope | Command |
|---|---|
| L1 (one file / test) | `npx vitest run <path> [-t "<name>"]` |
| L2 (one domain) | `npx vitest run --project node <dir>` — e.g. `src/lib/proposales`, `src/features/proposal-preparation/server/domain` |
| L3 (integration subtree) | `npx vitest run --project node src/features/proposal-preparation src/lib` |
| L4 (full suite; the closing stamp) | `npm test` (+ `npm run typecheck`, `npm run lint`) |
| Opt-in live (phase 15+) | `npm run test:live` → `vitest run --config vitest.live.config.mts`; every live test skips unless `LIVE_SMOKE=1` and the real variables are set |
| Boundary lint | `npm run lint` |

### 10.6 Safety rules

- The default suite must never reach the network (§10.4 guard); a test that needs `fetch` injects a mock.
- Live suites create real Proposales drafts. The create request's `data` is closed to exactly three keys (§17A.11), so disposability is marked in the **title only**: every live-created draft's title begins `[DISPOSABLE COPILOT SMOKE]`, and the suite prints every created uuid for owner cleanup (the follow-up 2 pattern). No live test sends, patches, or archives.
- `.env` exists locally and is git-ignored; no test reads it (rule 8).

## 11. Project index, folder tables, and follow-up register (absorbed from `README.md`)

**Naming rule for archived rows (earned 2026-09-05, at the phase-1 gate).** A prompt and
its handoff can carry the **identical** filename when both belong to the same role — as
the coordinator's `mechanism-inventory-round-1.coordinator.md` and
`implementation-planning-round-1.coordinator.md` did. They are distinguished only by
which table they sit in, and archiving flattens both tables into one directory, so a
plain `mv` silently overwrites one with the other. It did, twice, and both were
recovered from `a53a964`. **Every archived row therefore carries `.prompt.` or
`.handoff.` before the role segment**, and archiving is done with `mv -n` or an explicit
rename, never a bare `mv` of several files into one directory.

**Folder tables** (charter layout instantiated): master plan at this root (this file) · `plans/` phases · `prompts/{implementer,reviewer,coordinator,maintenance}/` live directives · `handoffs/<role>/` unconsumed reports · `archive/pre_plan/` gate rows before phase 1, `archive/plan_<n>/` created at each closeout · `planing/` the intention and evidence doc (owner-authored, not renamed) · `context/` owner-supplied context. Mechanism inventory and planning ran under the coordinator role tables. State is positional; a transition is a file move.

**Gate log:** intention `RATIFIED` round 5 (2026-09-05, §21.1); ledger extension M8–M18 ratified round 7; **FB-2 ratified round 8 (2026-09-05): §17A.17, M19, §5.2, §7, §8.3, §17A.4, §12.1 — folded, no longer proposed** · **logging/redaction M20 ratified round 10 (2026-09-05): §17A.18, §21.3 — phase 2 projection card 1 → A** · **phase-3 transport precedence and timestamp validation ratified round 12 (2026-09-05): §17A.13, §17A.16, §21.4 — projection cards 1 and 2 → A** · mechanism inventory `PASSED` round 1 (17 mechanisms, 17 contracts) · ledger extension `RATIFIED` round 7 (M8–M18, none cut) · planning round 1: this plan set (2026-09-05) · planning round 2 (2026-09-05): multi-turn continuity refactor — phase 10 inserted, 10–14 → 11–15; FB-2 raised · owner decisions (2026-09-05): card 1 → A, card 2 → A, folded into phases 3, 5, 10, 11, 12.

**Follow-up register** — none blocks any phase:

| # | Item | Owner of the action | Row | Source |
|---|---|---|---|---|
| 1 | Documentation-root patch: contract 14 §2–§4, root README, guide §7, contracts README still name `docs/`; the root is `build_docs/`. Separate change, **not a phase of this feature** (owner-accepted sequencing). | dispatchable agent session | `prompts/maintenance/documentation-root-patch.maintenance.md` | intention §20A item 2 |
| 2 | Archive the 18 disposable investigation drafts (evidence §8.5) in the Proposales UI. | owner | `prompts/maintenance/archive-investigation-drafts.maintenance.md` | intention §20A item 1 |
| 3 | Contract `06` §6 Money row example invites a decimal conversion on integer-cent package-split values (R6). Contract patch in its own change; fold into follow-up 1's session if convenient. | dispatchable agent session | *(raise a prompt row when dispatched)* | inventory handoff §6.1 |
| 5 | ~~intention amendment FB-2~~ — **CLOSED 2026-09-05.** Ratified by the owner and folded into the intention: §5.2 bullet, §7 concept row, §8.3 `human` row, §12.1 operation list, §17A.4 `ref` paragraph, new §17A.17, ledger M19, §23 round 8. Cards 1 and 2 folded with it. `(proposed)` markers cleared from §7.2 and phases 10–15. | coordinator — **done** | — | intention §23 round 8 |
| 4 | **New (planning):** intention §17A.15 phrase "the SDK's language-model type, which a `string` does not satisfy" is inaccurate against `ai@7.0.92` (`LanguageModel` includes the string id). Mechanism unchanged; the accurate phrasing is `Exclude<LanguageModel, string>` (§6.4). Editorial fold-back to the intention via the coordinator; no gate re-opens. | coordinator | — | this plan §6.4, handoff finding F1 |
| 6 | **AI model id unresolved.** `.env.example` reads `AI_MODEL=gpt-5.6-luna`; the owner stated `gpt-6.6-luna` when confirming it (2026-09-05). One is a typo; **the coordinator did not guess.** Nothing depends on it yet — phase 1 empties `.env.example`, the schema has no defaults, and the test placeholder is `test-placeholder-model`. Load-bearing from **phase 8** (provider boundary). | owner — one line | — | this section; §6.2 |
| 7 | Contract `06` §8 says Zod's `error.issues` maps directly to `string[]` paths, but Zod 4 emits numeric array indices. Patch the contract to require `issue.path.map(String)` at a DTO boundary. | dispatchable agent session | *(raise a prompt row when dispatched)* | phase-2 projection D2 |
| 8 | `tsconfig.tsbuildinfo` is tracked although `npm run typecheck` rewrites it. Decide in a dedicated repository-hygiene change whether to ignore it and remove it from the index, so routine evidence stamps do not create irrelevant dirty-tree identity drift. | dispatchable agent session | *(raise a prompt row when dispatched)* | phase-2 review N4 |
| 9 | Phase 2 intentionally validates ISO timestamp **form**, not calendar validity; phase 3's mandatory projection must assess whether its epoch mapper can produce an out-of-range `Date` and route any new refinement through the intention/plan rather than silently changing the shared value contract. | phase-3 projection | phase-3 reviewer prompt | phase-2 review N6 |

## 12. Open items handed to the coordinator

| # | Item | Effect on phases |
|---|---|---|
| Card 1 — **answered A (2026-09-05)** | The company currency is read from `GET /v3/companies` (`getCompany`, phase 3, one call per preparation or revision turn); `assembleProposition` compares it with brief- or human-stated note currencies and adds the application-owned `currency_mismatch` warning. | Phase 3 C6 added; phase 11 C7 un-held (four rows, MUT-11-7); phase 12 task 6 reads the company too. Capture task: **done 2026-09-05** — evidence doc §2's `GET /v3/companies` row now records the operation and points at §8.1 for the observed keys. |
| Card 2 — **answered A (2026-09-05)** | A consequential value the human states in the current revision instruction may be recorded as `human` with `ref: { turnId, quote }`; the validator requires the turn id of this instruction and the quote verbatim in it; prior turns never resolve. | `refSchema.turnId` (phase 5 C1(e)); `current_instruction` header carries the turn id (phase 10); phase 12 C5(d–f) un-held, MUT-12-4; rule 7 and §6.9 updated. Intention text: FB-2 addendum in the round-2 handoff §7 (§8.3 `human` row, §17A.4 ref paragraph, §17A.17 item 6). |
| FB-1 | §17A.15 phrasing (follow-up 4) | none |
| FB-2 | Intention is silent on natural-language continuity between turns; the owner decided it on 2026-09-05 (round 2). Proposed §5.2 bullet, §7 row, §17A.17, M19 in the round-2 handoff §1, plus the card-1/card-2 addendum in its §7 (§12.1 operation list, §8.3 `human` row, §17A.4 ref paragraph). | Phase 10 dispatch requires the fold (or a coordinator prompt line dispatching against the proposed text); phases 1–9 unaffected. |
| Capture tasks | Editor URL origin (R11) and the live catalog's size and language set (§20) are recorded in the evidence doc by phase 15's live smoke. | phase 15 tasks T6–T7 |
