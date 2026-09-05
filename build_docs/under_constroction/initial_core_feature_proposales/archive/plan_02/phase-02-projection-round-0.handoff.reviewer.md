---
plan: 2
role: projection
round: 0
date: 2026-09-05
verdict: AMENDMENTS_REQUIRED
state: OWNER_DECISIONS_PENDING
actor: Claude Opus 5 (1M context), plan-projection doctrine
---

# Phase 2 projection (round 0) — errors, logger, shared value shapes

## Opening summary (owner-readable)

I did the implementer's first hour of phase 2 on paper, without writing any code, to find
the decisions the plan leaves for the implementer to make silently. The plan is in good
shape on the two mechanisms it was written to protect: the "no value" shape and the money
shape are both fully pinned, and I confirmed against the real validation library that
every one of their acceptance checks can actually be written and can actually fail. The
gaps are elsewhere, and they cluster on the **log redaction guard** — the piece whose job
is to stop a real API key or a client's email address ever reaching a log line. Three of
its behaviours are simply not decided anywhere, one of them would crash the logger the
first time a field is empty, and one denylisted key has no test at all, so deleting it
would leave every check green.

I found fifteen items in total. Fourteen are for the coordinator to fold into the plan
before the implementer starts; they are ordinary planning corrections and none of them
needs you. **One needs you**, and it is below: the logging rules this phase implements
were never written down as a product decision anywhere — they were invented by the
planner — and I would like your call on whether they get recorded properly before eleven
later phases start depending on them.

Nothing is blocked while you decide except the start of phase 2 itself.

---

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Should the logging and redaction rules be written down as a product decision?

**Question.** Do we record the log-redaction rules in the intention (the document you
ratified) before phase 2 builds them, or do we let the plan be their only home?

**Story.** You are developing with a live Proposales key and a live AI key in your shell.
Somewhere in the next eleven phases, a piece of code logs the context of a failed upstream
call, and that context happens to include a field called `api_key` or a client's email
address. Whether that value reaches your terminal — and any log file behind it — is
decided by a seven-word list that appears in exactly one place: a paragraph of the phase-2
plan. It was never proposed to you, never ratified, and the document that decides every
other load-bearing rule in this build is silent on logging: the words "logger", "redact"
and "log line" do not appear in it once, and the mechanism review that ranked seventeen
mechanisms never listed this one.

**Branches.**
- **A — Record it (recommended).** The coordinator drafts a short new lettered section for
  the intention covering what may never reach a log, the denylisted key names, and the
  three undecided behaviours below; you ratify it; phase 2 then implements a ratified rule.
  Costs one short review pass by you.
- **B — Leave it in the plan.** Phase 2 ships on schedule with the planner's list. The
  rules still work, but nothing above the plan holds them, and a later phase that wants to
  widen them has nothing to check against.
- **C — Record it later, at closeout.** Cheapest now, but the eleven phases in between will
  already have been written against the unratified version.

**Recommendation.** **A** — because your own standing scope note says a path by which a
real credential escapes is always in scope, and this is the only such path in the build
that no ratified document governs.

**On silence.** The gate holds: phase 2 is not dispatched. Nothing is guessed and no
default is applied.

**Trace.** Intention §17A (no logging contract; mechanism inventory round 1 omitted it);
master plan §6.3, §9.0; plan 2 task 3; contract `10-security-and-trust-boundaries.md` §7;
ledger rows D3, D4, D8 below.

---

## Gate check

| # | Check | Result |
|---|---|---|
| 1 | Intention status header | **PASS** — `RATIFIED` (2026-09-05, owner, §21.1/§23) |
| 2 | Predecessor gate | **PASS** — master plan §4 row 1 reads `APPROVED` |
| 3 | Phase unstarted | **PASS** — row 2 `NOT_STARTED`; `src/lib/errors/` does not exist (`ls` → No such file or directory); `src/lib/` contains only `env/` |
| 4 | Amended counts present | **PASS** — plan states 38 rows and 8 named mutations and carries row `C3(i)` |

All four pass. The gate opened.

## Independent lint (charter manifest, re-derived — not trusted from the coordinator)

| Property | Result |
|---|---|
| 3 — counts derived | **PASS.** Rows re-counted from the table: C1 9 · C2 4 · C3 9 · C4 5 · C5 4 · C6 7 = **38**. Mutations enumerated: MUT-02-1…8 = **8**. File perimeter counted: **12**. Criteria **6** ≤ 8. Every stated number is right. |
| 2 — references resolve | **ONE FAILURE (D1)** and **one mis-citation (D8)**. All master-plan (§5 R6/R9/R12, §6.1, §6.3, §6.4, §9 rules 1/4), contract (04 §6/§10, 06 §6/§8, 10 §7, 03 §3, 12 "Server"/"Data and validation") and intention (§17A.1, §17A.2, §17A.13, §17A.16) citations resolve **and say what the plan claims**. §17A.10 does not (D8). `requiredKnownOrAbsent` resolves to nothing (D1). |
| 1 — rows addressable | **PASS.** Every row is `C<n>(<letter>)`. (Cosmetic only: the table orders C3 as a–f, g, i, h.) |
| 4 — mutation set closed | **PASS** as declared. Observation, not a finding: all 8 mutations land on `error-dto.ts` (2), `logger.ts` (3), `absence.ts`, `money.ts`, `uuid.ts` (1 each). `app-error.ts` — the file every later phase imports — `path.ts` and `timestamp.ts` carry none. |
| 5 — rows trace | **PASS in the reverse direction** (master plan §7.2 claims M8, M9, M13 for phase 2; C6, C4, C5 serve them). **One forward defect (D8).** |

**Two prior coordinator checks re-verified rather than assumed** (both clear, contrary to
my initial doubt on the second):
- Phase 1's `no-restricted-properties` rule reads `{ object: "process", property: "env" }`
  (`eslint.config.mjs:14–21`). Task 3's `process.stdout` default sink does not trip it.
- `src/lib/**/*.test.ts` does match a file sitting directly in `src/lib/`. Verified with
  the matcher rather than by reading the glob: `picomatch("src/lib/**/*.test.ts")` returns
  true for `src/lib/logger.test.ts` as well as for the nested `errors/` and `values/`
  paths. Phase 2's six test files are all claimed by the node project (§10.3 hazard clear).

---

## Decision ledger

Fifteen rows. Severity is my judgement of what it costs if the implementer decides it
alone: **HIGH** = a silent-failure defect eleven phases inherit; **MED** = a real gap that
costs a review round; **LOW** = worth one line in the plan.

| # | Decision the artifacts do not determine | What an implementer would most likely do | What the artifacts actually require | Class | Routing | Sev |
|---|---|---|---|---|---|---|
| **D1** | C4(b)'s mutation cell requires "the exported helper `requiredKnownOrAbsent`". No task creates it; master plan §6.1/§6.4 do not name it; it appears **once in the entire artifact set**, in that cell. | Bind the phrase to the nearest thing in scope — the plan's own fixture cell already uses `knownOrAbsentSchema` directly — and quietly disagree with the mutation cell, or invent a one-line re-export. | Nothing. I ran the mutation on paper against Zod 4.5.4: `z.strictObject({ q: knownOrAbsentSchema(z.number()) })` rejects `{}` at path `["q"]`, and adding `.optional()` makes `{}` parse. **MUT-02-3 works exactly as written with no helper.** The parenthetical is both a void reference and unnecessary. | plan gap | **Plan criteria.** Strike the parenthetical from C4(b)'s mutation cell. No task changes. | HIGH |
| **D2** | How `toErrorDto` converts a `ZodError`'s issue paths to `string[]`. Task 2 states the output type; it never states a conversion. | `details.issues = err.issues.map(i => ({ path: i.path as string[], message: i.message }))` — a cast, no conversion. C2(d) passes. | Zod 4.5.4 returns **numbers** for array indices: I ran `z.object({items:z.array(z.object({b:z.number()}))}).safeParse({items:[{b:"x"}]})` → path `["items", 0, "b"]`, element types `[string, number, string]`. §17A.1 requires `string[]` with "array indices as decimal strings"; `pathSchema` (`z.array(z.string().min(1))`) rejects the number. C2(d)'s fixture is object-only (`["a","b"]`) and **cannot observe the defect** (charter rule 2: enumerate, never sample). Contract 06 §8's own sentence "Zod's `error.issues` maps directly" is factually wrong for Zod 4 and is what invites this. | plan gap | **Plan task 2** — state `String(segment)`. **Plan criteria** — add a C2(e) row with an array-index fixture and a named mutation (drop the conversion → red). **Master plan §11 follow-up register** — a new row for the contract 06 §8 inaccuracy, alongside the existing R6 row. | HIGH |
| **D3** | `redact`'s behaviour on `null`, on arrays, on non-plain values, and on cyclic input. Task 3 says only "any key (case-insensitive, at any depth)". | The idiomatic recursion, `typeof v === "object" ? walk(v) : v`. Three consequences, none caught by any criterion: (a) **`null` crashes the logger** — `typeof null === "object"`, and `Object.entries(null)` throws; §6.4's `usage: { inputTokens: int \| null }` guarantees nulls reach it; (b) arrays walked with `Object.fromEntries(Object.entries(arr))` silently become `{"0":…}` objects in the line, so `{ upstream: [{ token: "S" }] }` is a shape nobody tested; (c) `JSON.stringify` throws on a cycle or a BigInt, and contract 10 §7 expects `cause` **chains** to reach the logger. | Undetermined everywhere. This is the phase's highest-consequence undetermined branch: it is the secret-leak guard, and one of its unwritten branches is a crash on ordinary input. | plan gap | **Plan task 3** — pin: `null` passes through; arrays recurse and stay arrays; non-plain values are stringified, not walked; serialization never throws. **Plan criteria** — add rows for `null`, for a secret nested inside an array, and for a non-serializable field, each with its own named mutation. | HIGH |
| **D4** | `REDACTED_KEYS` has **seven** members; C3(a–f) is "one row per key" with **six** fixture keys. `api_key` has no row. | Ship the seven-member list. Every criterion is green. | `api_key` is load-bearing and independent: matching is case-insensitive, so `apiKey` lowercases to `apikey` — a different string from `api_key`, which is what catches `API_KEY`, the most likely env-derived field name of all. Deleting `"api_key"` leaves `[redacted]` appearing six times and **every criterion green**. A secret-leak guard with no proof it can fail — charter rule 15, the same family as the coordinator's own C2(c) and C3(g) amendments, one row further along. Contract 10 §7 lists six keys; the plan's seventh is an unrecorded (and correct) widening. | plan gap | **Plan criteria** — extend C3 to seven rows, one per denylist member, fixture key per row. **Plan Notes** — record `api_key` as a deliberate widening of contract 10 §7. | HIGH |
| **D5** | Who owns the nine error codes. Contract 04 §6's base class declares `abstract readonly code: ErrorCode` and master plan §6.1 lists `ErrorCode` as an export of `app-error.ts` — **no task creates it**, and task 2 independently hard-lists the same nine strings in `z.enum([…9 codes])`. | Write `type ErrorCode = "validation_error" \| …` by hand in `app-error.ts`, then type the nine literals a second time in `error-dto.ts`. Two lists, no compile-time link. | One source. Nothing in the criteria compares the two, so a tenth code added to one and not the other compiles, passes, and produces a DTO that fails its own schema at runtime. | plan gap | **Plan task 1** — create and export `ErrorCode`. **Plan task 2** — derive `z.enum` from it (or the reverse), naming the direction. **Plan criteria** — one row asserting the enum's members equal the taxonomy's codes. | MED |
| **D6** | The six `reason` registries of master plan §6.3, declared there as "closed string unions". `ValidationReason` and `ConflictReason` attach to `ValidationError` / `ConflictError`, which this phase owns. **No phase in the plan set declares any of the six as a type** — phases 3, 6, 8, 9, 13, 14 only cite §6.3 in their read-first lists. | Type `reason?: string` in the `ValidationError` constructor and move on. | Closed unions. With `string`, `reason: "workflow_state_to_large"` compiles, ships, and reaches a caller switching on the correct spelling — the exact silent-failure family this phase exists to prevent. | plan gap | **Master plan §6.4** — add rows placing each registry in a module (`ValidationReason`/`ConflictReason` → `lib/errors/app-error.ts`; the four integration/run ones stay with their owning phases). **Plan task 1** — declare the two this phase owns and type the constructors against them. | MED |
| **D7** | Whether the newline in "exactly one JSON line per call" belongs to `line` or to the sink. Task 3 says the call "writes exactly one JSON line"; the signature is `sink: (line: string) => void`. | Build `line` with no terminator and let the default sink `process.stdout.write(line)`. | C3(h) uses a **capturing** sink and asserts `JSON.parse(line)` — which tolerates either choice — so the default sink is exercised by nothing. A production logger whose lines concatenate into one unparseable stream passes every criterion in this phase. The one place "exactly one JSON line" matters is the one place no test looks. | plan gap | **Plan task 3** — state which side owns the `\n`. **Plan criteria** — one row driving the **default** sink with a captured `process.stdout.write` and asserting two calls produce two parseable lines. | MED |
| **D8** | Where the logger's contract comes from. C3(a–f) traces to "§17A.10 (logs carry paths and counts, never values), 10 §7"; **C3(g) and C3(i) trace to §17A.10 alone**. | Read §17A.10 as the authority for the denylist. | §17A.10 is "The approval envelope and the prepared → approved diff". Its Logging paragraph governs **the approval-diff log event** (phase 13) — that it carries paths and a count, never `before`/`after`. It says nothing about a denylist, key casing, nesting, or one-line-per-call. I grepped the whole intention for `redact`, `logger`, `log line`, `never logged`: **zero hits.** The intention has no logging contract, and the mechanism inventory's seventeen mechanisms do not include one. So C3(g) and C3(i) — the two rows the coordinator added specifically to make the secret guard provable — trace to a section that supports neither. Doctrine §6: a trace to an entry that says something else is the void-symbol defect in a new coat. | trace defect + **intention gap** | **Plan criteria** — retrace C3(a–f), (g), (i) to `10 §7` alone until an intention section exists. **Coordinator → owner**: see **card 1**. Do not patch the intention directly. | MED |
| **D9** | Who guards contract 04 §10's absolute rule "No `console.log` in server code; use the structured logger". | Nothing. The plan's phrase "console-free default" is prose with no instrument. | Phase 1's `eslint.config.mjs` has no `no-console` rule. Phase 15's `scanTree` has rules (a) vendor SDK, (b) `fetch`, (c) `process.env`, (d) `server-only` — **no console rule**. I grepped all fifteen plans: the word appears once, in phase 2's task 3, as an adjective. An absolute contract rule guarded nowhere in the build, in the very phase that creates the module it points at. | plan gap | **Phase 15** — add a `scanTree` rule (e) plus its planted-violation row in the C2(e) pattern; this is the cheapest instrument and phase 15 already owns the perimeter. **Phase 2 Notes** — record the deferral so the phase-2 reviewer does not re-find it. Not phase 2's file perimeter. | MED |
| **D10** | What `values/path.ts` is for in this phase. Task 4 creates `pathSchema` and `formatPath`; **no criterion row exercises either**. | Write both, test neither, and leave the module as the only untested file of the twelve. | Charter rule 4 — no dead scaffolding: every helper added has a test caller in the same phase. I grepped every phase plan: `formatPath` has **zero consumers anywhere in phases 3–15**; the `Path` *type* does have downstream consumers (§6.4 `RunFailureReason.issues`, `approvalDiffSchema`), and `pathSchema` is implied by phase 13's diff schema. So the type earns its place and `formatPath` does not. Note master plan R12 justifies `src/lib/values/` on "two consumers from day one". | plan gap | **Plan criteria** — one C7 row on `pathSchema` (rejects an empty segment; accepts a decimal-string index), which also gives D2's conversion something to be checked against. **Plan task 4** — cut `formatPath`, or the coordinator names its consumer. | MED |
| **D11** | Whether phase 2's exported `knownOrAbsentSchema` can support the construction master plan §6.4 says is built on it. | Follow task 5 literally (correct for this phase) and leave the mismatch for phase 5 to hit. | §6.4: "`sourcedOrAbsent(leafSchema)` wraps a leaf as `{ known: true, …leaf } \| { known: false }` — **built on `knownOrAbsentSchema`**". That target is **flat** (§17A.1's `SourcedOrAbsent<T>` = `{ known: true, value, source, ref? }`), while task 5's schema nests under `value`. `knownOrAbsentSchema(sourcedLeaf)` yields `{ known: true, value: { value, source, ref } }` — a double-nested `value`, and `z.strictObject` forbids the spread form. The stated construction is unrealizable. Phase 5 discovers this; phase 2 is where the shape is fixed. | master-plan gap | **Master plan §6.4** — correct the sentence: either `sourcedOrAbsent` is an independent `z.discriminatedUnion("known", …)` sharing the discriminator convention, or `knownOrAbsentSchema` gains a flat variant here. A phase-2 decision either way. | MED |
| **D12** | Key precedence in the log frame. Task 3 fixes `{ level, event, time, ...redacted(fields) }`. | Write it exactly as stated. | Determined, but its consequence is undeclared and untested: a caller field named `event`, `time` or `level` **overwrites the frame**, so a log line can silently report the wrong event name. C3(h) passes `fields: undefined` and cannot see it. The safe order is frame-last. | free choice with a wrong default | **Plan task 3** — put the frame keys last, or state the shadowing as intended. **Plan criteria** — one row: a field named `event` does not change the emitted `event`. | LOW |
| **D13** | Whether identifiers are branded. Contract 06 §6 "Identifiers": "Brand them at the type level … via a Zod `.brand()` so a company id cannot be passed where a proposal uuid is expected." | Ship `uuidV4Schema` unbranded (§6.4 shows plain strings everywhere). | The deviation is defensible for an MVP with one uuid kind, but master plan §5 records fifteen local resolutions (R1–R15) and **none covers this**. An unrecorded deviation from a contract rule is what §5's resolution table exists to prevent, and phase 2 is the phase that decides it. | plan gap | **Master plan §5** — add one local resolution recording the no-branding decision and its reason. No code change. | LOW |
| **D14** | Whether `formatIsoTimestamp`'s output is guaranteed to satisfy `isoTimestampSchema`. C6(d) pins one point, epoch 0. | Assume always. | Not a rule-13 time bomb — the plan's note attributing the form to "V8" mis-states the authority: `Date.prototype.toISOString` is fixed by ECMA-262 §21.4.4.43 for years 0000–9999, so C6(d) asserts a language contract, and its second half (the output parses with the schema) is a genuine seam, not a dependency test (§7.4). Two out-of-band cases are real and uncovered: I verified `new Date(1e15).toISOString()` → `"+033658-09-27T01:46:40.000Z"`, which the schema **rejects**, and `new Date(NaN).toISOString()` throws `RangeError`. `now` is injected, so a test double can reach both. | editorial + free choice | **Plan task 7** — cite ECMA-262, not V8, so the criterion's authority is not a false claim. **Delegation** — no range guard in v1 (see list below). | LOW |
| **D15** | What enforces the declared runtime-neutrality of `src/lib/values/**` and `src/lib/errors/error-dto.ts` (master plan §6.1). | Nothing. | Phase 1's `no-restricted-imports` neutrality rule selects `src/**/schemas/**` and `src/**/types/**` only (`eslint.config.mjs`), so neither path is covered. Low reachability today (no client exists, R3 removes the transport), but §6.1 states the neutrality as a fact that nothing holds. | plan gap | **Phase 15** — fold into D9's `scanTree` addition as a second path family, or record the acceptance in phase 2 Notes. Not phase 2's perimeter. | LOW |

**Also observed, deliberately not raised as ledger rows:** `IntegrationError`'s `details`
placement (task 1) is built here and first asserted in phase 3 C1(a) — acceptable, the
phase still closes green on its own, but the phase-3 reviewer should know a phase-2
construction is under test there. And C1(a–i) carries no named mutation; it asserts a
positive contract table rather than a guard or an absence, so charter rule 15 does not
bind it.

---

## Depth targets — what I concluded on each

1. **`KnownOrAbsent` (rank 1).** The shape itself is **fully determinate and correct**. I
   walked all five rows against Zod 4.5.4 rather than reasoning about them: `{known:false}`
   parses and round-trips; `{}` inside a strict object fails at `["q"]`; `{known:true}`
   fails at `["value"]` exactly as C4(c) states; `{known:false,value:1}` fails
   `unrecognized_keys`. The only defect is the void symbol in C4(b)'s mutation cell (D1),
   and the mutation it describes works without it. §17A.1's rationale — a JSON round-trip
   must not turn "deliberately no value" into "a serializer ate the field" — is genuinely
   discharged by C4(e).
2. **Money (rank 3).** **Clean, and I want to say so plainly.** Phase 2's money surface is
   two schemas and nothing else: no helper, no formatter, no comparison, no conversion.
   There is no place in this phase where arithmetic could later be added, which is the
   question §17A.12 asks. I verified `.int()` rejects `10.5`, `"100"`, `NaN` and `Infinity`
   (and, as a bonus nobody planned, `1e20` as `too_big`), so C5(a–d) are decidable as
   written and MUT-02-4 bites. The arithmetic prohibition is guarded where it belongs, in
   phases 4 and 14's source scans of the pricing mapper.
3. **The taxonomy's totality.** Asked, and **the answer is reassuring on the part the
   prompt worried about**: `ProposalesError` and `AiProviderError` are built by real tasks —
   phase 3 task 1 and phase 8 task 5 — in their integration modules, which is where §6.1
   places them; phase 2's "Not in this phase" is correct and not a gap. The **registries**
   are the gap (D6): all six are declared in §6.3 as closed unions and **none is created by
   any task in any phase**. Two of them belong to classes this phase owns.
4. **The logger's contract.** The weakest surface in the phase, and the one with the worst
   consequence: D3 (three undetermined branches, one of them a crash), D4 (a denylist member
   with no instrument), D7 (the line terminator), D12 (frame shadowing), D8 (no upstream
   authority at all), D9 (the companion `console` prohibition guarded nowhere).
5. **Timestamps.** Judged: **not a rule-13 time bomb.** C6(d) pins a language-specified
   output and pairs it with the schema, which is a seam. The plan's "V8" attribution is
   wrong and should be corrected so the criterion does not rest on a false claim (D14).
6. **References and counts.** Re-derived independently; results in the lint table above.
   Every count is right. One reference resolves to nothing (D1) and one resolves to the
   wrong section (D8). Both prior coordinator checks re-verified and clear.

---

## Explicit delegation list

*(For the implementer prompt, verbatim. These are genuinely the implementer's call.)*

1. **The internal shape of `redact`** — recursive walk, `structuredClone` plus mutate, or a
   replacer — provided the behaviours D3 pins are met and the caller's own `fields` object
   is **never mutated** (a logger that edits its caller's data is a surprise nobody asked
   for).
2. **The wording of the fixed generic message** for the unknown-error branch. C2(c) asserts
   that it is fixed and that the original text is absent, never what it says. Any constant
   with no interpolation.
3. **Constructor ergonomics of the seven classes whose constructors the plan does not
   specify** (everything but `IntegrationError` and `ValidationError`), as long as C2(a)'s
   `new ConflictError({ message, details })` call shape compiles.
4. **The direction of the `ErrorCode` ↔ DTO-enum derivation** once D5 is folded — either is
   fine; picking neither is not.
5. **Test organisation inside `values.test.ts`** (describe blocks, table-driven cases). The
   plan fixes the file; it does not fix its interior.
6. **The capturing-sink test double's shape.**
7. **No range or `NaN` guard on `formatIsoTimestamp` in v1** (D14) — the injected clock is
   the only caller, and the owner's scope brief trims guards whose beneficiary does not
   exist yet. If the implementer wants one, it is free to add it; it is not required.
8. **Whether `REDACTED_KEYS` is a `readonly string[]` or a `Set`.**

---

## Write perimeter (full)

Documents only. No source file was read-modified; no code was written; no test was run.

| File | Change |
|---|---|
| `handoffs/reviewer/phase-02-projection-round-0.reviewer.md` | created (this file) |
| `master-plan.md` | tracker §4 row 2 only: `NOT_STARTED` → `PROJECTED`, date, actor, note |
| `plans/phase-02-errors-logger-values.md` | Review log: one appended line. **Declared divergence** — plan-projection doctrine says the coordinator writes this line when it consumes the handoff; this session's prompt (§6 item 4) directs the projection session to write it. I followed the prompt and am declaring the divergence rather than silently choosing (charter rule 14). The prompt's §6 item 1 also predicts a one-file perimeter, which its own items 3 and 4 contradict; the table above is what actually happened. No task, criterion, Files-expected-to-change or Notes text was touched. |

**Foreign changes in the tree, declared so no later perimeter check attributes them to
this session.** `git status --porcelain` at close also shows ` M src/styles/globals.css`
and `?? postcss.config.mjs`, with mtimes of 14:19 and 14:20 — during this session but
**not written by it**. They belong to the styling work whose contracts
(`architectural_contracts/15-ui-styling-and-component-system.md`,
`16-design-prototype-porting.md`) were already untracked when this session opened. This
session wrote three files, all listed above, and ran no command that writes to `src/`.

**Evidence budget: L4 runs = 0**, as directed. Everything above was derived on paper or
from read-only commands: `ls`, `grep`, `sed`, `npx vitest list`, and four throwaway
`node -e` probes against the repository's installed `zod@4.5.4`, `picomatch`, and the V8
`Date` built-in — none of which touched the repository tree.

## Non-authoritative appendix

Discarded per doctrine. The paper skeleton (module signatures, control flow for `redact`
and `toErrorDto`, per-file sketches) is deliberately **not** attached: handing the
implementer my sketch would make this session a second planner and defeat the fresh-session
rule the gate depends on. Everything it produced that matters is a ledger row above.

## Exit condition

**AMENDMENTS_REQUIRED.** Fifteen ledger rows, every one routed. Per the doctrine's exit
gate, the implementer prompt compiles once each row is applied, changed upstream, or
recorded as a delegation — and card 1 is answered or explicitly deferred by the owner.
This is round 0 with a non-empty ledger, so the gate's self-retiring clock does not start.
