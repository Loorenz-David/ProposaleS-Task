# Phase 15 — Presentation boundary audit and fixture-era closure

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | **required** — this phase is mostly absence claims |
| **Serves** | F7 · F15 · F28 |

## Goal

Prove that the presentation boundary the parallel-stream model depends on actually exists across
every surface built so far, and close the fixture era: one crossing per surface, hand-written
presentation prop types, adapters that only adapt, era-marked fixtures, no server authority in
the client graph, and no persistence anywhere.

This is the phase whose failure would mean the whole fixture-era investment cannot be rebound
cheaply. It is deliberately an audit phase: it adds almost no product surface and repairs
whatever the audit finds.

**Not in this phase:** the seam replacement itself, which needs a merged backend schema (phase
17). This phase proves everything that is provable before a merge and records the rest as
structurally held with its named trigger.

## Read first

- Master plan §6.1 (view models and adapters), §6.6 (the two eras), §7.5 (the held row), §9
  rules 1, 3, 8.
- Intention §9 **in full**, §10.4, §12A.8 **in full**, §12A.21's seam paragraph, §11's
  verification outcomes, F7 and F15's text.
- `ui_design/10-design-integration-guide.md` §1's invariant, §3, §7 in full.
- Contracts: `16-design-prototype-porting.md` §2 step 6, §3, §5; `05-client-architecture.md` §5,
  §5.2, §8; `02-runtime-boundaries.md` §5; `06-data-contracts-and-validation.md` §1;
  `03-feature-architecture.md` §4; `12-anti-patterns.md` "Prototype porting".

## Dependencies

Phase 14 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/client/view-models/*        edited — whatever the audit finds
src/features/proposal-preparation/client/fixtures/*           edited — era markers made uniform
src/features/proposal-preparation/components/**               edited only where a prop type is wrong
eslint.config.mjs                                             edited only if a boundary rule is missing
(a boundary-audit test module)                                new
```

A repair that changes a presentation component is a **finding against the phase that built it**,
recorded in that phase's Review log as well as this one, because it means the boundary was drawn
in the wrong place there.

## Ordered tasks

1. **Enumerate the surfaces and their crossings.** For each surface, identify the one adapter and
   the one view model through which every domain-shaped value enters. A surface with two entry
   paths for the same value has no boundary.
2. **Check every presentation prop type.** A presentation component's props are hand-written UI
   types. A component whose prop type is the inferred type of a backend feature schema has its
   boundary in the wrong place, and the boundary is fixed there rather than in the component.
3. **Check what every adapter does.** It may select fields, rename them for the view, choose a
   presentation class by a rule the mechanism contracts state, format a money value, and compute
   the derivation register's rows. It may not compute a domain fact, sum or compare money, diff
   two propositions, evaluate approvability, invent a field the domain does not carry, or reorder
   a list the domain ordered.
4. **Make every fixture era-marked and uniform** (master plan §6.6), containing no real personal
   or customer data, and never appearing as an unmarked literal on a production path.
5. **Check the client graph's imports** against the boundary the lint already encodes, and add
   the planted probe that proves the lint can observe a breach.
6. **Check that no persistence exists anywhere** in the client graph, including the shapes
   contract 05 §5.2 prohibits — a rehydration path, a restore-after-reload affordance, or a store
   shape justified only by future serialisation.
7. **Record the seam-replacement claim as structurally held**, with its named trigger, so that
   nothing in this phase looks testable when it is not.
8. **Repair what the audit finds**, and record each repair against the phase that introduced it.
9. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | One crossing per surface. (a) For each surface — thread and pills, clarification, review, preview, created, failure, tab strip — every domain-shaped value it renders enters through exactly one adapter into exactly one view model; one row per surface. (b) No surface has two entry paths for the same value. (c) A value that reaches a presentation component without crossing an adapter is a defect regardless of how well typed it is — asserted at the source level with a planted-defect probe that passes a domain-shaped value straight into a component and observes the row redden. | 9 | F15 · F7 · §12A.8 |
| **C2** | Presentation prop types are hand-written UI types. (a) No presentation component's prop type is, or is derived from, the inferred type of a backend feature schema — asserted at the source level over every component module. (b) **Named mutation:** give a presentation component a prop typed as the backend proposition; row (a) must redden. (c) No `as` cast is used to make a component compile against a mismatched shape. | 3 | F15 · F7 · §12A.8 · `05 §8` |
| **C3** | Adapters only adapt. (a) A source-level check over every adapter finds none of: a domain-fact computation, a money sum or comparison, a diff of two propositions, an approvability evaluation, a field the domain does not carry, or a reordering of a list the domain ordered — six rows. (b) Each row ships with a **planted-defect probe** introducing that operation into an adapter and observing the row redden. (c) The permitted operations are exercised and pass: field selection, renaming for the view, presentation-class choice by a stated rule, money formatting, and the derivation register's rows. | 8 | F15 · §12A.8 |
| **C4** | Fixtures are era-marked and are what they claim to be. (a) Every fixture module carries the fixture-era marker master plan §6.6 fixes, and every export carries its prefix — asserted as a naming rule over the fixtures directory. (b) No unmarked literal stands in for data on any production path — asserted at the source level with a planted-defect probe. (c) No fixture contains real personal or customer data. (d) The post-merge rule is recorded as **structurally held** with its named trigger: the owning backend schema phase merges (phase 17 C2). | 4 | F15 · F7 · §12A.8 · §9.3 |
| **C5** | The client graph reaches no server authority. (a) No `"use client"`-reachable module imports from a `server/` folder other than the sanctioned Server Actions module — asserted by lint and by a source-level check. (b) No such module imports the Proposales adapter, the AI module, the agent runtime, or the server environment module — four rows. (c) No secret, token, integration configuration, or company identifier appears in client state. (d) **Planted-defect probe, one per import edge:** add each forbidden import in turn, observe the corresponding row redden, revert — because a lint rule that has never been shown to fire is a rule nobody has tested. | 8 | F7 · §12A.20 · `02 §5` · `10 §2` |
| **C6** | No persistence exists, in any shape. (a) No browser storage, IndexedDB, cookie-as-storage, or URL-addressed session appears anywhere in the client graph — four rows. (b) No rehydration path and no restore-after-reload affordance exists — two rows. (c) No store shape is justified only by future serialisation — asserted by the absence of any serialise or deserialise entry point on the session store. (d) A reload destroys the workspace and the UI says so rather than implying durability. (e) **Planted-defect probe:** write a session's state to browser storage; row (a) must redden. | 8 | F7 · F28 · §12A.21 · `05 §5.2` |
| **C7** | The seam-replacement claim is stated, and is stated as held. (a) F15's claim — replacing a surface's temporary adapter with its production adapter leaves every presentation component of that surface byte-identical and every existing presentation test of that surface passing unedited — is recorded as **structurally held** with its named trigger: the first backend schema phase this project consumes is `APPROVED` and merged, which is phase 17 C1. (b) The claim's **preconditions** are asserted now, because they are what make it survivable: every retained entry holds a closed-enumeration member or a domain identity, and no entry is keyed by an adapter output field, a view-model field name, or an index into a view model — three rows with a planted-defect probe keying an entry by an adapter output and observing the row redden. (c) No view model, adapter shape, fixture shape, or session runtime field is copied into, referenced by, or used to justify a backend schema, domain shape, service interface, view DTO, or integration schema — asserted at the source level over the whole repository. | 5 | F15 · F28 · F7 · §12A.8 · §12A.21 · §9.4 |

**Derived totals for this phase:** 7 criteria, 45 rows, named mutations at C1(c), C2(b), C3(b)
(six sites), C4(b), C5(d) (five edges), C6(e), C7(b). Re-derive at dispatch.

## Notes

- **This phase is where the parallel-stream model is either true or false.** F7 is the
  architectural measurement the whole approach rests on; an audit that finds nothing is a result,
  and an audit that finds something is the point.
- **Every absence claim here ships with its planted-defect probe.** Measuring an absence proves
  the absence; it does not prove the instrument could ever observe the presence. This is the most
  expensive defect family in the pipeline's history and the only one no lint will catch.
- A repair that changes a presentation component is recorded against the phase that built it, so
  the boundary lesson lands where the next reviewer will read it.
- **The fixture era ends here.** Phases 16 and 17 are gated on backend approvals that may be far
  away; the project can sit at this gate indefinitely with every surface green.

## Review log

*(empty)*
