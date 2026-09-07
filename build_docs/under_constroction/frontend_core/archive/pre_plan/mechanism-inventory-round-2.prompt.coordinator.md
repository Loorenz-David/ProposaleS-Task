---
plan: none — pre-planning gate (mechanism inventory precedes the master plan)
role: coordinator
round: 2
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — mechanism inventory round 2: the shell amendment and the round-5 ratifications

You are running a **second, delta-scoped** `mechanism-inventory` round for `frontend_core` (Proposal Copilot Frontend Core) in `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`. Do not enter the sibling backend worktree. The copy of backend artifacts in this worktree is the only backend context you use.

Invoke the `mechanism-inventory` skill and follow its doctrine. Also invoke the repository's `architecture-context` skill and follow the Architecture Context policy: this session makes material decisions about frontend presentation mechanisms, so contract routing applies. Where this prompt differs from the doctrine, the ratified frontend intention, a ratified backend contract, or an applicable architecture contract, they win. This prompt frames the session, states what is already settled, seeds depth targets, and fixes the write locations.

---

## 1. Why there is a round 2

Round 1 (2026-09-06) inventoried the intention as it stood, added **§12A.1–§12A.20** and ledger entries **F8–F27**, and passed its exit gate conditionally on four owner cards. Since then the intention changed twice, and both changes landed **after** that inventory:

- **§16 round 5 — owner decisions 7–10** resolved the four cards. Decision 7 made a non-empty per-session composer draft meaningful work; decision 8 turned close/discard during draft creation from a confirmation into a **refusal**. §8.1, §12A.6, §12A.15, F13 and F22 changed as a result.
- **§16 round 6 — owner decision 11** replaced "Agent Surface + Proposal Surface" with a **persistent Agent Surface + a session-controlled Main Application Surface**, made each session own the meaningful working context needed to resume that surface, added **§8.6** (categories A / B / C), extended §8.3, §8.5, §12A.1 and §12A.6, and **amended F1** with a restoration clause.

The consequence this round exists for: **F1 now asserts an observable — A → B → A restores A's meaningful workspace context with no reconstructed truth — that no mechanism contract defines.** §8.6 fixes the semantic boundary and explicitly leaves the representation and the qualifying-interaction list to planning (§14.3 item 5a), but "meaningful" is an adjective, and charter rule 5 forbids shipping a mechanism specified by one. Round 1's §12A.6 is the precedent for how to close this without taking planning's decision: fix the predicate's **shape, admissible inputs, failure direction, forbidden list, and invariant**; leave the enumeration to planning.

---

## 2. Gate check — run first

Stop and report if any row fails. These are content gates only: do not gate on a SHA, a dirty tree, a file count, or the contents of a directory the owner also writes.

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention status | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | the `Status` row begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 heading | reads `Ratified owner decisions (0 open)` |
| 3 | Round 1 landed | same file | `### 12A.20` exists and the §12 ledger carries an `F27` row |
| 4 | The delta is present | same file, §16 | a `Round 5` entry records owner decisions 7–10 and a `Round 6` entry records owner decision 11 |
| 5 | This round is outstanding | same file | no `§12A.21` (or higher), no ledger ID at or above `F28`, and no §16 round entry recording a **second** mechanism inventory |
| 6 | The gap is real | same file, §14.3 | item `5a` still defers how the meaningful Main Application Surface context is represented and which interactions qualify |

If row 5 fails because a later session already ran this round, stop: you deepen a ratified intention, you never substitute for its gate or duplicate a completed one.

For context only, record the `APPROVED` backend phases from `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` §4 in your handoff. They gate nothing here.

---

## 3. Read first, in order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — artifact map, gates, decision cards, trace chain, owner layer.
2. `/Users/davidloorenz/agent-skills/mechanism-inventory.md`.
3. `build_docs/under_constroction/frontend_core/archive/pre_plan/mechanism-inventory-round-1.handoff.coordinator.md` — **your review history**. §5's ten unilateral resolutions (A–J) and §6's exit-gate reasoning are settled; consume them, do not re-derive or re-open them.
4. The ratified frontend intention, in full, with §8.6, §12A, §12 (F1 and the F8–F27 table), §13, §14 and §16 rounds 5–6 read closely. §2.2 is the architecture-contract selection; §13 is conflict authority; §14 is ownership of deliberately unresolved work; §15 holds owner decisions 1–11.
5. `build_docs/under_constroction/frontend_core/ui_design/10-design-integration-guide.md`, then design `02`, `04`, `07`, `08` and `09` where a surface under review is theirs. The specifications are visual authority; do not edit them.
6. The ratified backend intention `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md` §17A, and the backend master plan §4, §6.3, §6.4 and §6.9. §17A is a consumed backend contract, never a frontend mechanism-definition target.
7. `architectural_contracts/01-implementation-contract-guide.md`, then the contracts it routes you to for this round's concerns. §2.2's selection stands; for a shell-and-client-state round expect `05-client-architecture.md` (§5, §5.1, §5.2, §7, §8), `02-runtime-boundaries.md`, `03-feature-architecture.md`, `12-anti-patterns.md`, `11-testing-principles.md`, `16-design-prototype-porting.md`, `13-decision-checklist.md` §8, `14-documentation-principles.md` §8. Read only the applicable sections; do not omit a clearly applicable contract.
8. The round-1 prompt, as a shape reference only: `build_docs/under_constroction/frontend_core/archive/pre_plan/mechanism-inventory-round-1.prompt.coordinator.md`.

No frontend implementation exists yet. Implementation files are never pattern authority here; the ratified intention, design specifications, backend contracts, and architecture contracts are.

---

## 4. Scope

### 4.1 Settled — do not re-litigate

Owner decisions 1–11. Round 1's resolutions A–J. §12A.2, §12A.3, §12A.4, §12A.9, §12A.11, §12A.12, §12A.13, §12A.14, §12A.16, §12A.18, §12A.19 and their invariants F9, F10, F11, F16, F18, F19, F20, F21, F23, F25, F26 — unchanged by rounds 5 and 6, and outside this round unless the delta demonstrably falsifies a clause, in which case you report it as a finding rather than rewriting it in passing.

### 4.2 In scope

Every mechanism the rounds-5/6 delta introduced or left as an adjective, plus a **totality re-check** of each §12A section the delta touched or could falsify: §12A.1, §12A.5, §12A.6, §12A.7, §12A.8, §12A.10, §12A.15, §12A.17, §12A.20.

### 4.3 Amendment rules

- Write the delta into the frontend intention only. New contracts are **§12A.21 onward**; update the §12A heading and §12A.0 so the section records that it now spans two inventory rounds. Amend an existing §12A subsection **in place** when the delta falsified it, and name every such amendment in the changelog. **Never renumber a section another document cites.**
- Append new ledger IDs as **F28** onward below F27; no existing ID moves or changes meaning. If an existing invariant's text must change (F1's restoration clause is the candidate), say so explicitly rather than editing it quietly — F1 is an owner-ratified objective.
- Add the next sequential §16 entry (**round 7**). Contract-grade additions are post-ratification amendments and use decision cards. A **material semantic change sets the status back to `COLLABORATING`** and planning waits for owner re-ratification; say so plainly if you reach that conclusion.
- Do not redefine, copy, extend, or silently correct a backend-owned mechanism from §17A. Cite it and define only the presentation-side mechanism that consumes it.
- Do not prescribe files, components, hooks, stores, slices, keys, adapter APIs, or transport signatures, and do not enumerate which interactions qualify as category A — §8.6 and §14.3 item 5a give those to planning. Fix the rule planning's answer must satisfy.
- Do not edit a design specification. A visual conflict is a recorded design delta.
- **Do not introduce infrastructure because an abstraction now exists.** "The shell is not architected as if it could only ever be Proposal Preparation" is a constraint on structure, not a licence for routing, a surface registry, a second surface, or speculative extension points. V1 has exactly one Main Application Surface (§6, decision 11).

---

## 5. Seeded depth targets — rank by silent-failure risk

A floor, not a closed inventory. Where a target is **already** contract-grade in §12A, record it as a one-line "already covered by §12A.n" row and move on; do not manufacture a second contract for it.

1. **Category-A qualification.** The decidable test by which a piece of Main Application Surface context qualifies as retained context: its admissible input classes, what may never qualify (every category-C value; arbitrary DOM or component state; the transient controls of §8.6 B), and its **failure direction when a case is undecided**. Note that the asymmetry here is the opposite of §12A.6's: retaining too much rebuilds the forbidden snapshot engine, retaining too little costs the user their place. If that direction carries product consequence, it is an owner card, not your call.
2. **Restoration on activation — a total case table.** Every reachable case, each with its one stated outcome: a session activated for the first time; a session with retained context; retained context whose target no longer exists in the current result (a review row removed by a later proposition version, a preview of a result that a clarification round replaced); context captured before a result was applied while the session was inactive; a terminal `created` session; a `failed` session. State what the surface presents and what becomes of stale context.
3. **Retained context versus §12A.2.** What happens to a non-active session's retained context when a turn result is applied to it. The rule must be total and must not read the active session id on that path.
4. **The derivation register (§12A.7) after decision 11.** §12A.7 states "unread is the single stored presentation counter" while §8.3 and §12A.1 now require stored category-A context. Resolve the relationship explicitly: whether retained context is a register row, an excluded class, or a third thing — and what stops it becoming a second source of truth for a derived value.
5. **Reference, not value (§8.5).** The decidable line between a session "remembering which review item was selected" (allowed) and "storing a second copy of approval state" (forbidden). A closed rule about what retained context may hold, with an invariant that a category-C value cannot be read back out of it.
6. **The presentation boundary (§12A.8) and retained context.** Whether retained context survives the adapter-era → production-adapter replacement unchanged, and whether it may be keyed by anything a re-fetch can invalidate.
7. **Shell structural persistence.** A testable invariant that activating a session changes what the Main Application Surface presents without replacing the Agent Surface or the identity of the two landmarks (§5.1) — session-controlled **content**, never session-controlled structure — stated so it cannot be satisfied by introducing routing or a second surface.
8. **F1's restoration clause needs a mechanism trace.** Either a new contract registers an invariant that serves it, or the clause is an untestable objective; say which.
9. **§12A.6 after decision 7.** The composer draft as input (6): its per-session ownership and lifetime (§8.1: until sent, explicitly cleared, the session closes, or reload), what happens to it while the clarification panel replaces the composer (§5.2), and its category under §8.6 — §8.1 calls it retained-but-mechanics and §8.6's table does not list it. Reconcile or report.
10. **§12A.6 and §12A.15 after decision 8.** The creation refusal must be total over every path that can raise close or discard: the tab control, keyboard close, the review surface's discard, and **closing a background session whose approval turn is in flight**. State the refusal's interaction with §12A.5's close/focus table and with the last-tab replacement rule.
11. **§12A.17 focus and announcement on activation.** Round 1's focus table predates restoration. Where focus lands when activation restores a surface state, whether restoration announces, and whether any restoration path can move focus in a way that contradicts the existing table.
12. **Scope containment invariant.** A forbidden list that keeps the shell abstraction from becoming speculative infrastructure, and a statement that no additional Main Application Surface, dashboard, list, history, or internal route is in V1 (§6, decision 11).

Also inventory anything else the delta touched that is load-bearing and undefined. Apply the doctrine's own test to each: if this is subtly wrong, does anything crash — or does the workspace quietly behave wrong forever?

---

## 6. Evidence and scope

The evidence budget is **none**. This round changes documents only; the verification baseline in §2.1 stands and no code is touched. Do not run tests or a build, install packages, change code, create a master plan or a phase plan, or commit.

---

## 7. Handoff

Write `build_docs/under_constroction/frontend_core/handoffs/coordinator/mechanism-inventory-round-2.handoff.coordinator.md` with charter frontmatter: `plan`, `role`, `round`, `date`, `state` or `verdict`, `actor`.

Open with a concise summary, then immediately one `## ⚠ OWNER DECISIONS REQUIRED (n)` section. Every decision or ratification is a charter card: **Question → Story → Branches → Recommendation → On silence → Trace**, under ~120 words, story first, no artifact citations inside the story. Anything you resolved unilaterally that carries product consequence belongs there for ratification. If there are none, say `nothing needs you` in that section.

The technical body must include:

1. the round-2 inventory table — mechanism / silent-failure risk / contract status — with "already covered by §12A.n" rows kept separate from new contracts;
2. every intention section added or amended in place, and every ledger ID added;
3. the totality re-check result for each §12A section named in §4.2: still total, or amended, with the reason;
4. backend §17A mechanisms cited but left backend-owned;
5. contradictions resolved unilaterally, separated into those relayed as cards and those recorded technically with the authority each followed;
6. whether any finding amounts to a **material semantic change**, and therefore whether the intention status stays `RATIFIED` or returns to `COLLABORATING`;
7. the exit-gate verdict: whether every silent-failure mechanism introduced by the delta is now contract-grade, and whether `implementation-planner` may start — and if a hold remains, exactly which phase it gates;
8. what the planner must carry forward: the new ledger IDs as trace targets, any new named mutations, and any constant that must be asserted by contract rather than by literal (charter rule 13);
9. the backend `APPROVED` phases, as context only;
10. the full write perimeter — every document changed, plus code and tool-recorded state (expected: none outside documents), verified against the tree.

End your chat response in the charter owner-layer order: what you did; what you found and what it means; what happens next; what needs the owner. Relay any decision cards verbatim, otherwise say `nothing needs you`. Name the handoff file in one final pointer line.
