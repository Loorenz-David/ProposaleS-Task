---
plan: 2
role: reviewer
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Errors, logger, shared value shapes
---

# Session prompt — review phase 2 (round 1)

You are the independent **reviewer** for phase 2 of
`initial_core_feature_proposales` in `/Users/davidloorenz/Desktop/Developer/Proposales`.
This is the first implementation review and must be performed by a model other than the
Codex implementer.

Invoke the `plan-reviewer` skill and follow its doctrine. Also invoke the repository's
`architecture-context` skill before evaluating the diff. Read
`/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/plan-reviewer.md` first.

**You review and report; you do not fix production code.** Temporary, applied-and-reverted
mutation probes are permitted only under the reviewer doctrine. The plan file is your task
list; where this prompt differs from it, the plan file wins.

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status | `planing/proposal-preparation-backend-intention.md` header reads `RATIFIED` |
| 2 | Predecessor gate | tracker row 1 in `master-plan.md` §4 reads `APPROVED` |
| 3 | Review entry state | tracker row 2 reads `REVIEWING` |
| 4 | Review target exists | `b0cd457fb3b2df02907657a9c4714e2ac382f420` resolves and its parent is `feffdd546d17a2a44bb50037b334a3da5a85bfa0` |

Do not gate on a clean worktree or on any file count. The owner is concurrently changing
the frontend layout and styling; the coordinator also has uncommitted project documentation.
Inspect and record `git status --porcelain`, but never modify, stage, revert, or report those
foreign paths as phase-2 implementation drift.

## 2. Exact reviewed perimeter and evidence boundary

The implemented phase is the checkpoint commit
`b0cd457fb3b2df02907657a9c4714e2ac382f420` (`CHECKPOINT (not approved): phase 02 errors logger values`).
Its exact implementation perimeter is the output of:

```sh
git diff --name-status b0cd457^ b0cd457
```

It must contain exactly the 12 planned new source/test files plus the phase-2 plan and the
master-plan tracker row. Do **not** use `git diff` against the current dirty tree to reconstruct
that perimeter: current frontend changes are owner work outside this phase. `a14c201` only
records the implementer handoff; it is not implementation scope.

The implementation handoff is
`handoffs/implementer/phase-02-round-1.implementer.md`. Reconcile it adversarially:

- 7 criteria / 50 criterion rows / 16 named mutations; the physical table has grouped spans,
  so derive its rows rather than counting table lines.
- 44 phase tests and a reverse mapping with no orphan test; verify the mapping against the
  actual test declarations, including parameterized cases.
- one prior L4 stamp on `b0cd457`, with the dirty-tree digest recorded in the handoff; its
  identity does not match the present owner/coordinator worktree, so it is evidence about the
  checkpoint, not a reusable current-tree stamp.
- declared own write perimeter: 12 phase code/test files, `master-plan.md`, and the phase plan;
  declared mutation-probe files are a subset of the production files and must be byte-identical
  at the checkpoint.

## 3. Read order

1. The charter and reviewer doctrine above — especially first-review depth, trace chain,
   evidence reuse, mutation testing, and closing protocol.
2. `master-plan.md` §§4–6.4, §9, and §10; read R6, R9, R12, and R16.
3. `planing/proposal-preparation-backend-intention.md` §§17A.1, 17A.2, 17A.13, 17A.16,
   **17A.18**, and measurement ledger **M20**.
4. `plans/phase-02-errors-logger-values.md` in full, including every criterion and Review log.
5. Applicable contracts: `02-runtime-boundaries.md` §§3, 5–8;
   `03-feature-architecture.md` §§3–4; `04-server-architecture.md` §§6, 10;
   `06-data-contracts-and-validation.md` §§4, 6, 8–9;
   `10-security-and-trust-boundaries.md` §7; `11-testing-principles.md` §§2–3, 5;
   `12-anti-patterns.md` “Server” and “Data and validation”; `13-decision-checklist.md` §1;
   `14-documentation-principles.md` §8.
6. The checkpoint diff and the 12 phase implementation/test files. Read the current phase-1
   test/configuration foundation only to understand actual runner and boundary behavior:
   `eslint.config.mjs`, `vitest.config.mts`, and `test/setup/node.ts`.

## 4. Full first-review checklist and phase-specific probes

Re-derive every criterion C1–C7 against its semantic authority and verify each test bites on
the production path. Check that runtime-neutral error/DTO/value modules contain no server-only,
environment, Node-only, or client dependency; `logger.ts` must be server-only. Verify the error
taxonomy table, one ordered `ERROR_CODES` source, closed local reason registries, DTO Zod enum
derivation, generic unknown-error response, and that error causes never cross the DTO boundary.

For the logger, inspect rather than merely exercising the happy fixtures. In addition to the
named mutations already recorded, vary at least one *different* shape for each material concern:

- plain object with a null prototype and ordinary repeated references; hostile own keys such as
  `__proto__`; accessor/proxy-like fields; bigint or a non-finite number; sibling references
  versus an ancestor cycle;
- a sensitive key at a different nested array/object location and a mixed-case spelling that is
  not the exact fixture spelling;
- whether the walk can invoke a foreign getter or `toJSON`, mutate the caller, omit a plain key,
  throw, or permit a caller field to alter `level`, `event`, or `time`.

Judge each variation only against §17A.18/M20; do not invent a broader logging product.
Check that the default sink behavior meets the exact one-write, newline-delimited framing
contract without depending on test-double artefacts.

For value and DTO shapes, vary a multi-index Zod issue path, strict-union extra/missing keys,
non-integer/string money values, timestamp/UUID boundary forms, and empty string path segments.
Examine whether every claimed JSON round-trip or absence guarantee actually passes through the
implemented schema/value path rather than a hand-built literal. Evaluate the delegated choices
on their merits, but route a real semantic addition as a recommendation rather than silently
changing the authority.

Treat the following as scope fences, not omissions: no `ProposalesError` (phase 3), no
`AiProviderError` (phase 8), no transport, agent, feature schema, or phase-15 global scanner.
Do not review or change the owner's frontend layout work.

## 5. Evidence budget

**L4 budget: exactly one run.** The mandatory review-entry current-tree stamp is `npm test`.
Before it, record the current tree identity (HEAD plus a digest of `git diff` because the tree is
dirty), the command, and the failure-ID delta. If concurrent frontend work makes it fail, record
the result as a foreign-worktree note, distinguish it from a phase-2 defect, and do not alter the
owner's files to make it pass. `npm run typecheck` and `npm run lint` remain required closeout
checks; run targeted L1/L2 commands and mutation probes for changed/varied hypotheses. Do not
repeat the implementer's identical targeted or L4 command merely for independence.

Every probe must state its hypothesis, command, observed result, and the files touched; revert
it and checksum-verify those files are byte-identical before closing. There is no database or
other state side effect in this phase.

## 6. Closing protocol

1. Write the technical finding layer (including verified-correct surfaces, each finding's
   severity/authority/correction, mutation-probe declaration, and any plan lessons) to the
   append-only Review log in `plans/phase-02-errors-logger-values.md`.
2. Update **only tracker row 2** from `REVIEWING` to `APPROVED` or `CHANGES_REQUESTED`, with
   date, actor, and a one-line result. Do not modify frontend-owned files.
3. Write `handoffs/reviewer/phase-02-round-1.reviewer.md` with row-schema frontmatter; opening
   result; findings by severity; verified-correct surfaces; evidence; full write perimeter;
   probe declaration; lessons for plans; carry-forward dispositions for any approval notes; and
   `⚠ OWNER DECISIONS REQUIRED (n)` immediately after the opening summary. When zero cards are
   needed, say so explicitly.
4. Archgraph is absent; skip it silently. Do not fix source code or make an approval commit.

Your final chat message is the charter owner layer: state of the build, what the verdict means,
what happens next, and exactly what needs the owner. Point to the handoff rather than pasting
its technical content.
