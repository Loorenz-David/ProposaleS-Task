---
plan: 13
phase: Approval validation — envelope, diff, terminality, check order
state: NOT_STARTED
date: 2026-09-05
author: implementation-planner round 1
---

# Phase 13 — Approval validation: envelope, diff, terminality, check order

## Goal

Implement the approval side of execution without touching Proposales: the envelope with the literal pricing acknowledgment, `validateApproval` running checks 1–5 of §17A.13 in the binding order (state parse → Draft Reference terminality → envelope → proposition → completeness/provenance), the total prepared→approved diff, and its paths-only logging.

**Not in this phase:** recovery search, create, read-back, `approveProposition`/`executeApprovedProposal` services (phase 14).

## Read first

1. Master plan §6.4 (`pricingAcknowledgmentSchema`, `approvalEnvelopeSchema`, `approvedProposalSchema`, `approvalDiffSchema`), §6.5 (`LIBRARY_PRICING_STATEMENT_*`), §6.6 (`validateApproval`, `computeApprovalDiff`), §6.3 (`ValidationReason`, `ConflictReason`).
2. Intention §17A.10 (all), §17A.13 (check order rows 1–5; the `approval_required` distinction), §17A.2 (terminality mechanically), §17A.3 (stale case: Draft Reference to an archived draft → conflict without a read), §17A.6, §11.3, §3.1, §22 criteria 6, 15, 17, 21.
3. Contracts: `08-agent-architecture.md` §6; `10-security-and-trust-boundaries.md` §5, §7; `04-server-architecture.md` §6, §9.
4. Phases 6, 11 Review logs.

## Dependencies (gate)

Phase 12 `APPROVED`.

## Files expected to change

`schemas/approval.ts`, `schemas/approval.test.ts`, `server/domain/validate-approval.ts` (+test), `server/domain/approval-diff.ts` (+test), `fixtures/envelopes.ts` — 7 new files.

## Implementation tasks (ordered)

1. `schemas/approval.ts` per master plan §6.4; `TERMINAL_CONFLICT_MESSAGE` constant ("A draft already exists for this workflow; later changes were not applied and belong in the Proposales editor.").
2. `domain/approval-diff.ts`: `canonicalize` (recursive key sort), positional array comparison, leaf-level entries including `source`/`ref`, `known` toggles as entries, exclude `version` and `preparedAt` at the top level, output sorted by path.
3. `domain/validate-approval.ts`: `validateApproval(raw, { editorOrigin, now })`: (1) `parseProposalWorkflowState(raw?.state)` — but the envelope is the input; order: parse `raw` only as far as extracting `state` (`z.object({ state: z.unknown() }).passthrough` is prohibited — use `z.looseObject` for this single extraction step and never forward it), then `parseProposalWorkflowState`; (2) `state.draftReference` present → `ConflictError` reason `draft_already_exists`, details `{ proposalUuid, editorUrl }`, message `TERMINAL_CONFLICT_MESSAGE`; (3) `approvalEnvelopeSchema.safeParse(raw)` (the acknowledgment failing → `ValidationError` reason `pricing_acknowledgment_missing` at `["pricingAcknowledgment"]`); (4) `propositionSchema` (already inside the envelope schema; provenance failures → reason `consequential_provenance_invalid` with paths); (5) `deriveItemResolutions` then `evaluateApprovability` → `ValidationError` reason `required_to_create_unresolved`, `details.itemKeys`. Success → `{ approved: { generationId, proposition: envelope.proposition, pricingAcknowledgment, approvedAt: formatIsoTimestamp(now()), diff: computeApprovalDiff(state.preparedProposition, envelope.proposition) } }` and a log event `approval.validated` with `{ generationId, diffPaths, diffCount }`.
4. `fixtures/envelopes.ts`: `validEnvelope(overrides?)` built from `validState()`.
5. Named mutations, revert, stamp, checkpoint commit.

## Acceptance criteria

| ID | Row | Fixture / setup | Exact expected outcome | Named mutation | Trace |
|---|---|---|---|---|---|
| C1(a) | 1 before 2 | state with an unknown key **and** a Draft Reference | `ValidationError` (state parse), not `conflict` | — | M8, §17A.13 |
| C1(b) | 2 before 3 | valid state with a Draft Reference **and** no `pricingAcknowledgment` | `ConflictError`, not `validation_error` | MUT-13-1 `validate-approval.ts` · move the Draft Reference check after the envelope parse → C1(b) red | M8, crit 21 |
| C1(c) | 3 before 4 | no Draft Reference, no acknowledgment **and** an `inferred` consequential leaf | `ValidationError` reason `pricing_acknowledgment_missing`, path `["pricingAcknowledgment"]` | — | §17A.13 |
| C1(d) | 4 before 5 | acknowledgment present, `inferred` consequential leaf **and** `language` unresolved | reason `consequential_provenance_invalid` (not `required_to_create_unresolved`) | — | §17A.13 |
| C2(a) | conflict payload | state with Draft Reference `{ u, e }` | `code === "conflict"`, `details.reason === "draft_already_exists"`, `details.proposalUuid === u`, `details.editorUrl === e`, `message === TERMINAL_CONFLICT_MESSAGE` | — | M8, crit 21 |
| C2(b) | no Proposales dependency | `validateApproval`'s signature | has no `proposales` parameter (`expectTypeOf`); the module imports nothing from `lib/proposales` (source read) | — | M8, §17A.2 (no live lookup) |
| C3(a) | acknowledgment absent | | `ValidationError` reason `pricing_acknowledgment_missing`, path `["pricingAcknowledgment"]` | — | §17A.10, crit 17 |
| C3(b) | `acknowledged: false` | | same reason and path | MUT-13-2 `approval.ts` · `z.literal(true)` → `z.boolean()` → C3(b) red | §17A.10 |
| C3(c) | wrong statement id | `statement: "library-pricing-v0"` | same path | — | §17A.10 |
| C3(d) | present | valid | `approved.pricingAcknowledgment` deep-equals the input | — | crit 17 |
| C4(a) | required-to-create unresolved | `items.language` unresolved (and `language` `{ known: false }`) | reason `required_to_create_unresolved`, `details.itemKeys` deep-equals `["language"]` | — | M2, crit 6 |
| C4(b) | consequential inference | `blocks.0.quantity.source = "inferred"` | reason `consequential_provenance_invalid`, an issue path prefixed `["proposition","blocks","0","quantity"]` | — | M1, crit 6 |
| C4(c) | empty draft | no blocks, no confirmation → refused `["block_selection"]`; with `emptyDraftConfirmation` human → accepted | as stated (2 sub-rows) | — | crit 15, M2 |
| C4(d) | deferred item accepted | `recipient_identity` deferred | accepted | — | M2 |
| C5(a) | identical | prepared = current | `diff` deep-equals `[]` | — | §17A.10 |
| C5(b) | value change | current `title.value` differs | one entry, `path ["title"]`, `before`/`after` are the whole leaves | — | §17A.10 |
| C5(c) | re-sourcing counts | same value, `inferred` → `human` | one entry at `["title"]` | MUT-13-3 `approval-diff.ts` · compare `value` only → C5(c) red | §17A.10 |
| C5(d) | reorder is positional | two blocks swapped | entries at `["blocks","0"]` and `["blocks","1"]` (or their leaves), none at the array level | — | §17A.10 |
| C5(e) | known toggle | `quantity` `{ known: false }` → known 2 | one entry | — | §17A.10 |
| C5(f) | excluded fields | only `version`/`preparedAt` differ | `[]` | — | §17A.10 |
| C5(g) | sorted | several changes | `paths` equal their sorted copy | — | §17A.10 |
| C5(h) | canonical | key order differs, content equal | `[]` | — | §17A.10 |
| C6(a) | log carries paths and count only | capturing logger; diff with a `before` value `DIFF-VALUE-SENTINEL` | event `approval.validated` has `diffPaths` and `diffCount`; `DIFF-VALUE-SENTINEL` absent from the line | MUT-13-4 `validate-approval.ts` · log the `diff` object → C6(a) red | §17A.10, 10 §7 |
| C7(a) | accepted output | `validEnvelope()` | `approved` parses `approvedProposalSchema`; `approvedAt` from `now()`; `generationId` equals the state's | — | M5, crit 6 |
| C7(b) | corrected payload accepted with diff | state where `currentProposition` carries a human edit vs `preparedProposition` | `approved.proposition` is the current (human) one; `diff.length ≥ 1` | — | M5, crit 6, M4 |
| C7(c) | approval reads no conversation | `{ ...validEnvelope(), conversation: conversationWith(2) }`; `validateApproval`'s parameter type | `ValidationError` with an issue at `["conversation"]` (strict envelope); the input type has no `conversation` member (`expectTypeOf`); `approve-proposition.ts` and `validate-approval.ts` import nothing from `schemas/conversation` or `domain/conversation` (source read) | — | §17A.17 (proposed: conversation is never authority), 08 §6 integrity invariant (6), M5 |

Criteria: 7 (C1–C7), 26 rows (a table line is one row; a lettered span counts its letters). Named mutations: 4.

## Notes

- Check 5 uses `deriveItemResolutions(state.items, envelope.proposition)` so the approvability reflects the proposition actually submitted (a human edit that supplies a title after the last agent turn counts).
- The check-order rows each construct a fixture failing **two** adjacent checks; that is what makes order observable (charter rule 2 companion).
- Projection gate: mandatory (ranks 5, 11).

## Review log

*(append-only)*
