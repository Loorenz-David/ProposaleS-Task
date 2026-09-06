---
plan: plans/phase-09-agent-runtime.md
role: implement
round: 2 (fix)
date: 2026-09-07
---

# Phase 9 fix round 2 — the agent runtime

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy: classify the concerns, read
`architectural_contracts/01-implementation-contract-guide.md`, and read the applicable contracts
before you design anything. `08-agent-architecture.md` §3 and §10 and
`10-security-and-trust-boundaries.md` §7 are load-bearing for this round and are quoted in the plan.

**Round 1's production code is sound outside the six edits below.** Do not refactor what the review
did not name, and do not "improve" a row's wording to match code you find easier to write.

## Gate

Check by content, and stop and say so if any is false.

1. The phase plan header says `state: CHANGES_REQUESTED` and master tracker row 9 says
   `CHANGES_REQUESTED`.
2. The phase plan's counter line reads **7 criteria / 38 rows / 37 named mutations**, and
   `C3(i)`, `C7(e)`, `C7(f)` and `C7(g)` all appear as rows.
3. Master §6.3's `ToolErrorCode` lists **four** members including `unknown_tool`, and §6.4's
   `ToolInvokeResult` has **four** failure arms.
4. Master §9.1 contains rules **19, 20 and 21**.
5. `git status --porcelain` is empty, and `src/lib/agent/run.ts` digest is
   `69b8e6071a694c6f0db502c3faf5c3627081b39843400bd3b92e9202ba3ce452`.
6. `"node_modules/ai"` in `package-lock.json` is `7.0.92`.

## What is already done — do not redo it

Review round 1 applied five repairs **test-side** and they are in the tree. Their mutations —
`MUT-09-14` … `MUT-09-24` — are discharged and the coordinator re-proved every one of them by
mutation. Leave them alone:

- `C1(a)` second case (array-index issue path), `C3(f)` rewritten to two binding terms, `C5(b)`
  rewritten over an array-bearing schema, `C7(e)` added, `C7(d)` extended.

Your ledger covers **`MUT-09-25` … `MUT-09-37` only** — thirteen mutations, one per named site.

## Baseline, captured before you edit anything

Round 1's handoff did not capture a pre-production full-suite baseline and said so. Capture it this
time, first thing: `npm test` on the entry tree, and record the printed file and test counts. The
entry tree is green at **31 files / 418 tests**; if your run disagrees, stop and report before
editing.

## The six production edits — plan tasks 6 through 11

Read the plan's "Fix round 1 tasks" section for each one in full; this is the index, not the spec.

1. **Task 6 · `agent.run.tool` and `durationMs`** (B1, row `C7(f)`). Contract `08` §10 requires
   tool names and durations in every run's log events; none were emitted. Durations come from
   `deps.now()` — **never `Date`**, which the C2(d) scan forbids inside the agent boundary and
   which will fail the scan if you reach for it.
2. **Task 7 · `unknown_tool`** (owner card 1, row `C7(g)`). The owner decided this on 2026-09-07;
   master §6.3 and §6.4 are already amended. Add the member and the arm, return
   `{ error: { code: "unknown_tool", name } }` from the dispatch miss, and continue the loop.
   Re-point `C3(a)` and `C4(a)` at a **real** tool so they stop measuring this fallback.
3. **Task 8 · delete `run.ts:131`** (S5, §9.1 rule 21). Then re-run `MUT-09-2` against the single
   remaining site and say in the handoff that it still reddens `C3(e)`.
4. **Task 9 · the timeout floor** (S9, row `C3(i)`). `Math.max(1, …)` stays. The plan's old D24
   sentence claiming it was unnecessary is struck; do not act on the struck text if you meet it in
   an older artifact.
5. **Task 10 · `toContentDetail` in `server/domain/`** (S6, row `C6(b)`). `08` §3: `execute`
   contains no business rules. This is **the only production file outside round 1's perimeter you
   may touch**, and only to export what both callers now share.
6. **Task 11 · the test-side repairs**, listed in the plan.

## Rules for this round

- **Exact perimeter.** The plan's 13 implementation paths plus the one domain file task 10 names.
  Nothing else. `tsconfig.tsbuildinfo` is rewritten by typecheck — attribute it and restore it
  rather than sweeping it into the commit, as round 1 did correctly.
- **Never adjust an assertion until it passes.** If a row and the code disagree, the row wins;
  if you believe the row is wrong, stop and report it rather than editing it.
- **The fixtures are not yours to validate.** Some cells cite a file and line in a dependency's
  source — that is the plan showing its work, not a task handed to you. You are **not** asked to
  re-investigate the dependency. The one exception is a stop condition, not an assignment: if a
  contradiction becomes **obvious** while you implement — the shape will not compile, a constructor
  rejects it, the library plainly builds something else — stop and report it in the handoff.
- **Ask of every row you touch: what could the code return that would still satisfy this?** Five of
  this phase's rows were satisfied by a constant, a substring, an empty array, or the fixture's own
  shape. If your new assertion has that property, it is not finished.
- One mutation at a time, applied and reverted, each reddening the row it names. Record a
  restoration digest per file.
- No network, no provider call, no `.env` read, no `npm install`, **no `npm run build`** — it fails
  on `main` for a pre-existing reason outside this phase and yields no signal.
- One closing L4 stamp: `npm test`, `npm run typecheck`, `npm run lint`. Over-evidence is a defect.

## Handoff

Write `handoffs/implementer/phase-09-fix-round-2.implementer.md` with front matter
`plan / role: implement / state: IMPLEMENTED / date / actor`, and:

1. The gate result, the **pre-edit baseline**, and the closing stamp.
2. A coverage line per amended or new row — `C1(a)`, `C2(d)`, `C3(a)`, `C3(i)`, `C5(a)`, `C6(a)`,
   `C6(b)`, `C6(d)`, `C7(b)`, `C7(f)`, `C7(g)` — naming the executing test.
3. The `MUT-09-25` … `MUT-09-37` ledger: probe site, observed red row, restoration digest. Declared,
   executed, red and restored counts must be equal and must be **13**.
4. The exact write perimeter, and any file you touched that is not in it, with the reason.
5. Any plan defect or semantic conflict you found, or an explicit statement that you found none.
6. An owner decision card for anything touching ratified semantics — the intention, master §6.3's
   closed registries, or an approved phase's perimeter.

Do not change the phase state or the master tracker row; the coordinator folds this. Commit as a
checkpoint labelled not-approved.
