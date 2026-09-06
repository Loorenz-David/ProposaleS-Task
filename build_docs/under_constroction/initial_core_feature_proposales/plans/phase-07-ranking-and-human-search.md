---
plan: 7
phase: Content ranking domain and human search
state: PROMPT_READY
date: 2026-09-06
author: implementation-planner round 1; amended by the coordinator 2026-09-06 (projection round-0 fold, 33 ledger rows)
---

# Phase 7 — Content ranking domain and human search

## Goal

Implement the pure ranking function (`tokenize`, `scoreItem`, `strengthForScore`, `catalogLanguages`, `rankCandidates`) with the integer 0–1000 scale, the three named thresholds, half-open intervals, the total sort order with the `variationId` tie-break, the candidate cap and description truncation, language-scoped matching; the fixture catalog larger than the cap; the content-search query bound; and the model-free `searchContentForHuman` service.

**Not in this phase:** the agent tools (phase 9); auto-selection and warnings in the proposition (phase 11).

## Read first

1. Master plan §6.5 (`MAX_SEARCH_QUERY_CHARS`, `MAX_CANDIDATES`, `MAX_CANDIDATE_DESCRIPTION_CHARS`, `SCORE_MAX`, `T_*`), §6.4 (`contentCandidateSchema`, `searchContentInputSchema`), §6.6 (`rankCandidates`, `scoreItem`, `tokenize`, `catalogLanguages`, `strengthForScore`, `searchContentForHuman`), §6.7 (`FIXTURE_CATALOG`), §6.8, §9.1 rules 4, 6, 9, §10.5.
2. Intention §17A.8 (all), §17A.16 (first bullet and the content-search-query paragraph), §10.1, §10.2, §21.1(d).
3. Contracts: `02-runtime-boundaries.md` §§3–6, 9; `03-feature-architecture.md` §§1–4; `04-server-architecture.md` §§4–6; `06-data-contracts-and-validation.md` §§3–4, 6–8; `08-agent-architecture.md` §3 (bounds); `10-security-and-trust-boundaries.md` §4; `11-testing-principles.md` §§2–3, 5; `13-decision-checklist.md` §§1, 3; `14-documentation-principles.md` §8; and `12-anti-patterns.md` (runtime-boundary, server, data-and-validation, structure sections).
4. Phase 3 (client) and 6 Review logs; this file's Review log.

`03` §§1–4 and `13` §§1, 3 were added by the projection fold: this phase creates the repository's first `server/services/` file, so folder creation and the service-shape checklist both apply.

## Dependencies (gate)

Phase 6 `APPROVED`.

## Files expected to change

`server/domain/strength.ts`, `strength.test.ts`, `server/domain/rank-candidates.ts`, `rank-candidates.test.ts`, `server/services/search-content-for-human.ts`, `search-content-for-human.test.ts`, `fixtures/catalog.ts`, `schemas/content-candidate.test.ts` — **8 new files** — plus `schemas/content-candidate.ts` — **1 existing file edited** (it gains `MAX_SEARCH_QUERY_CHARS`, `searchContentInputSchema`, and `SearchContentInput`; nothing already in it changes). **9 paths.**

`master-plan.md` is **not** in this perimeter. The naming-registry additions this phase needs (§6.4, §6.5, §6.6) were made by the coordinator before dispatch, per master §6.6's rule that the coordinator owns that section.

## Implementation tasks (ordered)

1. **`server/domain/strength.ts`** — opens with `import "server-only";` (master §6.1; contract 02 §3). Exports `SCORE_MAX`, `T_STRONG`, `T_POSSIBLE`, `T_FLOOR`, and `strengthForScore(score: number): MatchStrength | null`. It **throws** on a non-integer score and on a score outside `[0, SCORE_MAX]`; returns `null` below `T_FLOOR`. This module imports nothing from the rest of the phase — it owns the scale and the thresholds and depends on neither `tokenize` nor `rankCandidates`.

2. **`server/domain/rank-candidates.ts`** — opens with `import "server-only";`. Exports `MAX_CANDIDATES`, `MAX_CANDIDATE_DESCRIPTION_CHARS`, `tokenize`, `scoreItem`, `catalogLanguages`, `rankCandidates`.

   - **`tokenize(text: string): string[]`** — `text.normalize("NFC").toLowerCase()`, matched with `/[\p{L}\p{N}]+/gu`, then tokens shorter than **2 UTF-16 code units** dropped. No `language` parameter: `toLocaleLowerCase(language)` would make determinism a function of the runtime's ICU data, and `rankCandidates` has already selected the localized text before calling this. NFC matters here and is not theoretical — the fixture is localized in `sv`, and `å ä ö` in NFD decompose into base letter plus combining mark, which changes both the token set and the length count.

   - **`scoreItem(query, item, language): number`** — the exact arithmetic, in one line, is:

     ```
     Q = new Set(tokenize(query))                          // the query is a SET: "room room" has |Q| = 1
     w(t) = 3 if t ∈ new Set(tokenize(item.title[language] ?? ""))
            1 if t ∈ new Set(tokenize(item.description[language] ?? ""))
            0 otherwise                                    // title wins; the two weights never add
     score = Q.size === 0 ? 0 : Math.round((SCORE_MAX * Σ_{t∈Q} w(t)) / (3 * Q.size))
     ```

     Membership, never frequency: a token occurring five times in a description counts once. The numerator is at most `3 × |Q|` by construction, so the result is always in `[0, SCORE_MAX]` and **no clamp is written** (a clamp that can never fire is dead scaffolding, charter rule 4). `Q.size === 0` returns `0` rather than dividing by zero, which keeps `scoreItem` total; `rankCandidates` then returns `[]` through the floor, and C1(e) asserts that observable.

   - **`catalogLanguages(catalog): string[]`** — every key of any item's `title` whose value is **non-empty after trim**, deduped, sorted with the default string comparator. Title keys only, and the same non-empty predicate as the candidate filter below: a language present only in a `description`, or only as whitespace, can never yield a candidate, so including it would feed phase 11's language derivation a language the catalog cannot serve.

   - **`rankCandidates(query, catalog, language): ContentCandidate[]`** — exclude items whose `title[language]` is absent **or empty after trim**; score; drop below `T_FLOOR`; sort by `(strength desc, score desc, variationId asc)`; slice to `MAX_CANDIDATES`; truncate descriptions; attach `reason`. It **never mutates `catalog`** — sort a copy (`[...catalog]`), never the argument. The `catalog` the fake returns is the caller's own array by reference (`src/lib/proposales/fake.ts:70`) and `FIXTURE_CATALOG` is a module-level constant shared by every test in the run, so an in-place sort would corrupt later tests non-deterministically by file order.

   - **The `variationId` tie-break is fail-safe, not fail-silent.** `Number(id)` is `NaN` for a non-numeric id, and a comparator returning `NaN` is treated by V8 as `0` — the sort then falls back to arrival order, which is exactly the vendor list-order leak §17A.8:721 exists to prevent, reintroduced by the tie-break written to prevent it. Compare numerically when **both** ids parse as finite numbers; otherwise compare the id strings.

   - **Truncation is half-open**, consistent with §17A.8's threshold convention: `description.length > MAX_CANDIDATE_DESCRIPTION_CHARS` truncates to exactly that many **UTF-16 code units** with `truncated: true`; a description of exactly the cap is verbatim with `truncated: false`. No ellipsis, and the slice is **not** re-trimmed.

   - **An absent `description[language]`** — `toContentItem` maps a missing wire description to `{}` (`src/lib/proposales/mappers.ts:68`) — yields `description: ""`, `truncated: false`. The item is still a candidate if its title matches.

   - **`reason`** is the matched tokens, **deduped, in query order, joined by `", "`**. It is never empty: an item with no matched token scores `0`, and `0 < T_FLOOR`, so it is already excluded by the floor.

3. **`fixtures/catalog.ts`** — `FIXTURE_CATALOG: ContentItem[]`, `length > MAX_CANDIDATES`. It imports **only** `import type { ContentItem } from "@/lib/proposales"` (a type import, erased at runtime) and nothing else; `fixtures/` is runtime-neutral, and `propositions.ts:3` / `states.ts:3–8` import from `../schemas/` only. **No module-level throw** — a `MAX_CANDIDATES` import for a module-level assertion would be a *value* import from a `server-only` module into `fixtures/`, and the Vitest node project aliases `server-only` to a stub, so the break would be invisible and the suite would stay green. C3(a) asserts the relation **in the test**, which is what master §9.1 rule 6 requires and what makes it falsifiable.

   Required properties, each carrying at least one criterion row:

   - Deterministic `productId`s and one **fixed ISO literal** `createdAt` per item (never `new Date()`, master §9.1 rule 4).
   - `variationId`s are **canonical decimal strings**. The identical-text tie pair uses `"9"` and `"10"` — numeric and lexical order disagree there, so C6(d) cannot pass under a lexical comparator.
   - Localized `en` and `sv` throughout; one item with **no `sv` key** in `title` (C5(a)).
   - One item whose `sv` title is **whitespace only**, carrying additionally a `"no"` title key that is also whitespace only and appears non-empty nowhere else in the catalog (C5(b), C5(d)).
   - One item whose `en` description is **longer than** `MAX_CANDIDATE_DESCRIPTION_CHARS`, whose character at index `MAX_CANDIDATE_DESCRIPTION_CHARS − 1` is **not whitespace** (the returned object is not re-trimmed, so a slice ending in whitespace would disagree with `contentCandidateSchema`'s `.trim()` and C4(a)'s asserted length).
   - One item whose `en` description is **exactly** `MAX_CANDIDATE_DESCRIPTION_CHARS` (C4(c)); one short one (C4(b)); one with **no `en` description key** whose `en` title matches (C4(d)).
   - One item whose `sv` description carries a term present in **no** `en` text anywhere (C5(c)).
   - One token in **every** item's `en` title (C3(b)); one token in **exactly two** items' `en` titles and nowhere else (C3(c)).
   - Items whose scores under task 2's formula land in the bands the C6 rows need — see the worked table in Notes.

4. **`schemas/content-candidate.ts`** (edited) — add, without changing anything already there:

   ```ts
   export const MAX_SEARCH_QUERY_CHARS = 200;
   export const searchContentInputSchema = z.strictObject({
     query: z.string().trim().min(1).max(MAX_SEARCH_QUERY_CHARS),
     language: z.string().trim().min(1),
   });
   export type SearchContentInput = z.infer<typeof searchContentInputSchema>;
   ```

   The cap is the owner's decision of 2026-09-06 (projection card 1) and the intention's §17A.16 first bullet now names this field. The module stays runtime-neutral — no `server-only`, no import from `server/` — so it cannot import `SCORE_MAX`; C8(h) and C8(i) bind `score`'s literal ceiling to that constant through a test instead.

5. **`server/services/search-content-for-human.ts`** — opens with `import "server-only";`. Creating `server/services/` with its first real file satisfies contract 03 §1's no-empty-folder rule.

   ```ts
   const defaultDeps = {
     get proposales(): ProposalesClient { return getProposalesClient(); },
   };
   export async function searchContentForHuman(
     input: unknown,
     deps: { proposales: ProposalesClient } = defaultDeps,
   ): Promise<{ candidates: ContentCandidate[] }>
   ```

   - The parameter is **`unknown`**, not a typed pair: this is a trust boundary and the service is what rejects bad input (06 §3; 13 §3 Q20). A typed parameter would force every negative test to cast, which is the shape that hides a real regression. `safeParse` at the top; on failure throw `ValidationError` with the mapped issue paths.
   - `defaultDeps.proposales` is a **getter**, evaluated per call. `getProposalesClient()` reads `serverEnv` (`src/lib/proposales/client.ts:110`), so an eager default would make the module unimportable without a full environment — invisible in tests, because the suite-wide placeholders supply one. **Every later service inherits this shape** (master §6.6).
   - Then `proposales.listContent()` **once**, and return `{ candidates: rankCandidates(parsed.query, catalog, parsed.language) }`.

6. Named mutations (the fourteen below), revert, closing stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | deterministic | same `(query, catalog, language)` twice | deep-equal outputs | — | M12 |
| C1(b) | independent of catalog order | two literal permutations of a **copy** of `FIXTURE_CATALOG` (full reversal, plus one hand-written interleave); never `FIXTURE_CATALOG.reverse()`, which mutates the shared fixture | each deep-equals the original order's output | MUT-07-1 `rank-candidates.ts` · comparator, definition · remove the `variationId` tie-break → C1(b) red (the fixture's two identical-text items guarantee a tie) | M12, §17A.8 |
| C1(c) | pure | source read of `rank-candidates.ts`, with `import type` lines stripped first | (i) no **value** import from `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, or any `node:*`; (ii) no `fetch`, `Date`, `Math.random`, or `process` reference, **and no dynamic `import(` in any form** (added by review round 1, S2: MUT-07-2 exercised only the static shape, and `await import("node:fs")` sailed through); (iii) `rankCandidates.length === 3`. `import "server-only"` and `import type { ContentItem } from "@/lib/proposales"` are the two permitted exceptions and the row asserts they are present | MUT-07-2 `rank-candidates.ts` · `rankCandidates`, definition · add `import { getProposalesClient } from "@/lib/proposales"` and reference it in the body → C1(c) red · **MUT-07-19** same file and site · add `await import("node:fs")` inside `rankCandidates` → C1(c) red | §17A.8 |
| C1(d) | input never mutated | `structuredClone(FIXTURE_CATALOG)` taken before the call | after `rankCandidates` returns, `FIXTURE_CATALOG` deep-equals the clone | MUT-07-3 `rank-candidates.ts` · `rankCandidates`, definition · sort the argument in place (`catalog.sort` for `[...catalog].sort`) → C1(d) red | §17A.8 |
| C1(e) | empty query token set | `rankCandidates("a", FIXTURE_CATALOG, "en")` — `"a"` is one code unit, below the minimum token length, so `\|Q\| = 0` | `[]` | MUT-07-4 `rank-candidates.ts` · `scoreItem`, definition · remove the `Q.size === 0` guard → C1(e) red (division by zero → `NaN` → `strengthForScore` throws) | §17A.8 (`rank` is a pure **total** function) |
| C2(a) | `T_STRONG` → strong | | `"strong"` | MUT-07-5 `strength.ts` · `strengthForScore`, definition · `>=` to `>` on the strong bound → C2(a) red | M12 |
| C2(b) | `T_STRONG − 1` → possible | | `"possible"` | — | M12 |
| C2(c) | `T_POSSIBLE` → possible | | `"possible"` | MUT-07-6 `strength.ts` · `strengthForScore`, definition · `>=` to `>` on the possible bound → C2(c) red | M12 |
| C2(d) | `T_POSSIBLE − 1` → weak | | `"weak"` | — | M12 |
| C2(e) | `T_FLOOR` → weak | | `"weak"` | MUT-07-7 `strength.ts` · `strengthForScore`, definition · `>=` to `>` on the floor bound → C2(e) red | M12 |
| C2(f) | `T_FLOOR − 1` → excluded | | `null` | — | M12 |
| C2(g) | `SCORE_MAX` → strong | | `"strong"` | — | M12 |
| C2(h) | `0` → excluded | | `null` | — | M12 |
| C2(i) | constants ordered | | `0 < T_FLOOR < T_POSSIBLE < T_STRONG <= SCORE_MAX`, all integers | — | §17A.8 (rule 13: contract, not literals) |
| C2(j) | non-integer score | `strengthForScore(500.5)` | throws | — | §17A.8 |
| C2(k) | below range | `strengthForScore(-1)` | throws | — | §17A.8 |
| C2(l) | above range | `strengthForScore(SCORE_MAX + 1)` | throws | — | §17A.8 |
| C3(a) | fixture larger than cap | | `FIXTURE_CATALOG.length > MAX_CANDIDATES` asserted in the test | — | M12, §17A.8 |
| C3(b) | cap applied | the token every `en` title carries | `candidates.length === MAX_CANDIDATES` | MUT-07-8 `rank-candidates.ts` · `rankCandidates`, definition · remove the `slice` → C3(b) red | M12 |
| C3(c) | floor exclusion | the token carried by exactly two `en` titles and nothing else | `candidates.length === 2` (not padded to the cap) | — | §17A.8 |
| C4(a) | truncation | the over-cap-description item | `description.length === MAX_CANDIDATE_DESCRIPTION_CHARS` and `truncated === true` | — | §17A.8 |
| C4(b) | no truncation | the short item | description verbatim, `truncated === false` | — | §17A.8 |
| C4(c) | exactly at the cap | the exactly-`MAX_CANDIDATE_DESCRIPTION_CHARS` item | description verbatim, `truncated === false` (half-open: only `> cap` truncates) | MUT-07-9 `rank-candidates.ts` · `rankCandidates`, definition · `>` to `>=` on the truncation test → C4(c) red | §17A.8 |
| C4(d) | absent description | the item with no `en` `description` key, matched on its title | `description === ""`, `truncated === false`, and the item **is** a candidate | — | §17A.8 |
| C5(a) | missing language excluded | `language: "sv"`, item `"7"` (its `title` has no `sv` key), query `"ledningsnivå"` — a term from **item 7's own `sv` description**. **Corrected by review round 1 (B3):** the row previously used a query matching the item's `en` text, which the score floor excluded under every mutant, so the row could not fail — the same defect already repaired in C5(b), which no mutation forced anyone to check here | the row first asserts its control — `rankCandidates("suite", FIXTURE_CATALOG, "en")` returns exactly one candidate, `variationId "7"`, so the item is matchable — then `rankCandidates("ledningsnivå", FIXTURE_CATALOG, "sv")` deep-equals `[]` | **MUT-07-17** `rank-candidates.ts` · `rankCandidates`, definition · replace `if (title === undefined || title.trim().length === 0) continue;` with `if (title !== undefined && title.trim().length === 0) continue;` → C5(a) red. **The mutant is written out in full on purpose.** Deleting the `title === undefined ||` clause outright instead throws `TypeError: Cannot read properties of undefined (reading 'trim')` and reddens C5(a), C5(b) and C5(c) — a crash, not the defect under test; a ledger row recorded from that would certify a guard that does not exist (charter rule 11) | §17A.8, crit 13 |
| C5(b) | empty title excluded | `language: "sv"`, the item whose `sv` title is whitespace only, and a query term drawn from **that item's own `sv` description**. **Corrected 2026-09-06:** the row previously specified a query matching the item's `en` text, which gave the exclusion a second sufficient cause — with the title filter removed the item still scored 0 against its `sv` text and stayed excluded through the floor, so MUT-07-10 left the row green. A query the item's own `sv` description answers clears the floor under the mutation and only under it | not in candidates | MUT-07-10 `rank-candidates.ts` · `rankCandidates`, definition · weaken the filter to a presence check (drop "non-empty after trim") → C5(b) red | §17A.8 |
| C5(c) | matching in the proposal language | the term present only in one item's `sv` description | that item is a candidate for `sv`; for `en` the same query returns `[]` | — | §17A.8 |
| C5(d) | catalog languages | | `catalogLanguages(FIXTURE_CATALOG)` deep-equals `["en", "sv"]` — `"no"` is absent because no item carries a non-empty `no` title | MUT-07-11 `rank-candidates.ts` · `catalogLanguages`, definition · drop the non-empty-after-trim filter → C5(d) red (yields `["en", "no", "sv"]`) | §17A.8, crit 13 |
| C6(a) | strong before possible | `rankCandidates("consulting service track", FIXTURE_CATALOG, "en")` | `["2", 1000, "strong"]` precedes `["1", 667, "possible"]` — asserted as `(variationId, score, matchStrength)` tuples. **The strong item carries the higher id**, so ascending `variationId` cannot produce this order | **MUT-07-15** `rank-candidates.ts` · comparator, definition · delete the score term (`if (a.score !== b.score) return b.score - a.score;`) → C6(a) red | M12 |
| C6(b) | possible before weak | `rankCandidates("consulting service bundle", FIXTURE_CATALOG, "en")` | `["5", 444, "possible"]` precedes `["3", 333, "weak"]` — tuples, and id 5 > id 3 | — | M12 |
| C6(c) | equal strength, higher score first | the same `"consulting service bundle"` ranking; both items are `possible` | `["8", 667, "possible"]` precedes `["5", 444, "possible"]` — tuples, and id 8 > id 5 | — | M12 |
| C6(d) | equal score, lower `variationId` first | the identical-text pair, ids `"9"` and `"10"` | `"9"` precedes `"10"` (a lexical comparator would order `"10"` first) | — | M12 |
| C6(e) | non-numeric ids do not fall back to arrival order | a locally built two-item catalog with identical text and ids `"b"` and `"a"` | `"a"` precedes `"b"`, and the same holds when the two items are passed in the opposite order | MUT-07-12 `rank-candidates.ts` · comparator, definition · replace the both-finite guard with a bare `Number(a) - Number(b)` → C6(e) red | §17A.8 (vendor list order is never relied upon) |
| C6(f) | the ranking is exactly this | `rankCandidates("consulting service track", FIXTURE_CATALOG, "en")` | the full returned sequence deep-equals the ten `(variationId, score, matchStrength)` tuples `["2",1000,"strong"] · ["1",667,"possible"] · ["5",444,"possible"] · ["3",333,"weak"] · ["4",333,"weak"] · ["6",333,"weak"] · ["7",333,"weak"] · ["8",333,"weak"] · ["9",333,"weak"] · ["10",333,"weak"]`, written literally in the test. **Added by review round 1 (B2):** no row observed `score` or `matchStrength` on any returned candidate, so the whole scoring formula was unguarded — the plan's worked table was reproduced by the code and asserted nowhere | **MUT-07-16** `rank-candidates.ts` · `scoreItem`, definition · title weight `3` → `2` → C6(f) red. Note the order is **unchanged** under this mutant (`2·1·5·3·4·6·7·8·9·10` either way); only the tuples move, which is precisely why an ordinal-only assertion could not catch it | M12, §17A.8 |
| C7(a) | one catalog read | fake seeded with `FIXTURE_CATALOG` | `fake.calls` deep-equals `[{ op: "listContent" }]` | — | §17A.8 (full catalog per run) |
| C7(b) | the returned order is the expected one | same call | the returned `variationId` sequence deep-equals a literal array written in the test and read from the fixture | — | M4 (crit 4, human search) |
| C7(c) | no post-processing | same call | `candidates` deep-equals `rankCandidates(query, FIXTURE_CATALOG, language)` | — | M4 (crit 4, human search) |
| C7(d) | no model | source read of `search-content-for-human.ts`, mirroring C1(c) | no import of `@/lib/ai` or `@/lib/agent` in any form — static, `import type`, or dynamic `import(`. **Corrected by review round 1 (S1):** the row was an `expectTypeOf(...).not.toHaveProperty("ai")`, and adding `ai?: unknown` to the `deps` type passes both `npm run typecheck` and the suite — the optional shape is the realistic one for an added model dependency and the assertion never fired. (This does not contradict the projection's note that `expectTypeOf` is typecheck-enforced: that holds for the `app-error.test.ts:60–74` shapes, not for `.not.toHaveProperty` on an optional key) | **MUT-07-18** `search-content-for-human.ts` · module header, definition · add `import { createAiClient } from "@/lib/ai";` → C7(d) red. `@/lib/ai` does not exist until phase 8, so apply the probe as a source-text edit and expect the row red on the text, not on module resolution | §10.2, §5.1 |
| C7(e) | output validated | same call | every returned candidate parses `contentCandidateSchema` | — | §17A.8 |
| C7(f) | empty query rejected | `{ query: "", language: "en" }` | `ValidationError`; **exactly one** issue, path `["query"]` | — | 06 §3, §17A.16 |
| C7(g) | missing language rejected | `{ query: "conference" }` | `ValidationError`; **exactly one** issue, path `["language"]` | — | 06 §3 |
| C7(h) | over-cap query rejected | `{ query: "x".repeat(MAX_SEARCH_QUERY_CHARS + 1), language: "en" }` | `ValidationError`; **exactly one** issue, path `["query"]` | MUT-07-13 `content-candidate.ts` · `searchContentInputSchema`, definition · remove `.max(MAX_SEARCH_QUERY_CHARS)` → C7(h) red | §17A.16 (owner card 1, 2026-09-06) |
| C7(i) | exactly at the cap accepted | `{ query: "x".repeat(MAX_SEARCH_QUERY_CHARS), language: "en" }` against the fake | resolves to `{ candidates: [] }` — accepted, and no fixture item matches that token | — | §17A.16 |
| C7(j) | unknown key rejected | `{ query: "conference", language: "en", extra: 1 }` | `ValidationError`; **exactly one** issue, path `["extra"]` | — | 06 §3 (strict objects) |
| C7(k) | non-object input rejected | `"conference"` | `ValidationError`; **exactly one** issue, path `[]` | — | 06 §3, 13 §3 Q20 |
| C8(a) | valid candidate parses | a hand-written valid `ContentCandidate` | `success === true` | — | 11 §3 (phase-5 N6) |
| C8(b) | `variationId` invalid | valid fixture with `variationId: ""` | `success === false`; exactly one issue, path `["variationId"]` | — | 11 §3 (phase-5 N6) |
| C8(c) | `productId` invalid | `productId: ""` | `success === false`; exactly one issue, path `["productId"]` | — | 11 §3 (phase-5 N6) |
| C8(d) | `title` invalid | `title: "   "` | `success === false`; exactly one issue, path `["title"]` | — | 11 §3 (phase-5 N6) |
| C8(e) | `description` invalid | `description: 42` | `success === false`; exactly one issue, path `["description"]` | — | 11 §3 (phase-5 N6) |
| C8(f) | `truncated` invalid | `truncated: "true"` | `success === false`; exactly one issue, path `["truncated"]` | — | 11 §3 (phase-5 N6) |
| C8(g) | `score` non-integer | `score: 500.5` | `success === false`; exactly one issue, path `["score"]` | — | 11 §3 (phase-5 N6) |
| C8(h) | `score` above the scale | `score: SCORE_MAX + 1` | `success === false`; exactly one issue, path `["score"]` | MUT-07-14 `content-candidate.ts` · `contentCandidateSchema`, definition · widen `score`'s `.max(1000)` by one → C8(h) red | §17A.8 (the schema literal and `SCORE_MAX` are one scale) |
| C8(i) | `score` at the scale ceiling | `score: SCORE_MAX` | `success === true` | — | §17A.8 |
| C8(j) | `matchStrength` invalid | `matchStrength: "excellent"` | `success === false`; exactly one issue, path `["matchStrength"]` | — | 11 §3 (phase-5 N6) |
| C8(k) | `reason` invalid | `reason: "   "` | `success === false`; exactly one issue, path `["reason"]` | — | 11 §3 (phase-5 N6) |
| C8(l) | unknown key rejected | valid fixture plus `extra: 1` | `success === false`; exactly one issue, `code === "unrecognized_keys"`, `path` `[]`, `keys` `["extra"]`. **Corrected 2026-09-06:** the row previously said path `["extra"]`, which is the *flattened* shape `zodIssues` produces, not what raw Zod 4 emits — a strict object reports an unrecognized key once, at the object's own path, with the offending names in a separate `keys` array. `content-candidate.ts` has no flattening wrapper and is not asked for one, so this row asserts raw Zod. C7(j) asserts the flattened `["extra"]` because the service *does* flatten | — | 06 §3 (strict objects) |

Criteria: 8 (C1–C8), 57 rows (a table line is one row; a lettered span counts its letters). Named mutations: 19 (MUT-07-1 … MUT-07-19). Per-criterion mutation counts: C1 5 · C2 3 · C3 1 · C4 1 · C5 3 · C6 3 · C7 2 · C8 1 = 19. Re-derived after the review round-1 fold; counted, not carried.

## Explicitly delegated to the implementer

These are decisions the projection identified and deliberately leaves open. Choose, then **state the choice in the handoff** — an undeclared choice here is the same defect as an undeclared divergence (charter rule 14).

- **D15 — the Zod-issue conversion.** `zodIssues` is private to `schemas/workflow-state.ts:54`. **Duplicate** the three-line helper inside the service (recommended: two call sites is not yet a pattern, contract 03 §3), **or** extract it to `schemas/shared.ts` and re-point `workflow-state.ts` — which widens the perimeter to 11 paths and must be declared before the closing stamp. Either way it must keep the `unrecognized_keys` branch, which C7(j) depends on. No `details.reason` on the thrown `ValidationError` unless you state a reason for one; the registry (master §6.3) offers only `domain_rule`, which is not obviously right for a boundary parse.
- **D22 — the permutations of C1(b).** You pick them; they must be deterministic and written literally in the test (no PRNG). Recommended: two — the full reversal plus one hand-written interleave.
- **D24 — truncation edges.** Slice by UTF-16 code units, no ellipsis, no re-trim after slicing. A cut at exactly the cap can split a surrogate pair and emit a lone surrogate, which `z.string()` accepts — see the accepted limit in Notes.
- **D28 — the `reason` string.** Matched tokens, deduped, in query order, joined by `", "`.

## Notes

- **Score arithmetic.** The score is an **integer**; the intermediate ratio is a float that is exact at these magnitudes (`SCORE_MAX` 1000, `|Q|` small), so `Math.round` is deterministic here. The earlier wording "all integer arithmetic on scores" contradicted its own `Math.round` on a ratio and is withdrawn. The "no arithmetic" rule (invariant 17) is a **money** rule and does not apply to this path — say so in a comment at the top of `rank-candidates.ts` so a reviewer does not flag it.

- **Worked score table**, so the C6 rows are decidable and the reviewer shares the arithmetic. With `Q.size = 3` and the formula of task 2:

  | Where the query's three tokens land | Σ w | score | strength |
  |---|---|---|---|
  | two in the title, one in the description | 7 | `round(1000 × 7/9)` = **778** | strong |
  | two in the title | 6 | **667** | possible |
  | one in the title, one in the description | 4 | **444** | possible |
  | one in the title | 3 | **333** | weak |
  | two in the description | 2 | **222** | weak |
  | one in the description | 1 | **111** | excluded (below `T_FLOOR` 150) |

  C6(a) uses 778 vs 667, C6(b) 444 vs 333, C6(c) 667 vs 444. The full range `[0, SCORE_MAX]` is reachable — a one-token query whose token is in the title scores exactly `SCORE_MAX` — which is what makes the thresholds mean what §17A.8 says they mean.

- **Accepted MVP limit (D24, recorded so it is not re-derived).** Truncation slices UTF-16 code units, so a cut at exactly the cap can split a surrogate pair and emit a lone surrogate; `z.string()` accepts it and nothing fails. The fixture is Latin-script and the real catalog is very small (§20), so this is accepted for the MVP rather than guarded.

- **No criterion asserts the lazy `defaultDeps` getter.** `test/setup/node.ts` applies the environment placeholders unconditionally before any `@/lib/env/server` import, so a module that reads `serverEnv` eagerly at import would still load inside the suite — a row asserting laziness could not fail here and would be decoration with a correct name. The requirement is stated in task 5 and in master §6.6, and phase 15's isolation scans are the right instrument if it is ever worth measuring.

- **The strength term in the comparator is provably redundant — and it stays** (review round 1, B1 second half). `strengthForScore` is monotone in `score`, so `(strength desc, score desc)` is equivalent to `(score desc)` for every input, and no ordering row can ever discriminate the strength term. It is kept because §17A.8 states the sort key in exactly that form and the code should read like the contract it implements; **C6(f) is its guard**, because that row asserts the `matchStrength` label of every returned candidate directly rather than through the order. Recorded so no later session deletes it as dead code, and so it does not ship as an unmarked clause no mutation can redden.

- **`reason` is computed over the full description, while `description` is truncated** (review round 1, N1; decided here). This is intentional and stays: the score is computed over the same full text, and `truncated: true` is §17A.8's disclosure that the shown text is not all of it. It is reachable — a candidate can return `reason: "venue, sauna"` with a 280-character description containing no "sauna" — but the shipped fixture does not exhibit it. **Carried to phase 11**, which renders `reason` to a human and is where the question of showing a reason the reader cannot verify actually lands.

- **Accepted MVP limit (review round 1, N2): `compareVariationIds` treats numerically equal ids as tied.** `"1"`, `"01"`, `"1.0"` and `"1e0"` all compare equal, and the sort then falls back to arrival order — the §17A.8 vendor-list-order leak, inside the function written to prevent it. **Unreachable on the shipped path:** `src/lib/proposales/mappers.ts:65` emits `String(wire.variation_id)` over a `z.number().int()`, which is always canonical decimal. Nothing structural holds it, though — `contentCandidateSchema.variationId` is only `z.string().min(1)`. Recorded with the reachability argument so **phase 12** (cross-turn `variationId` references) need not re-derive it.

- **`strengthForScore` throws a bare `RangeError`, and that is the right instrument** (review round 1, N3; no change). The throw is unreachable from `rankCandidates` — the numerator is at most `3 × |Q|` by construction — so it guards a programmer error, not a domain condition. Contract `04` §6 ("unknown errors are wrapped as `InternalError` at the transport layer only; services let them propagate") sanctions it propagating. C2(j)–(l) assert `.toThrow()` with no class, so the choice is recorded here rather than pinned in a row.

- Projection gate: mandatory (rank 7) — **satisfied**, round 0, 2026-09-06.

## Review log

*(append-only)*

**Projection round 0 (2026-09-06, Claude Opus 5) — `AMENDMENTS_REQUIRED`, folded by the coordinator 2026-09-06.**
Handoff: `handoffs/reviewer/phase-07-projection-round-0.reviewer.md`. Thirty-three ledger rows, all routed; zero code was written or read into the perimeter.

- **Owner card 1 → add the cap.** The content-search query gains a named maximum (`MAX_SEARCH_QUERY_CHARS`, 200). Folded to its home artifact first — intention §17A.16 first bullet plus a new paragraph, recorded as §23 round 15, status stays `RATIFIED` — then to master §6.4/§6.5/§6.6, then to tasks 4–5 and rows C7(h)/C7(i) here. Phase 9's plan carries the forward hazard: the tool must import the same constant, never a second literal.
- **Two master-plan rows (D7, D8, D14), coordinator-owned, made before dispatch.** §6.6 splits `scoreItem` (now `domain/rank-candidates.ts`, with the import cycle as the recorded reason) from `strengthForScore` (stays `domain/strength.ts`); `tokenize` and `catalogLanguages` are registered; `searchContentForHuman` takes `unknown` with a getter-based `defaultDeps`. §6.4 registers `searchContentInputSchema`; §6.5 registers `MAX_SEARCH_QUERY_CHARS`.
- **The score formula was undetermined and is now stated (D1).** Three readings of the old sentence were all defensible and produced different match strengths for the same fixture; under one of them the clamp collapsed every title match to `strong` and C6(c) was unconstructible. Reading (a) is adopted because it is the only one whose full `[0, SCORE_MAX]` range is reachable. Six criterion rows were blocked on this.
- **Five rows would have passed on broken code and are repaired.** C1(c) was self-contradictory (it forbade an import its own signature requires) and unfalsifiable, and now names its permitted exceptions and carries MUT-07-2. C7(b) re-derived its expected value from the function under test and is now split, with an independently-computed `variationId` sequence beside the equality. C7(d)'s invalid fixture `{ query: "" }` failed for two independent reasons and is now `{ query: "", language: "en" }` with a sibling row. C6(d)'s tie ids would have passed under a lexical comparator and are pinned to `"9"`/`"10"`. C4's truncation boundary had no exactly-at-cap row.
- **Phase 5's N6 is discharged here, by C8, not by C7.** The old C7(d) supplied one valid assertion plus an invalid fixture about the *service's* input schema — `contentCandidateSchema`'s eight fields had no invalid fixture at all, so N6 would have silently remained open after this phase closed. C8's twelve rows cover every field, each asserting its own issue path. **No reduction was taken**, so no exclusion is recorded. Master tracker row 5's note points N6 at "phase 7 C7(d)"; it is a record of what that session saw and is not rewritten — the obligation is discharged by C8.
- **Silent-failure repairs with no owner decision needed:** the empty query token set divided by zero (D2); `tokenize`'s unused `language` parameter made determinism depend on ICU data (D5); the token regex, NFC form and length unit were unstated against an `sv` fixture (D6); `fixtures/catalog.ts` would have taken a value import from a `server-only` module that the Vitest stub hides (D18); a non-numeric `variationId` made the comparator return `NaN`, which V8 treats as `0`, reintroducing the vendor list-order leak the tie-break exists to prevent (D20); nothing forbade sorting the shared fixture in place (D21); a present-but-empty `title[language]` would have produced a candidate failing its own schema (D25); `SCORE_MAX` and the schema's literal `.max(1000)` were unbound (D29); `import "server-only"` was stated for the service only (D32); and `FIXTURE_CATALOG` items lacked `createdAt` and `productId`, so the phase would not have typechecked (D33).
- **Mutation set grew 3 → 14**, derived from the criteria above, not carried forward: the three original mutations plus one for each absence/purity/fail-safe row that had none (D10, D30, D31 taken up rather than recorded as a reduction). Criteria 7 → 8, rows 28 → 56.
- **Verified correct by the projection and left alone:** the fake records `listContent` as exactly `{ op: "listContent" }` (`lib/proposales/fake.ts:69`), so C7(a) was decidable as written; all seven original paths were new and correctly counted; `expectTypeOf` is established precedent (`src/lib/errors/app-error.test.ts:60–74`) and is enforced by `npm run typecheck`, not at runtime, which is the working arrangement and must not be "fixed"; every trace cell resolved in both directions, with no unserved claimed entry and no orphan row.
- **Evidence:** the projection's L4 budget was zero and was honored — no test of any scope was run. Tree at that session: HEAD `30138a3`, `git status --porcelain` empty; its only write was its own handoff.

**Implementation round 1 (2026-09-06, Claude) — `IMPLEMENTED`.**
Handoff: `handoffs/implementer/phase-07-round-1.implementer.md`. All 9 declared files touched (8 new, 1 edited); no perimeter widening (D15 taken as duplication, not extraction — 9 paths, not 11). All 56 rows covered by an executable case on first pass except one: C5(b)'s originally-chosen query ("regional", an en-only term) did not distinguish MUT-07-10 from correct behavior — both landed on "not a candidate" via different mechanisms (title-language filter vs. score floor), a false-green the mutation run itself caught. Re-sited to a term drawn from the item's own sv description ("marknader"), which only the mutation reaches; re-run confirmed red under the mutation and green under the reverted original. No other retained row needed re-siting.

- **The four delegated decisions (D15, D22, D24, D28), as chosen:**
  - D15 (Zod-issue conversion): duplicated the three-line `zodIssues` helper inside `search-content-for-human.ts` rather than extracting to `schemas/shared.ts` — two call sites is not yet a pattern (contract 03 §3); perimeter stays 9 paths. The `unrecognized_keys` branch is kept, and C7(j) exercises it. No `details.reason` is set on the thrown `ValidationError`.
  - D22 (C1(b) permutations): a full reversal of a copied array, plus one hand-written 14-element interleave (fixed indices, no PRNG).
  - D24 (truncation edges): sliced by UTF-16 code units (`.slice(0, MAX_CANDIDATE_DESCRIPTION_CHARS)`), no ellipsis, no re-trim. The fixture's over-cap and exact-cap descriptions were built once from a literal base sentence plus a literal filler, sliced to exact target lengths, with the character at the truncation boundary confirmed non-whitespace by inspection at authoring time (both land on `"c"`).
  - D28 (`reason` string): matched query tokens (title or description membership), deduped preserving first-occurrence (query) order, joined by `", "`.
- **A finding on C8(l)'s stated expected outcome.** The row's plan text reads "exactly one issue, path `[\"extra\"]`", but Zod 4's `z.strictObject` reports an unrecognized key as one `unrecognized_keys` issue at the **object's own (empty) path**, carrying the offending key names in a separate `keys` array — verified directly (`schema.safeParse({...valid, extra: 1})` on this exact schema yields `{ code: "unrecognized_keys", path: [], keys: ["extra"] }`), not something schema-specific. `content-candidate.ts` has no wrapper analogous to `workflow-state.ts`'s `zodIssues`/`parseProposalWorkflowState` that flattens this shape for a caller, and the plan does not ask for one here. The test asserts the actual raw-Zod shape (`path: []`, `code: "unrecognized_keys"`, `keys: ["extra"]`) rather than the literal `path: ["extra"]` the row states. Every other C8 row's literal path matched raw Zod exactly on first run.
- **Candidate criterion:** none. Every test added traces to a declared row; no orphan.
- **Fixture design note for future phases:** `fixtures/catalog.ts`'s 14 items are built so a single shared query (`"service"`) ties every item at score 1000 (every en title carries that token), which is what makes the `variationId` tie-break exercisable catalog-wide rather than only between the one designated identical-text pair (ids `"9"`/`"10"`). A second token (`"premium"`) appears in exactly two titles and nowhere else, serving C3(c). Both are reused in the service test's C7(b) literal expected order.
- **Evidence:** closing L4 stamp — `npm test`: 24 files / 334 tests green (was 20/278 at phase 6's close; +4 test files, +56 tests, exactly the phase's row count). `npm run typecheck` clean. `npm run lint` clean. Tree: HEAD `a9bfabe`, dirty with exactly the 9 declared paths (`git status --porcelain` and `git diff --stat` both confirm no file outside the declared perimeter changed). All 14 named mutations applied at their named site, observed red, and reverted; tree confirmed byte-identical to its pre-mutation state after each revert by re-running the full domain-scoped suite (171/171 green) between mutations and again at the end.

**Coordinator fold of implementation round 1 (2026-09-06).** Handoff consumed and reconciled;
tracker row 7 → `REVIEWING`. The checkpoint is `f2399ac`.

- **Perimeter verified against the tree, not accepted as claimed.** `git show --stat f2399ac`
  is exactly the 11 declared files (9 code + 2 documents); `git status --porcelain` afterwards
  shows only `tsconfig.tsbuildinfo` (master §11 follow-up 8, a known incremental-build artifact,
  correctly left unstaged) and this handoff. No undeclared write.
- **Arithmetic reconciled.** The four new test files carry 12 + 12 + 21 + 11 = **56** `it` cases
  and reference exactly the 56 declared row ids, matching the suite's +56 growth (278 → 334) and
  the plan's derived row count. Mutations executed = declared = 14. L4 runs = 1 = budget.
- **C8(l) corrected in the criteria table, in the implementer's favour.** Verified independently
  against `zod@4.5.4`: `z.strictObject` emits one `unrecognized_keys` issue at the object's own
  path with a `keys` array, so the row's stated path `["extra"]` was the *flattened* shape, which
  only the service produces. The plan text was wrong and the implementation is right. Routed
  onward to master §11 follow-up 7, which already tracks the neighbouring Zod-4 path defect in
  contract `06` §8.
- **C5(b) corrected in the criteria table, and the lesson routed upward.** The row as planned had
  two independent sufficient causes — the title filter *and* the score floor both produce "not a
  candidate" — so MUT-07-10 left it green. The implementer's own mutation run caught it and
  re-sited the query; that is the mutation ledger doing exactly the work it exists for. The
  generalized rule is now master §9.1 rule 15, because the same shape is live in every later
  phase that asserts a filter by absence.
- **The plan authored that defect, not the implementer.** Recorded here rather than in the
  handoff, because the coordinator owns the criteria table. **C5(a) has the identical shape and
  no named mutation forced the same check** — it is a named probe in the review prompt rather
  than a repair made here, so the judgment is the reviewer's.

**Independent review round 1 (2026-09-06, Claude Opus 5) — `CHANGES_REQUESTED`.**
Handoff: `handoffs/reviewer/phase-07-review-round-1.reviewer.md`. First review, full checklist.
All six gate items pass. Counts re-derived by command: 8 criteria, 56 rows, 14 mutations. The
trace chain is bijective in both directions — 56 `it` cases against the 56 declared row ids, no
duplicate, no uncovered row, no orphan test. `src/` at `e621226` is byte-identical to the
implementer's stamp tree (`git diff f2399ac HEAD -- src/` empty), so that stamp is cited and no
L4 was taken; every probe below ran at L1/L2.

- **B1 (blocking) — the sort order has no falsifiable test.** Deleting *both* the strength and
  the score terms from the comparator, reducing it to `variationId ascending`, leaves the whole
  feature suite green (L2, 171/171). C6(a), C6(b) and C6(c) all pass because the fixture's
  `QUERY_3` ranking (`1/778 2/667 3/444 4/333 5/222`) puts descending relevance in exactly
  ascending `variationId` order — two independent sufficient causes for every asserted
  precedence (§9.1 rule 2 companion; rule 15). The three rows for §17A.8's "Ordering is total,
  ties decidable" observe nothing. **Correction, verified on the shipped fixture and needing no
  fixture change:** re-site C6(a)–(c) onto `rankCandidates("standard facilitation consulting",
  FIXTURE_CATALOG, "en")`, which returns `9/444/possible · 10/444/possible · 1/333/weak ·
  2/333/weak` under correct code and `1 · 2 · 9 · 10` under the reduced comparator. Name
  MUT-07-15 (`rank-candidates.ts` · comparator, definition · delete the score term → C6(c) red).
  The **strength term is provably redundant** and no row can discriminate it: `strengthForScore`
  is monotone in `score`, so `(strength desc, score desc)` ≡ `(score desc)` for every input.
  Either delete it with the reason recorded, or keep it and record that its guard is B2's
  assertion of the labels, not an ordering row — it must not ship as an unmarked clause that no
  mutation can redden.
- **B2 (blocking) — no row observes `score` or `matchStrength` on any returned candidate.**
  Changing the title weight from 3 to 2, or the normalisation denominator from `3 * |Q|` to
  `4 * |Q|`, leaves 171/171 green. The plan's worked table *is* reproduced by the code (verified:
  778 / 667 / 444 / 333 / 222 / 111) but is asserted nowhere; C6(a)–(c) name their items by score
  and then identify them by `variationId` without ever checking the score. §17A.8 makes
  `matchStrength` the gate for auto-selection and for the `no_acceptable_match` / `weak_match` /
  `non_strong_selection` warnings (master §6.3), all consumed by phase 11. **Correction:** assert
  the full `(variationId, score, matchStrength)` tuple sequence on B1's query; name MUT-07-16
  (`rank-candidates.ts` · `scoreItem`, definition · title weight 3 → 2 → red).
- **B3 (blocking) — the missing-key half of the language filter is unguarded; C5(a) cannot
  fail.** Deleting `title === undefined ||` while keeping the whitespace check leaves 171/171
  green. Deleting the *entire* filter reddens only C5(b). C5(a) exists to prove §17A.8's "A
  content item without `title[language]` is excluded from candidates" (criterion 13) and observes
  nothing, because its `sv` query `"suite"` is an en-only term that the score floor excludes under
  every mutant — the identical shape the coordinator repaired in C5(b) and explicitly left to this
  review. **Correction, verified both directions:** change C5(a)'s `sv` query to `"ledningsnivå"`,
  a term from item 7's own `sv` description; the row stays green on correct code and reddens under
  the mutant. Name MUT-07-17 (`rank-candidates.ts` · `rankCandidates`, definition · drop
  `title === undefined ||` → C5(a) red).
- **S1 (should-fix) — C7(d)'s instrument never fires.** Adding `ai?: unknown` to the `deps`
  parameter type passes both `npm run typecheck` and the suite. Adding a required `ai: unknown`
  fails at ten *call-site* lines (24, 31, 40, 52, 61, 70, 80, 92, 101, 111) and never at line 46,
  the `expectTypeOf` itself. The optional shape is the realistic one for an added model
  dependency, and it is invisible. Authority: §5.1 (content search on human request — "May call
  the model: **no**"), §10.2; §9.1 rule 11. This refines rather than contradicts the projection's
  note that `expectTypeOf` is typecheck-enforced — that holds for the `app-error.test.ts` shapes,
  not for `.not.toHaveProperty` on an optional key. **Correction:** replace with a source-text
  guard mirroring C1(c) — `search-content-for-human.ts` carries no import from `@/lib/ai` or
  `@/lib/agent` — and name the mutation that adds one.
- **S2 (should-fix) — C1(c) is blind to dynamic `import()`.** Variations run: mixed inline-type
  import (`import { type ContentItem, getProposalesClient } from "@/lib/proposales"`) → caught;
  `new globalThis.Date()` → caught; `await import("node:fs")` → **not caught**;
  `await import("@/lib/proposales")` → **not caught**; computed `globalThis["Da"+"te"]` → not
  caught (contrived, accepted). Dynamic import is how I/O actually enters a module, and it is this
  repo's own test idiom. **Correction:** add `expect(stripped).not.toMatch(/\bimport\s*\(/)` to
  C1(c) and name it as a mutation.
- **N1 (note) — `reason` is computed over the full description, `description` is truncated.**
  Verified reachable: a candidate returns `reason: "venue, sauna"`, `score: 667`,
  `matchStrength: "possible"` with a 280-character description containing no "sauna". The shipped
  fixture does not exhibit it (no token lives only past the cap), so nothing observes it. The
  behavior is defensible — the score is computed over the same full text and `truncated: true` is
  §17A.8's disclosure — but the plan did not decide it and phase 11 shows `reason` to a human.
  Record the decision here; carry to phase 11.
- **N2 (note) — `compareVariationIds`'s numeric path is wider than C6(e) tests.** `"1"`, `"01"`,
  `"1.0"` and `"1e0"` all compare equal and the sort falls back to arrival order (verified:
  `["01","1"]` forward, `["1","01"]` backward) — the §17A.8 vendor-list-order leak inside the
  function written to prevent it. **Unreachable on the shipped path:** `mappers.ts:65` emits
  `String(wire.variation_id)` over a `z.number().int()`, which is canonical decimal. But
  `contentCandidateSchema.variationId` is only `z.string().min(1)`, so nothing structural holds
  the invariant. Accepted MVP limit; record the reachability argument so phase 12 need not
  rediscover it.
- **N3 (note) — `strengthForScore` throws a bare `RangeError`, not an `AppError`.** Unreachable
  from `rankCandidates`: the numerator is at most `3 × |Q|` by construction, so the score is
  always an integer in `[0, SCORE_MAX]` (MUT-07-4 is the only path that reaches the throw).
  Contract `04` §6 — "Unknown errors are wrapped as `InternalError` at the transport layer only.
  Services let them propagate" — sanctions a programmer-error guard propagating. C2(j)–(l) assert
  `.toThrow()` with no class, so either choice passes. No change required; record the choice.
- **N4 (note) — `tokenize` and `scoreItem` are exported per master §6.6 but exercised only through
  `rankCandidates`.** Not dead scaffolding (production caller, registered public names), but the
  absence of any direct test is the surface B2 travels on; a direct `scoreItem` table would
  discharge B2 as well.
- **Verified correct and settled, so the fix round need not revisit:** all six gate items; the
  fixture roster against every property task 3 requires, checked numerically in the file
  (over-cap 301 chars with a non-whitespace `"c"` at index 279; exact-cap exactly 280; item 4
  carries no `en` description; item 8 carries whitespace-only `sv` **and** `no`; the `"9"`/`"10"`
  identical-text pair; `"service"` in all fourteen `en` titles; `"premium"` in exactly two and in
  no `en` description); the worked score table reproduced exactly; `TOKEN_PATTERN`'s `/g`
  statelessness (`.match()` is its only use, no `.test()`/`.exec()` anywhere); C5(b)'s correction
  sound and necessary (MUT-07-10 reddens it, and the "regional" query did not); MUT-07-1 genuinely
  reddens C1(b); C6(d) genuinely discriminates numeric from lexical; C6(e) genuinely discriminates
  via MUT-07-12; `toMatchObject` on arrays does enforce length, so C7(f)–(k)'s "exactly one issue"
  is really asserted; every C8 row is preceded by `expect(result.success).toBe(false)` so none is
  vacuous; C1(b) copies before reversing as the plan required; the service shape matches master
  §6.6 exactly (`unknown` input, getter `defaultDeps`, one `listContent()`); D15/D22/D24/D28 all
  declared and all implemented as declared; C8(l)'s correction is right against raw Zod 4; the
  perimeter is exactly the 11 declared files.
- **Evidence.** L4 budget: **zero spent, correctly** — `src/` byte-identical to the implementer's
  stamp (24 files / 334 tests green, typecheck and lint clean), cited under the charter's reuse
  rule. Twelve probes at L1/L2, each applied and reverted; the five production files' SHA-256
  digests verified byte-identical afterwards and `git status --porcelain` empty. Tree at review:
  HEAD `e621226`, clean.

**Coordinator fold of review round 1 (2026-09-06).** All five blocking and should-fix findings
accepted; four notes decided in the Notes section above. The criteria table is amended and the
fix round works against it. **Two of the reviewer's stated corrections were wrong or incomplete
and were verified before being quoted into the fix prompt** — the review's findings stand in
both cases; only the prescriptions needed repair.

- **B1's proposed query cannot carry two of the three rows it was proposed for.** Verified by
  running it: `rankCandidates("standard facilitation consulting", FIXTURE_CATALOG, "en")` returns
  `9/444/possible · 10/444/possible · 1/333/weak · 2/333/weak`, exactly as the review states — but
  its top band is `possible`, so **C6(a) has no `strong` item to precede anything**, and both
  bands hold equal scores, so **C6(c) has no two distinct scores inside one band**. Re-siting all
  three rows onto it would have made two of them unwritable and cost a round. Replacements found
  by enumerating 85,320 two- and three-token queries over the fixture's own `en` tokens and
  selecting those whose returned id order is **not** ascending: `"consulting service track"`
  (`2/1000/strong · 1/667/possible · 5/444/possible · …`) carries C6(a) and C6(f);
  `"consulting service bundle"` (`1/1000/strong · 2/667/possible · 8/667/possible · 5/444/possible
  · 3/333/weak · …`) carries C6(b) and C6(c). Each asserted pair has the **higher** id first, so
  the tie-break cannot produce the asserted order. Both verified against the shipped code; no
  fixture change is needed, as the review said.
- **MUT-07-17, read literally, tests a crash instead of the defect.** "Drop `title === undefined ||`"
  leaves `title.trim()` on `undefined`: verified, it throws `TypeError` and reddens C5(a), C5(b)
  **and** C5(c). A ledger row recorded from that red would certify a guard that does not exist. The
  mutant the review actually ran is the non-throwing one — verified: with
  `if (title !== undefined && title.trim().length === 0) continue;` the file's 21 tests stay green,
  which is the finding. The row now writes the mutant out in full (charter rule 11: a named mutation
  names where it is applied, because "delete the guard" is ambiguous).
- **B1's second half decided rather than delegated.** The strength term is provably redundant
  (`strengthForScore` is monotone in `score`); it stays, because §17A.8 states the sort key that
  way, and C6(f) is its guard. Recorded in Notes so the fix round does not relitigate it and no
  later session deletes it as dead code.
- **Counts re-derived, not carried:** 8 criteria, **57** rows (C6 gains `(f)`), **19** named
  mutations (MUT-07-15 … MUT-07-19 added). The per-criterion mutation summands were typed wrong on
  the first attempt (`C6 2 · C7 3`) and corrected from the derivation to `C6 3 · C7 2`.
- **Lessons routed upward:** master §9.1 rule 15 extended to ordering rows and value-naming rows
  with the planner corollary about monotone sort keys; new §9.1 rule 16 on proving a guard's
  instrument and enumerating a source guard's forms. Phase 9 inherits the complete form list;
  phase 11 inherits N1; phase 12 inherits N2.
- **No independent re-review will follow this fix round** (owner direction, 2026-09-06). The fix
  round's own evidence is therefore the last evidence produced before the approval gate, and the
  coordinator validates against it.
