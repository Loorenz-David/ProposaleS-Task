---
plan: 5
role: implement
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposition schema and structural provenance
---

# Session prompt — phase 5 implementation (round 1)

Implement Phase 5 in `/Users/davidloorenz/Desktop/Developer/Proposales`. The phase plan is
your task list; where this prompt differs from it, the plan wins.

Read `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
`/Users/davidloorenz/agent-skills/implementation-executor.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first and follow them as session
doctrine. Invoke the repository `architecture-context` skill before material decisions.

## Gate check

Stop and report unless all hold at source:

1. the intention header is `RATIFIED`;
2. master-plan tracker rows 1–4 are `APPROVED`;
3. tracker row 5 is `PROMPT_READY`;
4. phase 5 declares exactly **8 criteria, 61 rows, and 21 named mutations**; and
5. `src/lib/values/{absence,path,money,timestamp,uuid}.ts` exist.

Record `git status --porcelain`; do not gate on a clean tree. Frontend work is a separate
worktree and is not this phase's scope. Preserve the canonical feature root
`src/features/proposal-preparation/`; create only the eight real phase files, not empty
future folders. Do not modify, stage, revert, or include frontend files, temporary frontend
VM shapes, `tsconfig.tsbuildinfo`, or unrelated user changes in this checkpoint.

## Read order

1. The doctrine files above, then `plans/phase-05-proposition-and-provenance.md` in full,
   including both Review-log folds.
2. Master plan §§5 (R1), 6.1, 6.3–6.8, 7.2–7.3, 9.0–9.2, and 10.3–10.6.
3. Intention §§7–9, 16, 17A.1, 17A.4–17A.5, 17A.12, 17A.16, 22 criteria 2/20/22/23,
   and §23 round 13.
4. Contracts `03-feature-architecture.md` §§1–4; `06-data-contracts-and-validation.md`
   §§1–4, 6–7; `08-agent-architecture.md` §§4, 6–7;
   `11-testing-principles.md` §§2–3, 5; and `12-anti-patterns.md` sections on data and
   validation, agents, and structure/abstraction.
5. The Phase 2 and Phase 4 Review logs. Phase 4 N6 is binding: a named mutation proves one
   named row unless each row's failure is independently observed.

## Non-negotiable phase boundaries

- The feature owns this phase's schemas, fixtures, and pure provenance projection. Schema
  modules are runtime-neutral; the sole domain module begins with `import "server-only"`.
  No integration work, UI, agent runtime, services, workflow state, persistence, or pricing
  writes belong here.
- `ProposalWorkflowState` remains future authoritative workflow truth; this phase only
  defines the proposition shape. The derived provenance projection is display material, never
  input or authority.
- Enforce per-field recipient provenance. The recipient object is `knownOrAbsent`; all five
  recipient leaves have independent source/ref data. Do not add an object-level source.
- Implement the master-plan schema constructions exactly: no `.finite()`; `refSchema` stays
  unrefined; content refs extend it with `variationId`; the human member alone refines
  `turnId ⇒ quote`; and `sourcedOrAbsent` extends the actual members of the source union.
  Do not spread a Zod schema.
- Every consequential leaf has an independent construction site so all 15 C2 mutation probes
  are real. Do not hoist a shared recipient or commercial-assumption consequential schema.
- Warnings project their sourced `text`, but `before` and `after` are bare values and never
  become provenance entries. Never add price, total, currency, tax, or other pricing fields to
  a block.
- Follow the declared intentional trims: source-policy negative tests are representative as
  recorded, and `contentCandidateSchema` receives its direct behavioral tests in phase 7.
  Do not add untraced tests or expand scope to compensate.
- There are no delegated design choices remaining from projection. If the plan cannot be
  followed exactly, stop and record the blocker; do not silently improvise.

## Evidence and closeout

Your L4 budget is **exactly one**: the closing `npm test` on the tree you hand over. Use L1/L2
for each named mutation and focused test; do not spend another L4 without the charter's written
authorization. Run `npm run typecheck` and `npm run lint`; verify `git diff --check`.

Run and revert all **21** named mutations, recording the target test and every probe file.
Checkpoint-commit the completed cycle with subject
`CHECKPOINT (not approved): phase 05 proposition and provenance` under the standing owner
authorization. Update only tracker row 5 to `IMPLEMENTED` and append this plan's Review log.

Write `handoffs/implementer/phase-05-round-1.implementer.md` with the full write perimeter,
the 61-row coverage map, the closed 21-mutation ledger, evidence commands/tree identity, any
documentation-impact conclusion, and the checkpoint SHA. Archgraph is absent; skip it silently.
Your final chat response should be the owner-layer summary and link to that handoff.
