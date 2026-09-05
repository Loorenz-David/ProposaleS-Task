---
plan: 4
role: review
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — create, recovery search, read-back, Applied Pricing
---

# Session prompt — phase 4 independent review (round 1)

Review the Phase 4 implementation in `/Users/davidloorenz/Desktop/Developer/Proposales`.
This is the first review: independently re-derive the phase against the plan and semantic
authorities. Do not implement a fix. The phase plan is authoritative if this prompt differs
from it.

Read `/Users/davidloorenz/.codex/skills/plan-reviewer/SKILL.md`,
`/Users/davidloorenz/agent-skills/plan-reviewer.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first; follow them as session doctrine.
Invoke the repository `architecture-context` skill before material review decisions.

## Gate check

Stop and report unless: the intention header is `RATIFIED`; tracker rows 1–3 are
`APPROVED`; tracker row 4 is `REVIEWING`; the Phase 4 plan declares **8 criteria, 75 rows,
and 33 named mutations**; the Phase 4 implementation handoff exists at the named path below;
and the Phase-4 adapter code/tests/fixtures named in the plan exist. Do not gate on a clean
tree, a commit SHA, file count, or any frontend state. Record `git status --porcelain` and
preserve the untracked projection handoff and all frontend worktree boundaries.

## Read order

1. The doctrine files above, then the full `plans/phase-04-proposales-proposals.md`, including
   its projection fold and implementation Review-log entry.
2. `handoffs/implementer/phase-04-round-1.implementer.md` in full. Reconcile rather than
   trusting its 75-row / 33-mutation claims.
3. Master plan §§5 (R5, R6, R10), 6.1, 6.4–6.7, 7.2–7.3, 9–10 (including §9.2).
4. Intention §§3.1, 12.1–14, 17A.5, 17A.11–17A.13, 17A.16, invariant 17, and the cited
   measurement-ledger entries; evidence §§4–8; cited OpenAPI operations/schemas.
5. Contracts `02-runtime-boundaries.md` §§3, 5; `03-feature-architecture.md` §§1, 3–4;
   `04-server-architecture.md` §8; `06-data-contracts-and-validation.md` §§2–3, 6–8;
   `07-integrations.md` §§3–6, 10; `10-security-and-trust-boundaries.md` §10;
   `11-testing-principles.md` §§2–3, 5; `12-anti-patterns.md` data/validation and
   integrations; and `14-documentation-principles.md` §§8–9.
6. Phase 3's Review log and adapter tests before judging Phase 4's transport reuse.

## Full review checklist

Review all 75 rows and the full Phase-4 perimeter against the plan. Re-derive strict outbound
schema behavior, omission helpers, metadata keys, recovery query and in-client exact filter,
status absence versus unknown, read-back currency/optionality/money mapping, Applied Pricing's
no-arithmetic guarantee, fake behavior, documentation, runtime placement, and test ownership.
Verify every named mutation can actually redden the stated target and that all probes were
reverted. Check the implementation diff against the handoff's declared 17 implementation paths
plus normal tracker/plan/handoff artifacts; any other changed file is a finding.

Spend independent variation effort on these **review probes**; they are questions, not assumed
findings:

- Does the test prove `createProposalDraft` itself invokes the strict parser before POST, or only
  that an exported parser helper rejects an invalid object? Mutate/remove the live call site if
  needed.
- Does the fake test compare its recorded `request` byte-for-byte with the real mapper output,
  and can a pre-seeded recovered proposal also yield its associated stored read-back in Phase 14?
- Does each of the two `currency` rejection locations have a valid request-plus-one-key test,
  rather than sharing a malformed fixture? Are all claimed absent cases (`tax_options`, block
  currency, optional flag, package split) independently exercised?
- Do response schemas accept only the vendor optionality the owner decided, preserve strict money
  failures, correctly envelope the actual read-back, and map every documented/unknown/null status
  without inventing a value?
- Can the AST scan/test suite catch every declared branch and exclusion without relying on a test
  that the default Vitest project never collects? Check its imports and production-source scan.
- Check the handoff's closing-L4 provenance: it names the checkpoint but does not print the
  claimed dirty-tree identity. Because the current review tree differs from the prior recorded
  test tree by provenance updates, establish the required independent closing stamp.

The Phase 4 integration remains under `src/lib/proposales/`; do not create or move code into a
feature root, UI, transport, persistence, or pricing-write scope. `ProposalWorkflowState`,
ConversationContext, and frontend temporary VMs are outside this review.

## Evidence, report, and state

Your L4 budget is **exactly one**: run `npm test` as the independent review closing stamp on the
tree you hand over. Use L1/L2 for criterion and mutation variations; any extra L4 needs the
charter authorization line before it runs. Run `npm run typecheck`, `npm run lint`, and
`git diff --check` as appropriate to the reviewed tree.

Append only your technical findings and verified-correct record to this phase plan's Review log.
Update only tracker row 4 from `REVIEWING` to `APPROVED` or `CHANGES_REQUESTED`, with a one-line
note. Write `handoffs/reviewer/phase-04-round-1.reviewer.md` with frontmatter `plan: 4`,
`role: review`, `round: 1`, verdict, date, actor; include owner layer, findings by severity,
mutation-probe declaration, full observed perimeter, evidence/tree identity, lessons, and any
owner decision cards. Do not change product code, fixtures, or any other planning artifact;
revert every mutation probe. Archgraph is absent; skip it silently.
