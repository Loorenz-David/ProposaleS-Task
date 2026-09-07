---
role: implementer
project: initial_core_feature_proposales
work: submission sprint (collapsed phases 11–15), batches 3 and 4
date: 2026-09-07
author: coordinator (Claude Opus 5), handing off after batches 1 and 2
---

# Submission sprint — batches 3 and 4

You are implementing the remainder of the Proposal Copilot backend vertical slice, in the
repository at `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`.

Batches 1 and 2 are done and committed. You are starting at **batch 3**.

---

## 0. Gate check — verify by content before writing anything

1. `git status --porcelain` is empty. HEAD is **`d78d31b`** ("submission sprint batch 2").
2. `npm test` → **47 files / 571 tests** green. `npm run typecheck`, `npm run lint`,
   `npm run build` all exit 0.
3. The approved plan exists at
   `/Users/davidloorenz/.claude/plans/you-are-taking-over-flickering-avalanche.md` and its
   first section after the context is titled **"HANDOFF — batches 1 and 2 are done"**.
4. Master plan tracker row 10 reads `APPROVED`.

If any is false, stop and report which.

Note: `tsconfig.tsbuildinfo` is tracked and `npm run typecheck` rewrites it. Run
`git checkout -- tsconfig.tsbuildinfo` before staging anything.

---

## 1. What this work is, and what is different from phases 1–10

Phases 1–10 were built under a phase-gated pipeline: projection → implementation →
checkpoint → independent review → bounded correction → approval. **The owner has collapsed
phases 11–15 into one submission sprint.** Their five phase plans remain the specification;
the process around them does not.

**Waived for this sprint:** projection sessions, independent review sessions, re-reviews,
named-mutation ledgers with restoration digests, per-phase handoff documents, per-phase
approval states. Do not produce any of them. Do not claim any of phases 11–15 reached
`APPROVED`.

**Still binding, without exception:** the ratified intention, the architecture contracts,
the naming registry in master plan §6, the commercial-safety invariants, and meaningful
automated verification. Nothing below trades correctness for speed.

The plan file is the authority for scope. **Do not re-plan, do not redesign, do not
reorganize.** If the code proves an assumption in the plan wrong, amend that plan file in
one paragraph and continue.

---

## 2. Read, in this order

1. `/Users/davidloorenz/.claude/plans/you-are-taking-over-flickering-avalanche.md` — the
   whole file. Sections A, B, C, D, E, F, G, H and the HANDOFF section govern your work.
2. `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` §6.3–§6.6
   (result states, schemas, service and domain signatures, constants) and §9.1 rules 1–4, 7,
   11, 12, 15–19, 22.
3. `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-11-prepare-and-clarify.md`
   and `plans/phase-12-edit-and-revise.md` — your specification for batches 3 and 4.
   Read `plans/phase-15-closeout.md` before batch 4's closeout tasks.
4. `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`
   §17A.4, §17A.7, §17A.8, §17A.9, §17A.13, §17A.14, §17A.17, and §8.1–§8.3.
5. The modules you will compose over, before you touch them: `src/lib/agent/run.ts`,
   `src/lib/agent/types.ts`, `src/lib/ai/types.ts`, `src/lib/ai/scripted.ts`,
   `src/features/proposal-preparation/server/agent/build-messages.ts`,
   `server/domain/{conversation,retrieval-record,rank-candidates,information-registry}.ts`,
   `server/tools/*`, `schemas/{agent-output,turn-result,proposition,shared}.ts`,
   `fixtures/{catalog,scripts,propositions,states}.ts`.

---

## 3. What batches 1 and 2 left you

**Schemas** (`src/features/proposal-preparation/schemas/`): `agent-output.ts`
(`agentOutputSchemaFor({ mode, allowClarification })`, `languageDerivationOutputSchema`,
`AGENT_WARNING_KINDS`, `APPLICATION_OWNED_WARNING_KINDS`), `turn-result.ts`
(`domainResultSchema`, `turnResultSchemaFor`, `approvalResultSchemaFor`, `runReportSchema`),
`approval.ts`, `draft-result.ts`, `edits.ts`.

**Domain** (`server/domain/`): `approval-diff.ts`, `validate-approval.ts`,
`to-create-draft-input.ts`, `apply-edits.ts`, plus `deriveItemResolutions` in
`information-registry.ts`.

**Services** (`server/services/`): `execute-approved-proposal.ts`, `approve-proposition.ts`,
`edit-proposition.ts`, `default-deps.ts`, and the pre-existing `search-content-for-human.ts`.

**Reusable helpers you must not duplicate:**
- `parseConversationInput(raw)` — exported from `services/edit-proposition.ts`. Absent means
  `emptyConversation()`; malformed throws `ValidationError` with issues prefixed
  `["conversation"]`. Batch 3's services call this.
- `zodIssues` / `prefixIssues` — `@/lib/errors/zod-issues`.
- `comparePaths` / `compareSegments` — `@/lib/values/path`.
- `defaultDeps` — `services/default-deps.ts`. Every lazily-built collaborator is a getter;
  every clock and id generator is a function. **No service or domain file may call
  `Date.now()` or `crypto.randomUUID()` inline.**
- `fixtures/scripts.ts` — `finalStep`, `toolCallStep`, `languageStep`, `searchStep`,
  `getContentStep`, `keepCallingTools`, `agentPropositionOutput(overrides)`,
  `agentClarificationOutput(...)`, `usage()`. The **named per-scenario scripts do not exist
  yet** — you add them here in batch 3.

**Three decisions taken in batches 1–2. Do not reverse any of them.**

1. An approval whose state has no `preparedProposition` is refused (`domain_rule` at
   `["state","preparedProposition"]`), because the diff needs both sides.
2. A read-back whose mapper output fails `appliedPricingSchema` is reported
   `{ available: false, reason: "read_failed_schema_mismatch" }` and logged at error level,
   never thrown: losing a created draft is worse than reporting no pricing.
3. **`deriveItemResolutions` is authoritative for `supplied`.** It demotes an item the
   proposition does not supply and only preserves `deferred_by_user`. Without this, a
   hand-edited items record relaxes a required-to-create rule. It will look like it
   "over-demotes" when you first read it. It does not. Leave it.

---

## 4. Batch 3 — prepare and clarify

Build in this order. Each file gets its colocated `<name>.test.ts`.

### 4.1 `server/domain/resolve-language.ts`

`resolveLanguage(candidate: string | null, catalogLanguages: string[]) → { kind: "resolved";
language: string } | { kind: "ask" }`. Resolved when the candidate is in the set; otherwise
`ask`. Pure.

### 4.2 `server/domain/validate-agent-output.ts`

```
validateAgentOutput(raw: unknown, ctx: {
  schema: ReturnType<typeof agentOutputSchemaFor>,
  retrieval: RetrievalRecord,
  answeredQuestionIds: string[],
  currentProposition?: Proposition,
  currentTurn?: { turnId: string; text: string },
}) → { ok: true; output: AgentOutput } | { ok: false; issues: Array<{ path: string[] }> }
```

Parse with the given schema first. Then walk the parsed output for sourced leaves (an object
carrying its own `source` key is a leaf) and enforce:

- every leaf whose `source === "proposales_content"` has a `ref.variationId` for which
  `hasRetrieved(ctx.retrieval, id)` is true;
- every block's `contentId.value` likewise satisfies `hasRetrieved`;
- every leaf whose `source === "human"` resolves to one of: an id in `answeredQuestionIds`
  via `ref.questionId`; a `human` leaf at the same path with the same value in
  `ctx.currentProposition` (revision); or `ref.turnId === ctx.currentTurn.turnId` with
  `ref.quote` occurring verbatim (after trim) in `ctx.currentTurn.text`.
  **Prior conversation turns never resolve** (§9.1 rule 7, §17A.17 item 6).

Failures return issue **paths only** — never the model's text.

### 4.3 `server/domain/assemble-proposition.ts`

```
assembleProposition(output: AgentProposition, ctx: {
  generationId, version, preparedAt, retrieval, catalog, language, items, companyCurrency,
}) → Proposition
```

- identity and `pricing: "library"` from ctx;
- `productId` and catalog-verbatim `title` from the retrieval record; `description` from the
  catalog item in `language`, else `{ known: false }`;
- alternatives enriched from the record (`matchStrength`, `score`, `productId`, `title`),
  capped at `MAX_ALTERNATIVES_PER_BLOCK`;
- **`non_strong_selection` fires only when the selected block's strength is known and is not
  `strong`.** An absent strength means nothing was selected this run, not that it was
  selected weakly (phase-10 owner card 1 → B). Getting this wrong warns on every
  carried-over block;
- `no_acceptable_match` plus a `sold_scope` unresolved entry when the model reported
  `uncovered_scope`;
- `currency_mismatch` when a known `commercialNotes[i].currency` differs from
  `ctx.companyCurrency`, with `path ["commercialNotes", String(i), "currency"]` and text
  naming both codes. The note itself is kept exactly as the model produced it;
- `emptyDraftConfirmation: { known: false }`; `unresolvedItems` from `items`;
- ends with `propositionSchema.parse`.

The company currency is used here and **never reaches the prompt**.

### 4.4 `server/agent/prompts/preparation-system-prompt.v1.ts` and `language-derivation-prompt.v1.ts`

`preparationSystemPromptV1({ mode, language, catalogLanguages, clarificationAllowed })`.
Covers: role and goal; the consequential-field list and the never-invent rule; the source
vocabulary and how a `ref` is formed (`questionId`, or `{ turnId, quote }` taken from the
`current_instruction` block's header); tool guidance; the output format; the meaning of the
`<<<name (untrusted data)` … `>>>` delimiter; and the conversation rule — *the
`conversation_history` block is context for resolving what the human refers to, the
`current_instruction` block is the request, and a content identity may be used only if it
appears in `current_proposition` or in a tool result of this run.* In `revise` mode it adds
the `requestedOverrides` rule.

**The system prompt receives no user-provided text.** The brief, answers, history and
instruction travel only as `buildPreparationMessages` blocks. No rule may exist only in the
prompt.

### 4.5 `server/agent/preparation.agent.ts`

```
runPreparationAgent({
  mode: "prepare" | "revise", brief, state?, conversation, instruction?, answers?,
  catalog, language, allowClarification, budgets?,
}, deps: { ai, now, logger, newRunId }) → { run: RunResult<AgentOutput>, retrieval, language, usage }
```

**Step 0 — language derivation, only when `language === null`.** Both tools refuse to run
while `ctx.language` is null (their `requires` returns `language_unresolved`), and a run's
context is fixed, so on a first turn the model cannot search until the application knows the
language. So: one `run()` with **no tools** and `outputSchema: languageDerivationOutputSchema`
over the same labeled blocks, then `resolveLanguage(candidate, catalogLanguages(catalog))`.
This is decision 1 in §D.4 of the plan; it is not in the phase plans, and it is what makes
the first turn work at all.

**Step 1 — the main run.**

```
run({
  system: preparationSystemPromptV1({...}),
  initialMessages: buildPreparationMessages({ brief, catalogLanguages, language, answers?,
                                              currentProposition?, conversation, instruction? }),
  tools: <recording wrapper over PREPARATION_TOOLS>,
  outputSchema: agentOutputSchemaFor({ mode, allowClarification }),
  toolContext: { runId, traceId, companyId, catalog, language },
  budgets,
}, { ai, now, logger })
```

The messages must be `buildPreparationMessages`' output **passed through unchanged** — a
test deep-equals them against a direct call.

**The recording tool wrapper** (decision 2): `run` returns tool-call ids and outcomes only,
so the agent module wraps each tool with an `invoke` that, on success, extends the retrieval
record from the result (`search_content` → its candidates; `get_content` → its item as an
identity-only entry). Preserve `name`, `kind` and `descriptor` on the wrapper so `run`'s
read-only gate still applies and the descriptors the model sees are unchanged.

The record starts as `seedRetrievalRecord(state.currentProposition)` when a proposition
exists, else `emptyRetrievalRecord()`.

**One line you must change:** `extendRetrievalRecord` in `server/domain/retrieval-record.ts`
takes `ReadonlyArray<ContentCandidate>`; widen it to `ReadonlyArray<RetrievedCandidate>` so a
`get_content` result (a `ContentDetail`, which has no score or strength) can enter the
record. `ContentCandidate` remains assignable. No behaviour changes.

Usage is summed across both runs and reported on every result.

### 4.6 `server/services/prepare-from-brief.ts` and `answer-clarification.ts`

Follow phase 11 tasks 9 and 10 exactly, plus:

- strict input parsed first; `state` through `parseProposalWorkflowState`, `conversation`
  through `parseConversationInput`;
- `generationId = state ? parsed.generationId : deps.newGenerationId()` — mechanically, from
  the presence of inbound state. **No `isFirst` flag, no heuristic** (§17A.2);
- one `listContent()` and one `getCompany()` per turn;
- outcomes: budget exhaustion with an open `ask_if_underivable` item → `clarification` with
  `budgetExhausted`; with none open → `failed`; model `clarification` → assign ids from
  `deps.newQuestionId`, store `state.clarification`; model `proposition` → validate refs,
  resolve language, assemble, `deriveItemResolutions`, set both propositions,
  `version = nextVersion(state)`;
- language `ask` on a first turn merges a synthesized `language` question into the
  clarification (dedupe by `itemKey`, cap at `MAX_CLARIFICATION_QUESTIONS`); after the round
  it is a proposition with `language { known: false }`, warning `catalog_language_missing`,
  item `unresolved`;
- every result carries `run: { provider, model, usage }`;
- append exactly one assistant turn via `renderAssistantTurn`. **Neither service appends a
  human turn**: the brief and the answers are structured data, not conversation (§8.2);
- `answerClarification` runs with `allowClarification: false`, so a second clarification is
  not a representable output.

### 4.7 Batch 3 tests

Write rows **P1–P12** exactly as §G of the plan file specifies. They are already written as
assertions; do not weaken them. Add the named scripts they need to `fixtures/scripts.ts`.

---

## 5. Batch 4 — revision, surface, proof, closeout

1. `server/domain/merge-revision.ts` and `server/services/revise-proposition.ts` per phase 12
   tasks 3 and 6, tests **R1–R6**. This is the **cut line**: if you run short, everything
   below still ships without it, and you say so.
2. `server/index.ts` — export the services and the public types.
3. `src/features/proposal-preparation/workflow.test.ts` — rows **W1** and **W2**, the
   whole-workflow proof.
4. `test/isolation-scan.ts` + `test/isolation.test.ts` — row **I1**. Derive the file set by
   **reading the directory**, never a hand-maintained list (§9.1 rule 20), and prove the
   scanner with a planted violation created and deleted inside the test.
5. `vitest.live.config.mts`, the `test:live` script, `src/lib/proposales/smoke.live.test.ts`,
   and the opt-in eval — row **L1**. Every live test skips unless `LIVE_SMOKE=1`. The smoke
   creates one draft titled `[DISPOSABLE COPILOT SMOKE] <iso>` and prints its uuid, the
   catalog count and languages, and the observed editor-URL origin.
6. Documentation: a new `src/features/proposal-preparation/README.md`; patch the root
   `README.md` (it still says the workflow is not implemented, which is now false); patch the
   two integration READMEs only if this work changed something they state.
7. The master plan: tracker rows 11–15 get one truthful state — use `SUBMISSION_SPRINT`,
   **never `APPROVED`** — and add the short implementation-history section using the text at
   the end of the plan file. Add §6.4 notes for the `add_block` candidate shape and the
   `DomainResult` payloads.

---

## 6. How to work — this is where previous rounds were lost

1. **Take every expected value from printed output, never from reading a schema.** Write the
   assertion, run it, and pin what actually came back. Across phases 8, 9 and 10 this single
   habit was the difference between a clean round and a wasted one.
2. **Green on the first run is not evidence.** After each batch, forward-probe: edit
   production to break a guard, run the feature suite, confirm the row reddens, revert.
   Batch 1 ran six probes, batch 2 seven; all thirteen reddened. **List your probes in the
   commit message.** Ask of every component: *what could this return, or fail to do, that
   would still satisfy these assertions?*
3. **Pair every absence claim with a presence claim on the same fixture** (§9.1 rule 22).
   "X does not appear" is satisfied by an implementation that produces nothing at all.
4. **A fixture modelling an external dependency must be grounded in what that dependency can
   actually produce** (§9.1 rule 18). Scripted steps use the same `GenerateStepResult` shapes
   `src/lib/agent/run.test.ts` already drives the real loop with. Do not invent vendor shapes.
5. `structuredClone` preserves internal aliasing — a fixture returning the same object twice
   stays aliased through the clone. That was a real defect in `validEnvelope`.
6. The fake Proposales client records a create only after it succeeds and never records
   `getProposal`. To count attempts, wrap the method in your harness.
7. The fake's clock and the service's `deps.now` are separate: the create metadata timestamp
   comes from the client's, the read-back elapsed measurement from the service's.
8. Run `npx vitest list` to confirm any new test file outside `src/lib/**`,
   `src/features/**`, `src/app/**`, `src/components/**` or `test/setup/` is actually
   collected. A file claimed by no project is silently not run.

---

## 7. Fences

- **Do not touch the frontend**: `src/app/`, `src/components/`, `src/styles/`, or the sibling
  worktree at `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`. Never `cd` into it.
- **Do not add a transport.** No Route Handler, no Server Action, no
  `server/actions.ts` — the frontend stream owns that file by a ratified decision.
- **Do not weaken an existing test** to make the suite green. 571 tests pass today; that
  number only goes up.
- **Do not refactor** approved code for aesthetics: no renames, no folder moves, no new
  generic layers, no rewriting proven adapters.
- **No comment anywhere in production source may mention deadlines, sprints, or time
  pressure.** Comments explain code behaviour. The delivery deviation is recorded once, in
  the build documentation, at closeout.
- No network, no `.env` read, no provider call, and no `npm install` in the default suite.

---

## 8. Closing each batch

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` — all four must pass.
Then `git checkout -- tsconfig.tsbuildinfo`, stage `src` (plus `test`, `package.json`,
`build_docs` where the batch touched them), and checkpoint-commit under the project's
standing authorization with this exact subject form:

```
CHECKPOINT (not approved): submission sprint batch N — <short description>
```

The body says what shipped, any decision you took that the plan left open, any defect your
own tests caught, and your probe list with what each reddened.

---

## 9. The final gate (after batch 4)

Section K of the plan file. In short: all four commands green on one tree; every P0 row from
§G present and passing; W1 and W2 passing end to end through `server/index.ts`; your probes
each reddening a row and reverted; the create request carrying no price-bearing key at any
depth; the strict boundaries holding (envelope rejects `conversation`, state rejects unknown
keys, edits input rejects `version`, execution rejects a raw proposition); `server/index.ts`
exporting the full service and type surface; the feature README existing and the root README
no longer claiming the workflow is unimplemented; the master plan carrying the truthful
history section; and a clean tree at a final checkpoint commit.

---

## 10. When to stop for the owner

Stop only for a decision that is genuinely the owner's: a change to ratified product
semantics, a commercial-safety trade, or a contradiction between the intention and a
contract that you cannot resolve by applying the more specific one. Ordinary implementation
choices already governed by the intention, the contracts or the plan are yours to make —
make them, and record them in the commit body.

If you find a genuine contradiction in already-approved code, report it separately rather
than fixing it inside this sprint.
