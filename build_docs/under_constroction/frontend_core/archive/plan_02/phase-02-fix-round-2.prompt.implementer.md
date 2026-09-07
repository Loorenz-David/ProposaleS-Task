---
plan: plans/phase-02-workspace-shell.md
role: implementer
round: 2
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — phase 02, fix round 2

You implement the **routed corrections from review round 1** of phase 02 of `frontend_core` in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `implementation-executor` doctrine: invoke the `implementation-executor` skill, or read
`/Users/davidloorenz/agent-skills/implementation-executor.md` and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them. Also
follow the repository's Architecture Context policy, routed through
`architectural_contracts/01-implementation-contract-guide.md`.

**This is a fix round, not a new phase.** The shell itself was built correctly and the review says
so in detail — read its "What I verified correct" section before you touch anything, so you do not
re-derive or disturb work that is already confirmed. What failed is the **measurement**: a large
share of this phase's tests cannot fail. Eight blocking defects survived 154 unit tests, 49
end-to-end tests and eleven named mutation probes, because each probe was drawn from the shape its
own instrument catches.

**Charter rule 14 binds this round.** Every correction below is quoted **verbatim** from the
review. Implement each one, or declare it unimplemented **with its reason** in the Review log and
the handoff. Silence on a quoted correction is a finding against this session.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Passes when |
|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md` status begins `RATIFIED`; §15 reads `(0 open)` |
| 2 | The round is outstanding | `master-plan.md` §4 row `02` reads `CHANGES_REQUESTED` |
| 3 | The plan agrees | `plans/phase-02-workspace-shell.md` header reads `IMPLEMENTED`, **Criteria** `6` |
| 4 | The plan is the amended one | its **Derived totals** line reads **60 rows** and **17** named mutations. If it reads 58 and 11 you are on a stale copy — stop |
| 5 | The tree is the reviewed one | `git status --porcelain` clean, `HEAD` at the coordinator's routing commit, and `git diff 7bfa79e -- src e2e` empty |

## 2. Read order

1. The review handoff `handoffs/reviewer/phase-02-review-round-1.handoff.reviewer.md` **in full**,
   including its mutation record — the eleven probes tell you exactly how each guard was defeated.
2. The plan, in full, including all four Review log entries. The criteria were amended today: C1,
   C2, C3, C4, C5 and C6 all changed, and the totals with them.
3. Intention **§12A.19** conditions 2 and 4 and **§12A.23**, all amended today (§16 round 10).
4. Master plan **§9 standing rules 17 and 18** (both added today, both earned by this round) and
   **§10.3A**'s viewport paragraph.

## 3. The corrections, quoted verbatim

### Blocking

**B1 — C6(a) ships as a denylist where the plan requires an allowlist.**
> replace both C6(a) instruments with an allowlist over the idle subtree's accessible tree —
> enumerate every role present and assert the set equals exactly the roles this state is permitted
> to have (`heading` plus its supporting static text, which carries no role), so that any role not
> in that set fails. The row's required probe (C6(g)) must plant a construct that is **not** a
> member of the instrument's own list; a `<ul>` is not an admissible probe for an allowlist row.

**B2 — C5(a) and C5(b) match their denylists against file paths, never against source.**
> `sourceFiles()` must return the file **contents** (or the call sites must `readFileSync` each
> path, as C5(d) at `:83–86` already correctly does) before any denylist runs against it.
> Additionally, each source-scanning row must assert that its scan had a subject — that the
> scanned text is non-empty and contains at least one token known to be present — so that a future
> refactor of the collector cannot silently empty the corpus again. C5(a) and C5(b) each gain a
> planted-defect probe: the criterion required probes only for (c) and (d), which is exactly why
> (a) and (b) shipped blind.

*Coordinator note, and the only place this prompt narrows a finding:* the review says both rows
"observe nothing whatsoever". **C5(a) is half sound** — its allowlist over `src/app/`'s route file
names works and does fail if a route file appears. Repair the navigation denylist half; do not
rewrite the working half.

**B3 — C4 condition 2 exempts the agent pane at every width, by the inference the plan forbade.**
> recognise the exception from the element's **declared** style, not its computed one — read the
> authored class list / `element.style` / a `data-*` opt-in marker that a container sets
> deliberately when it owns a horizontal scroll region, and treat every other element as subject
> to the rule. A computed `overflow-x` of `auto` that the author never wrote must not exempt
> anything. Re-run C4 condition 2 at all three widths against a planted overflowing child in
> **each** pane and record both reds.

**B4 — C4 conditions 3 and 4 never set a viewport.**
> add `await page.setViewportSize({ width, height: 800 })` before `page.goto("/")` in both tests,
> so all fifteen rows measure at the width their id names. Then re-run C4(f)'s named mutation
> (remove the divider's `tabIndex`) and confirm condition 3 reddens at **each** of the three widths
> independently, as C4(f) states.

**B5 — C4 condition 4 has no subject.**
> the row must first assert its subject exists — at each width, at least one `[data-elided]`
> element has `scrollWidth > clientWidth` — and only then assert that its full value survives in
> the accessible name, read via the accessibility tree rather than the raw attribute. If no product
> text in this shell genuinely elides at 780px, the honest outcome is to record condition 4 as
> **unmeasurable in this phase** the way condition 1's permanent green is already recorded, rather
> than to keep a green that means nothing. Planting a `data-elided` element that exists only to
> give the test a subject is not the remedy.

**B6 — C1(f)'s browser twin is a guard that cannot fail.**
> select the landmark the way the rest of the file does (`page.getByRole(...)` /
> `document.querySelector("aside")`, or add an explicit `role="complementary"` and keep the
> selector), assert the resize actually happened (`aria-valuenow` changed) before comparing
> identity, and take the two node references across separate `page.evaluate` calls with the state
> change between them. Then plant the remount and record the red — the row currently ships with no
> probe of its own.

**B7 — C2(b) measures the `ResizeObserver`'s latency, not the effective maximum.**
> pick two widths whose effective maxima genuinely differ under the named constants — derive them
> from `AGENT_PANE_MAX_PX + MAIN_PANE_MIN_PX` rather than typing literals — wait for the settled
> value at each (poll until it stops equalling the pre-observer value), and assert each against
> `getEffectiveDividerMax(width)`. C2(b) also needs a named mutation, since it currently has none
> and passed in its broken form.

**B8 — C2(d) and C2(f) claim "exactly once" and count nothing.**
> count announcements rather than asserting text. Instrument the live region with a
> `MutationObserver` installed before the interaction and assert the number of announcement events
> is exactly 1 for a reset and exactly 0 for a drag and for every non-reset keyboard step. Both
> rows then need a named mutation: announce twice on reset (C2(d) and C2(f) must redden) and
> announce on an arrow step (C2(d)'s absence half must redden). Fixing S1 below is a precondition —
> a counting instrument cannot work while the region's content is a constant.

### Should-fix

**S1 — only the first divider reset in a page's life is ever announced.** *(A real product defect,
not a test defect. It is the one finding here a user would feel.)*
> make each reset produce a distinct DOM mutation in the live region — clear the region and re-set
> it, or carry a monotonically increasing key alongside the text — so that every reset announces
> exactly once. Cover it with a row asserting that two consecutive resets produce two
> announcements.

**S2 — C5(c) is stated as an allowlist and shipped as a denylist over one syntactic form.**
> enumerate the module's exported names (parse the export statements, or assert the file matches an
> exact expected shape) and assert the set equals exactly `{MainSurfaceState}`, covering `type`,
> `interface`, `enum`, `const` and re-export forms; and assert `MainSurfaceState`'s member set
> equals exactly the four §12A.22 (A) rows, not that they occur in order. C5(e)'s probe must plant a
> form outside the instrument's own syntax — an `enum` or a constant map, not a second
> `export type`.

**S3 — C5(d)'s noun denylist was never implemented.**
> implement the file-name and exported-component-name denylist as the row states, over `src/app/**`
> and `src/features/**`, and keep the recorded limit accurate to what ships.

**S4 — the `main` landmark's accessible name is a projection of the state it presents.**
> give the `main` a stable accessible name the shell owns — an `aria-label` on the landmark itself,
> or a shell-owned heading whose text does not vary with the presented state — and change C1(a)'s
> assertion to that stable name so no later phase inherits the coupling.

**S5 — `flex-none` is production code whose only function is to make a named mutation bite.**
> make condition 2's instrument catch a fixed-width content column without depending on a flex
> property added for the probe — measure every content column's `getBoundingClientRect().width`
> against its pane's `clientWidth` across the subtree, not only the one `data-testid` column at
> `workspace.spec.ts:304`. Then either remove `flex-none` or state in the Review log what layout
> requirement it serves. Reconsider `overflow-x-hidden` on the `main`, or record it as a deliberate
> choice with its consequence.

**S6 — five assertions from phase 01's approved evidence were dropped in the relocation.**
> restore all six dropped assertions verbatim from `bootstrap.spec.ts` at `6fd8299`, including
> C3's one-test-per-property enumeration, and record in the Review log every remaining mechanism
> change with the assertion it preserves.

*This is phase 01's approved evidence. It is not yours to simplify.* The six are listed with their
original line numbers in the review's S6 table.

**S7 — two tests share the id `C1(d)`.**
> the carried document-title test keeps its phase-01 identity and is labelled as inherited
> evidence, not `C1(d)`; `C1(d)` names only the skip-link row. Re-derive the coverage map after the
> rename.

**S8 — the handoff's lint diagnosis is false and reached the owner layer.**
> strike the claim from the handoff's Evidence section and its owner layer. If a lint failure
> genuinely occurred at baseline, state what it actually was or record it as undiagnosed; do not
> carry an unverified repository claim into an owner-facing layer.

*Apply this to **your** handoff: round 1's handoff is a closed record and is not edited. State the
correction in your own Evidence section.*

### Notes to close in this round

**N1 — C6(e) carries a dead assertion.** Delete
`expect(within(idle).queryAllByLabelText(/.*/)).toBeDefined()`; the sibling assertion is sound and
hides nothing.

**N4 — the divider exposes an invalid ARIA value range on first paint** (`aria-valuenow="392"`
above `aria-valuemax="320"` until the observer fires). Close it while you are in B7's seam; C2(a)
gains the assertion that `valuenow` is within `[valuemin, valuemax]` at first paint.

### Routed elsewhere — do not implement these

- **N2** (`data-surface-state` has no asserting test) → master plan §11.3 follow-up 15, phase 14.
- **N3** (three design 02 deviations: no grip bar, no hover treatment, `overflow-x-hidden`) →
  master plan §11.2 delta 14. Design deltas are recorded, never implemented as design decisions
  (standing rule 7). The `overflow-x-hidden` half is touched only insofar as S5 asks you to record
  or reconsider it.
- **N5** (C3(e) was a property of the other rows) → already folded into the plan; C3 now has five
  rows, not six.

## 4. Scope fences

Phase 02's fences from round 1 all still hold — no session concept, no route or router, no second
surface, no new theme property, no transition or easing value, no package, no config file, nothing
under `src/components/ui/`, no persistence of the width, no invented idle visual treatment, and
`build_docs/future_implementations/` is never staged. In addition, for this round:

1. **Do not rewrite work the review confirmed correct.** Its "What I verified correct" section is
   the list: the client boundary, the divider's contract resolution, the clamp and its ordering,
   the `theme.test.ts` retirement, the README patch, the idle surface against design 10 §7, and
   C6(b)–(d). Touching those is scope you were not given.
2. **Do not edit round 1's handoff or its Review log entry.** They are the record of what happened.
3. **Do not edit the intention, the master plan (beyond your tracker row), or any other phase
   plan.** Today's semantic and process folds are already applied; if you believe one is wrong,
   report it rather than editing it.
4. **Do not add a test subject to make a check pass** — B5 says this explicitly for condition 4,
   and it generalises: an instrument whose subject you had to plant is measuring your fixture.

## 5. The seventeen named mutations

The plan declares **17**: C1 3 · C2 3 · C3 1 · C4 4 · C5 4 · C6 2. Re-derive from the criteria
table yourself and state your arithmetic. `executed != declared` blocks `IMPLEMENTED`.

Six of them are new this round and each exists because a guard passed with its own defect present:

| New probe | Must redden |
|---|---|
| C1(i) — force both landmarks to remount on a width change | C1(f), in **both** twins |
| C2(h)-i — announce twice on a reset | C2(d) and C2(f) |
| C2(h)-ii — announce on an arrow step | C2(d)'s absence half |
| C2(h)-iii — hold the effective maximum at its pre-observer value | C2(b) |
| C5(e)-iii — a complete navigation stack planted in `src/app/` source | C5(a) |
| C5(e)-iv — a surface registry module under `src/features/` | C5(b) |

**Every probe must plant a construct outside the instrument's own list** (standing rule 17). For
C6(g) that means a table, a button or an image — not a list. For C5(e)'s C5(c) probe that means an
`enum` or a constant map — not a second `export type`. A probe drawn from the list it validates is
how all eight blocking defects survived round 1, and repeating it is a finding.

**Re-run the eleven probes that already existed too.** Several of them ran against instruments you
are now replacing, so their old reds prove nothing about the new ones.

## 6. Evidence budget

Two L4 measurements, as in round 1:

1. **The baseline re-enumeration** on the tree as you receive it, before the first edit:
   `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build`. Round 1
   handed over unit 154/154 and E2E 49/49. **Note what `npm run lint` actually does** — S8 turns on
   it, and the coordinator measured it green with `test-results/` absent.
2. **The closing stamp** on the tree you hand over, all five.

Everything else is L1/L2. Any further L4 needs the line "narrower evidence insufficient because …"
written **before** the run.

## 7. Closing protocol

1. **Re-derive the coverage map over all 60 rows**, marking which rows changed instrument this
   round. Every phase-owned test maps to a row; the carried phase-01 tests are listed separately as
   inherited evidence, with S6's six restored assertions named.
2. **All 17 mutations run and reverted**, each with site, observed failing id and assertion, and
   revert. List every file a probe touched separately from your own changes.
3. **Every quoted correction in §3 addressed** — implemented, or declared unimplemented with its
   reason (charter rule 14).
4. **Documentation impact review**, per master plan standing rule 9 and contract 14 §8.
5. **Tracker row 02 → `IMPLEMENTED`** with date, actor, and a note carrying the new counts. Touch
   no other row.
6. **Review log entry** in the plan: what changed, each delegated or judgment call with its reason,
   and — required by name — what `flex-none` serves or that you removed it (S5), and what actually
   failed at round 1's baseline lint or that it is undiagnosed (S8).
7. **Checkpoint commit**, subject prefixed `CHECKPOINT (not approved): frontend 02 fix round 2 …`.
   Stage files, not directories; only this cycle's declared files plus your tracker and Review-log
   edits.
8. **Handoff** at `handoffs/implementer/phase-02-fix-round-2.handoff.implementer.md`, frontmatter
   `plan`, `role: implement`, `round: 2`, `state`, `date`, `actor`. Any question only the owner can
   settle goes in `⚠ OWNER DECISIONS REQUIRED (n)` immediately after your opening summary. There is
   no architecture graph in this worktree; report no graph delta.

## 8. Closing message

End with the charter's owner layer: **What I did → What I found and what it means for you → What
happens next → What needs you** — cards verbatim, or `nothing needs you`. Plain product language,
no section numbers or file paths in that layer, one pointer line naming your handoff.
