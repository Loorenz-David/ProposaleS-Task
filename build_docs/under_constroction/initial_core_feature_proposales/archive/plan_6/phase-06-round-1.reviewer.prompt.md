---
plan: 6
role: review
round: 1
date: 2026-09-06
project: initial_core_feature_proposales
phase: Information items, clarification, workflow state, identity
---

# Session prompt — review phase 6 (round 1)

You are the independent **reviewer** for phase 6 of
`initial_core_feature_proposales` in `/Users/davidloorenz/Desktop/Developer/Proposales`.
This is the first implementation review and must be performed by a model other than the
Codex implementer.

Read and follow `/Users/davidloorenz/.codex/skills/plan-reviewer/SKILL.md`,
`/Users/davidloorenz/agent-skills/plan-reviewer.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` first. Apply the repository
`architecture-context` skill before evaluating the diff: read
`.codex/skills/architecture-context/SKILL.md`,
`agent-skills/policy/architecture-context-policy.md`, and route through
`architectural_contracts/01-implementation-contract-guide.md`.

**You review and report; you do not fix production code.** Temporary, applied-and-reverted
mutation probes are permitted only under reviewer doctrine. The phase plan is the task list;
where this prompt differs from it, the phase plan wins.

## 1. Gate check

Stop and report if any condition fails:

1. `planing/proposal-preparation-backend-intention.md` has header status `RATIFIED`.
2. Tracker rows 1–5 are `APPROVED` and row 6 is `REVIEWING`.
3. The phase plan declares exactly **8 criteria, 54 rows, and 5 named mutations**.
4. Checkpoint `760fa45` has subject
   `CHECKPOINT (not approved): phase 06 items clarification state`.
5. The implementation handoff exists at
   `handoffs/implementer/phase-06-round-1.implementer.md` and declares no owner decision.

Record `git status --porcelain`, but do not gate on a clean worktree, a commit SHA, or a file
count. The review-dispatch prompt, the unconsumed implementation handoff, and the tracker state
are coordinator artifacts outside the checkpoint source target; do not modify, stage, revert, or
classify them as phase implementation drift. Preserve the separate frontend worktree boundary.

## 2. Review perimeter and evidence reconciliation

The source target is checkpoint `760fa45`; reconstruct its perimeter only with:

```sh
git diff --name-status 426a743 760fa45
```

It must contain exactly the twelve new phase source/test/fixture files plus only tracker row 6
and an append-only phase-plan Review-log entry. The implementer handoff is deliberately outside
the checkpoint and must not be treated as source drift. No frontend file, `tsconfig.tsbuildinfo`,
integration, UI, route, service, persistence, external call, or agent runtime may have entered
the checkpoint.

Consume the implementation handoff adversarially, not as proof by assertion:

- Re-derive 8 criteria, 54 rows, and 5 named mutations (`C1 0 · C2 1 · C3 1 · C4 0 · C5 1 ·
  C6 1 · C7 1 · C8 0`) from the phase plan.
- Reconcile the 54-row coverage map, the five mutation records, the stated restoration hashes,
  and the one closing stamp: `npm test` 20 files / 278 tests on checkpoint `760fa45`.
- Confirm the three server/domain modules begin with `import "server-only"`, all schemas and
  fixtures remain runtime-neutral, and only application-owned `INFORMATION_REGISTRY` holds policy.
- Treat cited targeted evidence as reusable only when its production tree matches; spend review
  effort on variations that the handoff did not prove.

## 3. Read order

1. Reviewer doctrine and charter, particularly first-review depth, trace-chain discipline,
   evidence reuse, mutation testing, owner-layer reporting, and closing protocol.
2. `master-plan.md` §§4–6.9, 7.2–7.3, 9.0–9.2, and 10.3–10.6.
3. `planing/proposal-preparation-backend-intention.md` §§5.2, 8.1–8.2, 11.3, 17A.1–17A.3,
   17A.6–17A.7, 17A.16, 22 criteria 6/15/17/21, M2/M8/M9/M17/M18, and §23 round 14.
4. `plans/phase-06-items-clarification-state.md` in full, including the projection fold and
   implementation Review-log entry; then the implementation handoff in full.
5. Applicable contracts: `02-runtime-boundaries.md` §§3, 6, 9;
   `03-feature-architecture.md` §§1–4; `04-server-architecture.md` §§4–6;
   `06-data-contracts-and-validation.md` §§1–4 and 6–8;
   `10-security-and-trust-boundaries.md` §§4 and 10;
   `11-testing-principles.md` §§2–3 and 5; applicable runtime/server/data/structure sections
   of `12-anti-patterns.md`; `13-decision-checklist.md` §§1 and 3; and
   `14-documentation-principles.md` §8.
6. The checkpoint diff, all twelve phase files and five phase test files, phase-5 proposition
   schemas/fixtures, and the shared error/value modules the implementation imports.

## 4. First-review checklist and required fresh probes

Re-derive every C1–C8 row against its trace authority. Verify strict caller-held state shape,
the total ten-key record, application-owned policy table, deterministic approvability ordering,
answer binding and left-to-right error precedence, explicit skip semantics, pure item updates,
question/answer caps and strictness, Draft Reference origin validation, byte-bound precedence,
JSON round-trip preservation, and state-derived versioning.

Verify structurally that client-reachable schemas import no Node runtime or server configuration;
domain code has the prescribed server-only boundary; no authority moved into a temporary frontend
shape; and no persistence, transport, integration, agent, or approval-envelope behavior slipped
into this phase. Assess the documentation-impact conclusion under contract 14 §8, but do not
create documentation merely because a file was added.

Run these fresh variations; they are questions, not presumed findings:

1. **Serialization seam.** In addition to the tested `undefined`, pass a `BigInt` and a cyclic
   object to `parseProposalWorkflowState`. Both must become the declared `domain_rule`
   `ValidationError` with the exact JSON-serializable issue, never a thrown native error. Restore
   all probe edits and any test data.
2. **Policy/state trust boundary.** Start with a valid state and attempt to add `askPolicy` or
   `createPolicy` inside one caller-held item. It must fail at the nested item key. Separately
   confirm changing a non-required resolution cannot block C2(d), while a required unresolved
   key alone determines refusal.
3. **Answer precedence and purity.** Exercise a known answer followed by its duplicate, then an
   unknown first answer followed by its duplicate. Verify the declared first-error semantics are
   actually singular and `items` remains unchanged on every throwing path.
4. **Size/strictness boundary.** Build the C7(b) raw oversize object with a valid inner workflow
   state and one unknown `pad`; verify size wins. Then check the maximal conforming fixture has
   two distinct propositions, every actual capped text axis at its cap, its uncapped titles at
   the planned literal, and remains below one MiB after JSON serialization.
5. **Mutation adequacy.** Apply a new defect shape at a site not merely repeated from the
   implementer ledger: replace the `do_not_ask` skip refusal or remove the policy-table join,
   and demonstrate the criterion test that detects it goes red. Restore byte-identically.

Any demanded review coverage must trace to the plan or its cited authority. Do not add source
code, a database, UI, routes, integration behavior, future clarification services, approval
envelopes, or tests that belong to later phases.

## 5. Evidence budget

**L4 budget: exactly one run.** The mandatory current-tree review stamp is `npm test`. Before
it, record the current tree identity (HEAD plus dirty-diff digest), command, and failure-ID
delta. If concurrent non-phase work makes it fail, record a foreign-worktree note, distinguish
it from a phase defect, and do not alter that work.

Run targeted L1/L2 commands and the required variation/mutation probes as needed. Do not repeat
the implementer’s identical focused evidence merely to claim independence. For every probe state
its hypothesis, command, observed result, touched files, and byte-identical restoration
verification. There is no database or other persistent state in scope.

## 6. Closing protocol

1. Append only the technical finding layer — verified surfaces, severity/authority/correction,
   probe declaration, and plan lessons — to the phase Review log.
2. Update only tracker row 6 from `REVIEWING` to `APPROVED` or `CHANGES_REQUESTED`, with date,
   actor, and one-line result.
3. Write `handoffs/reviewer/phase-06-round-1.reviewer.md` with row-schema frontmatter;
   verdict, findings by severity, verified-correct surfaces, evidence, full write perimeter,
   probe declaration, lessons, carry-forward dispositions for any approval notes, and
   `⚠ OWNER DECISIONS REQUIRED (n)` immediately after the opening summary. If none, say so.
4. No architecture graph exists; skip it silently. Do not fix source code and do not create an
   approval commit.

Your final chat message must be the charter owner layer: state of the build, verdict, what
happens next, findings in plain product language, and any owner decision. Point to the handoff
rather than pasting technical artifact prose.
