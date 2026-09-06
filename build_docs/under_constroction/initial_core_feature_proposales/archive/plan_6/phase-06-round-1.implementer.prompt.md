---
plan: 6
role: implement
round: 1
date: 2026-09-06
project: initial_core_feature_proposales
phase: Information items, clarification, workflow state, identity
---

# Session prompt — phase 6 implementation (round 1)

Implement Phase 6 in `/Users/davidloorenz/Desktop/Developer/Proposales`. The phase plan is
your task list; where this prompt differs from it, the plan wins.

Read `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
`/Users/davidloorenz/agent-skills/implementation-executor.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first and follow them as session
doctrine. Invoke the repository `architecture-context` skill before material decisions.

## Gate check

Stop and report unless all hold at source:

1. the intention header is `RATIFIED`;
2. master-plan tracker rows 1–5 are `APPROVED`;
3. tracker row 6 is `PROMPT_READY`;
4. phase 6 declares exactly **8 criteria, 54 rows, and 5 named mutations**; and
5. phase-5 proposition schemas and fixtures exist under the canonical feature root.

Record `git status --porcelain`; do not gate on a clean tree. Frontend work is a separate
worktree and is not this phase's scope. Preserve the canonical feature root
`src/features/proposal-preparation/`; create only the twelve real phase files. Do not modify,
stage, revert, or include frontend files, temporary frontend VM shapes, `tsconfig.tsbuildinfo`,
or unrelated user changes in this checkpoint.

## Read order

1. The doctrine files above, then `plans/phase-06-items-clarification-state.md` in full,
   including its projection fold and every acceptance row.
2. Master plan §§5, 6.1, 6.3–6.9, 7.2–7.3, 9.0–9.2, and 10.3–10.6.
3. Intention §§5.2, 8.1–8.2, 11.3, 17A.1–17A.3, 17A.6–17A.7, 17A.16, 22 criteria 6/15/17/21,
   and §23 round 14.
4. Contracts `02-runtime-boundaries.md` §§3, 6, 9; `03-feature-architecture.md` §§1–4;
   `04-server-architecture.md` §§4–6; `06-data-contracts-and-validation.md` §§1–4, 6–8;
   `10-security-and-trust-boundaries.md` §§4, 10; `11-testing-principles.md` §§2–3, 5;
   `12-anti-patterns.md` sections on runtime boundaries, server, data/validation, and
   structure; `13-decision-checklist.md` §§1 and 3; and
   `14-documentation-principles.md` §8.
5. Phase 5's approved implementation and Review log only to learn existing fixture and schema
   shapes. Do not change Phase 5 contracts.

## Non-negotiable phase boundaries

- This is the first feature-owned state/domain phase. `schemas/` must remain runtime-neutral;
  `server/domain/` modules begin with `import "server-only"`. Do not use `Buffer`, import
  `serverEnv`, add an API route, a Server Action, client code, persistence, an external call,
  service orchestration, or agent runtime behavior.
- `ProposalWorkflowState` is authoritative structured workflow truth and remains caller-held,
  transient, strict, and serializable. `ConversationContext` is separate linguistic continuity;
  frontend runtime/VM/fixture shapes are presentation seams, never domain authority.
- The information-item policy table is **application-owned** in `INFORMATION_REGISTRY`. The
  caller-held `items` record carries only total, strict resolution objects. `evaluateApprovability`
  joins those resolutions to the registry; no browser-provided policy may relax an approval rule.
- `applyAnswers` has the exact parsed-input signature and left-to-right error precedence in the
  plan. It is pure and rejects a skip for a `do_not_ask` item. Do not invent a new error reason.
- State byte sizing uses `TextEncoder` only. Serialization failures become the declared safe
  `ValidationError`; oversize takes precedence over strict-schema errors. The schema factory gets
  an injected, already-validated editor origin and must not import server config.
- The 1 MiB limit is deliberately generous enough for `maximalConformingState()`. Build that
  phase-6 fixture inline from `validProposition`; do not pull the future phase-10 maximal fixture
  forward or create speculative helpers.
- Keep the exact twelve-file perimeter. Tests may be refactored only within those five test files.
  Every test must map to a declared row; do not add untraced tests or future-phase behavior.
- All projection freedoms are resolved in the phase plan. If the plan cannot be followed exactly,
  stop and report the blocker rather than silently improvising.

## Evidence and closeout

Complete Task 0 exactly: the handoff contains a one-line coverage map for every one of the
**54 rows**, including whether the assertion has the declared strength, and the reverse test →
row map. Capture the honest red baseline before production edits.

Your L4 budget is **exactly one**: the closing `npm test` on the tree you hand over. Use L1/L2
for focused tests and mutations; do not spend another L4 without the charter's written
authorization. Run `npm run typecheck`, `npm run lint`, and `git diff --check` at close.

Run and revert all **5** named mutations, with derived summands `C2 1 · C3 1 · C5 1 · C6 1 · C7
1`. Record the target test, command, failing id/assertion, tree identity, and every probe-touched
file. The mutations are `MUT-06-1` through `MUT-06-5` at the exact definitions and sites the
phase table names. Also prove every new strictness, purity, and serialization guard can fail as
the executor doctrine requires.

Before closing implementation, evaluate documentation impact according to
`architectural_contracts/14-documentation-principles.md`. Update any authoritative documentation
made false, incomplete, or misleading by the verified implementation. Do not modify documentation
merely because files changed.

Checkpoint-commit the completed cycle with subject
`CHECKPOINT (not approved): phase 06 items clarification state` under the standing owner
authorization. Update only tracker row 6 to `IMPLEMENTED` and append this plan's Review log.

Write `handoffs/implementer/phase-06-round-1.implementer.md` with the full write perimeter, the
54-row coverage map, the closed five-mutation ledger, baseline and closing evidence, all judgment
calls, documentation-impact conclusion, and the checkpoint SHA. Archgraph is absent; skip it
silently. Your final chat response should be the owner-layer summary and link to that handoff.
