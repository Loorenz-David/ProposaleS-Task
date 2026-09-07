---
plan: plans/phase-10-conversation-context.md
role: implementer
round: 1
date: 2026-09-07
---

# Phase 10 round 1 — conversation context, retrieval record, message assembly

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy (`agent-skills/policy/architecture-context-policy.md` →
`architectural_contracts/01-implementation-contract-guide.md`) before your first design decision.

**Three pure modules, no I/O, no model call, no service.** They are what lets a human say "use the
second one" three turns later and have the application resolve it against a fact it already
checked. Phases 11 and 12 are the callers; phase 9's runtime is untouched and keeps receiving
`initialMessages`.

**The plan owns the work.** Read `plans/phase-10-conversation-context.md` in full — the six tasks,
the 30-row table, the Notes (which now carry the fixture, the exact expected render, and both owner
card decisions) and the whole Review log — plus its Read-first list. Where this prompt and the plan
differ, the plan wins; where the plan and the intention differ, the intention wins and you stop and
say so.

## Start gate — check by content, then begin

1. Intention line 4 says `RATIFIED`; §23 ends at **round 18**.
2. Master §4 rows 1–9 are `APPROVED`; row 10 is `PROMPT_READY`.
3. The phase-10 plan header says `state: PROMPT_READY` and its table declares **6 criteria / 30
   rows / 14 distinct mutations**, containing rows `C1(g)`, `C2(e)`, `C3(f)`, `C4(f)` and `C5(d)`.
4. Master §6.4's `RetrievalRecord` row shows `matchStrength?` and `score?` **optional**; §6.6's
   `renderAssistantTurn` row names **`RenderableResult`**, not `DomainResult`.
5. Master §9.1 has **rule 22**; master §12 carries two rows reading **"of the phase-10 projection —
   CLOSED"**.
6. None of the four target files exists: `schemas/conversation.ts`,
   `server/domain/conversation.ts`, `server/domain/retrieval-record.ts`,
   `server/agent/build-messages.ts`.
7. `npm test` is green at **31 files / 421 tests** before you write anything. Record the number.

If any is false, write a handoff saying which and stop.

## What the projection already settled — do not re-derive it

A projection round routed 33 decisions into the plan before you were dispatched, and the owner
answered two cards. The plan's tasks and table are the result. Four things it settled that you would
otherwise spend the round discovering:

1. **`DomainResult` does not exist and is not specified anywhere.** Master §6.3 names the five
   states and gives only `failed`'s payload; `schemas/turn-result.ts` is phase 11's file. Do **not**
   invent it, do not widen your perimeter to create it, and do not import from phase 11. Task 2
   declares `RenderableResult` locally — the narrow union of what the renderer actually reads. This
   is the second phase running that arrived literally unbuildable; it is fixed in the plan, not by
   you.
2. **A `Proposition` block records no strength.** `blockSchema` has nine keys and neither
   `matchStrength` nor `score`; only `alternativeSchema` carries them. Owner card 1 → B: a block
   seeds with identity only, **whatever its `contentId.source`**. The plan's old third Note said
   otherwise and is replaced.
3. **A question's text is never rendered** (owner card 2 → A). Id and topic only. This is not a
   preference — §17A.17 item 2 bars model-authored text from an assistant turn, and a question's
   text is model-authored.
4. **Six expected values in the old table were wrong.** They are corrected in the table and each is
   marked *printed*. They were re-run twice — once by the projection, once by the coordinator — and
   both runs agree. Take them as given.

## The printed values — do not retype them from a schema

`zod@4.5.4`, verified on this tree 2026-09-07:

| Case | Value |
|---|---|
| unknown key on the **context** | `{ code: "unrecognized_keys", path: [], keys: ["foo"] }` |
| unknown key on a **turn** | `{ code: "unrecognized_keys", path: ["turns", 0], keys: ["foo"] }` — index is the **number** `0` |
| **human** turn carrying `propositionVersion` | `{ code: "unrecognized_keys", path: ["turns", 0], keys: ["propositionVersion"] }` — the human variant is strict, so the refinement never runs |
| assistant `proposition` without / `clarification` with | `{ code: "custom", path: ["turns", 0, "propositionVersion"] }` |
| conversation schema given a `state` key | `{ code: "unrecognized_keys", path: [], keys: ["state"] }` — path `[]`, **not** `["state"]` |
| `MAX + 1` turns | `{ code: "too_big", path: ["turns"] }` |
| text over cap | `{ code: "too_big", path: ["turns", 0, "text"] }` |
| uppercase `turnId` / `at` without ms | `{ code: "invalid_format", path: ["turns", 0, "turnId"] }` / `[..., "at"]` |
| `"  " + 3000×"x" + "  "` | **parses** — `.trim()` runs before `.max()` |

Two consequences you must honour. **Compare `issue.path` directly, with no `.map(String)`** — the
numeric segment is part of what C1 asserts, and phase 9's review found a `.map(String)` deletable
precisely because no path there had one. And **C1(d)'s fixture carries no surrounding whitespace**,
or it will not fail at all.

Note the contrast C6(a) and C6(b) turn on: `parseProposalWorkflowState` **flattens**
`unrecognized_keys` into `[...issue.path.map(String), key]` (`schemas/workflow-state.ts:53`–`:58`),
so its issue path really is `["conversation"]`; the raw schema in C6(b) does not flatten, so its
path is `[]`. Both rows are right, for different reasons.

## The thing this phase is actually about

Read §5 of `handoffs/reviewer/phase-10-projection-round-0.handoff.reviewer.md` — it lists, row by
row, what an implementation could return and still pass the old table. Nine of twenty-five rows had
an answer. The three that matter to you:

- A renderer that emits `return ""` passed the leak row, the clarification row, and much of the
  bounded row. **An absence claim is evidence only when the same row, on the same fixture, shows the
  instrument observing a presence** (§9.1 rule 22, earned here). C3(e) and C4(e) both now carry that
  companion; do not drop it as redundant.
- An assembler emitting `labeledBlock("catalog_languages", "")`, `labeledBlock("current_proposition",
  "")` and a history block of bare headers passed **every** C4 row. C4(f) is the answer: the whole
  six-message list deep-equals a literal you write out. This is §9.1 rule 19, earned in phase 9 when
  the entire outbound request proved deletable field by field with 34 rows green.
- `omittedTurns = dropped` instead of `omittedTurns + dropped` passed both append rows. C2(e) is the
  answer.

When you write a row, ask the plan's question of it: *what could this function return, or fail to
do, that would still satisfy this assertion?* If the answer is "quite a lot", say so in the handoff
rather than building it as written.

## Boundaries

- **Perimeter: 10 new files, listed in the plan.** Nothing else. In particular do **not** extend
  `getAgentScanFiles()` in `test/helpers/agent-boundary-scan.ts` — that would widen phase 9's
  shipped perimeter into a directory phase 11 also writes. C4(e) calls the shared `FORBIDDEN_FORMS`
  and `hasForbiddenForm` against a file you read from disk yourself (§9.1 rule 17: name the shared
  symbol, never build a second copy).
- **MUT-10-12 is the one mutation outside the perimeter** (`schemas/workflow-state.ts`). Apply it,
  observe the red, revert it, and record its restored digest like any other.
- `schemas/conversation.ts` is **runtime-neutral** — no `server-only`, and contract `03`'s import
  matrix forbids `schemas/**` from importing anything that is. `server/domain/*` and
  `server/agent/*` are `server-only`.
- `server/agent/` is this feature's first agent directory; it is sanctioned by contract `03` line 37.
- No network, no `.env` read, no provider call, no `npm install`. **`npm run build` is broken on
  `main` for a pre-existing reason** (`src/styles/globals.css` imports a `tokens.css` deleted at
  `f957f66`) — it yields no signal, must not be used as evidence, and must not be repaired.

## Closing

One L4 stamp at the end — `npm test`, typecheck, lint — and exactly one. Over-evidence is a defect.
Every one of MUT-10-1 … MUT-10-14 runs, reddens the row it names and no other, and is reverted with
its file restored byte-identical; print the digest before and after. Every one of the 30 row ids
appears in an executing test name. Then the checkpoint commit and a handoff at
`handoffs/implementer/phase-10-round-1.implementer.md` recording the L4 numbers, the mutation
ledger, the restored digests, and any row you had to build differently from the way it is written —
with the reason. A row you could not make fail is a finding, not a footnote.
