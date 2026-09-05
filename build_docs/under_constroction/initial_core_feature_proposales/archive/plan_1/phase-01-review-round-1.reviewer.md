---
plan: 1
role: reviewer
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Repository topology and environment
---

# Session prompt — review phase 1 (first review)

You are the **reviewer** for phase 1 of `initial_core_feature_proposales` in
`/Users/davidloorenz/Desktop/Developer/Proposales`. The phase was implemented by a
Codex session; you are independent of it.

Invoke the `plan-reviewer` skill and follow its doctrine. Also invoke the repository's
`architecture-context` skill — you are judging contract preservation, not only whether
the code works.

This is a **first review**: full checklist against the plan's criteria and the semantic
authorities. Not delta-scoped.

---

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status header | reads `RATIFIED` |
| 2 | Tracker row 1 (`master-plan.md` §4) | reads `IMPLEMENTED` |
| 3 | The implementation is present | `src/lib/env/server.ts` exists and exports `parseServerEnv` |
| 4 | The phase's review log has an implementer entry and no reviewer entry | `plans/phase-01-topology-and-env.md` Review log |

The working tree may carry an uncommitted handoff file. That is expected and is not a
reason to stop.

## 2. Read order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — review protocol, the
   test-evidence scopes, standing rules (**15** above all: a guard ships with proof it
   can fail), the trace chain, the owner layer.
2. `/Users/davidloorenz/agent-skills/plan-reviewer.md` — your doctrine and checklist.
3. `plans/phase-01-topology-and-env.md` — the criteria you are reviewing against.
4. `handoffs/implementer/phase-01-round-1.implementer.md` — the implementer's claims.
   Treat every claim as a hypothesis, not a fact.
5. Master plan §5 (R7, R8), §6.2, §9, §10; intention §17A.15, §17A.3; contracts
   `02-runtime-boundaries.md` §3, §7, §8, `03-feature-architecture.md` §4,
   `06-data-contracts-and-validation.md` §2–§3, `11-testing-principles.md` §5.

## 3. Evidence budget and what is already established

**Your L4 budget is exactly one run**, and only if you need it. The implementer's
closing stamp was taken at `HEAD=ea24913` with a working tree carrying only its own
handoff as modified. **The coordinator verified that tree identity against the
repository and it matched**, so the stamp is valid evidence you may cite:

> `npm test` → 7 files, 24 tests passed · `npm run typecheck` green · `npm run lint`
> green, at `ea24913`.

**The code tree is unchanged since that stamp.** `HEAD` is still `ea24913`; the only
working-tree differences are documentation under `build_docs/` (the implementer's
handoff and this prompt), which no test imports and no config includes. Verify that for
yourself with one `git status --porcelain` — if everything dirty is under `build_docs/`,
**the stamp holds and you must not re-run those three commands for independence.**
Re-running identical commands on an unchanged code tree with no variation is a finding
against the session (charter: over-evidence is a defect, symmetrically). Spend your
effort on **variation** — different sites, different conditions, different mutant shapes
than the ones already recorded. If anything outside `build_docs/` is dirty, or `HEAD`
has moved, take the L4 stamp; that is the one authorized run.

**Arithmetic the coordinator already reconciled** (do not redo it; probe it only if you
think it is wrong): 17 criterion rows ↔ 17 tests (14 in `server.test.ts`, 3 in
`test/setup/node.test.ts`, consistent with every mutation row's pass/fail totals);
baseline 5 files / 7 tests + 2 files / 17 tests = 7 files / 24 tests; 6 named mutations
declared, 6 executed. The declared write perimeter matched the checkpoint commit.

## 4. Named probes — findings the coordinator surfaced for you to judge

These are not conclusions. Each is a hypothesis with a reason to suspect it; confirm or
refute, and record which.

1. **The jsdom project has no offline guard.** `test/setup/node.ts` installs the
   placeholder environment and the `fetch` guard, and `vitest.config.mts` wires it to
   the **node** project only; the jsdom project keeps `vitest.setup.ts`. C4(c) proves
   the node project is offline and proves nothing about jsdom. Intention criterion 12
   and M7 say the whole default `npm test` runs without network access. Judge: is this
   a real gap against the intention, a deliberate and acceptable scoping of phase 1, or
   something phase 15's isolation scans already own? If it is a gap, it is a **candidate
   criterion** to route, and it may belong to a later phase rather than this one — say
   which.
2. **Empty probe directories survive on disk.** `src/features/phase01-probe/`
   with `components/`, `schemas/`, and `server/` still exist; their files were correctly
   deleted. Git does not track empty directories, so `git status` is clean and the
   perimeter check passes — which is exactly why this went unnoticed. Judge severity
   against charter rule 4 (no dead scaffolding) and say whether it must be cleaned in
   this phase or noted.
3. **The lint exception list is untested.** `eslint.config.mjs` exempts
   `test/setup/node.ts`, `test/setup/node.test.ts` and `playwright.config.ts` from the
   `process.env` restriction. The exemptions look narrow and justified, and the
   implementer declared them as a judgment call. But no criterion row asserts the
   list's boundaries, so a future widening of that `files:` glob would silently disable
   the guard for application code with every test still green. Judge whether a row is
   owed, and if so whether here or in the plan.
4. **C3 verifies against the production config** — `server.test.ts` imports
   `../../../eslint.config.mjs` and runs `Linter.verify` against it. Confirm that this
   is genuinely the shipped config and not a re-declaration, and that C3(a)'s planted
   file reddens for the reason claimed rather than for an unrelated rule. This is the
   phase's strongest guard; verify it is as strong as it looks.
5. **MUT-01-6 reached the live vendor.** Removing the fetch guard let the probe make a
   real request to `api.proposales.com`, which returned 401 — the correct red, obtained
   by touching a live external service (charter rule 9). Inherent to that mutation's
   shape. Note it so no future round re-runs it casually, and judge whether the
   mutation should be redefined against a local endpoint.

Beyond these, run your own full checklist. The five above are where the coordinator's
consumption stopped, not where the review should.

## 5. Depth targets specific to this phase

- **Every guard row must be shown capable of failing**, not merely to have run green:
  C3(a)/C3(b) (the lint boundary), C4(c) (the offline guard), and C5(a) (the
  `.env.example` inventory, which is absence-shaped — confirm it reddens when a name is
  added to one side only, in **both** directions).
- **Charter rule 2's companion:** for each row, is its fixture the *only* reason the
  expected outcome holds? C1(c) in particular — it asserts one vendor key is named and
  the other is not; check it cannot pass for a second independent reason.
- **Rule 13:** criteria must assert contracts, not literals. C4(b) pins the exact
  placeholder string `"test-placeholder-not-a-key"`; judge whether that is a contract
  or a time bomb.
- **Contract fidelity:** contract 02 §8 on `.env.example` (names, empty values), §3 on
  `server-only`, §7 on lint enforcement; 06 §3 on coercion at the env boundary.

## 6. Closing protocol

1. Findings routed by severity, each naming its correction clause precisely enough to
   be quoted verbatim into a fix prompt.
2. **Lessons for the plans** — separately, per the charter's fold-back path: which
   belong to the intention, which to the master plan, which to this phase's criteria,
   which are forward hazards for phases 2+.
3. Review-log entry in `plans/phase-01-topology-and-env.md` (append-only; the
   implementer's entry stands).
4. Tracker row 1 → `REVIEWING` while you work, then `APPROVED` or
   `CHANGES_REQUESTED`. Update only your own row.
5. **Handoff** at `handoffs/reviewer/phase-01-round-1.reviewer.md`, row-schema
   frontmatter (`plan`, `role`, `round`, `date`, `state`/`verdict`, `actor`), declaring
   your **full write perimeter** — including any probe file you planted, whether or not
   you deleted it.
6. Owner decision cards in one `⚠ OWNER DECISIONS REQUIRED (n)` section immediately
   after the opening summary, charter format. Zero cards: say so in one line.

Do not fix what you find — findings are routed, not repaired, by the reviewer.
Archgraph is not present; skip it silently.

## 7. Final chat message (the owner layer)

**What I did → What I found and what it means for you → What happens next → What needs
you** (cards verbatim, or one line: "nothing needs you"). One pointer line names the
handoff. No section numbers or paths in that layer; plain product words; under ~300
words unless cards are pending.
