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

1. `schemas/shared.ts`: `propositionSourceSchema`; `refSchema`; `consequentialSchema(inner, sources: ReadonlyArray<"brief" | "proposales_content" | "human">)` — a `z.discriminatedUnion("source", …)` with one strict member per admissible source (the parameter's type excludes `"inferred"`, so it cannot be passed); `catalogVerbatimSchema(inner)`; `presentationalSchema(inner)`; `sourcedOrAbsent(leaf)`; `boundedText(max)` = `z.string().trim().min(1).max(max)`; all `MAX_*_CHARS` constants; `positiveFiniteNumberSchema = z.number().finite().positive()`.
2. `schemas/content-candidate.ts`: `matchStrengthSchema`, `contentCandidateSchema` (master plan §6.4).
3. `schemas/proposition.ts`: every schema of master plan §6.4's proposition rows, all `z.strictObject`; `warningSchema` with the closed `kind` enum; `pricing: z.literal("library")` on blocks.
4. `server/domain/provenance-projection.ts`: `projectProvenance(p)` walks the parsed proposition, emits `{ path, source, ref? }` for every leaf carrying `source` (known variants only), sorts by path (segment-wise, indices numerically).
5. `fixtures/propositions.ts`: `validProposition(overrides?)` producing a fully valid proposition with one block, recipient known (email from brief), one note, one assumption; plus `leafInferred(path)` helper to build the C2 fixtures mechanically from the consequential-leaf list (the list is exported as `CONSEQUENTIAL_LEAF_PATHS` from the test module and must have 15 entries — asserted).
6. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | sourced leaf | `{ value: "x", source: "brief", ref: { quote: "…" } }` against `presentationalSchema(z.string())` | parses | — | §17A.1 |
| C1(b) | absent is required | `z.strictObject({ q: sourcedOrAbsent(...) }).safeParse({})` | fails at `["q"]`; `{ q: { known: false } }` parses | — | M9, §17A.1 |
| C1(c) | content ref required | `{ value: "x", source: "proposales_content" }` (no `ref.variationId`) | fails at `["ref"]` or `["ref","variationId"]` | — | §17A.1 |
| C1(d) | quote cap | `ref.quote` of `MAX_QUOTE_CHARS + 1` | fails | — | §17A.16 |
| C1(e) | instruction-turn ref (card 2 → A) | `{ value: 3, source: "human", ref: { turnId: <uuid v4>, quote: "quantity 3" } }` against `consequentialSchema(number, [brief, human])` | parses; an uppercase `turnId` fails at `["ref","turnId"]`; `ref: { turnId }` without `quote` fails at `["ref","quote"]` (refinement: `turnId` requires `quote`) | — | §17A.4 (as amended by FB-2), §17A.1 |
| C2(a–o) | `inferred` unrepresentable, one row per consequential leaf | `validProposition()` with `source: "inferred"` at: `recipient.value.firstName`, `.lastName`, `.email`, `.phone`, `.companyName`, `blocks.0.contentId`, `blocks.0.quantity`, `blocks.0.optional`, `commercialNotes.0.amount`, `.currency`, `.taxBasis`, `commercialAssumptions.0.statedValue` for kinds `deadline`, `term`, `scope_commitment`, `emptyDraftConfirmation` (15 rows; `CONSEQUENTIAL_LEAF_PATHS.length === 15` asserted) | `propositionSchema.safeParse` fails; an issue path is a prefix-match of the leaf path | MUT-05-1 `shared.ts` · `consequentialSchema` · add an `inferred` member to the union → every C2 row red (record all 15) | M10, M1, crit 2, crit 22 |
| C3(a) | contentId from brief | `blocks.0.contentId.source = "brief"` | fails | — | §17A.4 |
| C3(b) | quantity from content | `source = "proposales_content"` | fails | — | §17A.4 |
| C3(c) | optional from content | | fails | — | §17A.4 |
| C3(d) | confirmation not human | `emptyDraftConfirmation` known with `source: "brief"` | fails | MUT-05-2 `proposition.ts` · `emptyDraftConfirmation` · admit `"brief"` → C3(d) red | M10, §17A.4 |
| C3(e) | confirmation human | `{ known: true, value: true, source: "human" }` | parses | — | §17A.6 |
| C3(f) | block title authored | `blocks.0.title.source = "human"` | fails (catalog_verbatim) | MUT-05-3 `shared.ts` · `catalogVerbatimSchema` · admit `human` → C3(f) red | M10, §17A.4 |
| C3(g) | note amount from content | `commercialNotes.0.amount.source = "proposales_content"` | fails | — | §17A.4 |
| C3(h) | `other` assumption may be inferred | `commercialAssumptions.0 = { kind: "other", statedValue: { …, source: "inferred" } }` | parses | — | §17A.4 |
| C4(a–g) | presentational accepts `inferred`, one row each | `language`, `title`, `descriptionNarrative`, `blocks.0.reviewerComment`, `blocks.0.alternatives.0.reason`, `agentRationale`, `assumptions.0.note` with `source: "inferred"` | parses (7 rows) | — | M10, §17A.4 |
| C5(a) | no block price | block with extra `unitValue: 1` | fails (strict) | MUT-05-4 `proposition.ts` · `blockSchema` · `z.object` instead of `z.strictObject` → C5(a) red | M1, crit 20 |
| C5(b) | no proposal total | proposition with `total: {…}` | fails | — | crit 20 |
| C5(c) | no block currency | block with `currency: "EUR"` | fails | — | crit 20, crit 23 |
| C5(d) | note amount is Money-or-absent | amount known `{ amountMinor: 1200000, currency: "EUR" }` parses; `{ amountMinor: 12000.5 … }` fails; `{ known: false }` parses (the "around 12k" case) | as stated (3 sub-rows) | — | §17A.16, M1 |
| C5(e) | taxBasis explicit | `"unstated"` parses; key missing fails | as stated | MUT-05-5 `proposition.ts` · `taxBasis` · `.default("unstated")` → C5(e) red | §17A.16 |
| C5(f) | note currency | known `"USD"` parses; known `"usd"` fails; `{ known: false }` parses | as stated | — | §17A.16 |
| C5(g) | library pricing literal | `pricing: "library"` required; `"custom"` fails; missing fails | as stated | — | §9.2, crit 20 |
| C6(a–i) | text bounds, one row per field | `title`, `descriptionNarrative`, `blocks.0.reviewerComment`, `commercialNotes.0.text`, `agentRationale`, `warnings.0.text`, `assumptions.0.note`, `blocks.0.alternatives.0.reason`, `ref.quote` at cap+1 | fails; `"  x  "` parses to `"x"` (trim) | — | §17A.16 |
| C7(a–f) | quantity rule | `0`, `-1`, `NaN`, `Infinity` fail; `1`, `1.5` parse | as stated (6 rows) | — | §17A.12 (input side), §11.2 |
| C8(a) | projection covers every sourced leaf | `validProposition()` | entries exist for each known leaf including `blocks.0.contentId`, `recipient.value.email`, `commercialNotes.0.taxBasis`; array indices are decimal strings | — | §17A.4 |
| C8(b) | sorted | | `paths` equal their sorted copy | — | §17A.10 (total order) |
| C8(c) | absent leaves produce no entry | `blocks.0.quantity = { known: false }` | no entry with that path | — | §17A.4 |
| C8(d) | projection is not an input | proposition with a `provenance: [...]` key | fails (strict) | — | §17A.4 |

Criteria: 8 (C1–C8), 61 rows (a table line is one row; a lettered span counts its letters). Named mutations: 5.

## Notes

- `language` is presentational (§17A.4 explicit); do not "harden" it into a consequential leaf.
- `blocks[i].productId` and `alternatives[i].productId/title/variationId` are plain strings (display material copied by the application in phase 11); only `reason` carries a source.
- `recipient` is `knownOrAbsent` at object level (master plan §6.4): sources live only on its five leaves; the master plan resolves §17A.4's "object-level SourcedOrAbsent" wording as object-level `KnownOrAbsent` because leaf granularity forbids an object-level source.
- Projection gate: mandatory (rank 2).

## Review log

*(append-only)*
