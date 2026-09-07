# Phase 16 — Browser-to-server boundary

| | |
|---|---|
| **State** | `NOT_STARTED` |
| **Gate** | **backend phases 11–14 `APPROVED` and merged into this branch** |
| **Criteria** | 5 |
| **Projection** | waivable |
| **Serves** | F7 · F8 · F2 · F21 · F23 |

## Goal

Add the thin, validated browser-to-server boundary the UI needs to reach real backend services:
it validates every input as untrusted, calls the real services which remain authoritative, and
returns expected failures as data the UI renders intentionally.

**Not in this phase:** any backend service, schema, or domain rule. The boundary calls them,
never the reverse, and never alters them. Rebinding the surfaces to production adapters is
phase 17.

## Gate — check before anything else

Stop and route back to the coordinator if any row fails.

| # | Check | Passes when |
|---|---|---|
| 1 | Backend turn services exist | backend master plan §4 shows phases 11, 12, 13 and 14 `APPROVED` |
| 2 | They are merged here | those services are present in this worktree on this branch, and the merge is recorded in the master plan's gate log |
| 3 | Phase 15 closed | the frontend tracker shows phase 15 `APPROVED` |

Backend phases that are not approved are not a reason to define, extend, or stand in for a
backend contract. If the gate fails, the project waits at phase 15.

## Read first

- Master plan §5 (contract 04 §3 and §6 bind here), §9, §10.5, §11.1's gate log.
- Intention §10.3 **in full**, §4 (the deployment-protection constraint), §11's boundary
  outcomes, §12A.1 (F8's real half), §12A.16, §13 conflict **C-5**, §15 owner decision 4.
- Backend master plan §6.6 (the service signatures as merged) and §6.9 (the two caller-held
  objects) — cited, never redefined.
- Contracts: `04-server-architecture.md` §3, §6, §7; `02-runtime-boundaries.md` §4, §6;
  `06-data-contracts-and-validation.md` §2, §3, §8; `10-security-and-trust-boundaries.md` §3,
  §4, §5; `03-feature-architecture.md` §4.

## Dependencies

Phase 15 `APPROVED`, **and** the gate above.

## Files expected to change

```
src/features/proposal-preparation/server/actions.ts     new — "use server", one export per turn
src/features/proposal-preparation/hooks/use-turn-dispatch.ts   edited — dispatch calls the action
src/features/proposal-preparation/client/view-models/*  edited — adapters take the real result
```

`server/` in this feature is otherwise backend-owned. This phase adds the transport file the
backend's plan deliberately left out (backend master plan R3) and touches nothing else there.

## Ordered tasks

1. **Write each action thin**: accept `unknown`, parse with the merged feature schema, call one
   service, return a discriminated result. Never throw for an expected failure; never type the
   parameter as the trusted shape.
2. **Treat every Server Action as a public endpoint** (contract 10 §3). Browser input stays
   untrusted regardless of what the client validated.
3. **Return expected failures as data** in the error-DTO shape the UI already renders, so phase
   13's treatment map binds unchanged.
4. **Keep the boundary transport-only.** No business rule, no loop over external calls, no
   switch over an action name, and no integration import. The backend services stay
   transport-independent and authoritative.
5. **Enforce the exposure rule** (owner decision 4): where the deployment lacks the
   platform-level protection intention §4 and §10.3 require, live mutation actions are not
   exposed. This is an operational access boundary and never application authorization — the
   server boundary still parses, validates and enforces every contract on every request.
6. **Prove F8's real half**: the generation id the client submits is character-identical to the
   one the server returned, and no client-generated identifier appears anywhere in a submitted
   payload. This converts phase 03 C1(c)'s structurally held row.
7. Closeout: contract 14 §8's impact review, tracker row, Review log.

## Acceptance criteria

| # | Criterion | Rows | Trace |
|---|---|---|---|
| **C1** | Every action treats its input as untrusted. (a) Each action's parameter is `unknown` and is parsed before use — one row per action. (b) A malformed payload is rejected with field paths rather than being stripped or coerced. (c) A payload the client believed valid is still parsed on the server — asserted by sending a payload that passes a client-side check and fails the schema. (d) An action never throws for an expected failure; it returns a discriminated result. | 4+ | F7 · F2 · `04 §3` · `06 §2` |
| **C2** | The boundary is thin and calls the services. (a) Each action parses, calls **one** service, and maps the result — one row per action, asserted against a fake service. (b) No business rule, retry loop, or integration import appears in the boundary. (c) No `"use server"` directive appears on a service, domain or integration module. (d) No integration client is reachable from the browser — asserted by the client-graph check phase 15 C5 established, re-run against the new module. | 4+ | F7 · `04 §3` · `02 §4` |
| **C3** | Failures cross as data and render at their sites. (a) A validation failure returns field paths, and the UI renders them at those paths element-wise — the phase 11 C4 rows, now over the real boundary. (b) Each error code the boundary can return renders its phase 13 treatment unchanged — asserted per code against the merged taxonomy. (c) No known code's message is replaced at the boundary. (d) No raw upstream body, stack trace, secret, or internal URL appears in any returned message or detail. | 4+ | F23 · F2 · `04 §6` · `10 §7` |
| **C4** | Live mutation exposure follows the deployment rule. (a) Where the deployment-protection condition intention §10.3 states is not satisfied, the live mutation action is not exposed — asserted by constructing the configuration explicitly, never by reading a real environment. (b) Where it is satisfied, the action is exposed and still parses, validates and enforces every contract. (c) The protection is never treated as application authorization: browser input is untrusted in both rows. (d) Planted-defect probe: expose the mutation under the unprotected configuration; row (a) must redden. | 4 | F7 · §10.3 · `10 §3` · owner decision 4 |
| **C5** | The two identifiers stay separate over a real submission — phase 03 C1(c)'s held row, converted. (a) For a session whose first turn has returned, the generation id the client submits is **character-identical** to the value the server returned, asserted by equality with that value and not by a format check. (b) No client-generated identifier appears anywhere in a submitted payload — asserted over the whole payload, not over a named position. (c) The workflow state is returned to the server unchanged, asserted by structural equality with what was received. (d) **Named mutation:** submit the page-lifetime session id in the generation-id position; row (a) must redden. | 4 | F8 · §12A.1 |

Rows marked `4+` are one row per action plus the stated rows; the exact count is derived at
dispatch from the service set that actually merged, because that set is the backend's and is not
known while this plan is written.

## Notes

- **This plan is deliberately thin and is refined at prompt time.** The boundary's concrete form,
  location and signatures are planning decisions within what the ratified contracts already fix
  (intention §14.3 item 5), and the service signatures it calls are the backend's and will be
  known only when they merge. Refining it then is the system working; guessing them now would be
  the fixture-promoted-to-contract defect this project exists to avoid.
- **Streaming is not in V1** (§14.1 item 4). The boundary carries turns, not streams.
- The backend's v1 deliberately exposes no transport (backend §16.2, master plan R3) and that is
  not an oversight to correct: this phase adds the application's own boundary and leaves the
  services transport-independent.

## Review log

*(empty)*
