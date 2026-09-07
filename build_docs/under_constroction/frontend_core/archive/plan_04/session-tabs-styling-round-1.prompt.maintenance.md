---
plan: none — maintenance round, out of band by owner request
role: maintenance
round: 1
date: 2026-09-07
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — session-tab visual styling

You are a **maintenance session** for `frontend_core` in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path first and follow its
standing quality rules. Also follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`).

**This is not a phase.** No criterion covers your work and no review round is scheduled for it. That
makes the constraints below the whole of your specification — read them as the acceptance criteria
they stand in for.

## 1. What you are doing

Improving the **visual presentation** of the session tab strip that phase 03 shipped —
`src/features/proposal-preparation/components/session-tabs/`. Design authority is
`build_docs/under_constroction/frontend_core/ui_design/04-session-tabs.md` §3 (tab anatomy, active
versus inactive, the new-session button) and §6 (the states table), read against
`ui_design/01-visual-system.md`.

**Behaviour is frozen.** You change how it looks, never what it does. No change to the store, to
the key handling, to the close gate, to focus destinations, to the reveal arithmetic, or to any
element's role. If a visual improvement seems to require a behavioural change, **stop and report**
— that is a phase's work, not a maintenance round's.

## 2. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Phase 03 is closed | `master-plan.md` §4 row `03` **and** `plans/phase-03-session-runtime-and-tabs.md` header | both **State** cells read `APPROVED` |
| 2 | Phase 04 has not started | `master-plan.md` §4 row `04` | the **State** cell reads `NOT_STARTED` or `PROJECTED` — if it reads anything further, a phase is editing these files and you **stop** |
| 3 | The suite is green before you touch it | the tree | `npm test` and `npm run test:e2e` pass — 184 unit and 69 end-to-end. This is your one baseline |
| 4 | The round is outstanding | `handoffs/maintenance/` | no `session-tabs-styling-round-1` handoff exists |

**Environment note:** the untracked, git-ignored `build_docs/future_implementations/` is not this
pipeline's work. A phase-04 **projection** session may be reading the repository while you work; it
writes no code, so there is no conflict.

## 3. Five tripwires — guards phases 01 to 03 shipped, which your styling can redden

These are not obstacles; each is a real invariant, and every one has already cost this project a
round. **Read them before you write CSS, not after the suite goes red.**

1. **The theme layer is a closed allowlist.** Phase 01's `src/styles/theme.test.ts` rejects any
   custom property name not already declared in `src/styles/theme.css`. **You may not add a
   name.** If the styling genuinely needs a colour or dimension that does not exist, that is a plan
   amendment and an owner decision — **stop and report it**; do not add the property, and do not
   work around the guard with a literal.
2. **A visual value is defined once** (master plan §9 standing rule 4). Compose from the existing
   custom properties; inline `style` is only for values that cannot be known at build time.
3. **The narrow-width overflow row.** `e2e/workspace.spec.ts` `C4(<width>-2)` exempts horizontal
   overflow **only** for an element carrying the literal class `overflow-x-auto` or
   `overflow-x-scroll`, an inline `style.overflowX` of `auto`/`scroll`, or the attribute
   `data-horizontal-scroll` — and the element that actually overflows must carry one of those four,
   not merely an ancestor. Its **second half has no exemption at all**: every `div` inside either
   pane must have a `getBoundingClientRect().width` no greater than the pane's `clientWidth`.
4. **The elision marker stays on the inner title span**, never on the tab. That span's accessible
   name must equal its own text, while the tab's accessible name carries more. Moving
   `data-elided` breaks a frozen phase-02 row.
5. **The tab order is asserted by absolute counts** in five phase-02 tests. Adding or removing a
   focusable element changes them. You should not be adding one — if a visual change would, stop
   and report.

## 4. Scope fences

You do **not**: add or remove a focusable element; change any `role`, `aria-*` value or accessible
name; add a dependency; add a custom property to `theme.css`; create anything under
`src/components/ui/`; edit `vitest.config.mts`, `playwright.config.ts`, `next.config.ts` or
`eslint.config.mjs`; edit any file under `ui_design/`; edit the intention, the master plan, or any
phase plan; touch `build_docs/future_implementations/`; or change a test's assertion. Updating a
test that asserts a **class name or a colour literal** is permitted only if such a test exists and
its subject genuinely moved — say so explicitly in your handoff.

**Design deltas are recorded, never implemented as decisions** (standing rule 7). Design 04 §6
leaves the focused state *"undefined — production must define"*; defining it is legitimate work
here. Design 04's open questions 1, 2, 3 and 7 are **not** yours to resolve — report, do not decide.

## 5. Evidence budget

Your baseline (§2 check 3) and **one closing run** of `npm test`, `npm run test:e2e`,
`npm run typecheck`, `npm run lint` and `npm run build`, taken on the tree you hand over. Everything
else at L1. `C2(a)` in `e2e/workspace.spec.ts` has a history of intermittency; if it fails, re-run
it once and record both results rather than changing it.

## 6. Closing protocol

1. **The suite is green on the tree you hand over** — all five commands. A maintenance round that
   leaves the suite red is a failed round; there is no fix cycle scheduled behind you.
2. **A commit** prefixed `MAINTENANCE: session tabs styling`, staging only the files you changed.
3. **Handoff** at `handoffs/maintenance/session-tabs-styling-round-1.handoff.maintenance.md`,
   frontmatter `plan: none`, `role: maintenance`, `round: 1`, `state`, `date`, `actor`. Body: what
   you changed and why, **before/after for each visual decision**, every design delta you are
   reporting rather than implementing, any tripwire you came close to, your baseline and closing
   evidence with tree identity, and your **full write perimeter**. There is no architecture graph in
   this worktree.

Do not move any tracker row — this round owns none. Do not edit a phase plan's Review log; the
coordinator records this round where it belongs.

## 7. Closing message

End with the charter's owner layer: **What I did → What I found and what it means for you → What
happens next → What needs you** — decision cards verbatim, or the single line `nothing needs you`.
Plain product language, no file paths or section numbers in that layer, one pointer line naming your
handoff file.
