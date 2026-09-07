---
plan: 10
role: implement
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 10 round 1 implementer handoff

Implemented the conversation schema/context domain, retrieval record, and preparation message assembler. All are pure; there is no service, I/O, model call, provider import, network access, environment read, or phase-9 runtime change.

The four production modules are:

- src/features/proposal-preparation/schemas/conversation.ts
- src/features/proposal-preparation/server/domain/conversation.ts
- src/features/proposal-preparation/server/domain/retrieval-record.ts
- src/features/proposal-preparation/server/agent/build-messages.ts

The fixture/test additions are:

- src/features/proposal-preparation/fixtures/conversations.ts
- src/features/proposal-preparation/fixtures/propositions.ts
- src/features/proposal-preparation/schemas/conversation.test.ts
- src/features/proposal-preparation/server/domain/conversation.test.ts
- src/features/proposal-preparation/server/domain/retrieval-record.test.ts
- src/features/proposal-preparation/server/agent/build-messages.test.ts

## Coverage map

Every row is an executing test name, and every assertion is the row’s stated shape rather than a weaker proxy.

| Row | Executing test | Assertion shape |
|---|---|---|
| C1(a) | conversation schema C1(a) | exact JSON round trip |
| C1(b) | conversation schema C1(b) | exact code, raw numeric paths, and keys |
| C1(c) | conversation schema C1(c) | exact cap issue and acceptance |
| C1(d) | conversation schema C1(d) | exact text issue and trim behavior |
| C1(e) | conversation schema C1(e) | exact UUID/timestamp issue paths |
| C1(f) | conversation schema C1(f) | all three version/kind cases |
| C1(g) | conversation schema C1(g) | constant contract relation |
| C2(a) | conversation domain C2(a) | order, cap, and omission count |
| C2(b) | conversation domain C2(b) | exact surviving id sequence |
| C2(c) | conversation domain C2(c) | input immutability, references, repeat equality |
| C2(d) | conversation domain C2(d) | exact empty context and parse |
| C2(e) | conversation domain C2(e) | accumulated omissions and cap |
| C3(a) | conversation domain C3(a) | exact whole render |
| C3(b) | conversation domain C3(b) | exact render and question-text absence |
| C3(c) | conversation domain C3(c) | exact failure render |
| C3(d) | conversation domain C3(d) | oversized fixture relation, cap, marker, determinism |
| C3(e) | conversation domain C3(e) | leak absence plus warning/content presence |
| C3(f) | conversation schema C3(f) | type equality of statuses |
| C4(a) | message assembler C4(a) | ordered labels and minimal list |
| C4(b) | message assembler C4(b) | exact history lines and omission/window numbering |
| C4(c) | message assembler C4(c) | separate final instruction and history exclusion |
| C4(d) | message assembler C4(d) | exact-count sentinels and delimiter containment |
| C4(e) | message assembler C4(e) | shared scanner controls and AgentMessage type |
| C4(f) | message assembler C4(f) | deep-equal complete request |
| C5(a) | retrieval record C5(a) | exact four candidates |
| C5(b) | retrieval record C5(b) | exact add/overwrite, clone, and Map identity |
| C5(c) | retrieval record C5(c) | empty record and negative lookup |
| C5(d) | retrieval record C5(d) | identity-only blocks for both sources |
| C6(a) | conversation schema C6(a) | flattened workflow-state unknown-key issue |
| C6(b) | conversation schema C6(b) | raw schema path and key shape |

## Baseline and closing evidence

After adding tests/fixtures but before production edits, npm test was 31 files / 421 passing and 4 phase files / 28 failing tests (449 total); failures were the absent target modules. The single closing L4 stamp was:

- npm test: 35 files / 451 tests passed
- npm run typecheck: passed
- npm run lint: passed

The build was not run because the prompt records the pre-existing main-branch globals.css import of deleted tokens.css as non-signal. No network, environment, install, or provider command was run.

## Mutation ledger

All 14 declared mutations were applied at their named site, observed red, and reverted. The restored digest is the same final digest printed for each file.

| Mutation | Observed red | Restored digest |
|---|---|---|
| MUT-10-1 | C1(f) | conversation schema: 66b6fc0be28fbc83b3ba3511ff7703dd0f0777ee8605f914c0a5024c8e1b959c |
| MUT-10-2 | C2(b), shared cap half of C2(e) | conversation domain: 4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c |
| MUT-10-3 | C3(d) | conversation domain: 4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c |
| MUT-10-4 | C4(c), C4(d), C4(f) | message assembler: 0c2dfece49422897b9ea92ed6d1e0a3b055849a521cbd44f350bbe5b6d0a1711 |
| MUT-10-5 | C4(a), C4(d), C4(f) | message assembler: 0c2dfece49422897b9ea92ed6d1e0a3b055849a521cbd44f350bbe5b6d0a1711 |
| MUT-10-6 | C2(e) | conversation domain: 4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c |
| MUT-10-7 | C3(a) | conversation domain: 4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c |
| MUT-10-8 | C3(a), C3(e) | conversation domain: 4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c |
| MUT-10-9 | C4(f) | message assembler: 0c2dfece49422897b9ea92ed6d1e0a3b055849a521cbd44f350bbe5b6d0a1711 |
| MUT-10-10 | C5(a), C5(b), C5(d) | retrieval record: f78e7700391e5391f2da7306a9eb02a621c9a259e03a484b40447acec0e18e24 |
| MUT-10-11 | C5(d) | retrieval record: f78e7700391e5391f2da7306a9eb02a621c9a259e03a484b40447acec0e18e24 |
| MUT-10-12 | C6(a); first wrong-site probe discarded | workflow state: b7927fc8f5058fc73a13ed7b2ad6b3ad5d57bc0634566abce86b497f8063eb5a |
| MUT-10-13 | C6(b) | conversation schema: 66b6fc0be28fbc83b3ba3511ff7703dd0f0777ee8605f914c0a5024c8e1b959c |
| MUT-10-14 | C3(f) typecheck failure plus unhandled created branch compile error | conversation domain: 4645778216c82915ab1f9a8f0503fcf57f66357d18cec2465c14ce9f56bbdc3c |

MUT-10-12 was the only probe outside the implementation perimeter: schemas/workflow-state.ts, applied and reverted. The initial mutation hit the draft-reference helper instead of proposalWorkflowStateSchemaFor and was not counted as evidence; the correctly sited rerun reddened C6(a).

## Full write perimeter

Production code, tests, fixtures, the phase plan review log/header, the master tracker row, and this handoff. No package, lockfile, config, graph, or other tool-recorded state was changed. The phase is IMPLEMENTED and awaits review; it is not APPROVED.
