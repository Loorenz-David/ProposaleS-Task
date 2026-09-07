---
plan: none — pre-planning gate (mechanism inventory precedes the master plan)
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
state: COMPLETE
verdict: EXIT GATE PASSED, CONDITIONAL — every silent-failure mechanism is contract-grade; four owner cards open, two of which gate one phase each
actor: Claude Opus 5 (1M context), coordinator session
---

# Mechanism inventory round 1 — frontend_core

The ratified frontend intention has been deepened with **§12A `Frontend mechanism contracts`** (20 subsections plus a binding note) and **ledger entries F8–F27**. F1–F7 are unchanged and no section was renumbered. No design specification, no backend artifact, no code, and no tool-recorded state was touched. All thirteen seeded depth targets are covered, plus seven further presentation mechanisms the intention requires. Four contradictions and gaps were resolved unilaterally with product consequence and are relayed as owner cards; six lower-consequence ambiguities were resolved and recorded technically (§6 below).

---

## ⚠ OWNER DECISIONS REQUIRED (4)

### Card 1 — Unsent notes and the close guard

**Question.** Should notes typed into the composer but never sent count as work worth confirming before a session is closed?

**Story.** You paste four paragraphs of meeting notes into a fresh session and get pulled away before pressing send. When you come back you tidy the tab strip and close what looks like an untouched tab. As the contract stands that tab is empty — no turn ever ran — so it closes instantly and the notes are gone. There is no undo, no archive, and nothing survives a closed tab.

**Branches.**
- *Count it:* that tab asks before closing. Any tab with a stray character in the composer also asks.
- *Do not count it:* tabs that never ran a turn close instantly; an unsent paste is lost silently.

**Recommendation.** Count it — the paste is the most expensive thing in the workspace to reproduce, and a wrong ask costs one keystroke.

**On silence.** The gate holds. The contract as written excludes it, and the phase implementing the close guard is not planned.

**Trace.** §12A.6, F13, §8.1, owner decision 2.

### Card 2 — Closing a session while a draft is being created

**Question.** While a draft is being created in Proposales, should closing that session be refused rather than confirmed?

**Story.** You approve a proposal and, while it is being created, switch to another session and start tidying. You close the creating tab. Proposales still creates the draft — that call cannot be cancelled — but the link to open it existed only in that tab, and nothing here survives a closed tab. The draft exists in Proposales and you have no way to reach it from this product.

**Branches.**
- *Refuse until it resolves:* the tab cannot be closed for those seconds; nothing is ever orphaned.
- *Confirm with a warning:* you can still close it, having been told; a draft can be left stranded.

**Recommendation.** Refuse until it resolves — it is the only action in V1 that can leave something real behind that this product cannot get back.

**On silence.** The gate holds. The contract confirms with a warning, and the creation-lifecycle phase is not planned.

**Trace.** §12A.6, §12A.15, F13, F22, §5.8.

### Card 3 — Formatting in the title and narrative

**Question.** Should the proposal's title and narrative be shown with their formatting applied, or exactly as written?

**Story.** The agent writes a narrative with a bold phrase and a bulleted list, because that is what Proposales renders when the client eventually sees it. In the review pane and the client preview you would read the asterisks and dashes literally instead of the bold text and the bullets. The preview exists to answer "does this read like something I would send", and it would answer it in a form the client will never see.

**Branches.**
- *Exactly as written:* nothing in the product interprets text; the preview is a little less faithful.
- *Formatted:* the preview reads closer to the real document; the product takes on a text-rendering component and the safety decision behind it.

**Recommendation.** As written for V1 — the fidelity gain is small, and the preview already declares itself an approximation.

**On silence.** The gate holds on the question; the contract renders text as written, and the review and preview work can proceed on that basis.

**Trace.** §12A.20, F27, §4, §5.7.

### Card 4 — What the review pane marks on a field

**Question.** Confirm that the review pane marks who stands behind a value and drops "changed since the draft was made".

**Story.** In the design a field can say "Updated" once it changes. In the product the workspace is told where a value came from — you, the agent, the brief, or the content library — but nothing tells it what changed between two versions, and working that out in the browser is the kind of guessing this product exists to avoid. So a field you corrected reads as yours, a field the agent revised reads as the agent's, and neither says "updated".

**Branches.**
- *Confirm:* the pane shows origin, not change; the exact wording stays a design job.
- *Ask for change marks:* the server would have to report them first, which is a backend decision.

**Recommendation.** Confirm — origin is the fact that matters when you decide whether to approve.

**On silence.** The gate holds on the confirmation; the contract stands as written.

**Trace.** §12A.10, F17, §5.6, §14.1 item 3, design 07.

---

## 1. Gate check

| # | Check | Result |
|---|---|---|
| 1 | Intention status reads `RATIFIED` | **PASS** (status table) |
| 2 | Ratification is a recorded human act | **PASS** — §16 round 2 names David, 2026-09-05, the §15.1 surface, and the four §15 decisions |
| 3 | No open owner decision | **PASS** — §15 heading reads `Ratified owner decisions (0 open)` |
| 4 | Inventory remains outstanding | **PASS on substance, literal clause stale** — see below |

**Row 4, stated precisely.** The row's literal test has two clauses: no §16 round 3 entry, and no lettered mechanism-contract section. The second held (no `§12A` or equivalent, no ledger entry above F7). The first did not: a round 3 exists, dated 2026-09-06, and it is the **owner's dependency-foundation amendment** (decisions 5 and 6, Lucide and Radix, new §4.1), not a mechanism inventory. The prompt's own stop condition for row 4 — "if row 4 fails *because the inventory has already been completed*" — did not apply, and the doctrine's own gate check (status header only) passed. The session proceeded and wrote its delta as **round 4**. The round-3 clause in any re-issued prompt should be corrected to "no round entry recording a mechanism inventory".

**Backend `APPROVED` phases, recorded as context only** (backend master plan §4; they gate nothing here): phase 1 (repository topology and environment), phase 2 (errors, logger, shared value shapes), phase 3 (Proposales adapter: transport, error translation, content read). Phases 4–15 are `NOT_STARTED`. The frontend's fixture era therefore covers every surface: no proposition, workflow-state, clarification, conversation, edit, approval, or execution contract has merged.

---

## 2. The inventory

Ranked by silent-failure risk — "if this is subtly wrong, does anything crash, or does the workspace quietly behave wrong forever?" Every row is contract-grade in §12A.

### 2.1 Highest risk — wrong forever, and invisible

| # | Mechanism | Silent-failure mode if undefined | Contract | Ledger |
|---|---|---|---|---|
| 1 | Turn origin attribution | a result lands in whichever session happens to be active; two sessions' work interleaves and neither user-visible signal says so | §12A.2 | F9 |
| 2 | Money rendering, minor-unit exponent | a zero-exponent currency renders a hundred-fold error that no type, schema, or review catches | §12A.12 | F19 |
| 3 | Meaningful-work guard | a false "empty" closes a session and destroys work that has no undo, archive, or reload recovery | §12A.6 | F13 |
| 4 | Clarification submission | an omission is submitted as a skip, recording a deliberate human deferral that no human made | §12A.13 | F20 |
| 5 | One owner per derived value | a stored copy of a derived value drifts from its source; two surfaces disagree and both look right | §12A.7 | F14 |
| 6 | Provenance and absence presentation | `{known:false}` renders as `1` because Proposales' default is 1, turning an absence into a sourced fact | §12A.10 | F17 |
| 7 | Approval submission and terminality | the submitted proposition is reconstructed from a view model and differs from what was reviewed | §12A.15 | F22 |
| 8 | Presentation boundary and fixtures | a fixture drifts from the schema it stands in for, or is promoted into a contract | §12A.8 | F15 |
| 9 | Session identity separation | a client-generated id reaches the workflow-identity position; a UUID-shaped client id passes every format check | §12A.1 | F8 |
| 10 | Closed field sets (review, preview) | work-surface data or an invented amount reaches a client-facing rendering | §12A.11 | F18 |

### 2.2 High risk — wrong visibly, but easy to ship

| # | Mechanism | Silent-failure mode | Contract | Ledger |
|---|---|---|---|---|
| 11 | Tab status precedence | overlapping conditions resolved by whichever branch is written first; `failed` invents a seventh status | §12A.3 | F10 |
| 12 | `ErrorDto` and `failed` treatment | a DTO message replaced by a generic one; retry offered on a non-retryable path | §12A.16 | F23 |
| 13 | Inline edit and validation paths | the edit is applied locally as truth; a path-bearing error renders at surface level | §12A.14 | F21 |
| 14 | Domain-result and pill-kind rendering | a result state or part has no rendering and is silently dropped | §12A.9 | F16 |
| 15 | Unread and attention | a badge that never clears, double-counts, or becomes a third stored state axis | §12A.4 | F11 |
| 16 | Focus and announcement transitions | focus falls to the document body; a background result disturbs the active reader | §12A.17 | F24 |
| 17 | Tab order, reorder, close, focus | closing the active tab activates the wrong neighbour; reorder is pointer-only | §12A.5 | F12 |

### 2.3 Moderate risk — bounded, but undefined until now

| # | Mechanism | Silent-failure mode | Contract | Ledger |
|---|---|---|---|---|
| 18 | Thread autoscroll follow state | a programmatic scroll is read as a user scroll, or arriving content yanks a reader | §12A.18 | F25 |
| 19 | Narrow-width resilience | "must not corrupt" is unfalsifiable and is discovered after ship | §12A.19 | F26 |
| 20 | Free text and external links | markup interpreted; the editor URL constructed rather than echoed | §12A.20 | F27 |

**Contract status: 20 of 20 defined.** Every one carries inputs and states, precedence or totality where a ranking exists, a single owner, a closed forbidden list where one is needed, an invariant testable on the production path, and — where the rule is a construction requirement rather than a check — a named mutation that must turn its test red.

### 2.4 Seeded depth targets — coverage

All thirteen are covered: 1 → §12A.3; 2 → §12A.2; 3 → §12A.6; 4 → §12A.13; 5 → §12A.8; 6 → §12A.12; 7 → §12A.7; 8 → §12A.15; 9 → §12A.16; 10 → §12A.5; 11 → §12A.5; 12 → §12A.18; 13 → §12A.19. The seven additional mechanisms are §12A.1, §12A.4, §12A.9, §12A.10, §12A.11, §12A.17, §12A.20.

---

## 3. Intention sections and ledger IDs added

**Sections.** `§12A` with `§12A.0` (binding rules) and `§12A.1`–`§12A.20`. Inserted between §12 and §13. Nothing renumbered; every existing citation stays true.

**Ledger.** `F8`–`F27` appended to §12 below F1–F7, in a second table that names each entry's contract section and the defect family it guards. F1–F7 are unchanged in text and identity.

**Changelog.** `§16` round 4. **Status stays `RATIFIED`**: no product semantics, scope-ladder surface, F1–F7 objective, state boundary, owner decision, or backend contract changed, so the gate does not re-open. The four cards are post-ratification amendments awaiting the owner.

**Status table.** One sentence appended recording the round-4 deepening.

---

## 4. Backend §17A mechanisms cited and left backend-owned

§12A defines only the presentation-side mechanism that consumes each of these. None is redefined, copied, extended, or corrected.

| Backend mechanism | Cited in | Presentation-side mechanism defined instead |
|---|---|---|
| §17A.1 `Path`, `Sourced`, `SourcedOrAbsent`, `Money` | §12A.10, §12A.12, §12A.14 | provenance class map; money rendering; element-wise path matching |
| §17A.2 Generation ID, proposition version, Draft Reference, terminality | §12A.1, §12A.3, §12A.15 | the separate page-lifetime session id; the `created` precedence row; terminality read from the state |
| §17A.3 the caller-held state, strictness, staleness | §12A.1 | holding the state as returned and returning it unchanged |
| §17A.4 structural provenance and the three source policies | §12A.10 | the total leaf-condition → presentation-class map |
| §17A.5 absent / omitted / default / unset | §12A.10, §12A.12 | absence never rendered as a value; the "Proposales applies" statement |
| §17A.6 item policies and approvability | §12A.10 | approvability never computed; no policy field read |
| §17A.7 questions, answers, and the skip | §12A.13 | the three-row submission map; omission never converted |
| §17A.9 human-set is exactly `source = "human"` | §12A.10 | the human-versus-agent distinction; no second flag |
| §17A.10 the acknowledgment literal and the approval diff | §12A.15 | the wording-and-id pairing rule; the diff is not a client concern |
| §17A.12 Applied Pricing, the money rule, unavailability | §12A.12 | the frontend's own closed forbidden and permitted lists |
| §17A.13 the error taxonomy, check order, retryability | §12A.16 | the total code → treatment map; the single `retryable` rule |
| §17A.16 text bounds, Markdown, trimming | §12A.13, §12A.20 | text rendered as text; trimming left to the server |
| §17A.17 conversation context | §12A.1 | held as returned in the session runtime record |
| master plan §6.3 domain result states, `RunFailureReason` | §12A.9, §12A.16 | the five-state rendering table; the four failure-reason rows |

---

## 5. Contradictions and gaps resolved unilaterally — for owner ratification

Four carry product consequence and are the cards above:

| # | Contradiction or gap | Resolution taken | Card |
|---|---|---|---|
| A | Design 07 §3.4's "Updated" flag versus §14.1 item 3, which forbids the client to compute a change record; no V1 result carries one | "changed since" is not rendered in V1; the human/agent distinction is carried entirely by `source = "human"` | 4 |
| B | Backend §17A.16 (the narrative is Markdown) versus §4 (free text is rendered as text, never as markup) | V1 renders the characters literally on both surfaces; rich rendering would need a sanitizer and a recorded decision this intention does not take | 3 |
| C | Owner decision 2 classifies composer text as disposable UI mechanics, while closing a tab destroys it permanently | excluded from the meaningful-work predicate as §8.1 requires, with the cost surfaced | 1 |
| D | §5.8 keeps the agent surface live during creation but never says whether the session may be *closed*; the create call is non-cancellable and nothing survives a closed tab | close confirms with a warning naming the in-flight creation; the safer refusal is put to the owner | 2 |

Six were resolved and recorded without a card, each following an authority already in place:

| # | Ambiguity | Resolution | Authority |
|---|---|---|---|
| E | Design 06 §4.4 "Skip all clears the whole batch" is ambiguous between skipping the unanswered and discarding typed answers | skips only the unanswered; explicitly typed answers are preserved | silent destruction of a typed answer is the defect family §17A.7 exists to prevent |
| F | §2.4 makes "N open" the whole `unresolvedItems` array, while design 07 §3.2 calls it "N open questions" | the count may be shown only alongside the per-resolution breakdown; `unresolved` and `deferred_by_user` are never collapsed | §17A.7's skip contract; §2.4's own wording |
| G | `failed` is a domain result state but not one of design 04's six tab statuses | no seventh status; resolved by precedence rows 4–5, which reproduces §5.8's ratified "the status returns to ready" | §5.8, design 04 §3.3 |
| H | Retryability is per-code in some readings and per-`details` in others | one rule: retry iff `details.retryable === true`, for every code; absent means false | contract 05 §6, master plan §6.3 |
| I | Design 04 §4.2 does not define an abandoned drag | the specification's current behaviour stands (the last committed order); the alternative is reported as a design delta | design 10 §4 |
| J | Design 03 §3.2 warns the status note and the tab dot can disagree; §5.2 says the runtime is authoritative | both are renderings of one function of one record, so disagreement is structurally impossible; no synchronisation rule exists | §5.2, §8.5 |

**Design deltas reported, none implemented, no specification edited:** the human-edit and agent-revision flag vocabulary; `ready` versus `created` dot distinction; the autoscroll threshold distance; abandoned-drag order; the narrow-width mechanism; "Skip all" semantics. Each remains owned by the design specifications (§14.2, design 10 §4).

**Deliberately not decided here:** the approval control's enabled/disabled/warning treatment (C-3, §14.2); the per-interaction Radix mapping and package set (§14.3 item 3); the browser-to-server boundary's form, location, and signatures (§14.3 item 5); phase sizing; and every file, component, hook, store, adapter API, and transport signature.

---

## 6. Exit-gate verdict

**Every mechanism ranked at silent-failure risk carries a contract-grade definition.** Each states its inputs and states, its precedence and ties where a ranking exists, its owner, its forbidden behaviour, and an invariant provable on the production path; thirty named mutations are recorded across the twenty contracts so that no guard ships unable to fail. Every ranked rule is total: the tab-status order resolves all six rows plus seven overlaps; the clarification map covers three states per question; the `ErrorDto` map covers ten codes and the `failed` map four reasons; the provenance map covers five leaf conditions; the autoscroll machine covers seven transitions; the close and reorder tables cover four cases each.

**The implementation planner may start**, with two scoped holds:

- Card 1 and card 2 gate the phase that implements the close/discard guard and the creation lifecycle. That phase is not planned until they are answered; every other surface is unblocked.
- Cards 3 and 4 are ratifications of resolutions already written. They do not gate planning; the contract stands unless the owner rules otherwise, and each names the section that would change.

The planner should carry into the master plan: F8–F27 as trace targets alongside F1–F7; §12A's thirty named mutations as declared mutation-set entries (count derived from §12A, not typed); §12A.8's fixture rule as a standing rule for every fixture the project creates; and §12A.19's named width set and §12A.18's threshold as contract-level constants asserted by contract rather than by literal (charter rule 13).

---

## 7. Write perimeter

**Documents changed (1):**

- `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md` — status table (one sentence), §12 ledger (F8–F27 appended in a second table), new §12A.0–§12A.20, §16 round 4. Verified against `HEAD`: three hunks, 607 insertions, 1 deletion, all this session's; no pre-existing uncommitted change was present in this file or mixed into it.

**Documents created (1):**

- this handoff.

**Code changed:** none. **Dependencies installed:** none. **Commands run:** reads and `git status` / `git diff` only. **Tests, build, lint:** not run — the evidence budget was none, and the verification baseline in §2.1 stands unchanged because no code was touched. **Tool-recorded state (archgraph or equivalent):** none; no graph exists in this worktree. **Commits:** none. **Design specifications, backend artifacts, architecture contracts:** read only, unmodified.

**Architecture Context policy.** Applied per `agent-skills/policy/architecture-context-policy.md`. Contracts read and applied for this session's decisions, via `architectural_contracts/01-implementation-contract-guide.md` and the intention's §2.2 selection: `05-client-architecture.md` (§2, §3, §5, §5.1, §5.2, §6, §7, §8, §9), `16-design-prototype-porting.md` (§1–§5), `15-ui-styling-and-component-system.md` (§1–§5), `02-runtime-boundaries.md` (§5, §6), `06-data-contracts-and-validation.md` (§1–§2, §6, §8), `04-server-architecture.md` (§3, §6), `10-security-and-trust-boundaries.md` (§4, §6, §10), `08-agent-architecture.md` (§6, §9), `11-testing-principles.md` (§2, §3), `12-anti-patterns.md` ("Components and client", "Prototype porting"), `13-decision-checklist.md` (§8, cited for one-meaning-per-name), `14-documentation-principles.md` (§8, closeout). `07-integrations.md` and `09-database-and-persistence.md` remain not loaded, per §2.2. No contract conflicted with the ratified intention or with another; nothing was silently normalized.

**Documentation impact review** (contract 14 §8): the only durable documents this session's work could falsify are the frontend intention itself — patched in place — and the contracts README rows still reading "Component library: none decided", which §16 round 3 already identified as an outstanding repository-level patch and which this session neither performed nor widened.
