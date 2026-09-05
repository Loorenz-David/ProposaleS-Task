---
plan: 1
role: implementer
round: 1
date: 2026-09-05
state: IMPLEMENTED
verdict: IMPLEMENTED
actor: Codex
---

# Phase 01 implementer handoff

Implemented the repository topology and environment phase. The server-only environment boundary, offline node test project, boundary lint guards, and seven-variable configuration inventory are in place. The phase is ready for review.

## ⚠ OWNER DECISIONS REQUIRED (0)

Zero owner decisions required; nothing needs the owner.

## Gate and scope

- Intention header: `RATIFIED`.
- Tracker row 1 at dispatch: `PROMPT_READY`.
- `src/lib/env/server.ts` was absent at dispatch.
- Predecessor gate: none.
- Archgraph: not present; skipped.
- Projection: waived by the phase plan because this phase has no silent-failure mechanism.

## Built

- Verified pre-existing `server-only` dependency; resolved version `0.0.1`. No reinstall was performed, and `package.json` / `package-lock.json` remain unchanged by this session.
- Added the empty `server-only` Vitest stub and the node setup with six placeholders plus `OfflineGuardError` fetch replacement.
- Split Vitest 5 into inline `node` and `jsdom` projects. Inline `test.projects` worked. Both exclude `e2e/**` and `**/*.live.test.ts`; the node project aliases `server-only` to the stub. The jsdom project includes the existing `.ts` component test so the baseline suite remains complete.
- Added `src/lib/env/server.ts` with the exact seven-key Zod schema, conditional vendor-key refinement, exact HTTPS-origin refinement, name-only error messages, and load-time parse.
- Added the 17-row phase test surface in `server.test.ts` and `test/setup/node.test.ts`.
- Added the four boundary lint rule families and the narrowly scoped test/tooling exceptions needed for the existing Playwright config and the required placeholder assertion.
- Normalized `.env.example` to seven names with empty values and one comment per variable.
- Updated the root README environment table with purpose, requiredness, kind, and safe examples.

## Coverage map (one row per acceptance row)

| Row | Test id | Assertion shape |
|---|---|---|
| C1(a) | `server environment schema > C1(a)` | Throws and checks the variable name plus absence of the sentinel value; exact shape required |
| C1(b) | `server environment schema > C1(b)` | Throws and names `AI_PROVIDER`; exact shape required |
| C1(c) | `server environment schema > C1(c)` | Throws for the selected vendor key and excludes the other key from the message; exact shape required |
| C1(d) | `server environment schema > C1(d)` | Parses and returns `openai`; exact shape required |
| C1(e) | `server environment schema > C1(e)` | Throws and names `PROPOSALES_API_KEY`; exact shape required |
| C1(f) | `server environment schema > C1(f)` | Throws and names `AI_MODEL`; exact shape required |
| C1(g) | `server environment schema > C1(g)` | Rejects zero and non-numeric ids and coerces `12` to number `12`; exact shape required |
| C2(a) | `server environment schema > C2(a)` | Parses exact HTTPS origin unchanged; exact shape required |
| C2(b) | `server environment schema > C2(b)` | Rejects a path and names the variable; exact shape required |
| C2(c) | `server environment schema > C2(c)` | Rejects HTTP and names the variable; exact shape required |
| C2(d) | `server environment schema > C2(d)` | Rejects a trailing slash and names the variable; exact shape required |
| C3(a) | `boundary lint rules > C3(a)` | One `no-restricted-properties` report for outside-env access; exact shape required |
| C3(b) | `boundary lint rules > C3(b)` | Zero reports inside `src/lib/env`; exact shape required |
| C4(a) | `node test setup > C4(a)` | Imports the server env module in the node project and checks the provider enum; exact shape required |
| C4(b) | `node test setup > C4(b)` | Reads the node-project placeholder and checks the exact value; exact shape required |
| C4(c) | `node test setup > C4(c)` | Fetch rejects with `OfflineGuardError`; exact shape required |
| C5(a) | `environment inventory > C5(a)` | Compares `.env.example` names to `serverEnvSchema.shape` as sets; exact shape required |

## Baseline before production edits

Command: `npx vitest run src/lib/env/server.test.ts test/setup/node.test.ts`

Result: 2 failed suites, 0 tests. The phase test files could not resolve the absent `@/lib/env/server` and `./node` modules. No fabricated row-level baseline was created.

## Verification evidence

Targeted phase command: `npx vitest run src/lib/env/server.test.ts test/setup/node.test.ts` → 2 files, 17 tests passed.

Candidate full command after the final code/config shape: `npm test` → 7 files, 24 tests passed. `npm run typecheck` and `npm run lint` were green on the same application tree. The final closing stamp is the same command trio taken after this handoff and checkpoint closeout; its clean-tree identity is recorded in the closing section below.

### Named mutation ledger

All six declared mutations executed: `6 / 6`. Mutation probes were run at the named definition or assignment sites and reverted.

| Mutation | Site | Scope / command | Observed red |
|---|---|---|---|
| MUT-01-1 | `src/lib/env/server.ts` schema definition, `AI_PROVIDER` `.default("anthropic")` | L1: `npx vitest run src/lib/env/server.test.ts` | C1(a) failed because the parser no longer threw; 1 failed, 13 passed |
| MUT-01-2 | `src/lib/env/server.ts` enum definition, add `"gateway"` | L1: `npx vitest run src/lib/env/server.test.ts` | C1(b) failed because the parser accepted gateway; 1 failed, 13 passed |
| MUT-01-3 | `src/lib/env/server.ts` refinement, delete Anthropic-key branch | L1: `npx vitest run src/lib/env/server.test.ts` | C1(c) failed because the parser accepted the missing selected key; 1 failed, 13 passed |
| MUT-01-4 | `src/lib/env/server.ts` schema definition, `AI_MODEL.optional()` | L1: `npx vitest run src/lib/env/server.test.ts` | C1(f) failed because the parser accepted a missing model; 1 failed, 13 passed |
| MUT-01-5 | `src/lib/env/server.ts` refinement, drop `origin === value` | L1: `npx vitest run src/lib/env/server.test.ts` | C2(b) and C2(d) failed because path and trailing slash were accepted; 2 failed, 12 passed |
| MUT-01-6 | `test/setup/node.ts` `globalThis.fetch` guard assignment, delete assignment | L1: `npx vitest run test/setup/node.test.ts --testTimeout=3000` | C4(c) failed: fetch resolved an HTTP 401 `Response` instead of rejecting with `OfflineGuardError`; 1 failed, 2 passed. The guard was restored. |

Mutation-tree identity for the dirty working tree: `HEAD=a53a9647e4c10a9acb44629e8068fd383781ce0a`; the stable status set was `M .env.example`, `M README.md`, `M eslint.config.mjs`, `M vitest.config.mts`, `?? src/lib/`, `?? test/` (the temporary probe files were absent after their revert). Each row above includes the named mutation on that tree.

### Boundary lint bite evidence

Each temporary probe was planted, linted, observed red, and deleted.

| Probe | Observed report |
|---|---|
| `src/features/phase01-probe/components/client-boundary.ts` importing `@/lib/ai` | `no-restricted-imports`: client code cannot import server-only modules |
| `src/features/phase01-probe/schemas/shared-boundary.ts` importing `react` | `no-restricted-imports`: shared contracts must stay runtime-neutral |
| `src/lib/phase01-lib-boundary.ts` importing `@/features/**` | `no-restricted-imports`: src/lib cannot import upward into app or features |
| `src/features/phase01-probe/server/process-env-boundary.ts` reading `process.env` | `no-restricted-properties`: read environment variables through `@/lib/env/server` |

## Files and perimeter

Implementation write perimeter: the plan’s 11 paths, exactly:

1. `package.json` — inspected; pre-existing `server-only` entry, unchanged.
2. `package-lock.json` — inspected; resolved `server-only@0.0.1`, unchanged.
3. `vitest.config.mts`
4. `test/stubs/server-only.ts`
5. `test/setup/node.ts`
6. `eslint.config.mjs`
7. `src/lib/env/server.ts`
8. `src/lib/env/server.test.ts`
9. `test/setup/node.test.ts`
10. `.env.example`
11. `README.md`

Closeout artifacts updated separately: this handoff, the phase plan review log/frontmatter, and tracker row 1 only.

Mutation-probe files, listed separately from the implementation changes: `src/lib/env/server.ts`, `test/setup/node.ts`, `src/features/phase01-probe/components/client-boundary.ts`, `src/features/phase01-probe/schemas/shared-boundary.ts`, `src/lib/phase01-lib-boundary.ts`, and `src/features/phase01-probe/server/process-env-boundary.ts`. The four probe-only files were deleted; the two implementation files were restored to their shipped content.

## Required notes

- E2E note: `e2e/bootstrap.spec.ts` starts `npm run dev`; no route imports the new env module yet, so local `.env` loading remains unaffected. CI has no `.env`, and this phase keeps the e2e path unchanged.
- Candidate criteria: none. Every test in the phase test files maps to a criterion row; no orphan test was shipped.
- Documentation impact review: root README was patched because the environment contract changed. No other durable documentation required a change.
- The closing stamp has no authorized extra L4 run; the full suite, typecheck, and lint are the required closeout commands.

## Closing stamp

To be finalized on the checkpoint tree: `npm test` → expected 7 files / 24 tests green; `npm run typecheck` → green; `npm run lint` → green. The checkpoint commit is the phase-01 implementation commit with subject prefix `CHECKPOINT (not approved): phase 01`.
