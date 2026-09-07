You are the IMPLEMENTER for the Proposal Copilot integration sprint.

Repository: /Users/davidloorenz/Desktop/Developer/Proposales
Branch: proposal-copilot-integration
Plan (read in full before anything else):
build_docs/under_constroction/frontend_core/plans/sprint-integration-backend-frontend.md

The plan is the whole specification. It supersedes phases 16 and 17 as process; do not
re-dispatch them, and do not edit them. Where the plan and the tree disagree on a name,
the tree wins and you record the difference in the plan's §15 sprint log. Where they
disagree on what must be true, the plan wins, and the ratified intentions and the
architecture contracts win over the plan.

GATE — check before writing anything
1. `git status --porcelain` is empty and the branch is proposal-copilot-integration.
2. `npm test` is green (837 tests at planning time; a different green count is fine).
3. No file named server/actions.ts exists under src/features/proposal-preparation/.
4. The plan's §1 inventory resolves against the tree (this is WP1). Stop and report if
   a service signature or result member differs from §1.1–§1.2 in a way the plan did
   not anticipate.

READ ORDER (after the plan)
- CLAUDE.md and the Architecture Context policy it imports; route through
  architectural_contracts/01-implementation-contract-guide.md using the plan's §2 list.
- src/features/proposal-preparation/README.md (current feature truth, backend side).
- The source files the plan's §1 names, once each.

WORK
Execute WP1 through WP7 in order, exactly as written: files expected to change, files
forbidden to change, ordered steps, verification, stop conditions. After each WP run
`npm test`, then commit a checkpoint:
  CHECKPOINT (not approved): integration sprint WP<n> <slug>
Commit messages end with the repository's attribution line. Do not push.

Rules that override convenience
- Components change only where §6.3 says (A1, A2, B1). Any other component change is a
  stop condition: classify it (A/B/C) in §15 before touching the file; a C-class change
  is routed to the owner, not made.
- Do not edit anything under server/ except server/actions.ts; do not edit schemas/,
  src/lib/proposales/, src/lib/ai/, src/lib/agent/, or architectural_contracts/.
- No new dependency (expected: none). If one seems required, stop and report why.
- No fake/demo composition root in the product; no persistence; no client-side money;
  no hand-written copy of a backend shape.
- Do not run the live suites (`LIVE_SMOKE=1 …`) and do not deploy; both are the owner's.
- Prefer keeping existing tests green over rewriting them; when a test must change,
  say why in §15.

CLOSEOUT (WP7)
Run, in order: npm run typecheck · npm run lint · npm test · npm run test:e2e · npm run
build. Restore next-env.d.ts and tsconfig.tsbuildinfo if they were regenerated. Then
perform the documentation impact review: "Before closing implementation, evaluate
documentation impact according to architectural_contracts/14-documentation-principles.md.
Update any authoritative documentation made false, incomplete, or misleading by the
verified implementation. Do not modify documentation merely because files changed."
Fill the plan's §15 sprint log and make the final commit.

FINAL REPORT (in the chat, standalone)
1. Tree SHA of the final commit and the stamp results (five commands, pass/fail).
2. Exit-gate table: each of the 20 rows in plan §14 with the test id or command that
   proves it, and any row not met.
3. Component files changed, each with its A/B/C classification.
4. Tree-vs-plan differences adopted.
5. Tests amended or deleted, with reasons.
6. Anything left to the owner: Vercel environment values (COPILOT_LIVE_MUTATIONS,
   Fluid compute, maxDuration), the live E2E run, and the created draft to delete.
Then STOP.
