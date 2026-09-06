---
plan: 7
role: implementer
round: 1
date: 2026-09-06
---

# Phase 7 — Content ranking domain and human search (implement, round 1)

## Role and doctrine

You are the **implementing agent** for one phase of a planned multi-agent build. Your session
is stateless and self-contained by reference: everything you need is named below by absolute
or repository-relative path. Nothing in this prompt supersedes the plan file.

- If you are a Claude session: invoke the `implementation-executor` skill.
- Otherwise: read `/Users/davidloorenz/agent-skills/implementation-executor.md` and
  `/Users/davidloorenz/agent-skills/pipeline-charter.md` **first**, by absolute path, and
  follow them as this session's doctrine. They are plain markdown; only the auto-loading is
  Claude-specific.

Then follow `CLAUDE.md` / `AGENTS.md`'s Architecture Context policy
(`agent-skills/policy/architecture-context-policy.md`) before your first design decision.

**Workspace:** `/Users/davidloorenz/Desktop/Developer/Proposales`, branch `main`.
Implementation folder: `build_docs/under_constroction/initial_core_feature_proposales/`.

**`plans/phase-07-ranking-and-human-search.md` is your task list. Where this prompt differs
from the plan file, the plan file wins.**

## Gate check — verify before anything else; stop and report if any item fails

| # | Requirement | Where |
|---|---|---|
| 1 | Intention status header reads `RATIFIED` | `planing/proposal-preparation-backend-intention.md`, the `Status` row |
| 2 | Tracker rows 1–6 all read `APPROVED` | `master-plan.md` §4 |
| 3 | Tracker row 7 reads `PROMPT_READY` | `master-plan.md` §4 |
| 4 | The phase plan's frontmatter reads `state: PROMPT_READY` | `plans/phase-07-ranking-and-human-search.md` |
| 5 | The phase plan's acceptance table yields **8 criteria, 56 rows, 14 named mutations** — re-derive by counting, do not read the declared line | same file |
| 6 | `src/features/proposal-preparation/server/services/` does **not** exist | working tree |
| 7 | `MAX_SEARCH_QUERY_CHARS` does **not** yet appear in `src/features/proposal-preparation/schemas/content-candidate.ts` | working tree |
| 8 | Master plan §6.6 contains a `tokenize` row | `master-plan.md` §6.6 |

Items 6 and 7 prove the work is genuinely outstanding. Items 3, 4 and 8 prove the
coordinator's projection fold landed; if 8 fails, the naming registry was not amended and you
must stop rather than invent names.

Record `git status --porcelain` and `HEAD` in your handoff for provenance. Do **not** gate on
them — an untracked file under `build_docs/` is expected and is not your concern.

## Read order

1. `master-plan.md` §§6.1, 6.4, 6.5, 6.6, 6.7, 6.8, 9.0 (the owner's scope brief), 9.1, 10.3, 10.5.
2. `plans/phase-07-ranking-and-human-search.md` — **in full, including its Review log**, which
   records the projection fold and is the reason several rows read the way they do.
3. Intention `planing/proposal-preparation-backend-intention.md` §17A.8 (all), §17A.16 (first
   bullet and the content-search-query paragraph), §10.1, §10.2, §21.1(d).
4. The contracts named in the plan's "Read first" §3.
5. The existing code the phase binds to: `src/features/proposal-preparation/schemas/content-candidate.ts`,
   `src/lib/proposales/index.ts` (`ContentItem`, `ProposalesClient`, `getProposalesClient`),
   `src/lib/proposales/fake.ts` (`listContent`, `calls`), `src/lib/proposales/mappers.ts`
   (how a missing description becomes `{}`), and `src/features/proposal-preparation/server/domain/approvability.ts`
   plus its test for the established module and test shape.

## Phase-specific constraints — not optional

1. **The plan states the score formula exactly.** It is not a sketch to improve on. The
   projection found three defensible readings of the previous sentence producing different
   match strengths for the same fixture; one is now fixed, and six criterion rows depend on it.
   If you believe it is wrong, say so in the handoff and implement it as written.

2. **Every module under `server/` opens with `import "server-only";` as its first statement** —
   `strength.ts`, `rank-candidates.ts`, `search-content-for-human.ts`. Test files do not (see
   `server/domain/approvability.test.ts`). Phase 15's isolation scan enforces this later; do
   not make it find your files.

3. **`fixtures/` is runtime-neutral.** `fixtures/catalog.ts` takes exactly one import,
   `import type { ContentItem } from "@/lib/proposales"`, and no value import from anything
   under `server/` or `@/lib/proposales`. There is **no module-level throw** — the Vitest node
   project aliases `server-only` to a stub, so such a break would be invisible.

4. **Follow the established test shape** in `server/domain/*.test.ts`: an `async function
   modules()` helper with dynamic imports, rather than top-level imports of server modules.

5. **Timestamps and ids are literals in fixtures**, never `new Date()` or `crypto.randomUUID()`
   (master §9.1 rule 4).

6. **A fixture that exercises a bound is larger than the bound, and the test asserts the
   relation before asserting the bound** (master §9.1 rule 6) — that is C3(a)'s whole job.

7. **Every one of the 14 named mutations is applied on the tree and reverted** (master §9.1
   rule 9). "Verified by inspection" is unrun. Your handoff lists every probe file and
   confirms the tree is byte-identical afterwards.

8. **Your handoff's mutation table has exactly 14 rows and its prose agrees with its table.**
   Phase 6's handoff claimed seven mutations in prose while its table listed six; the
   coordinator had to correct it in the Review log. Derive the count from your table.

## Explicitly delegated to you

The projection deliberately left four decisions open. They are listed under **"Explicitly
delegated to the implementer"** in the plan file (the Zod-issue conversion, C1(b)'s
permutations, the truncation edges, and the `reason` string). Each has a recommended default.
**Choose, then state the choice in your handoff** — an undeclared choice here is the same
defect as an undeclared divergence.

Everything else in the plan is determined. If you find something that is not, that is a
finding: record it in the handoff rather than choosing silently.

## Scope fences

- **No agent tools.** `search_content` / `get_content` are phase 9.
- **No `src/lib/ai`.** That is phase 8; it does not exist yet, and nothing here may anticipate it.
- **No auto-selection, no warnings, no proposition assembly.** Phase 11.
- **Do not edit `master-plan.md` or the intention.** The registry amendments this phase needs
  were already made. If you need a name that is not in §6.4–§6.6, stop and report — do not add
  it yourself and do not invent one.
- **Do not touch any file outside the 9 paths** in the plan's "Files expected to change". The
  one exception is the D15 extraction option, which is declared in advance and named in the
  plan; taking it widens the perimeter to 11 paths and must be stated in the handoff.

## Evidence budget

**This session's L4 budget is exactly one run** — the closing stamp, mandatory, taken on the
tree you hand over. The phase's criteria enumerate no L4 measurements, so there is no matrix.

- The 14 named mutations run at **L1** (`npx vitest run <path> [-t "<name>"]`), each against
  the named test it must redden.
- Cycle-internal completion checks run at **L1/L2** (`npx vitest run --project node
  src/features/proposal-preparation`).
- The closing stamp is `npm test` plus `npm run typecheck` and `npm run lint` (master §10.5,
  §9.1 rule 10), recorded with its tree identity.

Any additional L4 run requires an authorization line written **before** the run: "narrower
evidence insufficient because …". If your closing stamp is invalidated because you changed
something after taking it, re-take it — that re-take is not over budget.

## Closing protocol

1. Run every named mutation, observe the expected red, revert, confirm the tree is clean.
2. Take the closing stamp on the tree you hand over; record hypothesis, scope, exact command,
   tree identity, result, and the failure-ID delta.
3. Update **tracker row 7 only** (`master-plan.md` §4) to `IMPLEMENTED` with a one-line note.
   Findings do not go in the tracker.
4. Append your entry to the phase plan's **Review log**, including any candidate criterion —
   a test you wrote that no row covers, with the defect it catches and the ledger entry it
   serves. Do not ship an orphan test silently.
5. Checkpoint commit, subject prefixed `CHECKPOINT (not approved):`, staging only this cycle's
   declared files (master §9.1 rule 13). This is standing-authorized; do not stop to ask.
6. Write your handoff to
   `handoffs/implementer/phase-07-round-1.implementer.md` with the charter's frontmatter
   (`plan`, `role`, `round`, `date`, `state`, `actor`) and a **full write perimeter** section —
   documents, code, and tool-recorded state. `.archgraph/` is not present in this repository;
   skip it silently.
7. Close with the owner layer: **What I did → What I found and what it means for you → What
   happens next → What needs you** (decision cards verbatim, or one line: "nothing needs you").

## What to report back

- The gate check, item by item.
- The four delegated decisions and what you chose.
- The mutation table: 14 rows, each naming file, definition-or-call-site, the change, and the
  test that went red.
- The closing stamp with its tree identity.
- Anything in the plan you found underdetermined, wrong, or unimplementable — as a finding,
  not as a silent repair.
