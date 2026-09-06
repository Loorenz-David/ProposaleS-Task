# Phase 03 — Session runtime and the tab strip

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 6 |
| **Projection** | **required** — ordering rules, focus destinations, identity separation |
| **Serves** | F12 · F8 · F30 · F24 · F6 |

## Goal

Introduce the page-lifetime session runtime and the tab strip that presents it: session
identity, the ordered list, creating, activating, reordering, closing with its focus
destinations, and keeping the active tab in view — with the shell's landmark identity holding
across every one of those operations.

**Not in this phase:** tab status, the unread counter, attention, the derivation register
(phase 04); turn dispatch and the close/discard confirmation guard (phase 05); anything the
Main Application Surface renders beyond the idle state.

**Closing a session in this phase is unguarded**, because the guard's predicate reads workflow
state that does not exist yet. Phase 05 puts the guard in front of every close path this phase
builds; the close table here is written so that phase 05 inserts one gate rather than rewriting
four rows.

## Read first

- Master plan §6.1 (store ladder, tab-strip mechanics), §6.2, §6.3 (`SessionRuntimeRecord`, the
  two identifiers), §9, §10.4.
- Intention §5.3, §8.1–§8.3, §8.5, §12A.1 **in full**, §12A.5 **in full**, §12A.17 (the four tab
  focus rows), §12A.23 (the landmark-identity invariant across session operations).
- `ui_design/04-session-tabs.md` in full — §1's critical product decision, §4.1–§4.5, §5, and
  its "Prototype-only" blocklist, which is the snapshot architecture this phase must not build.
- Contracts: `05-client-architecture.md` §3, §5, §5.1, §5.2, §7; `03-feature-architecture.md`
  §1–§2, §4; `15-ui-styling-and-component-system.md` §5; `11-testing-principles.md` §2–§3;
  `13-decision-checklist.md` §2.

## Dependencies

Phase 02 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/hooks/use-workspace-session-store.ts   new — the one feature store
src/features/proposal-preparation/types/session.ts                       new — SessionRuntimeRecord
src/features/proposal-preparation/components/session-tabs/               new — SessionTabStrip, SessionTab
src/features/proposal-preparation/components/workspace/                  edited — the strip composes in
package.json / package-lock.json                                         edited — @radix-ui/react-tabs
README.md                                                                edited — tech-stack rows (follow-up 6)
```

## Ordered tasks

1. **Create the feature store** at the position master plan §6.1 fixed, holding: the active
   session id, the ordered list of page-lifetime session ids, and the per-session runtime
   records. Records are separate per session; there is no shared record, and no session's record
   is ever serialised into another's.
2. **Generate the page-lifetime session id per session, once, at creation** — never from a
   module-level mutable counter, never from the tab's array index, never from a thread position.
   Keep the type distinct from the server's Generation ID so the two can never be substituted.
3. **Install `@radix-ui/react-tabs`** and build the strip's tablist mechanics on it: tablist
   role and orientation, roving tabindex, arrow-key movement, `Home` / `End`, activation
   following focus. Record the package and its resolved version in the Review log, with the
   widget that justified it (contract 15 §5). Compose reorder, close and title behaviour on top;
   if the primitive distorts any of them, use native elements for that part and record why.
4. **Implement reorder** as one move, total over §12A.5's four cases, with pointer and keyboard
   producing the same list for the same source and target. The keyboard move-by-one keeps focus
   on the moved tab and announces its new position. Live reorder during a drag commits each
   move; an abandoned drag keeps the last committed order (design 04 §4.2 — the alternative is a
   reported delta, not a decision this phase takes).
5. **Implement close** as §12A.5's four-case table, with the newly active session and the focus
   destination each row states. The last row's ordering is part of the contract: **the
   replacement session is created before the closed session is removed**, so no rendered frame
   shows an empty strip. Leave a single, named gate point in front of every close path so phase
   05 inserts its guard there without touching these rows.
6. **Keep the active tab in view** after every change that can move it, computing the scroll
   position from a ref. `scrollIntoView` is forbidden; so is locating the tab by document query
   or selector; so is reading the window width during render.
7. **A closed session's id is never reused.**
8. Closeout: contract 14 §8's impact review, tracker row, Review log; add the two tech-stack
   rows to the root README (master plan §11.3 follow-up 6).

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The two identifiers stay totally separate. (a) The page-lifetime session id is generated once per session at creation and is stable for that session's lifetime. (b) It is never derived from the tab's index, a thread position, or a module-level counter — asserted by creating, reordering and closing sessions and observing every surviving id unchanged. (c) It never appears in any value the workspace hands to a dispatch boundary — asserted over the fixture-era dispatch surface, and **structurally held** for a real submission until the browser-to-server boundary exists (trigger: phase 16 C5). (d) The Generation ID is never generated, reformatted, parsed or defaulted by the client: a workflow state the client holds is returned unchanged, asserted by structural equality with what was handed in. (e) Planted-defect probe: place the page-lifetime session id in the generation-id position of a dispatched value, observe (c) redden, revert — asserting **equality with the server-returned value**, not that the submitted value is a well-formed UUID. | 5 | F8 · §12A.1 |
| **C2** | Reorder is one move, total over its cases, and pointer and keyboard agree. (a) A move from one index to a different index places the moved id at the target and preserves every other id's relative order. (b) The active session id is unchanged by a move, **including when the moved tab is the active one**. (c) A move to the same index is a no-op: no state write, no announcement, no focus change. (d) A move that would land before the first or past the last index is a no-op by the same rule. (e) For the same source and target, the pointer path and the keyboard path produce the identical list. (f) The keyboard move keeps focus on the moved tab and announces its new position. (g) Reorder is reachable without a pointer. (h) A session created or closed during a drag leaves the remaining moves applying to the list as it then is, and no move targets a removed id. | 8 | F12 · F24 · §12A.5 |
| **C3** | Close is total over its four cases, with the stated newly-active session and focus destination. (a) Closing a non-active tab leaves the active session unchanged, and leaves focus unchanged unless focus was inside the removed tab, in which case focus lands on the tab now at the removed index, clamped to the last index. (b) Closing the active tab that is not at the last index activates the session now at the same index and focuses that tab. (c) Closing the active tab at the last index activates the session now at the last index and focuses that tab. (d) Closing the only remaining tab creates a fresh empty session and focuses that tab. (e) In (d) the replacement is created **before** the removal, asserted by observing that no rendered frame contains an empty strip. (f) Focus never lands on the document body after any of (a)–(d). (g) A closed session's id is never reused by a later session. (h) Planted-defect probe: on closing the active tab, activate the first index instead of the same index; row (b) must redden. | 8 | F12 · F24 · §12A.5 |
| **C4** | The active tab is kept in view without a forbidden mechanism. (a) After a switch, a reorder, a close, a creation, and a strip resize — five rows — the active tab is fully inside the strip's visible region with a margin. (b) `scrollIntoView` appears nowhere in this feature's source. (c) The tab is not located by a document query or selector. (d) The window width is not read during render. (e) Planted-defect probe for (b)–(d): introduce each forbidden mechanism in turn, observe the corresponding row redden, revert. | 5 | F12 · §12A.5 |
| **C5** | The strip meets its accessibility contract. (a) Tablist role, orientation and accessible name on the strip. (b) Each tab exposes its selected state, with a roving tabindex placing exactly one tab in the tab order. (c) Arrow keys move focus, `Home` and `End` jump, and activation follows focus. (d) Close is reachable by keyboard on a focused tab and its control carries an accessible name naming the session. (e) Every tab and the close control carry a visible focus indicator. (f) The close control's hit area meets the size design 04 §5 requires. (g) A tab's full title remains in its accessible name when the visible label is elided. | 7 | F6 · §12A.5 · `05 §7` |
| **C6** | The shell's landmark identity holds across every session operation. (a) Across a sequence containing at least one activation, one creation, one close and one reorder, the count of complementary regions is 1 and the count of `main` elements is 1 at every rendered frame. (b) Both are the **same elements** throughout rather than replacements — asserted by element identity across the sequence, not by count alone. (c) No URL, route, or history entry changes during the sequence. (d) The Agent Surface's structure is not a function of the active session. (e) Planted-defect probe: push a history entry on session activation, observe (c) redden, revert. (f) Second planted-defect probe: remount the Agent Surface when the active session changes, observe (b) redden, revert. | 6 | F30 · §12A.23 |

**Derived totals for this phase:** 6 criteria, 39 rows, named mutations at C1(e), C3(h),
C4(e) (one per forbidden mechanism), C6(e) and C6(f). Re-derive at dispatch.

## Notes

- **The snapshot architecture is the thing this phase must not build.** Design 04's
  `SESSION_KEYS` / `BLANK_SNAP` / `seedSnap` / `loadSnap` / `sset`, the `archive` array, the
  `PAST_SESSIONS` seed, `BG_SESSION` and its `bump()` chain, `sessionSeq`, and
  `document.querySelector` for the active tab are all prototype-only. The product guarantee in
  design 04 §1 survives; the mechanism does not.
- Session titles: derived presentation, not stored truth. Whether titles are user-editable is
  design 04's open question 6 and is out of V1.
- **No cap on session count** in V1 beyond the strip scrolling with the active tab kept in view;
  overflow indication is a reported design delta.
- Closing is **unguarded in this phase by design** (see Goal). The gate point left in task 5 is
  what phase 05 fills; a reviewer finding an unguarded close here is finding this phase's stated
  boundary, not a defect.

## Review log

*(empty)*
