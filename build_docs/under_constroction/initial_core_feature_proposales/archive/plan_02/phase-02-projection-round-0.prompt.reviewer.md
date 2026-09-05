---
plan: 2
role: reviewer
round: 0
date: 2026-09-05
project: initial_core_feature_proposales
phase: Errors, logger, shared value shapes (projection)
---

# Session prompt — phase 2 projection (round 0)

You are running the **plan-projection** gate on phase 2 of
`initial_core_feature_proposales` in `/Users/davidloorenz/Desktop/Developer/Proposales`.

Invoke the `plan-projection` skill and follow its doctrine. Also invoke the repository's
`architecture-context` skill.

**You do not implement anything.** You do the implementer's first hour on paper, from
the artifacts alone, and record every decision the plan fails to determine.

---

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status header | reads `RATIFIED` |
| 2 | Predecessor gate | tracker row 1 (`master-plan.md` §4) reads `APPROVED` |
| 3 | This phase is unstarted | tracker row 2 reads `NOT_STARTED`, and `src/lib/errors/` does not exist |
| 4 | The plan carries the amended counts | `plans/phase-02-errors-logger-values.md` states **38 rows** and **8 named mutations**, and contains a row `C3(i)` |

## 2. Why this gate runs here

Master plan §3 makes projection **mandatory** for phases 2–14 and waivable only for 1
and 15. Phase 2 defines two of the highest-ranked silent-failure mechanisms in the whole
inventory: **absence** (`KnownOrAbsent` — intention rank 1) and **money** (rank 3). If
either shape is subtly wrong here, nothing crashes; every later phase inherits it, and
the defect surfaces as a proposal that is quietly not what the human approved.

This is also the phase every later phase imports. A decision left undetermined here is
made silently, in code, once — and then depended on eleven times.

## 3. Read order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — the phase manifest's five
   properties, the trace chain, standing rules 2, 3, 4, 13, 15.
2. `/Users/davidloorenz/agent-skills/plan-projection.md` — your doctrine, the decision
   ledger, and how findings are routed.
3. `plans/phase-02-errors-logger-values.md` — in full, including the coordinator's
   dispatch-lint amendment note.
4. Intention §17A.1 (all four shared value shapes), §17A.2 (Generation ID form),
   §17A.10 (the logging paragraph), §17A.13 (taxonomy map and "what may never cross"),
   §17A.16 (time and clocks).
5. Master plan §5 (R6, R9, R12), §6.1, §6.3 (the taxonomy and every `reason` registry),
   §6.4 (the five `lib/values` rows), §9 rules 1 and 4, §10.
6. Contracts `04-server-architecture.md` §6, §10; `06-data-contracts-and-validation.md`
   §6, §8; `10-security-and-trust-boundaries.md` §7; `03-feature-architecture.md` §3;
   `12-anti-patterns.md` "Server" and "Data and validation".
7. The repository as it now stands after phase 1 — `src/lib/env/server.ts`,
   `eslint.config.mjs`, `vitest.config.mts`, `test/setup/node.ts`. Phase 1 is `APPROVED`;
   read it to learn what exists, not to re-review it.

## 4. Depth targets

Do the first hour on paper and record what you could not decide from the artifacts.
These are where this phase is most likely to leave a decision to the implementer:

1. **`KnownOrAbsent` (rank-1 mechanism).** The plan gives the schema shape and rows
   C4(a–e). C4(b)'s row text references an exported helper `requiredKnownOrAbsent`
   parenthetically, but no task creates it and master plan §6.4 may not name it. **Does
   every symbol the criteria depend on actually get built by a task?** A criterion whose
   root is a symbol nobody writes is the void-reference defect the charter names.
2. **Money (rank-3).** `moneySchema` is `{ amountMinor: int, currency }`. Trace forward:
   §17A.12 forbids arithmetic on this type anywhere. Does anything in this phase's
   surface — a helper, a formatter, a comparison — create a place where arithmetic could
   later be added without a criterion noticing?
3. **The taxonomy's totality.** §6.3 declares nine classes plus `ProposalesError` and
   `AiProviderError` extending `IntegrationError`, and six `reason` registries. C1(a–i)
   covers nine classes. **Are the two subclasses and the registries built by a task,
   asserted by a row, or neither?** If neither, say so — that is a planning gap, and it
   is phase 3 and phase 8 that will discover it.
4. **The logger's contract.** "Exactly one JSON line per call" and an injected clock are
   asserted by C3(h). The redaction list is asserted by C3(a–f), C3(g), C3(i). Is
   `redact`'s behaviour on arrays, on `null`, and on non-object values determined by the
   plan, or left to the implementer? Note that redaction is a **secret-leak guard**: an
   undetermined branch here is the phase's highest-consequence gap.
5. **Timestamps.** C6(d) pins `formatIsoTimestamp(new Date(0))`. The plan's task 7 notes
   `toISOString()` "is already this exact form in V8; the test pins it." Judge whether
   pinning a V8 implementation detail is a contract or a rule-13 time bomb.
6. **Every reference resolves and every count is derived.** The coordinator ran this
   lint and amended the plan; run it again independently rather than trusting it. Two
   things the coordinator already checked and you need not redo unless you doubt them:
   the phase-1 `process.env` lint rule targets `process.env` specifically and does not
   block task 3's `process.stdout` sink; and phase 2's tests land inside the node
   project's include globs.

## 5. What you produce

Per the doctrine: a **decision ledger** — every decision the plan does not determine,
each with what an implementer would most likely do, and what the artifacts actually
require. Route each item: to the plan's tasks, to its criteria, to the master plan, or
to the intention (a semantic gap re-opens a gate and comes to the coordinator, never
straight into the intention).

Where the plan is fully determinate, say so plainly — **an empty ledger is a real and
valuable result**, and two consecutive empty ledgers demote this gate to optional for the
project. Do not manufacture findings to justify the session.

Also produce an **explicit delegation list**: decisions you judge safe to leave to the
implementer on purpose. That list goes into the implementer prompt verbatim, so the
implementer knows what is genuinely its call rather than guessing.

**Write no code. Change no source file. Do not amend the plan yourself** — findings are
routed to the coordinator, who folds them.

**Evidence budget: L4 runs = 0.** This is a paper exercise. You may read anything and
run read-only commands (`npx vitest list`, `grep`, `git show`); you may not run the test
suite for its own sake.

## 6. Closing protocol

1. Handoff at `handoffs/reviewer/phase-02-projection-round-0.reviewer.md`, row-schema
   frontmatter (`plan`, `role`, `round`, `date`, `state`/`verdict`, `actor`), with your
   **full write perimeter** (documents only — it should be this one file).
2. The decision ledger, the routing for each item, and the delegation list.
3. Tracker row 2 → `PROJECTED`. Your own row only.
4. Review-log entry in the phase plan (append-only).
5. Owner decision cards in one `⚠ OWNER DECISIONS REQUIRED (n)` section immediately
   after the opening summary, charter format. Zero cards: say so in one line.

Archgraph is not present; skip it silently.

## 7. Final chat message (the owner layer)

**What I did → What I found and what it means for you → What happens next → What needs
you.** One pointer line names the handoff. Plain product words, no section numbers or
paths, under ~300 words unless cards are pending.
