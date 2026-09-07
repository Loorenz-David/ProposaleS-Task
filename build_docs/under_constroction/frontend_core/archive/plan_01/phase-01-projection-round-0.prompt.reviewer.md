---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: projection
round: 0
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — project phase 01 before its implementer prompt is compiled

You are a **plan-projection session** for phase 01 of `frontend_core` (Proposal Copilot
Frontend Core) in `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch
`proposal-copilot-frontend`. Run every command from that worktree root. **Never enter the
sibling backend worktree** `/Users/davidloorenz/Desktop/Developer/Proposales`; the backend
artifacts you need are merged into this one.

Follow the `plan-projection` doctrine. If you are a Claude session, invoke the
`plan-projection` skill; otherwise read `/Users/davidloorenz/agent-skills/plan-projection.md`
and `/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them as
this session's doctrine. Also follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`, routed through
`architectural_contracts/01-implementation-contract-guide.md`): judging whether a plan's
criteria are decidable is a material review act, so route before you reason about them.

**The plan file is your subject. Where this prompt differs from the plan file, the master
plan, the ratified intention, a design specification, or an applicable architecture contract,
those authorities win.**

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 | the heading reads `Ratified owner decisions (0 open)` |
| 3 | The phase is unstarted | `build_docs/under_constroction/frontend_core/master-plan.md` §4, row `01` | the **State** cell reads `NOT_STARTED` |
| 4 | The plan agrees | `plans/phase-01-baseline-and-visual-foundation.md`, header table | its **State** row reads `NOT_STARTED` |
| 5 | The phase is genuinely unimplemented | the tree | `src/styles/theme.css` does not exist |
| 6 | This round is genuinely outstanding | the tree | `handoffs/reviewer/phase-01-projection-round-0.handoff.reviewer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note, so you do not stop-and-report on it:** the untracked directory
`build_docs/future_implementations/` is not this pipeline's work. Leave it alone. It is
recorded here so a tree inspection attributes it correctly.

## 2. Read first, in this order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the manifest properties, the trace
   chain, evidence scopes, the decision-card format, the owner layer.
2. `/Users/davidloorenz/agent-skills/plan-projection.md` — your doctrine.
3. `build_docs/under_constroction/frontend_core/plans/phase-01-baseline-and-visual-foundation.md`
   — in full. This is the artifact you are projecting.
4. **Everything its "Read first" list names**, which is the whole of what the implementer will
   receive: master plan §2, §5, §6.1, §6.3, §6.4, §9, §10 (all of §10) and §11.3; intention
   §2.1, §4, §5.9, §13 conflict **C-4**, §14.3 items 1 and 4, §15.1 item (k);
   `ui_design/01-visual-system.md` in full and `ui_design/10-design-integration-guide.md` §1,
   §4, §5, §7; contracts `15-ui-styling-and-component-system.md` §1–§6,
   `05-client-architecture.md` §7, `11-testing-principles.md` §1–§3, `12-anti-patterns.md`
   "Styling and UI system", `14-documentation-principles.md` §8, `13-decision-checklist.md`
   §5 and §8.
5. Additionally read master plan **§7.4** (the trace-cell vocabulary), because criterion-row
   trace verification is step 6 of your procedure and §7.4 is what makes a trace cell
   admissible in this project.
6. The repository as it actually is — the files the plan names: `src/styles/globals.css`,
   `src/app/layout.tsx`, `src/app/page.tsx`, `vitest.config.mts`, `vitest.setup.ts`,
   `test/setup/node.ts`, `e2e/bootstrap.spec.ts`, `postcss.config.mjs`, `README.md`,
   `architectural_contracts/README.md`, `package.json`, `eslint.config.mjs`,
   `playwright.config.ts`, `.github/workflows/ci.yml`.

You carry no planning-session context and no conversation history, and none is supplied here
on purpose: **what you cannot derive from the artifacts, the implementer cannot either.**

## 3. Depth targets — where this phase's silent-failure risk actually is

Allocate depth by silent-failure risk, not by apparent complexity. Phase 01 is a
foundation phase whose criteria are unusually guard-shaped, and this is where the
projection earns its cost:

- **C5 is four absence rows** — `tokens.css` absent, `src/components/ui/` absent, no
  `*.module.css`, no CSS-in-JS dependency — each with a planted-defect probe. Charter rule 15
  is the most expensive defect family in this pipeline's lineage and its fifth recorded
  instance was authored by a reviewer. Measuring an absence proves the absence; it does not
  prove the instrument could ever observe the presence.
- **C1 is a source-level purity check** with its own scope assertion (C1(c)).
- **C4 is a set relation over discovered test files and configured runner projects**, asserted
  as a partition rather than as a count.
- **C2 and C3 assert what a rendered document actually computes**, not what a stylesheet says.
- **C6 asserts an end-to-end suite is green** against a tree that does not yet exist.

For each: could you write that test **right now**, from the artifacts alone, with one exact
expected outcome per case — including *which runner executes it and against what*? A criterion
you cannot turn into a concrete assertion is a finding, not a detail to leave to the
implementer.

## 4. What you are proving, and what you are not

**Proving:** that the plan is implementable as written — every path and cited section resolves
and says what the plan claims, every criterion row is decidable, every trace cell is
admissible under master plan §7.4 and supports what its row asserts, every named mutation is
derivable from the criteria, and every decision the plan leaves open is recorded rather than
left to be resolved silently in code.

**Not proving:** that the code works. You write no code, edit no plan, edit no intention, edit
no contract, and edit no design specification. Your skeleton is discarded; it may survive only
as a clearly-marked non-authoritative appendix. If the implementer receives your sketch as
guidance you have become a second planner, which is the coupling the fresh-session rule exists
to prevent.

## 5. Evidence budget — zero suite runs

**Your L4 budget is zero.** Do not run `npm test`, `npm run build`, `npm run test:e2e`,
`npm run typecheck` or `npm run lint`.

The reason is not cost. **Phase 01's own task 1 is the authoritative re-enumeration of the
repository baseline**, and it is the first thing the implementer does. A baseline measured
here would be evidence on a tree the implementer then has to measure again — the
over-evidence defect the charter names, in its most avoidable form — and it would spend the
observation this phase exists to make.

**Permitted, and expected:** read-only inspection. Reading files; `grep`; `find`;
`git log` / `git status` / `git diff`; and `npx vitest list` (a collection listing, not a test
run) where it is what tells you whether C4 is decidable. If some other read-only command is
genuinely the only way to decide a criterion, run it and record the line "narrower evidence
insufficient because …" **before** the run.

## 6. Closing protocol

Deposit `handoffs/reviewer/phase-01-projection-round-0.handoff.reviewer.md` with the charter
row schema in its frontmatter (`plan`, `role: projection`, `round: 0`, `date`, `verdict`,
`actor`), containing, in order:

1. **The verdict** — `PROJECTED_CLEAN` (empty ledger) or `AMENDMENTS_REQUIRED`.
2. **An owner-readable opening**, 3–5 sentences, no citations and no jargon: what the
   projection concluded, whether anything needs the owner personally, and what happens next.
3. **`⚠ OWNER DECISIONS REQUIRED (n)`**, immediately after that opening — every gap only the
   owner can settle, each as a charter decision card (question, story, branches,
   one recommendation, on-silence, trace), under ~120 words. A finding cites its card; the
   card never restates the finding. If nothing needs the owner, one line saying so.
4. **The decision ledger**, as a table: decision point / classification (`plan gap` /
   `intention gap` / `free choice`) / proposed routing. A `free choice` is proposed as an
   **explicit delegation** to the implementer, in writing, so the freedom is granted on
   purpose rather than taken silently. The goal is zero *silent* freedom, not zero freedom.
5. **Reality-check and decidability findings**, each with its exact artifact and line.
6. **Trace verification, both directions**, per §7.4.
7. **The gate check result**, row by row.
8. **Your full write perimeter** — every document written, every command run, and the explicit
   statements that no code changed, no plan or intention or contract or design specification
   was edited, no dependency was installed, and no suite, build or end-to-end run was taken.
   There is no architecture graph in this worktree; a session reporting a graph delta has
   reported something that does not exist.

Do **not** write the phase plan's Review log line; the coordinator writes it when it consumes
your handoff. Do not update the tracker; the row moves when the coordinator routes your
ledger.

## 7. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it
means for you → What happens next → What needs you** — decision cards relayed verbatim, or the
single line `nothing needs you`. Plain product language, no section numbers or file paths in
that layer, one pointer line naming your handoff file.
