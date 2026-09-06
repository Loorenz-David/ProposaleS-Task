---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: implementer
round: 2
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
cycle: fix
---

# Session prompt — phase 01, fix round 2

You run a **fix cycle** on phase 01 of `frontend_core` in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `implementation-executor` doctrine: invoke the `implementation-executor` skill, or read
`/Users/davidloorenz/agent-skills/implementation-executor.md` and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them. Also
follow the repository's Architecture Context policy.

**Resolve the findings. Do not relitigate them, and add nothing beyond them.** Where this prompt
differs from the plan file, the master plan, the ratified intention, a design specification, or an
applicable architecture contract, those authorities win.

**The phase plan's criteria were amended before this prompt was compiled**, so several findings
are already reflected in the rows you must satisfy. Read the plan's acceptance table as it stands
now, not as the previous round saw it.

## 0. This round carries an unusual weight — read this first

The owner has decided that **if this round closes green there will be no re-review session.** That
is the owner's call and it is not yours or mine to revisit. It has one consequence you must
internalise:

**Every finding below is from the family "a guard that cannot fail".** Three shipped guards could
not detect the thing they forbid — the reviewer planted the forbidden thing five different ways and
every guard stayed green. A green suite is exactly the signal that **cannot** distinguish a guard
that now works from a guard that still cannot fail. So on this round, the mutation ledger is not
paperwork attached to the fix — **it is the only evidence that the fix is real**, and it is the
only independent check this phase will now get.

Section 5's probe requirements are therefore not negotiable, including the extra probes of your own
choosing.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | The round is owed | `master-plan.md` §4, row `01` | the **State** cell reads `CHANGES_REQUESTED` |
| 3 | The findings exist | `handoffs/reviewer/phase-01-review-round-1.handoff.reviewer.md` | the file exists and its `verdict` is `CHANGES_REQUESTED` |
| 4 | The defect is still present | `src/styles/theme.test.ts` | it still contains `FORBIDDEN_COMPONENT_NAME_FRAGMENTS` — the denylist B2 replaces |
| 5 | This round is outstanding | the tree | `handoffs/implementer/phase-01-fix-round-2.handoff.implementer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note:** `build_docs/future_implementations/` and
`build_docs/under_constroction/frontend_core/prompts/astra_prompts/` are untracked and are **not**
this pipeline's work. Leave both alone and never stage either.

## 2. Read order

1. `handoffs/reviewer/phase-01-review-round-1.handoff.reviewer.md` — **in full.** Its "Verified
   correct" section is as important as its findings: it records what is already right, so you do
   not disturb it.
2. `plans/phase-01-baseline-and-visual-foundation.md` — the amended acceptance table and the Review
   log's coordinator entry of 2026-09-06, which records what changed and why.
3. `master-plan.md` §6.5A (amended — the allowlist rule), §7.5, §9, §10.3A, §10.4, §11.2, §11.3.
4. `ui_design/01-visual-system.md` §5 for corrections 1, 2, 3 and 6.

## 3. The allowed file perimeter — the re-review would have verified this, and I will

Change only these. Anything else that moves is a finding.

```
src/styles/theme.test.ts                  B2, S3, S6, N1
e2e/bootstrap.spec.ts                     B2 (second site), S2, N1
src/styles/theme.css                      S5 (only if you take the rename branch)
architectural_contracts/15-ui-styling-and-component-system.md   B1
architectural_contracts/13-decision-checklist.md                S1(ii)
README.md                                 S1(i)
build_docs/.../plans/phase-01-baseline-and-visual-foundation.md  State row, Review log
build_docs/.../master-plan.md             tracker row 01 only
build_docs/.../handoffs/implementer/phase-01-fix-round-2.handoff.implementer.md
```

**Superseded for deletion, named so they do not survive as green lights wired to nothing:**
`FORBIDDEN_COMPONENT_NAME_FRAGMENTS` in `src/styles/theme.test.ts`, and the hardcoded ten-name ink
list behind C7(a) correction 2 in `e2e/bootstrap.spec.ts`. Both are replaced, not supplemented.

## 4. The findings — correction clauses quoted verbatim

### B1 — blocking · contract 15 §5's prospective recording rule was weakened

> *Restore contract 15 §5's prospective recording rule verbatim — "That adoption is an
> architectural decision: it is recorded in [README.md](README.md) "Resolved decisions" with the
> widget that justified it, per [13-decision-checklist.md](13-decision-checklist.md) §5." — as its
> own bullet in §5, and keep the new per-milestone package bullet beside it as an addition rather
> than as its replacement.*

### B2 — blocking · C7(b)'s guard cannot observe a component-level value

> *Replace both denylists with allowlist-shaped instruments. C7(b) asserts that the set of
> custom-property names declared in `src/styles/theme.css` is a subset of an enumerated in-file
> list of design 01 ramp names — master plan §6.5A closes that set by construction ("a later phase
> uses a ramp entry, or it amends this section"), so any new name is an offender until the
> enumeration is amended alongside §6.5A. C7(a) correction 2 derives its ink set from `theme.css`
> (every `--color-fg-*` name actually declared) instead of a literal list, then asserts none
> resolves to `#3a3c41`. Re-run C7(c) against a name the previous instrument passed —
> `--color-tab-active-bg` — and record the observed red in the ledger.*

### S1 — should-fix · two current-state falsehoods created by this phase

> *Patch `README.md:99` to describe what `e2e/bootstrap.spec.ts` now asserts (the document title,
> that `/` renders with no client or server error, the global focus and reduced-motion treatment,
> and the resolution of every custom property `globals.css` reads). Patch
> `architectural_contracts/13-decision-checklist.md` §5 item 32 to remove "a component library"
> from the not-yet-ratified list and point instead at the recorded decision in `README.md`
> "Resolved decisions". Both are inside the meaning of task 7 — documents this phase's own change
> made stale — and are not a perimeter widening.*

### S2 — should-fix · C7(a) correction 6 is a source-substring check wearing a browser-measurement name

> *Either make C7(a) correction 6 a real two-sided browser measurement — under
> `reducedMotion: "reduce"` assert the collapse on an injected element carrying a non-`none`
> animation, and under `reducedMotion: "no-preference"` assert the same element's animation
> duration is **not** collapsed — or delete the row and record in the plan that C2(b) discharges
> correction 6, so the coverage map stops claiming a measurement that does not exist.*

### S3 — should-fix · C1's scanner: three of four value classes unmutated, C1(e) cannot detect decay, two blind spots unrecorded

> *Make C1(e)'s fixture assert **one expected violation kind per scanner class it plants** —
> `raw-hex-colour`, `raw-px-type-size`, `raw-radius-arbitrary`, `raw-shadow-arbitrary`, and on a
> `.css` fixture the two bare-CSS kinds — replacing `positive.length > 0`. Add the three sub-check
> mutations above to the named-mutation ledger under C1(c). Add the trailing-semicolon requirement
> and the `//`-inside-a-string-literal stripping to C1(a)'s recorded "deliberately not caught"
> list, or make `stripComments` string-aware and let the bare-CSS patterns terminate on `}` as
> well as `;`.*

### S4 — should-fix · design 01 §5 corrections 2 and 3 discharged by deferral with no carrier

> *Add master plan §11.3 follow-up rows for both: correction 3 — owner: the phase that builds the
> primary/approval action (phase 12); obligation: the label composes `#0b0b0c` ink on
> `--color-accent`, never white, and that phase asserts the computed pair in the browser.
> Correction 2 — owner: phase 11; obligation: the ask-agent affordance rests at
> `--color-fg-quiet`, or is hover-revealed **and** keyboard-reachable with the global focus ring.
> Then record in the phase plan that C7(a) rows 2 and 3 are **structurally held** in the master
> plan §7.5 sense, with those phases as their named triggers, so neither row reads as a completed
> measurement.*

**S4 is already done — by the coordinator, not by you.** Master plan §11.3 follow-ups 11 and 12,
§7.5's two new rows, and the phase plan's C7(a) amendment all landed before this prompt. **Do not
redo it.** Your only obligation under S4 is that C7(a)'s rows for corrections 2 and 3 read as
structurally held in whatever you leave behind, and that correction 2's row derives its ink set
per B2.

### S5 — should-fix · the ink ramp's names invert its own order

> *Either reorder the two names so the ramp reads monotonically — the corrected `#84868c` becomes
> `--color-fg-quiet` and `#7c7e84` becomes `--color-fg-quietest`, with C7(a) correction 1's
> assertion re-pointed at whichever name carries `#84868c` — or, if the names are kept, state the
> inversion and its cause in the ramp's own comment so no phase reads the order off the names.
> Record the underlying design 01 inconsistency in master plan §11.2 either way.*

**The §11.2 half is already recorded** (delta 13). The branch choice is yours; **record which you
took and why in the Review log.** No consumer exists yet, so the rename branch is cheap now and
expensive later.

### S6 — should-fix · C4(d)'s environment half is met by inference

> *Extend `runVitestList()`'s filter to every discovered `src/lib/**/*.test.ts` and assert each
> entry's `projectName === "node"`, so C4(d) is discharged by the same instrument as C4(f) rather
> than by inference.*

### N1 — fold in beside S3

> *A `globals.css` mixing `var(--x)` and `var( --x )` would silently drop only the spaced rows
> while the `> 0` guard stays green. One line closes it: assert the derived set **contains**, by
> name, the six master plan §10.2 caveat 2 properties it still references.*

## 5. Evidence — the mutation ledger is this round's only independent check

**Fifteen named mutations, not eleven.** The plan's amended totals are C1 **5** · C2 1 · C3 1 ·
C4 **2** · C5 4 · C6 0 · C7 1 · C8 1 = **15**. Re-derive that from the criteria and state your
arithmetic; `executed != declared` blocks `IMPLEMENTED`.

**All fifteen run this round — none is retained.** The charter retires a carried-forward mutation
row when *this round edits its test*, and this round edits both `src/styles/theme.test.ts` and
`e2e/bootstrap.spec.ts`, which between them hold every criterion's assertions. A citation from
round 1 does not survive that.

**Plus one probe per rewritten guard, of a shape nobody named.** For each of C1(e), C7(b) and
C7(a) correction 2, plant **one** additional forbidden instance that is **not** named in the
review handoff, not named in this prompt, and not named in the plan — your own choice of shape or
name — and record the observed red. The reviewer found B2 precisely by planting names nobody had
thought of; with no re-review this round, that move has to be made by you. A guard that reddens
only on the examples it was handed is the defect this round exists to close, one level up.

**Two L4 measurements are authorized:** none at entry (the tree is the checkpoint the round-1 stamp
covers — cite it), and **the closing stamp on the tree you hand over**: `npm test` + `npm run
typecheck` + `npm run lint` + `npm run test:e2e` + `npm run build`. Everything else is L1/L2. A
further L4 needs one line written before the run: "narrower evidence insufficient because …".

## 6. Closing protocol

1. **The coverage map, both ways** — every amended row to a test, every test to a row. The rows
   you touched changed shape; re-derive rather than carrying the round-1 map forward.
2. All **fifteen** named mutations plus the **three** unnamed probes of your own choosing, each a
   full evidence record naming its site, the observed failing id and assertion, and the revert.
3. The closing L4+ stamp, with tree identity and the failure-ID delta.
4. **Documentation impact review**, verbatim:
   > Before closing implementation, evaluate documentation impact according to
   > `architectural_contracts/14-documentation-principles.md`. Update any authoritative
   > documentation made false, incomplete, or misleading by the verified implementation. Do not
   > modify documentation merely because files changed.
   The previous round's review declared this class empty and it was not — S1 is what that missed.
5. **Charter rule 14 — if you do not implement a correction quoted above, say which and why, in
   its own section.** A quoted correction can be unimplementable for a reason only you discover;
   an undeclared divergence costs a finding on a non-defect and loses the reason the better
   mechanism exists.
6. Tracker row 01 → `IMPLEMENTED`. Touch no other row.
7. Review log entry: what changed, every branch choice with its reason, every divergence.
8. **Checkpoint commit** the moment you reach `IMPLEMENTED`, subject prefixed
   `CHECKPOINT (not approved): frontend 01 fix r2 …`, staging only this cycle's declared files plus
   the tracker and Review-log edits you actually made. Never the two untracked directories.
9. **Handoff** at `handoffs/implementer/phase-01-fix-round-2.handoff.implementer.md`, frontmatter
   `plan`, `role: fix`, `round: 2`, `state`, `date`, `actor`. Declare your perimeter
   **cycle-scoped** — the files *this session* changed, not the files the phase owns — and list
   every file a mutation probe touched separately from your own changes. Any question only the
   owner can settle goes in a `⚠ OWNER DECISIONS REQUIRED (n)` section right after your opening.
   No architecture graph exists here; report no graph delta.

## 7. Closing message

The charter's owner layer: **What I did → What I found and what it means for you → What happens
next → What needs you** — cards verbatim, or `nothing needs you`. Plain product language, one
pointer line naming your handoff.
