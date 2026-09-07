---
plan: plans/phase-02-workspace-shell.md
role: implement
round: 2
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 02 fix round 2 — implementation handoff

## Opening summary

Implemented the routed corrections from phase-02 review round 1. The shell product code remains
inside the confirmed perimeter; the changes repair the measurement instruments, make repeated
divider resets announce, close the first-paint ARIA range, remove the probe-dependent `flex-none`,
and give `main` a shell-owned accessible name. The phase tracker is `IMPLEMENTED` and the plan's
Review log records the decisions and evidence.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs you. No product or architecture decision was opened by this fix round.

## Contract resolution

Applied Architecture Context routing for client components/hooks and accessibility, Tailwind
styling, runtime boundaries, feature placement, testing, documentation closeout, the decision
checklist, and matching anti-patterns. No new runtime boundary, feature folder, dependency,
shared primitive, route, persistence, or graph node was introduced. The Next.js 16.3.4 local
Server/Client Components and `use client` guides were consulted; `page.tsx` stays server-side and
the workspace root remains the client boundary.

## What changed

- `workspace.test.tsx`: source scanners read file contents and assert non-empty subjects; C5(c)
  enumerates export forms and state members as exact sets; C5(d) checks file and exported-component
  noun denylists; C6(a) enumerates non-static roles as an allowlist; C6(e)'s dead assertion is
  removed; C1(f) asserts the resize changed `aria-valuenow`.
- `workspace.spec.ts`: restored the six phase-01 assertions, expanded C3 to one test per
  property, renamed the inherited title test so only the skip-link row is `C1(d)`, uses Chromium's
  accessibility tree for C6(a), uses authored overflow declarations, measures all descendant
  overflow and content-column widths, sets every parameterized viewport, counts live-region
  mutations, verifies effective maxima against `getEffectiveDividerMax`, and records C4(4) as
  `unmeasured` when no product text elides.
- `proposal-workspace.tsx`: every reset increments a monotonic zero-width marker in the live
  region, with `flushSync` ensuring each reset callback is a distinct DOM mutation for the
  counter; the observer-backed width uses a constants-derived wide pre-measurement fallback.
- `use-divider-width.ts`: the hook's initial range is valid before `ResizeObserver` measurement;
  measured container widths still use the unchanged pure clamp contract.
- `main-application-surface.tsx`: `main` now owns stable accessible name `Proposal preparation`.
- `proposal-preparation-idle-surface.tsx`: removed `flex-none`; the responsive `w-full
  max-w-[840px]` column remains bounded without a fixed-width flex item.

`overflow-x-hidden` remains on `main` deliberately: it contains document-level horizontal spill;
the C4 condition-2 instrument still measures descendant `scrollWidth` and does not treat the
computed value as an authored horizontal-scroll exemption.

## Coverage map — all 60 phase rows

Each row maps to its discharging test or named probe and states whether the assertion has the
shape required by the plan.

| Row | Test / probe | Shape |
|---|---|---|
| C1(a) | unit `C1(a)`; E2E `C1(a)` | exact complementary count and shell-owned name |
| C1(b) | unit/E2E `C1(b)` | exact main count |
| C1(c) | unit `C1(c)` | page/workspace directive placement |
| C1(d) | E2E `C1(d)` | first tab stop and focused visibility |
| C1(e) | E2E `C1(e)` | activation focuses main |
| C1(f) | unit/E2E `C1(f)` | resize proven, then same landmark node identity |
| C1(g) | C1(g) probe against unit `C1(b)` | second main reddens exact-count guard |
| C1(h) | C1(h) probe against unit `C1(a)` | second complementary region reddens exact-count guard |
| C1(i) | C1(i) probe against unit/E2E `C1(f)` | forced remount reddens both identity twins |
| C2(a) | E2E `C2(a)` | separator semantics plus first-paint range |
| C2(b) | E2E `C2(b)` | two derived widths, settled observer values, pure-function expectations |
| C2(c)-arrow decrease | E2E generated `C2(c)` | named clamp result and retained focus |
| C2(c)-arrow increase | E2E generated `C2(c)` | named clamp result and retained focus |
| C2(c)-shifted decrease | E2E generated `C2(c)` | named clamp result and retained focus |
| C2(c)-shifted increase | E2E generated `C2(c)` | named clamp result and retained focus |
| C2(c)-Home | E2E generated `C2(c)` | minimum-contract result and retained focus |
| C2(c)-End | E2E generated `C2(c)` | effective-maximum result and retained focus |
| C2(c)-Enter reset | E2E generated `C2(c)` | default-width result and retained focus |
| C2(c)-Space reset | E2E generated `C2(c)` | default-width result and retained focus |
| C2(d) | E2E `C2(d)` | observer count exactly one reset, zero drag/non-reset keyboard |
| C2(e) | E2E `C2(e)` | divider reached from document start without pointer |
| C2(f) | E2E `C2(f)` | double-click count exactly one and default width |
| C2(g) | E2E `C2(g)` | two consecutive resets count two mutations |
| C2(h) | C2(h)-i/ii/iii probes against `C2(d)`, `C2(f)`, and `C2(b)` | all three planted defects redden their named instruments |
| C3(a) | `use-divider-width.test.ts` `C3(a)` | lower-bound clamp |
| C3(b) | `use-divider-width.test.ts` `C3(b)` | upper-bound clamp |
| C3(c) | `use-divider-width.test.ts` `C3(c)` | agent minimum wins ordering |
| C3(d) | `use-divider-width.test.ts` `C3(d)` | viewport re-clamp |
| C3(e) | C3(e) probe against unit `C3(c)` | reversed ordering reddens |
| C4(1440-1) | E2E `C4(1440-1)` | document horizontal overflow |
| C4(1440-2) | E2E `C4(1440-2)` | authored exception plus all descendant overflow/column widths |
| C4(1440-3) | E2E `C4(1440-3)` | width-specific keyboard reachability |
| C4(1440-4) | E2E `C4(1440-4)` | subject-first elision check; unmeasured here |
| C4(1440-5) | E2E `C4(1440-5)` | agent minimum |
| C4(1100-1) | E2E `C4(1100-1)` | document horizontal overflow |
| C4(1100-2) | E2E `C4(1100-2)` | authored exception plus all descendant overflow/column widths |
| C4(1100-3) | E2E `C4(1100-3)` | width-specific keyboard reachability |
| C4(1100-4) | E2E `C4(1100-4)` | subject-first elision check; unmeasured here |
| C4(1100-5) | E2E `C4(1100-5)` | agent minimum |
| C4(780-1) | E2E `C4(780-1)` | document horizontal overflow |
| C4(780-2) | E2E `C4(780-2)` | authored exception plus all descendant overflow/column widths |
| C4(780-3) | E2E `C4(780-3)` | width-specific keyboard reachability |
| C4(780-4) | E2E `C4(780-4)` | subject-first elision check; unmeasured here |
| C4(780-5) | E2E `C4(780-5)` | agent minimum |
| C4(e) | C4(e) probe against `C4(780-2)` | fixed-width flex column reddens generalized instrument |
| C4(f) | C4(f) probe against all `C4(*-3)` rows | missing tabindex reddens each named width |
| C4(g) | C4(g) probe against `C4(780-4)` | executed; correctly remains unmeasured because no subject exists |
| C4(h) | C4(h) probe against `C4(780-5)` | below-minimum clamp reddens |
| C5(a) | unit `C5(a)` | route-file allowlist plus source-content navigation denylist |
| C5(b) | unit `C5(b)` | source-content registry/extension denylist |
| C5(c) | unit `C5(c)` | exact exported-name set and state-member set |
| C5(d) | unit `C5(d)` | exact lexical main count plus file/export noun denylist |
| C5(e) | C5(e)-i/ii/iii/iv probes against unit `C5(a)`–`C5(d)` | each of the four planted defects reddens its named instrument |
| C6(a) | unit/E2E `C6(a)` | exact non-static role allowlist |
| C6(b) | unit/E2E `C6(b)` | idle content inside one main |
| C6(c) | unit/E2E `C6(c)` | no navigation affordance/source |
| C6(d) | unit/E2E `C6(d)` | no first-render focus |
| C6(e) | unit/E2E `C6(e)` | no live/status/alert node |
| C6(f) | C6(f) probe against unit/E2E `C6(e)` | planted live region reddens |
| C6(g) | C6(g) probe against unit/E2E `C6(a)` | table/button/image outside noun lists redden allowlist |

Reverse map: every test in `workspace.test.tsx`, `use-divider-width.test.ts`, and
`e2e/workspace.spec.ts` maps to the table above. The carried phase-01 evidence is separately
identified by its enclosing description; the six restored assertions are C2(a) focus, C3's
subject and per-property enumeration, C7 correction 2's subject, C7 correction 5 focus, and the
two C7 correction 6 non-none animation assertions.

## Named mutation ledger — 17/17 executed and reverted

| Mutation | Site and scope | Observed result |
|---|---|---|
| C1(g) | second `<main>` in `main-application-surface.tsx`; Vitest C1 | C1(b) exact-count assertion reddened (C1(f) also could not select a unique main) |
| C1(h) | second `<aside>` in `agent-surface.tsx`; Vitest C1 | C1(a) exact-count assertion reddened (C1(f) also could not select a unique complementary region) |
| C1(i) | `key={width}` on both landmark components; Vitest C1 and E2E landmark identity | unit C1(f) and browser C1(f) both reddened on identity |
| C2(h)-i | second `onAnnouncement()` in divider reset; E2E reset/double-click rows | C2(d) received 2, expected 1; C2(f) received 2, expected 1 |
| C2(h)-ii | `onAnnouncement()` added to ArrowLeft; E2E C2(d) | non-reset keyboard count received 1, expected 0 |
| C2(h)-iii | hook maximum held at `AGENT_PANE_MAX_PX`; E2E C2(b) | settled maximum stayed 620, violating the derived 619/320 values |
| C3(e) | reversed `getEffectiveDividerMax` ordering; Vitest C3 | C3(c) expected agent minimum 320, received 319 |
| C4(e) | idle column changed to `flex-none w-[840px]`; E2E C4(-2) at 780 | generalized condition-2 instrument reddened on pane overflow |
| C4(f) | divider `tabIndex` removed; E2E C4(-3) all widths | all three named width rows reddened on focus reachability |
| C4(g) | existing elided label truncated; E2E C4(780-4) | test remained explicitly unmeasured; no product elision subject exists, so no false green was claimed |
| C4(h) | lower agent-minimum clamp removed; E2E C4(780-5) | measured 304px, below required 320px |
| C5(e)-i | complete navigation imports/calls in `src/app/page.tsx`; Vitest C5 | C5(a) source denylist reddened |
| C5(e)-ii | created/deleted `surface-registry.ts` under feature; Vitest C5 | C5(b) source denylist reddened |
| C5(e)-iii | enum surface-kind construct in presentation types; Vitest C5 | C5(c) exported-name allowlist reddened |
| C5(e)-iv | created/deleted second-main `surface-probe.tsx`; Vitest C5 | C5(d) exact main-count assertion reddened |
| C6(f) | live region added to idle surface; unit and E2E C6(e) | both no-announcement assertions reddened |
| C6(g) | table, button and image added to idle surface; unit and E2E C6(a) | role allowlist reddened with the planted table/button/image roles |

Additional B3 variation (not a named mutation): a 4000px child was planted separately in the
agent pane and main pane at 1440, 1100 and 780. All six condition-2 runs reddened the authored
declaration instrument. All temporary probe edits were reverted before close.

## Evidence

Baseline L4 re-enumeration, before the first edit, on the clean routing tree `5cfd186`:

- `npm test`: 16 files, 154/154 tests passed.
- `npm run test:e2e`: 49/49 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed as `eslint .` with `test-results/` absent.
- `npm run build`: passed on Next.js 16.3.4.

The round-1 claim that lint failed because `test-results/` was absent was not reproduced. This
round records the actual result as green and the earlier failure as undiagnosed; no false lint
diagnosis is carried into this handoff.

Closing stamp on the implementation tree before this handoff and tracker/documentation edits:

- `npm test`: 16 files, 154/154 passed.
- `npm run test:e2e`: 66/66 passed.
- `npm run typecheck`, `npm run lint`, and `npm run build`: passed.

The closing tree was clean of mutation residue; the generated `tsconfig.tsbuildinfo` change from
typechecking was restored before close. The implementation tree identity is the checkpoint commit
created for this round; the handoff and tracker/Review-log documents are included in that commit.

## Fix perimeter

### Own changes

- `e2e/workspace.spec.ts`
- `src/features/proposal-preparation/components/idle/proposal-preparation-idle-surface.tsx`
- `src/features/proposal-preparation/components/workspace/main-application-surface.tsx`
- `src/features/proposal-preparation/components/workspace/proposal-workspace.tsx`
- `src/features/proposal-preparation/components/workspace/workspace.test.tsx`
- `src/features/proposal-preparation/hooks/use-divider-width.ts`
- `build_docs/under_constroction/frontend_core/master-plan.md` — tracker row 02 only
- `build_docs/under_constroction/frontend_core/plans/phase-02-workspace-shell.md` — appended Review log entry
- this handoff

### Mutation-only files touched and reverted

- `src/features/proposal-preparation/components/workspace/main-application-surface.tsx`
- `src/features/proposal-preparation/components/workspace/agent-surface.tsx`
- `src/features/proposal-preparation/components/workspace/proposal-workspace.tsx`
- `src/features/proposal-preparation/components/workspace/workspace-divider.tsx`
- `src/features/proposal-preparation/hooks/use-divider-width.ts`
- `src/features/proposal-preparation/components/idle/proposal-preparation-idle-surface.tsx`
- `src/app/page.tsx`
- `src/features/proposal-preparation/types/presentation.ts`
- `e2e/workspace.spec.ts` — temporary adversarial subjects and assertions, all reverted into the own change
- created and deleted `src/features/proposal-preparation/surface-registry.ts`
- created and deleted `src/features/proposal-preparation/surface-probe.tsx`

No architecture graph exists in this worktree; no graph delta was made.

## Documentation impact review

The root README remains accurate: it describes the persistent two-pane shell, named landmarks,
divider, honest idle state, and current E2E coverage. No feature README exists for this feature.
The changed accessible-name and repeat-announcement behavior does not make any durable current-
state documentation false or incomplete, so no README or other durable document was patched.

## Review-log notes for the coordinator

- C4(g) is the only named mutation without a red because the plan's subject-first rule correctly
  makes this condition unmeasured when no product text elides at the V1 widths. Treat it as an
  explicit measurement limit, not as evidence that the accessible-name half passed.
- The stable `main` name is `Proposal preparation`; the idle heading remains `Prepare a proposal`.
- The `data-surface-state` seam remains intentionally routed to master plan §11.3 follow-up 15 /
  phase 14, as instructed; no test or implementation was added for N2.
