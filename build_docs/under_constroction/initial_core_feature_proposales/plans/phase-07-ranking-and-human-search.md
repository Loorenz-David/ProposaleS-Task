---
plan: 7
phase: Content ranking domain and human search
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 7 — Content ranking domain and human search

## Goal

Implement the pure ranking function (`scoreItem`, `strengthForScore`, `rankCandidates`) with the integer 0–1000 scale, the three named thresholds, half-open intervals, the total sort order with the `variationId` tie-break, the candidate cap and description truncation, language-scoped matching; the fixture catalog larger than the cap; and the model-free `searchContentForHuman` service.

**Not in this phase:** the agent tools (phase 9); auto-selection and warnings in the proposition (phase 11).

## Read first

1. Master plan §6.5 (`MAX_CANDIDATES`, `MAX_CANDIDATE_DESCRIPTION_CHARS`, `SCORE_MAX`, `T_*`), §6.6 (`rankCandidates`, `scoreItem`, `strengthForScore`, `searchContentForHuman`), §6.7 (`FIXTURE_CATALOG`), §9 rule 6.
2. Intention §17A.8 (all), §10.1, §10.2, §21.1(d).
3. Contracts: `04-server-architecture.md` §4, §5; `08-agent-architecture.md` §3 (bounds); `11-testing-principles.md` §2 (domain row).
4. Phase 3 (client) and 6 Review logs.

## Dependencies (gate)

Phase 6 `APPROVED`.

## Files expected to change

`server/domain/strength.ts`, `strength.test.ts`, `server/domain/rank-candidates.ts`, `rank-candidates.test.ts`, `server/services/search-content-for-human.ts`, `search-content-for-human.test.ts`, `fixtures/catalog.ts` — 7 new files.

## Implementation tasks (ordered)

1. `strength.ts`: constants; `strengthForScore(score: number): MatchStrength | null` — throws on non-integer or out-of-range; `null` below `T_FLOOR`.
2. `rank-candidates.ts`: `tokenize(text, language)` (lowercase, Unicode letters/digits, minimum token length 2); `scoreItem(query, item, language)` — a deterministic integer: weighted overlap of query tokens with `title[language]` (weight 3) and `description[language]` (weight 1), normalized to `[0, SCORE_MAX]` by the query token count, `Math.round` on an integer-scaled ratio then clamped — all integer arithmetic on scores (this is not a money path); `catalogLanguages(catalog)`; `rankCandidates(query, catalog, language)`: exclude items without `title[language]`, score, drop below floor, sort by `(strength desc, score desc, Number(variationId) asc)`, slice to `MAX_CANDIDATES`, truncate descriptions with `truncated: true`, attach `reason` (the matched tokens joined).
3. `fixtures/catalog.ts`: `FIXTURE_CATALOG` with `> MAX_CANDIDATES` items (assert in the module: `if (FIXTURE_CATALOG.length <= MAX_CANDIDATES) throw`), localized `en` and `sv`, two items with identical text and different ids (for the tie-break), one item without `sv`, one with a description longer than `MAX_CANDIDATE_DESCRIPTION_CHARS`.
4. `search-content-for-human.ts`: `import "server-only"`; parses `{ query, language }` with a strict input schema; `proposales.listContent()` once; returns `{ candidates: rankCandidates(...) }`.
5. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | deterministic | same `(query, catalog, language)` twice | deep-equal outputs | — | M12 |
| C1(b) | independent of catalog order | catalog reversed / shuffled with a seeded permutation | identical output to the original order | MUT-07-1 `rank-candidates.ts` · comparator · remove the `variationId` tie-break → C1(b) red (the fixture's two identical-text items guarantee a tie) | M12, §17A.8 |
| C1(c) | pure | `rankCandidates` has no `deps` parameter and the module imports nothing from `lib/proposales`, `lib/ai`, or `node:*` (source read) | as stated | — | §17A.8 |
| C2(a) | `T_STRONG` → strong | | `"strong"` | — | M12 |
| C2(b) | `T_STRONG − 1` → possible | | `"possible"` | MUT-07-2 `strength.ts` · `>=` to `>` on the strong bound → C2(a) red | M12 |
| C2(c) | `T_POSSIBLE` → possible | | | — | M12 |
| C2(d) | `T_POSSIBLE − 1` → weak | | | — | M12 |
| C2(e) | `T_FLOOR` → weak | | | — | M12 |
| C2(f) | `T_FLOOR − 1` → excluded | | `null` | — | M12 |
| C2(g) | `SCORE_MAX` → strong; `0` → null | | | — | M12 |
| C2(h) | constants ordered | | `0 < T_FLOOR < T_POSSIBLE < T_STRONG <= SCORE_MAX`, all integers | — | §17A.8 (rule 13: contract, not literals) |
| C2(i) | non-integer score | `strengthForScore(500.5)` | throws | — | §17A.8 |
| C3(a) | fixture larger than cap | | `FIXTURE_CATALOG.length > MAX_CANDIDATES` asserted in the test | — | M12, §17A.8 |
| C3(b) | cap applied | query matching every item | `candidates.length === MAX_CANDIDATES` | MUT-07-3 `rank-candidates.ts` · `slice` · remove → C3(b) red | M12 |
| C3(c) | floor exclusion | query matching two items strongly and nothing else | length 2 (not padded to the cap) | — | §17A.8 |
| C4(a) | truncation | the long-description item | `description.length === MAX_CANDIDATE_DESCRIPTION_CHARS`, `truncated === true` | — | §17A.8 |
| C4(b) | no truncation | short item | verbatim, `truncated === false` | — | §17A.8 |
| C5(a) | missing language excluded | `language: "sv"`, the `en`-only item | not in candidates even when its `en` text matches | — | §17A.8, crit 13 |
| C5(b) | matching in the proposal language | a term present only in the `sv` description of one item | matched for `sv`, not for `en` | — | §17A.8 |
| C5(c) | catalog languages | | `catalogLanguages(FIXTURE_CATALOG)` deep-equals `["en","sv"]` sorted | — | §17A.8, crit 13 |
| C6(a) | strong before possible | two items with scores across `T_STRONG` | strong first | — | M12 |
| C6(b) | possible before weak | | | — | M12 |
| C6(c) | equal strength, higher score first | | | — | M12 |
| C6(d) | equal score, lower `variationId` first | the identical-text pair | numeric ascending | — | M12 |
| C7(a) | one catalog read | fake with `FIXTURE_CATALOG` | `fake.calls` deep-equals `[{ op: "listContent" }]` | — | §17A.8 (full catalog per run) |
| C7(b) | result equals the pure function | | `candidates` deep-equals `rankCandidates(query, FIXTURE_CATALOG, language)` | — | M4 (crit 4, human search) |
| C7(c) | no model | the service signature has no `ai` dependency (`expectTypeOf`) | compiles | — | §10.2, §5.1 |
| C7(d) | output validated | | every candidate parses `contentCandidateSchema`; input `{ query: "" }` → `ValidationError` | — | §17A.8 |

Criteria: 7 (C1–C7), 28 rows (a table line is one row; a lettered span counts its letters). Named mutations: 3.

## Notes

- Scores use integer arithmetic by design; the "no arithmetic" rule (invariant 17) is a money rule and does not apply here. Say so in a comment at the top of `rank-candidates.ts` so a reviewer does not flag it.
- Projection gate: mandatory (rank 7).

## Review log

*(append-only)*
