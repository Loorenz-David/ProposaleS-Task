# Phase 17 — Seam replacement, the critical flow, and closeout

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Gate** | **backend phases 5, 6, 10, 11, 12, 13 and 14 `APPROVED` and merged into this branch** |
| **Criteria** | 5 |
| **Projection** | waivable |
| **Serves** | F15 · F5 · F22 · F7 · `14 §6` · charter manifest property 5 |

## Goal

Replace each surface's temporary adapter and fixture with the production pair, prove the seam
held — no presentation component changed, no existing presentation test edited — run the one
end-to-end flow the intention names, and close the project's documentation.

**Not in this phase:** any new presentation behaviour. A surface that needs a component change to
accept the real contract is a finding against the boundary, not a licence to change it here and
not a reason to change a backend shape.

## Gate — check before anything else

| # | Check | Passes when |
|---|---|---|
| 1 | The owning schema phases exist | backend master plan §4 shows phases 5, 6, 10, 11, 12, 13 and 14 `APPROVED` |
| 2 | They are merged here | those schemas and services are present on this branch and each merge is recorded in the master plan's gate log |
| 3 | The boundary exists | the frontend tracker shows phase 16 `APPROVED` |

## Read first

- Master plan §6.6 (the two eras), §7.3 (the ledger coverage map this phase closes), §7.5 (every
  structurally held row and its trigger), §11.3 follow-up 7.
- Intention §9.4, §10.2 (which surfaces rebind to which backend phase), §10.4 **in full**, §11's
  critical-flow outcome, §12A.8's seam-replacement paragraph, §12A.21's seam paragraph.
- Contracts: `16-design-prototype-porting.md` §2 step 6, §6; `11-testing-principles.md` §2–§3,
  §5; `14-documentation-principles.md` §6 **in full** and §8.

## Dependencies

Phase 16 `APPROVED`, **and** the gate above.

## Files expected to change

```
src/features/proposal-preparation/client/view-models/*     edited — production adapters
src/features/proposal-preparation/client/fixtures/*        renamed and rewritten — schema parse results
src/features/proposal-preparation/README.md                new — the feature README
e2e/workspace.spec.ts                                      edited — the critical flow
README.md                                                  edited — capabilities and limitations
```

**No file under `components/` changes.** If one must, stop: that is F15 failing, and it is a
finding against the phase that drew the boundary, routed to the coordinator before any code moves.

## Ordered tasks

1. **Rebind one surface at a time**, in the order intention §10.2 maps them to backend phases,
   committing a checkpoint per surface so the perimeter of each rebinding is legible.
2. **For each surface:** replace the temporary adapter's input with the real result, convert the
   fixture from a literal into the **parse result of the owning schema** through the production
   adapter, and rename the module and its exports out of the temporary era (master plan §6.6).
3. **Assert the seam held per surface**, in both halves: no presentation component file changed,
   and no existing presentation test of that surface was edited or deleted.
4. **Run the critical human-in-the-loop flow end to end** against a stub that asserts it received
   exactly the approved payload: enter a brief, receive a proposition, correct it, approve, and
   see the editor handoff.
5. **Convert every structurally held row** master plan §7.5 lists whose trigger has now fired,
   and record the ones whose triggers have not.
6. **Write the feature README** describing verified behaviour only — never planned behaviour, and
   never a chronology of how the feature evolved.
7. **Run the project's ledger sweep**: every F1–F30 has at least one green criterion, and every
   criterion traces to one.
8. Closeout: contract 14 §8's impact review across the root README and the contracts README,
   tracker row, Review log, and the coordinator's archival ritual.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The seam held, per surface. One row per rebound surface — thread and pills, clarification, review, preview, created, failure, tab strip: (a) the change touched the adapter and the fixture only; (b) no presentation component file of that surface changed, asserted against the checkpoint that preceded the rebinding; (c) no existing presentation test of that surface was edited or deleted, asserted the same way; (d) every such test still passes unedited. | 7×4 | F15 · §12A.8 · §10.4 |
| **C2** | Every fixture is now its schema's parse result. (a) Each fixture is the parse result of a literal through the owning schema, flowing through the production adapter — one row per fixture module. (b) **Named mutation, per module:** remove a required field from the fixture's literal; that fixture's own construction test must redden. (c) No module still carries the temporary-era marker. (d) No fixture contains real personal or customer data. | 4+ | F15 · §12A.8 · §9.3 |
| **C3** | The critical flow, end to end. (a) A brief is entered and a proposition returns. (b) The proposition is corrected through an explicit edit operation and the corrected version renders. (c) Approval submits, and the stub receives **exactly** the approved payload — asserted by structural equality against what the review surface rendered, not by spot-checking fields. (d) The editor handoff is shown with the server-returned URL. (e) Nothing in the flow is asserted by a large DOM snapshot. | 5 | F5 · F22 · `11 §3` |
| **C4** | The feature's documentation is true. (a) `src/features/proposal-preparation/README.md` exists and describes **verified** behaviour only. (b) It states what the feature owns and what it explicitly does not own, its important states, its invariants, its client and server boundary facts, its failure behaviour, and its excluded scope. (c) It presents no planned behaviour as implemented and carries no chronology. (d) The root README's capabilities, flow and limitations are true of the merged tree. (e) Every internal link in both resolves. | 5 | `14 §6` · `14 §8` |
| **C5** | The project's ledger is closed in both directions. (a) Every entry F1–F30 is served by at least one criterion that is green in the tracker — thirty rows, derived from the phase acceptance tables rather than from the master plan's coverage map, so the map is checked rather than trusted. (b) Every structurally held row whose trigger has fired is now a real assertion; every one whose trigger has not is still marked held with its trigger — one row per held clause in master plan §7.5. (c) No orphan test exists: every test in this feature traces to a criterion row or is declared as a candidate criterion in a Review log. | 30+ | charter manifest property 5 · charter trace chain · F1–F30 |

Rows marked `4+`, `7×4` and `30+` are derived at dispatch from the fixtures, surfaces and phase
tables that actually exist then; the counts are computed from the artefacts, never typed.

## Notes

- **A component change here is a finding, not a task.** F15's whole value is that the fixture-era
  investment rebinds without touching presentation. If a merge forces a component to change, the
  boundary was drawn in the wrong place — the fix is the boundary, and the backend shape does not
  bend.
- **This plan is thin on purpose and is refined at prompt time.** Which surfaces rebind, and in
  what order, follows intention §10.2's mapping and the order the backend phases actually land;
  neither is knowable while this plan is written.
- The feature README is a **current-state document**: when behaviour changes later, the
  description is replaced rather than appended to.
- After this phase the coordinator performs the closeout ritual: the gate commit, the archival of
  every closed prompt and handoff into `archive/plan_<n>/`, and the final tracker pass.

## Review log

*(empty)*
