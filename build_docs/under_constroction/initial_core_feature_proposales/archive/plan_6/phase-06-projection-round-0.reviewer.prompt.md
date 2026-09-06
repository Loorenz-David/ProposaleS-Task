---
plan: 6
role: projection
round: 0
date: 2026-09-06
project: initial_core_feature_proposales
phase: Information items, clarification, workflow state, identity
---

# Session prompt — project Phase 6 before implementation

You are the independent **projection reviewer** for Phase 6 of
`initial_core_feature_proposales` in `/Users/davidloorenz/Desktop/Developer/Proposales`.
This is a pre-implementation plan gate, not a code review. Work without planning-session or
prior-conversation context: derive only from the artifacts and current code you are directed to
read.

Read and follow `/Users/davidloorenz/.codex/skills/plan-projection/SKILL.md`,
`/Users/davidloorenz/agent-skills/plan-projection.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first. Apply the repository
architecture-context policy through `.codex/skills/architecture-context/SKILL.md`, its policy,
and `architectural_contracts/01-implementation-contract-guide.md`.

You report plan gaps; you do not edit production code, the intention, the master plan, or the
phase plan. The phase plan is the prospective task list; where this prompt differs, it wins.

## Gate check

Stop and report if any condition fails:

1. The intention header is `RATIFIED`.
2. Master-plan tracker row 5 is `APPROVED` and row 6 is `PROJECTED`.
3. `plans/phase-06-items-clarification-state.md` is present and declares 8 criteria, 45 rows,
   and 5 named mutations.
4. The Phase 5 artifacts are archived under `archive/plan_5/`; no live Phase-5 handoff remains.

Record `git status --porcelain`, but do not gate on a clean tree. Do not cross into the frontend
worktree or treat frontend VM/fixture shapes as backend contracts.

## Read order

1. The projection doctrine and charter above.
2. Phase 6 plan in full, including every task, criterion, note, and review-log entry.
3. Master plan §§4–6.9, §§7.2–7.3, §9, §10.3–10.6, and follow-up register §11.
4. Ratified intention §§5.2, 7–9, 11.3, 17A.1–17A.7, 17A.13, 17A.16–17A.17, §22 criteria
   6, 15, 17, 21, and ledger M2, M8, M9, M17, M18.
5. Phase 5 plan and approved implementation only insofar as Phase 6 imports its proposition
   schema/fixture contracts; inspect existing `src/lib/values/*`, errors, and phase-5 feature
   files needed to verify paths and symbols.
6. Applicable contracts: `02-runtime-boundaries.md` §§3, 6, 9;
   `03-feature-architecture.md` §§1–4; `06-data-contracts-and-validation.md` §§1–4 and 6–8;
   `08-agent-architecture.md` §§4, 6–7, 9; `09-database-and-persistence.md` §§1–4;
   `10-security-and-trust-boundaries.md` §§4 and 10; `11-testing-principles.md` §§2–3 and 5;
   applicable `12-anti-patterns.md` sections; and `13-decision-checklist.md`.

## Projection depth targets

Do the implementer's first hour on paper. Produce a decision ledger for every unresolved choice
in the information-item registry, question/answer identity binding, unresolved-versus-deferred
semantics, strict workflow-state construction, raw-byte size check and error precedence, draft
reference origin validation, parsed-state ownership, and version derivation. Verify all twelve
expected paths are new and all imports they imply already exist or are explicitly introduced.

For every C1–C8 row, verify its fixture can be built now, its exact expected outcome is singular,
and its trace resolves to the cited authority. Re-derive the 45-row and 5-mutation totals; inspect
whether `maximalConformingState()` is fully determined by current caps and existing fixtures.
Check that caller-held workflow state remains transient and runtime-neutral except for explicitly
server-only domain work; no UI state, persistence, transport, or external call belongs here.

Do not invent implementation decisions, add a database, add client code, validate a future
approval envelope, create an API route, or alter Phase 5 contracts. Route every gap to its
authoritative home: plan amendment, intention decision card, or explicit delegated free choice.

## Evidence and closing

L4 budget: **zero runs**. Use only read-only inspection and any narrowly justified L1 command;
do not run the full suite. Write
`handoffs/reviewer/phase-06-projection-round-0.reviewer.md` with frontmatter (`plan: 6`,
`role: projection`, `round: 0`, verdict, date, actor), an owner-readable opening, immediately
followed by `⚠ OWNER DECISIONS REQUIRED (n)`, then the routed decision ledger, reality/criteria/
trace findings, and a clear `PROJECTED_CLEAN` or `AMENDMENTS_REQUIRED` verdict.

Do not update the tracker or phase Review log; the coordinator consumes and folds this handoff.
Your final chat message is the owner layer and links the handoff.
