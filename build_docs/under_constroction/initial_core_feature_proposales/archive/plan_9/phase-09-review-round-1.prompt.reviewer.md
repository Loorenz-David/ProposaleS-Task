---
plan: plans/phase-09-agent-runtime.md
role: reviewer
round: 1
date: 2026-09-07
---

# Phase 9 review round 1 — the agent runtime

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/plan-reviewer.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy in reverse, as review does it: diff → concerns touched →
`architectural_contracts/01-implementation-contract-guide.md` → the applicable contracts → judge
the diff against them.

**This is the phase's only independent review.** Master §9.0.2 waives the *second* review after a
fix round, not this one. What you miss, the coordinator will not catch a second time.

## What to read

1. `plans/phase-09-agent-runtime.md` in full — tasks, the 34-row acceptance table, Notes, and the
   whole Review log **including the coordinator's validation entry**, which lists what has already
   been checked and six findings already proved, so you do not spend the round repeating them.
2. `archive/plan_9/phase-09-round-1.handoff.implementer.md`.
3. `archive/plan_9/phase-09-projection-round-0.handoff.reviewer.md` — the projection whose 26
   ledger rows shaped this table. Its D-numbers are cited throughout the plan.
4. Intention §17A.13, §17A.14, §17A.15; master §6.1, §6.3, §6.4, §6.5, §6.6, §9.0, §9.0.2, and
   §9.1 **rules 17 and 18** (rule 18 carries the ownership ladder that decides who a fixture defect
   belongs to — read it before you assign one).
5. The diff: `git diff 49108b6 9712b2d`.

## Gate

Check by content, and stop and say so if any is false: the phase header and master row 9 both say
`IMPLEMENTED`; `src/lib/agent/` contains `types.ts`, `define-tool.ts`, `run.ts` and their two test
files; `test/helpers/agent-boundary-scan.ts` exists and exports `hasForbiddenForm`;
`src/features/proposal-preparation/server/tools/` contains `index.ts` and the two `.tool.ts` files;
`ai` in `package-lock.json` is still `7.0.92`.

## Already established — do not re-derive

The coordinator ran these on checkpoint `9712b2d`. Spot-check if you doubt one; do not rebuild.

- `npm test` **31 files / 416 tests** green; `npm run typecheck` exit 0; `npm run lint` exit 0.
- Write perimeter exact: `git diff --stat 49108b6 9712b2d` is 16 files — the 13 declared
  implementation paths plus the phase plan, master row 9, and the handoff.
- All four mutation restoration digests recomputed and matched, including the phase-7
  `domain/rank-candidates.ts` that MUT-09-10 touched.
- Table counts derived by command: 7 criteria / 34 rows / 13 mutations.
- `hasForbiddenForm` is imported once and shared by C2(d) and C2(e) — §9.1 rule 17 is satisfied
  *there*. (It is not satisfied for `assertReadOnlyToolSet`; see F5.)
- **Verified forward through the real `@ai-sdk/anthropic` provider with only `fetch` injected:**
  `Output.object({ schema: jsonSchema(<raw JSON Schema>) })` **does not validate** the parsed
  object against that schema. `{"items":[{"answer":5}]}` comes back as `result.output` with no
  throw against a schema requiring `answer: string`; `NoObjectGeneratedError` is thrown on a
  **parse** failure only. A truncated body throws `NoObjectGeneratedError` with `.text` carrying
  the raw partial string. Both C5(a)'s and C5(b)'s fixtures are therefore realistic — C5(b) for a
  broader reason than its plan cell states. Recorded in master §6.6.
- `npm run build` fails on `main` for a pre-existing reason outside this phase
  (`src/styles/globals.css` imports a `tokens.css` the frontend work deleted at `f957f66`). It
  yields no signal. Do not repair it and do not treat it as a phase-9 defect.

## Six findings already proved — your job is the repair, not the rediscovery

Each was produced by mutating production against the **full** suite. Five came back green: the
named behaviour can be deleted and all 416 tests still pass. **In every case the implementation
matches its acceptance row exactly as written — the rows are what cannot fail**, so under §9.1
rule 18's ladder these are plan-authorship defects (planner, and the coordinator at every fold),
not implementer defects. Repair them **test-side**; none of them indicates wrong production code.
If you conclude any of them *does* indicate wrong production code, say so explicitly and show it.

- **F1 · C3(f) cannot fail.** Replacing `timeoutMs` with the constant `1` leaves the suite green.
  The row asks for `stepOptions[n].timeoutMs <= 500 && >= 1`, which any constant in range
  satisfies; it proves no relationship to the remaining wall time, and never reaches the
  `AI_CALL_TIMEOUT_MS` half of the `min` (dropping that cap is also green). The row needs a case
  where remaining wall time is the binding term and a case where `AI_CALL_TIMEOUT_MS` is.
- **F2 · `outputJsonSchema` has no row.** Deleting it from the `generateStep` request leaves the
  suite green. Plan step 2 names it load-bearing — "or `generateText` falls back to its text spec
  and every final arrives as a string, making C5 trivially true" (D11). The scripted fake already
  records it on `ai.calls[n]`, so the row is one assertion.
- **F3 · `issue.path.map(String)` cannot fail in either home.** Deleting it from `run.ts`
  (`issuePaths`) or from `define-tool.ts` (`issuesFrom`) leaves the suite green. C1(a) and C5(b)
  use flat fixtures whose paths are already `["query"]` / `["answer"]`. C5(b)'s plan cell reasons
  from Zod's *type* (`PropertyKey[]`) to conclude "this is a real guard"; the *runtime value* is
  all strings. The real shape the provider produces — verified above — is `["items", 0, "answer"]`,
  a **number** at index 1, which is what the coercion exists for. Both rows need an
  array-bearing schema.
- **F4 · `agent.run.step` has no row.** Deleting the call leaves the suite green. Plan step 2 names
  four events (`start/step/tool/end`); C7(d) requires two; three were built and `agent.run.tool`
  was never built. The acceptance table is the binding artifact, so the implementation is
  compliant — decide whether the plan's narrative or the table is wrong and repair the one that is.
- **F5 · `assertReadOnlyToolSet` is two byte-identical copies**, private in `run.ts` and exported
  from `tools/index.ts`. The split is **forced**: `src/lib` may not import from a feature
  (contract 03), the same rule that pushed this phase's `src/lib` tests onto dynamic imports.
  Both copies are covered (C2(a)/C2(b) the exported one, C2(c)/MUT-09-1 the private one), so this
  is a divergence risk, not a hole. Master §6.6 has been corrected and the lift-to-`lib/agent`
  repair routed to phase 15 candidate 6. **Do not repair it here** — say so if you disagree.
- **F6 (low) · the system prompt is never asserted to reach the model.** `system: options.system`
  → `system: ""` leaves the suite green. Judge whether the table should cover it.

## Where to spend the round

The five green probes above are the shape this project keeps shipping: a guard whose fixture makes
its assertion true regardless of the code. Phase 8 surfaced nine of them across three sessions and
two were worse than unfalsifiable — they modelled shapes the SDK never builds, which left a
just-ratified failure reason unreachable while every test passed. **A mutation proves the test
observes our code; it cannot prove the code observes the world.** Every mutation in this phase's
ledger reddened, and the six findings above still exist.

So do not audit the ledger. Ask of each of the 34 rows: **what value could the production code
return that would still satisfy this assertion?** If the answer includes a constant, a
do-nothing, or the fixture's own shape, the row is the defect. Then ask rule 18's question of every
fixture that models something outside this repository: **can the thing it models actually produce
that?** The `GenerateStepResult` values fed to `createScriptedAiClient` are the ones that matter —
they are our seam, but their realistic value set is decided by `src/lib/ai/client.ts` and the SDK
behind it. Two have been verified above; the rest have not.

Specific places worth the question, none of them pre-judged:

1. **C3(a–h), the budget rows.** Several drive the loop with `name: "missing"` — a tool that does
   not exist, so `run` synthesises an `invalid_arguments` result and never invokes anything. Ask
   whether the budget rows that use it are proving budget enforcement or proving the unknown-tool
   fallback, and whether a budget could be off by one without a row seeing it.
2. **C4(a–d), usage accumulation.** The null-propagating `addUsage` and the separate numeric
   counter are two different rules over the same field. Ask what a swap between them would redden.
3. **C6(a–e), the read tools.** They run against `FIXTURE_CATALOG`. Ask whether the asserted
   values (`variationId: "2"`, `score: 1000`, `matchStrength: "strong"`) are discriminating or
   merely present, and whether `get_content`'s three cases can distinguish "unknown id" from
   "unlocalized" from "empty title" — all three currently return `{ item: null }`.
4. **C2(d), the perimeter scan.** MUT-09-6 shows one forbidden form has teeth on one real file.
   Ask what the other nine would catch, and whether a new file added to `src/lib/agent` would be
   scanned or silently skipped.
5. **C7(b).** The structured tool error returned to the model is asserted with `toMatchObject` on
   `{ error: { code: "invalid_arguments" } }`. Ask whether the `issues` reach the model at all, and
   whether they should.
6. **The two `ctx.language!` non-null assertions** in both tools. `requires` and `execute` are
   separate functions and the type system does not connect them. C6(d) proves `requires` fires;
   ask what proves `execute` is unreachable with `language === null` by any other path.

## Rules for this round

- Judge the code and the table, not the report. Every count you state must come from a command you
  ran, with the summands printed. Never quote a number from the handoff or from this prompt without
  re-deriving it.
- Do not run a mutation the ledger already ran to confirm it reddens. Run *variations* the ledger
  did not run — that is where all six findings above came from.
- Do not repair production code unless you can show production is wrong. Five of the six findings
  are test-side.
- Never widen the perimeter. The phase-7 purity guard (rule-17 defect) and the barrel's negative
  surface are already routed to phase 15 candidates 4, 5 and 6 — leave all three alone.
- No network, no provider call, no `.env` read, no `npm install`, no `npm run build`.
- One closing L4 stamp: `npm test`, `npm run typecheck`, `npm run lint`. Over-evidence is a defect.
- Restore every file you mutate and prove it with a digest.

## Handoff

Write `handoffs/reviewer/phase-09-review-round-1.handoff.reviewer.md` with front matter
`plan / role: review / state: APPROVED | CHANGES_REQUESTED / date / actor`, and:

1. The gate result and the closing stamp.
2. For each of F1–F6: repaired, deferred, or disputed — and if repaired, the row's new text and the
   named mutation that now reddens it.
3. Every new finding, each with the concrete production value that would still satisfy the row.
4. Any fixture you judge unrealistic under rule 18, with the file and line in the dependency's
   source that decides it.
5. An owner decision card for anything that touches ratified semantics — the intention, master
   §6.3's closed registries, or an approved phase's perimeter. Recommend one branch and say why.
6. Your restoration digests and the exact write perimeter.

Do not change the phase state or the master tracker row; the coordinator folds this.
