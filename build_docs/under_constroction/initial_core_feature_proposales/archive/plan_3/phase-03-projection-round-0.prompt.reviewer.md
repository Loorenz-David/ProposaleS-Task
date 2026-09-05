---
plan: 3
role: projection
round: 0
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — transport, error translation, content read
---

# Session prompt — phase 3 projection (round 0)

You are running the mandatory **plan-projection** gate for phase 3 in
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Invoke the `plan-projection` skill and the repository `architecture-context` skill.
Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/plan-projection.md` first. You do not implement code,
edit plans, or resolve a gap by guessing.

## Gate check

Stop and report unless all hold:

1. the intention header is `RATIFIED`;
2. master-plan tracker row 2 is `APPROVED`;
3. tracker row 3 is `NOT_STARTED`;
4. `src/lib/proposales/` does not exist; and
5. phase 3 declares 6 criteria, 35 rows, and 4 named mutations.

Do not gate on a clean worktree. Concurrent frontend work is outside this backend phase;
record it without modifying, staging, or treating it as projection scope.

## Read order

1. Charter and plan-projection doctrine.
2. `plans/phase-03-proposales-transport-and-content.md`, in full.
3. Master plan §§5 (R10), 6.1–6.6, 9, 10.4–10.6, and follow-up register row 9.
4. Intention §§12.1, 17A.8, 17A.11–17A.13, 17A.16; measurement ledger entries each
   phase-3 row traces to.
5. `planing/proposales-source-evidence.md` §§1–3, 6–8 and the referenced OpenAPI portions.
6. `api-documentation/proposales/openapi.json` surfaces named by the plan.
7. Contracts `02-runtime-boundaries.md` §§3, 5, 8; `04-server-architecture.md` §6;
   `06-data-contracts-and-validation.md` §§2–3, 5–8; `07-integrations.md` §§1–6, 10;
   `10-security-and-trust-boundaries.md` §§2, 4, 7–8; `11-testing-principles.md` §§2–3, 5;
   `12-anti-patterns.md` “Server”, “Data and validation”, and “Integrations”; and
   `14-documentation-principles.md` §9.
8. Existing phase-1 and phase-2 code only as the current foundation: environment parsing,
   `AppError`/`IntegrationError`, `toErrorDto`, value schemas, logger, Vitest configuration,
   and offline-fetch guard. Contracts and intention remain authority.

## Depth targets

Derive the implementer's first hour on paper. Record every decision the artifacts fail to
determine, including exact schema fields, interfaces, branch order, test fixtures, and
mutations required to make a criterion fail.

Spend deepest effort on these silent-failure mechanisms:

- the complete upstream-error classification and what may reach safe error messages/details
  versus `cause`, including every status/kind boundary and bounded body/message/issue behavior;
- retry eligibility, attempt count, backoff, total elapsed budget, timeout/abort behavior,
  and the structural separation that makes POST unable to enter a retry path;
- query/body placement, URL construction and encoding, company selection, and the distinction
  between wire responses and the application-owned `ContentItem`/`CompanyInfo` values;
- epoch-to-ISO conversion, exact timestamp validity, currency normalization/validation, and
  whether the expected fixtures can prove the mapped result rather than a hand-built stand-in;
- server-only reachability, secret containment, injected `fetch`/clock/sleep dependencies,
  offline-test guarantees, and the recording fake's ability to observe rather than decide.

For every C1–C6 row, determine whether it is executable now with one exact outcome and
whether its trace cell supports it. Independently re-derive the file perimeter, 35-row
arithmetic (including lettered spans), and four-mutation set. Inspect the actual repository
for missing dependencies, existing naming collisions, and test-project coverage.

Do not turn observations into implementation advice. Classify each as a plan gap, intention
gap, or an explicit safe delegation for the implementer. No known defect list is supplied;
derive the ledger from the artifacts themselves.

## Evidence and closing

**L4 budget: exactly zero runs.** This is a paper/reality-check gate. Read-only inspection and
commands such as `git show`, `rg`, and `npx vitest list` are allowed; do not run the suite.

Write `handoffs/reviewer/phase-03-projection-round-0.reviewer.md` with row-schema
frontmatter, the owner-readable opening, `⚠ OWNER DECISIONS REQUIRED (n)` immediately after
it, decision ledger, reality/decidability checks, explicit delegation list, and full write
perimeter. Update only tracker row 3 to `PROJECTED`; do not edit the phase plan or source code.
The coordinator will consume the handoff and append the Review log after routing every ledger
item. Archgraph is absent; skip it silently. Use the charter owner layer in your final message.
