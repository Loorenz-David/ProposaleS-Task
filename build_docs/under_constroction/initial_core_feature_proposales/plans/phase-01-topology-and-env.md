---
plan: 1
phase: Repository topology and environment
state: IMPLEMENTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 1 — Repository topology and environment

## Goal

Make the repository able to hold server-only code and test it offline: install `server-only`, split Vitest into a `node` project (server code) and the existing `jsdom` project, add the placeholder-env + offline-fetch test setup, add the boundary lint rules the contracts require, and write `src/lib/env/server.ts` with the seven variables of master plan §6.2 validated at load with no defaults.

**Not in this phase:** error taxonomy, logger, value shapes (phase 2); any adapter; any feature code; `vitest.live.config.mts` (phase 15).

## Read first

1. Master plan §5 (R7, R8), §6.1, §6.2, §9, §10 (all of it — this phase *creates* §10.3–§10.4).
2. Intention §17A.15 (configuration half and the test-suite consequence), §17A.3 (editor origin), §12.2, §2.1.
3. Evidence doc §9, §9.1.
4. Contracts: `02-runtime-boundaries.md` §3, §7, §8; `03-feature-architecture.md` §4 (the prohibited-imports table); `06-data-contracts-and-validation.md` §2 (env row), §3; `10-security-and-trust-boundaries.md` §2; `11-testing-principles.md` §1, §5; `14-documentation-principles.md` §10.4–§10.5; `12-anti-patterns.md` "Runtime boundary".
5. Repo: `package.json`, `vitest.config.mts`, `vitest.setup.ts`, `eslint.config.mjs`, `tsconfig.json`, `.env.example`, root `README.md` "Environment".

## Dependencies (gate)

None (first phase). Intention status header reads `RATIFIED`; tracker row 1 is `NOT_STARTED`.

## Files expected to change

`package.json`, `package-lock.json` (add `server-only`) · `vitest.config.mts` (two projects) · `test/stubs/server-only.ts` (new) · `test/setup/node.ts` (new) · `eslint.config.mjs` (boundary rules) · `src/lib/env/server.ts` (new) · `src/lib/env/server.test.ts` (new) · `test/setup/node.test.ts` (new; C4) · `.env.example` · root `README.md` ("Environment" table; `server-only` in the stack table if listed) — **11 paths** (corrected by the coordinator at dispatch lint: the list has always held eleven; the sentence said ten).

## Implementation tasks (ordered)

1. `npm install server-only` — **already done outside the pipeline** (master plan §10.1; `package.json` carries `"server-only": "^0.0.1"` uncommitted at dispatch). Verify it is present and record the resolved version from `package-lock.json` in the Review log; do not reinstall. If it is absent, install it.
2. `test/stubs/server-only.ts`: an empty module (`export {};`).
3. `vitest.config.mts`: `test.projects` per master plan §10.3; the `node` project aliases `server-only` to the stub and uses `test/setup/node.ts`; both projects exclude `e2e/**` and `**/*.live.test.ts`. Keep `@` → `src`. If Vitest 5 rejects inline projects, use `vitest.workspace.mts` and update master plan §10.3 (say so in the handoff).
4. `test/setup/node.ts`: assign the six placeholders of master plan §6.2 unconditionally; replace `globalThis.fetch` with a function throwing `OfflineGuardError` (a plain `Error` subclass exported from the same file). Nothing else.
5. `eslint.config.mjs`: add `no-restricted-imports` rules realizing the four rows of 03 §4's table (client files → no `**/server/**` except `server/actions.ts`, no `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, `@/lib/env/server`; `**/schemas/**` and `**/types/**` → no `react`, `next/*`, `@/lib/env/*`; `src/lib/**` → no `@/features/**`, `@/app/**`), and `no-restricted-properties`/`no-restricted-syntax` forbidding `process.env` outside `src/lib/env/**`. Verify each rule once by linting a planted file (record file, rule, and the reported message in the Review log; delete the file).
6. `src/lib/env/server.ts`: `import "server-only"` first line; `serverEnvSchema` (Zod, master plan §6.2 exactly; the vendor-key refinement issues at path `[<KEY>]`); `parseServerEnv(raw: NodeJS.ProcessEnv | Record<string, string | undefined>)` throwing `Error` whose message lists failing variable **names** (`Invalid server environment: AI_PROVIDER, ANTHROPIC_API_KEY`) and never values; `export const serverEnv = parseServerEnv(process.env)` at module load. `PROPOSALES_EDITOR_ORIGIN`: `z.url()` + refinement `new URL(v).protocol === "https:" && new URL(v).origin === v`.
7. `.env.example`: all seven variables, empty values, one comment line each (kind: secret / configuration).
8. Root `README.md`: patch the environment table (14 §10.5) to the seven variables; add `server-only` nowhere else (the stack table lists frameworks, not guards).
9. Run every named mutation (below); revert; closing stamp (`npm test`, `npm run typecheck`, `npm run lint`); checkpoint commit.

## Acceptance criteria

Rows are addressable as `C<n>(<letter>)`. Every row's fixture is constructed in the test (`parseServerEnv({...})`); no row reads `process.env` except C4.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation (file · site) | Trace |
|---|---|---|---|---|---|
| C1(a) | missing `AI_PROVIDER` | all other seven valid, `AI_PROVIDER` absent | throws; message contains `AI_PROVIDER`; message does not contain the supplied `PROPOSALES_API_KEY` value (sentinel `SENTINEL-KEY-9f3`) | MUT-01-1 `server.ts` · schema definition · add `.default("anthropic")` to `AI_PROVIDER` → C1(a) red | M16, §17A.15 |
| C1(b) | `AI_PROVIDER=gateway` | otherwise valid | throws; message contains `AI_PROVIDER` | MUT-01-2 `server.ts` · enum definition · add `"gateway"` → C1(b) red | M16 |
| C1(c) | `AI_PROVIDER=anthropic`, no `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` present | | throws; message contains `ANTHROPIC_API_KEY` and not `OPENAI_API_KEY` | MUT-01-3 `server.ts` · refinement · delete the vendor-key refinement → C1(c) red | M16 |
| C1(d) | `AI_PROVIDER=openai`, `OPENAI_API_KEY` present, `ANTHROPIC_API_KEY` absent | | parses; `AI_PROVIDER === "openai"` | — | M16 |
| C1(e) | missing `PROPOSALES_API_KEY` | | throws; message contains `PROPOSALES_API_KEY` | — | §17A.15 |
| C1(f) | missing `AI_MODEL` | | throws; message contains `AI_MODEL` | MUT-01-4 `server.ts` · schema · `.optional()` on `AI_MODEL` → C1(f) red | M16 |
| C1(g) | `PROPOSALES_COMPANY_ID="0"` and `"abc"` | two sub-fixtures | both throw naming `PROPOSALES_COMPANY_ID`; `"12"` parses to number `12` | — | §17A.15 |
| C2(a) | editor origin valid | `https://proposales.test` | parses; value unchanged | — | M17, §17A.3 |
| C2(b) | editor origin with path | `https://proposales.test/editor` | throws naming `PROPOSALES_EDITOR_ORIGIN` | MUT-01-5 `server.ts` · refinement · drop the `origin === v` check → C2(b) red | §17A.3 |
| C2(c) | `http:` scheme | `http://proposales.test` | throws naming the variable | — | §17A.3 |
| C2(d) | trailing slash | `https://proposales.test/` | throws (origin ≠ value) | — | §17A.3 |
| C3(a) | `process.env` outside `src/lib/env` is a lint error | ESLint `Linter` run in-test on source text `const k = process.env.X` with `filePath: "src/features/x/server/a.ts"` | one report with the configured rule id | — | §17A.15 (one place reads env) |
| C3(b) | `process.env` inside `src/lib/env/server.ts` is allowed | same text, `filePath: "src/lib/env/server.ts"` | zero reports | — | §17A.15 |
| C4(a) | server-only module loads in the node project | `await import("@/lib/env/server")` from a `node`-project test | resolves; `serverEnv.AI_PROVIDER` is a member of `["anthropic","openai"]` | — | M7 (crit 12), §17A.15 |
| C4(b) | suite uses placeholders, not `.env` | read `process.env.PROPOSALES_API_KEY` in a node-project test | equals `"test-placeholder-not-a-key"` | — | M7 (crit 12) |
| C4(c) | default suite is offline | `fetch("https://api.proposales.com/v3/content")` in a node-project test | rejects with `OfflineGuardError` | MUT-01-6 `test/setup/node.ts` · guard assignment · delete it → C4(c) red | M7 (crit 12) |
| C5(a) | `.env.example` inventory equals the schema | parse `NAME=` lines from `.env.example` | set of names equals `Object.keys(serverEnvSchema.shape)` (7) | — | §17A.15 (binding names) |

Criteria: 5 (C1–C5), 17 rows (a table line is one row; a lettered span counts its letters). Named mutations: 6.

## Notes

- Zod 4: use `z.enum`, `z.url()`, `z.coerce.number().int().positive()`, `superRefine` for the vendor-key rule. Do not use `.default()` anywhere in this schema.
- The env module is the one module with a load-time side effect; tests that assert failures call `parseServerEnv` directly (rule 8, master plan §9).
- The e2e spec (`e2e/bootstrap.spec.ts`) starts `npm run dev`; Next.js loads `.env` locally — unaffected by this phase since no route imports `@/lib/env/server` yet. CI has no `.env`: the e2e job must keep passing, which it does because nothing imports the env module at runtime yet. State this in the handoff.
- Projection gate: waivable (no silent-failure mechanism; the env module's fail-loud is a crash, not a silent path). The coordinator records the waiver or dispatches projection.

## Review log

*(append-only; implementer and reviewer)*

### Implementer round 1 — 2026-09-05

- Built the server-only environment boundary, node/jsdom Vitest projects, suite-wide placeholder environment and offline fetch guard, boundary lint rules, seven-variable `.env.example`, and root README environment table.
- Verified the pre-existing `server-only` dependency instead of reinstalling it: resolved version `0.0.1` in `package-lock.json`; `package.json` and `package-lock.json` were not modified by this phase.
- Vitest 5 accepted inline `test.projects`; no workspace fallback or master-plan amendment was needed. The jsdom project includes the existing `.ts` component test as well as `.tsx` tests so the baseline suite is not silently narrowed.
- Judgment: `test/setup/node.ts`, its test, and the pre-existing `playwright.config.ts` are explicit test/tooling exceptions to the `process.env` lint guard. The application boundary remains restricted, and C3(a) proves a planted feature file reddens.
- Baseline before production edits: `npx vitest run src/lib/env/server.test.ts test/setup/node.test.ts` could not execute rows because the new module and setup file were absent (2 failed suites, 0 tests); this is recorded rather than reconstructed.
- Targeted phase result: 17 tests passed. Full candidate result after retaining the baseline component test: 7 files, 24 tests passed. The final closing stamp is recorded in the implementer handoff.
- Boundary lint probes all reddened and were deleted: client → `@/lib/ai` (`no-restricted-imports`); shared schema → `react` (`no-restricted-imports`); `src/lib` → `@/features/**` (`no-restricted-imports`); outside env → `process.env` (`no-restricted-properties`).
- Named mutations MUT-01-1 through MUT-01-6 were each applied at the planned site, observed red, and reverted. MUT-01-6 reached the real endpoint after the guard assignment was removed and returned HTTP 401; the guard was restored immediately.
- Documentation impact: the root README environment table was incomplete after the verified implementation, so it was updated. No feature or integration README exists yet and no other authoritative document became false.
