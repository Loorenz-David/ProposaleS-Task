---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
state: COMPLETE
verdict: PROJECTION CONSUMED — 21 ledger rows routed, owner decision 13 taken, phase 01 amended to 8 criteria and dispatched (`PROMPT_READY`)
actor: Claude Opus 5 (1M context), coordinator session
---

# Phase 01 dispatch — consuming projection round 0

Supersedes the "next action" of `coordinator-handover-round-1.handoff.coordinator.md`, which
remains live as the record of the handover and of the pre-dispatch plan lint.

Projection round 0 returned **`AMENDMENTS_REQUIRED`**: 21 ledger rows and one owner card. All 21
are routed, the card is answered, and
`prompts/implementer/phase-01-round-1.prompt.implementer.md` is live.

---

## ⚠ OWNER DECISIONS REQUIRED (0)

nothing needs you — card 1 of the projection (theme-layer scope) was answered on 2026-09-06 and
is recorded as owner decision 13 in master plan §6.5A.

---

## 1. Consuming the projection adversarially

Per the coordinator doctrine, the handoff was reconciled before anything was routed.

| Check | Result |
|---|---|
| Declared write perimeter vs. the tree | **matches exactly** — one new file, its own handoff; `git status` showed nothing else but the pre-attributed untracked directory |
| Evidence budget (zero L4) | **honoured** — no suite, build, typecheck, lint or end-to-end run. Task 1's baseline re-enumeration is intact and unspent for the implementer |
| Internal arithmetic | **21 ledger rows declared, 21 present**; the 5-versus-8 mutation discrepancy it reported matches the count this coordinator derived independently at dispatch |
| Load-bearing claims | **re-verified independently, with variation** (below) |

**Re-verification, spending effort on variation rather than reproduction:**

- **jsdom cannot measure computed style.** Confirmed at source: the `// TODO: Resolve css var().`
  line in `CSSStyleDeclaration-impl.js`, and **no `matchMedia` and no `MediaQueryList` anywhere in
  the package**. This is the finding the whole amendment turns on and it is correct.
- **C1 is vacuous today — and more comprehensively than reported.** The projection checked hex
  literals. This session also checked `rgb()`/`hsl()`, `px` literals, and `.css` files under
  `src/`: **all zero**. C1(e)'s synthetic fixture is therefore not a nicety, it is the only way
  the positive half of the scope assertion has a subject at all.
- **The six unnamed stale statements** in the two READMEs and the two contracts: confirmed
  verbatim, line by line.
- **Contract 15 §3 states a three-item `globals.css` scope** and does not name reduced motion,
  exactly as L20 reports.

**No finding against the projection session.**

## 2. The one row routed differently from its proposal

Declared here rather than diverging silently.

**L14** proposed reducing three phase-01 trace cells, reading master plan §7.4's "a trace cell
names **one** of" as "exactly one citation". Before applying it, this session measured the claim
against the artifact set: **110 of the project's 113 criterion rows carry more than one
citation.** Multi-citation cells are the planner's deliberate convention across all seventeen
plans; applying L14 as proposed would have deleted real authority from every plan in the project
and generated churn in sixteen phases that are not even dispatched.

The property §7.4 actually protects was then tested mechanically over all 113 rows — *every row
carries a measurement anchor (`F` or `§12A`) unless it is one of the enumerated
architecture-contract exceptions* — and **it held everywhere**: exactly six rows carried no
anchor, and they were exactly the six §7.4 enumerated. Only the section's description of the
vocabulary was too narrow. §7.4 was corrected to describe one **anchor** plus supporting
citations, with the supporting vocabulary enumerated from the plans themselves. No criterion
row's citations were reduced.

**L15 was applied exactly as proposed** and is a different defect: `§12A.17` is a table of focus
*destinations* serving F24 and does not support what C2 asserts. Dropped from C2's cell.

## 3. Owner decision 13 — the theme layer's scope

The projection's card 1 surfaced a real conflict, verified at source before relaying: ratified
intention §5.9 asks for a coherent foundation built **from design 01's eight value tables**;
contract 15 §2 says a value is added "when a second consumer needs the same value, **not in
anticipation**" and prohibits a taxonomy "until repeated product patterns demand it. One flat
set of values is the target." The plan contradicted itself between task 2 and its own Notes.

**The owner chose the flat base set**: design 01's base ramps once, with design 01 §5's
corrections applied, and no semantic layer, component-level value or multi-theme scale.

**The card's recommendation was declined, and the reason is recorded** in master plan §6.5A: the
projection recommended "grow as needed" on the grounds that the phase's purity check makes
growing safe. It does not. That check catches a literal typed into a **component**; it cannot
catch a later phase adding a slightly different grey to the theme layer itself. "Grow as needed"
trades unused values for values that quietly stop matching design 01, and nothing in this project
would observe the second. The middle option was put to the owner alongside both branches.

## 4. Where each of the 21 rows landed

| Rows | Home | What changed |
|---|---|---|
| L1, L2 | phase plan | C2 and C3 measured in Playwright against the running `/`, subject = a native control the test injects and disposes; task 6 rewritten |
| L3, L5 | master plan §10.3 | the partition rule made **total by construction** on two axes, replacing a four-location enumeration that demanded totality; phase plan gains C4(f) |
| L1 (root cause) | master plan §10.3A | new section recording what no Vitest project here can measure, and that it binds every phase, not just this one |
| L4 | phase plan | C4(a)'s instrument fixed to `npx vitest list` — what the runner actually collects, not a re-derived glob matcher; self-counting stated |
| L6 | phase plan | the two collection sentinels admitted by name in "Not in this phase" and in the file perimeter, declared permanent |
| L7 | phase plan | **C7 added** — design 01 §5's corrections measured, the taxonomy prohibition asserted with a probe |
| L8 | master plan §6.5A | **owner decision 13** |
| L9 | phase plan | **C8 added** — the documentation patch measured |
| L10, L11 | master plan §10.2 caveat 4, §11.3 item 2 | perimeter widened by six statements, two of them in contracts no perimeter in this project had named |
| L12 | phase plan | C5(d)'s injectable manifest path; the probe installs nothing; the name-list limit recorded in the criterion |
| L13 | phase plan | totals re-derived: **31 rows, 11 named mutations** (C1 2 · C2 1 · C3 1 · C4 1 · C5 4 · C6 0 · C7 1 · C8 1) |
| L14 | master plan §7.4 | routed differently — see §2 |
| L15 | phase plan | `§12A.17` dropped from C2's cell |
| L16 | phase plan | C2(b) folded into C1(b) with its own probe C1(d); it now has an instrument and can fail |
| L17, L21 | phase plan Notes + prompt §6 | six choices delegated **in writing**; `@theme` vs `@theme static` flagged by name |
| L18 | phase plan | C1(e)'s synthetic fixture, stated as synthetic |
| L19 | master plan §11.3 follow-up 9 | blanket collapse kept as a floor; design 01 §5 correction 6's three per-animation treatments registered against the phases that introduce them |
| L20 | phase plan task 4 + §10.2 caveat 4 | citation corrected to master plan §6.2; contract 15 §3 added to the patch perimeter |

## 5. A defect this session authored and caught

Recorded because the coordinator doctrine asks for it plainly. **C8, which this session wrote,
shipped with an inadmissible trace anchor** — `14 §8`, an architecture-contract section not in
§7.4's enumerated exception set. This is the identical defect the pre-dispatch lint had caught
for C6 two hours earlier, recreated by the act of fixing it. It was found by re-running the same
mechanical check after the amendment rather than by reading, which is the only reason it was
found at all. §7.4 now enumerates C8, and the entry says so.

**The lesson, for the next fold-back:** an amendment that adds a criterion must re-run the
anchor check. The check is one command over all 17 plans.

## 6. Write perimeter

**Documents created (2):**
- `prompts/implementer/phase-01-round-1.prompt.implementer.md`
- `handoffs/coordinator/phase-01-dispatch-round-1.handoff.coordinator.md` (this file)

**Documents changed (2):**
- `master-plan.md` — §4 tracker row 01 (`NOT_STARTED` → `PROJECTED` → `PROMPT_READY`, criteria
  6 → 8) and the criteria total (113 → **115**, re-derived); **§6.5A added (lettered, not
  renumbered** — five phase plans cite §6.6 and renumbering broke all of them; caught and
  reverted before commit); §7.4 vocabulary corrected, C6 and C8 enumerated; §10.2 caveat 4
  widened; §10.3 partition rule replaced; §10.3A added; §11.1 gate log; §11.3 items 2 and 9.
- `plans/phase-01-baseline-and-visual-foundation.md` — header, goal exception, read-first, file
  perimeter, tasks 2/4/5/6/7, criteria C1–C8, derived totals, Notes, and a Review log entry.

**Commits (2):** `fb78734` (the fold-back) and one carrying this file, the implementer prompt and
the tracker row.

**Not touched:** any file under `src/`, `e2e/`, `test/`, or any configuration file ·
`package.json` and the lockfile · the intention · any file under `ui_design/` · any architecture
contract · any other phase plan · any backend artifact · `build_docs/future_implementations/`.

**Code changed:** none. **Dependencies installed:** none. **Tests, build, lint, typecheck:** not
run — this session's L4 budget was zero and zero was spent, so phase 01 task 1's baseline is
still unspent. **Commands run:** reads and greps; `git status` / `log` / `diff` / `show`; four
mechanical derivations over the plans (criteria totals, per-criterion row counts, trace-anchor
coverage, trace-vocabulary survey); one grep each over `node_modules/jsdom` and
`node_modules/tailwindcss`; the writes and commits above. **Tool-recorded state:** none; no
architecture graph exists here.

## 7. Next action

**The prompt `prompts/implementer/phase-01-round-1.prompt.implementer.md` is ready for a
**Claude Sonnet 5** session (master plan §3 substitution). **The owner opens it** — per the
standing instruction of 2026-09-06 recorded in master plan §3, the coordinator prepares prompts
and does not start sessions. Its gate check was self-tested against the tree it will open; all
six rows pass and none names a SHA, a clean tree, or a file count.

**When its handoff lands**, consume it adversarially and check specifically:

1. **Task 1 actually ran, before the first edit**, and its five results are recorded with tree
   identity. If the three §10.2 predictions were confirmed, say so; if any was corrected, the
   correction belongs in §10.2, not only in the Review log.
2. **All eleven mutations ran**, with observed failing ids — not expected ones — and the
   arithmetic stated. `executed != declared` blocks `IMPLEMENTED`.
3. **The coverage map runs both ways**: 31 rows each with a test, and no test without a row.
4. **The L4 count**: two authorized (task-1 baseline, closing stamp). A third without a pre-run
   authorization line is an automatic finding.
5. **The scope fences held** — no landmark, no product surface, no package installed,
   `package.json` and the lockfile unchanged, root README tech-stack table untouched.
6. **The probe files are listed separately** from the session's own changes.

Then compile the **review** prompt for a **Claude Opus 5** session (`plan-reviewer` doctrine,
full first-review checklist). While the §3 substitution is in force, the reviewer records
explicitly where a finding turns on reading the plan the same way the implementer did — the
cross-family check is not available this phase.
