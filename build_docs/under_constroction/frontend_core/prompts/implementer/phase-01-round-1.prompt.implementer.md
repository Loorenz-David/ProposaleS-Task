---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: implementer
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — implement phase 01

You implement **phase 01 of `frontend_core`** in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `implementation-executor` doctrine: invoke the `implementation-executor` skill, or
read `/Users/davidloorenz/agent-skills/implementation-executor.md` and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them. Also
follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`), routed through
`architectural_contracts/01-implementation-contract-guide.md`, and re-emit your contract
selection in the Review log before coding.

**The plan file is your task list and your acceptance criteria. Where this prompt differs from
the plan file, the master plan, the ratified intention, a design specification, or an applicable
architecture contract, those authorities win.**

This phase went through a projection round; its 21 findings are already folded into the plan and
the master plan. **You are reading the amended plan.** Nothing from that round is outstanding.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | Predecessor gate | — | phase 01 is the first phase; it has no predecessor. Nothing to check |
| 3 | The phase is projected and dispatched | `master-plan.md` §4, row `01` | the **State** cell reads `PROJECTED` or `PROMPT_READY` |
| 4 | The plan agrees | `plans/phase-01-baseline-and-visual-foundation.md`, header | its **State** row reads `PROJECTED` or `PROMPT_READY`, and its **Criteria** row reads `8` |
| 5 | The work is genuinely outstanding | the tree | `src/styles/theme.css` does not exist |
| 6 | This round is outstanding | the tree | `handoffs/implementer/phase-01-round-1.handoff.implementer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Two environment notes, so you do not stop-and-report on them.** The untracked directory
`build_docs/future_implementations/` is not this pipeline's work — leave it alone and never
stage it. The consumed projection handoff sits in `handoffs/reviewer/`; it is the phase's record
and moves to the archive at closeout, not now.

## 2. Read order

1. `master-plan.md` — §2, §5, §6.1, §6.2, §6.3, §6.4, **§6.5A**, §9 (all sixteen standing
   rules), §10 in full (**including §10.3 and §10.3A**), §11.3.
2. The semantic authorities the plan names: intention §2.1, §4, §5.9, §13 conflict **C-4**,
   §14.3 items 1 and 4, §15.1 item (k).
3. `ui_design/01-visual-system.md` in full, then `ui_design/10-design-integration-guide.md`
   §1, §4, §5, §7.
4. `plans/phase-01-baseline-and-visual-foundation.md` — in full, including its Review log,
   which records what the projection changed and why.
5. The contracts the plan names, and the backend master plan §10.3 hazard.
6. The repository files the plan's Read-first list names.

**Pattern-authority rule:** contracts teach how to write code. Open existing implementation
files only to learn what exists.

## 3. Task 1 is non-negotiable, and it comes before everything

**Re-enumerate the baseline before changing anything.** Run all five, in this order, on the tree
as you receive it, and record each exact observed result with its tree identity in the Review
log:

```
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

**Every baseline statement in master plan §10.2 was derived by reading, and none has been
observed.** Three predictions are waiting for you, and each has a criterion — so confirm or
**correct** each rather than inheriting it:

1. **The end-to-end step is expected red**, and CI runs it on every push. `e2e/bootstrap.spec.ts`
   asserts a `banner` landmark, a visible `main`, and a focusable "Skip to content" link;
   `src/app/layout.tsx` renders a bare `<html><body>{children}</body></html>` and
   `src/app/page.tsx` returns `null`.
2. **Seven of the sixteen custom properties `src/styles/globals.css` reads have no definition
   anywhere** — the five `--color-*` and the two `--space-*`. Tailwind 4's default theme supplies
   the other nine.
3. **The Vitest project globs do not partition the tree**, and the gap is exactly where phases
   02–15 write tests.

If any prediction is wrong, the correction goes in the Review log **and** into master plan §10.2,
which is the section that carries them.

## 4. Scope fences — enumerated, and absolute

Work belonging to another phase is not "while I'm here" work. Specifically, this phase does
**not**:

1. add a workspace shell, a `banner`, a `main`, a skip link, or any landmark — **phase 02**;
2. add any session concept, store, tab, or runtime record — **phase 03**;
3. add any feature component or hook. The only new files under `src/features/` are the **two
   collection sentinel test files** the plan admits by name;
4. add any product surface at all. C2's focus and reduced-motion subject is a native control
   **the end-to-end test injects into the running `/` document and disposes with the page** —
   not an element added to `src/app/`;
5. install any package. `package.json` and `package-lock.json` are unchanged at close. Radix
   arrives in phase 03 with the widget that justifies it;
6. create `src/styles/tokens.css`, anything under `src/components/ui/`, or any `*.module.css`;
7. edit any file under `ui_design/` — a design delta is recorded, never implemented as a design
   decision;
8. edit the intention, the master plan (beyond your own tracker row), any phase plan other than
   this one's Review log, or any architecture contract other than the four the plan's file list
   names (`README.md`, `architectural_contracts/README.md`, contract 15, contract 12);
9. add the Radix and Lucide rows to the **root** README's tech-stack table — that is **phase 03**
   (master plan §11.3 follow-up 6). This phase touches the root README's status paragraph,
   styling line, tree diagram and shell sentence only;
10. create a `docs/` folder. This repository's documentation root is `build_docs/`;
11. stage `build_docs/future_implementations/` in any commit.

If the plan seems to require something on this list, **stop and report** — do not resolve it in
code.

## 5. The eleven named mutations — enumerated, all eleven must run

Master plan standing rule 8 and charter rule 15: a guard, an absence claim or a purity check
ships with its planted-defect probe — the defect planted **on the tree**, the red observed, the
probe reverted, the ledger row written. "Verified by inspection" is not a run.

**`executed != declared` blocks `IMPLEMENTED`.** The plan declares eleven; the summands are
C1 2 · C2 1 · C3 1 · C4 1 · C5 4 · C6 0 · C7 1 · C8 1 = **11**. Re-derive this from the
criteria yourself and state your arithmetic. Each row records the site (file, and
definition-versus-call-site), the **observed** failing id and assertion, and the revert.

| # | Criterion | Plant this | This must redden |
|---|---|---|---|
| 1 | C1(c) | a raw hex colour in a consuming file under `src/**`, outside the theme layer and `globals.css` | C1(a)'s check |
| 2 | C1(d) | a second `outline: none` under `src/**`, outside the one-entry allowlist | C1(b)'s check |
| 3 | C2(c) | delete the reduced-motion block from `globals.css` | C2(b) |
| 4 | C3(b) | remove one custom property's definition from the theme layer | that property's own row in C3(a) — name which |
| 5 | C4(g) | a test file at a path outside every include glob | C4(a) |
| 6 | C5(e) for (a) | create `src/styles/tokens.css` | C5(a) |
| 7 | C5(e) for (b) | create a file under `src/components/ui/` | C5(b) |
| 8 | C5(e) for (c) | create a `*.module.css` under `src/` | C5(c) |
| 9 | C5(e) for (d) | point the manifest check at a **fixture manifest** carrying a forbidden dependency — install nothing, do not edit `package.json` | C5(d) |
| 10 | C7(c) | declare a component-level value in the theme layer | C7(b) |
| 11 | C8(c) | reintroduce one unqualified reference to a deleted artefact in a patched document | that document's row in C8(a) — name which |

**A probe that lands in the wrong place measures nothing, and its green is the most dangerous
result available.** If a probe comes back green where you expected red, suspect the siting before
concluding the guard is broken — and if you re-site it, say so in the ledger.

List every file a probe touched in your handoff, **separately from your own changes**. That is
what keeps "nothing changed outside the perimeter" falsifiable.

## 6. Decisions delegated to you, in writing

These are granted on purpose. Make the smallest reasonable choice and **record each in the Review
log with the reason**:

1. **C1(a)'s lexical rule** — what counts as a raw hex colour, a raw `px` type size, a raw radius
   or shadow literal; whether Tailwind arbitrary values (`text-[13px]`, `rounded-[9px]`,
   `shadow-[…]`) are caught; which `.css` files under `src/**` are in scope. Anchor on contract
   15 §2's own signal examples (`text-[#1f5eff]`, `p-[13px]`). **Record the forms it deliberately
   does not catch** — that sentence is part of the criterion.
2. **How `theme.css` reaches Tailwind's processing** — an `@import` inside `globals.css`, or an
   import in `layout.tsx`. A `@theme` block Tailwind never processes emits nothing.
3. **`@theme` versus `@theme static`** — flagged by name because it has a real failure mode:
   Tailwind 4.3.3 prunes unused theme values under the default, and `--space-4` / `--space-8` are
   consumed by no utility, so under pruning they may never reach `:root`. This is exactly what
   C3(a) exists to catch, and it is why C3 is measured in the browser.
4. **Whether `color-scheme: dark` is declared** — design 01 §1.1 describes a dark application.
5. **The form of the design-delta marker** task 3 asks for.
6. **The file name** behind `src/styles/theme.test.ts`.

## 7. Evidence budget

Two L4 measurements are authorized for this cycle, and no more:

1. **Task 1's baseline re-enumeration** — the five commands above, once, on the tree as you
   receive it, before the first edit. This is the phase's own enumerated L4 matrix (charter:
   baseline re-enumeration), not over-budget.
2. **The closing stamp**, taken on the tree you actually hand over: `npm test` **plus**
   `npm run typecheck` **plus** `npm run lint`, **plus `npm run test:e2e` and `npm run build`** —
   because this phase changes the styling entry point and rendered structure and CI runs both
   (master plan standing rule 16, §10.4 L4+). If you change anything after taking the stamp, you
   re-take it; the re-take is not over-budget.

Everything else runs at **L1** (`npx vitest run <path> [-t "<name>"]`) or **L2**
(`npx vitest run --project jsdom src/features/proposal-preparation`). Playwright rows run at
their own file scope.

Any further L4 requires one line written **before** the run: "narrower evidence insufficient
because …". Re-running evidence whose tree identity matches yours, with no variation and no such
line, is a finding against this session.

## 8. Closing protocol

In order, per the executor doctrine:

1. **Task 0's coverage map first** — one line per criterion **row** (all 31), before you edit
   production code: row → the test id that discharges it → whether that test's assertion is the
   shape the row specifies or something weaker. Any cell you cannot fill is a finding you have
   just made; report it, never invent coverage. Then transcribe every row into an executable case
   and record the red baseline before the first production edit.
2. **The map runs both ways.** Every test in this phase's test files appears in the map against a
   criterion row. A test discharging no row is deleted, or declared in the Review log as a
   **candidate criterion** — naming the defect it catches and the ledger entry or contract it
   serves — for the coordinator to fold in or refuse with a recorded reason.
3. **The closing L4+ stamp** (§7), with tree identity and the failure-ID delta against your task-1
   baseline.
4. **All eleven mutations run and reverted** (§5), each a full evidence record.
5. **Documentation impact review.** Verbatim, per master plan standing rule 9:
   > Before closing implementation, evaluate documentation impact according to
   > `architectural_contracts/14-documentation-principles.md`. Update any authoritative
   > documentation made false, incomplete, or misleading by the verified implementation. Do not
   > modify documentation merely because files changed.
6. **Tracker row 01 → `IMPLEMENTED`**, with date, actor and a one-line note carrying the test
   counts. Touch no other row.
7. **Review log entry** in the plan file: what you built, every delegated decision with its
   reason, every judgment call, any deviation with justification, and any observation a reviewer
   needs.
8. **The checkpoint commit**, the moment you reach `IMPLEMENTED`, under the owner's standing
   authorization — no round stops to ask. Subject line prefixed
   `CHECKPOINT (not approved): frontend 01 …`. Stage **only** this cycle's declared files plus
   the tracker and Review-log edits you actually made (master plan standing rule 15). Never
   `build_docs/future_implementations/`.
9. **Handoff** at `handoffs/implementer/phase-01-round-1.handoff.implementer.md`, frontmatter
   `plan`, `role: implement`, `round: 1`, `state`, `date`, `actor`. Body: the coverage map, the
   mutation ledger with its arithmetic, the baseline and closing evidence records, the delegated
   decisions, your **full write perimeter** (documents, code, dependencies, commands, commits),
   and **every file a mutation probe touched, listed separately from your own changes**.
   Any question only the owner can settle goes in a `⚠ OWNER DECISIONS REQUIRED (n)` section
   immediately after your opening summary, in charter card format — never buried in a paragraph.
   There is **no architecture graph** in this worktree; report no graph delta.

Counts are derived from the artefact they count, never typed forward (standing rule 11).

## 9. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it means
for you → What happens next → What needs you** — decision cards verbatim, or the single line
`nothing needs you`. Plain product language, no section numbers or file paths in that layer, one
pointer line naming your handoff file.
