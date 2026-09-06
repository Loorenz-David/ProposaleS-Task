---
plan: plans/phase-02-workspace-shell.md
role: projection
round: 0
date: 2026-09-06
verdict: AMENDMENTS_REQUIRED
actor: projection
---

# Phase 02 projection, round 0 — `AMENDMENTS_REQUIRED`

## 1. Verdict

**`AMENDMENTS_REQUIRED`.** 27 ledger rows: 16 plan gaps, 1 intention gap, 10 free choices
proposed as explicit delegations. One owner decision card.

## 2. What this projection concluded

I did the implementer's first hour on paper for the workspace shell, from the plan and the
documents it points at, and stopped every time the papers did not decide the next step. The
shell itself is well specified — the two panes, the divider's behaviour, the colours, the
keyboard model and the list of things the shell must never grow are all pinned down, and the
plan's own pre-dispatch lint had already caught the arithmetic and the collision with the
previous phase's guard. What is not decided is mostly *how the work gets proved*: several
checks, as written, would run in a test environment that physically cannot see what they claim
to measure, and several "the shell does not contain X" checks ship without the planted defect
that shows the check can catch X — which is the single most expensive mistake this project has
made before. **One thing needs you personally:** how narrow a browser window the workspace
promises to stay usable in. Nobody has ever written that number down, and one of the phase's
checks cannot be built without it. Everything else routes through the coordinator as plan
wording, and none of it changes what the product does.

## 3. ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — How narrow a window does the workspace promise to survive?

**Question.** What is the narrowest browser width at which the workspace must still be usable
and uncorrupted: 780 pixels (the designer's own lower threshold), or a specific smaller number
you name?

**Story.** A colleague opens the copilot on a laptop with the browser docked to half the
screen — roughly 700 pixels wide. The agent column refuses to shrink below its minimum, so the
proposal side gets whatever is left. At 780 pixels that is still a readable column. At 700 it
is a narrow strip; at 500 it is a sliver a few words wide. Nothing breaks and nothing is
hidden — it simply becomes unusable, quietly, on a window size nobody promised anything about.
Today the specification says "below 780 is out of scope for V1 but must not corrupt" and stops
there, so the team building this cannot tell whether 500 pixels is a width we stand behind or
a width we merely survive.

**Branches.**
- **780 pixels.** We promise usability exactly where the design does, and say plainly that
  narrower windows are unsupported. Simplest, honest, and testable today.
- **A smaller number you name (say 640).** We test at that width too. The layout will pass the
  checks, but the proposal side will be a strip; we would be promising something we do not
  really deliver.
- **Leave it open.** The phase cannot build one of its four required width checks.

**Recommendation.** **780 pixels**, because it is the narrowest width at which the agreed
behaviour actually leaves a usable proposal column, and promising less than we deliver is
cheaper to correct later than promising more.

**On silence.** The gate holds: the phase is not dispatched and no width is guessed.

**Trace.** Intention §12A.19 (the named width set), §5.1, ratified boundary 15; master plan
§6.4 `NARROW_WIDTH_TEST_SET`, §11.2 delta 5; design 02 §3.3; plan C4, ledger L1.

## 4. Decision ledger

`plan gap` → coordinator amends the plan. `intention gap` → routed upstream to its home
artifact, never patched downstream. `free choice` → proposed as an **explicit delegation**
written into the implementer prompt, so the freedom is granted rather than taken.

| # | Decision point | Classification | Proposed routing |
|---|---|---|---|
| **L1** | The **V1 floor** of `NARROW_WIDTH_TEST_SET` is fixed by no authority, and §12A.19's four-member shape presumes a floor below the lower stated threshold | intention gap | Owner card 1. Fold the answer into intention §12A.19 as a lettered amendment (never renumber), then into master plan §6.4 and plan C4. If the answer is 780, §12A.19's set has three distinct widths and must say so |
| **L2** | The **designed wide width** is a range (`≥ 1100px`), not a value | free choice | Delegate: any value strictly greater than the upper stated threshold, so the four members stay distinct. Recommend `1440` |
| **L3** | **Which runner measures C4.** The criterion says "verified by rendering" and names no runner | plan gap | Amend C4 to say **Playwright**, citing master plan §10.3A. jsdom has no layout at all (verified at source, §6 F3): `getBoundingClientRect()` returns all zeros and `clientWidth`/`scrollWidth` are `0`, so none of C4's five conditions is observable in Vitest |
| **L4** | **What the divider hook/component receives**, so a Vitest test can observe a width at all. Task 5 forbids reading the window during render ("observe the container instead"); jsdom 30.0.1 ships **no `ResizeObserver`** (verified at source) and no layout, so every C2/C3 width computes from `0` | plan gap | Amend task 4/5 to fix the seam: export the clamp as a pure function of `(requested, containerWidth)` and have `use-divider-width` take the container width as an argument; the observer wiring is then a Playwright-only subject. Note the perimeter consequence: without this, the implementer needs a `ResizeObserver` stub in `vitest.setup.ts`, a file "Files expected to change" does not list |
| **L5** | **Where the named constants live.** §6.4 says "Home: phase 02" and names no module; the file perimeter lists none; C5(c)'s allowlist forbids `types/presentation.ts` | plan gap | Name the module in "Files expected to change". Recommend `src/features/proposal-preparation/components/workspace/constants.ts`. If C4 imports `NARROW_WIDTH_TEST_SET` from `e2e/`, the implementer confirms Playwright resolves the root tsconfig `paths` alias before relying on it (no lint rule forbids the import — verified) |
| **L6** | **What element the divider is.** Contract 05 §7 ("every interactive element is a native control … no click handlers on `div`s") and contract 12 "Components and client" ("hand-rolled ARIA on a `div` reproducing a native control's semantics — Prohibited"; "`div` with `onClick` as a button — Prohibited") both sit in the plan's Read-first list; design 02 §5 prescribes `role="separator"` + `tabindex="0"`, intention §6 defers "a resizable-pane library", and no Radix primitive models a splitter | plan gap (conflict — guide §6: surface, never silently choose) | Record the resolution in the plan and require it in the Review log: the platform provides **no** focusable, valued separator, so contract 15 §5's "when none exists" clause governs and the divider is project-owned. Name the element the plan expects and why |
| **L7** | **C6 ships three absence rows with no instrument and no probe** — (a) no proposition/list/statistics/navigation, (c) no affordance that changes the URL, (d) no focus move and no announcement. C5's preamble binds only C5; standing rule 8 and charter rule 15 bind these identically | plan gap | Give each row its instrument, and add at least one planted-defect probe to C6. Recommend: plant an `aria-live` region inside the idle subtree, observe (d) redden, revert. Re-derive the phase's named-mutation total afterwards |
| **L8** | **C6(d) has no observable event in this phase.** "Entering it" is activation (§12A.22), which does not exist until phases 03/14 | plan gap | Restate (d) as a property of the first render — no element receives focus, and no `aria-live`/`role="status"`/`role="alert"` node exists in the idle subtree — or mark it **structurally held** (master plan §7.5) with phase 14 as its named trigger |
| **L9** | **C4 asserts five conditions per row across four widths — twenty sub-checks — behind one probe.** Charter rule 12: sequential assertions short-circuit. Condition 1 ("the document does not scroll horizontally") is satisfied *by construction* if the shell root carries design 02 §2's `overflow:hidden`, so it can never redden. C4(e) names no condition it bites; §12A.19's own mutation says "condition 1 **or** 2", the disjunction charter rule 2 forbids in an expected outcome | plan gap | State which condition each probe bites and at which width, and enumerate one probe per condition that a mutation can reach. Separately, state how condition 2's exception ("a container that declares its own horizontal scroll") is distinguished from an incidental `overflow-y:auto` scrollbar — otherwise the exception swallows the rule |
| **L10** | **C2(c)'s seven rows collapse `Enter` and `Space`.** Design 02 §5 names both as reset keys; charter rule 2 enumerates, never samples | plan gap | Eight rows, or a recorded decision to bind one key only. Re-derive the row total either way |
| **L11** | **Double-click reset is covered by nothing.** Design 02 §3.1 and §5 both require it; C2 is scoped to the keyboard model; C2(d) says "Reset announces politely, exactly once" without saying which reset path | plan gap | Add the pointer reset to C2 (Playwright, per L3), or state in the plan that it is deliberately unmeasured and why |
| **L12** | **C2(f) "operable without a pointer" is not distinguishable from C2(c)** | free choice | Delegate with a stated intent. Recommend: (f) asserts the divider is reachable by `Tab` from the start of the rendered document, which (c) does not assert |
| **L13** | **C1(a) has no probe.** A second `main` is probed (C1(d)); a second complementary region is not | plan gap | Extend C1(d) to two probes, one per landmark. Cheap, and it closes the same family C5(e) closes |
| **L14** | **Task 2's "Neither is remounted by anything" is measured by no row**, while F30 — C1's own anchor — asserts "both the same elements throughout". This phase has exactly one state change that could remount them (the divider width) | plan gap | Add a C1 row asserting node identity across a divider interaction, or record explicitly that F30's identity half is served only by phases 03 and 14 |
| **L15** | **`MainSurfaceState` has no production consumer in this phase.** C5(c)'s allowlist requires the module; charter rule 4 forbids dead scaffolding and contract 12 forbids files created "because the structure says so" | free choice | Delegate with both options stated. Recommend: `MainApplicationSurface` takes `state: MainSurfaceState`, pinned to `"idle"` by its only caller — one real consumer, and it is the seam phase 14 replaces. The alternative (test-only consumer, recorded reason) is acceptable if declared |
| **L16** | **C5(d)'s exact-count instrument has an unrecorded limit.** "Exactly one module under `src/` renders a `main`" is measured lexically; `React.createElement("main", …)` or a variable tag is not observed. C5's own preamble requires each row to record its limit, and (a), (b) do | plan gap | One sentence in (d) recording the lexical limit, as (a) and (b) already do |
| **L17** | **§12A.23's forbidden list has five bullets; C5 measures four.** Bullet 5 — "a shell-level abstraction introduced because decision 11 named the surface generically" — is measured by nothing, while task 7 says "per §12A.23's **closed** forbidden list" | plan gap | Either record bullet 5 as reviewed-not-tested with the reason (it is a judgement, not a lexical property), or drop the "closed list" claim from task 7. Do not leave the claim broader than the instrument |
| **L18** | **Task 8's carry of phase-01 C2(a) is not possible "unchanged in substance".** `e2e/bootstrap.spec.ts` reaches its focus probe with a single `Tab` *because* `page.tsx` renders nothing focusable — the test says so in its own comment. This phase adds a skip link ahead of it | plan gap | Amend task 8: the carried rows keep their **assertions** unchanged; their *reaching mechanism* may change, and the change is recorded. Name C2(a) as the known instance |
| **L19** | **Task 8's carry list does not name the spec's first test** ("renders the document title with no client or server error") | free choice | Delegate. Recommend carrying it: it is the end-to-end suite's only assertion that `/` renders with no page error, and it costs one navigation |
| **L20** | **The skip link is specified nowhere** — no label, no target, no visible/hidden behaviour, and no criterion row. Task 8 puts it in the end-to-end spec, where it traces to nothing (charter rule 16, standing rule 12: an orphan test is a finding) | plan gap | Add a row covering the skip link to C1, and delegate its label, its target id and its visually-hidden-until-focused treatment. Note for the implementer: design 01's "skip links" ramp rows are the clarification panel's *skip a question* links, a different meaning (§6.3, one meaning per name) |
| **L21** | **Follow-up 10's README half is already discharged.** Task 9 routes a correction whose subject no longer exists in the document | reality check → plan gap | Strike that half of task 9 and mark §11.3 follow-up 10's README half closed. See finding R3 for what *is* stale in `README.md` and is not on task 9's list |
| **L22** | **Read-first omits contract 16, and contracts 13 and 14.** This phase is a prototype port (design 02 "Prototype-only", design 10 §7) and §12A.23 anchors part of its prohibition on `16 §5`; task 9 invokes `14 §8`; the phase creates six new modules, which routes to `13` | plan gap | Add `16-design-prototype-porting.md` §3–§5, `14-documentation-principles.md` §8, and `13-decision-checklist.md` §5 to the Read-first list |
| **L23** | **Putting landmark, skip-link and keyboard-reachability assertions in Playwright deviates from contract 11 §2/§3**, which reserves end-to-end for critical user flows and says "secondary screens and cosmetic behavior are covered lower in the pyramid, not here". Contract 11 §2–§3 is in the plan's Read-first list | plan gap | One sentence in task 8 stating the concrete reason (master plan §10.3A: no configured Vitest project can measure a rendered document here), per guide §2 step 6 |
| **L24** | **The prototype's `title="Drag to resize · double-click to reset"`** (design 02 §4) versus §12A.17's forbidden list ("a `title` attribute as an accessible name") | free choice | Delegate. Recommend: no `title`; `aria-label` carries the name, and the keyboard model is discoverable without a tooltip |
| **L25** | **The clamp-resistance cue** (design 02 §6 and open question 4; intention §6 "only if cheap") | free choice | Delegate. Recommend: not taken, recorded as declined, so it is not silently absent |
| **L26** | **A conditional class-name utility.** Contract 15 §1: created "inside the feature that first needs it", and no file exists. The divider's rest/hover/active/focus states are that first need; phase 01 C5(b) keeps `src/components/ui/` empty | free choice | Delegate: create it inside the feature or use plain template literals; either is contract-compliant, and the choice is recorded rather than taken |
| **L27** | **`user-select: none` on the root while dragging** (design 02 §5) is a document-level side effect the file perimeter does not anticipate | free choice | Delegate. Recommend: a class toggled on the shell root, not on `document.documentElement`, so the effect stays inside the component's own subtree |

**Delegation totals to carry into the implementer prompt:** 10 explicit delegations
(L2, L12, L15, L19, L24, L25, L26, L27 — plus the two halves of L5 and L20 that survive their
plan amendments). Zero *silent* freedom is the target; several of these freedoms are correct
and should simply be granted in writing.

## 5. Reality-check and decidability findings

Each names its exact artifact. Findings cite owner card 1 where they depend on it; the card
does not restate them.

### Reality checks — every path and citation the plan names

**R1 — Passed, in full.** Every path in "Files expected to change" resolves or is correctly
marked new: `src/app/page.tsx`, `src/app/layout.tsx`, `src/features/proposal-preparation/hooks/`
and `.../components/` exist (each holding one phase-01 collection sentinel and nothing else);
`.../components/workspace/`, `.../components/idle/`, `.../hooks/use-divider-width.ts`,
`.../types/presentation.ts` and `e2e/workspace.spec.ts` do not exist and are marked new;
`e2e/bootstrap.spec.ts`, `src/styles/theme.test.ts` and `README.md` exist.

**R2 — The perimeter-vs-guard fold is correct and lands exactly where the lint says.** The block
task 8 retires is `src/styles/theme.test.ts:497–504`, `describe("C6(a)/(c): the reduced e2e spec
asserts no landmark, skip link, or shell", …)`. It is self-contained; the `readFileSync`, `path`
and `REPO_ROOT` bindings it uses stay in use by the `C4(e)` block immediately above it
(`theme.test.ts:490–495`), so the plan's "its imports stay in use by the other checks" is true
as written.

**R3 — `README.md` findings, one correction and one addition to task 9.**
- Task 9's five named statements all resolve: the Status paragraph's "a bare root layout, a
  neutral `/` route" (`README.md:7`), the same phrase in "Current scope", the tree diagram's
  `src/app/` entry "root layout and neutral root route", the
  `src/features/proposal-preparation` sentence (`README.md:141`), and the Playwright bullet
  naming `e2e/bootstrap.spec.ts` under "Testing strategy".
- **Follow-up 10's README half no longer exists.** §11.3 describes it as the
  "integrations under `src/lib/**` … neither exists yet" half-claim. `README.md:141` now reads
  "…integrations under `src/lib/<system>/` per 03-feature-architecture.md;
  `src/features/proposal-preparation` exists today only as phase 01's test-collection
  sentinels (no component, hook, or product surface yet)" — phase 01 patched the clause the
  follow-up describes. Ledger L21.
- **A stale statement task 9 does not name and this phase does not create.** `README.md`'s
  Proposales section says "How this application uses the API will be documented in
  `src/lib/proposales/README.md` **once the adapter exists**". Both that README and
  `src/lib/proposales/client.ts` exist today (backend phase 3, merged). It is a current-state
  falsehood under contract 14 §1, it predates this phase, and it sits in a document this phase
  patches — the same routing that put follow-up 10's README half here. Recommend adding it to
  task 9, or registering it as a new §11.3 follow-up. Reported, not fixed.
- The contracts-README half of follow-up 10 does still exist
  (`architectural_contracts/README.md:151`, "No frontend implementation plan exists yet"), and
  the plan is right to leave it: this phase does not patch that document.

**R4 — Every colour the Notes claim exists, exists, and covers everything design 02 §4 needs.**
All six named properties are declared in `src/styles/theme.css`, and each hex design 02 §4
specifies has a theme name: `#0b0b0c`→`--color-bg`, `#0e0f10`→`--color-bg-agent-pane`,
`#1f2b40`→`--color-bg-resize-active`, `#1c1d20`→`--color-border-hairline`,
`#26282c`→`--color-border-control`, `#3b82f6`→`--color-accent`. The Notes' claim that this
phase adds no name to `theme.css` is therefore constructible, not aspirational.

**R5 — C5(a)'s allowlist has a true starting state.** `src/app/` contains exactly `layout.tsx`
and `page.tsx`. No module under `src/` renders a `main` element today, so C5(d)'s exact-count
instrument starts at zero and the phase moves it to one.

**R6 — The lint's counts re-derive correctly.** Rows 4 + 6 + 6 + 5 + 5 + 4 = **30**, matching
the plan's declared total; named mutations C1(d) + C3(f) + C4(e) + C5(e)×2 = **5**, matching.
Criteria = 6, matching the tracker and §7.2's mandatory listing. Charter manifest properties 1
and 3 hold. Property 4 (the declared mutation set is closed) will need re-deriving after L7,
L9, L10 and L13, each of which adds probes.

**R7 — The tree moved during this session, and the gate re-ran clean on the moved tree.**
The Fable window 01 withdrawal (`0e50a28`) landed mid-projection, retitling master plan §3A,
moving phase 02 from §7.2's waivable list to its mandatory one, re-deriving the plan's
**Projection** header cell, and de-window-ising this prompt's `actor` cell. `git diff` confirms
it touched no criterion, no row, no task, no mutation and no file perimeter, so nothing above
this line was invalidated. Every gate row below was measured on the current tree.

### Decidability findings — could I write the test right now?

**F1 — C4: no, and the obstacle is the runner.** Master plan §10.3A binds every phase: what the
browser computes is measured in Playwright, what the source says in Vitest. Every one of C4's
five conditions is a browser computation. C4 names no runner. Ledger L3.

**F2 — C2(b)–(e) and C3(a)–(d): no, and the obstacle is the input.** Task 5 requires the
container to be observed rather than the window; nothing in the plan says what the hook or the
component then *receives*, and there is no environment in which the current shape is
observable at both ends. Ledger L4.

**F3 — The environment facts, verified at source** (the same method §10.3A used for phase 01),
so the two findings above rest on evidence rather than recollection:
- `node_modules/jsdom/lib/jsdom/living/nodes/Element-impl.js:328` — `getBoundingClientRect()`
  returns `{x:0, y:0, bottom:0, height:0, left:0, right:0, top:0, width:0}`, a literal, always.
- Same file, lines 345–367 — `scrollWidth`, `scrollHeight`, `clientWidth`, `clientHeight` are
  each `return 0`. jsdom performs no layout.
- **`ResizeObserver` appears nowhere in `node_modules/jsdom/lib/`.** jsdom 30.0.1 does not
  implement it, and `vitest.setup.ts` installs no stub (it installs `jest-dom`, RTL `cleanup`,
  and the offline `fetch` guard, and nothing else).
- **`setPointerCapture` appears nowhere in `node_modules/jsdom/lib/`**, although
  `PointerEvent-impl.js` does exist. An unguarded `setPointerCapture` call in a pointerdown
  handler throws in any jsdom component test that fires one. Design 02's "Prototype-only" note
  asks for pointer capture explicitly, so the implementer meets this on the first drag test.

**F4 — C4's conditions can hold while the layout is unusable, and one of them cannot fail.**
Under design 02 §2's root (`overflow:hidden`), condition 1 is true by construction at every
width. Under the mechanism standing rule 7 mandates — design 02 §3.3's *current behaviour*,
the squeeze, not §3.3's collapse-to-overlay *suggestion*, which intention §5.1 explicitly
declines to promote to product truth — conditions 2 and 4 are satisfied by wrapping at any
width, and condition 5 holds because the clamp holds it. So the five conditions are jointly
satisfiable at every viewport at or above `AGENT_PANE_MIN_PX` plus the seam (~326px), and
jointly *unsatisfiable* below it, where the agent pane's own minimum forces the document wider
than the viewport. The consequence for the plan: the floor's value decides nothing about
whether C4 passes and everything about whether C4 measures anything. See owner card 1 and
ledger L1, L9.

**F5 — C6: no, on all four rows.** (a), (c) and (d) are absence claims with no named
instrument and no probe, in a phase whose projection gate was made mandatory *for exactly this
property* on the day this handoff was written (master plan §7.2, 2026-09-06). (d) additionally
has no observable event before phase 03. Ledger L7, L8.

**F6 — C2(d) is defensible as written, and this is recorded so nobody "fixes" it.** "A drag
announces nothing" is an absence claim, but it shares one instrument with the presence half in
the same row — "reset announces politely, exactly once". The presence half proves the
instrument can observe an announcement; the absence half then means something. That is the
correct shape, and it is the shape C6 lacks.

**F7 — C1, C3 and C5 are decidable today**, with the caveats already routed. C1(a)–(c) are a
render assertion and a source read. C3's ordering row is constructible without any literal:
a container width of `AGENT_PANE_MIN_PX + MAIN_PANE_MIN_PX - 1` is precisely the viewport at
which the two minima cannot both hold, so C3(c) and its probe C3(f) are exact — **once L4
gives the clamp an input**. C5(a)–(e) are source-level checks over files that exist, with two
probes that plant real constructs; C5 is the strongest criterion in the phase and its
instrument-and-limit discipline is what C6 should be measured against.

## 6. Trace verification, both directions (master plan §7.4)

**Forward — every criterion cell carries an admissible anchor.**

| Criterion | Anchor | Admissible | Supporting citations resolve and support |
|---|---|---|---|
| C1 | `F30` | yes | `§12A.23` supports (a), (b); `02 §1–§2` supports (c) — contract 02 §2's "when a whole surface is genuinely interactive, the boundary is still drawn at the surface" is the exact sentence master plan §6.1 took the placement from |
| C2 | `F26` | yes | `F6` supports (f); `F24` supports (e) via §12A.17's row "a divider reset is performed → stays on the divider"; `§12A.19` supports (a)–(c) via its "Divider width" paragraph |
| C3 | `F26` | yes | `§12A.19` supports (a)–(d); charter rule 13 supports (e) |
| C4 | `F26` | yes | `§12A.19`'s five numbered conditions are C4's five conditions, verbatim in substance |
| C5 | `F30` | yes | `§12A.23`'s "Forbidden, and closed for V1" bullets 1–4 map one-to-one onto rows (a)–(d); bullet 5 maps onto nothing — ledger L17; `12` "Structure and abstraction" supports (b) |
| C6 | `F29` | yes | `F30` supports (b); `§12A.22` supports (a) and (c) via "What the idle state is, and is not", and (d) via its "Focus and announcement" clause |

No criterion in this phase relies on an architecture-contract anchor, so §7.4's enumerated
exception list is not touched and needs no amendment.

**Backward — every entry the phase claims to serve is served.** The header claims
`F30 · F26 · F29 (A row 4) · F24 · F6`. F30 → C1, C5, C6. F26 → C2, C3, C4. F29 → C6.
F24 → C2(e). F6 → C2(f). All five served; no claimed entry is unserved. Master plan §7.3's
project-level rows for this phase (F6, F24, F26, F29, F30 all list `02`) agree.

**One partial trace, recorded rather than treated as clean.** F30's invariant has three
clauses; this phase's rows serve two of them (the landmark counts, and the no-second-surface /
no-surface-discriminant absence). Its middle clause — "both the same elements throughout
rather than replacements" — is asserted by no row here, while task 2 states it as an outcome
("Neither is remounted by anything"). §7.3 assigns F30 to 03 and 14 as well, so the clause is
not lost project-wide, but this phase claims it in prose and measures it nowhere. Ledger L14.

## 7. Gate check result, row by row

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Intention `RATIFIED` | **pass** | `intention/frontend-core-intention.md:5` — the **Status** value begins `RATIFIED` (2026-09-05, by the owner) and its amendment trail ends "status unchanged and no owner decision is open" |
| 2 | No open owner decision | **pass** | same file, line 1196 — heading reads exactly `## 15. Ratified owner decisions (0 open)` |
| 3 | Predecessor approved | **pass** | `master-plan.md:259`, tracker row `01`, **State** cell `APPROVED` |
| 4 | Phase unstarted | **pass** | `master-plan.md:260`, tracker row `02`, **State** cell `NOT_STARTED` |
| 5 | Plan agrees | **pass** | `plans/phase-02-workspace-shell.md:5–6` — **State** `NOT_STARTED`, **Criteria** `6`; re-derived from the acceptance table as 6 criteria / 30 rows (R6) |
| 6 | Genuinely unimplemented | **pass** | `src/features/proposal-preparation/components/workspace/` does not exist; `components/` holds only `collection-sentinel.test.tsx` and `hooks/` only `collection-sentinel.test.ts` |
| 7 | Round genuinely outstanding | **pass** | `handoffs/reviewer/` held only `.gitkeep` at session start |

Not gated on, per the prompt: commit SHA, working-tree cleanliness, file counts.
`build_docs/future_implementations/` was left untouched.

## 8. Write perimeter

**Documents written — one, this file.**
`build_docs/under_constroction/frontend_core/handoffs/reviewer/phase-02-projection-round-0.handoff.reviewer.md`

**Commands run — all read-only.** `pwd`; `git rev-parse --abbrev-ref HEAD`;
`git status --porcelain`; `git log --oneline -1`; `git show --stat 0e50a28`;
`git diff 3f9c11b..HEAD -- <two paths>`; `cat`, `sed -n`, `awk`, `head`, `grep`, `wc`, `ls`,
`find` over the plan set, the intention, the master plan, the design specifications, the
architecture contracts, the doctrine files, the repository source, and `node_modules/jsdom/lib`
(the §10.3A method, for finding F3); `node -p` to read jsdom's version from its own
`package.json`. No command mutated the tree.

**Explicit statements.**
- **No code changed.** No file under `src/`, `e2e/`, or any configuration file was created,
  edited or deleted.
- **No plan, no intention, no architecture contract and no design specification was edited.**
  The findings above route through the coordinator; this session fixed nothing it found.
- **No dependency was installed.** `package.json` and `package-lock.json` are untouched.
- **No suite, build or end-to-end run was taken.** The L4 budget for this session was **zero**
  and zero was spent: no `npm test`, no `npm run build`, no `npm run test:e2e`, no
  `npm run typecheck`, no `npm run lint`. `npx vitest list` was **not** run either — the
  Vitest partition was decided by reading `vitest.config.mts` against master plan §10.3, which
  is narrower evidence and was sufficient: the DOM project's `src/**/*.test.tsx` include claims
  every component test this phase writes, and `src/features/**/hooks/**/*.test.ts` claims the
  divider hook's test, both already proven empirically by phase 01's two approved collection
  sentinels.
- **No architecture graph delta.** There is no `.archgraph/` directory and no archgraph tooling
  in this worktree (master plan §8); a session reporting a graph delta here would be reporting
  something that does not exist.
- **Nothing was committed**, no tracker row was moved, and no Review log line was written —
  the coordinator writes the Review log line when it consumes this handoff.

## Appendix A — skeleton notes (NON-AUTHORITATIVE; discard)

**This appendix is not guidance and must not reach the implementer as guidance.** It is the
paper the ledger was derived from. If any of it is worth keeping, the coordinator folds it into
the plan, where it becomes authority; carried across as a sketch it would make this session a
second planner, which is the coupling the fresh-session rule exists to prevent.

- The clamp reads directly from design 02 §3.2 as a pure function of `(requested, container)`;
  its ordering — the agent minimum applied last — is the whole of C3(c), and the reversed
  ordering that C3(f) plants is the shape an implementer reaches for first.
- The seven (or eight — L10) keyboard rows and the reset announcement are observable in a
  component test once the width input exists; the widths, the overflow and the focus ring are
  not, at all, and belong in the browser.
- C5 was the one criterion I could have written today, end to end, from the artifacts alone.
