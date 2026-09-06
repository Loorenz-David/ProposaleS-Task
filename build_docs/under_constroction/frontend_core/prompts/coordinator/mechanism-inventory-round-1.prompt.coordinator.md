---
plan: none — pre-planning gate (mechanism inventory precedes the master plan)
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — mechanism inventory against the ratified frontend intention

You are running the **mechanism-inventory** gate for `frontend_core` (Proposal Copilot Frontend Core) in `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`. Do not enter the sibling backend worktree. The copy of backend artifacts in this worktree is the only backend context you use.

Invoke the `mechanism-inventory` skill and follow its doctrine. Also invoke the repository's `architecture-context` skill and follow the Architecture Context policy: this session makes material decisions about frontend presentation mechanisms, so contract routing applies. Where this prompt differs from the doctrine, the ratified frontend intention, a ratified backend contract, or an applicable architecture contract, they win. This prompt frames the session, seeds depth targets, and fixes the write locations.

---

## 1. Gate check — run first

Stop and report if any row fails. These are content gates only: do not gate on a SHA, a dirty tree, or a file count.

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention status | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`, status table | reads `RATIFIED` |
| 2 | Ratification is a recorded human act | same file, §16 round 2 | names David, 2026-09-05, and the surface in §15.1 together with the four decisions in §15 |
| 3 | No open owner decision | same file, §15 heading | reads `Ratified owner decisions (0 open)` |
| 4 | Inventory remains outstanding | same file | §16 has no round 3 entry and the document has no lettered mechanism-contract section (no `§12A` or equivalent) |

If row 4 fails because the inventory has already been completed, stop: a later session ran this gate. You deepen a ratified intention; you never substitute for its human gate.

For context only, record the `APPROVED` backend phases from `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` §4 in your handoff. They do not gate this work.

---

## 2. Read first, in order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — artifact map, folder tables, gates, decision cards, trace chain, and owner layer.
2. `/Users/davidloorenz/agent-skills/mechanism-inventory.md`.
3. The ratified frontend intention, in full. Treat §2.2 as the architecture-contract selection, F1–F7 in §12 as the trace root, §13 as conflict authority, §14 as ownership of deliberately unresolved work, and §15 as the four ratified owner decisions.
4. `build_docs/under_constroction/frontend_core/ui_design/10-design-integration-guide.md`, then the other nine design specifications only when their surface is relevant. The specifications are visual authority; do not edit them.
5. The ratified backend intention `build_docs/under_constroction/initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md` §17A, and the backend master plan §4, §6.4, §6.9, and §10. §17A is a consumed backend contract, never a frontend mechanism-definition target.
6. `architectural_contracts/01-implementation-contract-guide.md`, then the contracts selected by frontend intention §2.2: `02-runtime-boundaries.md`, `03-feature-architecture.md`, `04-server-architecture.md`, `05-client-architecture.md`, `06-data-contracts-and-validation.md`, `08-agent-architecture.md`, `10-security-and-trust-boundaries.md`, `11-testing-principles.md`, `12-anti-patterns.md`, `13-decision-checklist.md`, `14-documentation-principles.md`, `15-ui-styling-and-component-system.md`, and `16-design-prototype-porting.md`. Read only the sections applicable to the mechanism under review, but do not omit a clearly applicable contract.
7. The backend inventory prompt as a shape reference: `build_docs/under_constroction/initial_core_feature_proposales/archive/pre_plan/mechanism-inventory-round-1.prompt.coordinator.md`.

Do not use implementation files as pattern authority. No frontend implementation exists yet; the ratified intention, design specifications, backend contracts, and architecture contracts are authoritative.

---

## 3. Produce the frontend mechanism inventory

Follow the skill: inventory every load-bearing frontend presentation mechanism, rank it by silent-failure risk, demand a contract-grade definition for every risky mechanism, and verify that every ranked rule is total. A mechanism contract states its inputs and states, precedence and ties where relevant, ownership, forbidden behavior, and an invariant testable on the production path. Adjectives such as “derived,” “meaningful,” “exact,” and “resilient” are unfinished until made decidable.

### 3.1 Intention amendment rules

- Write the inventory delta into the frontend intention only. Add **lettered sections only** beside the material they deepen (for example `§12A`); never renumber an existing section.
- Append every new invariant to the §12 ledger as **F8**, **F9**, and onward. Existing F1–F7 never move or change identity.
- Add the appropriate §16 changelog entry. Contract-grade additions are post-ratification amendments and use decision cards. A material semantic change sets the intention status back to `COLLABORATING`; planning waits for owner re-ratification.
- Do not redefine, copy, extend, or silently correct a backend-owned mechanism from backend §17A. Cite it and define only the presentation-side mechanism that consumes it.
- Do not prescribe files, components, hooks, stores, adapter APIs, or transport signatures. Those choices belong to the frontend planning pass under intention §14.3. Do not resolve any of the four ratified decisions differently.
- Do not edit a design specification. A visual conflict or change is a recorded design delta, not an implementation of the spec.

### 3.2 Seeded depth targets — rank by silent-failure risk

This list is a floor, not a closed inventory. Define the following at contract depth where they belong to the frontend:

1. **Tab status and attention derivation.** Make it a total precedence order over result kind, in-flight state, and unread, including every overlap and accessible representation.
2. **Origin attribution for in-flight turns.** Define how a result returns to the session that originated the turn when another session is active or the origin tab has been closed; no result may be applied by active-tab coincidence.
3. **Meaningful-work confirmation guard.** Derive it from real session/workflow state available at the integration stage, as owner decision 2 requires. It must not devolve into a UI-only heuristic.
4. **Clarification submission.** Specify answer or skip by question id, typed answers unchanged, unanswered questions omitted, and no conversion of omission into skip or any coercion.
5. **Presentation boundary and fixtures.** State what one adapter into a view model preserves, and how a fixture is proven to flow through the production adapter after the owning backend schema merges.
6. **Money rendering.** Define rendering from structured values and a closed list of forbidden operations, including arithmetic and parsing formatted strings.
7. **One owner per derived presentation value.** Cover tab state, formatted money, counts, readiness, attention, and any other derived display value so no independent stored copy can drift.
8. **Approval pending state.** Specify submit-once behavior while pending and the visible/focus outcome for success and failure without making the browser authoritative.
9. **`ErrorDto` treatment.** Define a total `ErrorDto.code` → UI-treatment map, including message, paths, retryability, and an intentional unknown-code fallback.
10. **Tab close.** Define neighbour selection and focus after closing the active or inactive tab, including the last-tab replacement rule.
11. **Tab order and reorder.** Define ordering, insertion/reorder semantics, active-session preservation, keyboard and pointer equivalence, and ties/no-op cases.
12. **Thread autoscroll.** Define follow versus jump-to-latest behavior, user scroll-away protection, and the conditions that resume following.
13. **Narrow-width resilience.** State a testable invariant for usable, uncorrupted narrow widths without choosing the visual mechanism.

Also inventory every other presentation-side mechanism the intention requires: temporary-state replacement on backend merge, result-kind rendering, accessibility/focus transitions, derivation versus server authority, and boundaries that could otherwise silently turn prototype or fixture data into domain truth.

### 3.3 Evidence and scope

The evidence budget is **none**. This inventory changes documents only; its verification baseline is already recorded in frontend intention §2.1. Do not run tests or a build, install packages, change code, or create a master plan or phase plan. Do not commit.

---

## 4. Handoff

Write `build_docs/under_constroction/frontend_core/handoffs/coordinator/mechanism-inventory-round-1.handoff.coordinator.md` with charter frontmatter: `plan`, `role`, `round`, `date`, `state` or `verdict`, and `actor`.

Open with a concise summary, then immediately add exactly one `## ⚠ OWNER DECISIONS REQUIRED (n)` section. Every required decision or ratification is a charter-format card: **Question → Story → Branches → Recommendation → On silence → Trace**. Put any contradiction resolved unilaterally in that section for owner ratification. If there are no cards, say `nothing needs you` in that section.

The technical handoff must include:

1. the complete inventory table: mechanism / silent-failure risk / contract status;
2. every intention section and ledger ID added;
3. backend §17A mechanisms cited but intentionally left backend-owned;
4. all internal contradictions resolved unilaterally, separately identified for owner ratification;
5. the exit-gate verdict: whether every silent-failure mechanism is contract-grade and whether the implementation planner may start;
6. the backend `APPROVED` phases recorded as context only;
7. the full write perimeter — every document changed, plus code and tool-recorded state (expected: none outside documents).

End your chat response in the charter owner-layer order: what you did; what you found and what it means; what happens next; what needs the owner. Relay any decision cards verbatim, otherwise say `nothing needs you`. Name the handoff file in one final pointer line.
