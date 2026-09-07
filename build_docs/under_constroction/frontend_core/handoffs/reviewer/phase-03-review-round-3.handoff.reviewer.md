---
plan: plans/phase-03-session-runtime-and-tabs.md
role: review
round: 3
verdict: CHANGES_REQUESTED
date: 2026-09-07
actor: Claude (Opus 5)
---

# Phase 03 review round 3 — first review

**Verdict: `CHANGES_REQUESTED`.**

The phase is built, not scaffolded. The session runtime, the strip, the reveal arithmetic and
the browser evidence all exist and behave correctly on every path I attacked directly — the
close table's four cases, the reorder table's four cases, the whole key map including the keys
no test touches, the drag-activation suppression, and the landmark identity all hold at source
and under interaction. The 42 measurable rows all have tests, all 25 test declarations name a
row, and there are **no orphan tests** — the first phase in this project where the trace chain
closes in both directions on the first try.

What fails is the **measurement layer**, and it fails in one repeated shape: a guard that
cannot observe the defect it was written for. Six blocking findings, four of which are that
shape. Only one of the six is a behavioural defect (B3) — and it is a real one, in a ratified
table.

## ⚠ OWNER DECISIONS REQUIRED (1)

**Card 1 — should every session's close button be its own stop in the keyboard tab order?**

*Story.* You have eight proposal sessions open. You press Tab from the top of the page to
reach the divider between the two panes. Today you pass through the first session's close
button, then the second's, then the third's — eight small "×" buttons — before you get there.
Each one, if you press Space by reflex, closes a session with no confirmation and no undo.
With one session open, which is how the app loads, you would never notice.

*Branches.*
- **Keep as is** — every close control is a separate tab stop; the number of stops in the
  shell grows with the number of open sessions, and a mis-keyed Space destroys a session.
- **Reach close from the tab itself** — Tab lands once on the strip; Delete or Backspace on
  the focused session closes it (this already works today), and the close button is taken out
  of the tab order while staying clickable and visible.

*Recommendation.* The second — it is the standard tabs behaviour, it keeps the shell's tab
order constant regardless of how many sessions are open, and it removes the mis-key hazard;
the keyboard close it relies on is already implemented and already tested.

*On silence.* The gate holds: this is written up as should-fix S3 and the phase is not
approved either way, but the fix round will be told to keep the current behaviour unless you
answer.

*Trace.* intention §12A.5 (owner decision 15's close affordance), design 04 §4.5, §5;
plan C5(d); the five re-baselined phase-02 tab-order instances.

---

## Adjudication of the four established findings (§4 of the prompt)

All four **confirmed**. Routing is correct in every case; I did not repeat the experiments.

**B1 — C5(c)'s named mutation certifies a string.** Confirmed at source, and the structural
half is stronger than the finding states. The trigger's own `onKeyDown`
(`session-tab-strip.tsx:211–243`) handles `ArrowLeft`/`ArrowRight`/`Home`/`PageUp`/`End`/
`PageDown`, clamps with `Math.max(0, index - 1)` / `Math.min(sessionIds.length - 1, index + 1)`
and calls `stopPropagation()` **and** `preventDefault()`. Radix composes the roving-focus
item's handler through `composeEventHandlers`, which skips its own handler when
`event.defaultPrevented` is already true — and with `asChild`, the child's handler runs first.
So `RovingFocusGroup` never evaluates the key, and `loop` never participates on *any* path,
including `ArrowUp`/`ArrowDown` (those reach the group but are filtered out at horizontal
orientation before `loop` is read). `loop={false}` is inert in this composition, not merely
unproven.

**The prompt's actual question — what the correct instrument is.** Standing rule 19 wants a
mutation proving an explicit configuration is load-bearing. It cannot be met while the
configuration is inert, so the row has two honest resolutions and the fix round must pick one,
not paper over it:

1. **Make the configuration load-bearing.** Delete the clamps and the `stopPropagation()` for
   `ArrowLeft`/`ArrowRight` and let `RovingFocusGroup` own horizontal movement, keeping the
   hand-rolled handler only for `Delete`/`Backspace` and the reorder chord. Then
   `loop={false}` is the mechanism, removing it wraps, and the two no-op assertions redden —
   rule 19 met in its own terms, and S1 dissolves with it.
2. **Own non-wrapping in this application and say so.** Keep the clamps, **delete
   `loop={false}` and the source-string assertion**, and re-author C5(c) to name the clamp as
   the mechanism, with a named mutation on the clamp (below). Rule 19 then does not apply,
   because no dependency default is being relied on.

Either way the source-string assertion goes; a row that certifies a string a comment would
satisfy is the defect, not the fix. **Recommendation: option 1** — it is what task 3 actually
mandated, and it retires S1, B1 and half of S5 in one change.

**B2 — C3(i)'s gate guard is an occurrence-count proxy.** Confirmed. Both halves are broken
exactly as reported: `/function|const\s+closeSessionAtGate/` alternates on the bare word
`function`, and `strip.match(/\bcloseSession\(/g)` counts occurrences in **one file**, so any
removal path in any other module — or an alias in the same one — is invisible.
Worth stating plainly for the fix round: **the production code is correct today.** There is
exactly one `closeSession` call site in the feature (`session-tab-strip.tsx:140`), reached
only through `closeSessionAtGate`, from both the keyboard close and the button close. B2 is a
finding against the instrument, not against the gate.

**S1 — the primitive's mechanics are replaced, not composed on, and undeclared.** Confirmed,
and broader than the finding states. Not only activation (`activationMode="manual"` plus a
hand-written `onFocus`) and the key map: the **roving tabindex is hand-rolled too**
(`tabIndex={sessionId === activeSessionId ? 0 : -1}`, line 203), so what the foundation
supplies in this composition is the `tablist`/`tab` roles, `aria-selected`, `data-state`, the
`aria-controls` wiring and `Tabs.Content`. That is a legitimate use of a primitive, but it is
not what task 3 asked for and the reason is recorded nowhere. See B1 option 1.

**S2 — the evidence budget was exceeded without the authorization line.** Confirmed from the
handoff's own account (baseline, an intermediate unit run, a first post-correction full E2E
run, a second full E2E run, the closing stamp). No "narrower evidence insufficient because …"
line appears anywhere in the handoff or the Review log.

---

## Blocking findings

### B3 — closing a focused background session silently switches the active session

**New. The only behavioural defect in the phase, and it is in a ratified table.**

*Authority.* intention §12A.5, close table row 1: *"close a non-active tab | Newly active
session: **unchanged** | Focus destination: unchanged, unless focus was inside the removed
tab; then the tab now at the removed index, clamped to the last index."* Ledger F12. Plan
row C3(a).

*What is wrong.* `session-tab-strip.tsx:210` activates on **every** focus event
(`onFocus={() => activateSession(sessionId)}`). Closing a non-active tab whose close control
holds focus schedules a focus repair (`requestFocusAfterCommit({ kind: "index", index })`,
line 138), and the layout effect at line 75 then calls `.focus()` on the tab now at the
removed index — which fires `onFocus`, which activates that session. The close table's first
column is violated on the exact path owner decision 15 was ratified to make producible.

*Proved by mutation-free interaction*, three sessions, active = the third, focus on the first
tab's close control, click: the active session id changes from the third session to the
second. Expected unchanged.

*Why no test caught it.* `session-tab-strip.test.tsx:69–77` (`C3(a,f)`) asserts only the focus
half — `document.activeElement` is the tab at the old index — and never reads
`activeSessionId`. The row's primary clause has no assertion anywhere in the phase.

*Correction (verbatim for a fix round).* Activation must follow focus only for focus the user
moved, never for a focus repair the close performed. Give the close path a way to say so —
for example, set a "repairing focus" ref before `focusTab` in the layout effect and have
`onFocus` return early while it is set, clearing it after — so that closing a non-active tab
leaves `activeSessionId` untouched. Then extend `C3(a)`'s test to assert **both** clauses:
`activeSessionId` is identical before and after, and focus lands on the tab at the removed
index. Add the named mutation `remove the repair guard so the close-induced focus activates
its tab; C3(a)'s active-session assertion must redden`. §12A.17's row "a session is activated
because another was closed → the newly active tab" governs only the case where the **closed**
session was the active one; it does not license activation here.

### B4 — C1(b) cannot detect the forbidden generator it was re-authored to catch

**New.**

*Authority.* intention §12A.1 (a page-lifetime session id is never derived from a module-level
mutable counter, a tab array index, or a thread position); master plan standing rule 17;
plan C1(b), re-authored by projection F1 for exactly this purpose.

*What is wrong.* The allowlist's AST scan is scoped to the `createSessionRecord` function
declaration (`use-workspace-session-store.test.ts:34–46`) and asserts its call set equals
`["createSessionId()"]`. The generator's own body — one layer below the assertion's node — is
constrained only by a two-spelling **denylist**,
`/let\s+(?:sessionSeq|counter)|sessionIds\[[^\]]+\]\s*as/` (line 47), which is precisely the
shape standing rule 17 forbids, plus a source-string check (line 48) of B1's family.

*Proved by mutation.* Replacing the body of `createSessionId` with

```ts
let seq = 0;
function createSessionId(): WorkspaceSessionId {
  seq += 1;
  return `session-${seq}` as WorkspaceSessionId;
}
```

leaves **every test in `src/features/proposal-preparation` green** — 52 passed, 0 failed. A
module-level mutable counter, named in §12A.1's forbidden list, ships undetected. (A second
mutant deriving the id from `sessionIds.length` inside the same function also passes C1(b),
though it is caught behaviourally by C3(g)'s reuse assertion — a counter is not, because a
counter never reuses.)

*Correction.* Scope the allowlist to the module's **id-producing region**, not to
`createSessionRecord` alone: enumerate, over the whole store source, every expression that can
reach a `WorkspaceSessionId` — the `as WorkspaceSessionId` assertion sites and the call set
reachable from them — and assert that set equals the one permitted generator call. Delete the
`let sessionSeq|counter` denylist and the `toContain("const id = createSessionId();")` string
check. Re-point C1(b)'s named mutation at the **generator's own body** (`introduce a
module-level counter inside createSessionId; C1(b) must redden`), because a mutation planted at
the construction site proves only that the construction site is scanned.

### B5 — task 8's inherited repair was not implemented and not declared

**New.**

*Authority.* Plan task 8 and master plan §11.3 follow-up 16, which names this phase by number:
*"Widen the pattern to the row's own words and prove the repair by planting
`window.location.href = "/x"` in `src/app/page.tsx`, observing the red, and reverting."*
Charter rule 14 (an unimplemented quoted correction is declared with its reason).

*What is wrong.* `workspace.test.tsx` is not in the checkpoint's sixteen-file diff at all, and
line 100 still reads
`expect(source).not.toMatch(/history\.(?:pushState|replaceState)|(?:window\.)?location(?:\.hash)?\s*=/)`.
The hole phase 02's approval gate found is open, follow-up 16 is still listed as unresolved in
master plan §11.3, and the handoff does not mention the task. The nearest other scanner
(`C6(c)`, line 169) reads only the idle-surface file and does not cover `src/app`.

*Correction.* Perform task 8's repair as written: widen `workspace.test.tsx:100` to the row's
own words so an assignment through any property of `location` matches, plant
`window.location.href = "/x"` in `src/app/page.tsx`, record the observed red in the ledger,
revert, and close follow-up 16 in master plan §11.3. If the repair is genuinely out of reach,
say which part and why (charter rule 14) rather than omitting it silently.

### B6 — C4's three absence allowlists are bypassed by two ordinary constructs, and C4(f)'s probes planted denylist-shaped defects

**New.**

*Authority.* Master plan standing rule 17 — *"every open-universe absence row is instrumented
as an allowlist, and **its probe plants a construct no denylist would contain**"*; plan task 6
and criterion row C4(f).

*What is wrong.* The instruments (`reveal-active-tab.test.ts:32–81`) collect only
`ts.isPropertyAccessExpression` nodes and key on the literal object text `"document"` /
`"window"`. Two everyday constructs escape all three rows: **computed member access**
(`el["scrollIntoView"]()`, `doc["querySelector"](…)` are `ElementAccessExpression`, never
collected) and **`globalThis`** (`globalThis["innerWidth"]`, `globalThis.document` — the object
text is neither `document` nor `window`; the store already uses `globalThis.crypto`, so the
spelling is native to this codebase).

*Proved by mutation.* Planting all three forbidden mechanisms inside `revealActiveTab` at once —

```ts
const doc = globalThis["document"];
const found = doc["querySelector"]('[role="tab"][aria-selected="true"]');
(found as HTMLElement | null)?.["scrollIntoView"]({ block: "nearest" });
const w = globalThis["innerWidth"];
```

— leaves `reveal-active-tab.test.ts` fully green, 8/8. C4(c), C4(d) and C4(e) all pass with a
document query, a `scrollIntoView` and a render-path viewport read live in the file.
The three C4(f) probes the round ran planted `tab.scrollIntoView()`,
`document.getElementById` and `window.innerWidth` — plain dotted spellings, which is exactly
what a denylist contains, so the probe clause of rule 17 was not met.

*Correction.* Widen the scan to cover `ts.isElementAccessExpression` with a string-literal
argument (treating `x["foo"]` as the member `foo`) and add `globalThis` to the object names
C4(d) and C4(e) constrain. Give C4(e) its own subject assertion (standing rule 18) — it
currently asserts `toEqual([])` over a filter that can be empty for the wrong reason. Then
re-run C4(f)'s three probes with the constructs above, which no denylist would contain, and
record those reds in the ledger.

---

## Should-fix findings

**S3 (extends the established S3) — the shell's tab-stop count grows with the session count.**
Confirmed and quantified: every tab's close control is a `<button>` with default tabindex, so
the strip contributes **N + 2** tab stops for N sessions (one roving trigger, N close controls,
the new-session button). Measured in jsdom with four sessions: 6 stops. The re-baselined
phase-02 instances (+3 presses) are correct only because the application loads with exactly one
session, and no criterion states that. The three added readiness waits are the other half of the
same finding and are defensible but undeclared. *Correction:* resolve owner card 1 first; then
either add a criterion row stating "the strip contributes exactly three tab stops, independent
of session count" and take the close controls out of the tab order, or — if the owner keeps the
current behaviour — state in a row that the shell's tab order is a function of the open-session
count and re-baseline the phase-02 instances against a fixture that pins the count. Declare the
readiness waits in the Review log as a deviation with their reason (charter rule 14).

**S4 (extends the established S4) — fused browser tests, and one that can pass vacuously.**
Confirmed. Additionally: `session-tabs.spec.ts:64–66` puts C5(g)'s only assertion inside
`if (titleBox && titleBox.width < scrollWidth)`, so the row passes silently whenever the title
does not elide — standing rule 18's shape in a Playwright test. And `expectActiveTabVisible`
never asserts the strip is actually overflowing, so C4(b) would pass on a strip that never
scrolls. *Correction:* split C5(e), C5(f) and C5(g) into three tests; make C5(g)'s elision a
precondition the test **asserts** rather than branches on; add `scrollWidth > clientWidth` as a
subject assertion in `expectActiveTabVisible`; split C4(b)'s five operations into five tests or
five `test.step`s with independent expectations.

**S5 — C5(c)'s key map is sampled, not enumerated (charter rule 2).** `Home` is never pressed
at all. `End` is pressed only on the tab that is already last, where the handler's own
`targetIndex !== index` check makes it a no-op — so the row's "End and PageDown jump to the
last" clause is never observed. `ArrowUp` is never pressed; only `ArrowDown` is. I verified by
probe that all three behave correctly, so this is an instrumentation gap, not a defect.
*Correction:* press `Home` from a non-first tab, `End` from a non-last tab, and both `ArrowUp`
and `ArrowDown`, each asserting its own exact destination, and give the two no-op rows their
own named mutation once B1 is resolved (`replace Math.min(sessionIds.length - 1, index + 1)
with index + 1 and Math.max(0, index - 1) with index - 1; the two no-op assertions must
redden`).

**S6 — C2(e) is discharged by a test that cannot fail, and its second half has no test.**
`use-workspace-session-store.test.ts:74–90` calls the same `move` function twice with the same
`(0, 2)` on the same restored state and asserts the two results are equal — an identity that
holds for any function whatever. The row's other half — *"the DOM drag handler is asserted
separately to call it with the indices the drag implies"* — has no test in the repository; the
plan's coverage map named a `drag handler ›` jsdom test that was not written. *Correction:*
assert that the pointer adapter (`onDragOver`, `session-tab-strip.tsx:182–187`) and the keyboard
adapter (the reorder chord, `:211–219`) both call **one** move function, by spying on
`moveSession` and comparing the recorded `(i, j)` argument pairs; and add the drag-handler test
asserting `onDragOver` on index `j` while `draggedIdRef` holds the id at index `i` calls
`moveSession(i, j)`.

**S7 — C6(a)'s sequence contains no reorder, and its render-recording probe was not built.**
`session-tab-strip.test.tsx:174` fires `keyDown` with `key: "Control"`, which matches neither
arm of the handler, so the "reorder" step of the sequence is inert — proved: the ordered list is
byte-identical before and after. The row requires *"a sequence containing at least one
activation, one creation, one close and one reorder"*, and additionally *"a render-recording
probe that collects both counts on each commit"*; the shipped test asserts only after each
operation. *Correction:* fire `{ key: "ArrowLeft", ctrlKey: true, shiftKey: true }` and assert
the list actually changed before asserting the landmarks; add the per-commit recorder the row
names (a component rendered inside the workspace that pushes both counts on every render) and
assert every recorded pair is `(1, 1)`.

**S8 — C2(d) exercises one guard, not two (charter rule 2).** The single call
`moveSession(-1, 10)` short-circuits on `fromIndex < 0`, so the `toIndex >= length` branch is
never reached. I verified by probe that it is implemented correctly. *Correction:* one case row
per boundary — a valid source with `toIndex = -1`, and a valid source with
`toIndex = sessionIds.length` — each asserting list reference identity.

**S9 — C2(b)'s two named clauses are untested.** The row requires the active id to be
unchanged *"including when the moved tab is the active one, on the pointer path as well as the
keyboard path"*. The store test moves index 0 while index 2 is active, so the moved tab is
never the active one, and no pointer-path assertion exists (S6). Both behave correctly under
probe. *Correction:* add a case moving the active tab, and assert the pointer adapter's call
through the spy S6 introduces.

**S10 — the strip is rendered at the bottom of the Agent Surface.** `agent-surface.tsx` places
`<SessionTabStrip />` after the idle content. Design 04 §1 and §2 put the strip *"at the top of
the agent pane"*, and design 03 §2's structure lists Session Tabs second, above the thread.
This is an undeclared deviation, not a recorded delta (master plan §11.2 has no row for it,
standing rule 7). *Correction:* render the strip as the Agent Surface's first child, above the
idle block; or, if there is a reason to keep it low, record it as a design delta in §11.2 with
that reason.

**S11 — the server-rendered document contains an empty `role="tablist"`.** The initial session
is created in a post-mount effect (`session-tab-strip.tsx:60–65`), so the server-rendered markup
is `<div role="tablist" aria-label="Agent sessions" tabindex="-1"></div>` plus a "New session"
button that does nothing — verified by rendering `AgentSurface` to static markup. A `tablist`
that owns no `tab` is an ARIA structural violation, the strip's only control is inert before
hydration, and this is the product fact that forced S3's three readiness waits. The
`complementary` landmark itself is present server-side and is the same element after hydration,
so §12A.23 is not violated. *Correction:* seed the store's initial state with one session at
module scope (`createWorkspaceSessionState()` already builds exactly that and today has only
test callers), so the first render — server and client — has one tab; or render nothing at all
until a session exists rather than an empty tablist. Then give the fact a criterion row: "the
first rendered document contains at least one tab" — which also retires the readiness waits.

---

## Notes

- **N1 — every `aria-controls` points at an `aria-hidden` element.** The `forceMount`ed
  `Tabs.Content` panels render with `role="tabpanel"`, no `hidden` attribute, `tabindex="-1"`,
  `aria-hidden="true"` and `sr-only`; measured: three panels present, **zero** reachable in the
  accessibility tree. They add no landmark and are 1px wide, so phase 02's frozen
  `C4(<width>-2)` holds on both halves. Task 3 delegated the construction and this is a
  defensible reading of it, but it trades a dangling `aria-controls` for one resolving to an
  element assistive technology cannot see. Worth a decision when phase 04 gives the tabs real
  content.
- **N2 — the "node runner" claims are false, and the plan asked for something unreachable.**
  `use-workspace-session-store.test.ts` lives under `hooks/`, which master plan §10.3's
  partition rule (encoded in `vitest.config.mts`) claims for the **jsdom** project. Every
  criterion cell naming "Vitest `node`" for a store row, and the thirteen "node runner" cells in
  the handoff's coverage map, are inaccurate. Contract 11 §3's actual requirement — a feature
  store's transitions asserted directly, without rendering — **is** met. Lesson for the plans:
  §6.1 puts the store under `hooks/` and §10.3 sends `hooks/` to jsdom, so no plan can require
  a node runner for it.
- **N3 — `createWorkspaceSessionState` is a production export with only test callers.** Not a
  charter rule 4 violation (rule 4 runs the other way), but it is a test seam living in
  production code. S11's correction would give it a production caller.
- **N4 — `reveal-active-tab.ts:1` imports `ACTIVE_TAB_REVEAL_MARGIN_PX` and never uses it.**
  The margin arrives as a parameter. Dead import.
- **N5 — C3(e) passes vacuously on an empty subscription.** `transitions.every(…)` over an
  empty array is `true`, so the row survives a `closeSession` that does nothing. One line
  (`expect(transitions.length).toBeGreaterThan(0)`) closes it (standing rule 18).
- **N6 — C4(a)'s five case labels are cosmetic.** The geometries are sound and the arithmetic
  is right for all five, but nothing ties the "switch" row to a switch, and the first case
  exercises only the already-in-view branch.
- **N7 — master plan §11.2's three new design-04 rows are appended after a blank line**, so
  they render as a second, headerless table and carry no register numbers.
- **N8 — the close control is permanently visible on every tab**, not revealed on hover and on
  keyboard focus as intention §12A.5 (owner decision 15) and design 04 §3.2 word it. It is a
  superset of reachability, so nothing is unreachable; it is also the cause of S3.
- **N9 — one test is labelled for a case it does not exercise.**
  `session-tab-strip.test.tsx:46–57` is titled `C2(c)-ii, C2(c)-iii: same-index reorder` but
  presses the reorder chord on the **first** tab, producing `toIndex = -1` — C2(d)'s
  out-of-range case, not C2(c)'s same-index case. The same-index case is covered by the
  pure-function test above it, so the row is not uncovered; the rendered case is unobserved.

---

## What I verified correct

Reported specifically, so the re-review is cheap.

- **The trace chain closes both ways.** 25 test declarations (29 tests, `C4(a)` being
  `it.each` × 5), every one naming a criterion row; **no orphan tests** — a first for this
  project. 42 measurable rows covered, 4 held rows correctly held with their §7.5 triggers, no
  row silently dropped.
- **The close table is behaviourally right in three of its four rows**, and the fourth (B3) is
  right on its focus clause. Active-middle → same index; active-last → new last; sole tab →
  atomic replacement created before removal, in one `set`, with focus on the replacement; focus
  never lands on the body.
- **The reorder table is behaviourally total.** Moving the active tab preserves the active id
  (probed); a target past the last index is a no-op (probed); same-index writes nothing, focuses
  nothing and announces nothing; the keyboard move keeps focus on the moved tab and announces
  its position.
- **The whole key map is behaviourally correct**, including the three keys no test presses
  (`Home` from a non-first tab, `End` from a non-last tab, `ArrowUp`) — probed directly.
- **Drag activation is genuinely suppressed.** `onMouseDown={(e) => e.preventDefault()}` on the
  trigger defeats Radix's `mousedown` activation through `composeEventHandlers`'
  `defaultPrevented` check — the mechanism projection F4 asked for, correctly located.
- **The close gate is structurally single today.** One `closeSession` call site in the feature,
  reached only through `closeSessionAtGate`, from both the button and the `Delete`/`Backspace`
  path. Phase 05 has the single insertion point the plan wanted.
- **C4(a)'s arithmetic is correct on all five geometries** and asserts
  `ACTIVE_TAB_REVEAL_MARGIN_PX`'s contract, never the literal `8` (charter rule 13).
- **C4(c)/(d)/(e) are real `ts.createSourceFile` member-access allowlists** with a subject
  assertion on the file set and a genuine one on C4(d)'s accesses — materially better
  instruments than phase 02's, and bounded only by B6's two escapes.
- **The frozen phase-02 perimeter held.** `git show 5f34897 -- e2e/workspace.spec.ts` changes
  exactly the five permitted instances and adds only tab presses and readiness waits; no
  assertion was weakened, deleted or re-baselined beyond the permitted set;
  `workspace.test.tsx` is untouched (which is also B5).
- **Both halves of the frozen `C4(<width>-2)` hold.** The horizontal scroller is the tablist
  itself, carrying the literal `overflow-x-auto`; every div in the pane stays within pane width,
  including the `sr-only` panels.
- **`data-elided` and `aria-label` sit on the inner title span**, not on the tab, exactly as
  C5(g) and projection F7 require.
- **`rounded-t-lg` is token-correct.** `--radius-lg` is `9px` in `src/styles/theme.css`, which
  is design 04 §3.1's value; the closeout swap away from `rounded-t-[9px]` changed no pixel and
  removed an arbitrary literal.
- **Write perimeter reconciles.** Sixteen files in the checkpoint, every one declared in the
  handoff, nothing undeclared.

---

## Evidence records

Tree identity for every record below: **HEAD `c654eca`, `git status --porcelain` empty.**
`git diff 5f34897..HEAD -- . ':(exclude)build_docs'` is **empty**, so the code tree is
byte-identical to checkpoint `5f34897` and the implementer's closing stamp is valid for it.

| # | Hypothesis | Scope | Command | Result |
|---|---|---|---|---|
| 0 | The round's closing stamp (183/183 unit, 69/69 E2E, typecheck, lint, build) is valid for my tree | — | **cited, not re-run** | tree matches `5f34897` |
| 1 | Closing a focused non-active tab leaves the active session unchanged | L1 | `npx vitest run …/__reviewer-probe.test.tsx` | **RED** — active id changed (B3) |
| 2 | `Home`, `End` from a non-last tab, and `ArrowUp` behave as C5(c) states | L1 | same file | GREEN — behaviour correct, untested (S5) |
| 3 | The strip's tab-stop count is independent of session count | L1 | same file | **6 stops at 4 sessions** — N + 2 (S3) |
| 4 | C6(a)'s "reorder" keypress reorders | L1 | same file | **RED** — list unchanged (S7) |
| 5 | Moving the active tab preserves the active id | L1 | same file | GREEN — untested (S9) |
| 6 | A move past the last index is a no-op | L1 | same file | GREEN — untested (S8) |
| 7 | Three `forceMount`ed panels, none in the accessibility tree | L1 | same file | 3 present, 0 reachable (N1) |
| 8 | The server-rendered document has an empty tablist | L1 | `renderToStaticMarkup(<AgentSurface />)` | confirmed (S11) |
| 9 | An id derived from `sessionIds.length` inside `createSessionId` reddens C1(b) | L1 mutant | `npx vitest run use-workspace-session-store.test.ts` | C1(b) **GREEN**; C2/C3(g)/C7 red (B4) |
| 10 | A module-level counter inside `createSessionId` reddens anything | L1 mutant | `npx vitest run src/features/proposal-preparation` | **52/52 GREEN** (B4) |
| 11 | Computed member access + `globalThis` reach the three forbidden mechanisms | L1 mutant | `npx vitest run reveal-active-tab.test.ts` | **8/8 GREEN** (B6) |

**L4 budget used: zero.** No full-suite run was taken; the tree matched the stamp and every
hypothesis above was answerable at L1, so no authorization line was owed or written.

---

## Mutation-probe declaration

Three files were touched by probes; **all reverted**, and `git status --porcelain` is empty at
the time of writing, which is the byte-identity proof.

| File | Probes applied | State |
|---|---|---|
| `src/features/proposal-preparation/hooks/use-workspace-session-store.ts` | 2 (length-derived id; module-level counter) | reverted from a pre-probe copy; tree clean |
| `src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx` | 1 (computed-access document query, `scrollIntoView`, `globalThis` viewport read) | reverted from a pre-probe copy; tree clean |
| `src/features/proposal-preparation/components/session-tabs/__reviewer-probe.test.tsx` | created for probes 1–8 | **deleted**; no longer present |

No database, no external service, no `.next/` or generated artefact was written by this
session. Scratch copies were held outside the worktree and removed. No architecture graph
exists in this repository, so there is **no graph delta**.

---

## Full write perimeter

This session wrote exactly two files, both pipeline records:

1. `build_docs/under_constroction/frontend_core/handoffs/reviewer/phase-03-review-round-3.handoff.reviewer.md` (this file, new)
2. `build_docs/under_constroction/frontend_core/master-plan.md` — the phase-03 tracker row only

No production code, no test, no plan file, no Review log (the prompt reserves the Review log
and the routing for the coordinator), no other tracker row, no configuration, no dependency.

---

## Lessons for the plans

1. **A row with two clauses needs two assertions, and the review should be able to see which
   one is missing.** C3(a) carries "active unchanged" *and* "focus lands at the removed index";
   the test asserted only the second, and the first turned out to be false. Plans that write a
   compound row should split it into sub-rows the way C2(c) was split, or state which assertion
   discharges which clause.
2. **An allowlist is only as wide as the node type it collects.** Standing rule 17 says
   "allowlist, not denylist", and three instruments obeyed it and were still bypassed — by a
   node type (`ElementAccessExpression`) and an object name (`globalThis`) nobody enumerated.
   Rule 17 should say what an allowlist is scoped *over*: the set of syntactic forms that can
   reach the forbidden capability, not the set of names that usually spell it.
3. **A source-scanning row should name the region it scans.** C1(b) said "the module that mints
   an id" and the implementer read that as one function; §12A.1's forbidden constructs live one
   layer below. Rule 17's companion could require the scan's region to be stated as a rule
   ("every expression reaching type X"), not as a symbol.
4. **§6.1's file location and §10.3's runner partition jointly determine the runner** — a plan
   cannot name one independently (N2). The next plan touching a feature store should derive the
   runner cell from the partition rule rather than typing it.
5. **Standing rule 19 needs a reachability clause.** C5(c) configured the dependency default
   explicitly, exactly as rule 19 asks, and the configuration was inert because the composition
   never consults it. "Configure it explicitly and assert the configuration" should read
   "configure it explicitly, and prove by mutation that the **behaviour** changes when the
   configuration is removed" — an assertion on the configuration's spelling can never do that.
6. **A phase that inherits a follow-up should carry it in its acceptance criteria, not only in a
   task.** Follow-up 16 was in task 8 with no criterion row, so nothing in the coverage map,
   the mutation ledger or the arithmetic noticed its absence (B5). Inherited repairs should
   arrive as rows.
