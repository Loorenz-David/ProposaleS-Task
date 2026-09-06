---
plan: none — role handover, pipeline-state commit, and the phase-01 dispatch decision
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
state: COMPLETE
verdict: HANDOVER TAKEN — pipeline state committed; phase-01 projection gate NOT waived; projection round 0 dispatched; one owner card open (non-blocking)
actor: Claude Opus 5 (1M context), coordinator session (role moved from a Codex session)
---

# Coordinator handover round 1 — frontend_core

The coordinator role moved from a Codex session to a Claude session. Nothing about the
pipeline's shape changed: the charter puts coordinator and reviewer on Claude-side roles and
the implementer on Codex, and that split is unchanged and is not mine to reassign.

Three things happened. The uncommitted pipeline state — the plan set, the ratified intention
amendments, the reduced README and the pre-planning archive — is **committed** (`a9d9fc0`),
so the phase-01 checkpoint's diff will carry only phase 01's work. The phase-01 plan was
linted against the charter's manifest properties before dispatch and **one defect was found
and folded back** into the master plan. The phase-01 projection gate is **not waived**, and
`prompts/reviewer/phase-01-projection-round-0.prompt.reviewer.md` is live.

---

## ⚠ OWNER DECISIONS REQUIRED (1)

### Card 1 — who implements phase 01

**Question.** When the projection round returns, does a fresh Codex session implement phase
01 as the standing split says?

**Story.** The split is Codex writes, Claude reviews, because two model families fail in
different ways and the second catches what the first cannot see. The previous coordinator was
a Codex session and is out. Phase 01 is the foundation sixteen later phases style, test and
document from. If one family both writes and reviews it, that family's blind spot becomes a
blind spot in everything above it, and it surfaces much later as a phase behaving strangely
for reasons nothing in the record explains.

**Branches.**
- *Fresh Codex session implements, Claude reviews* — the split holds; costs only the wait.
- *Claude implements, a different Claude reviews* — phase 01 lands sooner and the split's
  protection is spent on the worst possible phase.
- *Wait for Codex* — nothing is lost; the calendar slips.

**Recommendation.** Fresh Codex session, because phase 01 is the phase everything rests on.

**On silence.** The gate holds. The projection runs, its ledger routes, the implementer prompt
is compiled — and not dispatched.

**Trace.** backend master plan §9.0, §9.0.1; master plan §3 "Split"; tracker row 01.

---

## 1. Gate check

| # | Check | Result |
|---|---|---|
| 1 | Intention status begins `RATIFIED` | **PASS** — status table, first token |
| 2 | No open owner decision | **PASS** — §15 heading reads `Ratified owner decisions (0 open)`; the status table's last sentence states no owner decision is open |
| 3 | Inventory gate passed | **PASS** — §12A.23 exists at line 1137; ledger `F30` exists; §16 round 8 records decision 12 resolved by David and the exit gate fully passed |
| 4 | The plan set exists | **PASS** — `master-plan.md` present; `plans/` holds seventeen `phase-NN-*.md` files, enumerated with `ls` |
| 5 | Nothing in flight | **PASS at entry** — `prompts/implementer/` and `prompts/reviewer/` held only `.gitkeep`; the only unconsumed handoff was the planning one; every tracker row read `NOT_STARTED` |

Row 5 is stated as of session entry. It has since changed by my own dispatch, which is the
intended change.

---

## 2. Pre-dispatch plan lint — one defect, folded back

Run against the charter's five manifest properties and the coordinator doctrine's named
commands, at source, before any prompt was compiled.

**Finding L1 — phase 01 C6's trace cell was inadmissible under the master plan's own rule.**
C6 traces to `11 §3`. Master plan §7.4 admits an architecture-contract trace cell **only for
the criteria it enumerates**, and that enumeration listed phase 01 C1, C3, C4, C5 and phase 17
C4, C5 — not C6. So the plan shipped a row whose trace cell the skeleton forbade: a filled
cell pointing at nothing the project admits.

**Routing.** Checked against the measurement ledger first: no F entry covers "the end-to-end
suite is honestly green against the tree this phase leaves". C6 is a repository engineering
constraint of exactly the class §7.4's bullet admits, and it names the defect it guards. So
the **enumeration was wrong, not the criterion**, and the fold-back went to the skeleton —
master plan §7.4, with the reason recorded inline. No phase plan's criteria were edited.

**The other four properties, and the three cross-cutting checks, passed:**

- *References resolve.* Every path in the read-first list and the expected-files list exists
  or is correctly marked new (`src/styles/theme.css`, `src/styles/tokens.css` and
  `src/components/ui/` are all absent, as C5 requires). Every cited contract section exists
  and says what the plan claims: contract 11 §1–§3, 15 §1–§6, 05 §7, 12 "Styling and UI
  system", 13 §5 and §8, 14 §8. Every cited intention section resolves: §2.1, §4, §5.9, §13
  C-4, §14.3 items 1 and 4, §15.1 item (k). `ui_design/01-visual-system.md` §5 and §6 and
  `10-design-integration-guide.md` §1, §4, §5, §7 all exist.
- *Counts derive.* Rows: C1 3 · C2 4 · C3 2 · C4 6 · C5 5 · C6 3 = **23**, matching the plan.
  Named mutations, re-derived at dispatch as the plan instructs: C1 1 · C2 1 · C3 1 · C4 1 ·
  C5 **4** (one probe per absence sub-row a–d) · C6 0 = **8**. The plan's "5" is its count of
  probe-bearing criteria and it flags C5(e) as expanding at dispatch, so this is the
  derivation, not a discrepancy.
- *Rows addressable.* Every row is lettered; the sweep found no acceptance claim hiding
  inside an ordered task.
- *Exact outcomes.* C4(a) says "exactly one"; C3(a) says "one row per property the file
  references, not sampled". No disjunction found.
- *Perimeter-vs-guard collision.* None: no existing test references `globals.css`,
  `tokens.css`, `vitest.config`, `bootstrap.spec`, a README, or `architectural_contracts/`.
- *A deletion leaves no unused import.* Task 6 deletes the second `e2e/bootstrap.spec.ts`
  test entirely; `expect` and `test` both remain used by the first.
- *Standing instructions naming this plan.* Master plan follow-up register rows 1–5 all name
  phase 01 and are all covered by tasks 5, 6 and 7. See §5 below for the one precision item
  this surfaced.

---

## 3. The projection decision — not waived

**Decision: the phase-01 projection gate is NOT waived.** One line, as required: *phase 01's
criteria are guard-shaped in the two families §7.2 makes mandatory — C5 is four absence rows
and C1 is a purity check — and this is the foundation sixteen later phases style, test and
document from, so a plan defect here is paid sixteen times.*

The reasoning, at length, because a waiver was available and I declined it:

1. **The plan's own content meets the mandatory trigger.** §7.2 makes projection mandatory
   when a phase touches charter rule 6's families, and names *absence claims* explicitly.
   Phase 01 C5 is four absence rows with four planted-defect probes, and C1 is a source-level
   purity check with its own scope assertion. The planner classified the phase waivable;
   the criteria it then wrote are in the mandatory families. Where the classification and the
   content disagree, the content is the fact.
2. **The lint already returned non-empty.** Finding L1 was found by reading, in one pass, by
   an agent not doing the implementer's first hour. A phase whose ledger is non-empty before
   the projection session opens is the definition of a phase worth projecting.
3. **The planning session recommended it.** Its §11 said not to waive the gate *in spirit*.
   The spirit is that phase 01's claims are confirmed by observation rather than inherited by
   reading; the formal gate is the cheaper instrument for that than discovering the same
   thing in a fix cycle.
4. **Cost asymmetry.** One projection session against sixteen phases that style, test and
   document from whatever phase 01 leaves behind.

**Consequence for the tracker.** Row 01 stays `NOT_STARTED` while the projection session is
out — the state is positional, and the live row in `prompts/reviewer/` is what says a session
is dispatched. The row moves to `PROJECTED` only when the projection handoff's ledger is fully
routed, and to `PROMPT_READY` when the implementer prompt is compiled.

**Consequence for card 1.** Projection runs under the reviewer role, which the split puts on
Claude. So the implementer-availability question does not block this session; it becomes due
one session from now, which is why the card is raised now and marked non-blocking.

---

## 4. What I found in the tree that the planning handoff did not predict

The planning session's three §9 findings were derived by reading and it ran nothing. I
confirmed all three **at source, still by reading** — the run-based confirmation is phase 01
task 1 and is deliberately left to the implementer (see §6). What reading adds:

- **Finding 9.2 is exact, and C3(a)'s row count is derivable now.** `src/styles/globals.css`
  references **16** distinct custom properties. Nine are supplied by Tailwind 4's default
  theme (`--font-sans`, `--font-mono`, `--text-sm/base/lg/xl/2xl`, `--leading-normal`,
  `--leading-tight`); **seven have no definition anywhere** (`--color-bg`, `--color-fg`,
  `--color-fg-muted`, `--color-accent`, `--color-focus`, `--space-4`, `--space-8`). Master
  plan §10.2 caveat 2's arithmetic checks out exactly. **C3(a) is therefore a 16-row
  enumeration, not a 7-row one** — it says "every custom property the file reads", and nine of
  those rows will pass on arrival.
- **Finding 9.3 is exact, and currently costs nothing yet.** Eleven test files exist, all
  `*.test.ts` under `src/lib/**` and `test/setup/`. The `jsdom` project's include globs
  (`src/app/**/*.test.tsx`, `src/components/**`) match **zero** files today. So the collection
  gap is latent, not yet biting: it starts biting the moment phase 02 writes its first
  feature component test.
- **Finding 9.1 is exact, and the red is two tests, not one.** `e2e/bootstrap.spec.ts` holds
  two tests. The first asserts the title (true today), a `banner` landmark and a visible
  `main`; the second asserts a focusable "Skip to content" link. `src/app/layout.tsx` renders
  a bare `<html><body>{children}</body></html>` and `src/app/page.tsx` returns `null`. Task 6
  reduces the first test and deletes the second outright.
- **C4(e) is already true.** `vitest.setup.ts` imports and calls `installOfflineFetchGuard()`
  from `test/setup/node.ts`, so the DOM project already installs the offline guard. The
  criterion is a preservation row, not an introduction row — worth knowing before someone
  "implements" it.
- **`build_docs/future_implementations/` is still untracked and still not this pipeline's.**
  Not staged, not read, not acted on. Recorded again so the next perimeter check attributes
  it correctly.

---

## 5. Carried forward — obligations for the phase-01 implementer prompt

The handover prompt's §4.3 named five things that must reach the implementer prompt whatever
the projection decision was. Because I gated, that prompt is not compiled yet, so they are
recorded here rather than lost. Whoever compiles it carries all of these:

1. **Task 1 is non-negotiable.** Re-enumerate the baseline before changing anything —
   `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` — and
   record each exact observed result with its tree identity. Every baseline statement in
   master plan §10.2 is derived from reading and must be confirmed or corrected by observation.
2. **The three findings are to be confirmed, not inherited** — the expected-red end-to-end
   suite that CI runs, the seven undefined custom properties, and the runner globs that leave
   feature component tests claimed by no project. Each has a criterion; none is a rumour.
3. **Every guard, absence claim and purity check ships with its planted-defect probe** — the
   defect planted, the red observed, the probe reverted, the ledger row written. Eight named
   mutations, derived in §2 above, re-derived again at compile time.
4. **Counts are derived, never typed**, and **every test traces to a criterion row**; a test
   with no row is deleted or declared in the Review log as a candidate criterion.
5. **Contract 14 §8.3's closeout sentence, verbatim** (master plan standing rule 9):
   > Before closing implementation, evaluate documentation impact according to
   > `architectural_contracts/14-documentation-principles.md`. Update any authoritative
   > documentation made false, incomplete, or misleading by the verified implementation. Do
   > not modify documentation merely because files changed.

Plus, from the handover prompt's §4.4 and §4.5 and from my own lint:

6. **The checkpoint rule.** The cycle commits the moment it reaches `IMPLEMENTED`, subject
   line prefixed `CHECKPOINT (not approved): frontend 01 …`, under the owner's standing
   authorization, staging only that cycle's declared files plus the tracker and Review-log
   edits it actually made.
7. **The evidence budget.** Exactly one full-suite stamp per cycle, taken on the tree actually
   handed over, plus the end-to-end and build steps, because phase 01 changes rendered
   structure and CI runs both (master plan standing rule 16). The task-1 baseline is the
   phase's other enumerated L4 measurement and is not over-budget. Re-running evidence whose
   tree identity matches, with no variation and no pre-run authorization line, is a finding
   against the session.
8. **A scope fence the lint surfaced.** Phase 01 task 7 records Radix UI Primitives and Lucide
   in **`architectural_contracts/README.md`**. The **root** `README.md`'s tech-stack table
   gains its Radix and Lucide rows in **phase 03**, when the first primitive package actually
   lands (master plan follow-up register row 6). Two different documents; phase 01 touches the
   root README's *status paragraph and styling line* only.

---

## 6. Write perimeter

**Documents created (2):**

- `prompts/reviewer/phase-01-projection-round-0.prompt.reviewer.md`
- `handoffs/coordinator/coordinator-handover-round-1.handoff.coordinator.md` (this file)

**Documents changed (1):** `master-plan.md` — three edits, all mine:
- §7.4, the trace-cell vocabulary: phase 01 C6 (`11 §3`) added to the admissible enumeration,
  with the reason recorded inline (finding L1);
- §4, tracker row 01: actor `planner` → `coordinator`, note replaced with the projection
  decision and its one-line justification. State unchanged at `NOT_STARTED`;
- §11.1, the gate log: three rows appended — the pipeline documentation commit, this
  coordinator handover and the actor change, and the phase-01 projection decision.

**Files moved (2), the pre-planning archival of the row I consumed:**
- `prompts/coordinator/implementation-planning-round-1.prompt.coordinator.md` →
  `archive/pre_plan/`
- `handoffs/coordinator/implementation-planning-round-1.handoff.coordinator.md` →
  `archive/pre_plan/`

Both keep their `.prompt.` / `.handoff.` infix. `handoffs/coordinator/` is repopulated by this
file.

**Commits (2):**

- `a9d9fc0` — the pipeline documentation commit. Contents: `master-plan.md`, the seventeen
  phase plans, the project `README.md`, `intention/frontend-core-intention.md`, the planning
  handoff, both coordinator prompts, and the `archive/pre_plan/` move with the two deletions
  it implied. **The intention was staged on the owner's explicit confirmation**, given in
  session on 2026-09-06 after I reported what its 868 uncommitted lines are: §8.6,
  §12A.1–§12A.23, ledger F8–F30, owner decisions 7–12 and changelog rounds 4–8 — the two
  mechanism-inventory rounds and the owner's own ratifications, which the master plan and
  every phase plan cite. `build_docs/future_implementations/` was **not** staged.
- a second commit carrying this file, the projection prompt, the master-plan edits and the
  archive move. Its SHA is not stated here, because a document cannot name the commit that
  contains it.

**Not touched:** any file under `src/`, `e2e/`, `test/`, or any configuration file ·
`package.json` and the lockfile · every file under `architectural_contracts/` · every file
under `ui_design/` · every phase plan · the intention's content (it was staged, not edited) ·
every backend artifact · `build_docs/future_implementations/`.

**Code changed:** none. **Dependencies installed:** none. **Tests, build, lint, typecheck,
`vitest list`:** **not run** — this session's L4 budget was zero, deliberately, because phase
01 task 1 owns the baseline re-enumeration and measuring it here would spend the observation
the phase exists to make. **Commands run:** reads (`cat`, `sed -n`, `grep`, `find`, `ls`,
`wc`, `awk`), `git status` / `git log` / `git diff` / `git show`, one `grep` over
`node_modules/tailwindcss/theme.css` to check the sixteen-property arithmetic of §4, and the
writes, moves and commits above. **Tool-recorded state:** none; no architecture graph exists
in this worktree. **`docs/` folder:** not created — this repository's documentation root is
`build_docs/`.

---

## 7. Next action

**Dispatch `prompts/reviewer/phase-01-projection-round-0.prompt.reviewer.md`** to a fresh
session carrying no planning context. Its gate check was self-tested against the tree it will
open: all six rows pass, and none of them names a commit SHA, a clean tree, or a file count.

**When its handoff lands in `handoffs/reviewer/`:** consume it adversarially. Reconcile its own
arithmetic before trusting a claim — in particular, check that it took **no** suite, build or
end-to-end run, because its budget was zero and phase 01 task 1 owns that measurement; an L4
row in its evidence without a pre-run authorization line is an automatic finding against the
session. Then route every ledger row (amendment applied, upstream change made, or delegation
recorded), write the one Review-log line in the phase plan, move row 01 to `PROJECTED`, and
compile `prompts/implementer/phase-01-round-1.prompt.implementer.md` carrying all eight
obligations of §5 — subject to card 1.

**Standing, from here:** one prompt per session, just-in-time, never reused stale · every
handoff consumed with its declared perimeter diffed against the tree · lessons folded upstream
to the artifact that owns them, never sideways · the gate log kept current including every
`main` merge · compaction recommended at each phase boundary with a context handoff written
before it · phases 16 and 17 left undispatched until their backend gates pass, with the
backend master plan §4 re-checked at every phase-15 closeout.

---

## 8. Architecture Context policy

Applied per `agent-skills/policy/architecture-context-policy.md`. Classification: this session
compiled a prompt, linted a plan, amended the shared skeleton and committed documentation. It
wrote no code and made no design, boundary, persistence or integration decision, so routing
ended early at the classification for my own writes — the §4 fast path.

Routing was **not** skipped for the prompt's content, which is the part that matters: the
projection prompt carries phase 01's own contract obligations by reference, and its read-first
list reproduces the plan's, which routes through
`architectural_contracts/01-implementation-contract-guide.md` to contracts 15, 05, 11, 12, 14
and 13 as master plan §5 resolved them. I verified each of those cited sections exists and
says what the plan claims (§2 above); I did not re-derive the resolution, because the planning
session did that as a material planning act and the master plan §5 records it.

**Documentation impact review** (contract 14 §8). The durable documents this session's work
could falsify are the master plan — patched here, in §4, §7.4 and §11.1 — and the project
README, which is a pointer to the master plan and remains true. The intention was committed
unchanged, so nothing it states became false. The stale current-state documents of master plan
§10.2 caveat 4 stay routed to phase 01 and were not patched here: patching them before the
code they describe exists would replace one false statement with another.
