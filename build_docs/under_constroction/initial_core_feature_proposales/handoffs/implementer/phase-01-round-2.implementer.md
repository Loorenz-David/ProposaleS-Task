---
plan: 1
role: fix
round: 2
state: IMPLEMENTED
date: 2026-09-05
actor: Codex
---

# Phase 01 fix-round 2 implementer handoff

## Coverage map and baseline

Captured before the first production edit. The existing phase tests passed 17/17; the amended rows below were not yet present and therefore have no fabricated baseline.

| Criterion row | Test id | Assertion shape |
|---|---|---|
| C1(a) | `src/lib/env/server.test.ts` — `C1(a)` | exact row shape: missing provider throws, names the variable, and excludes the supplied secret value |
| C1(b) | `src/lib/env/server.test.ts` — `C1(b)` | exact row shape: unsupported provider throws and names the variable |
| C1(c) | `src/lib/env/server.test.ts` — `C1(c)` | exact row shape: selected vendor key is required and unselected key name is absent from the error |
| C1(d) | `src/lib/env/server.test.ts` — `C1(d)` | exact row shape: OpenAI fixture parses and preserves the provider |
| C1(e) | `src/lib/env/server.test.ts` — `C1(e)` | exact row shape: missing Proposales key throws and names the variable |
| C1(f) | `src/lib/env/server.test.ts` — `C1(f)` | exact row shape: missing model throws and names the variable |
| C1(g) | `src/lib/env/server.test.ts` — `C1(g)` | exact row shape: zero and nonnumeric ids throw; valid string coerces to number 12 |
| C2(a) | `src/lib/env/server.test.ts` — `C2(a)` | exact row shape: exact HTTPS origin parses unchanged |
| C2(b) | `src/lib/env/server.test.ts` — `C2(b)` | exact row shape: origin with path throws and names the variable |
| C2(c) | `src/lib/env/server.test.ts` — `C2(c)` | exact row shape: HTTP origin throws and names the variable |
| C2(d) | `src/lib/env/server.test.ts` — `C2(d)` | exact row shape: trailing slash throws |
| C3(a) | `src/lib/env/server.test.ts` — `C3(a)` | exact row shape: one `no-restricted-properties` report outside the env module |
| C3(b) | `src/lib/env/server.test.ts` — `C3(b)` | exact row shape: zero reports inside `src/lib/env` |
| C4(a) | `test/setup/node.test.ts` — `C4(a)` | exact row shape: server-only env module resolves in the node project |
| C4(b) | `test/setup/node.test.ts` — `C4(b)` | exact row shape: pinned suite placeholder is installed |
| C4(c) | `test/setup/node.test.ts` — `C4(c)` | exact row shape: default fetch rejects with `OfflineGuardError` |
| C4(d) | not yet present; amended row | no automated assertion existed at baseline |
| C4(e) | not yet present; amended row | no automated assertion existed at baseline |
| C5(a) | `src/lib/env/server.test.ts` — `C5(a)` | exact current row shape: `.env.example` name set equals schema key set |
| C5(b) | not yet present; amended row | no automated assertion existed at baseline |
| C3(c) | not yet present; amended row | no enumerated path-family assertion existed at baseline |
| C3(d) | not yet present; amended row | no four-family import assertion existed at baseline |

Baseline command: `npx vitest run src/lib/env/server.test.ts test/setup/node.test.ts` → 2 files, 17 tests passed, 0 failed. Baseline tree: `git rev-parse HEAD` was `ea24913`; pre-existing dirty paths were under `build_docs/` as expected by the prompt.

## Summary

Completed the six scoped fix items from the phase-01 round-2 prompt. The server environment test boundary now covers all amended rows, the node/jsdom projects share one offline guard definition, the seventh suite placeholder is installed and checked, the root README describes the split test topology, and the leftover mutation-probe directories are removed.

## ⚠ OWNER DECISIONS REQUIRED (0)

Zero owner decisions required; nothing needs the owner.

## Gate and contract context

- Intention header: `RATIFIED`.
- Tracker row 1: `CHANGES_REQUESTED` at dispatch; changed only this row to `IMPLEMENTED` at closeout.
- Outstanding-work gate: C5(b) was present in the plan and `OPENAI_API_KEY` was absent from node setup before editing.
- Review gate: round-1 reviewer handoff present with both prior plan Review-log entries.
- Archgraph: not present; skipped.
- Applicable contracts re-emitted: `02-runtime-boundaries.md` §§7–8, `03-feature-architecture.md` §4, `11-testing-principles.md` §5, `13-decision-checklist.md`, matching runtime/test sections of `12-anti-patterns.md`, and `14-documentation-principles.md` §8. No additional contract or conflict was found.

## Implemented scope

- F3: assigned all seven master-plan placeholders in `test/setup/node.ts`; C4(d) checks every schema key and exact placeholder.
- F4 empty-value half: C5(b) checks all seven `.env.example` right-hand sides are empty.
- F1 reduced scope: C3(c) checks five `process.env` path families; C3(d) checks three positive import families and the sanctioned `server/actions` negative against the shipped ESLint config.
- N3: centralized `OfflineGuardError` and `installOfflineFetchGuard` in `test/setup/node.ts`; node installs it in the non-window runtime and `vitest.setup.ts` calls the same installer for jsdom.
- N4: ran MUT-01-6 using only the specified local resolving fetch stub, never the network form.
- F5: updated the root README stack row and testing strategy for the node/jsdom split and collection scopes.
- N1: removed `src/features/phase01-probe/{components,schemas,server}` and empty parents `src/features/phase01-probe` and `src/features`.

## Verification

- Targeted phase suite: `npx vitest run src/lib/env/server.test.ts test/setup/node.test.ts src/components/offline-guard.test.ts` → 3 files, 22 tests passed.
- Collection check: `npx vitest list` shows `src/components/offline-guard.test.ts` under `[jsdom]`; all C1–C5 tests appear under the intended project.
- Pre-edit baseline: `npx vitest run src/lib/env/server.test.ts test/setup/node.test.ts` → 2 files, 17 tests passed; no amended-row baseline was fabricated.

## Named mutation ledger

All eleven named mutations executed and reverted: `11 / 11` (C1: 4, C2: 1, C3: 2, C4: 3, C5: 1). The plan Review log contains the same full ledger; this handoff records the results for the coordinator:

| Mutation | Site | Observed red |
|---|---|---|
| MUT-01-1 | `src/lib/env/server.ts` · AI provider schema | C1(a): parser did not throw; `1 failed, 16 skipped` |
| MUT-01-2 | `src/lib/env/server.ts` · provider enum | C1(b): parser did not throw; `1 failed, 16 skipped` |
| MUT-01-3 | `src/lib/env/server.ts` · Anthropic refinement | C1(c): parser did not throw; `1 failed, 16 skipped` |
| MUT-01-4 | `src/lib/env/server.ts` · optional model | C1(f): parser did not throw; `1 failed, 16 skipped` |
| MUT-01-5 | `src/lib/env/server.ts` · origin equality refinement | C2(b): path origin was accepted; `1 failed, 16 skipped` |
| MUT-01-6 | `test/setup/node.ts` · resolving local fetch stub | C4(c): response resolved HTTP 200 instead of rejecting with `OfflineGuardError`; `1 failed, 3 skipped` |
| MUT-01-7 | `eslint.config.mjs` · widened env exception | C3(c): `src/app/page.tsx` produced zero instead of one report; `1 failed, 16 skipped` |
| MUT-01-8 | `eslint.config.mjs` · disabled import rules | C3(d): client env import produced zero instead of one report; `1 failed, 16 skipped` |
| MUT-01-9 | `test/setup/node.ts` · omitted OpenAI placeholder | C4(d): `process.env.OPENAI_API_KEY` was `undefined`; `1 failed, 3 skipped` |
| MUT-01-10 | `.env.example` · planted value | C5(b): observed `planted-value` instead of empty; `1 failed, 16 skipped` |
| MUT-01-11 | `vitest.setup.ts` · replaced jsdom installer with resolving local stub | C4(e): response resolved HTTP 200 instead of rejecting with `OfflineGuardError`; `1 failed` |

MUT-01-11 used a safe equivalent rather than literal deletion: deleting the installer would expose the Proposales URL to real fetch and violate pipeline charter rule 9. No mutation probe made a network request. Every probe was restored.

## Corrections intentionally excluded by owner scope

- F2 remains excluded: adding a blanket `src/app/**` lint restriction would reject valid Server Component imports; the phase plan records phase 15's `scanTree` follow-up.
- The comment-shape half of F4 remains excluded; only empty right-hand-side values were requested for this MVP.
- F1 import coverage uses the requested reduced shape: three positives plus the sanctioned negative, not every family polarity.

## Documentation and candidate review

After behavior verification, the root README was incomplete about the new test architecture and was patched. The environment table was already complete. No feature or integration README exists yet. No candidate criterion was needed: every test in the phase test files maps to a criterion row. The e2e path remains unaffected because no route imports the environment module at runtime.

## Full write perimeter

Files changed by this fix cycle:

1. `README.md`
2. `src/lib/env/server.test.ts`
3. `test/setup/node.test.ts`
4. `test/setup/node.ts`
5. `vitest.setup.ts`
6. `src/components/offline-guard.test.ts` (new)
7. `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-01-topology-and-env.md`
8. `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md`
9. `build_docs/under_constroction/initial_core_feature_proposales/handoffs/implementer/phase-01-round-2.implementer.md`

Directories removed because empty: `src/features/phase01-probe/components`, `src/features/phase01-probe/schemas`, `src/features/phase01-probe/server`, `src/features/phase01-probe`, `src/features`.

Mutation-probe files touched temporarily and restored, listed separately from fix changes: `src/lib/env/server.ts`, `test/setup/node.ts`, `eslint.config.mjs`, and `.env.example`. No probe-only files or directories remain.

## Closing stamp

Final L4 stamp was taken after this handoff was completed, on the dirty pre-checkpoint tree:

- Tree identity: `HEAD=ea2491300c913ec46d6fbee99c1bb05164f9ccde`; the working tree contained this cycle's listed files plus the pre-existing `build_docs/` changes from the prompt/review setup. The generated `tsconfig.tsbuildinfo` change was restored before the final stamp.
- `npm test` → 8 files, 29 tests passed.
- `npm run typecheck` → passed.
- `npm run lint` → passed.
- Failure-ID delta from the pre-edit targeted baseline: baseline had 0 failures; final stamp has 0 failures, with five amended criterion rows and one jsdom test added.

Checkpoint commit is created after this stamp with subject `CHECKPOINT (not approved): phase 01 fix round 2 topology and environment`.
