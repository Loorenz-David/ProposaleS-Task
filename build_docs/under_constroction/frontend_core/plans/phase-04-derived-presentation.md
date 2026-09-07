# Phase 04 — Derived presentation: status and the derivation register

| | |
|---|---|
| **State** | `PROMPT_READY` |
| **Criteria** | 5 |
| **Projection** | **required** — derivations are a silent-failure family. Round 0 run 2026-09-07, `AMENDMENTS_REQUIRED`, all 24 rows routed |
| **Serves** | F10 · F14 · F6 · F30 |

## Goal

Make every presentation value this workspace derives a function computed at render from one named
source, stored nowhere, and write down the register that says so. This phase establishes the
derivation register that every later phase adds its rows against, and gives the session tab its
status dot and its spoken status.

**Not in this phase:**

- **The unread counter and attention** — moved to phase 05 by **owner decision 20** (2026-09-07).
  Every event that moves the counter is created by turn dispatch, so five of the eight rows that
  measured it had nothing to fire them; phase 05's own C1(a) and C2(a)–(d) already assert the
  increment and the non-increments. The rows now live in phase 05 as C7 and C8, together with
  `STATUS_ANNOUNCEMENT_DEBOUNCE_MS` and the debounced status announcement. **Criterion numbers C4
  and C5 are retired here rather than reused**: this plan's Review log, master plan §7.5 and the
  projection handoff all cite `C6(a)`, and renumbering a cited row is what the charter forbids.
- **Turn dispatch and the events that move a status.** This phase drives its tables from
  **constructed session runtime records**, which is sound because every row below asserts a
  *state*, never a transition. The one row that needed a transition is held (C3(b)).

## Read first

- Master plan §6.2 (module map), §6.3 (`TabStatus`, status text, the naming rules), §6.4, §6.5A
  (**the theme layer is closed — a later phase uses a ramp entry or amends §6.5A**),
  §9 rules 4, 6, 7, 12, 13, 14, 17, 18, **18A**, 19, §10.3A, §11.2 deltas 18–20.
- Master plan §6.6 (**fixture-era markers**) and §9 rules 1 and 3 — see task 1.
- Intention §12A.8 (era 1, the presentation boundary and what an adapter may do), §5.3, §8.2, §8.5, §12A.3 **in full** including its overlap table and its 2026-09-07
  precision amendment, §12A.7 **in full**, §15 **decision 19**.
- `ui_design/03-agent-surface.md` §3.2, `ui_design/04-session-tabs.md` §3.3, §5, and its
  "Prototype-only" `tabState` entry.
- Contracts: `05-client-architecture.md` §5, §7; `12-anti-patterns.md` "Components and client".

## Dependencies

Phase 03 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/types/session.ts                  edited — TabStatus, and the five
                                                                    §12A.3 inputs on SessionRuntimeRecord
src/features/proposal-preparation/hooks/use-workspace-session-store.ts   edited — the record factory
                                                                    initialises the five inputs
src/features/proposal-preparation/client/view-models/session-tab.ts new — TabViewModel, toTabViewModel,
                                                                    and the status function
src/features/proposal-preparation/client/derivation-register.ts     new — DERIVATION_REGISTER
src/features/proposal-preparation/client/fixtures/session-runtime.temporary-fixture.ts  new — the
                                                                    era-1 result-kind union and its
                                                                    constructed records (§6.6 marker)
src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx  edited — the dot and
                                                                    the accessible name
src/features/proposal-preparation/components/agent/agent-status-line.tsx  new — exports AgentStatusLine
src/features/proposal-preparation/components/workspace/agent-surface.tsx edited — mounts AgentStatusLine
src/features/proposal-preparation/components/workspace/workspace.test.tsx edited — ONE regex (task 7)
e2e/workspace.spec.ts                                               edited — ONE restored context
                                                                    option (task 8)
```

Plus a `<name>.test.ts(x)` beside each new source file. `client/derivation-register.ts` is added to
master plan §6.2's module map by this phase.

## Inherited tripwires — signals, not obstacles

Each is a guard an earlier phase shipped, over a file **outside** this phase's perimeter or inside a
file this phase edits. Tripping one turns the suite red somewhere this plan does not authorise anyone
to touch. Found by the pre-dispatch collision check (2026-09-07), not by the projection.

1. **`workspace.test.tsx:108` scans all of `src/features` for
   `/Registry|SurfaceMap|surfaceFactory|createSurface|resolveSurface|SurfaceProvider|plugin|extension/`.**
   Task 6 builds a *register*. `DerivationRegistry` reddens a phase-02 guard. Use `DERIVATION_REGISTER`
   and `DerivationRegisterRow`; **never** the substring `Registry`.
2. **`workspace.test.tsx:116` pins `types/presentation.ts`'s export list to exactly
   `["MainSurfaceState"]`.** `TabStatus` is homed in `types/session.ts` by §6.2 and §6.3. Adding it to
   `presentation.ts` reddens that guard.
3. **`workspace.test.tsx:124` pins the single `<main`.** No new file writes one.
4. **`theme.test.ts` C7(b) is a closed allowlist over `theme.css`'s custom-property names.** Any new
   property reddens it. Every dot colour comes from an existing ramp entry — see task 4.
5. **`use-workspace-session-store.test.ts:47` forbids `let sessionSeq` / `let counter` in the store.**
6. **`session-tab-strip.test.tsx` holds two phase-03 guards over the strip's own source**: the string
   `loop={false}` must remain present, and `closeSession(` must occur exactly once. This phase changes
   neither behaviour; leave both spellings alone.
7. **Four end-to-end tests count absolute `Tab` presses** (`e2e/workspace.spec.ts` ~`:100`, `:376`,
   `:443`). **This phase adds no focusable element.** The dot is `aria-hidden` and inert; the status
   line is text. This is the hazard that produced §11.3 follow-up 18.

## Ordered tasks

1. **Implement tab status as a pure function of one session runtime record**, computed at render,
   stored nowhere. Its inputs are exactly the five §12A.3 names and nothing else. `SessionRuntimeRecord`
   gains those five fields and `TabStatus` is declared in `types/session.ts` in precedence order.

   **Four of the five inputs are presentation predicates and one is not.** "A turn is in flight",
   "carries a draft reference", "carries a current proposition" and "a turn has ever been started" are
   booleans this workspace owns. **"The kind of the latest domain result" is a backend-owned value**
   (master plan §6.3: `clarification`, `proposition`, `failed`, `created`, `recovered` — "imported,
   never re-declared"), and nothing exists to import: the backend schema phases that carry it have not
   merged, and `grep` over `src/` returns no `ProposalWorkflowState`, no `ConversationContext` and no
   `TurnResult`. **Standing rule 1 forbids authoring one, so declare an era-1 shape, not a domain
   shape** (§12A.8, master plan §6.6, standing rule 3): the union is carried with an **explicit
   temporary marker** in its name, so phase 17's seam replacement converts a marked module rather than
   discovering an unmarked literal that became a contract. An unmarked union here is the exact defect
   §12A.8 exists to prevent, and it is invisible once written.
2. **Write the precedence chain first-match-wins, in the order §12A.3 states.** Rows 5 and 6 are exact
   complements after the 2026-09-07 precision amendment — row 5 is "a turn has ever been started", row 6
   its negation — so the chain is total by construction and **needs no undeclared `else`**. If you find
   yourself writing one, the chain is wrong.
3. **Render the status twice from the same function**: the tab's dot and the agent surface's status
   line and phase label. Neither stores a value, so they cannot disagree — this settles design 03's open
   question 6 structurally, and the phase records that it did so rather than adding a synchronisation
   rule. `AgentStatusLine` is mounted by `agent-surface.tsx`; a component authored and never mounted
   makes C3(c) and C6(b) unobservable in the application.
4. **Give each status its dot from an existing theme ramp entry**, per design 04 §3.3 and §6.5A:
   `working` → `--color-accent-ink-on-dark` (`#7aa9ff`; **not** `--color-focus`, which carries the same
   value and is reserved for the focus ring), `questions` → `--color-attention`, `ready` and `created`
   → `--color-positive`, `empty` → `--color-border-elevated`, and `idle` → **`--color-fg-quiet`**,
   because design 04's `#5b5d63` was deleted from the ramp by design 01 §5 correction 1 and `theme.css`
   records that exact substitution at source (master plan §11.2 delta 18). **Add no property to
   `theme.css`.**
5. **Carry status as text.** The tab's accessible name carries the session title and the status text.
   `ready` and `created` are distinguished there whether or not the specifications later give them
   distinct dots. **There is no status note** (owner decision 19). The animated dot is hidden from
   assistive technology, and under reduced motion it does not animate **and holds at full opacity** —
   a component-level `motion-reduce:` treatment on the dot itself, never a reliance on phase 01's
   blanket `0.01ms` collapse, which settles `pulse-dot` on its `opacity: 0.25` keyframe.

   **The animation must be switched off, not overpainted, and this is not a style preference**
   (master plan §10.3A, added 2026-09-07). `globals.css`'s reduced-motion block is deliberately
   **unlayered** and carries `animation-duration: 0.01ms !important`; an animation's own keyframe
   values override normal author declarations. So `motion-reduce:opacity-100` alone **cannot** work —
   the collapsed animation still settles the dot at `0.25`, which is exactly the dim state the
   correction forbids, and the suite would be green. `motion-reduce:animate-none` sets
   `animation-name: none`, after which the `!important` duration applies to nothing and the dot holds
   its base opacity. Tailwind 4.3.3 registers the variant as
   `r("motion-reduce",["@media (prefers-reduced-motion: reduce)"])` — grounded at
   `node_modules/tailwindcss/dist/lib.js`, per charter rule 17, not assumed.
6. **Write the derivation register as a real module-level enumeration** of §12A.7's rows, each naming
   its one source. Rows whose surfaces do not exist yet are declared with their source and the phase
   that will assert them; a row is not asserted before its surface exists. See tripwire 1 for the name.
7. **§11.3 follow-up 20, one line.** In `workspace.test.tsx:100`, widen the navigation denylist so it
   matches `window.location.href = "/x"`. Nothing else in that file changes.
8. **§11.3 follow-up 17, one line.** Restore
   `test.use({ contextOptions: { reducedMotion: "no-preference" } })` on `e2e/workspace.spec.ts`'s
   correction-6 no-preference sibling (~`:217`). **No criterion row asserts this and none can** — the
   default already *is* no-preference, so removing the declaration reddens nothing, and a source grep
   for the string is the instrument shape phase 03's B1 was faulted for. Standing rule 19 is satisfied
   by the edit; it is checked by reading at review. Declare it in the Review log.
9. Closeout: contract 14 §8's impact review, tracker row **and this plan's header** (§11.3 follow-up
   21's interim rule: both cells move in the same edit), Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The six precedence rows, enumerated. One row per §12A.3 row: a session runtime record in that condition renders exactly that status and exactly that status text. (a) in flight → `working` / "Working". (b) draft reference present → `created` / "Created". (c) latest result kind `clarification` → `questions` / "Needs you". (d) current proposition present → `ready` / "Ready". (e) a turn has been started, and none of rows 1–4 matches → `idle` / "Open". (f) no turn ever started → `empty` / "Empty". Each row's record satisfies **only** that row's predicate, so the row cannot pass for a second reason. **Runner:** Vitest `node` (the view model's own project). | 6 | F10 · §12A.3 |
| **C2** | The seven §12A.3 overlap-table rows, enumerated, because six of them are rows a first-match-wins chain gets wrong silently. (a) in flight **and** a draft reference → `working`. (b) in flight **and** latest result `clarification` → `working`. (c) draft reference **and** a current proposition → `created`. (d) draft reference **and** latest result `clarification` → `created`. (e) latest result `clarification` **and** a current proposition → `questions`. (f) latest result `failed` **and** a current proposition → `ready`. (g) latest result `failed` **and** no proposition → `idle`; this is the one row of the seven where only a single chain row matches, so what it asserts is **"`failed` is not a seventh status"**, not an ordering — labelled as such in §12A.3 on 2026-09-07 and kept for that reason. Each row is its own test, so no assertion short-circuits another (charter rule 12). (h) **Named mutation:** swap rows 2 and 3 of the precedence chain in `client/view-models/session-tab.ts`, at the chain's definition; row (d) must redden and rows (b), C1(b) and C1(c) must stay green; revert. **Runner:** Vitest `node`. | 8 | F10 · §12A.3 |
| **C3** | Status is never colour-only and never stored. (a) The tab's accessible name contains the session title and the status text of its matched row — **which is also what makes `ready` and `created` distinguishable**, since their status texts differ ("Ready" / "Created"); the separate row asserting that was merged here at the pre-dispatch lint. There is no status note (owner decision 19). (b) **STRUCTURALLY HELD** — master plan §7.5, trigger **"phase 05 creates a session that can be working"**. Under reduced motion the working dot does not animate and **holds at full opacity** rather than settling dimmed. The correction ships in this phase (task 5) and is **not** held; only its proof is. §10.3A: jsdom applies no `@media` block and resolves no `var()`, so this is a Playwright subject, and Playwright has no reachable working dot until turn dispatch exists. Owner decision 21. (c) The agent surface's status line and the tab's dot are two renderings of one call on one record — asserted by mutating the record and observing both change with no intervening write. **Runner:** Vitest `jsdom`. (d) No `{status, note, unread}` record is written by any handler — **named mutation:** in `client/view-models/session-tab.ts`, store the computed status on the record, and in `components/agent/agent-status-line.tsx` **only** read that stored field instead of calling the function; row (c) must redden. Naming both the store site and the single read site is required: if *both* renderings read the stored field they still agree and (c) stays green, which is the family charter rule 15 exists for. Revert both. (e) A status derived from thread content, a string test, or elapsed time appears nowhere — a **plain check** under standing rule 18A, guarding design 10 §7's fake status engine (standing rule 2), which is a closed named set rather than an open universe. Per rule 18 it asserts that its scan had a subject. | 5 (1 held) | F10 · F6 · §12A.3 · §12A.7 |
| **C6** | The derivation register is closed, and every existing row is a function. (a) The register enumerates exactly §12A.7's rows, each with its one source. **The closure half — "a value not in it is either server-returned, or one of the two stored presentation values, or it does not exist" — is STRUCTURALLY HELD**, master plan §7.5, trigger **"phase 15's boundary audit"**: it is an absence claim over an open name universe, standing rule 18A leaves that class unrelaxed, and this phase has no instrument for it. What (a) asserts is the enumeration. (b) For every register row whose surface exists in this phase — tab status and phase label — mutating the source changes the rendered value with no intervening write. **The "session count in the header" row is not among them**: no agent header exists and none is in this perimeter; §6.2 homes `AgentHeader` in phase 06, which §7.3 already lists under F14. **Runner:** this row spans both Vitest projects — the register module is `node`, the rendered value is `jsdom`; confirm collection per standing rule 13. (c) **Named mutation:** in `components/agent/agent-status-line.tsx`, store a formatted derived value beside its source and render the stored field; row (b) must redden; revert. **Three rows merged away at the pre-dispatch lint under owner decision 18**, each recorded rather than silently dropped: "no module writes a register row's value into state" is what (c)'s probe already proves; "rows whose surfaces arrive later are declared with their one source and the asserting phase" is a completeness property of the register **document**, and is in the Notes below as an authoring obligation; and "the unread counter is the only stored presentation counter" moved to phase 05 with owner decision 20. | 3 (1 half held) | F14 · §12A.7 |
| **C7** | The shell does not become a function of what a session is doing. (a) Across every status the six-row table produces, the Agent Surface renders exactly one `complementary` and exactly one `main`, and they are the **same elements** throughout; no URL, route, or history entry changes. **Named mutation:** make the landmark element or its role depend on the status — render a different wrapper when the status is `working`; (a) must redden; revert. This **converts phase 03's held C6(d)**, whose trigger in master plan §7.5 is "phase 04 introduces derived tab status": in phase 03 the row had a degenerate subject because sessions differed only by identity and title. **Runner:** Vitest `jsdom`. (b) The navigation denylist in `workspace.test.tsx` matches assignment to `window.location.href`. **Named mutation (this is §11.3 follow-up 20's own probe):** plant `window.location.href = "/x"` in `src/app/page.tsx`; the row must redden; revert. Before task 7 it does not, which is the defect. | 2 | F30 · §12A.23 |

**Derived totals for this phase** (re-derived at source by the projection fold, 2026-09-07;
re-derive again at dispatch): **5 criteria, 24 rows** — C1 6 · C2 8 · C3 5 · C6 3 · C7 2 — of which
**2 are held** (C3(b) whole, C6(a)'s closure half), leaving **22 measurable**; and **5 named
mutations**: C2(h), C3(d), C6(c), C7(a), C7(b).

## Explicit delegations — decided by the implementer, on purpose

1. **The mechanism carrying the tab's accessible name** — an `aria-label` on the trigger, or a
   visually-hidden span inside it. Verified safe either way: `session-tab-strip.test.tsx` queries tabs
   with `getAllByRole("tab")` and never by name. **Constraint:** a visually-hidden span adds no
   focusable element (tripwire 7) and does not disturb the close button's own accessible name.
2. **The status line's and phase label's markup and placement inside the agent surface**, within
   design 03 §3.2's stated padding and border. It must be mounted (task 3).
3. **The shape of `TabViewModel`** and whether the status function is exported separately from the
   adapter, provided the two renderings call the *same* function on the *same* record.

## Notes

- **`failed` is not a seventh status.** The five domain result states are the backend's; the six
  statuses are the design's presentation vocabulary. A `failed` result changes the status only through
  rows 4 and 5, which is why the ordering resolves it and a seventh member would be a fabricated
  concept.
- **The `empty` status and the close guard are different conditions and neither reads the other**
  (master plan §9 rule 14). This phase's C1(f) is about the status; phase 05's predicate is about work
  worth confirming. A session holding a pasted, unsent brief is status-`empty` and is meaningful work.
- **Register completeness is an authoring obligation, not a criterion** (moved here from C6 at the
  pre-dispatch lint): rows whose surfaces arrive in later phases are declared in the register with
  their one source and the phase that will assert them, so the register is complete as a list before it
  is complete as a set of assertions. The reviewer checks the list; no test can.
- The register's later rows — the readiness count, a rendered money string, a leaf's provenance class,
  a pill's kind, the composer's send-enabled state, the panel's send-enabled state, the session count
  in the header — belong to phases 06, 08, 09, 10. Declaring them here is what makes phase 15's closure
  check possible.
- **Whether `created` gets a dot visually distinct from `ready`** is a reported design delta (§11.2
  delta 2); the accessible name already distinguishes them, which is what F6 requires.

## Review log

### Pre-dispatch plan lint — coordinator, 2026-09-07

Run against the tree at gate `2630f5b`, under **owner decision 18** (the MVP measurement bar).

**Defects fixed.** The plan named `components/agent/AgentStatusLine.tsx`, a PascalCase **file** path,
against master plan §6.3's own rule — "folders and files kebab-case; exported React components
PascalCase" — and against every file phases 01–03 shipped. Now `agent-status-line.tsx` exporting
`AgentStatusLine`. The derived-totals line stated **four** named mutations while listing five; a plan
that miscounts its own mutation set hands the implementer a false gate.

**Rows 39 → 34, and the cut is smaller than promised, deliberately.** The coordinator proposed a
≤25-row cap. Checked against this plan at source it does not hold, and applying it would have damaged
the phase: **22 of the 39 rows are three total case tables over derivations** — C1's six precedence
rows, C2's seven overlaps, C4's eight unread events. Charter rule 2 forbids sampling an ordered rule,
rule 6 classifies derivations as a silent-failure family, and C2 is precisely the set where a
first-match-wins chain goes wrong **silently**: each row is a pair of conditions that a mis-ordered
chain resolves to the wrong status while every isolated row still passes. Cutting there would buy a
smaller plan and a defect nobody can see. So the cut fell where rows were redundant or were
documentation wearing a criterion's clothes: C3 7 → 5 and C6 6 → 3.

**Honest note on what this buys.** Five rows is not a session. Phase 03 cost six sessions and **two of
them were coordinator artifact defects**, not process weight — a library setting grounded against the
wrong layer, and a phase state left to drift between two artifacts. The measurable lever for phase 04
is a clean dispatch, not a shorter criteria table.

### Projection round 0 consumed — coordinator, 2026-09-07

`AMENDMENTS_REQUIRED`, 24 ledger rows, 3 owner cards, zero L4 evidence spent as budgeted. Write
perimeter verified against the tree: one file, its own handoff. The four modified source files present
at its session close were the parallel styling maintenance round's, correctly identified as such and
not touched; that round has since committed as `fece065`.

**All 24 rows routed, none dismissed.** The owner answered all three cards with *"recomendations are
correct"*, recorded as decisions 19 (intention §15), 20 and 21 (master plan §11.1).

**Load-bearing claims re-verified independently at source before routing**, not reproduced from the
handoff: `SessionRuntimeRecord` is `{id, title}` and nothing else; `client/`, `components/agent/` and
any agent header do not exist; `workspace.test.tsx:100`'s regex still misses `location.href`;
`e2e/workspace.spec.ts:217` still rests on Playwright's default context; and `theme.css`'s
`pulse-dot` opens **and closes** at `opacity: 0.25`, so the blanket collapse settles it dimmed.

**Four coordinator additions, three of which the projection did not reach.**

1. **L3 needed no choice, and the projection offered one.** It routed the non-partitioning rows 5 and 6
   as "row 6 as the chain's `else`, or the missing case named". Neither: §12A.6 already states, in
   ratified text, that row 6 is "the negation of input (1) alone", and input (1) is "a turn has ever
   been started". That forces row 5 to be exactly that predicate, so the repair is a precision
   amendment in which **no previously decidable record changes value**. It also dissolves L4's other
   half — under the old wording C1(e)'s only constructible fixture was C2(g)'s fixture; under the
   amended wording a record with a started turn and no result at all distinguishes them.
2. **A perimeter-vs-guard collision, the class this project has paid for before.** Phase 02's C5(b)
   scans **all** of `src/features` for `/Registry|SurfaceMap|…/`, and this phase's task 6 builds a
   *derivation register*: the natural symbol `DerivationRegistry` turns the suite red in
   `workspace.test.tsx`, a file this perimeter does not contain. Two neighbours in the same file —
   `presentation.ts`'s pinned export list and the single `<main` — and a fourth in `theme.test.ts`. All
   are now tripwires above.
3. **The `idle` dot has no colour.** Design 04 §3.3 gives it `#5b5d63`; design 01 §5 correction 1
   deleted that value, and `theme.css` records the substitution onto `--color-fg-quiet` at source.
   Adding a property to the theme layer reddens phase 01's closed allowlist, also outside this
   perimeter. Task 4 now names every dot's ramp entry; §11.2 delta 18.
4. **Owner card 2 orphaned a ledger entry, and the card did not say so.** §7.3 listed F11 as served by
   phase 04 alone. Moving the unread counter to phase 05 leaves F11 served by **no phase** unless the
   row moves too. It does.

**Routed as written:** L1, L2 (the era-marked presentation shape and its marker), L5 (card 2), L6
(card 3, correction site named), L7 (card 1), L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18
(runners named on every criterion), L19, L20, L21 (the duplicated `Review log` and `Notes` headings
merged in this rewrite), L22 (moved to phase 05 with task 7), L23 and L24 (now explicit delegations).

**L11 routed further than proposed.** The projection re-pointed C5(c)'s probe from C6(a) to C6(b),
which is right, but left it naming a store site and no read site — the same defect it had just found in
C3(d) at L12. Storing a value that nothing reads changes no rendered output and reddens nothing. The
row moved to phase 05 with C8, and its probe there names both sites.

### Session-tabs styling maintenance round consumed — coordinator, 2026-09-07

Out of band, visual only, behaviour frozen; `55cdc63`. Recorded here because it changes the tree this
phase dispatches against and because two of its findings bind this phase's tasks. Perimeter verified
(two source files, no test touched, cited blobs matching `HEAD`), five tripwires re-verified, and its
own flagged claim re-checked by variation rather than accepted — see master plan §11.1.

**What it changes for phase 04.** The strip's visual box moved from the trigger to the wrapper, the
dot is now 7px and carries a comment naming design 04 §3.3 and this phase as the owner of its colour,
and the strip's typography and ink now render as specified for the first time. Task 4's ramp mapping
and every tripwire above were re-checked against the restyled file and are unchanged.

**Two findings that bind tasks here.** `globals.css`'s base rules moved into `@layer base` while the
reduced-motion block stays deliberately unlayered — which is what makes task 5's
`motion-reduce:animate-none` load-bearing rather than stylistic. And a component reading an
**undeclared** custom property renders `currentColor` silently, which is how a near-white hairline
shipped through phase 03's review and approval; task 4 names every dot colour at its declared ramp
entry for exactly that reason (master plan §10.3A, §11.3 follow-up 24).

**What this phase does not measure, stated so no one reads a green suite as more than it is:** the
register's closure claim (held for phase 15), the reduced-motion pulse (held for phase 05, the
correction itself shipped), and the badge/dot legibility at the strip's minimum width (§11.3 follow-up
23 — dropped rather than moved, because none of the three reasons it was unwritable is fixed by
changing phase).
