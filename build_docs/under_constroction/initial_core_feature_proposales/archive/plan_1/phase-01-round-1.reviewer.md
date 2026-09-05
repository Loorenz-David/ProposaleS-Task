---
plan: 1
role: reviewer
round: 1
date: 2026-09-05
state: CHANGES_REQUESTED
verdict: CHANGES_REQUESTED
actor: Claude (plan-reviewer)
---

# Phase 01 review handoff — round 1 (first review)

**Verdict: `CHANGES_REQUESTED`.** The implementation is correct and the perimeter is honest: every guard I probed bites, the env schema is faithful to master plan §6.2 and intention §17A.15/§17A.3, the checkpoint's file set equals the declared perimeter, and the trace chain closes (17 criterion rows ↔ 17 tests, zero orphans, independently re-derived). The findings are not about wrong behaviour — they are about **guards that cannot fail** and one incorrect documentation-impact answer. Five should-fix findings, all local to files this phase already owns, all cheap. They are routed here rather than carried because the lint layer contract 02 §7 mandates is the boundary every one of phases 2–14 leans on, and the suite's placeholder environment is those phases' security perimeter.

## ⚠ OWNER DECISIONS REQUIRED (0)

Zero owner decisions required; nothing needs the owner.

## Evidence discipline

The implementer's closing stamp (`npm test` → 7 files / 24 tests · `npm run typecheck` green · `npm run lint` green, at `HEAD=ea24913`) was **consumed by citation, not re-run**. Verified per the charter's tree-identity rule: `git status --porcelain` showed only `build_docs/` paths dirty (the implementer handoff and this round's prompt), and `HEAD` is still `ea24913`, so my tree is the stamped tree. **L4 budget spent: 0 of 1.** All my evidence is L1 variation — different mutant shapes, different sites, and case tables the round did not enumerate.

The coordinator's reconciled arithmetic was not redone. It was **independently confirmed by variation**: `npx vitest list` (a different instrument than `npm test`) collects exactly 17 node tests, all named `C1(a)`–`C5(a)`, plus the 7 pre-existing jsdom tests = 24. No orphan test exists.

## Findings

### Should-fix

**F1 — The boundary lint layer ships with no automated proof it can fail, and its one existing proof samples a single path.**

Two demonstrated halves of the same defect:

- *(a)* Deleting **all four** `no-restricted-imports` rule families from `eslint.config.mjs` leaves the phase suite at **17 / 17 green**. Nothing in the repository would notice the loss.
- *(b)* `C3(a)` plants exactly one path (`src/features/x/server/a.ts`). Widening the `no-restricted-properties` exception block to `["…", "src/app/**/*.tsx", "src/components/**/*.tsx"]` leaves **C3(a) and C3(b) both green** — the `process.env` guard can be silently switched off across the whole App Router and component tree.

Authority: `02-runtime-boundaries.md` §7 layer 2 (the lint rule "MUST be added when the app is scaffolded" — a rule with no regression guard is added once, not kept); `03-feature-architecture.md` §4 prohibited-imports table, whose row 4 reads "**anything** | `process.env`" — one sample point is not an enumeration (charter rule 2); master plan §5 R7, which makes phase 1 the owner of these rules; charter rule 15 (a guard ships with proof it can fail).

Correction: extend `src/lib/env/server.test.ts`'s existing `lintSource` helper — the machinery is already there and already imports the shipped config — with criterion rows covering (i) each of the four `no-restricted-imports` families, positive and, for the client family, the sanctioned `server/actions` negative; (ii) an enumerated `process.env` family list rather than one path: at minimum `src/app/**`, `src/components/**`, `src/features/**/server/**`, `src/features/**/components/**`, `src/lib/**` outside `src/lib/env/`. Add the rows to the phase plan's criteria table as `C3(c)…`; they trace to `02 §7` / `03 §4` / R7.

Verified correct while probing this, and worth recording so no future round re-derives it: all four families **do** fire correctly today, and the `server/actions` exception regex works. Enumerated against the shipped config — client → deep `server/` module (reports), client → `server/actions` (correctly silent), client → `@/lib/ai`, client → `@/lib/env/server`, `hooks/` → `@/lib/proposales`, `schemas/` → `react`, `schemas/` → `next/*`, `schemas/` → `@/lib/env/*`, `schemas/` → `server-only`, `src/lib/**` → `@/features/**`, `src/lib/**` → `@/app/**`: eleven of eleven behave as `03 §4` requires. `no-restricted-properties` also catches the computed (`process["env"]`) and destructured (`const { env } = process`) evasion shapes.

**F2 — The client-import rule does not reach `src/app/**`.**

`03-feature-architecture.md` §4 row 1 binds "any `"use client"` file". The config approximates client files with three folder globs (`src/**/components/**`, `src/**/hooks/**`, `src/**/client/**`). Verified silent against the shipped config: `src/app/dashboard/page.tsx` importing `@/lib/env/server`, and the same file importing `@/features/f/server/services/a`, produce **zero reports**. `src/app/` is exactly where App Router client components live.

Authority: `03-feature-architecture.md` §4 (row 1 and the lint restatement); `02-runtime-boundaries.md` §7.

Correction — and the reason it is not simply "add the glob": a blanket `src/app/**` restriction would be **wrong**, because `03 §4` explicitly permits `src/app/` Server Components to import feature `server/` modules. ESLint core rules cannot select on the `"use client"` directive. So: (i) record the limitation explicitly in the phase plan's Notes and master plan §10 — the folder globs are an approximation, and `server-only` (enforcement layer 1) is what actually holds for `src/app/`; and (ii) route a candidate criterion to **phase 15**, whose `scanTree` (C2 a–e) is the right instrument: a rule "no file containing `"use client"` imports a restricted module", with its own planted-violation row per C2(e).

**F3 — The suite's placeholder environment covers six of the seven schema names; `OPENAI_API_KEY` is left to the ambient environment.**

`test/setup/node.ts` assigns six names. `OPENAI_API_KEY` is not assigned, so inside the default suite it holds whatever the shell or CI job holds. I verified there is **no leak today**: Vitest does not populate `process.env` from `.env` (probed directly — a repo-local `.env` defines `OPENAI_API_KEY`, and it is `undefined` inside the node project). But the guard that is supposed to make that safe cannot see the unsafe case: a developer or CI job with `OPENAI_API_KEY` exported puts a real vendor credential into every test process, and `C4(b)` — which asserts only the one name it does assign — stays green.

Authority: master plan §9 rule 8 and §10.6 ("no test reads `.env`"); `11-testing-principles.md` §5 ("Tests never read `.env`. They construct configuration explicitly"); intention §17A.15 "Test-suite consequence" (`npm test` runs "without … environment secrets").

Correction: `test/setup/node.ts` assigns **all seven** schema names, `OPENAI_API_KEY` included, unconditionally. Add a criterion row of inventory shape (the `C5(a)` pattern, which is already proven strong): for every key of `serverEnvSchema.shape`, the value in `process.env` equals the declared placeholder. This is also a **master plan §6.2 lesson** — its "Test placeholders" list names six and should name seven.

**F4 — `C5(a)` compares names only; `.env.example`'s value and comment shape is unguarded.**

`02-runtime-boundaries.md` §8 is a MUST with three parts: `.env.example` lists every variable, **with empty values**, and **a one-line comment each**. `C5(a)` checks only the name set. Today the file is correct in all three respects — but a committed real value, or the loss of the comments, passes the suite. A secret pasted into `.env.example` is exactly the failure that MUST exists to prevent.

Correction: extend `C5(a)` (or add `C5(b)`/`C5(c)`) to assert that every `NAME=` line has an empty right-hand side and is immediately preceded by a comment line. Plant a value on one line and delete one comment as the two rule-15 presence probes.

Verified correct: `C5(a)` reddens in **both** directions — a name added to `.env.example` only, and a key added to `serverEnvSchema` only. The absence-shaped half of the depth target is satisfied.

**F5 — The documentation-impact answer was wrong; the root README's test-topology statements went stale.**

The handoff and Review log both state "no other authoritative document became false." Two root-README statements did:

- the stack table row `| Unit and component tests | Vitest 5 with React Testing Library and jest-dom, jsdom environment |` — the suite is now two projects and every server test runs in the **node** environment;
- `## Testing strategy`: "Tests live next to the code as `*.test.ts(x)`" — now incomplete: `test/setup/node.test.ts` does not live next to code, and (see N2) a test outside the four include globs runs in **no** project.

Authority: `14-documentation-principles.md` §8 (the closeout question), §8.1 (triggers include "architecture boundary change" and "new developer workflow" — the two-project split is both), §8.4 ("Is the root README still accurate (… commands …)?").

Correction: patch both statements to describe the node/jsdom split and where each project collects from. The environment table itself is correct and complete (seven variables, purpose, requiredness, kind, safe example) and needs nothing.

### Notes

**N1 — Empty probe directories survive on disk.** `src/features/phase01-probe/{components,schemas,server}` still exist; their files were correctly deleted. Git does not track empty directories, which is precisely why the perimeter check passed over them. Not in the repository, so no clone is affected and CI is unaffected — hence a note, not a should-fix. Judged against charter rule 4: clean them in the fix round (`rmdir`), and take the **lesson**: an executor's mutation-probe declaration should list directories created, not only files, or probes should be planted under paths that already exist.

**N2 — A test file matched by no project is collected silently.** Demonstrated: a deliberately failing test at `src/probezone/orphan.test.ts` was collected by neither project and `vitest list` showed 24 tests as if nothing existed. The node project claims `src/lib/**` and `src/features/**`; jsdom claims `src/app/**` and `src/components/**`. Anything else vanishes. The implementation is faithful to master plan §10.3, so this is a **plan-level** hazard, not an implementation defect. Route as a candidate criterion for **phase 15**: every `*.test.ts(x)` in the tree is claimed by exactly one project. Forward hazard for phases 2–14, whose files all land inside the claimed globs — the risk is a stray helper test outside them.

**N3 — The jsdom project has no offline guard** (the coordinator's probe 1, judged). `test/setup/node.ts` is wired to the node project only; jsdom keeps `vitest.setup.ts`. **This is not a gap against intention criterion 12**: its "all of the above" refers to criteria 1–11, the backend workflow, which lives entirely in the node project — C4(c) proves exactly the surface criterion 12 names. **It is a gap against master plan §10.6**, which says without qualification that "the default suite must never reach the network." Phase 15 C2(b) covers it statically (no `fetch` outside the transports, scanned over `src/`) but installs no runtime guard. Correction, coordinator's choice: either extend the guard to `vitest.setup.ts` (two lines, makes §10.6 true as written — my recommendation, because a rule written absolutely and enforced partially is the shape that fails silently later), or qualify §10.6 to name the node project. Not a phase-1 blocker either way.

**N4 — MUT-01-6 reached the live vendor and should be redefined** (the coordinator's probe 5, judged). Removing the guard assignment let the probe make a real request to `api.proposales.com`, which returned 401 — charter rule 9 ("tests never touch live external services") was crossed to obtain a correct red. **It need not have been.** I reddened C4(c) with a purely local mutant — `globalThis.fetch = async () => new Response("ok", { status: 200 })` — and it bites identically (`1 failed, 2 passed`). Redefine MUT-01-6 in the phase plan to the local shape so no future round repeats the live call. Recorded so nobody re-runs the network form casually.

**N5 — An evidence value was erased in passing.** `.env.example` previously carried `PROPOSALES_EDITOR_ORIGIN=https://secure.proposales.com`. Emptying it is **correct** per 02 §8, but it removed the repository's only candidate value for R11, whose capture task phase 15 owns and which master plan R11 records as "not established in the evidence doc." Correction: record `https://secure.proposales.com` in the evidence doc as an **unverified candidate** for phase 15's live smoke to confirm or refute. (History retains it at `c588a0c`; a candidate nobody knows to look for is not evidence.)

**N6 — One evasion shape, already owned.** `no-restricted-properties` is silent on `globalThis.process.env.X`. Phase 15 C2(c)'s textual `scanTree` rule covers it. No action.

**N7 — `C4(b)`'s pinned literal is not a rule-13 time bomb** (the prompt's depth target, judged). `"test-placeholder-not-a-key"` is pinned exactly, and that is the **correct** shape here, not a literal masquerading as a contract: the literal *is* the contract, because being that exact string is what distinguishes the suite's environment from any real one. Asserting it against a constant exported from `test/setup/node.ts` would convert the row into `f(x) == f(x)` — charter rule 15's third named instance. Keep it. Its real limitation is F3's, not rule 13's: the row proves the placeholder was installed, not that `.env` went unread.

## What I verified correct, specifically

So the next round does not re-derive settled ground:

| Area | Verified | How |
|---|---|---|
| Env schema fidelity | seven keys, types, and refinements equal master plan §6.2; no `.default()` anywhere; `z.coerce.number().int().positive()` on the company id is the coercion 06 §3 permits at the env boundary | read + rows C1(a–g) |
| Secret non-disclosure | the error message names variables and never values — contract 02 §8's hardest MUST in this phase | **new probe**: appending `JSON.stringify(raw)` to the thrown message reddens C1(a) **and** C1(c) |
| `C1(c)` has no second sufficient cause (the prompt's rule-2 companion) | making `ANTHROPIC_API_KEY` unconditionally required keeps C1(c) green but reddens **C1(d)**; reversing the refinement's provider test reddens **both**. The pair is genuinely complementary | two new mutants |
| `C3` runs against the shipped config (the coordinator's probe 4) | `server.test.ts` imports `../../../eslint.config.mjs` — the real root config, not a re-declaration — and `C3(a)` asserts exactly one report with `ruleId === "no-restricted-properties"`, so any extra or different report fails it. Confirmed it reddens for the claimed reason: removing the `src/lib/env/**` off-override reddens C3(b); widening the exception over `src/features/**` reddens C3(a) | two new mutants |
| Offline guard | `globalThis.fetch` is replaced wholesale, so the guard is structural, not per-call-site; reddens under a local mutant | N4 probe |
| `.env.example` inventory | reddens in both directions | two new mutants |
| Editor-origin refinement | `origin === value` rejects path, `http:`, and trailing slash; query and fragment fall to the same single predicate, so the four rows are an enumeration of one rule, not a sample | read + C2(a–d) |
| Lint scope | `npm run lint` is `eslint .` — whole tree, so `test/**`, `e2e/**` and root configs are all covered and the three exceptions are load-bearing. The exception list is **exactly** the set of real `process.env` sites in the repository (`test/setup/node.ts`, `test/setup/node.test.ts`, `playwright.config.ts`); narrow and justified | grep + config read |
| `server-only` | `^0.0.1` in `package.json`, `0.0.1` resolved in `package-lock.json`, both committed at `a53a964` — outside this phase, exactly as R8 and the handoff claim | read |
| Perimeter honesty | `ea24913` touches 9 code/config paths + 3 documents (handoff, tracker row 1, phase plan). `package.json` / `package-lock.json` genuinely unchanged. The master-plan diff is the tracker row alone | `git show --stat`, targeted diffs |
| Baseline not narrowed | the jsdom project's includes still collect all 5 pre-existing test files / 7 tests; nothing was dropped when the projects were split | `vitest list` |
| Trace chain | 17 rows ↔ 17 tests, every test named for its row, **zero orphan tests** (charter rule 16) | `vitest list` |

## Lessons for the plans

Routed per the charter's fold-back path.

**To the intention** — none. Nothing in this phase touched product semantics or the measurement ledger.

**To the master plan**
1. §6.2 "Test placeholders" names **six** values; it should name **seven** (`OPENAI_API_KEY`). The gap in `test/setup/node.ts` is faithful implementation of an incomplete list (F3).
2. §10.6 rule 1 asserts "the default suite must never reach the network" without qualification, while §10.4 installs the guard in the node project only. One of the two must move (N3).
3. §10.3's four include globs leave the rest of the tree unclaimed by any project, and Vitest reports nothing (N2). Either the globs widen or a phase-15 criterion asserts the partition.
4. §5 R7 should say that the lint rules it assigns to phase 1 are **tested** rules, not merely added ones — F1's whole cause is that R7 and plan task 5 asked for a one-off manual probe recorded in prose, and prose does not run in CI.

**To this phase's criteria**
5. Task 5's instruction — "Verify each rule once by linting a planted file (record file, rule, and the reported message in the Review log; delete the file)" — is a **manual acceptance check**, which charter rule 1 forbids ("Acceptance criteria are met by automated tests, never manual commands"). The plan already demonstrates the automated form two rows later in C3(a)/C3(b). Convert task 5's verification into criterion rows (F1).
6. C5(a)'s row asserts one third of the MUST it cites (F4).
7. MUT-01-6's declared shape forces a live network call for a red that a local mutant produces identically (N4). A named mutation should be specified in the shape that needs no external system.

**Forward hazards for phases 2+**
8. The `process.env` exception list is a single `files:` array that every later phase may be tempted to widen. Once F1's enumerated rows exist, that temptation becomes visible; until then it is not.
9. `src/app/**` remains outside the client-import rule (F2). It costs nothing today because no client component exists; it becomes load-bearing the first time the UI phase (outside this project) lands.
10. The offline guard covers `fetch` only — not `node:http`, a directly imported `undici`, or `XMLHttpRequest`. Faithful to master plan §10.4, which specifies exactly `fetch`, and sufficient for phase 3's transport, which uses `fetch`. Recorded so phase 3 does not assume more than the guard gives.

## Carry-forward dispositions

Not an approval, so nothing is carried past a gate — but the notes have named destinations so they cannot evaporate in the fix round:

| Note | Destination | Disposition |
|---|---|---|
| N1 | phase 1 fix round | `rmdir` the three empty probe directories |
| N2 | phase 15 | candidate criterion: every test file is claimed by exactly one project |
| N3 | coordinator → master plan §10.6, or phase 1 fix round | choose: extend the guard to jsdom (recommended) or qualify the rule |
| N4 | phase 1 plan, MUT-01-6 row | redefine to the local mutant shape |
| N5 | evidence doc, editor-origin row | record `https://secure.proposales.com` as an unverified candidate |
| N6, N7 | — | no action; recorded so they are not re-opened |

## Mutation-probe declaration

Every probe was applied on the tree and reverted. All four repository files were restored **byte-identical**, verified by `shasum -a 256 -c` against a pre-probe manifest; the two probe-only paths were deleted. Final `git status --porcelain` and `HEAD` are identical to the state I found (`ea24913`, only `build_docs/` dirty).

| Path | Kind | Restored |
|---|---|---|
| `eslint.config.mjs` | mutated (4 probes: all `no-restricted-imports` deleted; `src/lib/env` off-override deleted; exception widened to `src/features/**`; exception widened to `src/app/**` + `src/components/**`) | byte-identical (`ea1fd5cc…`) |
| `src/lib/env/server.ts` | mutated (4 probes: `PROBE_ONLY_VAR` key added; `ANTHROPIC_API_KEY` made required; refinement's provider test reversed; `JSON.stringify(raw)` appended to the error message) | byte-identical (`bee4b546…`) |
| `test/setup/node.ts` | mutated (1 probe: guard replaced with a local non-throwing `Response`) | byte-identical (`098f5de9…`) |
| `.env.example` | mutated (1 probe: `PROBE_ONLY_VAR=` appended) | byte-identical (`48960005…`) |
| `src/lib/env/zz-leak-probe.test.ts` | probe-only file (`.env` leak check) | deleted |
| `src/probezone/orphan.test.ts` + `src/probezone/` | probe-only file and directory (project-partition check) | deleted, directory removed |

No database, network, or external state was touched. **No probe of mine made a network request** — the offline-guard probe was deliberately shaped to redden locally (N4). Four temporary backups were written outside the repository under `/tmp` and deleted at close.

## My write perimeter

Documents only; **no code or configuration file was changed by this session**.

1. `plans/phase-01-topology-and-env.md` — Review log entry appended (append-only; the implementer's entry stands untouched) and frontmatter `state`.
2. `master-plan.md` — tracker row 1 only.
3. `handoffs/reviewer/phase-01-round-1.reviewer.md` — this file.
