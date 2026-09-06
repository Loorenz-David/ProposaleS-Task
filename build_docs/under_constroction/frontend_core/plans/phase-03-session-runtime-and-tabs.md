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
src/features/proposal-preparation/components/workspace/workspace.test.tsx edited — see below
e2e/workspace.spec.ts                                                    edited — see below
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
4. **Implement reorder** as one move, total over §12A.5's four cases, with pointer and keyboard
   producing the same list for the same source and target. The keyboard move-by-one keeps focus
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
| **C1** | The two identifiers stay totally separate. (a) The page-lifetime session id is generated once per session at creation and is stable for that session's lifetime. (b) It is never derived from the tab's index, a thread position, or a module-level counter — asserted by creating, reordering and closing sessions and observing every surviving id unchanged. *Named mutation: at the id's definition site, replace the generator with the tab's array index; (b) must redden.* (c) **Structurally held in this phase** (pre-dispatch lint, 2026-09-07): it never appears in any value the workspace hands to a dispatch boundary. This phase's perimeter contains no dispatch boundary and no fixture-era dispatch surface — phase 05 task 1 creates both, with `client/fixtures/turns.temporary-fixture.ts` — so the row has no subject here and an implementer asked to assert it would have to build one, which is phase 05's work. Named triggers, in order: phase 05's dispatch surface, then the browser-to-server boundary for a real submission (phase 16 C5). Master plan §7.5. (d) **Held with (c), same trigger**: the Generation ID is never generated, reformatted, parsed or defaulted by the client, and a workflow state the client holds is returned unchanged, asserted by structural equality with what was handed in. No server-returned workflow state exists until a turn has run (§12A.1), and no turn runs before phase 05. (e) **Held with (c) and (d)** — the planted-defect probe places the page-lifetime session id in the generation-id position of a dispatched value and observes (c) redden, asserting **equality with the server-returned value**, not that the submitted value is a well-formed UUID. A probe with no instrument to prove is not a probe; it converts with the rows it serves. | 5 (2 measurable, 3 held) | F8 · §12A.1 |
| **C2** | Reorder is one move, total over its cases, and pointer and keyboard agree. (a) A move from one index to a different index places the moved id at the target and preserves every other id's relative order. (b) The active session id is unchanged by a move, **including when the moved tab is the active one**. (c) A move to the same index is a no-op: no state write, no announcement, no focus change. (d) A move that would land before the first or past the last index is a no-op by the same rule. (e) For the same source and target, the pointer path and the keyboard path produce the identical list. (f) The keyboard move keeps focus on the moved tab and announces its new position. (g) Reorder is reachable without a pointer. (h) A session created or closed during a drag leaves the remaining moves applying to the list as it then is, and no move targets a removed id. | 8 | F12 · F24 · §12A.5 |
| **C3** | Close is total over its four cases, with the stated newly-active session and focus destination. (a) Closing a non-active tab leaves the active session unchanged, and leaves focus unchanged unless focus was inside the removed tab, in which case focus lands on the tab now at the removed index, clamped to the last index. (b) Closing the active tab that is not at the last index activates the session now at the same index and focuses that tab. (c) Closing the active tab at the last index activates the session now at the last index and focuses that tab. (d) Closing the only remaining tab creates a fresh empty session and focuses that tab. (e) In (d) the replacement is created **before** the removal, asserted by observing that no rendered frame contains an empty strip. (f) Focus never lands on the document body after any of (a)–(d). (g) A closed session's id is never reused by a later session. (h) Planted-defect probe: on closing the active tab, activate the first index instead of the same index; row (b) must redden. (i) Every path that ends a session passes through **exactly one** named gate point, asserted by enumerating the call sites that remove a session from the ordered list and finding that set equal to the single permitted gate — an allowlist over an open universe of call sites, with a subject assertion that the enumeration found the gate at all. *Named mutation: add a second close path that removes a session without passing through the gate; (i) must redden.* This is what phase 05 inserts its guard into, and the row exists so that "phase 05 inserts one gate rather than rewriting four rows" is a fact rather than an intention. | 9 | F12 · F24 · §12A.5 |
| **C4** | The active tab is kept in view without a forbidden mechanism. (a) After a switch, a reorder, a close, a creation, and a strip resize — five rows — the active tab is fully inside the strip's visible region with **at least `ACTIVE_TAB_REVEAL_MARGIN_PX` clear on both sides**, asserted as the named constant's contract and never as its literal (charter rule 13, master plan §6.4). The constant's value is this phase's to choose; design 04 §4.4 asks only for "a small margin". (b) `scrollIntoView` appears nowhere in this feature's source. (c) The tab is not located by a document query or selector. (d) The window width is not read during render. (e) Planted-defect probe for (b)–(d): introduce each forbidden mechanism in turn, observe the corresponding row redden, revert. | 5 | F12 · §12A.5 |
| **C5** | The strip meets its accessibility contract. (a) Tablist role, orientation and accessible name on the strip. (b) Each tab exposes its selected state, with a roving tabindex placing exactly one tab in the tab order. (c) Arrow keys move focus, `Home` and `End` jump, and activation follows focus. (d) Close is reachable by keyboard on a focused tab and its control carries an accessible name naming the session. (e) Every tab and the close control carry a visible focus indicator. (f) The close control's hit area meets the size design 04 §5 requires. (g) A tab's full title remains in its accessible name when the visible label is elided. | 7 | F6 · §12A.5 · `05 §7` |
| **C6** | The shell's landmark identity holds across every session operation. (a) Across a sequence containing at least one activation, one creation, one close and one reorder, the count of complementary regions is 1 and the count of `main` elements is 1 at every rendered frame. (b) Both are the **same elements** throughout rather than replacements — asserted by element identity across the sequence, not by count alone. (c) No URL, route, or history entry changes during the sequence. (d) The Agent Surface's structure is not a function of the active session. (e) Planted-defect probe: push a history entry on session activation, observe (c) redden, revert. (f) Second planted-defect probe: remount the Agent Surface when the active session changes, observe (b) redden, revert. | 6 | F30 · §12A.23 |

**Derived totals for this phase** (re-derived by the pre-dispatch lint, 2026-09-07; re-derive
again at dispatch): **6 criteria, 40 rows** — C1 5 · C2 8 · C3 9 · C4 5 · C5 7 · C6 6 — of which
**37 are measurable in this phase** and 3 (C1(c), C1(d), C1(e)) are structurally held with the
triggers their cells name. **8 runnable named mutations** — C1(b) 1 · C3(h) 1 · C3(i) 1 · C4(e) 3
(one per forbidden mechanism) · C6(e) 1 · C6(f) 1 — plus **1 held** (C1(e)), which converts with
the rows it serves and is not part of this phase's executable set.

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
