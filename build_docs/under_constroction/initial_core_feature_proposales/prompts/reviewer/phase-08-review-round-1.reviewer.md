---
plan: plans/phase-08-ai-provider-boundary.md
role: reviewer
round: 1
date: 2026-09-06
---

# Phase 8 review round 1 — the AI provider boundary

Workspace `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`. Never enter the
sibling frontend worktree.

Read `/Users/davidloorenz/agent-skills/plan-reviewer.md` first; it routes you through
`/Users/davidloorenz/agent-skills/pipeline-charter.md`. Then apply this repository's Architecture
Context policy in reverse, as review does it: diff → concerns touched →
`architectural_contracts/01-implementation-contract-guide.md` → the applicable contracts → judge the
diff against them.

**This is the phase's only independent review.** Master §9.0.2 waives the *second* review after a
fix round, not this one. What you miss, the coordinator will not catch a second time.

## What to read

1. `plans/phase-08-ai-provider-boundary.md` in full — tasks, the 47-row acceptance table, Notes,
   and the whole Review log including the coordinator's consumption entry, which lists what has
   already been checked so you do not spend the round repeating it.
2. `handoffs/implementer/phase-08-round-1.implementer.md`.
3. `handoffs/reviewer/phase-08-projection-round-0.handoff.reviewer.md` — the projection whose
   24 ledger rows shaped this table. Its D-numbers are cited throughout the plan.
4. The intention's §17A.13 (now a **total** nine-reason table, owner-ratified as §23 round 17),
   §17A.14, §17A.15; master §6.1–6.6, §9.0, §9.0.2, §9.1 rules 15 and 16, §10.1.
5. The diff: `git diff be0a672 6441770`.

## Gate

Check by content: phase header and master row 8 both say `REVIEWING`; `src/lib/ai/` contains
twelve files; `package.json` has `@ai-sdk/anthropic` and `@ai-sdk/openai`; the intention's AI table
has nine reasons. If any is false, say so and stop.

## Already established — do not re-derive

The coordinator ran these on the checkpoint tree. Spot-check if you doubt one; do not rebuild them.

- `npm test` **28 files / 380 tests** green, typecheck and lint clean.
- Write perimeter exact by `git diff --name-status`; `.env.example` untouched.
- All 47 row ids appear in executing test names.
- `ai` stayed **7.0.92**, so the SDK facts the plan cites still hold. `@ai-sdk/openai` resolved
  4.0.60; §10.1 folded.
- `DOMException` extends `Error` in Node 22 and `AbortSignal.timeout` rejects with a `DOMException`
  named `TimeoutError`, so `isNamedError`'s `instanceof Error` test catches the real signal.
- Two coordinator probes bit correctly: reordering `mapResult`'s branches reddens C4(j)/C6(j);
  changing the other-4xx fallback to `transport` reddens C4(d)/C4(e).
- `npm run build` fails on `main` for a pre-existing reason outside this phase
  (`src/styles/globals.css` imports a `tokens.css` the frontend work deleted at `f957f66`). It
  yields no signal here. Do not repair it and do not treat it as a phase-8 defect.

## Named probes — start here

**B1 — a guard that proves a copy of itself. Confirmed by the coordinator; your job is the fix.**
`registry.test.ts` C2(b) scans the production modules for forbidden gateway forms, and C2(c) exists
to prove that scanner fires for all four forms. Each declares its **own** regex literal. Weakening
only C2(b)'s copy to `/AI_SDK_DEFAULT_PROVIDER/` — so it no longer detects `@ai-sdk/gateway` in any
form, nor a `gateway(` call — left the file **9/9 green**, C2(c) included. Reproduce it, then
prescribe the repair and say what the acceptance row must require so the hole cannot reopen. The
plan's C2(c) row is where the defect starts: it asks for "the scanner's predicate" without requiring
it to be the same object. Judge the row as well as the code. This is §9.1 rule 16's exact failure
mode, found in the phase after the rule was written.

**Then look for its siblings.** C2(b) and C2(d) each rebuild their own directory listing; other rows
may duplicate a fixture the same way. A duplicated instrument is a guard with a second sufficient
cause.

**Q1 — an open semantic question, and the plan is the suspect.** C6(k) maps a step that finishes
with `length`, no tool calls, and a throwing output getter to `invalid_response`. That member means
"the provider's reply cannot be decoded as its own protocol". A length-truncated generation decoded
perfectly and simply carries nothing usable. The nine-member table has no member for it — a gap in
the total table folded at round 17, so this is the coordinator's, not the implementer's, who picked
the least-wrong member of a closed set. Nothing unsafe ships: it is nonretryable either way.
Determine which is right: `invalid_response` is acceptable; or the registry needs a tenth member
(that is an **owner card**, and you write it, you do not decide it); or a step that produced no
output is not an integration failure at all and belongs to phase 9's `model_output_invalid` path.
Say which, with the reasoning, and route it.

## What the coordinator did not check — this is your round

The three probes above touched `mapResult`'s ordering, the status fallback and the C2 instrument.
**No systematic audit of the other 44 rows for a second sufficient cause has been done.** That is
the work. In particular:

- **Rule 15, every row.** Does each fixture make the behavior the row names the *only* thing that
  could produce the observed outcome? The recurring shapes here: a row asserting a mapped value
  where a default would produce the same value; an absence row where two things are absent; a
  precedence row whose fixture would pass under either order.
- **Rule 16, every guard.** Is each instrument proven, or assumed? B1 is one instance; find the
  others. `expectTypeOf(...).not.toHaveProperty(k)` does not fail typecheck for an optional `k?`.
- **The type-level rows.** C1(c)/C1(e) and C4(p) are proven by `npm run typecheck`, not by the test
  run. Confirm the `@ts-expect-error` directives are consumed by the *intended* error and not by an
  argument-count or arity mismatch — the positive control in C1(e) is meant to close that, so check
  that it actually does.
- **`errors.ts:statusReason`.** Anything that is not 401, 429 or 5xx becomes `request_rejected`,
  including a 3xx and a status above 599. Judge whether that is acceptable narrowing for an MVP or a
  misclassification worth a row.
- **`fromSdkError`'s branch order.** `NoOutputGeneratedError` is tested before the decode-error
  check and before the abort/timeout check. Is any real error reachable by two branches?
- **`toSdkMessages` line 69** returns the neutral message object *directly* as an SDK `ModelMessage`
  when it has a `content` key. Is that identity safe for both `user` and `assistant` text, and does
  any row prove it rather than assume it?
- Contract preservation: `07` §4 retryability, `10` §2 and §11, `02` §3 server-only leaves,
  `08` §3 tools carrying no `execute`, `04` §6 programming errors never relabelled.

## Scope brief

Master §9.0 binds this review. This is an MVP the owner is presenting: **build quality is the
deliverable, guard quality especially**, but exhaustive enumeration where a representative subset
carries the same proof is trimmable. Trim by reducing an ask, never by dropping a guard. Record
every exclusion where the excluded work lives, with its reason.

## Evidence budget

L1/L2/L3 freely. **Exactly one closing L4 stamp** (`npm test`, `npm run typecheck`, `npm run lint`).
No network, no provider call, no `.env` read, no `npm install`. If you propose a mutation or a
fixture, **run it before you write it down** — this project has had three rounds where the finding
was right and the prescription was not, and one where a proposed mutation crashed instead of
testing. Restore the tree byte-identically and say so.

## Handoff

Write `handoffs/reviewer/phase-08-review-round-1.reviewer.md` with a verdict of `APPROVED` or
`CHANGES_REQUESTED`. For each finding: the row or file, what is wrong, the observation that proves
it, and a prescription you have run. Separate blocking findings from notes, and route any note to
the phase that owns it. Raise an owner card only for a semantic choice that is genuinely the
owner's — write it as question, story, branches, recommendation, on-silence, trace.
