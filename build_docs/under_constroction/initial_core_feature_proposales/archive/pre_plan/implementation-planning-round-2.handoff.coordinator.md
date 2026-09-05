---
plan: none — planning amendment across the master plan and phase plans 9–15
role: coordinator
round: 2
date: 2026-09-05
state: PLANNED (amended)
verdict: PLAN SET AMENDED FOR MULTI-TURN CONTINUITY — cards 1 and 2 answered by the owner (both A) and folded; one intention fold-back (FB-2, material addition) remains for ratification
actor: implementation-planner (Claude), on the owner's direction of 2026-09-05
---

# Handoff — planning round 2: multi-turn conversational continuity

## Summary

The owner asked for the plan to make multi-turn conversational continuity explicit around phase 10 without a database, persistence, authentication, a generic chat platform, or changes to the generic runtime. This round inserted one pure phase (**phase 10 — conversation context, retrieval record, agent message assembly**), renumbered the former phases 10–14 to 11–15, and patched the service, approval, and closeout phases in place. The design: two caller-held objects for the page's lifetime — `ProposalWorkflowState` (authority) and `ConversationContext` (linguistic context) — with the latest human turn passed separately, assistant turns rendered by the application, prompts receiving both as labeled untrusted blocks, and every conversational reference resolved to a content identity in the run's retrieval record before it can enter the state. Phase 9 is unchanged. Both owner cards were answered the same day and are folded (§7); what remains for the owner is the ratification of the intention text this design needs (§1 plus the §7 addendum).

## ⚠ OWNER DECISIONS REQUIRED (0)

None outstanding. Both cards were answered on 2026-09-05 (§7). The card below is kept as the record of what was asked.

### Card 2 (answered: A)

**Card 2 — May a value the human states in a revision instruction count as human-provided?**
*Question.* When the human tells the agent "keep that one but make the quantity 3", may the app record 3 as human-provided, tagged with the exact words it came from, or must quantities and other consequential values only enter through a manual edit or a clarification answer?
*Story.* Today's rule admits human-provided values only from an answer or an edit, so this instruction cannot be honored by a revision: the agent would keep the old quantity and warn. The conversation work makes this visible because such instructions are exactly what multi-turn chat invites.
*Branches.* A — admit it: the value carries the turn it came from and a verbatim quote, both checked by the server, both visible to the reviewer. B — keep the rule: such changes need a manual edit; the agent surfaces a warning instead.
*Recommendation.* A.
*On silence.* One revision row waits (phase 12 C5(d)); everything else proceeds.

**Card 1 (round 1): answered A** — read the company currency from Proposales during preparation. Folded in §7.

## 1. What the coordinator folds upstream — FB-2 (material addition; owner ratification)

The intention is silent on natural-language continuity between turns; the owner decided it on 2026-09-05. No ratified text is contradicted (checked: §5.2, §8.2, §8.3, §11.2, §12.2, §16.2, §17A.3, §17A.4, §17A.8, §17A.9, §17A.13; contracts 05 §74, 06 §7, 08 §6–§10, 09 §1, 10 §6, 12 anti-patterns). Proposed text, for the mechanism-inventory delta path (as round 7); phase 10's gate reads "FB-2 folded":

**§5.2, new bullet after the first:**
> Beside the workflow state, the caller round-trips a **conversation context**: a bounded window of the human's free-text instructions and the application's rendered summaries of each result, held for the page's lifetime only and lost on reload by design. It exists so the human can refer to earlier turns ("use the second one"). It is never authority: every resolved reference is written into the workflow state with provenance, and approval and execution never read it.

**§7, new row:**
> | **Conversation Context** | Bounded, caller-held record of prior human instructions and application-rendered assistant summaries for one workflow; linguistic continuity for resolving references. Not persisted. | human (instructions); system (summaries) | never an input to approval or execution; never a provenance source |

**§17A.17 Conversation context** (deepens §5.2, §11.2, §12.2; ledger **M19**; serves M4, M10):
> 1. **Two objects, never merged.** `ConversationContext` is a sibling of the workflow state on every turn's input and result, owned by the feature's schemas; neither schema admits the other. Strict, JSON-serializable, no signature (§17A.3's reasoning applies).
> 2. **Contents.** Human turns are free-text instructions only; clarification answers (§8.2) and manual edits (§11.2) are structured data and never become turns. Assistant turns are rendered by the application from the validated result — ids, catalog-verbatim titles, enum kinds, the rationale — never model-authored text, never warning or assumption free text.
> 3. **Bounded.** A named turn cap and a named per-turn text cap at the schema; beyond the cap the oldest turns are dropped and counted, never the newest.
> 4. **The latest human turn is distinct.** It is passed separately from the context, rendered as the final labeled block of the run, and appended to the returned context after the run together with the assistant turn. The inbound context never contains it.
> 5. **Prompts.** History and the current instruction reach the model only as labeled untrusted data blocks (10 §6); nothing user-provided enters the system prompt.
> 6. **Resolution, not authority.** A conversational reference becomes a fact only as a content identity present in the run's retrieval record — the current proposition's blocks and alternatives plus this run's tool results — with `proposales_content` provenance; anything else is `model_output_invalid`. Conversation text is not a provenance source. (Values stated in an instruction: owner card 2.)
> 7. **Approval and execution have no conversation parameter**; the envelope is strict, so a caller cannot smuggle it in. Named mutations: seed the retrieval record empty → the "use the second one" row reddens; append the instruction into the history block → the separation row reddens; skip the window trim → the cap row reddens.

**Ledger M19:** *A reference in a later human turn to an option the assistant presented earlier resolves to that option's content identity in the proposition with `proposales_content` provenance, and approval and execution operate from the workflow state alone.*

**§23 round 8:** owner decision (2026-09-05) to add multi-turn continuity; this text; card 2 raised.

Until folded, phase 10's rows trace to "§17A.17 (proposed)" and "M19 (proposed)"; master plan §7.2 marks M19 accordingly.

## 2. What changed, file by file

| Artifact | Change |
|---|---|
| `plans/phase-10-conversation-context.md` | **new** — 6 criteria, 25 rows, 5 named mutations: schema (strict, capped, version-bound-to-kind), `appendTurns` window, `renderAssistantTurn` (deterministic, ids in order, cannot leak free text), `buildPreparationMessages` (fixed block order, instruction last and separate, nothing in `system`, our message shape), `RetrievalRecord` seed/extend, state ⟂ conversation |
| `plans/phase-11-prepare-and-clarify.md` (was 10) | services accept and return `conversation`; assistant turn appended; answers never a human turn (C3(c) with mutation); prompt receives no user text; C1(d) strict conversation parse with mutation; `runPreparationAgent` builds messages through phase 10 and seeds the retrieval record; gate now phase 10 |
| `plans/phase-12-edit-and-revise.md` (was 11) | `reviseProposition` takes `instruction` + `conversation`, seeds retrieval from the current proposition, appends both turns on every result; `editProposition` echoes the conversation; C6 regrouped (shape, version, purity, prepared/current); **C7 new: cross-turn references** ("use the second one" resolves without a tool call — MUT-12-3 seed removed → red; "go back to the previous one" across two turns with the history block asserted; an unpresented id fails unless read in this run; window through the service; failed turns recorded); C5(d) written against card 2, un-held after the answer (§7) |
| `plans/phase-13-approval-validation.md` (was 12) | C7(c): an envelope with a `conversation` key is a `ValidationError`; `validateApproval` has no such parameter; no conversation imports |
| `plans/phase-14-execution.md` (was 13) | renumbered only |
| `plans/phase-15-closeout.md` (was 14) | whole-workflow proof adds a "use the second one" revision whose id reaches the create request; live evals add the cross-turn scenario; feature README documents the conversation context |
| `plans/phase-09-agent-runtime.md` | scope note only: conversation, retrieval record, message assembly are phase 10; the runtime stays generic. **No criterion, task, or signature changed.** |
| `master-plan.md` | header; §1; §3 projection list; §4 tracker (15 rows, counts re-derived); §5 R13 (caller-held conversation context), R14 (seeded retrieval record), R15 (`ProposalWorkflowState` naming), round-2 conflicts line; §6.1 module map (+`schemas/conversation.ts`, `domain/conversation.ts`, `domain/retrieval-record.ts`, `agent/build-messages.ts`, two fixtures); §6.4 (`conversationTurnSchema`, `conversationContextSchema`, `TurnResult.conversation`, `RetrievalRecord`); §6.5 (`MAX_CONVERSATION_TURNS`, `MAX_TURN_TEXT_CHARS`); §6.6 (service signatures with `conversation?`, `newTurnId` dep, the new pure functions, `runPreparationAgent`); §6.7 fixtures; **§6.9 new** (the two objects, the turn flow, the rules, the forward principle); §7.1 order; §7.2–§7.3 regenerated; §9 rules 4, 11, 12; §11 gate log and register row 5; §12 card 2, FB-2 |
| `README.md` | phase count |
| identifiers | `WorkflowState` → `ProposalWorkflowState` (type/schema/parse function) in the master plan and phases 6, 11, 13; file name, byte constant, and reason code unchanged (R15) |

Derived totals (script, master plan §4): **15 phases, 101 criteria, 467 rows, 69 named mutations**; every M1–M18 served, M19 (proposed) served by 10.C3, 10.C5, 12.C7, 15.C1; all 23 §22 criteria mapped.

## 3. Answers to the twelve questions

1. **Where the contract lives:** `src/features/proposal-preparation/schemas/conversation.ts` — feature-owned, runtime-neutral Zod. Not in `src/lib/agent` (one consumer; 03 §3) and not in phase 9.
2. **Owner:** the caller, for the page's lifetime; the feature's services are the only writers (append); the server keeps nothing (08 §9, §5.2).
3. **How services receive it:** `conversation?: unknown` beside `state`, parsed strictly before any model call; returned on `TurnResult.conversation`. Prepare, answer, revise append; edit echoes; approval and execution have no such input.
4. **How messages are built:** `buildPreparationMessages` (phase 10) — one labeled `user` block each, in a fixed order: brief · catalog languages · clarification answers · current proposition · conversation history · current instruction. `runPreparationAgent` passes the result to `run()` unchanged.
5. **Latest turn vs prior context:** the instruction is a separate parameter and the final block; the inbound context is prior-only; the service appends the human turn after the run. Proven structurally (10.C4(c) with mutation) and through the service (12.C7(b)).
6. **Assistant turns:** retained, application-rendered (`renderAssistantTurn`): ids in presentation order, titles, kinds, the rationale; capped; never free text from warnings or assumptions (10.C3(e) plants a leak sentinel).
7. **Bounding:** `MAX_CONVERSATION_TURNS` and `MAX_TURN_TEXT_CHARS` at the schema; `appendTurns` drops the oldest and counts them (`omittedTurns`); the history block states the omission. No transcript grows without bound (10.C2(b) with mutation, 12.C7(d)).
8. **Labeling:** every turn inside the `conversation_history` block with `--- turn n · role · id ---` headers; the instruction in its own block; `system` never contains user text (10.C4(d) with mutation).
9. **Provenance:** the conversation is never a source. References resolve to ids in the retrieval record (seed ∪ reads) with `proposales_content` provenance; an unpresented, unread id fails (12.C7(c)). Values stated in the current instruction resolve as `human` by turn id and verbatim quote (card 2 → A, §7); history never sources a value.
10. **Phase 11 (now 12) consumption:** same mechanism; it is where the cross-turn rows live because they need `reviseProposition`.
11. **Tests:** 10.C1–C6 (pure), 11.C1(d), 11.C2(c), 11.C3(c), 12.C6(d), 12.C7(a–e), 13.C7(c), 15.C1(a), 15.C3 (live cross-turn scenario). Named mutations for the seed, the instruction-in-history, the trim, the leak, the system-prompt concatenation, the answers-as-turn.
12. **Contradictions:** none in contracts. One intention gap (FB-2) and one latent gap in the ratified provenance rule (card 2), both surfaced, neither silently changed.

## 4. Findings

**F10 — the revise run's retrieval rule was under-specified** (independent of the conversation work, made visible by it). Phase 11's validator required every `proposales_content` ref to come from *this run's* tool results, so a revision that kept the current blocks would have failed unless the model re-searched each block. Resolved as R14 (seed from the current proposition); the seed is also what lets "the second one" resolve without a tool call, while an id never presented still needs a read.

**F11 — the ratified `human` provenance definition cannot honor a value stated in an instruction** (§8.3: "supplied through a clarification answer or a manual edit"). Card 2.

**F12 — `WorkflowState` renamed to `ProposalWorkflowState`** (R15). Material, not cosmetic: the caller now holds two typed objects and the owner's forward principle adds more. Zero code exists, so the cost is the registry edit already made.

**F13 — the intention's §12.2 sentence "the model receives labeled data (brief, clarification answers, tool results)" now also covers conversation history and the current instruction**; §17A.17 item 5 says so. No contradiction.

## 5. Readiness

- **Phases 1–9:** ready to dispatch, unchanged in substance (phase 9's scope note only).
- **Phase 10:** ready once FB-2 is folded (or the coordinator's prompt dispatches against the proposed text and records that).
- **Phase 11:** ready; C7 un-held (card 1 → A).
- **Phase 12:** ready; C5(d–f) un-held (card 2 → A).
- **Phases 13–15:** ready.
- Coordinator lint to re-run before phase 1: references resolve, counts derived (script in the round-1 handoff §7 — unchanged, re-run this round), ≤ 8 criteria per phase (max is 8), trace cells resolve (phase 10 cites the proposed §17A.17/M19 by design).

## 6. Write perimeter (full; `git status --porcelain` at session end — the plan folder is untracked, so listed by hand)

| Path | Change |
|---|---|
| `plans/phase-10-conversation-context.md` | created |
| `plans/phase-11-prepare-and-clarify.md` | renamed from `phase-10-…`; amended |
| `plans/phase-12-edit-and-revise.md` | renamed from `phase-11-…`; amended |
| `plans/phase-13-approval-validation.md` | renamed from `phase-12-…`; one row added; renumbered references |
| `plans/phase-14-execution.md` | renamed from `phase-13-…`; renumbered references only |
| `plans/phase-15-closeout.md` | renamed from `phase-14-…`; amended |
| `plans/phase-09-agent-runtime.md` | one scope sentence |
| `plans/phase-03-proposales-transport-and-content.md` | card 1 → A: `getCompany` operation, wire schema, mapper, fake option, fixture; criterion C6 (4 rows, MUT-03-4) |
| `plans/phase-05-proposition-and-provenance.md` | card 2 → A: `refSchema.turnId` row C1(e) |
| `plans/phase-01, 02, 04, 06, 07, 08` | renumbered cross-references only (phase 6 also carries the `ProposalWorkflowState` rename) |
| `master-plan.md` | amended as listed in §2 |
| `README.md` | phase count |
| `handoffs/coordinator/implementation-planning-round-2.coordinator.md` | created (this file) |

**Not touched:** the intention, the evidence doc, the round-1 handoff (historical; its phase numbers are superseded by this file and the master plan), any code, `package.json`, `.env.example`, git (nothing committed). The three files another actor modified during round 1 (F9) are still modified on disk and still not mine.

## 7. Owner decisions received (2026-09-05, after this handoff was first written) and how they were folded

**Card 1 → A.** The company currency is read from `GET /v3/companies` (the endpoint lists the user's companies; the client selects the configured id and maps `currency` and `tax_mode`). Folded: phase 3 gains `getCompany` (task 3–6 additions, C6 with MUT-03-4); master plan §6.4 `CompanyInfo` and the six-method `ProposalesClient`, §6.7 fake `company` option, §6.6 `assembleProposition` takes `companyCurrency` and owns the `currency_mismatch` warning (the agent-output schema no longer admits that kind); phase 11 C7 is four live rows (mismatch with MUT-11-7, same currency, exactly one read and the currency never in the prompt, the model cannot emit the kind); phase 12 task 6 reads the company on revision too. **Capture task for the coordinator:** evidence doc §2 lists `GET /v3/companies` as "not needed" — now used; §8.1 already records the observed keys.

**Card 2 → A.** A value stated in the **current** revision instruction may be recorded as `human` with `ref: { turnId, quote }`; the server requires this instruction's turn id and the quote verbatim in it; prior turns never resolve. Folded: phase 5 C1(e) (`refSchema.turnId`, requires `quote`); phase 10 task 4 and C4(c) (`instruction: { turnId, text }`, the `current_instruction` header carries the id the model cites); phase 12 task 6 (turn id generated before the run; validator ctx `currentTurn`) and C5(d–f) with MUT-12-4; master plan §6.4 `refSchema`, §6.6 `validateAgentOutput`, §6.9 bullet, rules 7 and 11.

**FB-2 addendum (intention text the two answers require; ratify with §1's text):**

- **§12.1 operation list:** add "get company (currency and tax mode; used only to warn when a stated currency differs from the company's, never written)".
- **§8.3 provenance table, `human` row:** "supplied through a clarification answer, a manual edit, or — with a reference to the turn and a verbatim quote — the human's current revision instruction".
- **§17A.4, new paragraph after "Three source policies":** "A `human` leaf's `ref` names exactly one of: the answered `questionId` (clarification), the `editTurn` (manual edit), or `{ turnId, quote }` where `turnId` is the current revision instruction's turn and `quote` occurs verbatim in it. The validator resolves each form; an unresolvable `human` ref is `model_output_invalid`. Prior conversation turns are not a valid target: history informs, it never sources."
- **§17A.17 item 6, replace the last sentence:** "Prior conversation text is not a provenance source. A value the human states in the current instruction may become a `human` leaf only through `ref: { turnId, quote }` (§17A.4), so the reviewer sees the exact words it came from."
- **§9.2 Warnings row:** unchanged in substance; the company currency now comes from the company read.

**Derived totals after the fold** (master plan §4): 15 phases, 102 criteria, 477 rows, 71 named mutations; no held rows remain.

## 8. Write perimeter addendum (this fold)

`plans/phase-03-…`, `phase-05-…`, `phase-10-…`, `phase-11-…`, `phase-12-…`, `master-plan.md`, this handoff. Still untouched: intention, evidence doc, code, git.
