---
plan: none — role handover plus the phase-01 dispatch decision
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — take over the coordinator role for `frontend_core`

You are the **pipeline coordinator** for `frontend_core` (Proposal Copilot Frontend Core) in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Never enter the sibling backend worktree `/Users/davidloorenz/Desktop/Developer/Proposales`;
consume the merged backend artifacts in this worktree only.

Invoke the `pipeline-coordinator` skill and follow its doctrine. Invoke the repository's
`architecture-context` skill and follow the Architecture Context policy: compiling a prompt is
not itself material implementation, but **every prompt you compile must carry its phase's
contract obligations**, so you route before you write one. Where this prompt differs from the
coordinator doctrine, the pipeline charter, the ratified intention, the master plan, a ratified
backend contract, or an applicable architecture contract, those authorities win.

## 0. Why this handover exists

The previous coordinator ran as a **Codex** session and is out of session. You are taking the
role over as a **Claude** session while it recovers. Two facts follow, and neither is a licence
to change anything:

1. **The coordinator role is Claude-side by the charter** ("skills run on Claude-side roles;
   what crosses to any other agent is a self-contained prompt document compiled by the
   coordinator"). A Claude coordinator is the normal shape, not a deviation. Record the actor
   change in your handoff frontmatter and in the tracker rows you touch; do not rewrite history
   in artifacts an earlier actor produced.
2. **The implementer/reviewer split is unchanged and is not yours to reassign.** The owner's
   standing split is *Codex implements, Claude reviews* (backend master plan §9.0 and §9.0.1),
   and the reason is that different model families fail differently — that property is worth as
   much as raw capability. If Codex is still unavailable when phase 01's implementer prompt is
   due, **that is an owner decision, not a coordinator one**: raise it as a decision card (§7)
   and hold. Do not quietly implement the phase yourself, and do not quietly make one Claude
   session both implementer and reviewer.

## 1. Gate check — run first

Stop and report if any row fails. These are content gates only: do not gate on a SHA, a dirty
tree, a file count, or a directory another session can change.

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md` status table | begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 | heading reads `Ratified owner decisions (0 open)` and the paragraph says no owner decision is open |
| 3 | Inventory gate passed | same file, §12A.23 and §16 round 8 | §12A.23 exists, ledger `F30` exists, and round 8 records the round-2 card resolved and the exit gate fully passed |
| 4 | The plan set exists | `master-plan.md` and `plans/` | the master plan exists and `plans/` holds seventeen `phase-NN-*.md` files |
| 5 | Nothing is in flight | `prompts/{implementer,reviewer}/`, `handoffs/*`, the tracker | those prompt folders hold only `.gitkeep`, no unconsumed handoff awaits you other than the planning one, and every tracker row reads `NOT_STARTED` |

If row 5 fails, a session has already started work: consume its handoff before compiling
anything.

**Derive, never type, any count you state** (charter manifest property 3). The plan file count,
the criteria totals, and the ledger coverage are all computed from the artifacts.

## 2. Read first, in order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the artifact map, the folder tables
   and their row schema, the state machine and gates, phase sizing, the manifest, the trace
   chain, the review protocol, evidence scopes, the decision-card format, and the owner layer.
2. `/Users/davidloorenz/agent-skills/pipeline-coordinator.md` — your doctrine: prompt
   compilation, tracker discipline, fold-backs, closeout and archival.
3. `build_docs/under_constroction/frontend_core/master-plan.md` — **in full.** It is the shared
   skeleton you compile every prompt against: §3 the workflow and the positional tables, §4 the
   tracker, §5 the contract resolution, §6 the naming registry including the closed category-A
   entry set, §7 sequencing, the projection gate, the ledger coverage map, the trace-cell
   vocabulary and the structurally-held register, §8 tool protocols, §9 the sixteen standing
   rules, §10 the environment topology and its four baseline caveats, §11 the gate log and the
   design-delta and follow-up registers.
4. `handoffs/coordinator/implementation-planning-round-1.handoff.coordinator.md` — the planning
   session's report. **This is the handoff you are consuming.** Its §9 carries three repository
   findings that shape phase 01, its §6 records the planning decisions every phase inherits, and
   its §11 names the action you are here to take.
5. `plans/phase-01-baseline-and-visual-foundation.md` — the phase you are dispatching.
6. The ratified intention, the sections phase 01 cites: §2.1, §4, §5.9, §13 conflict **C-4**,
   §14.3 items 1 and 4, §15.1 item (k). You do not need §12A in full to dispatch phase 01, but
   you do need it before you dispatch phase 03 onward.
7. `ui_design/10-design-integration-guide.md`, then `ui_design/01-visual-system.md` — phase 01's
   visual authority, and §5 is the set of corrections that win over the prototype's values.
8. `architectural_contracts/01-implementation-contract-guide.md` and the contracts phase 01's
   read-first list names.

## 3. The state you are inheriting

Recorded so you verify it rather than assume it.

- **Seventeen phases, all `NOT_STARTED`**, 113 criteria total. Phases run serially; a phase
  begins only when its predecessor is `APPROVED`.
- **Phases 16 and 17 are gated** on backend approvals that do not exist yet. Backend phases 1–3
  are `APPROVED` and merged; 4–15 are `NOT_STARTED`. Re-check the backend master plan §4 at every
  phase-15 closeout, and record any `main` merge in the master plan's gate log.
- **Projection is mandatory for phases 03, 04, 05, 08, 09, 10, 11, 12, 14 and 15** and waivable
  for 01, 02, 06, 07, 13, 16 and 17 with a recorded one-line justification.
- **The working tree carries uncommitted pipeline work at handover**: the whole plan set, the
  reduced project README, the planning handoff, and the pre-planning archival move
  (`archive/pre_plan/`, with the two live rows deleted from their role folders). See §5.
- `build_docs/future_implementations/` appeared in the tree during the planning session and is
  **not** this pipeline's work. Leave it alone; do not fold it into any commit you make.

## 4. Your immediate action: dispatch phase 01

In order.

1. **Decide the projection gate for phase 01** and record the decision. It is waivable. The
   planning handoff's recommendation is to **not waive it in spirit**: phase 01 is where the
   repository baseline is re-enumerated and where three findings the planner derived by reading
   must be confirmed or corrected by observation. Whichever way you decide, the decision is one
   recorded line in the tracker row's note and in your handoff.
   - If you gate: compile `prompts/reviewer/phase-01-projection-round-0.prompt.reviewer.md`
     against the `plan-projection` doctrine, and set the tracker row to `PROJECTED` only when its
     ledger is fully routed.
   - If you waive: record the justification and go to step 2.
2. **Compile the implementer prompt**,
   `prompts/implementer/phase-01-round-1.prompt.implementer.md`, as a self-contained document for
   a **non-Claude implementer**. It must stand alone by reference: the phase plan's goal and its
   explicit exclusions, its read-first list, its ordered tasks, its acceptance table verbatim with
   every trace cell, the master plan sections it needs (§6 naming registry, §9 standing rules,
   §10 environment and evidence scopes), and the closing protocol.
3. **Carry these five things into that prompt, whatever you decide in step 1.** They are the
   difference between phase 01 landing and phase 01 looking like it landed:
   - **Task 1 is non-negotiable:** re-enumerate the baseline before changing anything — run
     typecheck, lint, the unit suite, the build and the end-to-end suite, and record each exact
     observed result with its tree identity. The planner ran nothing; every baseline statement in
     the master plan §10.2 is derived from reading and must be confirmed or corrected.
   - **The three findings to confirm:** the end-to-end suite is expected red and CI runs it; seven
     custom properties in the global stylesheet have no definition; and the test-runner globs
     leave feature component tests claimed by no project. Each has a criterion; none is a rumour
     to inherit.
   - **Every guard, absence claim and purity check ships with its planted-defect probe** — the
     defect planted, the red observed, the probe reverted, the ledger row written. Phase 01 has
     five such probes and its C5 alone is four absence rows.
   - **Counts are derived, never typed**, and **every test traces to a criterion row**; a test
     with no row is deleted or declared as a candidate criterion in the Review log.
   - **Contract 14 §8.3's closeout sentence, verbatim**, per master plan standing rule 9:
     *"Before closing implementation, evaluate documentation impact according to
     `architectural_contracts/14-documentation-principles.md`. Update any authoritative
     documentation made false, incomplete, or misleading by the verified implementation. Do not
     modify documentation merely because files changed."*
4. **State the checkpoint rule in the prompt**: the cycle commits the moment it reaches
   `IMPLEMENTED`, subject line prefixed `CHECKPOINT (not approved): frontend 01 …`, under the
   owner's standing authorization, staging only that cycle's declared files plus the tracker and
   Review-log edits it actually made.
5. **State the evidence budget**: exactly one full-suite stamp per cycle, taken on the tree
   actually handed over, plus the end-to-end and build steps because phase 01 changes rendered
   structure and CI runs both (master plan standing rule 16). Re-running evidence whose tree
   identity matches, with no variation and no pre-run authorization line, is a finding against
   the session.
6. **Update the tracker row** to `PROMPT_READY` (or `PROJECTED` first, if you gated) with the
   date, the actor, and a one-line note. Agents update only their own row.

## 5. Commit the pipeline state before you dispatch

The plan set, the reduced README, the planning handoff and the pre-planning archival move are all
uncommitted. **Commit them as a documentation commit before the implementer starts**, because
otherwise the phase-01 checkpoint's diff would contain the entire plan set and two claims every
review depends on — "nothing changed outside the perimeter" and "every mutation probe was
reverted" — become unverifiable for that round.

Stage the pipeline's own files only: the master plan, the seventeen phase plans, the project
README, the planning handoff, this prompt, and the `archive/pre_plan/` move together with the two
deletions it implies. **Do not stage** `build_docs/future_implementations/`, and do not stage the
intention's pre-existing uncommitted change unless you have confirmed with the owner that it is
the ratified content the plan set was written against — check that first and report what you
found.

## 6. Standing responsibilities from here

- **One prompt per session, just-in-time, never reused stale.** Each round gets a fresh prompt.
- **Consume every handoff**: verify its declared write perimeter against the tree, route its
  findings to the artifact that owns them, and move the closed rows to `archive/plan_<n>/` at the
  closeout ritual, keeping the `.prompt.` / `.handoff.` infix so a prompt and its handoff cannot
  overwrite each other.
- **Fold review lessons upstream**, never sideways: a semantic change amends the intention through
  the decision-card path, a skeleton change amends the master plan, a phase-local change amends
  that phase plan. A plan is never patched into divergence.
- **Refuse to dispatch a phase that exceeds the ≤ 8-criteria target** without a recorded reason.
  None currently does.
- **Recommend compaction at each phase boundary** and write a context handoff before it.
  Compaction is the owner's call, never self-initiated.
- **Keep the gate log current** in the master plan §11.1, including every `main` merge.
- **Phases 16 and 17 stay undispatched** until their gates pass; the project sitting at phase 15
  with everything green is a correct state, not a stall.

## 7. Owner decisions

Any decision that is genuinely the owner's — the implementer-availability question in §0, a
budget-versus-scope trade, a sequencing change that trades risk — is a **decision card** in
charter format, in one `⚠ OWNER DECISIONS REQUIRED (n)` section placed immediately after your
handoff's opening summary. Relay cards **verbatim**; never re-summarise one into a denser table.
If none is needed, say `nothing needs you` in one line.

## 8. What to produce

- The prompt file step 4 names, in `prompts/` under the right role folder.
- `handoffs/coordinator/coordinator-handover-round-1.handoff.coordinator.md`, with row-schema
  frontmatter (`plan`, `role`, `round`, `date`, `state` or `verdict`, `actor`). It declares your
  full write perimeter — every document, the commit you made and its exact contents, and any
  tool-recorded state — reports the gate check, the projection decision and its justification,
  the tracker rows you touched, what you found in the tree that the planning handoff did not
  predict, and the next action.
- The tracker row update in the master plan.

**Do not**: write code, create `src/`, install a package, run the test suite or the build for its
own sake, edit the intention, a design specification, an architecture contract, a backend
artifact, or any phase plan's criteria. Do not create a `docs/` folder — this repository's
documentation root is `build_docs/`. Editing a plan is a fold-back with a recorded reason, never a
convenience.

## 9. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it means
for you → What happens next → What needs you**. Relay decision cards verbatim, or say
`nothing needs you`. One pointer line names your handoff. Plain product language; do not make the
owner chase section numbers or file paths.
