---
plan: 6
phase: Information items, clarification, workflow state, identity
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 6 — Information items, clarification, workflow state, identity

## Goal

Create the information-item registry (two policies + resolution state), the approvability predicate, clarification question/answer schemas with `questionId` binding and the explicit skip, the strict caller-held workflow state with its byte bound and origin-validated Draft Reference, and the version rule.

**Not in this phase:** services that produce clarifications (phase 11); the approval envelope (phase 13).

## Read first

1. Master plan §6.4 (`informationItemKeySchema`, `informationItemStateSchema`, `clarification*`, `draftReferenceSchema`, `proposalWorkflowStateSchema`), §6.5 (`MAX_CLARIFICATION_QUESTIONS`, `MAX_WORKFLOW_STATE_BYTES`, `MAX_BRIEF_CHARS`), §6.6 (`INFORMATION_REGISTRY`, `applyAnswers`, `evaluateApprovability`), §6.3 (`ValidationReason`).
2. Intention §17A.2, §17A.3 (all, including the stale-case table), §17A.6, §17A.7, §8.1, §8.2, §5.2, §11.3 ("after a draft exists").
3. Contracts: `06-data-contracts-and-validation.md` §3 (strict), §6 (identifiers); `10-security-and-trust-boundaries.md` §4, §10; `02-runtime-boundaries.md` §6, §9.
4. Phase 5 Review log.

## Dependencies (gate)

Phase 5 `APPROVED`.

## Files expected to change

`schemas/information-items.ts`, `schemas/clarification.ts`, `schemas/workflow-state.ts`, `schemas/workflow-state.test.ts`, `schemas/clarification.test.ts`, `server/domain/information-registry.ts`, `server/domain/information-registry.test.ts`, `server/domain/approvability.ts`, `server/domain/approvability.test.ts`, `server/domain/bump-version.ts`, `server/domain/bump-version.test.ts`, `fixtures/states.ts` — 12 new files.

## Implementation tasks (ordered)

1. `schemas/information-items.ts`: key enum (10), policy enums, resolution state, and `informationItemsRecordSchema` = strict object with all 10 keys required, each item carrying **only** its `resolution`. The policies belong only to `INFORMATION_REGISTRY`.
2. `server/domain/information-registry.ts`: `import "server-only"`; `INFORMATION_REGISTRY` (the §17A.6 table); `initialItems()` (every item `unresolved`); `applyAnswers(items, questions, input: ClarificationAnswersInput)` returns a new record and never mutates `items`. Process input answers left-to-right: for each entry, reject an unknown `questionId`; otherwise reject a repeated id. The first violation wins. Unknown → `ValidationError` reason `unknown_question_id`, path `["answers", i, "questionId"]`; duplicate → reason `domain_rule`, same path. A `skip` for an `ask_if_underivable` item → `deferred_by_user`; a skip for `do_not_ask` → `ValidationError` reason `domain_rule`, path `["answers", i, "answer"]`; `answer` → `supplied`; no entry → unchanged (`unresolved`).
3. `server/domain/approvability.ts`: `import "server-only"`; `evaluateApprovability(items)` joins the caller-held resolution record to application-owned `INFORMATION_REGISTRY`, refuses iff a registry item has `createPolicy === "required_to_create"` and its resolution is not `supplied`, and returns sorted `itemKeys`.
4. `schemas/clarification.ts`: question; strict `clarificationSchema = { questions, answers }` for state; strict answer union; `clarificationAnswersInputSchema = { answers }.strict()` for caller input. Questions are capped by `MAX_CLARIFICATION_QUESTIONS`.
5. `schemas/workflow-state.ts`: `proposalWorkflowStateSchemaFor(editorOrigin: string)` returns the strict runtime-neutral schema. The Draft Reference URL is `z.url().refine((u) => new URL(u).protocol === "https:" && new URL(u).origin === editorOrigin)` so malformed input becomes a schema issue. `parseProposalWorkflowState(raw: unknown, editorOrigin)` first safely serializes `raw` with `JSON.stringify`; a throw or `undefined` result throws `ValidationError` reason `domain_rule`, issues `[{ path: [], message: "workflow state must be JSON-serializable" }]`. It then measures `new TextEncoder().encode(serialized).length`; above `MAX_WORKFLOW_STATE_BYTES` throws `ValidationError` reason `workflow_state_too_large` before schema parsing; otherwise it safe-parses and converts failure to `ValidationError` with issues. There is no caller-supplied original-byte-length option. `brief.text` uses `boundedText(MAX_BRIEF_CHARS)`. `workflow-state.test.ts` declares `TEST_EDITOR_ORIGIN = "https://proposales.test"` once and uses it for every origin fixture.
6. `server/domain/bump-version.ts`: `import "server-only"`; `nextVersion(state)` = `state.currentProposition ? state.currentProposition.version + 1 : 1`.
7. `fixtures/states.ts`: `validState(overrides?)` is the minimal valid state: lowercase generation id, valid brief, all ten resolutions supplied, and no clarification, proposition, or Draft Reference unless supplied by the override. `maximalConformingState()` builds its two capped propositions inline from `validProposition` (the phase-10 `maximalConformingProposition()` does not yet exist), includes a brief at cap and a clarification round at cap; every bounded text is at its cap and every uncapped alternative title is the non-empty literal `"alternative"`.
8. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a–j) | registry rows | one row per item key | `(askPolicy, createPolicy)` equal §17A.6: `language` (ask, required) · `title` (do_not_ask, required) · `block_selection` (do_not_ask, required) · `sold_scope` (ask, not_required) · `recipient_identity` (ask, not_required) · `quantities` (ask, not_required) · `recipient_contact_detail`, `description_narrative`, `block_comments`, `deadline_and_terms_notes` (do_not_ask, not_required) | — | §17A.6 |
| C1(k) | registry total | | `Object.keys(INFORMATION_REGISTRY)` set-equals the key enum (10) | — | §17A.6 |
| C2(a) | all supplied | | `{ approvable: true }` | — | M2, §17A.6 |
| C2(b) | language unresolved | | `{ approvable: false, itemKeys: ["language"] }` | — | M2 |
| C2(c) | deferred not-required | `recipient_identity: deferred_by_user`, rest supplied | approvable | MUT-06-1 `approvability.ts` · predicate · refuse on any `resolution !== "supplied"` → C2(c) red | M2, §8.1 |
| C2(d) | only required items gate | every required item supplied; all not-required items unresolved | approvable | — | crit 15, §17A.6 |
| C2(e) | selection unresolved | | `itemKeys: ["block_selection"]` | — | crit 15 |
| C2(f) | title unresolved | | `["title"]` | — | §17A.6 |
| C2(g) | two unresolved | `title`, `language` | `["language", "title"]` (sorted) | — | §17A.6 |
| C3(a) | unknown question id | answer for an id not in `questions` | `ValidationError` reason `unknown_question_id`, issue path `["answers","0","questionId"]` | — | M18, §17A.7 |
| C3(b) | skip | `{ kind: "skip" }` | item `deferred_by_user` | — | M18 |
| C3(c) | answer | `{ kind: "answer", text: "Anna" }` | item `supplied` | — | M18 |
| C3(d) | no entry | question present, no answer | item stays `unresolved` | MUT-06-2 `information-registry.ts` · `applyAnswers` · treat a missing entry as skip → C3(d) red | M18, §17A.7 |
| C3(e) | duplicate entries | two answers for one known question id; second at index 1 | `ValidationError` reason `domain_rule`, issue path `["answers","1","questionId"]` | — | §17A.7 |
| C3(f) | first invalid entry wins | first answer uses an unknown id; a later answer is irrelevant | first `ValidationError` is reason `unknown_question_id`, issue path `["answers","0","questionId"]` | — | M18, §17A.7 |
| C3(g) | skip cannot defer do-not-ask | skip answer for a `do_not_ask` item | `ValidationError` reason `domain_rule`, issue path `["answers","0","answer"]` | — | M18, §17A.6 |
| C3(h) | pure application | one answered known question | returned record changes only that resolution; original `items` deep-equals its pre-call value | — | §17A.6 |
| C4(a) | question cap | exactly `MAX_CLARIFICATION_QUESTIONS` | parses | — | §17A.7 |
| C4(b) | over cap | `+1` | fails at `["questions"]` | — | §17A.7 |
| C4(c) | question text cap | `MAX_QUESTION_CHARS + 1` | fails | — | §17A.16 |
| C4(d) | answer text cap | `MAX_ANSWER_CHARS + 1` | fails | — | §17A.16 |
| C4(e) | strict skip answer | `{ kind: "skip", text: "x" }` | fails at `["answer","text"]` | — | §17A.7 |
| C5(a) | valid state | `validState()` | parses | — | M17 |
| C5(b) | unknown top-level key | `{ ...validState(), foo: 1 }` | fails at `["foo"]` | — | M17, §17A.3 |
| C5(c) | misspelled draft reference not stripped | `draftRefrence: {…}` | fails at `["draftRefrence"]`; the parsed output (if any) is never produced | MUT-06-3 `workflow-state.ts` · state object · `z.object` instead of `z.strictObject` → C5(c) red | M17, §17A.3 |
| C5(d) | nested unknown key | `brief: { text, receivedAt, extra: 1 }` | fails at `["brief","extra"]` | — | M17 |
| C5(e) | JSON round trip | state with `{ known: false }` leaves | `parse(JSON.parse(JSON.stringify(s)))` deep-equals `s` | — | M9, §17A.3 |
| C5(f) | brief cap | `brief.text` of `MAX_BRIEF_CHARS + 1` | fails at `["brief","text"]` | — | §17A.16 |
| C5(g) | missing item key | state with `items.language` omitted | fails at `["items","language"]` | — | M17, §17A.6 |
| C5(h) | unknown item key | state with `items.extra` | fails at `["items","extra"]` | — | M17, §17A.6 |
| C5(i) | clarification round state | state carrying one question and its matching answer | parses and preserves both `questions` and `answers` | — | M17, §17A.7 |
| C6(a) | valid draft reference | uuid v4 + `https://proposales.test/p/<uuid>` with origin `https://proposales.test` | parses | — | M17, §17A.3 |
| C6(b) | http | `http://proposales.test/p/x` | fails at `["draftReference","editorUrl"]` | — | §17A.3, 10 §10 |
| C6(c) | other origin | `https://evil.test/p/x` | fails | MUT-06-4 `workflow-state.ts` · editorUrl refinement · drop the origin equality → C6(c) red | M17 |
| C6(d) | same host, other port | `https://proposales.test:8443/p/x` | fails | — | §17A.3 |
| C6(e) | uuid uppercase | | fails at `["draftReference","proposalUuid"]` | — | M8 |
| C6(f) | malformed editor URL | `editorUrl: "not-a-url"` | fails at `["draftReference","editorUrl"]`, not a thrown exception | — | M17, 10 §10 |
| C7(a) | within bound | `validState()` | parses | — | M17 |
| C7(b) | over bound wins over strictness | raw object with an extra key `pad` holding a string that pushes the serialized size over `MAX_WORKFLOW_STATE_BYTES` | `ValidationError` reason `workflow_state_too_large` (not an unknown-key issue) | MUT-06-5 `workflow-state.ts` · `parseProposalWorkflowState` · move the size check after `safeParse` → C7(b) red | M17, §17A.3 |
| C7(c) | bound exceeds ordinary use | `maximalConformingState()` | serialized byte length `< MAX_WORKFLOW_STATE_BYTES` and it parses | — | §17A.3 |
| C7(d) | non-serializable raw | `undefined` | `ValidationError` reason `domain_rule`, issues exactly `[{ path: [], message: "workflow state must be JSON-serializable" }]` | — | M17, 06 §3 |
| C8(a) | generation id form | lowercase v4 | parses; uppercase fails at `["generationId"]` | — | M8, §17A.2 |
| C8(b) | first version | state without propositions | `nextVersion === 1` | — | §17A.2 |
| C8(c) | increment | `currentProposition.version = 4` | `5` | — | §17A.2 |
| C8(d) | caller cannot supply | `nextVersion` export | runtime function arity is exactly `1` | — | §17A.2 |

Criteria: 8 (C1–C8), 54 rows (a table line is one row; a lettered span counts its letters). Named mutations: 5.

## Notes

- `parseProposalWorkflowState` returns the parsed state; every service in phases 11–14 calls it first and never touches `raw` afterwards.
- The stale-case table of §17A.3 is behavior of later phases (12, 13) except "parses but stale" → accepted, which C5(a) already shows.
- Projection gate: mandatory (ranks 5, 6, 14, 15).

## Review log

*(append-only)*

**Projection fold, 2026-09-06 (coordinator):** owner accepted both recommended cards: `MAX_WORKFLOW_STATE_BYTES` is 1 MiB and information-item policies are application-owned, with caller state carrying only resolutions. Routed D1–D22: runtime-neutral `TextEncoder` sizing; fail-closed serialization; no original-length option; malformed-URL schema failure; inline maximal fixture with a fixed uncapped alternative title; precise answer precedence/errors; do-not-ask skip refusal; strict clarification/state records; `nextVersion` naming and runtime arity guard; minimal `validState`; named origin fixture convention; strict answer arms; and pure `applyAnswers`. Count re-derived: 8 criteria / 54 rows / 5 mutations. The projection handoff remains the historical record.

**Implementation — round 1 (2026-09-06, Codex).** Implemented the exact twelve-file phase perimeter: runtime-neutral information-item, clarification, and workflow-state schemas; the inline maximal workflow-state fixture; and server-only registry, approvability, and version domain rules. The state carries only resolution objects; `INFORMATION_REGISTRY` owns both policy axes; `applyAnswers` is pure with left-to-right unknown/duplicate precedence; workflow-state serialization is guarded with `JSON.stringify` plus `TextEncoder` byte sizing before strict parsing; Draft References require the configured HTTPS origin; and `nextVersion` derives only from the caller-held state.

Architecture resolution re-emitted before implementation: `02-runtime-boundaries.md`, `03-feature-architecture.md`, `04-server-architecture.md`, `06-data-contracts-and-validation.md`, `10-security-and-trust-boundaries.md`, `11-testing-principles.md`, `12-anti-patterns.md`, `13-decision-checklist.md`, and `14-documentation-principles.md`; no additional contract was needed. `07-integrations.md`, `08-agent-architecture.md`, and `09-database-and-persistence.md` were considered through the master resolution and phase boundary; no integration, agent runtime, or persistence behavior was introduced. Schemas and fixtures remain runtime-neutral; the three domain modules begin with `import "server-only"`.

Judgment calls: Zod `unrecognized_keys` issues are expanded to the offending key path when converted to `ValidationError.details.issues`, so the declared field paths survive the error boundary; the strict skip arm uses an optional `z.never()` text field to reject an accidental `text` at `answer.text`; `maximalConformingState()` keeps the alternative title at the explicit uncapped literal `"alternative"`; and approvability sorts the refused keys lexically. No durable feature README existed and no authoritative current-state documentation became false or incomplete, so no documentation change beyond this implementation record was required.

Pre-edit baseline: after the five phase test files and state fixture were authored, before production modules were created, the phase command reported 5 files / 54 tests with 54 failures, all from the intentionally absent production modules. The baseline HEAD was `426a743ed3c268bb883a8bbc5f2bd0463ebd34f0`; a dirty-tree digest was not captured at that moment. Focused post-implementation verification was 5 files / 54 tests green; `npm run typecheck`, `npm run lint`, and `git diff --check` passed. The generated `tsconfig.tsbuildinfo` change from typecheck was restored and is outside the phase perimeter.

The five named mutations were executed and reverted: `MUT-06-1` (`approvability.ts`, predicate) failed C2(c) and C2(d); `MUT-06-2` (`information-registry.ts`, `applyAnswers`) failed C3(d) and C3(h); `MUT-06-3` (`workflow-state.ts`, outer state object) failed C5(b) and C5(c); `MUT-06-4` (`workflow-state.ts`, editor origin refinement) failed C6(c) and C6(d); and `MUT-06-5` (`workflow-state.ts`, size-check placement) failed C7(b). Snapshot digests and observed assertions are in the implementer handoff. An initial MUT-06-3 attempt was mis-sited on the Draft Reference object and stayed green; it was immediately re-sited to the named outer state object and reddened, as required by the executor doctrine.

Additional guard-failure probes were planted and reverted for serialization (`C7(d)`), purity (`C3(h)`), strict skip answers (`C4(e)`), nested brief strictness (`C5(d)`), and strict resolution records (`C5(h)`); each observed its declared red result. No architecture graph exists. The checkpoint commit and final closing-suite evidence are recorded in `handoffs/implementer/phase-06-round-1.implementer.md`.

**Review — round 1 (2026-09-06, Claude). Verdict: `CHANGES_REQUESTED` (0 blocking · 2 should-fix · 4 notes).**

Perimeter verified: `git diff --name-status 426a743 760fa45` is exactly the twelve declared phase files plus tracker row 6 and this append-only log. No frontend file, `tsconfig.tsbuildinfo`, route, service, persistence, integration, or agent surface entered the checkpoint; `src/` at HEAD `22c7cde` is byte-identical to `760fa45`; the separate frontend worktree is untouched. Counts re-derived from the plan, not consumed from the handoff: 8 criteria, 54 rows (11 + 7 + 8 + 5 + 9 + 6 + 4 + 4), 5 named mutations `C1 0 · C2 1 · C3 1 · C4 0 · C5 1 · C6 1 · C7 1 · C8 0`. Trace chain closed both ways: 54 tests across five files, each named for its row; no orphan test, no candidate criterion.

**S1 (should-fix) — C5(e) cannot fail for the reason it exists.** Its fixture is `validState({ items: { …, language: { resolution: "unresolved" } } })`, whose keys are exactly `generationId`, `brief`, `items`: no proposition, and no `{ known: false }` leaf anywhere in the serialized form. The row's declared fixture is "state with `{ known: false }` leaves" and its trace is M9, whose objective is that a no-sourced-value leaf *survives a JSON round-trip unchanged*. Probe P9 collapsed every `{ known: false }` arm to `{}` on parse (`schemas/shared.ts`, `sourcedOrAbsent`) and all 19 `workflow-state.test.ts` tests stayed green, C5(e) included; a state carrying such leaves reddened under the same mutant. Authority: plan C5(e); intention M9; §17A.3; charter rule 15. Correction: build C5(e) from `validState({ preparedProposition, currentProposition })` where both propositions carry `{ known: false }` on the recipient object, on one `SourcedOrAbsent` block leaf (`quantity` or `optional`), and on one top-level leaf (`title` or `agentRationale`); keep the existing deep-equality assertion.

**S2 (should-fix) — C2(g)'s "sorted" expectation is order-degenerate.** The row unresolves `title` and `language`, which occupy the same relative order under `INFORMATION_ITEM_KEYS` enum order and under lexical order, so the assertion holds with or without the sort. Probe P10 deleted `.sort()` at `server/domain/approvability.ts:12` and all 7 `approvability.test.ts` tests stayed green. A pair whose orders differ — `title` + `block_selection`, enum `["title","block_selection"]` versus lexical `["block_selection","title"]` — is green on the shipped code and red under the same mutant (verified). Authority: plan C2(g) and task 3; §17A.6; charter rule 15. Correction: unresolve `title` + `block_selection` (or all three required items) and keep the exact expected array.

**N1 (note) — C3(f)'s declared unknown-before-duplicate precedence is unreachable, not merely untested.** Probe P6 swapped the two checks in `applyAnswers` and all 19 registry tests stayed green; probe P3 shows why no fixture can separate them: an unknown id always throws at its first occurrence, so no id can ever be both unknown and a repeat. The implementation is correct; the ordering claim in task 2 and row C3(f) is vacuous. Plan lesson, no code change: retire the precedence clause, or restate C3(f) as what it does measure — the first offending entry decides, by index.

**N2 (note) — `maximalConformingState()` is 6.1 % of the byte bound, not maximal.** Measured 64,007 B against `MAX_WORKFLOW_STATE_BYTES` = 1,048,576. Grown to `MAX_BLOCKS` (30) blocks × `MAX_ALTERNATIVES_PER_BLOCK` (3) alternatives on both propositions with every text at cap, the same state measures 686,415 B (65.5 %) and still parses — so §17A.3's claim that the brief cap *and the per-block alternative cap* keep a maximally conforming two-proposition state under the bound **holds**, with a real margin of 1.53× rather than the 16× C7(c) certifies. Task 7 asked only for text caps, so this is a plan gap, not an implementation deviation. Carry-forward: phase 10, where §6.7 gives `maximalConformingProposition()` its owner; re-point C7(c) at it.

**N3 (note) — dead policy enums.** `informationItemAskPolicySchema` and `informationItemCreatePolicySchema` (`schemas/information-items.ts:19–20`) have no consumer anywhere in `src/`, while `INFORMATION_REGISTRY` (`server/domain/information-registry.ts:8`) hand-writes the same two unions inline — one vocabulary, two declarations. Charter rule 4. Correction: type the registry from `z.infer` of those schemas, or delete them. May ride with the S1/S2 round.

**N4 (note) — `nextVersion` is exercised on hand-built records.** `bump-version.test.ts:23,28` pass `validState(…) as never`, and C8(c)'s `currentProposition: { version: 4 }` is not a parseable proposition (charter rule 3). Behaviour is unaffected — `nextVersion` reads only `currentProposition.version`, verified structurally — and the plan row specifies this fixture, so it is a note. Correction if taken: `validProposition({ version: 4 })`.

**Verified correct.** C1(a–k) equals §17A.6 row for row and is total over the key enum. Approvability was re-derived over the full 10-key × {`unresolved`, `deferred_by_user`} matrix (probe P2): exactly `language`, `title`, `block_selection` refuse, on both non-supplied resolutions, and every non-required key is inert — including the deferred-required case no criterion names. Policy smuggled into a caller-held item fails at `["items","<key>","askPolicy"]` / `…,"createPolicy"]`, and `evaluateApprovability` reads policy only from the application-owned table, so §17A.6's ownership rule holds structurally, not just behaviourally. `applyAnswers` purity was checked on the success path and on all three throwing paths, including a batch that applies two entries before throwing at index 2 (probe P3): `items` deep-equals its pre-call value every time, and each throw carries exactly one issue. Serialization is fail-closed: `BigInt` and a cyclic object both produce the exact declared `domain_rule` issue and never a native throw (probe P1), and a function-valued key — silently dropped by `JSON.stringify` — still fails closed at `["fn"]` because the schema parses `raw`, not the serialized string. Size precedence holds with a valid inner state plus one unknown `pad`, and a state exactly one byte over the bound with no unknown key refuses with `workflow_state_too_large` (1,048,577 B measured, probe P4). Draft Reference rejects `http`, a foreign origin, a port-shifted same host, an uppercase uuid, and a malformed URL, each at its declared path and as a `ValidationError` rather than a `TypeError` (contract 10 §10). Runtime neutrality is structural: no `server-only`, `process.env`, `"use client"`, or React import under `schemas/` or `fixtures/`, and all three `server/domain/` modules open with `import "server-only"` (contract 02 §§3, 5; 06 §4). Fresh mutation adequacy at sites outside the implementer ledger: removing the `do_not_ask` skip refusal reddens exactly C3(g) (P7); removing the policy-table join reddens C2(c) and C2(d) (P8). Documentation impact "no" is correct — no feature README exists, the root README makes no claim this phase falsifies, and phase 15 owns closeout (contract 14 §8).

**Evidence.** L4 budget: exactly one run. Pre-run identity — HEAD `22c7cde`, `git status --porcelain` empty, `src/` identical to checkpoint `760fa45`; the reviewer's tree differs from the implementer's stamp tree, so charter L4(b) authorises the stamp. `npm test` → 20 files / 278 tests green; failure-ID delta ∅ → ∅. Targeted L1 runs and ten probes (P1–P10) supplied every other observation.

**Mutation-probe declaration.** Probe-touched tracked files, all restored and verified byte-identical by `git status --porcelain` returning empty and by SHA-256: `server/domain/information-registry.ts` `5e30f500…a149b4` (P6, P7), `server/domain/approvability.ts` `44e9b51f…e05f33c8` (P8, P10 ×2), `schemas/shared.ts` (P9, restored, confirmed clean against HEAD). One untracked probe file, `schemas/zz-review-probe.test.ts`, was created twice and deleted both times; it is absent from the tree. No database or other persistent state is in scope.

**Lessons for the plans.** (i) Two of eight criteria shipped a row whose fixture cannot exhibit the condition it names — both were ordering/preservation claims, and both would have been caught by the planner asking, per row, "which mutation makes this red?" C2(g) and C5(e) had no named mutation; all five that did have one bit correctly. Consider requiring a named mutation on every row that asserts an *ordering* or a *preservation* property, not only on the rows the planner chose. (ii) A precedence rule (C3(f)) was specified between two checks that no input can order; the projection ledger routed it as D-item precision without asking whether the two conditions are jointly reachable. (iii) A fixture named "maximal" was specified by text caps only, while the authority it serves names an array cap; "maximal" needs its axes enumerated, not adjectived (charter rule 5).

**Coordinator fold — fix round 2 preparation (2026-09-06).** N1 is resolved above: C3(f) now asserts the reachable first-invalid-entry behavior rather than an impossible unknown/duplicate precedence. N2 is carried to phase 10 through the master follow-up register, whose already-planned `maximalConformingProposition()` owns the missing cardinality axes. The fix round resolves S1 and S2 and also closes N3 (central policy types) and N4 (parseable version fixture); it does not alter phase behavior, criteria count, row count, or the five named implementation mutations. The owner explicitly authorized coordinator validation rather than another independent reviewer after this narrow fix.

**Implementation — fix round 2 (2026-09-06, Codex).** Repaired S1 by making C5(e) round-trip two valid propositions whose recipient objects, one `SourcedOrAbsent` block leaf each (`quantity` on `preparedProposition`, `optional` on `currentProposition`), and one top-level leaf each (`title` and `agentRationale`) carry `{ known: false }`; the existing deep-equality assertion remains. Repaired S2 by unresolving `title` and `block_selection` in C2(g), preserving the exact lexical expected array so the enum-order result is distinguishable from an unsorted result. The single C3(f) test now uses an unknown answer at index 0 followed by a known answer and is titled for the reachable first-invalid-entry behavior; no criterion or test was added. N3 is closed by deriving the registry policy axes from `z.infer` of the central policy schemas. N4 is closed by using `validProposition({ version: 4 })` in C8(c) and parsing it with `propositionSchema` before calling `nextVersion`.

The pre-edit fix baseline was 4 focused test files / 49 tests green (`workflow-state.test.ts`, `approvability.test.ts`, `information-registry.test.ts`, and `bump-version.test.ts`); `git status --porcelain` was empty. After the repairs, the same focused surface was 4 files / 49 tests green, `npm run typecheck` passed, and `git diff --check` passed. S1's reverted mutant transformed the `{ known: false }` parse arm to output `{}` and produced exactly one failing test, C5(e), with 18 other workflow-state tests green. S2's reverted mutant removed `.sort()` from `evaluateApprovability` and produced exactly one failing test, C2(g), with the other 6 approvability tests green. Both mutants were restored and the focused surface returned to 49/49. The tracked `tsconfig.tsbuildinfo` rewrite from typecheck was restored and is outside the repair perimeter.

Architecture resolution for this fix remains `02-runtime-boundaries.md`, `03-feature-architecture.md`, `04-server-architecture.md`, `06-data-contracts-and-validation.md`, `10-security-and-trust-boundaries.md`, `11-testing-principles.md`, `12-anti-patterns.md`, `13-decision-checklist.md`, and `14-documentation-principles.md`; no new concern or contract was introduced. No architecture graph exists. Documentation impact review after verified behavior: this test/typing repair makes no durable feature, integration, root README, or architecture documentation false or incomplete, so no documentation change was required.
