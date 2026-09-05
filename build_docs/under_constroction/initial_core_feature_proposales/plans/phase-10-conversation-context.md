---
plan: 10
phase: Conversation context, retrieval record, agent message assembly
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 2 (multi-turn continuity refactor)
---

# Phase 10 — Conversation context, retrieval record, agent message assembly

## Goal

Create the three pure building blocks the service phases consume so that a human can refer back to earlier turns ("use the second one", "go back to the previous option") and the agent can resolve the reference against structured facts:

1. `ConversationContext` — the caller-held, page-lifetime, bounded record of prior human instructions and application-rendered assistant summaries (`schemas/conversation.ts`, `domain/conversation.ts`). Linguistic continuity only; never authority.
2. `RetrievalRecord` — the per-run set of content identities the model may reference: seeded from the current proposition's blocks and alternatives, extended by this run's tool results (`domain/retrieval-record.ts`). This is what turns "the second one" into a `variationId` the validator can check.
3. `buildPreparationMessages` — the one place the agent's messages are assembled: labeled untrusted blocks in a fixed order, prior conversation in one history block, the latest human turn in its own final block, nothing user-provided in the system prompt (`agent/build-messages.ts`).

No service, no model call, no I/O in this phase. Phase 9's runtime is untouched: it keeps receiving `initialMessages` from callers.

**Not in this phase:** the services that append turns (phase 11, 12); the cross-turn reference criteria that need `reviseProposition` (phase 12 C7); prompts (phase 11).

## Read first

1. Master plan §5 (R13–R15), §6.4 (`conversationTurnSchema`, `conversationContextSchema`, `RetrievalRecord`, `AgentMessage`), §6.5 (`MAX_CONVERSATION_TURNS`, `MAX_TURN_TEXT_CHARS`), §6.6 (`emptyConversation`, `appendTurns`, `renderAssistantTurn`, `emptyRetrievalRecord`, `seedRetrievalRecord`, `extendRetrievalRecord`, `buildPreparationMessages`, `labeledBlock`), §6.9 (the two caller-held objects and the forward principle), §9 rules 3, 11, 12, §12 (FB-2 — the proposed intention §17A.17 this phase traces to).
2. Intention §5.2 (turn model: the server keeps nothing), §17A.3 (the caller-held state pattern: strict, bounded, serializable), §17A.4 (provenance is structural; conversation is not a source), §17A.8 (content identity comes from a read tool), §17A.16 (text bounds), §12.2 (labeled data), §8.2 (answers are data, never instructions).
3. Contracts: `08-agent-architecture.md` §7 (user text delimited and labeled), §9 (turns, serializable state); `10-security-and-trust-boundaries.md` §6; `06-data-contracts-and-validation.md` §3, §7 (our representation, never the provider's message shape); `09-database-and-persistence.md` §1; `12-anti-patterns.md` "Storing every LLM conversation … by default".
4. Phases 5, 6, 8, 9 Review logs.

## Dependencies (gate)

Phase 9 `APPROVED`. **FB-2 folded — DONE 2026-09-05** (intention §23 round 8; §17A.17 and M19 are in the intention, ratified by the owner, not proposed). Original wording: intention §17A.17 (conversation context) and ledger M19 ratified by the owner, or the coordinator's prompt records that dispatch proceeds against the proposed text (master plan §12).

## Files expected to change

`src/features/proposal-preparation/schemas/conversation.ts`, `conversation.test.ts` · `server/domain/conversation.ts`, `conversation.test.ts` · `server/domain/retrieval-record.ts`, `retrieval-record.test.ts` · `server/agent/build-messages.ts`, `build-messages.test.ts` · `fixtures/conversations.ts`, `fixtures/propositions.ts` — 10 new files.

## Implementation tasks (ordered)

1. `schemas/conversation.ts`: `conversationTurnSchema` = discriminated union on `role`: `{ role: "human", turnId: uuidV4, at: isoTimestamp, text: boundedText(MAX_TURN_TEXT_CHARS) }` | `{ role: "assistant", turnId, at, kind: "clarification" | "proposition" | "failed", text, propositionVersion?: int ≥ 1 }` (`propositionVersion` required when `kind = "proposition"`, forbidden otherwise — refinement with the path); both variants strict. `conversationContextSchema = { turns: array max MAX_CONVERSATION_TURNS, omittedTurns: int ≥ 0 }.strict()`. Runtime-neutral; imports only zod, `@/lib/values/*`, `schemas/shared.ts`.
2. `domain/conversation.ts`: `emptyConversation()`; `appendTurns(context, turns)` — pure: returns a new context with `turns` appended in order, then drops the **oldest** turns until `turns.length ≤ MAX_CONVERSATION_TURNS`, adding one to `omittedTurns` per dropped turn; never mutates its input. `humanTurn({ turnId, at, text })` and `assistantTurn({ turnId, at, kind, text, propositionVersion? })` constructors. `renderAssistantTurn(result: DomainResult, proposition?: Proposition): string` — deterministic text for the model's later reference: for `proposition`: `"Proposed version <n>."`, then one line per block in order: `"Block <i>: <title> (content <variationId>)"`, then per block the alternatives in order: `"  alternative <j>: <title> (content <variationId>, <matchStrength>)"`, then `"Warnings: <kinds, sorted>"`, `"Unresolved: <itemKeys, sorted>"`, then the `agentRationale` value when known; for `clarification`: `"Asked <k> question(s):"` then `"  [<questionId>] <itemKey>: <text>"`; for `failed`: `"Preparation failed: <reason>"`. Only ids, titles (catalog verbatim), enum kinds, and the rationale appear; **warning texts, assumption notes, and any URL-bearing field are never rendered**. The result is cut to `MAX_TURN_TEXT_CHARS` with a trailing `" […]"` marker when cut.
3. `domain/retrieval-record.ts`: `RetrievalRecord = { candidates: ReadonlyMap<variationId, RetrievedCandidate> }` where `RetrievedCandidate = { variationId, productId, title, matchStrength, score }`; `emptyRetrievalRecord()`; `seedRetrievalRecord(proposition)` — every block's `contentId.value` (with the block's `productId`, `title.value`, and `matchStrength: "strong", score: SCORE_MAX` when the block was human-added, else the block's recorded values — see note) and every `alternatives[j]` entry; `extendRetrievalRecord(record, candidates: ContentCandidate[])` — adds or overwrites by id; `hasRetrieved(record, variationId)`. Pure, no I/O.
4. `agent/build-messages.ts`: `labeledBlock(name, text)` → a fenced, labeled block (`<<<name (untrusted data)\n…\n>>>`); `buildPreparationMessages({ brief, catalogLanguages, language, answers?, currentProposition?, conversation, instruction?: { turnId, text } }): AgentMessage[]` — every message is `role: "user"` carrying exactly one labeled block, in this order: `brief` · `catalog_languages` (and `proposal_language` when resolved) · `clarification_answers` (when given: `[<questionId>] <itemKey>: <answer text | skipped>`) · `current_proposition` (when given: the JSON of the proposition) · `conversation_history` (when `conversation.turns.length > 0`: one block; inside it every turn rendered as `--- turn <n> · <role> · <turnId> ---` followed by its text; the header line states `omittedTurns` when > 0) · `current_instruction` (when given, always **last**; its header line carries the turn id: `current_instruction · turn <turnId>` — the id the model must cite in `ref.turnId` when it records a value the instruction states, card 2 → A). The function never reads the system prompt and never receives it; the history block never contains the current instruction. Imports: `@/lib/ai` types and feature schemas only — nothing from `ai`.
5. `fixtures/conversations.ts`: `conversationWith(n)` (n alternating turns with deterministic ids/timestamps), `fullConversation()` (exactly `MAX_CONVERSATION_TURNS` turns). `fixtures/propositions.ts`: `propositionWithAlternatives()` — one block `A` with alternatives `[B, C]` in that order, a second block `D` with none; ids from `FIXTURE_CATALOG`; `maximalConformingProposition()` (`MAX_BLOCKS` blocks × `MAX_ALTERNATIVES_PER_BLOCK` alternatives, every text at cap).
6. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | valid context | `conversationWith(4)` | parses; JSON round trip deep-equals | — | §17A.17, §17A.3 |
| C1(b) | unknown key | `{ ...ctx, foo: 1 }` and `{ ...turn, foo: 1 }` | fails at `["foo"]` / `["turns","0","foo"]` | — | §17A.3, 06 §3 |
| C1(c) | turn cap | `MAX_CONVERSATION_TURNS + 1` turns | fails at `["turns"]`; exactly the cap parses | — | §17A.17, §17A.16 |
| C1(d) | text cap | a turn text of `MAX_TURN_TEXT_CHARS + 1` | fails at `["turns","0","text"]`; `"  x  "` parses to `"x"` | — | §17A.16 |
| C1(e) | ids and timestamps | uppercase `turnId`; `at` without milliseconds | fails at the respective path | — | §17A.2 (form), §17A.16 |
| C1(f) | version bound to kind | assistant `kind: "proposition"` without `propositionVersion`; assistant `kind: "clarification"` with one; human turn with one | each fails at `["turns","0","propositionVersion"]` | MUT-10-1 `conversation.ts` (schema) · version refinement · drop it → C1(f) red | §17A.17 |
| C2(a) | append within cap | `conversationWith(MAX − 2)` + 2 turns | `turns.length === MAX`; `omittedTurns === 0`; order preserved; the two new turns are last | — | §17A.17, 08 §9 |
| C2(b) | window drops the oldest | `fullConversation()` + 2 turns | `turns.length === MAX`; the first two original turns absent; `omittedTurns === 2`; newest last | MUT-10-2 `conversation.ts` · `appendTurns` · skip the trim → C2(b) red (length `MAX + 2`) | §17A.17 (bounded), §17A.3 (size bound) |
| C2(c) | pure | same call twice; `Object.isFrozen`-style check on the input via a deep-equal snapshot | results deep-equal; input unchanged | — | §17A.17 |
| C2(d) | absent means empty | `emptyConversation()` | `{ turns: [], omittedTurns: 0 }`; parses | — | §17A.17 |
| C3(a) | proposition rendered with ids in order | `propositionWithAlternatives()` v3 | text contains, in this order, `A`, `B`, `C`, `D` as `content <id>`; `"Proposed version 3."` first line; `alternative 1` precedes `alternative 2` | — | M19, §17A.8 |
| C3(b) | clarification rendered | a clarification result with two questions | both `questionId`s and `itemKey`s present, in order | — | §17A.17, §17A.7 |
| C3(c) | failed rendered | `failed` `budget_exhausted` | `"Preparation failed: budget_exhausted"` | — | §17A.17 |
| C3(d) | bounded and deterministic | `maximalConformingProposition()` | `text.length ≤ MAX_TURN_TEXT_CHARS`; ends with `" […]"`; two calls equal | MUT-10-3 `conversation.ts` · `renderAssistantTurn` · drop the cut → C3(d) red | §17A.16 |
| C3(e) | the renderer cannot leak free text | a proposition whose `warnings[0].text` and `assumptions[0].note` contain `https://evil.test/LEAK` | `"LEAK"` absent from the text; `"Warnings: "` line lists the kind | — | §9 rule 3, 10 §6 (rule 15 proof: the sentinel is present in the input) |
| C4(a) | block order and presence | all inputs given | six `user` messages, labels in the fixed order; with `answers`, `currentProposition`, `conversation` absent/empty and no `instruction` → exactly two messages (`brief`, `catalog_languages`) | — | §17A.17, 08 §7 |
| C4(b) | history rendering | `conversationWith(3)` with `omittedTurns: 2` | one `conversation_history` block; three `--- turn n · role · id ---` headers in order; header states `2 earlier turns omitted` | — | §17A.17 |
| C4(c) | latest turn is separate | `instruction: { turnId: T, text: "INSTR-SENTINEL" }` with `conversationWith(2)` | the last message is `current_instruction` containing the sentinel and the header `turn T`; the `conversation_history` block contains neither | MUT-10-4 `build-messages.ts` · append the instruction as a history turn → C4(c) red | §17A.17 (latest turn distinguished) |
| C4(d) | untrusted, labeled, never in system | brief `BRIEF-SENTINEL`, a human turn `TURN-SENTINEL`, instruction `INSTR-SENTINEL`; `preparationSystemPromptV1(...)` rendered beside it (phase 11 supplies the prompt; until then a stub returning a constant) | every sentinel appears **only** inside a `labeledBlock` (regex over each message: sentinel is between `<<<` and `>>>`); the system string contains none | MUT-10-5 `build-messages.ts` · emit the brief as a bare message without the label → C4(d) red | 10 §6, 08 §7, §12.2 |
| C4(e) | our shape, not the provider's | source read of `build-messages.ts` | imports nothing from `"ai"` or `@ai-sdk/*`; every message satisfies `AgentMessage` (`expectTypeOf`) | — | 06 §7, 08 §8 |
| C5(a) | seed carries the proposition's identities | `seedRetrievalRecord(propositionWithAlternatives())` | `hasRetrieved` true for `A`, `B`, `C`, `D`; the entry for `B` carries the alternative's `productId`, `title`, `matchStrength`, `score` | — | M19, §17A.8 |
| C5(b) | extend adds and overwrites | `extendRetrievalRecord(seed, [candidate E, candidate B'])` | `E` present; `B` now carries `B'`'s score; input record unchanged (pure) | — | §17A.8 |
| C5(c) | empty record | `emptyRetrievalRecord()` | `hasRetrieved(_, A) === false`; `candidates.size === 0` | — | §17A.8 |
| C6(a) | conversation is not part of the state | `parseProposalWorkflowState({ ...validState(), conversation: emptyConversation() }, origin)` | `ValidationError` with an issue at `["conversation"]` | — | §17A.3 (strict), master plan §6.9 |
| C6(b) | state is not part of the conversation | `conversationContextSchema.safeParse({ ...emptyConversation(), state: validState() })` | fails at `["state"]` | — | §17A.17, 06 §3 |

Criteria: 6 (C1–C6), 25 rows (a table line is one row; a lettered span counts its letters). Named mutations: 5.

## Notes

- **Why the assistant turn is application-rendered, not model-authored:** the text exists so a later human turn can be resolved against *ids the application already validated*. A model-written summary could name a candidate that was never retrieved; the renderer cannot. The model's own words survive as the `agentRationale` value inside the rendered text.
- **Why the seed carries alternatives:** without it, a revision run that keeps the current blocks would have to re-search every one of them before the validator accepts its own output (phase 11's rule: every `proposales_content` ref must be in the run's retrieval record). Seeding from the current proposition is the same rule with the honest starting set; a reference to anything else still requires a read in this run.
- For human-added blocks (`contentId.source === "human"`), the proposition carries no strength; the seed records `strong`/`SCORE_MAX` because the human chose it — that value is display material in the record and is never written back to a proposition leaf.
- `renderAssistantTurn` is cut, not rejected, at the cap because it is application output; human turn text is rejected at the cap because it is input (phase 12 parses `instruction` with `MAX_INSTRUCTION_CHARS ≤ MAX_TURN_TEXT_CHARS`).
- `labeledBlock`'s delimiter is a constant in `build-messages.ts`; the prompt (phase 11) explains the delimiter to the model. A user text containing the delimiter is escaped (`>>>` → `> > >`) — C4(d)'s regex tolerates that.
- Projection gate: mandatory (new mechanism: caller-held context; rule 6).

## Review log

*(append-only)*
