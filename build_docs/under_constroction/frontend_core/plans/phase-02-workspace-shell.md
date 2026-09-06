# Phase 02 — Persistent shell: landmarks, divider, narrow width, containment

| | |
|---|---|
| **State** | `IMPLEMENTED` — round 1, 2026-09-06, Codex; unit 154/154, E2E 49/49, 11/11 named mutations executed and reverted |
| **Criteria** | 6 |
| **Projection** | **not waived** — mandatory: C5 makes open-universe absence claims, a charter rule 6 silent-failure mechanism. Master plan §7.2, which moved 02 to its mandatory list on 2026-09-06 |
| **Serves** | F30 · F26 · F29 (A row 4) · F24 · F6 |

## Goal

Build the persistent split workspace shell: one structurally fixed Agent Surface, one
session-controlled Main Application Surface, one user-controlled divider, and the Proposal
Preparation **idle** state the surface shows when there is nothing yet. Establish the shell's
structural invariants and the containment perimeter that keeps owner decision 11's
abstraction from becoming speculative infrastructure.

**Not in this phase:** sessions, a tab strip, a thread, a composer, any result rendering, any
retained context, and any restoration. The Main Application Surface renders exactly one state
here — idle — and phase 14 makes it a function of the session record.

## Read first

- Master plan §6.1 (feature folder, client boundary, store ladder — the boundary decisions this
  phase enacts), §6.2, §6.4, §9, §10.4.
- Intention §1 (the shell model and its diagram), §5.1, §6 (must-ship and the deferred list —
  the deferred list is this phase's containment perimeter), §12A.19, §12A.22 (A) row 4 and
  "What the idle state is, and is not", §12A.23 **in full**, §12A.17 (the divider-reset focus
  row), §14.3 items 2, 3, 5a.
- `ui_design/02-workspace-shell.md` in full; `ui_design/10-design-integration-guide.md` §7
  ("Discarded product decisions" and the architecture blocklist).
- Contracts: `02-runtime-boundaries.md` §1–§3, §5; `03-feature-architecture.md` §1–§4;
  `05-client-architecture.md` §2, §5, §7; `15-ui-styling-and-component-system.md` §1, §3;
  `12-anti-patterns.md` "Components and client", "Structure and abstraction";
  `11-testing-principles.md` §2–§3; `16-design-prototype-porting.md` §3–§5 (this phase is a
  prototype port and §12A.23 anchors part of its prohibition on `16 §5`);
  `14-documentation-principles.md` §8 (task 9); `13-decision-checklist.md` §5 (this phase creates
  six new modules). *(The last three added by the projection, ledger L22.)*

## Dependencies

Phase 01 `APPROVED`. The theme layer and the repaired test collection are preconditions: this
phase writes the project's first component tests.

## Files expected to change

```
src/app/page.tsx                                             edited — renders <ProposalWorkspace />
src/app/layout.tsx                                           edited — skip link to the main content
src/features/proposal-preparation/components/workspace/       new — ProposalWorkspace, AgentSurface,
                                                                    MainApplicationSurface, WorkspaceDivider
src/features/proposal-preparation/components/idle/            new — ProposalPreparationIdleSurface
src/features/proposal-preparation/components/workspace/constants.ts  new — the §6.4 constants
src/features/proposal-preparation/hooks/use-divider-width.ts  new
src/features/proposal-preparation/types/presentation.ts       new — MainSurfaceState
e2e/workspace.spec.ts                                         new — replaces e2e/bootstrap.spec.ts
e2e/bootstrap.spec.ts                                         deleted
src/styles/theme.test.ts                                      edited — phase 01's C6(a)/(c) guard retired (task 8)
README.md                                                     edited — current-state statements this phase makes stale (task 9)
```

*(The last two rows were added by the coordinator's pre-dispatch lint on 2026-09-06 — see the
Review log. `src/styles/theme.test.ts` reads `e2e/bootstrap.spec.ts` from disk, so deleting that
spec without retiring the guard cannot close green.)*

## Ordered tasks

1. **Draw the client boundary where master plan §6.1 fixed it.** `src/app/page.tsx` stays a
   Server Component and renders `<ProposalWorkspace />`; the `"use client"` directive goes on
   the workspace root and nowhere above it. Record in the Review log that no server-rendered
   content exists to compose in V1, which is why the boundary is the surface.
2. **Render the two landmarks, once each and for the page's lifetime.** One complementary
   region with an accessible name for the Agent Surface, one `main` for the Main Application
   Surface. Neither is remounted by anything.
3. **Build the divider as a real separator.** *Contract resolution, recorded here because two
   contracts in the Read-first list appear to forbid what design 02 §5 prescribes (projection
   ledger L6, guide §6 — surfaced, never silently chosen):* contract 05 §7 forbids click handlers
   on `div`s and contract 12 forbids "hand-rolled ARIA on a `div` reproducing a native control's
   semantics". Neither bites here, because **the platform provides no focusable, valued
   separator** — there is no native element with `separator` semantics and a value, and intention
   §6 defers a resizable-pane library, and no Radix primitive models a splitter. Contract 15 §5's
   "when none exists" clause therefore governs and the divider is project-owned. The element is a
   non-semantic element carrying `role="separator"` and `tabindex="0"`; it reproduces no native
   control, so contract 12's prohibition is not weakened by this phase. **The Review log records
   this resolution and the reviewer checks it rather than re-deriving it.** Its required shape:
   `role="separator"`, vertical orientation, an
   accessible name, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` where the maximum is the
   *effective* maximum recomputed on viewport change, keyboard-focusable, with design 02 §5's
   keyboard model — arrow steps, shifted arrow steps, `Home`, `End`, and reset — and a visible
   focus indicator. Use pointer events so pen and touch drags work; widen the **hit area** to at
   least the value design 02 §4 requires while keeping the visible seam. Announce the reset
   politely; never announce a drag pixel.
4. **Implement the clamp as design 02 §3.2 states it**, including its ordering: the agent
   minimum wins over the main-pane minimum. Constants live in one module —
   `components/workspace/constants.ts` — and criteria assert the contract, not the literal (master
   plan §6.4). Width is page-lifetime state: re-clamped on viewport change, **never persisted** in
   any form. **The clamp is exported as a pure function of `(requested, containerWidth)`, and
   `use-divider-width` receives the container width as an argument** (projection ledger L4). This
   is not a style preference: jsdom performs no layout and ships no `ResizeObserver`, so a hook
   that measures its own container computes every width from `0` and C3 becomes unmeasurable.
   Splitting the seam this way puts the arithmetic in `node`/`jsdom` and leaves only the observer
   wiring to the browser. Do **not** stub `ResizeObserver` in `vitest.setup.ts`: that file is not
   in this phase's perimeter, and a stub would make the test environment assert a layout it cannot
   perform.
5. **Satisfy the narrow-width invariant by construction**: no fixed pixel width on a content
   column, no reading the window width during render (the container width arrives as an argument,
   per task 4), and every pane's own scroll where design 02 §4 gives it one. Note for the drag
   path: jsdom implements no `setPointerCapture`, so any component test that fires a pointerdown
   through a handler calling it will throw — the drag belongs in the browser (master plan §10.3A).
6. **Build the idle Main Application Surface** as the Proposal Preparation experience's own
   no-proposition state: an honest empty state. It is **not** a proposal list, a dashboard, a
   statistics strip, a session history, a route, or a second surface. Its visual treatment is a
   reported design gap (master plan §11.2 delta 8) — leave a marker and report; do not invent a
   design.
7. **Establish the containment perimeter** as a source-level check with planted probes, over
   §12A.23's forbidden list. **How these instruments are built, stated in the task because that is
   what an implementer reads before writing one** (master plan standing rules 17 and 18, both
   earned by this phase's round 1): every row here asserts an absence over an open universe, so
   **each is an allowlist** — enumerate what is permitted and fail on anything else — and a
   denylist is admissible only where the row records its limit and a companion allowlist carries
   the real weight. **Every scanner reads file contents, and asserts that its scan had a subject**
   before asserting anything about what the subject does not contain: round 1 shipped two scanners
   that matched their denylists against a joined list of file *paths*, and both passed with the
   forbidden constructs planted. **Four of its five bullets are measured lexically (C5 (a)–(d)); the
   fifth — "a shell-level abstraction introduced because decision 11 named the surface
   generically" — is a judgement, not a lexical property, and is therefore *reviewed, not
   tested*** (projection ledger L17). The Review log records the reviewer's judgement on bullet 5
   by name. The word "closed" is dropped from this task's claim: the list is closed, the
   *instrument* is not, and leaving the claim broader than the instrument is the defect this
   correction removes.
8. **Replace the end-to-end spec** with `e2e/workspace.spec.ts` asserting the two landmarks, the
   skip link, and keyboard reachability of the main content. Delete `bootstrap.spec.ts`. **Retire
   phase 01's C6(a)/(c) guard** — the `describe("C6(a)/(c): …")` block in `src/styles/theme.test.ts`
   that reads `e2e/bootstrap.spec.ts` and asserts it names no landmark or skip link. Its subject is
   deleted by this task and its assertion is the negation of this phase's C1; delete exactly that
   block and nothing else in the file (its imports stay in use by the other checks). Carry the
   phase-01 rows C2, C3(a) and C7(a) that `bootstrap.spec.ts` discharged into `workspace.spec.ts`
   **unchanged in substance**: they are phase 01's approved evidence and this phase relocates them
   because it retires their host file, not because it owns them. **Their *assertions* are what stay
   unchanged; the mechanism each uses to reach its subject may change, and every change is recorded
   in the Review log** (projection ledger L18). Known instance: phase 01's C2(a) reaches its focus
   probe with a single `Tab` *because* `page.tsx` renders nothing focusable — its own comment says
   so — and this phase puts a skip link ahead of it. Also carry the spec's first test ("renders the
   document title with no client or server error"): it is the end-to-end suite's only assertion
   that `/` renders with no page error, and it costs one navigation (ledger L19). **Why so much of
   this phase lives in Playwright, stated because contract 11 §2–§3 reserves end-to-end for
   critical user flows:** master plan §10.3A — no configured Vitest project here can measure a
   rendered document's layout, computed style, or media state, so landmark, skip-link, width and
   reachability assertions have no lower rung to sit on (guide §2 step 6; ledger L23).
9. Closeout: contract 14 §8's impact review, tracker row, Review log. Known in advance (master plan
   §10.2 caveat 4's reading: "every document this phase's change makes stale"): the root
   `README.md`'s status paragraph and "Current scope" bullets ("a bare root layout, a neutral `/`
   route"), its tree-diagram entry for `src/app/` ("neutral root route"), its
   `src/features/proposal-preparation` sentence ("exists today only as phase 01's test-collection
   sentinels"), and its Playwright bullet naming `e2e/bootstrap.spec.ts`. **Follow-up 10's README half is already discharged and is struck from
   this task** — phase 01 patched that clause, so the statement it describes no longer exists
   (projection R3, ledger L21). What *is* stale and does land here, under the same routing rule, is
   a statement neither found before: `README.md`'s Proposales section says the application's use of
   the API "will be documented in `src/lib/proposales/README.md` **once the adapter exists**",
   while that README and `src/lib/proposales/client.ts` both exist today (backend phase 3, merged) —
   a current-state falsehood under contract 14 §1, registered as master plan §11.3 follow-up 14.
   The contracts-README half of follow-up 10 stays where it is: this phase does not patch that
   document. The impact review also covers what this list does not
   name.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The shell renders exactly one complementary region and exactly one `main`, both named, both present from the first render, and both the **same nodes** throughout. (a) Exactly one element with the complementary role, carrying an accessible name **the shell owns** — intention §12A.23's landmark-name clause, added 2026-09-06: the name is a label on the landmark or a shell-owned heading, never text drawn from the state the surface currently presents, and this row asserts that stable name. The same holds for the `main` (review S4: round 1 named the `main` from the idle heading, which no check available to this phase could catch and which phase 14 would have broken). (b) Exactly one `main`. (c) `src/app/page.tsx` carries no `"use client"` directive and the directive appears on the workspace root. (d) The skip link is the **first tab stop** of the document and is visible once focused (projection L20 — the skip link was asserted by task 8 and traced to no row, which is an orphan test under charter rule 16). (e) Activating the skip link moves focus into the `main`. (f) **Node identity across this phase's one state change** (projection L14, F30's middle clause): after a keyboard divider resize, the complementary region and the `main` are the same DOM nodes as before it — task 2's "neither is remounted by anything" measured rather than asserted in prose. (g) Planted-defect probe: add a second `main` inside the Main Application Surface, observe (b) redden, revert. (h) Planted-defect probe: add a second complementary region, observe (a) redden, revert (projection L13 — (b) was probed and (a) was not). (i) **Planted-defect probe, required by review B6:** force both landmarks to remount on a divider width change, observe (f) redden, revert. (f) shipped round 1 with no probe of its own, and its browser twin selected `[role="complementary"]` against an `<aside>` that carries the role implicitly — so it compared `null` with `null` and could not fail. A row asserting identity states **how it selects the node** and asserts the state change actually happened before comparing. | 9 | F30 · §12A.23 · `02 §1–§2` |
| **C2** | The divider is a real separator with design 02 §5's keyboard model. (a) It exposes the separator role, vertical orientation, an accessible name, and current, minimum and maximum values. (b) The maximum is the **effective** maximum and is recomputed when the viewport changes — asserted at two viewport widths whose effective maxima differ. (c) **Eight rows, one per keyboard interaction**: arrow decrease, arrow increase, shifted decrease, shifted increase, `Home`, `End`, **`Enter` reset, `Space` reset** — design 02 §5 names both reset keys and charter rule 2 enumerates rather than samples (projection L10). Each row asserts the resulting width against the clamp contract, never a literal, **and** that focus is still on the divider afterwards. *(The plan's former (e) — "focus stays on the divider across every interaction in (c)" — is folded into these eight rows rather than sampled in one: it is the same interaction's outcome, and one row per interaction is what lets a probe bite a single one.)* (d) Reset announces politely, exactly once; a drag announces nothing. The absence half shares its instrument with the presence half **in the same row**, which is what makes it mean something (projection F6 — recorded so nobody "fixes" it into two rows). (e) The divider is reachable by `Tab` from the start of the rendered document, with no pointer — the granted meaning of "operable without a pointer", which (c) does not assert (projection L12). (f) **Double-click reset** (design 02 §3.1 and §5, covered by no row before the projection — L11): a double-click on the divider resets it to the default width and announces politely exactly once. **(d) and (f) count announcements; they do not assert text.** Review B8: a live region holding one constant string cannot distinguish one announcement from three, and round 1's rows passed with the reset announcing three times and with an announcement added to every arrow step. The instrument is an observer installed **before** the interaction that counts mutations of the live region: exactly 1 for a reset, exactly 0 for a drag and for every non-reset keyboard step. (g) **Two consecutive resets produce two announcements** — review S1, a product defect the counting instrument surfaced: round 1 set the same literal every time and never cleared it, so the DOM never mutated again and every reset after the first was silent to assistive technology. (h) **Planted-defect probes, required, three:** announce twice on a reset, observe (d) and (f) redden, revert; announce on an arrow step, observe (d)'s absence half redden, revert; and hold the effective maximum at its pre-measurement value, observe (b) redden, revert — (b) shipped round 1 reading the maximum before the observer had fired, comparing two viewports whose effective maxima are in fact identical, and would have passed in its broken form forever. | 15 | F26 · F6 · F24 (divider-reset row) · §12A.19 |
| **C3** | The clamp is the specification's arithmetic, including its ordering. (a) A requested width below the agent minimum resolves to the agent minimum. (b) A requested width above the agent maximum resolves to the agent maximum. (c) At a viewport where the main-pane minimum and the agent minimum cannot both hold, **the agent minimum wins** and the main pane is squeezed — the ordering row, stated because the opposite ordering is the natural implementation and is wrong. (d) A viewport change re-clamps an already-set width. **Constraint on every row in this criterion, not a row of its own** (review N5, and the reason it is stated here): each row asserts the width against the named constants' contract, never against their literals. Round 1 turned this into a test comparing the constants to each other, which is not what it says; a property of the other rows cannot be discharged by a test. (e) Planted-defect probe: reverse the clamp's ordering, observe (c) redden, revert. **These five rows are measurable only because task 4 exports the clamp as a pure function of `(requested, containerWidth)`** — projection L4 and F2: with the hook measuring its own container, every width in jsdom computes from `0`. | 5 | F26 · §12A.19 · charter rule 13 |
| **C4** | All five §12A.19 conditions hold at every width in the named test set (`NARROW_WIDTH_TEST_SET`, master plan §6.4), **measured in Playwright** — master plan §10.3A and projection F3: jsdom performs no layout, `getBoundingClientRect()` returns literal zeros and `clientWidth`/`scrollWidth` are `0`, so not one of these conditions is observable in Vitest (projection L3). **Owner decision 14 fixes the V1 floor at the specification's lower stated threshold, so the set has three distinct widths**: the designed wide width, 1100px, 780px. **One row per condition per width — fifteen rows, not three**: five conditions behind a single assertion short-circuit, and no probe can then bite a named one (projection L9, charter rule 12). The conditions: (1) the document does not scroll horizontally; (2) no pane's content overflows its own pane horizontally, except inside a container that **declares** its own horizontal scroll — the exception is recognised by that **authored** declaration or a deliberate opt-in marker, **never by a computed value** — CSS forces `overflow-x` to compute to `auto` whenever `overflow-y` is not `visible`, so a computed-style check exempts every vertically scrolling pane, which is what round 1 shipped and why a 4000px block planted in the agent pane left all three rows green (L9; intention §12A.19 condition 2, amended 2026-09-06; review B3); (3) every interactive element of this phase is reachable and operable by keyboard; (4) no text node is clipped to zero rendered width, and any elided text keeps its full value in the accessible name — **the row asserts its subject exists at that width first** (at least one candidate element where `scrollWidth > clientWidth`) and reads the **accessible name**, not the raw attribute; if nothing in the shell elides at a width, the condition is **recorded as unmeasured there**, exactly as condition 1's permanent green is recorded, and planting an element to give it a subject is not permitted (intention §12A.19 condition 4, amended 2026-09-06; review B5 — round 1's only candidate measured `scrollWidth === clientWidth` at all four widths tested); (5) the agent pane is never rendered below its stated minimum. **Recorded limit — condition 1 cannot fail in this shell**: design 02 §2's root `overflow:hidden` suppresses the document's own horizontal scroll by construction, so condition 1 is asserted but no mutation can redden it, and a fixed-width column surfaces in condition 2 instead. Its permanent green is not evidence, and is named here so it is not read as any (projection F4; intention §12A.19's named mutation was corrected upstream for the same reason). **Every one of the fifteen rows sets its own viewport** (review B4, master plan §10.3A): a parameterised test that never calls `page.setViewportSize` measures the runner's 1280 default whatever its title says, and round 1 shipped conditions 3 and 4 that way at all three widths. **Planted-defect probes, four, each naming the condition and the width it bites:** (e) a content column gets a fixed width instead of a maximum → condition 2 reddens at 780px — **and the red must be a property of the instrument, not of one site shaped to produce it** (review S5): condition 2 measures every content column against its pane, so the probe reddens without a layout property added for its benefit; (f) the divider loses its `tabindex` → condition 3 reddens at all three widths; (g) elided text's accessible name is replaced by its truncated string → condition 4 reddens at 780px; (h) the clamp is allowed to resolve below the agent minimum → condition 5 reddens at 780px. | 19 | F26 · §12A.19 |
| **C5** | The V1 containment perimeter holds, and its check can observe a breach. Every absence row here is over an open universe, so each names its instrument, and a denylist row records its limit inside the criterion (phase-01 review lesson; master plan §6.5A's allowlist rule). (a) No router, route, URL segment, query parameter, history entry, or navigation event exists for a workspace surface. **Instrument:** an allowlist — the route files under `src/app/` are exactly `layout.tsx` and `page.tsx` — plus a denylist over `src/app/**` and `src/features/**` source: no import from `next/navigation` or `next/link`, no `useRouter` / `usePathname` / `useSearchParams`, no `history.pushState` / `history.replaceState`, no assignment to `window.location` or `location.hash`. Recorded limit: a navigation mechanism outside that list is not observed by this row. (b) No surface registry, surface map, surface factory, provider that resolves a surface, plugin point, or extension point exists. **Instrument:** a denylist over `src/features/**` source for the identifier fragments `Registry`, `SurfaceMap`, `surfaceFactory`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin`, `extension`. Recorded limit: a registry under a name outside that list is caught only by (c) or (d). (c) No discriminant whose domain is "which application surface" exists. **Instrument:** an allowlist — `types/presentation.ts` exports exactly the type names master plan §6.3 assigns to it (in this phase, `MainSurfaceState` alone; a later phase amends the list when it adds §6.3's other members), and `MainSurfaceState`'s members are exactly `creating`, `created`, `review`, `idle` — §12A.22 (A)'s four rows, asserted as a **set equality over the module's exported names and over the union's members**, covering `type`, `interface`, `enum`, `const` map and re-export forms, not as a regex over one syntactic form and not as an ordered occurrence (review S2: round 1 caught only `export type`, and an `enum`, an `interface`, a constant map and a fifth union member all passed together) — so it is a state discriminant inside the one surface and no other exported type in that module can carry a surface-kind domain. (d) No second Main Application Surface, dashboard, analytics surface, product library, customers or settings surface, proposal list, or session-history surface exists. **Instrument:** an exact count — exactly one module under `src/` renders a `main` element, and it is `MainApplicationSurface` — plus a denylist over file and exported-component names under `src/app/**` and `src/features/**` — **which round 1 did not implement at all, shipping only the count half** (review S3), so a module exporting `Dashboard`, `ProposalList` and `SessionHistory` passed: `Dashboard`, `Analytics`, `Statistics`, `ProductLibrary`, `Customers`, `Settings`, `ProposalList`, `SessionHistory`, `Archive`. Recorded limit, two: a second surface under a noun outside that list is caught only by the `main` count; and the count itself is **lexical**, so a `main` produced by `React.createElement("main", …)` or by a computed tag is not observed by it (projection L16 — (a) and (b) already record their limits and (d) did not). (e) **Planted-defect probes, required, four — one per row, because a row whose instrument is a list needs one and round 1 shipped (a) and (b) blind** (review B2): plant a complete navigation stack in `src/app/` source, observe (a) redden, revert; plant a surface registry module under `src/features/` exporting a registry, a factory, a resolver and a provider, observe (b) redden, revert; and the two the criterion already carried — add a construct **outside the instrument's own syntax** — an `enum` or a constant map whose domain is surface kinds — to `types/presentation.ts`, observe (c) redden, revert (a second `export type` is not an admissible probe for this row: it is the one form round 1's regex caught); and add a second module under `src/features/` that renders a `main` element, observe (d) redden, revert. | 5 | F30 · §12A.23 · `12` "Structure and abstraction" |
| **C6** | The idle Main Application Surface renders the Proposal Preparation experience's own no-proposition state. Every absence row here names its instrument and ships a probe — the discipline C5 already carries, extended to C6 by the projection (L7); C5's preamble bound only C5, while standing rule 8 and charter rule 15 bind these identically. (a) It renders an honest empty state with no proposition, no list, no statistics and no navigation. **Instrument: an allowlist** — the idle subtree's accessible tree contains exactly the roles this state is allowed to have (a heading and its supporting static text) and no other role at all; a denylist of forbidden nouns here would prove only that its own list matches itself (master plan §6.5A's rule, earned in the phase-01 review). (b) It renders inside the single `main`, without replacing it. (c) It offers no affordance that changes the URL or mounts a route. **Instrument:** no element in the idle subtree carries the `link` role or an `href`, plus a denylist over the idle module's own source for `next/link`, `useRouter`, `history.pushState`/`replaceState` and assignment to `window.location`. Recorded limit: a navigation mechanism outside that list is caught only by (a)'s allowlist, and only if it renders a role. (d) **First render moves no focus**: after the shell's first render, no element inside the idle subtree holds focus (projection L8 — the plan's "entering it" is activation, which does not exist until phases 03/14, so the row is restated as a property of the only event this phase has). (e) **First render carries no announcement of its own**: the idle subtree contains no `aria-live` node and no `role="status"` or `role="alert"` element. (f) Planted-defect probe: add an `aria-live` region inside the idle subtree, observe (e) redden, revert. (g) **Planted-defect probe: plant a construct that appears in no plausible forbidden-noun list** — a table, a button and an image — observe (a)'s allowlist redden, revert. **A list is not an admissible probe here** (review B1 and its lesson): round 1's plan said "add a statistics list", a list is a member of any denylist a reader might write, and the probe was therefore satisfiable by the denylist the row forbids. A probe for an allowlist row must plant something the denylist would have missed. | 7 | F29 (A row 4) · F30 · §12A.22 |

**Derived totals for this phase:** 6 criteria, **60 rows** (C1 9 · C2 15 · C3 5 · C4 19 · C5 5 ·
C6 7), **17** named mutations (C1 3 · C2 3 · C3 1 · C4 4 · C5 4 · C6 2 — C1(g)–(i), C2(h)'s three,
C3(e), C4(e)–(h), C5(e)'s four, C6(f), C6(g)). **Re-derived on 2026-09-06 when the coordinator
consumed review round 1**: +1 row and +1 mutation on C1 (the identity probe B6 requires), +2 rows
and +3 mutations on C2 (the counting instrument, the two-resets row, the three probes B8 and B7
require), −1 row on C3 (the row that was a constraint on the other rows), +2 mutations on C5 (the
two rows that shipped blind). No criterion changed what it measures; every addition is an
instrument or a probe the round proved was missing. Re-derived by the coordinator on 2026-09-06 when it
consumed the projection, from the criteria table above. **The rows nearly doubled and the phase's
product scope did not move by one line**: the growth is enumeration replacing conjunction (C4's
fifteen condition-rows in place of three rows asserting five things each; C2's eight keyboard
rows), plus five rows for things the plan asserted in prose and measured nowhere (the skip link,
node identity, the double-click reset, and C6's two restated rows) and four probes for guards that
shipped without one. C2 carries no named mutation and that is deliberate — its only absence claim,
(d), shares a row with the presence half that proves the instrument works (projection F6).
Re-derive at dispatch.

## Notes

- **The narrow-width mechanism itself is a design delta** (master plan §11.2 delta 5). This
  phase implements a mechanism that satisfies C4 and reports what it chose; it does not settle
  the design question of whether the agent pane should yield first.
- Design 02's `window.innerWidth` read during render, its `mousemove`/`mouseup` closure drag,
  and the hover navigation rail with its hot-zones and pin toggle are all prototype-only and
  are the blocklist this phase must not touch.
- The idle state's **visual** treatment is unresolved by design (delta 8). Implement an honest
  empty state, leave a marker, report. Filling it with anything from design 10 §7's excluded
  list is the failure this note exists to prevent.
- Pane width is never persisted: no `localStorage`, no cookie, no URL parameter, and no store
  shape justified by future serialisation (contract 05 §5.2, intention §7).
- **The skip link is specified by no artifact** (projection L20). C1(d)/(e) fix what it must *do*;
  its label, its target id and its visually-hidden-until-focused treatment are delegated to the
  implementer in writing and recorded in the Review log. **Naming trap:** design 01's "skip links"
  ramp rows are the clarification panel's *skip a question* links — a different meaning of the same
  word (§6.3, one meaning per name). This skip link takes no value from those rows.
- **The narrow-width floor is 780px** (owner decision 14, intention §12A.19 and §15). The test set
  therefore has three distinct widths, and below-floor non-corruption is **not measured in V1** —
  master plan §11.3 follow-up 13 records that limit rather than leaving it implied.
- **Carried from the phase-01 review (N4).** The theme layer declares **no transition or easing
  value**, and design 01's open question 3 (hover easing) is unresolved. Design 02 §6 says "consider
  a single 120ms eased transition" on reset — that is a suggestion this phase does **not** take: it
  adds no transition, no easing, and no theme value. A phase that wants one amends master plan
  §6.5A first (standing rule 4).
- **Phase 01's guards bind this phase's code.** C1(a)'s scanner rejects raw hex, `text-[…px]`,
  `rounded-[…]` and `shadow-[…]` literals in any `src/**` source; C7(b)'s allowlist rejects any
  custom property name not in design 01's ramps, so this phase **adds no name to `theme.css`** —
  every colour it needs (`--color-bg-agent-pane`, `--color-bg-resize-active`, `--color-accent`,
  `--color-border-hairline`, `--color-border-control`, `--color-focus`) already exists; C5(b) keeps
  `src/components/ui/` empty. Layout dimensions (the seam width, the hit area, the grip) are
  Tailwind spacing utilities or the runtime-computed inline width, never theme values (§6.5A's
  eight ramps carry no spacing).

## Review log

**2026-09-06 — coordinator (Claude Fable 5.1), pre-dispatch plan lint, before projection.**
Written while the Fable window 01 authorization stood; the window was withdrawn unexecuted the
same day (master plan §3A) and this lint survives it unchanged, as normal-route coordinator work.
Five manifest properties checked at source; four folds applied to this plan,
none changing product semantics:

1. **Count.** The named-mutation total read "4" while the criteria table carries five: C4's own
   text names a planted-defect probe. Re-derived with per-criterion summands (C1 1 · C3 1 · C4 1 ·
   C5 2 = **5**); C4's rows lettered (a)–(e) so the probe is addressable. Row total 30 confirmed
   (4 + 6 + 6 + 5 + 5 + 4).
2. **Perimeter-vs-guard collision.** `src/styles/theme.test.ts` (phase 01, C6(a)/(c)) reads
   `e2e/bootstrap.spec.ts` from disk and asserts it names no `main`, no `banner` and no skip link.
   This phase deletes that file and asserts exactly those things, so the guard throws or reddens
   in a file the plan did not permit anyone to touch. Folded: the file joins the perimeter and task
   8 retires that one block. The phase-01 rows the deleted spec discharged (C2, C3(a), C7(a)) are
   relocated into `workspace.spec.ts` unchanged, so phase 01's approved evidence survives.
3. **Standing instructions naming this phase.** Master plan §6.2 (skip link, spec replacement),
   §6.4 (the four constant groups), §11.3 follow-up 4 — all already in the plan. Follow-up 10
   routes its README half to "the next phase that patches either document"; this phase patches
   `README.md`, so task 9 now carries it, together with the README statements this phase's own
   change makes stale.
4. **Open-universe absence rows state their instrument** (the lint step adopted from phase-01
   review round 1): C5(a)–(d) each now name allowlist or denylist and a denylist row records its
   limit; C5(e)'s two probes are stated against the instruments they must redden.

Also carried into the Notes: phase-01 review N4 (no easing value exists; design 02 §6's reset
transition is not taken) and the phase-01 guards this phase's code must satisfy. Every path in
"Files expected to change" exists or is marked new; every cited section resolves and says what the
plan claims; every trace cell carries a `F`/`§12A` anchor. The V1 floor and the designed wide
width of `NARROW_WIDTH_TEST_SET` are **not numerically fixed by any authority** (design 02 §3.3
states the two thresholds only) — left for the projection to classify rather than pre-empted here.
Sizing: 6 criteria, within the charter's target.

**2026-09-06 — coordinator, after the Fable window 01 withdrawal.** The owner withdrew the
autonomous window for phases 02–05 before any part of it ran, on cost grounds, and returned
phases 02–05 to the normal per-phase route (master plan §3A "Withdrawal", gate log §11.1). Three
edits to this plan, none touching product semantics, criteria, rows or mutations:

1. The **Projection** header cell no longer derives from the window. The gate stays **not
   waived**, now on this phase's own property: C5 asserts what the shell does not contain over an
   open name universe, which charter rule 6 classifies as a silent-failure mechanism. Master plan
   §7.2 was corrected accordingly — 02 moved from its waivable list to its mandatory one — rather
   than this plan carrying a local exception.
2. The pre-dispatch lint entry above keeps its actor, which is who really wrote it, and loses the
   window's forward-looking actorship sentence: no session in this phase is coordinated,
   implemented or reviewed by a window sub-context.
3. Nothing else in the lint is disturbed. Its four folds are route-independent; fold 4 in
   particular (every open-universe absence row names allowlist or denylist) is the phase-01 lesson
   and is exactly why this phase's gate is mandatory.

The compiled projection prompt at `prompts/reviewer/phase-02-projection-round-0.prompt.reviewer.md`
survives with the same correction and is the owner's to run.

**2026-09-06 — coordinator, consuming projection round 0 (`AMENDMENTS_REQUIRED`, 27 rows, 1 owner
card).** Perimeter reconciled against the tree before anything was trusted: the handoff is the only
file the session added, no source, config, plan, intention, contract or design specification moved,
and the declared zero-L4 budget was spent as declared. Its load-bearing environment findings were
re-verified independently at source rather than accepted — jsdom 30.0.1's
`getBoundingClientRect()` literal zeros and `client*`/`scroll*` `return 0` (`Element-impl.js`), the
**absence** of both `ResizeObserver` and `setPointerCapture` from all of `node_modules/jsdom/lib/`,
`vitest.setup.ts`'s three real installs, the exact block task 8 retires (`theme.test.ts:497–504`,
with the bindings it shares with the `C4(e)` block above it still in use), the three README
statements, and that no module under `src/` renders a `main` today. All held.

**All 27 rows routed; none dismissed.** One upstream, sixteen into this plan, nine granted as
written delegations, one struck as already discharged.

| Rows | Routing |
|---|---|
| L1 | **Upstream, never patched here.** Owner card 1 → owner **decision 14**: the V1 floor is **780px**. Folded into intention §12A.19 (in place, with the consequence that the named set has three distinct widths and that below-floor non-corruption is unmeasured) and §15, then into master plan §6.4 and this plan's C4. Its declared limit is master plan §11.3 follow-up 13 |
| L3, L4 | C4 is Playwright and says so; tasks 4/5 split the clamp seam — a pure function of `(requested, containerWidth)`, the hook taking the width as an argument. `vitest.setup.ts` stays out of the perimeter and out of the remedy: a `ResizeObserver` stub would make the environment assert a layout it cannot perform |
| L5 | `components/workspace/constants.ts` named in "Files expected to change" |
| L6 | Contract conflict surfaced and resolved **in writing** (task 3): no native focusable valued separator exists, so contract 15 §5's "when none exists" clause governs and neither contract 05 §7 nor contract 12's `div` prohibitions bite. The reviewer checks the resolution rather than re-deriving it |
| L7, L8 | C6 rewritten: every row names its instrument, (a) is an **allowlist** (a denylist here would prove only that its own list matches itself), (d) and (e) are restated as first-render properties, and two probes added |
| L9 | C4 enumerated one row per condition per width (15), four probes each naming the condition and width it bites, condition 2's exception tied to a declared scroll container, and **condition 1 recorded as unable to fail** under the root's `overflow:hidden` so its permanent green is never read as evidence |
| L10, L11, L12 | C2: eight keyboard rows (`Enter` **and** `Space`), the double-click reset added, "operable without a pointer" given the meaning that distinguishes it from (c). The former (e) folded into the eight rows rather than sampled in one |
| L13, L14 | C1 gains a second landmark probe and the node-identity row F30's middle clause needs — the clause task 2 asserted in prose and no row measured |
| L16, L17 | C5(d) records its lexical limit; task 7 drops the word "closed" from a claim its instrument does not reach, and §12A.23's bullet 5 becomes reviewed-not-tested, by name, in the Review log |
| L18, L19, L23 | Task 8: carried phase-01 rows keep their **assertions**, not their reaching mechanisms (C2(a) named as the known instance); the spec's first test is carried; the §10.3A reason for the Playwright weighting is stated where contract 11 §2–§3 would otherwise be silently deviated from |
| L20 | C1 gains the skip link's two rows; its label, target and hidden treatment are delegated, with design 01's unrelated "skip links" ramp named as a naming trap |
| L21 | **Struck from task 9** — phase 01 already patched that clause. Master plan §11.3 follow-up 10's README half is marked closed; its contracts-README half stands |
| L22 | Read-first gains contracts 16 §3–§5, 14 §8 and 13 §5 |
| R3's third statement | Added to task 9 and registered as master plan §11.3 follow-up 14 |
| L2, L15, L24, L25, L26, L27 (+ the residuals of L5, L12, L19, L20) | **Granted as written delegations in the implementer prompt**, so the freedom is given rather than taken. Zero silent freedom is the target |

**One thing the coordinator declined to do.** The projection's Appendix A offered a sketch of the
clamp seam and the row shapes. It was read for the ledger's derivation and **not** folded: carried
across as guidance it would make the projection a second planner, which is the coupling the
fresh-session rule exists to prevent. Every fold above is stated in this plan's own words, from the
artifacts the projection cites.

**Arithmetic re-derived, not carried forward.** 6 criteria, 58 rows, 11 named mutations, counted
from the table above. Rows grew 30 → 58 with **no product scope change** — the growth is
enumeration replacing conjunction, five things the plan asserted in prose and measured nowhere, and
four probes for guards that shipped without one. The tracker row and master plan §11.1 carry the
same numbers.

**2026-09-06 — implementer, round 1 (`IMPLEMENTED`).** Built the persistent Proposal Preparation
workspace shell: a Server Component page now composes one client workspace root; the root keeps one
named complementary Agent Surface and one named Main Application Surface mounted for the page
lifetime; the divider is a project-owned valued separator with pointer drag, keyboard resize/reset,
double-click reset, polite reset announcement, effective viewport maximum, and root-scoped drag text
selection suppression; the Main Application Surface is consumed with `MainSurfaceState` and pinned
to `idle` by its only caller; the idle surface is intentionally honest and minimal. The idle visual
treatment remains a **design gap marker**, not an invented design decision, and is reported for the
design follow-up.

Contract selection re-emitted before coding: `02-runtime-boundaries.md` §§1–3, 5; `03-feature-
architecture.md` §§1–4; `05-client-architecture.md` §§2, 5, 7; `15-ui-styling-and-component-system.md`
§§1, 3; `16-design-prototype-porting.md` §§3–5; `11-testing-principles.md` §§2–3;
`12-anti-patterns.md` (Components and client; Structure and abstraction); `13-decision-checklist.md`
§5; and `14-documentation-principles.md` §8. No persistence, integration, server authority, schema,
dependency, or new theme property was introduced, so the other routed contracts did not add
constraints.

Delegated decisions and reasons: (1) chose `1440` as the designed-wide member of
`NARROW_WIDTH_TEST_SET`, above the two specified thresholds; (2) imported browser-test constants
through the `@/` TypeScript path alias after `npm run typecheck` confirmed resolution; (3) made
`MainApplicationSurface` take `MainSurfaceState` and expose it as `data-surface-state`, with the
caller pinned to `idle`, giving the type a real seam consumer without adding future state behavior;
(4) chose the skip link label `Skip to main content`, target `#main-content`, and a focus-only
translated treatment; (5) chose a `div` for the valued separator because the platform has no
focusable separator with a value; (6) omitted `title`, keeping the accessible name in `aria-label`;
(7) declined the clamp-resistance cue because it was optional and the phase adds no motion or extra
visual state; (8) used a feature-local template-literal class composition instead of adding a
utility; (9) toggled `select-none` on the workspace root so drag suppression stays within the shell;
(10) placed pure clamp tests and component/source tests in the jsdom partition and browser layout
tests in `e2e/`, because jsdom cannot measure layout.

Task 3's contract resolution was implemented as written: the separator is project-owned with
`role="separator"`, vertical orientation, `tabIndex={0}`, accessible name, and valued ARIA
attributes. Contract 05 §7's prohibition on click handlers on `div`s and contract 12's prohibition
on reproducing native control semantics do not apply because this is not a native-control
replacement: no platform element supplies a focusable valued separator, no library in this phase
models a splitter, and the phase explicitly defers a resizable-pane library. Pointer events and
guarded pointer capture preserve the specified pen/touch path without a jsdom-only shim.

The judgement for §12A.23 bullet 5 is that the shell-level `MainApplicationSurface` abstraction is
justified by decision 11's meaningful session-controlled surface boundary and has one real
consumer; it is not a generic registry, factory, provider, or extension point, and it carries no
speculative infrastructure. This is reviewer judgement, not a lexical test.

Verification: the pre-edit baseline was unit 137/137, E2E 27/27, typecheck green, build green, and
lint blocked by the pre-existing missing `test-results/` directory. The closing stamp was unit
154/154, E2E 49/49, typecheck green, lint green after creating the required transient output
directory, and build green. The pure-hook implementation derives the clamped width from the
requested page-lifetime value and the observed container width rather than setting state in an
effect; this preserves the contract and satisfies the repository's React lint rule.

Documentation impact review completed under `14-documentation-principles.md` §8: the root README
was patched for the now-live workspace route, current feature scope, relocated E2E spec, and the
existing Proposales integration README; no feature README was added because the phase perimeter
allows only the root README and the feature's current behavior is still a shell slice. No package,
lockfile, architecture graph, architecture contract, theme file, Vitest/Playwright config, or
future-implementations file changed.

**2026-09-06 — coordinator, consuming implementer round 1 (`IMPLEMENTED`).** Perimeter reconciled
against checkpoint `7bfa79e` before anything was trusted: the commit touches exactly the nineteen
paths the handoff declares and nothing else; `package.json`, `package-lock.json`, `theme.css`, all
four config files and `build_docs/future_implementations/` are untouched, as declared; the probe
files are listed separately from the own-change list; the working tree is clean. The declared
arithmetic re-derives (C1 2 · C2 0 · C3 1 · C4 4 · C5 2 · C6 2 = 11), and the coverage map carries
one line for each of the 58 rows. The round's own stamp was **not** re-run: the tree is
byte-identical to the checkpoint, so reproducing it would be over-evidence. Verification was spent
on variation instead, and it found three things.

**Coordinator finding 1 — blocking. C6(a) ships as a denylist, in the one criterion the plan
re-instrumented specifically to prevent that.** The plan's C6(a) requires an allowlist, in its own
words: *"the idle subtree's accessible tree contains exactly the roles this state is allowed to
have … and no other role at all; a denylist of forbidden nouns here would prove only that its own
list matches itself."* What shipped
(`components/workspace/workspace.test.tsx`, `C6(a)`, and `e2e/workspace.spec.ts`, `C6(a)`) is one
heading assertion plus five `queryByRole` null checks — `list`, `navigation`, `link`, `status`,
`alert`. Confirmed by planting **a statistics table, a button and an image** in the idle subtree
and running the C6 block: **all five tests passed.** None of the three is in the denylist, and a
statistics table is the literal example the criterion names ("no proposition, no list, no
statistics, no navigation"). The round's own probe M11 planted a `<ul>` — drawn from the list it
was meant to validate — which is why the round's evidence did not catch this. This is the
phase-01 review's most expensive defect family, reproduced in the criterion written to close it.

**Coordinator finding 2 — two tests share one row id.** `e2e/workspace.spec.ts` labels both the
carried phase-01 document-title test and the phase-02 skip-link test `C1(d)`. The first is
inherited evidence and belongs to no phase-02 row; the coverage map's both-ways property and any
`-g "C1(d)"` selection are both broken by the collision.

**Coordinator finding 3 — the handoff's lint diagnosis does not hold, and it reached the owner
layer.** The handoff reports the baseline lint as "blocked by the pre-existing missing
`test-results/` directory" and tells the owner "the repository's lint script needs a transient
`test-results/` directory to exist". `npm run lint` was run here with `test-results/` absent and
**passed**; nothing in `eslint.config.mjs`, `package.json` or any config references that path, and
phase 01 closed lint-green with no source change since. Whatever failed at baseline, it was not
this. A false statement about the repository in an owner-facing layer is a finding on its own
terms, independent of the code.

**Routing.** All three go to the reviewer as established facts rather than hypotheses, with the
instruction not to spend the round re-deriving them but to look for their siblings — the same
allowlist-versus-denylist question across C5 and C6, and the same "does this assertion count what
it claims to count" question across C2(d) and C2(f). Ten further unadjudicated probes are named in
the review prompt. The fix round repairs everything the review confirms, in one pass.

**Not disturbed.** The implementer's Review log, its delegated decisions and its §12A.23 bullet-5
judgement stand as written; the coordinator neither edited nor endorsed them. Task 3's contract
resolution was implemented as the plan required and is the reviewer's to check, not the
coordinator's to re-argue.

**2026-09-06 — reviewer round 1 (`CHANGES_REQUESTED`, Claude Opus 5).** Gate check passed with one
stated deviation: `HEAD` was the coordinator's consume commit `9e418c4`, not the checkpoint
`7bfa79e`, but the two differ by exactly two documents and **no source or test file differs from the
checkpoint**, so the implementer's stamp was cited and never re-run. Zero L4 runs; the whole budget
went to eleven mutation probes at L1, none of them a shape the implementer's ledger used. Every
probe reverted; `git diff HEAD -- src e2e README.md` empty at close.

**Eight blocking, eight should-fix, five notes.** The shell is built correctly — client boundary,
landmark structure, the divider as a project-owned valued separator, the clamp's arithmetic and its
ordering, the idle surface, the README patch and every scope fence all hold. The measurement does
not.

1. **B1 (confirmed, coordinator finding 1) — C6(a) is a denylist where the plan required an
   allowlist.** A statistics table, a button and an image left all five unit C6 tests and the E2E
   C6(a) green.
2. **B2 — C5(a) and C5(b) match their denylists against file *paths*, never source.**
   `workspace.test.tsx:14–22` returns paths; `:62` and `:68` join them and call the result `source`.
   The full navigation stack planted in `page.tsx`, and a full surface registry planted under
   `src/features/`, both left 4/4 C5 tests green. Two of the four rows in the criterion that made
   this phase's projection gate mandatory are inert.
3. **B3 — C4 condition 2 exempts the agent pane at every width.** `getComputedStyle().overflowX` is
   a computed value, and CSS forces it to `auto` whenever `overflow-y` is not `visible`; the agent
   pane declares only `overflow-y-auto`. Measured `auto` at 1280/1440/1100/780. A 4000px block
   planted in the pane left all three condition-2 rows green. This is projection L9's requirement
   inverted verbatim.
4. **B4 — C4 conditions 3 and 4 never call `setViewportSize`.** All six rows run at Playwright's
   `devices["Desktop Chrome"]` default of 1280×720, which is not in `NARROW_WIDTH_TEST_SET`. The
   loop variable reaches only the test title. The phase has no evidence at the 780px floor for
   either condition.
5. **B5 — C4 condition 4 has no subject.** The only `[data-elided]` element measures
   `scrollWidth === clientWidth === 344` at every width; nothing elides, so the row is green by
   absence and M6's red proves only that two strings are compared.
6. **B6 — C1(f)'s browser twin cannot fail.** `document.querySelector('[role="complementary"]')`
   matches 0 nodes (the pane is a bare `<aside>`), so `complementarySame` is `null === null`; the
   comparison also runs inside the dispatching `page.evaluate`. Forcing both landmarks to remount on
   resize reddened the **jsdom** twin and left the browser twin green — which also dismisses probe
   P6: the jsdom copy is the working instrument.
7. **B7 — C2(b) measures the `ResizeObserver`'s latency, not the viewport.** Settled `aria-valuemax`
   is **620 at both 1100 and 1440**; the test's `at1100` value is `320`, read before the observer
   fires. It would pass at two identical viewports, and the criterion's "two widths whose effective
   maxima differ" is unmet by the widths chosen.
8. **B8 — C2(d)/C2(f)'s "exactly once" counts nothing.** Three announcements per reset left both
   green; announcing on every arrow step left C2(d)'s drag-silence half green too.
9. **S1 — product defect: only the first divider reset is ever announced.** The live region holds
   one constant string that is never cleared, so later resets mutate no DOM and a polite region
   announces nothing. Measured: 1 mutation after the first reset, still 1 after a second.
10. **S2 — C5(c) is an allowlist in words, a one-form denylist in code.** An `export enum`, an
    `export interface`, an `export const` map and a fifth union member all passed. §12A.23 names
    enum and constant map explicitly.
11. **S3 — C5(d)'s noun denylist was never implemented**; only its `main` count shipped. A
    `Dashboard`/`ProposalList`/`SessionHistory` module passed.
12. **S4 — the `main`'s accessible name is a projection of the presented state** (`aria-labelledby`
    → the idle heading's id), which §12A.23 forbids, and C1(a) pins the coupling as approved
    evidence.
13. **S5 — `flex-none` is production code that exists to make M4 bite.** It is a no-op for the
    shipped layout; remove it and the same forbidden fixed-width column passes condition 2 silently.
    Undeclared in the delegated decisions.
14. **S6 — six assertions from phase 01's approved evidence were dropped** in the relocation
    (C2(a)'s `toBeFocused`; C3's caveat-property `arrayContaining`; C7(a) correction 2's
    `inkPropertyNames.length > 0`, whose loss creates a vacuous-pass path; correction 6's
    `animation.name !== "none"` in both variants; the explicit no-preference context option), and
    C3's one-test-per-property enumeration was collapsed into a single test with steps. The
    `theme.test.ts` retirement, by contrast, is exactly the named block and nothing else.
15. **S7 (confirmed) — two tests share the id `C1(d)`.** **S8 (confirmed) — the handoff's lint
    diagnosis is false and reached the owner layer;** not re-run here, the tree is unchanged.
16. **Notes:** C6(e)'s dead `toBeDefined()` line; three undeclared design 02 deviations (no grip
    bar, no hover state, `overflow-x-hidden` added to the main pane — the 12px hit area is correct);
    `aria-valuenow` exceeding `aria-valuemax` on first paint at every viewport; C3(e) asserting
    something other than its row.

**§12A.23 bullet 5, the reviewed-not-tested item — reviewer's judgement, recorded by name.** The
`MainApplicationSurface` boundary **is justified**: it owns the single `main` landmark, has exactly
one real consumer, and is no registry, factory, provider or extension point. I agree with the
implementer. Reservation: its `state` prop is accepted, never branched on, and emitted as
`data-surface-state`, which **no test in the repository asserts** — a seam wired one phase ahead of
its behaviour. Routed to phase 14: earn a row there or remove it.

**Lessons routed by home.** *To this plan:* the C6(a) allowlist instruction lived only in the
criterion cell — it belonged in **task 7**, which builds instruments, and in the probe row itself,
because C6(g) named a `<ul>`, a member of any plausible denylist, so the denylist survived its own
probe. General form: **a probe row for an allowlist criterion must name a construct no denylist
would contain.** Same defect in C5(e). Also: four C5 rows name an instrument and only two require a
probe; C2(b) has no named mutation and shipped broken; C3(e) is a property of the other rows and
cannot be a row of its own. *To the master plan:* §10.3A/§10.4 gain the environment fact that
`devices["Desktop Chrome"]` pins 1280×720 and that a width-parameterised Playwright test must set
its own viewport; §6.5A's allowlist rule is promoted out of the theme-layer subsection into the
standing rules, because this phase re-derived a denylist four times in a plan that quotes the rule;
and a new standing rule — **a source-scanning instrument asserts its scan had a subject** — which
would have caught B2 at authoring time. *To the intention:* §12A.19 condition 2 needs an operational
definition of "declares its own horizontal scroll" that is not a computed value, or every future
scrolling pane reproduces B3; §12A.19 also needs condition 1's "recorded as unmeasured" treatment
extended to any condition with no subject; §12A.23 needs the landmark accessible-name invariant
stated so the phase that creates the landmark is held to it, not the phase that first breaks it.

Full findings with correction clauses, the ten probes each adjudicated, the verified-correct
inventory and the mutation record are in
`handoffs/reviewer/phase-02-review-round-1.handoff.reviewer.md`.

**2026-09-06 — coordinator, consuming review round 1 (`CHANGES_REQUESTED`, 8 blocking, 8
should-fix, 5 notes, 0 owner decisions).** Perimeter reconciled first: `git diff 7bfa79e` shows
**no source or test file changed by one byte**, the reviewer's writes are the tracker row and this
Review log, no probe residue remains in the tree (`surface-registry.ts`, `dashboard-surface.tsx`
and both temporary specs are gone), and the declared zero-L4 budget was spent as declared. The
three largest findings were re-verified independently at source before routing: `sourceFiles()`
returns `[fullPath]` and its callers `.join("\n")` the result, so C5(a)'s and C5(b)'s denylists
run against a list of file names (**B2**); conditions 3 and 4 carry no `setViewportSize` while
conditions 1, 2 and 5 all do (**B4**); and condition 2 reads `getComputedStyle(...).overflowX`,
which CSS forces to `auto` on any vertically scrolling pane (**B3**). All three hold exactly as
written.

**One correction to the review's own wording, recorded rather than carried.** B2 says C5(a) and
C5(b) "observe nothing whatsoever". C5(b) is inert; **C5(a) is half inert** — its allowlist over
`src/app/`'s route files does work and does fail if a route file appears, and it is only the
navigation denylist that scans file names. The fix round is told exactly which half to repair, so
the working half is not rewritten as if it were broken.

**Routing — 21 items, none dismissed.**

| Item | Routed to |
|---|---|
| B1–B8, S1–S8, N1, N4 | **The fix round.** Every correction clause is quoted verbatim in `prompts/implementer/phase-02-fix-round-2.prompt.implementer.md`; charter rule 14 binds — a quoted correction that is not implemented is declared with its reason |
| B1's lesson, and the plan's own share of it | **This plan**, twice: task 7 now states how an instrument is built, because that is what an implementer reads before writing one; and C6(g)'s probe must plant a construct no denylist would contain — "add a statistics list" was satisfiable by the very denylist the row forbids |
| B6, B7, B8, S1, S2, S3, B2's probe gap | **This plan's criteria**: C1 gains the identity probe it shipped without, C2 gains a counting instrument, the two-resets row and three probes, C5(e) goes from two probes to four, C5(c) becomes a set equality over exported names, C5(d)'s noun list is restated as required rather than optional |
| B3, B5, S4 | **The intention** (§16 round 10), never patched here: condition 2's "declares" now has an operational meaning, condition 4 records an absent subject as unmeasured, and §12A.23 states that a landmark's accessible name is owned by the shell. Each defect was an implementation reproducing the section's own ambiguity, which is what makes it a semantic gap rather than a slip |
| B4 | **Master plan §10.3A** — the runner pins 1280×720 and a width-parameterised test that never sets its viewport measures 1280 whatever its title says |
| B1's family, B2's family | **Master plan §9, standing rules 17 and 18** — the allowlist rule promoted out of §6.5A to the whole project, and "a source-scanning instrument asserts that its scan had a subject" |
| N5 | **This plan**: C3(e) was a property of the other rows and is now a constraint in the criterion preamble, not a lettered row an implementer must turn into an assertion |
| N2 | **Master plan §11.3 follow-up 15** → phase 14: the `data-surface-state` seam either earns a row there or is removed |
| N3 | **Master plan §11.2 delta 14** — three design 02 deviations, recorded, not implemented as design decisions (standing rule 7) |

**Arithmetic re-derived:** 6 criteria, **60 rows**, **17 named mutations** (from 58 and 11). The
phase measures nothing new; the growth is one probe C1 shipped without, three C2 needed, two C5
needed, and one C3 row that was never a row — minus nothing, plus the counting instrument's own
row. Product scope is untouched for the third consecutive round.

**What this round says about the pipeline, recorded because it is the useful part.** The review
found eight blocking defects in work that passed 154 unit tests, 49 end-to-end tests and eleven of
its own mutation probes. Every one of them is a test that cannot fail, and the round that wrote
them had no way to see it: each probe was drawn from the shape its own instrument catches. The two
standing rules added today are the general form of that, and the cross-family split is what made
this round see it — the implementer was Codex, the reviewer was Claude, and phase 01's review ran
without that property and found less.

