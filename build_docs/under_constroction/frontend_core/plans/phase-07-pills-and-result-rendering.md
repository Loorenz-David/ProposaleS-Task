# Phase 07 — Interaction pills and domain-result rendering

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | waivable |
| **Serves** | F16 · F2 · F27 · F6 |

## Goal

Render every domain result the application can return, on both surfaces, and map each part of a
result to exactly one pill kind at the view boundary. This is where "no state is silently
dropped" becomes checkable.

**Not in this phase:** the clarification panel the `ask` pill bridges to (phase 08); the review
surface's own rendering of a proposition (phase 09); the created and failed presentations
(phases 12 and 13). This phase asserts each result state's **thread turn** and its stated
**proposal-surface outcome**, where "unchanged" is an intentional outcome and is asserted as one.

## Read first

- Master plan §6.3 (`PillKind` — four members in V1, and why), §7.5 (the held `diff` row), §9
  rule 2.
- Intention §5.4 **in full**, §2.4 (the vocabulary mapping), §12A.9 **in full**, §12A.16's
  `failed` reasons (referenced, implemented in phase 13), §12A.20, §14.1 items 3 and 4.
- `ui_design/05-interaction-pills.md` in full, including its "Prototype-only" blocklist;
  `ui_design/03-agent-surface.md` §3.4.
- Backend master plan §6.3 (the five domain result states, `RunFailureReason`).
- Contracts: `05-client-architecture.md` §6, §7, §9; `08-agent-architecture.md` §6;
  `11-testing-principles.md` §3; `12-anti-patterns.md` "Prototype porting".

## Dependencies

Phase 06 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/pills/            new — InteractionPill and payloads
src/features/proposal-preparation/client/view-models/pill.ts   new — PillViewModel + adapter
src/features/proposal-preparation/client/view-models/thread.ts edited — turn view model gains pills
src/features/proposal-preparation/types/presentation.ts        edited — PillKind
src/features/proposal-preparation/client/fixtures/results.temporary-fixture.ts   new
```

## Ordered tasks

1. **Write the result-state table as code**: five states, each with its thread turn and its
   proposal-surface outcome, total, with "unchanged" stated as an outcome rather than as an
   omission.
2. **Map result parts to pill kinds at the view boundary.** A pill kind is never a field of any
   schema, never submitted, never stored on a result, and never inferred from a backend enum.
3. **Give every kind a source part and every part exactly one kind.** A result field with no row
   is an unrendered part and a gap to route to the coordinator, not a silent omission — that is
   what makes a new backend field visible at this boundary rather than invisible.
4. **Keep `diff` out of V1's runtime union** (master plan §6.3): no V1 result carries a
   server-supplied difference record, and a member with no producer is dead scaffolding. Assert
   that no mapping produces a difference-record pill.
5. **Render no fabricated progress steps.** The `thought` pill's step-list presentation renders
   only steps a result carries, and no V1 result carries any, so V1 renders none.
6. **Build one shell for every kind** — one height, one radius, one background, one border —
   with only the glyph and its disc tint varying. Kind differences never become shell
   differences.
7. **Make each pill accessible**: expandable pills expose their expanded state and control their
   payload; the discs are decorative and hidden; the accessible name carries the kind, the label
   and the meta rather than relying on an elided label or a `title` attribute; a link pill is
   distinguishable from an action pill and from a disclosure pill non-visually.
8. **Key pills by identity, never by thread index.** Message-index keys break the moment the
   thread is not a stable array.
9. **Add the disabled, error and loading states** an action pill needs when its intent can be
   pending or fail.
10. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The five domain result states render on both surfaces, totally. One row per state, each asserting **both** the thread turn and the proposal-surface outcome: (a) `clarification` → a turn carrying an `ask` pill holding the question set and each question's answered / skipped / open record; the proposal surface **unchanged** — the previous proposition stays rendered, or the empty state if there is none. (b) `proposition` → a turn carrying the result's rationale, assumptions and warnings; the review surface renders the new proposition. (c) `failed` → a failure turn naming the run's failure reason; the proposal surface **unchanged**, the previous proposition intact and rendered. (d) `created` → a turn carrying a `link` pill with the server-returned editor URL; the created presentation with newly-created true. (e) `recovered` → the same turn shape; the created presentation marked recovered, newly-created false. (f) Planted-defect probe: route the `failed` state through the created presentation; row (c) must redden. | 6 | F16 · F2 · §12A.9 |
| **C2** | Each pill kind renders from its stated part, and each part has exactly one kind. (a) `agentRationale`, `assumptions[]` and `warnings[]` → `thought`. (b) the clarification question set and its per-question record → `ask`. (c) the draft result's editor URL → `link`, rendered verbatim. (d) a workspace intent → `action`, carrying no domain effect of its own. (e) Every part of a rendered result is covered by exactly one kind — asserted as a partition over a result fixture carrying every part, not as a sample. (f) A result field with no row surfaces as an unrendered part rather than being dropped silently. | 6 | F16 · §12A.9 · §2.4 |
| **C3** | What V1 does not render, it does not render — and the checks can fail. (a) No mapping produces a pill from a difference record; the `diff` kind is **structurally held** with its named trigger (a backend result carrying a difference record, §14.1 item 3). (b) The `thought` pill renders only steps a result carries, and V1 results carry none, so V1 renders no step list. (c) No step, label, or timing is fabricated to fill time — asserted at the source level over the pill modules and by advancing time with a rendered pill. (d) The `thought` pill never exposes model reasoning: it presents the application-returned rationale, assumptions, warnings and result context, asserted against a fixture whose result carries those fields and nothing else. (e) Planted-defect probe for (a): add a difference-record mapping, observe the row redden, revert. | 5 | F16 · §12A.9 · §5.4 · §14.1 |
| **C4** | Pills are accessible and their kinds are legible non-visually. (a) An expandable pill exposes its expanded state and points at its payload, and the payload has an id. (b) The glyph discs are hidden from assistive technology. (c) Each pill's accessible name carries its kind, its label and its meta — not the elided visible label, and not a `title` attribute. (d) A link pill, an action pill and a disclosure pill are distinguishable non-visually, one row each. (e) Every pill and every nested payload control has a visible focus indicator, and tab order runs trigger then payload. (f) Expanding announces politely and does **not** move focus. | 6 | F6 · F16 · §12A.9 · §12A.17 |
| **C5** | Pill construction is not the prototype's. (a) No pill is constructed from ad-hoc fields on a message object. (b) No pill key is derived from a thread index — asserted by reordering a thread's turns and observing every pill's expansion state follow its own pill. (c) No demo toggle gates whether a kind renders. (d) No client-computed count appears in a pill's meta slot unless it is a derivation-register row — asserted against the register from phase 04. (e) Planted-defect probe: key a pill by its thread index; row (b) must redden. | 5 | F16 · F14 · §12A.9 · §12A.7 |
| **C6** | Every rendered string is text. (a) Rationale, assumptions, warnings, question text and error messages each render their characters literally, one row per source, including markup characters. (b) No markup, Markdown-to-HTML, template-interpolation, automatic-link-detection, or rich-content path exists on any pill rendering path — asserted at the source level with a planted-defect probe. (c) A link pill's href is the server-returned URL character-identical, opens in a new browsing context, and carries the new-context relationship attributes; the fact that it leaves the application is part of its accessible name. (d) Planted-defect probe: build the href from an identifier and a base constant; row (c) must redden. | 4 | F27 · §12A.20 |
| **C7** | One shell, and the states an action pill actually needs. (a) All four V1 kinds render the same shell height, radius, background and border; only the glyph and its disc tint vary — asserted per kind against the shell's computed values. (b) An action pill whose intent can be pending renders a loading state that disables re-activation. (c) An action pill whose intent failed renders an error state carrying the failure's message rather than a generic one. (d) A disabled action pill is exposed as disabled, not merely dimmed. | 4 | F16 · F2 · F6 · design 05 §6 |

**Derived totals for this phase:** 7 criteria, 36 rows, 5 named mutations (C1(f), C3(e),
C5(e), C6(b)'s probe, C6(d)). Re-derive at dispatch.

## Notes

- **The pill kinds are presentation vocabulary and never a response schema.** Design 05 states
  this in its own §1 and design 10 §7 lists `m.steps` / `m.diffs` / `m.cardTitle` / `m.links` /
  `m.actions` as convenience objects that must not become contracts.
- The pill-kind symbols stay typographic marks — they are product vocabulary and are **not**
  replaced by icons from the adopted icon library. The pill's own affordance controls are
  ordinary interface controls and may use the icon library, decorative and hidden from the
  accessible name (intention §5.4, §5.9).
- Expansion state is disposable UI mechanics and is not retained across a session switch
  (§8.1, master plan §6.5's exclusion table).
- Design 05's open questions 1, 2, 3 and 5 (the `thought`/`action` hue, acting versus disclosing
  shells, default expansion states, a maximum pill count) are non-blocking deltas: implement the
  current specification behaviour, leave a marker, report.

## Review log

*(empty)*
