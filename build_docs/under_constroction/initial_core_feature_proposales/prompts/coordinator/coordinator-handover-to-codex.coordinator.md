---
plan: none — role handover, standing until consumed
role: coordinator
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
from: Claude (Opus 5), coordinator sessions 1–4
to: Codex
---

# Handover — the pipeline coordinator role

You are taking over as **pipeline coordinator** for `initial_core_feature_proposales`
(feature: Proposal Preparation Backend) in `/Users/davidloorenz/Desktop/Developer/Proposales`.

This document is the interface. There is no conversation to inherit — that is the
pipeline's design, not a limitation of this handover. Everything that matters is in
artifacts, and this file tells you which ones.

---

## 1. Bootstrap

You have a native skill adapter: **`pipeline-coordinator`** in `~/.codex/skills/`. Invoke
it. It points at the canonical doctrine, which you must read by absolute path:

1. `/Users/davidloorenz/agent-skills/pipeline-charter.md` — shared authority for all seven
   pipeline roles. Read it first and in full. It owns the artifact map, the folder layout,
   the state machine and gates, phase sizing, the phase manifest, the trace chain, the
   review protocol, the test-evidence scopes L1–L4, the decision-card format, the owner
   layer, and the standing quality rules.
2. `/Users/davidloorenz/agent-skills/pipeline-coordinator.md` — your doctrine. Four
   responsibilities: author prompts just-in-time; consume handoffs adversarially; **lint
   every plan before dispatching it**; keep the tracker and gates honest; fold review
   lessons back to their home artifact.

Adapters exist in `~/.codex/skills/` for all seven roles (`plan-projection` was added
2026-09-05). Repo-level architecture routing is `AGENTS.md` →
`agent-skills/policy/architecture-context-policy.md` →
`architectural_contracts/01-implementation-contract-guide.md`.

Skills are plain markdown. Nothing about this role is Claude-specific; only the
auto-loading differs, which is why you read the paths above explicitly.

## 2. Read this before you touch anything

- **`master-plan.md`** — the shared skeleton. §4 tracker, §5 contract resolution,
  §6 naming registry, §7 sequencing and ledger coverage, §9 standing rules,
  §10 environment topology, §11 folder tables and follow-up register, §12 open items.
- **`master-plan.md` §9.0 — the owner's scope brief, quoted verbatim.** Read it before
  you judge any finding. It calibrates how much hardening to ask for and explicitly does
  not license shipping something incorrect. §9.0.1 governs which model runs which role.
- **`planing/proposal-preparation-backend-intention.md`** — product authority, `RATIFIED`
  through round 8. §17 + §17.1 is the measurement ledger (M1–M19, all ratified); §17A is
  18 mechanism contracts. **Never amend it directly**: semantic changes route through a
  decision card to the owner, and a material one re-opens the intention gate.
- **`planing/proposales-source-evidence.md`** — external facts. Vendor and repository
  facts go here, never into the intention.
- **`plans/phase-NN-*.md`** — one per phase, each with its Review log.
- **`archive/plan_1/`** and **`archive/pre_plan/`** — closed rows. Read them for
  precedent; do not re-open them.

## 3. The independence problem — read this twice

**Codex is currently the implementer on this project.** If you also coordinate, one model
is doing the work and adversarially consuming its own report. The coordinator's
consumption step is review-shaped: you reconcile a handoff's arithmetic against the tree,
diff its declared write perimeter against `git status`, and turn every discrepancy into a
named probe rather than a trusted claim. That step has already caught real things on this
project — twice.

This is a **structural** loss of independence, not a claim about capability. Master plan
§9.0.1 exists for the same reason. Mitigations, in order of preference:

1. **Keep reviewer and projection sessions on a different model from the implementer.**
   The formal gates then stay genuinely independent even though coordination does not.
2. If Codex implements *and* coordinates, **say so in the tracker note and the phase
   Review log**, exactly as phase 1's approval records that it was approved on a
   coordinator re-review rather than an independent session. Precedent is in
   `plans/phase-01-topology-and-env.md`.
3. **Never let a coordinator consumption stand in for a review** on a phase that touches
   a silent-failure mechanism — which is phases 2 through 14. Phase 1 was the safe one to
   do that with; its failure mode was a crash.

An erosion of the review protocol is a decision for the owner to make deliberately. It
must not become the pattern by drift.

## 4. State at handover

- Phase 1 **`APPROVED`** (gate commit `04a35dc`). Phases 2–15 `NOT_STARTED`.
- Intention `RATIFIED`; ledger M1–M19 ratified; nothing pending owner ratification.
- `npm test` → **8 files / 29 tests** green at `3c136e7`. Two Vitest projects, both
  offline-guarded. Master plan §10 is verified and current.
- 15 phases, 102 criteria (phase 2 now 38 rows / 8 mutations after a dispatch-lint
  amendment), 477 rows, 71 named mutations. Re-derive counts by script; never type one.

## 5. The immediate task

**A projection session is out right now** on
`prompts/reviewer/phase-02-projection-round-0.reviewer.md`. Do not re-author or
re-dispatch it. Its handoff lands at
`handoffs/reviewer/phase-02-projection-round-0.reviewer.md`. If no handoff is there, it
has not finished.

When it reports, consume it adversarially and check these three specifically — they are
what the phase-2 dispatch lint could not settle from the artifacts alone:

1. Is **`requiredKnownOrAbsent`** a void reference? Phase 2's C4(b) mentions it
   parenthetically; no task in the plan creates it and master plan §6.4 may not name it. A
   criterion rooted in a symbol nobody writes is the defect the charter names in manifest
   property 2 — an implementer binds it to the nearest plausible thing and the criterion
   silently becomes vacuous.
2. Are **`ProposalesError` / `AiProviderError`** and the six `reason` registries of master
   plan §6.3 built by a task **and** asserted by a row, or neither? If neither, it is a
   planning gap, and phases 3 and 8 are where it surfaces.
3. Is **`redact`'s behaviour on arrays, `null`, and non-object values** determined by the
   plan, or left to the implementer? Redaction is a secret-leak guard; an undetermined
   branch there is the phase's highest-consequence gap.

Then route the ledger, fold each item to its home artifact, flip tracker row 2 to
`PROJECTED`, and only then compile the phase-2 implementer prompt. **The projection's
explicit delegation list goes into that prompt verbatim** — it tells the implementer which
decisions are genuinely its call rather than guesses.

## 6. Open owner items

| Item | Blocks | Where |
|---|---|---|
| `AI_MODEL` unresolved — `.env.example` said `gpt-5.6-luna`, the owner said `gpt-6.6-luna`; one is a typo and it was deliberately **not guessed** | nothing until **phase 8** | master plan §11 follow-up 6 |
| Documentation-root patch (`docs/` → `build_docs/` in contract 14, root README, guide §7, contracts README) | nothing | §11 follow-up 1; `prompts/maintenance/` |
| Archive 18 disposable Proposales drafts | nothing | §11 follow-up 2; owner action only |
| Contract `06` §6 Money row example | nothing | §11 follow-up 3 |
| New `architectural_contracts/15-ui-styling-and-component-system.md` (owner's, 2026-09-05) is **not referenced from the guide's routing table** — adding a contract updates the guide, not the policy. Owner's file, owner's call: raise it, do not patch it. Does not apply to any phase here (no UI, intention §18) | nothing | — |

## 7. Failure modes from the outgoing coordinator

Artifacts record what was decided. They do not record what the coordinator kept getting
wrong, so it is written here.

1. **Archiving with a bare `mv` clobbered two files.** A coordinator prompt and its
   handoff can carry byte-identical filenames — they are distinguished only by which
   table they sit in, and archiving flattens both tables into one directory. Two pairs
   collided; both were recovered from `a53a964`. Archived rows now carry `.prompt.` or
   `.handoff.` before the role segment (master plan §11). **Check basename collisions
   before moving rows into `archive/`.**
2. **A plan passed dispatch lint with a forbidden manual acceptance check.** Phase 1 task
   5 said "verify each rule once by linting a planted file (record … in the Review log)".
   Charter rule 1 forbids manual acceptance; prose does not run in CI. It caused the
   review's largest finding. **Grep every plan's tasks for "verify by hand", "record in
   the Review log", "confirm manually" before dispatching.**
   *Scan already run across phases 2–15 (2026-09-05): clean.* The only hit is phase 8
   task 1, "`npm install @ai-sdk/anthropic @ai-sdk/openai`; record the resolved versions
   in the Review log" — **benign**, and the distinction is the point: recording an
   installed version is bookkeeping, whereas phase 1's task 5 made a manual lint run the
   *acceptance* of a criterion. Re-run the scan on any plan you amend.
3. **Silent no-op edits.** Editing a document by string replacement twice failed to match
   because the anchor had changed underneath (the planner had rewritten `README.md` into a
   pointer). **Assert the anchor matched; a no-op edit reads as success.**

## 8. What was working, worth continuing

- **Consume by verifying at source, then spend effort on variation, never reproduction.**
  Reconcile the handoff's own arithmetic; diff its declared perimeter against the tree;
  check tree identity and *cite* a valid stamp rather than re-running it. Charter: over-
  evidence is a defect, symmetrically. Zero L4 runs were spent across three consumption
  passes; a self-authored mutant the round had not tried is what actually confirmed a
  guard bites.
- **Lint every plan before dispatch, at source, with commands.** It found a real defect in
  both plans linted so far.
- **Gate on content, never on a count, a SHA, or a dirty tree.** Every gate self-test has
  passed on first run. Run the gate yourself before dispatching a prompt.
- **Relay owner decision cards verbatim.** Re-compressing a card into a table is how the
  story dies and the human rubber-stamps.

## 9. Housekeeping

There is an ephemeral orientation note at
`/Users/davidloorenz/agent-skills/COMPACTION-HANDOFF-proposales.md`, written for a Claude
successor before this role transfer. **This document supersedes it.** Delete that file.
