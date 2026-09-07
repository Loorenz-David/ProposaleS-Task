---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: fix
round: 2
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Handoff — phase 01 fix round 2

## Opening

Implemented the eight routed corrections in the cycle-scoped perimeter. The phase tracker is
`IMPLEMENTED`; no owner decision is required. No architecture graph exists in this worktree, so
there is no graph delta.

## Baseline and evidence posture

The entry code tree was the round-1 checkpoint `d30ef8f`; the prior implementer's closing L4+
stamp is cited rather than re-run at entry: `npm test` 14 files / 137 tests, `npm run test:e2e`
26/26, typecheck, lint, and build green. The pre-edit targeted baseline was
`npx vitest run src/styles/theme.test.ts`: 17/17 green, zero baseline failures. The three
unnamed probe runs and all 15 named mutation runs below were targeted L1/L2 evidence. The first
unprivileged Playwright attempts were invalid due to a dev-server watcher loop and Chromium
permission failure; they are not counted. Browser mutations were rerun through the approved
elevated local Chromium path.

## Coverage map — every amended row to a test or ledger

Each row below names the exact discharging assertion and whether its shape matches the amended
row (all are `matches`, except where explicitly marked as a manual mutation or structurally held).

| Row | Discharge | Shape |
|---|---|---|
| C1(a) | `theme.test.ts` C1(a) | matches: empty violation set over the declared consumer set |
| C1(b) | `theme.test.ts` C1(b) | matches: one allowlisted global rule, positionally checked |
| C1(c) | named mutations M1–M4 below | matches: one red per named value class |
| C1(d) | named mutation M5 below | matches: planted outside-allowlist outline reddens |
| C1(e) | `theme.test.ts` C1(e) | matches: exact six violation kinds across synthetic TS/CSS fixtures |
| C2(a) | `bootstrap.spec.ts` C2(a) | matches: browser focus ring on injected native control |
| C2(b) | `bootstrap.spec.ts` C2(b) | matches: browser reduced-motion duration floor |
| C2(c) | named mutation M6 below | matches: deleted media block reddens C2(b) |
| C3(a) | `bootstrap.spec.ts` subject assertion plus one generated test per referenced property | matches: derived, enumerated browser rows; six caveat properties required by name |
| C3(b) | named mutation M7 below | matches: removed `--color-focus` reddens its exact generated row |
| C4(a) | `theme.test.ts` C4(a) | matches: `vitest list` set relation, exactly one project |
| C4(b) | component collection sentinel | matches: self-asserting DOM environment |
| C4(c) | hook collection sentinel | matches: self-asserting DOM environment |
| C4(d) | `theme.test.ts` C4(a) library-entry assertions | matches: every discovered `src/lib/**/*.test.ts` entry is `node` |
| C4(e) | `theme.test.ts` C4(e) | matches: guard call site asserted |
| C4(f) | `theme.test.ts` C4(f) | matches: this file has exactly one `node` collection entry |
| C4(g) | named mutations M8–M9 below | matches: both no-project and two-project halves redden |
| C5(a) | `theme.test.ts` C5(a) | matches: absence assertion |
| C5(b) | `theme.test.ts` C5(b) | matches: absence assertion |
| C5(c) | `theme.test.ts` C5(c) | matches: absence assertion |
| C5(d) | `theme.test.ts` C5(d) | matches: fixed-list manifest assertion |
| C5(e) | named mutations M10–M13 below | matches: one red per absence sub-row |
| C6(a) | title/render-clean e2e test | matches: only what the neutral tree renders |
| C6(b) | closing L4+ `npm run test:e2e` | matches: full e2e suite green |
| C6(c) | `theme.test.ts` C6(a)/(c) source-presence check | matches: no landmark, skip-link, or shell assertion |
| C7(a) correction 1 | e2e correction 1 | matches: `--color-fg-quiet` is `#84868c` |
| C7(a) correction 2 | e2e correction 2 | structurally held for phase 11; current ink set is source-derived and excludes `#3a3c41` |
| C7(a) correction 3 | e2e correction 3 | structurally held for phase 12; current accent alternative remains `#3b82f6` |
| C7(a) correction 4 | e2e correction 4 | matches: computed link ink is accent-ink-on-dark |
| C7(a) correction 5 | e2e correction 5 | matches: computed focus ring color |
| C7(a) correction 6 | e2e correction 6 reduce/no-preference tests | matches: two-sided browser measurement on non-`none` animation |
| C7(b) | `theme.test.ts` C7(b) | matches: declared names are a subset of the in-file ramp allowlist |
| C7(c) | named mutation M14 below | matches: previous-pass name `--color-tab-active-bg` reddens |
| C8(a) | `theme.test.ts` C8(a) | matches: one enumerated row per document |
| C8(b) | `theme.test.ts` C8(b) | matches: both component-library rows require Radix and Lucide |
| C8(c) | named mutation M15 below | matches: unqualified deleted-artefact reference reddens |

## Reverse coverage — every test maps to a row

- `theme.test.ts` (17 tests): C1(a,b,e); C4(a,d,e,f); C5(a–d); C7(b); C8(a) ×4 and C8(b);
  C6(a)/(c). Every `it.each` case is an enumerated C8(a) row.
- `bootstrap.spec.ts` (27 tests on the final tree): title/render-clean; C2(a,b); C3 subject
  plus every generated property row; C7(a) corrections 1–5 plus correction 6's two browser
  preference tests. Every test maps to C2, C3, C6, or C7(a).
- `components/collection-sentinel.test.tsx`: C4(b).
- `hooks/collection-sentinel.test.ts`: C4(c).
- Manual mutation records below map to C1(c,d,e), C2(c), C3(b), C4(g), C5(e), C7(c), and C8(c);
  no orphan test was added.

## Mutation ledger

Arithmetic: C1 **5** (M1–M5) + C2 **1** (M6) + C3 **1** (M7) + C4 **2** (M8–M9) + C5 **4**
(M10–M13) + C6 **0** + C7 **1** (M14) + C8 **1** (M15) = **15 declared; 15 executed**.
All were applied on the tracked tree, observed red, and reverted. The three extra probes were
also applied, observed red, and reverted.

| ID | Hypothesis / site | Planted mutation | Observed red | Reverted |
|---|---|---|---|---|
| M1 | C1(c), `src/lib/__mutation-probe-c1c.ts` consumer file | raw hex `#3b82f6` | `theme.test.ts` C1(a), `raw-hex-colour` | yes |
| M2 | C1(c), same consumer file | `text-[13px]` | C1(a), `raw-px-type-size` | yes |
| M3 | C1(c), same consumer file | `rounded-[9px]` | C1(a), `raw-radius-arbitrary` | yes |
| M4 | C1(c), same consumer file | `shadow-[0_18px_40px_rgba(0,0,0,.55)]` | C1(a), `raw-shadow-arbitrary` | yes |
| M5 | C1(d), same consumer file | `outline: none;` | C1(b), `outline-removed` at the consumer | yes |
| M6 | C2(c), `src/styles/globals.css` call site | removed reduced-motion block | Playwright C2(b), transition duration `0.3` failed `< 0.001` | yes |
| M7 | C3(b), `src/styles/theme.css` definition site | removed `--color-focus` | Playwright C3(a): `--color-focus`, computed value `""` failed non-empty assertion | yes |
| M8 | C4(g), `vitest.config.mts` jsdom include | narrowed to pre-repair globs | `theme.test.ts` C4(a), `claimedByNone` listed the component sentinel | yes |
| M9 | C4(g), `vitest.config.mts` node include | added `src/**/*.test.tsx` while jsdom retained it | C4(a), `claimedByMoreThanOne` listed the sentinel with `node` and `jsdom` | yes |
| M10 | C5(e)(a), `src/styles/tokens.css` | created forbidden file | C5(a), `existsSync(...)` was `true` | yes |
| M11 | C5(e)(b), `src/components/ui/probe.ts` | created forbidden UI file | C5(b), walk returned the probe | yes |
| M12 | C5(e)(c), `src/styles/probe.module.css` | created CSS Module | C5(c), walk returned the probe | yes |
| M13 | C5(e)(d), temporary manifest plus C5(d) call site | manifest declared `styled-components` | C5(d), `present` was `['styled-components']` | yes |
| M14 | C7(c), `src/styles/theme.css` definition site | added `--color-tab-active-bg` | C7(b), offenders was `['color-tab-active-bg']` | yes |
| M15 | C8(c), `README.md` call site | added unqualified `src/styles/tokens.css` reference | C8(a), README row returned that line | yes |

### Additional unnamed probes

| ID | Guard / site | Unnamed planted instance | Observed red | Reverted |
|---|---|---|---|---|
| U1 | C1(e), synthetic TS fixture in `theme.test.ts` | `rounded-full-[13px]` | C1(e) exact-kind assertion received a second `raw-radius-arbitrary` | yes |
| U2 | C7(b), `src/styles/theme.css` definition site | `--color-surface-thread-bg` | C7(b), offenders was `['color-surface-thread-bg']` | yes |
| U3 | C7(a) correction 2, `src/styles/theme.css` definition site | `--color-fg-surface-glyph: #3a3c41` | Playwright correction 2, derived ink values contained `#3a3c41` | yes |

Probe files touched and reverted, separate from own changes: `src/lib/__mutation-probe-c1c.ts`,
`src/lib/__mutation-probe-c5d-manifest.json`, `src/styles/tokens.css`,
`src/components/ui/probe.ts`, `src/styles/probe.module.css`, and the temporary edits to
`src/styles/theme.test.ts`, `src/styles/theme.css`, `src/styles/globals.css`, `vitest.config.mts`,
and `README.md`. The manifest fixture and all generated probe directories are gone.

## Closing L4+ stamp

Final stamp was taken after the implementation and pipeline records were complete, on the clean
checkpoint tree. `npm test`: **14 files, 137 tests passed**. `npm run typecheck`: **clean**.
`npm run lint`: **clean**. `npm run test:e2e`: **27 tests passed**. `npm run build`: **clean**.
Failure-ID delta is **zero** relative to the round-1 green code checkpoint; the corrected test
shapes replace the prior green-but-weak assertions without introducing a final regression. The
checkpoint commit contains this handoff and the tracked cycle changes; only the two pre-attributed
untracked directories remain outside the commit.

## Corrections not implemented

None. B1, B2, S1, S2, S3, S5, S6 and N1 were all implemented. S4's master-plan follow-ups and
structurally-held rows were already present before this session and were preserved; they were not
duplicated.

## Cycle-scoped write perimeter

Own changes this session:

- `src/styles/theme.test.ts`
- `e2e/bootstrap.spec.ts`
- `src/styles/theme.css`
- `architectural_contracts/15-ui-styling-and-component-system.md`
- `architectural_contracts/13-decision-checklist.md`
- `README.md`
- `build_docs/under_constroction/frontend_core/plans/phase-01-baseline-and-visual-foundation.md`
- `build_docs/under_constroction/frontend_core/master-plan.md` (tracker row 01 only)
- this handoff

No package manifest, lockfile, design specification, unrelated tracker row, or untracked pipeline
directory was changed or staged. No graph delta exists.
