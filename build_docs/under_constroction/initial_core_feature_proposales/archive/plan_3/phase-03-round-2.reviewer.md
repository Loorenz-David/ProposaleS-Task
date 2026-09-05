---
plan: 3
role: reviewer
round: 2
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — transport, error translation, content read (fix re-review)
---

# Session prompt — re-review phase 3, round 2

You are the independent reviewer for the delta-only phase-3 fix re-review in
`/Users/davidloorenz/Desktop/Developer/Proposales`. You did not implement the fix.

Invoke the `plan-reviewer` skill and follow its doctrine. Also invoke the repository's
`architecture-context` skill before evaluating the delta. Read
`/Users/davidloorenz/agent-skills/pipeline-charter.md` and
`/Users/davidloorenz/agent-skills/plan-reviewer.md` first.

**You review and report; you do not fix production code.** The phase plan is your task list;
where this prompt differs from it, the phase plan wins.

## 1. Gate check

Stop and report unless: the intention header is `RATIFIED`; master-plan tracker row 2 is
`APPROVED`; tracker row 3 is `REVIEWING`; the phase plan says 6 criteria / 51 rows / 14 named
mutations; and the fixed source still contains the response-body timeout race, variation-id
equality selection, singular variation-id regex, and no `errorBodySchema` export.

Do not gate on a clean tree, a file count, or a commit SHA. Inspect and record
`git status --porcelain`. Preserve all pre-existing coordinator documents, handoffs, prompts,
generated `tsconfig.tsbuildinfo`, and any owner frontend work; never modify, stage, revert, or
report them as implementation drift.

## 2. Review history and exact delta perimeter

Round 1 was an independent full review of checkpoint `5227b3f`. It settled the original
44-row implementation and found B1/B2 plus S3–S6. Fix round 2 checkpoint `44e39e4`
addresses only those six findings. Treat the round-1 verified-correct surfaces as settled;
do not repeat the full phase review.

Verify the final code delta using:

```sh
git diff --name-status 5227b3f 44e39e4
```

It must contain exactly:

- `src/lib/proposales/http.ts`, `http.test.ts`
- `src/lib/proposales/client.ts`, `client.test.ts`
- `src/lib/proposales/schemas.ts`
- `src/lib/proposales/README.md`

The implementer handoff is `handoffs/implementer/phase-03-round-2.implementer.md`.
Reconcile it against the checkpoint: 51 rows, 62 targeted phase tests, 14 mutations comprising
9 cited checkpoint mutations and exactly 5 newly executed mutations (MUT-03-10…14), one L4
stamp (11 files / 118 tests), typecheck/lint, and the six-file checkpoint perimeter. Do not
rerun the nine prior mutations or an identical named mutation merely for independence.

## 3. Read order

1. Charter and reviewer doctrine — especially delta re-review, evidence reuse, fresh variation,
   mutation testing, and closing protocol.
2. Round-1 reviewer handoff; fix-round handoff; phase-3 plan including its coordinator fold and
   Review log.
3. Intention §§10.1–10.2, 12.1, 17A.8, 17A.11–17A.13, 17A.16; evidence §3; master plan §§4,
   6.3–6.6, 9, and 10.4.
4. Applicable contracts: `02-runtime-boundaries.md` §§3, 9; `03-feature-architecture.md`
§§3–4; `04-server-architecture.md` §6; `06-data-contracts-and-validation.md` §§2–8;
`07-integrations.md` §§1–6; `10-security-and-trust-boundaries.md` §§2, 4, 7–8;
`11-testing-principles.md` §§2–3, 5; `12-anti-patterns.md` Server/Data/Integrations; and
`14-documentation-principles.md` §§8–9.
5. The six-file checkpoint diff and affected tests only.

## 4. Delta review targets and fresh variations

Verify each finding correction, not merely that the new test names pass:

- **B1 / S3:** timer lifetime spans headers and body; 2xx stalled bodies become timeout with an
  aborted signal; stalled 503 bodies preserve `server_error` / retryability and bounded GET
  attempts; `response.ok` is inspected before body access; no raw body crosses the fallback.
  Spend fresh evidence on a different body failure shape than the fix ledger — for example,
  `text()` rejects asynchronously after headers — and distinguish 2xx timeout/invalid-body
  behavior from non-2xx status precedence. Also inspect that timeout cleanup cannot turn a
  late body result into a second classification.
- **B2:** requested-id equality is checked before mapping and an unmatched response is null.
  Exercise a variation different from the recorded `111,222` ordering, such as duplicate or
  reordered matches, and confirm the result cannot be determined by vendor position.
- **S4:** the extended ISO boundary uses the production schema path, while invalid-date behavior
  remains protected.
- **S5/S6:** no unused `errorBodySchema` remains, no new duplicate parser was introduced, and
  the integration README renders valid inline code while still describing actual retry and
  singular-lookup behavior.
- **C4(k):** confirm a comma-separated value never reaches fetch; do not broaden the public
  operation back to a plural return shape.

Any temporary probe must be applied/reverted and checksum-verified per doctrine. No phase-4
scope, error-bound note N7/N8, frontend code, live integration, or new abstraction belongs in
this re-review.

## 5. Evidence budget

**L4 budget: exactly one run.** Run `npm test` once as the review-entry current-tree stamp,
recording tree identity and failure-ID delta. Run `npm run typecheck` and `npm run lint` as
closeout checks; use L1/L2 for fresh variations only. Do not repeat the implementer's existing
targeted suite or identical mutation evidence. If non-phase work causes a broad-check failure,
record it as a foreign-worktree note and do not modify it.

## 6. Closing protocol

1. Append technical findings, verified-correct delta surfaces, fresh-probe declaration, and
   plan lessons to the append-only phase Review log.
2. Update only tracker row 3 from `REVIEWING` to `APPROVED` or `CHANGES_REQUESTED`.
3. Write `handoffs/reviewer/phase-03-round-2.reviewer.md` with row-schema frontmatter, opening
   result, `⚠ OWNER DECISIONS REQUIRED (n)`, findings, evidence, full write perimeter, probe
   declaration, lessons, and carry-forward dispositions if approved.
4. Archgraph is absent; skip it silently. Do not fix production code or create an approval
   commit.

Your final chat response is the charter owner layer: state of the build, verdict, next step,
and any owner decision required. Point to the handoff rather than pasting its technical layer.
