---
plan: 10
role: fix
state: IMPLEMENTED
date: 2026-09-07
actor: Codex
---

# Phase 10 fix round 1 — implementer handoff

## Baseline and coverage map

Pre-edit baseline: `npm test` — 35 files / 451 tests passed; zero failing tests. The baseline
tree was clean at `438f804` plus the folded documents.

Coverage map, one line per criterion row; the assertion shape is stated after the test id:

- C1(a) → `schemas/conversation.test.ts` C1(a) → exact parsed JSON round-trip equality; full shape.
- C1(b) → `schemas/conversation.test.ts` C1(b) → exact Zod code, raw paths, and keys for context and turn; full shape.
- C1(c) → `schemas/conversation.test.ts` C1(c) → exact cap issue path plus exact-cap acceptance; full shape.
- C1(d) → `schemas/conversation.test.ts` C1(d) → exact over-cap path plus trimmed acceptance; full shape.
- C1(e) → `schemas/conversation.test.ts` C1(e) → exact UUID/timestamp issue paths; full shape.
- C1(f) → `schemas/conversation.test.ts` C1(f) → both assistant refinement paths and strict human path; full shape.
- C1(g) → `schemas/conversation.test.ts` C1(g) → constant integer/parity/relation checks; full shape.
- C1(h) → `schemas/conversation.test.ts` C1(h) → negative, fractional, and zero omission-count cases; full shape.
- C1(i) → `schemas/conversation.test.ts` C1(i) → exact `MAX_TURN_TEXT_CHARS` parses; full shape.
- C2(a) → `server/domain/conversation.test.ts` C2(a) → bounded length, zero omissions, and order; full shape.
- C2(b) → `server/domain/conversation.test.ts` C2(b) → exact surviving id sequence and omission count; full shape.
- C2(c) → `server/domain/conversation.test.ts` C2(c) → input purity, reference independence, repeat equality; full shape.
- C2(d) → `server/domain/conversation.test.ts` C2(d) → exact empty object, parse, and fresh object/array references; full shape.
- C2(e) → `server/domain/conversation.test.ts` C2(e) → accumulated omissions and cap; full shape.
- C2(f) → `server/domain/conversation.test.ts` C2(f) → both constructor roles and intended schema variants; full shape.
- C3(a) → `server/domain/conversation.test.ts` C3(a) → exact whole-string proposition render; full shape.
- C3(b) → `server/domain/conversation.test.ts` C3(b) → exact two-question and one-question renders plus text absence; full shape.
- C3(c) → `server/domain/conversation.test.ts` C3(c) → exact failed render string; full shape.
- C3(d) → `server/domain/conversation.test.ts` C3(d) → direct uncut-length relation, whole-block cut, exact count, cap, and determinism; full shape.
- C3(e) → `server/domain/conversation.test.ts` C3(e) → leak absence paired with warning/content presence; full shape.
- C3(f) → `server/domain/conversation.test.ts` C3(f) → exact type equality using `Extract`; full shape.
- C3(g) → `server/domain/conversation.test.ts` C3(g) → maximal render length equals cap and parses as an assistant turn; full shape.
- C3(h) → `server/domain/conversation.test.ts` C3(h) → exact render with empty warnings/unresolved and unknown rationale; full shape.
- C4(a) → `server/agent/build-messages.test.ts` C4(a) → ordered labels and optional-block omission; full shape.
- C4(b) → `server/agent/build-messages.test.ts` C4(b) → exact history lines, omission line, separator, and numbering; full shape.
- C4(c) → `server/agent/build-messages.test.ts` C4(c) → instruction last and absent from history; full shape.
- C4(d) → `server/agent/build-messages.test.ts` C4(d) → exact sentinel counts and delimiter containment; full shape.
- C4(e) → `server/agent/build-messages.test.ts` C4(e) → shared scanner absence controls and `AgentMessage` shape; full shape.
- C4(f) → `server/agent/build-messages.test.ts` C4(f) → deep equality of complete six-message request; full shape.
- C4(g) → `server/agent/build-messages.test.ts` C4(g) → both delimiters escaped in text and name, exact opener/terminator counts, and verbatim remainder; full shape.
- C5(a) → `server/domain/retrieval-record.test.ts` C5(a) → exact candidates for both blocks and alternatives; full shape.
- C5(b) → `server/domain/retrieval-record.test.ts` C5(b) → exact add/overwrite values, input purity, and distinct map; full shape.
- C5(c) → `server/domain/retrieval-record.test.ts` C5(c) → empty size and negative lookup; full shape.
- C5(d) → `server/domain/retrieval-record.test.ts` C5(d) → identity-only entries for human and Proposales blocks; full shape.
- C5(e) → `server/domain/retrieval-record.test.ts` C5(e) → true for all seeded ids and false for an unseeded id; full shape.
- C6(a) → `schemas/conversation.test.ts` C6(a) → workflow parser issue at flattened conversation path; full shape.
- C6(b) → `schemas/conversation.test.ts` C6(b) → strict conversation issue at raw root path and key; full shape.

No production edit has been made at this point.

## Implemented

- `labeledBlock` now escapes both `<<<` and `>>>` in both `name` and `text`.
- Proposition rendering now emits whole block units and ends an oversized render with the exact
  `… <k> more blocks not summarised.` line. To satisfy the plan's exact-cap seam, the unused gap
  before that marker is right-padded with spaces; no semantic text is added, and no block or title
  is truncated.
- Empty `Warnings:` and `Unresolved:` labels are omitted.
- Moved C3(f) out of the schema test, added C1(h/i), C2(d/f), C3(b/d/g/h), C4(g), and C5(e), and
  removed the two unused `AnyRecord` aliases.

## Verification

Closing L4 stamp: `npm test` — **35 files / 458 tests passed**; `npm run typecheck` exit 0;
`npm run lint` exit 0. The required pre-edit baseline was 35 files / 451 tests passed with zero
failures. No `npm run build` was run, per the prompt's pre-existing-failure instruction.

Restricted-file digest evidence, SHA-256 (checkpoint `438f804` → current after restoration):

| File | Before | After |
|---|---|---|
| `src/features/proposal-preparation/schemas/conversation.ts` | `66b6fc0be28fbc83b3ba3511ff7703dd0f0777ee8605f914c0a5024c8e1b959c` | same |
| `src/features/proposal-preparation/server/domain/retrieval-record.ts` | `f78e7700391e5391f2da7306a9eb02a621c9a259e03a484b40447acec0e18e24` | same |

## Mutation ledger

Each row below was run after printing an applied-substitution count of 1, failed as observed, and
was reverted before the next mutation. The scope was the named phase test; the final row delta was
one failing test for each single-mutant run.

| Mutation | Applied site | Command / observed red |
|---|---|---|
| MUT-10-16 | `server/agent/build-messages.ts`, `labeledBlock` closing-delimiter escape removed | `npx vitest run .../build-messages.test.ts -t 'escapes both delimiters'` → C4(g) exact escaped text failed |
| MUT-10-18 | `schemas/conversation.ts`, `omittedTurns` bounds changed to `z.number()` | `npx vitest run .../schemas/conversation.test.ts -t 'omittedTurns as a non-negative integer'` → C1(h) negative case parsed |
| MUT-10-19 | `schemas/conversation.ts`, both text bounds changed to `boundedText(100)` | `npx vitest run .../schemas/conversation.test.ts -t 'accepts text exactly'` → C1(i) exact-cap case failed |
| MUT-10-20 | `server/domain/conversation.ts`, `cutToBudget` cap changed to `MAX_TURN_TEXT_CHARS + 1` | `npx vitest run .../server/domain/conversation.test.ts -t 'maximal render parseable'` → C3(g) length was 3001, not 3000 |
| MUT-10-21 | `server/domain/conversation.ts`, unknown rationale appended unconditionally | `npx vitest run .../server/domain/conversation.test.ts -t 'empty warning'` → C3(h) gained a trailing empty line |
| MUT-10-22 | `server/agent/build-messages.ts`, opening-delimiter escape removed | `npx vitest run .../build-messages.test.ts -t 'escapes both delimiters'` → C4(g) exact escaped text failed |
| MUT-10-23 | `server/agent/build-messages.ts`, both escapes applied to text but not name | `npx vitest run .../build-messages.test.ts -t 'escapes both delimiters'` → C4(g) forged name delimiters survived |
| MUT-10-24 | `server/domain/conversation.ts`, question count replaced by literal `2` | `npx vitest run .../server/domain/conversation.test.ts -t 'clarification ids'` → C3(b) one-question count failed |
| MUT-10-25 | `server/domain/conversation.ts`, omission marker removed from whole-block cut | `npx vitest run .../server/domain/conversation.test.ts -t 'cuts an oversized render'` → C3(d) final marker assertion failed |

The first attempted selectors for MUT-10-18 and MUT-10-19 used regex parentheses and skipped; both
were discarded and rerun with literal-safe selectors before their results were counted. No probe
was treated as evidence while skipped. MUT-10-16, 22, and 23 each reddened C4(g) alone.

## Write perimeter

Fix changes: `src/features/proposal-preparation/server/agent/build-messages.ts`,
`src/features/proposal-preparation/server/domain/conversation.ts`,
`src/features/proposal-preparation/schemas/conversation.test.ts`,
`src/features/proposal-preparation/server/agent/build-messages.test.ts`,
`src/features/proposal-preparation/server/domain/conversation.test.ts`, and
`src/features/proposal-preparation/server/domain/retrieval-record.test.ts`.

Documentation/coordination changes: this handoff, `plans/phase-10-conversation-context.md`, and
the phase-10 tracker row in `master-plan.md`.

Mutation-only applied-and-reverted files, listed separately from the fix perimeter:
`src/features/proposal-preparation/schemas/conversation.ts` (MUT-10-18/19),
`src/features/proposal-preparation/server/agent/build-messages.ts` (MUT-10-16/22/23), and
`src/features/proposal-preparation/server/domain/conversation.ts` (MUT-10-20/21/24/25).
No architecture-graph state exists. The generated `tsconfig.tsbuildinfo` rewrite from typecheck
was restored and is not part of the final perimeter.

## Judgment calls and owner decisions

- The whole-block owner decision was followed; per-block truncation, cap changes, re-flow, paging,
  and `current_proposition` changes were not made.
- The exact-cap requirement in C3(g) and the whole-block/no-extra-semantic-text requirement are
  in tension. The implementation resolves this with invisible whitespace before the exact marker;
  the semantic render contains only the version, complete blocks, and the count line. This is the
  only material judgment call and is recorded here for the reviewer.
- No current-state documentation became false or incomplete, so no feature README was changed.
