---
plan: 6
role: implement
round: 2
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 6 implementation handoff — round 2

## Summary

The bounded repair is complete and checkpointed at `ba771653cea918a4a7235044cd4f41bd0089c953` (`CHECKPOINT (not approved): phase 06 fix guards`). S1 and S2 are repaired; N3 and N4 are closed. C3(f) remains one traced test and now measures the reachable first-invalid-entry behavior. No production behavior, criteria count, row count, named phase-mutation count, later-phase source, frontend file, persistence, integration, agent, or approval-envelope surface was added.

The owner authorized coordinator validation after this fix rather than another independent re-review.

## ⚠ OWNER DECISIONS REQUIRED (0)

None.

## Full write perimeter

### Fix changes included in the checkpoint

- `src/features/proposal-preparation/schemas/workflow-state.test.ts` — S1 fixture correction; imports the existing proposition fixture.
- `src/features/proposal-preparation/server/domain/approvability.test.ts` — S2 discriminating required-key pair.
- `src/features/proposal-preparation/server/domain/information-registry.test.ts` — the one explicit C3(f) title/setup alignment allowed by the prompt.
- `src/features/proposal-preparation/server/domain/information-registry.ts` — N3 central policy types from `z.infer`.
- `src/features/proposal-preparation/server/domain/bump-version.test.ts` — N4 parseable `validProposition({ version: 4 })` and parse assertion.
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-06-items-clarification-state.md` — append-only Review log entry.
- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` — tracker row 6 only, `PROMPT_READY` → `IMPLEMENTED`.

### Handoff written after checkpoint

- `build_docs/under_constroction/initial_core_feature_proposales/handoffs/implementer/phase-06-round-2.implementer.md` — this report; intentionally follows the checkpoint so it can record the SHA.

### Mutation-only files, applied and reverted

- `src/features/proposal-preparation/schemas/shared.ts` — S1 guard mutant; restored byte-identically.
- `src/features/proposal-preparation/server/domain/approvability.ts` — S2 guard mutant and retained MUT-06-1 probe; restored byte-identically.
- `src/features/proposal-preparation/schemas/workflow-state.ts` — retained MUT-06-3/MUT-06-5 and MUT-06-4 probes; restored byte-identically.

The tracked `tsconfig.tsbuildinfo` rewrite caused by typecheck was restored from `HEAD`; it is not part of the perimeter. No probe file was created. Final post-probe `git status --porcelain` was empty before this handoff was added.

## Coverage map — all 54 plan rows

Every row is discharged by an exact-strength assertion; there are no orphan tests or candidate criteria.

| Row | Test and assertion shape |
|---|---|
| C1(a) | `information-registry.test.ts` — exact language policy object |
| C1(b) | same — exact title policy object |
| C1(c) | same — exact block-selection policy object |
| C1(d) | same — exact sold-scope policy object |
| C1(e) | same — exact recipient-identity policy object |
| C1(f) | same — exact quantities policy object |
| C1(g) | same — exact recipient-contact policy object |
| C1(h) | same — exact description-narrative policy object |
| C1(i) | same — exact block-comments policy object |
| C1(j) | same — exact deadline/terms policy object |
| C1(k) | same — exact set equality against all ten enum keys |
| C2(a) | `approvability.test.ts` — exact `{ approvable: true }` |
| C2(b) | same — exact refused language key |
| C2(c) | same — exact approval for deferred optional item |
| C2(d) | same — exact approval with all non-required items unresolved |
| C2(e) | same — exact block-selection refusal |
| C2(f) | same — exact title refusal |
| C2(g) | same — exact sorted array ["block_selection", "title"] from enum-order input |
| C3(a) | `information-registry.test.ts` — exact unknown-id reason and path |
| C3(b) | same — exact deferred resolution |
| C3(c) | same — exact supplied resolution |
| C3(d) | same — exact unresolved resolution when no answer exists |
| C3(e) | same — exact duplicate reason and second-entry path |
| C3(f) | same — exact first invalid entry at index 0; later entry is irrelevant |
| C3(g) | same — exact do-not-ask skip reason and answer path |
| C3(h) | same — exact addressed change plus original deep equality |
| C4(a) | `clarification.test.ts` — exact question-cap parse |
| C4(b) | same — exact over-cap questions path |
| C4(c) | same — exact question-text cap failure |
| C4(d) | same — exact answer-text cap failure |
| C4(e) | same — exact strict skip-text path |
| C5(a) | `workflow-state.test.ts` — minimal state parses and equals fixture |
| C5(b) | same — exact unknown top-level path |
| C5(c) | same — exact misspelled draft-reference path |
| C5(d) | same — exact nested unknown-key path |
| C5(e) | same — deep equality after JSON round trip of both propositions with recipient, block-leaf, and top-level `{ known: false }` leaves |
| C5(f) | same — exact brief-text cap path |
| C5(g) | same — exact missing-item-key path |
| C5(h) | same — exact unknown-item-key path |
| C5(i) | same — clarification questions and answers preserved exactly |
| C6(a) | same — valid configured-origin Draft Reference parses |
| C6(b) | same — exact HTTP editor URL path |
| C6(c) | same — exact foreign-origin path |
| C6(d) | same — exact port-shifted-origin path |
| C6(e) | same — exact uppercase UUID path |
| C6(f) | same — malformed URL becomes `ValidationError` at editor URL |
| C7(a) | `workflow-state.test.ts` — within-bound state parses |
| C7(b) | same — exact oversize reason and no `pad` strictness issue |
| C7(c) | same — maximal fixture byte comparison and parseability |
| C7(d) | same — exact safe serialization domain issue |
| C8(a) | `bump-version.test.ts` — lowercase parse and uppercase generation-id failure |
| C8(b) | same — exact first version `1` |
| C8(c) | same — `validProposition({ version: 4 })` passes `propositionSchema.parse` before exact result `5` |
| C8(d) | same — exact runtime arity `1` |

The five phase test files contain 54 row-linked tests in total. This round edited four of them plus the C3(f) setup; the unchanged clarification rows remain covered by their existing exact assertions.

## S1/S2 correction results

- **S1:** C5(e) now constructs `preparedProposition` and `currentProposition` from `validProposition`. Both have `recipient: { known: false }`; `preparedProposition.blocks[0].quantity` and `currentProposition.blocks[0].optional` are absent; and `preparedProposition.title` and `currentProposition.agentRationale` are absent. The existing `parse(JSON.parse(JSON.stringify(state)))` deep-equality assertion remains.
- **S2:** C2(g) now unresolves `title` and `block_selection` and expects the exact array ["block_selection", "title"], which differs from the registry enum order and therefore observes the sort.

## N3/N4 disposition and C3(f) alignment

- **N3 closed:** `INFORMATION_REGISTRY` now uses a local `InformationItemPolicy` whose two fields are `z.infer<typeof informationItemAskPolicySchema>` and `z.infer<typeof informationItemCreatePolicySchema>`. The runtime-owned policy table and caller-held resolution-only boundary are unchanged.
- **N4 closed:** C8(c) now uses the existing `validProposition({ version: 4 })`, asserts `propositionSchema.parse(currentProposition)` equals the fixture, then calls `nextVersion`.
- **C3(f):** the existing single test was renamed from the unreachable unknown-before-duplicate wording and now supplies an unknown answer at index 0 followed by a known answer. It still traces only C3(f); no criterion or test was added.
- **N2:** remains routed to phase 10 as specified by the plan and was not pulled forward.

## Baseline and focused evidence

Before the first fix edit, `git status --porcelain` was empty. The focused baseline command was:

```text
npx vitest run src/features/proposal-preparation/schemas/workflow-state.test.ts src/features/proposal-preparation/server/domain/approvability.test.ts src/features/proposal-preparation/server/domain/information-registry.test.ts src/features/proposal-preparation/server/domain/bump-version.test.ts
```

It was green: 4 files / 49 tests. After repair and after all probe restoration, the same command was green: 4 files / 49 tests. `npm run typecheck`, `npm run lint`, and `git diff --check` passed. The final source tree at the checkpoint contains no generated `tsconfig.tsbuildinfo` change.

## Mutation ledger

This round executed 7 declared mutation rows: 5 retained phase mutations invalidated by touched test files, plus the 2 repair mutations. `executed = declared = 7`; all 7 were reverted.

| Mutation | Site | Command | Observed red | Restoration |
|---|---|---|---|---|
| S1 repair mutant | `schemas/shared.ts`, `sourcedOrAbsent` absent arm changed to parse and output `{}` | `npx vitest run …/workflow-state.test.ts` | Exactly C5(e) failed; 18 workflow-state tests stayed green, showing the new fixture bites | Restored the literal-false arm; `shared.ts` is absent from checkpoint diff |
| S2 repair mutant | `server/domain/approvability.ts`, `.sort()` removed | `npx vitest run …/approvability.test.ts` | Exactly C2(g) failed; 6 approvability tests stayed green with received `["title","block_selection"]` | Restored `.sort()`; `approvability.ts` is absent from checkpoint diff |
| MUT-06-1 retained | `approvability.ts`, required-policy join removed | `npx vitest run …/approvability.test.ts` | C2(c) and C2(d) failed; optional/deferred and non-required unresolved items incorrectly blocked | Restored policy join |
| MUT-06-3 retained | `workflow-state.ts`, outer state `z.strictObject` changed to `z.object` | `npx vitest run …/workflow-state.test.ts` | C5(b) and C5(c) failed because unknown keys were stripped | Restored strict outer object |
| MUT-06-4 retained | `workflow-state.ts`, configured-origin equality removed | `npx vitest run …/workflow-state.test.ts` | C6(c) and C6(d) failed because foreign and port-shifted origins parsed | Restored origin equality |
| MUT-06-5 retained | `workflow-state.ts`, size guard disabled at its call site | `npx vitest run …/workflow-state.test.ts` | C7(b) failed because the result became an unknown-`pad` issue instead of `workflow_state_too_large` | Restored size guard |

The S1 first attempt using an empty object without the discriminator was rejected by Zod at schema construction and was not counted as evidence; the valid parse-and-transform mutant above is the recorded guard proof. Probe-only current hashes after restoration were `shared.ts` `bf32ecb0c4533d94099dd633c79023d020b57653ca926725ebddd8ee6c98c686`, `approvability.ts` `44e9b51f7bafd57587e16ba9c783a7ebb49d39dd3813950a290e6a88e05f33c8`, and `workflow-state.ts` matched its checkpoint content. Final `git status --porcelain` was empty before this handoff was created.

## Closing L4 evidence

The single authorized closing L4 command was:

```text
npm test
```

Result: 20 test files / 278 tests passed in 1.30 s. The command ran on the exact tracked content later committed as checkpoint `ba771653cea918a4a7235044cd4f41bd0089c953`; only this untracked handoff was written afterward. Failure-ID delta: focused baseline ∅ → closing ∅; full-suite closing result is green.

## Documentation and architecture closeout

Contract 14 §8 answer: this repair makes no durable feature, root README, integration README, or architecture documentation false, incomplete, or misleading. The plan Review log and tracker are the owning pipeline records; no documentation was changed mechanically. No architecture graph exists, so no graph delta was made.

## Checkpoint

`ba771653cea918a4a7235044cd4f41bd0089c953` — `CHECKPOINT (not approved): phase 06 fix guards`

Owner-authorized next step: coordinator validation after this fix; no independent re-review is requested for this round.
