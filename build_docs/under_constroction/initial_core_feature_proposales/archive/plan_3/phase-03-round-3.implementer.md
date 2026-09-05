---
plan: 3
role: implementer
round: 3
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — final review fixes
---

# Session prompt — fix phase 3, round 3

You are the implementer for the final, delta-scoped phase-3 fix cycle in
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/implementation-executor.md` first and follow them as your
doctrine. Invoke the repository `architecture-context` skill before editing. The phase plan is
your task list; where this prompt differs from it, the plan wins.

## Gate check

Stop and report unless: the intention header is `RATIFIED`; master-plan tracker row 2 is
`APPROVED`; tracker row 3 is `IMPLEMENTING`; the phase plan says 6 criteria, 51 rows, and 16
named mutations; and checkpoint `44e39e4` contains the round-2 transport/content fixes. Confirm
the known delta is present: `http.ts` has the post-race `timedOut || controller.signal.aborted`
branch, C1(l) reuses one response, and C1(m)/C3(c) reuse one response over retries.

Do not gate on a clean tree or a commit SHA. Record `git status --porcelain`; do not modify,
stage, revert, or count as drift the pre-existing generated `tsconfig.tsbuildinfo`, prior
handoffs/prompts, or coordinator plan/tracker edits. The owner may have unrelated frontend work;
it is outside this phase.

## Read first

1. The charter and executor doctrine, especially delta-scoped fixes, mutations, checkpoints, and
   handoffs.
2. `handoffs/reviewer/phase-03-round-2.reviewer.md` in full. Its verified-correct surfaces are
   settled; do not re-review or alter them.
3. `plans/phase-03-proposales-transport-and-content.md` in full, including the final coordinator
   fold.
4. `planing/proposal-preparation-backend-intention.md` §§10.1–10.2, 12.1, 17A.8, 17A.11–17A.13,
   and 17A.16; `planing/proposales-source-evidence.md` §3; master plan §§4–6.6, §9, §10.4.
5. Contracts `02` §§3, 9; `03` §§3–4; `04` §6; `06` §§2–8; `07` §§1–6; `10` §§2, 4, 7–8;
   `11` §§2–3, 5; `12` Server/Data/Integrations; and `14` §§8–9.

## Exact final perimeter

- `src/lib/proposales/http.ts`
- `src/lib/proposales/http.test.ts`
- `src/lib/proposales/client.test.ts`

`client.ts` may be changed only temporarily for MUT-03-16 and must be byte-identical before the
checkpoint. Do not edit the plan, master plan, intention, contracts, reviewer/implementer
handoffs, fixtures, other source/test files, documentation, or frontend-owned files. Temporary
probes may touch only these four paths and must be checksum-verified byte-identical after
reversion.

## Required corrections

Resolve, do not relitigate, S7/S8; fold N11/N12 exactly as recorded. These correction clauses are
quoted verbatim from the independent re-review:

**S7 correction (verbatim):** “delete the block — the `:105` catch and the normal `:132`/`:142`
path already produce both classifications it can produce — or, if it is deliberately retained as
defence in depth, add the criterion row and named mutation that make it fire.”

Delete the post-race `if (timedOut || controller.signal.aborted)` branch. Do not replace it with
another defensive branch. Keep the settled body race, status-before-body handling, retry bounds,
and error redaction unchanged.

**S8 correction (verbatim):** “give each call its own `Response` via a `mockImplementation`
factory, **and** pick a fixture whose offending text a naive implementation would actually
surface — `{ "unexpected": 1 }` produces a zod issue of path `["data"]` that never contains the
searched string, so the assertion stays weak even once it is asserted against the right error.”

For C1(l), make every call receive a fresh schema-invalid 200 response containing a distinctive
body string (the phase plan names `SCHEMA-BODY-SENTINEL`). Assert that the second caught error is
also `schema_mismatch`, then assert that `JSON.stringify(toErrorDto(error))` does not contain the
sentinel. The fixture and assertion must make a naive public-message leak fail.

Fold N12: C1(m) and C3(c) must return a fresh response from a `mockImplementation` factory for
each retry, preserving their existing criteria. Fold N11: retain C3(h)'s assertions and execute
MUT-03-15, which temporarily changes the non-2xx body-timeout catch to rethrow the timeout rather
than reclassify the known status; C3(h) must redden on its `reason` and absent/expected `status`,
not merely hang.

Execute and revert MUT-03-16: temporarily construct C1(l)'s public schema-failure
`ProposalesError` with `JSON.stringify(body)` as its message in `client.ts`; the sentinel-redaction
assertion must redden. Checksum-verify `client.ts` is byte-identical after reversion. Cite
MUT-03-1 through MUT-03-14 from their existing checkpoints; do not rerun them. The ledger closes at
16 named mutations: execute only MUT-03-15 and MUT-03-16 in this cycle.

N7/N8 remain phase-4 work; N9/N10 remain records. Do not fold them into this cycle.

## Evidence and closing

Keep the target suite at 62 tests. Map all 51 criterion rows to tests and all phase-authored tests
back to rows. Use L1/L2 for implementation and the two new mutations. **L4 budget: exactly one
run.** Run closing `npm test` once on the handed-over tree, recording HEAD plus dirty-tree diff
digest and the failure-ID delta. Run `npm run typecheck` and `npm run lint`; if foreign concurrent
work makes a broad check fail, record it as foreign worktree state and do not alter it.

Create a checkpoint commit `CHECKPOINT (not approved): phase 03 fix round 3 …` containing only
the three final-perimeter files. Do not absorb coordinator documents, prior handoffs/prompts,
frontend work, or `tsconfig.tsbuildinfo`. Update only tracker row 3 to `IMPLEMENTED`, append the
phase Review-log entry, complete the documentation-impact review, and write
`handoffs/implementer/phase-03-round-3.implementer.md`.

The handoff must distinguish final writes from reverted probes; identify exactly where each new
mutation reddened; map all 51 rows to tests and all phase tests back to rows; and account for the
16-mutation ledger as 14 checkpoint-cited mutations plus MUT-03-15/16 executed and reverted. No
owner card is expected unless a new authority conflict arises. Archgraph is absent; skip it
silently. Use the charter owner layer in your final chat message.
