---
plan: plans/phase-08-ai-provider-boundary.md
role: implementer
round: 1
date: 2026-09-06
---

# Phase 8 round 1 — the AI provider boundary (`src/lib/ai/`)

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/implementation-executor.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy (`agent-skills/policy/architecture-context-policy.md` →
`architectural_contracts/01-implementation-contract-guide.md`) before your first design decision.

**The plan owns the work.** Read `plans/phase-08-ai-provider-boundary.md` in full — tasks,
acceptance table and Notes — plus its Read-first list. Where this prompt and the plan differ, the
plan wins; where the plan and the intention differ, the intention wins and you stop and say so.

## Start gate — check these by content, then begin

Do not check a commit hash and do not require a clean tree; the owner writes documentation in this
repository between sessions. Check the seven statements below. If any is false, write a handoff
saying which and stop.

1. `planing/proposal-preparation-backend-intention.md` line 5 says `RATIFIED`.
2. Its §17A.13 AI-provider table names **nine** reasons, `request_rejected` and `invalid_response`
   among them, and §23 ends with **round 17**.
3. Master §4 rows 1–7 are `APPROVED` and row 8 is `PROMPT_READY`.
4. The phase-8 plan header says `state: PROMPT_READY`, and its acceptance table declares
   **47 rows** and **16 distinct** named mutations.
5. `src/lib/ai/` does not exist.
6. `package.json` dependencies contain `ai` and contain **neither** `@ai-sdk/anthropic` nor
   `@ai-sdk/openai` — you install those.
7. Master §9.0.2 exists. It tells you what happens after you finish: **one** independent review,
   and no second review after a fix round. Write for that reviewer.

## What this phase is

The whole surface is `src/lib/ai/`: the two vendor packages, the registry that turns
`(AI_PROVIDER, AI_MODEL, key)` into a **model instance**, one `generateStep` operation whose
internal seam cannot accept a string model id, the total error translation, per-call usage with
`null` for unreported figures, and the two fakes. **No prompt text, no run loop, no budgets** —
those are phase 9.

This phase was reshaped by a projection that found **8 of the original 26 acceptance rows could be
written but could not observe the behavior they named**, and 4 more had no seam to observe at all.
The table you are implementing is the repair. Read the mutation column as the specification it is:
if a mutation you run does not redden the row it names, the row is the defect, not the mutation —
report it, do not quietly adjust the assertion until it passes.

## Delegated to you explicitly

These are yours to choose; the plan deliberately does not fix them (projection D16, D17, D21, D22):

- **D17 — the lockfile.** `package-lock.json` and `node_modules` changes from a normal `npm install`
  belong inside this phase. Never hand-edit the lockfile.
- **D16 — report the versions.** `ai` is pinned `^7.0.92` with a **caret**, so the install may move
  it. Record in your handoff the resolved versions of `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
  and any `@ai-sdk/provider-utils` change, plus a summary of the lockfile delta; the coordinator
  folds them into master §10.1. If `ai` moved off `7.0.92`, **re-verify** the `LanguageModel`
  alias, the `output` getter's thrown class and the `maxRetries` default before implementing
  against the evidence the plan cites, and say in the handoff that you did.
- **D21 — the scripted fake's exhaustion error.** A small local `Error` subclass with
  `readonly reason = "script_exhausted"`. Do **not** import phase 9's `RunFailureReason` backwards
  and do **not** add `script_exhausted` to `AiProviderFailureReason`.
- **D22 — naming and surface.** The single fixed safe message literal is
  `GENERIC_AI_ERROR_MESSAGE` (master §6.5); private helper names are yours. Declare an explicit
  **narrow** injectable type for the SDK result seam naming every field you read, so fixtures
  conform to it without `as any`. The barrel exports the domain types, `createAiClient`, the fakes,
  the config constants and the error class — **not** `callModel`, not any vendor factory internal.

## Constraints that are not yours to trade

- **`maxRetries: 0`** on the SDK call, asserted by C6(f). The default is 2; leaving it makes hidden
  provider calls and delivers failures wrapped in `RetryError.lastError` instead of the classes
  `fromSdkError` reads.
- **Two SDK error classes, not interchangeable.** `NoObjectGeneratedError` carries `text`, `usage`
  and `finishReason`; `NoOutputGeneratedError` — what the `result.output` getter throws — carries
  only `message` and `cause`. Never try to recover a finish reason from the getter throw.
- **Invalid generated output is not an integration failure.** It becomes a `final` candidate
  (plan task 6, C6(c)) so phase 9's bounded retry stays reachable.
- **No provider text ever crosses.** Message, issues, generated text — none of it reaches an
  `ErrorDto`. The original goes to `cause`.
- **`server-only` in every production module** in the directory, `types.ts` included.
- **Never assign `globalThis.AI_SDK_DEFAULT_PROVIDER`**, and never import `@ai-sdk/gateway`.
- **`createAiClient` is a factory, not a service.** Nothing is constructed at import. Do not copy
  phase 7's getter-based `defaultDeps`; master §6.6 records why.
- Do not refactor `src/lib/env/server.ts`. Its module-load parse is deliberate (§6.2).

## Evidence budget

- L1/L2/L3 freely while you work (master §10.5).
- **Exactly one closing L4 stamp** for this cycle: `npm test`, `npm run typecheck`, `npm run lint`.
  Report the file and test counts. The approved baseline to compare against is **24 files /
  335 tests**.
- **Additionally authorized once, for this phase only** because it is the one that adds runtime
  dependencies imported by server code: `npm run build`. A `server-only` misplacement and a
  bundler-resolution failure are both invisible to vitest. Report its result.
- **No network.** The default suite must never reach the network (master §10.6). Every SDK call in
  every test is injected or spied. **No real provider call, no key, no `.env` read.**
- Run **every** named mutation, one at a time, observe the row it names go red, revert, and confirm
  the tree is byte-identical afterwards. Record each as: mutation id → command → the row that
  reddened → restored. A mutation that does not redden its row is a finding.

## Perimeter

Write only: the twelve new files under `src/lib/ai/`, `package.json`, `package-lock.json`, and —
only if the root `README.md` still says no model provider is configured (projection D23, contract
`14` §8) — that one line of `README.md`. Plus your handoff, and this phase plan's Review log and
state.

`.env.example` is **unchanged**; phase 1 already lists the variables. `tsconfig.tsbuildinfo` is
tracked and every `tsc` rewrites it — attribute it in your handoff, never sweep it in silently with
`git add -A`.

Commit the work as a checkpoint whose message begins `CHECKPOINT (not approved):`. You do not
approve your own phase.

## Handoff

Write `handoffs/implementer/phase-08-round-1.implementer.md`. State, at minimum: the gate check;
the resolved versions and lockfile delta; each acceptance row and how it is observed; the full
mutation log; the closing stamp and the build result; every delegated choice you made and why; the
exact write perimeter; and anything in the plan you found wrong. **Report what happened, including
what failed.** A finding you raise costs one round; a finding the reviewer raises about work you
knew was shaky costs two.
