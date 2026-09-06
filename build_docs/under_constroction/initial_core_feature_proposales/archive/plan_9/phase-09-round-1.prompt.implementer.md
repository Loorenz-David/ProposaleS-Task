---
plan: plans/phase-09-agent-runtime.md
role: implementer
round: 1
date: 2026-09-07
---

# Phase 9 round 1 — the agent runtime

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy (`agent-skills/policy/architecture-context-policy.md` →
`architectural_contracts/01-implementation-contract-guide.md`) before your first design decision.

**This is the engine.** The bounded loop, the three budgets, the one output retry, and the model's
two ways of looking things up. Phases 10–14 all run through what you build here.

**The plan owns the work.** Read `plans/phase-09-agent-runtime.md` in full — tasks, the 34-row
table, the Notes and the whole Review log — plus its Read-first list. Where this prompt and the plan
differ, the plan wins; where the plan and the intention differ, the intention wins and you stop and
say so.

## Start gate — check by content, then begin

1. Intention line 5 says `RATIFIED`; §23 ends at **round 18**.
2. Master §4 rows 1–8 are `APPROVED`; row 9 is `PROMPT_READY`.
3. The phase-9 plan header says `state: PROMPT_READY` and its table declares **7 criteria / 34 rows
   / 13 distinct mutations**, containing rows `C7(a)`–`C7(d)`.
4. Master §6.3 carries a closed **`ToolErrorCode`** registry with three members; §6.4 carries
   `ToolInvokeResult`, `RecordedToolCall` and `contentDetailSchema`; §6.6's `run` row names
   `toolContext`.
5. `src/lib/agent/` and `src/features/proposal-preparation/server/tools/` do not exist.
6. Master §9.1 has **rules 17 and 18**; master §12's phase-8 card row reads **CLOSED, answered
   branch 1**.

If any is false, write a handoff saying which and stop.

## What the projection already settled — do not re-derive it

A rank-12 projection routed 26 decisions into the plan and the registry before you were dispatched.
The plan's tasks and table are the result. Two things it settled that you would otherwise have to
guess: the loop could not invoke a tool at all (nothing supplied `ToolContext` — hence
`toolContext` on `run`), and `get_content` had no representable output (hence `contentDetailSchema`;
neither `ContentCandidate` nor `ContentItem` was usable, one demanding a score and the other
carrying `createdAt` and `images` the model must never see).

**Facts already run, so you don't:** `z.toJSONSchema(schema, { io: "input" })` does **not** throw on
either real tool schema — `get_content` emits `{"type":"string","pattern":"^[1-9]\\d*$"}` and
`search_content` emits `{"minLength":1,"maxLength":200}`. It **silently drops `.refine()`**, so the
int64 ceiling never reaches the model; the runtime parse remains the only enforcement, and that
gap is the production cause C5(b)'s object-shaped fixture cites. And a truncated generation arrives
as `{ kind: "final", output: "<raw string>" }`, not as an error — which is why C5(a)'s fixture is a
string.

## Delegated to you explicitly (projection D11, D25)

Yours to choose; the plan deliberately does not fix them. Report each choice and why.

- **The loop's internal control-flow shape** — `while`, recursion, a step function; your call.
- **Whether `invoke` is `async`.**
- **The retry `user` message's wording**, beyond C5(a)'s "carries the issue paths" and C5(d)'s
  "carries no model text". Both claims are rows; the prose between them is yours.
- **The Zod-issue flattening idiom.** Four sites already spell it `issue.path.map(String)`
  (`services/search-content-for-human.ts:28`, `schemas/workflow-state.ts:62`,
  `lib/proposales/client.ts:25`, `lib/errors/error-dto.ts:32`). **Reuse that spelling and do not
  refactor the four** — master §11 follow-up 7 owns the consolidation.
- **D11's option set**: `run` must always pass `outputJsonSchema` (otherwise `generateText` falls
  back to its text spec and every final arrives as a string, making C5 trivially true). Report the
  options you needed, if any beyond `{ io: "input" }`.

## Constraints that are not yours to trade

- **`invoke` does not catch a throw from `execute`.** A thrown value is a programming error and
  propagates (contract `04` §6). Deliberate, and no row asserts it — do not add a try/catch to be
  helpful.
- **Two counters, not one** (plan task 2, C4(c–d)): the reported `usage` stays null-propagating for
  §17A.14, while the **token budget** compares against a counter treating an unreported figure as
  `0`. One unreported step must not switch the budget off for the rest of the run.
- **`elapsed >= wallTimeMs`**, so the per-call ceiling is never non-positive.
- **`remainingBudget` is computed fresh before each `invoke`.** A stale budget in `ctx` is invisible.
- **Tool results reach the model as labeled data**, correlated by `toolCallId`, never concatenated
  into the system prompt or an instruction (§9.1 rule 3, `10` §6).
- **Ids and outcome only in the operational record** — no arguments, no outputs, no model text
  (`08` §10, `10` §7).
- `server-only` in every new production module. `src/lib/agent/` must not import `src/features/`
  (contract `03`), and no vendor SDK or bare `"ai"` import may appear in it — C2(d) scans for both.

## Two instruments, two jobs — build them as one symbol

C2(d) and C2(e) share **one** module-scope pair in `test/helpers/agent-boundary-scan.ts`: the
predicate and the scanned-file listing. C2(e) must exercise **the same symbol** C2(d) applies, not
an equivalent regex. Phase 8 shipped a scanner and its proof as two literals; weakening the guard
left the proof green, and repairing that cost a round. §9.1 rule 17 exists because of it.

Likewise the owner's one-bound decision needs both halves: C2(d)'s scan is the **identity** guard
(both values are `200`, so no runtime assertion can distinguish the constant from a literal) and
C6(e) is the **behavioural** guard. Neither alone carries both claims.

## Perimeter — 13 paths, four of them existing files

New: the nine files the plan lists, plus `test/helpers/agent-boundary-scan.ts`.
**Additive changes to existing files**, declared here so you do not discover them:
`src/lib/ai/scripted.ts` and `scripted.test.ts` (add `stepOptions` recording — additive, so phase
8's and phases 11–12's `calls` assertions are untouched), and
`src/features/proposal-preparation/schemas/content-candidate.ts` (add `contentDetailSchema`).

Plus your handoff and this plan's Review log and state. **Nothing else** — no `package.json`, no
lockfile, no `.env.example`, no change to `rank-candidates.ts` (MUT-09-10 mutates it as a probe and
reverts it; that is not a write).

`tsconfig.tsbuildinfo` is tracked and every `tsc` rewrites it: attribute it, never sweep it in with
`git add -A`. Commit as a checkpoint whose message begins `CHECKPOINT (not approved):`.

## Evidence

- L1/L2/L3 freely while you work.
- **Exactly one closing L4 stamp**: `npm test`, `npm run typecheck`, `npm run lint`. Baseline to
  beat: **28 files / 383 tests** green. Report the counts.
- **Do not run `npm run build`** — it fails on `main` for a pre-existing reason outside this phase
  (`src/styles/globals.css` imports a `tokens.css` the frontend work deleted at `f957f66`). No
  signal, and not yours to repair.
- No network, no provider call, no `.env` read, no `npm install`.
- Run **all 13** named mutations, one at a time, observe the named row go red, revert, confirm the
  tree is byte-identical. Record each as: id → command → the row that reddened → restored digest.
  **If a mutation does not redden its row, the row is the defect** — report it, do not adjust the
  assertion until it passes.

## The fixtures are not yours to validate

Some fixture cells in the table cite a file and line in a dependency's source. That is the plan
showing its work, not a task handed to you: **you are not asked to re-investigate the dependency to
confirm the plan's fixtures are realistic.** That responsibility sits with plan authorship and was
checked again by the rank-12 projection before you were dispatched (master §9.1 rule 18). Doing it
again costs a round and puts you in the position of redesigning rows you do not own.

The one exception is a stop condition, not an assignment: if a contradiction becomes **obvious**
while you implement — the shape will not compile, a constructor rejects it, the library plainly
builds something else — **stop and report it in the handoff.** Do not adjust the assertion until it
passes. That is the whole of your duty here.

## Handoff

`handoffs/implementer/phase-09-round-1.implementer.md`. Give the gate check; each of the 34 rows
and how it is observed; the full 13-mutation log; the closing stamp; every delegated choice with its
reason; the exact write perimeter; and **anything in the plan you found wrong**. Report what
happened, including what failed.
