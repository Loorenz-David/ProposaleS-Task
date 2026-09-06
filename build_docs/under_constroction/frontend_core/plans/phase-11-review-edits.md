# Phase 11 — Review edits: inline edit, validation paths, replacement

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 8 |
| **Projection** | **required** — path matching and candidate ordering are silent-failure mechanisms |
| **Serves** | F21 · F4 · F24 · F28 · F6 |

## Goal

Make the review surface editable through explicit, validated operations: one inline edit at a
time, submitted as one operation with an array path, never applied locally as truth; line-item
replacement from the block's retained alternatives; and a field-scoped instruction to the agent.

**Not in this phase:** approval and its pending guard (phase 12); the failure taxonomy's full map
(phase 13). This phase renders a validation error at its path because that is what an edit
produces; the ten-row error map is phase 13's.

## Read first

- Master plan §6.1 (the ask-agent surface's primitive and why), §6.5 (the entry
  `openedBlockContentId`), §9 rules 1 and 5.
- Intention §5.6 **in full**, §2.4 (inline edit, "Ask the agent about"), §12A.14 **in full**,
  §12A.17 (the four edit and ask-agent focus rows), §12A.21, §15 owner decision 3, §14.1 item 2.
- `ui_design/07-proposal-review.md` §3.3, §3.7, §4.1, §4.2, §5, §6, and its "Prototype-only"
  blocklist; `ui_design/03-agent-surface.md` §3.4 (the scope badge).
- Backend intention §17A.1 (`Path`), §17A.9, and backend master plan §6.4 (`editOperationSchema`,
  the closed operation set, `blockSchema.alternatives`) — cited, never redefined.
- Contracts: `05-client-architecture.md` §3, §6, §7, §8; `06-data-contracts-and-validation.md`
  §8 (validation errors as data, array paths); `15-ui-styling-and-component-system.md` §5.

## Dependencies

Phase 10 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/review/           edited — editable rows, replacement,
                                                                        AskAgentSurface
src/features/proposal-preparation/hooks/use-inline-edit.ts     new
src/features/proposal-preparation/client/view-models/review.ts edited — validation and alternatives
src/features/proposal-preparation/hooks/use-workspace-session-store.ts   edited — the second entry
package.json / package-lock.json                               edited — @radix-ui/react-popover
```

## Ordered tasks

1. **Enforce one edit at a time per session.** While an edit turn is in flight for a session, no
   other leaf of that session enters edit mode and the in-flight leaf is not re-editable. The
   composer's send and the approval control follow the same session-level in-flight rule.
2. **Dispatch exactly one operation from the backend's closed set** on commit, carrying a path
   as an **array of segments** with array indices as decimal strings. A dotted string, a display
   label, or a component-local key in the path position is a defect.
3. **Never apply the edit locally as truth.** The rendered value changes only when the server's
   new proposition version arrives; the typed text is a disposable draft until then. Save-in-flight
   and save-failed states exist.
4. **Match validation errors element-wise as arrays.** Joining paths into strings to compare
   them, prefix or substring matching, and rendering a path-bearing error only at surface level
   are all forbidden. An error whose path names no rendered leaf renders at surface level with
   its message intact rather than being dropped.
5. **Offer exactly the block's retained alternatives, as returned, in the order returned.** The
   client does not filter, re-rank, re-score, deduplicate or supplement that list, and offers no
   other content source. Broader discovery is an agent revision or re-search instruction, which
   is a free-text revision turn.
6. **Build the ask-agent surface** on the anchored primitive master plan §6.1 fixed: focus moves
   to its input on open, is trapped while open, `Escape` closes, and focus returns to the trigger
   on close by any path. Submitting sends a free-text revision instruction whose wording names
   the field; the reply lands in the thread with a scope badge. The field scope is presentation
   memory, not a structured parameter of the turn — that is structurally held until §14.1 item 2
   is decided.
7. **Make the ask-agent trigger readable and reachable**: design 01 §5's correction 2 applies —
   a readable rest colour, an accessible name naming the field, an adequate hit area, and a
   visible focus indicator.
8. **Introduce the retained entry `openedBlockContentId`** exactly as master plan §6.5 fixes it:
   written only by the user opening a block's replacement surface, in that session; holding the
   block's content identity; read only at render; yielding its declared default when the identity
   does not resolve against what is rendered.
9. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | One edit at a time, per session. (a) While an edit turn is in flight for a session, no other leaf of that session enters edit mode. (b) The in-flight leaf is not re-editable. (c) The composer's send is disabled for that session while the edit turn is in flight. (d) The approval control follows the same session-level in-flight rule. (e) A different session is unaffected by the first session's in-flight edit. | 5 | F21 · §12A.14 |
| **C2** | A commit dispatches exactly one operation from the closed set, with an array path. (a) A commit produces exactly one operation, never zero and never two. (b) The operation's kind is a member of the backend's closed set — one row per kind the surface can produce. (c) The path is an **array of segments**, and an array index is a decimal string. (d) A dotted string, a display label, and a component-local key each fail to appear in the path position — three rows, asserted structurally. (e) Planted-defect probe: emit a dotted-string path; row (c) must redden. | 5 | F21 · §12A.14 · §17A.1 |
| **C3** | The edit is never applied locally as truth. (a) On commit, the rendered value is unchanged until the server's answer arrives. (b) When the answer arrives, the rendered value is the server's new proposition version, not the typed text. (c) A save-in-flight state is rendered. (d) A save-failed state is rendered and the proposition is unchanged by the failure. (e) **Named mutation:** write the typed value into the view model on commit; row (a) must redden. | 5 | F21 · F4 · §12A.14 |
| **C4** | A validation error renders at its path, matched element-wise. (a) An error whose path equals a rendered leaf's path element-wise renders at that leaf. (b) An error whose path differs only in its last segment does **not** render at the first leaf. (c) An error whose path is a prefix of a rendered leaf's path does not render at that leaf — the row prefix matching passes and correctness does not. (d) An error whose path names no rendered leaf renders at surface level with its message intact rather than being dropped. (e) A leaf whose key contains a dot is matched correctly — the row string-joining gets wrong. (f) **Named mutation:** compare paths after joining them with a dot; row (e) must redden. (g) The rendered message is the server's, never a UI-authored replacement. | 7 | F21 · F4 · §12A.14 · `06 §8` |
| **C5** | Replacement offers the block's retained alternatives and nothing else. (a) The offered list equals the block's alternatives as returned, in the order returned — asserted as sequence equality, not set equality. (b) The client does not filter, re-rank, re-score, deduplicate or supplement the list — five rows, each over a fixture whose ordering and duplication make the transformation observable. (c) No other content source is offered on this surface: there is no free-text content search. (d) Selecting an alternative dispatches exactly one operation from the closed set. (e) **Named mutation:** sort the alternatives by score in the presentation; row (a) must redden. | 6 | F21 · §12A.14 · owner decision 3 |
| **C6** | The edit and ask-agent focus rows hold. (a) Entering inline edit is keyboard-reachable from the value's own control, which carries an accessible name naming the field and its current value. (b) `Enter` commits; focus returns to the trigger. (c) `Escape` cancels, discards the draft, and focus returns to the trigger. (d) The ask-agent surface opens with focus on its input. (e) Focus is trapped while it is open. (f) It closes on `Escape`, on cancel, on submit and on an outside activation — four rows — and focus returns to the trigger every time. (g) The ask-agent trigger is readable at rest, has an accessible name naming its field, an adequate hit area, and a visible focus indicator. | 7 | F24 · F6 · §12A.17 · design 07 §5 |
| **C7** | Field-scoped asking is an instruction, not a parameter. (a) Submitting from the ask-agent surface dispatches a free-text revision instruction whose wording names the field. (b) The reply turn renders in the thread with a scope badge naming the field, and the badge is part of that turn's accessible name. (c) The field scope is presentation memory and is not a structured parameter of the dispatched turn — **structurally held** until §14.1 item 2 is decided by the backend. (d) A submitting state and a failed state exist on this surface. | 4 | F21 · F4 · §12A.14 · §14.1 item 2 |
| **C8** | The retained entry `openedBlockContentId` obeys §12A.21. (a) It holds a domain identity that the session's current proposition carries, never a value read out of a block — asserted by rendering the surface from the entry **with the session's server-returned objects removed** and observing that no domain value appears. (b) It is written **only** by the user opening a block's replacement surface, in that session. (c) It is read only at render. (d) A turn result neither reads nor writes it, for an active session and for a non-active one. (e) When the identity does not resolve against what is rendered — a block a later proposition version removed — it yields its **declared default** and is **not** cleared, rewritten or deleted; a later proposition carrying that block again resolves it to its value. (f) It is not a derivation-register row and no register row reads it. (g) **Named mutation:** hold the selected block's rendered value instead of its identity and render from it; row (a) must redden. | 7 | F28 · §12A.21 |

**Derived totals for this phase:** 8 criteria, 46 rows, named mutations at C2(e), C3(e), C4(f),
C5(e), C8(g). Re-derive at dispatch.

## Notes

- **Design 07's `apply()` and its revision regexes are prototype-only**, as are `editing`,
  `popKey` and `popText` as single-slot globals, and `autoFocus` as the focus mechanism.
- **A dedicated free-text human content-search UI is out of V1** (owner decision 3). The
  backend's human-search capability is established on its own terms and is neither deleted nor
  constrained by that decision; it simply has no V1 surface.
- Design 07's open question 4 (Escape behaviour) is answered by §12A.17 and is implemented here,
  not deferred. Its open question 6 (two popover anchoring models) is a non-blocking delta.
- **`openedBlockContentId` is the second and last entry in the closed set** (master plan §6.5).
  A phase that wants a third amends that section; it does not add one here.

## Review log

*(empty)*
