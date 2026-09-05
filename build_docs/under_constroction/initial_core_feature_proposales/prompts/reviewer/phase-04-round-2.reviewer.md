---
plan: 4
role: review
round: 2
date: 2026-09-05
---

# Phase 4 delta re-review — round 2

Review in `/Users/davidloorenz/Desktop/Developer/Proposales` on `main` only. This is a delta re-review after fix round 2, not a new full review. Do not modify production code, tests, fixtures, or prior artifacts.

## Gate check

Stop and report without editing if either is false:

1. The intention header is `RATIFIED`; tracker rows 1–3 are `APPROVED`.
2. Tracker row 4 is `REVIEWING` and its note begins `Fix round 2 checkpoint`.
3. The Phase-4 plan Review log contains both independent-review round 1 (`CHANGES_REQUESTED`) and implementation round 2 (`IMPLEMENTED`), and the current plan declares 8 criteria / 80 rows / 35 named mutations.
4. Checkpoint `d937fe8` and provenance commit `23a096e` exist; the implementation handoff is present at `handoffs/implementer/phase-04-round-2.implementer.md`.

## Read first

1. `/Users/davidloorenz/.codex/skills/plan-reviewer/SKILL.md`, `/Users/davidloorenz/agent-skills/plan-reviewer.md`, and `/Users/davidloorenz/agent-skills/pipeline-charter.md` — this session's doctrine.
2. `.codex/skills/architecture-context/SKILL.md`, the policy, and contract guide; classify this review and read applicable sections of contracts 02, 03, 04, 06, 07, 10, 11, 12, and 14.
3. Master plan §§5, 6.4–6.7, 9.2, 10.3, and tracker row 4; the Phase-4 plan in full; the initial reviewer handoff and the round-2 implementer handoff.
4. Vendor `TaxOptions` in `api-documentation/proposales/openapi.json` and the evidence sections named by the Phase-4 plan.

## Review history and verified perimeter

Round 1 settled the server-only integration placement, omission-by-spreads, exact metadata, recovery request, status rules, money/currency ownership, arithmetic scanner, and the original 17-path implementation perimeter. It found B1–B3 and S1–S8. Review only the repair seam plus bounded regressions; report anything newly seen wrong under the passing-glance rule.

Verify implementation delta `00fe990..d937fe8`. It should contain only:

- `src/lib/proposales/{schemas.ts,mappers.ts,mappers.test.ts,index.ts,client.test.ts,fake.ts,fake.test.ts,applied-pricing.mapper.ts,applied-pricing.mapper.test.ts,README.md}`
- `src/lib/proposales/fixtures/{proposal-search.json,proposal-readback.consistent.json,proposal-readback.inconsistent.json}`
- deletion of `test/helpers/proposales-arithmetic-scan.test.ts`
- tracker row 4, the Phase-4 Review log, and the round-2 implementer handoff.

`d937fe8..23a096e` may change only the round-2 handoff’s checkpoint provenance. The phase plan has always named `index.ts` and `applied-pricing.mapper.ts`; the prior fix prompt's narrower enumeration omitted those two necessary B1 files, but also expressly says the plan wins on any conflict. Treat those two files as permitted only if their changes are confined to the required vendor `mode` repair; record this prompt-perimeter lesson, but do not manufacture a finding from the coordinator’s resolved contradiction.

No frontend worktree or frontend-owned file is in scope.

## Required delta probes

Adversarially verify every repaired defect, with new variation where useful:

1. B1: vendor `TaxOptions.mode` is the sole consumed wire key in schema, mapper, fixture, lib type, and Applied Pricing. The C7(g) test must fail on a wire-name regression.
2. B2: removing the live `parseCreateProposalRequest(request)` call site must redden P4-C3(j) and show fetch would otherwise be reached; the invalid fixture must fail only its intended request predicate.
3. B3: each four unit fields, `package_split`, and block `currency` is injected on a valid mapped block; root `currency` and `tax_options` are injected on a valid mapped request. Confirm the block and root mutations each bite their named rows.
4. S1/S2: fake call `request` is exact mapper output; a pre-seeded summary plus UUID-keyed read-back can traverse recovery then `getProposal`.
5. S3/S4/S5/S6: absent tax options, equal and absent block currency, case-different generation metadata in the real client, and all four distinct unit values must each be independently observable. Try a snake/camel or field-permutation mutant at a mapping boundary that the implementation ledger did not use.
6. S7/S8: `npx vitest list` does not collect an orphan helper test; no new Phase-4 test has an untraced or colliding phase-3 criterion label. Verify the retained scanner cases are collected in `applied-pricing.mapper.test.ts`.
7. N1–N3: absent request itself parses, README states the reserved prefix/no-unwritten-key rule, and C2(i) reads the full mapper/helper source bound.

The handoff records one L4 stamp on `d937fe8`; the current tree differs by provenance commit `23a096e`, so this session's L4 budget is **exactly 1** and must be the closing `npm test` on the tree handed over. Use L1/L2 for variations, plus `npm run typecheck`, `npm run lint`, and `git diff --check`. No further L4 run without the charter’s pre-run authorization line.

## Closing

Revert every probe and declare every touched file byte-identical. Do not edit old handoffs or prompts. Update only tracker row 4 to `APPROVED` or `CHANGES_REQUESTED`; append the technical review result to the Phase-4 Review log; create `handoffs/reviewer/phase-04-round-2.reviewer.md` with frontmatter, verdict, findings, the full write perimeter, evidence/tree identity, probe declaration, and any owner decision cards. A plain approval must include carry-forward dispositions for any notes.
