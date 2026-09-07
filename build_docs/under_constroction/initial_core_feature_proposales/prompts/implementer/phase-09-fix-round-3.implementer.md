---
plan: plans/phase-09-agent-runtime.md
role: implement
round: 3 (fix)
date: 2026-09-07
---

# Phase 9 fix round 3 — one guard, no production change

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. The architecture classification for this
round ends early: it is a test-only change to an existing row, touching no boundary, schema,
persistence or external adapter. `08-agent-architecture.md` §10 is the authority for what the row
must assert and is quoted in the plan.

**This is a deliberately small round.** Fix round 2's production code is correct and stays
byte-identical. Do not refactor, do not tidy, do not extend scope. If you find yourself editing a
`.ts` file that is not a test, stop and report.

## Gate

Check by content, and stop and say so if any is false.

1. The phase plan header says `state: CHANGES_REQUESTED` and master tracker row 9 says
   `CHANGES_REQUESTED`.
2. The plan's counter line reads **7 criteria / 38 rows / 39 named mutations**, and C7(f)'s row
   contains the phrase "Both branches are asserted".
3. `git status --porcelain` is empty and `npm test` is green at **31 files / 421 tests**. Record
   that as your pre-edit baseline.
4. `src/lib/agent/run.ts` digest is
   `f8fc4de0b36c2de823c901dc114c59b1f2960bbf8ec604835b99c5042d1607df`. It must still be this digest
   when you finish.

## The work

**One row, two mutations, and one note.**

1. **C7(f)'s failure branch.** The shipped test asserts a full `toEqual` over the **success**
   `agent.run.tool` record and asserts nothing at all over the **failure** record. Extend it so a
   run in which a tool invocation fails also emits `agent.run.tool` carrying
   `{ runId, traceId, toolCallId, name, ok: false, durationMs }`, asserted the same way — by value,
   not by presence. An `unknown_tool` dispatch miss is the natural driver and is the case owner
   card 1 was raised about; a tool whose `execute` fails its own input schema is an equally valid
   driver. Pick one and say which.

   Two coordinator probes must go from green to red once you are done:
   - `MUT-09-38` — delete the failure-branch `agent.run.tool` call in `run.ts`.
   - `MUT-09-39` — change that call's `ok: false` to `ok: true`.

   Both currently leave all 421 tests passing. Apply each alone, confirm it reddens C7(f), and
   revert it. `run.ts` must end at the digest above.

2. **N3.** `C5(c)` hardcodes `2` where its row says `MAX_OUTPUT_RETRIES + 1`, and `4` where the row
   says `+ 3`. Import the constant and use it. Align the test to the row, never the row to the test.

That is the whole round. Nothing else in the plan is open.

## Rules for this round

- **Test files only.** The perimeter is `src/lib/agent/run.test.ts` and this handoff. If C7(f)'s
  new case needs a fixture that does not exist, say so in the handoff rather than inventing one in
  a production file.
- **Never adjust an assertion until it passes.** If the row and the runtime disagree, the row wins;
  if you believe the row is wrong, stop and report.
- **Print every value you assert.** The last round was blocked because a coordinator wrote an
  expected issue path by reasoning from a schema instead of running it. Run the case, read the
  emitted record, and assert what it actually contains.
- **Ask of your new assertion: what could the code emit that would still satisfy it?** If the
  answer includes a constant or a missing field, it is not finished. That question is what found
  this gap.
- One mutation at a time, applied and reverted, each reddening C7(f). Record a restoration digest.
- No network, no provider call, no `.env` read, no `npm install`, **no `npm run build`** — it fails
  on `main` for a pre-existing reason outside this phase and yields no signal.
- One closing L4 stamp: `npm test`, `npm run typecheck`, `npm run lint`. Over-evidence is a defect.

## Handoff

Write `handoffs/implementer/phase-09-fix-round-3.implementer.md` with front matter
`plan / role: implement / state: IMPLEMENTED / date / actor`, and:

1. The gate result, the pre-edit baseline, and the closing stamp.
2. Which driver you chose for the failure case, and the exact record your test asserts.
3. The `MUT-09-38` / `MUT-09-39` ledger: probe site, observed red row, restoration digest.
   Declared, executed, red and restored must each be **2**.
4. `run.ts`'s digest at the end of the round, which must equal the gate's.
5. The exact write perimeter, and any file you touched that is not in it, with the reason.
6. Any plan defect you found, or an explicit statement that you found none.

Do not change the phase state or the master tracker row; the coordinator folds this and approves
the phase. Commit as a checkpoint labelled not-approved.
