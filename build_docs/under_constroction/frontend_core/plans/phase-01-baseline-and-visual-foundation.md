# Phase 01 — Repository baseline, visual foundation, test collection

| | |
|---|---|
| **State** | `IMPLEMENTED` |
| **Criteria** | 8 |
| **Projection** | not waived; round 0 returned `AMENDMENTS_REQUIRED` (21 rows), all routed 2026-09-06 |
| **Serves** | F6 · `15 §2` · `15 §4` · `11 §1` · `11 §3` · intention §14.3 items 1 and 4 · conflict C-4 |

## Goal

Make the repository internally consistent and establish the production visual foundation, so
that every later phase styles from one definition, writes tests that are actually collected,
and reads current-state documents that are true. This phase closes conflict C-4 (intention
§13) at the code level and at the documentation level.

**Not in this phase:** the workspace shell, any landmark, any session concept, any feature
component, any hook, any product surface, and any restoration of the deleted `tokens.css` or of
the three deleted `src/components/ui/` primitives. This phase adds no product surface.

**Admitted explicitly, as the exception to the line above** (projection L6): two **collection
sentinel test files** under `src/features/proposal-preparation/` — one `.test.tsx` under
`components/`, one `.test.ts` under `hooks/`. They are tests, not product code: they contain no
component and no hook, they assert only the environment they were collected into, and they are
**permanent** — they are the standing guard that the runner partition still holds when a later
phase changes it. C4(b) and C4(c) are discharged by them and cannot be discharged without them.

## Read first

- Master plan §2, §5, §6.1, §6.3, §6.4, **§6.5A (the theme layer's scope — owner decision 13)**,
  §9, §10 (all of §10 — this phase acts on every caveat in §10.2), **§10.3A (what no Vitest
  project can measure)**, §11.3.
- Intention §2.1 (repository state and the verification baseline), §4 (the styling and
  accessibility constraints), §5.9 (visual foundation), §13 conflict **C-4**, §14.3 items 1
  and 4, §15.1 item (k).
- `ui_design/01-visual-system.md` in full — §1.1–§1.12 are the values, §5 is the set of
  **required production corrections that win over the prototype values**, §6 is the state
  matrix every control must define.
- `ui_design/10-design-integration-guide.md` §1, §4, §5, §7.
- Contracts: `15-ui-styling-and-component-system.md` §1–§6, `05-client-architecture.md` §7,
  `11-testing-principles.md` §1–§3, `12-anti-patterns.md` "Styling and UI system",
  `14-documentation-principles.md` §8, `13-decision-checklist.md` §5 and §8.
- **Backend master plan §10.3** — the test-collection hazard C4's trace cell cites. Added to
  this list 2026-09-06 (projection L14): the criterion cited it while the plan did not give it
  to the implementer. It is reachable in this worktree at
  `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md`.
- The repository as it is: `src/styles/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`,
  `vitest.config.mts`, `vitest.setup.ts`, `test/setup/node.ts`, `e2e/bootstrap.spec.ts`,
  `postcss.config.mjs`, `playwright.config.ts`, `README.md`,
  `architectural_contracts/README.md`.

## Dependencies

None. This is the first phase.

## Files expected to change

```
src/styles/theme.css                     new — the Tailwind theme layer, the single definition
src/styles/globals.css                   edited — reset, base typography, focus, reduced motion
src/styles/theme.test.ts                 new — the source-level foundation checks (node project)
vitest.config.mts                        edited — project globs that partition the tree
e2e/bootstrap.spec.ts                    edited — reduced, and gains the browser-measured rows
README.md                                edited — status paragraph, tech-stack truth, tree diagram
architectural_contracts/README.md        edited — scaffold, resolved-decision, known-conflict,
                                                  shell sentence, tree diagram
architectural_contracts/15-ui-styling-and-component-system.md   edited — §1, §2, §3, §4, §6
architectural_contracts/12-anti-patterns.md                     edited — the styling row
src/features/proposal-preparation/components/collection-sentinel.test.tsx   new — C4(b)
src/features/proposal-preparation/hooks/collection-sentinel.test.ts         new — C4(c)
```

The contract-folder files are patched **as stale current-state documents**, per contract 14 §8
and the guide §6's "the contract is stale → patch the contract in its own change, with
rationale". **No rule in any of them is weakened**: the promotion rule, the inline-style rule
and the one-mechanism rule survive verbatim. Only the description of what exists changes,
alongside recording the primitive-library and icon decisions the owner already took.

The perimeter was widened on 2026-09-06 (projection L10, L11): contract 15 §1 and §3 and
contract 12 were not in the original list and carry stale statements of the same class. Master
plan §10.2 caveat 4 carries the full enumeration and is the authority for what must be patched.

## Ordered tasks

1. **Re-enumerate the baseline before changing anything.** Run `npm run typecheck`,
   `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`, and record the exact
   observed result of each with the tree identity, in the Review log. Master plan §10.2 caveat
   1 predicts the end-to-end step is red; confirm or correct that prediction rather than
   assuming it. **Every baseline statement in §10.2 was derived by reading and none has been
   observed** — this task is the observation.
2. **Establish the theme layer, at the scope master plan §6.5A fixes.** Express design 01's
   surface, border, ink, semantic, radius, shadow, type and motion **base ramps** through
   Tailwind's theme mechanism, in one file, **with design 01 §5's required corrections
   applied** — the lightened muted ramp, the readable ask-agent affordance, the darkened
   primary action or dark ink on the accent, never the accent as text on a dark surface, the
   global focus ring, and reduced motion. Where the corrected value and the prototype value
   differ, the correction is what lands, and the difference is recorded as a delta, not as a
   rewrite of the specification.
   **Declare no semantic layer, no component-level value, and no multi-theme scale** — that is
   the half contract 15 §2 prohibits, and §6.5A is the owner's ratified reading of the conflict
   between it and intention §5.9.
3. **Collapse what design 01 asks to be collapsed only where the specification says so.** The
   six-step border ramp and the half-pixel type ladder are design 01's own open questions
   (delta 11 in master plan §11.2). V1 implements the current specification behaviour, leaves
   a marker, and reports; it does not settle them.
4. **Repair `globals.css`.** Every custom property it references resolves. Keep it to the
   reset, base element typography, the focus treatment and the reduced-motion treatment —
   **the four-item scope master plan §6.2 sanctions**; feature rules never go there.
   *(Citation corrected 2026-09-06, projection L20: this plan previously cited contract 15 §3
   for the four-item scope, and §3 states three items and does not name reduced motion. §3 is
   in task 7's patch perimeter for exactly that reason.)*
   The blanket reduced-motion rule collapses transition and animation durations, which is
   correct **as a floor**. Design 01 §5 correction 6's per-animation treatments are registered
   as master plan §11.3 follow-up 9 and belong to the phases that introduce those animations;
   nothing animates here.
5. **Repair the test-runner configuration** to the partition rule in master plan §10.3, which
   is total by construction. Then prove it: the two collection sentinels of the "Not in this
   phase" exception above, and `npx vitest list` claiming every discovered file exactly once.
6. **Reduce `e2e/bootstrap.spec.ts`, and give it the browser-measured rows.** Reduce the
   existing assertions to what the tree this phase leaves actually renders — the document
   title, and that `/` renders without a client or server error. Delete the banner, `main` and
   skip-link assertions and the whole second test; phase 02 writes the real workspace spec.
   Do not add a landmark to `src/app/` to satisfy the old spec: that would pre-empt phase 02
   and risk a second `main` (§12A.23).
   **Then add C2's and C3's rows to this spec**, because master plan §10.3A establishes that no
   Vitest project can measure a rendered document's computed style in this repository. Their
   subject is a **native control the test injects into the running `/` document and disposes
   with the page** — the application renders none, and adding one would be a product surface
   this phase forbids. The injected control inherits the real, PostCSS-processed global
   stylesheet, which is precisely what these rows exist to measure.
7. **Patch the stale documents to current truth**, all in this change. Master plan §10.2 caveat
   4 is the authoritative enumeration; it names, in the root `README.md`, the
   `architectural_contracts/README.md`, contract 15 §1, §2, §3, §4 and §6, and contract 12's
   styling row. In particular:
   - the two `Component library: none decided` rows record **Radix UI Primitives (headless,
     per-widget packages) and Lucide React**, with the widget that justified the adoption named
     — the session tab strip's tablist mechanics and the anchored ask-agent surface — per
     contract 15 §5 and 13 §5;
   - contract 15 §5's "intentionally undecided" status is replaced by the recorded decision;
   - contract 15 §1's `cx()` sentence and contract 12's `tokens.css` remedy no longer name
     deleted files;
   - contract 15 §3's `globals.css` sentence states the four-item scope task 4 implements.
   **Scope fence:** the **root** README's tech-stack table gains its Radix and Lucide rows in
   **phase 03**, when the first primitive package actually lands (master plan §11.3 follow-up
   6). This phase touches the root README's status paragraph, styling line, tree diagram and
   shell sentence only.
8. **Do not restore what was deliberately deleted.** No `src/styles/tokens.css`, no
   `src/components/ui/` primitive, no CSS Module. A shared primitive is created only when the
   promotion rule is actually met, which it is not in this phase.
9. Closeout: contract 14 §8's impact review, then the tracker row and the Review log.

## Acceptance criteria

Every row is addressable and carries its trace cell. Master plan §7.4 governs the cells: one
measurement anchor, optionally followed by supporting citations.

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The project's visual values are defined **once**, and the focus indicator is never silently removed. (a) A source-level check over `src/**` finds no raw hex colour, no raw `px` type size, and no raw radius or shadow literal outside the theme layer and `globals.css`. **The implementer defines the exact lexical rule** — including whether Tailwind arbitrary values (`text-[13px]`, `rounded-[9px]`, `shadow-[…]`) are caught, and which `.css` files under `src/**` are in scope — anchored on contract 15 §2's own signal examples (`text-[#1f5eff]`, `p-[13px]`), and **records it in the Review log together with the forms it deliberately does not catch** (delegated, projection L17). (b) The same check finds no `outline: none` and no `outline: 0` under `src/**` outside a stated allowlist, which today holds exactly one entry: the `:focus:not(:focus-visible)` rule in `globals.css` whose replacement is the `:focus-visible` rule above it. (c) Planted-defect probe for (a): introduce a raw hex colour in a consuming file, observe the check redden, revert. (d) Planted-defect probe for (b): add a second `outline: none` outside the allowlist, observe the check redden, revert. (e) The check's own scope is asserted — it reads the files it claims to read, proven by pointing it at a file it must ignore and at a **synthetic fixture** it must read. The fixture is **stated as synthetic in the test**, because no file under `src/**` carries a styling value today and this phase creates none outside the theme layer; without it the positive half of the scope assertion has no subject and measures nothing. | 5 | `15 §2` · contract 15 §2's signal examples — guards a visual value drifting across components, which is invisible until two surfaces disagree, and a focus indicator removed without replacement |
| **C2** | The global accessibility treatment is reachable by the **shipped default configuration**, measured in the browser. (a) `:focus-visible` produces a visible indicator on a **native control the test injects into the running `/` document** and disposes with the page, rendered with no component-level styling. (b) Under `prefers-reduced-motion: reduce`, transition and animation durations collapse for every element, asserted by rendering with Playwright's `reducedMotion` context option rather than by reading the stylesheet. (c) Planted-defect probe: delete the reduced-motion block, observe (b) redden, revert. | 3 | F6 — accessibility deferred to a later pass is the defect family; an unreachable default is the shape it hides in |
| **C3** | `src/styles/globals.css` references no custom property that has no definition, measured in the browser. (a) Every custom property the file reads resolves to a non-empty computed value on the running `/` document — **enumerated one row per property the file references**, not sampled. The file references sixteen today; seven of them have no definition anywhere, which is the live defect. (b) Planted-defect probe: remove one property's definition from the theme layer, observe its row redden, revert. | 2 | `15 §2` · master plan §10.2 caveat 2 — guards the exact live defect where the base layer silently has no background, foreground or focus colour |
| **C4** | Test collection partitions the tree. (a) Every `*.test.ts(x)` under `src/` and `test/` is claimed by **exactly one** Vitest project — asserted as a set relation over the discovered files and the configured projects, not as a count. **The instrument is `npx vitest list`, spawned by the test and read for what the runner actually collects** — not a glob matcher re-derived inside the test, which would be a proxy for collection rather than collection itself and is the shape charter rule 15's fourth recorded instance names. The assertion file counts itself in its own discovered set. (b) The component sentinel at `src/features/proposal-preparation/components/collection-sentinel.test.tsx` is collected, in a DOM environment, asserted by the file itself. (c) The hook sentinel at `src/features/proposal-preparation/hooks/collection-sentinel.test.ts` is collected, in a DOM environment, asserted by the file itself. (d) A library test under `src/lib/**` is collected in the `node` environment with the offline `fetch` guard installed. (e) The DOM project also installs the offline `fetch` guard — a preservation row: `vitest.setup.ts` already calls `installOfflineFetchGuard()`, and this row exists so the repair does not drop it. (f) `src/styles/theme.test.ts`, this phase's own new test file, is collected in the `node` project. (g) Planted-defect probe: place a test file outside every include glob, observe (a) redden, revert. | 7 | `11 §1` · backend master plan §10.3 hazard · master plan §10.3 — a test claimed by no project is silently not collected and the suite stays green, which is the failure this project would otherwise ship into every later phase |
| **C5** | Nothing deliberately deleted is restored, and no second styling mechanism appears. (a) `src/styles/tokens.css` does not exist. (b) No file exists under `src/components/ui/`. (c) No `*.module.css` exists under `src/`. (d) No CSS-in-JS, styled-components, Emotion or SCSS dependency is present. **The check reads a manifest path it takes as a parameter, defaulting to `package.json`**, and it is a **fixed name list**: the criterion records that it therefore proves membership of that list and does not catch an unlisted styling dependency. (e) Each of (a)–(d) ships with its **planted-defect probe**: create the forbidden artefact, observe the row redden, revert — because measuring an absence proves the absence, not that the instrument could observe the presence. **(d)'s probe points the check at a fixture manifest carrying a forbidden dependency; it installs no package and does not edit `package.json`**, which is what keeps it compatible with this phase installing nothing. | 5 | `15 §4` · `12` "Styling and UI system" · intention §5.9 — guards the stale documents bootstrapping themselves into authority and recreating a foundation the owner deleted |
| **C6** | The end-to-end suite is green against the tree this phase leaves. (a) `e2e/bootstrap.spec.ts` asserts only what the tree renders. (b) `npm run test:e2e` passes. (c) The spec contains no assertion about a landmark, a skip link, or a shell, so that phase 02 writes the workspace spec rather than inheriting a half-true one. C2's and C3's browser-measured rows are not shell assertions and do not violate this. | 3 | `11 §3` — guards a permanently red CI step being normalised into "expected", which is how a real end-to-end regression later goes unnoticed |
| **C7** | The theme layer is the corrected foundation, and nothing more. (a) Design 01 §5's required corrections are the values that landed where the corrected value and the prototype value differ — **enumerated one row per correction**, measured on the running `/` document. (b) The theme layer declares no semantic-layer name, no component-level value, and no multi-theme scale (master plan §6.5A, contract 15 §2's taxonomy prohibition) — a source-level absence row. (c) Planted-defect probe for (b): declare a component-level value in the theme layer, observe (b) redden, revert. **Value-by-value fidelity of the ramps to design 01's tables is deliberately not asserted here**: a test transcribing the same table into assertions proves only that two copies of one table agree. The reviewer reads the ramp against design 01, and master plan §6.5A records that as the chosen instrument. | 3 | F6 · master plan §6.5A · design 01 §5 — guards the corrections silently losing to the prototype values they exist to overrule, and the taxonomy the owner declined |
| **C8** | The stale current-state documents are true after this phase. (a) No document in task 7's perimeter makes an unqualified current-state reference to a deleted artefact — `src/styles/tokens.css`, `src/components/ui/`, a CSS Module foundation, or "three shared primitives" — enumerated one row per document, where a reference on a line marked as historical (naming the deletion) is permitted and an unmarked one is not. (b) Both `Component library: none decided` rows name Radix UI Primitives and Lucide React with the widget that justified each, so the patch is a correction rather than a deletion. (c) Planted-defect probe: reintroduce one unqualified reference, observe its row redden, revert. **The rule's limit is recorded in the criterion**: it catches the named artefacts, not every future false sentence. | 3 | `14 §8` · conflict C-4 · master plan §10.2 caveat 4 — guards the documentation half of C-4, which this plan's own Notes make a finding against this phase if a later phase discovers it |

**Derived totals for this phase, re-derived at dispatch:** 8 criteria; rows 5 + 3 + 2 + 7 + 5 +
3 + 3 + 3 = **31**; named mutations C1 **2** (c, d) · C2 1 (c) · C3 1 (b) · C4 1 (g) · C5 **4**
(one probe per absence sub-row a–d) · C6 0 · C7 1 (c) · C8 1 (c) = **11**.

## Notes

- **The documentation patch is not optional and is not cosmetic.** Contract 14 §1 requires
  current-state documents to be true, and the guide §6 requires a stale contract to be patched
  in a dedicated change with rationale. This phase is that change. A later phase that finds one
  of these documents still stale reports it as a finding against this phase — which is why C8
  exists: before 2026-09-06 the plan carried that consequence with nothing in the phase able to
  detect the condition before it shipped.
- **The design specifications are not edited here or anywhere.** Where a design 01 §5
  correction changes a prototype value, that is the correction winning (design 10 §5), recorded
  as a delta — not a specification edit.
- **This phase installs no package.** Radix packages arrive with the widgets that justify them
  (master plan §6.1); the README recording in task 7 records the decision the owner already
  took, which is what contract 15 §5 asks for. C5(d)'s probe is designed around this (it points
  the check at a fixture manifest rather than installing anything).
- The MVP scope brief applies: the theme layer carries design 01's base ramps with the
  corrections applied, and no taxonomy on top. Master plan §6.5A is the authority and resolves
  what this bullet and task 2 previously contradicted each other about.
- **Five implementation choices are delegated to the implementer in writing** (projection L21),
  each recorded in the Review log with the choice made and why: (a) how `theme.css` reaches
  Tailwind's processing — an `@import` inside `globals.css` or an import in `layout.tsx`; a
  `@theme` block Tailwind never processes emits nothing; (b) **`@theme` versus `@theme static`**
  — flagged by name, because Tailwind 4.3.3 prunes unused theme values under the default and
  `--space-4` / `--space-8` are consumed by no utility, so under pruning they may never reach
  `:root` at all. This is exactly the failure C3(a) exists to catch, which is why C3 had to
  become a browser measurement; (c) whether `color-scheme: dark` is declared, design 01 §1.1
  being a dark application; (d) the form of the design-delta marker task 3 asks for; (e) the
  file name behind `src/styles/theme.test.ts`.

## Review log

**2026-09-06 — coordinator, consuming projection round 0 (`AMENDMENTS_REQUIRED`, 21 rows).**
All 21 ledger rows routed. Amendments applied to this plan: L1/L2 (task 6 and C2/C3 moved to
Playwright with an injected native control as their subject), L3/L5 (master plan §10.3 made
total; C4(f) added), L4 (C4(a)'s instrument fixed to `npx vitest list`, self-counting stated),
L6 (the two collection sentinels admitted in "Not in this phase" and in the file perimeter,
declared permanent), L7 (C7 added), L9 (C8 added), L10/L11 (task 7's perimeter widened via
master plan §10.2 caveat 4), L12 (C5(d)'s injectable manifest and its recorded limit), L13
(totals re-derived: 31 rows, 11 mutations), L15 (`§12A.17` dropped from C2's cell), L16 (C2(b)
folded into C1(b) with its own probe C1(d)), L17 (C1(a)'s lexical rule delegated in writing),
L18 (C1(e)'s synthetic fixture), L19 (the blanket collapse kept as a floor; per-animation
corrections registered as master plan §11.3 follow-up 9), L20 (task 4's citation corrected to
master plan §6.2 and contract 15 §3 added to the patch perimeter), L21 (five choices delegated
in writing, (b) flagged by name). Master plan amendments: §6.5A, §7.4, §10.2 caveat 4, §10.3,
§10.3A, §11.3 items 2 and 9, §11.1, tracker row 01.

**L8 resolved by owner decision 13 (2026-09-06): the flat base set.** Master plan §6.5A carries
the decision, the conflict it resolves, and why the two alternatives were declined.

**One ledger row was routed differently from its proposal, declared here rather than silently
diverging.** L14 proposed reducing three trace cells because master plan §7.4 said a cell
"names **one** of" three forms, and C2, C4 and C5 carry two or three citations each. Checked
against the artifact set before applying: **110 of the project's 113 criterion rows carry more
than one citation**, so multi-citation cells are the planner's deliberate convention across all
seventeen plans, and reducing them would have deleted real authority project-wide. The property
§7.4 actually protects was then tested mechanically over all 113 rows — *every row carries a
measurement anchor unless it is one of the enumerated architecture-contract exceptions* — and
it held: exactly six rows carry no `F` or `§12A` anchor, and they are exactly the six §7.4
enumerates. §7.4's description of the vocabulary was corrected instead; no criterion row's
citations were reduced. **L15 is unaffected and was applied as proposed**: `§12A.17` is a table
of focus destinations serving F24 and does not support what C2 asserts, which is a defect of
support rather than of admissibility.

**Projection session hygiene, verified on consumption.** Declared write perimeter (one file,
its own handoff) matched the tree exactly. Evidence budget was zero L4 and zero was spent, so
task 1's baseline re-enumeration is intact and unspent. Its load-bearing claims were
independently re-verified before routing, with variation: jsdom's missing `var()` resolution
and absent `matchMedia`/`MediaQueryList` confirmed at source; C1's vacuity confirmed and
widened (zero hex, zero `rgb()`/`hsl()`, zero `px` literals in `src/**/*.ts(x)`, zero hex in
`src/**/*.css`); the four unnamed stale README lines and both stale contract statements
confirmed verbatim; contract 15 §3's three-item scope confirmed.

---

**2026-09-06 — implementer (Claude Sonnet 5), round 1, `IMPLEMENTED`.**

**Baseline re-enumeration (task 1), on the tree at `7b741aa`.** All three §10.2 predictions
confirmed, none corrected: `npm run typecheck` clean; `npm run lint` clean; `npm test` 11
files / 118 tests, all passed (matches intention §2.1 exactly); `npm run build` clean;
`npm run test:e2e` red on both tests (`banner` not found, "Skip to content" link not found) —
confirmed by reading `node_modules/tailwindcss/theme.css`: the five `--color-*` and two
`--space-*` globals.css reads have no definition anywhere; the other nine (`--font-*`,
`--text-*`, `--leading-*`) are Tailwind defaults. No correction to master plan §10.2 was
needed.

**What was built.**
- `src/styles/theme.css` — the Tailwind theme layer, one `@theme static` block expressing
  design 01's surface, border, ink, semantic, radius, shadow, type and motion base ramps,
  with design 01 §5's six required corrections applied.
- `src/styles/globals.css` — repaired (all sixteen `var()` references it now makes resolve;
  the set changed slightly, see judgment call below); `@import "./theme.css"` added;
  `color-scheme: dark` added; the `a` rule's ink corrected; a design-delta marker comment
  added for task 3's open questions.
- `src/styles/theme.test.ts` (new, node project) — C1(a,b,e), C4(a,e,f), C5(a–d), C7(b),
  C8(a,b), plus the C6(a)/(c) source-presence checks. 17 tests.
- `vitest.config.mts` — repaired to master plan §10.3's total-by-construction partition rule.
- `e2e/bootstrap.spec.ts` — reduced to what the tree renders (title + no client/server error),
  plus C2(a,b), C3(a) (one test per property globals.css actually references, derived at
  file-load time, not hardcoded), and C7(a)'s six correction rows. 26 tests, all against an
  injected native control that is created and removed within each test.
- `src/features/proposal-preparation/components/collection-sentinel.test.tsx` and
  `.../hooks/collection-sentinel.test.ts` (new, permanent) — C4(b), C4(c).
- Eight documents patched to current truth (task 7): root `README.md` (status paragraph,
  styling line, tree diagram, shell sentence, plus the features-folder sentence and the
  Vitest testing-strategy sentence — both made stale by *this phase's own* task 5 repair,
  patched under contract 14 §8's standing instruction rather than under C8, which scopes to
  deleted-artifact references only); `architectural_contracts/README.md` ("Status of the
  codebase", both Scaffold/Resolved "Component library" rows, the styling rows, the tree
  diagram, the CSS-Modules Known-conflicts row — removed as moot, the underlying code no
  longer exists to convert); `15-ui-styling-and-component-system.md` §1 (`cx()`), §2 (tokens →
  theme layer), §3 (four-item scope), §4 (`components/ui/` today: none), §5 (decided:
  Radix + Lucide), §6 (rewritten: no CSS-Modules foundation exists); `12-anti-patterns.md`'s
  styling row.
- No package installed; `package.json`/`package-lock.json` unchanged. No `tokens.css`, no
  `src/components/ui/`, no `*.module.css`.

**Delegated decisions (Notes item; each recorded here with its reason).**
1. **C1(a)'s lexical rule.** Scanned: every `.ts`/`.tsx`/`.css` under `src/**`, excluding
   `*.test.ts(x)` and the two definition sites. Comments stripped before scanning `.ts/.tsx`
   (a value named in prose, as this file's own comments do, is not a consumed value). A raw
   hex is `#` + 3/4/6/8 hex digits anywhere outside a comment (catches Tailwind arbitrary
   brackets too, per contract 15 §2's own `text-[#1f5eff]` example). A raw px type size is a
   `text-[...px...]` bracket or a bare `font-size:<n>px` outside `var()` in `.css`. A raw
   radius/shadow is a `rounded(-*)-[...]`/`shadow-[...]` bracket or a bare
   `border-radius`/`box-shadow` outside `var()` in `.css`. **Deliberately not caught**: a bare
   numeric literal with no unit/colour context (z-index, array length); a non-Tailwind
   arbitrary-value bracket for a property outside C1's scope (`w-[240px]`, `top-[12px]` —
   layout/position, not colour/type/radius/shadow); anything in a comment; anything in a test
   file. This is a lexical scan, not an AST parse — recorded as a stated limitation, adequate
   at this repository's MVP scope (master plan §3 owner brief).
2. **How `theme.css` reaches Tailwind's processing.** `@import "./theme.css";` inside
   `globals.css`, immediately after `@import "tailwindcss";` — the single existing CSS entry
   point already reaches every consumer via `layout.tsx`'s one import; no second import chain
   to maintain.
3. **`@theme` vs `@theme static`.** `@theme static`, for the reason the plan names by name:
   `--space-4`/`--space-8` (and most of the ramp) are consumed by no generated Tailwind
   utility yet, so under the default `@theme` they would be pruned and never reach `:root` —
   exactly C3(a)'s live defect. `static` forces every declaration to always emit, verified by
   the closing e2e run (all sixteen `--space-*`/`--color-*`/etc. rows green).
4. **`color-scheme: dark`.** Declared globally on `html` (not scoped to a future date input):
   design 01 §1.1 is a dark application with no light mode in V1; every future native control
   should render dark by default, not only the one control design 01 happens to mention.
5. **The design-delta marker form (task 3).** A CSS comment block at the top of `globals.css`
   naming master plan §11.2 register #11 and stating current-spec behaviour is implemented
   (the border ramp is not collapsed; type sizes are not snapped).
6. **`theme.test.ts`'s internal file name.** No separate helper module: the scanning logic
   (raw-value scanner, `vitest list` runner, dependency-manifest reader, theme-property-name
   reader) lives inline in the one test file, since each is small and has exactly one caller.

**Other judgment calls, recorded.**
- **globals.css's referenced-property set changed, deliberately.** The `a` rule previously
  read `--color-accent` (#3b82f6); design 01 §5 correction 4 forbids the accent as text on a
  dark surface (the prototype already uses `#7aa9ff` for links), so the rule now reads the
  new `--color-accent-ink-on-dark` token instead. The file still references exactly sixteen
  distinct custom properties (C3(a) derives the list from the file at test-collection time,
  never hardcodes the count), so this is a repair, not a criterion violation.
- **Ink-ramp consolidation (correction 1 and 2).** Design 01's "nearly invisible" ink row
  (`#5b5d63`, `#3a3c41`) is not carried as its own token: `#5b5d63`'s one use (composer hint)
  is corrected onto `--color-fg-quietest`/`--color-fg-quiet` per correction 1's stated target
  value, and `#3a3c41`'s ink use (the ask-glyph) is not exposed as any `--color-fg-*` token at
  all, per correction 2 — a future ask-agent surface (phase 11) reaches for
  `--color-fg-quiet` directly. `#3a3c41` is kept in the **border** ramp
  (`--color-border-elevated`), an un-flagged, distinct table row.
- **Correction 3 (darkened primary action).** Took the "(or use `#0b0b0c` ink on `#3b82f6`)"
  alternative: no second, darker accent value was introduced. `--color-accent` is unchanged
  (`#3b82f6`), verified by C7(a) row 3. The future primary-action button (no such component
  exists yet) composes dark ink on the existing accent background at the point it is built.
- **Value reuse via `var()` inside the theme layer**, to keep "defined once" honest even
  within one file: `--shadow-active-tab` references `--color-border-control` rather than
  repeating `#26282c`. Design 01's neutral-badge background/ink and diff field-name/arrow
  values duplicate existing ink/border/positive tokens exactly; no separate alias token was
  declared for them (not in anticipation — a future Badge/diff component reuses the existing
  token directly, or a new token is added then with its own reason).
- **Text-size naming.** Half-step sizes use a hyphen (`--text-9-5`), not a literal decimal
  point: an unescaped `.` is not a valid CSS custom-property identifier character. 16/20/24/36
  reuse Tailwind's own `--text-base`/`--text-xl`/`--text-2xl`/`--text-4xl`, which already match
  design 01 exactly.
- **Radius**: overrides Tailwind's default `xs`–`4xl` scale with design 01's own eight px
  values (nothing in this greenfield tree depended on the previous rem-based defaults), plus
  one new `pill` (99px). `50%` uses Tailwind's built-in `rounded-full`; no token needed. The
  compound top-only-corner tab radius is a future directional utility
  (`rounded-t-lg`), not a token.
- **fadeUp is not declared.** Master plan §11.3 follow-up 9 records design 01 §5 correction 6
  as dropping it, not merely deferring it; `pulseDot`/`spin` are carried (settled design 01
  motion-table values, unlike fadeUp).
- **`--color-positive`/`--color-positive-bright`** implement design 01's own stated treatment
  of open question #4 (`#7ddba0` as the positive token, `#4ade80` as the one-off checkmark),
  which the design document itself recommends; recorded as satisfying the question via the
  design's own suggestion, reported rather than silently resolved.
- **C1(b)'s allowlist** is asserted as exactly one entry, in `globals.css`, and further
  verified to be the `:focus:not(:focus-visible)` line specifically (not merely "some line in
  globals.css") — this is a structural fact about the one-entry allowlist itself, not a
  configured value charter rule 13 would otherwise require asserting as a contract.
- **C7(b)'s forbidden-fragment list** excludes "tab", "panel", "dot", "button" and "badge" on
  purpose: design 01's own ramp tables use them as usage-context descriptors for legitimate
  base-ramp rows (`--color-accent-hover-button`, `--color-positive-wash-badge`,
  `--shadow-active-tab`, `--animate-pulse-dot`). The first run of the C7(c) mutation probe
  planted a name containing "button" and came back green — a false negative, caught before
  concluding the guard was broken; re-sited using "tooltip" (not in the ramp's vocabulary),
  which reddened correctly. Recorded per the doctrine's own instruction to report a re-siting.
- **C4(d)/(e) are preservation rows, not new claims.** C4(d) (a `src/lib/**` test collected in
  `node` with the guard installed) is discharged jointly by C4(a)'s partition check (confirms
  every `src/lib/**/*.test.ts` lands in `node`) and the pre-existing
  `test/setup/node.test.ts`'s own network-blocking test (unrelated numbering — that file's
  "C4" labels are the **backend** project's phase-1 criteria, not this phase's; cited here only
  as incidental proof the guard is live). C4(e) (the DOM project's guard) is upgraded from
  "verified by inspection" to a one-line automated source-presence check
  (`vitest.setup.ts` still calls `installOfflineFetchGuard()`) rather than left as inspection
  only, since automating it cost nothing.
- **Documentation beyond the plan's own enumeration.** Master plan §10.2 caveat 4 does not
  name the root README's Vitest testing-strategy sentence or its features-folder sentence;
  both were made stale by this phase's own task-5 repair and task-5-adjacent work
  (`src/features/` now exists), and were patched under contract 14 §8's standing closeout
  instruction, not under C8 (which is scoped to task 7's deleted-artefact enumeration only).
  The root README's pre-existing, unrelated "integrations under `src/lib/**`... neither exists
  yet" half-claim (already false before this phase, `src/lib/` already has real content) and
  the second `architectural_contracts/README.md` Known-conflicts row ("No frontend
  implementation plan exists yet") were left untouched: both predate this phase, neither is in
  its declared perimeter, and fixing them is scope creep beyond the eight criteria — noted here
  as a candidate finding for the coordinator to route.

**Coverage map (task 0), all 31 rows, transcribed before the first production edit; the red
baseline for each automated row was the absence of its test file (theme.test.ts,
bootstrap.spec.ts, the two sentinels did not exist yet).**

| Row | Test id | Shape |
|---|---|---|
| C1(a) | `theme.test.ts` "C1(a): no raw hex colour..." | matches |
| C1(b) | `theme.test.ts` "C1(b): no outline:none..." | matches |
| C1(c) | manual mutation (probe 1/11) | matches |
| C1(d) | manual mutation (probe 2/11) | matches |
| C1(e) | `theme.test.ts` "C1(e): the scanner's own scope..." | matches |
| C2(a) | `bootstrap.spec.ts` "C2(a): :focus-visible produces..." | matches |
| C2(b) | `bootstrap.spec.ts` "C2(b): transition and animation durations..." | matches |
| C2(c) | manual mutation (probe 3/11) | matches |
| C3(a) | `bootstrap.spec.ts` generated "C3(a): <property> resolves..." (×16) | matches, enumerated not sampled |
| C3(b) | manual mutation (probe 4/11) | matches |
| C4(a) | `theme.test.ts` "C4(a): every discovered *.test.ts(x)..." | matches |
| C4(b) | `components/collection-sentinel.test.tsx` (self-asserting) | matches |
| C4(c) | `hooks/collection-sentinel.test.ts` (self-asserting) | matches |
| C4(d) | C4(a) + pre-existing `test/setup/node.test.ts` (preservation) | weaker: joint/incidental, not a dedicated new test — recorded above |
| C4(e) | `theme.test.ts` "C4(e): vitest.setup.ts still calls..." | matches (upgraded from inspection) |
| C4(f) | `theme.test.ts` "C4(f): ...this file... collected in the node project" | matches |
| C4(g) | manual mutation (probe 5/11) | matches |
| C5(a) | `theme.test.ts` "C5(a): src/styles/tokens.css does not exist" | matches |
| C5(b) | `theme.test.ts` "C5(b): no file exists under src/components/ui/" | matches |
| C5(c) | `theme.test.ts` "C5(c): no *.module.css exists under src/" | matches |
| C5(d) | `theme.test.ts` "C5(d): package.json declares no forbidden..." | matches, recorded limit |
| C5(e) | manual mutations (probes 6–9/11, one per absence sub-row) | matches |
| C6(a) | `theme.test.ts` "C6(a)/(c): ...no banner/main-landmark or skip-link..." | matches |
| C6(b) | closing L4+ stamp: `npm run test:e2e` (26/26) | matches |
| C6(c) | same test as C6(a) (one assertion covers both rows) | matches |
| C7(a) | `bootstrap.spec.ts` "correction 1"–"correction 6" (×6) | matches, enumerated not sampled |
| C7(b) | `theme.test.ts` "C7(b): declares no custom property named after..." | matches |
| C7(c) | manual mutation (probe 10/11; re-sited once, see judgment calls) | matches |
| C8(a) | `theme.test.ts` `it.each` "C8(a): %s makes no unqualified..." (×4) | matches, enumerated not sampled |
| C8(b) | `theme.test.ts` "C8(b): both 'Component library' rows name..." | matches |
| C8(c) | manual mutation (probe 11/11) | matches |

**Reverse trace.** Every `it`/`it.each` case in `theme.test.ts`, every `test` in
`bootstrap.spec.ts`, and both collection sentinels appear in the table above against a
criterion row. No orphan test.

**Named mutations — arithmetic and full ledger.** Declared 11 = C1 2(c,d) + C2 1(c) +
C3 1(b) + C4 1(g) + C5 4(e, one per a–d) + C6 0 + C7 1(c) + C8 1(c). Executed 11. All applied
on the tracked tree and reverted (`git status --porcelain` clean of probe residue after each);
none run twice; two negative controls confirmed the false-green risk directly (C1(e)'s own
design; C7(c)'s first, mis-sited attempt).

| # | Row | Site (file, def-vs-call) | Planted | Observed red (id/assertion) | Reverted |
|---|---|---|---|---|---|
| 1 | C1(c) | new file `src/lib/__mutation-probe-c1c.ts` (definition site — a fresh consuming file) | raw hex `#3b82f6` in a string literal | `theme.test.ts` "C1(a)" — `raw-hex-colour` at the planted file | yes |
| 2 | C1(d) | same file, replaced | `outline: none;` in a string literal | `theme.test.ts` "C1(b)" — `outline-removed` at the planted file | yes |
| 3 | C2(c) | `src/styles/globals.css` (call site — the reduced-motion block deleted) | reduced-motion `@media` block removed | `bootstrap.spec.ts` "C2(b)" — parsed duration `0.3` ≥ `0.001`; "correction 6" also reddened (shared subject, not a 12th mutation) | yes |
| 4 | C3(b) | `src/styles/theme.css` (definition site — `--color-focus` line) | `--color-focus` declaration removed | `bootstrap.spec.ts` "C3(a): --color-focus..." only — all 15 sibling rows stayed green | yes |
| 5 | C4(g) | `vitest.config.mts` (jsdom project's `include`, temporarily narrowed to the pre-repair globs) + a planted file `src/features/proposal-preparation/components/__mutation-probe-c4g.test.tsx` | jsdom include narrowed; `.tsx` file placed outside both narrowed globs | `theme.test.ts` "C4(a)" — `claimedByNone` listed both the planted file and (incidentally) the pre-existing sentinel, confirming the narrowed config recreated the original gap precisely | yes (both) |
| 6 | C5(e)/(a) | `src/styles/tokens.css` (created) | the file itself | `theme.test.ts` "C5(a)" | yes |
| 7 | C5(e)/(b) | `src/components/ui/probe.ts` (created) | the file itself | `theme.test.ts` "C5(b)" | yes |
| 8 | C5(e)/(c) | `src/styles/probe.module.css` (created) | the file itself | `theme.test.ts` "C5(c)" | yes |
| 9 | C5(e)/(d) | temporary fixture `/tmp/c5d-fixture/manifest.json` + a temporary test in `theme.test.ts` calling `forbiddenDependenciesPresent` against it | fixture manifest with `styled-components` dependency; no package installed, `package.json` untouched | the temporary test (deliberately wrong expectation) — `present` = `['styled-components']` | yes (temp test line and fixture both removed) |
| 10 | C7(c) | `src/styles/theme.css` (definition site) | first attempt: `--color-primary-cta-button-bg` — **false green**, re-sited (see judgment calls); second: `--color-tooltip-bg` | `theme.test.ts` "C7(b)" — `offenders` = `['color-tooltip-bg']` | yes |
| 11 | C8(c) | `README.md` (call site — the styling line) | unqualified `` `src/styles/tokens.css` `` mention appended | `theme.test.ts` "C8(a)" — only the README.md row reddened; the other three documents' rows stayed green | yes |

**Closing L4+ stamp.** Tree: checkpoint commit (below) on top of `7b741aa`,
`git status --porcelain` clean at stamp time (confirmed after reverting `next-env.d.ts` and
`tsconfig.tsbuildinfo`, incidental regenerated build artifacts from running `build`/`typecheck`,
outside the declared perimeter). `npm run typecheck` clean. `npm run lint` clean. `npm test`:
14 files, 137 tests, all passed (was 11 files / 118 tests at baseline; +2 collection-sentinel
files (1 test each) + 1 new `theme.test.ts` (17 tests) = +3 files / +19 tests, reconciling
exactly to 14 files / 137 tests). `npm run build`
clean. `npm run test:e2e`: 26/26 passed (was 0/2 at baseline). No failure-ID delta outside the
expected: the two originally-red e2e tests no longer exist (reduced per task 6), replaced by
26 new passing rows.

**Documentation impact review (contract 14 §8.3, verbatim instruction applied).** Evaluated
after the verified implementation above. Made false/incomplete/misleading and patched: the
eight documents in "What was built". Not touched, and why: `ui_design/**` (never edited, per
standing rule 7 and master plan §2); the root README's `src/lib/**` half-claim and the second
`architectural_contracts/README.md` Known-conflicts row (pre-existing, out of this phase's
declared perimeter, noted above as a candidate finding); every other architecture contract
(no other document makes a false statement this phase's work touches).

**Perimeter — every file this session touched.** Own changes: `src/styles/theme.css` (new),
`src/styles/theme.test.ts` (new), `src/styles/globals.css`, `vitest.config.mts`,
`e2e/bootstrap.spec.ts`, `README.md`, `architectural_contracts/README.md`,
`architectural_contracts/15-ui-styling-and-component-system.md`,
`architectural_contracts/12-anti-patterns.md`,
`src/features/proposal-preparation/components/collection-sentinel.test.tsx` (new),
`src/features/proposal-preparation/hooks/collection-sentinel.test.ts` (new), this plan file
(State, Review log), `master-plan.md` (tracker row 01 only). Mutation-probe files (all created
and removed, listed separately per the doctrine): `src/lib/__mutation-probe-c1c.ts`,
`src/lib/__mutation-probe-c1d.ts`, `src/components/ui/probe.ts`,
`src/styles/probe.module.css`, `src/styles/tokens.css` (probe instance),
`src/features/proposal-preparation/components/__mutation-probe-c4g.test.tsx`,
`/tmp/c5d-fixture/manifest.json` (outside the repo). Commands run: the five baseline commands
(task 1); targeted (`npx vitest run <path> [-t]`) and scoped Playwright (`-g`) runs throughout
implementation; the closing L4+ stamp (five full commands, §7 budget item 2, taken once,
re-taken after the incidental build-artifact revert made no further tree change). No package
installed; no dependency added.
