# Phase 02 — Persistent shell: landmarks, divider, narrow width, containment

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 6 |
| **Projection** | waivable |
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
```

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
   skip link, and keyboard reachability of the main content. Delete `bootstrap.spec.ts`.
9. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The shell renders exactly one complementary region and exactly one `main`, both named and both present from the first render. (a) Exactly one element with the complementary role, carrying an accessible name. (b) Exactly one `main`. (c) `src/app/page.tsx` carries no `"use client"` directive and the directive appears on the workspace root. (d) Planted-defect probe: add a second `main` inside the Main Application Surface, observe (b) redden, revert. | 4 | F30 · §12A.23 · `02 §1–§2` |
| **C2** | The divider is a real separator with design 02 §5's keyboard model. (a) It exposes the separator role, vertical orientation, an accessible name, and current, minimum and maximum values. (b) The maximum is the **effective** maximum and is recomputed when the viewport changes — asserted at two viewport widths whose effective maxima differ. (c) One row per keyboard interaction: arrow decrease, arrow increase, shifted decrease, shifted increase, `Home`, `End`, reset — seven rows, enumerated, each asserting the resulting width against the clamp contract rather than a literal. (d) Reset announces politely, exactly once; a drag announces nothing. (e) Focus stays on the divider across every interaction in (c), including reset. (f) It is operable without a pointer. | 6 | F26 · F6 · F24 (divider-reset row) · §12A.19 |
| **C3** | The clamp is the specification's arithmetic, including its ordering. (a) A requested width below the agent minimum resolves to the agent minimum. (b) A requested width above the agent maximum resolves to the agent maximum. (c) At a viewport where the main-pane minimum and the agent minimum cannot both hold, **the agent minimum wins** and the main pane is squeezed — the ordering row, stated because the opposite ordering is the natural implementation and is wrong. (d) A viewport change re-clamps an already-set width. (e) The width is asserted against the named constants' contract, never their literals. (f) Planted-defect probe: reverse the clamp's ordering, observe (c) redden, revert. | 6 | F26 · §12A.19 · charter rule 13 |
| **C4** | All five §12A.19 conditions hold **simultaneously** at every width in the named test set, verified by rendering. One row per width in the set — the designed wide width, the specification's two stated thresholds, and the V1 floor — each asserting all five conditions: the document does not scroll horizontally; no pane's content overflows its own pane except inside a container that declares its own horizontal scroll; every interactive element of this phase is reachable and operable by keyboard; no text node is clipped to zero rendered width and any elided text keeps its full value in the accessible name; the agent pane is never rendered below its stated minimum. Plus a planted-defect probe: give a content column a fixed width instead of a maximum, observe the narrowest width's row redden, revert. | 5 | F26 · §12A.19 |
| **C5** | The V1 containment perimeter holds, and its check can observe a breach. (a) No router, route, URL segment, query parameter, history entry, or navigation event exists for a workspace surface. (b) No surface registry, surface map, surface factory, provider that resolves a surface, plugin point, or extension point exists. (c) No discriminant whose domain is "which application surface" exists — `MainSurfaceState` is asserted to be a state discriminant inside the one surface, by naming its four members against §12A.22 (A)'s four rows. (d) No second Main Application Surface, dashboard, analytics surface, product library, customers or settings surface, proposal list, or session-history surface exists. (e) **Planted-defect probe, required:** add a second member to a surface-kind discriminant, observe (c) redden, revert; and add a second `main`-bearing surface module, observe (d) redden, revert. | 5 | F30 · §12A.23 · `12` "Structure and abstraction" |
| **C6** | The idle Main Application Surface renders the Proposal Preparation experience's own no-proposition state. (a) It renders an honest empty state with no proposition, no list, no statistics, and no navigation. (b) It renders inside the single `main`, without replacing it. (c) It offers no affordance that changes the URL or mounts a route. (d) Entering it moves no focus and fires no announcement of its own. | 4 | F29 (A row 4) · F30 · §12A.22 |

**Derived totals for this phase:** 6 criteria, 30 rows, 4 named mutations (C1(d), C3(f), and
C5(e)'s two). Re-derive at dispatch.

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

## Review log

*(empty)*
