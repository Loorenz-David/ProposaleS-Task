# Phase 04 — Derived presentation: status, unread, the derivation register

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 6 |
| **Projection** | **required** — derivations are a silent-failure family |
| **Serves** | F10 · F11 · F14 · F6 |

## Goal

Make every presentation value that this workspace derives a function computed at render from
one named source, stored nowhere — and make the unread counter the one exception, with its own
total event table. This phase establishes the derivation register that every later phase adds
its rows against.

**Not in this phase:** turn dispatch and the events that would move a status or increment an
unread counter arrive in phase 05; this phase drives both from constructed session runtime
records so that each row of each table is reachable and exactly one predicate makes it true.

## Read first

- Master plan §6.3 (`TabStatus`, status text), §6.4, §6.5 (the two stored presentation values),
  §9 rule 14.
- Intention §5.3, §8.2, §8.5, §12A.3 **in full** including its overlap table, §12A.4 **in
  full**, §12A.7 **in full**, §12A.17's announcement rules.
- `ui_design/03-agent-surface.md` §3.2 (the status line), `ui_design/04-session-tabs.md` §3.3–§3.4,
  §5, and its "Prototype-only" `tabState` entry.
- Contracts: `05-client-architecture.md` §5, §7; `12-anti-patterns.md` "Components and client".

## Dependencies

Phase 03 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/hooks/use-workspace-session-store.ts   edited — unread only
src/features/proposal-preparation/client/view-models/session-tab.ts      new — TabViewModel + adapter
src/features/proposal-preparation/components/session-tabs/               edited — dot, badge, name
src/features/proposal-preparation/components/agent/AgentStatusLine.tsx   new
src/features/proposal-preparation/types/session.ts                       edited — TabStatus
```

## Ordered tasks

1. **Implement tab status as a pure function of one session runtime record**, computed at
   render, stored nowhere. Its inputs are exactly the five §12A.3 names and nothing else.
2. **Write the precedence chain first-match-wins, in the order §12A.3 states**, so that every
   record matches exactly one row and rows 5 and 6 partition what rows 1–4 do not.
3. **Render the status twice from the same function**: the tab's dot and the agent surface's
   status line and phase label. Neither stores a value, so they cannot disagree — this settles
   design 03's open question 6 structurally, and the phase records that it did so rather than
   adding a synchronisation rule.
4. **Carry status as text.** The tab's accessible name carries the session title, the status
   text, the status note, and the unread count in words when non-zero. `ready` and `created` are
   distinguished in the accessible name whether or not the specifications later give them
   distinct dots. The animated dot is hidden from assistive technology and does not animate
   under reduced motion.
5. **Implement unread as one integer per session** with §12A.4's total event table, and
   **attention as `unread > 0` on a non-active tab and nothing else** — not a third stored value
   and not a second status axis. A component that wants a combined "needs attention" computes
   the conjunction at render.
6. **Write the derivation register as a real module-level enumeration** of §12A.7's rows, each
   naming its one source, and add the check that no row's value is written into state beside its
   source. Rows whose surfaces do not exist yet are declared with their source and marked as
   arriving with their phase; a row is not asserted before its surface exists.
7. **Announce a status change politely and debounced to the settled state**, so a session moving
   through `working` to `ready` produces at most one announcement. The window is a named constant
   and criteria assert the contract, not the literal.
8. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The six precedence rows, enumerated. One row per §12A.3 row: a session runtime record in that condition renders exactly that status and exactly that status text. (a) in flight → `working` / "Working". (b) draft reference present → `created` / "Created". (c) latest result kind `clarification` → `questions` / "Needs you". (d) current proposition present → `ready` / "Ready". (e) at least one turn completed → `idle` / "Open". (f) no turn ever started → `empty` / "Empty". Each row's record satisfies **only** that row's predicate, so the row cannot pass for a second reason. | 6 | F10 · §12A.3 |
| **C2** | The seven overlaps, enumerated, because each is a row a first-match-wins chain gets wrong silently. (a) in flight **and** a draft reference → `working`. (b) in flight **and** latest result `clarification` → `working`. (c) draft reference **and** a current proposition → `created`. (d) draft reference **and** latest result `clarification` → `created`. (e) latest result `clarification` **and** a current proposition → `questions`. (f) latest result `failed` **and** a current proposition → `ready`. (g) latest result `failed` **and** no proposition → `idle`. (h) Planted-defect probe: swap rows 2 and 3 of the precedence chain, observe (d) redden, revert. | 8 | F10 · §12A.3 |
| **C3** | Status is never colour-only and never stored. (a) The tab's accessible name contains the session title, the status text of its matched row, the status note, and the unread count in words when non-zero. (b) `ready` and `created` are distinguishable in the accessible name. (c) The dot is hidden from assistive technology. (d) Under reduced motion the working dot does not animate. (e) The agent surface's status line and the tab's dot are two renderings of one call on one record — asserted by mutating the record and observing both change with no intervening write. (f) No `{status, note, unread}` record is written by any handler — planted-defect probe: store the computed status on the record and render that field, observe (e) redden, revert. (g) A status derived from thread content, a string test, or elapsed time appears nowhere. | 7 | F10 · F6 · §12A.3 · §12A.7 |
| **C4** | Unread is total over the workspace's events. One row per §12A.4 event: (a) a result applied while the session is **not** active increments by exactly 1, once per applied result regardless of how many parts it renders. (b) A result applied while the session **is** active leaves it unchanged. (c) Activation sets it to exactly zero. (d) Dispatching a turn leaves it unchanged. (e) A discarded result leaves it unchanged. (f) A reorder, a rename, or scrolling the tab into view leaves it unchanged. (g) No decrement path other than clearing on activation exists. (h) Planted-defect probe: increment at dispatch instead of at application, observe (d) redden, revert. | 8 | F11 · §12A.4 |
| **C5** | Attention is the conjunction, computed at render. (a) The unread badge shows exactly when `unread > 0` **and** the tab is not active — four rows over the two-by-two of those predicates. (b) The badge is exposed as text ("3 unread"), never as a bare number, and forms part of the tab's accessible name. (c) No combined "needs attention" value is stored anywhere — planted-defect probe: store the conjunction on the record, observe the register check of C6 redden, revert. (d) The dot and the badge are both legible at the strip's minimum tab width. | 4 | F11 · F14 · §12A.4 |
| **C6** | The derivation register is closed, and every existing row is a function. (a) The register enumerates exactly §12A.7's rows; a value not in it is either server-returned, or one of the workspace's two stored presentation values, or it does not exist. (b) For every register row whose surface exists in this phase — tab status, status note, phase label, attention, the session count in the header — mutating the source changes the rendered value with no intervening write. (c) No module writes a register row's value into state. (d) Rows whose surfaces arrive later are declared with their one source and the phase that asserts them, so the register is complete as a list before it is complete as a set of assertions. (e) The unread counter is the only stored presentation **counter**. (f) Planted-defect probe: store a formatted derived value beside its source and render the stored field, observe (b) redden, revert. | 6 | F14 · §12A.7 |

**Derived totals for this phase:** 6 criteria, 39 rows, 4 named mutations (C2(h), C3(f),
C4(h), C5(c) / C6(f) — C5(c) and C6(f) are distinct probes on distinct sites). Re-derive at
dispatch.

## Notes

- **`failed` is not a seventh status.** The five domain result states are the backend's; the six
  statuses are the design's presentation vocabulary. A `failed` result changes the status only
  through rows 4 and 5, which is why the ordering resolves it and a seventh member would be a
  fabricated concept.
- **The `empty` status and the close guard are different conditions and neither reads the
  other** (master plan §9 rule 14). This phase's C1(f) is about the status; phase 05's predicate
  is about work worth confirming. A session holding a pasted, unsent brief is status-`empty` and
  is meaningful work.
- Whether `created` gets a dot visually distinct from `ready` is a reported design delta; the
  accessible name already distinguishes them, which is what F6 requires.
- The register's later rows — the readiness count, a rendered money string, a leaf's provenance
  class, a pill's kind, the composer's send-enabled state, the panel's send-enabled state —
  belong to phases 06, 08, 09, 10. Declaring them here is what makes phase 15's closure check
  possible.

## Review log

*(empty)*
