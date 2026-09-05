---
plan: 3
role: reviewer
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — transport, error translation, content read
---

# Session prompt — review phase 3 (round 1)

You are the independent **reviewer** for phase 3 of
`initial_core_feature_proposales` in `/Users/davidloorenz/Desktop/Developer/Proposales`.
This is its first implementation review and must be performed by a model other than the
Codex implementer.

Invoke the `plan-reviewer` skill and follow its doctrine. Also invoke the repository's
`architecture-context` skill before evaluating the diff. Read
`/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/plan-reviewer.md` first.

**You review and report; you do not fix production code.** Temporary, applied-and-reverted
mutation probes are permitted only under the reviewer doctrine. The phase plan is the task
list; where this prompt differs from it, the phase plan wins.

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status | `planing/proposal-preparation-backend-intention.md` header reads `RATIFIED`. |
| 2 | Predecessor gate | tracker row 2 in `master-plan.md` §4 reads `APPROVED`. |
| 3 | Review entry state | tracker row 3 reads `REVIEWING`. |
| 4 | Review target exists | `5227b3ff144c27d0db2b0ab89d839a99516330e7` resolves; its parent is `1d33f640f329cde8843bf3dd4fbd777c0909937b`; the initial checkpoint's parent is `6722d19c0c96970d31237a0556fe63d612039a2c`. |

Do not gate on a clean worktree or a file count. The known dirty paths at dispatch are the
generated `tsconfig.tsbuildinfo`, the unconsumed implementer handoff, and coordinator
documentation for this review dispatch. Inspect and record `git status --porcelain`, but
never modify, stage, revert, or report those paths as phase-3 implementation drift.

## 2. Exact reviewed perimeter and evidence boundary

The final implementation target is checkpoint
`5227b3ff144c27d0db2b0ab89d839a99516330e7` (`CHECKPOINT (not approved): phase 03 transport ordering`).
The full phase implementation perimeter is the output of:

```sh
git diff --name-status 6722d19c0c96970d31237a0556fe63d612039a2c 5227b3ff144c27d0db2b0ab89d839a99516330e7
```

It must contain the two shared error files, the 16 new Proposales source/test/fixture/README
files, and only the phase-3 plan plus the master-plan tracker as documentation. The follow-up
checkpoint itself changes only `src/lib/proposales/http.ts` and the append-only phase Review
log. Do not use a diff against the current dirty tree to reconstruct this perimeter.

The implementation handoff is
`handoffs/implementer/phase-03-round-1.implementer.md`. Reconcile it adversarially:

- 6 criteria / 44 criterion rows / 9 named mutations; derive the criterion rows rather than
  counting table lines.
- 55 phase tests in the six listed files and a reverse coverage map with no orphan phase test;
  distinguish the inherited phase-2 assertions in `app-error.test.ts`.
- one prior L4 stamp on the final checkpoint: `npm test` = 11 files / 111 tests, typecheck and
  lint passed. Its recorded generated-file digest is evidence about the checkpoint, not a
  reusable stamp for your review tree.
- all nine named mutations were re-run and reverted after the transport-ordering checkpoint;
  do not repeat an identical mutation simply to claim independence.
- declared production/docs write perimeter is exact; mutation and guard probes were reverted.

## 3. Read order

1. The charter and reviewer doctrine above — especially first-review depth, trace chain,
   evidence reuse, mutation testing, and closing protocol.
2. `master-plan.md` §§4–6.6, §9, and §10.4; read R3, R5, R10, R11, and R13.
3. `planing/proposal-preparation-backend-intention.md` §§10.1, 12.1, 17A.8, 17A.11–17A.13,
   17A.16, §21.4, and measurement ledger M3, M5, M6, M8, M13, and M14.
4. `plans/phase-03-proposales-transport-and-content.md` in full, including every criterion,
   Notes, and Review log; then the implementer handoff above.
5. `planing/proposales-source-evidence.md` §§1–3, §6–§8.1 and
   `api-documentation/proposales/openapi.json` for the cited endpoints and error shape.
6. Applicable contracts: `02-runtime-boundaries.md` §3; `03-feature-architecture.md` §§3–4;
   `04-server-architecture.md` §§6, 8; `06-data-contracts-and-validation.md` §§2–8;
   `07-integrations.md` §§1–6; `10-security-and-trust-boundaries.md` §§1–2, 4, 7–8;
   `11-testing-principles.md` §§2–3, 5; `12-anti-patterns.md` (Server, Data and validation,
   Integrations); `13-decision-checklist.md` §1; and `14-documentation-principles.md` §§8–9.
7. The checkpoint diff, all phase source/tests/fixtures, and the existing test setup/config only
   insofar as needed to understand the runner and server-only boundary.

## 4. Full first-review checklist and phase-specific probes

Re-derive every C1–C6 row from its semantic authority and verify the mapped test bites on the
actual production path. Confirm the server-only perimeter is at the module boundary, the
transport is endpoint-agnostic, client methods alone place `company_id`, only GET reads retry,
and the factory/fake expose exactly the presently authorized read surface. Verify that schemas
strip unknown upstream data, validate before mapping, and that no raw upstream body, URL, or
headers cross a public `ProposalesError` / DTO boundary.

Check the complete §17A.13 precedence table, including adjacent cases rather than fixture
happy paths: status vs malformed/unreadable error body, 2xx malformed/unreadable body,
transport rejection, and timeout. Verify retry counting, overall deadline clamping, abort
discrimination, no retry start after deadline, and write non-retry behavior structurally as
well as by tests.

Spend fresh evidence on the transport seam the existing handoff does not demonstrate: a fetch
that resolves to a Response-like value whose `text()` never settles. With controlled time:

- for a 503, status-before-body precedence requires a retryable `server_error` path and bounded
  read retries without waiting forever for the body;
- for a 2xx, the request must remain governed by its attempt/total timeout and settle as the
  correct timeout failure rather than hang after headers arrive.

This is a required review variation of C1(m), C1(k), C3(a), and C3(f), grounded in the plan's
"Every request" timeout contract and ratified status-before-body rule; it is not a request to
expand scope. Apply/revert/checksum any probe files under the reviewer doctrine.

Also examine error-message issue mapping with invalid/mixed issue entries and source-order caps;
multiple content matches versus the recorded defensive first selection; unknown keys at each
wire-schema nesting level; epoch boundary behavior; and the fake's no-write behavior. Treat
the latter first-selection judgment as a recommendation only if it does not contradict an
authority. Do not add pagination, proposal create/recovery/read-back, persistence, UI, a live
network suite, or phase-4 scaffolding.

## 5. Evidence budget

**L4 budget: exactly one run.** The mandatory review-entry current-tree stamp is `npm test`.
Before it, record the current tree identity (HEAD plus a dirty-diff digest), command, and
failure-ID delta. If concurrent non-phase work makes it fail, record it as a foreign-worktree
note, distinguish it from a phase defect, and do not alter that work to make it pass.
`npm run typecheck` and `npm run lint` remain required closeout checks; run targeted L1/L2
commands and the required fresh variation/mutation probes as justified. Do not repeat the
implementer's identical targeted or L4 command merely for independence.

Every probe must state hypothesis, command, observed result, files touched, and restoration
verification. Revert it and checksum-verify affected files are byte-identical before closing.
There is no database or other state side effect in this phase.

## 6. Closing protocol

1. Append the technical finding layer — verified-correct surfaces, each finding's
   severity/authority/correction, probe declaration, and plan lessons — to the phase Review log.
2. Update **only tracker row 3** from `REVIEWING` to `APPROVED` or `CHANGES_REQUESTED`, with
   date, actor, and a one-line result.
3. Write `handoffs/reviewer/phase-03-round-1.reviewer.md` with row-schema frontmatter; opening
   result; findings by severity; verified-correct surfaces; evidence; full write perimeter;
   probe declaration; lessons for plans; carry-forward dispositions for approval notes; and
   `⚠ OWNER DECISIONS REQUIRED (n)` immediately after the opening summary. If zero cards are
   needed, say so explicitly.
4. Archgraph is absent; skip it silently. Do not fix source code or create an approval commit.

Your final chat message is the charter owner layer: state of the build, what the verdict means,
what happens next, and exactly what needs the owner. Point to the handoff rather than pasting
its technical content.
