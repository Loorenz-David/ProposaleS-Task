---
plan: plans/phase-04-derived-presentation.md
role: reviewer
round: 2
date: 2026-09-07
---

> **ARCHIVED UNEXECUTED, 2026-09-07.** This review round was never run. The owner closed phase 04
> after the implement round on an explicit decision — *"I won't spend another session on the review,
> if the code works that is all i need for this mvp"* — so this prompt is the record of the review
> that was compiled and declined, not of one that happened. Its §6 depth targets are the honest list
> of what phase 04's approval does **not** cover; master plan §11.1 carries the same list. Do not
> reuse it as a template: a review prompt is authored just-in-time against current state.

# Phase 04 — Derived presentation (review, round 2)

## 0. Role and workspace

You are the **plan reviewer** for the `frontend_core` pipeline. Follow the plan-reviewer doctrine at
`/Users/davidloorenz/agent-skills/plan-reviewer.md` and the shared charter at
`/Users/davidloorenz/agent-skills/pipeline-charter.md` — read both by absolute path first and follow
them as this session's doctrine, including the full first-review checklist.

Workspace: `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch
`proposal-copilot-frontend`. **Never enter the sibling backend worktree at
`/Users/davidloorenz/Desktop/Developer/Proposales`.** Never use bare `git stash` / `git stash pop`.

This is the phase's **first review**. Round 1 was the implementation; round numbering counts sessions.

**You change no application code.** You write findings, your handoff, and nothing else.

## 1. Gate check — verify all five; stop and report on any failure

1. `intention/frontend-core-intention.md` line 5's **Status** value begins `RATIFIED`.
2. Its §15 heading reads **"Ratified owner decisions (0 open)"**.
3. **Both** phase-04 state cells read `IMPLEMENTED` — `master-plan.md` §4 row 04 and
   `plans/phase-04-derived-presentation.md`'s header. **Disagreement is itself a stop condition**
   (§11.3 follow-up 21).
4. `src/features/proposal-preparation/client/view-models/session-tab.ts` exists and exports
   `deriveTabStatus`.
5. `handoffs/reviewer/phase-04-review-round-2.handoff.reviewer.md` does not exist.

## 2. Read first, in this order

1. `plans/phase-04-derived-presentation.md` **in full, including its whole Review log** — the
   pre-dispatch lint, the projection fold, the maintenance fold, round 1's own entry, and the
   coordinator's consumption entry.
2. `handoffs/implementer/phase-04-round-1.handoff.implementer.md` — the coverage map, the mutation
   ledger, the declared perimeter, the three delegations.
3. `master-plan.md` §4, §6.2, §6.3, §6.4, §6.5A, §7.3, §7.4, §7.5, §9 (**all** standing rules;
   **18A** scopes what you may require), §10.3, **§10.3A in full**, §10.4, §11.2, §11.3 follow-ups
   9, 17, 20, 21, 24.
4. `intention/frontend-core-intention.md` §12A.3 **in full**, §12A.7 **in full**, §12A.8,
   §15 decision 19.
5. `ui_design/03-agent-surface.md` §3.2, `ui_design/04-session-tabs.md` §3.3, §5.

## 3. Step 1 — the verified perimeter

`git diff --name-only 0cc02d8..HEAD` is the round's diff. The coordinator has already reconciled it
against both the handoff's declaration and the plan's tasks and found them to match — **verify that
independently, do not inherit it**, and treat anything outside the declared perimeter as an automatic
finding. Two things the coordinator recorded rather than faulted:

- `hooks/use-workspace-session-store.test.ts` was edited (an exact-equality assertion on the record
  now sees five more fields). Forced, declared, and **missing from the plan's own perimeter** — a
  coordinator omission, not an implementer one.
- `src/app/page.tsx` appears in the mutation-probe list only, reverted.

## 4. Coordinator findings to adjudicate — confirm or dismiss each, with evidence

These are **claims, not conclusions**. Two were proved by mutation; one by reading; one is grounded in
dependency source. Dismissing one with a reason is a good outcome; inheriting one without checking is
not. Each already carries its routed plan amendment, so judge the **code**, not the plan wording.

- **B1 — C6(b) named two surfaces and instruments one.** Hard-coding
  `agent-status-line.tsx`'s phase label to the literal `Ready`, severing it from its source
  completely, leaves **205/205 green**: the test asserts `toHaveTextContent` on the status line's
  container, which the neighbouring status-text span satisfies alone. C6(c)'s own named mutation
  reddened through that same span, so the ledger reads complete. **Reproduce it, then judge whether
  the repair is a one-line element-scoped assertion or whether the row needs more.** C6(b) is amended
  to require each named surface to be asserted on its own element.
- **B2 — the status line renders the same word twice**, so the user sees "Ready" beside "READY".
  A defect in the **plan**, not the round: owner decision 19 removed the status note from design 03
  §3.2's left slot and task 3 never said what replaces it. Task 3 is amended — **the status line
  carries the phase label and nothing else; the left slot is removed, not refilled.** Judge whether
  removing it breaks any row, and whether it makes B1's repair redundant or still necessary.
- **S1 — §11.3 follow-up 17's repair is placed at describe scope.** The inserted
  `test.use({ contextOptions: { reducedMotion: "no-preference" } })` at `e2e/workspace.spec.ts:217`
  sits inside the `C7(a): design corrections remain landed` describe, so corrections 1–5 inherit it.
  Grounded, not assumed: `test.use()` pushes onto the current suite
  (`node_modules/playwright/lib/common/index.js:2424-2428`) and every parent suite's `_use` is applied
  regardless of position in the block (`:1902-1910`). Nothing breaks today — the default *is*
  no-preference — but the follow-up exists to survive a default change. **Verify the mechanism
  yourself**, then judge whether a nested one-test describe (mirroring the `reduce` sibling at
  `:200`) is the right shape.
- **N1 — no instrument protects any colour binding.** Pointing the `idle` dot at `--color-border`,
  a property declared **nowhere**, renders `currentColor` and leaves 205/205 green. Nothing shipped is
  wrong — all six bindings were verified against the ramp by hand. This is §11.3 follow-up 24, and the
  question for you is only whether phase 04 should carry a cheap check now or leave it to that
  follow-up under standing rule 18A.

## 5. Judgment-call probes extracted from the round's report

- **The three declared delegations.** (a) The accessible name is an `aria-label` on the trigger while
  the inner title span keeps its own `aria-label` for the elision row — check that the span's label
  contributes nothing unexpected to the computed name and that the elision assertion still means what
  it meant. (b) The status line's markup, now amended by B2. (c) `TabViewModel` is
  `{title, status, statusText, dotClassName}` with `deriveTabStatus` exported separately — check both
  presentations really call one function on one record.
- **`dotClassName` puts a Tailwind class string inside a view model.** Judge it against contract 05
  §8 and standing rule 4: is presentation-class selection an adapter's job here (§12A.8 permits
  "choose a presentation class from a domain value by a rule stated in this section"), or has a view
  model become a stylesheet?
- **The era-1 marker.** `client/fixtures/session-runtime.temporary-fixture.ts` carries the
  backend-owned result-kind union. Verify it is genuinely marked temporary per §6.6 and standing rule
  3, and that no unmarked domain shape was authored anywhere (standing rule 1).
- **The two held rows must still be held.** C3(b) whole, C6(a)'s closure half. A test for either is a
  finding, and so is a held row quietly discharged by something weaker.
- **Round 1 reports a "title-label regression" it introduced and fixed** during its own end-to-end
  run. Check what that was and whether the repair is complete.

## 6. Depth targets

Spend your adversarial budget here, not on re-reading what is already green.

1. **C2's seven overlap rows.** This is the phase's silent-failure core: a mis-ordered first-match
   chain resolves an overlap to a **valid-looking wrong status** while every isolated row still
   passes. The round ran one mutation (swap rows 2/3). Ask what a swap of a *different* adjacent pair
   would redden, and whether every adjacent pair is actually covered.
2. **C3(e) is a four-alternative denylist** over two files. Standing rule 18A licenses a plain check
   for a **closed, named** construct set — judge whether the four alternatives are that set, or
   whether one of them (`thread content`) is prose that could never appear in code.
3. **C3(a) asserts the accessible name at one status**, C3(c) at a second. Two of six. Judge whether
   that is sampling a total table (rule 2, explicitly *not* relaxed by 18A) or acceptable composition
   given C1 asserts all six status texts at the view-model level.
4. **The trace chain in both directions.** 22 measurable rows against the test declarations, and every
   test back to a row. Orphan tests are findings of the same class as uncovered rows.

## 7. Evidence budget

**Your budget is exactly one L4 stamp, and you should probably not spend it.** Check first:
`git diff --stat 3bc43d3..HEAD -- src/ e2e/ package.json vitest.config.mts playwright.config.ts`.
If that is empty, the source tree is byte-identical to the tree these records were taken on, and they
are citable without re-execution:

- unit **205/205**, 23 files (round 1's stamp);
- **E2E 69/69** on `3bc43d3` clean, taken independently by the coordinator under a recorded
  authorization;
- typecheck, lint, build clean (round 1's stamp).

**Spend the budget on variation instead** — different sites, different mutant shapes, conditions the
round never tried. That is what has caught every real defect in this project, including the two above.
Over-evidence is a defect symmetrically: re-running a command whose tree identity matches yours,
with no variation and no pre-run authorization line, is a finding against this session.

Any additional L4 requires the charter's authorization line, written **before** the run.

## 8. Closing protocol

1. Classify every finding **blocking / should-fix / note**, each with the exact correction clause the
   fix round will be given verbatim. A correction that names a source of truth must name it.
2. Adjudicate all four coordinator claims explicitly — confirmed or dismissed, with evidence.
3. Sort your findings by **what a user meets**, not by subsystem. Owner decision 17's precedent: a
   finding whose write-up says "focus" may be a mouse defect, and a keyboard-shaped finding may be
   deferrable. Read the trigger, not the mechanism. Owner decision 18's MVP bar (standing rule 18A)
   scopes what you may require — but it does **not** license sampling a total case table.
4. Any owner decision goes in ONE section headed `⚠ OWNER DECISIONS REQUIRED (n)` immediately after
   your opening summary, in the charter's card format. Zero cards says so in one line.
5. Move **both** phase-04 state cells in the same edit — `master-plan.md` §4 row 04 and the plan
   header — to `CHANGES_REQUESTED` or `APPROVED` as your verdict requires.
6. Write your findings into the plan's Review log.
7. Deposit your handoff at `handoffs/reviewer/phase-04-review-round-2.handoff.reviewer.md` with
   frontmatter `plan`, `role`, `round`, `date`, `verdict`, `actor`, and a body declaring your **full
   write perimeter**, your evidence records with tree identity, and every mutation you ran.
8. Your final chat message is the **owner layer**: What I did → What I found and what it means for you
   → What happens next → What needs you. No section numbers, no `file:line`, no term of art without a
   plain-word gloss. Under ~300 words. One pointer line names the handoff file.
