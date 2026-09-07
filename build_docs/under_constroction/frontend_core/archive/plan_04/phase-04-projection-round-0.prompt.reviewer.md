---
plan: plans/phase-04-derived-presentation.md
role: projection
round: 0
date: 2026-09-07
project: frontend_core
feature: Proposal Copilot Frontend Core
---

# Session prompt — project phase 04 before its implementer prompt is compiled

You are a **plan-projection session** for phase 04 of `frontend_core` (Proposal Copilot Frontend
Core) in `/Users/davidloorenz/Desktop/Developer/Proposales-frontend`, branch
`proposal-copilot-frontend`. Run every command from that worktree root. **Never enter the sibling
backend worktree** `/Users/davidloorenz/Desktop/Developer/Proposales`.

Follow the `plan-projection` doctrine: read `/Users/davidloorenz/agent-skills/plan-projection.md`
and `/Users/davidloorenz/agent-skills/pipeline-charter.md` by absolute path, in that order, and
follow them as this session's doctrine. Also follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`, routed through
`architectural_contracts/01-implementation-contract-guide.md`).

**The plan file is your subject. Where this prompt differs from the plan file, the master plan, the
ratified intention, a design specification, or an applicable architecture contract, those
authorities win.**

**This project is now under owner decision 18, the MVP measurement bar** (master plan §9 standing
rule **18A**). Read it before you judge any instrument, because it changes what "adequately
measured" means here: closed-set absence rows are plain checks now. It does **not** license
sampling a total case table, and this phase is mostly total case tables.

## 1. Gate check — run first, stop and report on any failure

| # | Check | Where | Passes when |
|---|---|---|---|
| 1 | Intention ratified | `intention/frontend-core-intention.md`, status table | the **Status** value begins `RATIFIED` |
| 2 | No open owner decision | same file, §15 | the heading reads `Ratified owner decisions (0 open)` |
| 3 | Predecessor approved | `master-plan.md` §4, row `03` | the **State** cell reads `APPROVED` |
| 4 | The phase is unstarted, in **both** places | `master-plan.md` §4 row `04`, and `plans/phase-04-derived-presentation.md` header | both **State** cells read `NOT_STARTED`. If they disagree, that is the defect — stop and report it |
| 5 | The plan agrees on counts | the plan's criteria table | **Criteria** reads `6`, the table totals **34 rows**, and the derived-totals line states **5 named mutations** |
| 6 | The phase is genuinely unimplemented | the tree | `src/features/proposal-preparation/client/` does not exist and `components/agent/` does not exist |
| 7 | This round is genuinely outstanding | the tree | `handoffs/reviewer/phase-04-projection-round-0.handoff.reviewer.md` does not exist |

Do not gate on a commit SHA, on whether the working tree is clean, or on any file count.

**Environment note:** the untracked, git-ignored `build_docs/future_implementations/` is not this
pipeline's work. Leave it alone.

## 2. Read first, in this order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — manifest properties, trace chain,
   evidence scopes, decision-card format, owner layer.
2. `/Users/davidloorenz/agent-skills/plan-projection.md` — your doctrine.
3. `plans/phase-04-derived-presentation.md` in full, **including its Review log and Notes**, which
   carry the pre-dispatch lint's cuts and the reason a proposed row cap was refused.
4. Everything its **Read first** list names: master plan §6.3, §6.4, §6.5, §9 rule 14; intention
   §5.3, §8.2, §8.5, §12A.3 **in full including its overlap table**, §12A.4 **in full**, §12A.7
   **in full**, §12A.17's announcement rules; `ui_design/03-agent-surface.md` §3.2,
   `ui_design/04-session-tabs.md` §3.3–§3.4, §5 and its Prototype-only `tabState` entry; contracts
   `05-client-architecture.md` §5, §7 and `12-anti-patterns.md` "Components and client".
5. Additionally master plan **§9 standing rules 14, 17, 18, 18A and 19**, **§10.3**, **§10.3A**
   (which runner can measure which subject), **§10.4**, **§11.2**, **§11.3** — follow-up **9** names
   this phase as the one that introduces the pulsing dot and owes its reduced-motion correction, and
   follow-up **19** lists nine deferred measurement findings from phase 03 that this phase must not
   silently inherit as a standard.
6. The repository as it is — everything phase 03 shipped under
   `src/features/proposal-preparation/`, especially `hooks/use-workspace-session-store.ts`,
   `components/session-tabs/`, `types/session.ts`, and the two test files whose assertions this
   phase's code must keep satisfying.

You carry no planning-session context and no conversation history, and none is supplied here on
purpose: **what you cannot derive from the artifacts, the implementer cannot either.**

## 3. Depth targets — where this phase's silent-failure risk actually is

- **C1 and C2 are one mechanism, and C2 is the load-bearing half.** Six precedence rows plus seven
  overlaps. Every isolated row can pass while a mis-ordered first-match chain resolves the overlaps
  wrongly — silently, because each overlap still renders *a* valid status. For each of the seven:
  can a fixture be built in which **exactly one** predicate makes the expected outcome true
  (charter rule 2's companion), given that an overlap is by definition two predicates holding at
  once? That tension is the whole criterion; resolve it or report it.
- **C4 is a total event table for the workspace's one stored presentation value**, and the events
  that drive it — a turn dispatched, a result applied, a result discarded — **arrive in phase 05**.
  The plan says the rows are driven from constructed session runtime records. Check that each of the
  eight events is reachable that way, and say which are not.
- **C6's register is a closure claim over an open universe**, and rule 18A leaves that class
  unrelaxed. What instrument can assert "the register enumerates exactly §12A.7's rows" against code
  where most of those surfaces do not exist yet?
- **The reduced-motion row, C3(b).** Master plan §11.3 follow-up 9 says the phase introducing the
  pulse must implement design 01 §5 correction 6 and **may not rely on** phase 01's blanket
  `0.01ms` collapse, because a `0.01ms` pulse settles at `opacity:.25` — dimmed, the opposite of
  held. Which runner can observe that, and against what?
- **Two renderings, one call (C3(c)).** The status line and the tab dot must be one function of one
  record. What does a test hold to prove "no intervening write" rather than "both happen to agree"?

For each: could you write that test **right now**, from the artifacts alone, with one exact expected
outcome per case, naming the runner? A criterion you cannot turn into a concrete assertion is a
finding, not a detail to leave to the implementer.

## 4. What you are proving, and what you are not

**Proving:** the plan is implementable as written — every path and cited section resolves and says
what the plan claims, every criterion row is decidable, every trace cell is admissible under master
plan §7.4, every named mutation is derivable from the criteria, and every decision the plan leaves
open is recorded rather than resolved silently in code.

**Not proving:** that the code works. You write no code, edit no plan, edit no intention, edit no
contract, edit no design specification, and install nothing. Your skeleton is discarded.

**Calibrate your finding count to rule 18A.** Phase 03's projection returned 27 rows and its review
returned 18 findings; nine of those were deferred as instrument quality with no user-visible defect
behind them. Findings of that class are now **notes**, not blocking. Spend your depth on
decidability and on the overlap table.

## 5. Evidence budget — zero suite runs

**Your L4 budget is zero.** Do not run `npm test`, `npm run build`, `npm run test:e2e`,
`npm run typecheck` or `npm run lint`. The tree is the phase-03 approval stamp — unit 184/184, E2E
69/69, typecheck, lint and build green at `2630f5b` — and re-measuring it is the over-evidence
defect the charter names.

**Permitted and expected:** read-only inspection — reading files, `grep`, `find`, reading inside
`node_modules/` to learn what a package actually does, `git log` / `git status` / `git diff`, and
`npx vitest list` where it decides whether a criterion row is collectable. Any other read-only
command needs the line "narrower evidence insufficient because …" written **before** the run.

**Note on a parallel session.** A separate styling session may be running against
`components/session-tabs/` while you work. You write no code, so there is no conflict — but if you
find the tree changed under you mid-session, that is why. Judge the plan, not that diff.

## 6. Closing protocol

Deposit `handoffs/reviewer/phase-04-projection-round-0.handoff.reviewer.md` with the charter row
schema in its frontmatter (`plan`, `role: projection`, `round: 0`, `date`, `verdict`,
`actor: projection`), containing, in order:

1. **The verdict** — `PROJECTED_CLEAN` or `AMENDMENTS_REQUIRED`.
2. **An owner-readable opening**, 3–5 sentences, no citations and no jargon.
3. **`⚠ OWNER DECISIONS REQUIRED (n)`** immediately after it — charter decision cards, under ~120
   words each, or one line saying nothing needs the owner.
4. **The decision ledger** — decision point / classification (`plan gap` / `intention gap` /
   `free choice`) / proposed routing, with free choices proposed as explicit delegations.
5. **Reality-check and decidability findings**, each with its exact artifact and line.
6. **Trace verification, both directions**, per master plan §7.4.
7. **The gate check result**, row by row.
8. **Your full write perimeter** — every document written, every command run, and the explicit
   statements that no code changed, no plan/intention/contract/design specification was edited, no
   dependency was installed, and no suite, build or end-to-end run was taken. There is no
   architecture graph in this worktree.

Do **not** write the phase plan's Review log line and do **not** move either state cell; the
coordinator does both when it routes your ledger. Do not commit.

## 7. Closing message

End with the charter's owner layer: **What I did → What I found and what it means for you → What
happens next → What needs you** — decision cards verbatim, or the single line `nothing needs you`.
Plain product language, no section numbers or file paths in that layer, one pointer line naming your
handoff file.
