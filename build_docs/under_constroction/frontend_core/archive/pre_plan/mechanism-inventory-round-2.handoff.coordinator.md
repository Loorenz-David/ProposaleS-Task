---
plan: none — pre-planning gate (mechanism inventory precedes the master plan)
role: coordinator
round: 2
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
state: COMPLETE
verdict: EXIT GATE PASSED — every mechanism the rounds-5/6 delta introduced or left as an adjective is contract-grade; one owner card open, gating no phase
actor: Claude Opus 5 (1M context), coordinator session
---

# Mechanism inventory round 2 — frontend_core: the shell amendment and the round-5 ratifications

The ratified frontend intention gains **§12A.21–§12A.23** and ledger entries **F28–F30**, and five round-1 subsections are amended in place — **§12A.1, §12A.6, §12A.7, §12A.8, §12A.17** — each because the rounds-5/6 delta falsified a clause. F1–F27 are unchanged in text and identity and nothing was renumbered. **F1 needed no amendment**: its restoration clause is now served by F28, F29 and F30, which is what turns "A's meaningful workspace context is restored" from an adjective into a measurable claim. No design specification, backend artifact, architecture contract, code, or tool-recorded state was touched. All twelve seeded depth targets are covered. The most consequential finding was not seeded: **decision 7 silently split the word "empty" into two conditions**, and the wrong reading destroys exactly the work decision 7 was ratified to protect.

---

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Reloading the page while a draft is being created

**Question.** While a draft is being created in Proposales, should the browser warn before a reload or navigation away, the way closing that session is now refused?

**Story.** You approve a proposal. While it is being created you hit refresh out of habit, or close the browser tab, or follow a link. Proposales still creates the draft — that call cannot be cancelled — but the reload destroys every open session, and the link to open that draft existed only in the one it destroyed. The draft is real, it is in Proposales, and this product has no way to reach it. It is the same loss you already ruled out when you refused the close; the door is just a different one.

**Branches.**
- *Warn:* the browser asks before leaving while any session is creating a draft. One extra confirmation, only during those seconds.
- *Do not warn:* creating sessions are protected against being closed but not against being left, and a reflex refresh can still strand a real draft.

**Recommendation.** Warn, and only while a draft is being created — matching the refusal you already chose. Warning on any unsent work would fire constantly and teach people to dismiss it.

**On silence.** The gate holds on the question. The contract stands as written, covering close and discard only; planning proceeds and the gap stays recorded.

**Trace.** §12A.6 (refusal totality), §12A.15, §7, owner decision 8, F13.

---

## 1. Gate check

| # | Check | Result |
|---|---|---|
| 1 | Intention status reads `RATIFIED` | **PASS** — status table |
| 2 | No open owner decision | **PASS** — §15 heading reads `Ratified owner decisions (0 open)` |
| 3 | Round 1 landed | **PASS** — `### 12A.20` exists and the §12 ledger carries an `F27` row |
| 4 | The delta is present | **PASS** — §16 records round 5 (decisions 7–10) and round 6 (decision 11) |
| 5 | This round is outstanding | **PASS** — no §12A.21+, no ledger ID at or above F28, no §16 entry recording a second mechanism inventory |
| 6 | The gap is real | **PASS** — §14.3 item 5a still defers the representation of the meaningful Main Application Surface context and which interactions qualify |

**Backend `APPROVED` phases, context only** (backend master plan §4; they gate nothing here): phase 1 (repository topology and environment), phase 2 (errors, logger, shared value shapes), phase 3 (Proposales adapter: transport, error translation, content read). Phases 4–15 are `NOT_STARTED`, so the frontend's fixture era still covers every surface.

**One tree fact the perimeter check depends on** (§10): unlike round 1, this session did **not** start from a clean file. The intention already carried **uncommitted rounds 4, 5 and 6** — the whole of §12A, §8.6, decision 11 and the round-4/5/6 changelog entries are in the working tree and not in `HEAD` (`c0e9f81`). A `git diff` against `HEAD` therefore mixes the owner's and round 1's uncommitted work with this session's. §10 reports a derived perimeter instead.

---

## 2. The round-2 inventory

Ranked by silent-failure risk. Rows already contract-grade are kept separate, per the prompt.

### 2.1 New contracts

| # | Mechanism | Silent-failure mode if undefined | Contract | Ledger |
|---|---|---|---|---|
| 1 | Category-A qualification: what may be retained, and in what form | the snapshot engine returns under a new name, or a category-C value is promoted into presentation state and rendered after its server copy is gone; both look correct in every screenshot | §12A.21 | F28 |
| 2 | Reference-versus-value inside retained context | a session "remembers" an approval state, an amount, or a provenance class and re-renders it against a proposition that has moved on | §12A.21 | F28 |
| 3 | Retained context versus the derivation register | retained context becomes a second source for a derived value; two surfaces disagree and both look right | §12A.21 + §12A.7 amended | F28, F14 |
| 4 | Restoration on activation: which state, and where inside it | a session returns to the wrong state, or an entry suppresses the state its own result determined (a creating session showing the review surface) | §12A.22 | F29 |
| 5 | Stale retained context | the identity the user's place names is gone and the surface renders it anyway, from a captured copy | §12A.22 | F29 |
| 6 | Retained context and a background result | a result applied to a non-active session clears or rewrites its context, or the resolution path reads the active session id | §12A.21 + §12A.22 | F28, F29, F9 |
| 7 | Shell structural persistence | the shell is rebuilt per session; two `main` landmarks exist across states; the Agent Surface unmounts on a result kind | §12A.23 | F30 |
| 8 | V1 surface containment | decision 11's abstraction becomes a router, a surface registry, or a one-member surface discriminant — infrastructure with no second consumer | §12A.23 | F30 |
| 9 | The seam under retained context | an entry keyed by an adapter output field silently invalidates F15 at the merge that replaces the adapter | §12A.21 + §12A.8 amended | F28, F15 |
| 10 | The close guard versus the `empty` tab status | **see §5 row A** — a planner reads "an empty session closes immediately" as `status === "empty"` and destroys a pasted, unsent brief, defeating decision 7 entirely | §12A.6 amended | F13 |
| 11 | Composer draft lifetime across the clarification panel | the panel replaces the composer; the draft is cleared or submitted as a side effect, or the guard stops seeing it | §12A.6 amended | F13 |
| 12 | The refusal's totality over close paths | one path removes a session without running the guard; a refused last-tab close still creates its replacement; the refusal renders as a silent no-op | §12A.6 amended | F13 |
| 13 | Focus and announcement on restoration | restoration steals focus from the activated tab, or one switch produces two announcements | §12A.17 amended | F24 |
| 14 | The idle Main Application Surface | a session that has run no turn has no defined right-side state, and the prototype's excluded list view is the nearest thing to hand | §12A.22 | F29 |

### 2.2 Already covered by §12A — recorded, not re-contracted

| Seeded concern | Where it is already contract-grade |
|---|---|
| results are attributed by captured origin, never by the active session id | §12A.2 (F9), unchanged — retained context is outside that path by §12A.21 |
| the close table, the reorder table, the last-tab replacement, focus after close | §12A.5 (F12), unchanged — every row already runs after the §12A.6 guard |
| terminality, the submit-once pair, failure returning the intact proposition | §12A.15 (F22), unchanged |
| provenance classes, absence, unresolved information, approvability | §12A.10 (F17), unchanged |
| free text and external links | §12A.20 (F27), unchanged |

**Contract status: 14 of 14 defined.** Three new sections carry inputs, admissible and forbidden value classes, first-match-wins precedence with enumerated overlaps, an explicit failure direction, an owner, and an invariant testable on the production path, with **eight named mutations** across them; the five in-place amendments add **two** more (the `empty`-status gate and the restoration announcement). Counts derived from §12A.21–§12A.23 and the amended sections, not typed forward.

### 2.3 Seeded depth targets — coverage

1 → §12A.21 · 2 → §12A.22 · 3 → §12A.21 (write rule) + §12A.22 (B) · 4 → §12A.7 amended + §12A.21 · 5 → §12A.21 (the two admissible classes) · 6 → §12A.21 (seam) + §12A.8 amended · 7 → §12A.23 · 8 → §12A.21/F28 plus F29 and F30; F1 unchanged · 9 → §12A.6 amended · 10 → §12A.6 amended · 11 → §12A.17 amended · 12 → §12A.23. Two further mechanisms the delta touched and no target named: the `empty` overload (§5 row A) and the idle Main Application Surface (§5 row B).

---

## 3. Intention sections and ledger IDs added

**New sections.** `§12A.21` (retained Main Application Surface context: qualification, reference-only content, and the seam), `§12A.22` (restoration on activation: the total case table), `§12A.23` (shell structural persistence and V1 surface containment). Inserted after §12A.20, before §13. Nothing renumbered.

**Amended in place, each named with its reason.**

| Section | Amendment | Why the delta required it |
|---|---|---|
| §12A.1 | the record's context clause now cites §12A.21 for qualification, bounds, and resolution | round 6 put category-A context in the record without defining what may be in it |
| §12A.6 | (a) the predicate separated from the `empty` tab status; (b) input (6)'s lifetime and its behaviour while the clarification panel replaces the composer; (c) the refusal's totality over every close/discard path, its evaluation before any list mutation, its required visibility, and reload stated as outside it; (d) the "Deepens" line now names decisions 7 and 8; (e) `a false "empty"` reworded so the separated term is not reintroduced | decisions 7 and 8 both landed in this section after round 1 wrote it |
| §12A.7 | the register's closure sentence now admits the workspace's two stored presentation values and forbids either from reading the other; the counter sentence scoped to counters | round 6 added stored presentation state that the closure sentence's "either the server or it does not exist" excluded |
| §12A.8 | retained context brought inside the seam-replacement claim, with the keying rule that keeps F15 true | round 6 added per-session state that a badly keyed entry would break the seam with |
| §12A.17 | a focus row for restoration; the rule that restoration announces nothing of its own | round 1's focus table predates restoration |
| §12A heading and §12A.0 | both now record that §12A spans two inventory rounds and which sections each wrote | required by the prompt's §4.3 |

**Ledger.** `F28`, `F29`, `F30` appended below `F27` in §12's second table. No existing ID moved and no existing invariant's text changed. The table's intro sentence now names both rounds and records that F1's restoration clause is served by the three new IDs.

**Changelog.** `§16` round 7. **Status table:** one sentence appended.

---

## 4. Totality re-check of the §12A sections named in the prompt's §4.2

| Section | Result |
|---|---|
| §12A.1 | **amended.** The record clause named category-A context but nothing bounded it; §12A.21 now does. The forbidden list round 6 extended is still correct and is unchanged |
| §12A.5 | **still total.** Its close table already reads "each after the §12A.6 guard has passed", so decision 8's refusal short-circuits every row including the last-tab replacement. Stated explicitly in §12A.6 rather than duplicated here |
| §12A.6 | **amended, four ways** — see §3. The predicate's six inputs, the failure direction, and the evaluation site are unchanged |
| §12A.7 | **amended.** The register's own closure rule was falsified: retained context is neither a register row nor a server-returned value, and it exists. `F14`'s text is still true as written — unread remains the only stored *counter* — so F14 was not amended |
| §12A.8 | **amended.** Its seam claim was silent about the session runtime's new per-session state; the keying rule is what keeps F15 provable |
| §12A.10 | **still total.** The five leaf conditions are unaffected; a provenance class in retained context is forbidden by §12A.21's never-admissible list |
| §12A.15 | **still total.** Decision 8 was already folded in by round 5. A terminal session's retained entries resolve to their defaults by §12A.22 (A) row 2 and (B) row 3, which needed a new case rather than an amendment here |
| §12A.17 | **amended** — one focus row, one announcement rule |
| §12A.20 | **still total.** An editor URL in retained context is a category-C value and is forbidden by §12A.21 |

Also re-checked though not listed: **§12A.2** — still total and unchanged. §12A.21's rule that a turn result neither reads nor writes retained context keeps its four resolution rows and its "the active session id is never read on the resolution path" intact, with no per-session branch added. **§12A.3** — unchanged; the `empty` status row is now explicitly disjoint from the close guard. **§12A.9** — unchanged; §16 round 6 preserved the proposal-specific wording of §5.6–§5.8, so its "Proposal surface" column stays correct for what V1 renders.

---

## 5. Contradictions and gaps resolved unilaterally

One is the owner card above. The rest were resolved and recorded technically, each following an authority already in place.

| # | Contradiction or gap | Resolution | Authority followed |
|---|---|---|---|
| A | **"Empty" now names two different conditions.** §5.3 and §12A.6 say an empty session closes immediately; §12A.3 row 6 assigns status `empty` when no turn has started. Before decision 7 these coincided. After it, a session holding a pasted, unsent brief is status-`empty` **and** meaningful work | the close guard and the tab status are separated explicitly, neither reads the other, and a named mutation gates the confirmation on the status so the row can fail | decision 7 and contract 13 §8, one meaning per name. This is the round's highest-value finding: the wrong reading is the exact defect decision 7 was ratified to prevent |
| B | **The Main Application Surface has no defined state for a session that has run no turn.** Before decision 11 the right side was the proposal surface and its empty state was implicit; the prototype filled that space with a list view that §6 excludes | §12A.22 (A) row 4 presents the Proposal Preparation **idle** state, which §11 already names as a state every surface renders intentionally; its visual treatment is reported as a **design gap** | §11, §6, design 10 §7. No specification defines it |
| C | **Design 07 §4.3** says "toggle state is disposable UI — losing it on session switch is acceptable"; §8.6 lists the active work surface as a category-A example and §8.1 stopped calling it unconditionally disposable | the intention wins; the work surface is admissible as category A and planning decides whether to enumerate it. Reported as a **design delta**, no specification edited | design 10 §1 — the specs are not authoritative for state ownership — and decision 11's own rationale, which names exactly this scenario |
| D | **The failure direction for an undecided category-A candidate** is the reverse of §12A.6's, and the prompt flagged it as a possible owner card | **not carded.** §8.6's own rule already fixes it: "Only *explicitly* meaningful workspace context may be retained." The contract makes the qualification test a positive four-condition conjunction, so the direction governs only residual undecidable cases and never licenses a thin enumeration | §8.6 rule 2. Recorded here so the owner can overturn it |
| E | **§8.6's category B says disposable mechanics do not survive a switch**, which the composer draft falsifies since decision 7 | §8.6 is stated about the **Main Application Surface**; the composer is the Agent Surface's, governed by §8.1 and decision 7. Reconciled in §12A.21 rather than by editing decision 11's own section | §8.6's opening sentence; §12A.0's binding rule that the earlier section's behaviour wins |
| F | **Stale retained context** — whether the workspace tells the user their place moved | resolves silently to the entry's stated default; no notice, error state, or announcement. The unread badge is the workspace's existing and only signal that something arrived while the user was away | §12A.4, §12A.17's one-announcement-per-settled-state rule |
| G | **Whether restoration announces** | it does not; the activated tab's accessible name already carries title, status, note and unread. Operating the view toggle announces (design 08 §5); activating a session does not re-announce the view it restored | §12A.17, design 04 §5's debounce requirement |
| H | **Whether the enumeration may be empty** | it may not: §6 lists session-controlled restoration among must-ship, so an empty set satisfies F1 vacuously and ships nothing | §6, not a decision taken here |

**Design deltas reported, none implemented, no specification edited:** design 07 §4.3's disposable view toggle (row C); the absent idle-state design for the Main Application Surface (row B). Both stay owned by the design specifications (§14.2, design 10 §4), alongside round 1's six.

**Deliberately not decided here:** which interactions qualify as category A and how the context is represented (§8.6, §14.3 item 5a); the shell's component hierarchy and names; the idle state's visual treatment; the approval control's treatment (C-3); the per-interaction primitive mapping (§14.3 item 3); the browser-to-server boundary's form (§14.3 item 5); phase sizing; and every file, component, hook, store, slice, key, adapter API, and transport signature.

---

## 6. Backend §17A mechanisms cited and left backend-owned

None was redefined, copied, extended, or corrected. §12A.21–§12A.23 define only the presentation-side mechanism.

| Backend mechanism | Cited in | Presentation-side mechanism defined instead |
|---|---|---|
| §17A.1 `Path` | §12A.21 | a `Path` is one of the two admissible identity classes a retained entry may hold |
| §17A.2 Draft Reference and terminality | §12A.22 (A) rows 1–2 | the presented-state precedence reads the draft reference; terminality is still the server's |
| §17A.3 the caller-held state | §12A.21, §12A.22 | the state is read to decide the presented state and to resolve identities; it is held and returned unchanged |
| §17A.7 question ids | §12A.21 | a question id is an admissible identity class |
| §17A.4 structural provenance · §17A.12 `Money` and Applied Pricing · §17A.13 the taxonomy | §12A.21's never-admissible list | each is a category-C value a retained entry may never hold |
| master plan §6.3 domain result states | §12A.22 (A) overlaps | which result kinds change the presented state and which do not |

---

## 7. Material semantic change?

**No.** Nothing here changes product semantics, the scope ladder, an F1–F7 objective, a state boundary, an owner decision, or a backend/domain contract. §12A.21–§12A.23 fix predicates the intention deliberately left open (§14.3 item 5a) and the five amendments repair clauses the delta falsified. The one owner card is an **addition** to decision 8's reach through a path the intention never covered, not a reinterpretation of it, and on silence the contract stands.

**The intention status therefore stays `RATIFIED`.** The gate does not re-open and planning does not wait.

---

## 8. Exit-gate verdict

**Every mechanism the rounds-5/6 delta introduced or left as an adjective now carries a contract-grade definition.** Each states its inputs, its admissible and forbidden values, its precedence and enumerated overlaps where a ranking exists, its owner, its failure direction, and an invariant provable on the production path; each construction requirement names the mutation that must turn its test red, and §12A.23's absence half ships with a planted-defect probe (charter rule 15). F1's restoration clause is no longer an untestable objective: F28, F29 and F30 register the invariants that serve it.

**`implementation-planner` may start.** No phase is gated. Card 1 would add one criterion to whichever phase implements the creation lifecycle; that phase is buildable without it, and the card names the section that changes if the owner rules for the warning.

---

## 9. What the planner must carry forward

- **New trace targets:** F28, F29, F30 alongside F1–F27. A criterion serving the restoration behaviour cites one of the three, not F1's prose.
- **A naming-registry obligation that precedes implementation.** §12A.21 requires the category-A entry set — each entry's name, admissible value domain, and stated default — to be **enumerated in the master plan's naming registry before the first phase that implements restoration**. It is a planning artifact, not a phase deliverable, and the set is non-empty (§6). A phase does not add an entry.
- **New named mutations** from §12A.21–§12A.23 and the amended sections, added to the declared mutation set. §12A now carries **40** mutation clauses in total (round 1's 30, plus 8 in the three new sections and 2 in the amendments), derived by enumerating them in the file. Re-derive before any count-bearing gate rather than carrying this number forward (charter rule 3).
- **Constants asserted by contract, not by literal** (charter rule 13), joining round 1's list: each retained entry's **stated default** is asserted as "the entry's declared default", never as its literal value, so changing a default is a configuration change and not a red suite.
- **Two enumerations a criterion must cover row by row** (charter rule 2): §12A.22 (A)'s four rows **plus its six enumerated overlaps**, and (B)'s three rows. Sampling either looks exhaustive and misses the overlap rows.
- **A phase-sizing consequence.** Restoration touches the shell, the session runtime, the tab strip and the Main Application Surface at once. Splitting by contract — F30 (shell identity and containment) separately from F28/F29 (entries and resolution) — keeps each phase under the ≤ 8-criteria target without splitting a seam mid-signature.
- **The `empty` finding is a review instruction, not only a contract.** Any criterion or test that reaches for the tab status to decide a close is the defect §5 row A names.

---

## 10. Write perimeter

**Documents changed (1):**

- `build_docs/under_constroction/frontend_core/intention/frontend-core-intention.md`.

**Documents created (1):** this handoff.

**Derived perimeter, and why it is derived rather than read from `git diff`.** The file already carried the owner's and round 1's **uncommitted rounds 4, 5 and 6** when this session opened (§1). A diff against `HEAD` (`c0e9f81`) reports 18 hunks that mix them with this session's work. This session's own perimeter was therefore derived by reconstructing the pre-session file — reverse-applying every one of this session's exact-match replacements — and diffing against it:

- **12 hunks, 105 lines inserted, 8 lines replaced**, all in the one file.
- The reconstruction was verified in both directions: it contains **zero** occurrences of `12A.21`, `12A.22`, `12A.23`, `F28`, `F29`, `F30` or `Round 7`, and it still contains rounds 4, 5 and 6 (`### 12A.20`, `F27`, `Round 4`, `Round 5`, `Round 6`, `### 8.6`, `Decision 11`). No pre-existing uncommitted change was altered or absorbed into this session's edits.
- Every edit was applied as a single-occurrence exact-match replacement that failed loudly on any other count, so no edit landed in an unintended place.

**Code changed:** none. **Dependencies installed:** none. **Commands run:** reads, `git status` / `git diff` / `git show`, and the edit and reconstruction scripts, all confined to the one document and the session scratchpad. **Tests, build, lint:** not run — the evidence budget was none and §2.1's verification baseline stands unchanged because no code was touched. **Tool-recorded state (archgraph or equivalent):** none; no graph exists in this worktree. **Commits:** none. **Design specifications, backend artifacts, architecture contracts:** read only, unmodified. **Ledger IDs, section numbers, and F1–F27 invariant texts:** unmoved and unchanged, verified by enumerating the ledger IDs in file order (F1 … F30, no gaps, no reordering).

**Architecture Context policy.** Applied per `agent-skills/policy/architecture-context-policy.md`, routed through `architectural_contracts/01-implementation-contract-guide.md` §4 and the intention's §2.2 selection. Contracts read and applied for this round's shell-and-client-state concerns: `05-client-architecture.md` (§5, §5.1, §5.2, §7, §8), `16-design-prototype-porting.md` (§3, §4, §5), `02-runtime-boundaries.md`, `03-feature-architecture.md`, `12-anti-patterns.md` ("Components and client", "Structure and abstraction"), `11-testing-principles.md`, `13-decision-checklist.md` §8, `14-documentation-principles.md` §8. `07-integrations.md` and `09-database-and-persistence.md` remain not loaded, per §2.2 — and §12A.21 states explicitly that page-lifetime retained context introduces no persistence, so §2.2's exclusion is still correct. Contract 05 §5.2's prohibition on rehydration paths and restore-after-reload affordances was the sharpest constraint this round: it is why §12A.21 states that retained context is page-lifetime memory inside one browser page and never a rehydration path. No contract conflicted with the ratified intention or with another, and nothing was silently normalized.

**Documentation impact review** (contract 14 §8). The durable documents this session's work could falsify are: the frontend intention itself, patched in place; the design specifications, where two deltas are **reported and not applied** (§5 rows B and C) because §14.2 owns them; and the contracts README rows still reading "Component library: none decided", which §16 round 3 already identified as an outstanding repository-level patch and which this session neither performed nor widened. No feature README exists yet — no frontend feature exists.
