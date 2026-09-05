---
plan: 3
role: implement
round: 1
date: 2026-09-05
project: initial_core_feature_proposales
phase: Proposales adapter — transport, error translation, content read
---

# Session prompt — phase 3 implementation (round 1)

Implement phase 3 in `/Users/davidloorenz/Desktop/Developer/Proposales`.

Read `/Users/davidloorenz/.codex/skills/implementation-executor/SKILL.md`,
`/Users/davidloorenz/agent-skills/implementation-executor.md`, and
`/Users/davidloorenz/agent-skills/pipeline-charter.md` before acting; follow them as
session doctrine. Invoke the repository `architecture-context` skill before material
decisions. The phase plan is authoritative if this prompt and the plan differ.

## Gate check

Stop and report unless all hold at source:

1. the intention header is `RATIFIED`;
2. master-plan tracker row 2 is `APPROVED`;
3. master-plan tracker row 3 is `PROMPT_READY`;
4. `src/lib/proposales/index.ts` does not exist; and
5. phase 3 declares 6 criteria, 44 rows, and 9 named mutations.

Do not gate on a clean worktree. Concurrent frontend work is outside this backend phase:
do not modify, stage, revert, or include it in this cycle's checkpoint or handoff.

## Read order

1. The doctrine files above, then the full
   `plans/phase-03-proposales-transport-and-content.md`.
2. Master plan §§5 (R10), 6.1–6.6, 7.2, 9, and 10.4–10.6.
3. Intention §§12.1, 17A.8, 17A.12–17A.13, 17A.16, 21.4, and ledger M3, M5, M6.
4. Evidence §§1–3, 6–8 and the cited OpenAPI surfaces.
5. Contracts `02-runtime-boundaries.md` §§3, 5, 8; `04-server-architecture.md` §6;
   `06-data-contracts-and-validation.md` §§2–3, 5–8; `07-integrations.md` §§1–6, 10;
   `10-security-and-trust-boundaries.md` §§2, 4, 7–8; `11-testing-principles.md` §§2–3,
   5; `12-anti-patterns.md` sections matching server, data/validation, and integrations;
   and `14-documentation-principles.md` §9.
6. The phase-2 foundation: `src/lib/errors/app-error.ts`, `error-dto.ts`, values,
   `src/lib/env/server.ts`, the offline guard, and Vitest configuration. They show the
   approved foundation; do not infer a replacement architecture from them.

## Scope and non-negotiable implementation decisions

Implement every ordered task and every acceptance row exactly. In particular:

- Extend `IntegrationError` issue support only as phase 3 task 1 specifies, then keep
  all Proposales error construction in `src/lib/proposales/errors.ts`.
- The client owns endpoint-specific `company_id` injection; `http.ts` passes query
  through verbatim and never special-cases paths.
- Non-2xx status classification precedes body parsing. A 503 HTML body is retryable
  `server_error`; only a 2xx unreadable body is `invalid_body`.
- The `created_at` Date/ISO bound belongs in the external response schema. Do not edit
  `src/lib/values/timestamp.ts`.
- Every production module under `src/lib/proposales/` begins with `import "server-only";`.
- Implement only the three reads and the phase-3 fake surface. Proposal writes, recovery,
  stored drafts, editor-origin behavior, pagination, caching, a feature folder, UI, and
  new dependencies are later scope.

Allowed production/test perimeter is exactly the 18 files in the phase plan. In addition,
the normal closing artifacts may be changed: tracker row 3 only, this phase plan's
append-only Review log, and the implementation handoff. Do not alter the already-written
intention, other plans, master registry, phase-2 code beyond the two declared shared-error
files, or any frontend file.

## Explicit delegation list

These are the only freedoms deliberately granted by the projection; record the choice in
the Review log when it materially affects a test or fixture.

1. **Which test file owns which criterion.** The perimeter has five test files for six
   criteria; the natural split (`http.test.ts` → C1/C3, `errors.test.ts` → C1/C2,
   `mappers.test.ts` → C5, `client.test.ts` → C4/C6, `fake.test.ts` → C4(e)/C6(d)) is the
   implementer's to choose, provided every row is discharged exactly once and no test ships
   without a row (charter rule 16).
2. **Whether `errorBodySchema` is used to parse the error body or only to test it.** Either is
   contract-clean, as long as a body that fails it produces the generic message rather than a
   thrown error.
3. **Fixture contents beyond what the rows pin.** Ids, languages and titles are free; the two
   content items must jointly satisfy C5(a), C5(b) and C5(d) with each row's predicate the
   only reason its outcome holds (charter rule 2's companion).
4. **No bound on the raw error-body read in v1.** An oversized upstream body is read whole into
   `cause`. Recorded as an accepted MVP limit (owner scope brief §9.0 "trim here"), not an
   oversight — a later phase adding a body cap should say so.
5. **`getContent` returning more than one item** for a single `variation_id` — undetermined and
   unreachable given the vendor's parameter shape; the implementer picks a defensive branch
   without a criterion.

## Evidence and closeout

Task 0 is mandatory: put a one-line row → test-id → assertion-strength coverage map for all
44 rows in the handoff before production edits, then capture the red baseline. Every test in
the phase files must map back to a criterion or be removed/routed as a candidate criterion.

Run all nine named mutations at their named sites and revert each. The handoff records the
per-criterion mutation summands (`C1` 2 · `C2` 2 · `C3` 1 · `C4` 1 · `C5` 2 · `C6` 1), all
observed reddened assertions, and every probe-touched file separately from the changed-file
perimeter. A source-inspected mutation is not executed.

**L4 authorization:** exactly one closing `npm test` stamp is authorized for this session,
after targeted work and mutations. Record its tree identity and baseline delta. Run typecheck
and lint as required by the doctrine. Evaluate documentation impact according to
`architectural_contracts/14-documentation-principles.md`. Update any authoritative
documentation made false, incomplete, or misleading by the verified implementation. Do not
modify documentation merely because files changed.

Checkpoint-commit only this cycle's declared files and closing artifacts. Deposit
`handoffs/implementer/phase-03-round-1.implementer.md` with the full write perimeter,
coverage map, evidence, mutation ledger, judgment calls, the checkpoint hash, and owner-layer
summary. Set only tracker row 3 to `IMPLEMENTED` when all closure gates pass.
