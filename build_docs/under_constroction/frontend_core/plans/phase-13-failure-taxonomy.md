# Phase 13 — Failure taxonomy and recovery

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 7 |
| **Projection** | waivable |
| **Serves** | F23 · F2 · F16 · F24 · F5 |

## Goal

Make every failure the application can produce render something intentional, at the right place,
with the message the server sent — and make retry appear exactly when the server says the
operation is retryable.

**Not in this phase:** the transport that produces these failures for real (phase 16). Every row
is driven by an era-marked fixture shaped like the error contract, and phase 16 re-binds the
production path without changing a presentation component.

## Read first

- Master plan §6.3 (`ErrorTreatmentKey`, the rendered `RunFailureReason` rows), §9 rule 2.
- Intention §5.8's failure paragraph, §12A.16 **in full**, §12A.9 (the `failed` result's thread
  turn and its unchanged proposal surface), §12A.17 (the failure focus row), §12A.3 (the status
  returning to ready), §11.
- `ui_design/09-creating-and-created-states.md` §4.3 and §5;
  `ui_design/10-design-integration-guide.md` §4 item 1 and §8 item 1.
- Contract 04 §6 (the taxonomy and the `ErrorDto` shape); backend master plan §6.3 (the
  `details.reason` registries, `RunFailureReason`); backend intention §17A.13 — cited, never
  redefined.
- Contracts: `05-client-architecture.md` §6; `12-anti-patterns.md` "Components and client".

## Dependencies

Phase 12 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/creation/CreationFailureSurface.tsx   new
src/features/proposal-preparation/client/view-models/failure.ts                    new
src/features/proposal-preparation/components/pills/                                edited — the failure turn
src/features/proposal-preparation/client/fixtures/failures.temporary-fixture.ts    new
```

## Ordered tasks

1. **Keep the two channels separate.** A `failed` **domain result** is an outcome of a run; an
   error DTO is a failure of a call. Routing one through the other's presentation misreports both.
2. **Render the four run-failure reasons**, each with the treatment §12A.16 states, and treat
   reaching a production rendering path with the test-only reason as a defect rather than as a
   state to render.
3. **Render the ten error rows** — the nine taxonomy codes plus unknown — each with its message,
   its read `details` keys, its retry rule and its render site.
4. **Render the DTO's message as given.** A UI-authored string never replaces a message a known
   code carried; the generic fallback exists only for the unknown-code row and only when no
   message is present.
5. **Offer retry exactly when the server marks the operation retryable**, for every code without
   exception, so a backend that later marks a code retryable needs no presentation change. An
   absent flag is false, never true. Retry re-issues the same intent with the same input; it is
   not a new turn with a new payload.
6. **Read `details` only through the named keys.** The client never string-parses a message,
   never infers retryability from wording, and never inspects a key the table does not name.
7. **Build the creation-failure presentation** in the created state's vocabulary: the attention
   medallion, a headline naming what failed, the DTO's message, and the restatement that nothing
   was sent — with **Back to review always first in tab order**, try-again offered only under the
   retry rule, focus moved to the error heading with alert semantics, and the proposition intact
   and returned to review.
8. **Leave the design markers.** The creation error state is designed only in outline: its
   medallion values are inferred from the attention tokens rather than read from the prototype,
   and its copy is placeholder. Implement the outline, leave a marker, and report it as a design
   delta — leaving failures unrendered would break F2 and F23.
9. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The ten error rows, enumerated, each with its stated treatment and render site. One row per code — validation, unauthenticated, forbidden, not-found, conflict, approval-required, integration, rate-limited, internal, and unknown — each asserting the rendered message, the `details` keys read, whether retry is offered, and where it renders. Validation renders at each named leaf, with a path naming no rendered leaf rendering at surface level. Conflict renders in the created or terminal presentation, pointing at the existing draft's identity and editor URL. Approval-required renders on the approval surface with back-to-review first in tab order. | 10 | F23 · §12A.16 · `04 §6` |
| **C2** | The four run-failure reasons, enumerated. (a) The budget reason renders a failure turn naming that the run reached its limit and which limit, and the composer stays available so the human can send another instruction; no dedicated retry affordance is introduced. (b) The model-output reason renders a failure turn stating that the result could not be produced; the issue paths may be shown; no model text exists to show and none is invented. (c) The tool-output reason renders as (b). (d) The test-only reason is **not reachable on a production rendering path** — asserted as an absence with a planted-defect probe that routes it to a production path and observes the row redden. (e) In every row the session's proposition, if it has one, stays intact and rendered. | 5 | F23 · F16 · §12A.16 · §12A.9 |
| **C3** | A known code's message is never replaced. (a) For each of the nine known codes, the rendered text contains the DTO's message — nine rows. (b) No UI-authored string replaces it. (c) The generic fallback renders **only** for an unknown code **and only** when no message is present — two rows: unknown with a message renders the message; unknown without one renders the fallback. (d) Planted-defect probe: replace a known code's message with a generic string; row (a)'s corresponding row must redden. | 12 | F23 · F2 · §12A.16 · `05 §6` |
| **C4** | Retry is one rule, applied to every code. (a) Retry is offered when the failure's retryable flag is true — one row per code that can carry it. (b) Retry is **not** offered when the flag is false. (c) Retry is **not** offered when the flag is absent — absent is false, never true. (d) Retry is never offered on a validation failure, whatever the flag says, because a validation error is corrected rather than retried. (e) Activating retry re-issues the same intent with the same input, asserted by structural equality of the two dispatched values. (f) **Named mutation:** offer retry whenever `details` is present; rows (b), (c) and (d) must redden. | 6 | F23 · §12A.16 · `05 §6` |
| **C5** | `details` is read only through its named keys. (a) A source-level check finds no string parsing of a message anywhere on a failure path. (b) No retryability is inferred from message wording. (c) No key outside the table is read — asserted against a fixture carrying an extra key that the rendering must ignore. (d) Planted-defect probe: infer retryability from a substring of the message; row (b) must redden. | 4 | F23 · §12A.16 |
| **C6** | The creation-failure presentation recovers the human. (a) Back to review is present and is the **first** tab stop. (b) Try again is present only under the retry rule. (c) The restatement that nothing was sent is present. (d) Focus moves to the error heading, which carries alert semantics. (e) The proposition is intact and structurally equal to what was submitted, and returning to review renders it. (f) The session's status re-derives to ready. (g) The thread receives a failure turn. (h) **Named mutation:** clear the session's proposition on a failed creation; row (e) must redden. | 8 | F5 · F23 · F24 · §12A.15 · §12A.16 · §12A.17 |
| **C7** | The two channels are never merged. (a) A `failed` domain result routed through the error presentation is a defect — asserted by driving a `failed` result and observing the thread's failure turn and the unchanged proposal surface, not the error presentation. (b) An error DTO routed through the thread's failure turn as though it were a run outcome is a defect — asserted by driving an error DTO and observing it render at its stated site, not as a run outcome. (c) Planted-defect probe: route an error DTO through the failure-turn path; row (b) must redden. | 3 | F23 · F16 · §12A.16 |

**Derived totals for this phase:** 7 criteria, 48 rows, named mutations at C2(d), C3(d), C4(f),
C5(d), C6(h), C7(c). Re-derive at dispatch.

## Notes

- **The creation error state is the largest design gap in the specification set** (design 10 §8
  item 1, master plan §11.2 delta 10). Its values are inferred from the attention tokens and its
  copy is placeholder. This phase implements the outline because F2 and F23 require every failure
  to render; the delta is reported, not resolved, and no specification is edited.
- The distinguishable failures are the taxonomy's — validation with its paths shown against the
  review surface, conflict with the existing draft's link, integration failure retryable or not,
  and internal. **Partial creation is not among them** and no branch is added for it.
- Retry as **one rule** rather than a per-code judgement is what lets a backend mark a code
  retryable later with no presentation change. A per-code retry table would look equivalent and
  would rot on the first backend change.

## Review log

*(empty)*
