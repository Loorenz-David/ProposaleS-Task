# Phase 08 — Clarification panel

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | **required** — omission-versus-skip is a silent-failure mechanism |
| **Serves** | F20 · F3 · F24 · F6 |

## Goal

Build the structured answering surface: when the active session's turn returns a clarification,
the panel replaces the composer and collects, per question, exactly one of three things — the
characters the user typed, an explicit skip, or nothing at all.

**Not in this phase:** typed questions of any kind. V1 renders the ratified question shape only
— a text question with a free-text answer or an explicit skip. Option lists, amount suggestions,
date inputs, units, per-question notes and per-question skip labels stay presentation vocabulary
that only a backend amendment activates.

## Read first

- Master plan §6.3, §7.5 (the held typed-question row), §9 rule 7.
- Intention §5.5 **in full**, §12A.13 **in full**, §12A.17 (the panel's two focus rows), §12A.6
  (the composer draft while the panel is open — this phase re-asserts phase 05 C6(f) against the
  real panel), §13 conflict **C-2**, §14.1 item 1.
- `ui_design/06-clarification-panel.md` in full, especially §4.2's normalisation warning, §4.4's
  "Skip all", §4.6's keyboard model, §4.7's validation presentation, §5, and §7's hard line
  between interaction mechanics and domain payload — plus its "Prototype-only" blocklist, which
  is where `qdefs` lives.
- Backend intention §17A.7 and backend master plan §6.4 (`clarificationQuestionSchema`,
  `clarificationAnswerSchema`, `clarificationAnswersInputSchema`) — cited, never redefined.
- Contracts: `05-client-architecture.md` §3, §6, §7, §8; `06-data-contracts-and-validation.md`
  §1, §2, §8; `10-security-and-trust-boundaries.md` §4.

## Dependencies

Phase 07 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/clarification/          new — ClarificationPanel, question block
src/features/proposal-preparation/components/agent/AgentComposer.tsx edited — hidden while open
src/features/proposal-preparation/client/view-models/clarification.ts new
src/features/proposal-preparation/client/fixtures/clarification.temporary-fixture.ts new
src/features/proposal-preparation/hooks/use-clarification-panel.ts   new
```

## Ordered tasks

1. **Auto-open the panel for the active session** when its turn returns a clarification, and
   replace the composer with it in the same region. Dismiss returns the composer without
   discarding the questions; the `ask` pill re-opens the panel.
2. **Select the mode from the open-question count**: one question is single mode; two or more is
   batch mode with segmented step progress, back and next, jump-to-step, "Skip all", and a
   batched send.
3. **Hold typed values as per-question drafts until send.** Display formatting, where the
   specification calls for it, is a separate value that never reaches the payload.
4. **Build the submission map with exactly three rows per question** and make an omission
   structurally impossible to convert: a typed answer submits the characters the user typed; an
   explicit skip submits a skip; anything else submits **no entry at all**.
5. **Make "Skip all" preserving**: it submits a skip for every question that has no explicit
   answer and leaves explicitly answered questions as answers. Design 06 §4.4's "clears the whole
   batch" is ambiguous, and the discarding reading would destroy typed work — the preserving
   reading is taken and recorded as a delta.
6. **Forbid coercion on the submission path**: no unit appended, no separator inserted or
   removed, no date reformatted, no locale conversion, no numeric parsing, and no substitution of
   a display-formatted value for the typed one. Trimming and length bounds are the server's
   schema's.
7. **Never construct an entry for a question id outside the received set**, and never extend,
   reorder, filter or supplement the question set: conditional follow-up questions are a server
   decision.
8. **Render the ratified shape only.** A panel that renders an option list has invented a
   question type.
9. **Build the keyboard and focus model**: the panel is a **region, not a dialog** — it does not
   trap focus and does not become a dialog to fit a primitive. On open, focus the first
   unanswered question's first interactive element, never the dismiss control. `Escape`
   dismisses and returns focus to the composer. `Cmd/Ctrl+Enter` submits from anywhere in the
   panel. Every control has a visible focus indicator. Each question's note is programmatically
   associated with it.
10. **Add the per-question invalid, submitting and failed states** the specification marks as
    missing, and **never block skipping on validation**.
11. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The submission map is three rows per question, total, and an omission is never converted. (a) The user typed an answer → exactly one entry carrying the characters the user typed. (b) The user explicitly skipped → exactly one entry marking a skip. (c) The user neither answered nor skipped → **no entry at all**. (d) A question with an empty draft is row (c), not row (b). (e) A question the user never visited is row (c). (f) Planted-defect probe: submit a skip for every question with an empty draft; rows (c), (d) and (e) must redden. | 6 | F20 · F3 · §12A.13 |
| **C2** | "Skip all" preserves typed answers. (a) With a batch of answered and unanswered questions, "Skip all" submits skips for exactly the unanswered ones. (b) Every explicitly answered question is still submitted as its answer, unchanged. (c) A question the user typed into and then cleared is unanswered and is skipped by (a). (d) Planted-defect probe: make "Skip all" discard typed answers; row (b) must redden. | 4 | F20 · §12A.13 |
| **C3** | No coercion touches a submitted value. One row per forbidden transformation, each with an input whose transformed and untransformed forms differ: (a) a unit appended; (b) a separator inserted or removed; (c) a date reformatted; (d) a locale conversion; (e) numeric parsing; (f) a display-formatted value substituted for the typed one. Each row asserts the submitted characters are **identical** to the typed characters. (g) Where the specification calls for display formatting, the displayed value differs from the submitted value in the same test, proving the two are separate values rather than one. (h) Planted-defect probe: feed the display-formatted value into the submitted entry; row (g) must redden. | 8 | F20 · §12A.13 |
| **C4** | The question set is the server's and stays the server's. (a) No entry is constructed for a question id outside the received set — asserted by submitting after the panel has been driven with an id the set does not contain. (b) The set is never extended, reordered, filtered or supplemented by the client — one row per verb, over a fixture whose order and membership are distinctive. (c) No conditional follow-up question is inserted client-side in response to an answer's content. | 6 | F20 · §12A.13 · §17A.7 |
| **C5** | V1 renders the ratified question shape only, and the richer mechanics stay held. (a) A question renders as text with a free-text answer control and an explicit skip control, and nothing else. (b) No option list, amount suggestion, date input, unit suffix, per-question note field or per-question skip label is rendered from client-side knowledge — asserted at the source level with a planted-defect probe that adds an option list and observes the row redden. (c) The richer mechanics are recorded as **structurally held** with their named trigger: a backend amendment supplying typed questions (§14.1 item 1). | 3 | F20 · F3 · §12A.13 · C-2 |
| **C6** | Mode selection and navigation are the specification's. (a) One open question renders single mode: no step bars, no stepper, and the footer's skip uses that question's own affordance. (b) Two or more open questions render batch mode with step progress, back, next, jump-to-step, "Skip all" and a batched send. (c) Back and next move one step and clamp at the ends, and the end controls are exposed as disabled rather than merely dimmed. (d) Activating a step bar jumps to that step, and each bar carries an accessible name naming its question and position. (e) A partially filled batch is sendable, and the unfilled questions stay open. (f) Dismiss returns the composer, discards nothing, and leaves the questions open; the `ask` pill re-opens the panel with the drafts as they were. | 6 | F3 · §12A.13 · §5.5 |
| **C7** | The panel's keyboard, focus and announcement model. (a) The panel is a labelled region and **not** a dialog: focus is not trapped and can leave it into the thread. (b) On open, focus lands on the first unanswered question's first interactive element and never on the dismiss control. (c) `Escape` dismisses and focus returns to the composer. (d) Submitting returns focus to the composer. (e) `Cmd/Ctrl+Enter` submits from anywhere in the panel. (f) Every control carries a visible focus indicator, the send control is exposed as disabled when not ready, and the dismiss control has an accessible name stating what it does. (g) Each question's note is programmatically associated with its question, and a per-question invalid state is announced and associated with its control. (h) **Skipping is never blocked by validation** — asserted with an invalid draft present. (i) While the panel is open the composer is not rendered and the session's composer draft is unchanged when it returns (phase 05 C6(f), re-asserted against the real panel). | 9 | F24 · F6 · F13 · §12A.17 · §12A.6 |

**Derived totals for this phase:** 7 criteria, 42 rows, 4 named mutations (C1(f), C2(d),
C3(h), C5(b)). Re-derive at dispatch.

## Notes

- **`qdefs` is the thing this phase must not become.** Design 06's hardcoded five questions with
  their literal prompts, options, notes, units and skip labels are demo fixtures, and design 10
  §7 names their shape explicitly as a convenience object that must not become a contract.
- `applyOne()`, `normalize()` and `prettyDate()` are prototype-only. The first inserts follow-up
  questions from a regex on the answer string; the second and third are exactly the coercion C3
  forbids.
- **An omission recorded as a skip is a human decision no human made** — only a skip moves an
  item to a deliberate deferral, and an omission leaves it unresolved. That asymmetry is why C1
  has three rows instead of two.
- Design 06's open questions 1, 2, 3, 4, 5 and 7 (the field eyebrow, a stacked mode,
  partially-filled send, the after-the-fact skipped record, suggestion semantics, the panel's
  height cap) are non-blocking deltas: implement the current specification behaviour, leave a
  marker, report.

## Review log

*(empty)*
