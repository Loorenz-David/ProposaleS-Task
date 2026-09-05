---
plan: 2
role: reviewer
round: 1
date: 2026-09-05
verdict: CHANGES_REQUESTED
state: CHANGES_REQUESTED
actor: Claude Opus 5 (1M context), plan-reviewer doctrine
---

# Phase 2 review (round 1) — errors, logger, shared value shapes

## Opening summary

First independent implementation review of phase 2, against checkpoint
`b0cd457fb3b2df02907657a9c4714e2ac382f420`. All four gate rows passed. The perimeter is
exactly the 12 planned files plus the master plan and the phase plan; `src/lib` is
byte-identical between the checkpoint and my review tree, so what I read is what was
implemented.

The phase is close. The taxonomy, the DTO boundary, the redaction denylist, the total
walk, the money/uuid/path/timestamp shapes and the runtime-boundary placement are all
correct, and I verified them by variation rather than by re-running the implementer's
evidence. **Two should-fix findings, no blocking findings, eight notes.** One is a real
deviation from the ratified logging contract; the other is the defect family this
project's own review lineage is most expensive in — a guard with no proof it can fail,
sitting on the intention's most load-bearing shape.

⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner. Both findings have determined corrections inside the existing
ratified authorities; no card is needed.

## Findings

### F1 — should-fix — `redact` silently drops an own `__proto__` key

**Where.** `src/lib/logger.ts:41–51`.

**What is wrong.** The walk accumulates into `const result: Record<string, unknown> = {}`
and writes `result[key] = …`. When `key` is `"__proto__"`, that assignment does not create
an own property: it invokes `Object.prototype`'s `__proto__` **setter** on the fresh
accumulator. The field is therefore omitted from the emitted record entirely, and the
accumulator's prototype is silently reassigned to caller-derived data.

**Violated authority.** Intention §17A.18 clause 3 — "Plain objects retain their keys and
are processed recursively" — ledger **M20**.

**Verified.** Probe, applied and reverted:

- `logger.info("e", JSON.parse('{"__proto__":{"authorization":"PS1","plain":"PS2"}}'))`
  emits `{"level":"info","event":"e","time":"1970-01-01T00:00:00.000Z"}` — the entire
  field is gone.
- Nested: `{ up: JSON.parse('{"__proto__":{"token":"PS3"},"kept":"yes"}') }` emits
  `{"up":{"kept":"yes"},…}` — the sibling survives, the hostile key does not.

**Not a leak, stated so the severity is not over-read.** Nothing inherited reaches the
output (`JSON.stringify` and the object spread both read own enumerable properties only),
and the frame fields are untouched: with `{"__proto__":{"level":"HACKED"},"level":"x"}` the
record still carries `level: "info"`. The cost is a diagnostic field disappearing without
a trace, which is exactly the failure mode a fail-closed walk exists to prevent.

**Correction.** Build the accumulator as `Object.create(null)` — `JSON.stringify` and the
object spread both handle null-prototype objects, and `isPlainObject` already admits them
— or assign via `Object.defineProperty(result, key, { value, enumerable: true, writable:
true, configurable: true })`. Add criterion row **C3(p)** ("plain objects retain hostile
own keys"), trace `M20 / §17A.18`, named mutation: *`logger.ts` · `redact` · restore
`result[key] = …` on a `{}` accumulator → C3(p) red*.

### F2 — should-fix — C4(e) is a guard that cannot fail

**Where.** `src/lib/values/values.test.ts:23`.

**What is wrong.** The row reads
`expect(JSON.parse(JSON.stringify({ known: false }))).toEqual({ known: false })`. That is a
tautology about `JSON` over a hand-built literal; `knownOrAbsentSchema` is not invoked,
not imported into the assertion, and cannot influence the outcome. The plan cell specifies
the round-tripped value is "**re-parsed**"; the re-parse was dropped and the divergence was
not declared.

**Violated authority.** Charter standing rule 15 (a guard ships with proof it can fail)
and rule 3 (invariants proven on the production code path, the test holding the object
production holds). The row exists to protect intention §17A.1's "single most load-bearing
shape in §17A" (**M9**), and master-plan §6.4 builds every `sourcedOrAbsent` leaf on the
same required-discriminator convention.

**Verified by mutation probe** (applied, run at L1, reverted, checksum-verified). Replacing
`knownOrAbsentSchema`'s body with `z.object({ known: z.boolean(), value: inner.optional() })`
— abandoning the discriminated union, the strict objects and the literal discriminator all
at once — gives:

```
× C4(c) requires a value for known true
× C4(d) rejects extra keys on absent
✓ C4(e) round-trips through JSON        ← survives the schema being replaced wholesale
```

**Correction.** Route the round trip through the schema, on both variants, holding the
object the schema produced:

```ts
const s = knownOrAbsentSchema(z.number());
expect(s.parse(JSON.parse(JSON.stringify(s.parse({ known: false }))))).toEqual({ known: false });
expect(s.parse(JSON.parse(JSON.stringify(s.parse({ known: true, value: 1 }))))).toEqual({ known: true, value: 1 });
```

and give C4(e) a named mutation so it ships with proof — e.g. *`absence.ts` · the absent
variant · `z.strictObject({ known: z.literal(false) }).optional()` → C4(e) red*.

## Notes (non-blocking)

| # | Note | Correction / destination |
|---|---|---|
| N1 | C3(m) asserts one newline **inside `writes[0]`** (`line.split("\n")` length 2) but never `writes.length === 1`, because `recordFor` does not return `writes`. The row's first half ("one line is emitted") is therefore under-asserted. Behavior itself verified correct by probe: exactly one write. | Return `writes` from `recordFor`; add `expect(writes).toHaveLength(1)`. Fold into the fix round. |
| N2 | C7(b)'s plan cell says the issue path is `["1"]`. Zod 4 emits the numeric index `[1]` — which the test asserts and which projection D2 already established. The plan cell is wrong; the implementer's coverage map states the numeric form without flagging the divergence. | Coordinator: correct the plan cell to `[1]`. |
| N3 | The handoff's declared write perimeter is inaccurate. It says `master-plan.md` "(tracker row 2 only)", the phase plan "(append-only Review log)", and "unrelated pre-existing worktree changes were not included". The checkpoint also carries the coordinator's entire projection fold in both files: master-plan §4 totals + fold note, R16, §6.1 `path.ts` row, the §6.3 registry table's new column, the §6.4 `sourcedOrAbsent` paragraph, the gate log and follow-up row 7; and in the phase plan the amended acceptance table, Read-first, tasks 1–4 and 7, the fold paragraph and both coordinator Review-log entries. The content is legitimate coordinator work — the **declaration** is what is wrong, and the checkpoint consequently no longer isolates the round's own authorship, which is the provenance the charter's checkpoint rule exists to provide. | Stage checkpoints per-path; the handoff perimeter names what the commit actually contains. Coordinator: lesson for the implementer prompt template. |
| N4 | `tsconfig.tsbuildinfo` is a **tracked, non-gitignored** TypeScript incremental cache. `npm run typecheck` is a mandatory closing check (§9.1 rule 10), so every session that closes correctly rewrites a tracked file and moves the charter's dirty-tree identity digest for reasons unrelated to its work. My own entry digest `631451d6…` became `ed287d81…` from typecheck alone; mtimes confirm it is the only file in the repository this session touched. | `.gitignore` it and `git rm --cached tsconfig.tsbuildinfo`. Coordinator / repo hygiene, not phase-2 authorship. |
| N5 | `src/lib/logger.ts` exports no `logger` instance, though master-plan §6.1's module map lists "`logger` (structured, redacting); `createLogger(sink)` for tests" and contracts 04 §10 and 10 §7 both say "use the structured logger in `src/lib/logger.ts`". Plan-conformant (task 3 prescribes only `createLogger`) and correct under charter rule 4 — an unused singleton would be dead scaffolding. | **Carry forward to phase 3**, the first module that logs: it adds the singleton with its consumer, or the coordinator amends §6.1. Recorded so phase 3 does not invent a second logger. |
| N6 | `isoTimestampSchema` validates form, not calendar validity: `"2026-13-45T99:99:99.999Z"` and `"0000-00-00T00:00:00.000Z"` both parse. This is exactly the regex master-plan §6.4 and plan task 7 prescribe, so it is **not** a deviation — but from phase 3 the same schema validates timestamps mapped from Proposales epoch values, and later `preparedAt` / `approvedAt`. | Routed as a recommendation, not changed here: coordinator decides whether the shared timestamp value gains a calendar-validity refinement, and if so records it as a master-plan/intention amendment with its own row. |
| N7 | `formatIsoTimestamp` is unguarded at two edges, neither covered by a row: `new Date(NaN)` throws `RangeError: Invalid time value`, and a year outside 0000–9999 returns an expanded-year form (`+275760-09-13T00:00:00.000Z`) that its own `isoTimestampSchema` rejects. Unreachable in v1 — §17A.16 routes every timestamp through an injected `now()`. | The implementer's declared delegated choice ("no extra timestamp range/NaN guard") is **assessed and accepted on its merits**. Recorded so a later phase that formats a parsed or caller-supplied date knows the seam is unguarded. |
| N8 | `logger.ts` formats its own timestamp with `now().toISOString()` rather than the `formatIsoTimestamp` this same phase creates — two producers of one form, both runtime-neutral-safe to import. | Cosmetic; fold into the fix round only if it is free. |

## Verified correct

Reported specifically so the re-review is delta-scoped and cheap.

- **Taxonomy (C1(a–i)).** Re-derived against contract 04 §6 and master-plan §6.3: nine
  classes, exact codes and HTTP statuses, `ERROR_CODES` in the table's order, `instanceof
  AppError` intact through `Object.setPrototypeOf`. `IntegrationError.details` carries
  `system` / `status?` / `retryable` / `reason?` / `operation?` per task 1.
- **One error-code source actually bites (C1(j), C1(k)).** Probe: hardcoding the DTO enum
  to the nine literals *and* adding a tenth member to `ERROR_CODES` reddens both rows. The
  derivation claim is guarded, not merely asserted.
- **Closed reason registries (C1(l)) match §6.3 exactly** — and bite **only in `tsc`**.
  Probe: adding the plan's misspelling `workflow_state_to_large` to `ValidationReason`
  leaves `npx vitest run src/lib/errors/app-error.test.ts` at 11 passed, while
  `npm run typecheck` errors at `app-error.test.ts(54,7)`. `expectTypeOf` is erased at
  runtime; `tsconfig.json` includes `**/*.ts`, so the gate is real but lives in the
  typecheck command. No session should read C1(l) as suite-enforced.
- **DTO boundary.** `cause` never crosses; the unknown branch emits the fixed generic
  message and no `details`; the `AppError` branch copies only `code` / `message` /
  `details`.
- **Zod path stringification.** Holds at multi-index depth (`{ m: [[1,"x"]] }` →
  `["m","0","1"]`), across multiple issues in one error, and on root-level issues
  (`path: []`, which `pathSchema` accepts).
- **Redaction is exact-lowercase and closed**, as §17A.18 clause 2 requires: `Api_Key`,
  `PassWord`, `APIKEY`, `Authorization` redact; `E_MAIL`, `"email "`, `"  token  "`
  correctly do **not** — the contract matches the lowercase spelling exactly and the v1
  list is closed. A denylisted key whose value is an object is replaced wholesale.
- **The walk is total.** bigint, `NaN`, `Infinity`, `undefined`, symbol, function, `Date`,
  `Map`, `Set` and every non-plain object become `"[unserializable]"`. Null-prototype plain
  objects are walked and redacted. Accessor own properties are never invoked (the getter
  did not run). A plain object's own `toJSON` is neutralized to a string and never called.
  A Proxy whose `ownKeys` trap throws yields `"[unserializable]"` with no exception
  escaping — the "never throws" half of clause 3 holds. (The walk *does* invoke benign
  `ownKeys` / `getOwnPropertyDescriptor` traps; nothing in this codebase constructs a
  Proxy, so this is recorded rather than routed.)
- **Cycle handling is path-scoped, which is the correct reading.** An ancestor cycle fails
  closed to `"[unserializable]"` with exactly one write emitted; a **sibling** repeated
  reference is preserved and independently redacted. §17A.18 names cycles, not repeats,
  and `JSON.stringify` handles repeats natively.
- **Immutability and frame ownership.** Caller input is not mutated; no caller field —
  `__proto__` included — can alter `level`, `event` or `time`.
- **Framing (C3(o)).** Structurally one `sink` call with one newline-terminated string;
  the default sink is `process.stdout.write` bound at construction. The test is
  non-vacuous: the length assertion precedes the `every`.
- **Money re-checked through `moneySchema`**, not only `currencyCodeSchema`: lowercase,
  two-letter and newline-bearing currency, missing keys, extra keys (strict), `NaN`,
  `Infinity` and `1e21` all fail at the right paths; `0`, `-0` and negative integers parse.
- **UUID** rejects the wrong variant nibble (`c456`), leading and trailing newlines, wrong
  length and unhyphenated forms. JS `$` anchors at end-of-input, so there is no multiline
  hole. The pattern matches master-plan §6.4 byte for byte.
- **Path** rejects `["a", 0]` at index 1, `[""]` at index 0 and a bare string; accepts `[]`,
  the root path Zod itself emits.
- **Runtime neutrality, structurally.** `app-error.ts` imports nothing; `error-dto.ts` and
  the five value modules import only `zod` and each other; `import "server-only"` is line 1
  of `logger.ts` and appears nowhere else in the phase; no `process.env` anywhere;
  `process.stdout` does not trip phase 1's `no-restricted-properties` rule (which targets
  `process.env`), confirmed by a clean `npm run lint`.
- **Collection.** `npx vitest list` claims all four phase test files under the `node`
  project exactly once and none under `jsdom` — the master-plan §10.3 hazard check the
  plan's Notes require.
- **Manifest, re-derived independently rather than carried.** 7 criteria · 50 rows
  (C1 12 · C2 5 · C3 15 · C4 5 · C5 4 · C6 7 · C7 2) · 16 named mutations (MUT-02-1…16) ·
  12 files · 44 tests (11 + 6 + 9 + 18, counting `it.each`'s nine cases). Reverse map has
  no orphan test and no uncovered row. The handoff's counts reconcile exactly.
- **Scope fences respected.** No `ProposalesError` (phase 3), no `AiProviderError`
  (phase 8), no transport, agent, feature schema or phase-15 scanner. `formatPath`
  correctly absent (D10).

## Evidence

**L4 budget: exactly one run, authorization recorded before it.**

| Field | Value |
|---|---|
| Hypothesis | The review-entry tree's full-suite state and failure-ID baseline |
| Scope | L4 — justified by charter test-evidence (b): my tree differs from the implementer's recorded stamp tree |
| Command | `npm test` |
| Tree identity | HEAD `a14c20187cd338fe5ab66af9ac32aea5c449b7ba`, dirty, `git diff` digest `631451d6c55aaa960050212c39cd5dce755ee425b36a38a576a5dc362c0a24de` |
| Result | 6 files / 65 tests / exit 0 |
| Failure-ID delta | ∅ → ∅ |

Closeout checks: `npm run typecheck` clean, `npm run lint` clean. The implementer recorded
one `import/no-anonymous-default-export` warning in `postcss.config.mjs`; that file has
since been rewritten by the owner's concurrent work and no longer warns — a
**foreign-worktree difference, not a phase-2 delta**.

The owner is concurrently deleting the prototype component layer (`src/components/ui/**`,
`src/app/page.test.tsx`, `src/components/offline-guard.test.ts`) and the coordinator holds
uncommitted documentation. Recorded, not touched, not reported as phase-2 drift. One
consequence worth stating: the `jsdom` Vitest project currently collects **zero** files.

**The implementer's 16 named mutations were deliberately not re-run.** Their tree identity
is the checkpoint and my probes ran on a `src/lib` byte-identical to it; re-running them
unvaried would be a finding against this round (charter: over-evidence is a defect,
symmetrically). The budget was spent on variation instead.

**Variation probes (new evidence).** One temporary test file exercising 20 hypotheses:
hostile own keys (`__proto__`, top-level and nested), sibling-vs-ancestor references,
null-prototype objects, accessor properties, benign and throwing Proxy traps, bigint /
non-finite / `undefined` / symbol / `Date` / `Map` / `Set`, sensitive keys at a deeper
array-in-object location with novel casings, foreign `toJSON`, caller mutation, frame
injection, multi-index and multi-issue and root-level Zod paths, the ten
`knownOrAbsent` shape variations, twelve money shapes through `moneySchema`, eight
timestamp forms plus the two `formatIsoTimestamp` edges, seven UUID forms, eight path
forms, and the cyclic write count.

**Mutation probes (new hypotheses, each applied at L1 and reverted).**

| Probe | Site | Hypothesis | Observed |
|---|---|---|---|
| RP-1 | `src/lib/values/absence.ts` — replace the discriminated union with `z.object({ known: z.boolean(), value: inner.optional() })` | C4(e) cannot fail | **Confirmed.** C4(c) and C4(d) red; C4(a), C4(b), **C4(e)** green → finding F2 |
| RP-2 | `src/lib/errors/app-error.ts` (add a tenth code) + `src/lib/errors/error-dto.ts` (hardcode the enum) | the DTO-enum derivation guard bites | **Refuted as a defect** — C1(j) and C1(k) both red. Verified correct |
| RP-3 | `src/lib/errors/app-error.ts` — add `workflow_state_to_large` to `ValidationReason` | C1(l) bites, and where | `npx vitest run` 11 passed (green); `npm run typecheck` errors at `app-error.test.ts(54,7)`. Guard real, enforced by `tsc` only |

## Full write perimeter

- `build_docs/.../plans/phase-02-errors-logger-values.md` — one appended Review log entry
  (append-only; nothing above the Review log touched).
- `build_docs/.../master-plan.md` — **tracker row 2 only**.
- `build_docs/.../handoffs/reviewer/phase-02-round-1.reviewer.md` — this file (new).

No production or test file was modified. No frontend-owned file was touched. Archgraph is
absent; skipped silently. No approval commit made.

## Mutation-probe declaration

Files touched by probes, each applied and reverted, all verified **byte-identical** to the
pre-probe baseline by `shasum -a 256 -c`:

- `src/lib/values/absence.ts` — `22beb81ee9cc67b1689dabba86c5eb304f8b8726001b381532d7a631c04ffd0e`
- `src/lib/errors/app-error.ts` — `58980e6d7b8f21387c3c991399b55f40aedb719f8eaad76cd7b2d62de15f8050`
- `src/lib/errors/error-dto.ts` — `722ea21c51b3b666824d5eacef331bdfa33d06255f9dade5b09610e4064417f8`

All twelve phase files verify `OK` against the baseline. One temporary probe file,
`src/lib/zz-reviewer-probe.test.ts`, was created, run and deleted; it is absent from the
tree and was never tracked. There is no database or other state side effect in this phase.
The only file in the repository whose mtime falls inside this session is
`tsconfig.tsbuildinfo`, regenerated by the two `npm run typecheck` invocations — see N4.

## Carry-forward dispositions

| Item | Destination | Why it must not evaporate |
|---|---|---|
| N5 — no `logger` singleton in `src/lib/logger.ts` | **Phase 3** (first logging consumer) | Otherwise phase 3 invents a second logger or reopens §6.1 mid-round |
| N6 — timestamp form-vs-calendar validity | **Coordinator**, before phase 3 dispatches | Phase 3 maps Proposales epoch values through this schema |
| N7 — `formatIsoTimestamp` NaN / expanded-year edges | **Phase 15** candidate list, with the accepted-delegation reason | So a later session neither re-derives the argument nor quietly "fixes" it |
| N2 — C7(b) plan literal | **Coordinator**, with the fix prompt | A wrong plan cell costs the next reviewer a finding on a non-defect |
| N3 — checkpoint staging discipline | **Coordinator**, implementer prompt template | The checkpoint's whole purpose is per-round provenance |
| N4 — `tsconfig.tsbuildinfo` tracked | **Coordinator**, repo hygiene | It destabilises the tree-identity digest every session depends on |

## Lessons for the plans

1. **A round-trip criterion must name the production symbol that has to appear in its
   assertion.** C4(e)'s "re-parsed" was not strong enough to force the schema into the
   test, and the row shipped as a tautology on the intention's most load-bearing shape.
   Every row of this shape needs a named mutation for the same reason.
2. **C3(m) bundles two obligations under one mutation** — "one line is emitted" and
   "cyclic value fails closed" — so one behaviour rode along untested (charter rule 2 and
   rule 12: enumerate the mutations too, one per sub-check).
3. **C7(b)'s expected literal is wrong** against Zod 4, in a plan whose own projection
   (D2) had already established that Zod 4 emits numeric indices. Corrections folded into
   one cell should be swept across every cell of the same kind.
4. **§17A.18 clause 3's "retains its keys" has no criterion row.** The clause was read as
   being about recursion; the omission half went unserved, and that is exactly where F1
   lives. New row C3(p) proposed.
5. **C1(l) is a `tsc`-only guard.** A plan whose criterion is discharged by `expectTypeOf`
   should say so in the row, because `npm test` gives it no signal at all.

## What the next round must do

A fix round, delta-scoped: F1 in `src/lib/logger.ts` plus new row C3(p) and its mutation;
F2 in `src/lib/values/values.test.ts` plus a named mutation for C4(e); N1's
`expect(writes).toHaveLength(1)`; optionally N8. Plan amendments for N2 and the C3(p)/C4(e)
rows are the coordinator's, not the implementer's. Everything in "Verified correct" is
settled and should not be re-verified.
