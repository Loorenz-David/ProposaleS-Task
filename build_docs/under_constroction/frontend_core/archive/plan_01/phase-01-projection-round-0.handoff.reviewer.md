---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: projection
round: 0
date: 2026-09-06
verdict: AMENDMENTS_REQUIRED
actor: Claude Opus 5 (1M context), plan-projection session
---

# Projection handoff — phase 01, round 0

**Verdict: `AMENDMENTS_REQUIRED`.** 21 ledger rows. 1 owner decision open.

## Opening

Phase 01 is the foundation the next sixteen phases style, test and document from, and I
worked through it the way the person building it will, using only the documents they will be
given. The plan is well-shaped and its intent is clear, but three things stop it from being
buildable exactly as written: two of its six checks describe measurements that the project's
current test tooling physically cannot take, the two largest pieces of work in it — building
the visual foundation, and correcting the out-of-date documents — have no check attached to
them at all, and a handful of smaller instructions contradict each other about what is and is
not allowed in this phase. None of this is a defect in anyone's work; it is exactly the class
of gap this pre-build pass exists to find while it is still a paragraph edit rather than a
rebuild. One question needs you personally: how much of the visual system should be built in
this first phase, given that nothing yet uses it. Everything else is a document correction the
coordinator can route without you.

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — Does the visual foundation get built whole now, or grow as screens need it?

**Question.** Should phase 01 build the full visual system from the design document now, or
only the handful of values the current page actually uses, letting the rest arrive with the
screens that need them?

**Story.** Today the application renders a blank page. The design document describes roughly
seventy values — eight background shades, eleven text shades, ten corner radii, fifteen text
sizes, and so on. If all of them land now, most will sit unused for weeks, and some will never
be used at all; when a screen is built in three weeks the developer picks from seventy values
with nothing telling them which is right, and dead values are the thing the repository's own
styling rule was written to prevent. If instead only what the page uses lands now, the "one
place for every value" promise is real from the first screen, but it is built up over sixteen
phases, and each phase must be trusted to add its values to that one place rather than typing
them into a component.

**Branches.**
- **Whole now** — every screen afterwards picks from a complete palette; some values are never
  used and the repository carries them anyway.
- **Grow as needed** — nothing unused ever ships; the foundation is only as complete as the
  screens built so far, and drift is caught by the automated purity check rather than by the
  palette being complete.

**Recommendation.** Grow as needed, because the repository's styling rule already says a value
is added when a second consumer needs it rather than in anticipation, and the purity check this
phase builds is precisely the instrument that makes growing safe.

**On silence.** The gate holds. The phase is not dispatched and nothing is guessed.

**Trace.** Intention §5.9; contract 15 §2; plan task 2 and plan Notes bullet 4; ledger rows
L7 and L8.

## Decision ledger

21 rows. Classification is `plan gap` (amend the phase plan), `intention gap` (route upstream
to the intention or, where the charter's home-artifact rule places it there, to the master
plan as the shared skeleton), or `free choice` (grant the implementer the freedom in writing).

| # | Decision point | Classification | Proposed routing |
|---|---|---|---|
| **L1** | Which runner executes C2(a), C2(c) and C3(a), and against which processed stylesheet. The plan says "on a rendered document" and "by rendering rather than by reading the stylesheet" but names no runner. Neither configured Vitest project can do it (finding F1). | plan gap | Amend C2 and C3 to name their runner and their stylesheet source explicitly. If Playwright, amend task 6 and C6(a)/(c), which currently reduce `e2e/bootstrap.spec.ts` to exactly two assertions. |
| **L2** | What element C2(a) focuses and what element C2(c) animates. `src/app/page.tsx:1-3` returns `null`; the tree renders no native control and nothing with a transition or animation, and the plan forbids adding a product surface. | plan gap | Amend C2 to name the subject: a fixture rendered by the test itself, or a named throwaway route, with its disposal stated. Reconcile with the plan's "Not in this phase" clause at lines 17–19. |
| **L3** | Which Vitest project claims `src/styles/theme.test.ts`, the plan's own new test file. No project claims `src/styles/**` today, and master plan §10.3's contract enumerates only four locations (finding F2). | plan gap | Amend task 5 / §10.3 to state the project and environment for `src/styles/**`. Note C2 and C3 need a DOM while C1 and C5 are source-level, so one file may not serve both. |
| **L4** | C4(a)'s instrument: does the test spawn `npx vitest list` and read its output, or re-derive glob matching from `vitest.config.mts` in the test? These prove materially different things. | plan gap | Amend C4(a) to name the instrument. A re-derived matcher is a proxy of the shape charter rule 15's fourth recorded instance names; if it is chosen, say so deliberately. Also state whether the assertion file counts itself in its own discovered set. |
| **L5** | Where `src/features/<f>/client/**/*.test.ts`, `src/features/<f>/types/**/*.test.ts` and `src/app/**/*.test.ts` land in the partition. Master plan §10.3 (lines 679–693) enumerates `src/lib/**`, feature `components/`, feature `hooks/` and `test/setup/` only, while requiring a total partition. Phase 04's view-model and adapter tests live in `client/`. | plan gap (skeleton) | Amend master plan §10.3 to state the rule for every location under `src/` and `test/`, not four of them. Phase 01 writes the globs fourteen later phases live under. |
| **L6** | C4(b) and C4(c) require test files under `src/features/proposal-preparation/`, which the plan's "Not in this phase" (lines 17–19) forbids and its "Files expected to change" (lines 45–54) does not list. Their content (a component test needs a component) and their fate (permanent, or reverted with the probe) are undetermined. | plan gap | Amend "Not in this phase" and the file perimeter to admit the two collection probes explicitly, and state what they assert and whether they survive the phase. The feature name itself is determined — `proposal-preparation`, master plan §6.1 and §6.2. |
| **L7** | Task 2 — the theme layer, this phase's headline artifact — is asserted by no criterion. C1 checks the absence of literals in consuming code that this phase does not create; C3 checks only the 16 properties `globals.css` reads. Nothing asserts the theme layer carries design 01's corrected values. | plan gap | Add a criterion over the theme layer's content, sized to the answer to owner card 1. |
| **L8** | How much of design 01 the theme layer carries. Task 2 (lines 68–74) says express design 01's eight value tables; Notes bullet 4 (lines 138–139) says "the values V1 actually uses, not a taxonomy"; contract 15 §2:29 says a value is added "when a second consumer needs the same value, not in anticipation"; ratified intention §5.9 asks for a coherent foundation from those tables. Guide §6: an approved intention conflicting with a MUST is surfaced, never silently chosen. | intention gap | **Owner card 1.** Then make task 2 and the Notes agree, and size L7's new criterion to the answer. |
| **L9** | Task 7 — the documentation patch — is asserted by no criterion, while the plan's own Notes (lines 128–131) make a later phase's discovery of residual staleness a finding against this phase. | plan gap | Add a criterion over the documentation patch, or state in writing that it is verified by review rather than by test and accept the asymmetry deliberately. |
| **L10** | The task 7 patch perimeter is narrower than the staleness present. Beyond the enumerated rows: `architectural_contracts/README.md:9` and its tree diagram at `:128-129`; root `README.md:130-131` and `README.md:153` (finding F3). | plan gap | Widen task 7's enumeration to the full set, or state the residual explicitly so a later phase does not report it. |
| **L11** | Stale current-state statements outside every declared perimeter: contract `15-ui-styling-and-component-system.md:22` names `cx()` at `src/components/ui/cx.ts`, a file C5(b) forbids, inside §1 — a section master plan §5 selects as binding **as written**; and `12-anti-patterns.md:56` prescribes "A token in `src/styles/tokens.css`". Neither is in task 7, master plan §10.2 caveat 4 (line 672) or §11.3 item 2. | plan gap (+ skeleton) | Guide §6's stale-contract row applies and phase 01 is that dedicated change: add contract 15 §1's `cx()` sentence and contract 12's styling row to task 7, and add both to master plan §10.2 caveat 4 and §11.3 item 2. No rule is weakened by either patch. |
| **L12** | C5(e)'s probe for C5(d) requires introducing a forbidden dependency, while Notes bullet 3 (lines 135–137) says "This phase installs no package". Undetermined whether the probe edits `package.json` in place without installing, or the check is parameterised over an injectable manifest. Separately, a fixed four-name denylist means the probe proves only that the list contains the planted name. | plan gap | State the probe mechanism for the dependency row, and state whether the check is a name list or a pattern — and if a name list, record in the criterion what the probe therefore does and does not prove. |
| **L13** | The declared mutation set is not closed. Line 123–124 reads "5 named mutations (C1(b), C2(d), C3(b), C4(f), C5(e) — C5(e) is one probe per sub-row…)"; C5(e) is four probes, so the set is 8. Charter manifest properties 3 and 4; master plan standing rule 11. | plan gap | Re-derive and state one number. The row count (23) is correct as printed; the mutation count is not. |
| **L14** | Trace-cell admissibility. Master plan §7.4 (line 498) says a cell names **one** of three forms. C2's cell is `F6 · §12A.17`; C4's is `11 §1 · backend master plan §10.3 hazard`; C5's is `15 §4 · 12 "Styling and UI system" · intention §5.9`. `12 "Styling and UI system"`, `intention §5.9` and `backend master plan §10.3 hazard` are not admissible forms. | plan gap | Reduce each cell to its one admissible trace and move the supporting references into the criterion prose, or amend §7.4. |
| **L15** | C2's trace to `§12A.17` does not support what C2 asserts. §12A.17 (intention line 930) is a table of focus **destinations** after workspace transitions, ledger F24; C2 asserts the global CSS focus indicator and the reduced-motion treatment. `F6` alone supports the row. | plan gap | Drop `§12A.17` from C2's cell. This is the "trace to an entry that says something else" shape the doctrine names at step 6. |
| **L16** | C2(b) — "The indicator is not removed anywhere without an equivalent replacement" — names no instrument and no lexical rule, and `globals.css:106-108` already contains `:focus:not(:focus-visible){outline:none}`, a removal whose replacement is the rule above it. As written the row cannot fail. | plan gap | Give C2(b) an instrument and a rule, or fold it into C1's source-level check as an additional forbidden form, or cut it. |
| **L17** | C1's lexical rule: what counts as "a raw hex colour", "a raw `px` type size", and "a raw radius or shadow literal" in `.ts`/`.tsx` — Tailwind arbitrary values (`text-[13px]`, `rounded-[9px]`, `shadow-[0_18px_40px_rgba(0,0,0,.55)]`) included or not — and whether `.css` files under `src/**` other than the two named are in scope. | free choice | **Delegate in writing:** the implementer defines the rule and records it in the Review log, including which forms it deliberately does not catch. Contract 15 §2:31 names `text-[#1f5eff]` and `p-[13px]` as the signal, which is the natural anchor. |
| **L18** | C1(c) requires pointing the check "at a file it must read", but no file under `src/**` contains any styling value today (verified: zero hex literals in `src/`), and this phase creates none. The positive half of the scope assertion has no real subject. | plan gap | Amend C1(c) to name a synthetic fixture as the "must read" subject and state that it is synthetic. Unamended, this is charter rule 15's fifth-instance shape — an absence measured true only because the codebase never writes that form. |
| **L19** | Which reduced-motion treatment lands. `globals.css:110-118` collapses durations to `0.01ms`, which C2(c) asserts; design 01 §5 correction 6 asks instead that the pulse animation **hold at full opacity**, the spinner become a static ring plus text, and `fadeUp` be dropped. A `0.01ms` pulse settles on its `0%`/`100%` keyframe at `opacity:.25` — dimmed, not held. Standing rule 6 and design 10 §5 say the correction wins. | plan gap | Amend task 2 / C2(c) to state which treatment the theme layer and `globals.css` carry. Nothing animates in phase 01, so nothing bites now; the decision is made here and inherited by every later phase. |
| **L20** | Task 4 (lines 79–81) states `globals.css`'s scope as "the reset, base element typography, the focus treatment and the reduced-motion treatment" and cites contract 15 §3. Contract `15:46` states three items and does not name reduced motion. Master plan §6.2 (line 277) does sanction the four-item scope. | plan gap | Correct the citation to master plan §6.2, or add contract 15 §3's `globals.css` sentence to task 7's patch perimeter. As it stands the plan cites a binding section for a scope that section does not state. |
| **L21** | Five implementation choices the artifacts leave open, each with a real failure mode: (a) how `theme.css` reaches Tailwind's processing — an `@import` inside `globals.css` or an import in `layout.tsx`; a `@theme` block Tailwind never processes emits nothing; (b) `@theme` or `@theme static` — Tailwind 4.3.3 supports `static`, `inline`, `reference` and `default`, and `--space-4`/`--space-8` are consumed by no utility, so under the pruning default they may not reach `:root` at all; (c) whether `color-scheme: dark` is declared, design 01 §1.1 being a dark application; (d) the form of the design-delta "marker" task 3 asks for; (e) the file name behind "`src/styles/theme.test.ts` (or equivalent)". | free choice | **Delegate in writing**, each recorded in the Review log with the choice made. (b) is the one to flag to the implementer by name: it is exactly the failure C3(a) exists to catch, and L1 shows C3(a) cannot currently run. |

## Reality-check and decidability findings

Every path in "Files expected to change" resolves or is correctly marked new. Every section
cited in the plan's "Read first" list resolves and says what the plan claims, with the two
exceptions recorded as L20 and L15. The findings below are the ones with evidence beyond a
ledger row.

### F1 — Neither configured Vitest project can execute C2(a), C2(c) or C3(a)

C2 and C3 are explicit that they measure a rendered document, not a stylesheet
(`plans/phase-01-baseline-and-visual-foundation.md:117-118`). Against the configured DOM
project (`vitest.config.mts:33-42`, `jsdom ^30.0.1`, `package.json:40`):

- **`var()` is not resolved.** `node_modules/jsdom/lib/jsdom/living/css/CSSStyleDeclaration-impl.js:360`
  reads, in full, `// TODO: Resolve css var().` C3(a) asks that each property "resolves to a
  non-empty computed value on a rendered document"; jsdom returns the literal `var(--x)` text.
- **There is no media-query facility at all.** `matchMedia` does not appear anywhere in
  `node_modules/jsdom/`, and no `MediaQueryList` implementation file exists. C2(c) asks for a
  measurement under `prefers-reduced-motion: reduce`; jsdom cannot enter that condition, and
  `getComputedStyle` does not apply `@media` blocks.
- **The stylesheet never arrives.** `src/styles/globals.css:1` is `@import "tailwindcss"`,
  which requires PostCSS processing (`postcss.config.mjs`). Vitest does not process CSS
  imports into the jsdom document by default, and `vitest.config.mts` sets no `css` option.

Playwright can do all three — `reducedMotion` is in the installed
`playwright-core` types (`node_modules/playwright-core/types/types.d.ts:2725`) and Chromium is
present locally — but the plan routes nothing to Playwright except C6, and task 6 (lines 85–89)
reduces `e2e/bootstrap.spec.ts` to exactly two assertions while C6(a) says the spec asserts
"only what the tree renders".

**Consequence.** C3 is the criterion that guards master plan §10.2 caveat 2 — the concrete,
code-level half of conflict C-4, and the reason this phase exists. As written it cannot be run.
Ledger L1, L2, L21(b).

### F2 — The plan's own new test file is in the collection blind spot the phase exists to close

"Files expected to change" line 53 names `src/styles/theme.test.ts (or equivalent)`. No
Vitest project claims `src/styles/**`: the node project's includes are `vitest.config.mts:25-29`
and the jsdom project's are `vitest.config.mts:39`. The backend master plan's §10.3 hazard —
the very hazard C4's trace cell cites — enumerates the claimed prefixes as
"`src/lib/**`, `src/features/**`, `src/app/**`, `src/components/**` or `test/setup/`", which
does not include `src/styles/`. Master plan §10.3's repair contract (lines 679–693) enumerates
four locations and does not add one for `src/styles/**` either, while simultaneously requiring
that every `*.test.ts(x)` under `src/` be claimed by exactly one project — which C4(a) then
asserts. The phase's own foundation checks would therefore be silently uncollected unless the
implementer invents a glob the artifacts do not determine. Ledger L3, L5.

### F3 — The documentation-patch perimeter is enumerated, and the enumeration is short

Task 7 (lines 90–104) names, for `architectural_contracts/README.md`, the "Scaffold decisions
record" styling row, the "Resolved decisions" styling row, the CSS-Modules "Known conflicts"
row and the two `Component library: none decided` rows. Those resolve to
`architectural_contracts/README.md:76`, `:89`, `:152`, `:79` and `:92`. Not named, and equally
false against the tree:

- `architectural_contracts/README.md:9` — "a product-neutral shell (root layout, styling
  foundation, three shared primitives)".
- `architectural_contracts/README.md:128-129` — the tree diagram's `components/ui/` and
  "design tokens" entries.
- `README.md:130-131` — the same two entries in the root README's tree diagram.
- `README.md:153` — "Application shell, styling foundation, and shared UI primitives."

Task 7 names, for the root README, "the status paragraph" (`README.md:7`) and "the styling
line" (`README.md:167`); both resolve. Ledger L10.

### F4 — Two stale contract statements sit outside every declared perimeter

`architectural_contracts/15-ui-styling-and-component-system.md:22` — "`cx()`
(`src/components/ui/cx.ts`) composes conditional class names" — is a current-state claim about
a file C5(b) requires not to exist, and it sits in **§1**, which master plan §5 selects as
binding as written (only §2, §4 and §6 are selected "as drifted").
`architectural_contracts/12-anti-patterns.md:56` prescribes "A token in
`src/styles/tokens.css`, wired into the Tailwind theme" as the remedy for hard-coded values —
pointing at a deliberately deleted file, in a contract whose "Styling and UI system" section
C5's own trace cell cites. Neither appears in task 7, in master plan §10.2 caveat 4
(line 672), or in §11.3 item 2. Guide §6's "the contract is stale → patch the contract in its
own change, with rationale" applies, and the plan's own Files-expected-to-change note (lines
56–59) declares phase 01 to be that change. Ledger L11.

### F5 — Two of the nine tasks are asserted by no criterion

Task 2 builds the theme layer; task 7 corrects the stale documents. Neither is measured by C1–C6.
C1 measures the absence of literals in consuming code that this phase does not create — verified
vacuous today: a grep for hex literals across `src/**/*.ts(x)` returns nothing. C3 measures only
the 16 custom properties `globals.css` reads. The plan's Notes make the documentation patch
explicitly non-optional (lines 128–131) and make a later phase's discovery of residual staleness
a finding against this phase; nothing in the phase can detect that condition before it ships.
Ledger L7, L9.

### F6 — Verified accurate, recorded so the implementer does not re-derive them

These are the plan's and master plan's claims I checked and found true. They are not findings.

- **Master plan §10.2 caveat 2 is exact.** `src/styles/globals.css` references 16 distinct
  custom properties. Exactly seven — `--color-bg`, `--color-fg`, `--color-fg-muted`,
  `--color-accent`, `--color-focus`, `--space-4`, `--space-8` — are absent from
  `node_modules/tailwindcss/theme.css`; the other nine (`--font-sans`, `--font-mono`,
  `--text-base`, `--text-sm`, `--text-lg`, `--text-xl`, `--text-2xl`, `--leading-normal`,
  `--leading-tight`) are defined there.
- **Master plan §10.2 caveat 3 is exact.** `npx vitest list` (a collection listing, not a run)
  reports 11 test files, all in the `node` project; the `jsdom` project collects **zero**. The
  11 files on disk under `src/` and `test/` are the same 11, so the tree is currently partitioned
  by accident, not by construction — the gap opens the moment a feature or styles test is added.
- **Master plan §10.2 caveat 1 is correctly derived.** `e2e/bootstrap.spec.ts:7-8` asserts a
  `banner` role and a visible `main`; `:15` asserts a focused "Skip to content" link.
  `src/app/layout.tsx:20-24` renders `<html><body>{children}</body></html>` and
  `src/app/page.tsx:1-3` returns `null`. None of the three exists. The title assertion at `:6`
  is true — `layout.tsx:8` sets the default title to "Proposal Copilot".
- **C6(b) is executable.** Playwright Chromium is installed locally
  (`~/Library/Caches/ms-playwright/chromium-1234` among others), and `playwright.config.ts:9-13`
  starts `npm run dev` itself.
- **The feature name C4(b)/(c) leave as `<feature>` is determined** — `proposal-preparation`,
  fixed by master plan §6.1 and §6.2. Only the perimeter and the probe files' content are open
  (L6).
- **C5's four absence rows are decidable as stated** against the tree: `src/styles/tokens.css`
  does not exist, `src/components/ui/` does not exist, no `*.module.css` exists under `src/`,
  and `package.json` carries no CSS-in-JS, styled-components, Emotion or SCSS dependency. Only
  the probe mechanism for row (d) is open (L12).
- **The plan header's `Projection | waivable` and master plan §4's "projection not waived" do
  not conflict.** §7.2 (line 447) lists phase 01 as waivable; the tracker records that the
  coordinator chose not to waive it. Both statements are true.

## Trace verification, both directions

Per master plan §7.4 (line 498), an admissible trace cell names **one** of: a ledger ID `F1`–`F30`;
a mechanism contract `§12A.1`–`§12A.23`; or an architecture contract section in `15 §2` form,
and the last **only** for the criteria §7.4 enumerates — which for this phase are C1 and C3
(`15 §2`), C4 (`11 §1`), C5 (`15 §4`) and C6 (`11 §3`, added to the enumeration 2026-09-06).

### Forward — does each row's trace resolve and support what the row asserts?

| Criterion | Cell as written | Admissible? | Supports the row? |
|---|---|---|---|
| C1 | `15 §2` | yes — enumerated | yes. Contract `15:28` — "Values are defined once … never duplicated … or repeated as literals in components" — is exactly what C1 asserts |
| C2 | `F6 · §12A.17` | **partly** — two forms where §7.4 says one | `F6` yes: the ledger entry names visible focus and reduced motion. **`§12A.17` no**: it is a table of focus *destinations* after workspace transitions (ledger F24), and asserts nothing about a focus indicator or a motion treatment. Ledger L15 |
| C3 | `15 §2` | yes — enumerated | yes, and it names the live defect precisely (master plan §10.2 caveat 2, verified above) |
| C4 | `11 §1 · backend master plan §10.3 hazard` | **partly** — `11 §1` is enumerated; the second is not an admissible form | both resolve and both support the row. The backend hazard is reachable in this worktree at `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md:565` and says exactly what the cell claims — but it is **not in the plan's Read-first list**, so the implementer receives a citation they were not given. Ledger L14 |
| C5 | `15 §4 · 12 "Styling and UI system" · intention §5.9` | **partly** — `15 §4` is enumerated; the other two are not admissible forms | all three resolve and support the row. Note `15 §4` is itself a stale section this phase patches, which is coherent — the row guards the tree against the document, not the document against the tree. Ledger L14 |
| C6 | `11 §3` | yes — enumerated 2026-09-06 | yes |

No row is untraced.

### Reverse — is every entry the phase claims to serve served by a row?

Master plan §7.3 (line 465) assigns phase 01 exactly one ledger entry: **F6**. C2 serves it.
✅ satisfied at the ledger level.

The plan header's own `Serves` line (line 8) claims more than the ledger does, and part of it
is unserved:

| Header claim | Served by | Status |
|---|---|---|
| `F6` | C2 | ✅ |
| `15 §2` | C1, C3 | ✅ |
| `15 §4` | C5 | ✅ |
| `11 §1` | C4 | ✅ |
| intention §14.3 item 4 (how component and hook verification is collected) | C4(b), C4(c) | ✅ |
| intention §14.3 item 1 — reconciling the end-to-end spec | C6 | ✅ |
| intention §14.3 item 1 — deciding the authoritative visual-foundation representation | — | ❌ no row (L7) |
| intention §14.3 item 1 — patching the stale documents | — | ❌ no row (L9) |
| conflict C-4 | C5 partly (nothing deleted is restored) | ⚠️ the documentation half is unserved (L9) |
| `11 §3` (C6's actual trace) | C6 | ⚠️ present as a criterion trace, absent from the header's list |

## Gate check

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Intention ratified | **PASS** | `intention/frontend-core-intention.md:5` — the Status value begins `RATIFIED` (2026-09-05, by the owner, David) |
| 2 | No open owner decision | **PASS** | same file, `:1196` — heading reads `## 15. Ratified owner decisions (0 open)`; the status line's closing clause reads "no owner decision is open" |
| 3 | The phase is unstarted (master plan) | **PASS** | `master-plan.md:169` — row `01`'s State cell reads `NOT_STARTED` |
| 4 | The plan agrees | **PASS** | `plans/phase-01-baseline-and-visual-foundation.md:5` — State row reads `NOT_STARTED` |
| 5 | The phase is genuinely unimplemented | **PASS** | `src/styles/` contains only `globals.css`; `src/styles/theme.css` does not exist |
| 6 | This round is genuinely outstanding | **PASS** | `handoffs/reviewer/` contained only `.gitkeep` at session start |

No gate failure. The untracked `build_docs/future_implementations/` was observed and left
alone, per the prompt's environment note; it is the only untracked path in the tree.

## Write perimeter

**Documents written — one, this file:**
`build_docs/under_constroction/frontend_core/handoffs/reviewer/phase-01-projection-round-0.handoff.reviewer.md`

**Commands run** (all read-only; none modified the tree):
`ls`, `cat`, `sed -n`, `head`, `grep`, `find`, `wc -l`, `awk` over the repository's own
documents and over `node_modules/` for the jsdom, Tailwind and Playwright capability evidence;
`git log --oneline -3`; `git status --porcelain`;
`node -e "console.log(require('./node_modules/<pkg>/package.json').version)"` for the jsdom and
Tailwind versions; and **`npx vitest list`** (plus `--project node` / `--project jsdom`), which
the prompt names as permitted and which is what decides C4's current state. No pre-run
authorization line was needed, because no command exceeded read-only inspection.

**Explicit statements:**
- No code changed. No file under `src/`, `test/`, `e2e/`, or any configuration file was edited.
- No plan was edited. No intention was edited. No architecture contract was edited. No design
  specification under `ui_design/` was edited. No master plan section was edited.
- No dependency was installed, added, or removed. `package.json` and `package-lock.json` are
  untouched.
- **No suite, build, or end-to-end run was taken.** `npm test`, `npm run build`,
  `npm run test:e2e`, `npm run typecheck` and `npm run lint` were not run. The L4 budget for
  this session was zero and zero was spent, so phase 01 task 1's authoritative baseline
  re-enumeration remains the implementer's to make on the tree they receive.
- No mutation probe was planted; no test was authored.
- No skeleton is attached. The paper derivation this session performed was discarded rather
  than appended, deliberately: an appended sketch reaching the implementer would make this
  session a second planner, which is the coupling the fresh-session rule exists to prevent.
- **No architecture graph exists in this worktree**, so there is no graph delta to report.
- The phase plan's Review log was **not** written; the coordinator writes that line when it
  consumes this handoff. The tracker row was **not** updated.

**Tree identity at session close:** `48ac8cd`, with `git status --porcelain` reporting only
`?? build_docs/future_implementations/` — the pre-existing untracked directory the prompt
attributes elsewhere — plus this handoff file.
