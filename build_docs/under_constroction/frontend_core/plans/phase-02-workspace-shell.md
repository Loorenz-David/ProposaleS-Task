# Phase 02 — Persistent shell: landmarks, divider, narrow width, containment

| | |
|---|---|
| **State** | `NOT_STARTED` |
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
  `11-testing-principles.md` §2–§3.

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
3. **Build the divider as a real separator**: `role="separator"`, vertical orientation, an
   accessible name, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` where the maximum is the
   *effective* maximum recomputed on viewport change, keyboard-focusable, with design 02 §5's
   keyboard model — arrow steps, shifted arrow steps, `Home`, `End`, and reset — and a visible
   focus indicator. Use pointer events so pen and touch drags work; widen the **hit area** to at
   least the value design 02 §4 requires while keeping the visible seam. Announce the reset
   politely; never announce a drag pixel.
4. **Implement the clamp as design 02 §3.2 states it**, including its ordering: the agent
   minimum wins over the main-pane minimum. Constants live in one module and criteria assert the
   contract, not the literal (master plan §6.4). Width is page-lifetime state: re-clamped on
   viewport change, **never persisted** in any form.
5. **Satisfy the narrow-width invariant by construction**: no fixed pixel width on a content
   column, no reading the window width during render (observe the container instead), and every
   pane's own scroll where design 02 §4 gives it one.
6. **Build the idle Main Application Surface** as the Proposal Preparation experience's own
   no-proposition state: an honest empty state. It is **not** a proposal list, a dashboard, a
   statistics strip, a session history, a route, or a second surface. Its visual treatment is a
   reported design gap (master plan §11.2 delta 8) — leave a marker and report; do not invent a
   design.
7. **Establish the containment perimeter** as a source-level check with a planted probe, per
   §12A.23's closed forbidden list.
8. **Replace the end-to-end spec** with `e2e/workspace.spec.ts` asserting the two landmarks, the
   skip link, and keyboard reachability of the main content. Delete `bootstrap.spec.ts`. **Retire
   phase 01's C6(a)/(c) guard** — the `describe("C6(a)/(c): …")` block in `src/styles/theme.test.ts`
   that reads `e2e/bootstrap.spec.ts` and asserts it names no landmark or skip link. Its subject is
   deleted by this task and its assertion is the negation of this phase's C1; delete exactly that
   block and nothing else in the file (its imports stay in use by the other checks). Carry the
   phase-01 rows C2, C3(a) and C7(a) that `bootstrap.spec.ts` discharged into `workspace.spec.ts`
   **unchanged in substance**: they are phase 01's approved evidence and this phase relocates them
   because it retires their host file, not because it owns them.
9. Closeout: contract 14 §8's impact review, tracker row, Review log. Known in advance (master plan
   §10.2 caveat 4's reading: "every document this phase's change makes stale"): the root
   `README.md`'s status paragraph and "Current scope" bullets ("a bare root layout, a neutral `/`
   route"), its tree-diagram entry for `src/app/` ("neutral root route"), its
   `src/features/proposal-preparation` sentence ("exists today only as phase 01's test-collection
   sentinels"), and its Playwright bullet naming `e2e/bootstrap.spec.ts`. Because this phase patches
   `README.md`, master plan §11.3 follow-up 10's README half — the "integrations under `src/lib/**`
   … neither exists yet" claim — lands here too, per that follow-up's own routing ("the next phase
   that patches either document"). The contracts-README half of follow-up 10 stays where it is:
   this phase does not patch that document. The impact review also covers what this list does not
   name.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The shell renders exactly one complementary region and exactly one `main`, both named and both present from the first render. (a) Exactly one element with the complementary role, carrying an accessible name. (b) Exactly one `main`. (c) `src/app/page.tsx` carries no `"use client"` directive and the directive appears on the workspace root. (d) Planted-defect probe: add a second `main` inside the Main Application Surface, observe (b) redden, revert. | 4 | F30 · §12A.23 · `02 §1–§2` |
| **C2** | The divider is a real separator with design 02 §5's keyboard model. (a) It exposes the separator role, vertical orientation, an accessible name, and current, minimum and maximum values. (b) The maximum is the **effective** maximum and is recomputed when the viewport changes — asserted at two viewport widths whose effective maxima differ. (c) One row per keyboard interaction: arrow decrease, arrow increase, shifted decrease, shifted increase, `Home`, `End`, reset — seven rows, enumerated, each asserting the resulting width against the clamp contract rather than a literal. (d) Reset announces politely, exactly once; a drag announces nothing. (e) Focus stays on the divider across every interaction in (c), including reset. (f) It is operable without a pointer. | 6 | F26 · F6 · F24 (divider-reset row) · §12A.19 |
| **C3** | The clamp is the specification's arithmetic, including its ordering. (a) A requested width below the agent minimum resolves to the agent minimum. (b) A requested width above the agent maximum resolves to the agent maximum. (c) At a viewport where the main-pane minimum and the agent minimum cannot both hold, **the agent minimum wins** and the main pane is squeezed — the ordering row, stated because the opposite ordering is the natural implementation and is wrong. (d) A viewport change re-clamps an already-set width. (e) The width is asserted against the named constants' contract, never their literals. (f) Planted-defect probe: reverse the clamp's ordering, observe (c) redden, revert. | 6 | F26 · §12A.19 · charter rule 13 |
| **C4** | All five §12A.19 conditions hold **simultaneously** at every width in the named test set (`NARROW_WIDTH_TEST_SET`, master plan §6.4), verified by rendering. One row per width in the set, each asserting all five conditions: the document does not scroll horizontally; no pane's content overflows its own pane except inside a container that declares its own horizontal scroll; every interactive element of this phase is reachable and operable by keyboard; no text node is clipped to zero rendered width and any elided text keeps its full value in the accessible name; the agent pane is never rendered below its stated minimum. (a) The designed wide width. (b) The specification's upper stated threshold. (c) The specification's lower stated threshold. (d) The V1 floor. (e) Planted-defect probe: give a content column a fixed width instead of a maximum, observe (d) redden, revert. | 5 | F26 · §12A.19 |
| **C5** | The V1 containment perimeter holds, and its check can observe a breach. Every absence row here is over an open universe, so each names its instrument, and a denylist row records its limit inside the criterion (phase-01 review lesson; master plan §6.5A's allowlist rule). (a) No router, route, URL segment, query parameter, history entry, or navigation event exists for a workspace surface. **Instrument:** an allowlist — the route files under `src/app/` are exactly `layout.tsx` and `page.tsx` — plus a denylist over `src/app/**` and `src/features/**` source: no import from `next/navigation` or `next/link`, no `useRouter` / `usePathname` / `useSearchParams`, no `history.pushState` / `history.replaceState`, no assignment to `window.location` or `location.hash`. Recorded limit: a navigation mechanism outside that list is not observed by this row. (b) No surface registry, surface map, surface factory, provider that resolves a surface, plugin point, or extension point exists. **Instrument:** a denylist over `src/features/**` source for the identifier fragments `Registry`, `SurfaceMap`, `surfaceFactory`, `createSurface`, `resolveSurface`, `SurfaceProvider`, `plugin`, `extension`. Recorded limit: a registry under a name outside that list is caught only by (c) or (d). (c) No discriminant whose domain is "which application surface" exists. **Instrument:** an allowlist — `types/presentation.ts` exports exactly the type names master plan §6.3 assigns to it (in this phase, `MainSurfaceState` alone; a later phase amends the list when it adds §6.3's other members), and `MainSurfaceState`'s members are exactly `creating`, `created`, `review`, `idle` — §12A.22 (A)'s four rows — so it is a state discriminant inside the one surface and no other exported type in that module can carry a surface-kind domain. (d) No second Main Application Surface, dashboard, analytics surface, product library, customers or settings surface, proposal list, or session-history surface exists. **Instrument:** an exact count — exactly one module under `src/` renders a `main` element, and it is `MainApplicationSurface` — plus a denylist over file and exported-component names under `src/app/**` and `src/features/**`: `Dashboard`, `Analytics`, `Statistics`, `ProductLibrary`, `Customers`, `Settings`, `ProposalList`, `SessionHistory`, `Archive`. Recorded limit: a second surface under a noun outside that list is caught only by the `main` count. (e) **Planted-defect probes, required, two:** add a second exported union whose domain is surface kinds (`ApplicationSurface = "proposal-preparation" \| "dashboard"`) to `types/presentation.ts`, observe (c) redden, revert; and add a second module under `src/features/` that renders a `main` element, observe (d) redden, revert. | 5 | F30 · §12A.23 · `12` "Structure and abstraction" |
| **C6** | The idle Main Application Surface renders the Proposal Preparation experience's own no-proposition state. (a) It renders an honest empty state with no proposition, no list, no statistics, and no navigation. (b) It renders inside the single `main`, without replacing it. (c) It offers no affordance that changes the URL or mounts a route. (d) Entering it moves no focus and fires no announcement of its own. | 4 | F29 (A row 4) · F30 · §12A.22 |

**Derived totals for this phase:** 6 criteria, 30 rows (C1 4 · C2 6 · C3 6 · C4 5 · C5 5 · C6 4),
**5** named mutations (C1 1 · C2 0 · C3 1 · C4 1 · C5 2 · C6 0 — C1(d), C3(f), C4(e), and C5(e)'s
two). Re-derived by the coordinator's pre-dispatch lint on 2026-09-06 from the criteria table; the
planner's "4" omitted C4's probe. Re-derive at dispatch.

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
