---
plan: 7
role: projection
round: 0
verdict: AMENDMENTS_REQUIRED
state: OWNER_DECISIONS_PENDING
date: 2026-09-06
actor: Claude (Opus 5)
project: initial_core_feature_proposales
phase: Content ranking domain and human search
---

# Phase 7 projection (round 0) — `AMENDMENTS_REQUIRED`

## Opening

I did Phase 7's first hour on paper, from the plan and the artifacts it cites, without
writing any code. The phase is buildable and its shape is right, but the plan does not
determine the one thing everything else in it depends on: the exact arithmetic that turns
a search query into a score. Three readings of the plan's own sentence are all defensible,
and they produce different match strengths for the same fixture — which means several of
the phase's own test rows cannot be written yet, and the "strong match" signal the copilot
will show a human could land almost anywhere. I also found five rows that, as written,
would pass even if the code they guard were broken.

Nothing here is a defect in shipped code; it is all still a paragraph amendment. Thirty-three
decisions are recorded below and routed. One needs you personally: a small missing size
limit on the search box text, which sits inside a section you already ratified. Everything
else goes back to the coordinator to fold into the phase plan and the master plan's name
registry before the implementer prompt is compiled.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Should the human search box have a maximum length?

**Question.** Add a named maximum length for the text a human types into content search
(recommended 200 characters), or leave it unlimited?

**Story.** Someone reviewing a proposal pastes an entire client email — two thousand words —
into the content search box instead of typing "conference room". The application accepts it,
tokenises every word, and scores the whole catalogue against it. Nothing crashes and nothing
is logged as wrong; the human just gets a list that looks arbitrary, because a query of two
thousand words dilutes every real match below the threshold. Later, when the model gets its
own search tool, that tool *does* have a 200-character limit — so the same paste behaves one
way for the assistant and another way for the person.

**Branches.**
- **Add a 200-character cap:** an overlong query is refused immediately with a clear message;
  the human and the assistant obey the same limit.
- **Leave it unlimited:** an overlong query silently returns poor results, and the two search
  paths disagree about what a query is.

**Recommendation.** Add the cap, because every other free-text field in this product already
has one and this is the only one the enumeration missed.

**On silence.** The gate holds; Phase 7 is not dispatched. No cap is invented.

**Trace.** Intention §17A.16 first bullet (the enumeration of capped free-text fields);
master plan §6.5 (named constants); phase 7 task 4; contract `10-security-and-trust-boundaries.md` §4.

## Gate check

| # | Requirement | Source | Result |
|---|---|---|---|
| 1 | Intention header `RATIFIED` | `planing/proposal-preparation-backend-intention.md:5` | **PASS** — `RATIFIED` (2026-09-05, owner David, §21.4 surface, §23 round 12) |
| 2 | Tracker rows 1–6 `APPROVED` | `master-plan.md:60–65` | **PASS** — all six `APPROVED` |
| 3 | Tracker row 7 `NOT_STARTED` | `master-plan.md:66` | **PASS** |
| 4 | Phase 7 declares 7 criteria, 28 rows, 3 named mutations | `plans/phase-07-ranking-and-human-search.md:44–73` | **PASS** — counts re-derived, not read: C1–C7 = 7; table lines 3+9+3+2+3+4+4 = 28; MUT-07-1/2/3 = 3 |

No upstream gate handoff for phase 7 sits in `OWNER_DECISIONS_PENDING`. Projection is
mandatory for this phase (plan Notes line 78, rank 7).

`git status --porcelain` at session start: **empty**. HEAD `30138a3` ("Dispatch Phase 7
projection"), branch `main`. Not gated on; recorded per the prompt.

## Applicable contracts

Classified via `architectural_contracts/01-implementation-contract-guide.md` §4 and §10
scenario A (minus client and persistence concerns): pure domain rules, one server-only
service with DI-by-parameter, schema validation at a trust boundary, fixtures and test
layering, documentation closeout. Read: `02-runtime-boundaries.md` §§3–6, 9;
`03-feature-architecture.md` §§1–4; `04-server-architecture.md` §§4–6;
`06-data-contracts-and-validation.md` §§3–4, 6–8; `08-agent-architecture.md` §3;
`10-security-and-trust-boundaries.md` §4; `11-testing-principles.md` §§2–3, 5;
`13-decision-checklist.md` §§1, 3; `14-documentation-principles.md` §8; and the
`12-anti-patterns.md` runtime-boundary, server, data-and-validation and structure sections.
This equals the plan's own list plus `03` §§1–4 and `13` §§1, 3, both of which the phase
touches by creating the repository's first `server/services/` file.

## Decision ledger (33)

Classification: **P** = plan gap (coordinator amends the phase plan) · **M** = master-plan
gap (naming registry) · **I** = intention gap (routes to the owner) · **F** = free choice
(delegate explicitly, in writing).

Thirty-three rows, numbered D1–D33. **D17 is the owner card above** and is deliberately not
repeated here (charter: findings cite their card, they do not contain it); the three tables
below therefore hold 32 rows — 7 + 16 + 9.

### Blocking — the implementer cannot start without these (7)

| # | Decision point | Class | Proposed routing |
|---|---|---|---|
| D1 | **The score formula is undetermined.** Task 2 (line 35) says "weighted overlap of query tokens with `title[language]` (weight 3) and `description[language]` (weight 1), normalized to `[0, SCORE_MAX]` by the query token count". Three readings are all consistent with that sentence: (a) per query token, contribute 3 if in title else 1 if in description, denominator `3 × |Q|`; (b) title and description contribute independently (max 4/token), denominator `4 × |Q|`; (c) denominator literally `|Q|`, so a title-only match yields ratio 3 → 3000 → clamped to 1000. They are not close: under (c) every title match is `strong` and the clamp destroys score discrimination entirely, which makes C6(c) ("equal strength, higher score first") unconstructible. See the worked consequence under C5(b) in Criteria decidability. | P | Amend task 2 to state the exact expression, including the denominator, in one line of arithmetic. **Recommended: reading (a)** — `score = Math.round((SCORE_MAX × Σ w(t)) / (3 × |Q|))` with `w(t) ∈ {3,1,0}` — because it is the only reading whose full range `[0, SCORE_MAX]` is reachable and whose thresholds therefore mean what §17A.8 says they mean. |
| D2 | **Empty token set divides by zero.** `tokenize` drops tokens under length 2, so `rankCandidates("a", …)` or `rankCandidates("!!", …)` yields `|Q| = 0`. Every reading of D1 then divides by zero → `NaN` → `strengthForScore` throws on non-integer (task 1, line 34). §17A.8:700 requires `rank` to be a **pure total function**. The service's input schema `min(1)` does not prevent this: `"a"` is length 1 and non-empty. | P | Amend task 2: an empty query token set returns `[]` (recommended — no query terms, no matches), and add a criterion row asserting it. Alternatively define score 0 for that case, which reaches the same result through the floor; state which. |
| D7 | **`scoreItem`'s module contradicts the naming registry.** Master §6.6 (`master-plan.md:326`) places `scoreItem` **and** `strengthForScore` in `domain/strength.ts`. Phase 7 task 2 (line 35) places `scoreItem` in `rank-candidates.ts`. The plan is right on the engineering — `scoreItem` needs `tokenize`, and putting it in `strength.ts` creates a `strength.ts ↔ rank-candidates.ts` import cycle — but the registry is the authority and has not moved. | M | Coordinator amends `master-plan.md:326` to split the row: `strengthForScore` → `domain/strength.ts`; `scoreItem` → `domain/rank-candidates.ts`, with the cycle as the recorded reason. |
| D8 | **Three names the phase creates are absent from the registry.** `tokenize` and `catalogLanguages` (task 2, line 35; asserted by C5(c)) and the service's input schema appear nowhere in master §6.4–§6.6. §6.6's own rule (`master-plan.md:129`) requires a session needing an unlisted name to add it to that section **via the coordinator** before using it. As written the implementer must either invent three names or edit the master plan, and the master plan is outside the declared 7-file perimeter (line 30). | M | Register all three before dispatch. Recommended: `tokenize` and `catalogLanguages` in §6.6 under `domain/rank-candidates.ts`; the input schema as `searchContentInputSchema` / `SearchContentInput` in `schemas/content-candidate.ts` (see D14), added to §6.1's schema list and §6.4's table. |
| D9 | **C1(c) is self-contradictory.** Line 46 requires that `rank-candidates.ts` "imports nothing from `lib/proposales`". But its signature takes `catalog: ContentItem[]` (master §6.6, `master-plan.md:325`), and `ContentItem` is exported only from `src/lib/proposales/index.ts:8` — whose first line is `import "server-only"`. The module also *must* begin `import "server-only"` itself (master §6.1, `master-plan.md:165`; contract 02 §3), which a naive source read for imports will also see. Contract 03 §4 explicitly permits `server/ → lib/`, and §17A.8's purity rule (`:700`) forbids I/O, model, clock and randomness — not type imports. | P | Rewrite C1(c) to assert what purity actually means here: (i) no **value** import from `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, or `node:*` — a `import type` line is permitted and expected; (ii) no `fetch`, `Date`, `Math.random`, or `process` reference; (iii) `rankCandidates.length === 3` (no `deps` parameter). State that `import "server-only"` and `import type { ContentItem }` are the two allowed exceptions. |
| D12 | **C7(d) does not discharge the obligation Phase 5 deferred to it.** Phase 5's Review log (`plans/phase-05-proposition-and-provenance.md:222–224`) carries N6 forward as `11-testing-principles.md` §3's requirement — "a valid fixture and **at least one invalid fixture per consequential field**" for `contentCandidateSchema`. C7(d) (line 71) supplies one valid assertion ("every candidate parses") plus one invalid assertion that is about the **service's input schema**, not about `contentCandidateSchema` at all. The schema has eight fields (`schemas/content-candidate.ts:5–14`); none has an invalid fixture. N6 would silently remain open after Phase 7 closes. | P | Split C7(d) into two rows: one for the service input contract, and one discharging N6 — an invalid fixture per field of `contentCandidateSchema`, each asserting its own issue path. The owner's scope brief permits *reducing* the ask (a representative subset with a recorded reason) but not dropping the guard; if reduced, name the fields covered and the reason, in the plan. |
| D13 | **C7(d)'s invalid fixture has two independent sufficient causes.** `{ query: "" }` fails a strict `{ query, language }` schema twice over: `query` is empty **and** `language` is missing. Deleting the `.min(1)` on `query` leaves the row green. This is precisely the companion clause of charter rule 2 ("each row's fixture makes its own predicate the ONLY reason the expected outcome holds") and the defect shape phase 3's round-2 B1 already cost this project. | P | Replace with `{ query: "", language: "en" }`, and add a sibling row for the missing/invalid `language` case. Each row asserts its own issue path. |

### Should-fix — decidable but currently underdetermined (16)

| # | Decision point | Class | Proposed routing |
|---|---|---|---|
| D3 | Task 2 says "all integer arithmetic on scores" and, in the same sentence, `Math.round` **on a ratio** — a float operation. The values are small enough that IEEE-754 is exact here, so the outcome is deterministic, but the plan contradicts itself and a reviewer will flag it. | P | State the exact expression once (see D1) and drop "all integer arithmetic" in favour of "the score is an integer; the intermediate ratio is exact at these magnitudes". Keep the line-77 note about invariant 17 being a money rule. |
| D4 | Are query tokens a **set** or a **multiset**? "normalized … by the query token count" does not say whether `"room room"` has `|Q| = 1` or `2`. Independently: does a token occurring five times in a description count once or five times ("overlap" suggests membership)? | P | Recommended: dedupe the query into a set; membership (not frequency) on the item side. Both stated in task 2. |
| D5 | `tokenize(text, language)` takes a `language` parameter the stated rule never uses (task 2, line 35). If the intent is `toLocaleLowerCase(language)`, determinism becomes a function of the runtime's ICU data — a real drift risk against §17A.8's "same inputs always produce the same ordered list". | P | Either drop the parameter, or state `toLowerCase()` (locale-independent) and keep the parameter only if a later phase needs it — noting charter rule 4 forbids dead scaffolding. Recommended: drop it; `rankCandidates` already selects the localized text before tokenising. |
| D6 | The token regex, the Unicode normalization form, and the unit of "minimum token length 2" are all unstated. This is live, not theoretical: the fixture is localized in `sv`, and `å ä ö` in NFD decompose into base letter + combining mark, so `\p{L}`-only matching splits them and NFC vs NFD changes both the token set and the length count. | P | State: `/[\p{L}\p{N}]+/gu`, input normalized `NFC` before tokenising, length measured in code units. |
| D10 | C1(c) is an **absence row** — it measures that something is not there — and ships with no named mutation and no planted-defect probe. Charter rule 15 names this exact family ("an absence claim that measured true only because the codebase never writes that form at all") and requires a ledger row naming the planted defect and the observed red. | P | Add a named mutation to C1(c): add a value import of `getProposalesClient` (or a `Date.now()` call) to `rank-candidates.ts` and observe C1(c) red. This raises the phase's declared mutation set from 3 to 4; update line 73's count, which is derived. |
| D11 | C7(b) (line 69) asserts `candidates` deep-equals `rankCandidates(query, FIXTURE_CATALOG, language)` — it re-derives its expected value from the function under test. It is the `assert f(x) == f(x)` shape charter rule 15 names, and it carries no mutation. It can only fail if the service post-processes the list, which nothing suggests it will. | P | Keep the equality (it is cheap and it does pin "no post-processing") but add one independently-computed assertion beside it: the returned `variationId` sequence, written literally in the test from the fixture. |
| D14 | The service's input signature is undetermined. Master §6.6 (`master-plan.md:320`) types it `({ query: string, language: string }, deps)` — already-validated, per contract 04 §4. Task 4 (line 37) says it "parses `{ query, language }` with a strict input schema", and C7(d) requires it to *reject* bad input — which contract 13 §3 Q20 and 06 §3 say means the parameter is `unknown`. A typed parameter forces the test to cast, which is the shape that hides a real regression. | P | Recommended: `(input: unknown, deps)` with `safeParse` at the top, per 06 §3's boundary rule; amend master §6.6 row to match, alongside D8. |
| D16 | This is the repository's **first** `server/services/` file, so the `deps` default has no precedent. Master §6.6 states "`deps = defaultDeps`". Undetermined: the shape of `defaultDeps`, where it lives, and whether `getProposalesClient()` is called eagerly at module load or lazily per call. Eager evaluation reads `serverEnv` at import time (`src/lib/proposales/client.ts:110`), which would make the module unimportable without a full env — the placeholders make it work in tests and hide the coupling. | P | State it: `deps: { proposales: ProposalesClient } = { get proposales() { return getProposalesClient(); } }` or an explicit `deps.proposales ?? getProposalesClient()` inside the body. Recommended: lazy, and say so, because every later service inherits this shape. |
| D18 | Task 3 (line 36) asks `fixtures/catalog.ts` to `import { MAX_CANDIDATES }` from `server/domain/rank-candidates.ts` for a module-level throw. That is a **value** import from a `server-only` module into `fixtures/`, which is currently runtime-neutral — `fixtures/propositions.ts:3` and `fixtures/states.ts:3–8` import only from `../schemas/`, and phase 6's review verified that property explicitly (`plans/phase-06-items-clarification-state.md:135`). The Vitest node project aliases `server-only` to a stub (`vitest.config.mts`), so the suite would stay green and the break would be invisible. | P | Drop the module-level throw. C3(a) (line 56) already asserts `FIXTURE_CATALOG.length > MAX_CANDIDATES` **in the test**, which is exactly what master §9.1 rule 6 (`master-plan.md:530`) requires and what makes the relation falsifiable. |
| D19 | C6(d) (line 67) asserts the `variationId` tie-break is **numeric** ascending. If the fixture's identical-text pair uses ids like `"7"` and `"8"`, a lexical comparator produces the same order and the row passes on a broken implementation. | P | Require the fixture's tie pair to be numeric/lexical-divergent — e.g. `"9"` and `"10"` — and say so in task 3. Without this the row has a second sufficient cause. |
| D20 | `Number(variationId)` returns `NaN` for a non-numeric id. A comparator returning `NaN` is treated by V8 as `0`, so the sort silently falls back to arrival order — **the vendor list-order leak §17A.8:721 exists to prevent**, reintroduced by the very tie-break written to prevent it. Real ids are numeric today (`src/lib/proposales/mappers.ts:65` does `String(wire.variation_id)` over `z.number().int()`), but `contentCandidateSchema.variationId` is only `z.string().min(1)` and nothing pins the fixture. | P | State that `FIXTURE_CATALOG` ids are canonical decimal strings, and add a comparator that falls back to string comparison when either id is non-numeric (fail-safe, not fail-silent). One row asserting the fallback is cheap; alternatively record the assumption in the plan Notes as an accepted MVP limit. |
| D21 | Nothing forbids `rankCandidates` from sorting the input array **in place**. The fake returns the catalog by reference (`src/lib/proposales/fake.ts:68` returns `catalog`, not a copy), and `FIXTURE_CATALOG` is a module-level constant shared across every test in the run — so an in-place sort would corrupt later tests non-deterministically by file order. Symmetrically, C1(b)'s "catalog reversed" must be a **copy**: `FIXTURE_CATALOG.reverse()` mutates the shared fixture. | P | State in task 2 that `rankCandidates` never mutates its input, and in C1(b) that the permuted catalog is a copy. Add the input-immutability assertion to C1(c) or C1(b). |
| D23 | Truncation's boundary is not enumerated. C4(a) (line 59) uses "the long-description item" and C4(b) a "short item"; the case of a description of **exactly** `MAX_CANDIDATE_DESCRIPTION_CHARS` — `truncated: true` or `false`? — is the adjacent pair charter rule 2 requires and it is missing. | P | Define `length > MAX` → truncate (half-open, consistent with §17A.8's threshold convention), add the exactly-at-cap row, and add a third fixture item at exactly the cap. |
| D25 | The language filter (task 2, line 35: "exclude items without `title[language]`") does not cover a title that is **present but empty or whitespace**. `localizedTextSchema` is `z.record(z.string(), z.string())` (`src/lib/proposales/schemas.ts:9`) and permits `""`. Such an item would become a candidate whose `title` fails `contentCandidateSchema`'s own `z.string().trim().min(1)` — so C7(d) would redden on a fixture nobody planned. | P | State the predicate as "`title[language]` present and non-empty after trim", and add one fixture item with an empty `sv` title so the predicate is exercised rather than assumed. |
| D26 | `description[language]` may be **absent** even when the title is present: `toContentItem` maps a missing wire `description` to `{}` (`src/lib/proposales/mappers.ts:68`). The plan never says what the candidate's `description` and `truncated` are then. | P | State: absent description → `description: ""`, `truncated: false`; the item is still a candidate if its title matches. Add it to the C4 rows. |
| D27 | `catalogLanguages(catalog)` (task 2, C5(c) line 63) does not say whether its source set is the keys of `title` only, or `title ∪ description`, nor which comparator sorts the result. It matters: a language present only in `description` can never yield a candidate (D25/§17A.8:727), so including it would feed phase 11's language derivation a language the catalog cannot actually serve. | P | Recommended: `title` keys only, deduped, sorted with the default string comparator. State it in task 2 and in C5(c). |

### Notes and explicitly delegated free choices (9)

| # | Decision point | Class | Proposed routing |
|---|---|---|---|
| D15 | Zod issues → `ValidationError`. The established conversion, `zodIssues`, is a **private** function in `schemas/workflow-state.ts:54`. Phase 7 needs the same conversion and would either duplicate it or extract it. Also undetermined: which `ValidationReason` (if any) the search-input failure carries — the registry (`master-plan.md:193`) offers `domain_rule` and nothing search-specific. | F | Delegate in writing: the implementer may duplicate the three-line helper **or** extract it to `schemas/shared.ts` and re-point `workflow-state.ts`; extraction widens the perimeter to 8 files and must be declared. Recommended: duplicate for now (two call sites is not yet a pattern, contract 03 §3). No `reason` unless the implementer states one. |
| D22 | C1(b)'s "shuffled with a seeded permutation" (line 45) names neither the seed nor how many permutations. | F | Delegate: the implementer picks the permutation(s), which must be deterministic and written literally in the test (no PRNG). Recommended: two — full reversal plus one hand-written interleave. |
| D24 | Truncation slices UTF-16 **code units**, so a cut at exactly `MAX` can split a surrogate pair and emit a lone surrogate; `z.string()` accepts it, so nothing fails. Separately, `contentCandidateSchema.description` is `z.string().trim()`, so a slice ending in whitespace parses to a shorter string than the object C4(a) asserts on. | F | Delegate with a stated default: slice by code units, no ellipsis, no re-trim after slicing. Record the surrogate case in the plan Notes as an accepted MVP limit (the fixture is Latin-script), so a later session does not re-derive the argument. |
| D28 | `reason` is "the matched tokens joined" (task 2, line 35) — separator, ordering (query order? alphabetical?), and dedupe are all unstated, and `contentCandidateSchema.reason` requires non-empty after trim. | F | Delegate with a stated default: matched tokens, deduped, in query order, joined by `", "`. Non-emptiness follows from the floor (a zero-overlap item scores 0 and is excluded), which is worth one sentence in the plan so a reviewer does not have to re-derive it. |
| D29 | `SCORE_MAX` (`strength.ts`) and `contentCandidateSchema.score`'s literal `.max(1000)` (`schemas/content-candidate.ts:11`) are unbound. Changing `SCORE_MAX` would make every top-scoring candidate fail its own schema, and C2(g) would still pass. The schema is runtime-neutral and cannot import the server-only constant, so this cannot be fixed by import. | P | Cheap fix, and it doubles as part of D12: add two rows asserting `contentCandidateSchema` accepts `score: SCORE_MAX` and rejects `SCORE_MAX + 1`. That binds the two literals through a test rather than through an import. |
| D30 | Task 1 says `strengthForScore` "throws on non-integer **or out-of-range**", but only the non-integer case has a row (C2(i), line 55). `-1` and `SCORE_MAX + 1` are unasserted. | P | Add one row covering both out-of-range ends. Charter rule 2 (enumerate, never sample). |
| D31 | Only the `T_STRONG` bound has a named mutation (MUT-07-2). The `T_POSSIBLE` and `T_FLOOR` bounds — same defect family, same one-character change — have none. | F | Delegate / record. The nine C2 rows are themselves direct one-outcome assertions, so this is a reduction the owner's scope brief permits — but it must be **recorded as a reduction with its reason** in the plan Notes, not left implicit. If mutations are added instead, line 73's derived count moves to 5 or 6. |
| D32 | Task 4 states `import "server-only"` for the service only. Master §6.1 (`master-plan.md:165`) and contract 02 §3 require it in **every** module under `features/<feature>/server/**`, so `strength.ts` and `rank-candidates.ts` need it too. Every existing domain file already opens with it (`server/domain/approvability.ts:1`, `bump-version.ts:1`). | P | One clause in tasks 1 and 2. Interacts with D9's source-read wording. |
| D33 | Task 3 lists what `FIXTURE_CATALOG` must contain but omits `createdAt` and `productId`, both required by `ContentItem` (`src/lib/proposales/index.ts:8–15`). The phase will not typecheck without them. | P | One clause in task 3: deterministic `productId`s and a fixed ISO `createdAt` (never `new Date()` — master §9.1 rule 4). |

## Reality checks

- **Files expected to change (line 30).** Seven paths, all new; count re-derived and correct.
  `server/services/` does not exist yet — creating it with its first real file satisfies
  contract 03 §1's no-empty-folder rule. `server/domain/` and `fixtures/` exist.
  **Finding:** the perimeter is wrong by omission — D7, D8 and D14 require `master-plan.md`
  edits, and the plan must say whether the implementer or the coordinator makes them. Master
  §6.6 (`:129`) says the coordinator; then they must land **before** dispatch, not inside the
  phase.
- **Cited sections resolve.** Master §6.5 (`:292–296`: `MAX_CANDIDATES` 10,
  `MAX_CANDIDATE_DESCRIPTION_CHARS` 280, `SCORE_MAX` 1000, `T_STRONG/T_POSSIBLE/T_FLOOR`
  700/400/150), §6.6 (`:320`, `:325–326`), §6.7 (`:354`), §9 rule 6 (`:530`) all resolve and
  say what the plan claims — **except** §6.6's `scoreItem` row (D7). Intention §17A.8
  (`:694–727`), §10.1–§10.2 (`:286–301`), §21.1(d) (`:1030`) resolve. §5.1's stage table
  (`:145`, "Content search on human request | application | **no** model") supports C7(c)'s
  trace exactly.
- **Prior-phase dependencies verified in code, not assumed.** `contentCandidateSchema` and
  `matchStrengthSchema` exist with the eight fields the plan relies on
  (`schemas/content-candidate.ts`). `ContentItem` exists with `title`/`description` as
  `Record<string, string>` (`lib/proposales/index.ts:8`). The fake records `listContent` as
  exactly `{ op: "listContent" }` (`lib/proposales/fake.ts:66–70`), so **C7(a) is decidable
  as written** — the one row I expected to break and did not.
- **Vitest collection.** All seven files land under `src/features/**`, inside the node
  project's claimed globs (`vitest.config.mts`), so master §10.3's stray-test hazard does not
  fire. No `npx vitest list` confirmation needed.
- **`expectTypeOf` precedent (C7(c)).** Already used in `src/lib/errors/app-error.test.ts:60–74`.
  `test.typecheck` is not enabled in `vitest.config.mts`, so these assertions are inert at
  runtime and are enforced by `npm run typecheck` (tsconfig includes `**/*.ts`). That is the
  established, working arrangement — recorded so no one "fixes" it. **Note:** C7(c) covers
  *receiving* an AI client but not *importing* one; `src/lib/ai` does not exist until phase 8,
  so the import half is currently unfalsifiable. Fold it into D9's source-read list rather
  than writing a separate row.

## Criteria decidability

Twenty-two of 28 rows could be turned into a concrete assertion today. The six that could
not, and why:

- **C5(b)** (line 62) — undecidable until D1. Worked: a term present only in one item's `sv`
  description. Under reading (a) with a 1-token query the item scores `round(1000 × 1/3) = 333`
  → `weak` (≥ `T_FLOOR` 150) → **included**. With a 3-token query where only that term matches:
  `round(1000 × 1/9) = 111` → below `T_FLOOR` → **excluded**, and the row fails. Under reading (c)
  the same item scores 1000 → `strong`. Same fixture, three outcomes.
- **C6(c)** (line 66) — "equal strength, higher score first" needs two distinct scores inside
  one strength band. Under reading (c) the clamp collapses most items to 1000, so the fixture
  may be unconstructible. Blocked on D1.
- **C6(d)** (line 67) — decidable only with D19's divergent id pair; otherwise it has a second
  sufficient cause.
- **C7(b)** (line 69) — decidable but cannot fail meaningfully (D11).
- **C7(d)** (line 71) — both halves defective: D12 (does not discharge N6) and D13 (two
  sufficient causes).
- **C1(c)** (line 46) — as written, unimplementable (D9) and unfalsifiable (D10).

C2(a)–(i), C3(a)–(c), C4(a)–(b), C5(a)/(c), C6(a)–(b), C7(a)/(c) are decidable now, subject to
the fixture clauses in D19, D23, D25, D26, D33.

**Named mutations.** MUT-07-1 (comparator, remove the tie-break → C1(b) red) works: V8's sort
is stable, so without the tie-break a reversed catalog reverses the tied pair's arrival order
and the outputs differ — provided the tie pair survives the cap, which the "two items with
identical text" fixture guarantees. MUT-07-2 (`>=`→`>` on the strong bound → C2(a) red) and
MUT-07-3 (remove `slice` → C3(b) red) both bite, the latter because the fixture exceeds the
cap. All three name file, site and expected red per charter rule 11. If D10 and D31 are taken
up, the declared set grows and line 73's derived count moves with it.

## Trace verification (both directions)

- **Forward.** Every one of the 28 rows carries a trace cell. All resolve: M12 (`intention:482`)
  supports the determinism, threshold-enumeration and bounded-list claims of C1/C2/C3/C6;
  M4 (`intention:465`) supports C7(b) as the human-triggered search half of §22 criterion 4;
  §17A.8, §10.2, §5.1 and "crit 13" resolve and say what the rows assert. No void symbols.
- **Reverse.** Master §7.2 (`:425`, `:417`) claims phase 7 serves M12 via C1, C2, C3, C6 and
  M4 via C7 — all four/one are present. §7.3 (`:442`, `:451`) claims 7.C7 for §22 criterion 4
  and 7.C5 for criterion 13 — both present. **No unserved claimed entry, no orphan row.**
- C4 and C5(b) trace only to §17A.8 and not to a ledger ID, which charter link 2 permits
  (a row may cite a mechanism contract). Consistent with §7.2, which does not claim them.

## Evidence statement

**L4 budget: zero. Honored.** No `npm test`, `npm run typecheck`, `npm run lint`, `npx vitest`,
or any test execution of any scope was run in this session. All findings come from read-only
inspection of the artifacts and the working tree, plus arithmetic done by hand on the score
formula and the threshold constants (§6.5's 1000/700/400/150 and 10/280) solely to establish
whether the plan's rows are decidable — recorded inline above so it can be checked without
re-deriving it.

Tree identity: HEAD `30138a3`, `git status --porcelain` **empty** at session start and unchanged
by this session except for the single file below.

## Full write perimeter

**Documents:** one file created —
`build_docs/under_constroction/initial_core_feature_proposales/handoffs/reviewer/phase-07-projection-round-0.reviewer.md`
(this file).

**Code:** none. No file under `src/`, `test/`, `e2e/`, or any config file was created, edited,
or deleted.

**Artifacts not touched:** the intention, the master plan, `plans/phase-07-ranking-and-human-search.md`
(including its Review log), the tracker, and every prompt file. No `package.json` or lockfile
change. No commit, no stage, no branch operation.

**Tool-recorded state:** none. `.archgraph/` is not present in this repository (master §8);
skipped silently.

## Exit gate

`AMENDMENTS_REQUIRED`. Thirty-three ledger rows, all routed, counts derived from the tables
above: **25 P** (phase-plan amendments the coordinator folds), **2 M** (master-plan
naming-registry amendments, D7 and D8, both blocking), **5 F** (explicit written delegations
to the implementer: D15, D22, D24, D28, D31), and **1 I** (D17, owner card 1). The implementer
prompt should not compile until every row is routed — the seven
blocking rows in particular, of which D1 gates six criterion rows on its own — and the owner card
is answered or the phase is dispatched with the cap decision recorded as deferred.

The coordinator, not this session, folds these into the authoritative artifacts, writes the phase
plan's Review log line, and updates tracker row 7.
