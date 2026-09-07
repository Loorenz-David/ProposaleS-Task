---
plan: plans/phase-03-session-runtime-and-tabs.md
role: implement
round: 4
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 03 fix round 4 handoff

## Outcome

All four dispatched corrections are implemented within the declared perimeter:

- B3: close-induced focus repair is guarded so focusing the repaired tab does not activate it;
  C3(a) asserts active-session identity before/after and the repaired focus destination.
- S10: the tab strip is the first child of the Agent Surface.
- S11: the store seeds one page-lifetime session at module scope. The three readiness waits in
  `e2e/workspace.spec.ts` were retired: C2(a), C2(e), and the three parameterized C4(width)-3
  instances. None was kept.
- C4(b): the browser helper polls the existing overflow and margin predicates, fixing the
  asynchronous resize-observer synchronization race without removing an operation or weakening
  the five-operation geometry assertion.

## Coverage map

One line per plan row; held rows are routed rather than claimed as phase coverage.

| Row | Test id → assertion shape → runner |
|---|---|
| C1(a) | `session-store › creates stable ids across create/move/close` → stable distinct nominal ids → node |
| C1(b) | `session-store source allowlist › permitted generator only` → one permitted generator and no positional source → node |
| C1(c) | held → phase 05 dispatch surface / phase 16 browser boundary |
| C1(d) | held → phase 05 dispatch surface / returned workflow state |
| C1(e) | held → phase 05 dispatch probe / generation-id position |
| C2(a) | `moveSession › moves one item and preserves other order` → one move and relative order → node |
| C2(b) | `moveSession › preserves active id on pointer and keyboard calls` → active id unchanged → node |
| C2(c) | `moveSession` plus `SessionTabStrip` same-index tests → list reference, live-region child count, and focus identity unchanged → node/jsdom |
| C2(d) | `moveSession › out-of-range targets are no-ops` → boundary no-op → node |
| C2(e) | `moveSession › pointer and keyboard adapters share indices and function` plus drag handler coverage → same function and indices → node/jsdom |
| C2(f) | `SessionTabStrip › keyboard reorder retains focus and announces position` → moved tab focus and position announcement → jsdom |
| C2(g) | `SessionTabStrip › reorder has keyboard path` → modifier-arrow path exists → jsdom |
| C2(h) | `moveSession › applies against list changed during drag` → current list and no removed target → node |
| C3(a) | `closeSession › closes background and repairs focus target` → active id unchanged and focus repaired/clamped → jsdom |
| C3(b) | `closeSession › active middle chooses same index and focuses it` → same-index active/focus destination → jsdom |
| C3(c) | `closeSession › active last chooses previous and focuses it` → previous active/focus destination → jsdom |
| C3(d) | `closeSession › sole tab creates replacement before removal` → fresh record and focus → jsdom |
| C3(e) | `closeSession › never exposes empty transition list` → every observed list non-empty → node |
| C3(f) | `closeSession › never focuses body` → tab focus after all close cases → jsdom |
| C3(g) | `closeSession › never reuses a closed id` → closed id distinct from later creation → node |
| C3(h) | `closeSession mutation › same-index active choice is required` → planted first-index choice reddens → jsdom |
| C3(i) | `close gate source allowlist › one named gate owns all removals` → subject and exact gate allowlist → node |
| C4(a) | `revealActiveTabScrollLeft › five movement cases` → pure margin arithmetic → node |
| C4(b) | `session tabs › active tab stays inside strip after switch/reorder/close/create/resize` → visible overflow and both margins after five operations → Playwright |
| C4(c) | `source allowlist › no scrollIntoView construct` → member-access allowlist with subject → node |
| C4(d) | `source allowlist › no document query/selector construct` → browser-access allowlist with subject → node |
| C4(e) | `source allowlist › no window width during render` → render-phase access allowlist with subject → node |
| C4(f) | three C4(f) probes → computed/globalThis novel forbidden constructs redden their corresponding allowlists → node |
| C5(a) | `SessionTabStrip › named horizontal tablist` → role, orientation, and name → jsdom |
| C5(b) | `SessionTabStrip › selected and roving tabindex` → exactly one 0 and selected tab → jsdom |
| C5(c) | `SessionTabStrip › complete grounded key map` → enumerated navigation, no-wrap, and activation → jsdom |
| C5(d) | `SessionTabStrip › every tab has sibling named close control` → keyboard-reachable sibling close → jsdom |
| C5(e) | `session tabs › visible focus indicators` → computed focus styles → Playwright |
| C5(f) | `session tabs › close hit area` → close target ≥24px → Playwright |
| C5(g) | `session tabs › title span elision name` → elided span name equals own text → Playwright |
| C6(a) | `ProposalWorkspace › landmark counts/identity after every operation` → one complementary and one main on each operation/commit → jsdom |
| C6(b) | `ProposalWorkspace › landmark elements never remount` → element identity stable → jsdom |
| C6(c) | `session tabs › operations do not change URL/history` → URL/history unchanged → Playwright |
| C6(d) | held → phase 04 status and phase 14 Main Surface state |
| C6(e) | `activation history mutation › pushState reddens URL test` → planted history mutation reddens → Playwright |
| C6(f) | `active-session remount mutation › conditional AgentSurface reddens identity test` → planted remount reddens → jsdom |
| C7(a) | `createSession › appends at end` → insertion-at-zero mutation reddens → node |
| C7(b) | `createSession › activates created session` → new id active → node |
| C7(c) | `createSession › creates separate empty record` → record isolated and empty → node |
| C7(d) | `SessionTabStrip › new session control is named and keyboard reachable` → accessible keyboard button → jsdom |
| C7(e) | `SessionTabStrip › new control is sibling outside tablist scroll region` → sibling and outside scroll region → jsdom |
| C7(f) | `C7(f) › first render contains a real session tab` → server markup has tablist, tab, and live new-session control plus module seed → jsdom/server |

The map totals 47 rows: 5 + 8 + 9 + 6 + 7 + 6 + 6. Four are held (C1(c), C1(d), C1(e),
C6(d)); 43 are measurable in this phase. Every phase-owned test remains mapped; the three
readiness waits removed from the inherited workspace tests were synchronization aids, not new
assertions.

## Mutation evidence

The plan declares 18 runnable named mutations: C1(b) 1, C2(b) 1, C2(c) 3, C3(a) 1, C3(e) 1,
C3(g) 1, C3(h) 1, C3(i) 1, C4(f) 3, C5(c) 1, C6(e) 1, C6(f) 1, C7(a) 1, and C7(f) 1.
The prior 16 records are in the round-2 handoff. The two new records are:

| Row/site | Command | Observed red | Revert |
|---|---|---|---|
| C3(a), `session-tab-strip.tsx` `onFocus` call site; removed `repairingFocusRef` guard | `npm test -- --run src/features/proposal-preparation/components/session-tabs/session-tab-strip.test.tsx -t 'C3(a,f)'` | 1 failure: C3(a,f), active-session assertion received the repaired tab id instead of the unchanged id | restored guarded `onFocus` |
| C7(f), `use-workspace-session-store.ts` module seed; replaced with empty state and restored post-mount creation | `npm test -- --run src/features/proposal-preparation/components/session-tabs/session-tab-strip.test.tsx -t 'C7(f)'` | 1 failure: C7(f), module-scope seed assertion did not match | restored module-scope `createInitialSession()` |

All 18 total named mutations are accounted for by the plan arithmetic; no new mutation was added.

## Evidence

- Baseline before edits: `npm test -- --run` — 183/183 unit tests, no red baseline in the
  existing suite. The isolated pre-fix C4(b) reproduced at the resize step with right margin
  `-40` against required `8`.
- Targeted post-fix session tests: 22/22.
- Closing stamp: `npm test -- --run` — 184/184; `npm run typecheck` — green; `npm run lint` —
  green; `npm run build` — green on Next.js 16.3.4.
- Clean E2E run 1: 68/69; C4(b) passed, inherited `workspace.spec.ts` C2(a) failed because
  the next dev-tools overlay took a tab stop. Clean E2E run 2: 68/69, same registered C2(a)
  failure; C4(b) passed. Clean E2E run 3: 68/69, same registered C2(a) failure; C4(b) passed.
  The mandated isolated C2(a) retry also failed, confirming the registered environment flake;
  no product assertion was changed.
- The final tracked worktree contains only the declared files below; generated `next-env.d.ts`
  and `tsconfig.tsbuildinfo` changes from verification were restored before handoff.

## Full write perimeter

Persisted cycle files:

- `src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx`
- `src/features/proposal-preparation/components/session-tabs/session-tab-strip.test.tsx`
- `src/features/proposal-preparation/components/workspace/agent-surface.tsx`
- `src/features/proposal-preparation/hooks/use-workspace-session-store.ts`
- `e2e/session-tabs.spec.ts`
- `e2e/workspace.spec.ts`
- `build_docs/under_constroction/frontend_core/plans/phase-03-session-runtime-and-tabs.md`
- `build_docs/under_constroction/frontend_core/master-plan.md` (tracker row 03 only)
- `build_docs/under_constroction/frontend_core/handoffs/implementer/phase-03-fix-round-4.handoff.implementer.md`

Mutation-probe files, applied and reverted (listed separately from persisted fixes):

- `src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx`
- `src/features/proposal-preparation/hooks/use-workspace-session-store.ts`

No architecture-graph state exists and no graph delta was written. No files outside the declared
perimeter were persisted.

## Owner decisions required

nothing needs you
