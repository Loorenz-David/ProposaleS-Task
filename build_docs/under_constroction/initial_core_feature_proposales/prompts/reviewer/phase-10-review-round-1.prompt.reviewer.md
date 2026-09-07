---
plan: plans/phase-10-conversation-context.md
role: reviewer
round: 1
date: 2026-09-07
---

# Phase 10 review round 1 — conversation context, retrieval record, message assembly

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`, checkpoint `438f804`.
Never enter the sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/plan-reviewer.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then run this repository's Architecture
Context policy **in reverse** (`agent-skills/policy/architecture-context-policy.md` §6): diff →
concerns touched → `architectural_contracts/01-implementation-contract-guide.md` → the applicable
contracts → judge the diff against them. A review judges contract preservation, not only whether
the code works.

## Start gate — check by content, then begin

1. Master §4 row 10 reads `REVIEWING`; rows 1–9 are `APPROVED`.
2. The phase-10 plan header says `state: REVIEWING` and its table declares **6 criteria / 33 rows /
   17 distinct mutations**, containing `C2(f)`, `C4(g)` and `C5(e)`.
3. `npm test` is green at **35 files / 451 tests**; typecheck and lint exit 0.
4. The four production modules hash to: `conversation.ts` (schema)
   `66b6fc0be28fbc83b3ba3511ff7703dd0f0777ee8605f914c0a5024c8e1b959c`; `conversation.ts` (domain)
   `4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c`; `retrieval-record.ts`
   `f78e7700391e5391f2da7306a9eb02a621c9a259e03a484b40447acec0e18e24`; `build-messages.ts`
   `0c2dfece49422897b9ea92ed6d1e0a3b055849a521cbd44f350bbe5b6d0a1711`.
5. Master §9.1 rule 22 carries a **corollary** beginning "re-apply this rule to the rows the fold
   itself rewrites".

If any is false, write a handoff saying which and stop.

## Already validated — do not spend your round re-deriving it

The coordinator has run the arithmetic and the ledger. Take these as given:

- **Perimeter exact** at 13 files (`git diff --name-only 456ba23 HEAD`), 10 implementation + 3
  artifacts, matching the plan's declared file list.
- **All 30 round-1 row ids execute**, scoped to the four phase-10 test files and diffed against the
  plan table — exact match, none missing, none extra.
- **All five restoration digests recomputed and matched.** MUT-10-13 and MUT-10-12 re-run
  independently and both redden as declared.
- **Production is correct in all four modules.** Both owner card decisions are honoured, and card
  2 → A is honoured *structurally*: `RenderableResult`'s `questions` member names `questionId` and
  `itemKey` only, so the renderer cannot reach a question's text even by mistake.

## Four findings already in hand — they are rows C2(f), C4(g), C5(e) and the extended C2(d)

Thirteen forward coordinator probes; four came back green. Every one is a plan-authorship defect —
**production is right in all four cases, the guard is what is missing.** They are already folded
into the table as new rows and a fix round will discharge them. Do not re-find them; do ask whether
each *row* now actually catches its probe:

1. **C4(g)** — deleting `labeledBlock`'s `replaceAll(">>>", "> > >")` left 451 tests green. This is
   the trust boundary the phase exists to build (`10` §6, `08` §7): a brief containing `>>>` closes
   the untrusted region early. The escape was described in the Notes **and named inside C4(d)'s own
   cell**, and asserted by nothing.
2. **C5(e)** — `hasRetrieved` can `return false` unconditionally with 451 green, while always-`true`
   reddens C5(c). A coordinator fold deleted the only positive assertion while replacing it with a
   stronger one elsewhere. §9.1 rule 22's corollary is what this bought.
3. **C2(f)** — `humanTurn` and `assistantTurn` can each return the opposite `role` with the suite
   green. Task 2 names both; no row covered either.
4. **C2(d) extended** — `emptyConversation` may return a shared singleton.

One probe was **withdrawn as a false finding**: the `agentRationale.known` check is redundant, not
absent, because `sourcedOrAbsent`'s `known: false` arm is strict and carries no `value`. A probe
whose premise is wrong is not a finding — check the schema before you report one.

## Where to spend your round instead

The productive question in this project has never been "is the code wrong". Across phases 7, 8, 9
and now 10, **production was right and the rows could not fail.** Ask of every row: *what could this
function return, or fail to do, that would still satisfy this assertion?* Forward-mutate production
against the **full** suite and treat green as the finding.

Specific places the coordinator did not reach:

- **`renderProposition` against `maximalConformingProposition()`.** C3(d) proves the cut fires. Does
  anything prove the render is *correct* at that size — that block 30's line is present and not
  silently truncated mid-field, that alternative ordering survives?
- **`labeledBlock`'s opening delimiter.** C4(g) covers `>>>`. Nothing covers `<<<`, or a name
  argument carrying a newline or a delimiter. Is the block's *name* attacker-reachable at any
  caller?
- **`extendRetrievalRecord`'s overwrite direction.** C5(b) asserts a later candidate wins. What
  proves the *earlier* record's other entries survive — could it return only the new candidates?
- **`JSON.stringify(currentProposition)`** is the whole proposition, unbounded, into the prompt.
  Compare against `MAX_TURN_TEXT_CHARS`'s reasoning and §17A.16: is there a bound anywhere, and
  should there be one in this phase or phase 11?
- **`conversation_history` when `turns.length === 0` but `omittedTurns > 0`.** The block is skipped
  entirely, so the omitted count is lost. Reachable? Does it matter?
- **Contract `02`/`03` in the diff.** `schemas/conversation.ts` must stay runtime-neutral;
  `server/**` must be `server-only`. Confirm by reading the imports, not the plan.

## Boundaries

- **You may repair test-side within your round** and re-prove each repair by mutation; record every
  digest. Production changes are findings, not edits — unless a finding is a one-line contract
  violation, in which case say so and let the fix round own it.
- `npm run build` is broken on `main` for a pre-existing reason (`src/styles/globals.css` imports a
  `tokens.css` deleted at `f957f66`). It yields no signal, must not be used as evidence, and must
  not be repaired.
- No network, no `.env` read, no provider call, no `npm install`.
- **A probe that does not apply is not evidence.** Print the applied-substitution count before you
  read the result — a phase-9 coordinator probe was withdrawn after a `sed` silently matched
  nothing.

## Closing

One L4 stamp; over-evidence is a defect. Handoff at
`handoffs/reviewer/phase-10-review-round-1.handoff.reviewer.md` with the verdict, every finding
ranked, the mutation ledger for anything you repaired, and — for each finding — the exact value an
implementation could return that would still satisfy the row as written. Owner cards only for
decisions that are genuinely the owner's; recommend a branch for each.
