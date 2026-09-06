---
plan: 5
role: implementer
round: 2
date: 2026-09-06
project: initial_core_feature_proposales
phase: Proposition schema and structural provenance (fix cycle)
---

# Session prompt — phase 5 fix round 2

You are the **implementer** for the finding-scoped Phase 5 repair in
`/Users/davidloorenz/Desktop/Developer/Proposales` on `main`. The first independent review
returned `CHANGES_REQUESTED`.

Read and follow `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
`/Users/davidloorenz/agent-skills/implementation-executor.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Apply the repository
`architecture-context` skill before changing code: read the skill, policy, and contract guide,
then the applicable contracts. The phase plan remains the task list; where this prompt differs,
the plan wins.

**Resolve, do not relitigate. Add nothing beyond the findings below.** The reviewer verified
the proposition semantics, source policies, strictness, warning boundary, feature/runtime
placement, and declared perimeter as correct. The owner has authorized coordinator validation
after this fix instead of another independent review session; that does not relax this fix's
evidence or checkpoint requirements.

## 1. Gate check

Stop and report without editing if any condition fails:

1. The intention header is `RATIFIED`.
2. Master-plan tracker row 4 is `APPROVED`; row 5 is `IMPLEMENTING` and says fix round 2 is
   dispatched.
3. The reviewer handoff
   `handoffs/reviewer/phase-05-round-1.reviewer.md` has verdict `CHANGES_REQUESTED`, exactly
   0 blocking and 3 should-fix findings.
4. The phase plan contains the round-1 implementation entry and the round-1 reviewer entry;
   no production correction from this cycle is already present.

Record `git status --porcelain`. Do not gate on a clean worktree. The reviewer handoff, this
prompt, tracker dispatch state, and review-log entry are coordination artifacts; do not modify,
stage, or report them as implementation drift. Preserve `tsconfig.tsbuildinfo`, all frontend
worktree files, and unrelated user work.

## 2. Read order

1. The executor doctrine and charter above.
2. `plans/phase-05-proposition-and-provenance.md` in full, including its review log.
3. `handoffs/reviewer/phase-05-round-1.reviewer.md` in full; its corrections below are quoted
   verbatim and binding.
4. `master-plan.md` §§4–6.8, §9 rules 1 and 14, §11 follow-up 10, and the tracker row.
5. The ratified intention §§17A.1, 17A.4–17A.5, and 17A.16; contracts
   `02-runtime-boundaries.md` §3, `03-feature-architecture.md` §§1–4,
   `06-data-contracts-and-validation.md` §§1–4 and 6–7,
   `08-agent-architecture.md` §§4 and 6–7, `11-testing-principles.md` §§2–3 and 5,
   applicable `12-anti-patterns.md` sections, `13-decision-checklist.md`, and
   `14-documentation-principles.md` §8.

## 3. Required corrections

Resolve S1–S3 exactly. These reviewer corrections are quoted verbatim:

- S1: “set `.text.value`, keep the wrapper valid, and assert issue code `too_big` at path
  `[\"commercialNotes\",\"0\",\"text\",\"value\"]`.”
- S2: “assert the full projected **sequence**, not a set or a pairwise index. Probe P6a records
  the sorted sequence for `validProposition()` — `agentRationale, assumptions.0.note,
  blocks.0.alternatives.0.reason, blocks.0.contentId, …` — and confirms it differs from
  insertion order at the top level, so a sequence assertion reddens under both M-D and M-E.”
- S3: “make a non-union argument a compile-time or construction-time failure rather than a
  silent shape change, and re-point C1(b) at a real source-union leaf.”

Implement their direct implications:

- C1(b) must exercise `sourcedOrAbsent` with a real sourced union; assert the sourced known arm
  and explicit absent arm, and make a non-source-union argument fail at construction. No silent
  fallback or `as any` escape hatch may produce `{ known: true, value }` without provenance.
- C6(d) must mutate only the inner text value of an otherwise valid commercial-note wrapper. In
  every C6 row, make the trim assertion exercise that row's own field rather than repeatedly
  asserting the title.
- C8 must assert the complete ordered output for `validProposition()` as explicit path strings,
  retain an exact 11-block numeric-index sequence (not a pairwise comparison), and assert entry
  cardinality matches the expected paths so duplicate entries cannot hide behind a `Set`.
  Expected values must be independent of `projectProvenance`; do not sort the observed paths in
  the test or derive expected order from production code.
- Delete N2's unused `ConsequentialLeafDescriptor.seed` field and N3's redundant
  commercial-assumption special branch in `leafInferred`. Do not add replacement scaffolding.

The reviewer also recorded N1 in master-plan follow-up 10. It is **not** this phase: do not
narrow `positiveInt64StringSchema`, touch `src/lib/proposales/mappers.ts`, or add approval or
execution logic. N6 remains deferred to phase 7 C7(d).

## 4. Allowed write perimeter

Only these source/test/fixture files may change:

- `src/features/proposal-preparation/schemas/shared.ts`
- `src/features/proposal-preparation/schemas/shared.test.ts`
- `src/features/proposal-preparation/schemas/proposition.test.ts`
- `src/features/proposal-preparation/server/domain/provenance-projection.test.ts`
- `src/features/proposal-preparation/fixtures/propositions.ts`

Normal cycle artifacts only: tracker row 5, one append-only Phase-5 Review-log entry, and
`handoffs/implementer/phase-05-round-2.implementer.md`. Do not edit prior prompts or handoffs,
the reviewer handoff, the intention, future-phase plans, frontend files, `tsconfig.tsbuildinfo`,
or any production module outside `shared.ts`. Anything outside this perimeter is a blocker to
report, not permission to expand scope.

## 5. Evidence and closing protocol

- Run every original named Phase-5 mutation, all **21**, at the named site and target assertion;
  observe red and revert each. The mutation set remains closed at 21.
- In addition, perform and record the three correction-specific probes: remove the commercial
  note cap and observe C6(d) red; remove the projector sort and observe the ordered projection
  assertion red; collapse the sourced-union construction to the former non-source shape and
  observe C1(b)'s sourced-known assertion red. Revert all probes and verify byte-identical
  restoration. These demonstrate corrected guards; they do not expand the plan's mutation count.
- L4 budget: **exactly one** closing `npm test` on the tree handed over. Run `npm run typecheck`,
  `npm run lint`, and `git diff --check`; use L1/L2 for all targeted probes. Do not spend another
  L4 without charter authorization.
- Complete the documentation-impact review. No README change is expected unless the verified
  result makes an authoritative document false.
- Commit immediately with subject `CHECKPOINT (not approved): phase 05 proposition and provenance fix round 2`.
  Update only tracker row 5 to `IMPLEMENTED`; append the implementation round-2 Review-log
  record; write the handoff above with the cycle-scoped full write perimeter, 61-row coverage,
  the 21-mutation ledger, three correction-probe declarations, tree identity/evidence, and any
  deviation. Archgraph is absent; skip it silently.

Your final chat message is the owner layer: what changed, what it protects, what happens next,
and whether anything needs the owner. Link the handoff instead of pasting it.
