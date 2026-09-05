---
plan: 4
role: implement
round: 2
date: 2026-09-05
---

# Phase 4 fix implementation — round 2

Work in `/Users/davidloorenz/Desktop/Developer/Proposales` on `main` only. This is a
finding-scoped repair of Phase 4. The plan file is the task list; where this prompt differs,
the plan file wins.

## Gate check

Stop and report without editing if either is false:

1. The intention header is `RATIFIED`.
2. Master-plan tracker row 4 says `IMPLEMENTING` and its note begins `Fix round 2 dispatched`.
3. Phase 4's Review log contains `Coordinator review fold — round 1 (2026-09-05, Codex)` and
   declares `8 criteria / 80 rows / 35 named mutations`.

## Read first

1. `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
   `/Users/davidloorenz/agent-skills/implementation-executor.md`, and
   `/Users/davidloorenz/agent-skills/pipeline-charter.md` — this session's doctrine.
2. `.codex/skills/architecture-context/SKILL.md`, the policy, and the contract guide; classify
   the repair, then read the applicable sections of contracts 02, 03, 04, 06, 07, 10, 11, 12,
   and 14 before changing source.
3. Master plan §§5, 6.4–6.7, 9.2, 10.3, and tracker row 4; phase-4 plan in full, especially
   its amended tasks, criteria, and Review log.
4. The reviewer handoff
   `handoffs/reviewer/phase-04-round-1.reviewer.md`, the vendor `TaxOptions` component in
   `api-documentation/proposales/openapi.json`, and evidence §4 / §8.1 named by the plan.

Do not inspect, modify, stage, or otherwise cross into the frontend worktree/branch. Preserve
the canonical backend ownership and keep this adapter in `src/lib/proposales/`; do not create a
feature root, transport, persistence, price-write, or Phase-14 decision code.

## Required corrections

Resolve all B1–B3 and S1–S8. The following reviewer corrections are quoted verbatim and are
binding:

- B1: “use `mode` in `taxOptionsSchema` and `toProposalReadback`; rebuild the fixture from
  evidence §8.1.”
- B2: “a row that drives `createProposalDraft` with a mapped-but-invalid request and asserts the
  injected `fetch` was never called, plus a call-site named mutation.”
- B3: “one injection per declared location — four unit values + `package_split` + `currency` on
  a block, `currency` + `tax_options` at the proposal root — and a block-schema named mutation
  covering the unit values (MUT-04-3 currently proves only block `currency`).”
- S1: “C3(h) requires `request` to deep-equal `toCreateProposalRequest(input, ctx)`.”
- S2: “a pre-seeded recovered proposal yields no read-back.” Implement the amended master-plan
  surface: `proposals` seeds rows and `proposalReadbacks` seeds their read-backs by UUID.
- S3: “No test asserts `taxOptions` deep-equals `{}` for a read-back without `tax_options`.”
- S4: “The row enumerates ‘block `EUR` / block without currency’; only the equal-currency case
  exists.”
- S5: “C5(c) is uncovered on the client.”
- S6: “four distinct values per block.”
- S7: “delete the file, or add `test/helpers/**/*.test.ts` to the node project.” The coordinator
  selected **delete**: remove `test/helpers/proposales-arithmetic-scan.test.ts`; the collected
  pricing-mapper test remains the scanner evidence home.
- S8: “orphan and colliding test IDs.” Align every affected test description with an amended
  Phase-4 criterion row; do not use phase-3 labels as aliases.

Also resolve review notes N1–N3 exactly as the amended plan states: parse the absent request in
C1(a), document the reserved `proposal_copilot_` prefix and that no unwritten key is interpreted,
and inspect the full `toCreateProposalRequest` + helper source bound for C2(i). N4 is not this
phase; leave `tsconfig.tsbuildinfo` architecture to phase 15/master follow-up 8.

## Allowed write perimeter

Production/test/fixture/docs changes are limited to:

- `src/lib/proposales/{schemas.ts,mappers.ts,mappers.test.ts,client.ts,client.test.ts,fake.ts,fake.test.ts,applied-pricing.mapper.test.ts,README.md}`
- `src/lib/proposales/fixtures/{proposal-search.json,proposal-readback.consistent.json,proposal-readback.inconsistent.json}`
- delete only `test/helpers/proposales-arithmetic-scan.test.ts`

Normal closing artifacts only: tracker row 4, the append-only Phase-4 Review log, this
round's implementer handoff, and this round's checkpoint commit. Do not edit any prior prompt or
handoff, the reviewer handoff, `vitest.config.mts`, `tsconfig.tsbuildinfo`, frontend files, or
any future-phase plan. Anything outside this perimeter is a finding to report, not freedom to
expand.

## Evidence and closing protocol

- Implement every amended row and all **35** named mutations; mutate at the named site, observe
  the named assertion redden, revert, and record the complete ledger. Use L1/L2 for mutation
  proof.
- This session’s L4 budget is **exactly 1 run**: mandatory closing `npm test`, taken on the tree
  handed over. Run `npm run typecheck`, `npm run lint`, and `git diff --check` as required
  non-L4 checks. Do not spend another L4 without a pre-run charter authorization line.
- If a verification tool rewrites the known tracked `tsconfig.tsbuildinfo` artifact, restore only
  that tool-generated file to its pre-run bytes before the clean-tree assertion and say so in the
  handoff. Do not restore or discard any user work.
- Complete the documentation impact review under contract 14 §8; only the integration README
  change required above is expected unless verified behavior reveals another authoritative gap.
- Update only tracker row 4 to `IMPLEMENTED`, append an implementation-round-2 entry to the
  Phase-4 Review log, create
  `handoffs/implementer/phase-04-round-2.implementer.md` with frontmatter and the full write
  perimeter, evidence/tree identity, mutation declaration, 35-row ledger, deviations, and
  documentation result.
- Commit the completed cycle immediately with subject
  `CHECKPOINT (not approved): phase 04 Proposales proposals fix round 2`.
