---
plan: plans/phase-02-workspace-shell.md
role: projection
round: 0
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — project phase 02 before its implementer prompt is compiled

You are a **plan-projection session** for phase 02 of `frontend_core` (Proposal Copilot
Frontend Core) in `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch
`proposal-copilot-frontend`. Run every command from that worktree root. **Never enter the
sibling backend worktree** `/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `plan-projection` doctrine: read `/Users/davidloorenz/agent-skills/plan-projection.md`
and `/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path, in that order, and
follow them as this session's doctrine. Also follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`, routed through
`architectural_contracts/01-implementation-contract-guide.md`): judging whether a plan's criteria
are decidable is a material review act, so route before you reason about them.

**The plan file is your subject. Where this prompt differs from the plan file, the master plan,
the ratified intention, a design specification, or an applicable architecture contract, those
authorities win.**

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 | the heading reads `Ratified owner decisions (0 open)` |
| 3 | Predecessor approved | `build_docs/under_constroction/frontend_core/master-plan.md` §4, row `01` | the **State** cell reads `APPROVED` |
| 4 | The phase is unstarted | same table, row `02` | the **State** cell reads `NOT_STARTED` |
| 5 | The plan agrees | `plans/phase-02-workspace-shell.md`, header table | its **State** row reads `NOT_STARTED` and its **Criteria** row reads `6` |
| 6 | The phase is genuinely unimplemented | the tree | `src/features/proposal-preparation/components/workspace/` does not exist |
| 7 | This round is genuinely outstanding | the tree | `handoffs/reviewer/phase-02-projection-round-0.handoff.reviewer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note, so you do not stop-and-report on it:** the untracked, git-ignored directory
`build_docs/future_implementations/` is not this pipeline's work. Leave it alone.

## 2. Read first, in this order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the manifest properties, the trace
   chain, evidence scopes, the decision-card format, the owner layer.
2. `/Users/davidloorenz/agent-skills/plan-projection.md` — your doctrine.
3. `build_docs/under_constroction/frontend_core/plans/phase-02-workspace-shell.md` — in full,
   **including its Review log**, which records the coordinator's pre-dispatch lint folds. This
   is the artifact you are projecting.
4. **Everything its "Read first" list names**, which is the whole of what the implementer will
   receive: master plan §6.1, §6.2, §6.3, §6.4, §9, §10.4; intention §1, §5.1, §6, §12A.17 (the
   divider-reset row), §12A.19, §12A.22 (A) row 4 and "What the idle state is, and is not",
   §12A.23 in full, §14.3 items 2, 3, 5a; `ui_design/02-workspace-shell.md` in full and
   `ui_design/10-design-integration-guide.md` §7; contracts `02-runtime-boundaries.md` §1–§3,
   §5, `03-feature-architecture.md` §1–§4, `05-client-architecture.md` §2, §5, §7,
   `15-ui-styling-and-component-system.md` §1, §3, `12-anti-patterns.md` "Components and
   client" and "Structure and abstraction", `11-testing-principles.md` §2–§3.
5. Additionally read master plan **§3A** (this window's authorization), **§6.5A** (the theme
   layer's closed name set), **§7.4** (the trace-cell vocabulary, which is what makes a trace
   cell admissible), **§10.3** and **§10.3A** (which runner can measure which subject — this
   decides where every criterion row of this phase can live), and **§11.2**, **§11.3**.
6. The repository as it actually is — the files the plan names or touches: `src/app/layout.tsx`,
   `src/app/page.tsx`, `src/styles/globals.css`, `src/styles/theme.css`,
   `src/styles/theme.test.ts` (phase 01's guards, which this phase's code must satisfy),
   `e2e/bootstrap.spec.ts`, `vitest.config.mts`, `vitest.setup.ts`, `playwright.config.ts`,
   `eslint.config.mjs`, `package.json`, `README.md`, and the two collection sentinels under
   `src/features/proposal-preparation/`.

You carry no planning-session context and no conversation history, and none is supplied here
on purpose: **what you cannot derive from the artifacts, the implementer cannot either.**

## 3. Depth targets — where this phase's silent-failure risk actually is

Allocate depth by silent-failure risk, not by apparent complexity:

- **C5 is four absence rows over an open universe plus two planted probes.** Each row now names
  its instrument. For each: can the instrument named be written so that the probe named in (e)
  turns it red, and does it observe the presence it claims to observe rather than measuring an
  absence the codebase happens not to write? Charter rule 15 is the most expensive defect family
  in this pipeline's lineage.
- **C4 is a rendered-layout invariant at four widths**, one of which (the V1 floor) and one of
  which (the designed wide width) may or may not be fixed numerically by any authority. Can each
  of the five conditions be turned into a concrete browser assertion with one exact outcome, and
  what does "the agent pane is never rendered below its stated minimum" mean at a width narrower
  than the agent minimum plus the seam?
- **C2 and C3 together are the clamp and the separator.** C3's ordering row is the one whose
  opposite is the natural implementation. C2(b) asks for the *effective* maximum at two viewport
  widths; C2(c) enumerates seven keyboard rows; C2(d) is an announcement count. For each row:
  which runner can observe the subject (master plan §10.3A), and what does the hook or component
  need to receive for a Vitest test to be able to observe it at all (a container width, a resize
  observation, pointer capture)?
- **C1 and C6 assert landmark identity and an honest empty state.** "Neither is remounted by
  anything" and "moves no focus and fires no announcement of its own" are claims about what does
  *not* happen — decide what a test can assert.
- **The named constants of master plan §6.4** — which module they live in, what a criterion may
  assert about them, and whether every value they need is determined.

For each: could you write that test **right now**, from the artifacts alone, with one exact
expected outcome per case — including *which runner executes it and against what*? A criterion
you cannot turn into a concrete assertion is a finding, not a detail to leave to the
implementer.

## 4. What you are proving, and what you are not

**Proving:** that the plan is implementable as written — every path and cited section resolves
and says what the plan claims, every criterion row is decidable, every trace cell is admissible
under master plan §7.4 and supports what its row asserts, every named mutation is derivable from
the criteria, and every decision the plan leaves open is recorded rather than left to be
resolved silently in code.

**Not proving:** that the code works. You write no code, edit no plan, edit no intention, edit
no contract, and edit no design specification. Your skeleton is discarded; it may survive only
as a clearly-marked non-authoritative appendix. If the implementer receives your sketch as
guidance you have become a second planner, which is the coupling the fresh-session rule exists
to prevent.

## 5. Evidence budget — zero suite runs

**Your L4 budget is zero.** Do not run `npm test`, `npm run build`, `npm run test:e2e`,
`npm run typecheck` or `npm run lint`. The tree is byte-identical, in code, to the phase-01
approval stamp; a baseline measured here would be the over-evidence defect the charter names.

**Permitted, and expected:** read-only inspection. Reading files; `grep`; `find`;
`git log` / `git status` / `git diff`; and `npx vitest list` where it is what tells you whether
a criterion row is collectable. If some other read-only command is genuinely the only way to
decide a criterion, run it and record the line "narrower evidence insufficient because …"
**before** the run.

## 6. Closing protocol

Deposit `handoffs/reviewer/phase-02-projection-round-0.handoff.reviewer.md` with the charter
row schema in its frontmatter (`plan`, `role: projection`, `round: 0`, `date`, `verdict`,
`actor: projection (Fable window 01)`), containing, in order:

1. **The verdict** — `PROJECTED_CLEAN` (empty ledger) or `AMENDMENTS_REQUIRED`.
2. **An owner-readable opening**, 3–5 sentences, no citations and no jargon: what the
   projection concluded, whether anything needs the owner personally, and what happens next.
3. **`⚠ OWNER DECISIONS REQUIRED (n)`**, immediately after that opening — every gap only the
   owner can settle, each as a charter decision card (question, story, branches, one
   recommendation, on-silence, trace), under ~120 words. A finding cites its card; the card
   never restates the finding. If nothing needs the owner, one line saying so.
4. **The decision ledger**, as a table: decision point / classification (`plan gap` /
   `intention gap` / `free choice`) / proposed routing. A `free choice` is proposed as an
   **explicit delegation** to the implementer, in writing, so the freedom is granted on purpose
   rather than taken silently. The goal is zero *silent* freedom, not zero freedom.
5. **Reality-check and decidability findings**, each with its exact artifact and line.
6. **Trace verification, both directions**, per master plan §7.4.
7. **The gate check result**, row by row.
8. **Your full write perimeter** — every document written, every command run, and the explicit
   statements that no code changed, no plan or intention or contract or design specification
   was edited, no dependency was installed, and no suite, build or end-to-end run was taken.
   There is no architecture graph in this worktree; a session reporting a graph delta has
   reported something that does not exist.

Do **not** write the phase plan's Review log line; the coordinator writes it when it consumes
your handoff. Do not update the tracker; the row moves when the coordinator routes your
ledger. Do not commit.

## 7. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it
means for you → What happens next → What needs you** — decision cards relayed verbatim, or the
single line `nothing needs you`. Plain product language, no section numbers or file paths in
that layer, one pointer line naming your handoff file.
