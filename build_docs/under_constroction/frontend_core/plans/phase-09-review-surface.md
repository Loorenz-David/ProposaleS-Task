# Phase 09 — Review surface: field set, provenance, unresolved information

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | **required** — provenance and absence are silent-failure mechanisms |
| **Serves** | F17 · F18 · F4 · F6 |

## Goal

Render the current proposition on the Main Application Surface: its fields and line items, where
each value came from, what is unresolved, and what the application assumed or warns about — all
presented, never derived.

**Not in this phase:** money of any kind (phase 10); inline editing, replacement and validation
paths (phase 11); the approval action's behaviour (phase 12). The approval control is rendered
here only so that consequential unresolved information can be presented beside it; activating it
does nothing until phase 12.

## Read first

- Master plan §6.2, §6.3, §9 rules 1, 2, 3.
- Intention §5.6 **in full**, §2.4 (fields, line items, provenance flags, the readiness line),
  §12A.10 **in full**, §12A.11 (the review half), §12A.7 (the readiness-count and
  provenance-class register rows), §8.4, §8.5, §13 conflict **C-1** and **C-3**, §15 owner
  decision 10.
- `ui_design/07-proposal-review.md` §1–§3.5, §4.5, §5, §6, and its "Prototype-only" blocklist.
- Backend intention §17A.1 (`Sourced`, `SourcedOrAbsent`), §17A.4, §17A.5, §17A.6, §17A.9, and
  backend master plan §6.4 (`propositionSchema`, `blockSchema`) — cited, never redefined.
- Contracts: `05-client-architecture.md` §5, §7, §8, §9; `06-data-contracts-and-validation.md`
  §1, §6; `11-testing-principles.md` §3.

## Dependencies

Phase 08 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/review/           new — ProposalReviewSurface,
                                                                     ReviewFieldRow, ReviewBlockRow,
                                                                     ReadinessLine, ApprovalAction (inert)
src/features/proposal-preparation/client/view-models/review.ts new
src/features/proposal-preparation/client/fixtures/proposition.temporary-fixture.ts new
src/features/proposal-preparation/components/workspace/        edited — the review state composes in
```

## Ordered tasks

1. **Map a leaf's provenance class as a total function of that leaf alone** — five conditions,
   five classes, nothing else read.
2. **Never render an absence as a value.** An absent leaf renders an absence statement; where the
   backend's absence semantics name a Proposales default, the statement says the default is
   Proposales', not a value the application holds.
3. **Carry every colour-carried class as text too**, and put the flag text into the value's
   accessible name.
4. **Render `human` provenance as human-set, distinct from agent-revised**, and render no
   "changed since" flag of any kind: no V1 result carries a per-leaf change record, and the
   client does not compute one (owner decision 10).
5. **Present unresolved information per entry with its resolution visible**, never collapsing
   unresolved and deliberately-deferred into one count or one label. A single readiness number
   may be shown only alongside the per-resolution breakdown.
6. **Compute no approvability.** No presentation reads a create or ask policy, and no
   presentation evaluates whether the proposition can be approved. The refusal, when it comes, is
   the server's and is rendered from it (phase 12, phase 13).
7. **Back every rendered row with something the proposition carries.** There is no fixed label
   list; design 07's nine observed labels are demo content. A rendered row with no backing leaf,
   block, note, assumption, warning or unresolved item is a defect, and a carried leaf with no
   rendering is an unrendered part to route.
8. **Give the surface its semantics**: the fields card is a description list; line items are a
   table with a header row; the total is associated with the item list where a total exists; the
   readiness line restates that nothing has been sent.
9. **Render the approval control with unresolved information beside it**, in the creation
   vocabulary, always available — the frontend never judges approvability, and the enabled /
   disabled / warning treatment is a reported design delta, implemented as the current
   specification behaviour with a marker.
10. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The provenance class is a total function of the leaf alone. One row per condition, each with a leaf satisfying **only** that condition: (a) absent → the absent class, carrying an absence statement, and where the backend's absence semantics name a Proposales default the statement says the default is Proposales'. (b) human-sourced → the human-set class, distinct from the agent-revised class. (c) inferred-sourced → the agent-inferred class, carrying an assumption flag. (d) brief-sourced → the sourced class, no flag. (e) content-sourced → the sourced class, no flag. (f) The five rows are total over the shapes the domain admits, and no branch exists for a **missing** key, because such a leaf fails the schema parse upstream and never reaches presentation. | 6 | F17 · §12A.10 · §17A.4 |
| **C2** | Absence is never rendered as a value. (a) An absent leaf renders as none of: zero, one, false, an empty string, or a dash that reads as zero — five rows, one per forbidden rendering. (b) Planted-defect probe: render an absent quantity as the Proposales default value; row (a)'s corresponding row must redden. | 6 | F17 · §12A.10 · §17A.5 |
| **C3** | Nothing about a value is derived that the domain supplies. (a) No module reads a create policy or an ask policy — source-level check with a planted-defect probe. (b) No presentation evaluates whether the proposition can be approved. (c) No class is derived from the value's emptiness. (d) No flag is derived from a string test over the value's text. (e) No client-held change map exists, and no "changed since" flag is rendered — the human-versus-agent distinction is carried entirely by the leaf's own source. (f) The provenance class and the flag text are computed at render from that leaf and stored nowhere (derivation register, phase 04 C6). | 6 | F17 · F4 · §12A.10 · §12A.7 · owner decision 10 |
| **C4** | Unresolved information is presented per entry and is never collapsed. (a) Each unresolved item renders with its own resolution visible. (b) An unresolved item and a deliberately deferred item render distinguishably — the row that the skip contract exists to protect. (c) A single readiness count is rendered only alongside the per-resolution breakdown; a count rendered alone is a defect. (d) The readiness count is computed at render from the proposition's unresolved items and from nothing else — asserted against a session whose client-held answers differ from the proposition's items. (e) Planted-defect probe: collapse the two resolutions into one count; rows (b) and (c) must redden. | 5 | F17 · §12A.10 · §12A.7 · §17A.7 |
| **C5** | Every rendered row is proposition-backed, and every carried leaf is rendered. (a) Over a proposition fixture, the set of rendered rows equals the set of leaves, blocks, notes, assumptions, warnings and unresolved items the proposition carries — asserted as a set equality in both directions, not as a spot check. (b) No fixed label list exists in the source: rendering a proposition whose field set differs from design 07's nine observed labels produces exactly that proposition's rows. (c) A leaf the proposition carries with no rendering surfaces as an unrendered part rather than being dropped. (d) Planted-defect probe: add a hard-coded label row not backed by the proposition; row (a) must redden. | 4 | F18 · §12A.11 |
| **C6** | The surface's semantics are real semantics. (a) The fields card exposes label-and-value relationships as a description list rather than positionally. (b) Line items are a table with a header row, so name, detail and quantity relationships are not positional. (c) Every value rendered in a colour-carried treatment also carries its flag text, and that text is part of the value's accessible name — asserted per class. (d) Field labels remain readable at the main pane's minimum width, with any elided text preserved in the accessible name. (e) Every interactive element on this surface is keyboard-reachable with a visible focus indicator. | 5 | F6 · F17 · §12A.10 · design 07 §5 |
| **C7** | The readiness line and the approval control present, and never judge. (a) The readiness line restates that nothing has been sent, in both its resolved and unresolved variants. (b) Consequential unresolved, deferred and absent information is presented beside the approval action so the user cannot approve an incomplete proposition by accident. (c) The control's wording is creation vocabulary and the word "push" appears nowhere on the surface. (d) The control's availability is not a function of any client-side verdict — asserted by rendering a proposition with unresolved items and one without, and observing that no client-computed approvability decides the control. (e) The chosen enabled / disabled / warning treatment is recorded as a design delta with a marker. | 5 | F4 · F17 · §12A.10 · C-3 |

**Derived totals for this phase:** 7 criteria, 37 rows, 4 named mutations (C2(b), C3(a)'s
probe, C4(e), C5(d)). Re-derive at dispatch.

## Notes

- **The proposition carries no price and no total** (conflict C-1). Design 07's priced rows,
  computed total, "Needs price" flags and unpriced note are demo content superseded by the
  ratified domain. Nothing on this surface renders an amount in this phase; phase 10 adds the one
  exception — a commercial note's stated amount — with its provenance class.
- Design 07's `baseDraft()`, every hardcoded amount, the `parseFloat` total, the
  regex-based missing-field detection, the `changed` map, `unpricedNote` from a client count, the
  `field()` convenience object, and the nine demo labels are all prototype-only.
- Design 07's open questions 2, 3, 6 and 7 (the human/agent flag vocabulary, client context in
  the header, popover anchoring, field grouping) are non-blocking deltas: current specification
  behaviour, marker, report.
- **The approval control is inert in this phase.** Its behaviour, its pending guard and its
  terminality are phase 12's. Rendering it here is what makes C7(b) reachable.

## Review log

*(empty)*
