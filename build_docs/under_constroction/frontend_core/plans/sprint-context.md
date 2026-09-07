# Submission sprint — catch-up brief for a fresh session

Read this in ten minutes, then open the pass plan you were asked to execute. Everything here is
true of the tree at `d006642` on branch `proposal-copilot-frontend`, 2026-09-07.

## 1. What is being built

**Proposal Copilot**: a hiring take-home for Proposales. One page, dark, split in two. Left, a
persistent **Agent Surface**: session tabs, a status line, a conversation thread, and a composer that is
replaced by a clarification panel when the agent needs answers. Right, the **Main Application
Surface**: the proposal being prepared — review (fields, line items, provenance, unresolved
information), a client preview, a creating state, a created / recovered state, and a failure state.

The loop: the user pastes a messy brief → the agent works → it may ask clarification → the user
answers or skips → the agent prepares a proposition → the human reviews, edits, replaces line items,
asks the agent about a field, previews → approves → the app shows creating → the backend creates a
**draft** in Proposales → the app shows created with the editor link. **The app never sends a
proposal.** Every surface repeats that.

Several sessions can be open at once as tabs. Each keeps its own thread, result, composer draft, and
its place on the right side. Nothing survives a reload, by decision.

## 2. Where things are

| What | Path |
|---|---|
| the ratified product semantics (authority for behaviour) | `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md` — §5 per surface, §12A mechanism contracts |
| the visual and interaction specs (authority for looks) | `build_docs/under_constroction/frontend_core/ui_design/01–10` — read `10` first |
| the engineering contracts (authority for how code is written) | `architectural_contracts/` — `01-implementation-contract-guide.md` routes; `05`, `15`, `16`, `11` matter most here |
| the master plan (skeleton, naming registry, standing rules, follow-ups) | `build_docs/under_constroction/frontend_core/master-plan.md` — §6 names, §9 rules, §10.3A what jsdom cannot measure |
| the historical phase plans 05–15 (source material only now) | `build_docs/under_constroction/frontend_core/plans/phase-*.md` |
| **Pass A plan** (visual / product + the spine) | `plans/sprint-pass-a-visual.md` |
| **Pass B plan** (machinery) | `plans/sprint-pass-b-machinery.md` |
| the feature code | `src/features/proposal-preparation/{components,hooks,client,types}` |
| the theme layer and global CSS | `src/styles/theme.css`, `src/styles/globals.css` |
| merged backend value shapes you may import | `src/lib/values/{money,path,absence}.ts`, `src/lib/errors/error-dto.ts` |
| tests | beside their source as `*.test.ts(x)`; browser tests in `e2e/` |

## 3. What already exists (phases 01–04, approved)

The shell: two landmarks, a skip link, a draggable and keyboard-operable divider, narrow-width
resilience at 1440 / 1100 / 780. The session tab strip on Radix Tabs: create, switch, reorder by
pointer and keyboard, close, keep the active tab in view, a status dot per tab derived from the
session record. A status line showing the derived phase label. An idle right-hand surface. A Zustand
store with `activateSession`, `createSession`, `moveSession`, `closeSession` and a session record that
is, today, just booleans. The theme layer with every dark value from design 01. A Vitest setup with two
projects and a Playwright suite. 205 unit tests, 69 E2E rows, all green.

There is **no** thread, composer, pill, clarification panel, review surface, preview, creation state,
failure state, turn dispatch, guard, or fixture beyond the session record. That is the sprint.

## 4. What the sprint is, and what changed in the process

The owner ran a rigorous phase-gated pipeline for phases 01–04 (projection → implement → review →
fix → approve). On 2026-09-07 the owner collapsed phases 05–15 into a **submission sprint** with that
machinery waived. Two passes, two sessions:

- **Pass A** builds every visual surface and state as props-driven components fed by view models,
  plus a minimal **spine** (real session record, a scripted fixture adapter, happy-path dispatch) so
  the states are visible in a browser. Its plan fixes every name Pass B relies on.
- **Pass B** wires behaviour: turn attribution, guards, submission maps, edit / approval / failure
  routing, retained context, announcements, tests. It does not redesign anything.

Later, when the backend (built concurrently in another worktree) merges, an integration sprint
replaces the fixture adapter with real Server Actions and the temporary types with the parsed backend
schemas. **The components and view models must survive that unchanged.** That is why components never
see a fixture or a temporary type.

## 5. The rules that are not negotiable, in one screen

1. The browser is not authority for proposal truth, money, provenance, completeness, or approvability. It renders what it was given.
2. No money arithmetic, ever. One formatting function.
3. No persistence of any kind. Reload loses everything, and the UI says so.
4. Session isolation: every record field belongs to one session; a result lands in the session that dispatched it, matched by ids captured before the first `await`, never "the active session".
5. Retained right-side context is exactly two entries: `workSurface` and `openedBlockContentId`.
6. Tab status is derived at render, never stored; the close guard never reads it.
7. Fixtures are `*.temporary-fixture.ts` / `temporaryFixture*`; temporary types are `Temporary*`; nothing pretends to be a backend schema.
8. No prototype intelligence: no regex over the user's text, no fabricated steps, no fake progress. The scripted adapter returns states by turn kind only. One era-marked demo latency constant exists by owner decision 23.
9. Accessibility is part of building each element: native controls, names, focus destinations, announcements, reduced motion.
10. Visual values come from `theme.css` only; no hex or px type literal in a component (a test scans for them).
11. Radix Tabs (exists), Radix Popover (Ask Agent), native `<dialog>`, native radio group. No other UI library.
12. Every string from a human, the agent, or the catalog renders as text. No markup path.

## 6. Guards that will fail your build silently if you forget them

Read `src/styles/theme.test.ts` and `src/features/proposal-preparation/components/workspace/workspace.test.tsx`
once. They scan source: no raw colour or `text-[13px]`; no new theme name outside the allowlist; the
words `extension`, `plugin`, `Registry`, `SurfaceMap` nowhere under `src/features` (comments included);
exactly one `<main`; `types/presentation.ts` exports only `MainSurfaceState`; nothing under
`src/components/ui/`. The Vitest partition: `.tsx` tests and `.ts` tests under `hooks/` run in jsdom;
every other `.ts` test runs in node with no DOM. jsdom performs no layout and resolves no `var()`:
anything about size, position, computed colour, or media queries is a Playwright test.

## 7. Commands

```
npm run typecheck && npm run lint && npm test        # after every work package
npm run test:e2e                                      # needs port 3000 free; starts next dev itself
npm run build                                         # part of green; CI runs all five
npx vitest run src/features/proposal-preparation      # the feature only
```

If a Playwright focus-order row fails, check for an orphaned `next-server` on port 3000 before
believing it (master plan §11.3 follow-up 18). Commit checkpoints as the pass plan says. Do not push
unless the owner says so. Do not mark any phase `APPROVED`.

## 8. Start

Open the pass plan you were given. Run its §0 gate. Read its read-order. Begin at its WP1.
