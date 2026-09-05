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
| C3(c) | the `process.env` restriction reaches every application path family | `lintSource` over `const k = process.env.X` at each of exactly these five `filePath`s: `src/app/page.tsx`, `src/components/x.tsx`, `src/features/f/server/a.ts`, `src/features/f/components/b.tsx`, `src/lib/other/c.ts` | **each of the five** produces exactly one report with `ruleId === "no-restricted-properties"` — five paths, five reports | MUT-01-7 `eslint.config.mjs` · the `process.env` exception `files:` array · add `"src/app/**/*.tsx"` and `"src/components/**/*.tsx"` → C3(c) red | 02 §7, 03 §4 row 4, R7 |
| C3(d) | each `no-restricted-imports` family fires, and the sanctioned exception stays silent | `lintSource` over four imports: `src/features/f/components/a.tsx` → `@/lib/env/server`; `src/features/f/schemas/s.ts` → `react`; `src/lib/x.ts` → `@/features/f/a`; and `src/features/f/components/a.tsx` → `@/features/f/server/actions` | the first three each produce exactly one `no-restricted-imports` report; **the fourth produces zero** | MUT-01-8 `eslint.config.mjs` · the four `no-restricted-imports` rule blocks · delete all four → C3(d) red | 02 §7, 03 §4 rows 1–3, R7 |
| C4(d) | every schema name has its declared placeholder in the node suite | in a node-project test, for each key of `serverEnvSchema.shape` | `process.env[key]` equals the placeholder master plan §6.2 declares for it; **all seven keys present**, none `undefined` | MUT-01-9 `test/setup/node.ts` · placeholder assignments · delete the `OPENAI_API_KEY` assignment → C4(d) red | 11 §5, §17A.15 (test-suite consequence), master plan §9 rule 8 |
| C4(e) | the jsdom project is offline too | `fetch("https://api.proposales.com/v3/content")` in a jsdom-project test | rejects with `OfflineGuardError` | MUT-01-11 `vitest.setup.ts` · guard assignment · delete it → C4(e) red | master plan §10.6 rule 1 |
| C5(b) | every `.env.example` value is empty | the same parsed lines as C5(a) | **every** `NAME=` line's right-hand side is the empty string; seven lines checked | MUT-01-10 `.env.example` · any one variable line · give it a value → C5(b) red | 02 §8 |

Criteria: 5 (C1–C5), 22 rows (a table line is one row; a lettered span counts its letters). Named mutations: 11.

**Amended by the coordinator, fix round 1 (2026-09-05)**, from review round 1: rows C3(c), C3(d), C4(d), C4(e), C5(b) and mutations MUT-01-7…11 added (17 → 22 rows, 6 → 11 mutations); MUT-01-6 redefined below. Counts re-derived from the table, not carried forward.

**MUT-01-6 is redefined** (review N4). Old shape: delete the `globalThis.fetch` guard assignment — which made the probe issue a real request to `api.proposales.com` and cross charter rule 9. New shape: **replace the guard with a local non-throwing stub**, `globalThis.fetch = async () => new Response("ok", { status: 200 })` → C4(c) red. The reviewer demonstrated this bites identically (`1 failed, 2 passed`). No future round runs the network form.

## Notes

- Zod 4: use `z.enum`, `z.url()`, `z.coerce.number().int().positive()`, `superRefine` for the vendor-key rule. Do not use `.default()` anywhere in this schema.
- The env module is the one module with a load-time side effect; tests that assert failures call `parseServerEnv` directly (rule 8, master plan §9).
- The e2e spec (`e2e/bootstrap.spec.ts`) starts `npm run dev`; Next.js loads `.env` locally — unaffected by this phase since no route imports `@/lib/env/server` yet. CI has no `.env`: the e2e job must keep passing, which it does because nothing imports the env module at runtime yet. State this in the handoff.
- **`src/app/**` is outside the client-import lint rule, deliberately** (review F2). Contract 03 §4 row 1 binds "any `"use client"` file"; the config approximates client files with folder globs (`components/`, `hooks/`, `client/`). A blanket `src/app/**` restriction would be **wrong**, because 03 §4 permits `src/app/` Server Components to import feature `server/` modules, and ESLint core rules cannot select on the `"use client"` directive. Enforcement layer 1 (`server-only`) is what holds for `src/app/`. This project builds no UI (intention §18), so nothing here is reachable; it becomes load-bearing only if a UI phase is ever added. Recorded, not fixed, on the owner's MVP scoping call.
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

### Reviewer round 1 — 2026-09-05 — `CHANGES_REQUESTED`

Full first review against the criteria table, master plan §5 (R7, R8), §6.2, §9, §10, intention §17A.15/§17A.3, and contracts `02 §3/§7/§8`, `03 §4`, `06 §2–§3`, `11 §5`, `14 §8`. Implementer stamp at `HEAD=ea24913` consumed by citation (tree identity matched; only `build_docs/` dirty). **L4 budget spent: 0 of 1.** All evidence below is L1 variation. Detail: `handoffs/reviewer/phase-01-round-1.reviewer.md`.

**Should-fix**

- **F1 — the boundary lint layer has no automated proof it can fail, and its one proof samples a single path.** (a) Deleting all four `no-restricted-imports` families leaves the phase suite 17/17 green. (b) Widening the `no-restricted-properties` exception to `src/app/**` + `src/components/**` leaves C3(a) and C3(b) green, i.e. the `process.env` guard can be switched off across the App Router and component tree silently. Authority: `02 §7` layer 2, `03 §4` lint table row 4 ("**anything**"), master plan §5 R7, charter rules 2 and 15. Correction: criterion rows `C3(c)…` using the existing `lintSource` helper — one per `no-restricted-imports` family (plus the sanctioned `server/actions` negative) and an **enumerated** `process.env` family list (`src/app/**`, `src/components/**`, `src/features/**/server/**`, `src/features/**/components/**`, `src/lib/**` outside `src/lib/env/`).
- **F2 — the client-import rule does not reach `src/app/**`.** `03 §4` row 1 binds "any `use client` file"; the config approximates with three folder globs. Verified silent: `src/app/dashboard/page.tsx` importing `@/lib/env/server`, and the same importing a deep `server/` module, produce zero reports. A blanket `src/app/**` glob would be **wrong** (`03 §4` permits `src/app/` Server Components to import feature `server/`). Correction: record the limitation in this plan's Notes and master plan §10, and route a candidate criterion to **phase 15** (`scanTree`: no file containing `"use client"` imports a restricted module, with its own planted-violation row per C2(e)).
- **F3 — the suite's placeholder environment covers six of seven schema names.** `OPENAI_API_KEY` is unassigned, so it holds whatever the shell or CI job holds. Verified no leak today (Vitest does not populate `process.env` from `.env`; probed directly against the repo-local `.env`), but C4(b) cannot observe the unsafe case. Authority: master plan §9 rule 8 and §10.6, `11 §5`, intention §17A.15 test-suite consequence. Correction: assign all seven names in `test/setup/node.ts`, plus an inventory row (the proven C5(a) shape) asserting every `serverEnvSchema.shape` key equals its declared placeholder. **Master plan §6.2 lesson: its placeholder list names six and should name seven.**
- **F4 — C5(a) asserts one third of the MUST it cites.** `02 §8` requires every variable listed, **with empty values** and **one comment each**; C5(a) checks only the name set, so a committed real value or the loss of the comments passes. Correction: assert empty right-hand sides and a preceding comment line per variable, with a planted value and a deleted comment as the two rule-15 presence probes.
- **F5 — the documentation-impact answer was wrong.** Root `README.md` line 41 still calls the suite "jsdom environment" and `## Testing strategy` still says tests live beside the code — both became incomplete when the node project was added (`14 §8.1`: "architecture boundary change", "new developer workflow"; `§8.4`). The environment table itself is correct and needs nothing. Correction: patch both statements to describe the node/jsdom split and each project's collection scope.

**Notes** (full text in the handoff): N1 empty probe directories `src/features/phase01-probe/{components,schemas,server}` survive on disk, git-invisible — clean in the fix round; **lesson: probe declarations should list created directories, not only files**. N2 a test file outside the four include globs is collected by **neither** project and `vitest list` reports nothing — demonstrated; candidate criterion for phase 15. N3 the jsdom project has no offline guard: **not** a gap against intention criterion 12 (its "all of the above" is the backend workflow, wholly in the node project) but a gap against master plan §10.6 as written; extend the guard to `vitest.setup.ts` (recommended) or qualify §10.6. N4 MUT-01-6 crossed charter rule 9 unnecessarily — a local mutant (`globalThis.fetch = async () => new Response("ok", { status: 200 })`) reddens C4(c) identically; redefine the row so no future round repeats the live 401. N5 emptying `.env.example` (correct per `02 §8`) erased the repo's only candidate value for R11 — record `https://secure.proposales.com` in the evidence doc as an unverified candidate for phase 15's capture. N6 only `globalThis.process.env` evades `no-restricted-properties`; phase 15 C2(c) owns it. N7 C4(b)'s pinned literal is **not** a rule-13 time bomb — the literal is the contract, and asserting it against an exported constant would make the row `f(x) == f(x)`; keep it.

**Verified correct (settled; do not re-derive).** Env schema equals master plan §6.2, no `.default()`, coercion permitted at the env boundary (`06 §3`). Secret non-disclosure proven capable of failing: appending `JSON.stringify(raw)` to the thrown message reddens C1(a) **and** C1(c). C1(c) has no second sufficient cause — making `ANTHROPIC_API_KEY` unconditionally required keeps C1(c) green but reddens **C1(d)**; reversing the refinement reddens both; the pair is genuinely complementary. C3 runs against the **shipped** root config (not a re-declaration) and reddens for the claimed reason in both directions. C5(a) reddens in both directions. All four `no-restricted-imports` families fire correctly today (eleven enumerated cases against `03 §4`, including the correctly-silent `server/actions` exception); `no-restricted-properties` also catches computed and destructured forms. The lint exception list is exactly the set of real `process.env` sites. `npm run lint` is `eslint .` (whole tree). `server-only@0.0.1` present in both manifests, committed at `a53a964` as R8 and the handoff claim. Perimeter honest: `ea24913` touches 9 code/config paths + 3 documents; `package.json`/`package-lock.json` genuinely unchanged; the master-plan diff is the tracker row alone. Baseline not narrowed (5 files / 7 tests still collected). Trace chain closed: 17 rows ↔ 17 tests, **zero orphan tests**, re-derived independently with `vitest list`.

**Reviewer mutation-probe declaration.** `eslint.config.mjs` (4 probes), `src/lib/env/server.ts` (4), `test/setup/node.ts` (1), `.env.example` (1) — all restored **byte-identical**, verified by `shasum -a 256 -c` against a pre-probe manifest. Probe-only paths `src/lib/env/zz-leak-probe.test.ts` and `src/probezone/orphan.test.ts` (with its directory) deleted. No network request was made by any probe. No code or configuration file was changed by the review session; write perimeter is this Review log entry, the plan frontmatter `state`, tracker row 1, and the reviewer handoff.

### Implementer fix round 2 — 2026-09-05 — `IMPLEMENTED`

- Resolved F1 by adding C3(c)'s five enumerated `process.env` path assertions and C3(d)'s three positive import-family assertions plus the sanctioned `server/actions` negative. The existing `lintSource` helper continues to execute the shipped root ESLint config; no rule was re-declared.
- Resolved F3 by assigning the seventh `OPENAI_API_KEY` placeholder and adding C4(d), which compares every schema key against the binding seven-value placeholder map.
- Resolved the scoped half of F4 by adding C5(b), which checks all seven `.env.example` right-hand sides are empty. The comment-shape half remains deliberately excluded by the owner's MVP scope.
- Resolved N3 by centralizing `OfflineGuardError` and `installOfflineFetchGuard` in `test/setup/node.ts`; the node setup installs it only outside jsdom, while `vitest.setup.ts` invokes the same installer for jsdom. The `window` guard avoids importing the node setup module into jsdom from installing the guard before the jsdom-specific call site.
- Ran MUT-01-6 with the redefined local resolving fetch stub, never the network form. Removed the empty probe directories from N1, including their now-empty parents.
- Resolved F5 by documenting the node/jsdom project split and each collection scope in the root README. No changes were made to the environment table because it was already complete.
- Contract resolution re-emitted: `02-runtime-boundaries.md` §§7–8, `03-feature-architecture.md` §4, `11-testing-principles.md` §5, `13-decision-checklist.md`, `12-anti-patterns.md` matching runtime/test sections, and `14-documentation-principles.md` §8. No additional contract was needed; no contract conflict was found.
- Judgment: C4(e)'s test imports the shared error class from `test/setup/node.ts`; the module's `typeof window` condition keeps that import pure in jsdom while preserving the node setup side effect. This is the smallest perimeter-compatible way to share one guard definition and make MUT-01-11 sitable.

#### Mutation ledger

All eleven named mutations were executed at their planned sites and restored: `11 / 11` (C1: 4, C2: 1, C3: 2, C4: 3, C5: 1).

| Mutation | Site | Scope / command | Observed red |
|---|---|---|---|
| MUT-01-1 | `src/lib/env/server.ts` · schema definition, default `AI_PROVIDER` | L1: `npx vitest run src/lib/env/server.test.ts -t 'requires AI_PROVIDER'` | C1(a) failed: parser did not throw; `1 failed, 16 skipped` |
| MUT-01-2 | `src/lib/env/server.ts` · enum definition, add `gateway` | L1: `npx vitest run src/lib/env/server.test.ts -t 'unsupported AI provider'` | C1(b) failed: parser did not throw; `1 failed, 16 skipped` |
| MUT-01-3 | `src/lib/env/server.ts` · refinement, remove Anthropic branch | L1: `npx vitest run src/lib/env/server.test.ts -t 'selected vendor key'` | C1(c) failed: parser did not throw; `1 failed, 16 skipped` |
| MUT-01-4 | `src/lib/env/server.ts` · schema definition, make `AI_MODEL` optional | L1: `npx vitest run src/lib/env/server.test.ts -t 'requires AI_MODEL'` | C1(f) failed: parser did not throw; `1 failed, 16 skipped` |
| MUT-01-5 | `src/lib/env/server.ts` · editor-origin refinement, remove origin equality | L1: `npx vitest run src/lib/env/server.test.ts -t 'editor origin with a path'` | C2(b) failed: path origin was accepted; `1 failed, 16 skipped` |
| MUT-01-6 | `test/setup/node.ts` · offline guard assignment, replace with `Response('ok', 200)` | L1: `npx vitest run test/setup/node.test.ts -t 'blocks network access in the default suite'` | C4(c) failed: promise resolved with HTTP 200 instead of rejecting with `OfflineGuardError`; `1 failed, 3 skipped` |
| MUT-01-7 | `eslint.config.mjs` · `process.env` exception files, add app/components | L1: `npx vitest run src/lib/env/server.test.ts -t 'every application path family'` | C3(c) failed at `src/app/page.tsx`: zero reports instead of one; `1 failed, 16 skipped` |
| MUT-01-8 | `eslint.config.mjs` · all `no-restricted-imports` rule blocks disabled | L1: `npx vitest run src/lib/env/server.test.ts -t 'each import family'` | C3(d) failed for the client env import: zero reports instead of one; `1 failed, 16 skipped` |
| MUT-01-9 | `test/setup/node.ts` · remove `OPENAI_API_KEY` placeholder assignment | L1: `npx vitest run test/setup/node.test.ts -t 'every schema name'` | C4(d) failed: `process.env.OPENAI_API_KEY` was `undefined`; `1 failed, 3 skipped` |
| MUT-01-10 | `.env.example` · plant a value on `PROPOSALES_API_KEY` | L1: `npx vitest run src/lib/env/server.test.ts -t 'every .env.example value empty'` | C5(b) failed: observed `planted-value` instead of empty; `1 failed, 16 skipped` |
| MUT-01-11 | `vitest.setup.ts` · jsdom guard installation | L1 safe equivalent: replace `installOfflineFetchGuard()` with `globalThis.fetch = async () => new Response('ok', { status: 200 })`; `npx vitest run src/components/offline-guard.test.ts -t 'blocks network access in the jsdom project'` | C4(e) failed: promise resolved with HTTP 200 instead of rejecting with `OfflineGuardError`; `1 failed` |

MUT-01-11 was run in the network-safe local-mutant form above. Literal deletion of the jsdom guard would expose the test's Proposales URL to the real fetch implementation and violate pipeline charter rule 9; no network form was run. Every probe was reverted, and no probe left a production or configuration change. Probe-created directories were limited to existing paths; the only directory cleanup was the N1 `rmdir` set.

#### Corrections intentionally excluded by scope

- F2 was not implemented: the owner explicitly excluded the `src/app/**` client-import approximation from this fix cycle because a blanket restriction would reject valid Server Component imports; the limitation remains recorded for phase 15's `scanTree` criterion.
- The comment-shape half of F4 was not implemented: the owner limited this MVP fix to empty right-hand-side values, now covered by C5(b).
- F1's import-family coverage follows the owner's reduced scope: three positive cases and the sanctioned `server/actions` negative, not every polarity of every family.

#### Documentation impact review

After targeted behavior verification, the two-project test topology and the new jsdom guard made the root README's stack and testing-strategy statements incomplete. Both were patched in this change. The environment table was already accurate; no feature or integration README exists yet, and no other durable documentation became false.

#### Candidate criteria and E2E note

No candidate criterion was needed; every test in the phase test files maps to a criterion row, including the new C4(e) test. `npx vitest list` confirms the test is collected by the jsdom project. `e2e/bootstrap.spec.ts` remains unaffected because no route imports the env module at runtime; CI has no `.env`.

### Coordinator re-review (in place of an independent reviewer session) — 2026-09-05 — **APPROVED**

**Independence caveat, recorded because it matters to the record's value.** The owner
directed that the fix round be verified by the coordinator rather than by a fresh
reviewer session (MVP scoping call). This is less independent than the charter's
re-review: the coordinator scoped the fix round it is now judging. It is mitigated by
the findings themselves having come from an independent round-1 reviewer, and by the
perimeter check being mechanical. **Phase 1 is the only phase approved this way so far;
if it becomes the pattern, the re-review protocol is being eroded and that should be a
deliberate decision, not a drift.**

**Verified perimeter.** `3c136e7` touched exactly the allowed set: `README.md`,
`src/lib/env/server.test.ts`, `test/setup/node.test.ts`, `test/setup/node.ts`,
`vitest.setup.ts`, the new `src/components/offline-guard.test.ts`, plus closeout
artifacts. **`eslint.config.mjs`, `src/lib/env/server.ts`, `.env.example`,
`vitest.config.mts`, `package.json` and the lockfile are untouched**, as the fix prompt
required. The master-plan and phase-plan diffs in that commit are the coordinator's own
pre-dispatch folds plus the tracker row and Review log. `src/features/` is gone
entirely — N1 closed.

**Arithmetic re-derived, not accepted.** 17 (`server.test.ts`) + 4 (`node.test.ts`) + 1
(`offline-guard.test.ts`) = 22 rows, matching the amended plan; 24 + 5 = 29 tests and
7 + 1 = 8 files at full suite; 11 named mutations declared, 11 executed, and every
mutation row's pass/skip totals are consistent with its file's test count.

**Guards judged capable of failing** (charter rule 15), by reading, not by ledger:
- `C3(c)` enumerates five paths with an exact rule-id assertion and a per-path failure
  label — not a sample. **Verified by an independent mutant the round did not use:**
  widening the exception to `src/features/**` alone (rather than the round's
  `src/app` + `src/components`) reddens it, naming the failing path. `eslint.config.mjs`
  restored byte-identical, confirmed by `git status`.
- `C3(d)` asserts three positive families **and** the sanctioned `server/actions`
  negative at exactly zero reports.
- `C4(d)`'s `PLACEHOLDERS` table is **declared independently in the test file, not
  imported from `test/setup/node.ts`** — so it restates master plan §6.2's contract
  rather than asserting `f(x) == f(x)` (charter rule 15's third named instance). Its
  set-equality against `serverEnvSchema.shape` also fails when a schema key gains no
  placeholder.
- `C5(b)` pins seven entries and asserts every value empty.
- `C4(e)` calls the real `fetch` in the jsdom project and expects the guard error.

**Declared divergence, and it is right.** MUT-01-11 used a local resolving stub instead
of literal deletion, because deleting the jsdom installer would have let the probe reach
the live vendor — the round-1 rule-9 lesson correctly applied, and declared in its own
handoff section per charter rule 14.

**Observation carried forward, not a finding.** `vitest.setup.ts` imports
`test/setup/node.ts` for `installOfflineFetchGuard`, which also executes that module's
seven `process.env` assignments as a load-time side effect. The effect is *beneficial* —
the jsdom project now gets safe placeholders instead of the ambient environment — but it
is undeclared, and the module's name says `node` while it now serves both projects.
Recorded so phase 2+ is not surprised; renaming is not worth a round.

**Evidence discipline.** The implementer's closing stamp (`npm test` → 8 files / 29
tests, typecheck and lint green) was consumed by citation on matching content, not
re-run. Coordinator L4 runs: **0**. All coordinator evidence was L1 variation.

**Verdict: `APPROVED`.** Phase 2 may start.
