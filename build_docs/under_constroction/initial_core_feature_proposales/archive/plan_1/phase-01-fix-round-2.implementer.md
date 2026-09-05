---
plan: 1
role: implementer
round: 2
date: 2026-09-05
project: initial_core_feature_proposales
phase: Repository topology and environment (fix cycle)
---

# Session prompt — phase 1, fix round 2

You are the **implementer** for the fix cycle of phase 1 in
`/Users/davidloorenz/Desktop/Developer/Proposales`. Review round 1 returned
`CHANGES_REQUESTED`.

Invoke the `implementation-executor` skill and follow its doctrine. Also invoke the
repository's `architecture-context` skill.

**`plans/phase-01-topology-and-env.md` is your task list** — it has been amended with
the new criterion rows and mutations this round owes. Where this prompt differs from the
plan file, the plan file wins.

**Resolve, don't relitigate. Add nothing beyond the findings below.** The reviewer
verified a great deal as correct (its "What I verified correct" table); none of that is
reopened.

---

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status header | reads `RATIFIED` |
| 2 | Tracker row 1 (`master-plan.md` §4) | reads `CHANGES_REQUESTED` |
| 3 | The work is outstanding | `plans/phase-01-topology-and-env.md` contains a row `C5(b)` and `test/setup/node.ts` does **not** yet assign `OPENAI_API_KEY` |
| 4 | The review exists | `handoffs/reviewer/phase-01-round-1.reviewer.md` is present, with an implementer and a reviewer entry in the phase plan's Review log |

Dirty paths under `build_docs/` are expected and are not a reason to stop.

## 2. Read order

1. `plans/phase-01-topology-and-env.md` — in full, **including the amended criteria
   table** (22 rows, 11 named mutations) and the amended Notes.
2. `handoffs/reviewer/phase-01-round-1.reviewer.md` — findings F1, F3, F4, F5 and notes
   N1, N3, N4. Its "What I verified correct" table tells you what not to touch.
3. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — rule 15 above all.
4. Master plan §6.2 (**now seven placeholders**), §10.3, §10.4 (**now includes the
   jsdom guard**), §10.6, §5 R7.
5. Contracts `02-runtime-boundaries.md` §7, §8; `03-feature-architecture.md` §4;
   `11-testing-principles.md` §5.

## 3. Scope — six items, and nothing else

The owner scoped this round explicitly (MVP calibration, 2026-09-05). **Findings F2, the
comment-shape half of F4, and note N2 are deliberately excluded** and are already
recorded in the plan Notes and phase 15; do not implement them, and do not treat their
absence as an omission.

### 3.1 — F3, the suite's placeholder environment (highest value; do this first)

The reviewer's correction, verbatim:

> `test/setup/node.ts` assigns **all seven** schema names, `OPENAI_API_KEY` included,
> unconditionally. Add a criterion row of inventory shape (the `C5(a)` pattern, which is
> already proven strong): for every key of `serverEnvSchema.shape`, the value in
> `process.env` equals the declared placeholder.

The row is in the plan as **C4(d)**; its placeholder value is in master plan §6.2, which
now names all seven. Mutation **MUT-01-9**.

### 3.2 — F4, `.env.example` values (empty-value half only)

The reviewer's correction, verbatim:

> extend `C5(a)` (or add `C5(b)`/`C5(c)`) to assert that every `NAME=` line has an empty
> right-hand side and is immediately preceded by a comment line. Plant a value on one
> line and delete one comment as the two rule-15 presence probes.

**Scope note from the owner:** implement the **empty right-hand side** half only. The
comment-shape half is out of scope for this MVP; the plan carries one row, **C5(b)**,
covering values. Mutation **MUT-01-10** is the planted value.

### 3.3 — F1, the boundary lint regression guard (reduced scope)

The reviewer's correction, verbatim:

> extend `src/lib/env/server.test.ts`'s existing `lintSource` helper — the machinery is
> already there and already imports the shipped config — with criterion rows covering
> (i) each of the four `no-restricted-imports` families, positive and, for the client
> family, the sanctioned `server/actions` negative; (ii) an enumerated `process.env`
> family list rather than one path: at minimum `src/app/**`, `src/components/**`,
> `src/features/**/server/**`, `src/features/**/components/**`, `src/lib/**` outside
> `src/lib/env/`.

**Scope note from the owner:** the enumerated `process.env` list is the half that bites
and is implemented in full as **C3(c)** — five paths, five reports, exactly as the
correction enumerates. The import-family half is reduced to **C3(d)**: three positive
cases plus the sanctioned `server/actions` negative, rather than every family with both
polarities. Mutations **MUT-01-7** (widen the exception) and **MUT-01-8** (delete the
four families).

Use the existing `lintSource` helper against the shipped `eslint.config.mjs`. Do not
re-declare config in the test — the reviewer confirmed the current import is the real
root config, and that property is what makes these rows worth anything.

### 3.4 — N3, extend the offline guard to the jsdom project

Master plan §10.4 now requires it, and §10.6 rule 1 is written absolutely. Put the guard
and `OfflineGuardError` in one place and have both setup files use that one definition —
two copies of a guard is the shape that drifts. Row **C4(e)**, mutation **MUT-01-11**.

### 3.5 — N4, redefine MUT-01-6

The plan now specifies the new shape. Old shape made a real request to
`api.proposales.com` (charter rule 9). New shape:
`globalThis.fetch = async () => new Response("ok", { status: 200 })` → C4(c) red. The
reviewer demonstrated it bites identically. **Run MUT-01-6 in its new shape this round;
never the network form.**

### 3.6 — F5 and N1, documentation and cleanup

F5's correction, verbatim:

> patch both statements to describe the node/jsdom split and where each project collects
> from. The environment table itself is correct and complete (seven variables, purpose,
> requiredness, kind, safe example) and needs nothing.

The two stale root-`README.md` statements are the stack-table row
`| Unit and component tests | … jsdom environment |` and the `## Testing strategy` line
"Tests live next to the code as `*.test.ts(x)`".

N1: `rmdir` the three empty leftover directories under `src/features/phase01-probe/`
(and `src/features/phase01-probe` itself, and `src/features/` if it is then empty).
**Take the lesson**: a mutation-probe declaration lists directories created, not only
files — or probes are planted under paths that already exist. Apply that to this round's
own probes.

## 4. Allowed file perimeter

The re-review verifies this. Anything outside it is an automatic finding.

| Path | Why |
|---|---|
| `test/setup/node.ts` | F3 seventh placeholder; shared guard definition |
| `vitest.setup.ts` | N3 jsdom guard |
| `src/lib/env/server.test.ts` | C3(c), C3(d), C5(b) rows |
| `test/setup/node.test.ts` | C4(d) row |
| one **new** jsdom-collected test file for C4(e) | must sit inside a jsdom include glob (master plan §10.3) or it will be collected by no project — verify with `npx vitest list` |
| `README.md` (root) | F5 |
| `src/features/phase01-probe/**` | N1 deletion only |

Plus the closeout artifacts: this phase's plan Review log, tracker row 1, your handoff.

**Not in the perimeter:** `eslint.config.mjs` (the rules are correct — the reviewer
enumerated eleven of eleven behaving properly; this round tests them, it does not change
them), `src/lib/env/server.ts`, `.env.example`, `vitest.config.mts`, `package.json`,
the intention, the master plan, any other phase plan. If you believe one of these must
change, **stop and report** rather than changing it.

**Superseded for deletion:** nothing. Task 5's manual lint verification is superseded as
an *acceptance* mechanism by C3(c)/C3(d), but the Review-log record it produced in round
1 stands as history — do not delete it.

## 5. Evidence budget

**Exactly one L4 run** — the closing stamp (`npm test`, plus `npm run typecheck` and
`npm run lint`), taken on the tree you hand over. Mandatory; citing round 1's stamp is
not a substitute, because this round changes the tree. If you change anything after
taking it, re-take it — a re-take is not over budget.

Everything else is L1: `npx vitest run <path> [-t "<name>"]`.

**All eleven named mutations run this round**, not only the five new ones: the plan's
mutation set is closed at 11, MUT-01-6 in its redefined shape. Record each with its
observed red at the scope you ran it.

## 6. Closing protocol

1. Eleven mutations run and reverted; ledger recorded, including which row each bit.
2. Closing stamp with full tree identity.
3. Checkpoint commit, `CHECKPOINT (not approved): phase 01 fix round 2 …`, under the
   standing owner authorization.
4. Tracker row 1 → `IMPLEMENTED`; your own row only.
5. Review-log entry appended (the round-1 implementer and reviewer entries stand).
6. Documentation impact review — **round 1 answered this question wrongly** (F5). Answer
   it against the verified tree this time, per
   `architectural_contracts/14-documentation-principles.md` §8.
7. Handoff at `handoffs/implementer/phase-01-round-2.implementer.md` with the row-schema
   frontmatter and your **full write perimeter**, files *and directories*. State
   explicitly which of the six scope items you completed and, per charter rule 14, **if
   you did not implement a correction quoted above, say which and why in its own
   section** — divergence is often right, undeclared divergence costs the next reviewer a
   finding on a non-defect.
8. Any test you write that traces to no criterion row is declared as a **candidate
   criterion**, never shipped silently.
9. Owner cards in one `⚠ OWNER DECISIONS REQUIRED (n)` section after the summary; zero
   cards, say so in one line.

Archgraph is not present; skip it silently.

## 7. Final chat message (the owner layer)

**What I did → What I found and what it means for you → What happens next → What needs
you.** One pointer line names the handoff. Plain product words, no section numbers or
paths, under ~300 words unless cards are pending.
