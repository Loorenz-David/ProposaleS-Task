---
plan: plans/phase-02-workspace-shell.md
role: reviewer
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — first review of phase 02

You review **phase 02 of `frontend_core`** in
`/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch `proposal-copilot-frontend`.
Run every command from that worktree root. **Never enter the sibling backend worktree**
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `plan-reviewer` doctrine: invoke the `plan-reviewer` skill, or read
`/Users/davidloorenz/agent-skills/plan-reviewer.md` and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path and follow them. Also
follow the repository's Architecture Context policy — a review judges contract preservation, not
only whether the code works, so run the routing in reverse: diff → concerns touched → guide →
applicable contracts → review the diff against them.

**This is the first review of this phase: full checklist against the plan's criteria and the
semantic authorities.** Where this prompt differs from the plan file, the master plan, the
ratified intention, a design specification, or an applicable architecture contract, those
authorities win.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | The phase is implemented | `master-plan.md` §4, row `02` | the **State** cell reads `IMPLEMENTED` |
| 3 | The plan agrees | `plans/phase-02-workspace-shell.md`, header | its **State** row reads `IMPLEMENTED` and **Criteria** reads `6` |
| 4 | The round is outstanding | `handoffs/reviewer/` | no `phase-02-review-round-1` handoff exists |
| 5 | The tree is the one that was handed over | `git log --oneline -1`, `git status --porcelain` | `HEAD` is the phase-02 checkpoint and the tree is clean. If it is not, say so and review what is there |

## 2. Read order

1. The plan, in full, **including its Review log** — which now carries three entries: the
   projection's folds, the implementer's own record, and the coordinator's consumption findings.
2. The implementer's handoff, `handoffs/implementer/phase-02-round-1.handoff.implementer.md`.
3. The projection handoff, `handoffs/reviewer/phase-02-projection-round-0.handoff.reviewer.md` —
   in particular its finding **F3** (what this test environment cannot measure) and **F4** (why
   C4's condition 1 cannot fail). Both are load-bearing for judging where a row is allowed to live.
4. Master plan **§6.4**, **§6.5A**, **§7.2**, **§10.3**, **§10.3A**, **§10.4**, **§11.2**, **§11.3**.
5. Intention **§12A.19** (amended this phase by owner decision 14), **§12A.22**, **§12A.23**
   in full, **§12A.17**.
6. `ui_design/02-workspace-shell.md` in full; `ui_design/10-design-integration-guide.md` §7.
7. The diff: `git show --stat HEAD`, then the files themselves.

## 3. Scope

The phase's own perimeter, and the semantic authorities it claims to serve. **Do not fix
anything** — findings route through the coordinator, which is what keeps the fix round's
perimeter honest. Do not widen the review into phases 03+ work; a defect that belongs to a later
phase is recorded as such.

## 4. Three findings already established — do not spend the round re-deriving them

The coordinator confirmed these while consuming the handoff. They are facts, not hypotheses. Read
them, confirm cheaply if you wish, and then **spend your round on their siblings**, which is where
the value is:

1. **C6(a) ships as a denylist where the plan requires an allowlist.** A statistics table, a
   button and an image were planted in the idle subtree and all five C6 tests passed. The plan's
   own words: *"a denylist of forbidden nouns here would prove only that its own list matches
   itself."* The round's probe M11 planted a `<ul>` — a member of the denylist it was validating.
2. **Two tests in `e2e/workspace.spec.ts` share the id `C1(d)`** — the carried phase-01
   document-title test and the phase-02 skip-link test.
3. **The handoff's lint diagnosis is false.** `npm run lint` passes with `test-results/` absent;
   no config references that path. The claim reached the handoff's owner layer.

**The sibling question for (1) is the one that matters: which other rows in this phase are
instrumented by a list that contains exactly the constructs their own probe plants?** C5(a), C5(b)
and C6(c) are all list-shaped. The plan requires each absence row to name its instrument **and**
record its limit; check the shipped instrument against the recorded limit, not against the prose.

## 5. Named probes — ten, derived from the shipped code, each unadjudicated

Each is a hypothesis the coordinator did **not** settle. Adjudicate every one: confirmed as a
defect, or dismissed with the reason. A probe you do not reach is stated as unreached, never left
silent.

| # | Probe |
|---|---|
| P1 | **C4 condition 2's exception may swallow the rule.** The plan required the "declares its own horizontal scroll" exception to be recognised by that declaration and **never inferred from a scrollbar's presence**, so that an incidental `overflow-y: auto` cannot excuse a real overflow. The shipped check accepts `declared === "auto" \|\| declared === "scroll"`. Determine what `declared` reads and whether a pane that sets only vertical scrolling is thereby exempted from horizontal overflow. This is the projection's L9 requirement, verbatim |
| P2 | **`flex-none` on the idle content column.** M4's ledger says the first probe came back green because the flex item shrank, and the condition was "re-sited with `flex-none`". `flex-none` is in the **shipped** production class list and appears in no delegated decision. Determine whether it serves the layout or exists to make the probe bite. If the latter, the criterion's named mutation does not catch the defect family the criterion names |
| P3 | **C2(d) and C2(f) claim "exactly once".** The shipped C2(d) asserts the same announcement text twice in succession. Determine whether one announcement is actually counted, or whether a second, third or duplicated announcement would pass |
| P4 | **C5(a)'s navigation denylist.** Does it catch `window.location.href = …`, `location.assign(…)`, `router.push` reached through an aliased import, or a `<Link>` re-exported through another module? Its recorded limit says what it does not observe — is the shipped limit the recorded one? |
| P5 | **C5(b)'s identifier denylist** matches the bare substrings `plugin` and `extension` against whole-file source text. Check both directions: what it over-matches (a comment, an unrelated identifier) and what a registry could be named to slip past it |
| P6 | **C1(f) in the jsdom copy may be inert.** jsdom performs no layout and the container width is `0`, so a keyboard resize there may change nothing at all — in which case node identity is preserved trivially and the row measures nothing. The browser twin at `e2e/workspace.spec.ts` is the real one; determine whether the jsdom copy earns its place or is a green that means nothing |
| P7 | **C6(e) carries a vacuous assertion** — `expect(within(idle).queryAllByLabelText(/.*/)).toBeDefined()` can never fail. Determine whether the row's real assertion (the sibling line) is sound and whether the dead line hides anything |
| P8 | **C4 condition 4 needs a subject.** It asserts that elided text keeps its full accessible name. Determine whether any text in this shell actually elides at 780px — if nothing elides, the condition is green by absence and measures nothing. M6 reddened it by changing an `aria-label`, which is not the same as proving the subject exists |
| P9 | **C1(e)'s focus move.** The skip link targets `#main-content` and the test asserts the `main` is focused. A `main` without `tabindex="-1"` does not take focus in every engine. Determine whether the assertion passes because the implementation is right or because the harness is lenient |
| P10 | **The carried phase-01 evidence.** Task 8 required the relocated rows to keep their **assertions** unchanged while allowing their reaching mechanism to change. The focus test now tabs three times instead of once. Verify each carried assertion against phase 01's approved original, and check that the deleted `theme.test.ts` block is exactly the one the plan named and nothing more |

## 6. Depth targets beyond the probes

- **Contract preservation.** Task 3's contract resolution (project-owned valued separator) as
  *implemented*, against contract 05 §7, contract 12 "Components and client", contract 15 §5, and
  §12A.17's forbidden list. The plan resolved this conflict in writing; your job is whether the
  code matches the resolution, not to re-argue it.
- **§12A.23 bullet 5**, the one forbidden-list item that is reviewed rather than tested: is
  `MainApplicationSurface` a justified boundary with one real consumer, or a shell-level
  abstraction introduced because decision 11 named the surface generically? The implementer's
  judgement is in the Review log; yours is the one that counts.
- **The containment perimeter as a whole.** C5 is this phase's reason for having a mandatory
  projection gate.
- **The README patch** (task 9) against contract 14 §1 and §8, including the Proposales-adapter
  statement registered as master plan §11.3 follow-up 14.
- **The idle surface's design gap.** The plan forbids inventing a visual treatment (master plan
  §11.2 delta 8, design 10 §7's excluded list). Check that the marker is a marker.
- **Scope fences.** No new theme property, no transition or easing value, no package, no config
  file, nothing under `src/components/ui/`, no route or router, no persistence of the width.

## 7. Evidence budget

**Your tree is byte-identical to the implementer's checkpoint** — verify that first
(`git status --porcelain` clean, `HEAD` at the checkpoint). If it is, the implementer's closing
stamp is citable evidence under the charter's tree-identity rule, and **re-running it is
over-evidence and is a finding against this session**. Phase 01's review round spent its budget
correctly this way and it is the reason that round found what it found.

Spend your runs on **variation** instead: mutants the implementer did not plant, at L1
(`npx vitest run <path> -t "<name>"`, `npx playwright test <file> -g "<name>"`). Every probe in §5
is reachable that way.

One L4 is authorized **only** if a finding genuinely requires it, and it requires one line written
**before** the run: "narrower evidence insufficient because …".

Every mutant you apply is reverted before you close, and the file it touched is listed in your
handoff separately from anything else.

## 8. One thing about this round that is not normal in the other direction

Phase 01's review ran with the cross-family property spent — one model family filled both roles.
**This round has it back**: the implementer was Codex, and you are a Claude session. That is the
configuration the standing split exists to produce, so this round is expected to see what a
same-family round could not. The three established findings in §4 were found by reading the
shipped code against the plan's own words; treat that as the calibration for what this round
should be finding, not as its ceiling.

## 9. Closing protocol

Deposit `handoffs/reviewer/phase-02-review-round-1.handoff.reviewer.md` with the charter row
schema (`plan`, `role: reviewer`, `round: 1`, `date`, `verdict`, `actor`), containing:

1. **The verdict** — `APPROVED` or `CHANGES_REQUESTED`.
2. **An owner-readable opening**, 3–5 sentences, no citations, no jargon.
3. **`⚠ OWNER DECISIONS REQUIRED (n)`** immediately after it, in charter card format, or one line
   saying nothing needs the owner.
4. **Findings, severity-ordered**, each with its exact artifact and line, the defect it names, and
   a **correction clause** stating what must change — the coordinator quotes that clause verbatim
   into the fix prompt, so write it to be operative rather than descriptive. The three findings in
   §4 are already established; restate them as findings with correction clauses so the fix round
   has one list, and mark them as confirmed rather than newly found.
5. **The ten named probes, each adjudicated.**
6. **Your own mutation record**: the mutants you applied, where, and what reddened.
7. **Lessons for the plans** — routed by home: semantics to the intention, process or environment
   to the master plan, an under-specified criterion to this phase plan. **One is already known to
   be owed**: the plan told C6(a) to be an allowlist in plain words and the round shipped a
   denylist anyway, which means the plan's instruction was not where the implementer needed it.
   Say where it should have been.
8. **Your full write perimeter**, and the explicit statement of what you did and did not run.
   There is no architecture graph in this worktree; report no graph delta.

Update tracker row 02 to `REVIEWING` when you begin and to `CHANGES_REQUESTED` or `APPROVED` at
your verdict. Touch no other row. Do not fix the code.

## 10. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it means
for you → What happens next → What needs you** — cards verbatim, or `nothing needs you`. Plain
product language, no section numbers or file paths in that layer, one pointer line naming your
handoff.
