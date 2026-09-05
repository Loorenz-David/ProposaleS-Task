---
plan: 14
phase: Execution — recovery, create, read-back, result
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 14 — Execution: recovery, create, read-back, result

## Goal

Implement `executeApprovedProposal` (the `approval_required` entry guard, recovery search with 0/1/≥2 → create/recovered/conflict, exactly one never-retried create, the Draft Reference written into the returned state, the bounded read-back whose failure never downgrades a create, the Applied Pricing result, the inline-recipient notice) and `approveProposition` composing `validateApproval` → execution.

**Not in this phase:** documentation closeout and the whole-workflow proof (phase 15).

## Read first

1. Master plan §5 (R10, R11), §6.4 (`draftResultSchema`, `appliedPricingSchema`, `CreateProposalDraftInput`), §6.5 (`PROPOSALES_READ_*`), §6.6 (`approveProposition`, `executeApprovedProposal`, `toCreateDraftInput`), §6.3 (`AppliedPricingUnavailableReason`, `ConflictReason`), §9 rules 2, 5.
2. Intention §17A.11 (all), §17A.12 (read-back bounds, unavailable variant), §17A.13 (check order rows 6–8; `approval_required`), §17A.2 (Draft Reference: when it becomes present), §17A.5 (recipient omission), §11.3 ("read-back after execution"), §13, §15.1, §9.2 (accepted duplicate-contact risk, surface (k)), §22 criteria 7, 8, 11, 18, 19.
3. Evidence doc §4, §5, §6.
4. Contracts: `04-server-architecture.md` §4, §8, §9; `08-agent-architecture.md` §6; `10-security-and-trust-boundaries.md` §5, §10; `07-integrations.md` §4, §5.
5. Phases 4 and 12 Review logs.

## Dependencies (gate)

Phase 13 `APPROVED`.

## Files expected to change

`schemas/draft-result.ts`, `server/domain/to-create-draft-input.ts` (+test), `server/services/execute-approved-proposal.ts` (+test), `server/services/approve-proposition.ts` (+test), `server/index.ts` — 7 paths.

## Implementation tasks (ordered)

1. `schemas/draft-result.ts` per master plan §6.4 (`appliedPricingSchema` mirrors the lib mapper's output type; the feature re-parses what the lib returns at this boundary — 06 §2 "mutation payload after approval" row applies to the request, and the result DTO is parsed because it crosses to the caller).
2. `domain/to-create-draft-input.ts`: `toCreateDraftInput(approved)` — pure; `language` from `proposition.language.value` (known by approvability), `titleMd` from `title.value`, `descriptionMd` when known, `recipient` → `KnownOrAbsent` with only known leaves, `blocks` → `{ contentId, quantity: KnownOrAbsent, optional: KnownOrAbsent }` via spread-free `known` mapping (`{ known: true, value }` or `{ known: false }` — the leaf's `known` is copied, never defaulted), `generationId`. No `??`, `||`, defaults (rule 2).
3. `services/execute-approved-proposal.ts`: `approvedProposalSchema.safeParse(raw)` fails → `ApprovalRequiredError`; check 6: `proposales.findProposalsByGenerationId` — throws → rethrow; `≥ 2` → `ConflictError` reason `multiple_recovery_matches` details `{ proposalUuids }`; `1` → recovered (no create); `0` → check 7: exactly one `createProposalDraft(toCreateDraftInput(approved))`; check 8: `getProposal(uuid)` wrapped: success → `toAppliedPricing` (lib) → parsed `appliedPricingSchema`; `ProposalesError` → `{ available: false, reason }` by `details.reason` (`timeout` → `read_failed_timeout`, `schema_mismatch` → `read_failed_schema_mismatch`, retry exhaustion by elapsed cap → `read_budget_exhausted`, anything else incl. 404 → `read_failed_upstream`, `status` carried). Draft Reference `{ proposalUuid, editorUrl }` from the create response or the recovered summary; if `new URL(editorUrl).origin !== editorOrigin` add notice `editor_url_origin_unexpected` (result still `created`/`recovered`). `notices` gets `inline_recipient_may_duplicate_contact` iff the request carried a recipient. Log `execution.created` / `execution.recovered` with ids only.
4. `services/approve-proposition.ts`: `validateApproval` → `executeApprovedProposal` → `TurnResult` with `state = { ...state, draftReference }` (the state parsed in validation, unchanged otherwise); `deps.ai` is present in the signature only so the test can inject the failing client and prove it is unused — do **not** thread it into execution.
5. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

Fake Proposales client with `storedReadbacks`; `createFailingAiClient()` as `deps.ai`; injected `now`, `sleep`.

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | 5 before 6 | `language` unresolved **and** the fake holds a matching proposal | `ValidationError`; `fake.calls` contains no `findProposalsByGenerationId` | — | M8, §17A.13 |
| C1(b) | 6 before 7 | one verified match | `status === "recovered"`; `fake.writes === 0` | — | M14, §17A.13 |
| C1(c) | 6 fails → no 7 | `failNext("findProposalsByGenerationId", 503-error)` | rejects with `integration_error`; `fake.writes === 0` | — | §13, M6 |
| C1(d) | 7 before 8, 8 never fails the turn | create succeeds, read-back fails | `status === "created"` | — | §17A.13 (row 8) |
| C2(a) | zero matches → create | | `fake.writes === 1`; `status === "created"`, `newlyCreated === true` | — | M6, crit 8 |
| C2(b) | one match → recovered | | `newlyCreated === false`; `proposalUuid`/`editorUrl` from the match; `writes === 0` | — | M6, M14, crit 8 |
| C2(c) | two matches → conflict | | `ConflictError` reason `multiple_recovery_matches`, `details.proposalUuids` (2); `writes === 0` | MUT-14-1 `execute-approved-proposal.ts` · pick `matches[0]` when `> 1` → C2(c) red | M14, crit 8 |
| C2(d) | search failure → no create | (as C1(c)) | `integration_error`, `writes === 0` | — | §13 |
| C3(a) | zero model calls | `deps.ai = createFailingAiClient()` | resolves (the failing client is never invoked) | MUT-14-2 `execute-approved-proposal.ts` · call `deps.ai.generateStep` before create → C3(a) red | M5, crit 7 |
| C3(b) | request equals the mapped approved payload | approved whose block was human-replaced (phase 12 fixture) | `fake.calls` create entry's `request` deep-equals `toCreateProposalRequest(toCreateDraftInput(approved), ctx)`; the human block's `content_id` is the replaced id | — | M5, M4, crit 4, crit 7 |
| C3(c) | deterministic | same approved twice on fresh fakes, same `now` | byte-identical `JSON.stringify(request)` | — | invariant 10, M5 |
| C3(d) | approval_required guard | `executeApprovedProposal(<a raw proposition>)` | `ApprovalRequiredError`; `writes === 0` | — | §17A.13, 10 §5 |
| C3(e) | omission carried through both seams | approved block `quantity`/`optional` `{ known: false }` | request block has neither key | MUT-14-3 `to-create-draft-input.ts` · `quantity: { known: true, value: 1 }` when absent → C3(e) red | M9, crit 22 |
| C4(a) | create never retried | `failNext("createProposalDraft", 503-error)` | rejects `integration_error`; create called once; no result | — | M5, §17A.11 |
| C5(a) | Draft Reference after create | | returned `state.draftReference` deep-equals `{ proposalUuid: <fake uuid>, editorUrl: <fake url> }` | — | M8, §17A.2 |
| C5(b) | after recovery | | equals the match's uuid/url | — | M8 |
| C5(c) | state otherwise unchanged | | returned state minus `draftReference` deep-equals the inbound parsed state | — | §17A.2 |
| C5(d) | unexpected origin | fake `editorOrigin: "https://other.test"` | `status === "created"`; `notices` contains `editor_url_origin_unexpected` | — | §17A.3, 10 §10 |
| C6(a) | read-back after create | | `fake.calls` has exactly one `getProposal` with the created uuid; `appliedPricing` deep-equals `appliedPricingSchema.parse(toAppliedPricing(fake.storedReadbacks.get(uuid)))` | — | M13, M6, crit 18 |
| C6(b) | read-back after recovery | | exactly one `getProposal` with the recovered uuid | — | crit 18 |
| C6(c) | inconsistent verbatim | stored readback = the inconsistent fixture | reported verbatim (totals equal the fixture) | — | M13, crit 18 |
| C7(a) | read-back 503 exhausted | `getProposal` fails 503 on every attempt | `status === "created"`, `appliedPricing` = `{ available: false, reason: "read_failed_upstream", status: 503 }`; no error; `writes === 1` | MUT-14-4 `execute-approved-proposal.ts` · rethrow the read-back error → C7(a) red | M6, M13, crit 19 |
| C7(b) | timeout | | `reason === "read_failed_timeout"` | — | §17A.12 |
| C7(c) | schema mismatch | | `read_failed_schema_mismatch` | — | §17A.12 |
| C7(d) | 404 | | `read_failed_upstream`, `status 404`; **not** `not_found` | — | §17A.12 |
| C7(e) | retry only on retryable | 401 → 1 attempt; 503 → `PROPOSALES_READ_MAX_ATTEMPTS` attempts (count `getProposal` calls on the fake, which delegates retry to the injected http-level behavior — assert via the fake's attempt counter) | as stated | — | §17A.12 |
| C7(f) | elapsed cap | `now` jumps past `PROPOSALES_READ_TOTAL_MS` | `read_budget_exhausted` | — | §17A.12 |
| C8(a) | plain JSON | | `JSON.parse(JSON.stringify(result))` deep-equals `result` | — | M6, crit 11 |
| C8(b) | identity fields | | `proposalUuid`, `editorUrl`, `newlyCreated` present | — | crit 11 |
| C8(c) | unavailable carries no money | C7(a) result | recursive key scan finds no `amountMinor`, `totalWithTax`, `totalWithoutTax`, `unitValue*` | — | M13, §17A.12 |
| C8(d) | duplicate-contact notice | recipient known / absent | notice present / absent | — | §9.2 (k) |
| C8(e) | only-if-cheap fields | readback with `series_uuid` and an undocumented status | `seriesUuid` carried; `status === "unknown"` | — | §18 (only if cheap), 06 §6 |

Criteria: 8 (C1–C8), 32 rows (a table line is one row; a lettered span counts its letters). Named mutations: 4.

## Notes

- The read-back retry lives in the lib transport (phase 3); C7(e)/(f) exercise it through the fake by giving the fake an injected `attempts` policy mirroring the real one **or** by wiring the real client with a mocked `fetch` for these two rows — choose the second (it tests the production path, charter rule 3) and say so in the Review log.
- A recovered draft's `editorUrl` comes from the search row's `url`; the same origin notice applies.
- Projection gate: mandatory (ranks 1, 3, 5, 8, 10).
- Phase-4 review N5: `proposal-readback.consistent.json` currently has distinct block values but totals that no longer represent a consistent vendor read-back. This phase relies on the explicitly inconsistent fixture for C6(c); do not use the consistent fixture as a consistency oracle. If a future execution test needs one, first correct its totals to `10100` / `10200` and record the fixture premise in the test.

## Review log

*(append-only)*
