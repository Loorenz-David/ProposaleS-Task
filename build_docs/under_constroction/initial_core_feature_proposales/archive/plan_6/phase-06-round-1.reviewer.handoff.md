---
plan: 6
role: review
round: 1
verdict: CHANGES_REQUESTED
date: 2026-09-06
actor: Claude
---

# Phase 6 review handoff — round 1 (independent first review)

## Summary

Checkpoint `760fa45` was reviewed against the phase plan, the intention's mechanism contracts, and the
applicable architecture contracts. The perimeter is exact, the counts re-derive, the trace chain closes in
both directions, and every behavioural claim I probed held — including several the criteria never named.
**No blocking finding.** Two rows, however, are guards that cannot fail: C5(e) and C2(g) each stay green
under a mutant that destroys the exact property they exist to assert, both proven by applied-and-reverted
probes. Verdict `CHANGES_REQUESTED` on those two rows plus four notes; no production behaviour changes.

## ⚠ OWNER DECISIONS REQUIRED (0)

Nothing needs the owner. Both should-fix items are contained test-fixture corrections inside this phase's
own files, and the one measurement that could have been a product decision — whether the 1 MiB workflow-state
ceiling actually clears a maximally conforming state — I measured directly and it does (686,415 B of
1,048,576 B, 65.5 %).

## Gate check

| # | Condition | Result |
|---|---|---|
| 1 | Intention header status | `RATIFIED` (2026-09-05, owner) ✓ |
| 2 | Tracker rows 1–5 `APPROVED`, row 6 `REVIEWING` | ✓ (row 6 now `CHANGES_REQUESTED`) |
| 3 | Plan declares 8 criteria / 54 rows / 5 named mutations | ✓ re-derived, see below |
| 4 | Checkpoint `760fa45` subject | `CHECKPOINT (not approved): phase 06 items clarification state` ✓ |
| 5 | Implementation handoff exists, declares no owner decision | ✓ `handoffs/implementer/phase-06-round-1.implementer.md`, `⚠ OWNER DECISIONS REQUIRED (0)` |

`git status --porcelain` at session start: empty. Recorded, not gated on.

## Perimeter and count re-derivation

`git diff --name-status 426a743 760fa45` returns exactly:

- twelve new phase files — `schemas/information-items.ts`, `schemas/clarification.ts`, `schemas/workflow-state.ts`,
  `fixtures/states.ts`, `server/domain/information-registry.ts`, `server/domain/approvability.ts`,
  `server/domain/bump-version.ts`, plus the five matching `.test.ts` files;
- `master-plan.md` (tracker row 6 only) and `plans/phase-06-items-clarification-state.md` (append-only Review log).

No frontend file, no `tsconfig.tsbuildinfo`, no route, service, persistence, integration, or agent runtime
entered the checkpoint. `src/` at HEAD `22c7cde` is byte-identical to `760fa45` (`git diff --stat 760fa45 HEAD -- src/`
empty). The separate `Proposales-frontend` worktree at `c0e9f81` was neither read into scope nor modified.
The implementer handoff and the review-dispatch prompt sit outside the checkpoint by design and were not
treated as drift.

Counts re-derived from the plan table, not consumed from the handoff:

- **Criteria: 8** (C1–C8).
- **Rows: 54** — C1 11 (a–j span + k) · C2 7 · C3 8 · C4 5 · C5 9 · C6 6 · C7 4 · C8 4.
- **Named mutations: 5** — `C1 0 · C2 1 · C3 1 · C4 0 · C5 1 · C6 1 · C7 1 · C8 0`, matching the dispatch prompt.
- **Trace chain:** 54 tests across five files, each named for its row. No orphan test, no candidate criterion.
  The handoff's reverse-map claim checks out.

The handoff was consumed adversarially: its five mutation records and 54-row map were spot-verified but not
taken as proof, and review effort went to variations it did not run.

## Findings

### Blocking — none.

### Should-fix

**S1 — C5(e) cannot fail for the reason it exists.**
`schemas/workflow-state.test.ts:63–67`. The row's declared fixture is "state with `{ known: false }` leaves"
and its trace is **M9**, whose objective is that a no-sourced-value leaf *survives a JSON round-trip unchanged*.
The shipped fixture is `validState({ items: { …, language: { resolution: "unresolved" } } })`, whose keys are
exactly `generationId`, `brief`, `items` — no proposition, and no `"known":false` substring anywhere in its
serialized form. Probe **P9** collapsed every `{ known: false }` arm to `{}` on parse (`schemas/shared.ts`,
`sourcedOrAbsent`) and **all 19 `workflow-state.test.ts` tests stayed green, C5(e) included**; a state carrying
such leaves reddened under the identical mutant. Authority: plan C5(e); intention M9; §17A.3; charter rule 15.
Correction: build C5(e) from `validState({ preparedProposition, currentProposition })` where both propositions
carry `{ known: false }` on the recipient object, on one `SourcedOrAbsent` block leaf (`quantity` or `optional`),
and on one top-level leaf (`title` or `agentRationale`); keep the existing deep-equality assertion.

**S2 — C2(g)'s "sorted" expectation is order-degenerate.**
`server/domain/approvability.test.ts:60–67`. The row unresolves `title` and `language`, which sit in the same
relative order under `INFORMATION_ITEM_KEYS` enum order and under lexical order, so `["language","title"]`
holds with or without the sort. Probe **P10** deleted `.sort()` at `server/domain/approvability.ts:12` and
**all 7 `approvability.test.ts` tests stayed green**. A discriminating pair — `title` + `block_selection`,
enum order `["title","block_selection"]` versus lexical `["block_selection","title"]` — is green on the shipped
code and red under the same mutant (both observed). Authority: plan C2(g) and task 3; §17A.6; charter rule 15.
Correction: unresolve `title` + `block_selection`, or all three required items; keep the exact expected array.

### Notes

**N1 — C3(f)'s unknown-before-duplicate precedence is unreachable, not merely untested.**
Probe **P6** swapped the two checks in `applyAnswers` and all 19 registry tests stayed green. Probe **P3**
explains why no fixture could separate them: an unknown id always throws at its *first* occurrence, so no id
can ever be simultaneously unknown and a repeat. The implementation is correct and no correction is possible
in code. Plan lesson: retire the precedence clause in task 2 / C3(f) as vacuous, or restate C3(f) as what it
actually measures — the first offending entry decides, by index.

**N2 — `maximalConformingState()` is 6.1 % of the byte bound, not maximal.**
Measured 64,007 B against `MAX_WORKFLOW_STATE_BYTES` = 1,048,576. Grown to `MAX_BLOCKS` (30) blocks ×
`MAX_ALTERNATIVES_PER_BLOCK` (3) alternatives on both propositions with every text at cap, the same state is
686,415 B (65.5 %) and still parses — so §17A.3's claim that the brief cap *and the per-block alternative cap*
keep a maximally conforming two-proposition state under the bound **holds**, with a real margin of 1.53×
rather than the 16× C7(c) certifies. Plan task 7 specified text caps only, so this is a plan gap, not an
implementation deviation. Carry-forward: **phase 10**.

**N3 — dead policy enums.** `informationItemAskPolicySchema` and `informationItemCreatePolicySchema`
(`schemas/information-items.ts:19–20`) have no consumer anywhere in `src/`, while `INFORMATION_REGISTRY`
(`server/domain/information-registry.ts:8`) hand-writes the same two unions inline — one vocabulary, two
declarations. Charter rule 4. Correction: type the registry from `z.infer` of those schemas, or delete them.
May ride with the S1/S2 round.

**N4 — `nextVersion` is exercised on hand-built records.** `bump-version.test.ts:23,28` pass
`validState(…) as never`, and C8(c)'s `currentProposition: { version: 4 }` is not a parseable proposition
(charter rule 3). Behaviour is unaffected — `nextVersion` reads only `currentProposition.version`, verified
structurally — and the plan row specifies this fixture. Correction if taken: `validProposition({ version: 4 })`.

## Verified-correct surfaces

- **C1(a–k).** `INFORMATION_REGISTRY` equals the §17A.6 table row for row; `Object.keys` set-equals the ten-key enum.
- **C2 approvability, re-derived beyond the criteria.** Probe P2 ran the full 10-key × {`unresolved`,
  `deferred_by_user`} matrix: exactly `language`, `title`, `block_selection` refuse, on both non-supplied
  resolutions; every non-required key is inert on both. This covers the deferred-required case no criterion
  names, and matches §17A.6's "refused iff `createPolicy === required_to_create` and resolution ≠ `supplied`".
- **Policy/state trust boundary.** `askPolicy` / `createPolicy` smuggled into a caller-held item fail at
  `["items","<key>","askPolicy"]` / `…,"createPolicy"]`, and `evaluateApprovability` reads policy only from the
  application-owned table. §17A.6's ownership rule holds structurally, not just behaviourally.
- **`applyAnswers` purity.** Verified on the success path and on all three throwing paths — unknown id,
  duplicate id, do-not-ask skip — including a batch that applies two entries before throwing at index 2.
  `items` deep-equals its pre-call value every time, and each throw carries exactly one issue.
- **Serialization seam, fail-closed.** `BigInt` and a cyclic object both produce the exact declared
  `domain_rule` `ValidationError` with `[{ path: [], message: "workflow state must be JSON-serializable" }]`
  and never a native throw. A function-valued key — which `JSON.stringify` silently drops — still fails closed
  at `["fn"]`, because the schema parses `raw` rather than the serialized string.
- **Byte bound.** Size precedence holds with a valid inner state plus one unknown `pad`; a state exactly one
  byte over the bound with no unknown key refuses with `workflow_state_too_large` (1,048,577 B measured).
- **Draft Reference.** `http`, foreign origin, port-shifted same host, uppercase uuid, and a malformed URL each
  fail at the declared path as a `ValidationError`, never a thrown `TypeError`. Contract 10 §10 satisfied.
- **Runtime neutrality, structural.** No `server-only`, `process.env`, `"use client"`, or React import anywhere
  under `schemas/` or `fixtures/`; all three `server/domain/` modules open with `import "server-only"`.
  Contracts 02 §§3, 5; 06 §4. No authority moved into a temporary frontend shape.
- **Phase boundary.** No persistence, transport, integration, agent, or approval-envelope behaviour is present.
- **Fresh mutation adequacy at sites outside the implementer ledger.** Removing the `do_not_ask` skip refusal
  reddens exactly C3(g); removing the policy-table join in `evaluateApprovability` reddens C2(c) and C2(d).
- **Documentation impact (contract 14 §8).** "No change required" is correct: no feature README exists, the
  root README makes no claim this phase falsifies, `src/lib/proposales/README.md` is untouched by this surface,
  and phase 15 owns documentation closeout. No documentation was created merely because files were added.

## Evidence

**L4 budget: exactly one run.** Authorisation recorded before execution — the reviewer's tree differs from the
implementer's stamp tree, so charter L4(b) requires the stamp.

| Field | Value |
|---|---|
| Hypothesis | The checkpoint's full suite is green on the reviewer's tree; failure-ID delta ∅ → ∅ |
| Tree identity | HEAD `22c7cde`, `git status --porcelain` empty; `src/` identical to checkpoint `760fa45` |
| Command | `npm test` |
| Result | 20 test files / 278 tests passed, 1.32 s |
| Delta | ∅ → ∅ against the implementer's closing stamp (20 files / 278 tests at `760fa45`) |

No foreign-worktree interference: the suite is byte-identical in scope to the implementer's, and the frontend
worktree contributes no files to it.

Targeted L1 runs plus ten probes supplied every other observation. Cited implementer evidence whose production
tree matches mine was consumed by citation and not re-executed.

## Probe declaration

Every probe states hypothesis → command → observation, and every touched tracked file was restored and verified.

| Probe | Hypothesis | Command | Observation |
|---|---|---|---|
| P1 | `BigInt` / cyclic / function-valued raw states fail closed | probe file | Both produce the exact declared `domain_rule` issue; function key fails closed at `["fn"]` |
| P2 | Policy keys cannot enter caller state; only required items gate approval | probe file | Nested-key rejection at the exact path; full 20-case approvability matrix as declared |
| P3 | First-error semantics are singular; `items` untouched on every throwing path | probe file | One issue per throw at the declared index; `items` deep-equal before/after in all four cases |
| P4 | Size wins over strictness; the maximal fixture is genuinely maximal | probe file | Size precedence holds; 1-byte-over refuses; fixture is 64,007 B (6.1 %), true maximum 686,415 B (65.5 %) |
| P5 | C5(e)'s fixture contains the `{known:false}` leaves it names | probe file | It contains none, and no proposition at all |
| P6 | Swapping the unknown/duplicate checks changes an observable outcome | `vitest run …/information-registry.test.ts` | All 19 green — no input can order them (→ N1) |
| P7 | Removing the `do_not_ask` skip refusal reddens its criterion | `vitest run …/information-registry.test.ts` | C3(g) red, 18 green — bites exactly |
| P8 | Removing the policy-table join reddens its criteria | `vitest run …/approvability.test.ts` | C2(c) and C2(d) red |
| P9 | Destroying `{known:false}` preservation reddens C5(e) | `vitest run …/workflow-state.test.ts` | All 19 green (→ S1); a leaf-carrying state reddens |
| P10 | Removing `.sort()` reddens C2(g) | `vitest run …/approvability.test.ts` | All 7 green (→ S2); the discriminating pair reddens |

**Restoration.** Probe-touched tracked files, all confirmed byte-identical afterwards by `git status --porcelain`
returning empty and by SHA-256: `server/domain/information-registry.ts` `5e30f500…a149b4` (P6, P7),
`server/domain/approvability.ts` `44e9b51f…e05f33c8` (P8, P10 ×2), `schemas/shared.ts` (P9). One untracked probe
file, `src/features/proposal-preparation/schemas/zz-review-probe.test.ts`, was created and deleted twice and is
absent from the tree. No database or other persistent state is in scope. No architecture graph exists; no delta.

## Full write perimeter

- `plans/phase-06-items-clarification-state.md` — Review log, append only.
- `master-plan.md` — tracker row 6 only (`REVIEWING` → `CHANGES_REQUESTED`).
- `handoffs/reviewer/phase-06-round-1.reviewer.md` — this file.

No source file was fixed, no approval commit was created. **Coordinator action needed:** `master-plan.md` line 11
still reads "phase 6 `REVIEWING`" in the header summary; that line is outside a reviewer's row-6 perimeter, so I
left it. It needs the coordinator's edit.

## Carry-forward dispositions

| Item | Disposition |
|---|---|
| S1, S2 | Fix round 2 of phase 6. Both are fixture corrections in this phase's own test files; no production change. |
| N1 | Plan amendment in the same round — retire or restate the C3(f) precedence clause. Coordinator's call whether the row survives. |
| N2 | **Phase 10**, where §6.7 gives `maximalConformingProposition()` its owner. Re-point C7(c) at it and re-assert the byte comparison. The measured headroom (686,415 B of 1,048,576 B) is recorded so it need not be re-derived. |
| N3 | Optional, may ride with the fix round. If declined, record the reason — the duplicate vocabulary is what would drift. |
| N4 | Optional, may ride with the fix round. No behavioural risk. |

## Lessons for the plans

1. **Two of eight criteria shipped a row whose fixture cannot exhibit the condition it names**, and both were
   *ordering or preservation* claims — C2(g) "sorted", C5(e) "survives a round trip". Neither carried a named
   mutation; all five rows that did carry one bit correctly. The cheap mechanism: require a named mutation on
   every row asserting an ordering or a preservation property, not only on the rows the planner happened to pick.
2. **A precedence rule was specified between two conditions that no input can order.** The projection ledger
   routed C3(f)'s precedence as a precision item without first asking whether the two conditions are jointly
   reachable. Reachability is a cheaper question than precision and belongs before it.
3. **"Maximal" was specified by adjective on one axis and silence on another.** Task 7 said "every bounded text
   is at its cap" while the authority it serves (§17A.3) names the *per-block alternative cap*. Charter rule 5
   applies to fixtures as much as to mechanisms: enumerate the axes.
