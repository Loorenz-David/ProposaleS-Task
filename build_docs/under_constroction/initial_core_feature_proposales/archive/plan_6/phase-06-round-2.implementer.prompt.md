---
plan: 6
role: implement
round: 2
date: 2026-09-06
project: initial_core_feature_proposales
phase: Information items, clarification, workflow state, identity
---

# Session prompt — phase 6 fix (round 2)

Implement the bounded Phase 6 repair in `/Users/davidloorenz/Desktop/Developer/Proposales`.
The phase plan remains the task list; where this prompt differs from it, the plan wins.

Read `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
`/Users/davidloorenz/agent-skills/implementation-executor.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first and follow them as session
doctrine. Invoke the repository `architecture-context` skill before material decisions.

## Gate check

Stop and report unless all hold at source:

1. the intention header is `RATIFIED`;
2. master-plan tracker rows 1–5 are `APPROVED`;
3. tracker row 6 is `PROMPT_READY` and names this round-2 fix; and
4. `handoffs/reviewer/phase-06-round-1.reviewer.md` exists with verdict `CHANGES_REQUESTED` and exactly S1–S2 as should-fix findings.

Record `git status --porcelain`; do not gate on a clean tree. Frontend work is a separate
worktree and is not this phase's scope. Preserve the canonical feature root
`src/features/proposal-preparation/`; do not modify, stage, revert, or include frontend
files, temporary frontend VM shapes, `tsconfig.tsbuildinfo`, or unrelated user changes.

## Read order

1. The doctrine files above, the master plan tracker and §9.1–§9.2, then this phase plan in
   full (including the review log and coordinator fold).
2. The independent review handoff at
   `handoffs/reviewer/phase-06-round-1.reviewer.md` and the round-1 implementation handoff.
3. Intention §17A.3, §17A.6–§17A.7, and measurement M9/M18.
4. Contracts `02-runtime-boundaries.md` §§3, 6, 9; `03-feature-architecture.md` §§1–4;
   `04-server-architecture.md` §§4–6; `06-data-contracts-and-validation.md` §§1–4, 6–8;
   `10-security-and-trust-boundaries.md` §§4, 10; `11-testing-principles.md` §§2–3, 5;
   `12-anti-patterns.md` sections matching runtime, server, data, and structure;
   `13-decision-checklist.md` §§1, 3; and `14-documentation-principles.md` §8.

## Fix scope — resolve, do not relitigate

The allowed source/test perimeter is exactly:

- `src/features/proposal-preparation/schemas/workflow-state.test.ts`
- `src/features/proposal-preparation/server/domain/approvability.test.ts`
- `src/features/proposal-preparation/server/domain/information-registry.ts`
- `src/features/proposal-preparation/schemas/information-items.ts` (only if needed to expose the central policy types)
- `src/features/proposal-preparation/server/domain/bump-version.test.ts`

The allowed coordination perimeter is this phase plan's append-only Review log, master-plan
tracker row 6 only, and `handoffs/implementer/phase-06-round-2.implementer.md`.
Do not alter production behavior, criteria/row/mutation counts, later-phase source, or any
other file. Resolve the findings, add nothing beyond them, and leave no superseded fixture
or assertion behind.

Implement S1 and S2 exactly as prescribed by the reviewer:

- S1 correction: "build C5(e) from `validState({ preparedProposition, currentProposition })` where both propositions carry `{ known: false }` on the recipient object, on one `SourcedOrAbsent` block leaf (`quantity` or `optional`), and on one top-level leaf (`title` or `agentRationale`); keep the existing deep-equality assertion."
- S2 correction: "unresolve `title` + `block_selection` (or all three required items) and keep the exact expected array."

Close the two contained notes chosen for this cycle:

- N3 correction: "type the registry from `z.infer` of those schemas, or delete them." Keep the runtime-owned policy table and the caller-held resolution-only boundary unchanged.
- N4 correction: use `validProposition({ version: 4 })` for C8(c), rather than a hand-built non-parseable record.

C3(f)'s unreachable unknown/duplicate wording was already corrected in the plan. Align only
its test title/setup with its new reachable row if needed; it must remain one traced C3(f) test,
not a new test or criterion. Do not attempt the Phase 10 maximal-fixture follow-up.

## Evidence and closeout

Your L4 budget is **exactly one**: the closing `npm test` on the tree you hand over. Use L1/L2
for focused tests and probes; do not spend another L4 without the charter's written
authorization. Run `npm run typecheck`, `npm run lint`, and `git diff --check` at close.

Prove both repaired guards bite by applying and reverting their reviewer mutants: collapse the
`{ known: false }` parse arm for S1, and remove `.sort()` for S2. Also prove the central-policy
type repair leaves the existing registry-row assertions green and the parseable C8(c) fixture
actually parses before calling `nextVersion`. Record all touched files and restoration evidence.

Before closing, answer the documentation-impact question in contract 14 §8. Do not modify
documentation merely because files changed.

Checkpoint-commit the completed repair with subject
`CHECKPOINT (not approved): phase 06 fix guards` under the standing owner authorization.
Update only tracker row 6 to `IMPLEMENTED` and append this phase plan's Review log.

Write `handoffs/implementer/phase-06-round-2.implementer.md` with the full write perimeter,
S1/S2 correction results, N3/N4 disposition, plan-alignment note for C3(f), both repair-mutation
records, focused and closing evidence, documentation conclusion, and checkpoint SHA. State that
the owner authorized coordinator validation after this fix rather than an independent re-review.
