---
plan: none — this session authors the master plan and the phase plans
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — implementation planning against the ratified frontend intention

You are the **implementation planner** for `frontend_core` (Proposal Copilot Frontend
Core) in `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch
`proposal-copilot-frontend`. Never enter the sibling backend worktree
`/Users/davidloorenz/Desktop/Developer/Proposales`; consume the merged backend
artifacts in this worktree only.

Invoke the `implementation-planner` skill and follow its doctrine. Invoke the
repository's `architecture-context` skill and follow the Architecture Context policy:
this is material planning, so you must re-run contract routing and the master plan must
contain its contract-resolution section. Where this prompt differs from the planner
doctrine, the pipeline charter, the ratified frontend intention, a ratified backend
contract, an applicable architecture contract, or the design integration guide, those
authorities win. This prompt frames the session, fixes its outputs, and carries the two
completed mechanism inventories forward.

---

## 1. Gate check — run first

Stop and report if any row fails. These are content gates only: do not gate on a SHA, a
dirty tree, a file count, or a directory that another session can change.

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention status | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | begins `RATIFIED` |
| 2 | Owner decisions resolved | same file, §15 | heading reads `Ratified owner decisions (0 open)` and the paragraph says no owner decision is open |
| 3 | Both inventories passed | same file, §12A and §16 | §12A.23 and ledger F30 exist; §16 round 8 says the round-2 card is resolved and the inventory exit gate is fully passed |
| 4 | Ratification remains a recorded human act | same file, §16 rounds 2 and 8 | round 2 names David, 2026-09-05, and the presented surface; round 8 records David's resolution of decision 12 |
| 5 | Planning is genuinely outstanding | project `README.md`, project root, and `plans/` | README says planning is not started, `master-plan.md` is absent, and no `plans/phase-*.md` file exists |

If any ratification or inventory row fails, stop and route back to the coordinator; no
criterion may trace to an unratified ledger or adjective-grade mechanism. If row 5
fails because a master plan or phase plans already exist, stop: a later planning session
has done this work.

For context only, record the backend phases currently `APPROVED` from
`build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` §4. They
do not gate this planning session. Backend phases that are not approved are planned as
fixture-era presentation work and later seam replacements, never as a reason to define
or change backend contracts here.

---

## 2. Read first, in order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — artifact map, folder
   tables, intention and phase gates, phase sizing (target no more than eight criteria
   per phase), manifest properties, trace chain, evidence scopes, decision cards, and
   owner layer.
2. `/Users/davidloorenz/agent-skills/implementation-planner.md` — master-plan and
   phase-plan contents, criteria discipline, and exit.
3. The frontend intention, **in full**:
   `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`.
   Read §2.1–§2.4, §4.1, §5–§12A, §13–§16 especially. §12's F1–F30 ledger and §12A's
   contracts are trace targets; §13 is conflict authority; §14 allocates the planning
   decisions; §15 records owner decisions 1–12; §16 rounds 4–8 is the inventory and
   ratification history.
4. The project index:
   `build_docs/under_constroction/frontend_core/README.md`. It is a temporary index;
   this session's master plan absorbs its gate log and standing rules, leaving the
   README as a one-screen pointer.
5. Both consumed inventory reports, as review history rather than live directives:
   - `build_docs/under_constroction/frontend_core/archive/pre_plan/mechanism-inventory-round-1.handoff.coordinator.md`
   - `build_docs/under_constroction/frontend_core/archive/pre_plan/mechanism-inventory-round-2.handoff.coordinator.md`
   Round 2 §9 is particularly binding for the naming registry, F28–F30, named
   mutations, row-by-row restoration coverage, phase sizing, and the `empty`-status
   trap. Its departure-warning card is historical: the owner's decision 12 in the
   intention is the current authority.
6. `build_docs/under_constroction/frontend_core/ui_design/10-design-integration-guide.md`,
   then design specifications 01–09 as their surface is planned. The specifications
   are visual authority; record design deltas rather than editing any specification.
7. The ratified backend intention
   `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md`
   §17A, and the backend master plan §4, §6.3, §6.4, §6.9, §9.0, and §10. §17A is a
   consumed backend contract: cite it, never copy, redefine, extend, or correct it.
8. `architectural_contracts/01-implementation-contract-guide.md`, then the contracts
   your routing selects. The frontend intention's §2.2 is evidence, not a substitute
   for re-derivation: emit selected, added, local, and excluded contracts with reasons.
   Expect the client, runtime, feature, data, server-boundary, agent/HITL, security,
   testing, documentation, design-porting, styling, decision-checklist, and
   anti-pattern concerns to require attention; do not select integration or persistence
   merely because they exist unless the actual planned concern makes them applicable.
9. The current repository configuration and the small existing application surface,
   only to establish facts for the environment topology and current baseline. The
   deleted bootstrap UI is not pattern authority; contracts, the intention, and design
   artifacts govern new structure.

---

## 3. Binding planning boundaries

- The frontend owns presentation and the thin validated browser-to-server boundary;
  backend services, schemas, domain contracts, and §17A mechanisms remain backend-owned.
  The frontend never authors or edits a backend-owned schema.
- Build each surface on named temporary fixtures before its owning backend schema phase
  is approved. Later merge work replaces the adapter and fixture only, preserving the
  presentation components and their existing tests as §12A.8 / F15 require.
- The workspace is page-lifetime only. Do not plan a database, `localStorage`,
  `sessionStorage`, IndexedDB, cookies-as-storage, URL-addressed sessions, rehydration,
  recovery, or cross-device continuity.
- The persistent shell has one Agent Surface and one Main Application Surface. There is
  no router, route, surface registry, surface-kind discriminant, second application
  surface, dashboard, list, history, or speculative extension mechanism in V1
  (§12A.23 / F30).
- Before any phase implements restoration, the master plan's naming registry must close
  the category-A entry set: each entry's name, admissible value domain, and stated
  default. The set is non-empty and every entry must satisfy §12A.21; retain only
  explicit meaningful context, never category-C truth or arbitrary UI snapshots.
- Preserve the total orders and total maps as enumerated contracts. In particular: do
  not use tab status to decide the close guard; results are attributed to their captured
  origin session; the creation refusal covers every close/discard path; departure
  confirmation is requested exactly when **any** session is creating a draft; approval
  is submit-once while pending; and the `ErrorDto` treatment map is total.
- Money is rendered from structured values only, and approval/execution stays behind the
  ratified human approval boundary. The planner must not create a client calculation,
  change detector, approvability verdict, or execution authority.
- Design deltas remain recorded deltas. Do not decide visual behavior the intention
  deliberately leaves to the design owner; route any material semantic contradiction to
  the coordinator with a decision card instead of silently solving it in a phase plan.
- The owner scope brief from backend master plan §9.0 applies verbatim. Codex implements
  and Claude reviews. Every implementation and fix cycle checkpoint-commits with
  `CHECKPOINT (not approved): frontend NN …`. Merge `main` only at backend `APPROVED`
  gates and record each merge in the gate log.

---

## 4. What to produce

### Master plan

Create `build_docs/under_constroction/frontend_core/master-plan.md`. It must be the thin
shared skeleton required by the planner doctrine:

1. Goal with pointers to the intention, not a restatement of product semantics.
2. Sources-of-truth table and fold-back rule, including the frontend/backend/design
   authority boundary.
3. Roles and session workflow, positional prompt/handoff tables, gates, projections,
   reviews, re-reviews, checkpoint commits, and archival.
4. A tracker with one row per phase, all `NOT_STARTED`.
5. Re-derived contract resolution: selected / added / local / excluded, with reasons.
6. Shared skeleton and naming registry. Fix every project-wide name, enum, error/UI
   treatment key, fixture-era marker, and retention-entry name needed to prevent
   parallel phase drift. Carry the category-A set and each entry's default here before
   implementation, never in a component.
7. Sequencing and gates. A phase may begin only after its predecessor is `APPROVED`;
   name which phases require projection because they touch silent-failure mechanisms.
8. Tool protocols after detecting repository affordances; do not invent missing tools.
9. Standing rules, including the project rules currently held in the README and the
   design-delta and backend-ownership boundaries.
10. Verified environment topology: actual commands/configuration locations, baseline
    caveats, test-collection hazard, and fixture-to-production-adapter merge rule.
    The recorded §2.1 verification baseline is historical evidence, not a claim that
    you re-ran it in this documentation-only session.
11. The absorbed index/gate log and any genuine follow-up register. Preserve the
    project standing rules there, then reduce the project README to a one-screen pointer
    to this master plan and the durable authorities.

### Phase plans

Create one independently executable, numerically sorted phase plan under
`build_docs/under_constroction/frontend_core/plans/`. Every plan must contain the
planner doctrine's goal, read-first list, dependencies, expected files, ordered tasks,
addressable acceptance criteria with trace cells, notes, and an empty append-only
Review log.

- Keep each phase at eight criteria or fewer. Split at stable contract seams rather
  than by arbitrary file count.
- Every F1–F30 ledger entry and every applicable §12A invariant must be served by at
  least one phase criterion; every criterion must point back to one of them. Report a
  genuine unreachable or structurally held obligation rather than padding a test.
- Enumerate adjacent precedence cases, every named overlap, every total-map row, and
  every required named mutation. A guard or absence assertion includes its planted
  defect probe; a fixture makes its own predicate the sole reason its expected outcome
  holds.
- Plan the stale-foundation conflict C-4 deliberately: reconcile the actual repository
  with current-state documentation and the stale end-to-end expectation without
  recreating deleted architecture by default. Treat this as a bounded early milestone,
  not a license to let stale documents define the implementation.
- Separate fixture-era presentation work from later integration with backend phases;
  do not block the frontend plan on backend phases that are not approved and do not
  create fake client authority to bridge the wait.
- Phase plans decide the folder boundary, interactive client boundary, store-ladder
  position, component/hook decomposition, concrete category-A entries, primitive
  mapping, testing collection repair, and browser-to-server-boundary form only within
  the intention and applicable contracts. Escalate an owner-level semantic choice with
  a decision card.

### Handoff and non-code perimeter

Create `build_docs/under_constroction/frontend_core/handoffs/coordinator/implementation-planning-round-1.handoff.coordinator.md`
with row-schema frontmatter (`plan`, `role`, `round`, `date`, `state` or `verdict`,
`actor`). It declares the full write perimeter: master plan, every phase plan, README
update, and tool-recorded state if any. Immediately after its opening summary, include
one `⚠ OWNER DECISIONS REQUIRED (n)` section with decision cards in charter format; if
none are needed, say `nothing needs you` there. Report the tracker, phase sequence,
ledger-to-phase coverage, contract resolution, all intentional structural holds, and
the next coordinator action.

This session changes planning documents only. Do not write code, create `src/`, edit
the intention, backend artifacts, architecture contracts, or design specifications;
do not install packages, run tests or a build, or commit. Do not create a `docs/`
folder: this repository's documentation root is `build_docs/`.

---

## 5. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what
it means for you → What happens next → What needs you**. Relay decision cards verbatim,
or say `nothing needs you`. One pointer line names the planning handoff. Use plain
product language; do not make the owner chase section numbers or file paths.
