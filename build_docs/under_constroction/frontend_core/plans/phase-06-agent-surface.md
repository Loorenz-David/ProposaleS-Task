# Phase 06 — Agent surface: thread, autoscroll, composer, empty state

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | waivable |
| **Serves** | F25 · F24 · F6 · F14 · F27 · F13 |

## Goal

Build the Agent Surface as a working column: header, status line, the thread with its follow
state, the working presentation, the empty state, and the composer. This is where a session's
conversation becomes visible.

**Not in this phase:** interaction pills and result rendering (phase 07); the clarification
panel that replaces the composer (phase 08). The thread renders human messages and a
placeholder assistant turn shape that phase 07 fills; the composer's hidden-while-panel-open
behaviour is wired against a flag the panel sets in phase 08.

## Read first

- Master plan §6.2, §6.3, §6.4 (`THREAD_FOLLOW_BOTTOM_THRESHOLD_PX`), §9 rules 4, 5, 7.
- Intention §5.2 **in full**, §8.1, §12A.18 **in full**, §12A.17 (the log region, the two
  "unchanged" focus rows, the reduced-motion rule), §12A.7 (the composer's send-enabled row and
  the session-count row), §12A.20 (whitespace preservation), §12A.6 input (6).
- `ui_design/03-agent-surface.md` in full, including its "Prototype-only" blocklist.
- Contracts: `05-client-architecture.md` §2, §3, §7; `11-testing-principles.md` §2–§3;
  `10-security-and-trust-boundaries.md` §4 (free text is data).

## Dependencies

Phase 05 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/agent/          new — AgentHeader, AgentStatusLine (edited),
                                                                   AgentThread, AgentThreadTurn,
                                                                   WorkingIndicator, AgentEmptyState,
                                                                   AgentComposer
src/features/proposal-preparation/hooks/use-thread-follow-state.ts   new
src/features/proposal-preparation/client/view-models/thread.ts       new
src/features/proposal-preparation/client/fixtures/thread.temporary-fixture.ts   new
```

## Ordered tasks

1. **Build the thread as a scroll region with its own follow state**, two states and no third,
   initialised to `following` when a session's thread is first rendered and reset to `following`
   on entering a session. The follow state is per session; a shared one is a defect.
2. **Implement §12A.18's seven transitions** exactly, including the one that is easy to get
   backwards: a **programmatic** scroll never detaches.
3. **Make the threshold a named constant** and assert the contract with adjacent-pair rows —
   exactly at the threshold is `following`, one unit beyond is `detached` — never the literal.
4. **Show the jump-to-latest affordance while detached**, and move the viewport only when the
   user activates it.
5. **Suppress autoscroll while focus is inside an expanded pill or the clarification panel**, in
   both states, and make pill expansion grow the payload downward without scrolling the thread.
6. **Make the thread a log region announcing completed turns only**, once each — never the
   in-flight indicator, never a token stream, never on a loop. The animated indicator is hidden
   from assistive technology and does not animate under reduced motion.
7. **Distinguish the human's and the application's turns non-visually**: alignment and
   background are not enough. Each turn carries an accessible owner label; a scope badge is part
   of its turn's accessible name rather than an orphan. Human text preserves its line structure
   and is rendered as text, never as markup.
8. **Build the composer**: a labelled textarea that grows then scrolls; `Enter` sends;
   `Shift+Enter` breaks; send is disabled on empty input and while this session's turn is
   pending; the hint is associated with the textarea; the send control carries its own accessible
   name. It is **hidden entirely** while the clarification panel is open, and the draft survives
   that (phase 05 C6(f)).
9. **Build the empty state** with its lead, its secondary line naming accepted inputs, and the
   safety sentence that nothing reaches Proposales until the user approves the draft. That
   sentence is design truth and matches the ratified approval boundary.
10. **Make the header's mark and agent name inert branding.** They were wired to the discarded
    navigation rail; if they are not interactive they must not be buttons. The history toggle and
    session-history list do not ship.
11. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The follow state's seven transitions, enumerated. (a) `following` + a user scroll leaving the bottom threshold → `detached`. (b) `following` + content appended → `following`, viewport pinned to the bottom. (c) `following` + a **programmatic** scroll → `following` — a programmatic scroll never detaches. (d) `detached` + a user scroll back within the threshold → `following`. (e) `detached` + jump-to-latest activated → `following` and the viewport moves to the bottom. (f) `detached` + content appended → `detached`, the viewport does not move, and the jump-to-latest affordance is shown. (g) Either state + the session is switched away and back → `following`. (h) Planted-defect probe: treat a programmatic scroll as a user scroll; row (c) must redden. | 8 | F25 · §12A.18 |
| **C2** | The threshold is a contract, not a literal. (a) Exactly at the threshold the state is `following`. (b) One unit beyond it the state is `detached`. (c) Both rows read the named constant rather than a literal, so changing the constant changes the boundary and reddens nothing. | 3 | F25 · §12A.18 · charter rule 13 |
| **C3** | Nothing moves the reader that should not. (a) While `detached`, an arriving result, a completed turn, and an announcement each leave the scroll position unchanged — three rows. (b) Expanding a pill's payload never scrolls the thread, in either state. (c) Autoscroll is suppressed while focus is inside an expanded payload, in both states. (d) A result applied to a **non-active** session scrolls nothing in the active one. (e) The follow state is per session: establishing `detached` in one session and switching to another leaves the second at `following`. (f) `scrollIntoView` for new content, and locating the scroll container by document query, appear nowhere. | 6 | F25 · F24 · §12A.18 · §12A.17 |
| **C4** | The thread announces completed turns only. (a) The thread is a log region announcing additions politely. (b) A completed turn is announced exactly once. (c) The in-flight indicator is never announced, and is hidden from assistive technology. (d) Under reduced motion the thinking indicator does not animate. (e) A result applied to a non-active session fires no announcement in the active one and moves no focus in it — the two rows a background session makes easy to get wrong. (f) Planted-defect probe: move focus to the thread when a result is applied; row (e) must redden. | 6 | F24 · F6 · §12A.17 |
| **C5** | The composer behaves as §5.2 states, and its send-enabled state is derived. (a) The textarea has a real label and its hint is programmatically associated with it. (b) `Enter` sends; `Shift+Enter` inserts a line break. (c) Send is disabled on empty input. (d) Send is disabled while **this** session's turn is pending, and is not disabled by another session's pending turn. (e) The send control carries an accessible name of its own; a bare glyph is not a name. (f) Send-enabled is computed at render from the composer's own draft text and the session's in-flight state, and is stored nowhere. (g) The composer is hidden entirely while the clarification panel flag is set, and the draft is unchanged when it returns. | 7 | F6 · F14 · F13 · §12A.7 · `05 §7` |
| **C6** | Turns are distinguishable non-visually and their text is text. (a) Each turn carries an accessible owner label distinguishing the human's message from the application's turn; alignment and background alone do not satisfy this row. (b) A scope badge is part of its turn's accessible name rather than an orphaned fragment. (c) A pasted multi-line message keeps its line structure when rendered. (d) No rendered turn text passes through a markup, Markdown, template-interpolation, automatic-link-detection, or rich-content path — asserted by rendering a message containing markup characters and observing them literally. (e) Planted-defect probe: render turn text through a markup path; row (d) must redden. | 5 | F6 · F27 · §12A.20 |
| **C7** | The header and the empty state are what V1 says they are. (a) The empty state renders its lead, its secondary line naming accepted inputs, and the safety sentence stating that nothing reaches Proposales until the user approves the draft. (b) The header's mark and agent name are **not** interactive controls. (c) No history toggle and no session-history list exists — with a planted-defect probe: add a history control, observe the row redden, revert. (d) The session count in the header is computed at render from the length of the tab list and is stored nowhere. (e) The status line is always present and renders the active session's note and phase label from the same function as the tab's dot (phase 04 C3(e)). | 5 | F6 · F14 · §12A.7 · intention §5.2 |

**Derived totals for this phase:** 7 criteria, 40 rows, 4 named mutations (C1(h), C4(f),
C6(e), C7(c)). Re-derive at dispatch.

## Notes

- **The blocklist is large on this surface.** Design 03's `extract()`, `command()`, `apply()`,
  the `looksLikeNotes` word-count heuristic, every content regex, the hardcoded sample notes and
  `STEPS`, every `this.later` delay, the local thinking-label state machine, the session-history
  panel and its seed data, the slash command set, `focusInput()` and every document-query focus
  or scroll trick, and the giant single state object are all prototype-only.
- **The slash palette is out of V1** (owner decision 1). Its visual pattern is not built.
- The working label comes from the session's real in-flight state, never from a fabricated step
  sequence. Live progress steps are structurally held (master plan §7.5).
- Design 03's open question 3 records that the 80px follow distance is a suggestion, not a
  measurement — that is why C2 asserts the constant's contract rather than its value.

## Review log

*(empty)*
