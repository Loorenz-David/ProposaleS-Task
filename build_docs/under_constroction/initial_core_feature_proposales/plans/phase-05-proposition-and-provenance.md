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
