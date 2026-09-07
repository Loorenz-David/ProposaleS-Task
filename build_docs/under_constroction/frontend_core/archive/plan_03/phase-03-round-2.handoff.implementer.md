---
plan: plans/phase-03-session-runtime-and-tabs.md
role: implement
round: 2
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 03 round 2 — implementation handoff

Implemented the page-lifetime session runtime and Radix-backed session tab strip. The workspace
now supports creating, activating, keyboard/pointer reordering, closing, focus repair, active-tab
reveal and browser evidence while preserving the single persistent landmark shell. The close action
is intentionally unguarded; phase 05 owns the confirmation guard.

**OWNER DECISIONS REQUIRED (0)**

Nothing needs owner input for this handoff. The two delegated choices were resolved in the
implementation Review log: use the resolving `@radix-ui/react-tabs@1.1.21` dependency with its
resolved `@radix-ui/react-roving-focus@1.1.19` dependency, and place the new-session control as a
direct sibling of the scrolling tablist.

## Coverage map

All 46 acceptance rows are accounted for below. The four held rows remain held and are not counted
as implemented coverage; the sub-probes nested under C2(c) and C4(f) are called out in their parent
rows.

| Row | Result and evidence |
|---|---|
| C1(a) | Covered by store create/move/close identity tests; node runner. |
| C1(b) | Covered by the id-construction AST/source allowlist; node runner. |
| C1(c) | Held for phase 05 dispatch surface and phase 16 browser boundary. |
| C1(d) | Held for phase 05 returned workflow state. |
| C1(e) | Held for phase 05 dispatch probe. |
| C2(a) | Covered by exact move-order store test; node runner. |
| C2(b) | Covered for both active and inactive moved tabs and both adapters; node runner. |
| C2(c) | Covered as three independent no-op probes: list reference, announcement child count and active-element identity; node/jsdom runners. |
| C2(d) | Covered by out-of-range move no-op test; node runner. |
| C2(e) | Covered by shared move-function/index assertions plus the drag-handler source path; node/jsdom runners. |
| C2(f) | Covered by keyboard reorder focus retention and one-position announcement; jsdom runner. |
| C2(g) | Covered by modifier-arrow keyboard reorder path; jsdom runner. |
| C2(h) | Covered against a list changed during drag; node runner. |
| C3(a) | Covered by background close and focus preservation/clamping; jsdom runner. |
| C3(b) | Covered by active-middle same-index replacement and focus; jsdom runner. |
| C3(c) | Covered by active-last previous-tab replacement and focus; jsdom runner. |
| C3(d) | Covered by sole-tab fresh replacement and focus; jsdom runner. |
| C3(e) | Covered by non-empty transition observation; node runner. |
| C3(f) | Covered by close focus destination never being body; jsdom runner. |
| C3(g) | Covered by closed-id uniqueness after create/close/create; node runner. |
| C3(h) | Covered by planted same-index active-choice probe; jsdom runner. |
| C3(i) | Covered by the single named close-gate source allowlist; node runner. |
| C4(a) | Covered by five pure reveal-arithmetic cases for switch, reorder, close, create and resize; node runner. |
| C4(b) | Covered by Playwright geometry after all five movement operations. |
| C4(c) | Covered by feature-source allowlist plus a novel `scrollIntoView` mutation. |
| C4(d) | Covered by feature-source browser-access allowlist plus a novel document access mutation. |
| C4(e) | Covered by feature-source render allowlist plus a novel viewport-width mutation. |
| C4(f) | Covered by all three named forbidden-mechanism mutations; every probe reddened and was reverted. |
| C5(a) | Covered by named horizontal tablist jsdom test. |
| C5(b) | Covered by selected state and exact roving tabindex jsdom test. |
| C5(c) | Covered by the complete explicit non-wrapping keyboard map and `loop={false}` source assertion. |
| C5(d) | Covered by sibling close controls, names and keyboard reachability; jsdom runner. |
| C5(e) | Covered by Playwright computed focus indicators. |
| C5(f) | Covered by Playwright close hit-area measurement (at least 24px). |
| C5(g) | Covered by Playwright full-title elision/name measurement on the inner title span. |
| C6(a) | Covered by per-operation landmark count and commit-recording probe; jsdom runner. |
| C6(b) | Covered by landmark element identity across session operations; jsdom runner. |
| C6(c) | Covered by Playwright URL/history invariance and the jsdom operation sequence. |
| C6(d) | Held for phase 04 status and phase 14 Main Surface state. |
| C6(e) | Covered by planted `history.pushState` Playwright mutation; it reddened and was reverted. |
| C6(f) | Covered by planted active-keyed `AgentSurface` jsdom mutation; it reddened and was reverted. |
| C7(a) | Covered by append-order store assertion and index-zero mutation; it reddened and was reverted. |
| C7(b) | Covered by created-session activation store assertion. |
| C7(c) | Covered by separate empty-record store assertion. |
| C7(d) | Covered by named keyboard-reachable new-session control; jsdom runner. |
| C7(e) | Covered by sibling/outside-scroll-region DOM relationship; jsdom runner. |

## Implementation and decisions

- Added a nominal `WorkspaceSessionId`, `SessionRuntimeRecord`, and one Zustand feature store with
  page-lifetime state only. IDs use `globalThis.crypto.randomUUID()` and are never persisted.
- Created the initial session on the client after mount, guarded against React Strict Mode's
  development double-effect invocation.
- Used Radix Tabs as the composite foundation, explicitly setting `activationMode="manual"` and
  `loop={false}` at the application boundary. The persistent `aside` remains the landmark; the
  forced-mounted relationship targets are hidden non-landmark tab panels.
- Kept every close control as a sibling of its tab trigger, and routed all close paths through one
  named gate. Closing the sole tab atomically creates a replacement before exposing the new state.
- Implemented a direct ref-based reveal helper with a fixed 8px clearance margin. No document
  selector, `scrollIntoView`, viewport-width render read, URL, history or persistence mechanism was
  introduced.
- Kept the tablist itself as the horizontal overflow owner. The title span owns the frozen elision
  marker and accessible full-title name; the new-session button is outside the scroll region.
- Used store tests for transitions, jsdom for roles/focus/key/announcement behavior and Playwright
  for geometry, computed focus, hit area, elision and URL/history behavior.

## Mutation ledger

The declared arithmetic is 16 = 1 + 1 + 3 + 1 + 1 + 1 + 1 + 1 + 3 + 1 + 1 + 1. Every mutation
reddened its named subject and was reverted:

1. C1(b) module-level counter at the store id construction site — source allowlist red.
2. C2(b) move changed the active id — active-id assertion red.
3. C2(c)-i unconditional same-index store write — list-reference assertion red.
4. C2(c)-ii unconditional same-index announcement — announcement assertion red.
5. C2(c)-iii unconditional same-index focus — focus assertion red.
6. C3(e) empty intermediate close state — transition assertion red.
7. C3(g) array-index id generation — closed-id uniqueness assertion red.
8. C3(h) active close chose index zero — same-index replacement assertion red.
9. C3(i) second direct close removal — single-gate source allowlist red.
10. C4(f)-i `scrollIntoView` — operation allowlist red.
11. C4(f)-ii `document.getElementById` — document allowlist red.
12. C4(f)-iii render-time `window.innerWidth` — window allowlist red.
13. C5(c) removed explicit `loop={false}` — configuration assertion red.
14. C6(e) activation pushed history — Playwright URL/history assertion red.
15. C6(f) keyed `AgentSurface` by active id — landmark identity assertion red.
16. C7(a) inserted new sessions at index zero — append-order assertion red.

Mutation probes touched the production/test files independently of the final implementation:
`use-workspace-session-store.ts` (1–3, 6–8, 16), `session-tab-strip.tsx` (4–5, 9, 10–15), and
the corresponding source-allowlist, transition, interaction and browser tests. No probe residue
remains.

## Evidence and tree identity

Baseline before edits: tree `c677e0186d7193c20d941cbde8e51a7b30063bf9`; 154/154 unit tests,
66/66 end-to-end tests, typecheck and build green. Lint passed on the required serial retry after
an environment-only parallel `test-results/` race.

Final closing stamp, run serially after the final correction:

- `npm test` — 183/183 green (19 files).
- `npm run test:e2e` — 69/69 green (69 tests, including 3 new session-tab tests).
- `npm run typecheck` — green.
- `npm run lint` — green.
- `npm run build` — green on Next.js 16.3.4.
- `git diff --check` — green; generated `next-env.d.ts` and `tsconfig.tsbuildinfo` restored.

The first post-correction full E2E run exposed the startup-sensitive inherited `C2(e)` tab-order
probe; its isolated run passed, and the permitted readiness wait made the subsequent full 69-test
run green. The known dev-overlay `C2(a)` row was green in the final full run. The intermediate
unit run also caught and corrected one arbitrary styling radius before the final 183-test green
stamp.

## Write perimeter and pipeline records

Implementation files changed: `src/features/proposal-preparation/types/session.ts`,
`src/features/proposal-preparation/hooks/use-workspace-session-store.ts` and its test,
`src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx` and its test,
`reveal-active-tab.ts` and its test, `session-tabs-constants.ts`,
`src/features/proposal-preparation/components/workspace/agent-surface.tsx`,
`e2e/session-tabs.spec.ts`, and the five permitted re-baseline edits in `e2e/workspace.spec.ts`.

Dependency/documentation changes: `package.json`, `package-lock.json`, and `README.md`.
Pipeline records: this phase plan's Review log and the phase-03 tracker row in
`master-plan.md`. Generated Next.js/typecheck artifacts were not retained. No architecture graph
exists in the repository, so there is no graph delta.

The implementation checkpoint is commit `5f34897` (`CHECKPOINT (not approved): frontend 03
session runtime and tabs`). This handoff itself is the pipeline handoff artifact and is
intentionally not included in the implementation-only staging perimeter.
