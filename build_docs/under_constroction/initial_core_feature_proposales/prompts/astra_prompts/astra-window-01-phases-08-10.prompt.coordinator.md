---
plan: plans/phase-08-ai-provider-boundary.md · plans/phase-09-agent-runtime.md · plans/phase-10-conversation-context.md
role: coordinator (autonomous window — coordinator, projection, implementer, reviewer sub-contexts)
round: 1
date: 2026-09-06
project: initial_core_feature_proposales
feature: Proposal Preparation Backend (product: Proposal Copilot)
window: Astra window 01 (backend)
authorized by: the owner (David), in this document
---

/goal

# Proposal Preparation Backend — Autonomous Implementation Window 01
## Execute backend phases 08 through 10

Repository / worktree: `/Users/davidloorenz/Desktop/Developer/Proposales`
Expected branch: `main`
Run every command from that worktree root. **Never enter or modify the sibling frontend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend` (master plan §9.2).

| Authority | Path |
|---|---|
| Primary implementation authority (shared skeleton, naming registry, tracker, standing rules, environment) | `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` |
| Ratified product intention (semantics, ledger M1–M20, mechanism contracts §17A) | `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md` |
| External facts (Proposales API, AI SDK behavior) | `build_docs/under_constroction/initial_core_feature_proposales/planing/proposales-source-evidence.md` |
| Architecture routing authority | `architectural_contracts/01-implementation-contract-guide.md`, reached through `CLAUDE.md`/`AGENTS.md` → `agent-skills/policy/architecture-context-policy.md` |
| Phase plans (the task list and acceptance criteria of each phase) | `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-{08,09,10}-*.md` |
| Pipeline doctrine (how every session in this pipeline works) | §0 below — read before anything else |

Relative paths in this document resolve from
`build_docs/under_constroction/initial_core_feature_proposales/` unless they start with `src/`,
`test/`, `e2e/`, `architectural_contracts/`, `agent-skills/` or a root file name.

────────────────────────────────────────────────────────────
0. DOCTRINE — READ FIRST, BY ABSOLUTE PATH
────────────────────────────────────────────────────────────

This pipeline's workflow is not defined by this document. It is defined by the doctrine files
below, which every session in this project follows. They are plain markdown; only the
auto-loading is Claude-specific, which is why you read them by absolute path. Codex adapters for
each role exist under `~/.codex/skills/<role>/SKILL.md` and point at the same files.

Read, in this order, in full:

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the shared authority: artifact map,
   folder layout and row schema, state machine and gates, phase manifest, trace chain, review
   protocol, test-evidence scopes L1–L4 and the evidence budget, decision-card format, the owner
   layer, the standing quality rules.
2. `/Users/davidloorenz/agent-skills/pipeline-coordinator.md` — your own doctrine for this window:
   just-in-time prompts, adversarial handoff consumption, the pre-dispatch plan lint, the
   content-only gate rule, the closeout ritual, fold-back.
3. `/Users/davidloorenz/agent-skills/plan-projection.md`,
   `/Users/davidloorenz/agent-skills/implementation-executor.md`,
   `/Users/davidloorenz/agent-skills/plan-reviewer.md` — the doctrine of the three sub-context
   roles you will launch. Each sub-context you launch reads its own file first.

**Where this document paraphrases the doctrine (§7 below) and differs from it, the doctrine files
and the master plan win.** This document adds the owner's authorizations and the window-specific
constraints; it never replaces a doctrine file.

Then read `master-plan.md` in full before touching anything, with particular attention to §2
(sources of truth, fold-back rule, citation rule), §3 (roles, state machine, checkpoint rules),
§4 (tracker and the derived count summands), §5 (contract resolution and the local resolutions
R1–R16), §6 (the naming registry — exact names, never invented, never renamed), §7 (sequencing,
the projection gate, ledger coverage), §8 (tool protocols — **no architecture graph exists in
this repository; skip it silently**), §9 (the owner's scope brief §9.0, session capability §9.0.1,
and all sixteen project rules §9.1, of which **15 and 16 were earned by phase 7 and are the most
recent lessons in this project**), §10 (environment, the Vitest partition and its collection
hazard, the L1–L4 commands, the safety rules), §11 (gate log, archive naming rule, follow-up
register), §12 (open items).

────────────────────────────────────────────────────────────
1. GOAL
────────────────────────────────────────────────────────────

Execute Proposal Preparation Backend phases

08 → 09 → 10

as a controlled autonomous implementation window.

Phases 01–07 are completed predecessor work, `APPROVED` through the owner-run workflow before
this goal begins (phase 07 was approved at commit `e33d6e9`). **Do NOT implement, repair, or
reimplement phases 01–07.** **Do NOT continue to Phase 11.**

The goal is complete when Phase 10 is recorded `APPROVED`, or when execution reaches a genuine
blocker or owner decision (§15).

This is NOT permission to reinterpret the master plan as one large implementation task, and it is
NOT permission to treat phases 08–10 as one coding task. Each phase remains an independent
engineering implementation with its own projection, scope, evidence, commit provenance, review,
correction cycle and approval gate.

────────────────────────────────────────────────────────────
2. QUALITY BAR — NON-NEGOTIABLE
────────────────────────────────────────────────────────────

The calibration is the owner's scope brief quoted verbatim in master plan §9.0, and its
application rules there bind unchanged. In summary, and without replacing that section:

- the brief calibrates the **quantity** of hardening and never the **correctness** of what ships;
- anything that is **wrong** rather than merely unguarded stays in scope — including every path by
  which a live credential or a vendor error body could escape, because the owner works with live
  Proposales and AI keys during development;
- trim by **reducing an ask, not by dropping a guard**: *a guard that cannot fail is not a cheaper
  guard, it is a decoration with a correct name*;
- every exclusion is recorded where the excluded work lives, with its reason.

**If the objective is to present this application, build quality is the deliverable.**

The architecture contracts are cornerstone implementation constraints, not suggestions.

MVP scope may reduce: breadth; optional infrastructure; future extensibility; persistence;
unnecessary abstraction; enterprise hardening; speculative features.

MVP scope must NOT reduce: correctness; architectural discipline; runtime boundaries; ownership
boundaries; type safety; trust-boundary discipline; honest validation; test quality; error
correctness; determinism; documentation accuracy; maintainability; code clarity; evidence quality.

Do not achieve "MVP simplicity" by creating architectural debt that contradicts the ratified
contracts. Prefer the smallest correct senior implementation.

────────────────────────────────────────────────────────────
3. AUTHORITY ORDER
────────────────────────────────────────────────────────────

Before implementing anything, establish the authority chain from the repository itself. At
minimum, per phase:

1. `master-plan.md` (the sections named in §0) — the shared skeleton and every fixed name;
2. the intention sections the phase plan's "Read first" list names, plus the §17A mechanism
   contracts it cites;
3. the evidence doc sections the plan names — external facts are never re-derived from memory;
4. `architectural_contracts/01-implementation-contract-guide.md`, then the contract sections the
   phase plan names, plus anything your own routing adds (say so in the Review log);
5. the active phase plan, in full, including its Review log;
6. the approved predecessor implementation, opened only to learn what exists (pattern-authority
   rule: contracts teach how to write; implementation files show what is there).

Do not read every architecture document. Follow the routing protocol in
`agent-skills/policy/architecture-context-policy.md` and load the minimum sufficient authoritative
context. **Every implementing sub-context re-emits master plan §5's contract selection in the
Review log before coding**, and adds anything its phase's concerns touch that the list missed.

Authority boundaries (master plan §2, §9.2):

- the **intention** owns product semantics, invariants and the §17A mechanism contracts; no
  session in this window authors, edits, extends or "corrects" one;
- the **master plan** owns the shared skeleton: names, constants, environment, sequencing,
  standing rules, the tracker;
- the **architecture contracts** own engineering constraints;
- each **phase plan** owns its phase-local goal, files, tasks and acceptance criteria;
- `src/lib/` never imports from `src/features/` (R10, contract 03 §4) — this window builds two
  lib modules and one feature area, and that direction is the phase boundary made physical;
- the **frontend stream** (`Proposales-frontend`) owns presentation only; nothing in this window
  reads it, writes it, or adapts to it.

Never let a lower-authority artifact silently override a higher one. **This document is a
lower-authority artifact.** Where authorities genuinely conflict: stop that decision, surface the
exact conflict, and route it per master plan §2's fold-back rule and guide §6. Never choose,
weaken, or normalise silently.

────────────────────────────────────────────────────────────
4. EXECUTION AUTHORIZATION FOR THIS WINDOW — AND ITS RECORD
────────────────────────────────────────────────────────────

For this explicitly assigned window, the owner authorizes Astra to orchestrate internally the
workflow the owner has been opening manually: Astra acts as **coordinator**, and launches fresh
isolated sub-contexts for **projection**, **implementation**, **review**, **bounded correction**
and **focused re-review**.

This authorization applies **only to phases 08 through 10**, and it withdraws, for this window
only, two standing arrangements:

- the coordinator-orchestrates-only convention — the coordinator prepares prompts and the owner
  opens every session. In this window Astra opens the sessions;
- the staffing split in master plan §9.0.1, "**Codex implements, Claude reviews**" — every role in
  this window runs on Astra. The capability rule (a reviewer session runs on a model at least as
  capable as the session that implemented the phase) holds trivially; **the cross-family property
  that §9.0.1 says is worth as much as raw capability is spent.**

**Because the cross-family property is spent, three consequences bind for every phase in this
window:**

1. **The projection gate is never waived in this window.** All three phases already carry
   `Projection gate: mandatory` in their plan Notes (phase 8 rank 4, phase 9 rank 12, phase 10 as
   a new mechanism), so no waiver was available anyway — but state the reason in the record:
   projection is the only independent read of a plan before code exists when one model fills every
   role. **The already-compiled phase-8 projection prompt is live and is used as written** (§5
   item 8, §7B note); it deliberately carries no window context, which is exactly what makes it a
   valid sub-context prompt.
2. A reviewer finding that turns on "the implementer and I read this the same way" is recorded as
   such in the Review log rather than treated as agreement.
3. Every implementer prompt Astra compiles states its scope fences and its named mutations
   **enumeratively** ("the four probes are these four: MUT-08-1 …"), never by reference to
   judgment.

A fourth consequence is earned by this project's own history and is not optional. **Phases 5, 6
and 7 were each approved on a coordinator validation rather than an independent re-review after
their fix round, and phase 7 is the phase where the independent review found three guards that
could not fail after two prior sessions had missed them** (master plan §4, phase-7 row). In this
window, **a fix round is always followed by a fresh re-review sub-context** (§7H). Do not close a
phase on your own validation of your own fix.

**A prompt cannot amend the master plan; the master plan must record this itself** (fold-back
rule: a process change is made in its home artifact). Therefore Astra's **first pipeline write,
before any phase-08 work**, is:

- add a lettered subsection **§3A "Astra window 01 (owner authorization, 2026-09-06)"** to
  `master-plan.md` §3, stating: the window (phases 08–10); what it withdraws (the two arrangements
  above, naming §9.0.1); what it keeps (every item in the "does NOT supersede" list below); the
  four consequences; that every tracker note and Review-log entry in this window records
  "Astra window 01: coordinated, projected, implemented and reviewed by Codex Astra sub-contexts";
  and that the standing arrangement and the §9.0.1 split resume unchanged at phase 11 with no
  further decision;
- append a gate-log entry to §11's **Gate log** paragraph for the authorization;
- commit these two edits alone as pipeline documentation, subject in this repository's existing
  style (`Record the owner's authorization of Astra window 01 (phases 08–10)`).

The starting gate (§5) then verifies that record exists before phase 08 begins.

This authorization does NOT supersede: the intention; the architecture contracts; phase scopes;
acceptance criteria; the naming registry; source-of-truth and fold-back rules; checkpoint
requirements; review quality; dependency gates; the named-mutation requirement; documentation
requirements; git provenance rules; phase ordering; the positional-state artifact trail (§7A);
the evidence budget (§7B).

Do not interpret this as permission to redesign the workflow.

────────────────────────────────────────────────────────────
5. STARTING GATE — CONTENT ONLY, STOP AND REPORT ON ANY FAILURE
────────────────────────────────────────────────────────────

Gate on content the work itself will change and nothing else will. **Never gate on a commit SHA,
on whether the working tree is clean, or on a file count** (coordinator doctrine).

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Worktree and branch | `git rev-parse --show-toplevel`, `git branch --show-current` | the backend worktree above; branch `main` |
| 2 | Intention ratified | intention status header | the **Status** value reads `RATIFIED` |
| 3 | Predecessors approved | `master-plan.md` §4 rows 1–7 | every **State** cell reads `APPROVED` |
| 4 | The plans agree | each of `plans/phase-0{1..7}-*.md` headers | each `state:` reads `APPROVED` |
| 5 | Phase 07's closeout ritual ran | `handoffs/*/`, `archive/plan_7/` | no phase-07 row remains in any handoff table; `archive/plan_7/` holds its four prompt/handoff pairs |
| 6 | Phase 07's output exists | the tree | `src/features/proposal-preparation/server/domain/rank-candidates.ts` and `services/search-content-for-human.ts` exist |
| 7 | Phase 08 is genuinely outstanding | `plans/phase-08-ai-provider-boundary.md` header; `master-plan.md` §4 row 8 | both **State** values read `NOT_STARTED`; `src/lib/ai/` does not exist; `@ai-sdk/anthropic` and `@ai-sdk/openai` are absent from `package.json` |
| 8 | The phase-08 projection is already dispatched | `prompts/reviewer/` | `phase-08-projection-round-0.reviewer.md` is present and unconsumed (no matching handoff) — **this is the prompt you run for phase 08's projection; do not recompile it** |
| 9 | This window's authorization is recorded | `master-plan.md` §3A and the §11 gate log | both entries from §4 above exist (write them first if they do not; then re-check) |
| 10 | Doctrine reachable | the six absolute paths in §0 | every file reads |

Also record, in the window's opening note, `git status --porcelain` with every entry attributed.
**Expected and pre-attributed: `tsconfig.tsbuildinfo`**, which is tracked although
`npm run typecheck` rewrites it (master plan §11 follow-up 8) — it will appear dirty after every
evidence stamp, it is not this window's work to fix, and it must never be silently absorbed into a
checkpoint that claims a narrower perimeter. Any other uncommitted change under `src/`, `test/`,
`e2e/`, `package.json`, `package-lock.json`, a config file, or the pipeline folder that no
artifact explains is a stop-and-report, not something to absorb.

Do NOT "repair" or reimplement phases 01–07 because you would have done them differently.
Approved predecessor work is established project state, including the three phases whose approval
carries a recorded caveat. If a concrete predecessor defect makes a phase in this window
impossible or violates an applicable MUST, report the exact defect as a decision card (§15) and
stop; do not rewrite predecessor scope.

────────────────────────────────────────────────────────────
6. EXECUTION MODEL
────────────────────────────────────────────────────────────

Serial, gated:

PHASE 08 → PHASE 09 → PHASE 10 → STOP

A phase begins only after its predecessor is recorded `APPROVED` in the tracker and in the plan
header. The true dependency edges are `1 → 8 → 9 → 10` (master plan §7.1): phase 9 cannot be
implemented against an unapproved AI boundary, and phase 10 consumes phase 8's `AgentMessage`
type. Never combine phases into one implementation pass; never combine their commits; never move
a task into another phase for convenience. The phase plan is the implementation perimeter.

**Per-phase state transitions are yours to record in `master-plan.md` §4 and in the plan header:**
`NOT_STARTED → PROJECTED → PROMPT_READY → IMPLEMENTING → IMPLEMENTED → REVIEWING →
CHANGES_REQUESTED (→ IMPLEMENTING) → APPROVED`. A sub-context updates only its own row and state;
findings go to the plan's Review log.

**Resumability.** State is positional (master plan §3, §11): live prompts in `prompts/<role>/`,
unconsumed reports in `handoffs/<role>/`, closed rows in `archive/plan_<n>/`. If this window is
interrupted for any reason, the next session resumes from that positional state and the tracker,
never restarts the window and never re-runs a completed phase.

────────────────────────────────────────────────────────────
7. PHASE LIFECYCLE (the doctrine files own the detail; this is the window's checklist)
────────────────────────────────────────────────────────────

For EACH phase independently:

### A. PRE-FLIGHT (coordinator, you)

- Read the active phase plan in full, its Read-first list, and the predecessor's Review log.
- Re-run architecture-contract routing for the concerns the phase touches.
- Verify the predecessor is `APPROVED` and the phase header is `NOT_STARTED`.
- **Lint the plan before dispatching it** (coordinator doctrine): every reference resolves (paths,
  symbols, constants, fixtures, observables); every count is **derived by a command** —
  re-derive the row total and the named-mutation total from the criteria table **with per-criterion
  summands** (`C1 4 · C2 2 · …`) and treat the plan's own "Criteria: … rows: … mutations: …"
  sentence as a claim to check, not a fact; every criterion row is addressable; every row states
  one exact outcome; every trace cell resolves to an M-number or a §17A section that exists.
- Run the extra checks: perimeter-vs-guard collision; a deletion leaves no unused import; and
  **grep `master-plan.md` for the phase number**, including §7.2's ledger coverage table, §11's
  follow-up register and §12's open items — several of them name these three phases.
- Identify the allowed write perimeter (the plan's "Files expected to change" plus the tracker
  row, the Review log, and any master-plan or documentation edit the phase's tasks actually
  require — see the three named cases in §11A), the named mutations, the required evidence and its
  scope (§7B), and the documentation-impact obligations.
- Fold any lint defect into the plan **before** projection (a count correction, a resolved
  reference), recording the fold in the plan's Review log. A defect that changes product semantics
  is an owner decision card, not a fold.

**Coordinator pre-lint already performed for you (verify it, do not trust it).** All three plans'
declared totals reconcile with master plan §4's summands as of 2026-09-06:
`phase 08 = 6 criteria / 26 rows / 4 mutations` · `phase 09 = 6 / 22 / 4` ·
`phase 10 = 6 / 25 / 5`. Two defects were found and are yours to fold:

- **The live phase-08 projection prompt is misnamed.** It is
  `prompts/reviewer/phase-08-projection-round-0.reviewer.md`, missing the `.prompt.` segment that
  master plan §11's archive-naming rule requires and that every file in `archive/plan_7/` carries.
  The rule exists because archiving flattens the prompt and handoff tables into one directory and
  a bare `mv` silently overwrote two files once already. **Rename it to
  `phase-08-projection-round-0.prompt.reviewer.md` before launching it**, and archive with `mv -n`
  or an explicit rename, never a bare multi-file `mv`.
- **Phase 09's own Notes oblige its projection to add a criterion row** (the tool's input bound
  *is* `MAX_SEARCH_QUERY_CHARS`, never a second literal `200`). Its totals will therefore change.
  Re-derive them after the fold and update **both** the plan header sentence and master plan §4's
  summand line — §4's own coordinator notes record that two summands were wrong for three phases
  running while that very line asserted the counts were derived.

Do not code before this is complete.

### B. PROJECTION (fresh sub-context; mandatory for all three phases — §4)

- **Phase 08:** launch the existing prompt file (renamed per §7A above) unchanged. It already
  carries the doctrine paths, the gate check, the read order and the depth targets.
- **Phases 09 and 10:** compile `prompts/reviewer/phase-NN-projection-round-0.prompt.reviewer.md`
  in the shape of the phase-08 one and per the coordinator doctrine: the `plan-projection` doctrine
  path, the phase's silent-failure mechanisms as named depth targets, the Read-first list, the
  content-only gate check. **The prompt carries no planning context, no window context, and no
  suspected defects** — an anchored projection proves nothing.
- The sub-context deposits `handoffs/reviewer/phase-NN-projection-round-0.handoff.reviewer.md`
  (`verdict: PROJECTED_CLEAN | AMENDMENTS_REQUIRED`).
- Consume the handoff adversarially: reconcile its arithmetic, diff its declared write perimeter
  against `git status` (it may write only its handoff), confirm zero L4 spent.
- Route **every** ledger row before compiling the implementer prompt: plan gap → amend the phase
  plan; skeleton gap → amend the master plan; free choice → an explicit delegation list in the
  implementer prompt; intention gap or owner card → **STOP** (§15). Record each routing in the
  plan's Review log. Tracker → `PROJECTED`.

### C. IMPLEMENTATION (fresh sub-context)

- Compile `prompts/implementer/phase-NN-round-1.prompt.implementer.md` per the coordinator
  doctrine and in the shape of the archived phase-07 implementer prompt
  (`archive/plan_7/phase-07-round-1.prompt.implementer.md`): doctrine paths, content-only gate
  check, read order, **enumerated** scope fences, the **enumerated** named mutations with their
  summands, the delegated decisions from projection, the inherited hazards (§11A), the evidence
  budget (§7B), the closing protocol, contract 14 §8's closeout question, the handoff path and row
  schema, the owner-layer closing message. Tracker → `PROMPT_READY`, then `IMPLEMENTING` when
  launched.
- Launch the sub-context with exactly that prompt file. It follows the `implementation-executor`
  doctrine: gate check, coverage map (one line per criterion **row**, both directions), red
  baseline, implementation, every named mutation applied to the tree and reverted with a full
  evidence record, the closing L4 stamp, the documentation impact review, tracker row →
  `IMPLEMENTED`, Review-log entry, the checkpoint commit (§7E), and the handoff at
  `handoffs/implementer/phase-NN-round-<n>.handoff.implementer.md`.
- Implement only that phase. Use existing repository patterns where they satisfy the contracts —
  `src/lib/proposales/` is the precedent for an integration adapter and
  `services/search-content-for-human.ts` is the precedent for a service's `deps` shape. No
  speculative abstractions; no generic infrastructure for hypothetical callers.

### D. VERIFY (inside implementation, then again at consumption)

- Tests prove behaviour at the lowest layer that can observe the subject. Everything in this
  window is a **node**-project test (`src/lib/**/*.test.ts`, `src/features/**/*.test.ts`); confirm
  new files are actually collected with `npx vitest list` — master plan §10.3's known hazard is
  that a test file outside the claimed globs is claimed by no project and stays silently green.
- Every guard, absence claim, purity check and silent-failure mechanism ships with its planted
  defect **applied to the tree and reverted**, with a full evidence record. A guard that cannot
  fail is not evidence. `executed != declared` blocks `IMPLEMENTED`.
- Apply master plan §9.1 rules 14, 15 and 16 as review criteria, not as background reading:
  one named mutation proves one named row; an exclusion/ordering row's fixture must make the
  predicate under test the **only** reason for the observable; a guard's instrument is proven, not
  assumed, and a source-text guard enumerates every **form** (static import, `import type`,
  dynamic `import()`, global access) — one mutation certifies one form.
- Never: weaken assertions; disable or skip tests; convert a failure into expected behaviour
  without authority; substitute a snapshot for behavioural evidence; claim a command ran when it
  did not.
- **Consume the implementer handoff adversarially** before compiling the review prompt: declared
  perimeter vs tree, mutation table vs the plan's count (checked against the table, not the prose),
  test-count growth vs what the cycle owed, L4-run count vs budget. Every discrepancy becomes a
  named probe in the review prompt.

### E. CHECKPOINT COMMIT (implementer, the moment it reaches `IMPLEMENTED`)

Subject prefixed `CHECKPOINT (not approved): phase NN …`, under the owner's standing authorization
(master plan §3) — no round stops to ask. Stage **only** that cycle's declared files plus the
tracker and Review-log edits it actually made (master plan §9.1 rule 13: a checkpoint never claims
a narrower diff than it contains; coordinator folds already in the worktree are committed
separately or named in the handoff's full observed perimeter). Checkpoints are never squashed.

### F. FRESH REVIEW (fresh sub-context)

- Compile `prompts/reviewer/phase-NN-review-round-<n>.prompt.reviewer.md` (`role: review`) per the
  coordinator doctrine: the `plan-reviewer` doctrine path, the full checklist, the evidence budget,
  and the judgment-call probes you extracted from the implementer's handoff.
- The reviewer never trusts the implementer's summary. It runs the architecture protocol in
  reverse (diff → concerns → guide → contracts), checks every criterion row, verifies the
  perimeter with `git diff`, **mutation-tests the tests by variation** (a site, condition or mutant
  shape the record never tried), checks source-of-truth boundaries and documentation impact, and
  hunts shortcuts that pass tests while violating the intention. Orphan tests are findings. It
  never fixes.
- It deposits `handoffs/reviewer/phase-NN-review-round-<n>.handoff.reviewer.md`
  (`verdict: APPROVED | CHANGES_REQUESTED`), appends its findings to the plan's Review log, and
  flips the tracker row. Tracker → `REVIEWING` on launch.

### G. CORRECTION — ONLY IF REQUIRED (fresh sub-context)

- Compile `prompts/implementer/phase-NN-fix-round-<n+1>.prompt.implementer.md` (`role: fix`):
  finding-scoped, **each finding's correction clause quoted verbatim**, an explicit file perimeter
  the re-review will verify, any helper or test the fix supersedes named for deletion, "resolve,
  don't relitigate; add nothing beyond the findings", the evidence budget.
- No broad opportunistic refactor. Fix the findings and their directly affected seam. Re-run every
  retained mutation whose test file the fix touched, take the cycle's L4 stamp, make a new
  checkpoint commit, deposit the handoff with a cycle-scoped perimeter.
- **A prescription can be wrong.** Phase 7's fix round found that two of the review's prescriptions
  and three of the coordinator's ledger cells were themselves wrong, and caught it by *running*
  them rather than reasoning about them. Run every prescribed mutation on the tree; if a
  prescription is wrong, say so in the handoff with the evidence and correct it, don't implement a
  probe that cannot observe its row.

### H. RE-REVIEW (fresh sub-context; **always, after every fix round** — §4 consequence 4)

- Delta-scoped per the charter's review protocol: it opens with the review history (what is
  settled and by whom); step 1 is the **verified perimeter** (`git diff` against the fix prompt's
  allowed files — anything else is an automatic finding); full adversarial depth on the changed
  seam; evidence per §7B; settled areas are not re-audited, but anything seen wrong in passing is
  reported.
- Corrections converge. If a third correction cycle is needed on one phase, stop and report why
  (§15) rather than looping.

### I. APPROVAL AND CLOSEOUT (coordinator, one atomic ritual)

Only after every acceptance criterion row genuinely passes and the reviewer's verdict is
`APPROVED`:

1. fold the final review handoff (lessons → their home artifacts; carry-forward notes → the named
   destination phase's plan text; candidate criteria → folded with a trace cell, or refused with a
   recorded reason);
2. archive the phase's spent prompts and consumed handoffs to `archive/plan_<n>/` — **every file
   carries `.prompt.` or `.handoff.` before the role segment, and archiving uses `mv -n` or an
   explicit rename, never a bare `mv` of several files into one directory** (master plan §11);
3. tracker row and plan header → `APPROVED`, with date, actor (`Astra window 01`) and a note that
   states the derived counts, the mutation ledger (declared = executed), the closing L4 evidence,
   and any caveat;
4. append the phase's gate-log entry to §11's Gate log;
5. the approval-gate commit, capturing code state, tracker, archive moves and fold-backs together,
   subject in this repository's existing style (`Approve Phase NN — …`);
6. only then, pre-flight the next phase.

────────────────────────────────────────────────────────────
7A. THE ARTIFACT TRAIL IS NOT OPTIONAL
────────────────────────────────────────────────────────────

Internal orchestration changes who opens a session, not what a session leaves behind. Every
sub-context is started **from its prompt file and nothing else** — no window context, no chat
summary, no "as we discussed" — and reports **through its handoff file**, which is what you
consume; the sub-context's chat output is not the record. Every prompt and handoff carries the
row-schema frontmatter (prompts: `plan`, `role`, `round`, `date`; handoffs additionally
`state`/`verdict`, `actor`) and every handoff declares the session's **full write perimeter**.

A senior reviewer reading `git log`, `archive/plan_<n>/` and the Review logs after this window must
be able to reconstruct every round exactly as if the owner had opened it. This is the property the
window is being tested on; it is not paperwork.

────────────────────────────────────────────────────────────
7B. EVIDENCE BUDGET (charter test-evidence section; master plan §10.5)
────────────────────────────────────────────────────────────

- Inner-loop evidence runs at **L1** (`npx vitest run <path> [-t "<name>"]`), **L2**
  (`npx vitest run --project node <dir>` — e.g. `src/lib/ai`, `src/lib/agent`,
  `src/features/proposal-preparation/server`) or **L3**
  (`npx vitest run --project node src/features/proposal-preparation src/lib`).
- **Exactly one L4 stamp per implement or fix cycle**, taken on the tree actually handed over:
  `npm test` plus `npm run typecheck` and `npm run lint`, recorded with the tree identity
  (`git rev-parse HEAD` + `git status --porcelain`, or the SHA plus a `git diff | shasum` digest
  when dirty — and `tsconfig.tsbuildinfo` will be dirty).
- **A cycle that changes `package.json`, `package-lock.json`, or a config file additionally runs
  `npm run test:e2e` and `npm run build`** — that is phase 08's implementation cycle, because it
  installs two vendor packages. Master plan §9.1 rule 10: CI runs both on every push and a phase
  must not leave either red.
- **Every approval gate takes that same full stamp**, for the same reason.
- A session that changes anything after its stamp re-takes it; the re-take is not over-budget.
- Any further L4 requires one line written **before** the run: "narrower evidence insufficient
  because …". Re-running evidence whose tree identity matches, with no variation and no such line,
  is a finding against that session. Reviewers reuse tree-matched evidence by citation and spend
  their budget on **variation**.
- Every evidence record carries hypothesis, scope, exact command, tree identity, result, and the
  failure-ID delta.
- Projection sub-contexts spend **zero** L4.

────────────────────────────────────────────────────────────
8. DEPENDENCIES, PACKAGES, AND THE UNRESOLVED MODEL ID
────────────────────────────────────────────────────────────

The owner authorizes installing the dependencies the active phase requires; no stop is needed for
a dependency the plan and the contracts already justify.

**Enumerated for this window (derived from the three plans and master plan §10.1):**

| Phase | Package | Justification | Recorded where |
|---|---|---|---|
| 08 | `@ai-sdk/anthropic`, `@ai-sdk/openai` | the two members of the `AI_PROVIDER` enum; the vendor factories are the only place a vendor SDK is imported (plan task 1, Notes) | the phase-08 Review log **and master plan §10.1**, with the resolved versions |
| 09 | none | — | — |
| 10 | none | — | — |

`ai@7.0.92` and `server-only` are already installed. Peer range on both vendor packages is
`zod ^3.25.76 || ^4.1.8` against the installed `zod@4.5.4`; if npm reports a peer conflict, that is
a stop-and-report (§15), not a `--force`.

Rules: install only what the active phase's criteria need; never a later phase's package early;
update `package-lock.json` normally; evaluate trust implications per contract 10 §11.
**Phase 08's write perimeter therefore includes `master-plan.md` §10.1** — name it in the
implementer prompt so the edit is declared, not discovered.

**The AI model id is unresolved and you must not resolve it.** Master plan §11 follow-up 6:
`.env.example` once read `AI_MODEL=gpt-5.6-luna` while the owner stated `gpt-6.6-luna`; one is a
typo and *the coordinator did not guess*. Phase 1 emptied `.env.example`, the schema has no
defaults, and the node test placeholder is `test-placeholder-model`. **No criterion in phases
08–10 needs the real value** — every row runs on the placeholder or on an explicitly constructed
env object — so this is **not** a blocker for this window and you must not stop for it. It is also
not licence to write either literal into code, a default, a fixture, `.env.example` or a README.
Carry it into the window handoff as an open owner item that becomes load-bearing at the first live
exercise (phase 15).

If installation or tooling is blocked externally (credentials, registry, permissions, platform),
STOP at that blocker and report in the §15 format. Do not invent an architecture-violating
workaround. After the owner resolves it, resume from the same phase and round.

────────────────────────────────────────────────────────────
9. WHAT THIS WINDOW MUST NOT BUILD (the recorded local resolutions)
────────────────────────────────────────────────────────────

Master plan §5's local resolutions are decisions already taken. Re-deciding them silently is the
failure mode this section exists to prevent:

- **R4 — one operation.** The AI boundary exposes `generateStep` and nothing else. Contract 07 §8
  names `generate`, `generateStructured` and `stream`; the run loop needs one step primitive and
  no streaming exists without a UI. **No dead methods** (charter rule 4).
- **R2 — no `src/lib/agent/approval.ts`.** Contract 08 §2 lists a generic approval envelope; it is
  not created in v1. The feature's own `schemas/approval.ts` (phase 13) is the specialization.
- **R3 — no transport.** No Route Handler, no Server Action, no HTTP surface anywhere in this
  window. Services take plain arguments.
- **R10 — `src/lib/` never imports from `src/features/`.** Phase 9 is the live test of this: the
  runtime in `src/lib/agent/` is **generic** — it receives `initialMessages`, `tools`, an
  `outputSchema` and budgets, and knows nothing about turns, sessions, propositions or
  conversations. The feature's two tools live under `src/features/.../server/tools/` and depend on
  the runtime, never the reverse.
- **R13 — the conversation is a second caller-held object**, owned by the feature, never persisted,
  never merged into `ProposalWorkflowState`, and **the AI SDK's message types never leave
  `src/lib/ai`**. Phase 10's `build-messages.ts` imports from `@/lib/ai` types and feature schemas
  only — nothing from `"ai"` or `@ai-sdk/*` (C4(e) measures this).
- **R16 — no branded identifier types** in v1.
- **No persistence of any kind**, in any phase, in any form (contract 09 §1; §12 anti-patterns).
  No database, no cache, no file store, no module-level mutable session map.

────────────────────────────────────────────────────────────
10. SENIOR IMPLEMENTATION PRINCIPLES (the contracts own these; stated as the window's emphasis)
────────────────────────────────────────────────────────────

**A. BOUNDARIES.** Every module in `src/lib/ai`, `src/lib/agent` and
`src/features/proposal-preparation/server` begins with `import "server-only";`. Schemas under
`schemas/` are runtime-neutral. Configuration is read through `serverEnv` only, never
`process.env` in a module (contract 02; the phase-1 lint rules enforce it, and widening the
`process.env` exception list reddens phase 1 C3(c) — do not widen it).

**B. DEPENDENCY INJECTION BY PARAMETER.** `(input, deps = defaultDeps)` with `deps` typed and
complete (contract 04 §4). Lazily-constructed dependencies are **getters** on a module-level
`defaultDeps` so that no client is constructed and `serverEnv` is not read at import time — the
precedent is `services/search-content-for-human.ts` (master plan §6.6, amended by the phase-7
projection). `createAiClient(env = serverEnv, deps = { generateText, resolveModel })` follows the
same shape.

**C. DETERMINISM.** Every timestamp comes from `deps.now()`; every id from
`deps.newGenerationId()` / `newQuestionId()` / `newTurnId()`; every clock in the run loop is
injected. An inline `Date.now()` or `crypto.randomUUID()` in a service or domain file is a finding
(§9.1 rule 4). Tests are deterministic without fake timers.

**D. PARSE AT EVERY BOUNDARY.** Tool inputs, tool outputs, model structured output, and the two
caller-held objects are all parsed, strictly where §17A.3 says strict. Validation failures are
**data** (`{ ok: false, error: { code, issues } }`), not thrown control flow, wherever the plan
says so. Zod 4 emits numeric array indices and reports an unrecognized key as **one**
`unrecognized_keys` issue at the object's own path — see master plan §11 follow-up 7 before
writing any issue-path assertion.

**E. ABSENCE IS A VALUE.** `{ known: false }` is written by hand; a missing key is a *different*
fixture — the one that must fail. `null` in usage means "the provider did not report it" and is
never `0` (§17A.14). No `??`, `||` or default parameter is used to manufacture a value on an
omission path; the **one documented exception** in this window is the usage mapping in
`client.ts`, and it is documented there because §9.1 rule 2 otherwise forbids it.

**F. NO UPSTREAM TEXT CROSSES.** `AiProviderError`'s message is always the fixed generic string;
the SDK error goes to `cause`; `cause` is never serialized (§6.3). The model's own raw text never
appears in a failure result (phase 9 C5(b)). Log events carry ids and counts only.

**G. TESTS.** Behaviour, not implementation trivia; every test traces to a criterion row; no broad
snapshots; fixtures are data and fakes **record, they do not decide** (§9.1 rule 5); a fixture that
exercises a bound is larger than the bound and the test asserts that relation first (rule 6); the
default suite never reaches the network (§10.4's offline guard — a test that needs `fetch` injects
a mock through `deps`).

**H. DOCUMENTATION.** At each closeout ask contract 14 §8's question: "could durable documentation
now be false or incomplete?" Patch only the document that owns the changed truth; no duplicate
truth. In this window that means `src/lib/ai/README.md` (phase 8, required by its plan and by
contract 07 §10) and master plan §10.1's vendor-version row. The feature `README.md` is phase 15's.

────────────────────────────────────────────────────────────
11. PHASE-SPECIFIC STRATEGIC INTENT (the plans are authoritative; this is orientation)
────────────────────────────────────────────────────────────

This window is the backend's **agent-infrastructure milestone**. By the end of phase 10 the
architecture must hold this separation, with each arrow crossing a boundary that is enforced by a
type or a test rather than by convention:

```
Application / domain state          (feature-owned)
        ├── ProposalWorkflowState   the only authority
        ├── ConversationContext     linguistic continuity, never authority
        ├── latest human instruction passed separately, never in history
        └── RetrievalRecord         bounded content identity for this run
                ↓  buildPreparationMessages  (feature-owned, labeled untrusted blocks)
        generic agent runtime       src/lib/agent — knows nothing about turns
                ↓  AiClient.generateStep
        AI provider                 src/lib/ai — the only place a vendor SDK is imported
```

**PHASE 08 establishes the AI provider boundary.** The load-bearing property is that a **string
model id is unrepresentable at the call site**: `LanguageModelInstance = Exclude<LanguageModel,
string>`, the internal `callModel` signature takes the instance, and C1(c)'s `@ts-expect-error`
row is consumed by `npm run typecheck` — which means the *typecheck* is the assertion, and
MUT-08-1 must make it fail. Also: the global provider (`globalThis.AI_SDK_DEFAULT_PROVIDER`,
`@ai-sdk/gateway`) is never touched or imported; error translation is total over the seven
`AiProviderFailureReason` members with `retryable` true only for timeout/429/5xx/transport; no
provider message crosses (C4(h) plants a sentinel and asserts it is absent from the message and
from `toErrorDto`, and **present in `String(err.cause)`** — the second half is what proves the
first is a real filter and not a lost error); usage is `null`, never `0`, for unreported figures.
Read intention §17A.15 as the authority on the model-instance rule; master plan §11 follow-up 4 was
closed on 2026-09-06 specifically so that paragraph is accurate before this phase reads it.

**PHASE 09 establishes the generic agent runtime.** The loop is **ours**, not the SDK's
`stopWhen`, because budgets must be checked between calls and tool execution counted per `execute`
invocation. The three budgets are checked **before** dispatch — C3(e) is the row that proves the
check precedes `invoke`, and MUT-09-2 moves the check after it. A failed run has **no `output`
key** at all (C3(d) asserts `"output" in result === false`, not `output === undefined`). The
read-only tool-set assertion runs before any model call. Structured-output failure retries exactly
once (`MAX_OUTPUT_RETRIES`) with the **issue paths** appended as a labeled message — never the raw
model text. Usage accumulation propagates `null`. The two feature tools take **query strings**, not
structured filters, and `search_content` refuses with `language_unresolved` when `ctx.language` is
null so the model asks or derives first.

**PHASE 10 establishes conversation context, retrieval identity and message assembly.** Three
pure modules, no I/O, no model call, no service. The properties that carry the phase:
`appendTurns` is a pure bounded window that drops the **oldest** and counts them in
`omittedTurns`; `renderAssistantTurn` is **application-rendered, not model-authored** — it emits
ids, catalog-verbatim titles, enum kinds and the rationale, and **never** warning texts,
assumption notes or any URL-bearing field (C3(e) plants `https://evil.test/LEAK` in exactly those
fields and asserts the sentinel is absent); it is **cut** at the cap with a `" […]"` marker because
it is output, while human turn text is **rejected** at the cap because it is input;
`seedRetrievalRecord` starts from the current proposition's blocks and alternatives so a revision
that keeps the current blocks need not re-search them, and everything in the seed was returned by a
read tool in this workflow; `buildPreparationMessages` puts every untrusted value inside a
`labeledBlock`, puts the current instruction **last and separate** with its turn id in the header,
and never puts it in the history block. C6 proves the two caller-held objects cannot absorb each
other — in **both** directions.

────────────────────────────────────────────────────────────
11A. INHERITED HAZARDS — NOT OPTIONAL, CARRIED INTO EVERY IMPLEMENTER PROMPT
────────────────────────────────────────────────────────────

1. **Master plan §9.1 rules 15 and 16 are the newest lessons in this project and were earned by
   phase 7's review, which found three guards that could not fail after two sessions had missed
   them.** Rule 16's form list is explicitly inherited by phase 9's tool boundary (phase-9 Notes):
   a source-text purity guard must enumerate **static import, `import type`, dynamic `import(`,
   and global access** — phase 7's guard shipped blind to `await import("node:fs")`, and a planted
   optional `ai` dependency passed its no-model guard because
   `expectTypeOf(...).not.toHaveProperty(k)` does not fail typecheck for `k?: unknown`. Any
   `expectTypeOf` row in this window ships with a named mutation like every other guard.
2. **Phase 9's projection must add the `MAX_SEARCH_QUERY_CHARS` identity row** (phase-9 Notes,
   phase-7 projection fold, owner card 1): the tool's input bound **is** the constant imported from
   `schemas/content-candidate.ts`, never a second literal `200`. One bound, both search paths.
3. **Phase 10 carries phase 6's review finding N2** (master plan §11 follow-up 11):
   `maximalConformingProposition()` must fill both `MAX_BLOCKS` and `MAX_ALTERNATIVES_PER_BLOCK`
   as well as every bounded text, and the phase-6 workflow-state bound check must be updated to
   exercise two such propositions under the 1 MiB limit. **That update touches a phase-6 test file
   that is not in phase 10's declared "Files expected to change" list.** Widen phase 10's perimeter
   explicitly at pre-flight, record the widening in the plan, and name it in the implementer prompt
   — do not let a fresh sub-context discover it and either skip the follow-up or write outside a
   declared perimeter.
4. **Phase 10 C4(d) needs a system-prompt stub** because phase 11 owns the real
   `preparationSystemPromptV1`. The stub is a **test-local constant**, not a new module under
   `server/agent/prompts/` — creating that module early would be speculative topology (master plan
   §9.2's no-empty-folder rule) and would collide with phase 11's perimeter. Delegate this decision
   explicitly in the implementer prompt.
5. **Master plan §10.3's collection hazard:** a `*.test.ts` outside the claimed globs is claimed by
   no Vitest project and is silently not collected. Every file this window creates lands inside
   `src/lib/**` or `src/features/**`, so the live risk is a stray helper test. Confirm with
   `npx vitest list`.
6. **`tsconfig.tsbuildinfo` is tracked and is rewritten by `npm run typecheck`** (follow-up 8). It
   will make every post-stamp tree dirty. Attribute it in every evidence record; never stage it
   into a checkpoint that declares a narrower perimeter; do not "fix" it in this window.
7. **Phase 7's approval carries a recorded caveat** — no independent re-review followed its fix
   round 2 — and phases 5 and 6 carry the same caveat. Read the phase-7 Review log at phase-08
   pre-flight, not for its content but because the shapes of the three cannot-fail guards are
   catalogued there, and carry any forward hazard it records into the phase-08 implementer prompt.

────────────────────────────────────────────────────────────
12. INVARIANTS THAT ARE BLOCKING CORRECTNESS DEFECTS IF VIOLATED
────────────────────────────────────────────────────────────

- **The model never sees** an epoch integer, a secret, an env value, a URL, or a raw Proposales
  object. Tool outputs are the shaped candidate DTO only; every prompt input arrives as a labeled
  data block (§9.1 rule 3, §12.2, contract 10 §6).
- **No upstream or model text crosses a boundary it was not cleared for**: no provider message in
  an error, no raw model output in a failure result, no free text in a rendered assistant turn.
- **Absent is not zero.** A `null` usage figure stays `null` through the accumulator.
- **A budget is checked before the work it bounds**, and a failed run carries no draft output.
- **The tool set is read-only** and the loop refuses a non-read set before the first model call.
- **The runtime is generic**: `src/lib/agent` contains no reference to turns, sessions, propositions
  or conversation, and imports nothing from `src/features/`.
- **The two caller-held objects are never merged**, and neither schema admits the other.
- **Prior conversation is context, never a source**: it is never an input to approval or execution,
  never stored, and a `proposales_content` reference must be in the run's retrieval record
  (seed ∪ this run's reads) rather than merely mentioned in history (§9.1 rules 11, 12).
- **The current human instruction is passed separately** from history and never appears inside the
  history block.
- **`server-only` is on every authority module**, and no vendor SDK is imported outside
  `src/lib/ai/registry.ts`'s factories.

────────────────────────────────────────────────────────────
13. GIT DISCIPLINE (master plan §3, §8, §9.1 rule 13)
────────────────────────────────────────────────────────────

- Work only in the backend worktree on `main`; **never enter or modify the sibling frontend
  worktree** `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`.
- **The stash stack is shared between the two worktrees: never bare `git stash` / `git stash pop`.**
  Set work aside with a temporary WIP commit instead.
- Every implementation cycle and every fix cycle gets its own
  `CHECKPOINT (not approved): phase NN …` commit; every phase gets its approval-gate commit
  (`Approve Phase NN — …`); pipeline documentation commits use this repository's existing
  sentence-style subjects (`Record the owner's authorization …`, `Dispatch Phase 9 projection`,
  `Fold Phase 8 review and dispatch fix round 2`). Never squash; never collapse two phases or two
  cycles into one commit.
- Stage only declared files. Do not push, do not merge, do not create branches or tags, do not
  rewrite history.

The history must let a senior reviewer read the implementation and review/correction lineage of
each phase.

────────────────────────────────────────────────────────────
14. DO NOT OVER-ENGINEER
────────────────────────────────────────────────────────────

"Senior" is not licence for enterprise architecture. Do not add: any persistence or cache;
authentication; a transport surface, route handler or Server Action (R3); a generic approval
envelope (R2); streaming or extra client operations (R4); provider abstraction beyond the two
enum members; a plugin/registry/factory layer for future providers; retry policy beyond what
§17A.11 and §17A.14 already bound; monitoring or metrics infrastructure; an event bus; a generic
tool framework beyond `defineTool`; branded id types (R16); a `src/lib/agent/approval.ts`,
`src/lib/agent/memory.ts` or any module the naming registry (§6.1) does not list.

**If a file you are about to create is not in master plan §6.1's module map and not in the phase
plan's "Files expected to change", that is a §6 amendment decision, not an implementer's call.**

Senior implementation here means small, clear, correct, well-bounded, well-tested,
architecturally coherent code.

────────────────────────────────────────────────────────────
15. STOP CONDITIONS
────────────────────────────────────────────────────────────

STOP and report to the owner only for:

1. an unresolved conflict between authoritative artifacts (intention vs contract vs plan);
2. a semantic gap that would require inventing or amending intention text — the intention is
   `RATIFIED` and amending it is an owner gate; **silence never ratifies**;
3. a projection or review handoff carrying an owner-decision section, or any decision card;
4. an external credential, permission, registry or environment action — including a dependency
   install that fails or reports a peer conflict;
5. a phase plan that proves internally inconsistent in a way that changes product semantics or
   architecture (a count or reference defect is folded, not stopped for);
6. implementation that would require leaving the assigned phase perimeter, or adding a module, a
   named constant, an error code, a reason-registry member, or an environment variable that master
   plan §6 does not list (each is a §6 amendment through the owner, not an implementer's call);
7. a phase needing a third correction cycle;
8. Phase 10 reaching `APPROVED`.

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

Do NOT stop for: implementation decisions the contracts already govern; installing the two
justified phase-08 packages; the unresolved `AI_MODEL` value (§8 — carry it, don't guess it, don't
block on it); test failures you can diagnose and fix; routine type or lint errors; a lint or
projection finding that is a plan-local amendment.

────────────────────────────────────────────────────────────
16. END-OF-WINDOW HANDOFF
────────────────────────────────────────────────────────────

After phase 10 is `APPROVED` and its closeout ritual has run: STOP. Do not start phase 11. Do not
compile a phase-11 prompt.

Deposit `handoffs/coordinator/astra-window-01-round-1.handoff.coordinator.md` (row schema, plus
`state: COMPLETE | BLOCKED`) containing, and then give the owner the same content in the charter's
owner layer (plain product language, decision cards verbatim, one pointer line to the file):

**WINDOW RESULT** — phases attempted; phases approved; branch; final commit; tracker rows as they
now read.

**PHASE HISTORY** — per phase: projection verdict and ledger rows routed (with their destinations);
implementation rounds; review verdicts by round; correction cycles; re-review verdicts; approval
commit.

**ARCHITECTURE CHECK** — the provider boundary (one operation, string model id unrepresentable,
global provider untouched, no vendor SDK outside the factories); the runtime's genericity (zero
feature imports in `src/lib/agent`); the two caller-held objects still mutually inadmissible;
persistence introduced: yes/no; transport introduced: yes/no; intention text amended: yes/no;
master plan §6 amendments made: list.

**DEPENDENCIES** — packages added with resolved versions, and confirmation that §10.1 records them.

**EVIDENCE** — the final full stamp with tree identity; per-phase mutation counts (declared =
executed, with summands); per-phase criteria/rows/mutations as re-derived, and whether §4's
summand line was updated; L4 runs vs budget; `npx vitest list` confirmation for new test files.

**COUNT RECONCILIATION** — the derived `criteria / rows / mutations` for phases 08, 09, 10 before
and after every fold, and the arithmetic that reconciles §4's totals.

**CONTRACT DELTAS** — contract conflicts surfaced (guide §6) and how each was routed; local
resolutions relied on; unresolved conflicts.

**OPEN ITEMS FOR THE OWNER** — the unresolved `AI_MODEL` value (§8) restated as a decision card;
any follow-up-register row this window opened, closed or moved; anything phase 11 inherits.

**OWNER ATTENTION** — what to inspect before authorizing phase 11, and the recommendation to
compact context at this phase boundary.

Then wait for the next explicit execution window.

────────────────────────────────────────────────────────────
17. DEFINITION OF SUCCESS
────────────────────────────────────────────────────────────

This goal succeeds when:

- master plan §3A and the §11 gate-log entry record this window's authorization, committed before
  phase 08 began;
- phases 01–07 remain intact as approved predecessor work;
- phases 08, 09 and 10 were each linted, projected (no waiver), implemented, reviewed adversarially
  by a fresh sub-context, corrected only within bounded finding-scoped perimeters, **re-reviewed by
  a fresh sub-context after every fix round**, and recorded `APPROVED` legitimately;
- every round left its prompt and handoff rows, tracker transitions, Review-log entries, checkpoint
  and approval commits, and `archive/plan_<n>/` moves — with `.prompt.`/`.handoff.` naming — exactly
  as the owner-run workflow would have;
- every named mutation was applied to the tree and reverted, with `executed = declared` per phase,
  and every count re-derived by command with visible summands;
- the evidence budget was honoured, every L4 run has a tree identity, and phase 08's
  package-changing cycle and all three approval gates also ran `test:e2e` and `build`;
- architecture-contract MUSTs remain satisfied and every conflict was surfaced, never chosen
  silently;
- no persistence, no transport, no vendor SDK outside the registry factories, no feature import in
  `src/lib/agent`, no intention text amended, and no module created that §6.1 does not list;
- the only packages added are `@ai-sdk/anthropic` and `@ai-sdk/openai`, in phase 08, with their
  resolved versions recorded in the Review log **and** master plan §10.1;
- phase 10 leaves the separation diagrammed in §11 standing, with each boundary held by a type or a
  test rather than by convention;
- Astra stopped before phase 11 and deposited the window handoff.

Begin by reading the doctrine files (§0), then the master plan, then recording the window's
authorization (§4), then running the starting gate (§5).
