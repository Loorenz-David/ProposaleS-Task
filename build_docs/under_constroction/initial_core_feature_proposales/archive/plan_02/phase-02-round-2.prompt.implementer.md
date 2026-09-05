---
plan: 2
role: implementer
round: 2
date: 2026-09-05
project: initial_core_feature_proposales
phase: Errors, logger, shared value shapes (review fixes)
---

# Session prompt — fix phase 2, round 2

You are the implementer for the narrowly scoped phase-2 fix cycle in
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Read `/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/implementation-executor.md` first and follow them as
your doctrine. Invoke the repository `architecture-context` skill before editing. The
phase plan is your task list; where this prompt differs from it, the plan wins.

## Gate check

Stop and report unless: the intention header is `RATIFIED`; master-plan tracker row 1 is
`APPROVED`; tracker row 2 is `IMPLEMENTING`; `logger.ts` still uses `{}` plus
`result[key] = …`; C4(e) in `values.test.ts` still round-trips a hand-built literal
without `knownOrAbsentSchema`; and the phase manifest says 7 criteria, 52 rows, and 19
named mutations including C3(p), C3(q), MUT-02-17, MUT-02-18, and MUT-02-19.

Do not gate on a clean tree. The owner is concurrently changing frontend layout files and
the coordinator has uncommitted documentation. Record `git status --porcelain`; do not
modify, stage, revert, or include pre-existing foreign changes.

## Read first

1. The charter and executor doctrine, particularly delta-scoped fixes, evidence reuse,
   named mutations, checkpoints, and handoffs.
2. `handoffs/reviewer/phase-02-round-1.reviewer.md` in full. Its verified-correct
   surfaces are settled; do not re-review or alter them.
3. `plans/phase-02-errors-logger-values.md` in full, including the coordinator fold.
4. Intention §17A.1 and §17A.18 plus M9/M20; master-plan §§4, 6.1, 9, and 10.
5. Contracts `02` §§3, 5–8; `03` §§3–4; `06` §§4, 6, 8–9; `10` §7; `11` §§2–3, 5;
   `12` “Server” and “Data and validation”; and `14` §8.

## Exact final perimeter

- `src/lib/logger.ts`
- `src/lib/logger.test.ts`
- `src/lib/values/values.test.ts`

Temporary MUT-02-18 may touch `src/lib/values/absence.ts`, but it must be checksum-verified
byte-identical after reverting and is not final scope. Do not edit plans, the intention,
master plan, contracts, frontend files, or other source/test files.

## Required corrections

**F1 correction (verbatim):** “Build the accumulator as `Object.create(null)` —
`JSON.stringify` and the object spread both handle null-prototype objects, and
`isPlainObject` already admits them — or assign via `Object.defineProperty(result, key,
{ value, enumerable: true, writable: true, configurable: true })`. Add criterion row
**C3(p)** (‘plain objects retain hostile own keys’), trace `M20 / §17A.18`, named mutation:
*`logger.ts` · `redact` · restore `result[key] = …` on a `{}` accumulator → C3(p) red*.”

Implement this against folded C3(p): an own `"__proto__"` must remain an own serialized key,
with nested redaction intact. Also satisfy C3(q): return capturing writes from the helper and
assert exactly one newline-terminated write for the cyclic fixture.

**F2 correction (verbatim):** “Route the round trip through the schema, on both variants,
holding the object the schema produced: `const s = knownOrAbsentSchema(z.number());
expect(s.parse(JSON.parse(JSON.stringify(s.parse({ known: false }))))).toEqual({ known: false });`
plus the `{ known: true, value: 1 }` case — and give the row a named mutation (e.g.
*`absence.ts` · the absent variant · `z.strictObject({ known: z.literal(false) }).optional()`
→ C4(e) red*) so it ships with proof it can fail.”

Apply C4(e) exactly. Run and revert **only** MUT-02-17, MUT-02-18, and MUT-02-19; cite the
previous checkpoint evidence for the unchanged 16 rather than re-running them. N2 and
N4–N8 are already folded, routed, or settled and are outside this cycle.

## Evidence and closing

**L4 budget: exactly one run.** Run the closing `npm test` once on the handed-over tree,
recording HEAD plus dirty-tree diff digest and failure-ID delta. Run `npm run typecheck` and
`npm run lint`; use L1/L2 only for implementation and the three new mutations. If concurrent
frontend work makes a broad check fail, report it as foreign worktree state; do not alter it.

Create checkpoint commit `CHECKPOINT (not approved): phase 02 fix round 2 …`, containing only
the three final code/test files. Do not absorb coordinator documents, handoffs, frontend work,
or `tsconfig.tsbuildinfo`. Update only tracker row 2 to `IMPLEMENTED`, append the Review-log
entry, complete the documentation-impact review, and write
`handoffs/implementer/phase-02-round-2.implementer.md`.

The handoff must distinguish final writes from reverted probes; map all 52 rows to tests and all
phase tests back to rows; and account for the closed 19-mutation ledger as 16 checkpoint-cited
unchanged mutations plus 3 newly executed mutations — never imply the first 16 were rerun. No
owner card is expected unless a new authority conflict arises. Archgraph is absent; skip it
silently. Use the charter owner layer in your final chat message.
