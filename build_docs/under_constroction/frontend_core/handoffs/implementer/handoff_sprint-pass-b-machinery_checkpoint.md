# Pass B machinery checkpoint — WP9 browser verification in progress

Date: 2026-09-07
Branch: `proposal-copilot-frontend`
Repository: `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`

## Resume instruction

Continue the authoritative implementation plan at:

`build_docs/under_constroction/frontend_core/plans/sprint-pass-b-machinery.md`

Pass B is implemented and checkpointed through WP8. WP9 browser tests have
been added but are not yet green. Fix the four reported browser failures,
run the WP9 checkpoint, then complete WP10 and Pass B §9 exactly. Do not start
backend integration or phases 16–17.

## Current repository state

Latest completed checkpoint before this handoff:

`6d9ca23 CHECKPOINT (not approved): sprint pass B WP8 retained context`

This checkpoint contains the current uncommitted WP9 test additions. The
follow-up checkpoint commit is expected to be made immediately after this
handoff is recorded.

Completed commits, in order:

- `9e153d5` — WP1 turn dispatch
- `047b167` — WP2 composer rules
- `74da56d` — WP3 close guard
- `89917cf` — WP4 clarification submission
- `394ebe3` — WP5 edit wiring
- `8c1835b` — WP6 approval failure routing
- `c0d3a91` — WP7 unread announcements
- `6d9ca23` — WP8 retained context

## Completed work

WP1–WP8 are implemented and their checkpoint `npm test` runs were green.
The latest checkpoint count was 57 Vitest files / 328 tests.

Implemented machinery includes:

- origin-captured turn dispatch and turn-id matching;
- session isolation and background unread increments;
- composer draft lifetime and pending-turn rules;
- target-time close/discard confirmation and creation refusal;
- clarification answer mapping;
- inline edits, validation routing, replacement/removal, and Ask Agent;
- approval input capture, creation states, failure/retry routing, and
  departure protection;
- debounced derived status announcements;
- retained work surface and opened-block context;
- restoration and main-surface precedence.

Pass A guard amendment already made and logged: C3(i) now verifies zero
direct `closeSession(` calls in the strip and one guarded call in
`use-close-guard.ts`. No other approved Pass A guard was intentionally
amended.

Pass A component contract extension already made and logged: optional
`isSubmitting` on `ProposalReviewSurface`, required to disable approval and
edit controls during any turn. Optional close-guard machinery props were also
added to `AgentSurface`, `SessionTabStrip`, and `MainApplicationSurface` so
the workspace can share one guard instance.

## WP9 changes currently in the worktree

Only `e2e/proposal-flow.spec.ts` is currently modified for WP9. Added browser
coverage for:

- origin-session attribution and unread tab behaviour;
- typed-draft close/cancel/confirm/focus behaviour;
- close refusal while creating;
- retained work surface and opened block context;
- reload losing the in-memory workspace;
- a reduced-motion end-to-end loop.

The existing fixture adapter already has the actual Pass A test seam:
`setTemporaryTurnAdapterForTests(adapter)` and an injected `wait` callback.
Do not invent another transport or persistence seam unless the plan requires
it; the actual-tree contract wins.

## Targeted browser result

Command:

`npm run test:e2e -- e2e/proposal-flow.spec.ts`

Result: 7 passed, 4 failed.

Passing cases included the existing empty-to-created flow, origin-session
unread attribution, creation refusal, reduced-motion spinner, and all three
responsive containment cases.

Failures and likely next actions:

1. **Typed draft close focus** — the test reaches one remaining tab after
   confirmation, but `getByRole("tab")` is not focused. This is a real
   browser focus issue worth fixing in the machinery, because P9.2 requires
   focus on the neighbour. Inspect the interaction between
   `SessionTabStrip`'s post-close focus effect and native `ConfirmDialog`
   modal close focus restoration. Keep the existing unit focus tests green;
   make the smallest focus fix.

2. **Retained context test** — the radio input is visually hidden and the
   open replacement surface intercepts its direct pointer click. Use the
   established keyboard pattern from the existing E2E test:
   focus the `Client Preview` radio and press `Space`, or click its label.
   This is a test interaction fix, not a visual redesign.

3. **Reload test** — the test looks for nonexistent copy `Start with a brief`.
   The actual Pass A empty state says:
   `Paste notes and I will draft a proposal — or just tell me what to do in
   here.` Update the assertion to the actual tree's copy.

4. **Reduced-motion full loop** — after the edit resolves, the fixture returns
   the actual V2 proposition title `Studio North walnut dining collection`;
   it does not echo the submitted title. Update the assertion to the fixture
   result, preserving the semantic test that the returned result is rendered.

After these fixes, rerun the focused spec. Do not weaken assertions or alter
Pass A visual contracts.

## Important implementation constraints

- Read `sprint-pass-b-machinery.md` before continuing.
- Do not re-plan or perform projection/reviewer ceremony.
- Do not read `activeSessionId` on a turn resolution path. The dispatch file
  should continue to contain no active-session read on resolution.
- Do not add persistence, backend transport, HTTP calls, Server Actions,
  routes, commercial calculations, or frontend proposal reasoning.
- Keep the closed store shape; no status/attention/persistence fields.
- Preserve the actual Pass A names recorded in the sprint log.
- Keep fixtures explicitly temporary and fixture-era.

## Remaining work

1. Fix the four WP9 failures above.
2. Run `npm test` and create the WP9 checkpoint commit with subject:
   `CHECKPOINT (not approved): sprint pass B WP9 browser verification`.
3. Complete WP10's fixture-era audit and append its yes/no evidence to the
   Pass B sprint log. Patch the root `README.md` only if its current status
   sentence is false after Pass B; do not create the feature README.
4. Fill the sprint log's R1.1–R8.8 evidence, M1–M15 mutation ledger,
   session-isolation checklist, approved-guard verification, file lists,
   prop-extension reasons, actual-tree names, dependencies, and integration
   handoff items.
5. Run the final fresh-server stamp exactly:

   `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`

   Restore generated-only `next-env.d.ts` / `tsconfig.tsbuildinfo` changes if
   those commands rewrite them, as was done at the §0 gate.
6. Verify a clean tree, record the final SHA in the sprint log, and create the
   final commit with subject:
   `sprint pass B: machinery complete; fixture-era gate`

Do not push, merge, or begin phases 16–17.

