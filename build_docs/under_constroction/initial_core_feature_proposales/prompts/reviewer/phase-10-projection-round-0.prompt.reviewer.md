---
plan: plans/phase-10-conversation-context.md
role: projection
round: 0
date: 2026-09-07
---

# Phase 10 projection round 0 — conversation context, retrieval record, message assembly

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/plan-projection.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy: classify the concerns, read
`architectural_contracts/01-implementation-contract-guide.md`, and read the applicable contracts.
The plan's "Read first" section already names them; add any it misses and say so.

**You write no code and run no tests.** You read the plan against the libraries, the repository and
the ratified intention, and you return a ledger of amendments the coordinator folds before an
implementer ever opens the phase.

## Gate

Check by content, and stop and say so if any is false.

1. The intention is `RATIFIED` and its §23 reaches round 18.
2. Master tracker rows 1–**9** are `APPROVED`; row 10 is `NOT_STARTED` and the phase-10 plan header
   says `PROJECTING`.
3. Master §9.1 contains rules **17 through 21**.
4. `src/lib/agent/` exists with `run.ts`, `define-tool.ts` and `types.ts` — phase 9 shipped.
5. The target files this phase creates do **not** exist:
   `src/features/proposal-preparation/schemas/conversation.ts`,
   `server/domain/conversation.ts`, `server/domain/retrieval-record.ts`,
   `server/agent/build-messages.ts`.
6. `npm test` is green at **31 files / 421 tests**. Record it; do not treat a different number as a
   defect without saying so.

## What phases 8 and 9 cost, and what you are being paid to prevent

Read the phase-8 and phase-9 Review logs before the table. The pattern that has cost this project
five sessions is not wrong code — it is **rows that cannot fail**:

- A phase-9 `run` that **discarded every tool result** passed all 22 of its original rows. The
  projection caught that; nobody else would have.
- The whole **outbound request** to the model — system prompt, history, tools, output schema — was
  deletable field by field with the suite green. Review caught that, one round later.
- `search_content` never proved it forwards the model's query, because a single fixture cannot
  distinguish *forwarding* from *hardcoding the string that fixture happens to use*.
- Phase 8 shipped nine such guards across three sessions, two of them modelling shapes the SDK
  never builds — which left a just-ratified failure reason unreachable while every test passed.

So the question to ask of every row in this table is: **what could the implementation return, or
fail to do, that would still satisfy this assertion?** If the answer is a constant, an empty
collection, a do-nothing, or the fixture's own shape, the row is the defect — amend it now, while
it costs a paragraph.

**§9.1 rules 17–21 are the checklist**, and three of them bite directly here:

- **Rule 19** — the request an outbound boundary sends is one surface, asserted whole. `C4`
  assembles the model's entire message list. Ask what `buildPreparationMessages` could omit and
  still pass.
- **Rule 15 and rule 2's companion** — a row asserting a *range*, a *substring*, or a *presence*
  asserts almost nothing. `C3`'s renderer produces prose; a `.toContain()` against it will match
  the renderer's own template.
- **Rule 18** — a fixture modelling anything outside this repository must be grounded in what that
  thing actually produces, and **an expected value must be printed, not reasoned**. This phase is
  pure domain code with no external dependency, so rule 18 binds mostly through its extension: any
  cell stating what Zod emits — an issue path, a refinement's error shape, a discriminated-union
  message — must be run, not inferred. Fix round 2 was blocked because a coordinator wrote
  `["answer"]` where the runtime produces `[]`.

## The specific things to decide

The table is **6 criteria / 25 rows / 5 named mutations** — a low mutation density for three pure
modules with this much branching. That ratio is a signal, not a verdict; test it.

1. **`renderAssistantTurn` (C3) is the highest-risk function in the phase.** It is deterministic
   prose built from structured facts, it is the model's only view of earlier turns, and task 2
   forbids warning texts, assumption notes and any URL-bearing field from appearing in it. C3(e)
   claims "the renderer cannot leak free text" — decide whether that row can fail, and whether a
   renderer that emitted *nothing at all* would pass C3(a)–(d). Decide how the truncation marker is
   proved, and what the exact rendered strings are — write them into the cells, derived from the
   fixture, not paraphrased from task 2's prose.
2. **`buildPreparationMessages` block ordering (C4).** The order is specified; decide whether a row
   proves the *order* or merely the *set*, and whether the "current instruction is always last and
   never in the history block" claim can fail. This is rule 19's surface.
3. **`appendTurns`'s window (C2).** Decide whether C2(b) distinguishes dropping the **oldest** from
   dropping the newest, and whether `omittedTurns` is proved to increment per dropped turn rather
   than merely to be non-zero.
4. **`seedRetrievalRecord` (C5).** Task 3 carries a parenthetical — "`matchStrength: "strong"`,
   `score: SCORE_MAX` when the block was human-added, else the block's recorded values — see note".
   Decide whether that note exists, whether the distinction is representable from a `Proposition`
   alone, and whether C5(a) proves it. A seed that ignored human-added blocks entirely is the
   do-nothing case.
5. **C6's two rows** claim conversation and workflow state are disjoint. Decide what instrument
   could make either fail, and whether they are assertions or restatements.
6. **Decidability.** For every row, could an implementer discharge it without asking a question?
   Name every cell that is a paraphrase rather than an exact expected value.
7. **Buildability.** Phase 9's projection found the phase literally unbuildable as written —
   nothing supplied `ToolContext`, and `get_content` had no representable output. Check the same
   here: do `DomainResult`, `Proposition`, `MAX_CONVERSATION_TURNS`, `MAX_TURN_TEXT_CHARS`,
   `SCORE_MAX`, `MAX_BLOCKS` and `MAX_ALTERNATIVES_PER_BLOCK` all exist today, at the paths the plan
   names? Verify by reading, and say where each one actually lives.
8. **Zod 4.5.4 facts, run rather than assumed.** Task 1 needs a discriminated union with a
   conditional-presence refinement (`propositionVersion` required for one `kind`, forbidden
   otherwise). Establish what that costs: whether `.superRefine()` preserves `.shape`, what issue
   path the refinement produces, and — since phase 9 proved `z.toJSONSchema` **silently drops**
   refinements — whether anything in this phase depends on that schema surviving a JSON Schema
   round trip. Print what you find.

## Rules for this round

- **Read, do not run.** No test execution, no `npm install`, no network, no provider call, no
  `npm run build` (it fails on `main` for a pre-existing reason outside this phase). Reading a
  library's `.d.ts` or source is expected; a one-off `node -e` to print what Zod actually emits is
  permitted and encouraged — say so when you do it, and quote the output.
- **Every count you state comes from a command**, with the summands printed. Never quote a number
  from this prompt or from the plan without re-deriving it.
- **Do not widen the perimeter.** Phase 9 is approved and closed. Phase-15 candidates 4, 5 and 6
  stay where they are. If you find a defect in an approved phase, route it — do not repair it.
- **Amend the plan's table in your ledger, not in the file.** The coordinator folds.

## Handoff

Write `handoffs/reviewer/phase-10-projection-round-0.handoff.reviewer.md` with front matter
`plan / role: projection / state: AMENDMENTS_REQUIRED | READY / date / actor`, and:

1. The gate result and the recorded baseline.
2. A numbered ledger of amendments, each tagged **P** (precision), **M** (missing row), **I**
   (impossible as written), or **F** (factual error), each naming the row it changes and the exact
   replacement text. D-numbers for anything a later session will need to cite.
3. For every row you judge unable to fail: the concrete implementation value that would still
   satisfy it.
4. Every fact you established by reading a library or the repository, with the file and line.
5. The proposed table after your amendments — criteria / rows / mutations — derived by counting
   your own ledger, with the summands printed.
6. An owner decision card for anything touching ratified semantics: the intention, master §6.3 or
   §6.4's closed registries, or an approved phase's perimeter. Recommend one branch and say why.

Do not change the phase state or the master tracker row; the coordinator folds this.
