# Phase 05 — Turn dispatch, origin attribution, and the close/discard guard

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 8 |
| **Projection** | **required** — attribution is a reconciliation rule; the guard destroys work |
| **Serves** | F9 · F13 · F16 · F10 · F11 |

## Goal

Introduce the turn: a submission that returns a result, attributed to the session that
dispatched it by a value captured at dispatch, never by whichever session is active when it
resolves. Then put the meaningful-work confirmation guard in front of every path that can
close a session or abandon its workflow.

**Added to this phase by owner decision 20 (2026-09-07):** the **unread counter and attention**, moved
here from phase 04 with `STATUS_ANNOUNCEMENT_DEBOUNCE_MS` and the debounced status announcement. The
reason is that this phase creates every event that moves the counter — five of phase 04's eight unread
rows had nothing to fire them — and that C1(a) and C2(a)–(d) below **already assert** the increment and
the non-increments while another phase owned the mechanism. Now they own it. See C7, C8, tasks 13–15.

**Not in this phase:** the approval/execution turn and its close **refusal**, and the browser
departure request — both arrive in phase 12, because the creating state does not exist until
then. This phase builds the ordinary confirmation guard and leaves the refusal's insertion
point named. No surface renders a result yet; results are applied to records and observed
there.

## Read first

- Master plan §6.2 (`use-turn-dispatch`, `use-close-guard`), §6.3, §9 rule 14, §10.4.
- Intention §5.3, §5.6 (discard), §8.1 (the composer draft's exception), §12A.2 **in full**,
  §12A.6 **in full**, §12A.4 (the increment this phase drives), §12A.3 (the status this phase
  re-derives), §13 conflict **C-6**, §15 owner decisions 2 and 7.
- `ui_design/04-session-tabs.md` §1 and §4.3, `ui_design/07-proposal-review.md` §4.4,
  `ui_design/03-agent-surface.md` §3.5.
- Contracts: `05-client-architecture.md` §3 (the flow-state union is required, not optional),
  §5, §7; `15-ui-styling-and-component-system.md` §5 (the native `<dialog>` decision);
  `12-anti-patterns.md` "Components and client".

## Dependencies

Phase 04 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/hooks/use-turn-dispatch.ts    new
src/features/proposal-preparation/hooks/use-close-guard.ts      new
src/features/proposal-preparation/hooks/use-workspace-session-store.ts   edited — in-flight turn slot
src/features/proposal-preparation/components/workspace/         edited — the confirmation dialog
src/features/proposal-preparation/components/session-tabs/      edited — close routes through the gate
src/features/proposal-preparation/client/fixtures/turns.temporary-fixture.ts   new
```

## Ordered tasks

1. **Capture attribution at dispatch, by value, before any await**: the origin session id and a
   fresh turn id unique within the page. Mark the origin session's record as having that turn in
   flight, storing the turn id.
2. **Route the resolution by the captured values only.** Apply the result to the session found
   by the captured origin session id, and only if that session's in-flight turn id equals the
   captured turn id. **The active session id is never read on the resolution path** — reading it
   there, or applying to "the current session", is the defect this contract exists to prevent.
3. **Make the four resolution cases total** and make each observable: matching turn id;
   superseded turn id; origin session gone; origin session with an empty in-flight slot.
4. **Accept at most one application per turn id**; a second application for the same turn id is
   discarded.
5. **Render in-flight state per session**: the active session's own in-flight turn is the only
   one that produces a thread indicator; a non-active session with a turn in flight produces the
   tab signal and nothing else. Nothing polls, and nothing simulates progress for a session with
   no in-flight turn (conflict C-6).
6. **Represent the dispatch's async status as a discriminated union** (contract 05 §3). Boolean
   trios are prohibited.
7. **Implement the meaningful-work predicate** over §12A.6's closed set of six inputs, as their
   disjunction, evaluated at the moment the close or discard intent is raised, from the session
   runtime record — never from a rendered view model and never from a value cached at render.
   An input that is unavailable at this integration stage evaluates to **true**.
8. **Keep the predicate and the tab status apart, in both directions.** The close guard never
   reads the status; the status never reads the predicate.
9. **Give the composer draft its lifetime**: it belongs to its session, is cleared by exactly
   four events, survives the clarification panel replacing the composer, is read only for the
   **target** session, and is never trimmed, normalised, or pattern-tested to decide the
   predicate.
10. **Build the guard as one explicit confirmation step** naming what will be lost, with no
    undo, no archive, and no timed toast — a native `<dialog>` opened modally (master plan
    §6.1). Route **every** close and discard path through it, evaluated on the target session
    before any list mutation, including the last-session close: a refused or cancelled close
    creates no replacement and removes nothing.
11. Leave the named insertion point for phase 12's creation refusal, in the same gate.
12. **Implement unread as one integer per session** (§12A.4), incremented only on the application
    path of task 2, cleared to exactly zero on activation, and touched by nothing else. There is no
    decrement path other than that clearing. **`use-workspace-session-store.test.ts:47` forbids
    `let sessionSeq` / `let counter` in the store's source** — an inherited guard over a file this
    phase edits.
13. **Implement attention as `unread > 0` on a non-active tab and nothing else** — not a third stored
    value and not a second status axis. A component that wants a combined "needs attention" computes
    the conjunction at render. The badge is exposed as text ("3 unread"), never as a bare number, and
    forms part of the tab's accessible name beside the status text phase 04 put there.
14. **Announce a status change politely and debounced to the settled state**, so a session moving
    through `working` to `ready` produces at most one announcement. The window is
    `STATUS_ANNOUNCEMENT_DEBOUNCE_MS` (master plan §6.4) and criteria assert the contract, not the
    literal. **The strip already owns one polite live region** for reorder announcements
    (`data-session-reorder-announcement`); a status announcement must not clobber a reorder
    announcement, and which region carries it is this phase's explicit delegation.
15. Closeout: contract 14 §8's impact review, tracker row **and this plan's header** (§11.3 follow-up
    21's interim rule: both cells move in the same edit), Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | Attribution is captured at dispatch and the resolution never reads the active session. (a) Dispatch a turn in session A, activate session B, resolve the turn: A's record carries the result and its unread is exactly 1, **every field of B's record is unchanged**, and the active session id is still B. (b) The origin session id and the turn id are captured before any await — asserted by changing the active session between dispatch and resolution. (c) The active session id is not read on the resolution path, asserted at the source level over the dispatch module. (d) Planted-defect probe: at resolution, look the session up by the active session id; row (a) must redden. | 4 | F9 · §12A.2 |
| **C2** | The four resolution cases are total and each is reachable. (a) Origin exists, in-flight turn id matches → the result is applied, the status re-derives, and unread increments by exactly 1 when the session is not active. (b) Origin exists, in-flight turn id differs → the result is discarded; no session's state changes; no unread increments. (c) Origin no longer exists → the result is discarded and is **never** applied to the active session, a neighbouring session, or a newly created session; no unread increments anywhere. (d) Origin exists with no in-flight turn → the result is discarded. (e) A second application for the same turn id is discarded. (f) Planted-defect probe: apply a result whose origin session is absent to the active session; row (c) must redden. | 6 | F9 · §12A.2 |
| **C3** | In-flight presentation is per session and nothing simulates progress. (a) The thread's working indicator renders only for the active session's own in-flight turn. (b) A non-active session with a turn in flight produces the tab signal and no thread indicator. (c) No timer, interval, poll, or scheduled update advances a session that has no in-flight turn — asserted at the source level and by advancing time with no dispatch outstanding. (d) The dispatch's async status is a discriminated union; no boolean trio exists. | 4 | F9 · F16 · §12A.2 · C-6 · `05 §3` |
| **C4** | The meaningful-work predicate is the disjunction of its six inputs, over real session and workflow state. One row per input, each with a record satisfying **only** that input: (a) a turn has ever been started, including one in flight; (b) the thread holds at least one turn; (c) the workflow state carries a current proposition; (d) the workflow state carries a clarification round; (e) the workflow state carries a draft reference; (f) the target session's composer draft has at least one character, whitespace included. (g) A record satisfying none of the six closes on the first activation of the control, with no confirmation. (h) An input that is unavailable evaluates to **true** and the confirmation is shown. (i) The predicate is evaluated at the moment the intent is raised, from the record — asserted by changing the record after render and before the intent, and observing the new value decide. | 9 | F13 · §12A.6 |
| **C5** | The predicate and the tab status are separated, and the separation can fail. (a) A session holding a pasted, unsent brief and no turn renders status `empty` **and** requires confirmation to close — the single row that decision 7 was ratified to protect. (b) The close guard's source reads no status. (c) The status function's source reads no predicate. (d) **Named mutation:** gate the confirmation on the session's status being other than `empty`; row (a) must redden. (e) **Second named mutation:** remove input (f) from the disjunction; row (a) must redden — recorded separately because it bites at a different site. | 5 | F13 · F10 · §12A.6 |
| **C6** | The guard is total over every path that ends a session, and the composer draft's lifetime is total over its own events. (a) One row per close and discard path — the active tab's close control, a keyboard close on a focused tab, the review surface's discard, closing a non-active session by any path the close table admits, and closing the **last** session — each running the guard on the **target** session before any list mutation. (b) In the last-session row, a cancelled close creates no replacement, removes nothing, and leaves the strip exactly as it was. (c) Confirmation is required for the session being closed, not for the active session, when the two differ. (d) The guard is one explicit step naming what will be lost; there is no undo, no archive, and no timed toast. (e) The draft is cleared by exactly four events — sent, explicitly cleared, session closed, page reloaded — and by nothing else, one row per event plus one row for a non-clearing event. (f) While the clarification panel replaces the composer the draft stays with its session and input (f) evaluates over the retained characters exactly as it would with the composer visible; dismissing the panel returns the composer with the draft as it was. (g) A draft typed in one session is never read when evaluating another. (h) Planted-defect probe: bypass the gate on one close path; row (a)'s corresponding row must redden. | 8 | F13 · §12A.6 |

| **C7** | Unread is total over the workspace's events, and the rows this phase does not duplicate are named. One row per §12A.4 event **not already asserted above**: (a) a result applied while the session **is** active leaves it unchanged. (b) Activation sets it to exactly zero. (c) Dispatching a turn leaves it unchanged. (d) A reorder leaves it unchanged. (e) Scrolling the tab into view leaves it unchanged. (f) No decrement path other than clearing on activation exists — a **plain check** over the store's own closed action set under standing rule 18A, asserting per rule 18 that its scan had a subject. (g) **Named mutation:** increment unread at dispatch instead of at application, in `hooks/use-turn-dispatch.ts` at the dispatch site; row (c) must redden; revert. **Not duplicated here, deliberately:** "applied while not active increments by exactly 1" is C1(a) and C2(a), and "a discarded result leaves it unchanged" is C2(b), (c) and (d) — a second copy would be an orphan under standing rule 12. **Not carried at all:** §12A.4's "renamed" event, which named a mechanism that exists nowhere and that no phase introduces; the intention records it as unmeasured in V1 (§16 round 12). **Runner:** Vitest `node`. | 7 | F11 · §12A.4 |
| **C8** | Attention is the conjunction, computed at render, and the announcement is debounced. (a)–(d) The unread badge shows exactly when `unread > 0` **and** the tab is not active — four rows over the two-by-two of those predicates, each asserting its one exact outcome. (e) The badge is exposed as text ("3 unread"), never as a bare number, and forms part of the tab's accessible name. (f) No combined "needs attention" value is stored anywhere — **named mutation:** in `hooks/use-workspace-session-store.ts` store the conjunction on the record **and** in the strip read that stored field instead of computing it; row (a) must redden; revert. Naming both the store site and the read site is required: storing a value nothing reads changes no rendered output and reddens nothing. (g) A session moving through `working` to `ready` inside the debounce window produces **exactly one** polite announcement, and a status announcement does not replace a pending reorder announcement. The window is asserted as `STATUS_ANNOUNCEMENT_DEBOUNCE_MS`, never as its literal (charter rule 13). **Runner:** Vitest `jsdom`. | 7 | F11 · F14 · §12A.4 · §12A.17 |

**Derived totals for this phase:** 8 criteria, 50 rows, 7 named mutations (C1(d), C2(f), C5(d),
C5(e), C6(h), C7(g), C8(f)). Re-derive at dispatch.

**Sizing, flagged rather than passed over.** At 8 criteria this phase sits exactly on the charter's
target and is dispatchable; at **50 rows** it is the largest in the project, and the charter's own
evidence is that criteria count predicts session count. **This phase's pre-dispatch lint carries an
explicit split question**: the natural seam is dispatch and attribution (C1–C3, C7, C8) against the
close guard (C4–C6), which are independent mechanisms sharing only the store. Recorded here so the
question is asked at dispatch rather than discovered in round three.

## Notes

- **The clarification panel does not exist yet.** C6(f) is written against the panel's
  *replacement of the composer*, which this phase models with the composer's own hidden state so
  the row is reachable; phase 08 re-asserts it against the real panel and the plan records the
  re-assertion rather than duplicating the row.
- The failure direction is asymmetric **and fixed**: a false "no meaningful work" destroys a
  session's work with no undo, no archive and no reload recovery; a false "meaningful" costs one
  keystroke. A session that would optimise the other way has inverted the contract.
- **The approval turn's refusal is phase 12's**, not a variant of this guard. Keep the insertion
  point named so phase 12 adds a branch rather than restructuring the gate.
- Fixtures for turn results are era-marked (master plan §6.6) and populate view models directly
  until the owning backend schema phases merge. Phase 04 established the era-1 result-kind union in
  `client/fixtures/session-runtime.temporary-fixture.ts`; this phase extends it rather than declaring a
  second one.
- **The unread rows arrived here by owner decision 20, not by planning drift**, and what they cost is
  recorded: phase 04's C4 and C5 numbers are retired rather than reused, because that plan's Review log
  and master plan §7.5 cite `C6(a)`.
- **§11.3 follow-up 19's B2 is pinned to this phase's pre-dispatch lint**: phase 03's single-close-path
  guard counts occurrences of `closeSession(` in one file and an aliased second path passes it, and
  task 10 inserts this phase's gate at exactly that point. The lint verifies the single close path by
  enumeration before dispatch.

## Review log

*(empty)*
