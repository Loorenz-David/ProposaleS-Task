# Master plan — Proposal Copilot Frontend Core

|  |  |
|---|---|
| **Project** | `frontend_core` |
| **Feature** | Frontend Core — the production proposal workspace |
| **Stream** | worktree `Proposales-frontend`, branch `proposal-copilot-frontend` |
| **Authored** | 2026-09-06, implementation-planning round 1 |
| **Root artifact** | [`intention/frontend-core-intention.md`](intention/frontend-core-intention.md) — `RATIFIED`, 0 open owner decisions |
| **Phases** | 17, all `NOT_STARTED` (§4) |

This is the thin shared skeleton. It states once what every phase session needs and states
nothing twice. It does not restate product semantics: the intention owns those, and a
phase plan cites them rather than copying them.

---

## 1. Goal

Build the one production workspace the ratified frontend intention describes — a persistent
Agent Surface beside a session-controlled Main Application Surface, in which a human
collaborates with the proposal-preparation capability, reviews and corrects the prepared
proposition, approves it, and receives a Proposales draft — on fixtures first, rebound to
the real backend contracts as they are approved and merged.

What the workspace must be and why: intention §1, §3, §5, §6. What it must never do:
intention §4, §7, §12A forbidden lists. What must be measurably true when it ships:
intention §12 (F1–F30). This plan carries none of that; it carries the skeleton the phases
share.

---

## 2. Sources of truth, authority boundary, and the fold-back rule

| Content | Artifact |
|---|---|
| Product semantics, state boundaries, scope ladder, measurement ledger F1–F30, mechanism contracts §12A.1–§12A.23 | [`intention/frontend-core-intention.md`](intention/frontend-core-intention.md) |
| Visual language, layout, interaction behaviour, state vocabulary, motion, copy, accessibility corrections | [`ui_design/01`–`09`](ui_design/), read after [`ui_design/10-design-integration-guide.md`](ui_design/10-design-integration-guide.md) |
| How code must be written: boundaries, ownership, styling, validation, security, testing, documentation | `architectural_contracts/` (resolution in §5) |
| Commercial, workflow, provenance, clarification, approval, execution, and error truth | [backend intention](../initial_core_feature_proposales/planing/proposal-preparation-backend-intention.md) §17A and [backend master plan](../initial_core_feature_proposales/master-plan.md) §6.3–§6.4, §6.9 |
| Shared skeleton: naming registry, contract resolution, environment topology, standing rules, tracker, gate log | this file |
| Phase-local goal, files, tasks, criteria, review log | one file per phase in [`plans/`](plans/) |
| Session framing | `prompts/<role>/`, generated just-in-time, never reused stale |

**Authority boundary, stated once.** The frontend owns presentation and the thin validated
browser-to-server boundary. Backend services, schemas, domain contracts, and every §17A
mechanism are backend-owned: this project cites them and never authors, copies, edits,
extends, or corrects one. Where a design specification's mechanism conflicts with a
contract or a ratified decision, the intended experience is preserved and the mechanism is
replaced (intention §13). Where a design specification shows a value, a label, a question,
a field set, or a total, the visual treatment is authoritative and the content is not
(design 10 §1).

**Fold-back rule.** A semantic change amends the intention through the decision-card path.
A skeleton change amends this file. A phase-local change amends that phase plan. A change
is never patched into a downstream artifact: that is how document sets diverge. A
correction discovered during implementation or review is routed to the artifact that owns
it, by the coordinator, and the phase plan's Review log records the routing.

**A design change is never made here.** Design deltas are recorded (§11 register) and
reported; no session in this project edits a file under `ui_design/`.

---

## 3. Roles and session workflow

**Owner scope brief (standing, verbatim, from backend master plan §9.0):**

> "my objective here is to present this application as an mvp ( it will probably won't
> event be used at all on production, so it won't be persistent over time ) it needs to
> be senior build but not as a full scale app."

Its application rules bind here unchanged: it calibrates the *quantity* of hardening and
never the *correctness* of what ships; anything wrong rather than merely unguarded stays in
scope; a guard that cannot fail is not a cheaper guard; every exclusion is recorded where
the excluded work lives, with its reason.

**Split.** Codex implements. Claude reviews. A reviewer session runs on a model at least as
capable as the session that implemented the phase (backend master plan §9.0.1).

**Substitution in force from 2026-09-06, owner decision, phase 01 onward until withdrawn.**
Codex sessions are exhausted, so the implementer for phase 01 is a **Claude Sonnet 5** session
and the reviewer is a **Claude Opus 5** session. The owner took this decision on the
coordinator's card 1 (handover round 1) after the cross-family reason was stated. What the
substitution keeps and what it spends, recorded so no session mistakes one for the other:

- **Kept — the capability rule.** Opus reviewing Sonnet satisfies "at least as capable as the
  session that implemented the phase" verbatim. This is the half that catches an implementer
  reasoning past its depth.
- **Spent — the cross-family property.** Implementer and reviewer are now the same model
  family, so a failure mode common to that family is not caught by the split. Two consequences
  bind while the substitution is in force: (1) the projection gate is **not** waived for any
  phase on the grounds that the plan looks clear, because projection is now the only
  independent read of a plan before code exists; (2) a reviewer finding that turns on
  "the implementer and I read this the same way" is recorded as such in the Review log rather
  than treated as agreement.

The substitution is a staffing fact, not a change to the split. When Codex is available again
the standing split resumes with no further decision.

**Sonnet-implementer addendum, and it is a real one.** An implementer prompt compiled while
this substitution is in force states its scope fences and its named mutations
**enumeratively**, never by reference to judgment: "the eight probes are these eight", not
"plant a probe for each guard". This costs the coordinator prompt length and buys back the
determinacy the plan lint and the projection are there to establish.

**The coordinator orchestrates; the owner runs the sessions (owner instruction, 2026-09-06,
standing until withdrawn).** The coordinator authors prompts, lints plans before dispatch,
consumes handoffs adversarially, routes findings to the artifact that owns them, keeps the
tracker and the gate log honest, relays owner cards, and commits pipeline documentation. **It
does not start implementer, reviewer or projection sessions itself** — it prepares the prompt,
records the row as ready, and reports. The owner opens each session.

Why this is recorded rather than remembered: a session prompt in this pipeline is written to be
self-contained precisely so that whoever opens it gets the same session. Who *opens* it is the
owner's call, and a coordinator that quietly starts one has taken a decision about scope, cost
and timing that was never delegated. *(Earned the same day: a coordinator read one "move to the
next stage" as standing authorization and started an implementer session that would have written
and committed code. It was stopped before it wrote anything.)*

**Positional state.** A row's state is its folder, never a column. Live prompts sit in
`prompts/<role>/`; unconsumed reports sit in `handoffs/<role>/`; closed rows move to
`archive/plan_<n>/` at the coordinator's closeout ritual. A state transition is a file
move. Historical path references are never rewritten.

| Table | Rows |
|---|---|
| `plans/` | one plan per phase: `phase-NN-<slug>.md` |
| `prompts/{coordinator,implementer,reviewer,maintenance}/` | `<subject>-round-<n>.prompt.<role>.md` |
| `handoffs/{coordinator,implementer,reviewer,maintenance}/` | `<subject>-round-<n>.handoff.<role>.md` |
| `archive/pre_plan/` | the pre-planning rows (bootstrap, inventory rounds 1–2) |
| `archive/plan_<n>/` | that phase's closed prompts and handoffs |

**Filename rule, earned in the sibling project:** every archived row carries `.prompt.` or
`.handoff.` in its filename. A prompt and its handoff otherwise collide when both tables
flatten into one archive directory, and a plain `mv` silently overwrites one with the other.

**Frontmatter (row schema).** Prompts: `plan`, `role`, `round`, `date`. Handoffs
additionally: `state` or `verdict`, and `actor`. Every handoff body declares the session's
**full write perimeter** — documents, code, dependencies installed, commands run, tests and
their scope, tool-recorded state, commits — so a perimeter check compares a claim against
the tree rather than reconstructing one from nothing.

**Phase state machine** (tracker §4):

`NOT_STARTED → PROJECTED → PROMPT_READY → IMPLEMENTING → IMPLEMENTED → REVIEWING →
CHANGES_REQUESTED (→ IMPLEMENTING) → APPROVED`

- An agent updates only its own tracker row. Findings go to the phase plan's Review log.
- A phase begins implementation only when its predecessor is `APPROVED` (§7).
- **Projection** (`plan-projection`, reviewer role, `round: 0`) is mandatory for the phases
  §7 names and waivable elsewhere by the coordinator with a recorded one-line
  justification. The implementer prompt is compiled only after the projection handoff's
  ledger is fully routed, or the waiver is recorded. Two consecutive empty ledgers demote
  the gate to optional for this project, recorded here.
- **Review.** First review: full checklist against the phase's criteria and the semantic
  authorities. Re-review after a fix cycle: delta-scoped with a verified perimeter — `git
  diff` confirms only the fix prompt's allowed files changed, full adversarial depth on the
  changed seam, evidence per §10.5, settled areas not re-verified but anything seen wrong
  in passing reported. Each round gets a fresh prompt.
- **Checkpoint commits.** Every implementation and every fix cycle commits the moment it
  reaches `IMPLEMENTED`, subject line prefixed
  `CHECKPOINT (not approved): frontend NN …`, under the owner's standing authorization, so
  no round stops to ask. The phase is committed again at its approval gate. Checkpoints are
  never squashed: they are the provenance that makes "every mutation probe was reverted"
  and "nothing changed outside the perimeter" verifiable at all.
- **Compaction.** `APPROVED` is this project's context seam. The coordinator recommends
  compaction at each phase boundary and writes a context handoff before it. Compaction is
  the owner's call, never self-initiated.
- **Merging `main`.** Only at a backend `APPROVED` gate whose contracts this project
  consumes, never a cherry-pick and never against a phase plan's proposed shape. Every
  merge is recorded in the gate log (§11).

---

## 4. Progress tracker

One row per phase. `Criteria` is the count of `C<n>` rows in that plan's acceptance table,
derived from the tables, never typed forward: re-derive before any count-bearing gate.

| # | Phase | Plan file | Criteria | State | Date | Actor | Note |
|---|---|---|---|---|---|---|---|
| 01 | Repository baseline, visual foundation, test collection | `plans/phase-01-baseline-and-visual-foundation.md` | 8 | `APPROVED` | 2026-09-06 | coordinator | fix round 2 verified and approved **without a re-review round, by owner decision**. 31/31 rows, 15/15 named mutations plus 3 unnamed probes red and reverted; closing stamp `npm test` 137/137, `npm run test:e2e` 27/27, typecheck/lint/build clean. Approval basis and its limits recorded in §11.1 and the plan's Review log |
| 02 | Persistent shell: landmarks, divider, narrow width, containment | `plans/phase-02-workspace-shell.md` | 6 | `NOT_STARTED` | 2026-09-06 | planner | F30 absence half ships with its planted probe |
| 03 | Session runtime and the tab strip | `plans/phase-03-session-runtime-and-tabs.md` | 6 | `NOT_STARTED` | 2026-09-06 | planner | projection required (ordering) |
| 04 | Derived presentation: status, unread, the derivation register | `plans/phase-04-derived-presentation.md` | 6 | `NOT_STARTED` | 2026-09-06 | planner | projection required (derivations) |
| 05 | Turn dispatch, origin attribution, close/discard guard | `plans/phase-05-turn-dispatch-and-close-guard.md` | 6 | `NOT_STARTED` | 2026-09-06 | planner | projection required (attribution, destructive guard) |
| 06 | Agent surface: thread, autoscroll, composer, empty state | `plans/phase-06-agent-surface.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection waivable |
| 07 | Interaction pills and domain-result rendering | `plans/phase-07-pills-and-result-rendering.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection waivable |
| 08 | Clarification panel | `plans/phase-08-clarification-panel.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection required (omission-versus-skip) |
| 09 | Review surface: field set, provenance, unresolved information | `plans/phase-09-review-surface.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection required (provenance, absence) |
| 10 | Client preview, work-surface toggle, money rendering | `plans/phase-10-preview-and-money.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection required (money) |
| 11 | Review edits: inline edit, validation paths, replacement | `plans/phase-11-review-edits.md` | 8 | `NOT_STARTED` | 2026-09-06 | planner | projection required (paths, ordering) |
| 12 | Approval, creating, created and recovered | `plans/phase-12-approval-and-created.md` | 8 | `NOT_STARTED` | 2026-09-06 | planner | projection required (submit-once, terminality) |
| 13 | Failure taxonomy and recovery | `plans/phase-13-failure-taxonomy.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection waivable |
| 14 | Retained context and restoration on activation | `plans/phase-14-retained-context-and-restoration.md` | 8 | `NOT_STARTED` | 2026-09-06 | planner | projection required (precedence, category-C leakage) |
| 15 | Presentation boundary audit and fixture-era closure | `plans/phase-15-boundary-audit.md` | 7 | `NOT_STARTED` | 2026-09-06 | planner | projection required (absence claims) |
| 16 | Browser-to-server boundary | `plans/phase-16-transport-boundary.md` | 5 | `NOT_STARTED` | 2026-09-06 | planner | **gated on backend phases 11–14 `APPROVED` and merged** |
| 17 | Seam replacement, critical flow, closeout | `plans/phase-17-seam-replacement-and-closeout.md` | 5 | `NOT_STARTED` | 2026-09-06 | planner | **gated on backend phases 5, 6, 10–14 `APPROVED` and merged** |

Criteria total: **115** — re-derived on 2026-09-06 from the seventeen acceptance tables after
the phase-01 projection fold-back added C7 and C8 to phase 01:
8 + 6 + 6 + 6 + 6 + 7 + 7 + 7 + 7 + 7 + 8 + 8 + 7 + 8 + 7 + 5 + 5. A criterion is a distinct
`C<n>` in a phase's acceptance table; a lettered row inside a criterion is a row, not a
criterion. Row and named-mutation totals are derived per phase at dispatch, not carried
here, because they change with every fold-back.

---

## 5. Contract resolution

Re-derived for this planning act through `architectural_contracts/01-implementation-contract-guide.md`
§2 and §4, and its scenario **E** ("Port a screen from an interactive prototype") plus the
client half of scenario **A**. The intention's §2.2 is evidence for this derivation, not a
substitute for it; the result agrees with §2.2 and adds the section-level detail below.
Implementing sessions re-emit their own selection before coding and add anything this list
missed, saying so in the Review log.

### Selected

| Contract | Sections that bind here | Why it applies |
|---|---|---|
| `16-design-prototype-porting.md` | §1–§6 | the whole initiative is a port from a Claude Design prototype: the two directions of authority, the port protocol, the classification of every stateful concept before code, the translation table, the never-ported list |
| `05-client-architecture.md` | §1–§9 | components versus hooks, flow-state unions, the three kinds of client state and their owners, the `useState` → `useReducer` → feature-store ladder, the page-lifetime session model, errors and retry, accessibility, types from schemas, rendering agent output as proposed |
| `15-ui-styling-and-component-system.md` | §1, §3, §5; §2, §4, §6 **as drifted** | Tailwind is the mechanism; a visual value is defined once; `style` only for runtime-computed values; the composite-widget decision. §2, §4 and §6 name `src/styles/tokens.css`, three `src/components/ui/` primitives and a CSS-Modules foundation that no longer exist in the tree — conflict C-4, resolved in phase 01, not treated as a mandate to restore them |
| `02-runtime-boundaries.md` | §1–§3, §5–§8 | Server Components by default with the client boundary drawn at the interactive surface; what a `"use client"` graph may import; what may cross the boundary; secrets and env |
| `03-feature-architecture.md` | §1–§4, §6 | where the workspace lives, folder responsibilities, dependency direction, cross-feature imports, when to split or merge |
| `06-data-contracts-and-validation.md` | §1–§4, §6, §8 | types inferred from schemas, no hand-written boundary shapes, view DTOs, money and identifier rules, validation errors as data with array paths |
| `10-security-and-trust-boundaries.md` | §1–§4, §10, §11 | the browser is untrusted; nothing secret in client state; free text is data; external links; dependency additions |
| `11-testing-principles.md` | §1–§3, §5 | the component/interaction layer, ported UI proven by interaction tests, the one critical Playwright flow, no large DOM snapshots |
| `12-anti-patterns.md` | "Components and client", "Styling and UI system", "Prototype porting", "Structure and abstraction", "Documentation" | the negative image of the four concerns this project actually touches |
| `13-decision-checklist.md` | §1, §2, §5, §8, §9 | the pre-work questions for every file, component, hook and dependency this project adds; the naming table; the dependency-direction summary |
| `14-documentation-principles.md` | §6, §8 | the feature README at closeout; the documentation impact review; the stale current-state documents of C-4 |
| `04-server-architecture.md` | §3, §6 | read for the boundary the frontend eventually calls and the error taxonomy it renders — **not** to design server code. Binds phase 16 |
| `08-agent-architecture.md` | §6, §9 | the human-in-the-loop lifecycle the UI represents and the turn model it renders. The UI implements neither |

### Added by this re-derivation

No contract file beyond the intention's §2.2 list. Two **section-level** additions the
intention's §2.2 did not carry, both actionable in this project rather than merely read:

- `15-ui-styling-and-component-system.md` §5's requirement that adopting an accessible-primitive
  library be **recorded in `architectural_contracts/README.md` "Resolved decisions" with the
  widget that justified it**, together with `13-decision-checklist.md` §5's dependency rule.
  Owner decisions 5 and 6 took the product-side decision; the repository-level recording is
  still outstanding and is a phase-01 task.
- `14-documentation-principles.md` §8.3's standing closeout instruction, quoted verbatim into
  every implementer prompt this project compiles (§9 rule 9).

### Local (project rules that no contract states)

§9 of this file. Each is earned from this project's own artifacts or from the sibling
backend project's review history and is not a restatement of a contract.

### Excluded, with reasons

| Contract | Why not |
|---|---|
| `07-integrations.md` | the frontend calls no external system. Every external call is the server's, inside `src/lib/proposales/`. Phase 16 calls a backend service; it adds no adapter, no external host, and no vendor SDK. Reading it would not be wrong; introducing what it governs would be |
| `09-database-and-persistence.md` | no durable application-owned state is introduced. The workspace is page-lifetime only; the retained Main Application Surface context of §12A.21 is memory inside one browser page with no `localStorage`, `sessionStorage`, IndexedDB, cookie, URL parameter, or server round-trip, and no rehydration path. The no-database decision is inherited unchanged. **A phase that finds itself needing this contract has found a scope breach, not a persistence requirement** |

Selecting neither is a standing constraint, not a convenience: a phase that would need one
of them stops and routes to the coordinator.

---

## 6. Shared skeleton and naming registry

Everything a parallel session could otherwise name differently is fixed here. A phase does
not add a row; adding one is an amendment to this section.

### 6.1 Placement decisions (§14.3 items 2, 3, 5a — taken here, with reasons)

| Decision | Taken | Reason |
|---|---|---|
| Feature folder | the workspace is the **client half of the existing `proposal-preparation` feature**: `src/features/proposal-preparation/{components,hooks,client,types}` | contract 03 §6 — two "features" that always change together and share every schema are one feature. Every value the workspace renders is that feature's; a sibling would split one capability across two folders and add cross-feature edges for no boundary. Contract 03 §1 puts client and server folders inside one feature deliberately |
| Client boundary | `src/app/page.tsx` stays a **Server Component** and renders `<ProposalWorkspace />`; the `"use client"` directive is on the workspace root and nowhere above it | contract 02 §2 — "when a whole surface is genuinely interactive, the boundary is still drawn at the surface, not at the route". In V1 there is no server-rendered content to compose into the shell, so the surface *is* the boundary. A phase that finds server-rendered content to compose passes it as `children` rather than moving the directive |
| Store ladder position | one feature-scoped Zustand store, `useWorkspaceSessionStore`, in `hooks/use-workspace-session-store.ts`; disposable mechanics stay in `useState`/`useReducer` in the component or hook that owns them | contract 05 §5.1 row 3 — the active session id, the ordered tab list, and the per-session runtime records are read and written by the strip, the agent surface and the Main Application Surface simultaneously; prop-passing across three sibling subtrees has stopped being honest. One store, one concern; a second store requires an amendment here |
| View models and adapters | `src/features/proposal-preparation/client/view-models/` — one module per surface, exporting its view-model types and its `to<Name>ViewModel` adapter | contract 03 §2 makes `client/` the feature's browser-safe boundary folder, which is exactly what the §9 presentation boundary is. `components/` may not orchestrate or map; `hooks/` is reserved by convention for `use-*` modules and pure adapters are not hooks. Recorded as a deliberate reading of contract 03 §1's folder list, which is a default structure and not a closed set |
| Fixtures | `src/features/proposal-preparation/client/fixtures/`, one module per surface | keeps every temporary artefact in one place so phase 15's audit and phase 17's replacement have a single perimeter |
| Session tab strip mechanics | **Radix Tabs** (`@radix-ui/react-tabs`, added in phase 03) for tablist role, roving tabindex, arrow-key movement and selection semantics; reorder, close, unread, status and attention composed on top as Proposal Copilot behaviour | intention §5.3 and §4.1 — the primitive's tabs semantics match the interaction exactly. The criteria assert the behaviour, not the library: a phase that finds the primitive distorts the interaction uses native elements instead and records why |
| Ask-agent surface | **Radix Popover** (`@radix-ui/react-popover`, added in phase 11), anchored, with focus trapped while open | design 07 §3.7 anchors the surface to its field row and §5 requires focus moved in, trapped, Escape to close, and focus returned to the trigger. Anchoring is the load-bearing half; a centred Dialog would lose it |
| Close, discard and confirmation dialogs | the **native `<dialog>` element** with `showModal()`; no package | contract 15 §5 — native elements are the default for semantics the platform already provides, and `dialog` is on its list. Focus trap, Escape and focus return come from the platform |
| Work-surface toggle (Fields / Client preview) | a **native radio group** in a labelled group; no package | design 07 §5 admits a radio group; contract 15 §5 and intention §4.1 prefer native when simpler and correct |
| Confirmation of a further primitive | any phase adding another `@radix-ui/*` package records, in its Review log, the composite widget that justified it (contract 15 §5) and the packages it added | intention §4.1 — packages are added per milestone for the primitives actually used, never the ecosystem pre-emptively |

### 6.2 Module map (files that exist when phase 15 is approved)

```
src/app/
  layout.tsx                      root layout (existing; gains the skip link in phase 02)
  page.tsx                        Server Component; renders <ProposalWorkspace />
src/styles/
  globals.css                     reset, base typography, focus and reduced-motion treatment
  theme.css                       the Tailwind theme layer: the project's visual values, defined once
src/features/proposal-preparation/
  components/
    workspace/                    ProposalWorkspace, AgentSurface, MainApplicationSurface, WorkspaceDivider
    session-tabs/                 SessionTabStrip, SessionTab
    agent/                        AgentHeader, AgentStatusLine, AgentThread, AgentThreadTurn,
                                  AgentComposer, WorkingIndicator, AgentEmptyState
    pills/                        InteractionPill and its payloads
    clarification/                ClarificationPanel and its question blocks
    review/                       ProposalReviewSurface, ReviewFieldRow, ReviewBlockRow,
                                  ReadinessLine, ApprovalAction, AskAgentSurface
    preview/                      ClientPreviewSurface
    creation/                     CreatingSurface, CreatedSurface, CreationFailureSurface
    idle/                         ProposalPreparationIdleSurface
  hooks/
    use-workspace-session-store.ts  the one feature store (§6.1)
    use-turn-dispatch.ts            dispatch, origin capture, resolution routing
    use-close-guard.ts              the meaningful-work predicate and the creation refusal
    use-departure-guard.ts          the browser departure request
    use-thread-follow-state.ts      the two-state follow machine
    use-divider-width.ts            clamped page-lifetime width
  client/
    view-models/                  one module per surface: types + to<Name>ViewModel
    fixtures/                     one module per surface, era-marked
  types/
    session.ts                    SessionRuntimeRecord, TabStatus, RetainedContext, WorkSurface
    presentation.ts               PillKind, MainSurfaceState, ErrorTreatmentKey
  README.md                       written at closeout (phase 17)
e2e/
  bootstrap.spec.ts               reduced in phase 01, replaced by the workspace spec in phase 02
  workspace.spec.ts               the critical human-in-the-loop flow (phase 17)
```

A folder is created on first need, never because this map lists it. `schemas/` and
`server/` inside this feature are **backend-owned** and arrive by merge from `main`; no
session in this project creates or edits either.

### 6.3 Names, enumerations, and treatment keys

| Name | Value / members | Notes |
|---|---|---|
| `TabStatus` | `"working" \| "created" \| "questions" \| "ready" \| "idle" \| "empty"` | the six §12A.3 rows, declared in precedence order. Derived at render, stored nowhere |
| status text | `Working` · `Created` · `Needs you` · `Ready` · `Open` · `Empty` | design 04 §3.3; carried as text in the tab's accessible name |
| `PillKind` | `"thought" \| "ask" \| "link" \| "action"` | **four members in V1.** §12A.9's `diff` row is **structurally held**: no V1 result carries a server-supplied difference record, so a `diff` member would be dead scaffolding (charter rule 4). Named trigger to add it: a backend result that carries a difference record (§14.1 item 3) |
| `MainSurfaceState` | `"creating" \| "created" \| "review" \| "idle"` | the four §12A.22 (A) rows. **This is a state discriminant inside the one Proposal Preparation surface, not a surface-kind discriminant**; §12A.23 forbids the latter and a phase that widens this union's meaning to "which application surface" has built the forbidden construct |
| `WorkSurface` | `"fields" \| "preview"` | the closed presentation enumeration behind retained entry `workSurface` (§6.4) |
| `ErrorTreatmentKey` | the nine `ErrorDto` codes of contract 04 §6 plus `"unknown"` | ten rows, total; the code strings are the backend's and are imported, never re-declared |
| `RunFailureReason` rows rendered | `budget_exhausted`, `model_output_invalid`, `tool_output_invalid`, `script_exhausted` | backend master plan §6.3; `script_exhausted` is a test aid — reaching a production rendering path with it is a defect, not a state to render |
| domain result states | `clarification`, `proposition`, `failed`, `created`, `recovered` | backend master plan §6.3; imported, never re-declared |
| `SessionRuntimeRecord` | keyed by the page-lifetime session id; holds the thread presentation, the latest domain result presentation, the in-flight turn with its turn id, the unread counter, the retained context (§6.4), and — once a turn has run — the server-returned `ProposalWorkflowState` and `ConversationContext` **as returned** | §12A.1. Separate per session; never serialised into another's |
| page-lifetime session id | client-generated once per session | **never** submitted in any position, never compared to or derived from a Generation ID, never displayed as the session's identity (§12A.1) |
| Generation ID | server-created, inside the returned workflow state | never generated, reformatted, parsed or defaulted by the client |

**Naming rules this repository implies** (contract 13 §8, made explicit so no session
re-derives them): folders and files kebab-case; exported React components PascalCase, named
export; hooks `use` + camelCase, file `use-<noun>.ts`; the feature store
`use-<noun>-store.ts`; view-model types suffixed `ViewModel`; adapters `to<Name>ViewModel`;
booleans prefixed `is` / `has` / `can`; test files `<name>.test.ts(x)` beside their source;
one meaning per name — a name that already means something in this project or in §17A is
never overloaded.

### 6.4 Named constants (criteria assert the contract, never the literal — charter rule 13)

| Constant | Contract it carries | Home |
|---|---|---|
| `AGENT_PANE_MIN_PX` · `AGENT_PANE_MAX_PX` · `AGENT_PANE_DEFAULT_PX` · `MAIN_PANE_MIN_PX` | design 02 §3.2's clamp arithmetic, agent minimum winning over main minimum | phase 02 |
| `NARROW_WIDTH_TEST_SET` | the designed wide width, the specification's two stated thresholds, and the V1 floor (§12A.19) | phase 02 |
| `THREAD_FOLLOW_BOTTOM_THRESHOLD_PX` | the half-open bottom threshold: exactly at it is `following`, one unit beyond is `detached` (§12A.18) | phase 06 |
| `STATUS_ANNOUNCEMENT_DEBOUNCE_MS` | one announcement per settled state (§12A.17, design 04 §5) | phase 04 |
| `DIVIDER_KEYBOARD_STEP_PX` · `DIVIDER_KEYBOARD_LARGE_STEP_PX` | design 02 §5's keyboard model | phase 02 |
| retained-entry defaults (§6.5) | each entry's **declared default**, asserted as "the entry's declared default" and never as its literal value | phase 10, phase 11 |

`LIBRARY_PRICING_STATEMENT_ID` and every other §17A or backend-master-plan constant is
**backend-owned**: imported when it merges, and stood in for by an era-marked fixture until
then. The frontend never declares one.

### 6.5 The category-A retained-context entry set (§12A.21, closed, fixed before phase 10)

Per session, the retained Main Application Surface context is exactly these entries. Each
has a name, one admissible value domain, and one stated default. **A phase does not add an
entry**; adding one amends this section. The set is non-empty because intention §6 lists
session-controlled restoration among must-ship.

| Entry | Admissible value domain | Stated default | Written only by | Introduced in |
|---|---|---|---|---|
| `workSurface` | a member of the closed presentation enumeration `WorkSurface` (`"fields"` \| `"preview"`) | `"fields"` | the user operating the review header's work-surface toggle, in that session | phase 10 |
| `openedBlockContentId` | a domain identity: the `contentId` value a block of the session's current proposition carries | *none opened* — the review surface renders its default position with no block's replacement surface open | the user opening a block's replacement (retained-alternatives) surface on the review surface, in that session | phase 11 |

Both satisfy §12A.21's four conjunctive conditions: presentation-owned (neither has any
server authority); reference, not value (one is a closed-enumeration member, the other a
domain identity §12A.21 admits by name); the product of a deliberate user act on the Main
Application Surface (operating the toggle; opening a block to work on it); and not derivable
(neither is a §12A.7 register row nor computable from another entry plus the session's
server-returned objects).

**Candidates examined and excluded, with the condition each fails** — recorded so no phase
re-argues them and no session reads the set as thin:

| Candidate | Excluded because |
|---|---|
| scroll position of the Main Application Surface | condition 3 — a state that happened to the user, named in §8.6 category B |
| whether a review card, block detail or pill is expanded | condition 3 — a control's own open/closed mechanics |
| the ask-agent surface being open, and its typed text | condition 3 and §12A.14 — incidental popover mechanics; the typed text of an in-progress instruction is disposable |
| the leaf being inline-edited and its typed draft | §12A.14 — the typed text of an in-progress inline edit stays disposable, and one-edit-at-a-time is in-flight state |
| the readiness count, the tab status, a formatted amount, a provenance class | condition 4 and §12A.7 — every one is a register row, derived at render |
| the proposition, a leaf value, a `Money`, an item resolution, a draft reference, an editor URL, an `ErrorDto` | condition 1 and §12A.21's never-admissible list — category C, never promoted by being displayed |
| the composer draft | not a §8.6 entry at all: it is Agent Surface UI mechanics under §8.1 and owner decision 7, retained per session there and read directly by §12A.6 input (6) |
| the clarification panel's step position and unsent typed values | §8.1 category B, and Agent Surface rather than Main Application Surface |
| the last `MainSurfaceState` the session presented | condition 4 — §12A.22 (A) computes it from the session's own record at render; retaining it would let an entry override the state, which §12A.22 forbids |

**Two stored presentation values exist in this workspace and no more** (§12A.7): the unread
counter, and this retained context. Every other presentation value is either returned by the
server or computed at render from its one source. No derivation-register row may read an
entry, and no entry may be a register row's source.

### 6.5A The theme layer's scope (owner decision, 2026-09-06)

**The conflict, surfaced rather than silently chosen** (guide §6). Ratified intention §5.9 asks
for a "coherent, reusable visual foundation from design 01's surface, border, ink, semantic,
radius, shadow, type, and motion tables". Contract 15 §2 says "a token is added when a second
consumer needs the same value, **not in anticipation**" and prohibits "building a larger token
taxonomy (semantic layers, component-level tokens, multi-theme scales) … until repeated product
patterns demand it. **One flat set of values is the target.**" With zero screens built, phase 01
sits exactly between them, and its own plan contradicted itself — task 2 said express the eight
tables, its Notes said "the values V1 actually uses, not a taxonomy".

**Decision (owner, 2026-09-06, on the phase-01 projection's card 1): the flat base set.**

- The theme layer carries **design 01's base ramps once** — surface, border, ink, semantic,
  radius, shadow, type and motion — with design 01 §5's corrections applied where the corrected
  value and the prototype value differ.
- It carries **no semantic layer, no component-level value, and no multi-theme scale.** That is
  the half contract 15 §2 prohibits, and prohibiting it is what "one flat set of values is the
  target" means. The contract's "not in anticipation" rule governs taxonomy growth — which is
  what every neighbouring bullet in §2 is about — and not the flat ramp the intention ratifies.
- **A later phase does not invent a value.** It uses a ramp entry, or it amends this section.
  A phase adding a value to the theme layer records in its Review log which design 01 table row
  or §5 correction the value comes from.

**Why not the alternatives, recorded so no phase re-argues this.** *Whole system now* (every
value in every table, semantic layers included) ships dead values, which is the defect contract
15 §2 was written against. *Grow as needed* (only the values the current page reads) was the
projection's recommendation; it was declined because its stated safety mechanism does not exist:
the phase-01 purity check catches a literal typed into a **component**, and cannot catch a later
phase adding a slightly different grey to the theme layer itself. Growing incrementally trades
"unused values" for "values that quietly stop matching design 01", and nothing in this project
would observe the second.

**The instrument for "no component-level value" is an allowlist, never a denylist** (added
2026-09-06, phase-01 review round 1 B2). This section closes the name set by construction — "a
later phase does not invent a value; it uses a ramp entry, or it amends this section" — so the
only enforceable form is *the declared name set is a subset of design 01's enumerated ramp
names*. A denylist cannot measure this prohibition at all: the name universe is open, so a
denylist proves only that the forbidden list matches itself. Earned concretely — the shipped
nine-fragment denylist passed five planted component-level values, four of them nouns the list
never contemplated. **No later phase re-derives a denylist here.**

**What is measured and what is not.** Phase 01 C7 asserts, in the browser, that design 01 §5's
corrections are the values that landed, and asserts with a planted probe that no semantic or
component-level name is declared. **Value-by-value fidelity of the ramps to design 01's tables
is verified at review, not by test**, deliberately: a test transcribing the same table into
assertions proves only that two copies of one table agree, and it is the row-that-cannot-fail
shape. The reviewer reads the ramp against design 01.

### 6.6 Fixture-era markers and the two eras (§12A.8, §9.3)

| Era | A fixture is | Named |
|---|---|---|
| before the owning backend schema phase has merged | a literal that populates a view model directly | module `<noun>.temporary-fixture.ts`, exports prefixed `temporaryFixture` |
| after the owning backend schema phase has merged | the **parse result of a literal through the owning schema**, flowing through the production adapter | module `<noun>.fixture.ts`, exports prefixed `fixture` |

No fixture contains real personal or customer data. A fixture that survives onto a
production path is an explicitly named placeholder, never an unmarked literal. Phase 17
converts each module and its name together; a module that keeps the temporary marker after
its schema has merged is a defect.

---

## 7. Sequencing, gates, and ledger coverage

### 7.1 Order and true dependencies

```
01 baseline ──▶ 02 shell ──▶ 03 session runtime + tabs ──▶ 04 derived presentation
                                   │
                                   └──▶ 05 turn dispatch + close guard
                                              │
        ┌─────────────────────────────────────┴───────────────────────────────┐
        ▼                                                                     ▼
06 agent surface ──▶ 07 pills ──▶ 08 clarification            09 review ──▶ 10 preview + money ──▶ 11 review edits
                                                                                      │
                                                              12 approval + created ◀──┘
                                                                        │
                                                              13 failure taxonomy
                                                                        │
                                                              14 retained context + restoration
                                                                        │
                                                              15 boundary audit  ── fixture era ends here
                                                                        │
                                              (backend 11–14 APPROVED) 16 transport boundary
                                                                        │
                                              (backend 5,6,10–14 merged) 17 seam replacement + closeout
```

Phases run **serially**: a phase begins only after its predecessor is `APPROVED`. The
diagram shows true dependencies, not an invitation to parallelise; gating is what contains a
defect inside one phase boundary.

**Phases 16 and 17 are gated on backend approvals that do not exist yet.** Backend phases
1–3 are `APPROVED`; 4–15 are `NOT_STARTED` (backend master plan §4). Phases 01–15 therefore
build every surface on era-marked fixtures and close green on their own. Phase 16's prompt
is not compiled until the backend phases it names are `APPROVED` and merged into this
branch; phase 17's likewise. **Neither is a reason to invent client authority in the
meantime**: a phase that would need a backend contract that has not merged uses a fixture
and an era-marked adapter, and says so.

### 7.2 Projection gate

Mandatory (the phase touches a silent-failure mechanism — charter rule 6: derivations,
reconciliation rules, ordering, money, identity, destructive guards, absence claims):
**03, 04, 05, 08, 09, 10, 11, 12, 14, 15.**

Waivable by the coordinator with a recorded one-line justification: **01, 02, 06, 07, 13,
16, 17.**

Two consecutive empty projection ledgers demote the gate to optional for this project; the
demotion is recorded here when it happens.

### 7.3 Ledger coverage — which phase serves each entry

Every F entry is served by at least one criterion, and every criterion traces back to one of
these or to a mechanism contract. A phase's own acceptance table carries the per-row trace
cells; this is the project-level check in the other direction.

| Ledger | Served by |
|---|---|
| F1 | 14, 17 |
| F2 | 07, 13, 16 |
| F3 | 08 |
| F4 | 09, 11 |
| F5 | 12, 13, 17 |
| F6 | 01, 02, 03, 04, 06, 07, 08, 09, 10, 11 |
| F7 | 15, 16 |
| F8 | 03, 16 |
| F9 | 05 |
| F10 | 04, 05 |
| F11 | 04 |
| F12 | 03 |
| F13 | 05, 06, 08, 12 |
| F14 | 04, 06, 07, 14 |
| F15 | 15, 17 |
| F16 | 05, 07, 13 |
| F17 | 09 |
| F18 | 09, 10 |
| F19 | 10, 12 |
| F20 | 08 |
| F21 | 11 |
| F22 | 12, 17 |
| F23 | 13, 16 |
| F24 | 02, 03, 06, 08, 11, 12, 13, 14 |
| F25 | 06 |
| F26 | 02 |
| F27 | 06, 07, 10, 12 |
| F28 | 10, 11, 14, 15 |
| F29 | 02, 14 |
| F30 | 02, 03, 14 |

### 7.4 Trace-cell vocabulary

A criterion's trace cell carries **one measurement anchor**, optionally followed by supporting
citations. The anchor is what the trace chain checks in both directions; the supporting
citations are context and are not themselves traces.

**The anchor** is one of:

- a measurement-ledger ID, `F1`–`F30`;
- a mechanism contract, `§12A.1`–`§12A.23`;
- an architecture contract section, written `15 §2` style — **admissible only for the
  criteria enumerated here**, because they serve a repository engineering constraint rather
  than a product measurement, and each names the defect it guards: phase 01 C1 and C3
  (`15 §2`), phase 01 C4 (`11 §1`), phase 01 C5 (`15 §4`), phase 01 C6 (`11 §3`), phase 01 C8
  (`14 §8`), phase 17 C4 (`14 §6`), phase 17 C5 (charter manifest property 5).

  **Phase 01 C6 was added to this enumeration on 2026-09-06** by the coordinator's
  pre-dispatch plan lint. The plan shipped C6 tracing to `11 §3` while this list omitted it,
  which made the row's trace cell inadmissible by this section's own rule. C6 was checked
  against the measurement ledger and serves no F entry: "the end-to-end suite is honestly
  green against the tree the phase leaves" is a repository engineering constraint of exactly
  the class this bullet admits, and it names the defect it guards (a permanently red CI step
  normalised into "expected", which is how a real end-to-end regression later goes
  unnoticed). The enumeration was therefore corrected here rather than the criterion
  re-rooted to a measurement it does not have.

  **Phase 01 C8 was added on the same day**, when the projection fold-back created it — the
  criterion that measures the documentation half of conflict C-4. It anchors on `14 §8` and,
  like C6, serves no `F` entry: no measurement-ledger objective covers "the repository's
  current-state documents are true". Recorded plainly because the coordinator authored C8 and
  then had to catch its own inadmissible anchor by re-running the same check that had just
  found C6's — the enumeration is easy to forget precisely when a fold-back adds a criterion.

Any other criterion tracing only to an architecture contract is a criterion that has not
found its measurement, and is cut or re-rooted before the plan ships.

**Supporting citations** may follow the anchor in the same cell, separated by `·`. They carry
the authority a reader needs to interpret the row and they are not required to be one of the
anchor forms. The vocabulary in use across this project's plans, enumerated from the plans
themselves rather than prescribed: architecture-contract sections (`05 §7`), design
specification sections (`design 07 §5`), backend intention sections (`§17A.7`), intention
sections (`§5.4`, `§8.6`, `§14.1`), this file's own sections (`§9.3`, `§10.3`), ratified owner
decisions and boundaries, conflict IDs (`C-1`–`C-6`), and charter rules. A supporting citation
must resolve and must support what the row asserts, exactly like an anchor; it simply is not
the row's declared measurement.

**Recorded 2026-09-06, because getting this wrong nearly cost 110 rows.** The phase-01
projection read this section's original "names **one** of" as "exactly one citation" and
proposed reducing the cells that carry more. The coordinator checked the claim against the
artifact set before applying it: **110 of the project's 113 criterion rows carry more than one
citation**, so multi-citation cells are the planner's deliberate, universal convention and not
a phase-01 slip — and reducing them would have deleted real authority from every plan. The
coordinator then tested the property this section actually protects, mechanically, over all
113 rows: *does every row carry a measurement anchor unless it is one of the enumerated
architecture-contract exceptions?* Exactly six rows carry no `F` or `§12A` anchor — phase 01
C1, C3, C4, C5, C6 and phase 17 C4 — which is precisely the enumerated set above. The property
held everywhere; only this section's description of the vocabulary was too narrow. The
description was corrected; no criterion row was touched.

### 7.5 Structurally held clauses, and what converts each

| Held clause | Phase | Named trigger that converts it into a real assertion |
|---|---|---|
| F15's seam-replacement half — presentation components byte-identical, existing tests unedited | 15 C7 | the first backend schema phase this project consumes is `APPROVED` and merged (phase 17) |
| F8's "no client-generated identifier appears in any submitted payload", over a real submission | 03 C1 | the browser-to-server boundary exists (phase 16 C5) |
| the `diff` pill kind and its payload | 07 C3 | a backend result carries a server-supplied difference record (§14.1 item 3) |
| typed clarification questions — option lists, amounts, dates, units, per-question notes and skip labels | 08 C5 | a backend amendment supplies typed questions (§14.1 item 1) |
| live progress steps in the `thought` pill and in the creating presentation | 07 C3, 12 C5 | a backend contract defines a safe user-facing progress representation (§14.1 item 4) |
| field-scoped revision as a structured turn parameter | 11 C7 | §14.1 item 2 is decided by the backend |
| phase 01 C7(a)'s row for design 01 §5 **correction 2** — the `✦` ask affordance resting at `--color-fg-quiet`, or hover-revealed **and** keyboard-reachable with the global focus ring | 01 C7(a) | phase 11 builds the ask-agent affordance (§11.3 follow-up 11) |
| phase 01 C7(a)'s row for design 01 §5 **correction 3** — `#0b0b0c` ink composed on `--color-accent`, never white | 01 C7(a) | phase 12 builds the primary/approval action (§11.3 follow-up 12) |

Each is marked in its phase plan as **structurally held** with this trigger, so no row looks
testable when it is not.

---

## 8. Tool protocols

Detected in this worktree, not assumed:

- **Architecture graph:** none. No `.archgraph/` directory and no archgraph tooling exists
  here. Sessions record no graph delta; a session that reports one has reported something
  that does not exist.
- **Contract system:** present (`architectural_contracts/` plus its routing guide and the
  repository's Architecture Context policy). Every session re-runs the routing and emits its
  own selection (§5).
- **Version control:** git, in a **worktree** whose stash stack is shared with the main
  checkout and other worktrees. Never `git stash` / `git stash pop` bare; prefer a temporary
  WIP commit. Run every command from this worktree root; never enter the sibling backend
  worktree.
- **Package manager:** npm, one `package-lock.json`. A phase that adds a package installs
  exactly the packages its criteria need and records them plus the resolved versions in its
  Review log (contract 13 §5, intention §4.1).
- **No tool is invented.** A protocol this section does not name does not exist in this
  project.

---

## 9. Standing rules

The charter's quality rules apply verbatim. These are this project's own, each earned.

1. **The frontend never authors, edits, copies, extends, or corrects a backend-owned
   schema, domain shape, service interface, view DTO, or integration schema.** A field the
   presentation needs and the domain does not carry is a deliberate change to the backend
   intention, routed to the coordinator — never an untyped field added to the UI.
2. **No prototype architecture, intelligence, timing, or data is ported.** Design 10 §7's
   blocklist is a standing perimeter for every phase, not a phase-01 checklist: every regex
   that "understands" text, every fake timer, every seeded id, every hard-coded amount, the
   snapshot session engine, the hover rail, the session-history panel, and every convenience
   object named there.
3. **Every fixture is era-marked (§6.6), and after its schema merges it is that schema's
   parse result.** A fixture exported as the literal rather than as the parse result does not
   satisfy §12A.8, whatever it is named.
4. **A visual value is defined once** in the theme layer and never repeated as a literal
   across components. Inline `style` is only for values that cannot be known at build time —
   the dragged pane width is the V1 example, and it is the only one until a phase records
   another.
5. **Accessibility is part of implementing an element, never a later pass.** A composite
   built on an adopted primitive is verified to the same standard for labels, accessible
   names, focus transitions, keyboard flows, announcements, contrast and reduced motion; the
   primitive's presence is never taken as proof.
6. **Where a design specification and an accessibility correction disagree, the correction
   wins** (design 01 §5, design 10 §5). Where a design specification and §13 disagree, §13's
   resolution wins and the specification gets a recorded delta.
7. **A design delta is recorded, never implemented as a design decision.** V1 implements the
   current specification behaviour where it does not conflict with §13, leaves a marker, and
   reports (design 10 §4). No session edits a file under `ui_design/`.
8. **A guard, an absence claim, or a purity check ships with its planted-defect probe** —
   the defect planted, the red observed, the probe reverted, the ledger row written. Measuring
   an absence proves the absence; it does not prove the instrument could observe the presence.
9. **Every implementer prompt carries contract 14 §8.3's closeout sentence verbatim**, and
   the phase's Review log records what documentation was evaluated and what was patched.
10. **Named mutations are applied on the tree and reverted**, and the handoff lists every
    probe file. A mutation "verified by inspection" is unrun.
11. **Counts are derived from the artefact they count**, never typed forward. Re-derive
    before any count-bearing gate.
12. **Every test traces to a criterion row.** A test with no row is either deleted or
    declared in the Review log as a candidate criterion, naming the defect it catches and the
    ledger entry it serves, for the coordinator to fold in or refuse with a recorded reason.
13. **A test added under `src/features/**` must be confirmed collected.** Until phase 01
    repairs the runner configuration, and after any change to it, the session confirms its
    file appears in `npx vitest list` (§10.3 hazard).
14. **The tab status never decides a close, and the close guard never reads the tab status.**
    A criterion or a test that reaches for the status to decide a close is the exact defect
    owner decision 7 was ratified to prevent (§12A.6, inventory round 2 §5 row A).
15. **Checkpoint provenance is per cycle.** Stage only that cycle's declared files plus the
    tracker and Review-log edits it actually made. A checkpoint never claims a narrower diff
    than it contains.
16. **`npm run test:e2e` and `npm run build` are part of the definition of green**, because
    CI runs both on every push. A phase must not leave either red.

---

## 10. Environment topology

Verified 2026-09-06 by reading the repository's committed configuration at `c0e9f81`. If
reality disagrees, update this section.

### 10.1 Runtime and tools

| Item | Value | How established |
|---|---|---|
| Framework | Next.js `^16.3.4` App Router, React `^19.2.8`, TypeScript `^6.0.3` `strict` | `package.json`, `tsconfig.json` |
| Styling | Tailwind CSS `^4.3.3` via `@tailwindcss/postcss`; `postcss.config.mjs` declares that one plugin | `package.json`, `postcss.config.mjs` |
| Validation | Zod `^4.5.4` | `package.json` |
| Client state | Zustand `^5.0.15` installed | `package.json` |
| Icons | `lucide-react` `^1.41.0` installed | `package.json` |
| Accessible primitives | **none installed.** `@radix-ui/*` packages are added per milestone (§6.1) | `package.json` |
| Test runner | Vitest `^5.0.0`, two projects (§10.3), `@testing-library/react` `^16.3.3`, `jest-dom` `^7.0.1`, `jsdom` `^30.0.1` | `vitest.config.mts`, `package.json` |
| End-to-end | Playwright `^1.62.1`, Chromium, `testDir: ./e2e`, starts `npm run dev` itself, `baseURL http://localhost:3000` | `playwright.config.ts` |
| Lint | ESLint 9, `eslint-config-next/core-web-vitals`, **plus the boundary rules that already exist**: `process.env` restricted outside `src/lib/env/`; `components/`, `hooks/`, `client/` forbidden from importing `**/server/**` except `server/actions.ts` and from `@/lib/proposales`, `@/lib/ai`, `@/lib/agent`, `@/lib/env/server`; `schemas/` and `types/` forbidden from React, `next/*`, `@/lib/env/*`, `server-only`; `src/lib/**` forbidden from importing `@/features/**` or `@/app/**` | `eslint.config.mjs` |
| CI | `.github/workflows/ci.yml`, Node 22, on every push and pull request: `npm ci` → playwright install → `npm run typecheck` → `npm run lint` → `npm test` → `npm run test:e2e` → `npm run build` | the workflow file |
| Deployment | one Vercel deployment | intention §2.1 |
| Environment variables | seven, all server-only, listed in `.env.example`; `.env` is git-ignored | `.env.example`, `.gitignore` |

### 10.2 Baseline and its caveats

The intention's §2.1 verification baseline — `npm run typecheck`, `npm run lint`, `npm test`
(11 files, 118 tests) and `npm run build` green at `25d6b28` — is the shaper's recorded
evidence of 2026-09-05. **This planning session was documentation-only and did not re-run
it.** The first implementing session re-enumerates the baseline before changing anything and
records what it observed.

Four caveats a phase must know before it measures anything:

1. **The end-to-end step is expected red.** `e2e/bootstrap.spec.ts` asserts a `banner`
   landmark containing "Proposal Copilot", a visible `main`, and a focusable
   "Skip to content" link. `src/app/layout.tsx` renders `<html><body>{children}</body></html>`
   and `src/app/page.tsx` returns `null`; none of the three exists. CI runs
   `npm run test:e2e`, so this is a live red step, not a dormant one. Phase 01 reduces the
   spec to what the tree actually renders; phase 02 replaces it with the workspace spec.
   *(Derived by reading the spec against the two committed components, not from a run.)*
2. **Seven custom properties in `src/styles/globals.css` have no definition.** Since
   `tokens.css` was deleted, `--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-accent`,
   `--color-focus`, `--space-4` and `--space-8` resolve to nothing; Tailwind 4's default theme
   supplies `--font-sans`, `--font-mono`, the `--text-*` ramp and the `--leading-*` ramp, but
   none of those seven. The base layer therefore has no background, foreground, focus colour
   or block rhythm. *(Derived by grepping `node_modules/tailwindcss/theme.css`.)* This is the
   concrete, code-level half of conflict C-4 and phase 01 closes it.
3. **The Vitest project globs do not partition the tree, and the gap is exactly where this
   project writes tests.** The `node` project claims `src/lib/**/*.test.ts`,
   `src/features/**/*.test.ts` and `test/setup/node.test.ts` in a **`node` environment**; the
   `jsdom` project claims only `src/app/**/*.test.tsx`, `src/components/**/*.test.ts` and
   `src/components/**/*.test.tsx`. So a component test at
   `src/features/proposal-preparation/components/**/*.test.tsx` is claimed by **no** project
   and is silently not collected, and a hook test at `src/features/**/*.test.ts` is collected
   into a DOM-less environment. Phase 01 C4 repairs this and proves the repair with a planted
   probe. Until then, standing rule 13 applies.
4. **Stale current-state documents.** Every statement below describes a foundation commit
   `f957f66` deleted. Phase 01 patches all of them to current truth and records Radix UI
   Primitives and Lucide per contract 15 §5 and 13 §5. **The list was widened on 2026-09-06**
   by the phase-01 projection, which found the original enumeration short by six statements —
   two of them in contracts that no perimeter in this project named at all:

   - root `README.md`: the status paragraph; the Tailwind/token line; the tree diagram's
     `src/components/ui/` and `src/styles/` "design tokens" entries; and the
     "Application shell, styling foundation, and shared UI primitives" line.
   - `architectural_contracts/README.md`: the "Scaffold decisions record" styling and
     component-library rows; the "Resolved decisions" styling and component-library rows; the
     CSS-Modules "Known conflicts" row; the "product-neutral shell (root layout, styling
     foundation, three shared primitives)" sentence; and the tree diagram's `components/ui/`
     and "design tokens" entries.
   - `15-ui-styling-and-component-system.md` §2, §4 and §6 — and **§1's `cx()` sentence**,
     which names `src/components/ui/cx.ts`, a file phase 01 C5(b) requires not to exist. §1 is
     selected by §5 of this plan as binding **as written**, so a stale current-state claim
     inside it is the sharpest form of this drift.
   - `12-anti-patterns.md`'s styling row, which prescribes "A token in `src/styles/tokens.css`,
     wired into the Tailwind theme" as the remedy for hard-coded values — pointing the reader
     at the deliberately deleted file, in the very contract section phase 01 C5's trace cites.
   - `15-ui-styling-and-component-system.md` §3's `globals.css` sentence, which states a
     three-item scope where §6.2 of this plan sanctions four (it omits the reduced-motion
     treatment).

   - `13-decision-checklist.md` §5 item 32, which lists "a component library" among the
     decisions **not** yet ratified. Phase 01's own decision-recording made that false.
     *(Added 2026-09-06, review round 1 S1.)*

   **Read this caveat as "every document this phase's change makes stale", not only as the list
   authored before the phase ran.** Two falsehoods were created *by* phase 01's own work and
   missed by its closing documentation review — the item above, and the root README's
   end-to-end-spec description. A phase's documentation-impact review covers what its change
   made untrue, not only what a caveat enumerated in advance.

   Guide §6's "the contract is stale → patch the contract in its own change, with rationale"
   applies to all of them, and phase 01 is that change. **No rule is weakened by any of these
   patches**: only the description of what exists changes.

### 10.3 Vitest layout after phase 01

Phase 01 repairs the two projects so that they partition every `*.test.ts(x)` under `src/`
and `test/`. The exact include globs are phase 01's to write; the **contract** they must
satisfy is stated below.

**Amended 2026-09-06** after the phase-01 projection found this contract enumerated four
locations while requiring a total partition — so `src/styles/**` (where phase 01's own new
test file lands), `src/features/**/client/**` (where phase 04's view-model and adapter tests
land) and `src/features/**/types/**` were required to be claimed by exactly one project and
assigned to none. A contract that demands totality and enumerates a subset is not a contract;
the rule below is total by construction, because it partitions on two axes that between them
cover every file.

**The partition rule.** Every `*.test.ts(x)` under `src/` or `test/` is claimed by **exactly
one** project:

- **DOM project (`jsdom`)** claims: every `*.test.tsx` under `src/` or `test/` — a `.tsx` test
  renders; and every `*.test.ts` under `src/features/**/hooks/**` — a hook test needs a DOM
  even when it renders no markup.
- **`node` project** claims: every other `*.test.ts` under `src/` or `test/`. That is
  `src/lib/**`, `src/styles/**`, `src/app/**`, `src/components/**`, `src/features/**/client/**`,
  `src/features/**/types/**`, and `test/**` — every one of them a module with no DOM
  dependency.
- Neither project claims `e2e/**` or `**/*.live.test.ts`; both stay excluded from both.
- The offline `fetch` guard stays installed in **both** projects.

The two axes are *extension* (`.tsx` renders, so DOM) and *one named directory* (feature
`hooks/`). Everything else falls to `node` by construction, so a location this document has
never heard of is still claimed exactly once — which is the property the four-location
enumeration lacked.

**Where phase 01's own foundation tests land.** The source-level checks (the purity check, the
absence rows, the collection assertion) read files from disk and need no DOM, so they are
`node`. The rendered-document checks do not run under Vitest at all — see §10.3A.

The offline `fetch` guard is installed in both projects today (`test/setup/node.ts` and
`vitest.setup.ts`) and stays installed: no test in this project may reach the network.

### 10.3A Measurements that no Vitest project can take (added 2026-09-06)

The phase-01 projection established, at source, that **neither configured Vitest project can
measure a rendered document's computed style** in this repository, and the finding is
permanent rather than phase-01-local:

- **jsdom does not resolve `var()`.** `node_modules/jsdom/lib/jsdom/living/css/CSSStyleDeclaration-impl.js`
  carries the line `// TODO: Resolve css var().` and returns the literal `var(--x)` text. Every
  custom property this project defines is therefore unmeasurable there.
- **jsdom has no media-query facility at all.** No `matchMedia` and no `MediaQueryList`
  implementation exists anywhere in the package, and `getComputedStyle` does not apply `@media`
  blocks. `prefers-reduced-motion` cannot be entered.
- **The stylesheet never reaches the document.** `src/styles/globals.css` begins
  `@import "tailwindcss"`, which requires PostCSS; Vitest does not process CSS imports into the
  jsdom document and `vitest.config.mts` sets no `css` option.

**Consequence, binding on every phase.** A criterion that asserts *what the browser computes* —
a resolved custom property, a focus indicator, a media-query-conditional treatment, a real
cascade — is measured in **Playwright**, against the running application, and says so. A
criterion that asserts *what the source says* is measured in Vitest. A phase that writes a
computed-style assertion into a Vitest test has written a test that cannot observe its own
subject, which is charter rule 15's family.

Playwright can take all three measurements: `reducedMotion` is a supported context option in
the installed `playwright-core`, Chromium is installed, and `playwright.config.ts` starts
`npm run dev` itself, so the application is served with its real processed stylesheet.

### 10.4 Commands and evidence scopes

| Scope | Command | Default use |
|---|---|---|
| **L1** targeted | `npx vitest run <path> [-t "<name>"]` | "does this named test redden under this named mutation"; per-criterion checks |
| **L2** domain | `npx vitest run --project jsdom src/features/proposal-preparation` | cycle-internal completion checks; mutations whose criteria name cross-file bite sets |
| **L3** integration | `npx vitest run src/features/proposal-preparation src/lib` | a change spanning the presentation boundary and a library value shape |
| **L4** full suite (the closing stamp) | `npm test` **plus** `npm run typecheck` **plus** `npm run lint` | the one authoritative clean stamp closing each implement or fix cycle; review entry when the reviewer's tree differs from the last stamp; the approval gate |
| **L4+** rendered structure | additionally `npm run test:e2e` and `npm run build` | any cycle that changed `src/app/**`, a landmark, the styling entry point, or the build configuration (standing rule 16) |

**Evidence identity.** Every record carries hypothesis, scope, exact command, tree identity,
result, and the failure-ID delta where applicable. Tree identity is the checkpoint commit SHA
plus an asserted-clean `git status --porcelain`; a dirty tree is identified by SHA **plus a
digest of `git diff`**.

**Budget.** Exactly one L4 stamp per cycle, taken on the tree actually handed over. A session
that changes anything after taking its stamp re-takes it, and the re-take is not over-budget.
Re-running evidence whose tree identity matches yours, with no variation and no pre-run
authorization line, is a finding against the session.

### 10.5 Safety rules

- No test reaches the network; the offline guard is installed in both projects (§10.3).
- No test reads `.env`; configuration is constructed explicitly.
- No fixture contains real personal or customer data.
- The frontend performs no live Proposales mutation at any point in phases 01–15: there is
  no transport. Phase 16 introduces one and inherits the deployment-protection rule of
  intention §4 and §10.3 — where adequate deployment protection is absent, live mutation
  actions are not exposed.

---

## 11. Absorbed project index, gate log, and registers

This section absorbs the project README, which is now a one-screen pointer to this file.

### 11.1 Gate log

| Gate | Result |
|---|---|
| Intention | `RATIFIED` 2026-09-05 by David on the §15.1 surface; §16 round 2 |
| Owner decisions 5–6 (dependency foundation) | ratified 2026-09-06; §16 round 3 |
| Mechanism inventory round 1 | `PASSED` 2026-09-06; §12A.1–§12A.20, F8–F27; §16 round 4. Owner decisions 7–10 ratified its four recommendations; §16 round 5 |
| Owner decision 11 (persistent shell + Main Application Surface) | ratified 2026-09-06; §16 round 6 |
| Mechanism inventory round 2 | `PASSED` 2026-09-06; §12A.21–§12A.23, F28–F30; §16 round 7. Owner decision 12 ratified its sole recommendation; §16 round 8; exit gate fully passed |
| Implementation planning round 1 | **this file plus 17 phase plans**, 2026-09-06 |
| Pipeline documentation commit | `a9d9fc0`, 2026-09-06 — the plan set, the ratified intention amendments (inventory rounds 1–2, owner decisions 7–12; the owner confirmed on 2026-09-06 that this is the content the plan set was written against), the reduced README, and the `archive/pre_plan/` move. Committed before phase 01 was dispatched so the phase's checkpoint diff carries only its own work |
| Coordinator handover round 1 | 2026-09-06 — the coordinator role moved from a Codex session to a Claude session. The charter's role split is unchanged: coordinator and reviewer are Claude-side, the implementer is Codex. §7.4 amended by the pre-dispatch plan lint (phase 01 C6) |
| Phase 01 projection gate | **not waived**, 2026-09-06 — see the tracker note and §7.2 |
| Phase 01 projection round 0 | `AMENDMENTS_REQUIRED`, 2026-09-06 — 21 ledger rows, 1 owner card. Consumed by the coordinator the same day: write perimeter verified against the tree (one file, the handoff), zero L4 evidence spent as budgeted, and its load-bearing claims independently re-verified before routing. All 21 rows routed; one (L14) routed differently from its proposal, with the reason recorded in §7.4 and in the phase plan's Review log |
| Phase 01 fix round 2 | `IMPLEMENTED`, 2026-09-06, actor **Codex** — the standing split's cross-family property was available again for this round. All eight routed corrections implemented, none declined. 15 named mutations plus the 3 coordinator-required unnamed probes, all red and reverted |
| **Phase 01 `APPROVED`** | 2026-09-06, by the coordinator, **without a re-review session, on the owner's explicit decision**. What that means, recorded rather than glossed: the coordinator verified the eight corrections landed, re-derived the mutation arithmetic, checked the cycle-scoped perimeter against the checkpoint, and independently exercised the round's central guard with **seven** component-level names — the five the reviewer planted plus two of the coordinator's own invention — all now caught, against two legitimate ramp names that pass. What was **not** done is a full adversarial re-review of the changed seam by an independent session. The residual risk is concentrated in the six should-fix repairs the coordinator verified structurally rather than by independent mutation |
| Phase 01 review round 1 | `CHANGES_REQUESTED`, 2026-09-06 — 2 blocking, 6 should-fix, 6 notes, 0 owner decisions. Zero L4 runs: the reviewer's tree was byte-identical to checkpoint `d30ef8f`, verified, so the implementer's stamp was cited and thirteen independent L1 mutants were spent on variation instead. Consumed by the coordinator the same day; perimeter and both blocking findings re-verified independently before routing |
| Owner decision 13 (theme-layer scope) | 2026-09-06 — **the flat base set**, no semantic or component-level layer. Resolves the projection's card 1 and the §5.9-versus-contract-15-§2 conflict it surfaced. Recorded in §6.5A |
| Owner card 1 (handover round 1) resolved | 2026-09-06 — the owner confirmed the split and recorded that Codex sessions are exhausted: phase 01 is implemented by a **Claude Sonnet 5** session and reviewed by a **Claude Opus 5** session. Recorded as a substitution in §3, with what it keeps and what it spends |
| Backend phases merged from `main` | 1 (topology and environment), 2 (errors, logger, shared value shapes), 3 (Proposales adapter: transport, error translation, content read) — all `APPROVED`. Backend phases 4–15 `NOT_STARTED` |

Every future `main` merge is recorded here with its date and the backend phases it brought.

### 11.2 Design-delta register (reported, never implemented as a design decision)

Carried forward from inventory rounds 1 and 2, plus this planning pass. Each is owned by the
design specifications (intention §14.2, design 10 §4); V1 implements the current
specification behaviour where it does not conflict with §13, leaves a marker, and reports.

| # | Delta | Origin |
|---|---|---|
| 1 | the human-edit versus agent-revision flag vocabulary ("Updated" has no V1 source) | inventory 1 |
| 2 | `ready` versus `created` dot distinction | inventory 1 |
| 3 | the thread autoscroll threshold distance (80px is suggested, not measured) | inventory 1 |
| 4 | abandoned-drag order (restore drag-start order, or keep the last committed move) | inventory 1 |
| 5 | the narrow-width mechanism below the designed width | inventory 1 |
| 6 | "Skip all" semantics (resolved as preserving typed answers; the specification is ambiguous) | inventory 1 |
| 7 | design 07 §4.3's "toggle state is disposable UI" versus the intention's category-A treatment | inventory 2 |
| 8 | the Main Application Surface **idle** state has no design; the prototype filled that space with the excluded list view | inventory 2 |
| 9 | the approval control's enabled / disabled / warning treatment while unresolved information remains (C-3, §14.2); V1 keeps the control always available, replaces "push" with creation vocabulary, and presents unresolved information beside it | this planning pass |
| 10 | **the creation error state is designed only in outline** (design 09 §4.3): its medallion values are inferred from the attention tokens rather than read from the prototype, and its copy is placeholder. Design 10 §8 asks for it to be resolved before that flow ships. Phase 13 implements the outline, because leaving failures unrendered would break F2 and F23 | this planning pass |
| 11 | the five design 01 open questions (tab-strip tone, border-ramp collapse, hover easing, the positive token, half-pixel type snapping) | design 10 §4 |
| 12 | **The type ramp is `px`-locked** for 15 of its 19 steps — design 01's own values, correctly carried under §6.5A. Browser font-size scaling does not reach those steps. Design 01 §5 names no correction, so nothing was deviated from; the accessibility consequence is recorded rather than silently inherited | phase-01 review round 1 N3 |
| 13 | **Design 01 §5 correction 1 inverts one pair of ink names.** Lightening `#6b6d73 → #84868c` while leaving `#7c7e84` alone makes `--color-fg-quietest` *lighter* than `--color-fg-quiet`. The specification is internally inconsistent on that pair; phase 01 carried it faithfully. Whichever way the phase-01 fix round resolves the naming, the design inconsistency is the design owner's | phase-01 review round 1 S5 |

### 11.3 Follow-up register

| # | Item | Owner | Where it lands |
|---|---|---|---|
| 1 | `architectural_contracts/README.md` "Scaffold decisions record" and "Resolved decisions" rows still read `Component library: none decided`; contract 15 §5 still reads "intentionally undecided" | this project | phase 01 |
| 2 | contract 15 §2, §4 and §6 name `src/styles/tokens.css`, three `src/components/ui/` primitives and a CSS-Modules foundation that no longer exist — **widened 2026-09-06** to include contract 15 §1's `cx()` sentence, contract 15 §3's three-item `globals.css` scope, and contract 12's styling row prescribing `src/styles/tokens.css` (§10.2 caveat 4) | this project | phase 01 |
| 3 | the root `README.md` status paragraph describes the deleted foundation as present | this project | phase 01 |
| 4 | `e2e/bootstrap.spec.ts` asserts a shell the tree does not render | this project | phase 01, replaced in phase 02 |
| 5 | the Vitest include globs do not partition the tree (§10.2 caveat 3) | this project | phase 01 |
| 6 | the root README "Tech stack" table gains Radix and Lucide entries when the first primitive package lands | this project | phase 03 |
| 7 | `src/features/proposal-preparation/README.md` does not exist and must not be written until the feature's behaviour is verified | this project | phase 17 |
| 8 | phases 16 and 17 wait on backend approvals; the coordinator re-checks backend master plan §4 at every phase-15 closeout | coordinator | ongoing |
| 10 | **Two stale statements outside phase 01's perimeter**, found by the phase-01 implementer and refused for that phase because both predate it and neither belongs to conflict C-4: the root `README.md`'s "integrations under `src/lib/**` … neither exists yet" half-claim (`src/lib/` already carries real content), and `architectural_contracts/README.md`'s "No frontend implementation plan exists yet" Known-conflicts row (this master plan and seventeen phase plans exist). Both are current-state falsehoods under contract 14 §1 | this project | the next phase that patches either document, or a dedicated documentation pass |
| 11 | **Design 01 §5 correction 2, the surviving half.** The ask-glyph value is kept out of the readable ink ramp, but the correction's actual requirement is that the `✦` affordance rests at `--color-fg-quiet`, **or** is hover-revealed *and* keyboard-reachable with the global focus ring. Phase 01 has no such affordance to measure | phase 11 | at introduction |
| 12 | **Design 01 §5 correction 3, the surviving half.** The correction asks the primary action to be darkened to ~`#2f6fe0` **or** to carry `#0b0b0c` ink on `#3b82f6`. Phase 01 discharged it by taking the alternative — a composition rule for a control that does not exist yet — so `--color-accent` remains `#3b82f6` and nothing yet measures the ink pairing. The phase that builds the primary/approval action composes `#0b0b0c` ink on `--color-accent`, **never white**, and asserts the computed pair in the browser | phase 12 | at introduction |
| 9 | **Per-animation reduced-motion treatment.** Phase 01's `globals.css` collapses every transition and animation duration to `0.01ms`, which is correct as a floor and is what phase 01 C2(c) measures. Design 01 §5 correction 6 asks for more than a floor on three named animations: the attention **pulse holds at full opacity** (a `0.01ms` pulse settles on its keyframe at `opacity:.25` — dimmed, which is the opposite of held), the **spinner becomes a static ring plus text**, and **`fadeUp` is dropped**. Nothing animates in phase 01, so nothing bites there; the phase that introduces each animation implements its correction and **may not rely on the blanket collapse**. Standing rule 6: the correction wins | phases 04, 06, 12 (whichever introduces each animation) | at introduction |

### 11.4 Live pipeline tables

`plans/` · `prompts/{implementer,reviewer,coordinator,maintenance}/` ·
`handoffs/{implementer,reviewer,coordinator,maintenance}/` · `archive/pre_plan/` ·
`archive/plan_<n>/`
