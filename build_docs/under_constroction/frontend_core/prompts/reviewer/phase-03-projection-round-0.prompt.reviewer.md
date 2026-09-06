---
plan: plans/phase-03-session-runtime-and-tabs.md
role: projection
round: 0
date: 2026-09-07
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — project phase 03 before its implementer prompt is compiled

You are a **plan-projection session** for phase 03 of `frontend_core` (Proposal Copilot
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
| 3 | Predecessor approved | `build_docs/under_constroction/frontend_core/master-plan.md` §4, row `02` | the **State** cell reads `APPROVED` |
| 4 | The phase is unstarted | same table, row `03` | the **State** cell reads `NOT_STARTED` |
| 5 | The plan agrees | `plans/phase-03-session-runtime-and-tabs.md`, header table | its **State** row reads `NOT_STARTED` and its **Criteria** row reads `6` |
| 6 | The phase is genuinely unimplemented | the tree | neither `src/features/proposal-preparation/hooks/use-workspace-session-store.ts` nor `src/features/proposal-preparation/components/session-tabs/` exists, and `package.json` declares no `@radix-ui/*` dependency |
| 7 | This round is genuinely outstanding | the tree | `handoffs/reviewer/phase-03-projection-round-0.handoff.reviewer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note, so you do not stop-and-report on it:** the untracked, git-ignored directory
`build_docs/future_implementations/` is not this pipeline's work. Leave it alone.

## 2. Read first, in this order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the manifest properties, the trace
   chain, evidence scopes, the decision-card format, the owner layer.
2. `/Users/davidloorenz/agent-skills/plan-projection.md` — your doctrine.
3. `build_docs/under_constroction/frontend_core/plans/phase-03-session-runtime-and-tabs.md` — in
   full, **including its Review log**, which records the coordinator's pre-dispatch lint folds
   and the six amendments they made. This is the artifact you are projecting.
4. **Everything its "Read first" list names**, which is the whole of what the implementer will
   receive: master plan §6.1, §6.2, §6.3, §9, §10.4; intention §5.3, §8.1–§8.3, §8.5, §12A.1
   **in full**, §12A.5 **in full**, §12A.17 (the four tab focus rows), §12A.23 (the
   landmark-identity invariant across session operations); `ui_design/04-session-tabs.md` in
   full, including its "Prototype-only" list and its open design questions; contracts
   `05-client-architecture.md` §3, §5, §5.1, §5.2, §7, `03-feature-architecture.md` §1–§2, §4,
   `15-ui-styling-and-component-system.md` §5, `11-testing-principles.md` §2–§3,
   `13-decision-checklist.md` §2.
5. Additionally read master plan **§6.4** (the named constants, one of which this phase owns),
   **§6.6** (the two fixture eras), **§7.2** (why this phase's projection gate is mandatory),
   **§7.4** (the trace-cell vocabulary, which is what makes a trace cell admissible), **§7.5**
   (the structurally-held clauses and their triggers — three of this phase's rows are on it),
   **§10.3** and **§10.3A** (which runner can measure which subject; this decides where every
   criterion row of this phase can live), **§11.2** and **§11.3**.
6. The repository as it actually is — the files the plan names or touches:
   `src/features/proposal-preparation/components/workspace/` in full (`proposal-workspace.tsx`,
   `agent-surface.tsx`, `main-application-surface.tsx`, `workspace-divider.tsx`, `constants.ts`),
   `components/idle/proposal-preparation-idle-surface.tsx`, `hooks/use-divider-width.ts`,
   `types/presentation.ts`, and the two phase-02 evidence files this phase's perimeter now
   includes — `components/workspace/workspace.test.tsx` and `e2e/workspace.spec.ts`. Also
   `src/lib/proposales/index.ts` (the backend-owned `generationId`, merged and not ours to
   change), `playwright.config.ts`, `vitest.config.mts`, `vitest.setup.ts`, `package.json`,
   `README.md`.

You carry no planning-session context and no conversation history, and none is supplied here
on purpose: **what you cannot derive from the artifacts, the implementer cannot either.**

## 3. Depth targets — where this phase's silent-failure risk actually is

Allocate depth by silent-failure risk, not by apparent complexity. For each target the question
is the same: **could you write that test right now, from the artifacts alone, with one exact
expected outcome per case — including which runner executes it and against what?**

- **C1 is identity, and only two of its five rows are measurable in this phase.** The id is
  opaque at runtime by construction, so decide what an instrument can actually observe about
  "generated once per session at creation" and "never derived from the tab's index, a thread
  position, or a module-level counter". The three held rows carry named triggers; check that
  what remains still serves F8, and that the held cells say enough for phase 05 to convert them.
- **C2 and C3 are two total case tables plus a focus table.** Eight reorder rows, nine close
  rows, and §12A.17's focus destinations behind them. Per row: the exact resulting list, the
  exact active session, the exact focus destination, and the runner that can observe each. Three
  rows are quantified over something a test does not obviously have access to — C3(e)'s "no
  rendered frame contains an empty strip" and C6(a)'s "at every rendered frame" — and C2(h)'s
  subject is a drag interrupted by a creation or a close. Decide whether each is observable, and
  if it is not, say what would make it so.
- **C4's absence half is three claims over an open name universe.** Standing rules 17 and 18 and
  charter rule 15 govern them: can each instrument be written as an **allowlist** whose probe
  plants a construct no denylist would contain, and does each scan assert that it had a subject?
  This is the most expensive defect family in this pipeline's lineage. C4(a) now asserts a named
  constant's contract — check that the constant has a home a criterion can reach and that the
  scroll position it constrains is observable by the runner the row implies.
- **C5 is the accessibility contract of a composite built on a mandated primitive.** Master plan
  §6.1 fixes `@radix-ui/react-tabs` for the tablist role, roving tabindex, arrow-key movement and
  selection semantics, with reorder, close and title composed on top, and permits native elements
  where the primitive distorts the interaction. Work out which of the seven rows the primitive
  discharges, which the composition owes, and what the primitive's own structural model implies
  for the elements around it — read against §12A.23's landmark identity and design 04 §5's
  statement of what the strip labels. Standing rule 5: the primitive's presence is never proof.
- **C6 is landmark identity across a sequence of session operations**, including "both are the
  **same elements** throughout rather than replacements". Decide what a test can assert about
  element identity across activations, creations, closes and reorders, and whether C6(d) — the
  Agent Surface's structure not being a function of the active session — has a subject in a phase
  where sessions differ only by identity and title.
- **The perimeter the pre-dispatch lint drew.** The plan's §4 names a closed set of five
  phase-02 end-to-end instances that may be re-baselined and freezes everything else in the two
  inherited test files. Check that set: is there any other phase-01 or phase-02 assertion that a
  new tab stop, a new role in the shell, or new source under `src/app` or `src/features` would
  move? A frozen assertion this phase cannot satisfy is a finding now, not a surprise in review.

A criterion you cannot turn into a concrete assertion is a finding, not a detail to leave to the
implementer.

## 4. What you are proving, and what you are not

**Proving:** that the plan is implementable as written — every path and cited section resolves
and says what the plan claims, every criterion row is decidable, every trace cell is admissible
under master plan §7.4 and supports what its row asserts, every named mutation is derivable from
the criteria, and every decision the plan leaves open is recorded rather than left to be
resolved silently in code.

**Not proving:** that the code works. You write no code, edit no plan, edit no intention, edit
no contract, and edit no design specification. You install no dependency — the plan's task 3
installs one, and that is the implementer's act, not yours. Your skeleton is discarded; it may
survive only as a clearly-marked non-authoritative appendix. If the implementer receives your
sketch as guidance you have become a second planner, which is the coupling the fresh-session
rule exists to prevent.

## 5. Evidence budget — zero suite runs

**Your L4 budget is zero.** Do not run `npm test`, `npm run build`, `npm run test:e2e`,
`npm run typecheck` or `npm run lint`. The tree is byte-identical, in code, to the phase-02
approval stamp (unit 154/154, E2E 66/66, typecheck, lint and build green at gate commit
`3796dc1`); a baseline measured here would be the over-evidence defect the charter names.

**Permitted, and expected:** read-only inspection. Reading files; `grep`; `find`; reading inside
`node_modules/` to learn what a package or runner actually does; `git log` / `git status` /
`git diff`; and `npx vitest list` where it is what tells you whether a criterion row is
collectable. If some other read-only command is genuinely the only way to decide a criterion,
run it and record the line "narrower evidence insufficient because …" **before** the run.

## 6. Closing protocol

Deposit `handoffs/reviewer/phase-03-projection-round-0.handoff.reviewer.md` with the charter
row schema in its frontmatter (`plan`, `role: projection`, `round: 0`, `date`, `verdict`,
`actor: projection`), containing, in order:

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
