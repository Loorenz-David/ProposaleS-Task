---
plan: 5
role: projection
round: 0
verdict: AMENDMENTS_REQUIRED
date: 2026-09-05
actor: Claude (Opus 5, 1M context)
---

# Phase 5 projection — round 0

## Opening (for the owner)

I did the implementer's first hour of phase 5 on paper, from the plan and its cited
documents alone, and checked every claim against the real code. The plan is sound in
shape — the schema design, the rule that "the model guessed this" cannot be written on a
consequential field, and the list of fields that rule protects are all correct and well
grounded. But it is not yet buildable as written: twenty-two points need a decision the
plan does not make, and four of them are arithmetic or mechanical impossibilities that
would stop the implementer within the first hour or, worse, be silently improvised.
Three of the phase's tests, as specified, cannot fail — they would pass against a broken
implementation — which is the exact defect family this project has paid for repeatedly.
None of this is a rethink; it is a set of paragraph-level corrections to one plan file.
One item needs you personally, and it is small: a sentence in the ratified intention
contradicts itself about the recipient, and the correction changes nothing about what
gets built.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Confirm how the recipient's provenance is recorded

**Question.** The ratified provenance section says two different things about the
recipient in the same paragraph. Confirm the reading the build has been using?

**Story.** A brief gives you a client's email; later, on the phone, the client gives you
a different phone number, and you type it in. When you review the proposal, you want to
see "email: from the brief" and "phone: you typed it" as two separate facts, because
those are two different levels of confidence. The alternative reading would stamp one
single label on the whole recipient block — so the moment you correct one field, the
whole contact looks like something you personally vouched for, including the email you
never checked.

**Branches.**
- **Per-field (what the build already assumes):** each of the five recipient fields
  carries its own origin; the recipient block itself carries only "present / not
  present". Nothing needs rebuilding.
- **Whole-block:** one origin label for the recipient as a unit. Contradicts the same
  paragraph's own "each of its five fields does", and loses the distinction above.

**Recommendation.** Per-field. It is what the paragraph's own explanation argues for,
what the shared plan already records, and what the rest of the design depends on.

**On silence.** The gate holds on correcting the intention's wording; phase 5 may still
be implemented under the per-field reading, which is already the standing recorded
authority. Nothing is guessed.

**Trace.** Intention §17A.4 (consequential-leaf table row 1 vs. "Granularity is the leaf,
never the object"); master plan §6.4 `recipientLeavesSchema`; phase-5 plan Notes bullet 3;
C2 leaf count (15).

## Decision ledger

Twenty-two points where the artifacts do not determine the implementer's next decision.
`plan gap` → amend the phase-5 plan (or master plan §6, where the registry owns it).
`intention gap` → route upstream. `free choice` → grant explicitly in writing.

| # | Decision point | Class | Proposed routing |
|---|---|---|---|
| D1 | `CONSEQUENTIAL_LEAF_PATHS` cannot hold 15 distinct paths — three C2 rows share one path | plan gap | amend C2 / task 5 (F1) |
| D2 | `leafInferred(path)` cannot build the 15 fixtures from a path alone | plan gap | amend task 5 (F2) |
| D3 | MUT-05-1a…1o need 15 independently applicable construction sites | plan gap | amend task 3 + C2 mutation cell (F3) |
| D4 | MUT-05-5 as written cannot redden C5(e) | plan gap | amend C5(e) mutation cell (F4) |
| D5 | C8(b) (`sorted`) has no mutation and no fixture that can distinguish the specified order | plan gap | amend C8(b) + task 5 (F5) |
| D6 | C8(a) samples three entries for a row named "covers every sourced leaf" | plan gap | amend C8(a) (F6) |
| D7 | `warningSchema`'s `before` / `after` / `path` / `reason` field types are undetermined, and the projection walks them | plan gap (+ upstream question) | amend task 3 (F7) |
| D8 | `validProposition()`'s full required shape is unspecified while four criteria depend on it | plan gap | amend task 5 (F8) |
| D9 | Eight identifiers phase 5 introduces are not in the master-plan naming registry | plan gap | coordinator adds to §6 before dispatch (F9) |
| D10 | `contentId` form ("positive int64", §17A.4) is not realized by any schema or criterion | plan gap / conflict | amend §6.4 + add a C-row, or amend §17A.4 (F10) |
| D11 | `alternatives[i].reason` has no named character cap anywhere, yet C6 asserts one | plan gap | name the constant in §6.5 (F11) |
| D12 | `refSchema` cannot carry the `turnId ⇒ quote` refinement and still be extended | free choice (one right answer) | record the construction (F12) |
| D13 | `sourcedOrAbsent(leaf)` cannot be built by spreading a discriminated union | free choice (one right answer) | record the construction (F13) |
| D14 | C2's expected outcome is directionally wrong and type-mismatched against real Zod issue paths | plan gap | amend C2 (F14) |
| D15 | C1(c)'s expected outcome is a disjunction (charter rule 2) | plan gap | amend C1(c) (F15) |
| D16 | `content-candidate.ts` ships in phase 5 with no test and no criterion | free choice | delegate explicitly or move to phase 7 (F16) |
| D17 | `.finite()` is a deprecated no-op in the installed Zod | plan gap (minor) | amend task 1 (F17) |
| D18 | C6(i) duplicates C1(d) | plan gap (minor) | cut one row, re-derive counts (F18) |
| D19 | Source-subset coverage is sampled, not enumerated | free choice | record the exclusion in the plan Notes (F19) |
| D20 | Intention §17A.4 contradicts itself on recipient granularity | intention gap | owner card 1 → lettered clarification |
| D21 | Master plan §7.3's crit-23 note cites a row letter that is not the currency row | plan gap (coordinator artifact) | correct §7.3 (F21) |
| D22 | C8(b)'s trace cites §17A.10, which governs the approval diff, not the projection | trace defect | amend the trace cell (F22) |

## Findings

Every finding names the exact artifact and line. Line numbers are
`plans/phase-05-proposition-and-provenance.md` unless stated.

### Blocking — the plan is not executable as written

**F1 — `CONSEQUENTIAL_LEAF_PATHS.length === 15` is unsatisfiable by a list of paths.**
Line 50 enumerates 15 C2 leaves, but three of them —
`commercialAssumptions.0.statedValue` for kinds `deadline`, `term`, and
`scope_commitment` — are **the same path**. Only 13 distinct paths exist. Line 38 asserts
the exported list "must have 15 entries". An implementer will either drop to 13 entries
(losing three mutation targets and contradicting the C2 header) or invent a synthetic
path segment. Amendment: make the exported list a list of 15 **leaf descriptors**
(`{ path, kind? }`), not paths, and assert on that list.

**F2 — `leafInferred(path)` cannot build the C2 fixtures "mechanically" (line 38).** The
15 leaves are not uniform in three independent ways, none derivable from a path string:
(i) the value type differs per leaf — `string`, `number`, `boolean`, `Money`, an ISO-4217
code, the `including_tax|excluding_tax|unstated` enum, and `z.literal(true)`; (ii) some
leaves are wrapped in `sourcedOrAbsent` (`quantity`, `optional`, `amount`, `currency`,
the recipient's five, `emptyDraftConfirmation`) and some are bare (`contentId`,
`taxBasis`, `statedValue`), so the fixture shape is `{ known: true, value, source }` for
one set and `{ value, source }` for the other (master plan §6.4); (iii) the three
assumption rows additionally need a `kind`. Without a per-leaf descriptor table, the
helper will produce fixtures that fail parse **for the wrong reason** — a type error, not
the source — and C2 still reads green. The 15 mutations are what would eventually expose
this, at a full fix cycle's cost. Amendment: fold the value and wrapping into the
descriptor list from F1.

**F3 — MUT-05-1a…1o require 15 independently applicable construction sites; the natural
implementation collapses eight of them into two.** Line 50 says the mutation admits
`inferred` "only at the corresponding leaf's schema construction". The five recipient
leaves share one specification (`sourcedOrAbsent(consequential(string, [brief, human]))`,
master plan §6.4 `recipientLeavesSchema`), and the three assumption kinds share another
(`consequential(string, [brief, human])`). Any implementer writing idiomatic code hoists
each into one constant — after which MUT-05-1a…1e are one mutation and MUT-05-1l…1n are
one mutation, and the ledger reads 15 while proving 8. This is master rule 14 / phase-4
N6 recurring one phase after it was folded in. Amendment: state in task 3 that each
consequential leaf is constructed at its own call site, and say why, so the constraint
survives a later "DRY-up" refactor.

**F4 — MUT-05-5 cannot redden C5(e).** Line 64: "`proposition.ts` · `taxBasis` ·
`.default("unstated")` → C5(e) red". `taxBasis` is `consequential(enum, [brief, human])`
— its parsed value is `{ value, source, ref? }`, not a bare string. `.default("unstated")`
on that union is a type error; `.default("unstated")` on the **inner** enum type-checks
but changes nothing, because C5(e)'s failing half is a *missing `taxBasis` key*, and an
inner default cannot supply the surrounding leaf object. Either way the mutation does not
bite, so the row it is supposed to prove is unproven. Amendment: the mutation is
`.default({ value: "unstated", source: "brief" })` on the `taxBasis` field of
`commercialNoteSchema`.

### Guards that cannot fail (charter rule 15; §9.0 "a guard that cannot fail is a decoration with a correct name")

**F5 — C8(b) "sorted" is untestable as specified.** Line 70's expected outcome is
"`paths` equal their sorted copy", with an empty fixture cell (so, `validProposition()`)
and no named mutation. Task 4 (line 37) specifies a non-trivial comparator — "segment-wise,
indices numerically". Two problems compound: (i) `validProposition()` has one block, one
note, one assumption (line 38), so no array index ≥ 10 exists and the specified comparator
is indistinguishable from JavaScript's default lexicographic sort — the one difference the
comparator exists to create is unreachable by the fixture; (ii) "equal their sorted copy",
if the test sorts with the module's own comparator, is `assert f(x) == f(x)`. Ordering is
on charter rule 6's silent-failure list and this row is the phase's only guard on it.
Amendment: give the row a fixture with ≥ 11 blocks (or an explicit expected path
sequence), and add a named mutation replacing the comparator with a default
`Array.prototype.sort` → C8(b) red.

**F6 — C8(a) "covers every sourced leaf" asserts three examples.** Line 69 asserts entries
exist "including `blocks.0.contentId`, `recipient.value.email`,
`commercialNotes.0.taxBasis`". A projection that silently omits
`commercialAssumptions[0].statedValue`, `blocks[0].title`, `blocks[0].description`, or
`blocks[0].alternatives[0].reason` — the leaves reached by the *deepest* parts of the walk,
and therefore the ones most likely to be missed — passes this row. There is no named
mutation. Charter rule 2 ("enumerate, never sample") applies to the expected output.
Amendment: once F8 pins the fixture, assert the **exact** projected path list, and add a
mutation that stops the walk descending into `alternatives` → C8(a) red.

**F7 — `warningSchema`'s payload fields are undetermined, and phase 5's own projection
walks them.** Task 3 (line 36) creates `warningSchema`; master plan §6.4 gives only key
names (`{ kind, text, path?, before?, after?, reason? }`) and no types for
`before` / `after` / `path` / `reason`. Intention §17A.9 says an override warning names
"the previous value and the new one" — if those carry **leaf objects**, they carry a
`source` key, and task 4's generic walk ("every leaf carrying `source`") will emit
provenance entries for warning payloads: paths that are not leaves of the proposition,
polluting the projection and quietly satisfying nothing. No criterion covers
`warningSchema` at all. Amendment: fix the four field types in task 3 (recommendation:
`path: pathSchema`, `reason: boundedText(...)`, and `before`/`after` as the **bare value**,
not the leaf object, which also keeps §17A.10's logging rule easy to honour), and state
whether `projectProvenance` walks `warnings` at all.

### Reality and decidability

**F8 — `validProposition()`'s required shape is unspecified while four criteria depend on
it.** Line 38 names four properties (one block, recipient known with email from brief, one
note, one assumption). `propositionSchema` is strict with ~15 required top-level keys
(master plan §6.4), and the criteria impose more: C4(e) needs
`blocks[0].alternatives[0].reason`; C8(a) needs a known `commercialNotes[0].taxBasis`;
C8(c) needs `blocks[0].quantity` known in the base fixture so it can be overridden to
`{ known: false }`; C2 needs every one of the 15 leaves present and overridable. The
implementer must invent the rest, and every later phase inherits the invention (the plan's
own Goal calls it "the reusable fixture every later phase uses"). Amendment: enumerate the
fixture's required inventory in task 5.

**F9 — eight identifiers are not in the naming registry.** Master plan §6 states: "Every
identifier below is fixed. A session that needs a name not listed here adds it **to this
section** (via the coordinator) before using it." Absent from `master-plan.md`:
`propositionSourceSchema`, `boundedText`, `positiveFiniteNumberSchema`, `warningSchema`,
`matchStrengthSchema` (task 1–3), and `validProposition`, `leafInferred`,
`CONSEQUENTIAL_LEAF_PATHS` (task 5). Separately, §6.7's `fixtures/propositions.ts` row
names `propositionWithAlternatives()` and `maximalConformingProposition()` — both created
in **phase 10** (`plans/phase-10-conversation-context.md` line 44), so §6.7 currently
describes that module without mentioning anything phase 5 puts in it. Also line 38 says
`CONSEQUENTIAL_LEAF_PATHS` is exported "from the test module" without saying which of the
three. Amendment: coordinator registers the eight names and identifies the home module
before dispatch.

**F10 — `contentId` form is stated in the intention and realized nowhere.** Intention
§17A.4 (line 618): "It is checked for form (positive int64) and source." Master plan §6.4
gives `contentId: consequential(string, [proposales_content, human])` — a plain string —
and no phase-5 criterion covers its form. Phase 9 independently validates `/^\d+$/` on the
`get_content` tool input (`plans/phase-09-agent-runtime.md` line 36), so the two places
that constrain the same identifier disagree. Amendment (coordinator's choice, both are
one line): add the form constraint to §6.4 plus a C3 row, or amend §17A.4 to say the form
is checked at the tool boundary only. This is conformance to already-ratified text, not a
new decision.

**F11 — `alternatives[i].reason` has no named cap, but C6 asserts one.** C6(a–i) (line 67)
includes `blocks.0.alternatives.0.reason` "at cap+1". Intention §17A.16's enumerated list
of capped free-text fields does not include it, and master plan §6.5 has no matching
`MAX_*` constant. The implementer must invent both a name and a value — a binding registry
entry created silently. Amendment: name it in §6.5 with its "positive int" contract.

**F12 — `refSchema` cannot carry its refinement and be extended.** Verified against the
installed `zod@4.5.4`: `baseRef.refine(...).extend({ variationId: z.string() })` throws
`Cannot overwrite keys on object schemas containing refinements. Use ".safeExtend"`.
Master plan §6.4 asks `refSchema` for both the `turnId ⇒ quote` refinement (C1(e)) and a
`variationId`-required form for `proposales_content` members (C1(c)). Recommended
construction, verified to produce the exact paths both rows want: keep `refSchema`
unrefined; put the `turnId ⇒ quote` check on the `human` member with
`{ path: ["quote"] }` (observed issue path `["ref","quote"]`, code `custom`), and build
the content member's ref as `refSchema.extend({ variationId: z.string() })`. Record as a
granted delegation if the coordinator prefers not to prescribe.

**F13 — `sourcedOrAbsent(leaf)` cannot be built by spreading.** Master plan §6.4 describes
it as wrapping a leaf as `{ known: true, …leaf } | { known: false }`, but `leaf` is a
`z.discriminatedUnion` and cannot be spread into an object shape. Verified working shape
in `zod@4.5.4`:

```
z.discriminatedUnion("known", [
  z.discriminatedUnion("source", leaf.options.map(o => o.extend({ known: z.literal(true) }))),
  z.strictObject({ known: z.literal(false) }),
])
```

It parses `{ known: true, value, source }` and `{ known: false }`, and a missing key issues
at exactly `["q"]` — which is what C1(b) (line 46) asserts, so that row is confirmed
decidable. Record the construction or grant the choice explicitly; §6.4's current wording
invites a wrong shape.

**F14 — C2's expected outcome is backwards and type-mismatched.** Line 50 expects "an
issue path is a prefix-match of the leaf path". Verified against `zod@4.5.4`: for
`source: "inferred"` on `blocks[0].quantity`, the single issue is
`{ path: ["blocks", 0, "quantity", "source"], code: "invalid_union" }`. Two corrections:
the **leaf path is a prefix of the issue path**, not the other way round; and the array
index arrives as the **number** `0`, while `pathSchema` (`src/lib/values/path.ts:3`) and
intention §17A.1 use the decimal **string** `"0"` — a naive segment comparison fails on
`0 !== "0"`. An implementer hitting this will normalize silently, and whichever direction
they choose, the row's stated assertion is not the one that ships. Amendment: state the
exact expected issue path per row (`[...leafPath, "source"]`, with `String()` normalization
of index segments), or assert the issue path's `code` and prefix explicitly.

**F15 — C1(c) states a disjunction of outcomes.** Line 47: "fails at `["ref"]` **or**
`["ref","variationId"]`". Charter rule 2 forbids exactly this ("an assertion accepting a
disjunction of outcomes hides mislabeling"). The two outcomes are not ambiguity — they are
two different fixtures, verified: no `ref` key at all → `["ref"]` (`invalid_type`);
`ref: {}` → `["ref","variationId"]` (`invalid_type`). The plan's own fixture
(`{ value: "x", source: "proposales_content" }`) gives `["ref"]`. Amendment: pin
`["ref"]`, or split into two rows and re-derive the counts.

**F16 — `content-candidate.ts` ships untested.** Task 2 (line 35) creates
`matchStrengthSchema` and `contentCandidateSchema`; the file perimeter (line 30) contains
no `content-candidate.test.ts` and no criterion mentions either symbol. First exercised in
phase 7 C7(d) and phase 9 C6(c) — two approved gates later. This may well be the right
call (the schema is a type other phases need early), but it is currently a silent choice.
Amendment: either grant it in writing in the plan Notes, or move the file to phase 7.

**F17 — `.finite()` is a no-op.** Task 1 (line 34) prescribes
`positiveFiniteNumberSchema = z.number().finite().positive()`. In the installed
`zod@4.5.4`, `finite()` is documented in the type declarations as
`@deprecated In v4 and later, z.number() does not allow infinite values by default. This
is a no-op.` (`node_modules/zod/v4/classic/schemas.d.cts:349`). Verified: `z.number()`
rejects both `NaN` and `Infinity`. The call is dead code no mutation can redden.
Amendment: drop `.finite()`. C7's `NaN` and `Infinity` rows stay — they assert our
schema's contract, not Zod's behaviour, and are the reason a later widening would be
caught.

**F18 — C6(i) duplicates C1(d).** Line 48 (C1(d)) and line 67 (C6, `ref.quote` at cap+1)
assert the same thing about the same field. One is purchased surface against no additional
objective. Amendment: cut one and re-derive the counts (61 → 60 rows).

**F19 — source-subset coverage is sampled without saying so.** C3 checks 4 of the leaf ×
inadmissible-source pairs. Never checked: `proposales_content` on any of the five
recipient leaves, on `commercialNotes.currency` / `.taxBasis`, or on
`commercialAssumptions.statedValue`. A schema admitting `proposales_content` on
`recipient.value.email` passes every phase-5 criterion. Under §9.0 this is legitimate
trimming — "exhaustive enumeration where a representative subset carries the same proof"
— but §9.0 also requires that every exclusion be recorded where the excluded work lives.
Amendment: one line in the plan Notes recording the sampling and its reason. (If the
coordinator prefers a cheap strengthening instead: one row putting `proposales_content` on
a recipient leaf, whose mutation is already MUT-05-1a's neighbour.)

**F21 — master plan §7.3's crit-23 note cites the wrong row.** `master-plan.md` §7.3 reads
"5.C5(d) currency representable"; the plan's C5(d) is the note-**amount** Money row, and
its currency rows are C5(c) (no block currency, which does trace crit 23) and C5(f) (note
currency, which traces only §17A.16). Both §7.2 and §7.3 are declared "derived from the
trace cells", so this is a derivation that drifted. Amendment: correct §7.3, and consider
adding `crit 23` to C5(f)'s trace cell.

**F22 — C8(b)'s trace resolves to a section that says something else.** Line 70 traces to
"§17A.10 (total order)". §17A.10's total order governs the **approval diff**
(`computeApprovalDiff`, phase 13), not the provenance projection; §17A.4, which owns the
projection, states no ordering at all. This is the void-symbol shape: a trace cell that
resolves, to an entry that does not support the row. Amendment (recommendation): keep the
sort as a phase-level design decision — it is display material, and adding it to the
ratified intention buys nothing — and change the trace cell to cite §17A.4 plus a plan
Note recording that the projection's order is this plan's decision. Do not leave the
§17A.10 citation standing.

## Reality checks that passed

Recorded so the coordinator does not re-run them.

- **Gate.** Intention header `RATIFIED` (2026-09-05, owner, §21.4 surface, §23 round 12).
  Tracker rows 1–4 `APPROVED`; row 5 `NOT_STARTED` with the mandatory projection note.
  Phase-5 Review log carries the `Coordinator pre-projection fold`. Phase 4 `APPROVED`
  (the plan's stated dependency).
- **Counts re-derived, not read.** Criteria = 8 (C1–C8). Rows = 5 + 15 + 8 + 7 + 7 + 9 +
  6 + 4 = **61**. Named mutations = 15 (MUT-05-1a…1o) + 4 (MUT-05-2…5) = **19**. All three
  match line 74 and the tracker. (F18, if applied, moves rows to 60.)
- **Every Read-first citation resolves and says what the plan claims it says.** Master plan
  §5 R1, §6.4 (all seven named schema rows present), §6.5 (text caps, `MAX_BLOCKS`,
  `MAX_ALTERNATIVES_PER_BLOCK`), §6.3 (the ten warning kinds), §6.8, §9 rule 1. Intention
  §17A.1, §17A.4, §17A.5 ("never store 1 or false", line 635), §17A.12 (input-side
  quantity rule, line 821), §17A.16, §8.3, §9.2, §7 (Proposition, Provenance, Assumption,
  Warning all defined). Contracts `06` §1/§3/§4/§6/§9, `08` §4 and §6 (the rejection rule
  is there, "any assumption on a consequential path MUST be rejected"), `03` §1–§2
  (`schemas/` "Runtime contracts (Zod). Shared. Runtime-neutral."), `12` "Data and
  validation". Phase-2 and phase-4 Review logs exist; phase-4 N6 is the fold this plan
  already absorbed.
- **File perimeter.** All 8 files are new and correctly declared new — `src/features/`
  does not exist in the tree. The count "8 new files" is correct.
- **Prior-phase outputs verified in the code, not assumed.** `knownOrAbsentSchema`
  (`src/lib/values/absence.ts:3`), `pathSchema` (`path.ts:3`), `moneySchema` and
  `currencyCodeSchema` (`money.ts:3-4`), `isoTimestampSchema` (`timestamp.ts:3`),
  `uuidV4Schema` / `UUID_V4_PATTERN` (`uuid.ts:3-4`) all exist and have the shapes §6.4
  claims. `moneySchema` is `.strictObject` with `amountMinor: z.number().int()`, so
  C5(d)'s `12000.5` row is decidable as written.
- **Test collection.** `vitest.config.mts` node project already includes
  `src/features/**/*.test.ts`, so phase 5's three test files are claimed. The §10.3
  "include globs do not partition the tree" hazard does not fire for this phase.
- **Lint boundaries.** `eslint.config.mjs` restricts `src/**/schemas/**` from `react`,
  `next/*`, `@/lib/env/*` and `server-only`. Phase 5's schema files import only
  `@/lib/values/*` and `zod` — compliant. `server/domain/provenance-projection.ts` must
  begin `import "server-only";` per master plan §6.1; `fixtures/propositions.ts` must not.
- **Trace chain, both directions.** Every phase-5 trace cell resolves (F22 is the single
  exception). Every ledger entry §7.2 assigns to phase 5 — M1 (5.C2, 5.C5), M9 (5.C1),
  M10 (5.C2, 5.C3, 5.C4) — is served by at least one row. Intention §22 criteria 2, 20,
  22, 23 map onto C2 and C5 as §7.3 claims (F21 is a row-letter error inside §7.3, not a
  missing obligation).
- **C6 trim semantics.** `z.string().trim().min(1).max(N)` applies the cap **after**
  trimming (verified), so C6's "cap+1" fixtures must be cap+1 non-whitespace characters and
  `"  x  "` → `"x"` holds. Both halves of the row are decidable.

## Evidence and write perimeter

**Method.** Source inspection plus three read-only probes against the installed
`zod@4.5.4`, run from scratch files outside the repository
(`…/scratchpad/probe.mjs`, `probe2.mjs`), importing zod by absolute path. **L4 budget
consumed: 0**, as instructed. No test suite was run; no repository file was read for
mutation and none was written.

**Full write perimeter of this session:** exactly one file —
`build_docs/under_constroction/initial_core_feature_proposales/handoffs/reviewer/phase-05-projection-round-0.reviewer.md`.
No source, plan, intention, master plan, tracker, or Review log was modified. The
tracker row and the phase-5 Review log line are the coordinator's to write when it
consumes this handoff.

**Non-authoritative note on the skeleton.** Per projection doctrine the paper skeleton is
discarded and is deliberately not attached. Findings F12, F13, F14 and F15 quote the
minimum construction detail needed to make the finding actionable; they are corrections to
the plan, not guidance to the implementer, and the implementer should receive them only
through whatever the coordinator folds into the plan file.

## Exit gate

Verdict **AMENDMENTS_REQUIRED**. The implementer prompt should not be compiled until every
ledger row is routed: F1–F4 are blocking; F5–F7 close guards that cannot fail; F8–F11 and
F14–F15 remove silent freedom; F12, F13, F16 and F19 need an explicit delegation or a
one-line record; F17, F18, F21 and F22 are corrections; D20 is owner card 1 and does not
block phase 5. Two consecutive empty ledgers would demote this gate — this is not one of
them.
