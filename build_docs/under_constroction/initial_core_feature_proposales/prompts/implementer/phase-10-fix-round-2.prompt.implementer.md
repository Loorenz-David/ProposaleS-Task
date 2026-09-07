---
plan: plans/phase-10-conversation-context.md
role: implementer
round: fix-2
date: 2026-09-07
---

# Phase 10 fix round 2 — one line of production

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`, checkpoint `3b696c3`.
Never enter the sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`.

**Fix round 1 was right about everything it was asked to do.** The blocking delimiter finding is
closed correctly, all six should-fixes are discharged, and the perimeter and digests are exact.
This round exists for one thing the *plan* got wrong, and one guard it left open.

## Start gate — check by content, then begin

1. Master §4 row 10 reads `CHANGES_REQUESTED`; rows 1–9 are `APPROVED`.
2. The phase-10 plan declares **6 criteria / 37 rows / 26 distinct mutations** and carries
   **fix round 2 tasks 13–16**.
3. Master §9.1 has **rule 24**.
4. `npm test` is green at **35 files / 458 tests**; typecheck and lint exit 0. Record the number.
5. `server/domain/conversation.ts` contains the string `" ".repeat(MAX_TURN_TEXT_CHARS`.

If any is false, write a handoff saying which and stop.

## Task 13 — delete the padding. This is the whole production change.

`cutToBudget` currently ends:

```ts
return `${content}${" ".repeat(MAX_TURN_TEXT_CHARS - content.length - marker.length - 1)}\n${marker}`;
```

It becomes:

```ts
return `${content}\n${marker}`;
```

**Why it was there, and why it goes.** The plan's C3(g) demanded `length === MAX_TURN_TEXT_CHARS`.
A whole-block cut lands wherever the last complete block lands, so exact equality is unsatisfiable
by any honest render, and round 1 met the row by padding with 122 spaces — filler in the exact
string the model reads back as its own conversation history. **The row was wrong, not the code.**
Round 1 declared the tension explicitly and that was the correct call; the plan is amended, and
§9.1 rule 24 is what the round bought.

A coordinator probe deleting this padding reddened **C3(g) alone** — C3(d), which carries the
owner's actual requirement, stayed green. So this change should redden exactly one row before you
rewrite it in task 14, and nothing else.

Nothing else in production changes. `build-messages.ts` must end **byte-identical**; print its
digest before and after.

## Task 14 — C3(g) rewritten to the amended cell

`rendered.length ≤ MAX_TURN_TEXT_CHARS`, the render parses as an assistant turn, **and** the
boundary is exercised by a relation rather than an equality: the first block unit that was *not*
rendered would not have fitted. Prefer a relation to an equality wherever the mechanism's output is
data-dependent — that is rule 24 in one sentence.

## Task 15 — C3(d) gains the content assertion, and MUT-10-26

Coordinator probe **Q4** — push only `currentBlockLines.slice(0, 1)`, so each block's header
renders and its alternatives are silently dropped — left **458 tests green**. The cut path's
*content* is asserted by nothing: C3(a)'s exact-string row uses the small fixture and never reaches
`cutToBudget`, and C3(d) asserted only length, marker, count and determinism.

"Whole blocks, never mid-title" is the owner's decision, and what the cut actually emits is what
makes it true. Assert it: every rendered block line is followed by exactly its own alternative
lines, the last rendered block is complete, and the text ends with that complete unit followed by
the marker. **MUT-10-26** is Q4 itself and must redden C3(d).

## Task 16 — MUT-10-3's site

Its declaration named `renderAssistantTurn` and "drop the cut". Round 1 restructured both, so that
wording no longer points at a real site. Re-run it as: `renderProposition` returns `complete`
unconditionally. It must redden C3(d). (§9.1 rule 21 — a mutation names file *and* site, and a
restructure invalidates a site the way a duplicate makes one ambiguous.)

## Explicitly not in this round

- **Do not** re-route `clarification` or `failed` through a cut. The budget now lives inside
  `renderProposition`, and a 60-question clarification would render 3 981 characters — but
  `MAX_CLARIFICATION_QUESTIONS` is 5, so the real maximum is ~370. It is recorded in the plan Notes
  and routed to phase 11, where the bound is in scope. Leave it.
- **Do not** touch the owner's scope limit: no cap change, no per-block truncation, no re-flow, no
  `current_proposition` work.
- **Do not** change `labeledBlock`, `schemas/conversation.ts`, or `retrieval-record.ts`.

## Boundaries

- Production perimeter: **one line of `server/domain/conversation.ts`**. Everything else is
  test-side. Print digests for `build-messages.ts`, `schemas/conversation.ts` and
  `retrieval-record.ts` before and after; all three must be unchanged.
- No network, no `.env` read, no provider call, no `npm install`. `npm run build` is broken on
  `main` for a pre-existing reason, yields no signal, and must not be run or repaired.
- **A probe that does not apply is not evidence.** Print the applied-substitution count before you
  read any result — round 1 correctly discarded two selectors that silently skipped, and that was
  the right call.

## Closing

One L4 stamp — `npm test`, typecheck, lint — and exactly one. MUT-10-3, MUT-10-20, MUT-10-25 and
MUT-10-26 each run, redden the row they name, and revert with the file restored byte-identical.
Every one of the 37 row ids appears in an executing test name. Then the checkpoint commit and a
handoff at `handoffs/implementer/phase-10-fix-round-2.implementer.md` with the L4 numbers, the
mutation ledger, the restored digests, and any row you had to build differently from the way it is
written — with the reason. **Round 1's declared judgment call is exactly why this round is small
rather than shipped; keep doing that.**
