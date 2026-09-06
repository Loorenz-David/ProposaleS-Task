---
plan: 5
phase: Proposition schema and structural provenance
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 5 — Proposition schema and structural provenance

## Goal

Create the feature's shared shapes and the proposition schema: the three source-policy builders, `sourcedOrAbsent`, the enumerated consequential leaves on which `inferred` is unrepresentable, the block/note/assumption/warning shapes with no price surface, every text bound, the quantity domain rule, and the derived provenance projection. Also the reusable `validProposition()` fixture builder every later phase uses.

**Not in this phase:** information items, clarification, workflow state (phase 6); agent output schema (phase 11); edits (phase 12); approval (phase 13).

## Read first

1. Master plan §5 (R1), §6.4 (`shared.ts` builders, `recipientLeavesSchema`, `blockSchema`, `commercialNoteSchema`, `commercialAssumptionSchema`, `propositionSchema`, `contentCandidateSchema`), §6.5 (text caps, `MAX_BLOCKS`, `MAX_ALTERNATIVES_PER_BLOCK`), §6.3 (warning kinds), §6.8, §9 rule 1.
2. Intention §17A.1, §17A.4 (all — the consequential-leaf table is the enumeration), §17A.5 (the "never store 1 or false" rule), §17A.12 (input-side quantity rule), §17A.16 (text bounds, stated prices, `taxBasis`), §8.3, §9.2, §7 (Proposition, Provenance, Assumption, Warning).
3. Contracts: `06-data-contracts-and-validation.md` §1, §3, §4, §6 (free text, money), §9; `08-agent-architecture.md` §4, §6 (the rejection rule); `03-feature-architecture.md` §1–§2 (`schemas/` is runtime-neutral); `12-anti-patterns.md` "Data and validation".
4. Phases 2 and 4 Review logs.

## Dependencies (gate)

Phase 4 `APPROVED`.

## Files expected to change

`src/features/proposal-preparation/schemas/shared.ts`, `shared.test.ts`, `content-candidate.ts`, `proposition.ts`, `proposition.test.ts`, `server/domain/provenance-projection.ts`, `provenance-projection.test.ts`, `fixtures/propositions.ts` — 8 new files.

## Implementation tasks (ordered)

1. `schemas/shared.ts`: `propositionSourceSchema`; unrefined `refSchema`; `consequentialSchema(inner, sources: ReadonlyArray<"brief" | "proposales_content" | "human">)` — a `z.discriminatedUnion("source", …)` with one strict member per admissible source (the parameter's type excludes `"inferred"`, so it cannot be passed); `catalogVerbatimSchema(inner)`; `presentationalSchema(inner)`; `sourcedOrAbsent(leaf)` using the exact member-extension construction in master §6.4; `boundedText(max)` = `z.string().trim().min(1).max(max)`; all `MAX_*_CHARS` constants; `positiveFiniteNumberSchema = z.number().positive()`; and `positiveInt64StringSchema` as the canonical decimal form `1` through `9223372036854775807`.
2. `schemas/content-candidate.ts`: `matchStrengthSchema`, `contentCandidateSchema` (master plan §6.4). Its direct behavioral tests deliberately begin in phase 7 C7(d); this phase creates the shared runtime contract only.
3. `schemas/proposition.ts`: every schema of master plan §6.4's proposition rows, all `z.strictObject`; `warningSchema` with the closed `kind` enum and the fully specified payload fields from §6.4; `pricing: z.literal("library")` on blocks. Keep each of the 15 consequential leaves at an independent schema-construction call site — including each recipient field and each of the three commercial-assumption kind members — so `MUT-05-1a…1o` are independently applicable and cannot be collapsed by a future DRY refactor. Keep `refSchema` unrefined; apply the `turnId ⇒ quote` refinement only to the `human` member, and construct the content member with `refSchema.extend({ variationId: z.string() })`.
4. `server/domain/provenance-projection.ts`: `projectProvenance(p)` projects only the declared sourced leaves of the parsed proposition (known variants only), including `warnings[].text` but never recursing into `warnings[].before` or `.after`; emits `{ path, source, ref? }`; sorts paths segment-wise with decimal array-index segments compared numerically.
5. `fixtures/propositions.ts`: `validProposition(overrides?)` produces a fully valid strict proposition: identity (`generationId`, version, prepared timestamp); known language/title/description; recipient known with all five sourced leaves; one valid block with each source-bearing block leaf, one alternative with a sourced reason, and library pricing; known human empty-draft confirmation; one commercial note with text, known amount/currency, and tax basis; three commercial assumptions (`deadline`, `term`, `scope_commitment`); empty unresolved items; one sourced assumption note; one warning with sourced text and bare payload values; and a known agent rationale. `CONSEQUENTIAL_LEAF_DESCRIPTORS` is an exported list of exactly 15 descriptors, each carrying its string-segment `path`, source-policy fixture seed/value, wrapper mode (`sourcedOrAbsent` or bare), and the assumption `kind` where applicable. `leafInferred(descriptor)` builds one valid proposition and replaces only that descriptor's leaf with `source: "inferred"`; it must use the descriptor metadata rather than infer shape from a path. Keep the three assumption descriptors semantically distinct even though each fixture targets index `0`. The projection test may build its local eleven-block fixture from `validProposition`; no extra fixture export is needed.
6. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | sourced leaf | `{ value: "x", source: "brief", ref: { quote: "…" } }` against `presentationalSchema(z.string())` | parses | — | §17A.1 |
| C1(b) | absent is required | `z.strictObject({ q: sourcedOrAbsent(...) }).safeParse({})` | fails at `["q"]`; `{ q: { known: false } }` parses | — | M9, §17A.1 |
| C1(c) | content ref required | `{ value: "x", source: "proposales_content" }` (no `ref`) | fails exactly at `["ref"]` | — | §17A.1 |
| C1(d) | quote cap | `ref.quote` of `MAX_QUOTE_CHARS + 1` | fails | — | §17A.16 |
| C1(e) | instruction-turn ref (card 2 → A) | `{ value: 3, source: "human", ref: { turnId: <uuid v4>, quote: "quantity 3" } }` against `consequentialSchema(number, [brief, human])` | parses; an uppercase `turnId` fails at `["ref","turnId"]`; `ref: { turnId }` without `quote` fails at `["ref","quote"]` (refinement: `turnId` requires `quote`) | — | §17A.4 (as amended by FB-2), §17A.1 |
| C2(a–o) | `inferred` unrepresentable, one row per consequential leaf | `CONSEQUENTIAL_LEAF_DESCRIPTORS` has exactly 15 entries; for each descriptor, `leafInferred(descriptor)` | `propositionSchema.safeParse` fails with an issue whose normalized path (`issue.path.map(String)`) equals `[...descriptor.path, "source"]` | 15 distinct mutations in `proposition.ts`, each admitting `inferred` only at the corresponding independent leaf construction: `MUT-05-1a` firstName, `MUT-05-1b` lastName, `MUT-05-1c` email, `MUT-05-1d` phone, `MUT-05-1e` companyName, `MUT-05-1f` contentId, `MUT-05-1g` quantity, `MUT-05-1h` optional, `MUT-05-1i` amount, `MUT-05-1j` currency, `MUT-05-1k` taxBasis, `MUT-05-1l` deadline, `MUT-05-1m` term, `MUT-05-1n` scope_commitment, `MUT-05-1o` emptyDraftConfirmation — → its corresponding C2 row red | M10, M1, crit 2, crit 22 |
| C3(a) | contentId from brief | `blocks.0.contentId.source = "brief"` | fails | — | §17A.4 |
| C3(b) | quantity from content | `source = "proposales_content"` | fails | — | §17A.4 |
| C3(c) | optional from content | | fails | — | §17A.4 |
| C3(d) | confirmation not human | `emptyDraftConfirmation` known with `source: "brief"` | fails | MUT-05-2 `proposition.ts` · `emptyDraftConfirmation` · admit `"brief"` → C3(d) red | M10, §17A.4 |
| C3(e) | confirmation human | `{ known: true, value: true, source: "human" }` | parses | — | §17A.6 |
| C3(f) | block title authored | `blocks.0.title.source = "human"` | fails (catalog_verbatim) | MUT-05-3 `shared.ts` · `catalogVerbatimSchema` · admit `human` → C3(f) red | M10, §17A.4 |
| C3(g) | note amount from content | `commercialNotes.0.amount.source = "proposales_content"` | fails | — | §17A.4 |
| C3(h) | `other` assumption may be inferred | `commercialAssumptions.0 = { kind: "other", statedValue: { …, source: "inferred" } }` | parses | — | §17A.4 |
| C3(i) | content identifier form | `blocks.0.contentId.value`: `"9223372036854775807"`, `"0"`, `"01"`, and `"9223372036854775808"` | only the positive-int64 maximum parses; each other value fails | — | §17A.4 |
| C4(a–g) | presentational accepts `inferred`, one row each | `language`, `title`, `descriptionNarrative`, `blocks.0.reviewerComment`, `blocks.0.alternatives.0.reason`, `agentRationale`, `assumptions.0.note` with `source: "inferred"` | parses (7 rows) | — | M10, §17A.4 |
| C5(a) | no block price | block with extra `unitValue: 1` | fails (strict) | MUT-05-4 `proposition.ts` · `blockSchema` · `z.object` instead of `z.strictObject` → C5(a) red | M1, crit 20 |
| C5(b) | no proposal total | proposition with `total: {…}` | fails | — | crit 20 |
| C5(c) | no block currency | block with `currency: "EUR"` | fails | — | crit 20, crit 23 |
| C5(d) | note amount is Money-or-absent | amount known `{ amountMinor: 1200000, currency: "EUR" }` parses; `{ amountMinor: 12000.5 … }` fails; `{ known: false }` parses (the "around 12k" case) | as stated (3 sub-rows) | — | §17A.16, M1 |
| C5(e) | taxBasis explicit | `{ value: "unstated", source: "brief" }` parses; `taxBasis` key missing fails | as stated | MUT-05-5 `proposition.ts` · `commercialNoteSchema.taxBasis` · `.default({ value: "unstated", source: "brief" })` → C5(e) red | §17A.16 |
| C5(f) | note currency | known `"USD"` parses; known `"usd"` fails; `{ known: false }` parses | as stated | — | §17A.16, crit 23 |
| C5(g) | library pricing literal | `pricing: "library"` required; `"custom"` fails; missing fails | as stated | — | §9.2, crit 20 |
| C6(a–h) | text bounds, one row per field | `title`, `descriptionNarrative`, `blocks.0.reviewerComment`, `commercialNotes.0.text`, `agentRationale`, `warnings.0.text`, `assumptions.0.note`, `blocks.0.alternatives.0.reason` at its cap+1 | fails; `"  x  "` parses to `"x"` (trim) | — | §17A.16 |
| C7(a–f) | quantity rule | `0`, `-1`, `NaN`, `Infinity` fail; `1`, `1.5` parse | as stated (6 rows) | — | §17A.12 (input side), §11.2 |
| C8(a) | projection covers every sourced leaf | `validProposition()` | the projected **path set** equals exactly: `["language"]`, `["title"]`, `["descriptionNarrative"]`, `["recipient","value","firstName"]`, `["recipient","value","lastName"]`, `["recipient","value","email"]`, `["recipient","value","phone"]`, `["recipient","value","companyName"]`, `["blocks","0","contentId"]`, `["blocks","0","title"]`, `["blocks","0","description"]`, `["blocks","0","quantity"]`, `["blocks","0","optional"]`, `["blocks","0","reviewerComment"]`, `["blocks","0","alternatives","0","reason"]`, `["emptyDraftConfirmation"]`, `["commercialNotes","0","text"]`, `["commercialNotes","0","amount"]`, `["commercialNotes","0","currency"]`, `["commercialNotes","0","taxBasis"]`, `["commercialAssumptions","0","statedValue"]`, `["commercialAssumptions","1","statedValue"]`, `["commercialAssumptions","2","statedValue"]`, `["assumptions","0","note"]`, `["warnings","0","text"]`, `["agentRationale"]`; every array index is a decimal string | MUT-05-6 `provenance-projection.ts` · traversal · stop descending into `alternatives` → C8(a) red | §17A.4 |
| C8(b) | numeric path order | local valid fixture with exactly 11 blocks, each populated as `validProposition()` does | the projected `blocks.2.contentId` entry occurs before `blocks.10.contentId` | MUT-05-7 `provenance-projection.ts` · comparator · replace segment-aware numeric comparison with default `Array.prototype.sort()` → C8(b) red | §17A.4; phase-level ordering decision in Notes |
| C8(c) | absent leaves produce no entry | `blocks.0.quantity = { known: false }` | no entry with that path | — | §17A.4 |
| C8(d) | projection is not an input | proposition with a `provenance: [...]` key | fails (strict) | — | §17A.4 |

Criteria: 8 (C1–C8), 61 rows (a table line is one row; a lettered span counts its letters). Named mutations: 21.

## Notes

- `language` is presentational (§17A.4 explicit); do not "harden" it into a consequential leaf.
- `blocks[i].productId` and `alternatives[i].productId/title/variationId` are plain strings (display material copied by the application in phase 11); only `reason` carries a source.
- `recipient` is `knownOrAbsent` at object level (master plan §6.4): sources live only on its five leaves; the master plan resolves §17A.4's "object-level SourcedOrAbsent" wording as object-level `KnownOrAbsent` because leaf granularity forbids an object-level source.
- Projection gate: mandatory (rank 2).
- Phase-4 review N6 fold: the 15 C2 leaves require 15 independently observed mutations; do not restore an all-leaves mutation that can fail only on the first loop assertion.
- C3 source-policy coverage intentionally samples representative inadmissible pairs. It does not enumerate `proposales_content` on every recipient/note/assumption leaf because those source members use the same per-policy construction; C2(a–o)'s per-leaf mutations independently prove the consequential union boundary. This is the owner MVP scope brief applied to duplicated negative fixtures, not an omitted guard.
- Projection order is a presentation-only phase decision: compare path segments left-to-right, treating decimal array-index segments numerically. It is independent of the approval-diff order in §17A.10.
- `contentCandidateSchema` is deliberately untested in phase 5; phase 7 C7(d) is its first behavioral proof. The shared schema still parses all feature-owned data at its later boundary.

## Review log

*(append-only)*

**Coordinator pre-projection fold (2026-09-05, Codex).** Phase-4 delta review N6 found
that one all-keys mutation cannot prove every loop row when the first failed assertion
aborts the test. C2(a–o) now declares 15 independently observed mutations, one for each
consequential leaf; counts re-derived at 8 criteria / 61 rows / 19 mutations. This is a
test-ledger refinement only; the ratified proposition semantics are unchanged.

**Coordinator projection fold (2026-09-05, Codex).** Consumed projection round 0
`AMENDMENTS_REQUIRED`. All D1–D22 are routed: the owner confirmed recipient provenance
is per field and §17A.4 now says so; the plan/master now specify descriptors, independent
construction sites, concrete warning payloads, content-id form, exact fixtures and
projection guards, Zod-safe schema construction, names, and intentional deferred/sampled
coverage. Counts re-derived at 8 criteria / 61 rows / 21 mutations (`C1 0 · C2 15 · C3 2
· C4 0 · C5 2 · C6 0 · C7 0 · C8 2`); phase 5 remains ready for an implement prompt.

**Implementation — round 1 (2026-09-06, Codex).** Implemented the eight-file phase perimeter:
runtime-neutral shared source-policy builders and bounds, the deferred content-candidate
contract, strict proposition schemas with 15 independently constructed consequential leaves,
the reusable valid proposition/descriptor fixtures, and the server-only structural provenance
projection. Warning text is projected while bare `before`/`after` values are not; projection
ordering compares decimal path-index segments numerically. No integration, UI, agent runtime,
workflow state, persistence, pricing write, or content-candidate behavioral tests were added;
the latter remains intentionally delegated to phase 7 C7(d).

Architecture resolution re-emitted before implementation: `02-runtime-boundaries.md`,
`03-feature-architecture.md`, `04-server-architecture.md`,
`06-data-contracts-and-validation.md`, `07-integrations.md`, `08-agent-architecture.md`,
`09-database-and-persistence.md` (absence confirmation), `10-security-and-trust-boundaries.md`,
`11-testing-principles.md`, `12-anti-patterns.md`, `13-decision-checklist.md`, and
`14-documentation-principles.md`; no additional contract was needed. The schema modules remain
runtime-neutral and the projector alone begins with `import "server-only"`.

Judgment calls: the standalone `sourcedOrAbsent` helper falls back to the existing
`knownOrAbsentSchema` shape when called with a non-source schema, while all phase proposition
leaves use the required member-extension construction; warning payload values are recursive
bare JSON values that reject an own `source` key; and projection ordering is the presentation
decision recorded in Notes. These choices do not alter the ratified proposition semantics.

Pre-edit baseline, captured after all phase tests were authored and before production files were
created: 3 phase files / 61 tests, all 61 failing because the eight production modules were
absent. Targeted implementation evidence: 3 files / 61 tests green. Closing evidence: `npm
test` → 15 files / 224 tests green; `npm run typecheck`, `npm run lint`, and `git diff --check`
passed. The tracked `tsconfig.tsbuildinfo` rewrite from typecheck was restored and is outside
the phase perimeter. Documentation-impact review found no durable current-state documentation
that became false or incomplete. No architecture graph is present.

**Review — round 1 (2026-09-06, Claude, independent).** Verdict `CHANGES_REQUESTED`: 0 blocking,
3 should-fix, 6 notes. Source target `32435e5` (parent `ba1aeea`); perimeter re-derived as exactly
the 8 declared phase files plus tracker row 5 and this append-only log — no `tsconfig.tsbuildinfo`,
frontend, integration, UI, runtime, workflow-state, persistence, price-write, or
`contentCandidateSchema` behavioral surface entered the checkpoint. Counts independently re-derived
from the criteria table: 8 criteria, 61 rows (5+15+9+7+7+8+6+4), 21 mutations
(`C1 0 · C2 15 · C3 2 · C4 0 · C5 2 · C6 0 · C7 0 · C8 2`). Trace chain closed: 61 tests across 3
files, no orphan.

**S1 — C6(d) cannot fail for the bound it names.** `proposition.test.ts:221` replaces the whole
sourced wrapper with a bare string (`value.commercialNotes[0].text = "x".repeat(cap + 1)`), so the
parse fails `invalid_type: expected object, received string` at `["commercialNotes","0","text"]` —
byte-identically to what a 5-character bare string produces (probe P1c). Probe M-F: replacing
`boundedText(MAX_NOTE_TEXT_CHARS)` with an uncapped `z.string().trim().min(1)` leaves all 8 C6 rows
green. The production cap is correct (P1a: cap+1 inside a valid wrapper fails `too_big` at
`["commercialNotes","0","text","value"]`; P1b: exactly at the cap parses) — the defect is the
instrument. Authority: charter rule 15 and rule 2's companion (a row's fixture must make its own
predicate the only reason the outcome holds); plan C6(a–h); intention §17A.16. Correction: set
`.text.value`, keep the wrapper, and assert the issue code `too_big` at path
`["commercialNotes","0","text","value"]`.

**S2 — the phase's ordering mechanism has no test that can observe it.** Probe M-D: making the
numeric branch of `compareSegments` a no-op (`return 0`) leaves all four C8 rows green. Probe M-E:
deleting the `entries.sort(...)` call in `provenance-projection.ts:77` leaves all 61 phase tests
green. Cause: `projectProvenance` appends block entries in ascending index order, so C8(b)'s
"blocks.2 before blocks.10" holds from insertion order alone, and C8(a) compares a `Set`, which is
order-insensitive. MUT-05-7 reddens only because default `Array.prototype.sort()` actively
re-sorts lexically; it never demonstrates that the comparator produces the order. Authority:
charter rule 15; plan task 4 and Notes ("compare path segments left-to-right, treating decimal
array-index segments numerically"); C8(b). Correction: assert the full projected **sequence**, not
a set or a pairwise index comparison. Probe P6a records the sorted sequence for `validProposition()`
(`agentRationale, assumptions.0.note, blocks.0.alternatives.0.reason, blocks.0.contentId, …`) and
confirms it differs from insertion order at the top level, so a sequence assertion reddens under
both M-D and M-E.

**S3 — `sourcedOrAbsent`'s untyped fallback silently produces a source-less shape, and C1(b) is the
only test of it.** `shared.ts:83–94` reads `(leafSchema as any).options` and, when absent, returns
`knownOrAbsentSchema(leafSchema)`. Probe P4a: `sourcedOrAbsent(z.string())` **accepts**
`{known:true, value:"x"}` with no `source` at all and **rejects**
`{known:true, value:"x", source:"brief"}` — the nested-`value` shape §17A.1 forbids for a
`SourcedOrAbsent` leaf. `shared.test.ts:16` (C1(b), the only test naming `sourcedOrAbsent`) calls
exactly that branch, so C1(b) measures the fallback rather than the production construction: probe
M-G collapses the union-member extension into the fallback and C1(b) stays green (37 proposition
tests do redden, so the mechanism itself is covered indirectly — the row is weak, not the schema).
Authority: intention §17A.1; `12-anti-patterns.md` "Data and validation" (silent defaulting);
charter rule 15. Correction: make a non-union argument a compile-time or construction-time failure
instead of a silent shape change, and re-point C1(b) at a real source-union leaf.

**N1 — int64 execution seam: loud but late, no silent corruption** (required cross-phase probe).
Phase 5 accepts content ids to `9223372036854775807` per C3(i) and §17A.4.
`src/lib/proposales/mappers.ts:37` converts with `Number(block.contentId)`, which does **not**
preserve the identifier: `Number("9223372036854775807")` → `9223372036854776000` (P3b); the first
corrupting value is `9007199254740993` → `9007199254740992` (P3d). However
`createProposalRequestSchema` declares `content_id: z.number().int()` and Zod 4's `.int()` is
safe-integer bounded, so the converted value is rejected at request parse with
`too_big: expected int to be <=9007199254740991` (P3c, P3e). Because `Number(x) ≥ 2^53` for every
`x > MAX_SAFE_INTEGER`, there is **no silent-corruption window**: every id phase 5 accepts above
2^53−1 fails loudly before reaching Proposales, and the read-back path (`mappers.ts:114`,
`schemas.ts:95`) fails the same way as `schema_mismatch`. Actual consequence: a proposition phase 5
declares structurally valid is unexecutable, surfacing at execution as an integration/internal
schema failure rather than at proposition validation (§17A.13 precedence). Unreachable with real
Proposales ids (6 digits; fixture `188485`). Not a phase-5 defect — phase 5 implements the ratified
contract exactly. No production change made; carried forward.

**N2 — `ConsequentialLeafDescriptor.seed` is dead scaffolding.** Declared at
`fixtures/propositions.ts:9` and populated on all 15 descriptors; never read anywhere under `src/`.
Charter rule 4. Correction: delete it, or give it its consumer.

**N3 — `leafInferred`'s `commercialAssumptions` special case is a redundant branch.**
`fixtures/propositions.ts:119–121` builds `{value, source}`, identical to what `wrapper: "bare"`
already yields at line 118; all three assumption descriptors are `wrapper: "bare"`, so the branch
cannot change any outcome.

**N4 — C6(b)–C6(h)'s trim half asserts `title`, not their own field.**
`proposition.test.ts:228–230` re-runs the same `title` trim assertion inside every one of the eight
parametrised rows, while plan C6(a–h) expects `"  x  "` → `"x"` per field. Seven of eight trim
halves are decoration. Contained because `boundedText` is one shared builder whose trim is
exercised, but the rows do not measure what they state.

**N5 — C8(a)'s `Set` comparison cannot see a duplicate entry.**
`provenance-projection.test.ts:20`. The plan row asks only for a path *set*, so the test matches its
row; verified independently instead (probe P2c): 26 entries, 26 unique, no duplicates, `source` and
optional `ref` preserved verbatim. Recorded so a later phase extending the projector knows this row
will not catch a duplicate.

**N6 — carried, not a finding.** `contentCandidateSchema` ships with no behavioral test per the
plan Notes; `11-testing-principles.md` §3's "valid fixture plus one invalid fixture per consequential
field" is deliberately deferred to phase 7 C7(d).

**Verified correct.** Perimeter and counts as above. All 15 consequential leaves are independent
`consequentialSchema(...)` call sites (`proposition.ts:33–37, 50, 54, 55, 63, 64, 65, 71, 75, 79,
136`) with no DRY collapse — proven by two fresh mutant *shapes* the implementer did not use: M-A
(term member → presentational) reddens only C2(m), M-B (`recipient.phone` → presentational) reddens
only C2(d), 14 siblings green each time. Source policies hold structurally: the content member
requires `ref` and `ref.variationId` (`shared.ts:44–50`); `turnId ⇒ quote` is applied to the `human`
member only (`shared.ts:53–62`); `refSchema` is unrefined (`shared.ts:26–32`); every production leaf
extends the real source-union members with no nested `value` and no parallel source representation.
Strictness holds at every nesting depth: no `z.object` anywhere in the feature, and 14 unknown-key
cases all reject, including `ref`, both sourced-leaf shapes, `Money`, and a `{known:false}` variant
carrying an extra `value` (P5a). Provenance boundary holds: `warnings[].text` projected,
`before`/`after` never traversed (P2b), an own `source` key inside a warning payload rejected at
depths 1–4 and inside arrays (P2a), numeric index ordering correct beyond blocks for 11 commercial
notes and 12 assumptions (P2d). `known:false` is explicit and yields no projected entry.
`positiveInt64StringSchema` rejects `0`, `01`, `9223372036854775808` and accepts the maximum by
equal-length lexical comparison. Runtime boundaries hold: `schemas/` and `fixtures/` are
runtime-neutral, `import "server-only"` is the first line of the projector alone
(`02-runtime-boundaries.md` §3), the feature stays under `src/features/proposal-preparation/`, and no
fetch, `process.env`, persistence, or external-integration edge was introduced.

**Evidence.** L4 review stamp (exactly one): `npm test` at tree `8f3516f` with clean
`git status --porcelain` (dirty-diff digest `e3b0c44…7852b855`, the empty digest) → 15 files / 224
tests passed; failure-ID delta ∅ → ∅. The implementer's targeted 61-test run, typecheck and lint are
consumed by citation — the production tree matches. Targeted L1 probes ran against
`schemas/proposition.test.ts`, `schemas/shared.test.ts`,
`server/domain/provenance-projection.test.ts` and the feature directory.

**Probe declaration.** Seven applied-and-reverted mutation probes — M-A, M-B, M-F on
`schemas/proposition.ts`; M-G on `schemas/shared.ts`; M-C, M-D, M-E on
`server/domain/provenance-projection.ts` — each reverted with `git checkout --` and all three files
verified byte-identical by SHA-256 against their pre-probe digests. One temporary probe file,
`src/features/proposal-preparation/zzz-reviewer-probe.test.ts`, carried probes P1–P6 across three
runs and was deleted; `git status --porcelain` is empty. No database or other persistent state was
in scope. No production code was fixed and no approval commit was created.

**Lessons for the plans.** (i) A criterion row whose fixture replaces a *wrapper* instead of the
*field the row names* is the guard-that-cannot-fail shape in its most common disguise — C6(a–h)
should state, per row, that the wrapper stays valid and only the bounded value crosses the cap.
(ii) A criterion over an ordering mechanism cannot be discharged by a pairwise index comparison when
the unsorted insertion order already satisfies it; the row must assert a sequence that differs from
insertion order, and the mutation ledger should include a "make the comparator a no-op" mutant
alongside "replace the comparator", because only the former distinguishes the sort from the
traversal. (iii) A shared builder with a silent structural fallback needs a criterion on the
fallback, or no fallback at all — an untyped `as any` escape hatch is where a later phase acquires a
shape the intention forbids.
