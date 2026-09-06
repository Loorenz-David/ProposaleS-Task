# Phase 01 — Repository baseline, visual foundation, test collection

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 6 |
| **Projection** | waivable |
| **Serves** | F6 · `15 §2` · `15 §4` · `11 §1` · intention §14.3 items 1 and 4 · conflict C-4 |

## Goal

Make the repository internally consistent and establish the production visual foundation, so
that every later phase styles from one definition, writes tests that are actually collected,
and reads current-state documents that are true. This phase closes conflict C-4 (intention
§13) at the code level and at the documentation level.

**Not in this phase:** the workspace shell, any landmark, any session concept, any feature
folder, any component under `src/features/`, and any restoration of the deleted `tokens.css`
or of the three deleted `src/components/ui/` primitives. This phase adds no product surface.

## Read first

- Master plan §2, §5, §6.1, §6.3, §6.4, §9, §10 (all of §10 — this phase acts on every caveat
  in §10.2), §11.3.
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
- The repository as it is: `src/styles/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`,
  `vitest.config.mts`, `vitest.setup.ts`, `test/setup/node.ts`, `e2e/bootstrap.spec.ts`,
  `postcss.config.mjs`, `README.md`, `architectural_contracts/README.md`.

## Dependencies

None. This is the first phase.

## Files expected to change

```
src/styles/theme.css                     new — the Tailwind theme layer, the single definition
src/styles/globals.css                   edited — reset, base typography, focus, reduced motion
vitest.config.mts                        edited — project globs that partition the tree
e2e/bootstrap.spec.ts                    edited — reduced to what the tree renders
README.md                                edited — status paragraph and tech-stack truth
architectural_contracts/README.md        edited — scaffold, resolved-decision and known-conflict rows
architectural_contracts/15-ui-styling-and-component-system.md   edited — §2, §4, §6
src/styles/theme.test.ts (or equivalent) new — the foundation's own checks
```

The two contract-folder files are patched **as stale current-state documents**, per contract
14 §8 and the guide §6's "the contract is stale → patch the contract in its own change, with
rationale". No other contract is touched, and no rule is weakened: the patch records what the
tree actually is and what owner decisions 5 and 6 already decided.

## Ordered tasks

1. **Re-enumerate the baseline before changing anything.** Run `npm run typecheck`,
   `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`, and record the exact
   observed result of each with the tree identity, in the Review log. Master plan §10.2 caveat
   1 predicts the end-to-end step is red; confirm or correct that prediction rather than
   assuming it.
2. **Establish the theme layer.** Express design 01's surface, border, ink, semantic, radius,
   shadow, type and motion values through Tailwind's theme mechanism, in one file, **with
   design 01 §5's required corrections applied** — the lightened muted ramp, the readable
   ask-agent affordance, the darkened primary action or dark ink on the accent, never the
   accent as text on a dark surface, the global focus ring, and reduced motion. Where the
   corrected value and the prototype value differ, the correction is what lands, and the
   difference is recorded as a delta, not as a rewrite of the specification.
3. **Collapse what design 01 asks to be collapsed only where the specification says so.** The
   six-step border ramp and the half-pixel type ladder are design 01's own open questions
   (deltas 11 in master plan §11.2). V1 implements the current specification behaviour, leaves
   a marker, and reports; it does not settle them.
4. **Repair `globals.css`.** Every custom property it references resolves. Keep it to the
   reset, base element typography, the focus treatment and the reduced-motion treatment;
   feature rules never go there (contract 15 §3).
5. **Repair the test-runner configuration** to the contract in master plan §10.3. Then prove
   it: add a component test under `src/features/` and confirm `npx vitest list` claims it in
   the DOM project exactly once.
6. **Reduce `e2e/bootstrap.spec.ts`** to assertions that are true of the tree this phase
   leaves — the document title, and that `/` renders without a client or server error. Delete
   the banner, `main` and skip-link assertions; phase 02 writes the real workspace spec. Do not
   add a landmark to `src/app/` to satisfy the old spec: that would pre-empt phase 02 and risk
   a second `main` (§12A.23).
7. **Patch the stale documents to current truth**, all in this change:
   - root `README.md`: the status paragraph no longer claims a header, a content container,
     design tokens as a separate file, or three shared primitives; the styling line names the
     theme layer this phase created;
   - `architectural_contracts/README.md`: the "Scaffold decisions record" styling row, the
     "Resolved decisions" styling row, and the CSS-Modules "Known conflicts" row are patched to
     the tree's truth; the two `Component library: none decided` rows record **Radix UI
     Primitives (headless, per-widget packages) and Lucide React**, with the widget that
     justified the adoption named — the session tab strip's tablist mechanics and the anchored
     ask-agent surface — per contract 15 §5 and 13 §5;
   - `15-ui-styling-and-component-system.md` §2, §4 and §6: patched to describe the theme layer
     that exists, the absence of `src/components/ui/` primitives, and the absence of a
     CSS-Modules foundation. §5's "intentionally undecided" status is replaced by the recorded
     decision. **No rule is relaxed**: the promotion rule, the inline-style rule, and the
     one-mechanism rule survive verbatim.
8. **Do not restore what was deliberately deleted.** No `src/styles/tokens.css`, no
   `src/components/ui/` primitive, no CSS Module. A shared primitive is created only when the
   promotion rule is actually met, which it is not in this phase.
9. Closeout: contract 14 §8's impact review, then the tracker row and the Review log.

## Acceptance criteria

Every row is addressable and carries its trace cell.

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The project's visual values are defined **once** in the theme layer and never repeated as literals in consuming code. (a) A source-level check over `src/**` finds no raw hex colour, no raw `px` type size, and no raw radius or shadow literal outside the theme layer and `globals.css`. (b) The check ships with its **planted-defect probe**: introduce a raw hex colour in a consuming file, observe the check redden, revert. (c) The check's own scope is asserted — it reads the files it claims to read, proven by pointing it at a file it must ignore and at a file it must read. | 3 | `15 §2` — guards a visual value drifting across components, which is invisible until two surfaces disagree |
| **C2** | The global accessibility treatment is reachable by the **shipped default configuration**. (a) `:focus-visible` produces a visible indicator on a native control rendered with no component-level styling. (b) The indicator is not removed anywhere without an equivalent replacement. (c) Under `prefers-reduced-motion: reduce`, animation and transition durations collapse for every element, asserted by rendering rather than by reading the stylesheet. (d) Planted-defect probe: delete the reduced-motion block, observe (c) redden, revert. | 4 | F6 · §12A.17 — accessibility deferred to a later pass is the defect family; an unreachable default is the shape it hides in |
| **C3** | `src/styles/globals.css` references no custom property that has no definition. (a) Every custom property the file reads resolves to a non-empty computed value on a rendered document — enumerated one row per property the file references, not sampled. (b) Planted-defect probe: remove one property's definition, observe its row redden, revert. | 2 | `15 §2` — guards the exact live defect of master plan §10.2 caveat 2, where the base layer silently has no background, foreground or focus colour |
| **C4** | Test collection partitions the tree. (a) Every `*.test.ts(x)` under `src/` and `test/` is claimed by **exactly one** Vitest project — asserted as a set relation over the discovered files and the configured projects, not as a count. (b) A component test at `src/features/<feature>/components/**/*.test.tsx` is collected, in a DOM environment. (c) A hook test at `src/features/<feature>/hooks/**/*.test.ts` is collected, in a DOM environment. (d) A library test under `src/lib/**` is collected in the `node` environment with the offline `fetch` guard installed. (e) The DOM project also installs the offline `fetch` guard. (f) Planted-defect probe: place a test file outside every include glob, observe (a) redden, revert. | 6 | `11 §1` · backend master plan §10.3 hazard — a test claimed by no project is silently not collected and the suite stays green, which is the failure this project would otherwise ship into every later phase |
| **C5** | Nothing deliberately deleted is restored, and no second styling mechanism appears. (a) `src/styles/tokens.css` does not exist. (b) No file exists under `src/components/ui/`. (c) No `*.module.css` exists under `src/`. (d) No CSS-in-JS, styled-components, Emotion or SCSS dependency is present. (e) Each of (a)–(d) ships with its **planted-defect probe**: create the forbidden artefact, observe the row redden, revert — because measuring an absence proves the absence, not that the instrument could observe the presence. | 5 | `15 §4` · `12` "Styling and UI system" · intention §5.9 — guards the stale documents bootstrapping themselves into authority and recreating a foundation the owner deleted |
| **C6** | The end-to-end suite is green against the tree this phase leaves. (a) `e2e/bootstrap.spec.ts` asserts only what the tree renders. (b) `npm run test:e2e` passes. (c) The spec contains no assertion about a landmark, a skip link, or a shell, so that phase 02 writes the workspace spec rather than inheriting a half-true one. | 3 | `11 §3` — guards a permanently red CI step being normalised into "expected", which is how a real end-to-end regression later goes unnoticed |

**Derived totals for this phase:** 6 criteria, 23 rows, 5 named mutations (C1(b), C2(d),
C3(b), C4(f), C5(e) — C5(e) is one probe per sub-row and is re-derived at dispatch).

## Notes

- **The documentation patch is not optional and is not cosmetic.** Contract 14 §1 requires
  current-state documents to be true, and the guide §6 requires a stale contract to be patched
  in a dedicated change with rationale. This phase is that change. A later phase that finds one
  of these documents still stale reports it as a finding against this phase.
- **The design specifications are not edited here or anywhere.** Where a design 01 §5
  correction changes a prototype value, that is the correction winning (design 10 §5), recorded
  as a delta — not a specification edit.
- **This phase installs no package.** Radix packages arrive with the widgets that justify them
  (master plan §6.1); the README recording in task 7 records the decision the owner already
  took, which is what contract 15 §5 asks for.
- The MVP scope brief applies: the theme layer carries the values V1 actually uses, not a
  taxonomy. Contract 15 §2's prohibition on a larger token taxonomy binds.

## Review log

*(empty — append-only, shared by the implementer and the reviewer)*
