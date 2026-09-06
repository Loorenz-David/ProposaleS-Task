# Phase 10 — Client preview, the work-surface toggle, money rendering

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | **required** — money is the highest-consequence silent-failure family here |
| **Serves** | F18 · F19 · F28 · F27 · F6 |

## Goal

Build the read-only client preview, the toggle that switches between it and the fields view, and
the one function that turns a server-supplied money value into a string. This phase also
introduces the first retained Main Application Surface entry, `workSurface`.

**Not in this phase:** restoration on activation and the entry-resolution table (phase 14). This
phase writes and reads the entry under §12A.21's rules; phase 14 makes activation resolve it.
Applied Pricing is phase 12's — the rendering function this phase builds is what phase 12 uses.

## Read first

- Master plan §6.3 (`WorkSurface`), §6.4, §6.5 (**the entry set — read the whole section before
  writing a line**), §9 rule 4.
- Intention §5.7 **in full**, §5.6's pricing paragraph, §12A.11 **in full**, §12A.12 **in full**,
  §12A.21 **in full**, §12A.20, §12A.7, §13 conflict **C-1**, §15 ratified boundary 9.
- `ui_design/08-client-preview.md` in full, including its "Prototype-only" blocklist;
  `ui_design/07-proposal-review.md` §3.1 (the view toggle) and §5.
- Backend intention §17A.1 (`Money`), §17A.12, and backend master plan §6.4
  (`commercialNoteSchema`, `appliedPricingSchema`) — cited, never redefined.
- Contracts: `06-data-contracts-and-validation.md` §6 (money); `05-client-architecture.md` §2,
  §7; `10-security-and-trust-boundaries.md` §4.

## Dependencies

Phase 09 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/preview/            new — ClientPreviewSurface
src/features/proposal-preparation/components/review/             edited — the work-surface toggle
src/features/proposal-preparation/client/view-models/money.ts    new — the one rendering function
src/features/proposal-preparation/client/view-models/preview.ts  new
src/features/proposal-preparation/hooks/use-workspace-session-store.ts   edited — retained context slot
src/features/proposal-preparation/types/session.ts               edited — WorkSurface, RetainedContext
```

## Ordered tasks

1. **Write money rendering as one function**, `Money → string`, total over the shape, applied at
   the view boundary and stored nowhere.
2. **Derive the minor-unit exponent from the currency**, never assume it. A literal hundred, a
   literal division by a hundred, a hard-coded two-decimal format, or a fixed-decimal formatter
   anywhere on a money path is prohibited: a zero-exponent currency would silently render a
   hundred-fold error that no type check and no schema can see.
3. **Enforce the closed forbidden list on every money path** and the closed permitted list, both
   as source-level checks with planted probes.
4. **Render no amount on the review or preview surface before creation**, with the one exception
   §12A.11 names: a commercial note's stated amount, on the review surface, with its provenance
   class, never in a total row, never in the preview, and never summed with anything.
5. **Build the preview's closed field set** as a strict subset, and render nothing outside it in
   any form. An empty narrative omits its section; an empty proposition renders an honest empty
   document rather than a skeleton of absent fields.
6. **Carry the approximation disclosure visibly and programmatically.** The preview is the
   application's own approximation and is never an embedded editor, an iframe, a scraped page or
   an undocumented render endpoint.
7. **Give the light surface its own accessibility**: heading order, table or list semantics for
   items, a dark focus ring scoped to the light surface, and a hero that grows with its title.
8. **Build the work-surface toggle** as a native radio group in a labelled group (master plan
   §6.1), announcing the view it selected.
9. **Introduce the retained entry `workSurface`** exactly as master plan §6.5 fixes it: written
   only by the user operating the toggle, in that session; read only at render; holding a member
   of the closed presentation enumeration; yielding its declared default when it does not
   resolve. **A turn result neither reads nor writes it**, for any session, active or not.
10. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | Money is rendered by one function whose exponent comes from the currency. (a) A currency with a two-digit minor unit renders its amount scaled by that currency's own exponent. (b) A currency with a **zero**-digit minor unit renders its amount scaled by that currency's own exponent — the row a literal hundred passes and reality does not. (c) Both rows assert the contract — the amount that the currency's declared exponent produces — never a locale's literal output string. (d) The function is total over the shape: it renders from the amount and the currency and reads nothing else. (e) **Named mutation:** replace the derived exponent with a literal two; row (b) must redden. | 5 | F19 · §12A.12 · charter rules 2 and 13 |
| **C2** | The forbidden list holds on every money path, and the check can observe a breach. (a) A source-level check over every module on a money path finds none of: addition, subtraction, multiplication, division other than the single derived-exponent scaling inside the rendering function, modulo, rounding, flooring, ceiling, fixed-decimal formatting, numeric comparison of two amounts, summation of blocks into a total, recomputation of a total from unit values and quantity, checking a total against its parts, numeric parsing of a formatted or free-text string, defaulting an absent amount to zero, or currency inference or conversion. (b) The permitted list is what remains: reading the amount and the currency, the derived-exponent scaling inside the rendering function, and string equality on a currency code. (c) No formatted money string is stored anywhere — it is computed at render (derivation register, phase 04 C6). (d) **Named mutation, one per site:** introduce a summation on a money path, and separately a fixed-decimal format, and separately a numeric parse of a formatted string; row (a) must redden for each. | 4 | F19 · §12A.12 · §12A.7 |
| **C3** | No amount appears before creation, except the one exception. (a) For a proposition carrying blocks, quantities and unresolved items, **no amount is rendered anywhere on the review surface or the preview** — asserted as an absence over the rendered output, with a planted-defect probe that renders a block amount and observes the row redden. (b) A commercial note's stated amount renders on the **review** surface with its provenance class. (c) That amount never appears in a total row. (d) That amount never appears in the preview. (e) That amount is never combined with any other value. (f) An absent stated amount renders per the provenance rules and never as a figure. | 6 | F18 · F19 · §12A.11 · §12A.12 · C-1 |
| **C4** | The preview's field set is closed and is a strict subset. (a) One row per rendered member: the title; the narrative, omitted entirely when absent; per block, the catalog-verbatim title and description; the statement that pricing comes from the content library; the approximation disclosure. (b) One row per excluded member, asserted as an absence: provenance flags and their colours; unresolved and deferred markers, readiness and counts; quantity, the optional flag and reviewer comments; commercial notes, commercial assumptions, warnings and rationale; alternatives; any amount, total or per-line price; any work-surface string. (c) An empty proposition renders an honest empty document rather than a skeleton of absent fields. (d) **Named mutation:** render a block's quantity in the preview; the corresponding excluded row must redden. | 4 | F18 · §12A.11 |
| **C5** | The preview declares what it is, and the light surface is accessible. (a) The approximation disclosure is visible **and** programmatic — the preview's region carries a name stating it is approximate. (b) No iframe, no external document embed, and no request to any origin is made by this surface — asserted at the source level and by the offline fetch guard. (c) Headings are real heading elements in a sensible order. (d) Line items carry table or list semantics and any total is associated with them. (e) The focus indicator remains visible against the light surface. (f) The hero grows with its title rather than clipping it, asserted at a title length that exceeds the designed height. (g) Every string the preview renders is rendered as text; no markup path exists. | 7 | F6 · F27 · §5.7 · ratified boundary 9 · design 08 §5 |
| **C6** | The work-surface toggle is a two-option control with real selection semantics. (a) It is a labelled group of two options with exactly one selected. (b) It is keyboard-operable and carries a visible focus indicator. (c) Selecting an option switches the rendered surface. (d) Operating the toggle announces the view it selected, once. (e) The selected option is legible non-visually, not by styling alone. | 5 | F6 · design 07 §5 · design 08 §5 |
| **C7** | The retained entry `workSurface` obeys §12A.21. (a) It holds only a member of the closed presentation enumeration — asserted by attempting to write a value outside the enumeration and observing it rejected. (b) It is written **only** by the user operating the toggle, in the session that act was performed in — asserted by operating the toggle in one session and observing another session's entry unchanged. (c) It is read **only** at render, never resolved at write, never cached against a resolved target. (d) A turn result applied to a session neither reads nor writes that session's entry — asserted for an active session **and** for a non-active one. (e) When it does not resolve it yields its **declared default**, asserted as "the entry's declared default" rather than as a literal. (f) No derivation-register row reads it and it is not a register row. (g) It is not persisted in any form: no browser storage, no cookie, no URL parameter, no server round-trip — with a planted-defect probe writing it to browser storage and observing the row redden. (h) **Named mutation:** write the entry from the turn-result application path; row (d) must redden. | 8 | F28 · §12A.21 · §12A.7 |

**Derived totals for this phase:** 7 criteria, 39 rows, named mutations at C1(e), C2(d) (three
sites), C3(a), C4(d), C7(g), C7(h). Re-derive at dispatch.

## Notes

- **Design 08 renders "Not priced" into a client-facing document.** That is wrong as designed and
  conflict C-1 removes the cause: the proposition has nothing unpriced to render, so the line
  simply carries no price. A work-surface string in a client-facing rendering is a defect.
- Design 08's total block, its 36px grand total, and the shared computed total are prototype
  content superseded by C-1. The preview renders no total before creation.
- Design 08's open questions 3, 4, 5, 6 and 8 (centred prose, the hero, print and copy, the
  reading measure, replacing the preview with a link after creation) are non-blocking deltas:
  current specification behaviour, marker, report.
- **`workSurface` is the project's first retained entry.** Master plan §6.5 closed the entry set
  before this phase for exactly this reason: a phase does not add an entry, and an entry that
  appears here without being in that table is the open key space §12A.21 prohibits.

## Review log

*(empty)*
