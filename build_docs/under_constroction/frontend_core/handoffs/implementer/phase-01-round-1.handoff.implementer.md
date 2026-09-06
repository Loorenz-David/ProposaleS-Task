---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: implement
round: 1
state: IMPLEMENTED
date: 2026-09-06
actor: Claude Sonnet 5 (implementer, per master plan §3 substitution)
---

# Handoff — phase 01 implementation, round 1

Full narrative (delegated-decision reasoning, judgment calls, documentation-impact review) is
in the plan file's Review log, dated 2026-09-06. This handoff carries the tables and records
the doctrine requires directly, plus the write perimeter.

`nothing needs you` — no owner decision is required. (See the one candidate finding at the end,
routed to the coordinator, not the owner.)

There is no architecture graph in this worktree (master plan §8): no graph delta to report.

## Baseline (task 1), tree `7b741aaaae0a073e96981f0fd867a9aca8b36d94`

| Command | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` | clean |
| `npm test` | 11 files, 118 tests, all passed |
| `npm run build` | clean |
| `npm run test:e2e` | 2 tests, both failed (`banner` not found; "Skip to content" link not found) |

All three §10.2 predictions confirmed as stated; no correction needed.

## Coverage map (task 0), all 31 rows

| Row | Test id | Shape |
|---|---|---|
| C1(a) | `theme.test.ts` "C1(a): no raw hex colour, px type size, radius, or shadow literal outside the theme layer" | matches |
| C1(b) | `theme.test.ts` "C1(b): no outline:none / outline:0 outside the stated one-entry allowlist" | matches |
| C1(c) | manual mutation (probe 1/11) | matches |
| C1(d) | manual mutation (probe 2/11) | matches |
| C1(e) | `theme.test.ts` "C1(e): the scanner's own scope..." | matches |
| C2(a) | `bootstrap.spec.ts` "C2(a): :focus-visible produces..." | matches |
| C2(b) | `bootstrap.spec.ts` "C2(b): transition and animation durations..." | matches |
| C2(c) | manual mutation (probe 3/11) | matches |
| C3(a) | `bootstrap.spec.ts` generated "C3(a): `<property>` resolves..." (×16, derived from `globals.css` at file-load time) | matches, enumerated not sampled |
| C3(b) | manual mutation (probe 4/11) | matches |
| C4(a) | `theme.test.ts` "C4(a): every discovered *.test.ts(x) is claimed by exactly one project" | matches |
| C4(b) | `components/collection-sentinel.test.tsx` (self-asserting) | matches |
| C4(c) | `hooks/collection-sentinel.test.ts` (self-asserting) | matches |
| C4(d) | C4(a) + pre-existing `test/setup/node.test.ts` (preservation) | weaker: joint/incidental, not a dedicated new test |
| C4(e) | `theme.test.ts` "C4(e): vitest.setup.ts still calls installOfflineFetchGuard()" | matches (upgraded from inspection) |
| C4(f) | `theme.test.ts` "C4(f): src/styles/theme.test.ts... collected in the node project" | matches |
| C4(g) | manual mutation (probe 5/11) | matches |
| C5(a) | `theme.test.ts` "C5(a): src/styles/tokens.css does not exist" | matches |
| C5(b) | `theme.test.ts` "C5(b): no file exists under src/components/ui/" | matches |
| C5(c) | `theme.test.ts` "C5(c): no *.module.css exists under src/" | matches |
| C5(d) | `theme.test.ts` "C5(d): package.json declares no forbidden styling dependency" | matches, recorded limit |
| C5(e) | manual mutations (probes 6–9/11) | matches |
| C6(a) | `theme.test.ts` "C6(a)/(c): e2e/bootstrap.spec.ts contains no banner/main-landmark or skip-link assertion" | matches |
| C6(b) | closing L4+ stamp: `npm run test:e2e` (26/26) | matches |
| C6(c) | same test as C6(a) | matches |
| C7(a) | `bootstrap.spec.ts` "correction 1"–"correction 6" (×6) | matches, enumerated not sampled |
| C7(b) | `theme.test.ts` "C7(b): declares no custom property named after a component/widget..." | matches |
| C7(c) | manual mutation (probe 10/11; re-sited once) | matches |
| C8(a) | `theme.test.ts` `it.each` "C8(a): %s makes no unqualified..." (×4 documents) | matches, enumerated not sampled |
| C8(b) | `theme.test.ts` "C8(b): both 'Component library' rows name Radix UI Primitives and Lucide React" | matches |
| C8(c) | manual mutation (probe 11/11) | matches |

Reverse trace: every test in `theme.test.ts`, every test in `bootstrap.spec.ts`, and both
collection sentinels appear above against a row. No orphan test.

## Named mutations — 11 declared, 11 executed

Arithmetic: C1 2(c,d) + C2 1(c) + C3 1(b) + C4 1(g) + C5 4(e, one per a–d) + C6 0 + C7 1(c) +
C8 1(c) = **11**.

| # | Row | Site | Planted | Observed red | Reverted |
|---|---|---|---|---|---|
| 1 | C1(c) | new `src/lib/__mutation-probe-c1c.ts` | raw hex `#3b82f6` | `theme.test.ts` "C1(a)" — `raw-hex-colour` at the planted file | yes |
| 2 | C1(d) | same file, replaced | `outline: none;` | `theme.test.ts` "C1(b)" — `outline-removed` at the planted file | yes |
| 3 | C2(c) | `globals.css`, reduced-motion block | block deleted | `bootstrap.spec.ts` "C2(b)" — parsed duration `0.3` ≥ `0.001`; correction-6 row also reddened (shared subject) | yes |
| 4 | C3(b) | `theme.css`, `--color-focus` line | declaration removed | `bootstrap.spec.ts` "C3(a): --color-focus..." only; all 15 siblings stayed green | yes |
| 5 | C4(g) | `vitest.config.mts` jsdom `include` (temporarily narrowed) + new `.../components/__mutation-probe-c4g.test.tsx` | narrowed globs + a `.tsx` file outside both | `theme.test.ts` "C4(a)" — `claimedByNone` listed the planted file and (incidentally) the pre-existing sentinel | yes (both) |
| 6 | C5(e)/(a) | `src/styles/tokens.css` created | the file | `theme.test.ts` "C5(a)" | yes |
| 7 | C5(e)/(b) | `src/components/ui/probe.ts` created | the file | `theme.test.ts` "C5(b)" | yes |
| 8 | C5(e)/(c) | `src/styles/probe.module.css` created | the file | `theme.test.ts` "C5(c)" | yes |
| 9 | C5(e)/(d) | temp fixture `/tmp/c5d-fixture/manifest.json` + a temporary test line in `theme.test.ts` | fixture with `styled-components`; no package installed | temporary test — `present` = `['styled-components']` | yes (test line and fixture both removed) |
| 10 | C7(c) | `theme.css` | 1st: `--color-primary-cta-button-bg` — **false green** (re-sited); 2nd: `--color-tooltip-bg` | `theme.test.ts` "C7(b)" — `offenders` = `['color-tooltip-bg']` | yes |
| 11 | C8(c) | `README.md` styling line | unqualified `tokens.css` mention appended | `theme.test.ts` "C8(a)" — only the README.md row reddened | yes |

**Re-siting incident (mutation 10):** the first C7(c) probe used a name containing "button",
which is legitimately part of the ramp's own vocabulary (`--color-accent-hover-button`) and
therefore excluded from the forbidden-fragment list — it came back green where red was
expected. Caught before concluding the guard was broken; re-sited with "tooltip" (not in the
ramp), which reddened correctly. No other probe needed re-siting.

## Closing L4+ stamp

Tree: clean `git status --porcelain` (after reverting two incidental, out-of-perimeter
regenerated build artifacts, `next-env.d.ts` and `tsconfig.tsbuildinfo`, produced by running
`build`/`typecheck`).

| Command | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` | clean |
| `npm test` | 14 files, 137 tests, all passed (baseline 11/118; +2 sentinel files/tests, +1 `theme.test.ts`/17 tests) |
| `npm run build` | clean |
| `npm run test:e2e` | 26/26 passed (baseline 0/2 — the two original tests were reduced away per task 6, not fixed in place) |

Budget: exactly one L4+ stamp taken (§7 item 2); it was re-taken once after the incidental
build-artifact revert made no further tree change (the re-take is not over-budget per the
charter's own rule: a session that changes anything after its stamp re-takes it).

## Full write perimeter

**This session's own changes:**
- `src/styles/theme.css` (new)
- `src/styles/theme.test.ts` (new)
- `src/styles/globals.css` (edited)
- `vitest.config.mts` (edited)
- `e2e/bootstrap.spec.ts` (edited)
- `README.md` (edited)
- `architectural_contracts/README.md` (edited)
- `architectural_contracts/15-ui-styling-and-component-system.md` (edited)
- `architectural_contracts/12-anti-patterns.md` (edited)
- `src/features/proposal-preparation/components/collection-sentinel.test.tsx` (new, permanent)
- `src/features/proposal-preparation/hooks/collection-sentinel.test.ts` (new, permanent)
- `build_docs/under_constroction/frontend_core/plans/phase-01-baseline-and-visual-foundation.md` (State row, Review log)
- `build_docs/under_constroction/frontend_core/master-plan.md` (tracker row 01 only)
- This handoff file.

**Every file a mutation probe touched, applied and reverted (listed separately, per the
doctrine, so "nothing changed outside the perimeter" is falsifiable):**
- `src/lib/__mutation-probe-c1c.ts` (created, then removed)
- `src/lib/__mutation-probe-c1d.ts` (created, then removed)
- `src/styles/globals.css` (reduced-motion block removed, then restored — same file as the
  declared edit above; the mutation window is a distinct, reverted state within it)
- `src/styles/theme.css` (the `--color-focus` line removed, then restored; later the
  `--color-primary-cta-button-bg`/`--color-tooltip-bg` line added, then removed — same file
  as the declared edit above, same note)
- `vitest.config.mts` (jsdom `include` temporarily narrowed, then restored — same file as the
  declared edit above)
- `src/features/proposal-preparation/components/__mutation-probe-c4g.test.tsx` (created, then removed)
- `src/components/ui/probe.ts` (created, then removed, including the `src/components/ui/`
  directory it required)
- `src/styles/probe.module.css` (created, then removed)
- `src/styles/tokens.css` (created as a probe instance, then removed — distinct from any
  permanent restoration; C5(a) still passes)
- `README.md` (one line appended, then removed — same file as the declared edit above)
- `theme.test.ts` (one temporary test added for the C5(e)/(d) probe, then removed — same file
  as the declared new file above)
- `/tmp/c5d-fixture/manifest.json` (outside the repository; created, then removed with its
  directory)

**Commands run:** the five baseline commands (task 1, once); targeted `npx vitest run <path>
[-t "<name>"]` and scoped `npx playwright test ... -g "<name>"` runs throughout implementation
and for every mutation probe; `npx vitest list --json` (spawned by `theme.test.ts` itself, per
C4(a)'s instrument requirement); the closing L4+ stamp (five full commands, taken once, re-taken
once after an incidental build-artifact revert with no further tree change). No package
installed; `package.json`/`package-lock.json` unchanged. No commit made beyond the one
checkpoint commit below.

## Candidate finding for the coordinator (not an owner decision)

Two stale statements outside this phase's declared perimeter were left untouched, noted for
routing: the root README's "integrations under `src/lib/**`... neither exists yet" half-claim
(already false before this phase — `src/lib/` already has real content) and
`architectural_contracts/README.md`'s second Known-conflicts row ("No frontend implementation
plan exists yet"). Both predate this phase and are unrelated to conflict C-4; fixing them here
would have been scope creep beyond the eight declared criteria.
