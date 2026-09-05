---
plan: 3
role: implementer
round: 2
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — transport, error translation, content read (review fixes)
---

# Session prompt — fix phase 3, round 2

You are the implementer for the narrowly scoped phase-3 fix cycle in
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/implementation-executor.md` first and follow them as
your doctrine. Invoke the repository `architecture-context` skill before editing. The phase
plan is your task list; where this prompt differs from it, the plan wins.

## Gate check

Stop and report unless: the intention header is `RATIFIED`; master-plan tracker row 2 is
`APPROVED`; tracker row 3 is `IMPLEMENTING`; `http.ts` clears its timeout before body
consumption; `client.ts` selects `data[0]`; `variationIdSchema` accepts a comma; and
`schemas.ts` still exports `errorBodySchema`. Also confirm the folded phase manifest says
6 criteria, 51 rows, and 14 named mutations including C1(o), C3(g–h), C4(i–k), C5(f), and
MUT-03-10 through MUT-03-14.

Do not gate on a clean tree or a commit SHA. Record `git status --porcelain`; do not modify,
stage, revert, or count as drift the pre-existing generated `tsconfig.tsbuildinfo`, prior
handoffs/prompts, or the coordinator's plan/tracker edits. The owner may also have unrelated
frontend work; it is outside this phase.

## Read first

1. The charter and executor doctrine, especially delta-scoped fixes, evidence reuse, named
   mutations, checkpoints, and handoffs.
2. `handoffs/reviewer/phase-03-round-1.reviewer.md` in full. Its verified-correct surfaces are
   settled; do not re-review or alter them.
3. `plans/phase-03-proposales-transport-and-content.md` in full, including the coordinator fold.
4. `planing/proposal-preparation-backend-intention.md` §§10.1–10.2, 12.1, 17A.8, 17A.11–17A.13,
   and 17A.16; `planing/proposales-source-evidence.md` §3; master plan §§4–6.6, §9, §10.4.
5. Contracts `02` §§3, 9; `03` §§3–4; `04` §6; `06` §§2–8; `07` §§1–6; `10` §§2, 4, 7–8;
   `11` §§2–3, 5; `12` Server/Data/Integrations; and `14` §§8–9.

## Exact final perimeter

- `src/lib/proposales/http.ts`
- `src/lib/proposales/http.test.ts`
- `src/lib/proposales/client.ts`
- `src/lib/proposales/client.test.ts`
- `src/lib/proposales/schemas.ts`
- `src/lib/proposales/README.md`

Do not edit the plan, master plan, intention, contracts, reviewer/implementer handoffs,
fixtures, other source/test files, or frontend-owned files. Temporary probes may touch only
these six final-perimeter files and must be checksum-verified byte-identical after reversion.

## Required corrections

Resolve, do not relitigate, B1/B2 and S3–S6. The following correction clauses are quoted
verbatim from the independent review:

**B1 correction (verbatim):** “Keep the timer armed until the body has been read: clear
`timeoutHandle` after `readResponseBody` rather than after the race, or race
`readResponseBody` against the same `timeoutPromise`. Both the attempt timeout and the total
read deadline must govern headers *and* body. The status-before-body classification already in
`fromUpstream` is correct and must stay — this is about when the timer is disarmed, not about
ordering.”

Apply the folded exact outcomes: a stalled 2xx body is `timeout` with an aborted signal; a
stalled 503 body settles after each timeout as retryable `server_error`, retries exactly to the
read-attempt limit, and aborts every handed-out signal. Preserve bounded safe message/issue
enrichment for readable non-2xx responses. Do not introduce an unbounded enrichment wait.

**B2 correction (verbatim):** “Select by `String(item.variation_id) === parsedVariationId.data`
and return `null` on no match. Secondary, for coordinator routing: `variationIdSchema` admits
comma-separated lists (`^[0-9]+(,[0-9]+)*$`) while the method returns a single `ContentItem |
null`, so a multi-id query silently drops all but one. §17A.8's `get_content` tool input is
singular — either narrow the schema in this phase or record the list support as deliberate and
unused.”

The coordinator has resolved the secondary routing: narrow this singular client operation to
`^[0-9]+$`; a later plural operation requires its own type and criteria. Implement C4(i–k)
exactly.

**S3 correction (verbatim):** “A transport-level row: a 503 whose `text()` is a spy, asserting
the error is `server_error`/retryable without the body having been consulted first.”

Implement C1(o)'s folded Response-like getter/spying setup so restoration of body-before-status
ordering reddens the test. It is distinct from body-timeout coverage.

**S4 correction (verbatim):** “Add a C5 row for the four-digit-ISO sub-check and a named
mutation targeting it.”

Implement C5(f) with the stated year-10000 epoch and MUT-03-14; do not weaken the existing
invalid-date guard.

**S5 correction (verbatim):** “Consume it in `fromUpstream`'s body interpretation or delete it.”

Delete the unused `errorBodySchema`. `errors.ts`'s existing local defensive parsing stays within
the fixed perimeter; do not refactor it.

**S6 correction (verbatim):** “Strip the backslashes.”

Correct only the literal backslashes preceding Markdown inline-code backticks in the integration
README. Do not rewrite the historical implementer handoff.

Run and revert exactly MUT-03-10 through MUT-03-14. Cite the 9 prior mutations from checkpoint
`5227b3f` rather than rerunning them. The updated coverage map must cover all 51 rows and map
all phase-authored tests back to a row: the seven new rows are additional targeted assertions,
so the expected final phase total is 62 tests across the same six files.

N7 and N8 are explicitly routed to phase 4; N9 and N10 are records only. Do not fold any of
them into this cycle.

## Evidence and closing

**L4 budget: exactly one run.** Run closing `npm test` once on the handed-over tree, recording
HEAD plus dirty-tree diff digest and the failure-ID delta. Run `npm run typecheck` and
`npm run lint`; use L1/L2 for implementation and the five new mutations. If foreign concurrent
work makes a broad check fail, record it as foreign worktree state; do not alter it.

Create a checkpoint commit `CHECKPOINT (not approved): phase 03 fix round 2 …` containing only
the six final-perimeter files. Do not absorb coordinator documentation, prior handoffs/prompts,
frontend work, or `tsconfig.tsbuildinfo`. Update only tracker row 3 to `IMPLEMENTED`, append the
Review-log entry, complete the documentation-impact review, and write
`handoffs/implementer/phase-03-round-2.implementer.md`.

The handoff must distinguish final writes from reverted probes; map all 51 rows to tests and all
phase tests back to rows; and account for the closed 14-mutation ledger as 9 checkpoint-cited
unchanged mutations plus 5 newly executed mutations — never imply the first 9 were rerun. No
owner card is expected unless a new authority conflict arises. Archgraph is absent; skip it
silently. Use the charter owner layer in your final chat message.
