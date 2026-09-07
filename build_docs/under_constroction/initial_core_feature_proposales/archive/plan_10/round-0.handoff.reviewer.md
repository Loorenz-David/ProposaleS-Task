---
plan: plans/phase-10-conversation-context.md
role: projection
round: 0
state: AMENDMENTS_REQUIRED
verdict: AMENDMENTS_REQUIRED
date: 2026-09-07
actor: Claude (projection session, plan-projection doctrine)
---

# Phase 10 projection round 0 — conversation context, retrieval record, message assembly

## Opening (owner-readable)

Phase 10 cannot be built as written. The function that turns a finished result into the
sentence the assistant "said" is declared to take a result type that does not exist yet and
that no document in the project fully describes — it is scheduled to be written in the *next*
phase. That is the same shape that stopped phase 9 before a line was typed, and it is better
found here. Separately, a second instruction asks the code to copy a match strength and a score
off a proposal block, and blocks have never carried either field, so that branch cannot be
written at all.

Beyond those two, the acceptance table is thin in the way the last two phases were expensive
about: five of its twenty-five rows can be satisfied by an implementation that does almost
nothing, and six stated expected values turned out to be wrong when I ran the validation library
instead of reasoning about it. Two questions need you personally: what strength a block already
in the proposal should carry when the assistant looks it up, and whether the text of a question
the assistant asked earlier may appear in the transcript the model reads. Nothing here is a
defect in shipped code, and no approved phase is reopened.

## ⚠ OWNER DECISIONS REQUIRED (2)

### Card 1 — What strength does a block already in the proposal have?

**Question.** When the assistant looks up a block that is already in the proposal, should it see
"strong match, top score", or should it see no strength at all?

**Story.** You ask for a revision: "keep the training block, swap the workshop one." The
assistant looks at what is already in the proposal to find "the training block". Today the
proposal records, for each block, only its identity and title — never how good a match it was.
The plan tells the code to copy "the block's recorded values", and there is nothing to copy. If
we invent "strong, top score" for every block, the assistant is told the current proposal is
uniformly excellent, and a weak block you accepted last week looks as good as a perfect one. If
we record no strength, the assistant can still name the block but cannot compare it to a fresh
search result.

**Branches.**
- **A — every block seeds as strong, top score.** Simple, one rule, no special cases. The
  assistant can never tell a weak accepted block from a strong one.
- **B — every block seeds with no strength.** Honest. The assistant compares fresh search
  results against each other but not against what is already in the proposal.
- **C — only human-added blocks seed as strong; others seed with no strength.** Matches the
  plan's original intent, but the two kinds of block then look different to the assistant for a
  reason it was never told.

**Recommendation.** **B** — seed with no strength. It is the only branch that states nothing
false, and the assistant's job at this point is to *identify* the block, not to re-rank it;
ranking is what a fresh search is for.

**On silence.** The gate holds. Task 3 stays unbuildable and the phase is not dispatched.

**Trace.** Plan task 3 and its third Note; master §6.4 `RetrievalRecord`; intention §17A.8, §17A.17 item 6.

### Card 2 — May the text of an earlier question appear in the transcript the model reads?

**Question.** When the assistant asked "What language should this be in?" three turns ago, should
the model later see those words, or only "we asked about language"?

**Story.** The rule you ratified says the assistant's side of the transcript is built by the
application from ids, catalog titles and fixed labels — never from words the model wrote. A
question's text is words the model wrote. You saw them, you answered them, and they are part of
what happened. But they are also the one place text the model authored gets read back to it, and
the whole point of the rendered transcript is that the model can only refer to things the
application already checked.

**Branches.**
- **A — show only the question's id and topic** ("asked about: language"). The ratified rule
  stays literally true. You can still say "the second question" and be understood.
- **B — show the question's text too.** Richer transcript; requires adding question text to the
  ratified list of what an assistant turn may contain, which re-opens the intention.

**Recommendation.** **A** — the topic carries everything a later reference needs, and it costs no
ratification round.

**On silence.** The gate holds. The rendering row stays undecidable and the phase is not dispatched.

**Trace.** Plan task 2 (clarification rendering) and row C3(b); intention §17A.17 item 2.

---

## 1. Gate result and recorded baseline

| # | Gate | Result |
|---|---|---|
| 1 | Intention `RATIFIED`, §23 reaches round 18 | **PASS.** Status header `RATIFIED` (intention line 4); last changelog round is **Round 18** (line 1239) |
| 2 | Tracker rows 1–9 `APPROVED`; row 10 `NOT_STARTED`; plan header `PROJECTING` | **PASS with a correction (F5).** Rows 1–9 are `APPROVED` (master-plan.md:128–136). Plan header is `PROJECTING` (plan line 4). **Tracker row 10 reads `PROJECTING`, not `NOT_STARTED`** (master-plan.md:137) — the coordinator advanced it at dispatch. Not a blocker; recorded because the prompt asserted otherwise, and because `PROJECTING` is not a member of the charter's phase state machine (`NOT_STARTED → PROJECTED → …`) |
| 3 | Master §9.1 contains rules 17–21 | **PASS.** Rules 17, 18, 19, 20, 21 all present (master-plan.md §9.1) |
| 4 | `src/lib/agent/` has `run.ts`, `define-tool.ts`, `types.ts` | **PASS.** All three present, plus two colocated test files |
| 5 | The four target files do not exist | **PASS.** All four absent (`schemas/conversation.ts`, `server/domain/conversation.ts`, `server/domain/retrieval-record.ts`, `server/agent/build-messages.ts`) |
| 6 | `npm test` green at 31 files / 421 tests | **PASS, by citation — not re-run.** See below |

**Baseline, recorded.** Tree identity `f2d435c`, `git status --porcelain` empty (asserted clean).
`git diff --name-only 3bd5899 f2d435c -- src test` returns **0 paths**: the approval commit changed
documentation only, so phase 9's approval-gate stamp is tree-valid here. Cited stamp: **31 files /
421 tests green, typecheck and lint clean** (master-plan.md:136, coordinator's independent re-run at
checkpoint `3bd5899`). Test-file count re-derived independently by command on this tree:
`find src test -name "*.test.ts" | wc -l` → **31**. The suite itself was **not executed** — this
round is read-only, and re-running an unchanged tree is a finding against the session under the
charter's over-evidence rule. No `npm install`, no network, no provider call, no build.

---

## 2. The two blocking findings

### I1 — `renderAssistantTurn`'s parameter type does not exist, and its shape is nowhere specified

Plan task 2 and master §6.6 both declare
`renderAssistantTurn(result: DomainResult, proposition?: Proposition): string`.

- `DomainResult` is the inferred type of `domainResultSchema`, which lives in
  `schemas/turn-result.ts` (master §6.1, §6.4). That file **does not exist**
  (`find src -name "*.ts"`, 2026-09-07: `schemas/` holds `shared`, `information-items`,
  `clarification`, `content-candidate`, `proposition`, `workflow-state` — six files, no
  `turn-result`).
- It is created by **phase 11**, task 2: *"`schemas/turn-result.ts`: `domainResultSchema` (5
  states; `clarification` carries `questions` and optional `budgetExhausted: { budget }`),
  `runReportSchema`, `turnResultSchema`"* (`plans/phase-11-prepare-and-clarify.md:35`), and
  `schemas/turn-result.ts` is **not** in phase 10's ten-path "Files expected to change".
- Worse than unbuilt: **it is unspecified**. Grepping every plan, the master and the intention for
  `domainResultSchema` / `DomainResult` returns five hits, none of which give the payload of the
  `proposition`, `created` or `recovered` arms. Master §6.3 names the five states and gives only
  `failed`'s payload. So even a phase-10 session willing to widen its perimeter could not write
  the type.

This is phase 9's `ToolContext` defect exactly: the phase is literally unbuildable, and five of
its twenty-five rows (C3(a)–(e)) depend on constructing a fixture of a type nobody has defined.

**What the implementer would do if unrouted:** invent a local shape, discover at phase 11 that it
disagrees with `domainResultSchema`, and either widen `renderAssistantTurn` or edit an approved
phase.

**Proposed routing — coordinator decision, not an owner one** (phase 11 is `NOT_STARTED`, so no
approved perimeter is touched). Recommended branch:

> Declare, in `server/domain/conversation.ts`, a **narrow local input union** naming only what the
> renderer reads, and require phase 11 to prove `DomainResult` is assignable to it:
>
> ```ts
> export type RenderableResult =
>   | { status: "proposition" }
>   | { status: "clarification"; questions: ClarificationQuestion[] }
>   | { status: "failed"; failure: { reason: RunFailureReason } };
> ```
>
> Every member is buildable today: `ClarificationQuestion` at
> `src/features/proposal-preparation/schemas/clarification.ts:15`; `RunFailureReason` at
> `src/lib/agent/types.ts:9`. Phase 11 adds one row: `expectTypeOf<DomainResult>().toExtend<RenderableResult>()`.

Rejected alternatives, recorded so they are not re-proposed: (a) *move `schemas/turn-result.ts`
into phase 10* — the `created`/`recovered` arms need `draftReference` and phase-14 semantics that
phase 10 has no business deciding; (b) *move `renderAssistantTurn` into phase 11* — it splits
`domain/conversation.ts` across two phases and violates the charter's "a phase closes green on its
own" corollary less cleanly than (a). Whichever branch the coordinator folds, **task 2's signature
and master §6.6's `renderAssistantTurn` row change together.**

**Blocks:** task 2; rows C3(a), C3(b), C3(c), C3(d), C3(e).

### I2 — task 3's "else the block's recorded values" branch is unrepresentable

Task 3: *"every block's `contentId.value` (with the block's `productId`, `title.value`, and
`matchStrength: "strong", score: SCORE_MAX` when the block was human-added, else the block's
recorded values — see note)"*.

`blockSchema` (`src/features/proposal-preparation/schemas/proposition.ts:49`–`:59`) has exactly
nine keys: `contentId`, `productId`, `title`, `description`, `quantity`, `optional`,
`reviewerComment`, `pricing`, `alternatives`. **There is no `matchStrength` and no `score` on a
block.** Only `alternativeSchema` (`:40`–`:47`) carries them. So a `proposales_content`-sourced
block has no "recorded values" to fall back to, and the branch cannot be written for *any* block,
human-added or not.

The plan's third Note covers only half of this — it explains the human-added case and says nothing
about the other. The prompt asked whether the note exists and whether the distinction is
representable from a `Proposition` alone: **the note exists, the human/non-human distinction is
representable** (`block.contentId.source === "human"`, and `contentId`'s source union is
`["proposales_content", "human"]`, master §6.4 / `proposition.ts:50`), **but neither branch has a
strength to record.** → **owner card 1.**

**Blocks:** task 3; row C5(a) (which is also silent about strength on block entries — see F/M below).

---

## 3. Decision ledger

Tags: **P** precision · **M** missing row · **I** impossible as written · **F** factual error.
D-numbers are for later citation.

| # | D | Tag | Row / site | Finding | Proposed replacement |
|---|---|---|---|---|---|
| 1 | D10-01 | **I** | task 2, C3(a)–(e) | `DomainResult` does not exist and is unspecified (§2, I1) | Adopt `RenderableResult` per §2; amend task 2 and master §6.6 together |
| 2 | D10-02 | **I** | task 3, C5(a) | Blocks carry no `matchStrength`/`score` (§2, I2) | Per **owner card 1** |
| 3 | D10-03 | **I/M** | task 1 | `MAX_CONVERSATION_TURNS` and `MAX_TURN_TEXT_CHARS` do not exist anywhere (`grep -rn` over `src/ test/` → 0 hits). Master §6.5 assigns both to `schemas/conversation.ts`, but task 1 never says to create them and **no row asserts either contract** — the §9.1 planner lint "every task produces at least one row", and §6.5's own "criteria assert the contract, never the literal" | Task 1 gains: *"exports `MAX_CONVERSATION_TURNS = 12` and `MAX_TURN_TEXT_CHARS = 3000`"*; add row **C1(g)** below |
| 4 | D10-04 | **F** | C1(b) | Printed, `zod@4.5.4`: the context-level unknown key is `{ code: "unrecognized_keys", path: [], keys: ["foo"] }` — **not** `["foo"]`; the turn-level one is `path: ["turns", 0], keys: ["foo"]` — **not** `["turns","0","foo"]`, and the index is the **number** `0` | See the amended cell in §5 |
| 5 | D10-05 | **F** | C1(f), third case | Printed: a **human** turn carrying `propositionVersion` fails as `{ code: "unrecognized_keys", path: ["turns", 0], keys: ["propositionVersion"] }`. The human variant is strict and has no such key, so the refinement never runs. The plan's `["turns","0","propositionVersion"]` is wrong — the identical shape that blocked phase-9 fix round 2 (§9.1 rule 18's extension) | See §5 |
| 6 | D10-06 | **F** | C6(b) | Printed: `conversationContextSchema.safeParse({ ...emptyConversation(), state: … })` fails at `{ path: [], keys: ["state"] }` — **not** `["state"]` | See §5 |
| 7 | D10-07 | **F** | C1(b), C1(d), C1(f) | Zod emits **numeric** array indices; every cell writes `"0"`. The repository has both conventions — `content-candidate.test.ts:35` compares raw `issue.path`, `proposition.test.ts:19` normalizes with `.map(String)`. Phase 9's review found that `.map(String)` deletable where no path had a numeric segment; here it is load-bearing | Every C1 cell states the raw Zod value **and** that the test compares `issue.path` directly (no `.map(String)`), so the numeric segment is asserted |
| 8 | D10-08 | **P** | C1(d) | Printed: `.trim()` runs **before** `.max()` — `"  " + "x".repeat(3000) + "  "` **parses**. A padded over-cap fixture would pass | Cell states: fixture is `"x".repeat(MAX_TURN_TEXT_CHARS + 1)`, no surrounding whitespace |
| 9 | D10-09 | **P** | C1(e) | "fails at the respective path" is a paraphrase | Printed: `["turns", 0, "turnId"]` (`invalid_format`) and `["turns", 0, "at"]` (`invalid_format`) |
| 10 | D10-10 | **M** | new **C1(g)** | The two constants' contracts are unasserted (D10-03) | *`MAX_CONVERSATION_TURNS` is an integer, even, ≥ 4; `MAX_TURN_TEXT_CHARS` is an integer ≥ `MAX_INSTRUCTION_CHARS` imported from `schemas/shared.ts` — never a second literal.* No mutation (contract row; phase-7 C8(h–i) precedent) |
| 11 | D10-11 | **P** | C2(b) | "the first two original turns absent … newest last" does not distinguish dropping the oldest two from dropping **any** two that include the first two | Assert the **exact resulting `turnId` sequence** with `toEqual`: `[t2…t11, n1, n2]` from `fullConversation()`'s deterministic ids (charter rule 2, enumerate) |
| 12 | D10-12 | **M** | new **C2(e)** | `omittedTurns` is proved equal to 2 after 2 drops and 0 otherwise — an implementation that **assigns** `omittedTurns = dropped` instead of accumulating passes both C2(a) and C2(b) | *`appendTurns(appendTurns(fullConversation(), 2 turns), 3 turns)` → `omittedTurns === 5`; `turns.length === MAX_CONVERSATION_TURNS`.* **MUT-10-6** `conversation.ts` · `appendTurns` definition · replace `context.omittedTurns + dropped` with `dropped` → C2(e) red, C2(b) stays green |
| 13 | D10-13 | **P** | C2(c) | *"`Object.isFrozen`-style check on the input via a deep-equal snapshot"* is not an instrument — `Object.isFrozen` and a deep-equal snapshot are different checks and the cell asks for a hybrid of both | *Take `structuredClone(input)` before the call; assert `input` deep-equals the clone after; assert the returned object is not the same reference as `input` and `result.turns !== input.turns`* |
| 14 | D10-14 | **P/M** | C3(a) | `.toContain()` against renderer-produced prose asserts the renderer's own template (§9.1 rule 2's companion, clarified at phase 9). The row asserts four ids and two literals: **a renderer that emits no titles, no block indices and no `matchStrength` passes it**, and task 2's entire title/strength half is unguarded. `A`/`B`/`C`/`D` are labels, not ids — the row is undecidable until the fixture names concrete catalog ids | Replace with **exact whole-string equality** against the fixture defined in §4, plus **MUT-10-7** `conversation.ts` · `renderAssistantTurn` definition · delete the alternatives loop → C3(a) red |
| 15 | D10-15 | **P** | C3(b) | "both `questionId`s and `itemKey`s present, in order" — no header, no line format, no `toBe`. Also collides with **owner card 2** | Exact whole-string equality; text of the questions per card 2 |
| 16 | D10-16 | **P** | C3(c) | "`"Preparation failed: budget_exhausted"`" does not say whether that is the whole string or a substring | `toBe("Preparation failed: budget_exhausted")` — the whole rendered string |
| 17 | D10-17 | **P** | C3(d) | §9.1 rule 6: a fixture that exercises a bound must **assert the relation** before asserting the bound. The row asserts `length ≤ cap` and the marker but never that the uncut render exceeds the cap | Add: *the same render with the cut removed is `> MAX_TURN_TEXT_CHARS` — asserted by rendering a proposition whose block count and title lengths are read from the fixture and shown to exceed it*; and state that the `" […]"` marker is **inside** the budget (total length ≤ cap) |
| 18 | D10-18 | **P/M** | C3(e) | The parenthetical *"rule 15 proof: the sentinel is present in the input"* proves the **input** carries the sentinel; it does not prove the renderer could ever emit it. A renderer emitting the empty string passes C3(e) — and passes C3(b), C3(c) and (after the cut is skipped) much of C3(d) | Add the positive companion in the same row and the same fixture: the rendered text **does** contain the block ids and the exact `Warnings: ` line, **and** does not contain `LEAK`. Name the exact warning line. **MUT-10-8** `conversation.ts` · `renderAssistantTurn` definition · render `warnings[j].text` after the kinds → C3(e) red |
| 19 | D10-19 | **P/I** | C4(a), task 4 | Task 4 writes *"`catalog_languages` (and `proposal_language` when resolved)"* — ambiguous between a **second block** and a field inside the first. C4(a) says "six `user` messages", and master §6.6 lists six block names without `proposal_language`, so it must be **inside** `catalog_languages`; the task text does not say so | Task 4: *"one `catalog_languages` block whose body carries the catalog languages and, when resolved, the proposal language"*; C4(a) pins the six labels with `toEqual` in order |
| 20 | D10-20 | **P** | C4(b) | Four paraphrases: the exact separator string (`--- turn <n> · <role> · <turnId> ---` uses U+00B7); whether `<n>` is 1-based within the window or absolute across omitted turns; the exact omitted-count line; and its plural form at 1 | Propose, as delegation-with-a-default for the coordinator to fold: `<n>` is **1-based within the rendered window**; the omitted line is the block's **first** line, exactly `earlier turns omitted: <k>`, present only when `k > 0` (machine-shaped, so no singular/plural case exists). Row asserts the three headers and the omitted line by `toEqual` on the split lines |
| 21 | D10-21 | **F/P** | C4(d) | **Cannot fail on the absence side.** "every sentinel appears **only** inside a `labeledBlock`" is satisfied vacuously by a sentinel that appears **nowhere** — so an assembler that drops the human turn's text entirely passes C4(d) *and* passes C4(b), which asserts headers only. Separately, "`preparationSystemPromptV1(…)` … until then a stub returning a constant" makes the second half a test asserting that a constant the test itself wrote contains no sentinel — §9.1 rule 15's snapshot-writes-its-own-baseline shape | Amend to: *each sentinel occurs **exactly once** across the whole message list, and each occurrence lies between `<<<` and `>>>`.* **Delete the system-prompt half** — `buildPreparationMessages` provably never receives a system prompt (task 4), so no instrument in this phase can observe it; route the claim to phase 11, where a real `preparationSystemPromptV1` exists. MUT-10-5 is unchanged |
| 22 | D10-22 | **P** | C4(e) | §9.1 rule 17: a guard's proof must name the **shared** symbol, not build its own copy. §9.1 rule 16: a source-text guard enumerates the **forms** (static import, `import type`, dynamic `import()`, global access). The row says only "imports nothing from `"ai"` or `@ai-sdk/*`" and names no instrument | Row calls the existing shared symbols in `test/helpers/agent-boundary-scan.ts` — `FORBIDDEN_FORMS` (`:21`–`:32`, whose `"vendor AI import"` and `"dynamic import"` entries already cover the forms) and `hasForbiddenForm` (`:34`) — applied to `build-messages.ts` read from disk. **Do not extend `getAgentScanFiles()`** (`:12`): that would widen phase 9's shipped perimeter to a directory phase 11 also writes into |
| 23 | D10-23 | **M** | new **C4(f)** | **§9.1 rule 19 has no row.** Nothing asserts that any input's *content* reaches the model. `catalogLanguages`, `language`, `currentProposition` and the conversation's turn **texts** are all unasserted: C4(a) asserts labels, C4(b) asserts headers, C4(c) asserts the instruction, C4(d) asserts the brief sentinel and (see D10-21) tolerates absence. An assembler emitting `labeledBlock("catalog_languages", "")`, `labeledBlock("current_proposition", "")` and a history block of bare headers passes every row in the table | *`buildPreparationMessages(input)` **deep-equals** an exact six-element `AgentMessage[]` literal written in the test, for an input with all seven fields given.* **MUT-10-9** `build-messages.ts` · `buildPreparationMessages` definition · emit `labeledBlock("catalog_languages", "")` instead of the interpolated body → C4(f) red |
| 24 | D10-24 | **P/M** | C5(a) | Three gaps. (i) `A`–`D` are labels; the row is undecidable until the fixture names catalog ids. (ii) Only **`B`'s** entry is checked — the two block entries' `matchStrength`/`score` are unasserted, which is exactly where I2 lives, so the impossible branch would ship unobserved. (iii) **No named mutation**, although intention §17A.17 names one: *"seed the retrieval record empty → the 'use the second one' row reddens"* | Assert the **exact `RetrievedCandidate` for all four ids** with `toEqual`, using the §4 fixture, once card 1 fixes the strength question. **MUT-10-10** `retrieval-record.ts` · `seedRetrievalRecord` definition · return `emptyRetrievalRecord()` → C5(a) red |
| 25 | D10-25 | **M** | new **C5(d)** | The human-added-block rule (plan Note 3, card 1) is stated in prose and asserted by nothing | *A proposition whose block carries `contentId.source === "human"` seeds the entry card 1 selects; a `proposales_content` block seeds the other.* **MUT-10-11** `retrieval-record.ts` · `seedRetrievalRecord` definition · drop the `source === "human"` branch → C5(d) red. **Held on owner card 1** |
| 26 | D10-26 | **P** | C5(b) | "`E` present; `B` now carries `B'`'s score" — a substring-grade claim over a Map | `toEqual` on the whole `RetrievedCandidate` for `E` and for `B`; `candidates.size` asserted; the input record's `candidates` deep-equals a pre-call `structuredClone` and is a different Map instance |
| 27 | D10-27 | **M** | C6(a) | Row is **correct as written** — `parseProposalWorkflowState` flattens `unrecognized_keys` into `[...issue.path.map(String), key]` (`schemas/workflow-state.ts:53`–`:58`), so the issue path really is `["conversation"]`. But it has **no named mutation**, and the prompt asks what could make it fail | **MUT-10-12** `workflow-state.ts` · `proposalWorkflowStateSchemaFor` definition · replace `z.strictObject` with `z.object` → C6(a) red. Applied and reverted outside the phase perimeter; declared in the handoff's probe list |
| 28 | D10-28 | **F/M** | C6(b) | Path wrong (D10-06) and no mutation | Path `[]` with `keys: ["state"]`. **MUT-10-13** `conversation.ts` · `conversationContextSchema` definition · drop `.strict()` → C6(b) red |
| 29 | D10-29 | **P** | task 2 | `"Block <i>: <title> (content <variationId>)"` — a block has no `variationId`; it has `contentId`. Two different key names for one value invite the implementer to reach for `contentId.ref?.variationId`, which is **optional** on a human-added block (`schemas/shared.ts:53`–`:59`) and would be `undefined` there | Task 2 and C3(a) say `contentId.value` |
| 30 | D10-30 | **P** | task 2 | Five undetermined rendering decisions: 1- or 0-based `<i>`/`<j>`; the join between sorted warning kinds and between sorted item keys; the line separator; whether the rationale line is bare or prefixed; what is rendered when `status === "proposition"` but the optional `proposition` argument is **absent** | Proposed defaults in §4, to be folded into task 2 as exact text. The last one is the sharpest: make `proposition` **required** for the `proposition` status, or state the fallback |
| 31 | D10-31 | **P** | task 5 | `conversationWith(n)` "alternating turns" does not say which `kind` its assistant turns carry — and an assistant turn with `kind: "proposition"` needs `propositionVersion` or the context will not parse | Task 5: assistant turns carry `kind: "clarification"` and no `propositionVersion`; ids are `00000000-0000-4000-8000-<12-digit index>`, timestamps `2026-01-01T00:00:<ss>.000Z` |
| 32 | D10-32 | **P** | plan "Read first" §3 | The contract list names 08, 10, 06, 09, 12 and **misses three that apply**: `02-runtime-boundaries.md` (`schemas/conversation.ts` must stay runtime-neutral while `server/domain/*` and `server/agent/*` are `server-only`), `03-feature-architecture.md` (this phase creates the feature's first `server/agent/` directory — sanctioned at `03` line 37 — and `03` line 104 forbids `schemas/**` importing anything `server-only`), `11-testing-principles.md`. Verified applicable via `architectural_contracts/01-implementation-contract-guide.md` §10's routing table | Add `02` §—, `03` (structure + import matrix), `11` to the Read-first list |
| 33 | D10-33 | **F** | prompt gate 2 | Tracker row 10 is `PROJECTING`, not `NOT_STARTED` (master-plan.md:137); `PROJECTING` is not a charter state-machine member | Coordinator's call: either add `PROJECTING` to the master's own state vocabulary with a one-line note, or use `NOT_STARTED` until the projection is folded and then `PROJECTED` |

---

## 4. Concrete fixtures and the exact strings the amended rows need

Non-authoritative except where a row above cites it; supplied because rows D10-14, D10-15,
D10-17, D10-18, D10-24 are undecidable without it. All ids and titles are copied from
`src/features/proposal-preparation/fixtures/catalog.ts` (verified 2026-09-07).

**`propositionWithAlternatives()`** — `version: 3`; two blocks:

| Label | `contentId.value` | `productId` | `title.value` | catalog line |
|---|---|---|---|---|
| A (block 1) | `"1"` | `"500101"` | `Consulting Training Service Bundle` | `catalog.ts:15`–`:18` |
| B (alt 1 of block 1) | `"2"` | `"500102"` | `Consulting Workshop Service Track` | `catalog.ts:25`–`:28` |
| C (alt 2 of block 1) | `"3"` | `"500103"` | `Training Service Overview` | `catalog.ts:35`–`:38` |
| D (block 2) | `"5"` | `"500105"` | `Service Analytics Dashboard` | `catalog.ts:54`–`:57` |

B: `matchStrength: "possible"`, `score: 400`. C: `matchStrength: "weak"`, `score: 200`. Block 2 has
`alternatives: []`. `warnings` kinds `weak_match` and `non_strong_selection`; `unresolvedItems`
`quantities` and `deadline_and_terms_notes`; `agentRationale` known, value
`Reused the closest catalog match.`

**Proposed exact expected render** (1-based indices, `", "` join, `"\n"` separator, bare rationale
line last):

```
Proposed version 3.
Block 1: Consulting Training Service Bundle (content 1)
  alternative 1: Consulting Workshop Service Track (content 2, possible)
  alternative 2: Training Service Overview (content 3, weak)
Block 2: Service Analytics Dashboard (content 5)
Warnings: non_strong_selection, weak_match
Unresolved: deadline_and_terms_notes, quantities
Reused the closest catalog match.
```

Note the two sorted lists are sorted by the default string comparator, which is why
`non_strong_selection` precedes `weak_match` and `deadline_and_terms_notes` precedes `quantities` —
worth stating in the cell, because "sorted" is otherwise an adjective (charter rule 5).

**C3(e)'s fixture** is this proposition with `warnings[0].text.value` and `assumptions[0].note.value`
each set to `See https://evil.test/LEAK for details.` The amended row asserts, on the **same**
rendered string: `LEAK` absent, `https://` absent, **and** the line
`Warnings: non_strong_selection, weak_match` present, **and** `content 1` present — so the
instrument is shown able to observe a presence before it is trusted about an absence.

---

## 5. Rows that cannot fail — and the value that would still satisfy each

The prompt's central question, answered per row.

| Row | An implementation that still passes it |
|---|---|
| **C3(a)** | `` `Proposed version ${p.version}.\ncontent 1 content 2 content 3 content 5\nalternative 1 alternative 2` `` — no titles, no strengths, no block structure |
| **C3(b)** | The four ids concatenated with no header and no line structure |
| **C3(e)** | `return ""` — an absence row satisfied by absence (§9.1 rule 15) |
| **C4(a)** | Six blocks with **empty bodies**: `labeledBlock("brief", "")`, `labeledBlock("catalog_languages", "")`, … |
| **C4(b)** | A history block of three bare `--- turn n · role · id ---` headers with **every turn's text dropped** |
| **C4(d)** | The same — a dropped `TURN-SENTINEL` appears nowhere, and "appears only inside a labeled block" is vacuously true. The system half is satisfied by the test's own stub constant |
| **C5(a)** | A seed that records `matchStrength`/`score` for alternatives only and writes garbage (or nothing) for the two block entries — I2 ships unobserved |
| **C5(c)**, **C2(d)** | Fine as written (trivially true, but they are the shape rows) |
| **C6(a)**, **C6(b)** | Real assertions, but **no instrument was named** — nothing in the phase demonstrates either could redden. MUT-10-12 and MUT-10-13 supply it |

The whole family collapses under one addition: **C4(f)**, the rule-19 whole-request deep-equal
(D10-23), plus exact-string equality on C3 (D10-14, D10-15, D10-18).

---

## 6. Buildability — every symbol the plan names, verified by reading

| Symbol | Exists today? | Where it actually lives |
|---|---|---|
| `DomainResult` | **NO** | Phase 11 creates `schemas/turn-result.ts`; the type is **also unspecified** anywhere (I1) |
| `Proposition` | yes | `src/features/proposal-preparation/schemas/proposition.ts:150` |
| `MAX_CONVERSATION_TURNS` | **NO** | Master §6.5 assigns it to `schemas/conversation.ts` — this phase's own file; task 1 omits it (D10-03) |
| `MAX_TURN_TEXT_CHARS` | **NO** | Same (D10-03) |
| `MAX_INSTRUCTION_CHARS` | yes | `schemas/shared.ts:18` (the constant `MAX_TURN_TEXT_CHARS` must be ≥) |
| `SCORE_MAX` | yes | `src/features/proposal-preparation/server/domain/strength.ts:5` |
| `MAX_BLOCKS` | yes | `schemas/proposition.ts:27` |
| `MAX_ALTERNATIVES_PER_BLOCK` | yes | `schemas/proposition.ts:28` |
| `AgentMessage` | yes | `src/lib/ai/types.ts:23`–`:32`; re-exported from `src/lib/agent/types.ts:57` |
| `RunFailureReason` | yes | `src/lib/agent/types.ts:9` |
| `ClarificationQuestion` | yes | `schemas/clarification.ts:15` |
| `parseProposalWorkflowState` | yes | `schemas/workflow-state.ts:66` |
| `validState()` | yes | `fixtures/states.ts:39` — note: in `states.ts`, **not** `propositions.ts`, and `states.ts` is not in the phase's file perimeter (it needs no change) |
| `FIXTURE_CATALOG` | yes | `fixtures/catalog.ts:13`, ids `"1"`–`"14"` — **not** `A`–`D` (D10-14, D10-24) |
| `validProposition` | yes | `fixtures/propositions.ts:101` — uses ids `188485`/`188486`, a *different* id convention from `FIXTURE_CATALOG`; task 5's new factories must not be mistaken for extensions of it |
| `hasForbiddenForm` / `FORBIDDEN_FORMS` | yes | `test/helpers/agent-boundary-scan.ts:34` / `:21` (D10-22) |
| `server/agent/` directory | new, and sanctioned | `architectural_contracts/03-feature-architecture.md` line 37 |

Corroborating facts established by reading:

- `blockSchema` has nine keys and neither `matchStrength` nor `score` (`proposition.ts:49`–`:59`) — I2.
- `contentId.ref.variationId` is **required** only on the `proposales_content` member; on the
  `human` member `ref` itself is optional (`schemas/shared.ts:53`–`:59`). `validProposition` sets
  `contentId.value === ref.variationId` (`fixtures/propositions.ts:60`), so the record's key space
  and phase 11's `ref.variationId` lookup agree by convention — **nothing enforces it**. Recorded
  for phase 11/12; not a phase-10 row.
- `sourcedOrAbsent()` returns `z.ZodTypeAny` (`shared.ts:106`), so `Proposition["agentRationale"]`
  and `Block["description"]` infer as `any`. The renderer reads `agentRationale` through an
  untyped value; nothing in this phase catches a misspelt key. Worth one line in task 2.
- `parseProposalWorkflowState` flattens `unrecognized_keys` into `[...path.map(String), key]`
  (`workflow-state.ts:53`–`:58`) — which is why C6(a) is right and C6(b) is wrong.
- `maximalConformingState()` (`fixtures/states.ts:48`) maximizes texts but keeps **one** block and
  **one** alternative, confirming the phase-6 N2 carry-forward: `maximalConformingProposition()`
  must fill `MAX_BLOCKS` × `MAX_ALTERNATIVES_PER_BLOCK` as well.

---

## 7. Library facts, run rather than assumed

Installed: **`zod@4.5.4`** (`node -e "require('zod/package.json').version"`). Probe script:
one-off `node` module outside the repository, using `createRequire` against the repository's
`package.json`; it built `conversationTurnSchema` and `conversationContextSchema` exactly as task 1
specifies and printed `safeParse` output. **No test was run, nothing was installed, the tree was
not touched.** Verbatim output:

| Case | Printed result |
|---|---|
| `.superRefine()` preserves `.shape` | `true` — `['role','turnId','at','kind','text','propositionVersion']`; constructor `ZodObject`, `_zod.def.type` `object`. So a refined member is a legal `z.discriminatedUnion` option, and the repository already relies on this at `schemas/shared.ts:63` |
| unknown key on the context | `{ code: "unrecognized_keys", path: [], keys: ["foo"] }` |
| unknown key on a turn | `{ code: "unrecognized_keys", path: ["turns", 0], keys: ["foo"] }` |
| `MAX + 1` turns | `{ code: "too_big", path: ["turns"], message: "Too big: expected array to have <=12 items" }` |
| exactly `MAX` turns | `success: true` |
| text `MAX + 1` chars | `{ code: "too_big", path: ["turns", 0, "text"] }` |
| `"  x  "` | parses to `"x"` |
| `"  " + 3000×"x" + "  "` | **parses** — `.trim()` runs before `.max()` |
| uppercase `turnId` | `{ code: "invalid_format", path: ["turns", 0, "turnId"] }` |
| `at` without milliseconds | `{ code: "invalid_format", path: ["turns", 0, "at"] }` |
| assistant `kind:"proposition"` without `propositionVersion` | `{ code: "custom", path: ["turns", 0, "propositionVersion"] }` |
| assistant `kind:"clarification"` with `propositionVersion` | `{ code: "custom", path: ["turns", 0, "propositionVersion"] }` |
| **human turn with `propositionVersion`** | `{ code: "unrecognized_keys", path: ["turns", 0], keys: ["propositionVersion"] }` — **not** what C1(f) says |
| conversation schema given a `state` key | `{ code: "unrecognized_keys", path: [], keys: ["state"] }` — **not** what C6(b) says |
| `z.toJSONSchema(conversationTurnSchema, { io: "input" })` | Succeeds; emits a plain `oneOf` of the two object shapes with `pattern`/`maxLength` preserved and **no conditional** — the refinement is silently dropped, as phase 9 found |

**Does anything in phase 10 depend on that schema surviving a JSON Schema round trip?** No. The
only consumer of `z.toJSONSchema` in this repository is `defineTool`'s
`descriptor().inputJsonSchema` (master §6.4), and no tool takes a conversation as input;
`buildPreparationMessages` emits strings, not schemas. The dropped refinement is therefore inert
here — but the fact is worth carrying to phase 11 if any turn shape ever becomes tool input.

---

## 8. Trace verification

Both directions, per the charter's trace chain.

- Master §7.2 says **M19** is served by `10.C3`, `10.C5`, `12.C7`, `15.C1`. Both phase-10
  criteria carry M19 in their trace cells (C3(a), C5(a)). ✅ served in both directions.
- C1, C2, C4, C6 trace to §17A.17, §17A.3, §17A.16, §17A.8, contracts `06` §3, `08` §7/§9,
  `10` §6, master §6.9. Every cited section resolves and says what the row claims: `08` §7's
  last bullet is verbatim *"user-provided text is delimited and labeled as untrusted content"*;
  `08` §9's second bullet is the turns/serializable-state rule; `10` §6's first bullet is
  *"Tool results and user content are placed in the prompt as labeled data, never concatenated
  into instructions"*; `06` §3 carries the `.strict()` rule; `06` §7 the "our representation,
  never the provider's message shape" rule. ✅
- **No orphan trace and no unserved entry found.** The new rows inherit: C1(g) → §17A.16 +
  master §6.5; C2(e) → §17A.17 item 3; C4(f) → §17A.17 item 5 + §9.1 rule 19; C5(d) → §17A.8 +
  M19.
- Intention §17A.17 names three mutations. Two are in the plan (`append the instruction into the
  history block` = MUT-10-4; `skip the window trim` = MUT-10-2). **The third — "seed the retrieval
  record empty"** — is not; it becomes MUT-10-10 (D10-24).

---

## 9. Proposed table after these amendments — counted from this ledger

Rows added: **C1(g)** (D10-10), **C2(e)** (D10-12), **C4(f)** (D10-23), **C5(d)** (D10-25) — four.
Rows amended in place: C1(b), C1(d), C1(e), C1(f), C2(b), C2(c), C3(a), C3(b), C3(c), C3(d),
C3(e), C4(a), C4(b), C4(d), C4(e), C5(a), C5(b), C6(b) — **eighteen**. Rows unchanged in wording:
C1(a), C1(c), C2(a), C2(d), C4(c), C5(c), C6(a) — **seven** (C6(a) keeps its text and gains
MUT-10-12). `18 + 7 = 25`, the entry row count, so no row was lost or double-counted.

**Criteria: 6** (C1–C6, unchanged).

**Rows: 29.** Summands, per criterion, after the additions:
`C1 = 6 + 1 = 7` · `C2 = 4 + 1 = 5` · `C3 = 5` · `C4 = 5 + 1 = 6` · `C5 = 3 + 1 = 4` · `C6 = 2`.
`7 + 5 + 5 + 6 + 4 + 2 = 29`.

**Named mutations: 13.** Summands: existing **5** (MUT-10-1 C1(f) · MUT-10-2 C2(b) · MUT-10-3
C3(d) · MUT-10-4 C4(c) · MUT-10-5 C4(d)) **+ 8 new** (MUT-10-6 C2(e) · MUT-10-7 C3(a) · MUT-10-8
C3(e) · MUT-10-9 C4(f) · MUT-10-10 C5(a) · MUT-10-11 C5(d) · MUT-10-12 C6(a) · MUT-10-13 C6(b)) =
`5 + 8 = 13`.

Entry table was **6 / 25 / 5** (re-derived by command on the plan file, not quoted:
`grep -c "^| C[0-9]"` → 25; `grep -o "^| C[0-9]" | sort -u | wc -l` → 6;
`grep -o "MUT-10-[0-9]*" | sort -u | wc -l` → 5). Proposed table: **6 / 29 / 13**.

Mutation density rises from 5/25 = 0.20 to 13/29 = 0.45 — between phase 7's 21/57 = 0.37 and phase
9's 39/38 = 1.03. The prompt flagged 0.20 as a signal to test rather than a verdict; tested, it was
a symptom: **C5 and C6 carried no mutation at all**, and four of the five that existed sat on the
rows that were already the strongest.

Criteria count stays at 6, inside the charter's ≤ 8 target, so no split is proposed.

---

## 10. Write perimeter of this session

**Documents written: 1** — this handoff (`handoffs/reviewer/phase-10-projection-round-0.handoff.reviewer.md`).
**Code written: 0. Tests run: 0. Mutations applied: 0. Plan, master plan and tracker: untouched.**
One scratch file outside the repository
(`…/scratchpad/probe1.mjs`) holding the zod probe; the repository tree is byte-identical to
`f2d435c` apart from this handoff. No `npm install`, no network call, no provider call, no
`npm run build`, no `.env` read. No archgraph delta (`.archgraph/` is absent from this repository).

## 11. Exit condition

`AMENDMENTS_REQUIRED`. Two owner cards must be answered (card 1 blocks task 3 / C5(a) / C5(d);
card 2 blocks C3(b)); finding **I1** must be routed by the coordinator before task 2 and C3(a)–(e)
are implementable. The implementer prompt does not compile until every ledger row above is routed
— amendment folded, upstream change made, or delegation recorded — per the plan-projection exit
gate.
