---
plan: plans/phase-01-baseline-and-visual-foundation.md
role: reviewer
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — first review of phase 01

You review **phase 01 of `frontend_core`** in
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
| 2 | The phase is implemented | `master-plan.md` §4, row `01` | the **State** cell reads `IMPLEMENTED` |
| 3 | The plan agrees | `plans/phase-01-baseline-and-visual-foundation.md`, header | its **State** row reads `IMPLEMENTED` and **Criteria** reads `8` |
| 4 | The work exists | the tree | `src/styles/theme.css` exists |
| 5 | This round is outstanding | the tree | `handoffs/reviewer/phase-01-review-round-1.handoff.reviewer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note:** the untracked `build_docs/future_implementations/` is not this pipeline's
work — leave it alone. The spent projection prompt and its consumed handoff sit in the reviewer
tables; they archive at closeout, not now.

## 2. Read order

1. `master-plan.md` — §2, §3, §5, §6.1–§6.5A, §7.4, §9 (all sixteen standing rules), §10 in
   full, especially **§10.3 (the partition rule) and §10.3A (what no Vitest project here can
   measure)**, §11.2, §11.3.
2. The semantic authorities: intention §2.1, §4, §5.9, §13 conflict **C-4**, §14.3 items 1 and 4,
   §15.1 item (k); `ui_design/01-visual-system.md` in full — **§5 is the set of required
   production corrections, and C7(a) asserts them by value**; `ui_design/10-design-integration-guide.md`
   §1, §4, §5.
3. `plans/phase-01-baseline-and-visual-foundation.md` — in full, **including its Review log**,
   which carries the projection routing, the implementer's entry, and the coordinator's
   consumption entry naming the five probes below.
4. `handoffs/implementer/phase-01-round-1.handoff.implementer.md` — the coverage map, the
   mutation ledger, the evidence records and the write perimeter you are judging.
5. The contracts the plan names, and the diff itself: `git show d30ef8f`.

## 3. Scope

Phase 01's checkpoint is `d30ef8f`, 14 files. The phase's declared perimeter, the criteria
(C1–C8, 31 rows), and the 11 named mutations are all in the plan file. The coordinator has
already reconciled the arithmetic and the perimeter and found them sound — **that reconciliation
is not a substitute for your own judgment, but it does mean the questions worth your depth are
about whether the assertions are the shape their rows specify, not about whether the counts add
up.**

## 4. Named probes — five, derived from the shipped code, each unadjudicated

These are the coordinator's observations on consumption. **None is a settled finding**; each is a
question you answer with evidence. Confirming a probe as a non-issue, with the reason, is as
useful as confirming it as a defect.

**P1 — disjunction where an exact count belongs.** Four sites, most severe first:
- `e2e/bootstrap.spec.ts:107` guards the C3(a) enumeration with `referenced.length > 0`. The
  property list is derived from `globals.css` at file-load time, which is good — but if that
  derivation ever yields one property instead of sixteen, fifteen rows vanish and the suite stays
  green, on the criterion this phase exists to close.
- `src/styles/theme.test.ts:176` (C1(e)) plants **three** distinct forms — a hex colour, a radius
  and a `px` size — and asserts `positive.length > 0`. A scanner that silently stopped catching
  two of the three keeps this row green. Charter rule 2's companion: the fixture must make its own
  predicate the only reason the outcome holds.
- `theme.test.ts:384` (C8(b)) asserts `rows.length >= 2` where the criterion says *both* rows.
- `theme.test.ts:247` (C4(f)) uses `> 0` where C4's contract is *exactly one*.

**P2 — does C7(b) catch what owner decision 13 declined?** The guard is a nine-fragment denylist
that deliberately excludes `tab`, `panel`, `dot`, `button` and `badge`, on the documented ground
that design 01's tables use those as usage-context descriptors for base-ramp rows. The reasoning
is not unreasonable. The consequence to adjudicate: those five are the product's own component
nouns, so `--color-tab-active-bg` — a genuine component-level value, exactly what master plan
§6.5A forbids — would pass. C5(d) records its name-list limit inside the criterion; C7(b) records
no equivalent limit. Is the guard adequate, does it need a recorded limit, or does it need a
different instrument?

**P3 — C4(d) is self-declared weaker** by the implementer's own coverage map: discharged jointly
by C4(a) plus the pre-existing `test/setup/node.test.ts`, not by a dedicated test. Declaring it
was the correct behaviour. Is the row met?

**P4 — C5(d)'s probe proved the checker, not the shipped wiring.** The probe pointed the function
at a `/tmp` fixture through a temporary test, both since removed — which is what the plan
prescribed, since this phase may not edit `package.json`. What no probe demonstrated is that the
**shipped** C5(d) test passes `package.json` to that function.

**P5 — C4(g)'s mutation is not achievable as the plan words it.** "Place a test file outside every
include glob" cannot be done under the §10.3 partition, which is total by construction. The
implementer narrowed the jsdom globs and planted a file, observed the red, and reverted both —
declared in the ledger. **The plan wording was deliberately left unamended so you judge the
substitute independently**, rather than against a criterion retro-fitted to the implementation.
Is the substitute a sound discharge of C4(g)? If so, the coordinator folds the wording at
closeout.

## 5. Depth targets beyond the probes

- **Mutation-test the tests.** The phase's guards are its product: C1's scanner, C3's property
  enumeration, C4's partition assertion, C5's four absence rows, C7(b)'s taxonomy guard, C8(a)'s
  staleness rule. The implementer ran 11 named mutations; **spend your independent effort on
  variation** — a different site, a different mutant shape, a form the ledger never tried — not on
  reproducing the eleven.
- **C7(a) asserts six corrected values by literal.** Read each against `ui_design/01-visual-system.md`
  §5. A literal that does not match the specification is a wrong value wearing a passing test.
- **The documentation patch.** Eight documents were patched. Contract 15's rules — the promotion
  rule, the inline-style rule, the one-mechanism rule — must survive **verbatim**; only the
  description of what exists may have changed. A weakened rule is a blocking finding.
- **Master plan §6.5A.** The theme layer carries design 01's base ramps with §5's corrections and
  **no semantic layer, component-level value, or multi-theme scale**. Read `theme.css` against
  that directly; P2 asks whether the automated guard is sufficient, this asks whether the artifact
  actually complies.

## 6. Evidence budget

**Your L4 budget is one run, and only if you need it.** The implementer's closing stamp is
recorded in its handoff against checkpoint `d30ef8f`: `npm test` 137/137, `npm run test:e2e`
26/26, typecheck, lint and build clean. **If your tree matches that checkpoint, cite the stamp —
do not re-run it.** Re-running evidence whose tree identity matches yours, with no variation and
no pre-run authorization line, is a finding against this session, the same severity as an unrun
mutation.

Spend your runs on **variation instead**: your own mutants at L1/L2
(`npx vitest run <path> -t "<name>"`, `npx playwright test -g "<name>"`), at sites and in shapes
the implementer's ledger did not use. That is what has actually caught defects in this pipeline.

Any additional L4 needs one line written **before** the run: "narrower evidence insufficient
because …".

## 7. One thing about this round that is not normal

The standing split is Codex implements, Claude reviews, because **two model families fail
differently and the second catches what the first cannot see**. Codex was unavailable, so phase 01
was implemented by a Claude Sonnet session and you are a Claude Opus session (master plan §3
substitution). The capability rule holds; the cross-family property does not.

Two consequences bind you, and they are recorded in §3 of the master plan:

1. **Where a judgment of yours turns on reading the plan the same way the implementer did, say so
   in the Review log** rather than recording it as agreement. Shared reading is not corroboration
   this round.
2. **Do not treat "this is what I would have written" as evidence that it is right.** The
   probes in §4 are all of that family — assertions that look correct and may not be able to fail.

## 8. Closing protocol

Deposit `handoffs/reviewer/phase-01-review-round-1.handoff.reviewer.md` with the charter row
schema (`plan`, `role: reviewer`, `round: 1`, `date`, `verdict`, `actor`), containing:

1. **The verdict** — `APPROVED` or `CHANGES_REQUESTED`.
2. **An owner-readable opening**, 3–5 sentences, no citations, no jargon.
3. **`⚠ OWNER DECISIONS REQUIRED (n)`** immediately after it, in charter card format, or one
   line saying nothing needs the owner.
4. **Findings, severity-ordered**, each with its exact artifact and line, the defect it names,
   and a **correction clause** stating what must change — the coordinator quotes that clause
   verbatim into any fix prompt, so write it to be operative rather than descriptive.
5. **The five named probes, each adjudicated** — confirmed as a defect, or dismissed with the
   reason. A probe you do not reach is stated as unreached, not left silent.
6. **Your own mutation record**: the mutants you applied, where, and what reddened.
7. **Lessons for the plans** — routed by home: semantics to the intention, process or
   environment to the master plan, an under-specified criterion to this phase plan.
8. **Your full write perimeter**, and the explicit statement of what you did and did not run.
   There is no architecture graph in this worktree; report no graph delta.

Update tracker row 01 to `REVIEWING` when you begin and to `CHANGES_REQUESTED` or `APPROVED` at
your verdict. Touch no other row. Do not fix the code — findings route through the coordinator.

## 9. Closing message

End with the charter's owner layer, in this order: **What I did → What I found and what it means
for you → What happens next → What needs you** — cards verbatim, or `nothing needs you`. Plain
product language, no section numbers or file paths in that layer, one pointer line naming your
handoff.
