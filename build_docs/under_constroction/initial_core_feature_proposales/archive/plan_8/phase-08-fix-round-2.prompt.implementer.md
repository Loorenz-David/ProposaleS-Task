---
plan: plans/phase-08-ai-provider-boundary.md
role: implementer
round: 2 (fix)
date: 2026-09-06
---

# Phase 8 fix round 2 — repair the boundary's error classification and its guards

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Apply the repository's Architecture Context
policy before your first design decision.

**This round closes the phase.** Under master §9.0.2 no independent re-review follows a fix round;
the coordinator validates and closes. So the mutation log and the closing stamp in your handoff are
the record, and anything you leave shaky will ship.

## Start gate — check by content, then begin

1. Phase-8 plan header says `state: CHANGES_REQUESTED`; master §4 row 8 says `CHANGES_REQUESTED`.
2. The plan's acceptance table declares **7 criteria / 51 rows / 22 distinct mutations**, and
   contains rows `C4(r)`, `C4(s)`, `C4(t)` and `C7(a)`.
3. Intention §23 ends with **round 18** and §17A.13's AI section carries a **precedence** paragraph
   with three numbered branches.
4. Master §9.1 has **rules 17 and 18**.
5. `git log -1` is the review-dispatch commit or later; `src/lib/ai/` contains twelve files.

## Read first

- `plans/phase-08-ai-provider-boundary.md` — the whole amended table and the whole Review log,
  including the coordinator's fold of the review, which records what has already been measured.
- `handoffs/reviewer/phase-08-review-round-1.handoff.reviewer.md` — B1, B2, B3, S1–S5, N1–N7 with
  the observations and prescriptions.
- Intention §17A.13 (the AI table **and** its new precedence paragraph); master §6.3, §6.5, §9.1
  rules 15–18.

## The repair

**Everything below has been run — by the reviewer and again by the coordinator on an independent
harness. You are not exploring; you are applying and proving.**

**B2 + B3 — `errors.ts` classification.** A saved, working prescription is at
`/private/tmp/claude-501/-Users-davidloorenz-Desktop-Developer-Proposales/34e2314a-27c9-434d-b384-68e4bfa40e81/scratchpad/errors.prescription.ts`.
Read it, understand *why* each branch moved, and apply it — do not paste it blind. The substance:
a decode check that accepts an `APICallError` carrying a **2xx or absent** status with a
`JSONParseError`/`TypeValidationError` cause, a network check that accepts a **status-less**
`APICallError`, and `fromSdkError` reordered to **decode → abort/timeout → status → content-filter →
no-output → network → generic**. The decode check must precede the status branch because the real
shape carries a 2xx; restricting it to 2xx-or-absent is what keeps a non-2xx classified by status.
Measured with it applied: E1 → `transport`/`true`, E2 → `invalid_response`/`false`, 401 control
unchanged, suite green, typecheck clean.

One judgment is yours: under the prescription an `invalid_response` no longer carries
`details.status`. Keep it dropped or carry the 2xx through — say which you chose and why. The rows
do not turn on it.

**Rows to write against shapes the SDK actually builds** (§9.1 rule 18 — this is the whole lesson of
the round): `C4(h)`, `C4(i)`, `C4(r)`, `C4(s)`. Their fixture cells cite the vendor construction
sites. Build the fixtures from those, not from the prose.

**B1 + S3 — one shared instrument in `registry.test.ts`.** Extract `productionModules()` (which
asserts the listing equals the seven named modules) and `hasForbiddenGatewayForm()` to module scope,
and have `C2(b)`, `C2(c)` and `C2(d)` all call them. `C2(c)` must exercise **the same symbol**
`C2(b)` applies, not an equivalent regex. MUT-08-15 narrows that one definition and must redden
`C2(c)` — before the repair the identical weakening left the file 9/9 green.

**S1 — `C4(t)`.** A new client-path row: `generateStep` with an injected `generateText` rejecting a
content-filtered `NoObjectGeneratedError` must **reject** with `content_filtered`, not resolve to a
final candidate. MUT-08-18 deletes the production branch and must redden it.

**S2 — `C4(m)`.** Add the impostor fixture: a non-`Error` object carrying `{ name: "TimeoutError" }`
must stay generic with no `reason`. MUT-08-19 drops the `instanceof Error` conjunct and must redden
exactly that case.

**S4 — `C7(a)`.** New criterion for `config.ts`. Assert the *contract* (positive integers;
`AI_CALL_TIMEOUT_MS <= wallTimeMs`), never the literals — charter rule 13. MUT-08-20 raises the
timeout above `wallTimeMs`.

**S5 and N7 and N2 — small.** Fold the orphan test at `errors.test.ts:124` into `C4(m)`, which
already owns the generic path. Add the nine-member set equality to `C4(n)` so its loop cannot pass
over a shortened registry. Add the `assistant` text case to `C6(g)`.

**Do not touch.** N1, N3 and N5 are recorded and closed in the plan Notes — do not "fix" them.
N4 is routed to phase 15. N6 (`npm run build` on `main`) is not this phase's and must not be
repaired here. The owner card is answered and staged to phase 9; `C6(k)` keeps its current mapping.

## Perimeter

`src/lib/ai/errors.ts`, `client.ts` only if a repair requires it, and the four test files. Plus your
handoff and this plan's Review log and state. **No change to `types.ts`, `registry.ts`, `config.ts`
production values, `package.json`, `package-lock.json`, `README.md` or `.env.example`** unless a
named finding demands it — if one does, say so before doing it.

`tsconfig.tsbuildinfo` is tracked and every `tsc` rewrites it: attribute it, never sweep it in with
`git add -A`.

Commit as a checkpoint whose message begins `CHECKPOINT (not approved):`.

## Evidence

- L1/L2/L3 freely.
- **Exactly one closing L4 stamp**: `npm test`, `npm run typecheck`, `npm run lint`. Baseline to
  beat: **28 files / 380 tests** green. Report the counts.
- **Do not run `npm run build`** — it fails on `main` for a pre-existing reason outside this phase
  (`src/styles/globals.css` imports a `tokens.css` the frontend work deleted at `f957f66`). It
  yields no signal and is not yours to repair.
- No network, no provider call, no `.env` read, no `npm install`.
- Run **all 22** named mutations — the six new ones and the sixteen existing — one at a time,
  observe the named row go red, revert, and confirm each file is byte-identical afterwards. The
  existing sixteen were proven in round 1, but the files they target have changed; re-running them
  is how you know the repair did not blunt an older guard. Report digests.

## Handoff

`handoffs/implementer/phase-08-fix-round-2.implementer.md`. Give the gate check, the exact repair
and why each branch sits where it does, every new and rewritten row with how it is observed, the
full 22-mutation log, the closing stamp, your two judgment calls (the `status` on
`invalid_response`, and anything else you decided), the exact write perimeter, and **anything in the
plan or the prescription you found wrong**. Three rounds of this project have turned on a finding
being right and its prescription being wrong; if you find that here, say so rather than making the
prescription pass.
