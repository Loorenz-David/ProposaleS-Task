---
plan: 1
role: implementer
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Repository topology and environment
---

# Session prompt — implement phase 1

You are the **implementer** for phase 1 of `initial_core_feature_proposales` in
`/Users/davidloorenz/Desktop/Developer/Proposales`.

Invoke the `implementation-executor` skill and follow its doctrine. Also invoke the
repository's `architecture-context` skill — this phase creates the runtime-boundary and
environment machinery, so contract routing applies.

**`plans/phase-01-topology-and-env.md` is your task list. Where this prompt differs from
the plan file, the plan file wins.**

---

## 1. Gate check (stop and report if any row fails)

| # | Check | Passes when |
|---|---|---|
| 1 | Intention status header (`planing/proposal-preparation-backend-intention.md`) | reads `RATIFIED` |
| 2 | Tracker row 1 (`master-plan.md` §4) | reads `PROMPT_READY` |
| 3 | The work is outstanding | `src/lib/env/server.ts` does not exist |
| 4 | Predecessor gate | none — phase 1 is first |

Do **not** gate on a clean working tree. The tree is legitimately dirty: the whole
`build_docs/` planning set is uncommitted, and `package.json`, `package-lock.json` and
`.env.example` carry changes made outside the pipeline (below). A dirty tree is expected
here and is not a reason to stop.

## 2. Read order

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — standing rules (especially
   **15**: a guard ships with proof it can fail), the test-evidence scopes, the review
   protocol, the owner layer.
2. `/Users/davidloorenz/agent-skills/implementation-executor.md` — your doctrine.
3. `plans/phase-01-topology-and-env.md` — in full. Its "Read first" list is yours;
   work through it before writing code.
4. Everything that list names: master plan §5 (R7, R8), §6.1, §6.2, §9, §10; intention
   §17A.15, §17A.3, §12.2, §2.1; evidence doc §9, §9.1; the seven contract sections;
   the six repository files.

## 3. State of the tree you are inheriting (read this before task 1)

Three files were changed **outside the pipeline** by the owner, before this session.
The round-1 planning handoff recorded them as finding F9. They are not yours, but two
of them are inside your perimeter and you must handle them deliberately:

- **`package.json` / `package-lock.json`** — `server-only@^0.0.1` is already installed.
  Task 1 is amended in the plan file: **verify and record the resolved version, do not
  reinstall.**
- **`.env.example`** — already carries the five new variables, but with **filled
  values**, which contract 02 §8 forbids. Task 7 normalizes it to all seven names with
  empty values. Two of the filled values are unverified and must not be treated as
  established: `PROPOSALES_EDITOR_ORIGIN=https://secure.proposales.com` is an
  owner-stated candidate (the evidence doc establishes no editor origin; phase 15's
  live smoke confirms it), and `AI_MODEL=gpt-5.6-luna` is an owner-supplied model id
  nothing in the pipeline has verified. **Neither value belongs in a schema default, a
  test fixture, or a code constant** — the schema has no defaults at all (master plan
  §6.2), and the test placeholders are the ones §6.2 names.

## 4. Constraints for this phase

- **Scope fence.** No error taxonomy, no logger, no value shapes — that is phase 2. No
  adapter, no feature code, no `vitest.live.config.mts` (phase 15). If you find yourself
  needing one of those to close a criterion, stop and report instead.
- **Every one of the six named mutations runs**, at the site the plan names, and is
  reverted. MUT-01-1 through MUT-01-6. The plan's mutation set is closed: six named,
  six executed, recorded in a ledger with the observed red.
- **Charter rule 15 applies to C3 and C4(c).** The lint rules and the offline guard are
  guards, and a guard ships with proof it can fail. C3's rows already plant a file and
  observe the report; C4(c)'s mutation deletes the guard assignment. Do not weaken
  either into "the rule is configured" — configured is not the same as biting.
- **C5(a) is an absence-shaped row.** It compares the `.env.example` name set against
  the schema's keys. Make sure it can observe a mismatch: it must fail if a name is
  added to one side only.
- **Evidence budget: your L4 budget is exactly one run** — the closing stamp
  (`npm test`), taken on the tree you hand over. It is mandatory, and citing an earlier
  stamp is not a substitute. If you change anything after taking it, re-take it; a
  re-take is not over budget. Everything else runs at L1 (the named test or the phase's
  test file). Any additional L4 needs the charter's authorization line, written before
  the run.
- Baseline to compare against: master plan §10.2.
- **Do not modify the intention, the evidence doc, the master plan's shared sections, or
  any other phase plan.** A gap you find in them is reported, not patched. The one
  exception the plan names: if Vitest 5 rejects inline `test.projects`, update master
  plan §10.3 and say so in the handoff.

## 5. Closing protocol

1. Every named mutation run and reverted; ledger recorded.
2. Closing stamp on the handed-over tree; record hypothesis, scope, exact command, tree
   identity (`git rev-parse HEAD` + `git status --porcelain`, or the SHA plus a
   `git diff` digest on a dirty tree), and the result.
3. `npm run typecheck` and `npm run lint` green.
4. **Checkpoint commit**, subject prefixed `CHECKPOINT (not approved): phase 01 …`,
   under the standing owner authorization — do not stop to ask. Note that the owner may
   commit the planning set separately; commit only your own perimeter.
5. Tracker row 1 → `IMPLEMENTED`, with your one-line note. Update only your own row.
6. Review-log entry in the phase plan file (append-only).
7. Documentation impact review, per the standard closeout instruction:

   > Before closing implementation, evaluate documentation impact according to
   > `architectural_contracts/14-documentation-principles.md`. Update any authoritative
   > documentation made false, incomplete, or misleading by the verified implementation.
   > Do not modify documentation merely because files changed.

   The root README's "Environment" table is already in your perimeter (task 8).
8. **Handoff** at `handoffs/implementer/phase-01-round-1.implementer.md`, row-schema
   frontmatter (`plan`, `role`, `round`, `date`, `state`/`verdict`, `actor`), declaring
   your **full write perimeter** — documents, code, `package.json`/lockfile, config
   files. The plan's perimeter is **11 paths**; if yours differs, say which and why.
   Also record: the resolved `server-only` version; whether inline `test.projects`
   worked; the e2e note from the plan's Notes section; and any test you wrote that
   traces to no criterion row, declared as a **candidate criterion** (the defect it
   catches, the ledger entry it serves) rather than shipped silently.
9. Owner decision cards, if any, in one `⚠ OWNER DECISIONS REQUIRED (n)` section right
   after the opening summary. Zero cards: say so in one line.

Archgraph is not present here; skip it silently.

## 6. Final chat message (the owner layer)

**What I did → What I found and what it means for you → What happens next → What needs
you** (cards verbatim, or one line: "nothing needs you"). One pointer line names the
handoff. No section numbers or paths in that layer; plain product words; under ~300
words unless cards are pending.
