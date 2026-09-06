---
plan: plans/phase-03-session-runtime-and-tabs.md
role: projection
round: 0
date: 2026-09-07
verdict: AMENDMENTS_REQUIRED
actor: projection
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Phase 03 projection — session runtime and the tab strip

## 1. Verdict

**AMENDMENTS_REQUIRED.** 27 ledger rows: 20 plan gaps, 1 master-plan gap, 6 free choices
proposed as explicit delegations. No intention gap. Two of the plan gaps are of the
row-that-cannot-fail family (charter rule 15) and one of those is on **C1**, the criterion
that carries this phase's identity measurement.

## 2. What the projection concluded

Phase 03's plan is well-built where the pre-dispatch lint touched it, and the six amendments it
made all hold up. The problem is one the lint said it had not checked: a large part of what this
phase promises to measure cannot be measured by the test tools this repository actually has.
Anything about *where things sit on screen* — the active tab staying in view, the close button
being big enough to hit, a long title being shortened — is invisible to the fast test runner,
which reports every size as zero, and the plan neither says so nor gives that evidence anywhere
to live. Separately, two checks would pass no matter how the code was written, including the one
guarding that a session's private identifier is generated honestly. Nothing here is a
disagreement with the product; it is all work that needs to move into the plan before an
implementer starts, and two questions genuinely need you.

## ⚠ OWNER DECISIONS REQUIRED (2)

### Card 1 — Can a background session be closed?

**Question** — In this version, can the user close a session tab without first switching to it,
yes or no?

**Story** — You have four proposals open. The Sundbyberg one is finished and you want it gone.
Today's design shows the small ✕ only on the tab you are currently in, so you click Sundbyberg
(losing your place in the tab you were working in), then click ✕, and the workspace jumps you
somewhere else again. Over a morning of six or seven sessions that is a lot of involuntary
travel. The design document itself flags this as unresolved and asks the question outright.

**Branches**
- **Close only from the active tab (today's design):** fewest mis-clicks while scanning; closing
  a background session always costs a detour through it.
- **Show ✕ on hover and on keyboard focus for any tab:** background sessions close in one action;
  slightly more risk of clicking ✕ when reaching for the tab.

**Recommendation** — Show ✕ on hover and keyboard focus for any tab: the plan already promises
behaviour for closing a non-active tab, and without this that promise has nothing to act on.

**On silence** — The gate holds. The phase is not dispatched, because one of its nine close
rules has no way to be exercised either way.

**Trace** — design 04 §3.2, §4.3, open question 2; intention §5.3, §12A.5 close table; plan C3(a).

### Card 2 — Does this step ship a visible "new session" button?

**Question** — Should this phase put the "+" new-session control on screen, or leave the strip
showing only sessions created behind the scenes until a later step?

**Story** — This is the step that builds the tab strip. If the "+" is not part of it, you can
open the app and see one tab and nothing else: no way to make a second session, so nothing to
switch between, reorder, or close. Everything the step builds would be real but unreachable
until a later step adds one button. It also means we cannot demonstrate the strip to you at the
end of it.

**Branches**
- **Include the "+" now:** the whole step is usable and demonstrable the day it lands; one small
  extra control to design and label.
- **Leave it for later:** slightly smaller step; the strip is invisible to a real user and to
  the browser-based checks until then.

**Recommendation** — Include it now: without it this phase's "keep the active tab in view"
guarantee has nothing that can put a second tab on screen, so it cannot be checked at all.

**On silence** — The gate holds. The keyboard-order corrections this phase owes to the previous
phase cannot be written either way, because they depend on whether this control exists.

**Trace** — design 04 §2, §3.5; master plan §6.2 `session-tabs/`; plan tasks 1 and 6, C4(a),
plan §4 re-baseline set.

## 3. Decision ledger

| # | Decision point | Classification | Proposed routing |
|---|---|---|---|
| L1 | C1(b)'s stated observation ("creating, reordering and closing sessions and observing every surviving id unchanged") is satisfied by **every** generator §12A.1 forbids | plan gap | Re-author C1(b): keep the stability observation, add a **source-level allowlist** over the id's construction site (standing rule 17) **or** replace the behavioural half with create → close → create **uniqueness**, which the index generator does break. See F1 |
| L2 | C1(b)'s named mutation ("replace the generator with the tab's array index at the id's definition site") does not redden C1(b) | plan gap | Re-attribute to C3(g), and give C1(b) a mutation that bites whatever instrument L1 lands on |
| L3 | Every C1 row that serves **F8** is structurally held; master plan §7.3 still lists F8 as served by `03, 16` | master-plan gap | Amend §7.3's F8 row to `05, 16` with a pointer to §7.5, or annotate `03 (held)`. Home-artifact rule: this is the master plan's cell, not the phase plan's |
| L4 | **C2** — 8 rows, tracing to F12 and F24 — ships with **no named mutation**. This is F2's own reasoning, unapplied to the neighbouring criterion | plan gap | Add at least one: e.g. "in the move function, drop the guard that leaves the active session id unchanged; C2(b) must redden" |
| L5 | Radix `TabsTrigger` activates on **`onMouseDown`**, so beginning a pointer drag on a non-active tab activates it — contradicting C2(b) on the pointer path | plan gap | Task 4 states that drag initiation suppresses the primitive's activation, and C2(b) names the pointer path explicitly. See F4 |
| L6 | C2(c) has three sub-checks ("no state write, no announcement, no focus change") and no stated instrument for any of them | plan gap | Name the instruments: store-reference identity for the write, a named live region for the announcement, `document.activeElement` for focus. Standing rule 12: one mutation per sub-check |
| L7 | jsdom implements **no `DataTransfer` and no `DragEvent`**, so the pointer half of C2(e) and the whole of C2(h) have no subject there | plan gap | Either state that the pointer path is measured in Playwright, or re-root C2(e)/C2(h) onto the store's move function with the DOM drag handler asserted separately to call it. See F5 |
| L8 | C3(a)'s "unless focus was inside the removed tab": under the primitive's default **automatic activation** a non-active tab cannot hold focus, and design 04 gives inactive tabs no close control — so the clause has no producible fixture | plan gap | **Owner card 1.** Once answered, C3(a) states which affordance carries the focus it speaks of |
| L9 | C3(e) ("no rendered frame contains an empty strip") cannot fail: create-then-remove and remove-then-create inside one store transition produce identical rendered output under React batching | plan gap | Re-author as an assertion on the **transition** — the ordered list is non-empty at every intermediate value of the close action — with a mutation that splits the action into two writes. See F2 |
| L10 | **C4(a)** — 5 rows — has no Vitest subject: jsdom returns hard-coded `0` for every geometry accessor | plan gap | Split: a **pure reveal function** (tab offset/width, region scrollLeft/clientWidth, margin → new scrollLeft) unit-tested in `node`, plus the end-to-end rows in Playwright. See F3 |
| L11 | No criterion row in the plan names its runner, and the plan's "Files expected to change" gives this phase's browser evidence **no home**: §4 closes `e2e/workspace.spec.ts` to a five-instance re-baseline and adds no new spec | plan gap | Add the runner to every row (master plan §10.3A's consequence clause), and add the e2e home to §4 — either `e2e/session-tabs.spec.ts` as a new file, or an explicit statement that §4's freeze binds existing assertions and permits additions |
| L12 | The re-baselined tab order is underdetermined, because the plan never decides whether a new-session control ships in this phase | plan gap | **Owner card 2.** The five re-baselined instances then state the exact expected order |
| L13 | C4(e) says "introduce each forbidden mechanism in turn"; task 6 requires a probe planting "a construct **no denylist would have contained**". The criterion is the authority the test is written from, and it says the weaker thing | plan gap | Fold task 6's wording into C4(e) |
| L14 | C4(b)–(d) must be allowlists over an open universe, and no mechanism is named | free choice | Delegate explicitly, recording that `typescript@^6.0.3` is an installed devDependency and `ts.createSourceFile` is therefore available for a real member-expression allowlist |
| L15 | `ACTIVE_TAB_REVEAL_MARGIN_PX`'s value | free choice | Already recorded as this phase's choice by §6.4; restate as an explicit written delegation so the freedom is granted, not taken |
| L16 | `@radix-ui/react-tabs` is **not installed**, and its arrow-key / `Home` / `End` behaviour lives in `@radix-ui/react-roving-focus`, which is present nowhere on this machine. Charter rule 17 places grounding on plan authorship, not on the implementer | plan gap | The coordinator grounds C5(b) and C5(c) against the version that will actually install and records the seam in the criterion, **or** the plan grants the implementer a recorded stop-and-report on the first contradiction. See F6 for what is already grounded |
| L17 | C5(d) requires a keyboard-reachable close control on a focused tab; the primitive renders the tab as `<button>`, and a `<button>` may not contain a `<button>` | plan gap | Task 3's "if the primitive distorts any of them, use native elements for that part and record why" is the branch this hits; the plan should say so rather than leave the implementer to discover it. Recommended shape: the close control as a **sibling** of the trigger inside a wrapper, not a descendant |
| L18 | C5(e) (focus indicator), C5(f) (hit area) and C5(g) (elision) are browser-computed measurements with no runner assigned | plan gap | Playwright, per master plan §10.3A; folds into L11's home |
| L19 | C5(g) collides with the **frozen** phase-02 row `C4(<width>-4)`, which requires every `[data-elided]` element whose text overflows to have an accessible name **equal to its own text** — while design 04 §5 requires a tab's accessible name to carry status, note and unread as well | plan gap | State the placement: `data-elided` goes on the inner **title span**, whose own accessible name is the title, never on the tab. Without this the phase reddens a frozen row it may not edit. See F7 |
| L20 | C6(a)'s "at every rendered frame" has no stated instrument | plan gap | State it: a render-recording probe collecting the two counts per commit, or per-operation assertions across the sequence |
| L21 | C6(d) ("the Agent Surface's structure is not a function of the active session") has only a degenerate subject: result kind, status and Main-Application-Surface state all arrive in later phases, and sessions here differ only by identity and title | plan gap | Mark **structurally held** with the trigger "phase 04 introduces derived status; phase 14 introduces the second Main Application Surface state", and add the row to master plan §7.5 — the same treatment F2 gave C1(c)–(e). Rows 40 → 40, measurable 37 → 36, held 3 → 4 |
| L22 | Whether the phase builds a `Tabs.Content` / `role="tabpanel"` at all is undecided, and the two authorities point opposite ways: design 04 §5 makes the agent pane the tabpanel, while §12A.23 requires that element to remain a `complementary` landmark with stable identity | plan gap | Resolve in the plan under the guide's conflict protocol. See F8 — this one has a grounded, non-obvious consequence either way |
| L23 | `@testing-library/user-event` is absent, and `fireEvent.click` does **not** fire `mousedown`, which is what the primitive activates on | free choice | Delegate with the fact recorded, so the implementer does not spend a round on a tab that will not activate under `fireEvent.click` |
| L24 | The new-session button's position relative to `Tabs.List` | free choice | Delegate with a recommendation: a **sibling** of the tablist inside the strip wrapper, never a child of it — a non-tab child of a tablist is both an accessibility defect and inside the roving-focus group |
| L25 | C4's trace cell reads `F12 · §12A.5`; F12's text does not mention keeping the active tab in view, so the leading anchor does not support the row | plan gap (minor) | Reorder to `§12A.5 · F12`, or drop F12. §12A.5 does support the row verbatim |
| L26 | Frozen `C4(<width>-2)` exempts horizontal overflow only for elements carrying the literal class `overflow-x-auto` / `overflow-x-scroll`, an inline `style.overflowX`, or `data-horizontal-scroll` | free choice | Delegate with the constraint recorded: the scroll region must carry one of those exact spellings or the frozen row reddens |
| L27 | Contract 11 §3 requires a feature store's transitions to be asserted **directly, without rendering**, while C2 and C3 rows fuse a list outcome with a focus destination | free choice | Delegate the split explicitly: list/active-session halves in the store test, focus halves in the rendered test, with both halves named in the row |

## 4. Reality-check and decidability findings

### F1 — C1(b) cannot observe its own subject (blocking)

`plans/phase-03-session-runtime-and-tabs.md`, C1(b): *"never derived from the tab's index, a
thread position, or a module-level counter — asserted by creating, reordering and closing
sessions and observing every surviving id unchanged."*

Every generator §12A.1 forbids produces ids that survive unchanged:

| Forbidden generator (intention §12A.1 "Forbidden") | Stable across create / reorder / close? |
|---|---|
| module-level mutable counter (`sessionSeq`) | yes — assigned once, stored |
| the tab's array index at creation (`String(sessions.length)`) | yes — assigned once, stored |
| a thread position | yes — assigned once, stored |

Stability is necessary and nowhere near sufficient. A behavioural test cannot distinguish
`crypto.randomUUID()` from `String(counter++)`, because both are stable and both survive every
operation the row performs. The row measures a property no forbidden construction violates —
charter rule 15's family, on the criterion that carries F8.

The distinguishing observation is **uniqueness across a close**: create A, create B, close A,
create C. Under `String(sessions.length)` C is issued `"1"`, colliding with B. That is also
exactly what C3(g) asserts, which is why the named mutation lands there (L2) rather than here.

### F2 — C3(e) cannot fail (blocking)

C3(e): *"the replacement is created **before** the removal, asserted by observing that no
rendered frame contains an empty strip."*

The close action is a single store transition. React 19 batches; a Zustand `set` inside one
action produces one commit. Both orderings — create-then-remove and remove-then-create — expose
the same final list to the renderer and produce **no intermediate frame at all**, so the
observation is vacuously true under either, and a mutation swapping the order does not redden
it. The row's own contract is real (§12A.5 states it as part of the close contract); it is the
instrument that cannot reach it.

Decidable restatement: assert on the **transition**, not on frames — the close action's
intermediate list value is non-empty at every step — with the named mutation splitting the
action into two separate writes so a genuinely empty intermediate becomes observable.

### F3 — C4(a) has no runner that can measure it (blocking)

Grounded at source, `jsdom@30.0.1` (installed):

| Accessor | Value | Evidence |
|---|---|---|
| `getBoundingClientRect()` | `{x:0,y:0,top:0,right:0,bottom:0,left:0,width:0,height:0}` | `node_modules/jsdom/lib/jsdom/living/nodes/Element-impl.js:328` |
| `getClientRects()` | `[]` | `Element-impl.js:340` |
| `scrollWidth` | `0` | `Element-impl.js:344` |
| `clientWidth` | `0` | `Element-impl.js:361` |
| `offsetWidth` | `0` | `node_modules/jsdom/lib/jsdom/living/nodes/HTMLElement-impl.js:196` |
| `ResizeObserver` | not implemented | absent from `node_modules/jsdom/lib/jsdom/living/interfaces.js` |

C4(a) asserts the active tab is *fully inside the strip's visible region with at least
`ACTIVE_TAB_REVEAL_MARGIN_PX` clear on both sides*, across five rows one of which is a **strip
resize**. Under Vitest every term of that predicate is `0`, and the resize row has no observer to
fire. An implementer writing this row in jsdom writes either a test that fails on zeros or one
whose predicate is trivially satisfied by them — the second is rule 15's family again.

Master plan §10.3A already states the consequence for *computed style*; **layout geometry is the
same class and §10.3A does not name it**. Recommend §10.3A gain a sentence, since the finding is
permanent rather than phase-03-local, exactly as its `var()` and `matchMedia` rows are.

Proposed split, both halves decidable:
- the reveal arithmetic as a **pure function**, unit-tested in the `node` project over the
  named constant's contract (charter rule 13) — this is where four of the five rows genuinely
  live, since "after a switch / reorder / close / creation" are all just inputs to it;
- the end-to-end guarantee in Playwright against the running application, which needs the
  create affordance of owner card 2 and the e2e home of L11.

### F4 — the mandated primitive activates on `mousedown`, and three rows depend on it

Grounded against `@radix-ui/react-tabs@1.1.13` — the version in this machine's npm cache
(`~/.npm/_cacache`, tarball integrity `sha512-7xdcatg7/U+7…`, fetched 2025-10-28), extracted
read-only to the session scratchpad. `dist/index.mjs`, `TabsTrigger`:

```js
role: "tab", "aria-selected": isSelected, "aria-controls": contentId, type: "button",
onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
  if (!disabled && event.button === 0 && event.ctrlKey === false) context.onValueChange(value);
  else event.preventDefault();
}),
onFocus: composeEventHandlers(props.onFocus, () => {
  const isAutomaticActivation = context.activationMode !== "manual";
  if (!isSelected && !disabled && isAutomaticActivation) context.onValueChange(value);
})
```

Three consequences the plan does not carry:

1. **C2(b) fails on the pointer path.** `dragstart` is preceded by `mousedown`, so beginning a
   drag on a non-active tab activates it. C2(b) requires the active session id to be unchanged by
   a move. (L5)
2. **C3(a)'s focus clause has no fixture.** `activationMode` defaults to `"automatic"`, so
   focusing a non-active tab activates it — focus cannot rest inside a non-active tab. Combined
   with design 04 §3.2 (close control on the active tab only), nothing can put focus inside a
   tab that is about to be closed while non-active. (L8, owner card 1)
3. **`fireEvent.click` will not activate a tab**, and `@testing-library/user-event` is not a
   dependency of this repository (`package.json`, checked in full). (L23)

Also grounded and worth recording: design 04 §4.1's "the close button stops propagation" is
written against a `div` with an `onClick`; under this primitive propagation must be stopped on
**`mousedown`**.

### F5 — jsdom cannot carry the drag half of C2

`node_modules/jsdom/lib/jsdom/living/events/` contains no `DragEvent` and
`interfaces.js` exposes no `DataTransfer`. `fireEvent.dragOver` therefore constructs a plain
`Event` with **no `dataTransfer` property**. Design 04 §4.2's mechanism (`draggable="true"`,
`dragstart`, `dragover`, `dragend`) cannot be exercised faithfully there, so C2(e)'s pointer half
and all of C2(h) — whose subject is *a drag interrupted by a creation or a close* — have no
jsdom subject. (L7)

C2(h) is decidable if it is re-rooted onto the move function applied against a list that changed
underneath it; it is not decidable as a DOM-level drag in the runner the plan implies.

### F6 — what the primitive discharges, and what is still ungrounded

Discharged by the primitive, grounded at `dist/index.mjs`:

| Row | Discharged? | Evidence |
|---|---|---|
| C5(a) tablist role, orientation | yes | `TabsList` renders `role="tablist"`, `aria-orientation={context.orientation}` |
| C5(a) accessible name on the strip | **no — composition owes it** | `TabsList` spreads `...listProps`; nothing supplies a name |
| C5(b) selected state | yes | `aria-selected: isSelected` on the trigger |
| C5(b) roving tabindex | delegated | `RovingFocusGroup.Item` — **ungrounded, package absent** |
| C5(c) arrow keys, `Home` / `End` | delegated | `@radix-ui/react-roving-focus@1.1.11` — **ungrounded, package absent** |
| C5(c) activation follows focus | yes | `onFocus` + `activationMode` defaulting to `"automatic"` |
| C5(d)–(g) | **no — composition owes all four** | not modelled by the primitive |

Standing rule 5 and charter rule 17 both bind here: the primitive's presence is never proof, and
the rows it *delegates to a package nobody in this pipeline has read* are the ones a green suite
would most plausibly cover falsely. Two of the seven C5 rows are in that position. (L16)

Version caveat, stated rather than glossed: the cache entry is `1.1.13` from 2025-10-28 and a
fresh install today may resolve higher. Everything above is evidence about `1.1.13`.

### F7 — C5(g) collides with a frozen phase-02 assertion

`e2e/workspace.spec.ts:443`, `C4(<width>-4)` — frozen by the plan's §4 ("every narrow-width
row"):

```ts
const elided = page.locator("[data-elided]");
const subjects = await elided.evaluateAll(…).filter((el) => el.width > el.clientWidth);
…
await expect(element).toHaveAccessibleName(subject.text);
```

Every `[data-elided]` element whose text overflows must have an accessible name **equal to its
own `textContent`**. Design 04 §5 requires a tab's accessible name to be
`"<title>, <status>, <note>, <n> unread"` — deliberately *not* equal to the title text.

Today this row has exactly one subject in the tree
(`components/workspace/agent-surface.tsx:10`) and, being a short string in a ≥320px pane, it
almost certainly takes the `subjects.length === 0` early-return at every width — so the row has
plausibly never measured anything. Phase 03 introduces titles elided at a 112px minimum, which
is the first time it will have a real subject, and the first subject it gets would break it.

Satisfiable, but only by a placement decision the plan does not make: `data-elided` belongs on
the inner **title span** (whose own accessible name is the title), never on the tab. Phase 02
already set that precedent at `agent-surface.tsx:10`. Stated in the plan this is free; discovered
in review it is a fix cycle against a row the phase may not edit. (L19)

### F8 — the tabpanel question, and what the primitive does with it

`TabsContent` renders:

```js
Presence, { present: forceMount || isSelected, children: ({ present }) => Primitive.div({
  role: "tabpanel", "aria-labelledby": triggerId, hidden: !present, id: contentId,
  tabIndex: 0, …, children: present && children }) }
```

Two facts follow, and they cut in opposite directions:

- **If the phase builds a `Tabs.Content` per session** and the Agent Surface lives inside it,
  `children: present && children` unmounts the outgoing session's subtree and mounts the
  incoming one. The `<aside>` after the switch is a **different element** — which reddens C6(b)
  ("the same elements throughout"), C6(f)'s probe becomes indistinguishable from the shipped
  behaviour, and phase-02's frozen landmark-identity expectations are at risk.
- **If the phase builds no `Tabs.Content` at all**, every trigger still emits
  `aria-controls={contentId}` **unconditionally** — a dangling ARIA reference to an element that
  does not exist, on every tab.

Design 04 §5 asks for the first shape ("the agent pane below is the corresponding tabpanel").
Intention §12A.23 requires the Agent Surface to remain exactly one `complementary` region, the
same element for the page's lifetime — and an element carries one role, so it cannot be both.

This is a conflict between a design specification and a mechanism contract, which standing rule 6
and the guide's §6 conflict protocol resolve in the contract's favour, with a design delta
recorded. The plan should take that resolution explicitly rather than leave an implementer to
meet it at the keyboard. Workable shape, offered as a sketch and not as guidance: one
`Tabs.Content` **outside** the landmark, holding the session-dependent content the Agent Surface
renders into, so the landmark element itself is never the panel and never unmounts — but the
decision is the plan's, not mine. (L22)

### F9 — reality checks that passed

- Every path in "Files expected to change" exists or is correctly marked new. `hooks/`,
  `components/session-tabs/` and `types/session.ts` match master plan §6.1 and §6.2.
- `src/lib/proposales/index.ts:39` is `generationId: string`. Task 2's F3 amendment is accurate.
- The plan's five re-baseline instances are exactly right. Every `keyboard.press("Tab")` in
  `e2e/workspace.spec.ts` is at lines 100–102 (phase-01 `C2(a)`, 3 presses), 241 (`C1(d)`),
  248 (`C1(e)`), 373–374 (`C2(e)`), 437/439 (`C4(<width>-3)` × 3 widths). `C1(d)` and `C1(e)`
  are correctly **not** in the set: the skip link is in `src/app/layout.tsx`, ahead of the
  workspace, and stays the first tab stop.
- Derived totals re-derived at source and correct as stated: **6 criteria, 40 rows**
  (5·8·9·5·7·6), 37 measurable, 3 held; **8 runnable named mutations** (C1(b) 1 · C3(h) 1 ·
  C3(i) 1 · C4(e) 3 · C6(e) 1 · C6(f) 1) plus 1 held. L21 would move these to 36 measurable and
  4 held; L2 and L4 change the mutation attribution but not the count.
- Frozen `workspace.test.tsx` `C5(b)`'s denylist (`:108`) contains `plugin|extension` over all of
  `src/features/**`. No ordinary tab-strip source trips it, and task 8 already carries the
  report-never-silence rule for both scanners.
- Frozen `C5(c)` asserts `types/presentation.ts` exports exactly `MainSurfaceState`. Phase 03's
  new `types/session.ts` is a different file; unaffected.
- The tree is clean at `66aa5c3` and `git diff 3796dc1 66aa5c3 -- src e2e package.json
  vitest.config.mts playwright.config.ts vitest.setup.ts` is **empty** — the code is byte-identical
  to the phase-02 approval stamp, as the prompt asserted.

## 5. Trace verification, both directions

Per master plan §7.4.

**Forward — every row's anchor resolves and supports the row.**

| Criterion | Cell | Anchor admissible? | Supports the rows? |
|---|---|---|---|
| C1 | `F8 · §12A.1` | yes | **Partly.** §12A.1 supports (a) (client, once, at creation) and (b) (its "Forbidden" list). **F8 is served only by the three held rows** (c), (d), (e) — its text is entirely about submission. See L3 |
| C2 | `F12 · F24 · §12A.5` | yes | yes — §12A.5's reorder table covers (a)–(e), (h); §12A.17's "a tab is moved by keyboard" row covers (f); F12's "drag-only reorder" defect family covers (g) |
| C3 | `F12 · F24 · §12A.5` | yes | yes — §12A.5's four-row close table with focus destinations, its never-reused clause for (g), its "each after the §12A.6 guard has passed" for (i) |
| C4 | `F12 · §12A.5` | yes | **Leading anchor does not.** F12's text ends "…pointer and keyboard equivalent and the strip never empty" and says nothing about keeping the active tab in view. §12A.5's "Active tab kept in view" paragraph supports every row verbatim, including the three forbidden mechanisms. See L25 |
| C5 | `F6 · §12A.5 · 05 §7` | yes — F6 is the anchor; `05 §7` is a supporting citation, which §7.4 permits | yes — F6 names tablist semantics, visible focus, no colour-only state, and "composites built on the adopted primitive foundation meet the same bar and are never assumed accessible" |
| C6 | `F30 · §12A.23` | yes | yes — F30's text is C6(a)–(d) almost verbatim, and §12A.23's invariant names both of C6's probes |

**Reverse — every ledger entry the phase claims is served by at least one row.**

Master plan §7.3 lists phase `03` in exactly five rows — F6, F8, F12, F24, F30 — and the plan
header's `Serves` line names the same five. Enumerated over all thirty §7.3 rows, `03` appears
nowhere else. Four of the five are served by measurable rows in this phase. **F8 is not**: its
only servants are C1(c), C1(d) and C1(e), all structurally held to phase 05 and phase 16 by the
pre-dispatch lint's F2 and master plan §7.5. §7.3's F8 row is therefore currently false at the
project level (L3).

No untraced row. No orphan citation. `ui_design/04-session-tabs.md` §1, §4.1–§4.5, §5 and the
Prototype-only list all resolve and say what the plan claims; the plan's Notes list of
prototype-only names matches that section exactly.

## 6. Gate check result

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Intention ratified | **pass** | `intention/frontend-core-intention.md:5` — **Status** begins `RATIFIED` (2026-09-05, by the owner, David) |
| 2 | No open owner decision | **pass** | same file `:1202` — `## 15. Ratified owner decisions (0 open)` |
| 3 | Predecessor approved | **pass** | `master-plan.md:260` — row `02` **State** = `APPROVED` |
| 4 | The phase is unstarted | **pass** | `master-plan.md:261` — row `03` **State** = `NOT_STARTED` |
| 5 | The plan agrees | **pass** | `plans/phase-03-session-runtime-and-tabs.md` header — **State** `NOT_STARTED`, **Criteria** `6` |
| 6 | The phase is genuinely unimplemented | **pass** | `hooks/` holds only `collection-sentinel.test.ts`, `use-divider-width.ts`, `use-divider-width.test.ts`; `components/` holds only `collection-sentinel.test.tsx`, `idle/`, `workspace/` — no `session-tabs/`; `package.json` declares no `@radix-ui/*` and `node_modules/@radix-ui` does not exist |
| 7 | This round is genuinely outstanding | **pass** | `handoffs/reviewer/` contained only `.gitkeep` at session start |

All seven passed. `build_docs/future_implementations/` was left untouched.

## 7. Full write perimeter

**Documents written — one:**
- `build_docs/under_constroction/frontend_core/handoffs/reviewer/phase-03-projection-round-0.handoff.reviewer.md` (this file).

**Files created outside the repository — one, non-authoritative:**
- the session scratchpad `…/scratchpad/radix/package/`, a read-only extraction of the
  `@radix-ui/react-tabs@1.1.13` tarball already present in `~/.npm/_cacache`. Nothing was
  downloaded, nothing was installed, and nothing was written into the worktree.

**Commands run — read-only, all of them:** `cat`, `sed -n`, `head`, `wc -l`, `ls`, `find`,
`grep`, `git rev-parse HEAD`, `git status --porcelain`, `git diff --stat 3796dc1 66aa5c3 -- …`,
`node -e "…jsdom/package.json.version"`, one `python3` heredoc computing a cacache content path
from a base64 integrity string, and one `tar -xzf` of that cache file into the scratchpad.

**Explicit statements:**
- **No code changed.** No file under `src/`, `e2e/`, or any configuration file was created,
  edited, or deleted. The worktree is clean at `66aa5c3`, unchanged from session start.
- **No plan, intention, contract, or design specification was edited.** No Review-log line was
  written; no tracker row was moved. Those are the coordinator's, on consuming this handoff.
- **No dependency was installed.** `package.json` and `package-lock.json` are untouched;
  `node_modules/@radix-ui` still does not exist. The plan's task 3 install remains the
  implementer's act.
- **No suite, build, or end-to-end run was taken.** L4 budget spent: **zero**. `npm test`,
  `npm run build`, `npm run test:e2e`, `npm run typecheck`, `npm run lint` and `npx vitest list`
  were all not run. The code is byte-identical to the phase-02 approval stamp (verified by the
  empty `git diff` above), so the recorded stamp — unit 154/154, E2E 66/66, typecheck, lint and
  build green at `3796dc1` — is citable unchanged and re-measuring it would have been the
  over-evidence defect.
- **No architecture-graph delta.** There is no `.archgraph/` directory and no archgraph tooling
  in this worktree (master plan §8); a session reporting a graph delta would have reported
  something that does not exist.
- **Nothing was committed.**

**Skeleton:** discarded, per doctrine. No sketch, signature, or file layout from this session is
carried into the handoff as guidance. The two shapes named in F7 and F8 are stated as the
consequences of frozen assertions and of the primitive's own source, not as an implementation
the implementer should adopt.
