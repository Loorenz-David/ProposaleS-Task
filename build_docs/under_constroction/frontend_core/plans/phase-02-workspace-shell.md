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
   §12A.23's forbidden list. **Four of its five bullets are measured lexically (C5 (a)–(d)); the
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
| **C1** | The shell renders exactly one complementary region and exactly one `main`, both named, both present from the first render, and both the **same nodes** throughout. (a) Exactly one element with the complementary role, carrying an accessible name. (b) Exactly one `main`. (c) `src/app/page.tsx` carries no `"use client"` directive and the directive appears on the workspace root. (d) The skip link is the **first tab stop** of the document and is visible once focused (projection L20 — the skip link was asserted by task 8 and traced to no row, which is an orphan test under charter rule 16). (e) Activating the skip link moves focus into the `main`. (f) **Node identity across this phase's one state change** (projection L14, F30's middle clause): after a keyboard divider resize, the complementary region and the `main` are the same DOM nodes as before it — task 2's "neither is remounted by anything" measured rather than asserted in prose. (g) Planted-defect probe: add a second `main` inside the Main Application Surface, observe (b) redden, revert. (h) Planted-defect probe: add a second complementary region, observe (a) redden, revert (projection L13 — (b) was probed and (a) was not). | 8 | F30 · §12A.23 · `02 §1–§2` |
| **C2** | The divider is a real separator with design 02 §5's keyboard model. (a) It exposes the separator role, vertical orientation, an accessible name, and current, minimum and maximum values. (b) The maximum is the **effective** maximum and is recomputed when the viewport changes — asserted at two viewport widths whose effective maxima differ. (c) **Eight rows, one per keyboard interaction**: arrow decrease, arrow increase, shifted decrease, shifted increase, `Home`, `End`, **`Enter` reset, `Space` reset** — design 02 §5 names both reset keys and charter rule 2 enumerates rather than samples (projection L10). Each row asserts the resulting width against the clamp contract, never a literal, **and** that focus is still on the divider afterwards. *(The plan's former (e) — "focus stays on the divider across every interaction in (c)" — is folded into these eight rows rather than sampled in one: it is the same interaction's outcome, and one row per interaction is what lets a probe bite a single one.)* (d) Reset announces politely, exactly once; a drag announces nothing. The absence half shares its instrument with the presence half **in the same row**, which is what makes it mean something (projection F6 — recorded so nobody "fixes" it into two rows). (e) The divider is reachable by `Tab` from the start of the rendered document, with no pointer — the granted meaning of "operable without a pointer", which (c) does not assert (projection L12). (f) **Double-click reset** (design 02 §3.1 and §5, covered by no row before the projection — L11): a double-click on the divider resets it to the default width and announces politely exactly once. | 13 | F26 · F6 · F24 (divider-reset row) · §12A.19 |
| **C3** | The clamp is the specification's arithmetic, including its ordering. (a) A requested width below the agent minimum resolves to the agent minimum. (b) A requested width above the agent maximum resolves to the agent maximum. (c) At a viewport where the main-pane minimum and the agent minimum cannot both hold, **the agent minimum wins** and the main pane is squeezed — the ordering row, stated because the opposite ordering is the natural implementation and is wrong. (d) A viewport change re-clamps an already-set width. (e) The width is asserted against the named constants' contract, never their literals. (f) Planted-defect probe: reverse the clamp's ordering, observe (c) redden, revert. **These six rows are measurable only because task 4 exports the clamp as a pure function of `(requested, containerWidth)`** — projection L4 and F2: with the hook measuring its own container, every width in jsdom computes from `0`. | 6 | F26 · §12A.19 · charter rule 13 |
| **C4** | All five §12A.19 conditions hold at every width in the named test set (`NARROW_WIDTH_TEST_SET`, master plan §6.4), **measured in Playwright** — master plan §10.3A and projection F3: jsdom performs no layout, `getBoundingClientRect()` returns literal zeros and `clientWidth`/`scrollWidth` are `0`, so not one of these conditions is observable in Vitest (projection L3). **Owner decision 14 fixes the V1 floor at the specification's lower stated threshold, so the set has three distinct widths**: the designed wide width, 1100px, 780px. **One row per condition per width — fifteen rows, not three**: five conditions behind a single assertion short-circuit, and no probe can then bite a named one (projection L9, charter rule 12). The conditions: (1) the document does not scroll horizontally; (2) no pane's content overflows its own pane horizontally, except inside a container that **declares** its own horizontal scroll — the exception is recognised by that declaration, never inferred from a scrollbar's presence, so an incidental `overflow-y:auto` cannot swallow the rule (L9); (3) every interactive element of this phase is reachable and operable by keyboard; (4) no text node is clipped to zero rendered width, and any elided text keeps its full value in the accessible name; (5) the agent pane is never rendered below its stated minimum. **Recorded limit — condition 1 cannot fail in this shell**: design 02 §2's root `overflow:hidden` suppresses the document's own horizontal scroll by construction, so condition 1 is asserted but no mutation can redden it, and a fixed-width column surfaces in condition 2 instead. Its permanent green is not evidence, and is named here so it is not read as any (projection F4; intention §12A.19's named mutation was corrected upstream for the same reason). **Planted-defect probes, four, each naming the condition and the width it bites:** (e) a content column gets a fixed width instead of a maximum → condition 2 reddens at 780px; (f) the divider loses its `tabindex` → condition 3 reddens at all three widths; (g) elided text's accessible name is replaced by its truncated string → condition 4 reddens at 780px; (h) the clamp is allowed to resolve below the agent minimum → condition 5 reddens at 780px. | 19 | F26 · §12A.19 |
| **C5** | The V1 containment perimeter holds, and its check can observe a breach. Every absence row here is over an open universe, so each names its instrument, and a denylist row records its limit inside the criterion (phase-01 review lesson; master plan §6.5A's allowlist rule). (a) No router, route, URL segment, query parameter, history entry, or navigation event exists for a workspace surface. **Instrument:** an allowlist — the route files under `src/app/` are exactly `layout.tsx` and `page.tsx` — plus a denylist over `src/app/**` and `src/features/**` source: no import from `next/navigation` or `next/link`, no `useRouter` / `usePathname` / `useSearchParams`, no `history.pushState` / `history.replaceState`, no assignment to `window.location` or `location.hash`. Recorded limit: a navigation mechanism outside that list is not observed by this row. (b) No surface registry, surface map, surface factory, provider that resolves a surface, plugin point, or extension point exists. **Instrument:** a denylist over `src/features/**` source for the identifier fragments `Registry`, `SurfaceMap`, `surfaceFactory`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin`, `extension`. Recorded limit: a registry under a name outside that list is caught only by (c) or (d). (c) No discriminant whose domain is "which application surface" exists. **Instrument:** an allowlist — `types/presentation.ts` exports exactly the type names master plan §6.3 assigns to it (in this phase, `MainSurfaceState` alone; a later phase amends the list when it adds §6.3's other members), and `MainSurfaceState`'s members are exactly `creating`, `created`, `review`, `idle` — §12A.22 (A)'s four rows — so it is a state discriminant inside the one surface and no other exported type in that module can carry a surface-kind domain. (d) No second Main Application Surface, dashboard, analytics surface, product library, customers or settings surface, proposal list, or session-history surface exists. **Instrument:** an exact count — exactly one module under `src/` renders a `main` element, and it is `MainApplicationSurface` — plus a denylist over file and exported-component names under `src/app/**` and `src/features/**`: `Dashboard`, `Analytics`, `Statistics`, `ProductLibrary`, `Customers`, `Settings`, `ProposalList`, `SessionHistory`, `Archive`. Recorded limit, two: a second surface under a noun outside that list is caught only by the `main` count; and the count itself is **lexical**, so a `main` produced by `React.createElement("main", …)` or by a computed tag is not observed by it (projection L16 — (a) and (b) already record their limits and (d) did not). (e) **Planted-defect probes, required, two:** add a second exported union whose domain is surface kinds (`ApplicationSurface = "proposal-preparation" \| "dashboard"`) to `types/presentation.ts`, observe (c) redden, revert; and add a second module under `src/features/` that renders a `main` element, observe (d) redden, revert. | 5 | F30 · §12A.23 · `12` "Structure and abstraction" |
| **C6** | The idle Main Application Surface renders the Proposal Preparation experience's own no-proposition state. Every absence row here names its instrument and ships a probe — the discipline C5 already carries, extended to C6 by the projection (L7); C5's preamble bound only C5, while standing rule 8 and charter rule 15 bind these identically. (a) It renders an honest empty state with no proposition, no list, no statistics and no navigation. **Instrument: an allowlist** — the idle subtree's accessible tree contains exactly the roles this state is allowed to have (a heading and its supporting static text) and no other role at all; a denylist of forbidden nouns here would prove only that its own list matches itself (master plan §6.5A's rule, earned in the phase-01 review). (b) It renders inside the single `main`, without replacing it. (c) It offers no affordance that changes the URL or mounts a route. **Instrument:** no element in the idle subtree carries the `link` role or an `href`, plus a denylist over the idle module's own source for `next/link`, `useRouter`, `history.pushState`/`replaceState` and assignment to `window.location`. Recorded limit: a navigation mechanism outside that list is caught only by (a)'s allowlist, and only if it renders a role. (d) **First render moves no focus**: after the shell's first render, no element inside the idle subtree holds focus (projection L8 — the plan's "entering it" is activation, which does not exist until phases 03/14, so the row is restated as a property of the only event this phase has). (e) **First render carries no announcement of its own**: the idle subtree contains no `aria-live` node and no `role="status"` or `role="alert"` element. (f) Planted-defect probe: add an `aria-live` region inside the idle subtree, observe (e) redden, revert. (g) Planted-defect probe: add a statistics list to the idle subtree, observe (a)'s allowlist redden, revert. | 7 | F29 (A row 4) · F30 · §12A.22 |

**Derived totals for this phase:** 6 criteria, **58 rows** (C1 8 · C2 13 · C3 6 · C4 19 · C5 5 ·
C6 7), **11** named mutations (C1 2 · C2 0 · C3 1 · C4 4 · C5 2 · C6 2 — C1(g), C1(h), C3(f),
C4(e)–(h), C5(e)'s two, C6(f), C6(g)). Re-derived by the coordinator on 2026-09-06 when it
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

