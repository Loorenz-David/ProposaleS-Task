---
plan: 12
phase: Manual edits, human search and replace, agent revision
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1; amended round 2 (conversation context)
---

# Phase 12 — Manual edits, human search and replace, agent revision

## Goal

Implement `editProposition` (closed edit operations producing `human` leaves; domain-rule violations rejected, never corrected), human search-and-replace via `add_block` from a `searchContentForHuman` result, and `reviseProposition` with the deterministic per-leaf merge that keeps every `human` leaf unless the model's `requestedOverrides` names its path, records the warnings, and cannot launder an invention. `reviseProposition` is the turn where multi-turn continuity is proven: the human instruction is the latest turn, prior turns travel in the `ConversationContext`, the retrieval record is seeded from the current proposition, and a reference such as "use the second one" resolves to a content identity the validator accepts — or fails as `model_output_invalid` when it names something never presented nor read.

**Not in this phase:** approval (phase 13).

## Read first

1. Master plan §6.4 (`editOperationSchema`, `agentOutputSchema` revise mode, `conversationContextSchema`, `RetrievalRecord`), §6.6 (`editProposition`, `reviseProposition`, `mergeRevision`, `applyEdits`, `appendTurns`, `seedRetrievalRecord`, `buildPreparationMessages`), §6.3 (warning kinds `human_value_kept`, `human_value_overridden`), §6.9, §9 rules 11, 12, §12 (card 2 answered → A; FB-2).
2. Intention §17A.9 (all), §17A.2 (version), §17A.3 (two propositions), §17A.4 (admissible sources), §17A.8 (content identity from a read), §11.2, §10.2 (human-triggered search), §6 invariants 6, 8; §17A.17 as proposed in FB-2.
3. Contracts: `04-server-architecture.md` §4, §5; `08-agent-architecture.md` §6; `06-data-contracts-and-validation.md` §3.
4. Phases 10 and 11 Review logs.

## Dependencies (gate)

Phase 11 `APPROVED`.

## Files expected to change

`schemas/edits.ts`, `server/domain/apply-edits.ts` (+test), `server/domain/merge-revision.ts` (+test), `server/agent/prompts/revision-system-prompt.v1.ts`, `server/services/edit-proposition.ts` (+test), `server/services/revise-proposition.ts` (+test), `server/index.ts`, `fixtures/scripts.ts` (revision scripts), `fixtures/conversations.ts` (extend) — 12 paths.

## Implementation tasks (ordered)

1. `schemas/edits.ts` per master plan §6.4; `add_block` carries the full `candidate: ContentCandidate` (from a human search result) so the service needs no catalog read.
2. `domain/apply-edits.ts`: `applyEdits(current, edits, editTurn)`: `set_leaf` re-parses `value` with the leaf's own schema by path (a path → schema resolver over `propositionSchema`), writes `{ known: true, value, source: "human", ref: { editTurn } }` (or the `Sourced` form for non-absent leaves); `remove_block`, `add_block` (block from the candidate: `contentId` `human` with `ref.variationId`, `title`/`description` `catalog_verbatim`, `quantity`/`optional` from the op or `{ known: false }`, `pricing: "library"`, alternatives `[]`), `unset_recipient`, `confirm_empty_draft`; the result is re-parsed with `propositionSchema`; a failure is a `ValidationError` reason `domain_rule` with the path.
3. `domain/merge-revision.ts`: `mergeRevision(current, proposed, overrides)`: walks the leaves of `current`; per leaf the §17A.9 table; a leaf present in `proposed` but not in `current` is taken; array-valued fields (`blocks`, `commercialNotes`, …) merge positionally by index; a path in `overrides` that names no `human` leaf is ignored with warning `other`.
4. `prompts/revision-system-prompt.v1.ts`: revise-mode prompt with the rule that human-set leaves are kept unless `requestedOverrides` names them, and the phase 11 conversation rule (history is context; `current_instruction` is the request; identities only from `current_proposition` or this run's tool results). The current proposition, history, and instruction are **blocks from `buildPreparationMessages`**, never prompt text.
5. `services/edit-proposition.ts`: parse state and edits; `applyEdits(current, edits, editTurn = nextVersion(state))`; `state.currentProposition = edited` with `version = nextVersion(state)`, `preparedAt = now()`; `preparedProposition` unchanged; no model, no Proposales. `conversation` is parsed (absent → empty) and returned **unchanged**: a manual edit is not a conversational turn; the model sees its effect through `current_proposition` on the next run.
6. `services/revise-proposition.ts`: strict input `{ state, instruction: boundedText(MAX_INSTRUCTION_CHARS), conversation? }`; parse state and conversation (absent → empty); `turnId = deps.newTurnId()` for this instruction **before** the run; catalog read and company read (`getCompany`, one call — the currency comparison runs in `assembleProposition` on revision too); `runPreparationAgent({ mode: "revise", …, conversation, instruction: { turnId, text: instruction } })` — retrieval seeded from `state.currentProposition` (phase 11 task 8), messages from `buildPreparationMessages` with the history block and the instruction last; validate output (`proposales_content` refs ∈ the seeded-and-extended retrieval record; human refs must match existing human leaves' paths — a `human` leaf in `proposed` is accepted only if `current` has a `human` leaf at that path with the same value; **and (card 2 → A)** a `human` leaf with `ref: { turnId, quote }` is accepted only if `turnId` equals this instruction's id and `quote` occurs verbatim (after trim) in the instruction text — `validateAgentOutput` ctx `currentTurn: { turnId, text }`; any other `turnId`, a missing quote, or a quote not found → `model_output_invalid` at the leaf); `assembleProposition`; `mergeRevision`; both `preparedProposition` and `currentProposition` = merged (edits are consumed into the new prepared version); version +1; budget outcome as in phase 11. **Conversation out:** `appendTurns(conversation, [humanTurn({ turnId, at, text: instruction }), assistantTurn({ …kind: result.status, text: renderAssistantTurn(result, merged?), propositionVersion? })])` on every result including `failed`.
7. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | set title | `set_leaf { path: ["title"], value: "New" }` | `title` = `{ known: true, value: "New", source: "human", ref: { editTurn } }`; `version === inbound + 1` | — | M4, M11, §17A.9 |
| C1(b) | non-positive quantity rejected | `set_leaf { path: ["blocks","0","quantity"], value: 0 }` | `ValidationError` reason `domain_rule` with that path; the returned promise rejects (no state emitted) | — | §17A.9, §11.2 |
| C1(c) | recipient leaf | `set_leaf` on `["recipient","value","email"]` | `source === "human"` | — | M4 |
| C1(d) | unknown path | `["nope"]` | `ValidationError` | — | §17A.9 |
| C1(e) | value re-parsed | `set_leaf` on `["title"]` with a value over `MAX_TITLE_CHARS` | `ValidationError` at that path | — | §17A.16 |
| C2(a) | add block from a human search | `searchContentForHuman` result's first candidate → `add_block` | new block `contentId` = `{ value: candidate.variationId, source: "human", ref: { variationId } }`; `title` catalog-verbatim from the candidate; `quantity`/`optional` `{ known: false }` when not given | — | M4, crit 4 |
| C2(b) | remove block | `remove_block { index: 0 }` | `blocks.length` decremented | — | M4 |
| C2(c) | replace = remove + add | both ops in one `edits` array | one block, the human one | — | crit 4 |
| C2(d) | confirm empty draft | `confirm_empty_draft` on a proposition with no blocks | `emptyDraftConfirmation` = `{ known: true, value: true, source: "human", ref }` | — | crit 15, §17A.6 |
| C2(e) | unset recipient | | `recipient` = `{ known: false }` | — | §17A.5 |
| C3(a) | human title kept | current `title` human; script output changes it; `requestedOverrides: []` | merged `title` deep-equals the human leaf (value, source, ref); warning `human_value_kept` with `path ["title"]` | MUT-12-1 `merge-revision.ts` · case 2 · take the model leaf → C3(a) red | M11, crit 5 |
| C3(b) | human quantity kept | | same for `["blocks","0","quantity"]` | — | M11, M4 |
| C3(c) | identical proposal, no warning | model repeats the human value | no `human_value_kept` warning | — | §17A.9 |
| C4(a) | authorized override | `requestedOverrides: [{ path: ["title"], reason: "R" }]` and a new `inferred` title | merged `title` is the model's; warning `human_value_overridden` with `path`, `before`, `after`, `reason: "R"` | — | M11 |
| C4(b) | override of a non-human leaf | path names an `inferred` leaf | taken; no `human_value_*` warning | — | §17A.9 |
| C5(a) | cannot launder via override | override of `["recipient","value","email"]` with a leaf `source: "inferred"` | `failed`, `model_output_invalid` (schema) | — | M11, M10 |
| C5(b) | cannot claim `human` | proposed `human` leaf at a path where `current` has none | `failed`, `model_output_invalid` | MUT-12-2 `revise-proposition.ts` · human-ref check · drop it → C5(b) red | M11 (rule 7) |
| C5(c) | brief-sourced replacement allowed | override with `source: "brief", ref: { quote }` | taken; `human_value_overridden` warning | — | M11 |
| C5(d) | value stated in the instruction (card 2 → A) | instruction `"keep that one but make the quantity 3"`; the script reads the turn id from the `current_instruction` header and emits `blocks[0].quantity = { known: true, value: 3, source: "human", ref: { turnId: <that id>, quote: "quantity 3" } }` | accepted; `quantity.source === "human"`; `ref.turnId` equals the human turn appended to the returned conversation; `requestedOverrides` naming the path is still required when the current leaf is `human` (C4 rules unchanged) | — | M11, M10 (rule 7), §17A.4 (FB-2) |
| C5(e) | quote must be in this instruction | same output with `quote: "quantity 5"`; and with the `turnId` of an earlier human turn from the history and a quote found there | both → `failed`, `model_output_invalid`, issue path `["blocks","0","quantity"]` | MUT-12-4 `validate-agent-output.ts` · drop the quote-in-current-turn check → C5(e) red | M10 (rule 7), §17A.17 item 6 |
| C5(f) | history cannot source a value | a prior human turn says `"quantity 7"`; the instruction says `"looks fine"`; script emits quantity 7 with `ref.turnId` of that prior turn | `failed`, `model_output_invalid` (only the current turn resolves) | — | §17A.17 item 6, §6.9 |
| C6(a) | both paths yield the shape | outputs of `editProposition` and `reviseProposition` | both parse `propositionSchema` | — | §17A.9, §11.2 |
| C6(b) | version from the state | inbound version 3 | edit → 4; revise → 4; a `version` key in the edits input → `ValidationError` (strict) | — | §17A.2 |
| C6(c) | merge is pure and total | `mergeRevision(a, b, o)` twice | deep-equal; the module has no I/O imports (source read); `mergeRevision`, `applyEdits`, `assembleProposition` have no `conversation` parameter (`expectTypeOf`) | — | §17A.9 |
| C6(d) | prepared vs current after edit; conversation untouched | `editProposition({ state, edits, conversation: conversationWith(3) })` | `preparedProposition` unchanged; `currentProposition` edited; returned `conversation` deep-equals the inbound (no turn appended) | — | §17A.3, §17A.10, §17A.17 |
| C6(e) | prepared vs current after revise | | both equal the merged proposition | — | §17A.3 |
| C7(a) | "use the second one" resolves to the alternative | state with `propositionWithAlternatives()` (block 0 = `A`, alternatives `[B, C]`) as both propositions; `conversation` = one assistant turn rendered from it; `instruction: "use the second one"`; script `selectSecondAlternative` (final output only, **no tool call**, block 0 `contentId` = `C`, `source: "proposales_content"`, `ref.variationId: C`) | `status === "proposition"`; `blocks[0].contentId.value === C` with `source === "proposales_content"`; `blocks[0].title.value` equals the catalog item `C`'s title (catalog verbatim, from the live catalog read); `fake.calls` = exactly `[listContent, getCompany]` in any order, no other op; returned `conversation.turns` ends with `[human "use the second one", assistant { kind: "proposition", propositionVersion: 2 }]` | MUT-12-3 `preparation.agent.ts` · retrieval start · `emptyRetrievalRecord()` regardless of the proposition → C7(a) red (`model_output_invalid`) | M19, §17A.8, §17A.17 |
| C7(b) | "go back to the previous one" across two turns | continue from C7(a)'s returned state and conversation; `instruction: "actually go back to the previous one"`; script selects `A` | `blocks[0].contentId.value === A`; `ai.calls[0].messages` contain one `conversation_history` block whose text includes, in order, the C7(a) assistant turn, the human turn `use the second one`, and the assistant turn for version 2 — and a final `current_instruction` block with the new text, absent from the history block | — | M19, §17A.17 |
| C7(c) | a reference to something never presented nor read | same setup as C7(a); script selects `E` (in the catalog, not in the proposition, no tool call) | `failed`, `model_output_invalid`, issue path `["blocks","0","contentId"]`; with a preceding `get_content(E)` tool call in the script → accepted (the read brings it into the record) | — | §17A.8, §17A.4, M10 (rule 7) |
| C7(d) | window through the service | `conversation: fullConversation()` + any revise | returned `turns.length === MAX_CONVERSATION_TURNS`; `omittedTurns === 2`; the last two are this turn's human and assistant turns | — | §17A.17 (bounded) |
| C7(e) | failed turns are still recorded | script `keepCallingTools` | `failed`; returned conversation ends with `[human instruction, assistant { kind: "failed" }]`; state unchanged | — | §17A.17, M15 |
| C8(a) | revision is read-only | after `reviseProposition` | `fake.writes === 0`; the run used `PREPARATION_TOOLS` (identity assertion on the tools passed to `run`) | — | M3 |
| C8(b) | revision budget | script `keepCallingTools` with all ask items supplied | `failed`, `budget_exhausted`; no proposition; `run.usage` present | — | M15 |

Criteria: 8 (C1–C8), 33 rows (a table line is one row; a lettered span counts its letters). Named mutations: 4.

## Notes

- **Carried from phase 7 (review round 1, N2) — an accepted MVP limit, with its reachability argument, so it is not re-derived.** `compareVariationIds` compares `Number(a) - Number(b)` whenever both parse finite, so `"1"`, `"01"`, `"1.0"` and `"1e0"` compare equal and the sort falls back to arrival order — the §17A.8 vendor-list-order leak inside the tie-break written to prevent it. Unreachable on the shipped path: `src/lib/proposales/mappers.ts:65` emits `String(wire.variation_id)` over a `z.number().int()`. Nothing structural holds it — `contentCandidateSchema.variationId` is only `z.string().min(1)` — so this phase's cross-turn `variationId` references should not widen that surface without revisiting the limit.

- The path → schema resolver for `set_leaf` is small: walk `propositionSchema.shape` by segments, unwrapping `sourcedOrAbsent` and array element schemas. Test it through C1(e), not separately (rule 4).
- **Scripts for C7 are data** (rule 5): `selectSecondAlternative` and `selectPrevious` return fixed final outputs; the test asserts the *validator and retrieval record* accept or refuse them. Whether a live model actually reads "the second one" as `C` is a live-eval question (phase 15 C3 adds the scenario).
- Projection gate: mandatory (rank 9).

## Review log

*(append-only)*
