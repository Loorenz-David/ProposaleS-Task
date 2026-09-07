---
plan: plans/phase-04-derived-presentation.md
role: implementer
round: 1
date: 2026-09-07
state: IMPLEMENTED
actor: Codex
---

# Phase 04 round 1 handoff

## Outcome

Implemented derived session-tab status as a render-time pure function, the era-1 temporary
runtime fixture, the derivation register, the accessible tab status, the status dot treatment,
and the mounted agent status line. Updated the session factory's five inputs, the navigation
guard, the explicit no-preference Playwright context, the module map, both phase state cells,
and the plan Review log. No UI design file, theme property, unread/attention behavior, status
note, turn dispatch, close guard, agent header, thread, or future-implementation file changed.

## Full write perimeter

Documents:

- `build_docs/under_constroction/frontend_core/master-plan.md`
- `build_docs/under_constroction/frontend_core/plans/phase-04-derived-presentation.md`
- `build_docs/under_constroction/frontend_core/handoffs/implementer/phase-04-round-1.handoff.implementer.md`

Production source:

- `src/features/proposal-preparation/types/session.ts`
- `src/features/proposal-preparation/hooks/use-workspace-session-store.ts`
- `src/features/proposal-preparation/client/view-models/session-tab.ts`
- `src/features/proposal-preparation/client/derivation-register.ts`
- `src/features/proposal-preparation/client/fixtures/session-runtime.temporary-fixture.ts`
- `src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx`
- `src/features/proposal-preparation/components/agent/agent-status-line.tsx`
- `src/features/proposal-preparation/components/workspace/agent-surface.tsx`
- `src/app/page.tsx` (mutation probe only; reverted, no retained change)

Test source:

- `src/features/proposal-preparation/client/view-models/session-tab.test.ts`
- `src/features/proposal-preparation/client/derivation-register.test.ts`
- `src/features/proposal-preparation/client/fixtures/session-runtime.temporary-fixture.test.ts`
- `src/features/proposal-preparation/components/agent/agent-status-line.test.tsx`
- `src/features/proposal-preparation/components/workspace/workspace.test.tsx`
- `src/features/proposal-preparation/hooks/use-workspace-session-store.test.ts`
- `e2e/workspace.spec.ts`

Mutation-probe files, applied and reverted:

- C2(h): `src/features/proposal-preparation/client/view-models/session-tab.ts`
- C3(d): `src/features/proposal-preparation/client/view-models/session-tab.ts`, `src/features/proposal-preparation/components/agent/agent-status-line.tsx`
- C6(c): `src/features/proposal-preparation/components/agent/agent-status-line.tsx`
- C7(a): `src/features/proposal-preparation/components/workspace/agent-surface.tsx`
- C7(b): `src/app/page.tsx`

No generated file change was retained; the verification-created `tsconfig.tsbuildinfo` change
was restored before closeout.

## Coverage map

Each row is listed once. “Exact” means the assertion shape is the row's stated measurement;
“weaker” means it supports the row but does not itself render the full surface.

| Row | Test / evidence | Shape |
|---|---|---|
| C1(a) | `client/view-models/session-tab.test.ts` — in-flight case | Exact status and text |
| C1(b) | `client/view-models/session-tab.test.ts` — draft-reference case | Exact status and text |
| C1(c) | `client/view-models/session-tab.test.ts` — clarification case | Exact status and text |
| C1(d) | `client/view-models/session-tab.test.ts` — proposition case | Exact status and text |
| C1(e) | `client/view-models/session-tab.test.ts` — started-only case | Exact status and text |
| C1(f) | `client/view-models/session-tab.test.ts` and temporary-fixture test | Exact status and text |
| C2(a) | `client/view-models/session-tab.test.ts` | Exact overlap outcome |
| C2(b) | `client/view-models/session-tab.test.ts` | Exact overlap outcome |
| C2(c) | `client/view-models/session-tab.test.ts` | Exact overlap outcome |
| C2(d) | `client/view-models/session-tab.test.ts` | Exact overlap outcome |
| C2(e) | `client/view-models/session-tab.test.ts` | Exact overlap outcome |
| C2(f) | `client/view-models/session-tab.test.ts` | Exact overlap outcome |
| C2(g) | `client/view-models/session-tab.test.ts` | Exact non-seventh-status outcome |
| C2(h) | Named mutation ledger below; C2(d) is the red assertion | Exact mutation proof |
| C3(a) | `components/agent/agent-status-line.test.tsx` tab name case | Exact accessible-name rendering |
| C3(b) | Held for phase 05's reachable working session | Held, intentionally no test |
| C3(c) | `components/agent/agent-status-line.test.tsx` source mutation case | Exact same-record update of dot and line |
| C3(d) | Named mutation ledger below; C3(c) is the red assertion | Exact mutation proof |
| C3(e) | `components/agent/agent-status-line.test.tsx` source scan | Exact closed-set absence check with non-empty subject |
| C6(a) | `client/derivation-register.test.ts` | Exact enumeration; closure half held for phase 15 |
| C6(b) | `components/agent/agent-status-line.test.tsx` and adapter test | Exact rendered update; adapter assertion is weaker support |
| C6(c) | Named mutation ledger below; C6(b) is the red assertion | Exact mutation proof |
| C7(a) | `components/agent/agent-status-line.test.tsx` landmark identity case | Exact invariant across all six statuses |
| C7(b) | Existing `workspace.test.tsx` C5(a), widened regex | Exact source guard and mutation proof |

No test is orphaned from the phase rows. No candidate criterion was found.

## Baseline before production edits

The repository baseline before phase test files existed was 19 Vitest files and 184 passing
tests. After the four phase test files were authored but before production edits, the phase
baseline was intentionally red: 4 failed suites, 0 tests collected, all because the four
planned source modules did not yet exist (`derivation-register`, `session-runtime.temporary-fixture`,
`session-tab`, and `agent-status-line`). This is the captured pre-production red baseline; it
was not reconstructed after implementation.

## Named mutation ledger

| Mutation | Site | Command | Observed red | Revert |
|---|---|---|---|---|
| C2(h) | swap rows 2/3 in `client/view-models/session-tab.ts` at the precedence definition | `npx vitest run src/features/proposal-preparation/client/view-models/session-tab.test.ts --reporter=verbose` | C2(d) failed: expected `created`, received `questions`; 1 failed / 15 | Reverted the two condition lines |
| C3(d) | store computed status beside the record in `client/view-models/session-tab.ts`; make `agent-status-line.tsx` read that stored field | `npx vitest run src/features/proposal-preparation/components/agent/agent-status-line.test.tsx --reporter=verbose` | C3(c)/C6(b) failed at initial render: expected `Empty`, received empty; 1 failed / 4 | Reverted both sites |
| C6(c) | `agent-status-line.tsx`: store the formatted status with `useState` and render the stored field | `npx vitest run src/features/proposal-preparation/components/agent/agent-status-line.test.tsx --reporter=verbose` | C3(c)/C6(b) failed after source update: expected `Open`, received `EmptyEmpty`; 1 failed / 4 | Reverted import, state, and render reads |
| C7(a) | `agent-surface.tsx`: make the landmark role depend on `working` | `npx vitest run src/features/proposal-preparation/components/agent/agent-status-line.test.tsx --reporter=verbose` | C7(a) failed: no `complementary` landmark while working; 1 failed / 4 | Reverted the role branch and imports |
| C7(b) | `src/app/page.tsx`: plant `window.location.href = "/x"` | `npx vitest run src/features/proposal-preparation/components/workspace/workspace.test.tsx -t 'keeps only the root route files' --reporter=verbose` | C5(a)/C7(b) failed: widened denylist matched the planted assignment; 1 failed / 13 | Removed the planted line |

Executed/declaration arithmetic: C2(h) 1 + C3(d) 1 + C6(c) 1 + C7(a) 1 + C7(b) 1 = 5
executed, 5 declared.

## Evidence

The final stamp is taken on the handoff tree identified as `HEAD 0cc02d8` plus working-tree
fingerprint `d51f583de9e3b724694c07bdad021d11631dd92cc1aefe8c55c7dc1c5dd51f9d` (the digest
covers every tracked or untracked project file except this self-referential handoff).

- `npx vitest list`: all four new test files collected; node owns the three `.test.ts` files and jsdom owns `agent-status-line.test.tsx`.
- Targeted phase surface: 7 files, 56 tests passed.
- Full unit suite: 23 files, 205 tests passed.
- `CI=1 npm run test:e2e`: 69 tests passed. The first non-CI run showed the documented dev-overlay focus flake and one title-label regression; the title label was restored, and the fresh non-reused run passed 69/69.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.

The reduced-motion correction itself is implemented with `motion-reduce:animate-none`; its
browser proof remains structurally held under C3(b) until phase 05 creates a reachable working
session. C6(a)'s open-universe closure half remains held for phase 15.

## Delegations decided

- Accessible name: `aria-label` on the tab trigger, retaining the title span's label for elision. This keeps the entire spoken name on the interactive element and adds no focus stop.
- Status line markup: a bordered, padded two-column line inside the Agent Surface, with the same status text rendered as the visible status and phase label; no status note.
- `TabViewModel`: `{ title, status, statusText, dotClassName }`, with `deriveTabStatus` exported separately; both tab and status line call `toTabViewModel` on the same runtime record.

## Owner layer notes for the coordinator

The implementation is ready for review. The first non-CI E2E run exposed the known dev-server
overlay tab-order flake as well as the removed title-span accessible name; the latter was fixed
and the fresh CI-mode run was green. Review should preserve the temporary result-kind marker,
the two held rows, the five-mutation arithmetic, and the two one-line guard changes.
