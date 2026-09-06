---
plan: 5
role: review
round: 1
verdict: CHANGES_REQUESTED
date: 2026-09-06
actor: Claude
---

# Phase 5 review handoff — round 1 (first independent review)

Source target: checkpoint `32435e5` (parent `ba1aeea`). Review tree: `8f3516f`, clean.
Verdict **`CHANGES_REQUESTED`**: 0 blocking, 3 should-fix, 6 notes. The ratified proposition
semantics are implemented correctly — every structural claim I probed held. All three should-fix
findings are *instruments that cannot fail*: three criterion rows pass for a reason other than the
mechanism they name, so the phase currently ships guards that would survive the defects they exist
to prevent. One of the three (S3) also leaves a live production branch that produces a shape
§17A.1 forbids.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner. Every finding is decidable from the phase plan, the ratified intention,
and the charter; N1 is a cross-phase note routed below, not a decision.

## Gate check

| Condition | Result |
|---|---|
| Intention header `RATIFIED` | pass (2026-09-05, owner David, §23 round 12) |
| Tracker row 4 `APPROVED`, row 5 `REVIEWING` | pass |
| `32435e5` parent `ba1aeea`, subject `CHECKPOINT (not approved): phase 05 proposition and provenance` | pass |
| Implementer handoff present, declares no owner decision | pass (`⚠ OWNER DECISIONS REQUIRED (0)`) |
| `git status --porcelain` at review entry | empty |

## Perimeter and evidence reconciliation

`git diff --name-status ba1aeea 32435e5` yields exactly the eight declared phase files
(`schemas/shared.ts`, `shared.test.ts`, `content-candidate.ts`, `proposition.ts`,
`proposition.test.ts`, `server/domain/provenance-projection.ts`, `provenance-projection.test.ts`,
`fixtures/propositions.ts`) plus `master-plan.md` (tracker row 5 only) and the phase plan
(append-only Review log). `8601d69` adds the handoff and nothing else. Confirmed absent from the
checkpoint: `tsconfig.tsbuildinfo`, any frontend file, and any integration, UI, runtime,
workflow-state, persistence, price-write, or `contentCandidateSchema` behavioral test.

Counts re-derived from the criteria table rather than consumed: **8 criteria**; **61 rows**
(C1 5 + C2 15 + C3 9 + C4 7 + C5 7 + C6 8 + C7 6 + C8 4); **21 mutations**
(`C1 0 · C2 15 · C3 2 · C4 0 · C5 2 · C6 0 · C7 0 · C8 2`). All three match the handoff.
The 15 declared consequential descriptors are complete and each is an independent
`consequentialSchema(...)` call site — verified structurally at `proposition.ts:33–37, 50, 54, 55,
63, 64, 65, 71, 75, 79, 136` and behaviourally by two fresh mutant shapes (below). The two
mis-sited assumption probes are treated as historical false-green measurements and were not
consumed as evidence. Trace chain closed in both directions: 61 tests across 3 files, one per row,
no orphan.

## Findings

### Should-fix

**S1 — C6(d) cannot fail for the bound it names.** `proposition.test.ts:221` sets
`value.commercialNotes[0].text = "x".repeat(cap + 1)`, replacing the whole sourced wrapper with a
bare string. The parse then fails `invalid_type: expected object, received string` at
`["commercialNotes","0","text"]` — byte-identically to a 5-character bare string (probe P1c).
Probe **M-F**: replacing `boundedText(MAX_NOTE_TEXT_CHARS)` with an uncapped
`z.string().trim().min(1)` leaves **all 8 C6 rows green**. The production cap itself is correct —
P1a (cap+1 inside a valid wrapper) fails `too_big` at `["commercialNotes","0","text","value"]`, and
P1b (exactly at the cap) parses. Authority: charter rule 15; rule 2's companion (a row's fixture
must make its own predicate the only reason the outcome holds); plan C6(a–h); intention §17A.16.
**Correction:** set `.text.value`, keep the wrapper valid, and assert issue code `too_big` at path
`["commercialNotes","0","text","value"]`.

**S2 — the phase's ordering mechanism has no test that can observe it.** Probe **M-D**: making the
numeric branch of `compareSegments` a no-op (`return 0`) leaves all four C8 rows green. Probe
**M-E**: deleting `entries.sort(...)` at `provenance-projection.ts:77` leaves **all 61 phase tests
green**. Cause: the projector appends block entries in ascending index order, so C8(b)'s
"blocks.2 before blocks.10" holds from insertion order alone, and C8(a) compares a `Set`, which is
order-insensitive. MUT-05-7 reddens only because default `Array.prototype.sort()` *actively*
re-sorts lexically; it never demonstrates the comparator produces the order. Authority: charter
rule 15; plan task 4 and Notes ("compare path segments left-to-right, treating decimal array-index
segments numerically"); C8(b). **Correction:** assert the full projected **sequence**, not a set or
a pairwise index. Probe P6a records the sorted sequence for `validProposition()` — `agentRationale,
assumptions.0.note, blocks.0.alternatives.0.reason, blocks.0.contentId, …` — and confirms it
differs from insertion order at the top level, so a sequence assertion reddens under both M-D and
M-E.

**S3 — `sourcedOrAbsent`'s untyped fallback silently produces a source-less shape, and C1(b) is the
only test of it.** `shared.ts:83–94` reads `(leafSchema as any).options` and, when absent, returns
`knownOrAbsentSchema(leafSchema)`. Probe **P4a**: `sourcedOrAbsent(z.string())` **accepts**
`{known:true, value:"x"}` with no `source` at all and **rejects**
`{known:true, value:"x", source:"brief"}` — precisely the nested-`value` shape §17A.1 forbids for a
`SourcedOrAbsent` leaf. `shared.test.ts:16` (C1(b), the only test naming `sourcedOrAbsent`) calls
exactly that branch: probe **M-G** collapses the union-member extension into the fallback and C1(b)
stays green. 37 proposition tests do redden under M-G, so the mechanism is covered indirectly — the
row is weak, not the schema. Authority: intention §17A.1; `12-anti-patterns.md` "Data and
validation" (silent defaulting); charter rule 15. **Correction:** make a non-union argument a
compile-time or construction-time failure rather than a silent shape change, and re-point C1(b) at
a real source-union leaf.

### Notes

**N1 — int64 execution seam: loud but late, no silent corruption** (the prompt's required
cross-phase probe). Phase 5 accepts content ids to `9223372036854775807` per C3(i) and §17A.4.
`src/lib/proposales/mappers.ts:37` converts with `Number(block.contentId)`, which does **not**
preserve the identifier: `Number("9223372036854775807")` → `9223372036854776000` (P3b); the first
corrupting value is `9007199254740993` → `9007199254740992` (P3d). However
`createProposalRequestSchema` declares `content_id: z.number().int()`, and Zod 4's `.int()` is
safe-integer bounded, so the converted value is **rejected at request parse** with
`too_big: expected int to be <=9007199254740991` (P3c, P3e). Because `Number(x) ≥ 2^53` for every
`x > MAX_SAFE_INTEGER`, there is **no silent-corruption window** — every id phase 5 accepts above
2^53−1 fails loudly before reaching Proposales; the read-back path (`mappers.ts:114`,
`schemas.ts:95`) fails the same way as `schema_mismatch`. Actual consequence: a proposition phase 5
declares structurally valid is unexecutable, surfacing at execution as an integration/internal
schema failure rather than at proposition validation (§17A.13 precedence). Unreachable with real
Proposales ids (6 digits; fixture `188485`). **Not a phase-5 defect** — phase 5 implements the
ratified contract exactly, and I neither narrowed the phase-5 contract nor changed production code.

**N2 — `ConsequentialLeafDescriptor.seed` is dead scaffolding.** Declared at
`fixtures/propositions.ts:9`, populated on all 15 descriptors, never read anywhere under `src/`.
Charter rule 4. Delete it or give it a consumer.

**N3 — `leafInferred`'s `commercialAssumptions` special case is a redundant branch.**
`fixtures/propositions.ts:119–121` builds `{value, source}`, identical to what `wrapper: "bare"`
already yields at line 118; all three assumption descriptors are `wrapper: "bare"`, so the branch
cannot change any outcome.

**N4 — C6(b)–C6(h)'s trim half asserts `title`, not their own field.**
`proposition.test.ts:228–230` re-runs the same `title` trim assertion inside every one of the eight
parametrised rows, while plan C6(a–h) expects `"  x  "` → `"x"` per field. Seven of eight trim
halves are decoration. Contained: `boundedText` is one shared builder whose trim is exercised.

**N5 — C8(a)'s `Set` comparison cannot see a duplicate entry.**
`provenance-projection.test.ts:20`. The plan row asks only for a path *set*, so the test matches its
row; I verified the property independently instead (P2c): 26 entries, 26 unique, no duplicates,
`source` and optional `ref` preserved verbatim.

**N6 — carried, not a finding.** `contentCandidateSchema` ships with no behavioral test per the
plan Notes; `11-testing-principles.md` §3 is deliberately deferred to phase 7 C7(d).

## Verified-correct surfaces

- **Perimeter and counts** exactly as declared; no drift, no undeclared file.
- **Consequential-leaf independence.** Two fresh mutant *shapes* the implementer did not use:
  **M-A** (term assumption member → `presentational`) reddens only C2(m); **M-B**
  (`recipient.phone` → `presentational`) reddens only C2(d). 14 siblings green each time — the
  phase-4 N6 fold is satisfied, and no DRY collapse is possible without a red row.
- **Source policies, structurally.** The content member requires `ref` and `ref.variationId`
  (`shared.ts:44–50`); `turnId ⇒ quote` is applied to the `human` member only (`shared.ts:53–62`);
  `refSchema` is unrefined (`shared.ts:26–32`); every production leaf extends the real source-union
  members — no nested `value`, no parallel source representation.
- **Strictness at every depth.** No `z.object` anywhere in the feature; 14 unknown-key cases all
  reject (P5a), including `ref`, both sourced-leaf shapes, `Money`, and a `{known:false}` variant
  carrying an extra `value`.
- **Provenance boundary.** `warnings[].text` is projected; `before`/`after` are never traversed
  (P2b); an own `source` key inside a warning payload is rejected at depths 1–4 and inside arrays
  (P2a); the flat projection is 26 entries with `source` and optional `ref` preserved and no
  duplicates (P2c); numeric index ordering is correct beyond blocks — 11 commercial notes and 12
  assumptions (P2d). `known:false` is explicit and yields no projected entry.
- **Int64 form rule.** `positiveInt64StringSchema` rejects `0`, `01`, `9223372036854775808` and
  accepts the maximum by equal-length lexical comparison — correct for canonical decimals.
- **Runtime boundaries.** `schemas/` and `fixtures/` runtime-neutral; `import "server-only"` is the
  first line of the projector alone (`02-runtime-boundaries.md` §3); the feature stays under
  `src/features/proposal-preparation/` (`03-feature-architecture.md` §1–2); no fetch, `process.env`,
  persistence, or external-integration edge introduced (`07`, `09`, `10`). No new client/server edge.

## Evidence

| Scope | Hypothesis | Command | Tree identity | Result |
|---|---|---|---|---|
| L4 (the one review stamp) | current tree is green before any probe | `npm test` | `8f3516f`, `git status --porcelain` empty, dirty-diff digest `e3b0c442…7852b855` (empty) | 15 files / 224 tests passed; failure-ID delta ∅ → ∅ |
| cited, not re-run | implementer targeted run, typecheck, lint | — | production tree matches `32435e5` | consumed by citation |
| L1 | probes P1–P6 and mutants M-A…M-G | `npx vitest run --project node <phase test file \| feature dir>` | as recorded per probe | as recorded per finding |

Applicable contracts routed via `architectural_contracts/01-implementation-contract-guide.md`:
`02` §3, `03` §1–4, `06` §1–4 and 6–7, `08` §4 and 6–7, `11` §2–3 and 5, `12` (Data/validation,
Integrations, Structure), `13`, `14` §8. No documentation became false: the phase adds schemas and a
pure projection; no feature README exists.

## Full write perimeter

- `plans/phase-05-proposition-and-provenance.md` — appended one Review-log entry (technical layer only)
- `master-plan.md` — tracker row 5 only, `REVIEWING` → `CHANGES_REQUESTED`
- this handoff file

No production or test source was modified. No approval commit created. No architecture graph exists
(skipped). No database or persistent state in scope.

## Probe declaration

Seven applied-and-reverted mutation probes, each reverted with `git checkout --`:

| Probe | File | Shape | Observed |
|---|---|---|---|
| M-A | `schemas/proposition.ts` | `term` assumption member → `sourceBounded` | C2(m) red; C2(a–l,n,o) green |
| M-B | `schemas/proposition.ts` | `recipient.phone` → `sourceBounded` | C2(d) red; 14 siblings green |
| M-F | `schemas/proposition.ts` | note `text` cap removed entirely | all 8 C6 rows **green** (S1) |
| M-G | `schemas/shared.ts` | union-member extension collapsed into the fallback | C1(b) **green**; 37 proposition tests red (S3) |
| M-C | `server/domain/provenance-projection.ts` | drop `block.description` from the traversal | C8(a) red |
| M-D | `server/domain/provenance-projection.ts` | numeric comparator branch → `return 0` | all 4 C8 rows **green** (S2) |
| M-E | `server/domain/provenance-projection.ts` | `entries.sort(...)` removed | all **61** phase tests **green** (S2) |

Restoration verified byte-identical by SHA-256 against pre-probe digests:
`proposition.ts 6b17c59b…`, `shared.ts 063da0ba…`, `provenance-projection.ts ad89ee73…` — all `OK`.
One temporary probe file, `src/features/proposal-preparation/zzz-reviewer-probe.test.ts`, carried
probes P1–P6 across three runs and was deleted. Final `git status --porcelain` is empty apart from
the two documentation writes and this handoff.

## Carry-forward dispositions

| Item | Disposition |
|---|---|
| S1, S2, S3 | fix cycle, phase 5 round 2 — test-side for S1/S2, test + builder for S3 |
| N2, N3, N4, N5 | phase 5 round 2, alongside the should-fix work (all in the same three files) |
| N1 (int64 execution seam) | **phase 13** (approval validation) — the natural place to reject at approval a `contentId` outside the transmissible range, or to record the limit; phase 14 owns the execution-side error classification if the coordinator prefers it there. Not phase 5. |
| N6 (`contentCandidateSchema` untested) | phase 7 C7(d), as already planned |
| Phase-4 N5, N6 | unchanged by this review; N6's fold is satisfied here (see M-A/M-B) |

## Lessons for the plans

1. **A row whose fixture replaces a *wrapper* instead of the *field the row names* is the
   guard-that-cannot-fail shape in its most common disguise.** C6(a–h) should state, per row, that
   the wrapper stays valid and only the bounded value crosses the cap.
2. **A criterion over an ordering mechanism cannot be discharged by a pairwise index comparison when
   the unsorted insertion order already satisfies it.** The row must assert a sequence that differs
   from insertion order, and the mutation ledger needs a *make the comparator a no-op* mutant beside
   the *replace the comparator* one — only the former distinguishes the sort from the traversal.
3. **A shared builder with a silent structural fallback needs a criterion on the fallback, or no
   fallback at all.** An untyped `as any` escape hatch is where a later phase quietly acquires a
   shape the intention forbids.
