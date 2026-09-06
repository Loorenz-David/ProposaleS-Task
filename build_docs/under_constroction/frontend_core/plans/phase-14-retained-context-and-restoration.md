# Phase 14 — Retained context and restoration on activation

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 8 |
| **Projection** | **required** — a precedence order plus a category-C leakage path |
| **Serves** | F29 · F28 · F1 · F30 · F24 |

## Goal

Make activating a session present the right Main Application Surface state and put the user back
where they left off — as a function of that session's own record, with every retained entry
resolved at render against what is rendered, and with nothing reconstructed.

This is the phase that turns F1's "A's meaningful workspace context is restored" from an
adjective into a measured claim.

**Not in this phase:** any new retained entry. The set is closed in master plan §6.5 and its two
members landed in phases 10 and 11. This phase adds the resolution and the precedence.

## Read first

- Master plan §6.5 **in full**, including the excluded-candidate table, §6.3, §9 rule 14.
- Intention §5.3, §8.6 **in full**, §12A.21 **in full**, §12A.22 **in full**, §12A.23, §12A.17's
  two restoration rows, §12A.7's closure sentence, §12A.4 (the unread badge is the workspace's
  only signal that something arrived), §15 owner decision 11, F1's text.
- The round-2 mechanism-inventory handoff §5 rows B, C, F, G, H and §9, as review history:
  `archive/pre_plan/mechanism-inventory-round-2.handoff.coordinator.md`.
- Contracts: `05-client-architecture.md` §5, §5.2; `16-design-prototype-porting.md` §3, §5;
  `12-anti-patterns.md` "Components and client", "Structure and abstraction".

## Dependencies

Phase 13 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/workspace/MainApplicationSurface.tsx  edited — the (A) precedence
src/features/proposal-preparation/hooks/use-workspace-session-store.ts             edited — resolution reads
src/features/proposal-preparation/client/view-models/main-surface.ts               new — the presented state
src/features/proposal-preparation/types/session.ts                                 edited — RetainedContext
```

## Ordered tasks

1. **Make the presented state a function of the activated session's record alone**: its in-flight
   turn, its workflow state, its latest domain result, and its retained entries resolved against
   them. The session that was active before is not an input, and no case reads another session's
   record.
2. **Write the (A) precedence first-match-wins in the stated order**, so rows 1–4 partition every
   record.
3. **Write the (B) resolution as three rows**, and make the second and third **non-destructive**:
   an entry that does not resolve is not cleared, not rewritten and not deleted; it resolves
   again, to its value, as soon as a later state carries its place and its identity.
4. **Let an entry decide only where inside a state the user lands.** The session's own record
   decides which state is presented; an entry can neither suppress, delay, substitute, nor
   re-enter a state.
5. **Surface stale context as nothing at all.** No notice, no warning, no restoration-failed
   state, no error and no announcement. The unread badge is the workspace's existing and only
   signal that something arrived while the user was away; a second signal would report a fact the
   product does not own.
6. **Reconstruct nothing.** No case derives a proposition, provenance, a resolution, a status, an
   amount, a draft identity, or any other authoritative value from a retained entry or from what
   the surface previously showed. The idle state is the surface's state for having nothing, never
   a rendering assembled from what the session used to show.
7. **Keep restoration out of navigation.** No case changes the URL, pushes or replaces a history
   entry, mounts a route, or replaces either landmark.
8. **Move no focus and announce nothing on restoration.** Activation already announces through
   the activated tab's accessible name; one deliberate act produces one announcement.
9. **Close the derivation register against the retained context** (§12A.7): no register row's
   source is an entry, and no entry is a register row.
10. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The (A) precedence's four rows, each from a record satisfying only that row. (a) An approval turn in flight → the creating presentation, with no header, view toggle, discard or approval control. (b) A draft reference → the created presentation, newly created or recovered. (c) A current proposition → the Proposal Preparation work surface the session's retained work-surface entry names, or that entry's declared default. (d) None of the above → the Proposal Preparation **idle** state. (e) The four rows partition every record: a record matching none of (a)–(c) matches (d), asserted as totality rather than as a default branch. | 5 | F29 · §12A.22 |
| **C2** | The six enumerated overlaps, because a first-match chain gets each of them silently wrong. (a) an approval turn in flight **and** a draft reference → row 1. (b) a draft reference **and** a current proposition → row 2. (c) a current proposition **and** latest result `clarification` → row 3, the proposition stays rendered and the questions are the Agent Surface's. (d) a current proposition **and** latest result `failed` → row 3, the proposition intact and rendered. (e) no proposition **and** latest result `clarification` or `failed` → row 4, the idle state, with the failure reported on the Agent Surface — two rows. (f) a **non-approval** turn in flight → does not match row 1; rows 2–4 decide, and the in-flight turn shows on the Agent Surface and in the derived status without replacing the Main Application Surface. (g) **Named mutation:** swap rows 1 and 2 of (A); row (a) must redden. | 8 | F29 · §12A.22 |
| **C3** | The (B) resolution's three rows, and its non-destructiveness. (a) The presented state has the place the entry names and the identity is present in what is rendered → the entry's value. (b) The state has that place but the identity is not present — a block a later proposition version removed — → the entry's **declared default**. (c) The state has no such place at all — rows 1, 2 and 4 of (A) for a work-surface or location entry — → the entry's declared default. (d) In rows (b) and (c) the entry is **not** cleared, rewritten or deleted, asserted by observing the stored value unchanged. (e) A later state carrying the place and the identity resolves the entry to its value again. (f) Every entry resolves independently: one entry resolving to its default never changes another's resolution. (g) Defaults are asserted as "the entry's declared default", never as a literal. (h) **Named mutation:** render (B) row (b) from the value captured when the entry was written; the "nothing is reconstructed" row of C5 must redden. | 8 | F29 · §12A.21 · §12A.22 · charter rule 13 |
| **C4** | An entry never overrides a state, and restoration is not navigation. (a) A record whose (A) row is the creating presentation presents the creating presentation whatever the retained work-surface entry holds. (b) An entry cannot suppress, delay, substitute or re-enter a state — four rows. (c) No case changes the URL, pushes or replaces a history entry, or mounts a route — three rows. (d) No case replaces either landmark; both are the same elements before and after every activation in a sequence. (e) **Named mutation:** push a history entry on session activation; row (c) must redden. | 9 | F29 · F30 · §12A.22 · §12A.23 |
| **C5** | Nothing is reconstructed, and stale context is never a condition. (a) No case derives a proposition, a provenance class, an item resolution, a status, an amount, or a draft identity from a retained entry or from what the surface previously showed — six rows, each asserted by activating a session whose entry names something the current objects no longer carry. (b) The idle state is the surface's own no-proposition state, never a rendering assembled from what the session used to show. (c) No notice, warning, restoration-failed state, or error is produced about the restoration — four rows, asserted as absences. (d) The unread badge remains the only signal about a session the user was away from. | 12 | F29 · F28 · §12A.22 · §8.6 |
| **C6** | The retained-context set is closed and behaves as one mechanism. (a) The stored entries are exactly the members of the master plan's registry — asserted as a set equality against that registry, so an entry created at runtime fails. (b) The key space is fixed: no key is produced at runtime, no entry is created by a component on first use, and no serialisation of a component subtree exists — three rows with a planted-defect probe that introduces a runtime key and observes (a) redden. (c) **No entry is written by a turn-result application**, for an active session and for a non-active one — two rows. (d) Every entry is read only at render, never resolved at write, never cached against a resolved target. (e) **The reference-not-value test:** rendering a session's Main Application Surface from its retained context **with the session's server-returned objects removed** produces no authoritative value on screen. (f) **Named mutation:** write a session's retained context from the turn-result application path; row (c) must redden. (g) **Second named mutation:** clear a session's retained context when a result is applied to it while it is not active; C3 row (e) must redden. | 10 | F28 · §12A.21 |
| **C7** | Restoration moves no focus and announces nothing of its own. (a) Activating a session moves focus to the activated tab and no further, whichever state or entry the restoration resolves to — one row per (A) state. (b) Restoration fires no announcement of its own. (c) An entry resolving to its declared default fires no announcement. (d) Operating the work-surface toggle announces the view it selected; activating a session does **not** re-announce the view it restored. (e) **Named mutation:** announce the restored work surface on activation; rows (b) and (d) must redden. | 8 | F24 · F29 · §12A.17 |
| **C8** | F1's restoration clause, measured end to end. (a) Establish meaningful Main Application Surface context in session A; switch to session B and establish **different** context there; return to A: A's context is what the user left. (b) In the same sequence, a disposable mechanic established in A is allowed to have reset. (c) In the same sequence, **no authoritative domain value is reconstructed** from presentation or session context — asserted by removing A's server-returned objects before the return and observing no domain value on screen. (d) In the same sequence no session loses its thread, proposition, clarification state, or created result. (e) The derivation register is closed against the retained context: no register row's source is an entry and no entry is a register row (phase 04 C6(a), completed here). | 5 | F1 · F28 · F29 · F14 · §12A.7 |

**Derived totals for this phase:** 8 criteria, 65 rows, named mutations at C2(g), C3(h), C4(e),
C6(b), C6(f), C6(g), C7(e). Re-derive at dispatch.

## Notes

- **The exclude-on-doubt direction is not a licence for a thin set.** §12A.21's four conditions
  are decidable per candidate, so the direction governs residual cases only. Master plan §6.5's
  excluded-candidate table records why each rejected candidate fails a specific condition; a
  reviewer checking thinness checks that table, not this phase's code.
- **Stale context resolves silently.** The alternative — a notice saying the user's place moved —
  would report a fact the product does not own, and would be a second signal beside the unread
  badge.
- The prohibited architecture is design 04's snapshot engine and design 10 §7's generic session
  engine. A snapshot of arbitrary DOM, of a component subtree, or of every transient control is
  the thing C6 exists to make impossible, not merely to discourage.
- **The Agent Surface is not governed by §8.6.** The composer draft survives a switch by §8.1 and
  owner decision 7; the clarification panel's step position and unsent values remain disposable;
  the typed text of an in-progress inline edit remains disposable. None of them is an entry.

## Review log

*(empty)*
