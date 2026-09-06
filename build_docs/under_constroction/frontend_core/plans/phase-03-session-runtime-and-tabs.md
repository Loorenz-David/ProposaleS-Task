# Phase 03 — Session runtime and the tab strip

| | |
|---|---|
| **State** | `PROMPT_READY` |
| **Criteria** | 7 |
| **Projection** | **required** — ordering rules, focus destinations, identity separation |
| **Serves** | F12 · F8 · F30 · F24 · F6 |

## Goal

Introduce the page-lifetime session runtime and the tab strip that presents it: session
identity, the ordered list, creating, activating, reordering, closing with its focus
destinations, and keeping the active tab in view — with the shell's landmark identity holding
across every one of those operations.

**In this phase by owner decision 16** (2026-09-07): the **new-session control**. Without it the strip has one tab and nothing this phase builds — switching, reordering, closing, keeping the active tab in view — is reachable by a user or by a browser-level check. Design 04 §2 and §3.5 specify the control; the decision fixes only which phase builds it. Its rows are C7.

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
src/features/proposal-preparation/components/workspace/workspace.test.tsx edited — see below
e2e/workspace.spec.ts                                                    edited — see below
e2e/session-tabs.spec.ts                                                 new — this phase's browser evidence
```

**The two phase-02 test files are in the perimeter, and what may change in them is closed**
(added by the pre-dispatch lint, 2026-09-07). Introducing a tab stop into the shell breaks
phase 02's rows that pin an **absolute** tab order, and the phase cannot close green without
touching them: `C2(a)` (three `Tab` presses to an injected probe), `C2(e)` (two to the
divider) and the three parameterised `C4(<width>-3)` rows (skip link, then divider) — five
test instances, derived by reading every `keyboard.press("Tab")` in `e2e/workspace.spec.ts`.
Those five may be **re-baselined to the tab order this phase creates**, and nothing else may
be. Every other phase-02 assertion is frozen and must stay green **unchanged**: the landmark
counts and node identity, the containment perimeter (`C5(a)`–`C5(d)` in
`workspace.test.tsx`), the idle-surface role allowlist, the divider contract, and every
narrow-width row. Weakening a frozen phase-02 assertion to make this phase's code pass is a
blocking defect, not a re-baseline; if one of them is genuinely wrong, it is reported and
routed, never edited. The one deliberate repair is task 8.

**The freeze binds existing assertions; it does not forbid additions** (projection L11). This
phase's own browser evidence — C4(b), C5(e), C5(f), C5(g) and C6(c)'s Playwright half — lands in
a **new** spec, `e2e/session-tabs.spec.ts`. Nothing in this phase adds assertions to
`e2e/workspace.spec.ts`; the only edits there are the five re-baselined instances.

**Two frozen phase-02 rows constrain this phase's markup, and both apply because the strip lives
inside the `complementary` landmark** (design 03 §2 places Session Tabs inside the Agent Surface;
the frozen rows iterate the `complementary` and `main` subtrees):

- `C4(<width>-2)` exempts horizontal overflow **only** for an element carrying the literal class
  `overflow-x-auto` or `overflow-x-scroll`, an inline `style.overflowX` of `auto`/`scroll`, or the
  attribute `data-horizontal-scroll`. Whichever element in the strip ends up with
  `scrollWidth > clientWidth` must itself carry one of those four exact spellings — not merely an
  ancestor of it (projection L26, extended by the coordinator).
- the **second half of that same row has no exemption at all**: every `div` inside either pane
  must have a `getBoundingClientRect().width` no greater than the pane's `clientWidth`. A
  scrolling track wider than its pane would break it, and no attribute rescues it. Keep the
  overflow inside a box that is itself pane-width (coordinator addition, 2026-09-07).

## Ordered tasks

1. **Create the feature store** at the position master plan §6.1 fixed, holding: the active
   session id, the ordered list of page-lifetime session ids, and the per-session runtime
   records. Records are separate per session; there is no shared record, and no session's record
   is ever serialised into another's.
2. **Generate the page-lifetime session id per session, once, at creation** — never from a
   module-level mutable counter, never from the tab's array index, never from a thread position.
   Give the type a **nominal** identity so a server-supplied `generationId` can never be used as
   a session key. Note the limit rather than overclaiming it: the backend's `generationId` is a
   bare `string` (`src/lib/proposales/index.ts`), and standing rule 1 forbids the frontend from
   branding a backend-owned type, so the type system cannot block the **other** direction — a
   client id passed into a generation-id position. That direction is C1(c)'s subject and is held
   with it (below).
3. **Install `@radix-ui/react-tabs`** and build the strip's tablist mechanics on it: tablist
   role and orientation, roving tabindex, arrow-key movement, `Home` / `End`, activation
   following focus. Record the package and its resolved version in the Review log, with the
   widget that justified it (contract 15 §5). Compose reorder, close and title behaviour on top;
   if the primitive distorts any of them, use native elements for that part and record why.
   **The tabpanel question is resolved here, not at the keyboard** (projection F8): design 04 §5
   asks for the Agent Surface itself to be the `role="tabpanel"`, and intention §12A.23 requires
   it to remain exactly one `complementary` landmark, the same element for the page's lifetime.
   One element carries one role, so it cannot be both; standing rule 6 and the contract guide's §6
   conflict protocol resolve this in the mechanism contract's favour, and the design delta is
   recorded in master plan §11.2. **The landmark is never the panel and never unmounts.** Two
   grounded facts constrain whatever shape carries the tabs relationship: the foundation's
   `TabsContent` renders `children: present && children`, so a panel per session unmounts the
   outgoing session's subtree and hands back a different element — which is precisely what C6(b)
   forbids and what C6(f)'s probe plants; and every trigger emits `aria-controls` **unconditionally**,
   so building no panel at all leaves a dangling ARIA reference on every tab. Resolve both; how is
   the implementer's, and the choice is recorded in the Review log.
4. **Implement reorder** as one move, total over §12A.5's four cases, with pointer and keyboard
   producing the same list for the same source and target. **Drag initiation must suppress the
   foundation's activation** (projection F4): `TabsTrigger` calls `onValueChange` from
   `onMouseDown`, and a pointer drag begins with a `mousedown`, so beginning a drag on a
   non-active tab would activate it and break C2(b) on the pointer path. Design 04 §4.1's "the
   close button stops propagation" is written against a `div` with an `onClick` and must likewise
   be applied at `mousedown` for this foundation. The keyboard move-by-one keeps focus
   on the moved tab and announces its new position. Live reorder during a drag commits each
   move; an abandoned drag keeps the last committed order (design 04 §4.2 — the alternative is a
   reported delta, not a decision this phase takes).
5. **Implement close** as §12A.5's four-case table, with the newly active session and the focus
   destination each row states. The last row's ordering is part of the contract: **the
   replacement session is created before the closed session is removed**, so no rendered frame
   shows an empty strip. Leave a single, named gate point in front of every close path so phase
   05 inserts its guard there without touching these rows — **asserted by C3(i)**, whose
   instrument enumerates the call sites that end a session and is an **allowlist** naming the one
   permitted gate (standing rule 17), with a subject assertion that the enumeration found
   something (standing rule 18).
6. **Keep the active tab in view** after every change that can move it, computing the scroll
   position from a ref, so that the active tab sits fully inside the strip's visible region with
   at least `ACTIVE_TAB_REVEAL_MARGIN_PX` (master plan §6.4) clear on both sides.
   `scrollIntoView` is forbidden; so is locating the tab by document query or selector; so is
   reading the window width during render. **Build each of those three as an allowlist, not a
   denylist** (standing rule 17): the universe of ways to reach the document or the window is
   open, so a list of forbidden spellings proves only that its own list matches itself. Each
   instrument asserts that its scan had a subject (standing rule 18), and each ships with the
   C4(e) probe that plants a construct **no denylist would have contained**.
7. **A closed session's id is never reused.**
7A. **Build the new-session control** (owner decision 16). It creates a session, appends it at the
   end of the ordered list, and makes it active (§12A.5, "Order"). It is a **sibling of the
   tablist, never a child** — a non-tab child of a `tablist` is an accessibility defect and would
   join the roving-focus group as an arrow-key target — and it sits outside the scroll region,
   pinned, per design 04 §2. It carries an accessible name and is keyboard reachable. Its rows
   are C7.
8. **Inherited repair, and the phase-02 re-baseline.** Repair master plan §11.3 **follow-up
   16**, which names this phase: `workspace.test.tsx` C5(a) forbids "assignment to
   `window.location` or `location.hash`" while its regex
   `(?:window\.)?location(?:\.hash)?\s*=` does not match `window.location.href = "/x"` —
   verified at the phase-02 approval gate by planting exactly that and watching all four C5 rows
   pass. Widen the pattern to the row's own words and prove the repair by planting
   `window.location.href = "/x"` in `src/app/page.tsx`, observing the red, and reverting.
   Separately, re-baseline the five phase-02 tab-order instances named in §4 to the order this
   phase creates. This phase adds source under both trees C5(a) and C5(b) scan; if either
   scanner reddens on legitimate work, that is reported and routed, never silenced.
9. Closeout: contract 14 §8's impact review, tracker row, Review log; add the two tech-stack
   rows to the root README (master plan §11.3 follow-up 6).

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The two identifiers stay totally separate. **Runner: Vitest `node` (store + source scan).** (a) The page-lifetime session id is generated once per session at creation and is stable for that session's lifetime, observed across creating, reordering and closing sessions. (b) **The id's construction site passes a source-level allowlist**: the module that mints an id calls exactly one permitted generator, and the site contains no module-level mutable counter, no read of the tab's array index, and no thread position. An allowlist over an open universe of ways to derive a value (standing rule 17), asserting that its scan had a subject (standing rule 18). *Named mutation: introduce a module-level counter as the id source at the construction site; (b) must redden.* **Re-authored 2026-09-07 (projection F1):** the previous wording asserted only that ids survive unchanged, which every generator §12A.1 forbids also satisfies — a counter, an index and a thread position are each assigned once and stored, so stability distinguishes nothing. (c) **Structurally held in this phase** (pre-dispatch lint): it never appears in any value the workspace hands to a dispatch boundary. This phase's perimeter contains no dispatch boundary and no fixture-era dispatch surface — phase 05 task 1 creates both, with `client/fixtures/turns.temporary-fixture.ts`. Named triggers, in order: phase 05's dispatch surface, then the browser-to-server boundary (phase 16 C5). Master plan §7.5. (d) **Held with (c), same trigger**: the Generation ID is never generated, reformatted, parsed or defaulted by the client, and a workflow state the client holds is returned unchanged, asserted by structural equality with what was handed in. No server-returned workflow state exists until a turn has run (§12A.1). (e) **Held with (c) and (d)** — the probe places the page-lifetime session id in the generation-id position of a dispatched value and observes (c) redden, asserting **equality with the server-returned value**, not that the submitted value is well-formed. A probe with no instrument is not a probe; it converts with the rows it serves. | 5 (2 measurable, 3 held) | §12A.1 · F8 (held rows only) |
| **C2** | Reorder is one move, total over its cases, and pointer and keyboard agree. **Runner split (contract 11 §3, projection L27): the list and active-session halves are asserted on the store's move function without rendering, in Vitest `node`; the focus and announcement halves in Vitest `jsdom`; nothing here runs in Playwright.** (a) A move from one index to a different index places the moved id at the target and preserves every other id's relative order. (b) The active session id is unchanged by a move, **including when the moved tab is the active one, on the pointer path as well as the keyboard path**. *Named mutation: remove the guard that preserves the active session id in the move function; (b) must redden.* The pointer path is named explicitly because the adopted foundation activates a tab on `mousedown` and a drag begins with one (projection F4) — task 4 owes the suppression. (c) A move to the same index is a no-op in three separately instrumented respects: **no state write** (the store's list reference is identical before and after), **no announcement** (the named live region gains no child), **no focus change** (`document.activeElement` is the same node). *Three named mutations, one per sub-check (charter rule 12): write the list back unconditionally; announce unconditionally; move focus to the moved tab unconditionally — each must redden its own sub-check and no other.* (d) A move that would land before the first or past the last index is a no-op by the same rule. (e) For the same source and target the pointer path and the keyboard path produce the identical list, **asserted by both paths calling the one move function with the same `(i, j)`**; the DOM drag handler is asserted separately to call it with the indices the drag implies. jsdom implements no `DragEvent` and no `DataTransfer` (projection F5), so a DOM-level drag is not the subject here. (f) The keyboard move keeps focus on the moved tab and announces its new position. (g) Reorder is reachable without a pointer. (h) A session created or closed during a drag leaves the remaining moves applying to the list as it then is, and no move targets a removed id — **asserted on the move function applied against a list that changed underneath it**, for the same reason as (e). | 8 | §12A.5 · F12 · F24 |
| **C3** | Close is total over its four cases, with the stated newly-active session and focus destination. **Runner split as C2.** (a) Closing a non-active tab leaves the active session unchanged, and leaves focus unchanged unless focus was inside the removed tab, in which case focus lands on the tab now at the removed index, clamped to the last index. **The fixture for the focus clause exists because of owner decision 15** (2026-09-07): every tab carries a close control revealed on hover and on keyboard focus, so focus can rest inside a non-active tab. Under the previous shape it could not — the foundation activates on focus and only the active tab had a close control — and the clause had no producible subject. (b) Closing the active tab that is not at the last index activates the session now at the same index and focuses that tab. (c) Closing the active tab at the last index activates the session now at the last index and focuses that tab. (d) Closing the only remaining tab creates a fresh empty session and focuses that tab. (e) **The close action's intermediate list is non-empty at every step of the transition**, asserted on the transition rather than on rendered output. *Named mutation: split the action into two separate writes with the removal first; (e) must redden.* **Re-authored 2026-09-07 (projection F2):** the previous wording asserted that "no rendered frame contains an empty strip", which cannot fail — the close is one store transition, React batches it into one commit, and both orderings expose the same final list with no intermediate frame at all. (f) Focus never lands on the document body after any of (a)–(d). (g) A closed session's id is never reused by a later session. *Named mutation: replace the id generator with the tab's array index; (g) must redden* — create A, create B, close A, create C issues C the id `"1"`, colliding with B. This is the observation that distinguishes a forbidden generator from a permitted one, which is why it lands here and not on C1(b) (projection L2). (h) Planted-defect probe: on closing the active tab, activate the first index instead of the same index; row (b) must redden. (i) Every path that ends a session passes through **exactly one** named gate point, asserted by enumerating the call sites that remove a session from the ordered list and finding that set equal to the single permitted gate — an allowlist over an open universe of call sites, with a subject assertion. *Named mutation: add a second close path that removes a session without passing through the gate; (i) must redden.* | 9 | §12A.5 · F12 · F24 |
| **C4** | The active tab is kept in view without a forbidden mechanism. **Split by runner 2026-09-07 (projection F3, master plan §10.3A): jsdom performs no layout — every geometry accessor returns a hard-coded zero and there is no `ResizeObserver` — so no part of this criterion's geometry can be observed in Vitest.** (a) **The reveal arithmetic is a pure function**, unit-tested in Vitest `node` over values: given the tab's offset and width, the region's `scrollLeft` and `clientWidth`, and `ACTIVE_TAB_REVEAL_MARGIN_PX`, it returns a `scrollLeft` that places the tab fully inside the visible region with at least the margin clear on both sides. Five input cases, one per operation that can move the tab — switch, reorder, close, creation, resize — each asserting the constant's contract, never its literal (charter rule 13). (b) **The end-to-end guarantee in Playwright**, against the running application with enough sessions to overflow the strip: after each of those five operations the active tab is fully inside the strip's visible region with the margin. (c) `scrollIntoView` appears nowhere in this feature's source. (d) The tab is not located by a document query or selector. (e) The window width is not read during render. Rows (c)–(e) are **allowlists over an open universe** (standing rule 17), each asserting its scan had a subject (standing rule 18). (f) Planted-defect probe for (c)–(e): introduce each forbidden mechanism in turn **as a construct no denylist would have contained**, observe the corresponding row redden, revert. Three named mutations. | 6 | §12A.5 · F12 |
| **C5** | The strip meets its accessibility contract. **Runner: Vitest `jsdom` for roles, states and key handling; Playwright for (e), (f) and (g), which are browser-computed measurements.** Grounded against `@radix-ui/react-tabs@1.1.13` and `@radix-ui/react-roving-focus@1.1.11`, both read at source by the coordinator on 2026-09-07; a fresh install may resolve higher, and the first contradiction between these outcomes and the installed version is a stop-and-report, not a silent adaptation. (a) Tablist role and orientation, and an accessible name on the strip — **the name is owed by the composition, not the foundation**, which spreads props and supplies none. (b) Each tab exposes its selected state, and the roving tabindex places **exactly one** tab at `tabindex="0"` with every other at `-1`. (c) The key map, enumerated rather than sampled (charter rule 2): `ArrowRight` moves focus to the next tab and is a **no-op on the last tab** (the foundation's `loop` defaults to `false`); `ArrowLeft` moves to the previous and is a no-op on the first; `Home` and `PageUp` jump to the first; `End` and `PageDown` jump to the last; `ArrowUp` and `ArrowDown` move focus **nowhere** at horizontal orientation; and activation follows focus. (d) Close is reachable by keyboard on a focused tab — **on every tab, active or not** (owner decision 15) — and its control carries an accessible name naming the session. **The close control is a sibling of the tab trigger inside a wrapper, never a descendant of it**: the foundation renders the trigger as `<button type="button">`, and a `<button>` may not contain a `<button>` (projection L17). (e) Every tab and the close control carry a visible focus indicator. (f) The close control's hit area meets the size design 04 §5 requires (≥ 24px). (g) A tab's full title remains available when the visible label is elided. **`data-elided` goes on the inner title span, whose own accessible name is its own text — never on the tab**, whose accessible name carries status, note and unread and is deliberately not equal to its text. Phase 02's frozen `C4(<width>-4)` requires every `[data-elided]` element that overflows to have an accessible name equal to its `textContent`; phase 03 supplies that row's first real subject, and the tab is the one placement that would redden a row this phase may not edit (projection F7). Phase 02 set the same precedent at `agent-surface.tsx:10`. | 7 | F6 · §12A.5 · `05 §7` |
| **C6** | The shell's landmark identity holds across every session operation. **Runner: Vitest `jsdom`, with (c) also asserted in Playwright.** (a) Across a sequence containing at least one activation, one creation, one close and one reorder, the count of complementary regions is 1 and the count of `main` elements is 1 — **asserted after every operation in the sequence, and additionally by a render-recording probe that collects both counts on each commit**, so the claim is about the whole sequence and not only its endpoints. (b) Both are the **same elements** throughout rather than replacements — asserted by element identity across the sequence, not by count alone. (c) No URL, route, or history entry changes during the sequence. (d) **Structurally held in this phase** (projection L21): the Agent Surface's structure is not a function of the active session. §12A.23 words this over "the active session's result kind, status, or presented Main Application Surface state" — none of which exists here, where sessions differ only by identity and title, so the row has a degenerate subject. Named triggers: **phase 04** introduces derived status; **phase 14** introduces the second Main Application Surface state. Master plan §7.5. (e) Planted-defect probe: push a history entry on session activation, observe (c) redden, revert. (f) Second planted-defect probe: remount the Agent Surface when the active session changes, observe (b) redden, revert. | 6 (5 measurable, 1 held) | F30 · §12A.23 |
| **C7** | Creating a session, and the control that does it. **Added 2026-09-07 by owner decision 16**, which puts the new-session control in this phase; the creation semantics it exercises were previously asserted by no row in this plan. **Runner: Vitest `node` for (a)–(c), `jsdom` for (d)–(e).** (a) Creating a session appends it at the **end** of the ordered list, leaving every existing id in its relative order (§12A.5, "Order"). *Named mutation: insert the new session at index 0; (a) must redden.* (b) The created session becomes the active session. (c) Its runtime record is a separate, empty record — no field is shared with, copied from, or serialised out of any other session's record (§12A.1, "Records are separate per session"). (d) The control carries an accessible name and is reachable by keyboard. (e) The control is a **sibling of the tablist, never a child of it**: a non-tab child inside a `tablist` is an accessibility defect and would join the roving-focus group, making it an arrow-key target (projection L24). Design 04 §2 places it outside the scroll region, pinned. | 5 | §12A.5 · F12 · F6 |

**Derived totals for this phase** (re-derived at source after routing the projection ledger,
2026-09-07; re-derive again at dispatch): **7 criteria, 46 rows** — C1 5 · C2 8 · C3 9 · C4 6 ·
C5 7 · C6 6 · C7 5 — of which **42 are measurable in this phase** and 4 are structurally held
with the triggers their cells name (C1(c), C1(d), C1(e), C6(d)). **15 runnable named mutations** —
C1(b) 1 · C2(b) 1 · C2(c) 3 · C3(e) 1 · C3(g) 1 · C3(h) 1 · C3(i) 1 · C4(f) 3 · C6(e) 1 ·
C6(f) 1 · C7(a) 1 — plus **1 held** (C1(e)), which converts with the rows it serves and is not
part of this phase's executable set.

## Explicit delegations — decisions granted to the implementer on purpose

Recorded in writing so the freedom is granted rather than taken silently. Each is a free choice;
none is a licence to skip a criterion.

1. **The instrument for C4(c)–(e)'s allowlists.** `typescript@^6.0.3` is an installed
   devDependency, so `ts.createSourceFile` is available and a real member-expression allowlist is
   possible rather than a regex over text. The choice of instrument is the implementer's; the
   allowlist shape and the C4(f) probe are not.
2. **`ACTIVE_TAB_REVEAL_MARGIN_PX`'s value.** Master plan §6.4 records it as this phase's choice;
   design 04 §4.4 asks only for "a small margin". Criteria assert the contract, never the literal.
3. **How the tabs relationship is carried without making the landmark the panel** (task 3). The
   resolution — the landmark is never the panel — is fixed; the construction is not.
4. **The activation interaction under test.** `@testing-library/user-event` is **not** a
   dependency of this repository, and `fireEvent.click` does not fire `mousedown`, which is what
   the foundation activates on. Add the dependency, drive `mousedown` directly, or assert
   activation through the store — the implementer's call, recorded here so it does not cost a
   round to discover.
5. **The new-session control's exact position** within the strip wrapper, subject to C7(e): a
   sibling of the tablist, outside the scroll region.
6. **How C2 and C3's rows are split between the store test and the rendered test**, subject to
   contract 11 §3 (a feature store's transitions are asserted directly, without rendering) and to
   each row naming both halves where it has two.

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

### Pre-dispatch plan lint — coordinator, 2026-09-07

Run before compiling the projection prompt, against the tree at gate commit `3796dc1`. The five
charter manifest properties plus the three collision checks, each at source.

**Passed unchanged.** Every path, section and symbol the plan names resolves: master plan §6.1,
§6.2, §6.3, §9, §10.4; intention §5.3, §8.1–§8.3, §8.5, §12A.1, §12A.5, §12A.17, §12A.23;
`ui_design/04-session-tabs.md` §1, §4.1–§4.5, §5 and its Prototype-only list; contracts 05 §3,
§5, §5.1, §5.2, §7 · 03 §1–§2, §4 · 15 §5 · 11 §2–§3 · 13 §2. Every trace cell resolves and
supports its row (F6, F8, F12, F24, F30 in intention §12, §12A.1 / §12A.5 / §12A.23). §6.2 fixes
`components/session-tabs/` and `types/session.ts` where the plan puts them, and §6.1 fixes the
store at `hooks/use-workspace-session-store.ts`. Sizing passes: 6 criteria, under the charter's 8.
The row count was stated correctly (39 before this lint's amendments).

**F1 — a perimeter-versus-guard collision, and the file list that hid it.** Grepping the
repository for order- and count-pinning assertions over the phase's perimeter returns five
phase-02 end-to-end instances that assert an **absolute** tab order from the document start:
`C2(a)` (three `Tab` presses), `C2(e)` (two), and the three parameterised `C4(<width>-3)` rows.
A tablist with a roving tabindex inserts a tab stop, so all five go red — in a file the plan did
not permit anyone to touch, which is unsatisfiable rather than merely inconvenient. The plan's
§4 now carries `e2e/workspace.spec.ts` and `workspace.test.tsx`, names those five as the closed
set that may be re-baselined, and freezes everything else in both files. Recording the shape as
well as the instance: **this phase is the first to add a tab stop to a shell whose keyboard
evidence was written when the shell had two**, and every later phase adding one inherits the
same collision.

**F2 — three of C1's five rows had no subject in this phase.** C1(c) asserts over "the
fixture-era dispatch surface"; C1(d) asserts a round trip of a server-returned workflow state;
C1(e) is the probe that proves (c). None of the three exists here: phase 05 task 1 creates the
dispatch surface and `client/fixtures/turns.temporary-fixture.ts`, and §12A.1 puts the workflow
state in the record only "once a turn has run". This is manifest property 2's own earned defect —
an implementer binds a void reference to the nearest plausible thing in scope and the criterion
becomes an assertion about test code. All three are now marked **structurally held** with their
named triggers, and master plan §7.5 carries the row so phase 05's lint converts them rather than
losing them. Holding (e) left C1 — a criterion tracing to F8 — with **no runnable mutation**, so
C1(b) gained one: replace the id generator with the tab's array index at its definition site.

**F3 — task 2 claimed more than the type system can deliver.** "Keep the type distinct … so the
two can never be substituted" is achievable in one direction only. The backend's `generationId`
is a bare `string` (`src/lib/proposales/index.ts:39`), and a branded client type is still
assignable to `string`, so nothing stops a client id being passed into a generation-id position;
blocking that would mean branding a backend-owned type, which standing rule 1 forbids. The task
now states the achievable half (a server id can never be used as a session key) and names the
other half as C1(c)'s subject, held with it. Left overclaimed, this task would have been
discharged by a test proving the direction that does not matter.

**F4 — an acceptance claim inside a task, with no row and no test home.** Task 5's "leave a
single, named gate point in front of every close path" is the structural obligation phase 05 is
planned around, and nothing asserted it. Added as **C3(i)** with its own named mutation. Rows
39 → 40, runnable mutations 7 → 8.

**F5 — C4(a) had no exact outcome.** "Fully inside the strip's visible region with a margin"
is not a predicate; design 04 §4.4 says only "a small margin" and intention §12A.5 repeats it.
Rather than pinning a literal in a criterion (charter rule 13), master plan §6.4 gains
`ACTIVE_TAB_REVEAL_MARGIN_PX`, owned by this phase, and C4(a) asserts the constant's contract.
The value itself is this phase's free choice, recorded as such.

**F6 — a standing instruction naming this plan by number was unapplied.** Master plan §11.3
follow-up 6 (README tech-stack rows) was already in task 8; **follow-up 16** — C5(a)'s navigation
denylist being narrower than its own row text — names "phase 03, the next phase adding source
under the scanned trees" and appeared nowhere in the plan. Now task 8, with the planted-defect
proof the repair owes.

**Instrumentation instructions moved into the tasks that build the instruments** (standing rules
17 and 18, whose own earned text says the criterion cell is the wrong home): tasks 5 and 6 now
carry the allowlist-not-denylist requirement and the subject assertion.

**What this lint did not check**, stated so a green lint is not read as a verified plan: whether
each criterion row can be turned into a concrete assertion by a session holding only these
artifacts, whether the mandated primitive's semantics permit the invariants the plan asserts
alongside it, and whether rows quantified over "every rendered frame" are observable at all.
Those are the projection's, and the projection gate for this phase is mandatory (§7.2).

### Projection round 0 consumed — coordinator, 2026-09-07

`handoffs/reviewer/phase-03-projection-round-0.handoff.reviewer.md`, verdict
`AMENDMENTS_REQUIRED`. **All 27 ledger rows routed, none dismissed**, plus two coordinator
additions and two owner decisions. Rows 40 → 46, criteria 6 → 7, runnable named mutations
8 → 15, held rows 3 → 4.

**Consumption checks.** Write perimeter matched the tree exactly — one file, no code, no
config, no dependency; the tarball extraction was outside the worktree. Ledger arithmetic
re-derived and exact (19 plan gaps + 1 minor + 1 master-plan gap + 6 free choices = 27, ids
L1–L27 contiguous). L4 budget: zero, as instructed. `git diff 3796dc1 66aa5c3 -- src e2e
package.json vitest.config.mts playwright.config.ts vitest.setup.ts` is empty, so the phase-02
stamp is citable and was not re-run.

**Independently re-verified at source, by variation rather than reproduction.** The foundation's
`onMouseDown` activation, unconditional `aria-controls` and `type="button"` trigger; `TabsContent`'s
`children: present && children`; jsdom's absent `DataTransfer` and `DragEvent`; the frozen
`C4(<width>-4)` accessible-name equality and its single existing subject; and the frozen
`C4(<width>-2)` exemption spellings. All held.

**One projection claim disproved.** F6/L16 reported `@radix-ui/react-roving-focus` as "present
nowhere on this machine" and proposed either coordinator grounding or a delegated
stop-and-report — while naming the exact version, `1.1.11`. The tarball is in `~/.npm/_cacache`
and extracts by the identical method the session had just used for `react-tabs`. Grounded here
instead, and folded into C5(b) and C5(c) as exact outcomes: `loop` defaults to **`false`**, so
`ArrowRight` on the last tab is a **no-op** and does not wrap; `tabIndex: isCurrentTabStop ? 0 : -1`;
and at horizontal orientation `ArrowUp`/`ArrowDown` move focus **nowhere**, while `PageUp` and
`PageDown` alias `Home` and `End`. Two of seven C5 rows were about to ship as delegated guesses
about a package that was readable all along.

**Two coordinator additions.**

- **The strip is inside the `complementary` landmark** (design 03 §2), which is *why* phase 02's
  frozen overflow row applies to it at all — a reader assuming a shell-level header would find no
  collision. Stated in §4, together with the half the projection did not reach: that row's second
  loop requires every `div` in the pane to be no wider than the pane's own `clientWidth`, and
  **that half has no exemption attribute**. The projection covered only the first loop's four
  exempt spellings.
- **Creation had no criterion row.** The plan's goal names "creating, activating, reordering,
  closing", and C1–C6 covered every one but creation: that a new session is appended at the
  **end** and becomes active — §12A.5's own "Order" paragraph — was asserted nowhere. Owner
  decision 16 brought the control into this phase; **C7** brings the semantics it exercises.

**Routing, by home artifact.** Upstream first, never patched downstream. **Intention** — owner
decision 15 (§15) and its operative clause in §12A.5, plus §16 round 11. **Master plan** — §7.3's
F8 row corrected to `03 (held)`, since every C1 row serving F8 is held and the cell was false at
the project level (L3); §7.5 gained C6(d) (L21); §10.3A gained the layout-geometry paragraph,
because jsdom's geometry zeros are permanent and of the same class as its `var()` and
`matchMedia` gaps rather than phase-03-local (F3); §11.2 gained three design-04 deltas; §11.1
recorded both owner decisions and the gate. **This plan** — everything else.

**Row-by-row disposition.** L1, L2 → C1(b) re-authored as a source-level allowlist, the
distinguishing mutation re-attributed to C3(g). L3 → master plan §7.3. L4, L6 → C2(b) and C2(c)
gained four named mutations, one per sub-check. L5 → task 4. L7 → C2(e) and C2(h) re-rooted onto
the move function. L8 → resolved by owner decision 15, stated in C3(a). L9 → C3(e) re-authored as
a transition assertion. L10, L18 → C4 split into a pure-arithmetic row and a Playwright row;
C5(e)–(g) assigned to Playwright. L11 → every criterion names its runner, and
`e2e/session-tabs.spec.ts` is this phase's browser home; §4 now states that the freeze binds
existing assertions and permits additions. L12 → determined by owner decision 16. L13 → C4(f)
carries task 6's stronger wording. L14, L15, L23, L24, L26, L27 → the Explicit delegations
section. L16 → grounded, above. L17 → C5(d)'s sibling placement. L19 → C5(g)'s `data-elided`
placement. L20 → C6(a)'s instrument. L21 → C6(d) held. L22 → task 3's conflict resolution. L25 →
C4's trace cell reordered to `§12A.5 · F12`.

**What this routing does not settle**, recorded so the implementer prompt does not imply
otherwise: the grounded foundation facts are about `@radix-ui/react-tabs@1.1.13` and
`@radix-ui/react-roving-focus@1.1.11`, and task 3's install may resolve higher. The first
contradiction between a stated outcome and the installed version is a stop-and-report, not a
silent adaptation.
