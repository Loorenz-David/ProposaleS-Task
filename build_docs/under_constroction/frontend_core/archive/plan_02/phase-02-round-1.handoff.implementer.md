---
plan: plans/phase-02-workspace-shell.md
role: implement
round: 1
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 02 round 1 handoff

Implemented the persistent Proposal Preparation workspace shell: a server page composes one
client workspace root with one named complementary Agent Surface, one named Main Application
Surface, a valued keyboard/pointer divider, and an honest idle state. The skip link, responsive
clamp, page-lifetime width, narrow-width containment, and source-level scope perimeter are covered.

## Coverage map

Each plan row is listed once. “Exact” means the test assertion measures the row's stated shape;
“weaker” means the available test is only partial. Named mutation rows point to the mutation
ledger below. The carried phase-01 tests are listed separately because they are inherited evidence.

| Row | Test id / evidence | Shape |
|---|---|---|
| C1(a) | `workspace.test.tsx` — `C1(a)` | Exact: one named complementary role |
| C1(b) | `workspace.test.tsx` — `C1(b)` | Exact: one main role |
| C1(c) | `workspace.test.tsx` — `C1(c)` | Exact: directive placement in page/root source |
| C1(d) | `workspace.spec.ts` — skip-link test | Exact: first tab stop and visible on focus |
| C1(e) | `workspace.spec.ts` — `C1(e)` | Exact: activation focuses main |
| C1(f) | `workspace.test.tsx` — `C1(f)`; E2E `C1(f)` | Exact: node identity survives resize |
| C1(g) | Mutation M1 | Exact mutation probe: second main reddens C1(b) |
| C1(h) | Mutation M2 | Exact mutation probe: second complementary reddens C1(a) |
| C2(a) | `workspace.spec.ts` — divider semantics | Exact: role, orientation, name, now/min/max |
| C2(b) | `workspace.spec.ts` — effective maximum | Exact: two viewport maxima differ |
| C2(c)-arrow decrease | `workspace.spec.ts` — `C2(c): arrow decrease` | Exact: contract-derived width and focus |
| C2(c)-arrow increase | `workspace.spec.ts` — `C2(c): arrow increase` | Exact: contract-derived width and focus |
| C2(c)-shifted decrease | `workspace.spec.ts` — `C2(c): shifted decrease` | Exact: contract-derived width and focus |
| C2(c)-shifted increase | `workspace.spec.ts` — `C2(c): shifted increase` | Exact: contract-derived width and focus |
| C2(c)-Home | `workspace.spec.ts` — `C2(c): Home` | Exact: contract-derived width and focus |
| C2(c)-End | `workspace.spec.ts` — `C2(c): End` | Exact: effective maximum and focus |
| C2(c)-Enter | `workspace.spec.ts` — `C2(c): Enter reset` | Exact: default width and focus |
| C2(c)-Space | `workspace.spec.ts` — `C2(c): Space reset` | Exact: default width and focus |
| C2(d) | `workspace.spec.ts` — reset/drag announcement | Exact: one reset announcement, drag silent |
| C2(e) | `workspace.spec.ts` — divider from document start | Exact: keyboard reachability without pointer |
| C2(f) | `workspace.spec.ts` — double-click reset | Exact: default width and one polite announcement |
| C3(a) | `use-divider-width.test.ts` — `C3(a)` | Exact: lower clamp bound |
| C3(b) | `use-divider-width.test.ts` — `C3(b)` | Exact: upper clamp bound |
| C3(c) | `use-divider-width.test.ts` — `C3(c)` | Exact: agent minimum wins at conflict |
| C3(d) | `use-divider-width.test.ts` — `C3(d)` | Exact: hook derives re-clamped width after container change |
| C3(e) | `use-divider-width.test.ts` — `C3(e)` | Exact: named constants define the contract |
| C3(f) | Mutation M3 | Exact mutation probe: reversed ordering reddens C3(c) |
| C4(1440)-1 | `workspace.spec.ts` — document overflow | Exact: document horizontal overflow |
| C4(1440)-2 | `workspace.spec.ts` — pane overflow | Exact: pane/column containment |
| C4(1440)-3 | `workspace.spec.ts` — keyboard reachability | Exact: skip link then divider focus |
| C4(1440)-4 | `workspace.spec.ts` — elided text | Exact: positive rendered width and full accessible name |
| C4(1440)-5 | `workspace.spec.ts` — agent minimum | Exact: attempted below-min resize remains above minimum |
| C4(1100)-1 | `workspace.spec.ts` — document overflow | Exact |
| C4(1100)-2 | `workspace.spec.ts` — pane overflow | Exact |
| C4(1100)-3 | `workspace.spec.ts` — keyboard reachability | Exact |
| C4(1100)-4 | `workspace.spec.ts` — elided text | Exact |
| C4(1100)-5 | `workspace.spec.ts` — agent minimum | Exact |
| C4(780)-1 | `workspace.spec.ts` — document overflow | Exact |
| C4(780)-2 | `workspace.spec.ts` — pane overflow and column width | Exact |
| C4(780)-3 | `workspace.spec.ts` — keyboard reachability | Exact |
| C4(780)-4 | `workspace.spec.ts` — elided text | Exact |
| C4(780)-5 | `workspace.spec.ts` — agent minimum | Exact |
| C4(e) | Mutation M4 | Exact mutation probe: fixed column reddens condition 2 at 780px |
| C4(f) | Mutation M5 | Exact mutation probe: missing tabindex reddens condition 3 at all widths |
| C4(g) | Mutation M6 | Exact mutation probe: truncated accessible name reddens condition 4 at 780px |
| C4(h) | Mutation M7 | Exact mutation probe: below-min clamp reddens condition 5 at 780px |
| C5(a) | `workspace.test.tsx` — source perimeter C5(a) | Exact allowlist plus navigation denylist |
| C5(b) | `workspace.test.tsx` — source perimeter C5(b) | Exact named denylist |
| C5(c) | `workspace.test.tsx` — source perimeter C5(c) | Exact export allowlist and union members |
| C5(d) | `workspace.test.tsx` — source perimeter C5(d) | Exact lexical one-main count |
| C5(e) | Mutations M8 and M9 | Exact mutation probes: surface-kind union reddens C5(c), second feature main reddens C5(d) |
| C6(a) | `workspace.test.tsx` and `workspace.spec.ts` — idle allowlist | Exact: heading/supporting text and no list/nav/link/status roles |
| C6(b) | `workspace.test.tsx` and `workspace.spec.ts` — idle in main | Exact: idle is inside one main |
| C6(c) | `workspace.test.tsx` and `workspace.spec.ts` — idle navigation | Exact: no link/href and source denylist |
| C6(d) | `workspace.test.tsx` and `workspace.spec.ts` — idle focus | Exact: no first-render focus in idle |
| C6(e) | `workspace.test.tsx` and `workspace.spec.ts` — idle announcement | Exact: no live/status/alert node, including idle root |
| C6(f) | Mutation M10 | Exact mutation probe: idle aria-live reddens C6(e) |
| C6(g) | Mutation M11 | Exact mutation probe: idle list reddens C6(a) allowlist |

The map runs both ways. Every phase-owned test appears above. The first test and the carried
phase-01 checks are intentionally not mapped to a phase-02 row beyond their overlapping C1/C2/C4
surface assertions; they are recorded as inherited evidence below.

## Named mutation ledger

Arithmetic: C1 = 2, C2 = 0, C3 = 1, C4 = 4, C5 = 2, C6 = 2; total **11 declared and 11
executed**.

| ID | Site and hypothesis | Command and observed red | Revert / touched probe files |
|---|---|---|---|
| M1 | `main-application-surface.tsx`, definition JSX: add a second `main`; C1(b) must fail | `npx vitest run .../workspace.test.tsx -t C1`; `C1(b): renders exactly one main`, expected 1 got 2 (C1(f) also became ambiguous) | Reverted. `src/features/.../components/workspace/main-application-surface.tsx` |
| M2 | `agent-surface.tsx`, definition JSX: add a second complementary region; C1(a) must fail | `npx vitest run .../workspace.test.tsx -t C1`; `C1(a): renders exactly one named complementary region`, expected 1 got 2 (C1(f) also became ambiguous) | Reverted. `src/features/.../components/workspace/agent-surface.tsx` |
| M3 | `use-divider-width.ts`, definition: reverse effective-max ordering so main minimum wins; C3(c) must fail | `npx vitest run .../use-divider-width.test.ts -t C3`; `C3(c): when minima conflict, the agent minimum wins`, expected 320 got 460 | Reverted. `src/features/.../hooks/use-divider-width.ts` |
| M4 | `proposal-preparation-idle-surface.tsx`, definition class: use fixed 840px column; C4 condition 2 at 780px must fail | Initial probe was green because the flex item shrank; the condition was re-sited with `flex-none` so the browser measured the content column. `npx playwright test e2e/workspace.spec.ts -g 'C4.*780-2'`; condition 2 assertion received false for undeclared overflow | Reverted to `w-full max-w-[840px]` after the re-siting. `src/features/.../components/idle/proposal-preparation-idle-surface.tsx` |
| M5 | `workspace-divider.tsx`, definition JSX: remove `tabIndex`; C4 condition 3 must fail at 1440, 1100, 780 | `npx playwright test e2e/workspace.spec.ts -g 'C4.*-3'`; all three `toBeFocused` assertions failed after skip-link tabbing | Reverted. `src/features/.../components/workspace/workspace-divider.tsx` |
| M6 | `agent-surface.tsx`, definition JSX: set elided `aria-label` to truncated text; C4 condition 4 at 780px must fail | `npx playwright test e2e/workspace.spec.ts -g 'C4.*780-4'`; expected full text, received `Proposal agent…` | Reverted. `src/features/.../components/workspace/agent-surface.tsx` |
| M7 | `use-divider-width.ts`, definition: remove the agent minimum from clamp; C4 condition 5 at 780px must fail | `npx playwright test e2e/workspace.spec.ts -g 'C4.*780-5'`; expected >= 320, received 304 after ArrowLeft at the floor | Reverted. `src/features/.../hooks/use-divider-width.ts` |
| M8 | `types/presentation.ts`, definition: add `ApplicationSurface = "proposal-preparation" | "dashboard"`; C5(c) must fail | `npx vitest run .../workspace.test.tsx -t C5`; export allowlist assertion matched the extra union | Reverted. `src/features/.../types/presentation.ts` |
| M9 | temporary `src/features/containment-probe.tsx`, definition: render a second `<main>`; C5(d) must fail | `npx vitest run .../workspace.test.tsx -t C5`; lexical main count returned the probe and the real renderer | Created, observed red, deleted. `src/features/containment-probe.tsx` |
| M10 | `proposal-preparation-idle-surface.tsx`, definition root: add `aria-live`; C6(e) must fail | After strengthening the self-node check, `npx vitest run .../workspace.test.tsx -t C6`; C6(e) expected falsy but received true | Reverted. `src/features/.../components/idle/proposal-preparation-idle-surface.tsx` |
| M11 | `proposal-preparation-idle-surface.tsx`, definition JSX: add a statistics list; C6(a) allowlist must fail | `npx vitest run .../workspace.test.tsx -t C6`; C6(a) expected no list but found `<ul>` | Reverted. `src/features/.../components/idle/proposal-preparation-idle-surface.tsx` |

## Evidence

- Baseline tree: `6fd82997c632db6c5e8e128b894519cafbd4937a`.
- Baseline: `npm test` 137/137; `npm run test:e2e` 27/27; `npm run typecheck` green; `npm run build` green; `npm run lint` failed before test output existed because ESLint tried to scan the missing `test-results/` directory.
- Closing tree before documentation/tracker/commit edits: same source tree with the phase implementation; closing stamp: `npm test` 16 files, 154/154; `npm run test:e2e` 49/49; `npm run typecheck` green; `mkdir -p test-results && npm run lint` green; `npm run build` green.
- No architecture graph exists in this worktree; no graph delta.

## Inherited phase-01 evidence relocated

`e2e/bootstrap.spec.ts` was deleted and its host checks were replaced by `e2e/workspace.spec.ts`.
The carried assertions are the focus treatment, reduced-motion treatment, referenced theme
properties, and six design-correction checks. The first document-title/no-page-error test also
remains. The focus test now tabs three times (skip link, divider, injected control) rather than
once because the phase-02 skip link and divider are now real focus stops; its measured assertion is
unchanged. The old phase-01 `theme.test.ts` C6(a)/(c) block was removed exactly as planned.

## Full write perimeter

Own code/tests:

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/features/proposal-preparation/components/workspace/agent-surface.tsx`
- `src/features/proposal-preparation/components/workspace/constants.ts`
- `src/features/proposal-preparation/components/workspace/main-application-surface.tsx`
- `src/features/proposal-preparation/components/workspace/proposal-workspace.tsx`
- `src/features/proposal-preparation/components/workspace/workspace-divider.tsx`
- `src/features/proposal-preparation/components/workspace/workspace.test.tsx`
- `src/features/proposal-preparation/components/idle/proposal-preparation-idle-surface.tsx`
- `src/features/proposal-preparation/hooks/use-divider-width.ts`
- `src/features/proposal-preparation/hooks/use-divider-width.test.ts`
- `src/features/proposal-preparation/types/presentation.ts`
- `e2e/workspace.spec.ts`
- deletion of `e2e/bootstrap.spec.ts`
- `src/styles/theme.test.ts` (retired guard block)

Documentation/tracker:

- `README.md`
- `build_docs/under_constroction/frontend_core/master-plan.md` (tracker row 02 only)
- `build_docs/under_constroction/frontend_core/plans/phase-02-workspace-shell.md` (Review log)
- this handoff file

Dependencies/tool-recorded state:

- No package or lockfile changed; no theme, config, architecture contract, or future-
  implementations file changed.
- `test-results/` was created transiently so the existing lint command could scan its configured
  path; it is ignored and not staged.
- Next's generated `next-env.d.ts` was restored after the build changed its generated import path.
  `tsconfig.tsbuildinfo` was regenerated by TypeScript and is left unstaged as a tool artifact.

Mutation probes touched the following files separately from the own-change list above: the three
production files in M1/M2/M3/M4/M5/M6/M7/M10/M11, `src/features/proposal-preparation/types/presentation.ts`
in M8, and temporary `src/features/containment-probe.tsx` in M9. Every mutation was reverted or
the temporary file was deleted before closeout.

## Owner decisions required

nothing needs you

## Owner layer

What I did: built and verified the persistent two-pane workspace shell with accessible landmarks,
skip navigation, a clamped divider, pointer/keyboard resizing, and an honest idle state.

What I found and what it means for you: all 58 rows and all 11 named mutation probes are covered;
the idle visual treatment remains explicitly unresolved as a design gap. The repository's lint
script needs a transient `test-results/` directory to exist.

What happens next: this phase is checkpointed as not approved and is ready for independent review.

What needs you: nothing needs you

Handoff pointer: `build_docs/under_constroction/frontend_core/handoffs/implementer/phase-02-round-1.handoff.implementer.md`
