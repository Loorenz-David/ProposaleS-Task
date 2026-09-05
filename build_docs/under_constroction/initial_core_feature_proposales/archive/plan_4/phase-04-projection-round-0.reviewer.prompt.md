---
plan: 4
role: projection
round: 0
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — create, recovery search, read-back, Applied Pricing
---

# Session prompt — project phase 4 before implementation

You are the independent projection reviewer for Phase 4 in
`/Users/davidloorenz/Desktop/Developer/Proposales`. This is a pre-implementation gate: do the
implementer's first hour on paper, find every artifact decision the plan does not determine, and
report; do not implement or edit product code.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/plan-projection.md` first and follow their doctrine. Invoke the
repository `architecture-context` skill before evaluating the plan. The phase plan is your task
list; where this prompt differs from it, the plan wins.

## Gate check

Stop and report unless: the intention header is `RATIFIED`; tracker rows 1–3 are `APPROVED`; phase
4's tracker row is `NOT_STARTED`; the phase-4 plan marks projection mandatory; and every expected
Phase-3 adapter dependency named by the plan exists. Do not gate on a clean tree, file count, or
commit SHA. Record `git status --porcelain` and preserve foreign frontend work, generated
`tsconfig.tsbuildinfo`, and existing coordinator artifacts.

## Inputs and read order

Read only the inputs an implementer will receive:

1. `plans/phase-04-proposales-proposals.md` in full.
2. Its Read-first sources: master plan §5, §§6.4–6.5, §6.7, §9 and the cited rules; intention
   §§3.1, 12.1–14, 17A.5, 17A.11–17A.13, 17A.16 and invariant 17; source evidence §§4–8;
   `openapi.json`'s cited operations and schemas; the named architecture contracts; and the
   Phase-3 Review log.
3. The actual Phase-3 adapter code and fixtures that Phase 4 extends.

Do not use planning-session context or past conversation. Do not preserve a defect for calibration
and do not edit the plan, intention, code, or fixtures.

## Required projection depth

Derive concrete signatures, schema boundaries, wire/domain mappings, fake behavior, and test
fixtures from the artifacts alone. Record every choice you cannot derive as a plan gap, intention
gap, or explicitly delegated free choice. Allocate deepest scrutiny to the silent-failure
mechanisms the plan introduces:

- strict omission-only outbound request construction and the price-field exclusion boundary;
- the three metadata keys and recovery-search re-verification;
- create/read-back idempotency and the fake's wire-equivalence behavior;
- read-back Applied Pricing as a verbatim mapping with no arithmetic, including the AST scanner;
- unknown/display-only status handling, money currency ownership, and malformed wire responses.

For every acceptance row, determine whether one exact executable assertion can be written now;
verify every named path and symbol; re-derive the 46-row / 9-mutation arithmetic at source; and
verify each trace cell against its cited measurement or mechanism contract. Identify any missing
factory/fixture population, dependency perimeter collision, unaddressable observable, or orphan
obligation hidden in a task.

## Evidence budget and closeout

**L4 budget: zero.** This projection is document/code derivation; use L1/L2 inspections only. Do
not run broad tests. If an absence claim truly needs L4, report it rather than spending unbudgeted
evidence.

Write `handoffs/reviewer/phase-04-projection-round-0.reviewer.md` with frontmatter
`plan: 4`, `role: projection`, `round: 0`, verdict, date, and actor. Start with an owner-readable
summary, then `⚠ OWNER DECISIONS REQUIRED (n)`. Include a fully routed decision ledger, reality
checks, criteria/trace results, full write perimeter, and no code changes. Do not update the plan
or tracker: the coordinator consumes and routes the ledger. Archgraph is absent; skip it silently.

Your final chat response uses the charter owner layer and points to the handoff rather than
repeating its technical content.
