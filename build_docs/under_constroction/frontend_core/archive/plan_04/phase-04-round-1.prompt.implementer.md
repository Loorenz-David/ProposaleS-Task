---
plan: plans/phase-04-derived-presentation.md
role: implementer
round: 1
date: 2026-09-07
---

# Phase 04 — Derived presentation: status and the derivation register (implement, round 1)

## 0. Role and workspace

You are the **implementation executor** for the `frontend_core` pipeline. Follow the
implementation-executor doctrine at `/Users/davidloorenz/agent-skills/implementation-executor.md`
and the shared charter at `/Users/davidloorenz/agent-skills/pipeline-charter.md` — read both by
absolute path first and follow them as this session's doctrine.

Workspace: `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch
`proposal-copilot-frontend`. **Never enter the sibling backend worktree at
`/Users/davidloorenz/Desktop/Developer/Proposales`.** This worktree shares its stash stack with
other checkouts: never use bare `git stash` / `git stash pop`.

**`build_docs/under_constroction/frontend_core/plans/phase-04-derived-presentation.md` is your task
list. Where this prompt differs from the plan file, the plan file wins.**

## 1. Gate check — verify all seven before changing anything; stop and report on any failure

Each is content, so each tells you whether the work is genuinely outstanding.

1. `intention/frontend-core-intention.md` line 5's **Status** value begins `RATIFIED`.
2. The same file's §15 heading reads **"Ratified owner decisions (0 open)"**.
3. `master-plan.md` §4, row **03**: the `State` cell reads `APPROVED`.
4. **Both** phase-04 state cells read `PROMPT_READY` — `master-plan.md` §4 row **04**, and
   `plans/phase-04-derived-presentation.md`'s header `State` row. **If they disagree, that is a stop
   condition in itself**, whatever either says (master plan §11.3 follow-up 21).
5. `src/features/proposal-preparation/client/` does not exist.
6. `src/features/proposal-preparation/components/agent/` does not exist.
7. `src/features/proposal-preparation/types/session.ts` does not contain the string `TabStatus`.

Do not gate on the working tree being clean, on a commit SHA, or on a file count. **A second session
has been restyling the tab strip in parallel** (`fece065`, visual only, behaviour frozen). If further
styling work has landed, build on whatever is committed; do not revert it, and do not treat it as
your own.

## 2. Read first, in this order

1. `master-plan.md` §4, §6.2, §6.3, §6.4, §6.5A, §6.6, §7.4, §9 (**all** standing rules; 4, 6, 7,
   12, 13, 14, 17, 18, **18A**, 19 bind this phase directly), §10.3, §10.3A, §10.4, §11.2 deltas
   2, 18, 19, 20, §11.3 follow-ups 9, 17, 20, 21.
2. `intention/frontend-core-intention.md` §5.3, §8.2, §8.5, **§12A.3 in full** (including its
   overlap table and its 2026-09-07 precision amendment), **§12A.7 in full**, **§12A.8**,
   **§15 decision 19**.
3. `plans/phase-04-derived-presentation.md` — **in full, including its Review log.**
4. `ui_design/03-agent-surface.md` §3.2; `ui_design/04-session-tabs.md` §3.3, §5, and its
   "Prototype-only" `tabState` entry.
5. Contracts, via `architectural_contracts/01-implementation-contract-guide.md`:
   `05-client-architecture.md` §5, §7; `12-anti-patterns.md` "Components and client";
   `14-documentation-principles.md` §8.

## 3. Not optional — inherited hazards

These are not style notes. Each has already cost this project a round.

- **Ground the composite you mount, not the primitive it delegates to.** Phase 03 lost a round to a
  library default read one layer too deep. If a behaviour matters, set it explicitly at the boundary
  you own and ship a mutation that reddens when the setting is removed (standing rule 19).
- **A guard you cannot make fail is not a guard** (charter rule 15, standing rule 8). Phase 03
  shipped two that could not: one certified a source string while the real behaviour lived elsewhere,
  and one counted occurrences of a call that an alias walked straight past. If your instrument is a
  source grep, ask what it would say about a correct implementation written differently.
- **A source-scanning instrument asserts that its scan had a subject** (standing rule 18). One line.
- **Never sample a total case table.** Owner decision 18 relaxes several things; this is not one of
  them. C1, C2 and their rows are complete tables and stay complete.
- **jsdom performs no layout** (master plan §10.3A): every geometry accessor returns a hard-coded
  zero, which satisfies size and position predicates silently. It also has no `matchMedia`, applies
  no `@media` block, and resolves no `var()`. Nothing in this phase should be measuring geometry —
  if you find yourself doing so, the row is wrong, not the runner.
- **Two cascade facts, both found last week in approved code, both invisible to this suite**
  (master plan §10.3A). (1) A component consuming an **undeclared** `var(--color-*)` does not fail —
  the declaration is invalid at computed-value time and the property falls back to `currentColor`.
  A near-white hairline shipped through a review round and an approval gate that way. Every custom
  property you read must be declared in `theme.css`; check, do not assume. (2) The reduced-motion
  block in `globals.css` is deliberately **unlayered** and uses `!important`, and keyframe values
  override normal declarations — so `motion-reduce:opacity-100` cannot rescue the pulse. Use
  `motion-reduce:animate-none`. Plan task 5 states this in full; getting it wrong ships the exact
  dim dot the correction forbids, with a green suite.

## 4. Inherited tripwires — signals, not obstacles

Seven guards from earlier phases sit over files this phase edits or over files it must **not**
edit. The plan's own "Inherited tripwires" section is authoritative; the two that will bite first:

- **`workspace.test.tsx:108` scans all of `src/features`** for
  `/Registry|SurfaceMap|surfaceFactory|createSurface|resolveSurface|SurfaceProvider|plugin|extension/`.
  You are building a **register**. Name it `DERIVATION_REGISTER` / `DerivationRegisterRow`. The
  substring `Registry` anywhere under `src/features` turns the suite red in a file you may not touch.
- **Four end-to-end tests count absolute `Tab` presses.** **This phase adds no focusable element.**

## 5. Scope fences

- **No unread counter, no attention badge, no status announcement.** They moved to phase 05 by owner
  decision 20. If a criterion seems to need one, re-read the plan — it does not.
- **No status note.** Owner decision 19 removed it from V1. Do not invent product copy.
- **Add no custom property to `src/styles/theme.css`.** Every dot colour is an existing ramp entry,
  named in plan task 4.
- **`workspace.test.tsx` and `e2e/workspace.spec.ts` change by exactly one line each** (plan tasks 7
  and 8). Any other edit to either file is a finding.
- **No turn dispatch, no close guard, no agent header, no thread.** Those are phases 05 and 06.
- Do not edit anything under `ui_design/` (standing rule 7) and never stage
  `build_docs/future_implementations/`.

## 6. Explicit delegations — yours to decide, on purpose

The plan's "Explicit delegations" section lists three, with their constraints: the mechanism carrying
the tab's accessible name; the status line's markup and placement inside the agent surface; and the
shape of `TabViewModel`. Decide them, and say in your handoff what you decided and why.

## 7. Evidence budget

**This session's L4 budget is exactly one run**: the closing stamp, mandatory, taken on the tree you
hand over. If you change anything after taking it, re-take it — the re-take is not over budget,
because the stamp is defined by the tree and not by the count. Everything else runs at L1 or L2.
Any additional L4 requires the charter's authorization line, written **before** the run.

Do not re-run evidence whose tree identity matches yours. Over-evidence is a defect, symmetrically.

## 8. Closing protocol

1. Every one of the **5 named mutations** — C2(h), C3(d), C6(c), C7(a), C7(b) — is applied on the
   tree, its red observed, and reverted. Each is applied at the **file and site the row names**; a
   mutation "verified by inspection" is unrun. Two of them (C3(d), C6(c)) name a store site **and** a
   read site, and both halves are required: storing a value nothing reads reddens nothing.
2. The **2 held rows** — C3(b) whole, C6(a)'s closure half — are **not** implemented and not waived.
   Leave them marked held. Writing a test for either is a finding.
3. Standing rule 13: confirm every new test file under `src/features/**` appears in `npx vitest list`.
4. Closing stamp: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`,
   `npm run build`. **`test:e2e` and `build` are part of green** (standing rule 16).
5. Contract 14 §8's documentation impact review.
6. Move **both** phase-04 state cells to `IMPLEMENTED` in the same edit — `master-plan.md` §4 row 04
   and the plan file's header (follow-up 21's interim rule).
7. Write the phase's Review log entry in the plan file.
8. Checkpoint commit, subject prefixed `CHECKPOINT (not approved):`, staging only this cycle's
   declared files plus the tracker and Review-log edits it actually made (standing rule 15).
9. Deposit your handoff at
   `handoffs/implementer/phase-04-round-1.handoff.implementer.md`, with frontmatter
   `plan`, `role`, `round`, `date`, `state`, `actor`, and a body that declares your **full write
   perimeter** — every document, every source file, every test file, every mutation-probe file — plus
   the mutation ledger (one row per named mutation: the site, the observed red, the revert), the
   evidence records with their tree identity, every delegation you decided, and any **candidate
   criterion** you found (a test with no row: declare it, do not ship it silently).
10. Your final chat message is the **owner layer**: What I did → What I found and what it means for
    you → What happens next → What needs you. No section numbers, no `file:line`, no term of art
    without a plain-word gloss. Under ~300 words. One pointer line names the handoff file.

If a gate fails, or the plan contradicts itself in a way you cannot resolve, **stop and report
without changing anything.** A correct stop costs one message; a wrong guess costs a round.
