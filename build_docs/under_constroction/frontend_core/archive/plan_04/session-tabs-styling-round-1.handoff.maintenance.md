---
plan: none — maintenance round, out of band by owner request
role: maintenance
round: 1
state: COMPLETE
date: 2026-09-07
actor: claude-opus-5 (maintenance session)
---

# Handoff — session-tab visual styling, round 1

Visual presentation of the session tab strip brought to design 04 §2/§3/§6, read against
design 01. Behaviour is unchanged: no edit to the store, the key handling, the close gate,
the focus destinations, the reveal arithmetic, or any element's role, and no focusable
element added or removed.

**Suite green on the tree handed over:** unit 184/184, E2E 69/69, typecheck, lint, build.

---

## ⚠ OWNER DECISIONS REQUIRED (0 outstanding — 1 raised, 1 answered)

Nothing needs the owner. Card 1 was raised and **answered by the owner on 2026-09-07**;
the answer matched the recommendation, so no code changed and the tree stamped in §7 is
the tree that stands. The card is kept in full below because the record of what was asked
is what makes the answer legible later.

### Card 1 — Two prototype colours have no entry in the theme layer · **ANSWERED**

> **Owner, 2026-09-07, verbatim:** "that is correct: Keep the nearest existing shades: the
> difference is below what a display can show, and the palette staying small is a stated
> goal of the project. On silence — The nearest shades stay in place; nothing breaks and
> nothing is lost."

**Effect:** branch 1 adopted. `--color-bg-card` (#141517) stands for design 04 §3.2's
inactive hover `#131416`, and `--color-fg` (#f5f5f6) stands for §3.1's hover ink `#fff`.
**No theme property is added**, and the theme layer's closed name set (master plan §6.5A)
is unchanged. The two mappings are design deltas, not design decisions: the specification
still reads as written and the coordinator folds them into the **§11.2 design-delta
register** under the next owner-decision number.

The card as raised:


**Question** — Should the two tab colours that have no exact theme entry keep the nearest
existing shade, or should the theme layer gain two new values?

**Story** — Two of the tab strip's shades come from the prototype and are not in the
palette the project standardised on. One is the faint grey wash a tab shows while your
pointer rests on it; the other is the pure white a close button turns when you hover it.
The palette already carries a shade within one step of each — close enough that on a
monitor they are the same colour. I used those, so the strip is complete today. If the
project later decides the prototype's exact shades matter, they would need adding, and
adding a colour is deliberately a decision you make rather than one an agent makes.

**Branches**
- Keep the nearest existing shades — the strip stays complete and the palette stays small.
- Add the two exact shades — pixel-faithful to the prototype, palette grows by two.

**Recommendation** — Keep the nearest existing shades: the difference is below what a
display can show, and the palette staying small is a stated goal of the project.

**On silence** — The nearest shades stay in place; nothing breaks and nothing is lost.

**Trace** — design 04 §3.1 (close button hover ink `#fff`), §3.2 (inactive hover `#131416`);
theme layer `--color-fg`, `--color-bg-card`; master plan §6.5A closed name set.

---

## 1. Write perimeter

| Path | Change |
|---|---|
| `src/features/proposal-preparation/components/session-tabs/session-tab-strip.tsx` | className changes only, plus the close glyph `×` → `✕` and two explanatory comments |
| `src/styles/globals.css` | base rules wrapped in `@layer base`; reduced-motion block deliberately left unlayered |

Nothing else. `src/styles/theme.css` untouched — **no custom property added**. No test file
touched: **no assertion changed**. This round's single commit is subject-prefixed `MAINTENANCE: session tabs styling`.
The closing evidence ran on exactly the code that commit carries — identified by blob,
not by commit SHA, because the commit was amended to add this document after the stamp:
`session-tab-strip.tsx` = `88d6e93`, `globals.css` = `aed07cb`. Verify with
`git rev-parse --short HEAD:<path>`.

Two tracked build artefacts (`next-env.d.ts`, `tsconfig.tsbuildinfo`) are rewritten by
`npm run build` / `npm run typecheck`; both were reverted before committing, so the tree
handed over differs from the tree the closing evidence ran on by those two generated files
only. Neither is read at runtime.

An untracked `handoffs/reviewer/phase-04-projection-round-0.handoff.reviewer.md` appeared
during this round — the phase-04 projection session's own output. Not mine, not staged,
left where it is.

---

## 2. Gate check

| # | Check | Result |
|---|---|---|
| 1 | Phase 03 closed | `master-plan.md` §4 row 03 **and** the plan header both read `APPROVED` ✔ |
| 2 | Phase 04 not started | §4 row 04 reads `NOT_STARTED` ✔ |
| 3 | Suite green before | unit **184/184**, E2E **69/69** on `7fc76c1`, `git status --porcelain` empty ✔ |
| 4 | Round outstanding | `handoffs/maintenance/` held only `.gitkeep` ✔ |

---

## 3. Four defects the styling pass exposed

### F1 — the strip's bottom border cited a custom property that does not exist

`border-[var(--color-border)]`. No `--color-border` is declared in `theme.css` or anywhere
else (grep: one occurrence, this line). An undefined custom property makes the declaration
invalid at computed-value time, so `border-color` fell back to its initial value,
`currentColor` — which the strip inherits from `body` as `--color-fg`, **#f5f5f6**. The
strip has been carrying a near-white hairline since phase 03.

**Before** `border-[var(--color-border)]` → computed `rgb(245,245,246)`
**After** `border-[var(--color-border-hairline)]` → computed `rgb(28,29,32)`, the `#1c1d20`
design 04 §2 states.

This is the exact defect tripwire 1 exists to prevent, arriving from the other direction:
the guard rejects an *undeclared name added to the theme*, and did not catch an
*undeclared name consumed by a component*. Worth a follow-up: the C1 scanner could assert
that every `var(--color-*)` a component reads resolves to a declared name. Reported, not
built — that is a phase's work.

### F2 — unlayered base rules defeated every Tailwind utility in the app

`globals.css` declared its reset and base typography **outside any cascade layer**.
Unlayered rules beat every layered rule regardless of specificity, and Tailwind v4 emits
utilities into `@layer utilities`. So:

- `button, input, select, textarea { font: inherit; color: inherit }` overrode every
  `text-*`, `font-*` and `text-[color]` utility on those elements;
- `:focus-visible { outline: … }` overrode every `outline-none`.

Measured in the browser before the fix, the tab title computed **16px / 400 / #f5f5f6**
where the component asked for 12px / 600 / `--color-fg-muted`. The strip has never
rendered its specified typography or ink. The close button was `#f5f5f6` at 16px instead
of `#84868c` at 10px.

**Fix:** the base rules move into `@layer base`. The reduced-motion block stays unlayered
on purpose — it is an accessibility floor that must beat component styling, and a comment
in the file says so.

**Blast radius, verified rather than assumed:** the entire application contains exactly
**two** `<button>` elements plus the Radix `Tabs.Trigger`, and all three are in this file;
`outline-none` appears in this file only; no `<input>`, `<select>` or `<textarea>` exists
yet. The precedence change therefore cannot reach any other surface today. The three
phase-01 focus/ink E2E probes append bare, class-less elements to `body`, so they are
unaffected by construction and still pass.

### F3 — the close button sat outside the tab it belongs to

The active background and the inset edge were on `Tabs.Trigger`; the close button is the
trigger's **sibling** (a button cannot nest in a button). The active tab's fill therefore
stopped short of the close button, which sat on the strip background beside it.

**Fix:** the tab's visual box — height, top radius, padding, gap, background, inset edge,
hover — moves to the wrapper `div`, and the trigger becomes transparent inside it. Active
state reaches the wrapper through `has-[[data-state=active]]:`, so **no JavaScript
changed**: no new state, no new render on any interaction path.

Specificity checked rather than hoped: active-hover `(0,3,0)` beats inactive-hover
`(0,2,0)`, so design 04 §3.2's deliberate "active hover dips *darker*" survives.

### F4 — the focus outline was clipped by the scroll region

Design 04 §6 lists the focused state as **"undefined — production must define"**, and the
prompt makes defining it in-scope. Design 01 §5 correction 5 already defines the mechanism:
a 2px `#7aa9ff` ring. The problem is placement — the tabs live in an `overflow-x-auto`
region whose computed `overflow-y` is therefore `auto`, and the tab's top is flush with the
region's top (measured headroom **0.0px**), so an outline at `offset: +2px` was cut off.

**Definition adopted:** the same outline, drawn **inward** (`-outline-offset-2`). Same
colour, same width, same mechanism as every other focusable element in the app; it simply
cannot be clipped. Verified rendering as a complete ring on all four sides.

**This is the one tripwire I actually tripped.** My first attempt defined the focused state
as an inset ring plus `outline-none`, which reddened
`e2e/session-tabs.spec.ts` C5(e,f,g) — it asserts `getComputedStyle(tab).outlineStyle ===
"solid"`. I reverted the mechanism rather than touch the assertion. The inward-offset
outline satisfies that assertion unchanged **and** fixes the clipping, which is why no test
needed editing. Recorded because the near-miss is the useful part: inventing a second focus
mechanism when the design system already had one was my error, and the frozen test caught it.

---

## 4. Before / after, per visual decision

Every "after" below is a **computed style read from the running application**, not a class
name I intended.

### Strip container — design 04 §2

| Property | Before | After | Authority |
|---|---|---|---|
| Background | `#0e0f10` (agent pane) | `#08090a` — `--color-bg-tab-strip` | §2; the token existed with **no consumer** |
| Bottom border | `#f5f5f6` (undefined var → currentColor) | `#1c1d20` — `--color-border-hairline` | §2 · F1 |
| Gap | `8px` (`gap-2`) | `2px` (`gap-0.5`) | §2 |
| Padding | 12px left / 8px right | unchanged ✔ | §2 |
| Scroll-region padding | `px-2` (8px each side) | removed | §2 states no inner padding; also relieves narrow-width width pressure |

### Tab — design 04 §3.1, §3.2

| Property | Before | After | Authority |
|---|---|---|---|
| Visual box | on the trigger; close button outside it | on the wrapper; close button inside | §2 structure · F3 |
| Height / radius | 30px / 9px top | unchanged ✔ | §3.1 |
| Padding | `8px` both sides | `9px` left / `4px` right | §3.1 |
| Gap | `8px` | `7px` | §3.1 |
| Title size / weight | **16px / 400** (F2) | **12px / 600** | §3.1 |
| Inactive title ink | **#f5f5f6** (F2) | `#8b8d93` — `--color-fg-muted` | §3.2 |
| Active title ink | #f5f5f6 (by accident) | `#f5f5f6` — `--color-fg` (by rule) | §3.2 |
| Active background | `#0e0f10` | `#1f2023` — `--color-bg-control-strong` | §3.2 |
| Active edge | none | 3-sided inset `#26282c` — `shadow-active-tab` | §3.2; token existed with **no consumer** |
| Inactive hover | none | `#141517` — `--color-bg-card` | §3.2 (`#131416`) — **card 1** |
| Active hover | none | `#0e0f10` — dips *darker*, as specified | §3.2 |
| Status dot | 8px | 7px | §3.1 |
| Focus | clipped 2px outline at +2px | full 2px `#7aa9ff` at −2px | §6 · F4 |

### Close button — design 04 §3.1, §5

| Property | Before | After | Authority |
|---|---|---|---|
| Ink | **#f5f5f6 @ 16px** (F2) | `#84868c` @ 10px — `--color-fg-quiet` | §3.1 ink `#6b6d73`, **corrected** to `#84868c` by design 01 §5 correction 1 |
| Glyph | `×` | `✕` | §3.1 |
| Hover | none | ink `#f5f5f6`, bg `#2f3135` — `--color-border-control-raised` | §3.1 (`#fff`) — **card 1** |
| Hit area | 24×24 | unchanged ✔ | §5 (≥24px), which **overrides** §3.1's 17×17 — see §5 below |
| `mr-1` | present | removed | superseded by the wrapper's 4px right padding |

### New-session button — design 04 §3.5

| Property | Before | After | Authority |
|---|---|---|---|
| Ink | **#f5f5f6** (F2) | `#8b8d93` — `--color-fg-muted` | §3.5 |
| Hover | none | ink `#f5f5f6`, bg `#1a1b1e` — `--color-bg-control-hover` | §3.5 (`#fff`) — **card 1** |
| Size / margin / radius | 26×26, 2px, 50% | unchanged ✔ | §3.5 |

---

## 5. Design deltas — reported, not decided

1. **Close button 17×17 vs 24×24.** Design 04 §3.1 specifies a 17×17 control; design 04 §5
   requires the close target be **≥24px** via padding. These are the same document
   disagreeing with itself. I kept 24×24 (as phase 03 shipped, and as the E2E row asserts),
   so the hover circle is 24px rather than 17px. §5 is the accessibility requirement and
   wins; recorded because it is a visible deviation from §3.1's number.
2. **Dragging `opacity: 0.45`** (§6) — **not implemented.** Rendering a drag state needs
   render-visible state wired into `onDragStart`/`onDragEnd`, and `onDragOver` fires
   continuously while calling `handleMove`. That is a change to frozen behaviour, so it
   stops here per §1 of the prompt.
3. **Strip darker than the pane** — design 04 open question 7 / design 01 open question 1.
   **Not resolved.** I implemented the specification *as written* (`#08090a`), which is the
   precedent `globals.css` already records for this project (design 10 §4: implement the
   specification, report the recommendation). The question stays open; answering it "align
   with the pane" is a one-token change.
4. **Open questions 1, 2 and 3 of design 04** — untouched, as instructed. Inactive tabs
   still show a close button (Q2), there is still no overflow affordance (Q3), and `ready`
   vs `created` is phase 04's surface (Q1).
5. **Hover transitions instant vs eased ~120ms** — design 01 open question 3. Left instant.
6. **Status dot colour and the unread badge** (§3.3, §3.4, §6) — **phase 04's work**,
   deliberately untouched. I changed the dot's *size* (§3.1 anatomy) only, and left a
   comment at the dot saying where its colour is specified and whose job it is.

---

## 6. Tripwires

| # | Invariant | Outcome |
|---|---|---|
| 1 | Theme layer is a closed allowlist | **No property added.** Two literals with no exact entry → card 1, mapped to the nearest ramp entry, both reported |
| 2 | A visual value is defined once | Every value composes from an existing custom property. No inline `style`. Two dormant tokens (`--color-bg-tab-strip`, `--shadow-active-tab`) gained their first consumer |
| 3 | Narrow-width overflow row | Both changes to width (`gap-2`→`gap-0.5`, scroll-region `px-2` removed) *reduce* width pressure. The overflow marker stays on the scroll region. C4 rows pass at every width in the set |
| 4 | `data-elided` stays on the inner title span | Untouched — that span's classes and attributes are byte-identical |
| 5 | Tab order asserted by absolute counts | **No focusable element added or removed**; verified by grep that the app has exactly two `<button>`s plus the Radix trigger. The five phase-02 count rows pass |
| — | C1 raw-value scanner | Forbids `shadow-[…]`, `rounded-*-[…]`, `text-[…px]` arbitraries. Used the **generated** utilities `shadow-active-tab`, `text-12`, `text-10` instead; each verified present in the built CSS with the right declaration |
| — | C5(e,f,g) focus assertion | **Tripped and recovered** — see F4 |

---

## 7. Evidence

Baseline and one closing run, per the prompt's budget. The closing stamp is re-taken on the
tree handed over; the baseline was taken before any edit and cannot cover it.

| Scope | Tree | Command | Result |
|---|---|---|---|
| Baseline L4 | `7fc76c1`, `git status --porcelain` empty | `npm test` | **184/184**, 19 files |
| Baseline L4 | same | `npm run test:e2e` | **69/69** |
| Closing L4 | source blobs `88d6e93` / `aed07cb` (see §1) | `npm test` | **184/184**, 19 files |
| Closing L4 | same | `npm run test:e2e` | **69/69** |
| Closing | same | `npm run typecheck` | clean |
| Closing | same | `npm run lint` | clean |
| Closing | same | `npm run build` | compiled, 3 static routes |

`C2(a)` did not fail in either run; no re-run was needed.

**Rendered verification (L1), the evidence the criteria could not give me.** Acceptance here
is visual, and a green suite says nothing about whether a colour landed. Every value in §4's
"after" column was read with `getComputedStyle` from a production build served by
`next start`, across rest, hover and focus, on an active and an inactive tab — which is how
F2 was found at all: the classes were right and the pixels were not. Screenshots taken at
each stage. That probe is a scratchpad script, deliberately not added to the repository.

---

## 8. What a reviewer should look at first

1. **The `@layer base` change (F2).** It is the one edit whose reach exceeds the tab strip.
   My containment argument rests on a factual claim worth re-checking: the application
   contains exactly two `<button>` elements plus the Radix trigger, and `outline-none`
   occurs in one file. If a phase adds a form control, its utilities will now win over the
   base reset — which is the intended and documented behaviour, but it is a behaviour change
   to the foundation phase 01 shipped.
2. **F1's class of defect.** A component consuming an undeclared `var(--color-*)` fails
   silently and renders `currentColor`. The theme guard does not look for it. One occurrence
   existed and is fixed; nothing prevents the next.
3. **Card 1**, the only thing needing the owner.
