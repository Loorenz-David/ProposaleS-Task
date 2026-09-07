---
plan: plans/phase-03-session-runtime-and-tabs.md
role: implementer
round: 4
date: 2026-09-07
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — phase 03 fix round

You fix **phase 03 of `frontend_core`** in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `implementation-executor` doctrine: invoke the `implementation-executor` skill, or read
`/Users/davidloorenz/agent-skills/implementation-executor.md` and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them. Also follow
the repository's Architecture Context policy.

**Resolve the four items below. Relitigate nothing, and add nothing beyond them.** Where this prompt
differs from the plan file, the master plan, the ratified intention, a design specification, or an
applicable architecture contract, those authorities win.

## 0. Why this round is four items and not eighteen

Review round 3 returned six blocking and eleven should-fix findings. **Owner decision 17 deferred
most of them on purpose**: *"we are to focus on keyboard behaviour, this is not a must for the first
mvp, i prefer progress over keyboard improvements ( users don't use short cuts that much specially
for this app )"*. The deferred set is registered as master plan §11.3 follow-ups 19 and 20 and is
**out of scope for you** — see §4. What survives is three defects a user meets on the first screen
and one unstable test. None of the four is keyboard work.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | The phase awaits a fix | `master-plan.md` §4, row `03` | the **State** cell reads `CHANGES_REQUESTED` |
| 3 | The plan agrees, **on state and on counts** | `plans/phase-03-session-runtime-and-tabs.md`, header and criteria table | its **State** row reads `CHANGES_REQUESTED` — the same value as check 2, and if the two disagree that is the defect, stop and report it — **Criteria** reads `7`, and the criteria table totals **47 rows** and **18 runnable named mutations** |
| 4 | The round is outstanding | `handoffs/implementer/` | no `phase-03-fix-round-4` handoff exists |
| 5 | The defect is still present | the tree | `agent-surface.tsx` still renders `<SessionTabStrip />` after the idle content |

**Environment note:** the untracked, git-ignored `build_docs/future_implementations/` is not this
pipeline's work. Leave it alone.

## 2. Read order

1. `plans/phase-03-session-runtime-and-tabs.md` in full, **including its Review log** — the last two
   entries carry the routing and the reasoning you are expected to preserve.
2. `handoffs/reviewer/phase-03-review-round-3.handoff.reviewer.md` — findings B3, S10, S11 in full,
   and its "What I verified correct" section, which tells you what not to disturb.
3. Intention §12A.5 (the close table), §12A.17 (the focus table), §12A.23; design 03 §2 and
   design 04 §1–§2.

## 3. The four corrections — each quoted verbatim from its finding

**Correction 1 — B3, the only behavioural defect in the phase.** From review round 3:

> Activation must follow focus only for focus the user moved, never for a focus repair the close
> performed. Give the close path a way to say so — for example, set a "repairing focus" ref before
> `focusTab` in the layout effect and have `onFocus` return early while it is set, clearing it after
> — so that closing a non-active tab leaves `activeSessionId` untouched. Then extend `C3(a)`'s test
> to assert **both** clauses: `activeSessionId` is identical before and after, and focus lands on
> the tab at the removed index. Add the named mutation `remove the repair guard so the
> close-induced focus activates its tab; C3(a)'s active-session assertion must redden`. §12A.17's
> row "a session is activated because another was closed → the newly active tab" governs only the
> case where the **closed** session was the active one; it does not license activation here.

C3(a) is already amended in the plan to require both clauses, and the mutation is already counted in
the plan's eighteen.

**Correction 2 — S10, the strip's position.** From review round 3:

> render the strip as the Agent Surface's first child, above the idle block; or, if there is a
> reason to keep it low, record it as a design delta in §11.2 with that reason.

Design 04 §1 and §2 put the strip *"at the top of the agent pane"* and design 03 §2 lists Session
Tabs second, above the thread. If you take the delta branch instead, **you do not edit §11.2
yourself** — record the reason in this cycle's handoff and the coordinator routes it.

**Correction 3 — S11, the first rendered document.** From review round 3:

> seed the store's initial state with one session at module scope (`createWorkspaceSessionState()`
> already builds exactly that and today has only test callers), so the first render — server and
> client — has one tab; or render nothing at all until a session exists rather than an empty
> tablist. Then give the fact a criterion row: "the first rendered document contains at least one
> tab" — which also retires the readiness waits.

That criterion row is already in the plan as **C7(f)**, with its own named mutation. "Retires the
readiness waits" means the three `await expect(page.getByRole("tab").first()).toBeVisible()` lines
added to `e2e/workspace.spec.ts` in round 2 come **out** if seeding makes them unnecessary — verify
that before removing them, and if any is still needed, say which and why.

**Correction 4 — the closing stamp does not reproduce (coordinator, recorded in the plan's Review
log).** `e2e/session-tabs.spec.ts` `C4(b)` fails **3 of 4 isolated runs** on the tree round 2 handed
over, clean at `5f34897`, while that round's handoff records 69/69 green. Diagnose it and make the
row deterministic **without weakening what it asserts**: it must still prove the active tab is fully
inside the strip's visible region with at least the named margin after each of the five movement
operations. If the instability is in the test's synchronisation, fix the synchronisation; if it is
in the production reveal path, that is a second behavioural defect and you report it as one. Do not
retry-wrap it, do not raise a timeout to hide it, and do not delete an operation from the row.

**Known intermittent, not yours to fix:** `e2e/workspace.spec.ts` `C2(a)` fails intermittently from
a `next dev`-only tab stop injected by the Next.js dev-tools overlay (master plan §11.3 follow-up
18). If you see it, apply the charter's flaky-capture rule and move on.

## 4. Out of scope — enumerated, because most of the review is

Deferred by owner decision 17 to master plan §11.3 follow-up 19, and **not** to be resolved here:
**B1** (C5(c) certifies the string `loop={false}`), **B2** (C3(i)'s occurrence-count gate guard),
**B4** (C1(b) cannot detect a counter inside the generator), **B6** (C4's allowlists bypassed by
computed member access and `globalThis`), and **S5–S9**. Re-assigned to phase 04 as follow-up 20:
**B5** (the §11.3 follow-up 16 repair). Deferred with the keyboard decision: **S3**, **S4**'s
keyboard half, and card 1 — every session's close control **keeps** its tab stop.

Touching any of those is out-of-perimeter work, and the next reader cannot tell it from a fix.
If resolving one of the four corrections genuinely requires touching one of them, **say so in the
handoff** rather than doing it silently.

## 5. Allowed file perimeter — stated because it will be verified

```
src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx
src/features/proposal-preparation/components/session-tabs/session-tab-strip.test.tsx
src/features/proposal-preparation/components/workspace/agent-surface.tsx
src/features/proposal-preparation/hooks/use-workspace-session-store.ts
src/features/proposal-preparation/hooks/use-workspace-session-store.test.ts
e2e/session-tabs.spec.ts
e2e/workspace.spec.ts          (only to remove readiness waits correction 3 retires)
plans/phase-03-session-runtime-and-tabs.md   (your Review log entry)
master-plan.md                 (your tracker row only)
```

Anything outside this list is an automatic finding. You install nothing.

## 6. Evidence budget

**One L4 measurement: the closing stamp**, taken on the tree you hand over — `npm test`,
`npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build`. Because correction 4 is
about reproducibility, **run the end-to-end suite three times** and record all three results; that
enumerated repetition is this cycle's declared matrix, not over-budget. Everything else runs at L1.
Any further L4 requires the line "narrower evidence insufficient because …" written **before** it.

## 7. Closing protocol

1. **Every correction implemented, or declared with its reason** (charter rule 14) in its own
   section. An undeclared divergence costs the next reader a finding on a non-defect.
2. **The two new named mutations run and reverted** — C3(a)'s repair guard and C7(f)'s
   post-mount-effect regression — each recording the site, the observed failing id and assertion,
   and the revert. The plan's total is now **18**; re-derive it yourself and state your arithmetic.
3. **The closing stamp** with tree identity, plus the three end-to-end runs of §6.
4. **Tracker row 03 → `IMPLEMENTED`**, with the test counts. Touch no other row.
5. **Review log entry**: what you changed, each correction with its outcome, and — required by name
   — whether the readiness waits were retired and, if any was kept, which and why.
6. **The checkpoint commit** the moment you reach `IMPLEMENTED`, prefixed
   `CHECKPOINT (not approved): frontend 03 fix …`, staging only this cycle's declared files. Never
   `build_docs/future_implementations/`.
7. **Handoff** at `handoffs/implementer/phase-03-fix-round-4.handoff.implementer.md`, frontmatter
   `plan`, `role: implement`, `round: 4`, `state`, `date`, `actor`. Body: the corrections and their
   outcomes, the mutation records, the evidence records, your **full write perimeter**, and every
   file a probe touched listed separately. There is no architecture graph; report no graph delta.

## 8. Closing message

End with the charter's owner layer: **What I did → What I found and what it means for you → What
happens next → What needs you** — decision cards verbatim, or the single line `nothing needs you`.
Plain product language, no section numbers or file paths in that layer, one pointer line naming your
handoff file.
