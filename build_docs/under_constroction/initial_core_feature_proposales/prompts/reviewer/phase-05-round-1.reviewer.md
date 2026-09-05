---
plan: 5
role: reviewer
round: 1
date: 2026-09-06
project: initial_core_feature_proposales
phase: Proposition schema and structural provenance
---

# Session prompt — review phase 5 (round 1)

You are the independent **reviewer** for phase 5 of
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
2. Tracker row 4 is `APPROVED` and row 5 is `REVIEWING`.
3. Checkpoint `32435e5` resolves with parent `ba1aeea`; it has subject
   `CHECKPOINT (not approved): phase 05 proposition and provenance`.
4. The implementation handoff exists at
   `handoffs/implementer/phase-05-round-1.implementer.md` and declares no owner decision.

Record `git status --porcelain`, but do not gate on a clean worktree or a file count. The
review-dispatch prompt, the unconsumed implementer handoff, and the tracker state are
coordinator artifacts outside the checkpoint source target; do not modify, stage, revert, or
call them phase implementation drift.

## 2. Review perimeter and evidence reconciliation

The source target is checkpoint `32435e5`. Reconstruct the implementation perimeter only with:

```sh
git diff --name-status ba1aeea 32435e5
```

It must contain exactly the eight new phase source/test/fixture files plus only tracker row 5
and an append-only phase-plan Review-log entry. `8601d69` adds the handoff only and must not
change the source target. No frontend worktree or temporary frontend VM is in scope.

Consume the implementer handoff adversarially, not as proof by assertion:

- Re-derive 8 criteria, 61 rows, and 21 named mutations (`C1 0 · C2 15 · C3 2 · C4 0 · C5 2
  · C6 0 · C7 0 · C8 2`) from the phase plan.
- Confirm the declared 15 consequential descriptors are complete and independently constructed
  at the named production sites; the two initially mis-sited assumption probes are historical
  false-green measurements and not evidence.
- Treat the cited targeted 61-test run and typecheck/lint as implementation evidence only when
  the production tree matches. The prior full-suite stamp is not your L4 review stamp.
- Confirm no `tsconfig.tsbuildinfo`, frontend file, integration, UI, runtime, workflow-state,
  persistence, price-write, or content-candidate behavioral test entered the checkpoint.

## 3. Read order

1. Reviewer doctrine and charter, particularly first-review depth, trace-chain discipline,
   evidence reuse, mutation testing, owner-layer reporting, and closing protocol.
2. `master-plan.md` §§4–6.8, §9 rules 1 and 14, §11.2, and phase-4 carry-forward notes N4–N6.
3. `planing/proposal-preparation-backend-intention.md` §§7–9, §17A.1, §17A.4–§17A.5,
   §17A.12, §17A.16, §23, and measurement ledger M1, M9, and M10.
4. `plans/phase-05-proposition-and-provenance.md` in full, including all criteria, Notes, and
   Review log; then the implementer handoff.
5. Applicable contracts: `02-runtime-boundaries.md` §3; `03-feature-architecture.md` §§1–4;
   `06-data-contracts-and-validation.md` §§1–4 and 6–7; `08-agent-architecture.md` §§4 and
   6–7; `11-testing-principles.md` §§2–3 and 5; relevant Data/agent/structure sections of
   `12-anti-patterns.md`; `13-decision-checklist.md`; and `14-documentation-principles.md` §8.
6. The checkpoint diff, all eight phase files, their tests, the five shared value modules, and
   `src/lib/proposales/mappers.ts` only for the explicitly required int64 integration probe.

## 4. First-review checklist and required fresh probes

Re-derive every C1–C8 row from its authority. Verify that proposition input is strict, derived
provenance is excluded from it, schemas are runtime-neutral, and only the projector is
server-only. Verify the feature remains under the canonical
`src/features/proposal-preparation/` root and that no new client/server or external-integration
edge has been introduced.

Check all three source-policy builders structurally, not only their happy paths: content must
require `ref.variationId`; only the human member applies `turnId ⇒ quote`; `refSchema` itself
remains unrefined; `sourcedOrAbsent` extends actual source-union members rather than creating a
nested `value` or a parallel source representation. Exercise strictness at nested proposition
objects and ensure all 15 consequential leaves exclude `inferred` while every listed
presentational leaf accepts it. Verify `known:false` is explicit and produces no projected
entry. Check warning `text` is projected but recursive bare `before`/`after` payloads cannot
smuggle a sourced object and are never traversed.

The following fresh variations are required because the handoff does not prove them:

1. **Commercial-note cap:** start from `validProposition()`, retain a valid
   `commercialNotes[0].text` sourced wrapper, and set its inner `value` to exactly
   `MAX_NOTE_TEXT_CHARS + 1`. The parse must fail for the cap rather than because the wrapper
   shape is invalid. Determine whether C6(d)'s existing assertion actually proves this.
2. **Provenance boundary:** use a parsed valid proposition containing nested warning payloads
   with an own `source` key at more than one depth. It must reject them; a valid bare nested
   payload must parse and yield no `warnings.*.before`/`.after` projection. Check the flat
   projection has one entry per declared sourced leaf, with source and optional ref preserved,
   no accidental duplicates, and decimal index ordering rather than lexical ordering.
3. **Int64 execution seam:** phase 5 deliberately accepts the ratified maximum content ID
   `9223372036854775807`; trace that accepted value through the already-shipped
   `src/lib/proposales/mappers.ts` create-request mapping. Determine whether conversion to a
   JavaScript number preserves the exact identifier. If it cannot, classify the resulting
   cross-phase contract breach by actual consequence and cite the authority; do not silently
   narrow the phase-5 contract or change production code.
4. **Mutation adequacy:** independently vary a construction site not re-used by the
   implementer's test shape (especially a commercial-assumption member or a recipient leaf)
   and a projector traversal/comparator site. The target criterion must go red and all probe
   edits must be restored byte-identically.

Do not add information items, workflow state, ranking, an agent output schema, edit/approval
flows, an API route, a database, price fields, live network calls, or behavioral tests for
`contentCandidateSchema`; the latter is deliberately phase 7 C7(d).

## 5. Evidence budget

**L4 budget: exactly one run.** The mandatory current-tree review stamp is `npm test`.
Before it, record the current tree identity (HEAD plus dirty-diff digest), command, and
failure-ID delta. If concurrent non-phase work makes it fail, record a foreign-worktree note,
distinguish it from a phase defect, and do not alter that work.

Run targeted L1/L2 commands and the required variation/mutation probes as needed. Do not repeat
the implementer's identical L4 or targeted evidence merely to claim independence. For every
probe state its hypothesis, command, observed result, touched files, and byte-identical
restoration verification. There is no database or other persistent state in scope.

## 6. Closing protocol

1. Append only the technical finding layer — verified surfaces, severity/authority/correction,
   probe declaration, and plan lessons — to the phase Review log.
2. Update only tracker row 5 from `REVIEWING` to `APPROVED` or `CHANGES_REQUESTED`, with date,
   actor, and one-line result.
3. Write `handoffs/reviewer/phase-05-round-1.reviewer.md` with row-schema frontmatter;
   verdict, findings by severity, verified-correct surfaces, evidence, full write perimeter,
   probe declaration, lessons, carry-forward dispositions for any approval notes, and
   `⚠ OWNER DECISIONS REQUIRED (n)` immediately after the opening summary. If none, say so.
4. No architecture graph exists; skip it silently. Do not fix source code and do not create an
   approval commit.

Your final chat message must be the charter owner layer: state of the build, verdict, what
happens next, findings in plain product language, and any owner decision. Point to the handoff
rather than pasting technical artifact prose.
