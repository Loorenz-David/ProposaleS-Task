---
plan: sprint-pass-a-visual
role: implement
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Pass A implementation handoff

## What was built

All ten authorized work packages are complete. The browser-operable fixture path now covers empty,
brief, working, clarification answer/skip, proposition review, provenance and unresolved information,
line items, inline editing, Ask Agent, client preview, approval, creating, and created states. Planned
run, call, creation, and applied-pricing failure treatments are represented by fixtures and presentation
adapters. Components consume stable view models rather than temporary fixture contracts.

The starting gate passed at `24abcc07b9d95c5fb18c478ca68bb54557f91ec3`. The clean implementation
tree stamped by the exit gate is `9d8b46bc864a61a2af7044da995e1ae71502e014`.

## Acceptance coverage map

| Pass A row | Evidence | Assertion shape |
| --- | --- | --- |
| §12 node adapters and money boundary | `client/view-models/*.test.ts` | Direct fixture-to-view-model values, absence, provenance, readiness, preview closed set, returned totals, and source guards |
| §12 jsdom components | colocated `components/**/*.test.tsx` | Direct roles, accessible names/descriptions, focus, keyboard, retry presence, link attributes, and controlled callbacks; no snapshots |
| §12 hooks | `use-thread-follow-state.test.ts`, `use-inline-edit.test.ts` | Direct transition/state assertions at the stated threshold and one-at-a-time edit contract |
| §12 scripted browser flow | `e2e/proposal-flow.spec.ts` | Real 700 ms working indicator and the complete empty-to-created interaction path |
| §11 responsive matrix | `proposal-flow.spec.ts` plus inherited `workspace.spec.ts` width matrix | Chromium layout containment at 1440/1100/780 and divider minimum/maximum, including main/table overflow assertions |
| §10 keyboard/focus | colocated component tests and both E2E files | Direct focus transfer, tab reachability, Enter/Escape/Cmd+Enter, dialog/popover behavior, and visible focus evidence |
| §10 reduced motion | `proposal-flow.spec.ts` and inherited motion guards | Chromium `animation-name: none` on the creating indicator and global reduced-duration evidence |
| §13 fixture boundary | production-source `rg` audit | No production component imports a temporary fixture or `Temporary*` contract |
| §13 complete exit command | clean tree at verification SHA | Typecheck, lint, Vitest, Playwright, and production build all green |
| §13 documentation and final handoff | sprint log §16 and this file | Dependency, tokens, design deltas, deviations, limitations, checkpoints, and exact SHA recorded |

The pre-implementation approved baseline contained 205 green tests. No red baseline for newly authored
tests was captured because this time-boxed sprint explicitly directed implementation by work package
instead of the older phase ceremony; no retrospective baseline was fabricated. Pass A declares no
named mutation probes, so the mutation ledger is `0 declared / 0 executed`; no files were touched by
applied-and-reverted mutation probes.

## Final verification

Command run from a clean worktree at `9d8b46bc864a61a2af7044da995e1ae71502e014`:

```text
npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build
```

Results: typecheck green; lint green; 52 Vitest files / 279 tests green; 74 Playwright Chromium tests
green; Next.js 16.3.4 production build green and `/` statically generated. Focused browser reruns also
proved the hydration-shell correction three consecutive times for skip-link focus, divider live-region
availability, and idle accessibility-tree stability.

The real Chromium sweep exercised responsive widths, divider extremes, overflow, keyboard navigation,
focus movement, reduced motion, and the product flow. The host in-app browser service was attempted
twice and exposed no browser instance, including after a fresh development server was started; therefore
a separate manual in-app-browser inspection was unavailable. This environmental limitation is also in
the sprint log.

## Judgment calls and deviations

- `applyTurnResult` takes the plan-permitted fourth `retryInput` argument so exact retry payloads are
  retained without parsing or inference.
- Unknown error fixture typing is isolated to the temporary fixture boundary because installed
  `ErrorDto` closes its known code union while the visual plan requires an unknown-code treatment.
- `ProposalReviewSurfaceProps` adds optional `clientPreview`, `openedBlock`, and `isEditSubmitting`
  presentation inputs because the fixed view-model boundaries otherwise provide no route for the
  planned preview/replacement/submission states. No temporary contract crosses into the component.
- The agent subtree alone waits for hydration so independently generated server/client UUIDs cannot
  mismatch. Stable landmarks, the divider, and its live region remain present continuously.
- Phase-04 E2E assumptions about a fixed pre-sprint tab count and the intrinsic width of standard
  visually-hidden labels were amended. Keyboard reachability, visible focus, and visible-overflow
  invariants remain direct assertions and were not weakened.

## File and tool delta

Pass A changes 102 files from the authorized starting SHA to the verification SHA: 82 added and 20
modified. The sprint log records counts by exact subsystem and the reproducible `git diff --name-status`
range. Added runtime dependency: `@radix-ui/react-popover@1.1.23`. Added theme names are the eight
ratified `--color-paper*` tokens listed in sprint log §16. Fonts are `Plus_Jakarta_Sans` and
`IBM_Plex_Mono` via `next/font/google`. The temporary fixture latency is 700 ms.

No architecture graph was present, so there is no graph delta. No backend, persistence, route,
navigation, or proposal-sending code was added.

## Pass B boundary

Pass B owns durable unread activation/clearing semantics; concurrency, stale-result, de-duplication,
and retry machinery beyond the Pass A origin/turn guard; complete validation/failure routing;
discard-dialog wiring; retained-context action correctness; and deeper behavioral invariants. Backend
integration and phases 16–17 remain later work. Pass B can begin from these component/view-model
contracts without re-planning.

## Owner decisions required

None.
