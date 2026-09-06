---
plan: plans/phase-09-agent-runtime.md
role: projection
round: 0
date: 2026-09-06
---

# Phase 9 projection round 0 — the agent runtime

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/plan-projection.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy (`agent-skills/policy/architecture-context-policy.md` →
`architectural_contracts/01-implementation-contract-guide.md`) before any design reasoning.

**You write no code.** Your output is a decision ledger the coordinator folds into the plan before
an implementer is dispatched. Rank-12 projection — the highest gate in this project — because this
phase is the application's engine: the bounded loop, the three budgets, the one output retry, and
the two read tools. Everything after it consumes what you settle here.

## Start gate — check by content, then begin

1. Intention line 5 says `RATIFIED`; §23 ends at **round 18**.
2. Master §4 rows 1–**8** are `APPROVED`; row 9 is `NOT_STARTED`.
3. `src/lib/agent/` does **not** exist, and neither does
   `src/features/proposal-preparation/server/tools/`.
4. `src/lib/ai/` exists with twelve files, and `src/lib/ai/index.ts` exports `createAiClient`,
   `createScriptedAiClient` and `createFailingAiClient`.
5. The phase-9 plan header says `state: NOT_STARTED` and its table declares **6 criteria / 22 rows /
   4 mutations** — re-derive these by counting the table, do not read the line.

If any is false, write a handoff saying which and stop.

## Read

1. `plans/phase-09-agent-runtime.md` in full, including its Notes — two are inherited obligations
   you must discharge, named below.
2. Its Read-first list.
3. **`plans/phase-08-ai-provider-boundary.md`'s Review log in full.** Phase 8 is the layer directly
   beneath you and it went three rounds. What it learned is what you are being asked not to repeat.
4. Master §6.3 (`RunFailureReason`), §6.4 (`AgentMessage` in its three closed forms,
   `ToolDescriptor`, `GenerateStepResult`, `RunResult`, `ToolContext`, `RunBudgets`), §6.5, §6.6,
   §9.0, §9.0.2, and **§9.1 rules 14–18 with the two planner lints that follow them**.
5. Master §12 — one open owner card is staged to you.

## What phase 8 cost, stated so you can price your own work

Phase 8 shipped 26 acceptance rows. Across a projection, an implementation, a review and two
coordinator probe rounds, **nine of its guards could not fail.** The two worst were not guards with
a second sufficient cause — they were guards with **zero production causes**: `C4(h)` and `C4(i)`
specified fixtures the vendor SDK never builds, so the network-failure path had no classification at
all and `invalid_response` — a reason the owner had ratified one session earlier for exactly that
condition — was **unreachable in production**, while every test passed and every named mutation
reddened as designed. The defect was found only when a reviewer drove the real library end to end.

Mutation testing cannot catch that class. A mutation proves the test observes the code; it cannot
prove the code observes the world. **Your ledger is where that gets caught**, because you are the
only session that reads the libraries before the fixtures are written.

## The four things this projection must settle

**1 — `MAX_SEARCH_QUERY_CHARS` (inherited, plan Notes, owner card of the phase-7 projection).**
The human search box and this phase's `search_content` tool share **one** bound. Add a criterion row
asserting the tool's input bound **is that imported constant**, not a second literal `200`. Two
literals are two bounds that drift silently, which is the whole reason the owner ratified the rule.
Say what the row asserts and what named mutation proves it can fail.

**2 — the purity guard's form list (inherited, plan Notes, §9.1 rule 16).** This phase's tool
boundary wants the guard `rank-candidates.ts` carries, and it inherits the complete list: static
import, `import type`, dynamic `import()`, global access. **And now §9.1 rule 17**: if you specify
an instrument and a row proving that instrument, the proof must exercise **the same symbol** the
guard applies, not an equivalent expression of it. Phase 8 shipped a scanner and its proof as two
regex literals; weakening the guard left the proof green. Write the rows so that cannot recur, and
name the shared symbol in the row text.

**3 — every fixture is a shape the boundary can actually produce (§9.1 rule 18).** For this phase
the boundary is mostly *ours*, which makes it subtler, not safer: `createScriptedAiClient` is the
seam every loop row runs through, so **a hand-written step shape that `createAiClient` cannot
produce is phase 8's defect one level up.** Check each scripted fixture against phase 8's real
`GenerateStepResult` and `Usage` — for example, `C4(c)`'s `inputTokens: null` is a shape phase 8
*does* produce, while a usage object missing a key is not. Where a row names a failure from a tool
or from the client, cite where that object is constructed.

**4 — coverage adequacy, and say so plainly.** 22 rows and 4 named mutations for the bounded loop,
three budgets, usage accumulation, a bounded retry and two tools. Phase 8's error boundary needed
51 rows and 22 mutations before its guards could fail. Judge whether this table is proportionate to
what it guards, and route what is missing. Areas the coordinator suspects are thin, offered as
starting points and not as conclusions: `C3` checks each budget once and nothing checks two budgets
exhausting on the same step; the loop's message-append behaviour between steps (`AgentMessage` tool
results) has no row; `C5(a)`'s "contains the issue paths and not the raw model text" is two claims
in one cell; `C6(c)`'s key-exactness has no mutation; `RunFailureReason`'s `tool_output_invalid`
appears in `C1(b)` at the tool but nowhere at the run level. **Do not pad.** Master §9.0 is
binding — this is an MVP the owner is presenting, so trim by reducing an ask, never by dropping a
guard, and record every exclusion where the excluded work lives.

## Owner card staged to you (master §12)

Phase 8 answered its card by **staging** this question here, because phase 9 is where the run loop
and `MAX_OUTPUT_RETRIES` consume it. **Re-put it as a card, with the branches restated**; the owner
has seen it once and gave a leaning that is recorded verbatim in master §12 and is **not** to be
treated as the decision.

*The question:* a generation that finishes because it hit its token ceiling arrives with nothing
usable. Phase 8 currently reports it as a provider failure with reason `invalid_response` — a member
whose ratified meaning is "the provider's reply cannot be decoded", when in fact the reply decoded
perfectly and was merely cut off. Determine what phase 9 needs, then put the branches to the owner:
keep it as a provider failure; add a tenth `AiProviderFailureReason`; or treat it as an unusable
answer the run loop owns, which would let the one bounded output retry apply and would touch
`GenerateStepResult`. Say which serves the run loop best and why. **Read master §12 for the exact
wording of the owner's recorded leaning before you write the card** — it names a different branch
from the phase-8 review's recommendation, and the point of re-putting the card is to let the owner
resolve that in the phase where it lands.

## Ledger

Route **every** decision point. Class each row: **P** coordinator amends this phase plan · **M**
coordinator amends the master registry · **I** owner decision, folded intention-first · **F**
explicit implementer delegation. State the P/M/I/F totals and make them reconcile against the rows
you actually list — arithmetic in a ledger has been wrong in this project before. A row that is
merely an observation is a note, and notes are routed to the phase that owns them, not left here.

Phase 8 registered `AgentMessage`, `ToolDescriptor`, `Usage`, `JsonSchema` and `GenerateStepResult`
in master §6.4 for you to **consume, not re-derive** (projection D03, forwarded to you by name).
If any of them is wrong or insufficient for the loop, that is an **M** row and it is important —
say so now, not after the loop is written against it.

## Evidence budget

**Zero.** No test at any scope, no L4 stamp, no named mutation, no `npm install`, no provider call,
no network. Filesystem and artifact inspection, and reading installed library source, are your
evidence — and reading library source is expected of you, not optional. If you believe a run is
required, write the authorization line and its justification *before* running it, and say in the
handoff that you did.

Do not modify `package.json` or the lockfile. Do not write code, tests, or the phase plan; your
only writes are your handoff and, if the coordinator's gate row is stale, master §4 row 9.

## Handoff

`handoffs/reviewer/phase-09-projection-round-0.handoff.reviewer.md`, verdict `READY` or
`AMENDMENTS_REQUIRED`. Include: the gate check with what you observed; the re-derived counts with
summands; the decision ledger with reconciling totals; a row-by-row decidability pass over all 22
rows saying, for each, whether a concrete assertion can be written **and whether its fixture is a
shape the system can produce**; the forward and reverse ledger traces; the owner card; and your
full write perimeter.
