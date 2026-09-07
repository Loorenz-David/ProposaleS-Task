---
plan: none — this session authored the master plan and the phase plans
role: coordinator
round: 1
date: 2026-09-06
project: frontend_core
feature: Proposal Copilot Frontend Core
state: COMPLETE
verdict: PLAN SET WRITTEN — master plan plus 17 phase plans, tracker all NOT_STARTED; no owner decision is open
actor: Claude Opus 5 (1M context), implementation-planner session
---

# Implementation planning round 1 — frontend_core

The ratified frontend intention now has a two-tier plan set: one master plan carrying the shared
skeleton, and **17 phase plans** carrying **113 acceptance criteria**, every one of which traces
to a measurement-ledger entry, a §12A mechanism contract, or one of the five enumerated
architecture-contract cells. Every entry F1–F30 is served by at least one criterion, checked in
both directions. The project README is reduced to a one-screen pointer and its gate log,
standing rules and registers are absorbed into the master plan. No code, no `src/` folder, no
dependency, no test, no build, no commit, and no edit to the intention, a backend artifact, an
architecture contract, or a design specification.

The most consequential finding was not in the prompt's list: **the repository's committed
end-to-end suite asserts a shell that no longer exists, and CI runs it on every push** — so the
frontend stream's baseline is red before a line of product code is written. Phase 01 closes it.

---

## ⚠ OWNER DECISIONS REQUIRED (0)

nothing needs you

---

## 1. Gate check

| # | Check | Result |
|---|---|---|
| 1 | Intention status begins `RATIFIED` | **PASS** — status table, first token |
| 2 | Owner decisions resolved | **PASS** — §15 heading reads `Ratified owner decisions (0 open)`; its paragraph states no owner decision is open |
| 3 | Both inventories passed | **PASS** — §12A.23 and ledger `F30` exist; §16 round 8 records the round-2 card resolved as decision 12 and the inventory exit gate fully passed |
| 4 | Ratification is a recorded human act | **PASS** — §16 round 2 names David, 2026-09-05, and the §15.1 surface; round 8 records David's resolution of decision 12 |
| 5 | Planning genuinely outstanding | **PASS** — the README read "Planning — not started", `master-plan.md` was absent, and `plans/` held only `.gitkeep` |

**Backend `APPROVED` phases, context only** (backend master plan §4; they gate no phase 01–15):
phase 1 (repository topology and environment), phase 2 (errors, logger, shared value shapes),
phase 3 (Proposales adapter: transport, error translation, content read). Phases 4–15 are
`NOT_STARTED`. Consequence carried into the plan rather than worked around: the fixture era
covers every surface, and phases 16 and 17 are gated on backend approvals that do not exist yet.

---

## 2. What was produced

| Artifact | Contents |
|---|---|
| `master-plan.md` | goal; sources of truth, authority boundary and fold-back rule; roles, positional tables and the session workflow; the 17-row tracker; re-derived contract resolution; the shared skeleton and naming registry **including the closed category-A entry set**; sequencing, the projection gate, the ledger coverage map, the trace-cell vocabulary and the structurally-held register; tool protocols; 16 standing rules; verified environment topology with four baseline caveats; the absorbed gate log, design-delta register and follow-up register |
| `plans/phase-01`…`phase-17` | one independently executable plan each: goal with what is explicitly not in it, read-first list, dependencies, expected files, ordered tasks, an addressable acceptance table with per-row trace cells, notes, and an empty Review log |
| `README.md` | reduced to a one-screen pointer to the master plan and the durable authorities |
| this handoff | the report |

**Derived counts** (computed from the acceptance tables on 2026-09-06, never typed forward):
17 phases, **113 criteria** — 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 7, 8, 7, 5, 5. Row and
named-mutation totals are stated per phase and are re-derived at dispatch, because they move with
every fold-back.

---

## 3. Tracker and phase sequence

All 17 rows are `NOT_STARTED`, dated 2026-09-06, actor `planner`.

`01` baseline, visual foundation, test collection → `02` shell, divider, narrow width,
containment → `03` session runtime and tabs → `04` derived presentation → `05` turn dispatch and
the close guard → `06` agent surface → `07` pills and result rendering → `08` clarification →
`09` review surface → `10` preview, the work-surface toggle and money → `11` review edits →
`12` approval, creating, created → `13` failure taxonomy → `14` retained context and restoration
→ `15` boundary audit and fixture-era closure → **gate** → `16` transport boundary → **gate** →
`17` seam replacement, the critical flow, closeout.

Phases run serially; a phase begins only when its predecessor is `APPROVED`.

**Projection mandatory** (charter rule 6 families — derivations, reconciliation, ordering, money,
identity, destructive guards, absence claims): **03, 04, 05, 08, 09, 10, 11, 12, 14, 15.**
**Waivable with a recorded justification:** 01, 02, 06, 07, 13, 16, 17.

---

## 4. Ledger-to-phase coverage

Checked in both directions and reconciled against the criterion trace cells after the plans were
written, not asserted from the plan outline.

| Ledger | Phases | | Ledger | Phases |
|---|---|---|---|---|
| F1 | 14, 17 | | F16 | 05, 07, 13 |
| F2 | 07, 13, 16 | | F17 | 09 |
| F3 | 08 | | F18 | 09, 10 |
| F4 | 09, 11 | | F19 | 10, 12 |
| F5 | 12, 13, 17 | | F20 | 08 |
| F6 | 01, 02, 03, 04, 06, 07, 08, 09, 10, 11 | | F21 | 11 |
| F7 | 15, 16 | | F22 | 12, 17 |
| F8 | 03, 16 | | F23 | 13, 16 |
| F9 | 05 | | F24 | 02, 03, 06, 08, 11, 12, 13, 14 |
| F10 | 04, 05 | | F25 | 06 |
| F11 | 04 | | F26 | 02 |
| F12 | 03 | | F27 | 06, 07, 10, 12 |
| F13 | 05, 06, 08, 12 | | F28 | 10, 11, 14, 15 |
| F14 | 04, 06, 07, 14 | | F29 | 02, 14 |
| F15 | 15, 17 | | F30 | 02, 03, 14 |

**No unreachable or unserved ledger entry was found.** F1's restoration clause is served by F28,
F29 and F30 exactly as inventory round 2 intended, and phase 14 C8 measures it as one end-to-end
observable rather than as prose.

---

## 5. Contract resolution, re-derived

Routed through `architectural_contracts/01-implementation-contract-guide.md` §2 and §4 and its
scenario E plus the client half of scenario A. The result agrees with the intention's §2.2 and
adds section-level detail; §2.2 was treated as evidence, not as the derivation.

**Selected (13):** `16-design-prototype-porting` §1–§6 · `05-client-architecture` §1–§9 ·
`15-ui-styling-and-component-system` §1, §3, §5 and §2, §4, §6 **as drifted** ·
`02-runtime-boundaries` §1–§3, §5–§8 · `03-feature-architecture` §1–§4, §6 ·
`06-data-contracts-and-validation` §1–§4, §6, §8 · `10-security-and-trust-boundaries` §1–§4,
§10, §11 · `11-testing-principles` §1–§3, §5 · `12-anti-patterns` (four sections) ·
`13-decision-checklist` §1, §2, §5, §8, §9 · `14-documentation-principles` §6, §8 ·
`04-server-architecture` §3, §6 (binds phase 16) · `08-agent-architecture` §6, §9.

**Added:** no contract file beyond §2.2's list. Two **section-level** additions that are now
actionable rather than merely read: contract 15 §5's requirement that the primitive-library
adoption be recorded in the contracts README with the widget that justified it, together with
contract 13 §5's dependency rule (a phase-01 task); and contract 14 §8.3's closeout sentence,
quoted verbatim into every implementer prompt (standing rule 9).

**Local:** the master plan's 16 standing rules, each earned from this project's artifacts or the
sibling project's review history.

**Excluded, with reasons:** `07-integrations` — the frontend calls no external system; phase 16
calls a backend service and adds no adapter, host, or vendor SDK. `09-database-and-persistence`
— no durable application-owned state is introduced; §12A.21's retained context is page-lifetime
memory inside one browser page with no storage, no URL, no round-trip and no rehydration path.
Both exclusions are standing constraints: **a phase that finds itself needing one of them has
found a scope breach, not a requirement**, and stops.

---

## 6. Planning decisions taken, with their reasons

Each is a §14.3 item the intention allocated to this pass. All are recorded in master plan §6.1
so a phase inherits them rather than re-deciding them.

| Decision | Taken as | Reason in one line |
|---|---|---|
| Feature folder (§14.3 item 2) | the **client half of the existing `proposal-preparation` feature** | contract 03 §6 — two "features" that always change together and share every schema are one feature; a sibling would split one capability and add cross-feature edges for no boundary |
| Client boundary (item 3) | `src/app/page.tsx` stays a Server Component; `"use client"` on the workspace root | contract 02 §2 — when a whole surface is genuinely interactive the boundary is the surface, and V1 has no server-rendered content to compose |
| Store ladder (item 3) | one feature-scoped Zustand store, `useWorkspaceSessionStore` | contract 05 §5.1 row 3 — three sibling subtrees read and write the active session, the tab order and the runtime records; prop-passing has stopped being honest |
| View models and adapters (item 5a) | `client/view-models/`, one module per surface | `client/` is the contract's browser-safe boundary folder, which is what the §9 presentation boundary is; `components/` may not map and `hooks/` is reserved by convention for `use-*` |
| Primitive mapping (item 3) | Radix **Tabs** for the strip (phase 03); Radix **Popover**, anchored, for the ask-agent surface (phase 11); **native `<dialog>`** for confirmations; **native radio group** for the work-surface toggle | intention §4.1 and contract 15 §5 — a primitive only where its semantics match, native where simpler and correct, packages per milestone rather than the ecosystem |
| Test collection (item 4) | phase 01 repairs the Vitest projects to a stated partition contract, proven with a planted probe | the current globs leave feature component tests claimed by **no** project |
| Category-A entry set (item 5a) | **two entries**, closed, in master plan §6.5: `workSurface` and `openedBlockContentId` | see §7 |
| Approval-control treatment (C-3) | always available, creation vocabulary, unresolved information presented beside it, treatment recorded as a design delta | the intention leaves the treatment unratified and forbids a client-side verdict; design 10 §4's rule for a non-blocking question is to implement the current specification behaviour, mark, and report |
| Transport boundary form (item 5) | deliberately **not** fixed; phase 16 is thin and refined at prompt time | the service signatures it calls are the backend's and are unknown until they merge; guessing them is the fixture-promoted-to-contract defect this project exists to avoid |

---

## 7. The category-A entry set — the naming-registry obligation §12A.21 imposed

Closed in master plan §6.5, **before the first phase that implements restoration** (phase 10), as
§12A.21 requires. Each entry has a name, one admissible value domain, and one stated default.

| Entry | Value domain | Default | Written only by | Lands in |
|---|---|---|---|---|
| `workSurface` | a member of the closed presentation enumeration `"fields" \| "preview"` | `"fields"` | the user operating the review header's work-surface toggle, in that session | phase 10 |
| `openedBlockContentId` | a domain identity: the content identity a block of the session's current proposition carries | *none opened* | the user opening a block's replacement surface, in that session | phase 11 |

Both satisfy all four conjunctive conditions. §12A.22 (B) row 2's own example — "a block a later
proposition version removed" — is what settled the second entry: the contract anticipates an
entry holding a block identity, so enumerating one is following the contract rather than padding
the set.

**Nine excluded candidates are recorded with the condition each fails** (master plan §6.5), so
the exclude-on-doubt direction is visibly governing residual cases rather than licensing a thin
set: scroll position, expansion state, the ask-agent surface's open state and typed text, the
leaf being edited and its draft, every derivation-register row, every category-C value, the
composer draft (Agent Surface, §8.1 and decision 7 — not a §8.6 entry at all), and the last
presented Main Application Surface state (derivable, and retaining it would let an entry override
the state §12A.22 forbids it from overriding).

---

## 8. Structural holds, declared rather than disguised

Six clauses cannot be asserted yet. Each is marked **structurally held** in its phase with the
named trigger that converts it, and master plan §7.5 is the register.

| Held clause | Phase | Trigger |
|---|---|---|
| F15's seam replacement — components byte-identical, tests unedited | 15 C7 | the first consumed backend schema phase is `APPROVED` and merged (phase 17 C1) |
| F8 over a **real** submission | 03 C1(c) | the browser-to-server boundary exists (phase 16 C5) |
| the `diff` pill kind | 07 C3 | a backend result carries a difference record (§14.1 item 3) |
| typed clarification questions | 08 C5 | a backend amendment supplies them (§14.1 item 1) |
| live progress steps | 07 C3, 12 C5 | a backend contract defines a safe progress representation (§14.1 item 4) |
| field-scoped revision as a structured parameter | 11 C7 | §14.1 item 2 is decided by the backend |

`PillKind` therefore carries **four** members in V1, not five: a member with no producer is dead
scaffolding (charter rule 4), and §12A.9's `diff` row is served by an assertion that no mapping
produces one. That is a deliberate departure from the natural reading of §12A.9's table and is
recorded in master plan §6.3 with its trigger.

---

## 9. Findings this pass produced, routed

### 9.1 The baseline is red, and CI runs it

`e2e/bootstrap.spec.ts` asserts a `banner` landmark containing "Proposal Copilot", a visible
`main`, and a focusable "Skip to content" link. `src/app/layout.tsx` renders a bare
`<html><body>{children}</body></html>` and `src/app/page.tsx` returns `null`. `.github/workflows/ci.yml`
runs `npm run test:e2e` on every push and pull request. Derived by reading the spec against the
two committed components; **this documentation-only session ran nothing**. Phase 01 C6 closes it
and phase 02 replaces the spec. Recorded as master plan §10.2 caveat 1 and standing rule 16.

### 9.2 The visual foundation is broken at the base layer

`src/styles/globals.css` reads seven custom properties that have had no definition since
`tokens.css` was deleted: the background, foreground, muted foreground, accent and focus colours,
and two spacing steps. Tailwind 4's default theme supplies the font, type and leading ramps it
also reads, but none of those seven — verified by grepping `node_modules/tailwindcss/theme.css`.
So the body currently has no background, no foreground colour and no block rhythm. This is the
code-level half of C-4 and is the concrete reason phase 01 exists. Phase 01 C3 enumerates one row
per referenced property with a planted probe.

### 9.3 Test collection would have silently swallowed this project's tests

The `node` project claims `src/features/**/*.test.ts` in a **DOM-less** environment; the `jsdom`
project claims only `src/app/**/*.test.tsx` and `src/components/**`. A component test at
`src/features/proposal-preparation/components/**/*.test.tsx` is therefore claimed by **no**
project — `vitest list` reports as if the file did not exist and the suite stays green. That is
exactly where every test phases 02–15 write would have landed. Phase 01 C4 repairs it with a
six-row partition assertion and a planted probe; standing rule 13 covers the interim.

### 9.4 Two design gaps that reach the plan

Both are recorded as design deltas (master plan §11.2), not resolved here, and no specification
was edited.

- **The Main Application Surface's idle state has no design** (inventory round 2). Phase 02
  renders an honest empty state with a marker. The risk this note exists to name: the prototype
  filled that space with the excluded list view.
- **The creation error state is designed only in outline** — its medallion values are inferred
  from the attention tokens rather than read from the prototype, and its copy is placeholder;
  design 10 §8 asks for it to be resolved before that flow ships. Phase 13 implements the outline
  **because leaving failures unrendered would break F2 and F23**, marks it, and reports. It is a
  delta on the design owner's queue, not an owner decision that gates planning.

---

## 10. Deliberately not decided here

The concrete form, location and signatures of the browser-to-server boundary beyond what the
ratified contracts fix (phase 16 is thin by design and is refined at prompt time) · which
surfaces rebind in which order and against which merged schema (phase 17, from intention §10.2
and the order backend phases actually land) · every design delta in master plan §11.2 · the
per-interaction primitive mapping beyond the four decisions in §6.1 · anything that would require
authoring, editing or standing in for a backend-owned schema.

---

## 11. Next coordinator action

Open phase 01. Its projection gate is **waivable**, so the next artifact is either
`prompts/reviewer/phase-01-projection-round-0.prompt.reviewer.md` or, with a recorded one-line
waiver, `prompts/implementer/phase-01-round-1.prompt.implementer.md`.

Because phase 01 is where the baseline is re-enumerated, the recommendation is to **not waive**
it in spirit: whichever prompt is compiled must carry the instruction to run and record the five
baseline commands before changing anything, so that §10.2's four caveats are confirmed or
corrected by observation rather than inherited from this session's reading.

---

## 12. Write perimeter

**Documents created (19):**

- `build_docs/under_constroction/frontend_core/master-plan.md`
- `build_docs/under_constroction/frontend_core/plans/phase-01-baseline-and-visual-foundation.md`
- `…/plans/phase-02-workspace-shell.md`
- `…/plans/phase-03-session-runtime-and-tabs.md`
- `…/plans/phase-04-derived-presentation.md`
- `…/plans/phase-05-turn-dispatch-and-close-guard.md`
- `…/plans/phase-06-agent-surface.md`
- `…/plans/phase-07-pills-and-result-rendering.md`
- `…/plans/phase-08-clarification-panel.md`
- `…/plans/phase-09-review-surface.md`
- `…/plans/phase-10-preview-and-money.md`
- `…/plans/phase-11-review-edits.md`
- `…/plans/phase-12-approval-and-created.md`
- `…/plans/phase-13-failure-taxonomy.md`
- `…/plans/phase-14-retained-context-and-restoration.md`
- `…/plans/phase-15-boundary-audit.md`
- `…/plans/phase-16-transport-boundary.md`
- `…/plans/phase-17-seam-replacement-and-closeout.md`
- `…/handoffs/coordinator/implementation-planning-round-1.handoff.coordinator.md` (this file)

**Documents changed (1):** `build_docs/under_constroction/frontend_core/README.md` — reduced to a
one-screen pointer; its gate log, standing rules and registers now live in the master plan.

**Directories created (1):** `build_docs/under_constroction/frontend_core/handoffs/coordinator/`
— the folder existed before the pre-planning archival moved its only row into `archive/pre_plan/`
and git removed the empty directory.

**Not touched:** the intention · every design specification under `ui_design/` · every file under
`architectural_contracts/` · every backend artifact in the sibling project folder · every file
under `src/`, `e2e/`, `test/` · every configuration file · `package.json` and the lockfile.

**Code changed:** none. **`src/` created:** no. **Dependencies installed:** none. **Tests, build,
lint, `vitest list`:** **not run** — this session's evidence budget was none, and the intention's
§2.1 verification baseline stands as the shaper's 2026-09-05 record rather than as a claim of
re-verification. **Commands run:** reads (`cat`, `sed -n`, `grep`, `find`, `ls`, `wc`),
`git log` / `git status`, one `grep` over `node_modules/tailwindcss/theme.css` to establish
finding 9.2, and the writes above. **Tool-recorded state:** none; no architecture graph exists in
this worktree. **Commits:** none. **`docs/` folder:** not created — this repository's
documentation root is `build_docs/`.

**One tree change is outside this perimeter and is not this session's.** `build_docs/future_implementations/`
appeared in the working tree during this session (`semantic-application-graph-engine-future-concept.md`
plus a `.DS_Store`), written by another actor with different file permissions than this session's
writes. It is recorded here so a perimeter check attributes it correctly rather than to this
session; nothing in it was read, referenced, or acted on.

**Counts in this handoff** were derived from the artifacts: 17 plan files enumerated from
`plans/`; 113 criteria counted as rows matching a criterion identifier across the seventeen
acceptance tables; the ledger map reconciled against the trace cells the tables actually carry.

---

## 13. Architecture Context policy

Applied per `agent-skills/policy/architecture-context-policy.md`, routed through
`architectural_contracts/01-implementation-contract-guide.md` §2 and §4. This was material
planning, so routing was re-run rather than inherited; the resolution is master plan §5 and is
summarised in §5 above with selected, added, local and excluded sets and their reasons. Two
contracts stayed excluded and the plan states why a phase needing one of them has found a scope
breach.

**One contract conflict surfaced, not normalised.** `15-ui-styling-and-component-system.md` §2,
§4 and §6 describe `src/styles/tokens.css`, three `src/components/ui/` primitives, and a
CSS-Modules foundation that commit `f957f66` deleted — the guide §6's "the contract is stale"
case. It is routed to phase 01 as a dedicated patch **with rationale and with no rule weakened**:
the promotion rule, the inline-style rule and the one-mechanism rule survive verbatim; only the
description of what exists changes, alongside recording the primitive-library and icon decisions
the owner already took.

**Documentation impact review** (contract 14 §8). The durable documents this session's work could
falsify are the project README — patched here, reduced to a pointer — and the three stale
current-state documents of finding 9.2 and §9 above, which are **routed to phase 01 rather than
patched here**, because this session changes planning documents only and a documentation patch
that lands without the code it describes would replace one false statement with another. No
feature README exists, and none is written until phase 17, because no frontend feature exists yet.
