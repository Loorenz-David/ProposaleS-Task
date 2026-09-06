---
plan: plans/phase-02-workspace-shell.md · plans/phase-03-session-runtime-and-tabs.md · plans/phase-04-derived-presentation.md · plans/phase-05-turn-dispatch-and-close-guard.md
role: coordinator (autonomous window — coordinator, projection, implementer, reviewer sub-contexts)
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
window: Astra window 01
authorized by: the owner (David), in this document
---

/goal

# Proposal Copilot Frontend Core — Autonomous Implementation Window 01
## Execute frontend phases 02 through 05

Repository / worktree: `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`
Expected branch: `proposal-copilot-frontend`
Run every command from that worktree root. **Never enter or modify the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

| Authority | Path |
|---|---|
| Primary implementation authority (shared skeleton, tracker, standing rules, environment) | `build_docs/under_constroction/frontend_core/master-plan.md` |
| Ratified product intention (semantics, ledger F1–F30, mechanism contracts §12A.1–§12A.23) | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md` |
| Architecture routing authority | `architectural_contracts/01-implementation-contract-guide.md`, reached through `AGENTS.md` → `agent-skills/policy/architecture-context-policy.md` |
| Phase plans (the task list and acceptance criteria of each phase) | `build_docs/under_constroction/frontend_core/plans/phase-0{2,3,4,5}-*.md` |
| Design specifications (visual, layout, interaction truth) | `build_docs/under_constroction/frontend_core/ui_design/`, read `10-design-integration-guide.md` first |
| Pipeline doctrine (how every session in this pipeline works) | §0 below — read before anything else |

Relative paths in this document resolve from `build_docs/under_constroction/frontend_core/`
unless they start with `src/`, `e2e/`, `architectural_contracts/`, `agent-skills/` or a root
file name.

────────────────────────────────────────────────────────────
0. DOCTRINE — READ FIRST, BY ABSOLUTE PATH
────────────────────────────────────────────────────────────

This pipeline's workflow is not defined by this document. It is defined by the doctrine files
below, which every session in this project follows. They are plain markdown; only the
auto-loading is Claude-specific, which is why you read them by absolute path. Codex adapters for
each role exist in `~/.codex/skills/<role>/SKILL.md` and point at the same files.

Read, in this order, in full:

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the shared authority: artifact map,
   folder layout and row schema, state machine and gates, phase manifest, trace chain, review
   protocol, test-evidence scopes L1–L4 and the evidence budget, decision-card format, the owner
   layer, the standing quality rules.
2. `/Users/davidloorenz/agent-skills/pipeline-coordinator.md` — your own doctrine for this window:
   just-in-time prompts, adversarial handoff consumption, the pre-dispatch plan lint (five manifest
   properties, each with its command), the content-only gate rule, the closeout ritual, fold-back.
3. `/Users/davidloorenz/agent-skills/plan-projection.md`, `/Users/davidloorenz/agent-skills/implementation-executor.md`,
   `/Users/davidloorenz/agent-skills/plan-reviewer.md` — the doctrine of the three sub-context roles
   you will launch. Each sub-context you launch reads its own file first.

**Where this document paraphrases the doctrine (§7 below) and differs from it, the doctrine
files and the master plan win.** This document adds the owner's authorizations and the
window-specific constraints; it never replaces a doctrine file.

Then read `master-plan.md` in full before touching anything — §3 (roles, positional state, row
schema, checkpoint rules), §4 (tracker), §5 (contract resolution), §6 (naming registry — exact
names, never renamed), §7 (sequencing and the projection gate), §8 (tool protocols: no
architecture graph exists here), §9 (all sixteen standing rules), §10 (environment, the Vitest
partition, **§10.3A**, the L1–L4+ commands and budget), §11 (gate log, design-delta register,
follow-up register).

────────────────────────────────────────────────────────────
1. GOAL
────────────────────────────────────────────────────────────

Execute Proposal Copilot Frontend Core phases

02 → 03 → 04 → 05

as a controlled autonomous implementation window.

Phase 01 has been completed and `APPROVED` through the owner-run workflow before this goal
begins. **Do NOT implement, repair, or reimplement Phase 01.** **Do NOT continue to Phase 06.**

The goal is complete when Phase 05 is recorded `APPROVED`, or when execution reaches a genuine
blocker or owner decision (§15).

This is NOT permission to reinterpret the master plan as one large implementation task. Each
phase remains an independent engineering implementation with its own projection, scope,
evidence, commit provenance, review, correction cycle and approval gate.

────────────────────────────────────────────────────────────
2. QUALITY BAR — NON-NEGOTIABLE
────────────────────────────────────────────────────────────

This MVP is part of a software-engineering hiring evaluation: the implementation quality is
judged alongside the product idea. The calibration is the owner's scope brief quoted verbatim
in master plan §3, and its application rules bind unchanged: the brief calibrates the *quantity*
of hardening and never the *correctness* of what ships; anything wrong rather than merely
unguarded stays in scope; a guard that cannot fail is not a cheaper guard; every exclusion is
recorded where the excluded work lives.

The architecture contracts are cornerstone implementation constraints, not suggestions.

MVP scope may reduce: breadth; optional infrastructure; future extensibility; persistence;
unnecessary abstraction; enterprise hardening; speculative features.

MVP scope must NOT reduce: correctness; architectural discipline; runtime boundaries; ownership
boundaries; type safety; accessibility; trust-boundary discipline; honest validation; test
quality; concurrency and session correctness; error correctness; documentation accuracy;
maintainability; code clarity; evidence quality.

Do not achieve "MVP simplicity" by creating architectural debt that contradicts the ratified
contracts. Prefer the smallest correct senior implementation.

────────────────────────────────────────────────────────────
3. AUTHORITY ORDER
────────────────────────────────────────────────────────────

Before implementing anything, establish the authority chain from the repository itself. At
minimum, per phase:

1. `master-plan.md` (the sections named in §0);
2. the intention sections the phase plan's "Read first" list names;
3. `architectural_contracts/01-implementation-contract-guide.md`, then the contract sections the
   phase plan names, plus anything your own routing adds (say so in the Review log);
4. the active phase plan, in full, including its Review log;
5. the `ui_design/` documents the phase plan names, after `10-design-integration-guide.md`;
6. the approved predecessor implementation, opened only to learn what exists (pattern-authority
   rule: contracts teach how to write; implementation files show what is there).

Do not read every architecture document. Follow the routing protocol and load the minimum
sufficient authoritative context. Every implementing sub-context re-emits its contract
selection in the Review log before coding.

Authority boundaries (master plan §2):

- the frontend owns presentation and the thin validated browser-to-server boundary;
- the backend owns domain, workflow, provenance, clarification, approval, execution, schemas,
  `ErrorDto`, result contracts and every §17A mechanism — this project cites them and never
  authors, copies, edits, extends or corrects one;
- `ui_design/` owns visual, layout and interaction truth — no session in this project edits a
  file under it; a design delta is recorded in master plan §11.2 and reported;
- the architecture contracts own engineering constraints;
- each phase plan owns its phase-local execution perimeter;
- the master plan owns the shared skeleton and the sequencing.

Never let a lower-authority artifact silently override a higher one. **This document is a
lower-authority artifact.** Where authorities genuinely conflict: stop that decision, surface
the exact conflict, and route it per master plan §2's fold-back rule and guide §6. Never choose,
weaken, or normalise silently.

────────────────────────────────────────────────────────────
4. EXECUTION AUTHORIZATION FOR THIS WINDOW — AND ITS RECORD
────────────────────────────────────────────────────────────

For this explicitly assigned window, the owner authorizes Astra to orchestrate internally the
workflow the owner has been opening manually: Astra acts as **coordinator**, and launches fresh
isolated sub-contexts for **projection**, **implementation**, **review**, **bounded correction**
and **focused re-review**.

This authorization applies **only to phases 02 through 05**, and it withdraws, for this window
only, two statements in master plan §3:

- "the coordinator orchestrates; the owner runs the sessions" — Astra opens the sessions;
- the staffing split "Codex implements, Claude reviews" and the Sonnet/Opus substitution — every
  role in this window runs on Astra. The capability rule (reviewer at least as capable as the
  implementer) holds trivially; **the cross-family property is spent**, exactly as it is under the
  recorded substitution.

**Because the cross-family property is spent, master plan §3's two consequences bind for every
phase in this window:**

1. **The projection gate is never waived in this window — not for phase 02 either**, although
   §7.2 lists 02 as waivable. Projection is the only independent read of a plan before code
   exists when one model fills every role.
2. A reviewer finding that turns on "the implementer and I read this the same way" is recorded
   as such in the Review log rather than treated as agreement.
3. The Sonnet-implementer addendum applies: every implementer prompt Astra compiles states its
   scope fences and its named mutations **enumeratively** ("the five probes are these five"),
   never by reference to judgment.

**A prompt cannot amend the master plan; the master plan must record this itself** (fold-back
rule: a process change is made in its home artifact). Therefore Astra's **first pipeline write,
before any phase-02 work**, is:

- add a lettered subsection **§3A "Astra window 01 (owner authorization, 2026-09-06)"** to
  `master-plan.md` §3, stating: the window (phases 02–05), what it withdraws (the two statements
  above), what it keeps (every item in the "does NOT supersede" list below), the three
  consequences, that every tracker note and Review log in this window records "Astra window 01:
  coordinated, projected, implemented and reviewed by Codex Astra sub-contexts", and that the
  standing instruction and split resume unchanged at phase 06 with no further decision;
- add a gate-log row to §11.1 for the authorization;
- commit these two edits alone as pipeline documentation, subject line in the existing style
  (`frontend_core: record the owner's authorization of Astra window 01 (phases 02–05)`).

The starting gate (§5) then verifies that record exists before phase 02 begins.

This authorization does NOT supersede: architecture contracts; phase scopes; acceptance criteria;
source-of-truth rules; checkpoint requirements; review quality; backend ownership; dependency
gates; mutation-probe requirements; documentation requirements; git provenance rules; phase
ordering; the positional-state artifact trail (§7A); the evidence budget (§7B).

Do not interpret this as permission to redesign the workflow.

────────────────────────────────────────────────────────────
5. STARTING GATE — CONTENT ONLY, STOP AND REPORT ON ANY FAILURE
────────────────────────────────────────────────────────────

Gate on content the work itself will change and nothing else will. **Never gate on a commit SHA,
on whether the working tree is clean, or on a file count** (coordinator doctrine).

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Worktree and branch | `git rev-parse --show-toplevel`, `git branch --show-current` | the frontend worktree above; branch `proposal-copilot-frontend` |
| 2 | Intention ratified | intention status table | the **Status** value begins `RATIFIED` |
| 3 | Phase 01 approved | `master-plan.md` §4 row `01` | the **State** cell reads `APPROVED` |
| 4 | The plan agrees | `plans/phase-01-baseline-and-visual-foundation.md` header | its **State** row reads `APPROVED` |
| 5 | Phase 01's closeout ritual ran | `handoffs/implementer/`, `handoffs/reviewer/` | no phase-01 handoff row remains in either table; the phase-01 archive folder under `archive/` holds the phase's prompts and handoffs |
| 6 | Phase 01's output exists | the tree | `src/styles/theme.css` exists |
| 7 | Phase 02 is genuinely outstanding | `plans/phase-02-workspace-shell.md` header; `master-plan.md` §4 row `02` | both **State** values read `NOT_STARTED` |
| 8 | This window's authorization is recorded | `master-plan.md` §3A and §11.1 | both entries from §4 above exist (write them first if they do not; then re-check) |
| 9 | Doctrine reachable | the five absolute paths in §0 | every file reads |

Also record, in the window's opening note, `git status --porcelain` with every entry attributed.
Expected: the untracked directory `build_docs/future_implementations/`, which is **not this
pipeline's work — never stage it**. An uncommitted change under `src/`, `e2e/`, `package.json`,
`package-lock.json` or the pipeline folder that no artifact explains is a stop-and-report, not
something to absorb.

Do NOT "repair" or reimplement Phase 01 because you would have done it differently. Approved
predecessor work is established project state. If a concrete phase-01 defect makes phase 02
impossible or violates an applicable MUST, report the exact defect as a decision card (§15) and
stop; do not rewrite predecessor scope.

────────────────────────────────────────────────────────────
6. EXECUTION MODEL
────────────────────────────────────────────────────────────

Serial, gated:

PHASE 02 → PHASE 03 → PHASE 04 → PHASE 05 → STOP

A phase begins only after its predecessor is recorded `APPROVED` in the tracker and in the plan
header. Never combine phases into one implementation pass; never combine their commits; never
move a task into another phase for convenience. The phase plan is the implementation perimeter.

**Per-phase state transitions are yours to record in `master-plan.md` §4 and in the plan header:**
`NOT_STARTED → PROJECTED → PROMPT_READY → IMPLEMENTING → IMPLEMENTED → REVIEWING →
CHANGES_REQUESTED (→ IMPLEMENTING) → APPROVED`. A sub-context updates only its own row and
state; findings go to the plan's Review log.

**Resumability.** State is positional (master plan §3): live prompts in `prompts/<role>/`,
unconsumed reports in `handoffs/<role>/`, closed rows in `archive/plan_<n>/`. If this window is
interrupted for any reason, the next session resumes from that positional state and the tracker,
never restarts the window and never re-runs a completed phase.

────────────────────────────────────────────────────────────
7. PHASE LIFECYCLE (the doctrine files own the detail; this is the window's checklist)
────────────────────────────────────────────────────────────

For EACH phase independently:

A. PRE-FLIGHT (coordinator, you)

- Read the active phase plan in full, its Read-first list, and the predecessor's Review log.
- Re-run architecture-contract routing for the concerns the phase touches.
- Verify the predecessor is `APPROVED` and the phase header is `NOT_STARTED`.
- **Lint the plan before dispatching it** (coordinator doctrine, responsibility 1c): every
  reference resolves (paths, symbols, fixtures, observables); every count is derived by a
  command — re-derive the row total and the named-mutation total **from the criteria table with
  per-criterion summands** (`C1 n · C2 n · …`) and treat the plan's own "Derived totals" sentence
  as a claim to check, not a fact; every criterion row is addressable; every row states one exact
  outcome; every trace cell resolves. Run the three extra checks (perimeter-vs-guard collision,
  deletion leaves no unused import, standing instructions naming this phase — grep `master-plan.md`
  for the phase number, including §11.3's follow-up register).
- Identify the allowed write perimeter (the plan's "Files expected to change" plus the tracker
  row, the Review log, and the closeout documentation the impact review requires), the named
  mutations, the required evidence and its scope (§7B), and the documentation-impact obligations.
- Fold any lint defect into the plan **before** projection (a count correction, a resolved
  reference), recording the fold in the plan's Review log. A defect that changes product
  semantics is an owner decision card, not a fold.

Do not code before this is complete.

B. PROJECTION (fresh sub-context; mandatory for every phase in this window — §4)

- Compile the projection prompt into `prompts/reviewer/phase-NN-projection-round-0.prompt.reviewer.md`
  (row schema: `plan`, `role: projection`, `round: 0`, `date`) per the coordinator doctrine: the
  plan-projection doctrine path, the phase's silent-failure mechanisms as named depth targets,
  the Read-first list. **The prompt carries no planning context, no window context, and no
  suspected defects** — an anchored projection proves nothing.
- Launch the sub-context with exactly that prompt file. It deposits
  `handoffs/reviewer/phase-NN-projection-round-0.handoff.reviewer.md`
  (`verdict: PROJECTED_CLEAN | AMENDMENTS_REQUIRED`).
- Consume the handoff adversarially (doctrine 1b): reconcile its arithmetic, diff its declared
  write perimeter against `git status` (it may write only its handoff), confirm zero L4 spent.
- Route **every** ledger row before compiling the implementer prompt: plan gap → amend the phase
  plan; skeleton gap → amend the master plan; free choice → an explicit delegation list in the
  implementer prompt; intention gap or owner card → **STOP** (§15). Record each routing in the
  plan's Review log. Tracker → `PROJECTED`.

C. IMPLEMENTATION (fresh sub-context)

- Compile `prompts/implementer/phase-NN-round-1.prompt.implementer.md` per the coordinator
  doctrine and in the shape of the archived phase-01 implementer prompt
  (`phase-01-round-1.prompt.implementer.md`, in the phase-01 archive folder under `archive/`): doctrine paths, content-only gate
  check, read order, **enumerated** scope fences, the **enumerated** named mutations with their
  summands, the delegated decisions, inherited hazards (§11A), the evidence budget (§7B), the
  closing protocol, contract 14 §8.3's closeout sentence **verbatim** (standing rule 9), the
  handoff path and row schema, the owner-layer closing message. Tracker → `PROMPT_READY`, then
  `IMPLEMENTING` when launched.
- Launch the sub-context with exactly that prompt file. It follows the implementation-executor
  doctrine: Task 0 coverage map (one line per criterion **row**, both directions), red baseline,
  implementation, every named mutation run on the tree and reverted with a full evidence record,
  the closing stamp, documentation impact review, tracker row → `IMPLEMENTED`, Review log entry,
  the checkpoint commit (§7E), and the handoff at
  `handoffs/implementer/phase-NN-round-<n>.handoff.implementer.md`.
- Implement only that phase. Use existing repository patterns where they satisfy the contracts.
  No speculative abstractions; no generic infrastructure for hypothetical surfaces; no porting of
  prototype architecture, fake intelligence, fake timers, seeded ids, money, or workflow
  semantics (standing rule 2, design 10 §7).

D. VERIFY (inside implementation, then again at consumption)

- Tests prove behaviour at the lowest layer that can observe the subject; **what the browser
  computes is measured in Playwright, what the source says is measured in Vitest** (master plan
  §10.3A) — a computed-style or media-query assertion in a Vitest test cannot observe its subject.
- Every guard, absence claim, purity check and silent-failure mechanism ships with its planted
  defect run on the tree and reverted (standing rules 8 and 10, charter rule 15). A guard that
  cannot fail is not evidence. `executed != declared` blocks `IMPLEMENTED`.
- New test files under `src/features/**` are confirmed collected (`npx vitest list`, standing
  rule 13).
- Never: weaken assertions; disable tests; convert failures into expected behaviour without
  authority; substitute snapshots for behavioural evidence; claim a command ran when it did not.
- **Consume the implementer handoff adversarially** before compiling the review prompt: perimeter
  vs tree, mutation table vs plan count (checked against the table, not the prose), test-count
  growth vs what the cycle owed, L4-run count vs budget, and every discrepancy becomes a named
  probe in the review prompt.

E. CHECKPOINT COMMIT (implementer, the moment it reaches `IMPLEMENTED`)

Subject prefixed `CHECKPOINT (not approved): frontend NN …`, under the owner's standing
authorization (master plan §3) — no round stops to ask. Stage **only** that cycle's declared
files plus the tracker and Review-log edits it actually made (standing rule 15). Never
`build_docs/future_implementations/`. Checkpoints are never squashed.

F. FRESH REVIEW (fresh sub-context)

- Compile `prompts/reviewer/phase-NN-review-round-<n>.prompt.reviewer.md` (`role: review`) per
  the coordinator doctrine: the plan-reviewer doctrine path, the full checklist, the evidence
  budget, and the judgment-call probes you extracted from the implementer's handoff.
- The reviewer never trusts the implementer's summary. It runs the architecture protocol in
  reverse (diff → concerns → guide → contracts), checks every criterion row, verifies the
  perimeter with `git diff`, mutation-tests the tests by **variation** (a site, condition or
  mutant shape the record never tried), checks accessibility to standing rule 5's standard,
  checks source-of-truth boundaries and documentation impact, and hunts shortcuts that pass tests
  while violating the intention. Orphan tests are findings. It never fixes.
- It deposits `handoffs/reviewer/phase-NN-review-round-<n>.handoff.reviewer.md`
  (`verdict: APPROVED | CHANGES_REQUESTED`), appends layer-1 findings to the plan's Review log,
  flips the tracker row. Tracker → `REVIEWING` on launch.

G. CORRECTION — ONLY IF REQUIRED (fresh sub-context)

- Compile `prompts/implementer/phase-NN-round-<n+1>.prompt.implementer.md` (`role: fix`):
  finding-scoped, **each finding's correction clause quoted verbatim**, an explicit file perimeter
  the re-review will verify, helpers or tests the fix supersedes for deletion, "resolve, don't
  relitigate; add nothing beyond the findings", the evidence budget.
- No broad opportunistic refactor. Fix the findings and their directly affected seam. Run the
  required evidence, re-run every retained mutation whose test file the fix touched, make a new
  checkpoint commit, deposit the handoff (`role: fix`, cycle-scoped perimeter).

H. RE-REVIEW (fresh sub-context)

- Delta-scoped per the charter's review protocol: opens with the review history (what is settled
  and by whom); step 1 is the verified perimeter (`git diff` against the fix prompt's allowed
  files — anything else is an automatic finding); full adversarial depth on the changed seam;
  evidence per §7B; settled areas not re-audited, but anything seen wrong in passing is reported.
- Corrections converge. If a third correction cycle is needed on one phase, stop and report why
  (§15) rather than looping.

I. APPROVAL AND CLOSEOUT (coordinator, one atomic ritual)

Only after every acceptance criterion row genuinely passes and the reviewer's verdict is
`APPROVED`:

1. fold the final review handoff (lessons → their home artifacts; carry-forward notes → the
   named destination phase's plan text; candidate criteria → folded with a trace cell or refused
   with a recorded reason);
2. archive the phase's spent prompts and consumed handoffs to `archive/plan_<n>/` (every file
   keeps `.prompt.` or `.handoff.` in its name); standing role documents never archive;
3. tracker row and plan header → `APPROVED`, with date, actor (`Astra window 01`) and note;
   gate-log row in §11.1;
4. the approval-gate commit, capturing code state, tracker, archive move and fold-backs together,
   subject in the existing pipeline style (`frontend_core: approve phase NN — …`);
5. only then, pre-flight the next phase.

────────────────────────────────────────────────────────────
7A. THE ARTIFACT TRAIL IS NOT OPTIONAL
────────────────────────────────────────────────────────────

Internal orchestration changes who opens a session, not what a session leaves behind. Every
sub-context is started **from its prompt file and nothing else** — no window context, no chat
summary — and reports **through its handoff file**, which is what you consume; the sub-context's
chat output is not the record. Every prompt and handoff carries the row-schema frontmatter
(prompts: `plan`, `role`, `round`, `date`; handoffs additionally `state`/`verdict`, `actor`) and
every handoff declares the session's full write perimeter. A senior reviewer reading
`git log`, `archive/plan_<n>/` and the Review logs after this window must be able to reconstruct
every round exactly as if the owner had opened it.

────────────────────────────────────────────────────────────
7B. EVIDENCE BUDGET (charter test-evidence section; master plan §10.4)
────────────────────────────────────────────────────────────

- Inner-loop evidence runs at **L1** (`npx vitest run <path> [-t "<name>"]`) or **L2**
  (`npx vitest run --project jsdom src/features/proposal-preparation`); Playwright rows run at
  their own file scope.
- **Exactly one L4 stamp per implement or fix cycle**, taken on the tree actually handed over
  (`npm test` + `npm run typecheck` + `npm run lint`). A cycle that changed `src/app/**`, a
  landmark, the styling entry point, `package.json`, or the build configuration takes the
  **L4+** stamp (additionally `npm run test:e2e` and `npm run build`). A session that changes
  anything after its stamp re-takes it; the re-take is not over-budget.
- **Every approval gate is L4+**, because CI runs `test:e2e` and `build` on every push and a phase
  must not leave either red (standing rule 16).
- Any further L4 requires one line written **before** the run: "narrower evidence insufficient
  because …". Re-running evidence whose tree identity matches, with no variation and no such
  line, is a finding against that session. Reviewers reuse tree-matched evidence by citation and
  spend their budget on variation.
- Every evidence record carries hypothesis, scope, exact command, tree identity (checkpoint SHA
  plus clean `git status --porcelain`, or SHA plus a `git diff` digest), result, and the
  failure-ID delta.

────────────────────────────────────────────────────────────
8. DEPENDENCIES AND PACKAGES
────────────────────────────────────────────────────────────

The owner authorizes installing the dependencies the active phase requires; no stop is needed
for a dependency the plan and the contracts already justify.

**Enumerated for this window (derived from the four plans and master plan §6.1):**

| Phase | Package | Justifying widget | Recorded where |
|---|---|---|---|
| 02 | none | — | — |
| 03 | `@radix-ui/react-tabs` | the session tab strip's tablist mechanics (master plan §6.1) | phase 03 Review log with the resolved version (contract 15 §5, contract 13 §5); root `README.md` tech-stack rows for Radix and Lucide (master plan §11.3 follow-up 6) |
| 04 | none | — | — |
| 05 | none — the confirmation dialog is the **native `<dialog>` with `showModal()`** (master plan §6.1) | — | — |

Rules: install only what the active phase's criteria need; never a later phase's package early
(`@radix-ui/react-popover` is phase 11's); prefer native mechanisms where the contracts say they
are sufficient; do not introduce a library to avoid a small correct local mechanism; update
`package-lock.json` normally; evaluate trust implications per contract 10 §11; if the primitive
distorts the interaction, use native elements for that part and record why (master plan §6.1).

If installation or tooling is blocked externally (credentials, registry, permissions, platform),
STOP at that blocker and report in the §15 format. Do not invent an architecture-violating
workaround. After the owner resolves it, resume from the same phase and round.

────────────────────────────────────────────────────────────
9. BACKEND OWNERSHIP AND THE FIXTURE ERA
────────────────────────────────────────────────────────────

Phases 02–05 execute during the frontend fixture era. Backend phases 4–15 are `NOT_STARTED`;
**no `main` merge happens in this window** — phases 02–05 consume no backend contract, and a
merge is only ever taken at a backend `APPROVED` gate on the owner's instruction (master plan §3).

Never invent an unmerged backend-owned schema or contract. Never make the frontend authoritative
for `ProposalWorkflowState`, `ConversationContext`, proposition or domain truth, commercial
values, provenance, clarification semantics, approval, execution, `ErrorDto`, or backend result
contracts (standing rule 1).

Follow master plan §6.6 exactly: before the owning schema merges, a fixture is a literal that
populates a view model directly, in a module named `<noun>.temporary-fixture.ts` with exports
prefixed `temporaryFixture`, under `src/features/proposal-preparation/client/fixtures/`. Temporary
fixture shapes never become accidental APIs. `schemas/` and `server/` inside the feature are
backend-owned and arrive only by merge. Do not change backend code from this window.

────────────────────────────────────────────────────────────
10. SENIOR IMPLEMENTATION PRINCIPLES (the contracts own these; stated as the window's emphasis)
────────────────────────────────────────────────────────────

A. AUTHORITY — browser state is never business authority; presentation state does not become
domain state because it is convenient; derived values are derived, not redundantly stored
(§12A.7: the unread counter and the retained context are the only two stored presentation values).

B. COMPONENT ARCHITECTURE — components stay declarative; orchestration lives in hooks and the one
feature store; no controller components; no abstraction before a real repeated pattern
(contract 05 §1–§2, contract 12 "Components and client").

C. CLIENT STATE — the feature-scoped Zustand store `useWorkspaceSessionStore` at
`hooks/use-workspace-session-store.ts` owns only the shared page-lifetime workspace concern
(active session id, ordered session ids, per-session runtime records); disposable mechanics stay
in `useState`/`useReducer` where they are owned; no second store without a master plan §6.1
amendment; no global store; **no persistence of any kind** — no `localStorage`, `sessionStorage`,
IndexedDB, cookie, URL parameter, or store shape justified by future serialisation.

D. RUNTIME — `src/app/page.tsx` stays a Server Component rendering `<ProposalWorkspace />`; the
`"use client"` directive sits on the workspace root and nowhere above it; no server-only or
privileged module becomes reachable from the client graph (contract 02).

E. STYLING — Tailwind is the mechanism; visual values come from `src/styles/theme.css` and a
later phase uses a ramp entry or amends master plan §6.5A rather than inventing a value; no
repeated visual literals; inline `style` only for the dragged pane width until a phase records
another (standing rule 4).

F. ACCESSIBILITY — implemented with the interaction, never patched later: landmarks, accessible
names, keyboard flows, focus destinations, polite announcements, reduced motion, contrast. A
primitive's presence is never proof (standing rule 5). Where a design specification and an
accessibility correction disagree, the correction wins (standing rule 6).

G. TESTS — behaviour, not implementation trivia; Vitest at the lowest layer that can observe the
subject, Playwright where the subject is what the browser computes (§10.3A); no broad snapshots;
every test traces to a criterion row (standing rule 12); mutations are real edits applied to the
tree and reverted.

H. DOCUMENTATION — at each closeout ask "could durable documentation now be false or
incomplete?"; patch only the document that owns the changed truth; no duplicate truth
(contract 14 §8). `src/features/proposal-preparation/README.md` is **not** written before phase 17
(follow-up 7).

────────────────────────────────────────────────────────────
11. PHASE-SPECIFIC STRATEGIC INTENT (the plans are authoritative; this is orientation)
────────────────────────────────────────────────────────────

This window is an architecture and runtime milestone. Do not optimise for visible UI volume at
the expense of the foundation.

PHASE 02 establishes: the persistent split shell — one named complementary region, one `main`,
present for the page's lifetime; the divider as a real separator with design 02 §5's keyboard
model and the clamp's ordering (agent minimum wins); narrow-width resilience by construction
(§12A.19); the honest idle Main Application Surface (design delta 8 — marker, not an invented
design); the V1 containment perimeter as a source-level check with planted probes (§12A.23);
`e2e/workspace.spec.ts` replacing `e2e/bootstrap.spec.ts`. No sessions, no tab strip.

PHASE 03 establishes: page-lifetime session identity kept totally separate from the Generation
ID (§12A.1); separate per-session runtime records in the one feature store; the tab strip on
Radix Tabs with reorder and close total over §12A.5's cases and their focus destinations;
active tab kept in view without `scrollIntoView`, document queries, or window-width reads;
landmark identity holding across every session operation. **Closing is unguarded here by
design** — the plan leaves one named gate point for phase 05; a reviewer finding an unguarded
close in phase 03 is finding the phase's stated boundary, not a defect.

PHASE 04 establishes: tab status as a pure function of one runtime record, first-match-wins in
§12A.3's order, rendered twice from one call, stored nowhere; status carried as text in the
accessible name; the unread counter as the one stored presentation counter with §12A.4's total
event table; attention as the conjunction computed at render; the derivation register as a real
module-level enumeration of §12A.7's rows; debounced polite status announcements behind a named
constant.

PHASE 05 establishes: turn dispatch with origin session id and turn id captured by value before
any await; resolution routed by the captured values only, never by the active session (§12A.2),
total over its four cases, at most one application per turn id; per-session in-flight
presentation with nothing polling or simulating progress (conflict C-6); the async status as a
discriminated union; the meaningful-work predicate over §12A.6's six inputs, evaluated at the
moment of intent from the record, unavailable inputs evaluating to **true**; the guard as one
native modal `<dialog>` step in front of **every** close and discard path including the
last-session close; the composer draft's lifetime; and **a named insertion point** for phase 12.

**Not in phase 05, and not in this window:** the approval/execution turn, the creation
**refusal**, and the **browser departure request** (`use-departure-guard.ts`) — all three are
phase 12's, because the creating state does not exist until then. Phase 05 names the insertion
point; it does not build the refusal.

────────────────────────────────────────────────────────────
11A. INHERITED HAZARDS — NOT OPTIONAL, CARRIED INTO EVERY IMPLEMENTER PROMPT
────────────────────────────────────────────────────────────

1. **Master plan §10.3A**: neither Vitest project can measure a rendered document's computed
   style, `var()` resolution, or a media query. Rows about rendered widths, focus indicators,
   reduced motion, or the effective divider maximum at two viewport widths are Playwright rows
   and say so in the coverage map. A Vitest test asserting a computed style is charter rule 15's
   family.
2. **Master plan §11.3 follow-up 9**: the blanket `0.01ms` reduced-motion collapse from phase 01
   is a floor, not the per-animation correction. The phase that introduces an animation
   implements design 01 §5 correction 6 for it — phase 04's working dot does not animate under
   reduced motion by its own treatment, not by relying on the collapse.
3. **Master plan §10.3 partition rule**: `.tsx` tests and `src/features/**/hooks/**/*.test.ts`
   are `jsdom`; every other `*.test.ts` (including `client/**` and `types/**`) is `node`. Place
   tests accordingly and confirm collection (standing rule 13).
4. **Phase-01 review lessons**: read `plans/phase-01-baseline-and-visual-foundation.md`'s
   Review log and the master plan's follow-up register at phase-02 pre-flight and carry any
   forward hazard the review recorded into the phase-02 implementer prompt.
5. **Design 10 §7's blocklist** is a standing perimeter for every phase: no `window.innerWidth`
   read during render, no `mousemove`/`mouseup` closure drag, no hover rail, no snapshot session
   engine (`SESSION_KEYS`, `BLANK_SNAP`, `seedSnap`, `loadSnap`, `archive`, `PAST_SESSIONS`,
   `BG_SESSION`, `bump()`, `sessionSeq`), no `document.querySelector` for the active tab, no
   `tabState`, no regex that "understands" text, no fake timer.

────────────────────────────────────────────────────────────
12. SESSION INTEGRITY IS CRITICAL
────────────────────────────────────────────────────────────

A turn started in session A belongs to session A. If the user switches to session B before A
resolves, A's result updates A and never touches B because B is active. Likewise:

- tab status never decides whether a session can close, and the close guard never reads the tab
  status (standing rule 14) — in both directions;
- meaningful work, evaluated at the moment of intent from the runtime record, decides destructive
  protection; a false "no meaningful work" destroys work with no undo, so the failure direction
  is fixed and asymmetric;
- the page-lifetime session id never becomes, derives from, or is compared to the Generation ID,
  and is never submitted in any position or displayed as the session's identity;
- the composer draft is never trimmed, normalised or pattern-tested to decide the predicate;
- no timer, interval or poll advances a session with no in-flight turn.

Treat violations of these invariants as blocking correctness defects.

────────────────────────────────────────────────────────────
13. GIT DISCIPLINE (master plan §3, §8, standing rule 15)
────────────────────────────────────────────────────────────

- Work only in the frontend worktree; never enter or modify the sibling backend worktree.
- The stash stack is shared with the main checkout: **never bare `git stash` / `git stash pop`**;
  set work aside with a temporary WIP commit instead.
- Every implementation cycle and every fix cycle gets its own `CHECKPOINT (not approved):
  frontend NN …` commit; every phase gets its approval-gate commit; pipeline documentation
  commits use the existing `frontend_core: …` subject style. Never squash; never collapse two
  phases or two cycles into one commit.
- Stage only declared files. Never stage `build_docs/future_implementations/`.
- Do not push, do not merge `main`, do not create branches or tags.

The history must let a senior reviewer read the implementation and review/correction lineage of
each phase.

────────────────────────────────────────────────────────────
14. DO NOT OVER-ENGINEER
────────────────────────────────────────────────────────────

"Senior" is not licence for enterprise architecture. Do not add: databases or any persistence;
authentication; routing, URL segments, history entries or navigation for a workspace surface;
surface registries, maps, factories, providers or plugin points (§12A.23 forbids them and phase 02
C5 measures their absence); Semantic Application Graph infrastructure; event buses; generic
command frameworks; TanStack Query, React Hook Form, shadcn or animation/resizable-pane libraries
(intention §4.1: not adopted); design-system wrappers or `src/components/ui/` primitives before
real reuse; abstractions for future product surfaces.

Senior implementation here means small, clear, correct, well-bounded, well-tested,
architecturally coherent code.

────────────────────────────────────────────────────────────
15. STOP CONDITIONS
────────────────────────────────────────────────────────────

STOP and report to the owner only for:

1. an unresolved conflict between authoritative artifacts;
2. a required backend-owned contract that would have to be invented;
3. a projection or review handoff carrying an `⚠ OWNER DECISIONS REQUIRED (n>0)` section, or any
   intention gap — a semantic change goes through the decision-card path and **silence never
   ratifies: the gate holds**;
4. an external credential, permission, registry or environment action;
5. a phase plan that proves internally inconsistent in a way that changes product semantics or
   architecture (a count or reference defect is folded, not stopped for);
6. implementation that would require leaving the assigned phase perimeter, or a second feature
   store, a new retained-context entry, a new named constant, or a theme-layer value not in
   design 01's ramps (each is a master plan §6 amendment, not an implementer's call);
7. a phase needing a third correction cycle;
8. Phase 05 reaching `APPROVED`.

Report format:

```
BLOCKER / DECISION
- phase and round:
- what was attempted:
- exact error or conflict (quote the artifacts):
- why Astra cannot resolve it within its authority:
- exact owner action required (decision cards verbatim, charter format):
- state to resume from (tracker row state, live prompt or handoff path):
```

Do NOT stop for: implementation decisions the contracts already govern; installing the one
justified dependency; test failures you can diagnose and fix; routine type or lint errors;
implementation details where the architecture already fixes the boundary; a lint or projection
finding that is a plan-local amendment.

────────────────────────────────────────────────────────────
16. END-OF-WINDOW HANDOFF
────────────────────────────────────────────────────────────

After phase 05 is `APPROVED` and its closeout ritual has run: STOP. Do not start phase 06. Do
not compile a phase-06 prompt.

Deposit `handoffs/coordinator/astra-window-01-round-1.handoff.coordinator.md` (row schema, plus
`state: COMPLETE | BLOCKED`) containing, and then give the owner the same content in the
charter's owner layer (plain product language, decision cards verbatim, one pointer line to the
file):

WINDOW RESULT — phases attempted; phases approved; final branch; final commit; tracker rows as
they now read.

PHASE HISTORY — per phase: projection verdict and rows routed; implementation rounds; review
verdicts by round; correction cycles; approval commit.

ARCHITECTURE CHECK — client boundary; session-store ownership; derived-state ownership; turn-
origin attribution; close/discard guard and its named phase-12 insertion point; persistence
introduced: yes/no; backend contracts invented: yes/no; master plan §6 amendments made: list.

DEPENDENCIES — packages added, resolved versions, justifying phase and widget.

EVIDENCE — final L4+ stamp with tree identity; per-phase mutation counts (declared = executed,
with summands); structurally-held clauses still held (phase 03 C1(c)); L4 runs vs budget.

DESIGN / CONTRACT DELTAS — rows added to master plan §11.2; contract conflicts surfaced (guide
§6) and how each was routed; unresolved conflicts.

BACKEND RECONCILIATION NOTES — no `main` merge taken (expected); backend contracts the next
window will need; confirmation that no speculative frontend replacement for a backend contract
exists.

OWNER ATTENTION — what to inspect before authorizing phase 06, and the recommendation to compact
context at this phase boundary.

Then wait for the next explicit execution window.

────────────────────────────────────────────────────────────
17. DEFINITION OF SUCCESS
────────────────────────────────────────────────────────────

This goal succeeds when:

- master plan §3A and the §11.1 gate-log row record this window's authorization, committed
  before phase 02 began;
- phase 01 remains intact as approved predecessor work;
- phases 02, 03, 04 and 05 were each linted, projected (no waiver), implemented, reviewed
  adversarially by a fresh sub-context, corrected only within bounded finding-scoped perimeters,
  re-reviewed delta-scoped, and recorded `APPROVED` legitimately;
- every round left its prompt and handoff rows, tracker transitions, Review-log entries,
  checkpoint and approval commits, and `archive/plan_<n>/` moves exactly as the owner-run
  workflow would have;
- every named mutation was run on the tree and reverted, with `executed = declared` per phase;
- the evidence budget was honoured and every L4 run has a tree identity;
- architecture-contract MUSTs remain satisfied and every conflict was surfaced, never chosen
  silently;
- no backend authority, persistence, routing, surface registry or speculative architecture was
  introduced;
- the only package added is `@radix-ui/react-tabs`, in phase 03, recorded with its version;
- phase 05 leaves a trustworthy runtime foundation with the phase-12 insertion point named;
- Astra stopped before phase 06 and deposited the window handoff.

Begin by reading the doctrine files (§0), then the master plan, then recording the window's
authorization (§4), then running the starting gate (§5).
