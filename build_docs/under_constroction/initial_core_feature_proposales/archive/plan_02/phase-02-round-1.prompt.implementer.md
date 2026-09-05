---
plan: 2
role: implementer
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Errors, logger, shared value shapes
---

# Session prompt — implement phase 2

You are the **implementer** for phase 2 of `initial_core_feature_proposales` in
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/implementation-executor.md` first and follow them as
your session doctrine. Also invoke the repository's `architecture-context` skill before
writing code. This phase creates server errors, runtime-neutral validation shapes, and a
server logger, so the relevant contract routing is not optional.

**`plans/phase-02-errors-logger-values.md` is your task list. Where this prompt differs
from the plan file, the plan file wins.**

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status header | `planing/proposal-preparation-backend-intention.md` reads `RATIFIED` |
| 2 | Predecessor | tracker row 1 in `master-plan.md` §4 reads `APPROVED` |
| 3 | Phase dispatch state | tracker row 2 reads `PROMPT_READY` |
| 4 | Work is outstanding | `src/lib/errors/` does not exist, and the phase-2 plan still states 7 criteria, 50 rows, 16 named mutations |

Do **not** gate on a clean worktree. The worktree already contains coordinator
documentation and concurrent owner work outside this phase. Inspect `git status` before
you start; do not modify, stage, or include any pre-existing non-phase change in your
checkpoint.

## 2. Read order

1. The charter and executor doctrine above — especially the coverage map, trace chain,
   named-mutation ledger, evidence scopes, checkpoint, and handoff protocol.
2. `master-plan.md` §§5 (R6, R9, R12, R16), 6.1, 6.3, 6.4, 9, and 10.
3. `planing/proposal-preparation-backend-intention.md` §§17A.1, 17A.2, 17A.13,
   17A.16, **17A.18**, and ledger **M20**.
4. `plans/phase-02-errors-logger-values.md` in full, including its projection-fold note
   and Review log.
5. Contracts `03-feature-architecture.md` §3; `04-server-architecture.md` §§6, 10;
   `06-data-contracts-and-validation.md` §§6, 8; `10-security-and-trust-boundaries.md`
   §7; `11-testing-principles.md` §§2–3, 5; `12-anti-patterns.md` “Server” and “Data
   and validation”; `14-documentation-principles.md` §8.
6. The phase-1 foundation only to learn the actual test/configuration shape:
   `src/lib/env/server.ts`, `eslint.config.mjs`, `vitest.config.mts`, and
   `test/setup/node.ts`. Contracts, not phase-1 code, remain pattern authority.

Before writing framework-facing code, obey `AGENTS.md`’s Next.js documentation rule.
This phase should not introduce a Next.js API; if a framework configuration question
arises, read the current local Next guide before deciding it.

## 3. Phase-specific constraints

- **Scope fence.** Build only the 12 files in the plan. Do not create `ProposalesError`
  (phase 3), `AiProviderError` (phase 8), any adapter, agent, feature schema, transport,
  or phase-15 isolation scanner. Do not patch the intention, master-plan registry, or any
  other phase plan; report a newly discovered gap instead.
- **The logger is a ratified safety boundary.** Implement §17A.18 verbatim, not a
  plausible approximation. In particular, redaction applies inside arrays, `null` stays
  `null`, opaque and cyclic values become `[unserializable]`, fixed metadata wins over
  caller fields, the logger does not mutate its input, and the sink receives the newline.
  The phase-15 `console.log` and neutrality scans are future guards, not work to pull
  forward.
- **Use one error-code source.** `ERROR_CODES` is the source for both `ErrorCode` and
  the DTO enum. The two local reason registries are closed types in this phase; the other
  four have the owning modules and phases named in master plan §6.3.
- **Treat phase-1 boundary tests as signals.** Do not widen `process.env` exceptions,
  weaken `server-only` enforcement, or bypass the offline fetch guard. Their planted
  probes are regression guards, not obstacles.
- **Coverage map first.** In the handoff, map every one of the 50 criterion rows to a
  test id and say whether the assertion is exactly the required shape. Then map every
  test in this phase’s test files back to a criterion row; declare any genuine extra as
  a candidate criterion rather than shipping an orphan.
- **Mutation ledger is closed.** Run and revert MUT-02-1 through MUT-02-16 at their
  named sites. Report one evidence row per mutation, including the observed failing test
  id/assertion and every probe-touched file. `executed = 16` must equal `declared = 16`.

## 4. Explicit delegation list

The projection granted the following decisions to you. This list is verbatim; document
the choice in the phase Review log.

1. **The internal shape of `redact`** — recursive walk, `structuredClone` plus mutate, or a replacer — provided the behaviours D3 pins are met and the caller's own `fields` object is **never mutated** (a logger that edits its caller's data is a surprise nobody asked for).
2. **The wording of the fixed generic message** for the unknown-error branch. C2(c) asserts that it is fixed and that the original text is absent, never what it says. Any constant with no interpolation.
3. **Constructor ergonomics of the seven classes whose constructors the plan does not specify** (everything but `IntegrationError` and `ValidationError`), as long as C2(a)'s `new ConflictError({ message, details })` call shape compiles.
4. **The direction of the `ErrorCode` ↔ DTO-enum derivation** once D5 is folded — either is fine; picking neither is not.
5. **Test organisation inside `values.test.ts`** (describe blocks, table-driven cases). The plan fixes the file; it does not fix its interior.
6. **The capturing-sink test double's shape.**
7. **No range or `NaN` guard on `formatIsoTimestamp` in v1** (D14) — the injected clock is the only caller, and the owner's scope brief trims guards whose beneficiary does not exist yet. If the implementer wants one, it is free to add it; it is not required.
8. **Whether `REDACTED_KEYS` is a `readonly string[]` or a `Set`.**

## 5. Evidence, closeout, and report

- **L4 budget: exactly one run.** It is the mandatory closing `npm test` stamp on the
  tree you hand over. Run targeted L1/L2 commands for inner-loop work and mutations;
  do not spend another L4 run without the charter’s written pre-run authorization line.
  The closing stamp also includes `npm run typecheck` and `npm run lint`.
- Make the checkpoint commit with subject `CHECKPOINT (not approved): phase 02 …` under
  the standing authorization. Commit only your cycle’s code/tests; do not absorb the
  coordinator docs or unrelated styling changes.
- Update only tracker row 2 to `IMPLEMENTED`; append the plan Review-log entry; do the
  documentation-impact review required by contract 14 §8.
- Write `handoffs/implementer/phase-02-round-1.implementer.md` with row-schema
  frontmatter, a full cycle-scoped write perimeter, coverage map, reverse test map,
  complete mutation ledger, exact L4 tree identity and failure-ID delta, decisions from
  the delegation list, and any owner decision cards. Say explicitly when zero cards are
  needed.

Archgraph is not present; skip it silently. Your final chat message uses the charter’s
owner layer and points to the handoff rather than pasting it.
