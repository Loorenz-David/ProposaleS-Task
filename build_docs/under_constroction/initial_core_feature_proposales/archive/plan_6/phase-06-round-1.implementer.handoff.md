---
plan: 6
role: implement
round: 1
state: IMPLEMENTED
date: 2026-09-06
actor: Codex
---

# Phase 6 implementation handoff — round 1

## Summary

Implemented the exact twelve-file phase perimeter for information-item policies and resolutions, clarification data, caller-held workflow state, byte sizing, Draft Reference origin validation, approvability, and proposition versioning. No UI, transport, integration call, agent runtime, persistence, or frontend work was introduced.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner.

## Full write perimeter

Intended phase files:

- `src/features/proposal-preparation/schemas/information-items.ts`
- `src/features/proposal-preparation/schemas/clarification.ts`
- `src/features/proposal-preparation/schemas/workflow-state.ts`
- `src/features/proposal-preparation/schemas/workflow-state.test.ts`
- `src/features/proposal-preparation/server/domain/information-registry.ts`
- `src/features/proposal-preparation/server/domain/information-registry.test.ts`
- `src/features/proposal-preparation/server/domain/approvability.ts`
- `src/features/proposal-preparation/server/domain/approvability.test.ts`
- `src/features/proposal-preparation/server/domain/bump-version.ts`
- `src/features/proposal-preparation/server/domain/bump-version.test.ts`
- `src/features/proposal-preparation/fixtures/states.ts`
- `src/features/proposal-preparation/schemas/clarification.test.ts`

Pipeline records changed:

- `build_docs/under_constroction/initial_core_feature_proposales/master-plan.md` — tracker row 6 only.
- `build_docs/under_constroction/initial_core_feature_proposales/plans/phase-06-items-clarification-state.md` — append-only Review log.
- This handoff file.

Generated `tsconfig.tsbuildinfo` output was restored. No frontend files, temporary VM shapes, architecture graph state, or unrelated user changes are in the final perimeter.

## 54-row coverage map

Every declared row has a test and the assertion has the declared strength.

| Row | Test | Strength |
|---|---|---|
| C1(a) | `information-registry.test.ts` — C1(a) policy row | exact policy object |
| C1(b) | same — C1(b) policy row | exact policy object |
| C1(c) | same — C1(c) policy row | exact policy object |
| C1(d) | same — C1(d) policy row | exact policy object |
| C1(e) | same — C1(e) policy row | exact policy object |
| C1(f) | same — C1(f) policy row | exact policy object |
| C1(g) | same — C1(g) policy row | exact policy object |
| C1(h) | same — C1(h) policy row | exact policy object |
| C1(i) | same — C1(i) policy row | exact policy object |
| C1(j) | same — C1(j) policy row | exact policy object |
| C1(k) | same — C1(k) totality test | exact set equality |
| C2(a) | `approvability.test.ts` — C2(a) | exact `{ approvable: true }` |
| C2(b) | same — C2(b) | exact refused key |
| C2(c) | same — C2(c) | exact approval result |
| C2(d) | same — C2(d) | exact approval result |
| C2(e) | same — C2(e) | exact refused key |
| C2(f) | same — C2(f) | exact refused key |
| C2(g) | same — C2(g) | exact sorted key array |
| C3(a) | `information-registry.test.ts` — C3(a) | exact error class, reason, and path |
| C3(b) | same — C3(b) | exact deferred resolution |
| C3(c) | same — C3(c) | exact supplied resolution |
| C3(d) | same — C3(d) | exact unresolved resolution |
| C3(e) | same — C3(e) | exact reason and second-entry path |
| C3(f) | same — C3(f) | exact first unknown reason/path |
| C3(g) | same — C3(g) | exact reason and answer path |
| C3(h) | same — C3(h) | exact addressed change plus deep-equal original |
| C4(a) | `clarification.test.ts` — C4(a) | exact cap parses |
| C4(b) | same — C4(b) | exact questions issue path |
| C4(c) | same — C4(c) | exact over-cap rejection |
| C4(d) | same — C4(d) | exact over-cap rejection |
| C4(e) | same — C4(e) | exact `answer.text` issue path |
| C5(a) | `workflow-state.test.ts` — C5(a) | parsed state equals fixture |
| C5(b) | same — C5(b) | exact unknown-key path |
| C5(c) | same — C5(c) | exact misspelled-key path |
| C5(d) | same — C5(d) | exact nested unknown-key path |
| C5(e) | same — C5(e) | exact JSON round-trip equality |
| C5(f) | same — C5(f) | exact brief-text path |
| C5(g) | same — C5(g) | exact missing-key path |
| C5(h) | same — C5(h) | exact unknown-item path |
| C5(i) | same — C5(i) | exact clarification preservation |
| C6(a) | same — C6(a) | exact Draft Reference equality |
| C6(b) | same — C6(b) | exact editor URL path |
| C6(c) | same — C6(c) | exact editor URL path |
| C6(d) | same — C6(d) | exact editor URL path |
| C6(e) | same — C6(e) | exact UUID path |
| C6(f) | same — C6(f) | exact malformed URL path and thrown `ValidationError` |
| C7(a) | same — C7(a) | parses within bound |
| C7(b) | same — C7(b) | exact oversize reason and precedence over `pad` |
| C7(c) | same — C7(c) | exact byte comparison and parse |
| C7(d) | same — C7(d) | exact safe serialization reason/issues |
| C8(a) | `bump-version.test.ts` — C8(a) | valid parses; uppercase fails at exact field |
| C8(b) | same — C8(b) | exact value `1` |
| C8(c) | same — C8(c) | exact value `5` |
| C8(d) | same — C8(d) | exact runtime arity `1` |

Reverse map: every test in the five phase test files is named for and discharges one of the rows above; there are no orphan tests or candidate criteria.

## Baseline and focused evidence

The red baseline was captured after test/fixture authoring and before production modules: the exact five-file phase command reported 54 tests, 54 failed, due to absent phase production modules. HEAD was `426a743ed3c268bb883a8bbc5f2bd0463ebd34f0`; the baseline dirty-tree digest was not captured.

Focused implementation verification: 5 files / 54 tests passed. `npm run typecheck`, `npm run lint`, and `git diff --check` passed. The state fixture was built inline from `validProposition`; no phase-10 maximal fixture was pulled forward.

## Named mutation ledger

Derived summands: `C2 1 · C3 1 · C5 1 · C6 1 · C7 1`; declared 5, executed 5, reverted 5.

| Mutation | Site and hypothesis | Target command | Observed red | Mutant snapshot digest | Probe-touched files |
|---|---|---|---|---|---|
| MUT-06-1 | `server/domain/approvability.ts`, predicate; treating every non-supplied resolution as required would block optional deferrals | `npx vitest run src/features/proposal-preparation/server/domain/approvability.test.ts` | C2(c) exact approval assertion and C2(d) exact approval assertion | `5c0bcd7b6ee09de7dd667fab13c4f3118aab60bc1e4b1f6d82413153d79febca` | `approvability.ts` |
| MUT-06-2 | `server/domain/information-registry.ts`, `applyAnswers`; treating missing entries as skips changes omission into a decision | `npx vitest run src/features/proposal-preparation/server/domain/information-registry.test.ts` | C3(d) unresolved assertion and C3(h) original deep-equality assertion | `885fb506405f5cc89020ee5c7a31cab53082a73631c40e74dbe5a43958ae02b7` | `information-registry.ts` |
| MUT-06-3 | `schemas/workflow-state.ts`, outer state object; non-strict parsing would strip unknown top-level keys | `npx vitest run src/features/proposal-preparation/schemas/workflow-state.test.ts` | C5(b) and C5(c) `capture` failed with “expected ValidationError” | `9dae4332b57eef846a708d8b244e7d5c68eb04869a5c9940a472d4b290b9aef6` | `workflow-state.ts` |
| MUT-06-4 | `schemas/workflow-state.ts`, editor URL refinement; HTTPS without configured-origin equality admits foreign/port-shifted links | `npx vitest run src/features/proposal-preparation/schemas/workflow-state.test.ts` | C6(c) and C6(d) `capture` failed with “expected ValidationError” | `534f559c437ae81ceb6596a12884e3f77dcbcf777d0064fe1c38defd21b25b88` | `workflow-state.ts` |
| MUT-06-5 | `schemas/workflow-state.ts`, `parseProposalWorkflowState`; parsing before sizing lets strictness win | `npx vitest run src/features/proposal-preparation/schemas/workflow-state.test.ts` | C7(b) received only `issues` for `pad`, with no `workflow_state_too_large` reason | `8433cc1579a1123c15b0a9f7e1c4d1433fda5b47a206c5b0ba4d79a51b4cc274` | `workflow-state.ts` |

All five mutants were reverted immediately. A first MUT-06-3 patch accidentally changed the Draft Reference object rather than the outer state object; its green result measured the wrong site. The correct outer-object mutation was then applied and failed C5(b)/(c), and the re-site is recorded rather than treated as evidence.

## Additional guard-failure probes

Each defect was planted in the implementation idiom and observed red, then reverted:

- Serialization guard: `workflow-state.ts`, bypass `serialized === undefined`; `workflow-state.test.ts` C7(d) lost the declared `domain_rule`/safe issue.
- Purity guard: `information-registry.ts`, assign the result back into `items`; C3(h) original deep-equality failed.
- Strict skip arm: `clarification.ts`, accept optional string text; C4(e) became successful and failed its `false` assertion.
- Nested brief strictness: `workflow-state.ts`, make `briefSchema` a plain object; C5(d) completed without a `ValidationError`.
- Resolution-record strictness: `information-items.ts`, make the ten-key record a plain object; C5(h) completed without a `ValidationError`.

## Judgments, boundaries, and documentation impact

The schema layer is runtime-neutral and uses `TextEncoder`, not Node `Buffer`; domain modules alone carry `server-only`. The state schema is strict at every state/clarification/item boundary and the state does not carry registry policy. `ValidationError` issues are structured paths; unrecognized-key paths are normalized at the state error boundary because Zod 4 reports them at the containing object. No caller-supplied byte-length option exists. `nextVersion` has one runtime argument and reads only `currentProposition`.

Documentation impact review after verified behavior: no feature README exists and no root/integration documentation became false, incomplete, or misleading. The plan Review log and tracker are the owning pipeline records; no mechanical documentation rewrite was made.

## Closing evidence

Checkpoint commit SHA: `760fa45` (`CHECKPOINT (not approved): phase 06 items clarification state`).

Closing L4 stamp: `npm test` passed with 20 test files / 278 tests at `2026-09-06T10:24:30+02:00`. Failure-ID delta: baseline 54 failing phase tests → closing ∅. The checkpoint is `760fa45`; the final phase source snapshot digest is `342064544193b01c6289571584f5ba6796f025e12a6dfd909aa60625f4b0f3d3`. The only post-checkpoint worktree entry is this untracked handoff, intentionally outside the checkpoint commit. A charter-authorized re-stamp follows this handoff finalization because the artifact changed after the first closing run.

## Architecture graph

No architecture graph is present; no delta was made.
