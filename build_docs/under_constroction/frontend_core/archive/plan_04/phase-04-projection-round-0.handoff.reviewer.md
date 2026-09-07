---
plan: plans/phase-04-derived-presentation.md
role: projection
round: 0
date: 2026-09-07
verdict: AMENDMENTS_REQUIRED
actor: projection
---

# Phase 04 projection — round 0

## 1. Verdict

**AMENDMENTS_REQUIRED.**

## 2. Opening

Phase 04 is meant to make the little status dot on each session tab, the line of text above the
conversation, and the "unread" count all come from one place, so they can never disagree with each
other. The idea is sound and the plan describes it well. But when I worked through it as the person
who would build it, I hit a wall that the plan does not acknowledge: most of the things the plan
wants to measure — a session finishing work, a result arriving in a background tab — cannot happen
yet, because the machinery that makes them happen is the *next* phase's job. Roughly a third of the
plan's checklist has nothing to point a camera at.

Three things need you personally: what the short descriptive line under the agent's name should
actually say for each state, whether we build a small slice of next phase's machinery early so this
phase can be measured properly, and whether one accessibility promise about a blinking dot is worth
the cost of measuring it now rather than next phase. Everything else is mine and the coordinator's
to fix in the plan before the builder starts. Nothing here is a defect in already-shipped code, and I
changed nothing myself.

## ⚠ OWNER DECISIONS REQUIRED (3)

### Card 1 — What does the status note say?

**Question.** For each session state, what short line of text should sit above the conversation —
or should we drop it from V1?

**Story.** You have three proposals open. On each tab the app shows a colour dot; above the
conversation there is a line of text. In the clickable prototype that line read things like
"Pricing the three seatings" — a sentence the fake demo invented by reading the transcript. The real
product cannot do that: nothing in V1 reads what the agent is thinking. So today the builder would
have to invent six sentences and put them in the product, and whatever they invent is what your
screen-reader users hear on every tab switch, forever, because it is also part of each tab's spoken
name.

**Branches.**
- *You give the six lines* — the copy is yours, and the builder writes exactly it.
- *Drop the note for V1* — the tab reads "Restaurant week, Ready, 3 unread"; nothing is lost that a
  user can act on, and the line comes back when the agent can honestly narrate itself.
- *Builder invents them* — invented product copy ships and gets discovered at review or by a user.

**Recommendation.** Drop it for V1 and record it as a design item, because the only honest source
for a real note is the in-flight turn, which does not exist until the next phase.

**On silence.** The gate holds; no note is implemented and the phase does not dispatch.

*Trace: intention §12A.3 accessible representation and §12A.7 register row 1; plan C3(a), C6(b);
design 03 §3.2; design 04 §3.3, §5.*

### Card 2 — Measure the unread counter here, or move it to the next phase?

**Question.** Should phase 04 build a small slice of next phase's result-handling so the unread
count can be measured now, or should the unread count move to phase 05 with the machinery it needs?

**Story.** The unread badge is meant to tick up by one when a background session finishes something
you did not see. Phase 04 is supposed to prove that. But "a session finishes something" is an event
that phase 05 creates — phase 04 has no way to make one happen. Five of the eight checks in this
part of the plan therefore have nothing to trigger them. A builder who is asked to prove it anyway
will write a helper nothing in the real app ever calls, and the tests will go green while the badge
in the product has never once been exercised.

**Branches.**
- *Build the slice here* — phase 04 owns the "a result arrived" step; phase 05 wires the real
  request to it. Honest measurement, and phase 04 grows.
- *Move the counter to phase 05* — phase 04 ships the status dot and the register only; phase 05
  ships the counter with its events. Smaller, cleanly measured phases.
- *Leave as written* — green tests over a feature nothing reaches.

**Recommendation.** Move it to phase 05, because the phase-sizing evidence says a smaller phase
closes in fewer rounds and this split falls on a stable seam.

**On silence.** The gate holds; the coordinator does not compile the builder's prompt.

*Trace: plan C4 and C5, task 5; intention §12A.4, §12A.2; master plan §7.3 F11.*

### Card 3 — Prove the blinking dot behaves for motion-sensitive users now, or next phase?

**Question.** This phase introduces the pulsing "working" dot. Do we prove now that it holds steady
and bright for users who ask for reduced motion, or does that proof move to the phase where a
session can actually be working?

**Story.** Some people get motion sickness from animation and tell their computer so. Our current
blanket rule speeds every animation to almost nothing — which for this particular dot leaves it
frozen *dim*, the opposite of what the design requires. The correction is one line to write. Proving
it is the problem: the only honest proof is a real browser looking at a real dot on a session that
is really working, and nothing can make a session work until next phase.

**Branches.**
- *Prove it now* — we add a temporary way to force a session into "working" purely for the test,
  which is scaffolding in the product we then remove.
- *Write the correction now, prove it next phase* — the fix ships immediately; the proof arrives
  with the first session that can genuinely be busy. Recorded so it cannot be forgotten.
- *Rely on the blanket rule* — the dot ships dim for exactly the users the rule protects.

**Recommendation.** Write the correction now and hold its proof for phase 05, recorded with a named
trigger, because temporary test-only scaffolding in the product is the more expensive mistake.

**On silence.** The gate holds; the row is neither implemented nor waived.

*Trace: master plan §11.3 follow-up 9, §10.3A, §7.5; plan C3(b); design 01 §5 correction 6.*

## 3. Decision ledger

Classification: **P** = plan gap · **I** = intention / upstream gap · **F** = free choice, to be
delegated explicitly.

| # | Decision point | Class | Proposed routing |
|---|---|---|---|
| L1 | `SessionRuntimeRecord` must gain §12A.3's five inputs, but the perimeter says `types/session.ts` "edited — **TabStatus**" and the store "edited — **unread only**" | P | Amend both perimeter cells to name the five inputs and the record's shape change |
| L2 | Draft reference, latest result kind and current proposition are backend-owned shapes; nothing exists to import, and standing rule 1 forbids re-declaring one | P | Add §12A.8 (era 1), master plan §6.6 and standing rule 3 to the Read-first list; state that phase 04 declares an **era-marked presentation** shape, never a domain shape, and name its marker |
| L3 | Precedence rows 5 and 6 do not partition; the chain's `else` branch is undetermined and no criterion can distinguish the two natural implementations | I | Route to the coordinator: re-word §12A.3's partition sentence (row 6 as the chain's `else`, or the missing case named). Charter rule 17 class of undecidability |
| L4 | C2(g) is not an overlap — only chain row 5 matches it — and it shares C1(e)'s only reachable fixture | P | Merge C2(g) into C1(e), or re-word C1(e) so the two fixtures differ. Re-derive the row count |
| L5 | C4(a), (b), (d), (e) and the "renamed" clause of (f) have no event to fire in this phase | P | **Owner card 2** |
| L6 | C3(b) names no runner; jsdom structurally cannot measure it; Playwright has no reachable working dot; and the correction's home file is outside the perimeter | P | **Owner card 3**; whichever branch, name the file the correction lands in |
| L7 | "status note" is defined nowhere in V1; C3(a) and C6(b) both depend on it | I | **Owner card 1** |
| L8 | Design 03 §3.2's phase-label vocabulary (`working`/`idle`/`created`/`N open`/`ready to push`) is five values from two sources, against six statuses from one | P | State in the plan that the phase label renders the §12A.3 status text and register the delta in master plan §11.2 |
| L9 | C6(b) names "the session count in the header"; no agent header exists and none is in the perimeter | P | Drop it from C6(b), or add the header to the perimeter and to task 3 |
| L10 | C6(a) carries an enumeration-equality check and an open-universe closure claim in one row, with no instrument and no probe | P | Split: (a) asserts the enumeration; the closure half is marked **structurally held** per §7.5, trigger "phase 15's closure check", which the plan's own Notes already anticipate |
| L11 | C5(c)'s probe says storing the conjunction reddens "the register check of C6" — that is C6(a), which it cannot redden; only C6(b) bites | P | Re-point the probe at C6(b) |
| L12 | C3(d)'s probe does not name its site; if **both** renderings read the stored field, C3(c) stays green | P | Name file and site per charter rule 11: exactly one of the two renderings reads the stored field |
| L13 | Task 7 and `STATUS_ANNOUNCEMENT_DEBOUNCE_MS` have no criterion; §7.3 does not list 04 under F24; and a status *change* needs events this phase lacks | P + I | Either add an F24-anchored criterion and add `04` to §7.3's F24 row, or move task 7 to phase 05 with C4. Recommend the latter, with card 2 |
| L14 | §7.5's held row 03 C6(d) names **phase 04** as a converting trigger; the plan converts nothing and §7.3's F30 row reads "02, 03, 14" | P | Convert the status half into a phase-04 criterion and add `04` to §7.3's F30 row, exactly as the F8 / phase-05 precedent in the same table prescribes; the Main-Surface half stays held for phase 14 |
| L15 | §11.3 follow-up 20 assigns the `location.href` denylist repair to phase 04; no task, criterion or perimeter entry carries it | P | Add task and perimeter entry for `workspace.test.tsx:100`; the phase does add source under C5(b)'s scanned tree, so the assignment's own justification holds |
| L16 | §11.3 follow-up 17 lands on "the next phase that touches the reduced-motion evidence" — this one — and standing rule 19 forbids resting on a dependency default | P | Add the explicit `reducedMotion: "no-preference"` restoration to the perimeter, or declare the divergence per charter rule 14 |
| L17 | C5(d) is a geometry row: no runner, no named constant for the minimum tab width, no definition of "legible", and no reachable badge in the running app | P | Define the predicate, promote the width to a named constant, name Playwright — or move with C4 under card 2 |
| L18 | No criterion names its runner; phase 03 named runners in four of seven | P | Add a **Runner:** sentence to every criterion, as phase 03 does |
| L19 | `components/agent/agent-status-line.tsx` is new, but `components/workspace/agent-surface.tsx` is not in the perimeter — nothing would render it | P | Add `agent-surface.tsx` to the perimeter |
| L20 | Design 04 §3.3 labels `ready` as "Ready to push"; §12A.3 and §6.3 say "Ready" | F | The contract already wins (standing rule 6); register the delta in §11.2 so it is recorded, not silent |
| L21 | The plan file carries two `## Review log` headings (the first empty) and two `## Notes` headings | P | Merge; the executor's closeout writes to "the Review log" and there are two |
| L22 | The strip already owns one polite live region for reorder; task 7 adds status announcements to an undetermined region | F | Delegate explicitly, with the constraint that a status announcement must not clobber a reorder announcement |
| L23 | The mechanism carrying the tab's accessible name (an `aria-label` on the trigger vs. a visually-hidden span) is undetermined | F | Delegate explicitly. Verified safe either way: phase 03's tab tests query by role, never by tab name |
| L24 | C6(b) needs a rendered value (jsdom) while the view model's own test lands in the `node` project | F | Delegate explicitly; state that the criterion spans two projects |

## 4. Reality-check and decidability findings

### R1 — The session runtime record holds none of the status function's inputs *(L1)*

`src/features/proposal-preparation/types/session.ts:7-10` is the whole record today:

```ts
export type SessionRuntimeRecord = { id: WorkspaceSessionId; title: string };
```

§12A.3 (intention:519) names five inputs — in flight, draft reference, latest result kind, current
proposition, turn history — and §12A.4 adds the unread integer. Six fields must appear. The plan's
perimeter (`plans/phase-04-derived-presentation.md:38,42`) authorises "TabStatus" on the type and
"unread only" on the store. An implementer following the perimeter literally cannot write C1.

### R2 — Every status input is a pre-merge, backend-owned shape *(L2)*

`grep` over `src/` returns no `ProposalWorkflowState`, no `ConversationContext`, no `TurnResult`, and
no occurrence of `clarification` or `proposition`. Master plan §6.3 says the domain result states are
"imported, never re-declared"; standing rule 1 forbids the frontend authoring one. There is nothing
to import. The resolution exists — §12A.8's era-1 rule and master plan §6.6's fixture-era markers —
but the plan's Read-first list (`:23-29`) names neither, and no task mentions an era marker. This is
charter rule 17's class: the row is decidable only once the shape our boundary receives is written
down.

### R3 — Rows 5 and 6 do not partition, and C1(f) can pass without its predicate *(L3)*

Intention:532 asserts "Rows 5 and 6 partition everything rows 1–4 do not match". Row 5 is "at least
one turn has **completed**"; row 6 is "no turn has **ever been started**". A record with a turn
started, none completed and none in flight satisfies neither. §12A.2's discard rows make that record
hard to reach through events — but this phase's stated method is **constructed records**
(`plan:17-19`), where it is trivial to build.

`TabStatus` is a six-member union, so the function must be total and the implementer must choose an
`else`. Both choices — `else → "empty"` and `else → "idle"` — satisfy C1(e) and C1(f) identically.
With `else → "empty"`, the predicate "has any turn ever been started" is never read, and C1(f) is a
row that passes for a reason other than the one it states. C1 carries **no named mutation**
(the five are C2(h), C3(d), C4(h), C5(c), C6(c)), so nothing catches it.

### R4 — C2(g) is not an overlap, and duplicates C1(e) *(L4)*

Six of the seven overlap rows are genuine: each fixture makes two chain rows match, the earlier one
wins, and mis-ordering the pair yields the loser's status. Adjacent pairs (1,2), (2,3), (3,4) and
(4,5) are each covered — by C2(a), C2(d), C2(e) and C2(f) respectively. Pair (5,6) has no overlap to
write, since rows 5 and 6 are mutually exclusive; that is a resolved question, not a finding.

C2(g) is the exception. Its conditions are `failed` and *no* proposition. `failed` is not row 3's
predicate, and "no proposition" is the negation of row 4 — so exactly one chain row matches (row 5),
there is no competing row, and no ordering is under test. Worse, row 5 is reachable *only* through a
failed result with no proposition: every other completed result kind carries a draft reference
(row 2), a clarification (row 3) or a proposition (row 4). So C1(e)'s only constructible fixture is
C2(g)'s fixture. Two rows, one instrument.

**On the prompt's §3 tension, resolved rather than reported:** charter rule 2's companion asks that a
row's fixture make its own predicate the only *sufficient cause of the expected outcome*, not the
only true predicate. In an overlap the second predicate is a competing cause for a *different*
outcome, which is what makes the row bite. The companion is satisfied for C2(a)–(f). It is C2(g),
where there is no competing cause at all, that fails it.

### R5 — Five of C4's eight rows have no event to fire *(L5)*

| C4 row | Event | Reachable in phase 04? |
|---|---|---|
| (a) applied while not active | result application (§12A.2) | **no** — phase 05 |
| (b) applied while active | result application | **no** — phase 05 |
| (c) activation clears to 0 | `activateSession` | yes (`use-workspace-session-store.ts:47`) |
| (d) dispatch leaves unchanged | turn dispatch | **no** — phase 05 |
| (e) discarded result leaves unchanged | §12A.2 rows 2–4 | **no** — phase 05 |
| (f) reorder / rename / scroll-into-view | `moveSession`, `revealActiveTab` | reorder and reveal yes; **rename does not exist** anywhere in the tree and no phase introduces it |
| (g) no other decrement path | the store's own action set | yes — a closed set, a plain check under 18A |
| (h) probe: increment at dispatch | requires dispatch | **no** — phase 05 |

The plan's Goal (`:17-19`) says the events "arrive in phase 05" and then that this phase "drives both
from constructed session runtime records so that each row of each table is reachable". A constructed
record is a *state*; these rows assert *transitions*. The two halves of that sentence contradict each
other. C4(h) is one of the phase's five named mutations and is unrunnable as written.

### R6 — C3(b) has no runner that can see its subject *(L6)*

Master plan §10.3A is categorical: jsdom has no `matchMedia`, `getComputedStyle` applies no `@media`
block, and the stylesheet never reaches the document. C3(b) is not a Vitest row. It is also not, as
written, a Playwright row: Playwright measures the running application, and the application has no
path that puts a session into `working` until phase 05.

The correction itself is well-grounded. `src/styles/theme.css:159-169` defines
`@keyframes pulse-dot` starting and ending at `opacity: 0.25`; `src/styles/globals.css` collapses
`animation-duration` to `0.01ms !important` for every element (`:123` at `7fc76c1`, `:136` in the
working tree after the parallel styling session moved the base rules into `@layer base` — the
reduced-motion block itself is unchanged and deliberately stays unlayered). Together they produce
exactly the dimmed settle that §11.3 follow-up 9 forbids. But the plan's perimeter
(`:37-43`) contains neither style file, and no task says where the override lands — component
variant, `globals.css`, or `theme.css`. Two of the three candidates are outside the declared
perimeter.

### R7 — The status note has no definition in V1 *(L7)*

"Status note" appears three times in the intention (`:550`, `:663`) and is never defined. Its only
concrete examples are `ui_design/03-agent-surface.md:56` ("Reading the transcript", "Pricing the
three seatings") and `ui_design/04-session-tabs.md:82` ("Pricing the three seatings") — prototype
narration produced by the fake `tabState` handlers that design 04's "Prototype-only" section and
§12A.3's Forbidden list both prohibit, and that standing rule 2 makes a standing perimeter. §12A.7
registers the note as derived from the session runtime record, but no rule maps the record to a
string.

C3(a) requires the note in the accessible name; C6(b) requires mutating its source to change it.
Neither is decidable. This is the one finding whose resolution is user-visible copy, which is why it
is card 1 rather than a plan amendment.

### R8 — The phase label's specified vocabulary is not the status function *(L8)*

`ui_design/03-agent-surface.md:56` gives five phase labels: `working`, `idle`, `created`, `N open`,
`ready to push`. Against six statuses this is one short (`empty` has none), one differently worded
(`ready to push`), and one — `N open` — that is a *count of open questions*, whose register source is
`proposition.unresolvedItems` (§12A.7 row 3), not the session record. If the phase label follows
design 03, it is a function of two sources and task 3's "two renderings of one call on one record" is
false. The contract wins under standing rule 6, but the plan does not say so and registers no delta.

### R9 — C6(b) names a surface that does not exist *(L9)*

`components/workspace/agent-surface.tsx:3-21` is the whole Agent Surface: a tab strip and two lines
of placeholder text. There is no header, no session count, and no header component anywhere in
`src/features/proposal-preparation/`. C6(b) names "the session count in the header" among the
register rows "whose surface exists in this phase", and the perimeter adds no header.

### R10 — C6(a) is two claims in one row, and the open half is unrelaxed by 18A *(L10)*

The first clause ("the register enumerates exactly §12A.7's rows") compares a hand-written module to
a hand-written expectation — a change-detector, which has value but proves no closure. The second
clause ("a value not in it is either server-returned, or one of the two stored values, or it does not
exist") is an absence claim over an **open** name universe, which standing rule 18A leaves needing an
allowlist and a probe planting a construct no denylist would contain. C6(c)'s probe targets (b), not
(a), so the open half ships uninstrumented. The plan's own Notes (`:143-146`) already recognise that
register completeness "is an authoring obligation, not a criterion" and that phase 15 owns the
closure check — the amendment is to mark the closure half held under §7.5, so it does not look
testable.

### R11 — C5(c)'s probe names an instrument it cannot redden *(L11)*

C5(c): "store the conjunction on the record, observe **the register check of C6** redden". The
register check is C6(a) — an enumeration comparison that storing a conjunction leaves untouched. The
row that bites is C6(b), and only if `attention` is among the rendered register rows it covers, which
it is. One word, but a named mutation that cites the wrong instrument is an unrun mutation with a
green ledger.

### R12 — C3(d)'s probe does not name its site *(L12)*

Charter rule 11 requires a named mutation to name file **and** site, because "store the computed
status" is ambiguous. If the stored field is read by exactly one of the two renderings, C3(c)
reddens as the plan expects. If both read it, they still agree and C3(c) stays green — the probe
passes for the wrong reason, which is the family charter rule 15 exists for.

### R13 — Task 7 has no criterion, and its ledger entry is not this phase's *(L13)*

Task 7 builds the debounced polite status announcement, and master plan §6.4:440 homes
`STATUS_ANNOUNCEMENT_DEBOUNCE_MS` in phase 04. No criterion covers it. §12A.17's announcement rule
anchors on **F24**, and §7.3:639 lists F24 as served by phases 02, 03, 06, 08, 11, 12, 13, 14 — not
04. The plan's `Serves` line does not claim F24. So the phase is directed to build a mechanism that
nothing measures and no ledger entry attributes to it; any test the implementer writes for it is an
orphan under standing rule 12. Separately, a status *change* requires an event this phase does not
have (see R5).

### R14 — §7.5's held row names phase 04 as its trigger and the plan converts nothing *(L14)*

Master plan §7.5:711 holds phase 03's C6(d) — "the Agent Surface's structure is not a function of the
active session" — with the named trigger "**phase 04 introduces derived tab status** and phase 14
introduces the second Main Application Surface state". Phase 03's plan marks the row held with the
same trigger and its criteria table reads "6 (5 measurable, 1 held)". §12A.23 words the invariant over
"result kind, status, or presented Main Application Surface state": phase 04 supplies the first two.
The same table's F8 row prescribes exactly what should happen — "phase 05's pre-dispatch lint converts
the three rows into phase-05 criteria and adds `05` to §7.3's F8 row". Phase 04's pre-dispatch lint
did not do the equivalent: the plan has no such criterion, and §7.3:645 still reads "F30 | 02, 03, 14".

### R15 — Two follow-ups land on this phase and neither is in the plan *(L15, L16)*

- **Follow-up 20** (`master-plan.md:1158`) re-assigns follow-up 16's repair to "phase 04, whose
  perimeter already includes source under the scanned trees". Verified still defective:
  `components/workspace/workspace.test.tsx:100` carries
  `(?:window\.)?location(?:\.hash)?\s*=`, which does not match `window.location.href = "/x"`. The
  justification holds — phase 04 adds source under `src/features`, which C5(b) at `:158` scans — but
  the plan carries no task, no criterion and no perimeter entry for `workspace.test.tsx`.
- **Follow-up 17** (`master-plan.md:1155`) lands on "the next phase that touches the reduced-motion
  evidence". C3(b) is that. `e2e/workspace.spec.ts:217` is still the sibling resting on Playwright's
  default context, which standing rule 19 names as the defect shape — "a criterion satisfied by a
  default it does not set cannot fail when the default moves".

### R16 — C5(d) is a geometry row with no runner, no constant, and no predicate *(L17)*

"Both legible at the strip's minimum tab width" is a position-and-size predicate. §10.3A is explicit
that jsdom performs no layout and returns hard-coded zeros, which "satisfy many predicates silently".
The minimum width is a Tailwind literal, `min-w-[112px]` at
`components/session-tabs/session-tab-strip.tsx:171` (`:168` at `7fc76c1`), not a named constant — so a criterion asserting
it would pin a literal, against charter rule 13. And "legible" has no stated meaning. Three separate
reasons the row cannot be written today.

### R17 — No criterion names its runner *(L18)*

Phase 03's plan carries four `**Runner:** …` declarations across seven criteria. Phase 04 carries
zero, in a phase with at least two rows (C3(b), C5(d)) that jsdom structurally cannot measure and one
(C6(b)) that spans both Vitest projects.

### R18 — The new status line has no parent *(L19)*

`components/agent/agent-status-line.tsx` is declared new at `plan:41`.
`components/workspace/agent-surface.tsx` is not in the perimeter, and nothing else renders an agent
header area. As written the component would be authored, tested in isolation, and never mounted —
which makes C3(c) ("two renderings of one call") and C6(b) unobservable in the application.

### R19 — Verified clean, recorded so no one re-checks

- **Vitest collection.** `vitest.config.mts:29-35,44` implements §10.3's partition by construction.
  `src/features/**/client/view-models/session-tab.test.ts` falls to the **node** project;
  `*.test.tsx` under the feature falls to **jsdom**. Standing rule 13's collection confirmation will
  pass. No `npx vitest list` run was needed to establish this.
- **Phase 03's tests do not constrain the accessible name.** `session-tab-strip.test.tsx` queries
  tabs with `getAllByRole("tab")` (`:25`) and never by accessible name; the only name-bound queries
  are the close button (`Close session New proposal session`) and the new-session button. Adding
  status text, note and unread to the tab's name breaks nothing — which is what makes L23 a free
  choice rather than a constraint.
- **The dot element already exists** at `session-tab-strip.tsx:247` (`:242` at `7fc76c1`), `aria-hidden`, `bg-…-fg-muted`.
  Phase 04 gives it colour and the pulse; it does not create it.
- **`ready` vs `created` in the accessible name** is decidable exactly as C3(a) claims: their status
  texts differ ("Ready" / "Created") in both §6.3 and §12A.3, so the merge recorded at the
  pre-dispatch lint is sound. Separately, `ui_design/04-session-tabs.md:77` labels `ready` as
  "Ready to push"; the contract wins, and that delta is L20.

## 5. Trace verification, both directions

Per master plan §7.4.

**Forward — every row's anchor resolves and supports what the row asserts.**

| Criterion | Trace cell | Anchor | Admissible | Supports the row |
|---|---|---|---|---|
| C1 | `F10 · §12A.3` | F10 | yes (ledger ID) | yes — F10 names the six-row precedence and the status text in the accessible name |
| C2 | `F10 · §12A.3` | F10 | yes | yes — F10 names "all seven overlaps resolved" |
| C3 | `F10 · F6 · §12A.3 · §12A.7` | F10 | yes | yes; F6 supports (a) and (b) ("no state is colour-only; reduced motion is honoured") |
| C4 | `F11 · §12A.4` | F11 | yes | yes — F11 is the increment/clear invariant verbatim |
| C5 | `F11 · F14 · §12A.4` | F11 | yes | yes — F11's second clause is "attention is `unread > 0` on a non-active tab and is stored nowhere" |
| C6 | `F14 · §12A.7` | F14 | yes | yes — F14 is the register invariant verbatim |

No row anchors on an architecture contract, so §7.4's enumerated-exception list is not engaged. All
six cells are admissible.

**Reverse — every entry the phase claims is served, and every obligation it carries is claimed.**

- Claimed in the plan header: F10 · F11 · F14 · F6. F10 → C1, C2, C3. F11 → C4, C5. F14 → C5, C6.
  F6 → C3. **All four served.**
- §7.3 lists phase 04 under F10, F11, F14 and F6. Consistent in that direction.
- **Two unserved obligations**, both findings:
  - **F24** — task 7 implements §12A.17's announcement rule, which anchors on F24. No criterion row
    carries it and §7.3:639 does not list 04 under F24 (R13, L13).
  - **F30** — §7.5:711 names phase 04 as a converting trigger for phase 03's held C6(d); no row
    converts it and §7.3:645 does not list 04 under F30 (R14, L14).

**Counts, re-derived at source** (charter manifest property 3, standing rule 11): criteria header
reads 6; the table carries C1 6 · C2 8 · C3 5 · C4 8 · C5 4 · C6 3 = **34**, matching the
derived-totals line; named mutations listed C2(h), C3(d), C4(h), C5(c), C6(c) = **5**, matching. The
plan's arithmetic is correct as it stands. It changes if L4, L5, L9, L10, L13, L14 or L15 are routed.

## 6. Gate check result

| # | Check | Result |
|---|---|---|
| 1 | Intention ratified | **PASS** — `intention/frontend-core-intention.md:5` Status begins `RATIFIED` |
| 2 | No open owner decision | **PASS** — `:1204` reads "Ratified owner decisions (0 open)"; the Status line's final clause confirms "no owner decision is open" |
| 3 | Predecessor approved | **PASS** — `master-plan.md:10`, row 03 State cell reads `APPROVED` |
| 4 | Phase unstarted in both places | **PASS** — `master-plan.md:11` row 04 reads `NOT_STARTED`; `plans/phase-04-derived-presentation.md:5` reads `NOT_STARTED`. They agree |
| 5 | Plan agrees on counts | **PASS** — Criteria `6`; rows sum to `34`; derived-totals line states `5 named mutations` and lists five |
| 6 | Phase genuinely unimplemented | **PASS** — neither `src/features/proposal-preparation/client/` nor `components/agent/` exists |
| 7 | Round genuinely outstanding | **PASS** — `handoffs/reviewer/` contained only `.gitkeep` at session start |

No gate failed; the session proceeded.

## 7. Write perimeter

**Documents written — one, this file:**
`build_docs/under_constroction/frontend_core/handoffs/reviewer/phase-04-projection-round-0.handoff.reviewer.md`

**Commands run** — all read-only: `pwd`, `git branch --show-current`, `git rev-parse HEAD`,
`git status --porcelain`, `git diff --stat 2630f5b..HEAD -- …`, `git diff --name-only 2630f5b..HEAD`,
`git diff --stat`, `git diff <path>`, `git show 7fc76c1:<path>`, `ls`, `find`, `wc -l`, `cat`,
`sed -n`, `awk`, `grep` — plus one `perl -i` pass over **this handoff only**, to correct three of its
own line citations after the parallel styling session shifted them.

**Tree identity:** `7fc76c13ddbcd71d7a8af83121c4ff1e9228fa51`, `git status --porcelain` **empty at
session start**. `git diff --name-only 2630f5b..HEAD` returns four documents under `build_docs/` and
**no file under `src/`, `e2e/`, `vitest.config.mts`, `playwright.config.ts` or `package.json`** — so
the committed tree carries phase 03's approval stamp (unit 184/184, E2E 69/69, typecheck, lint, build
green) unaltered.

**The working tree changed under this session, and not by me.** By session close
`git status --porcelain` reads:

```
 M next-env.d.ts
 M src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx
 M src/styles/globals.css
 M tsconfig.tsbuildinfo
?? .../handoffs/reviewer/phase-04-projection-round-0.handoff.reviewer.md
```

Only the last is mine. The four modified files are the parallel styling session the prompt's §5
anticipated — `tsconfig.tsbuildinfo` and `next-env.d.ts` are that session's build artefacts, not
mine: I ran no build, no typecheck and no suite. I inspected that diff **only** to decide whether it invalidated anything I had already
read, and it does not: it moves `globals.css`'s base rules into `@layer base` while leaving the
reduced-motion block byte-identical and deliberately unlayered, and it restyles the tab wrapper, dot
size, close button and new-session button. It adds no pulse, no status derivation, no reduced-motion
component rule and no named constant. Every finding above stands, and I judged the plan, not that
diff. Where a citation moved I give both line numbers, the committed one tagged `7fc76c1`.

**Explicit statements:**
- No code changed **by me**; the three modified source files are another session's and I did not
  touch, revert or stage them.
- No plan, intention, contract or design specification was edited.
- No dependency was installed.
- No suite, build, or end-to-end run was taken. **L4 budget: zero, spent zero.** No `npm test`,
  `npm run build`, `npm run test:e2e`, `npm run typecheck` or `npm run lint`. No `npx vitest list` was
  needed — `vitest.config.mts`'s include/exclude globs settled the collection question at source, and
  no "narrower evidence insufficient because…" line was required, because none was written.
- No `node_modules/` inspection was needed this round; §10.3A already carries the grounded jsdom
  findings at file and line, and I cite them rather than re-measuring them.
- The sibling backend worktree `/Users/davidloorenz/Desktop/Developer/Proposales` was never entered.
- `build_docs/future_implementations/` was not touched.
- No skeleton is attached; per doctrine it is discarded.
- The Review log line and both `State` cells are left for the coordinator. Nothing was committed.
