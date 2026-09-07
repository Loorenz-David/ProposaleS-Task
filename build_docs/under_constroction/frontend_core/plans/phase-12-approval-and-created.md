# Phase 12 — Approval, creating, created and recovered

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Criteria** | 8 |
| **Projection** | **required** — submit-once, envelope identity and terminality are silent-failure mechanisms |
| **Serves** | F22 · F5 · F13 · F19 · F27 · F24 · F10 |

## Goal

Build the approval boundary and the two states that follow it: the human's explicit act
authorises the creation of a **draft** and nothing else; the creating state makes re-entry
structurally impossible; the created and recovered states show what Proposales actually applied,
labelled as such. This phase also completes the close guard with its creation refusal and adds
the browser departure request.

**Not in this phase:** the failure taxonomy's full treatment map and the creation-failure
presentation (phase 13). This phase asserts that a failure returns the intact proposition to
review; phase 13 asserts what each code renders.

## Read first

- Master plan §6.3, §6.4, §9 rules 1 and 5, §10.5.
- Intention §5.8 **in full**, §5.6's approval paragraph, §12A.15 **in full**, §12A.6's refusal
  and departure rules, §12A.12 (Applied Pricing is money), §12A.20 (the editor link), §12A.17
  (the creating, created and failure focus rows), §12A.3 (the status re-derivation on failure),
  §15 owner decisions 8 and 12, ratified boundary 10.
- `ui_design/09-creating-and-created-states.md` in full, including its "Prototype-only"
  blocklist; `ui_design/07-proposal-review.md` §3.6.
- Backend intention §17A.10, §17A.12, §17A.13, §11.3, and backend master plan §6.4
  (`approvalEnvelopeSchema`, `pricingAcknowledgmentSchema`, `draftResultSchema`,
  `appliedPricingSchema`) — cited, never redefined.
- Contracts: `08-agent-architecture.md` §6; `04-server-architecture.md` §8;
  `05-client-architecture.md` §6, §7; `10-security-and-trust-boundaries.md` §5, §10.

## Dependencies

Phase 11 `APPROVED`.

## Files expected to change

```
src/features/proposal-preparation/components/creation/          new — CreatingSurface, CreatedSurface
src/features/proposal-preparation/components/review/            edited — the approval action becomes live
src/features/proposal-preparation/hooks/use-approval.ts         new
src/features/proposal-preparation/hooks/use-close-guard.ts      edited — the creation refusal
src/features/proposal-preparation/hooks/use-departure-guard.ts  new
src/features/proposal-preparation/client/view-models/created.ts new — applied pricing, draft result
```

## Ordered tasks

1. **Submit the proposition the session runtime holds**, not a value reconstructed from a view
   model: the view model is an output of the adapter and is never an input to a submission.
2. **Bind the acknowledgment's statement identity and the wording shown to the human to one
   source**, so a component cannot render one wording and submit a different identity.
3. **Guarantee submit-once by two independent mechanisms**, because either alone is
   insufficient: on entering the creating state the approval control is removed from the tree
   along with the review header, the view toggle and discard, so re-entry has no control to
   activate; and a second approval dispatch for a session that already has an approval turn in
   flight is a no-op, because removing the control is a rendering fact and a double activation
   can fire the handler before the next render.
4. **Read terminality from the state**, never decide it. A session is terminal exactly when its
   workflow state carries a draft reference; a terminal session offers no approval control, no
   inline edit and no edit dispatch, and its proposition stays visible for reference. The browser
   never marks a session terminal on dispatch, on optimistic success, or on a timeout.
5. **Build the creating state** as a single centred working state with one honest label; there is
   no cancel, and no progress step is invented — no V1 result reports steps. The agent surface
   stays live and the operation survives switching, attributed to its own session.
6. **Build the created and recovered states** with the draft's identity labelled and selectable,
   the neutral draft badge, the reassurance that it is a draft and not sent, and the two actions.
   The created state is where money first appears, and every figure is a rendering of a value the
   read-back returned — never assembled from two of them, never what was approved.
7. **Render the editor link exactly as the server returned it**, opening in a new browsing
   context with the new-context relationship attributes, with the fact that it leaves the
   application in its accessible name.
8. **Complete the close guard** with the creation refusal: a close intent while the approval turn
   is in flight is **refused**, not confirmed, until the turn resolves; it shows no confirmation
   and no destructive action, removes no session state, is visible and politely announced, and
   never renders as a silent no-op. It is total over every close and discard path and is
   evaluated on the target session before any list mutation.
9. **Add the browser departure request**: on an attempted reload, browser-tab or window close, or
   navigation away, the page requests the browser's standard departure confirmation **if and only
   if at least one open session is in the approval/execution creating state** — every open
   session, not the active one and not the close-guard predicate.
10. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | The envelope carries what the review surface rendered. (a) The submitted proposition is structurally equal to the value the session runtime holds and the adapter read. (b) It is not built from the review view model — **named mutation:** construct the submitted proposition from the review view model; row (a) must redden. (c) The envelope carries the session's workflow state as returned, unchanged. (d) The envelope carries the pricing acknowledgment. | 4 | F22 · §12A.15 |
| **C2** | The acknowledgment's wording and its submitted identity come from one source. (a) The wording rendered to the human and the identity submitted are read from the same source. (b) **Named mutation:** change the submitted statement identity without changing the rendered wording; the pairing row must redden. | 2 | F22 · §12A.15 · §17A.10 |
| **C3** | Creation cannot be submitted twice. (a) On entering the creating state the approval control, the review header, the view toggle and discard are removed from the tree — four rows. (b) A second approval dispatch for a session with an approval turn already in flight is a no-op. (c) Two activations within one frame produce exactly **one** dispatch. (d) **Named mutation:** remove the dispatch-boundary guard and rely on the control's removal; row (c) must redden. | 4 | F22 · §12A.15 · `04 §8` · `05 §7` |
| **C4** | Terminality is the server's. (a) A session whose workflow state carries a draft reference is terminal. (b) A terminal session renders no approval control. (c) A terminal session renders no inline edit affordance and dispatches no edit operation — two rows. (d) A terminal session's proposition stays visible for reference. (e) The browser never marks a session terminal on dispatch, on optimistic success, or on a timeout — three rows, each asserted by producing that condition without a draft reference and observing the session stay non-terminal. (f) Planted-defect probe: mark the session terminal on dispatch; row (e)'s first row must redden. | 8 | F22 · §12A.15 · §17A.2 |
| **C5** | The creating state is honest and belongs to its session. (a) It renders one centred working state with one label; no progress step sequence is rendered, because no V1 result reports steps — **structurally held** with its named trigger (§14.1 item 4). (b) There is no cancel control. (c) The agent surface stays interactive: the user can switch sessions and read a thread while creation runs. (d) The operation is attributed to the session that started it and its result lands there even when another session is active (phase 05 C1, re-asserted for the approval turn). (e) Focus moves to the state's status heading on entry, and the outcome is announced politely exactly once. (f) Under reduced motion the spinner does not spin and the text carries the meaning. | 6 | F22 · F24 · F5 · §12A.15 · §12A.17 |
| **C6** | The created and recovered states present what Proposales applied. (a) The draft's identity is rendered, labelled and selectable. (b) A neutral draft badge is part of the card's accessible name. (c) The statement that it is a draft and nothing was sent is present. (d) A newly created draft and a recovered one are distinguishable — two rows. (e) Applied Pricing renders **exactly as returned**: every figure is a rendering of one returned value and none is assembled from two of them — asserted against a fixture whose totals and unit values are mutually inconsistent, so a recomputed figure would differ from the returned one. (f) It is labelled as what Proposales applied, to be reviewed in the editor, never as what was approved. (g) When the read-back was unavailable, the closed-enum reason renders, the draft still shows as created, and **no zero is rendered anywhere** in that presentation. (h) The inline-recipient duplicate-contact notice renders when present. (i) Focus moves to the headline on entry, made focusable for that purpose and not left in the tab order; the outcome is announced once. (j) **Named mutation:** render the Applied Pricing total as the sum of the block unit values; row (e) must redden. | 10 | F5 · F19 · F24 · §12A.12 · §12A.17 · §17A.12 |
| **C7** | The editor link is the server's URL. (a) The rendered href is character-identical to the server-returned URL — asserted by comparing characters, not by parsing and re-serialising. (b) It is never constructed from an identifier and a base, never rewritten, appended to, normalised or re-encoded — **named mutation:** build the href from the identifier and a base constant; row (a) must redden. (c) It opens in a new browsing context so the page-lifetime workspace survives. (d) It carries the new-context relationship attributes. (e) The fact that it leaves the application is part of its accessible name. (f) The presentation adds no second origin validation and no fallback. | 6 | F27 · F5 · §12A.20 |
| **C8** | The creation refusal and the departure request are total. (a) While a session's approval turn is in flight, a close intent on that session is **refused**: no confirmation is shown, no destructive action is offered, and no session state is removed — three rows. (b) The refusal is total over every close and discard path phase 05 C6(a) enumerated — one row per path. (c) It is evaluated on the **target** session before any list mutation, so a refused last-session close creates no replacement and removes nothing. (d) The refusal is **visible**: the control states that the session cannot be closed while its draft is being created, announced politely, and never renders as a silent no-op. (e) Once the turn resolves, the ordinary predicate applies to the returned state. (f) The browser departure confirmation is requested **if and only if at least one open session is in the creating state** — four rows: no session creating; the active session creating; a **non-active** session creating; a session terminal but not creating. (g) It is not requested for a composer draft, for other meaningful work, for a non-approval in-flight turn, or for a terminal session — four rows. (h) **Named mutation:** replace the creation-close refusal with a confirmation; row (a) must redden. (i) **Second named mutation:** test only the active session for creation; the non-active-creating row of (f) must redden. | 13 | F13 · F22 · §12A.6 · owner decisions 8 and 12 |

**Derived totals for this phase:** 8 criteria, 53 rows, named mutations at C1(b), C2(b), C3(d),
C4(f), C6(j), C7(b), C8(h), C8(i). Re-derive at dispatch.

## Notes

- **A failed creation returns the intact proposition to review**, structurally equal to what was
  submitted, with the status re-derived to ready by the precedence chain's fourth row. This
  phase asserts the return and the re-derivation; phase 13 asserts what the failure renders.
- **The departure request creates neither persistence nor a recovery guarantee.** The browser
  owns the confirmation's wording and whether its platform permits it; a departure the user
  confirms still destroys the workspace, and the in-flight request is neither cancelled nor
  reconstructed.
- Design 09's fake timed progress sequence, its hardcoded identifiers, its display string with an
  editorial suffix baked in, its `view: "pushing" | "success"` flags, its snapshot machinery, and
  its "Open in Proposales" wired to a fake internal list are all prototype-only.
- **Partial creation is not a state the backend can produce** (one create, one read-back that
  never downgrades a success), which answers design 09's open question 8. No presentation branch
  exists for it and none is added.
- Design 09's open questions 1 and 5 (the error state's values and copy; what happens to the
  session after creation) are recorded deltas; question 6 is answered — a created draft is not
  revised from here, and Proposales is the editing environment after handoff.

## Review log

*(empty)*
