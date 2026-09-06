---
plan: 8
role: projection
round: 0
date: 2026-09-06
---

# Phase 8 — AI provider boundary (`@/lib/ai`): mandatory projection, round 0

## Role and doctrine

You do the implementer's first hour **on paper**, from the artifacts alone, before any
implementer prompt is compiled. You write no code. Your product is a **decision ledger**: every
decision the plan fails to determine, classified and routed, plus verification that the plan's
paths, symbols, citations and criteria are real and decidable against the actual repository.

- If you are a Claude session: invoke the `plan-projection` skill.
- Otherwise: read `/Users/davidloorenz/agent-skills/plan-projection.md` and
  `/Users/davidloorenz/agent-skills/pipeline-charter.md` **first**, by absolute path, and follow
  them as this session's doctrine.

Then follow the repository's Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`) to classify which contracts govern this
phase before you reason about its design.

**Workspace:** `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`.
Implementation folder: `build_docs/under_constroction/initial_core_feature_proposales/`.

Projection is **mandatory** for this phase (plan Notes, rank 4).

## Gate check — verify before anything else; stop and report if any item fails

| # | Requirement | Where |
|---|---|---|
| 1 | Intention status header reads `RATIFIED` | `planing/proposal-preparation-backend-intention.md`, the `Status` row |
| 2 | Tracker rows 1–7 all read `APPROVED` | `master-plan.md` §4 |
| 3 | Tracker row 8 reads `NOT_STARTED` | `master-plan.md` §4 |
| 4 | The phase-8 plan's acceptance table yields **6 criteria, 26 rows, 4 named mutations** — re-derive by counting, do not read the declared line | `plans/phase-08-ai-provider-boundary.md` |
| 5 | `src/lib/ai/` does **not** exist | working tree |
| 6 | `@ai-sdk/anthropic` and `@ai-sdk/openai` are **not** in `package.json` | working tree |
| 7 | Intention §17A.15's code-shape paragraph names `Exclude<LanguageModel, string>` | the intention |

Items 5 and 6 prove the work is outstanding. Item 7 proves the coordinator's editorial fold of
master §11 follow-up 4 landed — that paragraph is one of your semantic authorities, and until
2026-09-06 it said something false about the SDK.

## Read order

1. `plans/phase-08-ai-provider-boundary.md` in full.
2. Its "Read first" list, in its order.
3. `master-plan.md` §9.0 (the owner's scope brief), §9.1 — **rules 15 and 16 are new and were
   earned by phase 7**; §10.1, §10.5, §11 follow-up 6.
4. `plans/phase-07-ranking-and-human-search.md`'s Review log — not for its content, but because
   this project's last three sessions each found a guard that could not fail, and the shapes are
   catalogued there.

## Depth targets — the silent-failure mechanisms of this phase

Allocate definition effort by silent-failure risk, not by apparent complexity. This phase's
risks, named so they are not rediscovered:

1. **A string model id reaching an SDK call.** The whole point of §17A.15 is that this is
   unrepresentable at the call site. `ai@7.0.92`'s `LanguageModel` alias *includes* the string
   id, so the exclusion is doing all the work. Is the plan's construction actually load-bearing,
   and is C1(c) a guard that can fail — or does it pass because nothing in the codebase writes
   that form?
2. **Provider selection through a hidden second path.** `globalThis.AI_SDK_DEFAULT_PROVIDER` is
   never assigned, and the bundled gateway authenticates by `AI_GATEWAY_API_KEY` **or** Vercel
   OIDC (evidence §9.1). A test that passes because a gateway silently resolved the model is a
   test that proves nothing about provider selection.
3. **Upstream text crossing the boundary.** The message is always the fixed generic string and
   the SDK error goes to `cause`. The owner works with live keys, so this is a present-tense
   risk, not a future one (§9.0).
4. **The `usage` `null` rule.** `?? null` is permitted *only* in the usage mapping and is a
   documented exception to §9.1 rule 2. Is the exception scoped in the plan tightly enough that
   an implementer cannot read it as general licence?
5. **Error-mapping totality.** `fromSdkError` maps statuses, aborts, network failures and a
   content-filter finish reason onto a seven-member closed union. Enumerate the adjacent pairs
   and find the inputs no row covers.
6. **Vendor version drift.** The plan pins behaviour to `ai@7.0.92` and to two packages that do
   not exist in the tree yet. Their resolved versions are unknown until installed, and the plan
   asks the implementer to record them *via the coordinator*.

## Specific things to decide on paper

- **Item 6 above is a live blocker in waiting.** Master §11 follow-up 6 records that `AI_MODEL`
  is unresolved — `.env.example` said `gpt-5.6-luna`, the owner said `gpt-6.6-luna`, and the
  coordinator did not guess. This phase is where it becomes load-bearing. Determine whether
  anything in the phase's criteria actually depends on the literal value, or whether the model
  id stays a placeholder until phase 15's live smoke. **Say which, in a decision card if it
  blocks.**
- The plan's file perimeter names **14 paths** including `package.json` and `package-lock.json`.
  Re-derive that count and decide whether a lockfile change belongs inside a phase perimeter at
  all, or whether it needs its own declaration.
- Whether `createAiClient(env = serverEnv, …)` repeats phase 7's `defaultDeps` precedent or
  diverges from it, and if it diverges, whether that is deliberate.

## Evidence budget

**Zero L4 runs, and zero test runs of any scope.** This is a paper exercise: read the artifacts
and the working tree, reason, and record. `npm install` is **not** yours to run — the plan
assigns it to the implementer, and running it would change the tree and the lockfile.

Reading `node_modules/ai/dist/index.d.ts` is expected and is not a test run.

## What to produce

A decision ledger, every row classified and routed:

- **P** — plan gap: the coordinator amends the phase plan.
- **M** — master-plan gap: the naming registry, environment topology, or a standing rule.
- **I** — intention gap: routes to the owner as a decision card.
- **F** — free choice: delegated to the implementer explicitly, in writing.

Plus: the gate check; the applicable contracts you classified; reality checks (paths, symbols,
citations, counts re-derived); criteria decidability, row by row, saying which rows you could
turn into a concrete assertion today and which you could not and why; trace verification in both
directions; and a full write perimeter.

**Owner decision cards, if any, go in one section headed `⚠ OWNER DECISIONS REQUIRED (n)`,
immediately after your opening summary** — never buried inside a finding. If there are none, say
so in one line.

## Closing protocol

1. Write your handoff to `handoffs/reviewer/phase-08-projection-round-0.reviewer.md` with the
   charter's frontmatter (`plan`, `role`, `round`, `date`, `verdict`, `state`, `actor`).
2. Update **tracker row 8 only** to `PROJECTED`, one line.
3. Do **not** amend the phase plan, the master plan, or the intention — the coordinator folds
   your ledger. `.archgraph/` is not present here; skip it silently.
4. Close with the owner layer: **What I did → What I found and what it means for you → What
   happens next → What needs you** (decision cards verbatim, or one line: "nothing needs you").
