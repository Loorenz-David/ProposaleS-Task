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
2. `server/domain/information-registry.ts`: `import "server-only"`; `INFORMATION_REGISTRY` (the §17A.6 table); `initialItems()` (every item `unresolved`); `applyAnswers(items, questions, input: ClarificationAnswersInput)` returns a new record and never mutates `items`. Process input answers left-to-right: for each entry, reject an unknown `questionId` before duplicate detection; otherwise reject a repeated id. The first violation wins. Unknown → `ValidationError` reason `unknown_question_id`, path `["answers", i, "questionId"]`; duplicate → reason `domain_rule`, same path. A `skip` for an `ask_if_underivable` item → `deferred_by_user`; a skip for `do_not_ask` → `ValidationError` reason `domain_rule`, path `["answers", i, "answer"]`; `answer` → `supplied`; no entry → unchanged (`unresolved`).
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
| C3(f) | unknown precedes duplicate | first and second answers share an unknown id | first `ValidationError` is reason `unknown_question_id`, issue path `["answers","0","questionId"]` | — | M18, §17A.7 |
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
