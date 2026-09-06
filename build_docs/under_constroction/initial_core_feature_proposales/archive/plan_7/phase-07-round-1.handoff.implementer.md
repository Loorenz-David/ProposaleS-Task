---
plan: 7
role: implementer
round: 1
date: 2026-09-06
state: IMPLEMENTED
actor: Claude
---

# Phase 7 — Content ranking domain and human search (implementer, round 1)

## Summary

Implemented the pure content-ranking domain (`tokenize`, `scoreItem`, `strengthForScore`,
`catalogLanguages`, `rankCandidates`) and the model-free `searchContentForHuman` service,
per `plans/phase-07-ranking-and-human-search.md`. All 56 acceptance rows across C1–C8 pass;
all 14 named mutations (MUT-07-1 … MUT-07-14) were applied at their named site, observed
red, and reverted. Closing L4: `npm test` 24 files / 334 tests green, `npm run typecheck`
and `npm run lint` clean, on tree `a9bfabe` + the declared 9-path dirty diff, now committed
as checkpoint `f2399ac`.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs you. All open points in the plan were explicit implementer delegations
(D15, D22, D24, D28); each is decided below with rationale, not escalated.

## Gate check (all 8 items pass)

| # | Requirement | Result |
|---|---|---|
| 1 | Intention status `RATIFIED` | Confirmed — header row, `planing/proposal-preparation-backend-intention.md` |
| 2 | Tracker rows 1–6 `APPROVED` | Confirmed — `master-plan.md` §4 |
| 3 | Tracker row 7 `PROMPT_READY` | Confirmed (pre-implementation) |
| 4 | Phase plan frontmatter `state: PROMPT_READY` | Confirmed |
| 5 | 8 criteria / 56 rows / 14 mutations, re-derived by counting | Re-counted directly from the acceptance table: C1(5)+C2(12)+C3(3)+C4(4)+C5(4)+C6(5)+C7(11)+C8(12) = 56 rows across 8 criteria; 14 non-"—" entries in the Named-mutation column (MUT-07-1…14) |
| 6 | `server/services/` does not exist | Confirmed — only `server/domain/` present |
| 7 | `MAX_SEARCH_QUERY_CHARS` absent from `content-candidate.ts` | Confirmed — grep exit 1 |
| 8 | Master §6.6 contains a `tokenize` row | Confirmed |

Provenance at gate time: HEAD `a9bfabebb3378acb0a9f634e8980e51689a750bc`, `git status --porcelain` clean (the projection fold was already committed as that HEAD).

## Read order

Completed in full per the prompt's "Read first" list and the plan's own §"Read first":
master plan §§6.1, 6.4–6.8, 9.0, 9.1, 10.3, 10.5; intention §17A.8, §17A.16, §10.1–10.2,
§21.1(d); contracts 02 §§3–6,9; 03 §§1–4; 04 §§4–6; 06 §§3–4,6–8; 08 §3; 10 §4; 11 §§2–3,5;
13 §§1,3; 14 §8; 12-anti-patterns (runtime-boundary, server, data-and-validation, structure
sections); the existing code the phase binds to (`content-candidate.ts`, `lib/proposales/index.ts`,
`fake.ts`, `mappers.ts`, `server/domain/approvability.ts` + its test for the established
test shape); phase 3 and phase 6 Review logs; this phase's own Review log (projection round 0).

## Task 0 — coverage map (row → test → assertion shape)

Every row below is discharged by an assertion of the **shape the row specifies** (not a
weaker one). File key: `SCH` = `schemas/content-candidate.test.ts`, `STR` = `server/domain/strength.test.ts`,
`RNK` = `server/domain/rank-candidates.test.ts`, `SVC` = `server/services/search-content-for-human.test.ts`.

| Row | Test | File | Shape |
|---|---|---|---|
| C1(a) | "C1(a) is deterministic for the same inputs" | RNK | deep-equal of two calls |
| C1(b) | "C1(b) is independent of catalog order" | RNK | deep-equal across reversal + hand-written interleave |
| C1(c) | "C1(c) is pure, with only its two permitted exceptions, and has arity 3" | RNK | source-text checks (permitted imports present, forbidden imports/globals absent) + `.length===3` |
| C1(d) | "C1(d) never mutates the input catalog" | RNK | `structuredClone` before/after deep-equal |
| C1(e) | "C1(e) an empty query token set yields no candidates" | RNK | `toEqual([])` |
| C2(a)–(l) | "C2(a)"…"C2(l)" | STR | exact strength/throw per row |
| C3(a) | "C3(a) the fixture catalog is larger than the candidate cap" | RNK | `toBeGreaterThan` |
| C3(b) | "C3(b) the candidate cap is applied" | RNK | `toHaveLength(MAX_CANDIDATES)`, cap-relation asserted first |
| C3(c) | "C3(c) below-floor items are excluded, not padded to the cap" | RNK | `toHaveLength(2)` |
| C4(a) | "C4(a) an over-cap description is truncated at the cap" | RNK | length===cap, `truncated===true` |
| C4(b) | "C4(b) a short description is returned verbatim" | RNK | exact string, `truncated===false` |
| C4(c) | "C4(c) a description exactly at the cap is not truncated" | RNK | length===cap, exact string, `truncated===false` |
| C4(d) | "C4(d) an item with no en description is still a candidate" | RNK | `description===""`, `truncated===false`, item present |
| C5(a) | "C5(a) an item missing the target language's title is excluded" | RNK | length 1 (en) vs 0 (sv) |
| C5(b) | "C5(b) an item whose target-language title is whitespace-only is excluded" | RNK | length 1 (en) vs 0 (sv), sv query drawn from the item's own sv description (see finding below) |
| C5(c) | "C5(c) matching runs in the proposal language" | RNK | sv candidate id, en `[]` |
| C5(d) | "C5(d) catalogLanguages reports only languages the catalog can serve" | RNK | `toEqual(["en","sv"])` |
| C6(a)–(c) | "C6(a)"…"C6(c)" | RNK | index-order comparison on the 3-token query |
| C6(d) | "C6(d) equal score orders by ascending variationId, not lexically" | RNK | index("9") < index("10") |
| C6(e) | "C6(e) non-numeric ids do not fall back to arrival order" | RNK | both arrival orders → `["a","b"]` |
| C7(a) | "C7(a) reads the catalog exactly once" | SVC | `calls` deep-equal |
| C7(b) | "C7(b) returns the expected order" | SVC | literal id sequence |
| C7(c) | "C7(c) performs no post-processing beyond rankCandidates" | SVC | deep-equal vs direct `rankCandidates` call |
| C7(d) | "C7(d) the deps type carries no model dependency" | SVC | `expectTypeOf(...).not.toHaveProperty("ai")` |
| C7(e) | "C7(e) every returned candidate validates" | SVC | schema `.safeParse().success` per candidate |
| C7(f)–(k) | "C7(f)"…"C7(k)" | SVC | `rejects.toMatchObject` with exact one-issue path, or exact resolved value |
| C8(a)–(l) | "C8(a)"…"C8(l)" | SCH | `.safeParse` success/failure with exact one-issue path (C8(l) shape noted as a finding) |

Red baseline: captured by construction — every test targets a module that did not exist
before this round, so the baseline was "cannot find module" for every row until each
production file was written (import-time failure, not a partial run). This is a legitimate
red baseline for a from-scratch phase (charter test-evidence section; nothing here retains
a prior round's baseline to carry forward).

Reverse trace: every test in all four files above appears in this table against a row; no
orphan test was written.

## The four delegated decisions

- **D15 (Zod-issue conversion):** duplicated the three-line `zodIssues` helper inside
  `search-content-for-human.ts` rather than extracting to `schemas/shared.ts` — two call
  sites is not yet a pattern (contract 03 §3). Perimeter stays 9 paths (the 11-path option
  was not taken). The `unrecognized_keys` branch is preserved; C7(j) exercises it. No
  `details.reason` set on the thrown `ValidationError`.
- **D22 (C1(b) permutations):** a full reversal of a copied array (`[...FIXTURE_CATALOG].reverse()`),
  plus one hand-written 14-element interleave with fixed literal indices (no PRNG).
- **D24 (truncation edges):** sliced by UTF-16 code units (`.slice(0, MAX_CANDIDATE_DESCRIPTION_CHARS)`),
  no ellipsis, no re-trim after slicing. The fixture's over-cap/exact-cap descriptions are
  built once from a literal base sentence plus literal filler text, sliced to exact target
  lengths (301 and 280); the character at the truncation boundary was confirmed non-whitespace
  at authoring time (lands on `"c"` in both cases) so the slice never disagrees with the
  schema's own `.trim()`.
- **D28 (`reason` string):** matched query tokens (title-or-description membership),
  deduped preserving first-occurrence (query) order, joined by `", "`.

## Mutation table (14/14 executed and reverted)

| # | File | Site | Change | Test | Observed |
|---|---|---|---|---|---|
| MUT-07-1 | `rank-candidates.ts` | comparator, definition | `return compareVariationIds(...)` → `return 0` | C1(b) | Red: reversed-array output diverged from original order (ties fell back to input order) |
| MUT-07-2 | `rank-candidates.ts` | `rankCandidates`, definition | added `import { getProposalesClient } from "@/lib/proposales"` + a reference in the body | C1(c) | Red: forbidden-import regex matched |
| MUT-07-3 | `rank-candidates.ts` | `rankCandidates`, definition | added `catalog.sort((a,b)=>compareVariationIds(b.variationId,a.variationId))` sorting the actual argument | C1(d) | Red: `FIXTURE_CATALOG` no longer deep-equaled its pre-call clone |
| MUT-07-4 | `rank-candidates.ts` | `scoreItem`, definition | removed `if (queryTokens.size === 0) return 0;` | C1(e) | Red: `RangeError: score must be an integer in [0,1000]` (NaN from 0/0 propagated into `strengthForScore`) |
| MUT-07-5 | `strength.ts` | `strengthForScore`, definition | `score >= T_STRONG` → `score > T_STRONG` | C2(a) | Red: `T_STRONG` scored `"possible"` instead of `"strong"` |
| MUT-07-6 | `strength.ts` | `strengthForScore`, definition | `score >= T_POSSIBLE` → `score > T_POSSIBLE` | C2(c) | Red: `T_POSSIBLE` scored `"weak"` instead of `"possible"` |
| MUT-07-7 | `strength.ts` | `strengthForScore`, definition | `score >= T_FLOOR` → `score > T_FLOOR` | C2(e) | Red: `T_FLOOR` scored `null` instead of `"weak"` |
| MUT-07-8 | `rank-candidates.ts` | `rankCandidates`, definition | removed `.slice(0, MAX_CANDIDATES)` | C3(b) | Red: 14 candidates returned instead of 10 |
| MUT-07-9 | `rank-candidates.ts` | `rankCandidates`, definition | `rawDescription.length > MAX_...` → `>=` | C4(c) | Red: exactly-at-cap item reported `truncated: true` |
| MUT-07-10 | `rank-candidates.ts` | `rankCandidates`, definition | dropped `title.trim().length === 0` from the language-availability filter (presence-only) | C5(b) | Red (after re-siting the test's sv query — see finding) |
| MUT-07-11 | `rank-candidates.ts` | `catalogLanguages`, definition | dropped the non-empty-after-trim filter | C5(d) | Red: `["en","no","sv"]` instead of `["en","sv"]` |
| MUT-07-12 | `rank-candidates.ts` | comparator, definition | `compareVariationIds` → bare `Number(a) - Number(b)` | C6(e) | Red: non-numeric ids `"a"`/`"b"` fell back to arrival order in both directions |
| MUT-07-13 | `content-candidate.ts` | `searchContentInputSchema`, definition | removed `.max(MAX_SEARCH_QUERY_CHARS)` | C7(h) | Red: the over-cap query resolved instead of rejecting |
| MUT-07-14 | `content-candidate.ts` | `contentCandidateSchema`, definition | `score` `.max(1000)` → `.max(1001)` | C8(h) | Red: `SCORE_MAX + 1` parsed successfully |

All 14 rows were reverted immediately after observing red; the domain-scoped suite
(`npx vitest run --project node src/features/proposal-preparation`, 171/171) was re-run
green after each revert and again at the end of the sequence. `executed === declared === 14`.

**A false green caught by the mutation run itself (MUT-07-10):** the row's first-drafted
test queried `"regional"` (an en-only term) under `language: "sv"` to prove the whitespace-sv-title
item (`variationId "8"`) is excluded. Under MUT-07-10, that item is still excluded — but now
via the unrelated score-floor path (the query matches nothing in its sv text at all), not via
the title-language filter the mutation targets, so the test stayed green under the mutation.
Re-sited the sv-side query to `"marknader"`, a term present only in that item's own sv
*description* — under correct code the item is still excluded (title check fires first);
under MUT-07-10 the presence-only filter now admits the item, its description then supplies
enough score to clear the floor, and the row reddens as it should. Re-run confirmed both
directions. This is recorded per charter rule ("a probe that lands in the wrong place
measures nothing... a session that catches its own false green and reports it is doing the
job exactly").

## Findings

- **C8(l)'s stated expected outcome does not match Zod 4's actual behavior**, verified
  directly: `contentCandidateSchema.safeParse({...valid, extra: 1})` yields one issue
  `{ code: "unrecognized_keys", path: [], keys: ["extra"] }` — the unrecognized-key issue
  sits at the **object's own empty path**, with offending key names in a separate `keys`
  array, not at a per-key path `["extra"]`. This is standard Zod 4 `strictObject` behavior,
  not specific to this schema (confirmed against a throwaway `z.strictObject({a: z.string()})`).
  `content-candidate.ts` has no wrapper analogous to `workflow-state.ts`'s
  `zodIssues`/`parseProposalWorkflowState` that flattens this shape, and the plan does not
  ask for one here. The test (`SCH`, "C8(l)") asserts the real shape (`path: []`, `keys:
  ["extra"]`) rather than the plan's literal `path: ["extra"]`. Every other C8 row's literal
  path matched the plan exactly on first run. No code change follows from this — it is a
  documentation-vs-runtime mismatch in the plan text, not a defect in the schema.
- **No candidate criterion.** Every test written traces to a declared row (Task 0 table
  above, reverse direction); nothing orphaned.

## Closing stamp

- Hypothesis: the phase's full change set is green and introduces no regression.
- Scope: L4 (full suite; the cycle's one authoritative stamp).
- Command: `npm test` (`vitest run`), `npm run typecheck` (`tsc --noEmit`), `npm run lint` (`eslint .`).
- Tree at stamp time: HEAD `a9bfabebb3378acb0a9f634e8980e51689a750bc` + the declared 9-path
  dirty diff (now committed as `f2399ac`).
- Result: `npm test` → 24 files / 334 tests, all green (was 20 files / 278 tests at phase 6's
  close; +4 test files, +56 tests — exactly this phase's row count). `npm run typecheck` →
  clean. `npm run lint` → clean.
- Failure-ID delta: none; no pre-existing failures at either baseline.

## Full write perimeter

**Code (9 paths, all declared in the plan; no D15 extraction taken):**
`src/features/proposal-preparation/server/domain/strength.ts` (new),
`server/domain/strength.test.ts` (new),
`server/domain/rank-candidates.ts` (new),
`server/domain/rank-candidates.test.ts` (new),
`server/services/search-content-for-human.ts` (new),
`server/services/search-content-for-human.test.ts` (new),
`fixtures/catalog.ts` (new),
`schemas/content-candidate.test.ts` (new),
`schemas/content-candidate.ts` (edited: added `MAX_SEARCH_QUERY_CHARS`, `searchContentInputSchema`,
`SearchContentInput`; nothing pre-existing changed).

**Documents:** `master-plan.md` (tracker row 7 only, → `IMPLEMENTED`),
`plans/phase-07-ranking-and-human-search.md` (Review log append only).

**Mutation-probe files, applied and reverted (none left in the tree):**
`server/domain/rank-candidates.ts` (MUT-07-1, -2, -3, -4, -8, -9, -10, -11, -12 — nine probes,
same file, sequential, each reverted before the next), `server/domain/strength.ts`
(MUT-07-5, -6, -7), `schemas/content-candidate.ts` (MUT-07-13, -14). No probe touched any
file outside this list. `tsconfig.tsbuildinfo` shows as modified (a TypeScript incremental
build cache) but was deliberately **not staged** in the checkpoint commit — it is a build
artifact, not declared work.

**Tool-recorded state:** `.archgraph/` is not present in this repository; skipped per the
prompt's instruction.

**Checkpoint commit:** `f2399ac` — "CHECKPOINT (not approved): phase 07 content ranking and
human search" — staged exactly the 11 files above (9 code + 2 docs); `tsconfig.tsbuildinfo`
left unstaged.
