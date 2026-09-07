---
plan: plans/phase-03-session-runtime-and-tabs.md
role: reviewer
round: 3
date: 2026-09-07
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — first review of phase 03

You review **phase 03 of `frontend_core`** in
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

**Round numbering, so it does not confuse you:** round 1 was an implement round that stopped
before writing production code, round 2 implemented the phase, and this review is round 3. Rounds
count sessions within the phase, not review cycles.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | The phase is implemented | `master-plan.md` §4, row `03` | the **State** cell reads `IMPLEMENTED` |
| 3 | The plan agrees | `plans/phase-03-session-runtime-and-tabs.md`, header | its **State** row reads `IMPLEMENTED` or `PROMPT_READY` and **Criteria** reads `7` |
| 4 | The round is outstanding | `handoffs/reviewer/` | no `phase-03-review-round-3` handoff exists |
| 5 | The tree is the one that was handed over | `git log --oneline -1`, `git status --porcelain` | `HEAD` is the phase-03 checkpoint `5f34897` and the tree is clean. If it is not, say so and review what is there |

**Environment note:** the untracked, git-ignored `build_docs/future_implementations/` is not this
pipeline's work. Leave it alone.

## 2. Read order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` and `plan-reviewer.md` — your doctrine.
2. `plans/phase-03-session-runtime-and-tabs.md` **in full, including its Review log**, which now
   carries four entries: the pre-dispatch lint, the projection consumption, the round-1 stop, and
   the coordinator's consumption of round 2 with the findings in §4 below.
3. `handoffs/implementer/phase-03-round-2.handoff.implementer.md` — the round's own account.
4. The plan's **Read first** list, plus master plan §6.1–§6.4, §7.5, **§9 standing rules 15, 17,
   18 and 19**, §10.3, §10.3A, §10.4, §11.2, §11.3.
5. `git show 5f34897` — the whole diff, sixteen files.

## 3. Scope

Full first review of the phase against its 46 rows (4 held), its 16 named mutations, and the
semantic authorities. The four held rows — C1(c), C1(d), C1(e), C6(d) — are **not** defects; they
carry named triggers in master plan §7.5 and convert in phases 04, 05, 14 and 16. A finding that
they are untested is a finding against the plan, not the round, and the plan already says so.

## 4. Four findings already established — do not spend the round re-deriving them

Two are blocking and were proven by mutation; two are should-fix. They are in the plan's Review
log with their evidence. **Confirm or refute the routing, do not repeat the experiment**, and
spend the round on what follows them.

1. **B1 — C5(c)'s named mutation certifies a string.** The test ends with
   `expect(source).toContain("loop={false}")` against its own component file. Removing the
   configuration fails **only** that assertion; every behavioural assertion in the same test still
   passes, because the trigger's own `onKeyDown` clamps the index and calls `stopPropagation()`, so
   the foundation's `loop` never participates. Standing rule 19 is unmet in the row it was written
   for. **Your question is not whether this is true — it is what the correct instrument is**, given
   that non-wrapping is genuinely owned by the component's own clamp.
2. **B2 — C3(i)'s gate guard is an occurrence-count proxy.** It counts `\bcloseSession\(` in one
   file. A second removal path through an alias passes it, verified. Its companion regex
   `/function|const\s+closeSessionAtGate/` alternates wrongly and matches any file containing the
   word `function`. The row requires enumerating call sites over an open universe.
3. **S1 — the mandated primitive's keyboard mechanics are replaced, not composed on**, and the
   deviation is undeclared. Task 3's branch permits native elements where the primitive distorts
   the interaction, **and requires recording why**.
4. **S2 — the evidence budget was exceeded without the pre-run authorization line.**

## 5. Named probes — each unadjudicated, none of a shape the round's ledger used

1. **Does any mutation reach the clamp that actually owns non-wrapping?** Delete
   `Math.min(sessionIds.length - 1, index + 1)`'s bound, or the `Math.max(0, …)`, and see which
   assertions redden. If the behavioural half of C5(c) is sound, say so plainly — B1 is about the
   ledger's claim, not about the behaviour.
2. **`activationMode="manual"` plus a hand-written `onFocus` activation.** Is activation-follows-focus
   actually preserved on every path the intention's §12A.17 focus table names — arrow movement,
   `Home`/`End`, close-induced activation, creation? Probe each; one hand-rolled path is easy to
   miss.
3. **The close control is a tab stop.** The re-baselined orders imply three new stops before the
   divider: the active trigger, its close control, and the new-session button. Confirm the third,
   and confirm the count does not grow with session count — the re-baselined phase-02 rows assume
   exactly one session exists.
4. **The strip has no tabs until hydration.** The initial session is created in a post-mount effect,
   which is why three frozen tests needed a readiness wait. Probe what the server-rendered document
   contains, and judge it against §12A.23's landmark identity and the idle state's honesty.
5. **C2(h)'s subject.** The row is a drag interrupted by a creation or a close, re-rooted onto the
   move function. Does the shipped test actually change the list underneath an in-flight move, or
   does it assert a stale index against an unchanged list?
6. **The fused Playwright tests.** C5(e), C5(f) and C5(g) share one test and C4(b) covers five
   operations in one. Determine which rows are genuinely discharged and which are masked by an
   earlier assertion in the same body (charter rule 12).
7. **`forceMount`ed hidden tab panels.** They exist to give `aria-controls` a target. Confirm they
   are not in the accessibility tree as panels users can reach, that they add no landmark, and that
   they do not put a `div` wider than its pane inside the `complementary` — phase 02's frozen
   `C4(<width>-2)` has no exemption for that half.
8. **The frozen rows this phase must not have weakened.** `workspace.test.tsx` C5(a)–(d) and
   C6(a), and `e2e/workspace.spec.ts` beyond the five permitted instances. Diff them and confirm
   only the five changed, and only in tab order plus the readiness waits S3 describes.
9. **C1(b)'s allowlist against a generator it has not seen.** It asserts the record-creation call
   set equals `["createSessionId()"]`. Try deriving an id from something legal-looking that still
   violates §12A.1 — a value read from the ordered list's length inside `createSessionId` itself,
   one layer below the assertion's node.
10. **The announcement instrument.** C2(c)-ii and C2(f) both depend on it. Confirm it counts a
    settled announcement rather than a render, and that C2(c)'s three sub-checks each redden alone
    (rule 12) rather than the first masking the other two.

## 6. Depth targets beyond the probes

- **The trace chain in reverse.** Every test in the four new test files maps to a criterion row, or
  is an orphan (charter rule 16). 29 new unit tests against 42 measurable rows — check the map runs
  both ways, and that no row is discharged by a test weaker than its text.
- **Contract 11 §3** requires a feature store's transitions asserted directly, without rendering.
  The plan delegated the store/rendered split; judge whether the split landed where the rows say.
- **§12A.5 and §12A.17 as written**, not as the plan paraphrases them: the four reorder cases, the
  four close cases, and every focus destination.

## 7. Evidence budget

**Your L4 budget is one, and only if you need it.** The implementer's closing stamp — 183/183 unit,
69/69 end-to-end, typecheck, lint, build — was taken on checkpoint `5f34897`. If your tree matches
that checkpoint and is clean, **cite it and do not re-run**; re-running identical commands on an
identical tree with no variation is a finding against this session. Spend the budget on
**variation** instead: L1 mutants at sites the ledger did not use, which is where this pipeline's
real defects have always been found.

If you take an L4 run, write the line "narrower evidence insufficient because …" **before** it.

## 8. Closing protocol

Per the reviewer doctrine. Deposit
`handoffs/reviewer/phase-03-review-round-3.handoff.reviewer.md`, frontmatter `plan`,
`role: review`, `round: 3`, `verdict`, `date`, `actor`. Body, in order: verdict
(`APPROVED` / `CHANGES_REQUESTED`); an owner-readable opening; `⚠ OWNER DECISIONS REQUIRED (n)`
immediately after it, in charter card format, or one line saying nothing needs the owner; findings
split blocking / should-fix / notes, **each with a correction clause a fix round can be given
verbatim**; your adjudication of the four established findings in §4; every probe's result
including the ones that came back clean; your evidence records with tree identity; and your **full
write perimeter**. There is no architecture graph in this worktree; report no graph delta.

Do not edit production code. Do not write the plan's Review log or move the tracker beyond your own
row — the coordinator routes your findings.

## 9. Closing message

End with the charter's owner layer: **What I did → What I found and what it means for you → What
happens next → What needs you** — decision cards verbatim, or the single line `nothing needs you`.
Plain product language, no section numbers or file paths in that layer, one pointer line naming
your handoff file.
