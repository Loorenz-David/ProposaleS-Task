---
plan: 4
role: implement
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — create, recovery search, read-back, Applied Pricing
---

# Session prompt — phase 4 implementation (round 1)

Implement Phase 4 in `/Users/davidloorenz/Desktop/Developer/Proposales`. The phase plan is
your task list; where this prompt differs from it, the plan wins.

Read `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
`/Users/davidloorenz/agent-skills/implementation-executor.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first and follow them as session
doctrine. Invoke the repository `architecture-context` skill before material decisions.

## Gate check

Stop and report unless all hold at source:

1. the intention header is `RATIFIED`;
2. master-plan tracker rows 1–3 are `APPROVED`;
3. tracker row 4 is `PROMPT_READY`;
4. phase 4 declares **8 criteria, 75 rows, and 33 named mutations**; and
5. the Phase-3 Proposales adapter files named by the phase plan exist.

Record `git status --porcelain`; do not gate on a clean tree. Frontend work is a separate
worktree and is not this phase's scope. Preserve its architecture boundary: the canonical
feature root is `src/features/proposal-preparation/`, but this integration phase belongs in
`src/lib/proposales/` (master plan §9.2). Do not modify, stage, revert, or include frontend
files, temporary frontend VM shapes, or `tsconfig.tsbuildinfo` in this checkpoint.

## Read order

1. The doctrine files above, then `plans/phase-04-proposales-proposals.md` in full,
   including its projection-fold Review-log entry.
2. Master plan §§5 (R5, R6, R10), 6.1, 6.4–6.7, 9 (including §9.2), and 10.4–10.6.
3. Intention §§3.1, 12.1–14, 17A.5, 17A.11–17A.13, 17A.16, invariant 17, and the
   measurement-ledger entries the phase rows cite.
4. Proposales evidence §§4–8 and the cited `openapi.json` operations/schemas.
5. Contracts `02-runtime-boundaries.md` §§3, 5; `03-feature-architecture.md` §§1, 3–4;
   `04-server-architecture.md` §8; `06-data-contracts-and-validation.md` §§2–3, 6–8;
   `07-integrations.md` §§3–6, 10; `10-security-and-trust-boundaries.md` §10;
   `11-testing-principles.md` §§2–3, 5; `12-anti-patterns.md` sections on data/validation
   and integrations; and `14-documentation-principles.md` §§8–9.
6. Phase 3 code and its Review log. Keep its settled transport guarantees: non-2xx handling
   precedes body parsing, idempotent reads alone retry within their budget, POST never retries,
   request/response bodies are independently parseable, and test response fixtures are not
   reused after body consumption.

## Non-negotiable phase boundaries

- Implement only the 17 production/test/fixture paths plus the normal closing artifacts named
  in the phase plan. Do not add a feature folder, UI, server transport, persistence, price
  writes, new dependencies, pagination/caching, or Phase-14 recovery/create decisions.
- `src/lib/proposales/` remains server-only. The test-only AST helper belongs at
  `test/helpers/proposales-arithmetic-scan.ts`, never in application source.
- `AppliedPricing` is lib-owned and is only the `available: true` arm. The feature's schema
  will re-parse it in Phase 14; do not import from `src/features/`.
- Owner decisions already bind this phase: null/absent status is omitted, unknown non-null
  status becomes `"unknown"`; money and identity values are strict; optional flag and package
  split are omitted when Proposales did not report them. Do not reopen either decision.
- The strict outbound request schema must parse the body on the real create path before POST;
  the AST/no-price/no-undefined checks must be capable of reddening under every named mutation.
- There are no delegated choices remaining from projection. Resolve no new design question by
  guessing: record it in the Review log and hand it back if the plan cannot determine it.

## Evidence and closeout

Your L4 budget is **exactly one**: the closing `npm test` on the tree you hand over. Use L1/L2
for each named mutation and focused test; do not spend another L4 without the charter's written
authorization. Run `npm run typecheck` and `npm run lint`; verify `git diff --check`.

Run and revert all **33** named mutations, recording the target test and every probe file.
Checkpoint-commit the completed cycle with subject
`CHECKPOINT (not approved): phase 04 Proposales proposals` under the standing owner
authorization. Update only tracker row 4 to `IMPLEMENTED` and append this plan's Review log.

Write `handoffs/implementer/phase-04-round-1.implementer.md` with the full write perimeter,
the 75-row coverage map, the closed 33-mutation ledger, evidence commands/tree identity, any
documentation-impact conclusion, and the checkpoint SHA. Archgraph is absent; skip it silently.
Your final chat response should be the owner-layer summary and link to that handoff.
