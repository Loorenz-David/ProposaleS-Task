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

`schemas/information-items.ts`, `schemas/clarification.ts`, `schemas/workflow-state.ts`, `schemas/workflow-state.test.ts`, `schemas/clarification.test.ts`, `server/domain/information-registry.ts`, `information-registry.test.ts`, `server/domain/approvability.ts`, `approvability.test.ts`, `server/domain/bump-version.ts`, `bump-version.test.ts`, `fixtures/states.ts` — 12 new files.

## Implementation tasks (ordered)

1. `schemas/information-items.ts`: key enum (10), policies, resolution state, `informationItemsRecordSchema` = strict object with all 10 keys required.
2. `server/domain/information-registry.ts`: `INFORMATION_REGISTRY` (the §17A.6 table); `initialItems()` (every item `unresolved` with its policies); `applyAnswers(items, questions, answers)`: unknown `questionId` → `ValidationError` reason `unknown_question_id` with path `["answers", i, "questionId"]`; duplicate `questionId` → `ValidationError`; `skip` → `deferred_by_user`; `answer` → `supplied`; no entry → unchanged (`unresolved`).
3. `server/domain/approvability.ts`: `evaluateApprovability(items)` — refuse iff some item has `createPolicy === "required_to_create"` and `resolution !== "supplied"`; returns sorted `itemKeys`.
4. `schemas/clarification.ts`: question, clarification (array `.max(MAX_CLARIFICATION_QUESTIONS)`), answer union, `clarificationAnswersInputSchema` (strict).
5. `schemas/workflow-state.ts`: `proposalWorkflowStateSchemaFor(editorOrigin: string)` returning the strict schema (Draft Reference `editorUrl` refinement: `new URL(u).protocol === "https:" && new URL(u).origin === editorOrigin`); `parseProposalWorkflowState(raw: unknown, editorOrigin)`: **first** `Buffer.byteLength(JSON.stringify(raw))` (raw is re-serialized; the caller may also pass the original string length via an option) `> MAX_WORKFLOW_STATE_BYTES` → `ValidationError` reason `workflow_state_too_large`; **then** `safeParse`; failure → `ValidationError` with issues. `brief.text` uses `boundedText(MAX_BRIEF_CHARS)`.
6. `server/domain/bump-version.ts`: `nextVersion(state)` = `state.currentProposition ? state.currentProposition.version + 1 : 1`.
7. `fixtures/states.ts`: `validState(overrides?)`, `maximalConformingState()` (brief at cap, `MAX_BLOCKS` blocks each with `MAX_ALTERNATIVES_PER_BLOCK` alternatives and every text at cap, two propositions, a clarification round at cap).
8. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a–j) | registry rows | one row per item key | `(askPolicy, createPolicy)` equal §17A.6: `language` (ask, required) · `title` (do_not_ask, required) · `block_selection` (do_not_ask, required) · `sold_scope` (ask, not_required) · `recipient_identity` (ask, not_required) · `quantities` (ask, not_required) · `recipient_contact_detail`, `description_narrative`, `block_comments`, `deadline_and_terms_notes` (do_not_ask, not_required) | — | §17A.6 |
| C1(k) | registry total | | `Object.keys(INFORMATION_REGISTRY)` set-equals the key enum (10) | — | §17A.6 |
| C2(a) | all supplied | | `{ approvable: true }` | — | M2, §17A.6 |
| C2(b) | language unresolved | | `{ approvable: false, itemKeys: ["language"] }` | — | M2 |
| C2(c) | deferred not-required | `recipient_identity: deferred_by_user`, rest supplied | approvable | MUT-06-1 `approvability.ts` · predicate · refuse on any `resolution !== "supplied"` → C2(c) red | M2, §8.1 |
| C2(d) | confirmation satisfies selection | `block_selection: supplied` (set by the caller when confirmation is human-sourced; the derivation rule lands in phase 11) | approvable | — | crit 15 |
| C2(e) | selection unresolved | | `itemKeys: ["block_selection"]` | — | crit 15 |
| C2(f) | title unresolved | | `["title"]` | — | §17A.6 |
| C2(g) | two unresolved | `title`, `language` | `["language", "title"]` (sorted) | — | §17A.6 |
| C3(a) | unknown question id | answer for an id not in `questions` | `ValidationError` reason `unknown_question_id`, issue path `["answers","0","questionId"]` | — | M18, §17A.7 |
| C3(b) | skip | `{ kind: "skip" }` | item `deferred_by_user` | — | M18 |
| C3(c) | answer | `{ kind: "answer", text: "Anna" }` | item `supplied` | — | M18 |
| C3(d) | no entry | question present, no answer | item stays `unresolved` | MUT-06-2 `information-registry.ts` · `applyAnswers` · treat a missing entry as skip → C3(d) red | M18, §17A.7 |
| C3(e) | duplicate entries | two answers same id | `ValidationError` | — | §17A.7 |
| C4(a) | question cap | exactly `MAX_CLARIFICATION_QUESTIONS` | parses | — | §17A.7 |
| C4(b) | over cap | `+1` | fails at `["questions"]` | — | §17A.7 |
| C4(c) | question text cap | `MAX_QUESTION_CHARS + 1` | fails | — | §17A.16 |
| C4(d) | answer text cap | `MAX_ANSWER_CHARS + 1` | fails | — | §17A.16 |
| C5(a) | valid state | `validState()` | parses | — | M17 |
| C5(b) | unknown top-level key | `{ ...validState(), foo: 1 }` | fails at `["foo"]` | — | M17, §17A.3 |
| C5(c) | misspelled draft reference not stripped | `draftRefrence: {…}` | fails at `["draftRefrence"]`; the parsed output (if any) is never produced | MUT-06-3 `workflow-state.ts` · state object · `z.object` instead of `z.strictObject` → C5(c) red | M17, §17A.3 |
| C5(d) | nested unknown key | `brief: { text, receivedAt, extra: 1 }` | fails at `["brief","extra"]` | — | M17 |
| C5(e) | JSON round trip | state with `{ known: false }` leaves | `parse(JSON.parse(JSON.stringify(s)))` deep-equals `s` | — | M9, §17A.3 |
| C5(f) | brief cap | `brief.text` of `MAX_BRIEF_CHARS + 1` | fails at `["brief","text"]` | — | §17A.16 |
| C6(a) | valid draft reference | uuid v4 + `https://proposales.test/p/<uuid>` with origin `https://proposales.test` | parses | — | M17, §17A.3 |
| C6(b) | http | `http://proposales.test/p/x` | fails at `["draftReference","editorUrl"]` | — | §17A.3, 10 §10 |
| C6(c) | other origin | `https://evil.test/p/x` | fails | MUT-06-4 `workflow-state.ts` · editorUrl refinement · drop the origin equality → C6(c) red | M17 |
| C6(d) | same host, other port | `https://proposales.test:8443/p/x` | fails | — | §17A.3 |
| C6(e) | uuid uppercase | | fails at `["draftReference","proposalUuid"]` | — | M8 |
| C7(a) | within bound | `validState()` | parses | — | M17 |
| C7(b) | over bound wins over strictness | raw object with an extra key `pad` holding a string that pushes the serialized size over `MAX_WORKFLOW_STATE_BYTES` | `ValidationError` reason `workflow_state_too_large` (not an unknown-key issue) | MUT-06-5 `workflow-state.ts` · `parseProposalWorkflowState` · move the size check after `safeParse` → C7(b) red | M17, §17A.3 |
| C7(c) | bound exceeds ordinary use | `maximalConformingState()` | serialized byte length `< MAX_WORKFLOW_STATE_BYTES` and it parses | — | §17A.3 |
| C8(a) | generation id form | lowercase v4 | parses; uppercase fails at `["generationId"]` | — | M8, §17A.2 |
| C8(b) | first version | state without propositions | `nextVersion === 1` | — | §17A.2 |
| C8(c) | increment | `currentProposition.version = 4` | `5` | — | §17A.2 |
| C8(d) | caller cannot supply | the version is not an input anywhere: `nextVersion` takes only the state (signature assertion via `expectTypeOf`) | compiles | — | §17A.2 |

Criteria: 8 (C1–C8), 45 rows (a table line is one row; a lettered span counts its letters). Named mutations: 5.

## Notes

- `parseProposalWorkflowState` returns the parsed state; every service in phases 11–14 calls it first and never touches `raw` afterwards.
- The stale-case table of §17A.3 is behavior of later phases (12, 13) except "parses but stale" → accepted, which C5(a) already shows.
- Projection gate: mandatory (ranks 5, 6, 14, 15).

## Review log

*(append-only)*
