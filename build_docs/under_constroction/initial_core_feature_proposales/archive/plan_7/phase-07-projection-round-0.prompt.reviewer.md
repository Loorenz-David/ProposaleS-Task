---
plan: 7
role: projection
round: 0
date: 2026-09-06
project: initial_core_feature_proposales
phase: Content ranking domain and human search
---

# Session prompt — phase 7 projection (round 0)

Run the mandatory pre-implementation projection for Phase 7 in
`/Users/davidloorenz/Desktop/Developer/Proposales`. You are not implementing or reviewing
code; do the implementer's first hour on paper and surface every decision the current
artifacts fail to determine.

Read `/Users/davidloorenz/.codex/skills/plan-projection/SKILL.md`,
`/Users/davidloorenz/agent-skills/plan-projection.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first and follow them as session
doctrine. Invoke the repository `architecture-context` skill before material decisions.

## Gate check

Stop and report unless all hold at source:

1. the intention header is `RATIFIED`;
2. tracker rows 1–6 are `APPROVED`;
3. tracker row 7 is `NOT_STARTED`; and
4. Phase 7 declares exactly **7 criteria, 28 rows, and 3 named mutations**.

Record `git status --porcelain`; do not gate on a clean tree. The frontend is a separate
worktree and remains outside scope. The canonical feature root is
`src/features/proposal-preparation/`; Phase 7 may add only real backend/domain files there.
No frontend state, UI, persistence, agent runtime, route, server action, or new integration
client belongs in this phase.

## Read order

1. The doctrine above, then `plans/phase-07-ranking-and-human-search.md` in full.
2. Master plan §§5, 6.1, 6.3–6.7, 7.2–7.3, 9.1–9.2, and 10.3–10.6.
3. Intention §10.1–§10.2, §17A.8 in full, §17A.16, and §21.1(d).
4. Existing phase-3 Proposales content-client types/fake, phase-5 `content-candidate.ts`,
   and phase-6 Review log only as current artifacts, not as instructions to expand scope.
5. Contracts `02-runtime-boundaries.md` §§3, 5–6, 9; `03-feature-architecture.md` §§1–4;
   `04-server-architecture.md` §§4–6; `06-data-contracts-and-validation.md` §§3–4, 6–8;
   `07-integrations.md` applicable read-boundary sections; `10-security-and-trust-boundaries.md`
   §4; `11-testing-principles.md` §§2–3, 5; matching sections of
   `12-anti-patterns.md`; `13-decision-checklist.md` §§1, 3; and
   `14-documentation-principles.md` §8.

## Projection depth targets

Derive concrete file shapes, signatures, score calculation, token semantics, tie ordering,
truncation, language filtering, schema validation, and fake-client call record strictly from
the listed artifacts. Produce a decision ledger for every unresolved choice, classifying each
as a plan gap, intention gap, or explicitly delegated free choice; do not silently choose.

Give extra adversarial attention to silent-failure surfaces: integer score bounds and threshold
intervals, catalog-order independence, numeric `variationId` ordering, the candidate cap versus
fixture cardinality, language absence, truncation semantics, and a server-only human-search
service that reads the catalog exactly once without importing or receiving an AI client.

Phase 5 explicitly defers the first direct behavioral proof of `contentCandidateSchema` to
Phase 7 C7(d). Verify that the plan makes its valid output and invalid input assertions concrete
enough to test; do not re-open Phase 5 or treat source inspection as that behavioral proof.

## Evidence and closeout

Your L4 budget is **zero**. Do not run `npm test`, `npm run typecheck`, or `npm run lint`.
Use read-only inspection and narrowly justified arithmetic only where needed to establish a
plan's decidability. Do not edit source, the intention, master plan, or phase plan.

Write exactly one handoff at
`handoffs/reviewer/phase-07-projection-round-0.reviewer.md`, with the projection verdict,
owner-readable opening, `⚠ OWNER DECISIONS REQUIRED (n)` section, fully routed decision ledger,
reality/criterion/trace checks, evidence statement, and full write perimeter. The coordinator,
not this session, folds any findings into the authoritative artifacts and updates the tracker.
